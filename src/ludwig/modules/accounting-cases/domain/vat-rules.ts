/**
 * VAT-Rules-Service — zentrale Regelquelle für die Vorsteuer-Beurteilung (v1).
 *
 * Fachliche SSOT: docs/reference/input-tax-deduction/rule-catalog.md (Regelcodes
 * VST-…) + docs/topics/buchung.md. Dieses Modul ist die technische
 * Umsetzung der Fakten-Schicht + Verdikt-Rechnung:
 *
 *   Rohdaten (Invoice-Projektion, Mandanten-Profil)
 *     → deriveVatFacts()      benannte Einzelfakten, vierwertig, mit Rationale
 *     → evaluateVatDeduction() je Regel pass/fail/unknown + Modalverdikt
 *
 * Fakten werden aus persistierten Daten ABGELEITET (nicht gespeichert) — die
 * Quelldaten sind persistiert, das Verdikt ist billig und regelversioniert:
 * eine Regeländerung hier wirkt sofort auf den Bestand, ohne Backfill.
 *
 * Reine Funktionen, keine DB — Konsumenten (Submit-Gate, MCP-Read, Beleg-UI)
 * laden die Eingaben selbst und rufen hier hinein.
 *
 * ponytail: v1 wertet nur Regeln aus, deren Fakten heute ableitbar sind
 * (`evaluate` gesetzt). Der Rest des Katalogs ist als Metadaten enthalten
 * (get_vat_rule liefert Hintergrund), Durchsetzung bleibt Playbook/Judge.
 * Agent-Fakten (submit_vat_fact) folgen, wenn ein Blocker sie wirklich braucht.
 */

/** BU-Schlüssel mit Vorsteuer-Wirkung (Eingangsseite). 95/92 fehlen bewusst —
 *  §13b OHNE VSt-Abzug bleibt auch bei geblocktem Abzug erlaubt/geboten. */
export const INPUT_VAT_TAX_KEYS: ReadonlySet<string> = new Set([
  "8",
  "9",
  "91",
  "94",
  "18",
  "19",
]);

/** Nur die Inlands-VSt-Schlüssel — für Regeln, die 13b/igE gerade fordern. */
const DOMESTIC_INPUT_KEYS: readonly string[] = ["8", "9", "18", "19"];
const ALL_INPUT_KEYS: readonly string[] = [...INPUT_VAT_TAX_KEYS];

/** EU-Mitgliedstaaten (ISO 3166-1 alpha-2), Stand 2026 — deckungsgleich mit
 *  buchassi_booking_module.domain.tax_classification.EU_COUNTRIES. */
const EU_COUNTRIES: ReadonlySet<string> = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR",
  "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL",
  "PT", "RO", "SE", "SI", "SK",
]);

// ---------------------------------------------------------------------------
// Fakten
// ---------------------------------------------------------------------------

export type VatFactValue = "yes" | "no" | "unknown" | "uncertain" | "not_applicable";
export type VatFactSource = "derived" | "agent" | "human";

export interface VatFact {
  code: string;
  /** Deutsches UI-Label — die Fakten erscheinen 1:1 im Vorsteuer-Tab. */
  label: string;
  value: VatFactValue;
  source: VatFactSource;
  rationale: string;
  /** Persistierte Spalten (`tabelle.spalte`), aus denen der Fakt abgeleitet
   *  wurde — damit ein `unknown` nachvollziehbar ist, ohne im Code zu suchen. */
  sourceFields: readonly string[];
}

/**
 * Quellspalten je Fakt-Code. Eine Stelle statt Wiederholung an jedem
 * Ableitungs-Zweig: die Felder hängen am Fakt, nicht am Ergebnis.
 * Geladen werden sie von den Aufrufern (`vatDeductionGate`,
 * `getVatAssessment`, `getInvoiceVatAssessment`) — wer hier ein Feld
 * ergänzt, ergänzt es dort im SELECT mit.
 */
const FACT_SOURCE_FIELDS: Record<string, readonly string[]> = {
  client_regular_taxation: ["platform_clients.is_kleinunternehmer"],
  invoice_present: ["client_source_docs_invoices.id", "client_source_docs_contracts.source_doc_id"],
  vat_shown: ["client_source_docs_invoices.tax_total_value"],
  small_amount_invoice: ["client_source_docs_invoices.invoice_total_value"],
  tax_rate_stated: [
    "client_source_docs_invoice_lines.tax_rate_percent",
    "client_source_docs_invoices.tax_total_value",
  ],
  recipient_is_client: [
    "client_source_docs_invoices.recipient_match",
    "client_source_docs_invoices.recipient_match_reason",
  ],
  collection_document: ["client_source_docs.class_document_form"],
  vendor_vat_id_origin: ["client_source_docs_invoices.vendor_ust_id"],
  reverse_charge_case: [
    "client_source_docs_invoices.vendor_ust_id",
    "client_business_partners.country_code",
  ],
  foreign_currency: ["client_source_docs_invoices.currency", "client_source_docs_invoices.fx_currency"],
  reverse_charge_notice: ["client_source_docs_invoices.reverse_charge"],
  receipt_form: ["client_source_docs.class_document_form"],
  issuer_identified: ["client_source_docs_invoices.vendor_name", "client_source_docs_invoices.markdown"],
  service_description: [
    "client_source_docs_invoice_lines.item_name",
    "client_source_docs_invoice_lines.product_description",
  ],
  net_amount_stated: ["client_source_docs_invoices.subtotal_value", "client_source_docs_invoices.tax_total_value"],
  invoice_number_stated: ["client_source_docs_invoices.invoice_number", "client_source_docs_invoices.markdown"],
  issue_date_stated: ["client_source_docs_invoices.invoice_date", "client_source_docs_invoices.markdown"],
  service_date_stated: [
    "client_source_docs_invoices.service_period",
    "client_source_docs_invoice_lines.service_date",
    "client_source_docs_invoices.markdown",
  ],
  issuer_tax_id_stated: [
    "client_source_docs_invoices.vendor_tax_id",
    "client_source_docs_invoices.vendor_ust_id",
    "client_source_docs_invoices.markdown",
  ],
};

/** Eingaben — alles bereits persistierte Daten, vom Aufrufer geladen. */
export interface VatAssessmentInput {
  client: {
    /** platform_clients.is_kleinunternehmer (null = Profil unvollständig). */
    isKleinunternehmer: boolean | null;
  };
  event: {
    /** Ereignis hat eine Beleg-Quelle (client_source_docs). */
    hasSourceDoc: boolean;
    /** Beleg ist ein Vertrag mit booking_facts (Dauersachverhalt, VST-DOC-5). */
    hasContract: boolean;
  };
  /** Invoice-Projektion des Belegs, null wenn keine (Bank-only, Vertrag …). */
  invoice: {
    invoiceTotal: number | null;
    taxTotal: number | null;
    currency: string | null;
    fxCurrency: string | null;
    vendorUstId: string | null;
    /** client_source_docs_invoices.reverse_charge (Extraktions-Hinweis). */
    reverseCharge: string | null;
    /**
     * `client_business_partners.country_code` des am Beleg verknüpften
     * Partners — zweites Sitzland-Signal für den § 13b-Sachverhalt (F152),
     * wenn der Beleg keine USt-IdNr. trägt.
     */
    partnerCountryCode: string | null;
    documentForm: string | null;
    /** match | mismatch | uncertain | not_applicable | null (BL-17). */
    recipientMatch: string | null;
    recipientMatchReason: string | null;
    /** tax_rate_percent der aktiven Rechnungspositionen (non-null Werte). */
    lineTaxRates: number[];
    // — Pflichtangaben § 14 Abs. 4 UStG (VST-DOC-2) ————————————————
    vendorName: string | null;
    /** vendor_tax_id ODER vendor_ust_id — § 14 IV Nr. 2 verlangt eines von beiden. */
    vendorTaxId: string | null;
    invoiceNumber: string | null;
    invoiceDate: string | null;
    /** service_period am Kopf; Positions-Leistungsdaten kommen separat. */
    servicePeriod: string | null;
    /** subtotal_value — das Entgelt (§ 14 IV Nr. 7). */
    netTotal: number | null;
    /** Leistungsbeschreibungen der aktiven Positionen (item_name/description). */
    lineDescriptions: string[];
    /** Mindestens eine aktive Position trägt ein service_date. */
    hasLineServiceDate: boolean;
    /**
     * OCR-Volltext des Belegs. Ein leeres Extraktionsfeld ist noch kein
     * formaler Mangel — steht die Angabe im Text, ist es eine Extraktionslücke.
     */
    markdown: string | null;
  } | null;
}

const SMALL_AMOUNT_LIMIT_EUR = 250;
const COLLECTION_FORMS = new Set(["document_collection", "expense_report"]);

/**
 * Bon-Formen. § 14 Abs. 4 auf einen Kassenbon anzuwenden geht fachlich daneben:
 * er ist der Regelfall des § 33 UStDV, und ein Bon über 250 € ist häufiger ein
 * Extraktionsartefakt (Tagessumme, falsch gelesener Betrag) als eine formal
 * mangelhafte Rechnung. VST-DOC-2 bleibt hier auf `unknown` — sichtbar, aber
 * nicht blockend.
 */
const RECEIPT_FORMS = new Set(["fuel_receipt", "hospitality_receipt", "cash_receipt"]);

/**
 * Gegenprobe für ein leeres Extraktionsfeld: taucht die Angabe im OCR-Volltext
 * auf, liegt eine Extraktionslücke vor, kein formaler Mangel. Bewusst grob —
 * sie darf nur einen `fail` zu `unknown` entschärfen, nie umgekehrt.
 */
function mentionedIn(markdown: string | null, patterns: readonly RegExp[]): boolean {
  if (!markdown) return false;
  return patterns.some((re) => re.test(markdown));
}

function vatIdPrefix(ustId: string | null): string | null {
  if (!ustId) return null;
  const cleaned = ustId.replace(/\s/g, "").toUpperCase();
  const m = /^([A-Z]{2})/.exec(cleaned);
  return m ? m[1]! : null;
}

// ---------------------------------------------------------------------------
// § 13b-Sachverhalt („Sachverhalt L+L", F152)
// ---------------------------------------------------------------------------

/** BU-Schlüssel, für die DATEV zwingend einen Sachverhalts-Code verlangt. */
export const REVERSE_CHARGE_CASE_TAX_KEYS: ReadonlySet<string> = new Set(["91", "92", "94", "95"]);

/**
 * DATEV-Sachverhalte L+L, soweit Ludwig sie führt. Die vollständige Liste
 * (1–13, 16) steht in der DATEV-Feldbeschreibung „Sachverhalt L+L"; hier stehen
 * nur die Codes, die Ludwig entweder selbst ableitet (1/7) oder in einer Meldung
 * benennt (4). Die Inlandsfälle (Bauleistung u. a.) sind bewusst NICHT
 * hinterlegt — sie sind aus den Belegdaten nicht ableitbar, siehe
 * `docs/topics/datev-offen.md`.
 */
export const REVERSE_CHARGE_CASES: ReadonlyMap<number, string> = new Map([
  [1, "Werklieferung / sonstige Leistung eines im Ausland (Drittland) ansässigen Unternehmers (§ 13b Abs. 2 Nr. 1)"],
  [4, "Bauleistung (§ 13b Abs. 2 Nr. 4)"],
  [7, "Sonstige Leistung eines im übrigen Gemeinschaftsgebiet ansässigen Unternehmers (§ 13b Abs. 1)"],
]);

export interface ReverseChargeOrigin {
  /** client_source_docs_invoices.vendor_ust_id — das stärkere Signal. */
  vendorUstId: string | null;
  /** client_business_partners.country_code des verknüpften Partners. */
  partnerCountryCode: string | null;
}

export interface ReverseChargeCaseResult {
  /** DATEV-Sachverhalt L+L; `null`, wenn nicht ableitbar. */
  code: number | null;
  /** Warum — wörtlich verwendbar in Fakt-Rationale und Submit-Fehler. */
  rationale: string;
  /** `domestic`: Aussteller sitzt im Inland (Bauleistung u. a., nicht abgeleitet).
   *  `unknown`: kein Sitzland-Signal. Beide führen zu `code = null`. */
  gap: "domestic" | "unknown" | null;
}

/**
 * Sitzland des Ausstellers → DATEV-Sachverhalt L+L. Entschieden wird über den
 * SITZ, nicht über den Steuerschlüssel: 94 deckt EU-Leistung und Drittland
 * gleichermaßen ab, DATEV unterscheidet sie erst über diesen Code (REW02191).
 *
 * Reihenfolge: USt-IdNr. am Beleg schlägt das Land am Geschäftspartner (die
 * IdNr. steht auf DEM Beleg, das Partner-Land ist Stammdatum). Die
 * OSS-Sondernummer `EU…` ist kein Sitzland-Signal (§ 18i UStG) — sie fällt auf
 * das Partner-Land zurück; §13b entsteht in dem Fall ohnehin nicht (VST-XB-5).
 */
export function deriveReverseChargeCase(origin: ReverseChargeOrigin): ReverseChargeCaseResult {
  const prefix = vatIdPrefix(origin.vendorUstId);
  if (prefix && prefix !== "EU") {
    if (prefix === "DE") {
      return {
        code: null,
        gap: "domestic",
        rationale: `Deutsche USt-IdNr. (${origin.vendorUstId}) — Aussteller sitzt im Inland`,
      };
    }
    return EU_COUNTRIES.has(prefix)
      ? {
          code: 7,
          gap: null,
          rationale: `Sachverhalt 7 — sonstige Leistung eines EU-Unternehmers (USt-IdNr. ${origin.vendorUstId})`,
        }
      : {
          code: 1,
          gap: null,
          rationale: `Sachverhalt 1 — Drittland (USt-IdNr./Kennung ${origin.vendorUstId})`,
        };
  }

  const country = origin.partnerCountryCode?.trim().toUpperCase();
  if (country && country.length === 2) {
    if (country === "DE") {
      return {
        code: null,
        gap: "domestic",
        rationale: "Land am Geschäftspartner: DE — Aussteller sitzt im Inland",
      };
    }
    return EU_COUNTRIES.has(country)
      ? {
          code: 7,
          gap: null,
          rationale: `Sachverhalt 7 — sonstige Leistung eines EU-Unternehmers (Land am Geschäftspartner: ${country})`,
        }
      : {
          code: 1,
          gap: null,
          rationale: `Sachverhalt 1 — Drittland (Land am Geschäftspartner: ${country})`,
        };
  }

  return {
    code: null,
    gap: "unknown",
    rationale: "Nicht ableitbar: keine USt-IdNr. am Beleg, kein Land am Geschäftspartner",
  };
}

function fact(
  code: string,
  label: string,
  value: VatFactValue,
  rationale: string,
): VatFact {
  return { code, label, value, source: "derived", rationale, sourceFields: FACT_SOURCE_FIELDS[code] ?? [] };
}

/** Fakten-Schicht: Einzelinformationen aus persistierten Daten ableiten. */
export function deriveVatFacts(input: VatAssessmentInput): VatFact[] {
  const out: VatFact[] = [];
  const inv = input.invoice;

  // Mandanten-Ebene
  out.push(
    input.client.isKleinunternehmer == null
      ? fact("client_regular_taxation", "Mandant Regelbesteuerer", "unknown", "is_kleinunternehmer im Mandanten-Profil nicht gesetzt")
      : input.client.isKleinunternehmer
        ? fact("client_regular_taxation", "Mandant Regelbesteuerer", "no", "Mandant ist Kleinunternehmer (§ 19 UStG) — kein Vorsteuerabzug")
        : fact("client_regular_taxation", "Mandant Regelbesteuerer", "yes", "Mandanten-Profil: Regelbesteuerung"),
  );

  // Belegquelle
  out.push(
    inv != null
      ? fact("invoice_present", "Rechnung liegt vor", "yes", "Beleg mit Invoice-Extraktion am Ereignis")
      : input.event.hasContract
        ? fact("invoice_present", "Rechnung liegt vor", "not_applicable", "Vertrag mit booking_facts als Dauerrechnung (VST-DOC-5)")
        : input.event.hasSourceDoc
          ? fact("invoice_present", "Rechnung liegt vor", "uncertain", "Beleg vorhanden, aber ohne Invoice-Extraktion (kein Rechnungs-Subtyp)")
          : fact("invoice_present", "Rechnung liegt vor", "no", "Kein Beleg am Ereignis — nur Bank-/Fremdsignal"),
  );

  if (inv == null) return out;

  // Beträge / Ausweis
  out.push(
    inv.taxTotal == null
      ? fact("vat_shown", "USt ausgewiesen", "unknown", "Kein Steuerbetrag extrahiert")
      : inv.taxTotal > 0
        ? fact("vat_shown", "USt ausgewiesen", "yes", `Ausgewiesene Steuer ${inv.taxTotal.toFixed(2)}`)
        : fact("vat_shown", "USt ausgewiesen", "no", "Steuerbetrag 0 — keine USt auf dem Beleg"),
  );
  out.push(
    inv.invoiceTotal == null
      ? fact("small_amount_invoice", "Kleinbetragsrechnung ≤ 250 €", "unknown", "Kein Bruttobetrag extrahiert")
      : inv.invoiceTotal <= SMALL_AMOUNT_LIMIT_EUR
        ? fact("small_amount_invoice", "Kleinbetragsrechnung ≤ 250 €", "yes", `Brutto ${inv.invoiceTotal.toFixed(2)} € ≤ 250 € (§ 33 UStDV)`)
        : fact("small_amount_invoice", "Kleinbetragsrechnung ≤ 250 €", "no", `Brutto ${inv.invoiceTotal.toFixed(2)} € > 250 €`),
  );
  out.push(
    inv.lineTaxRates.length > 0
      ? fact("tax_rate_stated", "Steuersatz angegeben", "yes", `Positions-Steuersätze: ${[...new Set(inv.lineTaxRates)].join("/")} %`)
      : inv.taxTotal != null && inv.taxTotal > 0
        ? fact("tax_rate_stated", "Steuersatz angegeben", "yes", "Steuerbetrag ausgewiesen — Satz aus Brutto/Netto ableitbar")
        : fact("tax_rate_stated", "Steuersatz angegeben", "unknown", "Weder Positions-Steuersatz noch Steuerbetrag extrahiert"),
  );

  // Empfänger (BL-17) — Vierwert-Schema kommt direkt aus recipient_match.
  const rm = inv.recipientMatch;
  const rmReason = inv.recipientMatchReason ?? "";
  out.push(
    rm === "match"
      ? fact("recipient_is_client", "Rechnungsempfänger = Mandant", "yes", rmReason || "recipient_match: match")
      : rm === "mismatch"
        ? fact("recipient_is_client", "Rechnungsempfänger = Mandant", "no", rmReason || "recipient_match: mismatch — Empfänger ist ein Dritter")
        : rm === "uncertain"
          ? fact("recipient_is_client", "Rechnungsempfänger = Mandant", "uncertain", rmReason || "recipient_match: uncertain — Abgleich nicht eindeutig")
          : rm === "not_applicable"
            ? fact("recipient_is_client", "Rechnungsempfänger = Mandant", "not_applicable", rmReason || "Kein Empfänger nötig (Kleinbetrag § 33 UStDV / Ausgangsrechnung)")
            : fact("recipient_is_client", "Rechnungsempfänger = Mandant", "unknown", "Empfänger-Check nicht gelaufen (recipient_match leer)"),
  );

  // Sammelbeleg
  out.push(
    inv.documentForm == null
      ? fact("collection_document", "Sammelbeleg / Spesenabrechnung", "unknown", "Belegform nicht klassifiziert")
      : COLLECTION_FORMS.has(inv.documentForm)
        ? fact("collection_document", "Sammelbeleg / Spesenabrechnung", "yes", `Belegform ${inv.documentForm} — Summe mehrerer Einzelrechnungen`)
        : fact("collection_document", "Sammelbeleg / Spesenabrechnung", "no", `Belegform ${inv.documentForm}`),
  );

  // Bon-Form (VST-DOC-2 Gate) — eigener Fakt neben `collection_document`,
  // weil er das Gegenteil aussagt: nicht „Summe mehrerer Rechnungen", sondern
  // „Einzelbeleg im Kassenformat".
  out.push(
    inv.documentForm == null
      ? fact("receipt_form", "Kassenbeleg / Bon", "unknown", "Belegform nicht klassifiziert")
      : RECEIPT_FORMS.has(inv.documentForm)
        ? fact("receipt_form", "Kassenbeleg / Bon", "yes", `Belegform ${inv.documentForm} — Kassenformat, § 33 UStDV ist der Regelfall`)
        : fact("receipt_form", "Kassenbeleg / Bon", "no", `Belegform ${inv.documentForm}`),
  );

  // Aussteller-USt-IdNr.
  const prefix = vatIdPrefix(inv.vendorUstId);
  out.push(
    prefix == null
      ? fact("vendor_vat_id_origin", "USt-IdNr. des Ausstellers", "unknown", "Keine USt-IdNr. extrahiert")
      : prefix === "DE"
        ? fact("vendor_vat_id_origin", "USt-IdNr. des Ausstellers", "yes", `Deutsche USt-IdNr. (${inv.vendorUstId}) — Inlandsfall, kein § 13b (VST-XB-4)`)
        : prefix === "EU"
          ? fact("vendor_vat_id_origin", "USt-IdNr. des Ausstellers", "no", `OSS-Sondernummer ${inv.vendorUstId} (§ 18i UStG) — nie deutscher Vorsteuerabzug (VST-XB-5)`)
          : EU_COUNTRIES.has(prefix)
            ? fact("vendor_vat_id_origin", "USt-IdNr. des Ausstellers", "no", `EU-ausländische USt-IdNr. (${prefix}) — § 13b/igE-Fall (VST-XB-1/2)`)
            : fact("vendor_vat_id_origin", "USt-IdNr. des Ausstellers", "no", `Nicht-EU-Kennung (${prefix})`),
  );

  // § 13b-Sachverhalt für DATEV (F152) — der Code, den DATEV neben BU 91/92/94/95
  // verlangt (REW02191). Steht hier, damit die Kanzlei VOR dem Buchen sieht,
  // welches Signal ihn entscheidet; der Submit-Kern rechnet mit derselben
  // Funktion und schreibt das Ergebnis an die Zeile.
  {
    const rcCase = deriveReverseChargeCase({
      vendorUstId: inv.vendorUstId,
      partnerCountryCode: inv.partnerCountryCode,
    });
    out.push(
      fact(
        "reverse_charge_case",
        "§ 13b-Sachverhalt für DATEV",
        rcCase.code != null ? "yes" : rcCase.gap === "domestic" ? "not_applicable" : "unknown",
        rcCase.gap === "domestic"
          ? `${rcCase.rationale} — ein Inlands-§ 13b-Fall (z. B. Bauleistung, Sachverhalt 4) wird nicht abgeleitet`
          : rcCase.rationale,
      ),
    );
  }

  // Währung
  const fw =
    (inv.currency != null && inv.currency.toUpperCase() !== "EUR") ||
    (inv.fxCurrency != null && inv.fxCurrency.toUpperCase() !== "EUR");
  out.push(
    inv.currency == null && inv.fxCurrency == null
      ? fact("foreign_currency", "Fremdwährungsrechnung", "unknown", "Keine Währung extrahiert")
      : fw
        ? fact("foreign_currency", "Fremdwährungsrechnung", "yes", `Währung ${inv.fxCurrency ?? inv.currency} — keine abziehbare deutsche VSt (VST-XB-6)`)
        : fact("foreign_currency", "Fremdwährungsrechnung", "no", "EUR-Rechnung"),
  );

  // Reverse-Charge-Hinweis
  const rc = (inv.reverseCharge ?? "").trim().toLowerCase();
  out.push(
    rc && rc !== "false" && rc !== "no" && rc !== "none"
      ? fact("reverse_charge_notice", "Reverse-Charge-Hinweis am Beleg", "yes", `Extraktion: reverse_charge=${inv.reverseCharge}`)
      : fact("reverse_charge_notice", "Reverse-Charge-Hinweis am Beleg", "no", "Kein Hinweis extrahiert"),
  );

  // — Pflichtangaben § 14 Abs. 4 UStG (VST-DOC-2) ————————————————————
  // Jede Angabe dreiwertig: `yes` extrahiert · `uncertain` im Volltext, aber
  // nicht extrahiert (Extraktionslücke) · `no` nirgends auffindbar. Erst die
  // Regel entscheidet, was daraus folgt — Kernangabe oder Nebenangabe.
  const present = (
    code: string,
    label: string,
    value: string | number | null,
    found: string,
    patterns: readonly RegExp[],
  ): VatFact => {
    const filled = typeof value === "string" ? value.trim().length > 0 : value != null;
    if (filled) return fact(code, label, "yes", found);
    if (mentionedIn(inv.markdown, patterns))
      return fact(code, label, "uncertain", "Nicht extrahiert, aber im Belegtext erkennbar — Extraktionslücke, kein formaler Mangel");
    return fact(code, label, "no", "Weder extrahiert noch im Belegtext auffindbar");
  };

  out.push(
    present("issuer_identified", "Aussteller genannt", inv.vendorName, `Aussteller: ${inv.vendorName}`, [
      /\b(rechnungssteller|leistende[rn]?\s+unternehmer|absender)\b/i,
    ]),
  );
  const desc = inv.lineDescriptions.filter((d) => d.trim().length > 0);
  out.push(
    desc.length > 0
      ? fact("service_description", "Leistung beschrieben", "yes", `${desc.length} Position(en) mit Bezeichnung`)
      : fact("service_description", "Leistung beschrieben", "no", "Keine aktive Position mit Bezeichnung — Art der Leistung nicht erkennbar"),
  );
  out.push(
    inv.netTotal != null
      ? fact("net_amount_stated", "Entgelt ausgewiesen", "yes", `Netto ${inv.netTotal.toFixed(2)}`)
      : inv.invoiceTotal != null && inv.taxTotal != null
        ? fact("net_amount_stated", "Entgelt ausgewiesen", "yes", "Netto aus Brutto minus Steuer ableitbar")
        : mentionedIn(inv.markdown, [/\b(netto|entgelt|zwischensumme|subtotal)\b/i])
          ? fact("net_amount_stated", "Entgelt ausgewiesen", "uncertain", "Nicht extrahiert, aber im Belegtext erkennbar — Extraktionslücke")
          : fact("net_amount_stated", "Entgelt ausgewiesen", "no", "Kein Nettobetrag und keine Ableitung aus Brutto/Steuer"),
  );
  out.push(
    present("invoice_number_stated", "Rechnungsnummer", inv.invoiceNumber, `Nr. ${inv.invoiceNumber}`, [
      /\b(rechnungs-?\s?(nr|nummer)|invoice\s*(no|number)|beleg-?nr)\b/i,
    ]),
  );
  out.push(
    present("issue_date_stated", "Ausstellungsdatum", inv.invoiceDate, `Ausgestellt ${inv.invoiceDate}`, [
      /\b(rechnungsdatum|ausstellungsdatum|invoice\s*date|datum)\b/i,
    ]),
  );
  out.push(
    inv.hasLineServiceDate
      ? fact("service_date_stated", "Leistungszeitpunkt", "yes", "Positionen tragen ein Leistungsdatum")
      : present("service_date_stated", "Leistungszeitpunkt", inv.servicePeriod, `Leistungszeitraum ${inv.servicePeriod}`, [
          /\b(leistungs(datum|zeitpunkt|zeitraum)|liefer(datum|zeitpunkt)|service\s*period)\b/i,
        ]),
  );
  out.push(
    present(
      "issuer_tax_id_stated",
      "StNr. / USt-IdNr. des Ausstellers",
      inv.vendorTaxId ?? inv.vendorUstId,
      `Kennung ${inv.vendorTaxId ?? inv.vendorUstId}`,
      [/\b(ust-?\s?id|umsatzsteuer-?identifikations|steuer-?\s?nr|st-?nr|vat\s*(id|no))\b/i],
    ),
  );

  return out;
}

// ---------------------------------------------------------------------------
// Regeln
// ---------------------------------------------------------------------------

export type VatRuleOutcome = "pass" | "fail" | "unknown";

export interface VatRuleResult {
  code: string;
  title: string;
  applies: boolean;
  result: VatRuleOutcome;
  reason: string;
  /** Bei fail: BU-Schlüssel, deren Nutzung diese Regel verbietet. */
  blockedTaxKeys: readonly string[];
}

interface VatRuleDefinition {
  code: string;
  title: string;
  statutes: string[];
  /** 1–3 Sätze Hintergrund + harte Regel; Details stehen im Katalog/Playbook. */
  guidance: string;
  /** Nur gesetzt für maschinell auswertbare Regeln (v1-Gate). */
  evaluate?: (facts: Map<string, VatFact>, input: VatAssessmentInput) => Omit<VatRuleResult, "code" | "title">;
}

const notApplicable = (reason: string): Omit<VatRuleResult, "code" | "title"> => ({
  applies: false,
  result: "pass",
  reason,
  blockedTaxKeys: [],
});

/**
 * Registry — Codes und Inhalte aus docs/knowledge/input-tax-deduction/
 * rule-catalog.md. Regeln OHNE evaluate sind Playbook-/Judge-Sache; sie sind
 * hier gelistet, damit get_vat_rule den ganzen Katalog beantworten kann.
 */
export const VAT_RULES: readonly VatRuleDefinition[] = [
  {
    code: "VST-CL-1",
    title: "Regelbesteuerung des Mandanten",
    statutes: ["§ 15 Abs. 1 UStG", "§ 19 Abs. 1 UStG"],
    guidance:
      "Kleinunternehmer ziehen nie Vorsteuer (seit 2025 echte Steuerbefreiung; Grenzen 25.000 €/100.000 €, " +
      "unterjähriger Kipp möglich). Bei Nein: brutto buchen, taxKey null.",
    evaluate: (facts) => {
      const f = facts.get("client_regular_taxation")!;
      if (f.value === "no")
        return { applies: true, result: "fail", reason: f.rationale, blockedTaxKeys: ALL_INPUT_KEYS };
      if (f.value === "unknown")
        return { applies: true, result: "unknown", reason: f.rationale, blockedTaxKeys: [] };
      return { applies: true, result: "pass", reason: f.rationale, blockedTaxKeys: [] };
    },
  },
  {
    code: "VST-CL-2",
    title: "Steuerfreie Ausgangsumsätze: Ausschluss/Aufteilung",
    statutes: ["§ 15 Abs. 2–4 UStG"],
    guidance:
      "Verwendung für steuerfreie Ausgangsumsätze ohne Option schließt den Abzug aus; Mischfälle sind " +
      "aufzuteilen — der Schlüssel ist Kanzleientscheidung (raise_clarification, nie schätzen).",
  },
  {
    code: "VST-USE-1",
    title: "Leistung für das Unternehmen (10 %-Grenze)",
    statutes: ["§ 15 Abs. 1 S. 1 Nr. 1, S. 2 UStG"],
    guidance:
      "Betriebliche Veranlassung nötig; Gegenstände unter 10 % unternehmerischer Nutzung gelten nicht als " +
      "für das Unternehmen bezogen. Erkennbar privater/gemischter Anlass → klären statt buchen.",
  },
  {
    code: "VST-USE-2",
    title: "Rechnungsempfänger = Mandant",
    statutes: ["§ 15 Abs. 1 Nr. 1 UStG", "§ 14 Abs. 4 Nr. 1 UStG"],
    guidance:
      "Die Rechnung muss auf den Mandanten lauten. mismatch/uncertain = Veto (B3.10): keine VSt, brutto auf " +
      "Aufwand + raise_clarification. Kleinbetrag ≤ 250 € braucht keinen Empfänger.",
    evaluate: (facts) => {
      const inv = facts.get("invoice_present");
      if (inv?.value !== "yes") return notApplicable("Keine Rechnung am Ereignis — Empfänger-Regel greift dort nicht");
      if (facts.get("small_amount_invoice")?.value === "yes")
        return notApplicable("Kleinbetragsrechnung — kein Empfänger erforderlich (§ 33 UStDV)");
      const f = facts.get("recipient_is_client")!;
      if (f.value === "no" || f.value === "uncertain")
        return { applies: true, result: "fail", reason: f.rationale, blockedTaxKeys: ALL_INPUT_KEYS };
      if (f.value === "unknown")
        return { applies: true, result: "unknown", reason: f.rationale, blockedTaxKeys: [] };
      return { applies: true, result: "pass", reason: f.rationale, blockedTaxKeys: [] };
    },
  },
  {
    code: "VST-USE-3",
    title: "Sammelbeleg / Spesenabrechnung: keine VSt aus der Summe",
    statutes: ["§ 15 Abs. 1 Nr. 1 UStG (je Einzelrechnung)"],
    guidance:
      "Aus einer Deck-/Summenseite darf keine VSt gezogen werden — PDF zerlegen und einzeln einspeisen, " +
      "oder brutto auf Aufwand + raise_clarification (Auslöser 2026-0082).",
    evaluate: (facts) => {
      const inv = facts.get("invoice_present");
      if (inv?.value !== "yes") return notApplicable("Keine Rechnung am Ereignis");
      const f = facts.get("collection_document")!;
      if (f.value === "yes")
        return { applies: true, result: "fail", reason: f.rationale, blockedTaxKeys: ALL_INPUT_KEYS };
      return { applies: true, result: f.value === "unknown" ? "unknown" : "pass", reason: f.rationale, blockedTaxKeys: [] };
    },
  },
  {
    code: "VST-DOC-1",
    title: "Rechnung liegt vor",
    statutes: ["§ 15 Abs. 1 Nr. 1 S. 2 UStG"],
    guidance:
      "Ohne Rechnung keine VSt — auch nicht aus dem Kontoauszug hochgerechnet. Vertrag mit USt-Ausweis " +
      "(booking_facts) zählt als Dauerrechnung. Sonst: nur Zahlung buchen, Beleg nachfordern.",
    evaluate: (facts) => {
      const f = facts.get("invoice_present")!;
      if (f.value === "yes" || f.value === "not_applicable")
        return { applies: true, result: "pass", reason: f.rationale, blockedTaxKeys: [] };
      if (f.value === "no")
        return { applies: true, result: "fail", reason: f.rationale, blockedTaxKeys: ALL_INPUT_KEYS };
      // uncertain: Beleg ohne Invoice-Extraktion — nicht hart blocken, sichtbar machen.
      return { applies: true, result: "unknown", reason: f.rationale, blockedTaxKeys: [] };
    },
  },
  {
    code: "VST-DOC-2",
    title: "Pflichtangaben § 14 Abs. 4 (Rechnung > 250 €)",
    statutes: ["§ 14 Abs. 4 UStG", "§ 14a UStG", "§ 31 Abs. 5 UStDV"],
    guidance:
      "Alle Pflichtangaben (Empfänger, StNr./USt-IdNr., Rechnungsnummer, Leistungszeitpunkt, Entgelt nach " +
      "Sätzen, Steuersatz+Betrag) müssen vorhanden und widerspruchsfrei sein — bei Mangel keine VSt, " +
      "berichtigte Rechnung anfordern.",
    /**
     * Die Prüfung trennt zwei Klassen, weil § 31 Abs. 5 UStDV sie trennt: eine
     * fehlende **Kernangabe** (Aussteller · Leistungsbeschreibung · Entgelt)
     * macht das Dokument rückwirkend nicht berichtigungsfähig — das ist ein
     * `fail`. Eine fehlende **Nebenangabe** ist heilbar; sie wird sichtbar
     * gemacht (`unknown`), aber nicht geblockt. Die Klärungsfrage stellt der
     * Buchungs-Agent, nie die Regel.
     *
     * Drei Grenzen, an denen die Prüfung bewusst nicht greift:
     *   - **Nur der Inlandsfall.** Geblockt wird ausschließlich bei
     *     nachgewiesen deutscher USt-IdNr. Ein Beleg von AWS, Adobe oder
     *     Google Ireland läuft nach § 13b/OSS und darf hier nie hängen
     *     bleiben — dafür sind die VST-XB-Regeln zuständig.
     *   - **Bons bleiben draußen**, auch über 250 €: siehe RECEIPT_FORMS.
     *   - **Leeres Feld ≠ Mangel.** Ein Fakt auf `uncertain` heißt „steht im
     *     Belegtext, wurde nur nicht extrahiert" — Extraktionslücke, nicht
     *     Rechnungsmangel. Er entschärft zu `unknown`.
     */
    evaluate: (facts) => {
      const inv = facts.get("invoice_present");
      if (inv?.value !== "yes") return notApplicable("Keine Rechnung am Ereignis");

      // Kleinbeträge regelt § 33 UStDV — das ist VST-DOC-3, nicht diese Regel.
      const small = facts.get("small_amount_invoice");
      if (small?.value === "yes")
        return notApplicable("Kleinbetragsrechnung ≤ 250 € — Pflichtangaben nach § 33 UStDV (VST-DOC-3)");
      if (small?.value === "unknown")
        return {
          applies: true,
          result: "unknown",
          reason: "Kein Bruttobetrag extrahiert — ob § 14 Abs. 4 oder § 33 UStDV gilt, ist offen",
          blockedTaxKeys: [],
        };

      // Bon über 250 €: fachlich der § 33-Regelfall, praktisch meist ein
      // Extraktionsartefakt. Sichtbar machen, nicht blocken.
      if (facts.get("receipt_form")?.value === "yes")
        return {
          applies: true,
          result: "unknown",
          reason: "Kassenbeleg über 250 € — § 14 Abs. 4 wird hier nicht durchgesetzt (Betrag am Beleg prüfen)",
          blockedTaxKeys: [],
        };

      const kern = ["issuer_identified", "service_description", "net_amount_stated"] as const;
      // Nebenangaben mit Volltext-Gegenprobe: `uncertain` heißt hier „steht auf
      // dem Beleg, nur nicht im Extraktionsfeld". § 14 Abs. 4 verlangt die
      // Angabe auf der RECHNUNG, nicht in unserer Extraktion — sie gilt damit
      // als erfüllt. Beim Kern bleibt die Bewertung vorsichtiger (siehe unten):
      // die Gegenprobe erkennt das Stichwort, nicht den Wert dahinter.
      const neben = [
        "invoice_number_stated",
        "issue_date_stated",
        "service_date_stated",
        "issuer_tax_id_stated",
      ] as const;

      const label = (code: string) => facts.get(code)?.label ?? code;
      const missingKern = kern.filter((c) => facts.get(c)?.value === "no");
      const unsureKern = kern.filter((c) => facts.get(c)?.value === "uncertain");
      const missingNeben: string[] = neben.filter((c) => {
        const v = facts.get(c)?.value;
        return v === "no" || v === "unknown";
      });
      // Der Empfänger (§ 14 IV Nr. 1) hat eine eigene Vierwert-Semantik aus
      // `recipient_match`: `uncertain` heißt dort „Abgleich nicht eindeutig",
      // also echt offen — nicht „steht im Text".
      const rmv = facts.get("recipient_is_client")?.value;
      if (rmv !== "yes" && rmv !== "not_applicable") missingNeben.push("recipient_is_client");

      if (missingKern.length > 0) {
        // Inlandsschranke: blocken nur, wo der deutsche VSt-Abzug überhaupt in
        // Frage steht. Sonst sichtbar machen und weiterlaufen lassen.
        const domestic = facts.get("vendor_vat_id_origin")?.value === "yes";
        const fehlt = missingKern.map(label).join(", ");
        if (!domestic)
          return {
            applies: true,
            result: "unknown",
            reason: `Kernangabe fehlt (${fehlt}) — ohne nachgewiesen deutsche USt-IdNr. wird nicht geblockt, der Fall läuft über die VST-XB-Regeln`,
            blockedTaxKeys: [],
          };
        return {
          applies: true,
          result: "fail",
          reason: `Kernangabe nach § 31 Abs. 5 UStDV fehlt (${fehlt}) — nicht rückwirkend berichtigungsfähig, berichtigte Rechnung anfordern`,
          blockedTaxKeys: DOMESTIC_INPUT_KEYS,
        };
      }

      if (unsureKern.length > 0)
        return {
          applies: true,
          result: "unknown",
          reason: `Kernangabe nicht extrahiert, aber im Belegtext erkennbar (${unsureKern.map(label).join(", ")}) — Extraktionslücke, am Beleg prüfen`,
          blockedTaxKeys: [],
        };

      if (missingNeben.length > 0)
        return {
          applies: true,
          result: "unknown",
          reason: `Nebenangabe offen (${missingNeben.map(label).join(", ")}) — nach § 31 Abs. 5 UStDV rückwirkend heilbar, kein Blocker`,
          blockedTaxKeys: [],
        };

      return {
        applies: true,
        result: "pass",
        reason: "Alle Pflichtangaben nach § 14 Abs. 4 UStG vorhanden",
        blockedTaxKeys: [],
      };
    },
  },
  {
    code: "VST-DOC-3",
    title: "Kleinbetragsrechnung ≤ 250 € (§ 33 UStDV)",
    statutes: ["§ 33 UStDV", "§ 35 UStDV"],
    guidance:
      "Fünf Angaben genügen (kein Empfänger nötig); VSt aus dem Brutto herausrechnen (÷119×19 bzw. ÷107×7). " +
      "OHNE angegebenen Steuersatz kein Abzug. Gilt nicht für § 13b/igE.",
    evaluate: (facts) => {
      const f = facts.get("small_amount_invoice");
      if (f?.value !== "yes") return notApplicable("Keine Kleinbetragsrechnung (> 250 € oder kein Beleg)");
      const rate = facts.get("tax_rate_stated")!;
      if (rate.value === "unknown")
        return {
          applies: true,
          result: "fail",
          reason: `Kleinbetrag ohne erkennbaren Steuersatz — § 35 UStDV erlaubt den Abzug nur mit angegebenem Satz (${rate.rationale})`,
          blockedTaxKeys: ALL_INPUT_KEYS,
        };
      return { applies: true, result: "pass", reason: `Kleinbetrag mit Steuersatz — VSt herausrechnen (${rate.rationale})`, blockedTaxKeys: [] };
    },
  },
  {
    code: "VST-DOC-4",
    title: "Fahrausweise",
    statutes: ["§ 34 UStDV", "§ 35 UStDV"],
    guidance:
      "Fahrausweise gelten als Rechnung mit reduzierten Angaben; VSt mit dem enthaltenen Satz herausrechnen " +
      "(Bahn/ÖPNV 7 %). Grenzüberschreitende Flüge steuerfrei — keine VSt.",
  },
  {
    code: "VST-DOC-5",
    title: "Dauersachverhalt (Vertrag als Dauerrechnung)",
    statutes: ["UStAE 14.1 Abs. 2"],
    guidance:
      "Vertrag mit offenem USt-Ausweis (Miete mit Option, Leasing) + Zahlungsbeleg zählt als Rechnung — " +
      "booking_facts des Vertrags sind die Belegdeckung der monatlichen VSt.",
  },
  {
    code: "VST-DOC-6",
    title: "E-Rechnung (Format als künftige Abzugsvoraussetzung)",
    statutes: ["§ 14 UStG n. F.", "BMF 15.10.2024/15.10.2025"],
    guidance:
      "In der Übergangszeit gilt eine sonstige Rechnung weiter als ordnungsgemäß — Formatverstöße bis Ende " +
      "2027 nicht beanstanden, Inhalte schon. Ab 2028 trägt nur eine EN-16931-konforme E-Rechnung den Abzug.",
  },
  {
    code: "VST-DUE-1",
    title: "Nur gesetzlich geschuldete Steuer abziehbar (§ 14c)",
    statutes: ["§ 15 Abs. 1 Nr. 1 UStG", "§ 14c UStG"],
    guidance:
      "Zu hoch ausgewiesene Steuer: nur der gesetzliche Anteil abziehbar. Unberechtigt ausgewiesene Steuer " +
      "(Kleinunternehmer-/§ 25a-/§ 25-Aussteller): gar nichts — auch wenn sie auf dem Beleg steht.",
  },
  {
    code: "VST-XB-1",
    title: "Reverse Charge § 13b (Tatbestandskatalog)",
    statutes: ["§ 13b UStG", "§ 15 Abs. 1 Nr. 4 UStG"],
    guidance:
      "EU-Leistung/Drittlandsleistung/Bauleistung u. a.: der Mandant schuldet die Steuer selbst. Schlüssel " +
      "94/91 nur bei Abzugsberechtigung, sonst 95/92 (Steuer wird Aufwand). Details: get_guideline('input_tax') Abschnitt 2.",
  },
  {
    code: "VST-XB-5",
    title: "Ausländische USt ist nie deutsche Vorsteuer",
    statutes: ["§ 15 Abs. 1 Nr. 1 UStG", "§§ 59 ff. UStDV"],
    guidance:
      "Ausgewiesene ausländische USt (inkl. OSS-`EU`-Nummern nach § 18i) ist in der UStVA nie abziehbar — " +
      "brutto buchen; Vergütungsverfahren ist Kanzleientscheidung.",
    evaluate: (facts) => {
      const origin = facts.get("vendor_vat_id_origin");
      const shown = facts.get("vat_shown");
      if (!origin || origin.value !== "no")
        return notApplicable("Keine ausländische USt-IdNr. am Beleg erkannt");
      if (shown?.value !== "yes")
        return { applies: true, result: "pass", reason: "Ausländischer Aussteller ohne USt-Ausweis — 13b/igE-Pfad (VST-XB-1/2)", blockedTaxKeys: [] };
      return {
        applies: true,
        result: "fail",
        reason: `${origin.rationale}; trotzdem Steuer ausgewiesen (${shown.rationale}) — keine deutsche VSt, kein igE aus dieser Rechnung`,
        blockedTaxKeys: DOMESTIC_INPUT_KEYS,
      };
    },
  },
  {
    code: "VST-XB-6",
    title: "Fremdwährungsrechnung: keine deutsche VSt",
    statutes: ["Ludwig-Konvention (abgeleitet aus VST-XB-5)"],
    guidance:
      "Eine FW-Rechnung kann keine abziehbare deutsche VSt tragen — Reverse-Charge-Behandlung (94/95); die " +
      "FW-Steuer bleibt Audit-Trail und fließt nie in die EUR-Buchung.",
    evaluate: (facts) => {
      const f = facts.get("foreign_currency");
      if (!f || f.value === "not_applicable")
        return notApplicable("Kein Beleg/keine Währung");
      if (f.value === "yes")
        return {
          applies: true,
          result: "fail",
          reason: f.rationale,
          blockedTaxKeys: DOMESTIC_INPUT_KEYS,
        };
      if (f.value === "unknown")
        return { applies: true, result: "unknown", reason: f.rationale, blockedTaxKeys: [] };
      return { applies: true, result: "pass", reason: f.rationale, blockedTaxKeys: [] };
    },
  },
  {
    code: "VST-BAN-1",
    title: "Abzugsverbote § 15 Abs. 1a (Geschenke, Repräsentation)",
    statutes: ["§ 15 Abs. 1a UStG", "§ 4 Abs. 5 EStG"],
    guidance:
      "Geschenke > 50 € netto pro Empfänger/Jahr, Gästehäuser, Jagd, Yacht: keine VSt, brutto auf das " +
      "nicht-abziehbare Konto. Die Jahres-Aggregation pro Empfänger kann kein Einzelbeleg-Check leisten.",
  },
  {
    code: "VST-BAN-2",
    title: "Bewirtung: VSt 100 %, Aufwand 70/30",
    statutes: ["§ 15 Abs. 1a S. 2 UStG"],
    guidance:
      "VSt voll abziehbar trotz 70/30-Split des Nettos — Voraussetzung ordnungsgemäßer Bewirtungsbeleg " +
      "(Anlass + Teilnehmer); fehlt er → raise_clarification.",
  },
  {
    code: "VST-TIME-1",
    title: "Periode: Leistung + Rechnungsbesitz",
    statutes: ["§ 15 Abs. 1 Nr. 1 UStG", "UStAE 15.2"],
    guidance:
      "VSt gehört in den Zeitraum, in dem erstmals Leistung UND Rechnung vorliegen — kein Wahlrecht, kein " +
      "Nachholen. Nie in festgeschriebene Perioden buchen.",
  },
  {
    code: "VST-ADJ-1",
    title: "Entgeltminderung: Skonto/Bonus (§ 17)",
    statutes: ["§ 17 Abs. 1 UStG", "UStAE 17.1"],
    guidance:
      "Skontoabzug bei Zahlung / Bonus mindert den Vorsteuerabzug im Zeitraum der Minderung — Skonto-Konten " +
      "mit Steuerschlüssel nutzen, nie die Differenz unter den Tisch fallen lassen.",
  },
];

const RULES_BY_CODE = new Map(VAT_RULES.map((r) => [r.code, r]));

export interface VatRuleDetails {
  code: string;
  title: string;
  statutes: string[];
  guidance: string;
  machineChecked: boolean;
}

/** Zweite Lesefunktion des Konzepts: Hintergrund + harte Regel je Code. */
export function getVatRuleDetails(code: string): VatRuleDetails | null {
  const r = RULES_BY_CODE.get(code.toUpperCase());
  if (!r) return null;
  return {
    code: r.code,
    title: r.title,
    statutes: r.statutes,
    guidance: r.guidance,
    machineChecked: r.evaluate != null,
  };
}

export function listVatRuleCodes(): string[] {
  return VAT_RULES.map((r) => r.code);
}

// ---------------------------------------------------------------------------
// Verdikt
// ---------------------------------------------------------------------------

export type VatVerdict = "forbidden" | "allowed" | "needs_facts";

export interface VatAssessment {
  facts: VatFact[];
  /** Nur maschinell ausgewertete Regeln (evaluate gesetzt). */
  rules: VatRuleResult[];
  /** Katalog-Regeln ohne maschinelle Prüfung — Playbook/Judge-Sache. */
  notMachineChecked: string[];
  verdict: VatVerdict;
  /** Vereinigung aller durch fail-Regeln verbotenen BU-Schlüssel. */
  blockedTaxKeys: string[];
  /** fail-Regeln (Gate-Blocker) bzw. unknown-Blocker (needs_facts). */
  failedRules: string[];
  unknownRules: string[];
}

export function evaluateVatDeduction(input: VatAssessmentInput): VatAssessment {
  const facts = deriveVatFacts(input);
  const byCode = new Map(facts.map((f) => [f.code, f]));

  const rules: VatRuleResult[] = [];
  for (const def of VAT_RULES) {
    if (!def.evaluate) continue;
    const r = def.evaluate(byCode, input);
    rules.push({ code: def.code, title: def.title, ...r });
  }

  const applicable = rules.filter((r) => r.applies);
  const failed = applicable.filter((r) => r.result === "fail");
  const unknown = applicable.filter((r) => r.result === "unknown");
  const blockedTaxKeys = [...new Set(failed.flatMap((r) => r.blockedTaxKeys))];

  const verdict: VatVerdict =
    failed.length > 0 ? "forbidden" : unknown.length > 0 ? "needs_facts" : "allowed";

  return {
    facts,
    rules,
    notMachineChecked: VAT_RULES.filter((r) => !r.evaluate).map((r) => r.code),
    verdict,
    blockedTaxKeys,
    failedRules: failed.map((r) => r.code),
    unknownRules: unknown.map((r) => r.code),
  };
}
