export const BATCH_WINDOW_POSITIONS = ["before", "inside", "after"] as const;
export type BatchWindowPosition = (typeof BATCH_WINDOW_POSITIONS)[number];

/** F501: Lage eines ISO-Datums zum Stapelzeitraum, beide Grenzen inklusive. */
export function batchWindowPosition(
  date: string,
  window: { periodFrom: string; periodTo: string },
): BatchWindowPosition {
  const day = date.slice(0, 10);
  if (day < window.periodFrom.slice(0, 10)) return "before";
  if (day > window.periodTo.slice(0, 10)) return "after";
  return "inside";
}
