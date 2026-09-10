/**
 * Wie lange ein Beleg schon liegt — in Tagen seit seinem Eingang.
 *
 * Der Reiter „Offen" der Belegliste ist die einzige Sicht, die das fragt:
 * dort steht der Rückstand, und drei Tage sind etwas anderes als acht Monate.
 */

const BERLIN_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" });

/**
 * Der heutige Tag in Berlin als `YYYY-MM-DD`.
 *
 * `timestamptz::text` kommt in UTC, und der Server steht irgendwo — der
 * Kalendertag des Lesers ist der Berliner (R3). Bewusst eine Funktion und
 * keine Konstante: ein Prozess, der über Mitternacht läuft, würde sonst
 * weiter den Vortag rechnen.
 */
export function berlinToday(): string {
  return BERLIN_DAY.format(new Date());
}

function utcDay(iso: string): number {
  return Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
}

/** `null`, wenn kein Datum dasteht — die Liste lässt `receivedDate` leer zu. */
export function daysSince(iso: string, today: string = berlinToday()): number | null {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return null;
  return Math.round((utcDay(today) - utcDay(iso)) / 86_400_000);
}

/** Dasselbe als Zellentext: „heute", „1 Tag", „42 Tage" — oder „—". */
export function ageLabel(iso: string, today: string = berlinToday()): string {
  const days = daysSince(iso, today);
  if (days === null) return "—";
  if (days <= 0) return "heute";
  return days === 1 ? "1 Tag" : `${days} Tage`;
}
