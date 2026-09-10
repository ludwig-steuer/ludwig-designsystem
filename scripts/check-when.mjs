#!/usr/bin/env node
/**
 * Guard for the `@when`/`@instead` rule (README).
 *
 * Every export someone chooses between carries `@when` (its case) and
 * `@instead` (the neighbouring case). Constants, fixtures and stories are
 * exempt — nobody picks between two label tables.
 *
 * Run: `pnpm check:when` · self-test: `--test`
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/ui/v3";

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return files(p);
    if (!/\.tsx?$/.test(e.name) || e.name.includes(".stories.")) return [];
    return [p];
  });

/**
 * Is the export a building block (component, function) rather than a value?
 * Decided by the declaration's form, not the name's casing. `fixtures.ts` is
 * exempt.
 */
const isBuildingBlock = (file, line) => {
  if (file.endsWith("/fixtures.ts")) return false;
  if (/^export\s+(?:async\s+)?(?:function|class)\s/.test(line)) return true;
  // `export const x = (…) => …` and `export const x = function …`
  return /^export\s+const\s+[A-Za-z0-9_$]+\s*(?::[^=]+)?=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*(?::[^=]+)?=>|[A-Za-z0-9_$]+\s*=>)/.test(line);
};

/**
 * The JSDoc directly above a line — only blank lines may sit between. A second
 * JSDoc in between counts as missing.
 */
export function jsdocAbove(lines, i) {
  let j = i - 1;
  while (j >= 0 && lines[j].trim() === "") j--;
  if (j < 0) return null;
  const line = lines[j].trim();
  // One-liner: `/** … */` on a single line.
  if (line.startsWith("/**") && line.endsWith("*/")) return line;
  if (line !== "*/") return null;
  const end = j;
  while (j >= 0 && !lines[j].trim().startsWith("/**")) j--;
  return j < 0 ? null : lines.slice(j, end + 1).join("\n");
}

/**
 * Does the JSDoc carry the tag as a tag? Only the start of a line counts —
 * mid-line, no JSDoc reader sees it (acceptance 0106).
 */
export function hatTag(doc, tag) {
  return new RegExp(`(^|\\n)\\s*(?:/\\*\\*)?\\s*\\*?\\s*@${tag}\\b`).test(doc);
}

/* ── Self-test: the cases the first version got wrong. `--test` ── */
function selfTest() {
  const cases = [
    ["Einzeiler-JSDoc", ["/** Was das ist. */", "export const A_B = 1;"], 1, true],
    ["mehrzeiliges JSDoc", ["/**", " * Was das ist.", " */", "export const A_B = 1;"], 3, true],
    ["Leerzeile dazwischen", ["/** Was das ist. */", "", "export const A_B = 1;"], 2, true],
    ["gar kein JSDoc", ["export const A_B = 1;"], 0, false],
    ["nur ein //-Kommentar", ["// Was das ist.", "export const A_B = 1;"], 1, false],
  ];
  let bad = 0;
  for (const [name, lines, i, expected] of cases) {
    const actual = jsdocAbove(lines, i) !== null;
    if (actual !== expected) {
      bad++;
      console.error(`  ✗ ${name}: erwartet ${expected}, gemessen ${actual}`);
    }
  }
  // The tag itself: only at the start of a line.
  const tagCases = [
    ["Tag in eigener Zeile", "/**\n * Satz.\n * @when    Der Fall.\n */", true],
    ["Tag im Einzeiler", "/** @when Der Fall. */", true],
    ["Tag ohne Stern", "/**\n   @when Der Fall.\n */", true],
    ["Tag mitten in der Zeile", "/** Satz.  * @when    Der Fall.\n */", false],
    ["Wort statt Tag", "/**\n * Sagt, wann@when gilt.\n */", false],
    ["gar kein Tag", "/**\n * Nur ein Satz.\n */", false],
  ];
  for (const [name, doc, expected] of tagCases) {
    const actual = hatTag(doc, "when");
    if (actual !== expected) {
      bad++;
      console.error(`  ✗ ${name}: erwartet ${expected}, gemessen ${actual}`);
    }
  }
  if (bad) {
    console.error(`\ncheck:when — Selbstprüfung: ${bad} von ${cases.length + tagCases.length} Fällen falsch.`);
    process.exit(1);
  }
  console.log(`check:when — Selbstprüfung in Ordnung, ${cases.length + tagCases.length} Fälle.`);
}

if (process.argv[2] === "--test") {
  selfTest();
  process.exit(0);
}

const missing = [];
for (const file of files(ROOT)) {
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(
      /^export\s+(?:async\s+)?(?:function|class)\s+([A-Za-z0-9_$]+)|^export\s+const\s+([A-Za-z0-9_$]+)\s*[:=]/,
    );
    if (!m) continue;
    const name = m[1] ?? m[2];
    const doc = jsdocAbove(lines, i) ?? "";
    const wo = `${file}:${i + 1} ${name}`;
    if (!isBuildingBlock(file, lines[i])) {
      // One sentence is enough — but there must be one.
      if (!/[A-Za-zÄÖÜäöü]/.test(doc.replace(/[/*]/g, ""))) missing.push(`${wo} — Wert ohne Satz`);
      continue;
    }
    const hatWhen = hatTag(doc, "when");
    const hatInstead = hatTag(doc, "instead");
    if (!hatWhen || !hatInstead) {
      missing.push(`${wo} — ${!hatWhen && !hatInstead ? "@when und @instead" : !hatWhen ? "@when" : "@instead"} fehlt`);
    }
  }
}

if (missing.length) {
  for (const f of missing) console.error(`  ✗ ${f}`);
  console.error(
    `\ncheck:when — ${missing.length} Exporte ohne die Zeilen, die sagen, wofür sie da sind. Die Regel steht im README („Wann"); Konstanten brauchen statt der Zeilen einen Satz (0093).`,
  );
  process.exit(1);
}
console.log("check:when — in Ordnung.");
