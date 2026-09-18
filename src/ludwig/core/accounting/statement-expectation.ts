/** F235: Auszugserwartung je Zahlungskonto (`bank.md` R15a/R15b). Werte spiegeln den DB-CHECK. */
export const STATEMENT_EXPECTATION_LEVELS = ["required", "expected", "none"] as const;
export type StatementExpectationLevel = (typeof STATEMENT_EXPECTATION_LEVELS)[number];

export function isStatementExpectationLevel(v: unknown): v is StatementExpectationLevel {
  return typeof v === "string" && (STATEMENT_EXPECTATION_LEVELS as readonly string[]).includes(v);
}

/**
 * Die Onboarding-Checkbox ist binär. Ein von Hand gesetztes „Sollte kommen"
 * überlebt ein Häkchen; undefined = keine Entscheidung (Bestand bleibt).
 */
export function statementExpectationFromCheckbox(
  checked: boolean | undefined,
  currentManual: StatementExpectationLevel | null,
): StatementExpectationLevel | null {
  if (checked === undefined) return null;
  if (!checked) return "none";
  return currentManual === "expected" ? "expected" : "required";
}
