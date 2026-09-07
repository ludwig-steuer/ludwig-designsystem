"use client";

import { useId } from "react";
import { DATEV_MAX_BELEGFELD1 } from "@/ludwig/core/datev/field-limits";
import type { KnownDocumentNumber } from "@/ludwig/modules/accounting-cases/domain/document-number";
import { ActionIcon } from "../../Icons";
import { IconButton } from "../../primitives/IconButton";
import { TextButton } from "../../primitives/TextButton";
import type { DocumentNumberSourceLabels } from "./document-number-labels";

/**
 * Belegfeld 1, with the way into the register (0014).
 *
 * This is the one place where typing is expensive: **DATEV settles open items
 * by character equality** („Belegnummern-Äquivalenz"). A number that is merely
 * written differently leaves the item open despite a correct booking.
 *
 * The right numbers are known — the document number register carries every
 * known Belegfeld-1 value of a client with its source, account, case and
 * state, and with a ranking that says which one holds. So instead of typing,
 * a person picks; and where what stands in the field differs from what holds,
 * the field says so — as a **hint**, not an error: a deviation can be
 * justified.
 */

/**
 * DATEV's field limit for Belegfeld 1 — **the app's number**, re-exported so
 * the callers of this family keep their import. It stood here as a literal
 * until 2026-09-07, because over there it was a `.max(36)` on four Zod schemas
 * and a number in a comment (finding L-71); `362325b2` gave it a place.
 */
export { DATEV_MAX_BELEGFELD1 };

/**
 * @when    Belegfeld 1 is entered — in the entry editor, in a correction.
 * @instead Choosing an account → AccountField. The list of known numbers →
 *          DocumentNumberRegister.
 */
export function DocumentNumberField({
  id: givenId,
  value,
  onChange,
  onOpenRegister,
  dominant,
  sourceLabel,
  maxLength = DATEV_MAX_BELEGFELD1,
  invalid,
  ariaLabel = "Belegfeld 1",
}: {
  /**
   * The id the surrounding `Field` points its label at. Without it the label
   * would name nothing: `Field.htmlFor` is required for exactly that reason
   * (0104), and a `useId()` inside is unreachable from outside.
   */
  id?: string;
  /** Verbatim, in the spelling of its source — DATEV compares character by character. */
  value: string;
  /** Free input stays possible: the register is an offer, not a constraint. */
  onChange: (value: string) => void;
  /** Set → the magnifier appears; left out → no icon (like `AccountField`). */
  onOpenRegister?: () => void;
  /** The number that **holds** for this case. Differs from `value` → the hint. */
  dominant?: KnownDocumentNumber | null;
  /**
   * The words of the nine sources. As a prop, because the app has no registry
   * axis for them and the domain module does not carry the labels either —
   * finding **L-71**. A local map here would be the second truth.
   */
  sourceLabel: DocumentNumberSourceLabels;
  /** Default 36 — the EXTF limit. Holds at the boundary, never truncates silently. */
  maxLength?: number;
  /** Red frame, no text of its own — the sentence belongs to the caller. */
  invalid?: boolean;
  ariaLabel?: string;
}) {
  const autoId = useId();
  const id = givenId ?? autoId;
  const atLimit = value.length >= maxLength;
  const diverging = dominant != null && dominant.documentNumber !== value;

  return (
    <div className="v2dnf">
      <div className="v2dnf__box">
        <input
          id={id}
          className={`v2in v2dnf__in${onOpenRegister ? " v2dnf__in--search" : ""}${
            invalid ? " v2in--invalid" : ""
          }`}
          value={value}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          autoComplete="off"
          // Holds at the limit instead of cutting silently: a number that
          // loses its tail is worse than one that cannot be finished, because
          // the loss is invisible until DATEV fails to settle.
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
        />
        {onOpenRegister ? (
          <span className="v2dnf__search">
            <IconButton
              size="sm"
              label="Belegnummern-Register öffnen"
              icon={<ActionIcon action="search" size={14} />}
              onMouseDown={(e) => e.preventDefault()}
              onClick={onOpenRegister}
            />
          </span>
        ) : null}
      </div>
      {/* The limit says so instead of cutting silently: a number that loses its
          tail is invisible until DATEV fails to settle it. */}
      {atLimit ? (
        <p
          className="v2dnf__limit"
          title={`${maxLength} Zeichen — mehr trägt Belegfeld 1 in DATEV nicht.`}
        >
          {/* Narrow keeps the number, the sentence moves into the `title`:
              inside the editor the field is 96 px wide, and the whole sentence
              grew to four lines there (acceptance of 0014). Same rule as the
              hint below. */}
          <span className="v2dnf__wide">{maxLength} Zeichen — mehr trägt Belegfeld 1 in DATEV nicht.</span>
          <span className="v2dnf__narrow" aria-hidden="true">
            {maxLength}/{maxLength}
          </span>
        </p>
      ) : null}
      {diverging ? (
        <p
          className="v2dnf__hint"
          title={`Für diesen Vorgang gilt ${dominant.documentNumber} (${sourceLabel[dominant.source]})${
            dominant.immutable ? " — die Nummer kommt aus DATEV und ist nicht verhandelbar." : ""
          }`}
        >
          {/* In a narrow column only the number survives — the field is 96 px
              wide inside `JournalEntryEditor`, and the full sentence grew to
              ten lines there (acceptance of 0014, M2). What falls away stays
              in the `title`, so nothing is lost, it is only shorter. */}
          <span className="v2dnf__wide">Für diesen Vorgang gilt </span>
          <TextButton onClick={() => onChange(dominant.documentNumber)}>
            {/* A 36-character number breaks into four lines at 96 px. It is
                truncated by the stylesheet — which needs a limit on **both**
                the paragraph and this button, or neither has one (acceptance
                of 0014, third round) — and stands in full in the `title`. */}
            <span className="v2dnf__num">{dominant.documentNumber}</span>
          </TextButton>{" "}
          <span className="v2dnf__src v2dnf__wide">({sourceLabel[dominant.source]})</span>
          {/* Only DATEV sources are immutable, and only there is the sentence
              true. Saying it everywhere would make it decoration. */}
          {dominant.immutable ? (
            <span className="v2dnf__wide">
              {" "}— die Nummer kommt aus DATEV und ist nicht verhandelbar.
            </span>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
