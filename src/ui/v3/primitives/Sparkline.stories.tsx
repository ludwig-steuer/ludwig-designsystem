import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Sparkline } from "./Sparkline";
import { Card, CardHead } from "./Table";
import { FieldList } from "./FieldList";
import { formatAmount } from "../format";

const meta: Meta<typeof Sparkline> = {
  title: "v3/Primitives/Fläche/Sparkline",
  component: Sparkline,
};
export default meta;
type Story = StoryObj<typeof Sparkline>;

const MONATE = ["März", "April", "Mai", "Juni", "Juli", "August"];
const EUR = (v: number) => formatAmount(v, "EUR");

const Rahmen = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 260, padding: "var(--space-6)" }}>{children}</div>
);

/**
 * Sechs Monatswerte. Gezeichnet werden **erstes und letztes** Label — dazwischen
 * ist kein Platz —, und die letzte Spur ist hervorgehoben: als **Ort**, nicht
 * als Urteil. Rot wäre Kritikalität (V3), und ein niedriger Monat ist kein
 * Fehler.
 *
 * Der ganze Verlauf steht im `aria-label`: „6 Werte, März bis August,
 * 1.200,00 €, …". Wer die Kurve nicht sieht, bekommt die Zahlen.
 */
export const Filled: Story = {
  render: () => (
    <Rahmen>
      <Sparkline
        values={[1200, 940, 1310, 1180, 860, 1420]}
        labels={MONATE}
        format={EUR}
      />
    </Rahmen>
  ),
};

/**
 * `null` ist eine **Lücke**, keine Null: der Balken fehlt, die Spur bleibt
 * stehen. Ein Nullbalken behauptete eine Messung von null, wo keine war — und
 * die Text-Alternative sagt an dieser Stelle „keine Angabe".
 */
export const Gaps: Story = {
  render: () => (
    <Rahmen>
      <Sparkline
        values={[1200, null, 1310, null, 860, 1420]}
        labels={MONATE}
        format={EUR}
      />
    </Rahmen>
  ),
};

/**
 * Drei Werte sind kein Verlauf, sondern eine Zahl — die Komponente rendert
 * **nichts** und überlässt dem Aufrufer den Platz. Dasselbe über zwölf: dann
 * ist es ein Diagramm und gehört zu `BarChart`.
 */
export const TooFew: Story = {
  render: () => (
    <Rahmen>
      <p className="v2sub">Darunter steht nichts im DOM:</p>
      <Sparkline values={[1200, 940, 1310]} labels={MONATE} format={EUR} />
    </Rahmen>
  ),
};

/**
 * Im Einsatz: in der Kachel des Stapelschritts, neben den Vergleichszahlen.
 * Hier trägt der Aufrufer einen eigenen `summary` — er weiß, worauf es
 * ankommt, und „vier Monate in Folge unter dem Schnitt" sagt mehr als sechs
 * Beträge hintereinander.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 340, padding: "var(--space-6)" }}>
      <Card>
        <CardHead title="6815 · Wartung und Instandhaltung" sub="Aufwand" />
        <div style={{ padding: "var(--space-5)" }}>
          <Sparkline
            values={[1200, 940, 1310, 1180, 860, 1420]}
            labels={MONATE}
            format={EUR}
            summary="Sechs Monate, März bis August: schwankend zwischen 860 und 1.420 €, zuletzt der höchste Wert."
          />
          <div style={{ marginTop: "var(--space-4)" }}>
            <FieldList
              title="Der Vergleich"
              rows={[
                ["Juni", EUR(1180)],
                ["Juli", EUR(860)],
                ["August", EUR(1420)],
              ]}
            />
          </div>
        </div>
      </Card>
    </div>
  ),
};
