import { LAST_REVIEW_STEP, NACHLESE_STEP, TRANSFER_STEP } from "./steps";

/**
 * Wer darf in der Abnahme was — abgeleitet aus dem Stapel-Zustand
 * (Änderungsbrief §3, F118 §2.3).
 *
 * Der Zustand ist die einzige Quelle: es gibt kein Review-Status-Feld mehr und
 * soll auch keins geben. Wer prüft, hat den Stapel übernommen (`review`); wer
 * ihn nicht übernommen hat, sieht alles und ändert nichts.
 *
 * Reine Funktionen ohne IO — die Route ruft sie, der Rail rendert daraus, und
 * jede Server Action prüft sie noch einmal. Ein gedimmter Knopf ist keine
 * Zugriffskontrolle.
 */

/** Was ein Schritt im Rail sein kann. */
export type StepAccess =
  /** Klickbar und schreibbar. */
  | "active"
  /** Klickbar, aber nichts lässt sich festschreiben. */
  | "readonly"
  /** Nicht klickbar — es gibt dort in diesem Zustand nichts zu sehen. */
  | "dimmed";

export interface AbnahmeBanner {
  tone: "info" | "warning" | "danger";
  text: string;
  /** Was der Zustand als Nächstes erlaubt — der Knopf steht im Kopf. */
  action: "take_over" | null;
  /**
   * Seit wann der Zustand gilt. „Freigegeben" ohne Datum ist eine Behauptung;
   * mit Datum ist es eine Auskunft. Reicht der Aufrufer durch, weil nur er
   * weiß, welcher Zeitstempel zum Zustand gehört.
   */
  at?: string | null;
}

export interface AbnahmeGating {
  /** Darf die Kanzlei in den Schritten 0–8 überhaupt schreiben? */
  writable: boolean;
  /** Wohin „Öffnen" springt, wenn kein Schritt in der URL steht. */
  entryStep: number;
  banner: AbnahmeBanner | null;
}

/**
 * Zustände, in denen der Stapel unterwegs ist: die Sätze sind geclaimt und
 * gesperrt, die Abnahme ist ein Nachschlagewerk.
 */
const IN_TRANSFER = new Set(["ready", "exporting", "inspection", "failed"]);
const IN_DATEV = new Set(["confirmed", "mirrored", "closed"]);

export function abnahmeGating(state: string, at?: string | null): AbnahmeGating {
  const g = gatingOhneZeit(state);
  return g.banner ? { ...g, banner: { ...g.banner, at: at ?? null } } : g;
}

function gatingOhneZeit(state: string): AbnahmeGating {
  if (state === "agent") {
    return {
      writable: false,
      entryStep: 0,
      banner: {
        tone: "info",
        text: "Der Agent arbeitet an diesem Stapel — alles sichtbar, nichts quittierbar.",
        action: null,
      },
    };
  }
  if (state === "prepared") {
    return {
      writable: false,
      entryStep: 0,
      banner: {
        tone: "warning",
        text:
          "Der Stapel ist bereit, aber niemand arbeitet darin. Bis zur Übernahme " +
          "landen nachgereichte Belege im selben Zyklus — der nächste Agentenlauf nimmt sie mit.",
        action: "take_over",
      },
    };
  }
  if (state === "review") {
    return { writable: true, entryStep: 0, banner: null };
  }
  if (IN_TRANSFER.has(state)) {
    return {
      writable: false,
      entryStep: TRANSFER_STEP,
      banner:
        state === "failed"
          ? {
              tone: "danger",
              text: "DATEV hat den Stapel abgelehnt. Der Claim bleibt — die Sätze sind weiter gesperrt.",
              action: null,
            }
          : {
              tone: "info",
              text: "Freigegeben — der Stapel ist unterwegs. Die Prüfschritte sind ab hier nur noch Nachschlagewerk.",
              action: null,
            },
    };
  }
  if (IN_DATEV.has(state)) {
    return {
      writable: false,
      entryStep: NACHLESE_STEP,
      banner: {
        tone: "info",
        text: "Der Stapel ist in DATEV angekommen. Änderungen gehen nur noch über Storno im Folgestapel.",
        action: null,
      },
    };
  }
  // `cancelled` und alles Unbekannte: sichtbar, aber tot.
  return {
    writable: false,
    entryStep: 0,
    banner: {
      tone: "warning",
      text: "Dieser Stapel ist abgebrochen — er wird nicht mehr weitergeführt.",
      action: null,
    },
  };
}

/**
 * Zugriff je Schritt.
 *
 * Schritt 10 (Nachlese) öffnet, **sobald DATEV den Stapel bestätigt hat**.
 * Vorher gibt es nichts abzugleichen — dann ist der Eintrag gedimmt und sagt
 * im Titel, worauf er wartet. (Bis F123 war er dauerhaft gedimmt, obwohl der
 * Abgleich Ludwig ⟷ DATEV längst gelesen werden kann.)
 */
export function stepAccess(state: string, step: number): StepAccess {
  if (step === NACHLESE_STEP) return IN_DATEV.has(state) ? "readonly" : "dimmed";
  const gating = abnahmeGating(state);
  if (step === TRANSFER_STEP) {
    // Vor der Prüfung gibt es nichts zu übergeben.
    if (state === "agent" || state === "prepared" || state === "cancelled") return "dimmed";
    return IN_TRANSFER.has(state) ? "active" : "readonly";
  }
  if (step > LAST_REVIEW_STEP) return "dimmed";
  return gating.writable ? "active" : "readonly";
}
