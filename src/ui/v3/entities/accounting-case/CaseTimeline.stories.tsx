import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import {
  CaseTimeline,
  type CaseTimelineClarification,
  type CaseTimelineEntry,
  type CaseTimelineEvent,
  type CaseTimelineExpectation,
} from "./CaseTimeline";
import { Card, CardHead } from "../../primitives/Table";
import { DetailPane, MasterDetail } from "../../patterns/MasterDetail";
import { Amount } from "../../primitives/Amount";
import { FieldList } from "../../primitives/FieldList";
import { StatusBadge } from "../../patterns/StatusBadge";
import { formatTime } from "../../format";
import { STATUS_REGISTRY } from "@/ludwig/ui/status/status-registry";

const meta: Meta<typeof CaseTimeline> = {
  title: "v3/Entitäten/Sachverhalt/CaseTimeline",
  component: CaseTimeline,
};
export default meta;
type Story = StoryObj<typeof CaseTimeline>;

/** Until the registry carries the `ereignis_art` axis (finding 1 of the spec). */

const TODAY = "2026-09-03";

const EVENTS: CaseTimelineEvent[] = [
  {
    id: "ev-1",
    kind: "document_received",
    date: "2026-07-28",
    title: "Rechnung RE-4471 · Bürobedarf Meier GmbH",
    amount: 1249.9,
    currency: "EUR",
    state: "posted",
  },
  {
    id: "ev-2",
    kind: "payment_out",
    date: "2026-08-12",
    title: "Zahlung an Bürobedarf Meier GmbH",
    amount: 1249.9,
    currency: "EUR",
    state: "accepted",
  },
  {
    id: "ev-3",
    kind: "accrual",
    date: "2026-08-31",
    title: "Abgrenzung Wartungsvertrag 08/2026",
    amount: 320,
    currency: "EUR",
    state: "proposed",
  },
];

const CLARIFICATIONS: CaseTimelineClarification[] = [
  {
    id: "cl-1",
    type: "question",
    title: "Gehört die Rechnung auf 6815 oder auf 6820?",
    raisedAt: "2026-08-04T09:12:00Z",
    answeredAt: "2026-08-05T14:03:00Z",
    severity: "required",
    audience: "accounting",
  },
  {
    id: "cl-2",
    type: "comment",
    title: "Der Kreditor liefert seit Juli über einen neuen Vertrag.",
    raisedAt: "2026-08-12T07:41:00Z",
    severity: "optional",
    audience: "agent",
  },
  {
    id: "cl-3",
    type: "question",
    title: "Fehlt der Lieferschein zur Rechnung RE-4471?",
    raisedAt: "2026-08-25T16:20:00Z",
    severity: "required",
    audience: "accounting",
  },
];

const EXPECTATIONS: CaseTimelineExpectation[] = [
  {
    id: "ex-1",
    kind: "document",
    dueDate: "2026-09-15",
    escalationLevel: 0,
    counterpartyName: "Bürobedarf Meier GmbH",
    amount: 1249.9,
    currency: "EUR",
  },
];

/**
 * Ein Sachverhalt über sechs Wochen: Beleg, Zahlung, Sollstellung, eine
 * beantwortete und eine offene blockierende Frage und die offene
 * Belegerwartung — unsortiert übergeben, `today` fest.
 *
 * Ein Kommentar wird **übersprungen** (Owner 2026-09-04): er ist Kontext am
 * Sachverhalt, nichts, was geschehen ist, und im Bestand sind 13 von 166
 * Klärungszeilen Kommentare — im Strang würden sie den Verlauf zuschütten.
 * Sie stehen in `ClarificationList` (0059). Die Daten unten enthalten einen,
 * damit sichtbar ist, dass er nicht erscheint.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <CaseTimeline
        events={EVENTS}
        clarifications={CLARIFICATIONS}
        expectations={EXPECTATIONS}
        today={TODAY}
      />
    </div>
  ),
};

/** Drei leere Listen: ein Satz, kein Raster. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <CaseTimeline events={[]} today={TODAY} />
    </div>
  ),
};

/** Während der Sachverhalt lädt, steht der Platz — er springt nicht. */
export const Loading: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <CaseTimeline events={[]} loading today={TODAY} />
    </div>
  ),
};

/**
 * Jede Ausprägung einmal: sieben Ereignisarten, die Frage in ihren drei
 * Ständen, beide Erwartungsarten — dazu ein ersetztes Ereignis. Jedes Icon
 * trägt sein Wort. Der Kommentar fehlt, weil der Strang ihn überspringt.
 */
export const EntryKinds: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <CaseTimeline
        today={TODAY}
        events={[
          { id: "k1", kind: "document_received", date: "2026-08-20", title: "Rechnung RE-4471 · Telekom", amount: 89.9, currency: "EUR", state: "posted" },
          { id: "k2", kind: "payment_in", date: "2026-08-19", title: "Zahlung von Musterbau GmbH", amount: 4200, currency: "EUR", state: "accepted" },
          { id: "k3", kind: "payment_out", date: "2026-08-18", title: "Zahlung an Stadtwerke Musterstadt", amount: 412, currency: "EUR", state: "posted" },
          { id: "k4", kind: "internal_transfer", date: "2026-08-17", title: "Umbuchung 1360 an 1200", amount: 900, currency: "EUR", state: "posted" },
          { id: "k5", kind: "adjustment", date: "2026-08-16", title: "Korrekturbuchung Steuerschlüssel", amount: 41.2, currency: "EUR", state: "proposed" },
          { id: "k6", kind: "accrual", date: "2026-08-15", title: "Abgrenzung Wartungsvertrag", amount: 320, currency: "EUR", state: "planned" },
          { id: "k7", kind: "open_item_carryover", date: "2026-08-14", title: "Offener Posten (DATEV)", amount: 1800, currency: "EUR", state: "no_booking_required", stateNote: "Vortrag aus dem Vorjahr, in DATEV bereits gebucht." },
          { id: "k8", kind: "document_received", date: "2026-08-13", title: "Rechnung RE-4470 · ersetzt durch RE-4471", amount: 1249.9, currency: "EUR", state: "posted", superseded: true },
        ]}
        clarifications={[
          { id: "k9", type: "question", title: "Gehört die Rechnung auf 6815?", raisedAt: "2026-08-12T09:00:00Z", severity: "required", audience: "accounting" },
          { id: "k10", type: "comment", title: "Neuer Vertrag seit Juli.", raisedAt: "2026-08-11T09:00:00Z", severity: "optional", audience: "agent" },
        ]}
        expectations={[
          { id: "k11", kind: "document", dueDate: "2026-09-10", escalationLevel: 0, counterpartyName: "Bürobedarf Meier GmbH", amount: 1249.9, currency: "EUR" },
          { id: "k12", kind: "payment", dueDate: "2026-08-25", escalationLevel: 1, counterpartyName: "Musterbau GmbH", amount: 4200, currency: "EUR" },
        ]}
      />
    </div>
  ),
};

/**
 * Der Rundlauf: `onSelect` liefert den Eintrag mit seiner Art, `selectedId`
 * markiert ihn. Rechts daneben die Gegenprobe — ohne `onSelect` ist der Strang
 * Text und enthält keinen Knopf.
 */
export const Interactive: Story = {
  render: function Render() {
    const [entry, setEntry] = useState<CaseTimelineEntry | null>(null);
    const id =
      entry === null
        ? null
        : entry.type === "event"
          ? entry.event.id
          : entry.type === "clarification"
            ? entry.clarification.id
            : entry.expectation.id;
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)", maxWidth: 980 }}>
        <div>
          <div className="lw-overline">Mit onSelect</div>
          <CaseTimeline
            events={EVENTS}
            clarifications={CLARIFICATIONS}
            expectations={EXPECTATIONS}
            today={TODAY}
            selectedId={id}
            onSelect={setEntry}
          />
          <div className="lw-body-sm" style={{ marginTop: "var(--space-4)" }}>
            {entry === null ? "Noch nichts gewählt." : `Gewählt: ${entry.type} · ${id}`}
          </div>
        </div>
        <div>
          <div className="lw-overline">Ohne onSelect — Text</div>
          <CaseTimeline
            events={EVENTS}
            clarifications={CLARIFICATIONS}
            expectations={EXPECTATIONS}
            today={TODAY}
          />
        </div>
      </div>
    );
  },
};

/** Im Einsatz: der Strang links, das Detail des gewählten Eintrags rechts. */
export const InUse: Story = {
  render: function Render() {
    const [entry, setEntry] = useState<CaseTimelineEntry | null>({
      type: "event",
      event: EVENTS[0]!,
    });
    const id =
      entry === null
        ? null
        : entry.type === "event"
          ? entry.event.id
          : entry.type === "clarification"
            ? entry.clarification.id
            : entry.expectation.id;
    return (
      <MasterDetail
        list={
          <Card>
            <CardHead title="Verlauf" sub="6 Einträge · Musterbau GmbH 2026" />
            <div style={{ padding: "var(--space-4) var(--space-5)" }}>
              <CaseTimeline
                events={EVENTS}
                clarifications={CLARIFICATIONS}
                expectations={EXPECTATIONS}
                today={TODAY}
                selectedId={id}
                onSelect={setEntry}
              />
            </div>
          </Card>
        }
        detail={<EntryDetail entry={entry} />}
      />
    );
  },
};

/** The detail the caller provides — here a field list per kind. */
function EntryDetail({ entry }: { entry: CaseTimelineEntry | null }) {
  if (entry === null) {
    return <DetailPane empty="Eintrag wählen für das Detail." />;
  }
  if (entry.type === "event") {
    const e = entry.event;
    return (
      <DetailPane title={e.title} sub={`${STATUS_REGISTRY.event_kind[e.kind]?.label ?? e.kind} · ${e.date}`}>
        <FieldList
          rows={[
            ["Zustand", <StatusBadge key="s" axis="event_booking" status={e.state} />],
            ["Betrag", <Amount key="a" value={e.amount} currency={e.currency} />],
            ["Datei", "RE-4471.pdf"],
            ["Zusammenfassung", "Schreibwaren und zwei Druckerpatronen, Steuersatz 19 %."],
          ]}
        />
      </DetailPane>
    );
  }
  if (entry.type === "clarification") {
    const c = entry.clarification;
    return (
      <DetailPane title={c.title} sub={`Rückfrage · gestellt am ${formatTime(c.raisedAt, "date")}`}>
        <FieldList
          rows={[
            ["Adressat", c.audience === "accounting" ? "Kanzlei" : "Agent"],
            ["Schwere", c.severity === "required" ? "Blockierend" : "Optional"],
            ["Antwort", c.answeredAt ? "Auf 6815, wie in den Vormonaten." : "— steht aus"],
          ]}
        />
      </DetailPane>
    );
  }
  const x = entry.expectation;
  return (
    <DetailPane title={x.counterpartyName ?? "Erwartung"} sub={`fällig am ${x.dueDate}`}>
      <FieldList
        rows={[
          ["Art", x.kind === "document" ? "Beleg fehlt" : "Zahlung offen"],
          ["Betrag", <Amount key="a" value={x.amount ?? null} currency={x.currency} />],
          ["Eskalationsstufe", String(x.escalationLevel)],
        ]}
      />
    </DetailPane>
  );
}

/**
 * The edge: 44 entries across half a year with gap rows, an 85-character title,
 * amount 0 without a cell, a superseded event, a resolved expectation (absent
 * from the strand) and an outgoing payment with its sign.
 */
/**
 * Drei Einträge auf **demselben Tag**: die Erwartung steht vor der Klärung,
 * die Klärung vor dem Ereignis. Der Strang sortiert stabil, also überlebt
 * diese Reihenfolge das Sortieren — ohne die Regel stünde die offene
 * Belegerwartung unter dem Ereignis, das sie erwartet.
 */
export const SameDay: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <CaseTimeline
        today={TODAY}
        events={[
          {
            id: "sd-e",
            kind: "document_received",
            date: "2026-08-26",
            title: "Rechnung RE-4471 · Bürobedarf Meier GmbH",
            amount: 1249.9,
            currency: "EUR",
            state: "proposed",
          },
        ]}
        clarifications={[
          {
            id: "sd-c",
            type: "question",
            severity: "required",
            raisedAt: "2026-08-26",
            title: "Gehört der Laptop ins Anlagevermögen?",
          },
        ]}
        expectations={[
          {
            id: "sd-x",
            kind: "document",
            dueDate: "2026-08-26",
            escalationLevel: 0,
            counterpartyName: "Bürobedarf Meier GmbH",
            currency: "EUR",
          },
        ]}
      />
    </div>
  ),
};

export const Edge: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <CaseTimeline
        today={TODAY}
        events={[
          {
            id: "e-long",
            kind: "document_received",
            date: "2026-08-30",
            title:
              "Rechnung RE-4471 über Bürobedarf, Fachliteratur und sonstigen Betriebsbedarf der Musterbau",
            amount: 1249.9,
            currency: "EUR",
            state: "proposed",
          },
          { id: "e-zero", kind: "adjustment", date: "2026-08-29", title: "Korrektur ohne Betrag", amount: 0, currency: "EUR", state: "open" },
          { id: "e-out", kind: "payment_out", date: "2026-08-28", title: "Zahlung an Stadtwerke Musterstadt", amount: 412, currency: "EUR", state: "posted" },
          { id: "e-sup", kind: "document_received", date: "2026-08-27", title: "Rechnung RE-4470 · ersetzt", amount: 1249.9, currency: "EUR", state: "posted", superseded: true },
          ...Array.from({ length: 40 }, (_, i) => ({
            id: `e-${i}`,
            kind: "open_item_carryover",
            date: `2026-0${i < 20 ? 3 : 4}-${String((i % 28) + 1).padStart(2, "0")}`,
            title: `Offener Posten (DATEV) ${i + 1}`,
            amount: 100 + i * 37,
            currency: "EUR" as const,
            state: "no_booking_required",
          })),
        ]}
        expectations={[
          { id: "x-open", kind: "payment", dueDate: "2026-09-20", escalationLevel: 0, counterpartyName: "Musterbau GmbH", amount: 4200, currency: "EUR" },
          {
            id: "x-done",
            kind: "document",
            dueDate: "2026-08-01",
            escalationLevel: 0,
            resolvedAt: "2026-08-20",
            counterpartyName: "erledigt — steht nicht im Strang",
            amount: 100,
            currency: "EUR",
          },
        ]}
      />
    </div>
  ),
};
