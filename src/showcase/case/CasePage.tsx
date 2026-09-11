import type { ReactNode } from "react";

import type { Currency } from "@/ludwig/shared/money";
import type { CaseFactsVM } from "@/ui/v3/entities/accounting-case/CaseFacts";
import { caseDisplayTitle, caseKindLabel } from "@/ludwig/modules/accounting-cases/domain/case";

import { EntityIcon } from "@/ui/v3/Icons";
import { Amount } from "@/ui/v3/primitives/Amount";
import { Tabs } from "@/ui/v3/primitives/Nav";
import { RecordPager } from "@/ui/v3/primitives/RecordPager";
import { Columns } from "@/ui/v3/patterns/Columns";
import { DetailView } from "@/ui/v3/patterns/DetailView";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { FALL_TABS, listHref, tabHref } from "./fixtures";

/**
 * The frame of every 0152 scenario: `DetailView` for the rows, `Columns` for
 * the tab body's columns — head · signal · tabs · body (F196 §2, §5a). The
 * overview is `list | detail | sidebar`: strand, workspace, notes.
 *
 * Not a set component: it lives in `showcase/` because the page belongs to
 * the app. It keeps the scenarios comparable.
 */
export function CasePage({
  accountingCase: accountingCase,
  tab = "uebersicht",
  signal,
  actions,
  timeline: timeline,
  notes: notes,
  position = 3,
  total = 117,
  children,
}: {
  accountingCase: CaseFactsVM;
  tab?: string;
  /** **One** next step or none — omitted when the case waits on someone else. */
  signal?: ReactNode;
  actions?: ReactNode;
  /** Column 1: the strand. It **never** disappears (F196 §5). */
  timeline?: ReactNode;
  /** Spalte 3: Zusammenfassung, Notizen, Rückfragen — lesend. */
  notes?: ReactNode;
  position?: number;
  total?: number;
  /** Column 2: the workspace. */
  children: ReactNode;
}) {
  // The display name comes from the domain: title, else "<kind>: <counterparty>",
  // else the kind alone (L-52).
  const title = caseDisplayTitle({
    title: accountingCase.title ?? null,
    kind: accountingCase.kind ?? null,
    counterpartyName: accountingCase.counterpartyName ?? null,
  });
  // The kind is **no** axis but a property; its word lives in the domain
  // (`CASE_KIND_LABEL`), not in the status registry.
  const art = accountingCase.kind ? caseKindLabel(accountingCase.kind) : null;

  return (
    <DetailView
      pager={
        <RecordPager
          position={position}
          total={total}
          label="Sachverhalt"
          back={{ href: listHref, label: "Sachverhalte · laufend" }}
          prevHref="?fall=vorher"
          nextHref="?fall=nachher"
        />
      }
      header={
        <EntityHeader
          icon={<EntityIcon entity="accounting-case" />}
          overline={accountingCase.caseNumber ? `Sachverhalt · ${accountingCase.caseNumber}` : "Sachverhalt"}
          title={title}
          // **One** leading state: the `sachverhalt` axis. Who is on turn
          // (`disposition`) is a word in the meta line — two marks for two
          // questions, not two for one (D6/D7).
          status={<StatusBadge axis="sachverhalt" status={accountingCase.lifecycleStatus} />}
          meta={
            <>
              {accountingCase.disposition ? (
                <span>{resolveStatus("disposition", accountingCase.disposition).label}</span>
              ) : null}
              {art ? <span>{art}</span> : null}
              {accountingCase.fiscalYear ? <span>WJ {accountingCase.fiscalYear}</span> : null}
            </>
          }
          // No empty metric (D7): without an amount nothing stands here, not "— €".
          {...(accountingCase.totalAmount
            ? {
                metric: {
                  label: "Betrag",
                  // `CaseDetail.currency` is a `string`, `Amount` wants the four house
                  // currencies — the narrowing is right, and the caller does it.
                  value: (
                    <Amount
                      value={accountingCase.totalAmount}
                      currency={(accountingCase.currency as Currency | null) ?? null}
                    />
                  ),
                },
              }
            : {})}
          {...(actions ? { actions } : {})}
        />
      }
      {...(signal ? { signal } : {})}
      tabs={
        <Tabs
          items={FALL_TABS.filter((t) => t.key !== "regelwerk" || accountingCase.kind === "recurring_charge").map(
            (t) => ({ ...t, href: tabHref(t.key) }),
          )}
          active={tab}
          ariaLabel="Sachverhalt"
        />
      }
    >
      {timeline ? (
        <Columns
          pattern="list-detail-aside"
          list={timeline}
          main={children}
          {...(notes ? { aside: notes } : {})}
        />
      ) : (
        children
      )}
    </DetailView>
  );
}
