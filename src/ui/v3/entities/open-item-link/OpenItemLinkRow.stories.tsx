import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { OpenItemLink } from "@/ludwig/modules/datev-truth/domain/open-item";

import { Card, CardHead, HeadRow, Table } from "../../primitives/Table";
import { CaseDetailView } from "../accounting-case/CaseDetailView";
import { OpenItemLinkRow, openItemLinkTracks, type OpenItemSide } from "./OpenItemLinkRow";

const meta: Meta<typeof OpenItemLinkRow> = {
  title: "v3/Entitäten/Ausgleichs-Klammer/OpenItemLinkRow",
  component: OpenItemLinkRow,
};
export default meta;
type Story = StoryObj<typeof OpenItemLinkRow>;

const LINK = (over: Partial<OpenItemLink> = {}): OpenItemLink => ({
  id: "oil-1",
  caseId: "c-4412",
  accountNumber: "70012",
  belegfeldValue: "RE-4471",
  belegfeldState: "computed",
  amountAllocated: 1249.9,
  matchedBy: "Abgleich",
  rationale: null,
  orphanedAt: null,
  invoiceJournalEntryId: "je-1",
  invoiceMirrorEntryId: null,
  paymentJournalEntryId: null,
  paymentMirrorEntryId: "me-9",
  ...over,
});

const RECHNUNG: OpenItemSide = {
  entryId: "je-1",
  label: "RE-4471 · Bürobedarf Meier GmbH",
  date: "2026-08-26",
  amount: 1249.9,
};

const ZAHLUNG: OpenItemSide = {
  entryId: "me-9",
  label: "Überweisung Commerzbank 1210",
  date: "2026-08-30",
  amount: 1249.9,
};

const Kopf = () => (
  <HeadRow>
    <span>Klammer</span>
    <span>Belegfeld</span>
    <span className="v2num">Rechnung</span>
    <span className="v2num">Zahlung</span>
    <span className="v2num">zugeordnet</span>
    <span>Herkunft</span>
    <span>Zustand</span>
  </HeadRow>
);

const Rahmen = ({ children, sub }: { children: React.ReactNode; sub?: string }) => (
  <div style={{ maxWidth: 1100, padding: "var(--space-6)" }}>
    <Card>
      <CardHead title="Ausgleich" sub={sub ?? "Sachverhalt 2026-0412 · Personenkonto 70012"} />
      <Table cols={openItemLinkTracks} minWidth={980}>
        <Kopf />
        {children}
      </Table>
    </Card>
  </div>
);

/**
 * Die Klammer, wie sie im Saldo-Reiter steht: links die Rechnung, rechts die
 * Zahlung, dazwischen der Pfeil — und der **zugeordnete** Betrag als eigene
 * Spalte, denn er ist die Antwort auf „wie viel davon".
 */
export const Filled: Story = {
  render: () => (
    <Rahmen>
      <OpenItemLinkRow link={LINK()} invoice={RECHNUNG} payment={ZAHLUNG} />
    </Rahmen>
  ),
};

/**
 * `orphanedAt` gesetzt: eine der beiden Seiten ist weggefallen — storniert
 * oder ersetzt. Die Klammer bleibt als **Spur** stehen, zählt aber nicht mehr.
 *
 * Das Wort steht neben der Farbe (V7), und es ist ein `Badge`, kein
 * `StatusBadge`: die Registry kennt keine Achse dafür, und ein einzelner
 * Zustand ohne Wertebereich ist auch keine.
 */
export const Orphaned: Story = {
  render: () => (
    <Rahmen>
      <OpenItemLinkRow
        link={LINK({ orphanedAt: "2026-09-02", rationale: "Rechnung storniert und neu gestellt." })}
        invoice={RECHNUNG}
        payment={ZAHLUNG}
      />
    </Rahmen>
  ),
};

/**
 * `onOpen`: beide Seiten führen in ihren Buchungssatz. Ohne den Callback ist
 * die Seite Text — nie ein Knopf, der nichts tut.
 */
export const Roundtrip: Story = {
  render: function Render() {
    const [ziel, setZiel] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 1100, padding: "var(--space-6)" }}>
        <Card>
          <CardHead title="Ausgleich" sub="Beide Seiten sind Ziele" />
          <Table cols={openItemLinkTracks} minWidth={980}>
            <Kopf />
            <OpenItemLinkRow
              link={LINK()}
              invoice={RECHNUNG}
              payment={ZAHLUNG}
              onOpen={setZiel}
            />
          </Table>
        </Card>
        <p className="lw-body-sm">
          Geöffnet: <strong>{ziel ?? "—"}</strong>
        </p>
      </div>
    );
  },
};

/**
 * Im Einsatz: der Saldo-/DATEV-Reiter der Sachverhaltsansicht — der Ort, für
 * den die Zeile gebaut ist (Owner-Entscheid 2026-09-08). Neben den
 * OPOS-Zeilen beantwortet sie die Frage, die dort aufkommt: welche Zahlung
 * gleicht welche Rechnung aus, und zu wie viel.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1600 }}>
      <CaseDetailView
        header={
          <div>
            <div className="lw-caption">Sachverhalt 2026-0412 · Musterbau GmbH</div>
            <h1 className="lw-h2" style={{ margin: 0 }}>
              Wartung der Klimaanlage
            </h1>
          </div>
        }
      >
        <Card>
          <CardHead title="Saldo und DATEV" sub="Personenkonto 70012 · Wirtschaftsjahr 2026" />
          <Table cols={openItemLinkTracks} minWidth={980}>
            <Kopf />
            <OpenItemLinkRow link={LINK()} invoice={RECHNUNG} payment={ZAHLUNG} />
            <OpenItemLinkRow
              link={LINK({
                id: "oil-2",
                belegfeldValue: "RE-4488",
                amountAllocated: 800,
                matchedBy: "Hand",
                rationale: "Teilzahlung, Rest folgt im September.",
              })}
              invoice={{
                entryId: "je-2",
                label: "RE-4488 · Bürobedarf Meier GmbH",
                date: "2026-08-28",
                amount: 1180,
              }}
              payment={{
                entryId: "me-11",
                label: "Überweisung Commerzbank 1210",
                date: "2026-08-31",
                amount: 800,
              }}
            />
          </Table>
        </Card>
      </CaseDetailView>
    </div>
  ),
};

/**
 * **Der Rand.** Vier Fälle, die die Zeile aushalten muss:
 *
 * 1. eine **Teilzahlung** — zugeordnet ist weniger als beide Seiten zeigen;
 * 2. **Fremdwährung** — die Zeile rechnet nicht um, sie zeigt, was dasteht;
 * 3. ein **langes Belegfeld** neben langen Namen auf beiden Seiten;
 * 4. eine Klammer **ohne Herkunft** — dann steht dort ein Strich, kein
 *    geratenes Wort.
 */
export const Edges: Story = {
  render: () => (
    <Rahmen sub="Vier Ränder">
      <OpenItemLinkRow
        link={LINK({ amountAllocated: 412.5, matchedBy: "Regel" })}
        invoice={RECHNUNG}
        payment={{ ...ZAHLUNG, amount: 412.5, label: "Teilzahlung Commerzbank 1210" }}
      />
      <OpenItemLinkRow
        link={LINK({ id: "oil-3", belegfeldValue: "INV-2026-0042", amountAllocated: 4820.75 })}
        invoice={{
          entryId: "je-3",
          label: "INV-2026-0042 · Northwind Trading Ltd.",
          date: "2026-07-14",
          amount: 4820.75,
        }}
        payment={{
          entryId: "me-14",
          label: "Auslandsüberweisung",
          date: "2026-07-30",
          amount: 4820.75,
        }}
        currency="USD"
      />
      <OpenItemLinkRow
        link={LINK({
          id: "oil-4",
          belegfeldValue: "SAMMEL-2026-08-KW35-NACHTRAG",
          amountAllocated: 96.4,
        })}
        invoice={{
          entryId: "je-4",
          label: "Sammelrechnung August, Kalenderwoche 35, Nachtrag zur Wartung der Klimaanlage",
          date: "2026-08-31",
          amount: 96.4,
        }}
        payment={{
          entryId: "me-15",
          label: "Lastschrift Immobilien Musterstadt KG, Sammeleinzug August",
          date: "2026-09-01",
          amount: 96.4,
        }}
      />
      <OpenItemLinkRow
        link={LINK({ id: "oil-5", matchedBy: null, belegfeldValue: null, amountAllocated: 89.9 })}
        invoice={{ entryId: "je-5", label: "Kontoführungsentgelt", date: "2026-08-29", amount: 89.9 }}
        payment={{ entryId: "me-16", label: "Bankeinzug", date: "2026-08-29", amount: 89.9 }}
      />
    </Rahmen>
  ),
};
