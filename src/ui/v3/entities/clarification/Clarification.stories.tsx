import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Card, CardHead } from "../../primitives/Table";
import { FieldList } from "../../primitives/FieldList";
import { TodoList } from "../../patterns/TodoList";
import { CaseTimeline } from "../accounting-case/CaseTimeline";
import {
  ClarificationCell,
  ClarificationList,
  ClarificationRow,
  toTodoItem,
  type ClarificationVM,
} from "./Clarification";

const meta: Meta<typeof ClarificationList> = {
  // Named after the main export of the family file, like `Table` and
  // `LogList` — there is no export called plain `Clarification`.
  title: "v3/Entitäten/Klärung/ClarificationRow",
  component: ClarificationList,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ClarificationList>;

/** Realistic rows — the wording is the agent's, the numbers are made up. */
const OPEN_REQUIRED: ClarificationVM = {
  id: "c1",
  title: "Bewirtung oder Reisekosten? Beleg nennt beides",
  state: "open",
  severity: "required",
  type: "question",
  audience: "accounting",
  raisedAt: "2026-08-26T09:12:00+02:00",
};

const OPEN_CLIENT: ClarificationVM = {
  id: "c2",
  title: "Wurde das Fahrrad weiterverkauft oder privat genutzt?",
  state: "open",
  severity: "optional",
  type: "question",
  audience: "client",
  raisedAt: "2026-08-28T14:40:00+02:00",
};

const DEFERRED: ClarificationVM = {
  id: "c3",
  title: "Kreditor weicht vom Vorjahr ab — Musterfirma GmbH statt Muster AG",
  state: "deferred",
  severity: "required",
  type: "question",
  audience: "agent",
  raisedAt: "2026-08-20T08:05:00+02:00",
  deferredUntil: "2026-09-12",
};

const ANSWERED: ClarificationVM = {
  id: "c4",
  title: "Doppelte Buchung vermutet: 1.800,00 € am 21.08.2026",
  state: "answered",
  severity: "required",
  type: "question",
  audience: "accounting",
  raisedAt: "2026-08-21T11:00:00+02:00",
  answeredAt: "2026-08-21T11:26:00+02:00",
};

const COMMENT: ClarificationVM = {
  id: "c5",
  title: "Mit dem Mandanten telefoniert — Rechnung kommt bis Monatsende",
  state: "answered",
  severity: "optional",
  type: "comment",
  audience: "accounting",
  raisedAt: "2026-08-27T16:20:00+02:00",
};

const ALL = [OPEN_REQUIRED, OPEN_CLIENT, DEFERRED, ANSWERED, COMMENT];

export const Filled: Story = {
  render: () => (
    <Card>
      <CardHead title="Rückfragen" sub="Sachverhalt SV-2026-0184" />
      <ClarificationList clarifications={ALL} />
    </Card>
  ),
};

export const States: Story = {
  render: () => (
    <Card>
      <CardHead title="Zustände" sub="offen · zurückgestellt · beantwortet · blockierend" />
      <ClarificationList clarifications={[OPEN_REQUIRED, OPEN_CLIENT, DEFERRED, ANSWERED]} />
    </Card>
  ),
};

export const Comment: Story = {
  render: () => (
    <Card>
      <CardHead title="Notiz am Sachverhalt" sub="keine Schwere, keine Antwort erwartet" />
      <ClarificationRow clarification={COMMENT} />
    </Card>
  ),
};

/** The batch review: grouped by who is asked, with the case in front. */
export const InStack: Story = {
  render: () => {
    const rows: ClarificationVM[] = [
      { ...OPEN_REQUIRED, caseNumber: "SV-2026-0184", caseTitle: "Musterfirma GmbH · 1.800,00 €", href: "#" },
      { ...ANSWERED, caseNumber: "SV-2026-0191", caseTitle: "Bürobedarf GmbH · 64,90 €", href: "#" },
      { ...OPEN_CLIENT, caseNumber: "SV-2026-0203", caseTitle: "Zweirad Nord · 1.249,00 €", href: "#" },
      { ...DEFERRED, caseNumber: "SV-2026-0177", caseTitle: "Telekom · 89,00 €", href: "#" },
    ];
    return (
      <Card>
        <CardHead title="Rückfragen" sub="Stapel 2026-08 · 4 Zeilen" />
        <ClarificationList clarifications={rows} groupBy="audience" showCase />
      </Card>
    );
  },
};

/** `renderDetail` supplies what unfolds — in the app that is 0060. */
export const WithCard: Story = {
  render: () => (
    <Card>
      <CardHead title="Rückfragen" sub="die blockierende Frage steht offen" />
      <ClarificationList
        clarifications={[OPEN_REQUIRED, OPEN_CLIENT]}
        renderDetail={(c) => (
          <FieldList
            tone="bare"
            rows={[
              ["Frage", c.title],
              ["Gefragt ist", c.audience === "client" ? "der Mandant" : "die Kanzlei"],
              ["Herkunft", "Buchungsvorschlag"],
            ]}
          />
        )}
      />
    </Card>
  ),
};

export const Preview: Story = {
  render: () => (
    <Card>
      <CardHead title="Begründung der Buchung" sub="worauf sie sich stützt" />
      <div style={{ padding: "var(--space-4)", display: "grid", gap: "var(--space-2)" }}>
        <span className="v2sub">Quellen</span>
        <ClarificationCell clarification={ANSWERED} href="#" />
        <ClarificationCell clarification={OPEN_REQUIRED} />
      </div>
    </Card>
  ),
};

/**
 * The two frames beside the plain list. The comment is in the list and in
 * neither frame: `toTodoItem` returns `null` for it, `CaseTimeline` skips it
 * (0059 „Mitbringsel") — a note is not work and not an event.
 */
export const InFrame: Story = {
  render: function Frames() {
    const [selected, setSelected] = useState<string | null>("c1");
    return (
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <Card>
          <CardHead title="Als Posten" sub="TodoList über toTodoItem" />
          <TodoList
            groups={[
              {
                label: "Rückfragen",
                items: ALL.map(toTodoItem).filter((i) => i !== null),
              },
            ]}
            selectedId={selected}
            onSelect={setSelected}
            hotkeys={false}
          />
        </Card>
        <Card>
          <CardHead title="Im Strang" sub="CaseTimeline — ohne den Kommentar" />
          <CaseTimeline
            events={[]}
            clarifications={ALL.map((c) => ({
              id: c.id,
              type: c.type,
              title: c.title,
              raisedAt: c.raisedAt,
              answeredAt: c.answeredAt ?? null,
              deferredUntil: c.deferredUntil ?? null,
              severity: c.severity,
            }))}
            expectations={[]}
          />
        </Card>
        <Card>
          <CardHead title="In der Liste" sub="hier steht der Kommentar" />
          <ClarificationList clarifications={ALL} />
        </Card>
      </div>
    );
  },
};

/** A question that runs past the column: cut to one line, whole in the hover. */
export const LongQuestion: Story = {
  render: () => (
    <Card>
      <CardHead title="Lange Frage" sub="gekürzt auf eine Zeile, ganzer Text im Hover" />
      <ClarificationList
        clarifications={[
          {
            ...OPEN_REQUIRED,
            id: "long",
            title:
              "Der Beleg der Musterfirma GmbH weist eine Bewirtung über 68,40 € und eine " +
              "Übernachtung über 172,00 € auf demselben Papier aus — soll die Buchung dem " +
              "überwiegenden Anteil folgen oder wollen Sie die Positionen trennen?",
          },
          { ...OPEN_CLIENT, id: "short", title: "Wurde das Fahrrad weiterverkauft?" },
        ]}
      />
    </Card>
  ),
};

export const Leer: Story = {
  render: () => (
    <Card>
      <CardHead title="Rückfragen" sub="Sachverhalt SV-2026-0210" />
      <ClarificationList
        clarifications={[]}
        empty={{
          title: "Keine Rückfragen.",
          hint: "Nichts hält diesen Sachverhalt auf — er kann gebucht werden.",
        }}
      />
    </Card>
  ),
};
