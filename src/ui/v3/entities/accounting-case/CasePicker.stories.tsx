import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";

import { Card, CardHead } from "../../primitives/Table";
import { CasePicker } from "./CasePicker";

const meta: Meta<typeof CasePicker> = {
  title: "v3/Entitäten/Sachverhalt/CasePicker",
  component: CasePicker,
};
export default meta;
type Story = StoryObj<typeof CasePicker>;

const CASE = (over: Partial<CaseListItem> = {}): CaseListItem => ({
  caseId: "c-4412",
  caseNumber: "2026-0412",
  clientId: "cl-1",
  fiscalYear: 2026,
  kind: "incoming_invoice",
  title: "Wartung der Klimaanlage",
  summary: "Halbjährliche Wartung der Anlage im Obergeschoss, Rechnung liegt vor.",
  counterpartyName: "Bürobedarf Meier GmbH",
  counterpartyPartnerId: "bp-8841",
  currency: "EUR",
  totalAmount: 1249.9,
  lifecycleStatus: "open",
  disposition: "accounting",
  documentEventsCount: 1,
  bankEventsCount: 1,
  openClarificationsCount: 0,
  hasOpenDocumentRequest: false,
  openedAt: "2026-08-26",
  closedAt: null,
  exportStatus: "offen",
  ...over,
});

const CASES: CaseListItem[] = [
  CASE(),
  CASE({
    caseId: "c-4413",
    caseNumber: "2026-0413",
    title: null,
    counterpartyName: "Telekom Deutschland GmbH",
    counterpartyPartnerId: "bp-8842",
    kind: "recurring_charge",
    totalAmount: -89.9,
    summary: "Monatliche Rechnung für den Anschluss der Zweigstelle.",
    lifecycleStatus: "needs_clarification",
  }),
  CASE({
    caseId: "c-4414",
    caseNumber: "2026-0414",
    title: "Umbuchung Verrechnungskonto",
    counterpartyName: null,
    counterpartyPartnerId: null,
    kind: "internal_transfer",
    totalAmount: null,
    summary: "Ausgleich zwischen Verrechnungs- und Personenkonto zum Quartalsende.",
    lifecycleStatus: "waiting_for_documents",
  }),
  CASE({
    caseId: "c-9002-abcdef01",
    caseNumber: null,
    title: "Vortrag ohne Jahr",
    counterpartyName: "Musterbau GmbH",
    counterpartyPartnerId: "bp-8845",
    fiscalYear: null,
    totalAmount: 18442.19,
    summary: "Altbestand aus der Übernahme, noch keinem Jahr zugeordnet.",
    lifecycleStatus: "open",
  }),
];

const Rahmen = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 620, padding: "var(--space-6)" }}>{children}</div>
);

/**
 * Vier Sachverhalte, wie sie eine Bankzeile vorfindet. Die Trefferzeile trägt
 * die Ränge 1–4: Anzeigename oben, darunter Kennung, Bearbeitungsstand als
 * Wort, Betrag — und den Gegenpart nur dort, wo er nicht schon im Namen
 * steckt.
 *
 * Der zweite Fall hat keinen eigenen Titel: sein Name entsteht aus der
 * Rückfallkette („Dauersachverhalt: Telekom Deutschland GmbH"), und deshalb
 * wiederholt die Zeile den Gegenpart nicht. Der vierte hat keine Nummer und
 * zeigt die ersten acht Zeichen seiner id — ein Sachverhalt ohne Nummer bleibt
 * benennbar.
 */
export const Filled: Story = {
  render: () => (
    <Rahmen>
      <CasePicker label="Sachverhalt" value={null} onChange={() => {}} cases={CASES} />
    </Rahmen>
  ),
};

/**
 * Kein Sachverhalt im Jahr. Das ist ein **Befund über den Bestand**, kein
 * Fehler und kein Filterproblem — und deshalb ein anderer Satz als in
 * `EmptyAfterFilter`.
 */
export const Empty: Story = {
  render: () => (
    <Rahmen>
      <CasePicker label="Sachverhalt" value={null} onChange={() => {}} cases={[]} />
    </Rahmen>
  ),
};

/**
 * Gesucht und nichts gefunden. Der Satz sagt, dass der **Suchbegriff** nicht
 * trifft — nicht, dass es nichts gäbe.
 */
export const EmptyAfterFilter: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Rahmen>
        <p className="lw-body-sm" style={{ marginTop: 0 }}>
          Tippen Sie „xyz" — vier Sachverhalte sind da, keiner passt.
        </p>
        <CasePicker label="Sachverhalt" value={value} onChange={setValue} cases={CASES} />
      </Rahmen>
    );
  },
};

/** Die Serversuche läuft. Das Feld bleibt bedienbar, die Liste verschwindet nicht. */
export const Loading: Story = {
  render: () => (
    <Rahmen>
      <CasePicker
        label="Sachverhalt"
        value={null}
        onChange={() => {}}
        cases={CASES}
        onSearch={() => {}}
        loading
      />
    </Rahmen>
  ),
};

/**
 * Die Suche ist gescheitert. Der Satz steht **am Feld** — die Liste behauptet
 * nicht, es gäbe nichts.
 */
export const Error: Story = {
  render: () => (
    <Rahmen>
      <CasePicker
        label="Sachverhalt"
        value={null}
        onChange={() => {}}
        cases={CASES}
        error="Die Suche ist gescheitert. Versuchen Sie es erneut."
      />
    </Rahmen>
  ),
};

/**
 * Rundlauf mit `useState`: wählen, abwählen, wieder wählen — dazu der
 * Tastaturweg (↓ ↓ Enter nimmt den zweiten Treffer, Escape schließt ohne
 * Änderung). `onSearch` läuft mit und zeigt, was der Aufrufer bekäme; gefiltert
 * wird trotzdem im Picker.
 */
export const Roundtrip: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    const [suche, setSuche] = useState<string[]>([]);
    const gewaehlt = CASES.find((c) => c.caseId === value);
    return (
      <Rahmen>
        <CasePicker
          label="Sachverhalt"
          value={value}
          onChange={setValue}
          cases={CASES}
          onSearch={(q) => setSuche((alt) => [...alt.slice(-4), q])}
        />
        <p className="lw-body-sm">
          Gewählt: <strong>{gewaehlt ? gewaehlt.caseId : "—"}</strong>
        </p>
        <p className="lw-body-sm">
          An <code className="lw-mono">onSearch</code> gegangen:{" "}
          {suche.length === 0 ? "nichts" : suche.map((q) => `„${q}"`).join(", ")}
        </p>
      </Rahmen>
    );
  },
};

/**
 * Im Einsatz: in der Zuordnungszeile einer Kontoauszugsposition, neben Betrag
 * und Verwendungszweck — die Breite, in der der Picker wirklich steht.
 */
export const InUse: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <div style={{ maxWidth: 900, padding: "var(--space-6)" }}>
        <Card>
          <CardHead title="Zuordnen" sub="Commerzbank · 1210 · 26.08.2026" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "160px 1fr 300px",
              gap: "var(--space-4)",
              alignItems: "end",
              padding: "var(--space-5)",
            }}
          >
            <span className="lw-numeric">-1.249,90 €</span>
            <span>Rechnung RE-4471 Wartung Klimaanlage</span>
            <CasePicker
              label="Sachverhalt"
              value={value}
              onChange={setValue}
              cases={CASES}
            />
          </div>
        </Card>
      </div>
    );
  },
};

/**
 * **Der Rand ist die Suche.** 190 Sachverhalte, und die Eingabe findet über
 * alle vier Felder — auch über zwei, die in keiner Trefferzeile stehen:
 *
 * - `Telekom` → über den **Gegenpart**
 * - `0042` → über die **Kennung**
 * - `Klimaanlage` → über den **Anzeigenamen**
 * - `Quartalsende` → über die **Zusammenfassung**, die nirgends sichtbar ist
 *
 * Genau daran hängt der Entscheid, dass der Picker selbst filtert: `Combobox`
 * grenzt nur über `label` und `value` ein und fände die letzten beiden nicht.
 */
export const Edges: Story = {
  render: function Render() {
    const [value, setValue] = useState<string | null>(null);
    const viele: CaseListItem[] = [
      ...CASES,
      CASE({
        caseId: "c-9042",
        caseNumber: "2026-0042",
        title: "Sanierung des Serverraums",
        counterpartyName: "Handwerk Schulz KG",
        totalAmount: 1284900.55,
        summary: "Bauabschnitt 2, Freigabe der Kanzlei steht aus.",
      }),
      ...Array.from({ length: 186 }, (_, i) =>
        CASE({
          caseId: `c-5${String(i).padStart(3, "0")}`,
          caseNumber: `2026-1${String(i).padStart(3, "0")}`,
          title: `Wiederkehrende Leistung ${i + 1}`,
          counterpartyName: "Stadtwerke Musterstadt",
          totalAmount: 118.4,
          summary: "Abschlag laut Vertrag.",
        }),
      ),
    ];
    return (
      <Rahmen>
        <p className="lw-body-sm" style={{ marginTop: 0 }}>
          190 Sachverhalte. Probieren Sie „Telekom", „0042", „Klimaanlage" oder
          „Quartalsende" — das letzte Wort steht in keiner Zeile.
        </p>
        <CasePicker label="Sachverhalt" value={value} onChange={setValue} cases={viele} />
      </Rahmen>
    );
  },
};
