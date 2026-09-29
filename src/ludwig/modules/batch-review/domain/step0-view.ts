/**
 * F315 — Schritt 0 „Ergebnis des Stapels" als reine Ableitung (DS 0208, Brief
 * F314): ein Urteil, eine Aufgabenliste, der Bericht mit den Auffälligkeiten
 * zuerst. Liest dieselbe Freigabe-Checkliste wie Schritt 8 (`agent-done.ts`)
 * und rechnet „offen" nicht ein zweites Mal. Kein IO, keine Uhr.
 */
import { matchesBatchFilter } from "@/ludwig/modules/datev-export";

import { agentRows, agentSettled } from "./agent-done";
import type { ChecklistRow } from "./checklist";

export interface Step0Task {
  key: string;
  label: string;
  /** „228 von 231" — die echte Menge; Ja/Nein-Zeilen „erledigt"/„offen". */
  counter: string;
  /** Das erste offene Beispiel bzw. „davon n mit Rückfrage statt Buchung". */
  sub?: string;
  level: "warning" | "error";
  jump: { label: string; href: string };
}

export interface Step0Coverage {
  complete: boolean;
  sentence: string;
  jump?: { label: string; href: string };
}

export interface Step0Report {
  /** Die Punkte des Abschnitts „Auffälligkeiten", Markdown ohne Marker. */
  findings: string[];
  /** Alle übrigen Abschnitte samt Überschriften, in Ursprungsreihenfolge. */
  rest: string;
}

export interface Step0View {
  kind: "regular" | "client_batch";
  run: {
    state: "running" | "done" | "none";
    number: number;
    startedAt: string | null;
    finishedAt: string | null;
    /** Die Rückgabe der Kanzlei, die diesem Durchgang voranging; sonst null. */
    afterReturnAt: string | null;
  };
  handedOver: boolean;
  incomplete: { at: string; reason: string } | null;
  open: Step0Task[];
  done: Step0Task[];
  coverage: Step0Coverage | null;
  report: Step0Report | null;
}

export interface Step0Input {
  kind: "regular" | "client_batch";
  state: string;
  /** Ende des Stapel-Zeitraums (ISO-Tag) — Maß der Vollständigkeit. */
  periodTo: string;
  rows: readonly ChecklistRow[];
  facts: { bookedTo: string | null } | null;
  masterdata: { blocked: boolean; unknownAccounts: readonly unknown[]; placeholderAccounts: readonly unknown[] } | null;
  /** Die Durchgänge **dieses** Stapels. */
  runs: readonly { startedAt: string; finishedAt: string | null }[];
  incomplete: { at: string; reason: string } | null;
  lastReport: string | null;
  lastReturnedAt: string | null;
  /** `…/batches/<id>/review` — Anker jedes Sprungs. */
  reviewBase: string;
}

/** Postgres-Text („2026-09-08 18:00:00+00") oder ISO → Millisekunden. */
function instant(ts: string): number {
  return Date.parse(ts.replace(" ", "T").replace(/([T].*[+-]\d{2})$/, "$1:00"));
}

const DAY_MS = 86_400_000;
const dayMs = (isoDay: string) => Date.parse(`${isoDay.slice(0, 10)}T00:00:00Z`);
const dayText = (isoDay: string) => `${isoDay.slice(8, 10)}.${isoDay.slice(5, 7)}.${isoDay.slice(0, 4)}`;

function task(r: ChecklistRow, reviewBase: string): Step0Task {
  const settled = agentSettled(r);
  const first = r.items[0];
  const sub = !settled
    ? first
      ? `${first.note ?? first.text}${r.items.length > 1 ? ` (und ${r.items.length - 1} weitere)` : ""}`
      : undefined
    : r.asked
      ? `davon ${r.asked} mit Rückfrage statt Buchung`
      : undefined;
  return {
    key: r.key,
    label: r.label,
    // Gate-Zeilen sind ja/nein — ein „0 von 1" wäre erfunden.
    counter: r.total > 1 ? `${r.agentDone ?? r.done} von ${r.total}` : settled ? "erledigt" : "offen",
    ...(sub ? { sub } : {}),
    level: r.level === "warn" ? "warning" : "error",
    jump: { label: r.jumpLabel ?? `Schritt ${r.jumpStep}`, href: `${reviewBase}/${r.jumpHref ?? r.jumpStep}` },
  };
}

function coverage(input: Step0Input): Step0Coverage | null {
  const step1 = { label: "Schritt 1", href: `${input.reviewBase}/1` };
  if (input.kind === "client_batch") {
    const m = input.masterdata;
    if (!m) return null;
    if (!m.blocked) return { complete: true, sentence: "Personenkonten vollständig." };
    const n = m.unknownAccounts.length + m.placeholderAccounts.length;
    return {
      complete: false,
      sentence: `${n} ${n === 1 ? "Personenkonto" : "Personenkonten"} ohne Namen.`,
      jump: { label: "Stammdaten", href: `${input.reviewBase}/8` },
    };
  }
  if (!input.facts) return null;
  const to = input.facts.bookedTo;
  if (!to) return { complete: false, sentence: "Noch nichts gebucht.", jump: step1 };
  const missing = Math.round((dayMs(input.periodTo) - dayMs(to)) / DAY_MS);
  if (missing <= 0) return { complete: true, sentence: `Bank gebucht bis ${dayText(to)} — der Zeitraum ist voll.` };
  return {
    complete: false,
    sentence: `Bank gebucht bis ${dayText(to)} — ${missing} ${missing === 1 ? "Tag fehlt" : "Tage fehlen"}.`,
    jump: step1,
  };
}

const BULLET = /^\s*(?:[-*]|\d+\.)\s+(.*)$/;

/**
 * Der Übergabebericht, umgedreht: die Auffälligkeiten als Punkte vorn, alles
 * andere dahinter (Playbook „5a — Bericht"). Ohne `## `-Abschnitte ist der
 * ganze Text der Rest.
 */
export function splitReport(markdown: string): Step0Report {
  const lines = markdown.split("\n");
  const sections: { head: string | null; body: string[] }[] = [{ head: null, body: [] }];
  for (const line of lines) {
    if (line.startsWith("## ")) sections.push({ head: line, body: [] });
    else sections[sections.length - 1]!.body.push(line);
  }
  const isFindings = (s: { head: string | null }) => s.head?.slice(3).trim().toLowerCase() === "auffälligkeiten";
  const findingsSection = sections.find(isFindings);
  const findings: string[] = [];
  const body = findingsSection?.body.join("\n").trim() ?? "";
  if (body && body !== "Nichts.") {
    for (const line of findingsSection!.body) {
      const m = BULLET.exec(line);
      if (m) findings.push(m[1]!.trim());
      else if (line.trim() && findings.length > 0) findings[findings.length - 1] += `\n${line.trim()}`;
      else if (line.trim()) findings.push(line.trim());
    }
  }
  const rest = sections
    .filter((s) => !isFindings(s))
    .map((s) => [...(s.head ? [s.head] : []), ...s.body].join("\n"))
    .join("\n")
    .trim();
  return { findings, rest };
}

export function buildStep0View(input: Step0Input): Step0View {
  const runs = [...input.runs].sort((a, b) => instant(a.startedAt) - instant(b.startedAt));
  const latest = runs[runs.length - 1] ?? null;
  const agent = agentRows(input.rows);
  const tasks = agent.map((r) => ({ settled: agentSettled(r), task: task(r, input.reviewBase) }));
  const returned = input.lastReturnedAt;
  return {
    kind: input.kind,
    run: latest
      ? {
          state: latest.finishedAt === null ? "running" : "done",
          number: runs.length,
          startedAt: latest.startedAt,
          finishedAt: latest.finishedAt,
          afterReturnAt: returned && instant(returned) < instant(latest.startedAt) ? returned : null,
        }
      : { state: "none", number: 0, startedAt: null, finishedAt: null, afterReturnAt: null },
    handedOver: !matchesBatchFilter(input.state, "open"),
    incomplete: input.incomplete,
    open: tasks.filter((t) => !t.settled).map((t) => t.task),
    done: tasks.filter((t) => t.settled).map((t) => t.task),
    coverage: coverage(input),
    report: input.lastReport && input.lastReport.trim() ? splitReport(input.lastReport) : null,
  };
}
