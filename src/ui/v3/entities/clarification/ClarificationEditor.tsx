"use client";

import { useState } from "react";

import type { ClarificationType } from "@/ludwig/modules/accounting-cases/domain/case";
import type { ClarificationSeverity } from "@/ludwig/modules/invoices/domain/invoice";

import { ActionBar } from "../../primitives/ActionBar";
import { ActionButton } from "../../primitives/ActionButton";
import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Field, Input, Textarea } from "../../primitives/Form";
import { RadioGroup } from "../../primitives/RadioGroup";
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
}: {
  defaultType?: ClarificationType;
  defaultAudience?: ClarificationAudience;
  onSubmit: (draft: ClarificationDraft) => Promise<void>;
  /** Without it there is no cancel button and `Esc` does nothing. */
  onCancel?: () => void;
  pending?: boolean;
  error?: string;
  audienceHint?: string;
}) {
  const [type, setType] = useState<ClarificationType>(defaultType);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<ClarificationAudience>(defaultAudience);
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

  async function send() {
    setTouched(true);
    if (blocked || pending) return;
    await onSubmit({
      type,
      title: title.trim(),
      text: text.trim(),
      ...(isComment ? {} : { audience, severity }),
    });
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
        if (e.key === "Escape" && onCancel) onCancel();
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
      >
        <Input
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
      >
        <Textarea
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
          <RadioGroup
            name="clarification-audience"
            label="Wer soll antworten"
            value={audience}
            onChange={(v) => setAudience(v as ClarificationAudience)}
            disabled={pending}
            options={AUDIENCE_OPTIONS}
          />
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
          onCancel ? (
            <Button variant="tertiary" size="sm" onClick={onCancel} disabled={pending}>
              Abbrechen
            </Button>
          ) : undefined
        }
        info={why}
      />
    </form>
  );
}
