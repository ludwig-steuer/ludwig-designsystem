/**
 * # Die Fakten eines Sachverhalts
 *
 * Lag bis 2026-09-07 in `infrastructure/case-detail-queries.ts` — der Spiegel
 * ins Design-System nimmt aus `infrastructure/` nichts, und die
 * Sachverhalts-Familie arbeitete deshalb gegen eine lokale Kopie (L-68).
 *
 * Elf Felder fehlten, die die Fakten-Ansicht braucht. Dass `title` darunter
 * war, ist die Wurzel von L-52: die Oberflächen bauten sich ihren
 * Anzeigetitel selbst, weil das Modell keinen trug.
 */
import type { CaseDocumentNumberMode, CaseKind, CaseLifecycle } from "./case";

export interface CaseDetail {
  caseId: string;
  caseNumber: string | null;
  clientId: string;
  fiscalYear: number | null;
  /** NOT NULL seit Migration ``20260529060000_case_kind_not_null``. */
  kind: CaseKind;
  /** F100 — wie viele Belegnummern der Vorgang erwartet. NOT NULL ohne Default. */
  documentNumberMode: CaseDocumentNumberMode;
  summary: string | null;
  currency: string | null;
  totalAmount: number | null;
  lifecycleStatus: CaseLifecycle | null;
  openedAt: string;
  closedAt: string | null;
  /** Freitext-Gegenpartei der Case-Zeile (Fallback-Label, wenn die Timeline keine liefert). */
  counterpartyName: string | null;
  /** Aufgelöster Geschäftspartner (→ client_business_partners.id), falls vom Zahlungs-/Beleg-Flow gesetzt. */
  counterpartyPartnerId: string | null;
  /**
   * Gesetzt = beim Buchen wurde begründet auf einen Beleg verzichtet (der Text
   * IST die Begründung), der Sachverhalt fällt aus der Nachforderungsliste.
   * Muss bei der Abnahme sichtbar sein — er ersetzt einen Beleg durch eine
   * Behauptung.
   */
  documentNotRequiredReason: string | null;
  /**
   * F75-T75.3: Das EINE Personenkonto dieses Sachverhalts (Kreditor, Debitor
   * oder Diverse-Konto) — vom Server abgeleitet, für Buchungen bindend. NULL
   * heißt „hat bewusst keins" (Sammel, interne Umbuchung, reine Sachbuchung),
   * nicht „unbekannt".
   */
  personalAccountNumber: string | null;
  personalAccountName: string | null;
  /**
   * F104 R-E: Das Verrechnungskonto einer Ausgleichsgruppe (Auslagen, Karte,
   * Kasse, Gateway) — die Klammer des Vorgangs. Schließt das Personenkonto aus:
   * zwei Ausgleichskonten am selben Vorgang sind zwei Offene-Posten-Sichten,
   * die sich nie treffen.
   */
  clearingAccountNumber: string | null;
  clearingAccountName: string | null;
  clearingAccountType: string | null;
  /**
   * Stand der Klammer (Soll − Haben) über die Buchungen dieses Sachverhalts.
   * 0 = ausgeglichen, ≠ 0 = es fehlt ein Beleg oder die Erstattung; NULL =
   * keine Klammer oder noch nichts gebucht. Der Sachverhalt schließt erst bei 0
   * (R-G).
   */
  clearingBalance: number | null;

  // — 2026-09-07 ergänzt (L-68) —

  /** Eigener Titel des Sachverhalts. Fehlte; `caseDisplayTitle` fiel deshalb
   *  überall auf die Art zurück. */
  title: string | null;
  /** Achse `disposition`: wer am Zug ist — Agent, Kanzlei oder Mandant. */
  disposition: string | null;
  /** Offene Rückfragen an diesem Sachverhalt. Zählt, was noch niemand
   *  beantwortet hat — die Zahl steht am Reiter. */
  openClarificationsCount: number;
  /** Achse `buchung_export`, abgeleitet aus den Buchungen des Falls. */
  exportStatus: string | null;
  /** Auf welcher Seite der Gegenpart steht (Kreditor/Debitor) — bestimmt,
   *  welches Personenkonto gilt. */
  counterpartySide: string | null;
  /** Verweis auf den offenen Posten aus dem DATEV-Vortrag, falls der
   *  Sachverhalt daraus entstanden ist. */
  batchOposReference: string | null;
  /** Wer den Sachverhalt angelegt hat — Achse `actor_kind` plus Klartext.
   *  „Agent" und „ein Mensch" sind bei der Abnahme verschieden viel wert. */
  createdByKind: string | null;
  createdByLabel: string | null;
  /** Erwarteter Abstand zweier Vorkommen bei Dauersachverhalten (ISO-Intervall). */
  expectedInterval: string | null;
  /** Der Durchgang, aus dem der Sachverhalt stammt. */
  agentRunId: string | null;
  /** Der Stapel, in dem seine Buchungen nach DATEV gingen. */
  exportBatchId: string | null;
}