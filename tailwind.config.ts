import type { Config } from "tailwindcss";

/**
 * Tailwind aliases for the Ludwig design tokens. The tokens themselves
 * live in `src/styles/tokens.css` as CSS variables — Tailwind reads
 * them via `var(...)` so a single source of truth survives.
 *
 * Most components in `apps/web/src/ui` use the designer's CSS classes
 * (`.btn`, `.bdg`, `.app__sidebar`, …) directly. The Tailwind aliases
 * here are for ad-hoc utility usage (page wrappers, spacing fixes,
 * one-off layouts) without introducing hardcoded hex values.
 */
const config: Config = {
  content: ["./src/ui/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          900: "var(--color-primary-900)",
          800: "var(--color-primary-800)",
          700: "var(--color-primary-700)",
          600: "var(--color-primary-600)",
          500: "var(--color-primary-500)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          700: "var(--color-accent-700)",
          600: "var(--color-accent-600)",
          500: "var(--color-accent-500)",
          100: "var(--color-accent-100)",
          50: "var(--color-accent-50)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          subtle: "var(--color-text-subtle)",
          ondark: "var(--color-text-on-dark)",
          "ondark-muted": "var(--color-text-on-dark-muted)",
        },
        bg: {
          DEFAULT: "var(--color-bg)",
          soft: "var(--color-bg-soft)",
          sunken: "var(--color-bg-sunken)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
          subtle: "var(--color-border-subtle)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          bg: "var(--color-success-bg)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          bg: "var(--color-warning-bg)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          bg: "var(--color-danger-bg)",
        },
      },
      fontFamily: {
        sans: "var(--font-sans)",
        serif: "var(--font-serif)",
        mono: "var(--font-mono)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
      maxWidth: {
        narrow: "var(--container-narrow)",
        base: "var(--container-base)",
        wide: "var(--container-wide)",
        measure: "var(--content-measure)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        out: "var(--ease-out)",
        in: "var(--ease-in)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
    },
  },
  plugins: [],
};

export default config;
