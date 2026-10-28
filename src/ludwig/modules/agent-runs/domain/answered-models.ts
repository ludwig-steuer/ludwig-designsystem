/**
 * F529 — antwortende Modelle (laut Transkript, `message.model`) gegen das angefragte Modell halten.
 * WeberCloud antwortet über dem Fenster still mit einem anderen Modell; die Schrittseite zeigt das als Auffälligkeit.
 */

export interface AnsweredModel {
  model: string;
  answers: number;
}

/** Vergleichsform: Kleinbuchstaben, ohne Anbieter-Präfix (bis zum letzten `/`), ohne `[1m]`, ohne F514-Profil (`@…`). */
export function normalizeModelId(id: string): string {
  const name = id.toLowerCase();
  const bare = name.slice(name.lastIndexOf("/") + 1).replace(/\[1m\]$/, "");
  const at = bare.indexOf("@");
  return at === -1 ? bare : bare.slice(0, at);
}

/** Die Antworten, die weder vom angefragten noch vom kleinen Modell kamen; ohne `requestedModel` leer. */
export function unexpectedAnsweredModels(input: {
  answered: readonly AnsweredModel[];
  requestedModel: string | null;
  smallModel: string | null;
}): AnsweredModel[] {
  if (!input.requestedModel) return [];
  const expected = [input.requestedModel, input.smallModel].filter((m): m is string => !!m).map(normalizeModelId);
  // ponytail: Präfixregel deckt die WeberCloud-Varianten -low, -xhigh und -think ab; bei Fehlalarmen eine
  // Zuordnungstabelle aus models.json.
  return input.answered.filter((a) => {
    const id = normalizeModelId(a.model);
    return !expected.some((e) => id.startsWith(e) || e.startsWith(id));
  });
}
