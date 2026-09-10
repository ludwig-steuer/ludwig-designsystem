import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CaseFacts } from "@/ui/v3/entities/accounting-case/CaseFacts";
import { Card, CardHead } from "@/ui/v3/primitives/Table";

import { CasePage } from "./CasePage";
import { accountHref, caseFixture, partnerHref } from "./fixtures";
import { ScenarioPage } from "./scenario";
import * as S from "./scenarios";

/**
 * Der Sachverhalt als Seite — die Einzelfälle aus 0152, Welle 1 und 2.
 *
 * Jede Story ist **ein Szenario als Daten**: der Rahmen, die drei Spalten und
 * die Wege sind überall dieselben, und zwei Stories unterscheiden sich nur im
 * Fall. Die Datenform jeder Ausprägung stammt aus der Staging-Erhebung vom
 * 2026-09-10 (1.094 Fälle); Namen, Beträge und Nummern sind erfunden.
 *
 * Nicht gebaut, weil es sie im Bestand nicht gibt: abgelehnte Fälle
 * (`closed_rejected`, 0), Storno-Buchungen (0), zurückgestellte Rückfragen
 * (0 von 234), Eskalationsstufe 2 (0) und `disposition = client` (0).
 */
const meta: Meta<typeof CasePage> = {
  title: "Seiten/Sachverhalt/Einzelfall",
  component: CasePage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof CasePage>;

/**
 * **E1 — der Vorschlag steht.** Der Referenzfall des Briefs (Ausprägung A2,
 * 13 %).
 *
 * Links der Strang mit der Zeile **„Zu tun"** darüber, in der Mitte die
 * Arbeitsfläche, rechts Notizen und Rückfragen. Ohne Auswahl ist „Zu tun"
 * gewählt; ein Klick auf einen Eintrag zeigt dort den Vorgang. Der Wechsel
 * ändert nur Spalte 2.
 */
export const ProposalPending: Story = { render: () => <ScenarioPage scenario={S.proposalPending} /> };

/**
 * **E1b — mit einer Buchung aus DATEV.** Derselbe Fall, dazu eine
 * Spiegel-Buchung vom Vormonat — in **einer** Reihe mit den Ludwig-Einträgen,
 * mit dem Wort „DATEV" in der Zeile und in Spalte 2 **ohne Handlungen**.
 */
export const WithDatevEntry: Story = { render: () => <ScenarioPage scenario={S.withDatevEntry} /> };

/**
 * **OPOS-Vortrag** (A1, 29 % — die häufigste und die stillste Seite).
 *
 * Ein offener Posten aus DATEV, ein Ereignis, **keine** Buchung, kein Beleg,
 * kein Signal: Ludwig wartet auf die Zahlung des Kunden. Die Seite sagt
 * trotzdem etwas — woher der Posten kommt und dass nichts zu tun ist. Der
 * Vortrag auf der Kreditorseite (A4, 8 %) ist dieselbe Seite.
 */
export const OpenItemCarryover: Story = { render: () => <ScenarioPage scenario={S.openItemCarryover} /> };

/**
 * **Vollständig und exportiert** (A3, 10 %; Punkt 6 des Auftrags).
 *
 * Beleg und Zahlung, beide gebucht und an DATEV übergeben, die Klammer
 * ausgeglichen. Der gute Fall ist still: kein Signal, keine Handlung, der
 * Export steht als Fakt und nicht als zweiter Zustand im Kopf. Ein Klick auf
 * die Zahlung zeigt die Klammer.
 */
export const CompleteAndExported: Story = { render: () => <ScenarioPage scenario={S.completeAndExported} /> };

/**
 * **Dauersachverhalt ohne Regel** (A6, 8 % — drei von vier Dauerfällen).
 *
 * Der Normalfall: zwei Lastschriften, die zweite als Vorschlag. Die fehlende
 * Regel ist kein Vorwurf, sondern ein Angebot: „aus der letzten Lastschrift
 * anlegen".
 */
export const RecurringWithoutRule: Story = { render: () => <ScenarioPage scenario={S.recurringWithoutRule} /> };

/**
 * **Wartet auf Beleg** (A7, Punkt 2 des Auftrags; 26 Fälle
 * `waiting_for_documents`).
 *
 * Zwei Abbuchungen, gebucht gegen das Personenkonto, die Rechnung ist beim
 * Mandanten angefordert. **Kein Signal**: der Fall wartet auf jemand anderen.
 * Die Erwartung ist keine Frage — sie steht mit Betrag, Frist und Stufe in der
 * Mängel-Zone, mit drei Wegen.
 */
export const AwaitingDocument: Story = { render: () => <ScenarioPage scenario={S.awaitingDocument} /> };

/**
 * **Wartet auf Beleg, überfällig** — die eine Eskalation des Bestands (Stufe
 * 1, genau einmal). Überfällig färbt die **Zeile**, nicht den Kopf.
 */
export const AwaitingDocumentEscalated: Story = {
  render: () => <ScenarioPage scenario={S.awaitingDocumentEscalated} />,
};

/**
 * **Ausgangsrechnung mit Zahlung** (A8, 11 %). Die Debitorenseite des
 * Referenzfalls: die Rechnung ist gebucht, der Zahlungseingang wartet auf
 * die Freigabe, und die Klammer zeigt, was er ausgleicht.
 */
export const OutgoingWithPayment: Story = { render: () => <ScenarioPage scenario={S.outgoingWithPayment} /> };

/**
 * **Rückfrage offen, die Kanzlei ist am Zug** (Punkt 1; 43 Fälle
 * `needs_clarification` mit `disposition = accounting`).
 *
 * Auf Wunsch des Owners **ohne Signal**: die Antwort steht rechts in der
 * Notizspalte, mit Kontext, Empfehlung und den Antworten als Handlungen, dazu
 * Freitext (S13). Der Brief (E5) hatte hier ein Signal vorgesehen — beides
 * zusammen wäre dieselbe Aufforderung zweimal.
 */
export const ClarificationOpenFirm: Story = { render: () => <ScenarioPage scenario={S.clarificationOpenFirm} /> };

/**
 * **Vorschlag zurückgezogen** (Punkt 3; 85 Buchungen im Bestand).
 *
 * Was in den Daten „storniert" heißt, ist fast immer ein zurückgezogener
 * Vorschlag — Storno-Buchungen gibt es keine. Der Fall hat danach keinen
 * gültigen Vorschlag, und zu tun ist trotzdem nichts: der Agent bucht neu.
 * Deshalb kein Signal, und der alte Vorschlag bleibt zum Nachlesen stehen.
 */
export const ProposalWithdrawn: Story = { render: () => <ScenarioPage scenario={S.proposalWithdrawn} /> };

/**
 * **Ersetzt** (Punkt 4; 14 Fälle `closed_superseded`). Beim Zusammenführen in
 * einem anderen Sachverhalt aufgegangen: ein Verweis auf den Nachfolger,
 * keine Handlungen.
 */
export const Superseded: Story = { render: () => <ScenarioPage scenario={S.superseded} /> };

/**
 * **Judge beanstandet** (Punkt 7). Der einzige Fall mit einem Signal in
 * Warnfarbe: der Vorschlag steht, aber der Judge hat einen Fehler gefunden,
 * und die Mängel-Zone nennt ihn mit dem Weg zur Änderung.
 */
export const JudgeFlagged: Story = { render: () => <ScenarioPage scenario={S.judgeFlagged} /> };

/**
 * **Judge angepasst** (Punkt 7). Der Judge hat Konto und Text korrigiert,
 * bevor der Vorschlag die Kanzlei erreicht — das Urteil steht am Vorschlag,
 * die Freigabe ist gewöhnlich.
 */
export const JudgeAdjusted: Story = { render: () => <ScenarioPage scenario={S.judgeAdjusted} /> };

/**
 * Der Reiter **Stammdaten** — und der Grund, warum die Fakten nicht in der
 * Randspalte stehen: hier sind sie das Thema der Seite, in **zwei Spalten
 * Paaren** (`split`), gemessen an der Liste, nicht am Fenster.
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
