import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { DATEV_MAX_BELEGFELD1, DocumentNumberField } from "./DocumentNumberField";
import { SOURCE_LABEL } from "./fixtures";
import { Field } from "../../primitives/Form";

const meta: Meta<typeof DocumentNumberField> = {
  title: "v3/Entitäten/Belegnummer/DocumentNumberField",
  component: DocumentNumberField,
};
export default meta;
type Story = StoryObj<typeof DocumentNumberField>;

const DOMINANT = {
  documentNumber: "RE-2026-0140",
  source: "opos_anchor" as const,
  accountNumber: "70021",
  caseId: "c-4412",
  caseNumber: "2026-0412",
  caseLifecycle: "open",
  state: "fixed_on_export" as const,
  immutable: true,
};

/**
 * Der Normalfall, daneben `invalid`: roter Rahmen **ohne** eigenen Text — der
 * Satz gehört dem Aufrufer, der weiß, was fehlt.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 420, display: "grid", gap: "var(--space-5)", padding: "var(--space-6)" }}>
      <Field label="Belegfeld 1" htmlFor="b1">
        <DocumentNumberField id="b1" value="RE-2026-0140" onChange={() => {}} sourceLabel={SOURCE_LABEL} />
      </Field>
      <Field label="Belegfeld 1" htmlFor="b2" error="Belegfeld 1 fehlt.">
        <DocumentNumberField id="b2" value="" onChange={() => {}} invalid sourceLabel={SOURCE_LABEL} />
      </Field>
    </div>
  ),
};

/** Mit `onOpenRegister` erscheint die Lupe, ohne sie kein Icon (wie `AccountField`). */
export const WithRegister: Story = {
  render: function Render() {
    const [opened, setOpened] = useState(0);
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: "var(--space-5)", padding: "var(--space-6)" }}>
        <Field label="Mit Register" htmlFor="b3">
          <DocumentNumberField
            id="b3"
            value="RE-2026-0140"
            onChange={() => {}}
            onOpenRegister={() => setOpened((n) => n + 1)}
            sourceLabel={SOURCE_LABEL}
          />
        </Field>
        <Field label="Ohne Register" htmlFor="b4">
          <DocumentNumberField id="b4" value="RE-2026-0140" onChange={() => {}} sourceLabel={SOURCE_LABEL} />
        </Field>
        <p className="v2sub">Register {opened}× geöffnet.</p>
      </div>
    );
  },
};

/**
 * `dominant` weicht ab — einmal unveränderlich (DATEV), einmal nicht. Der
 * Hinweis ist **kein Fehler**: eine Abweichung kann begründet sein. Die Nummer
 * selbst ist ein Knopf und setzt sie ein.
 */
export const Diverging: Story = {
  render: function Render() {
    const [a, setA] = useState("RE 2026 140");
    const [b, setB] = useState("RE-2026-0141");
    return (
      <div style={{ maxWidth: 460, display: "grid", gap: "var(--space-5)", padding: "var(--space-6)" }}>
        <Field label="Aus DATEV, unveränderlich" htmlFor="b5">
          <DocumentNumberField
            id="b5"
            value={a}
            onChange={setA}
            dominant={DOMINANT}
            sourceLabel={SOURCE_LABEL}
          />
        </Field>
        <Field label="Kandidat, veränderlich" htmlFor="b6">
          <DocumentNumberField
            id="b6"
            value={b}
            onChange={setB}
            dominant={{
              ...DOMINANT,
              documentNumber: "RE-2026-0140",
              source: "invoice_number",
              state: "computed",
              immutable: false,
            }}
            sourceLabel={SOURCE_LABEL}
          />
        </Field>
      </div>
    );
  },
};

/** Freie Eingabe: das Register ist ein Angebot, kein Zwang. */
export const Interactive: Story = {
  render: function Render() {
    const [v, setV] = useState("RE-2026-");
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: "var(--space-4)", padding: "var(--space-6)" }}>
        <Field label="Belegfeld 1" htmlFor="b7">
          <DocumentNumberField id="b7" value={v} onChange={setV} sourceLabel={SOURCE_LABEL} />
        </Field>
        <p className="v2sub">
          Wert: <code>{v || "(leer)"}</code> · {v.length} von {DATEV_MAX_BELEGFELD1} Zeichen
        </p>
      </div>
    );
  },
};

/**
 * Rand: 36 Zeichen erreicht — das Feld **hält**, statt still abzuschneiden.
 * Darunter dieselbe sehr lange dominante Nummer zweimal: in 420 px bricht
 * der Hinweis um, in **96 px** — der Spur des Buchungsrasters — kürzt er.
 * Das Layout hält in beiden Fällen.
 */
export const Edge: Story = {
  render: function Render() {
    const [v, setV] = useState("RE-2026-0140-TEILRECHNUNG-2-VON-3-XX");
    return (
      <div style={{ maxWidth: 420, display: "grid", gap: "var(--space-5)", padding: "var(--space-6)" }}>
        <Field label="Grenze erreicht" htmlFor="b8">
          <DocumentNumberField id="b8" value={v} onChange={setV} sourceLabel={SOURCE_LABEL} />
        </Field>
        <Field label="Lange dominante Nummer" htmlFor="b9">
          <DocumentNumberField
            id="b9"
            value="RE-1"
            onChange={() => {}}
            dominant={{
              ...DOMINANT,
              documentNumber: "RE-2026-0140-TEILRECHNUNG-2-VON-3-XX",
            }}
            sourceLabel={SOURCE_LABEL}
          />
        </Field>
        {/* Derselbe Fall in **96 px** — der Spur, die Belegfeld 1 im
            Buchungsraster hat. Genau hier riss das Layout dreimal, und
            geprüft wurde es jedes Mal in der Story einer anderen Aufgabe;
            der Baustein trägt seinen engen Fall jetzt selbst (Abnahme
            2026-09-07, vierte Runde). */}
        <Field label="Dieselbe Nummer in der Spur des Rasters" htmlFor="b10">
          <div style={{ width: 96 }}>
            <DocumentNumberField
              id="b10"
              value="RE-1"
              onChange={() => {}}
              dominant={{
                ...DOMINANT,
                documentNumber: "RE20260140TEILRECHNUNG2VON3XXYYZZ123",
              }}
              sourceLabel={SOURCE_LABEL}
            />
          </div>
        </Field>
      </div>
    );
  },
};
