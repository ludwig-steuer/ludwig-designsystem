#!/usr/bin/env node
/**
 * Guard for the contrast numbers written into `tokens.css` (task 0055).
 *
 * Every colour token whose comment claims a contrast ratio gets that ratio
 * recomputed here, from the hex values in the same file. Two of these numbers
 * were wrong when this script was written — `--color-accent-700` said 4.85 on
 * `accent-50` where it is 5.04 (found in 0090), and the focus ring said 9.4:1
 * where it is 11.64 (found in 0055). Both times the conclusion held and only
 * the number was off, which is exactly why nobody caught it: a ratio in a
 * comment is the one measurement in the set that nobody recomputes, **because
 * it is already written down**.
 *
 * The script reads only. It reports, it does not fix — a ratio that falls
 * below its threshold is a task, not a comment.
 *
 * **The form is the contract:** only a ratio that holds today is written as
 * `X.XX:1`. A number a comment quotes as history („it said 9,4 until …")
 * drops the `:1`, otherwise this script would demand that the past be true.
 *
 * Run: `pnpm check:contrast`
 */

import { readFileSync } from "node:fs";

/**
 * All three stylesheets, not only the tokens: the fourth miscalculated ratio
 * of the week sat in `v3.css` ("2.67:1 on bg-soft", measured against an
 * `accent-700` that has not existed since 0090). A guard that stops at the
 * token file checks half the claims.
 */
const FILES = ["src/styles/tokens.css", "src/styles/v3.css", "src/styles/app-chrome.css"];
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
const claims = [];
for (const file of FILES) {
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const found = [...line.matchAll(/(\d+[.,]\d+)\s*:\s*1\s*(?:auf\s+([A-Za-zäöü0-9-]+))?/g)];
    if (!found.length) continue;

    // The token this comment talks about: named inside it, or the next one
    // declared below it, or — for a trailing comment — the one on this line.
    const named = line.match(/(--color-[a-z0-9-]+)\s*,/);
    let token = named?.[1] ?? line.match(/(--color-[a-z0-9-]+)\s*:/)?.[1] ?? null;
    for (let j = i + 1; !token && j < Math.min(i + 12, lines.length); j++) {
      token = lines[j].match(/(--color-[a-z0-9-]+)\s*:/)?.[1] ?? null;
    }

    // Each claim carries its own ground, and one without a named ground is
    // measured against the page — **not** against the ground of its neighbour.
    // „5.52:1, 4.78:1 auf warning-bg" is two claims: the first against white,
    // the second against the warning surface.
    for (const f of found) {
      claims.push({
        file,
        line: i + 1,
        text: f[0].trim(),
        claimed: Number(f[1].replace(",", ".")),
        ground: f[2] ?? "weiss",
        token,
      });
    }
  }

}
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
// In `tokens.css` a claim that cannot be resolved is itself a defect: the
// value stands right next to it. In the other stylesheets many claims name a
// class instead of a token — those this guard cannot recompute, and it says
// so rather than reporting green. To make such a claim checkable, name both
// tokens in the comment: „gemessen 2.87:1 (`--color-text-subtle` auf
// `--color-bg-soft`)".
if (bad || unresolvedInTokens) {
  console.error(
    `\ncheck:contrast — ${bad} von ${checked} Angaben stimmen nicht${unresolvedInTokens ? `, ${unresolvedInTokens} in tokens.css lassen sich nicht auflösen` : ""}. Die Zahl im Kommentar ist die Messung; wer sie ändert, rechnet sie nach.`,
  );
  process.exit(1);
}
console.log(
  `check:contrast — in Ordnung. ${checked} Angaben nachgerechnet${
    unchecked ? `, ${unchecked} beziehen sich auf Klassen statt auf Token und bleiben ungeprüft` : ""
  }.`,
);
