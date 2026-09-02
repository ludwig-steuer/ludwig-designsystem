import type { StorybookConfig } from "@storybook/nextjs-vite";
import { serverActionsStub } from "./server-actions-stub";

/**
 * Storybook — die Werkbank für die **reinen** Darstellungskomponenten
 * (F111 Vorgabe 1: Props rein, JSX raus). Komponenten, die selbst laden
 * (Server Components, Server-Action-Aufrufer, die ladenden Drawer aus
 * `ui/drawers`), gehören hier NICHT hinein — sie stehen in `/dev/gallery`.
 *
 * Stories liegen neben der Komponente als `<Name>.stories.tsx`.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  viteFinal: (config) => {
    config.plugins = [...(config.plugins ?? []), serverActionsStub()];
    return config;
  },
  core: {
    // Kanzlei-Kontext: keine anonyme Nutzungstelemetrie nach außen.
    disableTelemetry: true,
  },
  typescript: {
    // Die Repo-Typprüfung läuft über `pnpm typecheck`; Storybook muss sie
    // nicht doppeln (kostet nur Startzeit).
    check: false,
  },
};

export default config;
