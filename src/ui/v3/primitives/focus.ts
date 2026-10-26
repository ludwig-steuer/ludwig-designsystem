/**
 * Keeping the focus inside an overlay (V10/V11).
 *
 * It lives in its own file because **both** overlays need it and neither owns
 * it: `Dialog` had the trap, `Drawer` only claimed it in a comment — twelve
 * Tab presses left it twice per round, once onto `body` and once onto the
 * trigger **behind** the scrim (found in the acceptance of 0092). A rule that
 * two bricks state differently is a rule that will drift; this is the one
 * place it stands.
 *
 * `Drawer` and `Dialog` are both primitives, so neither may import from the
 * other — the same reasoning that moved `hotkey.ts` down a level.
 */

import { useEffect, useRef, type RefObject } from "react";

/** Everything a keyboard can reach inside the panel, in document order. */
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keep Tab inside the panel. Without it the focus walks on behind the scrim,
 * and a reader is suddenly operating a page they cannot see.
 *
 * The panel itself counts as the first stop: it carries `tabindex={-1}` and
 * holds the focus after opening, so Shift+Tab from there has to wrap to the
 * last stop instead of leaving.
 *
 * @when    A modal overlay handles a `Tab` keydown — Dialog, Drawer.
 * @instead One key on a button → useHotkey. Several on a screen → useHotkeys.
 */
export function trapTab(panel: HTMLElement | null, e: KeyboardEvent): void {
  if (!panel) return;
  const stops = [...panel.querySelectorAll<HTMLElement>(TABBABLE)].filter(
    (el) => el.offsetParent !== null,
  );
  if (stops.length === 0) return;
  const first = stops[0]!;
  const last = stops[stops.length - 1]!;
  const active = document.activeElement;
  if (e.shiftKey && (active === first || active === panel)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

/**
 * The next record came under the same surface — a pager paged, a decision was
 * saved and the review moved on. If the focus was inside the surface or got
 * lost on `body`, it goes to the new record's heading (give it
 * `tabIndex={-1}`): read aloud, one Tab to its first control. A focus outside
 * — on the pager's arrow — stays, so paging by keyboard keeps its place. The
 * pager announces „Frage 3 von 12" itself (rule for single reviews under
 * RecordPager, llcto 2026-10-26; acceptance 0222 H7, 0223 H6).
 *
 * `onNew` runs first, for state that belongs to the old record.
 *
 * @when    A single review swaps its record in place under a RecordPager —
 *          ClarificationCard `step`, SourceDocumentReview.
 * @instead An overlay opening → its own first focus (Dialog, Drawer). Keeping
 *          Tab inside an overlay → trapTab.
 */
export function useFocusOnNewRecord(
  id: string,
  root: RefObject<HTMLElement | null>,
  heading: RefObject<HTMLElement | null>,
  onNew?: () => void,
): void {
  const shown = useRef(id);
  useEffect(() => {
    if (shown.current === id) return;
    shown.current = id;
    onNew?.();
    const active = document.activeElement;
    const lost = !active || active === document.body || !active.isConnected;
    if (lost || root.current?.contains(active)) heading.current?.focus();
    // Only the record's id decides; the refs are stable, `onNew` is read fresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
}

