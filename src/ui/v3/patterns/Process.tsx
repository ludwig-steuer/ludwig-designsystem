import { Link } from "../primitives/Link";
import type { ReactNode } from "react";
import {
  Bot,
  Building2,
  Database,
  Hourglass,
  Minus,
  Share2,
  UserRound,
  type LucideIcon,
} from "lucide-react";

/**
 * Das Prozessbild eines Stapels — **eine** Komponente in drei Größen
 * (F119 §3, F114 §1.1).
 *
 * Zehn Zustände sind für die Sachbearbeiterin zu viele Punkte. Überall
 * dasselbe Bild aus vier Phasen mit Baton; der Rohzustand steht als
 * Unterzeile darunter, wo Platz ist.
 *
 *  - `ProcessMini` in der Listenzeile — vier Segmente, aktives gefüllt.
 *  - `ProcessStepper` im Detail-Kopf — mit Rohzuständen, Besitzer, Schleifen.
 *  - `BatonBar` im Log — die Zeitachse, eingefärbt nach Besitzer.
 *
 * Der **Baton** ist Icon *und* Wort, nie nur Farbe: „Kanzlei" als
 * blauer Punkt liest niemand, der die Legende nicht kennt.
 *
 * **Rot nur** auf `failed` und auf „überfällig". Alles andere bleibt neutral —
 * sonst stumpft die Farbe ab und der eine Fall, der brennt, fällt nicht auf.
 *
 * Die Komponente **leitet nichts ab**: Phasen und Besitzer kommen fertig als
 * Prop aus `modules/datev-export/domain/batch-process.ts`. `@/ui` importiert
 * kein Feature-Modul (`web-ui-offen.md` P20 B1) — und eine Primitive, die
 * ihre eigene Fachlogik mitbringt, ist keine Primitive mehr.
 */

export type ProcessPhaseStatus = "done" | "active" | "pending" | "failed";

export interface ProcessPhase {
  key: string;
  /** „Buchen", „Prüfen", … */
  label: string;
  /** Wer in dieser Phase arbeitet. */
  sub: string;
  /** Die Rohzustände dahinter — die Unterzeile im Stepper. */
  states: readonly string[];
  status: ProcessPhaseStatus;
}

export type BatonKey =
  | "agent"
  | "bereit"
  | "mandant"
  | "kanzlei"
  | "bridge"
  | "datev"
  | "spiegel"
  | "niemand";

export interface BatonMeta {
  key: BatonKey;
  label: string;
  /** CSS-Variable, nie ein Hex-Literal. */
  color: string;
}

const OWNER_ICON: Record<BatonKey, LucideIcon> = {
  agent: Bot,
  bereit: Hourglass,
  mandant: UserRound,
  kanzlei: Building2,
  bridge: Share2,
  datev: Database,
  spiegel: Database,
  niemand: Minus,
};

/**
 * Vier Segmente für die Listenzeile.
 *
 * @when    Process state in the list row.
 */
export function ProcessMini({ phases }: { phases: readonly ProcessPhase[] }) {
  return (
    <span className="pz-mini" title={phases.map((p) => p.label).join(" → ")}>
      {phases.map((p) => (
        <span key={p.key} className={p.status === "pending" ? undefined : `is-${p.status}`} />
      ))}
    </span>
  );
}

/**
 * Wer den Stapel gerade hat. `alarm` färbt rot — dafür gibt es genau zwei
 * Gründe: eine überfällige Nachforderung und ein gescheiterter Export.
 *
 * @when    Who currently holds the batch — icon and word.
 * @instead Entity status → StatusBadge.
 */
export function Baton({
  owner,
  alarm = false,
  detail,
  size = 13,
}: {
  owner: BatonMeta;
  alarm?: boolean;
  /** Zusatz hinter dem Wort, z. B. „Durchgang 3 läuft seit 14 Min." */
  detail?: ReactNode;
  size?: number;
}) {
  const Icon = OWNER_ICON[owner.key];
  return (
    <span className={`pz-owner${alarm ? " is-alarm" : ""}`}>
      <Icon size={size} strokeWidth={1.75} style={alarm ? undefined : { color: owner.color }} />
      <span>
        {owner.label}
        {detail ? <> · {detail}</> : null}
      </span>
    </span>
  );
}

export interface ProcessLoops {
  /** Wie oft die Kanzlei zurückgegeben hat. */
  returned: number;
  /** Wie oft ein Belegeingang den Stapel geweckt hat. */
  reopened: number;
}

/**
 * Der Stepper im Detail-Kopf. Schleifen werden gezählt und verlinken ins Log —
 * ein Stapel, der viermal zurückging, sieht anders aus als einer, der
 * durchlief.
 *
 * @when    Process state in the detail header with raw states and loops.
 * @instead Steps of a review → StepRail.
 */
export function ProcessStepper({
  phases,
  owner,
  alarm = false,
  loops,
  logHref,
  phaseSince,
}: {
  phases: readonly ProcessPhase[];
  owner: BatonMeta;
  alarm?: boolean;
  loops?: ProcessLoops;
  logHref?: string;
  /** Phasen-Schlüssel → Zeitpunkt des Eintritts (fertig formatiert). */
  phaseSince?: Partial<Record<string, string>>;
}) {
  const parts = [
    loops?.returned ? `↺ ${loops.returned}× zurück an den Agenten` : null,
    loops?.reopened ? `↺ ${loops.reopened}× neuer Beleg` : null,
  ].filter(Boolean);

  return (
    <div>
      <div className="pz-stepper">
        {phases.map((p) => (
          <div key={p.key} className={p.status === "pending" ? undefined : `is-${p.status}`}>
            <div className="phase">{p.label}</div>
            <div className="who">{p.sub}</div>
            <div className="raw">{p.states.join(" · ")}</div>
            {p.status === "active" || p.status === "failed" ? (
              <div className="now">
                <Baton owner={owner} alarm={alarm} />
              </div>
            ) : p.status === "done" && phaseSince?.[p.key] ? (
              <div className="who">seit {phaseSince[p.key]}</div>
            ) : null}
          </div>
        ))}
      </div>
      {parts.length > 0 ? (
        <div className="pz-loops">
          {logHref ? <Link href={logHref}>{parts.join(" · ")}</Link> : parts.join(" · ")}
        </div>
      ) : null}
    </div>
  );
}

export interface BatonSegment {
  owner: BatonMeta;
  /** Anteil an der Gesamtdauer (0…1). */
  share: number;
  /** Tooltip: Besitzer, von–bis, Dauer. */
  title: string;
}

/**
 * The baton bar above the log: the timeline from opening until now,
 * je Abschnitt eingefärbt nach Besitzer.
 *
 * Das ist der eine Blick, der „warum hat der August drei Wochen gedauert?"
 * beantwortet — zwei Tage Agent, neun Tage Warten auf den Mandanten, ein Tag
 * Kanzlei.
 *
 * @when    Timeline above the log, colored by owner.
 */
export function BatonBar({ segments }: { segments: readonly BatonSegment[] }) {
  if (segments.length === 0) return null;
  const legend = new Map<string, BatonMeta>();
  for (const a of segments) if (!legend.has(a.owner.key)) legend.set(a.owner.key, a.owner);
  return (
    <div>
      <div className="pz-staffel">
        {segments.map((a, i) => (
          <span
            key={i}
            title={a.title}
            style={{ flex: `${Math.max(a.share, 0.005)}`, background: a.owner.color }}
          />
        ))}
      </div>
      <div className="pz-staffel-legend">
        {[...legend.values()].map((o) => (
          <span key={o.key}>
            <i style={{ background: o.color }} />
            {o.label}
          </span>
        ))}
      </div>
    </div>
  );
}
