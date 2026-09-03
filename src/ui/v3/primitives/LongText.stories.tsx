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
