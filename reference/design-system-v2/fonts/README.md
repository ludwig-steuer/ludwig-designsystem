# Fonts

This system uses three Google Fonts loaded via CDN in `colors_and_type.css`:

- **Inter** — UI + body. Humanist sans with excellent tabular numerals.
- **Source Serif 4** — editorial accent (hero copy, quotes, brand moments).
- **JetBrains Mono** — account/DATEV codes and tabular technical data.

## Substitution flag

These were chosen because no brand-mandated typeface was provided in the brief. If Ludwig has a licensed house typeface (common for serious B2B brands in Germany — e.g. FF Meta, TheSans, or a custom face), please:

1. Drop the `.woff2` files into this folder.
2. Replace the `@import` at the top of `colors_and_type.css` with `@font-face` declarations pointing to the local files.
3. Update `--font-sans` / `--font-serif` / `--font-mono` if needed.

## Why these choices

- **Inter** — neutral, highly legible at small sizes, German diacritics well-supported, `tnum` and `lnum` for accounting columns.
- **Source Serif 4** — Adobe's modern revival of a classic German-style serif, conveys solidity and competence without being "corporate boring." Pairs cleanly with Inter.
- **JetBrains Mono** — clear distinction between `0`/`O` and `1`/`l`/`I`, important for account numbers.
