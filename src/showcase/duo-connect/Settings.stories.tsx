import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ReactNode } from "react";
import {
  ActionButton,
  Button,
  Callout,
  Card,
  CardHead,
  CardSection,
  CheckItems,
  Checkbox,
  CopyTextButton,
  DateRangeField,
  Dialog,
  Disclosure,
  Field,
  FieldList,
  Input,
  RawValue,
  Select,
  TextButton,
  Time,
  type CheckItem,
} from "@/ui/v3";
import { READINESS, READINESS_REPORT, STEP_TEXT, USER, type StepKey } from "./fixtures";
import { DraftsVisible, SettingSwitch } from "./drafts";
import { Board as StateBoard, ExtensionShell, Single, type StateSpec } from "./Frame";

const stack = { display: "grid", gap: "var(--space-4)" } as const;
const row = { display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" } as const;

/* ── C1 connection ───────────────────────────────────────────────────── */

function ConnectionCard() {
  return (
    <Card>
      <CardHead
        title="Verbindung"
        sub="Mit Ludwig verbunden"
        actions={
          <>
            <Button size="sm">Neu verbinden</Button>
            <ActionButton
              size="sm"
              variant="danger"
              action={async () => {}}
              confirm={{
                title: "Verbindung trennen?",
                body: "Das Plugin kann danach nicht mehr abgleichen, bis Sie es neu verbinden. Ludwig widerruft die Verbindung.",
                confirmLabel: "Verbindung trennen",
                tone: "danger",
              }}
            >
              Verbindung trennen
            </ActionButton>
          </>
        }
      />
      <CardSection>
        <FieldList
          tone="bare"
          layout="row"
          rows={[
            ["Nutzer", USER.name],
            ["Gerät", USER.device],
            ["Gültig bis", <Time key="v" value={USER.validUntil} format="date" />],
          ]}
        />
      </CardSection>
    </Card>
  );
}

/* ── C2, C3: switches (owner 2026-11-27: lifts 0018 for settings that act at once) ── */

const HANDOVER_TEXT =
  "Lädt Beleg-Dateien, die auf anderem Weg nach Ludwig kamen, zum Beispiel per E-Mail, nach DATEV Unternehmen Online hoch. Welche das sind, bestimmt Ludwig. Buchungen werden nicht übertragen. Gilt für alle Mandanten dieses Geräts.";

type HandoverDemo = "off" | "on" | "saving" | "failed";

/**
 * The two settings as switch rows in one card. `handover` shows the switch in
 * each of its phases: off, on, saving (locked) and failed (sprung back).
 */
function StepsAndReports({ handover }: { handover: HandoverDemo }) {
  const [on, setOn] = useState(handover === "on" || handover === "saving");
  const [reports, setReports] = useState(true);
  const [said, setSaid] = useState<string | undefined>();
  return (
    <Card>
      <CardHead title="Schritte und Meldungen" />
      <CardSection>
        <div style={{ display: "grid", gap: "var(--space-6)" }}>
          <SettingSwitch
            title={STEP_TEXT.handover}
            text={HANDOVER_TEXT}
            on={on}
            phase={handover === "saving" ? "saving" : handover === "failed" ? "failed" : "idle"}
            error="Die Einstellung wurde nicht gespeichert: Ludwig ist nicht erreichbar. Versuchen Sie es in ein paar Minuten erneut."
            onToggle={() => {
              setSaid(on ? "Belegübergabe ausgeschaltet" : "Belegübergabe eingeschaltet");
              setOn(!on);
            }}
            announce={said}
          />
          <SettingSwitch
            title="Fehlermeldungen senden"
            text="Technische Meldungen ohne Mandantendaten an den Anbieter. Hilft, Fehler zu finden, die nicht an Ihnen liegen."
            on={reports}
            onToggle={() => setReports(!reports)}
          />
        </div>
      </CardSection>
    </Card>
  );
}

/* ── C4 readiness check ──────────────────────────────────────────────── */

type Point = { state: CheckItem["state"]; reason: string; jump?: ReactNode };

function readiness(points: Record<string, Point>): CheckItem[] {
  return READINESS.map((p) => {
    const point = points[p.code];
    if (!point) throw new Error(`no state for readiness point ${p.code}`);
    return { code: p.code, question: p.question, ...point };
  });
}

const ONE_HINT = readiness({
  "1": { state: "green", reason: "Version 0.11.0 ist aktuell." },
  "2": { state: "green", reason: "Ludwig antwortet." },
  "3": { state: "green", reason: "Verbunden als Anna Berger, gültig bis 26.11.2027." },
  "4": {
    state: "yellow",
    reason: "Bei Ingenieurbüro Brandt fehlt die DATEV-Mandantennummer; er wird übersprungen.",
    jump: <Button size="xs">In Ludwig öffnen</Button>,
  },
  "5": { state: "open", reason: "Lässt sich ohne geöffnetes DATEV nicht prüfen.", jump: <Button size="xs">DATEV öffnen</Button> },
  "6": { state: "open", reason: "Zeigt sich beim ersten Abgleich; der Abgleich wartet auf die Anmeldung.", jump: <Button size="xs">DATEV öffnen</Button> },
  "7": { state: "open", reason: "Nur bei „Gründlich prüfen“: öffnet DATEV und wählt den Mandanten." },
  "8": { state: "green", reason: "In Chrome ist keine Freigabe nötig." },
  "9": { state: "green", reason: "Vom Server geladen." },
  "10": { state: "green", reason: "Diese Seite ist die einzige." },
});

const ALL_READY = readiness({
  ...Object.fromEntries(ONE_HINT.map((i) => [i.code, { state: i.state, reason: i.reason, jump: i.jump }])),
  "4": { state: "green", reason: "12 Mandanten, alle mit DATEV-Mandantennummer." },
  "5": { state: "green", reason: "DATEV antwortet." },
  "6": { state: "green", reason: "Angemeldet." },
  "7": { state: "green", reason: "Musterfirma GmbH in DATEV geöffnet und wieder geschlossen." },
});

function ReadinessCard({ items, sentence }: { items: CheckItem[]; sentence: string }) {
  return (
    <Card>
      <CardHead
        title="Alles bereit?"
        sub={
          <>
            {sentence} Geprüft <Time value="2026-11-27T09:20:00+01:00" format="time" size="sm" />
          </>
        }
        actions={
          <>
            <Button size="sm">Erneut prüfen</Button>
            <Button size="sm" variant="tertiary">
              Gründlich prüfen
            </Button>
            <CopyTextButton text={READINESS_REPORT} label="Bericht kopieren" variant="tertiary" />
          </>
        }
      />
      <CheckItems items={items} />
    </Card>
  );
}

/* ── C5 diagnosis ────────────────────────────────────────────────────── */

const ALL_STEPS: StepKey[] = ["filing", "fetch", "handover", "accounts"];

/** Invented, not a real token. */
const TOKEN = "lag_k7Q2mP9xR4vT8wZ1nB6cD3fH5jL0sYa1b2";
const TOKEN_SHORT = "lag_…a1b2";

const group = { display: "grid", gap: "var(--space-3)", paddingTop: "var(--space-4)", borderTop: "var(--border-1-subtle)" } as const;

/** C5a: the connection as the support needs it; the token hidden until asked for. */
function TechnicalConnection({ shown }: { shown: boolean }) {
  const [visible, setVisible] = useState(shown);
  const token = visible ? (
    <div style={{ display: "grid", gap: "var(--space-2)", justifyItems: "start" }}>
      <span style={row}>
        <span className="lw-mono">
          <RawValue value={TOKEN} format="text" />
        </span>
        <CopyTextButton text={TOKEN} label="Kopieren" size="xs" />
      </span>
      <span className="lw-ui-hint" style={row}>
        <span role="status">Wird nach 30 Sekunden wieder ausgeblendet.</span>
        <TextButton onClick={() => setVisible(false)}>Ausblenden</TextButton>
      </span>
    </div>
  ) : (
    <span style={row}>
      <span className="lw-mono">{TOKEN_SHORT}</span>
      <TextButton onClick={() => setVisible(true)}>Token anzeigen</TextButton>
    </span>
  );
  return (
    <section style={group}>
      <h3 className="lw-ui-group">Verbindung, technisch</h3>
      <FieldList
        tone="bare"
        rows={[
          ["Art", "über „Mit Ludwig verbinden“ erzeugt"],
          ["Nutzer", USER.name],
          ["Gerät", USER.device],
          ["Gültig bis", <Time key="v" value={USER.validUntil} format="date" />],
          ["Umgebung", "Produktion"],
          ["Token", token],
        ]}
      />
      <Field label="Neues Token" htmlFor="duo-new-token" hint="Token austauschen: Ein neues Token ersetzt das gespeicherte, erst nach erfolgreicher Prüfung.">
        <Input id="duo-new-token" type="password" autoComplete="off" spellCheck={false} />
      </Field>
      <div>
        <ActionButton size="sm" action={async () => {}}>
          Token prüfen und speichern
        </ActionButton>
      </div>
    </section>
  );
}

const STORED_TITLE = "Gespeicherte Daten löschen?";
const STORED_BODY = "Der nächste Abgleich bestimmt den Abrufzeitraum neu aus Ludwig. Die Verbindung bleibt bestehen.";

/** C5b: what the plugin keeps besides the connection; one button removes it. */
function StoredData() {
  return (
    <section style={group}>
      <h3 className="lw-ui-group">Gespeicherte Daten</h3>
      <p className="lw-ui-text">
        Gespeichert sind die Einstellungen von Ludwig und der Stand der letzten Belegabrufe dieser Umgebung. Die
        Verbindung bleibt bestehen.
      </p>
      <div>
        <ActionButton
          size="sm"
          variant="danger"
          action={async () => {}}
          confirm={{ title: STORED_TITLE, body: STORED_BODY, confirmLabel: "Gespeicherte Daten löschen", tone: "danger" }}
        >
          Gespeicherte Daten löschen
        </ActionButton>
      </div>
    </section>
  );
}

function Diagnosis({ open, tokenShown = false }: { open: boolean; tokenShown?: boolean }) {
  const [range, setRange] = useState<[string | null, string | null]>([null, null]);
  return (
    <Card>
      <CardSection>
        <Disclosure summary="Diagnose: Verbindung, Abgleich von Hand, Rohprotokoll, gespeicherte Daten" defaultOpen={open}>
          <div style={stack}>
            <Callout tone="soft">
              Für Support und Entwicklung. Ein Abgleich von hier ist im Protokoll gekennzeichnet und verschiebt den
              gemerkten Stand nicht.
            </Callout>
            <TechnicalConnection shown={tokenShown} />
            <section style={group}>
              <h3 className="lw-ui-group">Abgleich von Hand</h3>
              <Field label="Umgebung" htmlFor="duo-env" hint="Nur bei entpackt geladenem Plugin wählbar.">
                <Select id="duo-env" defaultValue="production">
                  <option value="production">Produktion</option>
                  <option value="staging">Staging</option>
                  <option value="local">Lokal</option>
                </Select>
              </Field>
              <Field label="Zeitraum von Hand" htmlFor="duo-range" hint="Leer: Ludwig bestimmt den Abrufzeitraum.">
                <DateRangeField id="duo-range" from={range[0]} to={range[1]} onChange={(f, t) => setRange([f, t])} />
              </Field>
              <fieldset style={{ border: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-2)" }}>
                <legend className="lw-ui-group">Schritte</legend>
                {ALL_STEPS.map((k) => (
                  <Checkbox key={k} label={STEP_TEXT[k]} defaultChecked={k !== "handover"} />
                ))}
                <Checkbox label="Probeablage: nur den ersten Ablageort einsortieren" />
              </fieldset>
              <div>
                <Button>Abgleich mit diesen Angaben starten</Button>
              </div>
            </section>
            <section style={group}>
              <h3 className="lw-ui-group">Rohprotokoll</h3>
              <div style={row}>
                <TextButton>Rohprotokoll als Text herunterladen</TextButton>
                <TextButton>Rohprotokoll als JSON herunterladen</TextButton>
              </div>
            </section>
            <StoredData />
          </div>
        </Disclosure>
      </CardSection>
    </Card>
  );
}

/** The confirmation of C5b, open — as ActionButton shows it on click. */
function StoredDataConfirm() {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      onConfirm={() => setOpen(false)}
      title={STORED_TITLE}
      size="sm"
      footer={
        <>
          <Button size="sm" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button size="sm" variant="danger" onClick={() => setOpen(false)}>
            Gespeicherte Daten löschen
          </Button>
        </>
      }
    >
      {STORED_BODY}
    </Dialog>
  );
}

/* ── Pages ───────────────────────────────────────────────────────────── */

function SettingsPage({
  items = ONE_HINT,
  sentence = "1 Punkt braucht Sie.",
  handover = "off",
  diagnosisOpen = false,
  tokenShown = false,
  confirmStored = false,
}: {
  items?: CheckItem[];
  sentence?: string;
  handover?: HandoverDemo;
  diagnosisOpen?: boolean;
  tokenShown?: boolean;
  confirmStored?: boolean;
}) {
  return (
    <ExtensionShell area="settings">
      <ConnectionCard />
      <StepsAndReports handover={handover} />
      <ReadinessCard items={items} sentence={sentence} />
      <Diagnosis open={diagnosisOpen} tokenShown={tokenShown} />
      {confirmStored ? <StoredDataConfirm /> : null}
    </ExtensionShell>
  );
}

const page = "page" as const;

const SETTINGS_STATES: StateSpec[] = [
  {
    id: "C",
    title: "Einstellungen · ein Punkt braucht Sie",
    uses: "Card, CardHead, FieldList, Button, ActionButton (Rückfrage), CheckItems, CopyTextButton, Disclosure",
    missing: "0263, 0266 Switch",
    surface: page,
    render: () => <SettingsPage />,
  },
  {
    id: "C2b",
    title: "Belegübergabe eingeschaltet",
    uses: "Card, CardHead",
    missing: "0263, 0266 Switch",
    surface: page,
    render: () => <SettingsPage handover="on" />,
  },
  {
    id: "C2c",
    title: "Belegübergabe wird gespeichert",
    uses: "Card, CardHead",
    missing: "0263, 0266 Switch, 0268 Spinner",
    surface: page,
    render: () => <SettingsPage handover="saving" />,
  },
  {
    id: "C2d",
    title: "Belegübergabe: Fehler, zurückgesprungen",
    uses: "Card, CardHead",
    missing: "0263, 0266 Switch",
    surface: page,
    render: () => <SettingsPage handover="failed" />,
  },
  {
    id: "C4b",
    title: "Alles bereit, gründlich geprüft",
    uses: "CheckItems",
    missing: "0263",
    surface: page,
    render: () => <SettingsPage items={ALL_READY} sentence="Alles bereit." />,
  },
  {
    id: "C5a",
    title: "Diagnose · Verbindung, technisch · Token verdeckt",
    uses: "Disclosure, FieldList, TextButton, Field + Input (Passwort), ActionButton, Select, DateRangeField, Checkbox, Button",
    missing: "0263",
    surface: page,
    render: () => <SettingsPage diagnosisOpen />,
  },
  {
    id: "C5a-shown",
    title: "Diagnose · Token aufgedeckt",
    uses: "FieldList, RawValue, CopyTextButton, TextButton",
    missing: "0263",
    surface: page,
    render: () => <SettingsPage diagnosisOpen tokenShown />,
  },
];

/** C5b's confirmation is an overlay; it stands as its own story, not on the board. */
const STORED_CONFIRM: StateSpec = {
  id: "C5b",
  title: "Gespeicherte Daten löschen · Rückfrage offen",
  uses: "ActionButton (Rückfrage), Dialog, Button",
  missing: "0263",
  surface: page,
  render: () => <SettingsPage diagnosisOpen confirmStored />,
};

interface Args {
  showDrafts: boolean;
}

const meta: Meta<Args> = {
  title: "Seiten/DUO-Connect/Einstellungen",
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
  const spec = [...SETTINGS_STATES, STORED_CONFIRM].find((s) => s.id === id);
  if (!spec) throw new Error(`unknown state ${id}`);
  return { name: `${spec.id} · ${spec.title}`, render: (args) => wrap(args, <Single spec={spec} />) };
}

/** Every state of the tab „Einstellungen", side by side. */
export const Board: Story = {
  render: (args) =>
    wrap(
      args,
      <StateBoard
        title="Einstellungen — alle Zustände"
        lead="Keine eigene Versionskarte (U8): die Version steht in der Fußzeile und im Prüfpunkt 1. Rückfragen nur bei „Verbindung trennen“, „Gespeicherte Daten löschen“ (eigene Story C5b) und „Alle Protokolle löschen“; alles andere wirkt sofort. Keinen Knopf „Verbindung zurücksetzen“ (U16)."
        states={SETTINGS_STATES}
      />,
    ),
};

export const C00Settings = one("C");
export const C02bHandoverOn = one("C2b");
export const C02cHandoverSaving = one("C2c");
export const C02dHandoverFailed = one("C2d");
export const C04bAllReady = one("C4b");
export const C05aTokenHidden = one("C5a");
export const C05aTokenShown = one("C5a-shown");
export const C05bStoredDataConfirm = one("C5b");
