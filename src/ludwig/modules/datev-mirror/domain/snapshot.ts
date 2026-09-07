/**
 * # Der DATEV-Abzug
 *
 * Ein Snapshot ist ein Stand, den die Kanzlei aus DATEV gezogen hat: Journal,
 * offene Posten oder beides, zu einem Stichtag. Er ist die Vergleichsgrundlage
 * für alles, was Ludwig über den DATEV-Bestand sagt.
 *
 * Das Modul hatte bis 2026-09-07 kein `domain/` — der Spiegel ins
 * Design-System nahm daraus nichts (L-04, präzisiert in L-72).
 */

/**
 * Was der Abzug abdeckt. DB-CHECK `client_datev_snapshots_baseline_level_check`,
 * NULL erlaubt (Altbestand vor der Einführung).
 *
 * Die Wörter fehlten bisher ganz — weder im GLOSSARY noch als Label; die
 * Oberfläche zeigte den rohen Wert (L-72).
 *
 * **Fallstrick:** `journal_opos` wird von keiner Stelle im App-Code
 * geschrieben (geprüft 2026-09-07, ganzes Repo) — die Spalte wird **von
 * außen befüllt** (Owner-Auskunft 2026-09-07). Die Stufe ist also nicht tot,
 * sondern hat ihren Schreiber woanders; wer im Code nach ihm sucht, findet
 * ihn nicht und darf daraus nicht schließen, der Wert käme nie vor.
 */
export const BASELINE_LEVELS = ["opos", "journal_opos", "journal"] as const;
export type BaselineLevel = (typeof BASELINE_LEVELS)[number];

/**
 * Klartext der Stufe. Sagt, **was im Abzug steckt** — nicht, wie gut er ist:
 * ein reiner OPOS-Abzug ist nicht schlechter als ein Journal-Abzug, er
 * beantwortet nur andere Fragen.
 */
export const BASELINE_LEVEL_LABEL: Record<BaselineLevel, string> = {
  opos: "nur offene Posten",
  journal_opos: "Journal und offene Posten",
  journal: "nur Journal",
};

export interface DatevSnapshot {
  id: string;
  fiscalYear: number;
  /** Wann der Abzug in Ludwig eingelesen wurde. */
  importedAt: string;
  /** Stichtag des Abzugs in DATEV — nicht der Import-Zeitpunkt. */
  asOf: string;
  baselineLevel: BaselineLevel | null;
}
