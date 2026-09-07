import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { AmountCell } from "../../primitives/Cells";
import { Button } from "../../primitives/Button";
import { Card, CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { TextButton } from "../../primitives/TextButton";
import { CaseDrawer, type CaseQuickView } from "./CaseDrawer";

const meta: Meta<typeof CaseDrawer> = {
  title: "v3/Entitäten/Sachverhalt/CaseDrawer",
  component: CaseDrawer,
};
export default meta;
type Story = StoryObj<typeof CaseDrawer>;

const accountHref = (nr: string) => `#konto-${nr}`;

const RECORD: CaseQuickView = {
  title: "Wartung der Klimaanlage",
  counterpartyName: "Bürobedarf Meier GmbH",
  totalAmount: 1249.9,
  currency: "EUR",
  dispositionLabel: "Kanzlei",
  eventCount: 6,
  facts: {
    caseNumber: "2026-0412",
    kind: "incoming_invoice",
    lifecycleStatus: "open",
    openedAt: "2026-08-26",
    summary:
      "Rechnung über die Wartung der Klimaanlage, Leistung im August erbracht. " +
      "Der Betrag ist auf zwei Kostenstellen zu verteilen.",
    counterpartyPartnerId: "p-8812",
    counterpartyName: "Bürobedarf Meier GmbH",
    personalAccountNumber: "70021",
    documentNumberMode: "single",
    closedAt: null,
  },
};

/**
 * Die zweite Zeile hat ihren **eigenen** Sachverhalt. Beide teilten sich
 * vorher `RECORD`: die Liste zeigte „Stadtwerke Musterstadt · −412,00 €", der
 * Drawer daneben „Wartung der Klimaanlage · 1.249,90 € · Bürobedarf Meier
 * GmbH" — beides gleichzeitig im Bild (Abnahme 0098, M2).
 */
const RECORD_STROM: CaseQuickView = {
  title: "Abschlag Strom 08/2026",
  counterpartyName: "Stadtwerke Musterstadt",
  totalAmount: -412,
  currency: "EUR",
  dispositionLabel: "Mandant",
  eventCount: 2,
  facts: {
    caseNumber: "2026-0413",
    kind: "recurring_charge",
    lifecycleStatus: "waiting_for_documents",
    openedAt: "2026-08-27",
    summary: "Monatlicher Abschlag; die Jahresabrechnung steht noch aus.",
    counterpartyPartnerId: "p-4471",
    counterpartyName: "Stadtwerke Musterstadt",
    personalAccountNumber: "70044",
    documentNumberMode: "per_period",
    closedAt: null,
  },
};

/** Alle vier Zonen. Zone 2 fehlt — ein Sachverhalt hat kein Original. */
export const Filled: Story = {
  render: () => (
    <CaseDrawer
      open
      onClose={() => {}}
      reference="2026-0412"
      record={RECORD}
      onOpenFull={() => {}}
      accountHref={accountHref}
      partnerHref="#partner-8812"
    />
  ),
};

/** `loading`: fünf Zeilen in der Form der Fakten, keine 96-px-Karte. */
export const Loading: Story = {
  render: () => (
    <CaseDrawer open onClose={() => {}} reference="2026-0412" record={null} loading onOpenFull={() => {}} />
  ),
};

/**
 * Der Fehler steht statt Zone 3, **und der Ausgang bleibt** — bewusst anders
 * als beim Beleg-Drawer: wer den Fall nicht laden kann, will erst recht in
 * die vollständige Ansicht.
 */
export const Error: Story = {
  render: () => (
    <CaseDrawer
      open
      onClose={() => {}}
      reference="2026-0412"
      record={null}
      error="Zeitüberschreitung beim Laden"
      onOpenFull={() => {}}
    />
  ),
};

/** `record={null}` ohne `loading` heißt **nicht gefunden**, nicht „lädt noch". */
export const NotFound: Story = {
  render: () => (
    <CaseDrawer open onClose={() => {}} reference="2026-9999" record={null} onOpenFull={() => {}} />
  ),
};

/** Rundlauf: öffnen, Esc, der Fokus kehrt an den Auslöser zurück. */
export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <div style={{ padding: "var(--space-6)" }}>
        <Button onClick={() => setOpen(true)}>Sachverhalt 2026-0412 ansehen</Button>
        <CaseDrawer
          open={open}
          onClose={() => setOpen(false)}
          reference="2026-0412"
          record={RECORD}
          onOpenFull={() => {}}
          accountHref={accountHref}
        />
      </div>
    );
  },
};

/**
 * Rand: ein Fall ohne Betrag, ohne Gegenpart, ohne Personenkonto.
 *
 * Der Kopf fällt auf die Art zurück („Umbuchung") und sagt sie **nicht noch
 * einmal** in der Meta-Zeile. In den Fakten stehen die beiden bedeutenden
 * Nullwerte, die der Drawer tragen kann, als Wort: „hat bewusst keins" und
 * „Kein Beleg zu erwarten". Der dritte („bewusst keine" zur Gegenpartei-Seite)
 * gehört zu `all` und damit in den View — der Drawer zeigt Zone 3 ohne `all`.
 */
export const Sparse: Story = {
  render: () => (
    <CaseDrawer
      open
      onClose={() => {}}
      reference="2026-0501"
      record={{
        title: null,
        totalAmount: null,
        eventCount: 0,
        facts: {
          // Deliberately without a number: the head must then still show the
          // reference that was looked up, not a sliced id (defect M1).
          caseNumber: null,
          kind: "internal_transfer",
          lifecycleStatus: "open",
          openedAt: "2026-09-05",
          personalAccountNumber: null,
          documentNotRequiredReason:
            "Interne Umbuchung zwischen zwei Sachkonten — es gibt keinen Beleg dazu.",
        },
      }}
      onOpenFull={() => {}}
    />
  ),
};

/** Im Einsatz: aus einer Bank-Zeile heraus — die Liste bleibt hinter dem Scrim. */
export const InUse: Story = {
  render: function Render() {
    const [ref, setRef] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 900 }}>
        <Card>
          <CardHead title="Kontoauszug August 2026" sub="Commerzbank · 1210" />
          <Table cols="120px 1fr 200px 120px">
            <HeadRow>
              <span>Datum</span>
              <span>Gegenpartei</span>
              <span>Sachverhalt</span>
              <span className="v2num">Betrag</span>
            </HeadRow>
            <Row>
              <span>26.08.2026</span>
              <span>Bürobedarf Meier GmbH</span>
              <span>
                <TextButton onClick={() => setRef("2026-0412")}>2026-0412 ansehen</TextButton>
              </span>
              <AmountCell value={1249.9} />
            </Row>
            <Row>
              <span>27.08.2026</span>
              <span>Stadtwerke Musterstadt</span>
              <span>
                <TextButton onClick={() => setRef("2026-0413")}>2026-0413 ansehen</TextButton>
              </span>
              <AmountCell value={-412} />
            </Row>
          </Table>
        </Card>
        {ref ? (
          <CaseDrawer
            open
            onClose={() => setRef(null)}
            reference={ref}
            record={ref === "2026-0413" ? RECORD_STROM : RECORD}
            onOpenFull={() => {}}
            accountHref={accountHref}
          />
        ) : null}
      </div>
    );
  },
};
