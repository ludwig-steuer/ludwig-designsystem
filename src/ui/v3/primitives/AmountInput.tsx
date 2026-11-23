"use client";

import { useEffect, useId, useState } from "react";
import { parseGermanAmount, type Currency } from "@/ludwig/shared/money";
import { formatAmount } from "../format";
import { Field, Input } from "./Form";

/**
 * The amount field (0019).
 *
 * While typing the raw text stays — „12," must not vanish under the fingers.
 * On blur it is parsed and formatted; what cannot be parsed stays visible and
 * is marked invalid. It is never silently turned into 0: „nothing entered" and
 * „zero euros" are different statements (same rule as `AmountCell`).
 */

/** `null` = empty, `"invalid"` = there is text but it is not a number. */
export type ParsedAmount = number | null | "invalid";

/**
 * Field text → amount.
 *
 * **The parsing belongs to the app** (`parseGermanAmount`, `shared/money.ts`,
 * finding L-01). This adds only what an input field needs on top: telling
 * "nothing typed" from "typed, but no number". Hence the form check first —
 * `parseGermanAmount` reads "12,3,4" as 123.4, right for an import, a silent
 * reinterpretation in a field. What fails the form is `"invalid"`.
 *
 * "1.2345" reads as 12345 (the dot separates thousands before four digits) —
 * the app's rule, and right: 1.2345 € does not exist.
 *
 * @when    Reading what someone typed into a money field — on blur, before
 *          saving.
 * @instead Turning a number into text → formatAmount. Parsing an amount that
 *          comes from data rather than from a person → parseGermanAmount.
 */
export function parseAmount(raw: string): ParsedAmount {
  // What Ludwig writes must read back (0261): the true minus becomes the one
  // `parseGermanAmount` knows — it drops U+2212 and would flip the sign
  // (L-384) — and a currency behind the number, symbol or ISO code, goes.
  const t = raw
    .replace(/\s/g, "")
    .replace(/\u2212/g, "-")
    .replace(/(?:\p{Sc}|[A-Z]{3})$/u, "");
  if (!t) return null;
  // Either German grouping ("1.234.567,89") or a plain number with at most one
  // separator ("1234.56", "1234,56", "1234").
  const wellFormed = /^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t) || /^-?\d+([.,]\d+)?$/.test(t);
  if (!wellFormed) return "invalid";
  const n = parseGermanAmount(t);
  return n === null ? "invalid" : n;
}

/**
 * @when    Every amount someone types — correction card, rule editor, editor row.
 * @instead Showing an amount → AmountCell. A count or a percentage → Input.
 */
export function AmountInput({
  label,
  value,
  onChange,
  currency = "EUR",
  allowNegative = false,
  error,
  required,
  disabled,
  size = "md",
  name,
}: {
  label: string;
  /** `null` means empty — never 0 as a stand-in. */
  value: number | null;
  onChange: (value: number | null) => void;
  currency?: Currency | null;
  allowNegative?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  size?: "sm" | "md";
  name?: string;
}) {
  const autoId = useId();
  const [text, setText] = useState(value === null ? "" : formatAmount(value, currency));
  const [ownError, setOwnError] = useState<string | null>(null);

  // The caller stays the owner of the value: when it changes from outside
  // (reset, loaded record), the field follows.
  useEffect(() => {
    setText(value === null ? "" : formatAmount(value, currency));
    setOwnError(null);
  }, [value, currency]);

  function commit() {
    const parsed = parseAmount(text);
    if (parsed === "invalid") {
      setOwnError("Betrag nicht lesbar — Beispiel: 1.234,56");
      return;
    }
    if (parsed !== null && !allowNegative && parsed < 0) {
      setOwnError("Negative Beträge sind hier nicht vorgesehen.");
      return;
    }
    setOwnError(null);
    setText(parsed === null ? "" : formatAmount(parsed, currency));
    if (parsed !== value) onChange(parsed);
  }

  // `id` binds the word to the field, `name` names it in a form — two jobs.
  // They used to be the same prop, so a field without a form had no label
  // either: `htmlFor` and `id` were both `undefined`, and `input.labels` was
  // empty (0104). `name` still wins so that an existing form keeps its ids.
  const fieldId = name ?? autoId;

  const shown = error ?? ownError ?? undefined;
  return (
    <Field label={required ? `${label} *` : label} error={shown} htmlFor={fieldId}>
      <Input
        id={fieldId}
        name={name}
        value={text}
        inputMode="decimal"
        disabled={disabled}
        invalid={Boolean(shown)}
        className={`v2in--amount${size === "sm" ? " v2in--sm" : ""}`}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
      />
    </Field>
  );
}
