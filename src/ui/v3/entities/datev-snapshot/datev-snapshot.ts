/**
 * A DATEV snapshot — the state everything is compared against (0027).
 *
 * The cut of the app's `SnapshotRun`
 * (`modules/datev-truth/infrastructure/snapshot-history-queries.ts`). Neither
 * `datev-truth` nor `datev-mirror` has a `domain/`, so nothing of theirs is
 * mirrored — that is finding **L-04**, sharpened. The names are the app's, so
 * the swap is an import swap.
 */
export interface DatevSnapshot {
  /** The reference date the snapshot describes. */
  asOf: string;
  fiscalYear: number;
  /** When the import ran — regularly confused with `asOf`, hence both labelled. */
  importedAt: string;
  /**
   * How deep the run went. The three values come from `baseline_level`; the
   * **words** for them are missing (finding **L-72**), so the raw value stands
   * in mono until the GLOSSARY has them. A local map here would be that map.
   */
  baselineLevel: string | null;
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
