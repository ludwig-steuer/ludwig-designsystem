import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AlertTriangle, CircleCheck, Clock } from "lucide-react";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Link } from "./Link";
import { HeadRow, Row, Table } from "./Table";
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

/** Erfolg (0187): grüner Rahmen, und das Wort im Kicker sagt es — Schritt 0 der Abnahme, wenn der Agent durch ist. */
export const Done: Story = {
  render: () => (
    <StatusCallout
      tone="success"
      icon={<CircleCheck size={20} strokeWidth={1.5} />}
      kicker="Agent fertig"
      title="Periode 08/2026 · Musterfirma GmbH"
      sub="118 Sätze vorgeschlagen, keine offene Frage."
      actions={<Button variant="primary">Abnahme beginnen</Button>}
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

const TASKS: { task: string; state: "done" | "open"; word: string; href: string }[] = [
  { task: "Kontoauszüge abgeglichen", state: "done", word: "erledigt", href: "#schritt-1" },
  { task: "Belege den Zahlungen zugeordnet", state: "done", word: "erledigt", href: "#schritt-2" },
  { task: "Buchungen vorgeschlagen", state: "done", word: "erledigt", href: "#schritt-3" },
  { task: "Dauerbuchungen gesollt", state: "done", word: "erledigt", href: "#schritt-4" },
  { task: "Erwartungen geprüft", state: "done", word: "erledigt", href: "#schritt-5" },
  { task: "Rückfragen gestellt", state: "open", word: "2 offen", href: "#schritt-6" },
  { task: "Umsatzsteuer abgestimmt", state: "open", word: "Differenz 12,40 €", href: "#schritt-7" },
];

function TaskTable({ tasks }: { tasks: typeof TASKS }) {
  return (
    <Table cols="minmax(0, 1fr) auto auto">
      <HeadRow>
        <span>Aufgabe</span>
        <span>Stand</span>
        <span>Schritt</span>
      </HeadRow>
      {tasks.map((t) => (
        <Row key={t.task}>
          <span>{t.task}</span>
          <Badge tone={t.state === "done" ? "success" : "warning"}>{t.word}</Badge>
          <Link href={t.href}>öffnen</Link>
        </Row>
      ))}
    </Table>
  );
}

/**
 * **Eine Box statt zwei** (Owner 2026-09-21, Schritt 0 der Stapelabnahme):
 * der Kopf sagt das Ergebnis, darunter klappt im **selben Rahmen** auf, was
 * der Agent erledigt hat. Zu ist der Standard — der Kopf ist schon die
 * Antwort, die Tabelle der Beleg dafür. Der Knopf steht im Kopf, nicht in der
 * aufklappbaren Zeile: ein Klick auf ihn klappt nichts auf. Der Ton färbt den
 * ganzen Rahmen, auch um die aufgeklappte Tabelle.
 *
 * Darunter derselbe Kopf, wenn der Agent durch ist, und einmal offen
 * (`defaultOpen`).
 */
export const WithDetails: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 880 }}>
      <StatusCallout
        tone="warning"
        kicker="Ergebnis"
        title="Der Agent ist an 2 Stellen nicht fertig"
        sub="Zwei Rückfragen sind offen, die Umsatzsteuer weicht um 12,40 € ab."
        actions={<Button variant="primary">Abnahme beginnen</Button>}
        details={{ summary: "5 von 7 Aufgaben erledigt", children: <TaskTable tasks={TASKS} /> }}
      />
      <StatusCallout
        kicker="Ergebnis"
        title="Der Agent ist fertig"
        sub="Alle sieben Aufgaben sind erledigt."
        actions={<Button variant="primary">Abnahme beginnen</Button>}
        details={{
          summary: "7 von 7 Aufgaben erledigt",
          children: <TaskTable tasks={TASKS.map((t) => ({ ...t, state: "done", word: "erledigt" }))} />,
        }}
      />
      <StatusCallout
        tone="warning"
        kicker="Ergebnis"
        title="Der Agent ist an 2 Stellen nicht fertig"
        actions={<Button variant="primary">Abnahme beginnen</Button>}
        details={{ summary: "5 von 7 Aufgaben erledigt", children: <TaskTable tasks={TASKS} />, defaultOpen: true }}
      />
    </div>
  ),
};
