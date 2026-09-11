/**
 * # Die Formen der Sachverhalts-Ansicht
 *
 * Was die Oberflächen des Sachverhalts rendern — flach, serialisierbar, ohne
 * eine Zeile Laufzeit. Gebaut werden sie in
 * `application/case-overview.ts`; **diese** Datei kennt weder die Queries noch
 * die Regeln, nach denen aus einer Zeile ein Feld wird.
 *
 * **Warum getrennt (L-220).** Die Datei importierte `@/modules/entries/client`
 * und `../infrastructure/case-detail-queries` — beides gibt es im Spiegel des
 * Design-Systems nicht (`sync-ludwig.sh` nimmt aus einem Modul nur `domain/`
 * und schreibt `@/modules/x` auf `@/ludwig/modules/x` um). Also fehlte drüben
 * das ganze Vokabular, `CaseHeaderVM.disposition` eingeschlossen, und das
 * Design-System baute die Formen ein zweites Mal. Vorbild der Trennung ist
 * `ui/status/status-registry.ts`: nicht der Ordner macht die Spiegelbarkeit,
 * sondern die Import-Freiheit.
 *
 * Bewusste Lücken (Felder, die das Schema heute nicht hergibt):
 *  - `servicePeriod` (Leistungszeitraum am Sachverhalt) — Feld existiert nicht.
 *  - Netto/USt/Fälligkeit/Leistungszeitraum je Beleg — nicht in der Query.
 *  - Die Saldo-Klassifikation (gate/stay) ist heuristisch, bis
 *    `client_ledger_accounts.role` bzw. das SKR-Mapping steht.
 */
import type { JournalEntryVM } from "@/ludwig/modules/entries";
import { CASE_KIND_LABEL } from "./case";
import type {
  CaseDisposition,
  CaseDocumentNumberMode,
  CaseKind,
  CaseLifecycle,
} from "./case";

export type TimelineState =
  | "posted"
  | "accepted"
  | "proposed"
  | "open"
  | "blocked"
  | "no_booking_required"
  | "planned";

export interface DocFactsVM {
  type: "invoice" | "contract" | "other";
  sourceDocId: string;
  vendor: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  gross: number | null;
  currency: string;
  summary: string | null;
  storedFileId: string | null;
  originalFileName: string | null;
}

export interface BankVM {
  amount: number;
  date: string;
  currency: string;
  counterparty: string | null;
  purpose: string | null;
  account: string | null;
}

export interface TimelineEventVM {
  eventId: string;
  kind: string;
  date: string;
  rawDate: string;
  title: string;
  amount: number | null;
  currency: string;
  state: TimelineState;
  source: "doc" | "bank" | null;
  docType: "invoice" | "contract" | "other" | null;
  docLabel: string | null;
  booking: JournalEntryVM | null;
  /** true, wenn die Buchung(en) des Ereignisses storniert wurden (kein aktiver Satz). */
  reversed: boolean;
  /** F36: true = Event durch ein neueres ersetzt (Korrekturbeleg) — Badge „Ersetzt". */
  superseded: boolean;
  /** ids der offenen Klärungen, die dieses Event blockieren */
  blockedClarificationIds: string[];
  /** Die Wiederkehr-Regel hinter dem Ereignis — der Reiter „Zuordnung" zeigt nur ihre Treffer. */
  recurringRuleId: string | null;
  doc: DocFactsVM | null;
  bank: BankVM | null;
  infoNote: string | null;
  openNote: string | null;
}

export interface SaldoAccountVM {
  accountNumber: string;
  accountName: string;
  soll: number;
  haben: number;
  saldo: number;
  side: "S" | "H" | null;
  /** `gate` = Bestands-/Durchlaufkonto (muss auf 0); `stay` = Erfolgskonto. */
  type: "gate" | "stay";
  gate: "ok" | "open" | null;
  relatedEventIds: string[];
}

export interface ClarificationVM {
  id: string;
  type: "sachverhalt" | "beleg";
  short: string;
  /** Kompakte Überschrift (client_accounting_case_clarification.title), sonst null. */
  title: string | null;
  question: string;
  detail: string;
  answered: boolean;
  /** Antwortform + Optionen (F01-T1.7) — steuert das Eingabe-Rendering. */
  answerKind: string;
  /** Vorgelegte Handlungen als Klartext — der Text IST der Wert (Regel S13). */
  answerOptions: string[];
  allowFreeText: boolean;
  audience: "accounting" | "client" | "agent";
  /** Menschlesbare Antwort (nur wenn answered), sonst null. */
  answerText: string | null;
  raisedAt: string;
  /** Antwortdatum (nur wenn answered), für die E-Mail-artige Anzeige. */
  answeredAt: string | null;
  /** Anzeigename des Antwortenden (Kanzlei-User); null = Agent/System. */
  authorName: string | null;
  /** Begründungs-Quellen der Rückfrage (Konto-/Beleg-Links). */
  sources: ClarificationSourceVM[];
  /**
   * F105: laufende Wiedervorlage (formatiert), sonst null. Die Frage ist dann
   * weder offen noch beantwortet — sie kommt an diesem Tag von selbst zurück.
   */
  deferredUntil: string | null;
  /** „Warum nicht jetzt" — der Grund gehört neben das Datum, nicht ins Audit. */
  deferredReason: string | null;
  /** Wie oft schon verschoben; ab der dritten darf nur noch ein Mensch. */
  deferredCount: number;
}

/** Quelle an einer Rückfrage — `ledger_account` trägt die aufgelöste Kontonummer. */
export interface ClarificationSourceVM {
  kind: string;
  id?: string;
  url?: string;
  citation?: string;
  quote?: string;
  accountNumber?: string | null;
}


export interface CaseHeaderVM {
  caseId: string;
  caseNumber: string;
  title: string;
  /** User-/Agent-editierbare Sachverhalts-Beschreibung (client_accounting_case.summary). */
  summary: string | null;
  counterpartyName: string | null;
  /** Aufgelöster Geschäftspartner (→ client_business_partners.id) — macht counterpartyName im Hero verlinkbar. */
  counterpartyPartnerId: string | null;
  /**
   * F75-T75.3: Das eine Personenkonto des Sachverhalts (Nummer + Name), gegen
   * das gebucht wird. Gehört an den Kopf, nicht nur an die Buchungszeilen: die
   * Abnahme sieht sonst erst im Satz, mit wem der Vorgang eigentlich läuft.
   * NULL = hat bewusst keins (Sammel, interne Umbuchung, Sachbuchung).
   */
  personalAccount: { number: string; name: string | null } | null;
  /**
   * F104 R-E: Die Klammer einer Ausgleichsgruppe (Auslagen-/Kartenabrechnung).
   * Steht anstelle des Personenkontos — beides gleichzeitig gibt es nicht.
   * `balance` ist ihr Stand: ≠ 0 heißt, ein Beleg fehlt oder die Erstattung ist
   * noch nicht gebucht; der Sachverhalt schließt erst bei 0 (R-G).
   */
  clearingAccount: {
    number: string;
    name: string | null;
    type: string | null;
    balance: number | null;
  } | null;
  kind: CaseKind;
  kindLabel: string;
  /** F100 — Belegnummern-Modus; steht im Kopf neben Art und Lifecycle. */
  documentNumberMode: CaseDocumentNumberMode;
  lifecycleStatus: CaseLifecycle | null;
  /**
   * Wer am Zug ist (Achse `disposition`). Das ist die **zweite Frage** der
   * Detailseite („bin ich dran, oder wartet der Fall auf jemanden?") und
   * damit die, die im Kopf führt — bis 2026-09-08 trug der Header sie nicht,
   * und die Seite zeigte statt dessen den Lebenszyklus, der eine andere Frage
   * beantwortet. `CaseDetail` hat den Wert die ganze Zeit gehabt.
   */
  disposition: CaseDisposition | null;
  totalAmount: number | null;
  currency: string;
  openedAt: string;
  closedAt: string | null;
  /** TODO: Leistungszeitraum-Feld am Sachverhalt existiert noch nicht. */
  servicePeriod: { start: string; end: string } | null;
  balanced: boolean;
  /** Durchlaufkonten auf 0, aber noch keine festgeschriebene Buchung —
   *  „ausgeglichen, sobald die Vorschläge freigegeben/festgeschrieben sind". */
  provisionallyBalanced: boolean;
  saldoBlocked: boolean;
}

export interface NextActionVM {
  text: string;
  eventId?: string;
  tab?: string;
}

export interface CaseOverviewVM {
  header: CaseHeaderVM;
  events: TimelineEventVM[];
  saldoAccounts: SaldoAccountVM[];
  clarifications: ClarificationVM[];
  nextAction: NextActionVM | null;
  saldoNote: string | null;
}

/** Alias auf ``CASE_KIND_LABEL`` (domain/case.ts) — dort liegt die Quelle.
 *  Bleibt exportiert, weil Konsumenten den Namen bereits importieren. */
export const KIND_LABEL: Record<CaseKind, string> = CASE_KIND_LABEL;
