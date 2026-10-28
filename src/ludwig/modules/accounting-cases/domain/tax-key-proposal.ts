/**
 * F502 — BU-Schlüssel-Vorschlag je Steueranteil eines Eingangsbelegs: jeder Kandidat des Katalogs (plus „kein
 * Schlüssel") landet in genau einem Korb `likely` / `possible` / `excluded`. `excluded` nur aus feststehenden Fakten,
 * `likely` nur aus dem Beleg, die Kanzlei-Historie ist Hinweis (Owner 2026-10-13, `buchung-offen.md` P67).
 *
 * Rein, keine DB. Verdrahtet in F505a: Default im Submit-Kern, Guard `taxKeyProposalGate`, Sicht in `case_context`.
 */
import { DATEV_TAX_KEYS, REVERSE_CHARGE_CASE_LABEL } from "@/ludwig/core/datev/tax-keys";
import { REVERSE_CHARGE_ASSIST_TAX_KEYS } from "./tax-keys";
import type { VatFact, VatRuleResult } from "./vat-rules";
import type { VatAssessmentStatus, VatTreatment } from "./vat-treatment";

export const TAX_KEY_BUCKETS = ["likely", "possible", "excluded"] as const;
export type TaxKeyBucket = (typeof TAX_KEY_BUCKETS)[number];
export const TAX_KEY_SIGNAL_KINDS = [
  "document_direction", "vat_treatment", "vat_fact", "vat_rule",
  "rate_share", "automatic_account", "reverse_charge_case", "mirror_history",
] as const;
export type TaxKeySignalKind = (typeof TAX_KEY_SIGNAL_KINDS)[number];
export const TAX_KEY_PROPOSAL_STATUSES = ["proposed", "not_applicable"] as const;
export type TaxKeyProposalStatus = (typeof TAX_KEY_PROPOSAL_STATUSES)[number];
/** Kandidaten in Katalogreihenfolge; `null` = kein Schlüssel. */
export const TAX_KEY_PROPOSAL_CANDIDATES: readonly (string | null)[] = [...DATEV_TAX_KEYS.map((k) => k.key), null];
/** Schlüssel nur der Ausgangsseite. */
export const OUTBOUND_ONLY_TAX_KEYS: ReadonlySet<string> = new Set(["1", "2", "3", "11"]);
export const REVERSE_CHARGE_KEYS: ReadonlySet<string> = new Set(["91", "92", "94", "95"]);
export const INTRA_EU_ACQUISITION_KEYS: ReadonlySet<string> = new Set(["18", "19"]);

export interface TaxKeySignal { kind: TaxKeySignalKind; code: string }
export interface TaxKeyCandidate {
  /** bisherige Form (wie entry_propose sie nimmt) */
  taxKey: string | null;
  bucket: TaxKeyBucket;
  /** ein deutscher Satz */
  reason: string;
  signals: TaxKeySignal[];
  /** nur bei 91/92/94/95 mit abgeleitetem Code, sonst null */
  reverseChargeCase: number | null;
  /** Kanzlei-Sätze mit diesem Schlüssel in `history` */
  historyCount: number;
}
export interface TaxShareProposal {
  rate: number | null;
  net: number | null;
  vat: number | null;
  likely: TaxKeyCandidate | null;
  possible: TaxKeyCandidate[];
  excluded: TaxKeyCandidate[];
}
export interface TaxKeyProposal {
  status: TaxKeyProposalStatus;
  reason: string;
  shares: TaxShareProposal[];
  historyTotal: number;
  /** F512a: die Historie besteht nur aus übernommenen Ludwig-Exporten (Texte sagen dann nicht „Kanzlei“). */
  ludwigExportsOnly: boolean;
}
export interface TaxKeyHistoryCount { taxKey: string | null; count: number; newestDate: string }
export interface TaxKeyProposalInput {
  docDirection: string | null;
  treatment: VatTreatment | null;
  assessmentStatus: VatAssessmentStatus;
  facts: readonly VatFact[];
  rules: readonly VatRuleResult[];
  reverseChargeCase: number | null;
  rateShares: readonly { rate: number; net: number; vat: number }[];
  header: { netTotal: number | null; taxTotal: number | null };
  targetAccount: { accountNumber: string; accountName: string | null; automaticRate: number | null } | null;
  history: {
    partnerLabel: string | null;
    counts: readonly TaxKeyHistoryCount[];
    total: number;
    /** F512a: die Historie besteht nur aus übernommenen Ludwig-Exporten; fehlt = Kanzlei. */
    ludwigExportsOnly?: boolean;
  };
}

const RATE = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 2 });
const POSSIBLE_REASON = "Nicht ausgeschlossen; die Belegsignale reichen für einen Vorschlag nicht";
const REVERSE_CHARGE_NO_DEDUCTION_REASON = "§ 13b ohne Vorsteuerabzug — nur bei Ausschluss oder Aufteilung der Vorsteuer";

type Exclusion = { reason: string; signals: TaxKeySignal[] };
type Pick = { taxKey: string | null; reason: string; signals: TaxKeySignal[] };
type Share = { rate: number | null; net: number | null; vat: number | null };

export function proposeTaxKeys(input: TaxKeyProposalInput): TaxKeyProposal {
  if (input.docDirection !== "inbound") {
    return {
      status: "not_applicable",
      reason: "Nur Eingangsbelege bekommen einen Vorschlag",
      shares: [],
      historyTotal: input.history.total,
      ludwigExportsOnly: input.history.ludwigExportsOnly ?? false,
    };
  }
  if (input.assessmentStatus === "decided" && input.treatment === null) {
    throw new Error("proposeTaxKeys: Einschätzung decided ohne Behandlung (Beleg inkonsistent)");
  }

  const exclusions = excludedByFacts(input);
  const history = historyView(input);
  const shares = taxShares(input).map((share) => proposeShare(input, share, exclusions, history));
  return {
    status: "proposed",
    reason: "Vorschlag je Steueranteil aus Beleg, USt-Regeln und Kanzlei-Historie",
    shares,
    historyTotal: input.history.total,
    ludwigExportsOnly: input.history.ludwigExportsOnly ?? false,
  };
}

/** Schritt 3: Anteile aus der Positions-Aufteilung, sonst einer aus dem Kopf. */
function taxShares(input: TaxKeyProposalInput): Share[] {
  if (input.rateShares.length > 0) return input.rateShares.map((s) => ({ rate: s.rate, net: s.net, vat: s.vat }));
  const { netTotal, taxTotal } = input.header;
  if (taxTotal === null) return [{ rate: null, net: netTotal, vat: null }];
  if (taxTotal === 0) return [{ rate: 0, net: netTotal, vat: 0 }];
  let rate: number | null = null;
  if (taxTotal > 0 && netTotal !== null && netTotal > 0) {
    const ratio = (100 * taxTotal) / netTotal;
    rate = [19, 7].find((r) => Math.abs(ratio - r) <= 0.5) ?? null;
  }
  return [{ rate, net: netTotal, vat: taxTotal }];
}

/** Schritt 4 (E1–E6): Ausschlüsse aus feststehenden Fakten — gleich für jeden Anteil. */
function excludedByFacts(input: TaxKeyProposalInput): Map<string | null, Exclusion> {
  const out = new Map<string | null, Exclusion>();
  const add = (keys: Iterable<string>, reason: string, signals: TaxKeySignal[]) => {
    for (const key of keys) {
      const hit = out.get(key);
      if (hit) hit.signals.push(...signals);
      else out.set(key, { reason, signals: [...signals] });
    }
  };
  const value = (code: string) => input.facts.find((f) => f.code === code)?.value;
  const catalog = DATEV_TAX_KEYS.map((k) => k.key);

  add(OUTBOUND_ONLY_TAX_KEYS, "Ausgangsschlüssel — der Beleg ist eine Eingangsrechnung", [
    { kind: "document_direction", code: "inbound" },
  ]);
  const account = input.targetAccount;
  if (account && account.automaticRate !== null) {
    add(
      catalog,
      `Konto ${accountLabel(account)} ist ein Automatikkonto (${RATE.format(account.automaticRate)} %) und versteuert selbst — kein Schlüssel`,
      [{ kind: "automatic_account", code: account.accountNumber }],
    );
  }
  for (const rule of input.rules) {
    if (rule.applies && rule.result === "fail") {
      add(rule.blockedTaxKeys, `${rule.code}: ${rule.reason}`, [{ kind: "vat_rule", code: rule.code }]);
    }
  }
  if (value("vat_shown") === "yes") {
    add(
      [...REVERSE_CHARGE_KEYS, ...INTRA_EU_ACQUISITION_KEYS],
      "USt ist ausgewiesen — kein § 13b und kein innergemeinschaftlicher Erwerb",
      [{ kind: "vat_fact", code: "vat_shown" }],
    );
  }
  if (value("counterparty_domestic") === "yes") {
    add(INTRA_EU_ACQUISITION_KEYS, "Aussteller sitzt im Inland — kein innergemeinschaftlicher Erwerb", [
      { kind: "vat_fact", code: "counterparty_domestic" },
    ]);
  }
  // Kleinbetragsrechnung (≤ 250 €, § 35 UStDV): dort fehlt der Steuerbetrag zulässig.
  if (value("vat_shown") === "no" && value("small_amount_invoice") === "no") {
    add(["8", "9"], "Keine USt ausgewiesen (Rechnung über 250 €) — kein Vorsteuerabzug nach Satz", [
      { kind: "vat_fact", code: "vat_shown" },
      { kind: "vat_fact", code: "small_amount_invoice" },
    ]);
  }
  return out;
}

/** Schritt 5 (L1–L6): höchstens ein `likely`, nur aus dem Beleg; `null` = keins. */
function likelyFromDocument(
  input: TaxKeyProposalInput,
  share: Share,
  excluded: Map<string | null, Exclusion>,
): { likely: Pick | null; possibleNote: Pick | null } {
  const account = input.targetAccount;
  if (account && account.automaticRate !== null) {
    const auto = account.automaticRate;
    const signals: TaxKeySignal[] = [{ kind: "automatic_account", code: account.accountNumber }];
    if (
      share.rate === null ||
      share.rate === auto ||
      input.treatment === "reverse_charge" ||
      input.treatment === "intra_eu_acquisition"
    ) {
      return {
        likely: { taxKey: null, reason: `Automatikkonto ${accountLabel(account)} versteuert mit ${RATE.format(auto)} %`, signals },
        possibleNote: null,
      };
    }
    return {
      likely: null,
      possibleNote: {
        taxKey: null,
        reason: `Satz des Kontos ${RATE.format(auto)} % ≠ Satz des Belegs ${RATE.format(share.rate)} % — Kontowahl prüfen`,
        signals: [...signals, { kind: "rate_share", code: String(share.rate) }],
      },
    };
  }
  if (input.assessmentStatus !== "decided" || input.treatment === null) return { likely: null, possibleNote: null };

  const treatment: TaxKeySignal = { kind: "vat_treatment", code: input.treatment };
  const unlessExcluded = (pick: Pick): Pick | null => (excluded.has(pick.taxKey) ? null : pick);
  switch (input.treatment) {
    case "domestic_taxed": {
      const rateSignal: TaxKeySignal = { kind: "rate_share", code: String(share.rate) };
      if (share.rate === 19 || share.rate === 7) {
        return {
          likely: unlessExcluded({
            taxKey: share.rate === 19 ? "9" : "8",
            reason: `Inlandsbeleg mit ${share.rate} % USt`,
            signals: [treatment, rateSignal],
          }),
          possibleNote: null,
        };
      }
      if (share.rate === 0) {
        return { likely: { taxKey: null, reason: "Position ohne USt", signals: [treatment, rateSignal] }, possibleNote: null };
      }
      return { likely: null, possibleNote: null };
    }
    case "domestic_no_vat":
      return { likely: { taxKey: null, reason: "Inlandsbeleg ohne USt-Ausweis", signals: [treatment] }, possibleNote: null };
    case "reverse_charge": {
      const code = input.reverseChargeCase;
      const signals: TaxKeySignal[] =
        code === null ? [treatment] : [treatment, { kind: "reverse_charge_case", code: String(code) }];
      const blocked = excluded.get("94");
      if (!blocked) {
        const label = code === null ? "Sachverhalt L+L offen" : (REVERSE_CHARGE_CASE_LABEL[code] ?? `Sachverhalt L+L ${code}`);
        return { likely: { taxKey: "94", reason: `§ 13b, ${label}, Regelsatz 19 % angenommen`, signals }, possibleNote: null };
      }
      const rule = blocked.signals.find((s) => s.kind === "vat_rule");
      if (!rule || excluded.has("95")) return { likely: null, possibleNote: null };
      return {
        likely: {
          taxKey: "95",
          reason: `§ 13b ohne Vorsteuerabzug, weil ${rule.code} den Abzug sperrt`,
          signals: [...signals, rule],
        },
        possibleNote: null,
      };
    }
    case "intra_eu_acquisition":
      return {
        likely: unlessExcluded({
          taxKey: "19",
          reason: "innergemeinschaftlicher Erwerb, Regelsatz 19 % angenommen",
          signals: [treatment],
        }),
        possibleNote: null,
      };
  }
}

type HistoryView = {
  countOf: (key: string | null) => number;
  dominant: { taxKey: string | null; count: number } | null;
};

/** Schritt 7: dominanter Schlüssel = meiste Sätze, dann jüngster, dann gesetzt vor `null`. */
function historyView(input: TaxKeyProposalInput): HistoryView {
  const counts = input.history.counts;
  const sorted = [...counts].sort(
    (a, b) =>
      b.count - a.count ||
      b.newestDate.localeCompare(a.newestDate) ||
      Number(a.taxKey === null) - Number(b.taxKey === null),
  );
  const top = sorted[0];
  return {
    countOf: (key) => counts.filter((c) => c.taxKey === key).reduce((n, c) => n + c.count, 0),
    dominant: top && top.count > 0 ? { taxKey: top.taxKey, count: top.count } : null,
  };
}

function proposeShare(
  input: TaxKeyProposalInput,
  share: Share,
  excluded: Map<string | null, Exclusion>,
  history: HistoryView,
): TaxShareProposal {
  const { likely: pick, possibleNote } = likelyFromDocument(input, share, excluded);
  const candidate = (taxKey: string | null, bucket: TaxKeyBucket, reason: string, signals: TaxKeySignal[]): TaxKeyCandidate => ({
    taxKey,
    bucket,
    reason,
    signals,
    reverseChargeCase: taxKey !== null && REVERSE_CHARGE_KEYS.has(taxKey) ? input.reverseChargeCase : null,
    historyCount: history.countOf(taxKey),
  });

  let likely: TaxKeyCandidate | null = null;
  const possible: TaxKeyCandidate[] = [];
  const excludedOut: TaxKeyCandidate[] = [];
  for (const key of TAX_KEY_PROPOSAL_CANDIDATES) {
    const ex = excluded.get(key);
    if (ex) excludedOut.push(candidate(key, "excluded", ex.reason, [...ex.signals]));
    else if (pick && pick.taxKey === key) likely = candidate(key, "likely", pick.reason, [...pick.signals]);
    else if (possibleNote && possibleNote.taxKey === key) possible.push(candidate(key, "possible", possibleNote.reason, [...possibleNote.signals]));
    else if (key === "95" || key === "92") possible.push(candidate(key, "possible", REVERSE_CHARGE_NO_DEDUCTION_REASON, []));
    else possible.push(candidate(key, "possible", POSSIBLE_REASON, []));
  }

  const dominant = history.dominant;
  if (dominant) {
    const n = input.history.total;
    const signal: TaxKeySignal = { kind: "mirror_history", code: dominant.taxKey ?? "none" };
    const inExcluded = excludedOut.find((c) => c.taxKey === dominant.taxKey);
    const at = possible.findIndex((c) => c.taxKey === dominant.taxKey);
    if (likely && likely.taxKey === dominant.taxKey) {
      likely.reason += input.history.ludwigExportsOnly
        ? ` — Ludwig-Export-Historie (von der Kanzlei übernommen) stimmt überein (${dominant.count} von ${n})`
        : ` — Kanzlei-Historie stimmt überein (${dominant.count} von ${n})`;
      likely.signals.push(signal);
    } else if (at >= 0) {
      const [hit] = possible.splice(at, 1);
      const partner = input.history.partnerLabel ?? "diesem Partner";
      const account = input.targetAccount ? accountLabel(input.targetAccount) : "dem Aufwandskonto";
      hit!.reason = input.history.ludwigExportsOnly
        ? `Ludwig-Export (von der Kanzlei übernommen): bei ${partner} auf ${account} ${dominant.count} von ${n} Mal mit diesem Schlüssel`
        : `Kanzlei buchte bei ${partner} auf ${account} ${dominant.count} von ${n} Mal mit diesem Schlüssel`;
      hit!.signals.push(signal);
      possible.unshift(hit!);
    } else if (inExcluded) {
      inExcluded.signals.push(signal);
    }
  }
  return { rate: share.rate, net: share.net, vat: share.vat, likely, possible, excluded: excludedOut };
}

function accountLabel(account: { accountNumber: string; accountName: string | null }): string {
  return account.accountName ? `${account.accountNumber} ${account.accountName}` : account.accountNumber;
}

/* ---- F505a: Verdrahtung in der Buchung ---------------------------------- */

export interface TaxKeyDefault { accountNumber: string; taxKey: string; reason: string }
export interface TaxKeyLineCheck { accountNumber: string; taxKey: string | null; bucket: TaxKeyBucket; defaulted: boolean }

/** Korb eines Schlüssels: excluded, wenn er in irgendeinem Anteil ausgeschlossen ist; likely, wenn er dem
 *  likely irgendeines Anteils gleicht; sonst possible. */
export function classifyTaxKey(
  proposal: TaxKeyProposal,
  taxKey: string | null,
): { bucket: TaxKeyBucket; candidate: TaxKeyCandidate | null } {
  const shares = proposal.shares;
  const excluded = shares.flatMap((s) => s.excluded).find((c) => c.taxKey === taxKey);
  if (excluded) return { bucket: "excluded", candidate: excluded };
  const likely = shares.map((s) => s.likely).find((c) => c !== null && c.taxKey === taxKey);
  if (likely) return { bucket: "likely", candidate: likely };
  return { bucket: "possible", candidate: shares.flatMap((s) => s.possible).find((c) => c.taxKey === taxKey) ?? null };
}

/** true, wenn mindestens ein Anteil ein likely trägt. */
export function hasLikelyTaxKey(proposal: TaxKeyProposal): boolean {
  return proposal.shares.some((s) => s.likely !== null);
}

/** „19 % → 9, 7 % → 8“ — Anteile mit Satz und likely-Schlüssel („—“ ohne likely). */
export function describeTaxShares(proposal: TaxKeyProposal): string {
  return proposal.shares
    .map((s) => {
      const rate = s.rate === null ? "Satz offen" : `${RATE.format(s.rate)} %`;
      const key = s.likely === null ? "—" : (s.likely.taxKey ?? "kein Schlüssel");
      return `${rate} → ${key}`;
    })
    .join(", ");
}

/** Setzt fehlende Schlüssel (taxKey === undefined) auf likely. Gibt neue Zeilen zurück, mutiert nichts.
 *  Nur bei genau einem Anteil mit gesetztem likely; im Modus `explicit` nur 94/95/19 (8/9 bräuchten dort eine
 *  eigene Steuerzeile). */
export function applyLikelyTaxKeyDefaults<L extends { accountNumber: string; taxKey?: string | null }>(
  lines: readonly L[],
  proposals: ReadonlyMap<string, TaxKeyProposal>,
  mode: "gross" | "explicit",
): { lines: L[]; defaults: TaxKeyDefault[] } {
  const defaults: TaxKeyDefault[] = [];
  const out = lines.map((line) => {
    if (line.taxKey !== undefined) return line;
    const shares = proposals.get(line.accountNumber)?.shares;
    const likely = shares?.length === 1 ? shares[0]!.likely : null;
    if (!likely || likely.taxKey === null) return line;
    if (mode === "explicit" && !REVERSE_CHARGE_ASSIST_TAX_KEYS.has(likely.taxKey)) return line;
    defaults.push({ accountNumber: line.accountNumber, taxKey: likely.taxKey, reason: likely.reason });
    return { ...line, taxKey: likely.taxKey };
  });
  return { lines: out, defaults };
}
