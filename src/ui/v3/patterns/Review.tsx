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
import { Disclosure } from "../primitives/Disclosure";
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

/**
 * The word of a state, for a legend beside the icons — the same word the
 * icon carries as its name.
 *
 * @when    A legend or a sentence names a state that stands as an icon elsewhere.
 * @instead The icon with its word as its accessible name → StateIcon.
 */
export function stateLabel(state: StateKind): string {
  return ICONS[state].label;
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
          // The shape of the content, not a box: as many rows as will come, at
          // least four, so the card does not collapse. The column head stays —
          // it promises what is coming.
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
 * One check, drawn the same way wherever it stands — alone or unfolded.
 *
 * **The reason carries the state's weight** (2026-09-10, owner). On a green
 * check the sentence is a footnote and stays quiet; on a yellow or red one it
 * is the most important thing in the row — „Sonst 5401, hier —" is *the*
 * finding, and grey type made it look like an aside. The row therefore hands
 * its state down to the sentence.
 */
function CheckRow({ item }: { item: CheckItem }) {
  return (
    <div className={`v2pp__row v2pp__row--${item.state}`}>
      <StateIcon state={PP_ICON[item.state]} />
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <span className="v2pp__q">
          {item.question} <span className="v2pp__code">{item.code}</span>
        </span>
        <span className="v2pp__why">{item.reason}</span>
      </span>
      {item.gate}
      {item.jump}
    </div>
  );
}

/**
 * A group that says its size in one line and shows itself on demand.
 *
 * Through `Disclosure`, so this file stays a **server component**: opening,
 * closing, keyboard and accessibility come from the native `<details>`. A
 * `useState` here would have made `Checklist`, `Messages` and `StateIcon`
 * client components too — for a fold-out that the platform already has.
 *
 * The codes stay in the summary: they are what somebody quotes, and reading
 * them should not cost a click.
 */
function CheckGroup({
  state,
  summary,
  items,
}: {
  state: StateKind;
  summary: string;
  items: CheckItem[];
}) {
  return (
    <Disclosure
      tone="quiet"
      summary={
        <span className="v2pp__sum">
          <StateIcon state={state} />
          {summary}
          <span className="v2pp__code">{items.map((i) => i.code).join(" ")}</span>
        </span>
      }
    >
      {items.map((i) => (
        <CheckRow item={i} key={i.code} />
      ))}
    </Disclosure>
  );
}

/**
 * Check items as an accordion — and **three** kinds of them, not two.
 *
 * Passed ones collapse into one line, and so do the ones that **could not
 * run**: „kein Belegbetrag hinterlegt, nicht vergleichbar" says the same
 * thing twelve times over. Red and yellow always stand alone.
 *
 * That third group is what this component was missing until 0148. It was
 * built for „many passed, few open", and real data turns that around: a
 * sparse entry has *nothing* to check against, and twelve rows of „not
 * comparable" bury the one finding that matters. **„Not checkable" is a
 * statement about the data, not about the entry** — and it is not a finding.
 *
 * For the same reason it gets its **own** sentence and its own icon: the
 * passed line counts only the passed. Counting an unchecked item as an
 * unremarkable one is the mistake the data itself warns about: one of those
 * checks says in its own reason that unchecked is not the same as unremarkable.
 *
 * @when    Individual checks of a journal entry with reasons; passed and unrunnable ones each in a single line.
 * @instead Error that blocks saving → Messages.
 */
export function CheckItems({ items }: { items: CheckItem[] }) {
  const passed = items.filter((i) => i.state === "green");
  const notRun = items.filter((i) => i.state === "open");
  // Red and yellow keep their own row. A finding that can hide is not a
  // finding — not even twenty of them.
  const findings = items.filter((i) => i.state === "red" || i.state === "yellow");
  return (
    <div className="v2pp">
      {findings.map((i) => (
        <CheckRow item={i} key={i.code} />
      ))}
      {passed.length > 0 ? (
        <CheckGroup
          state="done"
          summary={`${passed.length} von ${items.length} Prüfpunkten bestanden`}
          items={passed}
        />
      ) : null}
      {notRun.length > 0 ? (
        <CheckGroup
          state="open"
          summary={
            notRun.length === 1
              ? "1 Prüfpunkt nicht prüfbar"
              : `${notRun.length} Prüfpunkte nicht prüfbar`
          }
          items={notRun}
        />
      ) : null}
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
