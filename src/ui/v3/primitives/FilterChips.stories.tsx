import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import type { DuoSyncState } from "@/ludwig/modules/intake";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import { StatusBadge } from "../patterns/StatusBadge";
import { FilterChips, SearchInput } from "./Nav";
import { Card, CardHead, EmptyRow, GroupRow, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof FilterChips> = { title: "v3/Primitives/Navigation/FilterChips", component: FilterChips };
export default meta;
type Story = StoryObj<typeof FilterChips>;

const OPTIONS = [
  { key: "alle", label: "Alle" },
  { key: "offen", label: "Offen" },
  { key: "faellig", label: "Fällig" },
  { key: "erledigt", label: "Erledigt" },
];

/** Chips stehen über der Karte, nie im Kartenkopf (Baukasten §6). */
export const ByDimension: Story = {
  render: function Render() {
    const [active, setActive] = useState("offen");
    return <FilterChips label="Stand" options={OPTIONS} active={active} onPick={setActive} />;
  },
};

/** Mit Zählern: die Nutzerin sieht vor dem Klick, ob sich der Filter lohnt. */
export const WithCounters: Story = {
  render: function Render() {
    const [active, setActive] = useState("alle");
    return (
      <FilterChips
        label="Stand"
        options={[
          { key: "alle", label: "Alle", count: 118 },
          { key: "offen", label: "Offen", count: 12 },
          { key: "faellig", label: "Fällig", count: 4 },
          { key: "erledigt", label: "Erledigt", count: 102 },
        ]}
        active={active}
        onPick={setActive}
      />
    );
  },
};

/** Chips und Suche in einer Zeile — die übliche Toolbar über der Tabelle. */
export const WithSearch: Story = {
  render: function Render() {
    const [active, setActive] = useState("offen");
    const [q, setQ] = useState("");
    return (
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <FilterChips label="Stand" options={OPTIONS} active={active} onPick={setActive} />
        <SearchInput placeholder="Suche nach Gegenpartei, Betrag …" value={q} onChange={setQ} />
      </div>
    );
  },
};

/* ── 0272: a locked option, and the state line of a batch run ─────────── */

/**
 * Three lines: a zero stays in its place, grey and out of the tab order; an
 * active option at 0 stays pickable (the way out of a filter that ran empty);
 * as links a locked option is a `span`.
 */
export const FilterChipsDisabled: Story = {
  render: function Render() {
    const [active, setActive] = useState("all");
    // Words from the registry, not a second list (0272 acceptance H2).
    const counts: Record<string, number> = { all: 12, succeeded_with_issues: 1, cancelled: 0, running: 1, succeeded: 8 };
    const options = Object.keys(counts).map((key) => ({
      key,
      label: key === "all" ? "Alle" : resolveStatus("duo_sync", key).label,
      count: counts[key],
      disabled: counts[key] === 0,
    }));
    return (
      <div style={{ display: "grid", gap: "var(--space-5)" }}>
        <FilterChips label="Stand" options={options} active={active} onPick={setActive} />
        <FilterChips label="Aktiv mit 0" options={options} active="cancelled" onPick={() => undefined} />
        <FilterChips label="Als Links" options={options.map((o) => ({ ...o, href: `#stand=${o.key}` }))} active="all" />
      </div>
    );
  },
};

interface BatchClient {
  id: string;
  name: string;
  state: DuoSyncState;
  /** What the run left — the short result, or the reason it was skipped. */
  note?: string;
}

const BATCH: BatchClient[] = [
  { id: "10001", name: "Musterfirma GmbH", state: "succeeded", note: "12 Belege übertragen, Kontoumsätze von 2 Konten" },
  { id: "10002", name: "Bäckerei Schneider e.K.", state: "succeeded_with_issues", note: "3 Belege nicht übertragen" },
  { id: "10003", name: "Elektro Wagner GmbH & Co. KG", state: "running", note: "Neue Belege aus DATEV holen · Beleg 37 von 120" },
  { id: "10004", name: "Praxis Dr. Hoffmann", state: "queued" },
  { id: "10005", name: "Autohaus Becker GmbH", state: "queued" },
  { id: "10006", name: "Gartenbau Krüger", state: "queued" },
  { id: "10007", name: "Weinhandlung Lehmann OHG", state: "queued" },
  { id: "10008", name: "Zahnarztpraxis Dr. Yilmaz", state: "queued" },
  { id: "10009", name: "Schreinerei Fuchs GmbH", state: "queued" },
  { id: "10010", name: "Hotel Seeblick Betriebs-GmbH", state: "queued" },
  { id: "10011", name: "Ingenieurbüro Brandt", state: "skipped", note: "Keine DATEV-Mandantennummer in Ludwig" },
  { id: "10012", name: "Kita Sonnenschein gGmbH", state: "skipped", note: "Einrichtung in Ludwig noch nicht abgeschlossen" },
];

/** Attention first — the page's order, not the registry's. */
const LINE_ORDER: DuoSyncState[] = ["succeeded_with_issues", "cancelled", "running", "queued", "succeeded", "skipped"];
const WITH_ISSUES = new Set<DuoSyncState>(["succeeded_with_issues", "cancelled"]);

/**
 * The page task of 0272 (plugin A8/A13): words from the registry axis `duo_sync`,
 * counted from the list itself; a zero is locked in place. Below, the clients
 * with issues first, then all others in their fixed order.
 */
export const StateCountLine: Story = {
  render: function Render() {
    const [active, setActive] = useState<string>("all");
    const count = (s: DuoSyncState) => BATCH.filter((c) => c.state === s).length;
    const options = [
      { key: "all", label: "Alle", count: BATCH.length },
      ...LINE_ORDER.map((s) => ({
        key: s,
        label: resolveStatus("duo_sync", s).label,
        count: count(s),
        disabled: count(s) === 0,
      })),
    ];
    const shown = active === "all" ? BATCH : BATCH.filter((c) => c.state === active);
    const issues = shown.filter((c) => WITH_ISSUES.has(c.state));
    const rest = shown.filter((c) => !WITH_ISSUES.has(c.state));
    const row = (c: BatchClient) => (
      <Row key={c.id}>
        <span className="v2main">{c.name}</span>
        <StatusBadge axis="duo_sync" status={c.state} info={false} />
        <span>{c.note ?? ""}</span>
      </Row>
    );
    return (
      <div style={{ display: "grid", gap: "var(--space-3)", maxWidth: "var(--container-narrow)" }}>
        <FilterChips label="Stand" options={options} active={active} onPick={setActive} />
        <Card>
          <CardHead title="Mandanten" sub={`${shown.length} von ${BATCH.length}`} />
          <Table cols="minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1.6fr)">
            <HeadRow>
              <span>Mandant</span>
              <span>Stand</span>
              <span>Ergebnis</span>
            </HeadRow>
            {shown.length === 0 ? (
              <EmptyRow>
                Kein Mandant mit diesem Stand.{" "}
                <button type="button" className="v2link" onClick={() => setActive("all")}>
                  Alle Mandanten zeigen
                </button>
              </EmptyRow>
            ) : null}
            {issues.length > 0 ? <GroupRow>Mit Problemen · {issues.length}</GroupRow> : null}
            {issues.map(row)}
            {rest.length > 0 && issues.length > 0 ? <GroupRow>Alle übrigen · {rest.length}</GroupRow> : null}
            {rest.map(row)}
          </Table>
        </Card>
      </div>
    );
  },
};
