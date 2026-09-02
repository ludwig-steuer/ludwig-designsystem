/**
 * Automatikkonto + BU-Schlüssel — die Prüfung, die an JEDEN Schreibpfad gehört.
 *
 * Auf einem DATEV-Automatikkonto (`client_ledger_accounts.datev_tax_rate`
 * gesetzt) bestimmt der Kontosatz die Steuer. Ein mitgesendeter BU-Schlüssel
 * ist dort ein Import-Fehler: der Export entfernt ihn still (gleicher Satz)
 * oder weist den Stapel ab (abweichender Satz) — in beiden Fällen steht in
 * Ludwig etwas anderes als in DATEV.
 *
 * Der Guard `automaticAccountWithTaxKey` deckte nur `submit_booking_proposal`
 * ab. Dieselbe Prüfung sitzt seit W3a auch an der manuellen Buchung und an den
 * Regel-Vorlagen (dort kamen die 21 Dauerregeln mit `template_tax_key='3'` auf
 * `8400`/`8401` her). Erkennung und Fehlertext leben deshalb hier — ein Ort,
 * drei Aufrufer, identischer Fix-Text.
 */

export interface AutomaticAccountTaxKeyHit {
  accountNumber: string;
  /** Fester Satz des Kontos laut DATEV, `null` wenn nicht auflösbar. */
  rate: number | null;
  /** Die auf diesem Konto gesetzten Schlüssel, in Reihenfolge des Auftretens. */
  taxKeys: string[];
}

/**
 * Welche Zeilen tragen einen BU-Schlüssel auf einem Automatikkonto?
 *
 * `rateByAccount` ist die Automatikkonten-Sicht des ZIEL-Wirtschaftsjahres
 * (`loadAutomaticAccountsByExec`) bzw. eine gleichwertige Ableitung. Steuer-
 * zeilen (§13b/igE auf 1407/1577/1787/3837) filtert der Aufrufer vorher raus —
 * dort ist der Schlüssel der vorgeschriebene Weg.
 */
export function findTaxKeysOnAutomaticAccounts(
  lines: ReadonlyArray<{ accountNumber: string; taxKey?: string | null }>,
  rateByAccount: ReadonlyMap<string, number>,
): AutomaticAccountTaxKeyHit[] {
  const byAccount = new Map<string, AutomaticAccountTaxKeyHit>();
  for (const line of lines) {
    const key = (line.taxKey ?? "").trim();
    if (key === "" || key === "0") continue;
    if (!rateByAccount.has(line.accountNumber)) continue;
    const hit = byAccount.get(line.accountNumber) ?? {
      accountNumber: line.accountNumber,
      rate: rateByAccount.get(line.accountNumber) ?? null,
      taxKeys: [],
    };
    if (!hit.taxKeys.includes(key)) hit.taxKeys.push(key);
    byAccount.set(line.accountNumber, hit);
  }
  return [...byAccount.values()];
}

/** Was nicht stimmt — mit Konto, Satz und den gesetzten Schlüsseln. */
export function automaticAccountTaxKeyMessage(hit: AutomaticAccountTaxKeyHit): string {
  return (
    `Konto ${hit.accountNumber} ist ein DATEV-Automatikkonto (fester Satz ${hit.rate ?? "?"} %) — es ` +
    `versteuert selbst. Gesetzt ist dort der Steuerschlüssel ${hit.taxKeys.join(", ")}; im Export ` +
    `würde er stillschweigend entfernt, gespeichert bliebe er stehen (Ludwig und DATEV wären dann ` +
    `verschieden).`
  );
}

/** Was zu tun ist. Der Fix nennt beide Lesarten: kein Schlüssel — oder falsches Konto. */
export function automaticAccountTaxKeyFix(hit: AutomaticAccountTaxKeyHit): string {
  return (
    `Auf ${hit.accountNumber} keinen Steuerschlüssel setzen (weglassen bzw. "0") und keine eigene ` +
    `Steuerzeile buchen — die Steuer entsteht in DATEV automatisch. Ist der Steuersatz hier ein ` +
    `anderer als ${hit.rate ?? "?"} %, ist es die falsche Kontowahl: passendes Nicht-Automatikkonto ` +
    `suchen (search_accounts zeigt isAutomaticAccount) oder Klärung stellen.`
  );
}
