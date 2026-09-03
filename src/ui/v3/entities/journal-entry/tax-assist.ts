/**
 * GUI-Steuerassistenz (BL-121) — pure Rechenlogik des manuellen Buchungs-Editors.
 *
 * Der Editor arbeitet mit BRUTTO-Semantik: eine Sachzeile mit VSt-wirksamem
 * BU-Schlüssel (8/9) trägt den Bruttobetrag, die zugehörige Vorsteuer-Zeile
 * ist ABGELEITET — sie wird beim Anzeigen live gerechnet und beim Speichern
 * als explizite Zeile mit `taxForLineNo`-Verknüpfung expandiert (dasselbe
 * Modell wie `grossLines` im Agent-Submit). Beim Öffnen einer bestehenden
 * Buchung werden explizite Netto+Steuer-Paare wieder in die Brutto-Sicht
 * eingeklappt.
 *
 * Rundung: nur EIN Betrag ist autoritativ (brutto). netto = round(brutto /
 * (1+satz)), steuer = brutto − netto → Netto + Steuer = Brutto per
 * Konstruktion, keine Kettenrundung, keine Cent-Drift.
 *
 * Hinweis zur Kopplung: die Buchungs-Helfer halten sich sonst frei von
 * accounting-cases-Imports. Hier werden bewusst NUR pure Konstanten und
 * Lookups aus `domain/tax-keys` verwendet (Steuerkonten je SKR) —
 * dieselbe Wahrheit, die auch Agent-Submit und EXTF-Export nutzen; eine Kopie
 * würde bei der nächsten Kontenänderung driften.
 */
import {
  STANDARD_TAX_ACCOUNT_NUMBERS,
  taxAccountFor,
  vatRateForTaxKey,
} from "@/ludwig/modules/accounting-cases/domain/tax-keys";
/** The only thing this file needed from the deleted `booking/types.ts` (0043). */
type BookingSide = "debit" | "credit";

/** BU-Schlüssel, die der Editor als Brutto-Zeile mit abgeleiteter VSt führt. */
const EDITOR_ASSIST_KEYS: ReadonlySet<string> = new Set(["8", "9"]);

export interface DerivedTax {
  account: { accountNumber: string; accountName: string };
  ratePercent: number;
  /** Cent-genau: netto + tax = brutto. */
  net: number;
  tax: number;
}

/** Brutto → Netto/Steuer, Rundungsdifferenz sitzt auf der Steuerzeile. */
export function splitGross(grossAmount: number, ratePercent: number): { net: number; tax: number } {
  const grossCents = Math.round(grossAmount * 100);
  const netCents = Math.round(grossCents / (1 + ratePercent / 100));
  return { net: netCents / 100, tax: (grossCents - netCents) / 100 };
}

/**
 * Abgeleitete Vorsteuer-Zeile einer Editor-Zeile — `null`, wenn die Zeile
 * keine Assistenz bekommt (kein 8/9-Schlüssel, Framework unbekannt, Betrag
 * leer, oder die Zeile ist selbst ein Steuerkonto).
 */
export function deriveTax(
  line: { accountNumber: string; taxKey: string | null; amount: number },
  accountFramework: string | null | undefined,
): DerivedTax | null {
  if (!line.taxKey || !EDITOR_ASSIST_KEYS.has(line.taxKey)) return null;
  if (STANDARD_TAX_ACCOUNT_NUMBERS.has(line.accountNumber)) return null;
  if (!(line.amount > 0)) return null;
  const account = taxAccountFor(accountFramework ?? null, line.taxKey);
  const rate = vatRateForTaxKey(line.taxKey);
  if (!account || rate == null || rate <= 0) return null;
  const { net, tax } = splitGross(line.amount, rate);
  if (tax <= 0) return null;
  return { account, ratePercent: rate, net, tax };
}

export interface CollapsibleLine {
  side: BookingSide;
  accountNumber: string;
  amount: number;
  taxKey: string | null;
  taxRatePercent?: number | null;
}

/**
 * Explizite Netto+Steuer-Paare wieder in die Brutto-Sicht einklappen (fürs
 * Öffnen bestehender Buchungen). Ein Paar = Steuerkonto-Zeile + Basiszeile
 * gleicher Seite mit passendem Schlüssel und Satz × Netto ±1 Cent. Nicht
 * zuordenbare Steuerzeilen bleiben als normale Zeilen stehen (Fallback =
 * bisheriges Verhalten, nichts geht verloren).
 */
export function collapseTaxPairs<L extends CollapsibleLine>(
  lines: L[],
  accountFramework: string | null | undefined,
): L[] {
  if (!accountFramework) return lines;
  const out: (L | null)[] = [...lines];
  for (let ti = 0; ti < lines.length; ti += 1) {
    const taxLine = lines[ti]!;
    if (!STANDARD_TAX_ACCOUNT_NUMBERS.has(taxLine.accountNumber)) continue;
    const taxCents = Math.round(taxLine.amount * 100);
    for (let bi = 0; bi < lines.length; bi += 1) {
      if (bi === ti || out[bi] == null || out[ti] == null) continue;
      const base = out[bi]!;
      if (STANDARD_TAX_ACCOUNT_NUMBERS.has(base.accountNumber)) continue;
      if (base.side !== taxLine.side) continue;
      if (!base.taxKey || !EDITOR_ASSIST_KEYS.has(base.taxKey)) continue;
      const rate = vatRateForTaxKey(base.taxKey);
      const expectedAccount = taxAccountFor(accountFramework, base.taxKey);
      if (rate == null || rate <= 0) continue;
      if (!expectedAccount || expectedAccount.accountNumber !== taxLine.accountNumber) continue;
      const expectedTax = Math.round((Math.round(base.amount * 100) * rate) / 100);
      if (Math.abs(taxCents - expectedTax) > 1) continue;
      // Paar gefunden: Basiszeile wird brutto, Steuerzeile verschwindet.
      out[bi] = { ...base, amount: (Math.round(base.amount * 100) + taxCents) / 100 };
      out[ti] = null;
      break;
    }
  }
  return out.filter((l): l is L => l != null);
}

export interface ExpandableLine {
  side: BookingSide;
  accountNumber: string;
  accountName: string;
  /** Brutto, wenn die Zeile eine abgeleitete Steuerzeile bekommt. */
  amount: number;
  taxKey: string | null;
  taxRatePercent: number | null;
  lineText: string;
  externalDocumentNumber: string;
  externalDocumentNumber2: string;
  kost1: string;
  kost2: string;
}

export type ExpandedLine = ExpandableLine & { taxForLineNo: number | null };

/**
 * Editor-Zeilen (Brutto-Semantik) → explizite Zeilen fürs Speichern: je
 * assistierter Zeile Netto-Basiszeile + verknüpfte Steuerzeile
 * (`taxForLineNo` = 1-basierte Position der Basiszeile im Ergebnis).
 */
export function expandWithTaxLines(
  lines: ExpandableLine[],
  accountFramework: string | null | undefined,
): ExpandedLine[] {
  const out: ExpandedLine[] = [];
  for (const l of lines) {
    const derived = deriveTax(l, accountFramework);
    if (!derived) {
      out.push({ ...l, taxForLineNo: null });
      continue;
    }
    const baseLineNo = out.length + 1;
    out.push({ ...l, amount: derived.net, taxRatePercent: derived.ratePercent, taxForLineNo: null });
    out.push({
      side: l.side,
      accountNumber: derived.account.accountNumber,
      accountName: derived.account.accountName,
      amount: derived.tax,
      taxKey: l.taxKey,
      taxRatePercent: derived.ratePercent,
      lineText: `${derived.ratePercent}% ${derived.account.accountName}`,
      externalDocumentNumber: l.externalDocumentNumber,
      externalDocumentNumber2: l.externalDocumentNumber2,
      kost1: l.kost1,
      kost2: l.kost2,
      taxForLineNo: baseLineNo,
    });
  }
  return out;
}
