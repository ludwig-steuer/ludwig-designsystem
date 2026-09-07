import type { ReactNode } from "react";

import { MasterDetail } from "../../patterns/MasterDetail";

/**
 * The frame of the account detail page (0063).
 *
 * It carries **no data** — it orders, like `CaseDetailView` (0050) and
 * `SourceDocumentView` (0071). The order is the rank order of the page profile
 * `docs/seiten/konto-detail.md`: which account · how much lies on it · is that
 * much or little · what lies on it concretely · what is it meant for.
 *
 * **Why `LedgerAccountView` and not `AccountView`:** `AccountView` is already
 * a type name in the mirrored domain (`"flat" | "grouped"`, the view mode of
 * the chart of accounts). A component that shadows a domain type is a name
 * collision waiting for the first import.
 *
 * The one thing this frame decides is that **ranks 1–3 stand without
 * scrolling**: no height and no scroll container of its own around the upper
 * slots.
 *
 * @when    The page around one ledger account: pager, head, figures, chart,
 *          tabs, facts beside the movements.
 * @instead One account looked up beside other work → AccountDrawer. The
 *          movements alone → AccountEntryList or accountEntryColumns in
 *          DataTable. What kind of account it is → AccountFacts.
 */
export function LedgerAccountView({
  pager,
  header,
  summary,
  chart,
  tabs,
  aside,
  children,
}: {
  /** Above everything: back to the chart of accounts, and the next account. */
  pager?: ReactNode;
  /** The account itself (`EntityHeader`, 0048) — rank 1. */
  header: ReactNode;
  /**
   * Rank 2 — how much lies on it. **DATEV leads, Ludwig is the delta**
   * (owner, 2026-09-04): a united balance hides the deviation the reader came
   * for, and two equal balances beside each other invite adding them up.
   */
  summary?: ReactNode;
  /** Rank 3 — is that much or little for this account (`BarChart`, 0110). */
  chart?: ReactNode;
  /** The tab bar. Without tabs the row disappears with its spacing. */
  tabs?: ReactNode;
  /**
   * Rank 6 — what the account is meant for, in the margin (`AccountFacts`).
   * Empty → one column: the movements take the whole width, which is right
   * wherever the facts are not the question.
   */
  aside?: ReactNode;
  /** Rank 4 — the movements: `DataTable` with `accountEntryColumns()`. */
  children: ReactNode;
}) {
  return (
    <div className="v2lav">
      {pager ? <div className="v2lav__pager">{pager}</div> : null}
      <div className="v2lav__head">{header}</div>
      {summary ? <div className="v2lav__sum">{summary}</div> : null}
      {chart ? <div className="v2lav__chart">{chart}</div> : null}
      {tabs ? <div className="v2lav__tabs">{tabs}</div> : null}
      {aside ? (
        // The facts stand **beside** the movements, not above them: the
        // movements are the working surface (rank 4), and a block of field
        // rows over them pushes the answer below the fold (doubt 4 of the
        // page profile). `detailBreit` gives the wide half to the movements.
        // 960 px, not the default 620: the default makes sure the seven
        // columns **exist**, not that they carry anything. Beside the 440-px
        // strand the posting text was 98 px wide at a 1440-px window — two of
        // 21 characters in the text box — and the contra account lost its name
        // in every row. Worse: at 1384 px the view stood side by side again
        // and the text had **zero** pixels, while at 1383, wrapped, it was
        // complete — the narrower width gave the better picture (acceptance
        // 0063, fourth round). 960 = fixed tracks plus gutters plus padding
        // plus room for text and contra account.
        <MasterDetail list={aside} detail={children} detailBreit minDetail={960} />
      ) : (
        <div className="v2lav__body">{children}</div>
      )}
    </div>
  );
}
