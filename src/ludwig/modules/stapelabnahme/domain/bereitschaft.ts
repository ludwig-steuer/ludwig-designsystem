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

import { deckungsLueckeAus } from "./deckungsluecke";

export type BereitschaftsStand = "offen" | "hinweis" | "ok";

export interface BereitschaftsPunkt {
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

export interface BereitschaftsZeile {
  key:
    | "belege_periode"
    | "belege_alle"
    | "belege_nach_zeitraum"
    | "auszuege"
    | "transactions_case"
    | "transactions_proposal"
    | "ohne_buchung";
  label: string;
  stand: BereitschaftsStand;
  /** „6 offen" bzw. „vollständig" — rechts in der Zeile. */
  standText: string;
  /** Was im aufgeklappten Zustand steht, wenn nichts offen ist. */
  leerText: string;
  punkte: BereitschaftsPunkt[];
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

function umsatzPunkt(r: CoverageEingang["rows"][number]): BereitschaftsPunkt {
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

function belegPunkt(o: Record<string, unknown>, i: number): BereitschaftsPunkt {
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

function kontoPunkt(
  o: Record<string, unknown>,
  i: number,
  hinweis: boolean,
  periodTo: string,
): BereitschaftsPunkt {
  return {
    key: `konto-${hinweis ? "w" : "o"}-${i}`,
    sourceDocId: null,
    label: str(o.label) ?? str(o.accountNumber) ?? str(o.name) ?? "—",
    datum: null,
    // Blocker tragen `problem`, Gate-Warnungen `warning` — ohne das zweite
    // stand hier ein leerer Hinweis (F141).
    problem: deckungsLueckeAus(o, periodTo)?.text ?? str(o.problem) ?? str(o.warning) ?? "",
    hinweis,
  };
}

function zahl(n: number, gedeckelt: boolean): string {
  if (n === 0) return "vollständig";
  return `${gedeckelt ? "mind. " : ""}${n} offen`;
}

export function bereitschaftsZeilen(
  gate1a: GateEingang,
  gate3f: GateEingang,
  periodFrom: string,
  periodTo: string,
  /** Belege, die ohne Buchung erledigt wurden (`application/belege-ohne-buchung.ts`). */
  ohneBuchung: { punkte: BereitschaftsPunkt[]; total: number } = { punkte: [], total: 0 },
  /** Deckung je Bank-Umsatz (`loadBankBookingCoverage`, F187). */
  coverage: CoverageEingang = {
    transactionsTotal: 0,
    withoutCase: 0,
    withoutProposal: 0,
    inClarification: 0,
    rows: [],
  },
  /** Offene Belege nach dem Periodenende (`application/docs-after-period.ts`, F203). */
  afterPeriod: { punkte: BereitschaftsPunkt[]; total: number } = { punkte: [], total: 0 },
): BereitschaftsZeile[] {
  const belege = gate3f.open.map(belegPunkt);
  // Der Gate-Zähler ist ungedeckelt, die Liste nicht. Die Aufteilung kann
  // deshalb nur zählen, was geliefert wurde — das sagt die Zeile dann auch.
  const nichtGelistet = Math.max(0, gate3f.openCount - gate3f.open.length);
  const periode = belege.filter((p) => p.datum != null && p.datum >= periodFrom);
  const nurAltlast = periode.length === 0 && gate3f.openCount > 0;

  const ohneFall = coverage.rows.filter((r) => r.reason === "no_case").map(umsatzPunkt);
  const ohneVorschlag = coverage.rows.filter((r) => r.reason !== "no_case").map(umsatzPunkt);
  // „Vorschlag ODER offene Klärung" ist in Schritt 1 zulässig: die Klärung ist
  // die Arbeit, die gerade läuft. Freigegeben wird trotzdem nicht — das sagt
  // Schritt 8 (dort rot).
  const echtOffen = Math.max(coverage.withoutProposal - coverage.inClarification, 0);

  const auszugPunkte = [
    ...gate1a.open.map((o, i) => kontoPunkt(o, i, false, periodTo)),
    ...(gate1a.warnings ?? []).map((o, i) => kontoPunkt(o, i, true, periodTo)),
  ];

  return [
    {
      key: "belege_periode",
      label: "Alle Belege der Periode erledigt",
      stand: periode.length > 0 ? "offen" : nurAltlast ? "hinweis" : "ok",
      standText: zahl(periode.length, nichtGelistet > 0),
      leerText: nurAltlast
        ? "In dieser Periode ist jeder Beleg abgeschlossen — offen ist nur Älteres (Zeile darunter)."
        : "Jeder Beleg mit Datum in dieser Periode ist abgeschlossen.",
      punkte: periode,
      nichtGelistet,
    },
    {
      key: "belege_alle",
      label: "Alle Belege einschließlich Vorperioden erledigt",
      stand: gate3f.openCount === 0 ? "ok" : periode.length > 0 ? "offen" : "hinweis",
      standText: zahl(gate3f.openCount, false),
      leerText: "Jeder Beleg bis zum Ende des Zeitraums ist abgeschlossen.",
      punkte: belege,
      nichtGelistet,
    },
    {
      key: "belege_nach_zeitraum",
      label: "Belege nach dem Zeitraum",
      // Nie rot: Gate 3f zählt sie nicht, sie gehören dem nächsten Lauf.
      stand: afterPeriod.total > 0 ? "hinweis" : "ok",
      standText: afterPeriod.total === 0 ? "keine" : `${afterPeriod.total} später datiert`,
      leerText: "Kein offener Beleg ist nach dem Ende des Zeitraums datiert.",
      punkte: afterPeriod.punkte,
      nichtGelistet: Math.max(0, afterPeriod.total - afterPeriod.punkte.length),
    },
    {
      key: "auszuege",
      label: "Alle Kontoauszüge erledigt",
      stand:
        gate1a.openCount > 0 ? "offen" : (gate1a.warnings?.length ?? 0) > 0 ? "hinweis" : "ok",
      standText: zahl(gate1a.openCount, gate1a.openCount > gate1a.open.length),
      leerText: "Jedes aktive Zahlungskonto deckt den Zeitraum ab, der Saldenanschluss stimmt.",
      punkte: auszugPunkte,
      nichtGelistet: Math.max(0, gate1a.openCount - gate1a.open.length),
    },
    {
      key: "transactions_case",
      label: "Alle Umsätze haben einen Sachverhalt",
      stand: coverage.withoutCase > 0 ? "offen" : "ok",
      standText: zahl(coverage.withoutCase, ohneFall.length < coverage.withoutCase),
      leerText: "Jeder Umsatz des Zeitraums hängt an einem Sachverhalt.",
      punkte: ohneFall,
      nichtGelistet: Math.max(0, coverage.withoutCase - ohneFall.length),
    },
    {
      key: "transactions_proposal",
      label: "Alle Umsätze haben einen Buchungsvorschlag",
      stand: echtOffen > 0 ? "offen" : coverage.inClarification > 0 ? "hinweis" : "ok",
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
      key: "ohne_buchung",
      label: "Belege ohne Buchung — mit Begründung erledigt",
      // Nie rot: hier fehlt nichts, hier wurde entschieden. Aber gesehen
      // werden soll die Entscheidung (Owner 2026-09-08).
      stand: ohneBuchung.total > 0 ? "hinweis" : "ok",
      standText: ohneBuchung.total === 0 ? "keine" : `${ohneBuchung.total} Beleg(e)`,
      leerText: "Jeder erledigte Beleg dieses Zeitraums trägt eine Buchung.",
      punkte: ohneBuchung.punkte,
      nichtGelistet: Math.max(0, ohneBuchung.total - ohneBuchung.punkte.length),
    },
  ];
}
