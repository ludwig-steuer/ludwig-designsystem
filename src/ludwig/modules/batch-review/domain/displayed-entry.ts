/**
 * Der Satz, den eine Zeile der Stapelabnahme zeigt (F272, Befund #153).
 *
 * Die Karten tragen mit `includeDecided` **alle** Sätze des Falls am Stapel,
 * auch zurückgezogene — nach `created_at` sortiert steht ein zurückgezogener
 * Satz vorn und `proposals[0]` zeigte ihn: Konten, Betrag, Prüfpunkte eines
 * Satzes, den keine Aktion mehr berührt (2026-0406: 57,19 € statt 358,19 €).
 *
 * Erster lebender Satz; sind alle zurückgezogen (Reiter „Zurück an KI"), der
 * jüngste — das ist der, den die Kanzlei zurückgegeben hat.
 */
export function displayedEntry<E extends { status: string }>(
  proposals: ReadonlyArray<E>,
): E | null {
  return proposals.find((p) => p.status !== "reversed") ?? proposals.at(-1) ?? null;
}
