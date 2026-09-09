import type { ReactNode } from "react";

import type { SourceDocumentVM } from "@/ui/v3/entities/source-document/SourceDocument";
import { SourceDocumentView } from "@/ui/v3/entities/source-document/SourceDocumentView";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { StatusBadge } from "@/ui/v3/patterns/StatusBadge";
import { EntityIcon } from "@/ui/v3/Icons";
import { Tabs } from "@/ui/v3/primitives/Nav";
import { RecordPager } from "@/ui/v3/primitives/RecordPager";

import { BELEGART, BELEG_TABS, BELEG_TABS_OHNE_RECHNUNG, listHref, tabHref } from "./fixtures";

/**
 * The frame every scenario of 0144 is drawn in — pager, head, signal, tabs,
 * body, exactly the slot row of the standard.
 *
 * It is **not** a component of the set: it lives in `showcase/` because it is
 * the page, and the page belongs to the app. What it does here is keep the
 * nineteen stories comparable — a difference between two of them is then a
 * difference in the document, never in how somebody happened to assemble the
 * frame.
 */
export function BelegSeite({
  document,
  signal,
  tab = "uebersicht",
  actions,
  position = 3,
  total = 117,
  back = "Belege",
  children,
}: {
  document: SourceDocumentVM;
  /** **Exactly one** banner, or none. The priority is decided by the page. */
  signal?: ReactNode;
  tab?: string;
  actions?: ReactNode;
  position?: number;
  total?: number;
  back?: string;
  children: ReactNode;
}) {
  // Bei `other` gewinnt die Belegform — dort stehen Sammelbeleg, Mahnung und
  // alles andere, was der DB-CHECK kennt und die TypeScript-Union nicht.
  const schluessel =
    document.sourceDocType && document.sourceDocType !== "other"
      ? document.sourceDocType
      : (document.classDocumentForm ?? "other");
  const art = BELEGART[schluessel] ?? "Beleg";
  // Rank 1: the counterparty names the document; without one the kind does.
  // The file name is the last fallback and stands in the facts, not here.
  const titel = document.counterparty ?? art;
  // Positions and input tax only exist where there is an invoice row.
  const tabs = document.hasInvoiceRow ? BELEG_TABS : BELEG_TABS_OHNE_RECHNUNG;

  return (
    <SourceDocumentView
      pager={
        <RecordPager
          position={position}
          total={total}
          label="Beleg"
          back={{ href: listHref, label: `← ${back}` }}
          prevHref="?beleg=vorher"
          nextHref="?beleg=nachher"
        />
      }
      header={
        <EntityHeader
          icon={<EntityIcon entity="source-document" />}
          overline={art}
          title={titel}
          // **One** state — the one every kind of document carries. The
          // processing belongs to the invoice row and never to the head.
          status={
            <StatusBadge
              axis="beleg_erledigung"
              status={document.completedVia ?? (document.completedAt ? "completed" : "open")}
            />
          }
          {...(actions ? { actions } : {})}
        />
      }
      {...(signal ? { banner: signal } : {})}
      tabs={<Tabs items={tabs.map((t) => ({ ...t, href: tabHref(t.key) }))} active={tab} ariaLabel="Beleg" />}
    >
      {children}
    </SourceDocumentView>
  );
}
