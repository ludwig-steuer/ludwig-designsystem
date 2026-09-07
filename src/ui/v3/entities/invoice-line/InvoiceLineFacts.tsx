import type { ReactNode } from "react";

import type { InvoiceLineItem } from "@/ludwig/modules/invoices/domain/invoice";

import { Amount } from "../../primitives/Amount";
import { FieldList } from "../../primitives/FieldList";
import { LongText } from "../../primitives/LongText";
import { Time } from "../../primitives/Time";
import { formatAmount } from "../../format";
import { lineLabel, type InvoiceLineLabels } from "./invoice-line";

type Props = {
  line: InvoiceLineItem;
  labels: InvoiceLineLabels;
  /**
   * The evidence and the VAT notes, turned into sentences by the caller —
   * the two JSONB columns that have no type yet (L-204). `line.lineNotes` is
   * typed and is read here directly.
   */
  notes?: readonly string[];
  /** The audit trail of the document collapse, as label/value pairs. */
  collapse?: readonly [string, string][];
  /**
   * The currency of the foreign-currency mirror (`InvoiceDetail.fxCurrency`).
   * Required as soon as one `fx*` value is set — `Amount` refuses a bare
   * number without one.
   */
  fxCurrency?: string;
};

/**
 * Why Ludwig classified a line the way it did: the accounting subject and the
 * reasoning, the VAT special case with its legal reference, the DATEV tax-key
 * candidates, the foreign-currency mirror, notes — and, on a collector line,
 * the audit trail of the collapse.
 *
 * **A field without a value is not shown.** No em dash, no empty row: an empty
 * line claims something was lost. That is the rule the discount column in the
 * app breaks in every single row (L-201).
 *
 * Two things are deliberately not built, both measured: the sub-table
 * „Alternative Kategorien" — `historyCandidates` is an empty array in 726 of
 * 726 lines — and the discount (L-201/L-202).
 *
 * @when    The expander of an invoice line: how the classification came about.
 * @instead What is on the document → InvoiceLineRow. The whole list → InvoiceLineList.
 */
export function InvoiceLineFacts({ line, labels, notes, collapse, fxCurrency }: Props) {
  const blocks: ReactNode[] = [];

  const classification = rows([
    ["Buchungsgegenstand", text(line.accountingSubject, 161)],
    ["Begründung", text(line.fundUsageReasoning, 169)],
  ]);
  if (classification.length) {
    blocks.push(<FieldList key="cls" title="Buchungsklassifikation" tone="bare" rows={classification} />);
  }

  const vat = rows([
    ["USt-Betrag", line.taxValue === null ? null : <Amount value={line.taxValue} currency="EUR" />],
    [
      "USt-Sonderfall",
      line.vatSpecialCase === "none" ? null : lineLabel(labels.vatSpecialCase, line.vatSpecialCase),
    ],
    ["Rechtsgrundlage", line.vatLegalReference],
    // Only where it deviates: in the stock it never does (L-202 b), and a
    // bracket that repeats the rate next to it says nothing.
    [
      "Extrahierter USt-Satz",
      line.vatExtractedRatePercent === null || line.vatExtractedRatePercent === line.taxRatePercent
        ? null
        : `${formatAmount(line.vatExtractedRatePercent, null)} %`,
    ],
  ]);
  if (vat.length) blocks.push(<FieldList key="vat" title="Umsatzsteuer" tone="bare" rows={vat} />);

  // Its own block, not a child of the VAT special case: 423 of 440 filled
  // candidate lists have no special case and stay invisible in the app today
  // (L-202 c).
  const keys = line.taxCandidateKeys ?? [];
  if (keys.length) {
    blocks.push(
      <FieldList
        key="keys"
        title="DATEV-Steuerschlüssel"
        tone="bare"
        rows={[["Kandidaten", keys.join(" · ")]]}
      />,
    );
  }

  const document = rows([
    ["Artikelnummer", line.productCode],
    [
      "Leistungsdatum",
      line.serviceDate ? <Time key="svc" value={line.serviceDate} format="date" /> : null,
    ],
  ]);
  if (document.length) blocks.push(<FieldList key="doc" title="Beleg" tone="bare" rows={document} />);

  const fx = rows([
    ["Einzelpreis", money(line.fxUnitPriceValue, fxCurrency)],
    ["USt-Betrag", money(line.fxTaxValue, fxCurrency)],
    ["Netto-Summe", money(line.fxLineTotalNetValue, fxCurrency)],
  ]);
  if (fx.length) blocks.push(<FieldList key="fx" title="Fremdwährung" tone="bare" rows={fx} />);

  const allNotes = [...(notes ?? []), ...line.lineNotes];
  if (allNotes.length) {
    blocks.push(
      <FieldList
        key="notes"
        title="Hinweise"
        tone="bare"
        rows={allNotes.map((n, i) => [`${i + 1}.`, n] as [ReactNode, ReactNode])}
      />,
    );
  }

  if (collapse?.length) {
    blocks.push(
      <FieldList key="col" title="Beleg-Kollaps" tone="bare" rows={collapse.map((p) => [...p] as [ReactNode, ReactNode])} />,
    );
  }

  if (!blocks.length) {
    return <p className="v2muted">Zu dieser Position hat Ludwig nichts vermerkt.</p>;
  }
  return <div className="v2ilfacts">{blocks}</div>;
}

/** Drop every pair whose value is empty — that is the whole rule. */
function rows(pairs: [ReactNode, ReactNode][]): [ReactNode, ReactNode][] {
  return pairs.filter(([, value]) => value !== null && value !== undefined && value !== "");
}

function text(value: string | null, max: number): ReactNode {
  return value ? <LongText max={max}>{value}</LongText> : null;
}

function money(value: number | null, currency: string | undefined): ReactNode {
  if (value === null) return null;
  // Without a currency the mirror stays invisible rather than claiming EUR —
  // the number is by definition not in euros.
  if (!currency) return null;
  return <Amount value={value} currency={currency as never} />;
}
