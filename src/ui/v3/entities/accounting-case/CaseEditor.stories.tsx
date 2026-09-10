import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  CASE_DOCUMENT_NUMBER_MODES,
  type CaseDisposition,
  type CaseDocumentNumberMode,
  type CaseKind,
} from "@/ludwig/modules/accounting-cases/domain/case";
import type { KnownDocumentNumber } from "@/ludwig/modules/accounting-cases/domain/document-number";

import { Card, CardHead } from "../../primitives/Table";
import { CaseDetailView } from "./CaseDetailView";
import { CaseDispositionEdit, CaseDocumentNumberModeEdit, CaseKindEdit } from "./CaseEditor";

const meta: Meta<typeof CaseKindEdit> = {
  title: "v3/Entitäten/Sachverhalt/CaseEditor",
  component: CaseKindEdit,
};
export default meta;
type Story = StoryObj<typeof CaseKindEdit>;

const NUMBERS: KnownDocumentNumber[] = [
  {
    documentNumber: "RE-4471",
    source: "case_decision",
    accountNumber: "70012",
    caseId: "c-4412",
    caseNumber: "2026-0412",
    caseLifecycle: "open",
    state: "computed",
    immutable: false,
    periodKey: "2026-07",
    rationale: "Schreibweise der Rechnung, so exportiert.",
  },
  {
    documentNumber: "RE-4488",
    // Two candidates from **two** sources: a list where every number has the same
    // origin does not show what the register is for (M10).
    source: "mirror_ref",
    accountNumber: "70012",
    caseId: "c-4412",
    caseNumber: "2026-0412",
    caseLifecycle: "open",
    state: "computed",
    immutable: false,
  },
];

/** Register rule 1: a number from DATEV is set. */
const NUMBERS_WITH_DATEV: KnownDocumentNumber[] = NUMBERS.map((n, i) =>
  i === 0 ? { ...n, source: "datev_correction", immutable: true } : n,
);

const Frame = ({ children }: { children: React.ReactNode }) => (
  <div style={{ maxWidth: 620, padding: "var(--space-6)", display: "grid", gap: "var(--space-5)" }}>
    {children}
  </div>
);

/**
 * Die drei Editoren nebeneinander, wie sie im Detail stehen. Der letzte ist
 * gesperrt — ein geschlossener Sachverhalt wird nicht mehr umgestuft.
 */
export const Filled: Story = {
  render: function Render() {
    const [kind, setKind] = useState<CaseKind>("incoming_invoice");
    const [disp, setDisp] = useState<CaseDisposition | null>("accounting");
    return (
      <Frame>
        <CaseKindEdit value={kind} onSave={setKind} />
        <CaseDispositionEdit value={disp} onSave={setDisp} />
        <CaseDocumentNumberModeEdit value="single" onSave={() => {}} disabled />
      </Frame>
    );
  },
};

/** Alle sieben Arten aus `CASE_KIND_LABEL` — deutsche Wörter, keine lokale Map. */
export const Kinds: Story = {
  render: function Render() {
    const [kind, setKind] = useState<CaseKind>("incoming_invoice");
    return (
      <Frame>
        <CaseKindEdit value={kind} onSave={setKind} />
      </Frame>
    );
  },
};

/**
 * Alle vier Ausgangswerte mit ihren erlaubten Zielen aus
 * `CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS`. Die obere Reihe bietet `none` nicht
 * an, die untere schon (`allowNone`) — der Kern erlaubt es nur bei Umbuchung
 * und Korrektur ohne verknüpften Beleg, und diese Prüfung steht nicht in der
 * Übergangstabelle.
 */
export const Modes: Story = {
  render: () => (
    <Frame>
      {CASE_DOCUMENT_NUMBER_MODES.map((m) => (
        <CaseDocumentNumberModeEdit key={m} value={m} onSave={() => {}} />
      ))}
      <hr className="v2mk__hr" />
      {CASE_DOCUMENT_NUMBER_MODES.map((m) => (
        <CaseDocumentNumberModeEdit key={`n-${m}`} value={m} onSave={() => {}} allowNone />
      ))}
    </Frame>
  ),
};

/**
 * `agent` und `accounting` sind wählbar, `client` nicht: den Mandanten ins
 * Spiel zu bringen ist eine Handlung mit Außenwirkung, keine Wertänderung.
 * Der zweite Fall steht auf `null` — „in Pipeline-Bearbeitung oder
 * abgeschlossen", lesbar, aber nicht zu wählen.
 */
export const Dispositions: Story = {
  render: function Render() {
    const [a, setA] = useState<CaseDisposition | null>("agent");
    const [b, setB] = useState<CaseDisposition | null>(null);
    return (
      <Frame>
        <CaseDispositionEdit value={a} onSave={setA} />
        <CaseDispositionEdit value={b} onSave={setB} />
      </Frame>
    );
  },
};

/**
 * **Der Rand:** `multiple → single` ist eine Herabstufung. Sie öffnet den
 * Dialog mit Grund **und** Nummernwahl, und „Umstufen" bleibt gesperrt, bis
 * beides dasteht — Knopf und Enter gleichermaßen.
 */
export const Downgrade: Story = {
  render: function Render() {
    const [mode, setMode] = useState<CaseDocumentNumberMode>("multiple");
    const [last, setLast] = useState<string>("noch nichts");
    return (
      <Frame>
        <CaseDocumentNumberModeEdit
          value={mode}
          documentNumbers={NUMBERS}
          onSave={(next, reason, keep) => {
            setMode(next);
            setLast(`${next} · „${reason}" · Nummer ${keep ?? "—"}`);
          }}
        />
        <p className="lw-body-sm">
          Zuletzt gespeichert: <strong>{last}</strong>
        </p>
        {/* **DATEV wins** (register rule 1): if a candidate is `immutable`, "which
            number stays valid" is answered — the dialog says so and does not ask.
            Before 2026-09-08 it offered all numbers and **locked the canonical
            one**; with only DATEV numbers it had no way out (M7). */}
        <CaseDocumentNumberModeEdit
          value="multiple"
          documentNumbers={NUMBERS_WITH_DATEV}
          onSave={() => {}}
        />
      </Frame>
    );
  },
};

/** Speichern läuft: die Felder sind gesperrt, nichts springt. */
export const Pending: Story = {
  render: () => (
    <Frame>
      <CaseKindEdit value="incoming_invoice" onSave={() => {}} pending />
      <CaseDispositionEdit value="accounting" onSave={() => {}} pending />
      <CaseDocumentNumberModeEdit value="single" onSave={() => {}} pending />
    </Frame>
  ),
};

/** `onSave` lehnt ab: das Feld bleibt offen und zeigt den Satz. */
export const Failed: Story = {
  render: () => (
    <Frame>
      <CaseKindEdit
        value="incoming_invoice"
        onSave={() => {
          throw new Error("Der Sachverhalt ist gesperrt, solange der Lauf läuft.");
        }}
      />
      {/* The same entry, the other way: `error` comes from outside instead of a
          rejected `onSave` (M8). The mode editor does not read it — it saves
          through the dialog, which carries its own error. */}
      <CaseDispositionEdit
        value="agent"
        onSave={() => {}}
        error="Der Sachverhalt ist inzwischen geschlossen — die Zuständigkeit lässt sich nicht mehr ändern."
      />
    </Frame>
  ),
};

/**
 * Ungültige Umstufungen werden **gar nicht erst angeboten**: von `single` aus
 * führt kein Weg nach `single`, und `none` fehlt ohne `allowNone`. Ein Wert,
 * den man sieht und nicht wählen kann, ist eine Frage ohne Antwort.
 */
export const Invalid: Story = {
  render: () => (
    <Frame>
      <CaseDocumentNumberModeEdit value="single" onSave={() => {}} />
      <p className="lw-body-sm">
        Angeboten sind nur <code className="lw-mono">multiple</code> und{" "}
        <code className="lw-mono">per_period</code> — nicht{" "}
        <code className="lw-mono">single</code> (der eigene Wert) und nicht{" "}
        <code className="lw-mono">none</code>.
      </p>
    </Frame>
  ),
};

/**
 * Rundlauf über alle drei: ändern, mit Escape verwerfen, wieder ändern. Der
 * Kasten darunter zeigt, was `onSave` bekommen hat.
 */
export const Roundtrip: Story = {
  render: function Render() {
    const [kind, setKind] = useState<CaseKind>("incoming_invoice");
    const [disp, setDisp] = useState<CaseDisposition | null>("agent");
    const [mode, setMode] = useState<CaseDocumentNumberMode>("single");
    const [log, setLog] = useState<string[]>([]);
    const remember = (s: string) => setLog((alt) => [...alt.slice(-3), s]);
    return (
      <Frame>
        <CaseKindEdit
          value={kind}
          onSave={(n) => {
            setKind(n);
            remember(`Art → ${n}`);
          }}
        />
        <CaseDispositionEdit
          value={disp}
          onSave={(n) => {
            setDisp(n);
            remember(`Zuständigkeit → ${n}`);
          }}
        />
        <CaseDocumentNumberModeEdit
          value={mode}
          onSave={(n, reason) => {
            setMode(n);
            remember(`Modus → ${n} („${reason}")`);
          }}
        />
        <p className="lw-body-sm">
          Gespeichert: {log.length === 0 ? "nichts" : log.join(" · ")}
        </p>
      </Frame>
    );
  },
};

/**
 * Im Einsatz: im `children`-Slot des `CaseDetailView` — der Ort, für den die
 * drei gebaut sind, und die Breite, in der sie wirklich stehen.
 */
export const InUse: Story = {
  render: function Render() {
    const [kind, setKind] = useState<CaseKind>("incoming_invoice");
    const [disp, setDisp] = useState<CaseDisposition | null>("accounting");
    const [mode, setMode] = useState<CaseDocumentNumberMode>("multiple");
    return (
      <div style={{ padding: "var(--space-5)", maxWidth: 1600 }}>
        <CaseDetailView
          header={
            <div>
              <div className="lw-caption">Sachverhalt 2026-0412 · Musterbau GmbH</div>
              <h1 className="lw-h2" style={{ margin: 0 }}>
                Wartung der Klimaanlage
              </h1>
            </div>
          }
        >
          <Card>
            <CardHead title="Stammdaten" sub="Was ein Mensch hier ändert" />
            <div style={{ display: "grid", gap: "var(--space-5)", padding: "var(--space-5)" }}>
              <CaseKindEdit value={kind} onSave={setKind} />
              <CaseDispositionEdit value={disp} onSave={setDisp} />
              <CaseDocumentNumberModeEdit
                value={mode}
                documentNumbers={NUMBERS}
                onSave={(n) => setMode(n)}
              />
            </div>
          </Card>
        </CaseDetailView>
      </div>
    );
  },
};
