// Compares two folders of PNG screenshots file by file and prints the share of
// differing pixels. Used to prove "desktop unchanged" (0253): baseline before
// the change, second shot after it, same story ids as file names.
//
//   node scripts/png-diff.mjs <before-dir> <after-dir> [max-percent]
//
// Exit 1 when a file is missing, the sizes differ or a share exceeds the limit.
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
// sharp comes in through Storybook's tree, not as a direct dependency.
// ponytail: resolved from the pnpm store; add sharp to devDependencies if this breaks.
const sharp = require(
  require.resolve("sharp", { paths: [join(process.cwd(), "node_modules/.pnpm/node_modules")] }),
);

const [before, after, limitArg] = process.argv.slice(2);
const limit = Number(limitArg ?? "0.5");
let failed = false;

for (const file of readdirSync(before).filter((f) => f.endsWith(".png")).sort()) {
  let a, b;
  try {
    a = await sharp(join(before, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    b = await sharp(join(after, file)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  } catch {
    console.log(`✗ ${file}: missing`);
    failed = true;
    continue;
  }
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) {
    console.log(`✗ ${file}: size ${a.info.width}×${a.info.height} → ${b.info.width}×${b.info.height}`);
    failed = true;
    continue;
  }
  let diff = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) diff++;
  }
  const pct = (100 * diff) / (a.info.width * a.info.height);
  const ok = pct <= limit;
  if (!ok) failed = true;
  console.log(`${ok ? "✓" : "✗"} ${file}: ${pct.toFixed(3)} %`);
}
process.exit(failed ? 1 : 0);
