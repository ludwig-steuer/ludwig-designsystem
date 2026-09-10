import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { CaseFacts } from "@/ui/v3/entities/accounting-case/CaseFacts";
import {
  CaseTimeline,
  NOW_ID,
  type CaseTimelineEntry,
} from "@/ui/v3/entities/accounting-case/CaseTimeline";
import { AiBookingNotes } from "@/ui/v3/entities/journal-entry/AiBookingNotes";
import { JournalEntryCard } from "@/ui/v3/entities/journal-entry/JournalEntryCompact";
import { Button } from "@/ui/v3/primitives/Button";
import { StatusCallout } from "@/ui/v3/primitives/StatusCallout";
import { Card, CardHead } from "@/ui/v3/primitives/Table";
import { TextButton } from "@/ui/v3/primitives/TextButton";
import { OpenPoints } from "@/ui/v3/patterns/OpenPoints";
import { Timeline } from "@/ui/v3/patterns/Timeline";

import { SachverhaltSeite } from "./SachverhaltSeite";
import {
  accountHref,
  BELEG_EREIGNIS,
  DATEV_EREIGNIS,
  fallFixture,
  HEUTE,
  KLAERUNG_BEANTWORTET,
  partnerHref,
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

/**
 * Spalte 3 — lesend. Zusammenfassung, Notizen, Rückfragen; beantwortet wird
 * im Reiter Rückfragen, nicht hier (F196 §5).
 */
function Notizen() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <Card>
        <CardHead title="Notizen" sub="zuletzt oben" />
        <div className="v3boxbody">
          <Timeline
            groupBy="none"
            entries={[
              {
                id: "n-1",
                at: "2026-08-02T14:30:00Z",
                title: "Der Mandant bestätigt: Ersatzteile für den Firmenwagen.",
                actor: "Mandant",
              },
              {
                id: "n-2",
                at: "2026-07-31T16:05:00Z",
                title: "Beleg ohne Sachverhalt eingegangen, Fall vom Agenten eröffnet.",
                actor: "Agent",
              },
            ]}
          />
        </div>
      </Card>
      <Card>
        <CardHead
          title="Rückfragen"
          sub="1 beantwortet"
          actions={<TextButton href={tabHref("rueckfragen")}>Alle ansehen</TextButton>}
        />
        <div className="v3boxbody">
          <p className="v2muted" style={{ margin: 0 }}>
            „Gehören die Ersatzteile zum Firmenwagen oder zum Werkstattbestand?" — beantwortet
            am 02.08. vom Mandanten.
          </p>
        </div>
      </Card>
    </div>
  );
}

/**
 * Spalte 2 bei „Jetzt": **was ist jetzt zu tun.** Drei Blöcke in fester
 * Reihenfolge — Offen, Fehlende Freigaben, Verlauf.
 */
function JetztFlaeche({ mitErwartung = true }: { mitErwartung?: boolean }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <OpenPoints
        points={
          mitErwartung
            ? [
                {
                  key: "zahlung",
                  title: "Die Zahlung steht aus.",
                  hint: "Erwartet bis 10.08.2026 — danach fragt Ludwig beim Mandanten nach.",
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
 * **Jetzt-Zeile**, in der Mitte die Arbeitsfläche, rechts die Notizen. Ohne
 * Auswahl ist „Jetzt" gewählt, und die Mitte zeigt, was zu tun ist; ein Klick
 * auf einen Eintrag zeigt dort den Vorgang.
 *
 * **Der Wechsel ändert nur Spalte 2.** Strang und Notizen bleiben stehen —
 * wer zwischen „was ist zu tun" und „was war das" hin- und herspringt, soll
 * dabei nicht die Übersicht verlieren.
 */
export const VorschlagSteht: Story = {
  render: function Fall() {
    const [gewaehlt, setGewaehlt] = useState<string>(NOW_ID);
    const fall = fallFixture({ disposition: "agent" });
    const waehlen = (entry: CaseTimelineEntry) =>
      setGewaehlt(
        entry.type === "now"
          ? NOW_ID
          : entry.type === "event"
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
              title="Verlauf"
              sub="alles zu diesem Fall"
              actions={<TextButton href={tabHref("ereignisse")}>vergrößern →</TextButton>}
            />
            <div className="v3boxbody">
              <CaseTimeline
                events={[BELEG_EREIGNIS]}
                clarifications={[KLAERUNG_BEANTWORTET]}
                expectations={[ZAHLUNG_ERWARTET]}
                today={HEUTE}
                showNow
                selectedId={gewaehlt}
                onSelect={waehlen}
              />
            </div>
          </Card>
        }
        notizen={<Notizen />}
      >
        {gewaehlt === NOW_ID ? <JetztFlaeche /> : <EreignisFlaeche />}
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
        entry.type === "now"
          ? NOW_ID
          : entry.type === "event"
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
              title="Verlauf"
              sub="Ludwig und DATEV in einer Reihe"
              actions={<TextButton href={tabHref("ereignisse")}>vergrößern →</TextButton>}
            />
            <div className="v3boxbody">
              <CaseTimeline
                events={[DATEV_EREIGNIS, BELEG_EREIGNIS]}
                expectations={[ZAHLUNG_ERWARTET]}
                today={HEUTE}
                showNow
                selectedId={gewaehlt}
                onSelect={waehlen}
              />
            </div>
          </Card>
        }
        notizen={<Notizen />}
      >
        {gewaehlt === NOW_ID ? (
          <JetztFlaeche />
        ) : (
          <EreignisFlaeche datev={gewaehlt === DATEV_EREIGNIS.id} />
        )}
      </SachverhaltSeite>
    );
  },
};

/** Der Partner-Weg aus den Fakten — Spalte 2 zeigt sie im Reiter Details. */
export const Fakten: Story = {
  render: () => (
    <SachverhaltSeite fall={fallFixture({ disposition: "agent" })} tab="details">
      <Card>
        <CardHead title="Details" sub="alle Angaben des Sachverhalts" />
        <div className="v3boxbody">
          <CaseFacts
            case={fallFixture({ disposition: "agent" })}
            all
            tone="bare"
            partnerHref={partnerHref}
            accountHref={accountHref}
          />
        </div>
      </Card>
    </SachverhaltSeite>
  ),
};
