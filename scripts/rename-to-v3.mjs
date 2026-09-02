#!/usr/bin/env node
/**
 * Ersetzt die alten deutschen v3-Namen durch die englischen — für den Tag,
 * an dem `ludwig/app` auf v3 umsteigt (Aufgabe 0001).
 *
 *   node scripts/rename-to-v3.mjs --dry-run ../app/apps/web/src
 *   node scripts/rename-to-v3.mjs           ../app/apps/web/src
 *
 * Ohne `--dry-run` wird geschrieben. Die Zuordnung ist aus den Commits der
 * Umbenennungswelle abgeleitet, nicht aus dem Gedächtnis.
 *
 * Warum ein Script und keine „hieß früher"-Kommentare in den Komponenten:
 * beim Umstieg braucht man ein vollständiges Suchen-Ersetzen an einem Ort,
 * nicht zehn verstreute Notizen — und die Reihenfolge ist heikel (siehe unten).
 */
import fs from "node:fs";
import path from "node:path";

/**
 * ACHTUNG Reihenfolge: längere Namen zuerst, sonst frisst die kürzere Regel
 * das Präfix. `Pruefpunkte` vor `Pruefpunkt`, `Meldungen` vor `Meldung`,
 * `StaffelstabKey`/`-Meta` vor `Staffelstab`, `BuchungssatzEditorProps` vor
 * `BuchungssatzEditor`. Das Array wird unten nach Länge sortiert, damit die
 * Regel auch bei Ergänzungen hält.
 */
const NAMES = {
  // Komponenten und Funktionen
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

  // Typen
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

  // Props (nur die, die nach aussen sichtbar sind)
  gruppen: "groups",
  tasten: "keys",
  abschnitte: "segments",
};

/**
 * `Seite` -> `Side` steht bewusst NICHT in der Tabelle: das Wort kommt in
 * deutschem Fliesstext und in sichtbaren Labels vor („Ludwig-Seite"). Beim
 * Umstieg von Hand prüfen — nur der Typ des Buchungssatz-Editors ist gemeint.
 */
const MANUAL = ["Seite -> Side (nur der Typ, nicht das Wort im Text)"];

/**
 * Namen, die auch ausserhalb des Design-Systems vorkommen. Ein Probelauf gegen
 * `ludwig/app` fand `Meldung` 74x — überwiegend in deutschen Kommentaren
 * („Error mit sprechender Meldung") — und `Pruefpunkt` als EIGENEN Typ der App
 * in `modules/stapelabnahme/domain/pruefpunkte`, der nichts mit dem Set zu tun
 * hat. Blind ersetzt zerstört das fremden Code.
 *
 * Diese Namen werden nur mit `--include-risky` ersetzt, sonst nur gezählt.
 */
const RISKY = new Set(["Meldung", "Meldungen", "Pruefpunkt", "Pruefpunkte", "gruppen", "tasten", "abschnitte", "istOffen"]);

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const includeRisky = args.includes("--include-risky");
/** Nur Dateien anfassen, die überhaupt aus dem Set importieren. */
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
  // Datei ohne Set-Import: hier kann kein Name aus dem Set stehen.
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
