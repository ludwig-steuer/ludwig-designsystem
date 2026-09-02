/**
 * DATEV-Feldlängen an einer Stelle — und die Kürzung dazu.
 *
 * Ludwig kürzt selbst, statt sich darauf zu verlassen, dass DATEV zu lange Werte
 * stillschweigend abschneidet: Was die Gegenseite mit einem Überlauf macht, ist je
 * Endpunkt verschieden (die Buchungsstapel-Felder werden gekürzt, ein zu langer
 * `legal_name` kann den POST auch mit 400 quittieren) — und ein Import, der an einem
 * Feldüberlauf scheitert, ist der teuerste Weg, das herauszufinden.
 *
 * Zweiter Grund: Wer kürzt, entscheidet auch WIE. `slice(0, 40)` trennt mitten im
 * Wort („Privatpraxis für Physiotherapie Kati Sch"), `truncateAtWordBoundary` an der
 * letzten Wortgrenze davor. In DATEV steht der Name danach in Kontenblättern und auf
 * Auswertungen — er soll lesbar sein.
 */

/** `legal_person.legal_name` bei der Deb/Kred-Anlage (DATEVconnect-Schema). */
export const DATEV_MAX_LEGAL_NAME = 40;

/** Buchungstext (EXTF-Feld 14 / `posting_description`). */
export const DATEV_MAX_BUCHUNGSTEXT = 60;

/** Belegfeld 2 (EXTF-Feld 12 / `document_field2`). */
export const DATEV_MAX_BELEGFELD2 = 12;

/**
 * Kürzt auf `max` Zeichen, bevorzugt an der letzten Wortgrenze. Fällt auf hartes
 * Abschneiden zurück, wenn dabei weniger als die Hälfte übrig bliebe — ein einzelnes
 * langes Wort soll nicht zu einem Fragment werden, das niemand mehr zuordnet.
 */
export function truncateAtWordBoundary(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  const hard = trimmed.slice(0, max).trimEnd();
  const lastSpace = hard.lastIndexOf(" ");
  return lastSpace >= Math.floor(max / 2) ? hard.slice(0, lastSpace) : hard;
}

/**
 * Der Name, unter dem ein Personenkonto in DATEV angelegt wird. Einzige Stelle, an
 * der aus Ludwigs vollem `legal_name` der DATEV-Name wird — die Bridge übernimmt ihn
 * unverändert (ihr eigenes `slice` ist nur noch Sicherheitsnetz am Draht).
 */
export function datevLegalName(legalName: string): string {
  return truncateAtWordBoundary(legalName, DATEV_MAX_LEGAL_NAME);
}
