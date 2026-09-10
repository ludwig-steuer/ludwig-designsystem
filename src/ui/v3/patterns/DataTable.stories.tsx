import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  caseKindLabel,
  type CaseKind,
  type CaseLifecycle,
  type CaseListItem,
} from "@/ludwig/modules/accounting-cases/domain/case";

import { Button } from "../primitives/Button";
import { AmountCell, MonoCell, Timestamp } from "../primitives/Cells";
import { FieldList } from "../primitives/FieldList";
import { Field, Select } from "../primitives/Form";
import { FilterBar } from "../primitives/FilterBar";
import { FilterChips, SearchInput } from "../primitives/Nav";
import { TextButton } from "../primitives/TextButton";
import { formatAmount } from "../format";
import {
  DataTable,
  type AnyBulkAction,
  type BulkAction,
  type ColumnDef,
  type ListPatch,
  rowAction,
  type RowAction,
  type TableGroup,
} from "./DataTable";
import { bulkAction } from "../primitives/Selection";
import { StatusBadge } from "./StatusBadge";
import { StatusInfoButton } from "./StatusInfoButton";

const meta: Meta<typeof DataTable> = {
  title: "v3/Patterns/Arbeitsfläche/DataTable",
  component: DataTable,
};
export default meta;
type Story = StoryObj<typeof DataTable>;

/* ── Data: a year's cases ─────────────────────────────────────────────────
   583 imagined, 50 per page — the size where sorting, page size and selection
   become questions at all. */

const PARTNERS: Array<[string, string, CaseKind, number]> = [
  ["Musterfirma GmbH", "Eingangsrechnung: Musterfirma GmbH", "incoming_invoice", 1800],
  ["Vermieter Musterstraße", "Dauersachverhalt: Vermieter Musterstraße", "recurring_charge", 1450],
  ["Werbeagentur Nord", "Eingangsrechnung: Werbeagentur Nord", "incoming_invoice", 420],
  ["Bürobedarf GmbH", "Eingangsrechnung: Bürobedarf GmbH", "incoming_invoice", 64.9],
  ["Telekom Deutschland", "Dauersachverhalt: Telekom Deutschland", "recurring_charge", 89],
  ["Stadtwerke Musterstadt", "Dauersachverhalt: Stadtwerke Musterstadt", "recurring_charge", 213.4],
  ["Kfz-Werkstatt Berger", "Eingangsrechnung: Kfz-Werkstatt Berger", "incoming_invoice", 1276.55],
  ["Hotel Adler", "Auslagen: Hotel Adler", "expense_report", 348.2],
];

const LIFECYCLES: CaseLifecycle[] = [
  "open",
  "needs_clarification",
  "closed_accepted",
  "waiting_for_documents",
  "open",
  "closed_accepted",
  "open",
  "needs_clarification",
];

const SUMMARIES = [
  "Rechnung über Wartung der Klimaanlage, Leistung im August erbracht.",
  "Monatliche Miete für die Geschäftsräume, Vertrag bis 12/2027.",
  "Kampagne Sommer 2026, zweite Teilrechnung von drei.",
  "Sammelrechnung Büromaterial, 14 Positionen.",
  "Mobilfunk und Festnetz, Abrechnungszeitraum August.",
  "Strom und Wasser, Jahresabrechnung mit Nachzahlung.",
  "Inspektion und Bremsen am Firmenwagen.",
  "Übernachtung Fachmesse, zwei Nächte, Frühstück getrennt ausgewiesen.",
];

function makeCase(i: number): CaseListItem {
  const [counterpartyName, title, kind, base] = PARTNERS[i % PARTNERS.length]!;
  const lifecycleStatus = LIFECYCLES[i % LIFECYCLES.length]!;
  // Seven hours per row backwards from 2026-08-26 — so the list descends by
  // "Eröffnet", as `sort` claims.
  const openedAt = new Date(Date.UTC(2026, 7, 26, 7, 40) - i * 7 * 3_600_000).toISOString();
  return {
    caseId: `case-${417 + i}`,
    caseNumber: `2026-${String(417 + i).padStart(4, "0")}`,
    clientId: "client-1",
    fiscalYear: 2026,
    kind,
    title,
    summary: SUMMARIES[i % SUMMARIES.length]!,
    counterpartyName,
    counterpartyPartnerId: `bp-${880 + (i % PARTNERS.length)}`,
    currency: "EUR",
    totalAmount: base + (i % 5) * 12.5,
    lifecycleStatus,
    disposition: lifecycleStatus === "open" ? "accounting" : "agent",
    documentEventsCount: 1,
    bankEventsCount: i % 3 === 0 ? 1 : 0,
    openClarificationsCount: lifecycleStatus === "needs_clarification" ? 1 : 0,
    hasOpenDocumentRequest: lifecycleStatus === "waiting_for_documents",
    openedAt,
    closedAt: lifecycleStatus.startsWith("closed") ? openedAt : null,
    exportStatus: null,
  };
}

const PAGE: CaseListItem[] = Array.from({ length: 50 }, (_, i) => makeCase(i));
const rowKey = (c: CaseListItem) => c.caseNumber ?? c.caseId;

/** The page builds the URL — made visible here; Storybook follows no link. */
const href = (patch: ListPatch) =>
  `?${new URLSearchParams(
    Object.entries(patch).map(([k, v]) => [k === "pageSize" ? "size" : k, String(v)]),
  ).toString()}`;

const NUMBER: ColumnDef<CaseListItem> = {
  key: "caseNumber",
  header: "Nummer",
  width: "110px",
  cell: (c) => <MonoCell value={c.caseNumber} />,
};

/** The title already contains the counterparty ("<kind>: <supplier>"). */
const TITLE: ColumnDef<CaseListItem> = {
  key: "title",
  header: "Sachverhalt",
  cell: (c) => <span className="v2main">{c.title}</span>,
};

const AMOUNT: ColumnDef<CaseListItem> = {
  key: "totalAmount",
  header: "Betrag",
  width: "130px",
  align: "end",
  sortable: true,
  cell: (c) => <AmountCell value={c.totalAmount} currency={c.currency} />,
};

/** Z4: no "Status" head — the axis is called Bearbeitung here. */
// The status column carries its (i) at the head, not in every row (Z4) — via
// `headerAside`, so the button stands **next to** the sort link, not in it: a
// button inside an `<a>` is invalid HTML (0094 b).
const LIFECYCLE: ColumnDef<CaseListItem> = {
  key: "lifecycleStatus",
  header: "Bearbeitung",
  headerAside: <StatusInfoButton axis="sachverhalt" />,
  width: "190px",
  sortable: true,
  cell: (c) => <StatusBadge axis="sachverhalt" status={c.lifecycleStatus} info={false} />,
};

const OPENED: ColumnDef<CaseListItem> = {
  key: "openedAt",
  header: "Eröffnet",
  width: "150px",
  sortable: true,
  cell: (c) => <Timestamp iso={c.openedAt} />,
};

const COLUMNS = [NUMBER, TITLE, AMOUNT, LIFECYCLE, OPENED];

const PAGER = { page: 1, pageSize: 50, totalItems: 583, totalPages: 12 };
const HEAD = { title: "Sachverhalte 2026", sub: "583 Sachverhalte · 50 auf dieser Seite" };
const SORT = { key: "openedAt", dir: "desc" } as const;

/* ── The ten stories ─────────────────────────────────────────────────────── */

/**
 * Der Normalfall: 50 von 583, sortiert nach „Eröffnet" absteigend — die
 * aktive Spalte trägt den Pfeil, und der Link sagt den Stand in Worten
 * („Nach Eröffnet sortieren — derzeit absteigend"). „Betrag" ist ein Link
 * ohne Pfeil. Jede Zeile führt über den Overlay-Link der ersten Spalte in den
 * Sachverhalt, unten steht der Seitenwechsel.
 */
export const Filled: Story = {
  render: () => (
    <DataTable<CaseListItem>
      rows={PAGE}
      columns={COLUMNS}
      rowKey={rowKey}
      head={{ ...HEAD, actions: <TextButton href="#neu">Sachverhalt anlegen</TextButton> }}
      sort={SORT}
      href={href}
      pager={PAGER}
      rowHref={(c) => `#sachverhalt-${rowKey(c)}`}
    />
  ),
};

/**
 * Zwei Leerheiten, zwei Texte (T6): links **nie befüllt** mit der Handlung,
 * die etwas ändern würde; rechts **erledigt** mit Haken und der Zahl (L6).
 * Der Spaltenkopf steht in beiden Fällen.
 */
export const Empty: Story = {
  render: () => (
    // Side by side, so both texts are in one view — with three columns instead
    // of five, or two cards do not fit one width.
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <DataTable<CaseListItem>
        rows={[]}
        columns={[NUMBER, TITLE, AMOUNT]}
        rowKey={rowKey}
        head={{ title: "Sachverhalte 2026", sub: "0 Sachverhalte" }}
        empty={{
          title: "Noch keine Sachverhalte für 2026.",
          description: "Sobald Belege eingehen, legt Ludwig die Sachverhalte an.",
          action: <Button href="#upload">Belege hochladen</Button>,
        }}
      />
      <DataTable<CaseListItem>
        rows={[]}
        columns={[NUMBER, TITLE, AMOUNT]}
        rowKey={rowKey}
        head={{ title: "Offene Sachverhalte 2026", sub: "0 offen" }}
        empty={{ done: true, title: "Alle 47 Sachverhalte sind gebucht." }}
      />
    </div>
  ),
};

/**
 * Leer **nach Filter**: der Text nennt den Filter, der ihn leert, und der
 * Weg zurück ist ein Link auf die ungefilterte Seite.
 */
export const EmptyFiltered: Story = {
  render: () => (
    <DataTable<CaseListItem>
      rows={[]}
      columns={COLUMNS}
      rowKey={rowKey}
      head={{ title: "Sachverhalte 2026", sub: "0 von 583" }}
      sort={SORT}
      href={href}
      filtered={{ summary: "Status offen · Betrag > 1.000 €", resetHref: "?page=1" }}
    />
  ),
};

/** Lädt: Kopf und Spaltenkopf bleiben stehen, fünf Ladezeilen, kein Seitenwechsel (I7). */
export const Loading: Story = {
  render: () => (
    <DataTable<CaseListItem>
      rows={[]}
      columns={COLUMNS}
      rowKey={rowKey}
      head={HEAD}
      sort={SORT}
      href={href}
      pager={PAGER}
      loading
    />
  ),
};

/** Fehler: Was · Ursache · nächster Schritt (T5), mit einer Handlung daneben. */
export const Error: Story = {
  render: () => (
    <DataTable<CaseListItem>
      rows={[]}
      columns={COLUMNS}
      rowKey={rowKey}
      head={HEAD}
      sort={SORT}
      href={href}
      pager={PAGER}
      error={{
        message:
          "Die Sachverhalte konnten nicht geladen werden. Die Verbindung zur Datenbank ist abgebrochen. Laden Sie die Liste erneut.",
        retry: (
          <Button size="sm" href="?page=1">
            Erneut laden
          </Button>
        ),
      }}
    />
  ),
};

/**
 * Dieselben acht Zeilen dreimal (E9): `compact` fürs Kontenblatt, `default`
 * die heutige Zeile, `wide` mit der Zusammenfassung als zweiter Zeile in der
 * Titelzelle. Die Seite entscheidet das, nicht die Nutzerin (V1).
 */
export const Density: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20 }}>
      {(["compact", "default", "wide"] as const).map((density) => (
        <DataTable<CaseListItem>
          key={density}
          density={density}
          rows={PAGE.slice(0, 8)}
          columns={
            density === "wide"
              ? [
                  NUMBER,
                  {
                    ...TITLE,
                    cell: (c) => (
                      <div>
                        <div className="v2main">{c.title}</div>
                        <div className="v2sub">{c.summary}</div>
                      </div>
                    ),
                  },
                  AMOUNT,
                  LIFECYCLE,
                  OPENED,
                ]
              : COLUMNS
          }
          rowKey={rowKey}
          head={{ title: "Sachverhalte 2026", sub: density }}
          sort={SORT}
          href={href}
        />
      ))}
    </div>
  ),
};

/**
 * Der Rundlauf: drei Zeilen wählen (Shift-Klick nimmt den Bereich), die
 * Kopf-Checkbox steht bei Teilauswahl auf `indeterminate`, und die Leiste
 * ersetzt „Sachverhalt anlegen" im Kartenkopf, solange etwas gewählt ist (E5).
 * `F` und der Klick rufen dieselbe Handlung; danach ist die Auswahl leer.
 */
export const Selection: Story = {
  render: function Render() {
    const [released, setReleased] = useState<string[]>([]);
    const actions: BulkAction[] = [
      {
        label: "Freigeben",
        hotkey: "F",
        action: async (keys) => {
          setReleased(keys);
        },
      },
    ];
    return (
      <DataTable<CaseListItem>
        rows={PAGE.slice(0, 8)}
        columns={COLUMNS}
        rowKey={rowKey}
        head={{
          title: "Sachverhalte 2026",
          sub:
            released.length > 0
              ? `${released.length} freigegeben: ${released.join(", ")}`
              : "8 von 583 · drei Zeilen wählen, dann F",
          actions: <TextButton href="#neu">Sachverhalt anlegen</TextButton>,
        }}
        sort={SORT}
        href={href}
        selection={{
          actions,
          label: (c) => `Sachverhalt ${rowKey(c)} auswählen`,
        }}
      />
    );
  },
};

/**
 * **Die Auswahl-Leiste bleibt stehen** (F202). Fünfzig Zeilen, und die Leiste
 * klebt am oberen Rand, sobald man scrollt.
 *
 * Der Fall dafür ist die Stapelabnahme: wer zwanzig Zeilen abhakt, steht beim
 * letzten Haken am Tabellenende — und der Knopf, der alle freigibt, ist dann
 * aus dem Bild. Über einer Liste von fünf Zeilen wäre dieselbe Prop eine
 * Leiste, die an nichts klebt; deshalb ist sie aus, wo der Aufrufer nichts
 * sagt.
 *
 * Zum Ausprobieren: drei Zeilen wählen, dann scrollen.
 */
export const StickySelection: Story = {
  render: function Render() {
    const actions: BulkAction[] = [
      { label: "Freigeben", hotkey: "F", action: async () => {} },
      { label: "Zurückstellen", action: async () => {} },
    ];
    return (
      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        <DataTable<CaseListItem>
          rows={PAGE}
          columns={COLUMNS}
          rowKey={rowKey}
          head={{ title: "Sachverhalte 2026", sub: "50 Zeilen — wählen, dann scrollen" }}
          selection={{ actions, label: (c) => `${rowKey(c)} auswählen`, sticky: true }}
        />
      </div>
    );
  },
};

/**
 * **Die Sammelaktion, die erst fragt** (0121). „Zuordnen" öffnet einen Dialog
 * mit dem Ziel darin; erst danach läuft die Handlung, und sie bekommt beides
 * — die gewählten Zeilen **und** den erfragten Wert. Der Titel nennt die Zahl,
 * deshalb ist `ask` eine Funktion der Schlüssel.
 *
 * Was im Dialog steht, kennt die Tabelle nicht: hier ein Auswahlfeld, in
 * `banks/offen` der `CasePicker`. Ein Pattern kennt keine Entität.
 */
export const BulkAsk: Story = {
  render: function Render() {
    const [note, setNote] = useState<string | null>(null);
    const actions: AnyBulkAction[] = [
      bulkAction<string>({
        label: "Zuordnen",
        hotkey: "Z",
        ask: (keys) => ({
          title: `${keys.length} Sachverhalte zuordnen`,
          confirmLabel: "Zuordnen",
          initial: "",
          valid: (v) => v !== "",
          render: ({ value, set }) => (
            <Field label="Ziel" htmlFor="bulk-target">
              <Select id="bulk-target" value={value} onChange={(e) => set(e.target.value)}>
                <option value="">Bitte wählen</option>
                <option value="Bürobedarf Meier GmbH">Bürobedarf Meier GmbH</option>
                <option value="Musterbau GmbH">Musterbau GmbH</option>
              </Select>
            </Field>
          ),
        }),
        action: async (keys, target) => {
          setNote(`${keys.length} zugeordnet an ${target}`);
        },
      }),
      // Next to it one that simply runs — the list carries both kinds.
      { label: "Verwerfen", action: async () => setNote(null) },
    ];
    return (
      <DataTable<CaseListItem>
        rows={PAGE.slice(0, 8)}
        columns={COLUMNS}
        rowKey={rowKey}
        head={{
          title: "Sachverhalte 2026",
          sub: note ?? "8 von 583 · zwei Zeilen wählen, dann Z",
          actions: <TextButton href="#neu">Sachverhalt anlegen</TextButton>,
        }}
        sort={SORT}
        href={href}
        selection={{ actions, label: (c) => `Sachverhalt ${rowKey(c)} auswählen` }}
      />
    );
  },
};

/**
 * **Die Zeilenaktion, die erst fragt** (0122). Dieselbe Mechanik wie bei der
 * Sammelaktion, nur an einer Zeile: „Zuordnen" öffnet den Dialog, die Handlung
 * bekommt den Wert. `ask` ist hier **kein** Funktionstyp — die Zeile steht
 * schon fest, wenn die Aktion gebaut wird.
 *
 * Daneben eine Aktion mit `confirm` und ein `href`: drei Sorten in einer
 * Leiste, und über zwei hinaus wandern sie ins Menü (E8) — dort öffnet
 * dieselbe Aktion denselben Dialog.
 */
export const RowAsk: Story = {
  render: function Render() {
    const [note, setNote] = useState<string | null>(null);
    return (
      <DataTable<CaseListItem>
        rows={PAGE.slice(0, 5)}
        columns={COLUMNS}
        rowKey={rowKey}
        head={{ title: "Sachverhalte 2026", sub: note ?? "Zuordnen fragt erst" }}
        sort={SORT}
        href={href}
        rowActions={(c) => [
          // **Without `primary`** — that is the proof: with three actions E8 moves
          // all but the primary ones into the menu, and there the same action must
          // open the same dialog (0122, M2).
          rowAction<string>({
            label: "Zuordnen",
            ask: {
              title: `Sachverhalt ${rowKey(c)} zuordnen`,
              confirmLabel: "Zuordnen",
              initial: "",
              valid: (v) => v !== "",
              render: ({ value, set }) => (
                <Field label="Ziel" htmlFor={`row-target-${rowKey(c)}`}>
                  <Select
                    id={`row-target-${rowKey(c)}`}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Bürobedarf Meier GmbH">Bürobedarf Meier GmbH</option>
                    <option value="Musterbau GmbH">Musterbau GmbH</option>
                  </Select>
                </Field>
              ),
            },
            action: async (target) => setNote(`${rowKey(c)} → ${target}`),
          }),
          { label: "Prüfen", href: `#pruefen-${rowKey(c)}`, primary: true },
          {
            label: "Verwerfen",
            tone: "danger",
            confirm: { title: "Verwerfen?", confirmLabel: "Verwerfen", tone: "danger" },
            action: async () => setNote(`${rowKey(c)} verworfen`),
          },
        ]}
      />
    );
  },
};

/**
 * Zeilenaktionen nach Zahl (E8): oben zwei, beide inline. Unten vier — die
 * eine `primary` bleibt stehen, die übrigen ziehen in „Mehr", „Löschen" rot
 * und mit Rückfrage. Beide Karten tragen dazu den Zeilen-Link: im DOM steckt
 * trotzdem kein `<a>` in einem `<a>`.
 */
export const RowActions: Story = {
  render: () => {
    const two = (c: CaseListItem): RowAction[] => [
      { label: "Öffnen", href: `#sachverhalt-${rowKey(c)}` },
      { label: "Zurückstellen", action: async () => {} },
    ];
    const four = (c: CaseListItem): RowAction[] => [
      { label: "Freigeben", primary: true, action: async () => {} },
      { label: "Öffnen", href: `#sachverhalt-${rowKey(c)}` },
      { label: "Zurückstellen", action: async () => {} },
      {
        label: "Löschen",
        tone: "danger",
        action: async () => {},
        confirm: {
          title: `Sachverhalt ${rowKey(c)} löschen?`,
          body: "Der Sachverhalt und seine Zuordnungen werden entfernt. Die Belege bleiben.",
          confirmLabel: "Sachverhalt löschen",
          tone: "danger",
        },
      },
    ];
    return (
      <div style={{ display: "grid", gap: 20 }}>
        <DataTable<CaseListItem>
          rows={PAGE.slice(0, 4)}
          columns={COLUMNS}
          rowKey={rowKey}
          head={{ title: "Zwei Handlungen", sub: "beide stehen in der Zeile" }}
          rowHref={(c) => `#sachverhalt-${rowKey(c)}`}
          rowActions={two}
        />
        <DataTable<CaseListItem>
          rows={PAGE.slice(0, 4)}
          columns={COLUMNS}
          rowKey={rowKey}
          head={{ title: "Vier Handlungen", sub: "eine bleibt, drei ziehen ins Menü" }}
          rowHref={(c) => `#sachverhalt-${rowKey(c)}`}
          rowActions={four}
        />
      </div>
    );
  },
};

/**
 * Aufklappen mit eigenem Renderer je Zeile (E7), zusammen mit der Auswahl:
 * die Checkbox steht vor dem Chevron und schaltet, **ohne** aufzuklappen.
 * `Enter` und `Space` auf der Zeile klappen sie auf.
 */
export const Expand: Story = {
  render: () => (
    <DataTable<CaseListItem>
      rows={PAGE.slice(0, 6)}
      columns={COLUMNS}
      rowKey={rowKey}
      head={{ title: "Sachverhalte 2026", sub: "6 von 583 · Zeile klappt auf" }}
      sort={SORT}
      href={href}
      selection={{ actions: [{ label: "Freigeben", hotkey: "F", action: async () => {} }] }}
      expand={(c) => (
        <FieldList
          tone="bare"
          rows={[
            ["Zusammenfassung", c.summary],
            ["Gegenpartei", c.counterpartyName],
            ["Art", caseKindLabel(c.kind)],
            [
              "Offene Klärungen",
              c.openClarificationsCount === 0
                ? "keine"
                : `${c.openClarificationsCount} offen`,
            ],
          ]}
        />
      )}
    />
  ),
};

/**
 * Wie auf `[year]/cases`: die `FilterBar` steht **über** der Karte (0003, I4),
 * sieben Spalten mit `minWidth`, 25/50/100 je Seite, der nächste Schritt im
 * Kartenfuß.
 */
export const InUse: Story = {
  render: function Render() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("open");
    const columns: ColumnDef<CaseListItem>[] = [
      NUMBER,
      TITLE,
      {
        key: "kind",
        header: "Art",
        width: "150px",
        cell: (c) => <span>{caseKindLabel(c.kind)}</span>,
      },
      AMOUNT,
      LIFECYCLE,
      {
        key: "openClarificationsCount",
        header: "Klärungen",
        width: "110px",
        align: "end",
        cell: (c) =>
          c.openClarificationsCount === 0 ? (
            <span className="v2muted">—</span>
          ) : (
            <span>{c.openClarificationsCount}</span>
          ),
      },
      OPENED,
    ];
    return (
      <div style={{ display: "grid", gap: 12 }}>
        <FilterBar activeCount={2} resetHref="?page=1">
          <FilterChips
            label="Bearbeitung"
            active={status}
            options={[
              { key: "open", label: "Zur Prüfung", count: 47 },
              { key: "needs_clarification", label: "Klärung offen", count: 12 },
              { key: "closed_accepted", label: "Verbucht", count: 524 },
            ]}
            onPick={setStatus}
          />
          <SearchInput
            placeholder="Nummer oder Gegenpartei"
            value={search}
            onChange={setSearch}
          />
        </FilterBar>
        <DataTable<CaseListItem>
          rows={PAGE}
          columns={columns}
          rowKey={rowKey}
          minWidth={1180}
          head={{
            title: "Sachverhalte 2026",
            sub: "583 Sachverhalte · 2 Filter gesetzt",
            actions: <TextButton href="#neu">Sachverhalt anlegen</TextButton>,
          }}
          sort={SORT}
          href={href}
          pager={{ ...PAGER, pageSizeOptions: [25, 50, 100] }}
          rowHref={(c) => `#sachverhalt-${rowKey(c)}`}
          next={
            <TextButton href="#bank">
              Weiter zu Bank · 3 offen
            </TextButton>
          }
        />
      </div>
    );
  },
};

/**
 * **Die Mindestbreite rechnet die Tabelle selbst** (0147) — links ohne
 * `minWidth`, rechts mit `minWidth={0}`. Beide in einem **460 px** breiten
 * Rahmen; die fünf Spalten fordern gerechnet 656 px, es ist also zu eng.
 *
 * Links entsteht ein innerer Scrollrahmen: die Spalten behalten ihre Breite,
 * und wer nach rechts will, scrollt. Rechts quetscht die Tabelle, wie sie es
 * bis 0147 überall tat — Spalten verlieren Breite, bis nichts mehr lesbar ist
 * und am Ende welche aus dem Bild laufen.
 *
 * Der Anlass war ein echter Fall: die Jahres-Belegliste verlor bei 1456 px
 * zwei Spalten nach rechts, **ohne** Scrollbalken. Die Rechnung dafür gab es
 * seit Wochen — sie hieß `sourceDocumentMinWidth`, lag im Beleg-Katalog, und
 * die Seite übergab sie nicht. Eine Prop, die man vergessen kann, ist ein
 * Fehler, der auf seinen Aufrufer wartet (Befund L-273).
 */
export const AutoMinWidth: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "460px 460px", gap: 24 }}>
      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>ohne `minWidth` — gerechnet</div>
        <DataTable<CaseListItem>
          rows={PAGE.slice(0, 4)}
          columns={COLUMNS}
          rowKey={rowKey}
          head={{ title: "Sachverhalte", sub: "scrollt statt zu quetschen" }}
        />
      </div>
      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>`minWidth={0}` — quetscht</div>
        <DataTable<CaseListItem>
          rows={PAGE.slice(0, 4)}
          columns={COLUMNS}
          rowKey={rowKey}
          head={{ title: "Sachverhalte", sub: "so war es bis 0147 überall" }}
          minWidth={0}
        />
      </div>
    </div>
  ),
};

/**
 * `minWidth={0}` ist kein Notausgang, sondern ein gültiger Fall: eine Tabelle
 * mit **einer** flexiblen Spalte hat keinen sinnvollen Boden, und ein
 * gerechneter von 36 px wäre eine Behauptung. Wer quetschen will, sagt es.
 */
export const Squeeze: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <DataTable<CaseListItem>
        rows={PAGE.slice(0, 3)}
        columns={[TITLE]}
        rowKey={rowKey}
        head={{ title: "Nur der Titel", sub: "eine flexible Spalte, kein Boden" }}
        minWidth={0}
      />
    </div>
  ),
};

/**
 * `minWidth={n}` gewinnt über die Rechnung — der Aufrufer weiß es besser.
 * Hier 1600 px, deutlich über dem, was die fünf Spalten fordern.
 */
export const Override: Story = {
  render: () => (
    <div style={{ maxWidth: 700 }}>
      <DataTable<CaseListItem>
        rows={PAGE.slice(0, 3)}
        columns={COLUMNS}
        rowKey={rowKey}
        head={{ title: "Sachverhalte", sub: "minWidth = 1600" }}
        minWidth={1600}
      />
    </div>
  ),
};

/* ── Sections (0149) ───────────────────────────────────────────────────────
   The same table with one more row between rows. The caller computes the
   head's numbers — the table computes nothing (E2). */

function kindGroup(kind: CaseKind, aside = true): TableGroup<CaseListItem> {
  const rows = PAGE.filter((c) => c.kind === kind);
  const sum = rows.reduce((n, c) => n + (c.totalAmount ?? 0), 0);
  return {
    key: kind,
    label: caseKindLabel(kind),
    rows,
    ...(aside ? { aside: `${rows.length} · ${formatAmount(sum, "EUR")}` } : {}),
  };
}

const KIND_GROUPS = [
  {
    ...kindGroup("incoming_invoice"),
    // Z4: the explanation stands **once per section**, not once per row.
    labelAside: "Lieferantenrechnungen mit Beleg",
  },
  kindGroup("recurring_charge"),
  kindGroup("expense_report"),
];

/**
 * Drei Abschnitte: Wort links, Anzahl und Summe rechts, darunter die Zeilen
 * der Gruppe. Der Spaltenkopf steht **einmal** über allem — er gehört der
 * Tabelle, nicht dem Abschnitt.
 *
 * Jeder Abschnitt ist ein eigenes `<tbody>`, seine Überschrift ein
 * `<th scope="rowgroup">`. Damit gilt der Kopf genau für seine Zeilen; in
 * einem einzigen `<tbody>` beanspruchte der erste Kopf auch die Zeilen der
 * beiden anderen.
 */
export const WithGroups: Story = {
  render: () => (
    <DataTable<CaseListItem>
      groups={KIND_GROUPS}
      columns={COLUMNS}
      rowKey={rowKey}
      head={{ title: "Sachverhalte 2026", sub: "50 Sachverhalte nach Art" }}
      sort={SORT}
      href={href}
      rowHref={(c) => `#sachverhalt-${rowKey(c)}`}
    />
  ),
};

/**
 * Links: eine leere Gruppe **mit** `emptyHint` — die Leere ist die Auskunft
 * („kein Satz in diesem Stapel"). Die dritte Gruppe ist ebenfalls leer, hat
 * aber keinen Hinweis und **fällt ganz weg**: eine Überschrift über nichts
 * ist Rauschen.
 *
 * Rechts: **alle** Gruppen leer. Dann greift der eine Leerzustand der Tabelle,
 * nicht drei leere Köpfe untereinander.
 */
export const GroupEmpty: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <DataTable<CaseListItem>
        groups={[
          kindGroup("incoming_invoice", false),
          {
            key: "recurring_charge",
            label: caseKindLabel("recurring_charge"),
            rows: [],
            emptyHint: "Kein Dauersachverhalt in diesem Stapel.",
          },
          { key: "expense_report", label: caseKindLabel("expense_report"), rows: [] },
        ]}
        columns={[NUMBER, TITLE, AMOUNT]}
        rowKey={rowKey}
        head={{ title: "Eine Gruppe leer", sub: "mit Hinweis — und eine ohne" }}
      />
      <DataTable<CaseListItem>
        groups={[
          { key: "incoming_invoice", label: caseKindLabel("incoming_invoice"), rows: [] },
          { key: "recurring_charge", label: caseKindLabel("recurring_charge"), rows: [] },
        ]}
        columns={[NUMBER, TITLE, AMOUNT]}
        rowKey={rowKey}
        head={{ title: "Alle Gruppen leer", sub: "ein Leerzustand, keine Köpfe" }}
        empty={{
          title: "In diesem Stapel steht nichts.",
          description: "Sobald ein Beleg eingeordnet ist, steht er hier.",
        }}
      />
    </div>
  ),
};

/**
 * Auswählen mit Abschnitten: das Kästchen im Gruppenkopf meint **genau** die
 * Zeilen darunter, das im Spaltenkopf weiter alle. Zwei Zeilen einer Gruppe
 * gewählt, und der Gruppenkopf steht auf `indeterminate` — die dritte Stellung
 * eines Kästchens, die es dafür gibt.
 *
 * Die Umschalt-Auswahl läuft über alle Abschnitte hinweg in **Lesereihenfolge**:
 * die Reihenfolge der Auswahl ist die, die man sieht.
 */
export const GroupSelection: Story = {
  render: () => (
    <DataTable<CaseListItem>
      groups={KIND_GROUPS.map((g) => ({ ...g, rows: g.rows.slice(0, 4) }))}
      columns={COLUMNS}
      rowKey={rowKey}
      head={{ title: "Sachverhalte 2026", sub: "nach Art, mit Auswahl" }}
      selection={{
        label: (c) => `${c.title} auswählen`,
        actions: [
          { label: "Exportieren", hotkey: "E", action: async () => {} },
          { label: "Abschließen", action: async () => {} },
        ] satisfies BulkAction[],
      }}
    />
  ),
};

/* ── The booking overview from F186 ───────────────────────────────────────
   The case the sections were ordered for: a batch of entries grouped by record
   type. The type's description sits at the head, not in every row — and the
   type gets no status badge, because it has no criticality (V6). */

interface BatchRow {
  id: string;
  document: string;
  account: string;
  accountName: string;
  text: string;
  amount: number;
}

const BATCH: Array<[string, string, string, string, string, number]> = [
  ["e-1", "RE-2026-4471", "8400", "Erlöse 19 % USt", "Beratung August", 4200],
  ["e-2", "RE-2026-4472", "8400", "Erlöse 19 % USt", "Schulung Musterfirma", 1850],
  ["a-1", "ER-8812", "6300", "Sonstige betriebliche Aufwendungen", "Wartung Klimaanlage", 1800],
  ["a-2", "ER-8813", "6310", "Miete", "Miete Musterstraße 12, August", 1450],
  ["a-3", "ER-8814", "6805", "Telefon", "Mobilfunk und Festnetz", 89],
  ["b-1", "KA-09-114", "1200", "Bank", "Zahlungseingang Musterfirma GmbH", 4998],
  ["b-2", "KA-09-115", "1200", "Bank", "Lastschrift Stadtwerke", 213.4],
  ["k-1", "KB-09-31", "1600", "Kasse", "Porto und Verpackung", 24.9],
  ["s-1", "UB-09-3", "1370", "Durchlaufende Posten", "Umbuchung Geldtransit", 500],
];

const BATCH_ROWS: BatchRow[] = BATCH.map(([id, document, account, accountName, text, amount]) => ({
  id,
  document: document,
  account: account,
  accountName: accountName,
  text,
  amount,
}));

/** The five record types with their description — both come from the app. */
const RECORD_TYPES: Array<[string, string, string]> = [
  ["revenue", "Erlös", "Umsatz aus Lieferung oder Leistung"],
  ["expense", "Aufwand", "Betrieblicher Aufwand mit Beleg"],
  ["bank", "Bank", "Bewegung auf einem Zahlungskonto"],
  ["cash", "Kasse", "Barbewegung mit Kassenbeleg"],
  ["ledger", "Sachkonto", "Umbuchung ohne Zahlung"],
];

const PREFIX: Record<string, string> = {
  revenue: "e",
  expense: "a",
  bank: "b",
  cash: "k",
  ledger: "s",
};

const BATCH_COLUMNS: ColumnDef<BatchRow>[] = [
  { key: "beleg", header: "Belegfeld 1", width: "140px", cell: (r) => <MonoCell value={r.document} /> },
  { key: "konto", header: "Konto", width: "90px", cell: (r) => <MonoCell value={r.account} /> },
  {
    key: "text",
    header: "Buchungstext",
    cell: (r) => (
      <span className="v2main">
        {r.text}
        <span className="v2sub"> · {r.accountName}</span>
      </span>
    ),
  },
  {
    key: "amount",
    header: "Umsatz",
    width: "130px",
    align: "end",
    cell: (r) => <AmountCell value={r.amount} currency="EUR" />,
  },
];

/**
 * Im Einsatz: Schritt 3 der Stapelabnahme (F186). Neun Sätze in fünf
 * Abschnitten — die Sachbearbeiterin sieht „Aufwand · 3 · 3.339,00 €" und
 * weiß, worauf sie schaut, bevor sie eine einzelne Zeile liest.
 *
 * Die Beschreibung der Satzart steht **einmal** am Kopf. In jeder Zeile wäre
 * sie neunmal dasselbe Wort, und als Status-Marke wäre sie eine Aussage, die
 * es nicht gibt: Aufwand ist nicht dringender als Erlös.
 */
export const GroupsInUse: Story = {
  render: () => (
    <DataTable<BatchRow>
      groups={RECORD_TYPES.map(([key, label, note]) => {
        const rows = BATCH_ROWS.filter((r) => r.id.startsWith(`${PREFIX[key]}-`));
        const sum = rows.reduce((n, r) => n + r.amount, 0);
        return {
          key,
          label,
          labelAside: note,
          rows,
          aside: `${rows.length} · ${formatAmount(sum, "EUR")}`,
          emptyHint: `Kein Satz der Art ${label} in diesem Stapel.`,
        };
      })}
      columns={BATCH_COLUMNS}
      rowKey={(r) => r.id}
      head={{
        title: "Stapel 09/2026",
        sub: "9 Buchungssätze · 14.125,30 €",
        actions: <Button variant="primary" size="sm">Stapel festschreiben</Button>,
      }}
      next={<TextButton href="#datev">Als DATEV-Datei ausgeben</TextButton>}
    />
  ),
};
