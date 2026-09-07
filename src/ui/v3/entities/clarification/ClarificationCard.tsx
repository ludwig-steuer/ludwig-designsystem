"use client";

import { useId, useState } from "react";

import type { ClarificationAnswerKind } from "@/ludwig/modules/invoices/domain/invoice";
import type { RationaleSourceKind } from "@/ludwig/modules/accounting-cases/domain/rationale-source";
import type { Actor } from "@/ludwig/modules/audit-log/domain/types";

import { Callout } from "../../primitives/Callout";
import { DateField } from "../../primitives/DateField";
import { Field } from "../../primitives/Form";
import { FieldList } from "../../primitives/FieldList";
import { Markdown } from "../../primitives/Markdown";
import { ReasonDialog } from "../../primitives/ReasonDialog";
import { TextButton } from "../../primitives/TextButton";
import { Time } from "../../primitives/Time";
import { ActionIcon } from "../../Icons";
import { StatusBadge } from "../../patterns/StatusBadge";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
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
  /**
   * Why the question was put off. Required in the database, so a deferral
   * without it is a row nobody can read back — the card shows it next to the
   * date (finding L-83).
   */
  deferredReason?: string | null;
  /**
   * How often it has been put off. From the second time on the card says so:
   * that is the warning before the lock, and it arrives before the lock does.
   */
  deferredCount?: number | null;
  /**
   * The counter-question the deferral hangs on. Then the date is not the real
   * condition — the answer to that question is — and the card says that
   * instead of showing a bare day. The link leads to the case page, where the
   * question lives; a clarification has no view of its own.
   */
  deferredBy?: { id: string; title: string; href?: string } | null;
}

/**
 * **30 days, the length of one posting run.** The rule belongs to the app
 * (`F105`), not to this card — but `DEFERRAL_MAX_DAYS` is missing from
 * `modules/accounting-cases/domain/case.ts`, so it stands here once and as a
 * finding (L-91). Mirrored, not invented: a card that lets someone pick a day
 * the server refuses has told them nothing.
 */
const DEFERRAL_MAX_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** `yyyy-mm-dd` in the local calendar — the same day the user sees. */
function isoDay(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/**
 * The correction **while typing** — and the reason it has to hold back.
 *
 * A native date input reports every keystroke of the year separately, so
 * „2026" passes through 0002, 0020 and 0202. Correcting on each of those
 * rewrites segments the person never touched: they type the year and the day
 * jumps from the 20th to the 8th under their hands. This repo found that once
 * before, in the review of 0024, and `DateRangeField` waits for the blur.
 *
 * Here the rule is narrower and does not need the detour: a year below 1000
 * is a keystroke, not a date — it passes through untouched. Everything else
 * is corrected right away, where the correction is visible.
 */
function clampTyped(value: string | null): string | null {
  if (!value) return value;
  const year = Number(value.slice(0, 4));
  if (!Number.isFinite(year) || year < 1000) return value;
  return clampDeferralDay(value);
}

/** Tomorrow. Deferring to today is not deferring. */
function defaultDeferralDay(): string {
  return isoDay(new Date(Date.now() + DAY_MS));
}

function maxDeferralDay(): string {
  return isoDay(new Date(Date.now() + DEFERRAL_MAX_DAYS * DAY_MS));
}

/**
 * Hold the day inside the window.
 *
 * `min` and `max` on the field are a hint the browser gives while typing —
 * they are **not** a guarantee: a typed date outside the range still reaches
 * `onChange`, and the confirm button never looks at the field. So the day is
 * held in three places, and each one exists for a reason:
 *
 *  - **at the change**, but only once the year is written out — see
 *    `clampTyped`, and the reason there;
 *  - **on leaving the field**, for whatever the first rule let through;
 *  - **on confirm**, as the net that nothing gets past.
 *
 * A date that quietly turns into another one is the kind of thing nobody
 * notices until the question comes back on the wrong day.
 */
function clampDeferralDay(value: string | null): string {
  const min = defaultDeferralDay();
  const max = maxDeferralDay();
  if (!value) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
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
  onDefer,
  deferLockedReason,
  pending,
  error,
}: {
  clarification: ClarificationVM & ClarificationDetailVM;
  /** `answer` shows the answer area — the caller decides who is asked. */
  mode?: "read" | "answer";
  onAnswer?: (answer: ChoiceAnswer) => Promise<void>;
  /** The second exit. Without it, it does not appear. */
  onResolve?: (reason: string) => Promise<void>;
  /**
   * The third exit: not now. Without the callback there is no button — the
   * same rule as `onResolve`, and the reason the deferral has been built in
   * the database for months and used **zero** times: nothing offered it.
   */
  onDefer?: (until: string, reason: string) => Promise<void>;
  /**
   * Why deferring is not possible right now — from the third time on only a
   * person may defer, and only the caller knows who is looking. The button
   * stays visible and disabled with this sentence next to it: a way that
   * disappears looks like a way that never existed.
   */
  deferLockedReason?: string;
  pending?: boolean;
  error?: string;
}) {
  const [resolving, setResolving] = useState(false);
  const [deferring, setDeferring] = useState(false);
  const [until, setUntil] = useState<string | null>(defaultDeferralDay());
  // Generated, not hard-coded: several cards stand in one list, and two
  // elements with the same id are a label that points at the wrong field.
  const dayId = useId();
  const hintId = useId();
  const whyId = useId();

  /**
   * Hold the day inside the window — **once the field is left**, so the
   * correction is visible without fighting the typing. An empty field is
   * someone about to type, not a mistake: it fills itself only on confirm,
   * where the net sits.
   */
  function clampOnLeave() {
    if (until === null) return;
    const day = clampDeferralDay(until);
    if (day !== until) setUntil(day);
  }

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
  /**
   * The two exits are **not** bound to the answer. A question one cannot
   * answer any more is exactly the one to resolve or defer — the eight legacy
   * `document_upload` rows are that case, and they lost both ways as long as
   * the exits hung on `canAnswer`.
   */
  const canExit = mode === "answer" && !isComment;

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

      {/* What a deferral says, and it says it in four sentences, not in a
          date: until when, why, how often already — and, if it hangs on a
          counter-question, that the answer to **that** question is the real
          condition. The state word itself comes from the registry, above. */}
      {c.state === "deferred" && c.deferredUntil ? (
        <Callout tone="soft">
          <strong>
            Zurückgestellt bis <Time value={c.deferredUntil} format="date" size="sm" />
          </strong>
          {c.deferredReason ? <> · {c.deferredReason}</> : null}
          {(c.deferredCount ?? 0) > 1 ? (
            <>
              {" · "}
              zum {c.deferredCount}. Mal zurückgestellt
            </>
          ) : null}
          {c.deferredBy ? (
            <p className="v2clc__deferby">
              Endet mit der Antwort auf{" "}
              {c.deferredBy.href ? (
                <a className="v2link" href={c.deferredBy.href}>
                  „{c.deferredBy.title}"
                </a>
              ) : (
                <>„{c.deferredBy.title}"</>
              )}{" "}
              — nicht am Datum.
            </p>
          ) : null}
        </Callout>
      ) : null}

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
        </div>
      ) : null}

      {canExit && onResolve ? (
        <p className="v2clc__exit">
          <ActionIcon action="help" size={14} />
          Woanders geklärt?{" "}
          <TextButton onClick={() => setResolving(true)}>Ohne Antwort auflösen</TextButton>
        </p>
      ) : null}
      {canExit && onDefer ? (
        <p className="v2clc__exit">
          <ActionIcon action="time" size={14} />
          Jetzt nicht zu klären?{" "}
          <TextButton
            onClick={() => setDeferring(true)}
            disabled={Boolean(deferLockedReason)}
            {...(deferLockedReason ? { "aria-describedby": whyId } : {})}
          >
            Zurückstellen
          </TextButton>
          {deferLockedReason ? (
            <span className="v2clc__exitwhy" id={whyId}>
              {deferLockedReason}
            </span>
          ) : null}
        </p>
      ) : null}

      {onDefer ? (
        <ReasonDialog
          open={deferring}
          onClose={() => setDeferring(false)}
          onConfirm={(reason) => {
            setDeferring(false);
            const day = clampDeferralDay(until);
            setUntil(day);
            void onDefer(day, reason);
          }}
          title="Zurückstellen"
          kicker="Die Frage kommt am Wiedervorlagetag zurück"
          label="Warum jetzt nicht?"
          placeholder="z. B. wartet auf den Jahresabschluss des Mandanten"
          confirmLabel="Zurückstellen"
          required
          chips={["wartet auf Unterlagen", "erst nach dem Monatslauf", "Rückfrage beim Mandanten läuft"]}
          pending={pending}
        >
          {/* The date sits **above** the reason, in the slot `ReasonDialog`
              keeps for „what is this reason for". No second dialog: this one
              already carries the mandatory reason and its lock. */}
          {/* Geklemmt wird **beim Verlassen**, nicht bei jedem Anschlag: ein
              natives Datumsfeld meldet jede Ziffer der Jahreszahl einzeln, so
              dass „2026" durch 0002, 0020 und 0202 läuft — und eine Korrektur
              auf jedem dieser Werte schriebe dem Tippenden Segmente um, die er
              gar nicht angefasst hat. `DateRangeField` löst dasselbe Problem
              zehn Zeilen weiter oben genauso (`swapIfInverted`, Befund aus der
              Abnahme von 0024). Das Netz im Bestätigungspfad bleibt. */}
          <Field label="Wiedervorlage am" htmlFor={dayId}>
            <DateField
              id={dayId}
              value={until}
              onChange={(value) => setUntil(clampTyped(value))}
              onBlur={clampOnLeave}
              min={defaultDeferralDay()}
              max={maxDeferralDay()}
              describedBy={hintId}
            />
          </Field>
          <p className="v2clc__deferhint" id={hintId}>
            Höchstens {DEFERRAL_MAX_DAYS} Tage voraus — ein Monatslauf.
          </p>
        </ReasonDialog>
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
