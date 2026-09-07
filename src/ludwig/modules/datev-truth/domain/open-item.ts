/**
 * # Der offene Posten und sein Alter
 *
 * Ein offener Posten ist eine Sollstellung in DATEV, die zum Stichtag noch
 * nicht ausgeglichen war. Sein Alter ist die Frage, die am Kontoblatt und in
 * der Mahnung zuerst gestellt wird — und sie hing bisher an keiner Stelle,
 * die man zitieren konnte (L-05).
 *
 * Das Modul hatte kein `domain/`; der Spiegel ins Design-System nahm daraus
 * nichts. Die Altersklassen gehören hierher und nicht zu `accounting-cases`:
 * ein offener Posten ist eine Aussage über den DATEV-Bestand, kein
 * Sachverhalt (L-73).
 */

/**
 * Altersklassen eines offenen Postens, gemessen von der Fälligkeit auf einen
 * Stichtag. Zeichengleich mit der Erwartung des Design-Systems.
 *
 * Die Grenzen sind die üblichen Mahnstufen, nicht willkürlich: bis 30 Tage
 * ist eine Zahlung unterwegs, ab 90 ist sie es nicht mehr.
 */
export const OPEN_ITEM_AGE_BUCKETS = ["notDue", "d1_30", "d31_60", "d61_90", "d90plus"] as const;
export type OpenItemAgeBucket = (typeof OPEN_ITEM_AGE_BUCKETS)[number];

export const OPEN_ITEM_AGE_LABEL: Record<OpenItemAgeBucket, string> = {
  notDue: "noch nicht fällig",
  d1_30: "1–30 Tage",
  d31_60: "31–60 Tage",
  d61_90: "61–90 Tage",
  d90plus: "über 90 Tage",
};

/**
 * Wie alt ist der Posten am Stichtag?
 *
 * Ohne Fälligkeitsdatum `notDue`: ein Posten, dessen Frist niemand kennt, ist
 * nicht überfällig — er ist unbestimmt, und „überfällig" wäre eine Behauptung.
 * Beide Daten sind ISO-Tagesangaben; gerechnet wird in ganzen Tagen, damit
 * die Klasse nicht von der Uhrzeit des Aufrufs abhängt.
 */
export function openItemAgeBucket(input: {
  dueDate: string | null;
  asOf: string;
}): OpenItemAgeBucket {
  if (!input.dueDate) return "notDue";
  const due = Date.parse(`${input.dueDate.slice(0, 10)}T00:00:00Z`);
  const asOf = Date.parse(`${input.asOf.slice(0, 10)}T00:00:00Z`);
  if (!Number.isFinite(due) || !Number.isFinite(asOf)) return "notDue";
  const days = Math.floor((asOf - due) / 86_400_000);
  if (days <= 0) return "notDue";
  if (days <= 30) return "d1_30";
  if (days <= 60) return "d31_60";
  if (days <= 90) return "d61_90";
  return "d90plus";
}
