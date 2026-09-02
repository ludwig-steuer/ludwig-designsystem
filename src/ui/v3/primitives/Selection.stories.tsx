import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "./Cells";
import { ClickRow } from "./ExpandableRow";
import { SelectCell, SelectionBar } from "./Selection";
import { Card, CardHead, HeadRow, Table } from "./Table";

const meta: Meta<typeof SelectionBar> = { title: "v3/Primitives/Tabelle/Selection", component: SelectionBar };
export default meta;
type Story = StoryObj<typeof SelectionBar>;

const ROWS = [
  { key: "a", name: "Vermieter Musterstraße", betrag: 1800 },
  { key: "b", name: "Werbeagentur Nord", betrag: 420 },
  { key: "c", name: "Bürobedarf GmbH", betrag: 64.9 },
];

/** Mehrfachauswahl: die Leiste erscheint erst, wenn etwas gewählt ist. */
export const WithSelection: Story = {
  render: function Render() {
    const [gewaehlt, setGewaehlt] = useState<string[]>(["a", "b"]);
    return (
      <Card>
        <CardHead title="Fehlende Belege · 3" />
        <SelectionBar
          count={gewaehlt.length}
          onClear={() => setGewaehlt([])}
          actions={
            <button type="button" className="v2link">
              Als nicht nötig markieren
            </button>
          }
        />
        <Table cols="24px 1.5fr 120px">
          <HeadRow>
            <span />
            <span>Gegenpartei</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          {ROWS.map((z) => (
            <ClickRow
              key={z.key}
              active={gewaehlt.includes(z.key)}
              onClick={() =>
                setGewaehlt((g) => (g.includes(z.key) ? g.filter((k) => k !== z.key) : [...g, z.key]))
              }
            >
              <SelectCell
                checked={gewaehlt.includes(z.key)}
                label={`${z.name} auswählen`}
                onChange={(c) =>
                  setGewaehlt((g) => (c ? [...g, z.key] : g.filter((k) => k !== z.key)))
                }
              />
              <span className="v2main">{z.name}</span>
              <AmountCell value={z.betrag} />
            </ClickRow>
          ))}
        </Table>
      </Card>
    );
  },
};

/** Nichts gewählt — die Auswahl-Leiste ist nicht da, nicht nur leer. */
export const WithoutSelection: Story = {
  render: () => (
    <Card>
      <CardHead title="Fehlende Belege · 1" />
      <SelectionBar count={0} onClear={() => {}} actions={null} />
      <Table cols="24px 1.5fr 120px">
        <HeadRow>
          <span />
          <span>Gegenpartei</span>
          <span className="v2num">Betrag</span>
        </HeadRow>
        <ClickRow onClick={() => {}}>
          <SelectCell checked={false} label="Bürobedarf GmbH auswählen" onChange={() => {}} />
          <span className="v2main">Bürobedarf GmbH</span>
          <AmountCell value={64.9} />
        </ClickRow>
      </Table>
    </Card>
  ),
};
