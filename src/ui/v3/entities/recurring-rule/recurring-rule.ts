import type { RecurringRule } from "@/ludwig/modules/recurring-rules/domain/rule";

/**
 * The words and the one small lookup the recurring-rule family shares (0132).
 *
 * A type file, not a component: row, facts and editor all need the same German
 * words for the same three value ranges, and a second copy of the lookup would
 * be a second truth (the pattern of `invoice-line.ts`, 0072).
 */

/**
 * The German words for the value ranges the mirror does not carry.
 *
 * All three arrive as a prop, because none of them has a registry axis and R1
 * forbids a local label map: `expected_direction` has no words in the domain
 * at all (L-256), `document_number_strategy` and `profile_source` have neither
 * axis nor `*_LABEL` (L-242) — and today the app prints the raw English key
 * for the strategy on screen.
 *
 * A value without a word is shown **raw**. Visibly wrong beats silently gone:
 * a missing word is a gap in the domain, and a form that hid it would close
 * the finding without fixing it.
 *
 * @when    Rendering any recurring rule: row, facts, editor.
 * @instead A state with a registry axis — the booking mode → StatusBadge
 *          `axis="regel_modus"`. The rhythm → `RULE_INTERVAL_LABEL` from the
 *          mirror, which is vocabulary and needs no prop.
 */
export interface RecurringRuleLabels {
  /** `payment_in` · `payment_out` — the direction of the expected payment. */
  direction: Readonly<Record<string, string>>;
  /** `period_key` · `from_document` · `fixed` — where document field 1 comes from. */
  documentNumberStrategy: Readonly<Record<string, string>>;
  /** `derived` · `agent` · `human` · `onboarding` — where the profile came from. */
  profileSource: Readonly<Record<string, string>>;
}

/**
 * The word for a raw value, or the raw value itself.
 *
 * @when    Turning one of the three value ranges of `RecurringRuleLabels`
 *          into text.
 * @instead A state from an axis → StatusBadge and the registry. The rhythm →
 *          `RULE_INTERVAL_LABEL`.
 */
export function ruleLabel(
  map: Readonly<Record<string, string>>,
  value: string | null,
): string | null {
  if (!value) return null;
  return map[value] ?? value;
}

/**
 * What the editor writes back (0135) — a `Pick` of the mirrored rule, never a
 * model of its own.
 *
 * It is the cut „everything a person may change", the sixteen data points the
 * profile marks `änderbar = Nutzer`. What is missing is deliberate: the server
 * stamps (`importReference`, `agentRunId`, `exportBatchId`), the DATEV import's
 * own fields (`datevDocumentNumber`, `documentNumberStrategy`, `validFrom`,
 * `validUntil`, the DMS link), the derived `matchesDocuments` — and `priority`,
 * which stays out until two rules of one case stand next to each other (L-245).
 *
 * `template` is in whole, not in parts: `template.lines` is not editable
 * through any surface, and a draft that dropped it would be data loss.
 */
export type RecurringRuleDraft = Pick<
  RecurringRule,
  | "expectedDirection"
  | "matchCounterpartyName"
  | "matchCounterpartyIban"
  | "matchAmount"
  | "matchAmountTolerance"
  | "matchAmountTolerancePercent"
  | "matchPurposeRegex"
  | "matchContractNumber"
  | "matchDocumentTextRegex"
  | "expectedInterval"
  | "expectedDayOfMonth"
  | "bookingMode"
  | "personalAccountNumber"
  | "paymentAccountId"
  | "matchingNote"
  | "isActive"
  | "template"
>;
