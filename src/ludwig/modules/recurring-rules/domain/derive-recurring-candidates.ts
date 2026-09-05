/**
 * F91: Dauersachverhalt-Kandidaten („DSV mit WK") deterministisch aus der
 * DATEV-Buchungshistorie ableiten — reine Funktion, keine IO. Ersetzt
 * konzeptionell den gelöschten ASCII-Parser (`datev-recurring-parser.ts`).
 *
 * Input sind die rohen DATEVconnect-Rows (`account-postings` mit expand=all,
 * ein Row = ein Leg; `accounting-sequences` für den Festschreibestatus) des
 * jüngsten Wirtschaftsjahres, wie sie in `ops_datev_ingest_staging` liegen.
 *
 * Erkennung ist HERKUNFTS-AGNOSTISCH (Owner §2.2): wird eine Belegnummer
 * regelmäßig sollgestellt, ist sie Kandidat — egal ob per WK-Stapel oder von
 * Hand gebucht. `mark_of_origin='WK'` ist nur Konfidenz-Signal (Badge).
 * Die Belegnummer ist die Identität des DSV (§2.3).
 */

import {
  fromDatevWire,
  kindFromWireWidth,
  type AccountKind,
} from "@/ludwig/core/datev/account-number";
import { DATEV_TAX_KEYS } from "@/ludwig/core/datev/tax-keys";

import type { RuleDirection, RuleExpectedInterval } from "./rule";

export type DatevPostingRow = Record<string, unknown>;

export interface RecurringDerivationConfig {
  /** Sachkontenlänge des Mandanten/WJ (SSOT `resolveAccountNumberLength`). */
  accountNumberLength: number;
  /** Logische Nummern der bekannten Finanzkonten (Bank/Kasse/…) des Mandanten. */
  financeAccountNumbers: ReadonlySet<string>;
  /** Logische Nummern der VSt-/USt-Konten (framework-spezifisch). */
  taxAccountNumbers: ReadonlySet<string>;
}

export const RECURRING_CANDIDATE_CLASSES = [
  "uebernehmen",
  "beendet_erkannt",
  "nicht_uebernehmbar",
] as const;
export type RecurringCandidateClass = (typeof RECURRING_CANDIDATE_CLASSES)[number];

export interface RecurringCandidateTemplateLine {
  /** Logische Sachkonto-Nummer (Aufwand/Erlös). */
  accountNumber: string;
  /** BRUTTO der Sollstellung auf dieses Konto (Netto + zugehörige Steuer). */
  grossAmount: number;
  taxRatePercent: number | null;
  /** Standard-BU-Schlüssel aus Steuersatz + Richtung (2/3/8/9), sonst null. */
  taxKey: string | null;
  description: string | null;
}

export interface RecurringCandidate {
  /** Belegnummer (Belegfeld 1, getrimmt) — Identität des DSV. */
  documentNumber: string;
  klass: RecurringCandidateClass;
  /** Maschinen-Grund bei beendet_erkannt / nicht_uebernehmbar. */
  reason: string | null;
  /** Lücke = 2 Intervalle oder mehrere Personenkonten — Mensch soll hinschauen. */
  reviewFlag: boolean;
  /** ≥ 1 Zeile der Gruppe trägt mark_of_origin='WK' (Konfidenz-Signal). */
  wkBadge: boolean;
  /** Logische Personenkonto-Nummer der Sollstellungen (dominant bei Mischung). */
  personalAccountNumber: string | null;
  direction: RuleDirection | null;
  interval: RuleExpectedInterval | null;
  sollMonths: string[]; // YYYY-MM, aufsteigend
  lastSollMonth: string | null;
  /** Lücke in Intervallen zum jüngsten festgeschriebenen Buchungsmonat. */
  gapIntervals: number | null;
  /** Jüngster festgeschriebener Monat mit Netto ≠ 0 → Quelle des Templates. */
  templateMonth: string | null;
  templateLines: RecurringCandidateTemplateLine[];
  /** Brutto-Summe des Templates (= matchAmount, Toleranz 0). */
  grossTotal: number | null;
  /** Typischer Sollstellungstag im Monat (Modalwert). */
  expectedDayOfMonth: number | null;
  /** Datum der ersten Sollstellung (ISO) — validFrom der Regel. */
  validFrom: string | null;
  /** Beleg-Referenz aus dem document_link der jüngsten Sollstellungszeile. */
  documentLink: { system: "bedi" | "ddms"; guid: string } | null;
  /** Buchungstext (Titel-Vorschlag). */
  description: string | null;
  notes: string[];
}

export interface RecurringDerivationResult {
  candidates: RecurringCandidate[];
  /** Jüngster Buchungsmonat über alle festgeschriebenen Postings (Lücken-Anker). */
  latestCommittedMonth: string | null;
  /** Auffälligkeiten (kein Silent-Skip). */
  notes: string[];
}

/* ---------------------------------------------------------------- helpers */

function str(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function amountOf(row: DatevPostingRow): number {
  const debit = row.amount_debit;
  const credit = row.amount_credit;
  const v = debit != null ? Number(debit) : credit != null ? Number(credit) : 0;
  return Number.isFinite(v) ? v : 0;
}

function taxRateOf(row: DatevPostingRow): number | null {
  const v = row.tax_rate;
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** ISO-Timestamp → YYYY-MM-DD, null wenn unlesbar. */
function isoDate(value: unknown): string | null {
  const s = str(value);
  if (!s || s.length < 10) return null;
  return s.slice(0, 10);
}

function monthIndex(month: string): number {
  return Number(month.slice(0, 4)) * 12 + Number(month.slice(5, 7));
}

/** `document_link` = `<KIND> "<GUID>"` mit KIND ∈ {BEDI, DDMS}. */
function parseDocumentLink(value: unknown): { system: "bedi" | "ddms"; guid: string } | null {
  const s = str(value);
  if (!s) return null;
  const m = /^(BEDI|DDMS)\s+"(.+)"$/i.exec(s);
  if (!m) return null;
  return { system: m[1]!.toLowerCase() as "bedi" | "ddms", guid: m[2]! };
}

/** Unbrauchbare Belegnummer (§4.3): leer, `0`, `diverse`. */
export function isUnusableDocumentNumber(doc: string): boolean {
  const d = doc.trim().toLowerCase();
  return d === "" || d === "0" || d === "diverse";
}

/**
 * Standard-BU-Schlüssel aus Steuersatz + Richtung: Ausgangsseite (Debitor,
 * payment_in) → USt 2/3, Eingangsseite (Kreditor, payment_out) → VSt 8/9.
 * Nur die Standard-Schlüssel — §13b/igE lässt sich aus tax_rate allein nicht
 * ableiten und bleibt null (Mensch/Agent ergänzt).
 */
export function standardTaxKeyForRate(
  rate: number | null,
  direction: RuleDirection,
): string | null {
  if (rate == null || rate === 0) return null;
  const want = direction === "payment_in" ? "output" : "input";
  const hit = DATEV_TAX_KEYS.find(
    (k) => ["2", "3", "8", "9"].includes(k.key) && k.direction === want && k.vatRate === rate,
  );
  return hit?.key ?? null;
}

interface Leg {
  row: DatevPostingRow;
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  account: string; // logisch
  contra: string | null; // logisch
  accountKind: AccountKind;
  contraKind: AccountKind | null;
  amount: number; // vorzeichenbehaftet wie geliefert
  taxRate: number | null;
  markOfOrigin: string | null;
  reversal: boolean;
  description: string | null;
  documentLink: { system: "bedi" | "ddms"; guid: string } | null;
}

type LegKind = "payment" | "tax" | "soll" | "other";

function classifyLeg(leg: Leg, config: RecurringDerivationConfig): LegKind {
  if (
    config.financeAccountNumbers.has(leg.account) ||
    (leg.contra != null && config.financeAccountNumbers.has(leg.contra))
  ) {
    return "payment";
  }
  if (
    config.taxAccountNumbers.has(leg.account) ||
    (leg.contra != null && config.taxAccountNumbers.has(leg.contra))
  ) {
    return "tax";
  }
  const personalCount =
    Number(leg.accountKind === "personal") + Number(leg.contraKind === "personal");
  return personalCount === 1 ? "soll" : "other";
}

/** Personenkonto → Richtung: DATEV vergibt Debitoren 1…–6…, Kreditoren 7…–9…. */
export function directionForPersonalAccount(logicalNumber: string): RuleDirection {
  return logicalNumber.charAt(0) >= "7" ? "payment_out" : "payment_in";
}

/* ------------------------------------------------------------- derivation */

const INTERVALS: [number, RuleExpectedInterval][] = [
  [1, "monthly"],
  [3, "quarterly"],
  [12, "yearly"],
];

/** Lücken-Schwellen (§2.8): ≥ 3 Intervalle = beendet, = 2 = Review-Flag. */
export const RECURRING_GAP_ENDED_INTERVALS = 3;
export const RECURRING_GAP_REVIEW_INTERVALS = 2;
/** Mindestlauf für die Anlage: ≥ 3 Sollstellungen im Intervall in Folge (§4.5). */
export const RECURRING_MIN_RUN = 3;

export function deriveRecurringCandidates(
  postings: DatevPostingRow[],
  sequences: DatevPostingRow[],
  config: RecurringDerivationConfig,
): RecurringDerivationResult {
  const notes: string[] = [];
  const committed = new Set(
    sequences
      .filter((s) => s.is_committed === true)
      .map((s) => str(s.accounting_sequence_id))
      .filter((id): id is string => id != null),
  );
  if (committed.size === 0) {
    return {
      candidates: [],
      latestCommittedMonth: null,
      notes: ["Kein festgeschriebener Stapel im sequences-Dataset — keine Datenbasis (§2.9)."],
    };
  }

  // §4.1: nur festgeschriebene, keine EB-Buchungen. Ein Leg pro Row.
  const legsByDoc = new Map<string, Leg[]>();
  let latestCommittedMonth: string | null = null;
  let skippedUnparseable = 0;
  for (const row of postings) {
    if (row.is_opening_balance_posting === true) continue;
    const seq = str(row.accounting_sequence_id);
    if (!seq || !committed.has(seq)) continue;
    const date = isoDate(row.date);
    if (!date) {
      skippedUnparseable += 1;
      continue;
    }
    const month = date.slice(0, 7);
    if (latestCommittedMonth == null || month > latestCommittedMonth) latestCommittedMonth = month;

    const rawAccount = str(row.account_number);
    if (!rawAccount) {
      skippedUnparseable += 1;
      continue;
    }
    let leg: Leg;
    try {
      const accountKind = kindFromWireWidth(rawAccount, config.accountNumberLength);
      const rawContra = str(row.contra_account_number);
      const contraKind = rawContra ? kindFromWireWidth(rawContra, config.accountNumberLength) : null;
      leg = {
        row,
        date,
        month,
        account: fromDatevWire(rawAccount, config.accountNumberLength, accountKind),
        contra: rawContra ? fromDatevWire(rawContra, config.accountNumberLength, contraKind!) : null,
        accountKind,
        contraKind,
        amount: amountOf(row),
        taxRate: taxRateOf(row),
        markOfOrigin: str(row.mark_of_origin),
        reversal: row.general_reversal === true,
        description: str(row.posting_description),
        documentLink: parseDocumentLink(row.document_link),
      };
    } catch (err) {
      skippedUnparseable += 1;
      if (skippedUnparseable <= 3) {
        notes.push(`Posting-Zeile übersprungen (Kontonummer nicht konvertierbar): ${(err as Error).message}`);
      }
      continue;
    }
    const doc = str(row.document_field1) ?? "";
    const bucket = legsByDoc.get(doc);
    if (bucket) bucket.push(leg);
    else legsByDoc.set(doc, [leg]);
  }
  if (skippedUnparseable > 3) {
    notes.push(`… insgesamt ${skippedUnparseable} Posting-Zeilen übersprungen (unlesbar).`);
  }

  const candidates: RecurringCandidate[] = [];
  for (const [doc, legs] of legsByDoc) {
    if (isUnusableDocumentNumber(doc)) {
      candidates.push({
        documentNumber: doc === "" ? "(leer)" : doc,
        klass: "nicht_uebernehmbar",
        reason: "belegnummer_unbrauchbar",
        reviewFlag: false,
        wkBadge: legs.some((l) => l.markOfOrigin === "WK"),
        personalAccountNumber: null,
        direction: null,
        interval: null,
        sollMonths: [],
        lastSollMonth: null,
        gapIntervals: null,
        templateMonth: null,
        templateLines: [],
        grossTotal: null,
        expectedDayOfMonth: null,
        validFrom: null,
        documentLink: null,
        description: legs[0]?.description ?? null,
        notes: [`${legs.length} Buchungszeilen ohne brauchbare Belegnummer.`],
      });
      continue;
    }
    const candidate = deriveGroup(doc, legs, latestCommittedMonth!, config);
    if (candidate) candidates.push(candidate);
  }

  candidates.sort((a, b) => a.documentNumber.localeCompare(b.documentNumber, "de"));
  return { candidates, latestCommittedMonth, notes };
}

/**
 * Storno-Netting je Monat auf Konto-Ebene (§2.7): eine Generalumkehr-Zeile
 * annulliert genau EINE Original-Zeile mit gleichem (Konto, Gegenkonto,
 * |Betrag|, Steuersatz) — beide raus. Niemals über Konten hinweg saldieren.
 */
function netMonth(legs: Leg[], groupNotes: string[]): Leg[] {
  const kept = legs.filter((l) => !l.reversal);
  for (const rev of legs.filter((l) => l.reversal)) {
    const key = (l: Leg) =>
      `${l.account}|${l.contra ?? ""}|${Math.abs(l.amount).toFixed(2)}|${l.taxRate ?? ""}`;
    const idx = kept.findIndex((l) => key(l) === key(rev));
    if (idx >= 0) {
      kept.splice(idx, 1);
    } else {
      groupNotes.push(
        `Generalumkehr ohne passende Original-Zeile im Monat ${rev.month} ` +
          `(${rev.account} ⇄ ${rev.contra ?? "—"}, ${Math.abs(rev.amount).toFixed(2)}).`,
      );
    }
  }
  return kept;
}

function deriveGroup(
  doc: string,
  legs: Leg[],
  latestCommittedMonth: string,
  config: RecurringDerivationConfig,
): RecurringCandidate | null {
  const groupNotes: string[] = [];

  // Netting je Monat, dann Sollstellungszeilen einsammeln.
  const byMonth = new Map<string, Leg[]>();
  for (const leg of legs) {
    const bucket = byMonth.get(leg.month);
    if (bucket) bucket.push(leg);
    else byMonth.set(leg.month, [leg]);
  }
  const sollByMonth = new Map<string, Leg[]>();
  let wkBadge = false;
  for (const [month, monthLegs] of byMonth) {
    const netted = netMonth(monthLegs, groupNotes);
    if (netted.some((l) => l.markOfOrigin === "WK")) wkBadge = true;
    const soll = netted.filter((l) => classifyLeg(l, config) === "soll");
    if (soll.length > 0) sollByMonth.set(month, soll);
  }

  const sollMonths = [...sollByMonth.keys()].sort();
  if (sollMonths.length < 2) return null; // normale Einzelbuchhaltung — kein Eintrag (§4.5)

  // Intervall = häufigster Monatsabstand ∈ {1, 3, 12}.
  const diffs: number[] = [];
  for (let i = 1; i < sollMonths.length; i += 1) {
    diffs.push(monthIndex(sollMonths[i]!) - monthIndex(sollMonths[i - 1]!));
  }
  let interval: [number, RuleExpectedInterval] | null = null;
  let intervalCount = 0;
  for (const [step, label] of INTERVALS) {
    const count = diffs.filter((d) => d === step).length;
    if (count > intervalCount) {
      interval = [step, label];
      intervalCount = count;
    }
  }
  if (!interval) return null; // kein stabiles Intervall — keine Anlage (§4.5)

  // Längster Lauf aufeinanderfolgender Sollstellungen im Intervall.
  let run = 1;
  let bestRun = 1;
  for (const d of diffs) {
    run = d === interval[0] ? run + 1 : 1;
    bestRun = Math.max(bestRun, run);
  }

  const lastSollMonth = sollMonths[sollMonths.length - 1]!;
  const gapIntervals =
    (monthIndex(latestCommittedMonth) - monthIndex(lastSollMonth)) / interval[0];

  // §2.8: tote Gruppen anzeigen, nicht anlegen. Für die Beendet-Erkennung
  // reichen 2 Sollstellungen im Intervall (z.B. Jan+Feb, dann Stille) — der
  // strengere ≥3er-Lauf gilt nur für die Anlage.
  let klass: RecurringCandidateClass;
  let reason: string | null = null;
  let reviewFlag = false;
  if (gapIntervals >= RECURRING_GAP_ENDED_INTERVALS && bestRun >= 2) {
    klass = "beendet_erkannt";
    reason =
      `Letzte Sollstellung ${lastSollMonth}, Lücke ${gapIntervals.toFixed(0)} Intervalle ` +
      `zum jüngsten festgeschriebenen Buchungsmonat ${latestCommittedMonth}.`;
  } else if (bestRun >= RECURRING_MIN_RUN) {
    klass = "uebernehmen";
    reviewFlag =
      gapIntervals >= RECURRING_GAP_REVIEW_INTERVALS && gapIntervals < RECURRING_GAP_ENDED_INTERVALS;
    if (reviewFlag) {
      groupNotes.push(`Lücke von ${gapIntervals.toFixed(1)} Intervallen seit ${lastSollMonth} — bitte prüfen.`);
    }
  } else {
    return null; // zu kurzer Lauf — keine Anlage, kein Eintrag
  }

  // Template aus dem jüngsten Monat mit Netto ≠ 0 (§2.6). Brutto je Sachkonto
  // kommt aus den Personenkonto-Legs (die tragen den Bruttobetrag direkt),
  // der Steuersatz aus dem Sachkonto-Leg desselben Monats.
  const allSoll = sollMonths.flatMap((m) => sollByMonth.get(m)!);
  let templateMonth: string | null = null;
  let templateLines: RecurringCandidateTemplateLine[] = [];
  let personalAccountNumber: string | null = null;
  for (let i = sollMonths.length - 1; i >= 0; i -= 1) {
    const month = sollMonths[i]!;
    const soll = sollByMonth.get(month)!;
    const personalLegs = soll.filter((l) => l.accountKind === "personal");
    if (personalLegs.length === 0) continue;

    // Dominantes Personenkonto (Mischgruppen kommen vor: mehrere DSV unter
    // einer Belegnummer) — nur seine Zeilen werden Template, Rest → Flag+Note.
    const grossByPersonal = new Map<string, number>();
    for (const l of personalLegs) {
      grossByPersonal.set(l.account, (grossByPersonal.get(l.account) ?? 0) + Math.abs(l.amount));
    }
    const personals = [...grossByPersonal.entries()].sort((a, b) => b[1] - a[1]);
    const dominant = personals[0]![0];
    if (personals.length > 1) {
      reviewFlag = true;
      groupNotes.push(
        `Belegnummer trägt Sollstellungen auf mehrere Personenkonten (${personals
          .map(([p]) => p)
          .join(", ")}) — nur ${dominant} übernommen, Rest manuell anlegen.`,
      );
    }

    const grossBySachkonto = new Map<string, { gross: number; description: string | null }>();
    for (const l of personalLegs) {
      if (l.account !== dominant || !l.contra) continue;
      const entry = grossBySachkonto.get(l.contra) ?? { gross: 0, description: l.description };
      entry.gross += Math.abs(l.amount);
      grossBySachkonto.set(l.contra, entry);
    }
    const total = [...grossBySachkonto.values()].reduce((s, e) => s + e.gross, 0);
    if (Math.abs(total) < 0.005) continue; // Netto 0 (voll storniert) → älterer Monat

    const direction = directionForPersonalAccount(dominant);
    const rateBySachkonto = new Map<string, number | null>();
    for (const l of soll) {
      if (l.accountKind === "general" && l.contra === dominant) {
        rateBySachkonto.set(l.account, l.taxRate);
      }
    }
    templateMonth = month;
    personalAccountNumber = dominant;
    templateLines = [...grossBySachkonto.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([accountNumber, entry]) => {
        const rate = rateBySachkonto.get(accountNumber) ?? null;
        return {
          accountNumber,
          grossAmount: Number(entry.gross.toFixed(2)),
          taxRatePercent: rate,
          taxKey: standardTaxKeyForRate(rate, direction),
          description: entry.description,
        };
      });
    break;
  }

  if (!templateMonth || templateLines.length === 0 || !personalAccountNumber) {
    return {
      documentNumber: doc,
      klass: "nicht_uebernehmbar",
      reason: "kein_template_ableitbar",
      reviewFlag: false,
      wkBadge,
      personalAccountNumber: null,
      direction: null,
      interval: interval[1],
      sollMonths,
      lastSollMonth,
      gapIntervals,
      templateMonth: null,
      templateLines: [],
      grossTotal: null,
      expectedDayOfMonth: null,
      validFrom: null,
      documentLink: null,
      description: allSoll[0]?.description ?? null,
      notes: [...groupNotes, "Kein Monat mit Netto ≠ 0 und Personenkonto-Brutto-Zeilen gefunden."],
    };
  }

  const direction = directionForPersonalAccount(personalAccountNumber);

  // Ab hier zählen nur die Zeilen des dominanten Personenkontos — bei
  // Mischgruppen würden Tag/Beginn/Link sonst vom fremden Sachverhalt kommen.
  const dominantSoll = allSoll.filter(
    (l) => l.account === personalAccountNumber || l.contra === personalAccountNumber,
  );

  // Typischer Sollstellungstag (Modalwert über alle Sollstellungs-Legs).
  const dayCounts = new Map<number, number>();
  for (const l of dominantSoll) {
    const day = Number(l.date.slice(8, 10));
    if (Number.isInteger(day) && day >= 1 && day <= 31) {
      dayCounts.set(day, (dayCounts.get(day) ?? 0) + 1);
    }
  }
  const expectedDayOfMonth =
    [...dayCounts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? null;

  // Beleg-Referenz: jüngste Sollstellungszeile MIT document_link gewinnt (§2.5
  // „zwei GUIDs ⇒ jüngste"). Zahlungszeilen zählen nicht (deren Link zeigt auf
  // den Kontoauszug), und nur Zeilen des dominanten Personenkontos — bei
  // Mischgruppen gehört der Link sonst zum falschen Sachverhalt.
  const documentLink =
    dominantSoll
      .filter((l) => l.documentLink != null)
      .sort((a, b) => b.date.localeCompare(a.date))[0]?.documentLink ?? null;

  const validFrom = dominantSoll.map((l) => l.date).sort()[0] ?? null;
  const grossTotal = Number(templateLines.reduce((s, l) => s + l.grossAmount, 0).toFixed(2));

  return {
    documentNumber: doc,
    klass,
    reason,
    reviewFlag,
    wkBadge,
    personalAccountNumber,
    direction,
    interval: interval[1],
    sollMonths,
    lastSollMonth,
    gapIntervals,
    templateMonth,
    templateLines,
    grossTotal,
    expectedDayOfMonth,
    validFrom,
    documentLink,
    description: templateLines[0]?.description ?? allSoll[0]?.description ?? null,
    notes: groupNotes,
  };
}
