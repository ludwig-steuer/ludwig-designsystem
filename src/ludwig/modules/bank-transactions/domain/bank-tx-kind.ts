import { extractSepaTags, type SepaTags } from "./sepa-tags";

/**
 * F489 — Zahlungsart je Bankumsatz aus dem Transaktionscode der Bank (GVC, ISO-BTC, Qonto-Kategorie, SWIFT), sonst aus
 * den SEPA-Tags, sonst unbekannt. Rein; die Profile (Import) und das Backfill-Skript liefern die Signale.
 * Spiegel des DB-CHECKs `client_bank_transactions_bank_tx_kind_check` (Migration 20261013010000).
 */
export const BANK_TX_KINDS = [
  "transfer_in",
  "transfer_out",
  "standing_order",
  "direct_debit",
  "direct_debit_return",
  "card",
  "cash",
  "charges_interest",
  "collective",
  "other",
] as const;
export type BankTxKind = (typeof BANK_TX_KINDS)[number];

export const BANK_TX_KIND_LABEL: Record<BankTxKind, string> = {
  transfer_in: "Überweisung (Eingang)",
  transfer_out: "Überweisung (Ausgang)",
  standing_order: "Dauerauftrag",
  direct_debit: "Lastschrift",
  direct_debit_return: "Lastschrift-Rückgabe",
  card: "Kartenzahlung",
  cash: "Bargeld",
  charges_interest: "Entgelte und Zinsen",
  collective: "Sammelbuchung",
  other: "Sonstige",
};

export interface BankTxSignals {
  /** Geschäftsvorgangscode, dreistellig („166"). */
  gvc: string | null;
  /** Text der Bank zum GVC („SEPA Credit Transfer (Einzelbuchung-Haben)") — nie der Verwendungszweck. */
  gvcLabel: string | null;
  /** ISO 20022 Bank Transaction Code (CAMT `BkTxCd/Domn`). */
  isoBtc: { domain: string; family: string; subFamily: string } | null;
  /** SWIFT-Code aus MT940 `:61:` („NTRF"). */
  swiftCode: string | null;
  /** Qonto-Kategorie aus MT940 `:86:` Zeile 1 („CARD"). */
  qontoCategory: string | null;
  sepaTags: SepaTags;
  /** Vorzeichen des Betrags: 1 = Eingang, -1 = Ausgang. */
  amountSign: 1 | -1;
  /** ISO-Purpose aus CAMT (`TxDtls/Purp/Cd`); sonst gilt `sepaTags.purp`. */
  isoPurpose?: string | null;
}

export interface BankTxClassification {
  /** Mit Präfix der Quelle: `GVC:105`, `BTC:PMNT/RDDT/ESDD`, `QONTO:CARD`, `SWIFT:NTRF`. */
  code: string | null;
  kind: BankTxKind | null;
  /** ISO-Purpose, vierstellig in Großbuchstaben („SALA"). */
  purposeCode: string | null;
}

/** Signale ohne Bankcode — Profile, deren Format keinen Code trägt (nur SEPA-Tags und Vorzeichen). */
export function sepaOnlySignals(sepaTags: SepaTags, amount: string | number): BankTxSignals {
  return { gvc: null, gvcLabel: null, isoBtc: null, swiftCode: null, qontoCategory: null, sepaTags, amountSign: signOf(amount) };
}

/** Formate ohne Bankcode: die drei Felder nur aus den SEPA-Tags des Zwecks und dem Vorzeichen. */
export function sepaBankTxFields(purpose: string | null, amount: string | number): ReturnType<typeof bankTxFields> {
  return bankTxFields(sepaOnlySignals(extractSepaTags(purpose ?? "").tags, amount));
}

export function signOf(amount: string | number): 1 | -1 {
  return Number(amount) < 0 ? -1 : 1;
}

const GVC_KIND: Record<string, BankTxKind> = {
  "082": "cash",
  "104": "direct_debit",
  "105": "direct_debit",
  "106": "card",
  "198": "card",
  "117": "standing_order",
  "118": "transfer_out",
  "177": "transfer_out",
  "166": "transfer_in",
  "168": "transfer_in",
  "188": "collective",
  "805": "charges_interest",
};

/** Schlagworte im Bank-Label eines unbekannten GVC — in dieser Reihenfolge, die erste passende gewinnt. */
const GVC_LABEL_RULES: ReadonlyArray<[RegExp, BankTxKind | "by_sign"]> = [
  [/rückgabe|return|reversal/i, "direct_debit_return"],
  [/direct debit|lastschrift/i, "direct_debit"],
  [/cards|karte/i, "card"],
  [/dauerauftrag|standing/i, "standing_order"],
  [/sammler/i, "collective"],
  [/credit transfer|überweisung/i, "by_sign"],
  [/abschluss|entgelt|gebühr|zins/i, "charges_interest"],
  [/einzahlung|auszahlung|bargeld/i, "cash"],
];

const bySign = (sign: 1 | -1): BankTxKind => (sign === 1 ? "transfer_in" : "transfer_out");

function kindFromGvc(gvc: string, label: string | null, sign: 1 | -1): BankTxKind {
  const known = GVC_KIND[gvc];
  if (known) return known;
  const rule = GVC_LABEL_RULES.find(([pattern]) => pattern.test(label ?? ""));
  if (!rule) return "other";
  return rule[1] === "by_sign" ? bySign(sign) : rule[1];
}

function kindFromIsoBtc(btc: { family: string; subFamily: string }): BankTxKind {
  if (btc.subFamily === "CHRG" || btc.subFamily === "INTR") return "charges_interest";
  switch (btc.family) {
    case "RCDT":
      return "transfer_in";
    case "ICDT":
      return btc.subFamily === "STDO" ? "standing_order" : "transfer_out";
    case "RDDT":
      return btc.subFamily === "UPDD" || btc.subFamily === "RRTN" ? "direct_debit_return" : "direct_debit";
    case "IDDT":
      return "direct_debit";
    case "CCRD":
    case "MCRD":
      return "card";
    case "CNTR":
      return "cash";
    default:
      return "other";
  }
}

function kindFromQonto(category: string, sign: 1 | -1): BankTxKind {
  switch (category) {
    case "TRANSFER":
      return bySign(sign);
    case "CARD":
      return "card";
    case "SUBSCRIPTION_FEES":
      return "charges_interest";
    case "DIRECT_DEBIT":
      return "direct_debit";
    default:
      return "other";
  }
}

function kindFromSwift(code: string, sign: 1 | -1): BankTxKind {
  if (code === "NDDT") return "direct_debit";
  if (code === "NTRF") return bySign(sign);
  if (code === "NCHG" || code === "NINT") return "charges_interest";
  return "other";
}

function normalizePurpose(value: string | null | undefined): string | null {
  const code = value?.trim().toUpperCase();
  return code && /^[A-Z]{4}$/.test(code) ? code : null;
}

/** Erste Quelle mit Treffer gewinnt: GVC → ISO-BTC → Qonto-Kategorie → SWIFT → SEPA-Tags; sonst unbekannt (nie geraten). */
export function classifyBankTx(input: BankTxSignals): BankTxClassification {
  const purposeCode = normalizePurpose(input.isoPurpose) ?? normalizePurpose(input.sepaTags.purp);
  if (input.gvc) {
    return { code: `GVC:${input.gvc}`, kind: kindFromGvc(input.gvc, input.gvcLabel, input.amountSign), purposeCode };
  }
  if (input.isoBtc) {
    const { domain, family, subFamily } = input.isoBtc;
    return { code: `BTC:${domain}/${family}/${subFamily}`, kind: kindFromIsoBtc(input.isoBtc), purposeCode };
  }
  if (input.qontoCategory) {
    return { code: `QONTO:${input.qontoCategory}`, kind: kindFromQonto(input.qontoCategory, input.amountSign), purposeCode };
  }
  if (input.swiftCode) {
    return { code: `SWIFT:${input.swiftCode}`, kind: kindFromSwift(input.swiftCode, input.amountSign), purposeCode };
  }
  if (input.sepaTags.mref || input.sepaTags.cred) return { code: null, kind: "direct_debit", purposeCode };
  return { code: null, kind: null, purposeCode };
}

/** Die drei Felder des Bankumsatzes (`BankTransactionRow`) aus den Signalen. */
export function bankTxFields(input: BankTxSignals): { bankTxCode: string | null; bankTxKind: BankTxKind | null; purposeCode: string | null } {
  const c = classifyBankTx(input);
  return { bankTxCode: c.code, bankTxKind: c.kind, purposeCode: c.purposeCode };
}

/** VR-Bank-Spalte „Geschäftsvorgangscode": `166 - SEPA Credit Transfer (Einzelbuchung-Haben)` → GVC + Bank-Label. */
export function parseGvcCell(cell: string | null | undefined): { gvc: string | null; gvcLabel: string | null } {
  const match = /^\s*(\d{3})(?:\s*-\s*(.*))?$/.exec(cell ?? "");
  if (!match) return { gvc: null, gvcLabel: null };
  return { gvc: match[1]!, gvcLabel: match[2]?.trim() || null };
}

/** CAMT `BkTxCd/Prtry/Cd` deutscher Banken (`NTRF+166+…`): der GVC an Stelle 2. */
export function gvcFromProprietaryCode(code: string | null | undefined): string | null {
  return /^[A-Z]{4}\+(\d{3})\+/.exec(code ?? "")?.[1] ?? null;
}

/** MT940 `:61:`: der SWIFT-Code (`N` + 3 Buchstaben) direkt nach dem Betrag. */
export function swiftCodeFromTag61(tag61: string | null | undefined): string | null {
  return /\d,\d*(N[A-Z]{3})/.exec(tag61 ?? "")?.[1] ?? null;
}
