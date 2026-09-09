/**
 * Tab-Katalog der Beleg-Detailansicht — **ein** Katalog für jede Belegart
 * (Rechnung, Vertrag, Kontoauszug, unklassifiziert …). Vorher gab es zwei
 * konkurrierende Sets (`INVOICE_TABS` / `SOURCE_DOC_TABS`) mit eigenen
 * Slugs, eigener Tab-Leiste und eigener Shell; siehe decision-log 2026-07-20.
 *
 * Die Belegart bestimmt nur noch, **welche** Tabs sichtbar sind
 * (`availableDocTabs`) — nicht mehr, welche Ansicht gemountet wird und auch
 * nicht mehr, wie der erste Tab heißt: er hieß je nach Belegart „Buchung",
 * „Vertrag" oder „Beleg" und zeigte in allen drei Fällen dasselbe, nämlich
 * das Original. Eine Aufschrift, die wechselt, während der Inhalt gleich
 * bleibt, ist eine falsche Fährte (L-92).
 *
 * **Seit 2026-09-08 heißt der erste „Übersicht"** (L-260). L-92 verglich nur
 * die Belegarten untereinander und landete deshalb bei „Beleg" — über die
 * Seiten hinweg ist auch der Entitätsname eine wechselnde Aufschrift für
 * denselben Inhalt: die erste Ansicht des Datensatzes. Konto und Sachverhalt
 * nennen sie längst so, der Detailseiten-Standard macht es zur Regel (D11).
 *
 * URL-Konvention: `?tab=<slug>`, der Default-Tab („uebersicht") trägt keinen
 * Param. `beleg` und `buchung` leiten darauf um — beide kursieren als
 * Deep-Links.
 */
export const DOC_TABS = [
  "uebersicht",
  "positionen",
  "vorsteuer",
  "verlauf",
  "pipeline",
  "rohdaten",
] as const;
export type DocTab = (typeof DOC_TABS)[number];

export const DOC_TAB_LABEL: Record<DocTab, string> = {
  uebersicht: "Übersicht",
  positionen: "Positionen",
  vorsteuer: "Vorsteuer",
  verlauf: "Verlauf & Befunde",
  pipeline: "Pipeline",
  rohdaten: "Rohdaten",
};

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
  // Zwei alte Slugs derselben Ansicht: „buchung" war sie bis 2026-07-20,
  // „beleg" bis 2026-09-08. Beide kursieren als Deep-Links.
  const slug = raw === "buchung" || raw === "beleg" ? "uebersicht" : raw;
  return available.includes(slug as DocTab) ? (slug as DocTab) : "uebersicht";
}
