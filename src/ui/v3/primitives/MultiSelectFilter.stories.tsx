import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Badge } from "./Badge";
import { AmountCell } from "./Cells";
import { EmptyState } from "./EmptyState";
import { FilterBar } from "./FilterBar";
import { MultiSelectFilter, type MultiSelectOption } from "./MultiSelectFilter";
import { FilterChips, SearchInput } from "./Nav";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof MultiSelectFilter> = {
  title: "v3/Primitives/Formular/MultiSelectFilter",
  component: MultiSelectFilter,
};
export default meta;
type Story = StoryObj<typeof MultiSelectFilter>;

/** Opens the list after render, so the story shows it without a click. */
const openOnLoad: Story["play"] = ({ canvasElement }) => {
  canvasElement.querySelector<HTMLButtonElement>("button[aria-haspopup]")?.click();
};

const Frame = ({ children }: { children: ReactNode }) => (
  <div style={{ minHeight: 420, padding: "var(--space-4)" }}>{children}</div>
);

/* ── Data ───────────────────────────────────────────────────────────────── */

const DOCUMENT_TYPES: MultiSelectOption[] = [
  { key: "invoice", label: "Rechnung", count: 214 },
  { key: "receipt", label: "Quittung", count: 87 },
  { key: "credit_note", label: "Gutschrift", count: 12 },
  { key: "bank_statement", label: "Kontoauszug", count: 9 },
  { key: "contract", label: "Vertrag", count: 3 },
  { key: "unclassified", label: "Nicht eingeordnet", count: 0 },
];

const BANKS = ["Sparkasse Musterstadt", "Volksbank Nord", "Commerzbank", "Deutsche Bank", "GLS Bank"];
const ACCOUNTS: MultiSelectOption[] = [
  ...Array.from({ length: 24 }, (_, i) => ({
    key: `bank-${i}`,
    label: `${BANKS[i % BANKS.length]} · Konto ${i + 1}`,
    hint: `${1200 + i * 10} · DE${String(89 - i).padStart(2, "0")} 2505 0000 ${String(1_000_000_000 + i * 7_919_311).slice(0, 10).replace(/(\d{4})(\d{4})(\d{2})/, "$1 $2 $3")}`,
    count: (i * 37) % 180,
    group: "Bank",
  })),
  ...Array.from({ length: 6 }, (_, i) => ({
    key: `cash-${i}`,
    label: i === 0 ? "Hauptkasse" : `Kasse Filiale ${i}`,
    hint: String(1000 + i),
    count: (i * 13) % 40,
    group: "Kasse",
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    key: `card-${i}`,
    label: `Firmenkreditkarte ${["Visa", "Mastercard", "Amex"][i % 3]} ${i + 1}`,
    hint: String(1360 + i),
    count: (i * 7) % 25,
    group: "Kreditkarte",
  })),
];

/* ── Stories ────────────────────────────────────────────────────────────── */

/** Six document types with their counts, two ticked; under 8 options there is no search. */
export const Filled: Story = {
  render: function Render() {
    const [keys, setKeys] = useState<string[]>(["invoice", "credit_note"]);
    return (
      <Frame>
        <MultiSelectFilter label="Belegart" options={DOCUMENT_TYPES} selected={keys} onChange={setKeys} />
      </Frame>
    );
  },
  play: openOnLoad,
};

/** Without options the trigger is locked and says why; beside it `disabled` with values. */
export const Empty: Story = {
  render: () => (
    <Frame>
      <div style={{ display: "flex", gap: "var(--space-4)" }}>
        <MultiSelectFilter label="Belegart" options={[]} selected={[]} />
        <MultiSelectFilter label="Belegart" options={DOCUMENT_TYPES} selected={["invoice"]} disabled />
      </div>
    </Frame>
  ),
};

/** Forty accounts in three groups, number under the name; the search field appears by itself. */
export const Groups: Story = {
  render: function Render() {
    const [keys, setKeys] = useState<string[]>(["bank-0", "cash-0"]);
    return (
      <Frame>
        <MultiSelectFilter
          label="Zahlungskonto"
          options={ACCOUNTS}
          selected={keys}
          onChange={setKeys}
          searchPlaceholder="Name, Nummer oder IBAN"
        />
      </Frame>
    );
  },
  play: openOnLoad,
};

/** A search without hits says so with the word that was typed (T6). */
export const NoMatch: Story = {
  render: function Render() {
    const [keys, setKeys] = useState<string[]>([]);
    return (
      <Frame>
        <MultiSelectFilter label="Zahlungskonto" options={ACCOUNTS} selected={keys} onChange={setKeys} />
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>("button[aria-haspopup]")?.click();
    await new Promise((r) => setTimeout(r, 50));
    const input = document.querySelector<HTMLInputElement>(".v3msel__search");
    if (!input) return;
    // React listens to the native setter, not to `value =`.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, "zzz");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  },
};

/** The right-hand side: count only, badge only, both, neither; 0 and 12.345. */
export const RightSide: Story = {
  render: function Render() {
    const [keys, setKeys] = useState<string[]>(["overdue"]);
    const options: MultiSelectOption[] = [
      { key: "count", label: "Nur Anzahl", count: 12_345 },
      { key: "badge", label: "Nur Badge", badge: <Badge tone="info">neu</Badge> },
      { key: "overdue", label: "Badge und Anzahl", badge: <Badge tone="warning">überfällig</Badge>, count: 7 },
      { key: "plain", label: "Weder noch" },
      { key: "zero", label: "Anzahl null", count: 0 },
    ];
    return (
      <Frame>
        <MultiSelectFilter label="Rechte Spalte" options={options} selected={keys} onChange={setKeys} />
      </Frame>
    );
  },
  play: openOnLoad,
};

/** Round trip: the keys come back in the order of `options`, not of the clicks. */
export const Interactive: Story = {
  render: function Render() {
    const [keys, setKeys] = useState<string[]>([]);
    return (
      <Frame>
        <MultiSelectFilter label="Belegart" options={DOCUMENT_TYPES} selected={keys} onChange={setKeys} />
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
          selected = [{keys.map((k) => `"${k}"`).join(", ")}]
        </p>
      </Frame>
    );
  },
};

/** Server form: one hidden field per tick; submitting shows the query string. */
export const ServerForm: Story = {
  render: function Render() {
    const [keys, setKeys] = useState<string[]>(["invoice", "receipt"]);
    const [sent, setSent] = useState<string | null>(null);
    return (
      <Frame>
        <form
          method="get"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget);
            setSent(new URLSearchParams(data as unknown as string[][]).toString());
          }}
        >
          <FilterBar activeCount={keys.length > 0 ? 1 : 0} resetHref="#" submitLabel="Filtern">
            <MultiSelectFilter
              label="Belegart"
              name="type"
              options={DOCUMENT_TYPES}
              selected={keys}
              onChange={setKeys}
            />
          </FilterBar>
        </form>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
          {sent === null ? "Noch nicht abgesendet." : `?${sent}`}
        </p>
      </Frame>
    );
  },
};

type InboxRow = { id: string; name: string; type: string; status: "open" | "problem"; amount: number };
const INBOX: InboxRow[] = [
  { id: "1", name: "RE-4471_Buerobedarf_Meier.pdf", type: "invoice", status: "open", amount: 64.9 },
  { id: "2", name: "Quittung_Tankstelle_0826.pdf", type: "receipt", status: "open", amount: 72.4 },
  { id: "3", name: "GS-0193_Werbeagentur_Nord.pdf", type: "credit_note", status: "problem", amount: -120 },
  { id: "4", name: "Bank_2026_08.xlsx", type: "bank_statement", status: "open", amount: 0 },
  { id: "5", name: "RE-2026-0815_Stadtwerke.pdf", type: "invoice", status: "problem", amount: 213.4 },
  { id: "6", name: "Mietvertrag_Musterstrasse.pdf", type: "contract", status: "open", amount: 1450 },
  { id: "7", name: "RE-88213_Kfz_Berger.pdf", type: "invoice", status: "open", amount: 1276.55 },
];
const TYPE_LABEL = Object.fromEntries(DOCUMENT_TYPES.map((o) => [o.key, o.label]));

/** In the inbox: search, status chips and document types filter the list live. */
export const InUse: Story = {
  render: function Render() {
    const [types, setTypes] = useState<string[]>([]);
    const [status, setStatus] = useState("all");
    const [q, setQ] = useState("");
    const typeOptions = useMemo(
      () =>
        DOCUMENT_TYPES.map((o) => ({ ...o, count: INBOX.filter((r) => r.type === o.key).length })).filter(
          (o) => o.count > 0,
        ),
      [],
    );
    const rows = INBOX.filter(
      (r) =>
        (types.length === 0 || types.includes(r.type)) &&
        (status === "all" || r.status === status) &&
        r.name.toLowerCase().includes(q.toLowerCase()),
    );
    const active = (types.length > 0 ? 1 : 0) + (status !== "all" ? 1 : 0) + (q ? 1 : 0);
    return (
      <div style={{ maxWidth: 820, minHeight: 480 }}>
        <FilterBar
          activeCount={active}
          onReset={() => {
            setTypes([]);
            setStatus("all");
            setQ("");
          }}
        >
          <SearchInput placeholder="Dateiname" value={q} onChange={setQ} />
          <FilterChips
            label="Status"
            active={status}
            onPick={setStatus}
            options={[
              { key: "all", label: "Alle", count: INBOX.length },
              { key: "problem", label: "Problematisch", count: INBOX.filter((r) => r.status === "problem").length },
            ]}
          />
          <MultiSelectFilter label="Belegart" options={typeOptions} selected={types} onChange={setTypes} />
        </FilterBar>
        <Card>
          <CardHead title="Eingang" sub={`${rows.length} von ${INBOX.length} Belegen`} />
          {rows.length === 0 ? (
            <div style={{ padding: "var(--space-5)" }}>
              <EmptyState title="Kein Beleg passt zu diesen Filtern." description="Setzen Sie die Filter zurück." />
            </div>
          ) : (
            <Table cols="1fr 140px 130px">
              <HeadRow>
                <th>Datei</th>
                <th>Belegart</th>
                <th style={{ textAlign: "right" }}>Betrag</th>
              </HeadRow>
              {rows.map((r) => (
                <Row key={r.id}>
                  <td>{r.name}</td>
                  <td>{TYPE_LABEL[r.type]}</td>
                  <AmountCell value={r.amount} />
                </Row>
              ))}
            </Table>
          )}
        </Card>
      </div>
    );
  },
};

/** 200 options, a label of 80 characters, a narrow bar: clipped with the whole text as tooltip. */
export const Edge: Story = {
  render: function Render() {
    const long = "Eingangsrechnung Wartung und Instandsetzung der Klima- und Lüftungsanlage Halle 3";
    const options: MultiSelectOption[] = [
      { key: "long", label: long, count: 1 },
      ...Array.from({ length: 199 }, (_, i) => ({
        key: `o-${i}`,
        label: `Kostenstelle ${String(100 + i).padStart(4, "0")}`,
        count: (i * 97) % 1000,
      })),
    ];
    const [keys, setKeys] = useState<string[]>(["long"]);
    return (
      <Frame>
        <div style={{ width: 240 }}>
          <FilterBar>
            <MultiSelectFilter label="Kostenstelle" options={options} selected={keys} onChange={setKeys} />
          </FilterBar>
        </div>
      </Frame>
    );
  },
  play: openOnLoad,
};
