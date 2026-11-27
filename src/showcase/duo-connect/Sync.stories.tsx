import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useMemo, useState, type ReactNode } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Callout,
  Card,
  CardHead,
  CardSection,
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
  LogList,
  Progress,
  Row,
  SearchInput,
  SelectCell,
  StepRail,
  Table,
  TextButton,
  Time,
  type ComboboxOption,
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
  RESULT_ROWS,
  STEP_TEXT,
  SYNC_STATE,
  type BatchRow,
  type Client,
} from "./fixtures";
import { DraftsVisible, ProblemCard, ReadinessRows, ResultSummary, Spinner, StepProgress } from "./drafts";
import { Board as StateBoard, ExtensionShell, Single, type StateSpec } from "./Frame";

/* ── Shared pieces ─────────────────────────────────────────────────────── */

const stack = { display: "grid", gap: "var(--space-4)" } as const;
const row = { display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" } as const;

function clientLabel(c: Client): string {
  return c.datevNumber ? `${c.name} · ${c.datevNumber}` : c.name;
}

/** Search by name **or** DATEV number: the number sits in the label. */
function ClientPicker({ initial, clients = CLIENTS }: { initial: string | null; clients?: Client[] }) {
  const [value, setValue] = useState<string | null>(initial);
  const options: ComboboxOption[] = [
    { value: "all", label: `Alle Mandanten (${clients.length})`, hint: "Nacheinander in einer DATEV-Sitzung" },
    ...clients.map((c) => ({ value: c.id, label: clientLabel(c), hint: c.skipReason ?? undefined })),
  ];
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

function StepsLine() {
  return (
    <p className="lw-ui-hint">
      Schritte: {ACTIVE_STEPS.map((k) => STEP_TEXT[k]).join(" · ")} ·{" "}
      <TextButton href="#einstellungen">Schritte ändern</TextButton>
    </p>
  );
}

function LastRun() {
  return (
    <p className="lw-ui-hint" style={row}>
      <span>Zuletzt:</span>
      <Time value={NOW} size="sm" />
      <Badge tone={SYNC_STATE.succeeded.tone}>{SYNC_STATE.succeeded.label}</Badge>
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
          <Spinner label="Warten auf Ihre Bestätigung in Ludwig" />
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

const A1c = () => (
  <ExtensionShell area="sync">
    <StepRail ariaLabel="Einrichtung" layout="bar" items={setupSteps("check")} />
    <Card>
      <CardHead title="Alles bereit?" sub="Wird geprüft · 6 von 9 Punkten fertig" />
      <ReadinessRows
        rows={[
          { code: "1", question: "Plugin ist aktuell", reason: "Version 0.11.0 ist aktuell.", state: "ok" },
          { code: "2", question: "Ludwig ist erreichbar", reason: "Ludwig antwortet.", state: "ok" },
          { code: "3", question: "Mit Ludwig verbunden", reason: "Verbunden als Anna Berger.", state: "ok" },
          { code: "4", question: "Mandanten vorhanden und vollständig", reason: "12 Mandanten, 10 mit DATEV-Mandantennummer.", state: "ok" },
          { code: "5", question: "DATEV ist erreichbar", reason: "", state: "running" },
          { code: "6", question: "Bei DATEV angemeldet", reason: "", state: "running" },
          { code: "8", question: "Browser-Freigaben", reason: "", state: "running" },
          { code: "9", question: "Einstellungen von Ludwig geladen", reason: "Vom Server geladen.", state: "ok" },
          { code: "10", question: "Kein anderer Abgleich läuft", reason: "Diese Seite ist die einzige.", state: "ok" },
        ]}
      />
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
      kind="user"
      what="Ludwig DUO-Connect ist zu alt."
      cause="Installiert ist Version 0.10.1, Ludwig verlangt mindestens 0.11.0. Bis dahin ist der Abgleich gesperrt."
      next="Die Erweiterung aktualisiert sich meist von selbst; sonst öffnen Sie die Erweiterungen des Browsers und wählen „Aktualisieren“."
      actions={<Button variant="primary" size="sm">Anleitung öffnen</Button>}
    />
  </ExtensionShell>
);

/* ── Ready ─────────────────────────────────────────────────────────────── */

const A4 = () => (
  <ExtensionShell area="sync">
    <ReadyCard>
      <ClientPicker initial="c01" />
      <StepsLine />
      <div>
        <Button variant="primary">Mandant abgleichen</Button>
      </div>
      <LastRun />
    </ReadyCard>
  </ExtensionShell>
);

function A4bBody() {
  const [from, setFrom] = useState<string | null>("2026-07-01");
  return (
    <ExtensionShell area="sync">
      <ReadyCard>
        <ClientPicker initial="c10" />
        <Field
          label="Belege übernehmen ab"
          htmlFor="duo-cutoff"
          hint="Erster Belegabruf für diesen Mandanten. Ältere Belege bleiben in DATEV. Die Frage kommt je Mandant nur einmal."
        >
          <DateField id="duo-cutoff" value={from} onChange={setFrom} max="2026-11-27" />
        </Field>
        <StepsLine />
        <div>
          <Button variant="primary">Mandant abgleichen</Button>
        </div>
        <p className="lw-ui-hint">Noch kein Abgleich für Hotel Seeblick Betriebs-GmbH.</p>
      </ReadyCard>
    </ExtensionShell>
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
                <GroupRow>Werden übersprungen ({skipped.length})</GroupRow>
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
  const runnable = clients.filter((c) => !c.skipReason).length;
  return (
    <ExtensionShell area="sync">
      <ReadyCard>
        <ClientPicker initial="all" clients={clients} />
        <p className="lw-ui-text">
          {runnable} werden abgeglichen · {clients.length - runnable} übersprungen
        </p>
        <Disclosure summary="Liste ansehen und einzelne abwählen" count={clients.length} defaultOpen={open}>
          <OverviewTable clients={clients} />
        </Disclosure>
        <StepsLine />
        <div>
          <Button variant="primary">Alle Mandanten abgleichen</Button>
        </div>
        <LastRun />
      </ReadyCard>
    </ExtensionShell>
  );
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

const STEPS_RUNNING = [
  { key: "filing" as const, state: { kind: "done" as const, result: "7 Belege einsortiert" } },
  { key: "fetch" as const, state: { kind: "count" as const, noun: "Beleg", done: 37, total: 120 } },
  { key: "accounts" as const, state: { kind: "open" as const } },
];

const A7 = () => (
  <ExtensionShell area="sync" mark="dot">
    {KEEP_OPEN}
    <RunningCard title="Musterfirma GmbH wird abgeglichen">
      <StepProgress steps={STEPS_RUNNING} />
    </RunningCard>
  </ExtensionShell>
);

const A7b = () => (
  <ExtensionShell area="sync" mark="dot">
    {KEEP_OPEN}
    <RunningCard
      title="Hotel Seeblick Betriebs-GmbH wird abgeglichen"
      extra={
        <Callout>
          <strong>Erster Belegabruf für Hotel Seeblick Betriebs-GmbH.</strong> In DATEV liegen 214 Belege seit dem
          01.07.2026, 38 kennt Ludwig schon, 176 werden übertragen. Das dauert einige Minuten.{" "}
          <TextButton>Belegabruf abbrechen</TextButton>
        </Callout>
      }
    >
      <StepProgress
        steps={[
          { key: "filing", state: { kind: "done", result: "nichts einzusortieren" } },
          { key: "fetch", state: { kind: "count", noun: "Beleg", done: 12, total: 176 } },
          { key: "accounts", state: { kind: "open" } },
        ]}
      />
    </RunningCard>
  </ExtensionShell>
);

const A9 = () => (
  <ExtensionShell area="sync" mark="dot">
    <Callout tone="warning">
      <strong>Bitte melden Sie sich bei DATEV an.</strong> Der Abgleich wartet, bis die Anmeldung im DATEV-Fenster
      abgeschlossen ist, und läuft dann von selbst weiter.{" "}
      <Button size="sm">DATEV-Fenster zeigen</Button>
    </Callout>
    <RunningCard title="Musterfirma GmbH wird abgeglichen">
      <StepProgress
        steps={[
          { key: "filing", state: { kind: "login" } },
          { key: "fetch", state: { kind: "open" } },
          { key: "accounts", state: { kind: "open" } },
        ]}
      />
    </RunningCard>
  </ExtensionShell>
);

/* ── Batch ─────────────────────────────────────────────────────────────── */

const BATCH_COLS = "var(--space-6) minmax(0, 1.5fr) minmax(0, 0.9fr) minmax(0, 1.4fr)";

function stateBadge(r: BatchRow) {
  const s = SYNC_STATE[r.state];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

function RowDetail({ r }: { r: BatchRow }) {
  if (r.state === "succeeded_with_issues") {
    return (
      <ProblemCard
        tone="warning"
        kind="notYou"
        what="3 Belege nicht übertragen."
        cause="DATEV hat zu diesen Belegen keine PDF-Datei geliefert."
        next="Der nächste Abgleich versucht es erneut."
        actions={<Button size="sm">Ergebnis ansehen</Button>}
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

type BatchFilter = "all" | "issues" | "skipped";

function BatchTable({ rows, openIssues }: { rows: BatchRow[]; openIssues?: boolean }) {
  const [filter, setFilter] = useState<BatchFilter>("all");
  const issues = rows.filter((r) => r.state === "succeeded_with_issues" || r.state === "cancelled");
  const skipped = rows.filter((r) => r.state === "skipped");
  const shown = filter === "issues" ? issues : filter === "skipped" ? skipped : rows;
  return (
    <Card>
      <CardHead
        title="Mandanten"
        sub={`${shown.length} von ${rows.length}`}
        actions={
          <FilterChips
            label="Zeigen"
            active={filter}
            onPick={(k) => setFilter(k as BatchFilter)}
            options={[
              { key: "all", label: "Alle", count: rows.length },
              { key: "issues", label: "Probleme", count: issues.length },
              { key: "skipped", label: "Übersprungen", count: skipped.length },
            ]}
          />
        }
      />
      <Table cols={BATCH_COLS} priority={["primary", "primary", "primary", "meta"]}>
        <HeadRow>
          <span />
          <span>Mandant</span>
          <span>Stand</span>
          <span>Ergebnis</span>
        </HeadRow>
        {shown.map((r) => {
          const ended = r.state === "succeeded" || r.state === "succeeded_with_issues" || r.state === "cancelled";
          const cells = (
            <>
              <span>{r.client.name}</span>
              <span>{stateBadge(r)}</span>
              <span>{r.summary}</span>
            </>
          );
          return ended ? (
            <ExpandableRow key={r.client.id} summary={cells} defaultOpen={openIssues && r.state !== "succeeded"}>
              <RowDetail r={r} />
            </ExpandableRow>
          ) : (
            <Row key={r.client.id} active={r.state === "running"}>
              <span />
              {cells}
            </Row>
          );
        })}
      </Table>
    </Card>
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
        <StepProgress steps={STEPS_RUNNING} />
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
        <Callout>
          <strong>Wird angehalten.</strong> {current?.client.name} wird noch fertig abgeglichen, die übrigen {waiting}{" "}
          werden übersprungen. <Button size="sm">Doch weitermachen</Button>
        </Callout>
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
  <div style={row}>
    <Button size="sm">Erneut versuchen</Button>
    <span className="lw-ui-hint">Ein neuer Versuch überträgt nichts doppelt.</span>
  </div>
);

const A10 = () => (
  <ExtensionShell area="sync">
    <Card>
      <ResultHead name="Musterfirma GmbH" />
      <CardSection>
        <ResultSummary
          state="succeeded"
          sentence="12 Belege übertragen, Kontoumsätze von 2 Konten geholt."
          figures={[
            { label: "Belege übertragen", value: "12" },
            { label: "schon in Ludwig", value: "47" },
            { label: "einsortiert", value: "7" },
            { label: "Konten", value: "2" },
          ]}
          actions={
            <>
              <Button icon={<ActionIcon action="external" />} href="#ludwig">
                Belege in Ludwig ansehen
              </Button>
              <Button variant="tertiary">Erneut abgleichen</Button>
            </>
          }
        />
      </CardSection>
    </Card>
    <Evidence />
  </ExtensionShell>
);

const A11 = () => (
  <ExtensionShell area="sync" mark="dot">
    <Card>
      <ResultHead name="Musterfirma GmbH" />
      <CardSection>
        <ResultSummary
          state="succeeded_with_issues"
          sentence="9 Belege übertragen, 3 Belege nicht übertragen."
          figures={[
            { label: "Belege übertragen", value: "9" },
            { label: "nicht übertragen", value: "3" },
            { label: "schon in Ludwig", value: "47" },
            { label: "Konten", value: "2" },
          ]}
        />
      </CardSection>
    </Card>
    <ProblemCard
      tone="warning"
      kind="notYou"
      what="3 Belege nicht übertragen."
      cause="DATEV hat zu diesen Belegen keine PDF-Datei geliefert."
      next="Die Belege bleiben in DATEV; ein neuer Versuch holt sie, sobald DATEV die Datei liefert."
      actions={RETRY}
      technical={"beleg_kein_pdf · 3 Belege\n2026-0419  Content-Type text/html statt application/pdf\n2026-0423  Content-Type text/html statt application/pdf\n2026-0431  leere Antwort (0 Byte)"}
    />
    <Evidence />
  </ExtensionShell>
);

function Cancelled({ problem }: { problem: ReactNode }) {
  return (
    <ExtensionShell area="sync" mark="dot">
      <Card>
        <ResultHead name="Musterfirma GmbH" />
        <CardSection>
          <div style={stack}>
            <ResultSummary
              state="cancelled"
              sentence="Stehen geblieben bei „Neue Belege aus DATEV holen“, Beleg 37 von 120."
              figures={[
                { label: "Belege übertragen", value: "36" },
                { label: "einsortiert", value: "7" },
                { label: "Konten", value: "0" },
              ]}
            />
            <StepProgress
              steps={[
                { key: "filing", state: { kind: "done", result: "7 Belege einsortiert" } },
                { key: "fetch", state: { kind: "cancelled", at: "Beleg 37 von 120" } },
                { key: "accounts", state: { kind: "open" } },
              ]}
            />
          </div>
        </CardSection>
      </Card>
      {problem}
      <Evidence />
    </ExtensionShell>
  );
}

const A12a = () => (
  <Cancelled
    problem={
      <ProblemCard
        tone="warning"
        kind="user"
        what="Die Seite wurde während des Abgleichs geschlossen."
        cause="Bisher Übertragenes bleibt in Ludwig."
        next="Gleichen Sie erneut ab; der neue Abgleich holt den Rest und überträgt nichts doppelt."
        actions={<Button size="sm" variant="primary">Erneut abgleichen</Button>}
      />
    }
  />
);

const A12b = () => (
  <Cancelled
    problem={
      <ProblemCard
        kind="retry"
        what="Ludwig ist nicht erreichbar."
        cause="Die Verbindung zum Server kam nicht zustande, meist eine kurze Störung oder das Internet."
        next="Versuchen Sie es in ein paar Minuten erneut."
        actions={RETRY}
        technical={"ludwig_nicht_erreichbar · Schritt belege\nPOST /api/intake/v2/documents/check → net::ERR_CONNECTION_TIMED_OUT nach 3 Versuchen"}
      />
    }
  />
);

const A12c = () => (
  <Cancelled
    problem={
      <ProblemCard
        kind="notYou"
        what="DATEV hat anders reagiert als erwartet."
        cause="Ein Element der DATEV-Seite fehlte; vermutlich hat DATEV seine Oberfläche geändert."
        next="Senden Sie das Protokoll an den Support, wir passen das Plugin an."
        actions={
          <div style={row}>
            <Button size="sm" icon={<ActionIcon action="download" />}>
              An Support senden
            </Button>
            <Button size="sm" variant="tertiary">
              Erneut versuchen
            </Button>
          </div>
        }
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
        <ResultSummary
          state="succeeded_with_issues"
          sentence="10 Mandanten abgeglichen, 1 mit Problemen, 2 übersprungen."
          figures={[
            { label: "Mandanten fertig", value: "9" },
            { label: "mit Problemen", value: "1" },
            { label: "übersprungen", value: "2" },
            { label: "Belege übertragen", value: "281" },
          ]}
          actions={<Button variant="tertiary">Erneut abgleichen</Button>}
        />
      </CardSection>
    </Card>
    <BatchTable rows={BATCH_DONE} openIssues />
  </ExtensionShell>
);

const A14 = () => (
  <ExtensionShell area="sync" mark="alarm">
    <ReadyCard>
      <ClientPicker initial="c11" />
      <ProblemCard
        kind="user"
        what="Mandant ohne DATEV-Mandantennummer."
        cause="In Ludwig fehlt für Ingenieurbüro Brandt die DATEV-Mandantennummer; ohne sie findet das Plugin den Mandanten in DATEV nicht."
        next="Tragen Sie die Nummer in Ludwig ein und gleichen Sie dann ab."
        actions={
          <div style={row}>
            <Button size="sm" icon={<ActionIcon action="external" />}>
              In Ludwig öffnen
            </Button>
            <TextButton href="#einstellungen">Alle Prüfpunkte ansehen</TextButton>
          </div>
        }
      />
    </ReadyCard>
  </ExtensionShell>
);

/* ── The states ────────────────────────────────────────────────────────── */

const page = "page" as const;

const SYNC_STATES: StateSpec[] = [
  { id: "A1", title: "Einrichtung · nicht verbunden", uses: "StepRail (bar), Card, Button, Disclosure, Field, Input (Passwort)", missing: "0263", surface: page, render: () => <A1 /> },
  { id: "A1b", title: "Einrichtung · wartet auf Bestätigung", uses: "StepRail, Card, Button", missing: "0263, 0268 Spinner", surface: page, render: () => <A1b /> },
  { id: "A1c", title: "Einrichtung · Prüfung läuft", uses: "StepRail, Card, Button", missing: "0263, 0270 Prüfpunkt-Zeile", surface: page, render: () => <A1c /> },
  { id: "A2", title: "Einrichtung · Verbindung abgelaufen", uses: "Callout, Card, Button, Disclosure", missing: "0263", surface: page, render: () => <A2 /> },
  { id: "A3", title: "Plugin zu alt", uses: "Button", missing: "0263, 0264 ProblemCard", surface: page, render: () => <A3 /> },
  { id: "A4", title: "Bereit · ein Mandant", uses: "Card, Combobox, Button, Badge, Time, TextButton", missing: "0263", surface: page, render: () => <A4 /> },
  { id: "A4b", title: "Bereit · Stichtag fragen", uses: "Combobox, Field, DateField, Button", missing: "0263", surface: page, render: () => <A4bBody /> },
  { id: "A5", title: "Bereit · alle", uses: "Combobox, Disclosure, Button, Badge", missing: "0263", surface: page, render: () => <ReadyAll open={false} /> },
  { id: "A6", title: "Übersicht vor dem Durchgang (aufgeklappt)", uses: "Disclosure, Table, GroupRow, SelectCell, Time, DateRange", missing: "0263", surface: page, render: () => <ReadyAll open /> },
  { id: "A7", title: "Läuft · ein Mandant", uses: "Callout, Card, Progress, Button", missing: "0263, 0265, 0268", surface: page, render: () => <A7 /> },
  { id: "A7b", title: "Läuft · erster Belegabruf", uses: "Callout, TextButton, Progress", missing: "0263, 0265", surface: page, render: () => <A7b /> },
  { id: "A8", title: "Läuft · Durchgang", uses: "Progress, Card, Table, ExpandableRow, Badge, FilterChips", missing: "0263, 0265, 0268", surface: page, render: () => <BatchRunning rows={BATCH_RUNNING} /> },
  { id: "A8b", title: "Läuft · Durchgang wird angehalten", uses: "Callout, Button, Progress, Table", missing: "0263, 0265", surface: page, render: () => <BatchRunning rows={BATCH_RUNNING} stopping /> },
  { id: "A9", title: "Wartet auf DATEV-Anmeldung", uses: "Callout, Button", missing: "0263, 0265", surface: page, render: () => <A9 /> },
  { id: "A10", title: "Ergebnis · alles gut", uses: "Card, KpiGrid, Button, Disclosure, Table, LogList", missing: "0263, 0269 StatusCallout figures", surface: page, render: () => <A10 /> },
  { id: "A11", title: "Ergebnis · mit Problemen", uses: "KpiGrid, StatusCallout, Disclosure, CopyTextButton", missing: "0263, 0264, 0269", surface: page, render: () => <A11 /> },
  { id: "A12a", title: "Ergebnis · abgebrochen (Seite geschlossen)", uses: "KpiGrid, StatusCallout, Button", missing: "0263, 0264, 0265, 0269", surface: page, render: () => <A12a /> },
  { id: "A12b", title: "Ergebnis · abgebrochen (Ludwig nicht erreichbar)", uses: "StatusCallout, Disclosure, CopyTextButton", missing: "0263, 0264, 0265, 0269", surface: page, render: () => <A12b /> },
  { id: "A12c", title: "Ergebnis · abgebrochen (liegt nicht an Ihnen)", uses: "StatusCallout, Button", missing: "0263, 0264, 0265, 0269", surface: page, render: () => <A12c /> },
  { id: "A13", title: "Ergebnis · Durchgang", uses: "KpiGrid, Table, ExpandableRow, FilterChips, Badge", missing: "0263, 0264, 0269", surface: page, render: () => <A13 /> },
  { id: "A14", title: "Stille Prüfung sperrt den Start", uses: "Combobox, Button, TextButton", missing: "0263, 0264", surface: page, render: () => <A14 /> },
];

/* ── Stories ───────────────────────────────────────────────────────────── */

interface Args {
  showDrafts: boolean;
}

const meta: Meta<Args> = {
  title: "Seiten/DUO-Connect/Abgleich",
  parameters: { layout: "fullscreen" },
  args: { showDrafts: true },
  argTypes: { showDrafts: { name: "Entwürfe kennzeichnen", control: "boolean" } },
};
export default meta;
type Story = StoryObj<Args>;

function one(id: string): Story {
  const spec = SYNC_STATES.find((s) => s.id === id);
  if (!spec) throw new Error(`unknown state ${id}`);
  return {
    name: `${spec.id} · ${spec.title}`,
    render: (args) => (
      <DraftsVisible value={args.showDrafts}>
        <Single spec={spec} />
      </DraftsVisible>
    ),
  };
}

/** Every state of the tab „Abgleich", side by side. */
export const Board: Story = {
  render: (args) => (
    <DraftsVisible value={args.showDrafts}>
      <StateBoard
        title="Abgleich — alle Zustände"
        lead="Entwurf nach docs/seiten/duo-connect.md. Gestrichelt umrandet ist, was es im Set noch nicht gibt; das Kennzeichen nennt die Spec."
        states={SYNC_STATES}
      />
    </DraftsVisible>
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
  render: (args) => (
    <DraftsVisible value={args.showDrafts}>
      <div style={{ display: "grid", gap: "var(--space-8)", padding: "var(--space-2)" }}>
        <BatchRunning rows={BATCH_RUNNING} />
        <A11 />
      </div>
    </DraftsVisible>
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

/** A6 and A8 with 140 clients: search above the overview, quick filters, the running client on top. */
export const ManyClients: Story = {
  render: (args) => (
    <DraftsVisible value={args.showDrafts}>
      <ManyBody />
    </DraftsVisible>
  ),
};
