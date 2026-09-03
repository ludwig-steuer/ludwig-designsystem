import { Fragment } from "react";
import type { CSSProperties, ReactElement } from "react";

/**
 * Text we did not write (0022).
 *
 * Taken over from `ludwig/app` (`ui/Markdown.tsx`) and put on the v3 rules:
 * classes instead of inline pixels, links added, and the pixel sizes of the
 * headings gone. What stayed is the important part — it renders **React
 * elements only**, never `dangerouslySetInnerHTML`. React escapes text nodes,
 * so no agent text can carry markup into the page.
 *
 * ponytail: a deliberately small subset — paragraph, emphasis, code, list,
 * heading, rule, table, quote, fenced code, link. No nested lists, no images,
 * no footnotes, no raw HTML, and **no emphasis across a line break** (the
 * regexes stop at `\n` on purpose, otherwise `lifecycle_status` swallows half
 * a paragraph). Should that ever be too little, this is the file to replace
 * with `react-markdown`, and nothing else changes.
 */

type InlineTok =
  | { t: "text" | "b" | "i" | "code"; v: string }
  | { t: "link"; v: string; href: string };

type Block =
  | { type: "p"; lines: InlineTok[][] }
  | { type: "list"; ordered: boolean; items: InlineTok[][] }
  | { type: "h"; level: number; toks: InlineTok[] }
  | { type: "quote"; lines: InlineTok[][] }
  | { type: "fence"; code: string }
  | { type: "hr" }
  | { type: "table"; header: InlineTok[][]; rows: InlineTok[][][] };

// Order is priority: **bold** · `code` · ![alt](src) · [text](href) · *italic*
// · _italic_. The image form is matched only to swallow it — see below.
// `_italic_` only at word boundaries — agent texts are full of
// `lifecycle_status`, and without the lookarounds the regex ate everything
// between two underscores.
const INLINE_RE =
  /(\*\*[^*]+\*\*|`[^`]+`|!\[[^\]\n]*\]\([^)\s]+\)|\[[^\]\n]+\]\([^)\s]+\)|\*[^*\n]+\*|(?<![\w`])_[^_\n]+_(?![\w`]))/g;

/**
 * Only `http`, `https` and `mailto` survive. A `javascript:` link is dropped
 * silently and the text stays — a rejected link is no reason for a red message
 * to the accountant.
 */
function safeHref(href: string): string | null {
  const clean = href.trim();
  return /^(https?:\/\/|mailto:|\/|#)/i.test(clean) ? clean : null;
}

export function parseInline(text: string): InlineTok[] {
  const out: InlineTok[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ t: "text", v: text.slice(last, idx) });
    const tok = m[0];
    if (tok.startsWith("**")) out.push({ t: "b", v: tok.slice(2, -2) });
    // An image is dropped, its alt text stays — we render no remote images.
    else if (tok.startsWith("![")) out.push({ t: "text", v: tok.slice(2, tok.indexOf("](")) });
    else if (tok.startsWith("`")) out.push({ t: "code", v: tok.slice(1, -1) });
    else if (tok.startsWith("[")) {
      const cut = tok.indexOf("](");
      const label = tok.slice(1, cut);
      const href = safeHref(tok.slice(cut + 2, -1));
      out.push(href ? { t: "link", v: label, href } : { t: "text", v: label });
    } else out.push({ t: "i", v: tok.slice(1, -1) });
    last = idx + tok.length;
  }
  if (last < text.length) out.push({ t: "text", v: text.slice(last) });
  return out;
}

const LIST_RE = /^\s*(?:[-*]|\d+\.)\s+(.*)$/;
const ORDERED_RE = /^\s*\d+\.\s+/;
const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const FENCE_RE = /^\s*```/;
/** Separator row of a GFM table: `|---|:--:|`. */
const TABLE_SEP_RE = /^\s*\|?[\s:|-]*-[\s:|-]*\|[\s:|-]*$/;

// ponytail: naive split on `|` — a pipe inside inline code would tear it
// apart; that does not happen in the texts this renders.
function splitRow(line: string): InlineTok[][] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => parseInline(c.trim()));
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];

  const flush = (): void => {
    if (para.length === 0) return;
    if (LIST_RE.test(para[0] ?? "")) {
      const items: string[] = [];
      for (const line of para) {
        const m = line.match(LIST_RE);
        if (m) items.push(m[1] ?? "");
        else items[items.length - 1] += ` ${line.trim()}`;
      }
      blocks.push({
        type: "list",
        ordered: ORDERED_RE.test(para[0] ?? ""),
        items: items.map(parseInline),
      });
    } else {
      blocks.push({ type: "p", lines: para.map((l) => parseInline(l)) });
    }
    para = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      flush();
      continue;
    }
    if (FENCE_RE.test(line)) {
      flush();
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE_RE.test(lines[i] ?? "")) {
        code.push(lines[i] ?? "");
        i++;
      }
      blocks.push({ type: "fence", code: code.join("\n") });
      continue;
    }
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      flush();
      blocks.push({ type: "hr" });
      continue;
    }
    if (QUOTE_RE.test(line)) {
      flush();
      const quoted: string[] = [];
      while (i < lines.length && QUOTE_RE.test(lines[i] ?? "")) {
        quoted.push((lines[i] ?? "").match(QUOTE_RE)?.[1] ?? "");
        i++;
      }
      i--;
      blocks.push({ type: "quote", lines: quoted.map(parseInline) });
      continue;
    }
    const h = HEADING_RE.exec(line);
    if (h) {
      flush();
      blocks.push({ type: "h", level: h[1]!.length, toks: parseInline(h[2] ?? "") });
      continue;
    }
    if (line.trimStart().startsWith("|") && TABLE_SEP_RE.test(lines[i + 1] ?? "")) {
      flush();
      const header = splitRow(line);
      const rows: InlineTok[][][] = [];
      i += 2;
      while (i < lines.length && (lines[i] ?? "").trimStart().startsWith("|")) {
        rows.push(splitRow(lines[i] ?? ""));
        i++;
      }
      i--;
      blocks.push({ type: "table", header, rows });
      continue;
    }
    // A list that follows an intro line without a blank line between them —
    // agent reports are written exactly like that.
    if (LIST_RE.test(line) && para.length > 0 && !LIST_RE.test(para[0] ?? "")) flush();
    para.push(line);
  }
  flush();
  return blocks;
}

function Inline({ toks }: { toks: InlineTok[] }): ReactElement {
  return (
    <>
      {toks.map((t, i) =>
        t.t === "b" ? (
          <strong key={i}>{t.v}</strong>
        ) : t.t === "i" ? (
          <em key={i}>{t.v}</em>
        ) : t.t === "code" ? (
          <code className="v2mk__code" key={i}>
            {t.v}
          </code>
        ) : t.t === "link" ? (
          // New tab and the target in the tooltip: the text is not ours, so
          // nobody should follow one of its links without seeing where to.
          <a
            className="v2link"
            key={i}
            href={t.href}
            title={t.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.v}
          </a>
        ) : (
          <Fragment key={i}>{t.v}</Fragment>
        ),
      )}
    </>
  );
}

/**
 * @when    Text someone else wrote — an agent's reasoning, a note, a playbook.
 * @instead Text we write ourselves → plain JSX. A value with a label →
 *          FieldList. A table of data → Table.
 */
export function Markdown({
  text,
  variant = "full",
  maxHeight,
  className,
  flow,
}: {
  /** `null` renders nothing — no empty box, no em dash. */
  text: string | null;
  /** `inline` allows emphasis, code and links only — for a cell or a row. */
  variant?: "full" | "inline";
  /** Above this height it fades out and offers „Ganz lesen". */
  maxHeight?: number;
  className?: string;
  /**
   * Ignore hard line breaks of the source (running text). For documents that
   * are wrapped at 80 characters in the repo.
   */
  flow?: boolean;
}) {
  if (!text || !text.trim()) return null;

  if (variant === "inline") {
    return (
      <span className={`v2mk v2mk--inline${className ? ` ${className}` : ""}`}>
        <Inline toks={parseInline(text.replace(/\s*\n\s*/g, " "))} />
      </span>
    );
  }

  const body = <div className="v2mk__body">{parseMarkdown(text).map(renderBlock(flow))}</div>;

  if (maxHeight) {
    // Native `<details>`: fading and „Ganz lesen" without a single line of
    // state, so this stays a server component.
    return (
      <details
        className={`v2mk v2mk--clamp${className ? ` ${className}` : ""}`}
        style={{ "--v2mk-max": `${maxHeight}px` } as CSSProperties}
      >
        <summary className="v2mk__more">Ganz lesen</summary>
        {body}
      </details>
    );
  }
  return <div className={`v2mk${className ? ` ${className}` : ""}`}>{body}</div>;
}

function renderBlock(flow?: boolean) {
  return function block(b: Block, i: number) {
    if (b.type === "hr") return <hr className="v2mk__hr" key={i} />;
    if (b.type === "h") {
      // Headings always render one level below the page — no agent text may
      // produce an `h1`.
      const H = (b.level <= 2 ? "h3" : b.level === 3 ? "h4" : "h5") as "h3" | "h4" | "h5";
      return (
        <H className={`v2mk__h v2mk__h--${Math.min(b.level, 4)}`} key={i}>
          <Inline toks={b.toks} />
        </H>
      );
    }
    if (b.type === "quote") {
      return (
        <blockquote className="v2mk__quote" key={i}>
          {b.lines.map((ln, j) => (
            <Fragment key={j}>
              {j > 0 ? <br /> : null}
              <Inline toks={ln} />
            </Fragment>
          ))}
        </blockquote>
      );
    }
    if (b.type === "fence") {
      return (
        <pre className="v2mk__pre" key={i}>
          <code>{b.code}</code>
        </pre>
      );
    }
    if (b.type === "table") {
      return (
        <div className="v2mk__tblwrap" key={i}>
          <table className="v2mk__tbl">
            <thead>
              <tr>
                {b.header.map((c, j) => (
                  <th key={j}>
                    <Inline toks={c} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, j) => (
                <tr key={j}>
                  {row.map((c, k) => (
                    <td key={k}>
                      <Inline toks={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (b.type === "list") {
      const items = b.items.map((it, j) => (
        <li key={j}>
          <Inline toks={it} />
        </li>
      ));
      return b.ordered ? (
        <ol className="v2mk__list" key={i}>
          {items}
        </ol>
      ) : (
        <ul className="v2mk__list" key={i}>
          {items}
        </ul>
      );
    }
    return (
      <p className="v2mk__p" key={i}>
        {b.lines.map((ln, j) => (
          <Fragment key={j}>
            {j > 0 ? flow ? " " : <br /> : null}
            <Inline toks={ln} />
          </Fragment>
        ))}
      </p>
    );
  };
}
