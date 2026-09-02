import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ReasonDialog } from "./ReasonDialog";

const meta: Meta<typeof ReasonDialog> = { title: "v3/Primitives/Dialog/ReasonDialog", component: ReasonDialog };
export default meta;
type Story = StoryObj<typeof ReasonDialog>;

const nichts = () => {};

/** Grund optional, Vorschläge als Chips — ein Klick statt Tippen. */
export const Open: Story = {
  render: () => (
    <ReasonDialog
      open
      onClose={nichts}
      onConfirm={nichts}
      kicker="Rückgabe"
      title="Zurück an den Agenten"
      confirmLabel="Zurückgeben"
      chips={["Beleg fehlt", "Konto falsch", "Betrag weicht ab"]}
    >
      Der Agent bekommt den Stapel mit diesem Grund zurück und arbeitet ihn neu auf.
    </ReasonDialog>
  ),
};

/** Pflichtgrund und roter Knopf: Storno ist nicht umkehrbar. */
export const ReasonRequired: Story = {
  render: () => (
    <ReasonDialog
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
    </ReasonDialog>
  ),
};

/** Läuft: der Knopf ist gesperrt, bis die Antwort da ist. */
export const Pending: Story = {
  render: () => (
    <ReasonDialog
      open
      pending
      onClose={nichts}
      onConfirm={nichts}
      kicker="Rückgabe"
      title="Zurück an den Agenten"
      confirmLabel="Zurückgeben"
    >
      Wird übertragen …
    </ReasonDialog>
  ),
};
