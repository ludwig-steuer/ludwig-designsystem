/**
 * F349 — die Verweiszeile zwischen Generalumkehr und Original, rein (kein IO):
 * Abnahme und Sachverhalt-Seite sagen damit, welcher Satz welchen aufhebt.
 * Darf von Client-Komponenten importiert werden (wie `pruefpunkte.ts`).
 */

/** Das aufgehobene Original, gesehen vom Umkehrsatz. */
export interface ReversedOriginal {
  source: "journal_entry" | "datev_mirror";
  /** ISO YYYY-MM-DD. */
  bookingDate: string | null;
  /** journal_entry: Stapel des Originals. */
  stapelnummer: string | null;
  /** journal_entry: gesetzt = steht in DATEV. */
  exportedAt: string | null;
  /** Belegfeld 1 (journal_entry: erste Zeile mit Wert; mirror: external_document_number). */
  documentNumber: string | null;
  /** Nur mirror. */
  description: string | null;
}

export interface ReversingEntry {
  journalEntryId: string;
  status: "proposed" | "accepted" | "posted";
  /** Sachverhalt der Umkehr. */
  caseNumber: string | null;
}

/** Die lebende Umkehr, gesehen vom Original. */
export interface ReversedEntryInfo {
  reversal: ReversingEntry;
  /** Stapel des Originals selbst. */
  stapelnummer: string | null;
  exportedAt: string | null;
}

export interface EntryReversalRef {
  /** Am Umkehrsatz. */
  reverses: ReversedOriginal | null;
  /** Am Original. */
  reversedBy: ReversedEntryInfo | null;
}

export interface ReversalDisplay {
  role: "reversal" | "reversed";
  note: string;
  /** Nur role "reversed". */
  badge: string | null;
}

/** `2026-08-19` → `19.08.2026`, ohne `Date` (keine Zeitzone im Spiel). */
function datum(iso: string | null): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split("-");
  return y && m && d ? `${d}.${m}.${y}` : null;
}

function reversalNote(o: ReversedOriginal, reason: string | null): string {
  const vom = datum(o.bookingDate);
  const grund = reason ? ` Grund: ${reason}` : "";
  if (o.source === "datev_mirror") {
    return (
      `Hebt die DATEV-Buchung ${vom ? `vom ${vom} ` : ""}auf` +
      (o.documentNumber ? ` — Belegfeld ${o.documentNumber}` : "") +
      (o.description ? ` („${o.description}“)` : "") +
      "." +
      grund
    );
  }
  return (
    `Hebt die Buchung ${vom ? `vom ${vom} ` : ""}auf` +
    (o.stapelnummer ? ` — Stapel ${o.stapelnummer}` : "") +
    (o.exportedAt ? ", steht bereits in DATEV." : ".") +
    grund
  );
}

function reversedNote(r: ReversedEntryInfo, position: number | null, currentCaseNumber: string | null): string {
  const inDatev = r.exportedAt ? `Steht in DATEV${r.stapelnummer ? ` (Stapel ${r.stapelnummer})` : ""}. ` : "";
  const caseNumber = r.reversal.caseNumber;
  const wer =
    position !== null
      ? `Satz ${position} hebt ihn per Generalumkehr auf.`
      : caseNumber && caseNumber !== currentCaseNumber
        ? `Die Generalumkehr in Sachverhalt ${caseNumber} hebt ihn auf.`
        : "Die Generalumkehr in diesem Sachverhalt hebt ihn auf.";
  return inDatev + wer;
}

/**
 * Verweiszeile und Badge eines Satzes — `null`, wenn er weder Umkehr noch
 * aufgehobenes Original ist. `reverses` hat Vorrang; beides zugleich gibt es
 * nicht (F263 lehnt die Umkehr einer Umkehr ab).
 */
export function reversalDisplay(
  ref: EntryReversalRef | undefined,
  ctx: { isReversal: boolean; reason: string | null; position: number | null; currentCaseNumber: string | null },
): ReversalDisplay | null {
  if (ref?.reverses) return { role: "reversal", note: reversalNote(ref.reverses, ctx.reason), badge: null };
  if (ctx.isReversal) {
    return { role: "reversal", note: "Hebt eine Buchung auf — das Original ist nicht auffindbar.", badge: null };
  }
  if (ref?.reversedBy) {
    return {
      role: "reversed",
      note: reversedNote(ref.reversedBy, ctx.position, ctx.currentCaseNumber),
      badge: ref.reversedBy.reversal.status === "proposed" ? "Wird aufgehoben" : "Aufgehoben",
    };
  }
  return null;
}
