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
 * dasselbe Bild aus vier Phasen mit Staffelstab; der Rohzustand steht als
 * Unterzeile darunter, wo Platz ist.
 *
 *  - `ProzessMini` in der Listenzeile — vier Segmente, aktives gefüllt.
 *  - `ProzessStepper` im Detail-Kopf — mit Rohzuständen, Besitzer, Schleifen.
 *  - `StaffelLeiste` im Log — die Zeitachse, eingefärbt nach Besitzer.
 *
 * Der **Staffelstab** ist Icon *und* Wort, nie nur Farbe: „Kanzlei" als
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

export type ProzessPhaseStatus = "done" | "active" | "pending" | "failed";

export interface ProzessPhase {
  key: string;
  /** „Buchen", „Prüfen", … */
  label: string;
  /** Wer in dieser Phase arbeitet. */
  sub: string;
  /** Die Rohzustände dahinter — die Unterzeile im Stepper. */
  states: readonly string[];
  status: ProzessPhaseStatus;
}

export type StaffelstabKey =
  | "agent"
  | "bereit"
  | "mandant"
  | "kanzlei"
  | "bridge"
  | "datev"
  | "spiegel"
  | "niemand";

export interface StaffelstabMeta {
  key: StaffelstabKey;
  label: string;
  /** CSS-Variable, nie ein Hex-Literal. */
  color: string;
}

const OWNER_ICON: Record<StaffelstabKey, LucideIcon> = {
  agent: Bot,
  bereit: Hourglass,
  mandant: UserRound,
  kanzlei: Building2,
  bridge: Share2,
  datev: Database,
  spiegel: Database,
  niemand: Minus,
};

/** Vier Segmente für die Listenzeile. */
export function ProzessMini({ phases }: { phases: readonly ProzessPhase[] }) {
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
 */
export function Staffelstab({
  owner,
  alarm = false,
  detail,
  size = 13,
}: {
  owner: StaffelstabMeta;
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

export interface ProzessLoops {
  /** Wie oft die Kanzlei zurückgegeben hat. */
  returned: number;
  /** Wie oft ein Belegeingang den Stapel geweckt hat. */
  reopened: number;
}

/**
 * Der Stepper im Detail-Kopf. Schleifen werden gezählt und verlinken ins Log —
 * ein Stapel, der viermal zurückging, sieht anders aus als einer, der
 * durchlief.
 */
export function ProzessStepper({
  phases,
  owner,
  alarm = false,
  loops,
  logHref,
  phaseSince,
}: {
  phases: readonly ProzessPhase[];
  owner: StaffelstabMeta;
  alarm?: boolean;
  loops?: ProzessLoops;
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
                <Staffelstab owner={owner} alarm={alarm} />
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

export interface StaffelAbschnitt {
  owner: StaffelstabMeta;
  /** Anteil an der Gesamtdauer (0…1). */
  share: number;
  /** Tooltip: Besitzer, von–bis, Dauer. */
  title: string;
}

/**
 * Die Staffel-Leiste über dem Log: die Zeitachse von der Eröffnung bis jetzt,
 * je Abschnitt eingefärbt nach Besitzer.
 *
 * Das ist der eine Blick, der „warum hat der August drei Wochen gedauert?"
 * beantwortet — zwei Tage Agent, neun Tage Warten auf den Mandanten, ein Tag
 * Kanzlei.
 */
export function StaffelLeiste({ abschnitte }: { abschnitte: readonly StaffelAbschnitt[] }) {
  if (abschnitte.length === 0) return null;
  const legend = new Map<string, StaffelstabMeta>();
  for (const a of abschnitte) if (!legend.has(a.owner.key)) legend.set(a.owner.key, a.owner);
  return (
    <div>
      <div className="pz-staffel">
        {abschnitte.map((a, i) => (
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
