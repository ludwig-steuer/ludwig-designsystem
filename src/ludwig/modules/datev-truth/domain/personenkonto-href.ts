/**
 * # Der Weg zum Personenkonto
 *
 * Die Kontoseite adressiert über die **Nummer**, nicht über die Id — und
 * genau die trägt der offene Posten. Eine eigene Datei, weil die Regel
 * geprüft ist und die Seite sie nur einsetzt.
 *
 * Hier stand bis 2026-09-08 ein Client-Wrapper um `OpenItemRow`: die Zeile
 * bot nur `onOpen(personalAccount)` an, und eine Rückruffunktion lässt sich
 * aus einer Server-Component nicht durchreichen. Seit DS `1d40a22` nimmt sie
 * einen `href` — der Wrapper ist weg, und mit ihm die drei Dinge, die ein
 * `router.push` kostet: mittlere Maustaste, „in neuem Tab öffnen", Statuszeile.
 */

/**
 * Der Weg zum Personenkonto. `encodeURIComponent`, weil ein Konto mit Zusatz
 * sonst ein zweites Pfadsegment aufmachen würde.
 */
export function personenkontoHref(accountsBasePath: string, personalAccount: string): string {
  return `${accountsBasePath}/${encodeURIComponent(personalAccount)}`;
}
