"use client";

import { useId } from "react";
import { DATEV_TAX_KEYS, type TaxKeyEntry } from "@/ludwig/core/datev/tax-keys";
import { Field, Select } from "../../primitives/Form";

/**
 * How a key reads in the list: the number first and read digit by digit, the
 * word beside it — „51 · Vorsteuer 19 %".
 *
 * The rate and the direction are **in** that line and not in a second one:
 * „Vorsteuer 19 %" is already both, and the entry's own `label` says it.
 */
function optionLabel(t: TaxKeyEntry): string {
  return `${t.key} · ${t.label}`;
}

/**
 * The DATEV tax key (BU) as a field (0125).
 *
 * The list comes from `DATEV_TAX_KEYS` — a primitive may not know it
 * (`spec-schreiben` §2), and a caller who builds the options rebuilds the
 * format „51 · Vorsteuer 19 %" with them. It was rebuilt twice already.
 *
 * It is a **field** and not a select because it carries one thing more: the
 * `description` of the chosen key. That sentence exists in the mirror for
 * exactly this („Ein Satz Klartext für die Anzeige") and was shown nowhere —
 * whoever picked „51" could not see what they had picked.
 *
 * @when    A booking line needs its tax key — in the editor, in the proposal.
 * @instead The key as a read-only word in a row → the row shows `label`
 *          itself. Any other choice from a list → Select, Combobox.
 */
export function TaxKeyField({
  value,
  onChange,
  label = "Steuerschlüssel (BU)",
  allowPassThrough = false,
  disabled,
  error,
}: {
  /** `null` means „no key" and is a valid value — not every line has one. */
  value: string | null;
  onChange: (key: string | null) => void;
  label?: string;
  /**
   * Whether the pass-through keys are in the list. Ludwig only forwards those:
   * no rate expansion, no tax line, no assistance — and they may only be set
   * where the history of the same account carries them. **Only the caller
   * knows that**, so this is a prop and not a derivation.
   */
  allowPassThrough?: boolean;
  disabled?: boolean;
  error?: string;
}) {
  const id = useId();
  const keys = allowPassThrough
    ? DATEV_TAX_KEYS
    : DATEV_TAX_KEYS.filter((t) => !t.passThrough);
  const chosen = value ? (DATEV_TAX_KEYS.find((t) => t.key === value) ?? null) : null;

  return (
    <Field
      label={label}
      htmlFor={id}
      {...(error ? { error } : {})}
      // The sentence of the chosen key, and only then — without a choice there
      // is nothing to explain, and „—" would explain nothing either.
      {...(chosen ? { hint: chosen.description } : {})}
    >
      <Select
        id={id}
        className="v2mono"
        value={value ?? ""}
        disabled={disabled}
        // `null` goes back as `null`, never as an empty string: the axis has no
        // value for „", and a caller writing one would store it.
        onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      >
        <option value="">Kein Steuerschlüssel</option>
        {keys.map((t) => (
          <option key={t.key} value={t.key}>
            {optionLabel(t)}
          </option>
        ))}
      </Select>
    </Field>
  );
}
