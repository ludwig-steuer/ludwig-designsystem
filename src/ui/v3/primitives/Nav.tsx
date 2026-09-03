"use client";

import { Link } from "./Link";

/**
 * v2-Navigation (F123 T123.1): Reiter, Segment-Schalter, Filter-Chips, Suche.
 *
 * Alle vier tragen einen Zustand, keiner trägt Fachwissen — Zähler, Alarme
 * und Optionen kommen als Props. `href`-Varianten funktionieren ohne
 * JavaScript; `onPick` ist die Client-Variante.
 */

export interface TabItem {
  key: string;
  label: string;
  /** Zähler rechts am Reiter — gedämpft, bei `alarm` rot und fett. */
  count?: number;
  /**
   * Punkt anstelle des Zählers (0049): es gibt etwas, aber es lässt sich
   * nicht zählen. Steht auch `count`, gewinnt die Zahl — zweimal dasselbe
   * zu sagen hilft niemandem.
   */
  dot?: boolean;
  alarm?: boolean;
  href?: string;
}

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
        const cls = `v2tab${it.key === active ? " is-active" : ""}`;
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
  /** Zähler rechts am Label — gedämpft, wie `TabItem.count`: was diese Sicht zeigt. */
  count?: number;
  href?: string;
}

/**
 * Segment-Schalter für gleichrangige Sichten auf dieselben Daten (Log).
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
 * Filter-Chips, gruppiert nach Dimension — über der Karte, nie im Kartenkopf
 * (Baukasten §6). Die Gruppen-Überschrift sagt, wonach gefiltert wird.
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
