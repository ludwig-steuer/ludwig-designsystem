#!/usr/bin/env node
/**
 * Welche gespiegelten Dateien hängen an Infrastruktur?
 *
 * Der Spiegel nimmt nur, was ohne Server läuft. Bis 2026-09-07 entschied das
 * ein Volltext-Grep über `server-only`, `@/core/db`, `@/core/auth` und
 * `drizzle-orm` — und der hat zweimal in zwei Tagen eine **reine** Datei
 * aussortiert, weil das Wort in einem Kommentar oder an einer Nachbarfunktion
 * stand. Zuletzt `documentCounterparty()`: eine reine Funktion, die neben
 * einem Drizzle-SQL-Ausdruck wohnte (Befund L-36).
 *
 * Deshalb entscheidet jetzt der **Import**, nicht der Text. Gelesen werden nur
 * `import`-Anweisungen und `export … from`-Weiterleitungen; was in einem
 * Kommentar oder einer Zeichenkette steht, zählt nicht.
 *
 * Aufruf: `node scripts/mirror-filter.mjs <verzeichnis>` — gibt die Pfade aus,
 * die gelöscht gehören. `--test` fährt die Selbstprüfung.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/** Ein Modul, das den Server voraussetzt. Präfix zählt: `@/core/db/x` auch. */
const SERVER_MODULES = ["server-only", "@/core/db", "@/core/auth", "drizzle-orm"];

const istServerModul = (spec) =>
  SERVER_MODULES.some((m) => spec === m || spec.startsWith(`${m}/`));

/**
 * Die Modul-Bezeichner, die eine Datei wirklich importiert.
 *
 * Kommentare und Zeichenketten fallen vorher weg — sonst zählt ein
 * `// … drizzle-orm …` als Import, und genau das war der Fehler.
 */
export function importSpecifiers(source) {
  const ohneKommentare = source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  const specs = [];
  // `import … from "x"`, `import "x"`, `export … from "x"`, `import("x")`
  const muster = [
    /\bimport\s+[^;'"]*?\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*["']([^"']+)["']/g,
    /\bexport\s+[^;'"]*?\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  for (const re of muster) for (const m of ohneKommentare.matchAll(re)) specs.push(m[1]);
  return specs;
}

/** Hängt die Datei an Infrastruktur? */
export function haengtAmServer(source) {
  return importSpecifiers(source).some(istServerModul);
}

function alleDateien(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? alleDateien(p) : p.endsWith(".ts") ? [p] : [];
  });
}

/* ── Selbstprüfung ─────────────────────────────────────────────────────────
   Die zwei Fälle, an denen der alte Filter gescheitert ist, und die zwei, an
   denen er richtig lag. Läuft mit `node scripts/mirror-filter.mjs --test`. */
function selbsttest() {
  const faelle = [
    ["Kommentar nennt server-only", `/**\n * Läuft ohne server-only.\n */\nexport const A = 1;\n`, false],
    ["Kommentar nennt drizzle-orm", `// Dieselbe Regel wie der Drizzle-Ausdruck (drizzle-orm) daneben.\nexport function f() { return 1; }\n`, false],
    ["Zeichenkette nennt @/core/db", `export const HINT = "siehe @/core/db";\n`, false],
    ["echter Drizzle-Import", `import { sql } from "drizzle-orm";\nexport const q = sql\`1\`;\n`, true],
    ["echtes server-only", `import "server-only";\nexport const x = 1;\n`, true],
    ["Weiterleitung auf @/core/db", `export { pool } from "@/core/db/pool";\n`, true],
    ["Unterpfad von @/core/auth", `import { user } from "@/core/auth/session";\n`, true],
    ["reiner Domänen-Import", `import type { X } from "./x";\nexport type Y = X;\n`, false],
  ];
  let schlecht = 0;
  for (const [name, quelle, erwartet] of faelle) {
    const ist = haengtAmServer(quelle);
    if (ist !== erwartet) {
      schlecht++;
      console.error(`  ✗ ${name}: erwartet ${erwartet}, gemessen ${ist}`);
    }
  }
  if (schlecht) {
    console.error(`\nmirror-filter — ${schlecht} von ${faelle.length} Fällen falsch.`);
    process.exit(1);
  }
  console.log(`mirror-filter — in Ordnung, ${faelle.length} Fälle geprüft.`);
}

const arg = process.argv[2];
if (arg === "--test") {
  selbsttest();
} else if (arg) {
  const dir = arg;
  if (!statSync(dir).isDirectory()) throw new Error(`kein Verzeichnis: ${dir}`);
  for (const f of alleDateien(dir)) {
    if (haengtAmServer(readFileSync(f, "utf8"))) console.log(f);
  }
} else {
  console.error("Aufruf: node scripts/mirror-filter.mjs <verzeichnis> | --test");
  process.exit(2);
}
