"use client";

import { useId, useState } from "react";
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
  // Two questions on one page must not deselect each other — a fixed `name`
  // ties their radios into one group (0028).
  const groupName = useId();

  const missingText = Boolean(freeText?.required) && !text.trim();
  const blocked = (!choice && !text.trim()) || missingText;
  // Why it is blocked belongs next to the button, not only in a grey button.
  // While the answer is on its way, the sentence would contradict it — the
  // button says „Sende …" and the line next to it must not ask for an answer
  // that has already been given (found in the review of 0028).
  const why = pending
    ? null
    : !choice && !text.trim()
      ? // Without options there is nothing to pick, and the sentence must not
        // send the reader looking for it (found in the review of 0028).
        options.length === 0
        ? "Schreiben Sie eine Antwort."
        : "Wählen Sie eine Antwort oder schreiben Sie eine."
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
      {/* No group without a subject: on a pure free-text question (60 % of the
          stock) there would otherwise be an empty `<fieldset>` with the legend
          „Antwort" above a field that carries the same label — the same word
          twice, and for a screen reader a group without content. */}
      {options.length === 0 ? null : (
      <RadioGroup
        name={groupName}
        label="Antwort"
        options={options.map<RadioOption>((o) => ({ value: o.id, label: o.label, hint: o.hint }))}
        value={choice}
        onChange={setChoice}
        disabled={pending}
      />
      )}
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
          /* `ActionButton` only knows its **own** run. When the caller holds
             the pending state (the server action is in their hand), the button
             would stay grey without a word — exactly the case V7 forbids. So
             the label carries the word when `pending` comes from outside
             (0028). */
          action={async () => {
            await onSubmit({ optionId: choice, text: text.trim() || undefined });
          }}
        >
          {pending ? "Sende …" : submitLabel}
        </ActionButton>
        {why ? <span className="v2ask__why">{why}</span> : null}
      </div>
    </div>
  );
}
