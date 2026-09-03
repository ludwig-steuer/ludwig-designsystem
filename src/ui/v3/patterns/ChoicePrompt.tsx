"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { ActionButton } from "../primitives/ActionButton";
import { Callout } from "../primitives/Callout";
import { Field, Textarea } from "../primitives/Form";
import { RadioGroup, type RadioOption } from "../primitives/RadioGroup";

/**
 * A question with answers to pick from (0028).
 *
 * Ludwig asks: „Bewirtung oder Reisekosten?" The answer should be one click —
 * typing is for the case none of them fit. Today that is a free-text form, and
 * the suggestions the agent brings along end up inside the question text.
 */

export interface ChoiceOption {
  id: string;
  label: string;
  /** One sentence under the option — what it would mean. */
  hint?: string;
}

export interface ChoiceAnswer {
  optionId: string | null;
  text?: string;
}

/**
 * @when    A question with two to seven suggested answers — a clarification on
 *          a case, a query in the batch review, an answer in the portal.
 * @instead A reason for an action already chosen → ReasonDialog. Picking one
 *          value out of many → Combobox. Steps in order → StepRail.
 */
export function ChoicePrompt({
  question,
  context,
  options,
  defaultOptionId = null,
  freeText,
  submitLabel = "Antwort senden",
  onSubmit,
  pending,
  error,
}: {
  question: string;
  /** What this is about — document, amount, row. */
  context?: ReactNode;
  options: ChoiceOption[];
  /** Pre-selected answer — the agent's own suggestion, for instance. */
  defaultOptionId?: string | null;
  /** Without this prop there is no text field at all. */
  freeText?: { label: string; placeholder?: string; required?: boolean };
  submitLabel?: string;
  onSubmit: (answer: ChoiceAnswer) => Promise<void> | void;
  pending?: boolean;
  error?: string;
}) {
  const [choice, setChoice] = useState<string | null>(defaultOptionId);
  const [text, setText] = useState("");

  const missingText = Boolean(freeText?.required) && !text.trim();
  const blocked = (!choice && !text.trim()) || missingText;
  // Why it is blocked belongs next to the button, not only in a grey button.
  const why = !choice && !text.trim()
    ? "Wählen Sie eine Antwort oder schreiben Sie eine."
    : missingText
      ? "Bitte ergänzen Sie den Text."
      : null;

  function send() {
    if (blocked || pending) return;
    void onSubmit({ optionId: choice, text: text.trim() || undefined });
  }

  return (
    // The key is promised at the button, so it has to work everywhere in the
    // block — not only inside the text field (found in review, 2026-09-03).
    <div
      className="v2ask"
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          send();
        }
      }}
    >
      <div>
        <div className="v2ask__q">{question}</div>
        {context ? <div className="v2ask__ctx">{context}</div> : null}
      </div>
      <RadioGroup
        name="choice"
        label="Antwort"
        options={options.map<RadioOption>((o) => ({ value: o.id, label: o.label, hint: o.hint }))}
        value={choice}
        onChange={setChoice}
        disabled={pending}
      />
      {freeText ? (
        <Field label={freeText.required ? `${freeText.label} *` : freeText.label}>
          <Textarea
            value={text}
            rows={3}
            placeholder={freeText.placeholder}
            disabled={pending}
            onChange={(e) => setText(e.target.value)}
          />
        </Field>
      ) : null}
      {error ? <Callout tone="danger">{error}</Callout> : null}
      <div className="v2ask__foot">
        <ActionButton
          variant="primary"
          size="sm"
          hotkey="Strg+Enter"
          disabled={blocked || pending}
          pendingLabel="Sende …"
          action={async () => {
            await onSubmit({ optionId: choice, text: text.trim() || undefined });
          }}
        >
          {submitLabel}
        </ActionButton>
        {why ? <span className="v2ask__why">{why}</span> : null}
      </div>
    </div>
  );
}
