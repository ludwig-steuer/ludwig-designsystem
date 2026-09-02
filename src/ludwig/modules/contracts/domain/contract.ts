/**
 * Vertrags-Typen für das Web-UI. Werte-Achse von `contractType` spiegelt
 * `buchassi_shared.ContractType` und den DB-CHECK auf
 * `client_source_docs_contracts.contract_type`.
 */

export type ProvenanceSource = "ai" | "manual";

export interface ContractFieldProvenance {
  source: ProvenanceSource;
  confidence: number | null;
}

export interface ContractBookingFact {
  key: string;
  value: string;
  source: ProvenanceSource;
  confidence: number | null;
}

export interface ContractDetailData {
  id: string;
  sourceDocId: string;
  clientId: string;
  contractType: string | null;
  contractSubject: string | null;
  startDate: string | null; // ISO yyyy-mm-dd
  durationMonths: number | null;
  endDate: string | null;
  isOpenEnded: boolean;
  summary: string | null;
  primaryAmount: number | null;
  currency: string | null;
  fieldProvenance: Record<string, ContractFieldProvenance>;
  bookingFacts: ContractBookingFact[];
  extractionConfidence: number | null;
}

/** Buchhalterischer Vertragstyp (bestimmt das Buchungskonto). */
export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  loan: "Darlehen",
  rent: "Miete",
  lease: "Leasing",
  recurring_invoice: "Dauerrechnung",
  service: "Dienstleistung",
  other: "Sonstiges",
};

export const CONTRACT_TYPE_OPTIONS: ReadonlyArray<{ value: string; label: string }> =
  Object.entries(CONTRACT_TYPE_LABELS).map(([value, label]) => ({ value, label }));

export function contractTypeLabel(type: string | null | undefined): string {
  if (!type) return "—";
  return CONTRACT_TYPE_LABELS[type] ?? type;
}
