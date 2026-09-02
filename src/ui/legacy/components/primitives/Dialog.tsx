"use client";

import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Maximale Breite des Panels (px). Default 560. */
  maxWidth?: number;
}

/**
 * Minimales, zugängliches Modal-Primitiv. Backdrop + ESC schließen.
 * Markup-Konvention gespiegelt aus `CaseDocumentUploaderModal`
 * (role="dialog", fixed inset:0, Backdrop rgba(15,17,22,0.55), zIndex 1000).
 */
/** @deprecated seit F123 — nutze `@/ui/v3` — `Dialog` (Drawer-Anatomie, Scrim mit Blur) oder `GrundDialog` für Handlungen mit Begründung. */
export function Dialog({ open, onClose, title, children, maxWidth = 560 }: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 17, 22, 0.55)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth,
          maxHeight: "85vh",
          overflow: "auto",
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: 12,
          boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
        }}
      >
        {title != null ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "14px 18px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-primary)" }}>{title}</div>
            <button
              type="button"
              aria-label="Schließen"
              onClick={onClose}
              className="btn btn-secondary btn-sm"
              style={{ padding: "4px 8px" }}
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        ) : null}
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    </div>
  );
}
