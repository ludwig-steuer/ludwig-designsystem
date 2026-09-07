#!/usr/bin/env node
/**
 * Wächter für „Code nur Englisch" (CLAUDE.md).
 *
 * Kommentare und JSDoc unter `src/ui/v3/` sind englisch; deutsch ist nur, was
 * Nutzer sehen — Labels, Texte, Storybook-Titel. Die Regel steht seit jeher da
 * und ist die, die am häufigsten zurückfällt: allein am 2026-09-07 kam sie in
 * vier Abnahmen zurück (0025 M3, 0044, 0063 M1, 0086 Befund 1), **jedes Mal
 * eingeschleppt von der Nacharbeit, die einen anderen Mangel behob**. Wer
 * unter Zeitdruck einen Kommentar schreibt, schreibt ihn in seiner
 * Arbeitssprache.
 *
 * Ausgenommen sind Story-Dateien: ihre JSDoc erscheinen in Storybook und sind
 * damit näher an „Strings, die Nutzer sehen" als an Code (Hausentscheid, 0098
 * M10). `src/ludwig/` ist gespiegelt und gehört der App.
 *
 * Erkannt wird an **deutschen Funktionswörtern**, nicht an Umlauten: „für" und
 * „größer" haben welche, „das", „nicht", „steht" nicht — und englische
 * Kommentare enthalten diese Wörter praktisch nie als ganzes Wort.
 *
 * **Er prüft, was gerade angefasst wurde, nicht den Bestand.** CLAUDE.md sagt:
 * „Bestehende deutsche Bezeichner werden nicht in Masse umbenannt; eine Datei,
 * die ohnehin angefasst wird, bekommt englische Namen." Genau so läuft er —
 * ohne Argumente nimmt er die Dateien, die `git` als geändert meldet. Der
 * Bestand (`--all`) ist ein Bericht, kein Tor: 407 Zeilen am 2026-09-07.
 *
 * Run: `pnpm check:language` · Bestand: `--all` · Selbstprüfung: `--test`
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = "src/ui/v3";

/**
 * Wörter, die im Deutschen tragen und im Englischen nicht vorkommen. Kurze
 * Wörter, die auch englische Fragmente sein können („die" als Verb, „in",
 * „so"), stehen bewusst nicht drin.
 */
const DEUTSCH = [
  "aber","auch","auf","aus","beim","dass","dem","den","der","des","die","doch",
  "durch","eine","einen","einer","eines","für","hier","ist","jede","jeder",
  "kein","keine","macht","nicht","noch","nur","oder","schon","sich","sind",
  "sonst","statt","steht","stehen","über","und","vom","von","wenn","werden",
  "wie","wird","zeigt","zwei","über","zwischen",
];
const MUSTER = new RegExp(`(?:^|[^\\p{L}])(${DEUTSCH.join("|")})(?![\\p{L}])`, "iu");

/** Kommentare einer Datei, als Zeilen mit ihrer Nummer. */
export function kommentarZeilen(source) {
  const out = [];
  const lines = source.split("\n");
  let imBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const t = l.trim();
    if (imBlock) {
      out.push([i + 1, t]);
      if (t.includes("*/")) imBlock = false;
      continue;
    }
    if (t.startsWith("/*")) {
      out.push([i + 1, t]);
      if (!t.includes("*/")) imBlock = true;
      continue;
    }
    // Zeilenkommentar — aber nicht das `//` in einer URL („https://…").
    const m = l.match(/(^|[^:"'`\\])\/\/(.*)$/);
    if (m) out.push([i + 1, m[2].trim()]);
  }
  return out;
}

/** Ist die Zeile deutsch? Zeichenketten darin zählen nicht — das sind Labels. */
export function istDeutsch(zeile) {
  const ohneStrings = zeile.replace(/„[^"]*"/g, " ").replace(/"[^"]*"/g, " ").replace(/`[^`]*`/g, " ");
  return MUSTER.test(ohneStrings);
}

const dateien = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return dateien(p);
    if (!/\.tsx?$/.test(e.name) || e.name.includes(".stories.")) return [];
    return [p];
  });

function selbsttest() {
  const faelle = [
    ["englischer Satz", "The row keeps its width, the cell does not.", false],
    ["deutscher Satz", "Die Zeile behält ihre Breite, die Zelle nicht.", true],
    ["deutsch ohne Umlaut", "Der Wert steht rechts und wird nie zentriert.", true],
    ["englisch mit Umlaut im Code-Span", "Uses `--color-größe` for the width.", false],
    ["englisch mit deutschem Label", 'Shows „Keine Treffer" when empty.', false],
    ["URL ist kein Kommentar", "const u = \"https://example.org/x\";", false],
  ];
  let schlecht = 0;
  for (const [name, zeile, erwartet] of faelle) {
    const ist = istDeutsch(zeile);
    if (ist !== erwartet) {
      schlecht++;
      console.error(`  ✗ ${name}: erwartet ${erwartet}, gemessen ${ist} — „${zeile}"`);
    }
  }
  // Und der Kommentar-Leser selbst
  const src = 'const u = "https://x.y";\n// Das ist deutsch.\n/* Und das\n   auch. */\n';
  const z = kommentarZeilen(src).map((k) => k[0]);
  if (z.join(",") !== "2,3,4") {
    schlecht++;
    console.error(`  ✗ Kommentar-Leser: erwartet Zeilen 2,3,4 — gemessen ${z.join(",") || "keine"}`);
  }
  if (schlecht) {
    console.error(`\ncheck:language — Selbstprüfung: ${schlecht} Fälle falsch.`);
    process.exit(1);
  }
  console.log(`check:language — Selbstprüfung in Ordnung, ${faelle.length + 1} Fälle.`);
}

if (process.argv[2] === "--test") {
  selbsttest();
  process.exit(0);
}

/** Die Dateien, die diese Änderung anfasst — Arbeitsbaum und letzter Commit. */
function geaenderte() {
  const raus = (cmd) => {
    try {
      return execSync(cmd, { encoding: "utf8" }).trim().split("\n").filter(Boolean);
    } catch {
      return [];
    }
  };
  const alle = new Set([...raus("git diff --name-only HEAD"), ...raus("git diff --name-only --cached")]);
  return [...alle].filter(
    (f) => f.startsWith(`${ROOT}/`) && /\.tsx?$/.test(f) && !f.includes(".stories.") && existsSync(f),
  );
}

const alle = process.argv[2] === "--all";
const zuPruefen = alle ? dateien(ROOT) : geaenderte();

if (!alle && zuPruefen.length === 0) {
  console.log("check:language — nichts geändert unter " + ROOT + ".");
  process.exit(0);
}

const fehlt = [];
for (const datei of zuPruefen) {
  for (const [nr, zeile] of kommentarZeilen(readFileSync(datei, "utf8"))) {
    if (istDeutsch(zeile)) fehlt.push(`${datei}:${nr} — ${zeile.slice(0, 72)}`);
  }
}

if (fehlt.length) {
  for (const f of fehlt) console.error(`  ✗ ${f}`);
  console.error(
    `\ncheck:language — ${fehlt.length} deutsche Kommentarzeilen in ${zuPruefen.length} ${alle ? "Dateien des Bestands" : "geänderten Dateien"}. Code nur Englisch (CLAUDE.md); Deutsch bleibt in Nutzer-Strings und in den Story-JSDoc.`,
  );
  process.exit(1);
}
console.log(`check:language — in Ordnung, ${zuPruefen.length} ${alle ? "Dateien" : "geänderte Dateien"} geprüft.`);
