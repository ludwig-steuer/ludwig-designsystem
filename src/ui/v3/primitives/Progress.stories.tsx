import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Progress } from "./Progress";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof Progress> = { title: "v3/Primitives/Daten/Fortschritt", component: Progress };
export default meta;
type Story = StoryObj<typeof Progress>;

function Cases({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <Table cols="220px 1fr">
        <HeadRow>
          <span>Fall</span>
          <span>Fortschritt</span>
        </HeadRow>
        {children}
      </Table>
    </Card>
  );
}

/**
 * Drei Schreibweisen für dieselbe Sache. `done`/`total` schreibt „41 von 118"
 * und rechnet den Balken selbst — sonst rechnet jeder Aufrufer dieselbe
 * Division. Ohne `total` bleibt es der Prozentsatz, und ein eigenes `label`
 * schlägt beides.
 */
export const Labels: Story = {
  render: () => (
    <Cases>
      <Row>
        <span className="v2main">Anteil in Prozent</span>
        <Progress share={0.72} />
      </Row>
      <Row>
        <span className="v2main">x von y</span>
        <Progress done={41} total={118} />
      </Row>
      <Row>
        <span className="v2main">x von y, nichts erledigt</span>
        <Progress done={0} total={3} tone="warning" />
      </Row>
      <Row>
        <span className="v2main">eigenes Label</span>
        <Progress done={2} total={4} label="2 Belege fehlen" tone="danger" />
      </Row>
    </Cases>
  ),
};

/** 4px, 6px, 10px. Das Label bleibt gleich groß — es soll überall lesbar sein. */
export const Sizes: Story = {
  render: () => (
    <Cases>
      <Row>
        <span className="v2main">sm — in einer dichten Zeile</span>
        <Progress done={7} total={9} size="sm" />
      </Row>
      <Row>
        <span className="v2main">md — Standard</span>
        <Progress done={7} total={9} />
      </Row>
      <Row>
        <span className="v2main">lg — allein auf einer Fläche</span>
        <Progress done={7} total={9} size="lg" />
      </Row>
    </Cases>
  ),
};

/**
 * `label={null}` nur dort, wo die Zahl schon danebensteht — so macht es
 * `Review` (Zähler links) und `StepRail` (Text vor dem Balken). Ein Balken
 * ohne jede Zahl ist Dekoration: niemand liest daraus einen Stand ab.
 */
export const WithoutLabel: Story = {
  render: () => (
    <Card>
      <CardHead title="Neben der Zahl" sub="wie in Review und StepRail" />
      <Table cols="220px 90px 1fr">
        <HeadRow>
          <span>Zeile</span>
          <span className="v2num">Stand</span>
          <span>Balken</span>
        </HeadRow>
        <Row>
          <span className="v2main">Belege zugeordnet</span>
          <span className="v2num">106 / 118</span>
          <Progress done={106} total={118} label={null} />
        </Row>
        <Row>
          <span className="v2main">Rückfragen beantwortet</span>
          <span className="v2num">0 / 2</span>
          <Progress done={0} total={2} size="sm" label={null} tone="warning" />
        </Row>
      </Table>
    </Card>
  ),
};

/**
 * Ränder: leer, voll, übersteuert. Werte über 1 werden geklemmt, damit der
 * Balken nicht ausbricht — ein Aufrufer, der 1,4 schickt, hat sich verrechnet,
 * aber die Zeile soll trotzdem stehen.
 */
export const Edge: Story = {
  render: () => (
    <Cases>
      <Row>
        <span className="v2main">nichts erledigt</span>
        <Progress share={0} />
      </Row>
      <Row>
        <span className="v2main">fertig</span>
        <Progress done={9} total={9} tone="success" />
      </Row>
      <Row>
        <span className="v2main">über 100 % — geklemmt</span>
        <Progress share={1.4} />
      </Row>
      <Row>
        <span className="v2main">total = 0</span>
        <Progress done={0} total={0} />
      </Row>
    </Cases>
  ),
};
