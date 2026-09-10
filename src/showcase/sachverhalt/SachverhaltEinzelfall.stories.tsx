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

import { SachverhaltSeite } from "./SachverhaltSeite";
import {
  accountHref,
  BELEG_EREIGNIS,
  DATEV_EREIGNIS,
  fallFixture,
  HEUTE,
  KLAERUNG_BEANTWORTET,
  NOTES,
  partnerHref,
  CLARIFICATIONS,
  tabHref,
  VORSCHLAG,
  ZAHLUNG_ERWARTET,
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
const meta: Meta<typeof SachverhaltSeite> = {
  title: "Seiten/Sachverhalt/Einzelfall",
  component: SachverhaltSeite,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SachverhaltSeite>;

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
function Notizen() {
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
function JetztFlaeche({ mitErwartung = true }: { mitErwartung?: boolean }) {
  return (
    <div className="v2stack">
      <OpenPoints
        points={
          mitErwartung
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
            lines={VORSCHLAG}
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
function EreignisFlaeche({ datev = false }: { datev?: boolean }) {
  return (
    <Card>
      <CardHead
        title={datev ? "Gutschrift aus DATEV" : "Rechnung 93846778"}
        sub={datev ? "30.06.2026 · aus dem Spiegel übernommen" : "31.07.2026 · Beleg mit Vorschlag"}
      />
      <div className="v3boxbody">
        <JournalEntryCard
          lines={
            datev
              ? [
                  { side: "debit", accountNumber: "71202", accountName: "Musterbau Fahrzeugteile GmbH", amount: 21.82, text: "Gutschrift" },
                  { side: "credit", accountNumber: "5404", accountName: "Wareneingang 19 % VSt", amount: 21.82, text: "Gutschrift" },
                ]
              : VORSCHLAG
          }
          currency="EUR"
          accountHref={accountHref}
        />
        {datev ? (
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
export const VorschlagSteht: Story = {
  render: function Fall() {
    const [gewaehlt, setGewaehlt] = useState<string>(TODO_ID);
    const fall = fallFixture({ disposition: "agent" });
    const waehlen = (entry: CaseTimelineEntry) =>
      setGewaehlt(
        entry.type === "event"
          ? entry.event.id
          : entry.type === "clarification"
            ? entry.clarification.id
            : entry.expectation.id,
      );

    return (
      <SachverhaltSeite
        fall={fall}
        signal={
          <StatusCallout
            kicker="Nächster Schritt"
            title="Der Buchungsvorschlag wartet auf Ihre Prüfung."
            actions={<Button variant="primary" size="sm">Prüfen</Button>}
          />
        }
        actions={<Button variant="secondary" size="sm">Beleg anhängen</Button>}
        strang={
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
              <TodoRow active={gewaehlt === TODO_ID} onClick={() => setGewaehlt(TODO_ID)} />
              <CaseTimeline
                events={[BELEG_EREIGNIS]}
                clarifications={[KLAERUNG_BEANTWORTET]}
                expectations={[ZAHLUNG_ERWARTET]}
                today={HEUTE}
                selectedId={gewaehlt}
                onSelect={waehlen}
              />
            </div>
          </Card>
        }
        notizen={<Notizen />}
      >
        {gewaehlt === TODO_ID ? <JetztFlaeche /> : <EreignisFlaeche />}
      </SachverhaltSeite>
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
export const MitDatevBuchung: Story = {
  render: function Fall() {
    const [gewaehlt, setGewaehlt] = useState<string>(DATEV_EREIGNIS.id);
    const fall = fallFixture({ disposition: "agent" });
    const waehlen = (entry: CaseTimelineEntry) =>
      setGewaehlt(
        entry.type === "event"
          ? entry.event.id
          : entry.type === "clarification"
            ? entry.clarification.id
            : entry.expectation.id,
      );

    return (
      <SachverhaltSeite
        fall={fall}
        strang={
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
              <TodoRow active={gewaehlt === TODO_ID} onClick={() => setGewaehlt(TODO_ID)} />
              <CaseTimeline
                events={[DATEV_EREIGNIS, BELEG_EREIGNIS]}
                expectations={[ZAHLUNG_ERWARTET]}
                today={HEUTE}
                selectedId={gewaehlt}
                onSelect={waehlen}
              />
            </div>
          </Card>
        }
        notizen={<Notizen />}
      >
        {gewaehlt === TODO_ID ? (
          <JetztFlaeche />
        ) : (
          <EreignisFlaeche datev={gewaehlt === DATEV_EREIGNIS.id} />
        )}
      </SachverhaltSeite>
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
export const Stammdaten: Story = {
  render: () => (
    <SachverhaltSeite fall={fallFixture({ disposition: "agent" })} tab="stammdaten">
      <Card>
        <CardHead title="Stammdaten" sub="alle Angaben des Sachverhalts" />
        <div className="v3boxbody">
          <CaseFacts
            case={fallFixture({ disposition: "agent" })}
            all
            split
            tone="bare"
            partnerHref={partnerHref}
            accountHref={accountHref}
          />
        </div>
      </Card>
    </SachverhaltSeite>
  ),
};
