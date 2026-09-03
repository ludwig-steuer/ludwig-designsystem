"use client";

import { FileWarning, Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Drawer } from "../../primitives/Drawer";
import { EmptyState } from "../../primitives/EmptyState";
import { Skeleton } from "../../primitives/Skeleton";
import { StatusBadge } from "../../patterns/StatusBadge";
import { DocumentFacts, type DocumentFactsVM } from "./DocumentFacts";

/**
 * The document, looked up beside the work (0052).
 *
 * Somebody is checking a case and stumbles over a reference: „what did the
 * document look like?". The answer is a glance, not a journey — the list they
 * are standing in must not be lost.
 *
 * The five zones of an entity drawer, in this order: head · original · core
 * facts · limit · foot. Zone 2 is the point here — a document *has* an
 * original, and it comes first and large.
 *
 * Taken from `ui/drawers/BelegDrawer.tsx`: the zones, the four states and the
 * single way out came along. The loading did not — this drawer is handed
 * `record`, `loading` and `error` (0042), so it works in Storybook and in any
 * page, without a client scope.
 */

export interface DocumentQuickView {
  /** How the document is called — „Beleg · ACME GmbH". */
  title: string;
  facts: DocumentFactsVM;
  /** Signed URL of the preview; `null` means there is none. */
  previewUrl?: string | null;
  /** Why there is no preview — said in a sentence, not left blank. */
  previewUnavailableReason?: string | null;
  originalFileName?: string | null;
  /** Registry axis `beleg` — the state belongs in the head (zone 1). */
  status?: string | null;
}

/**
 * @when    Looking at one document beside a list or a case — its original, its
 *          core facts, and the way into the full view.
 * @instead Every question about the document (positions, VAT, splitting) →
 *          DocumentView. A decision that has to be made now → Dialog. One
 *          sentence about it → Popover. The facts without the drawer →
 *          DocumentFacts.
 */
export function DocumentDrawer({
  open,
  onClose,
  reference,
  record,
  loading,
  error,
  onOpenFull,
}: {
  open: boolean;
  onClose: () => void;
  /** The identifier that was looked up — it stands in the head **and** in the error and empty text. */
  reference: string;
  /** `null` means **not found**, not „still loading". */
  record: DocumentQuickView | null;
  /** Beats `record`. */
  loading?: boolean;
  /** Beats `loading`. */
  error?: ReactNode;
  /** The one way out, in the foot. */
  onOpenFull: () => void;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      // Zone 1: the head stands before the body is there — otherwise the
      // drawer would open onto nothing while it loads.
      title={record?.title ?? "Beleg"}
      meta={
        <span className="v2doc__ident">
          {record?.facts.invoiceNumber ?? record?.originalFileName ?? reference}
          {record?.status ? (
            <StatusBadge axis="beleg" status={record.status} info={false} />
          ) : null}
        </span>
      }
      size="lg"
      // Zone 5: exactly one action, and it leads into the full view. No second
      // button, nothing that writes.
      footer={
        record ? (
          <Button variant="primary" icon={<Maximize2 size={16} strokeWidth={1.5} />} onClick={onOpenFull}>
            Vollständige Belegansicht öffnen
          </Button>
        ) : null
      }
    >
      <DrawerBody reference={reference} record={record} loading={loading} error={error} />
    </Drawer>
  );
}

/** The four states in their order of precedence: error → loading → not found → content. */
function DrawerBody({
  reference,
  record,
  loading,
  error,
}: {
  reference: string;
  record: DocumentQuickView | null;
  loading?: boolean;
  error?: ReactNode;
}) {
  if (error) {
    // The reason plus the identifier, in one sentence — „Fehler beim Laden"
    // would leave the reader guessing which document failed.
    return (
      <Callout tone="danger">
        Beleg {reference} konnte nicht geladen werden: {error}
      </Callout>
    );
  }
  if (loading) {
    // The shape of the content, not a generic box: the original takes the same
    // height it will take, the facts the same five lines.
    return (
      <>
        <span className="v2skel v2doc__origskel" aria-hidden="true" />
        <Skeleton lines={5} label="Beleg wird geladen …" />
      </>
    );
  }
  if (!record) {
    return (
      <EmptyState
        inline
        icon={<FileWarning size={20} strokeWidth={1.5} />}
        title={`Kein Beleg zu ${reference}`}
        description="Zu dieser Kennung gibt es keinen Beleg dieses Mandanten. Vielleicht gehört sie einem anderen Zeitraum."
      />
    );
  }

  return (
    <>
      {/* Zone 2: the thing itself, first and large. A document without a
          preview says why — it gets no placeholder. */}
      {record.previewUrl ? (
        <iframe className="v2doc__orig" src={record.previewUrl} title="Beleg-Vorschau" />
      ) : (
        <div className="v2sub">
          {record.previewUnavailableReason ?? "Für diesen Beleg gibt es keine Vorschau."}
        </div>
      )}

      {/* Zone 3: the same component the full view uses — one set of field rows. */}
      <div>
        <div className="v2doc__h">Extrahierte Belegdaten</div>
        <DocumentFacts facts={record.facts} />
      </div>

      {/* Zone 4: what the glance does not answer. */}
      <p className="v2doc__limit">
        Schnellvorschau. Positionen, USt-Sätze und Konto-Splitting werden in der
        vollständigen Belegansicht geprüft.
      </p>
    </>
  );
}
