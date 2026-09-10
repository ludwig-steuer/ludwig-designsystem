import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell, DotStatus } from "./Cells";
import { ClickRow, ExpandableRow } from "./ExpandableRow";
import { SelectCell } from "./Selection";
import { Card, CardHead, HeadRow, Table } from "./Table";

const meta: Meta<typeof ExpandableRow> = { title: "v3/Primitives/Tabelle/ExpandableRow", component: ExpandableRow };
export default meta;
type Story = StoryObj<typeof ExpandableRow>;

const COLS = "20px 1.6fr 120px 120px";

/** Die Zeile bleibt Teil der Tabelle — kein Modal für eine Zusatzinfo. */
export const Expandable: Story = {
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

/** Klick statt Link: die Zeile wählt aus, das Detail steht daneben. */
export const Clickable: Story = {
  render: function Render() {
    const rows = [
      { key: "a", name: "Vermieter Musterstraße", betrag: 1800 },
      { key: "b", name: "Werbeagentur Nord", betrag: 420 },
      { key: "c", name: "Bürobedarf GmbH", betrag: 64.9 },
    ];
    const [active, setActive] = useState("a");
    return (
      <Card>
        <CardHead title="Fehlende Belege · 3" />
        <Table cols="1.5fr 120px">
          <HeadRow>
            <span>Gegenpartei</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          {rows.map((z) => (
            <ClickRow key={z.key} active={z.key === active} onClick={() => setActive(z.key)}>
              <span className="v2main">{z.name}</span>
              <AmountCell value={z.betrag} />
            </ClickRow>
          ))}
        </Table>
      </Card>
    );
  },
};

/**
 * `lead` (0057): was **vor** dem Chevron steht. Die Auswahl ist die erste
 * Spalte, der Chevron die zweite — die Checkbox stoppt den Klick, also schaltet
 * sie aus, ohne die Zeile aufzuklappen.
 */
export const WithLead: Story = {
  render: function Render() {
    const [selected, setSelected] = useState<string[]>([]);
    return (
      <Card>
        <CardHead title="Sachverhalte 2026" sub={`${selected.length} ausgewählt`} />
        <Table cols="32px 20px 1.6fr 120px">
          <HeadRow>
            <span />
            <span />
            <span>Gegenpartei</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          {[
            { key: "2026-0417", name: "Musterfirma GmbH", betrag: 1800 },
            { key: "2026-0418", name: "Werbeagentur Nord", betrag: 420 },
          ].map((z) => (
            <ExpandableRow
              key={z.key}
              lead={
                <SelectCell
                  checked={selected.includes(z.key)}
                  label={`Sachverhalt ${z.key} auswählen`}
                  onChange={(c) =>
                    setSelected((g) => (c ? [...g, z.key] : g.filter((k) => k !== z.key)))
                  }
                />
              }
              summary={
                <>
                  <span className="v2main">{z.name}</span>
                  <AmountCell value={z.betrag} />
                </>
              }
            >
              Eingangsrechnung vom 26.08.2026, ein Beleg, keine offene Klärung.
            </ExpandableRow>
          ))}
        </Table>
      </Card>
    );
  },
};
