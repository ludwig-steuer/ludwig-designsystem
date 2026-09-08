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
import {
  DataTable,
  type AnyBulkAction,
  type BulkAction,
  type ColumnDef,
  type ListPatch,
  rowAction,
  type RowAction,
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

/* ── Daten: die Sachverhalte eines Jahres ──────────────────────────────────
   583 gedacht, 50 auf der Seite — die Größe, ab der Sortierung, Seitengröße
   und Auswahl überhaupt eine Frage sind. */

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
  // Sieben Stunden je Zeile rückwärts ab dem 26.08.2026 — so steht die Liste
  // absteigend nach „Eröffnet", wie `sort` es behauptet.
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

/** Die Seite baut die URL — hier nur sichtbar gemacht, Storybook folgt keinem Link. */
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

/** Der Titel trägt die Gegenpartei schon in sich („<Belegart>: <Lieferant>"). */
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

/** Z4: kein Kopf „Status" — die Achse heißt hier Bearbeitung. */
// Die Status-Spalte trägt ihr (i) am Kopf, nicht in jeder Zeile (Z4) — und
// zwar über `headerAside`, damit der Knopf **neben** dem Sortier-Link steht
// und nicht darin: ein Knopf in einem `<a>` ist ungültiges HTML (0094 b).
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

/* ── Die zehn Stories ──────────────────────────────────────────────────── */

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
    // Nebeneinander, damit die beiden Texte im selben Blick stehen — dafür mit
    // drei Spalten statt fünf, sonst passen zwei Karten nicht in eine Breite.
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
      // Daneben eine, die einfach läuft — die Liste trägt beide Sorten.
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
          // **Ohne `primary`** — und das ist der Nachweis: bei drei Aktionen
          // zieht E8 alles außer den primären ins Menü, und dort muss dieselbe
          // Aktion denselben Dialog öffnen. Mit `primary: true` blieb sie
          // inline, und der Menü-Pfad war unbewiesen (Abnahme 0122, M2).
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
