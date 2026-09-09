import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SourceDocumentCard } from "@/ui/v3/entities/source-document/SourceDocumentCard";
import { Banner } from "@/ui/v3/primitives/Banner";
import { Button } from "@/ui/v3/primitives/Button";
import { Card, CardHead } from "@/ui/v3/primitives/Table";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { InlineEdit } from "@/ui/v3/primitives/InlineEdit";
import { MenuItem, OverflowMenu } from "@/ui/v3/primitives/OverflowMenu";
import { TextButton } from "@/ui/v3/primitives/TextButton";

import { BelegSeite } from "./BelegSeite";
import { belegFixture, MUSTER_PDF, caseHref } from "./fixtures";

/**
 * Die Rechnung — neun Zustände derselben Seite (0144, R1–R9).
 *
 * Alle Daten sind erfunden und erkennbar so. Was hier nicht trägt, ist ein
 * Befund an das Seitenprofil oder an die App, nicht an die Story.
 */
const meta: Meta<typeof BelegSeite> = {
  title: "Seiten/Beleg/Rechnung",
  component: BelegSeite,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof BelegSeite>;

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
export const Sauber: Story = {
  render: () => (
    <BelegSeite
      document={belegFixture()}
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
        document={belegFixture()}
        previewUrl={MUSTER_PDF}
        summary="Miete Musterstraße 12, August 2026"
      />
    </BelegSeite>
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
export const DatumFehlt: Story = {
  render: function Datum() {
    const [datum, setDatum] = useState<string | null>(null);
    const doc = belegFixture({ documentDate: datum, completedAt: null, completedVia: null });
    return (
      <BelegSeite document={doc} actions={menu}>
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary="Miete Musterstraße 12, August 2026"
          missing={
            datum
              ? []
              : [
                  {
                    field: "Belegdatum",
                    hint: "Ohne Belegdatum fällt der Beleg aus jedem Jahresfilter — er wäre in der Belegliste nicht zu finden.",
                    action: (
                      <InlineEdit
                        label="Belegdatum"
                        value=""
                        onSave={async (v) => setDatum(v || null)}
                      />
                    ),
                  },
                ]
          }
        />
      </BelegSeite>
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
export const WartetAufPruefung: Story = {
  render: () => {
    const doc = belegFixture({ completedAt: null, completedVia: null });
    return (
      <BelegSeite
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
      </BelegSeite>
    );
  },
};

/**
 * **R4 — die Extraktion läuft.** Der Fortschritt steht im Signal-Slot mit
 * „läuft seit"; die Fakten sind leer und sagen das auch, statt Leerzeilen zu
 * zeigen. Außer dem Menü gibt es keine Aktion — es gibt nichts zu entscheiden.
 */
export const ExtraktionLaeuft: Story = {
  render: () => {
    const doc = belegFixture({
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
      <BelegSeite
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
      </BelegSeite>
    );
  },
};

/**
 * **R4b — die Extraktion hängt.** Derselbe Zustand, nur seit vier Minuten. Die
 * Warnung steht **im selben Banner**, nicht in einem zweiten daneben: der
 * Slot trägt genau eines, und „läuft" und „läuft zu lange" sind eine Aussage.
 */
export const ExtraktionHaengt: Story = {
  render: () => {
    const doc = belegFixture({
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
      <BelegSeite
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
      </BelegSeite>
    );
  },
};

/**
 * **R5 — fehlgeschlagen.** Das Banner nennt die **Ursache und den nächsten
 * Schritt**; die Fakten stehen, soweit Ludwig etwas lesen konnte. Ein Fehler,
 * der nur „fehlgeschlagen" sagt, lässt die Sachbearbeiterin ratlos zurück.
 */
export const Fehlgeschlagen: Story = {
  render: () => {
    const doc = belegFixture({
      processingStatus: "failed",
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
    });
    return (
      <BelegSeite
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
      </BelegSeite>
    );
  },
};

/**
 * **R6 — an die Kanzlei übergeben.** Der Grund steht im Banner, der Weg zurück
 * ist ein Knopf. Die Eskalation ist damit sichtbar, statt nur im Verlauf zu
 * stehen.
 */
export const AnKanzlei: Story = {
  render: () => {
    const doc = belegFixture({ completedAt: null, completedVia: null });
    return (
      <BelegSeite
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
      </BelegSeite>
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
export const KorrekturWerte: Story = {
  render: function Korrektur() {
    const [netto, setNetto] = useState("1.512,61");
    const [nummer, setNummer] = useState("R-2026-0042");
    const berührt = netto !== "1.512,61" || nummer !== "R-2026-0042";
    return (
      <BelegSeite document={belegFixture()} tab="details" actions={menu}>
        <Card>
          <CardHead
            title="Kopfwerte"
            sub={berührt ? "Von Hand korrigiert am 09.09.2026" : "Von Ludwig gelesen, Konfidenz 94 %"}
          />
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                ["Gegenpart", "Musterbau GmbH"],
                [
                  "Rechnungsnummer",
                  <InlineEdit key="n" label="Rechnungsnummer" value={nummer} onSave={async (v) => setNummer(v)} />,
                ],
                ["Belegdatum", "14.08.2026"],
                [
                  "Netto",
                  <InlineEdit key="net" label="Netto" value={netto} onSave={async (v) => setNetto(v)} />,
                ],
                ["USt (19 %)", "287,39 €"],
                ["Brutto", "1.800,00 €"],
              ]}
            />
          </div>
        </Card>
      </BelegSeite>
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
export const MitBefunden: Story = {
  render: () => {
    const doc = belegFixture({ completedAt: null, completedVia: null });
    return (
      <BelegSeite document={doc} actions={menu}>
        <Card>
          <CardHead title="Zu klären" sub="3 Befunde an diesem Beleg" />
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                [
                  "Dublettenverdacht",
                  <span key="d">
                    Sieht aus wie R-2026-0041 vom selben Lieferanten.{" "}
                    <TextButton onClick={() => {}}>Original öffnen</TextButton>
                    {" · "}
                    <TextButton onClick={() => {}}>kein Duplikat</TextButton>
                  </span>,
                ],
                [
                  "Gegenpart mehrdeutig",
                  <span key="p">
                    Zwei Stammsätze heißen „Musterbau GmbH".{" "}
                    <TextButton onClick={() => {}}>Musterstadt wählen</TextButton>
                    {" · "}
                    <TextButton onClick={() => {}}>Beispielhausen wählen</TextButton>
                  </span>,
                ],
                [
                  "Empfänger passt nicht",
                  <span key="e">
                    Die Rechnung ist an eine andere Firma adressiert.{" "}
                    <TextButton onClick={() => {}}>gehört nicht zum Mandanten</TextButton>
                  </span>,
                ],
              ]}
            />
          </div>
        </Card>
        <SourceDocumentCard document={doc} previewUrl={MUSTER_PDF} summary="Miete Musterstraße 12, August 2026" />
      </BelegSeite>
    );
  },
};

/**
 * **R9 — erledigt ohne Buchung.** Der Kopf trägt **einen** Zustand, der Grund
 * steht im Tooltip daran — nicht als zweite Zeile darunter. Die Fakten sind
 * lesend, die einzige Aktion ist „Wieder öffnen".
 */
export const Erledigt: Story = {
  render: () => {
    const doc = belegFixture({
      completedVia: "no_booking_required",
      completedReason: "Privatentnahme, gehört nicht in die Buchführung.",
    });
    return (
      <BelegSeite
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
        <SourceDocumentCard document={doc} previewUrl={MUSTER_PDF} summary="Miete Musterstraße 12, August 2026" />
      </BelegSeite>
    );
  },
};
