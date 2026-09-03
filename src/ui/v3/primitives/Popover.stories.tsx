import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Columns3, Info } from "lucide-react";
import { useState } from "react";
import { accountSourceLabel } from "@/ludwig/modules/accounts/domain/account";
import { AmountCell } from "./Cells";
import { Button } from "./Button";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";
import { Checkbox } from "./Form";
import { FieldList } from "./FieldList";
import { HoverCard, Popover, Tooltip } from "./Popover";
import { IconButton } from "./IconButton";
import { Link } from "./Link";

const meta: Meta<typeof Popover> = { title: "v3/Primitives/Dialog/Popover", component: Popover };
export default meta;
type Story = StoryObj<typeof Popover>;

/** Die Kontokarte, wie ein Aufrufer sie für die Vorschau zusammensetzt. */
function AccountCard() {
  return (
    <FieldList
      title="6815 · Bürobedarf"
      tone="bare"
      rows={[
        ["Kontenart", "Sachkonto"],
        ["Herkunft", accountSourceLabel("reference")],
        ["Saldo 2026", "14.208,40 €"],
        ["Buchungen", "16 seit 01.01.2026"],
      ]}
    />
  );
}

/** Ein Feld auf Klick — der Trigger trägt ein Wort, kein nacktes Icon (T8). */
export const Filled: Story = {
  render: () => (
    <div style={{ padding: "var(--space-8)" }}>
      <Popover
        trigger={
          <Button size="sm" icon={<Columns3 size={14} strokeWidth={1.5} aria-hidden="true" />}>
            Spalten wählen
          </Button>
        }
      >
        <div className="v2stack">
          <Checkbox label="Beleg" defaultChecked />
          <Checkbox label="Kreditor" defaultChecked />
          <Checkbox label="Konto" defaultChecked />
          <Checkbox label="Steuerschlüssel" />
        </div>
      </Popover>
    </div>
  ),
};

/**
 * `align` bestimmt die Kante, an der das Feld hängt. Der untere Knopf zeigt
 * den Randfall: unten am Fenster klappt das Feld nach oben statt hinaus.
 */
export const Variants: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        minHeight: "96vh",
        padding: "var(--space-4)",
      }}
    >
      <div style={{ display: "flex", gap: "var(--space-6)", width: "100%" }}>
        <Popover trigger={<Button size="sm">Links ausgerichtet</Button>} align="start">
          <div style={{ minWidth: 200 }}>Das Feld beginnt an der linken Kante des Knopfes.</div>
        </Popover>
        <div style={{ marginLeft: "auto" }}>
          <Popover trigger={<Button size="sm">Rechts ausgerichtet</Button>} align="end">
            <div style={{ minWidth: 200 }}>Das Feld endet an der rechten Kante des Knopfes.</div>
          </Popover>
        </div>
      </div>
      <Popover trigger={<Button size="sm">Am unteren Rand</Button>}>
        <div style={{ minWidth: 240 }}>
          Unten ist kein Platz mehr — das Feld klappt über den Knopf statt aus dem Fenster.
        </div>
      </Popover>
    </div>
  ),
};

/**
 * Gesteuert: die Handlung im Feld schließt es. Ohne `open`/`onOpenChange`
 * hält die Familie den Zustand selbst.
 */
export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [limit, setLimit] = useState("1.000,00 €");
    return (
      <div className="v2stack" style={{ padding: "var(--space-8)", maxWidth: 420 }}>
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={<Button size="sm">Prüfgrenze ändern</Button>}
        >
          <div className="v2stack" style={{ minWidth: 220 }}>
            <div>Ab welchem Betrag prüft die Kanzlei selbst?</div>
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setLimit("2.500,00 €");
                setOpen(false);
              }}
            >
              2.500,00 € übernehmen
            </Button>
          </div>
        </Popover>
        <div className="lw-body-sm">Aktuelle Prüfgrenze: {limit}</div>
      </div>
    );
  },
};

/** Im Einsatz: die Spaltenwahl im Kopf der Karte, über der Tabelle. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
      <Card>
        <CardHead
          title="Ungeprüfte Sätze"
          sub="38 von 142"
          actions={
            <Popover
              align="end"
              trigger={
                <Button size="sm" icon={<Columns3 size={14} strokeWidth={1.5} aria-hidden="true" />}>
                  Spalten wählen
                </Button>
              }
            >
              <div className="v2stack">
                <Checkbox label="Beleg" defaultChecked />
                <Checkbox label="Kreditor" defaultChecked />
                <Checkbox label="Betrag" defaultChecked />
                <Checkbox label="Steuerschlüssel" />
              </div>
            </Popover>
          }
        />
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

/**
 * Der Tooltip erklärt einen `IconButton` — er ersetzt dessen `aria-label`
 * nicht, er kommt dazu. Bei Tastaturfokus erscheint er sofort.
 */
export const TooltipFilled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-4)", padding: "var(--space-8)" }}>
      <Tooltip label="Erklärt, wie Ludwig auf dieses Konto gekommen ist">
        <IconButton label="Herkunft" icon={<Info size={16} strokeWidth={1.5} />} />
      </Tooltip>
      <Tooltip label="Steuerschlüssel 9 · 19 % Vorsteuer">
        <span className="v2mono">BU 9</span>
      </Tooltip>
    </div>
  ),
};

/**
 * Der Rand: ein langer Text bricht in der maximalen Breite um, und ganz unten
 * am Fenster klappt der Tooltip über sein Element.
 */
export const TooltipEdge: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "flex-start",
        minHeight: "96vh",
        padding: "var(--space-4)",
      }}
    >
      <Tooltip label="Die Wiederkehr-Regel greift nicht, weil der Betrag über 500,00 € liegt und die Rechnung keine Position für Fachliteratur nennt.">
        <span className="v2link">Warum greift die Regel nicht?</span>
      </Tooltip>
      <Tooltip label="Ganz unten am Fenster klappt der Tooltip nach oben, statt aus dem Bild zu laufen.">
        <span className="v2link">Am unteren Rand</span>
      </Tooltip>
    </div>
  ),
};

/**
 * Die Vorschau: die Kontonummer führt weiter zum Kontenblatt (I11), die Karte
 * zeigt vorab, was dort steht. Zeigen Sie auf die Nummer.
 */
export const HoverCardFilled: Story = {
  render: () => (
    <div style={{ padding: "var(--space-8)" }}>
      <span className="lw-body-sm">
        Gebucht auf{" "}
        <HoverCard content={<AccountCard />}>
          <Link href="#" className="v2link v2mono">
            6815
          </Link>
        </HoverCard>{" "}
        an 70000.
      </span>
    </div>
  ),
};

/** Im Einsatz: in einer Zeile der Buchungstabelle, ohne die Liste zu verlassen. */
export const HoverCardInUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720, padding: "var(--space-6)" }}>
      <Card>
        <CardHead title="Buchungen" sub="August 2026" />
        <Table cols="120px 1fr 100px 140px">
          <HeadRow>
            <th>Beleg</th>
            <th>Kreditor</th>
            <th>Konto</th>
            <th style={{ textAlign: "right" }}>Betrag</th>
          </HeadRow>
          <Row>
            <td>RE-4471</td>
            <td>Bürobedarf Meier GmbH</td>
            <td>
              <HoverCard content={<AccountCard />}>
                <Link href="#" className="v2link v2mono">
                  6815
                </Link>
              </HoverCard>
            </td>
            <AmountCell value={1249.9} />
          </Row>
          <Row>
            <td>RE-4472</td>
            <td>Stadtwerke Musterstadt</td>
            <td>
              <HoverCard content={<AccountCard />}>
                <Link href="#" className="v2link v2mono">
                  6815
                </Link>
              </HoverCard>
            </td>
            <AmountCell value={412} />
          </Row>
        </Table>
      </Card>
    </div>
  ),
};

/** Der Rand: in der untersten Zeile klappt die Karte nach oben. */
export const HoverCardEdge: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        minHeight: "96vh",
        padding: "var(--space-4)",
      }}
    >
      <span className="lw-body-sm">
        Letzte Zeile der Liste:{" "}
        <HoverCard content={<AccountCard />}>
          <Link href="#" className="v2link v2mono">
            6815
          </Link>
        </HoverCard>
      </span>
    </div>
  ),
};
