"use client";

import type { BusinessPartnerListItem } from "@/ludwig/modules/business-partners/domain/business-partner";

import { useState } from "react";

import { Combobox, type ComboboxOption } from "../../primitives/Combobox";

/**
 * Choosing a business partner (0141).
 *
 * There is exactly one question this answers: „who is the counterparty?" The
 * app asks it today with a `CreditorCombobox` in the ask dialog of the
 * open-items list, and the GLOSSARY wants the same grip for the outgoing
 * invoice, to resolve the recipient against the partners.
 *
 * The difficulty is the size: **6,363 partners at the p90** — and the
 * accountant usually has an **account number** in front of her, not a name.
 * „Who is 70123?" is the question the field has to answer.
 */

/** What the picker needs of a partner. Less than the list shows, not other. */
export type BusinessPartnerPickerItem = Pick<
  BusinessPartnerListItem,
  | "businessPartnerId"
  | "legalName"
  | "shortName"
  | "city"
  | "creditorAccount"
  | "debtorAccount"
  | "ustIds"
>;

/**
 * The value that means „no particular supplier" — the sundry pool.
 *
 * It is not `null`: `null` means „nothing chosen yet", and telling the two
 * apart is the point. There are documents that are **not supposed** to get a
 * master record.
 */
export const DIVERSE = "__diverse";

function numbers(p: BusinessPartnerPickerItem): string[] {
  return [p.creditorAccount?.accountNumber, p.debtorAccount?.accountNumber].filter(
    (n): n is string => !!n,
  );
}

/**
 * **The picker filters, not the combobox.** `Combobox` narrows over `label`
 * and `value`; searched here are four fields, and the account number is the
 * most common reason to come at all. A picker that does not find by number is
 * none — the same decision as in `CasePicker` (approved 2026-09-07).
 *
 * The **city** is deliberately not matched: it tells two partners of the same
 * name apart (it resolves 35 % of the name collisions), but nobody types a
 * town to find a supplier.
 */
function matches(p: BusinessPartnerPickerItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [p.legalName, p.shortName, ...numbers(p), ...p.ustIds].some((field) =>
    field?.toLowerCase().includes(q),
  );
}

/** Number, short name and town — what tells two hits apart. */
function hintOf(p: BusinessPartnerPickerItem): string | undefined {
  const parts = [...numbers(p)];
  if (p.shortName && p.shortName.toLowerCase() !== p.legalName.toLowerCase()) {
    parts.push(p.shortName);
  }
  if (p.city) parts.push(p.city);
  return parts.length > 0 ? parts.join(" · ") : undefined;
}

/**
 * @when    Assigning a document, a case or a bank line to a business partner — searchable by name, short name, account number and VAT id.
 * @instead Naming one inside foreign markup → BusinessPartnerCell. Everything about one → BusinessPartnerFacts. The list of all of them → businessPartnerColumns.
 */
export function BusinessPartnerPicker({
  label,
  value,
  onChange,
  partners,
  onSearch,
  allowDiverse = false,
  loading,
  error,
  disabled,
  emptyText = "Kein Geschäftspartner mit diesem Suchbegriff.",
  noPartnersText = "Für diesen Mandanten sind noch keine Geschäftspartner importiert.",
}: {
  label: string;
  /** The chosen id, `DIVERSE` for the pool, `null` for „nothing yet". */
  value: string | null;
  onChange: (partnerId: string | null) => void;
  /** The candidates, sorted and limited by the caller. */
  partners: readonly BusinessPartnerPickerItem[];
  /**
   * Says what is being searched for, so the caller can load more. At 6,363
   * rows that is the normal case, not the exception.
   */
  onSearch?: (query: string) => void;
  /**
   * Offers „Ohne konkreten Lieferanten" as the first option. Off by default:
   * not every choice may point at nothing.
   */
  allowDiverse?: boolean;
  loading?: boolean;
  /** The search failed — the sentence stands at the field, not in the list. */
  error?: string;
  disabled?: boolean;
  /** Nothing matched the search. */
  emptyText?: string;
  /**
   * There is no partner at all. A different sentence from „no hit": the first
   * is a finding about the stock, the second a problem with the search.
   */
  noPartnersText?: string;
}) {
  // The query lives **here**, not in the combobox — because the narrowing does
  // too. Passing `onSearch` switches the combobox's own local filter off, so
  // whoever passes it has to filter; and passing nothing would leave the
  // combobox filtering over label and value, which never finds a number.
  const [query, setQuery] = useState("");
  const hits = filterBusinessPartners(partners, query);

  const options: ComboboxOption[] = [
    ...(allowDiverse
      ? [{ value: DIVERSE, label: "Ohne konkreten Lieferanten", hint: "Sammelkonto Diverse" }]
      : []),
    ...hits.map((p) => {
      const hint = hintOf(p);
      return {
        value: p.businessPartnerId,
        label: p.legalName,
        ...(hint ? { hint } : {}),
      };
    }),
  ];

  return (
    <Combobox
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      onSearch={(q) => {
        setQuery(q);
        // Also on an empty query — that was the hole in 0084: the callback
        // stayed silent on clearing, and a state arose where `value` was set
        // and the field empty.
        onSearch?.(q);
      }}
      {...(loading ? { loading } : {})}
      {...(error ? { error } : {})}
      {...(disabled ? { disabled } : {})}
      emptyText={partners.length === 0 ? noPartnersText : emptyText}
    />
  );
}

/**
 * Narrows the candidates over the four fields — for a caller that filters in
 * the client instead of on the server.
 *
 * @when    A page holds all partners of a client in memory and wants the same narrowing the picker would do.
 * @instead The server narrows → pass the hits to the picker and use `onSearch` to load them.
 */
export function filterBusinessPartners(
  partners: readonly BusinessPartnerPickerItem[],
  query: string,
): BusinessPartnerPickerItem[] {
  return partners.filter((p) => matches(p, query));
}
