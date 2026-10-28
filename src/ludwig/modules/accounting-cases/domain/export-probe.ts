/**
 * Kern-Domäne (F413): Ergebnis der Export-Probe (Simulations-Export), die
 * Gate 4d hereingereicht bekommt — der Kern ruft den Prozess `datev-export`
 * nicht selbst.
 */
export interface ExportSimulationFailure {
  journalEntryId: string;
  /** Sachverhalt der Buchung — Ziel für die Korrektur (submit ersetzt proposed). */
  caseId: string | null;
  caseNumber: string | null;
  bookingDate: string;
  status: string;
  /** Die Export-Fehlermeldung, wörtlich wie beim echten Export. */
  error: string;
}

export interface ExportSimulationResult {
  /** Geprüfte Buchungen (accepted + proposed, noch nicht exportiert). */
  checked: number;
  failures: ExportSimulationFailure[];
  /** Datei-Level-Hinweise (z. B. Personenkonten, die DATEV noch nicht kennt). */
  warnings: string[];
}
