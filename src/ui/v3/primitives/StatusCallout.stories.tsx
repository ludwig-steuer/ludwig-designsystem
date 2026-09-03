import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertTriangle, CircleCheck, Clock } from "lucide-react";
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

/**
 * `icon` (0049): die Leiste „Nächste Aktion" trägt links ein Symbol, das den
 * Ton mitspricht. Das Wort im Kicker bleibt trotzdem stehen — Farbe und
 * Symbol sind nie die einzige Auskunft (V7).
 */
export const NextAction: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <StatusCallout
        icon={<CircleCheck size={20} strokeWidth={1.5} />}
        kicker="Nächste Aktion"
        title="Buchung freigeben"
        sub="Alle Belege liegen vor, die Steuer stimmt."
        actions={<Button variant="primary" size="sm">Freigeben</Button>}
      />
      <StatusCallout
        tone="warning"
        icon={<Clock size={20} strokeWidth={1.5} />}
        kicker="Nächste Aktion"
        title="Rückfrage beantworten"
        sub="Seit 6 Tagen offen — der Mandant wartet."
        actions={<Button variant="secondary" size="sm">Zur Rückfrage</Button>}
      />
      <StatusCallout
        tone="danger"
        icon={<AlertTriangle size={20} strokeWidth={1.5} />}
        kicker="Nächste Aktion"
        title="Beleg fehlt"
        sub="Ohne Beleg kann der Sachverhalt nicht gebucht werden."
        actions={<Button variant="secondary" size="sm">Beleg anfordern</Button>}
      />
    </div>
  ),
};
