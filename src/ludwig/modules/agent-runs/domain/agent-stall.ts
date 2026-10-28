/**
 * Ab wann ein Agent als still gilt (F253): so lange hat er an diesem Mandanten
 * nichts mehr geschrieben. Danach darf die Kanzlei die Prüfung übernehmen —
 * aus dem Zustand `agent`, nicht erst aus `prepared`.
 *
 * Steht **einmal**, hier: das Gating der Abnahme liest sie für den Knopf, der
 * Übernahme-Kern prüft sie serverseitig noch einmal. Eine Konstante, keine
 * Einstellung je Kanzlei.
 */
export const AGENT_STALL_MINUTES = 120;

/**
 * F470: so lange bleibt ein widerrufenes Lauf-Token stehen, danach löscht es
 * `closeStalledAgentRuns`. Der Lauf bleibt, sein `agent_token_id` wird NULL.
 */
export const RUN_TOKEN_RETENTION_DAYS = 30;

/**
 * F479: so lange nach `finished_at` seines Schritts gilt ein widerrufenes
 * Lauf-Token noch — ausschließlich für `step_usage_report` (der Runner meldet
 * den Verbrauch erst nach dem Harness-Ende, also nach `step_finish`).
 */
export const RUN_TOKEN_USAGE_GRACE_MINUTES = 30;
