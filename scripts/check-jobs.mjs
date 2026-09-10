#!/usr/bin/env node
/**
 * Guard for the jobs-to-be-done register (`docs/jobs.md`, Owner 2026-09-08).
 *
 * Every job used to live only in its own page or entity profile, in the form
 * "Wenn <situation>, will <role> <goal>, damit <benefit>". Scattered like
 * that they could not be compared and not be sorted by frequency. The register
 * collects them; the wording stays where it is. This script keeps the two in
 * step.
 *
 * It checks three things:
 *
 *   1. Every `J-nn` cited in a profile exists in the register. A citation of
 *      an id nobody wrote is worse than no citation: it reads like a promise.
 *   2. Every register entry in state `bedient` is cited by at least one
 *      profile. An entry claiming to be served by a page that never names it
 *      is the failure mode this register exists to prevent.
 *   3. "No place" and state `unbedient` say the same thing — the "Bedient von"
 *      cell starts with an em dash exactly when the state is `unbedient`.
 *      That column is the list the next restructuring comes from, so it must
 *      not drift.
 *
 * On top of those, the structural checks that make the three meaningful: ids
 * unique and consecutive, states from the known set, a frequency in every row
 * (`unbekannt` counts — an invented one would be worse than a missing one,
 * because the register is meant to be sorted by it), and at least one source
 * location per entry.
 *
 * **The transition switch.** Check 2 cannot hold until the ids have been
 * carried into the profiles, and that is a second step the Owner (Simon) does
 * himself — this script was written before it. Until then the register's head
 * table carries the row
 *
 *     `| Kennungen in Profilen | noch nicht eingetragen |`
 *
 * and check 2 is reported as a hint, not an error: the run stays at exit 0 but
 * says how many entries are waiting. Whoever carries the ids into the profiles
 * flips that cell to `eingetragen` in the same change, and from then on check 2
 * is an error like the others. Nobody else flips it: a switch that is set to
 * silence a red run has switched off the check, not fixed it.
 *
 * Run: `pnpm check:jobs` · self-test: `pnpm check:jobs --test`
 *
 * ponytail: a script and not a test, for the same reason as `check-icons.mjs`
 * — this repo has no test runner. The self-test below is the substitute, and
 * it is not optional: twice this week a guard's self-test found a fault in the
 * guard itself rather than in the thing it guards.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const REGISTER = "docs/jobs.md";
const PROFILE_DIRS = ["docs/seiten", "docs/entitaeten"];

/** The three states a job can be in. Nothing else is allowed in the column. */
const STATES = ["bedient", "halb", "unbedient"];

/** A job without a place writes an em dash first in "Bedient von". */
const NO_PLACE = "—";

/** How a job id is written, everywhere: in the register and in the profiles. */
const ID = /\bJ-\d{2}\b/g;

/* ── Reading markdown ────────────────────────────────────────────────────── */

/**
 * Split one table row into its cells. `\|` inside a cell is an escaped pipe,
 * not a column border — the entity profiles use it (`variant="stuck" \|
 * "inflight"`), and a splitter that misses it shifts every following column by
 * one, which turns the state column into a frequency and reports nonsense.
 */
export function splitRow(line) {
  const cells = [];
  let cell = "";
  for (let i = 0; i < line.length; i++) {
    if (line[i] === "\\" && line[i + 1] === "|") {
      cell += "|";
      i++;
      continue;
    }
    if (line[i] === "|") {
      cells.push(cell);
      cell = "";
      continue;
    }
    cell += line[i];
  }
  cells.push(cell);
  if (cells.length && cells[0].trim() === "") cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === "") cells.pop();
  return cells.map((c) => c.trim());
}

const isSeparator = (line) => /^\|[\s:|-]+\|$/.test(line.trim());

/**
 * All tables of a markdown file, each as `{ head, rows }` where a row carries
 * its cells and the line it stands on. The line number is what makes the
 * output usable: a guard that says "something is wrong" without a place costs
 * more than it saves.
 */
export function parseTables(markdown) {
  const lines = markdown.split("\n");
  const tables = [];
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith("|")) continue;
    if (!isSeparator(lines[i + 1] ?? "")) continue;
    const head = splitRow(lines[i]);
    const rows = [];
    let j = i + 2;
    for (; j < lines.length && lines[j].trim().startsWith("|"); j++) {
      rows.push({ cells: splitRow(lines[j]), line: j + 1 });
    }
    tables.push({ head, rows, line: i + 1 });
    i = j - 1;
  }
  return tables;
}

/** The cell under a header, by name — so a new column cannot shift the others. */
const cell = (head, row, name) => {
  const at = head.indexOf(name);
  return at === -1 ? undefined : row.cells[at];
};

/* ── Reading the register ────────────────────────────────────────────────── */

/**
 * The register as the checks need it: the switch, one entry per job, and the
 * source locations. Tables are found by their headers, not by their order, so
 * a new section between them changes nothing.
 */
export function parseRegister(markdown) {
  const tables = parseTables(markdown);
  const has = (t, ...names) => names.every((n) => t.head.includes(n));

  const armed = /^\|\s*Kennungen in Profilen\s*\|\s*eingetragen\s*\|/m.test(markdown);
  const hasSwitch = /^\|\s*Kennungen in Profilen\s*\|/m.test(markdown);

  const registerTable = tables.find((t) => has(t, "Kennung", "Zustand", "Bedient von"));
  const sourceTable = tables.find((t) => has(t, "Kennung", "Datei", "Abschnitt"));

  const entries = (registerTable?.rows ?? []).map((row) => ({
    id: cell(registerTable.head, row, "Kennung"),
    role: cell(registerTable.head, row, "Rolle"),
    frequency: cell(registerTable.head, row, "Häufigkeit"),
    state: cell(registerTable.head, row, "Zustand"),
    place: cell(registerTable.head, row, "Bedient von"),
    line: row.line,
  }));

  const sources = (sourceTable?.rows ?? []).map((row) => ({
    id: cell(sourceTable.head, row, "Kennung"),
    file: (cell(sourceTable.head, row, "Datei") ?? "").replace(/`/g, "").trim(),
    line: row.line,
  }));

  return { armed, hasSwitch, entries, sources, hasTables: Boolean(registerTable && sourceTable) };
}

/**
 * Every `J-nn` a profile cites, with the place it stands. Reads the profiles
 * only — the register cites its own ids by definition and would drown the
 * result.
 */
export function collectCitations(files) {
  const citations = [];
  for (const { path, text } of files) {
    text.split("\n").forEach((line, i) => {
      for (const id of line.match(ID) ?? []) citations.push({ id, path, line: i + 1 });
    });
  }
  return citations;
}

/* ── The checks ──────────────────────────────────────────────────────────── */

/**
 * All findings, split into what fails the run and what is only reported.
 * Pure: it takes parsed input and returns text, so the self-test can feed it
 * invented registers without touching the disk.
 */
export function check({ register, citations, files = [] }) {
  const errors = [];
  const hints = [];
  const at = (line) => `${REGISTER}:${line}`;

  if (!register.hasTables) {
    errors.push(`${REGISTER} — Register- oder Fundstellen-Tabelle nicht gefunden (Spaltenköpfe „Kennung/Zustand/Bedient von" und „Kennung/Datei/Abschnitt").`);
    return { errors, hints };
  }
  if (!register.hasSwitch) {
    errors.push(`${REGISTER} — die Kopfzeile „| Kennungen in Profilen | … |" fehlt; ohne sie weiß der Wächter nicht, ob Prüfung 2 scharf ist.`);
  }

  // Structure: without it the three checks below would report on rubble.
  const seen = new Map();
  register.entries.forEach((entry, index) => {
    const expected = `J-${String(index + 1).padStart(2, "0")}`;
    if (!/^J-\d{2}$/.test(entry.id ?? "")) {
      errors.push(`${at(entry.line)} — „${entry.id}" ist keine Kennung der Form J-nn.`);
      return;
    }
    if (seen.has(entry.id)) {
      errors.push(`${at(entry.line)} — ${entry.id} steht schon in Zeile ${seen.get(entry.id)}. Kennungen sind eindeutig und werden nie wiederverwendet.`);
    }
    seen.set(entry.id, entry.line);
    if (entry.id !== expected) {
      errors.push(`${at(entry.line)} — ${entry.id} steht an der Stelle von ${expected}; die Kennungen laufen lückenlos durch.`);
    }
    if (!STATES.includes(entry.state ?? "")) {
      errors.push(`${at(entry.line)} — ${entry.id} hat den Zustand „${entry.state}"; erlaubt sind ${STATES.join(" · ")}.`);
    }
    if (!entry.frequency) {
      errors.push(`${at(entry.line)} — ${entry.id} hat keine Häufigkeit. Wo das Profil keine nennt, steht „unbekannt" — geschätzt wird nicht.`);
    }
  });

  const known = new Set(register.entries.map((e) => e.id));

  // Check 1 — every profile cites only existing ids.
  for (const { id, path, line } of citations) {
    if (!known.has(id)) {
      errors.push(`${path}:${line} — zitiert ${id}, die es im Register nicht gibt.`);
    }
  }

  // Check 3 — "no place" and `unbedient` say the same thing.
  for (const entry of register.entries) {
    const placeless = (entry.place ?? "").startsWith(NO_PLACE);
    if (entry.state === "unbedient" && !placeless) {
      errors.push(`${at(entry.line)} — ${entry.id} steht auf „unbedient", nennt aber einen Ort: „${entry.place}". Ohne Ort beginnt die Spalte mit „${NO_PLACE}".`);
    }
    if (entry.state !== "unbedient" && placeless) {
      errors.push(`${at(entry.line)} — ${entry.id} hat keinen Ort („${NO_PLACE}…"), steht aber auf „${entry.state}". Ein Job ohne Seite ist unbedient.`);
    }
  }

  // Every id needs a source location and every location an id — otherwise
  // carrying the ids into the profiles cannot be mechanical.
  const withSource = new Set(register.sources.map((s) => s.id));
  for (const entry of register.entries) {
    if (!withSource.has(entry.id)) {
      errors.push(`${at(entry.line)} — ${entry.id} hat keine Zeile in „Fundstellen"; ohne Datei und Abschnitt lässt sich die Kennung nicht nachtragen.`);
    }
  }
  const onDisk = new Set(files.map((f) => f.path));
  for (const source of register.sources) {
    if (!known.has(source.id)) {
      errors.push(`${at(source.line)} — Fundstelle für ${source.id}, die es im Register nicht gibt.`);
    }
    if (onDisk.size && source.file && !onDisk.has(source.file)) {
      errors.push(`${at(source.line)} — Fundstelle ${source.id} nennt „${source.file}"; die Datei ist kein Profil unter ${PROFILE_DIRS.join(" / ")}.`);
    }
  }

  // Check 2 — every `bedient` job is cited by at least one profile.
  // A hint before the switch is flipped, an error after.
  const cited = new Set(citations.map((c) => c.id));
  const uncited = register.entries.filter((e) => e.state === "bedient" && !cited.has(e.id));
  if (uncited.length) {
    const list = uncited.map((e) => e.id).join(", ");
    if (register.armed) {
      for (const entry of uncited) {
        errors.push(`${at(entry.line)} — ${entry.id} steht auf „bedient", wird aber von keinem Profil zitiert. Entweder trägt das Profil die Kennung, oder der Zustand stimmt nicht.`);
      }
    } else {
      hints.push(
        `${uncited.length} von ${register.entries.filter((e) => e.state === "bedient").length} „bedient"-Jobs werden noch von keinem Profil zitiert: ${list}.`,
      );
      hints.push(
        `Das ist der Übergangszustand: die Kopfzeile sagt „Kennungen in Profilen | noch nicht eingetragen". Wer die Kennungen einträgt, setzt sie in derselben Änderung auf „eingetragen" — dann wird aus diesem Hinweis ein Fehler.`,
      );
    }
  }

  return { errors, hints };
}

/* ── Self-test: invented cases that test the guard, not the register. `--test` ── */

const HEAD_ARMED = "| Kennungen in Profilen | eingetragen |\n|---|---|\n\n";
const HEAD_OPEN = "| Kennungen in Profilen | noch nicht eingetragen |\n|---|---|\n\n";

/** A register of invented jobs, written the way `docs/jobs.md` writes them. */
function fixture(head, rows, sources) {
  return (
    head +
    "| Kennung | Rolle | Häufigkeit | Bedient von | Zustand |\n" +
    "|---|---|---|---|---|\n" +
    rows.join("\n") +
    "\n\n| Kennung | Datei | Abschnitt |\n|---|---|---|\n" +
    sources.join("\n") +
    "\n"
  );
}

const ROW_OK = "| J-01 | Prüferin | täglich | Testseite, Rang 1 | bedient |";
const ROW_PLACELESS = "| J-02 | Prüferin | selten | — Seite am 2026-01-01 gelöscht | unbedient |";
const SRC_01 = "| J-01 | `docs/seiten/test.md` | Job |";
const SRC_02 = "| J-02 | `docs/seiten/test.md` | Nebenjobs |";

function selfTest() {
  const run = (markdown, citations = [], files = []) =>
    check({ register: parseRegister(markdown), citations, files });

  const cases = [
    [
      "sauberes Register, Kennungen zitiert",
      () => run(fixture(HEAD_ARMED, [ROW_OK, ROW_PLACELESS], [SRC_01, SRC_02]), [
        { id: "J-01", path: "docs/seiten/test.md", line: 3 },
      ]),
      { errors: 0, hints: 0 },
    ],
    [
      "Prüfung 1: Profil zitiert eine Kennung, die es nicht gibt",
      () => run(fixture(HEAD_ARMED, [ROW_OK, ROW_PLACELESS], [SRC_01, SRC_02]), [
        { id: "J-01", path: "docs/seiten/test.md", line: 3 },
        { id: "J-99", path: "docs/seiten/test.md", line: 9 },
      ]),
      { errors: 1, hints: 0 },
    ],
    [
      "Prüfung 2 scharf: bedient, aber von keinem Profil zitiert",
      () => run(fixture(HEAD_ARMED, [ROW_OK, ROW_PLACELESS], [SRC_01, SRC_02]), []),
      { errors: 1, hints: 0 },
    ],
    [
      "Prüfung 2 im Übergang: derselbe Fall ist ein Hinweis, kein Fehler",
      () => run(fixture(HEAD_OPEN, [ROW_OK, ROW_PLACELESS], [SRC_01, SRC_02]), []),
      { errors: 0, hints: 2 },
    ],
    [
      "Prüfung 3: unbedient, nennt aber einen Ort",
      () =>
        run(
          fixture(
            HEAD_ARMED,
            [ROW_OK, "| J-02 | Prüferin | selten | Testseite, Rang 2 | unbedient |"],
            [SRC_01, SRC_02],
          ),
          [{ id: "J-01", path: "docs/seiten/test.md", line: 3 }],
        ),
      { errors: 1, hints: 0 },
    ],
    [
      "Prüfung 3: ohne Ort, aber nicht unbedient",
      () =>
        run(
          fixture(
            HEAD_ARMED,
            [ROW_OK, "| J-02 | Prüferin | selten | — kein Ort | halb |"],
            [SRC_01, SRC_02],
          ),
          [{ id: "J-01", path: "docs/seiten/test.md", line: 3 }],
        ),
      { errors: 1, hints: 0 },
    ],
    [
      "doppelte Kennung",
      () =>
        run(
          fixture(
            HEAD_ARMED,
            [ROW_OK, "| J-01 | Prüferin | selten | Testseite, Rang 2 | halb |"],
            [SRC_01],
          ),
          [{ id: "J-01", path: "docs/seiten/test.md", line: 3 }],
        ),
      // duplicate + gap (J-01 where J-02 should be)
      { errors: 2, hints: 0 },
    ],
    [
      "unbekannter Zustand",
      () =>
        run(fixture(HEAD_ARMED, ["| J-01 | Prüferin | täglich | Testseite | fast |"], [SRC_01]), [
          { id: "J-01", path: "docs/seiten/test.md", line: 3 },
        ]),
      { errors: 1, hints: 0 },
    ],
    [
      "leere Häufigkeit",
      () =>
        run(fixture(HEAD_ARMED, ["| J-01 | Prüferin |  | Testseite | bedient |"], [SRC_01]), [
          { id: "J-01", path: "docs/seiten/test.md", line: 3 },
        ]),
      { errors: 1, hints: 0 },
    ],
    [
      "Kennung ohne Fundstelle",
      () =>
        run(fixture(HEAD_ARMED, [ROW_OK], []), [
          { id: "J-01", path: "docs/seiten/test.md", line: 3 },
        ]),
      { errors: 1, hints: 0 },
    ],
    [
      "Fundstelle nennt eine Datei, die kein Profil ist",
      () =>
        run(
          fixture(HEAD_ARMED, [ROW_OK], ["| J-01 | `docs/seiten/gibtsnicht.md` | Job |"]),
          [{ id: "J-01", path: "docs/seiten/test.md", line: 3 }],
          [{ path: "docs/seiten/test.md" }],
        ),
      { errors: 1, hints: 0 },
    ],
    [
      "fehlende Kopfzeile schaltet nicht still scharf",
      () =>
        run(fixture("", [ROW_OK], [SRC_01]), [
          { id: "J-01", path: "docs/seiten/test.md", line: 3 },
        ]),
      { errors: 1, hints: 0 },
    ],
  ];

  let bad = 0;
  for (const [name, run_, expected] of cases) {
    const { errors, hints } = run_();
    if (errors.length !== expected.errors || hints.length !== expected.hints) {
      bad++;
      console.error(
        `  ✗ ${name}: erwartet ${expected.errors} Fehler / ${expected.hints} Hinweise, ` +
          `gemessen ${errors.length} / ${hints.length}`,
      );
      for (const e of [...errors, ...hints]) console.error(`      ${e}`);
    }
  }

  // The cell splitter on its own: an escaped `|` must not open a column.
  const splitCases = [
    ["schlichte Zeile", "| a | b | c |", ["a", "b", "c"]],
    ["maskiertes Rohr", '| a | "x" \\| "y" | c |', ["a", '"x" | "y"', "c"]],
    ["leere Zelle", "| a |  | c |", ["a", "", "c"]],
  ];
  for (const [name, line, expected] of splitCases) {
    const measured = splitRow(line);
    if (JSON.stringify(measured) !== JSON.stringify(expected)) {
      bad++;
      console.error(`  ✗ ${name}: erwartet ${JSON.stringify(expected)}, gemessen ${JSON.stringify(measured)}`);
    }
  }

  const total = cases.length + splitCases.length;
  if (bad) {
    console.error(`\ncheck:jobs — Selbstprüfung: ${bad} von ${total} Fällen falsch.`);
    process.exit(1);
  }
  console.log(`check:jobs — Selbstprüfung in Ordnung, ${total} Fälle.`);
}

/* ── Run ───────────────────────────────────────────────────────────────── */

/** All profiles, without the templates — a template is a form, not a profile. */
function profiles() {
  const out = [];
  for (const dir of PROFILE_DIRS) {
    const full = join(ROOT, dir);
    if (!existsSync(full)) continue;
    for (const name of readdirSync(full)) {
      if (!name.endsWith(".md") || name === "TEMPLATE.md") continue;
      const path = `${dir}/${name}`;
      out.push({ path, text: readFileSync(join(ROOT, path), "utf8") });
    }
  }
  return out;
}

if (process.argv[2] === "--test") {
  selfTest();
  process.exit(0);
}

const registerPath = join(ROOT, REGISTER);
if (!existsSync(registerPath)) {
  console.error(`✗ ${REGISTER} fehlt — das Register ist die Quelle dieses Wächters.`);
  process.exit(1);
}

const files = profiles();
const register = parseRegister(readFileSync(registerPath, "utf8"));
const { errors, hints } = check({
  register,
  citations: collectCitations(files),
  files,
});

for (const hint of hints) console.log(`  · ${hint}`);

if (errors.length) {
  for (const error of errors) console.error(`  ✗ ${error}`);
  console.error(
    `\ncheck:jobs — ${errors.length} Befund(e). Die Regeln stehen in ${REGISTER}\n` +
      `(„Wie die Zeilen zu lesen sind" und „Pflegeregel"): neuer Job → erst\n` +
      `Register, dann Profil; fällt eine Seite weg, bleibt der Job und wird\n` +
      `unbedient.`,
  );
  process.exit(1);
}

const byState = Object.fromEntries(
  STATES.map((state) => [state, register.entries.filter((e) => e.state === state).length]),
);
console.log(
  `check:jobs — in Ordnung. ${register.entries.length} Jobs in ${REGISTER} ` +
    `(bedient ${byState.bedient} · halb ${byState.halb} · unbedient ${byState.unbedient}), ` +
    `${files.length} Profile gelesen, Prüfung 2 ${register.armed ? "scharf" : "im Übergang"}.`,
);
