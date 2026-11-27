import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo, useState, type ReactNode } from "react";
import type { DuoSyncState } from "@/ludwig/modules/intake";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import {
  ActionIcon,
  Badge,
  Button,
  Callout,
  Card,
  CardHead,
  CardSection,
  CheckItems,
  Combobox,
  DateField,
  DateRange,
  Disclosure,
  ExpandableRow,
  Field,
  FilterChips,
  GroupRow,
  HeadRow,
  Input,
  Link,
  LogList,
  PhaseProgress,
  ProblemCard,
  Progress,
  RadioGroup,
  Row,
  SearchInput,
  SelectCell,
  Spinner,
  StateIcon,
  StatusBadge,
  StatusCallout,
  StatusInfoButton,
  StepRail,
  Table,
  TextButton,
  Time,
  type ChipOption,
  type CheckItem,
  type ComboboxOption,
  type PhaseProgressItem,
  type RailItem,
} from "@/ui/v3";
import {
  ACTIVE_STEPS,
  BATCH_DONE,
  BATCH_RUNNING,
  CLIENTS,
  LOG,
  MANY_BATCH,
  MANY_CLIENTS,
  NOW,
  READINESS,
  RESULT_ROWS,
  STEP_TEXT,
  type BatchRow,
  type Client,
  type StepKey,
} from "./fixtures";
import { SupportHelp, supportFacts } from "./support";
import { Board as StateBoard, ExtensionShell, Single, type StateSpec } from "./Frame";

/* ── Shared pieces ─────────────────────────────────────────────────────── */

const stack = { display: "grid", gap: "var(--space-4)" } as const;
const row = { display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" } as const;

function clientLabel(c: Client): string {
  return c.datevNumber ? `${c.name} · ${c.datevNumber}` : c.name;
}

/** The word of a state of the axis `duo_sync`, from the registry. */
function word(state: DuoSyncState): string {
  return resolveStatus("duo_sync", state).label;
}

/** Search by name **or** DATEV number: the number sits in the label. */
function ClientPicker({ initial, clients = CLIENTS }: { initial: string | null; clients?: Client[] }) {
  const [value, setValue] = useState<string | null>(initial);
  const options: ComboboxOption[] = clients.map((c) => ({
    value: c.id,
    label: clientLabel(c),
    hint: c.skipReason ?? undefined,
  }));
  return (
    <Combobox
      label="Mandant"
      value={value}
      onChange={setValue}
      options={options}
      placeholder="Name oder DATEV-Mandantennummer"
    />
  );
}

/** One line instead of every step (owner 2026-11-27); the handover is off by default. */
function StepsLine() {
  const all = ACTIVE_STEPS.includes("handover");
  return (
    <p className="lw-ui-hint">
      {all ? "Alle Schritte" : "Alle Schritte, ohne Belegübergabe"} ·{" "}
      <TextButton href="#einstellungen">Schritte ändern</TextButton>
    </p>
  );
}

function LastRun() {
  return (
    <p className="lw-ui-hint" style={row}>
      <span>Zuletzt:</span>
      <Time value={NOW} size="sm" />
      <StatusBadge axis="duo_sync" status="succeeded" />
      <span>12 Belege übertragen</span>
    </p>
  );
}

function ReadyCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardHead
        title="Abgleichen"
        sub="Holt neue Belege und Kontoumsätze aus DATEV und sortiert gebuchte Belege ein."
      />
      <CardSection>
        <div style={stack}>{children}</div>
      </CardSection>
    </Card>
  );
}

const KEEP_OPEN = (
  <Callout>Lassen Sie diese Seite und das DATEV-Fenster geöffnet, bis der Abgleich fertig ist.</Callout>
);

/** The warning sign of a sentence callout — the tone's sign, never without the word. */
const WARNING_SIGN = <StateIcon state="warning" />;

/* ── Steps of a sync (0265): one helper for every state ──────────────── */

type PhaseExtra = Pick<PhaseProgressItem, "count" | "note" | "issue">;

function phase(key: StepKey, status: PhaseProgressItem["status"], extra: PhaseExtra = {}): PhaseProgressItem {
  return { key, label: STEP_TEXT[key], status, ...extra };
}

const AT_37 = { done: 37, total: 120, unit: "Beleg" };

const PHASES_RUNNING: PhaseProgressItem[] = [
  phase("filing", "done", { note: "4 Belege einsortiert" }),
  phase("fetch", "active", { count: AT_37 }),
  phase("accounts", "pending"),
];

/* The same rows as during the run, in their end state (owner 2026-11-27). */
const PHASES_OK: PhaseProgressItem[] = [
  phase("filing", "done", { note: "4 Belege einsortiert" }),
  phase("fetch", "done", { note: "12 übertragen, 47 schon in Ludwig" }),
  phase("accounts", "done", { note: "2 Konten" }),
];

const PHASES_ISSUES: PhaseProgressItem[] = [
  phase("filing", "done", { note: "4 Belege einsortiert" }),
  phase("fetch", "done", { issue: "9 übertragen, 3 nicht übertragen" }),
  phase("accounts", "done", { note: "2 Konten" }),
];

/** A cancel stands where it happened: `held` for a warning cause, `failed` for an error (0265). */
function phasesCancelled(at: "held" | "failed"): PhaseProgressItem[] {
  return [
    phase("filing", "done", { note: "4 Belege einsortiert" }),
    phase("fetch", at, { count: AT_37 }),
    phase("accounts", "pending", { note: "nicht ausgeführt" }),
  ];
}

/* ── Setup ─────────────────────────────────────────────────────────────── */

function setupSteps(current: "connect" | "check"): RailItem[] {
  return [
    { key: "connect", index: 1, label: "Verbinden", tone: current === "connect" ? "open" : "done", counterText: null, href: null, current: current === "connect" },
    { key: "check", index: 2, label: "Prüfen", tone: "open", counterText: null, href: null, current: current === "check" },
    { key: "done", index: 3, label: "Fertig", tone: "open", counterText: null, href: null },
  ];
}

function TokenField() {
  return (
    <div style={stack}>
      <Field
        label="Token"
        htmlFor="duo-token"
        hint="Das Token erzeugt die Administration in Ludwig. Ein neues Token ersetzt ein gespeichertes."
      >
        <Input id="duo-token" type="password" autoComplete="off" spellCheck={false} />
      </Field>
      <div>
        <Button size="sm">Token speichern</Button>
      </div>
    </div>
  );
}

function ConnectCard({ again }: { again?: boolean }) {
  return (
    <Card>
      <CardHead title="Mit Ludwig verbinden" />
      <CardSection>
        <div style={stack}>
          <p className="lw-ui-text">
            Verbinden Sie das Plugin einmal mit Ihrem Ludwig-Zugang. Ein neuer Tab öffnet sich; dort bestätigen Sie mit
            „Verbinden“.
          </p>
          <div>
            <Button variant="primary">{again ? "Neu verbinden" : "Mit Ludwig verbinden"}</Button>
          </div>
          <Disclosure summary="Token von Hand eintragen" tone="quiet">
            <TokenField />
          </Disclosure>
        </div>
      </CardSection>
    </Card>
  );
}

const A1 = () => (
  <ExtensionShell area="sync">
    <StepRail ariaLabel="Einrichtung" layout="bar" items={setupSteps("connect")} />
    <ConnectCard />
  </ExtensionShell>
);

const A1b = () => (
  <ExtensionShell area="sync">
    <StepRail ariaLabel="Einrichtung" layout="bar" items={setupSteps("connect")} />
    <Card>
      <CardHead title="Mit Ludwig verbinden" />
      <CardSection>
        <div style={stack}>
          <Spinner label="Warten auf Ihre Bestätigung in Ludwig …" />
          <p className="lw-ui-text">
            Bitte bestätigen Sie im Ludwig-Tab mit „Verbinden“. Der Tab schließt sich danach von selbst, und es geht hier
            weiter.
          </p>
          <div style={row}>
            <Button>Ludwig-Tab zeigen</Button>
            <Button variant="tertiary">Erneut verbinden</Button>
          </div>
          <p className="lw-ui-hint">
            Den Anmeldelink in einem anderen Browser geöffnet? Dann klicken Sie hier auf „Erneut verbinden“.
          </p>
        </div>
      </CardSection>
    </Card>
  </ExtensionShell>
);

/** C6 while it runs: every point in its place, the running ones with the spinner (0270). */
const CHECKING: CheckItem[] = READINESS.filter((p) => p.code !== "BP-07").map((p): CheckItem => {
  const done: Record<string, string> = {
    "BP-01": "Version 0.11.0 ist aktuell.",
    "BP-02": "Ludwig antwortet.",
    "BP-03": "Verbunden als Anna Berger.",
    "BP-04": "12 Mandanten, 10 mit DATEV-Mandantennummer.",
    "BP-09": "Vom Server geladen.",
    "BP-10": "Diese Seite ist die einzige.",
  };
  const reason = done[p.code];
  return reason
    ? { code: p.code, question: p.question, reason, state: "green" }
    : { code: p.code, question: p.question, reason: "", state: "running" };
});

const A1c = () => (
  <ExtensionShell area="sync">
    <StepRail ariaLabel="Einrichtung" layout="bar" items={setupSteps("check")} />
    <Card>
      <CardHead title="Alles bereit?" sub="Wird geprüft · 6 von 9 Punkten fertig" />
      <CheckItems items={CHECKING} live />
      <CardSection>
        <div style={row}>
          <Button variant="primary" disabled>
            Weiter zum Abgleich
          </Button>
          <span className="lw-ui-hint">Möglich, sobald kein Punkt einen Fehler zeigt.</span>
        </div>
      </CardSection>
    </Card>
  </ExtensionShell>
);

const A2 = () => (
  <ExtensionShell area="sync" mark="dot">
    <Callout tone="warning">
      <strong>Verbindung abgelaufen.</strong> Eine Verbindung gilt 365 Tage; diese endete am 26.11.2026. Verbinden Sie
      das Plugin neu, Ihre Einstellungen bleiben erhalten.
    </Callout>
    <ConnectCard again />
  </ExtensionShell>
);

const A3 = () => (
  <ExtensionShell area="sync" mark="alarm">
    <ProblemCard
      resolution="user"
      title="Ludwig DUO-Connect ist zu alt."
      cause="Installiert ist Version 0.10.1, Ludwig verlangt mindestens 0.11.0. Bis dahin ist der Abgleich gesperrt."
      step="Die Erweiterung aktualisiert sich meist von selbst; sonst öffnen Sie die Erweiterungen des Browsers und wählen „Aktualisieren“."
      action={<Button variant="primary" size="sm">Anleitung öffnen</Button>}
    />
  </ExtensionShell>
);

/* ── Ready ─────────────────────────────────────────────────────────────── */

/**
 * A4–A6, A14 (owner 2026-11-27): the choice is always in sight — „Ein Mandant"
 * with the search under it, or „Alle Mandanten" with the count and the list.
 * The button names what the choice will do.
 */
function ReadyChoice({
  initial,
  client = "c01",
  clients = CLIENTS,
  openList = false,
  extra,
  blocked,
  last = <LastRun />,
}: {
  initial: "one" | "all";
  client?: string;
  clients?: Client[];
  openList?: boolean;
  /** Under the choice of one client: the cut-off question (A4b). */
  extra?: ReactNode;
  /** In place of the button: what stops the start (A14). */
  blocked?: ReactNode;
  last?: ReactNode;
}) {
  const [choice, setChoice] = useState<"one" | "all">(initial);
  const runnable = clients.filter((c) => !c.skipReason).length;
  return (
    <ExtensionShell area="sync" mark={blocked ? "alarm" : undefined}>
      <ReadyCard>
        <RadioGroup
          name="duo-scope"
          label="Welche Mandanten?"
          value={choice}
          onChange={(v) => setChoice(v === "all" ? "all" : "one")}
          options={[
            { value: "one", label: "Ein Mandant" },
            {
              value: "all",
              label: `Alle Mandanten (${clients.length})`,
              hint: `${runnable} werden abgeglichen · ${clients.length - runnable} übersprungen`,
            },
          ]}
          underChecked={
            choice === "one" ? (
              <div style={stack}>
                <ClientPicker initial={client} clients={clients} />
                {extra}
              </div>
            ) : (
              <Disclosure summary="Liste ansehen und einzelne abwählen" count={clients.length} defaultOpen={openList}>
                <OverviewTable clients={clients} />
              </Disclosure>
            )
          }
        />
        <StepsLine />
        {blocked ?? (
          <div>
            <Button variant="primary">{choice === "one" ? "Mandant abgleichen" : "Alle Mandanten abgleichen"}</Button>
          </div>
        )}
        {last}
      </ReadyCard>
    </ExtensionShell>
  );
}

const A4 = () => <ReadyChoice initial="one" />;

function A4bBody() {
  const [from, setFrom] = useState<string | null>("2026-07-01");
  return (
    <ReadyChoice
      initial="one"
      client="c10"
      extra={
        <Field
          label="Belege übernehmen ab"
          htmlFor="duo-cutoff"
          hint="Erster Belegabruf für diesen Mandanten. Ältere Belege bleiben in DATEV. Die Frage kommt je Mandant nur einmal."
        >
          <DateField id="duo-cutoff" value={from} onChange={setFrom} max="2026-11-27" />
        </Field>
      }
      last={<p className="lw-ui-hint">Noch kein Abgleich für Hotel Seeblick Betriebs-GmbH.</p>}
    />
  );
}

/** A6: the clients of the batch; deselecting holds for this batch only. */
function OverviewTable({ clients }: { clients: Client[] }) {
  const [off, setOff] = useState<ReadonlySet<string>>(new Set());
  const [query, setQuery] = useState("");
  const many = clients.length > 20;
  const match = (c: Client) =>
    !query || c.name.toLowerCase().includes(query.toLowerCase()) || (c.datevNumber ?? "").includes(query);
  const runnable = clients.filter((c) => !c.skipReason);
  const skipped = clients.filter((c) => c.skipReason);
  const shown = runnable.filter(match);
  const on = runnable.length - off.size;
  const toggle = (id: string, checked: boolean) =>
    setOff((prev) => {
      const next = new Set(prev);
      if (checked) next.delete(id);
      else next.add(id);
      return next;
    });
  return (
    <div style={stack}>
      {many ? (
        <SearchInput placeholder="Mandant oder DATEV-Mandantennummer suchen" value={query} onChange={setQuery} />
      ) : null}
      <Table
        cols="var(--space-6) minmax(0, 1.6fr) minmax(0, 1fr) minmax(0, 1.3fr)"
        priority={["primary", "primary", "meta", "meta"]}
        sections={[
          {
            key: "skipped",
            children: (
              <>
                <GroupRow>Werden übersprungen · {skipped.length}</GroupRow>
                {skipped.filter(match).map((c) => (
                  <Row key={c.id}>
                    <span />
                    <span>{c.name}</span>
                    <td colSpan={2}>{c.skipReason}</td>
                  </Row>
                ))}
              </>
            ),
          },
        ]}
      >
        <HeadRow>
          <SelectCell
            checked={off.size === 0}
            onChange={(checked) => setOff(checked ? new Set() : new Set(runnable.map((c) => c.id)))}
            label={`Alle ${runnable.length} auswählen`}
          />
          <span>Mandant</span>
          <span>Letzter Abgleich</span>
          <span>Abrufzeitraum</span>
        </HeadRow>
        <GroupRow>
          Werden abgeglichen ({on} von {runnable.length})
        </GroupRow>
        {shown.map((c) => (
          <Row key={c.id}>
            <SelectCell checked={!off.has(c.id)} onChange={(v) => toggle(c.id, v)} label={`${c.name} abgleichen`} />
            <span>{clientLabel(c)}</span>
            <span>{c.lastSync ? <Time value={c.lastSync} format="date" /> : "noch nie"}</span>
            <span>
              <DateRange from={c.from} to={c.to} />
            </span>
          </Row>
        ))}
      </Table>
    </div>
  );
}

function ReadyAll({ open, clients = CLIENTS }: { open: boolean; clients?: Client[] }) {
  return <ReadyChoice initial="all" clients={clients} openList={open} />;
}

/* ── Running ───────────────────────────────────────────────────────────── */

function RunningCard({ title, extra, children }: { title: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <Card>
      <CardHead
        title={title}
        sub={
          <>
            Gestartet <Time value="2026-11-27T09:11:00+01:00" format="time" size="sm" />
          </>
        }
        actions={
          <Button variant="tertiary" size="sm">
            Abgleich abbrechen
          </Button>
        }
      />
      <CardSection>
        <div style={stack}>
          {extra}
          {children}
        </div>
      </CardSection>
    </Card>
  );
}

const A7 = () => (
  <ExtensionShell area="sync" mark="dot">
    {KEEP_OPEN}
    <RunningCard title="Musterfirma GmbH wird abgeglichen">
      <PhaseProgress phases={PHASES_RUNNING} label="Abgleich Musterfirma GmbH" />
    </RunningCard>
  </ExtensionShell>
);

const A7b = () => (
  <ExtensionShell area="sync" mark="dot">
    {KEEP_OPEN}
    <RunningCard
      title="Hotel Seeblick Betriebs-GmbH wird abgeglichen"
      extra={
        <StatusCallout
          layout="sentence"
          kicker="Erster Belegabruf für Hotel Seeblick Betriebs-GmbH."
          title="In DATEV liegen 214 Belege seit dem 01.07.2026, 38 kennt Ludwig schon, 176 werden übertragen. Das dauert einige Minuten."
          actions={<TextButton>Belegabruf abbrechen</TextButton>}
        />
      }
    >
      <PhaseProgress
        label="Abgleich Hotel Seeblick Betriebs-GmbH"
        phases={[
          phase("filing", "done", { note: "nichts einzusortieren" }),
          phase("fetch", "active", { count: { done: 12, total: 176, unit: "Beleg" } }),
          phase("accounts", "pending"),
        ]}
      />
    </RunningCard>
  </ExtensionShell>
);

const A9 = () => (
  <ExtensionShell area="sync" mark="dot">
    <StatusCallout
      layout="sentence"
      tone="warning"
      icon={WARNING_SIGN}
      kicker="Bitte melden Sie sich bei DATEV an."
      title="Der Abgleich wartet, bis die Anmeldung im DATEV-Fenster abgeschlossen ist, und läuft dann von selbst weiter."
      actions={<Button size="sm">DATEV-Fenster zeigen</Button>}
    />
    <RunningCard title="Musterfirma GmbH wird abgeglichen">
      <PhaseProgress
        label="Abgleich Musterfirma GmbH"
        phases={[
          phase("filing", "held", { note: "wartet auf Anmeldung" }),
          phase("fetch", "pending"),
          phase("accounts", "pending"),
        ]}
      />
    </RunningCard>
  </ExtensionShell>
);

/* ── Batch ─────────────────────────────────────────────────────────────── */

const BATCH_COLS = "var(--space-6) minmax(0, 1.5fr) minmax(0, 0.9fr) minmax(0, 1.4fr)";

function RowDetail({ r }: { r: BatchRow }) {
  if (r.state === "succeeded_with_issues") {
    return (
      <ProblemCard
        level="warning"
        resolution="support"
        title="3 Belege nicht übertragen."
        cause="DATEV hat zu diesen Belegen keine PDF-Datei geliefert."
        step="Der nächste Abgleich versucht es erneut."
        action={<Button size="sm">Ergebnis ansehen</Button>}
      />
    );
  }
  return (
    <p className="lw-ui-text">
      {r.summary}. Abrufzeitraum <DateRange from={r.client.from} to={r.client.to} />.{" "}
      <TextButton>Ergebnis ansehen</TextButton>
    </p>
  );
}

const PROBLEM_STATES: DuoSyncState[] = ["succeeded_with_issues", "cancelled"];

/** The count line (0272): fixed order, problems first; a 0 stays in its place, grey and not choosable. */
const COUNT_ORDER: DuoSyncState[] = ["succeeded_with_issues", "cancelled", "running", "queued", "succeeded", "skipped"];

function BatchRowView({ r, open }: { r: BatchRow; open?: boolean }) {
  const ended = r.state === "succeeded" || r.state === "succeeded_with_issues" || r.state === "cancelled";
  const cells = (
    <>
      <span>{r.client.name}</span>
      <span>
        <StatusBadge axis="duo_sync" status={r.state} info={false} />
      </span>
      <span>{r.summary}</span>
    </>
  );
  return ended ? (
    <ExpandableRow summary={cells} defaultOpen={open}>
      <RowDetail r={r} />
    </ExpandableRow>
  ) : (
    <Row active={r.state === "running"}>
      <span />
      {cells}
    </Row>
  );
}

/**
 * A8/A13 (owner 2026-11-27): the count line over the list — every state with
 * its number, each a filter — then the group „Mit Problemen", then „Alle
 * übrigen" in their fixed order. A client changes group once, when its sync
 * ends with a problem: an event, not a jump. `ended`: the problems open, the
 * rest folded with its count.
 */
function BatchTable({ rows, ended }: { rows: BatchRow[]; ended?: boolean }) {
  const [filter, setFilter] = useState<string>("all");
  const [restOpen, setRestOpen] = useState(!ended);
  const options: ChipOption[] = [
    { key: "all", label: "Alle", count: rows.length },
    ...COUNT_ORDER.map((s): ChipOption => {
      const count = rows.filter((r) => r.state === s).length;
      return { key: s, label: word(s), count, disabled: count === 0 && filter !== s };
    }),
  ];
  const shown = filter === "all" ? rows : rows.filter((r) => r.state === filter);
  const problems = shown.filter((r) => PROBLEM_STATES.includes(r.state));
  const rest = shown.filter((r) => !PROBLEM_STATES.includes(r.state));
  return (
    <>
    {/* Above the card, never in it (FilterChips @when) — 0272 acceptance H7. */}
    <FilterChips label="Stand" options={options} active={filter} onPick={setFilter} />
    <Card>
      <CardHead title="Mandanten" sub={`${shown.length} von ${rows.length}`} />
      <Table
        cols={BATCH_COLS}
        priority={["primary", "primary", "primary", "meta"]}
        sections={[
          {
            key: "issues",
            children:
              problems.length > 0 ? (
                <>
                  <GroupRow>Mit Problemen · {problems.length}</GroupRow>
                  {problems.map((r) => (
                    <BatchRowView key={r.client.id} r={r} open={ended} />
                  ))}
                </>
              ) : null,
          },
          {
            key: "rest",
            children:
              rest.length > 0 ? (
                <>
                  <GroupRow>
                    <TextButton
                      icon={<ActionIcon action={restOpen ? "expand" : "collapse"} />}
                      onClick={() => setRestOpen(!restOpen)}
                      aria-expanded={restOpen}
                    >
                      {problems.length > 0 ? "Alle übrigen" : "Mandanten"} · {rest.length}
                    </TextButton>
                  </GroupRow>
                  {restOpen ? rest.map((r) => <BatchRowView key={r.client.id} r={r} />) : null}
                </>
              ) : null,
          },
        ]}
      >
        <HeadRow>
          <span />
          <span>Mandant</span>
          <span>
            Stand <StatusInfoButton axis="duo_sync" />
          </span>
          <span>Ergebnis</span>
        </HeadRow>
      </Table>
    </Card>
    </>
  );
}

function BatchHead({ done, total, skipped, stopping }: { done: number; total: number; skipped: number; stopping?: boolean }) {
  return (
    <Card>
      <CardHead
        title="Alle Mandanten werden abgeglichen"
        sub={`${skipped} übersprungen`}
        actions={
          stopping ? null : (
            <Button variant="tertiary" size="sm">
              Durchgang anhalten
            </Button>
          )
        }
      />
      <CardSection>
        <Progress done={done} total={total} label={`Mandant ${done + 1} von ${total}`} />
      </CardSection>
    </Card>
  );
}

function NowBlock({ name }: { name: string }) {
  return (
    <Card>
      <CardHead title={`Jetzt: ${name}`} headingLevel={3} />
      <CardSection>
        <PhaseProgress phases={PHASES_RUNNING} label={`Abgleich ${name}`} />
      </CardSection>
    </Card>
  );
}

function BatchRunning({ rows, stopping }: { rows: BatchRow[]; stopping?: boolean }) {
  const runnable = rows.filter((r) => r.state !== "skipped");
  const done = runnable.filter((r) => r.state !== "queued" && r.state !== "running").length;
  const current = rows.find((r) => r.state === "running");
  const waiting = runnable.filter((r) => r.state === "queued").length;
  return (
    <ExtensionShell area="sync" mark="dot">
      {KEEP_OPEN}
      {stopping ? (
        <StatusCallout
          layout="sentence"
          kicker="Wird angehalten."
          title={`${current?.client.name ?? "Der laufende Mandant"} wird noch fertig abgeglichen, die übrigen ${waiting} werden übersprungen.`}
          actions={<Button size="sm">Doch weitermachen</Button>}
        />
      ) : null}
      <BatchHead done={done} total={runnable.length} skipped={rows.length - runnable.length} stopping={stopping} />
      {current ? <NowBlock name={current.client.name} /> : null}
      <BatchTable rows={rows} />
    </ExtensionShell>
  );
}

/* ── Results ───────────────────────────────────────────────────────────── */

function ResultHead({ name }: { name: string }) {
  return (
    <CardHead
      title={`Ergebnis · ${name}`}
      sub={
        <>
          <Time value={NOW} size="sm" /> · Abrufzeitraum 13.11.2026 bis 27.11.2026, von Ludwig bestimmt
        </>
      }
    />
  );
}

function ResultTable() {
  return (
    <Table cols="minmax(0, 0.7fr) minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1.4fr)" priority={["meta", "primary", "primary", "meta"]}>
      <HeadRow>
        <span>Art</span>
        <span>Bezeichnung</span>
        <span>Stand</span>
        <span>Angaben</span>
      </HeadRow>
      {RESULT_ROWS.map((r) => (
        <Row key={r.title}>
          <span>{r.kind}</span>
          <span>{r.title}</span>
          <span>
            <Badge tone={r.tone}>{r.status}</Badge>
          </span>
          <span>{r.detail}</span>
        </Row>
      ))}
    </Table>
  );
}

function Evidence() {
  return (
    <Card>
      <CardSection>
        <div style={stack}>
          <Disclosure summary="Ergebnis im Einzelnen" count={RESULT_ROWS.length}>
            <ResultTable />
          </Disclosure>
          <Disclosure summary="Protokoll dieses Abgleichs" count={LOG.length}>
            <div style={{ overflowX: "auto" }}>
              <LogList entries={LOG} order="oldest" />
            </div>
          </Disclosure>
        </div>
      </CardSection>
    </Card>
  );
}

const RETRY = (
  <>
    <Button size="sm">Erneut versuchen</Button>
    <span className="lw-ui-hint">Ein neuer Versuch überträgt nichts doppelt.</span>
  </>
);

/**
 * The answer first (0269): a sentence opened by the state word, then the same
 * step rows as during the run in their end state (0265). Problems and a cancel
 * carry the warning's tone and sign on the frame; „Fertig" stays neutral.
 */
function ResultCard({
  name,
  state,
  sentence,
  phases,
  actions,
}: {
  name: string;
  state: DuoSyncState;
  sentence: string;
  phases?: PhaseProgressItem[];
  actions?: ReactNode;
}) {
  const warn = state === "succeeded_with_issues" || state === "cancelled";
  return (
    <Card>
      <ResultHead name={name} />
      <CardSection>
        <div style={stack}>
          <StatusCallout
            layout="sentence"
            tone={warn ? "warning" : "neutral"}
            icon={warn ? WARNING_SIGN : undefined}
            kicker={`${word(state)}.`}
            title={sentence}
            actions={actions}
          />
          {phases ? <PhaseProgress phases={phases} label={`Abgleich ${name}`} /> : null}
        </div>
      </CardSection>
    </Card>
  );
}

const A10 = () => (
  <ExtensionShell area="sync">
    <ResultCard
      name="Musterfirma GmbH"
      state="succeeded"
      sentence="12 Belege übertragen, Kontoumsätze von 2 Konten geholt."
      phases={PHASES_OK}
      actions={
        <>
          <Button>Erneut abgleichen</Button>
          <Link href="#ludwig">Belege in Ludwig ansehen</Link>
        </>
      }
    />
    <Evidence />
  </ExtensionShell>
);

const A11 = () => (
  <ExtensionShell area="sync" mark="dot">
    <ResultCard
      name="Musterfirma GmbH"
      state="succeeded_with_issues"
      sentence="9 Belege übertragen, 3 Belege nicht übertragen."
      phases={PHASES_ISSUES}
      actions={RETRY}
    />
    <ProblemCard
      level="warning"
      resolution="support"
      context={STEP_TEXT.fetch}
      title="3 Belege nicht übertragen."
      cause="DATEV hat zu diesen Belegen keine PDF-Datei geliefert."
      step="Die Belege bleiben in DATEV; ein neuer Versuch holt sie, sobald DATEV die Datei liefert."
      technical={"beleg_kein_pdf · 3 Belege\n2026-0419  Content-Type text/html statt application/pdf\n2026-0423  Content-Type text/html statt application/pdf\n2026-0431  leere Antwort (0 Byte)"}
    />
    <Evidence />
    <SupportHelp facts={supportFacts("beleg_kein_pdf", "belege")} />
  </ExtensionShell>
);

/** A12: the step stands where it broke; the problem card carries the way out with its own level (0264). */
function Cancelled({ at, problem, code }: { at: "held" | "failed"; problem: ReactNode; code: string }) {
  return (
    // The tab keeps the grey dot after a cancel; red is for A3 and A14 only (profile, Nachtrag 1).
    <ExtensionShell area="sync" mark="dot">
      <ResultCard
        name="Musterfirma GmbH"
        state="cancelled"
        sentence="Stehen geblieben bei „Neue Belege aus DATEV holen“, Beleg 37 von 120."
        phases={phasesCancelled(at)}
        actions={<Button>Erneut abgleichen</Button>}
      />
      {problem}
      <Evidence />
      <SupportHelp facts={supportFacts(code, "belege")} />
    </ExtensionShell>
  );
}

const A12a = () => (
  <Cancelled
    at="held"
    code="seite_geschlossen"
    problem={
      <ProblemCard
        level="warning"
        resolution="user"
        context={STEP_TEXT.fetch}
        title="Die Seite wurde während des Abgleichs geschlossen."
        cause="Bisher Übertragenes bleibt in Ludwig."
        step="Gleichen Sie erneut ab; der neue Abgleich holt den Rest und überträgt nichts doppelt."
      />
    }
  />
);

const A12b = () => (
  <Cancelled
    at="failed"
    code="ludwig_nicht_erreichbar"
    problem={
      <ProblemCard
        resolution="retry"
        context={STEP_TEXT.fetch}
        title="Ludwig ist nicht erreichbar."
        cause="Die Verbindung zum Server kam nicht zustande."
        step="Gleichen Sie in ein paar Minuten erneut ab; das überträgt nichts doppelt."
        technical={"ludwig_nicht_erreichbar · Schritt belege\nPOST /api/intake/v2/documents/check → net::ERR_CONNECTION_TIMED_OUT nach 3 Versuchen"}
      />
    }
  />
);

const A12c = () => (
  <Cancelled
    at="failed"
    code="duo_element_fehlt"
    problem={
      <ProblemCard
        resolution="support"
        context={STEP_TEXT.fetch}
        title="DATEV hat anders reagiert als erwartet."
        cause="Ein Element der DATEV-Seite fehlte; vermutlich hat DATEV seine Oberfläche geändert."
        step="Schreiben Sie dem Support mit den Angaben unten, wir passen das Plugin an."
        technical={"duo_element_fehlt · Schritt belege\nElement „Export starten“ nach 30 s nicht gefunden (Seite Belegübersicht)"}
      />
    }
  />
);

const A13 = () => (
  <ExtensionShell area="sync" mark="dot">
    <Card>
      <CardHead title="Ergebnis · Alle Mandanten" sub={<Time value={NOW} size="sm" />} />
      <CardSection>
        <StatusCallout
          layout="sentence"
          tone="warning"
          icon={WARNING_SIGN}
          kicker={`${word("succeeded_with_issues")}.`}
          title="10 Mandanten abgeglichen, 1 mit Problemen, 2 übersprungen."
          actions={<Button>Erneut abgleichen</Button>}
        />
      </CardSection>
    </Card>
    <BatchTable rows={BATCH_DONE} ended />
  </ExtensionShell>
);

const A14 = () => (
  <ReadyChoice
    initial="one"
    client="c11"
    last={null}
    blocked={
      <ProblemCard
        resolution="user"
        context="Ingenieurbüro Brandt"
        title="Mandant ohne DATEV-Mandantennummer."
        cause="In Ludwig fehlt für Ingenieurbüro Brandt die DATEV-Mandantennummer; ohne sie findet das Plugin den Mandanten in DATEV nicht."
        step="Tragen Sie die Nummer in Ludwig ein und gleichen Sie dann ab."
        action={
          <>
            <Button size="sm" icon={<ActionIcon action="external" />}>
              In Ludwig öffnen
            </Button>
            <TextButton href="#einstellungen">Alle Prüfpunkte ansehen</TextButton>
          </>
        }
      />
    }
  />
);

/* ── The states ────────────────────────────────────────────────────────── */

const page = "page" as const;

const SYNC_STATES: StateSpec[] = [
  { id: "A1", title: "Einrichtung · nicht verbunden", uses: "ExtensionShell, StepRail (bar), Card, Button, Disclosure, Field, Input (Passwort)", missing: "", surface: page, render: () => <A1 /> },
  { id: "A1b", title: "Einrichtung · wartet auf Bestätigung", uses: "ExtensionShell, StepRail, Card, Spinner, Button", missing: "", surface: page, render: () => <A1b /> },
  { id: "A1c", title: "Einrichtung · Prüfung läuft", uses: "ExtensionShell, StepRail, Card, CheckItems (live, wird geprüft), Button", missing: "", surface: page, render: () => <A1c /> },
  { id: "A2", title: "Einrichtung · Verbindung abgelaufen", uses: "ExtensionShell, Callout, Card, Button, Disclosure", missing: "", surface: page, render: () => <A2 /> },
  { id: "A3", title: "Plugin zu alt", uses: "ExtensionShell, ProblemCard, Button", missing: "", surface: page, render: () => <A3 /> },
  { id: "A4", title: "Bereit · ein Mandant", uses: "ExtensionShell, RadioGroup, Combobox, Button, StatusBadge, Time, TextButton", missing: "", surface: page, render: () => <A4 /> },
  { id: "A4b", title: "Bereit · Stichtag fragen", uses: "ExtensionShell, RadioGroup, Combobox, Field, DateField, Button", missing: "", surface: page, render: () => <A4bBody /> },
  { id: "A5", title: "Bereit · alle", uses: "ExtensionShell, RadioGroup, Disclosure, Button, StatusBadge", missing: "", surface: page, render: () => <ReadyAll open={false} /> },
  { id: "A6", title: "Übersicht vor dem Durchgang (aufgeklappt)", uses: "ExtensionShell, RadioGroup, Disclosure, Table, GroupRow, SelectCell, Time, DateRange", missing: "", surface: page, render: () => <ReadyAll open /> },
  { id: "A7", title: "Läuft · ein Mandant", uses: "ExtensionShell, Callout, Card, PhaseProgress, Button", missing: "", surface: page, render: () => <A7 /> },
  { id: "A7b", title: "Läuft · erster Belegabruf", uses: "ExtensionShell, StatusCallout (Satz), TextButton, PhaseProgress", missing: "", surface: page, render: () => <A7b /> },
  { id: "A8", title: "Läuft · Durchgang", uses: "ExtensionShell, Progress, PhaseProgress, FilterChips (Zählzeile), Table, GroupRow, ExpandableRow, StatusBadge", missing: "", surface: page, render: () => <BatchRunning rows={BATCH_RUNNING} /> },
  { id: "A8b", title: "Läuft · Durchgang wird angehalten", uses: "ExtensionShell, StatusCallout (Satz), Button, Progress, PhaseProgress, FilterChips, Table", missing: "", surface: page, render: () => <BatchRunning rows={BATCH_RUNNING} stopping /> },
  { id: "A9", title: "Wartet auf DATEV-Anmeldung", uses: "ExtensionShell, StatusCallout (Satz), Button, PhaseProgress (gehalten)", missing: "", surface: page, render: () => <A9 /> },
  { id: "A10", title: "Ergebnis · alles gut", uses: "ExtensionShell, StatusCallout (Satz), PhaseProgress (Endzustand), Button, Link, Disclosure, Table, LogList", missing: "", surface: page, render: () => <A10 /> },
  { id: "A11", title: "Ergebnis · mit Problemen", uses: "ExtensionShell, StatusCallout (Satz), PhaseProgress, ProblemCard, Disclosure, CopyTextButton, Button", missing: "", surface: page, render: () => <A11 /> },
  { id: "A12a", title: "Ergebnis · abgebrochen (Seite geschlossen)", uses: "ExtensionShell, StatusCallout (Satz), PhaseProgress (gehalten), ProblemCard, CopyTextButton", missing: "", surface: page, render: () => <A12a /> },
  { id: "A12b", title: "Ergebnis · abgebrochen (Ludwig nicht erreichbar)", uses: "ExtensionShell, StatusCallout (Satz), PhaseProgress (gescheitert), ProblemCard, CopyTextButton", missing: "", surface: page, render: () => <A12b /> },
  { id: "A12c", title: "Ergebnis · abgebrochen (liegt nicht an Ihnen)", uses: "ExtensionShell, StatusCallout (Satz), PhaseProgress (gescheitert), ProblemCard, CopyTextButton", missing: "", surface: page, render: () => <A12c /> },
  { id: "A13", title: "Ergebnis · Durchgang", uses: "ExtensionShell, StatusCallout (Satz), FilterChips (Zählzeile), Table, GroupRow, ExpandableRow, StatusBadge, ProblemCard", missing: "", surface: page, render: () => <A13 /> },
  { id: "A14", title: "Stille Prüfung sperrt den Start", uses: "ExtensionShell, RadioGroup, Combobox, ProblemCard, Button, TextButton", missing: "", surface: page, render: () => <A14 /> },
];

/* ── Stories ───────────────────────────────────────────────────────────── */

const meta: Meta = {
  title: "Seiten/DUO-Connect/Abgleich",
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj;

function one(id: string): Story {
  const spec = SYNC_STATES.find((s) => s.id === id);
  if (!spec) throw new Error(`unknown state ${id}`);
  return { name: `${spec.id} · ${spec.title}`, render: () => <Single spec={spec} /> };
}

/** Every state of the tab „Abgleich", side by side. */
export const Board: Story = {
  render: () => (
    <StateBoard
      title="Abgleich — alle Zustände"
      lead="Nach docs/seiten/duo-connect.md, gebaut aus den Bausteinen des Sets."
      states={SYNC_STATES}
    />
  ),
};

export const A01NotConnected = one("A1");
export const A01bAwaitingConfirmation = one("A1b");
export const A01cChecking = one("A1c");
export const A02ConnectionExpired = one("A2");
export const A03PluginTooOld = one("A3");
export const A04ReadySingle = one("A4");
export const A04bAskCutoff = one("A4b");
export const A05ReadyAll = one("A5");
export const A06Overview = one("A6");
export const A07RunningSingle = one("A7");
export const A07bFirstFetch = one("A7b");
export const A08RunningBatch = one("A8");
export const A08bBatchStopping = one("A8b");
export const A09AwaitingDatevLogin = one("A9");
export const A10ResultOk = one("A10");
export const A11ResultIssues = one("A11");
export const A12aCancelledPageClosed = one("A12a");
export const A12bCancelledUnreachable = one("A12b");
export const A12cCancelledNotYou = one("A12c");
export const A13ResultBatch = one("A13");
export const A14PrecheckBlocks = one("A14");

/** A8 and A11 at phone width: set the viewport to 375 px; tables turn into row cards (L1). */
export const Narrow: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-8)", padding: "var(--space-2)" }}>
      <BatchRunning rows={BATCH_RUNNING} />
      <A11 />
    </div>
  ),
};

function ManyBody() {
  const rows = useMemo(() => MANY_BATCH, []);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-10)", padding: "var(--space-6)", alignItems: "flex-start" }}>
      <div style={{ width: "var(--container-narrow)", maxWidth: "100%" }}>
        <h3 className="lw-ui-section">A6 · Übersicht mit 140 Mandanten</h3>
        <ReadyAll open clients={MANY_CLIENTS} />
      </div>
      <div style={{ width: "var(--container-narrow)", maxWidth: "100%" }}>
        <h3 className="lw-ui-section">A8 · Durchgang mit 140 Mandanten</h3>
        <BatchRunning rows={rows} />
      </div>
    </div>
  );
}

/** A6 and A8 with 140 clients: search above the overview, the count line, the running client on top. */
export const ManyClients: Story = {
  render: () => <ManyBody />,
};
