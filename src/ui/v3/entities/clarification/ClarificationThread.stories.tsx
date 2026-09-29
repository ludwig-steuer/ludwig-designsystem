import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ClarificationThread } from "./ClarificationThread";
import { ITEMS } from "./thread-fixtures";

const meta: Meta<typeof ClarificationThread> = {
  title: "v3/Entitäten/Klärung/ClarificationThread",
  component: ClarificationThread,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ClarificationThread>;

/** The thread under the card: oldest first, each entry folds open, the question on screen stands last and marked. */
export const Thread: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ClarificationThread items={ITEMS} currentId="q4" defaultOpen />
    </div>
  ),
};

/** One question only — the thread still says so (1). */
export const Single: Story = {
  render: () => (
    <div style={{ maxWidth: 760 }}>
      <ClarificationThread items={[ITEMS[4]!]} currentId="q4" />
    </div>
  ),
};
