import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Download, ExternalLink, FileText, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { AmountCell } from "./Cells";
import { MenuItem, OverflowMenu } from "./OverflowMenu";
import { Card, HeadRow, Row, Table } from "./Table";
import { TextButton } from "./TextButton";

const meta: Meta<typeof OverflowMenu> = {
  title: "v3/Primitives/Aktion/OverflowMenu",
  component: OverflowMenu,
};
export default meta;
type Story = StoryObj<typeof OverflowMenu>;

const icon = (I: typeof FileText) => <I size={14} strokeWidth={1.5} />;

/** Der Auslöser trägt ein Wort, nie nur ein Icon (T8). */
export const Filled: Story = {
  render: () => (
    <OverflowMenu>
      <MenuItem href="#" icon={icon(FileText)}>
        Beleg öffnen
      </MenuItem>
      <MenuItem href="#" icon={icon(ExternalLink)}>
        In DATEV ansehen
      </MenuItem>
      <MenuItem href="#" icon={icon(Download)}>
        Als PDF laden
      </MenuItem>
      <MenuItem href="#" icon={icon(Pencil)}>
        Belegart ändern
      </MenuItem>
    </OverflowMenu>
  ),
};

/** `danger` für das, was etwas aufhebt; `disabled` nennt den Grund im Titel. */
export const Variants: Story = {
  render: () => (
    <OverflowMenu>
      <MenuItem href="#" icon={icon(FileText)}>
        Beleg öffnen
      </MenuItem>
      <MenuItem icon={icon(RotateCcw)} disabled title="Erst nach dem DATEV-Export möglich">
        Buchung stornieren
      </MenuItem>
      <MenuItem icon={icon(Trash2)} tone="danger">
        Vorschlag verwerfen
      </MenuItem>
    </OverflowMenu>
  ),
};

/** Linksbündig, wenn das Menü am linken Rand steht. */
export const AlignStart: Story = {
  render: () => (
    <OverflowMenu align="start" label="Weitere Wege">
      <MenuItem href="#">Kontenblatt öffnen</MenuItem>
      <MenuItem href="#">Kreditor bearbeiten</MenuItem>
    </OverflowMenu>
  ),
};

/** Rundlauf: der Eintrag löst aus, der Aufrufer merkt sich das Ergebnis. */
export const Interactive: Story = {
  render: function Render() {
    const [last, setLast] = useState<string | null>(null);
    return (
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <OverflowMenu>
          <MenuItem icon={icon(Pencil)} onClick={() => setLast("Belegart geändert")}>
            Belegart ändern
          </MenuItem>
          <MenuItem icon={icon(RotateCcw)} onClick={() => setLast("Zurückgestellt")}>
            Zurückstellen
          </MenuItem>
          <MenuItem icon={icon(Trash2)} tone="danger" onClick={() => setLast("Verworfen")}>
            Vorschlag verwerfen
          </MenuItem>
        </OverflowMenu>
        <div style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          Zuletzt: {last ?? "nichts"}
        </div>
      </div>
    );
  },
};

/** In der Zeile: zwei häufige Wege sichtbar, der Rest in der Klappe. */
export const InRow: Story = {
  render: () => (
    <Card>
      <Table cols="120px 1fr 140px 200px">
        <HeadRow>
          <th>Beleg</th>
          <th>Kreditor</th>
          <th style={{ textAlign: "right" }}>Betrag</th>
          <th>Aktion</th>
        </HeadRow>
        <Row>
          <td>RE-4471</td>
          <td>Bürobedarf Meier GmbH</td>
          <AmountCell value={1249.9} />
          <td>
            <span style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <TextButton>Prüfen</TextButton>
              <TextButton tone="quiet">Zurückstellen</TextButton>
              <OverflowMenu size="xs">
                <MenuItem href="#">Beleg öffnen</MenuItem>
                <MenuItem href="#">In DATEV ansehen</MenuItem>
                <MenuItem tone="danger">Vorschlag verwerfen</MenuItem>
              </OverflowMenu>
            </span>
          </td>
        </Row>
        <Row>
          <td>RE-4472</td>
          <td>Ohne Menü — die Referenzhöhe</td>
          <AmountCell value={412} />
          <td />
        </Row>
      </Table>
    </Card>
  ),
};

/** Acht Einträge: die Klappe scrollt, statt aus dem Bild zu laufen. */
export const ManyItems: Story = {
  render: () => (
    <OverflowMenu>
      {[
        "Beleg öffnen",
        "In DATEV ansehen",
        "Als PDF laden",
        "Belegart ändern",
        "Kreditor bearbeiten",
        "Kontenblatt öffnen",
        "Wiederkehr-Regel anlegen",
        "Verlauf ansehen",
      ].map((t) => (
        <MenuItem href="#" key={t}>
          {t}
        </MenuItem>
      ))}
    </OverflowMenu>
  ),
};
