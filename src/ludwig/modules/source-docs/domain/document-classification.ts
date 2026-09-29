/**
 * F309 — das Einordnungsbild eines Belegs: was ist es, wie wirkt es, wozu
 * gehört es (Brief F308, DS 0205). Eine reine Ableitung aus dem, was Liste und
 * Seite ohnehin laden — ein View-Model für Zelle, Box und Dialog
 * (`ClassificationCell`/`ClassificationBox`/`ClassificationDialog`).
 *
 * Abgeleitet, nie gespeichert; Bauart wie das Prozessbild (`document-process.ts`).
 * Wörter kommen aus den Label-Tabellen und der Status-Registry; die Bausteine
 * rechnen nichts.
 */
import type {
  ClassificationCorrection,
  ClassificationDialogDetail,
  ClassificationPicture,
  ClassificationSection,
} from "@ludwig/designsystem";

import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { DOCUMENT_FORM_LABEL } from "./document-form-labels";
import {
  DOC_CATEGORIES,
  DOC_DIRECTIONS,
  DOCUMENT_FORM_VALUES,
  docCategoryForForm,
  routeDocumentForm,
  type DocCategory,
  type DocDirection,
} from "./document-form-mapping";
import { sourceDocTypeLabel } from "./source-doc-type";
import { formatPageRanges, parsePageRange } from "./source-document-vm";
import type { SourceDocDoneVia } from "./source-doc-status";

export interface DocumentClassificationFacts {
  sourceDocType: string | null;
  classDocumentForm: string | null;
  docCategory: DocCategory | null;
  /** `client_source_docs_invoices.document_kind` */
  documentKind: string | null;
  /** `client_source_docs_invoices.doc_direction` */
  docDirection: DocDirection | null;
  classSummary: string | null;
  classConfidence: number | null;
  classifiedAt: string | null;
  classOverriddenAt: string | null;
  classificationError: string | null;
  collectionKind: string | null;
  doneVia: SourceDocDoneVia | null;
  parent: { sourceDocId: string; collectionKind: string | null } | null;
  /** Position unter den Geschwistern (1-basiert) und deren Zahl; null ohne Eltern. */
  bundlePosition: { index: number; total: number } | null;
  splitPageRange: string | null;
  childCount: number;
}

/** Die Spalten sind `text` — nur ein Wert der Achse wird Kategorie bzw. Richtung. */
export const asDocCategory = (v: string | null | undefined): DocCategory | null =>
  (DOC_CATEGORIES as readonly string[]).includes(v ?? "") ? (v as DocCategory) : null;
export const asDocDirection = (v: string | null | undefined): DocDirection | null =>
  (DOC_DIRECTIONS as readonly string[]).includes(v ?? "") ? (v as DocDirection) : null;

export interface ClassificationLinks {
  self: string;
  parent: string | null;
}

/** Charakter × Richtung → ein Wort (Tabelle F309 T309.1). `internal` sticht alles. */
type Character = "original" | "credit_note" | "self_billing" | "refund";
const CHARACTERS: readonly Character[] = ["original", "credit_note", "self_billing", "refund"];

const EFFECT: Record<Character, { inbound: string; outbound: string; none: string | null }> = {
  original: { inbound: "Eingangsrechnung", outbound: "Ausgangsrechnung", none: null },
  credit_note: { inbound: "Storno erhalten", outbound: "Storno erteilt", none: "Stornogutschrift" },
  self_billing: {
    inbound: "Gutschrift vom Kunden (§14)",
    outbound: "Eigene Gutschrift (§14)",
    none: "§14-UStG-Gutschrift",
  },
  refund: { inbound: "Erstattung erhalten", outbound: "Erstattung erteilt", none: "Erstattung" },
};

/** `unknown`, NULL und ein unbekannter String zählen wie `original` — kein Throw. */
function character(kind: string | null): Character {
  return (CHARACTERS as readonly string[]).includes(kind ?? "") ? (kind as Character) : "original";
}

function effectWord(c: Character, direction: DocDirection | null): string | null {
  if (direction === "internal") return "Interner Vorgang";
  return direction ? EFFECT[c][direction] : EFFECT[c].none;
}

/** Trägt der Beleg einen eigenen Charakter (nicht Normalfall, nicht offen)? */
function hasOwnCharacter(kind: string | null): boolean {
  return kind !== null && kind !== "original" && kind !== "unknown";
}

const COVER_KINDS: ReadonlySet<string> = new Set([
  "expense_report",
  "credit_card_statement",
  "cash_register_report",
  "payment_gateway_payout",
  "vendor_collective_invoice",
  "document_with_annexes",
]);

const NO_CATEGORY_WHY =
  "Ohne Kategorie: ein Sammel-PDF, ein sonstiges Dokument oder noch nicht eingeordnet — der Folgeprozess entsteht erst je Teilbeleg.";

const BUNDLE_WHY: Record<Exclude<NonNullable<ClassificationPicture["bundle"]>["role"], "cover">, string> = {
  part: "Aus einem Sammel-PDF herausgetrennt; das Original bleibt als Spur.",
  attachment: "Anlage zu einem anderen Beleg — bucht nicht selbst.",
  bundle: "Ein Sammel-PDF ohne inneren Zusammenhang; jeder Teil läuft für sich.",
  superseded: "Zerlegt und durch seine Teile ersetzt.",
};

/** Das Wort der Form; ein unbekannter Schlüssel bleibt Rohwort (nicht `formatDocumentForm`). */
function formWord(form: string): string {
  return DOCUMENT_FORM_LABEL[form] ?? form;
}

function identityWord(f: DocumentClassificationFacts): string {
  return f.classDocumentForm ? formWord(f.classDocumentForm) : sourceDocTypeLabel(f.sourceDocType, null);
}

function identityWarning(f: DocumentClassificationFacts, word: string): string | undefined {
  if (f.classificationError) return `Ludwig konnte den Beleg nicht einordnen: ${f.classificationError}`;
  if (f.classDocumentForm === "unknown") return "Ludwig konnte den Beleg nicht einordnen.";
  if (f.docDirection !== null && f.classDocumentForm !== null && !routeDocumentForm(f.classDocumentForm).invoiceFlow) {
    return `Widerspruch: ${word} mit Rechnungszeile — Einordnung prüfen.`;
  }
  return undefined;
}

function effect(f: DocumentClassificationFacts): ClassificationPicture["effect"] {
  if (f.docDirection === null && !hasOwnCharacter(f.documentKind)) return undefined;
  const word = effectWord(character(f.documentKind), f.docDirection);
  return word ? { word } : undefined;
}

function bundle(f: DocumentClassificationFacts, links: ClassificationLinks): ClassificationPicture["bundle"] {
  const parts = `${links.self}#parts`;
  if (f.doneVia === "superseded") {
    return { role: "superseded", word: f.childCount > 0 ? `zerlegt in ${f.childCount} Teile` : "zerlegt", href: parts };
  }
  if (f.parent) {
    const href = links.parent ?? undefined;
    if (f.parent.collectionKind === "document_with_annexes") return { role: "attachment", word: "Anlage", href };
    const position = f.bundlePosition ? `Teil ${f.bundlePosition.index} von ${f.bundlePosition.total}` : "Teil";
    const range = parsePageRange(f.splitPageRange);
    return { role: "part", word: range ? `${position} · ${formatPageRanges([range])}` : position, href };
  }
  if (f.childCount > 0 && f.collectionKind && COVER_KINDS.has(f.collectionKind)) {
    const label = resolveStatus("collection_kind", f.collectionKind).label;
    return { role: "cover", word: `${label} · ${f.childCount} Belege`, href: parts };
  }
  if (f.childCount > 0) return { role: "bundle", word: `Sammel-PDF · ${f.childCount} Teile`, href: parts };
  return undefined;
}

export function documentClassificationPicture(
  f: DocumentClassificationFacts,
  links: ClassificationLinks,
): ClassificationPicture {
  const word = identityWord(f);
  const warning = identityWarning(f, word);
  const eff = effect(f);
  const bun = bundle(f, links);
  return {
    identity: { category: f.docCategory ?? "none", word, ...(warning ? { warning } : {}) },
    ...(eff ? { effect: eff } : {}),
    ...(bun ? { bundle: bun } : {}),
    ...(f.classOverriddenAt ? { corrected: { at: f.classOverriddenAt, by: null } } : {}),
  };
}

const dash = (v: string | number | null | undefined) => (v === null || v === undefined || v === "" ? "—" : String(v));

export function documentClassificationDetail(
  f: DocumentClassificationFacts,
  ctx: { title: string; links: ClassificationLinks; correction: ClassificationCorrection | null },
): ClassificationDialogDetail {
  const picture = documentClassificationPicture(f, ctx.links);
  const ownCategory = docCategoryForForm(f.classDocumentForm);
  const sections: ClassificationSection[] = [
    {
      key: "identity",
      why: f.docCategory ? (resolveStatus("document_category", f.docCategory).description ?? "") : NO_CATEGORY_WHY,
      ...(f.classSummary ? { quote: f.classSummary } : {}),
      alternatives: DOCUMENT_FORM_VALUES.filter(
        (v) => v !== f.classDocumentForm && docCategoryForForm(v) === ownCategory,
      ).map((v) => ({ value: v, label: formWord(v) })),
    },
  ];
  if (picture.effect) {
    const own = character(f.documentKind);
    sections.push({
      key: "effect",
      why: [
        f.docDirection ? resolveStatus("document_direction", f.docDirection).description : null,
        hasOwnCharacter(f.documentKind) ? resolveStatus("document_character", f.documentKind).description : null,
      ]
        .filter(Boolean)
        .join(" "),
      alternatives: CHARACTERS.filter((c) => c !== own).flatMap((c) => {
        const label = effectWord(c, f.docDirection);
        return label ? [{ value: c, label }] : [];
      }),
    });
  }
  if (picture.bundle) {
    const role = picture.bundle.role;
    sections.push({
      key: "bundle",
      why:
        role === "cover"
          ? (resolveStatus("collection_kind", f.collectionKind).description ?? "")
          : BUNDLE_WHY[role],
      alternatives: [],
    });
  }
  return {
    title: ctx.title,
    sections,
    ...(ctx.correction ? { correction: ctx.correction } : {}),
    technical: [
      { label: "class_document_form", value: dash(f.classDocumentForm) },
      { label: "doc_category", value: dash(f.docCategory) },
      { label: "source_doc_type", value: dash(f.sourceDocType) },
      { label: "document_kind", value: dash(f.documentKind) },
      { label: "doc_direction", value: dash(f.docDirection) },
      { label: "collection_kind", value: dash(f.collectionKind) },
      { label: "class_confidence", value: f.classConfidence === null ? "—" : f.classConfidence.toFixed(2) },
      { label: "classified_at", value: dash(f.classifiedAt) },
      { label: "class_overridden_at", value: dash(f.classOverriddenAt) },
      { label: "classification_error", value: dash(f.classificationError) },
      { label: "parent_source_doc_id", value: dash(f.parent?.sourceDocId) },
      { label: "split_page_range", value: dash(f.splitPageRange) },
    ],
  };
}
