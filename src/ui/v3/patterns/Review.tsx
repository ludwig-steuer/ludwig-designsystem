import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleSlash,
  HelpCircle,
  Info,
  PencilLine,
  Undo2,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { ActionIcon } from "../Icons";
import { HeadRow, Table, rowCells } from "../primitives/Table";
import { TableLoading } from "../primitives/Cells";
import { Progress } from "../primitives/Progress";

/**
 * v2 review building blocks (F123 T123.1): state icon, checklist, check
 * items, messages.
 *
 * Shared rule: **passed is one line, not twenty.** Whatever is in order is
 * summarized; only what is open, warned or failed gets a line of its own
 * (UX guidelines L7). Otherwise the reviewer hunts for her three problems
 * among twenty green check marks.
 */

/* ── State icon ──────────────────────────────────────────────────────────
 * The design draws the states as special characters (○ ✓ ✎ ↩ ? ⊘). Ludwig
 * uses Lucide: a Unicode glyph renders differently depending on the font and
 * has no name for the screen reader (UX guidelines §2).
 */

export type StateKind =
  | "open"
  | "done"
  | "edited"
  | "returned"
  | "question"
  | "skipped"
  | "warning"
  | "error"
  | "info";

const ICONS = {
  open: { Icon: Circle, tone: "muted", label: "offen" },
  done: { Icon: CheckCircle2, tone: "success", label: "erledigt" },
  edited: { Icon: PencilLine, tone: "info", label: "bearbeitet" },
  returned: { Icon: Undo2, tone: "warning", label: "zurückgegeben" },
  question: { Icon: HelpCircle, tone: "warning", label: "Frage offen" },
  skipped: { Icon: CircleSlash, tone: "muted", label: "übersprungen" },
  warning: { Icon: AlertTriangle, tone: "warning", label: "Warnung" },
  error: { Icon: XCircle, tone: "danger", label: "Fehler" },
  info: { Icon: Info, tone: "info", label: "Hinweis" },
} as const satisfies Record<StateKind, { Icon: typeof Circle; tone: string; label: string }>;

const TONE_VAR: Record<string, string> = {
  muted: "var(--color-text-subtle)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-accent-700)",
};

/**
 * @when    State of an item in a list or row, always with a word next to it.
 * @instead A state from a registry axis → StatusBadge. A thing or an
 *          action → EntityIcon / ActionIcon.
 */
export function StateIcon({ state, title }: { state: StateKind; title?: string }) {
  const { Icon, tone, label } = ICONS[state];
  return (
    <Icon
      size={15}
      strokeWidth={1.5}
      color={TONE_VAR[tone]}
      aria-label={title ?? label}
      role="img"
    />
  );
}

/* ── Checklist ─────────────────────────────────────────────────────────── */

export interface ChecklistRow {
  key: string;
  state: StateKind;
  label: string;
  /** „3 von 18" — the real quantity, never an invented „0 von 1". */
  counter?: string;
  counterAlarm?: boolean;
  /** Share 0…1; without a value the column stays empty. */
  progress?: number | null;
  /** Where the row jumps to („→ Schritt 4: Zahlungen"). */
  jump?: string;
}

/**
 * The check list of a gate (design `PruefChecklist.dc.html`): check · status
 * · progress · jump. The caller builds the detail pane on the right, usually
 * inside a `MasterDetail`.
 *
 * @when    Checklist of a gate: check, status, progress, jump.
 * @instead Items to work through → TodoList.
 */
export function Checklist({
  rows,
  activeKey,
  onPick,
  loading,
}: {
  rows: ChecklistRow[];
  activeKey?: string;
  onPick?: (key: string) => void;
  /**
   * The checks are still running. Without this the table stood there with its
   * column heads and **no rows** — and that reads as „nothing open, nothing
   * done", the opposite of what is happening (V9/T6, 0109).
   */
  loading?: boolean;
}) {
  const cols = "20px minmax(0, 1fr) 76px 100px 150px";
  return (
    <div className="v2card">
      {/* A real `<table>` like every other list of the set (0106): the
          checklist is a table — each row has the same five columns, and a
          screen reader has to be able to read them column by column. */}
      <Table cols={cols}>
        <HeadRow>
          <span />
          <span>Prüfung</span>
          <span className="v2num">Stand</span>
          <span>Fortschritt</span>
          <span>Sprung</span>
        </HeadRow>
        {loading ? (
          // Die Form des Inhalts, nicht ein Kasten: so viele Zeilen, wie
          // kommen werden — und mindestens vier, damit die Karte nicht in
          // sich zusammenfällt. Der Spaltenkopf bleibt stehen; er ist die
          // Zusage, was kommt.
          <TableLoading rows={Math.max(rows.length, 4)} cols={5} />
        ) : (
          rows.map((r) => (
            <ChecklistLine key={r.key} row={r} active={r.key === activeKey} onPick={onPick} />
          ))
        )}
      </Table>
    </div>
  );
}

function ChecklistLine({
  row,
  active,
  onPick,
}: {
  row: ChecklistRow;
  active: boolean;
  onPick?: (key: string) => void;
}) {
  const body = (
    <>
      <span className="v2chk__icon">
        <StateIcon state={row.state} />
      </span>
      <span className="v2chk__label">{row.label}</span>
      <span className={`v2num v2chk__stand${row.counterAlarm ? " v2num--danger" : ""}`}>
        {row.counter ?? ""}
      </span>
      <span>
        {row.progress == null ? null : (
          // The counter to the left already carries the number, so the bar
          // stays label-free here.
          <Progress
            share={row.progress}
            tone={row.state === "warning" ? "warning" : "accent"}
            label={null}
          />
        )}
      </span>
      <span className="v2chk__jump">
        {/* The arrow is a Lucide sign, not „→" (T9, 0093 c). */}
        {row.jump ? (
          <>
            <ActionIcon action="forward" size={12} />
            {row.jump}
          </>
        ) : (
          ""
        )}
      </span>
    </>
  );
  if (!onPick)
    return <tr className={`v2tbl__row${active ? " is-active" : ""}`}>{rowCells(body)}</tr>;
  return (
    // The button is in the first cell and covers the row (0106): a `<tr>`
    // cannot be a button, and a row that is one is no longer a row.
    <tr className={`v2tbl__row is-clickable${active ? " is-active" : ""}`}>
      {rowCells(body, (node) => (
        <button type="button" className="v2rowbtn" onClick={() => onPick(row.key)}>
          {node}
        </button>
      ))}
    </tr>
  );
}

/* ── Check items ───────────────────────────────────────────────────────── */

export interface CheckItem {
  code: string;
  /** What is checked, as a question — „Stimmt der Steuersatz zum Beleg?" */
  question: string;
  /** Why the result is what it is. Always filled, otherwise the level is an oracle. */
  reason: string;
  state: "green" | "yellow" | "red" | "open";
  /** Jump to the place where the item can be resolved. */
  jump?: ReactNode;
  /** The gate: a red or yellow item has to be checked off. */
  gate?: ReactNode;
}

const PP_ICON: Record<CheckItem["state"], StateKind> = {
  green: "done",
  yellow: "warning",
  red: "error",
  open: "open",
};

/**
 * Check items as an accordion. Passed ones are summarized in a single line;
 * open, warned and failed ones individually, each with a reason.
 *
 * @when    Individual checks of a journal entry with reasons; passed ones in a single line.
 * @instead Error that blocks saving → Messages.
 */
export function CheckItems({ items }: { items: CheckItem[] }) {
  const passed = items.filter((i) => i.state === "green");
  const open = items.filter((i) => i.state !== "green");
  return (
    <div className="v2pp">
      {passed.length > 0 ? (
        <div className="v2pp__ok">
          <StateIcon state="done" />
          {passed.length} von {items.length} Prüfpunkten bestanden
          <span className="v2pp__code">{passed.map((b) => b.code).join(" ")}</span>
        </div>
      ) : null}
      {open.map((i) => (
        <div className="v2pp__row" key={i.code}>
          <StateIcon state={PP_ICON[i.state]} />
          <span style={{ flex: "1 1 auto", minWidth: 0 }}>
            <span className="v2pp__q">
              {i.question} <span className="v2pp__code">{i.code}</span>
            </span>
            <span className="v2pp__why">{i.reason}</span>
          </span>
          {i.gate}
          {i.jump}
        </div>
      ))}
      {items.length === 0 ? <div className="v2pp__ok">Keine Prüfpunkte für diesen Fall.</div> : null}
    </div>
  );
}

/* ── Messages ──────────────────────────────────────────────────────────── */

export interface Message {
  key: string;
  level: "error" | "warning" | "hint";
  text: ReactNode;
  /** Warnings need an acknowledgement or a way to fix them. */
  actions?: ReactNode;
}

/**
 * Errors block, warnings need an acknowledgement, hints just stand there.
 * The level sits in `level` — the caller does not choose the color but the
 * meaning.
 *
 * @when    Error, warning or hint about a journal entry or form.
 * @instead Note not tied to a journal entry → Callout.
 */
export function Messages({ items }: { items: Message[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      {items.map((m) => (
        <div className={`v2msg v2msg--${m.level}`} key={m.key} role={m.level === "error" ? "alert" : undefined}>
          <StateIcon state={m.level === "hint" ? "info" : m.level} />
          <span className="v2msg__body">{m.text}</span>
          {m.actions ? <span className="v2msg__actions">{m.actions}</span> : null}
        </div>
      ))}
    </div>
  );
}
