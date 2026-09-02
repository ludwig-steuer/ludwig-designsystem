import type { ReactNode } from "react";

/**
 * Aktionsleiste mit fester Reihenfolge: primär, sekundär, tertiär, Infotext.
 * Die Reihenfolge steckt in der Komponente, damit sie nicht je Screen neu
 * verhandelt wird (Design `StapelSeite.dc.html` Z. 172–185).
 *
 * @when    Die Handlungen eines Screens oder Dialog-Fußes, genau ein primärer Weg.
 * @instead Handlungen an einer einzelnen Zeile → RowActions.
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
 *
 * @when    Ein bis drei Handlungen rechts in einer Tabellenzeile.
 * @instead Mehr Handlungen → die Zeile bekommt ein Detail (MasterDetail), keine längere Leiste.
 */
export function RowActions({ children }: { children: ReactNode }) {
  return <span className="v2actions">{children}</span>;
}
