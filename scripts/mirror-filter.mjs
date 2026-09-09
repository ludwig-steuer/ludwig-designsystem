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

/**
 * Die **Namen**, die eine Datei aus einem Modul des Spiegels holt.
 *
 * Gebraucht für die zweite Runde: eine Datei, die an keiner Infrastruktur
 * hängt, kann trotzdem unspiegelbar sein — nämlich dann, wenn sie einen Namen
 * holt, den der Spiegel nach der ersten Runde nicht mehr führt.
 *
 * Genau das ist am 2026-09-09 passiert: `BookingCycleKind` ist drüben von
 * `domain/` nach `application/booking-cycle-core.ts` gewandert, einer
 * `server-only`-Datei mit DB-Zugriff. Die erste Runde hat sie richtig
 * aussortiert — und drei `stapelabnahme`-Dateien, die den Typ von dort holen,
 * blieben stehen und brachen den Typcheck des ganzen Spiegels.
 */
export function moduleImporte(source) {
  const ohneKommentare = source
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");
  const treffer = [];
  const muster = /\bimport\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["'](@\/modules\/[^"'\/]+)["']/g;
  for (const m of ohneKommentare.matchAll(muster)) {
    const namen = m[1]
      .split(",")
      .map((n) => n.replace(/^\s*type\s+/, "").split(/\s+as\s+/)[0].trim())
      .filter(Boolean);
    treffer.push({ modul: m[2].replace("@/modules/", ""), namen });
  }
  return treffer;
}

/** Was eine Datei selbst exportiert — grob, aber für die Frage genau genug. */
function exportierteNamen(source) {
  const namen = new Set();
  for (const m of source.matchAll(
    /^export\s+(?:declare\s+)?(?:type|interface|const|function|class|enum)\s+([A-Za-z0-9_$]+)/gm,
  )) {
    namen.add(m[1]);
  }
  for (const m of source.matchAll(/^export\s+(?:type\s+)?\{([^}]*)\}/gm)) {
    for (const teil of m[1].split(",")) {
      const n = teil.replace(/^\s*type\s+/, "").split(/\s+as\s+/).pop()?.trim();
      if (n) namen.add(n);
    }
  }
  return namen;
}

/**
 * Zweite Runde: wer einen Namen holt, den der Spiegel nicht mehr führt, kann
 * selbst nicht bleiben — und wer *ihn* dann holt, auch nicht. Deshalb bis zur
 * Ruhe wiederholt.
 */
export function unerfuellbar(dateien, lies) {
  const raus = new Set();
  for (;;) {
    const verfuegbar = new Map();
    for (const f of dateien) {
      if (raus.has(f)) continue;
      const m = /modules\/([^/]+)\//.exec(f);
      if (!m) continue;
      const menge = verfuegbar.get(m[1]) ?? new Set();
      for (const n of exportierteNamen(lies(f))) menge.add(n);
      verfuegbar.set(m[1], menge);
    }
    let neu = 0;
    for (const f of dateien) {
      if (raus.has(f)) continue;
      for (const { modul, namen } of moduleImporte(lies(f))) {
        const menge = verfuegbar.get(modul);
        // Ein Modul, das der Spiegel gar nicht führt, ist nicht diese Frage —
        // dafür gibt es die erste Runde.
        if (!menge) continue;
        if (namen.some((n) => !menge.has(n))) {
          raus.add(f);
          neu++;
          break;
        }
      }
    }
    if (neu === 0) return [...raus];
  }
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
  // Die zweite Runde: der Fall vom 2026-09-09, und die zwei Nachbarfälle, in
  // denen sie **nicht** greifen darf.
  const dateien = {
    "modules/a/domain/quelle.ts": 'export type Weg = "x";\nexport const K = 1;\n',
    "modules/b/domain/nutzer.ts": 'import type { Weg } from "@/modules/a";\nexport type N = Weg;\n',
    "modules/b/domain/vermisst.ts": 'import type { Fehlt } from "@/modules/a";\nexport type M = Fehlt;\n',
    "modules/c/domain/kette.ts": 'import type { M } from "@/modules/b";\nexport type C = M;\n',
    "modules/d/domain/fremd.ts": 'import type { X } from "@/modules/gibtesnicht";\nexport type D = X;\n',
  };
  const raus = unerfuellbar(Object.keys(dateien), (f) => dateien[f]).sort();
  const erwartetRaus = ["modules/b/domain/vermisst.ts", "modules/c/domain/kette.ts"].sort();
  if (JSON.stringify(raus) !== JSON.stringify(erwartetRaus)) {
    console.error(`  ✗ zweite Runde: erwartet ${erwartetRaus.join(", ")}, gemessen ${raus.join(", ")}`);
    console.error("\nmirror-filter — die zweite Runde ist falsch.");
    process.exit(1);
  }
  console.log(
    `mirror-filter — in Ordnung, ${faelle.length} Fälle geprüft, dazu die zweite Runde ` +
      "(fehlender Name fliegt, Kette dahinter auch, fremdes Modul bleibt).",
  );
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
  const lies = (f) => readFileSync(f, "utf8");
  const alle = alleDateien(dir);
  // Erste Runde: wer am Server hängt.
  const amServer = alle.filter((f) => haengtAmServer(lies(f)));
  for (const f of amServer) console.log(f);
  // Zweite Runde: wer einen Namen holt, den nach der ersten keiner mehr führt.
  const bleibt = alle.filter((f) => !amServer.includes(f));
  for (const f of unerfuellbar(bleibt, lies)) console.log(f);
} else {
  console.error("Aufruf: node scripts/mirror-filter.mjs <verzeichnis> | --test");
  process.exit(2);
}
