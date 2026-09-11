/**
 * Vergleichs-Engine (F118 B2) — „sieht der Monat aus wie sonst?"
 *
 * Leitprinzip 6 des Reviews: **vergleichen statt raten**. „Ist das plausibel?"
 * heißt immer: gegen die letzten drei Monate. Die Abweichung steht in Prozent
 * gegen den Drei-Monats-Schnitt, und die Rechnung ist im Tooltip nachlesbar —
 * sonst ist die Zahl ein Orakel.
 *
 * Rein und ohne IO: die Funktion bekommt vier Monatswerte und sagt, ob die
 * Zeile auffällt. Was gemessen wird (Beträge oder Stückzahlen), entscheidet
 * die Schwelle.
 */

export type ComparisonKind =
  /** Beträge in Euro — Schwelle absolut UND relativ. */
  | "amount"
  /** Stückzahlen (Belege, Zeilen) — nur relativ. */
  | "count";

export interface ComparisonInput {
  /** Der Monat vor drei Monaten. `null` = es gab ihn noch nicht. */
  m3: number | null;
  m2: number | null;
  m1: number | null;
  current: number;
}

export interface Comparison extends ComparisonInput {
  /** Schnitt über die vorhandenen Vormonate; `null`, wenn keiner da ist. */
  avg: number | null;
  /** Abweichung gegen den Schnitt in Prozent; `null` ohne Schnitt. */
  deviationPct: number | null;
  flagged: boolean;
  /**
   * Warum die Zeile (nicht) auffällt — der Tooltip. Immer gefüllt, damit die
   * Nutzerin nie vor einer Zahl ohne Erklärung steht.
   */
  explanation: string;
  /**
   * Weniger als zwei Vormonate: ein Vergleich wäre Behauptung, keine
   * Aussage. Die Zeile wird nicht markiert, aber auch nicht stillschweigend
   * als unauffällig gezeigt.
   */
  tooYoung: boolean;
}

/** Die Voreinstellung aus dem Brief. Je Mandant konfigurierbar: nicht in v1. */
export const COMPARISON_THRESHOLDS = {
  amount: { relative: 0.5, absolute: 500 },
  count: { relative: 0.3, absolute: 0 },
} as const;

const PCT = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
const NUM = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });

export function compare(input: ComparisonInput, kind: ComparisonKind): Comparison {
  const prior = [input.m3, input.m2, input.m1].filter((v): v is number => v != null);
  const tooYoung = prior.length < 2;

  if (prior.length === 0) {
    return {
      ...input,
      avg: null,
      deviationPct: null,
      flagged: false,
      tooYoung: true,
      explanation: "Kein Vormonat vorhanden — es gibt nichts zu vergleichen.",
    };
  }

  const avg = prior.reduce((s, v) => s + v, 0) / prior.length;
  const delta = input.current - avg;

  // Ein Schnitt von null lässt sich nicht prozentual schlagen. „Erstmals
  // bebucht" ist trotzdem eine Aussage — und zwar eine, die man sehen will.
  if (avg === 0) {
    const flagged = !tooYoung && input.current !== 0;
    return {
      ...input,
      avg,
      deviationPct: null,
      flagged,
      tooYoung,
      explanation:
        input.current === 0
          ? "In keinem der Monate bebucht."
          : `Erstmals bebucht: ${NUM.format(input.current)} gegen bisher nichts.`,
    };
  }

  const deviationPct = (delta / Math.abs(avg)) * 100;
  const schwelle = COMPARISON_THRESHOLDS[kind];
  const relativeHit = Math.abs(deviationPct) >= schwelle.relative * 100;
  const absoluteHit = Math.abs(delta) >= schwelle.absolute;
  const flagged = !tooYoung && relativeHit && absoluteHit;

  const rechnung =
    `${NUM.format(input.current)} gegen Ø ${NUM.format(avg)} aus ${prior.length} ` +
    `Vormonat${prior.length === 1 ? "" : "en"} = ${deviationPct > 0 ? "+" : ""}` +
    `${PCT.format(deviationPct)} %`;

  return {
    ...input,
    avg,
    deviationPct,
    flagged,
    tooYoung,
    explanation: tooYoung
      ? `${rechnung} — nur ein Vormonat, deshalb keine Bewertung.`
      : flagged
        ? `${rechnung} — über der Schwelle (${schwelle.relative * 100} %` +
          (schwelle.absolute > 0 ? ` und ${schwelle.absolute}` : "") +
          `).`
        : `${rechnung} — im Rahmen.`,
  };
}

/** Auffällige zuerst, dann nach Größe der Abweichung. */
export function sortByAuffaelligkeit<T extends { vergleich: Comparison }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    if (a.vergleich.flagged !== b.vergleich.flagged) return a.vergleich.flagged ? -1 : 1;
    return Math.abs(b.vergleich.deviationPct ?? 0) - Math.abs(a.vergleich.deviationPct ?? 0);
  });
}

/**
 * Die Farbstufe einer Abweichung — **die** Quelle der Skala (L7).
 *
 * Vier Stufen statt zwei: bis 15 % ist Rauschen, bis 50 % auffällig, bis
 * 100 % deutlich, darüber ist es ein anderer Monat. Die Schwellen stehen hier
 * und nirgends sonst; das CSS kennt nur Tonnamen, nicht die Prozentwerte.
 */
export type AbweichungsTon = "neutral" | "warning" | "warning-strong" | "danger";

export const ABWEICHUNGS_STUFEN = [15, 50, 100] as const;

export function deviationTone(deviationPct: number | null): AbweichungsTon {
  if (deviationPct === null) return "neutral";
  const abs = Math.abs(deviationPct);
  if (abs <= ABWEICHUNGS_STUFEN[0]) return "neutral";
  if (abs <= ABWEICHUNGS_STUFEN[1]) return "warning";
  if (abs <= ABWEICHUNGS_STUFEN[2]) return "warning-strong";
  return "danger";
}

/**
 * Die vier Spaltenköpfe des Vergleichs: M-3, M-2, M-1, laufender Monat.
 *
 * Feste Zeitzone, weil `timestamptz::text` UTC liefert und ein Monatswechsel
 * sonst um zwei Stunden danebenliegt.
 */
export function monatsKuerzel(period: string): [string, string, string, string] {
  const [y, m] = period.split("-").map(Number);
  const fmt = new Intl.DateTimeFormat("de-DE", { month: "short", timeZone: "Europe/Berlin" });
  const k = (off: number) => fmt.format(new Date(Date.UTC(y!, (m ?? 1) - 1 - off, 15)));
  return [k(3), k(2), k(1), k(0)];
}

/**
 * Ein Sachkonto mit seinem Monatsvergleich — die Zeile von Schritt 6.
 *
 * Der Typ steht in der Domäne und nicht bei der Query, damit reine Funktionen
 * (`mergeBatchContribution`) ihn benutzen können, ohne die Application-Schicht
 * mit ihrem `server-only` zu importieren.
 */
export interface AccountComparison {
  accountNumber: string;
  accountName: string | null;
  /** `expense` / `revenue` / `creditor` / … — für Gruppierung und Filter. */
  accountingRole: string | null;
  /**
   * Was **Ludwig** selbst festgeschrieben hat — dieselben vier Monate, über
   * alle Stapel. Nur `accepted`: ein Vorschlag ist Arbeitsstand, kein Ist.
   * `null` heißt „in dem Monat keine Zeile", nicht „null Euro".
   */
  ludwig: { m3: number | null; m2: number | null; m1: number | null; current: number };
  /** Was der **DATEV**-Spiegel im laufenden Monat trägt. */
  datevCurrent: number;
  /**
   * Ø der DATEV-Vormonate gegen den Ludwig-Wert des laufenden Monats.
   * `m3`/`m2`/`m1`/`avg` sind damit DATEV, `current` ist Ludwig — die beiden
   * Seiten der einen Frage „buchen wir den Monat wie sonst?".
   */
  vergleich: Comparison;
}

/**
 * Was der laufende Stapel je Konto **vorschlägt** (F197).
 *
 * Getrennt vom Ist-Saldo: `amount` summiert nur Sätze mit `status='proposed'`
 * aus diesem Stapel, Soll positiv wie im Monatsvergleich.
 */
export interface BatchContribution {
  accountNumber: string;
  accountName: string | null;
  accountingRole: string | null;
  amount: number;
}
