import { formatTime } from "@ludwig/designsystem";
import type { ChecklistRowKey } from "./checklist";

/**
 * F246 — die Kanzlei-Sätze des Prüfprotokolls. Die Prüfungen
 * rechnen unverändert (R13f); hier steht nur, was die Kanzlei liest: der
 * Prüfpunkt, was zu tun ist, wohin der Link führt — und je Befundart ein Satz.
 * Der `problem`-Text des Agenten erscheint im Prüfprotokoll nie.
 *
 * Rein und ohne IO.
 */

export interface CheckpointText {
  label: string;
  /** Was zu tun ist, solange die Zeile offen ist. */
  todo: string;
  jumpLabel: string;
  /** Pfad-Suffix hinter `…/review/`: Schritt-Schlüssel, ggf. mit Query/Anker. */
  jumpHref: string;
}

/** Die Bank-Prüfpunkte — sie stehen nur noch im Prüfprotokoll (F255). */
export const BANK_CHECK_LABELS = {
  assigned: "Jede Auszugszeile ist zugeordnet",
  booked: "Jede Auszugszeile ist gebucht",
  collective: "Sammelsachverhalte gehen auf",
  centralSettlement: "Zentralregulierung ausgeglichen",
} as const;

/**
 * Was im Mandantenstapel anders heißt: dort gibt es keine Vorschläge, sondern
 * die Sätze des Mandanten — übernommen werden sie unter „Buchungen des Mandanten" auf einmal.
 */
export const CLIENT_BATCH_CHECKPOINT_TEXTS: Partial<Record<ChecklistRowKey, CheckpointText>> = {
  entries_accepted: {
    label: "Buchungen übernommen",
    todo: "Die Sätze des Mandanten je Konto ansehen und alle übernehmen – erst dann gehen sie an DATEV.",
    jumpLabel: "Buchungen ansehen",
    jumpHref: "client-entries",
  },
  already_booked_in_datev: {
    label: "Bereits in DATEV gebucht",
    todo:
      "Diese Sätze des Mandanten stehen in DATEV schon – ein Export wäre eine Doppelbuchung. Satz am " +
      "Sachverhalt ablehnen, danach die übrigen übernehmen.",
    jumpLabel: "Buchungen ansehen",
    jumpHref: "client-entries",
  },
};

export const CHECKPOINT_TEXTS: Record<Exclude<ChecklistRowKey, "not_checked">, CheckpointText> = {
  statements_complete: {
    label: "Kontoauszüge lückenlos",
    todo:
      "Für jedes Konto mit Auszugspflicht muss der Zeitraum lückenlos belegt sein: fehlenden Auszug " +
      "einspielen – oder am Zahlungskonto die Auszugserwartung auf „Sollte kommen\" oder „Keine\" " +
      "setzen, wenn er verspätet oder gar nicht kommt.",
    jumpLabel: "Kontoauszüge öffnen",
    jumpHref: "completeness",
  },
  documents_handled: {
    label: "Belege bearbeitet",
    todo: "Jeder Beleg des Zeitraums braucht eine Buchung oder einen Grund, warum er keine bekommt.",
    jumpLabel: "Belege ohne Buchung öffnen",
    jumpHref: "completeness?view=unbooked",
  },
  documents_reviewed: {
    label: "Belege ohne klare Verarbeitung",
    todo:
      "Jeder Beleg ist am Ende gebucht, klar zugeordnet oder bewusst gesichtet – keiner bleibt " +
      "stillschweigend liegen. Vorschlag ausführen, Beleg ansehen oder quittieren.",
    jumpLabel: "Belegprüfung öffnen",
    jumpHref: "document-review",
  },
  questions_answered: {
    label: "Rückfragen beantwortet",
    todo:
      "Offene Fragen von Ludwig beantworten – oder quittieren, wenn sie diesen Stapel nicht aufhalten sollen.",
    jumpLabel: "Rückfragen öffnen",
    jumpHref: "clarifications",
  },
  cases_proposed: {
    label: "Sachverhalte mit Buchungsvorschlag",
    todo: "Diese Sachverhalte haben noch keinen Vorschlag: selbst buchen oder an Ludwig zurückgeben.",
    jumpLabel: "Sachverhalte ohne Vorschlag öffnen",
    jumpHref: "proposals?tab=without_proposal",
  },
  entries_accepted: {
    label: "Buchungen freigegeben",
    todo:
      "Nicht freigegebene Vorschläge gehen nicht mit – sie landen in einem Nachtrag. " +
      "Freigeben, was mit soll, oder quittieren.",
    jumpLabel: "Vorschläge öffnen",
    jumpHref: "proposals",
  },
  export_simulation: {
    label: "Probe-Export fehlerfrei",
    todo: "Diese Buchungen würde DATEV ablehnen. Buchung öffnen und den genannten Fehler beheben.",
    jumpLabel: "Buchung öffnen",
    jumpHref: "proposals",
  },
  already_booked_in_datev: {
    label: "Bereits in DATEV gebucht",
    todo:
      "Diese Sätze stehen in DATEV schon – ein Export wäre eine Doppelbuchung. Satz ablehnen oder " +
      "gegen das Zwischenkonto der Kanzleibuchung umbuchen.",
    jumpLabel: "Buchungen öffnen",
    jumpHref: "proposals",
  },
  booking_date_outside_batch: {
    label: "Buchungsdatum außerhalb des Stapels",
    todo:
      "Diese Sätze liegen nach dem Stapelende oder vor dem Wirtschaftsjahr des Stapels. Buchungsdatum in den " +
      "Stapel legen (Vormonate desselben Jahres sind erlaubt) oder den Satz ablehnen.",
    jumpLabel: "Buchungen öffnen",
    jumpHref: "proposals",
  },
  bank_transactions_booked: {
    label: BANK_CHECK_LABELS.assigned,
    todo: "Diese Auszugszeilen hängen an keinem Sachverhalt: Zeile öffnen und zuordnen.",
    jumpLabel: "Bankkonten öffnen",
    jumpHref: "account-clearing",
  },
  bank_transactions_proposed: {
    label: BANK_CHECK_LABELS.booked,
    todo:
      "Geld ist geflossen, aber es gibt keine freigegebene Buchung: Vorschlag freigeben, fehlende " +
      "Buchung anlegen oder den Verzicht zurücknehmen.",
    jumpLabel: "Bankkonten öffnen",
    jumpHref: "account-clearing",
  },
  clearing_accounts_zero: {
    label: BANK_CHECK_LABELS.collective,
    todo:
      "Ein Sachverhalt aus mehreren Teilen hat einen Rest: Sachverhalt öffnen und den Rest einer " +
      "Rechnung zuordnen oder aufteilen.",
    jumpLabel: "Sachverhalt öffnen",
    jumpHref: "proposals?tab=collective",
  },
  central_settlement_zero: {
    label: BANK_CHECK_LABELS.centralSettlement,
    todo:
      "Das Konto der Zentralregulierung steht nicht auf null – eine Abrechnung ist nicht vollständig aufgelöst.",
    jumpLabel: "Verrechnungskonten öffnen",
    jumpHref: "account-clearing",
  },
  conventions_decided: {
    label: "Neue Konventionen entschieden",
    todo: "Die neuen Regeln von Ludwig bestätigen oder verwerfen – oder quittieren.",
    jumpLabel: "Konventionen öffnen",
    jumpHref: "conventions",
  },
  client_batch_masterdata: {
    label: "Personenkonten vollständig",
    todo:
      "DATEV lehnt Sätze ohne bekanntes Personenkonto ab: die Debitoren-/Kreditorenliste des Mandanten hochladen.",
    jumpLabel: "Ergebnis des Stapels öffnen",
    jumpHref: "result",
  },
};

/** Der Kanzlei-Satz zu einer Befundart; `null`, wo der Gegenstand für sich spricht. */
const FINDING_NOTES: Record<string, string> = {
  statement_missing: "Kein Auszug für diesen Zeitraum.",
  bank_connection_unassigned: "Bankverbindung ohne Sachkonto.",
  statement_unprocessed: "Der Auszug liegt als Beleg vor, ist aber noch nicht eingelesen.",
  waived_but_paid: "Als ‚keine Buchung nötig' geschlossen, aber das Geld ist geflossen.",
  bank_line_proposed_only: "Vorschlag liegt vor, ist aber nicht freigegeben.",
  case_remainder: "Rest auf dem Personenkonto.",
};

export function findingNote(kind: string | null): string | null {
  return kind === null ? null : (FINDING_NOTES[kind] ?? null);
}

/** Warum ein Umsatz ohne Buchung dasteht (Deckung von „Jede Auszugszeile ist gebucht"). */
export function coverageNote(reason: string, clarificationSince: string | null): string {
  if (reason === "no_case") return "Ohne Sachverhalt.";
  if (reason === "clarification_pending") return `Klärung offen seit ${formatTime(clarificationSince, "date")}.`;
  return "Bei Ludwig offen.";
}

/** Alle Befund-Sätze — für den Test gegen Codes und Kennungen. */
export const FINDING_NOTE_TEXTS: readonly string[] = Object.values(FINDING_NOTES);
