import type { ReactNode } from "react";

import type { DocDefect, DocDefectKind } from "@/ludwig/modules/source-docs/domain/doc-defects";
import type { VatRateShare } from "@/ludwig/modules/invoices/domain/vat-by-rate";
import type { Currency } from "@/ludwig/shared/money";

import { Amount } from "../../primitives/Amount";
import { Card, CardHead } from "../../primitives/Table";
import { FieldList } from "../../primitives/FieldList";
import { TextButton } from "../../primitives/TextButton";
import { OpenPoints } from "../../patterns/OpenPoints";
import { Timeline, type TimelineItem } from "../../patterns/Timeline";

/**
 * What the overview of a document shows **beside** its facts (0150).
 *
 * The rule the owner set for this page: the overview is a **preview of the
 * tabs below it**, and what is wrong shows here, not two clicks away. So the
 * right-hand column carries four boxes in one order — the facts, then what
 * somebody has to do, then the two answers that are otherwise a tab each: the
 * VAT of the document and what has happened to it so far.
 *
 * All four are boxes with their heading **inside** — the same `Card` every
 * other surface of the set uses. Until 0150 the facts had theirs outside, as
 * a bare line above the box, and next to three boxes with a proper head that
 * read like a mistake, because it was one.
 *
 * **None of them computes anything** (E2): the defects come ready-made from
 * `docDefects()`, the amounts and the events come from the caller. What the
 * boxes do is decide what is worth a line — and leave out what is not.
 */

/* ── Mängel ──────────────────────────────────────────────────────────────── */

/**
 * The German sentence for a defect. The domain names the kind, the display
 * says it in words — `docDefects()` returns codes and raw messages, and those
 * are English („line_totals_mismatch").
 *
 * `extraction` is the one that has no fixed sentence: it stands for every
 * finding the interpretation left open, and its `code` is the only thing that
 * says which. Known codes get their word here, the rest fall back to the raw
 * message — visibly raw, in the second line, rather than dressed up.
 */
const DEFECT_TITLE: Record<DocDefectKind, string> = {
  document_date: "Belegdatum fehlt.",
  extraction: "Die Extraktion hat etwas offen gelassen.",
  partner: "Der Gegenpart ist mehrdeutig.",
  recipient: "Der Empfänger passt nicht zum Mandanten.",
  payment_account: "Das Zahlungskonto fehlt.",
};

/** What follows from the defect — one sentence, no imperative without a way. */
const DEFECT_HINT: Record<DocDefectKind, string> = {
  document_date: "Ohne Datum fällt der Beleg aus jeder Jahresliste.",
  extraction: "Solange Werte fehlen, lässt sich der Beleg nicht buchen.",
  partner: "Mehrere Geschäftspartner passen auf den Namen — welcher gemeint ist, entscheidet die Buchung.",
  recipient: "Der Beleg ist auf einen anderen Namen ausgestellt. Er gehört vielleicht nicht zu diesem Mandanten.",
  payment_account: "Ohne Zahlungskonto wird der Auszug nicht verarbeitet.",
};

/** The findings whose code the house has a word for. */
const FINDING_CODE: Record<string, string> = {
  missing_required_field: "Ein Pflichtfeld fehlt.",
  line_totals_mismatch: "Die Summe der Positionen passt nicht zum Rechnungsbetrag.",
  duplicate_suspicion: "Dieser Beleg sieht aus wie ein zweiter derselben Rechnung.",
  currency_mismatch: "Zwei Währungen auf einem Beleg.",
  tax_mismatch: "Die ausgewiesene Steuer passt nicht zu Netto und Brutto.",
};

export interface SourceDocumentDefectsProps {
  /** Ready-made from `docDefects()` — the component neither derives nor sorts. */
  defects: readonly DocDefect[];
  /**
   * The way out, per kind of defect. Without one the defect is **named but not
   * actionable** — which is still better than hiding it, and is exactly how
   * the app shows the two partner questions today.
   */
  actions?: Partial<Record<DocDefectKind, ReactNode>>;
  /**
   * The open clarifications of this document, drawn by their own family
   * (`ClarificationCard`) — the box only provides the place and the heading.
   *
   * They stand in the **same** box as the defects on purpose: for the person
   * reading, „a question is open" and „a value is missing" are one and the
   * same interruption, and two boxes would make them look like two topics
   * (owner, 2026-09-10).
   */
  clarifications?: ReactNode;
  /** How many clarifications there are — the head says it, so an empty list is not a surprise. */
  clarificationCount?: number;
  /** Where all of them stand, when there are more than the box shows. */
  moreHref?: string;
}

/**
 * @when    The overview of a document: what is wrong and what is open, in one box.
 * @instead One missing value at the field it belongs to → SourceDocumentFacts `missing`.
 *          The whole history → SourceDocumentHistory. A single clarification → ClarificationCard.
 *          The same zone on another entity → OpenPoints, this is its document half.
 */
export function SourceDocumentDefects({
  defects,
  actions,
  clarifications,
  clarificationCount,
  moreHref,
}: SourceDocumentDefectsProps) {
  // **The words stay here, the box moved out.** Since 0153 `OpenPoints` draws
  // the zone — what counts as a defect and what it is called only the document
  // knows, and that is exactly the cut: the pattern knows no entity.
  return (
    <OpenPoints
      title="Befunde und Klärungen"
      emptyText="An diesem Beleg ist nichts offen."
      points={defects.map((defect, i) => ({
        key: `${defect.kind}-${defect.code ?? i}`,
        title: defectTitle(defect),
        hint: DEFECT_HINT[defect.kind],
        ...(defect.message && defect.kind === "extraction" ? { raw: defect.message } : {}),
        ...(actions?.[defect.kind] ? { action: actions[defect.kind] } : {}),
      }))}
      {...(clarifications ? { extra: clarifications } : {})}
      {...(clarificationCount ? { extraCount: clarificationCount } : {})}
      {...(moreHref ? { moreHref } : {})}
    />
  );
}

function defectTitle(defect: DocDefect): string {
  if (defect.kind === "extraction" && defect.code) {
    return FINDING_CODE[defect.code] ?? DEFECT_TITLE.extraction;
  }
  return DEFECT_TITLE[defect.kind];
}

/* ── Umsatzsteuer ────────────────────────────────────────────────────────── */

/**
 * One tax rate of the document with its sums.
 *
 * **From the mirror since the run of 2026-09-10**: the box defined the shape
 * locally while the app had no split by rate (finding L-279, filed this
 * morning, built the same day). `vatByRate()` now derives it over there, and a
 * second definition here would be the fork that finding warned about.
 */
export type { VatRateShare };

export interface SourceDocumentVatProps {
  net: number | null;
  vat: number | null;
  gross: number | null;
  currency: Currency | null;
  /**
   * The split by rate. Two rates on one document are the case this box exists
   * for — a single rate says nothing that net and VAT do not already say, and
   * then the block stays out.
   */
  rates?: readonly VatRateShare[];
  /**
   * Whether the input tax can be deducted, and why not where it cannot.
   * `undefined` means nobody has decided yet — which is **not** „nein" and is
   * shown as the open question it is.
   */
  deductible?: { value: boolean | "partial"; reason?: string };
  /** `reverse_charge`, `innergemeinschaftlich`, … in the app's own words. */
  specialCase?: string | null;
  /** The tab that carries the whole answer. */
  href?: string;
}

/**
 * @when    The overview of a document: what its VAT amounts to, as the short
 *          form of the input-tax tab.
 * @instead The whole input-tax view with its lines → the tab itself. One line
 *          of an invoice → InvoiceLineFacts.
 */
export function SourceDocumentVat({
  net,
  vat,
  gross,
  currency,
  rates,
  deductible,
  specialCase,
  href,
}: SourceDocumentVatProps) {
  const rows: [ReactNode, ReactNode][] = [
    ["Netto", <Amount key="n" value={net} currency={currency} />],
    ["Umsatzsteuer", <Amount key="v" value={vat} currency={currency} />],
    ["Brutto", <Amount key="g" value={gross} currency={currency} />],
  ];
  // More than one rate is the reason for the block; one rate is already in the
  // two lines above, and repeating it would be a third way of saying it.
  if (rates && rates.length > 1) {
    for (const share of rates) {
      rows.push([
        `davon ${share.rate} %`,
        <span key={`r${share.rate}`}>
          <Amount value={share.net} currency={currency} /> ·{" "}
          <Amount value={share.vat} currency={currency} />
        </span>,
      ]);
    }
  }
  if (specialCase) rows.push(["Sonderfall", specialCase]);
  rows.push(["Vorsteuer", <Deductible key="d" deductible={deductible} />]);

  return (
    <Card>
      <CardHead
        title="Umsatzsteuer"
        sub="Kurzfassung des Reiters Vorsteuer"
        {...(href ? { actions: <TextButton href={href}>Zur Vorsteuer</TextButton> } : {})}
      />
      {/* The body carries the padding, not the list: `tone="bare"` is
          borderless, and without a frame the amounts ran right up to the edge
          of the card (measured 2026-09-10 at 1440). */}
      <div className="v2boxbody">
        <FieldList tone="bare" rows={rows} />
      </div>
    </Card>
  );
}

/**
 * „Nicht entschieden" is its own answer (V7, T6). A document nobody has ruled
 * on is not a document without input tax — and the difference decides whether
 * somebody still has to look at it.
 */
function Deductible({ deductible }: { deductible?: { value: boolean | "partial"; reason?: string } }) {
  if (!deductible) return <span className="v2muted">noch nicht entschieden</span>;
  const word =
    deductible.value === true
      ? "abziehbar"
      : deductible.value === "partial"
        ? "teilweise abziehbar"
        : "nicht abziehbar";
  return (
    <span>
      {word}
      {deductible.reason ? <span className="v2sub"> · {deductible.reason}</span> : null}
    </span>
  );
}

/* ── Verarbeitung ────────────────────────────────────────────────────────── */

/** How many events the short form shows before it points at the tab. */
const HISTORY_MAX = 4;

export interface SourceDocumentHistoryProps {
  /** The events, unsorted — `Timeline` sorts them (0040). */
  entries: readonly TimelineItem[];
  /** How many there are in total, where the box shows only the latest few. */
  total?: number;
  /** The tab with the whole run. */
  href?: string;
  loading?: boolean;
}

/**
 * @when    The overview of a document: the last steps of its processing, with
 *          the way to the whole run.
 * @instead The whole history → Timeline in the tab. Rows with severity and
 *          payload → LogBrowser. What is still to do → SourceDocumentDefects.
 */
export function SourceDocumentHistory({
  entries,
  total,
  href,
  loading,
}: SourceDocumentHistoryProps) {
  // Newest first, and only the last few: the overview answers „what happened
  // recently", the tab answers „what happened". Cutting here rather than in
  // the caller keeps the two views from disagreeing about how many „few" is.
  const sorted = [...entries].sort((a, b) => (a.at < b.at ? 1 : -1));
  const shown = sorted.slice(0, HISTORY_MAX);
  const rest = (total ?? entries.length) - shown.length;
  return (
    <Card>
      <CardHead
        title="Verarbeitung"
        sub={total ? `${total} Schritte` : undefined}
        {...(href ? { actions: <TextButton href={href}>Ganzer Verlauf</TextButton> } : {})}
      />
      <div className="v2boxbody">
        <Timeline
          entries={[...shown]}
          groupBy="none"
          {...(loading ? { loading } : {})}
          emptyText="Zu diesem Beleg ist noch nichts protokolliert."
        />
        {rest > 0 && href ? (
          <TextButton href={href}>{`${rest} weitere Schritte`}</TextButton>
        ) : null}
      </div>
    </Card>
  );
}
