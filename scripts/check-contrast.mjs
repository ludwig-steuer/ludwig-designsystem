#!/usr/bin/env node
/**
 * Guard for the contrast numbers written into `tokens.css` (task 0055).
 *
 * Every colour token whose comment claims a contrast ratio gets that ratio
 * recomputed here, from the hex values in the same file. Two of these numbers
 * were wrong when this script was written — `--color-accent-700` said 4.85 on
 * `accent-50` where it is 5.04 (found in 0090), and the focus ring said 9.4:1
 * where it is 11.64 (found in 0055). Both times the conclusion held and only
 * the number was off, which is exactly why nobody caught it: a ratio in a
 * comment is the one measurement in the set that nobody recomputes, **because
 * it is already written down**.
 *
 * The script reads only. It reports, it does not fix — a ratio that falls
 * below its threshold is a task, not a comment.
 *
 * **The form is the contract:** only a ratio that holds today is written as
 * `X.XX:1`. A number a comment quotes as history („it said 9,4 until …")
 * drops the `:1`, otherwise this script would demand that the past be true.
 *
 * **Was er nicht kann: Deckkraft.** Er rechnet volle Token gegeneinander; eine
 * Zahl, die für `opacity` gilt, kann er nicht bestätigen. Solche Angaben
 * lassen das `:1` weg und nennen die Deckkraft im Satz. Nennt eine von ihnen
 * doch ein Token, rechnet er den **vollen** Ton und klagt falsch an — er
 * winkt sie nicht durch (gemessen: `--color-accent-700` bei `opacity: .5`,
 * 2,11 gegen die gerechneten 5,45). Still bleibt er nur ohne Token, und das
 * meldet er als ungeprüft.
 *
 * Run: `pnpm check:contrast`
 */

import { readFileSync } from "node:fs";

/**
 * All five stylesheets, not only the tokens: the fourth miscalculated ratio
 * of the week sat in `v3.css` ("2.67:1 on bg-soft", measured against an
 * `accent-700` that has not existed since 0090). A guard that stops at the
 * token file checks half the claims — and one that stops at three of five
 * blades misses `components.css` (Abnahme 0055, dritte Runde).
 */
const FILES = [
  "src/styles/tokens.css",
  "src/styles/v3.css",
  "src/styles/app-chrome.css",
  "src/styles/components.css",
  "src/styles/booking.css",
];
const TOKEN_SOURCE = readFileSync(FILES[0], "utf8");

/** `--color-x: #AABBCC;` → the map every claim is resolved against. */
const TOKENS = new Map();
for (const m of TOKEN_SOURCE.matchAll(/(--color-[a-z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})\s*;/g)) {
  TOKENS.set(m[1], m[2]);
}

/**
 * The grounds a comment names in words. „Weiss" is the page, and it is the
 * only one that is not a token — everything else has to be one, or the claim
 * cannot be checked and says so.
 */
const GROUNDS = new Map([
  ["weiss", "#FFFFFF"],
  ["weiß", "#FFFFFF"],
  ["bg", "--color-bg"],
  ["bg-soft", "--color-bg-soft"],
  ["bg-sunken", "--color-bg-sunken"],
]);

function channels(hex) {
  let h = hex.replace("#", "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
}

function luminance(hex) {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `bg-soft` or `--color-bg-soft` or „Weiss" → a hex, or null with a reason. */
function resolveGround(word) {
  const key = word.toLowerCase().replace(/^--color-/, "");
  const known = GROUNDS.get(key);
  if (known) return known.startsWith("#") ? known : (TOKENS.get(known) ?? null);
  return TOKENS.get(`--color-${key}`) ?? null;
}

/**
 * A claim is a ratio plus the ground it is measured against, and the token it
 * belongs to. The foreground is the token declared **after** the comment —
 * unless the comment names one itself, as the focus ring does.
 */
/** Alle Angaben einer Datei — die Einheit, die `--test` prüft. */
export function claimsAus(lines, file = "") {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // **Jede Angabe trägt ihren eigenen Grund** — deshalb wird die Zeile vor
    // jeder Zahl geteilt und der Grund nur im eigenen Abschnitt gesucht: aus
    // „5.52:1, 4.78:1 auf warning-bg" werden zwei Ansprüche, der erste gegen
    // Weiß. Ein Regex, der von der Zahl aus nach rechts liest, kann das nicht:
    // er erbt entweder den fremden Grund oder er findet den eigenen nicht,
    // wenn zwischen Zahl und „auf" noch das Token steht — und genau die Form
    // schreibt der Schlusstext vor („2.87:1 (`--color-text-subtle` auf
    // `--color-bg-soft`)"). Sie fiel zweimal durch, einmal als falsche
    // Anklage, einmal als grünes Testat für eine falsche Zahl (0055).
    // Der Backtick zählt dabei auf **beiden** Hälften.
    const found = [];
    // Der Rückblick verhindert den Schnitt **innerhalb** einer Zahl: ohne ihn
    // trennte „11.64:1" vor der zweiten Eins und der Wächter las 1,64.
    for (const teil of line.split(/(?<![\d.,])(?=\d+[.,]\d+\s*:\s*1)/)) {
      const zahl = teil.match(/^(\d+[.,]\d+)\s*:\s*1/);
      if (!zahl) continue;
      const grund = teil.match(/auf\s+`?([A-Za-zäöü0-9-]+)`?/);
      found.push({ text: zahl[0].trim(), claimed: zahl[1], ground: grund?.[1] });
    }
    if (!found.length) continue;

    // The token this comment talks about: named inside it, or the next one
    // declared below it, or — for a trailing comment — the one on this line.
    // Der Backtick zählt mit: Kommentare schreiben ihr Token als
    // `--color-text-subtle`, nicht als `--color-text-subtle,`. Ohne ihn fielen
    // sieben auflösbare Angaben durch und der Lauf meldete sie als „bezieht
    // sich auf eine Klasse" — und die Abhilfe, die dieser Wächter selbst
    // vorschreibt, war wörtlich eingesetzt wirkungslos (Wiederabnahme 0055).
    const named = line.match(/(--color-[a-z0-9-]+)[`,]/);
    let token = named?.[1] ?? line.match(/(--color-[a-z0-9-]+)\s*:/)?.[1] ?? null;
    for (let j = i + 1; !token && j < Math.min(i + 12, lines.length); j++) {
      token = lines[j].match(/(--color-[a-z0-9-]+)\s*:/)?.[1] ?? null;
    }

    for (const f of found) {
      out.push({
        file,
        line: i + 1,
        text: f.text,
        claimed: Number(f.claimed.replace(",", ".")),
        ground: f.ground ?? "weiss",
        token,
      });
    }
  }
  return out;
}

/**
 * **Und die Doku, nicht nur die Blätter.** Die sechste falsche Kontrastzahl
 * dieses Repos stand nicht im CSS, sondern in einer Tabelle in
 * `design-guidelines.md` — „auf `success-bg` 4.46", gerechnet gegen eine
 * Fläche, die 0112 ersetzt hatte. Kein Lauf hat sie gesehen, weil der Wächter
 * nur Stylesheets las (Abnahme 0055, dritte Runde).
 *
 * Erfasst werden hier zwei Formen, beide eindeutig:
 *
 * - die **erste Zahl** einer Zeile, die mit einem Token beginnt — sie gilt
 *   gegen Weiß, so wie die Tabellenüberschrift es sagt;
 * - **„auf `<token>` <zahl>"** an beliebiger Stelle der Zeile.
 *
 * Klammerwerte (`4.88 (4.51)` = gegen `bg-soft`) und Schrägstrich-Paare
 * (`--color-border` / `-strong`) bleiben ungeprüft und werden als solche
 * gemeldet: sie hängen an einer Überschrift zwei Zeilen höher, und ein
 * Wächter, der Prosa deutet, rät.
 */
const MARKDOWN = ["docs/design-guidelines.md"];

export function claimsAusMarkdown(lines, file = "") {
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const token = line.match(/^\|\s*`(--color-[a-z0-9-]+)`/);
    if (!token) continue;
    const zellen = line.split("|");
    if (zellen.length < 3) continue;
    const wert = zellen[2];
    // Der Grund, wo er dasteht: „auf `success-bg` 4.63".
    for (const m of wert.matchAll(/auf\s+`?(--color-)?([a-z0-9-]+)`?\s+(\d+[.,]\d+)/g)) {
      out.push({
        file,
        line: i + 1,
        text: `${m[3]} auf ${m[2]}`,
        claimed: Number(m[3].replace(",", ".")),
        ground: m[2],
        token: token[1],
      });
    }
    // Die erste Zahl der Zelle gilt gegen Weiß — es sei denn, sie steht schon
    // als Grund-Angabe darin.
    const erste = wert.match(/^\s*(\d+[.,]\d+)/);
    if (erste && !/^\s*\d+[.,]\d+\s*auf/.test(wert)) {
      out.push({
        file,
        line: i + 1,
        text: erste[1],
        claimed: Number(erste[1].replace(",", ".")),
        ground: "weiss",
        token: token[1],
      });
    }
  }
  return out;
}

/**
 * Selbstprüfung. Sie steht hier, weil dieser Wächter zweimal an seiner
 * **eigenen Anleitung** gescheitert ist: die Form, die er vorschreibt, fiel
 * durch seinen Regex und wurde still gegen Weiß gerechnet — einmal als
 * falsche Anklage, einmal als grünes Testat für eine falsche Zahl (0055,
 * Runden eins und zwei). Ein Wächter, dessen Abhilfe nicht wirkt, ist
 * schlimmer als keiner.
 */
function selbsttest() {
  let schlecht = 0;
  const pruefe = (name, ist, soll) => {
    if (JSON.stringify(ist) !== JSON.stringify(soll)) {
      schlecht++;
      console.error(`  ✗ ${name}: erwartet ${JSON.stringify(soll)}, gemessen ${JSON.stringify(ist)}`);
    }
  };
  const eine = (zeile) => {
    const c = claimsAus([zeile])[0];
    return c ? [c.claimed, c.ground, c.token] : null;
  };

  // Die Form, die der Schlusstext vorschreibt — beide Token in Backticks.
  pruefe(
    "Anleitungsform",
    eine("/* gemessen 2.87:1 (`--color-text-subtle` auf `--color-bg-soft`) */"),
    [2.87, "--color-bg-soft", "--color-text-subtle"],
  );
  pruefe(
    "Grund ohne Backtick",
    eine("/* `--color-text-subtle`: 4.51:1 auf bg-soft */"),
    [4.51, "bg-soft", "--color-text-subtle"],
  );
  pruefe("ohne Grund ist Weiß", eine("/* `--color-accent` 3.55:1 */"), [3.55, "weiss", "--color-accent"]);
  pruefe("Zahl ohne `:1` ist keine Angabe", eine("/* opacity .5 ergab 2,11 */"), null);
  pruefe("Komma wie Punkt", eine("/* `--color-text-muted` 6,69:1 */"), [6.69, "weiss", "--color-text-muted"]);
  pruefe(
    "Token erst darunter deklariert",
    (() => {
      const c = claimsAus(["  /* 4.88:1 auf Weiss */", "  --color-text-subtle: #717171;"])[0];
      return [c.claimed, c.token];
    })(),
    [4.88, "--color-text-subtle"],
  );
  pruefe(
    "zweistellige Zahl bleibt ganz",
    eine("/* den Kontrast traegt der Rahmen (--color-primary-700, 11.64:1 auf Weiss) */"),
    [11.64, "Weiss", "--color-primary-700"],
  );
  pruefe(
    "zwei Angaben in einer Zeile, je eigener Grund",
    claimsAus(["/* 5.52:1, 4.78:1 auf warning-bg */"]).map((c) => [c.claimed, c.ground]),
    [[5.52, "weiss"], [4.78, "warning-bg"]],
  );

  // Und die Markdown-Form, aus der die sechste falsche Zahl kam.
  const eineMd = (zeile) => {
    const c = claimsAusMarkdown([zeile])[0];
    return c ? [c.claimed, c.ground, c.token] : null;
  };
  pruefe(
    "Markdown: Zahl gegen Weiß",
    eineMd("| `--color-text-muted` | 6.69 | Text |"),
    [6.69, "weiss", "--color-text-muted"],
  );
  pruefe(
    "Markdown: Grund benannt",
    claimsAusMarkdown(["| `--color-success` | 5.07 (4.68); auf `success-bg` 4.63 | Text |"]).map(
      (c) => [c.claimed, c.ground],
    ),
    [[4.63, "success-bg"], [5.07, "weiss"]],
  );
  pruefe("Markdown: Zeile ohne Token", eineMd("| Kontrast | 4.5 | Schwelle |"), null);
  pruefe(
    "Markdown: Klammerwert bleibt ungeprüft",
    claimsAusMarkdown(["| `--color-text-subtle` | 4.88 (4.51) | Text |"]).length,
    1,
  );

  // Und die Rechnung selbst, gegen von Hand nachgerechnete Werte.
  const rund = (x) => Math.round(x * 1e4) / 1e4;
  pruefe("Verhältnis text-subtle auf Weiß", rund(ratio("#717171", "#FFFFFF")), 4.8807);
  pruefe("Verhältnis accent auf border-control", rund(ratio("#3B8FC4", "#8A8A8A")), 1.0289);
  pruefe("Grund über Wort auflösbar", resolveGround("bg-soft") !== null, true);
  pruefe("Grund über Token auflösbar", resolveGround("--color-border-control"), "#8A8A8A");

  if (schlecht) {
    console.error(`\ncheck:contrast — Selbstprüfung: ${schlecht} Fälle falsch.`);
    process.exit(1);
  }
  console.log("check:contrast — Selbstprüfung in Ordnung, 16 Fälle.");
  process.exit(0);
}

if (process.argv[2] === "--test") selbsttest();

const claims = [
  ...FILES.flatMap((file) => claimsAus(readFileSync(file, "utf8").split("\n"), file)),
  ...MARKDOWN.flatMap((file) => claimsAusMarkdown(readFileSync(file, "utf8").split("\n"), file)),
];

let bad = 0;
let unchecked = 0;
let unresolvedInTokens = 0;
for (const c of claims) {
  // A token declared as `rgba(...)` has no hex and is not the foreground of
  // its own claim — such a comment names the token it means (the focus ring
  // says so about the frame).
  const fg = c.token ? TOKENS.get(c.token) : null;
  const bg = resolveGround(c.ground);
  if (!fg || !bg) {
    unchecked++;
    if (c.file === FILES[0]) unresolvedInTokens++;
    console.log(
      `  ? ${c.file}:${c.line} — „${c.text}" — ${!fg ? `Token ${c.token ?? "unbekannt"}` : `Grund ${c.ground}`} nicht auflösbar`,
    );
    continue;
  }
  const actual = ratio(fg, bg);
  // Two decimals is what the comments write, so that is the tolerance.
  if (Math.abs(actual - c.claimed) > 0.005) {
    bad++;
    console.error(
      `  ✗ ${c.file}:${c.line} — ${c.token} auf ${c.ground} steht mit ${c.claimed.toFixed(2)}:1 da, gemessen ${actual.toFixed(2)}:1`,
    );
  }
}

const checked = claims.length - unchecked;
// In `tokens.css` a claim that cannot be resolved is itself a defect: the
// value stands right next to it. What stays unchecked elsewhere is what
// carries **opacity** — a full-tone computation would be a wrong answer, not
// a missing one. To make a claim checkable, name both tokens on the line of
// the number: „gemessen 2.87:1 (`--color-text-subtle` auf
// `--color-bg-soft`)" — the token two lines below does not count, the guard
// reads the line.
if (bad || unresolvedInTokens) {
  console.error(
    `\ncheck:contrast — ${bad} von ${checked} Angaben stimmen nicht${unresolvedInTokens ? `, ${unresolvedInTokens} in tokens.css lassen sich nicht auflösen` : ""}. Die Zahl im Kommentar ist die Messung; wer sie ändert, rechnet sie nach.`,
  );
  process.exit(1);
}
console.log(
  `check:contrast — in Ordnung. ${checked} Angaben nachgerechnet${
    unchecked ? `, ${unchecked} nennen ihren Ton nicht als Token und bleiben ungeprüft` : ""
  }.`,
);
