"use client";

import { useCallback, useMemo, useState } from "react";

import { ActionIcon } from "../Icons";
import { useHotkeys } from "./Hotkeys";
import { StateIcon, type StateKind } from "./Review";

/**
 * The basic pattern of every review step (F123 T123.2, Leitbrief §8).
 *
 * A list of items, each with a state icon, title, secondary line and badges on
 * the right. `J`/`K` move through the list — J back, K forward, the reverse of
 * vim on purpose; the reason stands in `RecordPager` and is not repeated here
 * (0187). `Enter` opens the detail. After an action the selection jumps to
 * the **next open** item — so the reviewer does not have to return to the
 * list after every tick.
 *
 * The jump can be switched off (`autoAdvance`): whoever scans a list instead
 * of working through it wants to keep the selection.
 *
 * A group can start folded (`collapsed`): native `<details>`, the person at
 * the screen opens it, and `J`/`K` skip what is folded — a selection nobody
 * sees is none.
 */

export interface TodoItem {
  id: string;
  state: StateKind;
  title: string;
  sub?: string;
  /** The number block on the right — amount, quantity, balance. Right-aligned, tabular. */
  right?: React.ReactNode;
  badges?: React.ReactNode;
  /** Does this item block the release? Only for sorting/filtering. */
  blocking?: boolean;
}

export interface TodoGroup {
  label: string;
  /** On the right in the group header instead of the bare count — e.g. „3 Posten · 4.812 €". */
  meta?: React.ReactNode;
  items: TodoItem[];
  /** Starts folded; the head opens it. For what must stay reachable but not in the way (0187). */
  collapsed?: boolean;
}

/** What counts as "open" — the jump skips everything else. */
const OPEN: ReadonlySet<StateKind> = new Set<StateKind>([
  "open",
  "warning",
  "error",
  "question",
]);

/**
 * Is this state one that still asks something of a person?
 *
 * The list and its counter have to agree on that, and „open" is not simply
 * „not done": a returned item and an open question both still wait.
 *
 * @when    Counting or filtering what is still to do.
 * @instead Drawing the state → StateIcon.
 */
export function isOpen(state: StateKind): boolean {
  return OPEN.has(state);
}

/**
 * @when    Review step with items to work through; jumps to the next open one.
 * @instead Pure information, nothing to work through → Table. Checklist of a gate → Checklist.
 */
export function TodoList({
  groups,
  selectedId,
  onSelect,
  onOpen,
  emptyText = "Nichts zu prüfen.",
  hotkeys = true,
  collapsible = true,
}: {
  groups: TodoGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** `Enter` or a click on an already selected item. */
  onOpen?: (id: string) => void;
  emptyText?: string;
  hotkeys?: boolean;
  /**
   * `false`: the groups do not fold — no `<details>`, no chevron, no toggle;
   * a plain head (label and count) and the items, always open, and
   * `collapsed` is ignored. For a list of one or two short groups, where a
   * toggle carries nothing (owner 2026-09-21, the client-year dashboard:
   * „nur die Boxen anzeigen").
   */
  collapsible?: boolean;
}) {
  // Which groups are folded right now — the `<details>` owns the toggle,
  // this only mirrors it so the keys skip what is out of sight.
  const [closed, setClosed] = useState<ReadonlySet<string>>(
    () => new Set(collapsible ? groups.filter((g) => g.collapsed).map((g) => g.label) : []),
  );
  const flat = useMemo(
    () => groups.filter((g) => !closed.has(g.label)).flatMap((g) => g.items),
    [groups, closed],
  );

  const jumpTo = useCallback(
    (delta: number) => {
      if (flat.length === 0) return;
      const i = flat.findIndex((it) => it.id === selectedId);
      const next = i < 0 ? 0 : (i + delta + flat.length) % flat.length;
      onSelect(flat[next]!.id);
    },
    [flat, selectedId, onSelect],
  );

  const bindings = useMemo(
    () => [
      { key: "j", label: "Voriger Punkt", handler: () => jumpTo(-1) },
      { key: "k", label: "Nächster Punkt", handler: () => jumpTo(1) },
      {
        key: "Enter",
        label: "Punkt öffnen",
        handler: () => {
          if (selectedId && onOpen) onOpen(selectedId);
        },
      },
    ],
    [jumpTo, selectedId, onOpen],
  );
  useHotkeys(bindings, hotkeys);

  // „Nothing to do" hangs on the **groups**, not on what is unfolded: folding
  // the last open group used to empty `flat`, and the list replaced itself
  // with the empty text — the heads were gone, nothing could be unfolded
  // again (reported by the owner on the client-year dashboard, 2026-09-21).
  // `flat` only drives J/K.
  if (groups.every((g) => g.items.length === 0)) {
    return (
      <div className="v2lp">
        <div className="v2lp__empty">{emptyText}</div>
      </div>
    );
  }

  const item = (it: TodoItem) => (
    <button
      key={it.id}
      type="button"
      className={`v2lp__item v2todo${it.id === selectedId ? " is-active" : ""}`}
      aria-current={it.id === selectedId}
      onClick={() => (it.id === selectedId && onOpen ? onOpen(it.id) : onSelect(it.id))}
    >
      <span className="v2todo__ico">
        <StateIcon state={it.state} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span className="v2lp__title">{it.title}</span>
        {it.sub ? <span className="v2lp__sub">{it.sub}</span> : null}
      </span>
      {it.right ? <span className="v2todo__right">{it.right}</span> : null}
      {it.badges ? <span className="v2lp__badges">{it.badges}</span> : null}
    </button>
  );

  const visible = groups.filter((g) => g.items.length > 0);

  if (!collapsible) {
    return (
      <div className="v2lp">
        {visible.map((g) => (
          <div key={g.label} role="group" aria-label={g.label}>
            <div className="v2lp__grp">
              <span className="v2lp__grplabel">{g.label}</span>
              <span>{g.meta ?? g.items.length}</span>
            </div>
            {g.items.map(item)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="v2lp">
      {visible.map((g) => (
          <details
            key={g.label}
            open={!g.collapsed}
            onToggle={(e) => {
              const { open } = e.currentTarget;
              setClosed((prev) => {
                const next = new Set(prev);
                if (open) next.delete(g.label);
                else next.add(g.label);
                return next;
              });
            }}
          >
            <summary className="v2lp__grp">
              <ActionIcon action="collapse" size={14} className="v2lp__chev" />
              <span className="v2lp__grplabel">{g.label}</span>
              <span>{g.meta ?? g.items.length}</span>
            </summary>
            {g.items.map(item)}
          </details>
        ))}
    </div>
  );
}

/**
 * The next open item after `afterId` — the basis of the auto-advance.
 * Returns `null` when nothing is open any more; the selection then stays put
 * and the screen shows its success empty state.
 *
 * @when    A list has to jump to the next item that still asks something.
 * @instead Whether one state counts as open → isOpen.
 */
export function nextOpen(items: readonly TodoItem[], afterId: string | null): string | null {
  if (items.length === 0) return null;
  const start = afterId ? items.findIndex((i) => i.id === afterId) : -1;
  for (let k = 1; k <= items.length; k++) {
    const it = items[(start + k + items.length) % items.length]!;
    if (it.id !== afterId && isOpen(it.state)) return it.id;
  }
  return null;
}
