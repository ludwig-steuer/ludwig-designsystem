/**
 * Langer Freitext, der eine Tabellenzeile sonst sprengt: bis `max` Zeichen
 * direkt, darüber als Teaser mit „mehr ▾" zum Ausklappen.
 *
 * ponytail: natives `<details>` statt State — funktioniert in Server-
 * Komponenten, ohne Client-Bundle. Styling in `.more` (app-chrome.css).
 *
 * @when    Plain long text in a cell or a narrow column, clamped by
 *          character count.
 * @instead Formatted text from elsewhere → Markdown. A section that folds
 *          away → Disclosure.
 */
export function LongText({ children, max = 180 }: { children: string; max?: number }) {
  const text = children.trim();
  if (text.length <= max) return <>{text}</>;
  // An der letzten Wortgrenze vor `max` schneiden, nicht mitten im Wort.
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
