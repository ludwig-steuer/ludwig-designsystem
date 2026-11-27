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
import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import {
  Badge,
  CopyTextButton,
  KpiGrid,
  KpiTile,
  Progress,
  StateIcon,
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

/* ── 0268 Spinner ───────────────────────────────────────────────────── */

/**
 * Running indicator. `sm` sits next to a word in a row, `lg` stands in an area
 * with its word. The word is always there — visible, or for screen readers
 * only (`hideLabel`), never missing.
 */
export function Spinner({
  size = "sm",
  label,
  hideLabel,
}: {
  size?: "sm" | "lg";
  label: string;
  hideLabel?: boolean;
}) {
  const big = size === "lg";
  return (
    <Draft spec="0268" name="Spinner" inline>
      <span
        role="status"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: big ? "var(--space-3)" : "var(--space-2)",
          color: "var(--color-text-muted)",
          fontSize: big ? "var(--fs-ui-md)" : "var(--fs-ui-sm)",
        }}
      >
        <span
          className="v2spin"
          aria-hidden="true"
          style={{
            color: "var(--color-accent-700)",
            ...(big ? { width: "var(--space-6)", height: "var(--space-6)" } : {}),
          }}
        />
        <span className={hideLabel ? "v2vh" : undefined}>{label}</span>
      </span>
    </Draft>
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
                    <CopyTextButton text={technical} label="Technische Angaben kopieren" size="xs" />
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
  | { kind: "login" };

function stepSign(state: StepRowState): ReactNode {
  switch (state.kind) {
    case "open":
      return <StateIcon state="open" />;
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
                  color: state.kind === "open" ? "var(--color-text-muted)" : "var(--color-text)",
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

/* ── 0269 ResultSummary ─────────────────────────────────────────────── */

/**
 * The answer first: the state word, one sentence in large type, the figures
 * underneath, the next step as buttons. The badge carries the state, so the
 * sentence does not repeat it.
 */
export function ResultSummary({
  state,
  sentence,
  figures,
  actions,
}: {
  state: SyncState;
  sentence: string;
  figures: { label: string; value: string }[];
  actions?: ReactNode;
}) {
  const s = SYNC_STATE[state];
  return (
    <Draft spec="0269" name="StatusCallout figures">
      <div style={{ display: "grid", gap: "var(--space-4)" }}>
        <div style={{ display: "grid", gap: "var(--space-2)", justifyItems: "start" }}>
          <Badge tone={s.tone}>{s.label}</Badge>
          <p
            role="status"
            style={{
              margin: 0,
              fontSize: "var(--fs-ui-xl)",
              lineHeight: "var(--lh-ui-xl)",
              fontWeight: 600,
              color: "var(--color-text)",
            }}
          >
            {sentence}
          </p>
        </div>
        <KpiGrid columns={figures.length}>
          {figures.map((f) => (
            <KpiTile key={f.label} label={f.label} value={f.value} />
          ))}
        </KpiGrid>
        {actions ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)", alignItems: "center" }}>
            {actions}
          </div>
        ) : null}
      </div>
    </Draft>
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
