"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { ActionIcon } from "../Icons";
import { formatCount } from "../format";
import { Popover } from "./Popover";
import { TextButton } from "./TextButton";

/**
 * A filter with several values at once (0195).
 *
 * `FilterChips` chooses one value and puts every option on the bar — fine for
 * four states, too wide for fifteen document types. This is the same filter
 * folded into one button: ticks in a list, the count on the right, search once
 * the list gets long.
 *
 * The list is a plain `listbox` rather than `cmdk`: `cmdk` sorts hits by score
 * and uses `aria-selected` for the highlighted row, and here the order is the
 * caller's and `aria-selected` means ticked.
 */

export interface MultiSelectOption {
  key: string;
  /** Left, one line, clipped; the whole text is in the tooltip. */
  label: string;
  /** Right, as a count in tabular figures; `0` is dimmed but stays pickable. */
  count?: number;
  /** Right, before `count` — usually a `Badge` or `StatusBadge`, built by the caller. */
  badge?: ReactNode;
  /** Heading the option stands under; groups in the order of their first option. */
  group?: string;
  /** Second line, searched as well — the account number under the name. */
  hint?: string;
}

/** From this many options on, the list gets a search field by itself. */
const SEARCH_FROM = 8;

/**
 * Two modes, like `<input>`: **controlled** with `selected` + `onChange` (a
 * client page holds the state), or **uncontrolled** with `defaultSelected` +
 * `name` — what a server page renders, since it cannot hand over a function:
 * the ticks live here, the hidden fields carry them into the GET form, and
 * `FilterBar autoSubmit` sends it.
 *
 * @when    Narrowing a list by one dimension with several values at once —
 *          document types, accounts —, above the card in a FilterBar.
 * @instead One of a handful of exclusive values → FilterChips. One value out
 *          of many in a form → Combobox. A period → DateRangeField.
 */
export function MultiSelectFilter({
  label,
  options,
  selected: controlled,
  defaultSelected,
  onChange,
  name,
  searchPlaceholder = "Suchen …",
  disabled,
}: {
  /** The word on the trigger and the name of the list („Belegart"). */
  label: string;
  options: readonly MultiSelectOption[];
  /** The ticked keys; empty means no filter. Leave it out for the uncontrolled mode. */
  selected?: readonly string[];
  /** Uncontrolled: the ticks to start with, e.g. from the query string of a server page. */
  defaultSelected?: readonly string[];
  /** On every tick, with the new set in the order of `options`. */
  onChange?: (keys: string[]) => void;
  /** Server form: one hidden field per ticked key — `?name=a&name=b`. */
  name?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const [own, setOwn] = useState<readonly string[]>(defaultSelected ?? []);
  const selected = controlled ?? own;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [minWidth, setMinWidth] = useState<number | undefined>();
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const fields = useRef<HTMLSpanElement>(null);
  const key = selected.join("\u0000");
  const firstKey = useRef(key);

  // A form with `FilterBar autoSubmit` hears hidden fields only through a
  // bubbling `change` (0200) — not on the first render, only on a change.
  useEffect(() => {
    if (key === firstKey.current) return;
    firstKey.current = key;
    fields.current?.dispatchEvent(new Event("change", { bubbles: true }));
  }, [key]);

  const chosen = useMemo(() => new Set(selected), [selected]);
  const withSearch = options.length >= SEARCH_FROM;
  const empty = options.length === 0;
  // A row without a count keeps the column, so badges line up with each other.
  const countColumn = options.some((o) => o.count !== undefined);

  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || (o.hint?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query]);

  // Focus goes into the field once it is shown — the Popover opens it in its
  // own effect, which runs before this one.
  useEffect(() => {
    if (!open) return;
    (withSearch ? search.current : list.current)?.focus();
  }, [open, withSearch]);

  useEffect(() => {
    list.current?.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function setOpenState(next: boolean) {
    if (next) {
      setMinWidth(trigger.current?.offsetWidth);
      setActive(0);
    } else {
      setQuery("");
    }
    setOpen(next);
  }

  function close() {
    setOpenState(false);
    trigger.current?.focus();
  }

  function toggle(key: string) {
    const next = chosen.has(key) ? selected.filter((k) => k !== key) : [...selected, key];
    const set = new Set(next);
    change(options.filter((o) => set.has(o.key)).map((o) => o.key));
  }

  function change(keys: string[]) {
    if (controlled === undefined) setOwn(keys);
    onChange?.(keys);
  }

  function onListKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, Math.min(hits.length - 1, i + (e.key === "ArrowDown" ? 1 : -1))));
    } else if (e.key === "Enter" || (e.key === " " && !withSearch)) {
      // Space types into the search field, so there it is Enter only.
      e.preventDefault();
      const hit = hits[active];
      if (hit) toggle(hit.key);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  const summary = empty
    ? "keine Werte"
    : selected.length === 0
      ? "Alle"
      : selected.length === 1
        ? (options.find((o) => o.key === selected[0])?.label ?? selected[0])
        : `${selected.length} gewählt`;

  const activeId = hits[active] ? `${id}-${active}` : undefined;
  let lastGroup: string | undefined;

  return (
    <>
      {name ? (
        <span ref={fields} hidden>
          {selected.map((k) => (
            <input key={k} type="hidden" name={name} value={k} />
          ))}
        </span>
      ) : null}
      <Popover
        open={open}
        onOpenChange={setOpenState}
        trigger={
          <button
            ref={trigger}
            type="button"
            className={`v2in v3msel__trigger${selected.length > 0 ? " is-set" : ""}`}
            aria-haspopup="listbox"
            disabled={disabled || empty}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" && !open) {
                e.preventDefault();
                setOpenState(true);
              }
            }}
          >
            <span className="v3msel__label">{label}:</span>
            <span className="v3msel__value">{summary}</span>
            <ActionIcon action="expand" size={14} className="v3msel__chevron" />
          </button>
        }
      >
        <div
          className="v3msel"
          style={minWidth ? ({ "--v3msel-min": `${minWidth}px` } as CSSProperties) : undefined}
          onBlur={(e) => {
            // Tab out of the field closes it; a click on the trigger is the
            // trigger's own toggle.
            const to = e.relatedTarget as Node | null;
            if (to && !e.currentTarget.contains(to) && to !== trigger.current) setOpenState(false);
          }}
        >
          {withSearch ? (
            <input
              ref={search}
              type="search"
              className="v2in v3msel__search"
              placeholder={searchPlaceholder}
              aria-label={`${label} durchsuchen`}
              aria-controls={`${id}-list`}
              aria-activedescendant={activeId}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onListKey}
            />
          ) : null}
          <div
            ref={list}
            id={`${id}-list`}
            className="v3msel__list"
            role="listbox"
            aria-label={label}
            aria-multiselectable="true"
            aria-activedescendant={withSearch ? undefined : activeId}
            tabIndex={withSearch ? -1 : 0}
            onKeyDown={withSearch ? undefined : onListKey}
          >
            {hits.length === 0 ? (
              <div className="v3msel__empty">Keine Treffer für „{query.trim()}“.</div>
            ) : (
              hits.map((o, i) => {
                const head = o.group && o.group !== lastGroup ? o.group : null;
                lastGroup = o.group;
                const on = chosen.has(o.key);
                return (
                  <div key={o.key} role="presentation">
                    {head ? (
                      <div className="v3msel__group" role="presentation">
                        {head}
                      </div>
                    ) : null}
                    <div
                      id={`${id}-${i}`}
                      role="option"
                      aria-selected={on}
                      className={`v3msel__opt${i === active ? " is-active" : ""}`}
                      title={o.hint ? `${o.label} · ${o.hint}` : o.label}
                      onMouseEnter={() => setActive(i)}
                      // Keep the focus in the search field or list, not on the row.
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggle(o.key)}
                    >
                      <input
                        type="checkbox"
                        className="v2check"
                        checked={on}
                        readOnly
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                      <span className="v3msel__text">
                        <span className="v3msel__name">{o.label}</span>
                        {o.hint ? <span className="v3msel__hint">{o.hint}</span> : null}
                      </span>
                      {o.badge ? <span className="v3msel__badge">{o.badge}</span> : null}
                      {o.count === undefined ? (
                        countColumn ? <span className="v3msel__count" /> : null
                      ) : (
                        <span className={`v3msel__count${o.count === 0 ? " is-zero" : ""}`}>
                          {formatCount(o.count)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {selected.length > 0 ? (
            <div className="v3msel__foot">
              <TextButton tone="quiet" onClick={() => change([])}>
                Alle anzeigen
              </TextButton>
            </div>
          ) : null}
        </div>
      </Popover>
    </>
  );
}
