/**
 * F264 — USt-Einschätzung am Beleg: welche umsatzsteuerliche Behandlung trägt
 * ein Eingangsbeleg (Inland mit/ohne USt, § 13b, innergemeinschaftlicher
 * Erwerb)? Früh, einmal, nachvollziehbar — persistiert in
 * `client_source_docs.vat_*` von `refreshSourceDocVatAssessment`.
 *
 * Reine Funktion, keine DB. Entschieden wird nur über harte Signale (Sitzland,
 * „keine Steuer ausgewiesen"); Ware oder Leistung unterscheiden zwei
 * übereinstimmende Positions-Signale des Interpreters (Sonderfall +
 * `fund_usage_nature`) — sie reichen nie ohne die harten für `decided`.
 * Fachliche Regel: docs/topics/buchung.md R11.
 */
import {
  deriveReverseChargeCase,
  fact,
  type ReverseChargeOrigin,
  type VatFact,
  type VatFactValue,
} from "./vat-rules";

export const VAT_TREATMENTS = ["domestic_taxed", "domestic_no_vat", "reverse_charge", "intra_eu_acquisition"] as const;
export type VatTreatment = (typeof VAT_TREATMENTS)[number];
export const VAT_ASSESSMENT_STATUSES = ["not_assessed", "decided", "needs_agent"] as const;
export type VatAssessmentStatus = (typeof VAT_ASSESSMENT_STATUSES)[number];

export interface VatTreatmentInput {
  /** client_source_docs_invoices.doc_direction */
  docDirection: string | null;
  origin: ReverseChargeOrigin;
  /** Fakt `vat_shown` aus deriveVatFacts. */
  vatShown: VatFactValue;
  /** Fakt `reverse_charge_notice` aus deriveVatFacts. */
  reverseChargeNotice: VatFactValue;
  /** vat_special_case der aktiven Positionen. */
  lineVatSpecialCases: (string | null)[];
  /** fund_usage_nature der aktiven Positionen — zweites Signal für Ware/Leistung. */
  lineFundUsageNatures: (string | null)[];
}

export interface VatTreatmentResult {
  treatment: VatTreatment | null;
  status: VatAssessmentStatus;
  /** Ein deutscher Satz — nennt die greifende Zeile der Entscheidungstabelle. */
  rationale: string;
  /** counterparty_domestic, counterparty_in_eu, supply_is_goods (source "derived"). */
  facts: VatFact[];
}

const SERVICE_CASES = new Set(["reverse_charge_eu_service", "reverse_charge_non_eu"]);
const GOODS_NATURES = new Set(["goods", "investment"]);

export function deriveVatTreatment(input: VatTreatmentInput): VatTreatmentResult {
  const rc = deriveReverseChargeCase(input.origin);
  const openValue: VatFactValue = rc.gap === "conflict" ? "uncertain" : "unknown";

  const domestic: VatFactValue = rc.gap === "domestic" ? "yes" : rc.code != null ? "no" : openValue;
  const inEu: VatFactValue =
    rc.code === 7 ? "yes" : rc.code === 1 ? "no" : rc.gap === "domestic" ? "not_applicable" : openValue;

  // Zwei unabhängige Positions-Signale müssen übereinstimmen: der
  // Interpreter-Prompt stempelt jede EU-Rechnung ohne USt als
  // intra_eu_acquisition, auch eine Leistung — der Sonderfall allein
  // trägt „Ware" nicht, erst zusammen mit der Kategorisierung.
  const cases = input.lineVatSpecialCases;
  const natures = input.lineFundUsageNatures;
  let goods: VatFactValue;
  let goodsRationale: string;
  if (domestic === "yes") {
    goods = "not_applicable";
    goodsRationale = "Aussteller im Inland — Ware oder Leistung ändert die Behandlung nicht";
  } else if (
    cases.length > 0 &&
    cases.every((c) => c === "intra_eu_acquisition") &&
    natures.length > 0 &&
    natures.every((n) => n != null && GOODS_NATURES.has(n))
  ) {
    goods = "yes";
    goodsRationale = "Alle Positionen als innergemeinschaftlicher Erwerb und als Ware/Anlagegut erkannt (Interpreter)";
  } else if (
    cases.length > 0 &&
    cases.every((c) => c != null && SERVICE_CASES.has(c)) &&
    !natures.some((n) => n != null && GOODS_NATURES.has(n))
  ) {
    goods = "no";
    goodsRationale = "Alle Positionen als § 13b-Leistung erkannt, keine als Ware kategorisiert (Interpreter)";
  } else {
    goods = "unknown";
    goodsRationale =
      cases.length === 0
        ? "Keine aktive Position — Ware oder Leistung nicht erkennbar"
        : `Positions-Signale uneinheitlich (Sonderfall: ${[...new Set(cases.map((c) => c ?? "—"))].join(", ")}; ` +
          `Kategorie: ${[...new Set(natures.map((n) => n ?? "—"))].join(", ")}) — Ware oder Leistung nicht eindeutig`;
  }

  const facts: VatFact[] = [
    fact("counterparty_domestic", "Aussteller sitzt im Inland", domestic, rc.rationale),
    fact("counterparty_in_eu", "Aussteller sitzt im EU-Ausland", inEu, rc.rationale),
    fact("supply_is_goods", "Lieferung von Ware (nicht Leistung)", goods, goodsRationale),
  ];
  const out = (treatment: VatTreatment | null, status: VatAssessmentStatus, rationale: string) => ({
    treatment,
    status,
    rationale,
    facts,
  });
  const { vatShown, reverseChargeNotice } = input;

  // 1
  if (input.docDirection !== "inbound") {
    return out(null, "not_assessed", "Nur Eingangsbelege werden eingeschätzt");
  }
  // 2
  if (domestic === "unknown" || domestic === "uncertain") {
    return out(
      null,
      "needs_agent",
      domestic === "uncertain"
        ? `Sitzland des Ausstellers widersprüchlich (${rc.rationale})`
        : "Sitzland des Ausstellers nicht ableitbar — keine USt-IdNr., kein Land am Beleg oder Partner",
    );
  }
  if (domestic === "yes") {
    // 3
    if (vatShown === "yes" && reverseChargeNotice === "no") {
      return out("domestic_taxed", "decided", "Aussteller im Inland, USt ausgewiesen, kein § 13b-Hinweis");
    }
    // 4
    if (vatShown === "no" && reverseChargeNotice === "no") {
      return out("domestic_no_vat", "decided", "Aussteller im Inland, keine USt ausgewiesen, kein § 13b-Hinweis");
    }
    // 5
    return out(
      null,
      "needs_agent",
      reverseChargeNotice === "yes"
        ? "Aussteller im Inland, aber § 13b-Hinweis am Beleg — Inlands-§ 13b (z. B. Bauleistung) prüft der Agent"
        : "Aussteller im Inland, Steuerausweis nicht ermittelbar",
    );
  }
  const abroad = inEu === "yes" ? "EU-Ausland" : "Drittland";
  // 6
  if (vatShown === "yes" || vatShown === "unknown") {
    return out(
      null,
      "needs_agent",
      vatShown === "yes"
        ? `Aussteller im ${abroad}, aber USt ausgewiesen — ausländische Steuer oder Fehler, der Agent prüft`
        : `Aussteller im ${abroad}, Steuerausweis nicht ermittelbar`,
    );
  }
  // 7
  if (inEu === "yes" && vatShown === "no" && goods === "yes") {
    return out(
      "intra_eu_acquisition",
      "decided",
      "Aussteller im EU-Ausland, keine USt ausgewiesen, Lieferung von Ware — innergemeinschaftlicher Erwerb",
    );
  }
  // 8
  if (vatShown === "no" && goods === "no") {
    return out(
      "reverse_charge",
      "decided",
      `Aussteller im ${abroad}, keine USt ausgewiesen, sonstige Leistung — § 13b Reverse Charge`,
    );
  }
  // 9
  return out(
    null,
    "needs_agent",
    goods === "yes"
      ? `Aussteller im ${abroad}, Lieferung von Ware — Einfuhr prüft der Agent`
      : `Aussteller im ${abroad}, Ware oder Leistung nicht eindeutig — der Agent prüft`,
  );
}
