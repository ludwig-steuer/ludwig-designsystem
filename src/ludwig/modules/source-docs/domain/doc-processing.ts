/**
 * Läuft an diesem Beleg gerade etwas — und seit wann? (L-82)
 *
 * Der Fortschritt hing an der Rechnungszeile: `processing_status`,
 * `processing_stage` und die beiden Zeitstempel gibt es nur dort. Ein Vertrag,
 * der in der Extraktion hängt, zeigte deshalb **keinen** Fortschritt, sondern
 * einen leeren Fakten-Block — und ein Kontoauszug ebenso. Gefragt ist aber der
 * Beleg, nicht seine Ausprägung.
 *
 * Deshalb zwei Quellen, in dieser Reihenfolge:
 *
 * 1. **Die Rechnungszeile**, wo es eine gibt. Sie weiß mehr als „es läuft": sie
 *    nennt die erreichte Stufe und den Herzschlag des Laufs.
 * 2. **Der offene Job am Beleg** (`ops_jobs`, `queued` oder `running`) — die
 *    Auskunft, die es für **jede** Belegart gibt. Ohne Stufen: ein Job hat
 *    keine, und erfundene wären schlimmer als keine.
 *
 * `queued` ist dabei Absicht: aus der Sicht des Menschen ist „angestoßen, aber
 * noch nicht dran" dasselbe wie „läuft" — beides heißt warten, und beides endet
 * von selbst. Der Unterschied steht im Text, nicht im Zustand.
 */

export interface DocProcessingFacts {
  /** Die Verarbeitung der Rechnungszeile, wo es eine gibt. */
  invoice?: {
    processingStatus: string | null;
    processingStage: string | null;
    startedAt: string | null;
    lastActivityAt: string | null;
  } | null;
  /** Der jüngste offene Job am Beleg — für jede Belegart. */
  job?: {
    jobType: string;
    status: string;
    /** Wann der Runner ihn genommen hat; `null`, solange er wartet. */
    startedAt: string | null;
    createdAt: string;
  } | null;
}

export interface DocProcessing {
  /** Die erreichte Pipeline-Stufe — nur die Rechnung hat welche. */
  stage: string | null;
  /** Seit wann es läuft. Beim wartenden Job: seit wann er wartet. */
  startedAt: string | null;
  /** Letztes Lebenszeichen — nur die Rechnung führt eines. */
  lastActivityAt: string | null;
  /** Was läuft, wo die Rechnungszeile nichts sagt (`doc_process`, …). */
  jobType: string | null;
  /** `true`, solange der Job noch wartet — er läuft dann noch nicht. */
  waiting: boolean;
}

const OFFEN = new Set(["queued", "running"]);

export function docProcessing(facts: DocProcessingFacts): DocProcessing | null {
  const invoice = facts.invoice ?? null;
  if (invoice?.processingStatus === "in_progress") {
    return {
      stage: invoice.processingStage,
      startedAt: invoice.startedAt,
      lastActivityAt: invoice.lastActivityAt,
      jobType: null,
      waiting: false,
    };
  }
  const job = facts.job ?? null;
  if (job && OFFEN.has(job.status)) {
    return {
      stage: null,
      startedAt: job.startedAt ?? job.createdAt,
      lastActivityAt: null,
      jobType: job.jobType,
      waiting: job.status === "queued",
    };
  }
  return null;
}
