"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Keeps the focus of a live `CheckItems` list when it folds (0270, H4).
 *
 * A row that stays single after the check keeps its DOM node, and with it the
 * focus (one keyed array, M2). A row that folds into a group — a passed item
 * with a `jump` — is drawn anew inside a closed `<details>`; the focus on its
 * jump would fall to the body. This island remembers the row the focus was in
 * and, once the list has folded and the focus is gone, puts it on the head of
 * the group that now holds the row. Rendered only with `live`, so a static
 * list stays a server component without client code.
 *
 * Internal to the Review family, not exported from the barrel.
 *
 * @when    Only inside `CheckItems` with `live` — never on its own.
 * @instead Any other list → nothing; keep rows keyed so their nodes survive.
 */
export function CheckFoldFocus({ folded }: { folded: boolean }) {
  const anchor = useRef<HTMLSpanElement>(null);
  const lastRow = useRef<string | null>(null);

  useEffect(() => {
    const list = anchor.current?.parentElement;
    if (!list) return;
    const remember = (e: FocusEvent) => {
      const row = e.target instanceof Element ? e.target.closest("[data-code]") : null;
      lastRow.current = row && list.contains(row) ? row.getAttribute("data-code") : null;
    };
    // Focus that moves elsewhere on the page releases the memory.
    const release = (e: FocusEvent) => {
      if (e.target instanceof Node && !list.contains(e.target)) lastRow.current = null;
    };
    // Leaving the list into nothing (a click on empty ground puts focus on
    // body without a focusin) also lets go — but only if the row is still
    // there; a row the fold removed keeps its memory (0270 recheck H7).
    const leave = (e: FocusEvent) => {
      if (e.relatedTarget !== null) return;
      const left = e.target;
      queueMicrotask(() => {
        if (left instanceof Node && left.isConnected) lastRow.current = null;
      });
    };
    list.addEventListener("focusin", remember);
    list.addEventListener("focusout", leave);
    document.addEventListener("focusin", release);
    return () => {
      list.removeEventListener("focusin", remember);
      list.removeEventListener("focusout", leave);
      document.removeEventListener("focusin", release);
    };
  }, []);

  useLayoutEffect(() => {
    if (!folded || !lastRow.current) return;
    const list = anchor.current?.parentElement;
    if (!list) return;
    const active = document.activeElement;
    // The focus survived (the row stayed single) or stands elsewhere on purpose.
    if (active && active !== document.body) return;
    const row = list.querySelector(`[data-code="${CSS.escape(lastRow.current)}"]`);
    const head = row?.closest("details")?.querySelector("summary");
    if (head instanceof HTMLElement) head.focus();
  }, [folded]);

  return <span ref={anchor} hidden />;
}
