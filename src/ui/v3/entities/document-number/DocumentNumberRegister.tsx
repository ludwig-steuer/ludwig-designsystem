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

const COLS = "1fr 150px 120px 130px 130px";

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
  const [active, setActive] = useState(0);
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
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => {
        const next = e.key === "ArrowDown" ? i + 1 : i - 1;
        return Math.max(0, Math.min(rows.length - 1, next));
      });
    }
    if (e.key === "Enter" && rows[active]) {
      e.preventDefault();
      onPick(rows[active]);
    }
    // Esc goes back to the caller — the drawer is his, and so is closing it.
  }

  return (
    <div className="v2dnr" onKeyDown={onKeyDown}>
      {onQueryChange ? (
        <div className="v2dnr__q">
          <Input
            value={query ?? ""}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setActive(0);
            }}
            placeholder="Nummer, Konto oder Sachverhalt"
            aria-label="Register durchsuchen"
          />
        </div>
      ) : null}

      {loading ? (
        <TableLoading rows={5} cols={5} />
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
        <div ref={list} tabIndex={0} role="listbox" aria-label="Bekannte Belegnummern">
          <Table cols={COLS}>
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
                role="option"
                aria-selected={i === active}
                tabIndex={-1}
                className={`v2tbl__row is-clickable${i === active ? " is-active" : ""}`}
                onClick={() => onPick(e)}
              >
                {rowCells(
                  <>
                <span className="v2dnr__num">
                      <span className="v2mono">{e.documentNumber}</span>
                      {/* Immutable is the whole point of rule 1, so it stands at
                          the row — not in a tooltip. */}
                      {e.immutable ? <Badge tone="info">DATEV</Badge> : null}
                      {e.orphaned ? <Badge tone="warning">verwaist</Badge> : null}
                    </span>
                    <span>
                      {sourceLabel[e.source]}
                      {isDatevSource(e.source) ? <span className="v2dnr__datev"> · DATEV</span> : null}
                    </span>
                    <span className="v2mono">
                      {e.accountNumber ?? <span className="v2muted">—</span>}
                    </span>
                    <span>{e.caseNumber ?? <span className="v2muted">—</span>}</span>
                    <span className="v2dnr__state">{stateLabel[e.state]}</span>

                  </>,
                )}
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  );
}
