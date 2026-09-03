import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";
import { PageHeader } from "./PageHeader";
import { StatusBadge } from "../patterns/StatusBadge";
import { AmountCell } from "./Cells";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";
import { Timestamp } from "./Cells";

const meta: Meta<typeof PageHeader> = {
  title: "v3/Primitives/Fläche/PageHeader",
  component: PageHeader,
};
export default meta;
type Story = StoryObj<typeof PageHeader>;

/** Überzeile, Titel, ein Satz — der Normalfall. */
export const Filled: Story = {
  render: () => (
    <PageHeader
      overline="Musterbau GmbH · Wirtschaftsjahr 2026"
      title="Offene Posten"
      description="Alles, was zum 31.08.2026 noch nicht ausgeglichen ist — nach Fälligkeit gestaffelt."
    />
  ),
};

/** Der Zustand steht neben dem Titel, nicht darunter. */
export const WithMeta: Story = {
  render: () => (
    <PageHeader
      overline="Musterbau GmbH · Wirtschaftsjahr 2026"
      title="Stapel 2026-08 · Bürobedarf"
      meta={
        <>
          <StatusBadge axis="buchung" status="proposed" />
          <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
            zuletzt <Timestamp iso="2026-08-31T09:12:00Z" />
          </span>
        </>
      }
      description="142 Sätze, davon 38 ungeprüft."
    />
  ),
};

/** Genau ein primärer Weg; der Rest ist sekundär. */
export const WithActions: Story = {
  render: () => (
    <PageHeader
      overline="Musterbau GmbH · Wirtschaftsjahr 2026"
      title="Stapel 2026-08 · Bürobedarf"
      description="142 Sätze, davon 38 ungeprüft."
      actions={
        <>
          <Button size="sm">Als CSV laden</Button>
          <Button size="sm" variant="primary" hotkey="A">
            Stapel abnehmen
          </Button>
        </>
      }
    />
  ),
};

/** Der Weg zurück nennt sein Ziel — nie „Zurück". */
export const WithBack: Story = {
  render: () => (
    <PageHeader
      back={{ href: "#", label: "Alle Stapel" }}
      overline="Musterbau GmbH · Wirtschaftsjahr 2026"
      title="Stapel 2026-08 · Bürobedarf"
    />
  ),
};

/**
 * Der Randfall: ein Titel, der nicht in eine Zeile passt. Er bricht um, die
 * Aktionen rutschen darunter — nichts wird abgeschnitten, nichts überlappt.
 */
export const LongTitle: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <PageHeader
        overline="Musterbau GmbH · Wirtschaftsjahr 2026"
        title="Stapel 2026-08 · Bürobedarf, Fachliteratur und sonstiger Betriebsbedarf der Musterbau GmbH"
        description="142 Sätze, davon 38 ungeprüft."
        actions={
          <Button size="sm" variant="primary">
            Stapel abnehmen
          </Button>
        }
      />
    </div>
  ),
};

/** Die Untergrenze: nur der Titel. Alles andere ist optional. */
export const TitleOnly: Story = {
  render: () => <PageHeader title="Kontenblatt 6815 · Bürobedarf" />,
};

/** Vollständig, über der Karte — der Kopf steht, der Inhalt wechselt. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <PageHeader
        back={{ href: "#", label: "Alle Stapel" }}
        overline="Musterbau GmbH · Wirtschaftsjahr 2026"
        title="Stapel 2026-08 · Bürobedarf"
        meta={<StatusBadge axis="buchung" status="proposed" />}
        description="142 Sätze, davon 38 ungeprüft. Zwei Sätze über 1.000,00 € tragen einen Befund."
        actions={
          <>
            <Button size="sm">Als CSV laden</Button>
            <Button size="sm" variant="primary" hotkey="A">
              Stapel abnehmen
            </Button>
          </>
        }
      />
      <Card>
        <CardHead title="Ungeprüfte Sätze" sub="38 von 142" />
        <Table cols="120px 1fr 140px">
          <HeadRow>
            <th>Beleg</th>
            <th>Kreditor</th>
            <th style={{ textAlign: "right" }}>Betrag</th>
          </HeadRow>
          <Row>
            <td>RE-4471</td>
            <td>Bürobedarf Meier GmbH</td>
            <AmountCell value={1249.9} />
          </Row>
          <Row>
            <td>RE-4472</td>
            <td>Stadtwerke Musterstadt</td>
            <AmountCell value={412} />
          </Row>
        </Table>
      </Card>
    </div>
  ),
};
