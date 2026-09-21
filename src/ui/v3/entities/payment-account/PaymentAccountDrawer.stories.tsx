import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../../primitives/Button";
import { STATEMENT_004 } from "../bank-transaction/fixtures";
import { PaymentAccountDrawer } from "./PaymentAccountDrawer";
import type { PaymentAccountRowData } from "./payment-account";

const meta: Meta<typeof PaymentAccountDrawer> = {
  title: "v3/Entitäten/Zahlungskonto/PaymentAccountDrawer",
  component: PaymentAccountDrawer,
};
export default meta;
type Story = StoryObj<typeof PaymentAccountDrawer>;

const ACCOUNT: PaymentAccountRowData = {
  id: "pa-1210",
  displayName: "Commerzbank Geschäftskonto",
  iban: "DE40 7534 0090 0770 7920 00",
  expectsStatements: true,
  autoAssignPaymentMethod: null,
  txCount: 251,
  kind: "bank",
  ledgerAccountNumber: "1210",
  ledgerAccountName: "Commerzbank",
};

/** Newest first, as the drawer expects them. */
const LATEST = [...STATEMENT_004].sort((a, b) => b.postingDate.localeCompare(a.postingDate));

function Frame(props: { account: PaymentAccountRowData | null; latest: typeof LATEST; loading?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Konto öffnen
      </Button>
      <PaymentAccountDrawer
        open={open}
        onClose={() => setOpen(false)}
        account={props.account}
        latest={props.latest}
        statementHref="#banks/pa-1210"
        caseHref={(id) => `#fall-${id}`}
        rowHref={(t) => `#zahlung-${t.id}`}
        {...(props.loading ? { loading: true } : {})}
      />
    </>
  );
}

/**
 * Das Zahlungskonto neben der Arbeit (0193): oben Art, IBAN und Sachkonto,
 * darunter die **letzten** Zahlungen nach Buchungstag — gebucht oder nicht,
 * eine feste Zahl (Owner-Entscheid). Der eine Ausweg unten öffnet den ganzen
 * Kontoauszug.
 */
export const Filled: Story = {
  render: () => <Frame account={ACCOUNT} latest={LATEST} />,
};

/** Ein Konto ohne Bewegung: ein Satz, kein leerer Kasten. */
export const Empty: Story = {
  render: () => <Frame account={{ ...ACCOUNT, txCount: 0 }} latest={[]} />,
};

/** Lädt: der Platz bleibt, der Ausweg steht schon. */
export const Loading: Story = {
  render: () => <Frame account={null} latest={[]} loading />,
};
