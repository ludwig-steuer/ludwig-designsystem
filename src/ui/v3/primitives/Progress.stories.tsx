import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./Badge";
import { Progress, type ProgressPart } from "./Progress";
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

/**
 * `inline` (0046) stellt die Zahl **vor** den Balken, in eine Zeile — für
 * Köpfe und breite Flächen, wo waagerecht Platz ist. So baut `StepRail`
 * seinen Schritt-Fortschritt und so gehört ein Stand in einen Gruppenkopf,
 * ohne dass der Aufrufer ein Flex-Layout schreibt.
 */
export const Inline: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20, maxWidth: 460 }}>
      <Card>
        <CardHead title="In einer Zeile" sub="drei Größen" />
        <div style={{ display: "grid", gap: 12, padding: "12px 16px" }}>
          <Progress done={41} total={118} label="41 von 118 Punkte" size="sm" inline />
          <Progress done={41} total={118} label="41 von 118 Punkte" inline />
          <Progress done={41} total={118} label="41 von 118 Punkte" size="lg" inline />
        </div>
      </Card>
      <Card>
        {/* A list's all-caps group header: the label keeps its own style. */}
        <div className="v2lp__grp">
          <span>Fragen an die Kanzlei</span>
          <Progress done={1} total={3} size="sm" inline />
        </div>
        <div style={{ padding: "12px 16px", fontSize: "var(--fs-ui-sm)", color: "var(--color-text-muted)" }}>
          Ohne Breitenangabe am Aufrufer — der Balken nimmt, was die Zeile lässt.
        </div>
      </Card>
    </div>
  ),
};

// The three parts of the batch review's document overview (0227), as the app names them.
const batch = (booked: number, waiting: number, open: number): ProgressPart[] => [
  { label: "gebucht oder zugeordnet", value: booked, tone: "neutral" },
  { label: "wartet auf eine Rückfrage", value: waiting, tone: "info" },
  { label: "ohne Buchung / zu entscheiden", value: open, tone: "warning" },
];

/**
 * `parts` (0227): die Teile eines Ganzen in einem Balken, von links in der
 * gegebenen Reihenfolge. Ohne `label` steht der Satz mit allen Teilen da; ein
 * eigener Satz ersetzt ihn, dann liest die Vorlesehilfe den vollen Satz am
 * Balken. Grau ist erledigt, Farbe nur, was noch aussteht.
 */
export const Parts: Story = {
  render: () => (
    <Cases>
      <Row>
        <span className="v2main">Satz aus allen Teilen</span>
        <Progress parts={batch(25, 2, 1)} />
      </Row>
      <Row>
        <span className="v2main">eigener Satz</span>
        <Progress parts={batch(25, 2, 1)} label="28 Belege, 3 noch zu klären" />
      </Row>
      <Row>
        <span className="v2main">ohne Label, Zahl daneben</span>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span className="v2num">28</span>
          <span style={{ flex: 1 }}>
            <Progress parts={batch(25, 2, 1)} label={null} />
          </span>
        </span>
      </Row>
      <Row>
        <span className="v2main">inline</span>
        <Progress parts={batch(25, 2, 1)} label="28 Belege, 3 noch zu klären" inline />
      </Row>
      <Row>
        <span className="v2main">sm · md · lg</span>
        <span style={{ display: "grid", gap: "var(--space-2)" }}>
          <Progress parts={batch(25, 2, 1)} label={null} size="sm" />
          <Progress parts={batch(25, 2, 1)} label={null} />
          <Progress parts={batch(25, 2, 1)} label={null} size="lg" />
        </span>
      </Row>
    </Cases>
  ),
};

/**
 * Ränder. 1 von 28 bleibt auch auf der schmalsten Spur sichtbar (6 px); ein
 * Teil mit 0 fällt aus dem Balken, nicht aus dem Satz; ohne Belege bleibt die
 * leere Spur, und den Satz dazu schreibt der Aufrufer.
 */
export const PartsEdge: Story = {
  render: () => (
    <Cases>
      {[48, 120, 320].map((w) => (
        <Row key={w}>
          <span className="v2main">1 von 28 auf {w} px</span>
          <div style={{ width: w }}>
            <Progress parts={batch(27, 0, 1)} label={null} />
          </div>
        </Row>
      ))}
      <Row>
        <span className="v2main">ein Teil 0</span>
        <Progress parts={batch(26, 0, 2)} />
      </Row>
      <Row>
        <span className="v2main">alle Teile 0</span>
        <Progress parts={batch(0, 0, 0)} label="Noch keine Belege eingegangen" />
      </Row>
      <Row>
        <span className="v2main">keine Teile</span>
        <Progress parts={[]} label="Noch keine Belege eingegangen" />
      </Row>
      <Row>
        <span className="v2main">große Zahlen</span>
        <Progress parts={batch(12480, 0, 1)} />
      </Row>
      <Row>
        <span className="v2main">alle fünf Töne</span>
        <Progress
          parts={[
            { label: "erledigt", value: 9, tone: "success" },
            { label: "gebucht", value: 6, tone: "neutral" },
            { label: "wartet", value: 4, tone: "info" },
            { label: "zu entscheiden", value: 3, tone: "warning" },
            { label: "fehlgeschlagen", value: 2, tone: "danger" },
          ]}
        />
      </Row>
    </Cases>
  ),
};

/**
 * Im Einsatz: die Belege-Übersicht der Abnahme. Der Balken steht in einer
 * eigenen Zeile unter dem Kopf, über die volle Breite; der Satz nennt nur zwei
 * Zahlen; welcher Teil was ist, sagen die Badges der Liste
 * in denselben Tönen.
 */
export const PartsInUse: Story = {
  render: () => (
    <Card>
      <CardHead title="Eingegangene Belege" />
      {/* Its own line under the head, on the head's inset (18px): in the sub-line the bar shrinks to 120px. */}
      <div style={{ padding: "var(--space-3) 18px", borderBottom: "1px solid var(--color-border-subtle)" }}>
        <Progress parts={batch(25, 2, 1)} label="28 Belege, 3 noch zu klären" inline />
      </div>
      <Table cols="1fr 120px 220px">
        <HeadRow>
          <span>Beleg</span>
          <span>Datum</span>
          <span>Stand</span>
        </HeadRow>
        <Row>
          <span className="v2main">RE-2026-0815 Musterbau GmbH.pdf</span>
          <span>26.08.2026</span>
          <span>
            <Badge tone="neutral">gebucht oder zugeordnet</Badge>
          </span>
        </Row>
        <Row>
          <span className="v2main">Kontoauszug August 2026 Sparkasse.pdf</span>
          <span>31.08.2026</span>
          <span>
            <Badge tone="info">wartet auf eine Rückfrage</Badge>
          </span>
        </Row>
        <Row>
          <span className="v2main">Quittung Tankstelle.jpg</span>
          <span>14.08.2026</span>
          <span>
            <Badge tone="warning">zu entscheiden</Badge>
          </span>
        </Row>
      </Table>
    </Card>
  ),
};
