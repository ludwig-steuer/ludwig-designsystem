import type { ReactNode } from "react";

import type { SourceDocumentVM } from "@/ui/v3/entities/source-document/SourceDocument";
import { SourceDocumentCompletion } from "@/ui/v3/entities/source-document/SourceDocument";
import { SourceDocumentView } from "@/ui/v3/entities/source-document/SourceDocumentView";
import { EntityHeader } from "@/ui/v3/patterns/EntityHeader";
import { EntityIcon } from "@/ui/v3/Icons";
import { Tabs } from "@/ui/v3/primitives/Nav";
import { RecordPager } from "@/ui/v3/primitives/RecordPager";

import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";

import { BELEG_TABS, BELEG_TABS_OHNE_RECHNUNG, listHref, tabHref } from "./fixtures";

/**
 * The frame every scenario of 0144 is drawn in — pager, head, signal, tabs,
 * body, exactly the slot row of the standard.
 *
 * It is **not** a component of the set: it lives in `showcase/` because it is
 * the page, and the page belongs to the app. What it does here is keep the
 * the scenarios comparable — a difference between two of them is then a
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
  // Aus der Domäne, nicht aus einer Tabelle hier: `sourceDocTypeLabel` kennt
  // den Rückfall auf die Belegform bei `other` und wird von
  // `SourceDocumentCard` in derselben Story ohnehin benutzt. Eine zweite
  // Wortliste wäre eine zweite Wahrheit — und war schon eine: der Kopf sagte
  // „Sammelbeleg", die Karte darunter „Sammel-PDF".
  const art = sourceDocTypeLabel(document.sourceDocType, document.classDocumentForm);
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
          // Kein „←" im Text: `RecordPager` zeichnet den Pfeil selbst, und
          // beides zusammen ergibt zwei.
          back={{ href: listHref, label: back }}
          prevHref="?beleg=vorher"
          nextHref="?beleg=nachher"
        />
      }
      header={
        <EntityHeader
          icon={<EntityIcon entity="source-document" />}
          overline={art}
          title={titel}
          // **Ein** Zustand, und er kommt aus `SourceDocumentCompletion` — der
          // Baustein, der diese Entscheidung schon trägt („must not be
          // answered twice"). Der Nachbau hier verlor den Grund im Tooltip und
          // das Datum, und genau die verlangt R9.
          status={<SourceDocumentCompletion document={document} />}
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
