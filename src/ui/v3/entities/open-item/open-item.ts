import type { Currency } from "@/ludwig/shared/money";
import {
  OPEN_ITEM_AGE_BUCKETS,
  OPEN_ITEM_AGE_LABEL,
  openItemAgeBucket,
  type OpenItemAgeBucket,
} from "@/ludwig/modules/datev-truth/domain/open-item";

/**
 * A DATEV open item, as the row needs it (0029).
 *
 * The cut of the page view model `OposStichtagItem`
 * (`modules/datev-truth/application/opos-stichtag-core.ts`). It is **not**
 * mirrored: the type lives in `application/`, and `datev-truth` has no
 * `domain/` at all — that is finding **L-73**, and the day the module gets
 * one, this interface is deleted and imported from there instead.
 *
 * The names are the app's, character for character, so the swap is an import
 * swap and not a mapping step.
 */
export interface OpenItem {
  /** Personal account of a customer (`debtor`) or a supplier (`creditor`). */
  kind: "debtor" | "creditor";
  personalAccount: string;
  /** Belegfeld 1 — the number a person quotes. Missing in old snapshots. */
  externalDocumentNumber: string | null;
  /** Posting date of the receivable. */
  invoiceDate: string | null;
  dueDate: string | null;
  grossAmount: number | null;
  /** What was left on the reference date; `null` = not derivable from the lines. */
  openAtCutoff: number | null;
  /** The amount is an approximation — old snapshot with a part payment, or a collective item. */
  amountApprox: boolean;
  /** Settled today, but the settlement was booked **after** the reference date. */
  clearedAfterCutoff: boolean;
  description: string | null;
  /**
   * `null` in old snapshots; `0` means „not dunned". The two are not the same
   * thing — but the row **shows them the same** (an em dash), because it has
   * no place for the difference and neither reading changes what to do. The
   * distinction lives here, for whoever reads the snapshot (acceptance of
   * 0029, M8: this comment claimed a distinction the cell does not make).
   */
  dunningLevel?: number | null;
}

/**
 * How long an item has been overdue — the five classes DATEV uses.
 *
 * They come from the mirror since 2026-09-07 (`222c8d5a`, findings L-05 and
 * L-73): the classes, their words and the rule that assigns them all live in
 * `datev-truth/domain/open-item.ts`. **The component still does not compute
 * the class** — the caller hands it in, exactly as before; what changed is
 * that the rule can now be quoted instead of copied.
 */
export type { OpenItemAgeBucket };
export { OPEN_ITEM_AGE_BUCKETS, OPEN_ITEM_AGE_LABEL, openItemAgeBucket };

export interface OpenItemAgeGroupVM {
  bucket: OpenItemAgeBucket;
  count: number;
  sum: number;
  currency?: Currency;
}
