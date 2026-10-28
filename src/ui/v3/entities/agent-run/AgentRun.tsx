"use client";

import { useEffect, useState } from "react";
import { resolveStatus, type StatusKind } from "@/ludwig/ui/status/status-registry";
import { formatDuration, formatTimeFull } from "../../format";
import { StateIcon, type StateKind } from "../../patterns/Review";
import { Button } from "../../primitives/Button";
import { TextButton } from "../../primitives/TextButton";

/**
 * Ludwig's run (GLOSSARY „Agent run / Lauf", `client_agent_runs`), while
 * it runs and right after it ended (0225).
 *
 * Nothing here asks for the state: the app polls and changes `state`. Only the
 * clock runs in the browser, counted from `startedAt`.
 */

/** The one way on after the run — a button when done, a reference after every other end. */
export type AgentRunAction = { label: string; href: string } | { label: string; onClick: () => void };

type RunFacts = {
  startedAt?: string | Date | null;
  /** „gestartet von Anna Berger"; without a name the part is left out. */
  startedBy?: string | null;
  /** From the earlier runs, „meist fertig nach etwa 12 Min". */
  expectedMinutes?: number | null;
  /** Number of the run within the batch, „2. Lauf". */
  pass?: number | null;
};

type RunningProps = RunFacts & {
  state: "running";
  startedAt: string | Date;
  message?: null;
  action?: null;
};

/**
 * How a run ended (0225, owner 2026-10-28, variant B). Tone and word of every
 * state come from the registry axis `agent_run_banner`, never from here:
 * `done` the regular end; `stopped` broken off or still too long; `taken_over`
 * the office took over; `failed` only a run stuck at a red gate. The app maps
 * its outcomes onto these five (`agentRunBannerState`).
 */
// ponytail: the value set `AGENT_RUN_BANNER_STATES` is not mirrored yet (L-375); import it once it is.
type EndedState = "done" | "stopped" | "taken_over" | "failed";

/**
 * The sign for a tone — the icon carries the registry's word as its name (V7).
 * Neutral has no sign: the sign goes with a level, and the open circle would
 * say „offen" for a run that is over; the sentence carries the word.
 */
const SIGN: Record<StatusKind, StateKind | null> = { success: "done", warning: "warning", danger: "error", info: "info", neutral: null };

/** The facts may stay on: the app can pass the same run in every state; they are not shown once it ended. */
type EndedProps = RunFacts & {
  state: EndedState;
  /** The sentence, in the app's wording („Ludwig ist fertig: 2 neue Rückfragen"). */
  message: string;
  action?: AgentRunAction | null;
};

const RUNNING = "Ludwig arbeitet";

/**
 * @when    A run of Ludwig is going on or has just ended, and every page of the
 *          batch review says so in one bar under the step bar.
 * @instead The same run inside a list row → AgentRunCell. A lasting page-wide
 *          notice without a run → Banner. A short pending action → Button
 *          `loading`. A share of a known whole → Progress.
 */
export function AgentRunBanner(props: RunningProps | EndedProps) {
  const running = props.state === "running";
  const now = useNow(running);
  const { action } = props;
  const status = resolveStatus("agent_run_banner", props.state);
  const sign = SIGN[status.kind];
  return (
    <div className={`v3run v3run--${status.kind}`}>
      {running ? <RunMark /> : sign ? <StateIcon state={sign} title={status.label} /> : null}
      <p className="v3run__text">
        <strong className="v3run__lead">
          {/* The only live part, at the same place in every state: the change
              of state is announced, the minute is not. */}
          <span role="status">{running ? RUNNING : props.message}</span>
          {running ? (
            <>
              {" "}
              <Since startedAt={props.startedAt} now={now} />
            </>
          ) : null}
        </strong>
        {running ? <Facts {...props} /> : null}
        {/* Every end but the regular one offers its way as a reference, not a button. */}
        {!running && props.state !== "done" && action ? (
          <span className="v3run__ref">
            {"href" in action ? (
              <TextButton href={action.href}>{action.label}</TextButton>
            ) : (
              <TextButton onClick={action.onClick}>{action.label}</TextButton>
            )}
          </span>
        ) : null}
      </p>
      {props.state === "done" && action ? (
        <span className="v3run__action">
          {"href" in action ? (
            <Button variant="primary" size="sm" href={action.href}>
              {action.label}
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </span>
      ) : null}
    </div>
  );
}

/**
 * @when    A run of Ludwig in a table or list row („Zu tun" on the client
 *          overview) — the same mark, no button.
 * @instead The bar over a page → AgentRunBanner. A run that has ended is a
 *          state → StatusBadge.
 */
export function AgentRunCell({ startedAt }: { startedAt: string | Date }) {
  const now = useNow(true);
  return (
    <span className="v3runcell">
      <RunMark />
      <span>
        {RUNNING} <Since startedAt={startedAt} now={now} />
      </span>
    </span>
  );
}

function Facts({ startedBy, expectedMinutes, pass }: RunFacts) {
  const parts = [
    expectedMinutes ? `meist fertig nach etwa ${formatDuration(expectedMinutes * 60)}` : null,
    startedBy ? `gestartet von ${startedBy}` : null,
    pass ? `${pass}. Lauf` : null,
  ].filter((p): p is string => p !== null);
  return (
    <>
      {/* The dot is text, so a copied line reads „6 Min · meist fertig …" (H5). */}
      {parts.map((p) => (
        <span key={p}>
          <span className="v3run__sep" aria-hidden="true">
            {" · "}
          </span>
          {p}
        </span>
      ))}
    </>
  );
}

/**
 * „seit 6 Min", the full start as its title (T7). The server's minute is kept
 * through hydration (React leaves suppressed text alone) — so the span is
 * keyed on the browser's first clock and drawn anew once it ticks (H1).
 */
function Since({ startedAt, now }: { startedAt: string | Date; now: number | null }) {
  const seconds = ((now ?? Date.now()) - new Date(startedAt).getTime()) / 1000;
  // Below a minute formatDuration counts seconds with a decimal; a run is counted in minutes.
  const text = seconds >= 60 ? formatDuration(Math.floor(seconds / 60) * 60) : "weniger als 1 Min";
  return (
    <span key={now === null ? "server" : "browser"} title={`Gestartet am ${formatTimeFull(startedAt)}`} suppressHydrationWarning>
      seit {text}
    </span>
  );
}

/** A short piece gliding in a slim track — the sign for „läuft", in the bar and in the row alike. */
function RunMark() {
  return <span className="v3runmark" aria-hidden="true" />;
}

/**
 * Now, renewed every 15 s while `active` — the minute shown is never more than
 * that behind. `null` until the browser has mounted: server and hydration
 * render the same, the first tick tells `Since` to draw its own.
 */
function useNow(active: boolean): number | null {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}
