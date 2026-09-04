import type { Currency } from "@/ludwig/shared/money";

import { formatAmount } from "../../format";
import { AmountCell, MonoCell } from "../../primitives/Cells";

/**
 * Zelle und Karte eines Buchungssatzes (0044) — die Anzeige-Formen der
 * Familie, ohne den Editor.
 *
 * `JournalEntryEditor` deckt die volle Sicht ab (`editable={false}`) und
 * bringt Statuskopf, Meldungsblock, Beleg-Rest-Rechnung, Steuerassistenz und
 * die KI-Notizen mit. An einem Ereignis, einer Kreditor-Karte oder einer
 * Dauerbuchungs-Vorschau liest die Sachbearbeiterin davon nichts — sie will
 * wissen, **was gebucht wird**. Genau das steht hier: dieselben Zeilen,
 * dieselbe Spaltenordnung des DATEV-Stapels, fünf Blöcke weniger.
 *
 * Beide Exporte rechnen nicht (keine Steuerableitung, keine
 * Gegenkonto-Konsolidierung) und prüfen nichts. Der Aufrufer liefert die
 * Zeilen, die gespeichert würden.
 */

/**
 * Eine Zeile des Satzes. Strukturelle Teilmenge von `BookingLineVM` der App —
 * `BookingLineVM[]` passt ohne Mapping herein.
 */
export interface JournalLine {
  side: "debit" | "credit";
  accountNumber: string;
  accountName?: string | null;
  amount: number;
  /** Buchungstext der Zeile — Spalte 3 des Stapels. */
  text?: string | null;
}

/** Ab hier gilt ein Satz als unstimmig — ein halber Cent ist Rundung. */
const BALANCE_EPSILON = 0.005;

/** Longer names are cut with an ellipsis; the full one hangs in the `title`. */
const NAME_LIMIT = 40;

function sum(lines: readonly JournalLine[]): number {
  return lines.reduce((total, line) => total + line.amount, 0);
}

/** Number and name of an account, the name muted and cut. */
function AccountRef({ line, showName }: { line: JournalLine; showName: boolean }) {
  return (
    <>
      <MonoCell value={line.accountNumber} />
      {showName && line.accountName ? (
        <span className="v2muted" title={line.accountName.length > NAME_LIMIT ? line.accountName : undefined}>
          {" "}
          {line.accountName.length > NAME_LIMIT
            ? `${line.accountName.slice(0, NAME_LIMIT - 1)}…`
            : line.accountName}
        </span>
      ) : null}
    </>
  );
}

/**
 * @when    A booking entry named inside a foreign list or a sentence — debit, credit, amount, one line.
 * @instead All lines of the entry → JournalEntryCard. Editing or the full read-only view → JournalEntryEditor.
 */
export function JournalEntryCell({
  lines,
  currency,
  showNames = true,
}: {
  /** The lines of the entry, exactly as they would be stored. */
  lines: readonly JournalLine[];
  currency: Currency;
  /** Account name next to the number; `false` = numbers only, for narrow columns. */
  showNames?: boolean;
}) {
  // Empty renders the em dash like `AmountCell` does — the cell stands in
  // foreign markup and must not bring a box or a message of its own.
  if (lines.length === 0) return <span className="v2muted">—</span>;

  const debits = lines.filter((l) => l.side === "debit");
  const credits = lines.filter((l) => l.side === "credit");
  // The debit side carries the amount. A one-sided entry has none, and „0,00 €"
  // would be a statement — then the credit side stands in.
  const total = sum(debits) || sum(credits);

  const single = (side: readonly JournalLine[]) => (side.length === 1 ? side[0] : null);
  const debit = single(debits);
  const credit = single(credits);

  let body;
  if (debit && credit) {
    body = (
      <>
        <AccountRef line={debit} showName={showNames} /> an <AccountRef line={credit} showName={showNames} />
      </>
    );
  } else if (debit && credits.length > 1) {
    body = (
      <>
        <AccountRef line={debit} showName={showNames} /> an {credits.length} Konten
      </>
    );
  } else if (credit && debits.length > 1) {
    body = (
      <>
        {debits.length} Konten an <AccountRef line={credit} showName={showNames} />
      </>
    );
  } else {
    // Split on both sides, or one side missing entirely — counting is the only
    // honest summary left.
    body = <>{lines.length} Zeilen</>;
  }

  return (
    <span className="v2je__cell">
      {body} <span className="v2muted">·</span>{" "}
      <AmountCell value={total} currency={currency} />
    </span>
  );
}

/**
 * @when    What gets booked, shown next to another entity — event stack, creditor card, recurring rule preview.
 * @instead One line inside a foreign row → JournalEntryCell. Editing, messages, tax assistance → JournalEntryEditor.
 */
export function JournalEntryCard({
  lines,
  currency,
  caption,
  totals = true,
}: {
  lines: readonly JournalLine[];
  currency: Currency;
  /** Heading above the lines — posting text or „Buchungsvorschlag". */
  caption?: string;
  /** Σ debit / Σ credit below the lines; `false` when the caller already carries the sum. */
  totals?: boolean;
}) {
  const debit = sum(lines.filter((l) => l.side === "debit"));
  const credit = sum(lines.filter((l) => l.side === "credit"));
  const balanced = Math.abs(debit - credit) < BALANCE_EPSILON;

  return (
    <div className="v2je">
      {caption ? <div className="v2je__caption">{caption}</div> : null}
      {lines.length === 0 ? (
        // An excerpt, not a screen — no EmptyState with a button.
        <div className="v2muted v2je__empty">Keine Buchungszeilen.</div>
      ) : (
        <div className="v2je__body">
          <div className="v2je__row v2je__row--head">
            <span className="v2num">Konto</span>
            <span>Kontoname</span>
            <span>Buchungstext</span>
            <span className="v2num">Soll Umsatz</span>
            <span className="v2num">Haben Umsatz</span>
          </div>
          {lines.map((line, i) => (
            <div className="v2je__row" key={i}>
              <span className="v2num">{line.accountNumber}</span>
              <span className="v2muted v2je__clip" title={line.accountName ?? undefined}>
                {line.accountName ?? ""}
              </span>
              <span className="v2je__clip" title={line.text ?? undefined}>
                {line.text ?? ""}
              </span>
              <span className="v2num">
                {line.side === "debit" ? formatAmount(line.amount, currency) : ""}
              </span>
              <span className="v2num">
                {line.side === "credit" ? formatAmount(line.amount, currency) : ""}
              </span>
            </div>
          ))}
          {totals ? (
            <div className="v2je__row v2je__row--sum">
              <span />
              <span />
              {/* The only finding the card makes: it adds up what is there. */}
              <span>Σ Soll {balanced ? "=" : "≠"} Σ Haben</span>
              <span className="v2num">{formatAmount(debit, currency)}</span>
              <span className="v2num">{formatAmount(credit, currency)}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
