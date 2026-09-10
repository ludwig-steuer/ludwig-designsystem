import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FieldList } from "../primitives/FieldList";
import { Card, CardHead } from "../primitives/Table";
import { Columns } from "./Columns";

/**
 * Die vier Spaltenmuster (0154) — Owner-Entscheid 2026-09-10.
 *
 * Der Rumpf eines Reiters ist **immer** eines von vieren. Breiten dürfen nach
 * Gewicht des Inhalts variieren, das Muster nicht — so bauen Beleg, Konto,
 * Partner und Sachverhalt aus denselben vier, statt dass jede Seite ihr
 * eigenes Raster erfindet.
 */
const meta: Meta<typeof Columns> = {
  title: "v3/Patterns/Rahmen/Columns",
  component: Columns,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Columns>;

function Block({ title: title, rows: rows = 3 }: { title: string; rows?: number }) {
  return (
    <Card>
      <CardHead title={title} />
      <div style={{ padding: "12px 20px 16px" }}>
        <FieldList
          tone="bare"
          rows={Array.from({ length: rows }, (_, i) => [`Zeile ${i + 1}`, "Wert"])}
        />
      </div>
    </Card>
  );
}

/**
 * **`list | detail`** — links auswählen, rechts arbeiten. Die Liste ist
 * schmal, die Arbeitsfläche breit; das ist der Fall, in dem im Detail
 * gearbeitet und in der Liste nur gewählt wird.
 */
export const ListDetail: Story = {
  render: () => (
    <Columns
      pattern="list-detail"
      list={<Block title="Liste" rows={6} />}
      main={<Block title="Detail" rows={4} />}
    />
  ),
};

/**
 * **`list | detail | sidebar`** — dasselbe, dazu das Mitgelesene. Das Muster
 * der Sachverhalts-Übersicht: links der Strang, in der Mitte die Arbeit,
 * rechts die Notizen.
 *
 * **Was zuerst weicht, ist die dritte Spalte, nie die erste.** Die Notizen
 * fallen unter die Arbeitsfläche, sie verschwinden nicht — den Strang
 * wegzunehmen hieße, die Arbeit wegzunehmen. Schmaler ziehen zum Ausprobieren.
 */
export const ListDetailAside: Story = {
  render: () => (
    <Columns
      pattern="list-detail-aside"
      list={<Block title="Strang" rows={8} />}
      main={<Block title="Arbeitsfläche" rows={5} />}
      aside={<Block title="Notizen" rows={3} />}
    />
  ),
};

/**
 * **`50 | 50`** — zwei gleiche Hälften, für den Vergleich. Hier gibt es keine
 * Arbeitsfläche und keine Beigabe: beide Seiten **sind** die Aussage.
 *
 * Der Referenzfall ist die Belegseite — das Original links, die Extraktion
 * rechts.
 */
export const Split: Story = {
  render: () => (
    <Columns
      pattern="split"
      main={<Block title="Original" rows={5} />}
      aside={<Block title="Was Ludwig gelesen hat" rows={5} />}
    />
  ),
};

/**
 * **`master | sidebar`** — eine Arbeitsfläche mit schmalem Begleiter. Die
 * Kontoseite: die Bewegungen breit, die Fakten daneben.
 *
 * Hier greift die Stufe `table` (960 px): eine Tabelle mit sieben Spalten
 * braucht mehr Boden als ein Block Feldzeilen. Gemessen in 0063 — bei 620 war
 * der Buchungstext 98 px breit und das Gegenkonto verlor in jeder Zeile
 * seinen Namen.
 */
export const MainAside: Story = {
  render: () => (
    <Columns
      pattern="main-aside"
      width="table"
      main={<Block title="Bewegungen" rows={8} />}
      aside={<Block title="Fakten" rows={4} />}
    />
  ),
};

/**
 * Die zwei benannten Stufen nebeneinander. **Die Seite wählt eine Stufe, sie
 * erfindet keine Zahl** (Owner, 2026-09-10) — und die Stufe heißt nach dem,
 * was in der Spalte steht, nicht nach ihrer Pixelzahl.
 *
 * `facts` 460 px für einen Block Feldzeilen, `table` 960 px für eine Tabelle
 * mit vielen Spalten. Beide Zahlen sind in Abnahmen gegen eine gemessene Seite
 * erkämpft worden; eine dritte Stufe entsteht, wenn sie jemand misst — nicht,
 * wenn sie jemand braucht.
 */
export const Steps: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 32 }}>
      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>
          facts — 460 px
        </div>
        <Columns
          pattern="main-aside"
          width="facts"
          main={<Block title="Arbeitsfläche" rows={3} />}
          aside={<Block title="Daneben" rows={2} />}
        />
      </div>
      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>
          table — 960 px
        </div>
        <Columns
          pattern="main-aside"
          width="table"
          main={<Block title="Arbeitsfläche" rows={3} />}
          aside={<Block title="Daneben" rows={2} />}
        />
      </div>
    </div>
  ),
};
