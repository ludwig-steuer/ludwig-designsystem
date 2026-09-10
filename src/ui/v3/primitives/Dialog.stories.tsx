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
      <Field label="Grund" hint="Steht später im Protokoll des Durchgangs." htmlFor="grund">
        <Textarea id="grund" placeholder="Was soll der Agent anders machen?" />
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

/** Geschlossen — der Normalzustand: nichts liegt über der Seite. */
export const Closed: Story = {
  render: () => (
    <Dialog open={false} onClose={() => {}} title="Unsichtbar">
      Dieser Inhalt wird nicht gerendert.
    </Dialog>
  ),
};

/* ── Tastatur (0092) ──────────────────────────────────────────────────── */

/**
 * Enter bestätigt (I2). Bis 0092 kannte der Dialog seine Hauptaktion nicht —
 * `onConfirm` sagt sie ihm. In einem Textfeld bleibt Enter der Zeilenumbruch,
 * und auf einem Knopf bleibt es dessen eigener Klick.
 */
export const EnterConfirms: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [confirmed, setConfirmed] = useState(0);
    return (
      <>
        <Button variant="primary" onClick={() => setOpen(true)}>
          Freigeben
        </Button>{" "}
        <span className="lw-numeric">{confirmed}× bestätigt</span>
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => {
            setConfirmed((n) => n + 1);
            setOpen(false);
          }}
          title="Stapel freigeben?"
          size="sm"
          footer={
            <>
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                Abbrechen
              </Button>
              <Button
                variant="primary"
                size="sm"
                hotkey="⏎"
                onClick={() => {
                  setConfirmed((n) => n + 1);
                  setOpen(false);
                }}
              >
                Freigeben
              </Button>
            </>
          }
        >
          118 Sätze gehen an DATEV. Drücken Sie Enter, ohne den Knopf zu suchen.
        </Dialog>
      </>
    );
  },
};

/**
 * Der Fokus geht in den Dialog — aber **nicht** über ein Kind, das ihn selbst
 * angefordert hat. Vor 0092 zog der Dialog ihn zurück auf die Fläche, und die
 * Suche der Befehlspalette verlor ihn nach einem Tick: Getipptes landete
 * nirgends, Enter schloss die Palette.
 */
export const AutoFocusChild: Story = {
  render: () => (
    <Demo label="Mit Suchfeld öffnen" title="Suchen" size="md">
      <Field label="Suche" htmlFor="suche">
        {/* eslint-disable-next-line jsx-a11y/no-autofocus -- this is exactly the proof */}
        <input id="suche" className="v2in" autoFocus placeholder="Tippen Sie sofort los" />
      </Field>
    </Demo>
  ),
};

/**
 * Tab bleibt im Dialog. Ohne die Falle wandert der Fokus hinter den Scrim
 * weiter, und wer nicht sieht, bedient eine Seite, die nicht da ist
 * (V10/V11).
 */
export const KeyboardTrap: Story = {
  render: () => (
    <Demo
      label="Drei Haltepunkte"
      title="Tab läuft im Kreis"
      size="sm"
      footer={
        <>
          <Button variant="secondary" size="sm">Abbrechen</Button>
          <Button variant="primary" size="sm">Weiter</Button>
        </>
      }
    >
      <Field label="Grund" htmlFor="grund-2">
        <Textarea id="grund-2" rows={2} placeholder="Vom letzten Haltepunkt führt Tab zurück auf das Kreuz." />
      </Field>
    </Demo>
  ),
};
