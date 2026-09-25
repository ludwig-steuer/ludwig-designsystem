import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BankAccountsCard } from "./BankAccountsCard";
import {
  dormantAccounts,
  s1Fits,
  s2ProposalsOnly,
  s3ProposalFromLastMonth,
  s4NoBalancesInFile,
  s5ManualBalance,
  s6Explained,
  s7Differs,
  s8NotCheckable,
  s9StatementEndsEarly,
  s10OtherBatches,
  s11Cash,
  s11Transit,
} from "./fixtures";

/**
 * Schritt 4 der Stapelabnahme, Karte „Bankkonten" (0202, Brief F298). Oben das
 * Urteil über alle Konten, je Konto eine Zeile mit Satz; aufgeklappt die
 * Matrix Quelle × (Alt · Bewegung · Neu), darunter die Rechnung der
 * Differenz. Der Schalter „Buchungsvorschläge mitzählen" steht im Hash.
 */
const meta: Meta<typeof BankAccountsCard> = {
  title: "Seiten/Saldenabgleich",
  component: BankAccountsCard,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof BankAccountsCard>;

/** **S1** — alles freigegeben, der Auszug trägt Salden: die Zeile bleibt zu. */
export const S1Fits: Story = {
  name: "S1 · passt",
  args: { accounts: [s1Fits] },
};

/** **S2 aus** — der Referenzfall: nur Vorschläge, Schalter aus. Gelb, nie rot (E2). */
export const S2ProposalsOff: Story = {
  name: "S2 · nur Vorschläge, Schalter aus",
  args: { accounts: [s2ProposalsOnly] },
};

/** **S2 an** — derselbe Fall mitgezählt: passt, und der Satz sagt, was ohne Vorschläge fehlt. */
export const S2ProposalsOn: Story = {
  name: "S2 · nur Vorschläge, Schalter an",
  args: { accounts: [s2ProposalsOnly], withProposals: true },
};

/**
 * **S3** — ein Vorschlag vom 21.07. steckt schon im DATEV-Stand. Er steht
 * außerhalb der Rechnung; mit Schalter an verschiebt er Alt und Neu um −48,20 €.
 */
export const S3ProposalFromLastMonth: Story = {
  name: "S3 · Vorschlag aus dem Vormonat",
  args: { accounts: [s3ProposalFromLastMonth] },
};

/** **S4** — CSV ohne Salden und ohne PDF: nur die Bewegung ist prüfbar. */
export const S4NoBalancesInFile: Story = {
  name: "S4 · Datei ohne Salden",
  args: { accounts: [s4NoBalancesInFile] },
};

/** **S5** — S4 mit Papierauszug zum 31.08.: Neu ist wieder prüfbar. */
export const S5ManualBalance: Story = {
  name: "S5 · eigene Angabe",
  args: { accounts: [s5ManualBalance] },
};

/** **S6** — die eigene Angabe weicht ab; zwei Umsätze ohne Buchung erklären alles. */
export const S6Explained: Story = {
  name: "S6 · erklärt",
  args: { accounts: [s6Explained] },
};

/** **S7** — 50,00 € bleiben, auch mit Vorschlägen. Die erklärten Teile stehen darüber. */
export const S7Differs: Story = {
  name: "S7 · Rest bleibt",
  args: { accounts: [s7Differs] },
};

/** **S8** — kein Auszug, keine Angabe, negativer Saldo, noch kein DATEV-Abruf. */
export const S8NotCheckable: Story = {
  name: "S8 · nicht prüfbar",
  args: { accounts: [s8NotCheckable] },
};

/** **S9** — der Auszug endet am 22.08.: Neu trägt das Datum sichtbar, kein Vergleich. */
export const S9StatementEndsEarly: Story = {
  name: "S9 · Auszug endet früher",
  args: { accounts: [s9StatementEndsEarly] },
};

/** **S10** — frühere Stapel und ein Mandantenstapel im Stand: die Quelle-Zeile wird lang. */
export const S10OtherBatches: Story = {
  name: "S10 · andere Stapel im Stand",
  args: { accounts: [s10OtherBatches], openAll: true },
};

/** **S11** — Kasse und Geldtransit: Hinweis, zu, nie Warnung (E4). */
export const S11CashAndTransit: Story = {
  name: "S11 · Kasse und Geldtransit",
  args: { accounts: [s11Cash, s11Transit] },
};

/** **S12** — 20 ruhende Konten in einer Zeile; eines hatte im Juli noch Umsätze. */
export const S12Dormant: Story = {
  name: "S12 · ruhende Konten",
  args: { accounts: [s1Fits], dormant: dormantAccounts },
};

/** **S13** — alles gemischt: das Banner nimmt die schlechteste Stufe und zählt. */
export const S13Mixed: Story = {
  name: "S13 · gemischt",
  args: {
    accounts: [s1Fits, s2ProposalsOnly, s7Differs, s11Cash, s11Transit],
    dormant: dormantAccounts,
  },
};

/** **S14** — „Kontostand hinterlegen" offen, Stichtag in der Zukunft: nicht gespeichert, Eingabe bleibt. */
export const S14FormError: Story = {
  name: "S14 · Formular mit Fehler",
  args: {
    accounts: [s4NoBalancesInFile],
    form: {
      accountId: s4NoBalancesInFile.paymentAccountId,
      side: "new",
      amount: 12790,
      date: "2026-12-31",
      submitted: true,
    },
  },
};
