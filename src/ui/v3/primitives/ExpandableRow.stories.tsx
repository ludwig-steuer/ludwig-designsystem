import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell, DotStatus } from "./Cells";
import { ClickRow, ExpandableRow, SelectCell, SelectionBar } from "./Interactive";
import { Card, CardHead, HeadRow, Table } from "./Table";

const meta: Meta<typeof ExpandableRow> = { title: "v3/Primitives/ExpandableRow", component: ExpandableRow };
export default meta;
type Story = StoryObj<typeof ExpandableRow>;

const COLS = "20px 1.6fr 120px 120px";

/** Die Zeile bleibt Teil der Tabelle — kein Modal für eine Zusatzinfo. */
export const Ausklappbar: Story = {
  render: () => (
    <Card>
      <CardHead title="Konventionen dieses Durchgangs" sub="2 Vorschläge" />
      <Table cols={COLS}>
        <HeadRow>
          <span />
          <span>Konvention</span>
          <span className="v2num">Betroffen</span>
          <span>Stand</span>
        </HeadRow>
        <ExpandableRow
          defaultOpen
          summary={
            <>
              <span>Bewirtungsbelege pauschal zu 70 % abziehen</span>
              <AmountCell value="12 Sätze" currency={null} />
              <DotStatus tone="warning" label="Entscheidung offen" />
            </>
          }
        >
          Betrifft alle Bewirtungsbuchungen im Zeitraum. Bisher wurde Fall für Fall entschieden —
          eine Konvention würde künftige Durchgänge automatisch vorkontieren.
        </ExpandableRow>
        <ExpandableRow
          summary={
            <>
              <span>Kleinbetragsrechnungen ohne Steuersatz auf 19 % setzen</span>
              <AmountCell value="4 Sätze" currency={null} />
              <DotStatus tone="success" label="Entschieden" />
            </>
          }
        >
          Am 12.08.2026 bestätigt. Gilt ab sofort für alle folgenden Perioden dieses Mandanten.
        </ExpandableRow>
      </Table>
    </Card>
  ),
};

/** Mehrfachauswahl: die Leiste erscheint erst, wenn etwas gewählt ist. */
export const MitAuswahl: Story = {
  render: function Render() {
    const zeilen = [
      { key: "a", name: "Vermieter Musterstraße", betrag: 1800 },
      { key: "b", name: "Werbeagentur Nord", betrag: 420 },
      { key: "c", name: "Bürobedarf GmbH", betrag: 64.9 },
    ];
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
          {zeilen.map((z) => (
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
export const OhneAuswahl: Story = {
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
