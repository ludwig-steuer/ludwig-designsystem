import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "./Button";
import { Dialog } from "./Dialog";
import { Field, Textarea } from "./Form";

const meta: Meta<typeof Dialog> = { title: "v3/Primitives/Dialog/Dialog", component: Dialog };
export default meta;
type Story = StoryObj<typeof Dialog>;

function Demo({
  label,
  ...props
}: { label: string } & Omit<React.ComponentProps<typeof Dialog>, "open" | "onClose">) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

/**
 * Der Dialog ist für Bestätigungen mit Folgen da — Storno, Löschen, Freigabe.
 * Details gehören ins Master-Detail, Bestehendes in den Drawer.
 */
export const Confirmation: Story = {
  render: () => (
    <Demo
      label="Stapel stornieren"
      title="Stapel stornieren?"
      kicker="Nicht umkehrbar"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm">Abbrechen</Button>
          <Button variant="danger" size="sm">Stornieren</Button>
        </>
      }
    >
      Alle 118 Sätze dieses Stapels werden verworfen. Die Belege bleiben erhalten und können
      in einem neuen Durchgang erneut vorbereitet werden.
    </Demo>
  ),
};

/** Mit Grund-Feld: eine Handlung, die eine Begründung ins Protokoll schreibt. */
export const WithReason: Story = {
  render: () => (
    <Demo
      label="Zurück an den Agenten"
      title="Zurück an den Agenten"
      size="md"
      footer={
        <>
          <Button variant="secondary" size="sm">Abbrechen</Button>
          <Button variant="primary" size="sm">Zurückgeben</Button>
        </>
      }
    >
      <Field label="Grund" hint="Steht später im Protokoll des Durchgangs.">
        <Textarea placeholder="Was soll der Agent anders machen?" />
      </Field>
    </Demo>
  ),
};

/** Große Form für Vorschauen — etwa die Zeilenliste vor der Übergabe. */
export const Large: Story = {
  render: () => (
    <Demo
      label="Übergabe prüfen"
      title="118 Sätze an DATEV übergeben"
      kicker="Letzter Schritt"
      size="lg"
      footer={
        <>
          <Button variant="secondary" size="sm">Abbrechen</Button>
          <Button variant="primary" size="sm">Übergeben</Button>
        </>
      }
    >
      Summe Soll und Summe Haben stimmen bei 42.108,55 € überein. Zwei Nachzügler aus 07/2026
      sind enthalten.
    </Demo>
  ),
};

/** Geschlossen — der Normalzustand: nothing liegt über der Seite. */
export const Closed: Story = {
  render: () => (
    <Dialog open={false} onClose={() => {}} title="Unsichtbar">
      Dieser Inhalt wird nicht gerendert.
    </Dialog>
  ),
};
