/**
 * F627 (`docs/topics/web-ui.md` R27) — der Anzeigename eines Sachverhalts und was er braucht: die Case-Arten, ihre
 * Anzeigetexte und die Nummer mit `SV-`. Rein und ohne Modul-Importe, damit jedes Modul denselben Namen bauen kann
 * (die Modulkarte verbietet `agent-runs`/`bank-transactions` den Weg nach `accounting-cases`).
 * `accounting-cases/domain/case.ts` exportiert alles weiter — bestehende Importe bleiben.
 */

// EINZIGE TS-Quelle der Case-Arten (F11-T11.2). Spiegel des DB-CHECK
// ``client_accounting_case_kind_check`` in Migration
// ``supabase/migrations/20261002120000_case_kind_mechanics.sql`` — bei
// Änderung BEIDE anfassen. Keine lokalen z.enum-Duplikate mehr;
// bewusste Einschränkungen als ``CaseKindSchema.extract/exclude`` mit
// Kommentar am Konsumenten.
// Die Art beantwortet eine Frage (F360): Wie kommt der Sachverhalt zu seinen
// Buchungen, und wann ist er fertig? Die Richtung trägt ``counterparty_side``.
// ``recurring_charge`` ist nur Übergang („Art offen") — nie neu schreiben.
export const CASE_KIND = [
  "single",
  "rule",
  "running",
  "pool",
  // F295: der Sammel-Sachverhalt eines importierten Mandantenstapels — ohne
  // Gegenpartei, vergibt nur der Import.
  "client_batch",
  "recurring_charge",
] as const;
export type CaseKind = (typeof CASE_KIND)[number];

/** Anzeigetext je Case-Art. EINZIGE Quelle — nicht lokal duplizieren.
 *  Kein Status (keine Farbe, keine Übergänge), deshalb bewusst hier statt in
 *  der Status-Registry. */
export const CASE_KIND_LABEL: Record<CaseKind, string> = {
  single: "Einzelsachverhalt",
  rule: "Regelsachverhalt",
  running: "Laufender Sachverhalt",
  pool: "Sammelfall",
  client_batch: "Mandantenstapel",
  recurring_charge: "Dauersachverhalt – Art offen",
};

/**
 * Anzeige der Sachverhaltsnummer (F280): `2026-0012` → `SV-2026-0012`. Reine
 * Anzeige — `case_number` bleibt in der DB `YYYY-NNNN`, die Suche nimmt beides.
 */
export function formatCaseNumber(n: string): string;
export function formatCaseNumber(n: string | null | undefined): string | null;
export function formatCaseNumber(n: string | null | undefined): string | null {
  // F627: idempotent — ein schon formatierter Schlüssel bleibt, wie er ist.
  return n ? (n.startsWith("SV-") ? n : `SV-${n}`) : null;
}

/** Der Anzeigename: eigener Titel, sonst „<Art>: <Gegenpart>“, sonst die Art, sonst „Sachverhalt“ — nie leer. */
export function caseDisplayTitle(input: {
  title: string | null | undefined;
  kind: string | null | undefined;
  counterpartyName?: string | null;
}): string {
  const title = input.title?.trim();
  if (title) return title;
  const kindLabel = input.kind ? (CASE_KIND_LABEL[input.kind as CaseKind] ?? input.kind) : "Sachverhalt";
  const counterparty = input.counterpartyName?.trim();
  return counterparty ? `${kindLabel}: ${counterparty}` : kindLabel;
}
