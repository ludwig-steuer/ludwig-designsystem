/**
 * Gruppentyp einer Dokumentgruppe (`client_source_docs.collection_kind`) — F104.
 *
 * Eine **Dokumentgruppe** ist ein Sammeldokument (Parent) und die daraus
 * geschnittenen Einzeldokumente, die zusammen *einen* fachlichen Vorgang
 * bilden. Keine eigene Tabelle: die Gruppe *ist* `parent_source_doc_id`. Neu
 * ist ihr **Typ**, und der ist keine Beschriftung, sondern sagt, was die
 * Einzelbelege zusammenhält — daraus folgt das Buchungsverfahren.
 *
 * Deshalb zwei Achsen: der sichtbare Typ (LLM-klassifiziert, im UI
 * korrigierbar) und die daraus abgeleitete **Klammer-Familie**
 * ({@link collectionFamily}) — Code-Logik, nicht separat gepflegt.
 *
 * Spiegel des DB-CHECK `client_source_docs_collection_kind_check`
 * (Migration 20260828130000). Python-Seite: `CollectionKind` im
 * `document-simple-classifier`.
 */

export const COLLECTION_KINDS = [
  "expense_report",
  "credit_card_statement",
  "cash_register_report",
  "payment_gateway_payout",
  "vendor_collective_invoice",
  "document_with_annexes",
  "not_connected",
] as const;
export type CollectionKind = (typeof COLLECTION_KINDS)[number];

/**
 * Was die Gruppe zusammenhält:
 *
 * - `clearing` — jeder Einzelbeleg wird gegen **ein** Verrechnungskonto
 *   gebucht, die Gegenbewegung (Erstattung, Kartenlastschrift) läuft über
 *   dasselbe Konto. Der Deckteil bucht nicht, er verprobt. Zielsaldo je
 *   Abrechnung: null.
 * - `partner` — Klammer ist das Kreditorenkonto; je Einzelrechnung eine
 *   Buchung, die eine Sammelzahlung wird gesplittet.
 * - `annex` — die Kinder sind Nachweis, kein Beleg (Lieferschein, AGB). Genau
 *   ein Kind wird gebucht, der Rest ist `no_booking_required`.
 * - `none` — der einzige Fall ohne Verfahren: jedes Kind ist ein eigener
 *   Vorgang wie ein einzeln hochgeladener Beleg.
 */
export type CollectionFamily = "clearing" | "partner" | "annex" | "none";

const FAMILY_BY_KIND: Record<CollectionKind, CollectionFamily> = {
  expense_report: "clearing",
  credit_card_statement: "clearing",
  cash_register_report: "clearing",
  payment_gateway_payout: "clearing",
  vendor_collective_invoice: "partner",
  document_with_annexes: "annex",
  not_connected: "none",
};

/**
 * Gruppentypen, deren Sonderverfahren noch nicht gebaut ist. Sie verhalten
 * sich wie `not_connected` — aber **mit sichtbarem Hinweis**, nicht
 * stillschweigend (R-C). Sobald ein Verfahren steht, fliegt der Wert hier raus;
 * die Liste ist der ehrliche Rest, nicht eine dauerhafte Einrichtung.
 */
export const COLLECTION_KINDS_WITHOUT_PROCEDURE: readonly CollectionKind[] = [
  "cash_register_report",
  "payment_gateway_payout",
  "vendor_collective_invoice",
];

/** Klammer-Familie eines Gruppentyps. NULL/unbekannt → `none`. */
export function collectionFamily(kind: string | null | undefined): CollectionFamily {
  if (!kind || !isCollectionKind(kind)) return "none";
  if (COLLECTION_KINDS_WITHOUT_PROCEDURE.includes(kind)) return "none";
  return FAMILY_BY_KIND[kind];
}

/**
 * Die Familie **ohne** den MVP-Vorbehalt — was der Typ fachlich bedeutet, auch
 * wenn sein Verfahren noch fehlt. Für Anzeige und Hinweistexte; die
 * Buchungslogik fragt {@link collectionFamily}.
 */
export function intendedCollectionFamily(kind: string | null | undefined): CollectionFamily {
  if (!kind || !isCollectionKind(kind)) return "none";
  return FAMILY_BY_KIND[kind];
}

/**
 * Verrechnungskonto-Kategorie, die zu einer `clearing`-Gruppe gehört (§5.1a
 * Stufe 1). Der Server filtert damit die Konten der Person; genau ein Treffer
 * heißt „der Server schreibt", mehrere heißen „der Agent wählt".
 */
export const CLEARING_TYPE_BY_COLLECTION_KIND: Partial<Record<CollectionKind, string>> = {
  expense_report: "employee_expense",
  credit_card_statement: "credit_card",
  payment_gateway_payout: "payment_gateway",
  cash_register_report: "money_transit",
};

/**
 * Sachverhaltstyp, der aus dem Gruppentyp folgt (R-J). Der Server setzt ihn;
 * eine abweichende Agenten-Angabe wird überschrieben, nicht zurückgewiesen —
 * was aus persistierten Daten ableitbar ist, wird nicht zur Option.
 *
 * `null` heißt „der Agent wählt weiter": bei `document_with_annexes` bestimmt
 * der Hauptbeleg die Art, bei `not_connected` jedes Kind für sich.
 */
export const CASE_KIND_BY_COLLECTION_KIND: Record<CollectionKind, string | null> = {
  expense_report: "expense_report",
  credit_card_statement: "expense_report",
  cash_register_report: "expense_report",
  payment_gateway_payout: "expense_report",
  vendor_collective_invoice: "incoming_invoice",
  document_with_annexes: null,
  not_connected: null,
};

export function isCollectionKind(value: unknown): value is CollectionKind {
  return typeof value === "string" && (COLLECTION_KINDS as readonly string[]).includes(value);
}
