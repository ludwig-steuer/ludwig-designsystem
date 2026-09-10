import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { CaseFacts } from "@/ui/v3/entities/accounting-case/CaseFacts";
import { ClarificationList } from "@/ui/v3/entities/clarification/Clarification";
import {
  CaseTimeline,
  type CaseTimelineEntry,
} from "@/ui/v3/entities/accounting-case/CaseTimeline";
import { AiBookingNotes } from "@/ui/v3/entities/journal-entry/AiBookingNotes";
import { JournalEntryCard } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import { Button } from "@/ui/v3/primitives/Button";
import { StatusCallout } from "@/ui/v3/primitives/StatusCallout";
import { Card, CardHead } from "@/ui/v3/primitives/Table";
import { TextButton } from "@/ui/v3/primitives/TextButton";
import { NoteFeed } from "@/ui/v3/patterns/NoteFeed";
import { OpenPoints } from "@/ui/v3/patterns/OpenPoints";

import { CasePage } from "./CasePage";
import {
  accountHref,
  DOCUMENT_EVENT,
  DATEV_EVENT,
  caseFixture,
  TODAY,
  CLARIFICATION_ANSWERED,
  NOTES,
  partnerHref,
  CLARIFICATIONS,
  tabHref,
  PROPOSAL,
  PAYMENT_EXPECTED,
} from "./fixtures";

/**
 * Der Sachverhalt als Seite — Welle 1 von 0152 (Brief F196).
 *
 * Zwei Szenarien, und sie sind die, an denen sich das Layout entscheidet: der
 * Referenzfall mit einem Buchungsvorschlag, und derselbe Fall mit einer
 * Buchung, die aus DATEV hinzugekommen ist. Was hier nicht trägt, trägt in
 * keinem der anderen 19.
 *
 * Alle Daten sind erfunden.
 */
const meta: Meta<typeof CasePage> = {
  title: "Seiten/Sachverhalt/Einzelfall",
  component: CasePage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof CasePage>;

/** The key of the todo row. It stands for no record, so it has no id. */
const TODO_ID = "__todo";

/**
 * „Zu tun" — der Standardzustand der Seite, **über** dem Strang.
 *
 * Er ist kein Ereignis: er hat kein Datum, und im Strang stünde er zwischen
 * lauter datierten Zeilen an einer Stelle, die niemand bestimmt hat. Er
 * verhält sich trotzdem wie einer — dieselbe Auswahl, dieselbe Fläche rechts —,
 * und deshalb steht er direkt darüber statt in einer eigenen Karte.
 */
function TodoRow({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      className={active ? "v3todo is-active" : "v3todo"}
      onClick={onClick}
      aria-current={active ? "true" : undefined}
    >
      <span className="v3todo__title">Zu tun</span>
      <span className="v3todo__sub">1 offen · 1 Freigabe</span>
    </button>
  );
}

/**
 * Spalte 3 — lesend. Zusammenfassung, Notizen, Rückfragen; beantwortet wird
 * im Reiter Rückfragen, nicht hier (F196 §5).
 */
function NotesColumn() {
  return (
    <div className="v2stack">
      <Card>
        <CardHead title="Notizen" sub="zuletzt oben" />
        <div className="v3boxbody">
          {/* Zwei Zeilen je Notiz statt Spalten — in 370 px nähme eine
              Datumsspalte ein Drittel der Breite für sechs Zeichen (0158). */}
          <NoteFeed notes={NOTES} onAdd={() => {}} />
        </div>
      </Card>
      <Card>
        <CardHead
          title="Rückfragen"
          sub="1 offen · 1 beantwortet"
          actions={<TextButton tone="quiet" href={tabHref("rueckfragen")}>Alle</TextButton>}
        />
        <div className="v3boxbody">
          {/* **Die Liste der Klärungs-Familie**, nicht ein Absatz mit Text:
              sie trägt je Zeile den Zustand und die Dringlichkeit, und der
              Klick führt in den Reiter, wo beantwortet wird. Genau das ist der
              Überblick, den die Spalte geben soll (Owner 2026-09-10). */}
          <ClarificationList
            clarifications={CLARIFICATIONS}
            empty={{ title: "Keine Rückfragen." }}
          />
        </div>
      </Card>
    </div>
  );
}

/**
 * Spalte 2 bei „Zu tun": **was ist jetzt zu tun.** Zwei Blöcke in fester
 * Reihenfolge — Offen, Fehlende Freigaben. Was war, steht links im Strang.
 */
function TodoPane({ withExpectation: withExpectation = true }: { withExpectation?: boolean }) {
  return (
    <div className="v2stack">
      <OpenPoints
        points={
          withExpectation
            ? [
                {
                  key: "zahlung",
                  title: "Die Zahlung an Musterbau Fahrzeugteile GmbH steht aus.",
                  // **Was die Erwartung weiß, steht da** (Owner 2026-09-10):
                  // Betrag, Frist, wie lange noch, welche Stufe. „Offen" ohne
                  // diese vier ist eine Überschrift, keine Auskunft — und
                  // genau sie entscheiden, ob heute etwas zu tun ist.
                  hint: "25,41 € · fällig am 10.08.2026, in 5 Tagen · noch keine Mahnung — danach fragt Ludwig beim Mandanten nach.",
                  action: <TextButton onClick={() => {}}>Erwartung aufheben</TextButton>,
                },
              ]
            : []
        }
        emptyText="An diesem Sachverhalt ist nichts offen."
      />
      <Card>
        <CardHead title="Fehlende Freigaben" sub="1 Vorschlag" />
        <div className="v3boxbody">
          <JournalEntryCard
            lines={PROPOSAL}
            currency="EUR"
            caption="Buchungsvorschlag vom 31.07."
            accountHref={accountHref}
            totals={false}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary" size="sm">Freigeben</Button>
            <Button variant="secondary" size="sm">Ändern</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

/** Spalte 2 bei gewähltem Ereignis: der Vorgang mit Beleg, Buchung, Urteil. */
function EventPane({ fromDatev: fromDatev = false }: { fromDatev?: boolean }) {
  return (
    <Card>
      <CardHead
        title={fromDatev ? "Gutschrift aus DATEV" : "Rechnung 93846778"}
        sub={fromDatev ? "30.06.2026 · aus dem Spiegel übernommen" : "31.07.2026 · Beleg mit Vorschlag"}
      />
      <div className="v3boxbody">
        <JournalEntryCard
          lines={
            fromDatev
              ? [
                  { side: "debit", accountNumber: "71202", accountName: "Musterbau Fahrzeugteile GmbH", amount: 21.82, text: "Gutschrift" },
                  { side: "credit", accountNumber: "5404", accountName: "Wareneingang 19 % VSt", amount: 21.82, text: "Gutschrift" },
                ]
              : PROPOSAL
          }
          currency="EUR"
          accountHref={accountHref}
        />
        {fromDatev ? (
          // **Lesend, ohne Handlungen.** Was aus dem Spiegel kommt, wurde in
          // DATEV gebucht — hier gibt es nichts freizugeben und nichts zu
          // ändern (F196 §8).
          <p className="v2muted" style={{ margin: 0 }}>
            Diese Buchung steht in DATEV. Ludwig zeigt sie, ändert sie nicht.
          </p>
        ) : (
          <AiBookingNotes
            verdict="confirm"
            confidence="green"
            rationale="Konto und Kreditor wie bei der Rechnung desselben Lieferanten im Juni; das Kontoblatt 71202 zeigt für Juli keine Bewegung."
            judgeReasoning="Kein Vorgriff, keine Dublette. Konto und Kreditor stimmen mit der Präzedenz überein."
            sources={[
              { key: "1", art: "beleg", quote: "Rechnung vom 16.07.2026 über 25,41 EUR", onOpen: () => {} },
              { key: "2", art: "history", label: "Kreditor 71202, 14 Buchungen, zuletzt 22.06.2026" },
            ]}
          />
        )}
      </div>
    </Card>
  );
}

/**
 * **E1 — der Vorschlag steht.** Der Referenzfall des Briefs.
 *
 * Die Übersicht ist `list | detail | sidebar`: links der Strang mit der
 * Zeile **„Zu tun"** darüber, in der Mitte die Arbeitsfläche, rechts Notizen
 * und Rückfragen. Ohne Auswahl ist „Zu tun" gewählt, und die Mitte zeigt, was
 * zu tun ist; ein Klick auf einen Eintrag zeigt dort den Vorgang.
 *
 * **Der Wechsel ändert nur Spalte 2.** Strang und Notizen bleiben stehen —
 * wer zwischen „was ist zu tun" und „was war das" hin- und herspringt, soll
 * dabei nicht die Übersicht verlieren.
 */
export const ProposalPending: Story = {
  render: function Fall() {
    const [selected, setSelected] = useState<string>(TODO_ID);
    const accountingCase = caseFixture({ disposition: "agent" });
    const select = (entry: CaseTimelineEntry) =>
      setSelected(
        entry.type === "event"
          ? entry.event.id
          : entry.type === "clarification"
            ? entry.clarification.id
            : entry.expectation.id,
      );

    return (
      <CasePage
        accountingCase={accountingCase}
        signal={
          <StatusCallout
            kicker="Nächster Schritt"
            title="Der Buchungsvorschlag wartet auf Ihre Prüfung."
            actions={<Button variant="primary" size="sm">Prüfen</Button>}
          />
        }
        actions={<Button variant="secondary" size="sm">Beleg anhängen</Button>}
        timeline={
          <Card>
            <CardHead
              title="Ereignisse"
              sub="alles zu diesem Fall"
              actions={
                <TextButton tone="quiet" href={tabHref("ereignisse")}>
                  vergrößern
                </TextButton>
              }
            />
            {/* **„Zu tun" steht über dem Strang, nicht darin** (Owner
                2026-09-10). Es ist der Standardzustand der Seite und kein
                Ereignis — im Strang wäre es ein Eintrag ohne Datum zwischen
                lauter datierten. Es verhält sich trotzdem wie einer: dieselbe
                Auswahl, dieselbe Fläche rechts. */}
            <div className="v3boxbody">
              <TodoRow active={selected === TODO_ID} onClick={() => setSelected(TODO_ID)} />
              <CaseTimeline
                events={[DOCUMENT_EVENT]}
                clarifications={[CLARIFICATION_ANSWERED]}
                expectations={[PAYMENT_EXPECTED]}
                today={TODAY}
                selectedId={selected}
                onSelect={select}
              />
            </div>
          </Card>
        }
        notes={<NotesColumn />}
      >
        {selected === TODO_ID ? <TodoPane /> : <EventPane />}
      </CasePage>
    );
  },
};

/**
 * **E1b — mit einer Buchung aus DATEV.** Derselbe Fall, dazu eine
 * Spiegel-Buchung vom Vormonat.
 *
 * Beide stehen in **einer** Reihe, nach Datum — die Geschichte eines Falls ist
 * eine, nicht zwei Quellen. Dasselbe sind sie trotzdem nicht: der
 * DATEV-Eintrag trägt sein Wort in der Zeile, und in Spalte 2 hat er **keine
 * Handlungen**. An dem einen kann man arbeiten, das andere wird gelesen.
 */
export const WithDatevEntry: Story = {
  render: function Fall() {
    const [selected, setSelected] = useState<string>(DATEV_EVENT.id);
    const accountingCase = caseFixture({ disposition: "agent" });
    const select = (entry: CaseTimelineEntry) =>
      setSelected(
        entry.type === "event"
          ? entry.event.id
          : entry.type === "clarification"
            ? entry.clarification.id
            : entry.expectation.id,
      );

    return (
      <CasePage
        accountingCase={accountingCase}
        timeline={
          <Card>
            <CardHead
              title="Ereignisse"
              sub="Ludwig und DATEV in einer Reihe"
              actions={
                <TextButton tone="quiet" href={tabHref("ereignisse")}>
                  vergrößern
                </TextButton>
              }
            />
            <div className="v3boxbody">
              <TodoRow active={selected === TODO_ID} onClick={() => setSelected(TODO_ID)} />
              <CaseTimeline
                events={[DATEV_EVENT, DOCUMENT_EVENT]}
                expectations={[PAYMENT_EXPECTED]}
                today={TODAY}
                selectedId={selected}
                onSelect={select}
              />
            </div>
          </Card>
        }
        notes={<NotesColumn />}
      >
        {selected === TODO_ID ? (
          <TodoPane />
        ) : (
          <EventPane fromDatev={selected === DATEV_EVENT.id} />
        )}
      </CasePage>
    );
  },
};

/**
 * Der Reiter **Stammdaten** — und der Grund, warum die Fakten nicht in der
 * Randspalte stehen.
 *
 * Dort waren sie eine Liste, die niemand liest, während daneben gearbeitet
 * wird; hier sind sie das Thema der Seite. Über die volle Breite stünde
 * allerdings das Etikett ganz links und der Wert ganz rechts — deshalb
 * **zwei Spalten Paare** (`split`), gemessen an der Liste, nicht am Fenster
 * (Owner 2026-09-10).
 */
export const MasterData: Story = {
  render: () => (
    <CasePage accountingCase={caseFixture({ disposition: "agent" })} tab="stammdaten">
      <Card>
        <CardHead title="Stammdaten" sub="alle Angaben des Sachverhalts" />
        <div className="v3boxbody">
          <CaseFacts
            case={caseFixture({ disposition: "agent" })}
            all
            split
            tone="bare"
            partnerHref={partnerHref}
            accountHref={accountHref}
          />
        </div>
      </Card>
    </CasePage>
  ),
};
