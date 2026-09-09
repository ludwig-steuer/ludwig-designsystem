import { z } from "zod";
import type { RawSearchParams } from "@/ludwig/shared";

export const VAT_PROFILE = [
  "domestic_standard",
  "domestic_reverse_charge",
  "eu_acquisition_or_service",
  "non_eu_reverse_charge",
  "small_business_exemption",
  "tax_exempt",
  "margin_scheme",
  "mixed",
  "unknown",
] as const;
export type VatProfile = (typeof VAT_PROFILE)[number];

/**
 * Was der Geschäftspartner typischerweise liefert — Spiegel des DB-CHECK
 * `client_business_partners_typical_nature_check`.
 *
 * Bis 2026-09-08 fehlten `service` und `investment`: die Aufzählung führte
 * vier Werte, die Datenbank sechs. **924 Partner** des Bestands tragen die
 * beiden fehlenden (877 + 47), und die Partner-Liste las
 * `PARTNER_NATURE_LABEL[p.typicalNature]` ohne Fallback — für jeden dieser
 * 924 stand dort `undefined` (L-222).
 */
export const TYPICAL_NATURE = [
  "goods",
  "service",
  "expense",
  "investment",
  "mixed",
  "unknown",
] as const;
export type TypicalNature = (typeof TYPICAL_NATURE)[number];

/**
 * Was der Geschäftspartner typischerweise liefert — reines Vokabular, kein Status
 * (kein Fortschritt, keine Farbe). Gehört deshalb nicht in die
 * Status-Registry, aber zentral hierher.
 */
export const PARTNER_NATURE_LABEL: Record<TypicalNature, string> = {
  goods: "Ware",
  service: "Dienstleistung",
  expense: "Aufwand",
  investment: "Anlagegut",
  mixed: "Gemischt",
  unknown: "—",
};

export const ONBOARDING_STATE = ["draft", "proposed", "confirmed"] as const;
export type OnboardingState = (typeof ONBOARDING_STATE)[number];

/**
 * Ein Personenkonto des Partners, wie es in der Liste erscheint.
 * `isInternal` = Ludwig-interner Platzhalter (`source='system_allocated'`,
 * 89xxxx), unter dem gebucht wird, solange DATEV den Partner nicht kennt.
 * Er wird bewusst GEZEIGT statt versteckt — ein leeres Feld verleitet dazu,
 * ein zweites Konto anzulegen (F101 E2).
 */
export interface PartnerAccountRef {
  accountNumber: string;
  isInternal: boolean;
}

/**
 * Ein Personenkonto des Partners über ALLE Wirtschaftsjahre (Konten-Tab).
 * Der Partner ist zeitlos, seine Konten sind es nicht — hier wird sichtbar,
 * wenn er im Vorjahr eine andere Nummer trug.
 */
export interface PartnerPersonalAccount {
  accountId: string;
  fiscalYear: number;
  fiscalYearStatus: string;
  role: "creditor" | "debtor";
  accountNumber: string;
  accountName: string;
  source: string;
  status: string;
  datevSyncState: string;
  datevAccountId: string | null;
  datevAddresseeId: string | null;
  usageBookingCount: number;
  lastBookingDate: string | null;
  isInternal: boolean;
}

export interface BusinessPartnerListItem {
  businessPartnerId: string;
  clientId: string;
  legalName: string;
  shortName: string | null;
  vatProfile: VatProfile;
  typicalNature: TypicalNature;
  onboardingState: OnboardingState;
  usageBookingCount: number;
  lastBookingDate: string | null;
  ustIds: string[];
  city: string | null;
  /** Personenkonto der jeweiligen Rolle im aktuellen Wirtschaftsjahr
   *  (jahresfreie `_current`-Sicht). Ein Partner kann beide, eines oder
   *  keines tragen (F76 R3). */
  creditorAccount: PartnerAccountRef | null;
  debtorAccount: PartnerAccountRef | null;
  /**
   * Verrechnungs-Sachkonten, über die der Partner abrechnet (R23/R24).
   * Mehrzahl: eine Person trägt im Regelfall mehrere (Karte + Spesen, zwei
   * Karten). Leer heißt „kein Abrechner" — zusammen mit den beiden
   * Personenkonto-Feldern beantwortet das „was ist dieser Partner?" ohne Join.
   */
  clearingAccounts: PartnerAccountRef[];
}

export interface BusinessPartnerDetail extends BusinessPartnerListItem {
  taxIds: string[];
  addressLine1: string | null;
  postalCode: string | null;
  countryCode: string | null;
  websiteUrl: string | null;
  businessDescription: string | null;
  vatNotes: string | null;
  typicalCurrency: string | null;
  typicalPaymentTermDays: number | null;
  typicalPaymentType: string | null;
  typicalTaxKeys: string[];
  source: string;
  createdAt: string;
  updatedAt: string;
  normalizedName: string | null;
  /** Kreditor-Personenkonto des aktuellen Wirtschaftsjahres (jahresfreie Sicht). */
  accountId: string | null;
  /** F76/F64: typisches Gegenkonto als logische Kontonummer, keine Jahres-FK. */
  defaultDebitAccountNumber: string | null;
  profilingMetadata: unknown;
}

/** Welche Personenkonto-Seite der Partner tragen muss. `none` = gar keins. */
export const PARTNER_ROLES = ["creditor", "debtor", "none"] as const;
export type PartnerRole = (typeof PARTNER_ROLES)[number];

export const PARTNER_ROLE_LABEL: Record<PartnerRole, string> = {
  creditor: "Nur Kreditoren",
  debtor: "Nur Debitoren",
  none: "Ohne Personenkonto",
};

export interface BusinessPartnerFilter {
  /** Freitext über Name, USt-ID und Kontonummer — „wer ist 70123?" ist die
   *  häufigste Frage an diese Liste. */
  nameContains?: string;
  onboardingState?: OnboardingState[];
  vatProfile?: VatProfile[];
  role?: PartnerRole;
}

const BusinessPartnerFilterRawSchema = z.object({
  q: z.string().min(1).optional(),
  state: z.string().optional(),
  vat: z.string().optional(),
  role: z.string().optional(),
});

export function parseBusinessPartnerFilter(raw: RawSearchParams): BusinessPartnerFilter {
  const parsed = BusinessPartnerFilterRawSchema.safeParse({
    q: typeof raw.q === "string" ? raw.q : undefined,
    state: typeof raw.state === "string" ? raw.state : undefined,
    vat: typeof raw.vat === "string" ? raw.vat : undefined,
    role: typeof raw.role === "string" ? raw.role : undefined,
  });
  if (!parsed.success) return {};

  const onboardingState = parsed.data.state
    ? (parsed.data.state
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is OnboardingState =>
          (ONBOARDING_STATE as readonly string[]).includes(s),
        ) as OnboardingState[])
    : undefined;

  const vatProfile = parsed.data.vat
    ? (parsed.data.vat
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is VatProfile => (VAT_PROFILE as readonly string[]).includes(s)) as VatProfile[])
    : undefined;

  const role = (PARTNER_ROLES as readonly string[]).includes(parsed.data.role ?? "")
    ? (parsed.data.role as PartnerRole)
    : undefined;

  return {
    nameContains: parsed.data.q,
    role,
    onboardingState: onboardingState && onboardingState.length > 0 ? onboardingState : undefined,
    vatProfile: vatProfile && vatProfile.length > 0 ? vatProfile : undefined,
  };
}
