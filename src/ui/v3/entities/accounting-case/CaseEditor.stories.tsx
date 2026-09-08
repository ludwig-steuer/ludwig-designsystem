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

const NUMMERN: KnownDocumentNumber[] = [
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
    // Zwei Kandidaten aus **zwei** Quellen: eine Kandidatenliste, in der jede
    // Nummer denselben Ursprung hat, zeigt nicht, wofür das Register da ist
    // (Abnahme 2026-09-08, M10).
    source: "mirror_ref",
    accountNumber: "70012",
    caseId: "c-4412",
    caseNumber: "2026-0412",
    caseLifecycle: "open",
    state: "computed",
    immutable: false,
  },
];

/** Regel 1 des Registers: kommt die Nummer aus DATEV, ist sie gesetzt. */
const NUMMERN_MIT_DATEV: KnownDocumentNumber[] = NUMMERN.map((n, i) =>
  i === 0 ? { ...n, source: "datev_correction", immutable: true } : n,
);

const Rahmen = ({ children }: { children: React.ReactNode }) => (
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
      <Rahmen>
        <CaseKindEdit value={kind} onSave={setKind} />
        <CaseDispositionEdit value={disp} onSave={setDisp} />
        <CaseDocumentNumberModeEdit value="single" onSave={() => {}} disabled />
      </Rahmen>
    );
  },
};

/** Alle sieben Arten aus `CASE_KIND_LABEL` — deutsche Wörter, keine lokale Map. */
export const Kinds: Story = {
  render: function Render() {
    const [kind, setKind] = useState<CaseKind>("incoming_invoice");
    return (
      <Rahmen>
        <CaseKindEdit value={kind} onSave={setKind} />
      </Rahmen>
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
    <Rahmen>
      {CASE_DOCUMENT_NUMBER_MODES.map((m) => (
        <CaseDocumentNumberModeEdit key={m} value={m} onSave={() => {}} />
      ))}
      <hr className="v2mk__hr" />
      {CASE_DOCUMENT_NUMBER_MODES.map((m) => (
        <CaseDocumentNumberModeEdit key={`n-${m}`} value={m} onSave={() => {}} allowNone />
      ))}
    </Rahmen>
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
      <Rahmen>
        <CaseDispositionEdit value={a} onSave={setA} />
        <CaseDispositionEdit value={b} onSave={setB} />
      </Rahmen>
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
    const [letzte, setLetzte] = useState<string>("noch nichts");
    return (
      <Rahmen>
        <CaseDocumentNumberModeEdit
          value={mode}
          documentNumbers={NUMMERN}
          onSave={(next, reason, keep) => {
            setMode(next);
            setLetzte(`${next} · „${reason}" · Nummer ${keep ?? "—"}`);
          }}
        />
        <p className="lw-body-sm">
          Zuletzt gespeichert: <strong>{letzte}</strong>
        </p>
        {/* **DATEV gewinnt** (Register-Regel 1): ist einer der Kandidaten
            `immutable`, ist die Frage „welche Nummer bleibt gültig" schon
            beantwortet — der Dialog sagt es und fragt nicht. Bis zum
            2026-09-08 bot er alle Nummern an und **sperrte die kanonische**;
            bestand die Liste nur aus DATEV-Nummern, hatte er keinen Ausgang
            (Abnahme M7). */}
        <CaseDocumentNumberModeEdit
          value="multiple"
          documentNumbers={NUMMERN_MIT_DATEV}
          onSave={() => {}}
        />
      </Rahmen>
    );
  },
};

/** Speichern läuft: die Felder sind gesperrt, nichts springt. */
export const Pending: Story = {
  render: () => (
    <Rahmen>
      <CaseKindEdit value="incoming_invoice" onSave={() => {}} pending />
      <CaseDispositionEdit value="accounting" onSave={() => {}} pending />
      <CaseDocumentNumberModeEdit value="single" onSave={() => {}} pending />
    </Rahmen>
  ),
};

/** `onSave` lehnt ab: das Feld bleibt offen und zeigt den Satz. */
export const Failed: Story = {
  render: () => (
    <Rahmen>
      <CaseKindEdit
        value="incoming_invoice"
        onSave={() => {
          throw new Error("Der Sachverhalt ist gesperrt, solange der Lauf läuft.");
        }}
      />
      {/* Derselbe Satz, der andere Weg: `error` kommt von außen, statt aus
          einem abgelehnten `onSave`. Die Prop hatte bis zum 2026-09-08 keinen
          Nachweis (Abnahme M8). Der Modus-Editor liest sie nicht — er
          speichert über den Dialog, und der trägt seinen eigenen Fehler. */}
      <CaseDispositionEdit
        value="agent"
        onSave={() => {}}
        error="Der Sachverhalt ist inzwischen geschlossen — die Zuständigkeit lässt sich nicht mehr ändern."
      />
    </Rahmen>
  ),
};

/**
 * Ungültige Umstufungen werden **gar nicht erst angeboten**: von `single` aus
 * führt kein Weg nach `single`, und `none` fehlt ohne `allowNone`. Ein Wert,
 * den man sieht und nicht wählen kann, ist eine Frage ohne Antwort.
 */
export const Invalid: Story = {
  render: () => (
    <Rahmen>
      <CaseDocumentNumberModeEdit value="single" onSave={() => {}} />
      <p className="lw-body-sm">
        Angeboten sind nur <code className="lw-mono">multiple</code> und{" "}
        <code className="lw-mono">per_period</code> — nicht{" "}
        <code className="lw-mono">single</code> (der eigene Wert) und nicht{" "}
        <code className="lw-mono">none</code>.
      </p>
    </Rahmen>
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
    const merke = (s: string) => setLog((alt) => [...alt.slice(-3), s]);
    return (
      <Rahmen>
        <CaseKindEdit
          value={kind}
          onSave={(n) => {
            setKind(n);
            merke(`Art → ${n}`);
          }}
        />
        <CaseDispositionEdit
          value={disp}
          onSave={(n) => {
            setDisp(n);
            merke(`Zuständigkeit → ${n}`);
          }}
        />
        <CaseDocumentNumberModeEdit
          value={mode}
          onSave={(n, reason) => {
            setMode(n);
            merke(`Modus → ${n} („${reason}")`);
          }}
        />
        <p className="lw-body-sm">
          Gespeichert: {log.length === 0 ? "nichts" : log.join(" · ")}
        </p>
      </Rahmen>
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
                documentNumbers={NUMMERN}
                onSave={(n) => setMode(n)}
              />
            </div>
          </Card>
        </CaseDetailView>
      </div>
    );
  },
};
