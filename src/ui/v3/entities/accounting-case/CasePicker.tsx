"use client";

import { useMemo, useState } from "react";

import type { CaseListItem } from "@/ludwig/modules/accounting-cases/domain/case";
import { caseDisplayTitle } from "@/ludwig/modules/accounting-cases/domain/case";
import { asCurrency, formatMoney, money } from "@/ludwig/shared/money";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { Combobox, type ComboboxOption } from "../../primitives/Combobox";
import { caseIdentifier } from "./case-title";

/**
 * The case picker (0084).
 *
 * The `<select>` it replaces pressed „number · kind · 40 characters of the
 * summary" into one option line. At p90 **190 open cases** per client and year
 * that is not a choice, it is a list — and one picks blind: state, amount and
 * counterparty are not in the option.
 */

/** What one hit says, in the order one reads it. */
function hintOf(c: CaseListItem): string {
  const teile: string[] = [caseIdentifier(c)];
  const stand = resolveStatus("sachverhalt", c.lifecycleStatus).label;
  if (stand) teile.push(stand);
  // No amount where there is none (48 % carry one): a dash would claim the
  // value is unknown, and „0,00 €" would be a lie. The currency comes from the
  // case, not from a prop — every case carries its own.
  if (c.totalAmount !== null) {
    teile.push(formatMoney(money(c.totalAmount, asCurrency(c.currency))));
  }
  // The counterparty only where it is not already in the label: without a
  // `title` the fallback chain has put it there (Freigabe 2026-09-07).
  if (c.title && c.counterpartyName) teile.push(c.counterpartyName);
  return teile.join(" · ");
}

/**
 * **The picker filters, not the combobox.** `Combobox` narrows over `label`
 * and `value` only — the identifier sits in the `hint` and would not be found,
 * the summary is nowhere. A picker that does not find by number is none, so
 * the four fields are matched here and only the hits are handed over
 * (Freigabe 2026-09-07). `ComboboxOption.keywords` would be the other way; it
 * waits for a second user.
 */
function matches(c: CaseListItem, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [caseDisplayTitle(c), caseIdentifier(c), c.counterpartyName, c.summary].some(
    (feld) => feld?.toLowerCase().includes(q),
  );
}

/**
 * @when    Assigning something to an existing case — a bank line, a document.
 * @instead The case as a row in a list → CaseRow. Naming it inside a foreign
 *          row → CaseCell. Everything about it → CaseFacts or CaseDrawer.
 */
export function CasePicker({
  label,
  value,
  onChange,
  cases,
  onSearch,
  loading,
  error,
  disabled,
  emptyText = "Kein Sachverhalt mit diesem Suchbegriff.",
  noCasesText = "In diesem Wirtschaftsjahr gibt es noch keinen Sachverhalt.",
}: {
  label: string;
  /** The chosen `caseId`; `null` means none yet. */
  value: string | null;
  /** Choosing and un-choosing — the caller writes, the picker holds nothing. */
  onChange: (caseId: string | null) => void;
  /** The hits, sorted and narrowed by the caller. */
  cases: readonly CaseListItem[];
  /** Tells the caller what is being searched for, so it can load more. */
  onSearch?: (query: string) => void;
  loading?: boolean;
  /** The search failed — the sentence stands at the field, not in the list. */
  error?: string;
  disabled?: boolean;
  /** Nothing matched the search. */
  emptyText?: string;
  /**
   * No case at all. That is a different sentence from „no hit": the first is a
   * finding about the stock, the second a problem with the filter.
   */
  noCasesText?: string;
}) {
  // The query lives here because the filtering does: `Combobox` narrows only
  // over `label` and `value`, and it stops narrowing at all once `onSearch` is
  // set. So the picker keeps what was typed, matches the four fields itself
  // and hands over the hits — with `onSearch` always set, so the combobox does
  // not narrow a second time over the wrong fields.
  const [query, setQuery] = useState("");
  const treffer = useMemo(() => cases.filter((c) => matches(c, query)), [cases, query]);
  const options: ComboboxOption[] = treffer.map((c) => ({
    value: c.caseId,
    label: caseDisplayTitle(c),
    hint: hintOf(c),
  }));

  return (
    <Combobox
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      onSearch={(q) => {
        setQuery(q);
        onSearch?.(q);
      }}
      loading={loading}
      error={error}
      disabled={disabled}
      // Two sentences, because leer means two things: nothing there at all is
      // a finding about the stock, nothing matching is a problem with the
      // filter (§8 of the analysis skill).
      emptyText={cases.length === 0 ? noCasesText : emptyText}
    />
  );
}
