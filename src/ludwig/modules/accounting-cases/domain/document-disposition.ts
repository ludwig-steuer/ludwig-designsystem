/**
 * Was die Kanzlei mit einem offenen Beleg entscheiden kann, ohne zu buchen —
 * die geschlossenen Mengen der Kerne in `not-bookkeeping-decision-core.ts`,
 * rein, damit auch die Belegprüfung (F452) sie liest.
 */

/** Was die Kanzlei mit einem Beleg macht, der kein Buchhaltungsbeleg ist (F449). */
export const NOT_BOOKKEEPING_DISPOSITIONS = [
  "return_to_agent",
  "private_tax_filing",
  "annual_accounts_filing",
  "payroll_filing",
  "permanent_file",
  "irrelevant",
] as const;
export type NotBookkeepingDisposition = (typeof NOT_BOOKKEEPING_DISPOSITIONS)[number];

/** F452: der Grund am Beleg, wenn die Kanzlei ihn gesehen hat und bewusst nichts tut. */
export const SIGHTED_NO_ACTION = "sighted_no_action";
