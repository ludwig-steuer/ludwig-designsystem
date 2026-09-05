#!/usr/bin/env node
/**
 * Guard for the icon registry (task 0087).
 *
 * Reports every file under `src/ui/v3` that imports a sign straight from
 * `lucide-react` instead of taking it from `Icons.tsx`. This is the mechanism
 * that makes "write it down once, use it later" hold: without it every new
 * icon walks past the registry into the set again.
 *
 * The allowed names are read from the import list of `Icons.tsx` itself —
 * there is no second list that could drift apart from the first.
 *
 * Run with `pnpm check:icons`. Exits 1 when something slips past.
 *
 * ponytail: deliberately a script and not a test — this repo has no test
 * runner (no vitest, no `test` script, no `stufen.test.ts`). A runner as a
 * dependency for thirty lines of checking would be the wrong direction. Once
 * the repo is tested this moves over as `icons.test.ts` and the script goes.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SET = join(ROOT, "src/ui/v3");
const REGISTRY = join(SET, "Icons.tsx");

/**
 * Who may import directly, and why. Each of these carries one enumeration of
 * its own — the same reason `StateIcon` keeps its table (see the head comment
 * of `Icons.tsx`).
 */
const EXEMPT = new Map([
  ["Icons.tsx", "the registry itself"],
  ["patterns/Review.tsx", "StateIcon — the vocabulary of the nine review states"],
  ["patterns/Process.tsx", "whose turn it is: agent, firm, client, system — moves over with task 0088"],
  ["entities/accounting-case/CaseTimeline.tsx", "the event kind (client_accounting_event.kind)"],
  [
    "entities/journal-entry/AiBookingNotes.tsx",
    "the kind of source backing a statement: bank, document, rule, law, web",
  ],
]);

/**
 * Stories show the vocabulary, they do not ship it. A story may draw any sign
 * to sketch a sidebar or an empty state; extending the registry over them
 * would force entries like `LayoutDashboard` that no component ever uses. What
 * ships is the component next door, and that is what this script checks.
 */
const isStory = (key) => key.endsWith(".stories.tsx");

/**
 * Not migrated yet, each with a reason and an owner. This list only ever
 * shrinks: whoever migrates a file deletes its line. A line that no longer
 * imports anything is reported as an error, so a dead exemption stands out.
 */
const PENDING = new Map([
  [
    "entities/source-document/SourceDocumentDrawer.tsx",
    "0075/0076 in progress in another session — migrate once it is done",
  ],
  [
    "entities/journal-entry/JournalEntryEditor.tsx",
    "uncommitted changes from another session — migrate once they are committed",
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
