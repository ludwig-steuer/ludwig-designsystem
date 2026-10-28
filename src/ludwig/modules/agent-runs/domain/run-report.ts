import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import type { AgentRunPhase, AgentRunState, AgentRunStopReason } from "./agent-run";
import type { AgentRunStepCallPoint, StepFinding } from "./step-findings";

/**
 * F483 — die Lauf-Mail an die Plattform-Admins: eine Mail je Lauf (L-<n>), nicht je Schritt. Rein: Betreff, HTML
 * und Text aus einer typisierten Sicht (`agentRunReportView`, agent-run-report-core.ts). HTML als Tabellen-Layout mit
 * Inline-Styles, wie Mail-Clients es brauchen; keine Bilder, keine Skripte.
 */

export interface RunReportPhase {
  phase: AgentRunPhase;
  kind: "step" | "not_needed" | "not_reached";
  stepId: string | null;
  /** Registry-Achse `agent_run_step_outcome`; NULL = offen. */
  outcome: string | null;
  durationMin: number | null;
  /** Grund einer nicht nötigen oder nicht erreichten Phase. */
  reason: string | null;
  /** Rückgaben des Judge aus dem Schritt dieser Phase. */
  returns: JudgeReturns;
}

/**
 * Rückgaben des Judge (`judge_returned`) nach Adressat: an Ludwig (`audience = 'agent'`, davon behoben = nicht mehr offen
 * nach `clarificationIsOpen`, wie `decideNextPhase` zählt) und an die Kanzlei (`audience = 'accounting'`).
 */
export interface JudgeReturns {
  toAgent: number;
  fixed: number;
  toFirm: number;
}

export const NO_JUDGE_RETURNS: JudgeReturns = { toAgent: 0, fixed: 0, toFirm: 0 };

/** „an Ludwig 21 (davon behoben 21) · an die Kanzlei 4"; leer ohne Rückgabe. */
export function judgeReturnsText(r: JudgeReturns): string {
  return [
    r.toAgent ? `an Ludwig ${COUNT.format(r.toAgent)} (davon behoben ${COUNT.format(r.fixed)})` : null,
    r.toFirm ? `an die Kanzlei ${COUNT.format(r.toFirm)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

export interface RunReportStep {
  stepId: string;
  role: string;
  phase: AgentRunPhase;
  provider: string | null;
  model: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  tokensCache: number | null;
  endCause: string | null;
  /** F484 — Kennzahlen je Schritt für die Phasen im Lauf-Detail und die Liste. Registry `agent_run_step_outcome`; NULL = offen. */
  outcome: string | null;
  /** Übernahme durch die Session, sonst Anlage. */
  startedAt: string;
  finishedAt: string | null;
  durationMin: number | null;
  /** Ungekürzte Zusammenfassung des Schritts (Markdown). */
  summary: string | null;
  toolCalls: number;
  toolErrors: number;
  /** NULL = keine Kosten gemeldet. */
  costUsd: number | null;
  gatesBlocked: number;
  gatesOverridden: number;
  /** Guard-Abweisungen des Servers je B-Präfix, häufigste zuerst. */
  rejections: GuardRejection[];
  /** Rückgaben des Judge aus diesem Schritt. */
  returns: JudgeReturns;
}

export interface GuardRejection {
  /** „B7". */
  prefix: string;
  count: number;
  /** Die vollen Codes dahinter („B7_BANK_LINE_UNLINKED_TX"). */
  codes: string[];
}

/** Guard-Abweisung im Fehlertext: `[B11_COLLECTIVE_ACCOUNT_LETTER] … → …` (formatBlockers, wie TB-2). */
const GUARD_CODE = /\[(B\d+)(_[A-Z0-9_]+)\]/g;

/**
 * F484 — die Guard-Abweisungen eines Schritts aus seinen fehlgeschlagenen MCP-Aufrufen, je B-Präfix.
 * ponytail: der Fehlertext der Aufrufreihe ist auf 160 Zeichen gekürzt — ein zweiter Code im selben Fehler kann fehlen.
 */
export function guardRejections(calls: readonly AgentRunStepCallPoint[]): GuardRejection[] {
  const byPrefix = new Map<string, { count: number; codes: Set<string> }>();
  for (const c of calls) {
    if (c.outcome !== "error" || !c.errorMessage) continue;
    for (const [, prefix, rest] of c.errorMessage.matchAll(GUARD_CODE)) {
      const entry = byPrefix.get(prefix!) ?? { count: 0, codes: new Set<string>() };
      entry.count++;
      entry.codes.add(`${prefix}${rest}`);
      byPrefix.set(prefix!, entry);
    }
  }
  return [...byPrefix]
    .map(([prefix, e]) => ({ prefix, count: e.count, codes: [...e.codes].sort() }))
    .sort((a, b) => b.count - a.count || a.prefix.localeCompare(b.prefix, "de", { numeric: true }));
}

/** F541: ein Satz, den das End-Gate zurückgegeben hat. */
export interface EndGateEntry {
  /** „SV-2026-0109/E2". */
  entry: string;
  caseTitle: string | null;
  criteria: string[];
}

/**
 * F541 — Abschnitt „End-Gate" (judge-optimierung.md R6), nur mit `final_review`-Schritt: Modell, geprüfte Sätze und
 * Zahl je Verdikt; was nur das End-Gate fand (letztes reguläres Urteil im Lauf `confirmed`/`note`) und was es nach
 * einer Rückgabe im Lauf erneut beanstandet.
 */
export interface RunReportEndGate {
  /** `provider / model` aus `model_config` des Schritts. */
  model: string;
  reviewed: number;
  verdicts: { confirmed: number; note: number; returned: number };
  onlyEndGate: EndGateEntry[];
  returnedAgain: EndGateEntry[];
}

export interface RunReportFinding extends Pick<StepFinding, "severity" | "title" | "detail"> {
  stepId: string;
  role: string;
}

export interface RunReportView {
  runId: string;
  /** „L-56". */
  label: string;
  state: AgentRunState;
  stopReason: AgentRunStopReason | null;
  summary: string | null;
  clientName: string;
  datevClientNumber: string | null;
  tenantName: string;
  clientSlug: string;
  startedAt: string;
  finishedAt: string | null;
  batch: { batchId: string; description: string | null; year: number; periodFrom: string | null } | null;
  phases: RunReportPhase[];
  steps: RunReportStep[];
  figures: {
    bookings: number;
    casesCreated: number;
    casesTouched: number;
    openClarifications: number;
    judgeReturns: JudgeReturns;
    toolCalls: number;
    toolErrors: number;
    findingErrors: number;
    findingWarnings: number;
    durationMin: number | null;
    /** NULL = kein Schritt hat Kosten gemeldet. */
    costUsd: number | null;
    /** Mindestens ein Schritt hat Verbrauch gemeldet — Kosten fehlen dann nur beim Backend (z. B. deepseek). */
    usageReported: boolean;
    costIsEstimate: boolean;
  };
  /** Schwerste zuerst (stepFindings-Reihenfolge über alle Schritte). */
  findings: RunReportFinding[];
  /** Ein Schritt endete technisch (F477) — dann stehen die Log-Hinweise in der Mail. */
  technicalEnd: boolean;
  /** Umgebung für die Azure-Log-Hinweise (SENTRY_ENVIRONMENT). */
  stage: string;
  /** F541: nur wenn der Lauf einen End-Gate-Schritt hat. */
  endGate: RunReportEndGate | null;
}

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const FINDINGS_SHOWN = 5;
const BERLIN = new Intl.DateTimeFormat("de-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });
const COUNT = new Intl.NumberFormat("de-DE");
const USD = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const PERCENT = new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 1 });

/** A7: Erfolg grün, angehalten Warnung, abgebrochen Fehler — immer mit Wort. */
const TONE = {
  done: { word: "erfolgreich abgeschlossen", mark: "✓", bar: "#12b76a", bg: "#ecfdf3", fg: "#05603a" },
  stopped: { word: "angehalten", mark: "⚠", bar: "#f79009", bg: "#fffaeb", fg: "#93370d" },
  failed: { word: "abgebrochen", mark: "✗", bar: "#f04438", bg: "#fef3f2", fg: "#912018" },
  running: { word: "läuft noch", mark: "…", bar: "#98a2b3", bg: "#f9fafb", fg: "#344054" },
} as const;

const berlinTime = (iso: string | null) => (iso ? `${BERLIN.format(new Date(iso))} Uhr` : "—");

function client(view: RunReportView): string {
  return `${view.clientName}${view.datevClientNumber ? ` (${view.datevClientNumber})` : ""}`;
}

function month(view: RunReportView): string | null {
  const from = view.batch?.periodFrom;
  if (!from) return null;
  return `${MONTHS[Number(from.slice(5, 7)) - 1]} ${from.slice(0, 4)}`;
}

/** Grund eines angehaltenen oder abgebrochenen Laufs in Worten (Registry), nie der Rohwert. */
export function runEndReason(view: RunReportView): string | null {
  if (view.state === "done" || view.state === "running") return null;
  return view.stopReason ? resolveStatus("agent_run_stop_reason", view.stopReason).label : view.summary;
}

function headline(view: RunReportView): string {
  const reason = runEndReason(view);
  return `Lauf ${view.label} ${TONE[view.state].word}${reason ? `: ${reason}` : ""}`;
}

function minutes(value: number | null): string {
  return value === null ? "—" : `${Math.round(value)} min`;
}

/** `L-56 ✓ Certina Management & Consulting (61015) · Sep 2026 — 84 Buchungen, 52 min`. */
export function runReportSubject(view: RunReportView): string {
  return `${view.label} ${TONE[view.state].mark} ${runReportTitle(view)}`;
}

/** F484 — die Betreffzeile ohne Präfix (Lauf-Detail): `Certina … (61015) · Sep 2026 — 84 Buchungen, 52 min`. */
export function runReportTitle(view: RunReportView): string {
  const head = [client(view), month(view)].filter(Boolean).join(" · ");
  if (view.state === "done") {
    const bookings = `${COUNT.format(view.figures.bookings)} ${view.figures.bookings === 1 ? "Buchung" : "Buchungen"}`;
    return `${head} — ${bookings}, ${minutes(view.figures.durationMin)}`;
  }
  if (view.state === "running") return `${head} — ${TONE.running.word}`;
  return `${head} — ${TONE[view.state].word}: ${runEndReason(view) ?? "ohne Grund"}`;
}

/** Die acht Kennzahlen als (Bezeichnung, Wert) — Kacheln im HTML, Zeilen im Text. */
export function runReportFigures(view: RunReportView): [string, string][] {
  const f = view.figures;
  const errorRate = f.toolCalls ? ` (${PERCENT.format(f.toolErrors / f.toolCalls)})` : "";
  const cost =
    f.costUsd !== null
      ? `${USD.format(f.costUsd)} USD${f.costIsEstimate ? " (Schätzwert)" : ""}`
      : f.usageReported
        ? "nicht berechnet (Backend ohne Preise)"
        : "nicht gemeldet";
  return [
    ["Vorgeschlagene Buchungen", COUNT.format(f.bookings)],
    ["Sachverhalte", `${COUNT.format(f.casesCreated)} angelegt · ${COUNT.format(f.casesTouched)} bearbeitet`],
    ["Offene Klärungen", COUNT.format(f.openClarifications)],
    ["Judge-Rückgaben", judgeReturnsText(f.judgeReturns) || "keine"],
    ["Werkzeugfehler", `${COUNT.format(f.toolErrors)}${errorRate}`],
    ["Auffälligkeiten", `${COUNT.format(f.findingErrors)} Fehler · ${COUNT.format(f.findingWarnings)} ${f.findingWarnings === 1 ? "Warnung" : "Warnungen"}`],
    ["Dauer", minutes(f.durationMin)],
    ["Kosten", cost],
  ];
}

function phaseLine(p: RunReportPhase): { phase: string; outcome: string; duration: string; returns: string } {
  const reason = p.reason?.replace(/\s+/g, " ").trim() || null;
  // Der Grund einer nicht nötigen Phase sagt „Nicht nötig: …" schon selbst (runPhases).
  const outcome =
    p.kind === "step"
      ? p.outcome
        ? resolveStatus("agent_run_step_outcome", p.outcome).label
        : "läuft"
      : p.kind === "not_needed"
        ? (reason ?? "nicht nötig")
        : `nicht erreicht${reason ? ` — ${reason}` : ""}`;
  return {
    phase: resolveStatus("agent_run_phase", p.phase).label,
    outcome,
    duration: p.kind === "step" ? minutes(p.durationMin) : "—",
    returns: judgeReturnsText(p.returns),
  };
}

/** F541: Zeilen des Abschnitts „End-Gate" — HTML und Text teilen sie. */
export function endGateLines(g: RunReportEndGate): { summary: string; lists: [string, string[]][] } {
  const v = g.verdicts;
  const entryLine = (e: EndGateEntry) =>
    [e.entry, e.caseTitle, e.criteria.length ? `Kriterien ${e.criteria.join(", ")}` : null].filter(Boolean).join(" · ");
  return {
    summary:
      `Modell ${g.model} · ${COUNT.format(g.reviewed)} ${g.reviewed === 1 ? "Satz" : "Sätze"} geprüft · ` +
      `bestätigt ${COUNT.format(v.confirmed)}, mit Hinweis ${COUNT.format(v.note)}, zurückgegeben ${COUNT.format(v.returned)}`,
    lists: [
      ["Nur End-Gate", g.onlyEndGate.map(entryLine)],
      ["Erneut beanstandet", g.returnedAgain.map(entryLine)],
    ],
  };
}

const runUrl = (view: RunReportView, appUrl: string) => `${appUrl}/admin/agent-runs/${view.runId}`;
const stepUrl = (view: RunReportView, appUrl: string, stepId: string) => `${runUrl(view, appUrl)}/steps/${stepId}`;
const batchUrl = (view: RunReportView, appUrl: string) =>
  view.batch ? `${appUrl}/clients/${view.clientSlug}/${view.batch.year}/batches/${view.batch.batchId}` : null;

function logHints(stage: string): string[] {
  return [
    `Container-Logs: Azure Portal → Container Apps Job caj-ludwig-${stage}-agent-runner → Ausführungsverlauf,`,
    `oder per CLI: az containerapp job logs show -n caj-ludwig-${stage}-agent-runner -g rg-ludwig-${stage} ` +
      `--container agent-runner --subscription ludwig-${stage}`,
    "Das Ende des Runner-Protokolls steht an jedem Schritt (Admin → Schritt → Protokoll).",
  ];
}

function context(view: RunReportView): string {
  return [
    client(view),
    view.tenantName,
    view.batch ? `Stapel ${view.batch.description ?? view.batch.batchId}` : null,
    `${berlinTime(view.startedAt)} bis ${berlinTime(view.finishedAt)}`,
  ]
    .filter(Boolean)
    .join(" · ");
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Markdown der Lauf-Zusammenfassung → einfache Absätze (escaped, Zeilenumbrüche bleiben). */
function paragraphs(markdown: string | null): string {
  if (!markdown?.trim()) return `<p style="margin:0 0 8px;color:#667085">Der Lauf hat keine Zusammenfassung gemeldet.</p>`;
  return markdown
    .trim()
    .split(/\n\s*\n/)
    .map((p) => `<p style="margin:0 0 8px">${esc(p.replace(/[*_`#>]+/g, "").trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const H2 = "margin:24px 0 8px;font-size:15px;color:#101828";

function button(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;margin:0 8px 8px 0;padding:9px 16px;border-radius:6px;` +
    `background:#1d2939;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600">${esc(label)}</a>`;
}

function endGateHtml(g: RunReportEndGate): string {
  const { summary, lists } = endGateLines(g);
  return `<h2 style="${H2}">End-Gate</h2><p style="margin:0 0 8px">${esc(summary)}</p>` +
    lists
      .map(
        ([title, items]) =>
          `<div style="font-weight:600;margin:8px 0 4px">${esc(title)}</div>` +
          (items.length
            ? `<ul style="margin:0;padding-left:18px">${items.map((i) => `<li style="margin:0 0 4px">${esc(i)}</li>`).join("")}</ul>`
            : `<p style="margin:0;color:#667085">keine</p>`),
      )
      .join("");
}

export function renderRunReportHtml(view: RunReportView, appUrl: string): string {
  const tone = TONE[view.state];
  const phases = view.phases
    .map((p) => {
      const line = phaseLine(p);
      const grey = p.kind !== "step" ? "color:#98a2b3;" : "";
      return `<tr><td style="padding:4px 8px 4px 0;${grey}">${esc(line.phase)}</td>` +
        `<td style="padding:4px 8px;${grey}">${esc(line.outcome)}</td>` +
        `<td style="padding:4px 8px;text-align:right;white-space:nowrap;${grey}">${esc(line.duration)}</td>` +
        `<td style="padding:4px 0 4px 8px;${grey}">${esc(line.returns)}</td></tr>`;
    })
    .join("");
  const figures = runReportFigures(view);
  const tiles = [0, 4]
    .map(
      (start) =>
        `<tr>${figures
          .slice(start, start + 4)
          .map(
            ([label, value]) =>
              `<td width="25%" style="padding:10px;border:1px solid #e4e7ec;vertical-align:top">` +
              `<div style="font-size:12px;color:#667085">${esc(label)}</div>` +
              `<div style="font-size:16px;font-weight:600;color:#101828;margin-top:4px">${esc(value)}</div></td>`,
          )
          .join("")}</tr>`,
    )
    .join("");
  const findings = view.findings.slice(0, FINDINGS_SHOWN);
  const findingList = findings.length
    ? `<ul style="margin:0;padding-left:18px">${findings
        .map(
          (f) =>
            `<li style="margin:0 0 6px"><strong>${esc(f.severity === "error" ? "Fehler" : f.severity === "warning" ? "Warnung" : "Hinweis")}:</strong> ` +
            `${esc(f.title)}${f.detail ? ` <span style="color:#667085">— ${esc(f.detail)}</span>` : ""} ` +
            `<a href="${esc(stepUrl(view, appUrl, f.stepId))}" style="color:#175cd3">Schritt ${esc(f.role)}</a></li>`,
        )
        .join("")}</ul>`
    : `<p style="margin:0">Keine Auffälligkeiten.</p>`;
  const batch = batchUrl(view, appUrl);
  const stepLinks = view.steps
    .map(
      (s, i) =>
        `<a href="${esc(stepUrl(view, appUrl, s.stepId))}" style="color:#175cd3">Schritt ${i + 1} · ${esc(s.role)} ` +
        `(${esc(resolveStatus("agent_run_phase", s.phase).label)})</a>`,
    )
    .join(" · ");
  const tech = view.steps
    .map(
      (s, i) =>
        `Schritt ${i + 1} ${esc(s.role)}: ${esc(s.provider ?? "—")} / ${esc(s.model ?? "—")} · Tokens ` +
        `${s.tokensIn === null ? "—" : COUNT.format(s.tokensIn)} ein, ${s.tokensOut === null ? "—" : COUNT.format(s.tokensOut)} aus` +
        `${s.tokensCache ? `, ${COUNT.format(s.tokensCache)} aus dem Cache` : ""}`,
    )
    .join("<br>");
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">` +
    `<title>${esc(runReportSubject(view))}</title></head>` +
    `<body style="margin:0;padding:0;background:#f2f4f7;font-family:${FONT};color:#101828">` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7"><tr><td align="center" style="padding:24px 12px">` +
    `<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;border:1px solid #e4e7ec;border-radius:8px">` +
    `<tr><td style="height:6px;background:${tone.bar};border-radius:8px 8px 0 0;font-size:0;line-height:0">&nbsp;</td></tr>` +
    `<tr><td style="padding:20px 24px;background:${tone.bg}">` +
    `<div style="font-size:12px;font-weight:600;letter-spacing:.02em;color:${tone.fg};text-transform:uppercase">${esc(tone.word)}</div>` +
    `<div style="font-size:20px;font-weight:700;margin-top:4px;color:#101828">${esc(headline(view))}</div>` +
    `<div style="font-size:13px;color:#475467;margin-top:6px">${esc(context(view))}</div></td></tr>` +
    `<tr><td style="padding:4px 24px 24px;font-size:14px;line-height:1.5">` +
    `<h2 style="${H2}">Was passiert ist</h2>${paragraphs(view.summary)}` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;margin-top:8px">${phases}</table>` +
    `<h2 style="${H2}">Kennzahlen</h2>` +
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${tiles}</table>` +
    (view.endGate ? endGateHtml(view.endGate) : "") +
    `<h2 style="${H2}">Auffälligkeiten</h2>${findingList}` +
    `<h2 style="${H2}">Links</h2><div>${button(runUrl(view, appUrl), "Lauf ansehen")}${batch ? button(batch, "Stapel ansehen") : ""}</div>` +
    `<div style="font-size:13px;margin-top:4px">${stepLinks}</div>` +
    `<h2 style="${H2};font-size:13px;color:#667085">Technik</h2>` +
    `<div style="font-size:12px;color:#667085">${tech}${view.technicalEnd ? `<br><br>${logHints(view.stage).map(esc).join("<br>")}` : ""}</div>` +
    `</td></tr></table></td></tr></table></body></html>`;
}

function endGateText(g: RunReportEndGate): string[] {
  const { summary, lists } = endGateLines(g);
  return [
    "END-GATE",
    summary,
    ...lists.flatMap(([title, items]) => [`${title}:`, ...(items.length ? items.map((i) => `- ${i}`) : ["- keine"])]),
    "",
  ];
}

export function renderRunReportText(view: RunReportView, appUrl: string): string {
  const batch = batchUrl(view, appUrl);
  const findings = view.findings.slice(0, FINDINGS_SHOWN);
  const lines = [
    headline(view),
    context(view),
    "",
    "WAS PASSIERT IST",
    view.summary?.trim() || "Der Lauf hat keine Zusammenfassung gemeldet.",
    "",
    ...view.phases.map((p) => {
      const l = phaseLine(p);
      return `- ${l.phase}: ${l.outcome}${p.kind === "step" ? `, ${l.duration}` : ""}${l.returns ? `, ${l.returns}` : ""}`;
    }),
    "",
    "KENNZAHLEN",
    ...runReportFigures(view).map(([label, value]) => `- ${label}: ${value}`),
    "",
    ...(view.endGate ? endGateText(view.endGate) : []),
    "AUFFÄLLIGKEITEN",
    ...(findings.length
      ? findings.map((f) => `- ${f.title}${f.detail ? ` — ${f.detail}` : ""} (Schritt ${f.role}: ${stepUrl(view, appUrl, f.stepId)})`)
      : ["Keine Auffälligkeiten."]),
    "",
    "LINKS",
    `Lauf ansehen: ${runUrl(view, appUrl)}`,
    ...(batch ? [`Stapel ansehen: ${batch}`] : []),
    ...view.steps.map((s, i) => `Schritt ${i + 1} · ${s.role}: ${stepUrl(view, appUrl, s.stepId)}`),
    "",
    "TECHNIK",
    ...view.steps.map(
      (s, i) =>
        `Schritt ${i + 1} ${s.role}: ${s.provider ?? "—"} / ${s.model ?? "—"} · Tokens ${s.tokensIn ?? "—"} ein, ${s.tokensOut ?? "—"} aus` +
        `${s.tokensCache ? `, ${s.tokensCache} aus dem Cache` : ""}`,
    ),
    ...(view.technicalEnd ? ["", ...logHints(view.stage)] : []),
  ];
  return lines.join("\n");
}
