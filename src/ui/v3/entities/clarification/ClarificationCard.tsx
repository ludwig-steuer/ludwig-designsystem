"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";

import type { ClarificationAnswerKind } from "@/ludwig/modules/invoices/domain/invoice";
import type { RationaleSourceKind } from "@/ludwig/modules/accounting-cases/domain/rationale-source";

import { Callout } from "../../primitives/Callout";
import { FieldList } from "../../primitives/FieldList";
import { Markdown } from "../../primitives/Markdown";
import { ReasonDialog } from "../../primitives/ReasonDialog";
import { TextButton } from "../../primitives/TextButton";
import { Time } from "../../primitives/Time";
import { StatusBadge } from "../../patterns/StatusBadge";
import { ChoicePrompt, type ChoiceAnswer } from "../../patterns/ChoicePrompt";
import type { ClarificationVM } from "./Clarification";

/**
 * The unfolded clarification: what was asked, what it rests on, who asked it
 * when — and, if the reader is the one being asked, the answer in one click
 * (0060).
 *
 * Two things this carries that the app has nowhere today, both taken from the
 * entity profile:
 *
 *  1. **The history.** The table has no `created_by`; who asked lives only in
 *     the audit (`case.clarification_raised`). The card shows 0…n entries with
 *     person and date, so it also holds once the database stores more than one
 *     answer per question (finding B8).
 *  2. **The second exit.** `resolveClarification` closes a question without an
 *     answer, with a mandatory reason. In the data an answered and a resolved
 *     question look alike — `answered_at` is set on both. Here they do not.
 *
 * The card loads nothing: labels for question kind and origin come in as
 * props, because `ludwig/app` has no catalogue for either (findings B1, B2).
 */

/** German word per audience — mirrors `Clarification.tsx`, no axis has it. */
const AUDIENCE_LABEL: Record<ClarificationVM["audience"], string> = {
  accounting: "Kanzlei",
  client: "Mandant",
  agent: "Agent",
};

/** What each history entry is; the four `case.clarification_*` audit actions. */
export type ClarificationEventKind = "raised" | "answered" | "resolved" | "deferred";

const EVENT_LABEL: Record<ClarificationEventKind, string> = {
  raised: "Gefragt",
  answered: "Beantwortet",
  resolved: "Ohne Antwort aufgelöst",
  deferred: "Zurückgestellt",
};

/** One step in the life of a question, as the audit recorded it. */
export interface ClarificationEvent {
  kind: ClarificationEventKind;
  /** ISO timestamp. */
  at: string;
  /** Display name; `null` means the agent or the system, and says so. */
  by?: string | null;
  /** The answer text, or the reason it was resolved without one. */
  text?: string | null;
}

/** A source the question rests on — the card links, it resolves no ids. */
export interface ClarificationSource {
  kind: RationaleSourceKind;
  label: string;
  href?: string;
}

/** What only the card shows — ranks 8–19 of the entity profile. */
export interface ClarificationDetailVM {
  /** The compact, self-contained question (16 % of the rows). */
  question?: string | null;
  /** Observation and problem statement (16 %). */
  context?: string | null;
  /**
   * The full explanation. The caller picks `professional_text` or
   * `client_text` — the card does not know which, and a professional text
   * must never reach the portal.
   */
  text: string;
  /** The asker's own suggestion (10 %); names an option verbatim. */
  recommendation?: string | null;
  facts?: readonly { label: string; value: string }[];
  sources?: readonly ClarificationSource[];
  /** German label for `question_type` — a prop, because there is no catalogue. */
  questionTypeLabel?: string | null;
  /** Where the question came from, in words: „Buchungsvorschlag", „Kanzlei". */
  originLabel?: string | null;
  /**
   * `ClarificationAnswerKind` from `src/ludwig` is missing `document_upload`,
   * although the DB CHECK allows it and eight rows carry it — finding B9. The
   * union is widened here rather than redefined, so the type stays the app's.
   */
  answerKind: ClarificationAnswerKind | "document_upload";
  /** The option text **is** the value (rule S13). */
  answerOptions?: readonly string[];
  allowFreeText?: boolean;
  history?: readonly ClarificationEvent[];
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="v2clc__block">
      <h4 className="v2clc__label">{label}</h4>
      {children}
    </section>
  );
}

/**
 * @when    One clarification with everything it carries — read it, or answer
 *          it where the reader is the one being asked.
 * @instead Several of them in a list → ClarificationList. Named inside
 *          something else → ClarificationCell. Asking a new one →
 *          ClarificationEditor.
 */
export function ClarificationCard({
  clarification: c,
  mode = "read",
  onAnswer,
  onResolve,
  pending,
  error,
}: {
  clarification: ClarificationVM & ClarificationDetailVM;
  /** `answer` shows the answer area — the caller decides who is asked. */
  mode?: "read" | "answer";
  onAnswer?: (answer: ChoiceAnswer) => Promise<void>;
  /** The second exit. Without it, it does not appear. */
  onResolve?: (reason: string) => Promise<void>;
  pending?: boolean;
  error?: string;
}) {
  const [resolving, setResolving] = useState(false);

  const isComment = c.type === "comment";
  const options = (c.answerOptions ?? []).map((label) => ({ id: label, label }));
  // A recommendation that names an option verbatim becomes the preselection —
  // and stays visible, so the preselection has a reason next to it.
  const recommended = options.find((o) => o.label === c.recommendation?.trim())?.id ?? null;
  // Since F125 a missing document is an expectation, not a clarification. The
  // eight remaining rows are legacy: show the question, offer no upload.
  const legacyUpload = c.answerKind === "document_upload";
  const canAnswer = mode === "answer" && !isComment && Boolean(onAnswer) && !legacyUpload;

  return (
    <article className="v2clc">
      <header className="v2clc__head">
        <h3 className="v2clc__title">{c.title}</h3>
        <div className="v2clc__badges">
          {isComment ? (
            <StatusBadge axis="klaerung_typ" status="comment" info={false} />
          ) : (
            <>
              <StatusBadge axis="klaerung_status" status={c.state} info={false} />
              {c.state !== "answered" && c.severity === "required" ? (
                <StatusBadge axis="klaerung" status="required" info={false} />
              ) : null}
            </>
          )}
        </div>
        <p className="v2clc__meta">
          {isComment ? "Notiz" : `Gefragt ist: ${AUDIENCE_LABEL[c.audience]}`}
          {c.questionTypeLabel ? ` · ${c.questionTypeLabel}` : ""}
          {c.originLabel ? ` · ${c.originLabel}` : ""}
          {" · "}
          <Time value={c.raisedAt} format="dateTime" size="sm" />
        </p>
      </header>

      {/* While answering, `ChoicePrompt` carries the question — once is enough. */}
      {c.question && !canAnswer ? <p className="v2clc__question">{c.question}</p> : null}
      {c.context ? <Markdown text={c.context} className="v2clc__prose" /> : null}
      <Markdown text={c.text} className="v2clc__prose" />

      {c.facts && c.facts.length > 0 ? (
        <Block label="Grundlage">
          <FieldList tone="soft" rows={c.facts.map((f) => [f.label, f.value])} />
        </Block>
      ) : null}

      {c.sources && c.sources.length > 0 ? (
        <Block label="Quellen">
          <ul className="v2clc__sources">
            {c.sources.map((s) => (
              <li key={`${s.kind}:${s.label}`}>
                {s.href ? (
                  <a className="v2link" href={s.href}>
                    {s.label}
                  </a>
                ) : (
                  s.label
                )}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {c.recommendation ? (
        <Callout tone="soft">
          <strong>Empfehlung:</strong> {c.recommendation}
        </Callout>
      ) : null}

      {c.history && c.history.length > 0 ? (
        <Block label="Verlauf">
          <ol className="v2clc__hist">
            {c.history.map((e, i) => (
              <li key={`${e.kind}-${e.at}-${i}`}>
                <span className="v2clc__histHead">
                  <strong>{EVENT_LABEL[e.kind]}</strong>
                  {" von "}
                  {/* „—" would claim nobody acted; the agent did. */}
                  {e.by ?? (e.kind === "raised" ? "Agent" : "System")}
                  {" · "}
                  <Time value={e.at} format="dateTime" size="sm" />
                </span>
                {e.text ? <p className="v2clc__histText">{e.text}</p> : null}
              </li>
            ))}
          </ol>
        </Block>
      ) : null}

      {legacyUpload ? (
        <Callout tone="warning">
          Diese Frage stammt aus der Zeit vor der Beleg-Erwartung. Der Beleg wird
          über die Nachforderung angefordert, nicht hier hochgeladen.
        </Callout>
      ) : null}

      {canAnswer ? (
        <div className="v2clc__answer">
          <ChoicePrompt
            question={c.question ?? c.title}
            options={options}
            defaultOptionId={recommended}
            freeText={
              options.length === 0
                ? { label: "Antwort", placeholder: "Antwort oder Anweisung für die Buchung" }
                : c.allowFreeText
                  ? { label: "Ergänzung (optional)" }
                  : undefined
            }
            onSubmit={async (answer) => {
              await onAnswer?.(answer);
            }}
            pending={pending}
            error={error}
          />
          {onResolve ? (
            <p className="v2clc__exit">
              <HelpCircle size={14} strokeWidth={1.5} aria-hidden="true" />
              Woanders geklärt?{" "}
              <TextButton onClick={() => setResolving(true)}>Ohne Antwort auflösen</TextButton>
            </p>
          ) : null}
        </div>
      ) : null}

      {onResolve ? (
        <ReasonDialog
          open={resolving}
          onClose={() => setResolving(false)}
          onConfirm={(reason) => {
            setResolving(false);
            void onResolve(reason);
          }}
          title="Ohne Antwort auflösen"
          kicker="Außerhalb von Ludwig geklärt"
          label="Wie wurde das geklärt?"
          placeholder="z. B. telefonisch mit dem Mandanten geklärt"
          confirmLabel="Auflösen"
          required
          chips={["telefonisch geklärt", "per Mail geklärt", "hat sich erledigt"]}
          pending={pending}
        />
      ) : null}
    </article>
  );
}
