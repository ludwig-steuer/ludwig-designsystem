import { formatCaseNumber } from "./case";

/**
 * F492 (K10) — Gate-Note für Bankumsätze an abgegebenen Sachverhalten ohne offene Frage: sie zählen als offen, die
 * Note sagt warum und was zu tun ist. Rein, ohne DB.
 */
const SHOWN = 8;

export function handoverWithoutQuestionNote(
  events: ReadonlyArray<{ caseNumber?: unknown; eventId?: unknown; handoverWithoutQuestion?: unknown }>,
): string | undefined {
  const hits = events.filter((e) => e.handoverWithoutQuestion === true);
  if (hits.length === 0) return undefined;
  const names = hits
    .slice(0, SHOWN)
    .map((e) => (e.caseNumber ? formatCaseNumber(String(e.caseNumber)) : String(e.eventId)));
  const list = `${names.join(", ")}${hits.length > SHOWN ? " …" : ""}`;
  const head =
    hits.length === 1
      ? "1 Bankumsatz liegt an einem Sachverhalt, der bei der Kanzlei steht, ohne dass dort eine Frage offen ist"
      : `${hits.length} Bankumsätze liegen an Sachverhalten, die bei der Kanzlei stehen, ohne dass dort eine Frage offen ist`;
  return (
    `${head} (${list}). ${hits.length === 1 ? "Er zählt" : "Sie zählen"} als offen: buchen (Bank an Personenkonto ` +
    'geht immer), den Verzicht begründen (`event_transition(to="no_booking_required")`) oder die Frage stellen ' +
    '(`clarification_raise(to="accounting")`).'
  );
}
