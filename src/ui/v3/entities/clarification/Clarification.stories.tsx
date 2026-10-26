import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Card, CardHead } from "../../primitives/Table";
import { Drawer } from "../../primitives/Drawer";
import { FieldList } from "../../primitives/FieldList";
import { RecordPager } from "../../primitives/RecordPager";
import { TextButton } from "../../primitives/TextButton";
import { TodoList } from "../../patterns/TodoList";
import { CaseTimeline } from "../accounting-case/CaseTimeline";
import { ClarificationCard } from "./ClarificationCard";
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

export const Empty: Story = {
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

/* --- 0224: the questions of one batch, by state ---------------------------- */

/** The questions of one batch as the review sees them — fictional; answers as text (L-367). */
const BATCH: ClarificationVM[] = [
  {
    id: "b1",
    title: "Wie soll die Wolkenhaus-Rechnung WH-26-00871 über 42,84 € gebucht werden?",
    state: "open",
    severity: "required",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-10-09T19:14:47+02:00",
    caseNumber: "2026-0412",
    caseTitle: "Wolkenhaus S.à r.l., Cloud-Speicher Dezember 2025",
  },
  {
    id: "b2",
    title: "Welche Gegenpartei gilt für diesen Sachverhalt?",
    state: "open",
    severity: "required",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-10-09T19:02:59+02:00",
    caseNumber: "2026-0129",
    caseTitle: "Serverhaus Nord GmbH, Serverkosten Januar",
  },
  {
    id: "b3",
    title: "Zu welchem Projekt gehört die Tabula-Rechnung über 54,00 USD vom 03.01.2026?",
    state: "deferred",
    severity: "optional",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-10-09T19:15:05+02:00",
    deferredUntil: "2026-11-05",
    caseNumber: "2026-0131",
    caseTitle: "Tabula Cloud Inc., Januar 2026",
  },
  {
    id: "b4",
    title: "Wofür war die Zahlung von 58,00 € an die Druckerei Hansen vom 15.01.2026?",
    state: "answered",
    severity: "required",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-10-09T14:22:01+02:00",
    answeredAt: "2026-10-26T09:41:00+01:00",
    answer: "Ohne Umsatzsteuer brutto auf den Aufwand buchen",
    caseNumber: "2026-0176",
    caseTitle: "Druckerei Hansen, Visitenkarten",
  },
  {
    id: "b5",
    title: "Wird das Abo Büro-Suite Family betrieblich genutzt, und darf die Vorsteuer von 20,60 € gezogen werden?",
    state: "answered",
    severity: "optional",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-10-10T10:19:15+02:00",
    answeredAt: "2026-10-26T09:52:00+01:00",
    // Long on purpose: one line in the row, whole in the hover and the fold-out.
    answer:
      "Betrieblich: mit 19 % Vorsteuer auf 6837 Lizenzen und Konzessionen buchen — der Mandant hat die betriebliche Nutzung " +
      "am Telefon bestätigt, die Rechnung lautet auf die GmbH.",
    caseNumber: "2026-0157",
    caseTitle: "Büro-Suite Family, Jahresabo 2026",
  },
  {
    id: "b6",
    title: "Ist die Gutschrift über 4,76 € schon mit der Dezember-Rechnung verrechnet?",
    state: "answered",
    severity: "required",
    type: "question",
    audience: "accounting",
    raisedAt: "2026-10-09T18:40:00+02:00",
    answeredAt: "2026-10-26T10:03:00+01:00",
    answer: "Anderweitig geklärt: telefonisch mit dem Mandanten geklärt",
    caseNumber: "2026-0122",
    caseTitle: "Serverhaus Nord GmbH, Gutschrift Januar",
  },
  {
    id: "b7",
    title: "Mandant schickt die fehlenden Tankbelege bis Monatsende",
    state: "answered",
    severity: "optional",
    type: "comment",
    audience: "accounting",
    raisedAt: "2026-10-20T16:20:00+02:00",
  },
];

/**
 * `groupBy="state"` (0224): Offen · Zurückgestellt · Beantwortet, then the
 * notes — the state badge leaves the rows, the group says it. Open and
 * deferred questions are a way to the question (`onOpen`), the one on screen
 * is marked; answered rows carry their answer.
 */
export const ByState: Story = {
  render: function ByStateStory() {
    const [jumped, setJumped] = useState<string | null>(null);
    return (
      // The width of a `md` drawer in a window of 1042 px — where the list
      // stands. A block, as in the drawer: a grid would size its track to the
      // unbroken answer line.
      <div style={{ maxWidth: 521 }}>
        <Card>
          <CardHead title="Fragen dieses Stapels" sub="2 offen · 1 zurückgestellt · 3 beantwortet" />
          <ClarificationList clarifications={BATCH} groupBy="state" showCase activeId="b1" onOpen={(c) => setJumped(c.title)} />
        </Card>
        <p className="lw-ui-hint" style={{ marginTop: "var(--space-2)" }}>
          {jumped ? `Springt zu: ${jumped}` : "Ein Klick auf eine offene Frage springt im Ablauf dorthin."}
        </p>
      </div>
    );
  },
};

/**
 * In use (0224): beside „Frage 1 von 3" the way to the whole batch, „3 Fragen
 * bei Ludwig" — only while something has been answered. The drawer lists every
 * question; an open one jumps back into the run and closes it, an answered one
 * folds open to the card in read mode.
 */
export const InBatchReviewDrawer: Story = {
  render: function InBatch() {
    const open = BATCH.filter((c) => c.type === "question" && c.state !== "answered");
    const answered = BATCH.filter((c) => c.type === "question" && c.state === "answered");
    const [i, setI] = useState(0);
    const [drawer, setDrawer] = useState(false);
    const current = open[i]!;
    return (
      <div style={{ maxWidth: 1180, display: "grid", gap: "var(--space-3)" }}>
        <RecordPager
          label="Frage"
          position={i + 1}
          total={open.length}
          onPrev={i > 0 ? () => setI(i - 1) : null}
          onNext={i < open.length - 1 ? () => setI(i + 1) : null}
          actions={
            answered.length > 0 ? (
              <TextButton onClick={() => setDrawer(true)}>
                {answered.length === 1 ? "1 Frage bei Ludwig" : `${answered.length} Fragen bei Ludwig`}
              </TextButton>
            ) : null
          }
        />
        <ClarificationCard
          variant="step"
          mode="answer"
          clarification={{
            ...current,
            text: "",
            answerKind: "free_text",
            answerOptions: [],
            evidence: current.caseNumber
              ? { cases: [{ id: `case-${current.id}`, number: current.caseNumber, title: current.caseTitle ?? null }] }
              : undefined,
          }}
          submitLabel="Speichern und weiter"
          onAnswer={async () => {}}
        />
        <Drawer
          open={drawer}
          onClose={() => setDrawer(false)}
          title="Fragen dieses Stapels"
          meta={`${open.filter((c) => c.state === "open").length} offen · ${open.filter((c) => c.state === "deferred").length} zurückgestellt · ${answered.length} beantwortet`}
        >
          <ClarificationList
            clarifications={BATCH}
            groupBy="state"
            showCase
            activeId={current.id}
            onOpen={(c) => {
              setI(open.findIndex((o) => o.id === c.id));
              setDrawer(false);
            }}
            renderDetail={(c) =>
              c.type === "question" && c.state === "answered" ? (
                <ClarificationCard
                  mode="read"
                  clarification={{
                    ...c,
                    text: "",
                    answerKind: "free_text",
                    history: [
                      { kind: "raised", at: c.raisedAt, by: null },
                      { kind: c.answer?.startsWith("Anderweitig") ? "resolved" : "answered", at: c.answeredAt ?? c.raisedAt, by: "S. Vogt", text: c.answer ?? null },
                    ],
                  }}
                />
              ) : null
            }
          />
        </Drawer>
      </div>
    );
  },
};

