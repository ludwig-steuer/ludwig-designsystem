import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Rahmen-Bausteine (F123 T123.2): Schritt-Rail, Screen-Kopf,
 * Fortschrittsleiste, Zu-klein-Sperre.
 *
 * Generisch: der Rail kennt keine Stapelabnahme, er kennt Zeilen mit Ton und
 * Zähler. Was gezählt wird, rechnet der Aufrufer.
 */

export type RailTone = "neutral" | "open" | "done" | "blocked" | "dimmed";

export interface RailItem {
  key: string;
  /** Die Nummer vor dem Label — zugleich die Sprungtaste. */
  index: number;
  label: string;
  sub: string;
  tone: RailTone;
  /** „3 von 18 offen", „bereit" — `null`, wo es nichts zu zählen gibt. */
  counterText: string | null;
  href: string | null;
  /** Warum die Zeile nicht anklickbar ist. Pflicht bei `href === null`. */
  disabledReason?: string;
  current?: boolean;
}

/**
 * Der Rail ist ein **Vorschlag, kein Zwang**: jeder erreichbare Schritt ist
 * jederzeit anklickbar. Der Punkt links trägt die Ampel, der Zähler darunter
 * sagt, wie viel dort liegt — beides zusammen, weil Farbe allein kein Signal
 * ist (UX-Guidelines V7).
 */
export function SchrittRail({
  items,
  head,
  foot,
  ariaLabel,
}: {
  items: RailItem[];
  head?: ReactNode;
  foot?: ReactNode;
  ariaLabel: string;
}) {
  return (
    <nav className="abn__rail" aria-label={ariaLabel}>
      {head}
      {items.map((it) => (
        <RailZeile key={it.key} item={it} />
      ))}
      {foot}
    </nav>
  );
}

function RailZeile({ item }: { item: RailItem }) {
  const cls =
    `abn__step abn__step--${item.tone}` +
    (item.current ? " is-current" : "") +
    (item.tone === "dimmed" ? " is-dimmed" : "");
  const inner = (
    <>
      <span className="dot" />
      <span style={{ minWidth: 0 }}>
        <span className="label">
          {item.index} · {item.label}
        </span>
        <span className="question">{item.sub}</span>
        {item.counterText ? <span className="count">{item.counterText}</span> : null}
      </span>
    </>
  );
  if (item.href === null) {
    return (
      <span className={cls} title={item.disabledReason}>
        {inner}
      </span>
    );
  }
  return (
    <Link className={cls} href={item.href} aria-current={item.current ? "step" : undefined}>
      {inner}
    </Link>
  );
}

/**
 * Der Kopf eines Schritts: Overline, Überschrift, Lead — und rechts der Weg
 * vor und zurück. Die Nummer steht in der Overline, nicht in der Überschrift:
 * „Vollständigkeit" ist die Antwort auf „wo bin ich?", „1 · Vollständigkeit"
 * ist eine Kopfzeile.
 */
export function SchrittKopf({
  overline,
  title,
  lead,
  prevHref,
  nextHref,
  nextLabel,
  actions,
}: {
  overline: string;
  title: string;
  lead?: string;
  prevHref?: string | null;
  nextHref?: string | null;
  /** „Weiter zu Schritt 5" — wohin es geht, nicht bloß „Weiter". */
  nextLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="abn__screenhead">
      <div className="abn__screenhead__row">
        <div style={{ minWidth: 0 }}>
          <div className="lw-overline">{overline}</div>
          <h1>{title}</h1>
        </div>
        {/* Vorwärts ist die Handlung, rückwärts die Ausweichmöglichkeit:
            „Weiter" trägt die Primärfarbe und sagt, wohin es geht; „Zurück"
            bleibt ein schmuckloser Sekundär-Knopf ohne Ziel im Text. */}
        <div className="abn__screenhead__nav">
          {actions}
          {prevHref ? (
            <Link className="v2btn v2btn--secondary v2btn--sm" href={prevHref}>
              ← Zurück
            </Link>
          ) : (
            <span className="v2btn v2btn--secondary v2btn--sm" aria-disabled style={{ opacity: 0.4 }}>
              ← Zurück
            </span>
          )}
          {nextHref ? (
            <Link className="v2btn v2btn--primary v2btn--sm" href={nextHref}>
              {nextLabel ?? "Weiter"} →
            </Link>
          ) : (
            <span className="v2btn v2btn--primary v2btn--sm" aria-disabled style={{ opacity: 0.4 }}>
              {nextLabel ?? "Weiter"} →
            </span>
          )}
        </div>
      </div>
      {lead ? <p className="abn__screenhead__lead">{lead}</p> : null}
    </div>
  );
}

/** „41 von 118 Punkten" — schmale Leiste über alle Schritte. */
export function FortschrittLeiste({
  done,
  total,
  label = "Punkte",
}: {
  done: number;
  total: number;
  label?: string;
}) {
  if (total === 0) return null;
  const pct = Math.max(0, Math.min(1, done / total));
  return (
    <div className="abn__progress" title={`${done} von ${total} ${label} erledigt`}>
      <span className="abn__progress__text">
        {done} von {total} {label}
      </span>
      <span className="v2bar" style={{ width: 120 }}>
        <span className="v2bar__fill" style={{ width: `${pct * 100}%` }} />
      </span>
    </div>
  );
}
