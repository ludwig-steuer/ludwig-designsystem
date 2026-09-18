import type { StateKind } from "@ludwig/designsystem";

/**
 * F220 T220.6 — der Stand eines Verrechnungskontos in Schritt 4: null heißt
 * grün, ein Rest heißt gelb (Hinweis, kein Blocker — Gate 4d hält den Stapel
 * bei Zielsaldo-null-Konten ohnehin auf). Konten ohne Zielsaldo null tragen
 * zwischen Entstehung und Zahltag zu Recht einen Saldo (`shareholder`,
 * `payroll_liability`) — dort ist ein Saldo Auskunft, keine Warnung.
 */
export const CLEARING_TOLERANCE = 0.005;

const EUR = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });

const zeilen = (n: number) => `${n} Zeile${n === 1 ? "" : "n"} im Zeitraum`;

export function clearingAccountState(row: {
  balance: number;
  targetBalanceZero: boolean;
  movementCount: number;
}): { state: Extract<StateKind, "done" | "warning">; text: string } {
  if (Math.abs(row.balance) < CLEARING_TOLERANCE) {
    return { state: "done", text: row.movementCount > 0 ? `Saldo null — ${zeilen(row.movementCount)}` : "Saldo null" };
  }
  if (!row.targetBalanceZero) {
    return { state: "done", text: `${EUR.format(row.balance)} — Zielsaldo null gilt für dieses Konto nicht` };
  }
  return {
    state: "warning",
    text:
      `${EUR.format(row.balance)} — ` +
      (row.movementCount > 0
        ? `${zeilen(row.movementCount)} erklären den Rest`
        : "keine Zeile im Zeitraum, der Rest ist älter"),
  };
}

/** F243: die drei Teile der Karte „Verrechnungskonten" in Schritt 4. */
export interface ClearingAccountGroups<T> {
  /** „Im Stapel bebucht": Bewegung im Zeitraum (Vorschläge zählen), egal welcher Saldo. */
  booked: T[];
  /** „Saldo offen ohne Bewegung": keine Zeile im Zeitraum, |Saldo| ≥ Toleranz. */
  openWithoutMovement: T[];
  /** „Ausgeglichen": keine Zeile im Zeitraum, Saldo null. */
  balanced: T[];
}

/** Bewegung vor Saldo; die Eingangsreihenfolge (Kontonummer) bleibt je Gruppe erhalten. */
export function groupClearingAccounts<T extends { balance: number; movementCount: number }>(
  rows: readonly T[],
): ClearingAccountGroups<T> {
  const groups: ClearingAccountGroups<T> = { booked: [], openWithoutMovement: [], balanced: [] };
  for (const row of rows) {
    if (row.movementCount > 0) groups.booked.push(row);
    else if (Math.abs(row.balance) >= CLEARING_TOLERANCE) groups.openWithoutMovement.push(row);
    else groups.balanced.push(row);
  }
  return groups;
}

/** F243: der Warnhinweis über der Karte — `null` ohne offenen Vorschlag. */
export function pendingProposalNotice(count: number): string | null {
  if (count <= 0) return null;
  if (count === 1) {
    return "Die Salden enthalten 1 Buchungsvorschlag aus diesem Zeitraum, der noch nicht freigegeben ist.";
  }
  return `Die Salden enthalten ${count} Buchungsvorschläge aus diesem Zeitraum, die noch nicht freigegeben sind.`;
}
