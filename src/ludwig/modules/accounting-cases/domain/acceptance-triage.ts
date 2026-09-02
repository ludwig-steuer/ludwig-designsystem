/**
 * Abnahme-Triage (F31-T31.3): Judge-Verdikte + Satz-Konfidenz zu einer
 * Arbeitsreihenfolge verdichten.
 *
 * Abnahme und Export bleiben menschlich — der Engpass ist die Zeit der
 * Buchhalterin, nicht die Zahl der Vorschläge. Nach dem Judge-Pass liegen alle
 * Daten für eine Priorisierung vor, aber niemand aggregiert sie: die
 * Abnahme-Liste zeigt 34 Sätze gleichrangig, und welche 4 einen echten Blick
 * brauchen, muss man selbst herausfinden.
 *
 * Diese Ableitung ist **rein deterministisch** (kein LLM, keine neue
 * Judge-Phase, keine Migration) und wird von Web-UI und KW-Bericht geteilt —
 * ein Begriffssystem, zwei Oberflächen.
 *
 * Bewertet wird der **Satz**, nicht die Zeile (Owner-Entscheid 2026-08-29):
 * der Mensch liest den Satz ohnehin ganz. Die Ampel kommt gebandet aus
 * `client_journal_entry.proposal_confidence` (`entryConfLevel` in
 * `ui/booking/format.ts`); die frühere Zeilen-Ampel
 * (`client_journal_entry_line.confidence`) wird nicht mehr geschrieben oder
 * gelesen.
 */

export type TriageBucket = "pruefen" | "kurz_ansehen" | "durchwinker" | "uebernehmen";

export type ConfidenceLevel = "green" | "yellow" | "orange" | "red";

export type JudgeVerdict = "confirm" | "confirm_with_note" | "adjust" | "flag";

/** Was die Triage über einen Vorschlag wissen muss. */
export interface TriageInput {
  journalEntryId: string;
  /**
   * Herkunft des Satzes (`client_journal_entry.origin`). Nur `client_import`
   * ändert die Einordnung (F69) — alles andere entscheidet sich über Verdikt
   * und Konfidenz. Fehlt der Wert, gilt der Normalfall.
   */
  origin?: string | null;
  /** Letztes Judge-Verdikt, oder null = noch kein Review. */
  verdict: JudgeVerdict | null;
  /** Ampel des Satzes (gebandete Satz-Konfidenz); null = keine Aussage. */
  confidence: ConfidenceLevel | null;
  /** Satz-Summe (Soll) — teure Fehler zuerst. */
  total: number;
}

export interface TriagedProposal extends TriageInput {
  bucket: TriageBucket;
}

// Labels + Farbe der Buckets stehen in der zentralen Status-Registry
// (`ui/status`, Achse `triage`) — Domain-Layer importiert nichts aus `ui/`.

/** Schlecht → gut. Bestimmt „schlechteste Ampel" und die Sortierung. */
const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  red: 0,
  orange: 1,
  yellow: 2,
  green: 3,
};

const BUCKET_RANK: Record<TriageBucket, number> = {
  pruefen: 0,
  kurz_ansehen: 1,
  durchwinker: 2,
  // Hinter allem, was der Agent vorgeschlagen hat: ein Mandantenstapel kann
  // hunderte Sätze umfassen und würde die Arbeitsliste sonst zuschütten. Bei
  // einem Sachverhalt mit BEIDEN Herkünften gewinnt darum der Agent-Bucket.
  uebernehmen: 3,
};

/** Die schlechteste gesetzte Ampel; null, wenn keine gesetzt ist. */
export function worstConfidence(
  confidences: Array<ConfidenceLevel | null>,
): ConfidenceLevel | null {
  const set = confidences.filter((c): c is ConfidenceLevel => c != null);
  if (!set.length) return null;
  return set.reduce((worst, c) => (CONFIDENCE_RANK[c] < CONFIDENCE_RANK[worst] ? c : worst));
}

/**
 * Bucket eines Vorschlags.
 *
 * - **Prüfen** — `flag`, ODER **kein Review** (ein ungejudgter Satz ist nicht
 *   „grün", er ist ungeprüft), ODER roter Satz.
 * - **Kurz ansehen** — `adjust`, `confirm_with_note`, ODER `confirm` mit
 *   gelbem/orangem Satz.
 * - **Durchwinker** — `confirm` und grün.
 *
 * Ein `confirm` ohne Konfidenz (Hand-/Regelbuchung) ist ein Durchwinker: der
 * Judge hat hingesehen und nichts beanstandet — fehlende Ampel ist kein Verdacht.
 *
 * **Vorrang vor allem** (F69): ein importierter Mandantenstapel-Satz landet in
 * „übernehmen". Er ist kein Agent-Vorschlag — er hat systematisch kein
 * Judge-Verdikt und keine Konfidenz, und beides bedeutet hier nicht „ungeprüft",
 * sondern „der Mandant hat gebucht, die Kanzlei nimmt ab".
 */
export function triageBucket(input: TriageInput): TriageBucket {
  if (input.origin === "client_import") return "uebernehmen";
  if (input.verdict == null || input.verdict === "flag") return "pruefen";
  if (input.confidence === "red") return "pruefen";

  if (input.verdict === "adjust" || input.verdict === "confirm_with_note") return "kurz_ansehen";
  // verdict === "confirm"
  if (input.confidence === "yellow" || input.confidence === "orange") return "kurz_ansehen";
  return "durchwinker";
}

/**
 * Vorschläge in ihre Buckets einsortieren und **innerhalb** sinnvoll ordnen:
 * schlechteste Ampel zuerst, dann Satz-Summe absteigend — teure Fehler oben.
 */
export function triageProposals(inputs: TriageInput[]): TriagedProposal[] {
  return inputs
    .map((i) => ({ ...i, bucket: triageBucket(i) }))
    .sort((a, b) => {
      const byBucket = BUCKET_RANK[a.bucket] - BUCKET_RANK[b.bucket];
      if (byBucket !== 0) return byBucket;
      // Ohne Ampel = keine Aussage, nicht "gut": hinter die gesetzten Ampeln.
      const ra = a.confidence ? CONFIDENCE_RANK[a.confidence] : 4;
      const rb = b.confidence ? CONFIDENCE_RANK[b.confidence] : 4;
      if (ra !== rb) return ra - rb;
      return b.total - a.total;
    });
}

/** Zähler je Bucket — für die Gruppen-Header („Prüfen (4)"). */
export function triageCounts(triaged: Array<{ bucket: TriageBucket }>): Record<TriageBucket, number> {
  const counts: Record<TriageBucket, number> = {
    pruefen: 0,
    kurz_ansehen: 0,
    durchwinker: 0,
    uebernehmen: 0,
  };
  for (const t of triaged) counts[t.bucket] += 1;
  return counts;
}

/**
 * Bucket eines **Sachverhalts** (die Einheit der Abnahme-Liste): der
 * schlechteste Bucket seiner Vorschläge. Ein Sachverhalt ohne Vorschlag ist
 * nichts zum Durchwinken — er landet in „Prüfen".
 */
export function triageCaseBucket(proposals: TriageInput[]): TriageBucket {
  if (!proposals.length) return "pruefen";
  return proposals
    .map(triageBucket)
    .reduce((worst, b) => (BUCKET_RANK[b] < BUCKET_RANK[worst] ? b : worst));
}

/** Sortierschlüssel eines Sachverhalts innerhalb seines Buckets. */
export function caseSortKey(proposals: TriageInput[]): { confidenceRank: number; total: number } {
  const worst = worstConfidence(proposals.map((p) => p.confidence));
  return {
    confidenceRank: worst ? CONFIDENCE_RANK[worst] : 4,
    total: proposals.reduce((sum, p) => sum + p.total, 0),
  };
}
