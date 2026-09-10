"use client";

import {
  Banknote,
  ChevronRight,
  FileText,
  Globe,
  Ruler,
  Scale,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

// Direkt statt über das Barrel: `@/ui/status` exportiert auch `FlowModal`
// und zieht darüber `@/modules/invoices` samt DB-Treiber ins Bundle (P22).
import { Confidence, type ConfidenceLevel } from "../../patterns/Confidence";
import { StatusBadge } from "../../patterns/StatusBadge";

/**
 * Was der Agent sich gedacht hat (F123 T123.3, Design `AiBookingNotes.dc.html`).
 *
 * Drei Dinge, die heute nirgends zusammen stehen: die **Begründung des
 * Vorschlags** (`agent_rationale`), die **Einschätzung des Judge**
 * (`reasoning_short`) und die **Quellen**, auf die sich beides stützt. Ohne
 * sie ist ein Buchungsvorschlag eine Behauptung, die man nur glauben oder
 * verwerfen kann.
 *
 * Standardmäßig eingeklappt — außer der Judge will, dass hingesehen wird
 * (`flag`) oder es liegt ein Fehler an. Wer jedem bestätigten Satz seine
 * Begründung aufdrängt, macht die Begründung wertlos.
 *
 * **Collapsed is not the same as gone** (2026-09-10): the box stands as soon
 * as there is something to read — `confirm` included. In the batch acceptance
 * `confirm` is the normal case, and „why does this entry look like this?" is
 * asked exactly there.
 */

export type JudgeVerdict = "confirm" | "confirm_with_note" | "adjust" | "flag";

/** Woher eine Aussage kommt. Icon **und** Wort — ein Icon allein ist ein Rätsel. */
export type SourceKind = "bank" | "beleg" | "regel" | "gesetz" | "web";

const QUELLE: Record<SourceKind, { Icon: LucideIcon; label: string }> = {
  bank: { Icon: Banknote, label: "Bank" },
  beleg: { Icon: FileText, label: "Beleg" },
  regel: { Icon: Ruler, label: "Regel" },
  gesetz: { Icon: Scale, label: "Gesetz" },
  web: { Icon: Globe, label: "Web" },
};

export interface AiSource {
  key: string;
  art: SourceKind;
  label: string;
  /** Wörtliches Zitat aus der Quelle, wenn es eines gibt. */
  quote?: string | null;
  href?: string | null;
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
  /** Die Konfidenz des Vorschlags; `null` heißt kein Signal. */
  confidence?: ConfidenceLevel | null;
  /** `agent_rationale` — warum der Agent so gebucht hat. */
  rationale?: string | null;
  /** `reasoning_short` des Judge. */
  judgeReasoning?: string | null;
  sources?: AiSource[];
  /** Blockierende Befunde des Judge. */
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
  const hatInhalt =
    Boolean(rationale) || Boolean(judgeReasoning) || sources.length > 0 || errors.length > 0;
  if (!hatInhalt) return null;

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
                const { Icon, label } = QUELLE[s.art];
                const inner = (
                  <>
                    <Icon size={13} strokeWidth={1.5} />
                    <span className="ki__art">{label}</span>
                    <span>{s.label}</span>
                    {s.quote ? <span className="ki__quote">„{s.quote}“</span> : null}
                  </>
                );
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
        </div>
      ) : null}
    </div>
  );
}
