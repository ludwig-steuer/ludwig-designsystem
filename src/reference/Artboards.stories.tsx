import type { Meta, StoryObj } from "@storybook/nextjs-vite";

/**
 * The design deliverables, embedded as delivered — not rebuilt.
 *
 * An artboard is the source a spec cites, not a component. Porting one to
 * React here would create a third truth next to the artboard and the app
 * screen, and it would rot silently. So the files stay verbatim under
 * `reference/`, served by Storybook's `staticDirs`, and this story is only a
 * window onto them.
 *
 * What gets derived from them lives in `reference/README.md` (the trail) and
 * in `docs/backlog/` (one spec per component).
 */

const BASE = "/reference/f109-buchungsreview";

function Artboard({ file, height }: { file: string; height: number }) {
  return (
    <iframe
      src={`${BASE}/${file}`}
      title={file}
      style={{ width: "100%", height, border: "1px solid var(--v3-border, #ddd)" }}
    />
  );
}

const meta = {
  title: "Referenz/F109 Buchungsreview",
  component: Artboard,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Artboard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The whole review flow, screens 0–10. Belongs in the app, not in the set. */
export const ReviewFlow: Story = { args: { file: "Buchungsreview.dc.html", height: 1400 } };

/** F109's take on the entry editor — compare against `JournalEntryEditor`. */
export const EntryEditor: Story = { args: { file: "BuchungssatzEditor.dc.html", height: 900 } };

/** The editor's 20+ states, the source for its story list. */
export const EntryEditorStates: Story = {
  args: { file: "Buchungseditor-Zustände.dc.html", height: 1200 },
};

/** Table vocabulary, 11 sections — mostly landed in `Table`/`Cells`. */
export const TableParts: Story = { args: { file: "Tabellen-Bausteine.dc.html", height: 1400 } };

/** The DATEV batch page. Not derived yet. */
export const BatchPage: Story = { args: { file: "StapelSeite.dc.html", height: 1200 } };

/** Judge verdict and confidence — landed as `AiBookingNotes`. */
export const AiNotes: Story = { args: { file: "KIBuchungshinweise.dc.html", height: 420 } };

/** Per-step checklist — landed as `Review.Checklist`. */
export const CheckList: Story = { args: { file: "PruefChecklist.dc.html", height: 420 } };
