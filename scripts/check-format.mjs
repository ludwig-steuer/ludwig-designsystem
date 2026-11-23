// The true minus (0261): what format.ts returns for negative numbers.
// Run with `pnpm check:format`; exits 1 on the first mismatch.
import assert from "node:assert/strict";

const { formatAmount, formatCount, formatPercent } = await import("../src/ui/v3/format.ts");

const cases = [
  [formatAmount(-1249.9, "EUR"), "−1.249,90 €"],
  [formatAmount(-0.5, null), "−0,50"],
  [formatAmount(-0, "EUR"), "0,00 €"],
  [formatAmount(-0.001, "EUR"), "0,00 €"],
  [formatAmount(5, "EUR", true), "+5,00 €"],
  [formatAmount(1800, "EUR"), "1.800,00 €"],
  [formatCount(-3), "−3"],
  [formatCount(3400), "3.400"],
  [formatPercent(-7.5, 1), "−7,5 %"],
  [formatPercent(19), "19 %"],
];
for (const [got, want] of cases) assert.equal(got, want);
console.log(`check:format: ${cases.length} cases ok`);
