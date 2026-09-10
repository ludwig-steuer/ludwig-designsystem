import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SourceDocumentCard } from "./SourceDocumentCard";
import type { SourceDocumentVM } from "./SourceDocument";
import { Card, CardHead } from "../../primitives/Table";
import { TextButton } from "../../primitives/TextButton";

const meta: Meta<typeof SourceDocumentCard> = {
  title: "v3/Entitäten/Beleg/SourceDocumentCard",
  component: SourceDocumentCard,
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SourceDocumentCard>;

const INVOICE: SourceDocumentVM = {
  id: "3f2b9c14-0a77-4d2e-9f01-6b8c5e2a1d40",
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
    paymentTerm: "30 Tage netto, 2 % Skonto binnen 10 Tagen",
    servicePeriod: "August 2026",
    issuerVatId: "DE123456789",
  },
  documentDate: "2026-08-26",
  receivedDate: "2026-08-27",
  completedAt: "2026-08-30T09:12:00Z",
  completedVia: "booking",
  docCategory: "performance",
  docDirection: "inbound",
  classDocumentKind: "original",
  caseNumber: "2026-0412",
  // Origin and filing (0120) — only `WithProvenance` shows them.
  classConfidence: 0.94,
  classOverriddenAt: "2026-08-30T11:04:00Z",
  datevRefSystem: "DUO",
  datevRefFolder: "2026/08",
  datevRefId: "DOC-4471-0088",
};

const SUMMARY =
  "Wartung der Klimaanlage im Bürogebäude, abgerechnet nach Stunden. Der Betrag " +
  "gehört in voller Höhe ins laufende Jahr.";

const PREVIEW = "data:application/pdf;base64,";

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

const PART = (n: number): SourceDocumentVM => ({
  id: `p${n}`,
  fileName: `Sammelrechnung-Teil-${n}.pdf`,
  sourceDocType: "invoice",
  classDocumentForm: "commercial_invoice",
  counterparty: n === 1 ? "Bürobedarf Meier GmbH" : "Kaffeeröster Nord GmbH",
  detail: { kind: "invoice", number: `RE-44${70 + n}`, gross: 120 * n, currency: "EUR" },
  documentDate: "2026-08-26",
  receivedDate: "2026-08-27",
  completedAt: null,
});

/**
 * Der volle Fall: das Original links, die gelesenen Werte rechts. **Keine
 * eigene Kopfzeile** — im View sagt der `EntityHeader` darüber schon, welcher
 * Beleg das ist, im Drawer der Drawer-Titel. Zwei Titel wären der erste
 * Zweifel des Seitenprofils am heutigen Screen.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentCard
        document={INVOICE}
        summary={SUMMARY}
        previewUrl={PREVIEW}
      />
    </div>
  ),
};

/**
 * `provenance` (0120): Herkunft und Ablage als vierter Block der Fakten — das
 * ist die Fassung der **Belegseite**.
 *
 * Die Prop steht hier und nicht nur an `SourceDocumentFacts`, weil jeder Weg
 * zu den Fakten über diese Karte läuft: die Detailseite zeigt sie im ersten
 * Reiter, der Drawer rendert dieselbe Karte. Ohne das Durchreichen wäre der
 * Block von außen unerreichbar gewesen (Befund der App, 2026-09-08).
 *
 * Die Vorgabe ist `false`, weil die Karte nicht weiß, wo sie steht.
 */
export const WithProvenance: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentCard
        document={INVOICE}
        summary={SUMMARY}
        previewUrl={PREVIEW}
        provenance
      />
    </div>
  ),
};

/**
 * Der Mangel steht **an der Stelle des Wertes**, nicht als Liste daneben: ein
 * fehlendes Belegdatum ist der häufigste Mangel des Bestands und die
 * Hauptaufgabe dieser Seite. Ein leeres Feld sähe aus wie „hier ist nichts",
 * der Mangel sagt „hier fehlt etwas — und so kommt es hin".
 */
export const Missing: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentCard
        document={SCAN}
        previewUrl={PREVIEW}
        missing={[
          {
            field: "Belegdatum",
            hint: "Die Extraktion hat keins gefunden.",
            action: <TextButton onClick={() => {}}>Datum setzen</TextButton>,
          },
          {
            // No generic row carries this name, so the gap takes the append
            // path at the end of the list — the case the row-matching path
            // never reaches (0071 acceptance, M2).
            field: "Fälligkeit",
            hint: "Steht auf dem Beleg, ist aber nicht gelesen worden.",
          },
        ]}
      />
    </div>
  ),
};

/** Kein Original: der Grund steht da, nicht ein leerer Kasten. */
export const WithoutPreview: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentCard
        document={INVOICE}
        summary={SUMMARY}
        previewUrl={null}
        previewUnavailableReason="Die Datei liegt im Archiv und wird beim Öffnen geholt."
      />
    </div>
  ),
};

/**
 * Ein Sammel-PDF mit seinen Teilbelegen: die Liste steht **unter** den zwei
 * Spalten, nicht in der Faktenspalte — sie ist eine eigene Entität in ihrer
 * eigenen Form.
 */
export const WithParts: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1500 }}>
      <SourceDocumentCard
        document={{ ...INVOICE, classDocumentKind: "collection", collectionKind: "invoice_batch" }}
        summary="Drei Rechnungen in einem Scan — Ludwig hat sie getrennt."
        previewUrl={PREVIEW}
        group={{ childCount: 3, completedChildCount: 1 }}
        parts={[PART(1), PART(2), PART(3)]}
        partHref={(d) => `#beleg-${d.id}`}
      />
    </div>
  ),
};

/**
 * `tone="bare"` — so rendert der Drawer sie: dieselbe Karte, ohne eigene
 * Fläche, weil der Drawer sie schon stellt. Das ist die Regel aus 0052
 * („Zone 3 ist dieselbe Komponente wie der View"), und der sicherste Weg,
 * sie zu halten, ist, den Drawer den ersten Reiter rendern zu lassen.
 *
 * Der Rahmen ist **1.060 px breit — die Breite des `lg`-Drawers**; der Karte
 * bleiben darin 986 px (Polster), im Drawer selbst sind es 1.060. Beide
 * stehen damit zweispaltig, und genau darum geht es. Vorher
 * standen hier 720, und damit zeigte die Story eine einspaltige Karte,
 * während der Drawer sie seit dem neuen Spalten-Tor zweispaltig rendert
 * (0071, Nachtrag N3): der Satz „so rendert der Drawer sie" stimmte für den
 * Ton, aber nicht mehr für das Bild.
 */
export const Bare: Story = {
  render: () => (
    <div style={{ padding: "var(--space-5)", maxWidth: 1060 }}>
      <Card>
        <CardHead title="Rechnung · Bürobedarf Meier GmbH" sub="RE-4471" />
        <div style={{ padding: "var(--space-4)" }}>
          <SourceDocumentCard document={INVOICE} summary={SUMMARY} previewUrl={PREVIEW} tone="bare">
            <p className="v2doc__limit">
              Schnellvorschau. Positionen, USt-Sätze und Konto-Splitting werden in der
              vollständigen Belegansicht geprüft.
            </p>
          </SourceDocumentCard>
        </div>
      </Card>
    </div>
  ),
};
