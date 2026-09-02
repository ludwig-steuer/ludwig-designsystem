import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AmountCell, DotStatus, ErrorRow, TableLoading } from "./Cells";
import { Card, CardFoot, CardHead, EmptyRow, GroupRow, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof Table> = { title: "v3/Primitives/Tabelle/Table", component: Table };
export default meta;
type Story = StoryObj<typeof Table>;

const COLS = "1.6fr 120px 150px 130px";

const Header = () => (
  <HeadRow>
    <span>Gegenpartei</span>
    <span className="v2num">Betrag</span>
    <span>Stand</span>
    <span>Fällig</span>
  </HeadRow>
);

/** Jede Tabelle lebt in einer Karte: Kartenkopf, Spaltenkopf, Gruppen, Zeilen als Links. */
export const Filled: Story = {
  render: () => (
    <Card>
      <CardHead
        title="Offene Posten"
        sub="4 Posten · 2 überfällig"
        actions={<button type="button" className="v2link">Alle Posten</button>}
      />
      <Table cols={COLS}>
        <Header />
        <GroupRow>Überfällig</GroupRow>
        <Row href="#">
          <span className="v2main">Vermieter Musterstraße</span>
          <AmountCell value={1800} />
          <DotStatus tone="danger" label="12 Tage überfällig" />
          <span>21.08.2026</span>
        </Row>
        <Row href="#" active>
          <span className="v2main">Werbeagentur Nord</span>
          <AmountCell value={420} />
          <DotStatus tone="warning" label="3 Tage überfällig" />
          <span>30.08.2026</span>
        </Row>
        <GroupRow>Im Frame</GroupRow>
        <Row href="#">
          <span className="v2main">Bürobedarf GmbH</span>
          <AmountCell value={64.9} />
          <DotStatus tone="neutral" label="Offen" />
          <span>14.09.2026</span>
        </Row>
        <Row href="#">
          <span className="v2main">Telekom</span>
          <AmountCell value={89} />
          <DotStatus tone="neutral" label="Offen" />
          <span>20.09.2026</span>
        </Row>
      </Table>
      <CardFoot>Stand 02.09.2026, 09:40 · Beträge brutto</CardFoot>
    </Card>
  ),
};

/** Leer: die Kopfzeilen bleiben stehen, der Leerzustand sagt, warum nothing da ist. */
export const Empty: Story = {
  render: () => (
    <Card>
      <CardHead title="Offene Posten" sub="0 Posten" />
      <Table cols={COLS}>
        <Header />
        <EmptyRow>Keine offenen Posten — alles bezahlt.</EmptyRow>
      </Table>
    </Card>
  ),
};

/** Lädt: Skelettzeilen in Spaltenbreite, kein Spinner über der Karte. */
export const Loading: Story = {
  render: () => (
    <Card>
      <CardHead title="Offene Posten" />
      <Table cols={COLS}>
        <Header />
        <TableLoading rows={4} cols={4} />
      </Table>
    </Card>
  ),
};

/** Fehler: in der Karte, withItems dem Weg zurück. */
export const Error: Story = {
  render: () => (
    <Card>
      <CardHead title="Offene Posten" />
      <Table cols={COLS}>
        <Header />
        <ErrorRow
          message="Die Posten konnten nicht geladen werden."
          action={<button type="button" className="v2link">Erneut laden</button>}
        />
      </Table>
    </Card>
  ),
};
