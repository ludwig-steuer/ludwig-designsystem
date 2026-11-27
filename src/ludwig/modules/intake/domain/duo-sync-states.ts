/**
 * Owner 2026-11-27 — der Zustand eines Abgleichs je Mandant im DUO-Sync-Plugin; Registry-Achse `duo_sync`. Ludwig
 * speichert ihn nicht, das Plugin schreibt und zeigt ihn (ludwig-plugin `docs/spec-bausteine.md`, „Statuswörter für den
 * Abgleich“). Eine reine Datei ohne Importe, damit das DS sie spiegeln kann (L-375).
 */
export const DUO_SYNC_STATES = ["queued", "running", "succeeded", "succeeded_with_issues", "cancelled", "skipped"] as const;
export type DuoSyncState = (typeof DUO_SYNC_STATES)[number];
