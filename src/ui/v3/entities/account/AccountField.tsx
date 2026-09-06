"use client";

import { ActionIcon } from "../../Icons";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { IconButton } from "../../primitives/IconButton";

/**
 * Account picker with candidates (F123 T123.1).
 *
 * The groups answer the question "why is this account at the top?": the
 * **agent** suggested it, the **partner** got it last time, **similar** comes
 * from comparable documents, **document line** is what the paper says, **all**
 * is the rest of the chart of accounts. Without the group the order would be
 * an assertion.
 *
 * Knows no module: candidates and search come in as props (the loader is a
 * prop too). The full-text search covers number **and** name — clerks type
 * both.
 *
 * At rest it shows number **and** name (0013): the value is the number, but
 * the choice is checked against the name. Whoever offers the account sheet
 * passes `onOpenLedger` — the caller opens the drawer, the field only reports
 * the wish.
 */

export interface AccountCandidate {
  /** The account number. In Ludwig always identical to the DATEV number. */
  number: string;
  name: string;
  /** Why this account is suggested — one line, not a score. */
  reason?: string;
}

export type AccountGroup = "agent" | "partner" | "aehnlich" | "belegposition" | "alle";

/** The words of the four candidate groups — where a suggestion came from. */
export const ACCOUNT_GROUP_LABEL: Record<AccountGroup, string> = {
  agent: "Vorschlag des Agenten",
  partner: "Zuletzt bei dieser Gegenpartei",
  aehnlich: "Ähnliche Belege",
  belegposition: "Aus der Beleg-Position",
  alle: "Alle Konten",
};

const GROUP_ORDER: AccountGroup[] = ["agent", "partner", "aehnlich", "belegposition", "alle"];

/**
 * @when    Choosing an account, with candidates from agent, partner, similar and document line — and, with `onOpenLedger`, the way to its account sheet.
 * @instead Short fixed list → Select.
 */
export function AccountField({
  value,
  valueName,
  onChange,
  candidates,
  onSearch,
  onOpenLedger,
  placeholder = "Nummer oder Name",
  invalid,
  ariaLabel = "Konto",
  id,
}: {
  value: string;
  /**
   * Name of the selected account for the first render, when the value comes
   * from outside (an editor loading a booking). After that the field knows it
   * from the selection itself — a later change of this prop is ignored, so
   * remount the field (`key`) when the caller switches to another record.
   */
  valueName?: string;
  /**
   * The second argument carries the chosen candidate, so nobody has to look
   * the name up again. On free input (no candidate hit) it stays `undefined`.
   */
  onChange: (number: string, account?: AccountCandidate) => void;
  /** Candidates per group. Empty groups are not shown. */
  candidates: Partial<Record<AccountGroup, AccountCandidate[]>>;
  /**
   * Full-text search over the chart of accounts. Without a loader the field
   * only filters the candidates it was given — no silent fallback to "nothing
   * found".
   */
  onSearch?: (query: string) => Promise<AccountCandidate[]>;
  /**
   * Way to the account sheet. Given → the icon appears at the edge of the
   * field; left out → no icon and no empty slot.
   */
  onOpenLedger?: (accountNumber: string) => void;
  placeholder?: string;
  invalid?: boolean;
  ariaLabel?: string;
  /**
   * What the `htmlFor` of a surrounding `Field` points at (0104) — it lands on
   * the input, not on the carrier: an id on the `div` would label a box.
   */
  id?: string;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hits, setHits] = useState<AccountCandidate[] | null>(null);
  // The choice itself carries the name; `valueName` fills it for the first
  // render, so nobody has to open the list to see what is in the field.
  const [chosen, setChosen] = useState<AccountCandidate | null>(
    value && valueName ? { number: value, name: valueName } : null,
  );
  const box = useRef<HTMLDivElement>(null);
  // Two account fields on one page must not point at the same list — the
  // id used to be a fixed literal (same defect as in 0021 and 0028).
  const listId = useId();

  useEffect(() => {
    setQuery(value);
    // A value from outside, or one typed freely, no longer belongs to the
    // previous choice.
    setChosen((c) => (c && c.number === value ? c : null));
  }, [value]);

  useEffect(() => {
    if (!onSearch || query.trim().length < 2) {
      setHits(null);
      return;
    }
    let cancelled = false;
    const t = setTimeout(() => {
      void onSearch(query.trim()).then((r) => {
        if (!cancelled) setHits(r);
      });
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, onSearch]);

  useEffect(() => {
    const outside = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (c: AccountCandidate) =>
      q.length === 0 || c.number.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    const out = GROUP_ORDER.map((g) => ({
      key: g,
      label: ACCOUNT_GROUP_LABEL[g],
      items: (candidates[g] ?? []).filter(matches),
    })).filter((g) => g.items.length > 0);
    if (hits && hits.length > 0) {
      out.push({ key: "alle" as AccountGroup, label: ACCOUNT_GROUP_LABEL.alle, items: hits });
    }
    return out;
  }, [candidates, query, hits]);

  // The name comes from the choice or from the candidates that were handed
  // in. If it is nowhere to be had, the number stands alone — nothing is
  // looked up, that would be a load (0013).
  const name = useMemo(() => {
    if (!value) return undefined;
    if (chosen?.number === value) return chosen.name;
    for (const list of Object.values(candidates)) {
      const hit = list?.find((c) => c.number === value);
      if (hit) return hit.name;
    }
    return undefined;
  }, [value, chosen, candidates]);

  // At rest: number and name. While being worked on: the plain search text, so
  // that typing does not run against a composed string.
  const resting = !focused && Boolean(value) && Boolean(name);

  function choose(c: AccountCandidate) {
    setChosen(c);
    onChange(c.number, c);
    setQuery(c.number);
    setOpen(false);
  }

  return (
    <div ref={box} className="v2kf">
      <div className="v2kf__box">
        <input
          id={id}
          className={`v2in v2kf__in${resting ? " v2kf__in--rest" : ""}${
            onOpenLedger ? " v2kf__in--ledger" : ""
          }${invalid ? " v2in--invalid" : ""}`}
          value={query}
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          role="combobox"
          aria-controls={listId}
          autoComplete="off"
          placeholder={placeholder}
          onFocus={(e) => {
            setFocused(true);
            setOpen(true);
            // The number stands there selected; typing replaces it.
            e.target.select();
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            setFocused(false);
            onChange(query.trim());
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && open && groups[0]?.items[0]) {
              e.preventDefault();
              choose(groups[0].items[0]);
            }
          }}
        />
        {resting ? (
          <span className="v2kf__shown" aria-hidden="true">
            <span className="v2kf__num">{value}</span>
            <span className="v2kf__nm">{name}</span>
          </span>
        ) : null}
        {onOpenLedger ? (
          <span className="v2kf__ledger">
            <IconButton
              size="sm"
              label={value ? `Kontenblatt zu ${value}` : "Kontenblatt"}
              icon={<ActionIcon action="ledger" size={14} />}
              disabled={!value}
              // Without this the focus leaves the field — the list would stay
              // open, but the value would be reported as if it had been left.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onOpenLedger(value)}
            />
          </span>
        ) : null}
      </div>
      {open ? (
        <div className="v2kf__pop" id={listId} role="listbox">
          {groups.length === 0 ? (
            <div className="v2kf__empty">
              Kein Konto zu „{query}" — weder unter den Vorschlägen noch im Kontenrahmen.
            </div>
          ) : (
            groups.map((g) => (
              <div key={g.key}>
                <div className="v2kf__grp">{g.label}</div>
                {g.items.map((c) => (
                  <button
                    key={`${g.key}-${c.number}`}
                    type="button"
                    role="option"
                    aria-selected={c.number === value}
                    className={`v2kf__opt${c.number === value ? " is-active" : ""}`}
                    onClick={() => choose(c)}
                  >
                    <span className="v2kf__num">{c.number}</span>
                    <span className="v2kf__name">{c.name}</span>
                    {c.reason ? <span className="v2kf__why">{c.reason}</span> : null}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
