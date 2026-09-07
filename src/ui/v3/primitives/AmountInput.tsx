"use client";

import { useEffect, useId, useState } from "react";
import { parseGermanAmount, type Currency } from "@/ludwig/shared/money";
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
 * Text aus dem Feld → Betrag.
 *
 * **Die Rechnung gehört der App** (`parseGermanAmount`, `shared/money.ts`):
 * welcher Punkt ein Tausendertrenner ist und welcher ein Komma vertritt,
 * entscheidet seit 2026-09-07 eine Regel für beide Seiten (Befund L-01, App-
 * Commit `52914c45`). Hier steht nur noch, was ein **Eingabefeld** zusätzlich
 * braucht: die Unterscheidung zwischen „nichts getippt" und „getippt, aber
 * keine Zahl".
 *
 * Deshalb die Formprüfung davor. `parseGermanAmount` verwirft, was keine
 * Ziffer ist, und liest „12,3,4" als 123,4 — für einen Import ist das richtig,
 * für ein Feld wäre es eine stille Umdeutung dessen, was jemand getippt hat.
 * Was die Form nicht besteht, ist `"invalid"` und wird sichtbar bemängelt.
 *
 * Eine Schreibweise liest das Feld seither anders als vorher: „1.2345" ist
 * jetzt 12345 (der Punkt trennt Tausender, denn hinter ihm stehen vier
 * Ziffern) statt 1,2345. Das ist die Regel der App, und sie ist die richtige —
 * 1,2345 € gibt es nicht.
 */
export function parseAmount(raw: string): ParsedAmount {
  const t = raw.replace(/[\s ]/g, "");
  if (!t) return null;
  // Entweder deutsche Gruppierung („1.234.567,89") oder eine schlichte Zahl
  // mit höchstens einem Trenner („1234.56", „1234,56", „1234").
  const wohlgeformt = /^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t) || /^-?\d+([.,]\d+)?$/.test(t);
  if (!wohlgeformt) return "invalid";
  const n = parseGermanAmount(t);
  return n === null ? "invalid" : n;
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
