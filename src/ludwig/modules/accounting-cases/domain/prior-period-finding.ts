/**
 * F498 (K9) — Befund „Altlast Vormonat": ein Kommentar am Sachverhalt mit
 * Befund-Art statt `comment`. Der Agent meldet einen in DATEV doppelt
 * stehenden Satz aus einem Vormonat; die Kanzlei korrigiert in DATEV.
 * Erledigt ist der Befund abgeleitet — sobald der Spiegel die Korrektur zeigt
 * (Regel „Korrektur im Spiegel", unten), nie als gespeicherter Status.
 */
export const PRIOR_PERIOD_DUPLICATE_FINDING = "prior_period_duplicate" as const;
export const CASE_COMMENT_FINDINGS = [PRIOR_PERIOD_DUPLICATE_FINDING] as const;
export type CaseCommentFinding = (typeof CASE_COMMENT_FINDINGS)[number];

export interface MirrorEntryLine {
  accountNumber: string;
  side: "debit" | "credit";
  amount: number;
}

/** Je Konto die Summe in Cent: Soll +, Haben −, der Betrag mit Vorzeichen (Generalumkehr negativ). */
export function mirrorEntryNets(lines: MirrorEntryLine[]): Map<string, number> {
  const nets = new Map<string, number>();
  for (const l of lines) {
    const cents = Math.round(l.amount * 100) * (l.side === "debit" ? 1 : -1);
    nets.set(l.accountNumber, (nets.get(l.accountNumber) ?? 0) + cents);
  }
  return nets;
}

/**
 * Kehrt `candidate` den Satz `original` um? Dieselben Konten, jeder Saldo genau
 * negiert, mindestens einer ≠ 0 — so steht in DATEV sowohl die Generalumkehr
 * (gleiche Seite, negativer Betrag) als auch der klassische Storno (Seiten getauscht).
 */
export function reversesMirrorEntry(original: MirrorEntryLine[], candidate: MirrorEntryLine[]): boolean {
  const a = mirrorEntryNets(original);
  const b = mirrorEntryNets(candidate);
  if (a.size !== b.size) return false;
  let nonZero = false;
  for (const [account, net] of a) {
    if (!b.has(account) || b.get(account) !== -net) return false;
    if (net !== 0) nonZero = true;
  }
  return nonZero;
}
