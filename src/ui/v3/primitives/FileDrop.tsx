"use client";

import { useRef, useState } from "react";
import { ProgressCell } from "./Cells";
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
  const [over, setOver] = useState(false);
  const [rejected, setRejected] = useState<DroppedFile[]>([]);

  function take(list: FileList | null) {
    if (!list || disabled) return;
    const all = Array.from(list);
    const limit = maxSizeMb ? maxSizeMb * 1024 * 1024 : Infinity;
    const bad = all.filter((f) => f.size > limit);
    const good = all.filter((f) => f.size <= limit);
    setRejected(
      bad.map((f) => ({
        id: `${f.name}-${f.size}`,
        name: f.name,
        size: f.size,
        error: `Zu groß — höchstens ${maxSizeMb} MB.`,
      })),
    );
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
        aria-describedby={hint ? "v2drop-hint" : undefined}
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
          <span className="v2drop__hint" id="v2drop-hint">
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
                  <ProgressCell share={f.progress} />
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
