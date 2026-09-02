import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";
import { StatusCallout } from "./StatusCallout";

const meta: Meta<typeof StatusCallout> = { title: "v3/Primitives/Fläche/StatusCallout", component: StatusCallout };
export default meta;
type Story = StoryObj<typeof StatusCallout>;

/** Offen: der übliche Fall, neutraler Frame, ein primärer Weg. */
export const Open: Story = {
  render: () => (
    <StatusCallout
      kicker="Offener Stapel"
      title="Periode 08/2026 · Musterfirma GmbH"
      sub="118 Sätze vorbereitet, 12 Punkte offen."
      actions={<Button variant="primary">Zur Abnahme</Button>}
    />
  ),
};

/** Wartet: der Frame warnt, das Wort im Kicker sagt worauf. */
export const WaitingForClient: Story = {
  render: () => (
    <StatusCallout
      tone="warning"
      kicker="Wartet auf den Mandanten"
      title="Periode 08/2026 · Musterfirma GmbH"
      sub="2 Fragen seit 6 Tagen ohne Antwort."
      actions={
        <>
          <Button variant="secondary">Erinnern</Button>
          <Button variant="primary">Zur Abnahme</Button>
        </>
      }
    />
  ),
};

/** Fehlgeschlagen: roter Frame, und der erste Knopf ist der Wiederversuch. */
export const Failed: Story = {
  render: () => (
    <StatusCallout
      tone="danger"
      kicker="Übertragung fehlgeschlagen"
      title="Periode 08/2026 · Musterfirma GmbH"
      sub="DATEV hat den Stapel am 26.08., 09:40 abgewiesen."
      actions={
        <>
          <Button variant="secondary">Protokoll ansehen</Button>
          <Button variant="primary">Erneut übertragen</Button>
        </>
      }
    />
  ),
};

/** Ohne Handlung — abgeschlossene Stapel brauchen keinen Knopf. */
export const WithoutAction: Story = {
  render: () => (
    <StatusCallout
      kicker="Abgeschlossen"
      title="Periode 07/2026 · Musterfirma GmbH"
      sub="Am 04.08. in DATEV übernommen und abgestimmt."
    />
  ),
};
