import type { ReactNode } from "react";

/**
 * Action bar with a fixed order: primary, secondary, tertiary, info text. The
 * order sits in the component so it is not renegotiated per screen (design
 * `StapelSeite.dc.html` l. 172–185).
 *
 * **The three names are positions, not weights.** They are laid out left to
 * right, and `variant` alone decides which button looks primary. A caller who
 * reads them as weights puts the loud button first and gets the order
 * backwards — that is what happened to `StepHeader`, where „Weiter" ended up
 * left of „Zurück" (owner correction 2026-09-08). Where the pair has a
 * direction, put it in the slots and let `variant` do the looks.
 *
 * @when    The actions of a screen or dialog footer, exactly one primary path.
 * @instead Actions on a single row → RowActions.
 */
export function ActionBar({
  primary,
  secondary,
  tertiary,
  info,
  className,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  tertiary?: ReactNode;
  info?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`v2actionbar${className ? ` ${className}` : ""}`}>
      {primary}
      {secondary}
      {tertiary}
      {info ? <span className="v2actionbar__info">{info}</span> : null}
    </div>
  );
}

/**
 * Zeilen-Aktionen: ein tertiärer Knopf je Handlung, rechtsbündig. Kein Kebab —
 * ein Icon ohne Wort ist für die Zielgruppe ein Rätsel (UX-Guidelines V7).
 * Die benannte Ausnahme zu T8 (§6, Aufgabe 0012) deckt das Kebab **nicht**:
 * es ist weder konventionell genug noch folgenlos.
 *
 * @when    One to three actions at the right of a table row.
 * @instead More actions → OverflowMenu with a visible word next to the two
 *          frequent ones, or a detail pane (MasterDetail) — not a longer bar.
 */
export function RowActions({ children }: { children: ReactNode }) {
  return <span className="v2actions">{children}</span>;
}
