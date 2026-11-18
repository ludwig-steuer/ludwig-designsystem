/**
 * Domänen-Barrel von `accounting-cases` (F671): reine Typen, Konstanten und Funktionen der Domänenschicht,
 * feste Adresse für das Designsystem. Nur ausdrückliche Re-Exporte aus den Themenordnern der Domänenschicht,
 * keine Sammel-Re-Exporte, keine anderen Schichten (Regel 4 in `scripts/check-topic-folders.mjs`).
 */
export {
  AssignableCaseKindSchema,
  CASE_DISPOSITION_WRITABLE,
  CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS,
  CASE_DOCUMENT_NUMBER_MODES,
  CASE_KIND,
  CASE_KIND_LABEL,
  CASE_KIND_LOCKED_REASON,
  CASE_LIST_TAB_LABEL,
  caseDisplayTitle,
  caseKindLabel,
  clarificationModuleLabel,
  clarificationQuestionTypeLabel,
  clarificationState,
  expectationMaturity,
  isDocumentNumberModeDowngrade,
  isRecurringKind,
  MAX_DEFERRAL_DAYS,
} from "./cases/case";
export type {
  CaseDisposition,
  CaseDispositionWritable,
  CaseDocumentNumberMode,
  CaseKind,
  CaseLifecycle,
  CaseListItem,
  CaseListTab,
  ClarificationState,
  ClarificationType,
  ExpectationKind,
} from "./cases/case";
export type { CaseDetail } from "./cases/case-detail";
export type { CaseHeaderVM, TimelineEventVM } from "./cases/overview-vm";
export { CASE_TAB_LABEL } from "./cases/tabs";
export { DOCUMENT_NUMBER_STATE_LABEL, isDatevSource, sortByDominance } from "./document-number/document-number";
export type { DocumentNumberSource, DocumentNumberState, KnownDocumentNumber } from "./document-number/document-number";
export type { ExpectationAudience, ExpectationRow } from "./expectations/expectation";
export { expectationResolutionLabel } from "./expectations/expectation-labels";
export type { RationaleSourceKind } from "./review/rationale-source";
export { REVIEW_SCORING, reviewScore } from "./review/review-score";
export type { ReviewReason } from "./review/review-score";
export { STANDARD_TAX_ACCOUNT_NUMBERS, TAX_ACCOUNT_NUMBERS, taxAccountFor, vatRateForTaxKey } from "./vat/tax-keys";
