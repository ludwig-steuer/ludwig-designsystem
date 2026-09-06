"use client";

import { ActionIcon } from "../Icons";
import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Field, Input } from "./Form";

/**
 * Search and pick (0009).
 *
 * The generic form of what `AccountField` does for accounts: type, narrow
 * down, walk with the arrow keys, take it with Enter. Keyboard first — the
 * people who use Ludwig work with the keyboard (V11).
 *
 * ponytail: `AccountField` still carries its own copy of this (`.v2kf`).
 * Moving it onto this component is its own task — it also has to keep the
 * ledger icon and the origin groups.
 */

export interface ComboboxOption {
  value: string;
  label: string;
  /** One line under the label — why this one. */
  hint?: string;
  /** Groups the hits under a heading, like the origins in `AccountField`. */
  group?: string;
}

/**
 * @when    Picking one value out of many, with search — account, partner, tax
 *          key, client.
 * @instead A handful of fixed values → Select. Two to seven named ways →
 *          RadioGroup. Narrowing a list instead of picking → FilterChips.
 */
export function Combobox({
  label,
  value,
  onChange,
  options,
  onSearch,
  loading,
  placeholder,
  hint,
  error,
  emptyText = "Kein Treffer — Suchbegriff kürzen.",
  disabled,
  name,
}: {
  label: string;
  value: string | null;
  onChange: (value: string | null) => void;
  options: ComboboxOption[];
  /** For server-side search; without it the options are filtered locally. */
  onSearch?: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  hint?: ReactNode;
  error?: string;
  emptyText?: string;
  disabled?: boolean;
  name?: string;
}) {
  const [query, setQuery] = useState("");
  // `id` binds the word to the field, `name` names it in a form (0104). They
  // used to be one prop, so a combobox without a form had no label either.
  const autoId = useId();
  const fieldId = name ?? autoId;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  // The open list is placed fixed, like the OverflowMenu panel: inside a Card
  // the `overflow` would cut it off (seen in the InUse story, 2026-09-03).
  useLayoutEffect(() => {
    const anchor = box.current;
    const list = pop.current;
    if (!open || !anchor || !list) return;
    const r = anchor.getBoundingClientRect();
    list.style.position = "fixed";
    list.style.top = `${r.bottom + 4}px`;
    list.style.left = `${r.left}px`;
    list.style.width = `${r.width}px`;
  }, [open]);

  // Walking with the arrow keys must not walk out of view — with more than a
  // handful of options the highlighted hit would otherwise be below the fold.
  useLayoutEffect(() => {
    pop.current?.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const chosen = options.find((o) => o.value === value) ?? null;

  const hits = useMemo(() => {
    // While the query is still the pre-filled choice, everything stays
    // visible — otherwise focusing the field would narrow it to one hit.
    if (onSearch || !query.trim() || query === chosen?.label) return options;
    const q = query.trim().toLowerCase();
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, query, onSearch, chosen]);

  // The text in the field: while typing it is the query, otherwise the choice.
  const text = open ? query : (chosen?.label ?? "");

  function pick(option: ComboboxOption) {
    onChange(option.value);
    setQuery("");
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        setActive(0);
        return;
      }
      setActive((i) => {
        const next = e.key === "ArrowDown" ? i + 1 : i - 1;
        return Math.max(0, Math.min(hits.length - 1, next));
      });
      return;
    }
    if (e.key === "Enter" && open) {
      e.preventDefault();
      const hit = hits[active];
      if (hit) pick(hit);
      return;
    }
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      setQuery("");
      return;
    }
    // Backspace in the empty field clears the choice — the fastest way back.
    if (e.key === "Backspace" && !query && value) onChange(null);
  }

  let lastGroup: string | undefined;
  return (
    <Field label={label} hint={hint} error={error} htmlFor={fieldId}>
      <div
        className="v2cmb"
        ref={box}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setOpen(false);
            setQuery("");
          }
        }}
      >
        <Input
          id={fieldId}
          name={name}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${fieldId}-list`}
          autoComplete="off"
          value={text}
          placeholder={placeholder}
          disabled={disabled}
          invalid={Boolean(error)}
          onFocus={(e) => {
            // The chosen value stays visible and is selected — typing replaces
            // it, so the field never looks empty just because it has focus.
            setQuery(chosen?.label ?? "");
            setOpen(true);
            e.target.select();
          }}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
            onSearch?.(e.target.value);
          }}
        />
        {open ? (
          <div className="v2cmb__pop" ref={pop} id={`${fieldId}-list`} role="listbox">
            {loading ? (
              <div className="v2cmb__empty">Suche läuft …</div>
            ) : hits.length === 0 ? (
              <div className="v2cmb__empty">{emptyText}</div>
            ) : (
              hits.map((o, i) => {
                const head = o.group && o.group !== lastGroup ? o.group : null;
                lastGroup = o.group;
                return (
                  <div key={o.value}>
                    {head ? <div className="v2cmb__grp">{head}</div> : null}
                    <button
                      type="button"
                      role="option"
                      aria-selected={o.value === value}
                      className={`v2cmb__opt${i === active ? " is-active" : ""}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => pick(o)}
                    >
                      <span className="v2cmb__mark" aria-hidden="true">
                        {o.value === value ? <ActionIcon action="confirm" size={12} /> : null}
                      </span>
                      <span>
                        {o.label}
                        {o.hint ? <span className="v2cmb__hint"> · {o.hint}</span> : null}
                      </span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div>
    </Field>
  );
}
