"use client";

import { useId, useRef, useState } from "react";
import { Progress } from "./Progress";
import { TextButton } from "./TextButton";

/**
 * The place to drop files (0021).
 *
 * The keyboard way comes first: the zone is a button that opens the file
 * dialog, and dragging is the extra, not the only way (V11). It uploads
 * nothing — it reports what was dropped and shows the state the caller holds.
 */

export interface DroppedFile {
  id: string;
  name: string;
  /** Bytes. */
  size: number;
  /** 0…1 while uploading; absent = nothing running. */
  progress?: number;
  /** Rejected or failed — with the reason, not just a colour. */
  error?: string;
}

function humanSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

/**
 * Why a file was turned away — in words, not in MIME.
 *
 * The rejected line used to read „Format nicht vorgesehen —
 * application/pdf,image/*." That is the `accept` attribute, and it belongs to
 * the file dialog, not in front of a clerk (T4/T5, found in the review of
 * 0021). What she needs is the ending she just tried and where the allowed
 * ones are written — and they are written in the `hint`, one line above.
 */
function rejectionReason(name: string, hint?: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot + 1).toUpperCase() : null;
  const what = ext ? `${ext}-Dateien nehmen wir hier nicht` : "Diese Datei nehmen wir hier nicht";
  return hint ? `${what} — erlaubt ist: ${hint.replace(/\.$/, "")}.` : `${what}.`;
}

/**
 * @when    Documents arrive — inbox, document request, an import.
 * @instead A single value from a form → Input. Showing a document that is
 *          already there → the document's own preview.
 */
export function FileDrop({
  label,
  onFiles,
  files = [],
  onRemove,
  accept,
  multiple = true,
  maxSizeMb,
  disabled,
  hint,
}: {
  label: string;
  onFiles: (files: File[]) => void;
  files?: DroppedFile[];
  onRemove?: (id: string) => void;
  accept?: string;
  multiple?: boolean;
  /** Above this size a file is rejected before `onFiles` is called. */
  maxSizeMb?: number;
  disabled?: boolean;
  /** One sentence: allowed formats, size (T6). */
  hint?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  // Two drops on one page must not carry the same `id` — otherwise the
  // `aria-describedby` of both points at the same hint (0021).
  const hintId = useId();
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<DroppedFile[]>([]);

  /**
   * The file dialog filters by `accept` itself — a drop does not. Without
   * this check the same rule would hold for one way in and not the other.
   */
  function accepted(file: File) {
    if (!accept) return true;
    return accept.split(",").some((raw) => {
      const rule = raw.trim().toLowerCase();
      if (!rule) return false;
      if (rule.startsWith(".")) return file.name.toLowerCase().endsWith(rule);
      if (rule.endsWith("/*")) return file.type.startsWith(rule.slice(0, -1));
      return file.type.toLowerCase() === rule;
    });
  }

  function take(list: FileList | null) {
    if (!list || disabled) return;
    const limit = maxSizeMb ? maxSizeMb * 1024 * 1024 : Infinity;
    const bad: DroppedFile[] = [];
    const good: File[] = [];
    for (const f of Array.from(list)) {
      const id = `${f.name}-${f.size}`;
      if (!accepted(f)) bad.push({ id, name: f.name, size: f.size, error: rejectionReason(f.name, hint) });
      else if (f.size > limit) bad.push({ id, name: f.name, size: f.size, error: `Zu groß — höchstens ${maxSizeMb} MB.` });
      else good.push(f);
    }
    setRejected(bad);
    // The rest goes through: one rejected file must not stop the others.
    if (good.length > 0) onFiles(good);
  }

  const shown = [...files, ...rejected];
  return (
    <div>
      <div className="v2field__label">{label}</div>
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          take(e.target.files);
          e.target.value = "";
        }}
      />
      <button
        type="button"
        className={`v2drop${over ? " is-over" : ""}`}
        disabled={disabled}
        aria-describedby={hint ? hintId : undefined}
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          take(e.dataTransfer.files);
        }}
      >
        <span>Datei wählen oder hierher ziehen</span>
        {hint ? (
          <span className="v2drop__hint" id={hintId}>
            {hint}
          </span>
        ) : null}
      </button>
      {shown.length > 0 ? (
        <div className="v2droplist">
          {shown.map((f) => (
            <div className="v2dropfile" key={f.id}>
              <span>{f.name}</span>
              <span className="v2dropfile__size">{humanSize(f.size)}</span>
              <span>
                {f.progress !== undefined && f.progress < 1 ? (
                  <Progress share={f.progress} />
                ) : onRemove && !f.error ? (
                  <TextButton tone="quiet" onClick={() => onRemove(f.id)}>
                    Entfernen
                  </TextButton>
                ) : null}
              </span>
              {f.error ? <span className="v2dropfile__err">{f.error}</span> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
