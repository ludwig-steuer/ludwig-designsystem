import {
  expectationMaturity,
  type ExpectationKind,
} from "@/ludwig/modules/accounting-cases/domain/case";
// The record is `ExpectationRow` over there and a component here, so it comes
// in under the name the glossary uses for the thing itself.
import type {
  ExpectationAudience,
  ExpectationRow as Expectation,
} from "@/ludwig/modules/accounting-cases/domain/expectation";
import type { Currency } from "@/ludwig/shared/money";
import { StatusBadge } from "../../patterns/StatusBadge";
import { AmountCell } from "../../primitives/Cells";
import { Time } from "../../primitives/Time";

/**
 * „Es fehlt noch etwas" — as a chip and as a row (0025).
 *
 * In Ludwig that sentence is a record with a due date, a maturity and an
 * escalation level; visible was almost none of it. The clerk read derived
 * sentences („3 Nachforderungen") and could not see **which** expectation had
 * been overdue since when.
 *
 * Two densities of the same fields: the chip names one expectation beside a
 * case, the row carries the whole record in a list.
 *
 * **The maturity is fetched, not computed.** `expectationMaturity()` lives in
 * the domain and is the one rule for every reader; a second derivation here
 * would be the second truth its comment forbids.
 */

/**
 * One expectation, as far as chip and row show it — **from the mirror**.
 *
 * Until 2026-09-07 this was a copy: the record sat in `application/` and could
 * not be mirrored (finding L-70). The app moved it to `domain/expectation.ts`
 * with `3048389d`, so the fields come from there now. What stays is the
 * selection: five fields are required, because chip and row cannot draw
 * without them, and the rest is optional because a caller shows what it has.
 *
 * `resolvedAt` is **not** in the record. The column exists (`resolved_at`, and
 * `expectation-core.ts` writes it), the lifted model does not carry it —
 * finding **L-205**. Until then it stays here, and it is the one field of this
 * type that is not the mirror's.
 */
export interface ExpectationVM extends Partial<Expectation> {
  id: string;
  kind: ExpectationKind;
  /** The due date, `YYYY-MM-DD`. Always set — every expectation has one. */
  dueDate: string;
  /** How often a run has escalated it. **Never** a DATEV dunning level. */
  escalationLevel: number;
  /** Who fetches it (F125): `client` says „Nachforderung", `accounting` „Erwartung". */
  audience: ExpectationAudience;
  /** Set as soon as the document arrived or the payment came in (L-205). */
  resolvedAt?: string | null;
}

/** „Nachforderung" when the client fetches it, „Erwartung" when the office does. */
function audienceWord(audience: ExpectationVM["audience"]): string {
  return audience === "client" ? "Nachforderung" : "Erwartung";
}

/**
 * What is expected, in words: the document kind if the caller has a word for
 * it, else the axis label („Beleg fehlt", „Zahlung offen").
 *
 * The kinds are a **free string** of the database — there is no axis for them,
 * and a map here would be a third truth beside `FehltPanel` and the DB. So the
 * caller passes its words, or the axis speaks.
 */
function subject(
  e: ExpectationVM,
  documentKindLabel: Record<string, string> | undefined,
): string | null {
  if (e.kind !== "document" || !e.expectedDocumentKind) return null;
  return documentKindLabel?.[e.expectedDocumentKind] ?? e.expectedDocumentKind;
}

/**
 * @when    One expectation named beside something else — in a case row, in a
 *          header, next to a title.
 * @instead The whole record with its date and amount → ExpectationRow. All
 *          values of the axis explained → StatusInfoDialog.
 */
export function ExpectationChip({
  expectation,
  today,
  currency,
  documentKindLabel,
}: {
  expectation: ExpectationVM;
  /** Reference day for the maturity; without it, today. */
  today?: string;
  /** Required: an amount without its currency is a guess (the kit's rule). */
  currency: Currency;
  /** German words for `expectedDocumentKind` — the caller owns them. */
  documentKindLabel?: Record<string, string>;
}) {
  const maturity = expectationMaturity({ ...expectation, today });
  const what = subject(expectation, documentKindLabel);
  return (
    <span className="v2exp__chip">
      <StatusBadge axis="expectation_maturity" status={maturity} info={false} />
      <span className="v2exp__what">
        {what ?? audienceWord(expectation.audience)}
        {/* The amount only shows on a payment: where a document is missing,
            the kind of document is the statement (open question 2). */}
        {expectation.kind === "payment" &&
        expectation.expectedAmount != null ? (
          <>
            {" · "}
            <AmountCell
              value={expectation.expectedAmount}
              currency={currency}
            />
          </>
        ) : null}
      </span>
    </span>
  );
}

/**
 * @when    A list of what is still missing — the case detail, step five of the
 *          batch review.
 * @instead One expectation named in passing → ExpectationChip. What already
 *          happened → Timeline.
 */
export function ExpectationRow({
  expectation,
  today,
  currency,
  documentKindLabel,
  onResolve,
  onOpen,
}: {
  expectation: ExpectationVM;
  today?: string;
  /** Required: an amount without its currency is a guess (the kit's rule). */
  currency: Currency;
  documentKindLabel?: Record<string, string>;
  /** „Erledigt" — without it the row only shows. */
  onResolve?: (id: string) => void;
  /** Jump into the case. */
  onOpen?: (id: string) => void;
}) {
  const maturity = expectationMaturity({ ...expectation, today });
  const what = subject(expectation, documentKindLabel);
  const title = [
    what ?? audienceWord(expectation.audience),
    expectation.expectedCounterpartyName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    // The row measures **itself**, not the window: on its own page it is wide,
    // in the detail column of the case page it has 484 px at a 1280 px window
    // (measured). A `@media` rule would see the same window in both cases, so
    // the wrapper is the container and the grid inside asks it.
    <div className="v2exp">
      <div className="v2exp__row">
        <span className="v2exp__kind">
          <StatusBadge
            axis="expectation_kind"
            status={expectation.kind}
            info={false}
          />
        </span>
        <span className="v2exp__title">
          {/* An **element** even without `onOpen`: the clipping hangs on the
              class `.v2exp__label`, and a bare text node cannot carry it —
              the rule then clipped the note below instead of the title
              (acceptance 0025, M8). */}
          {onOpen ? (
            <button
              type="button"
              className="v2link v2exp__label"
              onClick={() => onOpen(expectation.id)}
            >
              {title}
            </button>
          ) : (
            <span className="v2exp__label">{title}</span>
          )}
          {expectation.note ? (
            <span className="v2exp__note">{expectation.note}</span>
          ) : null}
        </span>
        <span className="v2num">
          {expectation.expectedAmount == null ? null : (
            <AmountCell
              value={expectation.expectedAmount}
              currency={currency}
            />
          )}
        </span>
        {/* Absolute, not „in three days": whoever checks a deadline wants the
            date (T7). The maturity beside it says what the date means. */}
        <span className="v2exp__due">
          fällig <Time value={expectation.dueDate} format="date" size="sm" />
        </span>
        <span className="v2exp__state">
          <StatusBadge axis="expectation_maturity" status={maturity} info={false} />
        </span>
        <span className="v2exp__act">
          {onResolve && maturity !== "resolved" ? (
            <button
              type="button"
              className="v2link"
              onClick={() => onResolve(expectation.id)}
            >
              Erledigt
            </button>
          ) : null}
        </span>
      </div>
    </div>
  );
}
