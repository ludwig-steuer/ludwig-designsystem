/**
 * F441 — Schnitt-Entscheidung an einem Seitenübergang eines Sammel-PDFs, wie
 * sie der Classifier in `class_page_segments.boundaries` ablegt (eine je
 * Übergang). Python-Seite: `SegmentBoundaryModel` im
 * `document-simple-classifier`.
 */

export const SEGMENT_BOUNDARY_DECISIONS = ["cut", "continue"] as const;
export type SegmentBoundaryDecision = (typeof SEGMENT_BOUNDARY_DECISIONS)[number];

export interface SegmentBoundary {
  /** Linke Seite des Übergangs, 1-basiert. */
  afterPage: number;
  decision: SegmentBoundaryDecision;
  confidence: number;
  /** Regel, die entschieden hat (`same_number`, `tiebreak`, …) — offen, kein Enum-Spiegel. */
  source: string;
}

export function isSegmentBoundary(value: unknown): value is SegmentBoundary {
  if (!value || typeof value !== "object") return false;
  const b = value as Record<string, unknown>;
  return (
    typeof b.afterPage === "number" &&
    typeof b.confidence === "number" &&
    typeof b.source === "string" &&
    (SEGMENT_BOUNDARY_DECISIONS as readonly unknown[]).includes(b.decision)
  );
}
