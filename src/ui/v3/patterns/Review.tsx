import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  CircleSlash,
  HelpCircle,
  Info,
  PencilLine,
  Undo2,
  XCircle,
} from "lucide-react";
import type { ReactNode } from "react";

/**
 * v2-Prüfbausteine (F123 T123.1): Zustands-Icon, Checklist, Prüfpunkte,
 * Messages.
 *
 * Gemeinsame Regel: **passed ist eine Zeile, nicht zwanzig.** Was in
 * Ordnung ist, wird zusammengefasst; eine eigene Zeile bekommt nur, was open,
 * gewarnt oder gescheitert ist (UX-Guidelines L7). Sonst sucht die Prüferin ihre drei
 * Probleme zwischen zwanzig grünen Haken.
 */

/* ── Zustands-Icon ───────────────────────────────────────────────────────
 * Das Design zeichnet die Zustände als Sonderzeichen (○ ✓ ✎ ↩ ? ⊘). Ludwig
 * setzt Lucide: ein Unicode-Glyph rendert je nach Schrift anders und hat
 * keinen Namen für die Vorlesehilfe (UX-Guidelines §2).
 */

export type StateKind =
  | "open"
  | "done"
  | "edited"
  | "returned"
  | "question"
  | "skipped"
  | "warning"
  | "error"
  | "info";

const ICONS = {
  open: { Icon: Circle, tone: "muted", label: "open" },
  done: { Icon: CheckCircle2, tone: "success", label: "erledigt" },
  edited: { Icon: PencilLine, tone: "info", label: "bearbeitet" },
  returned: { Icon: Undo2, tone: "warning", label: "zurückgegeben" },
  question: { Icon: HelpCircle, tone: "warning", label: "Frage open" },
  skipped: { Icon: CircleSlash, tone: "muted", label: "übersprungen" },
  warning: { Icon: AlertTriangle, tone: "warning", label: "Warnung" },
  error: { Icon: XCircle, tone: "danger", label: "Fehler" },
  info: { Icon: Info, tone: "info", label: "Hinweis" },
} as const satisfies Record<StateKind, { Icon: typeof Circle; tone: string; label: string }>;

const TONE_VAR: Record<string, string> = {
  muted: "var(--color-text-subtle)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  danger: "var(--color-danger)",
  info: "var(--color-accent-700)",
};

/**
 * @when    State of an item in a list or row, always with a word next to it.
 */
export function StateIcon({ state, title }: { state: StateKind; title?: string }) {
  const { Icon, tone, label } = ICONS[state];
  return (
    <Icon
      size={15}
      strokeWidth={1.5}
      color={TONE_VAR[tone]}
      aria-label={title ?? label}
      role="img"
    />
  );
}

/* ── Checklist ─────────────────────────────────────────────────────────── */

export interface ChecklistRow {
  key: string;
  state: StateKind;
  label: string;
  /** „3 von 18" — die echte Menge, nie eine erfundene „0 von 1". */
  counter?: string;
  counterAlarm?: boolean;
  /** Anteil 0…1; ohne Wert bleibt die Spalte leer. */
  progress?: number | null;
  /** Wohin die Zeile springt („→ Schritt 4: Zahlungen"). */
  jump?: string;
}

/**
 * Die Prüfliste eines Gates (Design `PruefChecklist.dc.html`): Prüfung ·
 * Stand · Fortschritt · Sprung. Das Detail rechts baut der Aufrufer mit
 * `ChecklisteDetail` in einem `MasterDetail`.
 *
 * @when    Checklist of a gate: check, status, progress, jump.
 * @instead Items to work through → TodoListe.
 */
export function Checklist({
  rows,
  activeKey,
  onPick,
}: {
  rows: ChecklistRow[];
  activeKey?: string;
  onPick?: (key: string) => void;
}) {
  const cols = "20px 1fr 76px 100px 150px";
  return (
    <div className="v2card">
      <div className="v2tbl" style={{ "--v2-cols": cols } as React.CSSProperties}>
        <div className="v2tbl__head">
          <span />
          <span>Prüfung</span>
          <span className="v2num">Stand</span>
          <span>Fortschritt</span>
          <span>Sprung</span>
        </div>
        {rows.map((r) => (
          <ChecklistZeile key={r.key} row={r} active={r.key === activeKey} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}

function ChecklistZeile({
  row,
  active,
  onPick,
}: {
  row: ChecklistRow;
  active: boolean;
  onPick?: (key: string) => void;
}) {
  const body = (
    <>
      <span className="v2chk__icon">
        <StateIcon state={row.state} />
      </span>
      <span className="v2chk__label">{row.label}</span>
      <span className={`v2num v2chk__stand${row.counterAlarm ? " v2num--danger" : ""}`}>
        {row.counter ?? ""}
      </span>
      <span>
        {row.progress == null ? null : (
          <span className="v2bar">
            <span
              className={`v2bar__fill${row.state === "warning" ? " v2bar__fill--warning" : ""}`}
              style={{ width: `${Math.max(0, Math.min(1, row.progress)) * 100}%` }}
            />
          </span>
        )}
      </span>
      <span className="v2chk__jump">{row.jump ? `→ ${row.jump}` : ""}</span>
    </>
  );
  if (!onPick) return <div className={`v2tbl__row${active ? " is-active" : ""}`}>{body}</div>;
  return (
    <div
      role="button"
      tabIndex={0}
      className={`v2tbl__row is-clickable${active ? " is-active" : ""}`}
      onClick={() => onPick(row.key)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick(row.key);
        }
      }}
    >
      {body}
    </div>
  );
}

/* ── Prüfpunkte ─────────────────────────────────────────────────────────── */

export interface CheckItem {
  code: string;
  /** Was geprüft wird, als Frage — „Stimmt der Steuersatz zum Beleg?" */
  question: string;
  /** Warum das Ergebnis so ist. Immer gefüllt, sonst ist die Stufe ein Orakel. */
  reason: string;
  state: "green" | "yellow" | "red" | "open";
  /** Sprung an die Stelle, an der sich der Punkt klären lässt. */
  jump?: ReactNode;
  /** Das Gate: ein roter oder gelber Punkt muss abgehakt werden. */
  gate?: ReactNode;
}

const PP_ICON: Record<CheckItem["state"], StateKind> = {
  green: "done",
  yellow: "warning",
  red: "error",
  open: "open",
};

/**
 * Prüfpunkte als Akkordeon. Bestandene stehen zusammengefasst in einer Zeile;
 * offene, gewarnte und gescheiterte einzeln, jeweils mit Begründung.
 *
 * @when    Individual checks of a booking entry with reasons; passed ones in a single line.
 * @instead Error that blocks saving → Messages.
 */
export function CheckItems({ items }: { items: CheckItem[] }) {
  const passed = items.filter((i) => i.state === "green");
  const open = items.filter((i) => i.state !== "green");
  return (
    <div className="v2pp">
      {passed.length > 0 ? (
        <div className="v2pp__ok">
          <StateIcon state="done" />
          {passed.length} von {items.length} Prüfpunkten bestanden
          <span className="v2pp__code">{passed.map((b) => b.code).join(" ")}</span>
        </div>
      ) : null}
      {open.map((i) => (
        <div className="v2pp__row" key={i.code}>
          <StateIcon state={PP_ICON[i.state]} />
          <span style={{ flex: "1 1 auto", minWidth: 0 }}>
            <span className="v2pp__q">
              {i.question} <span className="v2pp__code">{i.code}</span>
            </span>
            <span className="v2pp__why">{i.reason}</span>
          </span>
          {i.gate}
          {i.jump}
        </div>
      ))}
      {items.length === 0 ? <div className="v2pp__ok">Keine Prüfpunkte für diesen Fall.</div> : null}
    </div>
  );
}

/* ── Messages ──────────────────────────────────────────────────────────── */

export interface Message {
  key: string;
  level: "error" | "warning" | "hint";
  text: ReactNode;
  /** Warnungen brauchen eine Quittung oder einen Weg zur Behebung. */
  actions?: ReactNode;
}

/**
 * Fehler blockieren, Warnungen brauchen eine Quittung, Hinweise stehen nur da.
 * Die Stufe steckt in `level` — der Aufrufer wählt nicht die Farbe, sondern
 * die Bedeutung.
 *
 * @when    Error, warning or hint about a booking entry or form.
 * @instead Note not tied to a booking entry → Callout.
 */
export function Messages({ items }: { items: Message[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      {items.map((m) => (
        <div className={`v2msg v2msg--${m.level}`} key={m.key} role={m.level === "error" ? "alert" : undefined}>
          <StateIcon state={m.level === "hint" ? "info" : m.level} />
          <span className="v2msg__body">{m.text}</span>
          {m.actions ? <span className="v2msg__actions">{m.actions}</span> : null}
        </div>
      ))}
    </div>
  );
}
