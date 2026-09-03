import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { AuditEvent } from "@/ludwig/modules/audit-log/domain/types";
import { batchLogDepth } from "@/ludwig/modules/datev-export/domain/batch-log";
import type { InvoiceTraceEntry } from "@/ludwig/modules/invoices/domain/invoice";

import { Badge } from "../primitives/Badge";
import { Card, CardHead } from "../primitives/Table";
import { LogList, type LogEntry, type LogLevel } from "./Log";

const meta: Meta<typeof LogList> = { title: "v3/Patterns/Prozess/LogList", component: LogList };
export default meta;
type Story = StoryObj<typeof LogList>;

/* ── Mapper: the same three lines every page writes (spec 0053) ─────────── */

/** `platform_audit_events` — outcome is not a severity, so it is mapped to one. */
function fromAuditEvent(e: AuditEvent): LogEntry {
  const level: LogLevel =
    e.outcome === "failure" ? "error" : e.outcome === "partial" ? "warning" : "info";
  return {
    id: e.id,
    at: e.occurredAt,
    message: e.message ?? e.action,
    level,
    actor: { kind: e.actorKind, label: e.actorLabel ?? undefined },
    source: e.source ?? undefined,
    code: e.action,
    depth: batchLogDepth(e.action, e.outcome),
    refs:
      e.resourceKind && e.resourceId
        ? [{ label: `${e.resourceKind}:${e.resourceId.slice(0, 8)}` }]
        : undefined,
    payload: e.payload,
  };
}

/** `client_invoice_traces` — the document's own trace. */
function fromInvoiceTrace(t: InvoiceTraceEntry): LogEntry {
  const review = t.stepKind.startsWith("review");
  return {
    id: t.id,
    at: t.loggedAt,
    message: t.summary,
    level: t.level,
    actor: review ? { kind: "user", label: t.actor ?? undefined } : { kind: "agent" },
    source: t.module,
    code: t.stepKind,
    depth: t.stepKind.startsWith("finding") ? 1 : review ? 2 : 3,
    detail: t.comment ?? undefined,
    payload: t.payload,
    right: t.confidence === null ? undefined : <Konfidenz value={t.confidence} />,
  };
}

/** `ops_extraction_logs` — untyped, and its levels shout in capitals. */
function fromExtractionLog(l: {
  id: string;
  at: string;
  message: string;
  level: string;
  module: string;
  step: string;
}): LogEntry {
  const normalized = l.level.toLowerCase();
  return {
    id: l.id,
    at: l.at,
    message: l.message,
    level: (normalized === "warn" ? "warning" : normalized) as LogLevel,
    actor: { kind: "system" },
    source: l.module,
    code: l.step,
    depth: 3,
  };
}

/** The confidence in the extra cell — a share, not a state. */
function Konfidenz({ value }: { value: number }) {
  return <Badge tone="neutral">{Math.round(value * 100)} %</Badge>;
}

/* ── Data ───────────────────────────────────────────────────────────────── */

/** Deliberately unsorted — the component sorts. */
const AUDIT: LogEntry[] = [
  {
    id: "a5",
    at: "2026-09-02T14:21:00Z",
    message: "Stapel 2026-09 an DATEV übergeben",
    level: "info",
    actor: { kind: "user", label: "s.fakir@kanzlei.de" },
    source: "web",
    code: "export_batch.closed",
    refs: [{ label: "Stapel 2026-09", href: "#stapel" }],
  },
  {
    id: "a1",
    at: "2026-09-01T08:02:00Z",
    message: "Beleg RE-4471 hochgeladen",
    level: "info",
    actor: { kind: "user", label: "buero@mandant.de" },
    source: "web",
    code: "document.uploaded",
    refs: [{ label: "RE-4471", href: "#beleg" }],
    payload: { fileName: "RE-4471.pdf", bytes: 284_112, mime: "application/pdf" },
  },
  {
    id: "a3",
    at: "2026-09-01T09:44:00Z",
    message: "Buchungsvorschlag 6815 an 70021 erzeugt",
    level: "info",
    actor: { kind: "agent" },
    source: "workflows",
    code: "journal_entry.proposed_by_agent",
    refs: [{ label: "RE-4471", href: "#beleg" }, { label: "Sachverhalt 118" }],
  },
  {
    id: "a2",
    at: "2026-09-01T08:03:00Z",
    message: "Klassifikation der Belegart abgeschlossen",
    level: "info",
    actor: { kind: "system" },
    source: "worker",
    code: "document.classified",
  },
  {
    id: "a4",
    at: "2026-09-01T11:15:00Z",
    message: "DATEV-Bridge antwortet nicht — Übergabe abgebrochen",
    level: "error",
    actor: { kind: "system" },
    source: "bridge",
    code: "datev_export.retry",
    detail: "Zeitüberschreitung nach 30 Sekunden, dritter Versuch.",
    payload: { attempt: 3, timeoutMs: 30_000, endpoint: "/exports/2026-09" },
  },
  {
    id: "a6",
    at: "2026-09-02T15:03:00Z",
    message: "Nächtlicher Abgleich mit DATEV gestartet",
    level: "info",
    actor: { kind: "cli", label: "nightly-sync" },
    source: "cli",
    code: "datev_sync.started",
  },
  {
    id: "a7",
    at: "2026-09-02T16:40:00Z",
    message: "Mandant über die Schnittstelle angelegt",
    level: "info",
    actor: { kind: "api" },
    source: "web",
    code: "client.created",
    refs: [{ label: "Mandant 61015", href: "#mandant" }],
  },
  {
    id: "a8",
    at: "2026-09-02T17:12:00Z",
    message: "Zwei von neun Belegen ohne Kreditor — Lauf nur teilweise durch",
    level: "warning",
    actor: { kind: "agent" },
    source: "workflows",
    code: "agent_run.completed",
    detail: "RE-4468 und RE-4470 warten auf eine Zuordnung.",
    refs: [{ label: "Lauf 442", href: "#lauf" }],
  },
  {
    id: "a9",
    at: "2026-09-03T06:30:00Z",
    message: "Kontenrahmen SKR03 neu eingelesen",
    level: "info",
    actor: { kind: "cli", label: "seed-accounts" },
    source: "cli",
    code: "ledger_accounts.imported",
    payload: { accounts: 1284, skipped: 12 },
  },
  {
    id: "a10",
    at: "2026-09-03T07:05:00Z",
    message: "Rückfrage an den Mandanten gestellt",
    level: "info",
    actor: { kind: "user", label: "s.fakir@kanzlei.de" },
    source: "web",
    code: "case.clarification_asked",
    refs: [{ label: "Sachverhalt 118", href: "#fall" }],
  },
  {
    id: "a11",
    at: "2026-09-03T08:10:00Z",
    message: "Rückfrage beantwortet: Bewirtung",
    level: "info",
    actor: { kind: "user", label: "buero@mandant.de" },
    source: "web",
    code: "case.clarification_answered",
    refs: [{ label: "Sachverhalt 118", href: "#fall" }],
  },
  {
    id: "a12",
    at: "2026-09-03T08:44:00Z",
    message: "Konto 6815 auf 6644 korrigiert",
    level: "warning",
    actor: { kind: "user", label: "s.fakir@kanzlei.de" },
    source: "web",
    code: "journal_entry.account_changed",
    detail: "Bewirtung statt Bürobedarf — die Konvention wurde nachgezogen.",
  },
];

/** Twelve rows of an audit trail, unsorted, every column filled. */
export const Filled: Story = {
  render: () => <LogList entries={AUDIT} />,
};

/** The empty text says why, where the page knows a reason. */
export const Empty: Story = {
  render: () => (
    <LogList entries={[]} emptyText="Für diesen Beleg ist noch nichts protokolliert." />
  ),
};

/** The place stays while the rows are on their way. */
export const Loading: Story = {
  render: () => <LogList entries={[]} loading />,
};

/** A run is read from the front, an audit from the end — same rows, two directions. */
export const Order: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <CardHead title="Neueste zuerst" sub="Der Vorgabewert — ein Audit liest man vom Ende." />
        <LogList entries={AUDIT.slice(0, 5)} />
      </Card>
      <Card>
        <CardHead title="Älteste zuerst" sub="Ein Lauf liest sich von vorn." />
        <LogList entries={AUDIT.slice(0, 5)} order="oldest" />
      </Card>
    </div>
  ),
};

const LEVELS: LogLevel[] = ["debug", "verbose", "info", "warning", "error"];
const ACTORS = [
  { kind: "user", label: "s.fakir@kanzlei.de" },
  { kind: "system" },
  { kind: "api" },
  { kind: "cli", label: "nightly-sync" },
  { kind: "agent" },
  { kind: "roboter" },
];

/** Every severity and every actor kind — including one the registry does not know. */
export const Levels: Story = {
  render: () => (
    <LogList
      order="oldest"
      entries={[
        ...LEVELS.map((level, i) => ({
          id: `lvl-${level}`,
          at: `2026-09-03T09:0${i}:00Z`,
          message: `Schwere „${level}" — so sieht die Zeile aus.`,
          level,
          actor: { kind: "system" },
          code: `demo.${level}`,
        })),
        ...ACTORS.map((actor, i) => ({
          id: `act-${actor.kind}`,
          at: `2026-09-03T10:0${i}:00Z`,
          message: `Akteur „${actor.kind}" — Label vor Registry-Wort, Rohwert zuletzt.`,
          level: "info" as LogLevel,
          actor,
          code: "demo.actor",
        })),
      ]}
    />
  ),
};

const LONG =
  "Die Bridge hat den Stapel angenommen, beim Schreiben der Buchungssätze aber " +
  "nach 18 von 42 Sätzen abgebrochen; die bereits geschriebenen Sätze bleiben " +
  "stehen und werden beim nächsten Lauf übersprungen, weil die Belegnummer " +
  "eindeutig ist und DATEV den Satz sonst ein zweites Mal anlegt. Bitte prüfen.";

const WIDE_PAYLOAD = Object.fromEntries(
  Array.from({ length: 40 }, (_, i) => [`feld_${String(i + 1).padStart(2, "0")}`, `Wert ${i + 1}`]),
);

const MANY: LogEntry[] = Array.from({ length: 200 }, (_, i) => ({
  id: `m${i}`,
  at: new Date(Date.UTC(2026, 8, 3, 6, 0, 0) + i * 47_000).toISOString(),
  message: `Beleg ${4200 + i} verarbeitet`,
  level: (i % 17 === 0 ? "warning" : "info") as LogLevel,
  actor: { kind: "agent" },
  code: "document.processed",
}));

/**
 * The edges: two hundred rows, a message of 300 characters, a payload of 40
 * keys, a row without severity and actor next to rows that carry both — and,
 * below, a source that carries neither, so those columns disappear entirely.
 */
export const Edge: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <CardHead title="Ränder" sub="Lange Meldung, breites Payload, Zeile ohne Schwere und Akteur." />
        <LogList
          order="oldest"
          entries={[
            {
              id: "e1",
              at: "2026-09-03T09:00:00Z",
              message: LONG,
              level: "error",
              actor: { kind: "system" },
              source: "bridge",
              code: "datev_export.aborted",
              payload: WIDE_PAYLOAD,
            },
            {
              id: "e2",
              at: "2026-09-03T09:01:00Z",
              message: "Zeile ohne Schwere und ohne Akteur — die Spalten bleiben, weil andere sie tragen.",
              code: "demo.sparse",
            },
            {
              id: "e3",
              at: "2026-09-03T09:02:00Z",
              message: "Leeres Payload zeigt keine Einzelheiten.",
              level: "info",
              actor: { kind: "agent" },
              payload: {},
            },
          ]}
        />
      </Card>
      <Card>
        <CardHead
          title="Quelle ohne Schwere"
          sub="Keine Zeile trägt Schwere, Akteur, Quelle oder Bezug — vier Spalten fehlen."
        />
        <LogList
          order="oldest"
          entries={[
            { id: "p1", at: "2026-09-03T09:00:00Z", message: "Lauf gestartet", code: "run.started" },
            { id: "p2", at: "2026-09-03T09:04:00Z", message: "Lauf beendet", code: "run.finished" },
          ]}
        />
      </Card>
      <Card>
        <CardHead title="200 Zeilen" sub="Die Zeilenhöhe bleibt, die Karte scrollt." />
        <div style={{ maxHeight: 420, overflowY: "auto" }}>
          <LogList entries={MANY} />
        </div>
      </Card>
    </div>
  ),
};

/* ── InUse: the real types, mapped ──────────────────────────────────────── */

const TRACES: InvoiceTraceEntry[] = [
  {
    id: "t1",
    loggedAt: "2026-09-01T09:41:00Z",
    module: "Classifier",
    stepKind: "classify",
    summary: "Belegart erkannt: Eingangsrechnung",
    confidence: 0.97,
    journalEntryId: null,
    bookingLineIndex: null,
    vatBlockIndex: null,
    extractionId: "x1",
    actor: null,
    comment: null,
    payload: { documentType: "invoice_in", model: "ludwig-classify-3" },
    level: "info",
  },
  {
    id: "t2",
    loggedAt: "2026-09-01T09:42:30Z",
    module: "Extractor",
    stepKind: "finding.vat",
    summary: "Steuersatz 7 % neben 19 % im selben Beleg",
    confidence: 0.62,
    journalEntryId: null,
    bookingLineIndex: null,
    vatBlockIndex: 2,
    extractionId: "x1",
    actor: null,
    comment: "Zwei Steuerblöcke — der Beleg wird gesplittet gebucht.",
    payload: { blocks: [{ rate: 19, net: 812.5 }, { rate: 7, net: 96.2 }] },
    level: "warning",
  },
  {
    id: "t3",
    loggedAt: "2026-09-01T09:44:10Z",
    module: "Booker",
    stepKind: "propose",
    summary: "6815 an 70021 · 1.249,90 € vorgeschlagen",
    confidence: 0.88,
    journalEntryId: "j1",
    bookingLineIndex: 0,
    vatBlockIndex: null,
    extractionId: "x1",
    actor: null,
    comment: null,
    payload: null,
    level: "info",
  },
  {
    id: "t4",
    loggedAt: "2026-09-03T08:44:00Z",
    module: "Review",
    stepKind: "review.corrected",
    summary: "Konto auf 6644 korrigiert",
    confidence: null,
    journalEntryId: "j1",
    bookingLineIndex: 0,
    vatBlockIndex: null,
    extractionId: null,
    actor: "s.fakir@kanzlei.de",
    comment: "Bewirtung statt Bürobedarf.",
    payload: null,
    level: "info",
  },
];

const EXTRACTION = [
  {
    id: "o1",
    at: "2026-09-01T09:42:00Z",
    message: "OCR über 3 Seiten gelaufen",
    level: "INFO",
    module: "ocr",
    step: "ocr.pages",
  },
  {
    id: "o2",
    at: "2026-09-01T09:42:20Z",
    message: "Seite 2 unscharf — Erkennung wiederholt",
    level: "WARN",
    module: "ocr",
    step: "ocr.retry",
  },
];

const AUDIT_EVENTS: AuditEvent[] = [
  {
    id: "ae1",
    occurredAt: "2026-09-01T08:02:00Z",
    actorKind: "user",
    actorId: "u1",
    actorLabel: "buero@mandant.de",
    action: "document.uploaded",
    outcome: "success",
    tenantId: "t1",
    clientId: "c1",
    resourceKind: "document",
    resourceId: "4471aabbccdd",
    message: "Beleg RE-4471 hochgeladen",
    payload: { fileName: "RE-4471.pdf" },
    correlationId: "corr-1",
    source: "web",
  },
  {
    id: "ae2",
    occurredAt: "2026-09-01T09:44:00Z",
    actorKind: "agent",
    actorId: null,
    actorLabel: null,
    action: "journal_entry.proposed_by_agent",
    outcome: "success",
    tenantId: "t1",
    clientId: "c1",
    resourceKind: "journal_entry",
    resourceId: "j1aabbccddee",
    message: "Buchungsvorschlag erzeugt",
    payload: {},
    correlationId: "corr-1",
    source: "workflows",
  },
  {
    id: "ae3",
    occurredAt: "2026-09-01T11:15:00Z",
    actorKind: "system",
    actorId: null,
    actorLabel: null,
    action: "datev_export.retry",
    outcome: "failure",
    tenantId: "t1",
    clientId: "c1",
    resourceKind: "export_batch",
    resourceId: "b2026aabbccdd",
    message: "DATEV-Bridge antwortet nicht — Übergabe abgebrochen",
    payload: { attempt: 3 },
    correlationId: "corr-2",
    source: "bridge",
  },
  {
    id: "ae4",
    occurredAt: "2026-09-02T14:21:00Z",
    actorKind: "user",
    actorId: "u2",
    actorLabel: "s.fakir@kanzlei.de",
    action: "export_batch.closed",
    outcome: "success",
    tenantId: "t1",
    clientId: "c1",
    resourceKind: "export_batch",
    resourceId: "b2026aabbccdd",
    message: "Stapel 2026-09 an DATEV übergeben",
    payload: {},
    correlationId: "corr-2",
    source: "web",
  },
];

/**
 * The proof that one row carries every source: the document's pipeline mixes
 * `InvoiceTraceEntry` and extraction logs into one list — depths 1, 2 and 3
 * side by side, and they look the same. Next to it the audit trail from
 * `AuditEvent`, with `batchLogDepth` deciding the depth.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <CardHead
          title="Beleg RE-4471 · Pipeline"
          sub="Beleg-Spur und Extraktions-Log in einer Liste"
          meta="6 Einträge"
        />
        <LogList
          order="oldest"
          entries={[...TRACES.map(fromInvoiceTrace), ...EXTRACTION.map(fromExtractionLog)]}
        />
      </Card>
      <Card>
        <CardHead title="Mandant 61015 · Audit" sub="platform_audit_events" meta="4 Ereignisse" />
        <LogList entries={AUDIT_EVENTS.map(fromAuditEvent)} />
      </Card>
    </div>
  ),
};
