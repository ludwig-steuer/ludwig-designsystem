/**
 * Die Darstellungen von Schritt 3 (F218, Owner-Durchgang 2026-09-15).
 *
 * Drei stehen im Dropdown „Darstellung": **gruppiert nach Satzart**
 * (`grouped`, bis F218 `overview`), **sortiert nach Datum** (`by_date`, neu)
 * und **nach Sachverhalten** (`by_case`, die frühere Liste nach Nummer — nur
 * der Name änderte sich, Owner-Entscheid). Das Fall-Vollbild (`case`) bleibt
 * eine gültige Sicht, steht aber nicht im Dropdown: dorthin kommt man durch
 * Klick auf einen Sachverhalt oder Satz, zurück über den Pfeil des Pagers.
 *
 * Alte Werte aus Lesezeichen (`overview`, `list`) werden abgebildet, nicht
 * abgewiesen.
 */
export type Step3View = "grouped" | "by_date" | "by_case" | "case";
export type Step3ListView = Exclude<Step3View, "case">;

export const STEP3_VIEW_OPTIONS: readonly { key: Step3ListView; label: string }[] = [
  { key: "grouped", label: "Buchungen gruppiert nach Satzart" },
  { key: "by_date", label: "Buchungen sortiert nach Datum" },
  { key: "by_case", label: "Nach Sachverhalten" },
];

export function parseStep3View(
  raw: string | null | undefined,
  opts: { startInList?: boolean } = {},
): Step3View {
  switch (raw) {
    case "grouped":
    case "overview":
      return "grouped";
    case "by_date":
      return "by_date";
    case "by_case":
    case "list":
      return "by_case";
    case "case":
      return "case";
    default:
      return opts.startInList ? "by_case" : "grouped";
  }
}

/** Die Listen-Darstellung, in die der Pager-Pfeil aus dem Vollbild zurückführt. */
export function parseStep3BackView(raw: string | null | undefined): Step3ListView {
  const v = parseStep3View(raw);
  return v === "case" ? "grouped" : v;
}

/**
 * „Sortiert nach Datum": aufsteigend nach Buchungsdatum, Tiebreak die stabile
 * Nummer (Vergabereihenfolge = `case_number`). Ohne Datum ans Ende.
 */
export function sortByBookingDate<T extends { datum: string | null; nummer: number }>(
  rows: readonly T[],
): T[] {
  return [...rows].sort((a, b) => {
    if (a.datum === b.datum) return a.nummer - b.nummer;
    if (a.datum === null) return 1;
    if (b.datum === null) return -1;
    return a.datum < b.datum ? -1 : 1;
  });
}
