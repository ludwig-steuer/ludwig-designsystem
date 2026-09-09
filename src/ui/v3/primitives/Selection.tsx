"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useHotkeys } from "../patterns/Hotkeys";
import { ActionButton, type ActionResult, type AskSpec, type ConfirmSpec } from "./ActionButton";
import { TextButton } from "./TextButton";

/**
 * Mehrfachauswahl in einer Tabelle (F123 T123.1): Kästchen in der Zeile,
 * Leiste über dem Spaltenkopf. Zusammen mit `ClickRow` aus `./ExpandableRow`.
 *
 * Two layers live here. `SelectionBar` and `SelectCell` are the dumb pair: the
 * caller holds the selection and passes `count`, `checked`, `onChange`.
 * `SelectionScope` and the three parts that read it are the island that holds
 * it — that is what a table over a whole page needs, and what `DataTable`
 * (0057) mounts. Both stay: a card with three rows does not need a context.
 *
 * `useHotkeys` comes from `patterns/` — the one import upwards, the way
 * `RecordPager` already does it. It is a bare keydown listener without a
 * domain word; a second copy of it here would be the worse trade.
 */

/**
 * Auswahl-Leiste über dem Spaltenkopf — innerhalb der Karte, nicht im
 * Seitenkopf (Baukasten §4). Erscheint erst, wenn etwas ausgewählt ist.
 *
 * @when    Actions on several selected rows at once.
 * @instead Action on exactly one row → RowActions.
 */
export function SelectionBar({
  count,
  actions,
  onClear,
  inline,
}: {
  count: number;
  actions: ReactNode;
  onClear: () => void;
  /** In the card header instead of its own band above the column head (0057 E5). */
  inline?: boolean;
}) {
  if (count === 0) return null;
  return (
    <div className={`v2selbar${inline ? " v2selbar--inline" : ""}`}>
      <span className="v2selbar__count">{count} ausgewählt</span>
      <span className="v2selbar__actions">
        {actions}
        <TextButton tone="quiet" onClick={onClear}>
          Auswahl aufheben
        </TextButton>
      </span>
    </div>
  );
}

/**
 * Auswahl-Kästchen als erste Zelle einer Zeile.
 *
 * @when    First cell of every selectable row, together with SelectionBar.
 * @instead A single yes/no in a form → Checkbox. The head's box → SelectAllCell.
 */
export function SelectCell({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      className="v2check"
      checked={checked}
      aria-label={label}
      onChange={(e) => onChange(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

/* ── Die Insel, die die Auswahl hält (0057) ─────────────────────────────── */

export interface SelectionApi {
  /** The chosen keys of this page. */
  keys: ReadonlySet<string>;
  /** Switch one row and move the anchor there. */
  toggle: (key: string) => void;
  /** Shift-click: add everything between the anchor and this key, in row order. */
  range: (key: string) => void;
  setAll: (checked: boolean) => void;
  /**
   * Switch **exactly these** keys — the section box of a grouped table (0149).
   *
   * Not `toggle` in a loop: that would move the shift-anchor once per row and
   * leave it on the last one, so the next shift-click would take a range
   * nobody drew.
   */
  setMany: (keys: readonly string[], checked: boolean) => void;
  clear: () => void;
  /** The keys of this page in row order — the head box and `range` read it. */
  order: readonly string[];
}

const SelectionContext = createContext<SelectionApi | null>(null);

/**
 * @when    Inside a `SelectionScope`, to read or change the selection.
 * @instead One row's own state → the caller's own `useState`.
 */
export function useSelection(): SelectionApi {
  const api = useContext(SelectionContext);
  if (!api) throw new Error("useSelection braucht einen SelectionScope darüber.");
  return api;
}

/**
 * The island that holds the selection of one page.
 *
 * The selection is **not** in the URL (0057 E1): it is a moment of work, not a
 * place. It also does not survive a page change — mount it with `key={page}`
 * and a new page starts empty, which is the honest reading of „12 ausgewählt".
 *
 * @when    A table whose rows are chosen and then acted on together.
 * @instead The caller already holds the selection → SelectionBar and SelectCell
 *          on their own. Choosing one row to work on it → MasterDetail.
 */
export function SelectionScope({
  order,
  children,
}: {
  /** Every row key of this page, in the order the rows are rendered. */
  order: readonly string[];
  children: ReactNode;
}) {
  const [keys, setKeys] = useState<ReadonlySet<string>>(() => new Set<string>());
  // Where the last switch happened — shift-click reaches back to it.
  const anchor = useRef<string | null>(null);

  function toggle(key: string) {
    anchor.current = key;
    setKeys((prev) => {
      const next = new Set(prev);
      if (!next.delete(key)) next.add(key);
      return next;
    });
  }

  function range(key: string) {
    const from = anchor.current;
    const a = from === null ? -1 : order.indexOf(from);
    const b = order.indexOf(key);
    if (a < 0 || b < 0) {
      toggle(key);
      return;
    }
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    anchor.current = key;
    setKeys((prev) => {
      const next = new Set(prev);
      for (const key of order.slice(lo, hi + 1)) next.add(key);
      return next;
    });
  }

  const api: SelectionApi = {
    keys,
    toggle,
    range,
    order,
    setAll: (checked) => {
      anchor.current = null;
      setKeys(checked ? new Set(order) : new Set<string>());
    },
    setMany: (which, checked) => {
      anchor.current = null;
      setKeys((prev) => {
        const next = new Set(prev);
        for (const k of which) {
          if (checked) next.add(k);
          else next.delete(k);
        }
        return next;
      });
    },
    clear: () => {
      anchor.current = null;
      setKeys(new Set<string>());
    },
  };

  return <SelectionContext.Provider value={api}>{children}</SelectionContext.Provider>;
}

/**
 * @when    The head cell of the selection column: chooses every row of this
 *          page, and shows a partial selection as `indeterminate`.
 * @instead The box of one row → SelectRowCell.
 */
export function SelectAllCell({
  label = "Alle auf dieser Seite auswählen",
}: {
  label?: string;
}) {
  const { keys, order, setAll } = useSelection();
  const box = useRef<HTMLInputElement>(null);
  const all = order.length > 0 && order.every((k) => keys.has(k));
  const some = !all && order.some((k) => keys.has(k));
  // `indeterminate` is a property, not an attribute — React cannot set it.
  useEffect(() => {
    if (box.current) box.current.indeterminate = some;
  }, [some]);
  return (
    <input
      ref={box}
      type="checkbox"
      className="v2check"
      checked={all}
      // Nothing to choose: an empty list left the box live, and a control that
      // does nothing is the case V14 forbids for keys — a box is no different.
      // Measured in the empty story of 0086.
      disabled={order.length === 0}
      aria-label={label}
      onChange={(e) => setAll(e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}

/**
 * @when    The selection cell of a row inside a `SelectionScope`; shift-click
 *          takes the range from the last switched row to this one.
 * @instead The box in the head → SelectAllCell.
 */
export function SelectRowCell({ rowKey, label }: { rowKey: string; label: string }) {
  const { keys, toggle, range } = useSelection();
  // `onChange` of a checkbox carries no modifier keys, so the mouse press
  // before it says whether this is a range. The keyboard clears it again.
  const shift = useRef(false);
  return (
    <input
      type="checkbox"
      className="v2check"
      checked={keys.has(rowKey)}
      aria-label={label}
      onMouseDown={(e) => {
        shift.current = e.shiftKey;
      }}
      onKeyDown={() => {
        shift.current = false;
      }}
      onClick={(e) => e.stopPropagation()}
      onChange={() => {
        if (shift.current) range(rowKey);
        else toggle(rowKey);
        shift.current = false;
      }}
    />
  );
}

interface BulkActionBase {
  label: string;
  /** Shown on the button (V14); it only fires while something is chosen. */
  hotkey?: string;
  tone?: "danger";
}

/**
 * One action on every chosen row — **one of two shapes**, and the type says so.
 *
 * The same gap as `RowAction` had until 2026-09-08: an interface with
 * independent optional fields, and a comment claiming an exclusion the
 * compiler never checked (acceptance 0122, M1/M4).
 *
 * `action` is a Server Action bound by the page.
 */
export type BulkAction<Input = void> = BulkActionBase &
  (
    | {
        /** Gets the keys **and** what `ask` asked for. */
        action: (keys: string[], input: Input) => Promise<ActionResult>;
        /**
         * A dialog that asks something before the action runs (0121) — „12
         * Umsätze einem Sachverhalt zuordnen", and in it the picker.
         *
         * A **function** of the keys, because the dialog may name their
         * number. `ask` is the confirmation dialog, so it excludes `confirm`.
         */
        ask: (keys: string[]) => AskSpec<Input>;
        confirm?: never;
      }
    | {
        action: (keys: string[]) => Promise<ActionResult>;
        confirm?: ConfirmSpec;
        ask?: never;
      }
  );

/**
 * A list of bulk actions where each one may ask for something different.
 *
 * TypeScript has no existential type, so the list position cannot say „some
 * `Input`, one per entry". This is that gap, named once and in one place —
 * `bulkAction()` below keeps the checking where it belongs, inside the entry.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyBulkAction = BulkAction<any>;

/**
 * Types one entry of the list. Without it the caller has to annotate `input`
 * by hand and nothing checks that `ask.initial` and `action`'s second
 * parameter are the same thing — which is the very mistake 0121 exists to
 * prevent.
 *
 * **Name the type**: `bulkAction<string>({…})`. A full `AskSpec` has `render`
 * and `valid`, whose parameters put `Input` in a contravariant position, and
 * inference then lands on `unknown`. One word at the call site says what is
 * being asked for, and everything inside is checked against it.
 *
 * @when    Building `selection.actions` where an action asks something first.
 * @instead An action that just runs → the plain object literal is enough.
 */
export function bulkAction<Input>(action: BulkAction<Input>): AnyBulkAction {
  return action;
}

/**
 * One button of the selection bar. Its own component because `ask` makes the
 * action generic in what it asks for, and a `BulkAction[]` cannot carry one
 * type parameter per entry — here each element gets its own.
 */
function BulkButton<Input>({
  action: a,
  keys,
  onDone,
}: {
  action: BulkAction<Input>;
  keys: ReadonlySet<string>;
  onDone: () => void;
}) {
  // A failed action keeps the selection: whoever wants to try again should not
  // have to pick the twelve rows a second time.
  const run = async (result: ActionResult) => {
    if (!result || !result.error) onDone();
    return result;
  };
  // The union narrows here, so both branches call the right signature —
  // the cast `undefined as Input` this needed before is gone with it.
  return a.ask !== undefined ? (
    <ActionButton<Input>
      size="sm"
      variant={a.tone === "danger" ? "danger" : "secondary"}
      hotkey={a.hotkey}
      ask={a.ask([...keys])}
      action={async (input) => run(await a.action([...keys], input))}
    >
      {a.label}
    </ActionButton>
  ) : (
    <ActionButton
      size="sm"
      variant={a.tone === "danger" ? "danger" : "secondary"}
      hotkey={a.hotkey}
      confirm={a.confirm}
      action={async () => run(await a.action([...keys]))}
    >
      {a.label}
    </ActionButton>
  );
}

/**
 * The selection bar of a `SelectionScope`, at the place of the card actions
 * (0057 E5) — so the header does not grow a second band and nothing jumps.
 *
 * @when    Card header of a table with `SelectionScope`; `fallback` is what
 *          stands there while nothing is chosen.
 * @instead The caller holds the selection → SelectionBar.
 */
export function SelectionScopeBar({
  actions,
  fallback,
}: {
  actions: AnyBulkAction[];
  /** The usual card actions — they come back as soon as the selection is empty. */
  fallback?: ReactNode;
}) {
  const { keys, clear } = useSelection();
  const count = keys.size;
  const boxes = useRef(new Map<string, HTMLSpanElement | null>());

  const bindings = useMemo(
    () =>
      actions
        .filter((a) => a.hotkey)
        .map((a) => ({
          key: a.hotkey as string,
          label: a.label,
          // ponytail: the key takes the same path as the mouse, dialog
          // included — the confirmation lives inside `ActionButton` and only a
          // click opens it. Reaching for the button is shorter than a second
          // confirm state out here.
          handler: () =>
            boxes.current.get(a.label)?.querySelector("button")?.click(),
        })),
    [actions],
  );
  useHotkeys(bindings, count > 0);

  if (count === 0) return <>{fallback}</>;

  return (
    <SelectionBar
      inline
      count={count}
      onClear={clear}
      actions={actions.map((a) => (
        <span
          key={a.label}
          ref={(el) => {
            boxes.current.set(a.label, el);
          }}
        >
          <BulkButton action={a} keys={keys} onDone={clear} />
        </span>
      ))}
    />
  );
}

/**
 * @when    The head cell of a section in a grouped table: chooses exactly the rows of that section, partial selection as `indeterminate`.
 * @instead Every row of the page → SelectAllCell. One row → SelectRowCell.
 */
export function SelectGroupCell({
  rowKeys,
  label,
}: {
  /** The keys of this section, in row order. */
  rowKeys: readonly string[];
  /** Names the section — „Aufwand auswählen", never „Alle" (T3). */
  label: string;
}) {
  const { keys, setMany } = useSelection();
  const box = useRef<HTMLInputElement>(null);
  const all = rowKeys.length > 0 && rowKeys.every((k) => keys.has(k));
  const some = !all && rowKeys.some((k) => keys.has(k));
  // `indeterminate` is a property, not an attribute — React cannot set it.
  useEffect(() => {
    if (box.current) box.current.indeterminate = some;
  }, [some]);
  return (
    <input
      ref={box}
      type="checkbox"
      className="v2check"
      checked={all}
      // An empty section has nothing to choose — the same rule as in the head.
      disabled={rowKeys.length === 0}
      aria-label={label}
      onChange={(e) => setMany(rowKeys, e.target.checked)}
      onClick={(e) => e.stopPropagation()}
    />
  );
}
