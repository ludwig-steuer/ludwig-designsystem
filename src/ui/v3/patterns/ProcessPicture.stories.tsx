import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type ReactNode } from "react";
import { Button } from "../primitives/Button";
import type { BatonMeta, ProcessPhase, ProcessPhaseStatus } from "./Process";
import {
  ProcessBox,
  ProcessCell,
  ProcessDialog,
  type ProcessDialogDetail,
  type ProcessPicture,
} from "./ProcessPicture";

const meta: Meta<typeof ProcessCell> = { title: "v3/Patterns/Prozess/ProcessPicture", component: ProcessCell };
export default meta;
type Story = StoryObj<typeof ProcessCell>;

const AGENT: BatonMeta = { key: "agent", label: "Agent", color: "var(--color-accent-700)" };
const LUDWIG: BatonMeta = { key: "ludwig", label: "Ludwig", color: "var(--color-text-muted)" };
const FIRM: BatonMeta = { key: "kanzlei", label: "Kanzlei", color: "var(--color-primary)" };
const NOBODY: BatonMeta = { key: "niemand", label: "niemand", color: "var(--color-text-subtle)" };

const LABELS = ["Eingang", "Auslesen", "Buchen", "Prüfen", "DATEV"];

/** n phases, the one at `at` with `status`, before it done, after it pending. */
function phases(n: number, at: number, status: ProcessPhaseStatus = "active", note?: string): ProcessPhase[] {
  return LABELS.slice(0, n).map((label, i) => ({
    key: label,
    label,
    sub: "",
    states: [],
    status: i < at ? "done" : i === at ? status : "pending",
    ...(i === at && note ? { note } : {}),
  }));
}

const pic = (p: Partial<ProcessPicture> & Pick<ProcessPicture, "phases" | "headline">): ProcessPicture => ({
  level: "none",
  holder: AGENT,
  next: null,
  ...p,
});

const CELLS: ProcessPicture[] = [
  pic({ phases: phases(5, 2), headline: "Bereit zur Buchung" }),
  pic({ phases: phases(5, 3), headline: "Vorgeschlagen", holder: FIRM }),
  pic({ phases: phases(5, 1, "held", "Werte fehlen"), headline: "Werte fehlen", level: "warning" }),
  pic({ phases: phases(5, 1, "failed", "Auslese abgebrochen"), headline: "Auslese abgebrochen", level: "error" }),
  pic({ phases: phases(5, 5), headline: "In DATEV", holder: NOBODY }),
  pic({ phases: phases(3, 3), headline: "Keine Buchung nötig", holder: NOBODY }),
  pic({ phases: phases(2, 1), headline: "Wird ausgelesen", level: "info", holder: LUDWIG }),
  pic({ phases: phases(1, 1), headline: "Über Import erledigt", holder: NOBODY }),
  pic({ phases: [], headline: "Gelöscht", holder: NOBODY }),
];

const c = (i: number) => CELLS[i]!;

const Column = ({ children }: { children: ReactNode }) => (
  <div style={{ display: "grid", gap: "var(--space-2)", width: "20rem" }}>{children}</div>
);

/** One to five segments, all five phase states: the bar is always as wide, the words shorten. */
export const Cells: Story = {
  render: () => (
    <Column>
      {CELLS.map((p, i) => (
        <ProcessCell key={i} picture={p} onOpen={() => {}} />
      ))}
    </Column>
  ),
};

/** Dense tables drop the holder; the word of the state stays. */
export const CellNarrow: Story = {
  render: () => (
    <Column>
      {CELLS.slice(0, 5).map((p, i) => (
        <ProcessCell key={i} picture={p} density="narrow" onOpen={() => {}} />
      ))}
    </Column>
  ),
};

/** Loading: a skeleton in line height. Failed: the word, not an empty cell. */
export const CellStates: Story = {
  render: () => (
    <Column>
      <ProcessCell picture={c(0)} loading />
      <ProcessCell picture={c(0)} error="Fortschritt nicht ermittelt" />
    </Column>
  ),
};

/** Without `onOpen` (print, nested drawer): no hover, no focus, no target. */
export const NotInteractive: Story = {
  render: () => (
    <Column>
      <ProcessCell picture={c(0)} />
      <ProcessBox picture={{ ...c(0), next: "Die Kanzlei prüft die Buchung." }} />
    </Column>
  ),
};

const BOX_RUNNING = pic({
  phases: phases(5, 1),
  headline: "Wird ausgelesen",
  level: "info",
  holder: LUDWIG,
  running: { since: "seit 40 s", live: true },
  next: "Der Agent ordnet den Beleg einem Sachverhalt zu.",
});

/** Three lines and two lines at the same height; running with its time; held with sign and word. */
export const Boxes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", width: "24rem" }}>
      <ProcessBox picture={BOX_RUNNING} onOpen={() => {}} />
      <ProcessBox
        picture={{ ...c(2), next: "Sind die Werte ergänzt, ist der Beleg bereit zur Buchung." }}
        onOpen={() => {}}
      />
      <ProcessBox picture={c(4)} onOpen={() => {}} />
    </div>
  ),
};

/** 200 % zoom: a 640-px frame at 1280 — the box shrinks with it, nothing runs out. */
export const BoxZoom: Story = {
  render: () => (
    <div style={{ width: "20rem", border: "1px dashed var(--color-border)" }}>
      <ProcessBox picture={BOX_RUNNING} onOpen={() => {}} />
    </div>
  ),
};

const LONG_NOTE =
  "Der Agent hat die Rechnung an die Kanzlei gegeben: Der Leistungszeitraum fehlt, die USt-IdNr. des Lieferanten ist nicht lesbar, und der Betrag weicht um 0,12 € von der Summe der Positionen ab. Bitte prüfen Sie, ob eine Teillieferung vorliegt, und ergänzen Sie die fehlenden Angaben am Beleg, damit gebucht werden kann.";

const HELD = pic({
  phases: phases(5, 1, "held", "Kanzlei prüft"),
  headline: "Kanzlei prüft",
  level: "warning",
  holder: FIRM,
  next: "Nach Ihrer Entscheidung bucht der Agent.",
});

const detail = (history: ProcessDialogDetail["history"]): ProcessDialogDetail => ({
  title: "RE-2026-0815 · Musterbau Schneider Bauunternehmung GmbH & Co. KG, Niederlassung Süd",
  pathLabel: "Weg einer Rechnung",
  explanation: "Der Agent konnte den Beleg nicht allein klären.",
  reason: "Vom Agenten übergeben",
  note: LONG_NOTE,
  phaseSince: { Eingang: "12.09." },
  steps: [
    { phase: "Eingang", label: "Datei angekommen", status: "done", at: "12.09.2026 09:14", actor: "Mandant" },
    { phase: "Eingang", label: "Dateikorb freigegeben", status: "done", at: "12.09.2026 09:14", actor: "Mandant" },
    { phase: "Auslesen", label: "Einordnen", status: "done", at: "12.09.2026 09:15", actor: "Ludwig" },
    {
      phase: "Auslesen",
      label: "Auslesen",
      status: "done",
      at: "12.09.2026 09:16",
      actor: "Ludwig",
      sub: [
        { label: "Eingeordnet", status: "done" },
        { label: "Ausgelesen", status: "done" },
        { label: "Aufbereitet", status: "done" },
        { label: "Gedeutet", status: "done" },
      ],
    },
    { phase: "Auslesen", label: "Werte prüfen", status: "held", actor: "Kanzlei", note: "Leistungszeitraum fehlt" },
    { phase: "Buchen", label: "Sachverhalt zuordnen", status: "pending", actor: "Agent" },
    { phase: "Buchen", label: "Buchung vorschlagen", status: "pending", actor: "Agent" },
    { phase: "Prüfen", label: "Buchung prüfen", status: "pending", actor: "Kanzlei" },
    { phase: "DATEV", label: "An DATEV übergeben", status: "pending" },
    { phase: "DATEV", label: "In DATEV bestätigt", status: "pending" },
  ],
  loops: { reopened: 1, returned: 0 },
  history,
  historyHref: "#tab=history",
  technical: [
    ["status", "human_review"],
    ["review_reason", "open_findings"],
    ["processing_stage", "interpreted"],
    ["job", "—"],
  ],
  links: [
    { label: "Zum Sachverhalt 2026-0334", href: "#case" },
    { label: "Zum Stapel 2026-0009", href: "#batch" },
  ],
});

function Opener({ label, d }: { label: string; d: ProcessDialogDetail }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <ProcessDialog open={open} onClose={() => setOpen(false)} picture={HELD} detail={d} />
    </>
  );
}

/** Longest texts: note of 300 characters, a long name, five phases, loops. Open from the start. */
export const DialogFull: Story = {
  render: () => <ProcessDialog open onClose={() => {}} picture={HELD} detail={detail([])} />,
};

/** The three cases of the history: filled · empty with a way to the tab · failed with retry. */
export const DialogHistory: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-3)" }}>
      <Opener
        label="Verlauf gefüllt"
        d={detail([
          { id: "1", at: "2026-09-12T09:14:00+02:00", message: "Datei angekommen", level: "info", actor: { kind: "user", label: "Mandant" } },
          { id: "2", at: "2026-09-13T08:02:00+02:00", message: "An die Kanzlei übergeben: Werte fehlen", level: "warning", actor: { kind: "agent", label: "Agent" } },
        ])}
      />
      <Opener label="Verlauf leer" d={detail([])} />
      <Opener label="Verlauf nicht geladen" d={{ ...detail("error"), onRetryHistory: () => {} }} />
    </div>
  ),
};
