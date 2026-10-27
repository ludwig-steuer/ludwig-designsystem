/**
 * Long free text that would burst a table row: up to `max` characters as is,
 * beyond that a teaser with "mehr ▾" to expand — but only when at least two
 * lines would hide behind it. A fold that hides the last few words costs a
 * click for nothing (llcto for the owner, 2026-10-27, 0234).
 *
 * ponytail: native `<details>` instead of state — works in server components
 * without a client bundle. Styling in `.more` (app-chrome.css).
 *
 * @when    Plain long text in a cell or a narrow column, clamped by
 *          character count.
 * @instead Formatted text from elsewhere → Markdown. A section that folds
 *          away → Disclosure.
 */
export function LongText({
  children,
  max = 180,
  lineChars = 80,
}: {
  children: string;
  max?: number;
  /**
   * About how many characters one line holds where the text stands. The
   * default 80 is running text: the 68ch of `lw-ui-text` hold about 83
   * characters of German prose (measured, 0234 H1). A cell measures its own.
   * Two such lines are the least a fold may hide.
   */
  lineChars?: number;
}) {
  const text = children.trim();
  if (text.length <= max) return <>{text}</>;
  // Cut at the last word boundary before `max`, not mid-word.
  const cut = text.slice(0, max);
  const teaser = cut.slice(0, Math.max(cut.lastIndexOf(" "), Math.floor(max * 0.6))).trimEnd();
  // ponytail: characters, not measured lines — server-side there is no layout;
  // `lineChars` is the caller's estimate of its line.
  if (text.length - teaser.length < 2 * lineChars) return <>{text}</>;
  return (
    <details className="more">
      <summary>
        <span className="more__teaser">{teaser}… </span>
      </summary>
      {text}
    </details>
  );
}
