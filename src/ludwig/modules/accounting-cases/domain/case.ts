import { z } from "zod";

// Fachliche Lifecycle-Achse am client_accounting_case. Werte nach
// Refactor 2026-05-27 — siehe GLOSSARY.md → „Accounting case".
/**
 * `client_accounting_event.kind` — was an einem Sachverhalt passiert ist.
 * NOT NULL, DB-CHECK `client_accounting_event_kind_check`
 * (`20260819140000_event_mirror_source_and_opos_kind.sql`).
 *
 * Bis 2026-09-06 gab es diesen Wertebereich nur im CHECK. Das Icon-`switch`
 * der Sachverhaltsansicht führte statt dessen seine eigene Liste — mit zwei
 * Arten, die es nie gab (`contract_received`, `recurring`), und ohne zwei,
 * die es gibt (`internal_transfer`, `open_item_carryover`); die fielen still
 * auf das Standard-Icon (L-02).
 */
export const EVENT_KINDS = [
  "document_received",
  "payment_in",
  "payment_out",
  "internal_transfer",
  "adjustment",
  "accrual",
  "open_item_carryover",
] as const;
export type EventKind = (typeof EVENT_KINDS)[number];

export const CASE_LIFECYCLE = [
  "open",
  "needs_clarification",
  // Es fehlt eine Unterlage. Welche, bis wann und wer sie besorgt steht an der
  // ERWARTUNG (``client_accounting_case_expectation``, kind='document', F125).
  // ``needs_clarification`` sticht, wenn zusätzlich eine echte Frage offen ist.
  "waiting_for_documents",
  "closed_accepted",
  "closed_rejected",
  "closed_superseded",
] as const;
export type CaseLifecycle = (typeof CASE_LIFECYCLE)[number];

// EINZIGE TS-Quelle der Case-Arten (F11-T11.2). Spiegel des DB-CHECK
// ``client_accounting_case_kind_check`` in Migration
// ``supabase/migrations/20260617140000_client_source_docs_contracts.sql``
// — bei Änderung BEIDE anfassen. Keine lokalen z.enum-Duplikate mehr;
// bewusste Einschränkungen als ``CaseKindSchema.exclude([...])`` mit
// Kommentar am Konsumenten.
export const CASE_KIND = [
  "incoming_invoice",
  "outgoing_invoice",
  "recurring_charge",
  "internal_transfer",
  "expense_report",
  "adjustment_only",
  "contract",
] as const;
export type CaseKind = (typeof CASE_KIND)[number];

/** Anzeigetext je Case-Art. EINZIGE Quelle — nicht lokal duplizieren.
 *  Kein Status (keine Farbe, keine Übergänge), deshalb bewusst hier statt in
 *  der Status-Registry. */
export const CASE_KIND_LABEL: Record<CaseKind, string> = {
  incoming_invoice: "Eingangsrechnung",
  outgoing_invoice: "Ausgangsrechnung",
  // „Dauersachverhalt" ist der Begriff aus GLOSSARY.md — nicht „Wiederkehrend".
  recurring_charge: "Dauersachverhalt",
  internal_transfer: "Umbuchung",
  expense_report: "Auslagen",
  adjustment_only: "Korrektur",
  contract: "Vertrag",
};

/** Label für Aufrufer, die den Wert nur als ``string`` haben (Query-Ergebnisse,
 *  Formularwerte). Unbekanntes fällt auf den Rohwert zurück statt zu leeren. */
export function caseKindLabel(kind: string | null | undefined): string {
  if (!kind) return "—";
  return CASE_KIND_LABEL[kind as CaseKind] ?? kind;
}

/**
 * F100 — Belegnummern-Modus: wie viele Belegnummern erwartet dieser Vorgang?
 *
 * EINZIGE TS-Quelle, Spiegel des DB-CHECK
 * ``client_accounting_case_document_number_mode_check`` (Migration
 * ``supabase/migrations/20260823110000_case_document_number_mode.sql``) —
 * bei Änderung BEIDE anfassen.
 *
 * Die Angabe wird beim Anlegen GESETZT, nicht abgeleitet: jeder Anlagepfad
 * kennt sie im Moment des Schreibens. Die Ableitung aus ``kind`` + Anker
 * konnte ``per_period`` strukturell nicht ausdrücken — den Dauersachverhalt
 * ohne Dauerrechnung, dessen Vermieter jeden Monat eine neue Rechnungsnummer
 * schickt.
 */
export const CASE_DOCUMENT_NUMBER_MODES = [
  "single",
  "per_period",
  "multiple",
  "none",
] as const;
export type CaseDocumentNumberMode = (typeof CASE_DOCUMENT_NUMBER_MODES)[number];

export const CaseDocumentNumberModeSchema = z.enum(CASE_DOCUMENT_NUMBER_MODES);

/**
 * Erlaubte Umstufungen (F100 §5). Hochstufen ist begründungspflichtig,
 * Herabstufen verlangt zusätzlich die Wahl der künftig gültigen Nummer.
 * ``none`` nur bei ``kind in ('internal_transfer','adjustment_only')`` und ohne
 * verknüpften Beleg — das prüft der Kern, nicht diese Tabelle.
 */
export const CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS: Record<
  CaseDocumentNumberMode,
  readonly CaseDocumentNumberMode[]
> = {
  single: ["multiple", "per_period", "none"],
  per_period: ["multiple", "single", "none"],
  multiple: ["single", "per_period", "none"],
  none: ["single", "per_period", "multiple"],
};

/** Herabstufung = die Zahl der zulässigen Nummern sinkt auf genau eine. */
export function isDocumentNumberModeDowngrade(
  from: CaseDocumentNumberMode,
  to: CaseDocumentNumberMode,
): boolean {
  return to === "single" && (from === "multiple" || from === "per_period");
}

/** Zod-Schema über ``CASE_KIND`` — für alle Input-Validierungen (Agent-Kerne,
 *  MCP-Tool-Defs, Server-Actions) importieren statt Listen duplizieren. */
export const CaseKindSchema = z.enum(CASE_KIND);

// Zuständigkeits-Achse (agentic booking loop): wer ist am Zug? Orthogonal zur
// lifecycle-Achse. NULL = in Pipeline-Bearbeitung oder abgeschlossen.
export const CASE_DISPOSITION = ["agent", "accounting", "client"] as const;
export type CaseDisposition = (typeof CASE_DISPOSITION)[number];
/**
 * Was noch geschrieben werden DARF (F128). `'client'` ist stillgelegt —
 * Mandanten nutzen die Software nicht (Owner 2026-08-31), also gibt es keinen
 * Zug, der bei ihnen liegen könnte. Der DB-CHECK und `CASE_DISPOSITION` bleiben
 * dreiwertig (Altbestand, Portal-Leser), Schreib-Schemas und UI-Optionen
 * benutzen diese Liste.
 */
export const CASE_DISPOSITION_WRITABLE = ["agent", "accounting"] as const;
export type CaseDispositionWritable = (typeof CASE_DISPOSITION_WRITABLE)[number];
export const CASE_DISPOSITION_LABEL: Record<CaseDisposition, string> = {
  agent: "Agent",
  accounting: "Kanzlei",
  client: "Mandant",
};

/**
 * Erwartung am Sachverhalt (W2a) — worauf gewartet wird.
 * Wertebereich: DB-CHECK `client_accounting_case_expectation_kind_check`.
 */
/**
 * Zustand einer Klärungsfrage (F105). Vor W2b gab es zwei — offen oder
 * beantwortet —, und deshalb keine Achse: ein Boolean braucht keine.
 *
 * Die Wiedervorlage bringt den dritten: **zurückgestellt** ist weder das eine
 * noch das andere. Die Frage ist nicht erledigt, sie ist bewusst nicht jetzt
 * dran — und genau diese Unterscheidung war der Grund, warum eine Frage an
 * den Agenten unbegrenzt liegen bleiben konnte, ohne dass es jemandem auffiel.
 *
 * ABGELEITET aus `answered_at` und `deferred_until`, nicht gespeichert.
 */
export const CLARIFICATION_STATES = ["open", "deferred", "answered"] as const;
export type ClarificationState = (typeof CLARIFICATION_STATES)[number];

/** Der Zustand aus den gespeicherten Feldern — eine Regel, alle Leser. */
export function clarificationState(c: {
  answeredAt?: string | null;
  deferredUntil?: string | null;
  today?: string;
}): ClarificationState {
  if (c.answeredAt) return "answered";
  const today = c.today ?? new Date().toISOString().slice(0, 10);
  return c.deferredUntil && c.deferredUntil > today ? "deferred" : "open";
}

/**
 * `client_accounting_case_clarification.type` — die Historie des Sachverhalts
 * trägt zwei Sorten Einträge (F106 §4). Eine Frage erwartet eine Reaktion und
 * steht auf der Arbeitsliste, ein Kommentar nicht.
 */
export const CLARIFICATION_TYPES = ["question", "comment"] as const;
export type ClarificationType = (typeof CLARIFICATION_TYPES)[number];

/**
 * Worum es in einer Rückfrage geht — `question_type`.
 *
 * `text NOT NULL` **ohne** DB-CHECK: die Werte entstehen im Code, nicht im
 * Schema. Wer einen neuen einführt, trägt ihn hier ein — sonst zeigt die
 * Oberfläche den Slug mit Unterstrichen, was sie bis 2026-09-07 tat
 * (`humanizeType()` in `ClarificationsBanner`, L-10).
 *
 * Die `opos_*`-Typen sind Wächter-Fragen: sie entstehen automatisch aus dem
 * Abgleich mit dem DATEV-Bestand und tragen deshalb einen Sperrindex gegen
 * Dubletten je Sachverhalt.
 */
export const CLARIFICATION_QUESTION_TYPE_LABEL: Record<string, string> = {
  agent_clarification: "Rückfrage des Agenten",
  human_clarification: "Rückfrage der Kanzlei",
  document_missing: "Beleg fehlt",
  creditor_mismatch: "Kreditor passt nicht",
  duplicate_booking_suspected: "Doppelbuchung vermutet",
  partner_ambiguous: "Geschäftspartner mehrdeutig",
  recurring_amount_deviation: "Betrag weicht vom Dauersachverhalt ab",
  recurring_document_number_format: "Belegnummer passt nicht zum Muster",
  recurring_no_input: "Dauersachverhalt ohne Eingang",
  opos_anchor: "Offener Posten als Anker",
  opos_carryover: "Offener Posten aus dem Vortrag",
  opos_clearing_mismatch: "Ausgleich passt nicht zum offenen Posten",
  opos_settled_by_ludwig: "In Ludwig ausgeglichen, in DATEV nicht",
  opos_settled_extern: "Außerhalb von Ludwig ausgeglichen",
  other: "Sonstiges",
};

/**
 * Klartext eines Fragetyps. Unbekannte Slugs werden lesbar gemacht statt
 * verworfen — ein neuer Typ soll auffallen, nicht verschwinden.
 */
export function clarificationQuestionTypeLabel(questionType: string): string {
  const known = CLARIFICATION_QUESTION_TYPE_LABEL[questionType];
  if (known) return known;
  const cleaned = questionType.replace(/[_-]+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

/**
 * Woher eine maschinelle Rückfrage kommt — der schreibende Dienst.
 *
 * Lag bis 2026-09-07 als lokale Map in `ClarificationsBanner.tsx` und kannte
 * `agent`, `web` und `datev-mirror` nicht — zusammen 78 % des Bestands, die
 * deshalb ihren technischen Slug zeigten (L-11).
 */
export const CLARIFICATION_MODULE_LABEL: Record<string, string> = {
  agent: "Buchungsagent",
  web: "Kanzlei-Oberfläche",
  "datev-mirror": "DATEV-Abgleich",
  "booking-module": "Buchungsvorschlag",
  "invoice-interpreter": "Beleg-Interpretation",
  "document-simple-classifier": "Beleg-Klassifikation",
  "invoice-preprocessor": "Beleg-Erfassung",
};

export function clarificationModuleLabel(slug: string): string {
  return CLARIFICATION_MODULE_LABEL[slug] ?? slug;
}

export const EXPECTATION_KINDS = ["document", "payment"] as const;
export type ExpectationKind = (typeof EXPECTATION_KINDS)[number];

/**
 * Reife einer Erwartung — die Achse, die es vor W2a nicht gab und deren
 * Fehlen der ganze Befund war: eine Nachforderung war am ersten Tag so
 * dringend wie im dritten Monat (`sachverhalt-offen.md` P4).
 *
 * ABGELEITET, nicht gespeichert: `due_date` gegen heute, dazu
 * `escalation_level` und `resolved_at`. Eine Spalte dafür wäre eine zweite
 * Wahrheit, die zwischen zwei Läufen altert, ohne dass jemand sie fortschreibt.
 */
export const EXPECTATION_MATURITY = ["pending", "due", "escalated", "resolved"] as const;
export type ExpectationMaturity = (typeof EXPECTATION_MATURITY)[number];

/** Die Reife aus den gespeicherten Feldern — eine Regel, alle Leser. */
export function expectationMaturity(e: {
  dueDate: string;
  escalationLevel: number;
  resolvedAt?: string | null;
  today?: string;
}): ExpectationMaturity {
  if (e.resolvedAt) return "resolved";
  if (e.escalationLevel > 0) return "escalated";
  const today = e.today ?? new Date().toISOString().slice(0, 10);
  return e.dueDate < today ? "due" : "pending";
}

export interface CaseListItem {
  caseId: string;
  /** Fortlaufende Sachverhalt-Nummer im Format ``YYYY-####`` pro
   *  Mandant + Jahr. Per DB-Trigger ``assign_case_number`` befüllt.
   *  Kann ``null`` sein, wenn der Case kein ``fiscal_year`` hat. */
  caseNumber: string | null;
  clientId: string;
  fiscalYear: number | null;
  /** Pflichtangabe seit Migration ``20260529060000_case_kind_not_null``.
   *  Default ``incoming_invoice``; im Detail-View per User-Action änderbar. */
  kind: CaseKind;
  /** Kompakter UI-Kurztitel (max ~5 Wörter), Format „<Belegart>: <Lieferant>".
   *  Vom Classifier-LLM erzeugt, User-editierbar.  Wenn null → Fallback auf
   *  ``kind`` + ``counterpartyName``. */
  title: string | null;
  summary: string | null;
  /** Gegenpartei (Lieferant/Kunde), denormalisiert am Sachverhalt. */
  counterpartyName: string | null;
  /** Aufgelöster Geschäftspartner, falls der Beleg- oder Zahlungsfluss einen
   *  gefunden hat. Ohne ihn bleibt der Gegenpart in der Zeile ein Name ohne
   *  Ziel — 47 % der Sachverhalte tragen einen (L-69). */
  counterpartyPartnerId: string | null;
  currency: string | null;
  totalAmount: number | null;
  lifecycleStatus: CaseLifecycle | null;
  /** Zuständigkeit: agent/accounting/client (agentic booking loop). */
  disposition: CaseDisposition | null;
  /** Anzahl Belegeingangs-Events (kind='document_received'). */
  documentEventsCount: number;
  /** Anzahl Bank-Events (kind in payment_in / payment_out / internal_transfer). */
  bankEventsCount: number;
  openClarificationsCount: number;
  /** F125: hat der Sachverhalt eine offene Beleg-Erwartung? Abgeleitet, kein Flag. */
  hasOpenDocumentRequest: boolean;
  openedAt: string;
  closedAt: string | null;
  /**
   * DATEV-Export-Status des Sachverhalts (F18-T18.2), abgeleitet aus seinen
   * akzeptierten Buchungen — keine eigene Spalte. `null`, solange nichts
   * abgenommen ist (kein Export-Bezug).
   */
  exportStatus: CaseExportStatus | null;
}

/**
 * Lifecycle eines nicht-geschlossenen Sachverhalts ableiten. Präzedenz: eine
 * echte required-Frage (Beantworten ist actionable) sticht das Warten auf eine
 * Unterlage (nichts zu tun, bis sie eintrifft); ohne beides ist der Fall
 * wieder offen.
 *
 * Reine Funktion — die Zählung macht ``recomputeCaseLifecycle``
 * (``application/expectation-core.ts``), der EINE Aufrufer je Auslöser.
 *
 * @param openBlocking     offene ``severity='required'``-Klärungsfragen
 * @param openDocRequests  offene Beleg-ERWARTUNGEN (kind='document', F125)
 */
export function deriveClarificationLifecycle(
  openBlocking: number,
  openDocRequests: number,
): CaseLifecycle {
  if (openBlocking > 0) return "needs_clarification";
  if (openDocRequests > 0) return "waiting_for_documents";
  return "open";
}

/** Abgeleiteter DATEV-Export-Status je Sachverhalt (F18-T18.2). */
export type CaseExportStatus = "exportiert" | "teilweise" | "offen";

/**
 * Leitet den Export-Status aus den akzeptierten Buchungen eines Sachverhalts ab
 * (`accepted`/`posted`; `exported_at` gesetzt = exportiert). `null`, wenn noch
 * nichts abgenommen ist — dann gibt es nichts zu exportieren.
 */
export function deriveCaseExportStatus(
  acceptedCount: number,
  exportedCount: number,
): CaseExportStatus | null {
  if (acceptedCount <= 0) return null;
  if (exportedCount <= 0) return "offen";
  if (exportedCount >= acceptedCount) return "exportiert";
  return "teilweise";
}

export interface CaseFilter {
  fiscalYear?: number;
  lifecycleStatus?: CaseLifecycle[];
  /** Wenn ``true``: alle Cases außer den geschlossenen
   *  (`closed_accepted`, `closed_rejected`, `closed_superseded`).
   *  NULL-Lifecycle zählt als „läuft noch". */
  excludeClosed?: boolean;
  /** Wenn ``true``: nur Cases mit mind. einem ``client_journal_entry``
   *  mit ``status='proposed'`` (offene Buchungsvorschläge). */
  hasPendingProposal?: boolean;
  /** Freitext-Suche über ``case_number``, ``summary`` und vendor_name
   *  der verknüpften Belege. ILIKE-Pattern, case-insensitive. */
  searchQuery?: string;
  /** „einmalig" = alle ``kind`` außer ``recurring_charge``;
   *  „dauer" = nur ``recurring_charge``. ``undefined`` = beides. */
  recurringMode?: "einmalig" | "dauer";
  /** F100: nur Sachverhalte mit diesem Belegnummern-Modus. Wer die noch nicht
   *  gesplitteten Sammelfälle sucht, findet sie sonst nicht. */
  documentNumberMode?: CaseDocumentNumberMode;
  /** F125: Wenn ``true``: nur Sachverhalte mit einer offenen Beleg-ERWARTUNG.
   *  Abgeleitete Query, keine persistierte Spalte. */
  hasOpenDocumentRequest?: boolean;
  /** F101: alle Sachverhalte EINES Geschäftspartners. Zählt dazu, wer als
   *  Gegenpartei am Sachverhalt steht (`counterparty_partner_id`) ODER wessen
   *  Personenkonto bebucht wird (`fy_personal_account_id`) — sonst fehlen
   *  genau die OPOS-Fälle, die den Partner noch nicht verknüpft haben (F97). */
  counterpartyPartnerId?: string;
}

/** Helper: ist dieser ``kind`` ein Dauersachverhalt? */
export function isRecurringKind(kind: CaseKind | null | undefined): boolean {
  return kind === "recurring_charge";
}

export const CASE_LIST_TABS = [
  "laufend",
  "offen",
  "belege",
  "klaerung",
  "schliessen",
  "alle",
] as const;
export type CaseListTab = (typeof CASE_LIST_TABS)[number];

export const CASE_LIST_TAB_LABEL: Record<CaseListTab, string> = {
  laufend: "Laufende Sachverhalte",
  offen: "Offene Zahlungen",
  belege: "Wartet auf Unterlagen",
  klaerung: "Zur Bearbeitung",
  schliessen: "Zum Schließen",
  alle: "Alle Sachverhalte",
};

export function parseCaseListTab(value: string | string[] | undefined): CaseListTab {
  const v = Array.isArray(value) ? value[0] : value;
  return (CASE_LIST_TABS as readonly string[]).includes(v ?? "")
    ? (v as CaseListTab)
    : "laufend";
}

/**
 * Listen-URL-Parameter (``tab``/``q``/``recurring``/``dispo``) → ``CaseFilter``
 * des Tabs. Eine Ableitung für Listen-Tabelle **und** Detailseiten-Blättern,
 * damit „Vor/Zurück" exakt dieselbe Menge sieht wie die Liste.
 * ``null`` für Tabs ohne Case-Tabelle (``offen``/``schliessen``).
 */
export function caseFilterForListTab(
  tab: CaseListTab,
  raw: Record<string, string | string[] | undefined>,
  fiscalYear: number,
): CaseFilter | null {
  if (tab === "offen" || tab === "schliessen") return null;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const recurring = one(raw.recurring);
  const docMode = one(raw.belegnr);
  const q = one(raw.q)?.trim();
  const filter: CaseFilter = {
    fiscalYear,
    recurringMode:
      recurring === "einmalig" || recurring === "dauer" ? recurring : undefined,
    searchQuery: q || undefined,
    documentNumberMode: (CASE_DOCUMENT_NUMBER_MODES as readonly string[]).includes(docMode ?? "")
      ? (docMode as CaseDocumentNumberMode)
      : undefined,
  };
  if (tab === "laufend") filter.excludeClosed = true;
  if (tab === "belege") {
    filter.excludeClosed = true;
    filter.lifecycleStatus = ["waiting_for_documents"];
  }
  if (tab === "klaerung") filter.lifecycleStatus = ["needs_clarification"];
  return filter;
}

/**
 * Anzeigetitel eines Sachverhalts.
 *
 * Bis 2026-09-06 hatte jede Oberfläche ihren eigenen Rückfall, und die
 * fielen unterschiedlich gut aus (L-52): die Sachverhaltsansicht zeigte
 * schlicht „Sachverhalt", die Partner-Liste die Zusammenfassung, das Portal
 * als einzige etwas Brauchbares — Art plus Gegenpart.
 *
 * Die Reihenfolge hier ist die des Portals, weil sie am meisten sagt: ein
 * eigener Titel, sonst „Art: Gegenpart", sonst die Art allein. „Sachverhalt"
 * als Titel ist keine Auskunft; „Eingangsrechnung: Telekom" schon.
 */
export function caseDisplayTitle(input: {
  title: string | null | undefined;
  kind: string | null | undefined;
  counterpartyName?: string | null;
}): string {
  const titel = input.title?.trim();
  if (titel) return titel;
  const art = input.kind ? (CASE_KIND_LABEL[input.kind as CaseKind] ?? input.kind) : "Sachverhalt";
  const gegenpart = input.counterpartyName?.trim();
  return gegenpart ? `${art}: ${gegenpart}` : art;
}

/**
 * Höchstabstand einer Wiedervorlage in Tagen.
 *
 * 30, weil die Buchhaltung im Monatsrhythmus läuft
 * (`platform_clients.booking_interval='monthly'`): eine Frage darf höchstens
 * den nächsten Lauf überspringen, nicht zwei.
 *
 * Lag bis 2026-09-07 in `application/clarification-core.ts` — die Zahl ist
 * eine fachliche Regel, keine Eigenschaft der Ableitung, und das Set brauchte
 * sie spiegelbar (L-91). Der Name bleibt `MAX_DEFERRAL_DAYS`; das Register
 * nennt sie `DEFERRAL_MAX_DAYS`, gemeint ist dieselbe Zahl.
 */
export const MAX_DEFERRAL_DAYS = 30;
