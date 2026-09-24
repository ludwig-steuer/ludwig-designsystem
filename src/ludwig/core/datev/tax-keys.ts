/**
 * Katalog der DATEV-Steuerschlüssel (BU-Schlüssel) — die eine Quelle für
 * Agent-Validierung (`modules/accounting-cases/domain/tax-keys`) UND Anzeige
 * (`ui/booking`). Liegt in `core/datev`, damit die geteilte Buchungs-UI ihn
 * ohne Modul-Deep-Import lesen kann.
 *
 * Die BU-Schlüssel sind bei DATEV framework-übergreifend gleich (SKR03 == SKR04);
 * die verifizierten Werte 2/3/8/9 stammen aus dem DATEV-Import der Testmandanten,
 * `1` (steuerfrei) ist Standard. §13b (Reverse-Charge, 91/92/94/95) und
 * innergemeinschaftlicher Erwerb (18/19) hängen am konkreten Sachverhalt.
 */
/** F271: Gruppe im Nachschlagewerk (`tax-key-reference.ts`). */
export type TaxKeyGroup = "input_tax" | "output_tax" | "intra_community" | "reverse_charge" | "tax_free";

export interface TaxKeyEntry {
  key: string;
  group: TaxKeyGroup;
  label: string;
  /** USt-Satz in Prozent, null wenn steuerfrei/nicht anwendbar. */
  vatRate: number | null;
  /** `input` = Vorsteuer (Eingangsseite), `output` = Umsatzsteuer (Ausgangsseite), `none`. */
  direction: "input" | "output" | "none";
  /** Ein Satz Klartext für die Anzeige (Tooltip am Buchungssatz). */
  description: string;
  /**
   * F81-T81.2: Schlüssel, den Ludwig **nur durchreicht** — keine Satz-Expansion,
   * keine Steuerzeile, keine Assistenz. Nur im expliziten Modus (`lines[]`)
   * setzbar und nur, wenn die Historie desselben Kontos ihn trägt.
   */
  passThrough?: true;
}

export const DATEV_TAX_KEYS: readonly TaxKeyEntry[] = [
  {
    key: "1",
    group: "tax_free",
    label: "Umsatzsteuerfrei (mit Vorsteuerabzug)",
    vatRate: 0,
    direction: "none",
    description:
      "Steuerfreier Umsatz mit Vorsteuerabzug — auf der Buchung entsteht keine Umsatzsteuer, z.B. Ausfuhr oder innergemeinschaftliche Lieferung.",
  },
  {
    key: "2",
    group: "output_tax",
    label: "Umsatzsteuer 7 %",
    vatRate: 7,
    direction: "output",
    description:
      "Ausgangsseite: aus dem Bruttobetrag werden 7 % Umsatzsteuer herausgerechnet und auf das USt-Konto gebucht (Zahllast ans Finanzamt).",
  },
  {
    key: "3",
    group: "output_tax",
    label: "Umsatzsteuer 19 %",
    vatRate: 19,
    direction: "output",
    description:
      "Ausgangsseite: aus dem Bruttobetrag werden 19 % Umsatzsteuer herausgerechnet und auf das USt-Konto gebucht (Zahllast ans Finanzamt).",
  },
  {
    key: "8",
    group: "input_tax",
    label: "Vorsteuer 7 %",
    vatRate: 7,
    direction: "input",
    description:
      "Eingangsseite: aus dem Bruttobetrag werden 7 % Vorsteuer herausgerechnet und auf das VSt-Konto gebucht (Erstattung vom Finanzamt).",
  },
  {
    key: "9",
    group: "input_tax",
    label: "Vorsteuer 19 %",
    vatRate: 19,
    direction: "input",
    description:
      "Eingangsseite: aus dem Bruttobetrag werden 19 % Vorsteuer herausgerechnet und auf das VSt-Konto gebucht (Erstattung vom Finanzamt).",
  },
  {
    key: "91",
    group: "reverse_charge",
    label: "§ 13b 7 % (mit Vorsteuerabzug)",
    vatRate: 7,
    direction: "input",
    description:
      "Reverse Charge nach § 13b UStG: der Leistungsempfänger schuldet die Steuer. Der Rechnungsbetrag ist netto; es entstehen zwei Steuerzeilen (USt + abziehbare VSt), die sich ausgleichen.",
  },
  {
    key: "92",
    group: "reverse_charge",
    label: "§ 13b 7 % (ohne Vorsteuerabzug)",
    vatRate: 7,
    direction: "input",
    description:
      "Reverse Charge nach § 13b UStG ohne Vorsteuerabzug: die geschuldete Umsatzsteuer wird zum Aufwand, es gibt keine Erstattung.",
  },
  {
    key: "94",
    group: "reverse_charge",
    label: "§ 13b 19 % (mit Vorsteuerabzug)",
    vatRate: 19,
    direction: "input",
    description:
      "Reverse Charge nach § 13b UStG: der Leistungsempfänger schuldet die Steuer. Der Rechnungsbetrag ist netto; es entstehen zwei Steuerzeilen (USt + abziehbare VSt), die sich ausgleichen.",
  },
  {
    key: "95",
    group: "reverse_charge",
    label: "§ 13b 19 % (ohne Vorsteuerabzug)",
    vatRate: 19,
    direction: "input",
    description:
      "Reverse Charge nach § 13b UStG ohne Vorsteuerabzug: die geschuldete Umsatzsteuer wird zum Aufwand, es gibt keine Erstattung.",
  },
  {
    key: "18",
    group: "intra_community",
    label: "Innergemeinschaftlicher Erwerb 7 %",
    vatRate: 7,
    direction: "input",
    description:
      "Einkauf aus einem anderen EU-Land: der Erwerber versteuert selbst. Erwerbsteuer und Vorsteuer werden beide gebucht und heben sich auf.",
  },
  {
    key: "19",
    group: "intra_community",
    label: "Innergemeinschaftlicher Erwerb 19 %",
    vatRate: 19,
    direction: "input",
    description:
      "Einkauf aus einem anderen EU-Land: der Erwerber versteuert selbst. Erwerbsteuer und Vorsteuer werden beide gebucht und heben sich auf.",
  },
  {
    key: "11",
    group: "intra_community",
    label: "Steuerfreie innergem. Lieferung",
    vatRate: 0,
    direction: "output",
    description:
      "Ausgangsseite: steuerfreie innergemeinschaftliche Lieferung an einen Unternehmer im EU-Ausland (§ 4 Nr. 1 b UStG) — erscheint in der UStVA (Kz 41) und in der Zusammenfassenden Meldung.",
  },
  // ---------------------------------------------------------------------
  // Aktuelle DATEV-Schlüssel (3-/4-stellig, seit WJ 2018): die Zuordnung zu
  // den bisherigen steht unten (`CURRENT_TAX_KEY_BY_LEGACY`,
  // `CURRENT_REVERSE_CHARGE_KEY`), die Bedeutung in
  // docs/reference/datev-api/tax-keys-legacy-vs-current.md. `taxKeyEntry`
  // führt einen aktuellen Schlüssel auf den bisherigen Eintrag zurück; nur
  // `490` hat kein bisheriges Gegenstück und bleibt eigener Eintrag.
  {
    key: "490",
    group: "tax_free",
    label: "Ohne Vorsteuerabzug (bewusst)",
    vatRate: null,
    direction: "none",
    description:
      "Kennzeichnet eine Buchung, für die bewusst kein Vorsteuerabzug erfolgt: der Beleg weist Steuer aus, sie wird nicht gezogen. Ludwig rechnet damit keine Steuerzeile.",
    passThrough: true,
  },
] as const;

/** bisheriger Schlüssel → aktueller Schlüssel, eindeutig ohne Sachverhalt. */
export const CURRENT_TAX_KEY_BY_LEGACY: Readonly<Record<string, string>> = {
  "1": "171", "2": "102", "3": "101", "8": "402", "9": "401",
  "11": "231", "18": "702", "19": "701",
};

/** § 13b: bisheriger Schlüssel + Sachverhalt L+L → aktueller Schlüssel. */
export const CURRENT_REVERSE_CHARGE_KEY: Readonly<Record<string, Readonly<Record<number, string>>>> = {
  "94": { 7: "506", 1: "511", 4: "526" },
  "91": { 7: "507", 1: "512", 4: "527" },
  "95": { 7: "6506", 1: "6511", 4: "6526" },
  "92": { 7: "6507", 1: "6512", 4: "6527" },
};

/** Sachverhalt L+L (§ 13b) → Bezeichnung im Nachschlagewerk; jeder Sachverhalt aus `CURRENT_REVERSE_CHARGE_KEY` steht hier. */
export const REVERSE_CHARGE_CASE_LABEL: Readonly<Record<number, string>> = {
  7: "Sonstige Leistung eines EU-Unternehmers (§ 13b Abs. 1, UStVA Kz 46/47)",
  1: "Leistung eines ausländischen Unternehmers (§ 13b Abs. 2 Nr. 1, UStVA Kz 84/85)",
  4: "Bauleistung (§ 13b Abs. 2 Nr. 4, UStVA Kz 84/85)",
};

export interface CurrentTaxKey {
  key: string;
  /** Der aktuelle Schlüssel trägt den § 13b-Tatbestand — der Sachverhalt L+L entfällt. */
  carriesReverseChargeCase: boolean;
}

/** Bisheriger Schlüssel (+ Sachverhalt L+L) → aktueller DATEV-Schlüssel; ohne Zuordnung unverändert. */
export function toCurrentTaxKey(legacyKey: string, reverseChargeCase: number | null): CurrentTaxKey {
  const rc = reverseChargeCase == null ? undefined : CURRENT_REVERSE_CHARGE_KEY[legacyKey]?.[reverseChargeCase];
  if (rc) return { key: rc, carriesReverseChargeCase: true };
  return { key: CURRENT_TAX_KEY_BY_LEGACY[legacyKey] ?? legacyKey, carriesReverseChargeCase: false };
}

/** Umkehrung beider Tabellen, einmal beim Modul-Load gebaut. */
const LEGACY_BY_CURRENT: ReadonlyMap<string, string> = new Map([
  ...Object.entries(CURRENT_TAX_KEY_BY_LEGACY).map(([legacy, current]) => [current, legacy] as const),
  ...Object.entries(CURRENT_REVERSE_CHARGE_KEY).flatMap(([legacy, byCase]) =>
    Object.values(byCase).map((current) => [current, legacy] as const),
  ),
]);

/** Aktueller DATEV-Schlüssel → bisheriger (`401` → `9`, `506` → `94`); alles andere unverändert. */
export function toLegacyTaxKey(key: string): string {
  return LEGACY_BY_CURRENT.get(key) ?? key;
}

/** Katalog-Eintrag zu einem BU-Schlüssel (bisherige oder aktuelle Form), `null` wenn unbekannt. */
export function taxKeyEntry(taxKey: string | null | undefined): TaxKeyEntry | null {
  if (!taxKey) return null;
  const legacy = toLegacyTaxKey(taxKey);
  return DATEV_TAX_KEYS.find((k) => k.key === legacy) ?? null;
}

/** Schlüssel, aus dem Ludwig weder Satz noch Steuerzeile ableitet (F81-T81.2). */
export function isPassThroughTaxKey(taxKey: string | null | undefined): boolean {
  return taxKeyEntry(taxKey)?.passThrough === true;
}
