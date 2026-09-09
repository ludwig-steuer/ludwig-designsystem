import type { RecurringRule, RuleBookingMode, RuleDirection, RuleExpectedInterval } from "./rule";

/**
 * # Zwischen dem Entwurf des Editors und dem, was der Kern speichert
 *
 * Der Editor des Design-Systems (0135) arbeitet auf einem `RecurringRuleDraft`
 * — einem Ausschnitt der Regel, „alles, was ein Mensch ändern darf". Die
 * Schreib-Aktion der App nimmt eine flachere Form: die Vorlage ist dort in
 * fünf Einzelfelder zerlegt (`templateCounterAccountNumber`, `templateTaxKey`
 * …), weil sie so in die Tabelle geht.
 *
 * Diese Datei ist die Naht zwischen beiden — rein und beidseitig, damit ein
 * Test zeigen kann, dass auf dem Weg nichts verloren geht.
 *
 * **Am 2026-09-08 ging etwas verloren:** vier Felder des Entwurfs kannte die
 * Aktion nicht — `matchAmountTolerancePercent` (setzte nur der Agent),
 * `matchContractNumber`, `matchDocumentTextRegex` und `matchingNote` (hatte
 * eine eigene Aktion). Der Schreib-Layer konnte drei davon längst; nur das
 * Schema dazwischen führte sie nicht. Ein Editor, der Felder anbietet, die
 * nie ankommen, ist ein stiller Fehler beim ersten Handgriff — dieselbe
 * Klasse wie L-254. Jetzt gehen alle vier denselben Weg, die Notiz über
 * dieselbe Kernfunktion, die auch der Agent ruft.
 */

/** Der Ausschnitt, den der Editor ändert — zeichengleich mit `RecurringRuleDraft` (0132). */
export type RuleDraft = Pick<
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

/** Die Felder, die `saveRule` entgegennimmt — ohne Navigation und Id. */
export interface RuleSaveFields {
  paymentAccountId: string | null;
  isActive: boolean;
  priority: number;
  expectedDirection: RuleDirection | null;
  matchCounterpartyName: string | null;
  matchCounterpartyIban: string | null;
  matchAmount: number | null;
  matchAmountTolerance: number;
  matchAmountTolerancePercent: number | null;
  matchPurposeRegex: string | null;
  matchContractNumber: string | null;
  matchDocumentTextRegex: string | null;
  matchingNote: string | null;
  expectedInterval: RuleExpectedInterval | null;
  expectedDayOfMonth: number | null;
  bookingMode: RuleBookingMode;
  personalAccountNumber: string | null;
  templateCounterAccountNumber: string | null;
  templateTaxKey: string | null;
  templateTaxRatePercent: number | null;
  templateDescription: string | null;
  templateAmount: number | null;
}

/**
 * Entwurf → Speicherfelder.
 *
 * `priority` kommt von außen: sie steht nicht im Entwurf, weil sie erst
 * gebraucht wird, wenn zwei Regeln an einem Sachverhalt hängen (L-245) — und
 * ihr Vorgabewert gehört zu den Schreibern, nicht zum Formular
 * (`RULE_PRIORITY_DEFAULT`).
 */
export function toSaveFields(draft: RuleDraft, priority: number): RuleSaveFields {
  return {
    paymentAccountId: draft.paymentAccountId,
    isActive: draft.isActive,
    priority,
    expectedDirection: draft.expectedDirection,
    matchCounterpartyName: draft.matchCounterpartyName,
    matchCounterpartyIban: draft.matchCounterpartyIban,
    matchAmount: draft.matchAmount,
    matchAmountTolerance: draft.matchAmountTolerance,
    matchAmountTolerancePercent: draft.matchAmountTolerancePercent,
    matchPurposeRegex: draft.matchPurposeRegex,
    matchContractNumber: draft.matchContractNumber,
    matchDocumentTextRegex: draft.matchDocumentTextRegex,
    matchingNote: draft.matchingNote,
    expectedInterval: draft.expectedInterval,
    expectedDayOfMonth: draft.expectedDayOfMonth,
    bookingMode: draft.bookingMode,
    personalAccountNumber: draft.personalAccountNumber,
    // Die Vorlage zerfällt hier in ihre Felder — **bis auf `lines`**: eine
    // Split-Vorlage ist über diese Aktion nicht änderbar, und ein Entwurf,
    // der sie fallen ließe, wäre Datenverlust. Sie bleibt, wie sie ist.
    templateCounterAccountNumber: draft.template.counterAccountNumber,
    templateTaxKey: draft.template.taxKey,
    templateTaxRatePercent: draft.template.taxRatePercent,
    templateDescription: draft.template.description,
    templateAmount: draft.template.amount,
  };
}

/**
 * Speicherfelder → Entwurf.
 *
 * Die Gegenrichtung braucht die Regel, aus der der Entwurf kam: `template.lines`
 * geht nicht über die Aktion (eine Split-Vorlage ist so nicht änderbar) und
 * kommt von dort. Ohne diesen zweiten Blick wäre die Rückübersetzung eine
 * Erfindung.
 */
export function toDraft(fields: RuleSaveFields, aus: RuleDraft): RuleDraft {
  return {
    ...aus,
    paymentAccountId: fields.paymentAccountId,
    isActive: fields.isActive,
    expectedDirection: fields.expectedDirection,
    matchCounterpartyName: fields.matchCounterpartyName,
    matchCounterpartyIban: fields.matchCounterpartyIban,
    matchAmount: fields.matchAmount,
    matchAmountTolerance: fields.matchAmountTolerance,
    matchAmountTolerancePercent: fields.matchAmountTolerancePercent,
    matchPurposeRegex: fields.matchPurposeRegex,
    matchContractNumber: fields.matchContractNumber,
    matchDocumentTextRegex: fields.matchDocumentTextRegex,
    matchingNote: fields.matchingNote,
    expectedInterval: fields.expectedInterval,
    expectedDayOfMonth: fields.expectedDayOfMonth,
    bookingMode: fields.bookingMode,
    personalAccountNumber: fields.personalAccountNumber,
    template: {
      ...aus.template,
      counterAccountNumber: fields.templateCounterAccountNumber,
      taxKey: fields.templateTaxKey,
      taxRatePercent: fields.templateTaxRatePercent,
      description: fields.templateDescription,
      amount: fields.templateAmount,
    },
  };
}
