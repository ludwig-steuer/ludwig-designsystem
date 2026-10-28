/**
 * Erwartete Dauer eines Laufs für die Lauf-Leiste (0225, llcto 2026-10-26): der Median der letzten
 * abgeschlossenen Läufe des Mandanten; hat er keine, der der Kanzlei; sonst nichts (die Leiste lässt den
 * Teil dann weg). Ganze Minuten, mindestens eine.
 */
export function expectedRunMinutes(clientMinutes: readonly number[], tenantMinutes: readonly number[]): number | null {
  const sample = clientMinutes.length > 0 ? clientMinutes : tenantMinutes;
  const sorted = sample.filter((m) => Number.isFinite(m) && m >= 0).sort((a, b) => a - b);
  if (sorted.length === 0) return null;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
  return Math.max(1, Math.round(median));
}
