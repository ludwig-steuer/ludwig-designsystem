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
import type { DocCategory, DocDirection, SourceDocType } from "./document-form-mapping";

/**
 * Die Kern-Fakten des Rechnungs-Subtyps, wenn es ihn gibt.
 *
 * Der Aufrufer setzt sie, **wenn die Subtyp-Zeile existiert**; ob sie gezeigt
 * werden, entscheidet die Belegart. Ein Vertrag hat sie nicht.
 */
export interface SourceDocumentDetail {
  invoiceNumber?: string | null;
  totalAmount?: number | null;
  currency?: string | null;
  taxAmount?: number | null;
}

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
   * `beleg_erledigung`.
   */
  completedVia?: string | null;
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
}
