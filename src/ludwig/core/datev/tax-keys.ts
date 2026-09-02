/**
 * Katalog der DATEV-Steuerschlüssel (BU-Schlüssel) — die eine Quelle für
 * Agent-Validierung (`modules/accounting-cases/domain/tax-keys`) UND Anzeige
 * (`ui/booking`). Liegt in `core/datev`, damit die geteilte Buchungs-UI ihn
 * ohne Modul-Deep-Import lesen kann.
 *
 * Die BU-Schlüssel sind bei DATEV framework-übergreifend gleich (SKR03 == SKR04);
 * die verifizierten Werte 2/3/8/9 stammen aus dem DATEV-Import der Testmandanten,
 * `1` (steuerfrei) ist Standard. §13b (Reverse-Charge, 91/92/94/95) und
 * innergemeinschaftlicher Erwerb (18/19) hängen am konkreten Sachverhalt.
 */
export interface TaxKeyEntry {
  key: string;
  label: string;
  /** USt-Satz in Prozent, null wenn steuerfrei/nicht anwendbar. */
  vatRate: number | null;
  /** `input` = Vorsteuer (Eingangsseite), `output` = Umsatzsteuer (Ausgangsseite), `none`. */
  direction: "input" | "output" | "none";
  /** Ein Satz Klartext für die Anzeige (Tooltip am Buchungssatz). */
  description: string;
  /**
   * F81-T81.2: Schlüssel, den Ludwig **nur durchreicht** — keine Satz-Expansion,
   * keine Steuerzeile, keine Assistenz. Nur im expliziten Modus (`lines[]`)
   * setzbar und nur, wenn die Historie desselben Kontos ihn trägt.
   */
  passThrough?: true;
}

export const DATEV_TAX_KEYS: readonly TaxKeyEntry[] = [
  {
    key: "1",
    label: "Umsatzsteuerfrei (mit Vorsteuerabzug)",
    vatRate: 0,
    direction: "none",
    description:
      "Steuerfreier Umsatz mit Vorsteuerabzug — auf der Buchung entsteht keine Umsatzsteuer, z.B. Ausfuhr oder innergemeinschaftliche Lieferung.",
  },
  {
    key: "2",
    label: "Umsatzsteuer 7 %",
    vatRate: 7,
    direction: "output",
    description:
      "Ausgangsseite: aus dem Bruttobetrag werden 7 % Umsatzsteuer herausgerechnet und auf das USt-Konto gebucht (Zahllast ans Finanzamt).",
  },
  {
    key: "3",
    label: "Umsatzsteuer 19 %",
    vatRate: 19,
    direction: "output",
    description:
      "Ausgangsseite: aus dem Bruttobetrag werden 19 % Umsatzsteuer herausgerechnet und auf das USt-Konto gebucht (Zahllast ans Finanzamt).",
  },
  {
    key: "8",
    label: "Vorsteuer 7 %",
    vatRate: 7,
    direction: "input",
    description:
      "Eingangsseite: aus dem Bruttobetrag werden 7 % Vorsteuer herausgerechnet und auf das VSt-Konto gebucht (Erstattung vom Finanzamt).",
  },
  {
    key: "9",
    label: "Vorsteuer 19 %",
    vatRate: 19,
    direction: "input",
    description:
      "Eingangsseite: aus dem Bruttobetrag werden 19 % Vorsteuer herausgerechnet und auf das VSt-Konto gebucht (Erstattung vom Finanzamt).",
  },
  {
    key: "91",
    label: "§ 13b 7 % (mit Vorsteuerabzug)",
    vatRate: 7,
    direction: "input",
    description:
      "Reverse Charge nach § 13b UStG: der Leistungsempfänger schuldet die Steuer. Der Rechnungsbetrag ist netto; es entstehen zwei Steuerzeilen (USt + abziehbare VSt), die sich ausgleichen.",
  },
  {
    key: "92",
    label: "§ 13b 7 % (ohne Vorsteuerabzug)",
    vatRate: 7,
    direction: "input",
    description:
      "Reverse Charge nach § 13b UStG ohne Vorsteuerabzug: die geschuldete Umsatzsteuer wird zum Aufwand, es gibt keine Erstattung.",
  },
  {
    key: "94",
    label: "§ 13b 19 % (mit Vorsteuerabzug)",
    vatRate: 19,
    direction: "input",
    description:
      "Reverse Charge nach § 13b UStG: der Leistungsempfänger schuldet die Steuer. Der Rechnungsbetrag ist netto; es entstehen zwei Steuerzeilen (USt + abziehbare VSt), die sich ausgleichen.",
  },
  {
    key: "95",
    label: "§ 13b 19 % (ohne Vorsteuerabzug)",
    vatRate: 19,
    direction: "input",
    description:
      "Reverse Charge nach § 13b UStG ohne Vorsteuerabzug: die geschuldete Umsatzsteuer wird zum Aufwand, es gibt keine Erstattung.",
  },
  {
    key: "18",
    label: "Innergemeinschaftlicher Erwerb 7 %",
    vatRate: 7,
    direction: "input",
    description:
      "Einkauf aus einem anderen EU-Land: der Erwerber versteuert selbst. Erwerbsteuer und Vorsteuer werden beide gebucht und heben sich auf.",
  },
  {
    key: "19",
    label: "Innergemeinschaftlicher Erwerb 19 %",
    vatRate: 19,
    direction: "input",
    description:
      "Einkauf aus einem anderen EU-Land: der Erwerber versteuert selbst. Erwerbsteuer und Vorsteuer werden beide gebucht und heben sich auf.",
  },
  // ---------------------------------------------------------------------
  // Langform-Schlüssel (F81-T81.2). DATEV bietet seit WJ 2018 zusätzlich 3-
  // und 4-stellige Steuerschlüssel an; sie kommen im Spiegel echter Mandanten
  // vor (Erhebung 2026-08-15 über client_effective_journal_lines: 490 auf
  // Aufwandskonten wie 4920, 401 auf dem VSt-Konto 1406, 231 im Anlagen-
  // Umfeld). Bis F81 kannte der Katalog sie nicht — `list_tax_keys` zeigte
  // dem Agenten den Schlüssel nie, den die Kanzlei auf demselben Konto
  // durchgängig verwendet.
  //
  // Ihre genaue DATEV-Semantik ist hier bewusst NICHT behauptet: sie steht in
  // der DATEV-Schlüsseltabelle (Dok. 1008613), nicht in unseren Daten. Was wir
  // belegen können, steht in der description — mehr wäre geraten.
  {
    key: "231",
    label: "DATEV-Langform-Schlüssel 231 (nur durchreichen)",
    vatRate: null,
    direction: "none",
    description:
      "Dreistelliger DATEV-Schlüssel (Langform seit WJ 2018). Ludwig rechnet damit keine Steuerzeile und leitet keinen Satz ab — nur übernehmen, wenn die Historie desselben Kontos ihn trägt (get_vendor_history → taxKey).",
    passThrough: true,
  },
  {
    key: "401",
    label: "DATEV-Langform-Schlüssel 401 (nur durchreichen)",
    vatRate: null,
    direction: "none",
    description:
      "Dreistelliger DATEV-Schlüssel (Langform seit WJ 2018), im Spiegel u. a. auf dem Vorsteuerkonto 1406. Ludwig rechnet damit keine Steuerzeile — nur aus der Historie desselben Kontos übernehmen.",
    passThrough: true,
  },
  {
    key: "490",
    label: "DATEV-Langform-Schlüssel 490 (nur durchreichen)",
    vatRate: null,
    direction: "none",
    description:
      "Dreistelliger DATEV-Schlüssel (Langform seit WJ 2018). Kanzleien setzen ihn im Spiegel durchgängig auf bestimmten Aufwandskonten (z. B. 4920 Telefon) — wenn get_vendor_history für das Konto diesen Schlüssel als dominant meldet, gehört er an die Zeile. Ludwig rechnet damit keine Steuerzeile.",
    passThrough: true,
  },
] as const;

/** Katalog-Eintrag zu einem BU-Schlüssel, `null` wenn unbekannt. */
export function taxKeyEntry(taxKey: string | null | undefined): TaxKeyEntry | null {
  if (!taxKey) return null;
  return DATEV_TAX_KEYS.find((k) => k.key === taxKey) ?? null;
}

/** Schlüssel, aus dem Ludwig weder Satz noch Steuerzeile ableitet (F81-T81.2). */
export function isPassThroughTaxKey(taxKey: string | null | undefined): boolean {
  return taxKeyEntry(taxKey)?.passThrough === true;
}
