/**
 * F395: Nachfrage — eine Agent-Frage, die auf eine beantwortete Agent-Frage
 * desselben Sachverhalts zeigt (`follows_clarification_id`, gesetzt vom Server).
 * Pure, ohne `server-only`: Sachverhalt und Abnahme leiten dieselbe Darstellung ab.
 */
export const FOLLOW_UP_TITLE_PREFIX = "Nachfrage · ";

export interface FollowUpOf {
  clarificationId: string;
  title: string;
  answerText: string | null;
}

/** Die abgeleitete Darstellung einer Nachfrage: Präfix im Titel, die vorige Antwort als erster Fakt. */
export function followUpPresentation(
  follows: FollowUpOf | null,
): { titlePrefix: string; fact: { label: string; value: string } } | null {
  if (!follows) return null;
  return {
    titlePrefix: FOLLOW_UP_TITLE_PREFIX,
    fact: { label: "Nachfrage zu", value: `${follows.title} — Antwort: ${follows.answerText ?? "(ohne Text)"}` },
  };
}
