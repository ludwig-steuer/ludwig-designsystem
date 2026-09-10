import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "./Cells";
import { ClickRow } from "./ExpandableRow";
import {
  SelectAllCell,
  SelectCell,
  SelectRowCell,
  SelectionBar,
  SelectionScope,
  SelectionScopeBar,
  type BulkAction,
} from "./Selection";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";
import { TextButton } from "./TextButton";

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
    const [selected, setSelected] = useState<string[]>(["a", "b"]);
    return (
      <Card>
        <CardHead title="Fehlende Belege · 3" />
        <SelectionBar
          count={selected.length}
          onClear={() => setSelected([])}
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
              active={selected.includes(z.key)}
              onClick={() =>
                setSelected((g) => (g.includes(z.key) ? g.filter((k) => k !== z.key) : [...g, z.key]))
              }
            >
              <SelectCell
                checked={selected.includes(z.key)}
                label={`${z.name} auswählen`}
                onChange={(c) =>
                  setSelected((g) => (c ? [...g, z.key] : g.filter((k) => k !== z.key)))
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

/* ── The island: it holds the selection itself (0057) ─────────────────────── */

const ISLAND_ROWS = [
  { key: "2026-0417", name: "Musterfirma GmbH", betrag: 1800 },
  { key: "2026-0418", name: "Vermieter Musterstraße", betrag: 1450 },
  { key: "2026-0419", name: "Werbeagentur Nord", betrag: 420 },
  { key: "2026-0420", name: "Bürobedarf GmbH", betrag: 64.9 },
];

const ISLAND_ACTIONS: BulkAction[] = [
  { label: "Freigeben", hotkey: "F", action: async () => {} },
];

/**
 * `SelectionScope` hält die Auswahl, `SelectAllCell`, `SelectRowCell` und
 * `SelectionScopeBar` lesen sie. Der Aufrufer reicht nur noch `order` und die
 * Sammelaktionen herein — kein `useState` mehr je Seite.
 *
 * Zum Ausprobieren: drei Zeilen wählen, dann mit Shift auf die vierte klicken;
 * die Kopf-Checkbox steht bei Teilauswahl auf `indeterminate`, `F` gibt frei.
 */
export const Island: Story = {
  render: () => (
    <SelectionScope order={ISLAND_ROWS.map((z) => z.key)}>
      <Card>
        <CardHead
          title="Sachverhalte 2026"
          sub="4 von 583"
          actions={
            <SelectionScopeBar
              actions={ISLAND_ACTIONS}
              fallback={<TextButton href="#neu">Sachverhalt anlegen</TextButton>}
            />
          }
        />
        <Table cols="32px 1.5fr 120px">
          <HeadRow>
            <SelectAllCell />
            <span>Gegenpartei</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          {ISLAND_ROWS.map((z) => (
            <Row key={z.key}>
              <SelectRowCell rowKey={z.key} label={`Sachverhalt ${z.key} auswählen`} />
              <span className="v2main">{z.name}</span>
              <AmountCell value={z.betrag} />
            </Row>
          ))}
        </Table>
      </Card>
    </SelectionScope>
  ),
};
