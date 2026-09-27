"use client";

import { useState, type ReactNode } from "react";
import { Banner } from "../primitives/Banner";
import { Button } from "../primitives/Button";
import { Dialog } from "../primitives/Dialog";
import { Disclosure } from "../primitives/Disclosure";
import { Link } from "../primitives/Link";
import { LogList, type LogEntry } from "./Log";
import {
  Baton,
  ProcessMini,
  ProcessStepper,
  type BatonMeta,
  type ProcessPhase,
  type ProcessPhaseStatus,
} from "./Process";
import { StateIcon, stateLabel, type StateKind } from "./Review";

/**
 * The process picture of a record in three sizes (0204, F305): a cell in the
 * list, a box in the detail head, a dialog that explains it. **One** view
 * model answers the same question in all three — how far, who holds it, what
 * follows. The caller derives it; nothing here calculates a phase, a path or
 * a word.
 */

export type ProcessLevel = "none" | "info" | "warning" | "error";

export interface ProcessPicture {
  /** 0–6 phases; none = no picture (a deleted record), the word stands alone. */
  phases: readonly ProcessPhase[];
  /** The word of the state, from the registry („Bereit zur Buchung"). */
  headline: string;
  level: ProcessLevel;
  holder: BatonMeta;
  /** Something is running right now; `since` comes formatted („seit 40 s"). */
  running?: { since: string; live?: boolean } | null;
  /** What follows, one sentence without „Danach". `null` at the end of the path. */
  next?: string | null;
}

export interface ProcessStep {
  /** Key of the phase the step belongs to. */
  phase: string;
  label: string;
  status: ProcessPhaseStatus;
  at?: string;
  actor?: string;
  note?: string;
  /** Sub-steps, e.g. the stages of reading an invoice. */
  sub?: { label: string; status: ProcessPhaseStatus }[];
}

export interface ProcessDialogDetail {
  /** The record's name — the dialog title. */
  title: string;
  /** „Weg einer Rechnung" — comes finished; the set knows no grammar. */
  pathLabel: string;
  /** One sentence on the state (registry `description`). */
  explanation: string;
  /** The reason it hangs (held / failed), bold — the „what" of an error. */
  reason?: string;
  /** Free text up to 300 characters: the note on the reason, or why it ended. */
  note?: string;
  /** How it ended, in words („Keine Buchung nötig"). */
  end?: string;
  phaseSince?: Partial<Record<string, string>>;
  steps: readonly ProcessStep[];
  /** Counted loops of the record — its own words, not the batch's. */
  loops?: { reopened?: number; returned?: number };
  /** Filled, empty (`[]`) or failed to load (`"error"`). */
  history: LogEntry[] | "error";
  historyHref?: string;
  onRetryHistory?: () => void;
  /** Raw values — the only place database words may stand (T4). */
  technical: readonly [string, string][];
  /** The way to the explanation of the axis — `StatusInfoButton` from the caller. */
  axis?: ReactNode;
  links?: readonly { label: string; href: string }[];
}

const LEVEL_STATE: Partial<Record<ProcessLevel, StateKind>> = { warning: "warning", error: "error" };

const STEP_STATE: Record<ProcessPhaseStatus, StateKind> = {
  done: "done",
  active: "open",
  held: "warning",
  failed: "error",
  pending: "open",
};

/**
 * The sign of the level — only for warning and error; the word always stands.
 * Without a sign the space stays, so the words of a column start in one line.
 */
function LevelSign({ level }: { level: ProcessLevel }) {
  const state = LEVEL_STATE[level];
  return (
    <span className="pz-sign">
      <span aria-hidden="true">{state ? <StateIcon state={state} /> : null}</span>
      {state ? <span className="v2vh">{stateLabel(state)}:</span> : null}
    </span>
  );
}

function accessibleName(p: ProcessPicture, withHolder: boolean): string {
  const level = LEVEL_STATE[p.level];
  return [
    level ? `${stateLabel(level)}:` : null,
    p.headline,
    withHolder && p.holder.key !== "niemand" ? `· ${p.holder.label}` : null,
  ]
    .filter(Boolean)
    .join(" ");
}

/** A button when it opens something, a plain span when it does not — no hover without a target. */
function Target({
  onOpen,
  label,
  className,
  children,
}: {
  onOpen?: () => void;
  label: string;
  className: string;
  children: ReactNode;
}) {
  return onOpen ? (
    <button type="button" className={`${className} is-interactive`} onClick={onOpen} aria-label={label} title={label}>
      {children}
    </button>
  ) : (
    <span className={className} title={label}>
      {children}
    </span>
  );
}

/**
 * The picture in a table cell: segments of one fixed width and the word of the
 * state; under the word, who holds it, with its sign. `narrow` keeps it to one
 * line. The whole cell is one target.
 *
 * @when    Progress of a record in a list row, with a way to the explanation.
 * @instead The head of the detail page → ProcessBox. Only the segments,
 *          nothing to open → ProcessMini. A state without a chain → StatusBadge.
 */
export function ProcessCell({
  picture,
  density = "regular",
  onOpen,
  loading = false,
  error,
}: {
  picture: ProcessPicture;
  /** `narrow` drops the holder word — for dense tables (review, drawer lists). */
  density?: "regular" | "narrow";
  /** Without it the cell is not clickable: no hover, no focus. */
  onOpen?: () => void;
  loading?: boolean;
  /** Could not be derived — the word of the failure instead of the picture. */
  error?: string;
}) {
  if (loading) {
    return (
      <span className="pz-cell">
        <span className="v2skel pz-cell__skel" aria-hidden="true" />
        <span className="v2vh">Wird geladen …</span>
      </span>
    );
  }
  if (error) {
    return (
      <span className="pz-cell is-error">
        <span aria-hidden="true" className="pz-sign">
          <StateIcon state="error" />
        </span>
        <span className="pz-cell__word">{error}</span>
      </span>
    );
  }
  const withHolder = density === "regular";
  return (
    <Target onOpen={onOpen} label={accessibleName(picture, withHolder)} className="pz-cell">
      {picture.phases.length ? <ProcessMini phases={picture.phases} /> : <span className="pz-cell__none">—</span>}
      <LevelSign level={picture.level} />
      <span className="pz-cell__word">{picture.headline}</span>
      {/* The holder stands in a line of its own under the state word, with its
          sign (owner 2026-09-27) — who is on it is read as a second fact. */}
      {withHolder && picture.holder.key !== "niemand" ? (
        <span className="pz-cell__holder">
          <Baton owner={picture.holder} />
        </span>
      ) : null}
    </Target>
  );
}

/** Phases with their words in one line, each the same width — the stepper, compact. */
function CompactPhases({ phases }: { phases: readonly ProcessPhase[] }) {
  return (
    <span className="pz-box__phases">
      {phases.map((p) => (
        <span key={p.key} className={p.status === "pending" ? undefined : `is-${p.status}`}>
          {p.label}
        </span>
      ))}
    </span>
  );
}

/**
 * The picture in the head of a detail page: the phases with their words, and
 * nothing else — the state word, the holder and what follows are one click
 * away in the dialog (owner 2026-09-27). Only a warning or an error stands
 * here too, with sign and word: that is the one thing that must not wait for
 * a click. No frame; the phases are the shape.
 *
 * @when    Progress of the record in its detail head (`EntityHeader` with
 *          `processPlacement="end"`), opens the explanation.
 * @instead A list row → ProcessCell. The full chain with loops and owner in
 *          the head of a batch → ProcessStepper.
 */
export function ProcessBox({ picture, onOpen }: { picture: ProcessPicture; onOpen?: () => void }) {
  const alarm = picture.level === "warning" || picture.level === "error";
  return (
    <Target onOpen={onOpen} label={`Fortschritt: ${accessibleName(picture, true)}`} className="pz-box">
      {picture.phases.length ? (
        <CompactPhases phases={picture.phases} />
      ) : (
        <span className="pz-box__phases">
          <span className="is-empty">{picture.headline}</span>
        </span>
      )}
      {alarm ? (
        <span className="pz-box__line">
          <LevelSign level={picture.level} />
          <span className="pz-box__word">{picture.headline}</span>
        </span>
      ) : null}
    </Target>
  );
}

function Steps({ steps, phases }: { steps: readonly ProcessStep[]; phases: readonly ProcessPhase[] }) {
  return (
    <ol className="pz-steps">
      {phases.flatMap((phase) =>
        steps
          .filter((s) => s.phase === phase.key)
          .map((s, i) => (
            <li key={`${phase.key}-${i}`} className={`is-${s.status}`}>
              <span className="pz-steps__sign">
                {/* The active step is drawn filled; its name says so, not „offen". */}
                <StateIcon state={STEP_STATE[s.status]} title={s.status === "active" ? "aktuell" : undefined} />
              </span>
              <span className="pz-steps__label">
                {s.label}
                {s.note ? <span className="v2sub">{s.note}</span> : null}
                {s.sub?.length ? (
                  <ol className="pz-steps__sub">
                    {s.sub.map((u) => (
                      <li key={u.label} className={`is-${u.status}`}>
                        <span className="pz-steps__sign">
                          <StateIcon state={STEP_STATE[u.status]} />
                        </span>
                        {u.label}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </span>
              <span className="pz-steps__at">{s.at ?? ""}</span>
              <span className="pz-steps__actor">{s.actor ?? ""}</span>
            </li>
          )),
      )}
    </ol>
  );
}

function History({ detail }: { detail: ProcessDialogDetail }) {
  if (detail.history === "error") {
    return (
      <Banner tone="danger" title="Verlauf nicht geladen">
        Der Verlauf dieses Belegs ließ sich gerade nicht abrufen. Der Stand oben ist davon nicht betroffen.{" "}
        {detail.onRetryHistory ? (
          <Button variant="secondary" size="xs" onClick={detail.onRetryHistory}>
            Verlauf erneut laden
          </Button>
        ) : null}
      </Banner>
    );
  }
  if (!detail.history.length) {
    return (
      <p className="v2sub">
        Für diesen Beleg sind noch keine Zustandswechsel aufgezeichnet.
        {detail.historyHref ? (
          <>
            {" "}
            <Link href={detail.historyHref}>Zum Verlauf</Link>
          </>
        ) : null}
      </p>
    );
  }
  return <LogList entries={detail.history} order="newest" />;
}

/**
 * The explanation of where this record stands: its path, now, what follows,
 * every step, the history and — folded — the raw values.
 *
 * @when    Opened from ProcessCell or ProcessBox: the situation of **this**
 *          record.
 * @instead All states of the axis and how they connect → StatusInfoDialog.
 */
export function ProcessDialog({
  open,
  onClose,
  picture,
  detail,
  technicalOpen = false,
}: {
  open: boolean;
  onClose: () => void;
  picture: ProcessPicture;
  detail: ProcessDialogDetail;
  /** „Technik" open from the start — for support, who come for the raw values. */
  technicalOpen?: boolean;
}) {
  const heldOrFailed = picture.level === "warning" || picture.level === "error";
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={detail.title}
      kicker={detail.pathLabel}
      size="lg"
      footer={
        detail.links?.length ? (
          <span className="pz-dlg__links">
            {detail.links.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </span>
        ) : undefined
      }
    >
      <div className="pz-dlg">
        {picture.phases.length ? (
          <ProcessStepper
            phases={picture.phases}
            owner={picture.holder}
            alarm={picture.level === "error"}
            phaseSince={detail.phaseSince}
          />
        ) : null}
        {detail.loops?.reopened || detail.loops?.returned ? (
          <div className="pz-loops">
            {[
              detail.loops.reopened ? `${detail.loops.reopened}× wieder geöffnet` : null,
              detail.loops.returned ? `${detail.loops.returned}× zurückgegeben` : null,
            ]
              .filter(Boolean)
              .join(" · ")}
          </div>
        ) : null}

        <dl className="pz-dlg__now">
          <dt>Jetzt</dt>
          <dd>
            <span className="pz-box__line">
              <LevelSign level={picture.level} />
              <strong>{picture.headline}</strong>
              {picture.holder.key !== "niemand" ? <Baton owner={picture.holder} /> : null}
              {picture.running ? <span className="pz-box__since">{picture.running.since}</span> : null}
            </span>
            {heldOrFailed && detail.reason ? (
              <p>
                <strong>{detail.reason}.</strong> {detail.explanation}
              </p>
            ) : (
              <p>{detail.explanation}</p>
            )}
            {detail.end ? (
              <p>
                <strong>{detail.end}.</strong>
              </p>
            ) : null}
            {detail.note ? <p className="pz-dlg__note">{detail.note}</p> : null}
          </dd>
          {picture.next ? (
            <>
              <dt>Danach</dt>
              <dd>{picture.next}</dd>
            </>
          ) : null}
        </dl>

        {detail.steps.length ? (
          <section>
            <h3 className="pz-dlg__head">Schritte</h3>
            <Steps steps={detail.steps} phases={picture.phases} />
          </section>
        ) : null}

        <section>
          <h3 className="pz-dlg__head">Verlauf</h3>
          <History detail={detail} />
        </section>

        <Disclosure summary="Technik" defaultOpen={technicalOpen}>
          <dl className="pz-dlg__tech">
            {detail.technical.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {detail.axis}
        </Disclosure>
      </div>
    </Dialog>
  );
}

/**
 * A cell or box together with its dialog — the usual wiring, so a page does
 * not hold the open state itself.
 *
 * @when    A list or a head shows the picture and opens the explanation on click.
 * @instead The dialog opened from elsewhere → ProcessDialog with own state.
 */
export function ProcessPictureTrigger({
  picture,
  detail,
  size,
  density,
}: {
  picture: ProcessPicture;
  detail: ProcessDialogDetail;
  size: "cell" | "box";
  density?: "regular" | "narrow";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {size === "cell" ? (
        <ProcessCell picture={picture} density={density} onOpen={() => setOpen(true)} />
      ) : (
        <ProcessBox picture={picture} onOpen={() => setOpen(true)} />
      )}
      <ProcessDialog open={open} onClose={() => setOpen(false)} picture={picture} detail={detail} />
    </>
  );
}
