/**
 * Ein-Satz-Klartext einer Dauerbuchungs-Regel für die Übersicht im
 * Regelwerk-Tab („was diese wiederkehrende Buchung bedeutet"). Reine Funktion,
 * kein IO — die strukturierten Details (Kriterien, Buchungssatz) rendert der
 * Tab daneben; hier nur die menschlesbare Zusammenfassung.
 */
import type { RuleBookingMode, RuleDirection, RuleExpectedInterval } from "./rule";

export interface RuleSummaryInput {
  bookingMode: RuleBookingMode;
  direction: RuleDirection | null;
  matchCounterpartyName: string | null;
  matchCounterpartyIban: string | null;
  matchAmount: number | null;
  matchAmountTolerance: number;
}

function fmtEuro(amount: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    Math.abs(amount),
  );
}

/** Hat die Regel überhaupt ein Match-Kriterium? Ohne greift sie bei nichts. */
export function hasAnyCriterion(input: RuleSummaryInput): boolean {
  return (
    !!input.matchCounterpartyName?.trim() ||
    !!input.matchCounterpartyIban?.trim() ||
    input.matchAmount != null
  );
}

/**
 * Baut den Klartext-Satz: „Greift bei jedem <Auslöser> und <Wirkung>."
 * Ohne Kriterien → deutlicher Hinweis, dass die Regel nichts trifft.
 */
export function describeRecurringRule(input: RuleSummaryInput): string {
  if (!hasAnyCriterion(input)) {
    return "Diese Regel hat noch keine Match-Kriterien und greift daher bei keiner Zahlung.";
  }

  const dirWord =
    input.direction === "payment_out"
      ? "Zahlungsausgang"
      : input.direction === "payment_in"
        ? "Zahlungseingang"
        : "passenden Umsatz";

  const name = input.matchCounterpartyName?.trim();
  const iban = input.matchCounterpartyIban?.trim();
  const whoPhrase = name
    ? ` mit Gegenpartei „${name}"`
    : iban
      ? ` mit IBAN ${iban}`
      : "";

  const amtPhrase =
    input.matchAmount != null
      ? ` über ${fmtEuro(input.matchAmount)}${
          input.matchAmountTolerance > 0 ? ` (±${fmtEuro(input.matchAmountTolerance)})` : ""
        }`
      : "";

  const trigger = `${dirWord}${whoPhrase}${amtPhrase}`;

  const effect =
    input.bookingMode === "match_only"
      ? "ordnet ihn diesem Sachverhalt zu — ohne automatische Buchung"
      : input.bookingMode === "accrue_then_settle"
        ? "gleicht ihn gegen das Personenkonto aus (der Aufwand/Ertrag wird separat zur Fälligkeit sollgestellt)"
        : "erzeugt automatisch einen Buchungsvorschlag nach der Vorlage";

  return `Greift bei jedem ${trigger} und ${effect}.`;
}

export interface RuleScheduleInput {
  expectedInterval: RuleExpectedInterval | null;
  expectedDayOfMonth: number | null;
  validFrom: string | null;
  validUntil: string | null;
}

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
] as const;

function fmtIsoDate(iso: string): string {
  const m = /(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso;
}

/**
 * Rhythmus & Laufzeit in natürlicher Sprache: „Wiederholt sich
 * vierteljährlich (Januar, April, Juli, Oktober), erwartet zum 15. des
 * Monats, vom 01.01.2026 bis 31.12.2026." — `null`, wenn gar nichts
 * hinterlegt ist. Quartals-/Jahres-Rhythmus ist über `validFrom` verankert
 * (gleiche Logik wie `isRuleDueInPeriod`); ohne Anker wird das benannt.
 */
export function describeRuleSchedule(input: RuleScheduleInput): string | null {
  const { expectedInterval, expectedDayOfMonth, validFrom, validUntil } = input;
  if (!expectedInterval && expectedDayOfMonth == null && !validFrom && !validUntil) return null;

  const validity =
    validFrom && validUntil
      ? `vom ${fmtIsoDate(validFrom)} bis ${fmtIsoDate(validUntil)}`
      : validFrom
        ? `unbefristet ab ${fmtIsoDate(validFrom)}`
        : validUntil
          ? `bis ${fmtIsoDate(validUntil)}`
          : "unbefristet";

  if (!expectedInterval) {
    const day = expectedDayOfMonth != null ? `, erwartet zum ${expectedDayOfMonth}. des Monats` : "";
    return `Ohne festen Rhythmus (kein Überfälligkeits-Check)${day}, Laufzeit ${validity}.`;
  }

  let rhythm: string;
  if (expectedInterval === "monthly") {
    rhythm = "monatlich";
  } else if (!validFrom) {
    rhythm = `${expectedInterval === "quarterly" ? "vierteljährlich" : "jährlich"} — ohne Startdatum nicht verankerbar (welche Monate ist offen)`;
  } else {
    const anchor = Number(validFrom.slice(5, 7)) - 1;
    if (expectedInterval === "quarterly") {
      const months = [0, 3, 6, 9].map((s) => MONTH_NAMES[(anchor + s) % 12]).join(", ");
      rhythm = `vierteljährlich (${months})`;
    } else {
      rhythm = `jährlich (im ${MONTH_NAMES[anchor]})`;
    }
  }

  const day = expectedDayOfMonth != null ? `, erwartet zum ${expectedDayOfMonth}. des Monats` : "";
  return `Wiederholt sich ${rhythm}${day}, ${validity}.`;
}
