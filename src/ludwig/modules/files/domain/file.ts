import type { FileUploadId } from "@/ludwig/shared/ids";

export const STORAGE_BACKEND = ["local", "supabase_storage", "s3"] as const;
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
  /** Web-reachable URL to render the file inline (e.g. signed Supabase Storage URL). `null` until a non-local backend is wired up. */
  previewUrl: string | null;
  /** Human-readable reason when the preview is unavailable. */
  previewUnavailableReason: string | null;
}

/**
 * Result of step 1 of the upload flow — what the browser needs to push
 * the bytes directly to S3.
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

/** Result of step 3 — server has verified the object exists in S3. */
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
