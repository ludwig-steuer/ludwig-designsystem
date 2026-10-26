import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { HOLDER } from "@/ludwig/modules/source-docs/domain/document-process";
import { Baton } from "../../patterns/Process";
import { StepRail, type RailItem } from "../../patterns/StepRail";
import { TaskList } from "../../patterns/TaskList";
import { Segmented } from "../../primitives/Nav";
import { Link } from "../../primitives/Link";
import { Card, CardHead } from "../../primitives/Table";
import { DateRange } from "../../primitives/Time";
import { AgentRunBanner, AgentRunCell } from "./AgentRun";

const meta: Meta<typeof AgentRunBanner> = {
  title: "v3/Entitäten/Durchgang/AgentRun",
  component: AgentRunBanner,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof AgentRunBanner>;

/** Counted back from the moment the story loads, so the clock shows the same minutes every time. */
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const Stack = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "grid", gap: "var(--space-4)" }}>{children}</div>
);

/** Every part: how long, when it is usually done, who started it, which run of the batch. */
export const Running: Story = {
  render: () => (
    <AgentRunBanner state="running" startedAt={ago(6)} startedBy="Anna Berger" expectedMinutes={12} pass={2} />
  ),
};

/** Only the start, and under a minute: the bar says no more than it knows. */
export const RunningMinimal: Story = {
  render: () => <AgentRunBanner state="running" startedAt={ago(0.2)} />,
};

/** Started 50 s ago: within about 25 s the clock moves to „seit 1 Min", without new props. */
export const Ticking: Story = {
  render: () => <AgentRunBanner state="running" startedAt={ago(50 / 60)} startedBy="Anna Berger" expectedMinutes={12} />,
};

/** The three states one under the other — same frame, same height; only surface, sign and sentence change. */
export const States: Story = {
  render: () => (
    <Stack>
      <AgentRunBanner state="running" startedAt={ago(6)} startedBy="Anna Berger" expectedMinutes={12} pass={2} />
      <AgentRunBanner
        state="done"
        message="Ludwig ist fertig: 2 neue Rückfragen"
        action={{ label: "Rückfragen beantworten", href: "#questions" }}
      />
      <AgentRunBanner
        state="failed"
        message="Ludwig ist nicht fertig geworden: Der Kontoauszug für März fehlt."
        action={{ label: "Protokoll des Durchgangs öffnen", href: "#log" }}
      />
    </Stack>
  ),
};

/** Done: the sentence and exactly one button for the next step — as a link and as a callback. */
export const Done: Story = {
  render: () => {
    const [clicked, setClicked] = useState(0);
    return (
      <Stack>
        <AgentRunBanner
          state="done"
          message="Ludwig ist fertig: 2 neue Rückfragen"
          action={{ label: "Rückfragen beantworten", href: "#questions" }}
        />
        <AgentRunBanner
          state="done"
          message="Ludwig ist fertig: keine neue Rückfrage, 14 Buchungsvorschläge"
          action={{ label: `Buchungen prüfen${clicked ? ` (${clicked}× geklickt)` : ""}`, onClick: () => setClicked((n) => n + 1) }}
        />
        <AgentRunBanner state="done" message="Ludwig ist fertig: nichts Neues in diesem Durchgang" />
      </Stack>
    );
  },
};

/** Failed — what the registry calls danger (`run_outcome.blocked`): a red sentence and a reference, and without one when the app has nowhere to point. */
export const Failed: Story = {
  render: () => (
    <Stack>
      <AgentRunBanner
        state="failed"
        message="Ludwig ist nicht fertig geworden: Der Kontoauszug für März fehlt."
        action={{ label: "Protokoll des Durchgangs öffnen", href: "#log" }}
      />
      <AgentRunBanner state="failed" message="Ludwig steckt fest: Im Schritt Konten fehlen zwei offene Posten." />
    </Stack>
  ),
};

/** The edges at 1280 px: two hours, longer than usual, a long name, a sentence that wraps beside the button. */
export const Edge: Story = {
  render: () => (
    <div style={{ maxWidth: "calc(1280px - 2 * var(--space-8))" }}>
      <Stack>
        <AgentRunBanner
          state="running"
          startedAt={ago(125)}
          startedBy="Dr. Maximiliane Hohenstein-Wittelsbach"
          expectedMinutes={12}
          pass={11}
        />
        <AgentRunBanner
          state="done"
          message="Ludwig ist fertig: 118 Buchungsvorschläge, 4 neue Rückfragen an die Kanzlei, 2 Belege, die er keinem Sachverhalt zuordnen konnte, und eine Warnung zum Konto 1802 Geschäftskonto"
          action={{ label: "Rückfragen beantworten", href: "#questions" }}
        />
      </Stack>
    </div>
  ),
};

/** The short form in „Zu tun" on the client overview: the batch lies with Ludwig, and he is at it. Next to a row with a holder, same height. */
export const Cell: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <Card>
        <CardHead title="Zu tun" />
        <TaskList
          groups={[
            {
              key: "others",
              label: "Liegt bei anderen",
              rows: [
                {
                  key: "run",
                  title: "Stapel 2026-0009 wird gebucht",
                  sub: <AgentRunCell startedAt={ago(6)} />,
                  right: <Link href="#batch">anzeigen</Link>,
                },
                {
                  key: "request",
                  title: "1 Nachforderung offen, Frist 30.10.2026",
                  sub: <Baton owner={HOLDER.client} />,
                  right: <Link href="#requests">anzeigen</Link>,
                },
              ],
            },
          ]}
        />
      </Card>
    </div>
  ),
};

const STEPS: RailItem[] = [
  { key: "start", index: 1, label: "Start", tone: "done", counterText: "Überblick", href: "#start" },
  { key: "questions", index: 2, label: "Rückfragen", tone: "open", counterText: "11 offen", href: "#questions", current: true },
  { key: "documents", index: 3, label: "Belege", tone: "open", counterText: "5 prüfen", href: "#documents" },
  { key: "accounts", index: 4, label: "Konten", tone: "open", counterText: "1 Warnung", href: "#accounts" },
  {
    key: "bookings",
    index: 5,
    label: "Buchungen",
    tone: "dimmed",
    counterText: "Ludwig bucht",
    href: null,
    disabledReason: "Ludwig bucht gerade nach. Die Vorschläge stehen hier, sobald der Durchgang fertig ist.",
  },
  { key: "handover", index: 6, label: "Übergeben", tone: "neutral", counterText: "an DATEV", href: "#handover" },
];

const STARTED = ago(6);

/** In place: under the step bar of the batch review. The switch stands in for the app's polling — running, done, failed. */
export const InUse: Story = {
  render: () => {
    const [state, setState] = useState("running");
    return (
      <Stack>
        <Segmented
          ariaLabel="Stand des Durchgangs (nur in der Story)"
          active={state}
          onPick={setState}
          options={[
            { key: "running", label: "läuft" },
            { key: "done", label: "fertig" },
            { key: "failed", label: "gescheitert" },
          ]}
        />
        <StepRail
          layout="bar"
          ariaLabel="Schritte der Abnahme"
          head={
            <>
              <strong>Stapel 2026-0009 abnehmen</strong>
              <span className="v2sub">
                <DateRange from="2026-08-01" to="2026-08-31" size="sm" />
              </span>
            </>
          }
          items={STEPS}
        />
        {state === "running" ? (
          <AgentRunBanner state="running" startedAt={STARTED} startedBy="Anna Berger" expectedMinutes={12} pass={2} />
        ) : state === "done" ? (
          <AgentRunBanner
            state="done"
            startedAt={STARTED}
            message="Ludwig ist fertig: 2 neue Rückfragen"
            action={{ label: "Rückfragen beantworten", href: "#questions" }}
          />
        ) : (
          <AgentRunBanner
            state="failed"
            startedAt={STARTED}
            message="Ludwig ist nicht fertig geworden: Der Kontoauszug für August fehlt."
            action={{ label: "Protokoll des Durchgangs öffnen", href: "#log" }}
          />
        )}
        <Card>
          <CardHead title="Rückfragen" />
          <p style={{ margin: 0, padding: "var(--space-4)" }}>
            Alles bleibt sichtbar, während Ludwig arbeitet. Quittieren lässt sich erst nach dem Durchgang.
          </p>
        </Card>
      </Stack>
    );
  },
};
