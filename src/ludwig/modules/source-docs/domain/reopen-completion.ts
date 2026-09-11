/**
 * Zurück in die Bearbeitung (belege.md R14d) — wann ein erledigter Beleg
 * wieder geöffnet werden darf, und wie der Einwand der Kanzlei beim Agenten
 * ankommt.
 *
 * Reine Funktionen: der Kern (`reopen-completion-core.ts`) prüft damit den
 * Zustand, Gate 3f formuliert damit den Einwand.
 */

export interface ReopenFacts {
  completedAt: string | null;
  supersededAt: string | null;
  /** Lebende Buchung über das Beleg-Ereignis ODER über `source_doc_id` am Satz (F163). */
  hasLiveBooking: boolean;
  /** Nummer eines geschlossenen Sachverhalts am Beleg, sonst null. */
  closedCaseNumber: string | null;
}

/** Warum der Beleg nicht zurück darf — `null` heißt: er darf. */
export function reopenBlocker(f: ReopenFacts): string | null {
  if (f.completedAt === null) return "Der Beleg ist nicht erledigt — es gibt nichts zurückzusetzen.";
  if (f.supersededAt !== null) {
    return "Der Beleg ist durch andere Belege ersetzt — fachlich gibt es ihn nicht mehr.";
  }
  // Die Buchung ist die stärkere Aussage (R14b): ein offener Beleg neben einem
  // lebenden Satz wäre ein Widerspruch, den kein Trigger wieder auflöst.
  if (f.hasLiveBooking) {
    return "Am Beleg hängt eine Buchung. Erst den Satz ablehnen — dann öffnet der Beleg von selbst.";
  }
  if (f.closedCaseNumber !== null) {
    return `Der Sachverhalt ${f.closedCaseNumber} ist geschlossen — an ihm kann der Agent nicht mehr arbeiten.`;
  }
  return null;
}

/** Der Einwand, wie ihn der Agent in Gate 3f liest — beide Teile im Wortlaut. */
export function reopenHint(r: { note: string | null; previousReason: string | null }): string {
  const einwand = r.note ? `: „${r.note}“` : " (ohne Einwand)";
  const vorher = r.previousReason ? ` Verworfene Begründung: „${r.previousReason}“.` : "";
  return (
    `Die Kanzlei hat die Erledigung zurückgenommen${einwand}.${vorher} ` +
    "Den Einwand umsetzen, nicht dieselbe Begründung erneut setzen."
  );
}
