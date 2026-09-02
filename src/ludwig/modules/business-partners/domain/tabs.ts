export const PARTNER_TABS = [
  "master-data",
  "accounts",
  "invoices",
  "cases",
  "technical",
] as const;
export type PartnerTab = (typeof PARTNER_TABS)[number];

export const PARTNER_TAB_LABEL: Record<PartnerTab, string> = {
  "master-data": "Stammdaten",
  accounts: "Konten",
  invoices: "Belege",
  cases: "Sachverhalte",
  technical: "Technik",
};

export function parsePartnerTab(value: string | string[] | undefined): PartnerTab {
  const v = Array.isArray(value) ? value[0] : value;
  return (PARTNER_TABS as readonly string[]).includes(v ?? "") ? (v as PartnerTab) : "master-data";
}
