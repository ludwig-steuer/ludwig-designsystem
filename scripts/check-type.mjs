#!/usr/bin/env node
/**
 * Guard: type comes from the scale (owner 2026-09-27, „ein Review-Step für
 * Schriften und Schriftgrößen").
 *
 * A font size, weight or family written by hand drifts: 12 px next to the
 * scale's 12.5, 13 next to 13.5, and the page looks restless without anyone
 * being able to say why. The scale lives in `src/styles/tokens.css`
 * (`--fs-*`, `--font-*`); everything else takes it from there.
 *
 * Checked, outside the mirror and outside `tokens.css` (which defines it):
 *  - CSS `font-size:` and TSX `fontSize:` — only `var(--fs-…)`, `inherit`, `1em`, `100%`.
 *  - CSS `font-weight:` and TSX `fontWeight:` — only 400, 500, 600, 700, `inherit`, `normal`.
 *  - CSS `font-family:` and TSX `fontFamily:` — only `var(--font-…)`, `inherit`.
 *
 * A ratchet like `check:language`: `scripts/type-baseline.json` counts the
 * findings per file that existed on 2026-09-27, and a file may only go down.
 * New files start at zero.
 *
 * Run: `pnpm check:type` · list every finding: `--list` · shrink the baseline: `--update`
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src"];
const SKIP = ["src/ludwig/", "src/styles/tokens.css"];
const BASELINE = "scripts/type-baseline.json";

const SIZE_OK = /^(var\(--fs-[a-z0-9-]+\)|inherit|1em|100%)$/;
const WEIGHT_OK = /^(400|500|600|700|inherit|normal)$/;
const FAMILY_OK = /^(var\(--font-[a-z0-9-]+\)|inherit)$/;

const CSS_RULES = [
  { prop: "font-size", ok: SIZE_OK },
  { prop: "font-weight", ok: WEIGHT_OK },
  { prop: "font-family", ok: FAMILY_OK },
];
const TSX_RULES = [
  { prop: "fontSize", ok: SIZE_OK },
  { prop: "fontWeight", ok: WEIGHT_OK },
  { prop: "fontFamily", ok: FAMILY_OK },
];

function files(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (SKIP.some((s) => p.startsWith(s) || p === s)) continue;
    if (e.isDirectory()) out.push(...files(p));
    else if (/\.(css|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

/** Every hand-written type value in one file, with its line. */
export function findings(path, text) {
  const found = [];
  const lines = text.split("\n");
  lines.forEach((line, i) => {
    if (path.endsWith(".css")) {
      for (const { prop, ok } of CSS_RULES) {
        for (const m of line.matchAll(new RegExp(`(?:^|[;{\\s])${prop}\\s*:\\s*([^;}]+)`, "g"))) {
          const value = m[1].trim().replace(/\s*!important$/, "");
          if (!ok.test(value)) found.push({ line: i + 1, text: `${prop}: ${value}` });
        }
      }
    } else {
      for (const { prop, ok } of TSX_RULES) {
        for (const m of line.matchAll(new RegExp(`\\b${prop}\\s*:\\s*("([^"]*)"|'([^']*)'|([0-9.]+))`, "g"))) {
          const value = (m[2] ?? m[3] ?? m[4] ?? "").trim();
          if (!ok.test(value)) found.push({ line: i + 1, text: `${prop}: ${value}` });
        }
      }
    }
  });
  return found;
}

function selfTest() {
  const css = ".a { font-size: 12px; } .b { font-size: var(--fs-ui-sm); font-weight: 650; font-family: monospace; }";
  const tsx = 'style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)" }}';
  const c = findings("x.css", css).map((f) => f.text);
  const t = findings("x.tsx", tsx).map((f) => f.text);
  const expect = (cond, msg) => {
    if (!cond) {
      console.error(`self-test failed: ${msg}`);
      process.exit(1);
    }
  };
  expect(c.includes("font-size: 12px"), "12px in CSS");
  expect(!c.some((x) => x.includes("--fs-ui-sm")), "token passes");
  expect(c.includes("font-weight: 650"), "odd weight");
  expect(c.includes("font-family: monospace"), "family");
  expect(t.length === 1 && t[0] === "fontSize: 13", "TSX number size, weight 600 and token family pass");
  console.log("check:type — self-test ok.");
}

const args = process.argv.slice(2);
if (args.includes("--test")) {
  selfTest();
  process.exit(0);
}

const all = ROOTS.flatMap(files).sort();
const counts = {};
const detail = {};
for (const f of all) {
  const found = findings(f, readFileSync(f, "utf8"));
  if (found.length) {
    counts[f] = found.length;
    detail[f] = found;
  }
}

if (args.includes("--update") || !existsSync(BASELINE)) {
  const old = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : null;
  // The ratchet only turns down: a file may not grow its allowance by --update.
  const next = {};
  for (const [f, n] of Object.entries(counts)) next[f] = old && f in old ? Math.min(old[f], n) : old ? 0 : n;
  writeFileSync(BASELINE, JSON.stringify(next, null, 2) + "\n");
  console.log(`check:type — baseline written (${Object.keys(next).length} files).`);
  if (old) process.exit(0);
}

const baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
let bad = 0;
for (const [f, n] of Object.entries(counts)) {
  const allowed = baseline[f] ?? 0;
  if (n > allowed) {
    bad++;
    console.log(`  ✗ ${f}: ${n} hand-written type values, baseline ${allowed}`);
    for (const d of detail[f]) console.log(`      ${d.line}: ${d.text}`);
  } else if (args.includes("--list")) {
    console.log(`  · ${f}: ${n} (baseline ${allowed})`);
  }
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);
if (bad) {
  console.log(
    `\ncheck:type — ${bad} files with new hand-written type values. Take size, weight and family from the scale ` +
      "(`--fs-*`, 400/500/600/700, `--font-*`, src/styles/tokens.css).",
  );
  process.exit(1);
}
console.log(`check:type — ok. ${total} older hand-written values left in ${Object.keys(counts).length} files (baseline).`);
