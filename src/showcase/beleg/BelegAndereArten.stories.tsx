import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  PaymentAccountField,
  type PaymentAccountOption,
} from "@/ui/v3/entities/account/PaymentAccountField";
import { SourceDocumentCard } from "@/ui/v3/entities/source-document/SourceDocumentCard";
import { Button } from "@/ui/v3/primitives/Button";
import { Card, CardHead } from "@/ui/v3/primitives/Table";
import { FieldList } from "@/ui/v3/primitives/FieldList";
import { InlineEdit } from "@/ui/v3/primitives/InlineEdit";
import { MenuItem, OverflowMenu } from "@/ui/v3/primitives/OverflowMenu";
import { TextButton } from "@/ui/v3/primitives/TextButton";

import { SourceDocumentDefects } from "@/ui/v3/entities/source-document/SourceDocumentAside";

import { BelegSeite } from "./BelegSeite";
import { belegFixture, belegMaengel, MUSTER_PDF } from "./fixtures";

/**
 * Die anderen Belegarten — dieselbe Seite, andere Fakten (0144, A1–A7).
 *
 * Die Frage, die diese sieben beantworten: **hält der Rahmen auch, wo es keine
 * Rechnung gibt?** Ein Container ohne eigene Felder, ein Sammel-PDF mit
 * Kindern, ein Kontoauszug, dessen Zahlungskonto niemand kennt.
 */
const meta: Meta<typeof BelegSeite> = {
  title: "Seiten/Beleg/Andere Belegarten",
  component: BelegSeite,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof BelegSeite>;

const menu = (
  <OverflowMenu label="Weitere Aktionen">
    <MenuItem onClick={() => {}}>Neu verarbeiten</MenuItem>
    <MenuItem onClick={() => {}}>Klassifikation korrigieren</MenuItem>
  </OverflowMenu>
);

/** Die Zahlungskonten eines Mandanten — eines geführt, der Rest Kulisse. */
const KONTEN: PaymentAccountOption[] = [
  {
    id: "b-1",
    label: "Testbank eG 100200300 · DE00 0000 0000 0000 0000 00",
    iban: "DE00 0000 0000 0000 0000 00",
    inUse: true,
  },
  { id: "b-2", label: "Geldtransit", iban: null, inUse: false },
  { id: "b-3", label: "Kasse", iban: null, inUse: false },
  { id: "b-4", label: "Bank (Zweitkonto 3)", iban: null, inUse: false },
];

/**
 * **A1 — Vertrag.** Dieselbe Seite mit anderen Fakten, und der erste Reiter
 * heißt **gleich**: „Übersicht", nicht „Vertrag". Ein Reiter, der je nach
 * Belegart anders heißt, zwingt die Sachbearbeiterin, jedes Mal neu zu lesen,
 * wo sie ist.
 *
 * Zone 2 nennt den Mangel „Felder nicht bestätigt" mit dem Weg in den Reiter
 * Details — dort wird bestätigt oder korrigiert, weil es mehr als ein Feld
 * betrifft (D9).
 */
export const Vertrag: Story = {
  render: () => {
    const doc = belegFixture({
      sourceDocType: "contract",
      fileName: "Mietvertrag-Musterstrasse-12.pdf",
      counterparty: "Musterfirma Immobilien GmbH",
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
    });
    return (
      <BelegSeite document={doc} actions={menu}>
        <Card>
          <CardHead title="Zu klären" sub="1 Befund an diesem Beleg" />
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                [
                  "Felder nicht bestätigt",
                  <span key="f">
                    Ludwig hat Laufzeit und Betrag gelesen, niemand hat sie geprüft.{" "}
                    <TextButton onClick={() => {}}>Im Reiter Details bestätigen</TextButton>
                  </span>,
                ],
              ]}
            />
          </div>
        </Card>
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary="Mietvertrag Musterstraße 12, unbefristet ab 01.01.2026"
        />
      </BelegSeite>
    );
  },
};

/**
 * **A2 — Sammel-PDF.** Ein Container ohne eigene Rechnungsfelder: 23 Seiten,
 * drei Kinder. Das Original steht ganz, die Teilbelege sind der **Hauptinhalt**
 * — kein leerer Rechnungsblock darunter.
 */
export const SammelPdf: Story = {
  render: () => {
    const doc = belegFixture({
      // **Kein eigener `sourceDocType`.** Ein Sammelbeleg ist `other` mit
      // gesetztem `collectionKind` — die Union beschreibt, was *geschrieben*
      // wird, und „Sammelbeleg" ist keine Belegart, sondern eine Eigenschaft.
      sourceDocType: "other",
      classDocumentForm: "document_collection",
      collectionKind: "mixed",
      fileName: "Sammel-August-2026.pdf",
      counterparty: null,
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
      documentDate: null,
    });
    const kinder = [
      belegFixture({ id: "k-1", fileName: "Teil-1.pdf", counterparty: "Musterbau GmbH", splitPageRange: "1–3" }),
      belegFixture({ id: "k-2", fileName: "Teil-2.pdf", counterparty: "Beispiel-Energie AG", splitPageRange: "4–5" }),
      belegFixture({ id: "k-3", fileName: "Teil-3.pdf", counterparty: "Testbank eG", splitPageRange: "6–23" }),
    ];
    return (
      <BelegSeite document={doc} actions={menu}>
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary="Sammel-PDF aus dem Postfach, 23 Seiten"
          group={{ childCount: 3, completedChildCount: 1 }}
          parts={kinder}
          partHref={(d) => `?beleg=${d.id}`}
        />
      </BelegSeite>
    );
  },
};

/**
 * **A3 — Teilbeleg.** Kind von A2, Seiten 4–5.
 *
 * Die Herkunft ist eine **Faktenzeile** mit Weg, kein Banner: sie gilt zwar für
 * den ganzen Beleg, fordert aber nichts. Der Signal-Slot gehört dem, was
 * jemanden etwas angeht.
 */
export const Teilbeleg: Story = {
  render: () => {
    const doc = belegFixture({
      id: "k-2",
      fileName: "Teil-2.pdf",
      counterparty: "Beispiel-Energie AG",
      splitPageRange: "4–5",
      parentSourceDocId: "d-0100",
    });
    return (
      <BelegSeite document={doc} actions={menu}>
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary="Stromabrechnung August 2026"
          excerpt={{ from: 4, to: 5, parentTitle: "Sammel-August-2026.pdf", parentHref: "?beleg=d-0100" }}
        />
      </BelegSeite>
    );
  },
};

/**
 * **A4 — Kontoauszug, Konto exakt getroffen.** Der Container hat keine eigenen
 * Rechnungsfelder, und die Seite bleibt trotzdem nicht leer: Zahlungskonto,
 * Zeitraum, Zeilenzahl, und der Weg zum Import-Stapel.
 *
 * „Per IBAN erkannt" steht als Zeichen an der Zeile — die Zuordnung ist
 * eindeutig, und das darf man sehen.
 */
export const KontoauszugZugeordnet: Story = {
  render: () => {
    const doc = belegFixture({
      sourceDocType: "bank_statement_pdf",
      fileName: "Kontoauszug-2026-08.pdf",
      counterparty: "Testbank eG",
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
      // Seit dem Spiegellauf vom 2026-09-10 trägt der Beleg sein Zahlungskonto
      // selbst (L-266) — die Zeile entsteht in den Belegdaten, sobald es da ist.
      paymentAccount: {
        id: "pa-1",
        label: "Testbank eG · Geschäftskonto",
        iban: "DE00 0000 0000 0000 0000 00",
      },
    });
    return (
      <BelegSeite
        document={doc}
        actions={
          <>
            <Button variant="secondary" size="sm" href="?stapel=b-1">
              Zum Kontoauszug →
            </Button>
            {menu}
          </>
        }
      >
        <Card>
          <CardHead title="Kontoauszug" sub="Was der Auszug enthält" />
          <div style={{ padding: 16 }}>
            {/* Das **Zahlungskonto** steht seit 0150 in den Belegdaten — es
                hängt am Beleg (`paymentAccount`), nicht an einer Karte, die
                jede Seite selbst zusammensetzt. Hier bleibt, was der Container
                zusätzlich mitbringt und wofür es im Modell noch kein Feld gibt
                (Befund L-278). */}
            <FieldList
              tone="bare"
              rows={[
                ["Zeitraum", "01.08.2026 – 31.08.2026"],
                ["Zeilen", "146"],
              ]}
            />
          </div>
        </Card>
        <SourceDocumentCard document={doc} previewUrl={MUSTER_PDF} summary={null} />
      </BelegSeite>
    );
  },
};

/**
 * **A5 — Kontoauszug, Konto nicht eindeutig.** Der Owner-Entscheid zu Frage 2:
 * die Wahl steht **auf der Belegseite**, als Mangel mit Weg — nicht nur am
 * Import-Stapel. Hier landet die Rolle, wenn ihr der Auszug in der Belegliste
 * auffällt.
 *
 * Die Kandidaten werden **vorgelegt, nicht geraten** (`bank.md` R4/R5), und
 * das Feld ist `PaymentAccountField` (0145) — es trennt die geführten Konten
 * von den 24 Karteileichen des Kontenrahmens.
 */
export const KontoauszugKontoWaehlen: Story = {
  render: function Waehlen() {
    const [konto, setKonto] = useState<string | null>(null);
    const doc = belegFixture({
      sourceDocType: "bank_statement_pdf",
      fileName: "Kontoauszug-2026-08.pdf",
      counterparty: null,
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
    });
    return (
      <BelegSeite document={doc} actions={menu}>
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary={null}
          // Der Mangel kommt aus `docDefects()`: `awaiting_input` heißt, der
          // Auszug wartet auf sein Konto (F170). Der **Weg** ist das Feld
          // selbst — ein Mangel ohne Weg wäre nur eine Meldung (L-268).
          defects={
            <SourceDocumentDefects
              defects={belegMaengel({ inboxStatus: "awaiting_input" })}
              actions={{
                payment_account: (
                  <div style={{ minWidth: 320 }}>
                    <PaymentAccountField
                      id="a5-konto"
                      value={konto}
                      onChange={setKonto}
                      accounts={KONTEN}
                    />
                    {konto ? (
                      <p className="v2muted" style={{ margin: "8px 0 0" }}>
                        Gewählt — die Zuordnung greift beim nächsten Import.
                      </p>
                    ) : null}
                  </div>
                ),
              }}
            />
          }
        />
      </BelegSeite>
    );
  },
};

/**
 * **A5, Variante `none`.** Es passt **kein** Konto — nicht „mehrdeutig",
 * sondern „gar keins".
 *
 * Das ist ein anderer Satz und ein anderer Weg: die Auswahl steht leer und
 * gesperrt, und daneben steht der Weg in die Stammdaten. **Kein Auto-Anlegen**
 * — ein Zahlungskonto, das aus einem Beleg entsteht, wäre ein Konto, das
 * niemand entschieden hat (`bank.md` R4/R5).
 */
export const KontoauszugKeinKonto: Story = {
  render: () => {
    const doc = belegFixture({
      sourceDocType: "bank_statement_pdf",
      fileName: "Kontoauszug-2026-08.pdf",
      counterparty: null,
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
    });
    return (
      <BelegSeite document={doc} actions={menu}>
        <Card>
          <CardHead title="Zu klären" sub="1 Befund an diesem Beleg" />
          <div style={{ padding: 16, display: "grid", gap: 12 }}>
            <p className="v2muted" style={{ margin: 0 }}>
              <strong>Kein Zahlungskonto passt.</strong> Weder die IBAN noch der Name im
              Auszug führen zu einem Konto dieses Mandanten.
            </p>
            <div style={{ maxWidth: 420 }}>
              <PaymentAccountField id="a5b-none" value={null} onChange={() => {}} accounts={[]} />
            </div>
            <div>
              <Button variant="secondary" size="sm" href="?stammdaten=zahlungskonten">
                Zahlungskonto anlegen
              </Button>
            </div>
          </div>
        </Card>
        <SourceDocumentCard document={doc} previewUrl={MUSTER_PDF} summary={null} />
      </BelegSeite>
    );
  },
};

/**
 * **A5b — Kontoauszug, falsch zugeordnet.** Die Rolle erkennt, dass der Auszug
 * am falschen Konto hängt. Die Korrektur läuft über die Faktenzeile, mit einem
 * Hinweis, was sie am Bestand tut: **die Buchungen bleiben, akzeptierte
 * brechen ab** — Korrektur ohne Vorbeigreifen am Bestand.
 */
export const KontoauszugFalschZugeordnet: Story = {
  render: function Umordnen() {
    const [konto, setKonto] = useState<string | null>("b-3");
    const doc = belegFixture({
      sourceDocType: "bank_statement_pdf",
      fileName: "Kontoauszug-2026-08.pdf",
      counterparty: "Testbank eG",
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
    });
    return (
      <BelegSeite document={doc} actions={menu}>
        <Card>
          <CardHead title="Kontoauszug" sub="Der Auszug gehört zu einem Zahlungskonto" />
          <div style={{ padding: 16, display: "grid", gap: 12 }}>
            <div style={{ maxWidth: 420 }}>
              <PaymentAccountField
                id="a5b-konto"
                value={konto}
                onChange={setKonto}
                accounts={KONTEN}
              />
            </div>
            <p className="v2muted" style={{ margin: 0 }}>
              Beim Umordnen bleiben die vorhandenen Buchungen stehen; bereits akzeptierte
              Zuordnungen brechen ab und werden neu vorgeschlagen.
            </p>
          </div>
        </Card>
        <SourceDocumentCard document={doc} previewUrl={MUSTER_PDF} summary={null} />
      </BelegSeite>
    );
  },
};

/**
 * **A6 — Kreditkarte und Reisekosten.** Dieselbe Regel wie beim Kontoauszug,
 * kein Sonderpfad: ein Zahlungskonto (hier über die Kartenkennung erkannt) und
 * Kinder darunter.
 */
export const KreditkarteReisekosten: Story = {
  render: () => {
    const reise = belegFixture({
      sourceDocType: "travel_expense_report",
      fileName: "Reisekosten-2026-08.pdf",
      counterparty: null,
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
    });
    const doc = belegFixture({
      sourceDocType: "credit_card_statement",
      fileName: "Kreditkarte-2026-08.pdf",
      counterparty: "Testbank eG",
      completedAt: null,
      completedVia: null,
      detail: null,
      hasInvoiceRow: false,
    });
    const kinder = [
      belegFixture({ id: "kk-1", fileName: "Beleg-Hotel.pdf", counterparty: "Musterhotel GmbH" }),
      belegFixture({ id: "kk-2", fileName: "Beleg-Bahn.pdf", counterparty: "Musterbahn AG" }),
    ];
    return (
      <div style={{ display: "grid", gap: 40 }}>
      <BelegSeite document={doc} actions={menu}>
        <Card>
          <CardHead title="Kreditkartenabrechnung" sub="Karte …4711" />
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                ["Zahlungskonto", "Testbank eG · Kreditkarte …4711 — über die Kartenkennung erkannt"],
                ["Zeitraum", "01.08.2026 – 31.08.2026"],
              ]}
            />
          </div>
        </Card>
        <SourceDocumentCard
          document={doc}
          previewUrl={MUSTER_PDF}
          summary={null}
          group={{ childCount: 2, completedChildCount: 0 }}
          parts={kinder}
          partHref={(d) => `?beleg=${d.id}`}
        />
      </BelegSeite>

      <BelegSeite document={reise} actions={menu}>
        <Card>
          <CardHead title="Reisekostenabrechnung" sub="dieselbe Registry-Regel, kein Sonderpfad" />
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                ["Zahlungskonto", "Testbank eG · Kreditkarte …4711 — über die Kartenkennung erkannt"],
                ["Zeitraum", "01.08.2026 – 31.08.2026"],
              ]}
            />
          </div>
        </Card>
        <SourceDocumentCard
          document={reise}
          previewUrl={MUSTER_PDF}
          summary={null}
          group={{ childCount: 2, completedChildCount: 0 }}
          parts={kinder}
          partHref={(d) => `?beleg=${d.id}`}
        />
      </BelegSeite>
      </div>
    );
  },
};

/**
 * **A7 — ohne Untertyp.** Eine Mahnung: nur die generischen Zeilen, **kein
 * leerer Rechnungsblock**.
 *
 * Dazu der Widerspruch als Mangel: der Diskriminator sagt „Rechnung", eine
 * Rechnungszeile gibt es nicht. Das ist ein Mangel mit Weg — die Belegart lässt
 * sich hier korrigieren —, kein stiller Zustand.
 */
export const OhneSubtyp: Story = {
  render: function Ohne() {
    const [art, setArt] = useState("Mahnung");
    return (
      <BelegSeite
        document={belegFixture({
          // Eine Mahnung ist `other` plus Belegform — genau der Rückfall, für
          // den `classDocumentForm` da ist.
          sourceDocType: "other",
          classDocumentForm: "payment_reminder",
          fileName: "Mahnung-Musterbau.pdf",
          counterparty: "Musterbau GmbH",
          completedAt: null,
          completedVia: null,
          detail: null,
          hasInvoiceRow: false,
        })}
        actions={menu}
      >
        <Card>
          <CardHead title="Zu klären" sub="1 Befund an diesem Beleg" />
          <div style={{ padding: 16 }}>
            <FieldList
              tone="bare"
              rows={[
                [
                  "Klassifikation prüfen",
                  <span key="k">
                    Eingeordnet als „Rechnung", aber es gibt keine Rechnungszeile.{" "}
                    <InlineEdit label="Belegart" value={art} onSave={async (v) => setArt(v)} />
                  </span>,
                ],
              ]}
            />
          </div>
        </Card>
        <SourceDocumentCard
          document={belegFixture({
            // Eine Mahnung ist `other` plus Belegform — genau der Rückfall, für
          // den `classDocumentForm` da ist.
          sourceDocType: "other",
          classDocumentForm: "payment_reminder",
            fileName: "Mahnung-Musterbau.pdf",
            counterparty: "Musterbau GmbH",
            completedAt: null,
            completedVia: null,
            detail: null,
            hasInvoiceRow: false,
          })}
          previewUrl={MUSTER_PDF}
          summary="Zahlungserinnerung zu R-2026-0042"
        />
      </BelegSeite>
    );
  },
};
