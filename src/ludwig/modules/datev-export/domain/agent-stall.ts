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
