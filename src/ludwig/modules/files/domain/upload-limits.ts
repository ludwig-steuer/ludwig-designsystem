/**
 * F365 — die eine Grenze für jede eingereichte Datei (architektur.md R31).
 * MiB, weil Browser (`file.size`) und der Speicher (Content-Length) so rechnen:
 * „25 MB“ im Text meint 25 × 1024 × 1024 Bytes.
 */
export const MAX_UPLOAD_MB = 25;
export const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

export class UploadTooLargeError extends Error {
  constructor(readonly byteSize: number) {
    super(`Datei zu groß (${(byteSize / 1024 / 1024).toFixed(1)} MB) — erlaubt sind höchstens ${MAX_UPLOAD_MB} MB.`);
    this.name = "UploadTooLargeError";
  }
}

/**
 * PT-27 — welche Dateien Ludwig annimmt: Belege (PDF, PNG, JPEG, XML für
 * E-Rechnungen) und Kontoauszüge (CSV, XLSX, MT940 `.sta`). Geprüft an der
 * einen Engstelle `requestUploadTicket`, Endung UND MIME — Textformate kommen
 * aus Browsern und Bank-Exporten oft generisch (`text/plain`,
 * `application/octet-stream`), deshalb gilt das dort nur zusammen mit der Endung.
 */
const GENERIC = ["application/octet-stream", "text/plain"];
const UPLOAD_ALLOWLIST: Record<string, readonly string[]> = {
  // Scanner, Partner-Skripte und curl schicken PDFs oft generisch.
  pdf: ["application/pdf", "application/octet-stream"],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  xml: ["application/xml", "text/xml", ...GENERIC],
  csv: ["text/csv", "application/vnd.ms-excel", "application/csv", ...GENERIC],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"],
  sta: GENERIC,
  mt940: GENERIC,
};

/**
 * Woher ein Upload kommt — vom Aufrufer im Code gesetzt, nie aus der Anfrage
 * abgeleitet: ein Intake- oder Browser-Aufruf kann den Bridge-Kanal nicht wählen.
 */
export const UPLOAD_CHANNELS = ["browser", "mcp", "intake", "split", "bridge"] as const;
export type UploadChannel = (typeof UPLOAD_CHANNELS)[number];

/** Die DATEV-Bridge lädt über die Files-Lane nur ihre Datensätze
 *  (`datev-<dataset>-<jahr>.json`, datev-bridge-Repo src/flows/common.ts) — keine Belege. */
const BRIDGE_ALLOWLIST: Record<string, readonly string[]> = { json: ["application/json"] };

/** `null` = erlaubt, sonst der Grund für die Ablehnung. */
export function uploadRejection(fileName: string, mimeType: string, channel: UploadChannel): string | null {
  const ext = fileName.toLowerCase().split(".").pop() ?? "";
  const mime = mimeType.toLowerCase().split(";")[0]!.trim();
  const allowed = (channel === "bridge" ? BRIDGE_ALLOWLIST : UPLOAD_ALLOWLIST)[ext];
  if (!allowed) {
    return channel === "bridge"
      ? `Dateityp .${ext} — die Bridge lädt nur JSON-Datensätze hoch.`
      : `Dateityp .${ext} wird nicht angenommen — erlaubt sind PDF, PNG, JPEG, XML, CSV, XLSX und MT940.`;
  }
  if (!allowed.includes(mime)) return `${fileName}: MIME-Typ ${mime || "(leer)"} passt nicht zur Endung .${ext}.`;
  return null;
}
