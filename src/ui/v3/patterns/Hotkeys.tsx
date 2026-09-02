"use client";

import { useEffect, useState } from "react";

import { Dialog } from "../primitives/Dialog";

/**
 * Tastatur (F123 T123.2, UX-Guidelines V14).
 *
 * Hotkeys sind ein **Zusatzweg, nie der einzige**: jede Taste steht sichtbar
 * am Knopf, den sie auslöst (`Button hotkey="A"`), und jede Handlung geht
 * auch mit der Maus. Die Zielgruppe öffnet Ludwig alle zwei bis vier Wochen —
 * eine Anwendung, die man auswendig können muss, ist für sie unbedienbar.
 *
 * In Eingabefeldern tippt die Nutzerin Text, keine Befehle: `INPUT`,
 * `TEXTAREA`, `SELECT` und `contenteditable` sind ausgenommen.
 */

export interface HotkeyBinding {
  /** Die Taste, wie sie am Knopf steht: „A", „J", „?", „1". */
  key: string;
  /** Was sie tut — die Zeile in der Legende. */
  label: string;
  handler: () => void;
  /** Mit Ctrl/⌘. Für seltene Sprünge, damit die Ziffern frei bleiben. */
  meta?: boolean;
}

function inEingabe(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

/**
 * @when    Screen mit Tasten am Knopf; ein Binding je Handlung.
 * @instead Als einziger Weg — jede Taste steht am Knopf (V14).
 */
export function useHotkeys(bindings: readonly HotkeyBinding[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (inEingabe(e.target)) return;
      if (e.altKey) return;
      const meta = e.ctrlKey || e.metaKey;
      const hit = bindings.find(
        (b) => b.key.toLowerCase() === e.key.toLowerCase() && !!b.meta === meta,
      );
      if (!hit) return;
      e.preventDefault();
      hit.handler();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [bindings, enabled]);
}

/**
 * Die Legende hinter `?`. Sie ist **Zusatz, nicht Quelle** — wer sie nie
 * öffnet, findet jede Taste am Knopf.
 *
 * @when    Jeder Screen mit mehr als drei Tasten, geöffnet mit `?`.
 * @instead Als Quelle der Tasten — die Taste steht am Knopf.
 */
export function HotkeyLegende({
  gruppen,
  defaultOpen = false,
}: {
  gruppen: { titel: string; tasten: { key: string; label: string }[] }[];
  /** Nur für Storybook und Tests — im Produkt öffnet `?`. */
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  useHotkeys(
    [{ key: "?", label: "Tastenlegende", handler: () => setOpen((v) => !v) }],
    true,
  );
  return (
    <Dialog open={open} onClose={() => setOpen(false)} title="Tasten" kicker="Zusatzweg" size="md">
      <p style={{ marginTop: 0 }}>
        Jede dieser Handlungen geht auch mit der Maus — die Taste steht am jeweiligen Knopf.
      </p>
      {gruppen.map((g) => (
        <div key={g.titel} style={{ marginTop: "var(--space-4)" }}>
          <div className="lw-overline">{g.titel}</div>
          {g.tasten.map((t) => (
            <div className="v2fields__row" key={`${g.titel}-${t.key}`}>
              <span>{t.label}</span>
              <span>{t.key}</span>
            </div>
          ))}
        </div>
      ))}
    </Dialog>
  );
}
