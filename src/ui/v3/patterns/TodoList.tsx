"use client";

import { useCallback, useMemo } from "react";

import { useHotkeys } from "./Hotkeys";
import { StateIcon, type StateKind } from "./Review";

/**
 * Das Grundmuster jedes Prüfschritts (F123 T123.2, Leitbrief §8).
 *
 * Eine Liste von Punkten, jeder mit Zustands-Icon, Titel, Sekundärzeile und
 * Marken rechts. `J`/`K` gehen durch die Liste, `Enter` öffnet das Detail.
 * Nach einer Aktion springt die Auswahl zum **nächsten offenen** Punkt —
 * damit die Prüferin nicht nach jedem Haken zurück zur Liste muss.
 *
 * Der Sprung ist abschaltbar (`autoAdvance`): wer eine Liste durchsieht statt
 * abzuarbeiten, will die Auswahl behalten.
 */

export interface TodoItem {
  id: string;
  state: StateKind;
  title: string;
  sub?: string;
  /** Der Zahlenblock rechts — Betrag, Menge, Saldo. Rechtsbündig, tabellarisch. */
  right?: React.ReactNode;
  badges?: React.ReactNode;
  /** Blockiert dieser Punkt die Freigabe? Nur zur Sortierung/Filterung. */
  blocking?: boolean;
}

export interface TodoGroup {
  label: string;
  /** Rechts im Gruppenkopf statt der bloßen Anzahl — z.B. „3 Posten · 4.812 €". */
  meta?: React.ReactNode;
  items: TodoItem[];
}

/** Was als „offen" gilt — der Sprung überspringt alles andere. */
const OFFEN: ReadonlySet<StateKind> = new Set<StateKind>([
  "open",
  "warning",
  "error",
  "question",
]);

export function isOpen(state: StateKind): boolean {
  return OFFEN.has(state);
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
  /** `Enter` oder Klick auf einen bereits gewählten Punkt. */
  onOpen?: (id: string) => void;
  emptyText?: string;
  hotkeys?: boolean;
}) {
  const flach = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const springe = useCallback(
    (delta: number) => {
      if (flach.length === 0) return;
      const i = flach.findIndex((it) => it.id === selectedId);
      const next = i < 0 ? 0 : (i + delta + flach.length) % flach.length;
      onSelect(flach[next]!.id);
    },
    [flach, selectedId, onSelect],
  );

  const bindings = useMemo(
    () => [
      { key: "j", label: "Nächster Punkt", handler: () => springe(1) },
      { key: "k", label: "Voriger Punkt", handler: () => springe(-1) },
      {
        key: "Enter",
        label: "Punkt öffnen",
        handler: () => {
          if (selectedId && onOpen) onOpen(selectedId);
        },
      },
    ],
    [springe, selectedId, onOpen],
  );
  useHotkeys(bindings, hotkeys);

  if (flach.length === 0) {
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
 * Der nächste offene Punkt nach `afterId` — die Grundlage des Weiterspringens.
 * Gibt `null` zurück, wenn nichts mehr offen ist; dann bleibt die Auswahl
 * stehen und der Screen zeigt seinen Erfolgs-Leerzustand.
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
