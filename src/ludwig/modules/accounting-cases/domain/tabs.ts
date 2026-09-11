export const CASE_TABS = [
  "overview",
  "documents",
  "datev",
  "plausibility",
  "rules",
  "assignment",
  "raw",
  "history",
] as const;
export type CaseTab = (typeof CASE_TABS)[number];

export const CASE_TAB_LABEL: Record<CaseTab, string> = {
  overview: "Übersicht",
  documents: "Verbundene Belege",
  /** F85: verlinkte DATEV-Spiegel-Buchungen + offener Posten des Sachverhalts. */
  datev: "DATEV-Wahrheit",
  /** F85-T85.10: deterministische Checks P1–P5 gegen die DATEV-Wahrheit. */
  plausibility: "Plausibilität",
  rules: "Regelwerk",
  /** Zuordnung Zahlung → Sachverhalt (DATEV-Analogon: Lerndatei). Nur Dauersachverhalt. */
  assignment: "Zuordnung",
  raw: "Rohdaten",
  history: "Historie",
};

export function parseCaseTab(value: string | string[] | undefined): CaseTab {
  const v = Array.isArray(value) ? value[0] : value;
  return (CASE_TABS as readonly string[]).includes(v ?? "")
    ? (v as CaseTab)
    : "overview";
}
