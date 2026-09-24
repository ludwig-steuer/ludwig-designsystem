"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { FiscalYearListItem } from "@/ludwig/modules/cycles/domain/cycle";
import { ActionIcon } from "../Icons";
import { formatTime, formatTimeRange } from "../format";
import type { DatePreset } from "./DateField";
import { Segmented } from "./Nav";
import { Popover } from "./Popover";
import { DateRange } from "./Time";
import { TextButton } from "./TextButton";

/**
 * Month, span of months, quarter, fiscal year — as a filter (0196).
 *
 * The value is a span of **days**, `from`/`to` in ISO, exactly like
 * `DateRangeField`: the list behind it filters by date anyway, and a page can
 * swap one field for the other without touching its query. The unit is not
 * stored; it is read back from the span (`periodOf`).
 *
 * Not `<input type="month">`: Firefox and desktop Safari draw a text field for
 * it.
 */

export type PeriodUnit = "month" | "months" | "quarter" | "fiscalYear";
export type FiscalYearSpan = Pick<FiscalYearListItem, "year" | "startDate" | "endDate">;

const UNIT_LABEL: Record<PeriodUnit, string> = {
  month: "Monat",
  months: "Zeitraum",
  quarter: "Quartal",
  // „WJ" as on the trigger („WJ 2025/26"); the full word does not fit four tabs.
  fiscalYear: "WJ",
};
const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

/* ── Arithmetic on `YYYY-MM` ────────────────────────────────────────────── */

const ym = (year: number, month0: number) => `${year}-${String(month0 + 1).padStart(2, "0")}`;
const yearOf = (m: string) => Number(m.slice(0, 4));
const firstDay = (m: string) => `${m}-01`;
function lastDay(m: string): string {
  const days = new Date(Date.UTC(yearOf(m), Number(m.slice(5, 7)), 0)).getUTCDate();
  return `${m}-${String(days).padStart(2, "0")}`;
}
const isFirst = (d: string) => d.slice(8) === "01";
const isLast = (d: string) => lastDay(d.slice(0, 7)) === d;
const monthsBetween = (a: string, b: string) =>
  (yearOf(b) - yearOf(a)) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7));

function fiscalLabel(fy: FiscalYearSpan): string {
  const a = fy.startDate.slice(0, 4);
  const b = fy.endDate.slice(0, 4);
  return a === b ? `WJ ${a}` : `WJ ${a}/${b.slice(2)}`;
}

/**
 * What a span is, and how it is said.
 *
 * Precedence on ambiguity: fiscal year before quarter before months — a
 * calendar fiscal year 2026 is also Jan–Dec 2026 and is called „WJ 2026".
 *
 * @when    Naming a filtered period outside the field — a card head, a
 *          summary of set filters.
 * @instead Drawing a span → DateRange.
 */
export function periodOf(
  from: string | null,
  to: string | null,
  fiscalYears: readonly FiscalYearSpan[] = [],
): { unit: PeriodUnit | null; label: string } | null {
  if (!from || !to) return null;
  const fy = fiscalYears.find((f) => f.startDate === from && f.endDate === to);
  if (fy) return { unit: "fiscalYear", label: fiscalLabel(fy) };
  if (!isFirst(from) || !isLast(to) || to < from) {
    return { unit: null, label: formatTimeRange(from, to, "date") };
  }
  const span = monthsBetween(from.slice(0, 7), to.slice(0, 7));
  if (span === 0) return { unit: "month", label: formatTime(from, "month") };
  const m = Number(from.slice(5, 7));
  if (span === 2 && (m - 1) % 3 === 0) {
    return { unit: "quarter", label: `Q${(m + 2) / 3} ${from.slice(0, 4)}` };
  }
  return { unit: "months", label: formatTimeRange(from, to, "month") };
}

/* ── Panel ──────────────────────────────────────────────────────────────── */

interface PanelProps {
  /** First day, ISO. */
  from: string | null;
  /** Last day, ISO. */
  to: string | null;
  /** Always both, like `DateRangeField`; the month's end is computed here. */
  onChange?: (from: string | null, to: string | null) => void;
  /** Which units stand on top; one alone shows no switch. */
  units?: readonly PeriodUnit[];
  /** The client's fiscal years; without them the unit „fiscalYear" drops out. */
  fiscalYears?: readonly FiscalYearSpan[];
  /** `YYYY-MM`; months outside are locked, the year does not page past them. */
  min?: string;
  max?: string;
  /** Quick picks under the grid — the same type as at `DateRangeField`. */
  presets?: readonly DatePreset[];
}

/**
 * @when    Choosing a period of whole months, quarters or fiscal years inline —
 *          a report head, a settings page; in a filter bar → PeriodField.
 * @instead Days → DateRangeField. Jumping to a month in a long list →
 *          PeriodJump.
 */
export function PeriodPanel({
  from,
  to,
  onChange,
  units = ["month", "months"],
  fiscalYears = [],
  min,
  max,
  presets,
}: PanelProps) {
  const shown = units.filter((u) => u !== "fiscalYear" || fiscalYears.length > 0);
  const current = periodOf(from, to, fiscalYears);
  const [unit, setUnit] = useState<PeriodUnit>(
    current?.unit && shown.includes(current.unit) ? current.unit : (shown[0] ?? "month"),
  );
  const today = ym(new Date().getFullYear(), new Date().getMonth());
  const [year, setYear] = useState(yearOf(from ?? (max && max < today ? max : today)));
  const [anchor, setAnchor] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [focus, setFocus] = useState(() => (from && yearOf(from) === year ? Number(from.slice(5, 7)) - 1 : 0));
  const grid = useRef<HTMLDivElement>(null);
  const moved = useRef(false);

  // Roving focus follows the arrow keys — only after a key, not on render.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    grid.current?.querySelector<HTMLElement>(`[data-i="${focus}"]`)?.focus();
  }, [focus, year]);

  const minYear = min ? yearOf(min) : -Infinity;
  const maxYear = max ? yearOf(max) : Infinity;
  const locked = (m: string) => (min !== undefined && m < min) || (max !== undefined && m > max);
  const aligned = current?.unit != null && current.unit !== "fiscalYear";

  function pickMonth(m: string) {
    if (unit === "month") return onChange?.(firstDay(m), lastDay(m));
    if (!anchor) {
      setAnchor(m);
      return;
    }
    const [a, b] = anchor <= m ? [anchor, m] : [m, anchor];
    setAnchor(null);
    setHover(null);
    onChange?.(firstDay(a), lastDay(b));
  }

  function inRange(m: string): boolean {
    if (anchor) {
      const end = hover ?? anchor;
      const [a, b] = anchor <= end ? [anchor, end] : [end, anchor];
      return m >= a && m <= b;
    }
    return aligned && !!from && !!to && m >= from.slice(0, 7) && m <= to.slice(0, 7);
  }

  function onGridKey(e: KeyboardEvent) {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -4, ArrowDown: 4 };
    if (e.key in step) {
      e.preventDefault();
      moved.current = true;
      const next = focus + step[e.key]!;
      if (next < 0 && year > minYear) {
        setYear(year - 1);
        setFocus(next + 12);
      } else if (next > 11 && year < maxYear) {
        setYear(year + 1);
        setFocus(next - 12);
      } else {
        setFocus(Math.max(0, Math.min(11, next)));
      }
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      moved.current = true;
      setYear((y) => Math.max(minYear, Math.min(maxYear, y + (e.key === "PageUp" ? -1 : 1))));
    } else if (e.key === "Escape" && anchor) {
      // The first click is dropped, the field stays open.
      e.preventDefault();
      e.stopPropagation();
      setAnchor(null);
      setHover(null);
    }
  }

  const yearNav = (
    <div className="v3pfld__year">
      <button
        type="button"
        className="v3pfld__step"
        aria-label="Voriges Jahr"
        disabled={year <= minYear}
        onClick={() => setYear(year - 1)}
      >
        <ActionIcon action="back" />
      </button>
      <span aria-live="polite">{year}</span>
      <button
        type="button"
        className="v3pfld__step"
        aria-label="Nächstes Jahr"
        disabled={year >= maxYear}
        onClick={() => setYear(year + 1)}
      >
        <ActionIcon action="forward" />
      </button>
    </div>
  );

  return (
    <div className="v3pfld">
      {shown.length > 1 ? (
        <Segmented
          ariaLabel="Einheit"
          active={unit}
          onPick={(k) => {
            setUnit(k as PeriodUnit);
            setAnchor(null);
          }}
          options={shown.map((u) => ({ key: u, label: UNIT_LABEL[u] }))}
        />
      ) : null}

      {unit === "month" || unit === "months" ? (
        <>
          {yearNav}
          <div
            ref={grid}
            role="grid"
            aria-label={unit === "month" ? `Monat wählen, ${year}` : `Zeitraum wählen, ${year}`}
            className="v3pfld__grid"
            onKeyDown={onGridKey}
            onMouseLeave={() => setHover(null)}
          >
            {[0, 1, 2].map((r) => (
              <div role="row" key={r} className="v3pfld__row">
                {[0, 1, 2, 3].map((c) => {
                  const i = r * 4 + c;
                  const m = ym(year, i);
                  const on = inRange(m);
                  const ends = anchor === m || (!anchor && aligned && (from?.startsWith(m) || to?.startsWith(m)));
                  return (
                    <button
                      key={m}
                      type="button"
                      role="gridcell"
                      data-i={i}
                      tabIndex={i === focus ? 0 : -1}
                      aria-selected={on}
                      aria-label={formatTime(firstDay(m), "month")}
                      disabled={locked(m)}
                      className={`v3pfld__cell${on ? " is-in" : ""}${ends ? " is-end" : ""}${m === today ? " is-today" : ""}`}
                      onMouseEnter={() => anchor && setHover(m)}
                      onFocus={() => setFocus(i)}
                      onClick={() => pickMonth(m)}
                    >
                      {MONTHS[i]}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          {unit === "months" ? (
            <p className="v3pfld__note">
              {anchor
                ? `Ab ${formatTime(firstDay(anchor), "month")} — jetzt den letzten Monat wählen.`
                : "Ersten und letzten Monat anklicken."}
            </p>
          ) : null}
        </>
      ) : null}

      {unit === "quarter" ? (
        <>
          {yearNav}
          <div className="v3pfld__quarters">
            {[0, 1, 2, 3].map((q) => {
              const a = ym(year, q * 3);
              const b = ym(year, q * 3 + 2);
              const on = current?.unit === "quarter" && from === firstDay(a);
              return (
                <button
                  key={q}
                  type="button"
                  aria-pressed={on}
                  disabled={locked(a) && locked(b)}
                  className={`v3pfld__cell v3pfld__quarter${on ? " is-in is-end" : ""}`}
                  onClick={() => onChange?.(firstDay(a), lastDay(b))}
                >
                  <strong>Q{q + 1}</strong>
                  <span>
                    {MONTHS[q * 3]}–{MONTHS[q * 3 + 2]}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {unit === "fiscalYear" ? (
        <div className="v3pfld__fys">
          {[...fiscalYears]
            .sort((a, b) => b.startDate.localeCompare(a.startDate))
            .map((fy) => {
              const on = from === fy.startDate && to === fy.endDate;
              return (
                <button
                  key={fy.startDate}
                  type="button"
                  aria-pressed={on}
                  className={`v3pfld__fy${on ? " is-in is-end" : ""}`}
                  onClick={() => onChange?.(fy.startDate, fy.endDate)}
                >
                  <strong>{fiscalLabel(fy)}</strong>
                  <DateRange from={fy.startDate} to={fy.endDate} size="sm" />
                </button>
              );
            })}
        </div>
      ) : null}

      <div className="v3pfld__foot">
        {presets?.map((p) => (
          <TextButton key={p.key} tone="quiet" onClick={() => onChange?.(p.from, p.to)}>
            {p.label}
          </TextButton>
        ))}
        {from || to ? (
          <TextButton tone="quiet" onClick={() => onChange?.(null, null)}>
            Alle Zeiträume
          </TextButton>
        ) : null}
      </div>
    </div>
  );
}

/* ── Field ──────────────────────────────────────────────────────────────── */

/**
 * @when    Filtering a list by month, span of months, quarter or fiscal year —
 *          above the card in a FilterBar.
 * @instead Days → DateRangeField. Inline without a trigger → PeriodPanel.
 *          Jumping to a month in a long list → PeriodJump. A time of day is
 *          never picked, only read → Time / DateRange.
 */
export function PeriodField({
  label = "Zeitraum",
  name,
  disabled,
  onChange,
  ...panel
}: PanelProps & {
  /** The word on the trigger. */
  label?: string;
  /** Server form: two hidden fields `${name}From` and `${name}To`. */
  name?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const fields = useRef<HTMLSpanElement>(null);
  const key = `${panel.from ?? ""}|${panel.to ?? ""}`;
  const firstKey = useRef(key);

  // Heard by `FilterBar autoSubmit` (0200): hidden fields fire no `change` of
  // their own. Not on the first render.
  useEffect(() => {
    if (key === firstKey.current) return;
    firstKey.current = key;
    fields.current?.dispatchEvent(new Event("change", { bubbles: true }));
  }, [key]);
  const current = periodOf(panel.from, panel.to, panel.fiscalYears);

  // Into the field once it is shown: the month in reach, else the first button.
  useEffect(() => {
    if (!open) return;
    const d = dialog.current;
    (d?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]') ?? d?.querySelector<HTMLElement>("button"))?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <>
      {name ? (
        <span ref={fields} hidden>
          <input type="hidden" name={`${name}From`} value={panel.from ?? ""} />
          <input type="hidden" name={`${name}To`} value={panel.to ?? ""} />
        </span>
      ) : null}
      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button
            ref={trigger}
            type="button"
            className={`v2in v3msel__trigger${current ? " is-set" : ""}`}
            aria-haspopup="dialog"
            disabled={disabled}
          >
            <span className="v3msel__label">{label}:</span>
            <span className="v3msel__value">{current?.label ?? "Alle Zeiträume"}</span>
            <ActionIcon action="expand" size={14} className="v3msel__chevron" />
          </button>
        }
      >
        <div
          ref={dialog}
          role="dialog"
          aria-label={label}
          onKeyDown={(e) => {
            if (e.key === "Escape" && !e.defaultPrevented) {
              e.preventDefault();
              close();
            }
          }}
        >
          {/* Mounted only while open, so it starts from the current value each time. */}
          {open ? (
            <PeriodPanel
              {...panel}
              onChange={(f, t) => {
                onChange?.(f, t);
                close();
              }}
            />
          ) : null}
        </div>
      </Popover>
    </>
  );
}
