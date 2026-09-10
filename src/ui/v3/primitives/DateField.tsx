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
  describedBy,
  onBlur,
  id,
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
  /**
   * The id of the sentence that explains the field — a limit („at most 30
   * days ahead"), a rule. Without it the sentence stands next to the field
   * and is read by everyone **except** the person who needs it most.
   */
  describedBy?: string;
  /**
   * Fires when the field is left. The place for a correction that must not
   * fight the typing: a native date input reports **every keystroke** of the
   * year, so „2026" passes through 0002, 0020 and 0202 — whoever corrects on
   * `onChange` rewrites segments the person never touched (found in the
   * review of 0024, and again in the acceptance of 0065).
   */
  onBlur?: () => void;
  /**
   * What the `htmlFor` of the surrounding `Field` points at (0104). Separate
   * from `name`: a field outside a form still needs its word bound to it.
   */
  id?: string;
  name?: string;
}) {
  return (
    <Input
      type="date"
      id={id ?? name}
      name={name}
      value={value ?? ""}
      min={min}
      max={max}
      invalid={invalid}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-describedby={describedBy}
      onChange={(e) => onChange(e.target.value || null)}
      onBlur={onBlur}
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
  id,
}: {
  from: string | null;
  to: string | null;
  /** Always both — a span is one value. */
  onChange: (from: string | null, to: string | null) => void;
  presets?: DatePreset[];
  min?: string;
  max?: string;
  disabled?: boolean;
  /**
   * What the `htmlFor` of the surrounding `Field` points at — it lands on the
   * **„von"** field: a click on the word belongs at the start of the span, and
   * a `<label>` can only ever point at one control (0104). „Bis" keeps its own
   * `ariaLabel`.
   */
  id?: string;
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
        id={id}
        value={from}
        min={min}
        max={max}
        disabled={disabled}
        // With `id` the wrapper's word names the pair ("Zeitraum"); an own
        // `aria-label` would **override** it and leave the pair unnamed
        // (accessibility tree, acceptance 0104). Without `id` the field stands
        // alone and needs its word.
        ariaLabel={id ? undefined : "Von"}
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
