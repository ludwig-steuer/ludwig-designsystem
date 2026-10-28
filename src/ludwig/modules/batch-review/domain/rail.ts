import { rowSettled, type ChecklistRow, type ReleaseVerdict } from "./checklist";
import type { ReviewStepKey } from "./steps";

/**
 * Was im Rail neben jedem Schritt steht (F123 T123.2).
 *
 * Rein: bekommt die gerechneten Zeilen und sagt, welche Farbe der Punkt hat
 * und was der Zähler darunter sagt. Was gerechnet wird, steht in
 * `application/rail-status.ts`.
 *
 * Die Ampel hat vier Stufen, und die Unterscheidung ist der Punkt:
 * **`blocked`** gibt es nur auf dem Prüfprotokoll und nur, wenn die Freigabe wirklich
 * gesperrt ist — sonst wäre Rot ein Dauerzustand und niemand sähe mehr hin.
 * **`neutral`** heißt „hier gibt es nichts zu zählen" (das Ergebnis ist ein
 * Bericht), nicht „nichts zu tun".
 */

export type RailTone = "neutral" | "open" | "done" | "blocked" | "dimmed";

export interface RailZaehler {
  tone: RailTone;
  /** „3 von 18 offen", „bereit" — `null`, wo es nichts zu zählen gibt. */
  counterText: string | null;
  open: number;
  total: number;
}

/** Zustandstexte des Transportschritts — kein Zähler, sondern ein Weg. */
const TRANSFER_TEXT: Record<string, RailZaehler> = {
  ready: { tone: "open", counterText: "bereit zur Übergabe", open: 0, total: 0 },
  exporting: { tone: "open", counterText: "unterwegs", open: 0, total: 0 },
  exported: { tone: "open", counterText: "unterwegs", open: 0, total: 0 },
  exported_file: { tone: "open", counterText: "Datei erzeugt", open: 0, total: 0 },
  inspection: { tone: "open", counterText: "in Prüfung bei DATEV", open: 0, total: 0 },
  failed: { tone: "blocked", counterText: "fehlgeschlagen", open: 0, total: 0 },
  confirmed: { tone: "done", counterText: "angekommen", open: 0, total: 0 },
  mirrored: { tone: "done", counterText: "angekommen", open: 0, total: 0 },
  closed: { tone: "done", counterText: "abgeschlossen", open: 0, total: 0 },
};

export function railZaehler(
  step: ReviewStepKey,
  input: {
    /** Die Checklisten-Zeilen, die auf diesen Schritt springen. */
    rows: readonly ChecklistRow[];
    verdict: ReleaseVerdict;
    overdueExpectations: number;
    /** F498: offene Befunde „Altlast Vormonat" — Hinweis, kein Prüfpunkt. */
    priorPeriodFindings: number;
    kontenAuffaellig: number;
    state: string;
    /** Ist die Nachlese schon zu füllen? */
    nachleseBereit: boolean;
  },
): RailZaehler {
  if (step === "transfer") {
    return (
      TRANSFER_TEXT[input.state] ?? { tone: "neutral", counterText: null, open: 0, total: 0 }
    );
  }
  if (step === "follow-up") {
    return input.nachleseBereit
      ? { tone: "open", counterText: "Abgleich verfügbar", open: 0, total: 0 }
      : { tone: "neutral", counterText: "wartet auf DATEV", open: 0, total: 0 };
  }
  if (step === "protocol") {
    const blocker = input.verdict.openBlocked + input.verdict.openWarn;
    return {
      tone: input.verdict.openBlocked > 0 ? "blocked" : blocker > 0 ? "open" : "done",
      counterText:
        blocker === 0 ? "bereit" : `${blocker} Blocker${input.verdict.openBlocked > 0 ? "" : " (quittierbar)"}`,
      open: 0,
      total: 0,
    };
  }
  if (step === "open-items") {
    const n = input.overdueExpectations;
    const m = input.priorPeriodFindings;
    const parts = [n > 0 ? `${n} überfällig` : null, m > 0 ? `${m} aus Vormonaten` : null].filter(Boolean);
    return {
      tone: n + m > 0 ? "open" : "done",
      counterText: parts.length > 0 ? parts.join(" · ") : "nichts überfällig",
      // Befunde sind keine Prüfpunkte — der Fortschritt zählt nur die überfälligen Erwartungen.
      open: n,
      total: n,
    };
  }
  if (step === "plausibility") {
    const n = input.kontenAuffaellig;
    return {
      tone: n > 0 ? "open" : "done",
      counterText: n > 0 ? `${n} auffällig` : "unauffällig",
      open: n,
      total: n,
    };
  }

  if (input.rows.length === 0) {
    // Das Ergebnis ist Bericht, kein Todo — ein Zähler wäre erfunden.
    return { tone: "neutral", counterText: null, open: 0, total: 0 };
  }
  const open = input.rows.reduce(
    (s, r) => s + (rowSettled(r) ? 0 : Math.max(r.total - r.done, 0)),
    0,
  );
  const total = input.rows.reduce((s, r) => s + r.total, 0);
  return {
    tone: open === 0 ? "done" : "open",
    counterText: open === 0 ? "erledigt" : `${open} von ${total} offen`,
    open,
    total,
  };
}
