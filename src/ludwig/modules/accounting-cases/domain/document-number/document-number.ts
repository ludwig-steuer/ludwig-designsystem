/**
 * F85-T85.11 — Belegnummern-Register: die bekannten Belegfeld-1-Werte eines
 * Mandanten als EIN Vokabular (Quelle, Zustand, Rang).
 *
 * Warum ein Register: Belegnummern liegen heute verstreut (Case-Anker,
 * F77-Kanten, Journal-Zeilen, Spiegel-Rückverweise). Wer wissen will, welche
 * Nummer für einen Vorgang gilt, muss sonst an vier Stellen suchen — und
 * bekommt vier Antworten. Hier steht die Rangordnung, die daraus EINE macht.
 *
 * Regel 1 (Owner 2026-08-20): **DATEV gewinnt.** Kommt eine Nummer aus der
 * DATEV-Wahrheit, ist sie der kanonische Wert des Vorgangs und unveränderlich
 * (`immutable`); alles andere sind Kandidaten.
 */

import { acceptanceEqual } from "@/ludwig/core/datev/belegfeld";

export type DocumentNumberSource =
  /** Reimport hat den exportierten Satz mit geänderter Nummer erkannt. */
  | "datev_correction"
  /** Anker eines OPOS-Vortrags-Sachverhalts (`mirror-opos:<konto>/<beleg>`). */
  | "opos_anchor"
  /** Belegfeld einer gespiegelten DATEV-Buchung mit Rückverweis auf den Case. */
  | "mirror_ref"
  /**
   * F100 — die ENTSCHIEDENE Nummer des Sachverhalts
   * (`client_case_document_numbers`). Ein Mensch oder der Agent hat zwischen
   * zwei Schreibweisen desselben Belegs gewählt und die Wahl begründet.
   */
  | "case_decision"
  /** F77-Klammer (`client_open_item_links.belegfeld_value`). */
  | "link"
  /**
   * Rechnungsnummer eines Belegs, der an diesem Sachverhalt hängt. Die
   * Wahrheit des Belegs — stärker als die eigene Buchung (die kann sie falsch
   * abgeschrieben haben), schwächer als die persistierte Klammer.
   */
  | "invoice_number"
  /** Belegfeld einer eigenen Buchungszeile. */
  | "journal_line"
  /** Im Verwendungszweck erkannt — temporär, nie automatisch dominant. */
  | "bank_purpose"
  /** In der Sachverhalts-Beschreibung erkannt — schwächste Quelle. */
  | "case_summary";

/**
 * Dominanz-Lebenszyklus (Owner-Nachtrag 2026-08-20): `computed` ist errechnet
 * und darf sich ändern; mit dem Export wird die Nummer am Vorgang fixiert;
 * einzige Ausnahme vom Fix ist die nachträgliche Korrektur in DATEV.
 */
export type DocumentNumberState = "computed" | "fixed_on_export" | "datev_corrected";

/** Deckungsgleich mit dem CHECK auf `client_open_item_links.belegfeld_state`. */
export const DOCUMENT_NUMBER_STATES: ReadonlySet<string> = new Set<DocumentNumberState>([
  "computed",
  "fixed_on_export",
  "datev_corrected",
]);

/**
 * Kleinerer Rang = dominanter. DATEV-Quellen vor der Entscheidung vor Klammer
 * vor eigenen Werten.
 *
 * F100: `case_decision` liegt bei 2.5 — **stärker als jede errechnete Quelle,
 * schwächer als jede DATEV-Quelle**. Genau so steht die Regel in der Spec
 * begründet („DATEV bleibt unveränderlich — eine Entscheidung gegen den
 * Spiegel wäre keine Entscheidung, sondern ein Fehler"). Die dort ebenfalls
 * genannte Zahl 0.5 widerspricht ihr: sie läge VOR `opos_anchor` (1) und
 * `mirror_ref` (2), also vor zwei DATEV-Quellen. Umgesetzt ist die Regel,
 * nicht die Zahl.
 */
const SOURCE_RANK: Record<DocumentNumberSource, number> = {
  datev_correction: 0,
  opos_anchor: 1,
  mirror_ref: 2,
  case_decision: 2.5,
  link: 4,
  invoice_number: 4.5,
  journal_line: 5,
  bank_purpose: 6,
  case_summary: 7,
};

/** Quellen der DATEV-Wahrheit — ihre Schreibweise wird nie überschrieben. */
const DATEV_SOURCES: ReadonlySet<DocumentNumberSource> = new Set([
  "datev_correction",
  "opos_anchor",
  "mirror_ref",
]);

export const isDatevSource = (source: DocumentNumberSource): boolean =>
  DATEV_SOURCES.has(source);

export interface KnownDocumentNumber {
  /** Verbatim, in der Schreibweise der Quelle — DATEV ziffert zeichengleich aus. */
  documentNumber: string;
  source: DocumentNumberSource;
  /** Personenkonto, an dem die Nummer hängt (null = quellenseitig ohne Konto). */
  accountNumber: string | null;
  caseId: string | null;
  caseNumber: string | null;
  caseLifecycle: string | null;
  state: DocumentNumberState;
  /** DATEV-Herkunft → der Wert ist gesetzt, nicht verhandelbar. */
  immutable: boolean;
  /** Nur bei `link`: wie die F77-Kante entstand (server | agent | human). */
  matchedBy?: string;
  /** Nur bei `link`: die verlinkte DATEV-Zeile ist verschwunden (Kanzlei-Edit). */
  orphaned?: boolean;
  /** Nur bei `case_decision`: Periode der Entscheidung (`2026-07`), sonst null. */
  periodKey?: string | null;
  /** Nur bei `case_decision`: warum DIESE Schreibweise gilt. */
  rationale?: string;
  /**
   * Nur bei `bank_purpose` (P-F94a): welche Rolle das Token im Freitext hat.
   * Bis dahin standen Rechnungs-, Vertrags- und Kundennummer ununterscheidbar
   * nebeneinander, und die Erkenntnis darüber lebte allenfalls im Rationale
   * eines Agentenlaufs — im Folgemonat war sie wieder weg.
   *
   * Zwei deterministische Signale, keine LLM-Bewertung:
   *   `document` — das Token stand in einer Buchung schon als Belegfeld 1.
   *                Damit ist es bewiesen eine Belegnummer.
   *   `recurring` — es steht in den Verwendungszwecken desselben
   *                Geschäftspartners über mehrere Monate. Eine Vertrags- oder
   *                Kundennummer bleibt konstant, eine Rechnungsnummer nicht.
   *   `unknown`  — keines von beiden; der Kandidat bleibt, was er war.
   */
  candidateRole?: "document" | "recurring" | "unknown";
}

/** F100: ist dieser Eintrag eine getroffene Entscheidung? */
export const isDecidedSource = (source: DocumentNumberSource): boolean =>
  source === "case_decision";

export const documentNumberRank = (e: {
  source: DocumentNumberSource;
  state: DocumentNumberState;
}): number =>
  // Ein fixierter Wert schlägt jeden errechneten: nach dem Export ist die
  // Nummer am Vorgang festgehalten (Ludwig-seitiger Freeze).
  (e.state === "fixed_on_export" ? -1 : 0) * 10 + SOURCE_RANK[e.source];

/** Register-Einträge nach Dominanz sortieren (stabil, dominanteste zuerst). */
export function sortByDominance<T extends { source: DocumentNumberSource; state: DocumentNumberState }>(
  entries: T[],
): T[] {
  return [...entries].sort((a, b) => documentNumberRank(a) - documentNumberRank(b));
}

/**
 * Der dominante Wert einer Kandidatenmenge — genau den verwendet der Export.
 * Leere Menge → null (dann greift die synthetische Nummer wie bisher).
 */
export function dominantDocumentNumber(
  entries: KnownDocumentNumber[],
): KnownDocumentNumber | null {
  return sortByDominance(entries)[0] ?? null;
}

export interface KnownCandidate {
  /** Kandidat aus dem Verwendungszweck (Schreibweise des Betreffs). */
  candidate: string;
  /** Register-Treffer, dominanteste zuerst. */
  entries: KnownDocumentNumber[];
}

/**
 * Kandidaten aus einem Verwendungszweck, die das Register als Belegnummer
 * KENNT — exakt oder akzeptanz-gleich.
 *
 * Befund #31: der Sammelzahlungs-Guard zählte jede Zahlenfolge mit fünf Ziffern
 * als Belegnummer und lehnte damit vier eindeutige Einzelzahlungen ab — die
 * Versicherungsscheinnummer, die Karten-ID, die Kundennummer und die
 * Saisonkennung „2026/27" zählten mit. `extractDocumentNumberCandidates` ist
 * bewusst schwach („Rauschen ist eingepreist — die Kandidaten sind nie
 * dominant, solange eine echte Quelle existiert"); ein Guard, der hart
 * ablehnt, muss die echte Quelle also erst fragen. Genau das tut
 * `findDocumentNumberConflicts` schon, mit derselben Regel.
 *
 * Bewusst ohne `bank_purpose` und `case_summary`: beides sind selbst nur aus
 * Freitext gezogene Tokens — ein Rausch-Token darf sich nicht über einen
 * anderen Betreff selbst bestätigen. Dauersachverhalte aus dem Onboarding
 * tragen ihre Nummer zusätzlich als `opos_anchor`/`journal_line`/
 * `case_decision`; die zählen.
 */
export function resolveKnownDocumentNumbers(
  candidates: readonly string[],
  register: readonly KnownDocumentNumber[],
): KnownCandidate[] {
  const usable = register.filter(
    (e) => e.source !== "bank_purpose" && e.source !== "case_summary",
  );
  if (candidates.length === 0 || usable.length === 0) return [];
  const known: KnownCandidate[] = [];
  for (const candidate of candidates) {
    // Ein Kandidat, der zu einem schon gefundenen akzeptanz-gleich ist, ist
    // dieselbe Nummer — nicht die zweite.
    if (known.some((k) => k.candidate === candidate || acceptanceEqual(k.candidate, candidate))) {
      continue;
    }
    const entries = usable.filter(
      (e) => e.documentNumber === candidate || acceptanceEqual(e.documentNumber, candidate),
    );
    if (entries.length > 0) known.push({ candidate, entries: sortByDominance(entries) });
  }
  return known;
}

/**
 * Zustand einer Belegnummer im Vorgang — `client_accounting_case_document_number.state`.
 *
 * Lag bis 2026-09-07 als lokale Map in `CasePlausibilityTab.tsx` (L-71). Die
 * Quelle der Nummer hat seit dem 2026-09-06 eine Registry-Achse
 * (`belegnummer_quelle`); der Zustand ist etwas anderes und bleibt ein Label:
 * er sagt, wie fest die Nummer sitzt, nicht woher sie kommt.
 */
export const DOCUMENT_NUMBER_STATE_LABEL: Record<string, string> = {
  computed: "errechnet",
  fixed_on_export: "mit dem Export fixiert",
  datev_corrected: "in DATEV korrigiert",
};
