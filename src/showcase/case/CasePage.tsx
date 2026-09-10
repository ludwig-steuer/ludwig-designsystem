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
 * Der Rahmen jedes Szenarios von 0152 — und der erste Aufrufer, der beides
 * zusammensetzt, was heute entstanden ist: `DetailView` für die **Zeilen**,
 * `Columns` für die **Spalten** des Reiterrumpfs.
 *
 * Genau die Ordnung, die F196 §2 und §5a verlangen: Kopf · Signal · Reiter ·
 * Inhalt, und der Inhalt ist immer eines der vier Spaltenmuster. Die Übersicht
 * ist `list | detail | sidebar` — Strang, Arbeitsfläche, Notizen.
 *
 * Er ist keine Komponente des Sets: er lebt in `showcase/`, weil er die Seite
 * ist, und die Seite gehört der App. Was er hier tut, ist die Szenarien
 * vergleichbar halten.
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
  /** **Ein** nächster Schritt oder keiner — er entfällt, wenn der Fall auf jemand anderen wartet. */
  signal?: ReactNode;
  actions?: ReactNode;
  /** Spalte 1: der Strang. Er fällt **nie** weg (F196 §5). */
  timeline?: ReactNode;
  /** Spalte 3: Zusammenfassung, Notizen, Rückfragen — lesend. */
  notes?: ReactNode;
  position?: number;
  total?: number;
  /** Spalte 2: die Arbeitsfläche. */
  children: ReactNode;
}) {
  // Der Anzeigename kommt aus der Domäne, nicht aus einer Regel hier:
  // Titel, sonst „<Art>: <Gegenpart>", sonst die Art allein (L-52).
  const title = caseDisplayTitle({
    title: accountingCase.title ?? null,
    kind: accountingCase.kind ?? null,
    counterpartyName: accountingCase.counterpartyName ?? null,
  });
  // Die Art ist **keine** Achse — sie ist eine Eigenschaft, und ihr Wort steht
  // in der Domäne (`CASE_KIND_LABEL`), nicht in der Status-Registry.
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
          // **Ein** führender Zustand: die Achse `sachverhalt`. Wer am Zug ist
          // (`disposition`) steht als Wort in der Meta-Zeile — zwei Marken für
          // zwei Fragen, nicht zwei Marken für eine (D6/D7).
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
          // Keine leere Kennzahl (D7): ohne Betrag steht hier nichts, nicht
          // „— €".
          {...(accountingCase.totalAmount
            ? {
                metric: {
                  label: "Betrag",
                  // `CaseDetail.currency` ist ein `string`, `Amount` will die
                  // vier Währungen des Hauses — die Enge ist richtig, und der
                  // Aufrufer ist die Stelle, die sie herstellt.
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
          items={FALL_TABS.map((t) => ({ ...t, href: tabHref(t.key) }))}
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
