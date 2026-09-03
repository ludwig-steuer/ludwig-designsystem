import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * The v2 bundle, as it was delivered — rescued from `ludwig/app/design/` on
 * 2026-09-03, the day it was deleted there.
 *
 * These sheets are **reference, not rule**. Where one disagrees with
 * `docs/design-guidelines.md` or `src/styles/tokens.css`, the docs win: the
 * bundle predates the token pass and the v3 type scale. What it still answers
 * better than anything else is "what was this meant to look like?" — thirty
 * sheets of colour, type, spacing, and every component v2 ever drew.
 *
 * Pick a sheet from the `sheet` control. The trail is in `reference/README.md`.
 *
 * The preview sheets are plain HTML and run offline. The three kits pull
 * React and Babel from unpkg and stay blank without a network — not a bug.
 */

const BASE = "/reference/design-system-v2";

function Sheet({ sheet, height }: { sheet: string; height: number }) {
  return (
    <iframe
      src={`${BASE}/${sheet}`}
      title={sheet}
      style={{ width: "100%", height, border: "1px solid var(--v3-border, #ddd)" }}
    />
  );
}

/** Every sheet in `preview/`, grouped the way the bundle laid them out. */
const SHEETS = [
  // Foundations
  "preview/colors-primary.html",
  "preview/colors-neutrals.html",
  "preview/colors-semantic.html",
  "preview/type-display.html",
  "preview/type-body.html",
  "preview/type-numeric.html",
  "preview/spacing-scale.html",
  "preview/radius-shadow.html",
  "preview/iconography.html",
  "preview/logo.html",
  "preview/voice.html",
  // Components
  "preview/buttons.html",
  "preview/inputs.html",
  "preview/form-primitives.html",
  "preview/badges.html",
  "preview/cards.html",
  "preview/tables.html",
  "preview/datatable-states.html",
  "preview/empty-state.html",
  "preview/toast-banner.html",
  "preview/drawer.html",
  "preview/wizard.html",
  "preview/upload-zone.html",
  "preview/charts.html",
  // Ludwig-specific
  "preview/confidence-indicator.html",
  "preview/clarification.html",
  "preview/clarification-dialog.html",
  "preview/review-item.html",
  "preview/audit-trail.html",
];

const meta = {
  title: "Referenz/Design-System v2",
  component: Sheet,
  parameters: { layout: "fullscreen" },
  argTypes: { sheet: { control: "select", options: SHEETS } },
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The thirty preview sheets. Switch with the `sheet` control. */
export const Sheets: Story = { args: { sheet: SHEETS[0], height: 1200 } };

/** The app kit: sidebar, top bar, dashboard, document detail, review. */
export const AppKit: Story = { args: { sheet: "ui_kits/app/index.html", height: 1400 } };

/** The document detail screen, drawn standalone. */
export const DocumentDetail: Story = {
  args: { sheet: "ui_kits/app/BelegDetail.html", height: 1400 },
};

/** Login and sign-up — the track the brief asked for first. */
export const AuthKit: Story = { args: { sheet: "ui_kits/auth/index.html", height: 1000 } };

/** The marketing sections. Outside the app, kept for the voice. */
export const MarketingKit: Story = {
  args: { sheet: "ui_kits/marketing/index.html", height: 1400 },
};
