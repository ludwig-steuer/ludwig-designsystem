import type { ChecklistRowKey } from "./checklist";

/**
 * F246 — die Kanzlei-Sätze des Prüfprotokolls (Schritt 8). Die Prüfungen
 * rechnen unverändert (R13f); hier steht nur, was die Kanzlei liest: der
 * Prüfpunkt, was zu tun ist, wohin der Link führt — und je Befundart ein Satz.
 * Der `problem`-Text des Agenten erscheint in Schritt 8 nie.
 *
 * Rein und ohne IO.
 */

export interface CheckpointText {
  label: string;
  /** Was zu tun ist, solange die Zeile offen ist. */
  todo: string;
  jumpLabel: string;
  /** Pfad-Suffix hinter `…/review/`. */
  jumpHref: string;
}

/** Die Bank-Prüfpunkte — sie stehen nur noch in Schritt 8 (F255). */
export const BANK_CHECK_LABELS = {
  assigned: "Jede Auszugszeile ist zugeordnet",
  booked: "Jede Auszugszeile ist gebucht",
  collective: "Sammelsachverhalte gehen auf",
  centralSettlement: "Zentralregulierung ausgeglichen",
} as const;

export const CHECKPOINT_TEXTS: Record<Exclude<ChecklistRowKey, "not_checked">, CheckpointText> = {
  statements_complete: {
    label: "Kontoauszüge lückenlos",
    todo:
      "Für jedes Konto mit Auszugspflicht muss der Zeitraum lückenlos belegt sein: fehlenden Auszug " +
      "einspielen – oder am Zahlungskonto die Auszugserwartung auf „Sollte kommen\" oder „Keine\" " +
      "setzen, wenn er verspätet oder gar nicht kommt.",
    jumpLabel: "Kontoauszüge öffnen",
    jumpHref: "1",
  },
  documents_handled: {
    label: "Belege bearbeitet",
    todo: "Jeder Beleg des Zeitraums braucht eine Buchung oder einen Grund, warum er keine bekommt.",
    jumpLabel: "Belege ohne Buchung öffnen",
    jumpHref: "1?view=unbooked",
  },
  questions_answered: {
    label: "Rückfragen beantwortet",
    todo:
      "Offene Fragen des Agenten beantworten – oder quittieren, wenn sie diesen Stapel nicht aufhalten sollen.",
    jumpLabel: "Rückfragen öffnen",
    jumpHref: "2",
  },
  cases_proposed: {
    label: "Sachverhalte mit Buchungsvorschlag",
    todo: "Diese Sachverhalte haben noch keinen Vorschlag: selbst buchen oder an den Agenten zurückgeben.",
    jumpLabel: "Sachverhalte ohne Vorschlag öffnen",
    jumpHref: "3#without-proposal",
  },
  entries_accepted: {
    label: "Buchungen freigegeben",
    todo:
      "Nicht freigegebene Vorschläge gehen nicht mit – sie landen in einem Nachtrag. " +
      "Freigeben, was mit soll, oder quittieren.",
    jumpLabel: "Vorschläge öffnen",
    jumpHref: "3",
  },
  export_simulation: {
    label: "Probe-Export fehlerfrei",
    todo: "Diese Buchungen würde DATEV ablehnen. Buchung öffnen und den genannten Fehler beheben.",
    jumpLabel: "Buchung öffnen",
    jumpHref: "3",
  },
  bank_transactions_booked: {
    label: BANK_CHECK_LABELS.assigned,
    todo: "Diese Auszugszeilen hängen an keinem Sachverhalt: Zeile öffnen und zuordnen.",
    jumpLabel: "Bankkonten öffnen",
    jumpHref: "4",
  },
  bank_transactions_proposed: {
    label: BANK_CHECK_LABELS.booked,
    todo:
      "Geld ist geflossen, aber es gibt keine freigegebene Buchung: Vorschlag freigeben, fehlende " +
      "Buchung anlegen oder den Verzicht zurücknehmen.",
    jumpLabel: "Bankkonten öffnen",
    jumpHref: "4",
  },
  clearing_accounts_zero: {
    label: BANK_CHECK_LABELS.collective,
    todo:
      "Ein Sachverhalt aus mehreren Teilen hat einen Rest: Sachverhalt öffnen und den Rest einer " +
      "Rechnung zuordnen oder aufteilen.",
    jumpLabel: "Sachverhalt öffnen",
    jumpHref: "3",
  },
  central_settlement_zero: {
    label: BANK_CHECK_LABELS.centralSettlement,
    todo:
      "Das Konto der Zentralregulierung steht nicht auf null – eine Abrechnung ist nicht vollständig aufgelöst.",
    jumpLabel: "Verrechnungskonten öffnen",
    jumpHref: "4",
  },
  conventions_decided: {
    label: "Neue Konventionen entschieden",
    todo: "Die neuen Regeln des Agenten bestätigen oder verwerfen – oder quittieren.",
    jumpLabel: "Konventionen öffnen",
    jumpHref: "7",
  },
  client_batch_masterdata: {
    label: "Personenkonten vollständig",
    todo:
      "DATEV lehnt Sätze ohne bekanntes Personenkonto ab: die Debitoren-/Kreditorenliste des Mandanten hochladen.",
    jumpLabel: "Ergebnis des Stapels öffnen",
    jumpHref: "0",
  },
};

/** Der Kanzlei-Satz zu einer Befundart; `null`, wo der Gegenstand für sich spricht. */
const FINDING_NOTES: Record<string, string> = {
  statement_missing: "Kein Auszug für diesen Zeitraum.",
  statement_unprocessed: "Der Auszug liegt als Beleg vor, ist aber noch nicht eingelesen.",
  statement_balance_chain:
    "Der Anfangssaldo passt nicht zum Endsaldo des vorigen Auszugs – es fehlt ein Auszug dazwischen.",
  statement_sum_mismatch:
    "Anfangssaldo plus Umsätze ergibt nicht den Endsaldo – der Auszug ist unvollständig eingelesen.",
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
  if (reason === "clarification_pending") return `Klärung offen seit ${clarificationSince ?? "—"}.`;
  return "Beim Agenten offen.";
}

/** Alle Befund-Sätze — für den Test gegen Codes und Kennungen. */
export const FINDING_NOTE_TEXTS: readonly string[] = Object.values(FINDING_NOTES);
