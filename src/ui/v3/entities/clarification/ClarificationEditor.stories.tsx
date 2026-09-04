import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "../../primitives/Button";
import { Drawer } from "../../primitives/Drawer";
import { Card, CardHead } from "../../primitives/Table";
import { ClarificationEditor, type ClarificationDraft } from "./ClarificationEditor";

const meta: Meta<typeof ClarificationEditor> = {
  title: "v3/Entitäten/Klärung/ClarificationEditor",
  component: ClarificationEditor,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ClarificationEditor>;

function Draft({ draft }: { draft: ClarificationDraft | null }) {
  if (!draft) return <span className="v2muted">Noch nichts gesendet.</span>;
  return (
    <pre style={{ margin: 0, fontSize: "var(--fs-ui-sm)", whiteSpace: "pre-wrap" }}>
      {JSON.stringify(draft, null, 2)}
    </pre>
  );
}

export const Gefuellt: Story = {
  render: function Round() {
    const [draft, setDraft] = useState<ClarificationDraft | null>(null);
    return (
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <Card>
          <CardHead title="Rückfrage stellen" sub="Sachverhalt SV-2026-0184" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationEditor
              onSubmit={async (d) => setDraft(d)}
              onCancel={() => setDraft(null)}
              audienceHint="Der Mandant sieht diesen Text im Portal — schreiben Sie ohne Fachjargon."
            />
          </div>
        </Card>
        <Card>
          <CardHead title="Was gesendet würde" sub="der Entwurf, den der Aufrufer schreibt" />
          <div style={{ padding: "var(--space-4)" }}>
            <Draft draft={draft} />
          </div>
        </Card>
      </div>
    );
  },
};

export const Kommentar: Story = {
  render: function Note() {
    const [draft, setDraft] = useState<ClarificationDraft | null>(null);
    return (
      <div style={{ display: "grid", gap: "var(--space-6)" }}>
        <Card>
          <CardHead title="Notiz hinterlassen" sub="ohne Zielgruppe, ohne Gewicht" />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationEditor defaultType="comment" onSubmit={async (d) => setDraft(d)} />
          </div>
        </Card>
        <Card>
          <CardHead title="Entwurf" sub="type = comment, kein audience, keine severity" />
          <div style={{ padding: "var(--space-4)" }}>
            <Draft draft={draft} />
          </div>
        </Card>
      </div>
    );
  },
};

/** All three audiences with the sentence that says what each one means. */
export const Zielgruppen: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      {(["client", "accounting", "agent"] as const).map((a) => (
        <Card key={a}>
          <CardHead
            title={
              a === "client" ? "An den Mandanten" : a === "accounting" ? "An die Kanzlei" : "An den Agenten"
            }
            sub="Vorbelegung über defaultAudience"
          />
          <div style={{ padding: "var(--space-4)" }}>
            <ClarificationEditor defaultAudience={a} onSubmit={async () => {}} />
          </div>
        </Card>
      ))}
    </div>
  ),
};

/**
 * Two ways to be invalid: nothing typed (shown after the first attempt) and a
 * title beyond 140 characters (shown right away).
 */
export const Ungueltig: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <Card>
        <CardHead title="Leer abgeschickt" sub="Grund am Feld und am Knopf" />
        <div style={{ padding: "var(--space-4)" }}>
          <ClarificationEditor onSubmit={async () => {}} />
        </div>
      </Card>
      <Card>
        <CardHead title="Zu lange Überschrift" sub="tippen Sie über 140 Zeichen" />
        <div style={{ padding: "var(--space-4)" }}>
          <ClarificationEditor onSubmit={async () => {}} />
        </div>
      </Card>
    </div>
  ),
};

export const Laedt: Story = {
  render: () => (
    <Card>
      <CardHead title="Sendet" sub="alle Felder gesperrt" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationEditor onSubmit={async () => {}} pending />
      </div>
    </Card>
  ),
};

export const Fehler: Story = {
  render: () => (
    <Card>
      <CardHead title="Fehlgeschlagen" sub="Eingabe bleibt erhalten" />
      <div style={{ padding: "var(--space-4)" }}>
        <ClarificationEditor
          onSubmit={async () => {}}
          error="Der Sachverhalt ist bereits geschlossen — eine neue Rückfrage würde ihn wieder öffnen."
        />
      </div>
    </Card>
  ),
};

/** Where it stands on the page: in a drawer next to the case. */
export const ImEinsatz: Story = {
  render: function InDrawer() {
    const [open, setOpen] = useState(true);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Rückfrage stellen
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Rückfrage stellen"
          meta="Sachverhalt SV-2026-0184 · Musterfirma GmbH"
        >
          <ClarificationEditor onSubmit={async () => setOpen(false)} onCancel={() => setOpen(false)} />
        </Drawer>
      </>
    );
  },
};
