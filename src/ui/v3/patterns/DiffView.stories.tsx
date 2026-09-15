import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AmountCell, MonoCell } from "../primitives/Cells";
import { Card, CardHead } from "../primitives/Table";
import { DiffView, type DiffRow } from "./DiffView";

const meta: Meta<typeof DiffView> = {
  title: "v3/Patterns/Prüfen/DiffView",
  component: DiffView,
};
export default meta;
type Story = StoryObj<typeof DiffView>;

const ROWS: DiffRow[] = [
  {
    key: "account",
    label: "Konto",
    before: <MonoCell value="6800" />,
    after: <MonoCell value="6815" />,
    changed: true,
  },
  {
    key: "tax",
    label: "Steuerschlüssel",
    before: <MonoCell value="—" />,
    after: <MonoCell value="9" />,
    changed: true,
  },
  {
    key: "amount",
    label: "Betrag",
    before: <AmountCell value={1049.5} currency="EUR" />,
    after: <AmountCell value={1249.9} currency="EUR" />,
    changed: true,
  },
  { key: "date", label: "Buchungsdatum", before: "26.08.2026", after: "26.08.2026", changed: false },
  { key: "doc", label: "Belegfeld 1", before: <MonoCell value="RE-4471" />, after: <MonoCell value="RE-4471" />, changed: false },
  { key: "text", label: "Buchungstext", before: "Meier Bürobedarf August 2026", after: "Meier Bürobedarf August 2026", changed: false },
  { key: "contra", label: "Gegenkonto", before: <MonoCell value="70021" />, after: <MonoCell value="70021" />, changed: false },
  { key: "cost", label: "Kostenstelle", before: "—", after: "—", changed: false },
];

/**
 * Three of eight fields are different: they stand at the top, the other five
 * lie collapsed underneath. The old value is muted — changed is not deleted,
 * so nothing is struck through.
 */
export const Changed: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <DiffView
        rows={ROWS}
        before={{ label: "Vorschlag", sub: "Agent, 26.08." }}
        after={{ label: "Freigegeben", sub: "Kanzlei, 30.08." }}
      />
    </div>
  ),
};

/** Nothing is different — then that is the result, not an empty table (L6). */
export const AllUnchanged: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <DiffView
        rows={ROWS.map((r) => ({ ...r, before: r.after, changed: false }))}
        before={{ label: "Vorschlag" }}
        after={{ label: "Freigegeben" }}
      />
    </div>
  ),
};

/** The three ways with the unchanged fields: folded (default), shown, hidden. */
export const ManyFields: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 720 }}>
      <DiffView rows={ROWS} before={{ label: "Vorher" }} after={{ label: "Nachher" }} unchanged="show" />
      <DiffView rows={ROWS} before={{ label: "Vorher" }} after={{ label: "Nachher" }} unchanged="hide" />
    </div>
  ),
};

/** The sides are words of the caller — here the reconciliation after an export. */
export const Sides: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <DiffView
        rows={[
          {
            key: "amount",
            label: "Betrag",
            before: <AmountCell value={1249.9} currency="EUR" />,
            after: <AmountCell value={1189.9} currency="EUR" />,
            changed: true,
          },
          {
            key: "tax",
            label: "Steuerschlüssel",
            before: <MonoCell value="9" />,
            after: <MonoCell value="8" />,
            changed: true,
          },
          { key: "account", label: "Konto", before: <MonoCell value="6815" />, after: <MonoCell value="6815" />, changed: false },
        ]}
        before={{ label: "Ludwig", sub: "exportiert 01.09." }}
        after={{ label: "DATEV", sub: "Abgleich 05.09." }}
      />
    </div>
  ),
};

/**
 * The edges: a value that only one side has, a long text, and the same form at
 * 360 px — there the two states stand under each other, each with its word.
 */
export const Edges: Story = {
  render: () => {
    const rows: DiffRow[] = [
      { key: "kost", label: "Kostenstelle", before: "—", after: <MonoCell value="K-100" />, changed: true },
      {
        key: "text",
        label: "Buchungstext",
        before: "Wartung Produktionsanlage Halle 2 laut Rahmenvertrag, Abrechnung August",
        after: "Wartung und Instandhaltung Halle 2, August 2026 — Rahmenvertrag 4711",
        changed: true,
      },
      { key: "amount", label: "Betrag", before: <AmountCell value={1234567.89} currency="EUR" />, after: <AmountCell value={1234567.89} currency="EUR" />, changed: false },
    ];
    return (
      <div style={{ display: "grid", gap: 24 }}>
        <div style={{ maxWidth: 720 }}>
          <DiffView rows={rows} before={{ label: "Vorher" }} after={{ label: "Nachher" }} />
        </div>
        <div style={{ maxWidth: 360, border: "1px dashed var(--color-border)", padding: 12 }}>
          <DiffView rows={rows} before={{ label: "Vorher" }} after={{ label: "Nachher" }} tone="bare" />
        </div>
      </div>
    );
  },
};

/** In use: the reconciliation of an exported entry, inside a card that already has a head. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <Card>
        <CardHead title="RE-4471 · Bürobedarf Meier GmbH" sub="von der Kanzlei in DATEV geändert" />
        <div className="v3boxbody">
          <DiffView
            rows={ROWS}
            before={{ label: "Ludwig", sub: "exportiert 01.09." }}
            after={{ label: "DATEV", sub: "Abgleich 05.09." }}
            tone="bare"
          />
        </div>
      </Card>
    </div>
  ),
};
