// The finished style chain for consumers without a Tailwind run (0271):
// src/styles/index.css → dist/ludwig.css, minified, via the local Tailwind CLI
// (no network). Checked in, so a Git submodule works without `pnpm install`.
//
//   node scripts/check-css.mjs --write   (pnpm build:css) writes dist/ludwig.css
//   node scripts/check-css.mjs           (pnpm check:css) builds into a temp file
//                                         and compares byte for byte; exit 1 when stale
//
// Fonts are not part of it: each consumer loads them its own way (fonts.css).
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = "dist/ludwig.css";
const write = process.argv.includes("--write");

function build(target) {
  execFileSync(
    "node_modules/.bin/tailwindcss",
    ["-i", "src/styles/index.css", "-o", target, "--minify"],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  const css = readFileSync(target, "utf8");
  // The promise of the file: no directive, no import, no font — nothing a
  // consumer would have to resolve or fetch.
  for (const banned of ["@tailwind", "@import", "@font-face"]) {
    if (css.includes(banned)) {
      console.error(`${target} contains ${banned} — the chain is not self-contained.`);
      process.exit(1);
    }
  }
  return css;
}

if (write) {
  const css = build(OUT);
  console.log(`build:css — wrote ${OUT} (${Math.round(Buffer.byteLength(css) / 1024)} KB).`);
  process.exit(0);
}

const dir = mkdtempSync(join(tmpdir(), "ludwig-css-"));
try {
  const fresh = build(join(dir, "ludwig.css"));
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : null;
  if (current !== fresh) {
    console.error("`dist/ludwig.css` ist veraltet. Bitte `pnpm build:css` ausführen.");
    process.exit(1);
  }
  console.log(`check:css — ok. ${OUT} matches src/styles.`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
