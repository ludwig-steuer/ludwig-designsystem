import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Card, CardHead, Table, HeadRow, Row } from "../../primitives/Table";
import { JournalEntryCard, JournalEntryCell, type JournalLine } from "./JournalEntryCompact";

/**
 * Every story shows both exports one below the other, so the two steps stay
 * comparable: what fits into a foreign row, and what the card adds.
 */
const meta: Meta<typeof JournalEntryCard> = {
  title: "v3/Entitäten/Buchungssatz/JournalEntryCompact",
  component: JournalEntryCard,
};
export default meta;
type Story = StoryObj<typeof JournalEntryCard>;

const STANDARD: JournalLine[] = [
  { side: "debit", accountNumber: "1200", accountName: "Bank", amount: 1475.6, text: "Reparatur März" },
  { side: "credit", accountNumber: "4400", accountName: "Erlöse 19 % USt", amount: 1475.6, text: "Reparatur März" },
];

const SPLIT: JournalLine[] = [
  { side: "debit", accountNumber: "1200", accountName: "Bank", amount: 1475.6, text: "Sammelrechnung März" },
  { side: "credit", accountNumber: "4400", accountName: "Erlöse 19 % USt", amount: 900.0, text: "Reparatur" },
  { side: "credit", accountNumber: "4300", accountName: "Erlöse 7 % USt", amount: 400.0, text: "Bücher" },
  { side: "credit", accountNumber: "4830", accountName: "Sonstige Erlöse", amount: 175.6, text: "Verpackung" },
];

/** Both exports next to each other, one story per state. */
function Pair({
  lines,
  showNames,
  caption,
  totals,
  accountHref,
  breit,
}: {
  lines: JournalLine[];
  showNames?: boolean;
  caption?: string;
  totals?: boolean;
  accountHref?: (n: string) => string;
  /** Für die BU-Spalte: sie kostet 132 px, die der Kontoname sonst hätte. */
  breit?: boolean;
}) {
  return (
    <div style={{ maxWidth: breit ? 900 : 620, display: "grid", gap: "var(--space-5)" }}>
      <div>
        <div className="v2sub">JournalEntryCell</div>
        <JournalEntryCell
          lines={lines}
          currency="EUR"
          showNames={showNames}
          {...(accountHref ? { accountHref } : {})}
        />
      </div>
      <div>
        <div className="v2sub">JournalEntryCard</div>
        <JournalEntryCard
          lines={lines}
          currency="EUR"
          caption={caption}
          totals={totals}
          {...(accountHref ? { accountHref } : {})}
        />
      </div>
    </div>
  );
}

/** The standard case: one debit against one credit. The cell reads as a sentence. */
export const Filled: Story = { render: () => <Pair lines={STANDARD} /> };

/**
 * Three credit lines against one debit. The cell counts the split side instead
 * of listing it („an 3 Konten"); who wants every line takes the card.
 */
export const Split: Story = { render: () => <Pair lines={SPLIT} /> };

/**
 * No lines. The cell shows the em dash — it stands in foreign markup and must
 * not bring a box. The card says it in a sentence, without a button: it is an
 * excerpt, not a screen.
 */
export const Empty: Story = { render: () => <Pair lines={[]} /> };

/**
 * Σ debit ≠ Σ credit. The `≠` is the only finding the card makes — no message,
 * no colour, no blocked state. Checking is the editor's job.
 */
export const Unbalanced: Story = {
  render: () => (
    <Pair
      lines={[
        { side: "debit", accountNumber: "1200", accountName: "Bank", amount: 1475.6, text: "Reparatur März" },
        { side: "credit", accountNumber: "4400", accountName: "Erlöse 19 % USt", amount: 1400.0, text: "Reparatur März" },
      ]}
    />
  ),
};

/** Numbers only — for a column too narrow for names. */
export const WithoutNames: Story = { render: () => <Pair lines={STANDARD} showNames={false} /> };

/**
 * The card as the editor uses it in its journal block: the sum already stands
 * in the block's own header, so the Σ row would say it twice.
 */
export const WithoutTotals: Story = { render: () => <Pair lines={SPLIT} totals={false} /> };

/**
 * Where they really stand: the cell inside a table row of another entity, the
 * card next to a document with a caption.
 */
/**
 * **Mit Weg zum Konto** (Owner 2026-09-10): jede Kontonummer trägt das
 * Konto-Zeichen und führt auf ihr Kontenblatt — als Suchparameter, denn der
 * Drawer ist eine URL (L3).
 *
 * Das Zeichen steht **nur am Weg**. Ohne `accountHref` bleiben die Nummern
 * Text: eine Zelle, die anklickbar aussieht und nirgends hingeht, ist
 * schlimmer als eine, die es nicht tut (V14). Die Story darüber zeigt genau
 * das — dieselben Zeilen, kein Weg, kein Zeichen.
 *
 * Die Zelle ist seit heute `AccountCell` aus der Kontofamilie; vorher stand
 * hier eine Handkopie, die den Weg gar nicht kannte.
 */
export const MitKontoweg: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <Pair lines={STANDARD} accountHref={(n) => `?konto=${n}`} />
      <div className="v2muted">ohne Weg — dieselben Zeilen, kein Zeichen:</div>
      <Pair lines={STANDARD} />
    </div>
  ),
};

/**
 * **BU-Schlüssel und Automatikkonto** (Owner 2026-09-10). Die Spalte steht
 * zwischen Kontoname und Buchungstext, wie im DATEV-Stapel, und sie kommt nur,
 * wenn eine Zeile etwas darin stehen hat.
 *
 * Die dritte Zeile ist der Fall, um den es geht: **Schlüssel auf einem
 * Automatikkonto**. Dort bestimmt der Kontosatz die Steuer; ein mitgesendeter
 * Schlüssel wird beim Export still entfernt oder weist den Stapel ab — in
 * beiden Fällen steht in Ludwig etwas anderes als in DATEV. Die Karte zeigt
 * deshalb beides nebeneinander, und die Marke wird gelb: der Konflikt gehört
 * an die Zeile, an der er entsteht, nicht nur in eine Guard-Meldung darüber.
 *
 * **Breiter als die übrigen Stories** (900 statt 620 px), und zwar mit Grund:
 * die BU-Spalte nimmt 132 px, und bei 620 kürzt der Kontoname auf
 * „Warenein…". Dort, wo die Karte im Einsatz steht — im Aufklapper einer
 * Stapelzeile —, ist sie breiter als hier.
 */
export const MitSteuerschluessel: Story = {
  render: () => (
    <Pair
      breit
      lines={[
        { side: "debit", accountNumber: "6815", accountName: "Telefon", amount: 84, taxKey: "9", text: "Mobilfunk August" },
        { side: "debit", accountNumber: "5404", accountName: "Wareneingang 19 % VSt", amount: 21.36, automaticRate: 19, text: "Ersatzteile" },
        { side: "debit", accountNumber: "8400", accountName: "Erlöse 19 % USt", amount: 12, taxKey: "3", automaticRate: 19, text: "falscher Schlüssel" },
        { side: "credit", accountNumber: "70044", accountName: "Beispielbau Handels GmbH", amount: 117.36, text: "Rechnung R-4471" },
      ]}
      accountHref={(n) => `?konto=${n}`}
    />
  ),
};

export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 760, display: "grid", gap: "var(--space-5)" }}>
      <Card>
        <CardHead title="Ereignisse des Sachverhalts" />
        <Table cols="96px minmax(0, 1fr) minmax(0, 1.6fr)" minWidth={560}>
          <HeadRow>
            <span>Datum</span>
            <span>Ereignis</span>
            <span>Buchung</span>
          </HeadRow>
          <Row>
            <span>26.08.2026</span>
            <span>Belegeingang RE-4471</span>
            <JournalEntryCell lines={STANDARD} currency="EUR" />
          </Row>
          <Row>
            <span>31.08.2026</span>
            <span>Zahlung Commerzbank</span>
            <JournalEntryCell lines={SPLIT} currency="EUR" />
          </Row>
        </Table>
      </Card>
      <div style={{ maxWidth: 620 }}>
        <JournalEntryCard lines={STANDARD} currency="EUR" caption="Buchungsvorschlag zu RE-4471" />
      </div>
    </div>
  ),
};

/**
 * The edges: a long account name (cut, full name in the `title`), 0,00 € as a
 * real value, a negative line, and twelve lines in the card.
 */
export const Edges: Story = {
  render: () => (
    <Pair
      lines={[
        {
          side: "debit",
          accountNumber: "0420",
          accountName: "Betriebs- und Geschäftsausstattung, geringwertige Wirtschaftsgüter",
          amount: 0,
          text: "Nullbuchung zur Korrektur einer doppelt erfassten Position",
        },
        { side: "debit", accountNumber: "1576", accountName: "Vorsteuer 19 %", amount: -19.0, text: "Storno Vorsteuer" },
        ...Array.from({ length: 10 }, (_, i) => ({
          side: "credit" as const,
          accountNumber: `7003${i}`,
          accountName: `Kreditor ${i + 1}`,
          amount: 100 + i,
          text: `Teilbetrag ${i + 1}`,
        })),
      ]}
    />
  ),
};
