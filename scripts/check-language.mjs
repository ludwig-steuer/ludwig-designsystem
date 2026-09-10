#!/usr/bin/env node
/**
 * Guard: no German in source code (CLAUDE.md, owner 2026-09-10).
 *
 * Checks every source file outside the mirror (`src/ludwig/`) for German in
 * comments, declared identifiers, CSS class names and file names. German stays
 * only where users read it: string literals, and story descriptions, which
 * Storybook renders as text (house decision 0098 M10).
 *
 * Comments are a ratchet: `scripts/language-baseline.json` counts the German
 * comment lines per file that existed on 2026-09-10, and a file may only go
 * down. Names, classes and file names have no baseline — they are clean.
 *
 * Run: `pnpm check:language` · shrink the baseline: `--update` · self-test: `--test`
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const ROOTS = ["src", "scripts", ".storybook"];
const MIRROR = "src/ludwig/";
const SOURCE = /\.(tsx?|mjs|cjs|js|css|sh)$/;
const BASELINE = "scripts/language-baseline.json";

// Function words carry German sentences and practically never occur as whole
// words in English ones. Words that are also English fragments ("die", "in",
// "so") are left out on purpose.
const FUNCTION_WORDS = [
  "aber", "auch", "auf", "aus", "beim", "dass", "dem", "den", "der", "des", "die", "doch",
  "durch", "eine", "einen", "einer", "eines", "für", "hier", "ist", "jede", "jeder",
  "kein", "keine", "macht", "nicht", "noch", "nur", "oder", "schon", "sich", "sind",
  "sonst", "statt", "steht", "stehen", "über", "und", "vom", "von", "wenn", "werden",
  "wie", "wird", "zeigt", "zwei", "zwischen",
];
const SENTENCE = new RegExp(`(?:^|[^\\p{L}])(${FUNCTION_WORDS.join("|")})(?![\\p{L}])`, "iu");

// Words in names. `EXACT` must match a whole word, `PREFIX` may start a German
// compound ("kontoauszug", "belegfeld"). ponytail: a lexicon, not a language
// model — a German word outside it passes; add it when a review finds one.
const EXACT = new Set(("soll haben voll alle leer offen breit jahr rolle titel suche ziel letzte zuletzt merke zahlen " +
  "summe reise mit ohne und oder nicht nur fehler aktiv interaktiv varianten kopf lange frage karte sauber erledigt " +
  "grund gegen netto brutto zweite arten quelle quellen regel regeln gesetz kasse belege buchen wert werte neu " +
  "heute jetzt einfach im am zum zur bei nach vor unten oben rechts klein ist lies").split(" "));
const PREFIX = ("beleg konto konten buchung klaer sachverhalt stapel vorschlag ereignis uebersicht zustaend pruef " +
  "waehl gewaehl gefuell geoeff laed unguelt unvollst faelle vorgaeng mandant kanzlei steuer rechnung gutschrift " +
  "zahlung waehrung verlauf protokoll notiz flaech zeile spalte seite rahmen erwart abnahme freigabe befund maengel " +
  "mangel storno speicher loesch zurueck weitere gefuehrt vertrag erloes aufwand einsatz stamm kommentar vorschau " +
  "zielgrupp eingeordnet gefunden bewegung anschrift herkunft verhalten umsatz gegenkonto betrag datum nummer monat " +
  "stichtag privatant wohlgeform schluessel auszug frist plakett aehnlich leiste schritt").split(" ");

export function words(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[\s_\-.]+/)
    .map((w) => w.toLowerCase())
    .filter(Boolean);
}

export function isGermanName(name) {
  if (/[äöüßÄÖÜ]/.test(name)) return true;
  return words(name).some((w) => EXACT.has(w) || PREFIX.some((p) => w.startsWith(p)));
}

/** Is a comment line German? Quoted text does not count — that is a label. */
export function isGermanComment(line) {
  const bare = line.replace(/„[^"“]*["“]/g, " ").replace(/"[^"]*"/g, " ").replace(/`[^`]*`/g, " ");
  return SENTENCE.test(bare);
}

/**
 * Comment lines of a file as `[lineNumber, text]`. In story files a JSDoc
 * directly above `export const` / `const meta` is a description Storybook
 * shows, so it is skipped.
 */
export function commentLines(source, { css = false, shell = false, story = false } = {}) {
  const lines = source.split("\n");
  const out = [];
  if (shell) {
    // Heredoc bodies are file content (generated docs), not comments.
    let heredoc = null;
    lines.forEach((l, i) => {
      if (heredoc) { if (l.trim() === heredoc) heredoc = null; return; }
      const h = l.match(/<<-?\s*['"]?(\w+)['"]?/);
      if (h) heredoc = h[1];
      else if (/^\s*#(?!!)/.test(l)) out.push([i + 1, l.trim()]);
    });
    return out;
  }
  let block = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const t = l.trim();
    if (block) {
      block.push([i + 1, t]);
      if (t.includes("*/")) {
        const next = lines.slice(i + 1).find((x) => x.trim() !== "") ?? "";
        const description = story && block.doc && /^\s*(export\s+const|const\s+meta|export\s+default)/.test(next);
        if (!description) out.push(...block);
        block = null;
      }
      continue;
    }
    const start = t.startsWith("/*") ? t : t.startsWith("{/*") ? t.slice(1) : null;
    if (start !== null) {
      const entry = [[i + 1, start]];
      entry.doc = start.startsWith("/**");
      if (start.includes("*/")) {
        const next = lines.slice(i + 1).find((x) => x.trim() !== "") ?? "";
        if (!(story && entry.doc && /^\s*(export\s+const|const\s+meta)/.test(next))) out.push(...entry);
      } else block = entry;
      continue;
    }
    if (css) continue;
    // A line comment — but not the `//` inside a URL.
    const m = l.match(/(^|[^:"'`\\])\/\/(.*)$/);
    if (m) out.push([i + 1, m[2].trim()]);
  }
  return out;
}

/** Declared identifiers (not object keys — those are data unless a type declares them). */
export function declaredNames(file, source) {
  const kind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : file.endsWith(".ts") ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
  const out = [];
  (function visit(n) {
    const p = n.parent;
    if (ts.isIdentifier(n) && p && p.name === n && (
      ts.isVariableDeclaration(p) || ts.isFunctionDeclaration(p) || ts.isParameter(p) || ts.isPropertySignature(p) ||
      ts.isBindingElement(p) || ts.isInterfaceDeclaration(p) || ts.isTypeAliasDeclaration(p) || ts.isMethodDeclaration(p) ||
      ts.isPropertyDeclaration(p) || ts.isClassDeclaration(p) || ts.isEnumMember(p) || ts.isEnumDeclaration(p)))
      out.push([sf.getLineAndCharacterOfPosition(n.getStart(sf)).line + 1, n.text]);
    ts.forEachChild(n, visit);
  })(sf);
  return out;
}

const cssClasses = (source) => [...new Set([...source.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/\.(-?[a-zA-Z_][\w-]*)/g)].map((m) => m[1]))];

function sourceFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (p.startsWith(MIRROR) || e.name === "node_modules") return [];
    if (e.isDirectory()) return sourceFiles(p);
    return SOURCE.test(e.name) ? [p] : [];
  });
}

/** Names the app's data model declares — German there is a finding for the app, not a defect here. */
function mirrorNames() {
  const out = new Set();
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).forEach((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    if (/\.tsx?$/.test(e.name)) for (const [, n] of declaredNames(p, readFileSync(p, "utf8"))) out.add(n);
  });
  if (existsSync(MIRROR)) walk(MIRROR);
  return out;
}

export function scan() {
  const allowed = mirrorNames();
  const comments = {};
  const names = [];
  for (const file of ROOTS.flatMap(sourceFiles)) {
    const source = readFileSync(file, "utf8");
    const opts = { css: file.endsWith(".css"), shell: file.endsWith(".sh"), story: file.includes(".stories.") };
    const german = commentLines(source, opts).filter(([, t]) => isGermanComment(t));
    if (german.length) comments[file] = german;
    if (isGermanName(basename(file).replace(/\.(stories\.)?[a-z]+$/, ""))) names.push(`${file} — file name`);
    if (opts.css) {
      for (const c of cssClasses(source)) if (isGermanName(c)) names.push(`${file} — class .${c}`);
    } else if (!opts.shell) {
      for (const [line, n] of declaredNames(file, source)) if (!allowed.has(n) && isGermanName(n)) names.push(`${file}:${line} — ${n}`);
    }
  }
  return { comments, names };
}

function selfTest() {
  const cases = [
    [isGermanComment, "The row keeps its width, the cell does not.", false],
    [isGermanComment, "Die Zeile behält ihre Breite, die Zelle nicht.", true],
    [isGermanComment, "Der Wert steht rechts und wird nie zentriert.", true],
    [isGermanComment, 'Shows „Keine Treffer" when empty.', false],
    [isGermanName, "kontoName", true],
    [isGermanName, "accountName", false],
    [isGermanName, "TodoRow", false],
    [isGermanName, "bse__kopf", true],
    [isGermanName, "v3notes__meta", false],
    [isGermanName, "BelegSeite", true],
    [isGermanName, "counterpartyName", false],
    [isGermanName, "summary", false],
  ];
  let bad = 0;
  for (const [fn, input, expected] of cases) {
    if (fn(input) !== expected) { bad++; console.error(`  ✗ ${fn.name}(${input}): expected ${expected}`); }
  }
  const slash = "/";
  const js = `const u = "https://x.y";\n${slash}${slash} Das ist deutsch.\n${slash}* Und das\n   auch. *${slash}\n`;
  if (commentLines(js).map((c) => c[0]).join(",") !== "2,3,4") { bad++; console.error("  ✗ comment reader"); }
  const story = `${slash}** Die Story zeigt den Leerfall. *${slash}\nexport const Empty = {};\n${slash}${slash} Das ist Code.\n`;
  if (commentLines(story, { story: true }).map((c) => c[0]).join(",") !== "3") { bad++; console.error("  ✗ story description skipped"); }
  if (bad) { console.error(`check:language — self-test: ${bad} cases wrong.`); process.exit(1); }
  console.log(`check:language — self-test passed, ${cases.length + 2} cases.`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const arg = process.argv[2];
  if (arg === "--test") { selfTest(); process.exit(0); }
  const { comments, names } = scan();
  const counts = Object.fromEntries(Object.entries(comments).map(([f, l]) => [f, l.length]).sort());
  if (arg === "--update") {
    writeFileSync(BASELINE, JSON.stringify(counts, null, 1) + "\n");
    console.log(`check:language — baseline written: ${Object.values(counts).reduce((a, b) => a + b, 0)} German comment lines in ${Object.keys(counts).length} files.`);
    process.exit(0);
  }
  const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {};
  const grew = Object.entries(counts).filter(([f, n]) => n > (baseline[f] ?? 0));
  for (const n of names) console.error(`  ✗ ${n}`);
  for (const [f, n] of grew) {
    console.error(`  ✗ ${f}: ${n} German comment lines, baseline ${baseline[f] ?? 0}`);
    for (const [line, t] of comments[f].slice(0, 5)) console.error(`      ${line}: ${t.slice(0, 80)}`);
  }
  const left = Object.values(counts).reduce((a, b) => a + b, 0);
  if (names.length || grew.length) {
    console.error(`\ncheck:language — ${names.length} German names, ${grew.length} files with new German comments. No German in source code (CLAUDE.md); German stays in user-facing strings and story descriptions.`);
    process.exit(1);
  }
  const shrinkable = Object.entries(baseline).filter(([f, n]) => (counts[f] ?? 0) < n).length;
  console.log(`check:language — ok. ${left} German comment lines left in ${Object.keys(counts).length} files${shrinkable ? `; baseline can shrink in ${shrinkable} files (--update)` : ""}.`);
}
