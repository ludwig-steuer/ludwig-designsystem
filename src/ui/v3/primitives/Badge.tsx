import type { ReactNode } from "react";

/**
 * Die Tonstufen einer Plakette — dieselbe Kritikalitätsskala wie überall im
 * Set (V6): Farbe sagt Dringlichkeit, nicht Kategorie.
 */
export type BadgeTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface BadgeProps {
  tone?: BadgeTone;
  /** Punkt vor dem Text — für Zustände, die auf einen Blick zählbar sein sollen. */
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Kurze Auszeichnung an einem Objekt: Art, Zähler, Rolle, Herkunft.
 *
 * Trägt immer ein Wort — die Farbe allein bedeutet nichts (V7).
 *
 * @when    Eine Eigenschaft, die zum Objekt gehört und in einem Wort steht:
 *          Belegkategorie, Rolle, Anzahl, Herkunft.
 * @instead Ein Zustand aus einer Status-Achse → StatusBadge (holt Label und
 *          Ton aus der Registry, R1). Ein Hinweis mit Satz → Callout.
 *          Eine Zahl in einer Tabellenspalte → AmountCell.
 */
export function Badge({ tone = "neutral", dot, children, className }: BadgeProps) {
  return (
    <span className={`bdg bdg-${tone}${className ? ` ${className}` : ""}`}>
      {dot ? <span className="dot" /> : null}
      {children}
    </span>
  );
}
