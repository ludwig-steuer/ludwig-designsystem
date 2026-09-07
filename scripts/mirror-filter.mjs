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

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
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
  standHinweis();
}

/**
 * Zweite Prüfung: **steht der Spiegel noch auf dem Stand, auf dem er
 * eingefroren wurde?**
 *
 * Der Spiegel ist seit dem 2026-09-07 eingefroren (Owner-Entscheid: das Set
 * wird erst fertig, dann zieht die App in einem Zug nach). `sync-ludwig.sh`
 * schreibt dabei den App-Hash nach `src/ludwig/GESPIEGELT_AUS.json`. Läuft
 * die App inzwischen woanders, ist das **kein Fehler** — der Spiegel soll ja
 * stehen bleiben. Es ist ein Hinweis, damit niemand eine Abweichung für einen
 * Bug im Set hält, so wie „Abzugstiefe" zwei Runden lang für eine falsche
 * Beschriftung gehalten wurde (Abnahme 0027).
 */
function standHinweis() {
  const marke = "src/ludwig/GESPIEGELT_AUS.json";
  if (!existsSync(marke)) {
    console.log("  ℹ kein Stand vermerkt — `pnpm sync:ludwig` schreibt ihn beim nächsten Zug.");
    return;
  }
  const { appHash, datum } = JSON.parse(readFileSync(marke, "utf8"));
  const app = process.env.LUDWIG_APP ?? "../app";
  let jetzt = null;
  try {
    jetzt = execSync(`git -C ${JSON.stringify(app)} rev-parse HEAD`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    console.log(`  ℹ App nicht erreichbar (${app}) — Stand nicht vergleichbar.`);
    return;
  }
  if (jetzt === appHash) {
    console.log(`  ✓ Spiegel und App stehen gleich (${appHash.slice(0, 8)}, eingefroren ${datum}).`);
  } else {
    console.log(
      `  ℹ Der Spiegel steht auf ${appHash.slice(0, 8)} (eingefroren ${datum}), die App auf ` +
        `${jetzt.slice(0, 8)}. Das ist Absicht, solange das Set nicht fertig ist — kein Sync bis zur Migration.`,
    );
  }
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
