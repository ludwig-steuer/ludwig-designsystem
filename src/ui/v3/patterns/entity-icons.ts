/**
 * Axis → entity.
 *
 * Icons exist ONLY for the three main entities of the data-model chain; they
 * mirror the main navigation. That way the badge tells at a glance which
 * entity a status belongs to.
 *
 * **Which sign an entity carries is not here** — that is the icon registry
 * (`Icons.tsx`). This file only says which axis means which entity
 * (`AXIS_ENTITY`); the sign falls out of that.
 *
 * All other axes (order, account, upload, …) deliberately have no icon: they
 * already stand in a context that names the entity — a column header, a
 * section — and a second symbol would only add noise. `StatusBadge` simply
 * renders none when nothing stands here.
 */
import type { EntityKey } from "../Icons";
import type { StatusAxis } from "@/ludwig/ui/status/status-registry";

/** Which axis names which entity — the key into the icon registry. */
export const AXIS_ENTITY: Partial<Record<StatusAxis, EntityKey>> = {
  beleg: "source-document",
  sachverhalt: "accounting-case",
  buchung: "journal-entry",
};

/**
 * Axis name and origin come from the **mirror** since 2026-09-06: the app put
 * `AXIS_LABEL` and `AXIS_SOURCE` into `status-registry.ts` (pure data, its own
 * `ui/status/entity-icons.ts` only re-exports them), so they mirror along.
 *
 * Two copies with 62 entries used to sit here. They were the reason **every
 * new axis of the app turned this repo red** — six axes on 2026-09-06 were the
 * last case (0105). What stays is what the app does not have: which axis means
 * which **entity**, and the sign that goes with it.
 *
 * `ENTITY_LABEL` was here too, with the same three entries the app carries in
 * `ui/status/entity-icons.ts` — and nobody read it. It was removed on
 * 2026-09-07 (acceptance 0105, M1): a shrunk copy is still a copy, and this
 * task exists to end them.
 */
export { AXIS_LABEL, AXIS_SOURCE } from "@/ludwig/ui/status/status-registry";
