import { isPassThroughTaxKey } from "@/ludwig/core/datev/tax-keys";

/**
 * Prüfbedarf je Buchungssatz (F232, buchung.md R17) — ersetzt die Abnahme-Triage.
 *
 * Die Triage kannte nur „wie wahrscheinlich falsch", nicht „wie teuer, wenn
 * falsch", und stufte bewusst nicht gejudgte Sätze (Regel) als „Prüfen" ein.
 * Der Score summiert beides: Tragweite (Steuerschlüssel, Satzart), das
 * Judge-Urteil samt Konfidenz — nur wo ein Judge erwartet wird —, den
 * schlechtesten Prüfpunkt und die Präzedenz (wie oft genau so schon gebucht).
 * Ab `threshold` steht der Fall im Reiter „Bitte anschauen" — ebenso, wenn ein
 * **harter Grund** (`hardReasonCodes`: Judge-Urteil, Konfidenz, Prüfpunkt) die
 * Schwelle allein erreicht: den rechnet keine Präzedenz weg (Owner-Zusage). Die
 * Tragweite bleibt bewusst wegrechenbar — ein §13b-Dauerfall mit Vorbuchungen
 * ist wahrscheinlich richtig.
 *
 * **Die ganze Einteilung steht in `REVIEW_SCORING`**; die Funktionen lesen nur
 * daraus. Rein: kein IO, kein Import aus `ui/`.
 */

export const REVIEW_TABS = ["needs_review", "likely_correct", "client_batch"] as const;
export type ReviewTab = (typeof REVIEW_TABS)[number];
export type ImpactClass = "high" | "medium" | "low";

export const REVIEW_SCORING = {
  threshold: 50, // score >= threshold → needs_review
  impact: { high: 60, medium: 25, low: 0 },
  judgeExpected: { ai_proposed: true, recurring_rule: false, client_import: false, manual: false, system_reversal: false },
  verdict: { missing: 100, flag: 100, adjust: 60, adjust_text_only: 15, confirm_with_note: 15, confirm: 0 },
  confidence: { red: 100, orange: 30, yellow: 25, green: 0 },
  check: { red: 100, yellow: 50 },
  noPrecedent: { full: 25, light: 20 },
  precedent: [ { min: 5, points: -40 }, { min: 3, points: -25 }, { min: 1, points: -10 } ],
  highImpactTaxKeys: ["91", "92", "94", "95", "18", "19"],
  highImpactChecks: ["P-GWG", "P-PRIVAT", "P-13B", "P-USTID"],
  hardReasonCodes: ["verdict", "confidence", "check"],
} as const;

export interface ReviewScoreInput {
  journalEntryId: string;
  origin: string;
  entryKind: "expense" | "revenue" | "payment" | "money_transfer" | "reclassification" | null;
  verdict: "confirm" | "confirm_with_note" | "adjust" | "flag" | null;
  judgeCriteria: string[];
  confidence: "green" | "yellow" | "orange" | "red" | null;
  taxKeys: string[]; // alle gesetzten Schlüssel der Zeilen, ohne null/"0"
  reverseCharge: boolean; // Beleg trägt reverse_charge = true
  checks: { code: string; state: "green" | "yellow" | "red" | "open" }[];
  priorSameBookings: number; // T232.2
}
export interface ReviewReason { code: string; points: number; label: string }
export interface ReviewScore {
  score: number;
  tab: ReviewTab;
  impact: ImpactClass;
  reasons: ReviewReason[];
  /** Ein harter Grund erreicht die Schwelle allein — zählt unabhängig von der Summe. */
  hard: boolean;
}

const VERDICT_LABEL: Record<keyof typeof REVIEW_SCORING.verdict, string> = {
  missing: "Judge fehlt",
  flag: "Judge: beanstandet",
  adjust: "Judge: angepasst",
  adjust_text_only: "Judge: nur Text angepasst",
  confirm_with_note: "Judge: mit Hinweis",
  confirm: "Judge: bestätigt",
};

const CONFIDENCE_LABEL: Record<keyof typeof REVIEW_SCORING.confidence, string> = {
  red: "Konfidenz rot",
  orange: "Konfidenz orange",
  yellow: "Konfidenz gelb",
  green: "Konfidenz grün",
};

function judgeExpected(origin: string): boolean {
  const known = REVIEW_SCORING.judgeExpected as Record<string, boolean>;
  return known[origin] ?? true;
}

function impactOf(input: ReviewScoreInput): { impact: ImpactClass; label: string } {
  const highKeys: readonly string[] = REVIEW_SCORING.highImpactTaxKeys;
  const highChecks: readonly string[] = REVIEW_SCORING.highImpactChecks;
  if (
    input.taxKeys.some((k) => highKeys.includes(k) || isPassThroughTaxKey(k)) ||
    input.reverseCharge
  ) {
    return { impact: "high", label: "§13b / Sonderschlüssel" };
  }
  const heikel = input.checks.find(
    (c) => highChecks.includes(c.code) && c.state !== "green" && c.state !== "open",
  );
  if (heikel) return { impact: "high", label: `Steuerlich heikel: ${heikel.code}` };
  if (input.entryKind === null) return { impact: "medium", label: "Satzart unbekannt" };
  if (
    (input.entryKind === "expense" || input.entryKind === "revenue") &&
    input.origin !== "recurring_rule"
  ) {
    return { impact: "medium", label: "Aufwand oder Ertrag" };
  }
  return { impact: "low", label: "geringe Tragweite" };
}

export function reviewScore(input: ReviewScoreInput): ReviewScore {
  if (input.origin === "client_import") {
    return { score: 0, tab: "client_batch", impact: "low", reasons: [], hard: false };
  }
  const reasons: ReviewReason[] = [];
  const add = (code: string, points: number, label: string) => {
    if (points !== 0) reasons.push({ code, points, label });
  };

  const { impact, label: impactLabel } = impactOf(input);
  add("impact", REVIEW_SCORING.impact[impact], impactLabel);

  if (judgeExpected(input.origin)) {
    const key: keyof typeof REVIEW_SCORING.verdict =
      input.verdict === null
        ? "missing"
        : input.verdict === "adjust" &&
            input.judgeCriteria.length === 1 &&
            input.judgeCriteria[0] === "B8"
          ? "adjust_text_only"
          : input.verdict;
    add("verdict", REVIEW_SCORING.verdict[key], VERDICT_LABEL[key]);
    if (input.confidence !== null) {
      add("confidence", REVIEW_SCORING.confidence[input.confidence], CONFIDENCE_LABEL[input.confidence]);
    }
  }

  // P-JUDGE hat den eigenen Summanden (Verdikt) — sonst zählte er doppelt.
  const checks = input.checks.filter((c) => c.code !== "P-JUDGE");
  const red = checks.find((c) => c.state === "red");
  const yellow = checks.find((c) => c.state === "yellow");
  if (red) add("check", REVIEW_SCORING.check.red, `Prüfpunkt ${red.code} rot`);
  else if (yellow) add("check", REVIEW_SCORING.check.yellow, `Prüfpunkt ${yellow.code} gelb`);

  if (input.priorSameBookings === 0) {
    if (input.origin !== "recurring_rule") {
      add(
        "precedent",
        impact === "low" ? REVIEW_SCORING.noPrecedent.light : REVIEW_SCORING.noPrecedent.full,
        "noch nie so gebucht",
      );
    }
  } else {
    const step = [...REVIEW_SCORING.precedent]
      .sort((a, b) => b.min - a.min)
      .find((s) => input.priorSameBookings >= s.min);
    if (step) add("precedent", step.points, `${input.priorSameBookings}× so gebucht`);
  }

  const score = reasons.reduce((sum, r) => sum + r.points, 0);
  reasons.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  const hardCodes: readonly string[] = REVIEW_SCORING.hardReasonCodes;
  const hard = reasons.some(
    (r) => hardCodes.includes(r.code) && r.points >= REVIEW_SCORING.threshold,
  );
  return {
    score,
    tab: hard || score >= REVIEW_SCORING.threshold ? "needs_review" : "likely_correct",
    impact,
    reasons,
    hard,
  };
}

/**
 * Score eines **Sachverhalts**: zuerst ein Satz in „Bitte anschauen", unter
 * gleichen Reitern der höchste Score — ein unauffälliger Satz macht einen
 * heiklen daneben nicht harmlos, und ein harter Satz mit 40 schlägt einen
 * weichen mit 45. Mandantenstapel-Sätze zählen nur, wenn der Fall nichts
 * anderes trägt.
 */
export function caseReviewScore(entries: ReviewScoreInput[]): ReviewScore {
  if (entries.length === 0) {
    return {
      score: 100,
      tab: "needs_review",
      impact: "medium",
      reasons: [{ code: "no_proposal", points: 100, label: "kein Vorschlag" }],
      hard: false,
    };
  }
  const own = entries.filter((e) => e.origin !== "client_import");
  if (own.length === 0) return reviewScore(entries[0]!);
  const rank = (s: ReviewScore) => (s.tab === "needs_review" ? 1 : 0);
  return own
    .map(reviewScore)
    .reduce((worst, s) =>
      rank(s) > rank(worst) || (rank(s) === rank(worst) && s.score > worst.score) ? s : worst,
    );
}
