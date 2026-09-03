import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { InvoiceTraceEntry } from "@/ludwig/modules/invoices/domain/invoice";

import { Badge } from "../primitives/Badge";
import { Card, CardHead } from "../primitives/Table";
import type { LogEntry, LogLevel } from "./Log";
import { LogBrowser, type LogFilterState } from "./LogBrowser";

const meta: Meta<typeof LogBrowser> = {
  title: "v3/Patterns/Prozess/LogBrowser",
  component: LogBrowser,
};
export default meta;
type Story = StoryObj<typeof LogBrowser>;

/* ── Data: a batch log, three depths, every severity ────────────────────── */

const STORY_ROWS: Array<[string, LogLevel | undefined, 1 | 2 | 3, string]> = [
  ["Stapel 2026-09 eröffnet", "info", 1, "export_batch.opened"],
  ["Beleg RE-4471 hochgeladen", "info", 1, "document.uploaded"],
  ["Rückfrage zu RE-4471 beantwortet: Bewirtung", "info", 1, "case.clarification_answered"],
  ["Stapel bereitgestellt", "info", 1, "export_batch.prepared"],
  ["Übergabe an DATEV fehlgeschlagen", "error", 1, "datev_export.retry"],
  ["Stapel an DATEV übergeben", "info", 1, "export_batch.closed"],
];

const RECORD_ROWS: Array<[string, LogLevel, string]> = [
  ["Konto 6815 auf 6644 korrigiert", "warning", "journal_entry.account_changed"],
  ["Konvention „Bewirtung Mittag“ angelegt", "info", "convention.created"],
  ["Klärung zu RE-4468 eröffnet", "warning", "case.clarification_asked"],
  ["Beleg RE-4470 ohne Kreditor abgelegt", "warning", "document.parked"],
  ["Buchungssatz 118 freigegeben", "info", "journal_entry.approved"],
];

const TECH_ROWS: Array<[string, LogLevel, string]> = [
  ["Schritt „classify“ beendet", "debug", "agent_step.classify"],
  ["Schritt „extract“ beendet", "debug", "agent_step.extract"],
  ["Kreditor-Suche ohne Treffer", "verbose", "agent_step.vendor_lookup"],
  ["Buchung durch Agent erzeugt", "info", "journal_entry.created_by_agent"],
  ["Zeitüberschreitung der Bridge, Versuch 2", "error", "bridge.timeout"],
];

/** 120 rows across three depths — the size at which a filter starts to matter. */
const BATCH: LogEntry[] = Array.from({ length: 120 }, (_, i) => {
  const at = new Date(Date.UTC(2026, 8, 1, 6, 0, 0) + i * 613_000).toISOString();
  if (i % 20 === 0) {
    const [message, level, depth, code] = STORY_ROWS[(i / 20) % STORY_ROWS.length];
    return {
      id: `b${i}`,
      at,
      message,
      level,
      depth,
      code,
      source: "web",
      actor: { kind: "user", label: "s.fakir@kanzlei.de" },
      refs: message.includes("RE-4471") ? [{ label: "RE-4471", href: "#beleg" }] : undefined,
    };
  }
  if (i % 3 === 0) {
    const [message, level, code] = RECORD_ROWS[i % RECORD_ROWS.length];
    return {
      id: `b${i}`,
      at,
      message,
      level,
      depth: 2 as const,
      code,
      source: "web",
      actor: { kind: "user", label: "buero@mandant.de" },
    };
  }
  const [message, level, code] = TECH_ROWS[i % TECH_ROWS.length];
  return {
    id: `b${i}`,
    at,
    message,
    level,
    depth: 3 as const,
    code,
    source: "workflows",
    actor: { kind: "agent" },
  };
});

/**
 * A batch log of 120 rows in the middle view: the counters at „Verlauf“,
 * „Protokoll“ and „Technik“ say what each view holds before it is clicked.
 * Keyboard: Tab runs view → severity → search → list.
 */
export const Filled: Story = {
  render: () => (
    <Card>
      <CardHead title="Stapel 2026-09 · Protokoll" sub="120 Einträge geladen" />
      <LogBrowser entries={BATCH} />
    </Card>
  ),
};

/**
 * The same rows in all three views, and once with the words of the calling
 * page — „Technik“ is a multiple of „Verlauf“, which is the whole point of
 * the counter.
 */
export const Views: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24 }}>
      {([1, 2, 3] as const).map((v) => (
        <Card key={v}>
          <CardHead title={`initialView = ${v}`} />
          <LogBrowser entries={BATCH.slice(0, 40)} initialView={v} />
        </Card>
      ))}
      <Card>
        <CardHead title="Eigene Wörter" sub='viewLabels = ["Kurz", "Fachlich", "Roh"]' />
        <LogBrowser
          entries={BATCH.slice(0, 40)}
          initialView={2}
          viewLabels={["Kurz", "Fachlich", "Roh"]}
        />
      </Card>
    </div>
  ),
};

/**
 * The round trip, to be walked in the browser: set „nur Fehler“, type
 * „RE-4471“ — the counters at the views and at the chips recompute against
 * the other filter each time, the bar says „2 Filter gesetzt“, and
 * „Zurücksetzen“ clears severity and search but leaves the view standing.
 * `Escape` in the field empties it.
 */
export const Filters: Story = {
  render: () => (
    <Card>
      <CardHead title="Stapel 2026-09" sub="Schwere und Suche setzen — die Zähler rechnen mit" />
      <LogBrowser entries={BATCH} initialView={3} />
    </Card>
  ),
};

/**
 * Nothing left after filtering: every row here is technical, the view is
 * „Verlauf“ — so the text names view and the number of loaded rows, and the
 * way back is a button, not a hint.
 */
export const EmptyAfterFilter: Story = {
  render: () => (
    <Card>
      <CardHead title="Extraktions-Log" sub="lauter Technik-Zeilen, Sicht „Verlauf“" />
      <LogBrowser
        entries={BATCH.filter((e) => e.depth === 3).slice(0, 45)}
        initialView={1}
        more={{ hasMore: true, onLoad: () => {} }}
      />
    </Card>
  ),
};

/** Older rows arrive on demand; while they are on their way the button is locked. */
export const LoadMore: Story = {
  render: function Render() {
    const [rows, setRows] = useState(BATCH.slice(0, 20));
    const [loading, setLoading] = useState(false);
    const hasMore = rows.length < 70;
    return (
      <Card>
        <CardHead title="Audit" sub={`${rows.length} von 70 geladen`} />
        <LogBrowser
          entries={rows}
          more={{
            hasMore,
            loading,
            onLoad: () => {
              setLoading(true);
              // The page loads; here the delay only makes the locked button visible.
              setTimeout(() => {
                setRows(BATCH.slice(0, rows.length + 50));
                setLoading(false);
              }, 900);
            },
          }}
        />
      </Card>
    );
  },
};

/** What the page needs to mirror the filter into its URL — and nothing more. */
export const Mirror: Story = {
  render: function Render() {
    const [state, setState] = useState<LogFilterState | null>(null);
    return (
      <div style={{ display: "grid", gap: 16 }}>
        <Card>
          <CardHead title="Stapel 2026-09" />
          <LogBrowser entries={BATCH.slice(0, 40)} onChange={setState} />
        </Card>
        <div className="v2sub">
          {state
            ? `onChange: view=${state.view} · severity=${state.severity} · search="${state.search}"`
            : "onChange feuert nicht beim Mount — erst nach der ersten Änderung."}
        </div>
      </div>
    );
  },
};

/* ── InUse: the document's pipeline tab ─────────────────────────────────── */

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
    right: t.confidence === null ? undefined : <Confidence value={t.confidence} />,
  };
}

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

function Confidence({ value }: { value: number }) {
  return <Badge tone="neutral">{Math.round(value * 100)} %</Badge>;
}

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
    payload: { documentType: "invoice_in" },
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
    payload: { blocks: [{ rate: 19 }, { rate: 7 }] },
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
  {
    id: "o3",
    at: "2026-09-01T09:43:10Z",
    message: "Layout-Modell v4 geladen",
    level: "INFO",
    module: "layout",
    step: "layout.model",
  },
];

/**
 * The pipeline tab of a document: trace and extraction log in one stream. In
 * „Protokoll“ the reasons stand, „Technik“ adds the step boundaries — one
 * switch instead of the Fachlich/Technisch/Beide toggle plus its verbose
 * checkbox.
 */
export const InUse: Story = {
  render: () => (
    <Card>
      <CardHead
        title="Beleg RE-4471 · Pipeline"
        sub="Beleg-Spur und Extraktions-Log"
        meta="7 Einträge"
      />
      <LogBrowser
        order="oldest"
        entries={[...TRACES.map(fromInvoiceTrace), ...EXTRACTION.map(fromExtractionLog)]}
      />
    </Card>
  ),
};
