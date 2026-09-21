/**
 * „Hinweise" auf der Startseite des Mandantenjahres (F250 T250.3) — der eine
 * Ort, an dem Hinweis-Arten dazukommen. Der Eingabetyp ist strukturell, damit
 * `clients` nicht aus `datev-export` importiert.
 */
export interface ClientYearHint {
  key: string;
  state: "error" | "warning" | "info";
  title: string;
  hint?: string;
  href: string;
}

export interface ClientYearHintCycle {
  batchId: string;
  state: string;
  stapelnummer: string | null;
  openDocumentRequests: number;
  documentRequestDueDate: string | null;
  newDocsSinceReview: number;
}

export function clientYearHints(input: {
  cycles: readonly ClientYearHintCycle[];
  stuckDocuments: number;
  today: string;
  basePath: string;
}): ClientYearHint[] {
  const { cycles, stuckDocuments, today, basePath } = input;
  const hints: ClientYearHint[] = [];

  for (const c of cycles) {
    if (c.state !== "failed") continue;
    hints.push({
      key: `export_failed:${c.batchId}`,
      state: "error",
      title: `Die Übertragung von Stapel ${c.stapelnummer ?? "ohne Nummer"} ist fehlgeschlagen.`,
      hint: "Erneut übertragen oder die Freigabe zurücknehmen.",
      href: `${basePath}/batches/${c.batchId}/review/9`,
    });
  }

  for (const c of cycles) {
    const n = c.openDocumentRequests;
    if (c.state !== "prepared" || n === 0) continue;
    if (c.documentRequestDueDate === null || c.documentRequestDueDate >= today) continue;
    hints.push({
      key: `document_requests_overdue:${c.batchId}`,
      state: "warning",
      title:
        n === 1
          ? "1 Nachforderung beim Mandanten ist überfällig."
          : `${n} Nachforderungen beim Mandanten sind überfällig.`,
      href: `${basePath}/batches/${c.batchId}`,
    });
  }

  if (stuckDocuments > 0) {
    hints.push({
      key: "stuck_documents",
      state: "warning",
      title:
        stuckDocuments === 1
          ? "1 Beleg hängt ohne Perioden- oder Extraktions-Zuordnung."
          : `${stuckDocuments} Belege hängen ohne Perioden- oder Extraktions-Zuordnung.`,
      href: `${basePath}/documents?tab=problems`,
    });
  }

  for (const c of cycles) {
    const n = c.newDocsSinceReview;
    if (c.state !== "review" || n === 0) continue;
    hints.push({
      key: `new_documents_since_review:${c.batchId}`,
      state: "info",
      title:
        n === 1
          ? "1 neuer Beleg seit Übernahme der Prüfung."
          : `${n} neue Belege seit Übernahme der Prüfung.`,
      href: `${basePath}/batches/${c.batchId}/review`,
    });
  }

  // ponytail: die Reihenfolge der Blöcke IST die Sortierung error → warning → info.
  return hints;
}
