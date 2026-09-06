"use client";

import { useEffect, useId, useState } from "react";
import type { Currency } from "@/ludwig/shared/money";
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
 * German input, tolerantly read: „1.234,56", „1234,56", „1234.56" and
 * „1 234,56" are the same amount. A dot counts as a thousands separator only
 * when exactly three digits follow it — otherwise it is the decimal point
 * people typed on a numeric keypad.
 *
 * @when    Turning what someone typed into a number — inside this field, and
 *          wherever else an amount arrives as text (import, paste, URL).
 * @instead Formatting a number for display → `formatMoney` in
 *          `src/ludwig/shared/money.ts`.
 *
 * ponytail: lives here until `src/ludwig/shared/money.ts` gets the counterpart
 * to `formatMoney` — see spec 0019, „Befund für ludwig/app".
 */
export function parseAmount(raw: string): ParsedAmount {
  const t = raw.replace(/[\s ]/g, "");
  if (!t) return null;
  let s = t;
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    const tail = s.match(/\.(\d+)$/);
    if (tail?.[1]?.length === 3) s = s.replace(/\./g, "");
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return "invalid";
  const n = Number(s);
  return Number.isFinite(n) ? n : "invalid";
}

function format(value: number, currency: Currency | null) {
  return new Intl.NumberFormat("de-DE", {
    style: currency ? "currency" : "decimal",
    currency: currency ?? undefined,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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
  const [text, setText] = useState(value === null ? "" : format(value, currency));
  const [ownError, setOwnError] = useState<string | null>(null);

  // The caller stays the owner of the value: when it changes from outside
  // (reset, loaded record), the field follows.
  useEffect(() => {
    setText(value === null ? "" : format(value, currency));
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
    setText(parsed === null ? "" : format(parsed, currency));
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
