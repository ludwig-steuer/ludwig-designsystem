import type { Preview } from "@storybook/nextjs-vite";

// The same chain as the root layout: tokens → app chrome → components → domain
// styles → Tailwind. Without it nothing here would look like the app.
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
