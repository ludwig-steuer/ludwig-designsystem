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
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";

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

/** Die Konfidenz des Vorschlags — vier Stufen plus „keine Angabe". */
export type ConfidenceLevel = "green" | "yellow" | "orange" | "red" | "none";

const KONFIDENZ_TEXT: Record<ConfidenceLevel, string> = {
  green: "Ursprungs-Konfidenz hoch",
  yellow: "Ursprungs-Konfidenz mittel",
  orange: "Ursprungs-Konfidenz gering",
  red: "Ursprungs-Konfidenz sehr gering",
  none: "keine Angabe",
};

/**
 * @when    The agent's rationale and the judge's verdict on a proposal, collapsed by default.
 * @instead Messages about the booking entry → Messages.
 */
export function AiBookingNotes({
  verdict,
  confidence = "none",
  rationale,
  judgeReasoning,
  sources = [],
  errors = [],
}: {
  verdict: JudgeVerdict | null;
  confidence?: ConfidenceLevel;
  /** `agent_rationale` — warum der Agent so gebucht hat. */
  rationale?: string | null;
  /** `reasoning_short` des Judge. */
  judgeReasoning?: string | null;
  sources?: AiSource[];
  /** Blockierende Befunde des Judge. */
  errors?: string[];
}) {
  const auffaellig = verdict === "flag" || errors.length > 0;
  const [open, setOpen] = useState(auffaellig);

  // Ein bestätigter Satz ohne Befund braucht keinen Kasten: der Vorschlag ist
  // die Aussage, nicht seine Begründung.
  if (verdict === "confirm" && errors.length === 0) return null;
  if (!verdict && errors.length === 0 && !rationale && !judgeReasoning) return null;

  return (
    <div className="ki">
      <button type="button" className="ki__h" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <ChevronRight
          size={14}
          strokeWidth={1.5}
          style={{ transform: open ? "rotate(90deg)" : undefined, transition: "transform 180ms" }}
        />
        <span className="ki__title">
          KI-Buchungshinweise{auffaellig ? ": Bitte manuell prüfen" : ""}
        </span>
        <span className={`confdot confdot--${confidence}`} title={KONFIDENZ_TEXT[confidence]} />
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
