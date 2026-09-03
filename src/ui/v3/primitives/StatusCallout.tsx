import type { ReactNode } from "react";

/**
 * Kopf-Karte, die ihren Zustand über den Rahmen trägt: Kicker, Titel,
 * Nebenzeile, Aktionen rechts. Der Ton färbt Rahmen, Kicker und Nebenzeile —
 * das Wort im Kicker sagt dasselbe noch einmal (UX-Guidelines V7).
 *
 * @when    The header of an item whose state defines the page (batch, period).
 * @instead Note in the flow → Callout. Page-wide message → Banner.
 */
export function StatusCallout({
  tone = "neutral",
  icon,
  kicker,
  title,
  sub,
  actions,
}: {
  tone?: "neutral" | "warning" | "danger";
  /**
   * Left of the kicker, in the colour of the tone (0049) — part of the tone,
   * not of the text. The word in the kicker stays either way (V7).
   */
  icon?: ReactNode;
  kicker: string;
  title: ReactNode;
  sub?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className={`v2callout${tone === "neutral" ? "" : ` v2callout--${tone}`}`}>
      {icon ? <span className="v2callout__ico">{icon}</span> : null}
      <div>
        <div className="v2callout__kicker">{kicker}</div>
        <div className="v2callout__title">{title}</div>
        {sub ? <div className="v2callout__sub">{sub}</div> : null}
      </div>
      {actions ? <div className="v2callout__actions">{actions}</div> : null}
    </div>
  );
}
