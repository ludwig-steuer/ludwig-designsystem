import type { Comparison } from "./comparison";

/**
 * Was an einem Konto auffällt (F123 T123.6 / C-Abgleich 6-E).
 *
 * Bis F123 kannte Schritt 6 genau **einen** Befund: „die Zahl weicht ab".
 * Das Design nennt sechs, und fünf davon sind aus dem vorhandenen Bestand
 * ableitbar. Der Unterschied ist keine Kosmetik: „Konto erstmals bebucht"
 * und „sonst bebuchtes Konto fehlt diesen Monat" verlangen verschiedene
 * Handlungen, stehen aber beide unter derselben Prozentzahl.
 *
 * Rein und ohne IO. Was der sechste Befund wäre — Belegfeld-Muster je Konto —
 * bleibt leer: der Muster-Erkenner fehlt (F123 §5), und ein halbgarer würde
 * reihenweise Fehlalarm melden.
 */

export type FindingKind =
  /** In den Vormonaten nie bebucht, jetzt schon. */
  | "first_booked"
  /** Sonst immer bebucht, diesen Monat nicht. */
  | "missing"
  /** Die Zahl weicht vom Schnitt ab. */
  | "deviation"
  /** Das Konto steht auf der anderen Seite als sonst. */
  | "sign"
  /** Der Steuerschlüssel streut oder passt nicht zum Automatikkonto. */
  | "consistency"
  /** Vorsteuer-Befund am Konto. */
  | "input_tax";

export interface AccountFinding {
  kind: FindingKind;
  /** Wie dringend hingesehen werden muss. */
  level: "info" | "warn" | "block";
  /** Was los ist — ein Satz, in der Sprache der Buchhalterin. */
  text: string;
}

export interface FindingInput {
  accountNumber: string;
  accountName: string | null;
  accountingRole: string | null;
  vergleich: Comparison;
  /**
   * Wie oft welcher Steuerschlüssel diesen Monat auf dem Konto stand.
   * Streuung ist ein Befund: dasselbe Konto mit BU 9 **und** BU 8 im selben
   * Monat ist selten Absicht.
   */
  taxKeys?: Record<string, number>;
  /** Der Schlüssel, der sonst auf diesem Konto steht. */
  usualTaxKey?: string | null;
  /** Automatikkonto: der Schlüssel kommt vom Konto, an der Zeile ist er falsch. */
  isAutomatic?: boolean;
  /** Auf welcher Seite das Konto diesen Monat steht, und sonst. */
  side?: "debit" | "credit" | "gemischt" | null;
  usualSide?: "debit" | "credit" | null;
}

const SEITE: Record<string, string> = { debit: "Soll", credit: "Haben", gemischt: "beiden Seiten" };

export function deriveAccountFindings(input: FindingInput): AccountFinding[] {
  const out: AccountFinding[] = [];
  const v = input.vergleich;

  // 1. Erstmals bebucht — der Vergleich kann es nicht in Prozent sagen.
  if (v.avg === 0 && v.current !== 0 && !v.tooYoung) {
    out.push({
      kind: "first_booked",
      level: "warn",
      text: "In den Vormonaten nie bebucht, diesen Monat schon.",
    });
  }

  // 2. Fehlt — die Umkehrung, und sie fällt sonst niemandem auf, weil eine
  //    fehlende Zeile keine Zeile ist.
  if (v.current === 0 && v.avg !== null && v.avg !== 0 && !v.tooYoung) {
    out.push({
      kind: "missing",
      level: "warn",
      text: "Sonst jeden Monat bebucht, diesen Monat nicht.",
    });
  }

  // 3. Abweichung — nur wenn beide Seiten Zahlen haben.
  if (v.flagged && v.deviationPct !== null) {
    out.push({ kind: "deviation", level: "warn", text: v.explanation });
  }

  // 4. Vorzeichen — ein Aufwandskonto im Haben ist fast immer eine
  //    Gutschrift oder ein Fehler, nie Routine.
  if (input.side && input.usualSide && input.side !== input.usualSide) {
    out.push({
      kind: "sign",
      level: "warn",
      text: `Steht diesen Monat im ${SEITE[input.side] ?? input.side}, sonst im ${
        SEITE[input.usualSide] ?? input.usualSide
      }.`,
    });
  }

  // 5. Konsistenz des Steuerschlüssels.
  const keys = Object.entries(input.taxKeys ?? {}).filter(([, n]) => n > 0);
  if (keys.length > 1) {
    out.push({
      kind: "consistency",
      level: "warn",
      text: `Zwei Steuerschlüssel auf demselben Konto: ${keys
        .map(([k, n]) => `BU ${k} (${n}×)`)
        .join(", ")}.`,
    });
  } else if (
    input.usualTaxKey &&
    keys.length === 1 &&
    keys[0]![0] !== input.usualTaxKey
  ) {
    out.push({
      kind: "consistency",
      level: "warn",
      text: `Diesen Monat BU ${keys[0]![0]}, sonst BU ${input.usualTaxKey}.`,
    });
  }
  if (input.isAutomatic && keys.length > 0) {
    out.push({
      kind: "consistency",
      level: "block",
      text: "Automatikkonto mit gesetztem Steuerschlüssel — DATEV rechnet dann doppelt.",
    });
  }

  return out;
}

/** Die Gruppen des Designs — Reihenfolge ist die Reihenfolge der Dringlichkeit. */
export const FINDING_GROUPS: { kind: FindingKind; title: string; explanation: string }[] = [
  { kind: "first_booked", title: "Erstmals bebucht", explanation: "Neue Konten in dieser Periode." },
  { kind: "missing", title: "Fehlt diesen Monat", explanation: "Sonst bebucht, jetzt ohne Bewegung." },
  { kind: "deviation", title: "Abweichung", explanation: "Die Zahl weicht vom Schnitt ab." },
  { kind: "sign", title: "Unerwartetes Vorzeichen", explanation: "Andere Seite als sonst." },
  { kind: "consistency", title: "Steuerschlüssel", explanation: "Streuung oder Automatikkonto." },
  { kind: "input_tax", title: "Vorsteuer", explanation: "Befunde aus der USt-Prüfung." },
];
