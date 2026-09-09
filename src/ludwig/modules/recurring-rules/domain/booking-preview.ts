/**
 * Buchungssatz-Vorschau für die Dauerbuchungs-Verwaltungssicht (F40 Teil B,
 * Interface). Reine Funktionen — aus einer Regel (Modus, Richtung, aufgelöste
 * Konten, Vorlage) den Satz ableiten, der bei einem Treffer entstünde. Kein IO,
 * damit die testbare Formatierungs-Logik von der Query (aufgelöste Konten)
 * getrennt bleibt.
 *
 * Soll/Haben kommt aus den bestehenden reinen Helfern ``proposalSides`` /
 * ``accrualSides`` (einzige Wahrheit für die Seiten) — hier nur die
 * Beschriftung + der Modus-abhängige Zusammenbau.
 */
import {
  accrualSides,
  proposalSides,
  type RuleBookingMode,
  type RuleDirection,
} from "./rule";

/** Aufgelöstes Konto (Nummer + optionaler Name) für die Beschriftung. */
export interface PreviewAccount {
  accountNumber: string;
  accountName: string | null;
}

/** Eine Gegenkonto-Zeile einer Split-Vorlage, bereits aufgelöst. */
export interface PreviewLineInput {
  accountNumber: string;
  accountName: string | null;
  amount: number;
  taxKey: string | null;
}

export interface RulePreviewInput {
  bookingMode: RuleBookingMode;
  /** Zahlungsrichtung; bestimmt Soll/Haben. Null = unbestimmt (Default out). */
  direction: RuleDirection | null;
  /** Aufwand/Ertrag-Gegenkonto der Vorlage (Nicht-Bank-Seite). */
  counterAccount: PreviewAccount | null;
  /** Personenkonto (Debitor/Kreditor) — für accrue_then_settle. */
  personalAccount: PreviewAccount | null;
  /** Bank-/Zahlungskonto aus payment_account; null → generisches „Bank". */
  bankAccount: PreviewAccount | null;
  /** Split-Vorlage (≥1 Gegenkonto-Zeile); gesetzt → counterAccount ignoriert. */
  lines: PreviewLineInput[] | null;
  taxKey: string | null;
  /** Erwarteter/Vorlagen-Betrag für die Anzeige (i.d.R. match_amount). */
  amount: number | null;
}

/** Ein einzelner Buchungssatz „<Soll> an <Haben>". */
export interface PreviewPosting {
  debit: string;
  credit: string;
  amount: number | null;
  taxKey: string | null;
  /**
   * Dieselben zwei Konten wie in `debit`/`credit`, **unzerschnitten**.
   *
   * Die Label-Form („4200 Miete") reicht für einen Satz, nicht für eine
   * Buchungszeile: `JournalLine` will Nummer und Name getrennt, und wo kein
   * Konto feststeht, steht statt der Nummer ein Satz („Bank (aus Zahlung)").
   * Ein Label an seinem ersten Leerzeichen zu zerschneiden und zu hoffen,
   * dass davor eine Nummer stand, geht bei genau diesem Fall schief.
   *
   * `null` heißt: für diese Seite gibt es kein Konto, nur die Erklärung im
   * Label.
   */
  accounts: { debit: PreviewAccount | null; credit: PreviewAccount | null };
}

export interface RuleBookingPreview {
  /** Die Sätze, die bei einem Treffer entstünden. Leer = kein Auto-Vorschlag. */
  postings: PreviewPosting[];
  /** Entsteht überhaupt ein automatischer Buchungsvorschlag? */
  automatic: boolean;
  /** Zusatzhinweis (Settle-Zeile bei accrue_then_settle / match_only-Erklärung). */
  note: string | null;
}

const BANK_FALLBACK = "Bank (aus Zahlung)";
const COUNTER_FALLBACK = "Aufwand/Ertrag";
const PERSONAL_FALLBACK = "Personenkonto";

/** „4200 Miete" bzw. nur „4200", wenn kein Name; ``fallback`` wenn kein Konto. */
export function formatAccountLabel(account: PreviewAccount | null, fallback: string): string {
  if (!account) return fallback;
  const name = account.accountName?.trim();
  return name ? `${account.accountNumber} ${name}` : account.accountNumber;
}

/** Soll/Haben eines book_on_payment-Satzes: Gegenkonto ⇄ Bank aus der Richtung. */
function counterVsBank(
  direction: RuleDirection,
  counterLabel: string,
  bankLabel: string,
  amount: number | null,
  taxKey: string | null,
  counterAccount: PreviewAccount | null,
  bankAccount: PreviewAccount | null,
): PreviewPosting {
  // proposalSides ist die einzige Wahrheit — synthetisches Vorzeichen aus der Richtung.
  const { counterSide } = proposalSides(direction === "payment_out" ? -1 : 1);
  return counterSide === "debit"
    ? {
        debit: counterLabel,
        credit: bankLabel,
        amount,
        taxKey,
        accounts: { debit: counterAccount, credit: bankAccount },
      }
    : {
        debit: bankLabel,
        credit: counterLabel,
        amount,
        taxKey,
        accounts: { debit: bankAccount, credit: counterAccount },
      };
}

/**
 * Baut die Buchungssatz-Vorschau je Modus:
 * - ``match_only``: kein Vorschlag (leere Liste, Hinweis).
 * - ``accrue_then_settle``: Sollstellung Aufwand/Ertrag ⇄ Personenkonto + Hinweis
 *   auf die spätere Zahlungs-Buchung (Personenkonto ⇄ Bank).
 * - ``book_on_payment``: Gegenkonto(en) ⇄ Bank direkt (Split-Zeilen einzeln).
 */
export function buildRulePreview(input: RulePreviewInput): RuleBookingPreview {
  if (input.bookingMode === "match_only") {
    return {
      postings: [],
      automatic: false,
      note: "Nur Zuordnung — kein automatischer Buchungsvorschlag.",
    };
  }

  const bankLabel = formatAccountLabel(input.bankAccount, BANK_FALLBACK);
  const direction: RuleDirection = input.direction ?? "payment_out";

  if (input.bookingMode === "accrue_then_settle") {
    const { counterSide } = accrualSides(direction);
    const counterLabel = formatAccountLabel(input.counterAccount, COUNTER_FALLBACK);
    const personalLabel = formatAccountLabel(input.personalAccount, PERSONAL_FALLBACK);
    const posting: PreviewPosting =
      counterSide === "debit"
        ? {
            debit: counterLabel,
            credit: personalLabel,
            amount: input.amount,
            taxKey: input.taxKey,
            accounts: { debit: input.counterAccount, credit: input.personalAccount },
          }
        : {
            debit: personalLabel,
            credit: counterLabel,
            amount: input.amount,
            taxKey: input.taxKey,
            accounts: { debit: input.personalAccount, credit: input.counterAccount },
          };
    return {
      postings: [posting],
      automatic: true,
      note: `Zahlung später: ${personalLabel} ⇄ ${bankLabel}`,
    };
  }

  // book_on_payment
  if (input.lines && input.lines.length > 0) {
    const postings = input.lines.map((line) =>
      counterVsBank(
        direction,
        formatAccountLabel(
          { accountNumber: line.accountNumber, accountName: line.accountName },
          line.accountNumber,
        ),
        bankLabel,
        line.amount,
        line.taxKey,
        { accountNumber: line.accountNumber, accountName: line.accountName },
        input.bankAccount,
      ),
    );
    return { postings, automatic: true, note: null };
  }

  const counterLabel = formatAccountLabel(input.counterAccount, COUNTER_FALLBACK);
  return {
    postings: [
      counterVsBank(
        direction,
        counterLabel,
        bankLabel,
        input.amount,
        input.taxKey,
        input.counterAccount,
        input.bankAccount,
      ),
    ],
    automatic: true,
    note: null,
  };
}

/**
 * „Modus prüfen?"-Heuristik (F40 Konzept §4): eine aus dem DATEV-Import
 * (``datev-wk:*``) als ``book_on_payment`` angelegte Regel, die aber ein
 * Personenkonto trägt — starkes Signal für eine eigentlich als Sollstellung
 * gemeinte Vorlage, die still auf den Zahlungs-Default fiel. Reine Ableitung.
 *
 * Bis 2026-09-08 stand hier ``datev-wkb``, der Import schreibt aber
 * ``datev-wk:<Belegnummer>`` (F91-Konvention). Die Warnung konnte damit nie
 * erscheinen — auf keiner der 29 importierten Regeln des Bestands (L-244).
 * Der Doppelpunkt gehört zur Prüfung: ohne ihn nähme sie jedes Präfix mit,
 * das so anfängt.
 */
export function needsModeReview(input: {
  bookingMode: RuleBookingMode;
  importReference: string | null;
  personalAccountNumber: string | null;
}): boolean {
  return (
    input.bookingMode === "book_on_payment" &&
    (input.importReference?.startsWith("datev-wk:") ?? false) &&
    input.personalAccountNumber != null
  );
}
