import {
  CheckCircle2,
  Circle,
  CircleSlash,
  HelpCircle,
  PencilLine,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";
import { ActionIcon, LEVEL_ICON } from "../Icons";
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
  open: { Icon: Circle, tone: "muted", label: "offen", meaning: "Noch nicht angefangen oder noch nicht erreicht. Gefüllt: hier steht der Vorgang gerade." },
  done: { Icon: CheckCircle2, tone: "success", label: "erledigt", meaning: "Abgeschlossen, nichts mehr zu tun." },
  edited: { Icon: PencilLine, tone: "info", label: "bearbeitet", meaning: "Von Hand geändert — der Wert stammt nicht mehr aus dem Vorschlag." },
  returned: { Icon: Undo2, tone: "warning", label: "zurückgegeben", meaning: "An den Vorgänger zurückgeschickt, er muss nachbessern." },
  question: { Icon: HelpCircle, tone: "warning", label: "Frage offen", meaning: "Eine Rückfrage ist gestellt und noch nicht beantwortet." },
  skipped: { Icon: CircleSlash, tone: "muted", label: "übersprungen", meaning: "Bewusst ausgelassen; für diesen Vorgang nicht nötig." },
  // The three steps of the scale come from the shared table (0197).
  warning: { Icon: LEVEL_ICON.warning.icon, tone: "warning", label: LEVEL_ICON.warning.label, meaning: "Hängt: jemand muss handeln, aber nichts ist gescheitert." },
  error: { Icon: LEVEL_ICON.error.icon, tone: "danger", label: LEVEL_ICON.error.label, meaning: "Gescheitert: so geht es nicht weiter." },
  info: { Icon: LEVEL_ICON.info.icon, tone: "info", label: LEVEL_ICON.info.label, meaning: "Zur Kenntnis; es ist nichts zu tun." },
} as const satisfies Record<StateKind, { Icon: typeof Circle; tone: string; label: string; meaning: string }>;

/** Every state sign with its word and meaning — the one definition (owner 2026-09-27), rendered on „Grundlagen/Icons". */
export const STATE_SIGNS = (Object.keys(ICONS) as StateKind[]).map((kind) => ({ kind, label: ICONS[kind].label, meaning: ICONS[kind].meaning }));

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
  // 96: „231 von 231" needs 86 px — at 76 the counter ran into the bar (measured 2026-09-29).
  const cols = "20px minmax(0, 1fr) 96px 100px 150px";
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
            {/* Its own box, so the ellipsis works inside the flex line (0215, H1). */}
            <span className="v2chk__jumptext">{row.jump}</span>
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
  /**
   * The shape „fact" (0206): the check's answer is a **word**, not pass/fail —
   * „Ja", „Nein", „Unsicher", as a `StatusBadge` from the caller. It stands
   * right of the question.
   */
  result?: ReactNode;
  /**
   * Who set it, and — technical, small, marked — which fields it was read
   * from (T4). „System · Technisch: client_invoices.vendor_country_code".
   */
  origin?: { actor: string; fields?: readonly string[] };
}

/**
 * What the items are — decides the words of the groups and of `checkSummary`.
 * `rule`: passed / violated / not checkable. `fact`: settled / to clarify.
 */
export type CheckKind = "rule" | "fact";

const SUMMARY_WORD: Record<CheckKind, Record<CheckItem["state"], string>> = {
  rule: { red: "verletzt", yellow: "offen", open: "nicht prüfbar", green: "bestanden" },
  fact: { red: "widersprüchlich", yellow: "zu klären", open: "nicht erhoben", green: "geklärt" },
};

/**
 * The counts of a set of checks in one line — the XS size (0206): „1 verletzt
 * · 2 offen · 9 bestanden". Worst first, empty groups left out.
 *
 * @when    The result of a set of checks in one line — the title of a report's
 *          verdict (`StatusCallout`) or an overview.
 * @instead The checks themselves → CheckItems.
 */
export function checkSummary(items: readonly CheckItem[], kind: CheckKind = "rule"): string {
  const order: CheckItem["state"][] = ["red", "yellow", "open", "green"];
  const parts = order
    .map((state) => [items.filter((i) => i.state === state).length, SUMMARY_WORD[kind][state]] as const)
    .filter(([n]) => n > 0)
    .map(([n, word]) => `${n} ${word}`);
  return parts.length ? parts.join(" · ") : kind === "fact" ? "keine Fakten" : "keine Prüfpunkte";
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
/** The technical line of a check: a fact's key and the fields it was read from. */
function technical(item: CheckItem, kind: CheckKind): string {
  return [kind === "fact" ? item.code : null, ...(item.origin?.fields ?? [])].filter(Boolean).join(", ");
}

function CheckRow({ item, kind = "rule" }: { item: CheckItem; kind?: CheckKind }) {
  return (
    <div className={`v2pp__row v2pp__row--${item.state}`}>
      <StateIcon state={PP_ICON[item.state]} />
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>
        <span className="v2pp__q">
          {item.question}
          {/* A rule's code is what somebody quotes (VST-03); a fact's key is
              technical and stands under „Technisch" (T4, 0206). */}
          {kind === "rule" ? <> <span className="v2pp__code">{item.code}</span></> : null}
        </span>
        <span className="v2pp__why">{item.reason}</span>
        {item.origin ? (
          <span className="v2pp__origin">
            {item.origin.actor}
            {technical(item, kind) ? (
              <>
                {" · "}Technisch: <code>{technical(item, kind)}</code>
              </>
            ) : null}
          </span>
        ) : null}
      </span>
      {item.result ? <span className="v2pp__result">{item.result}</span> : null}
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
  kind,
}: {
  state: StateKind;
  summary: string;
  items: CheckItem[];
  kind: CheckKind;
}) {
  return (
    <Disclosure
      tone="quiet"
      summary={
        <span className="v2pp__sum">
          <StateIcon state={state} />
          {summary}
          {kind === "rule" ? <span className="v2pp__code">{items.map((i) => i.code).join(" ")}</span> : null}
        </span>
      }
    >
      {items.map((i) => (
        <CheckRow item={i} key={i.code} kind={kind} />
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
 * Two shapes (0206): `kind="rule"` — pass/fail with a reason (the journal
 * entry, the plausibility tab, the input-tax rules); `kind="fact"` — each item
 * answers with a word (`result`) and says who set it (`origin`). Settled facts
 * fold into one line like passed rules; open ones stand alone. A rule whose
 * result could not be determined but *has* to be (input tax) is `yellow`, not
 * `open`: „not checkable" (0148) is a statement about the data, „to clarify" is
 * work.
 *
 * @when    Individual checks with reasons — rules (pass/fail) or facts (a word
 *          each); passed/settled and unrunnable ones each in a single line.
 * @instead Error that blocks saving → Messages. The count alone → checkSummary.
 */
export function CheckItems({ items, kind = "rule" }: { items: CheckItem[]; kind?: CheckKind }) {
  const words = SUMMARY_WORD[kind];
  const noun = kind === "fact" ? "Fakten" : "Prüfpunkten";
  const passed = items.filter((i) => i.state === "green");
  const notRun = items.filter((i) => i.state === "open");
  // Red and yellow keep their own row. A finding that can hide is not a
  // finding — not even twenty of them.
  const findings = items.filter((i) => i.state === "red" || i.state === "yellow");
  return (
    <div className="v2pp">
      {findings.map((i) => (
        <CheckRow item={i} key={i.code} kind={kind} />
      ))}
      {passed.length > 0 ? (
        <CheckGroup
          state="done"
          kind={kind}
          summary={`${passed.length} von ${items.length} ${noun} ${words.green}`}
          items={passed}
        />
      ) : null}
      {notRun.length > 0 ? (
        <CheckGroup
          state="open"
          kind={kind}
          summary={
            kind === "fact"
              ? `${notRun.length} ${notRun.length === 1 ? "Fakt" : "Fakten"} ${words.open}`
              : notRun.length === 1
                ? "1 Prüfpunkt nicht prüfbar"
                : `${notRun.length} Prüfpunkte nicht prüfbar`
          }
          items={notRun}
        />
      ) : null}
      {items.length === 0 ? (
        <div className="v2pp__ok">{kind === "fact" ? "Keine Fakten für diesen Fall." : "Keine Prüfpunkte für diesen Fall."}</div>
      ) : null}
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
