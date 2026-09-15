import type { ReactNode } from "react";

import { deriveEntryDatevStage } from "@/ludwig/modules/entries/domain/entry";
import type { JournalEntryVM } from "@/ludwig/modules/entries/domain/journal-entry-vm";
import { DOCUMENT_GROUP_LABEL } from "@/ludwig/modules/datev-export/domain/document-group";
import { confidenceLevel } from "@/ludwig/shared/confidence";

import { ProvenanceNote } from "../../patterns/Provenance";
import { StatusBadge } from "../../patterns/StatusBadge";
import { Banner } from "../../primitives/Banner";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { FieldList } from "../../primitives/FieldList";
import { Link } from "../../primitives/Link";
import { Time } from "../../primitives/Time";
import { CaseCell } from "../accounting-case/CaseCell";
import type { CaseLink } from "../accounting-case/case-title";
import { AiBookingNotesBody, type AiSource } from "./AiBookingNotes";
import { JournalEntryGrid } from "./JournalEntryGrid";
import { documentSideTotal, toJournalRows } from "./journal-entry";

/**
 * What the app knows about an entry but does not carry in its detail view
 * (**L-336**) — every field on its own, every one optional.
 *
 * The words are the caller's where the mirror has none: the kind of entry has
 * no word list at all (L-294), the document group has one
 * (`DOCUMENT_GROUP_LABEL`) and is therefore passed as its key.
 */
export interface JournalEntryFactsContext {
  /** The word of the kind — „Zahlung", „Erlös" (L-294: no list in the mirror). */
  entryKind?: string | null;
  /** The key of the document group; the word comes from the mirror. */
  documentGroup?: string | null;
  /** Who: „Agent · Lauf 4b19c2". */
  agentRun?: ReactNode;
  /** The step of the booking run that decided (`step_code`). */
  stepCode?: string | null;
  sourceDocumentHref?: string | null;
  /** The client's own batch this entry was imported with. */
  importReference?: string | null;
  /** The mirror entry that found this one again — its presence is „in DATEV". */
  mirrorEntry?: { label: string; href?: string } | null;
  case?: CaseLink | null;
  /** The event this entry belongs to, in words. */
  event?: ReactNode;
}

/**
 * One entry, read whole (0176): what is booked, why it is booked that way, and
 * how far it is on its way to DATEV.
 *
 * **It takes nothing** — no field, no acceptance, no reversal: that is
 * `JournalEntryEditor` (0015) and the actions of the page. It also says
 * nothing twice: where the agent's reasoning and the judge's verdict exist,
 * they stand in `AiBookingNotesBody`, and the derivation above them keeps
 * origin, rule and confidence (D24).
 *
 * Every group is **absent** when it would be empty — a card of em dashes says
 * „we do not know" where the truth is „there is none" (D23).
 *
 * @when    An entry read in full — the drawer, the entry page of a case, the
 *          preview of a proposal.
 * @instead One entry in a list → JournalEntryRow. Next to another entity →
 *          JournalEntryCard. Changing it → JournalEntryEditor.
 */
export function JournalEntryFacts({
  entry,
  context = {},
  judgeReasoning = null,
  sources = [],
  batchHref,
  caseHref,
  tone = "surface",
}: {
  entry: JournalEntryVM;
  context?: JournalEntryFactsContext;
  /** The judge's sentence — the app hands it over while the jsonb has no type (L-295). */
  judgeReasoning?: string | null;
  /** The sources of the decision, already in the kinds this kit knows. */
  sources?: readonly AiSource[];
  batchHref?: (batchId: string) => string;
  caseHref?: (caseId: string) => string;
  /** `bare` for the drawer, where a card already stands around it (0052). */
  tone?: "surface" | "bare";
}) {
  const rows = toJournalRows(entry);
  const amount = documentSideTotal(rows, "S") || documentSideTotal(rows, "H");
  const documentNumber = entry.lines.find((l) => l.externalDocumentNumber)?.externalDocumentNumber ?? null;
  const stage = deriveEntryDatevStage({
    status: entry.status,
    exportedAt: entry.exportedAt ?? null,
    // The detail view carries no mirror id (L-336); the mirror entry the caller
    // hands in is the same statement: found again in DATEV.
    datevMirrorEntryId: context.mirrorEntry ? context.mirrorEntry.label : null,
  });
  const hasAi = Boolean(judgeReasoning) || sources.length > 0;

  const facts: [ReactNode, ReactNode][] = [
    ["Buchungsdatum", <Time key="d" value={entry.bookingDate} format="date" />],
  ];
  if (documentNumber) facts.push(["Belegfeld 1", <MonoCell key="b" value={documentNumber} />]);
  facts.push(["Betrag", <AmountCell key="a" value={amount} currency={entry.currency} />]);
  facts.push([
    "Weg nach DATEV",
    <StatusBadge key="s" axis="journal_entry_datev_stage" status={stage} />,
  ]);
  if (context.entryKind) facts.push(["Satzart", context.entryKind]);
  if (context.documentGroup) {
    const group = context.documentGroup;
    facts.push([
      "Beleggruppe",
      (DOCUMENT_GROUP_LABEL as Record<string, string>)[group] ?? group,
    ]);
  }

  const exportRows: [ReactNode, ReactNode][] = [];
  if (entry.exportStapelnummer || entry.exportBatchId) {
    const id = entry.exportBatchId;
    const number = entry.exportStapelnummer ?? "öffnen";
    exportRows.push([
      "Stapel",
      batchHref && id ? (
        <Link key="x" href={batchHref(id)}>
          {number}
        </Link>
      ) : (
        <span key="x">{entry.exportStapelnummer ?? "—"}</span>
      ),
    ]);
  }
  if (entry.exportedAt) exportRows.push(["Exportiert", <Time key="e" value={entry.exportedAt} format="date" />]);
  if (entry.exportFileName) exportRows.push(["Datei", <MonoCell key="f" value={entry.exportFileName} />]);
  if (entry.exportRef) exportRows.push(["LudwigAI-Ref", <MonoCell key="r" value={entry.exportRef} />]);

  const related: [ReactNode, ReactNode][] = [];
  if (context.case) {
    const link = context.case;
    related.push([
      "Sachverhalt",
      caseHref ? (
        <CaseCell key="c" cases={[link]} href={caseHref} showState={false} />
      ) : (
        <span key="c">{link.caseNumber ?? "—"}</span>
      ),
    ]);
  }
  if (context.event) related.push(["Ereignis", context.event]);
  if (context.mirrorEntry) {
    const mirror = context.mirrorEntry;
    related.push([
      "Spiegelbuchung",
      mirror.href ? (
        <Link key="m" href={mirror.href}>
          {mirror.label}
        </Link>
      ) : (
        <span key="m">{mirror.label}</span>
      ),
    ]);
  }
  if (context.importReference) {
    related.push(["Mandantenstapel", <MonoCell key="i" value={context.importReference} />]);
  }
  if (context.sourceDocumentHref) {
    related.push([
      "Beleg",
      <Link key="doc" href={context.sourceDocumentHref}>
        öffnen
      </Link>,
    ]);
  }

  return (
    <div className="v2stack">
      <FieldList title="Der Satz" tone={tone} rows={facts} />

      {entry.isLocked ? (
        <Banner tone="neutral" title="Festgeschrieben.">
          Der Satz ist nach GoBD festgeschrieben — er lässt sich nicht mehr ändern, nur stornieren.
        </Banner>
      ) : null}
      {entry.blocked ? (
        <Banner tone="warning" title="Blockiert.">
          Eine offene Rückfrage hält den Satz — so geht er nicht nach DATEV.
        </Banner>
      ) : null}
      {entry.repairedFrom ? (
        <Banner tone="neutral" title="Ersetzt einen beanstandeten Satz.">
          {entry.repairedFrom.judgeComment ?? "Der Judge hat den Vorgänger beanstandet."}
          {entry.repairedFrom.violatedCriteria.length > 0
            ? ` Kriterien: ${entry.repairedFrom.violatedCriteria.join(", ")}.`
            : null}
        </Banner>
      ) : null}

      {/* Two nachtrags on 0113 live here: the grid offers only `onOpenLedger`,
          a callback, so a server form cannot give it the way to the account
          (0155 settled that everywhere else with an `accountHref`); and it
          always draws its own status badge, so the state stands twice as soon
          as a form above it shows the way to DATEV (D24). */}
      <JournalEntryGrid
        rows={rows}
        status={entry.status}
        documentNumber={documentNumber}
        documentAmount={amount}
      />

      <div className="v2stack">
        <ProvenanceNote
          defaultOpen
          provenance={{
            origin: <StatusBadge axis="journal_entry_origin" status={entry.origin} info={false} />,
            ...(context.agentRun ? { actor: context.agentRun } : {}),
            ...(entry.createdAt ? { at: entry.createdAt } : {}),
            ...(context.stepCode
              ? { rule: { code: context.stepCode, sentence: "Teilschritt des Buchungslaufs." } }
              : {}),
            ...(entry.confidence != null
              ? { confidence: { level: confidenceLevel(entry.confidence), value: entry.confidence } }
              : {}),
            ...(hasAi ? {} : { rationale: entry.rationale }),
          }}
        />
        {hasAi ? (
          <AiBookingNotesBody
            rationale={entry.rationale}
            judgeReasoning={judgeReasoning}
            sources={[...sources]}
          />
        ) : null}
      </div>

      {exportRows.length > 0 ? (
        <FieldList title="Export und Stapel" tone={tone} rows={exportRows} />
      ) : null}
      {related.length > 0 ? <FieldList title="Zusammenhang" tone={tone} rows={related} /> : null}
    </div>
  );
}
