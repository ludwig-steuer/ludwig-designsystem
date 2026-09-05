#!/usr/bin/env node
/**
 * Wächter zur Icon-Registry (Aufgabe 0087).
 *
 * Meldet jede Datei unter `src/ui/v3`, die ein Zeichen direkt aus
 * `lucide-react` importiert, statt es aus `Icons.tsx` zu holen. Das
 * ist der Mechanismus, der „einmal festschreiben, später verwenden" hält:
 * ohne ihn wandert jedes neue Icon wieder an der Registry vorbei ins Set.
 *
 * Die erlaubten Namen liest das Skript aus der Import-Liste von `Icons.tsx`
 * selbst — es gibt keine zweite Liste, die auseinanderlaufen könnte.
 *
 * Aufruf: `pnpm check:icons`. Exit 1, wenn etwas vorbeigeht.
 *
 * ponytail: bewusst ein Skript und kein Test — dieses Repo hat keinen
 * Test-Runner (kein vitest, kein `test`-Script, `stufen.test.ts` existiert
 * nicht). Ein Runner nur für diese eine Prüfung wäre eine Abhängigkeit für
 * dreißig Zeilen. Wird das Repo je getestet, zieht die Prüfung als
 * `icons.test.ts` um und dieses Skript entfällt.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SET = join(ROOT, "src/ui/v3");
const REGISTRY = join(SET, "Icons.tsx");

/**
 * Wer darf direkt importieren:
 *  - die Registry selbst,
 *  - `Review.tsx` mit `StateIcon` — das Vokabular der Prüfzustände, bewusst
 *    eigene Tabelle (siehe Kopfkommentar von `Icons.tsx`),
 *  - die Grundlagen-Story, die das Vokabular zeigt statt es zu benutzen.
 */
const EXEMPT = new Map([
  ["Icons.tsx", "die Registry selbst"],
  ["patterns/Review.tsx", "StateIcon — das Vokabular der neun Prüfzustände"],
  ["patterns/Process.tsx", "wer an der Reihe ist: Agent, Kanzlei, Mandant, System"],
  ["entities/accounting-case/CaseTimeline.tsx", "die Ereignisart (client_accounting_event.kind)"],
  [
    "entities/journal-entry/AiBookingNotes.tsx",
    "die Quellenart einer Aussage: Bank, Beleg, Regel, Gesetz, Web",
  ],
]);

/**
 * Stories zeigen das Vokabular, sie liefern es nicht aus. Sie dürfen ein
 * beliebiges Zeichen malen, um eine Sidebar oder einen Leerzustand
 * anzudeuten — die Registry auf sie auszudehnen zwänge Einträge wie
 * `LayoutDashboard`, die kein Baustein je benutzt. Was ausgeliefert wird,
 * ist die Komponente daneben, und die prüft dieses Skript.
 */
const isStory = (key) => key.endsWith(".stories.tsx");

/**
 * Noch nicht umgezogen, mit Grund und Besitzer. Diese Liste schrumpft und
 * wächst nie: wer eine Datei umzieht, streicht ihre Zeile.
 */
const PENDING = new Map([
  [
    "entities/source-document/SourceDocumentDrawer.tsx",
    "0075/0076 in Arbeit in einer anderen Sitzung — Umzug, sobald sie fertig ist",
  ],
  [
    "entities/journal-entry/JournalEntryEditor.tsx",
    "uncommittete Änderungen einer anderen Sitzung — Umzug, sobald sie committet sind",
  ],
]);

const IMPORT = /import\s*\{([^}]*)\}\s*from\s*["']lucide-react["']/gs;

function names(source) {
  const found = new Set();
  for (const m of source.matchAll(IMPORT)) {
    for (const raw of m[1].split(",")) {
      const name = raw.replace(/\btype\b/, "").split(/\bas\b/)[0].trim();
      if (name && name !== "LucideIcon") found.add(name);
    }
  }
  return found;
}

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(full)) out.push(full);
  }
  return out;
}

const allowed = names(readFileSync(REGISTRY, "utf8"));
const offenders = [];
const stale = [];

for (const file of walk(SET)) {
  const key = relative(SET, file);
  if (EXEMPT.has(key) || isStory(key)) continue;
  const used = names(readFileSync(file, "utf8"));
  if (used.size === 0) {
    if (PENDING.has(key)) stale.push(key);
    continue;
  }
  if (PENDING.has(key)) continue;
  offenders.push([key, [...used].sort()]);
}

if (offenders.length === 0 && stale.length === 0) {
  console.log(
    `check:icons — in Ordnung. ${allowed.size} Zeichen in der Registry, ` +
      `${PENDING.size} Datei(en) noch offen.`,
  );
  process.exit(0);
}

for (const [file, used] of offenders) {
  console.error(`✗ ${file} importiert an der Registry vorbei: ${used.join(", ")}`);
}
for (const file of stale) {
  console.error(`✗ ${file} steht in PENDING, importiert aber nichts mehr — Zeile streichen.`);
}
console.error(
  "\nZeichen kommen aus src/ui/v3/Icons.tsx: EntityIcon für ein Ding,\n" +
    "ActionIcon für eine Handlung. Fehlt die Bedeutung, bekommt sie dort einen\n" +
    "Namen — sie wird nicht am Vokabular vorbei importiert.",
);
process.exit(1);
