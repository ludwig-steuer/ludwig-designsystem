import type { ReactNode } from "react";

import { MonoCell } from "../primitives/Cells";
import { Disclosure } from "../primitives/Disclosure";
import { FieldList } from "../primitives/FieldList";
import { Link } from "../primitives/Link";
import { LongText } from "../primitives/LongText";
import { Time } from "../primitives/Time";
import { Confidence, type ConfidenceLevel } from "./Confidence";

/**
 * Why does this stand the way it stands, and who says so (0163, roadmap B5).
 *
 * The data carry the answer for many values — the origin of a proposal, the
 * rule code, the confidence, the reason, the sources — and each place in the
 * app shows a different slice of it, most places none. Two sizes of one
 * answer: the mark beside the value, and the derivation one click further.
 *
 * The pattern knows no entity: the word of the origin comes from the caller's
 * registry axis (`buchung_origin` …), the word of a source kind from the
 * caller's word list. The judge's verdict stays in `AiBookingNotes` — agent
 * and judge exist only at the journal entry.
 */

export interface ProvenanceSource {
  key: string;
  /** Icon and word of the kind — from the caller. */
  kind: ReactNode;
  label?: string | null;
  quote?: string | null;
  /** The way to the source; without it the source is text. */
  href?: string | null;
}

export interface Provenance {
  /** The word of the origin — a `StatusBadge` of the caller's axis. */
  origin: ReactNode;
  /** Who: „Agent · Lauf 4b19c2", a person, „DATEV-Import". */
  actor?: ReactNode;
  /** When, ISO. */
  at?: string | null;
  /** The rule that decided: its code and the sentence that says it. */
  rule?: { code?: string | null; sentence: string } | null;
  confidence?: { level: ConfidenceLevel | null; value?: number } | null;
  rationale?: string | null;
  sources?: readonly ProvenanceSource[];
  /** Set only when someone changed the value by hand. */
  corrected?: { by: ReactNode; at: string } | null;
}

/** Above this the reason is cut for the hover — the whole of it is one click away. */
const SENTENCE_MAX = 160;

function sentenceOf(p: Provenance, reason?: string): string | null {
  if (reason) return reason;
  if (p.rationale) {
    return p.rationale.length > SENTENCE_MAX ? `${p.rationale.slice(0, SENTENCE_MAX - 1).trimEnd()}…` : p.rationale;
  }
  return p.rule?.sentence ?? null;
}

/**
 * @when    The origin of a value beside the value — a proposed account, a
 *          document number, an allocation in a row.
 * @instead The whole derivation → ProvenanceNote. A machine proposal with the
 *          judge's verdict → AiBookingNotes.
 */
export function ProvenanceMark({
  provenance: p,
  reason,
  href,
}: {
  provenance: Provenance;
  /** The one sentence for hover and screen reader; without it the reason, cut — else the origin speaks alone. */
  reason?: string;
  /** The way to the derivation. */
  href?: string;
}) {
  const sentence = sentenceOf(p, reason);
  const body = (
    <>
      <Origin provenance={p} />
      {sentence ? <span className="v2vh">{sentence}</span> : null}
    </>
  );
  return href ? (
    <Link href={href} className="v3prov" {...(sentence ? { title: sentence } : {})}>
      {body}
    </Link>
  ) : (
    <span className="v3prov" {...(sentence ? { title: sentence } : {})}>
      {body}
    </span>
  );
}

/** Origin and compact confidence — the part the mark and the note's summary share. */
function Origin({ provenance: p }: { provenance: Provenance }) {
  return (
    <>
      {p.origin}
      {p.confidence ? (
        <Confidence
          level={p.confidence.level}
          {...(p.confidence.value !== undefined ? { value: p.confidence.value } : {})}
          compact
        />
      ) : null}
    </>
  );
}

/**
 * @when    Why a value stands the way it stands: origin, rule, confidence,
 *          reason, sources — collapsed beside the value, open on the record.
 * @instead Only the origin beside a value → ProvenanceMark. The agent's
 *          proposal with the judge's verdict → AiBookingNotes. Before and
 *          after, field by field → DiffView (B3).
 */
export function ProvenanceNote({
  provenance: p,
  defaultOpen = false,
}: {
  provenance: Provenance;
  /** Begin open — for instance when someone corrected the value. */
  defaultOpen?: boolean;
}) {
  const rows: [ReactNode, ReactNode][] = [
    [
      "Herkunft",
      <span key="o" className="v3prov__line">
        {p.origin}
        {p.actor ? <span>{p.actor}</span> : null}
        {p.at ? <Time value={p.at} format="date" /> : null}
      </span>,
    ],
  ];
  if (p.rule) {
    rows.push([
      "Regel",
      <span key="r" className="v3prov__line">
        {p.rule.code ? <MonoCell value={p.rule.code} /> : null}
        <span>{p.rule.sentence}</span>
      </span>,
    ]);
  }
  if (p.confidence) {
    rows.push([
      "Konfidenz",
      <Confidence
        key="c"
        level={p.confidence.level}
        {...(p.confidence.value !== undefined ? { value: p.confidence.value } : {})}
      />,
    ]);
  }
  if (p.rationale) rows.push(["Begründung", <LongText key="b">{p.rationale}</LongText>]);
  if (p.sources && p.sources.length > 0) {
    rows.push([
      "Quellen",
      <ul key="s" className="v3prov__sources">
        {p.sources.map((s) => (
          <li key={s.key}>
            <span className="v3prov__kind">{s.kind}</span>
            {s.href ? <Link href={s.href}>{s.label ?? "öffnen"}</Link> : s.label ? <span>{s.label}</span> : null}
            {s.quote ? <span className="v3prov__quote">„{s.quote}“</span> : null}
          </li>
        ))}
      </ul>,
    ]);
  }
  if (p.corrected) {
    rows.push([
      "Von Hand korrigiert",
      <span key="k" className="v3prov__line">
        {p.corrected.by}
        <Time value={p.corrected.at} format="date" />
      </span>,
    ]);
  }

  return (
    <Disclosure
      summary={
        <span className="v3prov__line">
          {/* No sentence here: the reason stands right below, open. */}
          <span className="v3prov">
            <Origin provenance={p} />
          </span>
          {p.actor ? <span className="v2sub">{p.actor}</span> : null}
          {p.at ? <Time value={p.at} format="date" size="sm" /> : null}
        </span>
      }
      {...(defaultOpen ? { defaultOpen } : {})}
    >
      <FieldList tone="bare" values="prose" rows={rows} />
    </Disclosure>
  );
}
