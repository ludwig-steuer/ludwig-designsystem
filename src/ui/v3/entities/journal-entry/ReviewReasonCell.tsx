import { REVIEW_SCORING, type ReviewReason } from "@/ludwig/modules/accounting-cases/domain/review-score";
import { resolveStatus, type StatusKind } from "@/ludwig/ui/status/status-registry";

import { formatCount } from "../../format";
import { ActionIcon } from "../../Icons";
import { Badge, type BadgeTone } from "../../primitives/Badge";
import { Popover } from "../../primitives/Popover";

/**
 * The strongest review reason of an entry — the one word step 3 needs to know
 * why to look (F355 / 0218, owner 2026-10-01: one column instead of level and
 * special case). The words come from the app's registry axis `review_reason`;
 * this cell has no word list of its own.
 */

/** One review reason, resolved by the app from the registry axis `review_reason`. */
export interface ReviewReasonView {
  /** The registry code — `check_red:P-UST`, `judge_flag`, `reverse_charge` … */
  code: string;
  /** The short word of the registry — for a check, the check's short word. */
  label: string;
  kind: StatusKind;
  /** This case's particular — the finding, the judge's comment, „Ludwig: 62 %", „BU 94 · Sachverhalt 7". */
  detail?: string | null;
}

/**
 * A7 in a list: warning is the highest colour. Red stays with what blocks the
 * release — a red check inside the case —, not with a reason to look.
 */
const TONE: Record<StatusKind, BadgeTone> = {
  danger: "warning",
  warning: "warning",
  info: "info",
  success: "success",
  neutral: "neutral",
};

/** „−25" — the true minus, never a hyphen (T7). */
const count = (n: number) => `${n < 0 ? "−" : ""}${formatCount(Math.abs(n))}`;
/** „+60", „−25". */
const signed = (n: number) => (n < 0 ? count(n) : `+${formatCount(n)}`);

/**
 * @when    Why one entry should be looked at, in a row: the strongest reason
 *          as a word, its particular on hover, the whole sum behind the (i).
 * @instead The judge's verdict and confidence on their own → AiBookingNotesCell.
 *          The tab a case stands in → StatusBadge axis `review_tab`. The checks
 *          themselves → CheckItems.
 */
export function ReviewReasonCell({
  reasons,
  score,
}: {
  /** The review reasons, strongest first — the app orders. Empty: routine, the cell stays empty. */
  reasons: readonly ReviewReasonView[];
  /** The parts of the review score with their points (F232) — for the (i). */
  score: { score: number; reasons: readonly ReviewReason[]; hard?: boolean };
}) {
  const [top, ...rest] = reasons;
  if (!top) return null;
  // The tab's own word from the registry — not a second spelling of it here.
  const tab = resolveStatus("review_tab", "needs_review").label;
  return (
    <span className="v3rrc">
      {/* The particular on hover (owner): the native title — and the same
          sentences stand in the (i) for keyboard and touch. */}
      <span className="v3rrc__word" title={top.detail ?? undefined}>
        <Badge tone={TONE[top.kind]}>{top.label}</Badge>
      </span>
      {rest.length > 0 ? (
        <span className="v3rrc__more" title={rest.map((r) => r.label).join(" · ")}>
          +{formatCount(rest.length)}
        </span>
      ) : null}
      <Popover
        align="end"
        trigger={
          <button type="button" className="v2purp__info" aria-label="Prüfgründe und Berechnung" title="Prüfgründe und Berechnung">
            <ActionIcon action="info" size={14} />
          </button>
        }
      >
        <div className="v3rrc__panel">
          <ul className="v3rrc__reasons">
            {reasons.map((r) => (
              <li key={r.code}>
                <Badge tone={TONE[r.kind]}>{r.label}</Badge>
                {r.detail ? <span className="v3rrc__detail">{r.detail}</span> : null}
              </li>
            ))}
          </ul>
          <table className="v3rrc__parts">
            <caption>Prüfbedarf</caption>
            <tbody>
              {score.reasons.map((r) => (
                <tr key={r.code}>
                  <th scope="row">{r.label}</th>
                  <td className="v2num">{signed(r.points)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Summe</th>
                <td className="v2num">{count(score.score)}</td>
              </tr>
              <tr>
                <th scope="row">Schwelle „{tab}"</th>
                <td className="v2num">{formatCount(REVIEW_SCORING.threshold)}</td>
              </tr>
            </tfoot>
          </table>
          {score.hard && score.score < REVIEW_SCORING.threshold ? (
            <p className="v3rrc__note">Ein Grund reicht allein für „{tab}".</p>
          ) : null}
        </div>
      </Popover>
    </span>
  );
}
