"use client";

import { FileWarning, Maximize2 } from "lucide-react";
import type { ReactNode } from "react";

import { sourceDocTypeLabel } from "@/ludwig/modules/source-docs/domain/source-doc-type";

import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Drawer } from "../../primitives/Drawer";
import { EmptyState } from "../../primitives/EmptyState";
import { Skeleton } from "../../primitives/Skeleton";
import { Card, CardHead } from "../../primitives/Table";
import {
  SourceDocumentCompletion,
  clipMiddle,
  sourceDocumentIdentifier,
  type SourceDocumentVM,
} from "./SourceDocument";
import { SourceDocumentCard } from "./SourceDocumentCard";
import { type SourceDocumentGroup } from "./SourceDocumentFacts";

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

export interface SourceDocumentQuickView {
  /**
   * The document itself (0074). Title, identifier and state of the head are
   * **derived** from it — the drawer no longer has them handed over, so it
   * cannot name the document differently than the list it stands next to.
   */
  document: SourceDocumentVM;
  /** The caller picks which of the two summaries this is (0076). */
  summary?: string | null;
  /** Signed URL of the preview; `null` means there is none. */
  previewUrl?: string | null;
  /** Why there is no preview — said in a sentence, not left blank. */
  previewUnavailableReason?: string | null;
  /** „Seiten 5–7 aus …" for a document cut out of a collection PDF. */
  excerpt?: { from: number; to?: number; parentTitle?: string; parentHref?: string } | null;
  /** The group block of the facts — original with its parts, or one of them. */
  group?: SourceDocumentGroup | null;
}

/** „Rechnung · ACME GmbH" — the kind of document leads, never „Beleg" for all. */
function headTitle(document: SourceDocumentVM): string {
  const kind = sourceDocTypeLabel(document.sourceDocType, document.classDocumentForm);
  return document.counterparty ? `${kind} · ${document.counterparty}` : kind;
}

/**
 * @when    Looking at one document beside a list or a case — its original, its
 *          core facts, and the way into the full view.
 * @instead Every question about the document (positions, VAT, splitting) →
 *          DocumentView. A decision that has to be made now → Dialog. One
 *          sentence about it → Popover. The facts without the drawer →
 *          SourceDocumentFacts.
 */
export function SourceDocumentDrawer({
  open,
  onClose,
  reference,
  record,
  loading,
  error,
  onOpenFull,
  provenance,
}: {
  open: boolean;
  onClose: () => void;
  /** The identifier that was looked up — it stands in the head **and** in the error and empty text. */
  reference: string;
  /** `null` means **not found**, not „still loading". */
  record: SourceDocumentQuickView | null;
  /** Beats `record`. */
  loading?: boolean;
  /** Beats `loading`. */
  error?: ReactNode;
  /** The one way out, in the foot. */
  onOpenFull: () => void;
  /**
   * Provenance and DATEV filing in the facts (0120), passed to the card.
   *
   * Default **off**, and that is the recommendation: the drawer answers the
   * one question that came up elsewhere (0052), and „where is this filed in
   * DATEV" is not that question — whoever asks it is already on the document.
   * It is a prop and not a fixed `false` because the drawer does not own that
   * judgement: a page whose whole job is filing may well want it here.
   */
  provenance?: boolean;
}) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      // Zone 1: the head stands before the body is there — otherwise the
      // drawer would open onto nothing while it loads.
      title={record ? headTitle(record.document) : "Beleg"}
      meta={
        <span className="v2doc__ident">
          {/* The same fallback chain as the row: what the specialization fills
              in, else the file name, else the short id — one rule, one place. */}
          {record ? identText(record.document) : reference}
          {/* The state of the head is the **completion**: the axis `beleg`
              lives at the invoice subtype and never has a value for 16 % of
              all documents (finding L-42). */}
          {record ? <SourceDocumentCompletion document={record.document} /> : null}
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
      <DrawerBody
        reference={reference}
        record={record}
        loading={loading}
        error={error}
        provenance={provenance}
      />
    </Drawer>
  );
}

/** The identifier of the head, shortened the way card and drawer shorten (88). */
function identText(document: SourceDocumentVM): string {
  const ident = sourceDocumentIdentifier(document);
  return ident.mono ? ident.value : clipMiddle(ident.value, 88);
}

/** The four states in their order of precedence: error → loading → not found → content. */
function DrawerBody({
  reference,
  record,
  loading,
  error,
  provenance,
}: {
  reference: string;
  record: SourceDocumentQuickView | null;
  loading?: boolean;
  error?: ReactNode;
  provenance?: boolean;
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
    // The shape of the content, not a generic box: the original stands in the
    // **same card with the same head** it will stand in once it is there
    // (`SourceDocumentPreview`, 0075), at the same height, and the facts take
    // the same five lines. Before this it was a bare surface at y = 101 while
    // the loaded original starts at y = 172 — the load jumped (found in the
    // acceptance of 0076).
    return (
      <>
        <Card>
          <CardHead title={<span className="v2skel v2doc__headskel" aria-hidden="true" />} />
          <span className="v2skel v2doc__origskel" aria-hidden="true" />
        </Card>
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

  // Zones 2 and 3 are **the card**, not a second build of it: „zone 3 is the
  // same component as the view" is the rule of 0052, and the surest way to
  // keep it is to let the drawer render the view's first tab. `bare` because
  // the `Drawer` already provides the surface.
  return (
    <SourceDocumentCard
      document={record.document}
      summary={record.summary}
      previewUrl={record.previewUrl}
      previewUnavailableReason={record.previewUnavailableReason}
      excerpt={record.excerpt}
      group={record.group}
      tone="bare"
      provenance={provenance}
    >
      {/* Zone 4: what the glance does not answer. */}
      <p className="v2doc__limit">
        Schnellvorschau. Positionen, USt-Sätze und Konto-Splitting werden in der
        vollständigen Belegansicht geprüft.
      </p>
    </SourceDocumentCard>
  );
}
