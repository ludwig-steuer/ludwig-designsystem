/**
 * DUO-Ablage eines Belegs (F216) — kein Spaltenwert, sondern abgeleitet aus
 * `client_source_docs.filed_at` und `filing_failed_at`. Die Achse
 * `document_filing` der Status-Registry zeichnet genau diese drei Werte;
 * der Registry-Test hält beide Seiten deckungsgleich.
 */
export const SOURCE_DOC_FILING_STATES = ["pending", "filed", "failed"] as const;
export type SourceDocFilingState = (typeof SOURCE_DOC_FILING_STATES)[number];

/** `filed_at` gewinnt: ein späteres `failed` öffnet einen abgelegten Beleg nicht wieder. */
export function documentFilingState(input: {
  filedAt: string | Date | null;
  filingFailedAt: string | Date | null;
}): SourceDocFilingState {
  if (input.filedAt) return "filed";
  if (input.filingFailedAt) return "failed";
  return "pending";
}
