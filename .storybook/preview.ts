import type { Preview } from "@storybook/nextjs-vite";

// Dieselbe Kette wie das Root-Layout: Tokens → App-Chrome → Komponenten →
// domänenspezifische Styles → Tailwind. Ohne sie sähe hier nichts aus wie
// in der App, und die Werkbank wäre wertlos.
import "../src/styles/index.css";

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: {
      options: {
        app: { name: "App (bg-soft)", value: "#F4F6F8" },
        card: { name: "Karte (bg)", value: "#FFFFFF" },
      },
    },
  },
  initialGlobals: { backgrounds: { value: "app" } },
};

export default preview;
