import type { Currency } from "@/ludwig/shared/money";

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
  openAtStichtag: number | null;
  /** The amount is an approximation — old snapshot with a part payment, or a collective item. */
  amountApprox: boolean;
  /** Settled today, but the settlement was booked **after** the reference date. */
  clearedAfterStichtag: boolean;
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
 * **The component does not compute this.** The rule belongs to the domain
 * (`openItemAgeBucket({ dueDate, asOf })`, finding L-05), and until it exists
 * over there the caller hands the class in. A second version here is what
 * L-52 already cost the set once.
 */
export type OpenItemAgeBucket = "notDue" | "d1_30" | "d31_60" | "d61_90" | "d90plus";

/** The words of the five classes. Not a status: there is no axis, and none is due. */
export const AGE_BUCKET_LABEL: Record<OpenItemAgeBucket, string> = {
  notDue: "noch nicht fällig",
  d1_30: "1 bis 30 Tage überfällig",
  d31_60: "31 bis 60 Tage überfällig",
  d61_90: "61 bis 90 Tage überfällig",
  d90plus: "über 90 Tage überfällig",
};

export interface OpenItemAgeGroupVM {
  bucket: OpenItemAgeBucket;
  count: number;
  sum: number;
  currency?: Currency;
}
