/**
 * Welches **eine** Signal die Belegseite zeigt (L-267, Detailseiten-Standard
 * D4: der Signal-Slot trägt genau eines).
 *
 * Die Seite stapelte drei Rahmen übereinander — Herkunftshinweis, „wird
 * eingeordnet" und der Pipeline-Fortschritt —, und welcher oben lag, entschied
 * die Reihenfolge im JSX. Das ist aber eine **fachliche** Frage: „die Pipeline
 * läuft gerade" verdrängt „der Beleg ist an die Kanzlei übergeben", weil das
 * eine jetzt passiert und das andere warten kann.
 *
 * Die Reihenfolge steht in der DS-Spec `0144-beleg-detail-szenarien.md`
 * („Die Seite", Slot Signal) und hier als Code. Gelesen wird sie von oben:
 * das erste zutreffende Signal gewinnt, alle anderen fallen weg.
 *
 * **Nicht in dieser Liste**, mit Absicht:
 * - *Herkunft* (Teilbeleg eines Sammel-PDF) — das war nie ein Signal, sondern
 *   eine Tatsache über den Beleg; sie steht jetzt als Fakten-Zeile
 *   („Ausschnitt: Seiten 4–5 aus …"). 99 der Belege auf Staging tragen sie,
 *   fünf davon zusätzlich ein echtes Signal — genau dort stapelte es sich.
 * - *`review_needed`* (reparierbare Befunde) und *`awaiting_input`* (F170, das
 *   Bankkonto fehlt) — beide sind Mängel mit einem Weg hinaus und stehen
 *   deshalb in der Mängel-Zone der Übersicht (D4/Zone 2), nicht in einem Rahmen
 *   über der Seite. Beide Zeilen sind gebaut (L-269, L-268).
 */

/** Die sieben Signale, in der Reihenfolge ihrer Priorität. */
export const DOC_SIGNALS = [
  "classification_failed",
  "pending_classification",
  "extracting",
  "processing_failed",
  "review_gate",
  "escalated",
  "duplicate_suspected",
] as const;

export type DocSignal = (typeof DOC_SIGNALS)[number];

/** Die Zustände, aus denen sich das Signal ergibt — alle schon am Beleg. */
export interface DocSignalFacts {
  /** `client_source_docs.status` (Achse `beleg_inbox`). */
  inboxStatus: string | null;
  /** `…_invoices.processing_status` (Achse `beleg`) — für „fehlgeschlagen". */
  processingStatus: string | null;
  /**
   * Läuft gerade etwas an diesem Beleg? Abgeleitet von `docProcessing` — aus
   * der Rechnungszeile **oder** dem offenen Job, damit auch ein Vertrag in der
   * Extraktion einen Fortschritt hat (L-82).
   */
  processingRunning: boolean;
  /** Erreichte Pipeline-Stufe (Achse `beleg_stufe`). */
  processingStage: string | null;
  /** `review_disposition`: `accounting` = vom Agenten an die Kanzlei. */
  reviewDisposition: string | null;
  /** F132-Stempel. `suspected` will einen Menschen, `certain` legt selbst ab. */
  datevHistoryDuplicate: string | null;
  /** Fachlich erledigt — dann ist jede Frage der Seite beantwortet. */
  completedAt: string | null;
}

const RANKS: ReadonlyArray<readonly [DocSignal, (f: DocSignalFacts) => boolean]> = [
  // Ohne Belegart geht nichts weiter, und es gibt keinen Wiederholungslauf.
  ["classification_failed", (f) => f.inboxStatus === "classification_failed"],
  // Die Seite aktualisiert sich selbst — das muss sie sagen, sonst wartet
  // niemand, sondern lädt neu.
  ["pending_classification", (f) => f.inboxStatus === "pending_classification"],
  // Läuft gerade: verdrängt alles, was danach noch zu entscheiden wäre.
  ["extracting", (f) => f.processingRunning],
  ["processing_failed", (f) => f.processingStatus === "failed"],
  // Das Review-Gate des Onboarding-Schnelldurchlaufs: extrahiert, aber von
  // niemandem bestätigt. `review_needed` ist etwas anderes (s. Kopfkommentar).
  ["review_gate", (f) => f.processingStage === "extracted"],
  ["escalated", (f) => f.reviewDisposition === "accounting"],
  ["duplicate_suspected", (f) => f.datevHistoryDuplicate === "suspected"],
];

/**
 * Das Signal des Belegs, oder `null` für „nichts will etwas von mir".
 *
 * Ein erledigter Beleg hat kein Signal: sein Kopf-Status sagt, dass und
 * wodurch er erledigt ist, und ein Rahmen, der die Entscheidung überlebt, ist
 * Lärm. Von den 25 Belegen auf Staging, die heute ein ungezeigtes Signal
 * tragen (19 eskaliert, 6 Dublettenverdacht), sind 16 längst erledigt.
 */
export function docSignal(facts: DocSignalFacts): DocSignal | null {
  if (facts.completedAt) return null;
  for (const [signal, hits] of RANKS) if (hits(facts)) return signal;
  return null;
}
