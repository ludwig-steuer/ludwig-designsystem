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
 * One exception: in `main-aside` the companion goes **above** the surface
 * (owner 2026-09-11, 0157). There it is the facts the surface is read against,
 * and under 25 rows of movements nobody finds them.
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
 *
 * `document` 560 px — the original of a document beside what was read out of
 * it (measured in 0071/0150: below that the preview cannot be read, and the
 * card then stacks instead of shrinking it).
 */
export type ColumnWidth = "facts" | "table" | "document";

const WIDTH: Record<ColumnWidth, number> = { facts: 460, table: 960, document: 560 };

/**
 * The floor of the **companion** column — the second half of the decision,
 * named for the same reason as the first (0184).
 *
 * `notes` 320 px — notes, clarifications, expectations. Measured on the case
 * overview: at a 1280 px window the three columns still stand side by side and
 * the companion has 330 px; between 1280 and 1180 it drops below. That is the
 * order 0154 asks for — the companion gives way first, the list never does.
 *
 * `facts` 360 px — a block of field rows beside a table, the master data of an
 * account (0157). Wider than notes because a field row carries a label **and**
 * its value on one line.
 *
 * `record` 384 px — the facts of a record beside its original (0150). **Why
 * 384 and not 400**: 400 puts the gate at 976 px, which is exactly the card
 * width in a 1280 px window — a browser with a space-taking scrollbar would
 * fall to one column there unnoticed.
 */
export type ColumnAsideWidth = "notes" | "facts" | "record";

const ASIDE_WIDTH: Record<ColumnAsideWidth, number> = { notes: 320, facts: 360, record: 384 };

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
  width,
  asideWidth,
}: {
  pattern: ColumnPattern;
  /** Left column — required by `list-detail` and `list-detail-aside`. */
  list?: ReactNode;
  /** The working surface. Always present. */
  main: ReactNode;
  /** Read along: notes, facts, the second half of a comparison. */
  aside?: ReactNode;
  /**
   * Which step the main surface stands on. In `split` it is the floor of the
   * **left** half and **optional**: without it both halves keep the same floor
   * (0185) — „widths follow the weight, the pattern does not" (owner, 0154).
   */
  width?: ColumnWidth;
  /**
   * Which step the companion stands on. Without it the pattern decides:
   * `main-aside` carries facts beside a table (360), the others notes (320).
   */
  asideWidth?: ColumnAsideWidth;
}) {
  // In `split` the floor is only set when the caller names one: the two halves
  // of a comparison are equal until the content says otherwise (0185).
  const mainFloor = pattern === "split" ? (width ? WIDTH[width] : null) : WIDTH[width ?? "facts"];
  const style = {
    ...(mainFloor === null ? {} : { "--v3cols-main": `${mainFloor}px` }),
    ...(asideWidth ? { "--v3cols-aside": `${ASIDE_WIDTH[asideWidth]}px` } : {}),
  } as CSSProperties;
  return (
    <div className={`v3cols v3cols--${pattern}`} style={style}>
      {list && pattern !== "split" && pattern !== "main-aside" ? (
        <div className="v3cols__list">{list}</div>
      ) : null}
      <div className="v3cols__main">{main}</div>
      {aside && pattern !== "list-detail" ? <div className="v3cols__aside">{aside}</div> : null}
    </div>
  );
}
