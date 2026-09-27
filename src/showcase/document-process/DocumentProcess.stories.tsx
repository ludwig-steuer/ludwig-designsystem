import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { EntityIcon } from "@/ui/v3/Icons";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { ProcessBox, ProcessPictureTrigger } from "@/ui/v3/patterns/ProcessPicture";
import { StatusHeader } from "@/ui/v3/patterns/StatusHeader";
import { Button } from "@/ui/v3/primitives/Button";
import { Card, CardHead, HeadRow, Row, Table } from "@/ui/v3/primitives/Table";
import { byId, SCENARIOS, type Scenario } from "./fixtures";

/**
 * The process picture of a document in its three sizes (0204, brief F305):
 * every scenario of §7 in every size it lists. The cells open their dialog,
 * so „AllCells" and „AllDialogs" together show all three.
 */
const meta: Meta = {
  title: "Seiten/Beleg-Prozessbild",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

const withSize = (size: Scenario["sizes"][number]) => SCENARIOS.filter((s) => s.sizes.includes(size));

function List({ scenarios, density }: { scenarios: Scenario[]; density?: "regular" | "narrow" }) {
  return (
    <Card>
      <CardHead title="Belege" sub={`${scenarios.length} Szenarien`} />
      <Table cols="4rem minmax(14rem, 1fr) 22rem">
        <HeadRow>
          <span>Nr.</span>
          <span>Beleg</span>
          <StatusHeader axis="document_status" label="Fortschritt" />
        </HeadRow>
        {scenarios.map((s) => (
          <Row key={s.id}>
            <span className="v2sub">{s.id}</span>
            <span>
              {s.detail.title}
              <div className="v2sub">{s.name}</div>
            </span>
            <ProcessPictureTrigger picture={s.picture} detail={s.detail} size="cell" density={density} />
          </Row>
        ))}
      </Table>
    </Card>
  );
}

/**
 * Every scenario with Z as a cell, under the column head „Fortschritt" with its
 * (i). The bar is equally wide at one to five segments; the column does not
 * flutter. Each cell opens its dialog.
 */
export const AllCells: Story = { render: () => <List scenarios={withSize("cell")} /> };

/** The same list, dense: without the holder word. */
export const AllCellsNarrow: Story = { render: () => <List scenarios={withSize("cell")} density="narrow" /> };

/** Every scenario with B as a box, at the width it has in the head (≈ 30 % of 1280). */
export const AllBoxes: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(24rem, 1fr))", gap: "var(--space-4)" }}>
      {withSize("box").map((s) => (
        <div key={s.id}>
          <div className="v2sub">
            {s.id} · {s.name}
          </div>
          <ProcessPictureTrigger picture={s.picture} detail={s.detail} size="box" />
        </div>
      ))}
    </div>
  ),
};

/**
 * Every scenario with D: a cell each, which opens its dialog. Scenarios that
 * have no cell in the brief (S28) are listed here too — the list is the way
 * into the dialog, not a claim about the list page.
 */
export const AllDialogs: Story = { render: () => <List scenarios={withSize("dialog")} /> };

function Head({ placement, id }: { placement: "start" | "end"; id: string }) {
  const s = byId(id);
  return (
    <EntityHeader
      icon={<EntityIcon entity="source-document" />}
      overline="Rechnung · RE-2026-0815"
      title="Musterbau Schneider Bauunternehmung GmbH & Co. KG"
      meta={
        <>
          <span>Rechnungsdatum 28.08.2026</span>
          <span>Eingang 12.09.2026</span>
        </>
      }
      metric={{ label: "Gesamtbetrag", value: "18.450,20 €" }}
      actions={
        <Button variant="secondary" size="sm">
          Beleg herunterladen
        </Button>
      }
      process={<ProcessPictureTrigger picture={s.picture} detail={s.detail} size="box" />}
      processPlacement={placement}
    />
  );
}

/**
 * The box at the left, under what the document is (O4). No `StatusBadge` in the
 * title: the box answers the same question (D7).
 */
export const BoxStart: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <Head placement="start" id="S07" />
      <Head placement="start" id="S04" />
      <Head placement="start" id="S12" />
    </div>
  ),
};

/** The box at the right, beside amount and actions — the recommendation of the brief. */
export const BoxEnd: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <Head placement="end" id="S07" />
      <Head placement="end" id="S04" />
      <Head placement="end" id="S12" />
    </div>
  ),
};

/**
 * Keyboard: Tab to the cell, Enter opens the dialog, Esc closes it, the focus
 * returns to the cell. The box behaves the same.
 */
export const Keyboard: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", width: "24rem" }}>
      <Button variant="secondary" size="sm">
        Vorher
      </Button>
      <ProcessPictureTrigger picture={byId("S07").picture} detail={byId("S07").detail} size="cell" />
      <ProcessPictureTrigger picture={byId("S02").picture} detail={byId("S02").detail} size="box" />
      <ProcessBox picture={byId("S12").picture} />
    </div>
  ),
};
