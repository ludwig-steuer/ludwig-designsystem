"use client";

import {
  Banknote,
  ChevronRight,
  FileText,
  Globe,
  HelpCircle,
  History,
  Ruler,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

// Direct import, not the barrel: `@/ui/status` also exports `FlowModal` and
// pulls `@/modules/invoices` with the DB driver into the bundle (P22).
import { Confidence, type ConfidenceLevel } from "../../patterns/Confidence";
import { StateIcon, type StateKind } from "../../patterns/Review";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import { StatusBadge } from "../../patterns/StatusBadge";

/**
 * What the agent was thinking (F123 T123.3): the proposal's **rationale**
 * (`agent_rationale`), the **judge's assessment** (`reasoning_short`) and the
 * **sources** both rest on. Without them a proposal is a claim one can only
 * believe or reject.
 *
 * Collapsed by default — unless the judge flags it or there is an error.
 * **Collapsed is not gone** (2026-09-10): the box stands as soon as there is
 * something to read, `confirm` included — in the batch acceptance that is the
 * normal case, and exactly where "why does this entry look like this?" is asked.
 */

export type JudgeVerdict = "confirm" | "confirm_with_note" | "adjust" | "flag";

/**
 * Where a statement comes from. Icon **and** word — an icon alone is a riddle.
 *
 * **Seven kinds, not five** (2026-09-10, measured over 919 sources on
 * staging). Until then „Beleg" bundled three different things: the document
 * itself (361), a vendor's history (119) and a clarification (10). That is not
 * merely imprecise, it is wrong — „Beleg · Kreditor 70003, 14 Buchungen,
 * zuletzt 22.06." claims a document where an aggregation stands, and an
 * aggregation cannot be opened.
 *
 * `contract` and `ledger_account` exist in the app's schema but are never
 * written; they are missing here on purpose. Whoever writes them adds them.
 */
export type SourceKind =
  | "bank"
  | "beleg"
  | "history"
  | "klaerung"
  | "regel"
  | "gesetz"
  | "web";

const SOURCE_KIND: Record<SourceKind, { Icon: LucideIcon; label: string }> = {
  bank: { Icon: Banknote, label: "Kontoauszug" },
  beleg: { Icon: FileText, label: "Beleg" },
  history: { Icon: History, label: "Bisherige Buchungen" },
  klaerung: { Icon: HelpCircle, label: "Rückfrage" },
  regel: { Icon: Ruler, label: "Regel" },
  gesetz: { Icon: Scale, label: "Gesetz" },
  web: { Icon: Globe, label: "Web" },
};

/**
 * Which kinds **can** have a target — measured, not wished for.
 *
 * `bank`, `beleg` and `klaerung` always carry an id in the data, so there is
 * something to open. `history` is an aggregation over many entries, `regel`
 * carries **no** id at all (47 of 47 are prose), `gesetz` is a quotation, and
 * `web` does not occur in the stock.
 *
 * The list stands here so a caller does not have to guess: setting `onOpen` on
 * a kind that has no target builds a way the data cannot carry.
 *
 * **„Can", not „does".** A kind may be listed here and still arrive without
 * `onOpen` — `klaerung` does today, because the app has no clarification
 * drawer yet (only a route to the case). That is the right way round: the
 * constant says what the **data** allows, the caller says what it has built.
 */
export const SOURCE_OPENABLE: Record<SourceKind, boolean> = {
  bank: true,
  beleg: true,
  klaerung: true,
  history: false,
  regel: false,
  gesetz: false,
  web: false,
};

export interface AiSource {
  key: string;
  art: SourceKind;
  /**
   * What the source is **called** — „Rechnung 93846778", „§ 15 UStG".
   *
   * **Never an id.** Until 2026-09-10 a document source printed its UUID here,
   * because the caller had nothing else: `442c83b4-3063-46a4-…` as the only
   * word about a source is not information, it is a key nobody can look up.
   * Without a name only the kind and the quote stand there — and both say more
   * than an id.
   */
  label?: string | null;
  /** Verbatim quote from the source, if there is one. */
  quote?: string | null;
  href?: string | null;
  /**
   * **Open** the source without leaving the page (0155).
   *
   * The way into the entity's drawer: a document belongs beside the work, not
   * in its place. This component knows no entity — it calls the callback, and
   * the caller opens whatever is right. Without `onOpen` and without `href`
   * the source stays text.
   */
  onOpen?: () => void;
}

/**
 * @when    The agent's rationale and the judge's verdict on a proposal, collapsed by default.
 * @instead Messages about the booking entry → Messages.
 */
export function AiBookingNotes({
  verdict,
  confidence = null,
  rationale,
  judgeReasoning,
  sources = [],
  errors = [],
}: {
  verdict: JudgeVerdict | null;
  /** The proposal's confidence; `null` means no signal. */
  confidence?: ConfidenceLevel | null;
  /** `agent_rationale` — why the agent booked it this way. */
  rationale?: string | null;
  /** The judge's `reasoning_short`. */
  judgeReasoning?: string | null;
  sources?: AiSource[];
  /** The judge's blocking findings. */
  errors?: string[];
}) {
  const flagged = verdict === "flag" || errors.length > 0;
  const [open, setOpen] = useState(flagged);

  // **What is there gets shown — collapsed, but present.**
  //
  // Until 2026-09-10 the whole box disappeared on `confirm` without a finding,
  // reasoning that „a confirmed entry is the statement, not its rationale".
  // That holds for *pushing it at somebody*, not for taking it away: in the
  // batch acceptance `confirm` is the normal case, so the rationale was
  // missing exactly where a person works through a hundred entries and wants
  // to know about one of them why it looks the way it does. Collapsed pushes
  // nothing at anybody.
  //
  // Empty stays empty: no rationale, no judge sentence, no source and no
  // finding means there is nothing to unfold, and then no box stands there.
  const hasContent =
    Boolean(rationale) || Boolean(judgeReasoning) || sources.length > 0 || errors.length > 0;
  if (!hasContent) return null;

  return (
    <div className="ki">
      <button type="button" className="ki__h" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          style={{ transform: open ? "rotate(90deg)" : undefined, transition: "transform 180ms" }}
        />
        <span className="ki__title">
          KI-Buchungshinweise{flagged ? ": Bitte manuell prüfen" : ""}
        </span>
        {/* With its word, not just a dot: there is room here, and a colour
            without a word is not a statement (V7). `compact` stays with the
            booking line and the cell, where the column is narrow. */}
        <Confidence level={confidence} />
        {verdict ? <StatusBadge axis="judge" status={verdict} info={false} /> : null}
      </button>

      {open ? (
        <div className="ki__body">
          <AiBookingNotesBody
            rationale={rationale}
            judgeReasoning={judgeReasoning}
            sources={sources}
            errors={errors}
          />
        </div>
      ) : null}
    </div>
  );
}

/**
 * The content of the notes without the box around it (0151).
 *
 * Its own export because two places need the same four blocks: the box above,
 * and the fold-out of a row in the booking overview, where the row already
 * carries verdict and confidence and a second heading would say it twice
 * (`spec-schreiben` §4 — a part that is needed elsewhere on its own).
 *
 * @when    The rationale, the judge's sentence and the sources — inside a box that already has a head.
 * @instead With its own head and fold-out → AiBookingNotes. Only the verdict for a row → AiBookingNotesCell.
 */
export function AiBookingNotesBody({
  rationale,
  judgeReasoning,
  sources = [],
  errors = [],
}: {
  rationale?: string | null;
  judgeReasoning?: string | null;
  sources?: AiSource[];
  errors?: string[];
}) {
  return (
    <>
      {errors.map((e, i) => (
        <div className="v2msg v2msg--error" key={i} role="alert">
          <span className="v2msg__body">{e}</span>
        </div>
      ))}

      {rationale ? (
        <div className="ki__block">
          <div className="lw-overline">Begründung des Vorschlags</div>
          <p className="ki__text">{rationale}</p>
        </div>
      ) : null}

      {judgeReasoning ? (
        <div className="ki__block">
          <div className="lw-overline">Einschätzung des Judge</div>
          <p className="ki__text">{judgeReasoning}</p>
        </div>
      ) : null}

      {sources.length > 0 ? (
        <div className="ki__block">
          <div className="lw-overline">Quellen</div>
          {sources.map((s) => {
            const { Icon, label } = SOURCE_KIND[s.art];
            const inner = (
              <>
                <Icon size={13} strokeWidth={1.5} />
                <span className="ki__art">{label}</span>
                {s.label ? <span>{s.label}</span> : null}
                {s.quote ? <span className="ki__quote">„{s.quote}“</span> : null}
              </>
            );
            // Opening beside beats jumping away: the document belongs **next
            // to** the work. Only where there is no way beside it does the
            // source become a link, and then in a new window — a half-checked
            // entry must not be lost.
            if (s.onOpen) {
              return (
                <button type="button" className="ki__src ki__src--open" key={s.key} onClick={s.onOpen}>
                  {inner}
                </button>
              );
            }
            return s.href ? (
              <a className="ki__src" href={s.href} key={s.key} target="_blank" rel="noreferrer">
                {inner}
              </a>
            ) : (
              <div className="ki__src" key={s.key}>
                {inner}
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

/**
 * Which mark stands for which verdict (owner, 2026-09-10).
 *
 * **Four verdicts, four marks — and every one carries its word in the hover.**
 * The marks come from `StateIcon`, not from a new registry line: those four
 * states exist there already, with colour and word, and a fifth vocabulary for
 * the same four steps would be exactly the fork the icon registry is meant to
 * prevent.
 *
 * `confirm_with_note` and `adjust` are both `info` on the axis — colour does
 * not separate them, the mark does: a note is not a correction.
 */
const JUDGE_ICON: Record<JudgeVerdict, StateKind> = {
  confirm: "done",
  confirm_with_note: "info",
  adjust: "edited",
  flag: "warning",
};

/**
 * The same package in a row: what the judge said, and how sure the agent was
 * (0151).
 *
 * **The row is the wrong place for the text.** A booking overview shows a
 * batch — 9 entries in the story, three-digit numbers in the stock —, and a
 * rationale of three lines in every row turns the list into a wall. The cell
 * answers „did anybody object?", the fold-out of the row answers „why?" with
 * `AiBookingNotesBody`.
 *
 * **Empty stays empty.** No verdict and no confidence means an empty cell, not
 * an em dash: a proposal that no judge has seen is not a proposal that was
 * judged as nothing (V6, and the same rule the measure of a bank statement
 * follows).
 *
 * @when    A column „KI-Prüfung" in a list of booking entries.
 * @instead The whole package with its fold-out → AiBookingNotes. Only the text
 *          inside a foreign box → AiBookingNotesBody. A state of the entry
 *          itself (posted, reversed) → StatusBadge with axis `buchung`.
 */
export function AiBookingNotesCell({
  verdict,
  confidence = null,
  errors = [],
}: {
  verdict: JudgeVerdict | null;
  confidence?: ConfidenceLevel | null;
  /** Blocking findings — the cell says **that** there are some, not which. */
  errors?: string[];
}) {
  if (!verdict && !confidence && errors.length === 0) return null;
  return (
    <span className="ki__cell">
      {/* **Confidence first, verdict second** (owner, 2026-09-10). The order is
          the order of the work: the agent proposes and says how sure it was,
          then the judge rules on it. Reading „Bestätigt · Sicher" reverses
          that — and the box above has always had it the other way round, so
          the cell was the odd one out.
          With its word, like in the head of the box: a colour without a word
          is not a statement (V7), and „Sicher" costs 38 px. */}
      <Confidence level={confidence} />
      {/* **The verdict as a mark, not as a word** (owner, 2026-09-10): in the
          batch acceptance the column carries four badges below each other, and
          „Bestätigt mit Hinweis" is 148 px wide. The word is not gone, it is
          one step deeper — in the hover, in the screen reader, and in the
          dialog a click opens. V7 still holds: the coloured state has its
          word, only not in the row.
          The box keeps it visible — there is room there. */}
      {verdict ? (
        <StatusInfoButton axis="judge" current={verdict}>
          <StateIcon state={JUDGE_ICON[verdict]} title={resolveStatus("judge", verdict).label} />
        </StatusInfoButton>
      ) : null}
      {/* The count, not the text: which finding it is stands in the fold-out.
          A number in the row is a reason to open it. */}
      {errors.length > 0 ? (
        <span className="ki__cellerr">
          {errors.length} {errors.length === 1 ? "Befund" : "Befunde"}
        </span>
      ) : null}
    </span>
  );
}
