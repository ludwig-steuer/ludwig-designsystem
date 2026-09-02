import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GrundDialog } from "./GrundDialog";

const meta: Meta<typeof GrundDialog> = { title: "v3/Primitives/Dialog/GrundDialog", component: GrundDialog };
export default meta;
type Story = StoryObj<typeof GrundDialog>;

const nichts = () => {};

/** Grund optional, Vorschläge als Chips — ein Klick statt Tippen. */
export const Offen: Story = {
  render: () => (
    <GrundDialog
      open
      onClose={nichts}
      onConfirm={nichts}
      kicker="Rückgabe"
      title="Zurück an den Agenten"
      confirmLabel="Zurückgeben"
      chips={["Beleg fehlt", "Konto falsch", "Betrag weicht ab"]}
    >
      Der Agent bekommt den Stapel mit diesem Grund zurück und arbeitet ihn neu auf.
    </GrundDialog>
  ),
};

/** Pflichtgrund und roter Knopf: Storno ist nicht umkehrbar. */
export const Pflichtgrund: Story = {
  render: () => (
    <GrundDialog
      open
      required
      onClose={nichts}
      onConfirm={nichts}
      kicker="Storno"
      title="Buchung stornieren"
      label="Grund (Pflicht)"
      confirmLabel="Stornieren"
      confirmVariant="danger"
    >
      Die Buchung 2026-0008 wird storniert. Der Grund steht im Protokoll.
    </GrundDialog>
  ),
};

/** Läuft: der Knopf ist gesperrt, bis die Antwort da ist. */
export const Laeuft: Story = {
  render: () => (
    <GrundDialog
      open
      pending
      onClose={nichts}
      onConfirm={nichts}
      kicker="Rückgabe"
      title="Zurück an den Agenten"
      confirmLabel="Zurückgeben"
    >
      Wird übertragen …
    </GrundDialog>
  ),
};
