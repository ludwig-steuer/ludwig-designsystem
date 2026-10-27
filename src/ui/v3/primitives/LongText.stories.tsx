import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LongText } from "./LongText";

const meta: Meta<typeof LongText> = { title: "v3/Primitives/Werte/LongText", component: LongText };
export default meta;
type Story = StoryObj<typeof LongText>;

const SHORT = "Wartung der Heizungsanlage, Rechnung 2026-0412.";
const LONG =
  "Wartung der Heizungsanlage im Objekt Hauptstraße 14, einschließlich Austausch der Umwälzpumpe, " +
  "Spülung des Heizkreises und Prüfung der Ausdehnungsgefäße. Die Arbeiten wurden am 14.03.2026 " +
  "abgenommen; die Rechnung weist zusätzlich eine Anfahrtspauschale und Kleinmaterial aus, das " +
  "nach Rücksprache mit dem Mandanten auf dasselbe Aufwandskonto gebucht wird.";

/** Unter `max` Zeichen wird der Text unverändert gerendert. */
export const Short: Story = { args: { children: SHORT } };
/** Darüber als Teaser mit „mehr ▾" — hält die Tabellenzeile in Form. */
export const Clamped: Story = { args: { children: LONG } };
export const CustomLimit: Story = { args: { children: LONG, max: 60 } };
/**
 * Knapp über `max`: Hinter „mehr" stünden weniger als zwei Zeilen, also steht
 * der Text ganz da (0234). `lineChars` sagt, wie viele Zeichen eine Zeile am
 * Ort ungefähr fasst.
 */
export const JustOverLimit: Story = { args: { children: LONG, max: LONG.length - 60 } };
/**
 * Derselbe Text in einer schmalen Spalte (`lineChars` 30, Rahmen 240 px): Dort
 * sind 60 Zeichen schon zwei Zeilen, also faltet er (0234).
 */
export const NarrowLine: Story = {
  args: { children: LONG, max: LONG.length - 60, lineChars: 30 },
  render: (args) => (
    <div style={{ width: 240 }}>
      <LongText {...args} />
    </div>
  ),
};
