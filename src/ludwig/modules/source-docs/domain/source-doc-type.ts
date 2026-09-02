/**
 * Anzeige-Labels je ``source_doc_type`` (Diskriminator auf
 * ``client_source_docs``).
 *
 * "Beleg" ist der generische Oberbegriff; ``invoice`` ist nur EINE
 * Ausprägung — siehe GLOSSARY „Source document supertype &
 * specializations". Dies ist der Keim einer Renderer-Registry: eine neue
 * Belegart bekommt hier einen Eintrag, statt dass UI-Code Sonderpfade
 * pro Typ erfindet. Werte-Achse identisch zum DB-Check-Constraint auf
 * ``client_source_docs.source_doc_type``.
 */
import { DOCUMENT_FORM_LABEL } from "./document-form-labels";

export const SOURCE_DOC_TYPE_LABELS: Record<string, string> = {
  invoice: "Rechnung",
  contract: "Vertrag",
  bank_statement_pdf: "Kontoauszug",
  credit_card_statement: "Kreditkartenabrechnung",
  travel_expense_report: "Reisekostenabrechnung",
  declaration: "Erklärung",
  other: "Sonstiger Beleg",
};

/**
 * Deutsches Label für einen ``source_doc_type``. Fällt für ``null`` /
 * unbekannte Werte auf den generischen Oberbegriff „Beleg" zurück — nie
 * auf „Rechnung", damit Nicht-Rechnungs-Belege nicht fälschlich als
 * Rechnung beschriftet werden.
 *
 * Optional ``classDocumentForm``: trägt der Beleg nur den generischen Typ
 * ``other``/NULL, aber eine spezifische Belegform (z. B.
 * ``document_collection`` → „Sammel-PDF", ``payroll_slip`` →
 * „Lohnabrechnung"), gewinnt das Form-Label — sonst hieße alles, was
 * bewusst auf ``other`` routet, pauschal „Sonstiger Beleg".
 */
export function sourceDocTypeLabel(
  type: string | null | undefined,
  classDocumentForm?: string | null,
): string {
  const generic = !type || type === "other";
  if (generic && classDocumentForm && !["other", "unknown"].includes(classDocumentForm)) {
    const formLabel = DOCUMENT_FORM_LABEL[classDocumentForm];
    if (formLabel) return formLabel;
  }
  if (!type) return "Beleg";
  return SOURCE_DOC_TYPE_LABELS[type] ?? "Beleg";
}
