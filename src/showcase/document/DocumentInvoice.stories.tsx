import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SourceDocumentCard } from "@/ui/v3/entities/source-document/SourceDocumentCard";
import { Banner } from "@/ui/v3/primitives/Banner";
import { Button } from "@/ui/v3/primitives/Button";
import { Card, CardHead } from "@/ui/v3/primitives/Table";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { InlineEdit } from "@/ui/v3/primitives/InlineEdit";
import { MenuItem, OverflowMenu } from "@/ui/v3/primitives/OverflowMenu";

import { DocumentPage, overviewBoxes } from "./DocumentPage";
import { documentFixture, documentDefects, CLARIFICATION, MUSTER_PDF, caseHref, batchHref } from "./fixtures";

/**
 * Die Rechnung — neun Zustände derselben Seite (0144, R1–R9).
 *
 * Alle Daten sind erfunden und erkennbar so. Was hier nicht trägt, ist ein
 * Befund an das Seitenprofil oder an die App, nicht an die Story.
 */
const meta: Meta<typeof DocumentPage> = {
  title: "Seiten/Beleg/Rechnung",
  component: DocumentPage,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof DocumentPage>;

/**
 * Die selten gebrauchten Wege — nie in der ersten Reihe. Der Standard lässt
 * höchstens zwei Aktionen im Kopf; alles andere kommt hierher.
 */
const menu = (
  <OverflowMenu label="Weitere Aktionen">
    <MenuItem onClick={() => {}}>Neu verarbeiten</MenuItem>
    <MenuItem onClick={() => {}}>Zurücksetzen</MenuItem>
    <MenuItem onClick={() => {}}>DATEV-Meta importieren</MenuItem>
  </OverflowMenu>
);

/**
 * **R1 — sauber.** Eingeordnet, verarbeitet, gebucht, an einem Sachverhalt.
 * Keine Mängel-Zone, kein Banner.
 *
 * Das ist der Fall, an dem das Design entschieden wurde, und der Maßstab für
 * die achtzehn anderen: Rang 1–4 stehen ohne Scrollen über der Falz.
 */
export const Clean: Story = {
  render: () => (
    <DocumentPage
      document={documentFixture()}
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
        batchHref={batchHref}
        {...overviewBoxes()}
      />
    </DocumentPage>
  ),
};

/**
 * **R2 — das Belegdatum fehlt.** Der häufigste Mangel im Bestand, und er ist
 * hier als **Mangel** sichtbar, nicht als leeres Feld: die Zone 2 nennt ihn,
 * die Faktenzeile trägt den Weg, ihn zu setzen.
 *
 * Der Unterschied ist der Punkt. Ein leeres Feld sieht aus wie ein leeres
 * Feld; ein Mangel sagt, dass jemand etwas tun muss.
 */
export const DateMissing: Story = {
  render: function Datum() {
    const [date, setDate] = useState<string | null>(null);
    const doc = documentFixture({ documentDate: date, completedAt: null, completedVia: null });
    return (
      <DocumentPage document={doc} actions={menu}>
        {date ? null : (
          // **Zone 2**, und die Mängelzeile in den Fakten dazu. Beides, nicht
          // eins von beiden: die Zone sagt, dass etwas zu tun ist, und das
          // Zeichen an der Zeile sagt, an welchem Wert (Owner-Entscheid zu
          // Frage 3).
          <Card>
            <CardHead title="Zu klären" sub="1 Befund an diesem Beleg" />
            <div style={{ padding: 16 }}>
              <FieldList
                tone="bare"
                rows={[
                  [
                    "Belegdatum fehlt",
                    <span key="d">
                      Ohne Belegdatum fällt der Beleg aus jedem Jahresfilter.{" "}
                      <InlineEdit label="Belegdatum" value="" onSave={async (v) => setDate(v || null)} />
                    </span>,
                  ],
                ]}
              />
            </div>
          </Card>
        )}
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary="Miete Musterstraße 12, August 2026"
          missing={
            date
              ? []
              : [
                  {
                    field: "Belegdatum",
                    hint: "Ohne Belegdatum fällt der Beleg aus jedem Jahresfilter — er wäre in der Belegliste nicht zu finden.",
                    action: (
                      <InlineEdit
                        label="Belegdatum"
                        value=""
                        onSave={async (v) => setDate(v || null)}
                      />
                    ),
                  },
                ]
          }
        />
      </DocumentPage>
    );
  },
};

/**
 * **R3 — wartet auf Prüfung.** Die Extraktion ist durch, das Review-Gate steht.
 *
 * Es ist **Signal plus Aktion**, nicht ein Kopf-Status: der Kopf trägt einen
 * Zustand, und das ist die Erledigung. „Wartet auf Prüfung" ist etwas, das
 * jemand tun soll — also gehört es ins Signal und in die erste Aktion.
 */
export const AwaitingReview: Story = {
  render: () => {
    const doc = documentFixture({ completedAt: null, completedVia: null });
    return (
      <DocumentPage
        document={doc}
        signal={
          <Banner tone="info" title="Extrahiert — bitte bestätigen.">
            Ludwig hat Betrag, Datum und Gegenpart gelesen. Die Buchung entsteht erst nach
            Ihrer Bestätigung.
          </Banner>
        }
        actions={
          <>
            <Button variant="primary" size="sm">
              Prüfung bestätigen
            </Button>
            {menu}
          </>
        }
      >
        <SourceDocumentCard document={doc} previewUrl={MUSTER_PDF} summary="Miete Musterstraße 12, August 2026" />
      </DocumentPage>
    );
  },
};

/**
 * **R4 — die Extraktion läuft.** Der Fortschritt steht im Signal-Slot mit
 * „läuft seit"; die Fakten sind leer und sagen das auch, statt Leerzeilen zu
 * zeigen. Außer dem Menü gibt es keine Aktion — es gibt nichts zu entscheiden.
 */
export const ExtractionRunning: Story = {
  render: () => {
    const doc = documentFixture({
      processingStatus: "in_progress",
      completedAt: null,
      completedVia: null,
      documentDate: null,
      counterparty: null,
      classConfidence: null,
      detail: null,
      hasInvoiceRow: false,
    });
    return (
      <DocumentPage
        document={doc}
        signal={
          <Banner tone="info" title="Wird ausgelesen — läuft seit 40 Sekunden.">
            Die Seite aktualisiert sich selbst, sobald Ludwig fertig ist.
          </Banner>
        }
        actions={menu}
      >
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary={null}
        />
      </DocumentPage>
    );
  },
};

/**
 * **R4b — die Extraktion hängt.** Derselbe Zustand, nur seit vier Minuten. Die
 * Warnung steht **im selben Banner**, nicht in einem zweiten daneben: der
 * Slot trägt genau eines, und „läuft" und „läuft zu lange" sind eine Aussage.
 */
export const ExtractionStuck: Story = {
  render: () => {
    const doc = documentFixture({
      processingStatus: "in_progress",
      completedAt: null,
      completedVia: null,
      documentDate: null,
      counterparty: null,
      classConfidence: null,
      detail: null,
      hasInvoiceRow: false,
    });
    return (
      <DocumentPage
        document={doc}
        signal={
          <Banner tone="warning" title="Wird ausgelesen — läuft seit 4 Minuten.">
            Das dauert länger als üblich. Über „Neu verarbeiten" im Menü starten Sie den
            Durchgang neu.
          </Banner>
        }
        actions={menu}
      >
        <SourceDocumentCard document={doc} previewUrl={MUSTER_PDF} summary={null} />
      </DocumentPage>
    );
  },
};

/**
 * **R5 — fehlgeschlagen.** Das Banner nennt die **Ursache und den nächsten
 * Schritt**; die Fakten stehen, soweit Ludwig etwas lesen konnte. Ein Fehler,
 * der nur „fehlgeschlagen" sagt, lässt die Sachbearbeiterin ratlos zurück.
 */
export const Failed: Story = {
  render: () => {
    const doc = documentFixture({
      processingStatus: "failed",
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
    });
    return (
      <DocumentPage
        document={doc}
        signal={
          <Banner tone="danger" title="Auslesen fehlgeschlagen: das PDF ist ein Scan ohne Text.">
            Ludwig konnte keine Zeichen erkennen. Verarbeiten Sie den Beleg neu, oder haken
            Sie ihn mit einem Grund ab.
          </Banner>
        }
        actions={
          <>
            <Button variant="secondary" size="sm">
              Neu verarbeiten
            </Button>
            {menu}
          </>
        }
      >
        <SourceDocumentCard document={doc} previewUrl={MUSTER_PDF} summary={null} />
      </DocumentPage>
    );
  },
};

/**
 * **R6 — an die Kanzlei übergeben.** Der Grund steht im Banner, der Weg zurück
 * ist ein Knopf. Die Eskalation ist damit sichtbar, statt nur im Verlauf zu
 * stehen.
 */
export const WithFirm: Story = {
  render: () => {
    const doc = documentFixture({ completedAt: null, completedVia: null });
    return (
      <DocumentPage
        document={doc}
        tab="details"
        signal={
          <Banner tone="warning" title="An die Kanzlei übergeben.">
            Der Agent ist sich beim Steuerschlüssel nicht sicher: die Rechnung nennt keinen
            Steuersatz, und der Lieferant hat zwei verschiedene im Vorjahr.
          </Banner>
        }
        actions={
          <>
            <Button variant="secondary" size="sm">
              An Agent zurückgeben
            </Button>
            {menu}
          </>
        }
      >
        <Card>
          <CardHead title="Kopfwerte" sub="Was Ludwig gelesen hat — hier korrigieren Sie es" />
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                ["Gegenpart", <InlineEdit key="c" label="Gegenpart" value="Musterbau GmbH" onSave={async () => {}} />],
                ["Rechnungsnummer", <InlineEdit key="n" label="Rechnungsnummer" value="R-2026-0042" onSave={async () => {}} />],
                ["Steuerschlüssel", <InlineEdit key="t" label="Steuerschlüssel" value="" onSave={async () => {}} />],
              ]}
            />
          </div>
        </Card>
      </DocumentPage>
    );
  },
};

/**
 * **R7 — Werte korrigieren.** Die Rolle bezweifelt Betrag und Nummer.
 *
 * Das liegt im Reiter **Details**, nicht in der Übersicht: eine Korrektur, die
 * mehr als einen Wert betrifft, braucht alle Werte nebeneinander — und die
 * Übersicht schreibt nur über Aktionen und aus einer Mängelzeile (D9).
 * Korrigierte Werte tragen ein Zeichen „von Hand" mit Datum.
 */
export const CorrectedValues: Story = {
  render: function Korrektur() {
    const [net, setNet] = useState("1.512,61");
    const [number, setNumber] = useState("R-2026-0042");
    const touched = net !== "1.512,61" || number !== "R-2026-0042";
    return (
      <DocumentPage document={documentFixture()} tab="details" actions={menu}>
        <Card>
          <CardHead
            title="Kopfwerte"
            sub={touched ? "Von Hand korrigiert am 09.09.2026" : "Von Ludwig gelesen, Konfidenz 94 %"}
          />
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                ["Gegenpart", "Musterbau GmbH"],
                [
                  "Rechnungsnummer",
                  <InlineEdit key="n" label="Rechnungsnummer" value={number} onSave={async (v) => setNumber(v)} />,
                ],
                ["Belegdatum", "14.08.2026"],
                [
                  "Netto",
                  <InlineEdit key="net" label="Netto" value={net} onSave={async (v) => setNet(v)} />,
                ],
                ["USt (19 %)", "287,39 €"],
                ["Brutto", "1.800,00 €"],
              ]}
            />
          </div>
        </Card>
      </DocumentPage>
    );
  },
};

/**
 * **R8 — drei Befunde.** Dublettenverdacht, mehrdeutiger Partner, falscher
 * Empfänger.
 *
 * Sie stehen in **einer** Zone, nicht in drei Kästen, und jeder trägt seinen
 * eigenen Weg. Das ist der Owner-Entscheid zu Frage 3: eine Zone nach D4, und
 * die Fakten tragen zusätzlich das Zeichen an der betroffenen Zeile.
 */
export const WithFindings: Story = {
  render: () => {
    const doc = documentFixture({
      completedAt: null,
      completedVia: null,
      documentDate: null,
      counterparty: "Musterbau GmbH",
    });
    const defects = documentDefects({
      documentDate: null,
      openFindings: [
        {
          code: "duplicate_suspicion",
          field: null,
          message: "looks like invoice R-2026-0041 from the same vendor",
        },
      ],
      partnerMatchOutcome: "ambiguous",
      recipientMatch: "mismatch",
      recipientMatchReason: "Rechnung lautet auf Beispiel Handels GmbH",
    });
    return (
      <DocumentPage document={doc} actions={menu}>
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary="Miete Musterstraße 12, August 2026"
          {...overviewBoxes({ defects: defects, clarifications: [CLARIFICATION] })}
        />
      </DocumentPage>
    );
  },
};

/**
 * **R9 — erledigt.** Zwei Fassungen: ohne Buchung nötig, und ersetzt
 * (`superseded`).
 *
 * Der Kopf trägt **einen** Zustand, das Datum daneben — „erledigt" ohne Datum
 * ist die Hälfte der Antwort, die man nicht prüfen kann. Beides kommt aus
 * `SourceDocumentCompletion`, nicht aus einem Nachbau.
 *
 * **Der Grund steht seit 0150 als Satz in den Fakten**, nicht mehr nur im
 * Tooltip: „Keine Buchung nötig" sagt, was geschah, nie warum, und im Kopf ist
 * für den Satz kein Platz. Wo der Beleg einen eigenen Grund trägt, steht
 * dieser; sonst der Satz der Achse. Die Marke selbst ist anklickbar und öffnet
 * die Erklärung aller Stufen.
 */
export const Done: Story = {
  render: () => {
    const doc = documentFixture({
      completedVia: "no_booking_required",
      completedReason: "Privatentnahme, gehört nicht in die Buchführung.",
    });
    const replaced = documentFixture({
      completedVia: "superseded",
      completedReason: "Ersetzt durch R-2026-0058 — der Lieferant hat storniert und neu gestellt.",
    });
    return (
      <div style={{ display: "grid", gap: 40 }}>
      <DocumentPage
        document={doc}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Wieder öffnen
            </Button>
            {menu}
          </>
        }
      >
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary="Miete Musterstraße 12, August 2026"
          {...overviewBoxes({ defects: [] })}
        />
      </DocumentPage>

      <DocumentPage
        document={replaced}
        actions={
          <>
            <Button variant="secondary" size="sm">
              Wieder öffnen
            </Button>
            {menu}
          </>
        }
      >
        <SourceDocumentCard
          document={replaced}
          previewUrl={MUSTER_PDF}
          summary="Miete Musterstraße 12, August 2026"
          {...overviewBoxes({ defects: [] })}
        />
      </DocumentPage>
      </div>
    );
  },
};
