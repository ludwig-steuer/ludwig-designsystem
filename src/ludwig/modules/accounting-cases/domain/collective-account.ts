/**
 * F299 — Sammelkonto nach Anfangsbuchstabe („Diverse A" … „Diverse U V W").
 *
 * Port von `_vendor_first_letter` / `_diverse_letter_set`
 * (`apps/workflows/.../diverse_creditor_pool_resolver.py`). Die Buckets kommen
 * aus den Kontenplan-**Namen** (DATEV-Stammdaten), nicht aus
 * `platform_clients.diverse_strategy`: bei 10160 steht die Strategie auf
 * `first_account`, der Kontenplan führt aber Buchstaben-Buckets, und die
 * Kanzlei bucht danach (70300 „DB, BahnCard", 70600 „Haberland").
 *
 * Rein, ohne IO.
 */

/** Erster Buchstabe A–Z, Umlaute transliteriert (Ä→A). Der Artikel zählt: „Die Kenner" → D. */
export function counterpartyFirstLetter(name: string | null | undefined): string | null {
  if (!name) return null;
  const ascii = name.normalize("NFKD").replace(/\p{M}/gu, "");
  return ascii.match(/[A-Za-z]/)?.[0]?.toUpperCase() ?? null;
}

/**
 * Buchstaben eines „Diverse X"-Kontos: „Diverse I/J" → {I, J}, „Diverse ST" →
 * {S, T}. `null`, wenn der Rest nicht nur aus Großbuchstaben besteht
 * („Diverse Kreditoren" ist kein Bucket).
 */
export function collectiveAccountLetters(accountName: string): ReadonlySet<string> | null {
  const m = accountName.trim().match(/^diverse\s+(.+)$/i);
  if (!m) return null;
  const compact = m[1]!.replace(/[\s/]+/g, "");
  if (!compact || !/^[A-Z]+$/.test(compact)) return null;
  return new Set(compact);
}

/**
 * Das Sammelkonto für diesen Namen — niedrigste Kontonummer, deren Bucket den
 * Anfangsbuchstaben enthält. `null`, wenn der Kontenplan weniger als zwei
 * Buckets führt (ein Sammelkonto für alle) oder der Buchstabe keinen hat.
 */
export function resolveCollectiveAccount(
  name: string,
  accounts: ReadonlyArray<{ accountNumber: string; accountName: string }>,
): { accountNumber: string; letter: string } | null {
  const buckets = [...accounts]
    .map((a) => ({ accountNumber: a.accountNumber, letters: collectiveAccountLetters(a.accountName) }))
    .filter((b): b is { accountNumber: string; letters: ReadonlySet<string> } => b.letters != null)
    .sort((a, b) => a.accountNumber.length - b.accountNumber.length || a.accountNumber.localeCompare(b.accountNumber));
  if (new Set(buckets.map((b) => b.accountNumber)).size < 2) return null;
  const letter = counterpartyFirstLetter(name);
  if (!letter) return null;
  const hit = buckets.find((b) => b.letters.has(letter));
  return hit ? { accountNumber: hit.accountNumber, letter } : null;
}
