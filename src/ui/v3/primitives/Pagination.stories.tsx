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
export const LastPage: Story = { args: { page: 12, totalPages: 12, totalItems: 583, pageSize: 50 } };
/** Eine Seite: die Navigation trägt trotzdem die Mengenangabe. */
export const SinglePage: Story = { args: { page: 1, totalPages: 1, totalItems: 18, pageSize: 50 } };
