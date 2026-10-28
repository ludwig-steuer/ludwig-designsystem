import { PRUEFPUNKT_KURZWORT, type PruefpunktCode } from "@/ludwig/core/accounting/pruefpunkte";
import { REVERSE_CHARGE_CASE_LABEL, isPassThroughTaxKey, taxKeyEntry } from "@/ludwig/core/datev/tax-keys";

import type { ReviewReasonCode } from "./review-reason";
import { CLARIFICATION_PARKING_TASK } from "@/ludwig/core/accounting/clarification-handling";

/**
 * Prüfbedarf je Buchungssatz (F232, buchung.md R17) — ersetzt die Abnahme-Triage.
 *
 * Die Triage kannte nur „wie wahrscheinlich falsch", nicht „wie teuer, wenn
 * falsch", und stufte bewusst nicht gejudgte Sätze (Regel) als „Prüfen" ein.
 * Der Score summiert beides: Tragweite (Steuerschlüssel, Satzart), das
 * Judge-Urteil samt Konfidenz — nur wo ein Judge erwartet wird —, den
 * schlechtesten Prüfpunkt und die Präzedenz (wie oft genau so schon gebucht).
 * Ab `threshold` steht der Fall im Reiter „Bitte anschauen" — ebenso, wenn ein
 * **harter Grund** (`hardReasonKinds`: Judge-Urteil, Konfidenz, Prüfpunkt) die
 * Schwelle allein erreicht: den rechnet keine Präzedenz weg (Owner-Zusage). Die
 * Tragweite bleibt bewusst wegrechenbar — ein §13b-Dauerfall mit Vorbuchungen
 * ist wahrscheinlich richtig.
 *
 * **Die ganze Einteilung steht in `REVIEW_SCORING`**; die Funktionen lesen nur
 * daraus. Rein: kein IO, kein Import aus `ui/`.
 *
 * Jeder Grund trägt neben `kind` (Summand) seit F357 den **Prüfgrund**
 * (`code`, Achse `review_reason`) und die Einzelheit dieses Falls (`detail`)
 * — für das Wort in der Zeile und seinen Hover (F355). Punkte und Reiter
 * ändert das nicht.
 */

export const REVIEW_TABS = ["needs_review", "likely_correct", "parked", "client_batch"] as const;
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
  // F348: ein Fall mit Generalumkehr steht immer in „Bitte anschauen" (Owner 2026-09-29).
  reversal: 100,
  precedent: [ { min: 5, points: -40 }, { min: 3, points: -25 }, { min: 1, points: -10 } ],
  highImpactTaxKeys: ["91", "92", "94", "95", "18", "19"],
  highImpactChecks: ["P-GWG", "P-PRIVAT", "P-13B", "P-USTID"],
  hardReasonKinds: ["verdict", "confidence", "check", "reversal"],
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
  /** `reason` = Befundtext des Prüfpunkts — die Einzelheit des Prüfgrunds (F357). */
  checks: { code: string; state: "green" | "yellow" | "red" | "open"; reason?: string }[];
  priorSameBookings: number; // T232.2
  /** Judge-Kommentar (`reasoning_short`) — Einzelheit von judge_* (F357). */
  judgeComment?: string | null;
  /** Satz-Konfidenz 0..1 — Einzelheit von confidence_* (F357). */
  confidenceValue?: number | null;
  /** Sachverhalt L+L der § 13b-Zeile (`datev_reverse_charge_case`) — Einzelheit von reverse_charge (F357). */
  reverseChargeCase?: number | null;
  /** F496: Herkunft (`client_journal_entry.origin_task`); `clarification_parking` = geparkter Satz. */
  originTask?: string | null;
}
export interface ReviewReason {
  /** Der Summand: impact · reversal · verdict · confidence · check · precedent · no_proposal. */
  kind: string;
  points: number;
  label: string;
  /** Prüfgrund (F357) — null für Grundlast und Präzedenz: die sind nie der stärkste Grund. */
  code: ReviewReasonCode | null;
  /** Der Prüfpunkt hinter check_red/check_yellow/tax_sensitive. */
  checkCode?: string;
  /** Die Einzelheit dieses Falls für den Hover, z. B. „Ludwig: 62 %". */
  detail: string | null;
}
export interface ReviewScore {
  score: number;
  tab: ReviewTab;
  impact: ImpactClass;
  reasons: ReviewReason[];
  /** Ein harter Grund erreicht die Schwelle allein — zählt unabhängig von der Summe. */
  hard: boolean;
}

/*
 * H2 (Abnahme DS 0218): die Labels der Teile sind die Wörter der Achse
 * `review_reason` bzw. das Kurzwort des Prüfpunkts — das (i) zeigt dieselben
 * Wörter wie die Zelle. Die Registry liegt in `ui/` und ist hier tabu; den
 * Gleichlauf hält `review-reason.test.ts` fest.
 */
const VERDICT_LABEL: Record<keyof typeof REVIEW_SCORING.verdict, string> = {
  missing: "Nicht gegengeprüft",
  flag: "Beanstandet",
  adjust: "Korrigiert",
  adjust_text_only: "Hinweis vom Judge",
  confirm_with_note: "Hinweis vom Judge",
  confirm: "Bestätigt",
};

const CONFIDENCE_LABEL: Record<keyof typeof REVIEW_SCORING.confidence, string> = {
  red: "Ludwig unsicher",
  orange: "Ludwig nicht ganz sicher",
  yellow: "Ludwig nicht ganz sicher",
  green: "Ludwig sicher",
};

/** Das Kurzwort eines Prüfpunkts — dasselbe Wort wie in der Zelle. */
const kurzwort = (code: string) => PRUEFPUNKT_KURZWORT[code as PruefpunktCode] ?? code;

function judgeExpected(origin: string): boolean {
  const known = REVIEW_SCORING.judgeExpected as Record<string, boolean>;
  return known[origin] ?? true;
}

interface Impact {
  impact: ImpactClass;
  label: string;
  code: ReviewReasonCode | null;
  checkCode?: string;
  detail: string | null;
}

function impactOf(input: ReviewScoreInput): Impact {
  const highKeys: readonly string[] = REVIEW_SCORING.highImpactTaxKeys;
  const highChecks: readonly string[] = REVIEW_SCORING.highImpactChecks;
  const besondere = [...new Set(input.taxKeys.filter((k) => highKeys.includes(k) || isPassThroughTaxKey(k)))];
  if (besondere.length > 0 || input.reverseCharge) {
    const umkehr = input.reverseCharge || besondere.some((k) => taxKeyEntry(k)?.group === "reverse_charge");
    const fall = input.reverseChargeCase ?? null;
    const teile = [
      ...besondere.map((k) => `BU ${k}`),
      ...(fall !== null ? [`Sachverhalt ${fall}: ${REVERSE_CHARGE_CASE_LABEL[fall] ?? "ohne Bezeichnung"}`] : []),
    ];
    return {
      impact: "high",
      label: umkehr ? "§13b" : "Sonderschlüssel",
      code: umkehr ? "reverse_charge" : "special_tax_key",
      detail: teile.join(" · ") || null,
    };
  }
  const heikel = input.checks.find(
    (c) => highChecks.includes(c.code) && c.state !== "green" && c.state !== "open",
  );
  if (heikel) {
    return {
      impact: "high",
      label: kurzwort(heikel.code),
      code: "tax_sensitive",
      checkCode: heikel.code,
      detail: heikel.reason ?? null,
    };
  }
  if (input.entryKind === null) return { impact: "medium", label: "Satzart unbekannt", code: null, detail: null };
  if (
    (input.entryKind === "expense" || input.entryKind === "revenue") &&
    input.origin !== "recurring_rule"
  ) {
    return { impact: "medium", label: "Aufwand oder Ertrag", code: null, detail: null };
  }
  return { impact: "low", label: "geringe Tragweite", code: null, detail: null };
}

const VERDICT_CODE: Record<keyof typeof REVIEW_SCORING.verdict, ReviewReasonCode | null> = {
  missing: "judge_missing",
  flag: "judge_flag",
  adjust: "judge_adjust",
  adjust_text_only: "judge_note",
  confirm_with_note: "judge_note",
  confirm: null,
};

const CONFIDENCE_CODE: Record<keyof typeof REVIEW_SCORING.confidence, ReviewReasonCode | null> = {
  red: "confidence_red",
  orange: "confidence_low",
  yellow: "confidence_low",
  green: null,
};

/** Judge-Kommentar für den Hover — gekürzt, ein Absatz reicht. */
function kommentar(text: string | null | undefined): string | null {
  const t = text?.trim();
  if (!t) return null;
  return t.length > 200 ? `${t.slice(0, 199)}…` : t;
}

export function reviewScore(input: ReviewScoreInput): ReviewScore {
  if (input.origin === "client_import") {
    return { score: 0, tab: "client_batch", impact: "low", reasons: [], hard: false };
  }
  // F496: geparkt auf dem Klärungskonto — eigener Reiter, die Code-Prüfung ersetzt den Judge.
  if (input.originTask === CLARIFICATION_PARKING_TASK) {
    return { score: 0, tab: "parked", impact: "low", reasons: [], hard: false };
  }
  const reasons: ReviewReason[] = [];
  const add = (
    kind: string,
    points: number,
    label: string,
    grund: { code: ReviewReasonCode | null; detail: string | null; checkCode?: string } = { code: null, detail: null },
  ) => {
    if (points !== 0) reasons.push({ kind, points, label, ...grund });
  };

  const { impact, label: impactLabel, ...impactGrund } = impactOf(input);
  add("impact", REVIEW_SCORING.impact[impact], impactLabel, impactGrund);
  if (input.origin === "system_reversal") {
    add("reversal", REVIEW_SCORING.reversal, "Generalumkehr", {
      code: "general_reversal",
      detail: "Generalumkehr einer DATEV-Buchung",
    });
  }

  if (judgeExpected(input.origin)) {
    const key: keyof typeof REVIEW_SCORING.verdict =
      input.verdict === null
        ? "missing"
        : input.verdict === "adjust" &&
            input.judgeCriteria.length === 1 &&
            input.judgeCriteria[0] === "B8"
          ? "adjust_text_only"
          : input.verdict;
    add("verdict", REVIEW_SCORING.verdict[key], VERDICT_LABEL[key], {
      code: VERDICT_CODE[key],
      detail: key === "missing" ? null : kommentar(input.judgeComment),
    });
    if (input.confidence !== null) {
      const wert = input.confidenceValue;
      add("confidence", REVIEW_SCORING.confidence[input.confidence], CONFIDENCE_LABEL[input.confidence], {
        code: CONFIDENCE_CODE[input.confidence],
        detail: wert == null ? null : `Ludwig: ${Math.round(wert * 100)} %`,
      });
    }
  }

  // P-JUDGE hat den eigenen Summanden (Verdikt) — sonst zählte er doppelt.
  const checks = input.checks.filter((c) => c.code !== "P-JUDGE");
  const red = checks.find((c) => c.state === "red");
  const yellow = checks.find((c) => c.state === "yellow");
  if (red) {
    add("check", REVIEW_SCORING.check.red, kurzwort(red.code), {
      code: "check_red",
      checkCode: red.code,
      detail: red.reason ?? null,
    });
  } else if (yellow) {
    add("check", REVIEW_SCORING.check.yellow, kurzwort(yellow.code), {
      code: "check_yellow",
      checkCode: yellow.code,
      detail: yellow.reason ?? null,
    });
  }

  if (input.priorSameBookings === 0) {
    if (input.origin !== "recurring_rule") {
      add(
        "precedent",
        impact === "low" ? REVIEW_SCORING.noPrecedent.light : REVIEW_SCORING.noPrecedent.full,
        "Erstmals so gebucht",
        // H5: Prüfgrund nur, wenn sonst keiner vorliegt (`rankReviewReasons`).
        { code: "first_time", detail: "Noch keine gleiche Buchung bei dieser Gegenpartei." },
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
  const hardKinds: readonly string[] = REVIEW_SCORING.hardReasonKinds;
  const hard = reasons.some(
    (r) => hardKinds.includes(r.kind) && r.points >= REVIEW_SCORING.threshold,
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
      reasons: [{ kind: "no_proposal", points: 100, label: "kein Vorschlag", code: null, detail: null }],
      hard: false,
    };
  }
  const own = entries.filter((e) => e.origin !== "client_import");
  if (own.length === 0) return reviewScore(entries[0]!);
  // F496: ein heikler Satz hält den Fall in „Bitte anschauen“, ein geparkter neben unauffälligen holt ihn in „Geparkt“.
  const rank = (s: ReviewScore) => (s.tab === "needs_review" ? 2 : s.tab === "parked" ? 1 : 0);
  return own
    .map(reviewScore)
    .reduce((worst, s) =>
      rank(s) > rank(worst) || (rank(s) === rank(worst) && s.score > worst.score) ? s : worst,
    );
}
