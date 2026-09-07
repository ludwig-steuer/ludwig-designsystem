/**
 * # Der Name des Gegenparts
 *
 * Eine Kaskade für alle Leser der Anzeigeseite. Die SQL-Fassung derselben
 * Regel steht als `counterpartyNameExpr` in `counterparty-name.ts` — sie
 * importiert Drizzle und ist deshalb nicht spiegelbar; diese Datei ist es,
 * und darum stehen die beiden getrennt.
 */

/**
 * Dieselbe Kaskade für Daten, die schon geladen sind.
 *
 * `counterpartyNameExpr` oben ist der SQL-Weg; diese Funktion ist der Weg für
 * die Anzeige. Bis 2026-09-07 gab es dafür drei Wege nebeneinander:
 * `PartnerCell` rechnete aus Richtung und vendor/customer, `BelegeTab` nahm
 * `class_counterparty_name`, der v3-Drawer beschriftete das Feld schlicht
 * „Lieferant" (L-36). Bei einer Ausgangsrechnung ist der „Lieferant" aber der
 * Mandant selbst.
 *
 * Reihenfolge abnehmender Verlässlichkeit, gleich der SQL-Fassung:
 *   1. der aufgelöste Geschäftspartner — nicht geraten
 *   2. das Extraktionsfeld der jeweiligen Richtung
 *   3. der Klassifizierungs-Fallback am Supertyp
 *
 * `null` heißt „kein Name bekannt" und nicht „kein Gegenpart" — die Anzeige
 * fällt dann auf den Dateinamen zurück, nicht auf einen erfundenen Namen.
 */
export function documentCounterparty(doc: {
  /** Aufgelöster Geschäftspartner, falls vorhanden. */
  businessPartnerName?: string | null;
  docDirection?: string | null;
  vendorName?: string | null;
  customerName?: string | null;
  classCounterpartyName?: string | null;
}): string | null {
  const clean = (v: string | null | undefined) => {
    const t = v?.trim();
    return t && t.length > 0 ? t : null;
  };
  return (
    clean(doc.businessPartnerName) ??
    // Bei einer Ausgangsrechnung ist der Gegenpart der Kunde; `vendorName`
    // wäre dort der Mandant selbst.
    (doc.docDirection === "outbound" ? clean(doc.customerName) : clean(doc.vendorName)) ??
    clean(doc.classCounterpartyName)
  );
}
