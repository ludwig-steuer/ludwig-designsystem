import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../primitives/Button";
import { Callout } from "../primitives/Callout";
import { Progress } from "../primitives/Progress";
import { Card, CardHead, CardSection } from "../primitives/Table";
import { PhaseProgress, type PhaseProgressItem } from "./PhaseProgress";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof PhaseProgress> = {
  title: "v3/Patterns/Prozess/PhaseProgress",
  component: PhaseProgress,
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof PhaseProgress>;

/* The user's words of the four steps (ludwig-plugin docs/begriffe.md). */
const FILE = "Gebuchte Belege in DATEV einsortieren";
const FETCH = "Neue Belege aus DATEV holen";
const HANDOVER = "Belege aus Ludwig an DATEV übergeben";
const ACCOUNTS = "Kontoumsätze aus DATEV holen";

const LABEL = "Fortschritt des Abgleichs Musterfirma GmbH";

/** A width like the page column of the extension (720 px less the card's padding). */
const column = { maxWidth: "var(--container-narrow)" } as const;

function Caption({ children }: { children: ReactNode }) {
  return (
    <div className="lw-ui-hint" style={{ margin: "var(--space-4) 0 var(--space-1)" }}>
      {children}
    </div>
  );
}

/* ── States ───────────────────────────────────────────────────────────── */

const RUNNING: PhaseProgressItem[] = [
  { key: "ablage", label: FILE, status: "done", note: "4 Ablageorte" },
  { key: "belege", label: FETCH, status: "active", count: { done: 37, total: 120, unit: "Beleg" } },
  { key: "kontoauszuege", label: ACCOUNTS, status: "pending" },
];

/** A7: the run is in the document fetch; the hand-over is switched off and not passed (U6). */
export const Running: Story = {
  args: { phases: RUNNING, label: LABEL },
  render: (args) => (
    <div style={column}>
      <PhaseProgress {...args} />
    </div>
  ),
};

/** Loading: the first step runs without a known quantity — the gliding piece. */
export const Starting: Story = {
  args: {
    label: LABEL,
    phases: [
      { key: "ablage", label: FILE, status: "active", note: "DATEV wird geöffnet …" },
      { key: "belege", label: FETCH, status: "pending" },
      { key: "kontoauszuege", label: ACCOUNTS, status: "pending" },
    ],
  },
  render: (args) => (
    <div style={column}>
      <PhaseProgress {...args} />
    </div>
  ),
};

/** A9: the run waits for the DATEV login — the sentence instead of the number, the bar stands. */
export const WaitingForLogin: Story = {
  args: {
    label: LABEL,
    phases: [
      { key: "ablage", label: FILE, status: "done", note: "4 Ablageorte" },
      { key: "belege", label: FETCH, status: "held", count: { done: 37, total: 120, unit: "Beleg" }, note: "wartet auf Anmeldung" },
      { key: "kontoauszuege", label: ACCOUNTS, status: "pending" },
    ],
  },
  render: (args) => (
    <div style={column}>
      <PhaseProgress {...args} />
    </div>
  ),
};

/** Error: the fetch failed at 37 of 120; what follows stays open. */
export const Failed: Story = {
  args: {
    label: LABEL,
    phases: [
      { key: "ablage", label: FILE, status: "done", note: "4 Ablageorte" },
      { key: "belege", label: FETCH, status: "failed", count: { done: 37, total: 120, unit: "Beleg" }, note: "DATEV-Sitzung abgelaufen" },
      { key: "kontoauszuege", label: ACCOUNTS, status: "pending" },
    ],
  },
  render: (args) => (
    <div style={column}>
      <PhaseProgress {...args} />
    </div>
  ),
};

/* ── Every row of the mapping table, regular and compact ─────────────── */

const MAPPING: { caption: string; phases: PhaseProgressItem[] }[] = [
  { caption: "offen", phases: [{ key: "a", label: FETCH, status: "pending" }] },
  { caption: "läuft ohne Menge", phases: [{ key: "a", label: FETCH, status: "active", note: "Export wird abgewartet …" }] },
  { caption: "läuft mit Menge", phases: [{ key: "a", label: FETCH, status: "active", count: { done: 37, total: 120, unit: "Beleg" } }] },
  { caption: "wartet auf Anmeldung", phases: [{ key: "a", label: FETCH, status: "held", count: { done: 37, total: 120, unit: "Beleg" }, note: "wartet auf Anmeldung" }] },
  { caption: "fertig", phases: [{ key: "a", label: FETCH, status: "done", note: "12 übertragen, 47 schon in Ludwig" }] },
  { caption: "Problem", phases: [{ key: "a", label: FETCH, status: "done", issue: "9 übertragen, 3 nicht übertragen" }] },
  { caption: "abgebrochen, Stufe Fehler", phases: [{ key: "a", label: FETCH, status: "failed", count: { done: 37, total: 120, unit: "Beleg" }, note: "Ludwig nicht erreichbar" }] },
  { caption: "abgebrochen, Stufe Warnung", phases: [{ key: "a", label: FETCH, status: "held", count: { done: 37, total: 120, unit: "Beleg" }, note: "Seite geschlossen" }] },
  { caption: "nicht ausgeführt", phases: [{ key: "a", label: ACCOUNTS, status: "pending", note: "nicht ausgeführt" }] },
  {
    caption: "alle erledigt",
    phases: [
      { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
      { key: "belege", label: FETCH, status: "done", note: "12 übertragen, 47 schon in Ludwig" },
      { key: "kontoauszuege", label: ACCOUNTS, status: "done", note: "2 Konten" },
    ],
  },
  {
    caption: "alle erledigt, einer mit Problem",
    phases: [
      { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
      { key: "belege", label: FETCH, status: "done", issue: "9 übertragen, 3 nicht übertragen" },
      { key: "kontoauszuege", label: ACCOUNTS, status: "done", note: "2 Konten" },
    ],
  },
];

/** Every row of the mapping table (0265) in `regular` beside `compact`; only „alle erledigt" turns the short strip green. */
export const Statuses: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2fr)", gap: "var(--space-2) var(--space-8)", maxWidth: "var(--container-base)" }}>
      <div className="lw-ui-section">regular</div>
      <div className="lw-ui-section">compact</div>
      {MAPPING.map((m) => (
        <div key={m.caption} style={{ display: "contents" }}>
          <div>
            <Caption>{m.caption}</Caption>
            <PhaseProgress phases={m.phases} label={`Beispiel ${m.caption}`} />
          </div>
          <div>
            <Caption>{m.caption}</Caption>
            <PhaseProgress phases={m.phases} label={`Beispiel ${m.caption}, kurz`} density="compact" />
          </div>
        </div>
      ))}
    </div>
  ),
};

/* ── End state as the result list (Nachtrag 2, A10–A12) ──────────────── */

const LAST_RUNNING: PhaseProgressItem[] = [
  { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
  { key: "belege", label: FETCH, status: "done", note: "12 übertragen, 47 schon in Ludwig" },
  { key: "kontoauszuege", label: ACCOUNTS, status: "active", count: { done: 2, total: 3, unit: "Konto" } },
];
const A10: PhaseProgressItem[] = [
  { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
  { key: "belege", label: FETCH, status: "done", note: "12 übertragen, 47 schon in Ludwig" },
  { key: "kontoauszuege", label: ACCOUNTS, status: "done", note: "2 Konten" },
];
const A11: PhaseProgressItem[] = [
  { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
  { key: "belege", label: FETCH, status: "done", issue: "9 übertragen, 3 nicht übertragen" },
  { key: "kontoauszuege", label: ACCOUNTS, status: "done", note: "2 Konten" },
];
const A12_HELD: PhaseProgressItem[] = [
  { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
  { key: "belege", label: FETCH, status: "held", count: { done: 37, total: 120, unit: "Beleg" }, note: "Seite geschlossen" },
  { key: "kontoauszuege", label: ACCOUNTS, status: "pending", note: "nicht ausgeführt" },
];
const A12_FAILED: PhaseProgressItem[] = [
  { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
  { key: "belege", label: FETCH, status: "failed", count: { done: 37, total: 120, unit: "Beleg" }, note: "Ludwig nicht erreichbar" },
  { key: "kontoauszuege", label: ACCOUNTS, status: "pending", note: "nicht ausgeführt" },
];

function FinishedDemo() {
  const [over, setOver] = useState(false);
  return (
    <div style={{ display: "grid", gap: "var(--space-2)", ...column }}>
      <Caption>Übergang: letzter laufender Stand → Endzustand (dieselben Zeilen, nur die Spur fällt weg)</Caption>
      <div>
        <Button size="sm" onClick={() => setOver((v) => !v)}>
          {over ? "Letzten laufenden Stand zeigen" : "Abgleich beenden"}
        </Button>
      </div>
      <div data-testid="transition">
        <PhaseProgress phases={over ? A10 : LAST_RUNNING} label={LABEL} />
      </div>
      <Caption>A10 · alles gut</Caption>
      <PhaseProgress phases={A10} label={LABEL} />
      <Caption>A11 · mit Problemen</Caption>
      <PhaseProgress phases={A11} label={LABEL} />
      <Caption>A12 · abgebrochen, Seite geschlossen (Warnung)</Caption>
      <PhaseProgress phases={A12_HELD} label={LABEL} />
      <Caption>A12 · abgebrochen, Ludwig nicht erreichbar (Fehler)</Caption>
      <PhaseProgress phases={A12_FAILED} label={LABEL} />
    </div>
  );
}

/** The end state is the result list: check or warning, the result on the right, silent from the first render. */
export const Finished: Story = { render: () => <FinishedDemo /> };

/* ── Live: a whole run, the announcements logged ──────────────────────── */

/** The frames of one run: what the plugin's run object would say, tick by tick. */
function frames(): PhaseProgressItem[][] {
  const out: PhaseProgressItem[][] = [];
  const file = (s: PhaseProgressItem["status"], extra: Partial<PhaseProgressItem> = {}): PhaseProgressItem => ({ key: "ablage", label: FILE, status: s, ...extra });
  const fetch = (s: PhaseProgressItem["status"], extra: Partial<PhaseProgressItem> = {}): PhaseProgressItem => ({ key: "belege", label: FETCH, status: s, ...extra });
  const acc = (s: PhaseProgressItem["status"], extra: Partial<PhaseProgressItem> = {}): PhaseProgressItem => ({ key: "kontoauszuege", label: ACCOUNTS, status: s, ...extra });
  out.push([file("active", { note: "DATEV wird geöffnet …" }), fetch("pending"), acc("pending")]);
  for (let i = 1; i <= 4; i++) out.push([file("active", { count: { done: i, total: 4, unit: "Ablageort" } }), fetch("pending"), acc("pending")]);
  const filed = file("done", { note: "4 Belege einsortiert" });
  out.push([filed, fetch("active", { note: "Export wird abgewartet …" }), acc("pending")]);
  for (let i = 20; i <= 60; i += 20) out.push([filed, fetch("active", { count: { done: i, total: 120, unit: "Beleg" } }), acc("pending")]);
  out.push([filed, fetch("held", { count: { done: 60, total: 120, unit: "Beleg" }, note: "wartet auf Anmeldung" }), acc("pending")]);
  out.push([filed, fetch("held", { count: { done: 60, total: 120, unit: "Beleg" }, note: "wartet auf Anmeldung" }), acc("pending")]);
  for (let i = 80; i <= 120; i += 20) out.push([filed, fetch("active", { count: { done: i, total: 120, unit: "Beleg" } }), acc("pending")]);
  const fetched = fetch("done", { note: "12 übertragen, 47 schon in Ludwig" });
  for (let i = 1; i <= 3; i++) out.push([filed, fetched, acc("active", { count: { done: i, total: 3, unit: "Konto" } })]);
  out.push([filed, fetched, acc("done", { note: "2 Konten" })]);
  return out;
}

function LiveDemo() {
  const script = useRef(frames());
  const [tick, setTick] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [heights, setHeights] = useState<number[]>([]);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tick >= script.current.length - 1) return;
    const t = window.setTimeout(() => setTick((n) => n + 1), 700);
    return () => window.clearTimeout(t);
  }, [tick]);

  useEffect(() => {
    const region = host.current?.querySelector('[role="status"]');
    if (!region) return;
    const seen = () => setLog((l) => [...l, region.textContent || "(leer)"]);
    const mo = new MutationObserver(seen);
    mo.observe(region, { childList: true, characterData: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const h = host.current?.querySelector(".v3phase")?.getBoundingClientRect().height;
    if (h !== undefined) setHeights((l) => [...l, Math.round(h * 100) / 100]);
  }, [tick]);

  const phases = script.current[Math.min(tick, script.current.length - 1)] ?? [];
  return (
    <div style={{ display: "grid", gap: "var(--space-3)", ...column }}>
      <div ref={host}>
        <PhaseProgress phases={phases} label={LABEL} />
      </div>
      <div>
        <Button
          size="sm"
          onClick={() => {
            setLog([]);
            setHeights([]);
            setTick(0);
          }}
        >
          Neu starten
        </Button>
      </div>
      <Caption>
        Takt {tick + 1} von {script.current.length} · Änderungen der Ansage: {log.length}
      </Caption>
      <ol className="lw-ui-hint" data-testid="announcements" style={{ margin: 0, paddingLeft: "var(--space-5)" }}>
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ol>
      <Caption>Höhe je Takt (px): {heights.join(" · ")}</Caption>
    </div>
  );
}

/** A run through every step: the announcement changes only with the step or its note, never with a number. */
export const Live: Story = { render: () => <LiveDemo /> };

/* ── Narrow, in use, edge ─────────────────────────────────────────────── */

const LONG: PhaseProgressItem[] = [
  { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
  { key: "upload", label: HANDOVER, status: "active", count: { done: 1234, total: 12480, unit: "Beleg" } },
  { key: "kontoauszuege", label: ACCOUNTS, status: "pending" },
];

/** 320 px: the words wrap, the right column stays whole, nothing scrolls sideways — regular and compact. */
export const Narrow: Story = {
  render: () => (
    <div style={{ width: "calc(var(--space-20) * 4)", display: "grid", gap: "var(--space-4)" }} data-testid="narrow">
      <PhaseProgress phases={LONG} label={LABEL} />
      <PhaseProgress phases={LONG} label={`${LABEL}, kurz`} density="compact" />
    </div>
  ),
};

const CLIENTS: { name: string; state: string; result: string }[] = [
  { name: "Musterfirma GmbH", state: "succeeded", result: "12 Belege übertragen" },
  { name: "Bäckerei Schneider e.K.", state: "succeeded_with_issues", result: "3 Belege nicht übertragen" },
  { name: "Elektro Wagner GmbH & Co. KG", state: "running", result: "" },
  { name: "Praxis Dr. Hoffmann", state: "queued", result: "" },
];

/** A7 and A8 as on the page: the single run in its card; the pass with the overall bar, the block „Jetzt" in short form and the client rows. */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 22rem), 1fr))", gap: "var(--space-6)", alignItems: "start" }}>
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <Callout>Lassen Sie diese Seite und das DATEV-Fenster geöffnet, bis der Abgleich fertig ist.</Callout>
        <Card>
          <CardHead title="Musterfirma GmbH wird abgeglichen" sub="Gestartet 09:11" />
          <CardSection>
            <PhaseProgress phases={RUNNING} label={LABEL} />
          </CardSection>
        </Card>
      </div>
      <Card>
        <CardHead title="Alle Mandanten werden abgeglichen" />
        <CardSection>
          <Progress done={3} total={12} label="Mandant 3 von 12" size="sm" />
        </CardSection>
        <CardSection>
          <div className="lw-ui-section" style={{ marginBottom: "var(--space-2)" }}>
            Jetzt: Elektro Wagner GmbH & Co. KG
          </div>
          <PhaseProgress phases={RUNNING} label="Fortschritt des Abgleichs Elektro Wagner GmbH & Co. KG" density="compact" />
        </CardSection>
        <CardSection>
          {/* The running client is not drawn a second time as PhaseProgress: one region speaks. */}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-2)" }}>
            {CLIENTS.map((c) => (
              <li key={c.name} style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "var(--space-1) var(--space-3)", alignItems: "baseline" }}>
                <span>{c.name}</span>
                <StatusBadge axis="duo_sync" status={c.state} info={false} />
                {c.result ? (
                  <span className="lw-ui-hint" style={{ gridColumn: "1 / -1" }}>
                    {c.result}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </CardSection>
      </Card>
    </div>
  ),
};

/** Edges: large counts, total 0, done above total, a long note, three steps beside four, and `[]`. */
export const Edge: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-2)", ...column }}>
      <Caption>große Mengen</Caption>
      <PhaseProgress phases={LONG} label="Große Mengen" />
      <Caption>total 0 → keine Menge, gleitendes Stück</Caption>
      <PhaseProgress phases={[{ key: "belege", label: FETCH, status: "active", count: { done: 0, total: 0, unit: "Beleg" } }]} label="Ohne Menge" />
      <Caption>done über total → voller Balken, Zahl begrenzt</Caption>
      <PhaseProgress phases={[{ key: "belege", label: FETCH, status: "active", count: { done: 130, total: 120, unit: "Beleg" } }]} label="Über der Menge" />
      <Caption>lange Notiz rechts</Caption>
      <PhaseProgress
        phases={[{ key: "belege", label: FETCH, status: "failed", note: "DATEV hat die Liste nicht geliefert, die Anfrage lief nach zwei Minuten ab" }]}
        label="Lange Notiz"
      />
      <Caption>vier Schritte (Belegübergabe eingeschaltet)</Caption>
      <PhaseProgress
        phases={[
          { key: "ablage", label: FILE, status: "done", note: "4 Belege einsortiert" },
          { key: "belege", label: FETCH, status: "done", note: "12 übertragen, 47 schon in Ludwig" },
          { key: "upload", label: HANDOVER, status: "active", count: { done: 2, total: 5, unit: "Beleg" } },
          { key: "kontoauszuege", label: ACCOUNTS, status: "pending" },
        ]}
        label="Vier Schritte"
      />
      <Caption>leer: phases=[] rendert nichts</Caption>
      <div data-testid="empty">
        <PhaseProgress phases={[]} label="Leer" />
      </div>
    </div>
  ),
};
