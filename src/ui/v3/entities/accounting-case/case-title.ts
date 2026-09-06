import {
  caseDisplayTitle,
  type CaseKind,
  type CaseLifecycle,
} from "@/ludwig/modules/accounting-cases/domain/case";

/**
 * How a case is **named** and how it is **found again** — the two chains every
 * form of this family shares (0095).
 *
 * The display name comes from the mirror: `caseDisplayTitle()` is the canon
 * since `ludwig/app` 44f9cd4e (register L-52), and the set does not build a
 * second one. What is **not** over there is the identifier chain — the number,
 * and the short id when a case has none — so it lives here, in one place, for
 * cell, row and drawer.
 */

/**
 * The subset of `CaseListItem` that naming and linking need. Everything here
 * exists in the mirror; the interface is the cut, not a new model.
 */
export interface CaseLink {
  caseId: string;
  caseNumber: string | null;
  fiscalYear: number | null;
  title: string | null;
  kind: CaseKind;
  counterpartyName: string | null;
  lifecycleStatus: CaseLifecycle | null;
  /** Only in the bank statement: the part of the amount that falls on this case. */
  amount?: number | null;
  currency?: string | null;
}

/**
 * What a person reads: the title, else „Art: Gegenpart", else the kind alone.
 *
 * A thin pass-through on purpose — the rule belongs to the domain, and a
 * second one here is exactly what L-52 was about.
 *
 * @when    A case has to be **named** — cell, row, drawer head, a mention.
 * @instead How it is found again → caseIdentifier.
 */
export function caseTitle(c: Pick<CaseLink, "title" | "kind" | "counterpartyName">): string {
  return caseDisplayTitle(c);
}

/**
 * How a case is **found again**: its number, and if it has none, the first
 * eight characters of its id.
 *
 * The number is what a person quotes on the phone; the short id is the
 * fallback, because a case without a number still has to be nameable — and a
 * dash would say „none", which is wrong: it has one, it just has no number.
 *
 * @when    The case has to be quoted, searched or told apart.
 * @instead What a person reads → caseTitle.
 */
export function caseIdentifier(c: Pick<CaseLink, "caseId" | "caseNumber">): string {
  return c.caseNumber ?? c.caseId.slice(0, 8);
}
