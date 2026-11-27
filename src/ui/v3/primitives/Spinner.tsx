/**
 * The sign for a short wait (0268): a turning circle next to the word of what
 * is running — „wird geprüft …", „Verbindung wird geprüft …". Lifted out of
 * the button, which keeps its picture and now renders this.
 *
 * One sign, one meaning: the circle says **short**. Work that takes minutes is
 * the gliding piece (`RunMark`, `PhaseProgress`), never a circle that turns
 * for twelve minutes (0225).
 *
 * No `role`, no live region: whoever waits announces it in the one region of
 * the page — five running check rows would otherwise talk over each other.
 * Measures, colour and motion live in `v3.css` (`.v2spin`, `.v3spinner`).
 * Server component.
 */

export type SpinnerSize = "sm" | "lg";

export interface SpinnerProps {
  /**
   * The word next to the circle, visible. `null` only where the word already
   * stands beside it — inside a button; then only the circle renders, hidden
   * from assistive technology. Required on purpose: never a bare circle (V7).
   */
  label: string | null;
  /** `sm` (14 px) next to row text, `lg` (20 px) in an area waiting for a sentence. */
  size?: SpinnerSize;
}

/**
 * @when    A short wait of seconds whose result has no shape yet — a check row
 *          „wird geprüft …", an area „Verbindung wird geprüft …", the loading
 *          button (`label={null}`).
 * @instead The shape of the content is known → Skeleton. A known share →
 *          Progress. Work that takes minutes → PhaseProgress or AgentRunBanner.
 */
export function Spinner({ label, size = "sm" }: SpinnerProps) {
  if (label === null) return <span className="v2spin" aria-hidden="true" />;
  return (
    <span className={`v3spinner v3spinner--${size}`}>
      <span className="v2spin" aria-hidden="true" />
      <span className="v3spinner__label">{label}</span>
    </span>
  );
}
