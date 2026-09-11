#!/usr/bin/env node
/**
 * Guard: every class the set writes into `className` is defined in
 * `src/styles/*.css`.
 *
 * Why: the set used `sr-only` in two places, a class it never had. In the app
 * Tailwind defines it, so nothing showed there — in the set's Storybook the
 * screen-reader text stood visible in 16 px (0162, 2ca2152). A class name
 * without a rule fails silently everywhere else.
 *
 * Read: `className="…"`, the string and template literals inside
 * `className={…}`, and those of variables named `cls`/`…Class`/`classes`.
 * A token next to an interpolation (`v2time--${size}`) counts as a prefix:
 * some defined class must begin with it.
 *
 * ponytail: literals only — a class built in a helper function
 * (`classes(variant, size)`) or passed in from a caller is not seen; widen the
 * variable pattern when such a miss turns up.
 *
 * Run: `pnpm check:classes` · self-test: `--test`
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["src/ui/v3", "src/showcase"];
const STYLES = "src/styles";

/**
 * Names without a rule on purpose — a hook for a selector elsewhere, never a
 * look. Each needs its reason; a new entry is a decision, not a way out.
 */
const HOOKS = new Map([
  ["v2tbl__lead", "the linked first cell of a row; acceptances count it (0106)"],
  ["v2tbl__chev", "the chevron track; acceptances count it (0115)"],
  ["v2logb", "scope of the log browser; the focus order is read inside it (0054)"],
  ["v2raw", "root of the .v2raw* family; the prefix is reserved in v3.css"],
]);

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });

/** Every class a selector in the stylesheets names. */
export function definedClasses(css) {
  const bare = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/url\([^)]*\)/g, "");
  return new Set([...bare.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)].map((m) => m[1]));
}

/** The expression inside `{…}` starting at `open`, braces balanced. */
function expression(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(open + 1, i);
  }
  return "";
}

const LITERAL = /"([^"\n]*)"|'([^'\n]*)'|`([^`]*)`/g;
/** A class token: what could stand in a class attribute and name a rule. */
const TOKEN = /^-?[A-Za-z_][\w-]*$/;

/**
 * The class tokens of one source text: `{ name, prefix }` — `prefix` when an
 * interpolation touches the token's end.
 */
export function classTokens(src) {
  const chunks = [];
  for (const m of src.matchAll(/className="([^"]*)"/g)) chunks.push(m[1]);
  const exprs = [];
  for (const m of src.matchAll(/className=\{/g)) exprs.push(expression(src, m.index + "className=".length));
  for (const m of src.matchAll(/\b(?:const|let)\s+(?:cls|classes|[a-z]\w*Class(?:Name)?)\s*=\s*([^;]+);/g)) exprs.push(m[1]);
  for (const e of exprs) {
    // A literal compared against is a value, not a class: `align === "end" ? "v2num" : undefined`.
    const values = e.replace(new RegExp(`[!=]==?\\s*(?:${LITERAL.source})|(?:${LITERAL.source})\\s*[!=]==?`, "g"), " ");
    for (const l of values.matchAll(LITERAL)) chunks.push(l[1] ?? l[2] ?? l[3]);
  }

  const out = [];
  for (const chunk of chunks) {
    // An interpolation splits; the piece before it is a prefix, the piece after it a suffix (not checked).
    const pieces = chunk.split(/(\$\{[^}]*\})/);
    for (let i = 0; i < pieces.length; i += 2) {
      const words = pieces[i].split(/\s+/);
      words.forEach((w, j) => {
        if (!w) return;
        const touchesNext = j === words.length - 1 && i + 1 < pieces.length;
        const touchesPrev = j === 0 && i > 0;
        if (touchesPrev) return;
        if (TOKEN.test(w)) out.push({ name: w, prefix: touchesNext });
      });
    }
  }
  return out;
}

function selfTest() {
  const defined = definedClasses(".a{} .b--x:hover{} /* .c */ .d > .e{}");
  const cases = [
    ["plain", `<i className="a b" />`, ["a", "b"]],
    ["expression", `<i className={on ? "a is-on" : "b"} />`, ["a", "is-on", "b"]],
    ["template prefix", "<i className={`a b--${size}`} />", ["a", "b--*"]],
    ["suffix not checked", "<i className={`${base}-x a`} />", ["a"]],
    ["variable", `const cls = "a" + (x ? " e" : "");`, ["a", "e"]],
    ["no class", `<i title="a b" />`, []],
    ["compared value", `<i className={c.align === "end" ? "a" : undefined} />`, ["a"]],
    ["compared, literal first", `<i className={"end" !== c.align ? "a" : "b"} />`, ["a", "b"]],
  ];
  let bad = 0;
  for (const [name, src, want] of cases) {
    const got = classTokens(src).map((t) => (t.prefix ? `${t.name}*` : t.name));
    if (JSON.stringify(got) !== JSON.stringify(want)) {
      bad++;
      console.error(`  ✗ ${name}: erwartet ${want.join(" ")}, gemessen ${got.join(" ")}`);
    }
  }
  if ([...defined].sort().join(" ") !== "a b--x d e") {
    bad++;
    console.error(`  ✗ Definitionen: ${[...defined].sort().join(" ")}`);
  }
  console.log(bad ? `check:classes --test — ${bad} Fehler.` : "check:classes --test — in Ordnung.");
  process.exit(bad ? 1 : 0);
}

if (process.argv.includes("--test")) selfTest();

const css = readdirSync(STYLES)
  .filter((f) => f.endsWith(".css"))
  .map((f) => readFileSync(join(STYLES, f), "utf8"))
  .join("\n");
const defined = definedClasses(css);
const all = [...defined];

const missing = new Map();
for (const file of ROOTS.flatMap(walk)) {
  for (const t of classTokens(readFileSync(file, "utf8"))) {
    if (HOOKS.has(t.name)) continue;
    const ok = t.prefix ? all.some((c) => c.startsWith(t.name)) : defined.has(t.name);
    if (ok) continue;
    const key = t.prefix ? `${t.name}\${…}` : t.name;
    missing.set(key, [...new Set([...(missing.get(key) ?? []), file])]);
  }
}

if (missing.size === 0) {
  console.log(`check:classes — in Ordnung. ${defined.size} Klassen definiert, ${HOOKS.size} Haken ohne Regel.`);
  process.exit(0);
}
console.error(`check:classes — ${missing.size} Klasse(n) ohne Regel in ${STYLES}/*.css:`);
for (const [name, files] of missing) console.error(`  ${name}  ${files.join(", ")}`);
console.error("Regel ergänzen, Namen streichen oder — nur als Haken mit Grund — in HOOKS eintragen.");
process.exit(1);
