"use client";

import { useState } from "react";

import type { ClarificationAnswerKind } from "@/ludwig/modules/invoices/domain/invoice";
import type { RationaleSourceKind } from "@/ludwig/modules/accounting-cases/domain/rationale-source";
import type { Actor } from "@/ludwig/modules/audit-log/domain/types";

import { Callout } from "../../primitives/Callout";
import { FieldList } from "../../primitives/FieldList";
import { Markdown } from "../../primitives/Markdown";
import { ReasonDialog } from "../../primitives/ReasonDialog";
import { TextButton } from "../../primitives/TextButton";
import { Time } from "../../primitives/Time";
import { ActionIcon } from "../../Icons";
import { StatusBadge } from "../../patterns/StatusBadge";
import { resolveStatus } from "../../patterns/status-registry";
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
 *  2. **The second exit.** `resolveClarification` closes a question without
 *     the asked party answering: 57 times in the audit, 35 as `answered` (the
 *     agent found the answer itself) and 22 as `obsolete`. Both set
 *     `answered_at` and `answer_payload`; only the marker `"(gegenstandslos)"`
 *     tells them apart. The card names the case instead of showing it as an
 *     answer.
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

/**
 * Who did it. A plain string where the caller already has a display name, or
 * the app's own `Actor` (`kind` is a value of the axis `actor_kind`) where it
 * has the audit row — `LogList` takes the same shape.
 *
 * The clarification table has no `created_by` (finding B7), so today this
 * comes from the audit. Once the column exists, the caller passes it here and
 * nothing about this interface changes.
 */
export type ClarificationActor = string | Actor;

/** The name to print. Never „—": somebody acted, even if it was a machine. */
function actorName(by: ClarificationActor | null | undefined, fallback: string): string {
  if (!by) return fallback;
  if (typeof by === "string") return by.trim() || fallback;
  return by.label?.trim() || resolveStatus("actor_kind", by.kind).label;
}

/** One step in the life of a question, as the audit recorded it. */
export interface ClarificationEvent {
  kind: ClarificationEventKind;
  /** ISO timestamp. */
  at: string;
  /** `null` means the agent or the system, and the card says so. */
  by?: ClarificationActor | null;
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
  /**
   * Who asked, and who answered. Both optional: the table carries neither the
   * asker nor a display name for the answerer today. Given without `history`,
   * the card builds the two obvious entries from them; given `history`, that
   * wins — it is the fuller truth.
   */
  raisedBy?: ClarificationActor | null;
  answeredBy?: ClarificationActor | null;
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
  // Without a loaded audit trail, asker and answerer still make a two-step
  // history — the same shape, so the card never has two ways to show a person.
  const history: readonly ClarificationEvent[] =
    c.history ??
    ([
      c.raisedBy ? { kind: "raised" as const, at: c.raisedAt, by: c.raisedBy } : null,
      c.answeredAt
        ? { kind: "answered" as const, at: c.answeredAt, by: c.answeredBy ?? null }
        : null,
    ].filter(Boolean) as ClarificationEvent[]);
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

      {history.length > 0 ? (
        <Block label="Verlauf">
          <ol className="v2clc__hist">
            {history.map((e, i) => (
              <li key={`${e.kind}-${e.at}-${i}`}>
                <span className="v2clc__histHead">
                  <strong>{EVENT_LABEL[e.kind]}</strong>
                  {" von "}
                  {actorName(e.by, e.kind === "raised" ? "Agent" : "System")}
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
              <ActionIcon action="help" size={14} />
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
