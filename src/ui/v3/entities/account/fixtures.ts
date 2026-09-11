import type { AccountFactsVM } from "./Account";

/**
 * The master-data fields of `AccountFactsVM` (F209, B5) with neutral values —
 * an active SKR04 account without LLM profile, clearing type or partner. The
 * stories spread it and override only what they prove.
 */
export const MASTER_FIELDS: Pick<
  AccountFactsVM,
  | "status"
  | "accountFrameworkCode"
  | "skrBaseCode"
  | "accountFunction"
  | "automaticTaxRate"
  | "clearingAccountType"
  | "businessPartnerId"
  | "description"
  | "documentTerms"
  | "embeddingCreatedAt"
  | "exportedNotFoundCount"
> = {
  status: "active",
  accountFrameworkCode: "SKR04",
  skrBaseCode: null,
  accountFunction: null,
  automaticTaxRate: null,
  clearingAccountType: null,
  businessPartnerId: null,
  description: null,
  documentTerms: [],
  embeddingCreatedAt: null,
  exportedNotFoundCount: 0,
};
