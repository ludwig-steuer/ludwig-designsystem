"use client";

/**
 * One out of a few named ways (0017).
 *
 * Native radios inside a `<fieldset>`: arrow keys, space and the tab stop come
 * from the browser, not from us. The options are data, not children — that
 * keeps the labels out of every caller.
 *
 * It builds the label and error row itself instead of wrapping `Field`: a
 * group is labelled by its `<legend>`, and a second `<label>` above it would
 * be read twice.
 */

export interface RadioOption {
  value: string;
  label: string;
  /** One sentence under the option — why one would pick it. */
  hint?: string;
  disabled?: boolean;
}

/**
 * @when    Two to seven named answers, all visible at once — a wizard step,
 *          an answer to a question.
 * @instead Switching a view → Segmented. Many values → Select. Several answers
 *          at the same time → Checkbox. A question with its own submit →
 *          ChoicePrompt.
 */
export function RadioGroup({
  name,
  label,
  options,
  value,
  onChange,
  orientation = "vertical",
  error,
  required,
  disabled,
}: {
  name: string;
  label: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="v2field">
      <fieldset
        className={`v2radiogrp${orientation === "horizontal" ? " v2radiogrp--horizontal" : ""}`}
        aria-invalid={error ? true : undefined}
        disabled={disabled}
      >
        <legend className="v2field__label">{required ? `${label} *` : label}</legend>
        {options.map((o) => {
          const off = disabled || o.disabled;
          return (
            <label className={`v2radioline${off ? " v2radioline--disabled" : ""}`} key={o.value}>
              <input
                type="radio"
                className="v2radio"
                name={name}
                value={o.value}
                checked={value === o.value}
                disabled={off}
                onChange={() => onChange(o.value)}
              />
              <span>
                {o.label}
                {o.hint ? <span className="v2radioline__hint">{o.hint}</span> : null}
              </span>
            </label>
          );
        })}
      </fieldset>
      {error ? <div className="v2field__err">{error}</div> : null}
    </div>
  );
}
