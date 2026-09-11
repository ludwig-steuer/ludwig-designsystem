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
 * URL-Konvention: `?tab=<slug>`, der Default-Tab („overview") trägt keinen
 * Param. `beleg` und `buchung` leiten darauf um — beide kursieren als
 * Deep-Links.
 */
export const DOC_TABS = [
  "overview",
  "details",
  "lines",
  "input_tax",
  "timeline",
  "raw",
] as const;
export type DocTab = (typeof DOC_TABS)[number];

export const DOC_TAB_LABEL: Record<DocTab, string> = {
  overview: "Übersicht",
  details: "Details",
  lines: "Positionen",
  input_tax: "Vorsteuer",
  timeline: "Verlauf & Befunde",
  raw: "Rohdaten",
};

/**
 * Sichtbare Tabs. `lines` und `input_tax` setzen eine Rechnungs-
 * Subtyp-Zeile voraus (Positionen/VSt-Fakten gibt es ausschließlich dort).
 * Verlauf und Rohdaten kann jede Belegart füllen.
 *
 * **`details` nur, wo es etwas zu korrigieren gibt** — die Korrektur-Maske
 * einer Rechnung oder die Feldprüfung eines Vertrags. Ein Kontoauszug hat
 * keine Werte, die ein Mensch richtigstellt; ein leerer Reiter verspricht eine
 * Sicht, die es nicht gibt (derselbe Grund, aus dem Positionen und Vorsteuer
 * ohne Rechnungszeile fehlen).
 *
 * Einzelwerte — Belegdatum, Einordnung, Erledigung, DATEV-Ablage — bleiben in
 * der Übersicht an ihrem Wert (Seitenprofil, Abweichung zu D1/D9). In den
 * Reiter gehört, was mehr als einen Wert betrifft.
 */
export function availableDocTabs(args: { isInvoice: boolean; hasDetails?: boolean }): DocTab[] {
  return DOC_TABS.filter((tab) => {
    if (tab === "lines" || tab === "input_tax") return args.isInvoice;
    if (tab === "details") return args.hasDetails ?? false;
    return true;
  });
}

/**
 * Alte Slugs derselben Ansicht, die als Deep-Links kursieren: „buchung" war
 * die Übersicht bis 2026-07-20, „beleg" bis 2026-09-08 — und „pipeline" war
 * bis 2026-09-09 ein eigener Reiter. Seit L-270 ist die Pipeline **Tiefe im
 * Verlauf** (D12: drei Reiter beantworteten dieselbe Frage in drei Stufen);
 * der alte Link landet deshalb im Verlauf, nicht auf der Übersicht.
 */
const ALTE_SLUGS: Record<string, DocTab> = {
  buchung: "overview",
  beleg: "overview",
  pipeline: "timeline",
};

export function parseDocTab(
  value: string | string[] | undefined,
  available: readonly DocTab[],
): DocTab {
  const raw = Array.isArray(value) ? value[0] : value;
  const slug = (raw && ALTE_SLUGS[raw]) ?? raw;
  return available.includes(slug as DocTab) ? (slug as DocTab) : "overview";
}
