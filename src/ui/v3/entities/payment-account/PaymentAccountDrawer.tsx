"use client";

import type { ReactNode } from "react";

import { PAYMENT_ACCOUNT_KIND_LABEL } from "@/ludwig/core/accounting/payment-account-kind";

import { Drawer, DrawerFullView } from "../../primitives/Drawer";
import { FieldList } from "../../primitives/FieldList";
import { IbanCell } from "../../primitives/Cells";
import { Skeleton } from "../../primitives/Skeleton";
import { AccountCell } from "../account/Account";
import type { BankTransactionRowData } from "../bank-transaction/bank-transaction";
import { BankTransactionExcerpt } from "../bank-transaction/BankTransactionExcerpt";
import type { PaymentAccountRowData } from "./payment-account";

/**
 * A payment account, looked up beside other work (0193, owner 2026-09-21):
 * what it is, and what happened on it lately — without leaving the page.
 *
 * The app had two neighbours and neither fits: the ledger drawer shows the
 * history of a **general ledger account**, the bank-line drawer **one line**.
 * This one shows the account: its head (kind, name, IBAN, ledger account) and
 * the **latest lines** of its statement as an excerpt — always the last ones
 * by posting date, a fixed number, booked or not (owner's decision). The
 * whole statement is one click away, and that click is the drawer's one exit.
 */

/** How many lines the drawer shows — about two weeks of a busy account. */
export const PAYMENT_ACCOUNT_DRAWER_LINES = 10;

/**
 * @when    A payment account is looked up beside other work — from a bank
 *          line, a case, a list of accounts.
 * @instead The whole statement → BankTransactionList on the account page. One
 *          line of it → BankTransactionDrawer. The history of a general ledger
 *          account → the ledger drawer. Naming the account → PaymentAccountCell.
 */
export function PaymentAccountDrawer({
  open,
  onClose,
  account,
  latest,
  statementHref,
  caseHref,
  rowHref,
  loading,
  error,
}: {
  open: boolean;
  onClose: () => void;
  /** `null` while loading or not found. */
  account: PaymentAccountRowData | null;
  /**
   * The latest lines, **newest first**, at most
   * `PAYMENT_ACCOUNT_DRAWER_LINES` — the caller loads them that way; the
   * drawer cuts what is longer rather than sorting.
   */
  latest: readonly BankTransactionRowData[];
  /** The whole statement of this account (`banks/[accountId]`). */
  statementHref: string;
  caseHref: (caseId: string) => string;
  /** Where a line leads — the drawer of that one payment. */
  rowHref?: (t: BankTransactionRowData) => string;
  loading?: boolean;
  error?: ReactNode;
}) {
  const kind = account?.kind ? PAYMENT_ACCOUNT_KIND_LABEL[account.kind] : null;
  const lines = latest.slice(0, PAYMENT_ACCOUNT_DRAWER_LINES);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      title={account?.displayName ?? "Zahlungskonto"}
      meta={kind ? <span>{kind}</span> : null}
      // One exit, with the owner's words — the excerpt below carries no
      // second link to the same place.
      footer={<DrawerFullView href={statementHref}>Gesamten Kontoauszug öffnen</DrawerFullView>}
    >
      {error ? (
        <p className="v2muted">{error}</p>
      ) : loading || !account ? (
        <Skeleton lines={6} label="Konto wird geladen …" />
      ) : (
        <div className="v2stack">
          <FieldList
            tone="bare"
            // The kind stands in the head already (`meta`) — not a second time here.
            rows={[
              ["IBAN", account.iban ? <IbanCell key="i" value={account.iban} /> : account.externalAccountId ?? "—"],
              [
                "Sachkonto",
                account.ledgerAccountNumber ? (
                  <AccountCell key="a" number={account.ledgerAccountNumber} name={account.ledgerAccountName ?? null} />
                ) : (
                  "keins hinterlegt"
                ),
              ],
            ]}
          />
          <BankTransactionExcerpt
            title="Letzte Zahlungen"
            sub={
              lines.length > 0
                ? `die ${lines.length === 1 ? "letzte" : `letzten ${lines.length}`} nach Buchungstag`
                : undefined
            }
            transactions={lines}
            caseHref={caseHref}
            {...(rowHref ? { rowHref } : {})}
            empty={{
              title: "Auf diesem Konto ist noch nichts gebucht worden.",
              hint: "Sobald ein Auszug importiert wird, stehen die Zahlungen hier.",
            }}
          />
        </div>
      )}
    </Drawer>
  );
}
