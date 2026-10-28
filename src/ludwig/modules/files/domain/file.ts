import type { FileUploadId } from "@/ludwig/shared/ids";

/**
 * Labels, die der Code in `ops_stored_files.storage_backend` schreibt (PT-93:
 * nur noch Azure Blob). Gelesen wird das Label als `string` — Altzeilen tragen
 * `s3` (vor dem Umzug) oder `local`/`supabase_storage` (Prototyp) und zeigen
 * dann „Datei liegt im Backend …“ statt einer Vorschau. Kein DB-CHECK.
 */
export const STORAGE_BACKEND = ["azure_blob"] as const;
export type StorageBackend = (typeof STORAGE_BACKEND)[number];

export const UPLOAD_STATE = ["pending", "confirmed", "rejected", "expired"] as const;
export type UploadState = (typeof UPLOAD_STATE)[number];

export interface StoredFileMeta {
  fileId: string;
  backend: string;
  key: string;
  mimeType: string | null;
  byteSize: number | null;
  originalFileName: string | null;
  checksumSha256: string | null;
  createdAt: string;
}

export interface StoredFilePreview {
  meta: StoredFileMeta;
  /** Web-reachable URL to render the file inline (e.g. a SAS-signed Azure Blob URL). `null` when the backend cannot serve a preview. */
  previewUrl: string | null;
  /** Human-readable reason when the preview is unavailable. */
  previewUnavailableReason: string | null;
}

/**
 * Result of step 1 of the upload flow — what the browser needs to push
 * the bytes directly to the storage (Azure Blob).
 *
 * The `uploadHeaders` are bound into the URL signature; the browser
 * MUST send them unchanged on the PUT request, and MUST NOT add any
 * other headers (no `Authorization`, no extra `Content-Type`).
 */
export interface UploadTicket {
  fileUploadId: FileUploadId;
  storageKey: string;
  uploadUrl: string;
  uploadMethod: "PUT";
  uploadHeaders: Record<string, string>;
  expiresAt: string;
}

/** Result of step 3 — server has verified the object exists in the storage. */
export interface ConfirmedUpload {
  fileUploadId: FileUploadId;
  uploadState: UploadState;
  byteSize: number;
  mimeType: string | null;
}

export interface DownloadUrl {
  fileUploadId: FileUploadId;
  downloadUrl: string;
  expiresAt: string;
  originalFileName: string | null;
}
