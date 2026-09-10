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
  modeHref?: { simple: string; full: string };
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
  mode = "simple",
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
  const full = mode === "full";
  const total = documentSideTotal(rows, documentSide);
  const rest = documentAmount == null ? null : documentAmount - total;
  const lines = journalLines(rows, contraAccount, documentSide, accountFramework);

  return (
    <div className="bse">
      <div className="bse__head">
        <span className="bse__doc">
          {documentNumber ? `Beleg ${documentNumber}` : "Ohne Belegnummer"}
          {documentAmount == null ? "" : ` · ${euro(documentAmount)}`}
        </span>
        <StatusBadge axis="buchung" status={status} info={false} />
        <span className="bse__head-end">
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
            <Link className="v2link" href={full ? modeHref.simple : modeHref.full}>
              {full ? "Einfach ◂" : "Voll ▸"}
            </Link>
          ) : null}
        </span>
      </div>

      {/* Über dem Raster, wie die Spec es sagt: der Satz beginnt mit der
          Gegenseite, die Zeilen darunter sind ihre Aufteilung. Und als
          **eine** Gruppe, nicht als vier Spans in einem `space-between` —
          sonst zerfallen sie über die ganze Breite (Wiederabnahme 0113, M4).
          Die Seite steht dabei, wie im Editor: sie ist die Gegenseite des
          Belegs, nicht wählbar. */}
      {contraAccount ? (
        <div className="bse__contra">
          <span className="bse__contra__label">
            <span className="v2muted">Gegenkonto</span> an{" "}
            {documentSide === "S" ? "H" : "S"}{" "}
            <span className="v2mono">{contraAccount.account}</span>
            <span className="v2muted">{contraAccount.name}</span>
            {contraAccount.tag ? <span className="bse__tag">{contraAccount.tag}</span> : null}
          </span>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="v2muted bse__empty">Keine Buchungszeilen.</p>
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
            {/* Belegfeld 1 steht **vor** dem Buchungstext — die Ordnung des
                DATEV-Stapels, und dieselbe, die der Editor führt. Das Raster
                hatte sie getauscht (Wiederabnahme 0113, M5). */}
            {full ? null : <span className="v2mono">Beleg 1</span>}
            <span>Text</span>
            {full ? <span>KOST</span> : null}
          </div>
          {rows.map((row) => (
            <Row key={row.id} row={row} full={full} onOpenLedger={onOpenLedger} />
          ))}
        </div>
      )}

      <Messages messages={messages} />

      {journal ? (
        <div className="bse__journal">
          {/* A `<details>`, not React state: the fold works without JavaScript,
              and this component stays a server component (0113). */}
          <Disclosure summary={`Journal (wird gespeichert) — ${journalBalanceText(lines)}`}>
            <JournalEntryCard
              lines={lines.map((l) => ({
                side: l.side === "S" ? ("debit" as const) : ("credit" as const),
                accountNumber: l.account,
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
    <span className="bse__account-cell">
      <span className="v2mono">{row.account}</span>
      {row.accountName ? <span className="v2muted bse__account-name">{row.accountName}</span> : null}
      {onOpenLedger ? (
        // `IconButton`, not a bare button with a class of its own: the
        // building block brings the hit area, the hover answer and the focus
        // ring with it — the invented `.v2iconbtn` was in no stylesheet and
        // left a 14-px sign without an answer (acceptance 0113).
        <IconButton
          size="sm"
          label={`Kontenblatt zu ${row.account}`}
          icon={<ActionIcon action="ledger" size={14} />}
          onClick={() => onOpenLedger(row.account)}
        />
      ) : null}
    </span>
  );

  return (
    <div className="bse__row">
      <div className="bse__cells" role="row">
        <span>{row.datum}</span>
        {full ? <span className="v2muted">{row.currency ?? "EUR"}</span> : null}
        <span className="v2num">{euro(rowAmount(row.amount))}</span>
        <span>{row.side}</span>
        <span>{row.bu || <span className="v2muted">—</span>}</span>
        {full ? account : null}
        {full ? <span className="v2mono">{row.externalDocumentNumber}</span> : account}
        {full ? <span className="v2mono">{row.externalDocumentNumber2 ?? ""}</span> : null}
        {full ? null : <span className="v2mono">{row.externalDocumentNumber}</span>}
        <span className="v2trunc" title={row.text}>
          {row.text}
        </span>
        {full ? <span className="v2muted">{row.costCenter1 ?? ""}</span> : null}
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
