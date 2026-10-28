import { SIGHTED_NO_ACTION, type NotBookkeepingDisposition } from "@/ludwig/modules/accounting-cases";

/**
 * F452 — Belegprüfung: kein Beleg bleibt stillschweigend liegen. Jeder Beleg
 * des Zeitraums ist am Ende gebucht, klar disponiert oder bewusst gesichtet.
 *
 * Diese Datei ist rein: sie bekommt den Beleg und seine Präzedenz und schlägt
 * vor, was mit ihm passiert — vorlegen, nicht stempeln. Jede Wahl wird über
 * einen bestehenden Kern ausgeführt (`review-actions.ts`).
 */

/** Was die Belegprüfung ausführen kann — jede Aktion ist ein bestehender Kern. */
export const DOCUMENT_REVIEW_ACTIONS = [
  "not_bookkeeping",
  "return_to_agent",
  "request_new_file",
  "discard_duplicate",
  "complete_with_reason",
  "sighted_no_action",
  "next_period",
  "ask_client",
] as const;
export type DocumentReviewAction = (typeof DOCUMENT_REVIEW_ACTIONS)[number];

export type NotBookkeepingFiling = Exclude<NotBookkeepingDisposition, "return_to_agent">;

export type DocumentReviewChoice =
  | { action: "not_bookkeeping"; filing: NotBookkeepingFiling }
  | { action: "return_to_agent" }
  | { action: "request_new_file" }
  | { action: "discard_duplicate"; signal: string }
  | { action: "complete_with_reason"; reason: string }
  | { action: "sighted_no_action" }
  /** Konzept §12: beim Mandanten klären, mit Notiz für ihn — der Beleg bleibt offen bis zur Übergabe. */
  | { action: "ask_client" }
  /** Konzept §12: in den nächsten Zeitraum — `next_period_from` am Beleg, der Sachverhalt zieht mit (F217). */
  | { action: "next_period" };

export type DocumentReviewCertainty = "confident" | "review";

export interface DocumentReviewDoc {
  sourceDocId: string;
  shortRef: string;
  status: string;
  reviewReason: string | null;
  reviewNote: string | null;
  classSummary: string | null;
  doneVia: string | null;
  doneReason: string | null;
  datevHistoryDuplicate: "certain" | "suspected" | null;
  /** F63/F442-Klärung am Sachverhalt, die die Belegnummer nennt. */
  duplicateClarification: "answered_duplicate" | "open" | null;
  /** „Beim Mandanten klären": die Notiz für den Mandanten; null = nicht markiert. */
  clientNote: string | null;
}

/** Die jüngsten gleichartigen Belege (gleicher Partner und gleiche Form), schon gebucht oder disponiert. */
export interface DispositionPrecedent {
  /** `disposition`: `"booked"` oder der `done_reason`. */
  hits: Array<{ shortRef: string; disposition: string }>;
}

export interface DocumentReviewProposal {
  /** Was passiert; bei `certainty: "confident"` die erste Wahl in `choices`. */
  label: string;
  rationale: string;
  /** `null`: in Verarbeitung — nichts zu entscheiden. */
  certainty: DocumentReviewCertainty | null;
  /** Ausführbare Wahlmöglichkeiten; bei `confident` steht der Vorschlag vorn. */
  choices: DocumentReviewChoice[];
}

export const BOOKED = "booked";

const FILING_LABELS: Record<NotBookkeepingFiling, string> = {
  private_tax_filing: "Private Steuerunterlage",
  annual_accounts_filing: "Jahresabschluss",
  payroll_filing: "Lohn",
  permanent_file: "Dauerakte",
  irrelevant: "Irrelevant",
};
const FILINGS = Object.keys(FILING_LABELS) as NotBookkeepingFiling[];

/** Der Ablageort allein („Jahresabschluss") — Unteroption der Gruppe „Ablegen ohne Buchung" (DS 091af3e). */
export function filingLabel(filing: NotBookkeepingFiling): string {
  return FILING_LABELS[filing];
}
export const FILING_GROUP_LABEL = "Ablegen ohne Buchung";

export function choiceLabel(choice: DocumentReviewChoice): string {
  switch (choice.action) {
    case "not_bookkeeping":
      // Owner 2026-10-27: die Ablagen als eine Gruppe lesbar — „Ablegen ohne Buchung: Jahresabschluss".
      return `Ablegen ohne Buchung: ${FILING_LABELS[choice.filing]}`;
    case "return_to_agent":
      return "Zurück an Ludwig";
    case "request_new_file":
      return "Datei neu anfordern";
    case "discard_duplicate":
      return "Dublette — verwerfen";
    case "complete_with_reason":
      return `Erledigen: ${choice.reason}`;
    case "sighted_no_action":
      return "Gesichtet — bewusst keine Aktion";
    case "ask_client":
      return "Beim Mandanten klären";
    case "next_period":
      return "In den nächsten Zeitraum";
  }
}

/** Ein Satz unter der Wahl — was sie für den Beleg bedeutet (Einzelprüfung, 0223). */
export function choiceHint(choice: DocumentReviewChoice): string {
  switch (choice.action) {
    case "not_bookkeeping":
      return "Kein Buchhaltungsbeleg – der Beleg wird dort abgelegt und nicht gebucht.";
    case "return_to_agent":
      return "Ludwig verarbeitet den Beleg mit Ihrer Anweisung weiter.";
    case "request_new_file":
      return "Der Beleg wird erledigt, die Datei beim Mandanten neu angefordert.";
    case "discard_duplicate":
      return "Der Beleg ist schon einmal da – dieser wird verworfen.";
    case "complete_with_reason":
      return "Der Beleg wird mit diesem Grund erledigt.";
    case "sighted_no_action":
      return "Bleibt ohne Buchung, bewusst gesichtet.";
    case "ask_client":
      return "Der Beleg geht mit Ihrer Notiz ins Paket für den Mandanten; bis zur Übergabe bleibt er offen.";
    case "next_period":
      return "Der Beleg gehört in den nächsten Stapel; ein offener Sachverhalt dazu zieht mit.";
  }
}

/** Braucht die Wahl einen Satz der Kanzlei? */
export function choiceNeedsNote(choice: DocumentReviewChoice): boolean {
  return choice.action === "return_to_agent" || choice.action === "request_new_file" || choice.action === "ask_client";
}

/**
 * Der Rückweg mit Anweisung: aus human_review (Übergabe), aus done (Wiederöffnen) und — Owner 2026-10-27 — aus
 * bookable (Ludwig hat gelesen, aber nicht gebucht; die Anweisung geht als Einwand in den Rücklauf-Korb). Nicht,
 * solange Ludwig ihn gerade hat (agent_review) oder noch liest.
 */
function canReturnToAgent(doc: DocumentReviewDoc): boolean {
  return doc.status === "human_review" || doc.status === "done" || doc.status === "bookable";
}

/**
 * Owner 2026-10-27 (Abnahme, Punkt 5): an jedem Beleg, über den zu entscheiden ist, steht die ganze Liste —
 * Ludwigs Vorschlag vorn, danach fest: Zurück an Ludwig mit Anweisung, Beim Mandanten klären, nächster Zeitraum,
 * die Ablagen ohne Buchung, Dublette, Datei neu anfordern, gesichtet.
 */
function fixedChoices(doc: DocumentReviewDoc): DocumentReviewChoice[] {
  return [
    ...(canReturnToAgent(doc) ? [{ action: "return_to_agent" } as const] : []),
    { action: "ask_client" },
    { action: "next_period" },
    ...FILINGS.map((filing): DocumentReviewChoice => ({ action: "not_bookkeeping", filing })),
    { action: "discard_duplicate", signal: "von der Kanzlei erkannt" },
    { action: "request_new_file" },
    { action: "sighted_no_action" },
  ];
}

const choiceKey = (c: DocumentReviewChoice): string => (c.action === "not_bookkeeping" ? `${c.action}:${c.filing}` : c.action);

function isFiling(value: string): value is NotBookkeepingFiling {
  return (FILINGS as string[]).includes(value);
}

function dispositionText(disposition: string): string {
  if (disposition === BOOKED) return "gebucht";
  if (disposition === SIGHTED_NO_ACTION) return "gesichtet";
  return isFiling(disposition) ? FILING_LABELS[disposition] : disposition;
}

/** ≥ 2 Treffer mit derselben Disposition — sonst nur ein Hinweis. */
function readPrecedent(precedent: DispositionPrecedent | null): { uniform: string | null; example: string | null; hint: string } {
  const hits = precedent?.hits ?? [];
  if (hits.length === 0) return { uniform: null, example: null, hint: "" };
  const first = hits[0]!;
  const uniform = hits.length >= 2 && hits.every((h) => h.disposition === first.disposition) ? first.disposition : null;
  return {
    uniform,
    example: first.shortRef,
    hint: ` Zuletzt: ${hits.map((h) => `${dispositionText(h.disposition)} (${h.shortRef})`).join(", ")}.`,
  };
}

const PRIVATE_HINT = /privat|steuererkl/i;

/**
 * Der Vorschlag je Beleg: erste zutreffende Regel gewinnt (F452 T452.2).
 * `precedent` ist die letzte Verarbeitung gleichartiger Belege (Kontextleiter
 * Stufe 3).
 */
export function proposeDocumentDisposition(
  doc: DocumentReviewDoc,
  precedent: DispositionPrecedent | null,
): DocumentReviewProposal {
  const p = propose(doc, precedent);
  if (p.certainty === null) return p;
  // Die Regel liefert den Vorschlag (bei `confident` vorn), die feste Liste füllt auf — nichts doppelt.
  const seen = new Set<string>();
  const choices = [...p.choices, ...fixedChoices(doc)].filter((c) => {
    const key = choiceKey(c);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { ...p, choices };
}

function propose(doc: DocumentReviewDoc, precedent: DispositionPrecedent | null): DocumentReviewProposal {
  const prev = readPrecedent(precedent);
  const sighted: DocumentReviewChoice = { action: "sighted_no_action" };
  const back: DocumentReviewChoice[] = canReturnToAgent(doc) ? [{ action: "return_to_agent" }] : [];

  // In Verarbeitung: nichts zu entscheiden, die Pipeline ist dran.
  if (doc.status === "pending" || doc.status === "extracting") {
    return {
      label: "In Verarbeitung",
      rationale: "Ludwig liest den Beleg noch — danach steht er hier mit Vorschlag.",
      certainty: null,
      choices: [],
    };
  }

  // 1. Kein Buchhaltungsbeleg (F449).
  if (doc.reviewReason === "not_bookkeeping") {
    const filings: DocumentReviewChoice[] = FILINGS.map((filing) => ({ action: "not_bookkeeping", filing }));
    const all: DocumentReviewChoice[] = [{ action: "return_to_agent" }, ...filings];
    if (PRIVATE_HINT.test(`${doc.reviewNote ?? ""} ${doc.classSummary ?? ""}`)) {
      return {
        label: FILING_LABELS.private_tax_filing,
        rationale: "Ludwig hält ihn für keinen Buchhaltungsbeleg, und der Beleg nennt privat bzw. Steuererklärung." + prev.hint,
        certainty: "confident",
        choices: [{ action: "not_bookkeeping", filing: "private_tax_filing" }, ...all.filter((c) => !(c.action === "not_bookkeeping" && c.filing === "private_tax_filing"))],
      };
    }
    if (prev.uniform && isFiling(prev.uniform)) {
      const filing = prev.uniform;
      return {
        label: FILING_LABELS[filing],
        rationale: `Kein Buchhaltungsbeleg — wie zuletzt: ${FILING_LABELS[filing]} (z. B. Beleg ${prev.example}).`,
        certainty: "confident",
        choices: [{ action: "not_bookkeeping", filing }, ...all.filter((c) => !(c.action === "not_bookkeeping" && c.filing === filing))],
      };
    }
    return {
      label: "Kein Buchhaltungsbeleg — Ablage wählen",
      rationale: "Ludwig hält ihn für keinen Buchhaltungsbeleg; wohin er gehört, entscheidet die Kanzlei." + prev.hint,
      certainty: "review",
      choices: all,
    };
  }

  // 2. Datei nicht lesbar.
  if (doc.reviewReason === "file_unreadable") {
    return {
      label: "Datei neu anfordern",
      rationale: "Die Datei lässt sich nicht lesen — ohne neue Datei gibt es nichts zu buchen.",
      certainty: "confident",
      choices: [{ action: "request_new_file" }, ...back],
    };
  }

  // 3. Dublette.
  const certainDuplicate = doc.datevHistoryDuplicate === "certain" || doc.duplicateClarification === "answered_duplicate";
  const suspectedDuplicate = doc.datevHistoryDuplicate === "suspected" || doc.duplicateClarification === "open";
  if (certainDuplicate || suspectedDuplicate) {
    const signal =
      doc.datevHistoryDuplicate === "certain"
        ? "in der DATEV-Historie gebucht"
        : doc.duplicateClarification === "answered_duplicate"
          ? "Klärung mit „Dublette“ beantwortet"
          : doc.datevHistoryDuplicate === "suspected"
            ? "Verdacht aus der DATEV-Historie"
            : "Dublettenverdacht offen";
    return {
      label: "Dublette — verwerfen",
      rationale: `Dublette: ${signal}.` + prev.hint,
      certainty: certainDuplicate ? "confident" : "review",
      choices: [{ action: "discard_duplicate", signal }, ...back],
    };
  }

  // 4. Liegt bei Ludwig — kein Rückgabe-Übergang nötig, kein Knopf.
  if (doc.status === "agent_review") {
    return {
      label: "Liegt bei Ludwig",
      rationale: "Ludwig bearbeitet den Beleg — der Prüfgrund steht am Beleg." + prev.hint,
      certainty: "confident",
      choices: [sighted],
    };
  }

  // 5. Präzedenz: die letzte Verarbeitung gleichartiger Belege.
  if (prev.uniform === BOOKED) {
    const rationale = `Gleichartige Belege wurden zuletzt gebucht (z. B. Beleg ${prev.example}).`;
    return canReturnToAgent(doc)
      ? { label: "Zurück an Ludwig", rationale, certainty: "confident", choices: [...back] }
      : { label: "Liegt bei Ludwig", rationale: `${rationale} Ludwig bucht ihn.`, certainty: "confident", choices: [sighted] };
  }
  if (prev.uniform === SIGHTED_NO_ACTION) {
    return {
      label: "Gesichtet — bewusst keine Aktion",
      rationale: `Wie zuletzt: gesichtet (z. B. Beleg ${prev.example}).`,
      certainty: "confident",
      choices: [sighted, ...back],
    };
  }
  if (prev.uniform && !isFiling(prev.uniform) && doc.status !== "done") {
    const reason = prev.uniform;
    return {
      label: `Erledigen: ${reason}`,
      rationale: `Wie zuletzt: ${reason} (z. B. Beleg ${prev.example}).`,
      certainty: "confident",
      choices: [{ action: "complete_with_reason", reason }, ...back],
    };
  }

  // 7. Sonst: die Kanzlei sieht ihn an — kein Default.
  return {
    label: "Bitte ansehen",
    rationale:
      (doc.status === "done"
        ? "Erledigt, aber ohne Grund — gesichtet oder zurück an Ludwig."
        : "Weder gebucht noch disponiert.") + prev.hint,
    certainty: "review",
    // Owner 2026-10-27: ohne Empfehlung steht der Rückweg mit Anweisung vorn; „Gesichtet" setzt die feste Liste ans Ende.
    choices: [...back],
  };
}

/**
 * F456 — Reihenfolge der Belegprüfung und Nachbarn beim Blättern: erst die
 * sicheren Vorschläge, dann der Rest, jeweils in Eingangsreihenfolge. Liste
 * und Einzelsicht lesen dieselbe Reihenfolge, damit sie nie auseinanderlaufen.
 * `afterDecisionId` ist der Beleg, der nach einer Entscheidung folgt.
 */
export function documentReviewQueue(
  items: readonly { sourceDocId: string; proposal: { certainty: DocumentReviewCertainty | null } }[],
  currentId: string | null,
): {
  ordered: string[];
  index: number;
  total: number;
  prevId: string | null;
  nextId: string | null;
  afterDecisionId: string | null;
} {
  const ordered = [
    ...items.filter((i) => i.proposal.certainty === "confident"),
    ...items.filter((i) => i.proposal.certainty !== "confident"),
  ].map((i) => i.sourceDocId);
  const index = currentId === null ? -1 : ordered.indexOf(currentId);
  if (index === -1) {
    return { ordered, index, total: ordered.length, prevId: null, nextId: null, afterDecisionId: ordered[0] ?? null };
  }
  const prevId = ordered[index - 1] ?? null;
  const nextId = ordered[index + 1] ?? null;
  return { ordered, index, total: ordered.length, prevId, nextId, afterDecisionId: nextId ?? prevId };
}
