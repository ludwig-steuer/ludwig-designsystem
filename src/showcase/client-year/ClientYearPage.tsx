"use client";

import type { ReactNode } from "react";
import { Columns } from "@/ui/v3/patterns/Columns";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { Baton, ProcessMini, type BatonMeta, type ProcessPhase } from "@/ui/v3/patterns/Process";
import { StateIcon } from "@/ui/v3/patterns/Review";
import { EntityIcon } from "@/ui/v3/Icons";
import { Button } from "@/ui/v3/primitives/Button";
import { Link } from "@/ui/v3/primitives/Link";
import { Card, CardFoot, CardHead } from "@/ui/v3/primitives/Table";

/**
 * The start page of a client's year (0207, brief F312): a switch, not a
 * destination. Who is it · what do I have to do · is the year in order — in
 * this reading order, and nothing else. A composition of the set's building
 * blocks; the app derives every number.
 *
 * Owner 2026-09-27 at the picture: the profile smaller (words in the meta line,
 * no fact tiles); on the right a compact batch history that gives the feeling
 * „all is well" — the finished months in one line, only what is still open on
 * its own; the month grid is gone.
 */

export interface ClientProfile {
  name: string;
  datevNumber: string;
  chart: string;
  taxation: string;
  rhythm: string;
  responsible: string | null;
  /** „24.09.2026 · vor 3 Tagen" — the one timestamp of the page (F312 idea 8). */
  mirrorAsOf: string | null;
}

export interface Task {
  key: string;
  level: "error" | "warning" | "info";
  title: string;
  sub?: string;
  action: { label: string; href: string };
}

export interface Elsewhere {
  holder: BatonMeta;
  /** „2 Stapel werden gebucht", „1 Rückfrage offen" */
  text: string;
  href: string;
}

export interface BatchEntry {
  key: string;
  /** „August" — the period in words. */
  period: string;
  number: string;
  /** done = in DATEV; open = in work; failed = stuck. */
  state: "done" | "open" | "failed";
  /** The state in words, from the registry („Kanzlei prüft"). */
  word: string;
  phases: readonly ProcessPhase[];
  href: string;
}

export interface ClientYearVM {
  year: number;
  profile: ClientProfile;
  counts: { documents: number; openCases: number; inDatevUntil: string | null };
  tasks: readonly Task[];
  elsewhere: readonly Elsewhere[];
  /** When nothing is to do: what happens next („der nächste Stapel öffnet am 01.10.2026"). */
  nextUp?: string;
  /** The year's batches, newest first. */
  batches: readonly BatchEntry[];
}

/** At most this many tasks stand open; the rest behind „alle n anzeigen" (F312 scenario 5). */
const TASK_CAP = 5;

function Tasks({ vm }: { vm: ClientYearVM }) {
  const shown = vm.tasks.slice(0, TASK_CAP);
  return (
    <Card>
      <CardHead title="Zu tun" {...(vm.tasks.length ? { meta: String(vm.tasks.length) } : {})} />
      <div className="cy-tasks">
        <h3 className="cy-tasks__head">Sie sind dran</h3>
        {vm.tasks.length === 0 ? (
          <p className="cy-tasks__empty">
            <StateIcon state="done" />
            Nichts zu tun{vm.nextUp ? ` — ${vm.nextUp}` : "."}
          </p>
        ) : (
          <ul className="cy-tasks__list">
            {shown.map((t, i) => (
              <li key={t.key} className="cy-task">
                <StateIcon state={t.level} />
                <span className="cy-task__text">
                  <span className="cy-task__title">{t.title}</span>
                  {t.sub ? <span className="cy-task__sub">{t.sub}</span> : null}
                </span>
                <Button variant={i === 0 ? "primary" : "secondary"} size="sm" href={t.action.href}>
                  {t.action.label}
                </Button>
              </li>
            ))}
          </ul>
        )}
        {vm.elsewhere.length ? (
          <>
            <h3 className="cy-tasks__head">Liegt bei anderen</h3>
            <ul className="cy-tasks__list">
              {vm.elsewhere.map((e) => (
                <li key={e.holder.key + e.text} className="cy-else">
                  <Baton owner={e.holder} />
                  <span className="cy-else__text">{e.text}</span>
                  <Link href={e.href}>anzeigen</Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
      {vm.tasks.length > TASK_CAP ? (
        <CardFoot>
          <Link href="#tasks=all">Alle {vm.tasks.length} Aufgaben anzeigen</Link>
        </CardFoot>
      ) : null}
    </Card>
  );
}

/**
 * The year's batches, calm: everything already in DATEV folds into one line
 * with a tick („Januar bis Juli · 7 Stapel in DATEV"); only what is still in
 * work or stuck stands on its own, with its position in the chain.
 */
function BatchHistory({ vm }: { vm: ClientYearVM }) {
  const done = vm.batches.filter((b) => b.state === "done");
  const pending = vm.batches.filter((b) => b.state !== "done");
  const first = done[done.length - 1];
  const last = done[0];
  return (
    <Card>
      <CardHead title={`Stapel ${vm.year}`} />
      <div className="cy-hist">
        {vm.batches.length === 0 ? (
          <p className="v2sub">Noch kein Stapel. Der erste entsteht, sobald die Einrichtung freigegeben ist.</p>
        ) : null}
        {pending.map((b) => (
          <a key={b.key} href={b.href} className="cy-hist__row">
            <StateIcon state={b.state === "failed" ? "error" : "open"} />
            <span className="cy-hist__period">{b.period}</span>
            <span className="cy-hist__word">{b.word}</span>
            <ProcessMini phases={b.phases} />
          </a>
        ))}
        {done.length ? (
          <p className="cy-hist__done">
            <StateIcon state="done" />
            <span>
              {done.length === 1 ? `${first!.period}` : `${first!.period} bis ${last!.period}`} ·{" "}
              {done.length === 1 ? "1 Stapel in DATEV" : `${done.length} Stapel in DATEV`}
            </span>
          </p>
        ) : null}
      </div>
      {vm.batches.length ? (
        <CardFoot>
          <Link href="#batches">Alle Stapel</Link>
        </CardFoot>
      ) : null}
    </Card>
  );
}

function Counts({ vm }: { vm: ClientYearVM }): ReactNode {
  const c = vm.counts;
  return (
    <span className="cy-counts">
      <Link href="#documents">{c.documents.toLocaleString("de-DE")} Belege</Link>
      <Link href="#cases">{c.openCases.toLocaleString("de-DE")} Sachverhalte offen</Link>
      {c.inDatevUntil ? <Link href="#datev">in DATEV gebucht bis {c.inDatevUntil}</Link> : <span>noch nichts in DATEV</span>}
    </span>
  );
}

export function ClientYearPage({ vm }: { vm: ClientYearVM }) {
  const p = vm.profile;
  return (
    <div className="v2stack cy-page">
      {/* Rank 0 — who is it: the profile in the head as one line of words (F312 idea 1, owner: smaller). */}
      <EntityHeader
        icon={<EntityIcon entity="client" />}
        overline={`Mandant · DATEV ${p.datevNumber} · Jahr ${vm.year}`}
        title={p.name}
        meta={
          <>
            <span>{p.chart}</span>
            <span>{p.taxation}</span>
            <span>{p.rhythm}</span>
            <span>{p.responsible ? `zuständig ${p.responsible}` : "niemand zuständig"}</span>
            <span>{p.mirrorAsOf ? `DATEV-Spiegel ${p.mirrorAsOf}` : "DATEV-Spiegel noch nicht abgerufen"}</span>
            <Link href="#master-data">Alle Stammdaten</Link>
          </>
        }
        summary={<Counts vm={vm} />}
      />
      {/* Rank 1–3 left, the batch history right; narrow: tasks first (F312 scenario 6). */}
      <Columns pattern="split" asideWidth="record" main={<Tasks vm={vm} />} aside={<BatchHistory vm={vm} />} />
    </div>
  );
}
