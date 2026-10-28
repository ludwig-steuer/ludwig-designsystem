/**
 * F448 — Länderkategorie des Lieferanten, deterministisch aus den Signalen
 * des Belegs: Land → UStID-Präfix → IBAN-Präfix. Ohne Signal keine Kategorie.
 */

export const VENDOR_REGIONS = ["domestic", "eu", "non_eu"] as const;
export type VendorRegion = (typeof VENDOR_REGIONS)[number];

/** Die 27 EU-Mitgliedstaaten (ISO 3166-1 alpha-2). */
export const EU_MEMBER_STATES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR", "HR", "HU",
  "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK",
] as const;

const EU = new Set<string>(EU_MEMBER_STATES);

/** Zwei führende Buchstaben, groß; `EL` ist das griechische UStID-Präfix für `GR`. */
function prefix(value: string | null | undefined): string | null {
  const head = value?.replace(/\s+/g, "").slice(0, 2).toUpperCase();
  if (!head || !/^[A-Z]{2}$/.test(head)) return null;
  return head === "EL" ? "GR" : head;
}

export function deriveVendorRegion(signals: {
  countryCode?: string | null;
  vatId?: string | null;
  iban?: string | null;
}): VendorRegion | null {
  const country = prefix(signals.countryCode) ?? prefix(signals.vatId) ?? prefix(signals.iban);
  if (!country) return null;
  if (country === "DE") return "domestic";
  return EU.has(country) ? "eu" : "non_eu";
}

/** F472: Herkunft des Sitzlands am Partner (`client_business_partners.country_source`). */
export const PARTNER_COUNTRY_SOURCES = ["datev_import", "document", "agent", "accounting"] as const;
export type PartnerCountrySource = (typeof PARTNER_COUNTRY_SOURCES)[number];

/** Von Kanzlei oder Agent bestätigt — nur so ein Land widerspricht dem Beleg, und nur das bleibt vor dem Beleg stehen. */
export function isConfirmedCountrySource(source: string | null | undefined): boolean {
  return source === "accounting" || source === "agent";
}

/**
 * F472 — Beweisland eines Belegs: USt-IdNr.-Präfix (die OSS-Nummer `EU…` ist
 * kein Sitzland, `EL` = `GR`), sonst das Land laut Beleg. Dieselbe Regel wie
 * die Bestandsheilung in der Migration 20261009210000.
 */
export function evidenceCountry(signals: { vatId?: string | null; countryCode?: string | null }): string | null {
  const fromVatId = prefix(signals.vatId);
  if (fromVatId && fromVatId !== "EU") return fromVatId;
  const country = signals.countryCode?.trim().toUpperCase();
  return country && /^[A-Z]{2}$/.test(country) ? country : null;
}

export const VENDOR_REGION_LABEL: Record<VendorRegion, string> = {
  domestic: "Inland",
  eu: "EU-Ausland",
  non_eu: "Drittland",
};

export const PARTNER_COUNTRY_SOURCE_LABEL: Record<PartnerCountrySource, string> = {
  datev_import: "aus DATEV-Import",
  document: "aus Beleg",
  agent: "vom Agenten",
  accounting: "von der Kanzlei bestätigt",
};
