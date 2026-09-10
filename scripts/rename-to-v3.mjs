#!/usr/bin/env node
/**
 * Replaces the old German v3 names with the English ones — for the day
 * `ludwig/app` moves to v3 (task 0001).
 *
 *   node scripts/rename-to-v3.mjs --dry-run ../app/apps/web/src
 *   node scripts/rename-to-v3.mjs           ../app/apps/web/src
 */
import fs from "node:fs";
import path from "node:path";

/** Longer names first, or the shorter rule eats the prefix — the array is sorted by length below. */
const NAMES = {
  // Components and functions
  AbweichungsZelle: "DeviationCell",
  BuchungssatzEditorProps: "JournalEntryEditorProps",
  BuchungssatzEditor: "JournalEntryEditor",
  Checkliste: "Checklist",
  FortschrittLeiste: "ProgressBar",
  GrundDialog: "ReasonDialog",
  HotkeyLegende: "HotkeyLegend",
  KIBuchungshinweise: "AiBookingNotes",
  KONTO_GRUPPEN_LABEL: "ACCOUNT_GROUP_LABEL",
  KontoFeld: "AccountField",
  Meldungen: "Messages",
  ProzessMini: "ProcessMini",
  ProzessStepper: "ProcessStepper",
  Pruefpunkte: "CheckItems",
  SchrittKopf: "StepHeader",
  SchrittRail: "StepRail",
  StaffelLeiste: "BatonBar",
  TodoListe: "TodoList",
  VergleichsTabelle: "ComparisonTable",
  istOffen: "isOpen",
  naechsterOffener: "nextOpen",

  // Types
  EditorMeldung: "EditorMessage",
  KIQuelle: "AiSource",
  KonfidenzStufe: "ConfidenceLevel",
  KontoGruppe: "AccountGroup",
  KontoKandidat: "AccountCandidate",
  Meldung: "Message",
  ProzessLoops: "ProcessLoops",
  ProzessPhaseStatus: "ProcessPhaseStatus",
  ProzessPhase: "ProcessPhase",
  Pruefpunkt: "CheckItem",
  QuellenArt: "SourceKind",
  StaffelAbschnitt: "BatonSegment",
  StaffelstabKey: "BatonKey",
  StaffelstabMeta: "BatonMeta",
  Staffelstab: "Baton",
  VergleichsZeile: "ComparisonRow",
  ZustandsIcon: "StateKind",

  // Props (only the externally visible ones)
  gruppen: "groups",
  tasten: "keys",
  abschnitte: "segments",
};

/** `Seite` -> `Side` is deliberately absent: the word also occurs in German prose and labels. Check by hand. */
const MANUAL = ["Seite -> Side (nur der Typ, nicht das Wort im Text)"];

/**
 * Names that also occur outside the design system (`Meldung`, and the app's
 * own `Pruefpunkt` type). Replaced only with `--include-risky`, else counted.
 */
const RISKY = new Set(["Meldung", "Meldungen", "Pruefpunkt", "Pruefpunkte", "gruppen", "tasten", "abschnitte", "istOffen"]);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const includeRisky = args.includes("--include-risky");
/** Only touch files that import from the set at all. */
const DS_IMPORT = /from\s+["'](@\/ui\/v[23]|@ludwig\/designsystem)/;
const target = args.find((a) => !a.startsWith("--"));

if (!target) {
  console.error("Zielverzeichnis fehlt.\n  node scripts/rename-to-v3.mjs [--dry-run] <verzeichnis>");
  process.exit(1);
}

const pairs = Object.entries(NAMES).sort((a, b) => b[0].length - a[0].length);
const EXT = /\.(ts|tsx|js|jsx|md)$/;
const SKIP = /(^|\/)(node_modules|\.git|\.next|dist|storybook-static)(\/|$)/;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (SKIP.test(p)) return [];
    return e.isDirectory() ? walk(p) : EXT.test(p) ? [p] : [];
  });

let touched = 0;
let skipped = 0;
const hits = new Map();
const risky = new Map();

for (const file of walk(target)) {
  const src = fs.readFileSync(file, "utf8");
  // A file without a set import cannot contain a set name.
  if (!DS_IMPORT.test(src)) {
    skipped++;
    continue;
  }
  let out = src;
  for (const [from, to] of pairs) {
    const re = new RegExp(`\\b${from}\\b`, "g");
    const n = (out.match(re) || []).length;
    if (!n) continue;
    if (RISKY.has(from) && !includeRisky) {
      risky.set(from, (risky.get(from) ?? 0) + n);
      continue;
    }
    hits.set(from, (hits.get(from) ?? 0) + n);
    out = out.replace(re, to);
  }
  if (out !== src) {
    touched++;
    if (!dryRun) fs.writeFileSync(file, out);
  }
}

console.log(`${dryRun ? "[Probelauf] " : ""}${touched} Datei(en)${dryRun ? " würden sich ändern" : " geändert"}`);
for (const [from, n] of [...hits].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(4)}x  ${from} -> ${NAMES[from]}`);
}
if (hits.size === 0) console.log("  keine Treffer");
console.log(`\n${skipped} Datei(en) übersprungen (kein Import aus dem Set).`);
if (risky.size) {
  console.log("\nNicht ersetzt — kommt auch ausserhalb des Sets vor, von Hand prüfen:");
  for (const [from, n] of [...risky].sort((a, b) => b[1] - a[1]))
    console.log(`  ${String(n).padStart(4)}x  ${from} -> ${NAMES[from]}`);
  console.log("  (mit --include-risky trotzdem ersetzen)");
}
console.log("\nVon Hand nachziehen:");
for (const m of MANUAL) console.log(`  - ${m}`);
console.log("\nDanach: Importpfade prüfen — entities/konto -> entities/account,");
console.log("entities/buchungssatz -> entities/journal-entry, patterns/{Rahmen,Pruefen,");
console.log("Prozessbild,TodoListe,VergleichsTabelle} -> {StepRail,Review,Process,TodoList,ComparisonTable}.");
