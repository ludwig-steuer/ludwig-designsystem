/**
 * F271 — Nachschlagewerk der BU-Schlüssel: je aktuellem DATEV-Schlüssel eine
 * Zeile, mit dem bisherigen daneben. Pur, ohne React; gebaut einmal beim
 * Modul-Load aus dem Katalog (`tax-keys.ts`) — keine zweite Liste.
 */

import {
  CURRENT_REVERSE_CHARGE_KEY,
  CURRENT_TAX_KEY_BY_LEGACY,
  DATEV_TAX_KEYS,
  REVERSE_CHARGE_CASE_LABEL,
  type TaxKeyEntry,
  type TaxKeyGroup,
} from "./tax-keys";

export const TAX_KEY_GROUPS: readonly { group: TaxKeyGroup; label: string }[] = [
  { group: "input_tax", label: "Vorsteuer" },
  { group: "output_tax", label: "Umsatzsteuer" },
  { group: "intra_community", label: "Innergemeinschaftlich" },
  { group: "reverse_charge", label: "§ 13b — Steuerschuld des Leistungsempfängers" },
  { group: "tax_free", label: "Steuerfrei / ohne Vorsteuerabzug" },
];

export interface TaxKeyReferenceRow {
  currentKey: string;
  /** null = kein bisheriges Gegenstück (490). */
  legacyKey: string | null;
  /** Sachverhalt L+L, den der bisherige Schlüssel zusätzlich brauchte. */
  reverseChargeCase: number | null;
  group: TaxKeyGroup;
  label: string;
  vatRate: number | null;
  direction: TaxKeyEntry["direction"];
  description: string;
}

function rowsOf(entry: TaxKeyEntry): TaxKeyReferenceRow[] {
  const base = {
    group: entry.group,
    vatRate: entry.vatRate,
    direction: entry.direction,
    description: entry.description,
  };
  const byCase = CURRENT_REVERSE_CHARGE_KEY[entry.key];
  if (byCase) {
    return Object.entries(byCase).map(([rawCase, currentKey]) => {
      const reverseChargeCase = Number(rawCase);
      const caseLabel = REVERSE_CHARGE_CASE_LABEL[reverseChargeCase];
      if (!caseLabel) throw new Error(`Sachverhalt L+L ${reverseChargeCase} fehlt in REVERSE_CHARGE_CASE_LABEL`);
      return { ...base, currentKey, legacyKey: entry.key, reverseChargeCase, label: `${entry.label} — ${caseLabel}` };
    });
  }
  const current = CURRENT_TAX_KEY_BY_LEGACY[entry.key];
  return [
    {
      ...base,
      currentKey: current ?? entry.key,
      legacyKey: current ? entry.key : null,
      reverseChargeCase: null,
      label: entry.label,
    },
  ];
}

export const TAX_KEY_REFERENCE_ROWS: readonly TaxKeyReferenceRow[] = DATEV_TAX_KEYS.flatMap(rowsOf);

/** Zahl → Präfix auf aktuellem oder bisherigem Schlüssel; sonst Teilstring in Bezeichnung/Erklärung. */
export function searchTaxKeyReference(query: string): readonly TaxKeyReferenceRow[] {
  const q = query.trim().toLowerCase();
  if (!q) return TAX_KEY_REFERENCE_ROWS;
  if (/^\d+$/.test(q)) {
    return TAX_KEY_REFERENCE_ROWS.filter((r) => r.currentKey.startsWith(q) || (r.legacyKey?.startsWith(q) ?? false));
  }
  return TAX_KEY_REFERENCE_ROWS.filter(
    (r) => r.label.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
  );
}

/** Zeilen zum Schlüssel: erst als aktueller, sonst als bisheriger (`"94"` → drei Zeilen). */
export function highlightedTaxKeyRows(taxKey: string): readonly TaxKeyReferenceRow[] {
  const current = TAX_KEY_REFERENCE_ROWS.filter((r) => r.currentKey === taxKey);
  return current.length ? current : TAX_KEY_REFERENCE_ROWS.filter((r) => r.legacyKey === taxKey);
}
