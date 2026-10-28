/**
 * F497 — Belegprofile, deren Beleg ein Kontoauszug des Zahlungskontos ist: der Classifier erkennt sie am Kopf
 * (Marker), der Job `statement_extract` liest sie, `importDocumentProfileStatement` liest sie ein.
 */
export const STATEMENT_IMPORT_PROFILE_KEYS = ["ebay-settlement-report"] as const;
export type StatementImportProfileKey = (typeof STATEMENT_IMPORT_PROFILE_KEYS)[number];

export function isStatementImportProfile(key: string | null): key is StatementImportProfileKey {
  return key != null && (STATEMENT_IMPORT_PROFILE_KEYS as readonly string[]).includes(key);
}
