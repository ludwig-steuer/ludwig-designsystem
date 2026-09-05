import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DeviationCell,
  AmountCell,
  DotStatus,
  ErrorRow,
  MonoCell,
  TableLoading,
  Timestamp,
} from "./Cells";
import { Progress } from "./Progress";
import { Card, CardHead, EmptyRow, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof AmountCell> = { title: "v3/Primitives/Tabelle/Zellen", component: AmountCell };
export default meta;
type Story = StoryObj<typeof AmountCell>;

const COLS = "190px 110px 150px 110px 1fr";

function Frame({ children, sub }: { children: React.ReactNode; sub?: string }) {
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
export const Filled: Story = {
  render: () => (
    <Frame sub="3 Zeilen">
      <Row>
        <span className="v2main">Bürobedarf GmbH</span>
        <AmountCell value={64.9} />
        <Progress share={0.72} />
        <DotStatus tone="success" label="Geprüft" />
        <Timestamp iso="2026-08-26T09:40:00Z" prefix="seit" />
      </Row>
      <Row>
        <span className="v2main">Vermieter Musterstraße</span>
        <AmountCell value={-1800} />
        <Progress share={0.2} tone="warning" />
        <DotStatus tone="warning" label="Offen" />
        <Timestamp iso="2026-08-21T14:05:00Z" prefix="seit" />
      </Row>
      <Row>
        <span className="v2main">Saldendifferenz Bank</span>
        <AmountCell value={-12.4} tone="danger" title="Auszug 8 gegen gebuchten Saldo" />
        <Progress share={1} tone="danger" />
        <DotStatus tone="danger" label="Blockiert" />
        <Timestamp iso={null} />
      </Row>
    </Frame>
  ),
};

/** Leer: die Kopfzeilen bleiben stehen, der Text sagt, was geprüft wurde. */
export const Empty: Story = {
  render: () => (
    <Frame>
      <EmptyRow>Keine fehlenden Belege — alle 94 Belege des Zeitraums sind zugeordnet.</EmptyRow>
    </Frame>
  ),
};

/** Leer nach Filter: der Unterschied zu „nichts da" muss lesbar sein. */
export const EmptyAfterFilter: Story = {
  render: () => (
    <Frame sub="gefiltert nach „überfällig“">
      <EmptyRow>
        Kein überfälliger Beleg. Ohne Filter stehen hier 3 Zeilen.
      </EmptyRow>
    </Frame>
  ),
};

/** Lädt: Zeilen in Zeilenhöhe, damit die Tabelle beim Eintreffen nicht springt. */
export const Loading: Story = {
  render: () => (
    <Frame>
      <TableLoading rows={3} cols={5} />
    </Frame>
  ),
};

/** Fehler: das Laden ist gescheitert — das ist etwas anderes als leer. */
export const Error: Story = {
  render: () => (
    <Frame>
      <ErrorRow
        message="Die Belegliste konnte nicht geladen werden."
        action={
          <button type="button" className="v2link">
            Erneut versuchen
          </button>
        }
      />
    </Frame>
  ),
};

/** Die vier Stufen der Abweichungsskala (L7) — Schwellen aus der Domain. */
export const DeviationScale: Story = {
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
          <DeviationCell pct={8} tone="neutral" explanation="64,90 gegen Ø 60,00 = +8 % — im Frame." />
        </Row>
        <Row>
          <span>6310 · Miete</span>
          <DeviationCell pct={-31} tone="warning" explanation="1.180 gegen Ø 1.700 = −31 %." />
        </Row>
        <Row>
          <span>6805 · Telefon</span>
          <DeviationCell pct={74} tone="warning-strong" explanation="348 gegen Ø 200 = +74 %." />
        </Row>
        <Row>
          <span>6600 · Werbung</span>
          <DeviationCell pct={420} tone="danger" explanation="2.100 gegen Ø 404 = +420 %." />
        </Row>
        <Row>
          <span>6820 · Porto</span>
          <DeviationCell pct={null} tone="neutral" explanation="Nur ein Vormonat — keine Bewertung." />
        </Row>
      </Table>
    </Card>
  ),
};

/**
 * `null` ist ein Wert, kein Fehler: ein offener Sachverhalt hat noch keine
 * Summe. `AmountCell` und `Timestamp` zeigen dafür denselben Gedankenstrich —
 * sonst schreibt jeder Aufrufer dieselbe Fallunterscheidung, und `0,00 €`
 * fängt an, „noch nicht bekannt" zu bedeuten.
 *
 * Die Null daneben beweist die Abgrenzung: sie ist ein Betrag und wird als
 * einer gezeigt.
 */
export const UnknownValues: Story = {
  render: () => (
    <Frame sub="unbekannt gegen null">
      <Row>
        <span>Musterfirma GmbH</span>
        <AmountCell value={1475.6} />
        <Progress share={1} label="1 / 1" />
        <DotStatus tone="success" label="gebucht" />
        <Timestamp iso="2026-08-26T09:12:00Z" />
      </Row>
      <Row>
        <span>Sachverhalt ohne Summe</span>
        <AmountCell value={null} />
        <Progress share={0} label="0 / 3" />
        <DotStatus tone="warning" label="offen" />
        <Timestamp iso={null} />
      </Row>
      <Row>
        <span>Umbuchung, saldenneutral</span>
        <AmountCell value={0} />
        <Progress share={1} label="1 / 1" />
        <DotStatus tone="success" label="gebucht" />
        <Timestamp iso="2026-08-30T11:00:00Z" />
      </Row>
    </Frame>
  ),
};

/**
 * Schlüssel statt Beträge: Kontonummer, BU-Schlüssel, DATEV-Code. Mono und
 * links — der Unterschied zu `AmountCell`, die rechts steht und proportional
 * setzt. Bisher gab es dafür nur eine CSS-Klasse.
 */
export const Mono: Story = {
  render: () => (
    <Card>
      <Table cols="120px 120px 100px 1fr">
        <HeadRow>
          <span>Sollkonto</span>
          <span>Habenkonto</span>
          <span>BU</span>
          <span>Belegfeld 1</span>
        </HeadRow>
        <Row>
          <span>
            <MonoCell value="6815" />
          </span>
          <span>
            <MonoCell value="70021" />
          </span>
          <span>
            <MonoCell value={9} title="19 % Vorsteuer" />
          </span>
          <span>
            <MonoCell value="RE-4471" />
          </span>
        </Row>
        <Row>
          <span>
            <MonoCell value="1200" />
          </span>
          <span>
            <MonoCell value="70044" />
          </span>
          <span>
            <MonoCell value={null} />
          </span>
          <span>
            <MonoCell value="AZ-2026-08-14" tone="muted" />
          </span>
        </Row>
      </Table>
    </Card>
  ),
};

