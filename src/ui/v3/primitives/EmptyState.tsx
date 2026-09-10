import type { ReactNode } from "react";

export interface EmptyStateProps {
  /** Lucide-Icon, 1.5 px Strich — optional, nie allein tragend (T8). */
  icon?: ReactNode;
  /** Was fehlt, in einem Satzteil: „Keine offenen Belege". */
  title: string;
  /** Why it is empty and what helps next. */
  description?: ReactNode;
  /** The way out — usually a button. */
  action?: ReactNode;
  /** Without padding, when a card already surrounds it. */
  inline?: boolean;
  className?: string;
}

/**
 * "Nothing here", with reason and way out.
 *
 * Three kinds of empty need different texts (V9, T6): nothing created yet ·
 * everything done · nothing matches the filter. The `title` says which, the
 * `description` what helps now.
 *
 * @when    A list, card or page has no content to show.
 * @instead An empty table inside a card → EmptyRow (stays in the grid).
 *          An error instead of emptiness → ErrorRow or StatusCallout tone="danger".
 *          Still loading → TableLoading.
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
