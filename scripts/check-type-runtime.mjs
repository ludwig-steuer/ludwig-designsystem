#!/usr/bin/env node
/**
 * Guard at runtime: the type sizes the working surface really renders (0235,
 * owner 2026-10-27 over llcto: write down the type-size policy, then check that
 * it is applied).
 *
 * `check:type` reads the source; it cannot see what a bare `span` inherits.
 * This one opens every story that renders the working surface (`.app__main`,
 * from the files that use `AppShell`) in the running Storybook and reads the
 * computed style of every visible text node inside it:
 *
 *  - R1 the size is a step of the productive scale (`--fs-ui-*`, read from
 *       the page, so the scale stays the one source);
 *  - R2 16 px only as a title — weight 600 or more (A14: 16/400 is no role);
 *  - R3 exactly one `h1` in the story, at the page-title step
 *       (`--fs-ui-xl`, weight 600).
 *
 * Needs the dev server on 6107 (`pnpm storybook`) and `CHROME_BIN` as for
 * `scripts/cdp.mjs`. Not part of `pnpm build`: a check that needs a browser
 * runs where one is.
 *
 * Run: `pnpm check:type:runtime` · self-test of the rules: `--test`
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const SCALE_VARS = ["--fs-ui-xl", "--fs-ui-lg", "--fs-ui-md", "--fs-ui", "--fs-ui-sm", "--fs-ui-xs", "--fs-ui-2xs"];

/** The three rules over one story's readings — pure, so `--test` can feed it. */
export function judge({ scale, xl, lg, texts, h1 }) {
  const found = [];
  for (const t of texts) {
    if (!scale.includes(t.size)) found.push(`R1 ${t.size}px/${t.weight} off the scale: ${t.where} „${t.text}“`);
    // The title step as the page sets it (`--fs-ui-lg`), not a fixed 16 (0235, H6).
    else if (t.size === lg && t.weight < 600) found.push(`R2 ${lg}px/${t.weight} is no role: ${t.where} „${t.text}“`);
  }
  if (h1.length !== 1) found.push(`R3 ${h1.length} h1 instead of one`);
  else if (h1[0].size !== xl || h1[0].weight !== 600) found.push(`R3 h1 at ${h1[0].size}px/${h1[0].weight}, not ${xl}px/600`);
  return found;
}

function selfTest() {
  const scale = [20, 16, 14, 13.5, 12.5, 11.5, 11];
  const base = { scale, xl: 20, lg: 16, h1: [{ size: 20, weight: 600 }] };
  const expect = (cond, msg) => {
    if (!cond) {
      console.error(`self-test failed: ${msg}`);
      process.exit(1);
    }
  };
  expect(judge({ ...base, texts: [{ size: 13.5, weight: 400, where: "p", text: "x" }] }).length === 0, "a scale step passes");
  expect(judge({ ...base, texts: [{ size: 13, weight: 400, where: "p", text: "x" }] })[0]?.startsWith("R1"), "13 px is off the scale");
  expect(judge({ ...base, texts: [{ size: 16, weight: 400, where: "span", text: "x" }] })[0]?.startsWith("R2"), "16/400 is no role");
  expect(judge({ ...base, texts: [{ size: 16, weight: 600, where: "h2", text: "x" }] }).length === 0, "16/600 is a title");
  expect(judge({ ...base, h1: [], texts: [] })[0] === "R3 0 h1 instead of one", "a page without h1");
  expect(judge({ ...base, h1: [base.h1[0], base.h1[0]], texts: [] })[0] === "R3 2 h1 instead of one", "two h1");
  expect(judge({ ...base, h1: [{ size: 16, weight: 600 }], texts: [] })[0]?.startsWith("R3 h1 at 16"), "h1 not at the title step");
  console.log("check:type:runtime — self-test ok.");
}

/** Story files that render the working surface — by what they import. */
function surfaceFiles(dir = "src") {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...surfaceFiles(p));
    else if (p.endsWith(".stories.tsx") && /\bAppShell\b|app__main/.test(readFileSync(p, "utf8"))) out.push(p);
  }
  return out;
}

async function main() {
  const { launch, Session, url } = await import("./cdp.mjs");
  const unable = (why) => {
    console.error(`check:type:runtime — ${why}`);
    process.exit(2);
  };
  let index;
  try {
    index = await (await fetch("http://localhost:6107/index.json")).json();
  } catch {
    unable("Storybook is not running on 6107 (`pnpm storybook`).");
  }
  const files = surfaceFiles().map((f) => `./${f}`);
  const ids = Object.entries(index.entries)
    .filter(([, v]) => v.type === "story" && files.includes(v.importPath))
    .map(([id]) => id);
  // No browser is no finding: exit 2 with a sentence, not a stack (0235, H4).
  // `spawn` reports a missing binary asynchronously, so look for it first; the
  // fallback is the one `cdp.mjs` uses.
  const bin =
    process.env.CHROME_BIN ||
    `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;
  if (!existsSync(bin)) unable(`no browser to measure with at ${bin} — set CHROME_BIN.`);
  await launch();
  const s = await Session.open();
  await s.resize(1440);
  const failures = {};
  let measured = 0;
  for (const id of ids) {
    await s.goto(url(id));
    await new Promise((r) => setTimeout(r, 900));
    const reading = JSON.parse(
      await s.eval(`
        // A story that failed to render is a finding, not a story without a surface (0235, H3).
        if (document.body.classList.contains("sb-show-errordisplay")) return JSON.stringify({ failed: true });
        const main = document.querySelector(".app__main");
        if (!main) return JSON.stringify(null);
        const root = getComputedStyle(document.documentElement);
        const px = (v) => Math.round(parseFloat(v) * 100) / 100;
        const scale = ${JSON.stringify(SCALE_VARS)}.map((v) => px(root.getPropertyValue(v)));
        const texts = [];
        const walk = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
        let n;
        while ((n = walk.nextNode())) {
          const text = n.textContent.trim();
          const el = n.parentElement;
          if (!text || !el.getClientRects().length) continue;
          // Read out only (v2vh): no size on screen to judge.
          if (el.closest(".v2vh, svg")) continue;
          const cs = getComputedStyle(el);
          texts.push({ size: px(cs.fontSize), weight: Number(cs.fontWeight), where: el.tagName.toLowerCase() + (typeof el.className === "string" && el.className ? "." + el.className.split(" ")[0] : ""), text: text.slice(0, 40) });
        }
        const h1 = [...document.querySelectorAll("#storybook-root h1")].map((h) => ({ size: px(getComputedStyle(h).fontSize), weight: Number(getComputedStyle(h).fontWeight) }));
        return JSON.stringify({ scale, xl: scale[0], lg: scale[1], texts, h1 });
      `),
    );
    if (!reading) continue;
    if (reading.failed) {
      failures[id] = ["the story failed to render"];
      continue;
    }
    measured++;
    const found = judge(reading);
    if (found.length) failures[id] = [...new Set(found)];
  }
  const bad = Object.keys(failures);
  if (bad.length === 0) {
    console.log(`check:type:runtime — ok. ${measured} stories with a working surface, every text on the scale, one h1 each.`);
    process.exit(0);
  }
  for (const id of bad) {
    console.log(`  ✗ ${id}`);
    for (const f of failures[id].slice(0, 8)) console.log(`      ${f}`);
    if (failures[id].length > 8) console.log(`      … and ${failures[id].length - 8} more`);
  }
  const failed = bad.filter((id) => failures[id][0] === "the story failed to render").length;
  console.log(`\ncheck:type:runtime — ${bad.length} of ${measured + failed} stories off the roles of docs/design-guidelines.md §2a (0220, 0235).`);
  process.exit(1);
}

if (process.argv.includes("--test")) selfTest();
else await main();
