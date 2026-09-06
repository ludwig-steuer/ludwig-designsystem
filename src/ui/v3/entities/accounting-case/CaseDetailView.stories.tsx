import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FileText } from "lucide-react";
import { CaseTimeline } from "./CaseTimeline";
import { CaseDetailView } from "./CaseDetailView";
import { CaseFacts, type CaseFactsVM } from "./CaseFacts";
import { EntityHeader } from "../../patterns/EntityHeader";
import { Card, CardHead } from "../../primitives/Table";
import { RecordPager } from "../../primitives/RecordPager";
import { StatusCallout } from "../../primitives/StatusCallout";
import { Tabs, type TabItem } from "../../primitives/Nav";
import { TextButton } from "../../primitives/TextButton";

const meta: Meta<typeof CaseDetailView> = {
  title: "v3/Entitäten/Sachverhalt/CaseDetailView",
  component: CaseDetailView,
};
export default meta;
type Story = StoryObj<typeof CaseDetailView>;

const FACTS: CaseFactsVM = {
  caseNumber: "2026-0412",
  kind: "incoming_invoice",
  lifecycleStatus: "open",
  openedAt: "2026-08-26",
  summary:
    "Rechnung über die Wartung der Klimaanlage, Leistung im August erbracht. " +
    "Der Betrag ist auf zwei Kostenstellen zu verteilen.",
  counterpartyPartnerId: "p-8812",
  counterpartyName: "Bürobedarf Meier GmbH",
  fyPersonalAccountNumber: "70021",
  documentNumberMode: "single",
  closedAt: null,
};

const TABS: TabItem[] = [
  { key: "uebersicht", label: "Übersicht" },
  { key: "belege", label: "Belege", count: 2 },
  { key: "buchungen", label: "Buchungen", count: 1 },
  { key: "klaerungen", label: "Klärungen", count: 1, alarm: true },
  { key: "erwartungen", label: "Was fehlt", count: 1 },
  { key: "datev", label: "DATEV", dot: true },
  { key: "plausibilitaet", label: "Plausibilität" },
  { key: "verlauf", label: "Verlauf" },
];

const head = (
  <EntityHeader
    overline="Eingangsrechnung · 2026-0412"
    title="Wartung der Klimaanlage"
    meta="Kanzlei ist dran · Wirtschaftsjahr 2026"
    metric={{ label: "Gesamtbetrag", value: "1.249,90 €" }}
  />
);

const pager = (
  <RecordPager
    position={3}
    total={117}
    label="Sachverhalt"
    back={{ href: "#liste", label: "Sachverhalte" }}
    prevHref="#vorher"
    nextHref="#nachher"
  />
);

const facts = (
  <Card>
    <CardHead title="Fakten" sub="Sachverhalt 2026-0412" />
    <div style={{ padding: "var(--space-5)" }}>
      <CaseFacts case={FACTS} partnerHref="#partner" accountHref={(n) => `#konto-${n}`} />
    </div>
  </Card>
);

const strand = (
  <Card>
    <CardHead title="Verlauf" sub="6 Einträge" />
    <div style={{ padding: "var(--space-4)" }}>
      <CaseTimeline
        events={[
          {
            id: "ev1",
            kind: "document_received",
            date: "2026-08-26",
            title: "RE-4471 im Posteingang angekommen",
            state: "posted",
            amount: 1249.9,
            currency: "EUR",
          },
          {
            id: "ev2",
            kind: "payment_out",
            date: "2026-08-29",
            title: "Zahlung an Bürobedarf Meier GmbH",
            state: "open",
            amount: 1249.9,
            currency: "EUR",
          },
        ]}
        today="2026-09-06"
      />
    </div>
  </Card>
);

/** Der volle Fall: Pager, Kopf, nächste Handlung, acht Reiter, Strang links. */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <CaseDetailView
        pager={pager}
        header={head}
        nextAction={
          <StatusCallout
            tone="warning"
            icon={<FileText size={16} strokeWidth={1.5} />}
            kicker="Als Nächstes"
            title="Eine Klärung wartet auf Ihre Antwort."
            actions={<TextButton href="#klaerung">Zur Klärung</TextButton>}
          />
        }
        tabs={<Tabs items={TABS} active="uebersicht" ariaLabel="Sachverhalt" />}
        aside={strand}
      >
        {facts}
      </CaseDetailView>
    </div>
  ),
};

/**
 * Ein einziges Ereignis: kein `aside`, einspaltig. Eine Timeline-Karte mit
 * einer Zeile ist kein Drittel der Breite wert.
 */
export const SingleEvent: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <CaseDetailView
        pager={pager}
        header={head}
        tabs={<Tabs items={TABS.slice(0, 3)} active="uebersicht" ariaLabel="Sachverhalt" />}
      >
        {facts}
      </CaseDetailView>
    </div>
  ),
};

/**
 * Der Fall wartet auf den Mandanten: **keine** nächste Handlung — die Zeile
 * entfällt samt Abstand, statt einen leeren Kasten zu zeigen. Der Zustand
 * steht im Kopf.
 */
export const Waiting: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <CaseDetailView
        pager={pager}
        header={
          <EntityHeader
            overline="Eingangsrechnung · 2026-0498"
            title="Bewirtung Restaurant Adler"
            meta="Mandant ist dran · wartet auf Unterlagen"
            metric={{ label: "Gesamtbetrag", value: "128,40 €" }}
          />
        }
        tabs={<Tabs items={TABS} active="erwartungen" ariaLabel="Sachverhalt" />}
        aside={strand}
      >
        {facts}
      </CaseDetailView>
    </div>
  ),
};

/** Ohne Reiter — der einfache Fall: eine Fläche, keine Leiste. */
export const WithoutTabs: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <CaseDetailView header={head}>{facts}</CaseDetailView>
    </div>
  ),
};

/**
 * Die Regel aus Entscheidung 1: ein Zähler, wo sich zählen lässt, ein Punkt,
 * wo es etwas gibt, das sich nicht zählen lässt — und ein Reiter, den es gar
 * nicht gibt, erscheint nicht als leerer.
 */
export const TabsWithCountAndDot: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <CaseDetailView
        header={head}
        tabs={
          <Tabs
            items={[
              { key: "uebersicht", label: "Übersicht" },
              { key: "klaerungen", label: "Klärungen", count: 3, alarm: true },
              { key: "datev", label: "DATEV", dot: true },
              { key: "verlauf", label: "Verlauf", count: 0 },
            ]}
            active="uebersicht"
            ariaLabel="Sachverhalt"
          />
        }
      >
        {facts}
      </CaseDetailView>
    </div>
  ),
};

/** Im Einsatz: die ganze Seite, wie die App sie zeigt. */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 1180, background: "var(--color-bg)", padding: "var(--space-6)" }}>
      <CaseDetailView
        pager={pager}
        header={head}
        nextAction={
          <StatusCallout
            tone="warning"
            icon={<FileText size={16} strokeWidth={1.5} />}
            kicker="Als Nächstes"
            title="Eine Klärung wartet auf Ihre Antwort."
            actions={<TextButton href="#klaerung">Zur Klärung</TextButton>}
          />
        }
        tabs={<Tabs items={TABS} active="uebersicht" ariaLabel="Sachverhalt" />}
        aside={strand}
      >
        {facts}
      </CaseDetailView>
    </div>
  ),
};
