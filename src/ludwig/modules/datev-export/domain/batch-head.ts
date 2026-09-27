/**
 * F303/F304 — die Fakten im Kopf der Stapelseite (Zone 1): höchstens vier,
 * in fester Reihenfolge. Rein, ohne IO.
 *
 * Belege zählen über **eine** Menge: die Belege, die dieser Stapel gestempelt
 * hat (Ereignis-Stempel `export_batch_id`) — dieselbe Menge wie Reiter,
 * Abriss und Liste (F304, L-353). Nicht `docsInPeriod`: das ist die
 * Bezugsgröße der Abnahme (Gate 3f), nicht der Inhalt des Stapels.
 */

export interface BatchHeadCounts {
  entries: number;
  entriesAccepted: number;
  entriesProposed: number;
  clarificationsOpen: number;
  clarificationsTotal: number;
  runs: number;
}

/** Belege des Stapels: alle gestempelten und davon erledigt. */
export interface BatchDocumentCounts {
  total: number;
  done: number;
}

export function batchHeadFacts(c: BatchHeadCounts, docs: BatchDocumentCounts): [string, string][] {
  return [
    [
      "Buchungen",
      c.entries === 0 ? "noch keine" : `${c.entries} (${c.entriesAccepted} freigegeben · ${c.entriesProposed} Vorschlag)`,
    ],
    ["Klärungen offen", `${c.clarificationsOpen} / ${c.clarificationsTotal}`],
    ["Belege erledigt", `${docs.done} / ${docs.total}`],
    ["Durchgänge", `${c.runs}`],
  ];
}
