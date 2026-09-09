/**
 * Die Mängel eines Belegs — **eine** Zone, nicht drei Kästen (L-269,
 * Detailseiten-Standard D4, Zone 2).
 *
 * Ein Mangel ist etwas, das jemand tun muss, und er unterscheidet sich damit
 * von einem leeren Feld: ein leeres Feld sieht aus wie nichts zu tun. Bis
 * 2026-09-09 zeigte die Belegseite genau einen davon (das fehlende
 * Belegdatum) und ließ die übrigen dort, wo nur der Agent sie sah.
 *
 * Die vier Quellen liegen an drei verschiedenen Stellen im Modell, und das ist
 * der Grund, warum sie hier zusammenkommen statt an der Aufrufstelle:
 *
 * | Mangel | Woher |
 * |---|---|
 * | Belegdatum fehlt | `client_source_docs.document_date` — **oder** ein Befund `missing_required_field` auf `invoice_date`; beides ist derselbe Mangel (das Datum steht in zwei Spalten) |
 * | Werte der Extraktion | `open_findings` (F18) |
 * | Gegenpart mehrdeutig | `partner_match_outcome = 'ambiguous'` |
 * | Empfänger passt nicht | `recipient_match = 'mismatch'` |
 * | Zahlungskonto fehlt | `client_source_docs.status = 'awaiting_input'` (F170) |
 *
 * `awaiting_input` stand hier bis 2026-09-10 als „bewusst nicht dabei" — es ist
 * jetzt die fünfte Zeile, mit ihrem Weg.
 *
 * **Nicht dabei:** `partner_match_outcome = 'not_found'`. Das trifft 162 der
 * 428 Rechnungszeilen auf Staging — ein Drittel des Bestands, für das es
 * heute keinen Weg hinaus gibt. Ein Mangel ohne Weg an jedem dritten Beleg ist
 * keine Hilfe, sondern Rauschen; er gehört in die Liste („Belege ohne
 * Partner"), nicht auf jede einzelne Seite.
 */

/** Der Befund, wie die Interpretation ihn ablegt — nur, was die Zone liest. */
interface OpenFindingRead {
  code: string;
  field: string | null;
  message: string;
}

export type DocDefectKind =
  | "document_date"
  | "extraction"
  | "partner"
  | "recipient"
  | "payment_account";

export interface DocDefect {
  kind: DocDefectKind;
  /** Der Code der Quelle, wo sie einen hat (`line_totals_mismatch`, …). */
  code: string | null;
  /** Das betroffene Feld, wo die Quelle eines nennt. */
  field: string | null;
  /** Was die Quelle über den Mangel sagt — Rohtext, meist englisch. */
  message: string | null;
}

export interface DocDefectFacts {
  /** Der Perioden-Anker am Supertyp. */
  documentDate: string | null;
  /** `client_source_docs.status` — `awaiting_input` wartet auf eine Angabe. */
  inboxStatus: string | null;
  openFindings: readonly OpenFindingRead[];
  partnerMatchOutcome: string | null;
  recipientMatch: string | null;
  recipientMatchReason: string | null;
  /** Fachlich erledigt — dann ist nichts mehr zu klären. */
  completedAt: string | null;
}

/** Der Befund, der dasselbe sagt wie „Belegdatum fehlt". */
function meintDasBelegdatum(f: OpenFindingRead): boolean {
  return f.code === "missing_required_field" && f.field === "invoice_date";
}

/**
 * Die Mängel in der Reihenfolge, in der sie jemanden aufhalten: ohne
 * Belegdatum fällt der Beleg aus jeder Jahresliste, ohne vollständige Werte
 * lässt er sich nicht buchen, und die beiden Fragen nach dem Gegenüber
 * entscheiden nur noch, gegen wen.
 */
export function docDefects(facts: DocDefectFacts): DocDefect[] {
  if (facts.completedAt) return [];
  const defects: DocDefect[] = [];

  const datumsBefund = facts.openFindings.find(meintDasBelegdatum) ?? null;
  if (!facts.documentDate || datumsBefund) {
    defects.push({
      kind: "document_date",
      code: datumsBefund?.code ?? null,
      field: "documentDate",
      message: datumsBefund?.message ?? null,
    });
  }

  for (const finding of facts.openFindings) {
    if (meintDasBelegdatum(finding)) continue;
    defects.push({
      kind: "extraction",
      code: finding.code,
      field: finding.field,
      message: finding.message,
    });
  }

  if (facts.partnerMatchOutcome === "ambiguous") {
    defects.push({ kind: "partner", code: null, field: null, message: null });
  }
  // F170: der erkannte Kontoauszug wartet auf sein Bankkonto. Ohne das Konto
  // wird nichts verarbeitet — und bis heute gab es den Weg nur im Eingang, nicht
  // am Beleg (L-268, `bank-offen` P1).
  if (facts.inboxStatus === "awaiting_input") {
    defects.push({ kind: "payment_account", code: null, field: null, message: null });
  }
  if (facts.recipientMatch === "mismatch") {
    defects.push({
      kind: "recipient",
      code: null,
      field: null,
      message: facts.recipientMatchReason,
    });
  }
  return defects;
}
