/**
 * Belegablage-Gruppe (Beleggruppe) und die daraus folgende Stapel-Sortierung
 * des Buchungsstapels (BL-120).
 *
 * Der Stapel folgt der klassischen Belegablage-Reihenfolge:
 *   1. Ausgangsrechnungen → 2. Eingangsrechnungen → 3. Kasse → 4. Bank →
 *   5. reine Sachkonten-Umbuchungen (bewusst ans Ende).
 *
 * Zuordnung je Buchungssatz **kontobasiert** (nicht über `case.kind` — das
 * fehlt bei Altbestand-Sätzen und deckt Dauersachverhalte nicht sauber ab):
 *
 *   - Zahlungskonto beteiligt (`client_payment_accounts.kind`) → Kasse/Bank.
 *     Diese Regel gewinnt IMMER, auch wenn zusätzlich ein Personenkonto im
 *     Satz steht (Standardfall Zahlungsbuchung). `cash` → Kasse; die
 *     Geldkonto-Arten (bank, credit_card, paypal, other) → Gruppe Bank; bei
 *     Kasse↔Bank-Umbuchung gewinnt Kasse (frühere Gruppe, deterministisch).
 *   - `employee_clearing` ist die Ausnahme (F102): das Konto ist kein
 *     Geldkonto, sondern die Abrechnung eines Mitarbeiters. Ein Aufwand gegen
 *     das Spesenkonto ist eine Eingangsrechnung, keine Bankbuchung. Der
 *     Ausgleich landet trotzdem in der Bank-Gruppe — dort ist das Bankkonto
 *     beteiligt und gewinnt eine Zeile vorher.
 *   - sonst Personenkonto: `accounting_role` `debtor` → Ausgangsrechnung,
 *     `creditor` → Eingangsrechnung (debtor gewinnt, falls beide beteiligt).
 *   - sonst → Sachkonten-Umbuchung (Gruppe 5).
 *
 * Innerhalb jeder Gruppe bleibt die bisherige Sekundärsortierung
 * (Buchungsdatum, dann id) bestehen. Eine Zeile ohne Meta (pure Tests,
 * Alt-Aufrufer) zählt als Sachkonto — die Sortierung degradiert dann sauber
 * zur alten Datums-Ordnung.
 *
 * Nicht zu verwechseln mit der **Satzart** (`core/accounting/entry-kind.ts`):
 * die Gruppe hier sagt, *wo der Beleg liegt*, die Satzart, *was der Satz tut*.
 * Beide werden vom selben Helper gestempelt (`journal-entry-stamp.ts`), teilen
 * aber bewusst keinen Klassifikations-Code.
 *
 * WICHTIG: EXTF-Datei und JSON-Sequence (API-Export) müssen exakt dieselbe
 * Reihenfolge liefern — beide Builder nutzen `sortEntriesByDocumentGroup`.
 */

export type DocumentGroup =
  | "outgoing_invoices"
  | "incoming_invoices"
  | "cash"
  | "bank"
  | "general_ledger";

export const DOCUMENT_GROUP_RANK: Record<DocumentGroup, number> = {
  outgoing_invoices: 1,
  incoming_invoices: 2,
  cash: 3,
  bank: 4,
  general_ledger: 5,
};

/** Anzeigetexte — englischer Schlüssel, deutsches Label daneben. */
export const DOCUMENT_GROUP_LABEL: Record<DocumentGroup, string> = {
  outgoing_invoices: "Ausgangsrechnungen",
  incoming_invoices: "Eingangsrechnungen",
  cash: "Kasse",
  bank: "Bank",
  general_ledger: "Sachbuchungen",
};

/** Konto-Meta einer Buchungszeile, soweit für die Gruppenzuordnung nötig. */
export interface DocumentGroupLine {
  /** `client_ledger_accounts.accounting_role` oder null/fehlend. */
  accountingRole?: string | null;
  /** `client_payment_accounts.kind` des Kontos, oder null/fehlend. */
  paymentAccountKind?: string | null;
}

/** Belegablage-Gruppe eines Buchungssatzes aus den Konten seiner Zeilen. */
export function classifyDocumentGroup(lines: readonly DocumentGroupLine[]): DocumentGroup {
  let hasCash = false;
  let hasPayment = false;
  let hasEmployeeClearing = false;
  let hasDebtor = false;
  let hasCreditor = false;
  for (const l of lines) {
    if (l.paymentAccountKind === "cash") hasCash = true;
    else if (l.paymentAccountKind === "employee_clearing") hasEmployeeClearing = true;
    else if (l.paymentAccountKind != null) hasPayment = true;
    if (l.accountingRole === "debtor") hasDebtor = true;
    else if (l.accountingRole === "creditor") hasCreditor = true;
  }
  if (hasCash) return "cash";
  if (hasPayment) return "bank";
  if (hasDebtor) return "outgoing_invoices";
  if (hasCreditor || hasEmployeeClearing) return "incoming_invoices";
  return "general_ledger";
}

interface SortableEntry {
  id: string;
  bookingDate: string;
  lines: readonly DocumentGroupLine[];
}

/**
 * DIE Stapel-Reihenfolge (BL-120): Belegablage-Gruppe → Buchungsdatum → id.
 * Ersetzt die frühere reine Datums-Sortierung in EXTF- und JSON-Builder.
 * Gibt eine sortierte Kopie zurück.
 */
export function sortEntriesByDocumentGroup<T extends SortableEntry>(entries: readonly T[]): T[] {
  const ranked = entries.map((e) => ({
    entry: e,
    rank: DOCUMENT_GROUP_RANK[classifyDocumentGroup(e.lines)],
  }));
  ranked.sort(
    (a, b) =>
      a.rank - b.rank ||
      a.entry.bookingDate.localeCompare(b.entry.bookingDate) ||
      a.entry.id.localeCompare(b.entry.id),
  );
  return ranked.map((r) => r.entry);
}
