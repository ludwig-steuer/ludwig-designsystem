import type { StorybookConfig } from "@storybook/nextjs-vite";
import { serverActionsStub } from "./server-actions-stub";

/**
 * Storybook — the workbench for the **pure** presentation components (F111 rule
 * 1: props in, JSX out). Components that load data themselves (server
 * components, server-action callers, the loading drawers) do NOT belong here —
 * they live in `/dev/gallery`. Stories sit next to their component.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  // `reference/` sits next to `src/` but is needed as a template: the artboards
  // run unchanged as delivered (own `support.js`, own `_ds` bundle) and are only
  // embedded, never rebuilt.
  staticDirs: ["../public", { from: "../reference", to: "/reference" }],
  viteFinal: (config) => {
    config.plugins = [...(config.plugins ?? []), serverActionsStub()];
    return config;
  },
  core: {
    // Practice context: no anonymous usage telemetry leaving the machine.
    disableTelemetry: true,
  },
  typescript: {
    // The repo's type check runs via `pnpm typecheck`; Storybook need not repeat
    // it (costs only start-up time).
    check: false,
  },
};

export default config;
