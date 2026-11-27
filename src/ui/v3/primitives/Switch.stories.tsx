import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { Disclosure } from "./Disclosure";
import { FieldList } from "./FieldList";
import { Switch } from "./Switch";
import { Card, CardHead, CardSection } from "./Table";

const meta: Meta<typeof Switch> = { title: "v3/Primitives/Formular/Switch", component: Switch };
export default meta;
type Story = StoryObj<typeof Switch>;

/* The two settings of the browser extension, words from its glossary. */
const HANDOVER = "Belegübergabe";
const HANDOVER_HINT =
  "Lädt Beleg-Dateien, die auf anderem Weg nach Ludwig kamen (zum Beispiel per E-Mail), nach DATEV Unternehmen Online hoch. Welche das sind, bestimmt Ludwig. Buchungen und Buchungsanweisungen werden nicht übertragen.";
const REPORTS = "Fehlermeldungen senden";
const REPORTS_HINT =
  "Bricht ein Abgleich mit einem Fehler ab, schickt das Plugin eine technische Meldung an den Anbieter: Version, Schritt, Fehlertext. Ohne Belegdaten, Namen oder Dateinamen.";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** On a card, where the switch stands: its hover ground is the page ground and needs the surface. */
function Frame({ children }: { children: ReactNode }) {
  return (
    <div style={{ maxWidth: "var(--container-narrow)" }}>
      <Card>
        <CardSection>{children}</CardSection>
      </Card>
    </div>
  );
}

/** The popup's content width (320 px less 16 px each side) on its surface, no padding of its own. */
function PopupWidth({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: "calc(var(--space-20) * 4 - var(--space-8))", background: "var(--color-surface)" }}>
      {children}
    </div>
  );
}

/** Clicks the knob of the first switch in the story. */
async function clickFirst(canvasElement: HTMLElement) {
  await wait(50);
  canvasElement.querySelector<HTMLInputElement>(".v2switch__knob")?.click();
}

/** Two settings, one off and one on, the line between them; synchronous `onChange`. */
export const Filled: Story = {
  render: function Render() {
    const [handover, setHandover] = useState(false);
    const [reports, setReports] = useState(true);
    return (
      <Frame>
        <Switch label={HANDOVER} hint={HANDOVER_HINT} checked={handover} onChange={setHandover} />
        <Switch label={REPORTS} hint={REPORTS_HINT} checked={reports} onChange={setReports} />
      </Frame>
    );
  },
};

/** The promise does not answer: the switch stands on „An", locked; after 300 ms the circle in the place of the word. */
export const Saving: Story = {
  render: function Render() {
    const [on, setOn] = useState(false);
    return (
      <Frame>
        <Switch
          label={HANDOVER}
          hint={HANDOVER_HINT}
          checked={on}
          onChange={async (v) => {
            await new Promise(() => undefined);
            setOn(v);
          }}
        />
      </Frame>
    );
  },
  play: async ({ canvasElement }) => clickFirst(canvasElement),
};

/** The promise answers with an error after 600 ms: the switch springs back, the reason stands underneath, announced. */
export const Failed: Story = {
  render: function Render() {
    const [on, setOn] = useState(false);
    return (
      <Frame>
        <Switch
          label={HANDOVER}
          hint={HANDOVER_HINT}
          checked={on}
          onChange={async (v) => {
            await wait(600);
            if (v) return { error: "Der Browser hat die Einstellung abgelehnt. Bitte laden Sie die Seite neu." };
            setOn(v);
          }}
        />
      </Frame>
    );
  },
  play: async ({ canvasElement }) => clickFirst(canvasElement),
};

/** Locked with its reason: no hover, not reachable by Tab, the reason linked. */
export const Locked: Story = {
  render: () => (
    <Frame>
      <Switch
        label={HANDOVER}
        hint={HANDOVER_HINT}
        checked={false}
        onChange={() => undefined}
        disabledReason="Erst möglich, wenn das Plugin mit Ludwig verbunden ist."
      />
    </Frame>
  ),
};

/**
 * Round trip with a store that takes 600 ms. Every third switch fails once,
 * the next one goes through. The line below shows what is stored.
 */
export const Interactive: Story = {
  render: function Render() {
    const [on, setOn] = useState(false);
    const attempts = useRef(0);
    return (
      <Frame>
        <Switch
          label={HANDOVER}
          hint={HANDOVER_HINT}
          checked={on}
          onChange={async (v) => {
            attempts.current += 1;
            await wait(600);
            if (attempts.current % 3 === 0) {
              return { error: "Der Speicher des Browsers war gerade belegt. Bitte versuchen Sie es noch einmal." };
            }
            setOn(v);
          }}
        />
        <p className="lw-ui-hint" style={{ margin: "var(--space-3) 0 0" }}>
          Gespeichert: {on ? "eingeschaltet" : "ausgeschaltet"}
        </p>
      </Frame>
    );
  },
};

/** The settings card of the extension (C5): connection, both switches, diagnosis folded. */
export const InUse: Story = {
  render: function Render() {
    const [handover, setHandover] = useState(false);
    const [reports, setReports] = useState(true);
    const store = (set: (v: boolean) => void) => async (v: boolean) => {
      await wait(150);
      set(v);
    };
    return (
      <div style={{ maxWidth: "var(--container-narrow)" }}>
        <Card>
          <CardHead title="Einstellungen" />
          <CardSection>
            <FieldList
              title="Verbindung"
              layout="row"
              rows={[
                ["Nutzer", "Anna Berger"],
                ["Gerät", "Laptop Büro"],
                ["Gültig bis", "26.11.2027"],
              ]}
            />
          </CardSection>
          <CardSection>
            <Switch label={HANDOVER} hint={HANDOVER_HINT} checked={handover} onChange={store(setHandover)} />
            <Switch label={REPORTS} hint={REPORTS_HINT} checked={reports} onChange={store(setReports)} />
          </CardSection>
          <CardSection>
            <Disclosure summary="Diagnose: Verbindung, Abgleich von Hand, Rohprotokoll">
              <p className="lw-ui-hint" style={{ margin: 0 }}>
                Für den Support und die Entwicklung.
              </p>
            </Disclosure>
          </CardSection>
        </Card>
      </div>
    );
  },
};

/** In the popup's width (320 px less 16 px each side): the title wraps, word and knob stay top right. */
export const LongText: Story = {
  render: function Render() {
    const [on, setOn] = useState(true);
    return (
      <PopupWidth>
        <Switch
          label="Belege aus Ludwig an DATEV übergeben"
          hint={`${HANDOVER_HINT} Die Einstellung gilt für alle Mandanten dieses Geräts.`}
          checked={on}
          onChange={setOn}
        />
      </PopupWidth>
    );
  },
};
