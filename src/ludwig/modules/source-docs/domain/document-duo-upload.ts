/**
 * Upload nach DUO eines Belegs (F547) — kein Spaltenwert, sondern abgeleitet aus
 * `client_source_docs.ludwig_bedi_guid`, `datev_ref_*`, `duo_uploaded_at` und
 * `duo_upload_failed_at`. Die Achse `document_duo_upload` der Status-Registry
 * zeichnet genau diese drei Werte; der Registry-Test hält beide Seiten
 * deckungsgleich. `pending`/`failed` genau dann, wenn der Beleg in der
 * Upload-Queue steht (`IN_QUEUE` in `intake/application/duo-upload-core.ts`).
 */
export const SOURCE_DOC_DUO_UPLOAD_STATES = ["pending", "uploaded", "failed"] as const;
export type SourceDocDuoUploadState = (typeof SOURCE_DOC_DUO_UPLOAD_STATES)[number];

/** BEDI-GUIDs vergleichen: case-insensitiv, Bindestriche egal; `null` ist nie gleich. */
export function sameGuid(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return false;
  const norm = (g: string) => g.toLowerCase().replace(/-/g, "");
  return norm(a) === norm(b);
}

/** Erste passende Regel gewinnt; `null` = für diesen Beleg ist kein Upload (mehr) vorgesehen. */
export function documentDuoUploadState(input: {
  ludwigBediGuid: string | null;
  datevRefSystem: string | null;
  datevRefId: string | null;
  status: string;
  supersededAt: string | null;
  duplicateOfSourceDocId: string | null;
  doneVia: string | null;
  reviewReason: string | null;
  duoUploadedAt: string | null;
  duoUploadFailedAt: string | null;
}): SourceDocDuoUploadState | null {
  if (input.ludwigBediGuid === null) return null;
  if (input.duoUploadedAt) return "uploaded";
  // Ein anderer Weg hat die Referenz ersetzt oder gelöscht — der Beleg liegt nicht unter Ludwigs GUID.
  if (input.datevRefSystem !== "bedi" || !sameGuid(input.datevRefId, input.ludwigBediGuid)) return null;
  if (input.status === "deleted") return null;
  // Nach dem ersten Satz als Nicht-Beleg erkannt.
  if (
    input.supersededAt ||
    input.duplicateOfSourceDocId ||
    input.doneVia === "rejected" ||
    input.doneVia === "replaced" ||
    input.reviewReason === "not_bookkeeping"
  ) {
    return null;
  }
  if (input.duoUploadFailedAt) return "failed";
  return "pending";
}
