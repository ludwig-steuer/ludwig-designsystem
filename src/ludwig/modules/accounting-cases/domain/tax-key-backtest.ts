/**
 * F502 — Auswertung und Report des BU-Schlüssel-Rückwärtstests (`scripts/tax-key-backtest.ts`): Vorschlag je
 * Steueranteil gegen den Schlüssel auf dem gepaarten Spiegelsatz. Zwei Sets: `firm` (Kanzlei-Sätze ohne Ludwig-Export)
 * und `ludwig_export` (von Ludwig gebucht, von der Kanzlei übernommen — nicht unabhängig). Rein, keine DB.
 */
import { taxKeyEntry } from "@/ludwig/core/datev/tax-keys";
import type { TaxKeyProposal, TaxShareProposal } from "./tax-key-proposal";
import { VAT_TREATMENTS, type VatAssessmentStatus, type VatTreatment } from "./vat-treatment";

export const LIKELY_HIT_TARGET_PERCENT = 90;
export const EXCLUDED_HIT_LIMIT_PERCENT = 2;
export const BACKTEST_MISSES_SHOWN = 10;
export const BACKTEST_EXCLUDED_SHOWN = 25;
export const TAX_KEY_PAIRINGS = ["paired", "ambiguous", "unpaired"] as const;
export type TaxKeyPairing = (typeof TAX_KEY_PAIRINGS)[number];
/** Paarungsstufe (T502.4): DATEV-Belegverweis, sonst Belegnummer + Brutto. */
export const TAX_KEY_PAIRING_STAGES = ["document_link", "number_amount"] as const;
export type TaxKeyPairingStage = (typeof TAX_KEY_PAIRING_STAGES)[number];
/** Gegen welche Spiegelsätze gepaart wird: Kanzlei-Sätze bzw. übernommene Ludwig-Exporte. */
export const TAX_KEY_BACKTEST_SETS = ["firm", "ludwig_export"] as const;
export type TaxKeyBacktestSet = (typeof TAX_KEY_BACKTEST_SETS)[number];

export interface TaxKeyBacktestItem {
  set: TaxKeyBacktestSet;
  pairing: TaxKeyPairing;
  /** Stufe, über die gepaart (oder mehrdeutig) wurde; `null` bei `unpaired`. */
  pairingStage: TaxKeyPairingStage | null;
  invoice: { vendorName: string | null; invoiceNumber: string | null; invoiceDate: string | null; gross: number | null };
  /** "<case_number> <title>" des Ludwig-Sachverhalts, sonst null */
  caseLabel: string | null;
  mirrorAccount: { number: string; name: string | null } | null;
  /** distinct, normalisiert, auf den Aufwandszeilen des Satzes */
  mirrorKeys: (string | null)[];
  treatment: VatTreatment | null;
  assessmentStatus: VatAssessmentStatus;
  /** null bei ambiguous/unpaired */
  proposal: TaxKeyProposal | null;
}

export interface TaxKeyBacktestCounts {
  compared: number;
  withLikely: number;
  likelyHit: number;
  mirrorKeyInExcluded: number;
  withoutLikely: number;
  mirrorKeyInPossible: number;
  possibleFirstHit: number;
}

export interface TaxKeyBacktestFinding {
  item: TaxKeyBacktestItem;
  rate: number | null;
  mirrorKey: string | null;
  proposedKey: string | null;
  reason: string;
}

export interface TaxKeyBacktestSetResult {
  pairing: {
    documents: number;
    paired: number;
    pairedByStage: Record<TaxKeyPairingStage, number>;
    ambiguous: number;
    unpaired: number;
    /** Anteile ohne eindeutigen Kanzlei-Schlüssel */
    notComparable: number;
  };
  total: TaxKeyBacktestCounts;
  /** vier Behandlungen + `null` = ohne Einschätzung */
  byTreatment: { treatment: VatTreatment | null; counts: TaxKeyBacktestCounts }[];
  misses: TaxKeyBacktestFinding[];
  excludedHits: TaxKeyBacktestFinding[];
}

/** Je Set getrennt ausgewertet — ein Beleg kann in beiden vorkommen. */
export type TaxKeyBacktestResult = Record<TaxKeyBacktestSet, TaxKeyBacktestSetResult>;

const emptyCounts = (): TaxKeyBacktestCounts => ({
  compared: 0,
  withLikely: 0,
  likelyHit: 0,
  mirrorKeyInExcluded: 0,
  withoutLikely: 0,
  mirrorKeyInPossible: 0,
  possibleFirstHit: 0,
});

/** Kanzlei-Schlüssel eines Anteils; `undefined` = nicht vergleichbar. */
function mirrorKeyFor(share: TaxShareProposal, keys: readonly (string | null)[], shareCount: number): string | null | undefined {
  if (shareCount === 1) return keys.length === 1 ? keys[0] : undefined;
  const sameRate = keys.filter((k) =>
    share.rate === 0 ? k === null || taxKeyEntry(k)?.vatRate === 0 : k !== null && taxKeyEntry(k)?.vatRate === share.rate,
  );
  return sameRate.length === 1 ? sameRate[0] : undefined;
}

export function evaluateTaxKeyBacktest(items: readonly TaxKeyBacktestItem[]): TaxKeyBacktestResult {
  return {
    firm: evaluateSet(items.filter((i) => i.set === "firm")),
    ludwig_export: evaluateSet(items.filter((i) => i.set === "ludwig_export")),
  };
}

function evaluateSet(items: readonly TaxKeyBacktestItem[]): TaxKeyBacktestSetResult {
  const pairing: TaxKeyBacktestSetResult["pairing"] = {
    documents: items.length,
    paired: 0,
    pairedByStage: { document_link: 0, number_amount: 0 },
    ambiguous: 0,
    unpaired: 0,
    notComparable: 0,
  };
  const total = emptyCounts();
  const byTreatment = [...VAT_TREATMENTS, null].map((treatment) => ({ treatment, counts: emptyCounts() }));
  const misses: TaxKeyBacktestFinding[] = [];
  const excludedHits: TaxKeyBacktestFinding[] = [];

  for (const item of items) {
    if (item.pairing === "ambiguous") pairing.ambiguous += 1;
    if (item.pairing === "unpaired") pairing.unpaired += 1;
    if (item.pairing !== "paired") continue;
    pairing.paired += 1;
    if (item.pairingStage) pairing.pairedByStage[item.pairingStage] += 1;
    const shares = item.proposal?.shares ?? [];
    const group = byTreatment.find((t) => t.treatment === item.treatment)!.counts;
    for (const share of shares) {
      const mirrorKey = mirrorKeyFor(share, item.mirrorKeys, shares.length);
      if (mirrorKey === undefined) {
        pairing.notComparable += 1;
        continue;
      }
      const inExcluded = share.excluded.find((c) => c.taxKey === mirrorKey);
      for (const counts of [total, group]) {
        counts.compared += 1;
        if (share.likely) {
          counts.withLikely += 1;
          if (share.likely.taxKey === mirrorKey) counts.likelyHit += 1;
        } else {
          counts.withoutLikely += 1;
          if (share.possible.some((c) => c.taxKey === mirrorKey)) counts.mirrorKeyInPossible += 1;
          if (share.possible[0]?.taxKey === mirrorKey) counts.possibleFirstHit += 1;
        }
        if (inExcluded) counts.mirrorKeyInExcluded += 1;
      }
      if (share.likely && share.likely.taxKey !== mirrorKey) {
        misses.push({ item, rate: share.rate, mirrorKey, proposedKey: share.likely.taxKey, reason: share.likely.reason });
      }
      if (inExcluded) {
        excludedHits.push({ item, rate: share.rate, mirrorKey, proposedKey: share.likely?.taxKey ?? null, reason: inExcluded.reason });
      }
    }
  }
  return { pairing, total, byTreatment, misses, excludedHits };
}

const COUNT = new Intl.NumberFormat("de-DE");
const MONEY = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = (n: number, of: number) => (of ? `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 }).format((100 * n) / of)} %` : "—");
const key = (k: string | null) => k ?? "ohne";
const cell = (s: string | null | undefined) => (s ?? "—").replace(/\|/g, "\\|");
const TREATMENT_LABEL: Record<VatTreatment, string> = {
  domestic_taxed: "Inland mit USt",
  domestic_no_vat: "Inland ohne USt",
  reverse_charge: "§ 13b",
  intra_eu_acquisition: "innergemeinschaftlicher Erwerb",
};

function quotaLine(label: string, n: number, of: number, goal: string, ok: (p: number) => boolean, words: [string, string]): string {
  const verdict = of ? (ok((100 * n) / of) ? words[0] : words[1]) : "nicht bewertbar";
  return `${label}: ${COUNT.format(n)} von ${COUNT.format(of)} = ${pct(n, of)} — ${goal} ${verdict}`;
}

const SET_COPY: Record<TaxKeyBacktestSet, { title: string; who: string; note: string | null }> = {
  firm: { title: "Kanzlei-Sätze (ohne Ludwig-Export)", who: "Kanzlei", note: null },
  ludwig_export: {
    title: "Übernommene Ludwig-Exporte",
    who: "Export",
    note: "Nicht unabhängig: von Ludwig gebucht und von der Kanzlei übernommen. Misst die Übereinstimmung mit den übernommenen Buchungen, nicht die Richtigkeit.",
  },
};

function findingRows(findings: readonly TaxKeyBacktestFinding[], proposedHeader: string, who: string): string[] {
  if (findings.length === 0) return ["Keine."];
  return [
    `| Lieferant | Belegnummer | Datum | Brutto | Sachverhalt | ${who}-Konto | ${who}-Schlüssel | ${proposedHeader} | Grund |`,
    "|---|---|---|---:|---|---|---|---|---|",
    ...findings.map(({ item, mirrorKey, proposedKey, reason }) => {
      const account = item.mirrorAccount
        ? `${item.mirrorAccount.number}${item.mirrorAccount.name ? ` ${item.mirrorAccount.name}` : ""}`
        : null;
      return (
        `| ${cell(item.invoice.vendorName)} | ${cell(item.invoice.invoiceNumber)} | ${cell(item.invoice.invoiceDate)} | ` +
        `${item.invoice.gross == null ? "—" : `${MONEY.format(item.invoice.gross)} €`} | ${cell(item.caseLabel)} | ${cell(account)} | ` +
        `${key(mirrorKey)} | ${key(proposedKey)} | ${cell(reason)} |`
      );
    }),
  ];
}

export function renderTaxKeyBacktestReport(
  result: TaxKeyBacktestResult,
  meta: { client: string; from: string; generatedAt: string },
): string {
  return [
    `# Rückwärtstest BU-Schlüssel — Mandant ${meta.client}`,
    "",
    `Zeitraum ab ${meta.from} · erzeugt ${meta.generatedAt} · nur lesend erhoben (F502). Eingangsbelege, gepaart mit dem Satz im DATEV-Spiegel; verglichen wird je Steueranteil, getrennt nach Set.`,
    "",
    ...TAX_KEY_BACKTEST_SETS.flatMap((set) => renderSet(set, result[set])),
  ].join("\n");
}

function renderSet(set: TaxKeyBacktestSet, result: TaxKeyBacktestSetResult): string[] {
  const { title, who, note } = SET_COPY[set];
  const { pairing, total } = result;
  const countRow = (label: string, c: TaxKeyBacktestCounts) =>
    `| ${label} | ${c.compared} | ${c.withLikely} | ${c.likelyHit} | ${c.mirrorKeyInExcluded} | ${c.withoutLikely} | ${c.mirrorKeyInPossible} | ${c.possibleFirstHit} |`;
  return [
    `## Set \`${set}\` — ${title}`,
    "",
    ...(note ? [note, ""] : []),
    "### Paarung",
    "",
    `| Belege | gepaart | davon über Belegverweis | davon über Belegnummer + Brutto | mehrdeutig | ohne ${who}-Satz | nicht vergleichbar (Anteile) |`,
    "|---:|---:|---:|---:|---:|---:|---:|",
    `| ${pairing.documents} | ${pairing.paired} | ${pairing.pairedByStage.document_link} | ${pairing.pairedByStage.number_amount} | ${pairing.ambiguous} | ${pairing.unpaired} | ${pairing.notComparable} |`,
    "",
    "### Je Behandlung",
    "",
    `| Behandlung | Anteile verglichen | mit likely | likely trifft | ${who}-Schlüssel in excluded | ohne likely | davon ${who} in possible | davon possible[0] trifft |`,
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    ...result.byTreatment.map((t) => countRow(t.treatment ? TREATMENT_LABEL[t.treatment] : "ohne Einschätzung", t.counts)),
    countRow("**gesamt**", total),
    "",
    quotaLine("likely-Trefferquote", total.likelyHit, total.withLikely, `Ziel ≥ ${LIKELY_HIT_TARGET_PERCENT} %`, (p) => p >= LIKELY_HIT_TARGET_PERCENT, ["erreicht", "nicht erreicht"]),
    "",
    quotaLine(`${who}-Schlüssel in excluded`, total.mirrorKeyInExcluded, total.compared, `Grenze ≤ ${EXCLUDED_HIT_LIMIT_PERCENT} %`, (p) => p <= EXCLUDED_HIT_LIMIT_PERCENT, ["eingehalten", "überschritten"]),
    "",
    `### Fehlgriffe likely (erste ${BACKTEST_MISSES_SHOWN} von ${result.misses.length})`,
    "",
    ...findingRows(result.misses.slice(0, BACKTEST_MISSES_SHOWN), "Vorschlag", who),
    "",
    `### ${who}-Schlüssel in excluded (erste ${BACKTEST_EXCLUDED_SHOWN} von ${result.excludedHits.length})`,
    "",
    ...findingRows(result.excludedHits.slice(0, BACKTEST_EXCLUDED_SHOWN), "Vorschlag (likely)", who),
    "",
  ];
}
