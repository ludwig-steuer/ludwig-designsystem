import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Callout } from "../../primitives/Callout";
import { EmptyState } from "../../primitives/EmptyState";
import { Card, CardHead } from "../../primitives/Table";
import {
  ExpectationChip,
  ExpectationRow,
  type ExpectationVM,
} from "./Expectation";

const meta: Meta<typeof ExpectationRow> = {
  title: "v3/Entitäten/Erwartung/Expectation",
  component: ExpectationRow,
};
export default meta;
type Story = StoryObj<typeof ExpectationRow>;

/** The reference day of all stories — otherwise maturity changes with the calendar. */
const TODAY = "2026-09-06";

/** The document kinds' words belong to the caller (no label without an axis). */
const KIND_WORDS: Record<string, string> = {
  invoice: "Rechnung",
  receipt: "Beleg / Quittung",
  contract: "Vertrag",
  statement: "Kontoauszug",
};

const BASE: ExpectationVM = {
  id: "e1",
  kind: "document",
  dueDate: "2026-09-20",
  escalationLevel: 0,
  audience: "client",
  expectedDocumentKind: "invoice",
  expectedCounterpartyName: "Bürobedarf Meier GmbH",
  expectedAmount: null,
  note: null,
};

const PAYMENT: ExpectationVM = {
  id: "e2",
  kind: "payment",
  dueDate: "2026-08-31",
  escalationLevel: 0,
  audience: "accounting",
  expectedCounterpartyName: "Stadtwerke Musterstadt",
  expectedAmount: 412,
  note: null,
};

/**
 * Vier Chips: Beleg und Zahlung, in Frist und überfällig. Der Betrag steht nur
 * bei der Zahlung — bei einem fehlenden Beleg ist die Belegart die Aussage.
 */
export const Chip: Story = {
  render: () => (
    <div
      style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}
    >
      <ExpectationChip
        expectation={BASE}
        today={TODAY}
        documentKindLabel={KIND_WORDS}
        currency="EUR"
      />
      <ExpectationChip
        expectation={{ ...BASE, id: "e1b", dueDate: "2026-08-14" }}
        today={TODAY}
        documentKindLabel={KIND_WORDS}
        currency="EUR"
      />
      <ExpectationChip expectation={PAYMENT} today={TODAY} currency="EUR" />
      <ExpectationChip
        expectation={{ ...PAYMENT, id: "e2b", escalationLevel: 2 }}
        today={TODAY}
        currency="EUR"
      />
    </div>
  ),
};

/** Die Zeile: Art, Gegenpartei, Betrag, Frist, Reife — jede an ihrer Stelle. */
export const Row: Story = {
  render: () => (
    <div style={{ maxWidth: 860 }}>
      <Card>
        <CardHead title="Was noch fehlt" sub="Sachverhalt 2026-0148" />
        <div style={{ padding: "0 var(--space-5)" }}>
          <ExpectationRow
            expectation={BASE}
            today={TODAY}
            documentKindLabel={KIND_WORDS}
            currency="EUR"
          />
          <ExpectationRow
            expectation={{
              ...PAYMENT,
              note: "Teilzahlung vom 12.08. ist eingegangen, der Rest steht aus.",
            }}
            today={TODAY}
            currency="EUR"
          />
        </div>
      </Card>
    </div>
  ),
};

/**
 * Alle vier Reifen nebeneinander. Jede trägt ihr Wort — „Läuft", „Fällig",
 * „Eskaliert", „Erledigt" — und keine lebt von ihrer Farbe allein (V7).
 */
export const Maturities: Story = {
  render: () => (
    <div style={{ maxWidth: 860 }}>
      <ExpectationRow
        expectation={{ ...BASE, id: "m1", dueDate: "2026-09-20" }}
        today={TODAY}
        documentKindLabel={KIND_WORDS}
        currency="EUR"
      />
      <ExpectationRow
        expectation={{ ...BASE, id: "m2", dueDate: "2026-08-20" }}
        today={TODAY}
        documentKindLabel={KIND_WORDS}
        currency="EUR"
      />
      <ExpectationRow
        expectation={{
          ...BASE,
          id: "m3",
          dueDate: "2026-07-20",
          escalationLevel: 2,
        }}
        today={TODAY}
        documentKindLabel={KIND_WORDS}
        currency="EUR"
      />
      <ExpectationRow
        expectation={{
          ...BASE,
          id: "m4",
          dueDate: "2026-08-20",
          resolvedAt: "2026-08-29",
        }}
        today={TODAY}
        documentKindLabel={KIND_WORDS}
        currency="EUR"
      />
    </div>
  ),
};

/** Nichts offen ist ein Erfolg, kein Filterproblem — der Satz sagt es (T6). */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 860 }}>
      <Card>
        <CardHead title="Was noch fehlt" sub="Sachverhalt 2026-0148" />
        <EmptyState
          inline
          title="Nichts offen."
          description="Alle erwarteten Belege und Zahlungen sind eingegangen."
        />
      </Card>
    </div>
  ),
};

/** Laden fehlgeschlagen: der Grund steht mit dem Gegenstand, nicht allein. */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 860 }}>
      <Callout tone="danger">
        Die offenen Erwartungen konnten nicht geladen werden:
        Zeitüberschreitung.
      </Callout>
    </div>
  ),
};

/** „Erledigt" nimmt die Zeile aus der Liste — der Rundlauf mit `useState`. */
export const Interactive: Story = {
  render: function Render() {
    const [rows, setRows] = useState<ExpectationVM[]>([
      BASE,
      PAYMENT,
      {
        ...BASE,
        id: "e3",
        dueDate: "2026-07-01",
        escalationLevel: 1,
        expectedDocumentKind: "contract",
      },
    ]);
    const [opened, setOpened] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 860, display: "grid", gap: "var(--space-4)" }}>
        <div>
          {rows.map((e) => (
            <ExpectationRow
              key={e.id}
              expectation={e}
              today={TODAY}
              currency="EUR"
              documentKindLabel={KIND_WORDS}
              onResolve={(id) => setRows((r) => r.filter((x) => x.id !== id))}
              onOpen={setOpened}
            />
          ))}
        </div>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {rows.length === 0 ? "Nichts offen." : `${rows.length} offen`} ·
          Geöffnet: {opened ?? "nichts"}
        </div>
      </div>
    );
  },
};

/**
 * Im Einsatz: die Karte „Was noch fehlt" im Sachverhalts-Detail — die Stelle,
 * die heute `FehltPanel` mit zwei eigenen Wortlisten baut.
 */
export const InCase: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <Card>
        <CardHead
          title="Was noch fehlt"
          sub="Sachverhalt 2026-0148 · Restaurant Adler"
          meta="3 offen"
        />
        <div style={{ padding: "0 var(--space-5) var(--space-3)" }}>
          <ExpectationRow
            expectation={BASE}
            today={TODAY}
            documentKindLabel={KIND_WORDS}
            currency="EUR"
          />
          <ExpectationRow
            expectation={{
              ...BASE,
              id: "c2",
              expectedDocumentKind: "receipt",
              dueDate: "2026-08-11",
            }}
            today={TODAY}
            documentKindLabel={KIND_WORDS}
            currency="EUR"
          />
          <ExpectationRow expectation={PAYMENT} today={TODAY} currency="CHF" />
        </div>
      </Card>
    </div>
  ),
};
