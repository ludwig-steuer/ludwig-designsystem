import type { KnownDocumentNumber } from "@/ludwig/modules/accounting-cases/domain/document-number";
import type {
  DocumentNumberSourceLabels,
  DocumentNumberStateLabels,
} from "./document-number-labels";

/**
 * Words and example data for the stories of 0014.
 *
 * The labels sit here and not in a component because they are a **prop**: the
 * app keeps them in a local map and the domain module has none (finding L-71).
 * A story needs them, so it hands them in — exactly as a page will.
 */
export const SOURCE_LABEL: DocumentNumberSourceLabels = {
  datev_correction: "Korrektur in DATEV",
  opos_anchor: "Offener Posten aus DATEV",
  mirror_ref: "Gespiegelte DATEV-Buchung",
  case_decision: "Entschieden am Sachverhalt",
  link: "Ausgleichs-Klammer",
  invoice_number: "Rechnungsnummer des Belegs",
  journal_line: "Eigene Buchungszeile",
  bank_purpose: "Im Verwendungszweck erkannt",
  case_summary: "In der Beschreibung erkannt",
};

export const STATE_LABEL: DocumentNumberStateLabels = {
  computed: "errechnet",
  fixed_on_export: "mit Export fixiert",
  datev_corrected: "in DATEV korrigiert",
};

/** All nine sources, deliberately **unsorted** — the component ranks them. */
export const REGISTER: KnownDocumentNumber[] = [
  { documentNumber: "RE 2026 140", source: "case_summary", accountNumber: null, caseId: "c-4412", caseNumber: "2026-0412", caseLifecycle: "open", state: "computed", immutable: false },
  { documentNumber: "RE-2026-0140", source: "opos_anchor", accountNumber: "70021", caseId: "c-4412", caseNumber: "2026-0412", caseLifecycle: "open", state: "fixed_on_export", immutable: true },
  { documentNumber: "RE-2026-140", source: "bank_purpose", accountNumber: null, caseId: "c-4412", caseNumber: "2026-0412", caseLifecycle: "open", state: "computed", immutable: false, candidateRole: "document" },
  { documentNumber: "RE-2026-0140", source: "journal_line", accountNumber: "70021", caseId: "c-4412", caseNumber: "2026-0412", caseLifecycle: "open", state: "computed", immutable: false },
  { documentNumber: "RE-2026-0140", source: "invoice_number", accountNumber: "70021", caseId: "c-4412", caseNumber: "2026-0412", caseLifecycle: "open", state: "computed", immutable: false },
  { documentNumber: "RE-2026-0140", source: "link", accountNumber: "70021", caseId: "c-4488", caseNumber: "2026-0488", caseLifecycle: "closed_accepted", state: "computed", immutable: false, matchedBy: "human", orphaned: true },
  { documentNumber: "RE-2026-0140-K", source: "datev_correction", accountNumber: "70021", caseId: "c-4412", caseNumber: "2026-0412", caseLifecycle: "open", state: "datev_corrected", immutable: true },
  { documentNumber: "RE-2026-0140", source: "mirror_ref", accountNumber: "70021", caseId: "c-4412", caseNumber: "2026-0412", caseLifecycle: "open", state: "fixed_on_export", immutable: true },
  { documentNumber: "RE-2026-0140", source: "case_decision", accountNumber: "70021", caseId: "c-4412", caseNumber: "2026-0412", caseLifecycle: "open", state: "computed", immutable: false, periodKey: "2026-07", rationale: "Der Lieferant schreibt die Nummer ohne führende Null; DATEV hat die Fassung mit Null." },
];
