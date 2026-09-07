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

const dateien = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return dateien(p);
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
const istBaustein = (datei, zeile) => {
  if (datei.endsWith("/fixtures.ts")) return false;
  if (/^export\s+(?:async\s+)?(?:function|class)\s/.test(zeile)) return true;
  // `export const x = (…) => …` und `export const x = function …`
  return /^export\s+const\s+[A-Za-z0-9_$]+\s*(?::[^=]+)?=\s*(?:async\s+)?(?:function\b|\([^)]*\)\s*(?::[^=]+)?=>|[A-Za-z0-9_$]+\s*=>)/.test(zeile);
};

/**
 * Das JSDoc **direkt** über einer Zeile. „Direkt" heißt: dazwischen stehen nur
 * Leerzeilen und Dekoratoren — ein zweites JSDoc dazwischen zählt als
 * abgerutscht und damit als fehlend (genau so ist es `SourceDocumentFacts`
 * ergangen, als 0071 einen Block dazwischenschob).
 */
export function jsdocUeber(lines, i) {
  let j = i - 1;
  while (j >= 0 && lines[j].trim() === "") j--;
  if (j < 0) return null;
  const zeile = lines[j].trim();
  // Einzeiler: `/** … */` steht ganz in einer Zeile.
  if (zeile.startsWith("/**") && zeile.endsWith("*/")) return zeile;
  if (zeile !== "*/") return null;
  const ende = j;
  while (j >= 0 && !lines[j].trim().startsWith("/**")) j--;
  return j < 0 ? null : lines.slice(j, ende + 1).join("\n");
}

/* ── Selbstprüfung ─────────────────────────────────────────────────────────
   Ein Wächter, der falsch anschlägt, ist schlimmer als keiner: er lässt einen
   Satz nachtragen, der schon dasteht. Die Fälle unten sind die, an denen der
   erste Wurf dieses Skripts gescheitert ist. `pnpm check:when --test`. */
function selbsttest() {
  const faelle = [
    ["Einzeiler-JSDoc", ["/** Was das ist. */", "export const A_B = 1;"], 1, true],
    ["mehrzeiliges JSDoc", ["/**", " * Was das ist.", " */", "export const A_B = 1;"], 3, true],
    ["Leerzeile dazwischen", ["/** Was das ist. */", "", "export const A_B = 1;"], 2, true],
    ["gar kein JSDoc", ["export const A_B = 1;"], 0, false],
    ["nur ein //-Kommentar", ["// Was das ist.", "export const A_B = 1;"], 1, false],
  ];
  let schlecht = 0;
  for (const [name, lines, i, erwartet] of faelle) {
    const ist = jsdocUeber(lines, i) !== null;
    if (ist !== erwartet) {
      schlecht++;
      console.error(`  ✗ ${name}: erwartet ${erwartet}, gemessen ${ist}`);
    }
  }
  if (schlecht) {
    console.error(`\ncheck:when — Selbstprüfung: ${schlecht} von ${faelle.length} Fällen falsch.`);
    process.exit(1);
  }
  console.log(`check:when — Selbstprüfung in Ordnung, ${faelle.length} Fälle.`);
}

if (process.argv[2] === "--test") {
  selbsttest();
  process.exit(0);
}

const fehlt = [];
for (const datei of dateien(ROOT)) {
  const lines = readFileSync(datei, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(
      /^export\s+(?:async\s+)?(?:function|class)\s+([A-Za-z0-9_$]+)|^export\s+const\s+([A-Za-z0-9_$]+)\s*[:=]/,
    );
    if (!m) continue;
    const name = m[1] ?? m[2];
    const doc = jsdocUeber(lines, i) ?? "";
    const wo = `${datei}:${i + 1} ${name}`;
    if (!istBaustein(datei, lines[i])) {
      // Ein Satz genügt — aber es muss einer da sein.
      if (!/[A-Za-zÄÖÜäöü]/.test(doc.replace(/[/*]/g, ""))) fehlt.push(`${wo} — Wert ohne Satz`);
      continue;
    }
    const hatWhen = doc.includes("@when");
    const hatInstead = doc.includes("@instead");
    if (!hatWhen || !hatInstead) {
      fehlt.push(`${wo} — ${!hatWhen && !hatInstead ? "@when und @instead" : !hatWhen ? "@when" : "@instead"} fehlt`);
    }
  }
}

if (fehlt.length) {
  for (const f of fehlt) console.error(`  ✗ ${f}`);
  console.error(
    `\ncheck:when — ${fehlt.length} Exporte ohne die Zeilen, die sagen, wofür sie da sind. Die Regel steht im README („Wann"); Konstanten brauchen statt der Zeilen einen Satz (0093).`,
  );
  process.exit(1);
}
console.log("check:when — in Ordnung.");
