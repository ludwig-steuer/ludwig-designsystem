"use client";

import { useEffect, useState } from "react";

import { Dialog } from "../primitives/Dialog";
import { Kbd } from "../primitives/Kbd";

/**
 * Keyboard (F123 T123.2, UX guidelines V14).
 *
 * Hotkeys are an **additional path, never the only one**: every key is shown
 * on the button it triggers (`Button hotkey="A"`), and every action also
 * works with the mouse. The target group opens Ludwig every two to four
 * weeks — an application you have to know by heart is unusable for them.
 *
 * Inside form fields the user types text, not commands: `INPUT`,
 * `TEXTAREA`, `SELECT` and `contenteditable` are excluded — **except for
 * combinations with Ctrl/⌘**, which are no typing at all: `⌘K` has to open
 * the command palette from inside the search field it sits next to (0039).
 */

export interface HotkeyBinding {
  /** The key as printed on the button: "A", "J", "?", "1". */
  key: string;
  /** What it does — the line in the legend. */
  label: string;
  handler: () => void;
  /** With Ctrl/⌘. For rare jumps, so the digits stay free. */
  meta?: boolean;
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
}

/**
 * @when    Screen with keys on buttons; one binding per action.
 * @instead As the only path — every key is shown on its button (V14).
 */
export function useHotkeys(bindings: readonly HotkeyBinding[], enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function onKey(e: KeyboardEvent) {
      if (e.altKey) return;
      const meta = e.ctrlKey || e.metaKey;
      if (!meta && isTyping(e.target)) return;
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
 * The legend behind `?`. It is an **addition, not the source** — whoever
 * never opens it still finds every key on its button.
 *
 * @when    Every screen with more than three keys, opened with `?`.
 * @instead As the source of truth for keys — the key is shown on the button.
 */
export function HotkeyLegend({
  groups,
  defaultOpen = false,
}: {
  groups: { title: string; keys: { key: string; label: string }[] }[];
  /** Storybook and tests only — in the product `?` opens it. */
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
      {groups.map((g) => (
        <div key={g.title} style={{ marginTop: "var(--space-4)" }}>
          <div className="lw-overline">{g.title}</div>
          {g.keys.map((t) => (
            <div className="v2fields__row" key={`${g.title}-${t.key}`}>
              <span>{t.label}</span>
              <Kbd>{t.key}</Kbd>
            </div>
          ))}
        </div>
      ))}
    </Dialog>
  );
}
