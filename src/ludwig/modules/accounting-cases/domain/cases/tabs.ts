/**
 * Die Reiter der Sachverhalts-Detailseite (F257, DS-Vorlage
 * `showcase/case/fixtures.ts` `FALL_TABS`): erst die der Sachbearbeitung, dann
 * einer für Prüfung und Support. `rules` gibt es nur am Dauersachverhalt.
 */
export const CASE_TABS = [
  "overview",
  "events",
  "documents",
  "clarifications",
  "plausibility",
  "rules",
  "master_data",
  "technical",
] as const;
export type CaseTab = (typeof CASE_TABS)[number];

export const CASE_TAB_LABEL: Record<CaseTab, string> = {
  overview: "Übersicht",
  events: "Ereignisse",
  documents: "Belege",
  clarifications: "Rückfragen",
  /** Prüfpunkte, Belegnummern-Register, Saldo & Konten, offene Posten. */
  plausibility: "Plausibilität",
  /** Regel und Zuordnung in einem Reiter — nur Dauersachverhalt. */
  rules: "Wiederkehr",
  master_data: "Stammdaten",
  /** DATEV-Wahrheit, Protokoll, Herkunft, Rohdaten. */
  technical: "Technik",
};

export function parseCaseTab(value: string | string[] | undefined): CaseTab {
  const v = Array.isArray(value) ? value[0] : value;
  return (CASE_TABS as readonly string[]).includes(v ?? "")
    ? (v as CaseTab)
    : "overview";
}
