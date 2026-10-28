/**
 * F482 — Diverse-/Sammelkonto am Namen erkennen: „Diverse A", „Diverse I/J",
 * „Sammellieferant" — nicht „Diversey GmbH" oder „Schmidt Diverse". DATEV
 * markiert diese Konten oft nicht (`is_various_account`); ohne Flag greifen
 * die Schutzregeln nie (Festschreiben, Umsetzen, Vorgabe im Junior-Brief).
 *
 * SQL-Spiegel (Migration 20261012020000): `legal_name ~* '^(diverse\y|sammel)'`.
 */
const COLLECTIVE_CREDITOR_NAME = /^(diverse\b|sammel)/i;

export function isCollectiveCreditorName(name: string | null | undefined): boolean {
  return !!name && COLLECTIVE_CREDITOR_NAME.test(name.trim());
}
