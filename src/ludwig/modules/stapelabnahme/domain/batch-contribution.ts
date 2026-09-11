import { vergleiche, type BatchContribution, type KontoVergleich } from "./vergleich";

/**
 * „Dieser Stapel" neben den Ist-Saldo legen (F197).
 *
 * Zwei Zahlen, die nicht dieselbe Frage beantworten: der Monatssaldo sagt, was
 * **gebucht ist**, der Beitrag sagt, was dieser Lauf **vorschlägt**. Deshalb
 * werden sie hier zusammengeführt und nicht addiert — die Spalte ist Auskunft
 * und fließt in keine Abweichung ein.
 *
 * Rein und ohne IO: die Query lädt beide Seiten, diese Funktion legt sie
 * übereinander.
 */
export function mergeBatchContribution<T extends KontoVergleich>(
  rows: T[],
  contribution: BatchContribution[],
): (T & { batchAmount: number })[] {
  // Das SQL gruppiert je Konto; kommt trotzdem eine Nummer doppelt, gewinnt
  // die letzte — eine Ausnahme wäre hier nur ein Absturz ohne Erkenntnis.
  const beitrag = new Map(contribution.map((c) => [c.accountNumber, c] as const));

  const zusammengefuehrt = rows.map((r) => ({
    ...r,
    batchAmount: beitrag.get(r.accountNumber)?.amount ?? 0,
  }));

  // Ein Konto, das dieser Stapel erstmals bebucht, hat noch keine Ist-Zeile.
  // Ohne diesen Anhang wäre der Vorschlag unsichtbar — genau der Fall, den
  // Schritt 6 zeigen soll. Ein Beitrag von 0 (Soll und Haben heben sich auf)
  // ist keine Bewegung und hängt nichts an.
  const bekannt = new Set(rows.map((r) => r.accountNumber));
  const neu = [...beitrag.values()]
    .filter((c) => !bekannt.has(c.accountNumber) && c.amount !== 0)
    .sort((a, b) => a.accountNumber.localeCompare(b.accountNumber))
    .map((c) => ({
      accountNumber: c.accountNumber,
      accountName: c.accountName,
      accountingRole: c.accountingRole,
      // Weder DATEV noch Ludwig kennen das Konto — nur der Vorschlag.
      ludwig: { m3: null, m2: null, m1: null, current: 0 },
      datevCurrent: 0,
      // Kein Vormonat, kein Ist: die Engine sagt „zu jung", markiert nichts.
      vergleich: vergleiche({ m3: null, m2: null, m1: null, current: 0 }, "amount"),
      batchAmount: c.amount,
      // Der Cast ist die ehrliche Stelle: eine angehängte Zeile trägt nur die
      // Felder von `KontoVergleich`, nicht die Zusätze eines engeren `T`
      // (etwa `quittiert`). Der einzige Aufrufer merged vor genau diesen
      // Zusätzen, deshalb kostet das nichts.
    })) as unknown as (T & { batchAmount: number })[];

  return [...zusammengefuehrt, ...neu];
}
