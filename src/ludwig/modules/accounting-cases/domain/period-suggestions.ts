/**
 * Zeitraum-Vorschläge & Stapelname für den DATEV-Export-Wizard (Schritt 1).
 *
 * Rein und deterministisch: alle Funktionen bekommen ihr Bezugsdatum
 * hereingereicht (kein `new Date()` im Modul), damit sie testbar sind. Der
 * Wizard reicht `new Date()` als Bezug durch; Tests fixieren es.
 *
 * Vier Modi — gespiegelt am Buchungsintervall des Mandanten (booking_interval):
 *   - `month`:   Kalendermonat (erster..letzter Tag), Stapelname `MM-YYYY-Ludwig`.
 *   - `week`:    ISO-8601-Kalenderwoche (Mo..So), Stapelname `KW<nn>-<GJ>-Ludwig`.
 *   - `quarter`: Kalenderquartal, Stapelname `Q<n>-YYYY-Ludwig`.
 *   - `year`:    Kalenderjahr, Stapelname `YYYY-Ludwig`.
 *
 * ISO-Woche = deutsche KW: Woche 1 ist die Woche mit dem ersten Donnerstag des
 * Jahres (äquivalent: die Woche, die den 4. Januar enthält). Das ISO-„Jahr"
 * einer Woche kann am Jahreswechsel vom Kalenderjahr abweichen (z. B. gehört
 * der 2027-01-01 noch zu KW53-2026) — deshalb trägt der Wochen-Stapelname das
 * ISO-Jahr, nicht das Kalenderjahr des Montags.
 */

export type ExportPeriodMode = "month" | "week" | "quarter" | "year";

export interface ExportPeriod {
  mode: ExportPeriodMode;
  /** ISO YYYY-MM-DD (inklusive). */
  from: string;
  /** ISO YYYY-MM-DD (inklusive). */
  to: string;
  /** Menschlesbares Label für die Auswahl-Buttons, z. B. "August 2026" / "KW31 2026". */
  label: string;
  /** Abgeleiteter Stapelname (`note` am Stapel), z. B. "08-2026-Ludwig". */
  batchName: string;
}

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

const pad2 = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) =>
  `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;

/** 0 = Montag … 6 = Sonntag (JS `getUTCDay()` hat Sonntag=0). */
function isoDow(d: Date): number {
  return (d.getUTCDay() + 6) % 7;
}

/** Kalendermonat als ExportPeriod (year, month 1-basiert). */
export function monthPeriod(year: number, month: number): ExportPeriod {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0)); // Tag 0 des Folgemonats = letzter Tag
  return {
    mode: "month",
    from: iso(first),
    to: iso(last),
    label: `${MONTH_NAMES[month - 1]} ${year}`,
    batchName: `${pad2(month)}-${year}-Ludwig`,
  };
}

/**
 * ISO-Woche als ExportPeriod (isoYear = ISO-Jahr der Woche, week 1..53).
 * Montag..Sonntag. Der Stapelname nutzt das ISO-Jahr.
 */
export function weekPeriod(isoYear: number, week: number): ExportPeriod {
  // Montag der ISO-Woche 1: der 4. Januar liegt immer in Woche 1.
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const week1Monday = new Date(jan4);
  week1Monday.setUTCDate(jan4.getUTCDate() - isoDow(jan4));
  const monday = new Date(week1Monday);
  monday.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    mode: "week",
    from: iso(monday),
    to: iso(sunday),
    label: `KW${week} ${isoYear}`,
    batchName: `KW${week}-${isoYear}-Ludwig`,
  };
}

/** Kalenderquartal als ExportPeriod (quarter 1..4). */
export function quarterPeriod(year: number, quarter: number): ExportPeriod {
  const firstMonth = (quarter - 1) * 3; // 0-basiert
  const first = new Date(Date.UTC(year, firstMonth, 1));
  const last = new Date(Date.UTC(year, firstMonth + 3, 0));
  return {
    mode: "quarter",
    from: iso(first),
    to: iso(last),
    label: `Q${quarter} ${year}`,
    batchName: `Q${quarter}-${year}-Ludwig`,
  };
}

/** Kalenderjahr als ExportPeriod. */
export function yearPeriod(year: number): ExportPeriod {
  return {
    mode: "year",
    from: `${year}-01-01`,
    to: `${year}-12-31`,
    label: String(year),
    batchName: `${year}-Ludwig`,
  };
}

/** ISO-Jahr + Wochennummer eines Datums (deutsche KW). */
export function isoWeekOf(date: Date): { isoYear: number; week: number } {
  // Auf den Donnerstag derselben Woche schieben → dessen Jahr = ISO-Jahr,
  // Wochennummer = (Tag-des-Jahres des Donnerstags) / 7, aufgerundet.
  const thursday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  thursday.setUTCDate(thursday.getUTCDate() - isoDow(thursday) + 3);
  const isoYear = thursday.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - isoDow(firstThursday) + 3);
  const week = 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return { isoYear, week };
}

/**
 * Die letzten `n` abgeschlossenen Monate VOR dem Monat von `ref` — neuester
 * (= Vormonat) zuerst. Default-Vorauswahl des Wizards ist damit `[0]`.
 */
export function monthSuggestions(ref: Date, n: number): ExportPeriod[] {
  const out: ExportPeriod[] = [];
  let year = ref.getUTCFullYear();
  let month = ref.getUTCMonth() + 1; // aktueller Monat 1-basiert
  for (let i = 0; i < n; i++) {
    month -= 1;
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    out.push(monthPeriod(year, month));
  }
  return out;
}

/**
 * Die letzten `n` abgeschlossenen ISO-Wochen VOR der Woche von `ref` — neueste
 * (= Vorwoche) zuerst.
 */
export function weekSuggestions(ref: Date, n: number): ExportPeriod[] {
  const out: ExportPeriod[] = [];
  // Montag der aktuellen Woche als Anker, dann jeweils 7 Tage zurück.
  const monday = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - isoDow(monday));
  for (let i = 0; i < n; i++) {
    monday.setUTCDate(monday.getUTCDate() - 7);
    const { isoYear, week } = isoWeekOf(monday);
    out.push(weekPeriod(isoYear, week));
  }
  return out;
}

/**
 * Die letzten `n` abgeschlossenen Kalenderquartale VOR dem Quartal von `ref` —
 * neuestes zuerst.
 */
export function quarterSuggestions(ref: Date, n: number): ExportPeriod[] {
  const out: ExportPeriod[] = [];
  let year = ref.getUTCFullYear();
  let quarter = Math.floor(ref.getUTCMonth() / 3) + 1; // aktuelles Quartal 1..4
  for (let i = 0; i < n; i++) {
    quarter -= 1;
    if (quarter === 0) {
      quarter = 4;
      year -= 1;
    }
    out.push(quarterPeriod(year, quarter));
  }
  return out;
}

/** Die letzten `n` abgeschlossenen Kalenderjahre VOR dem Jahr von `ref` — neuestes zuerst. */
export function yearSuggestions(ref: Date, n: number): ExportPeriod[] {
  const out: ExportPeriod[] = [];
  for (let i = 1; i <= n; i++) out.push(yearPeriod(ref.getUTCFullYear() - i));
  return out;
}

/**
 * Zeitraum der **Nachzügler** zu einem Stapel-Start: Wirtschaftsjahr-Anfang bis
 * zum Tag VOR `from`. Das sind die Buchungen, die vor dem gewählten Zeitraum
 * liegen und noch in keinem Stapel sind — typisch die Rechnung, die erst nach
 * dem Monatsexport hereinkam und wegen der USt-Meldung trotzdem raus muss.
 *
 * `null`, wenn `from` der 1.1. ist (davor liegt nichts im selben Jahr).
 * Kalenderjahr = Wirtschaftsjahr, wie der EXTF-Builder es erzwingt (from/to im
 * selben Jahr) — Nachzügler aus früheren Jahren brauchen einen eigenen Stapel.
 */
export function carryOverRange(from: string): { from: string; to: string } | null {
  const dayBefore = new Date(`${from}T00:00:00Z`);
  dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
  const yearStart = `${from.slice(0, 4)}-01-01`;
  const to = iso(dayBefore);
  return to < yearStart ? null : { from: yearStart, to };
}

/**
 * Stapelname für einen frei gewählten Zeitraum, abgeleitet aus dem `from`
 * (Monat / ISO-Woche / Quartal / Jahr des Starttags). Für krumme Zeiträume
 * (die Vorschläge liefern immer glatte) trotzdem stabil.
 */
export function batchNameForPeriod(mode: ExportPeriodMode, from: string): string {
  const d = new Date(`${from}T00:00:00Z`);
  if (mode === "week") {
    const { isoYear, week } = isoWeekOf(d);
    return `KW${week}-${isoYear}-Ludwig`;
  }
  if (mode === "quarter") return `Q${Math.floor(d.getUTCMonth() / 3) + 1}-${d.getUTCFullYear()}-Ludwig`;
  if (mode === "year") return `${d.getUTCFullYear()}-Ludwig`;
  return `${pad2(d.getUTCMonth() + 1)}-${d.getUTCFullYear()}-Ludwig`;
}

/**
 * Freie Stapelbezeichnung zum Wunschnamen. Ist er frei, bleibt er; sonst wird gezählt
 * („06-2026-Ludwig" → „06-2026-Ludwig-2"). Ein schon gezählter Name zählt weiter statt
 * zu schachteln — aus „…-2" wird „…-3", nie „…-2-2".
 */
export function nextFreeDescription(wanted: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  if (!used.has(wanted)) return wanted;
  const base = wanted.replace(/-\d+$/, "");
  let n = 2;
  while (used.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}
