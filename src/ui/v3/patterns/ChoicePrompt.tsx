"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import { ActionButton } from "../primitives/ActionButton";
import { Callout } from "../primitives/Callout";
import { TextButton } from "../primitives/TextButton";
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
  /** Marked „empfohlen", and preselected when `defaultOptionId` is absent (0214). */
  recommended?: boolean;
  /**
   * Chosen, this option asks for a sentence (0223): a field with this word
   * stands under the options — a comment for Ludwig, a note for the client.
   * It shares its text with the free text, so switching options loses
   * nothing.
   */
  note?: { label: string; placeholder?: string; required?: boolean };
  /**
   * A group of answers under one row (owner 2026-10-27: „Ablegen ohne Buchung
   * ›" with five places to file). Chosen, the row unfolds its options; a
   * recommended or preselected one opens it from the start. The group itself
   * is no answer: while it alone is chosen the button waits. One level.
   */
  options?: Omit<ChoiceOption, "options">[];
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
  optionsLabel = "Antwort",
  optionStyle = "list",
  hideQuestion = false,
  optionsNote,
  links,
}: {
  question: string;
  /** What this is about — document, amount, row. */
  context?: ReactNode;
  options: ChoiceOption[];
  /** Pre-selected answer — the agent's own suggestion, for instance. */
  defaultOptionId?: string | null;
  /**
   * Without this prop there is no text field at all. `toggle` hides it behind
   * a text button with that word („Eigene Antwort schreiben", 0222); a click
   * shows the field and moves the focus into it. `defaultValue` fills it.
   */
  freeText?: {
    label: string;
    placeholder?: string;
    required?: boolean;
    toggle?: string;
    defaultValue?: string;
    /** The sentence beside the blocked button while the field is empty — for a field that is no answer (a note). */
    emptyHint?: string;
  };
  submitLabel?: string;
  onSubmit: (answer: ChoiceAnswer) => Promise<void> | void;
  pending?: boolean;
  error?: string;
  /** The legend over the options — „Antwortoptionen" in a clarification (0214). */
  optionsLabel?: string;
  /** `rows`: the options as full-width rows (RadioGroup `variant="rows"`). */
  optionStyle?: "list" | "rows";
  /** The question stands above already (a card that shows it) — not twice. */
  hideQuestion?: boolean;
  /** A line right under the options — the why of the recommended one (0222, 0223). */
  optionsNote?: ReactNode;
  /**
   * More text buttons in one row under the options, after the free-text
   * button — the other ways out of the question (0222).
   */
  links?: ReactNode;
}) {
  // The answers proper: a group stands for its options.
  const answers = options.flatMap((o) => (o.options?.length ? o.options : [o]));
  const [choice, setChoice] = useState<string | null>(
    defaultOptionId ?? answers.find((o) => o.recommended)?.id ?? null,
  );
  const [text, setText] = useState(freeText?.defaultValue ?? "");
  const [freeOpen, setFreeOpen] = useState(!freeText?.toggle);
  // Two questions on one page must not deselect each other — a fixed `name`
  // ties their radios into one group (0028).
  const groupName = useId();
  const textId = useId();

  // One field at most: the chosen option's note wins over the free text.
  const note = answers.find((o) => o.id === choice)?.note;
  // The group's own row is chosen, none of its options yet: no answer.
  const openGroup = options.find((o) => o.id === choice && o.options?.length);
  const answer = openGroup ? null : choice;
  const field = note ?? (freeText && freeOpen ? freeText : null);
  // Only what stands in a visible field is sent: a note typed for one option
  // must not travel with another that shows no field (acceptance 0223, M1).
  const typed = field ? text.trim() : "";
  const missingText = Boolean(field?.required) && !typed;
  const blocked = (!answer && !typed) || missingText;
  // Why it is blocked belongs next to the button, not only in a grey button.
  // While the answer is on its way, the sentence would contradict it — the
  // button says „Sende …" and the line next to it must not ask for an answer
  // that has already been given (found in the review of 0028).
  const why = pending
    ? null
    : openGroup && !typed
      ? `Wählen Sie eine Möglichkeit unter „${openGroup.label}“.`
      : !answer && !typed
      ? // Without options there is nothing to pick, and the sentence must not
        // send the reader looking for it (found in the review of 0028).
        options.length === 0
        ? (freeText?.emptyHint ?? "Schreiben Sie eine Antwort.")
        : "Wählen Sie eine Antwort oder schreiben Sie eine."
      : missingText
        ? "Bitte ergänzen Sie den Text."
        : null;

  function send() {
    if (blocked || pending) return;
    void onSubmit({ optionId: answer, text: typed || undefined });
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
      {hideQuestion && !context ? null : (
        <div>
          {hideQuestion ? null : <div className="v2ask__q">{question}</div>}
          {context ? <div className="v2ask__ctx">{context}</div> : null}
        </div>
      )}
      {/* No group without a subject: on a pure free-text question (60 % of the
          stock) there would otherwise be an empty `<fieldset>` with the legend
          „Antwort" above a field that carries the same label — the same word
          twice, and for a screen reader a group without content. */}
      {options.length === 0 ? null : (
      <RadioGroup
        name={groupName}
        label={optionsLabel}
        variant={optionStyle === "rows" ? "rows" : "list"}
        options={options.map<RadioOption>((o) => ({
          ...radio(o),
          ...(o.options?.length ? { options: o.options.map(radio) } : {}),
        }))}
        value={choice}
        onChange={setChoice}
        disabled={pending}
      />
      )}
      {optionsNote}
      {(freeText?.toggle && !freeOpen) || links ? (
        <div className="v2ask__links">
          {freeText?.toggle && !freeOpen ? (
            // Locked while saving: it would open a field that is locked too (acceptance 0222, H3).
            <TextButton onClick={() => setFreeOpen(true)} disabled={pending}>
              {freeText.toggle}
            </TextButton>
          ) : null}
          {links}
        </div>
      ) : null}
      {field ? (
        <Field label={field.required ? `${field.label} *` : field.label} htmlFor={textId}>
          <Textarea
            id={textId}
            value={text}
            rows={3}
            placeholder={field.placeholder}
            disabled={pending}
            // Only when a click on the free-text button opened it — a note that
            // appears with an option must not take the focus off the radios.
            autoFocus={field === freeText && Boolean(freeText.toggle)}
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
          // `answer`, not `choice`: the group's own row is no answer, by click
          // as by Ctrl+Enter (acceptance of the groups, M1).
          action={async () => {
            await onSubmit({ optionId: answer, text: typed || undefined });
          }}
        >
          {pending ? "Sende …" : submitLabel}
        </ActionButton>
        {why ? <span className="v2ask__why">{why}</span> : null}
      </div>
    </div>
  );
}

function radio(o: Omit<ChoiceOption, "options">): RadioOption {
  return { value: o.id, label: o.label, hint: o.hint, recommended: o.recommended };
}
