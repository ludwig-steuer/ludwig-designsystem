/**
 * Die Auswahlliste der Zahlungskonten — und die eine Frage davor: welches
 * dieser Konten wird überhaupt geführt?
 *
 * Das Onboarding promotet den ganzen SKR-Bankblock zu Zahlungskonten (die
 * DATEV-Kontenfunktion 10 wirft Bank, Kasse, PSP und Verrechnungskonten in
 * einen Topf). Ein Mandant hat dadurch 25 bis 43 Konten, von denen faktisch
 * eines Geld bewegt — bei `beispiel-mandant` steht die „Stadtbank" mit 145
 * Buchungen zwischen 24 Karteileichen wie „Geldtransit", „Nebenkasse 2" und
 * „Bank (Postbank 3)". Wer einen Kontoauszug zuordnet, sucht sein Konto sonst
 * in einer Liste aus Kulisse.
 *
 * Ausgeblendet wird nichts: eine falsch abgeleitete Erwartung darf niemanden
 * aussperren. Die weiteren Konten stehen hinten, nicht draußen.
 */

/** Was die Entscheidung braucht — die Teilmenge von `PaymentAccountWithStats`. */
export interface PaymentAccountFacts {
  id: string;
  displayName: string;
  iban: string | null;
  /** Abgeleitete Auszugserwartung, bank.md R15a/R15b. */
  expectsStatements: boolean;
  /** Gesetzt = hier landen Zahlungen dieser Art automatisch. */
  autoAssignPaymentMethod: string | null;
  txCount: number;
}

/** Ein Zahlungskonto, wie es in einem Dropdown steht. */
export interface PaymentAccountOption {
  id: string;
  /** Fertige Beschriftung: Name, bei Bankverbindung mit IBAN. */
  label: string;
  iban: string | null;
  /** true = geführtes Konto. */
  inUse: boolean;
}

/**
 * Wird dieses Konto geführt? Drei Merkmale, jedes für sich genügt:
 *
 *  1. **Es erwartet Auszüge** — die gepflegte Antwort aus R15a/R15b, inklusive
 *     der Hand-Entscheidung eines Menschen.
 *  2. **Es ist bebucht** — eine gebuchte Zeile ist ein Fakt, keine Ableitung.
 *  3. **Es trägt eine Auto-Zuordnung** — Kasse und PayPal erwarten keinen
 *     Kontoauszug, sind aber genau die Konten, auf denen Zahlungen landen.
 *
 * Ein promotetes SKR-Konto ohne alle drei hat nie eine Rolle gespielt.
 */
export function isPaymentAccountInUse(account: PaymentAccountFacts): boolean {
  return (
    account.expectsStatements || account.txCount > 0 || account.autoAssignPaymentMethod !== null
  );
}

/**
 * Baut die Optionen für jedes Zahlungskonto-Dropdown — geführte zuerst,
 * innerhalb der Gruppe in der Reihenfolge der Eingabe (die Query ordnet bereits
 * nach Auto-Zuordnung, Art und Name).
 */
export function toPaymentAccountOptions(
  accounts: readonly PaymentAccountFacts[],
): PaymentAccountOption[] {
  return accounts
    .map((a) => ({
      id: a.id,
      label: a.iban ? `${a.displayName} · ${a.iban}` : a.displayName,
      iban: a.iban,
      inUse: isPaymentAccountInUse(a),
    }))
    .sort((a, b) => Number(b.inUse) - Number(a.inUse));
}
