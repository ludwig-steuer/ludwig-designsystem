/**
 * Domain-Schicht des Regelwerks für Dauer-Sachverhalte
 * (``client_accounting_case`` mit ``kind='recurring_charge'``).
 *
 * Eine Regel beschreibt deterministisch, welche Bank-Transaktionen einem
 * Sachverhalt zugeordnet werden, und welcher Buchungsvorschlag daraus
 * entsteht. ``matchTransaction`` ist die einzige Wahrheit für „trifft" —
 * sie wird sowohl beim Import-Hook als auch beim manuellen Rescan und in
 * der Live-Vorschau im Regelwerk-Tab verwendet. Reine Funktion, keine IO.
 */

export type RuleDirection = "payment_in" | "payment_out";

/** Erwarteter Zahlungs-Rhythmus einer Regel (F04-T4.5). NULL = keine Erwartung. */
export type RuleExpectedInterval = "monthly" | "quarterly" | "yearly";

/** Rhythmus-Labels. Reines Vokabular ohne Farbe — deshalb hier und nicht in
 *  der Status-Registry (der Buchungsmodus liegt dort, der hat eine Farbe). */
export const RULE_INTERVAL_LABEL: Record<RuleExpectedInterval, string> = {
  monthly: "monatlich",
  quarterly: "vierteljährlich",
  yearly: "jährlich",
};

/**
 * Buchungswelt der Regel (F21.2 + F40):
 * - `book_on_payment`: Buchung erst bei Zahlung, Aufwand/Erlös gegen Bank.
 * - `accrue_then_settle`: Sollstellung zur Fälligkeit (accrual-Event gegen
 *   das Personenkonto); die Zahlung wird Personenkonto ⇄ Bank gebucht.
 * - `match_only`: Zahlung wird nur dem Sachverhalt zugeordnet (Event
 *   entsteht), es wird KEIN automatischer Buchungsvorschlag erzeugt.
 */
export type RuleBookingMode = "book_on_payment" | "accrue_then_settle" | "match_only";

/**
 * Was der Rescan beim Zahlungs-Treffer tun soll — reine Ableitung aus dem
 * Modus (F40 Teil B). `template` = Vorschlag aus der Regel-Vorlage buchen,
 * `settle` = Personenkonto ⇄ Bank (Aufwand/Erlös ist schon sollgestellt),
 * `none` = nur zuordnen, kein Vorschlag.
 */
export function rescanActionFor(mode: RuleBookingMode): "template" | "settle" | "none" {
  if (mode === "match_only") return "none";
  if (mode === "accrue_then_settle") return "settle";
  return "template";
}

/**
 * Woher Belegfeld 1 einer Periode kommt (F108 [E1]) — die drei Muster, die die
 * DATEV-Historie trägt:
 *
 * - `period_key`    Periodenkennung (`092026`). Dauervorgang ohne eigenen
 *   Beleg (Miete, Heizung) und eigene Dauerrechnung.
 * - `from_document` die Rechnungsnummer des Belegs, der die Periode trägt
 *   (Telefon, Strom — jede Periode bringt ihre eigene Nummer mit).
 * - `fixed`         die `datev_document_number` der Regel auf jeder Periode.
 *   Das Bestandsverhalten; ab der zweiten Periode gleicht DATEV den OPOS damit
 *   nicht mehr aus. Die Ableitung vergibt ihn NIE — er bleibt nur, damit eine
 *   Kanzlei, die es ausdrücklich so will, es weiter so haben kann.
 */
export type RuleDocumentNumberStrategy = "period_key" | "from_document" | "fixed";

/** Woher die Profil-Werte einer Regel stammen (F108 [E4]). */
export type RuleProfileSource = "derived" | "agent" | "human" | "onboarding";

/**
 * F108 [E4] — der Server leitet das Buchungsprofil ab, der Agent widerspricht
 * begründet.
 *
 * Drei Muster, unterschieden an `contract_type` und der Belegseite:
 *
 * | Profil | Erkennung | Nummer |
 * |---|---|---|
 * | Dauervorgang ohne Beleg | `rent`/`loan`, keine Beleg-Kriterien | `period_key` |
 * | Vertragsrechnung | `lease`/`recurring_invoice`/`service` mit Beleg je Periode | `from_document` |
 * | Eigene Dauerrechnung | `expected_direction = 'payment_in'` | `period_key` |
 *
 * Reine Funktion. Der Modus wird nur dann auf `accrue_then_settle` gehoben,
 * wenn ein Personenkonto dasteht — ohne das könnte die Sollstellung nicht
 * buchen und würde bei jedem Vorbereitungslauf still übersprungen. Ein
 * abgeleiteter Wert, der nicht funktioniert, ist schlechter als der Default.
 */
export function deriveRuleProfile(input: {
  contractType: string | null;
  expectedDirection: RuleDirection | null;
  /** Trägt die Regel ein Beleg-Kriterium (Vertragsnummer, Belegtext, Personenkonto)? */
  matchesDocuments: boolean;
  personalAccountNumber: string | null;
}): { bookingMode: RuleBookingMode; documentNumberStrategy: RuleDocumentNumberStrategy } {
  const canAccrue = input.personalAccountNumber != null;
  const bookingMode: RuleBookingMode = canAccrue ? "accrue_then_settle" : "book_on_payment";

  // Eigene Dauerrechnung: WIR stellen sie aus, also gibt es keinen fremden
  // Beleg, dessen Nummer man übernehmen könnte.
  if (input.expectedDirection === "payment_in") {
    return { bookingMode, documentNumberStrategy: "period_key" };
  }
  // Vertragsrechnung: jede Periode bringt ihre eigene Nummer mit.
  if (
    input.matchesDocuments &&
    (input.contractType == null ||
      ["lease", "recurring_invoice", "service", "other"].includes(input.contractType))
  ) {
    return { bookingMode, documentNumberStrategy: "from_document" };
  }
  // Dauervorgang ohne eigenen Beleg (Miete, Darlehen) — und der Rest.
  return { bookingMode, documentNumberStrategy: "period_key" };
}

/** Eine Gegenkonto-Zeile einer Split-Vorlage (feste Beträge). */
export interface RuleTemplateLine {
  /**
   * Die NUMMER, nicht die Id: eine Regel ist jahresfrei, eine Kontozeile nicht
   * (`konten.md` R2). Wer aus der Vorlage bucht, loest die Nummer im
   * Wirtschaftsjahr seiner Buchung auf.
   */
  accountNumber: string;
  /**
   * Positiver Zeilenbetrag. Alternativ zu `percent` — genau eines von beiden
   * trägt die Zeile.
   */
  amount: number | null;
  /**
   * F94-T94.7: prozentualer Anteil am Buchungsbetrag (0–100). Für
   * Dauersachverhalte mit schwankendem Betrag: die feste Aufteilung steht
   * fest, der Betrag ergibt sich aus der Buchung. Summe aller Zeilen = 100.
   */
  percent: number | null;
  taxKey: string | null;
  taxRatePercent: number | null;
  description: string | null;
}

/** Buchungs-Vorlage, die ein Regel-Treffer zur Buchung macht. */
export interface RuleBookingTemplate {
  /**
   * Nicht-Bank-Konto (Aufwand/Ertrag) als NUMMER. Bank-Seite kommt aus dem
   * Zahlungskonto. Nummer statt Id, weil die Regel ueber Jahrgaenge hinweg gilt
   * und die Kontozeile je Wirtschaftsjahr eine andere ist (R2).
   */
  counterAccountNumber: string | null;
  taxKey: string | null;
  taxRatePercent: number | null;
  description: string | null;
  /** Split-Vorlage (≥2 Gegenkonto-Zeilen). Gesetzt → counterAccountNumber wird ignoriert. */
  lines: RuleTemplateLine[] | null;
  /**
   * Betrag der Ein-Konto-Vorlage — was die Sollstellung bucht. Getrennt von
   * `matchAmount`: das ist ein Match-KRITERIUM und bei Gegenpartei-Match NULL
   * (Sammelzahlungen), der Vorlagenbetrag muss davon unabhängig bestehen
   * bleiben. Im Split-Fall ergibt ihn die Summe aus `lines`.
   */
  amount: number | null;
}

/** Toleranz, mit der die Split-Zeilensumme zum Zahlbetrag passen muss. */
export const TEMPLATE_LINES_SUM_TOLERANCE = 0.01;

/**
 * Prüft, ob eine Split-Vorlage auf einen Zahlbetrag anwendbar ist: die
 * Zeilensumme muss den Betrag (bis auf Rundung) decken, sonst würde der
 * Buchungsvorschlag nicht aufgehen. Reine Funktion.
 */
export function templateLinesCoverAmount(
  lines: RuleTemplateLine[],
  paymentAmount: number,
): boolean {
  // Prozent-Vorlagen decken jeden Betrag — das ist ihr Zweck (F94-T94.7).
  if (isPercentTemplate(lines)) return percentSumIsComplete(lines);
  const sum = lines.reduce((acc, line) => acc + Math.abs(line.amount ?? 0), 0);
  return Math.abs(sum - Math.abs(paymentAmount)) <= TEMPLATE_LINES_SUM_TOLERANCE;
}

/** Prozent-Vorlage = jede Zeile trägt `percent` (gemischt ist ein Fehler). */
export function isPercentTemplate(lines: RuleTemplateLine[]): boolean {
  return lines.length > 0 && lines.every((l) => l.percent != null);
}

/** Toleranz der Prozentsumme — Nachkommastellen dürfen sich zu 99,99 addieren. */
export const TEMPLATE_PERCENT_TOLERANCE = 0.01;

export function percentSumIsComplete(lines: RuleTemplateLine[]): boolean {
  const sum = lines.reduce((acc, l) => acc + (l.percent ?? 0), 0);
  return Math.abs(sum - 100) <= TEMPLATE_PERCENT_TOLERANCE;
}

/**
 * F94-T94.7 — Prozent-Vorlage auf einen konkreten Betrag rechnen.
 *
 * Der Restcent geht auf die betragsgrößte Zeile, damit der Satz aufgeht: bei
 * 33,33 % dreimal auf 100,00 € fehlt sonst ein Cent, und ein Buchungssatz, der
 * um einen Cent nicht aufgeht, ist kein Buchungssatz. Reine Funktion.
 */
export function resolvePercentLines(
  lines: RuleTemplateLine[],
  amount: number,
): RuleTemplateLine[] {
  const total = Math.abs(amount);
  const raw = lines.map((l) => Math.round(total * ((l.percent ?? 0) / 100) * 100) / 100);
  const diff = Math.round((total - raw.reduce((a, b) => a + b, 0)) * 100) / 100;
  if (Math.abs(diff) >= 0.005) {
    let biggest = 0;
    for (let i = 1; i < raw.length; i += 1) if (raw[i]! > raw[biggest]!) biggest = i;
    raw[biggest] = Math.round((raw[biggest]! + diff) * 100) / 100;
  }
  return lines.map((l, i) => ({ ...l, amount: raw[i]! }));
}

export interface RecurringRule {
  id: string;
  tenantId: string;
  clientId: string;
  caseId: string;
  paymentAccountId: string | null;
  isActive: boolean;
  priority: number;
  expectedDirection: RuleDirection | null;
  matchCounterpartyName: string | null;
  matchCounterpartyIban: string | null;
  matchAmount: number | null;
  matchAmountTolerance: number;
  /**
   * F108 [E7]: prozentuale Toleranz neben der absoluten — bei schwankenden
   * Reihen (Strom, Telefon) fiele der Betrag als Kriterium sonst ersatzlos aus.
   * Beide gesetzt: die großzügigere gewinnt (`effectiveAmountTolerance`).
   */
  matchAmountTolerancePercent: number | null;
  matchPurposeRegex: string | null;
  /** Wann eine Zahlung fällig wäre (Überfälligkeits-Check, F04-T4.5). */
  expectedInterval: RuleExpectedInterval | null;
  /** Erwarteter Zahltag im Monat (1–31), rein informativ. */
  expectedDayOfMonth: number | null;
  /** Laufzeit der Dauerbuchung (DATEV Beginn-/Enddatum), rein informativ. */
  validFrom: string | null;
  validUntil: string | null;
  /** Idempotenz-Anker des DATEV-Imports; NULL bei manuell angelegten Regeln. */
  importReference: string | null;
  /**
   * Belegfeld 1 der DATEV-Dauerbuchung (F91) — Identität des DSV. Sollstellungs-
   * und Settle-Vorschläge schreiben sie als `external_document_number` auf alle
   * Journal-Lines (Export-Belegfeld 1, OPOS-Ausgleich). NULL bei Alt-Regeln.
   */
  datevDocumentNumber: string | null;
  /** Freitext-Notiz zur Zuordnung Zahlung → Sachverhalt (Zuordnung-Tab). Kein Match-Kriterium. */
  matchingNote: string | null;
  // ── F94: Belegseite derselben Regel ───────────────────────────────────
  /**
   * Vertragsnummer laut Beleg. DAS tragende Beleg-Kriterium: sie ist über die
   * Perioden konstant, die Rechnungsnummer wechselt monatlich.
   */
  matchContractNumber: string | null;
  /** Muster im Belegtext (Aussteller, Positionstext) — Pendant zu matchPurposeRegex. */
  matchDocumentTextRegex: string | null;
  /** Abgeleitet: true, sobald ein Beleg-Kriterium gesetzt ist. */
  matchesDocuments: boolean;
  bookingMode: RuleBookingMode;
  /** F108 [E1]: woher Belegfeld 1 der Periode kommt. */
  documentNumberStrategy: RuleDocumentNumberStrategy;
  /** F108 [E4]: woher das Profil stammt — ohne das ist eine falsche Ableitung nicht auffindbar. */
  profileSource: RuleProfileSource | null;
  /** Personenkonto (Debitor/Kreditor) als NUMMER — Pflicht für accrue_then_settle. */
  personalAccountNumber: string | null;
  template: RuleBookingTemplate;
}

/** Minimaler Transaktions-Ausschnitt, den der Matcher braucht. */
export interface MatchableTransaction {
  id: string;
  /** Vorzeichenbehaftet: negativ = Ausgang, positiv = Eingang. */
  amount: number;
  postingDate: string;
  purpose: string | null;
  counterpartyName: string | null;
  counterpartyIban: string | null;
}

/** Nur die Match-Kriterien — entkoppelt die Engine von Persistenz-Feldern. */
export type RuleCriteria = Pick<
  RecurringRule,
  | "expectedDirection"
  | "matchCounterpartyName"
  | "matchCounterpartyIban"
  | "matchAmount"
  | "matchAmountTolerance"
  | "matchAmountTolerancePercent"
  | "matchPurposeRegex"
>;

/** IBAN für den Vergleich normalisieren (Leerzeichen weg, Großbuchstaben). */
export function normalizeIban(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, "").toUpperCase();
}

/** Nur die Betrags-Toleranz — beide Matcher rechnen sie gleich. */
type AmountTolerance = Pick<
  RecurringRule,
  "matchAmount" | "matchAmountTolerance" | "matchAmountTolerancePercent"
>;

/**
 * F108 [E7] — die geltende Betrags-Toleranz in Euro.
 *
 * Absolut und prozentual stehen nebeneinander, und die **großzügigere
 * gewinnt**. Begründung: wer eine Prozent-Toleranz ergänzt, will eine
 * schwankende Reihe (Strom, Telefon) überhaupt erst matchbar machen — die
 * strengere Lesart würde genau das verhindern und den ergänzten Wert
 * entwerten. Umgekehrt bleibt die absolute Toleranz für den festen Mietbetrag
 * unangetastet, wo Prozente nur Unschärfe wären.
 */
export function effectiveAmountTolerance(rule: AmountTolerance): number {
  const absolute = rule.matchAmountTolerance ?? 0;
  const percent =
    rule.matchAmountTolerancePercent != null && rule.matchAmount != null
      ? Math.abs(rule.matchAmount) * (rule.matchAmountTolerancePercent / 100)
      : 0;
  return Math.max(absolute, percent);
}

/**
 * F108 [E8] — weicht der tatsächliche Betrag über die ABSOLUTE Toleranz hinaus
 * ab, obwohl die Regel getroffen hat?
 *
 * Der Fall entsteht erst durch [E7]: die Prozent-Toleranz lässt den Treffer zu,
 * damit die Periode überhaupt entsteht — aber sie soll ihn nicht stillstellen.
 * Wer den Betrag lockert, will die Reihe weiterlaufen lassen, nicht die
 * Erhöhung übersehen. `null` = kein Anlass (kein erwarteter Betrag, oder
 * innerhalb der absoluten Toleranz).
 */
export function amountDeviation(
  rule: AmountTolerance,
  actualAmount: number,
): { expected: number; actual: number; deviationPercent: number } | null {
  if (rule.matchAmount == null) return null;
  const expected = Math.abs(rule.matchAmount);
  const actual = Math.abs(actualAmount);
  if (expected === 0) return null;
  if (Math.abs(actual - expected) <= (rule.matchAmountTolerance ?? 0) + 1e-9) return null;
  return {
    expected,
    actual,
    deviationPercent: Math.round(((actual - expected) / expected) * 1000) / 10,
  };
}

/** Richtung einer Transaktion aus dem Vorzeichen ableiten. */
export function directionOf(amount: number): RuleDirection {
  return amount < 0 ? "payment_out" : "payment_in";
}

/**
 * Trifft die Transaktion die Regel? ALLE gesetzten Kriterien müssen
 * zutreffen (UND-Verknüpfung). Eine Regel ganz ohne Kriterien trifft
 * NICHTS (kein versehentlicher Catch-all). Ein ungültiger Regex trifft
 * nicht (statt zu werfen) — die Validierung gehört in die Action.
 */
export function matchTransaction(
  txn: MatchableTransaction,
  rule: RuleCriteria,
): boolean {
  if (rule.expectedDirection && directionOf(txn.amount) !== rule.expectedDirection) {
    return false;
  }

  let anyCriterion = false;

  if (rule.matchCounterpartyIban) {
    anyCriterion = true;
    if (normalizeIban(txn.counterpartyIban) !== normalizeIban(rule.matchCounterpartyIban)) {
      return false;
    }
  }

  if (rule.matchCounterpartyName && rule.matchCounterpartyName.trim() !== "") {
    anyCriterion = true;
    const needle = rule.matchCounterpartyName.toLowerCase().trim();
    if (!(txn.counterpartyName ?? "").toLowerCase().includes(needle)) {
      return false;
    }
  }

  if (rule.matchAmount != null) {
    anyCriterion = true;
    const tolerance = effectiveAmountTolerance(rule);
    if (Math.abs(Math.abs(txn.amount) - Math.abs(rule.matchAmount)) > tolerance + 1e-9) {
      return false;
    }
  }

  if (rule.matchPurposeRegex && rule.matchPurposeRegex.trim() !== "") {
    anyCriterion = true;
    let regex: RegExp;
    try {
      regex = new RegExp(rule.matchPurposeRegex, "i");
    } catch {
      return false;
    }
    if (!regex.test(txn.purpose ?? "")) {
      return false;
    }
  }

  return anyCriterion;
}

/** Minimaler Beleg-Ausschnitt, den der Beleg-Matcher braucht. */
export interface MatchableSourceDoc {
  id: string;
  /** Bruttobetrag der Rechnung, immer positiv. */
  amount: number | null;
  /** Belegdatum (ISO). Für die Perioden-Ableitung, nicht als Kriterium. */
  documentDate: string | null;
  /** Vertragsnummer laut Beleg (F94-T94.1). */
  contractNumber: string | null;
  /** Aussteller bei Eingangs-, Kunde bei Ausgangsrechnung. */
  counterpartyName: string | null;
  /** Geschäftspartner, den das Beleg-Matching aufgelöst hat (F96). */
  businessPartnerId: string | null;
  /** Personenkonto-Zeile des Belegs als Nummer, falls bekannt. */
  personalAccountNumber: string | null;
  /** Freitext für das Muster-Kriterium (Belegtext/Zusammenfassung). */
  documentText: string | null;
  /** `inbound` → Aufwand/Kreditor, `outbound` → Erlös/Debitor. */
  docDirection: "inbound" | "outbound" | "internal" | null;
}

/** Nur die Beleg-Match-Kriterien — dieselbe Entkopplung wie `RuleCriteria`. */
export type RuleDocumentCriteria = Pick<
  RecurringRule,
  | "expectedDirection"
  | "matchCounterpartyName"
  | "matchAmount"
  | "matchAmountTolerance"
  | "matchAmountTolerancePercent"
  | "matchContractNumber"
  | "matchDocumentTextRegex"
  | "matchesDocuments"
  | "personalAccountNumber"
>;

/**
 * F94-T94.3 — trifft dieser Beleg diese Regel?
 *
 * Zweite Match-Richtung derselben Regel: ein Leasingvertrag stellt jeden Monat
 * eine Rechnung mit neuer Belegnummer aus, ist fachlich aber EIN
 * Dauersachverhalt. Ohne diesen Matcher gründete der Beleg-Pfad je
 * Monatsrechnung einen eigenen, unverbundenen Sachverhalt.
 *
 * Wie `matchTransaction`: UND-verknüpft, und eine Regel ohne Kriterium trifft
 * nichts — ein Catch-all wäre schlimmer als keine Regel. Wo sich Felder mit
 * der Zahlungsseite decken (Gegenpartei, Betrag, Richtung), gelten dieselben
 * Spalten und dieselbe Semantik.
 *
 * Die Richtung wird aus `doc_direction` gelesen, nicht aus einem Vorzeichen:
 * eine Rechnung trägt keines, und eine Lieferanten-Gutschrift wäre sonst
 * fälschlich debitorisch.
 */
export function matchSourceDoc(doc: MatchableSourceDoc, rule: RuleDocumentCriteria): boolean {
  if (!rule.matchesDocuments) return false;
  if (doc.docDirection === "internal") return false;

  if (rule.expectedDirection) {
    const docDirection: RuleDirection | null =
      doc.docDirection === "inbound" ? "payment_out" : doc.docDirection === "outbound" ? "payment_in" : null;
    if (docDirection != null && docDirection !== rule.expectedDirection) return false;
  }

  let anyCriterion = false;

  if (rule.matchContractNumber && rule.matchContractNumber.trim() !== "") {
    anyCriterion = true;
    const want = rule.matchContractNumber.replace(/\s+/g, "").toLowerCase();
    const have = (doc.contractNumber ?? "").replace(/\s+/g, "").toLowerCase();
    if (have === "" || have !== want) return false;
  }

  // Das Personenkonto der Regel ist ein Kriterium, sobald der Beleg eines
  // trägt — es ist die belastbarste Aussage über die Gegenpartei.
  if (rule.personalAccountNumber && doc.personalAccountNumber) {
    anyCriterion = true;
    if (rule.personalAccountNumber !== doc.personalAccountNumber) return false;
  }

  if (rule.matchCounterpartyName && rule.matchCounterpartyName.trim() !== "") {
    anyCriterion = true;
    const needle = rule.matchCounterpartyName.toLowerCase().trim();
    if (!(doc.counterpartyName ?? "").toLowerCase().includes(needle)) return false;
  }

  if (rule.matchAmount != null && doc.amount != null) {
    anyCriterion = true;
    const tolerance = effectiveAmountTolerance(rule);
    if (Math.abs(Math.abs(doc.amount) - Math.abs(rule.matchAmount)) > tolerance + 1e-9) return false;
  }

  if (rule.matchDocumentTextRegex && rule.matchDocumentTextRegex.trim() !== "") {
    anyCriterion = true;
    let regex: RegExp;
    try {
      regex = new RegExp(rule.matchDocumentTextRegex, "i");
    } catch {
      return false;
    }
    if (!regex.test(doc.documentText ?? "")) return false;
  }

  return anyCriterion;
}

/**
 * Periode eines Belegs für `accrual_period` — Leistungszeitraum vor Belegdatum.
 * Damit die (Regel, Periode)-Unique greift: ein zweiter Lauf desselben Belegs
 * erzeugt kein zweites Ereignis.
 *
 * F108 [E6]: der Schlüssel folgt dem RHYTHMUS des Vorgangs, nicht dem
 * Kalendermonat. Bei quartalsweiser Abrechnung wäre `2026-07` zu fein — die
 * drei Monatszahlungen einer Quartalsrechnung zählten als drei Perioden. Der
 * Rhythmus kommt von der Regel bzw. dem Sachverhalt; ohne ihn bleibt es beim
 * Monat, und das ist dann eine Annahme mit Absender statt eines stillen
 * Defaults tief in `periodKeyOf`.
 */
export function accrualPeriodOfDocument(
  doc: {
    servicePeriod?: string | null;
    documentDate: string | null;
  },
  interval: RuleExpectedInterval | null = null,
): string | null {
  const fromService = doc.servicePeriod?.match(/(\d{4})-(\d{2})/);
  const monthKey = fromService
    ? `${fromService[1]}-${fromService[2]}`
    : doc.documentDate
      ? doc.documentDate.slice(0, 7)
      : null;
  if (!monthKey || !interval || interval === "monthly") return monthKey;
  const year = Number(monthKey.slice(0, 4));
  const month = Number(monthKey.slice(5, 7));
  if (!year || !month) return monthKey;
  return interval === "yearly"
    ? String(year)
    : `${year}-Q${Math.floor((month - 1) / 3) + 1}`;
}

export type BookingSide = "debit" | "credit";

/**
 * Soll/Haben-Seiten eines Buchungsvorschlags aus der Richtung:
 * - Ausgang (payment_out): Gegenkonto (Aufwand) SOLL, Bank HABEN.
 * - Eingang  (payment_in):  Bank SOLL, Gegenkonto (Ertrag) HABEN.
 */
export function proposalSides(amount: number): {
  counterSide: BookingSide;
  bankSide: BookingSide;
} {
  return directionOf(amount) === "payment_out"
    ? { counterSide: "debit", bankSide: "credit" }
    : { counterSide: "credit", bankSide: "debit" };
}

/** Ab wie vielen Vorbuchungen ein Muster bewertbar ist + Ausreißer-Schwelle. */
export const RECURRING_ANOMALY_MIN_HISTORY = 3;
export const RECURRING_AMOUNT_ANOMALY_RATIO = 0.5; // ±50 % vom Median

/**
 * Deterministischer Ausreißer-Check für wiederkehrende Auto-Buchungen: weicht
 * der neue Betrag stark vom Median der bisherigen Buchungen des Sachverhalts
 * ab (z. B. 10× Miete, dann eine Kaution), wird die Buchung zur Prüfung
 * markiert statt blind übernommen. Reine Funktion — kein LLM.
 *
 * ponytail: Median ± fester Quote. Reicht fürs „fällt aus dem Muster"-Signal;
 * Upgrade-Pfad bei Bedarf = LLM-Judge (booking-module) über die Historie.
 */
export function evaluateAmountAnomaly(
  priorAmounts: number[],
  amount: number,
): { anomaly: boolean; reason: string | null } {
  const priors = priorAmounts.map((a) => Math.abs(a)).filter((a) => Number.isFinite(a) && a > 0);
  if (priors.length < RECURRING_ANOMALY_MIN_HISTORY) return { anomaly: false, reason: null };
  const sorted = [...priors].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1]! + sorted[mid]!) / 2 : sorted[mid]!;
  if (median <= 0) return { anomaly: false, reason: null };
  const dev = Math.abs(Math.abs(amount) - median) / median;
  if (dev > RECURRING_AMOUNT_ANOMALY_RATIO) {
    return {
      anomaly: true,
      reason: `Betrag weicht ${Math.round(dev * 100)} % vom Median (${median.toFixed(2)}) der ${priors.length} bisherigen Buchungen ab — bitte prüfen.`,
    };
  }
  return { anomaly: false, reason: null };
}

/** Ist der String ein gültiger JS-Regex? Für Form-Validierung. */
export function isValidRegex(pattern: string): boolean {
  try {
    void new RegExp(pattern);
    return true;
  } catch {
    return false;
  }
}

/** Ausschnitt einer Regel, den die Fälligkeits-Logik der Sollstellung braucht. */
export type AccrualRuleSlice = Pick<
  RecurringRule,
  "expectedInterval" | "expectedDayOfMonth" | "validFrom" | "validUntil"
>;

/**
 * Ist die Regel in der Periode (year, month) zur Sollstellung fällig?
 * Reine Funktion. String-Rückgabe = Grund, warum nicht (fürs Step-Reporting);
 * `true` = fällig.
 *
 * - Laufzeit: validFrom/validUntil müssen die Periode schneiden.
 * - monthly → jeden Monat; quarterly/yearly → Ankermonat aus validFrom
 *   (ohne validFrom ist der Rhythmus nicht verankerbar → nicht fällig).
 */
export function isRuleDueInPeriod(
  rule: AccrualRuleSlice,
  year: number,
  month: number,
): true | string {
  if (!rule.expectedInterval) return "kein expected_interval an der Regel";
  const periodStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const periodEnd = `${year}-${String(month).padStart(2, "0")}-31`;
  if (rule.validFrom && rule.validFrom > periodEnd) return "Laufzeit beginnt erst nach der Periode";
  if (rule.validUntil && rule.validUntil < periodStart) return "Laufzeit ist vor der Periode abgelaufen";
  if (rule.expectedInterval === "monthly") return true;

  if (!rule.validFrom) return `Rhythmus ${rule.expectedInterval} ohne validFrom nicht verankerbar`;
  const anchorMonth = Number(rule.validFrom.slice(5, 7));
  const step = rule.expectedInterval === "quarterly" ? 3 : 12;
  const distance = (year * 12 + month) - (Number(rule.validFrom.slice(0, 4)) * 12 + anchorMonth);
  return distance % step === 0 ? true : `im Rhythmus ${rule.expectedInterval} nicht fällig (Anker ${rule.validFrom})`;
}

/** Fälligkeits-Datum (ISO) der Sollstellung in der Periode — Tag geklemmt auf Monatslänge. */
export function accrualDueDate(rule: AccrualRuleSlice, year: number, month: number): string {
  const preferredDay =
    rule.expectedDayOfMonth ?? (rule.validFrom ? Number(rule.validFrom.slice(8, 10)) : 1);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const day = Math.min(Math.max(preferredDay, 1), daysInMonth);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * Soll/Haben der Sollstellung aus der Zahlungsrichtung der Regel:
 * - Kreditor-Fall (payment_out): Aufwand SOLL an Personenkonto HABEN.
 * - Debitor-Fall (payment_in):   Personenkonto SOLL an Erlös HABEN.
 */
export function accrualSides(direction: RuleDirection): {
  counterSide: BookingSide;
  personalSide: BookingSide;
} {
  return direction === "payment_out"
    ? { counterSide: "debit", personalSide: "credit" }
    : { counterSide: "credit", personalSide: "debit" };
}

/**
 * Betrag, den die Sollstellung bucht.
 *
 * Die Reihenfolge ist der Kern der Trennung von Match-Kriterium und Betrag
 * (F40 Teil C, Migration 20260714100000): `template.amount` ist der
 * Vorlagenbetrag, `matchAmount` nur noch Fallback für Altregeln, die vor der
 * Trennung angelegt wurden. Eine Regel, die über die Gegenpartei matcht
 * (Sammelzahlungen), hat `matchAmount = null` — läge der Betrag weiterhin
 * dort, könnte sie nie sollstellen.
 */
export function accrualAmount(
  rule: Pick<RecurringRule, "matchAmount" | "template">,
): number | null {
  if (rule.template.amount != null) return rule.template.amount;
  if (rule.template.lines?.length) {
    // Prozent-Vorlagen tragen keinen eigenen Betrag — er kommt aus der
    // Buchung (F94-T94.7); die Sollstellung fällt dann auf matchAmount zurück.
    if (isPercentTemplate(rule.template.lines)) return rule.matchAmount;
    return Number(rule.template.lines.reduce((s, l) => s + (l.amount ?? 0), 0).toFixed(2));
  }
  return rule.matchAmount;
}

/** Vorbefüllte Match-Kriterien fürs Regel-Formular (Lernschleife). */
export type RulePrefill = Pick<
  RecurringRule,
  | "expectedDirection"
  | "matchCounterpartyName"
  | "matchCounterpartyIban"
  | "matchAmount"
  | "matchAmountTolerance"
  | "matchAmountTolerancePercent"
  | "matchPurposeRegex"
>;

/**
 * Leitet aus einer (dem Sachverhalt bereits zugeordneten) Bank-Transaktion
 * einen Regel-Vorschlag ab — das „Lernen" aus einer Zahlung. Datenabhängig:
 *
 * - **IBAN vorhanden** → IBAN + Richtung. Stark genug allein; Betrag NICHT
 *   anheften (sonst greift die Regel bei schwankenden Beträgen nicht mehr).
 * - **nur Name + Betreff** → Name + Betrag + Richtung als Anker, weil ein
 *   Name-Teiltext allein zu viel fängt. Toleranz 0 — der Nutzer lockert sie
 *   für schwankende Beträge selbst.
 *
 * Der Verwendungszweck wird NICHT automatisch zum Regex (zu brüchig, enthält
 * oft wechselnde Buchungs-IDs) — das ergänzt der Nutzer bei Bedarf. Die
 * Live-Vorschau im Formular ist die Kontrolle „passt die Regel so?".
 */
export function prefillFromTransaction(txn: {
  amount: number;
  purpose: string | null;
  counterpartyName: string | null;
  counterpartyIban: string | null;
}): RulePrefill {
  const hasIban = normalizeIban(txn.counterpartyIban).length > 0;
  return {
    expectedDirection: directionOf(txn.amount),
    matchCounterpartyIban: hasIban ? txn.counterpartyIban : null,
    matchCounterpartyName: hasIban ? null : (txn.counterpartyName?.trim() || null),
    matchAmount: hasIban ? null : Math.abs(txn.amount) || null,
    matchAmountTolerance: 0,
    matchAmountTolerancePercent: null,
    matchPurposeRegex: null,
  };
}
