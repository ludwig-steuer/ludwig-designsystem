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

/**
 * # Die Ausgleichs-Klammer
 *
 * Eine Zuordnung zwischen einer Sollstellung und einer Zahlung — die Klammer,
 * die einen offenen Posten schließt (F77). Sie kann auf beiden Seiten je eine
 * Ludwig-Buchung **oder** eine Spiegel-Buchung greifen: der Ausgleich steht
 * manchmal nur in DATEV.
 *
 * Der Typ fehlte ganz; das Design-System definierte ihn lokal (L-03).
 */
export interface OpenItemLink {
  id: string;
  caseId: string | null;
  /** Personenkonto, auf dem die Klammer sitzt. */
  accountNumber: string;
  /** Belegfeld 1 — der Anker, über den DATEV den offenen Posten führt. */
  belegfeldValue: string | null;
  /** Zustand der Belegnummer, siehe `DOCUMENT_NUMBER_STATE_LABEL`. */
  belegfeldState: string | null;
  /** Zugeordneter Betrag. Eine Zahlung kann mehrere Sollstellungen decken. */
  amountAllocated: number;
  /** Wie die Zuordnung entstand — Abgleich, Hand, Regel. */
  matchedBy: string | null;
  /** Begründung, wenn sie nicht offensichtlich ist. */
  rationale: string | null;
  /**
   * Gesetzt = eine der beiden Seiten ist weggefallen (storniert, ersetzt).
   * Die Klammer bleibt als Spur stehen, zählt aber nicht mehr.
   */
  orphanedAt: string | null;

  // Je Seite entweder eine Ludwig-Buchung oder eine Spiegel-Buchung.
  invoiceJournalEntryId: string | null;
  invoiceMirrorEntryId: string | null;
  paymentJournalEntryId: string | null;
  paymentMirrorEntryId: string | null;
}

/**
 * Posten nach Altersklasse, **älteste zuerst**.
 *
 * Die Klassen stehen oben von „noch nicht fällig" bis „über 90 Tage" — das
 * ist die Ordnung der Regel. Auf dem Bildschirm zählt die andere Richtung:
 * wer eine OPOS-Liste öffnet, sucht das, was am längsten liegt
 * (Entitätsprofil 0029). Was nicht fällig ist, steht zuletzt.
 *
 * Eine Klasse ohne Posten kommt nicht vor — eine Überschrift über nichts ist
 * keine Gliederung. Gruppiert wird, was übergeben wird: gibt der Aufrufer
 * eine Seite hinein, bekommt er die Gruppen dieser Seite.
 */
export function groupByAge<T>(
  items: readonly T[],
  asOf: string,
  read: (item: T) => { dueDate: string | null; amount: number | null },
): { bucket: OpenItemAgeBucket; items: T[]; sum: number }[] {
  const nach = new Map<OpenItemAgeBucket, T[]>();
  const summe = new Map<OpenItemAgeBucket, number>();
  for (const it of items) {
    const { dueDate, amount } = read(it);
    const bucket = openItemAgeBucket({ dueDate, asOf });
    const liste = nach.get(bucket);
    if (liste) liste.push(it);
    else nach.set(bucket, [it]);
    summe.set(bucket, (summe.get(bucket) ?? 0) + (amount ?? 0));
  }
  return [...OPEN_ITEM_AGE_BUCKETS]
    .reverse()
    .filter((b) => nach.has(b))
    .map((bucket) => ({
      bucket,
      items: nach.get(bucket)!,
      sum: summe.get(bucket) ?? 0,
    }));
}
