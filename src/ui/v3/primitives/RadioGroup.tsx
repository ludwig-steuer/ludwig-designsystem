"use client";

import { Fragment, type ReactNode } from "react";
import { ActionIcon } from "../Icons";
import { Badge } from "./Badge";

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
  /**
   * The word „empfohlen" after the label (0214), as an `info` badge (0229): the
   * owner asked for a colour (2026-10-27); that it is the step „Hinweis" — Ludwig's
   * hint, no new colour — is the design system's reading, accepted by llcto for
   * the owner. Inside the label, so it is read out with the option.
   */
  recommended?: boolean;
  /**
   * The option is a group (owner 2026-10-27, „Ablegen ohne Buchung ›"): one
   * row, and once it is chosen — or one of its options is — they unfold under
   * it with their sub-lines. One level only. They are radios of the same name,
   * so the arrow keys run on through them like through any other option; the
   * group's own value is no answer, the caller treats it as „not yet chosen".
   */
  options?: Omit<RadioOption, "options">[];
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
  variant = "list",
  error,
  required,
  disabled,
  underChecked,
}: {
  name: string;
  label: string;
  options: RadioOption[];
  value: string | null;
  onChange: (value: string) => void;
  orientation?: "vertical" | "horizontal";
  /**
   * `rows`: every option a full-width row with a frame, the whole row the
   * target — the proposed answers of rule S13, as the batch review shows them
   * (0214). The native radio stays: arrow keys and the tab stop remain the
   * browser's.
   */
  variant?: "list" | "rows";
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /**
   * Stands right under the checked option — its field and its button, so they
   * are where the eye is and not under a long list (owner 2026-10-27, 0229).
   * A checked group carries it under its options. Nothing checked: not shown.
   * It sits inside the group's `<fieldset>`, so a screen reader names it as
   * part of the group. Vertical only: between options side by side it would
   * break the line, so `horizontal` leaves it out.
   */
  underChecked?: ReactNode;
}) {
  const under =
    underChecked && orientation === "vertical" ? <div className="v2radiogrp__under">{underChecked}</div> : null;
  return (
    <div className="v2field">
      <fieldset
        className={`v2radiogrp${orientation === "horizontal" ? " v2radiogrp--horizontal" : ""}${variant === "rows" ? " v2radiogrp--rows" : ""}`}
        aria-invalid={error ? true : undefined}
        disabled={disabled}
      >
        <legend className="v2field__label">{required ? `${label} *` : label}</legend>
        {options.map((o) => {
          if (!o.options?.length)
            return (
              <Fragment key={o.value}>
                <Line o={o} name={name} value={value} onChange={onChange} disabled={disabled} />
                {value === o.value ? under : null}
              </Fragment>
            );
          const open = value === o.value || o.options.some((c) => c.value === value);
          // Folded, the group says that a recommendation waits inside it.
          const recommended = !open && o.options.some((c) => c.recommended);
          return (
            <div key={o.value} className={`v2radiogrp__group${open ? " is-open" : ""}`}>
              <Line o={{ ...o, recommended }} name={name} value={value} onChange={onChange} disabled={disabled} chevron folded={open ? undefined : o.options.length} />
              {open ? (
                <fieldset className="v2radiogrp__sub">
                  <legend className="v2vh">{o.label}</legend>
                  {o.options.map((c) => (
                    <Fragment key={c.value}>
                      <Line o={c} name={name} value={value} onChange={onChange} disabled={disabled} />
                      {value === c.value ? under : null}
                    </Fragment>
                  ))}
                </fieldset>
              ) : null}
              {value === o.value ? under : null}
            </div>
          );
        })}
      </fieldset>
      {error ? <div className="v2field__err">{error}</div> : null}
    </div>
  );
}

function Line({
  o,
  name,
  value,
  onChange,
  disabled,
  chevron,
  folded,
}: {
  o: RadioOption;
  name: string;
  value: string | null;
  onChange: (value: string) => void;
  disabled?: boolean;
  /** The group row: the sign that more lies under it, turned when open. */
  chevron?: boolean;
  /**
   * Folded group: how many options wait in it. Only for the screen reader
   * („Ablegen ohne Buchung, 5 Möglichkeiten") — the chevron says it to the eye,
   * and a radio has no `aria-expanded` (llcto 2026-10-27). Open, the nested
   * group names itself.
   */
  folded?: number;
}) {
  const off = disabled || o.disabled;
  return (
    <label className={`v2radioline${off ? " v2radioline--disabled" : ""}`}>
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
        {folded ? <span className="v2vh">{`, ${folded} ${folded === 1 ? "Möglichkeit" : "Möglichkeiten"}`}</span> : null}
        {/* The space keeps the accessible name two words („… (4670) empfohlen"). */}
        {o.recommended ? <> <Badge tone="info" className="v2radioline__rec">empfohlen</Badge></> : null}
        {o.hint ? <span className="v2radioline__hint">{o.hint}</span> : null}
      </span>
      {chevron ? <ActionIcon action="collapse" size={14} className="v2radioline__chev" /> : null}
    </label>
  );
}
