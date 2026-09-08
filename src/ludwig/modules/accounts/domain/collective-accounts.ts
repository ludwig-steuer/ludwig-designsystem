/**
 * # Die Hauptbuch-Sammelkonten
 *
 * Forderungen und Verbindlichkeiten aus Lieferungen und Leistungen. Sie sind
 * die Gegenstücke der Personenkonten: gebucht wird gegen Debitor oder
 * Kreditor, im Hauptbuch landet die Summe. Die Nebenbuch-Sicht des
 * DATEV-Spiegels **droppt ihre Legs** — deshalb lässt sich für sie aus den
 * Spiegelsätzen kein laufender Saldo bilden (L-30).
 *
 * **Warum eine Liste und kein Feld.** Weder `client_ledger_accounts` noch
 * `reference_account_framework_entries` kennzeichnet diese Konten:
 * `accounting_role` kennt fünf Werte (`general_ledger`, `creditor`, `debtor`,
 * `revenue`, `other`), und die Sammelkonten sind schlicht `general_ledger` wie
 * tausend andere auch. `skr_class` ist eine Bilanzklasse, kein Merkmal.
 *
 * **Warum keine Ableitung aus der Nummer.** Dieselbe Nummer heißt je
 * Kontenrahmen etwas anderes: `1400` ist in SKR03 „Forderungen aus L+L", in
 * SKR04 „Abziehbare Vorsteuer"; `1600` in SKR03 „Verbindlichkeiten aus L+L",
 * in SKR04 „Kasse". Ein Nummernbereich wäre hier nicht unscharf, sondern
 * falsch.
 *
 * ponytail: vier Nummern als Konstante statt eines Katalog-Feldes. Der
 * Upgrade-Pfad ist eine Spalte an `reference_account_framework_entries` (etwa
 * `is_collective`), gesetzt beim Seeding des Kontenrahmens — dann fällt diese
 * Datei weg. Solange es sie nicht gibt, ist eine benannte Liste ehrlicher als
 * eine Heuristik.
 *
 * Quelle: DATEV-Kontenrahmen SKR03 (Art.-Nr. 11174) und SKR04 (11175), wie
 * sie in `supabase/migrations/20260422170000_skr_template_accounts.sql` und
 * `20260513170000_seed_skr03_entries.sql` geseedet sind.
 */

export type AccountFrameworkCode = "skr03" | "skr04";

/**
 * Die Sammelkonten je Kontenrahmen — genau zwei, Forderungen und
 * Verbindlichkeiten aus L+L.
 *
 * **Nicht dabei und mit Absicht:** `1210` / `3310` („… ohne Kontokorrent",
 * SKR04). Sie tragen denselben Namensstamm, werden aber direkt bebucht statt
 * über Personenkonten — ihre Legs fallen im Spiegel nicht weg, ihr Saldo ist
 * also darstellbar.
 */
export const COLLECTIVE_LEDGER_ACCOUNTS: Record<
  AccountFrameworkCode,
  readonly string[]
> = {
  // SKR03: 1400 Forderungen aus L+L · 1600 Verbindlichkeiten aus L+L
  skr03: ["1400", "1600"],
  // SKR04: 1200 Forderungen aus L+L · 3300 Verbindlichkeiten aus L+L
  skr04: ["1200", "3300"],
};

/** Kontenrahmen-Code normalisieren; alles Unbekannte ergibt `null`. */
export function accountFrameworkCode(raw: string | null | undefined): AccountFrameworkCode | null {
  const c = raw?.toLowerCase();
  return c === "skr03" || c === "skr04" ? c : null;
}

/**
 * Ist das ein Hauptbuch-Sammelkonto?
 *
 * Ohne bekannten Kontenrahmen `false` — nicht `true`: einen Saldo
 * vorsichtshalber zu unterdrücken wäre genauso eine Behauptung wie ihn
 * vorsichtshalber zu zeigen, und die Liste ist kurz genug, um sie zu kennen.
 */
export function isCollectiveLedgerAccount(
  framework: string | null | undefined,
  accountNumber: string | null | undefined,
): boolean {
  const skr = accountFrameworkCode(framework);
  if (!skr || !accountNumber) return false;
  return COLLECTIVE_LEDGER_ACCOUNTS[skr].includes(accountNumber.trim());
}
