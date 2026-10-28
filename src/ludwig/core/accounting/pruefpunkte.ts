/**
 * Prüfpunkte je Buchungssatz — der P-Katalog (F123 T123.3, Design-Brief §8).
 *
 * Leitprinzip 4 des Reviews: *jeder Buchungssatz bringt seine eigenen
 * Prüfpunkte mit* — serverseitig abgeleitet, nur die relevanten. Was in
 * Ordnung ist, steht zusammengefasst in einer Zeile; eine eigene Zeile
 * bekommt, was noch eine Entscheidung braucht.
 *
 * Der Katalog ist **fest wie die Status-Registry**: ein Prüfpunkt hat einen
 * Code, eine Frage und einen Zustand, und alles drei steht hier. Ohne Katalog
 * entstehen im Alltag Formulierungen, die sich zwischen zwei Sätzen
 * unterscheiden — und dann heißt derselbe Befund zweimal etwas anderes.
 *
 * Vier Zustände statt drei Stufen:
 *
 *  - **`green`** — geprüft und in Ordnung.
 *  - **`yellow`** — auffällig; freigeben geht, aber erst nach Quittung.
 *  - **`red`** — der Satz ist so nicht richtig.
 *  - **`open`** — **nicht geprüft**, weil die Angabe fehlt. Das ist etwas
 *    anderes als grün, und der Unterschied ist der Punkt: ein Prüfpunkt, der
 *    mangels Daten grün wird, ist eine Lüge.
 *
 * Rein: die Funktion bekommt, was ohnehin geladen ist, und entscheidet daraus.
 * Kein IO, keine zweite Abfrage je Satz — die Abnahme zeigt dreistellige
 * Satz-Zahlen. Was noch nicht geladen wird, kommt als `undefined` herein und
 * ergibt `open` statt einer Behauptung.
 */

import { taxKeyEntry } from "@/ludwig/core/datev/tax-keys";

export type PruefpunktState = "green" | "yellow" | "red" | "open";

export const PRUEFPUNKT_CODES = [
  "P-SUMME",
  "P-BETRAG",
  "P-BELEG",
  "P-BELEGFELD",
  "P-BELEGFELD-PERIODE",
  "P-KONTO",
  "P-KONTO-NEU",
  "P-PARTNER",
  "P-PARTNER-NEU",
  "P-UST",
  "P-13B",
  "P-USTID",
  "P-EMPFAENGER",
  "P-LEISTUNG",
  "P-AUSGLEICH",
  "P-DUBLETTE",
  "P-REGEL-BETRAG",
  "P-VORMONAT",
  "P-GWG",
  "P-PRIVAT",
  "P-KASSE",
  "P-FX",
  "P-STORNO",
  "P-JUDGE",
] as const;

export type PruefpunktCode = (typeof PRUEFPUNKT_CODES)[number];

/** Die Frage, die der Punkt stellt. Immer als Frage — er ist kein Urteil. */
export const PRUEFPUNKT_FRAGE: Record<PruefpunktCode, string> = {
  "P-SUMME": "Gehen Soll und Haben auf?",
  "P-BETRAG": "Stimmt der gebuchte Betrag mit dem Beleg überein?",
  "P-BELEG": "Stimmt die Belegnummer mit dem Beleg überein?",
  "P-BELEGFELD": "Trägt das Personenkonto ein Belegfeld 1?",
  "P-BELEGFELD-PERIODE": "Folgt das Belegfeld der Schreibweise dieses Mandanten?",
  "P-KONTO": "Passt das Sachkonto zur Leistung?",
  "P-KONTO-NEU": "Wird dieses Konto erstmals bebucht?",
  "P-PARTNER": "Ist die Gegenpartei die vom Beleg?",
  "P-PARTNER-NEU": "Ist die Gegenpartei neu?",
  "P-UST": "Passt der Steuerschlüssel zum ausgewiesenen Steuersatz?",
  "P-13B": "Ist die Umkehr der Steuerschuld richtig behandelt?",
  "P-USTID": "Liegt bei innergemeinschaftlichem Bezug eine USt-IdNr. vor?",
  "P-EMPFAENGER": "Ist der Mandant der Rechnungsempfänger?",
  "P-LEISTUNG": "Liegt der Leistungszeitraum in dieser Periode?",
  "P-AUSGLEICH": "Gleicht die Zahlung den offenen Posten aus?",
  "P-DUBLETTE": "Gibt es diesen Beleg schon einmal?",
  "P-REGEL-BETRAG": "Entspricht der Betrag der hinterlegten Regel?",
  "P-VORMONAT": "Wurde im Vormonat gleich gebucht?",
  "P-GWG": "Ist die Anschaffung als geringwertiges Wirtschaftsgut zu behandeln?",
  "P-PRIVAT": "Ist ein privater Anteil enthalten?",
  "P-KASSE": "Bleibt der Kassenbestand positiv?",
  "P-FX": "Ist die Fremdwährung umgerechnet?",
  "P-STORNO": "Ist dieser Satz ein Storno und trägt einen Grund?",
  "P-JUDGE": "Was sagt der Judge zu diesem Satz?",
};

/**
 * Das Kurzwort des Punkts, wenn er der Prüfgrund einer Zeile ist (F355/F357):
 * ein, zwei Wörter statt der Frage.
 */
export const PRUEFPUNKT_KURZWORT: Record<PruefpunktCode, string> = {
  "P-SUMME": "Soll ≠ Haben",
  "P-BETRAG": "Betrag weicht ab",
  "P-BELEG": "Belegnummer",
  "P-BELEGFELD": "Belegfeld fehlt",
  "P-BELEGFELD-PERIODE": "Belegfeld-Schreibweise",
  "P-KONTO": "Konto ungewöhnlich",
  "P-KONTO-NEU": "Neues Konto",
  "P-PARTNER": "Gegenpartei abweichend",
  "P-PARTNER-NEU": "Neue Gegenpartei",
  "P-UST": "Steuerschlüssel",
  "P-13B": "§13b prüfen",
  "P-USTID": "USt-IdNr. fehlt",
  "P-EMPFAENGER": "Empfänger falsch",
  "P-LEISTUNG": "Leistungszeitraum",
  "P-AUSGLEICH": "Ausgleich offen",
  "P-DUBLETTE": "Mögliche Dublette",
  "P-REGEL-BETRAG": "Betrag ≠ Regel",
  "P-VORMONAT": "Anders als Vormonat",
  "P-GWG": "GWG",
  "P-PRIVAT": "Privatanteil",
  "P-KASSE": "Kasse negativ",
  "P-FX": "Fremdwährung",
  "P-STORNO": "Storno ohne Grund",
  // Nie Prüfgrund — das Judge-Urteil hat eigene Codes (judge_*); nur, damit jeder Code ein Wort hat.
  "P-JUDGE": "Judge",
};

/** Wohin springt, wer den Punkt klären will. Leer = klärt sich hier. */
const SPRUNG: Partial<Record<PruefpunktCode, string>> = {
  "P-BETRAG": "Beleg",
  "P-BELEG": "Beleg",
  "P-EMPFAENGER": "Beleg",
  "P-LEISTUNG": "Beleg",
  "P-USTID": "Gegenpartei",
  "P-PARTNER": "Gegenpartei",
  "P-PARTNER-NEU": "Gegenpartei",
  "P-VORMONAT": "Gegenpartei",
  "P-AUSGLEICH": "Zahlung",
  "P-REGEL-BETRAG": "Regel & Periode",
  "P-KONTO-NEU": "Kontenblatt",
  "P-DUBLETTE": "Dubletten",
};

/**
 * Eine Zeile je Prüfpunkt für Meldungen außerhalb der Prüfliste: erst die
 * Frage, dann der Befund, der Code nur in Klammern — wer das liest, kennt
 * „Beleg" und „Steuersatz", aber nicht „P-BETRAG".
 */
export function describePruefpunkt(p: Pruefpunkt): string {
  return `${p.question} ${p.reason} (${p.code})`;
}

export interface Pruefpunkt {
  code: PruefpunktCode;
  state: PruefpunktState;
  /** Was geprüft wird — die Frage aus dem Katalog. */
  question: string;
  /** Warum der Zustand so ist. Immer gefüllt, sonst ist die Stufe ein Orakel. */
  reason: string;
  /** Zone oder Drawer, in dem sich der Punkt klären lässt. */
  jump?: string;
}

/**
 * Was die Ableitung wissen muss. Alles außer `lines` ist optional: fehlt eine
 * Angabe, wird der zugehörige Punkt `open` mit dem Hinweis, was fehlt — statt
 * stillschweigend grün.
 */
export interface PruefpunktInput {
  journalEntryId: string;
  origin: string | null;
  judgeVerdict: "confirm" | "confirm_with_note" | "adjust" | "flag" | null;
  judgeReasoning: string | null;
  judgeCriteria: readonly string[];
  lines: ReadonlyArray<{
    side: "debit" | "credit";
    accountNumber: string | null;
    accountName?: string | null;
    amount: number;
    taxKey: string | null;
    taxRatePercent?: number | null;
    externalDocumentNumber: string | null;
    /** `creditor` / `debtor` / `expense` / … */
    accountingRole: string | null;
    /** Kontoklasse (`client_ledger_accounts.skr_class`, `ACCOUNT_CLASSES`) — entscheidet, ob P-UST einen Schlüssel erwartet. */
    skrClass?: string | null;
    /** Fester Satz des Automatikkontos (`datev_tax_rate`), sonst null — R9. */
    automaticTaxRate?: number | null;
    /**
     * § 13b-/igE-Steuerzeile (1577/1787, 1574/1774 …), die der Kern zur
     * Sachzeile anlegt — kein eigener Betrag. Die Betrags- und Satzprüfung
     * sieht nur die Sachzeilen, sonst zählt sie die Steuer zum Belegbetrag
     * (2026-0400: 8,66 + 1,65 = 10,31). Eine ausdrücklich gebuchte
     * Standard-VSt (1576) ist dagegen Teil des Belegbruttos und bleibt drin.
     */
    taxLine?: boolean;
    /** Sachverhalt L+L der § 13b-Zeile (`datev_reverse_charge_case`) — für den Prüfgrund (F357). */
    reverseChargeCase?: number | null;
  }>;

  /* Beleg — aus `client_source_docs_invoices`. */
  beleg?: {
    grossAmount: number | null;
    documentNumber: string | null;
    /** Ausgewiesener Steuersatz in Prozent — bei Mischbelegen ein Mischsatz. */
    vatRatePercent: number | null;
    /** Ausgewiesene Steuer (`tax_total_value`) — trägt P-UST bei Mischbelegen. */
    taxAmount?: number | null;
    reverseCharge: boolean | null;
    /** Passt der Rechnungsempfänger zum Mandanten? */
    recipientMatches: boolean | null;
    servicePeriodFrom: string | null;
    servicePeriodTo: string | null;
    currency: string | null;
  } | null;

  /* Gegenpartei — aus `getVendorHistory` / Partner-Stammdaten. */
  partner?: {
    name: string | null;
    /** Name laut Beleg, falls abweichend. */
    documentName?: string | null;
    vatId: string | null;
    /** Zahl bisheriger Buchungen — 0 heißt neu. */
    priorBookings: number;
    /** Konto, auf das sonst gebucht wird. */
    usualAccount: string | null;
    /** Betrag im Vormonat, wenn es einen gab. */
    lastMonthAmount: number | null;
  } | null;

  /* Kontext des Sachverhalts. */
  hasDocument: boolean;
  /** Zeitraum des Stapels — für den Leistungszeitraum. */
  period?: { from: string; to: string } | null;
  /** Erwartungen, die diese Zahlung ausgleichen sollte. */
  openItemRest?: number | null;
  /** Verdacht auf denselben Beleg an anderer Stelle. */
  duplicateOf?: string | null;
  /** Vorlage-Betrag der Konvention/Regel, wenn eine greift. */
  ruleAmount?: number | null;
  /** Schreibweise des Belegfelds, die dieser Mandant sonst nutzt. */
  belegfeldMuster?: string | null;
  /** Ist der Satz ein Storno? */
  reversesEntryId?: string | null;
  /** F268: Storno eines Satzes aus dem DATEV-Spiegel. */
  reversesMirrorEntryId?: string | null;
  reversalReason?: string | null;
  /** Kassenbestand nach diesem Satz, wenn eine Kasse betroffen ist. */
  kassenbestandNachher?: number | null;
}

/** Cent-Toleranz — Rundung darf keinen Prüfpunkt erzeugen. */
const TOLERANCE = 0.005;

/** Ab hier ist eine Anschaffung kein geringwertiges Wirtschaftsgut mehr. */
const GWG_GRENZE = 800;

/** Konten, auf denen ein Privatanteil sitzt (SKR03/04 Entnahmen/Einlagen). */
const PRIVAT_PRAEFIX = ["1800", "1890", "2100", "2130", "9600"];

/** Kontoklassen, auf denen ein Umsatz- oder Vorsteuerschlüssel zu erwarten ist. */
const TAX_RELEVANT_CLASSES: readonly string[] = [
  "revenue",
  "revenue_self_consumption",
  "material_expense",
  "other_operating_expense",
];

/**
 * Ergebniskonten — die Sachkonten, die P-KONTO mit dem üblichen Konto der
 * Gegenpartei vergleicht. Bank, Geldtransit, Verbindlichkeiten gehören nicht
 * dazu: eine reine Zahlung hat nichts zu vergleichen (Owner 2026-10-01).
 */
export const RESULT_ACCOUNT_CLASSES: readonly string[] = [
  ...TAX_RELEVANT_CLASSES,
  "personnel_expense",
  "other_expense_income",
];

/**
 * Liegt die Zeile in einer der Klassen? Mit Kontoklasse entscheidet die
 * Klasse: Gehälter und SKR04-3xxx (Verbindlichkeiten) tragen nie einen
 * BU-Schlüssel (Owner 2026-10-01). Ohne Klasse gilt die alte Ziffern-Regel
 * „ab 3". Personenkonten nie.
 */
/**
 * Ist der Satz überhaupt umsatzsteuerrelevant? Erst dann zählen P-UST, P-13B
 * und P-USTID (Owner 2026-10-01: „erst prüfen, ob eine Buchung überhaupt
 * steuerrelevant ist"). Relevant: ein Schlüssel ≠ 0, eine Steuerzeile oder ein
 * Konto einer steuerrelevanten Klasse (ohne Klasse die Ziffern-Regel). Eine
 * Zahlung Kreditor an Bank ist es nicht — auch wenn ihr Beleg § 13b ausweist.
 */
export function isTaxRelevantEntry(lines: PruefpunktInput["lines"]): boolean {
  return lines.some(
    (l) => (l.taxKey != null && l.taxKey !== "" && l.taxKey !== "0") || l.taxLine === true || inClasses(TAX_RELEVANT_CLASSES, l),
  );
}

/** Ist das Konto ein Ergebniskonto? Für das „übliche Konto" einer Gegenpartei — dieselbe Regel wie P-KONTO. */
export function isResultAccount(accountNumber: string | null, skrClass: string | null | undefined): boolean {
  return inClasses(RESULT_ACCOUNT_CLASSES, { accountNumber, accountingRole: null, skrClass });
}

function inClasses(
  classes: readonly string[],
  l: { accountNumber: string | null; accountingRole: string | null; skrClass?: string | null },
): boolean {
  if (l.accountingRole === "creditor" || l.accountingRole === "debtor") return false;
  if (l.skrClass) return classes.includes(l.skrClass);
  if (!l.accountNumber || !/^\d/.test(l.accountNumber)) return false;
  return l.accountNumber[0]! >= "3";
}

function p(
  code: PruefpunktCode,
  state: PruefpunktState,
  reason: string,
): Pruefpunkt {
  return { code, state, question: PRUEFPUNKT_FRAGE[code], reason, jump: SPRUNG[code] };
}

const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

export function derivePruefpunkte(input: PruefpunktInput): Pruefpunkt[] {
  const out: Pruefpunkt[] = [];
  const { lines, beleg, partner } = input;
  const isReversal =
    input.origin === "system_reversal" || input.reversesEntryId != null || input.reversesMirrorEntryId != null;

  /* — Der Satz selbst ————————————————————————————————————— */

  const soll = lines.filter((l) => l.side === "debit").reduce((s, l) => s + l.amount, 0);
  const haben = lines.filter((l) => l.side === "credit").reduce((s, l) => s + l.amount, 0);
  out.push(
    Math.abs(soll - haben) < TOLERANCE
      ? p("P-SUMME", "green", `Soll ${EUR.format(soll)} = Haben ${EUR.format(haben)}.`)
      : p("P-SUMME", "red", `Soll ${EUR.format(soll)} gegen Haben ${EUR.format(haben)}.`),
  );

  // F348: Die Umkehr bucht keinen Beleg, sie hebt einen Satz auf, der schon in
  // DATEV steht. Beleg-, Partner- und Periodenpunkte gehören an die Neubuchung —
  // gegen deren Beleg (selbes Ereignis, F263) wäre P-UST ein Fehlalarm.
  if (isReversal) {
    out.push(
      input.reversalReason
        ? p("P-STORNO", "green", `Storno mit Grund: ${input.reversalReason}`)
        : p("P-STORNO", "yellow", "Storno ohne Grund — im Protokoll bleibt offen, warum."),
    );
    out.push(p("P-JUDGE", "green", "Generalumkehr — spiegelt die Originalbuchung, keine KI-Prüfung."));
    return out;
  }

  // Steuerzeilen sind Folge der Sachzeilen — der gebuchte Betrag ist die
  // Sachseite ohne sie (§ 13b: 4964 8,66 + 1577 1,65 sind 8,66 gebucht).
  const sachzeilen = lines.filter((l) => !l.taxLine);
  const gebucht = Math.max(
    sachzeilen.filter((l) => l.side === "debit").reduce((s, l) => s + l.amount, 0),
    sachzeilen.filter((l) => l.side === "credit").reduce((s, l) => s + l.amount, 0),
  );
  if (!beleg || beleg.grossAmount == null) {
    out.push(p("P-BETRAG", "open", "Kein Belegbetrag hinterlegt — nicht vergleichbar."));
  } else if (Math.abs(beleg.grossAmount - gebucht) < TOLERANCE) {
    out.push(p("P-BETRAG", "green", `Beleg und Buchung stehen bei ${EUR.format(gebucht)}.`));
  } else {
    const diff = gebucht - beleg.grossAmount;
    out.push(
      p(
        "P-BETRAG",
        "red",
        `Der Beleg lautet über ${EUR.format(beleg.grossAmount)}, gebucht sind ${EUR.format(gebucht)} — ` +
          `Abweichung ${EUR.format(Math.abs(diff))}, es ist ${diff > 0 ? "zu viel" : "zu wenig"} gebucht.`,
      ),
    );
  }

  /* — Beleg und Belegfeld ————————————————————————————————— */

  const belegfelder = lines.map((l) => l.externalDocumentNumber).filter(Boolean) as string[];
  if (!beleg?.documentNumber) {
    out.push(p("P-BELEG", "open", "Auf dem Beleg ist keine Nummer erkannt."));
  } else if (belegfelder.some((b) => b.includes(beleg.documentNumber!) || beleg.documentNumber!.includes(b))) {
    out.push(p("P-BELEG", "green", `Belegnummer ${beleg.documentNumber} steht am Satz.`));
  } else {
    out.push(
      p("P-BELEG", "yellow", `Beleg trägt ${beleg.documentNumber}, gebucht ist ${belegfelder.join(", ") || "nichts"}.`),
    );
  }

  const personenOhneFeld = lines.filter(
    (l) => (l.accountingRole === "creditor" || l.accountingRole === "debtor") && !l.externalDocumentNumber,
  );
  out.push(
    personenOhneFeld.length === 0
      ? p("P-BELEGFELD", "green", "Jedes Personenkonto trägt ein Belegfeld 1.")
      : p(
          "P-BELEGFELD",
          "red",
          "Ohne Belegfeld 1 findet DATEV den offenen Posten später nicht wieder.",
        ),
  );

  if (input.belegfeldMuster == null) {
    // F123 §5: der Muster-Erkenner fehlt. Lieber offen als grün geraten.
    out.push(p("P-BELEGFELD-PERIODE", "open", "Für diesen Mandanten ist keine Schreibweise hinterlegt."));
  } else {
    const passt = belegfelder.every((b) => new RegExp(input.belegfeldMuster!).test(b));
    out.push(
      passt
        ? p("P-BELEGFELD-PERIODE", "green", `Folgt dem Muster ${input.belegfeldMuster}.`)
        : p("P-BELEGFELD-PERIODE", "yellow", `Weicht vom Muster ${input.belegfeldMuster} ab.`),
    );
  }

  /* — Konten ——————————————————————————————————————————————— */

  const sachkonten = lines.filter((l) => inClasses(RESULT_ACCOUNT_CLASSES, l));
  if (sachkonten.length === 0) {
    // Zahlung, Umbuchung Bank/Geldtransit an Personenkonto: kein Ergebniskonto,
    // also nichts mit dem üblichen Konto zu vergleichen — offen, ohne Punkte.
    out.push(p("P-KONTO", "open", "Zahlung ohne Sachkonto — kein Kontovergleich."));
    out.push(p("P-KONTO-NEU", "open", "Zahlung ohne Sachkonto — kein Kontovergleich."));
  } else if (!partner) {
    out.push(p("P-KONTO", "open", "Ohne Gegenpartei-Historie nicht vergleichbar."));
    out.push(p("P-KONTO-NEU", "open", "Ohne Kontenhistorie nicht feststellbar."));
  } else if (partner.usualAccount == null) {
    out.push(p("P-KONTO", "open", "Für diese Gegenpartei gibt es noch kein übliches Konto."));
    out.push(p("P-KONTO-NEU", partner.priorBookings === 0 ? "yellow" : "green",
      partner.priorBookings === 0
        ? "Erste Buchung auf dieses Konto bei dieser Gegenpartei."
        : `${partner.priorBookings} frühere Buchungen.`));
  } else {
    const wieSonst = sachkonten.some((l) => l.accountNumber === partner.usualAccount);
    out.push(
      wieSonst
        ? p("P-KONTO", "green", `Wie sonst bei dieser Gegenpartei: ${partner.usualAccount}.`)
        : p(
            "P-KONTO",
            "yellow",
            `Sonst ${partner.usualAccount}, hier ${sachkonten.map((l) => l.accountNumber).join(", ")}.`,
          ),
    );
    out.push(
      wieSonst
        ? p("P-KONTO-NEU", "green", "Konto ist für diese Gegenpartei nicht neu.")
        : p("P-KONTO-NEU", "yellow", "Konto wird bei dieser Gegenpartei erstmals bebucht."),
    );
  }

  /* — Gegenpartei ——————————————————————————————————————————— */

  if (!partner) {
    out.push(p("P-PARTNER", "open", "Keine Gegenpartei am Sachverhalt."));
    out.push(p("P-PARTNER-NEU", "open", "Keine Gegenpartei am Sachverhalt."));
  } else {
    const abweichend =
      partner.documentName != null &&
      partner.name != null &&
      partner.documentName.trim().toLowerCase() !== partner.name.trim().toLowerCase();
    out.push(
      abweichend
        ? p("P-PARTNER", "yellow", `Beleg nennt „${partner.documentName}", gebucht auf „${partner.name}".`)
        : p("P-PARTNER", "green", `Gegenpartei ${partner.name ?? "—"} stimmt mit dem Beleg überein.`),
    );
    out.push(
      partner.priorBookings === 0
        ? p("P-PARTNER-NEU", "yellow", "Diese Gegenpartei taucht zum ersten Mal auf.")
        : p("P-PARTNER-NEU", "green", `${partner.priorBookings} frühere Buchungen.`),
    );
  }

  /* — Umsatzsteuer ————————————————————————————————————————— */

  // Personalaufwand ist Ergebniskonto (P-KONTO vergleicht es), aber nicht
  // umsatzsteuerrelevant — ein reiner Gehaltssatz fällt unten unter
  // `isTaxRelevantEntry` und steht offen, ohne Punkte.
  const ustKonten = lines.filter((l) => inClasses(TAX_RELEVANT_CLASSES, l));
  const ohneSchluessel = ustKonten.filter((l) => !l.taxKey && l.automaticTaxRate == null);
  // § 13b / igE: der Beleg weist keine Steuer aus, die entsteht erst beim
  // Mandanten über den Schlüssel (94/95/19 …). Der Vergleich Belegsatz gegen
  // Kontosatz der Steuerzeilen (0 % gegen 19 %) ist dann kein Befund — ob der
  // Schlüssel zum Beleg passt, prüft P-13B.
  const umkehrSchluessel = sachzeilen
    .map((l) => l.taxKey)
    .filter((k): k is string => {
      const g = taxKeyEntry(k)?.group;
      return g === "reverse_charge" || g === "intra_community";
    });
  if (umkehrSchluessel.length > 0 && beleg?.vatRatePercent != null && beleg.vatRatePercent < 0.01) {
    out.push(
      p(
        "P-UST",
        "green",
        `Der Beleg weist keine Umsatzsteuer aus; die Steuer entsteht beim Mandanten über Schlüssel ${[...new Set(umkehrSchluessel)].join(", ")} (Umkehr der Steuerschuld).`,
      ),
    );
  } else if (!beleg) {
    // Ohne Beleg kein Vorsteuerabzug — „kein Schlüssel" ist dann richtig
    // (Owner 2026-10-01: P-UST nur bei Aufwand + Beleg). Die Umkehr
    // „Schlüssel ohne Beleg" steht als P47 offen.
    out.push(p("P-UST", "open", "Kein Beleg — Umsatzsteuer hier nicht zu prüfen."));
  } else if (beleg.vatRatePercent == null) {
    out.push(
      ohneSchluessel.length > 0
        ? p("P-UST", "yellow", `Erfolgskonto ohne Steuerschlüssel: ${ohneSchluessel.map((l) => l.accountNumber).join(", ")}.`)
        : p("P-UST", "open", "Auf dem Beleg ist kein Steuersatz erkannt — nicht vergleichbar."),
    );
  } else {
    // F198: eine Automatikkonto-Zeile trägt keinen Satz — der steht am Konto
    // (R9). Ohne ihn stand P-UST bei jeder korrekten Automatikkonto-Buchung rot
    // und sperrte die Freigabe.
    const gebuchteSaetze = [
      ...new Set(
        sachzeilen.map((l) => l.taxRatePercent ?? l.automaticTaxRate ?? null).filter((r): r is number => r != null),
      ),
    ];
    // Beleg ohne Steuer und Satz ohne Steuersatz passen zusammen.
    const passt =
      gebuchteSaetze.length > 0
        ? gebuchteSaetze.every((r) => Math.abs(r - beleg.vatRatePercent!) < 0.01)
        : beleg.vatRatePercent < 0.01;
    // Mischbeleg: der Satz fällt aus den Summen, und ein steuerfreier Teil
    // drückt ihn (Verifone 001-3338282: ec-cash-Entgelt 14,40 steuerfrei neben
    // 133,96 zu 19 % → 16,8 %). Dann trägt die Steuer, nicht der Satz: stimmt
    // die gebuchte Steuer (Brutto × r/(100+r) je Zeile) mit der ausgewiesenen,
    // passt der Schlüssel.
    // ponytail: Seiten werden nicht verrechnet — eine Gutschriftzeile mit
    // Schlüssel im selben Satz zählt mit statt gegen; erst bei Realfall saldieren.
    const steuerZeilen = sachzeilen.filter((l) => (l.taxRatePercent ?? l.automaticTaxRate ?? 0) > 0);
    const gebuchteSteuer = steuerZeilen.reduce((s, l) => {
      const r = (l.taxRatePercent ?? l.automaticTaxRate)!;
      return s + (l.amount * r) / (100 + r);
    }, 0);
    const steuerPasst =
      !passt &&
      beleg.taxAmount != null &&
      steuerZeilen.length > 0 &&
      // Ein Cent Rundung je Zeile.
      Math.abs(gebuchteSteuer - beleg.taxAmount) < 0.01 * steuerZeilen.length + TOLERANCE;
    out.push(
      passt
        ? p("P-UST", "green", `Beleg und Buchung stehen bei ${beleg.vatRatePercent} %.`)
        : steuerPasst
          ? p(
              "P-UST",
              "green",
              `Mischbeleg: gebuchte Steuer ${EUR.format(gebuchteSteuer)} (${gebuchteSaetze.join(" / ")} %) entspricht der ausgewiesenen ${EUR.format(beleg.taxAmount!)}.`,
            )
          : p(
              "P-UST",
              "red",
              gebuchteSaetze.length > 0
                ? `Der Beleg weist ${beleg.vatRatePercent} % Umsatzsteuer aus, gebucht ist ein Steuersatz von ${gebuchteSaetze.join(" / ")} %.`
                : `Der Beleg weist ${beleg.vatRatePercent} % Umsatzsteuer aus, gebucht ist kein Steuersatz.`,
            ),
    );
  }

  if (beleg?.reverseCharge == null) {
    out.push(p("P-13B", "open", "Ob § 13b greift, ist am Beleg nicht vermerkt."));
  } else if (!beleg.reverseCharge) {
    out.push(p("P-13B", "green", "Kein Fall der Steuerschuldumkehr."));
  } else {
    const hat13b = lines.some((l) => l.taxKey === "94" || l.taxKey === "40");
    out.push(
      hat13b
        ? p("P-13B", "green", "Steuerschuldumkehr ist mit dem passenden Schlüssel gebucht.")
        : p("P-13B", "red", "Der Beleg weist § 13b aus, der Satz bucht ohne den Schlüssel."),
    );
  }

  const igErwerb = lines.some((l) => l.taxKey === "19" || l.taxKey === "18");
  if (!igErwerb) {
    out.push(p("P-USTID", "green", "Kein innergemeinschaftlicher Bezug."));
  } else if (partner?.vatId) {
    out.push(p("P-USTID", "green", `USt-IdNr. ${partner.vatId} liegt vor.`));
  } else {
    out.push(p("P-USTID", "red", "Innergemeinschaftlicher Bezug ohne USt-IdNr. der Gegenpartei."));
  }

  // Nicht steuerrelevant: die drei USt-Punkte offen statt eines Befunds — ohne
  // Punkte im Prüfbedarf.
  if (!isTaxRelevantEntry(lines)) {
    for (let i = 0; i < out.length; i++) {
      const code = out[i]!.code;
      if (code === "P-UST" || code === "P-13B" || code === "P-USTID") {
        out[i] = p(code, "open", "Keine umsatzsteuerrelevante Buchung — keine USt-Prüfung.");
      }
    }
  }

  if (beleg?.recipientMatches == null) {
    out.push(p("P-EMPFAENGER", "open", "Der Rechnungsempfänger ist nicht ausgelesen."));
  } else {
    out.push(
      beleg.recipientMatches
        ? p("P-EMPFAENGER", "green", "Der Beleg lautet auf den Mandanten.")
        : p("P-EMPFAENGER", "red", "Der Beleg lautet auf jemand anderen — Betriebsausgabe fraglich."),
    );
  }

  /* — Periode, Ausgleich, Dublette ————————————————————————— */

  if (!beleg?.servicePeriodFrom || !input.period) {
    out.push(p("P-LEISTUNG", "open", "Kein Leistungszeitraum am Beleg."));
  } else {
    const drin =
      beleg.servicePeriodFrom <= input.period.to &&
      (beleg.servicePeriodTo ?? beleg.servicePeriodFrom) >= input.period.from;
    out.push(
      drin
        ? p("P-LEISTUNG", "green", `Leistung ab ${beleg.servicePeriodFrom} liegt im Zeitraum.`)
        : p("P-LEISTUNG", "yellow", `Leistung ${beleg.servicePeriodFrom} liegt außerhalb von ${input.period.from}–${input.period.to}.`),
    );
  }

  if (input.openItemRest == null) {
    out.push(p("P-AUSGLEICH", "open", "Kein offener Posten zugeordnet."));
  } else if (Math.abs(input.openItemRest) < TOLERANCE) {
    out.push(p("P-AUSGLEICH", "green", "Der offene Posten geht auf null auf."));
  } else {
    out.push(p("P-AUSGLEICH", "yellow", `Rest ${EUR.format(input.openItemRest)} bleibt stehen.`));
  }

  out.push(
    input.duplicateOf
      ? p("P-DUBLETTE", "red", `Derselbe Beleg liegt schon an ${input.duplicateOf}.`)
      : p("P-DUBLETTE", "green", "Kein zweiter Beleg mit denselben Merkmalen."),
  );

  /* — Regel und Vormonat ——————————————————————————————————— */

  if (input.ruleAmount == null) {
    out.push(p("P-REGEL-BETRAG", "open", "Für diesen Sachverhalt greift keine Regel."));
  } else if (Math.abs(input.ruleAmount - gebucht) < TOLERANCE) {
    out.push(p("P-REGEL-BETRAG", "green", `Wie in der Regel hinterlegt: ${EUR.format(input.ruleAmount)}.`));
  } else {
    out.push(
      p("P-REGEL-BETRAG", "yellow", `Regel sagt ${EUR.format(input.ruleAmount)}, gebucht ${EUR.format(gebucht)}.`),
    );
  }

  if (partner?.lastMonthAmount == null) {
    out.push(p("P-VORMONAT", "open", "Im Vormonat gab es hier keine Buchung."));
  } else if (Math.abs(partner.lastMonthAmount - gebucht) < TOLERANCE) {
    out.push(p("P-VORMONAT", "green", `Wie im Vormonat: ${EUR.format(partner.lastMonthAmount)}.`));
  } else {
    out.push(
      p("P-VORMONAT", "yellow", `Vormonat ${EUR.format(partner.lastMonthAmount)}, jetzt ${EUR.format(gebucht)}.`),
    );
  }

  /* — Sonderfälle ————————————————————————————————————————— */

  const anlage = lines.find((l) => l.accountNumber?.startsWith("0") && l.side === "debit");
  if (!anlage) {
    out.push(p("P-GWG", "green", "Keine Anlagenbuchung."));
  } else if (anlage.amount <= GWG_GRENZE) {
    out.push(p("P-GWG", "yellow", `${EUR.format(anlage.amount)} liegt unter ${GWG_GRENZE} € — als GWG sofort abziehbar?`));
  } else {
    out.push(p("P-GWG", "green", `${EUR.format(anlage.amount)} über der GWG-Grenze — planmäßige Abschreibung.`));
  }

  const privat = lines.filter((l) => PRIVAT_PRAEFIX.some((pre) => l.accountNumber?.startsWith(pre)));
  out.push(
    privat.length > 0
      ? p("P-PRIVAT", "green", `Privatanteil ist auf ${privat.map((l) => l.accountNumber).join(", ")} gebucht.`)
      : p("P-PRIVAT", "green", "Kein Privatanteil erkennbar."),
  );

  if (input.kassenbestandNachher == null) {
    out.push(p("P-KASSE", "green", "Keine Kasse betroffen."));
  } else if (input.kassenbestandNachher >= 0) {
    out.push(p("P-KASSE", "green", `Kassenbestand danach ${EUR.format(input.kassenbestandNachher)}.`));
  } else {
    out.push(
      p("P-KASSE", "red", `Kassenbestand wäre ${EUR.format(input.kassenbestandNachher)} — eine Kasse kann nicht negativ sein.`),
    );
  }

  const fremdwaehrung = beleg?.currency != null && beleg.currency !== "EUR";
  out.push(
    fremdwaehrung
      ? p("P-FX", "yellow", `Beleg lautet auf ${beleg!.currency} — Umrechnungskurs prüfen.`)
      : p("P-FX", "green", "Beleg in Euro."),
  );

  out.push(p("P-STORNO", "green", "Kein Storno."));

  /* — Der Judge ——————————————————————————————————————————— */

  if (input.judgeVerdict === "flag") {
    out.push(
      p(
        "P-JUDGE",
        "red",
        [input.judgeReasoning, input.judgeCriteria.join(", ")].filter(Boolean).join(" · ") ||
          "Der Judge hat den Satz beanstandet.",
      ),
    );
  } else if (input.judgeVerdict === "adjust") {
    out.push(p("P-JUDGE", "yellow", input.judgeReasoning ?? "Der Judge hat den Satz korrigiert."));
  } else if (input.judgeVerdict === "confirm_with_note") {
    out.push(p("P-JUDGE", "yellow", input.judgeReasoning ?? "Bestätigt mit Hinweis."));
  } else if (input.judgeVerdict === "confirm") {
    out.push(p("P-JUDGE", "green", input.judgeReasoning ?? "Judge bestätigt."));
  } else if (input.origin === "client_import") {
    out.push(p("P-JUDGE", "green", "Vom Mandanten selbst gebucht — kein Vorschlag von Ludwig."));
  } else {
    out.push(p("P-JUDGE", "open", "Kein Judge-Verdikt — ungeprüft ist nicht dasselbe wie unauffällig."));
  }

  return out;
}

/** Was vor der Freigabe angesehen werden muss. */
export function openPruefpunkte(points: readonly Pruefpunkt[]): Pruefpunkt[] {
  return points.filter((p) => p.state === "red" || p.state === "yellow");
}

/** Der Satz kommt so nicht durch — rote Punkte blockieren die Freigabe. */
export function blockingPruefpunkte(points: readonly Pruefpunkt[]): Pruefpunkt[] {
  return points.filter((p) => p.state === "red");
}
