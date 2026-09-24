import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo, useState } from "react";
import { AmountCell } from "./Cells";
import { EmptyState } from "./EmptyState";
import { FilterBar, matchPreset, type FilterPreset } from "./FilterBar";
import { DateField, DateRangeField } from "./DateField";
import { Checkbox, Field, Input, Select } from "./Form";
import { MultiSelectFilter, type MultiSelectOption } from "./MultiSelectFilter";
import { FilterChips, SearchInput } from "./Nav";
import { PeriodField } from "./PeriodField";
import { Badge } from "./Badge";
import { STATUS_REGISTRY } from "@/ludwig/ui/status/status-registry";
import type { SourceDocStatus } from "@/ludwig/modules/source-docs/domain/source-doc-status";
import { StatusBadge } from "../patterns/StatusBadge";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof FilterBar> = {
  title: "v3/Primitives/Navigation/FilterBar",
  component: FilterBar,
};
export default meta;
type Story = StoryObj<typeof FilterBar>;

const CreditorFilter = () => (
  <Field label="Kreditor" htmlFor="kreditor">
    <Select id="kreditor" defaultValue="">
      <option value="">Alle</option>
      <option value="meier">Bürobedarf Meier GmbH</option>
      <option value="stadtwerke">Stadtwerke Musterstadt</option>
    </Select>
  </Field>
);

/**
 * The span runs through `DateRangeField` (0024), not through two raw
 * `<input type="date">` — that is the replacement the task promised, and the
 * bar is where it is used.
 */
const PeriodFilter = () => {
  const [from, setFrom] = useState<string | null>("2026-08-01");
  const [to, setTo] = useState<string | null>("2026-08-31");
  return (
    <Field label="Belegdatum" htmlFor="belegdatum">
      <DateRangeField id="belegdatum"
        from={from}
        to={to}
        onChange={(f, t) => {
          setFrom(f);
          setTo(t);
        }}
      />
    </Field>
  );
};

/** Ruhezustand: drei Felder, nichts gesetzt, kein Zurücksetzen. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <FilterBar resetHref="#">
        <CreditorFilter />
        <PeriodFilter />
        <Field label="Suche" htmlFor="suche">
          <Input id="suche" type="search" placeholder="Beleg oder Text" />
        </Field>
      </FilterBar>
    </div>
  ),
};

/** Gesetzt: die Zahl steht als Wort da, daneben der Weg zurück. */
export const Active: Story = {
  render: function Render() {
    const [n, setN] = useState(3);
    return (
      <div style={{ maxWidth: 720 }}>
        <FilterBar activeCount={n} onReset={() => setN(0)}>
          <CreditorFilter />
          <PeriodFilter />
          <Field label="Suche" htmlFor="suche-2">
            <Input id="suche-2" type="search" defaultValue="Bürobedarf" />
          </Field>
        </FilterBar>
        <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>
          {n === 0 ? "Alles sichtbar." : `${n} Filter wirken.`}
        </p>
      </div>
    );
  },
};

/**
 * **Ohne eine Zeile Client-Code.** `method="get"` schreibt die Felder in die
 * Query, `submitLabel` rendert einen gewöhnlichen `type="submit"`, `resetHref`
 * ist die Link-Fassung von `onReset` — und weder `FilterBar` noch `Field`,
 * `Input` oder `Select` sind Client-Komponenten.
 *
 * Die Story stand hier schon, sagte aber nur `<form>`; damit war der Fall
 * nicht als das erkennbar, was er ist. Eine Seite, die stattdessen ihr eigenes
 * `inputStyle` baut, vermisst keinen Baustein (Befund der DATEV-Seite,
 * 2026-09-08).
 */
export const ServerForm: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <form method="get">
        <FilterBar activeCount={2} resetHref="#" submitLabel="Filtern">
          <CreditorFilter />
          <PeriodFilter />
        </FilterBar>
      </form>
    </div>
  ),
};

/** Sieben Felder brechen um; das Zurücksetzen bleibt am Ende. */
export const ManyFields: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <FilterBar activeCount={5} resetHref="#">
        <CreditorFilter />
        <PeriodFilter />
        <Field label="Fälligkeit" htmlFor="falligkeit">
          <DateField id="falligkeit" value="2026-09-15" onChange={() => {}} />
        </Field>
        <Field label="Konto" htmlFor="account">
          <Input id="account" defaultValue="6815" style={{ width: 100 }} />
        </Field>
        <Field label="Betrag ab" htmlFor="betrag-ab">
          <Input id="betrag-ab" defaultValue="100,00" style={{ width: 100 }} />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" defaultValue="">
            <option value="">Alle</option>
            <option value="offen">Offen</option>
          </Select>
        </Field>
        <Field label="Suche" htmlFor="suche-3">
          <Input id="suche-3" type="search" placeholder="Beleg oder Text" />
        </Field>
      </FilterBar>
    </div>
  ),
};

/** Im Einsatz — mit dem Leerzustand, der zur Filterung gehört (V9, T6). */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <FilterBar activeCount={2} resetHref="#">
        <CreditorFilter />
        <PeriodFilter />
      </FilterBar>
      <Card>
        <CardHead title="Belege" sub="0 von 142 sichtbar" />
        <Table cols="120px 1fr 140px">
          <HeadRow>
            <th>Beleg</th>
            <th>Kreditor</th>
            <th style={{ textAlign: "right" }}>Betrag</th>
          </HeadRow>
        </Table>
        <div style={{ padding: "var(--space-5)" }}>
          <EmptyState
            title="Kein Beleg passt zu diesen zwei Filtern."
            description="142 Belege sind vorhanden. Setzen Sie die Filter zurück, um alle zu sehen."
          />
        </div>
      </Card>
      <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
        Zum Vergleich, wie eine gefüllte Liste aussähe:
      </p>
      <Card>
        <Table cols="120px 1fr 140px">
          <HeadRow>
            <th>Beleg</th>
            <th>Kreditor</th>
            <th style={{ textAlign: "right" }}>Betrag</th>
          </HeadRow>
          <Row>
            <td>RE-4471</td>
            <td>Bürobedarf Meier GmbH</td>
            <AmountCell value={1249.9} />
          </Row>
        </Table>
      </Card>
    </div>
  ),
};

/* ── 0200: filter on the click, reset always there, „x von y" ──────────── */

type Doc = { id: string; name: string; type: string; status: "open" | "problem"; date: string; amount: number };
const DOCS: Doc[] = [
  { id: "1", name: "RE-4471 Bürobedarf Meier", type: "invoice", status: "open", date: "2026-08-05", amount: 64.9 },
  { id: "2", name: "Quittung Tankstelle Nord", type: "receipt", status: "open", date: "2026-08-12", amount: 72.4 },
  { id: "3", name: "GS-0193 Werbeagentur Nord", type: "credit_note", status: "problem", date: "2026-07-21", amount: -120 },
  { id: "4", name: "RE-2026-0815 Stadtwerke", type: "invoice", status: "problem", date: "2026-08-15", amount: 213.4 },
  { id: "5", name: "Mietvertrag Musterstraße", type: "contract", status: "open", date: "2026-06-30", amount: 1450 },
  { id: "6", name: "RE-88213 Kfz Berger", type: "invoice", status: "open", date: "2026-07-02", amount: 1276.55 },
  { id: "7", name: "Quittung Hotel Adler", type: "receipt", status: "open", date: "2026-08-26", amount: 348.2 },
];
const TYPE_LABEL: Record<string, string> = {
  invoice: "Rechnung",
  receipt: "Quittung",
  credit_note: "Gutschrift",
  contract: "Vertrag",
};

/**
 * The rule of 0200 on the client: every filter acts on the click, the count
 * „Gefiltert: x von y" follows, „Zurücksetzen" stands there locked until
 * something is set.
 */
export const Live: Story = {
  render: function Render() {
    const [status, setStatus] = useState("all");
    const [types, setTypes] = useState<string[]>([]);
    const [span, setSpan] = useState<{ from: string | null; to: string | null }>({ from: null, to: null });
    const [q, setQ] = useState("");
    const rows = DOCS.filter(
      (d) =>
        (status === "all" || d.status === status) &&
        (types.length === 0 || types.includes(d.type)) &&
        (!span.from || d.date >= span.from) &&
        (!span.to || d.date <= span.to) &&
        d.name.toLowerCase().includes(q.toLowerCase()),
    );
    const active = (status !== "all" ? 1 : 0) + (types.length ? 1 : 0) + (span.from ? 1 : 0) + (q ? 1 : 0);
    const typeOptions = useMemo(
      () =>
        Object.keys(TYPE_LABEL).map((k) => ({ key: k, label: TYPE_LABEL[k]!, count: DOCS.filter((d) => d.type === k).length })),
      [],
    );
    return (
      <div style={{ maxWidth: 900, minHeight: 460 }}>
        <FilterBar
          activeCount={active}
          result={{ shown: rows.length, total: DOCS.length, unit: ["Beleg", "Belege"] }}
          onReset={() => {
            setStatus("all");
            setTypes([]);
            setSpan({ from: null, to: null });
            setQ("");
          }}
        >
          <SearchInput placeholder="Belegname" value={q} onChange={setQ} />
          <FilterChips
            label="Status"
            active={status}
            onPick={setStatus}
            options={[
              { key: "all", label: "Alle", count: DOCS.length },
              { key: "open", label: "Offen", count: DOCS.filter((d) => d.status === "open").length },
              { key: "problem", label: "Problematisch", count: DOCS.filter((d) => d.status === "problem").length },
            ]}
          />
          <MultiSelectFilter label="Belegart" options={typeOptions} selected={types} onChange={setTypes} />
          <PeriodField from={span.from} to={span.to} onChange={(from, to) => setSpan({ from, to })} />
        </FilterBar>
        <Card>
          <Table cols="1fr 120px 140px">
            <HeadRow>
              <span>Beleg</span>
              <span>Belegart</span>
              <span className="v2num">Betrag</span>
            </HeadRow>
            {rows.map((d) => (
              <Row key={d.id}>
                <span>{d.name}</span>
                <span>{TYPE_LABEL[d.type]}</span>
                <AmountCell value={d.amount} />
              </Row>
            ))}
          </Table>
          {rows.length === 0 ? (
            <div style={{ padding: "var(--space-5)" }}>
              <EmptyState title="Kein Beleg passt zu diesen Filtern." description="Setzen Sie die Filter zurück, um alle 7 zu sehen." />
            </div>
          ) : null}
        </Card>
      </div>
    );
  },
};

/**
 * The same on a server page: a GET form **without** a button. `autoSubmit`
 * sends it on every change — a status in the select, a tick in the dropdown,
 * a month, text after a pause. Here the sent query string is shown instead
 * of loading.
 */
export const AutoSubmit: Story = {
  render: function Render() {
    const [types, setTypes] = useState<string[]>(["invoice"]);
    const [span, setSpan] = useState<{ from: string | null; to: string | null }>({ from: "2026-08-01", to: "2026-08-31" });
    const [sent, setSent] = useState<string[]>([]);
    return (
      <div style={{ maxWidth: 900, minHeight: 460 }}>
        <form
          method="get"
          onSubmit={(e) => {
            e.preventDefault();
            const qs = new URLSearchParams(new FormData(e.currentTarget) as unknown as string[][]).toString();
            setSent((s) => [`?${qs}`, ...s].slice(0, 5));
          }}
        >
          <FilterBar autoSubmit activeCount={2} resetHref="#" result={{ shown: 3, total: 7 }}>
            <Field label="Suche" htmlFor="q-auto">
              <Input id="q-auto" name="q" type="search" placeholder="Belegname" />
            </Field>
            <Field label="Status" htmlFor="status-auto">
              <Select id="status-auto" name="status" defaultValue="">
                <option value="">Alle</option>
                <option value="open">Offen</option>
                <option value="problem">Problematisch</option>
              </Select>
            </Field>
            <MultiSelectFilter
              label="Belegart"
              name="type"
              options={Object.keys(TYPE_LABEL).map((k) => ({ key: k, label: TYPE_LABEL[k]! }))}
              selected={types}
              onChange={setTypes}
            />
            <PeriodField name="period" from={span.from} to={span.to} onChange={(from, to) => setSpan({ from, to })} />
          </FilterBar>
        </form>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>Abgeschickt (neueste oben):</p>
        <ol style={{ fontSize: 12.5, fontFamily: "var(--font-mono)" }}>
          {sent.length === 0 ? <li>— noch nichts —</li> : sent.map((q, i) => <li key={i}>{q}</li>)}
        </ol>
      </div>
    );
  },
};

const ACCOUNTS: MultiSelectOption[] = [
  { key: "1200", label: "Sparkasse Musterstadt", hint: "1200 · DE12 2505 0000 0123 4567 89", count: 214, group: "Bank" },
  { key: "1210", label: "Volksbank Nord", hint: "1210 · DE89 3704 0044 0532 0130 00", count: 37, group: "Bank" },
  { key: "1000", label: "Hauptkasse", hint: "1000", count: 12, group: "Kasse" },
  { key: "1360", label: "Firmenkreditkarte Visa", hint: "1360", count: 0, group: "Kreditkarte", badge: <Badge tone="warning">gesperrt</Badge> },
];

/**
 * F4 side by side, with every parameter: **chips** for a handful of exclusive
 * values or a state (as buttons and as links for a server page) — **dropdown**
 * for many values or several at once.
 */
export const ChipsOrDropdown: Story = {
  render: function Render() {
    const [status, setStatus] = useState("open");
    const [accounts, setAccounts] = useState<string[]>(["1200"]);
    const cell = (title: string, rule: string, children: React.ReactNode) => (
      <div style={{ display: "grid", gap: "var(--space-2)", alignContent: "start" }}>
        <strong style={{ fontSize: 13 }}>{title}</strong>
        <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{rule}</span>
        {children}
      </div>
    );
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", minHeight: 440, maxWidth: 1000 }}>
        {cell(
          "Chips — FilterChips",
          "Bis etwa 5 sich ausschließende Werte oder ein Status. Jede Option mit Zahl. label · options (key, label, count, href) · active · onPick.",
          <div style={{ display: "grid", gap: "var(--space-3)" }}>
            <FilterChips
              label="Status"
              active={status}
              onPick={setStatus}
              options={[
                { key: "all", label: "Alle", count: 58 },
                { key: "open", label: "Offen", count: 41 },
                { key: "clarify", label: "In Klärung", count: 12 },
                { key: "done", label: "Erledigt", count: 5 },
              ]}
            />
            <FilterChips
              label="Als Links"
              active="open"
              options={[
                { key: "all", label: "Alle", count: 58, href: "?status=all" },
                { key: "open", label: "Offen", count: 41, href: "?status=open" },
                { key: "done", label: "Erledigt", count: 5, href: "?status=done" },
              ]}
            />
          </div>,
        )}
        {cell(
          "Dropdown — MultiSelectFilter",
          "Mehr Werte oder mehrere zugleich. label · options (key, label, count, badge, group, hint) · selected · onChange · name · searchPlaceholder · disabled.",
          <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
            <MultiSelectFilter
              label="Zahlungskonto"
              options={ACCOUNTS}
              selected={accounts}
              onChange={setAccounts}
              name="account"
              searchPlaceholder="Name oder Nummer"
            />
            <MultiSelectFilter label="Gesperrt" options={ACCOUNTS} selected={[]} disabled />
          </div>,
        )}
      </div>
    );
  },
};

/* ── 0201: quick filters instead of tabs that overlap ──────────────────── */

type QueueDoc = { id: string; name: string; status: SourceDocStatus; clarification: boolean };
const QUEUE: QueueDoc[] = [
  { id: "1", name: "RE-4471 Bürobedarf Meier", status: "pending", clarification: false },
  { id: "2", name: "Quittung Tankstelle Nord", status: "extracting", clarification: false },
  { id: "3", name: "GS-0193 Werbeagentur Nord", status: "agent_review", clarification: false },
  { id: "4", name: "RE-2026-0815 Stadtwerke", status: "human_review", clarification: true },
  { id: "5", name: "Mietvertrag Musterstraße", status: "bookable", clarification: false },
  { id: "6", name: "RE-88213 Kfz Berger", status: "bookable", clarification: true },
  { id: "7", name: "Quittung Hotel Adler", status: "done", clarification: false },
  { id: "8", name: "Kontoauszug Sparkasse 08/2026", status: "done", clarification: false },
  { id: "9", name: "RE-3310 Druckerei Weiß", status: "human_review", clarification: false },
];

type QueueFilter = { status: readonly SourceDocStatus[]; clarification: boolean };
const NO_FILTER: QueueFilter = { status: [], clarification: false };

/** Mirrors what the Belege page offers today (ll-dev4, 2026-09-24), one set per preset. */
const QUEUE_PRESETS: FilterPreset<QueueFilter>[] = [
  { key: "all", label: "Alle", filters: {} },
  { key: "open", label: "Offen", filters: { status: ["pending", "extracting", "agent_review", "human_review", "bookable"] } },
  { key: "processing", label: "In Verarbeitung", filters: { status: ["pending", "extracting"] } },
  { key: "problems", label: "Problematisch", filters: { status: ["agent_review", "human_review"] } },
  { key: "clarification", label: "Offene Klärung", filters: { clarification: true } },
  { key: "bookable", label: "Buchbar", filters: { status: ["bookable"] } },
];

/** One predicate for the list **and** for every count (I12). */
const passes = (f: QueueFilter, d: QueueDoc) =>
  (f.status.length === 0 || f.status.includes(d.status)) && (!f.clarification || d.clarification);

/**
 * Quick filters (F8): the six views of the Belege page overlap — Offen
 * contains In Verarbeitung and Problematisch — so they are not tabs but named
 * filter states. A preset fills the fields below; ticking a field by hand
 * leaves no preset marked, and ticking back to a preset's values marks it
 * again. Every count is the list with that preset, with the same predicate.
 */
export const Presets: Story = {
  render: function Render() {
    const [filter, setFilter] = useState<QueueFilter>(NO_FILTER);
    const rows = QUEUE.filter((d) => passes(filter, d));
    const active = (filter.status.length ? 1 : 0) + (filter.clarification ? 1 : 0);
    const labels = STATUS_REGISTRY.document_status;
    const statusOptions = (Object.keys(labels) as SourceDocStatus[])
      .filter((k) => k !== "deleted")
      .map((k) => ({ key: k, label: labels[k]!.label, count: QUEUE.filter((d) => d.status === k).length }));
    return (
      <div style={{ maxWidth: 900, minHeight: 520 }}>
        <FilterBar
          activeCount={active}
          result={{ shown: rows.length, total: QUEUE.length, unit: ["Beleg", "Belege"] }}
          onReset={() => setFilter(NO_FILTER)}
          presets={
            <FilterChips
              label="Schnellfilter"
              active={matchPreset(QUEUE_PRESETS, filter) ?? ""}
              onPick={(key) => setFilter({ ...NO_FILTER, ...QUEUE_PRESETS.find((p) => p.key === key)!.filters })}
              options={QUEUE_PRESETS.map((p) => ({
                key: p.key,
                label: p.label,
                count: QUEUE.filter((d) => passes({ ...NO_FILTER, ...p.filters }, d)).length,
              }))}
            />
          }
        >
          <MultiSelectFilter
            label="Status"
            options={statusOptions}
            selected={[...filter.status]}
            onChange={(status) => setFilter({ ...filter, status: status as SourceDocStatus[] })}
          />
          <Checkbox
            label="Offene Klärung"
            checked={filter.clarification}
            onChange={(e) => setFilter({ ...filter, clarification: e.target.checked })}
          />
        </FilterBar>
        <Card>
          <Table cols="1fr 200px">
            <HeadRow>
              <span>Beleg</span>
              <span>Status</span>
            </HeadRow>
            {rows.map((d) => (
              <Row key={d.id}>
                <span>{d.name}</span>
                <StatusBadge axis="document_status" status={d.status} info={false} />
              </Row>
            ))}
          </Table>
        </Card>
      </div>
    );
  },
};
