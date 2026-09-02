import type { ReactNode } from "react";

/**
 * v2-Flächen (F123 T123.1): Kennzahl, Feldliste, Fließtext, Zustands-Kopfkarte,
 * Hinweisbox. Alle vier tragen Inhalt, keiner trägt Fachwissen.
 *
 * Abgrenzung zu `Stat`/`StatGrid` aus `@/ui/components`: das ist die
 * Dashboard-Kachel (32 px Serif, Schatten). Auf Detailseiten steht die
 * Kennzahl-Kachel des Designs — 19 px Sans, Rand statt Schatten.
 */

export function KpiTile({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="v2kpi">
      <div className="v2kpi__label">{label}</div>
      <div className="v2kpi__val">{value}</div>
      {sub ? <div className="v2kpi__sub">{sub}</div> : null}
    </div>
  );
}

export function KpiGrid({ columns = 6, children }: { columns?: number; children: ReactNode }) {
  return (
    <div className="v2kpigrid" style={{ "--v2-kpi-cols": columns } as React.CSSProperties}>
      {children}
    </div>
  );
}

/**
 * Label/Wert-Paare in einer Karte. `tone="soft"` tönt die Fläche — das Design
 * nutzt das, um die DATEV-Seite von der Ludwig-Seite zu trennen, ohne eine
 * zweite Überschrift zu brauchen.
 */
export function FieldList({
  title,
  rows,
  tone = "surface",
  empty,
}: {
  title: string;
  rows: [ReactNode, ReactNode][];
  tone?: "surface" | "soft";
  empty?: string;
}) {
  return (
    <div className={`v2fields${tone === "soft" ? " v2fields--soft" : ""}`}>
      <div className="v2fields__h">{title}</div>
      {rows.length === 0 ? (
        <div className="v2fields__empty">{empty ?? "Keine Angaben."}</div>
      ) : (
        rows.map(([label, value], i) => (
          <div className="v2fields__row" key={i}>
            <span>{label}</span>
            <span>{value}</span>
          </div>
        ))
      )}
    </div>
  );
}

export function ProseCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="v2prose">
      <div className="v2prose__h">{title}</div>
      <div className="v2prose__body">{children}</div>
    </div>
  );
}

/**
 * Kopf-Karte, die ihren Zustand über den Rahmen trägt: Kicker, Titel,
 * Nebenzeile, Aktionen rechts. Der Ton färbt Rahmen, Kicker und Nebenzeile —
 * das Wort im Kicker sagt dasselbe noch einmal (UX-Guidelines V7).
 */
export function StatusCallout({
  tone = "neutral",
  kicker,
  title,
  sub,
  actions,
}: {
  tone?: "neutral" | "warning" | "danger";
  kicker: string;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={`v2callout${tone === "neutral" ? "" : ` v2callout--${tone}`}`}>
      <div>
        <div className="v2callout__kicker">{kicker}</div>
        <div className="v2callout__title">{title}</div>
        {sub ? <div className="v2callout__sub">{sub}</div> : null}
      </div>
      {actions ? <div className="v2callout__actions">{actions}</div> : null}
    </div>
  );
}

/** Kleine Hinweisbox im Fluss — kein Banner, kein Dialog. */
export function Callout({
  tone = "accent",
  children,
}: {
  tone?: "accent" | "soft" | "warning" | "danger";
  children: ReactNode;
}) {
  return <div className={`v2note${tone === "accent" ? "" : ` v2note--${tone}`}`}>{children}</div>;
}
