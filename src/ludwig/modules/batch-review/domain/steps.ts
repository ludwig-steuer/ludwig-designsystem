import type { BookingCycleKind } from "@/ludwig/modules/accounting-cases";

/**
 * Die Prüfschritte der Stapelabnahme (F109, Änderungsbrief §3).
 *
 * Ein Schritt heißt mit seinem **Schlüssel** — zugleich das URL-Segment
 * (`…/review/completeness`). Eine Nummer trägt er nicht: welche Schritte eine
 * Stapelart zeigt, ist verschieden, und „Schritt 3" wäre je Stapel ein anderer.
 * Die Zahl im Rail ist nur die fortlaufende Position 1…n in der Stapelart
 * (`reviewStepNumber`); wer auf einen Schritt verweist, nennt ihn beim Namen.
 *
 * Der Rail ist **ein Vorschlag, kein Zwang**: jeder Schritt ist jederzeit
 * erreichbar, das Prüfprotokoll zeigt, was noch offen ist. Was der Zustand des
 * Stapels regelt, ist nicht die Reihenfolge, sondern ob man schreiben darf —
 * siehe `gating.ts`.
 */

/** Rail-Reihenfolge. */
export const REVIEW_STEP_KEYS = [
  "result",
  "completeness",
  "document-review",
  "clarifications",
  "client-entries",
  "proposals",
  "account-clearing",
  "open-items",
  "plausibility",
  "conventions",
  "protocol",
  "transfer",
  "follow-up",
] as const;
export type ReviewStepKey = (typeof REVIEW_STEP_KEYS)[number];

export interface ReviewStep {
  /** Zugleich das URL-Segment: `…/review/proposals`. */
  key: ReviewStepKey;
  /** Eintrag im Rail und Überschrift des Screens — ein Substantiv. */
  label: string;
  /** Ein Satz: was der Prüfer hier tut. */
  description: string;
}

const STEP_TEXTS: Record<ReviewStepKey, Omit<ReviewStep, "key">> = {
  result: { label: "Ergebnis des Stapels", description: "Sehen, was Ludwig erledigt hat und wo er nicht fertig wurde – danach beginnt die Abnahme." },
  completeness: { label: "Vollständigkeit", description: "Prüfen, ob alle Kontoauszüge und Belege des Zeitraums da sind." },
  // F452: kein Beleg bleibt stillschweigend liegen — gebucht, klar disponiert oder gesichtet.
  "document-review": { label: "Belegprüfung", description: "Jeden Beleg ohne Buchung und ohne klare Verarbeitung entscheiden – Vorschlag ausführen oder ansehen." },
  clarifications: { label: "Rückfragen", description: "Die Fragen von Ludwig beantworten, damit er die betroffenen Sachverhalte fertig buchen kann." },
  // Nur im Mandantenstapel (Owner 2026-09-23): die Sätze hat der Mandant
  // gebucht — hier sieht die Kanzlei sie je Konto und übernimmt sie in einem Zug.
  "client-entries": { label: "Buchungen des Mandanten", description: "Die gelieferten Sätze je Konto sehen und alle in einem Zug übernehmen – gebucht hat sie der Mandant." },
  proposals: { label: "Buchungsvorschläge", description: "Jeden Vorschlag prüfen und übernehmen, ändern oder an Ludwig zurückgeben." },
  // F220: „Kontenausgleich" — Banken, Verrechnungskonten, ruhende Zahlungskonten (Owner 2026-09-15).
  "account-clearing": { label: "Kontenausgleich", description: "Prüfen, ob Bank- und Verrechnungskonten zum Periodenende aufgehen." },
  "open-items": { label: "Offene Posten", description: "Sehen, wer zum Periodenende wem wie viel schuldet – und ob das zu DATEV passt." },
  plausibility: { label: "Plausibilität", description: "Die Konten des Monats mit den letzten drei Monaten vergleichen und Ausreißer klären." },
  conventions: { label: "Konventionen", description: "Bestätigen oder verwerfen, was Ludwig in diesem Stapel als Regel gelernt hat." },
  protocol: { label: "Prüfprotokoll", description: "Alle Prüfungen auf einen Blick – dann den Stapel freigeben oder an Ludwig zurückgeben." },
  transfer: { label: "Übergabe an DATEV", description: "Den freigegebenen Stapel an DATEV übertragen und sehen, ob er angekommen ist." },
  "follow-up": { label: "Nachlese", description: "Vergleichen, was DATEV aus den übertragenen Sätzen gemacht hat." },
};

export const REVIEW_STEPS: readonly ReviewStep[] = REVIEW_STEP_KEYS.map((key) => ({
  key,
  ...STEP_TEXTS[key],
}));

export function reviewStepLabel(key: ReviewStepKey): string {
  return STEP_TEXTS[key].label;
}

/**
 * Welche Prüfschritte in welcher Stapelart gelten.
 *
 * **SSOT ist `docs/reference/stapelarten.md`** — diese Konstante zieht nach,
 * nicht umgekehrt; `__tests__/batch-kinds-catalog.test.ts` hält beides
 * zusammen (F179).
 *
 * Beim Mandantenstapel bleiben Ergebnis · Rückfragen · Buchungen des Mandanten
 * · Prüfprotokoll · Übergabe · Nachlese: der Mandant hat gebucht, Ludwig
 * ordnet Belege zu, die Kanzlei übernimmt die Sätze und übergibt. Was Ludwigs
 * eigene Arbeit prüft — Vollständigkeit, Vorschläge, Kontenausgleich, Offene
 * Posten, Plausibilität, Konventionen — gibt es dort nicht.
 */
export const REVIEW_STEP_SCOPE: Record<ReviewStepKey, { regular: boolean; clientBatch: boolean }> = {
  result: { regular: true, clientBatch: true },
  completeness: { regular: true, clientBatch: false },
  "document-review": { regular: true, clientBatch: false },
  clarifications: { regular: true, clientBatch: true },
  "client-entries": { regular: false, clientBatch: true },
  proposals: { regular: true, clientBatch: false },
  "account-clearing": { regular: true, clientBatch: false },
  "open-items": { regular: true, clientBatch: false },
  plausibility: { regular: true, clientBatch: false },
  conventions: { regular: true, clientBatch: false },
  protocol: { regular: true, clientBatch: true },
  transfer: { regular: true, clientBatch: true },
  "follow-up": { regular: true, clientBatch: true },
};

/** Gilt dieser Prüfschritt in dieser Stapelart? */
export function reviewStepApplies(step: ReviewStepKey, kind: BookingCycleKind): boolean {
  const scope = REVIEW_STEP_SCOPE[step];
  return kind === "client_batch" ? scope.clientBatch : scope.regular;
}

/** Die Schritte einer Stapelart in Rail-Reihenfolge. */
export function reviewStepsFor(kind: BookingCycleKind): ReviewStep[] {
  return REVIEW_STEPS.filter((s) => reviewStepApplies(s.key, kind));
}

/**
 * Die Zahl vor dem Schritt: fortlaufend 1…n in dieser Stapelart. `null`, wo
 * der Schritt in der Stapelart nicht vorkommt.
 */
export function reviewStepNumber(key: ReviewStepKey, kind: BookingCycleKind): number | null {
  const i = reviewStepsFor(kind).findIndex((s) => s.key === key);
  return i < 0 ? null : i + 1;
}

/** URL-Segment → Schritt. Unbekanntes ist `null`. */
export function parseReviewStep(raw: string | undefined): ReviewStep | null {
  return REVIEW_STEPS.find((s) => s.key === raw) ?? null;
}
