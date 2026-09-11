import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SourceDocumentFacts } from "../source-document/SourceDocumentFacts";
import type { SourceDocumentVM } from "../source-document/SourceDocument";
import { PaymentAccountCell, type PaymentAccountRef } from "./PaymentAccount";

const meta: Meta<typeof PaymentAccountCell> = {
  title: "v3/Entitäten/Zahlungskonto/PaymentAccountCell",
  component: PaymentAccountCell,
};
export default meta;
type Story = StoryObj<typeof PaymentAccountCell>;

const BANK: PaymentAccountRef = {
  id: "pa-1",
  label: "Stadtbank · Geschäftskonto",
  iban: "DE89 3704 0044 0532 0130 00",
};
const CASH: PaymentAccountRef = { id: "pa-2", label: "Kasse", iban: null };

/**
 * A bank account with its IBAN — the IBAN in the `title`, not in the line —
 * and the cash box without one: no `title` then, and no placeholder.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, justifyItems: "start" }}>
      <PaymentAccountCell account={BANK} />
      <PaymentAccountCell account={CASH} />
    </div>
  ),
};

/** With `href` the name is the link to the statement; the sign in front of it is not. */
export const Linked: Story = {
  render: () => <PaymentAccountCell account={BANK} href="#banks/pa-1" />,
};

/**
 * The longest label the app builds — a 39-character name with its IBAN, as
 * `toPaymentAccountOptions()` joins them — in 200 px: it wraps, it is not cut.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ width: 200, border: "1px dashed var(--color-border)", padding: 8 }}>
      <PaymentAccountCell
        account={{
          id: "pa-3",
          label: "Volksbank Musterstadt-Beispielhausen eG · DE89 3704 0044 0532 0130 00",
          iban: "DE89 3704 0044 0532 0130 00",
        }}
        href="#banks/pa-3"
      />
    </div>
  ),
};

const STATEMENT: SourceDocumentVM = {
  id: "7c1e2d90-3b44-4f7a-8e21-5a9d0c6b2f13",
  fileName: "Kontoauszug-2026-08.pdf",
  sourceDocType: "bank_statement_pdf",
  classDocumentForm: null,
  counterparty: "Stadtbank",
  detail: null,
  documentDate: "2026-08-31",
  receivedDate: "2026-09-01",
  completedAt: null,
  completedVia: null,
  docCategory: "payment",
  docDirection: "inbound",
  classDocumentKind: "original",
  caseNumber: null,
  paymentAccount: BANK,
};

/**
 * In use: the facts of a bank statement name the account it was imported
 * onto. The recurring rule names it the same way — story `All` of
 * RecurringRuleFacts.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 560, padding: "var(--space-6)" }}>
      <SourceDocumentFacts document={STATEMENT} />
    </div>
  ),
};
