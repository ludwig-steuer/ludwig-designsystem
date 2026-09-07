import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "v3/Primitives/Navigation/Pagination",
  component: Pagination,
  args: { buildHref: (p: number) => `?page=${p}` },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const FirstPage: Story = { args: { page: 1, totalPages: 12, totalItems: 583, pageSize: 50 } };
/** Mittendrin — Ellipsen links und rechts. */
export const MiddlePage: Story = { args: { page: 6, totalPages: 12, totalItems: 583, pageSize: 50 } };
/**
 * Die letzte Seite eines **großen** Vorrats — und damit die Story, an der die
 * Tausendertrennung nachweisbar ist (L-97). Ein dreistelliger Vorrat zeigt sie
 * nicht: „von 583" sieht formatiert aus wie roh.
 */
export const LastPage: Story = { args: { page: 125, totalPages: 125, totalItems: 6212, pageSize: 50 } };
/** Eine Seite: die Navigation trägt trotzdem die Mengenangabe. */
export const SinglePage: Story = { args: { page: 1, totalPages: 1, totalItems: 18, pageSize: 50 } };

/**
 * Mit `pageSizeOptions` steht rechts der Zahlen „je Seite" (0057). Der Wechsel
 * führt auf `buildSizeHref` — die Seite setzt dort `page: 1` mit, sonst zeigte
 * Seite 6 bei 100 Zeilen ins Leere.
 */
export const WithPageSize: Story = {
  args: {
    page: 1,
    totalPages: 12,
    totalItems: 583,
    pageSize: 50,
    pageSizeOptions: [25, 50, 100],
    buildSizeHref: (size: number) => `?size=${size}&page=1`,
  },
};
