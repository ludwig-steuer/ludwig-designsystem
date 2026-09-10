import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SourceDocumentCard } from "@/ui/v3/entities/source-document/SourceDocumentCard";
import { AppShell, TopBar } from "@/ui/v3/primitives/AppShell";
import { Banner } from "@/ui/v3/primitives/Banner";
import { Button } from "@/ui/v3/primitives/Button";
import { EmptyState } from "@/ui/v3/primitives/EmptyState";
import { MenuItem, OverflowMenu } from "@/ui/v3/primitives/OverflowMenu";
import { NavList, type NavSection } from "@/ui/v3/primitives/NavList";
import { Skeleton } from "@/ui/v3/primitives/Skeleton";

import { DocumentPage } from "./DocumentPage";
import { documentFixture, listHref, MUSTER_PDF, caseHref } from "./fixtures";

/**
 * Die Seite selbst — drei Zustände, die keinem Beleg gehören (0144, S1–S3).
 *
 * „Leer nach Filter" ist nicht anwendbar: die Seite hat keinen Filter.
 */
const meta: Meta<typeof DocumentPage> = {
  title: "Seiten/Beleg/Seite",
  component: DocumentPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DocumentPage>;

const menu = (
  <OverflowMenu label="Weitere Aktionen">
    <MenuItem onClick={() => {}}>Neu einordnen</MenuItem>
    <MenuItem onClick={() => {}}>Klassifikation korrigieren</MenuItem>
  </OverflowMenu>
);

/**
 * **S1 — wird eingeordnet**, und die Gegenprobe daneben: die Einordnung ist
 * gescheitert.
 *
 * Unklassifiziert ist ein **Zustand der Seite**, kein Fehler: der Beleg ist da,
 * Ludwig weiß nur noch nicht, was er ist. Die Belegart heißt so lange „Beleg",
 * die Fakten sind Dateiname und Eingang, und die Aktionen sind gesperrt — es
 * gibt nichts zu entscheiden, solange niemand weiß, worüber.
 *
 * Gescheitert ist etwas anderes: dann steht die Ursache da und ein Weg.
 */
export const BeingClassified: Story = {
  render: () => {
    const open = documentFixture({
      sourceDocType: "other",
      classDocumentForm: null,
      fileName: "Scan-2026-09-09-14-32-08.pdf",
      counterparty: null,
      documentDate: null,
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
      inboxStatus: "pending_classification",
      classConfidence: null,
      datevRefSystem: null,
      datevRefFolder: null,
      datevRefId: null,
      caseNumber: null,
    });
    return (
      <div style={{ display: "grid", gap: 40 }}>
        <DocumentPage
          document={open}
          signal={
            <Banner tone="info" title="Wird eingeordnet.">
              Ludwig liest gerade, was für ein Beleg das ist. Die Seite aktualisiert sich
              selbst.
            </Banner>
          }
          actions={menu}
        >
          <SourceDocumentCard document={open} previewUrl={MUSTER_PDF} summary={null} />
        </DocumentPage>

        <DocumentPage
          document={{ ...open, inboxStatus: "classification_failed" }}
          signal={
            <Banner tone="danger" title="Einordnen fehlgeschlagen: das PDF ist verschlüsselt.">
              Ludwig konnte die Datei nicht öffnen. Über das Menü stoßen Sie das Einordnen
              neu an oder setzen die Belegart von Hand.
            </Banner>
          }
          actions={menu}
        >
          <SourceDocumentCard
            document={{ ...open, inboxStatus: "classification_failed" }}
            previewUrl={null}
            previewUnavailableReason="Die Datei ist verschlüsselt und lässt sich nicht anzeigen."
            summary={null}
          />
        </DocumentPage>
      </div>
    );
  },
};

/**
 * **S2 — lädt, Fehler, nicht gefunden.** Drei der fünf Pflichtzustände
 * nebeneinander.
 *
 * Die Ladefläche hat die **Form des Inhalts** — ein Block für den Kopf, zwei
 * Spalten für Original und Fakten —, nicht ein Kasten über allem. Der Fehler
 * nennt den nächsten Schritt, und „nicht gefunden" führt zurück in die Liste,
 * aus der jemand kam.
 */
export const LoadingErrorNotFound: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 40, padding: 24 }}>
      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>lädt</div>
        <div style={{ display: "grid", gap: 16 }}>
          <Skeleton lines={3} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Skeleton lines={8} />
            <Skeleton lines={8} />
          </div>
        </div>
      </div>

      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>Fehler</div>
        <Banner tone="danger" title="Der Beleg konnte nicht geladen werden.">
          Die Verbindung zur Datenbank ist abgerissen. Laden Sie die Seite neu; bleibt es
          dabei, hilft nur ein Blick in die Protokolle.
        </Banner>
      </div>

      <div>
        <div className="v2muted" style={{ marginBottom: 8 }}>nicht gefunden</div>
        <EmptyState
          inline
          title="Diesen Beleg gibt es nicht."
          description="Er wurde gelöscht, oder die Kennung in der Adresse stimmt nicht."
          action={
            <Button variant="secondary" size="sm" href={listHref}>
              Zurück zu den Belegen
            </Button>
          }
        />
      </div>
    </div>
  ),
};

const NAV: NavSection[] = [
  {
    label: "Mandant",
    items: [
      { label: "Übersicht", href: "/uebersicht" },
      { label: "Belege", href: "/belege" },
      { label: "Sachverhalte", href: "/sachverhalte" },
      { label: "Konten", href: "/konten" },
    ],
  },
];

/**
 * **S3 — im Einsatz.** R1 in der ganzen Anwendung, mit Navigation und dem
 * Pager auf `3/117`, zurück zu „Problematische Belege".
 *
 * Das ist die Abnahmefrage der ganzen Aufgabe: stehen Rang 1 bis 4 bei
 * 1440 × 900 **über der Falz**? Der Kopf, das Signal (hier keins), das
 * Original und die ersten Fakten — ohne zu scrollen.
 */
export const InUse: Story = {
  render: () => (
    <AppShell
      topbar={<TopBar crumb="Musterfirma GmbH · 2026" />}
      sidebar={<NavList sections={NAV} activePath="/belege" />}
    >
      <DocumentPage
        document={documentFixture()}
        back="Problematische Belege"
        position={3}
        total={117}
        actions={
          <>
            <Button variant="secondary" size="sm" href={caseHref}>
              Zum Sachverhalt →
            </Button>
            {menu}
          </>
        }
      >
        <SourceDocumentCard
          document={documentFixture()}
          previewUrl={MUSTER_PDF}
          summary="Miete Musterstraße 12, August 2026"
        />
      </DocumentPage>
    </AppShell>
  ),
};
