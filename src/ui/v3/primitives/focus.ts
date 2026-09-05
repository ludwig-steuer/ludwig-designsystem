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
