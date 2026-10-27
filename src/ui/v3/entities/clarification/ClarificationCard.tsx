"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { ClarificationAnswerKind } from "@/ludwig/modules/invoices/domain/invoice";
import {
  MAX_DEFERRAL_DAYS,
  clarificationModuleLabel,
  clarificationQuestionTypeLabel,
} from "@/ludwig/modules/accounting-cases/domain/case";
import type { RationaleSourceKind } from "@/ludwig/modules/accounting-cases/domain/rationale-source";
import type { Actor } from "@/ludwig/modules/audit-log/domain/types";

import type { Currency } from "@/ludwig/shared/money";
import { AmountCell } from "../../primitives/Cells";
import { Callout } from "../../primitives/Callout";
import { Disclosure } from "../../primitives/Disclosure";
import { Link } from "../../primitives/Link";
import { CardHead, HeadRow, Row, Table } from "../../primitives/Table";
import { DateField } from "../../primitives/DateField";
import { Field } from "../../primitives/Form";
import { FieldList } from "../../primitives/FieldList";
import { Markdown } from "../../primitives/Markdown";
import { ReasonDialog } from "../../primitives/ReasonDialog";
import { TextButton } from "../../primitives/TextButton";
import { useFocusOnNewRecord } from "../../primitives/focus";
import { DateRange, Time } from "../../primitives/Time";
import { ActionIcon, EntityIcon, type EntityKey } from "../../Icons";
import { StatusBadge } from "../../patterns/StatusBadge";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import { ChoicePrompt, type ChoiceAnswer } from "../../patterns/ChoicePrompt";
import { BankTransactionPurpose } from "../bank-transaction/BankTransactionPurpose";
import { AUDIENCE_LABEL, RESOLVED_WORD, type ClarificationVM } from "./Clarification";

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


/** What each history entry is; the four `case.clarification_*` audit actions. */
export type ClarificationEventKind = "raised" | "answered" | "resolved" | "deferred";

const EVENT_LABEL: Record<ClarificationEventKind, string> = {
  raised: "Gefragt",
  answered: "Beantwortet",
  resolved: RESOLVED_WORD,
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

/**
 * The name to print. Never „—": somebody acted, even if it was a machine.
 *
 * @when    Naming who asked, answered, resolved or deferred a clarification.
 * @instead A person in a log row → LogList's own actor cell.
 */
export function actorName(by: ClarificationActor | null | undefined, fallback: string): string {
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
  /** For `onSelect` (0214); without it the label is the key. */
  id?: string;
  cited?: boolean;
}

/**
 * What the question rests on, by kind (0214): documents, accounts, payments,
 * entries — plus the sources that fit none. The app puts the cited sources
 * into their group (E2); `cited` marks what Ludwig named, and those stand first.
 */
export interface EvidenceRow {
  id: string;
  /** Ludwig named it in the rationale. */
  cited?: boolean;
  /** Without `onSelect` on the card the row links here. */
  href?: string;
}
export interface EvidenceDocument extends EvidenceRow {
  date: string | null;
  issuer: string | null;
  number: string | null;
  amount: number | null;
  currency: Currency | null;
}
export interface EvidenceAccount extends EvidenceRow {
  number: string;
  name: string | null;
}
export interface EvidencePayment extends EvidenceRow {
  date: string;
  amount: number;
  currency: Currency;
  /** The counterparty's name as the statement line carries it. */
  counterparty: string | null;
  /** The raw purpose (0214, owner 2026-10-01): its own column, read through BankTransactionPurpose. */
  purpose: string | null;
  paymentAccount: string | null;
}
export interface EvidenceEntry extends EvidenceRow {
  date: string;
  debit: string | null;
  credit: string | null;
  amount: number;
  currency: Currency;
  taxKey?: string | null;
  /** Axis `journal_entry` — a proposal carries its state. */
  state?: string | null;
}
/** The case the question belongs to (0222) — in the step form it is not on screen otherwise. */
export interface EvidenceCase extends EvidenceRow {
  number: string;
  title: string | null;
}
/**
 * A bank statement, as the import batch carries it (0222; GLOSSARY, document
 * kinds point 4): the payment account and the period it covers.
 */
export interface EvidenceStatement extends EvidenceRow {
  paymentAccount: string;
  periodFrom: string | null;
  periodTo: string | null;
}
export interface ClarificationEvidence {
  cases?: readonly EvidenceCase[];
  documents?: readonly EvidenceDocument[];
  accounts?: readonly EvidenceAccount[];
  payments?: readonly EvidencePayment[];
  entries?: readonly EvidenceEntry[];
  statements?: readonly EvidenceStatement[];
  /** Contract, rule, clarification, law, web … — what fits no group. */
  other?: readonly ClarificationSource[];
}
export type EvidenceKind = "case" | "document" | "payment" | "statement" | "account" | "entry" | "other";

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
  /**
   * The asker's own suggestion (10 %). With `recommendedOption` set it is only
   * the why, one sentence; without, it is the whole recommendation, and if it
   * names an option verbatim that option is preselected (stock and transition).
   */
  recommendation?: string | null;
  /**
   * The recommended answer, verbatim one of `answerOptions` — at most one, the
   * server refuses anything else (0214, owner 2026-10-24). Preselected and
   * marked „empfohlen" in its row. For `yes_no` it is the key, `"yes"` or
   * `"no"` (0222 Nachtrag; the server check follows with L-368).
   */
  recommendedOption?: string | null;
  facts?: readonly { label: string; value: string }[];
  sources?: readonly ClarificationSource[];
  /**
   * The question type as stored on the row. Its **word** comes from the domain
   * (`clarificationQuestionTypeLabel`, finding L-10); an unknown slug is made
   * readable, not dropped.
   */
  questionType?: string | null;
  /** The module the question came from; the word comes from the domain (`clarificationModuleLabel`, L-11). */
  sourceModule?: string | null;
  /** Override of the question-type word, if a caller needs one. */
  questionTypeLabel?: string | null;
  /** Override of the origin word ("Buchungsvorschlag", "Kanzlei"). */
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
  /** What the question rests on, by kind (0214). Given, it replaces the flat `sources` list. */
  evidence?: ClarificationEvidence | null;
  /**
   * Marked for the client, with this note (0222): the card says so above the
   * answer and fills the note field with it. `null` = not marked.
   */
  clientNote?: string | null;
}

/**
 * **30 days, the length of one posting run.** The rule belongs to the app
 * (`F105`) and lives there since 2026-09-07 (`9c60caf4`, finding L-91): the
 * card imports it rather than repeating it. Mirrored, not invented — a card
 * that lets someone pick a day the server refuses has told them nothing.
 */
const DEFERRAL_MAX_DAYS = MAX_DEFERRAL_DAYS;

const DAY_MS = 24 * 60 * 60 * 1000;

/** `yyyy-mm-dd` in the local calendar — the same day the user sees. */
function isoDay(date: Date): string {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
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
 * held in two places, and each one exists for a reason:
 *
 *  - **on leaving the field** (`onBlur`), where the correction is visible and
 *    nothing is being typed any more;
 *  - **on confirm**, as the net that nothing gets past.
 *
 * Not at the change. A first attempt corrected there and spared the year by
 * ignoring years below 1000 — but month and day have no such tell: „01" is a
 * legitimate month, and in a window from 08.09. to 07.10. everyone who types
 * October passes through January. Measured, the **day** jumped from 20 to 08
 * while someone was typing the month (acceptance of 0065, round 3).
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

/** Cited first, the order of the app otherwise. */
function citedFirst<T extends { cited?: boolean }>(rows: readonly T[]): T[] {
  return [...rows.filter((r) => r.cited), ...rows.filter((r) => !r.cited)];
}

type Select = ((item: { kind: EvidenceKind; id: string }) => void) | undefined;

/** The key cell of an evidence row: a button when the caller opens a drawer, a link when it navigates. */
function Pick({
  kind,
  row,
  select,
  children,
  inRow = true,
}: {
  kind: EvidenceKind;
  row: EvidenceRow;
  select: Select;
  children: React.ReactNode;
  /** In a table row the pick covers the row; in the plain list of other sources it must not (its overlay would cover the card). */
  inRow?: boolean;
}) {
  const rowLink = inRow ? " v2rowlink" : "";
  const body = (
    <>
      {children}
      {row.cited ? <span className="v2sub v2clc__cited">genannt</span> : null}
    </>
  );
  if (select)
    return (
      // `v2rowlink`: the button's overlay covers the whole row — a click on the
      // issuer calls it too (acceptance 0214, M1; I11).
      <button type="button" className={`v3cell-link v2clc__pick${rowLink}`} onClick={() => select({ kind, id: row.id })}>
        {body}
      </button>
    );
  if (row.href)
    return (
      <Link href={row.href} className={`v3cell-link${rowLink}`}>
        {body}
      </Link>
    );
  return <span>{body}</span>;
}

function EvidenceTable({ cols, head, children }: { cols: string; head: string[]; children: React.ReactNode }) {
  return (
    <Table cols={cols} density="compact">
      <HeadRow>
        {head.map((h, i) => (
          <span key={h || i} className={h === "Betrag" ? "v2num" : undefined}>
            {h}
          </span>
        ))}
      </HeadRow>
      {children}
    </Table>
  );
}

/** The two answers of a yes/no question: keys for the app, words for the reader (0222 Nachtrag). */
const YES_NO: readonly { id: "yes" | "no"; label: string }[] = [
  { id: "yes", label: "Ja" },
  { id: "no", label: "Nein" },
];

/** The groups in the order of the step form (owner wireframe 2026-10-24) — one order for both forms. */
function evidenceGroups(e: ClarificationEvidence) {
  return {
    cases: citedFirst(e.cases ?? []),
    docs: citedFirst(e.documents ?? []),
    pays: citedFirst(e.payments ?? []),
    stmts: citedFirst(e.statements ?? []),
    accs: citedFirst(e.accounts ?? []),
    ents: citedFirst(e.entries ?? []),
    other: citedFirst(e.other ?? []),
  };
}

/**
 * Sources and context in one block (owner 2026-09-29): one fold-out per kind,
 * its count in the head, the rows in columns — amounts right, digits of one
 * width. A click calls `onSelect` and does not navigate: the answer half
 * typed stays, the caller opens a drawer.
 */
function Evidence({ e, select }: { e: ClarificationEvidence; select: Select }) {
  const { cases, docs, pays, stmts, accs, ents, other } = evidenceGroups(e);
  if (cases.length + docs.length + pays.length + stmts.length + accs.length + ents.length + other.length === 0) return null;
  return (
    <Block label="Quellen und Kontext">
      <div className="v2clc__evidence">
        {cases.length ? (
          <Disclosure summary="Sachverhalt" count={cases.length}>
            <EvidenceTable cols="96px minmax(0, 1fr)" head={["Nummer", "Titel"]}>
              {cases.map((x) => (
                <Row key={x.id}>
                  <Pick kind="case" row={x} select={select}>
                    <span className="v2mono">{x.number}</span>
                  </Pick>
                  <span className="v2trunc" title={x.title ?? undefined}>{x.title ?? "—"}</span>
                </Row>
              ))}
            </EvidenceTable>
          </Disclosure>
        ) : null}
        {docs.length ? (
          <Disclosure summary="Belege" count={docs.length}>
            <EvidenceTable cols="88px minmax(0, 1.4fr) minmax(0, 1fr) 112px" head={["Datum", "Aussteller", "Beleg-Nr.", "Betrag"]}>
              {docs.map((d) => (
                <Row key={d.id}>
                  <Pick kind="document" row={d} select={select}>
                    {d.date ? <Time value={d.date} format="date" size="sm" /> : "—"}
                  </Pick>
                  <span className="v2trunc" title={d.issuer ?? undefined}>{d.issuer ?? "—"}</span>
                  <span className="v2mono v2trunc">{d.number ?? "—"}</span>
                  <span className="v2num">{d.amount === null ? "—" : <AmountCell value={d.amount} currency={d.currency} />}</span>
                </Row>
              ))}
            </EvidenceTable>
          </Disclosure>
        ) : null}
        {pays.length ? (
          <Disclosure summary="Zahlungen" count={pays.length}>
            <EvidenceTable cols="88px 112px minmax(0, 1fr) minmax(0, 1.4fr) minmax(0, 0.8fr)" head={["Datum", "Betrag", "Gegenpartei", "Verwendungszweck", "Zahlungskonto"]}>
              {pays.map((p) => (
                <Row key={p.id}>
                  <Pick kind="payment" row={p} select={select}>
                    <Time value={p.date} format="date" size="sm" />
                  </Pick>
                  <span className="v2num">
                    <AmountCell value={p.amount} currency={p.currency} />
                  </span>
                  <span className="v2trunc" title={p.counterparty ?? undefined}>{p.counterparty ?? "—"}</span>
                  <BankTransactionPurpose purpose={p.purpose} />
                  <span className="v2trunc" title={p.paymentAccount ?? undefined}>{p.paymentAccount ?? "—"}</span>
                </Row>
              ))}
            </EvidenceTable>
          </Disclosure>
        ) : null}
        {stmts.length ? (
          <Disclosure summary="Kontoauszug" count={stmts.length}>
            <EvidenceTable cols="minmax(0, 1fr) minmax(0, 1fr)" head={["Zahlungskonto", "Zeitraum"]}>
              {stmts.map((x) => (
                <Row key={x.id}>
                  <Pick kind="statement" row={x} select={select}>
                    <span className="v2trunc" title={x.paymentAccount}>{x.paymentAccount}</span>
                  </Pick>
                  <DateRange from={x.periodFrom} to={x.periodTo} size="sm" />
                </Row>
              ))}
            </EvidenceTable>
          </Disclosure>
        ) : null}
        {accs.length ? (
          <Disclosure summary="Konten" count={accs.length}>
            <EvidenceTable cols="96px minmax(0, 1fr)" head={["Konto", "Name"]}>
              {accs.map((a) => (
                <Row key={a.id}>
                  <Pick kind="account" row={a} select={select}>
                    <span className="v2mono">{a.number}</span>
                  </Pick>
                  <span className="v2trunc">{a.name ?? "—"}</span>
                </Row>
              ))}
            </EvidenceTable>
          </Disclosure>
        ) : null}
        {ents.length ? (
          <Disclosure summary="Buchungen" count={ents.length}>
            <EvidenceTable cols="88px 72px 72px 112px 48px minmax(0, 1fr)" head={["Datum", "Soll", "Haben", "Betrag", "BU", "Stand"]}>
              {ents.map((x) => (
                <Row key={x.id}>
                  <Pick kind="entry" row={x} select={select}>
                    <Time value={x.date} format="date" size="sm" />
                  </Pick>
                  <span className="v2mono">{x.debit ?? "—"}</span>
                  <span className="v2mono">{x.credit ?? "—"}</span>
                  <span className="v2num">
                    <AmountCell value={x.amount} currency={x.currency} />
                  </span>
                  <span className="v2mono">{x.taxKey ?? ""}</span>
                  <span>{x.state ? <StatusBadge axis="journal_entry" status={x.state} info={false} /> : null}</span>
                </Row>
              ))}
            </EvidenceTable>
          </Disclosure>
        ) : null}
        {other.length ? (
          <Disclosure summary="Weitere Quellen" count={other.length}>
            <ul className="v2clc__sources">
              {other.map((o) => (
                <li key={`${o.kind}:${o.id ?? o.label}`}>
                  <Pick kind="other" row={{ id: o.id ?? o.label, cited: o.cited, href: o.href }} select={select} inRow={false}>
                    {o.label}
                  </Pick>
                </li>
              ))}
            </ul>
          </Disclosure>
        ) : null}
      </div>
    </Block>
  );
}

/** Pieces of a sub-line, joined by „ · "; empty ones fall out. */
function joined(parts: React.ReactNode[]): React.ReactNode {
  const kept = parts.filter((p) => p !== null && p !== undefined && p !== "");
  return kept.map((p, i) => (
    <span key={i}>
      {i > 0 ? " · " : null}
      {p}
    </span>
  ));
}

interface PanelItem {
  row: EvidenceRow;
  main: React.ReactNode;
  sub?: React.ReactNode;
}

/** The sign of each kind in the box — from the registry; „Weitere Quellen" mix kinds and carry none. */
const PANEL_ICON: Record<EvidenceKind, EntityKey | null> = {
  case: "accounting-case",
  document: "source-document",
  payment: "bank-transaction",
  // The entry opens the payment account (0222), so it carries its sign.
  statement: "bank-account",
  account: "ledger-account",
  entry: "journal-entry",
  other: null,
};

/**
 * The same evidence as a list beside the question (0222): the step form has
 * no room for tables, and a list reads top to bottom next to the question.
 * Only groups with entries; the first two open; each entry opens its drawer.
 * A card of its own with a head (owner 2026-10-26): the place to look things
 * up, apart from the question and the answer.
 */
function EvidencePanel({ e, select }: { e: ClarificationEvidence; select: Select }) {
  const g = evidenceGroups(e);
  const all: { kind: EvidenceKind; label: string; items: PanelItem[] }[] = [
    {
      kind: "case",
      label: "Sachverhalt",
      items: g.cases.map((x) => ({ row: x, main: x.title ? `${x.number} · ${x.title}` : x.number })),
    },
    {
      kind: "document",
      label: "Belege",
      items: g.docs.map((d) => ({
        row: d,
        main: d.issuer ?? d.number ?? "Beleg",
        sub: joined([
          d.date ? <Time value={d.date} format="date" size="sm" /> : null,
          d.issuer ? d.number : null,
          d.amount === null ? null : <AmountCell value={d.amount} currency={d.currency} />,
        ]),
      })),
    },
    {
      kind: "payment",
      label: "Zahlungen",
      items: g.pays.map((p) => ({
        row: p,
        main: p.counterparty ?? p.purpose ?? "Zahlung",
        sub: joined([
          <Time value={p.date} format="date" size="sm" />,
          <AmountCell value={p.amount} currency={p.currency} />,
          p.paymentAccount,
        ]),
      })),
    },
    {
      kind: "statement",
      label: "Kontoauszug",
      items: g.stmts.map((x) => ({
        row: x,
        main: x.paymentAccount,
        sub: <DateRange from={x.periodFrom} to={x.periodTo} size="sm" />,
      })),
    },
    {
      kind: "account",
      label: "Konten",
      items: g.accs.map((a) => ({
        row: a,
        main: (
          <>
            <span className="v2mono">{a.number}</span>
            {a.name ? ` ${a.name}` : null}
          </>
        ),
      })),
    },
    {
      kind: "entry",
      label: "Buchungen",
      items: g.ents.map((x) => ({
        row: x,
        main: (
          <span className="v2mono">
            {x.debit ?? "—"} an {x.credit ?? "—"}
          </span>
        ),
        sub: joined([
          <Time value={x.date} format="date" size="sm" />,
          <AmountCell value={x.amount} currency={x.currency} />,
          x.taxKey ? `BU ${x.taxKey}` : null,
        ]),
      })),
    },
    {
      kind: "other",
      label: "Weitere Quellen",
      items: g.other.map((o) => ({ row: { id: o.id ?? o.label, cited: o.cited, href: o.href }, main: o.label })),
    },
  ];
  const groups = all.filter((x) => x.items.length > 0);
  if (groups.length === 0) return null;
  return (
    <aside className="v2card v2clc__side" aria-label="Kontext">
      <CardHead title="Kontext" headingLevel={3} />
      {groups.map((grp, i) => {
        const icon = PANEL_ICON[grp.kind];
        return (
          <Disclosure key={grp.kind} summary={grp.label} count={grp.items.length} defaultOpen={i < 2}>
            <ul className="v2clc__ctx">
              {grp.items.map((it) => (
                <li key={it.row.id}>
                  <Pick kind={grp.kind} row={it.row} select={select} inRow={false}>
                    <span className="v2clc__ctxico">{icon ? <EntityIcon entity={icon} size={14} /> : null}</span>
                    <span className="v2clc__ctxmain">{it.main}</span>
                    {it.sub ? <span className="v2clc__ctxsub">{it.sub}</span> : null}
                  </Pick>
                </li>
              ))}
            </ul>
          </Disclosure>
        );
      })}
    </aside>
  );
}

function Block({ label, children, level = 4 }: { label: string; children: React.ReactNode; level?: 3 | 4 }) {
  // Under the step form's `h2` the blocks are `h3` — no jump in the outline (A14, acceptance 0222, M5).
  const Heading = level === 3 ? "h3" : "h4";
  return (
    <section className="v2clc__block">
      <Heading className="v2clc__label">{label}</Heading>
      {children}
    </section>
  );
}

function HistoryBlock({ history, level }: { history: readonly ClarificationEvent[]; level?: 3 | 4 }) {
  return (
    // „dieser Frage": the course of the whole case is the thread below the
    // card (ClarificationThread, 0214) — two blocks must not share a name.
    <Block label="Verlauf dieser Frage" level={level}>
      <ol className="v2clc__hist">
        {history.map((e, i) => (
          <li key={`${e.kind}-${e.at}-${i}`}>
            <span className="v2clc__histHead">
              <strong>{EVENT_LABEL[e.kind]}</strong>
              {" von "}
              {actorName(e.by, e.kind === "raised" ? "Ludwig" : "System")}
              {" · "}
              <Time value={e.at} format="dateTime" size="sm" />
            </span>
            {e.text ? <p className="v2clc__histText">{e.text}</p> : null}
          </li>
        ))}
      </ol>
    </Block>
  );
}

/**
 * `variant="step"` is the slim form inside a review run (0222): question as
 * the headline, no state badges, no meta line, no „asked" entry in the
 * history, the recommendation right under the options, every way out in one
 * row — and the evidence as a list in a box on the right.
 *
 * @when    One clarification with everything it carries — read it, or answer
 *          it where the reader is the one being asked; `step` when it is one
 *          of several answered in a row.
 * @instead Several of them in a list → ClarificationList. Named inside
 *          something else → ClarificationCell. Asking a new one →
 *          ClarificationEditor.
 */
export function ClarificationCard({
  clarification: c,
  mode = "read",
  showTitle = true,
  onAnswer,
  onResolve,
  onDefer,
  deferLockedReason,
  pending,
  error,
  caseLink,
  onSelect,
  submitLabel = "Antwort speichern",
  onUndefer,
  variant = "card",
  onAskClient,
}: {
  clarification: ClarificationVM & ClarificationDetailVM;
  /** `answer` shows the answer area — the caller decides who is asked. */
  mode?: "read" | "answer";
  /**
   * `false` inside a `ClarificationRow` that folds open: the row already
   * carries title and state, the card would repeat them right below. The
   * meta line stays — it names the origin, which the row does not
   * (owner 2026-09-18).
   */
  showTitle?: boolean;
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
  /** „Sachverhalt 2026-0042 · Titel" — in the batch review; on the case page it is left out (0214). */
  caseLink?: { label: string; href: string };
  /** A click on an evidence row: the caller opens a drawer, nothing navigates (0214). */
  onSelect?: (item: { kind: EvidenceKind; id: string }) => void;
  /** The words of the main button — the batch review says „… und zurück an Ludwig". */
  submitLabel?: string;
  /** Lift the deferral — a small line like the other exits, not below the card (0214). */
  onUndefer?: () => Promise<void>;
  /** `step`: the slim form of a review run, evidence on the right (0222). */
  variant?: "card" | "step";
  /**
   * The fourth exit: only the client knows (0222). It swaps the answer for a
   * note field; without the callback there is no way, as with `onResolve`.
   */
  onAskClient?: (note: string) => Promise<void>;
}) {
  const [resolving, setResolving] = useState(false);
  // Held per question: a pager that swaps the clarification under the same
  // card must not carry the note mode over to the next one.
  const [askingFor, setAskingFor] = useState<string | null>(null);
  const asking = askingFor === c.id;
  const setAsking = (on: boolean) => setAskingFor(on ? c.id : null);
  // Focus follows the swap (acceptance 0222, M3): into the note when it opens,
  // back to the way that opened it when it closes — never onto the body.
  const articleRef = useRef<HTMLElement>(null);
  const askId = useId();
  // Which question had its note open on the last render — an id, not a flag:
  // paging away must neither keep the mode for the way back nor hand the focus
  // to the next question's button (acceptance 0222, M6).
  const wasAskingFor = useRef<string | null>(null);
  useEffect(() => {
    if (asking) articleRef.current?.querySelector<HTMLTextAreaElement>("[data-client-note] textarea")?.focus();
    else if (wasAskingFor.current === c.id) document.getElementById(askId)?.focus();
    wasAskingFor.current = asking ? c.id : null;
  }, [asking, askId, c.id]);
  // A new question under the same card (a pager paged, an answer was saved):
  // the note mode ends, and if the focus was in the card or lost, it goes to
  // the new question's heading — read aloud, one Tab to its first option. A
  // focus on the pager stays there, so paging by keyboard keeps its place
  // (rule for single reviews under RecordPager, llcto 2026-10-26).
  const headingRef = useRef<HTMLHeadingElement>(null);
  useFocusOnNewRecord(c.id, articleRef, headingRef, () => setAskingFor(null));
  const [deferring, setDeferring] = useState(false);
  const [until, setUntil] = useState<string | null>(defaultDeferralDay());
  // Generated, not hard-coded: several cards stand in one list, and two
  // elements with the same id are a label that points at the wrong field.
  const dayId = useId();
  const hintId = useId();
  const whyId = useId();
  const replyId = useId();

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
  // The words come from the domain; a prop overrides them only when a caller
  // really needs another (L-10, L-11).
  const questionWord =
    c.questionTypeLabel ??
    (c.questionType ? clarificationQuestionTypeLabel(c.questionType) : null);
  const originWord =
    c.originLabel ?? (c.sourceModule ? clarificationModuleLabel(c.sourceModule) : null);
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
  // The recommended option is named by the app (0214, 2026-10-24) and marked
  // in its row. Without it, a recommendation that names an option verbatim
  // becomes the preselection, unmarked — stock and transition look as before.
  // yes_no is a choice of two (0222 Nachtrag, llcto 2026-10-26): English keys,
  // German words — the app stores `answerPayload: { value: boolean }` and maps
  // `"yes"`/`"no"` itself. Always these two, whatever `answerOptions` says: one
  // question, one set of keys. No registry axis carries the words (L-368).
  const choices: readonly { id: string; label: string }[] =
    c.answerKind === "yes_no" ? YES_NO : (c.answerOptions ?? []).map((label) => ({ id: label, label }));
  const recommendedId =
    c.recommendedOption && choices.some((o) => o.id === c.recommendedOption) ? c.recommendedOption : null;
  const options = choices.map((o) => ({ ...o, recommended: o.id === recommendedId }));
  // The word of the recommendation where no row can carry the mark (read mode).
  const recommendedWord = choices.find((o) => o.id === c.recommendedOption)?.label ?? c.recommendedOption;
  const preselected =
    recommendedId ?? options.find((o) => o.label === c.recommendation?.trim())?.id ?? null;
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
  // Marked in its row, the option is not named again — the callout gives the why.
  const markedInRow = canAnswer && recommendedId !== null;

  const step = variant === "step";
  const deferredUndo = c.state === "deferred" && Boolean(onUndefer);

  // The callout of the recommendation — where it stands depends on the form.
  const recommendationNote = markedInRow ? (
    c.recommendation ? (
      <Callout tone="soft">
        <strong>Warum empfohlen:</strong> {c.recommendation}
      </Callout>
    ) : null
  ) : c.recommendedOption ? (
    // No row to mark (read mode, answered): a why without its what says nothing.
    <Callout tone="soft">
      <strong>Empfehlung: {recommendedWord}</strong>
      {c.recommendation ? <> · {c.recommendation}</> : null}
    </Callout>
  ) : c.recommendation ? (
    <Callout tone="soft">
      <strong>Empfehlung:</strong> {c.recommendation}
    </Callout>
  ) : null;
  // In the step form it sits right under the options — nothing between the
  // mark and its why (0222; hint 4 of the acceptance of 0214).
  const noteUnderOptions = step && canAnswer;

  // The ways out, as text buttons — in the step form one row under the
  // options, in the card each on its own small line.
  const askButton = canExit && onAskClient ? (
    // Locked while an answer is on its way (acceptance 0222, H3): a way out
    // must not start while the save runs.
    <TextButton id={askId} onClick={() => setAsking(true)} disabled={pending}>
      Beim Mandanten klären
    </TextButton>
  ) : null;
  const resolveButton = canExit && onResolve ? (
    <TextButton onClick={() => setResolving(true)} disabled={pending}>
      {RESOLVED_WORD}
    </TextButton>
  ) : null;
  // A fragment, as before: in the card's line the gap of the line spaces the
  // reason (acceptance 0222, M1); the step row wraps it in one item.
  const deferButton = canExit && onDefer && !deferredUndo ? (
    <>
      <TextButton
        onClick={() => setDeferring(true)}
        disabled={Boolean(deferLockedReason) || pending}
        {...(deferLockedReason ? { "aria-describedby": whyId } : {})}
      >
        Zurückstellen
      </TextButton>
      {deferLockedReason ? (
        <span className="v2clc__exitwhy" id={whyId}>
          {deferLockedReason}
        </span>
      ) : null}
    </>
  ) : null;
  const undeferButton = canExit && deferredUndo ? (
    <TextButton onClick={() => void onUndefer?.()} disabled={pending}>
      Zurückstellung aufheben
    </TextButton>
  ) : null;
  const stepLinks =
    askButton || resolveButton || deferButton || undeferButton ? (
      <>
        {askButton}
        {resolveButton}
        {deferButton ? <span className="v2clc__linkitem">{deferButton}</span> : null}
        {undeferButton}
      </>
    ) : null;

  // Visible history: in the step form „asked by Ludwig" says nothing — every
  // question here was asked (0222).
  const shownHistory = step ? history.filter((e) => e.kind !== "raised") : history;

  const head = step ? (
    <header className="v2clc__head">
      {c.question && c.question.trim() !== c.title.trim() ? <p className="v2clc__topic">{c.title}</p> : null}
      <h2 className="lw-ui-section v2clc__q" ref={headingRef} tabIndex={-1}>
        {c.question ?? c.title}
      </h2>
      {/* No badge in the step form (owner 2026-10-26): every question here is
          open, nearly all block. One that need not be answered says so in a
          sentence from the registry. */}
      {c.severity === "optional" && !isComment ? (
        <p className="lw-ui-hint">{resolveStatus("clarification_severity", "optional").description}</p>
      ) : null}
      {caseLink ? (
        <p className="v2clc__case">
          <Link href={caseLink.href} className="v3cell-link">
            {caseLink.label}
          </Link>
        </p>
      ) : null}
    </header>
  ) : (
    <header className="v2clc__head">
      {showTitle ? (
        <>
          <h3 className="v2clc__title">{c.title}</h3>
          <div className="v2clc__badges">
            {isComment ? (
              <StatusBadge axis="clarification_type" status="comment" info={false} />
            ) : (
              <>
                <StatusBadge axis="clarification" status={c.state} info={false} />
                {c.state !== "answered" && c.severity === "required" ? (
                  <StatusBadge axis="clarification_severity" status="required" info={false} />
                ) : null}
              </>
            )}
          </div>
        </>
      ) : null}
      {caseLink ? (
        <p className="v2clc__case">
          <Link href={caseLink.href} className="v3cell-link">
            {caseLink.label}
          </Link>
        </p>
      ) : null}
      <p className="v2clc__meta">
        {isComment ? "Notiz" : `Gefragt ist: ${AUDIENCE_LABEL[c.audience]}`}
        {/* Who asked — several people work on one case (owner 2026-09-29, 0214). */}
        {/* Only when a person or the system asked — for Ludwig the origin word
            already says „von Ludwig" (acceptance 0214, M3/M6). */}
        {c.raisedBy && !(typeof c.raisedBy !== "string" && c.raisedBy.kind === "agent")
          ? ` · ${isComment ? "von" : "gefragt von"} ${actorName(c.raisedBy, "Ludwig")}`
          : ""}
        {questionWord ? ` · ${questionWord}` : ""}
        {originWord ? ` · ${originWord}` : ""}
        {" · "}
        <Time value={c.raisedAt} format="dateTime" size="sm" />
      </p>
    </header>
  );

  const evidence = c.evidence ?? (c.sources && c.sources.length > 0 ? { other: c.sources } : null);
  // Groups given but all empty are no evidence: no box, no empty column (acceptance 0222, M4).
  const evidenceCount = evidence
    ? Object.values(evidenceGroups(evidence)).reduce((n, rows) => n + rows.length, 0)
    : 0;
  const side = step && evidence && evidenceCount > 0 ? <EvidencePanel e={evidence} select={onSelect} /> : null;

  // Two zones (owner 2026-10-26): what the question is about, and the answer.
  // The card renders them one after the other, as before; the step form gives
  // the answer a zone of its own.
  const about = (
    <>
      {head}

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
                <Link className="v2link" href={c.deferredBy.href}>
                  „{c.deferredBy.title}"
                </Link>
              ) : (
                <>„{c.deferredBy.title}"</>
              )}{" "}
              — nicht am Datum.
            </p>
          ) : null}
        </Callout>
      ) : null}

      {c.clientNote ? (
        <Callout tone="soft">
          <strong>Beim Mandanten zu klären:</strong> {c.clientNote}
        </Callout>
      ) : null}

      {/* While answering, `ChoicePrompt` carries the question — once is enough;
          the step form has it as its headline. */}
      {c.question && !canAnswer && !step ? <p className="v2clc__question">{c.question}</p> : null}
      {c.context ? <Markdown text={c.context} className="v2clc__prose" /> : null}
      <Markdown text={c.text} className="v2clc__prose" />

      {/* Recommendation first, then what it rests on (owner 2026-09-29, 0214). */}
      {noteUnderOptions ? null : recommendationNote}

      {c.facts && c.facts.length > 0 ? (
        <Block label="Grundlage" level={step ? 3 : 4}>
          <FieldList tone="soft" rows={c.facts.map((f) => [f.label, f.value])} />
        </Block>
      ) : null}

      {!step && evidence ? <Evidence e={evidence} select={onSelect} /> : null}

      {/* In the step form the course so far belongs to what the question is about. */}
      {shownHistory.length > 0 ? <HistoryBlock history={shownHistory} level={step ? 3 : undefined} /> : null}
    </>
  );

  const reply = (
    <>
      {legacyUpload ? (
        <Callout tone="warning">
          Diese Frage stammt aus der Zeit vor der Beleg-Erwartung. Der Beleg wird
          über die Nachforderung angefordert, nicht hier hochgeladen.
        </Callout>
      ) : null}

      {/* Both stay mounted while the other shows: whoever goes back finds what
          they typed (Eingabe bleibt). */}
      {canAnswer ? (
        <div className="v2clc__answer" hidden={asking}>
          <ChoicePrompt
            // Keyed by the question: paging to the next one starts from its
            // own preselection, not from the choice made on the last.
            key={c.id}
            question={c.question ?? c.title}
            hideQuestion={step}
            options={options}
            defaultOptionId={preselected}
            // With options: „Antwortoptionen" as whole rows, and the free text
            // always beside them (rule S13 — 0214, ll-cto); without: no heading,
            // only the field. In the step form the free text waits behind
            // „Anmerkung schreiben" (0222). It is a note to the chosen option,
            // sent with it — hence the word (llcto for the owner, 2026-10-27).
            optionsLabel="Antwortoptionen"
            optionStyle="rows"
            submitLabel={submitLabel}
            freeText={
              options.length === 0
                ? // Under the zone head „Ihre Antwort" the field must not say
                  // „Antwort" once more; the step form gives the hint as label.
                  step
                  ? { label: "Antwort oder Anweisung für die Buchung" }
                  : { label: "Antwort", placeholder: "Antwort oder Anweisung für die Buchung" }
                : step
                  ? { label: "Anmerkung", toggle: "Anmerkung schreiben" }
                  : { label: "Anmerkung" }
            }
            optionsNote={noteUnderOptions ? recommendationNote : undefined}
            links={step ? stepLinks : undefined}
            onSubmit={async (answer) => {
              await onAnswer?.(answer);
            }}
            pending={pending}
            error={error}
          />
        </div>
      ) : null}

      {canExit && onAskClient ? (
        <div
          className="v2clc__answer"
          data-client-note
          hidden={!asking}
          // Esc leaves the note without saving, like „Doch selbst beantworten";
          // what was typed stays (acceptance 0222, H8). Stopped here, so a
          // drawer around the card does not close with it.
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setAsking(false);
            }
          }}
        >
          <ChoicePrompt
            key={c.id}
            question="Notiz für den Mandanten"
            hideQuestion
            context="Die Frage geht mit dieser Notiz an den Mandanten."
            options={[]}
            freeText={{
              label: "Notiz für den Mandanten",
              placeholder: "Was soll der Mandant beantworten oder liefern?",
              required: true,
              defaultValue: c.clientNote ?? undefined,
              emptyHint: "Schreiben Sie eine Notiz für den Mandanten.",
            }}
            submitLabel="Beim Mandanten klären"
            links={<TextButton onClick={() => setAsking(false)}>Doch selbst beantworten</TextButton>}
            onSubmit={async (answer) => {
              await onAskClient(answer.text ?? "");
              setAsking(false);
            }}
            pending={pending}
            error={error}
          />
        </div>
      ) : null}

      {/* A step question one cannot answer (legacy upload) keeps its ways in the same row. */}
      {step && !canAnswer && !asking && stepLinks ? <div className="v2ask__links">{stepLinks}</div> : null}

      {!step && !asking ? (
        <>
          {askButton ? (
            <p className="v2clc__exit">
              <ActionIcon action="person" size={14} />
              Nur der Mandant weiß es? {askButton}
            </p>
          ) : null}
          {resolveButton ? (
            <p className="v2clc__exit">
              <ActionIcon action="help" size={14} />
              Woanders geklärt? {resolveButton}
            </p>
          ) : null}
          {deferButton ? (
            <p className="v2clc__exit">
              <ActionIcon action="time" size={14} />
              Jetzt nicht zu klären? {deferButton}
            </p>
          ) : null}
          {undeferButton ? (
            <p className="v2clc__exit">
              <ActionIcon action="time" size={14} />
              Doch jetzt klären? {undeferButton}
            </p>
          ) : null}
        </>
      ) : null}
    </>
  );
  // Read mode without a way out: the step form has no answer zone to show.
  const hasReply = canAnswer || legacyUpload || (canExit && Boolean(onAskClient)) || Boolean(stepLinks);

  return (
    <article ref={articleRef} className={step ? `v2clc v2clc--step${side ? " v2clc--side" : ""}` : "v2clc"}>
      {step ? (
        <>
          <div className="v2card v2clc__main">
            <div className="v2clc__about">{about}</div>
            {hasReply ? (
              <section className="v2clc__reply" aria-labelledby={replyId}>
                <h3 className="lw-ui-group" id={replyId}>
                  Ihre Antwort
                </h3>
                {reply}
              </section>
            ) : null}
          </div>
          {side}
        </>
      ) : (
        <>
          {about}
          {reply}
        </>
      )}

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
          {/* Clamped **on leaving the field**, never while typing: a native
              date input reports every keystroke separately, and not only for
              the year — typing October means passing through January, typing
              the 15th means passing through the 1st. No rule at the change
              can tell „is typing" from „chose January", so the correction
              waits until the field is done. `DateRangeField` solves the same
              problem the same way (`swapIfInverted`, found in the review of
              0024). The net on confirm stays. */}
          <Field label="Wiedervorlage am" htmlFor={dayId}>
            <DateField
              id={dayId}
              value={until}
              onChange={setUntil}
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
          // The word of the way that opened it, not a second process („auflösen"
          // read like another one — llcto 2026-10-26); the kicker says the
          // consequence, like the deferral's.
          title={RESOLVED_WORD}
          kicker="Die Frage zählt danach als beantwortet"
          label="Wie wurde das geklärt?"
          placeholder="z. B. telefonisch mit dem Mandanten"
          confirmLabel="Als geklärt vermerken"
          required
          // The reason follows the word „Anderweitig geklärt:" in the row — it does
          // not repeat „geklärt" (llcto 2026-10-27).
          chips={["telefonisch", "per Mail", "hat sich erledigt"]}
          pending={pending}
        />
      ) : null}
    </article>
  );
}
