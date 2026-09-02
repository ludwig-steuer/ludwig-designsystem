/**
 * Die elf Schritte der Stapelabnahme (F109, Änderungsbrief §3).
 *
 * Der Rail ist **ein Vorschlag, kein Zwang**: jeder Schritt ist jederzeit
 * erreichbar, der Abschluss (Schritt 8) zeigt, was noch offen ist. Was der
 * Zustand des Stapels regelt, ist nicht die Reihenfolge, sondern ob man
 * schreiben darf — siehe `gating.ts`.
 */

export interface AbnahmeStep {
  /** Zugleich das URL-Segment: `…/abnahme/3`. */
  n: number;
  /** Kurzname im Rail. */
  label: string;
  /** Die Frage, die der Schritt beantwortet — der Lead unter der Überschrift. */
  question: string;
  /**
   * Die Überschrift des Screens. Sie ist nicht das Rail-Label: im Rail steht
   * „1 · Vollständigkeit" als Wegweiser, über dem Screen steht die Sache
   * selbst. Die Nummer trägt die Overline.
   */
  title: string;
}

export const ABNAHME_STEPS: readonly AbnahmeStep[] = [
  { n: 0, label: "Ergebnis des Stapels", question: "Was hat der Agent geschafft?", title: "Abnahme Buchungsstapel" },
  { n: 1, label: "Vollständigkeit", question: "Ist alles da — und so viel wie sonst?", title: "Ist alles da?" },
  { n: 2, label: "Rückfragen", question: "Was will der Agent von mir?", title: "Rückfragen des Agenten" },
  { n: 3, label: "Buchungsvorschläge", question: "Stimmen die Vorschläge?", title: "Buchungsvorschläge" },
  { n: 4, label: "Bank", question: "Geht die Bank auf?", title: "Bank und Zahlungen" },
  { n: 5, label: "Offene Posten", question: "Wer schuldet wem?", title: "Offene Posten" },
  { n: 6, label: "Plausibilität", question: "Sieht der Monat aus wie sonst?", title: "Plausibilität der Konten" },
  { n: 7, label: "Konventionen", question: "Was hat der Agent gelernt?", title: "Was der Agent gelernt hat" },
  { n: 8, label: "Prüfprotokoll", question: "Freigeben oder zurückgeben?", title: "Prüfprotokoll und Freigabe" },
  { n: 9, label: "Übergabe an DATEV", question: "Ist der Stapel angekommen?", title: "Übergabe an DATEV" },
  { n: 10, label: "Nachlese", question: "Was hat DATEV anders gemacht?", title: "Nachlese" },
];

export const FIRST_STEP = 0;
export const LAST_REVIEW_STEP = 8;
export const TRANSFER_STEP = 9;
export const NACHLESE_STEP = 10;

/** URL-Segment → Schritt. Unbekanntes ist `null`, damit die Route 404 gibt. */
export function parseAbnahmeStep(raw: string | undefined): AbnahmeStep | null {
  if (raw === undefined || !/^\d{1,2}$/.test(raw)) return null;
  return ABNAHME_STEPS.find((s) => s.n === Number(raw)) ?? null;
}
