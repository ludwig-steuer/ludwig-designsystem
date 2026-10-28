import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { TECHNICAL_END_CAUSES } from "./agent-run-end";

/**
 * F480 — Auffälligkeiten eines Agent-Schritts als reine Regeln (ohne DB): was
 * die Übersicht der Schritt-Seite oben zeigt. Dazu die Schwellen, die Liste und
 * Seite gemeinsam nutzen (F436), und die Balken des Verlaufs.
 */

/* ── Schwellen (F436) ─────────────────────────────────────────────────── */

/** Ohne MCP-Aufruf seit so langer Zeit gilt ein offener Schritt als still. */
export const STEP_IDLE_WARNING_MS = 10 * 60_000;
/** Fehlerquote eines Werkzeugs, ab der es als Warnung markiert wird (Anteil, nicht Prozent). */
export const TOOL_ERROR_RATE_WARNING = 0.1;
/**
 * Zielgrenze für eine MCP-Antwort. Ab 50.000 Zeichen legt Claude Code die
 * Antwort in eine Datei; Agenten ohne Dateizugriff können sie nicht lesen (P63).
 */
export const RESULT_CHARS_LIMIT = 45_000;
/** Ab so vielen Fehlern desselben Werkzeugs unmittelbar hintereinander: Warnung. */
export const ERROR_STREAK_WARNING = 3;
/** Ab dieser Dauer gilt ein Werkzeugaufruf als langsam. */
export const SLOW_CALL_MS = 30_000;

/** Seit dem letzten Aufruf (ohne Aufruf: seit Start) länger als 10 Minuten still. */
export function isStepIdle(step: { startedAt: string; lastCallAt: string | null }, now: number = Date.now()): boolean {
  return now - new Date(step.lastCallAt ?? step.startedAt).getTime() > STEP_IDLE_WARNING_MS;
}

export function isErrorRateHigh(calls: number, errors: number): boolean {
  return calls > 0 && errors / calls > TOOL_ERROR_RATE_WARNING;
}

export function exceedsResultCharsLimit(maxResultChars: number | null): boolean {
  return maxResultChars !== null && maxResultChars > RESULT_CHARS_LIMIT;
}

/* ── Eingabe ──────────────────────────────────────────────────────────── */

/** Ein MCP-Aufruf des Schritts, schmal — Grundlage für Übersicht und Verlauf. */
export interface AgentRunStepCallPoint {
  calledAt: string;
  toolName: string;
  outcome: string;
  durationMs: number;
  resultChars: number | null;
  /** Auf 160 Zeichen gekürzt. */
  errorMessage: string | null;
}

/** Ein Gate des Schritts (`client_agent_run_step_gates`). */
export interface AgentRunStepGate {
  gateCode: string;
  enteredAt: string;
  completedAt: string | null;
  /** passed · auto_passed · blocked · overridden · unresolved; NULL = offen. */
  gateResult: string | null;
  blockedReason: string | null;
  /** `override_reason.reason` — der Satz der Ausnahme. */
  overrideReason: string | null;
  gateNote: string | null;
  /** F500: offene Zahl beim Abschließen der Zeile (z. B. Sätze bei der Übergabe an den Judge-Schritt). */
  gateOpenCount?: number | null;
}

export interface StepFindingsInput {
  startedAt: string;
  finishedAt: string | null;
  harness: string | null;
  outcome: string | null;
  endCause: string | null;
  retryOfStepId: string | null;
  /** Ungekürzte Zusammenfassung — `detail` bei `incomplete`. */
  summary: string | null;
  /** Gemeldeter Verbrauch (`stats.usage`); NULL = nicht gemeldet. */
  usage: unknown;
  /** F529: Antworten anderer Modelle als angefragt (`stats.usage.unexpectedModels`). */
  unexpectedModels?: readonly { model: string; answers: number }[];
  logTail: string | null;
  gates: readonly AgentRunStepGate[];
  /** Zeitlich sortiert (`called_at, id`). */
  calls: readonly AgentRunStepCallPoint[];
  now: number;
}

/* ── Ausgabe ──────────────────────────────────────────────────────────── */

export const STEP_FINDING_CODES = [
  "technical_end",
  "incomplete",
  "failed",
  "tool_errors",
  "error_streak",
  "result_too_large",
  "idle_gap",
  "slow_call",
  "gate_blocked",
  "gate_overridden",
  "usage_missing",
  "model_mismatch",
  "log_missing",
  "retry",
] as const;
export type StepFindingCode = (typeof STEP_FINDING_CODES)[number];

export const STEP_FINDING_SEVERITIES = ["error", "warning", "info"] as const;
export type StepFindingSeverity = (typeof STEP_FINDING_SEVERITIES)[number];

export interface StepFinding {
  code: StepFindingCode;
  severity: StepFindingSeverity;
  title: string;
  detail?: string;
  /** Wann es geschah (ISO). */
  at?: string;
  /** Wohin „Aufrufe ansehen" führt (Tab MCP-Aufrufe). */
  filter?: { outcome?: "error"; tool?: string; sort?: "result_chars" };
}

const TIME = new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" });
/** HH:MM in Europe/Berlin — nie die rohe UTC-Zeit. */
export const clockTime = (iso: string | number): string => TIME.format(new Date(iso));
const COUNT = new Intl.NumberFormat("de-DE");

function minutesText(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  return minutes >= 60 ? `${Math.floor(minutes / 60)} h ${minutes % 60} min` : `${minutes} min`;
}

const ms = (iso: string) => new Date(iso).getTime();
const isError = (c: AgentRunStepCallPoint) => c.outcome === "error";

/** Die Auffälligkeiten des Schritts: `error` vor `warning` vor `info`, innerhalb nach Zeit. */
export function stepFindings(input: StepFindingsInput): StepFinding[] {
  const found: StepFinding[] = [];
  const finishedAt = input.finishedAt ?? undefined;

  if (input.endCause && TECHNICAL_END_CAUSES.has(input.endCause)) {
    const cause = resolveStatus("agent_run_step_end_cause", input.endCause).label;
    found.push({ code: "technical_end", severity: "error", title: `Technisch beendet: ${cause}`, at: finishedAt });
  }
  if (input.outcome === "incomplete") {
    const detail = input.summary?.trim().slice(0, 200);
    found.push({
      code: "incomplete",
      severity: "warning",
      title: "Schritt unvollständig beendet",
      ...(detail ? { detail } : {}),
      at: finishedAt,
    });
  }
  if (input.outcome === "failed") {
    found.push({ code: "failed", severity: "error", title: "Schritt gescheitert", at: finishedAt });
  }

  found.push(...toolErrorFindings(input.calls), ...errorStreakFindings(input.calls));

  const tooLarge = input.calls.filter((c) => exceedsResultCharsLimit(c.resultChars));
  if (tooLarge.length > 0) {
    found.push({
      code: "result_too_large",
      severity: "error",
      title: `${tooLarge.length} ${tooLarge.length === 1 ? "Antwort" : "Antworten"} über ${COUNT.format(RESULT_CHARS_LIMIT)} Zeichen — für den Agenten nicht lesbar (P63)`,
      at: tooLarge[0]!.calledAt,
      filter: { sort: "result_chars" },
    });
  }

  for (const gap of idleGaps(input)) {
    found.push({
      code: "idle_gap",
      severity: "warning",
      title: `Pause ${minutesText(gap.to - gap.from)} ohne Werkzeugaufruf (${clockTime(gap.from)}–${clockTime(gap.to)})`,
      at: new Date(gap.from).toISOString(),
    });
  }

  found.push(...slowCallFindings(input.calls));

  for (const g of input.gates) {
    if (g.gateResult === "blocked" || g.gateResult === "unresolved") {
      const word = g.gateResult === "blocked" ? "blockiert" : "beim Abschluss rot";
      found.push({
        code: "gate_blocked",
        severity: "warning",
        title: `Gate ${g.gateCode} ${word}${g.blockedReason ? `: ${g.blockedReason}` : ""}`,
        ...(g.gateNote ? { detail: g.gateNote } : {}),
        at: g.enteredAt,
      });
    }
    if (g.gateResult === "overridden") {
      found.push({
        code: "gate_overridden",
        severity: "info",
        title: `Gate ${g.gateCode} übersteuert${g.overrideReason ? `: ${g.overrideReason}` : ""}`,
        at: g.completedAt ?? g.enteredAt,
      });
    }
  }

  const finishedRunner = input.harness === "claude_code" && input.finishedAt !== null;
  if (finishedRunner && input.usage == null) {
    found.push({ code: "usage_missing", severity: "info", title: "Verbrauch nicht gemeldet" });
  }
  if (input.unexpectedModels?.length) {
    const list = input.unexpectedModels
      .map((m) => `${m.model} (${m.answers} ${m.answers === 1 ? "Antwort" : "Antworten"})`)
      .join("; ");
    found.push({ code: "model_mismatch", severity: "warning", title: `Anderes Modell hat geantwortet: ${list}` });
  }
  if (finishedRunner && !input.logTail?.trim()) {
    found.push({ code: "log_missing", severity: "info", title: "Kein Harness-Protokoll übertragen" });
  }
  if (input.retryOfStepId) {
    found.push({ code: "retry", severity: "info", title: "Wiederholung eines abgebrochenen Schritts" });
  }

  const rank = (f: StepFinding) => STEP_FINDING_SEVERITIES.indexOf(f.severity);
  // Ohne Zeitpunkt vor den datierten — es betrifft den ganzen Schritt.
  const time = (f: StepFinding) => (f.at ? ms(f.at) : Number.NEGATIVE_INFINITY);
  return found.sort((a, b) => rank(a) - rank(b) || time(a) - time(b));
}

/** Je Werkzeug mit Fehlern: Anzahl, Quote, häufigster Fehlertext. */
function toolErrorFindings(calls: readonly AgentRunStepCallPoint[]): StepFinding[] {
  const byTool = new Map<string, AgentRunStepCallPoint[]>();
  for (const c of calls) byTool.set(c.toolName, [...(byTool.get(c.toolName) ?? []), c]);
  const out: StepFinding[] = [];
  for (const [tool, toolCalls] of byTool) {
    const errors = toolCalls.filter(isError);
    if (errors.length === 0) continue;
    const texts = new Map<string, number>();
    for (const e of errors) if (e.errorMessage) texts.set(e.errorMessage, (texts.get(e.errorMessage) ?? 0) + 1);
    const commonest = [...texts].sort((a, b) => b[1] - a[1])[0]?.[0];
    out.push({
      code: "tool_errors",
      severity: isErrorRateHigh(toolCalls.length, errors.length) ? "warning" : "info",
      title: `${tool}: ${errors.length} Fehler von ${toolCalls.length} ${toolCalls.length === 1 ? "Aufruf" : "Aufrufen"}`,
      ...(commonest ? { detail: commonest } : {}),
      at: errors[0]!.calledAt,
      filter: { outcome: "error", tool },
    });
  }
  return out;
}

/** Dasselbe Werkzeug mehrmals unmittelbar hintereinander mit Fehler — eine Folge, ein Eintrag. */
function errorStreakFindings(calls: readonly AgentRunStepCallPoint[]): StepFinding[] {
  const out: StepFinding[] = [];
  let start = 0;
  for (let i = 1; i <= calls.length; i++) {
    const head = calls[start]!;
    const same = i < calls.length && isError(calls[i]!) && calls[i]!.toolName === head.toolName;
    if (same && isError(head)) continue;
    const length = i - start;
    if (isError(head) && length >= ERROR_STREAK_WARNING) {
      out.push({
        code: "error_streak",
        severity: "warning",
        title: `${head.toolName} ${length}× hintereinander gescheitert`,
        at: head.calledAt,
      });
    }
    start = i;
  }
  return out;
}

/** Je Werkzeug die Aufrufe über SLOW_CALL_MS. */
function slowCallFindings(calls: readonly AgentRunStepCallPoint[]): StepFinding[] {
  const byTool = new Map<string, AgentRunStepCallPoint[]>();
  for (const c of calls) if (c.durationMs > SLOW_CALL_MS) byTool.set(c.toolName, [...(byTool.get(c.toolName) ?? []), c]);
  return [...byTool].map(([tool, slow]) => {
    const maxSeconds = Math.round(Math.max(...slow.map((c) => c.durationMs)) / 1000);
    return {
      code: "slow_call",
      severity: "info",
      title: `${tool}: ${slow.length} ${slow.length === 1 ? "Aufruf" : "Aufrufe"} über ${SLOW_CALL_MS / 1000} s (max. ${maxSeconds} s)`,
      at: slow[0]!.calledAt,
    } satisfies StepFinding;
  });
}

/** Pausen über STEP_IDLE_WARNING_MS: Start → erster Aufruf, zwischen Aufrufen, letzter Aufruf → Ende bzw. jetzt. */
export function idleGaps(input: Pick<StepFindingsInput, "startedAt" | "finishedAt" | "calls" | "now">): { from: number; to: number }[] {
  const end = input.finishedAt ? ms(input.finishedAt) : input.now;
  const points = [ms(input.startedAt), ...input.calls.map((c) => ms(c.calledAt)), end];
  const gaps: { from: number; to: number }[] = [];
  for (let i = 1; i < points.length; i++) {
    if (points[i]! - points[i - 1]! > STEP_IDLE_WARNING_MS) gaps.push({ from: points[i - 1]!, to: points[i]! });
  }
  return gaps;
}

/* ── Verlauf ──────────────────────────────────────────────────────────── */

/** Mögliche Abschnittslängen in Minuten — die kleinste mit höchstens MAX_BUCKETS Balken gilt. */
export const STEP_BUCKET_MINUTES = [1, 2, 5, 10, 15, 30, 60] as const;
const MAX_BUCKETS = 60;

export interface StepCallBucket {
  /** Beginn des Abschnitts (ISO). */
  start: string;
  ok: number;
  errors: number;
}

/** Aufrufe je Zeitabschnitt von Start bis Ende; leere Abschnitte bleiben als 0 stehen, sonst verschwinden die Pausen. */
export function stepCallBuckets(
  calls: readonly AgentRunStepCallPoint[],
  startedAt: string,
  endAt: string | number,
): StepCallBucket[] {
  const from = ms(startedAt);
  const span = Math.max(0, new Date(endAt).getTime() - from);
  const minutes = STEP_BUCKET_MINUTES.find((m) => Math.ceil(span / (m * 60_000)) <= MAX_BUCKETS) ?? 60;
  const width = minutes * 60_000;
  const count = Math.max(1, Math.ceil(span / width));
  const buckets: StepCallBucket[] = Array.from({ length: count }, (_, i) => ({
    start: new Date(from + i * width).toISOString(),
    ok: 0,
    errors: 0,
  }));
  for (const c of calls) {
    const bucket = buckets[Math.min(count - 1, Math.max(0, Math.floor((ms(c.calledAt) - from) / width)))]!;
    if (isError(c)) bucket.errors++;
    else bucket.ok++;
  }
  return buckets;
}
