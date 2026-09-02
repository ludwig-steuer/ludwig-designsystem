import type { Vergleich } from "./vergleich";

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

export type BefundArt =
  /** In den Vormonaten nie bebucht, jetzt schon. */
  | "erstmals"
  /** Sonst immer bebucht, diesen Monat nicht. */
  | "fehlt"
  /** Die Zahl weicht vom Schnitt ab. */
  | "abweichung"
  /** Das Konto steht auf der anderen Seite als sonst. */
  | "vorzeichen"
  /** Der Steuerschlüssel streut oder passt nicht zum Automatikkonto. */
  | "konsistenz"
  /** Vorsteuer-Befund am Konto. */
  | "vorsteuer";

export interface KontoBefund {
  art: BefundArt;
  /** Wie dringend hingesehen werden muss. */
  level: "info" | "warn" | "block";
  /** Was los ist — ein Satz, in der Sprache der Buchhalterin. */
  text: string;
}

export interface BefundInput {
  accountNumber: string;
  accountName: string | null;
  accountingRole: string | null;
  vergleich: Vergleich;
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

export function deriveKontoBefunde(input: BefundInput): KontoBefund[] {
  const out: KontoBefund[] = [];
  const v = input.vergleich;

  // 1. Erstmals bebucht — der Vergleich kann es nicht in Prozent sagen.
  if (v.avg === 0 && v.current !== 0 && !v.tooYoung) {
    out.push({
      art: "erstmals",
      level: "warn",
      text: "In den Vormonaten nie bebucht, diesen Monat schon.",
    });
  }

  // 2. Fehlt — die Umkehrung, und sie fällt sonst niemandem auf, weil eine
  //    fehlende Zeile keine Zeile ist.
  if (v.current === 0 && v.avg !== null && v.avg !== 0 && !v.tooYoung) {
    out.push({
      art: "fehlt",
      level: "warn",
      text: "Sonst jeden Monat bebucht, diesen Monat nicht.",
    });
  }

  // 3. Abweichung — nur wenn beide Seiten Zahlen haben.
  if (v.flagged && v.deviationPct !== null) {
    out.push({ art: "abweichung", level: "warn", text: v.explanation });
  }

  // 4. Vorzeichen — ein Aufwandskonto im Haben ist fast immer eine
  //    Gutschrift oder ein Fehler, nie Routine.
  if (input.side && input.usualSide && input.side !== input.usualSide) {
    out.push({
      art: "vorzeichen",
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
      art: "konsistenz",
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
      art: "konsistenz",
      level: "warn",
      text: `Diesen Monat BU ${keys[0]![0]}, sonst BU ${input.usualTaxKey}.`,
    });
  }
  if (input.isAutomatic && keys.length > 0) {
    out.push({
      art: "konsistenz",
      level: "block",
      text: "Automatikkonto mit gesetztem Steuerschlüssel — DATEV rechnet dann doppelt.",
    });
  }

  return out;
}

/** Die Gruppen des Designs — Reihenfolge ist die Reihenfolge der Dringlichkeit. */
export const BEFUND_GRUPPEN: { art: BefundArt; titel: string; erklaerung: string }[] = [
  { art: "erstmals", titel: "Erstmals bebucht", erklaerung: "Neue Konten in dieser Periode." },
  { art: "fehlt", titel: "Fehlt diesen Monat", erklaerung: "Sonst bebucht, jetzt ohne Bewegung." },
  { art: "abweichung", titel: "Abweichung", erklaerung: "Die Zahl weicht vom Schnitt ab." },
  { art: "vorzeichen", titel: "Unerwartetes Vorzeichen", erklaerung: "Andere Seite als sonst." },
  { art: "konsistenz", titel: "Steuerschlüssel", erklaerung: "Streuung oder Automatikkonto." },
  { art: "vorsteuer", titel: "Vorsteuer", erklaerung: "Befunde aus der USt-Prüfung." },
];
