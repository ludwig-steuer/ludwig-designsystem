import type { ReactNode } from "react";
import { Disclosure } from "../primitives/Disclosure";
import { StateIcon, type StateKind } from "./Review";

/**
 * „What is there to do" in one shape (0208): the list the owner found calm on
 * the client-year page (0207, the old „Arbeitsvorrat") — a bar per group with
 * the count on the right, rows across the full width, the title at `--fs-ui`
 * and one line under it at `--fs-ui-sm`, something on the right (a button, a
 * counter, a link). Nothing to select, no keys: a list to read and jump from.
 */

export interface TaskRow {
  key: string;
  /** The sign in front; without it the row starts at the text (the „with others" rows). */
  state?: StateKind;
  title: ReactNode;
  sub?: ReactNode;
  /** A button, a counter, a link — right-aligned. */
  right?: ReactNode;
}

export interface TaskGroup {
  key: string;
  label: string;
  /** The count in the bar; by default the number of rows. */
  count?: ReactNode;
  rows: readonly TaskRow[];
  /**
   * Folded into one line („6 von 8 erledigt") instead of a bar — for what is
   * done and only reassures.
   */
  folded?: { summary: ReactNode };
  /** The sentence when the group has no rows („Nichts zu tun — …"); without it the group is left out. */
  empty?: ReactNode;
}

function Row({ row }: { row: TaskRow }) {
  return (
    <li className={`v3task__row${row.state ? "" : " is-plain"}`}>
      {row.state ? <StateIcon state={row.state} /> : null}
      <span className="v3task__text">
        <span className="v3task__title">{row.title}</span>
        {row.sub ? <span className="v3task__sub">{row.sub}</span> : null}
      </span>
      {row.right ? <span className="v3task__right">{row.right}</span> : null}
    </li>
  );
}

/**
 * @when    A list of things to do or to look at, grouped („Sie sind dran",
 *          „Liegt bei anderen", „Offen", „Erledigt"), each row with a way out —
 *          a start page, the result of a batch.
 * @instead Items to work through one by one with J/K → TodoList. The checks
 *          of a gate with progress bars → Checklist. Checks with reasons →
 *          CheckItems.
 */
export function TaskList({ groups }: { groups: readonly TaskGroup[] }) {
  const shown = groups.filter((g) => g.rows.length > 0 || g.empty);
  return (
    <div className="v3task">
      {shown.map((g) => (
        <section key={g.key} aria-label={g.label}>
          {/* A folded group is one line to open, not a bar plus a line — the
              count would stand twice. */}
          {g.folded && g.rows.length > 0 ? null : (
            <div className="v3task__grp">
              <span>{g.label}</span>
              <span>{g.count ?? g.rows.length}</span>
            </div>
          )}
          {g.rows.length === 0 ? (
            <p className="v3task__empty">{g.empty}</p>
          ) : g.folded ? (
            <div className="v3task__fold">
              <Disclosure tone="quiet" summary={g.folded.summary}>
                <ul className="v3task__list">
                  {g.rows.map((r) => (
                    <Row key={r.key} row={r} />
                  ))}
                </ul>
              </Disclosure>
            </div>
          ) : (
            <ul className="v3task__list">
              {g.rows.map((r) => (
                <Row key={r.key} row={r} />
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
