import type { ReactNode } from "react";
import { StateIcon } from "@/ui/v3/patterns/Review";
import { TaskList, type TaskRow } from "@/ui/v3/patterns/TaskList";
import { Button } from "@/ui/v3/primitives/Button";
import { Disclosure } from "@/ui/v3/primitives/Disclosure";
import { Link } from "@/ui/v3/primitives/Link";
import { Markdown } from "@/ui/v3/primitives/Markdown";
import { StatusCallout } from "@/ui/v3/primitives/StatusCallout";
import { Card, CardHead } from "@/ui/v3/primitives/Table";

/**
 * Step 0 of the batch review, „Ergebnis des Stapels" (0208, brief F314): one
 * verdict, one task list, the report turned round — in this order, one column.
 * The three ranks are three surfaces with one job each; nothing says the same
 * thing twice. A composition of the set's building blocks.
 */

export interface Step0Task {
  key: string;
  label: string;
  /** „228 von 231" — the real quantity. */
  counter: string;
  /** The first open example or the reason („z. B. RE-4471 · Büro Schmidt"). */
  sub?: string;
  /** Where the row jumps („Schritt 2"). */
  step: { label: string; href: string };
  level?: "warning" | "error";
}

export interface Step0VM {
  kind: "regular" | "client_batch";
  run: {
    state: "running" | "done";
    number: number;
    /** „25.09., 08:29" */
    from: string;
    /** „08:55" */
    to?: string;
    /** Moment B: the day the practice returned the batch („24.09."). */
    afterReturn?: string;
  };
  /** Moment C: the batch is handed over — the verdict speaks in the past, no button. */
  handedOver?: boolean;
  /** Ludwig himself reported the run as incomplete — part of the verdict, not a box of its own. */
  incomplete?: { at: string; reason: string };
  open: readonly Step0Task[];
  done: readonly Step0Task[];
  /** Rank 4 — is the period complete, as a sentence with its jump. */
  coverage: { complete: boolean; sentence: string; step?: { label: string; href: string } } | null;
  /** Rank 3 — the report, findings first; `null` = Ludwig left none. */
  report: { findings: readonly string[]; summary: string } | null;
}

function runLine(vm: Step0VM): string {
  const r = vm.run;
  const span = r.to ? `${r.from} – ${r.to}` : `seit ${r.from}`;
  return [`Durchgang ${r.number}`, span, r.afterReturn ? `nach Ihrer Rückgabe am ${r.afterReturn}` : null]
    .filter(Boolean)
    .join(" · ");
}

/** Rank 1 — one verdict, one step (A7), Ludwig's own report inside it. */
function Verdict({ vm }: { vm: Step0VM }) {
  const quote = vm.incomplete ? (
    <>
      <span className="s0-quote">Ludwig meldet: „{vm.incomplete.reason}"</span>
      <span className="s0-run">
        {runLine(vm)} · als unvollständig beendet {vm.incomplete.at}
      </span>
    </>
  ) : (
    <span className="s0-run">{runLine(vm)}</span>
  );
  const back =
    vm.incomplete && !vm.handedOver ? (
      <Button variant="secondary" size="sm" href="#return">
        Zurück an Ludwig
      </Button>
    ) : undefined;

  if (vm.run.state === "running") {
    return <StatusCallout tone="neutral" kicker="Ergebnis" title={`Ludwig arbeitet noch — seit ${vm.run.from}`} sub={<span className="s0-run">{runLine(vm)} · die Liste unten ist vorläufig</span>} />;
  }
  if (vm.handedOver) {
    return <StatusCallout tone="neutral" kicker="Ergebnis" title="Ludwig war fertig — der Stapel ist übergeben" sub={quote} />;
  }
  if (vm.open.length > 0) {
    return (
      <StatusCallout
        tone="warning"
        kicker="Ergebnis"
        title={`An ${vm.open.length} ${vm.open.length === 1 ? "Stelle" : "Stellen"} nicht fertig`}
        sub={quote}
        {...(back ? { actions: back } : {})}
      />
    );
  }
  if (vm.incomplete) {
    return (
      <StatusCallout
        tone="neutral"
        icon={<StateIcon state="info" />}
        kicker="Ergebnis · Hinweis"
        title="Ludwig ist fertig, hat den Durchgang aber selbst als unvollständig gemeldet"
        sub={quote}
        {...(back ? { actions: back } : {})}
      />
    );
  }
  return <StatusCallout tone="success" kicker="Ergebnis" title="Ludwig ist fertig" sub={quote} />;
}

function row(t: Step0Task, open: boolean): TaskRow {
  return {
    key: t.key,
    state: open ? (t.level ?? "warning") : "done",
    title: t.label,
    ...(t.sub ? { sub: t.sub } : {}),
    right: (
      <>
        <span className="v2num">{t.counter}</span>
        <Link href={t.step.href}>{t.step.label}</Link>
      </>
    ),
  };
}

/** Rank 2 (+ 4, 6) — one list: open first and open, done quiet and folded; the counts sit in their row. */
function Tasks({ vm }: { vm: Step0VM }) {
  const cov = vm.coverage;
  const coverageRow: TaskRow | null = cov
    ? {
        key: "coverage",
        state: cov.complete ? "done" : "warning",
        title: vm.kind === "client_batch" ? "Personenkonten" : "Zeitraum",
        sub: cov.sentence,
        ...(cov.step ? { right: <Link href={cov.step.href}>{cov.step.label}</Link> } : {}),
      }
    : null;
  const open = [...(coverageRow && !cov!.complete ? [coverageRow] : []), ...vm.open.map((t) => row(t, true))];
  const done = [...vm.done.map((t) => row(t, false)), ...(coverageRow && cov!.complete ? [coverageRow] : [])];
  const running = vm.run.state === "running";
  return (
    <Card>
      <CardHead title="Aufgaben" sub={running ? "vorläufig — Ludwig arbeitet noch" : "wo Sie zuerst hinmüssen"} />
      {/* „Vorläufig" is a word in the head, not dimmed type — dimming would fall below 4.5:1. */}
      <div>
        <TaskList
          groups={[
            // Nothing open: no empty „Offen" bar — the one folded line says it all.
            { key: "open", label: "Offen", rows: open },
            {
              key: "done",
              label: "Erledigt",
              rows: done,
              folded: {
                summary: open.length ? `${done.length} von ${done.length + open.length} erledigt` : `Alle ${done.length} Aufgaben erledigt`,
              },
            },
          ]}
        />
      </div>
    </Card>
  );
}

/** Rank 3 — what Ludwig wants to say: findings first, what he did folded; no scrolling window. */
function Report({ vm }: { vm: Step0VM }): ReactNode {
  return (
    <Card>
      <CardHead title="Was Ludwig meldet" sub={`Übergabebericht, Durchgang ${vm.run.number}`} />
      <div className="v3boxbody s0-report">
        {vm.report === null ? (
          <p className="v2sub">Ludwig hat keinen Bericht hinterlassen.</p>
        ) : (
          <>
            <h3 className="s0-report__head">Auffälligkeiten</h3>
            {vm.report.findings.length ? (
              <ul className="s0-report__list">
                {vm.report.findings.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : (
              <p className="v2sub">Keine Auffälligkeiten.</p>
            )}
            <Disclosure tone="quiet" summary="Was Ludwig gemacht hat">
              <Markdown text={vm.report.summary} />
            </Disclosure>
          </>
        )}
      </div>
    </Card>
  );
}

/**
 * The body of step 0. One column on purpose (F314 idea 5): the step rail
 * already stands at the left, and the three ranks read top-down — a report
 * beside the verdict would compete with it for the first look.
 */
export function Step0Result({ vm }: { vm: Step0VM }) {
  return (
    <div className="v2stack">
      <Verdict vm={vm} />
      <Tasks vm={vm} />
      <Report vm={vm} />
    </div>
  );
}
