/**
 * Die Sachverhalt-Formen der App → die Formen der DS-Bausteine (F249).
 *
 * `CaseTimeline` und `ClarificationList`/`ClarificationCard` bringen ihre
 * eigenen Typen mit. Die Übersetzung steht hier, rein — ohne React, ohne DB —,
 * damit sie testbar ist und Server wie Client sie importieren können.
 */
import type {
  CaseTimelineClarification,
  CaseTimelineEvent,
  CaseTimelineExpectation,
  ClarificationDetailVM,
  ClarificationSource,
  ClarificationVM,
} from "@ludwig/designsystem";

import { asCurrency } from "@/ludwig/shared/money";

import { clarificationState, type ExpectationKind } from "./case";
import type { CaseClarificationEntry, TimelineEventVM } from "./overview-vm";
import { RATIONALE_SOURCE_KINDS, type RationaleSourceKind } from "./rationale-source";

/** Eine Expectation, wie die Seite sie für „Fehlt" schon hat. */
export interface TimelineExpectationInput {
  expectationId: string;
  kind: string | null;
  counterpartyName: string | null;
  amount: number | null;
  dueDate: string;
  escalationLevel: number;
}

/** `created_at::text` („2026-09-18 10:12:33.1+00") → ISO; Unlesbares bleibt, wie es ist. */
function toIso(raw: string): string {
  const d = new Date(raw.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00"));
  return Number.isNaN(d.getTime()) ? raw : d.toISOString();
}

/** Überschrift: Titel, sonst die Frage, sonst der Anfang des Textes. */
function entryTitle(c: CaseClarificationEntry): string {
  return c.title?.trim() || c.question?.trim() || c.text.slice(0, 80);
}

export function toCaseTimelineEvent(ev: TimelineEventVM): CaseTimelineEvent {
  return {
    id: ev.eventId,
    kind: ev.kind,
    date: ev.rawDate,
    title: ev.title,
    // Bei der Sammelzahlung ist `amount` die ganze Bankzeile; den Anteil
    // dieses Sachverhalts zeigt der Baustein aus `allocatedAmount`.
    amount: ev.amount,
    allocatedAmount: ev.allocatedAmount,
    note: ev.note,
    accrualPeriod: ev.accrualPeriod,
    currency: asCurrency(ev.currency),
    state: ev.state,
    superseded: ev.superseded,
    stateNote: ev.infoNote,
    bookingState: ev.booking?.status ?? null,
  };
}

/** Nur Fragen — der Aufrufer filtert; Notizen stehen nicht im Strang. */
export function toCaseTimelineClarification(c: CaseClarificationEntry): CaseTimelineClarification {
  return {
    id: c.id,
    type: c.entryType,
    title: entryTitle(c),
    raisedAt: toIso(c.createdAt),
    answeredAt: c.answeredAt ? toIso(c.answeredAt) : null,
    deferredUntil: c.deferredUntil,
    severity: c.severity,
    audience: c.audience,
  };
}

export function toCaseTimelineExpectation(
  e: TimelineExpectationInput,
  currency: string,
): CaseTimelineExpectation {
  return {
    id: e.expectationId,
    kind: (e.kind ?? "document") as ExpectationKind,
    dueDate: e.dueDate,
    escalationLevel: e.escalationLevel,
    counterpartyName: e.counterpartyName,
    amount: e.amount,
    currency: asCurrency(currency),
  };
}

export function toClarificationEntry(
  c: CaseClarificationEntry,
  today: string,
): ClarificationVM & ClarificationDetailVM {
  const isComment = c.entryType === "comment";
  return {
    id: c.id,
    type: c.entryType,
    title: entryTitle(c),
    state: clarificationState({ answeredAt: c.answeredAt, deferredUntil: c.deferredUntil, today }),
    severity: c.severity,
    audience: c.audience,
    raisedAt: toIso(c.createdAt),
    answeredAt: c.answeredAt ? toIso(c.answeredAt) : null,
    deferredUntil: c.deferredUntil,
    text: c.text,
    question: c.question,
    context: c.context,
    recommendation: c.recommendation,
    facts: c.facts,
    // Die Karte kennt nur die Quellarten der Begründung; eine unbekannte
    // Art hätte kein Symbol und keinen Weg.
    sources: c.sources
      .filter((s): s is typeof s & { kind: RationaleSourceKind } =>
        (RATIONALE_SOURCE_KINDS as readonly string[]).includes(s.kind),
      )
      .map(
        (s): ClarificationSource => ({ kind: s.kind, label: s.citation ?? s.accountNumber ?? s.kind }),
      ),
    // Eine Notiz erwartet keine Antwort.
    answerKind: isComment ? "free_text" : (c.answerKind as ClarificationDetailVM["answerKind"]),
    answerOptions: c.answerOptions,
    allowFreeText: c.allowFreeText,
    questionType: c.questionType,
    sourceModule: c.sourceModule,
    deferredReason: c.deferredReason,
    deferredCount: c.deferredCount,
    answeredBy: c.authorName,
  };
}
