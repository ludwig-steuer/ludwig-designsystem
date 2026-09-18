/**
 * „Ist alles da?" als drei aufklappbare Zeilen (F109-1).
 *
 * Rein und ohne IO: die Funktion bekommt die beiden Gate-Ergebnisse des
 * Agenten (1a Kontoauszüge, 3f Belege) und schneidet sie in die drei Fragen,
 * die die Kanzlei tatsächlich stellt — Belege **dieser** Periode, Belege
 * **einschließlich Vorperioden**, Kontoauszüge. Die Gates bleiben die Quelle;
 * hier wird nur geteilt und eingefärbt, nie neu gerechnet.
 *
 * Farbe kodiert Kritikalität (A7), nicht Menge:
 *  - **rot** — offene Posten, die diesen Stapel blockieren.
 *  - **gelb** — offen, aber nicht aus dieser Periode (Altlast) bzw. ein
 *    Gate-Hinweis ohne Blocker (ruhendes Zahlungskonto).
 *  - **grün** — nichts offen.
 *
 * Deckungslücken kommen über `deckungsluecke.ts` in Worte (F141) — derselbe
 * Satz, den Schritt 8 zeigt.
 *
 * Hinter der Gesamtzeile stehen die Belege, die **nach** dem Zeitraum datiert
 * sind (F203). Gate 3f liefert sie nicht — für diesen Stapel zählen sie nicht,
 * deshalb gelb, nie rot. Gehört einer doch hinein, ist sein Belegdatum falsch.
 *
 * Die letzte Zeile kommt nicht aus einem Gate: Belege, die **ohne Buchung**
 * erledigt wurden. Für die Gates sind sie fertig — genau deshalb sieht sie
 * sonst niemand mehr, und genau deshalb stehen sie hier (gelb, nie rot).
 *
 * Dazwischen stehen die zwei Fragen je Bank-Umsatz (F187): hat er einen
 * Sachverhalt, hat er einen Buchungsvorschlag? Gate 2a beantwortet nur die
 * erste; die zweite hatte bis dahin niemand gestellt, und ein Umsatz mit
 * offener Klärung fiel aus jedem Zähler heraus. Hier ist die Klärung gelb —
 * sie ist die Arbeit, die gerade läuft; Schritt 8 ist trotzdem rot, denn
 * freigegeben wird nur ein voll gebuchtes Bankkonto.
 */

import { belegAnzeigename } from "@/ludwig/modules/source-docs";


export type ReadinessState = "open" | "notice" | "ok";

export interface ReadinessItem {
  key: string;
  /** Ziel für den Sprung in die Beleg-Ansicht; null bei Kontoauszügen. */
  sourceDocId: string | null;
  /** Ziel für den Sprung in den Kontoauszug-Drawer; null bei Belegen. */
  bankTransactionId?: string | null;
  label: string;
  /** Belegdatum, ISO; null wo es keins gibt. */
  datum: string | null;
  problem: string;
  /** Ein Gate-Hinweis ohne Blocker steht in derselben Liste, aber gelb. */
  hinweis: boolean;
}

export interface ReadinessRow {
  key:
    | "documents_period"
    | "documents_before_period"
    | "documents_after_period"
    | "transactions_case"
    | "transactions_proposal"
    | "unbooked";
  label: string;
  /** Was die Zeile prüft — ein Satz, sichtbar unter dem Label (F220, kein Tooltip). */
  hint: string;
  stand: ReadinessState;
  /** „6 offen" bzw. „vollständig" — rechts in der Zeile. */
  standText: string;
  /** Was im aufgeklappten Zustand steht, wenn nichts offen ist. */
  leerText: string;
  punkte: ReadinessItem[];
  /** Über dem Listen-Deckel des Gates: so viele Posten fehlen in der Liste. */
  nichtGelistet: number;
}

/** Was die Funktion aus einem `StepGateStatus` braucht — mehr nicht. */
export interface GateEingang {
  openCount: number;
  open: Array<Record<string, unknown>>;
  warnings?: Array<Record<string, unknown>>;
}

/**
 * Was die Funktion aus `loadBankBookingCoverage` braucht — strukturell, nicht
 * als Import: die Domain zieht nichts aus `bank-transactions` (Deep-Import-
 * Regel), und die Query-Struktur erfüllt diese Form.
 */
export interface CoverageEingang {
  transactionsTotal: number;
  withoutCase: number;
  withoutProposal: number;
  inClarification: number;
  rows: Array<{
    bankTransactionId: string;
    postingDate: string;
    amount: number;
    counterpartyName: string | null;
    purpose: string | null;
    reason: "no_case" | "clarification_pending" | "agent_open";
    clarificationSince: string | null;
    caseNumber: string | null;
  }>;
}

const EUR = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const TAG = new Intl.DateTimeFormat("de-DE", {
  timeZone: "Europe/Berlin",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** ISO-Tag → `09.09.2026`, immer Berlin (sonst 2 h daneben). */
function fmtDay(iso: string | null): string {
  if (!iso) return "—";
  return TAG.format(new Date(iso));
}

function umsatzPunkt(r: CoverageEingang["rows"][number]): ReadinessItem {
  const problem =
    r.reason === "no_case"
      ? "Ohne Sachverhalt (Gate 2a)."
      : r.reason === "clarification_pending"
        ? `Klärung offen an Kanzlei/Mandant seit ${fmtDay(r.clarificationSince)}` +
          `${r.caseNumber ? `, Sachverhalt ${r.caseNumber}` : ""}.`
        : `Beim Agenten offen${r.caseNumber ? ` (${r.caseNumber})` : ""}.`;
  return {
    key: `tx-${r.bankTransactionId}`,
    sourceDocId: null,
    bankTransactionId: r.bankTransactionId,
    label: `${fmtDay(r.postingDate)} · ${(r.amount < 0 ? "−" : "") + EUR.format(Math.abs(r.amount))} € · ${
      r.counterpartyName ?? r.purpose ?? "—"
    }`,
    datum: r.postingDate,
    problem,
    hinweis: r.reason === "clarification_pending",
  };
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

function belegPunkt(o: Record<string, unknown>, i: number): ReadinessItem {
  return {
    key: str(o.sourceDocId) ?? `beleg-${i}`,
    sourceDocId: str(o.sourceDocId),
    // Der Beleg heißt nach dem, was auf ihm steht (belege.md R32); das Gate
    // liefert die Felder dafür mit. Ein GUID-Dateiname sagt nicht, welcher
    // Beleg hier fehlt.
    label: belegAnzeigename({
      docDirection: str(o.docDirection),
      vendorName: str(o.vendorName),
      customerName: str(o.customerName),
      classCounterpartyName: str(o.classCounterpartyName),
      grossValue: typeof o.grossValue === "number" ? o.grossValue : str(o.grossValue),
      currency: str(o.currency),
      documentForm: str(o.classDocumentForm),
      documentDate: str(o.docDate),
      fileName: str(o.fileName),
    }),
    datum: str(o.docDate),
    problem: str(o.problem) ?? "",
    hinweis: false,
  };
}

function zahl(n: number, gedeckelt: boolean): string {
  if (n === 0) return "vollständig";
  return `${gedeckelt ? "mind. " : ""}${n} offen`;
}

export function readinessRows(
  gate3f: GateEingang,
  periodFrom: string,
  /** Belege, die ohne Buchung erledigt wurden (`application/belege-ohne-buchung.ts`). */
  ohneBuchung: { punkte: ReadinessItem[]; total: number } = { punkte: [], total: 0 },
  /** Deckung je Bank-Umsatz (`loadBankBookingCoverage`, F187). */
  coverage: CoverageEingang = {
    transactionsTotal: 0,
    withoutCase: 0,
    withoutProposal: 0,
    inClarification: 0,
    rows: [],
  },
  /** Offene Belege nach dem Periodenende (`application/docs-after-period.ts`, F203). */
  afterPeriod: { punkte: ReadinessItem[]; total: number } = { punkte: [], total: 0 },
): ReadinessRow[] {
  const belege = gate3f.open.map(belegPunkt);
  // Der Gate-Zähler ist ungedeckelt, die Liste nicht. Die Aufteilung kann
  // deshalb nur zählen, was geliefert wurde — das sagt die Zeile dann auch.
  const nichtGelistet = Math.max(0, gate3f.openCount - gate3f.open.length);
  // F220: drei disjunkte Mengen — vor der Periode · in der Periode · nach der
  // Periode (die dritte kommt nicht aus Gate 3f, sondern aus `afterPeriod`).
  // Vorher enthielt „einschließlich Vorperioden" die Periodenzeile noch einmal.
  // Ein Beleg ohne Datum zählt zur Periode: er ist offen, und „vorher" wäre
  // eine Behauptung.
  const periode = belege.filter((p) => p.datum == null || p.datum >= periodFrom);
  const vorher = belege.filter((p) => p.datum != null && p.datum < periodFrom);

  const ohneFall = coverage.rows.filter((r) => r.reason === "no_case").map(umsatzPunkt);
  const ohneVorschlag = coverage.rows.filter((r) => r.reason !== "no_case").map(umsatzPunkt);
  // „Vorschlag ODER offene Klärung" ist in Schritt 1 zulässig: die Klärung ist
  // die Arbeit, die gerade läuft. Freigegeben wird trotzdem nicht — das sagt
  // Schritt 8 (dort rot).
  const echtOffen = Math.max(coverage.withoutProposal - coverage.inClarification, 0);

  return [
    {
      key: "documents_period",
      label: "Belege in der Periode",
      hint: "Jeder Beleg mit Datum im Zeitraum ist zugeordnet und gebucht — oder mit Begründung nicht gebucht (Gate 3f).",
      stand: periode.length > 0 ? "open" : "ok",
      standText: zahl(periode.length, nichtGelistet > 0),
      leerText: "Jeder Beleg mit Datum in dieser Periode ist abgeschlossen.",
      punkte: periode,
      nichtGelistet,
    },
    {
      key: "documents_before_period",
      label: "Belege vor der Periode",
      hint: "Ältere Belege, die noch offen sind — Altlast, hält den Stapel nicht auf, soll aber gesehen werden.",
      // Altlast blockt nicht: gelb, nie rot.
      stand: vorher.length > 0 ? "notice" : "ok",
      standText: vorher.length === 0 ? "vollständig" : `${vorher.length} offen`,
      leerText: "Kein Beleg aus einer früheren Periode ist mehr offen.",
      punkte: vorher,
      nichtGelistet: 0,
    },
    {
      key: "documents_after_period",
      label: "Belege nach dem Zeitraum",
      hint: "Offene Belege, die nach dem Periodenende datiert sind — sie gehören dem nächsten Lauf.",
      // Nie rot: Gate 3f zählt sie nicht, sie gehören dem nächsten Lauf.
      stand: afterPeriod.total > 0 ? "notice" : "ok",
      standText: afterPeriod.total === 0 ? "keine" : `${afterPeriod.total} später datiert`,
      leerText: "Kein offener Beleg ist nach dem Ende des Zeitraums datiert.",
      punkte: afterPeriod.punkte,
      nichtGelistet: Math.max(0, afterPeriod.total - afterPeriod.punkte.length),
    },
    {
      key: "transactions_case",
      label: "Alle Umsätze haben einen Sachverhalt",
      hint: "Jede Auszugszeile im Zeitraum hängt an einem Sachverhalt (Gate 2a).",
      stand: coverage.withoutCase > 0 ? "open" : "ok",
      standText: zahl(coverage.withoutCase, ohneFall.length < coverage.withoutCase),
      leerText: "Jeder Umsatz des Zeitraums hängt an einem Sachverhalt.",
      punkte: ohneFall,
      nichtGelistet: Math.max(0, coverage.withoutCase - ohneFall.length),
    },
    {
      key: "transactions_proposal",
      label: "Alle Umsätze haben einen Buchungsvorschlag",
      hint: "Jede Auszugszeile trägt einen Buchungsvorschlag oder eine laufende Klärung.",
      stand: echtOffen > 0 ? "open" : coverage.inClarification > 0 ? "notice" : "ok",
      standText:
        coverage.withoutProposal === 0
          ? "vollständig"
          : [
              echtOffen > 0 ? `${echtOffen} offen` : null,
              coverage.inClarification > 0 ? `${coverage.inClarification} in Klärung` : null,
            ]
              .filter((t) => t !== null)
              .join(", "),
      leerText: "Jeder Umsatz des Zeitraums trägt einen Buchungsvorschlag oder einen Verzichtsgrund.",
      punkte: ohneVorschlag,
      nichtGelistet: Math.max(0, coverage.withoutProposal - coverage.rows.length),
    },
    {
      key: "unbooked",
      label: "Belege ohne Buchung — mit Begründung erledigt",
      hint: "Ludwig hat entschieden, nicht zu buchen — die Begründung soll jemand gegenlesen.",
      // Nie rot: hier fehlt nichts, hier wurde entschieden. Aber gesehen
      // werden soll die Entscheidung (Owner 2026-09-08).
      stand: ohneBuchung.total > 0 ? "notice" : "ok",
      standText: ohneBuchung.total === 0 ? "keine" : `${ohneBuchung.total} Beleg(e)`,
      leerText: "Jeder erledigte Beleg dieses Zeitraums trägt eine Buchung.",
      punkte: ohneBuchung.punkte,
      nichtGelistet: Math.max(0, ohneBuchung.total - ohneBuchung.punkte.length),
    },
  ];
}
