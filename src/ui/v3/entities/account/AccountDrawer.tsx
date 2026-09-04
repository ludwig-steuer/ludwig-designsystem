"use client";

import type { ReactNode } from "react";

import { Banner } from "../../primitives/Banner";
import { Button } from "../../primitives/Button";
import { Drawer } from "../../primitives/Drawer";
import { EmptyState } from "../../primitives/EmptyState";
import { Segmented } from "../../primitives/Nav";
import { Select } from "../../primitives/Form";
import { Skeleton } from "../../primitives/Skeleton";
import { AccountFacts, type AccountFactsVM } from "./Account";
import { AccountEntryList, type AccountEntry } from "./AccountEntries";

/**
 * Looking up an account without leaving the work (0068).
 *
 * The bookkeeper is posting a document and the agent suggests `6815`. Before
 * she takes it, she wants one question answered — **what else is on this
 * account?** — and her half-typed row has to still be there afterwards.
 *
 * Zones after 0052: 1 head · 3 facts · 3b movements · 4 limit · 5 footer.
 * Zone 2 (the original) falls away without replacement and without a
 * placeholder: an account has no PDF, no statement line, no raw record.
 *
 * The year switch sits in the **head**, because A10 keeps the footer for the
 * one way into the full view — and it only acts inside the drawer: the page
 * behind it keeps its year, its filter and its scroll position.
 */

/** Above this many years the segmented control turns into a select. */
const SEGMENTED_MAX = 4;

/**
 * @when    An account looked up from inside other work — from a booking line, a contra account, the ledger icon of AccountField.
 * @instead Everything about the account, editable, with monthly figures → AccountView. Just naming it → AccountCell. A preview on hover → HoverCard with AccountFacts.
 */
export function AccountDrawer({
  open,
  onClose,
  accountNumber,
  facts,
  entries,
  total,
  onShowMore,
  year,
  years,
  onYearChange,
  onOpenFull,
  accountHref,
  loading,
  error,
}: {
  open: boolean;
  /** Escape, scrim, cross — all three report the same (0042). */
  onClose: () => void;
  /** Carries the title even while loading — the number is the one thing the caller always knows. */
  accountNumber: string;
  /** Zone 3. `null` while loading, or when the account does not exist in this year. */
  facts: AccountFactsVM | null;
  /** Zone 3b — already unioned and sorted, newest first. */
  entries: readonly AccountEntry[];
  total?: number;
  onShowMore?: () => void;
  year: number;
  /** One element → no switch; the year stands as text in the meta line. */
  years: readonly number[];
  /** Acts **inside the drawer only** (Owner 2026-09-04). */
  onYearChange: (year: number) => void;
  /** Zone 5. Not optional: a drawer without this way is unfinished (A10). */
  onOpenFull: () => void;
  accountHref?: (number: string) => string;
  loading?: boolean;
  error?: string;
}) {
  const notFound = !loading && !error && facts === null;
  const switchable = years.length > 1;

  // The meta node does **not** branch on `loading`: zone 1 carries the year
  // switch in every state, so the head does not jump and the switch stays
  // reachable while the wrong year is still loading — it is the way out of it
  // (recommendation from the second acceptance pass).
  const meta: ReactNode = (
    <span className="v2acc__meta">
      <span>
        {/* Identity only. The numbers live in zone 3 — saying them twice is
            what the first browser pass caught. */}
        {/* No year in the fallback: it is already next to it — as the switch,
            or as plain text when there is only one year. */}
        {facts ? (facts.accountName ?? "ohne Bezeichnung") : "Konto-Auszug"}
      </span>
      {switchable ? (
        <span className="v2acc__yearpick">
          {years.length <= SEGMENTED_MAX ? (
            <Segmented
              options={years.map((y) => ({ key: String(y), label: String(y) }))}
              active={String(year)}
              ariaLabel="Wirtschaftsjahr"
              onPick={(k) => onYearChange(Number(k))}
            />
          ) : (
            <Select
              aria-label="Wirtschaftsjahr"
              value={String(year)}
              onChange={(e) => onYearChange(Number(e.target.value))}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
          )}
        </span>
      ) : (
        <span className="v2muted">{year}</span>
      )}
    </span>
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Konto ${accountNumber}`}
      meta={meta}
      ariaLabel={`Konto ${accountNumber}`}
      size="lg"
      footer={
        // Empty in four of five states; `.v2drawer__foot:empty` then removes
        // itself (0042). A10 asks for the way where there is something to
        // open — not for a dead button over an error message.
        loading || error || notFound ? null : (
          <Button variant="secondary" size="sm" onClick={onOpenFull}>
            Volles Konto öffnen
          </Button>
        )
      }
    >
      {loading ? (
        // The loading surface has the shape of the content: one block for the
        // facts, rows for the movements — not one box over everything (0052 M2).
        <div className="v2acc__load">
          <Skeleton lines={7} />
          <AccountEntryList entries={[]} currency="EUR" loading />
        </div>
      ) : error ? (
        <Banner tone="danger" title="Konto-Auszug konnte nicht geladen werden.">
          {error} (Konto {accountNumber}, Wirtschaftsjahr {year})
        </Banner>
      ) : notFound ? (
        <EmptyState
          inline
          title={`Das Konto ${accountNumber} gibt es im Wirtschaftsjahr ${year} nicht.`}
          description={
            <>
              Der Kontenplan liegt je Wirtschaftsjahr als eigene Vollkopie vor. Wählen Sie
              oben ein anderes Jahr.
            </>
          }
        />
      ) : (
        <>
          <AccountFacts facts={facts!} />
          <AccountEntryList
            entries={entries}
            currency={facts!.currency}
            total={total}
            accountHref={accountHref}
            empty={{
              title: `Auf diesem Konto ist im Wirtschaftsjahr ${year} nichts gebucht.`,
            }}
            more={
              onShowMore ? (
                <Button size="sm" variant="secondary" onClick={onShowMore}>
                  Mehr laden
                </Button>
              ) : undefined
            }
          />
          {/* Zone 4 — one sentence on what the quick look does not answer. */}
          <p className="v2sub v2acc__limit">
            Kontenrahmen, Steuerautomatik und die Monatsübersicht stehen in der
            vollständigen Kontoansicht.
          </p>
        </>
      )}
    </Drawer>
  );
}
