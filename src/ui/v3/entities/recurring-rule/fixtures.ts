import type { RecurringRule } from "@/ludwig/modules/recurring-rules/domain/rule";

import type { CaseLink } from "../accounting-case/case-title";

/**
 * Example data for the stories of the recurring-rule family.
 *
 * Cut to the stock: 30 rules at 29 recurring cases, 29 of them from the F91
 * onboarding import — monthly, day 1, `accrue_then_settle`, tolerance 0,00,
 * an eight-character DATEV document number, and a counterparty name of about
 * 23 characters. The values themselves are invented (Musterfirma GmbH,
 * 1.800,00 €); no customer data leaves the database.
 */

/** The case a rule hangs on — named the way every list names it. */
export function caseLink(over: Partial<CaseLink> = {}): CaseLink {
  return {
    caseId: "c-4413",
    caseNumber: "2026-0413",
    fiscalYear: 2026,
    title: "Miete Musterstraße 12",
    kind: "recurring_charge",
    counterpartyName: "Musterfirma Immobilien GmbH",
    lifecycleStatus: "open",
    ...over,
  };
}

/** The imported rule of the stock: monthly rent, accrued, active. */
export function rule(over: Partial<RecurringRule> = {}): RecurringRule {
  return {
    id: "r-1",
    tenantId: "t-1",
    clientId: "m-1",
    caseId: "c-4413",
    paymentAccountId: null,
    isActive: true,
    priority: 100,
    expectedDirection: "payment_out",
    matchCounterpartyName: "Musterfirma Immobilien GmbH",
    matchCounterpartyIban: null,
    matchAmount: 1800,
    matchAmountTolerance: 0,
    matchAmountTolerancePercent: null,
    matchPurposeRegex: null,
    expectedInterval: "monthly",
    expectedDayOfMonth: 1,
    validFrom: "2026-01-01",
    validUntil: null,
    importReference: "datev-wk:20260016",
    datevDocumentNumber: "20260016",
    matchingNote: null,
    matchContractNumber: null,
    matchDocumentTextRegex: null,
    matchesDocuments: true,
    bookingMode: "accrue_then_settle",
    documentNumberStrategy: "period_key",
    profileSource: "onboarding",
    personalAccountNumber: "10001",
    template: {
      counterAccountNumber: "4210",
      taxKey: null,
      taxRatePercent: null,
      description: "Miete Musterstraße 12, laufender Monat",
      lines: null,
      amount: 1800,
    },
    ...over,
  };
}
