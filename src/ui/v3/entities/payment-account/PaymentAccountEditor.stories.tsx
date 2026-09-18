import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Card, CardHead } from "../../primitives/Table";
import { PaymentAccountEditor } from "./PaymentAccountEditor";
import type { PaymentAccountDraft } from "./payment-account";

const meta: Meta<typeof PaymentAccountEditor> = {
  title: "v3/Entitäten/Zahlungskonto/PaymentAccountEditor",
  component: PaymentAccountEditor,
};
export default meta;
type Story = StoryObj<typeof PaymentAccountEditor>;

const BANK: PaymentAccountDraft = {
  displayName: "Stadtbank · Geschäftskonto",
  kind: "bank",
  iban: "DE89 3704 0044 0532 0130 00",
  bic: "COBADEFFXXX",
  bankName: "Stadtbank eG",
  externalAccountId: null,
  ledgerAccountNumber: "1200",
  statementExpectationManual: "required",
  autoAssignPaymentMethod: null,
  validUntil: null,
};

const METHODS = [
  { value: "bank_transfer", label: "Überweisung" },
  { value: "direct_debit", label: "Lastschrift" },
  { value: "credit_card", label: "Kredit-/EC-Karte" },
  { value: "paypal", label: "PayPal" },
  { value: "cash", label: "Barzahlung" },
];

function Frame({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <Card>
        <CardHead title={title} {...(sub ? { sub } : {})} />
        <div className="v3boxbody">{children}</div>
      </Card>
    </div>
  );
}

const save = async () => {};

/** Changing a bank account: name, kind, ledger account, IBAN, and what the run makes of it. */
export const Edit: Story = {
  render: () => (
    <Frame title="Zahlungskonto" sub="Stadtbank · Geschäftskonto">
      <PaymentAccountEditor defaultValue={BANK} onSubmit={save} onCancel={() => {}} paymentMethods={METHODS} />
    </Frame>
  ),
};

/** A new account: the form starts empty, and saving stays off until it has a name. */
export const New: Story = {
  render: () => (
    <Frame title="Neues Zahlungskonto">
      <PaymentAccountEditor onSubmit={save} paymentMethods={METHODS} idPrefix="new" />
    </Frame>
  ),
};

/**
 * The identifier follows the kind: a bank account has IBAN, BIC and bank, a
 * card has its digits, a cash box has none — and says so instead of showing
 * empty fields.
 */
export const Kinds: Story = {
  render: function Switching() {
    const [draft, setDraft] = useState<PaymentAccountDraft>({ ...BANK, kind: "cash", iban: null });
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <Frame title="Kasse" sub="ohne Kennung">
          <PaymentAccountEditor
            key="cash"
            defaultValue={{ ...draft, kind: "cash" }}
            onSubmit={save}
            paymentMethods={METHODS}
            idPrefix="cash"
          />
        </Frame>
        <Frame title="Firmenkreditkarte" sub="mit Kartenkennung">
          <PaymentAccountEditor
            key="card"
            defaultValue={{
              ...BANK,
              displayName: "Firmenkreditkarte",
              kind: "credit_card",
              iban: null,
              bic: null,
              bankName: null,
              externalAccountId: "•••• 4711",
              autoAssignPaymentMethod: "credit_card",
            }}
            onSubmit={save}
            onCancel={() => setDraft(draft)}
            paymentMethods={METHODS}
            idPrefix="card"
          />
        </Frame>
      </div>
    );
  },
};

/** While it saves: the buttons are off, the fields stay readable. */
export const Pending: Story = {
  render: () => (
    <Frame title="Zahlungskonto" sub="speichert">
      <PaymentAccountEditor defaultValue={BANK} onSubmit={save} onCancel={() => {}} paymentMethods={METHODS} pending idPrefix="pending" />
    </Frame>
  ),
};

/** The caller's message stands above the form, not beside a field. */
export const Error: Story = {
  render: () => (
    <Frame title="Zahlungskonto" sub="Stadtbank · Geschäftskonto">
      <PaymentAccountEditor
        defaultValue={BANK}
        onSubmit={save}
        paymentMethods={METHODS}
        error="Die IBAN gehört bereits zu einem anderen Konto dieses Mandanten."
        idPrefix="error"
      />
    </Frame>
  ),
};
