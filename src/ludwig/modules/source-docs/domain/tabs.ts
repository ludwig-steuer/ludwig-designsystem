/**
 * Tab-Katalog der Beleg-Detailansicht — **ein** Katalog für jede Belegart
 * (Rechnung, Vertrag, Kontoauszug, unklassifiziert …). Vorher gab es zwei
 * konkurrierende Sets (`INVOICE_TABS` / `SOURCE_DOC_TABS`) mit eigenen
 * Slugs, eigener Tab-Leiste und eigener Shell; siehe decision-log 2026-07-20.
 *
 * Die Belegart bestimmt nur noch, **welche** Tabs sichtbar sind
 * (`availableDocTabs`) und wie der erste Tab heißt — nicht mehr, welche
 * Ansicht gemountet wird.
 *
 * URL-Konvention: `?tab=<slug>`, der Default-Tab („beleg") trägt keinen
 * Param.
 */
export const DOC_TABS = [
  "beleg",
  "positionen",
  "vorsteuer",
  "verlauf",
  "pipeline",
  "rohdaten",
] as const;
export type DocTab = (typeof DOC_TABS)[number];

export const DOC_TAB_LABEL: Record<DocTab, string> = {
  beleg: "Beleg",
  positionen: "Positionen",
  vorsteuer: "Vorsteuer",
  verlauf: "Verlauf & Befunde",
  pipeline: "Pipeline",
  rohdaten: "Rohdaten",
};

/**
 * Label des ersten Tabs je Belegart — derselbe Slot, andere Aufschrift:
 * bei einer Rechnung steht dort der Buchungsvorschlag, beim Vertrag die
 * Vertrags-Prüfung, sonst der Beleg selbst.
 */
export function belegTabLabel(args: {
  isInvoice: boolean;
  isContract: boolean;
}): string {
  if (args.isInvoice) return "Buchung";
  if (args.isContract) return "Vertrag";
  return "Beleg";
}

/**
 * Sichtbare Tabs. `positionen` und `vorsteuer` setzen eine Rechnungs-
 * Subtyp-Zeile voraus (Positionen/VSt-Fakten gibt es ausschließlich dort).
 * Verlauf, Pipeline und Rohdaten kann jede Belegart füllen.
 */
export function availableDocTabs(args: { isInvoice: boolean }): DocTab[] {
  return DOC_TABS.filter(
    (tab) => args.isInvoice || (tab !== "positionen" && tab !== "vorsteuer"),
  );
}

export function parseDocTab(
  value: string | string[] | undefined,
  available: readonly DocTab[],
): DocTab {
  const raw = Array.isArray(value) ? value[0] : value;
  // "buchung" war bis 2026-07-20 der Slug der Rechnungs-Hauptansicht.
  const slug = raw === "buchung" ? "beleg" : raw;
  return available.includes(slug as DocTab) ? (slug as DocTab) : "beleg";
}
