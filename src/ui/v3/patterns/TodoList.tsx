"use client";

import { useCallback, useMemo } from "react";

import { useHotkeys } from "./Hotkeys";
import { StateIcon, type StateKind } from "./Review";

/**
 * The basic pattern of every review step (F123 T123.2, Leitbrief §8).
 *
 * A list of items, each with a state icon, title, secondary line and badges on
 * the right. `J`/`K` move through the list, `Enter` opens the detail. After an
 * action the selection jumps to the **next open** item — so the reviewer does
 * not have to return to the list after every tick.
 *
 * The jump can be switched off (`autoAdvance`): whoever scans a list instead
 * of working through it wants to keep the selection.
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
}

/** What counts as "open" — the jump skips everything else. */
const OPEN: ReadonlySet<StateKind> = new Set<StateKind>([
  "open",
  "warning",
  "error",
  "question",
]);

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
}: {
  groups: TodoGroup[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** `Enter` or a click on an already selected item. */
  onOpen?: (id: string) => void;
  emptyText?: string;
  hotkeys?: boolean;
}) {
  const flat = useMemo(() => groups.flatMap((g) => g.items), [groups]);

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
      { key: "j", label: "Nächster Punkt", handler: () => jumpTo(1) },
      { key: "k", label: "Voriger Punkt", handler: () => jumpTo(-1) },
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

  if (flat.length === 0) {
    return (
      <div className="v2lp">
        <div className="v2lp__empty">{emptyText}</div>
      </div>
    );
  }

  return (
    <div className="v2lp">
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <div key={g.label}>
            <div className="v2lp__grp">
              <span>{g.label}</span>
              <span>{g.meta ?? g.items.length}</span>
            </div>
            {g.items.map((it) => (
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
            ))}
          </div>
        ))}
    </div>
  );
}

/**
 * The next open item after `afterId` — the basis of the auto-advance.
 * Returns `null` when nothing is open any more; the selection then stays put
 * and the screen shows its success empty state.
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
