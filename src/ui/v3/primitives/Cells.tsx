import type { ReactNode } from "react";

/**
 * v2-Zellbausteine (F123 T123.1, Baukasten §9) — die Typen, aus denen sich
 * eine Tabellenspalte zusammensetzt.
 *
 * Regel: Zahlen rechts mit `tnum`, Text links, nichts zentriert (UX-Guidelines V3).
 * Farbe trägt nur, wo sie einen Zustand meint — und dann steht das Wort
 * daneben (V6/V7).
 */

export type CellTone = "neutral" | "muted" | "success" | "warning" | "warning-strong" | "danger";

/**
 * Betrag, rechtsbündig, Ziffern in fester Breite.
 *
 * Owner-Entscheid F123 §4/4: **kein** automatisches Rot für negative Werte.
 * Jede Gutschrift und jede Haben-Zeile ist negativ; würde die Spalte das
 * einfärben, wäre Rot Dekoration statt Signal. Wo eine Zahl wirklich alarmiert
 * (Saldendifferenz, offener Rest), setzt der Aufrufer `tone` selbst.
 */
export function AmountCell({
  value,
  currency = "EUR",
  tone = "neutral",
  title,
}: {
  value: number | string;
  currency?: string | null;
  tone?: CellTone;
  title?: string;
}) {
  const text =
    typeof value === "number"
      ? new Intl.NumberFormat("de-DE", {
          style: currency ? "currency" : "decimal",
          currency: currency ?? undefined,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(value)
      : value;
  return (
    <span className={`v2num${tone === "neutral" ? "" : ` v2num--${tone}`}`} title={title}>
      {text}
    </span>
  );
}

/** Fortschritt als Balken plus Prozentzahl — der Balken allein ist nicht lesbar. */
export function ProgressCell({
  share,
  tone = "accent",
  label,
}: {
  /** 0…1. Werte darüber werden gekappt, damit der Balken nicht ausbricht. */
  share: number;
  tone?: "accent" | "warning" | "danger" | "success";
  label?: string;
}) {
  const pct = Math.max(0, Math.min(1, share));
  return (
    <span>
      <span className="v2bar">
        <span
          className={`v2bar__fill${tone === "accent" ? "" : ` v2bar__fill--${tone}`}`}
          style={{ width: `${pct * 100}%` }}
        />
      </span>
      <span className="v2bar__label">{label ?? `${Math.round(pct * 100)} %`}</span>
    </span>
  );
}

/** Punkt plus Wort. Kein Pill — das ist `StatusBadge` und gehört der Registry. */
export function DotStatus({
  tone,
  label,
}: {
  tone: "neutral" | "info" | "success" | "warning" | "danger";
  label: string;
}) {
  return (
    <span className={`v2dot v2dot--${tone}`}>
      <i />
      {label}
    </span>
  );
}

/**
 * Zeitpunkt. Voreinstellung ist **absolut** in Europe/Berlin — „vor 3 Tagen"
 * ist beim Prüfen einer Periode wertlos, das Datum nicht (R3, Design
 * `StapelSeite.dc.html` Z. 99).
 */
const BERLIN: Intl.DateTimeFormatOptions = { timeZone: "Europe/Berlin" };
const KURZ = new Intl.DateTimeFormat("de-DE", {
  ...BERLIN,
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});
const VOLL = new Intl.DateTimeFormat("de-DE", {
  ...BERLIN,
  dateStyle: "full",
  timeStyle: "short",
});

export function Timestamp({ iso, prefix }: { iso: string | Date | null; prefix?: string }) {
  if (!iso) return <span className="v2muted">—</span>;
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return <span className="v2muted">—</span>;
  return (
    <time dateTime={d.toISOString()} title={VOLL.format(d)}>
      {prefix ? `${prefix} ` : ""}
      {KURZ.format(d)}
    </time>
  );
}

/**
 * Abweichung gegen den Vormonatsschnitt. Die vier Stufen (0–15 % · 15–50 % ·
 * 50–100 % · ab 100 %) rechnet **eine** Domain-Funktion aus; die Zelle malt
 * nur. Der Tooltip trägt die Rechnung, damit die Zahl kein Orakel ist.
 */
export function AbweichungsZelle({
  pct,
  tone,
  explanation,
}: {
  /** Abweichung in Prozent; `null` = zu jung für einen Vergleich. */
  pct: number | null;
  tone: CellTone;
  explanation: string;
}) {
  if (pct === null) {
    return (
      <span className="v2num v2num--muted" title={explanation}>
        —
      </span>
    );
  }
  const sign = pct > 0 ? "+" : "";
  return (
    <span className={`v2num${tone === "neutral" ? "" : ` v2num--${tone}`}`} title={explanation}>
      {sign}
      {new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(pct)} %
    </span>
  );
}

/** Ladezustand in Zeilenhöhe — die Tabelle springt beim Eintreffen nicht. */
export function TableLoading({ rows = 3, cols = 3 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <div className="v2tbl__row" key={r} aria-hidden>
          {Array.from({ length: cols }, (_, c) => (
            <span className="v2skel" key={c} style={{ width: c === 0 ? "70%" : "45%" }} />
          ))}
        </div>
      ))}
      <span className="sr-only">Wird geladen …</span>
    </>
  );
}

/** Der fünfte Zustand (UX-Guidelines V9): das Laden ist gescheitert, nicht leer. */
export function ErrorRow({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <div className="v2tbl__error" role="alert">
      <span>{message}</span>
      {action}
    </div>
  );
}
