import type { ReactNode } from "react";

/**
 * Aktionsleiste mit fester Reihenfolge: primär, sekundär, tertiär, Infotext.
 * Die Reihenfolge steckt in der Komponente, damit sie nicht je Screen neu
 * verhandelt wird (Design `StapelSeite.dc.html` Z. 172–185).
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
