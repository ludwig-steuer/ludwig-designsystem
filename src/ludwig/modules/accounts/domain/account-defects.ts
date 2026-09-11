import { hasTargetBalanceZero, isClearingAccountType } from "@/ludwig/core/accounting/clearing-account";

import type { AccountEntryOrigin } from "./account-entry";

/**
 * Die Mängel eines Kontos — **eine** Ableitung für die Mängel-Zone und die
 * Kacheln (F209, B6; Detailseiten-Standard D4, Zone 2).
 *
 * Gegenstück zu `docDefects()` beim Beleg. Ein Mangel ist etwas, das jemand
 * tun muss; die Wörter dazu setzt der Konsument, die Domain sagt nur, **dass**
 * und **wie viel**. Zählt dieselbe Herkunftsableitung wie der Filter
 * `?origin=` der Bewegungsliste, damit Kachel, Mängelzeile und gefilterte
 * Liste dieselbe Zahl nennen (I12).
 *
 * | Mangel | Woher |
 * |---|---|
 * | exportiert, in DATEV nicht wiedergefunden | Herkunft `exported` (Push-204 ≠ angekommen) |
 * | nur in Ludwig | Herkunft `ludwig` |
 * | Verrechnungskonto nicht ausgeglichen | Kategorie mit Zielsaldo null (R21) und DATEV-Saldo ≠ 0 |
 * | DATEV kennt das Konto nicht | `datev_sync_state = 'local_only'` |
 * | kein LLM-Profil | Beschreibung oder Embedding fehlt |
 *
 * **Nicht dabei:** `creation_pending` — der nächste Export legt das Konto
 * schon an, es gibt nichts zu tun. `disappeared` und Kontenfunktion 12 sind
 * Signale über den ganzen Datensatz, keine Mängel.
 */

export type AccountDefectKind =
  | "exported_not_mirrored"
  | "ludwig_only"
  | "clearing_residual"
  | "datev_unknown"
  | "llm_profile_missing";

export interface AccountDefect {
  kind: AccountDefectKind;
  /** Kritikalität (A7): die Reihenfolge der Rückgabe folgt ihr. */
  severity: "warning" | "hint";
  count: number | null;
  amount: number | null;
}

export interface AccountDefectFacts {
  origins: Record<AccountEntryOrigin, { count: number; amount: number }>;
  clearingAccountType: string | null;
  /** Saldo laut DATEV; `null`, wenn DATEV das Konto nicht kennt oder er nicht darstellbar ist. */
  datevBalance: number | null;
  datevSyncState: string | null;
  description: string | null;
  embeddingCreatedAt: string | null;
}

/** Unter einem halben Cent ist ein Rest Rundung, kein Rest. */
const RESIDUAL_EPSILON = 0.005;

/** Warnung vor Hinweis (A7), danach die Reihenfolge der Mängel-Zone. */
export function accountDefects(facts: AccountDefectFacts): AccountDefect[] {
  const defects: AccountDefect[] = [];

  if (facts.origins.exported.count > 0) {
    defects.push({
      kind: "exported_not_mirrored",
      severity: "warning",
      count: facts.origins.exported.count,
      amount: facts.origins.exported.amount,
    });
  }

  if (facts.origins.ludwig.count > 0) {
    defects.push({
      kind: "ludwig_only",
      severity: "hint",
      count: facts.origins.ludwig.count,
      amount: facts.origins.ludwig.amount,
    });
  }

  const type = facts.clearingAccountType;
  if (
    isClearingAccountType(type) &&
    hasTargetBalanceZero(type) &&
    facts.datevBalance !== null &&
    Math.abs(facts.datevBalance) >= RESIDUAL_EPSILON
  ) {
    defects.push({ kind: "clearing_residual", severity: "hint", count: null, amount: facts.datevBalance });
  }

  if (facts.datevSyncState === "local_only") {
    defects.push({ kind: "datev_unknown", severity: "hint", count: null, amount: null });
  }

  if (facts.description === null || facts.embeddingCreatedAt === null) {
    defects.push({ kind: "llm_profile_missing", severity: "hint", count: null, amount: null });
  }

  return defects;
}
