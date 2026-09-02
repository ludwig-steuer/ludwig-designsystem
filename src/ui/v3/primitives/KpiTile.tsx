import type { CSSProperties, ReactNode } from "react";

/**
 * Kennzahl-Kachel der Detailseite (F123 T123.1): 19 px Sans, Rand statt Schatten.
 *
 * Abgrenzung zu `Stat`/`StatGrid` der App: das ist die Dashboard-Kachel
 * (32 px Serif, Schatten). Auf Detailseiten steht diese hier.
 *
 * @wann  Eine Zahl mit Label im Kopf einer Detailseite; mehrere im `KpiGrid`.
 * @nicht Zahl in einer Tabellenspalte → AmountCell. Label/Wert-Paare als Text → FieldList.
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

/** Raster für Kennzahl-Kacheln; `columns` ist die Spaltenzahl auf voller Breite. */
export function KpiGrid({ columns = 6, children }: { columns?: number; children: ReactNode }) {
  return (
    <div className="v2kpigrid" style={{ "--v2-kpi-cols": columns } as CSSProperties}>
      {children}
    </div>
  );
}
