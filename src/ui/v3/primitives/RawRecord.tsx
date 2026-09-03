import type { ReactNode } from "react";
import { Fragment } from "react";

import { Disclosure } from "./Disclosure";
import { Markdown } from "./Markdown";
import { Time } from "./Time";

/**
 * The row as it stands in the database (0051) — every column, nothing
 * curated, each value shown by its type.
 *
 * The point is the absence of a schema: `select *` without a whitelist, so a
 * new column appears by itself. Everything that would be an opinion about the
 * data — grouping digits, guessing markdown, sorting by importance, hiding a
 * key — is left out on purpose; see `@instead` and the spec.
 */

export type RawFormat = "auto" | "text" | "markdown" | "json" | "date" | "number";

/**
 * Above this many characters a string moves behind a fold — the value stays
 * reachable, the row stays readable.
 *
 * ponytail: module constant, not a prop. A second threshold has to be shown
 * to exist before it becomes an interface.
 */
const CLAMP = 100;

/**
 * Whole numbers in German grouping — the counts in a fold summary („12.480
 * Zeichen") and `format: "number"`. Deliberately not `formatAmount(n, null)`:
 * that is the house formatter for **amounts** and always writes two decimals,
 * and „12.480,00 Zeichen" counts nothing.
 */
const GROUPED = new Intl.NumberFormat("de-DE");

/** `^2026-08-26` or `^2026-08-26T…` — the shape Postgres writes. */
const ISO_DATE = /^\d{4}-\d{2}-\d{2}(T|$)/;

function isDate(value: string): boolean {
  return ISO_DATE.test(value) && !Number.isNaN(new Date(value).getTime());
}

/**
 * Literal `\n`, `\r\n` and `\t` become real characters. JSON-encoded LLM
 * prompts land in TEXT columns like that, and unresolved they are one endless
 * line nobody can read.
 */
function unescape(text: string): string {
  return text.replace(/\\r\\n|\\n/g, "\n").replace(/\\t/g, "\t");
}

function toJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    // A cycle is not an error here — the raw view still has to show something.
    return String(value);
  }
}

function LongText({ summary, text }: { summary: string; text: string }) {
  return (
    <Disclosure summary={summary} tone="quiet">
      <pre className="v2raw__pre">{text}</pre>
    </Disclosure>
  );
}

/**
 * One value out of a row, shown by its type.
 *
 * @when    A single raw value — in a cell of a support table, or inside
 *          `RawRecord`.
 * @instead A curated value with a German label → FieldList. An amount with a
 *          currency → Amount. A point in time in a normal view → Time.
 */
export function RawValue({ value, format = "auto" }: { value: unknown; format?: RawFormat }) {
  if (value === null || value === undefined) return <span className="v2muted">—</span>;

  if (format === "markdown") {
    return <Markdown text={unescape(String(value))} variant="full" maxHeight={480} overflow="scroll" />;
  }
  if (format === "json") {
    const json = toJson(value);
    return <LongText summary={`JSON · ${GROUPED.format(json.length)} Zeichen`} text={json} />;
  }
  if (format === "date") return <RawDate value={String(value)} />;
  if (format === "number") {
    // Grouped only where the caller says so: a raw number is an id until
    // someone claims otherwise.
    const n = typeof value === "number" ? value : Number(value);
    return <span className="v2mono">{Number.isNaN(n) ? String(value) : GROUPED.format(n)}</span>;
  }

  if (typeof value === "boolean") {
    // `true`/`false`, not „ja/nein" — these are raw data, and the DB says
    // `true`.
    return <span className="v2mono">{String(value)}</span>;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    // Ungrouped: an id is not a million.
    return <span className="v2mono">{String(value)}</span>;
  }
  if (Array.isArray(value)) {
    return <LongText summary={`Liste · ${GROUPED.format(value.length)} Einträge`} text={toJson(value)} />;
  }
  if (typeof value === "object") {
    const json = toJson(value);
    return <LongText summary={`JSON · ${GROUPED.format(json.length)} Zeichen`} text={json} />;
  }

  const text = unescape(String(value));
  if (format === "auto" && isDate(text)) return <RawDate value={text} />;

  const lines = text.split("\n").length;
  if (lines > 1 || text.length > CLAMP) {
    const summary =
      lines > 1
        ? `Text · ${GROUPED.format(text.length)} Zeichen, ${GROUPED.format(lines)} Zeilen`
        : `Text · ${GROUPED.format(text.length)} Zeichen`;
    return <LongText summary={summary} text={text} />;
  }
  return <span className="v2raw__text">{text}</span>;
}

/**
 * The raw value stays reachable in `title` — a formatted date is an
 * interpretation, and support compares what the column holds.
 */
function RawDate({ value }: { value: string }) {
  return (
    <span title={value}>
      <Time value={value} format={value.length <= 10 ? "date" : "dateTime"} />
    </span>
  );
}

/**
 * All fields of one row, alphabetically, key in mono.
 *
 * @when    „Show me the row" — support and development looking past the DTOs.
 * @instead Known fields with German labels → FieldList. Several rows of the
 *          same shape → Table. One value on its own → RawValue.
 */
export function RawRecord({
  record,
  format,
  label,
  empty = "Keine Felder.",
}: {
  /** The row. Every key is shown, alphabetically, none filtered. */
  record: Record<string, unknown>;
  /** Override per key, where detection does not reach. */
  format?: Record<string, RawFormat>;
  /** A line above the table — `#2 · id=…` with several rows of one table. */
  label?: ReactNode;
  empty?: string;
}) {
  // Alphabetical, so a field is findable without knowing the write order.
  const keys = Object.keys(record).sort();
  if (keys.length === 0) return <p className="v2raw__empty">{empty}</p>;
  return (
    <div className="v2raw">
      {label ? <div className="v2raw__label">{label}</div> : null}
      <dl className="v2raw__list">
        {keys.map((key) => (
          <Fragment key={key}>
            <dt className="v2raw__key">{key}</dt>
            <dd className="v2raw__val">
              <RawValue value={record[key]} format={format?.[key]} />
            </dd>
          </Fragment>
        ))}
      </dl>
    </div>
  );
}
