import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { JournalEntryCard } from "./JournalEntryCompact";
import { JournalEntryReviewList, type ProposalRow } from "./JournalEntryReviewList";

const meta: Meta<typeof JournalEntryReviewList> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryReviewList",
  component: JournalEntryReviewList,
};
export default meta;
type Story = StoryObj<typeof JournalEntryReviewList>;

const PARTNERS = ["Deutsche Telekom Geschäftskunden GmbH", "Stadtwerke Beispielstadt", "Aral Tankstelle", "Beispiel Leasing AG", "Hartje KG", "Telekom Deutschland GmbH", "Deutsche Post AG", "Allianz Versicherungs-AG"];
const KINDS = [
  { key: "invoice", label: "Rechnung" },
  { key: "payment", label: "Zahlung" },
  { key: "recurring", label: "Dauerbuchung" },
];

// Batch 09-2026-Ludwig: forty open proposals.
const ROWS: ProposalRow[] = Array.from({ length: 40 }, (_, i) => {
  const kind = KINDS[i % 3]!;
  return {
    id: `case-${i + 1}`,
    number: String(i + 1),
    date: `2026-09-${String((i % 28) + 1).padStart(2, "0")}`,
    counterparty: i === 7 ? null : PARTNERS[i % PARTNERS.length]!,
    title: "Eingangsrechnung ohne erkannten Gegenpart",
    firstTime: i % 9 === 4,
    accounts:
      i === 11
        ? null
        : {
            debit: [{ number: kind.key === "payment" ? "70021" : "4930", name: "Bürobedarf" }],
            credit: i % 13 === 0 ? [{ number: "1800", name: "Bank" }, { number: "1360", name: "Geldtransit" }] : [{ number: kind.key === "payment" ? "1800" : "70021", name: "Muster Bürobedarf GmbH" }],
            lineCount: i % 13 === 0 ? 3 : 2,
          },
    amount: i === 11 ? null : 38.5 + i * 97.35,
    currency: "EUR",
    taxKey: kind.key === "payment" ? null : "9",
    documentNumber: i % 5 === 3 ? null : `RE-2026-${String(800 + i)}`,
    documentId: i % 4 === 1 ? null : `doc-${i}`,
    verdict: (["confirm", "confirm_with_note", "adjust", "flag"] as const)[i % 4],
    confidence: (["green", "yellow", "orange", "red"] as const)[(i * 3) % 4],
    kindLabel: kind.label,
    reasons: i % 4 === 3 ? ["Ludwig ist unsicher", "Betrag über 1.000,00 €"] : i % 4 === 2 ? ["Konto weicht vom Vorjahr ab"] : ["erstmals gebucht"],
    decided: i < 5,
  };
});

const HREFS = {
  accountHref: (n: string) => `#account=${n}`,
  documentHref: (id: string) => `#document=${id}`,
  taxKeyHref: (k: string) => `#taxKey=${k}`,
};

const expand = (p: ProposalRow) =>
  p.accounts ? (
    <JournalEntryCard
      caption={p.counterparty ?? p.title}
      currency={p.currency}
      accountHref={HREFS.accountHref}
      lines={[
        ...p.accounts.debit.map((a) => ({ side: "debit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: p.amount ?? 0, taxKey: p.taxKey ?? null })),
        ...p.accounts.credit.map((a) => ({ side: "credit" as const, accountNumber: a.number, accountName: a.name ?? null, amount: (p.amount ?? 0) / p.accounts!.credit.length })),
      ]}
    />
  ) : (
    <span className="v2muted">Zu diesem Sachverhalt liegt noch kein Satz vor.</span>
  );

const actions = (p: ProposalRow) =>
  p.decided
    ? [{ label: "Öffnen", action: async () => {} }]
    : [
        { label: "Freigeben", primary: true, action: async () => {} },
        { label: "Öffnen", action: async () => {} },
      ];

const BULK = [{ label: "Ausgewählte freigeben", action: async () => {} }];

/** Step 3, grouped by entry kind: selection, fold-out, row actions; the caller takes the kind column out inside its groups. */
export const Grouped: Story = {
  render: () => (
    <JournalEntryReviewList
      groups={KINDS.map((k) => ({
        key: k.key,
        label: k.label,
        rows: ROWS.filter((r) => r.kindLabel === k.label),
        aside: `${ROWS.filter((r) => r.kindLabel === k.label).length} Sätze`,
      }))}
      head={{ title: "Buchungsvorschläge nach Satzart", sub: "40 von 40 Sachverhalten" }}
      without={["kind"]}
      expand={expand}
      rowActions={actions}
      bulkActions={BULK}
      {...HREFS}
    />
  ),
};

/** Flat, with the kind as a column. */
export const Flat: Story = {
  render: () => (
    <JournalEntryReviewList
      rows={ROWS.slice(0, 12)}
      head={{ title: "Bitte anschauen", sub: "12 von 40 Sachverhalten" }}
      expand={expand}
      rowActions={actions}
      bulkActions={BULK}
      {...HREFS}
    />
  ),
};

/** Compact, for a drawer or the tab „Zum Schließen": accounts as „A an B", no kind, no reasons. */
export const Compact: Story = {
  render: () => (
    <div style={{ width: 680 }}>
      <JournalEntryReviewList rows={ROWS.slice(5, 11)} variant="compact" head={{ title: "Zum Schließen" }} bulkActions={BULK} {...HREFS} />
    </div>
  ),
};

/** Empty is a success, empty after a filter is not; loading and error keep the head. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <JournalEntryReviewList rows={[]} head={{ title: "Offen" }} empty={{ title: "Alles abgenommen.", description: "Alle 40 Vorschläge dieses Stapels sind entschieden.", done: true }} />
      <JournalEntryReviewList rows={[]} head={{ title: "Offen" }} filtered={{ summary: "Satzart: Zahlung", resetHref: "#" }} />
      <JournalEntryReviewList rows={[]} head={{ title: "Offen" }} loading />
      <JournalEntryReviewList rows={[]} head={{ title: "Offen" }} error={{ message: "Die Vorschläge des Stapels konnten nicht geladen werden." }} />
    </div>
  ),
};
