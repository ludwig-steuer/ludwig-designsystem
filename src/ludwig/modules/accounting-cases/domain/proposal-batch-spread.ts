/**
 * Batch-Konsistenz: Spread-Metriken über die offenen Vorschläge EINES Laufs
 * (C1 Konto-Spread, C3 Steuer-Spread je Kreditor).
 *
 * Fix 2026-08-14 (Buchungsagent-Befund „Gate 3b wird nie grün"): Die alte
 * SQL-Zählung (`count(distinct account)` über alle Zeilen eines Kreditors)
 * zählte Soll- und Habenzeile DESSELBEN Satzes als „Streuung", sobald der
 * Personenkonto-Ausschluss über die Row-ID (`creditor_account_id`) nicht
 * griff — Konten sind seit 20260807140000 je Wirtschaftsjahr modelliert,
 * die Line kann also auf die Personenkonto-Zeile eines anderen Cycles
 * zeigen (real: 4250 Soll + 78021 Haben desselben Satzes = „Spread").
 * Gleiches Muster bei C3: eine gemischte 7%/19%-Rechnung hat zwei
 * BU-Schlüssel in EINEM Satz und ist kein Batch-Befund.
 *
 * Neue Semantik: Streuung wird über SÄTZE hinweg gemessen, nie über die
 * Zeilen eines einzelnen Satzes. Ein Kreditor ist erst auffällig, wenn
 * mindestens zwei Sätze mit UNTERSCHIEDLICHEN Konto- (bzw. Schlüssel-)
 * Mengen existieren. Identisch strukturierte Sätze (z.B. zweimal
 * {6800, 1576}) sind konsistent — genau das prüft der Judge in C1/C3.
 */

export interface CreditorAccountLineRow {
  businessPartnerId: string;
  partnerName: string | null;
  journalEntryId: string;
  /** Sachkonto-Nummer der Zeile (Personenkonto-Zeilen sind vorab ausgeschlossen). */
  account: string;
}

export interface CreditorAccountSpreadFinding {
  businessPartnerId: string;
  partnerName: string | null;
  accounts: string[];
  accountCount: number;
  entries: Array<{ journalEntryId: string; account: string }>;
}

export interface CreditorTaxKeyLineRow {
  businessPartnerId: string;
  partnerName: string | null;
  journalEntryId: string;
  taxKey: string;
}

export interface CreditorTaxKeySpreadFinding {
  businessPartnerId: string;
  partnerName: string | null;
  taxKeys: string[];
  keyCount: number;
  journalEntryIds: string[];
}

/** Pro Kreditor: journalEntryId → sortierte Menge der Werte. */
function groupPerEntry(
  rows: Array<{ businessPartnerId: string; partnerName: string | null; journalEntryId: string; value: string }>,
): Map<string, { partnerName: string | null; perEntry: Map<string, Set<string>> }> {
  const byPartner = new Map<
    string,
    { partnerName: string | null; perEntry: Map<string, Set<string>> }
  >();
  for (const row of rows) {
    let partner = byPartner.get(row.businessPartnerId);
    if (!partner) {
      partner = { partnerName: row.partnerName, perEntry: new Map() };
      byPartner.set(row.businessPartnerId, partner);
    }
    let entry = partner.perEntry.get(row.journalEntryId);
    if (!entry) {
      entry = new Set();
      partner.perEntry.set(row.journalEntryId, entry);
    }
    entry.add(row.value);
  }
  return byPartner;
}

/** Streuung liegt vor, wenn ≥2 Sätze existieren, deren Wert-Mengen sich unterscheiden. */
function hasCrossEntrySpread(perEntry: Map<string, Set<string>>): boolean {
  if (perEntry.size < 2) return false;
  const signatures = new Set<string>();
  for (const values of perEntry.values()) {
    signatures.add([...values].sort().join("|"));
  }
  return signatures.size >= 2;
}

export function computeCreditorAccountSpread(
  rows: CreditorAccountLineRow[],
): CreditorAccountSpreadFinding[] {
  const findings: CreditorAccountSpreadFinding[] = [];
  const byPartner = groupPerEntry(
    rows.map((r) => ({ ...r, value: r.account })),
  );
  for (const [businessPartnerId, { partnerName, perEntry }] of byPartner) {
    if (!hasCrossEntrySpread(perEntry)) continue;
    const accounts = new Set<string>();
    const entries: Array<{ journalEntryId: string; account: string }> = [];
    for (const [journalEntryId, entryAccounts] of perEntry) {
      for (const account of [...entryAccounts].sort()) {
        accounts.add(account);
        entries.push({ journalEntryId, account });
      }
    }
    findings.push({
      businessPartnerId,
      partnerName,
      accounts: [...accounts].sort(),
      accountCount: accounts.size,
      entries,
    });
  }
  return findings;
}

export function computeTaxKeySpread(
  rows: CreditorTaxKeyLineRow[],
): CreditorTaxKeySpreadFinding[] {
  const findings: CreditorTaxKeySpreadFinding[] = [];
  const byPartner = groupPerEntry(rows.map((r) => ({ ...r, value: r.taxKey })));
  for (const [businessPartnerId, { partnerName, perEntry }] of byPartner) {
    if (!hasCrossEntrySpread(perEntry)) continue;
    const taxKeys = new Set<string>();
    for (const keys of perEntry.values()) for (const k of keys) taxKeys.add(k);
    findings.push({
      businessPartnerId,
      partnerName,
      taxKeys: [...taxKeys].sort(),
      keyCount: taxKeys.size,
      journalEntryIds: [...perEntry.keys()],
    });
  }
  return findings;
}
