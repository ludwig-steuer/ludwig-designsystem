/**
 * # Der Beleg, wie er angezeigt wird
 *
 * Das Anzeigemodell der Beleg-Familie. Es lag bis 2026-09-07 nur im
 * Design-System (`SourceDocument.tsx`) — solange es dort wohnt, kann die App
 * es nicht als Vertrag lesen, und jede Abweichung fällt erst beim Einbau auf
 * (L-93). Jetzt steht es hier und wird gespiegelt; dieselbe Bewegung wie bei
 * `InboxEntry`.
 *
 * Was hier **nicht** hingehört: alles, was nur die Rechnung hat. Der Beleg ist
 * der Supertyp — Positionen, Steuerschlüssel und Buchungsvorschlag hängen am
 * Subtyp und haben ihre eigenen Modelle.
 *
 * Keine Laufzeit, keine UI: die Datei ist spiegelbar.
 */
import type { ContractBookingFact } from "@/ludwig/modules/contracts";
import type { Currency } from "@/ludwig/shared/money";
import type { SourceDocCompletionVia } from "./document-form-labels";
import type { DocCategory, DocDirection, SourceDocType } from "./document-form-mapping";

/* ── Die Fakten der Ausprägung ────────────────────────────────────────────
   L-208: bis 2026-09-08 stand hier die Rechnungs-Hälfte mit vier Feldern,
   während das Design-System die vollständige Vereinigung selbst führte — zwei
   Wahrheiten über denselben Wert. Der Wortlaut unten ist der des Sets,
   unverändert übernommen; das Set löscht seine Kopie beim nächsten Spiegel.

   Die Regel dahinter, aus dem Entitätsprofil: die Reihenfolge der Datenpunkte
   ist für jede Belegart dieselbe; welches Feld einen Rang füllt, entscheidet
   die Ausprägung. Zwei Einträge und nur zwei — Rechnung und Vertrag sind die
   Belegarten mit eigenen Feldern. Kontoauszug, Kreditkartenabrechnung und
   Reisekostenabrechnung bekommen bewusst keine: sie sind Behälter, ihre
   Struktur lebt am Import-Stapel und an ihren Kindern. */

/**
 * The subtype row of a document, as far as the family reads it. The caller
 * sets it **when the row exists** — whether it is shown is decided here.
 */
export type SourceDocumentDetail =
  | {
      kind: "invoice";
      /** `invoice_number` — rank 5, read digit by digit. */
      number?: string | null;
      /** `invoice_total_value` — rank 3. */
      gross?: number | null;
      currency?: Currency | null;
      /** `processing_status`, registry axis `beleg`. */
      processingStatus?: string | null;
      /* Only the block of the specialization shows these (0076). */
      /** `subtotal_value` and `tax_total_value`. */
      net?: number | null;
      vat?: number | null;
      dueDate?: string | null;
      /** `payment_term` — „30 Tage netto", as extracted. */
      paymentTerm?: string | null;
      /** `service_period` — a period as one string, not two dates. */
      servicePeriod?: string | null;
      /**
       * `paid_at`. The **date**, not `payment_status`: that column has neither
       * a registry axis nor an enum, and a raw state without a word would be a
       * local label map (finding, reported with 0076).
       */
      paidAt?: string | null;
      /** `vendor_ust_id` — the issuer's VAT id, read digit by digit. */
      issuerVatId?: string | null;
      /** FX: only ever set on a document that was not issued in euros. */
      originalCurrency?: string | null;
      originalGross?: number | null;
    }
  | {
      kind: "contract";
      /** `contract_subject` — rank 5, a sentence, not a number. */
      subject?: string | null;
      /** `primary_amount` — rank 3. */
      amount?: number | null;
      currency?: Currency | null;
      /** `contract_type`, label through `contractTypeLabel()`. */
      contractType?: string | null;
      /* Only the block of the specialization shows these (0076). */
      startDate?: string | null;
      endDate?: string | null;
      durationMonths?: number | null;
      /** No end date **and** open-ended are two different statements. */
      isOpenEnded?: boolean;
      /** `booking_facts_json` — what the contract means for booking, with provenance. */
      bookingFacts?: readonly ContractBookingFact[];
    };

export interface SourceDocumentVM {
  id: string;
  /**
   * NOT NULL und bei **jeder** Belegart gefüllt — deshalb hier Pflicht: der
   * Dateiname ist der letzte Rückfall der Kennung und der einzige Anker, den
   * ein Nicht-Rechnungsbeleg immer hat.
   */
  fileName: string;
  /**
   * Der Diskriminator. Beim Lesen sieben Werte — die TypeScript-Union
   * beschreibt, was *geschrieben* wird, der DB-CHECK kennt mehr.
   */
  sourceDocType?: SourceDocType | "declaration" | null;
  /** Rückfall des Labels: bei `other`/NULL gewinnt die Belegform. */
  classDocumentForm?: string | null;
  /** Der Gegenpart. Je nach Belegart 50–95 % gefüllt — ohne ihn führt der Dateiname. */
  counterparty?: string | null;
  detail?: SourceDocumentDetail | null;
  /** ISO-Tag. NULL bleibt NULL — nie der Upload-Tag (GLOSSARY). */
  documentDate?: string | null;
  /** NOT NULL. Der Sortierschlüssel der Belegliste. */
  receivedDate: string;
  /** `null` = noch offen. */
  completedAt?: string | null;
  /**
   * Warum er erledigt ist. `null` **bei gesetztem `completedAt`** heißt
   * „erledigt, Grund nicht festgehalten" — nicht „offen". Achse
   * `beleg_erledigung`; sechs Werte, im selben Modul (L-215).
   */
  completedVia?: SourceDocCompletionVia | null;
  /** Freitext neben dem Abzeichen, in dessen Tooltip. */
  completedReason?: string | null;
  /** Achse `beleg_kategorie`. NULL zeigt **nichts**, nie „unklassifiziert". */
  docCategory?: DocCategory | null;
  /** Achse `beleg_richtung`. NULL heißt „nicht anwendbar" — kein Abzeichen. */
  docDirection?: DocDirection | null;
  /** Nur zeigen, wenn **≠ `original`**: 83 % sind es, und der Normalfall ist keine Nachricht. */
  classDocumentKind?: string | null;
  /** Achse `dokumentgruppe`, nur an einem Sammelbeleg gesetzt. */
  collectionKind?: string | null;
  /**
   * Verarbeitung der Rechnung, Achse `beleg`. Ein Zustand der
   * **Spezialisierung**, nicht jedes Belegs — ein Vertrag hat keinen.
   */
  processingStatus?: string | null;
  /**
   * `client_source_docs.status`, Achse `beleg_inbox` — der eine Zustand, den
   * **jede** Belegart trägt. Im Bestand fast konstant (99,7 % `classified`),
   * weshalb ihn die Liste zeigt und die Zeile nicht.
   */
  inboxStatus?: string | null;
  /**
   * Wie sicher die Einordnung ist: `class_confidence`, ein Anteil zwischen 0
   * und 1 — **eine Zahl, kein Achsenwert**. Die Achse `konfidenz` sieht
   * passend aus und ist es nicht: sie gehört dem Buchungsvorschlag, und ihr
   * „Bitte Konto und Steuerschlüssel prüfen" ist keine Antwort auf eine
   * Klassifikation. Bis es eine eigene Achse gibt, zeigt die Spalte den
   * Anteil als Prozent.
   */
  classConfidence?: number | null;
  /**
   * Dateigröße in Bytes. Sie zählt an genau einer Stelle: bei 25 MB
   * scheitert die Übergabe.
   */
  byteSize?: number | null;

  // — 2026-09-08 ergänzt (L-216, L-217) —

  /**
   * Seitenbereich im Original, z. B. `"5-7"` — nur an einem Beleg, der aus
   * einem Sammel-PDF getrennt wurde (20 %).
   *
   * Eine **eigene Angabe**, kein Dateiname: bis heute setzte die Belegseite
   * „Seiten 5–7" als `fileName`, weil das Modell keinen Platz dafür hatte.
   * `fileName` und `receivedDate` bleiben Pflicht — der Teilbeleg trägt Datei
   * und Eingang seines Originals, und das ist wahr und für die Spur nützlich.
   */
  splitPageRange?: string | null;
  /**
   * Das Sammel-PDF, aus dem er stammt. Teilbeleg ist eine **Beziehung**,
   * keine Belegart: ein `kind: "part"` müsste jede Stelle anfassen, die über
   * Belegarten entscheidet, und würde dabei nichts erklären, was diese eine
   * Kante nicht sagt.
   */
  parentSourceDocId?: string | null;
  /**
   * Wann die Einordnung von Hand korrigiert wurde (3 %). Gesetzt heißt: ein
   * Mensch hat widersprochen — was der Classifier sagt, gilt hier nicht mehr.
   */
  classOverriddenAt?: string | null;
  /**
   * Die DATEV-Ablage des Belegs (65 %): Ablagesystem, Ordner und Id. Drei
   * Felder, weil DATEV sie getrennt führt — `document_link` und
   * `document_system` sind beim Schreiben zwei Dinge.
   */
  datevRefSystem?: string | null;
  datevRefFolder?: string | null;
  datevRefId?: string | null;
}

/* ── Vom Datensatz zum Anzeigemodell ──────────────────────────────────────
   Das Modell stand seit 2026-09-07 als Vertrag da, und niemand erzeugte es:
   die Belegliste baute ihre neun Zellen weiter aus Rohfeldern zusammen. Die
   Kaskaden — welcher Name der Gegenpart ist, welche Kennung führt — liefen
   dabei je Liste noch einmal von vorn (L-36).

   Die Eingaben sind bewusst strukturell getippt und nicht aus
   `modules/invoices` bzw. `infrastructure/` importiert: die Datei bleibt so
   ohne Modul-Abhängigkeit und damit spiegelbar.

   Was die Mapper NICHT setzen: `href`, `caseHref`, `caseNumber`,
   `hasInvoiceRow` und `detail`. Die ersten beiden sind Wege durch die
   Oberfläche und haben in einem Domänenmodell nichts verloren, die nächsten
   zwei erklärt das Set an seiner Erweiterung des Modells — und `detail`
   kennt nur der Aufrufer: ob die Subtyp-Zeile existiert, steht nicht im
   Supertyp. Er legt sie beim Übergeben dazu. */

/**
 * Eine Zeile der Belegliste des Jahres.
 *
 * `documentCounterparty()` läuft bewusst **vor** dieser Funktion, nicht in
 * ihr: die Kaskade lebt in ihrer eigenen Datei, der Aufrufer reicht das
 * Ergebnis herein. So bleibt dieses Modul frei von jeder Ableitung und die
 * Regel an ihrem einen Ort.
 */
export function sourceDocumentFromListRow(row: {
  sourceDocId: string | null;
  invoiceId: string | null;
  sourceDocType?: string | null;
  fileName: string | null;
  /** Fertig aufgelöst — `documentCounterparty()` beim Aufrufer. */
  counterparty: string | null;
  invoiceDate: string | null;
  receivedDate: string | null;
  docCategory?: string | null;
  docDirection?: string | null;
  documentForm?: string | null;
  documentKind?: string | null;
  processingStatus?: string | null;
  completedAt?: string | null;
  completedReason?: string | null;
  completedVia?: SourceDocCompletionVia | null;
}): Omit<SourceDocumentVM, "detail"> {
  return {
    id: row.sourceDocId ?? row.invoiceId ?? "",
    // NOT NULL in der Datenbank; die Listenzeile lässt es trotzdem `null` zu,
    // weil sie über einen LEFT JOIN kommt. Leer heißt hier „kein Rückfall" —
    // die Kennung fällt dann auf die Kurz-Id.
    fileName: row.fileName ?? "",
    sourceDocType: (row.sourceDocType as SourceDocumentVM["sourceDocType"]) ?? null,
    classDocumentForm: row.documentForm ?? null,
    counterparty: row.counterparty,
    documentDate: row.invoiceDate,
    // Der Perioden-Anker. Fehlt er, gehört der Beleg in einen der beiden
    // Hänger-Reiter — dort führt ohnehin die Datei.
    receivedDate: row.receivedDate ?? "",
    completedAt: row.completedAt ?? null,
    completedReason: row.completedReason ?? null,
    completedVia: row.completedVia ?? null,
    docCategory: (row.docCategory as SourceDocumentVM["docCategory"]) ?? null,
    docDirection: (row.docDirection as SourceDocumentVM["docDirection"]) ?? null,
    classDocumentKind: row.documentKind ?? null,
    processingStatus: row.processingStatus ?? null,
  };
}

/**
 * Eine Zeile der beiden Hänger-Reiter.
 *
 * Sie trägt weniger: kein Betrag, keine Richtung, keine Verarbeitung der
 * Rechnung — ein Beleg, der hier steht, hat die Extraktion oft nie erreicht.
 */
export function sourceDocumentFromStuckRow(row: {
  sourceDocId: string;
  fileName: string | null;
  documentForm: string | null;
  counterparty: string | null;
  documentDate: string | null;
  receivedDate: string;
  status: string;
}): Omit<SourceDocumentVM, "detail"> {
  return {
    id: row.sourceDocId,
    fileName: row.fileName ?? "",
    classDocumentForm: row.documentForm,
    counterparty: row.counterparty,
    documentDate: row.documentDate,
    receivedDate: row.receivedDate,
    inboxStatus: row.status,
  };
}

/**
 * Der Beleg der Detailseite (Basis-Datensatz des Typ-Dispatch).
 *
 * Er trägt mehr als eine Listenzeile: die Zusammenfassungen des Classifiers,
 * die Konfidenz, den Gruppentyp. Was er NICHT trägt, ist der Betrag — der
 * hängt an der Rechnungszeile und kommt über `detail` dazu.
 */
export function sourceDocumentFromDispatch(doc: {
  sourceDocId: string;
  fileName: string | null;
  sourceDocType: string | null;
  classDocumentForm: string | null;
  classDocumentKind: string | null;
  collectionKind: string | null;
  docCategory: string | null;
  /** Fertig aufgelöst — `documentCounterparty()` beim Aufrufer. */
  counterparty: string | null;
  documentDate: string | null;
  receivedDate: string;
  completedAt: string | null;
  completedReason: string | null;
  completedVia: SourceDocCompletionVia | null;
  status: string;
  classConfidence: number | null;
  classOverriddenAt: string | null;
  parentSourceDocId: string | null;
  datevRefSystem: string | null;
  datevRefFolder: string | null;
  datevRefId: string | null;
}): Omit<SourceDocumentVM, "detail"> {
  return {
    id: doc.sourceDocId,
    fileName: doc.fileName ?? "",
    sourceDocType: (doc.sourceDocType as SourceDocumentVM["sourceDocType"]) ?? null,
    classDocumentForm: doc.classDocumentForm,
    classDocumentKind: doc.classDocumentKind,
    collectionKind: doc.collectionKind,
    docCategory: (doc.docCategory as SourceDocumentVM["docCategory"]) ?? null,
    counterparty: doc.counterparty,
    documentDate: doc.documentDate,
    receivedDate: doc.receivedDate,
    completedAt: doc.completedAt,
    completedReason: doc.completedReason,
    completedVia: doc.completedVia,
    inboxStatus: doc.status,
    classConfidence: doc.classConfidence,
    classOverriddenAt: doc.classOverriddenAt,
    parentSourceDocId: doc.parentSourceDocId,
    datevRefSystem: doc.datevRefSystem,
    datevRefFolder: doc.datevRefFolder,
    datevRefId: doc.datevRefId,
  };
}
