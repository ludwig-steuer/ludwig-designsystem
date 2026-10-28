/**
 * F491 (K12) — eigene Steuerzeile neben einem Automatikkonto oder einer Zeile mit Steuerschlüssel.
 *
 * DATEV erzeugt die Steuer selbst: aus dem festen Satz eines Automatikkontos (`datev_tax_rate`) bzw. aus dem
 * BU-Schlüssel 2/3/8/9. Eine zusätzlich gebuchte Steuerzeile ist entweder doppelt (Export) oder die falsche
 * gespeicherte Form (R9 verlangt brutto). Drei reine Regeln über dieselbe Paarung:
 * - Schreibweg (`planAutomaticTaxLines`): passt die Steuerzeile genau, führt der Submit sie zusammen, sonst lehnt er ab;
 * - Spiegel (`detectDatevGeneratedTaxLines`): die von DATEV erzeugte Steuerzeile eines Satzes erkennen;
 * - Anzeige (`foldDatevGeneratedTax`): Präzedenzen zeigen die Basis brutto, die Steuerzeile verschwindet.
 */
import { toLegacyTaxKey } from "@/ludwig/core/datev/tax-keys";
import {
  STANDARD_ASSIST_TAX_KEYS,
  TAX_KEY_RATE_PERCENT,
  taxAccountFor,
  taxAccountNumbersForFramework,
} from "./tax-keys";

export const AUTOMATIC_TAX_LINE_MERGED = "B3_AUTOMATIC_TAX_LINE_MERGED";
export const AUTOMATIC_TAX_LINE_CONFLICT = "B3_AUTOMATIC_TAX_LINE_CONFLICT";
export const AUTOMATIC_TAX_BASES = ["automatic_account", "tax_key"] as const;
export type AutomaticTaxBasis = (typeof AUTOMATIC_TAX_BASES)[number];
export const AUTOMATIC_TAX_CONFLICT_REASONS = ["wrong_tax_account", "amount_mismatch", "ambiguous", "duplicate"] as const;
export type AutomaticTaxConflictReason = (typeof AUTOMATIC_TAX_CONFLICT_REASONS)[number];

const STANDARD_KEYS_BY_RATE: Readonly<Record<number, readonly string[]>> = { 19: ["9", "3"], 7: ["8", "2"] };

/** Standard-Steuerkonten (Vor- und Umsatzsteuer) zu einem Satz; anderer Satz oder unbekannter Rahmen → leer. */
export function standardTaxAccountsForRate(
  framework: string | null,
  ratePercent: number,
  accountNumberLength = 4,
): ReadonlySet<string> {
  const numbers = (STANDARD_KEYS_BY_RATE[ratePercent] ?? []).flatMap((k) => {
    const account = taxAccountFor(framework, k);
    return account ? [account.accountNumber.padEnd(accountNumberLength, "0")] : [];
  });
  return new Set(numbers);
}

/** Die Steuerkonten zu 2/3/8/9 des Rahmens (aufgefüllt) — nur diese Zeilen gelten als Steuerzeile. */
function standardTaxLineAccounts(framework: string | null, accountNumberLength: number): ReadonlyMap<string, string> {
  return new Map(
    [...STANDARD_ASSIST_TAX_KEYS].flatMap((k) => {
      const account = taxAccountFor(framework, k);
      return account ? [[account.accountNumber.padEnd(accountNumberLength, "0"), account.accountName] as const] : [];
    }),
  );
}

const STANDARD_TAX_ACCOUNT_NAME: ReadonlyMap<string, string> = new Map(
  ["skr03", "skr04"].flatMap((fw) => [...standardTaxLineAccounts(fw, 4)]),
);

const blankKey = (taxKey: string | null | undefined) => !taxKey || taxKey.trim() === "" || taxKey.trim() === "0";

interface Basis {
  lineNo: number;
  basis: AutomaticTaxBasis;
  ratePercent: number;
  taxKey: string | null;
  accounts: ReadonlySet<string>;
}

/** Basis einer Zeile (Schlüssel vor Automatikkonto) oder null. */
function basisOf(
  line: { accountNumber: string; taxKey?: string | null; taxForLineNo?: number | null },
  lineNo: number,
  ctx: { framework: string | null; automaticRates: ReadonlyMap<string, number>; taxAccounts: ReadonlySet<string>; len: number },
): Basis | null {
  if (ctx.taxAccounts.has(line.accountNumber) || line.taxForLineNo != null) return null;
  if (!blankKey(line.taxKey)) {
    const key = toLegacyTaxKey(line.taxKey!.trim());
    if (!STANDARD_ASSIST_TAX_KEYS.has(key)) return null;
    const account = taxAccountFor(ctx.framework, key);
    return {
      lineNo,
      basis: "tax_key",
      ratePercent: TAX_KEY_RATE_PERCENT[key]!,
      taxKey: key,
      accounts: new Set(account ? [account.accountNumber.padEnd(ctx.len, "0")] : []),
    };
  }
  const rate = ctx.automaticRates.get(line.accountNumber);
  if (rate == null) return null;
  return {
    lineNo,
    basis: "automatic_account",
    ratePercent: rate,
    taxKey: null,
    accounts: standardTaxAccountsForRate(ctx.framework, rate, ctx.len),
  };
}

const cents = (amount: number) => Math.round(amount * 100);
const expectedTaxCents = (baseAmount: number, ratePercent: number) =>
  Math.round((Math.abs(cents(baseAmount)) * ratePercent) / 100);
const amountFits = (baseAmount: number, taxAmount: number, ratePercent: number) =>
  Math.sign(baseAmount) === Math.sign(taxAmount) &&
  Math.abs(Math.abs(cents(taxAmount)) - expectedTaxCents(baseAmount, ratePercent)) <= 1;

/* ----------------------------------------------------------------------- */
/* Schreibweg                                                               */
/* ----------------------------------------------------------------------- */

export interface AutomaticTaxPlanLine {
  side: "debit" | "credit";
  accountNumber: string;
  accountName: string;
  amount: number;
  taxKey?: string | null;
  taxForLineNo?: number | null;
}

export interface AutomaticTaxMerge {
  taxLineNo: number;
  taxAccountNumber: string;
  taxAccountName: string;
  taxAmount: number;
  baseLineNo: number;
  baseAccountNumber: string;
  baseAccountName: string;
  baseTaxKey: string | null;
  ratePercent: number;
  basis: AutomaticTaxBasis;
  grossAmount: number;
}

export interface AutomaticTaxConflict {
  taxLineNo: number;
  taxAccountNumber: string;
  taxAccountName: string;
  taxAmount: number;
  baseLineNos: number[];
  baseAccountNumber: string;
  baseAccountName: string;
  /** Betrag der ersten Basis — für „erwartet x € (Basis × Satz)“. */
  baseAmount: number;
  ratePercent: number;
  basis: AutomaticTaxBasis;
  reason: AutomaticTaxConflictReason;
  expectedTaxAmount: number | null;
  expectedTaxAccounts: string[];
}

/**
 * Paart jede Steuerzeile (2/3/8/9-Konto des Rahmens) mit ihrer Basis: genau eine passende, freie Basis → Merge,
 * sonst Konflikt. Steuerzeilen ohne Basis auf derselben Seite bleiben unberührt (kein K12-Fall).
 */
export function planAutomaticTaxLines(
  lines: readonly AutomaticTaxPlanLine[],
  opts: { automaticRates: ReadonlyMap<string, number>; framework: string | null },
): { merges: AutomaticTaxMerge[]; conflicts: AutomaticTaxConflict[] } {
  const merges: AutomaticTaxMerge[] = [];
  const conflicts: AutomaticTaxConflict[] = [];
  const taxLineAccounts = standardTaxLineAccounts(opts.framework, 4);
  if (taxLineAccounts.size === 0) return { merges, conflicts };
  const ctx = {
    framework: opts.framework,
    automaticRates: opts.automaticRates,
    taxAccounts: taxAccountNumbersForFramework(opts.framework, 4),
    len: 4,
  };
  const bases = lines.map((l, i) => basisOf(l, i + 1, ctx));
  const consumed = new Set<number>();

  lines.forEach((tax, i) => {
    if (!taxLineAccounts.has(tax.accountNumber)) return;
    const taxLineNo = i + 1;
    const candidates =
      tax.taxForLineNo != null
        ? [bases[tax.taxForLineNo - 1]].filter((b): b is Basis => b != null)
        : bases.filter((b): b is Basis => b != null && lines[b.lineNo - 1]!.side === tax.side);
    if (candidates.length === 0) return;
    const fits = (b: Basis) =>
      b.accounts.has(tax.accountNumber) && amountFits(lines[b.lineNo - 1]!.amount, tax.amount, b.ratePercent);
    const passing = candidates.filter(fits);
    const free = passing.filter((b) => !consumed.has(b.lineNo));
    if (free.length === 1) {
      const b = free[0]!;
      const base = lines[b.lineNo - 1]!;
      consumed.add(b.lineNo);
      merges.push({
        taxLineNo,
        taxAccountNumber: tax.accountNumber,
        taxAccountName: tax.accountName,
        taxAmount: tax.amount,
        baseLineNo: b.lineNo,
        baseAccountNumber: base.accountNumber,
        baseAccountName: base.accountName,
        baseTaxKey: b.taxKey,
        ratePercent: b.ratePercent,
        basis: b.basis,
        grossAmount: (cents(base.amount) + cents(tax.amount)) / 100,
      });
      return;
    }
    const [reason, involved]: [AutomaticTaxConflictReason, Basis[]] =
      free.length > 1
        ? ["ambiguous", free]
        : passing.length > 0
          ? ["duplicate", passing]
          : candidates.some((b) => amountFits(lines[b.lineNo - 1]!.amount, tax.amount, b.ratePercent))
            ? ["wrong_tax_account", candidates]
            : ["amount_mismatch", candidates];
    const first = involved[0]!;
    const base = lines[first.lineNo - 1]!;
    conflicts.push({
      taxLineNo,
      taxAccountNumber: tax.accountNumber,
      taxAccountName: tax.accountName,
      taxAmount: tax.amount,
      baseLineNos: involved.map((b) => b.lineNo),
      baseAccountNumber: base.accountNumber,
      baseAccountName: base.accountName,
      baseAmount: base.amount,
      ratePercent: first.ratePercent,
      basis: first.basis,
      reason,
      expectedTaxAmount: expectedTaxCents(base.amount, first.ratePercent) / 100,
      expectedTaxAccounts: [...first.accounts],
    });
  });
  return { merges, conflicts };
}

/**
 * Wendet die Merges an: Basis = brutto (über `setAmount`), Steuerzeile raus, `taxForLineNo` der übrigen Zeilen
 * umgerechnet (alte Nummer − entfernte Zeilen davor). Eingabe bleibt unverändert.
 */
export function applyAutomaticTaxMerges<L extends object>(
  lines: readonly L[],
  merges: readonly AutomaticTaxMerge[],
  setAmount: (line: L, amount: number) => L,
): L[] {
  const removed = merges.map((m) => m.taxLineNo);
  const grossByBase = new Map(merges.map((m) => [m.baseLineNo, m.grossAmount]));
  const renumber = (no: number) => no - removed.filter((r) => r < no).length;
  const out: L[] = [];
  lines.forEach((line, i) => {
    const no = i + 1;
    if (removed.includes(no)) return;
    let next = grossByBase.has(no) ? setAmount(line, grossByBase.get(no)!) : line;
    const ref = (next as { taxForLineNo?: number | null }).taxForLineNo;
    if (ref != null && renumber(ref) !== ref) next = { ...next, taxForLineNo: renumber(ref) };
    out.push(next);
  });
  return out;
}

/* ----------------------------------------------------------------------- */
/* Texte                                                                    */
/* ----------------------------------------------------------------------- */

const eur = (n: number) => `${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
const rateText = (r: number) => (Number.isInteger(r) ? String(r) : r.toLocaleString("de-DE"));
const account = (number: string, name: string | null | undefined) => (name ? `${number} ${name}` : number);

export const AUTOMATIC_TAX_MERGE_FIX = "Nichts zu tun. Künftig die Sachzeile brutto ohne eigene Steuerzeile senden.";

export function automaticTaxMergeMessage(m: AutomaticTaxMerge): string {
  const head =
    `${account(m.taxAccountNumber, m.taxAccountName)} (${eur(m.taxAmount)}) mit ` +
    `${account(m.baseAccountNumber, m.baseAccountName)} zusammengeführt: `;
  return m.basis === "automatic_account"
    ? `${head}${m.baseAccountNumber} ist Automatikkonto (${rateText(m.ratePercent)} %), DATEV erzeugt die Steuer selbst. ` +
        `Gebucht: ${m.baseAccountNumber} brutto ${eur(m.grossAmount)}, ohne eigene Steuerzeile.`
    : `${head}Schlüssel ${m.baseTaxKey} rechnet die Steuer in DATEV. ` +
        `Gebucht: ${m.baseAccountNumber} brutto ${eur(m.grossAmount)} mit Schlüssel ${m.baseTaxKey}, ohne eigene Steuerzeile.`;
}

export function automaticTaxConflictMessage(c: AutomaticTaxConflict): string {
  const basis =
    c.basis === "automatic_account"
      ? `einem Automatikkonto (${rateText(c.ratePercent)} %)`
      : `einer Zeile mit Steuerschlüssel (${rateText(c.ratePercent)} %)`;
  const head =
    `Eigene Steuerzeile ${c.taxLineNo} ${account(c.taxAccountNumber, c.taxAccountName)} (${eur(c.taxAmount)}) ` +
    `neben ${account(c.baseAccountNumber, c.baseAccountName)} (Zeile ${c.baseLineNos[0]}), ${basis}: `;
  switch (c.reason) {
    case "wrong_tax_account":
      return (
        head +
        (c.expectedTaxAccounts.length
          ? `dazu passt nur ${c.expectedTaxAccounts.map((n) => account(n, STANDARD_TAX_ACCOUNT_NAME.get(n))).join(" oder ")}.`
          : "dazu passt keine Steuerzeile.")
      );
    case "amount_mismatch":
      return (
        head +
        `erwartet ${eur(c.expectedTaxAmount ?? 0)} (${eur(Math.abs(c.baseAmount))} × ${rateText(c.ratePercent)} %), ` +
        `gesendet ${eur(c.taxAmount)}.`
      );
    case "ambiguous":
      return head.replace(/ \(Zeile \d+\)/, "") + `passt zu mehreren Sachzeilen (Zeilen ${c.baseLineNos.join(", ")}).`;
    case "duplicate":
      return head + `zu Zeile ${c.baseLineNos[0]} gibt es schon eine passende Steuerzeile.`;
  }
}

export function automaticTaxConflictFix(c: AutomaticTaxConflict): string {
  return (
    `Steuerzeile ${c.taxLineNo} (${account(c.taxAccountNumber, c.taxAccountName)}) weglassen und die Sachzeile ` +
    `${account(c.baseAccountNumber, c.baseAccountName)} brutto buchen — DATEV rechnet die Steuer aus dem Automatikkonto ` +
    "bzw. dem Schlüssel. Stimmt der Satz nicht, ist die Kontowahl falsch: passendes Konto suchen (`account_search`) " +
    "oder Klärung stellen."
  );
}

/* ----------------------------------------------------------------------- */
/* Spiegel                                                                  */
/* ----------------------------------------------------------------------- */

export interface DatevTaxDetection {
  baseLineNo: number;
  basis: AutomaticTaxBasis;
}

/**
 * Erkennt je Spiegelzeile, ob DATEV sie als Steuer zu einer Basis desselben Satzes erzeugt hat: gleiches, nicht
 * leeres Gegenkonto, BU der Steuerzeile leer oder gleich dem der Basis, je Basis höchstens eine Steuerzeile.
 * Mehrdeutig oder unbekannter Rahmen → null.
 */
export function detectDatevGeneratedTaxLines(
  lines: ReadonlyArray<{
    accountNumber: string;
    side: "debit" | "credit";
    amount: number;
    taxKey: string | null;
    contraAccountNumber: string | null;
  }>,
  opts: { automaticRates: ReadonlyMap<string, number>; framework: string | null; accountNumberLength: number },
): Array<DatevTaxDetection | null> {
  const out: Array<DatevTaxDetection | null> = lines.map(() => null);
  const len = opts.accountNumberLength;
  const taxLineAccounts = standardTaxLineAccounts(opts.framework, len);
  if (taxLineAccounts.size === 0) return out;
  const ctx = {
    framework: opts.framework,
    automaticRates: opts.automaticRates,
    taxAccounts: taxAccountNumbersForFramework(opts.framework, len),
    len,
  };
  const bases = lines.map((l, i) => basisOf(l, i + 1, ctx));
  const consumed = new Set<number>();
  lines.forEach((tax, i) => {
    if (!taxLineAccounts.has(tax.accountNumber) || !tax.contraAccountNumber) return;
    const taxKey = blankKey(tax.taxKey) ? null : toLegacyTaxKey(tax.taxKey!.trim());
    const passing = bases.filter((b): b is Basis => {
      if (b == null || consumed.has(b.lineNo)) return false;
      const base = lines[b.lineNo - 1]!;
      return (
        base.side === tax.side &&
        base.contraAccountNumber === tax.contraAccountNumber &&
        (taxKey == null || taxKey === b.taxKey) &&
        b.accounts.has(tax.accountNumber) &&
        amountFits(base.amount, tax.amount, b.ratePercent)
      );
    });
    if (passing.length !== 1) return;
    consumed.add(passing[0]!.lineNo);
    out[i] = { baseLineNo: passing[0]!.lineNo, basis: passing[0]!.basis };
  });
  return out;
}

/* ----------------------------------------------------------------------- */
/* Anzeige                                                                  */
/* ----------------------------------------------------------------------- */

export interface DatevTaxMark {
  entryId: string;
  taxLineNo: number;
  taxAccountNumber: string;
  taxAccountName: string | null;
  taxAmount: number;
  baseLineNo: number;
  baseAccountNumber: string;
  baseAccountName: string | null;
  baseAmount: number;
  ratePercent: number | null;
  baseAutomatic: boolean;
}

/** Hinweis an der brutto gezeigten Basis einer Präzedenz. */
export function datevTaxNote(mark: DatevTaxMark): string {
  const head = mark.ratePercent != null ? `inkl. ${rateText(mark.ratePercent)} % – Steuer erzeugt DATEV` : "inkl. Steuer – erzeugt DATEV";
  return mark.baseAutomatic ? `${head} (Automatikkonto, ohne Schlüssel buchen)` : head;
}

/** Hinweis am Kontenblatt der Basis (Betrag bleibt netto, saldentreu). */
export function datevTaxBaseNote(mark: DatevTaxMark): string {
  const rate = mark.ratePercent != null ? ` (${rateText(mark.ratePercent)} %)` : "";
  const gross = (cents(mark.baseAmount) + cents(mark.taxAmount)) / 100;
  return (
    `netto; DATEV erzeugt ${eur(mark.taxAmount)} Steuer${rate} auf ${account(mark.taxAccountNumber, mark.taxAccountName)} – ` +
    `in Ludwig brutto ${eur(gross)} ohne eigene Steuerzeile buchen`
  );
}

/** Hinweis am Kontenblatt des Steuerkontos. */
export function datevTaxGeneratedNote(mark: DatevTaxMark): string {
  return `von DATEV erzeugt zu ${account(mark.baseAccountNumber, mark.baseAccountName)} – nicht als eigene Zeile buchen`;
}

/**
 * Faltet die DATEV-Steuerzeilen EINES Satzes: Basis brutto mit Hinweis, Steuerzeile weg. `marks` gehören zu diesem
 * Satz (Aufrufer filtert nach `entryId`). Fehlt Basis oder Steuerzeile in `lines`, bleibt alles stehen.
 */
export function foldDatevGeneratedTax<L extends { lineNo: number; amount: number | null }>(
  lines: readonly L[],
  marks: readonly DatevTaxMark[],
): Array<L & { datevTaxNote?: string }> {
  const byNo = new Map(lines.map((l) => [l.lineNo, l]));
  const applicable = marks.filter((m) => byNo.has(m.baseLineNo) && byNo.has(m.taxLineNo));
  const removed = new Set(applicable.map((m) => m.taxLineNo));
  const markByBase = new Map(applicable.map((m) => [m.baseLineNo, m]));
  return lines
    .filter((l) => !removed.has(l.lineNo))
    .map((l) => {
      const mark = markByBase.get(l.lineNo);
      if (!mark) return l;
      const tax = byNo.get(mark.taxLineNo)!.amount ?? mark.taxAmount;
      const amount = l.amount == null ? null : (cents(l.amount) + cents(tax)) / 100;
      return { ...l, amount, datevTaxNote: datevTaxNote(mark) };
    });
}
