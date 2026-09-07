import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { ActionIcon } from "../../Icons";
import { Disclosure } from "../../primitives/Disclosure";
import { IconButton } from "../../primitives/IconButton";
import { StatusBadge } from "../../patterns/StatusBadge";
import { JournalEntryCard } from "./JournalEntryCompact";
import { formatAmount } from "../../format";
import {
  documentSideTotal,
  journalBalanceText,
  journalGridTracks,
  journalLines,
  rowAmount,
  type ContraAccount,
  type JournalMode,
  type JournalRow,
  type JournalStatus,
  type Side,
} from "./journal-entry";

const euro = (n: number) => formatAmount(n, "EUR");

export interface JournalGridMessage {
  code: string;
  message: string;
}

export interface JournalEntryGridProps {
  rows: readonly JournalRow[];
  status: JournalStatus;
  mode?: JournalMode;
  /** The two addresses of the switch. Without it there is no switch. */
  modeHref?: { einfach: string; voll: string };
  contraAccount?: ContraAccount | null;
  documentNumber?: string | null;
  documentAmount?: number | null;
  documentSide?: Side;
  /** Shows the fold „Journal (wird gespeichert)" with the batch lines. */
  journal?: boolean;
  accountFramework?: string | null;
  /** The way into the ledger, per row. Without it the rows carry no link. */
  onOpenLedger?: (accountNumber: string) => void;
  messages?: {
    errors?: readonly JournalGridMessage[];
    warnings?: readonly JournalGridMessage[];
    hints?: readonly JournalGridMessage[];
  };
}

/**
 * A posted entry, read — the columns of the DATEV batch, the balance, and on
 * request the journal that will be saved.
 *
 * **It takes nothing.** No field, no save, no reversal, no quick action: that
 * is `JournalEntryEditor`. The two do not share their markup, because a field
 * differs from a value in every cell; they share the data (`journal-entry.ts`)
 * and the order of the columns, which is what makes the two pictures one
 * entry.
 *
 * It holds **no state**: the mode switch is a link (`modeHref`), the journal
 * fold is a `<details>`. That is the whole point of the split (0113) — the
 * reading half of this family does not need `"use client"`.
 *
 * @when    Showing an entry that is already booked, or one nobody may change.
 * @instead Changing it → JournalEntryEditor. The lines alone, without head
 *          and columns → JournalEntryCard.
 */
export function JournalEntryGrid({
  rows,
  status,
  mode = "einfach",
  modeHref,
  contraAccount = null,
  documentNumber,
  documentAmount,
  documentSide = "S",
  journal = false,
  accountFramework,
  onOpenLedger,
  messages,
}: JournalEntryGridProps) {
  const full = mode === "voll";
  const total = documentSideTotal(rows, documentSide);
  const rest = documentAmount == null ? null : documentAmount - total;
  const lines = journalLines(rows, contraAccount, documentSide, accountFramework);

  return (
    <div className="bse">
      <div className="bse__kopf">
        <span className="bse__beleg">
          {documentNumber ? `Beleg ${documentNumber}` : "Ohne Belegnummer"}
          {documentAmount == null ? "" : ` · ${euro(documentAmount)}`}
        </span>
        <StatusBadge axis="buchung" status={status} info={false} />
        <span className="bse__kopfrechts">
          {rest !== null && (full || Math.abs(rest) >= 0.005) ? (
            <span className={`bse__rest${Math.abs(rest) < 0.005 ? " is-ok" : " is-off"}`}>
              Rest {euro(rest)}
              {Math.abs(rest) < 0.005 ? " ✓" : ""}
            </span>
          ) : null}
          {/* A link, not a button: the mode is a property of the address, and
              that is what keeps this component free of state. Without the two
              addresses there is no switch — and no printed key either, which
              is the case V14 forbids (0015 M5). */}
          {modeHref ? (
            <Link className="v2link" href={full ? modeHref.einfach : modeHref.voll}>
              {full ? "Einfach ◂" : "Voll ▸"}
            </Link>
          ) : null}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="v2muted bse__leer">Keine Buchungszeilen.</p>
      ) : (
        <div className="bse__tbl" style={{ "--bse-cols": journalGridTracks[mode] } as CSSProperties}>
          <div className="bse__head" role="row">
            <span>Datum</span>
            {full ? <span>Whg.</span> : null}
            <span className="v2num">Umsatz</span>
            <span>S/H</span>
            <span>BU</span>
            {full ? <span>Konto</span> : null}
            <span>{full ? "Beleg 1" : "Konto"}</span>
            {full ? <span>Beleg 2</span> : null}
            <span>Text</span>
            {full ? <span>KOST</span> : null}
            {full ? null : <span className="v2num">Beleg 1</span>}
          </div>
          {rows.map((row) => (
            <Row key={row.id} row={row} full={full} onOpenLedger={onOpenLedger} />
          ))}
        </div>
      )}

      {contraAccount ? (
        <div className="bse__gegen">
          <span className="v2muted">Gegenkonto</span>
          <span className="v2mono">{contraAccount.konto}</span>
          <span>{contraAccount.name}</span>
          {contraAccount.tag ? <span className="v2muted">{contraAccount.tag}</span> : null}
        </div>
      ) : null}

      <Messages messages={messages} />

      {journal ? (
        <div className="bse__journal">
          {/* A `<details>`, not React state: the fold works without JavaScript,
              and this component stays a server component (0113). */}
          <Disclosure summary={`Journal (wird gespeichert) — ${journalBalanceText(lines)}`}>
            <JournalEntryCard
              lines={lines.map((l) => ({
                side: l.side === "S" ? ("debit" as const) : ("credit" as const),
                accountNumber: l.konto,
                accountName: l.name,
                text: l.text,
                amount: l.amount,
              }))}
              currency="EUR"
              totals={false}
            />
          </Disclosure>
        </div>
      ) : null}
    </div>
  );
}

/** One line, read. Every cell is a value; none of them takes anything. */
function Row({
  row,
  full,
  onOpenLedger,
}: {
  row: JournalRow;
  full: boolean;
  onOpenLedger?: (accountNumber: string) => void;
}) {
  const account = (
    <span className="bse__kontocell">
      <span className="v2mono">{row.konto}</span>
      {row.kontoName ? <span className="v2muted bse__kontoname">{row.kontoName}</span> : null}
      {onOpenLedger ? (
        // `IconButton`, kein blanker Knopf mit eigener Klasse: der Baustein
        // bringt Trefferfläche, Hover und Fokusring mit — die selbst
        // erfundene `.v2iconbtn` stand in keinem Stylesheet und ließ ein
        // 14-px-Zeichen ohne Antwort zurück (Abnahme 0113).
        <IconButton
          size="sm"
          label={`Kontenblatt zu ${row.konto}`}
          icon={<ActionIcon action="ledger" size={14} />}
          onClick={() => onOpenLedger(row.konto)}
        />
      ) : null}
    </span>
  );

  return (
    <div className="bse__row">
      <div className="bse__cells" role="row">
        <span>{row.datum}</span>
        {full ? <span className="v2muted">{row.currency ?? "EUR"}</span> : null}
        <span className="v2num">{euro(rowAmount(row.umsatz))}</span>
        <span>{row.side}</span>
        <span>{row.bu || <span className="v2muted">—</span>}</span>
        {full ? account : null}
        {full ? <span className="v2mono">{row.beleg1}</span> : account}
        {full ? <span className="v2mono">{row.beleg2 ?? ""}</span> : null}
        <span className="v2trunc" title={row.text}>
          {row.text}
        </span>
        {full ? <span className="v2muted">{row.kost1 ?? ""}</span> : null}
        {full ? null : <span className="v2mono v2num">{row.beleg1}</span>}
      </div>
    </div>
  );
}

/**
 * Errors, warnings and hints — the same three the editor shows, without the
 * fix button: there is nothing here to fix.
 */
function Messages({ messages }: { messages?: JournalEntryGridProps["messages"] }): ReactNode {
  const errors = messages?.errors ?? [];
  const warnings = messages?.warnings ?? [];
  const hints = messages?.hints ?? [];
  if (errors.length + warnings.length + hints.length === 0) return null;
  return (
    <div className="bse__msgs">
      {errors.map((e) => (
        <div className="v2msg v2msg--error" key={e.code} role="alert">
          <span className="v2msg__body">
            <span className="v2pp__code">{e.code}</span> {e.message}
          </span>
        </div>
      ))}
      {warnings.map((w) => (
        <div className="v2msg v2msg--warning" key={w.code}>
          <span className="v2msg__body">
            <span className="v2pp__code">{w.code}</span> {w.message}
          </span>
        </div>
      ))}
      {hints.map((h) => (
        <div className="v2msg v2msg--hint" key={h.code}>
          <span className="v2msg__body">{h.message}</span>
        </div>
      ))}
    </div>
  );
}
