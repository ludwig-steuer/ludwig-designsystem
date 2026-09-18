import type { RuleExpectedInterval } from "@/ludwig/modules/recurring-rules";

/**
 * Ein aktiver Dauersachverhalt ohne Satz im Stapel (F228 T228.7). Reine
 * Domäne — die Query wohnt in `application/rules-without-proposal.ts`, die
 * Zeile in `ui/RulesWithoutProposal.tsx`; keiner von beiden zieht den anderen.
 */
export interface RuleWithoutProposal {
  ruleId: string;
  caseId: string;
  caseNumber: string | null;
  title: string | null;
  counterpartyName: string | null;
  expectedInterval: RuleExpectedInterval | null;
  templateAmount: number | null;
  /** ISO-Tag des jüngsten angenommenen Satzes — null: noch nie gebucht. */
  lastBookedOn: string | null;
  lastBatchNumber: string | null;
}
