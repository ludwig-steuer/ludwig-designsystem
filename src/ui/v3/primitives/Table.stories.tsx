import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookOpen, Layers } from "lucide-react";
import { AmountCell, DotStatus, ErrorRow, TableLoading } from "./Cells";
import { Card, CardFoot, CardHead, EmptyRow, GroupRow, HeadRow, Row, Table } from "./Table";
import { TextButton } from "./TextButton";

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

/** Leer: die Kopfzeilen bleiben stehen, der Leerzustand sagt, warum nichts da ist. */
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

/** Fehler: in der Karte, mit dem Weg zurück. */
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

/**
 * `icon` und `meta` am `CardHead` (0049): das Symbol sagt, um welche Entität
 * es geht, `meta` trägt den Zusatz — und zwar **vor** den Aktionen. Die
 * Aktion bleibt außen, wo die Hand sie sucht.
 */
export const CardHeadIconMeta: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12, maxWidth: 620 }}>
      <Card>
        <CardHead
          icon={<Layers size={16} strokeWidth={1.5} />}
          title="Timeline"
          sub="Ereignisse, Klärungen, Erwartungen"
          meta="1 Ereignis"
          actions={<TextButton>Alle zeigen</TextButton>}
        />
        <Table cols="1fr 120px">
          <Row>
            <span className="v2main">Eingangsrechnung erfasst</span>
            <AmountCell value={1475.6} />
          </Row>
        </Table>
      </Card>
      <Card>
        <CardHead icon={<BookOpen size={16} strokeWidth={1.5} />} title="Detail" meta="Beleg RE-4471" />
        <Table cols="1fr 120px">
          <Row>
            <span className="v2main">Bürobedarf August</span>
            <AmountCell value={1475.6} />
          </Row>
        </Table>
      </Card>
      <Card>
        <CardHead title="Ohne Symbol und Zusatz" sub="unverändert zum Bestand" />
        <Table cols="1fr 120px">
          <Row>
            <span className="v2main">Zeile</span>
            <AmountCell value={42} />
          </Row>
        </Table>
      </Card>
    </div>
  ),
};

/**
 * `density` (0057 E9): dieselben Zeilen dreimal. `default` ist die heutige
 * Zeile, `compact` das Kontenblatt, `wide` trägt Titel und Untertitel in einer
 * Zelle. Die Seite entscheidet das, nicht die Nutzerin (V1).
 */
export const Density: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 620 }}>
      {(["compact", "default", "wide"] as const).map((density) => (
        <Card key={density}>
          <CardHead title="Offene Posten" sub={density} />
          <Table cols="1.6fr 120px" density={density}>
            <HeadRow>
              <span>Gegenpartei</span>
              <span className="v2num">Betrag</span>
            </HeadRow>
            <Row>
              <div>
                <div className="v2main">Vermieter Musterstraße</div>
                {density === "wide" ? <div className="v2sub">Miete August · fällig 21.08.2026</div> : null}
              </div>
              <AmountCell value={1800} />
            </Row>
            <Row>
              <div>
                <div className="v2main">Werbeagentur Nord</div>
                {density === "wide" ? <div className="v2sub">Kampagne Sommer · fällig 30.08.2026</div> : null}
              </div>
              <AmountCell value={420} />
            </Row>
          </Table>
        </Card>
      ))}
    </div>
  ),
};
