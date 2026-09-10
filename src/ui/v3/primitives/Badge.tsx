import type { ReactNode } from "react";

/** The badge's tones — the set's criticality scale (V6): colour says urgency, not category. */
export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps {
  tone?: BadgeTone;
  /** Dot before the text — for states that should be countable at a glance. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * A short mark on an object: kind, count, role, origin. Always carries a word —
 * colour alone means nothing (V7).
 *
 * @when    A property of the object that fits one word: document category,
 *          role, count, origin.
 * @instead A state from a status axis → StatusBadge (label and tone from the
 *          registry, R1). A note with a sentence → Callout. A number in a
 *          table column → AmountCell.
 */
export function Badge({ tone = "neutral", dot, children, className }: BadgeProps) {
  return (
    <span className={`bdg bdg-${tone}${className ? ` ${className}` : ""}`}>
      {dot ? <span className="dot" /> : null}
      {children}
    </span>
  );
}
