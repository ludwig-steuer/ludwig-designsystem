import type { ReactNode } from "react";

export interface EmptyStateProps {
  /** Lucide-Icon, 1.5 px Strich — optional, nie allein tragend (T8). */
  icon?: ReactNode;
  /** Was fehlt, in einem Satzteil: „Keine offenen Belege". */
  title: string;
  /** Warum es leer ist und was als Nächstes hilft. */
  description?: ReactNode;
  /** Der Weg heraus — meist ein Button. */
  action?: ReactNode;
  /** Ohne Innenabstand, wenn schon eine Karte darum liegt. */
  inline?: boolean;
  className?: string;
}

/**
 * „Nichts da" mit Grund und Ausweg.
 *
 * Drei Leerheiten sind zu unterscheiden (V9, T6) und brauchen verschiedene
 * Texte: noch nichts angelegt · alles erledigt · nichts trifft den Filter.
 * Der `title` sagt welche, die `description` sagt, was jetzt hilft.
 *
 * @when    Eine Liste, Karte oder Seite hat keinen Inhalt zu zeigen.
 * @instead Leere Tabelle innerhalb einer Karte → EmptyRow (bleibt im Raster).
 *          Ein Fehler statt Leere → ErrorRow bzw. StatusCallout tone="danger".
 *          Noch am Laden → TableLoading.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  inline,
  className,
}: EmptyStateProps) {
  return (
    <div className={`v2empty${inline ? " v2empty--inline" : ""}${className ? ` ${className}` : ""}`}>
      {icon ? <span className="v2empty__ico">{icon}</span> : null}
      <h3 className="v2empty__title">{title}</h3>
      {description ? <p className="v2empty__desc">{description}</p> : null}
      {action ? <div className="v2empty__actions">{action}</div> : null}
    </div>
  );
}
