"use client";

import type { ReactNode } from "react";
import { Columns } from "@/ui/v3/patterns/Columns";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { PeriodGrid, type PeriodCell, type PeriodColumn } from "@/ui/v3/patterns/PeriodGrid";
import { Baton, type BatonMeta } from "@/ui/v3/patterns/Process";
import { ProcessPictureTrigger, type ProcessDialogDetail, type ProcessPicture } from "@/ui/v3/patterns/ProcessPicture";
import { StateIcon } from "@/ui/v3/patterns/Review";
import { EntityIcon } from "@/ui/v3/Icons";
import { Button } from "@/ui/v3/primitives/Button";
import { Link } from "@/ui/v3/primitives/Link";
import { Card, CardFoot, CardHead } from "@/ui/v3/primitives/Table";

/**
 * The start page of a client's year (0207, brief F312): a switch, not a
 * destination. Who is it · what do I have to do · where does the current batch
 * stand · how far is the year — in this reading order, and nothing else. A
 * composition of the set's building blocks; the app derives every number.
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

export interface ClientYearVM {
  year: number;
  profile: ClientProfile;
  counts: { documents: number; openCases: number; inDatevUntil: string | null };
  tasks: readonly Task[];
  elsewhere: readonly Elsewhere[];
  /** When nothing is to do: what happens next („der nächste Stapel öffnet am 01.10.2026"). */
  nextUp?: string;
  currentBatch: { label: string; href: string; picture: ProcessPicture; detail: ProcessDialogDetail } | null;
  months: readonly PeriodColumn[];
  batchCells: Partial<Record<string, PeriodCell>>;
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

function CurrentBatch({ vm }: { vm: ClientYearVM }) {
  return (
    <Card>
      <CardHead title="Aktueller Stapel" {...(vm.currentBatch ? { sub: vm.currentBatch.label } : {})} />
      <div className="v3boxbody">
        {vm.currentBatch ? (
          <>
            <ProcessPictureTrigger picture={vm.currentBatch.picture} detail={vm.currentBatch.detail} size="box" />
            <p className="cy-batch__link">
              <Link href={vm.currentBatch.href}>Zum Stapel</Link>
            </p>
          </>
        ) : (
          <p className="v2sub">
            Noch kein Stapel. Der erste entsteht, sobald die Einrichtung freigegeben ist.
          </p>
        )}
      </div>
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
      {/* Rank 0 — who is it: the profile in the head, one line of words, no tiles (F312 idea 1). */}
      <EntityHeader
        icon={<EntityIcon entity="client" />}
        overline={`Mandant · DATEV ${p.datevNumber} · Jahr ${vm.year}`}
        title={p.name}
        meta={
          p.mirrorAsOf ? (
            <>
              <span>DATEV-Spiegel Stand {p.mirrorAsOf}</span>
              <Link href="#master-data">Alle Stammdaten</Link>
            </>
          ) : (
            <>
              <span>DATEV-Spiegel noch nicht abgerufen</span>
              <Link href="#master-data">Alle Stammdaten</Link>
            </>
          )
        }
        facts={[
          ["Kontenrahmen", p.chart],
          ["Versteuerung", p.taxation],
          ["Buchungsrhythmus", p.rhythm],
          ["Zuständig", p.responsible ?? "niemand eingetragen"],
        ]}
        summary={<Counts vm={vm} />}
      />
      {/* Rank 1–3 left, the current batch right; narrow: tasks first (F312 scenario 6). */}
      <Columns pattern="split" asideWidth="record" main={<Tasks vm={vm} />} aside={<CurrentBatch vm={vm} />} />
      {/* Rank 4 — how far is the year: one picture. No own warning colour; a gap is a task above. */}
      <PeriodGrid
        title={`Das Jahr ${vm.year}`}
        sub="ein Monat, ein Stapel"
        periods={vm.months}
        rows={Object.keys(vm.batchCells).length ? [{ key: "b", label: "Stapel", cells: vm.batchCells }] : []}
        empty="Noch kein Stapel in diesem Jahr — der erste entsteht nach der Einrichtung."
      />
    </div>
  );
}
