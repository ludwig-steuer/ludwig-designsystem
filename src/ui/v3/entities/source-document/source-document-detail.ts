import type { ContractBookingFact } from "@/ludwig/modules/contracts/domain/contract";
import { contractTypeLabel } from "@/ludwig/modules/contracts/domain/contract";
import type { Currency } from "@/ludwig/shared/money";

import { formatAmount, formatTime } from "../../format";

/**
 * What a specialization contributes to the ranks every document shares (0074).
 *
 * The rule of the family, from the entity profile: **the order of the data
 * points is the same for every kind of document; which field fills a rank is
 * decided by the specialization** — here, in a registry, never through an
 * `if (isInvoice)` in a component. A new kind of document gets an entry here
 * and nothing else; no component learns its name.
 *
 * Two entries, and only two: invoice and contract are the kinds with fields of
 * their own. Bank statement, credit card statement and travel expense report
 * deliberately get none — they are containers, their structure lives at the
 * import batch and at their child documents (GLOSSARY „Source document
 * supertype & specializations", point 4). Their group property hangs on the
 * relation, not on the kind, and is shown by `SourceDocumentFacts` (0076).
 *
 * **Both sources have to agree.** The discriminator (`source_doc_type`) and
 * the subtype row disagree in 10 of 384 documents, and they do so for opposite
 * reasons: 7 carry `invoice` without an invoice row (the row is right — there
 * is nothing to show), 3 carry `other` **with** one, all three with
 * `class_overridden_at` set (the discriminator is right — a person corrected
 * the form, the row stayed behind). So the block only appears when entry and
 * discriminator match; where they do not, the form falls back to what a
 * document without a specialization shows and claims nothing either source
 * denies. The comparison is generic — every entry names its own
 * `source_doc_type`, nobody counts kinds of document.
 */

/**
 * The subtype row of a document, as far as the family reads it. The caller
 * sets it **when the row exists** — whether it is shown is decided here.
 */
export type SourceDocumentDetail =
  | {
      kind: "invoice";
      /** `invoice_number` — rank 5, read digit by digit. */
      number?: string | null;
      /** `invoice_total_value` — rank 3. */
      gross?: number | null;
      currency?: Currency | null;
      /** `processing_status`, registry axis `beleg`. */
      processingStatus?: string | null;
      /* Only the block of the specialization shows these (0076). */
      /** `subtotal_value` and `tax_total_value`. */
      net?: number | null;
      vat?: number | null;
      dueDate?: string | null;
      /** `payment_term` — „30 Tage netto", as extracted. */
      paymentTerm?: string | null;
      /** `service_period` — a period as one string, not two dates. */
      servicePeriod?: string | null;
      /**
       * `paid_at`. The **date**, not `payment_status`: that column has neither
       * a registry axis nor an enum, and a raw state without a word would be a
       * local label map (finding, reported with 0076).
       */
      paidAt?: string | null;
      /** `vendor_ust_id` — the issuer's VAT id, read digit by digit. */
      issuerVatId?: string | null;
      /** FX: only ever set on a document that was not issued in euros. */
      originalCurrency?: string | null;
      originalGross?: number | null;
    }
  | {
      kind: "contract";
      /** `contract_subject` — rank 5, a sentence, not a number. */
      subject?: string | null;
      /** `primary_amount` — rank 3. */
      amount?: number | null;
      currency?: Currency | null;
      /** `contract_type`, label through `contractTypeLabel()`. */
      contractType?: string | null;
      /* Only the block of the specialization shows these (0076). */
      startDate?: string | null;
      endDate?: string | null;
      durationMonths?: number | null;
      /** No end date **and** open-ended are two different statements. */
      isOpenEnded?: boolean;
      /** `booking_facts_json` — what the contract means for booking, with provenance. */
      bookingFacts?: readonly ContractBookingFact[];
    };

/** Rank 5. `mono` is false where the identifier is a sentence, not a number. */
export interface SourceDocIdentifier {
  value: string;
  mono: boolean;
}

/** Rank 3. `currency: null` is a decimal without one, never a silent EUR. */
export interface SourceDocMeasure {
  value: number;
  currency: Currency | null;
}

type DetailOf<K extends SourceDocumentDetail["kind"]> = Extract<SourceDocumentDetail, { kind: K }>;

/**
 * One field row of the specialization block (0076) — a pair, never a layout
 * decision: `SourceDocumentFacts` puts them under the generic rows, in the
 * order they come.
 *
 * `value` is a `ReactNode`, but every entry hands over a **formatted string**
 * from the one formatter of the house (`format.ts`, P24) — the registry stays
 * free of components, so the row can use it too. `mono` says a value is read
 * digit by digit; the component turns that into a `MonoCell`.
 */
export interface FactRow {
  label: string;
  value: import("react").ReactNode;
  mono?: boolean;
}

/**
 * One entry of the registry. It answers in **values, not JSX** — otherwise
 * 0076 could not add a third question to it without touching the row.
 */
export interface SourceDocumentDetailEntry<K extends SourceDocumentDetail["kind"]> {
  /** The `source_doc_type` this entry belongs to — the other half of the agreement. */
  type: string;
  /** Rank 5; `null` when the field is empty, and then the file name takes over. */
  identifier: (detail: DetailOf<K>) => SourceDocIdentifier | null;
  /** Rank 3; `null` leaves the place empty — never an em dash for a field this
   *  kind of document does not have. */
  measure: (detail: DetailOf<K>) => SourceDocMeasure | null;
  /**
   * The field rows that exist **only** in this specialization (0076). Empty
   * means no block at all — not a heading with „Keine Angaben." underneath.
   *
   * A field this kind of document always has but nobody read shows an em dash
   * (net, VAT, due date of an invoice); a field that only some of them have
   * (service period, original currency) is left out when it is empty.
   */
  facts: (detail: DetailOf<K>) => FactRow[];
}

export const SOURCE_DOCUMENT_DETAILS: {
  [K in SourceDocumentDetail["kind"]]: SourceDocumentDetailEntry<K>;
} = {
  invoice: {
    type: "invoice",
    identifier: (d) => (d.number ? { value: d.number, mono: true } : null),
    measure: (d) =>
      d.gross === null || d.gross === undefined
        ? null
        : { value: d.gross, currency: d.currency ?? null },
    facts: (d) => {
      const currency = d.currency ?? null;
      const rows: FactRow[] = [
        // Every invoice has a net amount, a VAT amount and a due date — if one
        // of them is missing it was not read, and that is an em dash.
        { label: "Netto", value: formatAmount(d.net ?? null, currency) },
        { label: "USt.", value: formatAmount(d.vat ?? null, currency) },
        { label: "Fällig", value: formatTime(d.dueDate ?? null, "date") },
      ];
      // These exist only on some invoices — an empty row would claim they were
      // missing rather than not applicable.
      if (d.paymentTerm) rows.push({ label: "Zahlungsziel", value: d.paymentTerm });
      if (d.servicePeriod) rows.push({ label: "Leistungszeitraum", value: d.servicePeriod });
      if (d.paidAt) rows.push({ label: "Bezahlt", value: formatTime(d.paidAt, "date") });
      if (d.issuerVatId) rows.push({ label: "USt-IdNr. des Ausstellers", value: d.issuerVatId, mono: true });
      if (d.originalCurrency) {
        rows.push({
          label: `Original (${d.originalCurrency})`,
          value:
            d.originalGross === null || d.originalGross === undefined
              ? d.originalCurrency
              : `${d.originalGross.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${d.originalCurrency}`,
        });
      }
      return rows;
    },
  },
  contract: {
    type: "contract",
    identifier: (d) => (d.subject ? { value: d.subject, mono: false } : null),
    measure: (d) =>
      d.amount === null || d.amount === undefined
        ? null
        : { value: d.amount, currency: d.currency ?? null },
    // Built against the **schema** and `ContractDetailData`, not against data:
    // `client_source_docs_contracts` has zero rows on staging, and that is not
    // a broken write path — the seven audit events belong to a document that a
    // client wipe removed (finding B1, answered by the app side). Every value
    // in the contract stories is therefore made up, with notice.
    facts: (d) => {
      const rows: FactRow[] = [
        { label: "Vertragstyp", value: contractTypeLabel(d.contractType) },
        { label: "Laufzeit", value: term(d) },
      ];
      // Each booking-relevant fact carries where it comes from — read
      // automatically or entered by a person. Whoever books against it has to
      // see the difference without opening the extraction.
      for (const fact of d.bookingFacts ?? []) {
        rows.push({
          label: fact.key,
          value: `${fact.value} · ${fact.source === "manual" ? "von Hand" : "automatisch gelesen"}`,
        });
      }
      return rows;
    },
  },
};

/**
 * „15.01.2026 – 14.01.2029 · 36 Monate" · „seit 15.01.2026 · unbefristet".
 *
 * No end date and open-ended are two different statements: the first is a gap
 * in the extraction, the second is a property of the contract.
 */
function term(d: DetailOf<"contract">): string {
  const start = d.startDate ? formatTime(d.startDate, "date") : null;
  const parts: string[] = [];
  if (start && d.endDate) parts.push(`${start} – ${formatTime(d.endDate, "date")}`);
  else if (start) parts.push(`seit ${start}`);
  if (d.isOpenEnded) parts.push("unbefristet");
  else if (d.durationMonths) parts.push(`${d.durationMonths} Monate`);
  return parts.length > 0 ? parts.join(" · ") : "—";
}

/** What the specialization contributes once both sources have agreed. */
export interface ResolvedDetail {
  identifier: SourceDocIdentifier | null;
  measure: SourceDocMeasure | null;
  facts: FactRow[];
}

/**
 * The one place the two sources are held against each other. `null` means
 * „show the supertype points alone" — for a document without a subtype row and
 * for one whose row contradicts its discriminator, and for the same reason:
 * the form does not claim what one of the two denies.
 *
 * @when    A form needs to know what the specialization fills into ranks 3 and 5.
 * @instead The field rows of the specialization → `detailFacts` (0076). The
 *          label of the kind → `sourceDocTypeLabel()`, which is a label, not a row.
 */
export function resolveSourceDocumentDetail(
  sourceDocType: string | null | undefined,
  detail: SourceDocumentDetail | null | undefined,
): ResolvedDetail | null {
  if (!detail) return null;
  const entry = SOURCE_DOCUMENT_DETAILS[detail.kind];
  if (entry.type !== sourceDocType) return null;
  // The entry was looked up **by** `detail.kind`, so the two always belong
  // together — TypeScript cannot carry that correlation across a mapped type
  // (microsoft/TypeScript#30581), and reduces the parameter of the union of
  // entries to `never`. This one cast is where that gap is paid for; the
  // entries themselves stay fully typed.
  const d = detail as never;
  return { identifier: entry.identifier(d), measure: entry.measure(d), facts: entry.facts(d) };
}
