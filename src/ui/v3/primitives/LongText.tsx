/**
 * Long free text that would burst a table row: up to `max` characters as is,
 * beyond that a teaser with "mehr ▾" to expand.
 *
 * ponytail: native `<details>` instead of state — works in server components
 * without a client bundle. Styling in `.more` (app-chrome.css).
 *
 * @when    Plain long text in a cell or a narrow column, clamped by
 *          character count.
 * @instead Formatted text from elsewhere → Markdown. A section that folds
 *          away → Disclosure.
 */
export function LongText({ children, max = 180 }: { children: string; max?: number }) {
  const text = children.trim();
  if (text.length <= max) return <>{text}</>;
  // Cut at the last word boundary before `max`, not mid-word.
  const cut = text.slice(0, max);
  const teaser = cut.slice(0, Math.max(cut.lastIndexOf(" "), Math.floor(max * 0.6))).trimEnd();
  return (
    <details className="more">
      <summary>
        <span className="more__teaser">{teaser}… </span>
      </summary>
      {text}
    </details>
  );
}
