#!/usr/bin/env node
/**
 * Guard: a module whose domain has a barrel is imported only through it.
 *
 * Once `src/ludwig/modules/<m>/domain/index.ts` exists (the app's fixed
 * address, F671), `@/ludwig/modules/<m>/domain/<file>` is forbidden in the
 * set: deep paths broke with every cut of the app's folders (F669). Modules
 * without a barrel are left alone until they get one.
 *
 * Run: `pnpm check:domain-paths` · self-test: `--test`
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DEEP = /from\s+["']@\/ludwig\/modules\/([a-z0-9-]+)\/domain\/[^"']+["']/g;

/** The deep imports in one source text, given which modules have a barrel. */
export function deepImports(text, hasBarrel) {
  return [...text.matchAll(DEEP)].filter((m) => hasBarrel(m[1])).map((m) => m[0]);
}

const files = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return files(p);
    return /\.(tsx?|mjs)$/.test(e.name) ? [p] : [];
  });

if (process.argv.includes("--test")) {
  const barrel = (m) => m === "accounting-cases";
  const hits = deepImports(
    'import { A } from "@/ludwig/modules/accounting-cases/domain/cases/case";\n' +
      'import { B } from "@/ludwig/modules/accounting-cases/domain";\n' +
      'import { C } from "@/ludwig/modules/invoices/domain/invoice";',
    barrel,
  );
  if (hits.length !== 1 || !hits[0].includes("cases/case")) {
    console.error("check:domain-paths --test failed", hits);
    process.exit(1);
  }
  console.log("check:domain-paths --test ok");
  process.exit(0);
}

const hasBarrel = (m) => existsSync(`src/ludwig/modules/${m}/domain/index.ts`);
const found = ["src/ui", "src/showcase", ".storybook"]
  .filter((d) => existsSync(d))
  .flatMap(files)
  .flatMap((f) => deepImports(readFileSync(f, "utf8"), hasBarrel).map((i) => `  ${f}: ${i}`));

if (found.length) {
  console.error(`check:domain-paths — ${found.length} deep import(s) into a module with a domain barrel:`);
  console.error(found.join("\n"));
  console.error("Import from `@/ludwig/modules/<m>/domain`; a missing name goes into the app's barrel.");
  process.exit(1);
}
console.log("check:domain-paths — ok.");
