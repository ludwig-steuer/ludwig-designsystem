import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  AbweichungsZelle,
  AmountCell,
  DotStatus,
  ErrorRow,
  ProgressCell,
  TableLoading,
  Timestamp,
} from "./Cells";
import { Card, CardHead, EmptyRow, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof AmountCell> = { title: "v3/Primitives/AmountCell", component: AmountCell };
export default meta;
type Story = StoryObj<typeof AmountCell>;

const COLS = "190px 110px 150px 110px 1fr";

function Rahmen({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <CardHead title="Fehlende Belege" sub={sub} />
      <Table cols={COLS}>
        <HeadRow>
          <span>Gegenpartei</span>
          <span className="v2num">Betrag</span>
          <span>Fortschritt</span>
          <span>Stand</span>
          <span>Zuletzt</span>
        </HeadRow>
        {children}
      </Table>
    </Card>
  );
}

/**
 * Owner-Entscheid F123 §4/4: negative Beträge sind **nicht** automatisch rot.
 * Jede Gutschrift wäre sonst ein Alarm. Der Ton kommt vom Aufrufer, wo die
 * Zahl wirklich etwas meint.
 */
export const Gefuellt: Story = {
  render: () => (
    <Rahmen sub="3 Zeilen">
      <Row>
        <span className="v2main">Bürobedarf GmbH</span>
        <AmountCell value={64.9} />
        <ProgressCell share={0.72} />
        <DotStatus tone="success" label="Geprüft" />
        <Timestamp iso="2026-08-26T09:40:00Z" prefix="seit" />
      </Row>
      <Row>
        <span className="v2main">Vermieter Musterstraße</span>
        <AmountCell value={-1800} />
        <ProgressCell share={0.2} tone="warning" />
        <DotStatus tone="warning" label="Offen" />
        <Timestamp iso="2026-08-21T14:05:00Z" prefix="seit" />
      </Row>
      <Row>
        <span className="v2main">Saldendifferenz Bank</span>
        <AmountCell value={-12.4} tone="danger" title="Auszug 8 gegen gebuchten Saldo" />
        <ProgressCell share={1} tone="danger" />
        <DotStatus tone="danger" label="Blockiert" />
        <Timestamp iso={null} />
      </Row>
    </Rahmen>
  ),
};

/** Leer: die Kopfzeilen bleiben stehen, der Text sagt, was geprüft wurde. */
export const Leer: Story = {
  render: () => (
    <Rahmen>
      <EmptyRow>Keine fehlenden Belege — alle 94 Belege des Zeitraums sind zugeordnet.</EmptyRow>
    </Rahmen>
  ),
};

/** Leer nach Filter: der Unterschied zu „nichts da" muss lesbar sein. */
export const LeerNachFilter: Story = {
  render: () => (
    <Rahmen sub="gefiltert nach „überfällig“">
      <EmptyRow>
        Kein überfälliger Beleg. Ohne Filter stehen hier 3 Zeilen.
      </EmptyRow>
    </Rahmen>
  ),
};

/** Lädt: Zeilen in Zeilenhöhe, damit die Tabelle beim Eintreffen nicht springt. */
export const Laedt: Story = {
  render: () => (
    <Rahmen>
      <TableLoading rows={3} cols={5} />
    </Rahmen>
  ),
};

/** Fehler: das Laden ist gescheitert — das ist etwas anderes als leer. */
export const Fehler: Story = {
  render: () => (
    <Rahmen>
      <ErrorRow
        message="Die Belegliste konnte nicht geladen werden."
        action={
          <button type="button" className="v2link">
            Erneut versuchen
          </button>
        }
      />
    </Rahmen>
  ),
};

/** Die vier Stufen der Abweichungsskala (L7) — Schwellen aus der Domain. */
export const Abweichungsskala: Story = {
  render: () => (
    <Card>
      <CardHead title="Abweichung gegen den Vormonatsschnitt" />
      <Table cols="1fr 110px">
        <HeadRow>
          <span>Konto</span>
          <span className="v2num">Abweichung</span>
        </HeadRow>
        <Row>
          <span>6815 · Bürobedarf</span>
          <AbweichungsZelle pct={8} tone="neutral" explanation="64,90 gegen Ø 60,00 = +8 % — im Rahmen." />
        </Row>
        <Row>
          <span>6310 · Miete</span>
          <AbweichungsZelle pct={-31} tone="warning" explanation="1.180 gegen Ø 1.700 = −31 %." />
        </Row>
        <Row>
          <span>6805 · Telefon</span>
          <AbweichungsZelle pct={74} tone="warning-strong" explanation="348 gegen Ø 200 = +74 %." />
        </Row>
        <Row>
          <span>6600 · Werbung</span>
          <AbweichungsZelle pct={420} tone="danger" explanation="2.100 gegen Ø 404 = +420 %." />
        </Row>
        <Row>
          <span>6820 · Porto</span>
          <AbweichungsZelle pct={null} tone="neutral" explanation="Nur ein Vormonat — keine Bewertung." />
        </Row>
      </Table>
    </Card>
  ),
};
