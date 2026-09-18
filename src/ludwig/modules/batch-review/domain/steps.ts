import type { BookingCycleKind } from "@/ludwig/modules/datev-export";

/**
 * Die elf Schritte der Stapelabnahme (F109, Änderungsbrief §3).
 *
 * Der Rail ist **ein Vorschlag, kein Zwang**: jeder Schritt ist jederzeit
 * erreichbar, der Abschluss (Schritt 8) zeigt, was noch offen ist. Was der
 * Zustand des Stapels regelt, ist nicht die Reihenfolge, sondern ob man
 * schreiben darf — siehe `gating.ts`.
 */

export interface ReviewStep {
  /** Zugleich das URL-Segment: `…/review/3`. */
  n: number;
  /** Eintrag im Rail und Überschrift des Screens — ein Substantiv. */
  label: string;
  /** Ein Satz: was der Prüfer hier tut. */
  description: string;
}

export const REVIEW_STEPS: readonly ReviewStep[] = [
  { n: 0, label: "Ergebnis des Stapels", description: "Sehen, was der Agent erledigt hat und wo er nicht fertig wurde – danach beginnt die Abnahme." },
  { n: 1, label: "Vollständigkeit", description: "Prüfen, ob alle Kontoauszüge und Belege des Zeitraums da sind – und ob es so viele sind wie sonst." },
  { n: 2, label: "Rückfragen", description: "Die Fragen des Agenten beantworten, damit er die betroffenen Sachverhalte fertig buchen kann." },
  { n: 3, label: "Buchungsvorschläge", description: "Jeden Vorschlag prüfen und übernehmen, ändern oder an den Agenten zurückgeben." },
  // F220: „Kontenausgleich" — Banken, Verrechnungskonten, ruhende Zahlungskonten (Owner 2026-09-15).
  { n: 4, label: "Kontenausgleich", description: "Prüfen, ob Bank- und Verrechnungskonten zum Periodenende aufgehen." },
  { n: 5, label: "Offene Posten", description: "Sehen, wer zum Periodenende wem wie viel schuldet – und ob das zu DATEV passt." },
  { n: 6, label: "Plausibilität", description: "Die Konten des Monats mit den letzten drei Monaten vergleichen und Ausreißer klären." },
  { n: 7, label: "Konventionen", description: "Bestätigen oder verwerfen, was der Agent in diesem Stapel als Regel gelernt hat." },
  { n: 8, label: "Prüfprotokoll", description: "Alle Prüfpunkte auf einen Blick – dann den Stapel freigeben oder an den Agenten zurückgeben." },
  { n: 9, label: "Übergabe an DATEV", description: "Den freigegebenen Stapel an DATEV übertragen und sehen, ob er angekommen ist." },
  { n: 10, label: "Nachlese", description: "Vergleichen, was DATEV aus den übertragenen Sätzen gemacht hat." },
];

/**
 * Welche Prüfschritte in welcher Stapelart gelten.
 *
 * **SSOT ist `docs/reference/stapelarten.md`** — diese Konstante zieht nach,
 * nicht umgekehrt; `__tests__/stapelarten-katalog.test.ts` hält beides
 * zusammen (F179).
 *
 * Beim Mandantenstapel bleiben `0 · 2 · 8 · 9 · 10`: der Mandant hat gebucht,
 * Ludwig ordnet Belege zu und übergibt. Was Ludwigs eigene Arbeit prüft —
 * Vollständigkeit, Vorschläge, Bank, Offene Posten, Plausibilität,
 * Konventionen — gibt es dort nicht.
 */
export const REVIEW_STEP_SCOPE: Record<number, { regular: boolean; clientBatch: boolean }> = {
  0: { regular: true, clientBatch: true },
  1: { regular: true, clientBatch: false },
  2: { regular: true, clientBatch: true },
  3: { regular: true, clientBatch: false },
  4: { regular: true, clientBatch: false },
  5: { regular: true, clientBatch: false },
  6: { regular: true, clientBatch: false },
  7: { regular: true, clientBatch: false },
  8: { regular: true, clientBatch: true },
  9: { regular: true, clientBatch: true },
  10: { regular: true, clientBatch: true },
};

/**
 * Gilt dieser Prüfschritt in dieser Stapelart?
 *
 * Ein unbekanntes `kind` (die Spalte trägt einen CHECK — ein dritter Wert wäre
 * ein Migrationsfehler) gilt als `regular`: lieber ein Schritt zu viel als eine
 * leere Abnahme.
 */
export function reviewStepApplies(step: number, kind: BookingCycleKind): boolean {
  const scope = REVIEW_STEP_SCOPE[step];
  if (!scope) return false;
  return kind === "client_batch" ? scope.clientBatch : scope.regular;
}

export const FIRST_STEP = 0;
export const LAST_REVIEW_STEP = 8;
export const TRANSFER_STEP = 9;
export const NACHLESE_STEP = 10;

/** URL-Segment → Schritt. Unbekanntes ist `null`, damit die Route 404 gibt. */
export function parseReviewStep(raw: string | undefined): ReviewStep | null {
  if (raw === undefined || !/^\d{1,2}$/.test(raw)) return null;
  return REVIEW_STEPS.find((s) => s.n === Number(raw)) ?? null;
}
