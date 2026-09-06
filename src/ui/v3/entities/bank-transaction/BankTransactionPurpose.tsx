import { derivePurposeParts, type SepaTags } from "@/ludwig/modules/bank-transactions/domain/statement-line";
import { ActionIcon } from "../../Icons";
import { Badge } from "../../primitives/Badge";
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

/**
 * @when    A payment's purpose is shown — in a row, in the facts, in a drawer.
 * @instead The whole line → BankTransactionCell. The raw record for audit →
 *          RawRecord.
 */
export function BankTransactionPurpose({
  purpose,
  tags,
  variant = "inline",
  fallback = "—",
}: {
  /** The raw column value. `null` renders the fallback. */
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
  fallback?: string;
}) {
  const parts = derivePurposeParts(purpose, tags);
  // No tag block recognised — 10 % of the lines — means the raw value **is**
  // the free text. An (i) without content would be a promise without cover.
  const hasMore = parts.refs.length > 0 || (parts.hadTags && parts.raw.length > 0);

  if (variant === "block") {
    return (
      <div className="v2purp v2purp--block">
        <p className="v2purp__text">{parts.text || fallback}</p>
        {parts.refs.length > 0 ? <Refs refs={parts.refs} /> : null}
        {parts.hadTags && parts.raw ? <Raw raw={parts.raw} /> : null}
      </div>
    );
  }

  return (
    <span className="v2purp v2purp--inline">
      {/* The cut happens in CSS, not by character count: a character count
          never matches a grid column (decision 3 of the Freigabe). */}
      <span className="v2purp__text">{parts.text || fallback}</span>
      {hasMore ? (
        <Popover
          align="start"
          trigger={
            <button type="button" className="v2purp__info" aria-label="Referenzen und Originalwert">
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
 * unshortened, selectable. Only `PURP` is translated, and its `title` carries
 * the code word next to the German one.
 */
const REF_ORDER = ["EREF", "KREF", "MREF", "CRED", "ABWA", "PURP", "OAMT"];

function Refs({ refs }: { refs: { key: string; value: string; hint: string }[] }) {
  const sorted = [...refs].sort((a, b) => REF_ORDER.indexOf(a.key) - REF_ORDER.indexOf(b.key));
  return (
    <div className="v2purp__refs">
      {sorted.map((r) => (
        <span className="v2purp__ref" key={r.key} title={r.hint}>
          <Badge tone="neutral">{r.key}</Badge>
          <span className="v2mono">{r.value}</span>
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
