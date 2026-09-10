import type { ReactNode } from "react";

import { resolveStatus } from "@/ludwig/ui/status/status-registry";
import type { AccountFactsVM } from "@/ui/v3/entities/account/Account";
import { EntityIcon } from "@/ui/v3/Icons";
import { Amount } from "@/ui/v3/primitives/Amount";
import { Tabs } from "@/ui/v3/primitives/Nav";
import { RecordPager } from "@/ui/v3/primitives/RecordPager";
import { TextButton } from "@/ui/v3/primitives/TextButton";
import { DetailView } from "@/ui/v3/patterns/DetailView";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";

import { ACCOUNT_TABS, balanceWord, type AccountMaster } from "./fixtures";

/** Above this the name is cut in the head, the full one in its `title` (p90 39, max 50). */
const NAME_MAX = 40;

/**
 * The frame of every 0157 scenario: `DetailView` for the rows — pager, head,
 * signal, tabs, body (F198 §2). `LedgerAccountView` (0063) is the older frame
 * of the same page; it has no signal slot and puts figures and chart above
 * the tabs, where the brief wants them inside the overview.
 *
 * Not a set component: the page belongs to the app. This keeps the scenarios
 * comparable.
 */
export function AccountPage({
  facts,
  master,
  tab = "overview",
  tabHref,
  partnerHref = null,
  signal = null,
  actions = null,
  loading = false,
  position = 12,
  total = 316,
  children,
}: {
  facts: AccountFactsVM;
  master: AccountMaster;
  tab?: string;
  tabHref: (key: string) => string;
  /** Personal account: the way to the partner drawer. */
  partnerHref?: string | null;
  /** **One** signal for the whole record, or none. */
  signal?: ReactNode;
  actions?: ReactNode;
  /** Only the number is known — it came with the address. */
  loading?: boolean;
  position?: number;
  total?: number;
  children: ReactNode;
}) {
  const name = facts.accountName ?? "";
  const cut = name.length > NAME_MAX ? `${name.slice(0, NAME_MAX - 1)}…` : name;
  const word = balanceWord(facts, master);
  const clearing = master.clearingAccountType
    ? resolveStatus("verrechnungskonto", master.clearingAccountType).label
    : null;

  return (
    <DetailView
      pager={
        <RecordPager
          position={position}
          total={total}
          label="Konto"
          back={{ href: "#accounts", label: "Konten · bebucht" }}
          prevHref="#previous"
          nextHref="#next"
        />
      }
      header={
        <EntityHeader
          icon={<EntityIcon entity="ledger-account" />}
          overline={`Konto · Wirtschaftsjahr ${facts.fiscalYear}`}
          // Number **and** name, always (R20); the number is the logical DATEV
          // number, a string, never a figure.
          title={
            <>
              <span className="v2mono">{facts.accountNumber}</span>
              {loading ? null : (
                <>
                  {" "}
                  <span {...(cut !== name ? { title: name } : {})}>{cut}</span>
                </>
              )}
            </>
          }
          {...(loading
            ? {}
            : {
                // **One** state: the kind of account. Class, clearing type and
                // partner are places in the frame, not colours (0063, D6).
                status: <StatusBadge axis="konto_typ" status={facts.accountingRole ?? ""} info={false} />,
                meta: (
                  <>
                    {facts.skrClassLabel ? <span>{facts.skrClassLabel}</span> : null}
                    {clearing ? <span>{clearing}</span> : null}
                    {facts.partnerName && partnerHref ? (
                      <span>
                        <TextButton href={partnerHref}>{facts.partnerName}</TextButton>
                      </span>
                    ) : null}
                  </>
                ),
                // No empty metric (D7): without a mirror balance the delta leads (K7).
                metric:
                  facts.datevBalance !== null
                    ? {
                        label: word ? `Saldo in DATEV · ${word}` : "Saldo in DATEV",
                        value: <Amount value={facts.datevBalance} currency={facts.currency} />,
                      }
                    : {
                        label: "Nur in Ludwig",
                        value: <Amount value={facts.ludwigOnlyAmount} currency={facts.currency} />,
                      },
              })}
          {...(actions && !loading ? { actions } : {})}
        />
      }
      {...(signal ? { signal } : {})}
      tabs={
        <Tabs
          items={ACCOUNT_TABS.map((t) => ({ ...t, href: tabHref(t.key) }))}
          active={tab}
          ariaLabel="Konto"
        />
      }
    >
      {children}
    </DetailView>
  );
}
