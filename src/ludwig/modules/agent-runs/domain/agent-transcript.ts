/**
 * F488: so lange bleibt das Transkript eines Agent-Schritts im Blob — die
 * Ablaufregel `expire-agent-transcripts` (infra/modules/file-storage) löscht es
 * danach; die Schritt-Seite zeigt ab da „gelöscht“.
 */
export const AGENT_TRANSCRIPT_RETENTION_DAYS = 90;

/** Ablage unter dem Mandanten — die Ablaufregel greift auf das Präfix `agent-transcripts/`. */
export function agentTranscriptStorageKey(clientId: string, stepId: string): string {
  return `agent-transcripts/${clientId}/${stepId}.jsonl.gz`;
}
