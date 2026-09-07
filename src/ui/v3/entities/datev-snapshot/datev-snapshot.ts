import type {
  BaselineLevel,
  DatevSnapshot as MirrorSnapshot,
} from "@/ludwig/modules/datev-mirror/domain/snapshot";

/**
 * A DATEV snapshot — the state everything is compared against (0027).
 *
 * The record comes from the mirror (`datev-mirror/domain/snapshot.ts`): the
 * module got its `domain/` on 2026-09-07 with `222c8d5a`, which closed finding
 * **L-04**. Four fields are still this file's own — `contents`, `counts`,
 * `reconcile` and `createdBy` live in `snapshot-history-queries.ts` over
 * there and were not lifted with the rest (finding **L-206**).
 */
export interface DatevSnapshot extends Partial<MirrorSnapshot> {
  /** The reference date the snapshot describes. */
  asOf: string;
  fiscalYear: number;
  /** When the import ran — regularly confused with `asOf`, hence both labelled. */
  importedAt: string;
  /** How deep the run went — the three values and their words are the app's. */
  baselineLevel: BaselineLevel | null;
  /** What the import contained. */
  contents: string[];
  /** `{mirror_entries?, open_items?}` — every key is shown, with its word. */
  counts: Record<string, number>;
  /**
   * The five counters of the reconciliation, `null` when none ran. They map
   * one to one onto the axis `mirror_match` — the same words the mirror uses
   * per row, here as a total.
   */
  reconcile: {
    matchedLudwig: number;
    matchedSplit: number;
    matchedCorrected: number;
    newUnprocessed: number;
    unclear: number;
  } | null;
  createdBy?: string | null;
}

/** The words of the two count keys. Not a status — a count is not a state. */
export const SNAPSHOT_COUNT_LABEL: Record<string, string> = {
  mirror_entries: "Buchungen",
  open_items: "Offene Posten",
};

/** Which axis value each reconciliation counter belongs to. */
export const RECONCILE_AXIS: [keyof NonNullable<DatevSnapshot["reconcile"]>, string][] = [
  ["matchedLudwig", "matched_ludwig"],
  ["matchedSplit", "matched_split"],
  ["matchedCorrected", "matched_corrected"],
  ["newUnprocessed", "new_unprocessed"],
  ["unclear", "unclear"],
];
