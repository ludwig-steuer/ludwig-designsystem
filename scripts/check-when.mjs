#!/usr/bin/env node
/**
 * Wächter für die „Wann"-Regel des Sets (README, Zeile „Wann").
 *
 * Jeder Export, bei dem die Frage **„was nehme ich?"** entsteht, trägt im
 * JSDoc `@when` (der Fall, für den er da ist) und `@instead` (der Nachbarfall
 * mit Verweis). Das ist die greppbare Antwort auf genau diese Frage.
 *
 * **Konstanten sind ausgenommen** — Label-Tabellen, Icon-Register, Fixtures.
 * Zwischen `ENTITY_ICON` und `OPEN_ITEM_AGE_LABEL` wählt niemand; sie bekommen
 * einen Satz, der sagt, was sie sind. Das ist der geschärfte Entscheid aus
 * 0093, und dieser Wächter ist seine andere Hälfte: die Abnahme von 0093 hat
 * angemerkt, dass (a) der einzige ihrer fünf Punkte ohne Skript war — und der
 * einzige, der zurückfiel. Elf Exporte standen bei der Prüfung schon wieder
 * ohne Zeilen da, die meisten in Dateien, die am selben Tag entstanden.
 *
 * Stories zählen nicht: ihre Exporte sind Bilder, keine Bausteine.
 *
 * Run: `pnpm check:when`
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
 * Ist der Export ein **Baustein**, zwischen denen jemand wählt — oder ein Wert?
 *
 * Die Frage „was nehme ich?" stellt sich bei Komponenten und Funktionen, nicht
 * bei einer Spurbreite oder einer Label-Tabelle. Entschieden wird an der Form
 * der Deklaration, nicht an der Schreibweise des Namens: `invoiceLineMinWidth`
 * ist camelCase und trotzdem eine Zahl.
 *
 * `fixtures.ts` ist ganz ausgenommen — Beispieldaten sind keine Bausteine,
 * auch wenn sie als Funktion daherkommen (0093).
 */
const isBuildingBlock = (file, line) => {
  if (file.endsWith("/fixtures.ts")) return false;
  if (/^export\s+(?:async\s+)?(?:function|class)\s/.test(line)) return true;
  // `export const x = (…) => …` und `export const x = function …`
  return /^export\s+const\s+[A-Za-z0-9_$]+\s*(?::[^=]+)?=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*(?::[^=]+)?=>|[A-Za-z0-9_$]+\s*=>)/.test(line);
};

/**
 * Das JSDoc **direkt** über einer Zeile. „Direkt" heißt: dazwischen stehen nur
 * Leerzeilen und Dekoratoren — ein zweites JSDoc dazwischen zählt als
 * abgerutscht und damit als fehlend (genau so ist es `SourceDocumentFacts`
 * ergangen, als 0071 einen Block dazwischenschob).
 */
export function jsdocAbove(lines, i) {
  let j = i - 1;
  while (j >= 0 && lines[j].trim() === "") j--;
  if (j < 0) return null;
  const line = lines[j].trim();
  // Einzeiler: `/** … */` steht ganz in einer Zeile.
  if (line.startsWith("/**") && line.endsWith("*/")) return line;
  if (line !== "*/") return null;
  const end = j;
  while (j >= 0 && !lines[j].trim().startsWith("/**")) j--;
  return j < 0 ? null : lines.slice(j, end + 1).join("\n");
}

/**
 * Trägt das JSDoc das Tag **als Tag**? `doc.includes("@when")` genügt nicht:
 * ein Tag zählt nur am Zeilenanfang (nach `/**` oder ` * `). Steht es mitten
 * in einer Zeile — so wie es entsteht, wenn ein englischer Block in einen
 * deutschen Einzeiler geschoben wird, ohne die Zeile zu brechen —, liest es
 * kein JSDoc-Leser als Tag, und dieser Wächter hat es dreimal durchgewinkt
 * (`Table.tsx`, gefunden von der Abnahme 0106).
 */
export function hatTag(doc, tag) {
  return new RegExp(`(^|\\n)\\s*(?:/\\*\\*)?\\s*\\*?\\s*@${tag}\\b`).test(doc);
}

/* ── Selbstprüfung ─────────────────────────────────────────────────────────
   Ein Wächter, der falsch anschlägt, actual schlimmer als keiner: er lässt einen
   Satz nachtragen, der schon dasteht. Die Fälle unten sind die, an denen der
   erste Wurf dieses Skripts gescheitert actual. `pnpm check:when --test`. */
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
  // Und das Tag selbst: nur am Zeilenanfang zählt es.
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
      // Ein Satz genügt — aber es muss einer da sein.
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
