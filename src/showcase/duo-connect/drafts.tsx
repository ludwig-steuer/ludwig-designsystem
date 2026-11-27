"use client";

/**
 * Stand-ins for the building blocks the DUO-Connect pages still lack (specs
 * 0263–0270). Each is composed from existing primitives and v3 classes, and
 * each wears a visible „Entwurf · 02xx" mark — switchable through the story
 * argument `showDrafts` — so the owner sees what does not exist yet.
 *
 * ponytail: drafts only. The real blocks come from their specs; none of this
 * moves into src/ui/v3.
 */
import { createContext, useContext, useId, useState, type CSSProperties, type ReactNode } from "react";
import {
  Button,
  Callout,
  Card,
  CardHead,
  CardSection,
  CopyTextButton,
  Progress,
  StateIcon,
  Spinner,
  StatusCallout,
} from "@/ui/v3";
import { STEP_TEXT, SYNC_STATE, type StepKey, type SyncState } from "./fixtures";

/* ── The draft mark ─────────────────────────────────────────────────── */

const DraftContext = createContext(true);

/** Wrap a story in it; `value={false}` hides every draft mark. */
export const DraftsVisible = DraftContext.Provider;

const markText: CSSProperties = {
  fontSize: "var(--fs-ui-2xs)",
  lineHeight: "var(--lh-ui-2xs)",
  fontWeight: 600,
  color: "var(--color-text-subtle)",
  letterSpacing: "0.02em",
};

/** A dashed outline and one line naming the spec the block waits for. */
export function Draft({
  spec,
  name,
  inline,
  children,
}: {
  spec: string;
  name: string;
  inline?: boolean;
  children: ReactNode;
}) {
  const show = useContext(DraftContext);
  if (!show) return <>{children}</>;
  const outline: CSSProperties = {
    outlineStyle: "dashed",
    outlineWidth: "thin",
    outlineColor: "var(--color-border-strong)",
    outlineOffset: "var(--space-1)",
  };
  if (inline) {
    return (
      <span style={{ ...outline, display: "inline-flex", alignItems: "center", gap: "var(--space-1)" }}>
        {children}
        <span style={markText}>{spec}</span>
      </span>
    );
  }
  return (
    <div style={{ ...outline, display: "grid", gap: "var(--space-1)" }}>
      <span style={markText}>
        Entwurf · {spec} {name}
      </span>
      {children}
    </div>
  );
}

/* ── 0264 ProblemCard ───────────────────────────────────────────────── */

/** The three error classes of the plugin (B8), as the user meets them. */
export type ProblemKind = "user" | "retry" | "notYou";

/**
 * One problem: **what** (bold) · cause · next step as a button, technical text
 * folded. Built on StatusCallout, whose `details` already folds inside the
 * same frame.
 */
export function ProblemCard({
  tone = "danger",
  kind,
  what,
  cause,
  next,
  actions,
  technical,
}: {
  tone?: "danger" | "warning";
  kind: ProblemKind;
  what: string;
  cause: string;
  next: string;
  actions?: ReactNode;
  technical?: string;
}) {
  return (
    <Draft spec="0264" name="ProblemCard">
      <StatusCallout
        tone={tone}
        icon={<StateIcon state={tone === "danger" ? "error" : "warning"} />}
        kicker={tone === "danger" ? "Fehler" : "Warnung"}
        title={what}
        sub={
          // The body reads in the text colour: a tone-coloured paragraph of three lines shouts.
          // The next step sits under the sentence that names it, not in the head's right column,
          // where a button with its note squeezed the text to a third of the card (0264).
          <span style={{ display: "grid", gap: "var(--space-3)", color: "var(--color-text)" }}>
            <span>
              {cause}
              {kind === "notYou" ? " Das liegt nicht an Ihnen." : ""} {next}
            </span>
            {actions ? <span style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" }}>{actions}</span> : null}
          </span>
        }
        details={
          technical
            ? {
                summary: "Technische Angaben für den Support",
                children: (
                  <div style={{ display: "grid", gap: "var(--space-2)", justifyItems: "start" }}>
                    <pre
                      className="lw-mono"
                      style={{
                        margin: 0,
                        width: "100%",
                        boxSizing: "border-box",
                        whiteSpace: "pre-wrap",
                        fontSize: "var(--fs-ui-sm)",
                        padding: "var(--space-3)",
                        background: "var(--color-bg-sunken)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      {technical}
                    </pre>
                    <CopyTextButton text={technical} label="Kopieren" size="xs" />
                  </div>
                ),
              }
            : undefined
        }
      />
    </Draft>
  );
}

/* ── 0265 Steps of a sync, as rows (U5) ─────────────────────────────── */

export type StepRowState =
  | { kind: "open" }
  | { kind: "busy"; note: string }
  | { kind: "count"; noun: string; done: number; total: number }
  | { kind: "done"; result: string }
  | { kind: "problem"; result: string }
  | { kind: "cancelled"; at: string }
  | { kind: "notRun" }
  | { kind: "login" };

function stepSign(state: StepRowState): ReactNode {
  switch (state.kind) {
    case "open":
      return <StateIcon state="open" />;
    case "notRun":
      return <StateIcon state="skipped" />;
    case "busy":
    case "count":
      return <span className="v2spin" aria-hidden="true" style={{ color: "var(--color-accent-700)" }} />;
    case "done":
      return <StateIcon state="done" />;
    case "problem":
    case "cancelled":
    case "login":
      return <StateIcon state="warning" />;
  }
}

function stepWord(state: StepRowState): string {
  switch (state.kind) {
    case "open":
      return "offen";
    case "notRun":
      return "nicht gelaufen";
    case "busy":
      return state.note;
    case "count":
      return `${state.noun} ${state.done} von ${state.total}`;
    case "done":
    case "problem":
      return state.result;
    case "cancelled":
      return `abgebrochen bei ${state.at}`;
    case "login":
      return "wartet auf Anmeldung";
  }
}

/** The switched-on steps of one sync, one row each; the running row carries the bar. */
export function StepProgress({ steps }: { steps: { key: StepKey; state: StepRowState }[] }) {
  return (
    <Draft spec="0265" name="Fortschritt in Abschnitten">
      <ol
        aria-label="Schritte des Abgleichs"
        style={{ listStyle: "none", margin: 0, padding: 0, display: "grid" }}
      >
        {steps.map(({ key, state }) => {
          const active = state.kind === "busy" || state.kind === "count" || state.kind === "login";
          return (
            <li
              key={key}
              aria-current={active ? "step" : undefined}
              style={{
                display: "grid",
                gridTemplateColumns: "var(--space-5) minmax(0, 1fr) auto",
                columnGap: "var(--space-3)",
                rowGap: "var(--space-2)",
                alignItems: "center",
                padding: "var(--space-3) 0",
                borderBottom: "var(--border-1-subtle)",
              }}
            >
              <span style={{ display: "inline-flex" }}>{stepSign(state)}</span>
              <span
                style={{
                  fontSize: "var(--fs-ui)",
                  fontWeight: active ? 600 : 400,
                  color: state.kind === "open" || state.kind === "notRun" ? "var(--color-text-muted)" : "var(--color-text)",
                }}
              >
                {STEP_TEXT[key]}
              </span>
              <span
                className="lw-numeric"
                style={{
                  fontSize: "var(--fs-ui-sm)",
                  textAlign: "right",
                  color: state.kind === "problem" || state.kind === "cancelled" || state.kind === "login"
                    ? "var(--color-text)"
                    : "var(--color-text-muted)",
                }}
              >
                {stepWord(state)}
              </span>
              {state.kind === "count" ? (
                <span style={{ gridColumn: "2 / 4" }}>
                  <Progress done={state.done} total={state.total} size="sm" label={null} />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Draft>
  );
}

/* ── 0269 Result: one sentence, then the steps in their end state ──── */

/**
 * The answer first (owner 2026-11-27): a sentence that starts with the state
 * word in bold — no badge above it, no figure tiles. With problems or after a
 * cancel the surface carries sign and tone of the warning step, so the state
 * is plain without a mark floating beside it. Under it the same step rows as
 * during the run (0265), now in their end state: the picture runs from
 * progress into result without a jump.
 */
export function SyncResult({
  state,
  sentence,
  steps,
  actions,
}: {
  state: SyncState;
  sentence: string;
  steps?: { key: StepKey; state: StepRowState }[];
  actions?: ReactNode;
}) {
  const word = SYNC_STATE[state].label;
  const warn = SYNC_STATE[state].tone === "warning";
  const line = (
    <p role="status" style={{ margin: 0, fontSize: "var(--fs-ui-lg)", lineHeight: "var(--lh-ui-lg)", color: "var(--color-text)" }}>
      <strong>{word}.</strong> {sentence}
    </p>
  );
  return (
    <Draft spec="0269" name="Ergebnis">
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        {warn ? (
          <Callout tone="warning">
            <span style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
              <StateIcon state="warning" />
              {line}
            </span>
          </Callout>
        ) : (
          line
        )}
        {steps ? <StepProgress steps={steps} /> : null}
        {actions ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" }}>
            {actions}
          </div>
        ) : null}
      </div>
    </Draft>
  );
}

/* ── 0266 Switch: a setting that acts at once ───────────────────────── */

export type SwitchPhase = "idle" | "saving" | "failed";

/**
 * One row: title and explanation on the left, the switch with its word
 * „An"/„Aus" on the right. The whole row toggles; the switch itself is the
 * focus stop (role="switch", aria-checked). While saving it is locked; when
 * saving fails it springs back and the error stands under the row, announced.
 */
export function SettingSwitch({
  title,
  text,
  on,
  onToggle,
  phase = "idle",
  error,
  announce,
}: {
  title: string;
  text: string;
  on: boolean;
  onToggle?: () => void;
  phase?: SwitchPhase;
  error?: string;
  /** What the page says once the change is stored: „Belegübergabe eingeschaltet". */
  announce?: string;
}) {
  const [hover, setHover] = useState(false);
  const id = useId();
  const locked = phase === "saving";
  const toggle = () => {
    if (!locked) onToggle?.();
  };
  return (
    <Draft spec="0266" name="Switch">
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <div
          onClick={toggle}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: "var(--space-4)",
            alignItems: "center",
            padding: "var(--space-3)",
            margin: "calc(-1 * var(--space-3))",
            borderRadius: "var(--radius-md)",
            cursor: locked ? "progress" : "pointer",
            background: hover && !locked ? "var(--color-bg-soft)" : undefined,
          }}
        >
          <span style={{ display: "grid", gap: "var(--space-1)" }}>
            <span id={`${id}-t`} style={{ fontSize: "var(--fs-ui-md)", fontWeight: 600, color: "var(--color-text)" }}>
              {title}
            </span>
            <span id={`${id}-d`} className="lw-ui-hint">
              {text}
            </span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-2)" }}>
            {locked ? <Spinner label="wird gespeichert …" /> : null}
            <span className="lw-ui-hint" aria-hidden="true" style={{ minWidth: "var(--space-6)", textAlign: "right" }}>
              {on ? "An" : "Aus"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-labelledby={`${id}-t`}
              aria-describedby={`${id}-d`}
              disabled={locked}
              style={{
                position: "relative",
                width: "calc(var(--space-8) + var(--space-2))",
                height: "var(--space-6)",
                padding: 0,
                border: "none",
                borderRadius: "var(--radius-pill)",
                background: on ? "var(--color-primary)" : "var(--color-border-control)",
                opacity: locked ? 0.6 : 1,
                cursor: "inherit",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "var(--space-1)",
                  left: on ? "calc(var(--space-4) + var(--space-2))" : "var(--space-1)",
                  width: "var(--space-4)",
                  height: "var(--space-4)",
                  borderRadius: "var(--radius-pill)",
                  background: "var(--color-surface)",
                  boxShadow: "var(--shadow-xs)",
                }}
              />
            </button>
          </span>
        </div>
        {phase === "failed" && error ? (
          <p role="alert" className="v2field__err" style={{ margin: 0 }}>
            {error}
          </p>
        ) : null}
        {announce ? (
          <span role="status" className="v2vh">
            {announce}
          </span>
        ) : null}
      </div>
    </Draft>
  );
}

/* ── Count line of a batch: the six states, each a quick filter ─────── */

/** Fixed order (owner 2026-11-27): problems first, then what runs, then the rest. */
export const COUNT_ORDER: { key: string; label: string; states: SyncState[] }[] = [
  { key: "issues", label: "Mit Problemen", states: ["succeeded_with_issues"] },
  { key: "cancelled", label: "Abgebrochen", states: ["cancelled"] },
  { key: "running", label: "Läuft", states: ["running"] },
  { key: "queued", label: "Wartet", states: ["queued"] },
  { key: "succeeded", label: "Fertig", states: ["succeeded"] },
  { key: "skipped", label: "Übersprungen", states: ["skipped"] },
];

/**
 * Word and number per state; a 0 stays in its place, grey and inert, so the
 * line never shifts. Each number filters the list; pressed again, it lets go.
 */
export function CountLine({
  counts,
  active,
  onPick,
}: {
  counts: Record<string, number>;
  active: string | null;
  onPick: (key: string | null) => void;
}) {
  return (
    <Draft spec="ohne Spec" name="Zählzeile">
      <div role="group" aria-label="Mandanten nach Stand filtern" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-1) var(--space-4)" }}>
        {COUNT_ORDER.map((c) => {
          const n = counts[c.key] ?? 0;
          const on = active === c.key;
          return (
            <button
              key={c.key}
              type="button"
              aria-pressed={on}
              disabled={n === 0}
              onClick={() => onPick(on ? null : c.key)}
              style={{
                display: "inline-flex",
                gap: "var(--space-1)",
                alignItems: "baseline",
                minHeight: "var(--space-6)",
                padding: "0 var(--space-1)",
                border: "none",
                borderBottom: on ? "var(--border-1-strong)" : "none",
                background: "none",
                fontSize: "var(--fs-ui)",
                fontWeight: on ? 600 : 400,
                color: n === 0 ? "var(--color-text-subtle)" : "var(--color-text)",
                cursor: n === 0 ? "default" : "pointer",
              }}
            >
              {c.label}
              <span className="lw-numeric" style={{ fontWeight: 600 }}>
                {n}
              </span>
            </button>
          );
        })}
      </div>
    </Draft>
  );
}

/* ── Help from the support: no draft mark, every part exists ───────── */

/** Technical facts without client data: error code, step, version, browser, run id. */
export function supportFacts(code: string, step: string): string {
  return `Fehler-Code ${code} · Schritt ${step} · Ludwig DUO-Connect 0.11.0 · Chrome 131 · Abgleich 2026-11-27-0911-a3f2`;
}

/**
 * End of a result and the log (owner 2026-11-27): what goes to the support, and
 * the two ways there. „E-Mail an den Support" opens the mail program with the
 * facts and downloads the log; nothing is sent until the person sends it.
 */
export function SupportHelp({ facts }: { facts: string }) {
  return (
    <Card>
      <CardHead title="Hilfe vom Support" headingLevel={3} />
      <CardSection>
        <div style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}>
          <p className="lw-ui-text">Das Protokoll enthält Mandantendaten. Geben Sie es nur an den Ludwig-Support weiter.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
            <CopyTextButton text={facts} label="Angaben kopieren" />
            <Button size="sm">E-Mail an den Support</Button>
          </div>
          <p className="lw-ui-hint">
            Ihr E-Mail-Programm öffnet sich mit allen Angaben. Das Protokoll wird dabei heruntergeladen — hängen Sie die
            Datei an. Gesendet wird erst, wenn Sie selbst senden.
          </p>
        </div>
      </CardSection>
    </Card>
  );
}

/* ── 0270 Check row while it runs, and with an action ───────────────── */

export type CheckState = "ok" | "hint" | "error" | "unknown" | "running";

const CHECK_CLASS: Record<CheckState, string> = {
  ok: "green",
  hint: "yellow",
  error: "red",
  unknown: "open",
  running: "open",
};

/**
 * The readiness list with every row in place — the order of C6 — including
 * rows still being checked. `CheckItems` groups passed rows away and knows no
 * running state; 0270 adds both.
 */
export function ReadinessRows({
  rows,
}: {
  rows: { code: string; question: string; reason: string; state: CheckState; action?: ReactNode }[];
}) {
  return (
    <Draft spec="0270" name="Prüfpunkt-Zeile">
      <div className="v2pp">
        {rows.map((r) => (
          <div key={r.code} className={`v2pp__row v2pp__row--${CHECK_CLASS[r.state]}`}>
            {r.state === "running" ? (
              <span className="v2spin" aria-hidden="true" style={{ color: "var(--color-accent-700)" }} />
            ) : (
              <StateIcon
                state={r.state === "ok" ? "done" : r.state === "hint" ? "warning" : r.state === "error" ? "error" : "open"}
              />
            )}
            <span style={{ flex: "1 1 auto", minWidth: 0 }}>
              <span className="v2pp__q">{r.question}</span>
              <span className="v2pp__why">{r.state === "running" ? "wird geprüft" : r.reason}</span>
            </span>
            {r.action}
          </div>
        ))}
      </div>
    </Draft>
  );
}
