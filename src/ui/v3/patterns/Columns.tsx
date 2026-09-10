import type { CSSProperties, ReactNode } from "react";

/**
 * The four column patterns a tab body is built from (0154).
 *
 * **Owner, 2026-09-10:** every tab body is *always* one of four patterns.
 * Widths may vary with the weight of the content, the pattern may not — so
 * document, account, partner and case build from the same four instead of
 * each inventing its own grid.
 *
 * | Pattern | Slots | For |
 * |---|---|---|
 * | `list-detail` | `list` · `main` | pick on the left, work on the right |
 * | `list-detail-aside` | `list` · `main` · `aside` | the same, plus something read along — the case overview |
 * | `split` | `main` · `aside`, equal halves | comparing: original against extraction, two info boxes, a chart beside its numbers |
 * | `main-aside` | `main` · `aside` | one working surface with a narrow companion — the facts of an account |
 *
 * **Widths are named steps, not free numbers** (owner, same day). Both values
 * that exist today were fought for in acceptances against a measured page:
 * a list of facts stays readable at 460, a seven-column table of movements
 * needs 960 — and a floor that fits one starves the other. A caller picks the
 * step that names what stands there; it does not invent a pixel value.
 *
 * **What falls away first is not the last column.** On a narrow page the
 * `aside` drops **below** the main surface and the rest becomes
 * `list-detail`; the `list` never disappears. In the case overview the strand
 * is the working surface and the notes are the companion — dropping the third
 * column would take the notes away, dropping the first would take the work.
 *
 */

/** The four, and no fifth. A pattern nobody named is a grid somebody invented. */
export type ColumnPattern = "list-detail" | "list-detail-aside" | "split" | "main-aside";

/**
 * The floor of the main surface, named after **what stands there** — that is
 * the point of a step: whoever picks it says what the column carries, not how
 * many pixels it happens to need today.
 *
 * `facts` 460 px — a block of field rows (measured in 0050: at the old default
 * of 620 the view fell into one column at a 1280 px window; 484 would sit
 * exactly on the page width and a browser with space-taking scrollbars would
 * wrap unnoticed — 460 leaves 24 px of room).
 *
 * `table` 960 px — a table with many columns (measured in 0063: beside the
 * 440 px strand the posting text was 98 px wide at 1440 and the contra account
 * lost its name in every row; at 1384 the view stood side by side with **zero**
 * pixels of text, at 1383 it wrapped and was complete).
 */
export type ColumnWidth = "facts" | "table";

const WIDTH: Record<ColumnWidth, number> = { facts: 460, table: 960 };

/**
 * @when    The body of a tab that has more than one column — one of the four
 *          patterns, never a grid of its own.
 * @instead One surface without columns → nothing, that is the normal case. A
 *          list page with head and pager → DataTable. The rows of a detail
 *          page → DetailView. Picking from a list with the detail beside it,
 *          outside a tab body → MasterDetail.
 */
export function Columns({
  pattern,
  list,
  main,
  aside,
  width = "facts",
}: {
  pattern: ColumnPattern;
  /** Left column — required by `list-detail` and `list-detail-aside`. */
  list?: ReactNode;
  /** The working surface. Always present. */
  main: ReactNode;
  /** Read along: notes, facts, the second half of a comparison. */
  aside?: ReactNode;
  /**
   * Which step the main surface stands on. Ignored by `split`, where both
   * halves are equal by definition.
   */
  width?: ColumnWidth;
}) {
  const style = { "--v2cols-main": `${WIDTH[width]}px` } as CSSProperties;
  return (
    <div className={`v2cols v2cols--${pattern}`} style={style}>
      {list && pattern !== "split" && pattern !== "main-aside" ? (
        <div className="v2cols__list">{list}</div>
      ) : null}
      <div className="v2cols__main">{main}</div>
      {aside && pattern !== "list-detail" ? <div className="v2cols__aside">{aside}</div> : null}
    </div>
  );
}
