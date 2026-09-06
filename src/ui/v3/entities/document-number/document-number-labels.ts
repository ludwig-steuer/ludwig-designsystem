import type {
  DocumentNumberSource,
  DocumentNumberState,
} from "@/ludwig/modules/accounting-cases/domain/document-number";

/**
 * The words of the nine sources and the three states.
 *
 * They are **props**, not a map in a component: the app keeps them in a local
 * map inside `CasePlausibilityTab.tsx`, the domain module carries only the
 * ranking, and there is no registry axis — a source is not a state. That gap
 * is finding **L-71**; the day the app lifts the labels into the domain, these
 * types stay and the default below is deleted.
 */
export type DocumentNumberSourceLabels = Record<DocumentNumberSource, string>;
export type DocumentNumberStateLabels = Record<DocumentNumberState, string>;
