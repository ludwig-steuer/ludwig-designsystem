"use client";

import type { JournalEntryVM } from "@/ludwig/modules/entries/domain/journal-entry-vm";

import { Banner } from "../../primitives/Banner";
import { Drawer, DrawerFullView } from "../../primitives/Drawer";
import { EmptyState } from "../../primitives/EmptyState";
import { Skeleton } from "../../primitives/Skeleton";
import type { AiSource } from "./AiBookingNotes";
import { JournalEntryFacts, type JournalEntryFactsContext } from "./JournalEntryFacts";

/** Above this the booking text is cut in the head — the same 60 as everywhere (EXTF). */
const TEXT_MAX = 60;

/**
 * Looking up an entry without leaving the work (0177).
 *
 * The bookkeeper sees a line in the account sheet, an origin on an expectation,
 * a booking on a bank line — and has **one** question: what kind of entry is
 * that? The drawer answers it beside the work; the half-typed row behind it
 * stays.
 *
 * Zones after 0052: 1 head · 3 facts · 5 footer. **Zone 2 falls away without
 * replacement**: an entry has no document of its own — the document is a
 * relation and is named in „Zusammenhang". Zone 4 (the limit) falls away too:
 * the facts are complete, there is no „more of this".
 *
 * @when    An entry looked up from inside other work — from an account sheet,
 *          an expectation, a bank line, a batch list.
 * @instead Everything about the entry on its own surface → JournalEntryFacts.
 *          One entry in a list → JournalEntryRow. Changing it →
 *          JournalEntryEditor.
 */
export function JournalEntryDrawer({
  open,
  onClose,
  entry,
  context,
  judgeReasoning = null,
  sources = [],
  caseHref,
  batchHref,
  loading,
  error,
}: {
  open: boolean;
  /** Escape, scrim, cross — all three report the same (0042). */
  onClose: () => void;
  /** `null` while it loads, and when the entry is gone. */
  entry: JournalEntryVM | null;
  context?: JournalEntryFactsContext;
  judgeReasoning?: string | null;
  sources?: readonly AiSource[];
  /**
   * Zone 5 — **the one way out** (A10). With it the facts get none: the case
   * number then stands as text, and the way is the button in the foot (D24).
   */
  caseHref?: string;
  batchHref?: (batchId: string) => string;
  loading?: boolean;
  error?: string;
}) {
  const gone = !loading && !error && entry === null;
  const text = entry?.lines.find((l) => l.lineText)?.lineText ?? null;
  const documentNumber =
    entry?.lines.find((l) => l.externalDocumentNumber)?.externalDocumentNumber ?? null;
  const title = documentNumber ?? "Buchungssatz";

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      ariaLabel={`Buchungssatz ${title}`}
      size="lg"
      {...(text
        ? { meta: text.length > TEXT_MAX ? `${text.slice(0, TEXT_MAX - 1).trimEnd()}…` : text }
        : {})}
      footer={
        // Empty in three of four states; `.v2drawer__foot:empty` removes
        // itself (0042). A10 asks for the way where there is something to
        // open — not for a dead button over an error.
        loading || error || gone || !caseHref ? null : (
          <DrawerFullView href={caseHref} />
        )
      }
    >
      {loading ? (
        // The loading surface has the shape of the content: a block for the
        // facts, rows for the lines — not one box over everything (0052 M2).
        <div className="v2stack">
          <Skeleton lines={6} />
          <Skeleton lines={4} />
        </div>
      ) : error ? (
        <Banner tone="danger" title="Der Buchungssatz konnte nicht geladen werden.">
          {error}
        </Banner>
      ) : gone ? (
        <EmptyState
          inline
          title="Diesen Buchungssatz gibt es nicht mehr."
          description="Er wurde storniert oder ersetzt. Was an seiner Stelle steht, zeigt der Sachverhalt."
        />
      ) : (
        <JournalEntryFacts
          entry={entry!}
          {...(context ? { context } : {})}
          judgeReasoning={judgeReasoning}
          sources={sources}
          {...(batchHref ? { batchHref } : {})}
          tone="bare"
        />
      )}
    </Drawer>
  );
}
