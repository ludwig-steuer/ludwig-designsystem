/**
 * F493 (K14) — Buchungstext vom Server, rein: aus den jüngsten DATEV-Sätzen desselben Kontos (Vorlage mit Platzhaltern
 * für Belegnummer und Zeitraum), sonst aus der DATEV-Kurzbezeichnung des Geschäftspartners. Wechseln die Texte, gilt
 * ein fester Präfix mit dem Partnernamen als Pflicht (der Agent ergänzt die Leistung), sonst der häufigste Text
 * (T493.7). Wo nichts trägt (Sammelkonto, Freitext-Konvention ohne Vorbuchung, keine Basis), lehnt der Server ab und
 * legt die Vergleichstexte vor. Ein Agententext wird nie überschrieben.
 */
import { normalizeBelegfeld1 } from "@/ludwig/core/datev/belegfeld";

export const POSTING_TEXT_SOURCES = ["history", "history_mode", "partner_short_name", "agent_line"] as const;
export type PostingTextSource = (typeof POSTING_TEXT_SOURCES)[number];
export const POSTING_TEXT_REJECTION_REASONS = [
  "collective_account",
  "missing_document_number",
  "convention_not_applicable",
  "no_basis",
] as const;
export type PostingTextRejectionReason = (typeof POSTING_TEXT_REJECTION_REASONS)[number];
export const PERIOD_STYLES = ["year_month_underscore", "month_year4_slash", "month_year2_slash", "month_name"] as const;
export type PeriodStyle = (typeof PERIOD_STYLES)[number];

/** DATEV-Buchungstext, EXTF-Feld 14. */
const MAX_POSTING_TEXT = 60;
/** Kürzere Belegnummern kommen zu leicht zufällig im Text vor. */
const MIN_DOCUMENT_NUMBER_IN_TEXT = 4;

export interface PostingTextHistoryRow {
  /** ISO-Datum. */
  bookingDate: string;
  text: string;
  documentNumber: string | null;
}

const MONTHS_FULL = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
] as const;
const MONTHS_ABBR = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"] as const;
/** Schreibweisen → Monat (1–12) und Form; „Maerz“ gilt als volle Form. */
const MONTH_SPELLINGS: ReadonlyArray<readonly [string, number, "full" | "abbr"]> = [
  ...MONTHS_FULL.map((m, i) => [m, i + 1, "full"] as const),
  ...MONTHS_ABBR.map((m, i) => [m, i + 1, "abbr"] as const).filter(([m]) => m !== "Mai"),
  ["Maerz", 3, "full"],
  ["Mrz", 3, "abbr"],
  ["Sept", 9, "abbr"],
];
const monthSpelling = (raw: string) => MONTH_SPELLINGS.find(([s]) => s.toLowerCase() === raw.toLowerCase());

const BEFORE = String.raw`(?<![\p{L}\d./-])`;
const AFTER = String.raw`(?![\p{L}\d./-])`;
const MONTH_ALTERNATION = [...MONTH_SPELLINGS.map(([s]) => s)].sort((a, b) => b.length - a.length).join("|");

const monthIndex = (year: number, month: number) => year * 12 + (month - 1);
const isoMonthIndex = (iso: string) => monthIndex(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)));
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Rohtext → Vorlage: Belegnummer → `{document_number}`, Zeitraum-Tokens → `{period:<style>[:…]:<offset>}`. */
export function postingTextTemplate(row: PostingTextHistoryRow): string {
  let text = row.text;
  const doc = normalizeBelegfeld1(row.documentNumber);
  if (
    doc &&
    doc !== "0" &&
    !/^l-/i.test(doc) &&
    doc.length >= MIN_DOCUMENT_NUMBER_IN_TEXT &&
    text.toLowerCase().includes(doc.toLowerCase())
  ) {
    text = text.replace(new RegExp(escapeRegex(doc), "gi"), "{document_number}");
  }
  const base = isoMonthIndex(row.bookingDate);
  const offset = (year: number, month: number) => monthIndex(year, month) - base;
  text = text.replace(new RegExp(`${BEFORE}(20\\d{2})_(0[1-9]|1[0-2])${AFTER}`, "giu"), (_m, y: string, mo: string) =>
    `{period:year_month_underscore:${offset(Number(y), Number(mo))}}`,
  );
  text = text.replace(new RegExp(`${BEFORE}(0[1-9]|1[0-2])/(20\\d{2})${AFTER}`, "giu"), (_m, mo: string, y: string) =>
    `{period:month_year4_slash:${offset(Number(y), Number(mo))}}`,
  );
  text = text.replace(new RegExp(`${BEFORE}(0[1-9]|1[0-2])/(\\d{2})${AFTER}`, "giu"), (_m, mo: string, yy: string) =>
    `{period:month_year2_slash:${offset(2000 + Number(yy), Number(mo))}}`,
  );
  text = text.replace(
    new RegExp(`${BEFORE}(${MONTH_ALTERNATION})(\\.?)\\s+(20\\d{2}|\\d{2})${AFTER}`, "giu"),
    (_m, name: string, dot: string, y: string) => {
      const [, month, form] = monthSpelling(name)!;
      const year = y.length === 4 ? Number(y) : 2000 + Number(y);
      return `{period:month_name:${form}:${dot ? "dot" : "nodot"}:${y.length === 4 ? "y4" : "y2"}:${offset(year, month)}}`;
    },
  );
  return text;
}

/** Auf 60 Zeichen kappen: am letzten Leerzeichen, ohne Leerzeichen hart. */
function capPostingText(text: string): string {
  if (text.length <= MAX_POSTING_TEXT) return text;
  const cut = text.slice(0, MAX_POSTING_TEXT + 1).lastIndexOf(" ");
  return (cut > 0 ? text.slice(0, cut) : text.slice(0, MAX_POSTING_TEXT)).trimEnd();
}

const PERIOD_PLACEHOLDER = /\{period:([a-z0-9_]+)(?::(full|abbr):(dot|nodot):(y4|y2))?:(-?\d+)\}/g;

/** Vorlage → Text für einen Satz; null, wenn die Vorlage eine Belegnummer braucht und der Satz keine hat. */
export function renderPostingTextTemplate(
  template: string,
  opts: { bookingDate: string; documentNumber: string | null },
): string | null {
  let text = template;
  if (text.includes("{document_number}")) {
    const doc = opts.documentNumber?.trim();
    if (!doc || doc === "0" || /^l-/i.test(doc)) return null;
    text = text.split("{document_number}").join(doc);
  }
  const base = isoMonthIndex(opts.bookingDate);
  text = text.replace(PERIOD_PLACEHOLDER, (_m, style: string, form: string, dot: string, yl: string, off: string) => {
    const index = base + Number(off);
    const year = Math.floor(index / 12);
    const month = (index % 12) + 1;
    const mm = String(month).padStart(2, "0");
    const yy = String(year % 100).padStart(2, "0");
    switch (style as PeriodStyle) {
      case "year_month_underscore":
        return `${year}_${mm}`;
      case "month_year4_slash":
        return `${mm}/${year}`;
      case "month_year2_slash":
        return `${mm}/${yy}`;
      case "month_name":
        return `${(form === "full" ? MONTHS_FULL : MONTHS_ABBR)[month - 1]}${dot === "dot" ? "." : ""} ${yl === "y4" ? year : yy}`;
    }
  });
  return capPostingText(text);
}

/** DATEV-Kurzbezeichnung (max. 15 Zeichen); hart abgeschnittene Firmierung → volle Firmierung. */
export function partnerPostingLabel(partner: { shortName: string | null; legalName: string | null }): string | null {
  const short = partner.shortName?.trim();
  if (!short) return null;
  const legal = partner.legalName?.trim() ?? "";
  if (legal.length > 15 && short === legal.slice(0, 15)) return capPostingText(legal);
  return short;
}

export interface PostingTextInput {
  bookingDate: string;
  documentNumber: string | null;
  collectiveAccountNumber: string | null;
  /** Neueste zuerst, höchstens 5. */
  history: PostingTextHistoryRow[];
  convention: string | null;
  partner: { shortName: string | null; legalName: string | null } | null;
  /** Gegenpartei ohne Partner-Stammdatum (Kontenmenge, Bank) — zählt für den festen Präfix wie ein Name. */
  counterpartyName?: string | null;
}

export type PostingTextDerivation =
  | { kind: "derived"; text: string; source: "history" | "history_mode" | "partner_short_name"; comparisons: string[] }
  | { kind: "prefix_required"; prefix: string; comparisons: string[] }
  | {
      kind: "rejected";
      reason: PostingTextRejectionReason;
      comparisons: string[];
      convention: string | null;
      collectiveAccountNumber: string | null;
    };

const isWordChar = (c: string | undefined) => c != null && /[\p{L}\p{N}]/u.test(c);

/**
 * T493.7 — fester Präfix der Vergleichstexte: gemeinsamer Anfang bis zu einer Wortgrenze, der einen Namen der
 * Gegenpartei enthält, und nach dem jeder Text noch weitergeht (wechselnder Rest). Sonst null.
 */
export function fixedPostingTextPrefix(texts: readonly string[], names: ReadonlyArray<string | null | undefined>): string | null {
  if (texts.length < 2) return null;
  let prefix = texts[0]!;
  for (const t of texts) while (!t.startsWith(prefix)) prefix = prefix.slice(0, -1);
  const atBoundary = !isWordChar(prefix.at(-1)) || texts.every((t) => !isWordChar(t[prefix.length]));
  if (!atBoundary) {
    const chars = [...prefix];
    let cut = chars.length - 1;
    while (cut >= 0 && isWordChar(chars[cut])) cut--;
    prefix = cut >= 0 ? chars.slice(0, cut + 1).join("") : "";
  }
  if (!prefix.trim()) return null;
  if (!texts.every((t) => t.slice(prefix.length).trim().length > 0)) return null;
  const lower = prefix.toLowerCase();
  const named = names.some((n) => n != null && n.trim().length > 0 && lower.includes(n.trim().toLowerCase()));
  return named ? prefix : null;
}

/** T493.7 — häufigste Vorlage der Vergleichstexte; bei Gleichstand die jüngste (Reihenfolge = neueste zuerst). */
function mostFrequentRow(history: readonly PostingTextHistoryRow[]): PostingTextHistoryRow {
  const templates = history.map(postingTextTemplate);
  let best = 0;
  let bestCount = 0;
  templates.forEach((t, i) => {
    const count = templates.filter((x) => x === t).length;
    if (count > bestCount) {
      best = i;
      bestCount = count;
    }
  });
  return history[best]!;
}

export const POSTING_TEXT_PREFIX_CODE = "B8_POSTING_TEXT_PREFIX";

/**
 * T493.7 — Agententexte gegen den festen Präfix: jeder Text muss mit ihm beginnen. Befund im Format einer
 * Guard-Verletzung (Blocker), sonst null.
 */
export function agentPostingTextPrefixViolation(
  agentTexts: readonly string[],
  prefix: string,
  comparisons: readonly string[],
): { code: string; severity: "block"; message: string; fix: string } | null {
  const wrong = agentTexts.filter((t) => !t.trim().startsWith(prefix.trimEnd()));
  if (wrong.length === 0) return null;
  return {
    code: POSTING_TEXT_PREFIX_CODE,
    severity: "block",
    message:
      `Buchungstext muss mit dem festen Präfix „${prefix}“ beginnen, gesendet: ${wrong.map((t) => `„${t}“`).join(" · ")}. ` +
      `Die letzten Sätze lauten: ${comparisons.map((t) => `„${t}“`).join(" · ")}.`,
    fix: `line_text = „${prefix}“ + Leistung aus dem Beleg (max. 60 Zeichen).`,
  };
}

/**
 * Erste passende Stufe gewinnt: Sammelkonto → Historie (gleiche Vorlage; sonst fester Präfix; sonst häufigster Text)
 * → Konvention → Kurzname → keine Basis.
 */
export function derivePostingText(input: PostingTextInput): PostingTextDerivation {
  const comparisons = input.history.map((h) => h.text);
  const reject = (reason: PostingTextRejectionReason): PostingTextDerivation => ({
    kind: "rejected",
    reason,
    comparisons,
    convention: input.convention,
    collectiveAccountNumber: input.collectiveAccountNumber,
  });
  if (input.collectiveAccountNumber) return reject("collective_account");
  const [newest, previous] = input.history;
  if (newest) {
    const variable = previous != null && postingTextTemplate(previous) !== postingTextTemplate(newest);
    if (variable) {
      const prefix = fixedPostingTextPrefix(comparisons, [
        input.partner?.shortName,
        input.partner?.legalName,
        input.partner ? partnerPostingLabel(input.partner) : null,
        input.counterpartyName,
      ]);
      if (prefix) return { kind: "prefix_required", prefix, comparisons };
    }
    const source = variable ? "history_mode" : "history";
    const template = postingTextTemplate(variable ? mostFrequentRow(input.history) : newest);
    const text = renderPostingTextTemplate(template, { bookingDate: input.bookingDate, documentNumber: input.documentNumber });
    return text == null ? reject("missing_document_number") : { kind: "derived", text, source, comparisons };
  }
  if (input.convention?.trim()) return reject("convention_not_applicable");
  const label = input.partner ? partnerPostingLabel(input.partner) : null;
  if (label) return { kind: "derived", text: label, source: "partner_short_name", comparisons };
  return reject("no_basis");
}

/** Füllt Zeilen ohne Text; Rückgabe: deren Nummern (1-basiert). */
export function applyPostingText(lines: Array<{ lineText?: string | null }>, text: string): number[] {
  const filled: number[] = [];
  lines.forEach((line, i) => {
    if (line.lineText?.trim()) return;
    line.lineText = text;
    filled.push(i + 1);
  });
  return filled;
}
