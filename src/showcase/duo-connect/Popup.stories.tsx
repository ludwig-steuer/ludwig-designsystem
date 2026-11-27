import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { Badge, Progress, Spinner, Time } from "@/ui/v3";
import { NOW, STEP_TEXT, SYNC_STATE, USER } from "./fixtures";
import { DraftsVisible } from "./drafts";
import { Board as StateBoard, ExtensionPopup, Single, type StateSpec } from "./Frame";

const line = { display: "flex", flexWrap: "wrap", gap: "var(--space-2)", alignItems: "center" } as const;

function LastLine({ state, text }: { state: "succeeded" | "succeeded_with_issues"; text: string }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-1)" }}>
      <p className="lw-ui-hint">Zuletzt abgeglichen: Musterfirma GmbH</p>
      <p className="lw-ui-hint" style={line}>
        <Time value={NOW} size="sm" />
        <Badge tone={SYNC_STATE[state].tone}>{SYNC_STATE[state].label}</Badge>
        {text ? <span>{text}</span> : null}
      </p>
    </div>
  );
}

const D1 = () => (
  <ExtensionPopup action="Abgleich öffnen" status={`Verbunden als ${USER.name}`} detail={<LastLine state="succeeded" text="" />} />
);

const D2 = () => (
  <ExtensionPopup
    action="Einrichten"
    status={
      <p className="lw-ui-text">
        <strong>Nicht verbunden.</strong> Richten Sie das Plugin einmal ein.
      </p>
    }
  />
);

const D3 = () => (
  <ExtensionPopup
    action="Abgleich öffnen"
    status={<Spinner size="sm" label="Abgleich läuft · Musterfirma GmbH" />}
    detail={
      <>
        <span>{STEP_TEXT.fetch}</span>
        <Progress done={37} total={120} size="sm" label="Beleg 37 von 120" />
      </>
    }
  />
);

const D4 = () => (
  <ExtensionPopup
    action="Ergebnis ansehen"
    status={`Verbunden als ${USER.name}`}
    detail={<LastLine state="succeeded_with_issues" text="3 Belege nicht übertragen" />}
  />
);

const popup = "popup" as const;

const POPUP_STATES: StateSpec[] = [
  { id: "D1", title: "Popup · verbunden", uses: "ExtensionPopup, Badge, Time", missing: "", surface: popup, render: () => <D1 /> },
  { id: "D2", title: "Popup · nicht verbunden", uses: "ExtensionPopup", missing: "", surface: popup, render: () => <D2 /> },
  { id: "D3", title: "Popup · Abgleich läuft", uses: "ExtensionPopup, Spinner, Progress", missing: "", surface: popup, render: () => <D3 /> },
  { id: "D4", title: "Popup · letzter Abgleich mit Problemen (Vorschlag U11)", uses: "ExtensionPopup, Badge, Time", missing: "", surface: popup, render: () => <D4 /> },
];

interface Args {
  showDrafts: boolean;
}

const meta: Meta<Args> = {
  title: "Seiten/DUO-Connect/Popup",
  parameters: { layout: "fullscreen" },
  args: { showDrafts: true },
  argTypes: { showDrafts: { name: "Entwürfe kennzeichnen", control: "boolean" } },
};
export default meta;
type Story = StoryObj<Args>;

function wrap(args: Args, children: ReactNode) {
  return <DraftsVisible value={args.showDrafts}>{children}</DraftsVisible>;
}

function one(id: string): Story {
  const spec = POPUP_STATES.find((s) => s.id === id);
  if (!spec) throw new Error(`unknown state ${id}`);
  return { name: `${spec.id} · ${spec.title}`, render: (args) => wrap(args, <Single spec={spec} />) };
}

/** The popup in its four states, side by side. */
export const Board: Story = {
  render: (args) =>
    wrap(
      args,
      <StateBoard
        title="Popup — alle Zustände"
        lead="320 px, eine Spalte, ein Knopf. Der Knopf wechselt zu einer offenen Hauptseite, statt eine zweite zu öffnen."
        states={POPUP_STATES}
      />,
    ),
};

export const D01Connected = one("D1");
export const D02NotConnected = one("D2");
export const D03Running = one("D3");
export const D04LastWithIssues = one("D4");
