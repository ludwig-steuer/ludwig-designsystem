/**
 * Die Belegart einer Beleg-Erwartung als Wort — **eine** Map für den Kern
 * (Rationale-Texte) und das Panel „Fehlt". Lag bis 2026-09-11 zweimal vor,
 * im Kern und im Panel, mit auseinanderlaufenden Wörtern (Erhebung
 * Erwartungen 2026-09-11). Rein, damit auch Client-Komponenten sie lesen.
 *
 * Die Reife einer Erwartung ist **keine** Map hier: sie ist die Registry-Achse
 * `erwartung` (`StatusBadge`), ihre Art die Achse `erwartung_art`.
 */
export const EXPECTED_DOC_KIND_LABEL: Record<string, string> = {
  invoice: "Rechnung",
  receipt: "Beleg/Quittung",
  contract: "Vertrag",
  statement: "Kontoauszug",
  other: "Unterlage",
};

/** Unbekannte oder fehlende Belegart heißt „Unterlage", nie leer. */
export function expectedDocKindLabel(kind: string | null | undefined): string {
  return (kind ? EXPECTED_DOC_KIND_LABEL[kind] : undefined) ?? "Unterlage";
}
