/**
 * Qualitäts-Metrik aus `client_journal_entry.acceptance_quality` (F05-T5.5):
 * Wie oft nimmt die Kanzlei einen Agent-Vorschlag **unverändert** ab?
 *
 * Reine Aggregations-/VM-Logik ohne DB — die SQL-Seite liefert Roh-Zählungen
 * je Mandant + Monat (`infrastructure/acceptance-quality-queries.ts`), hier
 * werden Anteile berechnet und Invarianten geprüft (fail fast statt NaN).
 */

/** Roh-Zeile aus der Aggregations-Query: ein Mandant × Buchungs-Monat. */
export interface AcceptanceQualityMonthRow {
  clientId: string;
  clientName: string;
  /** Buchungs-Monat als `YYYY-MM` (nach `booking_date`). */
  month: string;
  /** Akzeptierte/gebuchte Sätze nach Abnahme-Qualität (ohne DATEV-Import). */
  aiUnmodified: number;
  aiEdited: number;
  manualOnly: number;
  /** Alle Agent-Vorschläge des Monats (origin='ai_proposed', jeder Status). */
  aiProposalCount: number;
  /** Median `proposal_confidence` akzeptierter Agent-Vorschläge (accepted/posted). */
  medianConfidenceAccepted: number | null;
  /** Median `proposal_confidence` abgelehnter/stornierter Agent-Vorschläge (reversed). */
  medianConfidenceRejected: number | null;
}

export interface AcceptanceQualityMonthVm extends AcceptanceQualityMonthRow {
  /** Summe der abgenommenen Sätze (ai_unmodified + ai_edited + manual_only). */
  acceptedTotal: number;
  /** Anteile 0..1; bei `acceptedTotal === 0` durchgängig 0 (kein NaN). */
  aiUnmodifiedShare: number;
  aiEditedShare: number;
  manualOnlyShare: number;
}

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * Rechnet Anteile je Zeile aus und validiert die Roh-Zählungen.
 * Wirft bei negativen Zählungen oder kaputtem Monatsformat — solche Zeilen
 * wären ein Query-Bug, kein darstellbarer Zustand.
 */
export function buildAcceptanceQualityVms(
  rows: readonly AcceptanceQualityMonthRow[],
): AcceptanceQualityMonthVm[] {
  return rows.map((row) => {
    const counts = [row.aiUnmodified, row.aiEdited, row.manualOnly, row.aiProposalCount];
    if (counts.some((n) => !Number.isFinite(n) || n < 0)) {
      throw new Error(
        `acceptance-quality: negative/ungültige Zählung für ${row.clientId} ${row.month}`,
      );
    }
    if (!MONTH_RE.test(row.month)) {
      throw new Error(`acceptance-quality: ungültiger Monat '${row.month}'`);
    }
    const acceptedTotal = row.aiUnmodified + row.aiEdited + row.manualOnly;
    const share = (n: number): number => (acceptedTotal === 0 ? 0 : n / acceptedTotal);
    return {
      ...row,
      acceptedTotal,
      aiUnmodifiedShare: share(row.aiUnmodified),
      aiEditedShare: share(row.aiEdited),
      manualOnlyShare: share(row.manualOnly),
    };
  });
}
