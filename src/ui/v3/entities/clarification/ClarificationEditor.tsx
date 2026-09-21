"use client";

import { useId, useState } from "react";

import type { ClarificationType } from "@/ludwig/modules/accounting-cases/domain/case";
import type { ClarificationSeverity } from "@/ludwig/modules/invoices/domain/invoice";

import { ActionIcon } from "../../Icons";
import { ActionBar } from "../../primitives/ActionBar";
import { ActionButton } from "../../primitives/ActionButton";
import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Field, Input, Textarea } from "../../primitives/Form";
import { RadioGroup } from "../../primitives/RadioGroup";
import { TextButton } from "../../primitives/TextButton";
import type { ClarificationAudience } from "./Clarification";

/**
 * Asking a question or leaving a note at a case (0061).
 *
 * 22 % of all clarifications in the data come from the firm itself
 * (`source_module = 'web'`), plus 13 comments — today across two forms in two
 * places. This is the one form, and it is **deliberately narrow**: what the
 * agent brings along — sources, facts, question kind, answer options, a
 * recommendation — is not created here. A question asked by hand is text
 * addressed to someone (owner decision 2026-09-04).
 *
 * That is also why the missing `question_type` catalogue does not block this
 * form: it does not need one.
 */

/** The upper limit of `title`, from the column comment („max ~140 Zeichen"). */
const TITLE_MAX = 140;

const AUDIENCE_OPTIONS: { value: ClarificationAudience; label: string; hint: string }[] = [
  { value: "client", label: "Mandant", hint: "Er sieht die Frage im Portal und antwortet dort." },
  { value: "accounting", label: "Kanzlei", hint: "Bleibt im Haus — für Rückfragen an Kolleginnen." },
  { value: "agent", label: "Agent", hint: "Der Buchungsagent greift sie im nächsten Lauf auf." },
];

/** What the editor produces; the caller writes it. */
export interface ClarificationDraft {
  type: ClarificationType;
  title: string;
  /**
   * Goes into `professional_text` **and** `client_text`. One field, because
   * 79 % of the rows carry the same text in both — two would be a claim
   * nobody redeems (finding B3).
   */
  text: string;
  /** Only for a question; a comment addresses nobody. */
  audience?: ClarificationAudience;
  severity?: ClarificationSeverity;
}

/**
 * @when    Raising a clarification question or leaving a note on a case, by
 *          hand — title, text, who is asked, whether it blocks.
 * @instead Answering an existing one → ClarificationCard. A reason for an
 *          action already chosen → ReasonDialog. Editing one value in place →
 *          InlineEdit.
 */
export function ClarificationEditor({
  defaultType = "question",
  defaultAudience = "client",
  onSubmit,
  onCancel,
  pending,
  error,
  audienceHint,
  unfoldLabel,
  audiences,
}: {
  defaultType?: ClarificationType;
  defaultAudience?: ClarificationAudience;
  onSubmit: (draft: ClarificationDraft) => Promise<void>;
  /** Without it there is no cancel button and `Esc` does nothing. */
  onCancel?: () => void;
  pending?: boolean;
  error?: string;
  audienceHint?: string;
  /**
   * Folded behind a text button with this label — the form comes on click,
   * „Abbrechen" and a stored draft fold it again. A permanently open form in a
   * side column demands something nobody intended (NoteFeed, 0158); without
   * the prop the form stands open, as in a dialog (owner 2026-09-18).
   */
  unfoldLabel?: string;
  /**
   * Who may be asked **here** — the options offered, in this order. The app
   * decides who may be addressed by hand: a question to the client created in
   * the office is refused by the server action (F249), so the form must not
   * offer it. Absent: all three. With one left the choice disappears and a
   * sentence names who is asked.
   */
  audiences?: readonly ClarificationAudience[];
}) {
  const offered = audiences
    ? AUDIENCE_OPTIONS.filter((o) => audiences.includes(o.value))
    : AUDIENCE_OPTIONS;
  const startAudience = offered.some((o) => o.value === defaultAudience)
    ? defaultAudience
    : (offered[0]?.value ?? defaultAudience);
  const [unfolded, setUnfolded] = useState(!unfoldLabel);
  const [type, setType] = useState<ClarificationType>(defaultType);
  const titleId = useId();
  const textId = useId();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<ClarificationAudience>(startAudience);
  const [severity, setSeverity] = useState<ClarificationSeverity>("optional");
  const [touched, setTouched] = useState(false);

  const isComment = type === "comment";
  const tooLong = title.trim().length > TITLE_MAX;
  const titleError = touched && !title.trim() ? "Bitte geben Sie eine Überschrift an." : null;
  const lengthError = tooLong ? `Höchstens ${TITLE_MAX} Zeichen — kürzen Sie die Überschrift.` : null;
  const textError = touched && !text.trim() ? "Ohne Text weiß niemand, worum es geht." : null;
  const blocked = !title.trim() || !text.trim() || tooLong;
  // Why it is blocked belongs next to the button, not only in a grey button.
  const why = blocked
    ? tooLong
      ? "Die Überschrift ist zu lang."
      : "Überschrift und Text sind Pflicht."
    : null;

  // Folding throws the draft away only on cancel; a rejected save keeps it
  // (the promise throws before the reset).
  const cancel = unfoldLabel
    ? () => {
        setUnfolded(false);
        onCancel?.();
      }
    : onCancel;

  async function send() {
    setTouched(true);
    if (blocked || pending) return;
    await onSubmit({
      type,
      title: title.trim(),
      text: text.trim(),
      ...(isComment ? {} : { audience, severity }),
    });
    if (unfoldLabel) {
      setTitle("");
      setText("");
      setTouched(false);
      setUnfolded(false);
    }
  }

  if (!unfolded) {
    return (
      <TextButton icon={<ActionIcon action="add" size={14} />} onClick={() => setUnfolded(true)}>
        {unfoldLabel}
      </TextButton>
    );
  }

  return (
    <form
      className="v2cle"
      onSubmit={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          void send();
        }
        if (e.key === "Escape" && cancel) cancel();
      }}
    >
      <RadioGroup
        name="clarification-type"
        label="Was entsteht"
        orientation="horizontal"
        value={type}
        onChange={(v) => setType(v as ClarificationType)}
        disabled={pending}
        options={[
          { value: "question", label: "Rückfrage", hint: "Erwartet eine Antwort." },
          { value: "comment", label: "Notiz", hint: "Kontext ohne Aktion, wird nie beantwortet." },
        ]}
      />

      <Field
        label={isComment ? "Worum geht es" : "Die Frage in einem Satz"}
        error={titleError ?? lengthError}
        hint={`Kurz und aussagekräftig — höchstens ${TITLE_MAX} Zeichen.`}
        htmlFor={titleId}
      >
        <Input
          id={titleId}
          value={title}
          maxLength={TITLE_MAX + 40}
          invalid={Boolean(titleError ?? lengthError)}
          disabled={pending}
          placeholder={
            isComment ? "Mit dem Mandanten telefoniert" : "Bewirtung oder Reisekosten?"
          }
          onChange={(e) => setTitle(e.target.value)}
        />
      </Field>

      <Field
        label={isComment ? "Notiz" : "Erläuterung"}
        error={textError}
        hint={
          isComment
            ? "Die Notiz steht am Sachverhalt, nicht im Verlauf — sie erwartet keine Antwort."
            : undefined
        }
        htmlFor={textId}
      >
        <Textarea
          id={textId}
          value={text}
          rows={5}
          invalid={Boolean(textError)}
          disabled={pending}
          placeholder={
            isComment
              ? "Was soll man später wissen?"
              : "Was ist unklar, und was braucht die Antwortende, um zu entscheiden?"
          }
          onChange={(e) => setText(e.target.value)}
        />
      </Field>

      {isComment ? null : (
        <>
          {offered.length > 1 ? (
            <RadioGroup
              name="clarification-audience"
              label="Wer soll antworten"
              value={audience}
              onChange={(v) => setAudience(v as ClarificationAudience)}
              disabled={pending}
              options={offered}
            />
          ) : offered[0] ? (
            // One choice is no choice — a radio with a single option asks a
            // question that has only one answer.
            <div className="v2muted">
              Gefragt ist: {offered[0].label}. {offered[0].hint}
            </div>
          ) : null}
          {audienceHint ? <Callout tone="soft">{audienceHint}</Callout> : null}

          <RadioGroup
            name="clarification-severity"
            label="Gewicht"
            orientation="horizontal"
            value={severity}
            onChange={(v) => setSeverity(v as ClarificationSeverity)}
            disabled={pending}
            options={[
              {
                value: "required",
                label: "Blockierend",
                hint: "Blockiert die Buchung, bis jemand antwortet.",
              },
              {
                value: "optional",
                label: "Optional",
                hint: "Hilfreich, aber die Buchung kann auch ohne Antwort laufen.",
              },
            ]}
          />
        </>
      )}

      {error ? <Callout tone="danger">{error}</Callout> : null}

      <ActionBar
        primary={
          <ActionButton
            variant="primary"
            size="sm"
            hotkey="Strg+Enter"
            pendingLabel="Sende …"
            disabled={pending}
            action={send}
          >
            {isComment ? "Notiz speichern" : "Rückfrage stellen"}
          </ActionButton>
        }
        tertiary={
          cancel ? (
            <Button variant="tertiary" size="sm" onClick={cancel} disabled={pending}>
              Abbrechen
            </Button>
          ) : undefined
        }
        info={why}
      />
    </form>
  );
}
