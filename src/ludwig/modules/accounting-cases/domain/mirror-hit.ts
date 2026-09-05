import { acceptanceEqual } from "@/ludwig/core/datev/belegfeld";

/**
 * F139/#32 — was ein Spiegel-Treffer an den Buchungs-Gates bedeutet.
 *
 * Der Wächter (`findMirrorBookedEvents`) findet über Betrag und ein weites
 * Datumsfenster; das ist ein Join, kein Urteil. Bei Mandant 61015 warnte Gate
 * 3d damit in 26 von 36 Ereignissen „In DATEV bereits gebucht" — keine davon
 * war eine Dublette. Wer der Anweisung folgt, lässt den halben Monat unverbucht.
 *
 * Für Bank-Ereignisse ist der reine Betrags-Join strukturell blind: eine
 * Zahlung, die DATEV schon trägt, erkennt F63 (Zahlungskonto + Betrag + Seite,
 * ±5 Tage) und nimmt sie aus dem Arbeitsvorrat. Was hier ankommt, ist per
 * Konstruktion NICHT F63-gematcht — der ±45-Tage-Treffer ist dann die
 * Vorperiode derselben Reihe oder die Rechnungs-/Sollstellungsseite. Genau
 * diese Unterscheidung trifft `classifyMirrorHit`, und die Rechnungsseite wird
 * ein eigener Hinweis statt einer Duplikatswarnung: dort fehlt die Zahlung.
 *
 * Rein, ohne DB — damit die 27 belegten Fälle als Fixture laufen
 * (`__tests__/mirror-hit-classify.test.ts`).
 */

export interface MirrorHitLine {
  accountNumber: string;
  side: "debit" | "credit";
  amount: number;
  taxKey: string | null;
}

export interface MirrorHitCandidate {
  entryId: string;
  bookingDate: string;
  documentNumber: string | null;
  lineText: string | null;
  lines: MirrorHitLine[];
}

export type MirrorHitKind = "duplicate" | "invoice_side" | "discard";

/** Spiegel von `bank-match/application/cascade.ts:193` — dort bleibt die Quelle, hier der Wert für den Wächter. */
export const F63_MAX_DAYS = 5;

const dayDiff = (a: string, b: string): number =>
  Math.abs(Date.parse(`${a}T00:00:00Z`) - Date.parse(`${b}T00:00:00Z`)) / 86_400_000;

export function classifyMirrorHit(input: {
  event: {
    isBank: boolean;
    eventDate: string;
    invoiceNumber: string | null;
    paymentAccountNumber: string | null;
    bankSide: "debit" | "credit" | null;
    knownDocumentNumbers: string[];
  };
  hit: MirrorHitCandidate;
  paymentAccountNumbers: ReadonlySet<string>;
  personalAccountNumbers: ReadonlySet<string>;
}): MirrorHitKind {
  const { event, hit, paymentAccountNumbers, personalAccountNumbers } = input;
  if (hit.lines.length === 0) return "discard";

  const onPaymentAccount = hit.lines.some((l) => paymentAccountNumbers.has(l.accountNumber));
  const onPersonalAccount = hit.lines.some((l) => personalAccountNumbers.has(l.accountNumber));

  if (event.isBank) {
    // 1. Dieselbe Zahlung, die F63 gematcht hätte — Konto, Seite, Fenster.
    const paysSameSide = hit.lines.some(
      (l) =>
        event.paymentAccountNumber != null &&
        l.accountNumber === event.paymentAccountNumber &&
        event.bankSide != null &&
        l.side === event.bankSide,
    );
    if (paysSameSide && dayDiff(hit.bookingDate, event.eventDate) <= F63_MAX_DAYS) return "duplicate";
    // 2. Zahlungsbuchung einer anderen Periode — nicht dieses Ereignis.
    if (onPaymentAccount) return "discard";
    // 3. Rechnungs-/Sollstellungsseite, aber nur wenn das Belegfeld zum
    //    Sachverhalt gehört; ohne Registertreffer ist es die Rechnung einer
    //    anderen Periode.
    if (
      onPersonalAccount &&
      event.knownDocumentNumbers.some((n) => acceptanceEqual(n, hit.documentNumber))
    ) {
      return "invoice_side";
    }
    // 4. Reine Sachbuchung (z. B. 1741/1755).
    return "discard";
  }

  // Beleg-Ereignis: 1. eine andere Rechnung derselben Reihe. `0` ist DATEVs
  // Platzhalter für „kein Belegfeld" und widerlegt nichts.
  if (
    event.invoiceNumber &&
    hit.documentNumber &&
    hit.documentNumber !== "0" &&
    !acceptanceEqual(event.invoiceNumber, hit.documentNumber)
  ) {
    return "discard";
  }
  // 2. Reine Zahlungsbuchung — sie ist nicht die Buchung des Belegs.
  if (hit.lines.every((l) => paymentAccountNumbers.has(l.accountNumber) || personalAccountNumbers.has(l.accountNumber))) {
    return "discard";
  }
  // 3. Kartenbeleg ohne Nummer gegen 4964/1617 bleibt Treffer.
  return "duplicate";
}

/** `"4920 S 358,19 BU 490 / 1211 H 358,19"` — der vollständige Spiegelsatz im Gate-Text. */
export function formatMirrorLines(lines: MirrorHitLine[]): string {
  return lines
    .map(
      (l) =>
        `${l.accountNumber} ${l.side === "debit" ? "S" : "H"} ` +
        l.amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
        (l.taxKey ? ` BU ${l.taxKey}` : ""),
    )
    .join(" / ");
}

/**
 * Ein Treffer je Ereignis: Duplikat schlägt Rechnungsseite; innerhalb gleicher
 * Klasse zuerst das Belegfeld der Rechnungsnummer, dann der nähere Satz.
 */
export function pickMirrorHit(
  candidates: Array<{ candidate: MirrorHitCandidate; kind: MirrorHitKind }>,
  event: { eventDate: string; invoiceNumber: string | null },
): { candidate: MirrorHitCandidate; kind: "duplicate" | "invoice_side" } | null {
  const ranked = candidates
    .filter((c): c is { candidate: MirrorHitCandidate; kind: "duplicate" | "invoice_side" } => c.kind !== "discard")
    .map((c) => ({
      ...c,
      rank: c.kind === "duplicate" ? 0 : 1,
      numbered: acceptanceEqual(event.invoiceNumber, c.candidate.documentNumber) ? 0 : 1,
      delta: dayDiff(c.candidate.bookingDate, event.eventDate),
    }))
    .sort((a, b) => a.rank - b.rank || a.numbered - b.numbered || a.delta - b.delta);
  const best = ranked[0];
  return best ? { candidate: best.candidate, kind: best.kind } : null;
}
