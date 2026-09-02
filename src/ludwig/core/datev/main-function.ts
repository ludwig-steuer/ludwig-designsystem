/**
 * DATEV-Kontenfunktion — das gemeinsame Vokabular für „was für ein Konto ist das".
 *
 * **DATEVs Begriffe, nicht unsere** — so benannt in DATEVs OpenAPI-Spec
 * (`Accounting-1.7.4.1.json`, `schema_general-ledger-account`):
 * *Hauptfunktionsnummer* (`main_function_number`), *Hauptfunktionstyp*
 * (`main_function`), *Funktionsergänzung* (`function_extension`),
 * *Funktionsbezeichnung* (`function_description`), *Kontobeschriftung*
 * (`caption`). Das frühere Ludwig-Wort „Kontenart" gibt es nicht mehr.
 *
 * Vor W3 las jeder Consumer die nackte Zahl mit einer eigenen lokalen Deutung:
 * `=== 10` im Payment-Tagging, `90 || 91` in der Sammelkonto-Auflösung. Zwei
 * Stellen, zwei Interpretationen derselben Kennziffer. Hier steht sie einmal.
 *
 * **Zwei Achsen, nicht eine:**
 *  - `main_function_number` → `datev_main_function_number`, dieses Modul.
 *  - `main_function` → `datev_main_function`, der Hauptfunktionstyp: welche
 *    Steuerrechnung das Konto trägt (1 automatische Vorsteuer · 2 automatische
 *    USt · 3 allgemeine Funktion · 4 Sammelfunktion · 6/7 Sammelfunktion mit
 *    automatischer Vorsteuer/USt; 0 = keine, in der Spec nicht gelistet).
 *    Wird mitgeführt, hat aber bewusst **keinen Consumer**: als Automatik-Signal
 *    erzeugte `main_function != 0` an echten 61015-Daten 454 Fehlalarme (F60) —
 *    die Automatik-Frage beantwortet `datev_tax_rate`.
 *
 * Vollständige Nummern-Referenz mit DATEVs eigenem Klartext je Funktion:
 * `docs/reference/datev-api/kontenfunktionen.md`.
 */

/**
 * Die Funktionsnummern, die Ludwig deutet — **keine vollständige DATEV-Liste**:
 * der 61015-Kontenrahmen führt 69 verschiedene Werte. Alles, was hier nicht
 * steht, bleibt bewusst ungedeutet, statt es zu raten.
 *
 * **Nicht aufnehmen: 20/21/25** — auch wenn DATEVs englische Spec dort
 * „supplier account / customer account" schreibt. Der deutsche Klartext
 * derselben API (`function_description`) sagt *Lieferantenskonto* /
 * *Kundenskonto*: Lieferanten-**Skonto**, nicht Lieferanten-Konto. Dahinter
 * liegen `3730 Erhaltene Skonti` / `8730 Gewährte Skonti`, Hauptfunktionstyp
 * 6/7 (Steuerautomatik). Die Rollen-Ableitung daraus hat auf Staging 76
 * Sachkonten falsch klassifiziert und ist raus; Personenkonten kommen aus
 * `accounts-receivable`/`accounts-payable`.
 *
 * **98 = blocked** kennt die Spec neben 12 („entry block"). Im 61015-Rahmen
 * kommt 98 nicht vor — deshalb hier nicht gedeutet. Taucht es auf, an echten
 * Daten prüfen, bevor `isPostingBlocked` es mitnimmt.
 */
export const DATEV_MAIN_FUNCTION_NUMBER = {
  /** Geldkonto — Kasse *und* Bank; die Unterscheidung liefert DATEV nicht. */
  money: 10,
  /**
   * Buchungssperre — DATEV lehnt jede Buchung auf dieses Konto ab. Typisch:
   * Konten mit abgelaufenem Steuersatz (16 %), berechnete Konten
   * (Jahresüberschuss/-fehlbetrag), reservierte Sammelkonten. Verifiziert an
   * der Live-Antwort (`docs/reference/datev-api/03-general-ledger-accounts.csv`:
   * `main_function_number = 12` → `function_description = "Buchungssperre"`)
   * und am DATEV-Spiegel: über 23.000 Sätze aus 2025/26 (61015 + 10160)
   * bebuchen kein einziges 12er-Konto.
   */
  postingBlock: 12,
  /** Sammelkonto Forderungen (Debitoren-Überlagerung im Journal). */
  collectiveReceivables: 90,
  /** Sammelkonto Verbindlichkeiten (Kreditoren-Überlagerung im Journal). */
  collectivePayables: 91,
} as const;

/** Rohzelle (Int oder String, je nach API-Serialisierung) → Funktionsnummer oder null. */
export function parseDatevMainFunctionNumber(value: unknown): number | null {
  const n = Number.parseInt(String(value ?? "").trim(), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * Buchungsgesperrt (Funktionsnummer 12). Ein Vorschlag auf so einem Konto wird
 * beim Import abgewiesen — deshalb blockt der Guard, statt zu warnen, und die
 * Kandidatenquellen liefern es gar nicht erst aus.
 */
export function isPostingBlocked(fn: number | null): boolean {
  return fn === DATEV_MAIN_FUNCTION_NUMBER.postingBlock;
}

/** Geldkonto (Kasse/Bank/Karte) — Voraussetzung für ein `client_payment_accounts`. */
export function isMoneyAccount(fn: number | null): boolean {
  return fn === DATEV_MAIN_FUNCTION_NUMBER.money;
}

/**
 * Sammelkonto (Personenkonten-Überlagerung). Der Mirror-Parser dropt diese Legs,
 * um die Nebenbuch-Sicht zu behalten.
 */
export function isCollectiveAccount(fn: number | null): boolean {
  return (
    fn === DATEV_MAIN_FUNCTION_NUMBER.collectiveReceivables ||
    fn === DATEV_MAIN_FUNCTION_NUMBER.collectivePayables
  );
}
