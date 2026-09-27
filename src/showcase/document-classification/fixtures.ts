import type { DocCategoryKey } from "@/ui/v3/Icons";
import type {
  ClassificationCorrection,
  ClassificationDialogDetail,
  ClassificationPicture,
  ClassificationSection,
} from "@/ui/v3/entities/source-document/Classification";

/**
 * The 20 scenarios of brief F308 §7, with the staging frequency as `n`.
 * Invented documents; the words are those the app will derive (F308 §2).
 */

export interface ClassificationScenario {
  id: string;
  name: string;
  /** How often this case occurs on staging (2026-09-27), as the brief counts it. */
  n: string;
  title: string;
  picture: ClassificationPicture;
  detail: ClassificationDialogDetail;
}

const FORMS: ClassificationCorrection["forms"] = [
  { value: "invoice", label: "Rechnung", category: "performance" },
  { value: "fuel_receipt", label: "Tankquittung", category: "performance" },
  { value: "hospitality_receipt", label: "Bewirtungsbeleg", category: "performance" },
  { value: "cash_receipt", label: "Kassenbon", category: "performance" },
  { value: "delivery_note", label: "Lieferschein", category: "performance" },
  { value: "dunning", label: "Mahnung", category: "performance" },
  { value: "bank_statement", label: "Kontoauszug", category: "payment" },
  { value: "credit_card_statement", label: "Kreditkartenabrechnung", category: "payment" },
  { value: "cash_closing", label: "Kassenabschluss", category: "payment" },
  { value: "contract", label: "Vertrag", category: "foundation" },
  { value: "tax_assessment", label: "Steuerbescheid", category: "foundation" },
  { value: "tax_return", label: "Steuererklärung", category: "foundation" },
  { value: "payroll", label: "Lohnabrechnung", category: "internal" },
  { value: "travel_expenses", label: "Reisekosten", category: "internal" },
  { value: "report", label: "Auswertung", category: "report" },
  { value: "document_collection", label: "Sammel-PDF", category: "none" },
  { value: "other", label: "Sonstiges", category: "none" },
];

const DIRECTIONS = [
  { value: "inbound", label: "Eingang (wir haben erhalten)" },
  { value: "outbound", label: "Ausgang (wir haben ausgestellt)" },
];

const SIBLINGS: Record<DocCategoryKey, string[]> = {
  performance: ["Rechnung", "Tankquittung", "Bewirtungsbeleg", "Kassenbon", "Lieferschein", "Mahnung"],
  payment: ["Kontoauszug", "Kreditkartenabrechnung", "Kassenabschluss"],
  foundation: ["Vertrag", "Steuerbescheid", "Steuererklärung"],
  internal: ["Lohnabrechnung", "Reisekosten"],
  report: ["Auswertung"],
  none: ["Sammel-PDF", "Sonstiges"],
};

const EFFECT_WHY: Record<string, string> = {
  Eingangsrechnung: "Wir haben die Rechnung erhalten, und sie ist eine gewöhnliche Rechnung — sie wird als Aufwand oder Anschaffung gebucht.",
  Ausgangsrechnung: "Der Mandant hat die Rechnung ausgestellt — sie wird als Erlös gebucht.",
  "Storno erhalten": "Der Lieferant nimmt eine frühere Rechnung ganz oder teilweise zurück; der Betrag mindert den Aufwand.",
  "Gutschrift vom Kunden (§14)": "Der Kunde rechnet über die Leistung des Mandanten ab (Gutschrift nach § 14 UStG) — sie wirkt wie eine Ausgangsrechnung.",
  "Erstattung erhalten": "Geld kommt zurück, ohne dass eine Rechnung storniert wird.",
};

function sections(p: ClassificationPicture, quote?: string): ClassificationSection[] {
  const out: ClassificationSection[] = [
    {
      key: "identity",
      why: `Ludwig hat den Beleg als ${p.identity.word} gelesen; das ordnet ihn als ${CATEGORY_LABEL[p.identity.category]} ein.`,
      ...(quote ? { quote } : {}),
      alternatives: SIBLINGS[p.identity.category].filter((w) => w !== p.identity.word).map((label) => ({ value: label, label })),
    },
  ];
  if (p.effect) {
    out.push({
      key: "effect",
      why: EFFECT_WHY[p.effect.word] ?? "Richtung und Art der Rechnung ergeben zusammen diese Wirkung.",
      alternatives: Object.keys(EFFECT_WHY)
        .filter((w) => w !== p.effect!.word)
        .map((label) => ({ value: label, label })),
    });
  }
  if (p.bundle) {
    out.push({
      key: "bundle",
      why: BUNDLE_WHY[p.bundle.role],
      alternatives: [],
    });
  }
  return out;
}

const CATEGORY_LABEL: Record<DocCategoryKey, string> = {
  performance: "Leistungsbeleg",
  payment: "Zahlungsbeleg",
  foundation: "Nachweisbeleg",
  internal: "Internen Beleg",
  report: "Auswertung",
  none: "Beleg ohne Kategorie",
};

const BUNDLE_WHY: Record<NonNullable<ClassificationPicture["bundle"]>["role"], string> = {
  part: "Der Beleg ist aus einem Sammel-PDF herausgelöst worden; die übrigen Teile stehen am Sammeldokument.",
  cover: "Der Beleg fasst andere Belege zusammen — die Einzelbelege hängen an ihm.",
  bundle: "Mehrere Belege kamen in einer Datei; Ludwig hat sie getrennt.",
  superseded: "Die Datei ist in einzelne Belege zerlegt; sie selbst wird nicht gebucht.",
  attachment: "Der Beleg ist eine Anlage zu einem anderen Beleg.",
};

interface Spec {
  id: string;
  name: string;
  n: string;
  title: string;
  category: DocCategoryKey;
  word: string;
  formKey: string;
  effect?: string;
  direction?: string | null;
  bundle?: ClassificationPicture["bundle"];
  warning?: string;
  corrected?: ClassificationPicture["corrected"];
  quote?: string;
  blocked?: string;
  character?: string;
  subtype?: string;
  error?: string;
}

function build(s: Spec): ClassificationScenario {
  const picture: ClassificationPicture = {
    identity: {
      category: s.category,
      word: s.word,
      ...(s.warning ? { warning: s.warning } : {}),
    },
    ...(s.effect ? { effect: { word: s.effect } } : {}),
    ...(s.bundle ? { bundle: s.bundle } : {}),
    ...(s.corrected ? { corrected: s.corrected } : {}),
  };
  return {
    id: s.id,
    name: s.name,
    n: s.n,
    title: s.title,
    picture,
    detail: {
      title: s.title,
      sections: sections(picture, s.quote),
      correction: {
        forms: FORMS,
        directions: DIRECTIONS,
        current: { form: s.formKey, direction: s.direction ?? null },
        ...(s.blocked ? { blockedReason: s.blocked } : {}),
        onSave: () => new Promise((resolve) => setTimeout(resolve, 900)),
      },
      technical: [
        { label: "class_document_form", value: s.formKey },
        { label: "doc_category", value: s.category === "none" ? "NULL" : s.category },
        { label: "source_doc_type", value: s.subtype ?? "invoice" },
        { label: "doc_direction", value: s.direction ?? "NULL" },
        { label: "document_character", value: s.character ?? "NULL" },
        { label: "class_confidence", value: "0,94" },
        { label: "classified_at", value: "12.09.2026 09:15" },
        { label: "class_overridden_at", value: s.corrected ? `${s.corrected.at} · ${s.corrected.by ?? "—"}` : "—" },
        { label: "classification_error", value: s.error ?? "—" },
      ],
    },
  };
}

const INVOICE_QUOTE = "Eingangsrechnung der Musterbau Schneider GmbH & Co. KG über Bauleistungen August 2026.";

export const CLASSIFICATION_SCENARIOS: ClassificationScenario[] = [
  build({ id: "1", name: "Normale Eingangsrechnung", n: "406", title: "RE-2026-0815 · Musterbau Schneider GmbH & Co. KG", category: "performance", word: "Rechnung", formKey: "invoice", effect: "Eingangsrechnung", direction: "inbound", character: "original", quote: INVOICE_QUOTE }),
  build({ id: "2", name: "Ausgangsrechnung", n: "161", title: "AR-2026-0112 · an Holzhandel Weber", category: "performance", word: "Rechnung", formKey: "invoice", effect: "Ausgangsrechnung", direction: "outbound", character: "original" }),
  build({ id: "3", name: "Storno vom Lieferanten", n: "35", title: "GS-4471 · Büro Schmidt KG", category: "performance", word: "Rechnung", formKey: "invoice", effect: "Storno erhalten", direction: "inbound", character: "credit_note" }),
  build({ id: "4", name: "§14-Gutschrift vom Kunden", n: "32", title: "Gutschrift 2026-08 · Autohaus Nord", category: "performance", word: "Rechnung", formKey: "invoice", effect: "Gutschrift vom Kunden (§14)", direction: "inbound", character: "self_billing" }),
  build({ id: "5", name: "Erstattung", n: "20", title: "Erstattung Kaution · Hausverwaltung Meier", category: "performance", word: "Rechnung", formKey: "invoice", effect: "Erstattung erhalten", direction: "inbound", character: "refund" }),
  build({ id: "6", name: "Tankquittung", n: "5", title: "Aral Station Hauptstraße · 12.08.2026", category: "performance", word: "Tankquittung", formKey: "fuel_receipt", effect: "Eingangsrechnung", direction: "inbound", subtype: "receipt" }),
  build({ id: "7", name: "Kreditkartenabrechnung als Deckblatt", n: "(P28)", title: "Kreditkartenabrechnung 08/2026 · Visa Business", category: "payment", word: "Kreditkartenabrechnung", formKey: "credit_card_statement", bundle: { role: "cover", word: "Deckblatt · 9 Belege", href: "#children" }, subtype: "credit_card_statement" }),
  build({ id: "8", name: "Teilbeleg aus Sammel-PDF", n: "99", title: "Tankbeleg 4 · Shell Autobahn A7", category: "performance", word: "Rechnung", formKey: "invoice", effect: "Eingangsrechnung", direction: "inbound", bundle: { role: "part", word: "Teil 3 von 9 · Seiten 4–5", href: "#parent" } }),
  build({ id: "9", name: "Sammel-PDF, zerlegt", n: "26", title: "Scan_Tankbelege_August.pdf", category: "none", word: "Sammel-PDF", formKey: "document_collection", bundle: { role: "superseded", word: "zerlegt in 5 Teile", href: "#children" }, subtype: "collection" }),
  build({ id: "10", name: "Kontoauszug", n: "26", title: "Kontoauszug 08/2026 · Sparkasse Musterstadt", category: "payment", word: "Kontoauszug", formKey: "bank_statement", blocked: "Die Umsätze dieses Auszugs sind schon eingelesen. Eine andere Einordnung würde sie verwaisen lassen — bitte den Import zuerst zurücknehmen.", subtype: "bank_statement" }),
  build({ id: "11", name: "Vertrag", n: "4", title: "Mietvertrag Lagerhalle Industriestraße 12", category: "foundation", word: "Vertrag", formKey: "contract", subtype: "contract" }),
  build({ id: "12", name: "Steuerbescheid", n: "9", title: "Bescheid über Umsatzsteuer 2025", category: "foundation", word: "Steuerbescheid", formKey: "tax_assessment", subtype: "tax_assessment" }),
  build({ id: "13", name: "Auswertung (kein Beleg)", n: "8", title: "SuSa 08/2026", category: "report", word: "Auswertung", formKey: "report", subtype: "report" }),
  build({ id: "14", name: "Reisekosten", n: "6", title: "Reisekostenabrechnung M. Muster · Messe Köln", category: "internal", word: "Reisekosten", formKey: "travel_expenses", subtype: "travel_expenses" }),
  build({ id: "15", name: "Unbekannt / Fehler", n: "10", title: "Scan_20260912_0931.pdf", category: "none", word: "Unbekannt", formKey: "unknown", warning: "Ludwig konnte den Beleg nicht einordnen: Die Datei enthält nur ein Foto ohne lesbaren Text.", error: "ocr_empty", subtype: "unknown" }),
  build({ id: "16", name: "Sonstiges ohne Kategorie", n: "36", title: "Schreiben der Berufsgenossenschaft", category: "none", word: "Sonstiges", formKey: "other", subtype: "other" }),
  build({ id: "17", name: "Rechnung ohne Kategorie (Altbestand)", n: "153", title: "RE-2025-1102 · Büro Schmidt KG", category: "none", word: "Rechnung", formKey: "invoice", effect: "Eingangsrechnung", direction: "inbound" }),
  build({ id: "18", name: "Korrigiert vom Menschen", n: "44", title: "RE-2026-0901 · an Musterbau Schneider", category: "performance", word: "Rechnung", formKey: "invoice", effect: "Ausgangsrechnung", direction: "outbound", corrected: { at: "14.09.2026", by: "M. Muster" } }),
  build({ id: "19", name: "Kommende Form, Label unbekannt", n: "0", title: "PayPal-Abrechnung 08/2026", category: "payment", word: "psp_settlement", formKey: "psp_settlement", subtype: "psp_settlement" }),
  build({ id: "20", name: "Drift: Steuerbescheid mit Rechnungszeile", n: "3", title: "Bescheid Grundsteuer 2026", category: "foundation", word: "Steuerbescheid", formKey: "tax_assessment", effect: "Eingangsrechnung", direction: "inbound", warning: "Die Einordnung widerspricht sich: ein Steuerbescheid mit Rechnungsdaten. Bitte prüfen Sie die Belegform.", subtype: "invoice" }),
];

export const byNumber = (id: string) => CLASSIFICATION_SCENARIOS.find((s) => s.id === id)!;
