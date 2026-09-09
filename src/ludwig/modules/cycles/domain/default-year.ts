/**
 * # Welches Jahr ein Mandant zeigt, wenn keins genannt ist
 *
 * `/clients/<slug>` trägt kein Jahres-Segment und leitet weiter. Wohin,
 * entscheidet diese Regel — und sie steht hier, weil zwei Stellen sie
 * brauchen: der Redirect selbst und jede Zahl, die ein anderer Bildschirm
 * über diesen Mandanten zeigt. Zählt das Dashboard 2025 und öffnet der Klick
 * 2026, ist die Zahl falsch, ohne dass irgendwo ein Fehler steht.
 *
 * Die Kaskade: jüngstes **offenes** Wirtschaftsjahr, sonst das jüngste
 * überhaupt, sonst das laufende Kalenderjahr (Mandant ohne Jahre).
 */
export interface CycleYearLike {
  year: number;
  status: "open" | "closed";
}

export function defaultCycleYear(
  years: readonly CycleYearLike[],
  heute: Date = new Date(),
): number {
  const absteigend = [...years].sort((a, b) => b.year - a.year);
  return (
    absteigend.find((y) => y.status === "open")?.year ??
    absteigend[0]?.year ??
    heute.getUTCFullYear()
  );
}
