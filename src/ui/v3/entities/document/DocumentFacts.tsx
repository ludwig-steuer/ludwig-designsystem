import type { Currency } from "@/ludwig/shared/money";

import { MonoCell } from "../../primitives/Cells";
import { FieldList } from "../../primitives/FieldList";
import { Amount } from "../../primitives/Amount";
import { Time } from "../../primitives/Time";

/**
 * The core facts of a document — the one list every form of the family shows
 * (0052 zone 3).
 *
 * It exists so that the drawer and the full view cannot drift apart: the
 * order of the fields is decided **here**, once. Whoever needs the same facts
 * somewhere else imports this instead of writing four `FieldList` rows.
 *
 * Taken from `ui/beleg/BelegSummary.tsx` — the behaviour (which fields, in
 * which order, em dash for missing) came along, the looks did not.
 */

/**
 * What every kind of document carries. Invoice-specific things — positions,
 * VAT blocks, DATEV account — stay out; they belong to the full view.
 */
export interface DocumentFactsVM {
  /** Who issued it — „Lieferant" for an incoming invoice. */
  vendor?: string | null;
  /** The number on the paper, read digit by digit — mono. */
  invoiceNumber?: string | null;
  /** ISO date or `YYYY-MM-DD`; the day, not a timestamp. */
  invoiceDate?: string | null;
  gross?: number | null;
  currency?: Currency | null;
  /** One or two sentences of what the document is about. */
  summary?: string | null;
}

/**
 * @when    The core facts of a document, read-only — in its drawer, in its
 *          view, in a preview beside something else.
 * @instead The whole document with positions and VAT → DocumentView. The
 *          document next to a list → DocumentDrawer. A single field in a row
 *          → MonoCell, Amount, Time.
 */
export function DocumentFacts({ facts }: { facts: DocumentFactsVM }) {
  const rows: [string, React.ReactNode][] = [
    ["Lieferant", facts.vendor ?? <span className="v2muted">—</span>],
    ["Rechnungsnr.", <MonoCell key="nr" value={facts.invoiceNumber ?? null} />],
    ["Rechnungsdatum", <Time key="date" value={facts.invoiceDate ?? null} format="date" />],
    [
      "Brutto",
      <Amount key="gross" value={facts.gross ?? null} currency={facts.currency ?? "EUR"} />,
    ],
  ];
  // A summary is a paragraph, not a value: it keeps its row, but the text runs
  // left and without `tnum` — the field column aligns numbers right (V3).
  if (facts.summary) {
    rows.push(["Zusammenfassung", <p className="v2doc__prose" key="sum">{facts.summary}</p>]);
  }

  return <FieldList tone="bare" rows={rows} />;
}
