import type { ReactNode } from "react";

/**
 * Kopf-Karte, die ihren Zustand über den Rahmen trägt: Kicker, Titel,
 * Nebenzeile, Aktionen rechts. Der Ton färbt Rahmen, Kicker und Nebenzeile —
 * das Wort im Kicker sagt dasselbe noch einmal (UX-Guidelines V7).
 *
 * @wann  Der Kopf einer Sache, deren Zustand die Seite bestimmt (Stapel, Periode).
 * @nicht Hinweis im Fluss → Callout. Seitenweite Meldung → Banner.
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
