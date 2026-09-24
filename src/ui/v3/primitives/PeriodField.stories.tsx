import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { ReactNode } from "react";
import { AmountCell } from "./Cells";
import { FilterBar } from "./FilterBar";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { PeriodField, PeriodPanel, periodOf, type FiscalYearSpan, type PeriodUnit } from "./PeriodField";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof PeriodField> = {
  title: "v3/Primitives/Formular/PeriodField",
  component: PeriodField,
};
export default meta;
type Story = StoryObj<typeof PeriodField>;

const openOnLoad: Story["play"] = ({ canvasElement }) => {
  canvasElement.querySelector<HTMLButtonElement>("button[aria-haspopup]")?.click();
};

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: 440, padding: "var(--space-4)" }}>{children}</div>
);

const Out = ({ from, to }: { from: string | null; to: string | null }) => (
  <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
    from = {from ?? "null"} · to = {to ?? "null"}
  </p>
);

/** A client with a shifted fiscal year (July to June) — and one on the calendar. */
const SHIFTED: FiscalYearSpan[] = [
  { year: 2024, startDate: "2023-07-01", endDate: "2024-06-30" },
  { year: 2025, startDate: "2024-07-01", endDate: "2025-06-30" },
  { year: 2026, startDate: "2025-07-01", endDate: "2026-06-30" },
];
const CALENDAR: FiscalYearSpan[] = [
  { year: 2025, startDate: "2025-01-01", endDate: "2025-12-31" },
  { year: 2026, startDate: "2026-01-01", endDate: "2026-12-31" },
];

function useSpan(from: string | null, to: string | null) {
  const [span, setSpan] = useState({ from, to });
  return { ...span, onChange: (f: string | null, t: string | null) => setSpan({ from: f, to: t }) };
}

/* ── Stories ────────────────────────────────────────────────────────────── */

/** March 2026, list open, unit month. */
export const Filled: Story = {
  render: function Render() {
    const span = useSpan("2026-03-01", "2026-03-31");
    return (
      <Frame>
        <PeriodField {...span} />
      </Frame>
    );
  },
  play: openOnLoad,
};

/** Nothing chosen: „Alle Zeiträume"; beside it the locked field. */
export const Empty: Story = {
  render: function Render() {
    const span = useSpan(null, null);
    return (
      <Frame>
        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <PeriodField {...span} />
          <PeriodField from="2026-03-01" to="2026-03-31" disabled />
        </div>
      </Frame>
    );
  },
};

const ALL: PeriodUnit[] = ["month", "months", "quarter", "fiscalYear"];

/**
 * Every unit open side by side, each with a value. The last panel asks for
 * all four units without fiscal years — the unit drops out, no empty tab.
 */
export const Units: Story = {
  render: function Render() {
    const month = useSpan("2026-03-01", "2026-03-31");
    const months = useSpan("2026-01-01", "2026-06-30");
    const quarter = useSpan("2026-07-01", "2026-09-30");
    const fy = useSpan("2025-07-01", "2026-06-30");
    const none = useSpan(null, null);
    const box = (title: string, children: ReactNode) => (
      <div style={{ display: "grid", gap: "var(--space-2)", alignContent: "start" }}>
        <strong style={{ fontSize: 12.5 }}>{title}</strong>
        <div style={{ border: "var(--border-1)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", background: "var(--color-surface)" }}>
          {children}
        </div>
      </div>
    );
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-5)", padding: "var(--space-4)" }}>
        {box(periodOf(month.from, month.to)?.label ?? "", <PeriodPanel {...month} units={["month"]} />)}
        {box(periodOf(months.from, months.to)?.label ?? "", <PeriodPanel {...months} units={["months"]} />)}
        {box(periodOf(quarter.from, quarter.to)?.label ?? "", <PeriodPanel {...quarter} units={["quarter"]} />)}
        {box(periodOf(fy.from, fy.to, SHIFTED)?.label ?? "", <PeriodPanel {...fy} units={["fiscalYear"]} fiscalYears={SHIFTED} />)}
        {box("Alle vier, ohne Wirtschaftsjahre", <PeriodPanel {...none} units={ALL} />)}
      </div>
    );
  },
};

/** November to February across the year: the first click holds, the hover previews. */
export const MonthRange: Story = {
  render: function Render() {
    const set = useSpan("2025-11-01", "2026-02-28");
    const draft = useSpan(null, null);
    return (
      <div style={{ display: "flex", gap: "var(--space-6)", padding: "var(--space-4)", minHeight: 440 }}>
        <div>
          <PeriodField {...set} />
          <Out from={set.from} to={set.to} />
        </div>
        <div style={{ border: "var(--border-1)", borderRadius: "var(--radius-md)", padding: "var(--space-3)", background: "var(--color-surface)", alignSelf: "start" }}>
          <PeriodPanel {...draft} units={["months"]} max="2026-12" />
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    // Right: first click on Okt, pointer on Dez — the preview before the second click.
    const cells = canvasElement.querySelectorAll<HTMLButtonElement>('[role="gridcell"]');
    cells[9]?.click();
    await new Promise((r) => setTimeout(r, 50));
    canvasElement.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')[11]?.dispatchEvent(
      new MouseEvent("mouseover", { bubbles: true }),
    );
  },
};

/**
 * Shifted fiscal year says „WJ 2025/26", calendar one „WJ 2026" — and a
 * calendar fiscal year beats „Jan.–Dez. 2026".
 */
export const FiscalYears: Story = {
  render: function Render() {
    const shifted = useSpan("2025-07-01", "2026-06-30");
    const calendar = useSpan("2026-01-01", "2026-12-31");
    return (
      <Frame>
        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          <PeriodField {...shifted} units={ALL} fiscalYears={SHIFTED} />
          <PeriodField {...calendar} units={ALL} fiscalYears={CALENDAR} />
        </div>
      </Frame>
    );
  },
  play: openOnLoad,
};

/** From July 2024 to September 2026: months outside are locked, the year stops. */
export const Bounds: Story = {
  render: function Render() {
    const span = useSpan("2024-08-01", "2024-08-31");
    return (
      <Frame>
        <PeriodField {...span} min="2024-07" max="2026-09" />
      </Frame>
    );
  },
  play: openOnLoad,
};

/** Quick picks under the grid, the same `DatePreset` as at DateRangeField. */
export const Presets: Story = {
  render: function Render() {
    const span = useSpan(null, null);
    return (
      <Frame>
        <PeriodField
          {...span}
          units={ALL}
          fiscalYears={SHIFTED}
          presets={[
            { key: "prev", label: "Vormonat", from: "2026-08-01", to: "2026-08-31" },
            { key: "q", label: "Laufendes Quartal", from: "2026-07-01", to: "2026-09-30" },
            { key: "fy", label: "Laufendes WJ", from: "2025-07-01", to: "2026-06-30" },
          ]}
        />
        <Out from={span.from} to={span.to} />
      </Frame>
    );
  },
  play: openOnLoad,
};

/** Round trip; February in a leap year ends on the 29th. */
export const Interactive: Story = {
  render: function Render() {
    const span = useSpan("2028-02-01", "2028-02-29");
    return (
      <Frame>
        <PeriodField {...span} units={["month", "months", "quarter"]} />
        <Out from={span.from} to={span.to} />
      </Frame>
    );
  },
};

type Line = { date: string; partner: string; amount: number };
const LINES: Line[] = [
  { date: "2026-01-14", partner: "Bürobedarf Meier GmbH", amount: 64.9 },
  { date: "2026-02-03", partner: "Vermieter Musterstraße", amount: 1450 },
  { date: "2026-03-12", partner: "Stadtwerke Musterstadt", amount: 213.4 },
  { date: "2026-03-28", partner: "Kfz-Werkstatt Berger", amount: 1276.55 },
  { date: "2026-05-19", partner: "Hotel Adler", amount: 348.2 },
  { date: "2026-08-26", partner: "Werbeagentur Nord", amount: 420 },
];

/** In a filter bar beside MultiSelectFilter, as a server form (`name`). */
export const InUse: Story = {
  render: function Render() {
    const span = useSpan("2026-01-01", "2026-03-31");
    const [sent, setSent] = useState<string | null>(null);
    const rows = LINES.filter((l) => (!span.from || l.date >= span.from) && (!span.to || l.date <= span.to));
    return (
      <div style={{ maxWidth: 820, minHeight: 480 }}>
        <form
          method="get"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(new URLSearchParams(new FormData(e.currentTarget) as unknown as string[][]).toString());
          }}
        >
          <FilterBar activeCount={span.from ? 1 : 0} resetHref="#" submitLabel="Filtern">
            <PeriodField {...span} name="period" units={ALL} fiscalYears={CALENDAR} />
            <MultiSelectFilter
              label="Belegart"
              options={[
                { key: "invoice", label: "Rechnung", count: 5 },
                { key: "receipt", label: "Quittung", count: 1 },
              ]}
              selected={[]}
            />
          </FilterBar>
        </form>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>{sent === null ? "Noch nicht abgesendet." : `?${sent}`}</p>
        <Card>
          <CardHead title="Belege" sub={`${rows.length} von ${LINES.length}`} />
          <Table cols="120px 1fr 140px">
            <HeadRow>
              <th>Datum</th>
              <th>Gegenpartei</th>
              <th style={{ textAlign: "right" }}>Betrag</th>
            </HeadRow>
            {rows.map((l) => (
              <Row key={l.date + l.partner}>
                <td>{l.date.split("-").reverse().join(".")}</td>
                <td>{l.partner}</td>
                <AmountCell value={l.amount} />
              </Row>
            ))}
          </Table>
        </Card>
      </div>
    );
  },
};

/** A value off month boundaries, from the URL: said in days, nothing marked in the grid. */
export const Edge: Story = {
  render: function Render() {
    const span = useSpan("2026-03-03", "2026-04-17");
    return (
      <Frame>
        <PeriodField {...span} />
      </Frame>
    );
  },
  play: openOnLoad,
};
