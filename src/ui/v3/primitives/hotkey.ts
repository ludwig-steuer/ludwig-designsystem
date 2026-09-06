"use client";

import { useEffect } from "react";

/**
 * The shared half of the keyboard rule (V14) — what counts as typing, and
 * when a key press is meant for a button.
 *
 * It lives one level below `patterns/Hotkeys.tsx` because **both levels need
 * it**: a screen binds several keys at once (`useHotkeys`), and a single
 * `ActionButton` binds the one key it prints on itself. Before this file, the
 * button printed the key and nothing listened — the case V14 forbids
 * explicitly: a visible key without effect (found in the review of 0004).
 *
 * `patterns/Hotkeys.tsx` keeps the screen-level API and the legend; it reads
 * the two functions from here instead of writing them a second time.
 */

/**
 * Inside form fields the user types text, not commands: text inputs,
 * `TEXTAREA`, `SELECT` and `contenteditable` are excluded — **except for
 * combinations with Ctrl/⌘**, which are no typing at all.
 *
 * A checkbox or a radio takes no text — `Space` is all it listens to. Whoever
 * has just ticked three rows with the mouse holds the focus there, and the key
 * at the bulk action has to keep working (0057 E6).
 *
 * @when    Deciding whether a key press was typing or a command.
 * @instead Whether a press means one specific key → matchesKey.
 */
export function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (el.tagName === "INPUT") {
    const type = (el as HTMLInputElement).type;
    return type !== "checkbox" && type !== "radio";
  }
  return el.tagName === "TEXTAREA" || el.tagName === "SELECT";
}

/**
 * Does this press mean that key? Alt never does; Ctrl/⌘ has to match.
 *
 * @when    A key handler has to decide whether a press was meant for it.
 * @instead Binding one key to one button → useHotkey. Several keys on a
 *          screen plus the legend → useHotkeys (`patterns/Hotkeys.tsx`).
 */
export function matchesKey(e: KeyboardEvent, key: string, meta = false): boolean {
  if (e.altKey) return false;
  const withMeta = e.ctrlKey || e.metaKey;
  if (!withMeta && isTyping(e.target)) return false;
  return e.key.toLowerCase() === key.toLowerCase() && withMeta === meta;
}

/**
 * One key, one handler — the binding a button makes for the key it prints.
 *
 * Deliberately **not** a general hotkey API: a screen with several keys uses
 * `useHotkeys` from `patterns/Hotkeys.tsx`, which also feeds the legend. This
 * one exists so that `hotkey` on a button is not decoration.
 *
 * If a screen binds the same key as a button that shows it, the press runs
 * twice. That is a mistake at the call site and stays visible, because the
 * button prints its key: two places claiming one key is exactly what V14
 * wants findable.
 *
 * @when    A single control binds the one key it shows.
 * @instead Several keys on one screen, plus the legend → useHotkeys.
 */
export function useHotkey(
  key: string | undefined,
  handler: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!key || !enabled) return;
    function onKey(e: KeyboardEvent) {
      if (!matchesKey(e, key!)) return;
      e.preventDefault();
      handler();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [key, handler, enabled]);
}
