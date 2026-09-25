#!/usr/bin/env node
/**
 * Guard: the fixtures of the balance reconciliation add up (0202, F298 §10).
 *
 * Per fixture and source `old + movement = new`; the contributions of the
 * explanation plus the remainder give the released difference „new"; a
 * remainder line says the same amount as the remainder field. Node loads the
 * TypeScript files directly (type stripping) — they import types only.
 *
 * Run: `pnpm check:bank-balance`
 */
import { allComparisons } from "../src/showcase/bank-balance/fixtures.ts";
import { cents, explainedSum, releasedDifferenceNew } from "../src/showcase/bank-balance/calc.ts";

const failures = [];
const expect = (ok, name, what) => {
  if (!ok) failures.push(`${name}: ${what}`);
};
const adds = (old, movement, next) => cents(old + movement) === cents(next);

for (const [name, c] of Object.entries(allComparisons)) {
  for (const mode of ["released", "withProposals"]) {
    const t = c.ledger[mode];
    expect(adds(t.old.amount, t.movement, t.new.amount), name, `ledger.${mode}: old + movement ≠ new`);
    if (t.oldParts) {
      const parts = cents(t.oldParts.reduce((sum, part) => sum + part.amount, 0));
      expect(parts === cents(t.old.amount), name, `ledger.${mode}: parts ${parts} ≠ old ${t.old.amount}`);
    }
  }
  const { old, movement, new: next } = c.statement;
  if (old && movement && next) {
    expect(adds(old.amount, movement.amount, next.amount), name, "statement: old + movement ≠ new");
  }

  const difference = releasedDifferenceNew(c);
  if (c.remainder === null) {
    expect(
      c.explanation.every((line) => line.amount === null),
      name,
      "no remainder, yet an explanation line carries an amount",
    );
  } else {
    expect(difference !== null, name, "remainder without a comparable „new\"");
    const sum = cents(explainedSum(c) + c.remainder);
    expect(sum === difference, name, `explained ${explainedSum(c)} + remainder ${c.remainder} = ${sum} ≠ difference ${difference}`);
  }
  const line = c.explanation.find((l) => l.key === "remainder");
  if (line) expect(line.amount === c.remainder, name, "remainder line ≠ remainder field");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`check:bank-balance — ${Object.keys(allComparisons).length} fixtures add up.`);
