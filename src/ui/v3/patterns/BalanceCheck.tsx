import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";

import { formatAmount } from "../format";
import { AmountCell } from "../primitives/Cells";
import { StateIcon } from "./Review";

/**
 * Does it add up? (0188, roadmap B6)
 *
 * Five places ask it and answer differently today: „Rest 12,40 €" in the
 * booking grid, „Der Saldo ist nicht ausgeglichen" at a case, a message in the
 * editor, a target of zero at a clearing account, opening against closing
 * balance on a statement. The sum is the same arithmetic everywhere; only the
 * sentence around it differed.
 *
 * **The one calculation happens here.** Adding the lines and subtracting the
 * target is not a derivation the caller should repeat — it is the statement
 * this component exists for. Everything else stays with the caller (E2).
 */

export interface BalanceLine {
  key: string;
  label: ReactNode;
  value: number;
  /** Half a sentence under the line — where the figure comes from. */
  hint?: ReactNode;
}

/** Below this it counts as balanced: half a cent is rounding (the same bound as 0113). */
const DEFAULT_TOLERANCE = 0.005;

/**
 * @when    „Does it add up?" — a statement against its closing balance, a
 *          clearing account against zero, debit against credit, a batch
 *          against its check figure.
 * @instead Two sets of records against each other → ReconciliationTable. Two
 *          states of one record → DiffView. Figures per month → PeriodGrid.
 */
export function BalanceCheck({
  lines,
  target,
  currency,
  tolerance = DEFAULT_TOLERANCE,
  balanced = "Geht auf.",
  off,
  tone = "surface",
}: {
  /** The summands: opening balance, movements — or debit and credit. */
  lines: readonly BalanceLine[];
  /** What it should come to: the closing balance, the zero, the debit total. */
  target: { label: ReactNode; value: number };
  currency: Currency;
  /** From here on it does **not** add up any more. */
  tolerance?: number;
  /** The sentence when it adds up. */
  balanced?: string;
  /** The sentence when it does not — it replaces the figure, so it may name it. */
  off?: (difference: number) => ReactNode;
  /** `bare` in the foot of a card that already has a frame. */
  tone?: "surface" | "bare";
}) {
  const sum = lines.reduce((total, line) => total + line.value, 0);
  const difference = sum - target.value;
  const ok = Math.abs(difference) < tolerance;
  // The caller's sentence stands **instead of** the figure, not beside it: it
  // usually names the amount itself, and the same number twice in one line is
  // one number too many. Without it the line is the signed difference plus the
  // word that says which way — colour alone says nothing (V7).
  const custom = ok ? null : off?.(difference);

  return (
    <div className={`v3bal${tone === "bare" ? " v3bal--bare" : ""}`}>
      {lines.map((line) => (
        <div className="v3bal__row" key={line.key}>
          <span className="v3bal__label">
            {line.label}
            {line.hint ? <span className="v2sub">{line.hint}</span> : null}
          </span>
          <span className="v2num">
            <AmountCell value={line.value} currency={currency} />
          </span>
        </div>
      ))}

      <div className="v3bal__row v3bal__row--target">
        <span className="v3bal__label">{target.label}</span>
        <span className="v2num">
          <AmountCell value={target.value} currency={currency} />
        </span>
      </div>

      {/* One result line. When it adds up the difference is **not** repeated as
          „0,00 €" — the sentence is the result (L6); when it does not, the
          figure carries its sign and the word beside it, because colour alone
          says nothing (V7). */}
      <p className={`v3bal__result${ok ? " is-ok" : " is-off"}`}>
        <StateIcon state={ok ? "done" : "warning"} title={ok ? "geht auf" : "geht nicht auf"} />
        <span className="v3bal__says">
          {ok || custom ? null : (
            <span className="v2amount">{formatAmount(difference, currency, true)}</span>
          )}
          {ok ? balanced : (custom ?? (difference < 0 ? "zu wenig." : "zu viel."))}
        </span>
      </p>
    </div>
  );
}
