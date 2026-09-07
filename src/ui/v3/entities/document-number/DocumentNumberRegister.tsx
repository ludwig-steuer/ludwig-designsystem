"use client";

import { useRef, useState } from "react";
import {
  isDatevSource,
  sortByDominance,
  type KnownDocumentNumber,
} from "@/ludwig/modules/accounting-cases/domain/document-number";
import { Badge } from "../../primitives/Badge";
import { EmptyState } from "../../primitives/EmptyState";
import { Input } from "../../primitives/Form";
import { TableLoading } from "../../primitives/Cells";
import { HeadRow, Table, rowCells } from "../../primitives/Table";
import type {
  DocumentNumberSourceLabels,
  DocumentNumberStateLabels,
} from "./document-number-labels";

/**
 * The document number register — what is known, and which one holds (0014).
 *
 * The order **is** the answer to „why is that one on top?": it comes from
 * `sortByDominance` in the domain, not from a sort here. Rule 1 of the owner
 * stands behind it: DATEV wins. A number from the DATEV truth is the canonical
 * value of the case and immutable; everything else is a candidate.
 *
 * So every row carries its source visibly. A list that ranks without saying
 * why is a list that has to be trusted, and this one has to be checkable.
 */

/* `minmax(160px, …)`: otherwise the first track falls to 20 px below 760 px,
   and number and mark overwrite the next column (measured: 13 overflows).
   `minWidth` covers the fixed tracks plus four gaps and the padding.

   In px, not in `ch`: a `ch` floor is computed from the element's own font
   size, and head and row sit on different ones (12.5 against 13.5) — the
   track would drift apart (0070). */
const COLS = "minmax(160px, 1fr) 220px 120px 130px 130px";
const MIN_WIDTH = 780;

/**
 * @when    Picking a known document number — in the drawer the caller opens
 *          from `DocumentNumberField`, or on the OPOS page.
 * @instead Entering the number → DocumentNumberField.
 */
export function DocumentNumberRegister({
  entries,
  onPick,
  query,
  onQueryChange,
  loading,
  sourceLabel,
  stateLabel,
}: {
  /** The register, **unsorted** — the component ranks it with `sortByDominance`. */
  entries: KnownDocumentNumber[];
  onPick: (entry: KnownDocumentNumber) => void;
  /** Filters over number, account and case number. */
  query?: string;
  onQueryChange?: (q: string) => void;
  loading?: boolean;
  sourceLabel: DocumentNumberSourceLabels;
  stateLabel: DocumentNumberStateLabels;
}) {
  // `-1`, not `0`: with `0` the first ↓ jumped to row **two**, because it
  // moves from wherever it stands — while row one was already coloured as
  // active. Nothing is focused before the first key press, and now the
  // colour says the same (acceptance of 0014, M5).
  const [active, setActive] = useState(-1);
  const list = useRef<HTMLDivElement>(null);

  const q = (query ?? "").trim().toLowerCase();
  const filtered = q
    ? entries.filter((e) =>
        [e.documentNumber, e.accountNumber, e.caseNumber]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      )
    : entries;
  const rows = sortByDominance(filtered);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const from = active < 0 ? (e.key === "ArrowDown" ? -1 : rows.length) : active;
    const next = Math.max(
      0,
      Math.min(rows.length - 1, from + (e.key === "ArrowDown" ? 1 : -1)),
    );
    setActive(next);
    // Move the **focus**, not a marker: the row's button is a real focus stop,
    // so the reader announces the row instead of the list staying silent.
    list.current?.querySelector<HTMLButtonElement>(`[data-row="${next}"]`)?.focus();
    // Enter is the button's own activation; Esc goes back to the caller — the
    // drawer is his, and so is closing it.
  }

  return (
    <div className="v2dnr" onKeyDown={onKeyDown}>
      {onQueryChange ? (
        <div className="v2dnr__q">
          <Input
            value={query ?? ""}
            onChange={(e) => {
              onQueryChange(e.target.value);
              // `-1`, not `0`: while typing the focus is in the search box, and
              // a coloured row without focus is a state without meaning (V7).
              // With `0` the first ↓ jumped to row **two** and skipped the most
              // dominant one (acceptance of 0014, M3).
              setActive(-1);
            }}
            placeholder="Nummer, Konto oder Sachverhalt"
            aria-label="Register durchsuchen"
          />
        </div>
      ) : null}

      {loading ? (
        // Inside a `Table`, not beside it: the track list and the density live
        // on `.v2tbl`, and five `<tr>` in a `<div>` are neither valid nor a
        // table — measured as one 822-px column instead of five.
        <Table cols={COLS} minWidth={MIN_WIDTH}>
          <TableLoading rows={5} cols={5} />
        </Table>
      ) : rows.length === 0 ? (
        <EmptyState
          inline
          title={q ? `Keine Belegnummer zu „${query}"` : "Noch keine Belegnummer bekannt"}
          description={
            q
              ? "Andere Schreibweise versuchen, oder die Nummer von Hand eintragen — das Register ist ein Angebot, kein Zwang."
              : "Für diesen Mandanten ist noch keine Belegnummer bekannt. Sie entsteht mit der ersten Buchung, dem ersten Beleg oder dem ersten DATEV-Abgleich."
          }
        />
      ) : (
        // **Table, not listbox.** Both at once broke the ownership chain: the
        // option sat under `tbody` and `table`, and the focus stayed on the
        // container, so the active row was only a colour. Now the row's button
        // takes the focus, and ↑/↓ move it — which every reader announces.
        // `min-width: 0` on the wrapper, or the scroll container inside
        // `Table` never gets to scroll: a grid item defaults to `min-width:
        // auto`, so it grows to its content and the card (`overflow-x:
        // hidden`) cuts the columns off instead. Measured at a 700 px
        // viewport: item 836 px in a 626 px card, twenty cells gone
        // (acceptance of 0014, M1).
        <div ref={list} style={{ minWidth: 0 }}>
          <Table cols={COLS} minWidth={MIN_WIDTH}>
            <HeadRow>
              <span>Belegnummer</span>
              <span>Quelle</span>
              <span>Konto</span>
              <span>Sachverhalt</span>
              <span>Zustand</span>
            </HeadRow>
            {rows.map((e, i) => (
              <tr
                key={`${e.source}-${e.documentNumber}-${e.caseId ?? ""}`}
                className={`v2tbl__row is-clickable${i === active ? " is-active" : ""}`}
              >
                {rowCells(
                  <>
                <span className="v2dnr__num">
                      <span className="v2mono">{e.documentNumber}</span>
                      {/* Immutable is the whole point of rule 1, so it stands at
                          the row — not in a tooltip. */}
                      {/* The mark reads the **source**, not `immutable`: in the fixture the
                          two coincide, but an entry from DATEV that is still open
                          would lose its mark (acceptance of 0014, M6). */}
                      {isDatevSource(e.source) ? <Badge tone="info">DATEV</Badge> : null}
                      {e.orphaned ? <Badge tone="warning">verwaist</Badge> : null}
                    </span>
                    {/* No second „DATEV": the badge in column 1 already says
                        it, and the same statement twice is noise. */}
                    <span>{sourceLabel[e.source]}</span>
                    <span className="v2mono">
                      {e.accountNumber ?? <span className="v2muted">—</span>}
                    </span>
                    <span>{e.caseNumber ?? <span className="v2muted">—</span>}</span>
                    <span className="v2dnr__state">{stateLabel[e.state]}</span>

                  </>,
                  (node) => (
                    <button
                      type="button"
                      className="v2rowbtn"
                      data-row={i}
                      onClick={() => {
                        setActive(i);
                        onPick(e);
                      }}
                      onFocus={() => setActive(i)}
                    >
                      {node}
                    </button>
                  ),
                )}
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
