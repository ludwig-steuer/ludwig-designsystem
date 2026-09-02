import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Pagination } from "./Pagination";

const meta: Meta<typeof Pagination> = {
  title: "v3/Legacy/Pagination",
  component: Pagination,
  args: { buildHref: (p: number) => `?page=${p}` },
};
export default meta;
type Story = StoryObj<typeof Pagination>;

export const ErsteSeite: Story = { args: { page: 1, totalPages: 12, totalItems: 583, pageSize: 50 } };
/** Mittendrin — Ellipsen links und rechts. */
export const Mittendrin: Story = { args: { page: 6, totalPages: 12, totalItems: 583, pageSize: 50 } };
export const LetzteSeite: Story = { args: { page: 12, totalPages: 12, totalItems: 583, pageSize: 50 } };
/** Eine Seite: die Navigation trägt trotzdem die Mengenangabe. */
export const EineSeite: Story = { args: { page: 1, totalPages: 1, totalItems: 18, pageSize: 50 } };
