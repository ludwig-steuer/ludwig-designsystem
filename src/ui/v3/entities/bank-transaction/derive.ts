/**
 * The pure derivations of a statement line — **re-exported**, not rebuilt.
 *
 * `spec-schreiben` asked for these to live in their own file next to the row,
 * because the worklist filters over `deriveZ` without drawing anything. Since
 * `cc141f7b` they live in the mirror, which is the better version of the same
 * argument: the app filters over them too.
 *
 * So this file is one line of imports and one of exports. It exists so the
 * family has one place to look, and so that the day a derivation is missing
 * over there, the gap has an address.
 */
export {
  deriveZ,
  restOf,
  derivePurposeParts,
  PURP_LABELS,
  type ZState,
  type PurposeParts,
  type PurposeRef,
  type SepaTags,
} from "@/ludwig/modules/bank-transactions/domain/statement-line";
export { resolveEventBookingState } from "@/ludwig/ui/status/status-registry";
