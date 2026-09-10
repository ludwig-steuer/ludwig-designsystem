#!/usr/bin/env node
/**
 * Guard for the contrast ratios written into comments (task 0055).
 *
 * Every comment that claims a ratio (`X.XX:1`) gets it recomputed from the hex
 * values — a ratio in a comment is the one measurement nobody recomputes,
 * because it is already written down. It reports, it never fixes.
 *
 * Only a ratio that holds today is written as `X.XX:1`; a historical number
 * drops the `:1`. Opacity is out of reach: such claims drop the `:1` too and
 * name the opacity in words.
 *
 * Run: `pnpm check:contrast` · self-test: `--test`
 */

import { readFileSync } from "node:fs";

/** All stylesheets, not only the tokens — wrong ratios turned up in `v3.css` and `components.css` too. */
const FILES = [
  "src/styles/tokens.css",
  "src/styles/v3.css",
  "src/styles/app-chrome.css",
  "src/styles/components.css",
  "src/styles/booking.css",
];
const TOKEN_SOURCE = readFileSync(FILES[0], "utf8");

/** `--color-x: #AABBCC;` → the map every claim is resolved against. */
const TOKENS = new Map();
for (const m of TOKEN_SOURCE.matchAll(/(--color-[a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})\s*;/g)) {
  TOKENS.set(m[1], m[2]);
}

/**
 * The grounds a comment names in words. „Weiss" is the page, and it is the
 * only one that is not a token — everything else has to be one, or the claim
 * cannot be checked and says so.
 */
const GROUNDS = new Map([
  ["weiss", "#FFFFFF"],
  ["weiß", "#FFFFFF"],
  ["white", "#FFFFFF"],
  ["bg", "--color-bg"],
  ["bg-soft", "--color-bg-soft"],
  ["bg-sunken", "--color-bg-sunken"],
]);

function channels(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function luminance(hex) {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `bg-soft` or `--color-bg-soft` or „Weiss" → a hex, or null with a reason. */
function resolveGround(word) {
  const key = word.toLowerCase().replace(/^--color-/, "");
  const known = GROUNDS.get(key);
  if (known) return known.startsWith("#") ? known : (TOKENS.get(known) ?? null);
  return TOKENS.get(`--color-${key}`) ?? null;
}

/**
 * A claim is a ratio plus the ground it is measured against, and the token it
 * belongs to. The foreground is the token declared **after** the comment —
 * unless the comment names one itself, as the focus ring does.
 */
/** All claims of one file — the unit `--test` checks. */
export function claimsFrom(lines, file = "") {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Each claim carries its own ground, so the line is split before every
    // number: "5.52:1, 4.78:1 on warning-bg" is two claims, the first against
    // white. Backticks count on both halves.
    const found = [];
    // The lookbehind keeps the split out of a number: "11.64:1" must not become 1.64.
    for (const part of line.split(/(?<![\d.,])(?=\d+[.,]\d+\s*:\s*1)/)) {
      const num = part.match(/^(\d+[.,]\d+)\s*:\s*1/);
      if (!num) continue;
      const groundMatch = part.match(/(?:auf|on)\s+`?([A-Za-zäöü0-9-]+)`?/);
      found.push({ text: num[0].trim(), claimed: num[1], ground: groundMatch?.[1] });
    }
    if (!found.length) continue;

    // The token this comment talks about: named inside it, or the next one
    // declared below it, or — for a trailing comment — the one on this line.
    // Backticks count: comments write `--color-text-subtle`, not `--color-text-subtle,`.
    const named = line.match(/(--color-[a-z0-9-]+)[`,]/);
    let token = named?.[1] ?? line.match(/(--color-[a-z0-9-]+)\s*:/)?.[1] ?? null;
    for (let j = i + 1; !token && j < Math.min(i + 12, lines.length); j++) {
      token = lines[j].match(/(--color-[a-z0-9-]+)\s*:/)?.[1] ?? null;
    }

    for (const f of found) {
      out.push({
        file,
        line: i + 1,
        text: f.text,
        claimed: Number(f.claimed.replace(",", ".")),
        ground: f.ground ?? "weiss",
        token,
      });
    }
  }
  return out;
}

/**
 * The docs too, not only the stylesheets — a wrong ratio once sat in a table
 * in `design-guidelines.md`. Two unambiguous forms are read: the first number
 * of a line that starts with a token (against white), and "on `<token>`
 * <number>" anywhere. Parenthesised values and slash pairs stay unchecked and
 * are reported as such.
 */
const MARKDOWN = ["docs/design-guidelines.md"];

export function claimsFromMarkdown(lines, file = "") {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const token = line.match(/^\|\s*`(--color-[a-z0-9-]+)`/);
    if (!token) continue;
    const cells = line.split("|");
    if (cells.length < 3) continue;
    const value = cells[2];
    // The ground where it is written: "on `success-bg` 4.63".
    for (const m of value.matchAll(/(?:auf|on)\s+`?(--color-)?([a-z0-9-]+)`?\s+(\d+[.,]\d+)/g)) {
      out.push({
        file,
        line: i + 1,
        text: `${m[3]} on ${m[2]}`,
        claimed: Number(m[3].replace(",", ".")),
        ground: m[2],
        token: token[1],
      });
    }
    // The cell's first number is against white — unless it already names a ground.
    const first = value.match(/^\s*(\d+[.,]\d+)/);
    if (first && !/^\s*\d+[.,]\d+\s*(?:auf|on)\b/.test(value)) {
      out.push({
        file,
        line: i + 1,
        text: first[1],
        claimed: Number(first[1].replace(",", ".")),
        ground: "weiss",
        token: token[1],
      });
    }
  }
  return out;
}

/** Self-test — the guard failed its own instructions twice (0055). */
function selfTest() {
  let bad = 0;
  const check = (name, actual, expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      bad++;
      console.error(`  ✗ ${name}: erwartet ${JSON.stringify(expected)}, gemessen ${JSON.stringify(actual)}`);
    }
  };
  const oneLine = (line) => {
    const c = claimsFrom([line])[0];
    return c ? [c.claimed, c.ground, c.token] : null;
  };

  // The form the closing text prescribes — both tokens in backticks.
  check(
    "Anleitungsform",
    oneLine("/* gemessen 2.87:1 (`--color-text-subtle` auf `--color-bg-soft`) */"),
    [2.87, "--color-bg-soft", "--color-text-subtle"],
  );
  check(
    "Grund ohne Backtick",
    oneLine("/* `--color-text-subtle`: 4.51:1 auf bg-soft */"),
    [4.51, "bg-soft", "--color-text-subtle"],
  );
  check("ohne Grund ist Weiß", oneLine("/* `--color-accent` 3.55:1 */"), [3.55, "weiss", "--color-accent"]);
  check("Zahl ohne `:1` ist keine Angabe", oneLine("/* opacity .5 ergab 2,11 */"), null);
  check("Komma wie Punkt", oneLine("/* `--color-text-muted` 6,69:1 */"), [6.69, "weiss", "--color-text-muted"]);
  check(
    "Token erst darunter deklariert",
    (() => {
      const c = claimsFrom(["  /* 4.88:1 auf Weiss */", "  --color-text-subtle: #717171;"])[0];
      return [c.claimed, c.token];
    })(),
    [4.88, "--color-text-subtle"],
  );
  check(
    "zweistellige Zahl bleibt ganz",
    oneLine("/* den Kontrast traegt der Rahmen (--color-primary-700, 11.64:1 auf Weiss) */"),
    [11.64, "Weiss", "--color-primary-700"],
  );
  check(
    "zwei Angaben in einer Zeile, je eigener Grund",
    claimsFrom(["/* 5.52:1, 4.78:1 auf warning-bg */"]).map((c) => [c.claimed, c.ground]),
    [[5.52, "weiss"], [4.78, "warning-bg"]],
  );
  check(
    "zwei Angaben in einer Zeile, je eigener Grund",
    claimsFrom(["/* 5.52:1, 4.78:1 on warning-bg */"]).map((c) => [c.claimed, c.ground]),
    [[5.52, "weiss"], [4.78, "warning-bg"]],
  );

  // And the markdown form the sixth wrong ratio came from.
  const oneMd = (line) => {
    const c = claimsFromMarkdown([line])[0];
    return c ? [c.claimed, c.ground, c.token] : null;
  };
  check(
    "Markdown: Zahl gegen Weiß",
    oneMd("| `--color-text-muted` | 6.69 | Text |"),
    [6.69, "weiss", "--color-text-muted"],
  );
  check(
    "Markdown: Grund benannt",
    claimsFromMarkdown(["| `--color-success` | 5.07 (4.68); auf `success-bg` 4.63 | Text |"]).map(
      (c) => [c.claimed, c.ground],
    ),
    [[4.63, "success-bg"], [5.07, "weiss"]],
  );
  check("Markdown: Zeile ohne Token", oneMd("| Kontrast | 4.5 | Schwelle |"), null);
  check(
    "Markdown: Klammerwert bleibt ungeprüft",
    claimsFromMarkdown(["| `--color-text-subtle` | 4.88 (4.51) | Text |"]).length,
    1,
  );

  // And the arithmetic itself, against hand-computed values.
  const rounded = (x) => Math.round(x * 1e4) / 1e4;
  check("Verhältnis text-subtle auf Weiß", rounded(ratio("#717171", "#FFFFFF")), 4.8807);
  check("Verhältnis accent auf border-control", rounded(ratio("#3B8FC4", "#8A8A8A")), 1.0289);
  check("Grund über Wort auflösbar", resolveGround("bg-soft") !== null, true);
  check("ground white", resolveGround("white"), "#FFFFFF");
  check("Grund über Token auflösbar", resolveGround("--color-border-control"), "#8A8A8A");

  if (bad) {
    console.error(`\ncheck:contrast — Selbstprüfung: ${bad} Fälle falsch.`);
    process.exit(1);
  }
  console.log("check:contrast — Selbstprüfung in Ordnung, 16 Fälle.");
  process.exit(0);
}

if (process.argv[2] === "--test") selfTest();

const claims = [
  ...FILES.flatMap((file) => claimsFrom(readFileSync(file, "utf8").split("\n"), file)),
  ...MARKDOWN.flatMap((file) => claimsFromMarkdown(readFileSync(file, "utf8").split("\n"), file)),
];

let bad = 0;
let unchecked = 0;
let unresolvedInTokens = 0;
for (const c of claims) {
  // A token declared as `rgba(...)` has no hex and is not the foreground of
  // its own claim — such a comment names the token it means (the focus ring
  // says so about the frame).
  const fg = c.token ? TOKENS.get(c.token) : null;
  const bg = resolveGround(c.ground);
  if (!fg || !bg) {
    unchecked++;
    if (c.file === FILES[0]) unresolvedInTokens++;
    console.log(
      `  ? ${c.file}:${c.line} — „${c.text}" — ${!fg ? `Token ${c.token ?? "unbekannt"}` : `Grund ${c.ground}`} nicht auflösbar`,
    );
    continue;
  }
  const actual = ratio(fg, bg);
  // Two decimals is what the comments write, so that is the tolerance.
  if (Math.abs(actual - c.claimed) > 0.005) {
    bad++;
    console.error(
      `  ✗ ${c.file}:${c.line} — ${c.token} auf ${c.ground} steht mit ${c.claimed.toFixed(2)}:1 da, gemessen ${actual.toFixed(2)}:1`,
    );
  }
}

const checked = claims.length - unchecked;
// In `tokens.css` an unresolvable claim is itself a defect: the value stands
// right next to it. Elsewhere only opacity stays unchecked. To make a claim
// checkable, name both tokens on the number's line:
// "2.87:1 (`--color-text-subtle` on `--color-bg-soft`)".
if (bad || unresolvedInTokens) {
  console.error(
    `\ncheck:contrast — ${bad} von ${checked} Angaben stimmen nicht${unresolvedInTokens ? `, ${unresolvedInTokens} in tokens.css lassen sich nicht auflösen` : ""}. Die Zahl im Kommentar ist die Messung; wer sie ändert, rechnet sie nach.`,
  );
  process.exit(1);
}
console.log(
  `check:contrast — in Ordnung. ${checked} Angaben nachgerechnet${
    unchecked ? `, ${unchecked} nennen ihren Ton nicht als Token und bleiben ungeprüft` : ""
  }.`,
);
