import type {
  DocumentNumberSource,
  DocumentNumberState,
} from "@/ludwig/modules/accounting-cases/domain/document-number";

/**
 * The words of the nine sources and the three states — **overrides**.
 *
 * They used to be required props: the app kept the words in a local map inside
 * `CasePlausibilityTab.tsx`, and neither the domain nor the registry had them
 * (finding L-71). Since 2026-09-07 both do — the source has the registry axis
 * `belegnummer_quelle` (`362325b2`), the state has
 * `DOCUMENT_NUMBER_STATE_LABEL` in the domain — so the register reads them
 * itself and a caller only passes what it wants to say differently.
 */
export type DocumentNumberSourceLabels = Partial<Record<DocumentNumberSource, string>>;
export type DocumentNumberStateLabels = Partial<Record<DocumentNumberState, string>>;
