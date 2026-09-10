import type { BookingCycleKind } from "@/ludwig/modules/datev-export";

import type { CheckKind } from "./check-kinds";

/**
 * Die Freigabe-Checkliste (F109-8-Zusatz): Schritt 8 ist eine Checkliste und
 * zwei Knöpfe.
 *
 * Drei Stufen, und die Aufteilung ist der ganze Punkt:
 *
 *  - **`blocked`** ist deckungsgleich mit den MCP-Gates plus dem
 *    Freigabe-Guard des Servers. Was der Agent nicht passieren dürfte, darf
 *    die Kanzlei nicht freigeben — und umgekehrt erfindet die Checkliste keine
 *    eigenen Regeln. Nicht quittierbar.
 *  - **`warn`** blockiert nicht, will aber gesehen werden. Ein Klick quittiert
 *    (`recordReviewCheck`), optional mit Grund. Die Quittung hängt am Wert:
 *    ändert er sich, wird die Zeile wieder gelb.
 *  - **`info`** ist Kontext, kein Todo.
 *
 * Diese Datei ist rein — sie bekommt die gerechneten Zahlen und entscheidet
 * daraus Stufe, Text und Sprung. Was gerechnet wird, steht in
 * `application/release-checklist.ts`.
 */

export type ChecklistLevel = "blocked" | "warn" | "info";

/**
 * Die Keys, die `getReleaseChecklist` bauen kann — und nur die. Nicht jeder
 * `CheckKind` ist eine Checklisten-Zeile: `account_comparison` und die anderen
 * sind Einzel-Quittungen an ihrem Gegenstand (F123). Umgekehrt ist
 * `not_checked` reiner Kontext und `client_batch_masterdata` (F165) bewusst
 * kein `CheckKind` — nicht quittierbar, nichts zu speichern.
 */
export const CHECKLIST_ROW_KEYS = [
  "statements_complete",
  "documents_handled",
  "bank_transactions_booked",
  "bank_transactions_proposed",
  "clearing_accounts_zero",
  "export_simulation",
  "cases_proposed",
  "entries_accepted",
  "questions_answered",
  "conventions_decided",
  "client_batch_masterdata",
  "not_checked",
] as const satisfies readonly (CheckKind | "not_checked" | "client_batch_masterdata")[];

export type ChecklistRowKey = (typeof CHECKLIST_ROW_KEYS)[number];

/**
 * Welche Zeile in welcher Stapelart gilt.
 *
 * **SSOT ist `docs/reference/stapelarten.md`** — diese Konstante zieht nach;
 * `__tests__/stapelarten-katalog.test.ts` hält beides zusammen (F179).
 *
 * Beim Mandantenstapel bleibt, was den Weg nach DATEV betrifft. Die fünf
 * Gate-Zeilen und `cases_proposed` messen Teilschritte, die dort gar nicht
 * laufen; `client_batch_masterdata` gilt umgekehrt nur dort (F165).
 */
export const CHECKLIST_ROW_SCOPE: Record<
  ChecklistRowKey,
  { regular: boolean; clientBatch: boolean }
> = {
  statements_complete: { regular: true, clientBatch: false },
  documents_handled: { regular: true, clientBatch: false },
  bank_transactions_booked: { regular: true, clientBatch: false },
  bank_transactions_proposed: { regular: true, clientBatch: false },
  clearing_accounts_zero: { regular: true, clientBatch: false },
  export_simulation: { regular: true, clientBatch: true },
  cases_proposed: { regular: true, clientBatch: false },
  entries_accepted: { regular: true, clientBatch: true },
  questions_answered: { regular: true, clientBatch: true },
  conventions_decided: { regular: true, clientBatch: false },
  client_batch_masterdata: { regular: false, clientBatch: true },
  not_checked: { regular: true, clientBatch: true },
};

/** Gilt diese Checklisten-Zeile in dieser Stapelart? */
export function checklistRowApplies(key: ChecklistRowKey, kind: BookingCycleKind): boolean {
  const scope = CHECKLIST_ROW_SCOPE[key];
  return kind === "client_batch" ? scope.clientBatch : scope.regular;
}

export interface ChecklistRow {
  key: ChecklistRowKey;
  label: string;
  /** Was die Zeile misst, für den Tooltip. */
  hint: string;
  done: number;
  total: number;
  level: ChecklistLevel;
  /** Prüfschritt, auf den die Zeile springt (`null` = kein Sprung). */
  jumpStep: number | null;
  /** Quittiert und noch gültig (Wert unverändert)? */
  acknowledged: boolean;
  /** Grund der Quittung, wenn einer angegeben wurde. */
  note: string | null;
  /** Wer wann quittiert hat — die Druckansicht zeigt es. */
  acknowledgedBy: string | null;
  acknowledgedAt: string | null;
  /**
   * Der Wert, gegen den quittiert wird. Bleibt er gleich, gilt die alte
   * Quittung; ändert er sich, wird die Zeile wieder gelb.
   */
  valueHash: string;
  /** Die offenen Gegenstände, gedeckelt — der Zähler daneben ist ungedeckelt. */
  items: Array<{ text: string; problem: string | null }>;
}

/** Eine Zeile ist erledigt, wenn nichts offen ist oder die Quittung noch gilt. */
export function rowSettled(row: ChecklistRow): boolean {
  if (row.level === "info") return true;
  if (row.done >= row.total) return true;
  return row.level === "warn" && row.acknowledged;
}

export interface ReleaseVerdict {
  /** Freigeben ist möglich. */
  canRelease: boolean;
  /**
   * Die **eine** Zeile, die fehlt — nicht eine Liste. Die Liste ist die
   * Checkliste selbst (Zusatz-Brief §3).
   */
  blockingReason: string | null;
  openBlocked: number;
  openWarn: number;
}

/**
 * Ob freigegeben werden darf.
 *
 * Rote Zeilen blockieren hart. Gelbe blockieren, solange sie nicht quittiert
 * sind — quittieren ist ein Klick, und genau darum geht es: die Entscheidung
 * soll getroffen, nicht übersehen werden.
 */
export function releaseVerdict(rows: readonly ChecklistRow[]): ReleaseVerdict {
  const blocked = rows.filter((r) => r.level === "blocked" && !rowSettled(r));
  const warn = rows.filter((r) => r.level === "warn" && !rowSettled(r));
  const first = blocked[0] ?? warn[0] ?? null;
  return {
    canRelease: blocked.length === 0 && warn.length === 0,
    blockingReason: first
      ? `${first.label}: ${first.total - first.done} offen` +
        (first.jumpStep === null ? "" : ` → Schritt ${first.jumpStep}`)
      : null,
    openBlocked: blocked.length,
    openWarn: warn.length,
  };
}

/** Die Checkliste als Text — geht in Schritt 9 als Notiz an den Stapel. */
export function checklistAsNote(rows: readonly ChecklistRow[]): string {
  return rows
    .map((r) => {
      const mark = rowSettled(r) ? (r.acknowledged ? "?" : "✓") : "✗";
      const ack = r.acknowledged
        ? ` — quittiert${r.acknowledgedBy ? ` von ${r.acknowledgedBy}` : ""}${
            r.note ? `: ${r.note}` : ""
          }`
        : "";
      return `${mark} ${r.label}: ${r.done} von ${r.total}${ack}`;
    })
    .join("\n");
}
