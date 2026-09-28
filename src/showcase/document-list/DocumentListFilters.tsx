"use client";

import { useState } from "react";
import { CATEGORY_ICON, CategoryIcon, type DocCategoryKey } from "@/ui/v3/Icons";
import { ActiveFilters, type ActiveFilter } from "@/ui/v3/primitives/ActiveFilters";
import { AmountInput } from "@/ui/v3/primitives/AmountInput";
import { Button } from "@/ui/v3/primitives/Button";
import { DateRangeField } from "@/ui/v3/primitives/DateField";
import { Checkbox, Field, Select } from "@/ui/v3/primitives/Form";
import { FilterChips, SearchInput, Segmented } from "@/ui/v3/primitives/Nav";
import { Popover } from "@/ui/v3/primitives/Popover";

/**
 * The filters of the document list (0209, brief F329), in two levels and a
 * line of what is set:
 *
 *  1. Quick filters (rank 1) as chips with their count — one answer to „what
 *     is still to do", no checkbox „Nur unerledigte", no status field beside it.
 *  2. The categories (rank 2) as toggle chips with **the same signs as the
 *     column** (0205), several at once, plus „ohne Einordnung".
 *  3. Search stays visible; everything else of ranks 3 and 4 — date with its
 *     axis, amount, batch, case with/without, the fine document status — sits
 *     behind one „Filter" that closes with „Anwenden" (no auto-submit for
 *     multiple choices, F329 idea 1).
 *  4. What is set (rank 5) as removable chips over the list, with „x von y".
 *
 * A composition; the state is the page's. The words of the axes come from the
 * registry in the app.
 */

export type Preset = "all" | "open" | "stuck" | "client" | "done";
export type Category = DocCategoryKey;

export interface FilterState {
  preset: Preset;
  categories: readonly Category[];
  q: string;
  dateAxis: "document" | "received";
  from: string | null;
  to: string | null;
  amountFrom: number | null;
  amountTo: number | null;
  batch: string;
  hasCase: "all" | "with" | "without";
  statuses: readonly string[];
  partner: { id: string; name: string } | null;
}

export const EMPTY: FilterState = {
  preset: "all",
  categories: [],
  q: "",
  dateAxis: "document",
  from: null,
  to: null,
  amountFrom: null,
  amountTo: null,
  batch: "",
  hasCase: "all",
  statuses: [],
  partner: null,
};

const PRESETS: { key: Preset; label: string }[] = [
  { key: "open", label: "Offen" },
  { key: "stuck", label: "Hängt" },
  { key: "client", label: "Wartet auf Mandant" },
  { key: "done", label: "Erledigt" },
  { key: "all", label: "Alle" },
];

const CATEGORIES: Category[] = ["performance", "payment", "foundation", "internal", "report", "none"];
const CATEGORY_WORD: Record<Category, string> = { ...Object.fromEntries(CATEGORIES.map((c) => [c, CATEGORY_ICON[c].label])), none: "ohne Einordnung" } as Record<Category, string>;

const STATUSES: [string, string][] = [
  ["pending", "Wird eingeordnet"],
  ["extracting", "Wird ausgelesen"],
  ["agent_review", "Ludwig prüft"],
  ["human_review", "Kanzlei prüft"],
  ["bookable", "Bereit zur Buchung"],
  ["done", "Erledigt"],
];
const BATCHES: [string, string][] = [
  ["", "alle Stapel"],
  ["none", "ohne Stapel"],
  ["2026-0009", "2026-0009 · August"],
  ["2026-0008", "2026-0008 · Juli"],
  ["2026-0007", "2026-0007 · Juni"],
];

const day = (iso: string) => iso.split("-").reverse().join(".");
const euro = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Every set filter in words — the chips of rank 5. The quick filter and the categories show themselves as pressed chips and are not repeated. */
export function describe(s: FilterState, set: (next: FilterState) => void): ActiveFilter[] {
  const out: ActiveFilter[] = [];
  if (s.q) out.push({ key: "q", label: `Suche „${s.q}"`, onRemove: () => set({ ...s, q: "" }) });
  if (s.from || s.to) {
    const axis = s.dateAxis === "document" ? "Belegdatum" : "Eingang beim Mandanten";
    const span = s.from && s.to ? `${day(s.from)} – ${day(s.to)}` : s.from ? `ab ${day(s.from)}` : `bis ${day(s.to!)}`;
    out.push({ key: "date", label: `${axis} ${span}`, onRemove: () => set({ ...s, from: null, to: null }) });
  }
  if (s.amountFrom !== null || s.amountTo !== null) {
    const span =
      s.amountFrom !== null && s.amountTo !== null
        ? `${euro(s.amountFrom)} – ${euro(s.amountTo)} €`
        : s.amountFrom !== null
          ? `ab ${euro(s.amountFrom)} €`
          : `bis ${euro(s.amountTo!)} €`;
    out.push({ key: "amount", label: `Betrag ${span}`, onRemove: () => set({ ...s, amountFrom: null, amountTo: null }) });
  }
  if (s.batch) {
    const label = BATCHES.find(([k]) => k === s.batch)?.[1] ?? s.batch;
    out.push({ key: "batch", label: s.batch === "none" ? "ohne Stapel" : `Stapel ${label}`, onRemove: () => set({ ...s, batch: "" }) });
  }
  if (s.hasCase !== "all")
    out.push({ key: "case", label: s.hasCase === "with" ? "mit Sachverhalt" : "ohne Sachverhalt", onRemove: () => set({ ...s, hasCase: "all" }) });
  if (s.statuses.length)
    out.push({
      key: "status",
      label: `Belegstatus: ${s.statuses.map((k) => STATUSES.find(([v]) => v === k)?.[1] ?? k).join(", ")}`,
      onRemove: () => set({ ...s, statuses: [] }),
    });
  if (s.partner) out.push({ key: "partner", label: s.partner.name, onRemove: () => set({ ...s, partner: null }) });
  return out;
}

/** How many of the fields behind „Filter" are set — the number on the handle. */
function moreCount(s: FilterState): number {
  return [s.from || s.to, s.amountFrom !== null || s.amountTo !== null, s.batch, s.hasCase !== "all", s.statuses.length].filter(Boolean).length;
}

/** Ranks 3 and 4 behind one handle; changes are a draft until „Anwenden". */
function MoreFilters({ state, apply }: { state: FilterState; apply: (next: FilterState) => void }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(state);
  const n = moreCount(state);
  return (
    <Popover
      align="end"
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(state);
      }}
      trigger={
        <Button variant="secondary" size="sm">
          {n ? `Filter (${n})` : "Filter"}
        </Button>
      }
    >
      <div className="dlf-more">
        <Field label="Datum" htmlFor="dlf-axis">
          <div className="dlf-stack">
            <Select id="dlf-axis" value={draft.dateAxis} onChange={(e) => setDraft({ ...draft, dateAxis: e.target.value as FilterState["dateAxis"] })}>
              <option value="document">Belegdatum</option>
              <option value="received">Eingang beim Mandanten</option>
            </Select>
            <DateRangeField from={draft.from} to={draft.to} onChange={(from, to) => setDraft({ ...draft, from, to })} />
          </div>
        </Field>
        <div className="dlf-row">
          <AmountInput label="Betrag von" value={draft.amountFrom} onChange={(v) => setDraft({ ...draft, amountFrom: v })} size="sm" />
          <AmountInput label="bis" value={draft.amountTo} onChange={(v) => setDraft({ ...draft, amountTo: v })} size="sm" />
        </div>
        <p className="dlf-hint">Der Betrag steht nur an Rechnungen; andere Belege fallen bei diesem Filter heraus.</p>
        <Field label="Stapel" htmlFor="dlf-batch">
          <Select id="dlf-batch" value={draft.batch} onChange={(e) => setDraft({ ...draft, batch: e.target.value })}>
            {BATCHES.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <div>
          <div className="dlf-label">Sachverhalt</div>
          <Segmented
            ariaLabel="Sachverhalt"
            active={draft.hasCase}
            onPick={(k) => setDraft({ ...draft, hasCase: k as FilterState["hasCase"] })}
            options={[
              { key: "all", label: "alle" },
              { key: "with", label: "mit" },
              { key: "without", label: "ohne" },
            ]}
          />
        </div>
        <fieldset className="dlf-status">
          <legend className="dlf-label">Belegstatus</legend>
          {STATUSES.map(([k, l]) => (
            <Checkbox
              key={k}
              label={l}
              checked={draft.statuses.includes(k)}
              onChange={(e) =>
                setDraft({ ...draft, statuses: e.target.checked ? [...draft.statuses, k] : draft.statuses.filter((x) => x !== k) })
              }
            />
          ))}
        </fieldset>
        <div className="dlf-actions">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              apply(draft);
              setOpen(false);
            }}
          >
            Anwenden
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
        </div>
      </div>
    </Popover>
  );
}

export function DocumentListFilters({
  initial,
  counts,
  result,
  onChange,
}: {
  initial: FilterState;
  /** The count of each quick filter and category, counted with the list's filter (I12). */
  counts: { presets: Record<Preset, number>; categories: Record<Category, number> };
  result: { shown: number; total: number };
  /** Every change of the state — the page filters its rows with it. */
  onChange?: (next: FilterState) => void;
}) {
  const [s, setState] = useState(initial);
  const set = (next: FilterState) => {
    setState(next);
    onChange?.(next);
  };
  return (
    <div className="dlf">
      <div className="dlf-top">
        <FilterChips
          label="Stand"
          active={s.preset}
          onPick={(k) => set({ ...s, preset: k as Preset })}
          options={PRESETS.map((p) => ({ key: p.key, label: p.label, count: counts.presets[p.key] }))}
        />
        <div className="dlf-tools">
          <SearchInput placeholder="Beleg, Gegenpart, Nummer" value={s.q} onChange={(q) => set({ ...s, q })} ariaLabel="Belege durchsuchen" />
          <MoreFilters state={s} apply={set} />
        </div>
      </div>
      <FilterChips
        label="Einordnung"
        active={s.categories}
        onPick={(k) =>
          set({
            ...s,
            categories: s.categories.includes(k as Category) ? s.categories.filter((c) => c !== k) : [...s.categories, k as Category],
          })
        }
        options={CATEGORIES.map((c) => ({
          key: c,
          label: CATEGORY_WORD[c],
          icon: <CategoryIcon category={c} size={14} />,
          count: counts.categories[c],
        }))}
      />
      <ActiveFilters
        filters={describe(s, set)}
        result={{ ...result, unit: ["Beleg", "Belegen"] }}
        onResetAll={() => set({ ...EMPTY, preset: s.preset, categories: s.categories })}
      />
    </div>
  );
}
