import {
  derivePurposeParts,
  PURP_LABELS,
  type SepaTags,
} from "@/ludwig/modules/bank-transactions/domain/statement-line";
import { ActionIcon } from "../../Icons";
import { Link } from "../../primitives/Link";
import { Popover } from "../../primitives/Popover";

/**
 * The purpose of a payment, made readable (0099).
 *
 * The raw value of a SEPA line is not for people: banks pack seven mandatory
 * fields into the one free-text column and mark them with four-letter
 * prefixes. 90 % of the lines carry at least one reference.
 *
 * What a person reads is the SVWZ free text; the references stand **beside**
 * it, reachable, not first. The unchanged original stays reachable too —
 * nothing is lost, it is only no longer what hits the eye.
 *
 * The cutting up is **not** done here: `derivePurposeParts()` lives in the
 * mirror (`modules/bank-transactions/domain/statement-line.ts`) since the app
 * lifted it there with `cc141f7b`. The list's search reads the same function
 * without drawing anything — that is why it belongs there and not a second
 * time here.
 *
 * `PURP_LABELS`, which the derivation applies, translates ISO-20022 **code
 * words**, not a status: there is no axis behind it, and the registry rule
 * („no local label map") is untouched — the map is not local, and it is not a
 * status.
 */

/** No purpose at all — the em dash, the set's one word for „nothing here". */
const EMPTY = "—";

/**
 * @when    A payment's purpose is shown — in a row, in the facts, in a drawer.
 * @instead The whole line → BankTransactionCell. The raw record for audit →
 *          RawRecord.
 */
export function BankTransactionPurpose({
  purpose,
  tags,
  variant = "inline",
  href,
}: {
  /** The raw column value. `null` renders the em dash. */
  purpose: string | null;
  /**
   * Tags parsed at import time (`raw_payload.parsed_sepa_tags`). They win over
   * re-parsing — the fallback exists for legacy rows, not as a second way.
   */
  tags?: SepaTags | null;
  /**
   * `inline`: one line, references behind the (i) — for a table cell.
   * `block`: free text plus the chips below it — for facts and drawer.
   */
  variant?: "inline" | "block";
  /**
   * Makes the free text a link — **not** the whole component, because the (i)
   * is a button and a button inside an anchor is not valid markup. Exists for
   * the one case where the purpose is the identity: a payment without a
   * counterparty (0100, 3 % of the lines). Works in both variants, and both
   * are proved: `inline` by `BankTransactionCell --without-counterparty`,
   * `block` by the second surface in the story `Block` (acceptance 0099, M12
   * — the sentence had claimed both and shown one).
   */
  href?: string;
}) {
  const parts = derivePurposeParts(purpose, tags);
  // No tag block recognised — 10 % of the lines — means the raw value **is**
  // the free text. An (i) without content would be a promise without cover.
  const hasMore = parts.refs.length > 0 || (parts.hadTags && parts.raw.length > 0);
  // **A tag block without SVWZ is not a free text.** The derivation falls back
  // to the whole block then, and that block would stand exactly where the
  // head rule never wants it: first. So it does not: the line says there is no
  // text, and the block stays behind the (i) with the references.
  const blockAsText =
    parts.hadTags && parts.text === parts.raw.replace(/\s+/g, " ").trim();
  const text = blockAsText ? "" : parts.text;

  if (variant === "block") {
    return (
      <div className="v2purp v2purp--block">
        <p className="v2purp__text">
          {href ? <Link href={href}>{text || EMPTY}</Link> : text || EMPTY}
        </p>
        {parts.refs.length > 0 ? <Refs refs={parts.refs} /> : null}
        {parts.hadTags && parts.raw ? <Raw raw={parts.raw} /> : null}
      </div>
    );
  }

  return (
    <span className="v2purp v2purp--inline">
      {/* The cut happens in CSS, not by character count: a character count
          never matches a grid column (decision 3 of the Freigabe). */}
      {/* `title` on the shortened line: Z3 allows exactly this — one word of
          explanation for an element that already has a name, without
          JavaScript. Whoever loses the end of the sentence gets it back
          without opening anything. */}
      <span className="v2purp__text" title={text || undefined}>
        {href ? <Link href={href}>{text || EMPTY}</Link> : text || EMPTY}
      </span>
      {hasMore ? (
        <Popover
          align="start"
          trigger={
            // `title` next to `aria-label`: the screen reader hears the one,
            // the mouse reads the other — a mark without a word needs both
            // (V11, acceptance 0099, M14).
            <button
              type="button"
              className="v2purp__info"
              aria-label="Referenzen und Originalwert"
              title="Referenzen und Originalwert"
            >
              <ActionIcon action="info" size={14} />
            </button>
          }
        >
          <div className="v2purp__panel">
            {parts.refs.length > 0 ? <Refs refs={parts.refs} /> : null}
            {parts.hadTags && parts.raw ? <Raw raw={parts.raw} /> : null}
          </div>
        </Popover>
      ) : null}
    </span>
  );
}

/**
 * The seven references as chips, in the order of their **frequency in the
 * data** — EREF 82 %, KREF 34 %, MREF 31 %, CRED 30 %, ABWA 11 %, PURP 3 %,
 * OAMT under 1 %.
 *
 * The mirror hands them in a different order (ABWA last), and that order is
 * not a decision — it is the sequence in which the derivation happens to
 * build its list. Which reference a person looks for first **is** a display
 * decision, so it is made here, once, by a named order and not by a second
 * derivation of the content.
 *
 * Six of the seven are identifiers and stay exactly as they are: mono,
 * unshortened, selectable. `PURP` is the one exception the profile names: it
 * is a **code word**, and the code word `RINP` tells nobody anything. It
 * therefore shows the German word and keeps the code in its `title` — the
 * translation comes from `PURP_LABELS` in the mirror, so no map lives here.
 */
const REF_ORDER = ["EREF", "KREF", "MREF", "CRED", "ABWA", "PURP", "OAMT"];

function Refs({ refs }: { refs: { key: string; value: string; hint: string }[] }) {
  const sorted = [...refs].sort((a, b) => REF_ORDER.indexOf(a.key) - REF_ORDER.indexOf(b.key));
  return (
    <div className="v2purp__refs">
      {sorted.map((r) => (
        <span className="v2purp__ref" key={r.key} title={r.hint}>
          {/* Not a `Badge`: in this set a badge means a state, and a SEPA key
              is an identifier. It gets its own quiet chip. */}
          <span className="v2purp__key">{r.key}</span>
          {r.key === "PURP" ? (
            <span title={r.value}>{PURP_LABELS[r.value] ?? r.value}</span>
          ) : (
            <span className="v2mono">{r.value}</span>
          )}
        </span>
      ))}
    </div>
  );
}

/** What the bank wrote, unchanged. Collapsed — it is the fallback, not the answer. */
function Raw({ raw }: { raw: string }) {
  return (
    <details className="v2purp__raw">
      <summary>Originalwert</summary>
      <pre className="v2mono">{raw}</pre>
    </details>
  );
}
