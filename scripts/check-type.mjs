#!/usr/bin/env node
/**
 * Guard: type comes from the scale (owner 2026-09-27: a review step for
 * fonts and font sizes).
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
 * And the roles of 0220 (A14, owner 2026-10-01), in TSX:
 *  - T-H1 `<h1>`–`<h6>` without `className`: Tailwind's preflight makes a bare
 *    heading inherit its surroundings — title and lead look the same.
 *  - T-H2 `<h5>`, `<h6>`: a page has four levels, `h1`–`h4`.
 *  - T-SUB `<p>` with `sub`/`v2sub`: the sub-line is one line, never a paragraph
 *    (running text `lw-ui-text`, lead `lw-ui-lead`, hint `lw-ui-hint`).
 *  - T-REG the reading register (`lw-h1`…`lw-h4`, `lw-body`, `lw-body-sm`,
 *    `lw-caption`, `lw-overline`, `lw-lede`, `lw-display`) in productive code
 *    (`src/ui/v3`, `src/showcase`, stories excepted) — there it is `lw-ui-*`.
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

// A token, a relative size (`0.92em` keeps code in step with its sentence), or
// a component's own size variable that is itself set from the scale
// (`--v2-row-fs` for the table density).
const SIZE_OK = /^(var\(--fs-[a-z0-9-]+\)|var\(--[a-z0-9-]*-fs\b[^)]*\)\)?|inherit|[0-9.]+em|100%)$/;
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

// 0220: the role rules. They read the whole text, since a JSX tag may span lines.
const READING = /\blw-(h[1-4]|body-sm|body|caption|overline|lede|display)\b/g;

function productive(path) {
  return /^src\/(ui\/v3|showcase)\//.test(path) && !path.endsWith(".stories.tsx");
}

/**
 * Markup inside a template string is data — the HTML of a foreign document in
 * a story — not our JSX. Blank the literal parts, keep the lines; `${…}` stays
 * code and may open a template of its own (`${encodeURIComponent(`<h1>…`)}`).
 */
function blankTemplates(src) {
  const out = src.split("");
  const stack = []; // "t" = template literal, number = brace depth inside `${`
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    const top = stack[stack.length - 1];
    if (top === "t") {
      if (c === "\\") {
        if (src[i + 1] !== "\n") out[i + 1] = " ";
        out[i] = " ";
        i++;
      } else if (c === "`") stack.pop();
      else if (c === "$" && src[i + 1] === "{") {
        stack.push(0);
        i++;
      } else if (c !== "\n") out[i] = " ";
    } else if (c === "`") stack.push("t");
    else if (typeof top === "number") {
      if (c === "{") stack[stack.length - 1]++;
      else if (c === "}") top === 0 ? stack.pop() : stack[stack.length - 1]--;
    }
  }
  return out.join("");
}

function roleFindings(path, source) {
  const found = [];
  const text = blankTemplates(source);
  const lineOf = (index) => text.slice(0, index).split("\n").length;
  for (const m of text.matchAll(/<h([1-6])\b([^>]*)>/g)) {
    if (m[1] === "5" || m[1] === "6") found.push({ line: lineOf(m.index), text: `T-H2 <h${m[1]}>` });
    else if (!/\bclassName\s*=/.test(m[2])) found.push({ line: lineOf(m.index), text: `T-H1 <h${m[1]}> without className` });
  }
  for (const m of text.matchAll(/<p\b[^>]*\bclassName\s*=\s*[^>]*?\b(v2sub|sub)\b[^>]*>/g)) {
    found.push({ line: lineOf(m.index), text: `T-SUB <p> with ${m[1]}` });
  }
  if (productive(path)) {
    for (const m of text.matchAll(READING)) found.push({ line: lineOf(m.index), text: `T-REG ${m[0]}` });
  }
  return found;
}

/** Every hand-written type value and role finding in one file, with its line. */
export function findings(path, text) {
  const found = path.endsWith(".tsx") ? roleFindings(path, text) : [];
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
  const roles = (path, src) => findings(path, src).map((f) => f.text);
  expect(roles("src/a.tsx", "<h2>Titel</h2>")[0] === "T-H1 <h2> without className", "bare h2");
  expect(roles("src/a.tsx", '<h2\n  className="lw-ui-section"\n>Titel</h2>').length === 0, "h2 with class over lines");
  expect(roles("src/a.tsx", '<h5 className="x">T</h5>')[0] === "T-H2 <h5>", "h5");
  expect(roles("src/a.tsx", '<p className="sub">Satz.</p>')[0] === "T-SUB <p> with sub", "p.sub");
  expect(roles("src/a.tsx", '<p className="v2sub v2acc">Satz.</p>')[0] === "T-SUB <p> with v2sub", "p.v2sub");
  expect(roles("src/a.tsx", '<div className="sub">x</div><span className="v2sub">y</span>').length === 0, "sub-line outside p passes");
  expect(roles("src/ui/v3/x/A.tsx", '<div className="lw-overline">x</div>')[0] === "T-REG lw-overline", "reading class in v3");
  expect(roles("src/ui/v3/x/A.tsx", '<div className="lw-ui-overline lw-numeric">x</div>').length === 0, "productive class passes");
  expect(roles("src/ui/v3/x/A.stories.tsx", '<p className="lw-body-sm">x</p>').length === 0, "stories may show the reading register");
  expect(roles("src/a.tsx", "const html = `<h1>ACME GmbH</h1>`;\n<h2>x</h2>")[0] === "T-H1 <h2> without className", "template string is data, line kept");
  expect(findings("src/a.tsx", "const html = `\n<h1>ACME</h1>\n`;\n<h3>x</h3>")[0].line === 4, "line numbers survive blanking");
  expect(roles("src/a.tsx", "const u = `data:${enc(`\n<h1>ACME</h1>\n`)}`;").length === 0, "nested template is data too");
  expect(roles("src/a.tsx", "<h2 className={`a ${b}`}>x</h2>").length === 0, "class from a template still counts");
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
    console.log(`  ✗ ${f}: ${n} findings, baseline ${allowed}`);
    for (const d of detail[f]) console.log(`      ${d.line}: ${d.text}`);
  } else if (args.includes("--list")) {
    console.log(`  · ${f}: ${n} (baseline ${allowed})`);
  }
}
const total = Object.values(counts).reduce((a, b) => a + b, 0);
if (bad) {
  console.log(
    `\ncheck:type — ${bad} files with new findings. Take size, weight and family from the scale ` +
      "(`--fs-*`, 400/500/600/700, `--font-*`, src/styles/tokens.css); headings, sub-lines and text from " +
      "the roles of docs/design-guidelines.md §2a (0220).",
  );
  process.exit(1);
}
console.log(`check:type — ok. ${total} older findings left in ${Object.keys(counts).length} files (baseline).`);
