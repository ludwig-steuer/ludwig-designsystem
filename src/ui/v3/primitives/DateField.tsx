"use client";

import type { FocusEvent } from "react";

import { Input } from "./Form";
import { TextButton } from "./TextButton";

/**
 * Date and date range (0024).
 *
 * The browser draws the calendar — it is more accessible than any rebuild, and
 * it already shows `26.08.2026` in a German browser while handing out
 * `2026-08-26`. A date here is a calendar day, not a point in time: no clock,
 * no time zone.
 */

export interface DatePreset {
  key: string;
  /** „Vormonat", „Laufendes Wirtschaftsjahr" — German, from the caller. */
  label: string;
  from: string;
  to: string;
}

/**
 * @when    One calendar day — document date, due date, cut-off.
 * @instead A span → DateRangeField. A point in time with a clock → the native
 *          `datetime-local` at the call site.
 */
export function DateField({
  value,
  onChange,
  min,
  max,
  invalid,
  disabled,
  ariaLabel,
  name,
}: {
  /** ISO `yyyy-mm-dd`, or `null` for empty. */
  value: string | null;
  onChange: (value: string | null) => void;
  min?: string;
  max?: string;
  invalid?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  name?: string;
}) {
  return (
    <Input
      type="date"
      id={name}
      name={name}
      value={value ?? ""}
      min={min}
      max={max}
      invalid={invalid}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value || null)}
    />
  );
}

/**
 * @when    A span — filter bar, report, „from … to …".
 * @instead A single day → DateField.
 */
export function DateRangeField({
  from,
  to,
  onChange,
  presets,
  min,
  max,
  disabled,
}: {
  from: string | null;
  to: string | null;
  /** Always both — a span is one value. */
  onChange: (from: string | null, to: string | null) => void;
  presets?: DatePreset[];
  min?: string;
  max?: string;
  disabled?: boolean;
}) {
  // `to` before `from` is a typo, not a statement: swap it instead of
  // producing an error message nobody asked for. But **only once the pair is
  // left**: a native date input reports every keystroke of the year, so
  // "2026" passes through 0002, 0020 and 0202 — and a swap on each of them
  // made the two values jump between the fields while someone was still
  // typing (found in the review of 0024).
  function swapIfInverted(e: FocusEvent<HTMLDivElement>) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    if (from && to && to < from) onChange(to, from);
  }

  return (
    <div className="v2date" onBlur={swapIfInverted}>
      <DateField
        value={from}
        min={min}
        max={max}
        disabled={disabled}
        ariaLabel="Von"
        onChange={(v) => onChange(v, to)}
      />
      <span className="v2date__sep">bis</span>
      <DateField
        value={to}
        min={min}
        max={max}
        disabled={disabled}
        ariaLabel="Bis"
        onChange={(v) => onChange(from, v)}
      />
      {presets && presets.length > 0 ? (
        <span className="v2date__presets">
          {presets.map((p) => (
            <TextButton
              key={p.key}
              tone="quiet"
              onClick={() => onChange(p.from, p.to)}
              disabled={disabled}
            >
              {p.label}
            </TextButton>
          ))}
        </span>
      ) : null}
    </div>
  );
}
