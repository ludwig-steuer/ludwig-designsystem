"use client";

import { Select } from "./Form";
import { Link } from "./Link";

/**
 * Navigation (F123 T123.1): tabs, segmented control, filter chips, search. All
 * four carry state, none carries domain knowledge. `href` variants work without
 * JavaScript; `onPick` is the client variant.
 */

interface TabItemBase {
  key: string;
  label: string;
  href?: string;
}

/**
 * A tab — loud or quiet, never both.
 *
 * The union separates the two kinds: either the tab draws attention to itself
 * (counter, dot, alarm), or it holds back (`quiet`). A quiet tab with a red
 * counter would be a contradiction — `alarm` says „look here", `quiet` says
 * „later".
 *
 * The exclusion lives in the **type**, not as a sentence in the JSDoc. That is
 * the lesson from 0121/0122: an exclusion in a comment is broken by the first
 * caller who does not read the comment, and the typechecker says nothing.
 */
export type TabItem = TabItemBase &
  (
    | {
        /**
         * The tab sits on the debug level (A7 `neutral`) and demands nothing:
         * **resting colour one step back**, identical otherwise. Same height,
         * same hit area, same hover, same focus ring, same active underline.
         *
         * Built for „Rohdaten", the last tab of every detail page (D12):
         * visible to everyone, but not as important as „Positionen". Being
         * visible is not the same as being prominent.
         */
        quiet: true;
        count?: never;
        dot?: never;
        alarm?: never;
      }
    | {
        quiet?: never;
        /** Counter at the right of the tab — muted, red and bold with `alarm`. */
        count?: number;
        /**
         * A dot instead of the counter (0049): there is something, but it
         * cannot be counted. With `count` as well the number wins — saying the
         * same thing twice helps nobody.
         */
        dot?: boolean;
        alarm?: boolean;
      }
  );

/**
 * @when    Views with their own content, one active; counter and alarm on the tab.
 * @instead Same data, different order or density → Segmented. Narrowing down → FilterChips.
 */
export function Tabs({
  items,
  active,
  ariaLabel,
  onPick,
}: {
  items: TabItem[];
  active: string;
  ariaLabel: string;
  onPick?: (key: string) => void;
}) {
  return (
    <div className="v2tabs" role="tablist" aria-label={ariaLabel}>
      {items.map((it) => {
        const cls = `v2tab${it.key === active ? " is-active" : ""}${it.quiet ? " is-quiet" : ""}`;
        const body = (
          <>
            {it.label}
            {it.count !== undefined ? (
              <span className={`n${it.alarm && it.count > 0 ? " is-alarm" : ""}`}>{it.count}</span>
            ) : it.dot ? (
              <span className={`v2tab__dot${it.alarm ? " is-alarm" : ""}`} aria-hidden="true" />
            ) : null}
          </>
        );
        return it.href ? (
          <Link
            key={it.key}
            href={it.href}
            className={cls}
            role="tab"
            aria-selected={it.key === active}
          >
            {body}
          </Link>
        ) : (
          <button
            key={it.key}
            type="button"
            className={cls}
            role="tab"
            aria-selected={it.key === active}
            onClick={() => onPick?.(it.key)}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}

export interface SegmentOption {
  key: string;
  label: string;
  /** Count at the label's right — muted, like `TabItem.count`. */
  count?: number;
  href?: string;
}

/**
 * Segmented control for equal views of the same data (log).
 *
 * @when    Equal views of the same data (log: by time, by owner), with a
 *          count per view where the views differ in size.
 * @instead Views with their own content → Tabs.
 */
export function Segmented({
  options,
  active,
  ariaLabel,
  onPick,
}: {
  options: SegmentOption[];
  active: string;
  ariaLabel: string;
  onPick?: (key: string) => void;
}) {
  return (
    <div className="v2seg" role="group" aria-label={ariaLabel}>
      {options.map((o) => {
        const cls = `v2seg__btn${o.key === active ? " is-active" : ""}`;
        const body = (
          <>
            {o.label}
            {o.count === undefined ? null : <span className="n">{o.count}</span>}
          </>
        );
        return o.href ? (
          <Link key={o.key} href={o.href} className={cls} aria-current={o.key === active}>
            {body}
          </Link>
        ) : (
          <button
            key={o.key}
            type="button"
            className={cls}
            aria-pressed={o.key === active}
            onClick={() => onPick?.(o.key)}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}

export interface ChipOption {
  key: string;
  label: string;
  count?: number;
  href?: string;
}

/**
 * Filter chips grouped by dimension — above the card, never in its head (§6).
 * The group heading says what is filtered by.
 *
 * @when    Narrowing down by dimension, above the card.
 * @instead In the card header. Full text → SearchInput.
 */
export function FilterChips({
  label,
  options,
  active,
  onPick,
}: {
  label: string;
  options: ChipOption[];
  active: string;
  onPick?: (key: string) => void;
}) {
  return (
    <div className="v2chips">
      <span className="v2chips__label">{label}</span>
      {options.map((o) => {
        const cls = `v2chip${o.key === active ? " is-active" : ""}`;
        const body = (
          <>
            {o.label}
            {o.count === undefined ? null : <span className="n">{o.count}</span>}
          </>
        );
        return o.href ? (
          <Link key={o.key} href={o.href} className={cls} aria-current={o.key === active}>
            {body}
          </Link>
        ) : (
          <button
            key={o.key}
            type="button"
            className={cls}
            aria-pressed={o.key === active}
            onClick={() => onPick?.(o.key)}
          >
            {body}
          </button>
        );
      })}
    </div>
  );
}

/**
 * @when    Full-text search across the rows of a card.
 * @instead A field with candidates → Combobox. A filter over a list →
 *          FilterBar.
 */
export function SearchInput({
  placeholder,
  value,
  onChange,
  ariaLabel,
}: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <input
      type="search"
      className="v2in v2search"
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/**
 * The „50 je Seite" chooser next to the page numbers (0057).
 *
 * It lives here and not in `Pagination` for one reason: `Pagination` takes
 * `buildHref` as a function and therefore has to stay a Server-Component. A
 * `<select>` that jumps on change needs a client boundary, so the two cannot
 * share a file. `Pagination` computes the targets and passes them as plain
 * strings — nothing but data crosses the border.
 *
 * @when    Next to a `Pagination`, when the page offers more than one page size.
 * @instead Switching between views → Segmented. Narrowing the rows → FilterChips.
 */
export function PageSizeSelect({
  value,
  options,
  label = "je Seite",
}: {
  value: number;
  /** Every size with the URL it leads to — the caller resets `page` in it. */
  options: { size: number; href: string }[];
  label?: string;
}) {
  const id = `pagesize-${value}`;
  return (
    <span className="pag__size">
      <Select
        id={id}
        value={value}
        aria-label={`Zeilen ${label}`}
        onChange={(e) => {
          const hit = options.find((o) => String(o.size) === e.target.value);
          if (hit) window.location.assign(hit.href);
        }}
      >
        {options.map((o) => (
          <option key={o.size} value={o.size}>
            {o.size}
          </option>
        ))}
      </Select>
      <label htmlFor={id}>{label}</label>
    </span>
  );
}
