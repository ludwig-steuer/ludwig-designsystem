import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SourceDocumentView } from "./SourceDocumentView";
import { SourceDocumentCard } from "./SourceDocumentCard";
import { SourceDocumentClass, type SourceDocumentVM } from "./SourceDocument";
import { SourceDocumentCompletion } from "./SourceDocument";
import { AppShell, TopBar } from "../../primitives/AppShell";
import { NavList, type NavSection } from "../../primitives/NavList";
import { Banner } from "../../primitives/Banner";
import { Button } from "../../primitives/Button";
import { EmptyState } from "../../primitives/EmptyState";
import { RecordPager } from "../../primitives/RecordPager";
import { Skeleton } from "../../primitives/Skeleton";
import { Tabs } from "../../primitives/Nav";
import { TextButton } from "../../primitives/TextButton";
import { EntityIcon } from "../../Icons";
import { EntityHeader } from "../../patterns/EntityHeader";

const meta: Meta<typeof SourceDocumentView> = {
  title: "v3/Entitäten/Beleg/SourceDocumentView",
  component: SourceDocumentView,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SourceDocumentView>;

const INVOICE: SourceDocumentVM = {
  id: "3f2b9c14",
  fileName: "RE-4471-Bürobedarf-Meier.pdf",
  sourceDocType: "invoice",
  classDocumentForm: "commercial_invoice",
  counterparty: "Bürobedarf Meier GmbH",
  detail: {
    kind: "invoice",
    number: "RE-4471",
    gross: 1249.9,
    currency: "EUR",
    net: 1050.34,
    vat: 199.56,
    dueDate: "2026-09-25",
  },
  documentDate: "2026-08-26",
  receivedDate: "2026-08-27",
  completedAt: "2026-08-30T09:12:00Z",
  completedVia: "booking",
  docCategory: "performance",
  docDirection: "inbound",
  caseNumber: "2026-0412",
  processingStatus: "processed",
};

const SCAN: SourceDocumentVM = {
  id: "9a1c",
  fileName: "Scan-2026-09-01-14-32-08.pdf",
  sourceDocType: null,
  classDocumentForm: "other",
  counterparty: null,
  documentDate: null,
  receivedDate: "2026-09-01",
  completedAt: null,
  inboxStatus: "pending_classification",
};

const PREVIEW = "data:application/pdf;base64,";

// Vier Reiter, nicht sechs: „Monate" und „Rohdaten" beantworten dieselbe
// Frage wie der Verlauf, nur tiefer — der View merkt davon nichts, er bekommt
// die Liste, die er bekommt (Entscheid der Freigabe).
const SECTIONS: NavSection[] = [
  {
    label: "Arbeit",
    items: [
      { href: "/cases", label: "Sachverhalte", count: 14 },
      { href: "/documents", label: "Belege", count: 102 },
      { href: "/banks", label: "Bank", count: 2, alarm: true },
    ],
  },
  {
    label: "Stammdaten",
    items: [
      { href: "/accounts", label: "Konten" },
      { href: "/partners", label: "Geschäftspartner" },
    ],
  },
];

const TABS = [
  { key: "beleg", label: "Beleg", href: "#beleg" },
  { key: "positionen", label: "Positionen", href: "#positionen" },
  { key: "vorsteuer", label: "Vorsteuer", href: "#vorsteuer" },
  { key: "verlauf", label: "Verlauf & Befunde", count: 3, href: "#verlauf" },
];

/** Der Kopf: Rang 1 und 4 — wer, welche Art, und **die Erledigung** als Zustand. */
function Head({ document, actions }: { document: SourceDocumentVM; actions?: React.ReactNode }) {
  return (
    <EntityHeader
      icon={<EntityIcon entity="source-document" size={20} />}
      overline="Beleg · Musterbau GmbH"
      title={document.counterparty ?? "Noch nicht eingeordnet"}
      // **Die Erledigung führt**, nicht die Verarbeitung: die Achse `beleg`
      // hängt an der Rechnungszeile und hat für 16 % aller Belege gar keinen
      // Wert (Befund L-42).
      status={<SourceDocumentCompletion document={document} />}
      meta={<SourceDocumentClass document={document} />}
      {...(actions ? { actions } : {})}
    />
  );
}

const PAGER = (
  <RecordPager
    back={{ href: "#belege", label: "Belege" }}
    position={12}
    total={102}
    label="Beleg"
    prevHref="#beleg-11"
    nextHref="#beleg-13"
  />
);

/**
 * Der volle Fall. Die Ränge 1–4 des Seitenprofils stehen **ohne Scrollen**:
 * Kopf, Original, gelesene Werte, Zustand — deshalb setzt der Rahmen keine
 * eigene Höhe über den oberen Slots.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentView
        pager={PAGER}
        header={
          <Head
            document={INVOICE}
            actions={
              <>
                <TextButton onClick={() => {}}>Zum Sachverhalt →</TextButton>
                <Button variant="secondary" onClick={() => {}}>
                  Erledigt setzen
                </Button>
              </>
            }
          />
        }
        tabs={<Tabs items={TABS} active="beleg" ariaLabel="Ansichten des Belegs" />}
      >
        <SourceDocumentCard
          document={INVOICE}
          summary="Wartung der Klimaanlage, abgerechnet nach Stunden."
          previewUrl={PREVIEW}
        />
      </SourceDocumentView>
    </div>
  ),
};

/**
 * „wird eingeordnet": der Banner gehört dem ganzen Beleg und kann nicht auf
 * einen Reiter warten. Er sagt auch, dass die Seite sich selbst nachlädt —
 * sonst wartet jemand auf einen Knopf, den es nicht gibt.
 */
export const Pending: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentView
        pager={PAGER}
        header={<Head document={SCAN} />}
        banner={
          <Banner tone="info" title="Wird eingeordnet — die Seite aktualisiert sich selbst">
            Der Beleg ist hochgeladen und wartet auf die Klassifikation. Solange steht
            noch nicht fest, welche Art Beleg das ist.
          </Banner>
        }
        tabs={<Tabs items={[TABS[0]!, TABS[3]!]} active="beleg" ariaLabel="Ansichten des Belegs" />}
      >
        <SourceDocumentCard
          document={SCAN}
          previewUrl={PREVIEW}
          missing={[
            {
              field: "Belegdatum",
              hint: "Die Extraktion hat keins gefunden.",
              action: <TextButton onClick={() => {}}>Datum setzen</TextButton>,
            },
          ]}
        />
      </SourceDocumentView>
    </div>
  ),
};

/**
 * Ein anderer Reiter ist aktiv: der Rahmen bleibt derselbe, nur `children`
 * wechselt. Der View lädt den Inhalt **nicht** — fünf der sechs Reiter
 * brauchen eigene Server-Aufrufe, die die Seite macht.
 */
export const OtherTab: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentView
        pager={PAGER}
        header={<Head document={INVOICE} />}
        tabs={<Tabs items={TABS} active="verlauf" ariaLabel="Ansichten des Belegs" />}
      >
        <EmptyState
          inline
          title="Verlauf & Befunde"
          description="Hier stehen die Extraktions-Läufe, die LLM-Aufrufe und die Jobs — die Seite lädt sie, wenn dieser Reiter aktiv ist."
        />
      </SourceDocumentView>
    </div>
  ),
};

/** Lädt und Fehler — beide gehören dem Inhalt, nicht dem Rahmen: Kopf und Reiter bleiben stehen. */
export const LoadingAndError: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500, display: "grid", gap: "var(--space-6)" }}>
      <SourceDocumentView
        pager={PAGER}
        header={<Head document={INVOICE} />}
        tabs={<Tabs items={TABS} active="beleg" ariaLabel="Ansichten des Belegs" />}
      >
        <Skeleton lines={6} label="Beleg wird geladen …" />
      </SourceDocumentView>

      <SourceDocumentView
        pager={PAGER}
        header={<Head document={INVOICE} />}
        tabs={<Tabs items={TABS} active="beleg" ariaLabel="Ansichten des Belegs" />}
      >
        <Banner tone="danger" title="Der Beleg konnte nicht geladen werden">
          Die Datei liegt im Archiv und der Abruf ist abgelaufen.{" "}
          <TextButton onClick={() => {}}>Erneut versuchen</TextButton>
        </Banner>
      </SourceDocumentView>
    </div>
  ),
};

/**
 * Ohne Reiter und ohne Pager: der Rahmen lässt beide Zeilen **samt Abstand**
 * fallen. Ein Beleg, den niemand aus einer Liste geöffnet hat, darf nicht
 * aussehen, als fehlte dort etwas.
 */
export const Bare: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentView header={<Head document={INVOICE} />}>
        <SourceDocumentCard document={INVOICE} previewUrl={PREVIEW} />
      </SourceDocumentView>
    </div>
  ),
};

/**
 * Im Einsatz: die ganze Seite, wie die App sie zeigt — Sidebar, Kopfleiste,
 * der Beleg darin. Erst hier hat die Karte die Breite, die sie auf der Seite
 * wirklich bekommt: bei 1440 × 900 sind das **1.136 px** (nachgemessen; die
 * Sidebar und das Polster der Schale gehen ab), nicht die 1.400 der übrigen
 * Stories. Die Abnahme vom
 * 2026-09-07 hat genau daran gemessen, dass das Zwei-Spalten-Tor gegen die
 * Fixture gerechnet war — deshalb steht diese Story hier und nicht nur in
 * der Ableitung.
 */
export const InUse: Story = {
  render: () => (
    <AppShell
      sidebar={
        <>
          <div className="sb__logo">Ludwig</div>
          <NavList sections={SECTIONS} activePath="/documents" />
        </>
      }
      topbar={<TopBar crumb="Musterbau GmbH · 2026" />}
    >
      <SourceDocumentView
        pager={PAGER}
        header={
          <Head
            document={INVOICE}
            actions={
              <>
                <TextButton onClick={() => {}}>Zum Sachverhalt →</TextButton>
                <Button variant="secondary" onClick={() => {}}>
                  Erledigt setzen
                </Button>
              </>
            }
          />
        }
        tabs={<Tabs items={TABS} active="beleg" ariaLabel="Ansichten des Belegs" />}
      >
        <SourceDocumentCard document={INVOICE} previewUrl={PREVIEW} />
      </SourceDocumentView>
    </AppShell>
  ),
};
