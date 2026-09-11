"use client";

import { useState } from "react";

import {
  CASE_DISPOSITION_WRITABLE,
  CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS,
  CASE_KIND,
  CASE_KIND_LABEL,
  isDocumentNumberModeDowngrade,
  type CaseDisposition,
  type CaseDispositionWritable,
  type CaseDocumentNumberMode,
  type CaseKind,
} from "@/ludwig/modules/accounting-cases/domain/case";
import type { KnownDocumentNumber } from "@/ludwig/modules/accounting-cases/domain/document-number";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { InlineEdit } from "../../primitives/InlineEdit";
import { RadioGroup } from "../../primitives/RadioGroup";
import { ReasonDialog } from "../../primitives/ReasonDialog";
import { Select } from "../../primitives/Form";

/**
 * The three values of a case that carry a **rule** — the ones that would grow
 * a copy of that rule at every call site otherwise (0083).
 *
 * Two more are editable and get no export here: the display name (`title`) and
 * the summary. They are `<InlineEdit label=… value=… onSave=… />` at the call
 * site, and a composition without state of its own is not a component
 * (`spec-schreiben` §3 no. 4).
 */

interface Shared {
  /** Saving is driven from outside; rejecting keeps the field open. */
  pending?: boolean;
  disabled?: boolean;
  /** An error from outside — otherwise it comes from `onSave`. */
  error?: string;
}

/**
 * @when    Changing the kind of a case, inline, where it is read.
 * @instead The document-number mode → CaseDocumentNumberModeEdit. Who is up →
 *          CaseDispositionEdit. A plain text value → InlineEdit directly.
 */
export function CaseKindEdit({
  value,
  onSave,
  pending,
  disabled,
  error,
}: Shared & {
  value: CaseKind;
  onSave: (next: CaseKind) => Promise<void> | void;
}) {
  return (
    <InlineEdit
      label="Art"
      value={value}
      onSave={(next) => onSave(next as CaseKind)}
      pending={pending}
      disabled={disabled}
      error={error}
      // The seven kinds come from `CASE_KIND_LABEL` — the one source. And the
      // kind is **not** a status: no colour, no transitions, no registry axis.
      renderValue={(v) => CASE_KIND_LABEL[v as CaseKind] ?? v}
      renderInput={({ value: v, onChange, ...rest }) => (
        <Select {...rest} value={v} onChange={(e) => onChange(e.target.value)}>
          {CASE_KIND.map((k) => (
            <option key={k} value={k}>
              {CASE_KIND_LABEL[k]}
            </option>
          ))}
        </Select>
      )}
    />
  );
}

/**
 * @when    Changing the document-number mode — the one change that needs a
 *          reason, and on a downgrade the number that stays valid.
 * @instead The kind → CaseKindEdit. Who is up → CaseDispositionEdit.
 */
export function CaseDocumentNumberModeEdit({
  value,
  onSave,
  documentNumbers = [],
  allowNone = false,
  pending,
  disabled,
}: Shared & {
  value: CaseDocumentNumberMode;
  /** Mode, reason, and — only on a downgrade — the number that stays valid. */
  onSave: (
    next: CaseDocumentNumberMode,
    reason: string,
    keepNumber?: string,
  ) => Promise<void> | void;
  /**
   * The numbers linked today. Without them a downgrade cannot be offered: the
   * choice is part of it (`case.ts:102–107`). `CaseDetail` does not carry them
   * yet — finding L-211.
   */
  documentNumbers?: readonly KnownDocumentNumber[];
  /**
   * Whether `none` is offered. Only the page knows: the core allows it for
   * `internal_transfer` and `adjustment_only` without a linked document, and
   * that check is not in the transition table.
   */
  allowNone?: boolean;
}) {
  const [target, setTarget] = useState<CaseDocumentNumberMode | null>(null);
  const [keepNumber, setKeepNumber] = useState<string | null>(null);

  /**
   * **DATEV wins** (`document-number.ts`, rule 1): a number from the DATEV
   * truth is the canonical value of the case and not negotiable. So if one of
   * the candidates is `immutable`, the question „which number stays valid" is
   * already answered — it is that one, and there is nothing to pick. The
   * dialog said the opposite until 2026-09-08: it offered every number and
   * **disabled the canonical one**, which in a list of DATEV numbers left the
   * dialog without an exit (acceptance M7).
   */
  const fixed = documentNumbers.find((d) => d.immutable) ?? null;
  const choices = fixed ? [] : documentNumbers;

  const allowed = CASE_DOCUMENT_NUMBER_MODE_TRANSITIONS[value].filter((m) => {
    if (m === "none" && !allowNone) return false;
    // A downgrade without a number to keep is not offered at all — an option
    // one can see and not answer is a question without an answer. The comment
    // said this before, the filter did not, and the mode saved without the
    // choice that `case.ts:102–107` requires (acceptance M2).
    if (isDocumentNumberModeDowngrade(value, m)) return documentNumbers.length > 0;
    return true;
  });
  const isDowngrade = target ? isDocumentNumberModeDowngrade(value, target) : false;
  const needsNumber = isDowngrade && choices.length > 0;

  return (
    <>
      <InlineEdit
        label="Belegnummern-Modus"
        value={value}
        // The mode never saves straight away — every change carries a reason,
        // so the field hands over to the dialog and keeps its old value.
        onSave={(next) => {
          // The current value is the placeholder of the select, not a choice:
          // „Eine Belegnummer → Eine Belegnummer" is no transition, and the
          // table does not list it. Saving without a change closes the field
          // and asks nothing (acceptance M3).
          if (next === value) return;
          setTarget(next as CaseDocumentNumberMode);
          setKeepNumber(null);
        }}
        pending={pending}
        disabled={disabled}
        renderValue={(v) => resolveStatus("document_number_mode", v).label}
        renderInput={({ value: v, onChange, ...rest }) => (
          <Select {...rest} value={v} onChange={(e) => onChange(e.target.value)}>
            <option value={value}>{resolveStatus("document_number_mode", value).label}</option>
            {allowed.map((m) => (
              <option key={m} value={m}>
                {resolveStatus("document_number_mode", m).label}
              </option>
            ))}
          </Select>
        )}
      />
      <ReasonDialog
        open={target !== null}
        onClose={() => setTarget(null)}
        onConfirm={(reason) => {
          if (target) {
            const keep = fixed ? fixed.documentNumber : needsNumber ? (keepNumber ?? undefined) : undefined;
            void onSave(target, reason, keep);
          }
          setTarget(null);
        }}
        title="Belegnummern-Modus ändern"
        kicker={
          target
            ? `${resolveStatus("document_number_mode", value).label} → ${resolveStatus("document_number_mode", target).label}`
            : undefined
        }
        label="Grund"
        placeholder="Steht später im Protokoll."
        confirmLabel="Umstufen"
        required
        // The second lock: on a downgrade the reason alone is not enough.
        confirmDisabled={needsNumber && keepNumber === null}
        pending={pending}
      >
        {fixed && isDowngrade ? (
          <p className="v2field__hint">
            Es bleibt <strong>{fixed.documentNumber}</strong> — die Nummer kommt aus DATEV
            und ist gesetzt.
          </p>
        ) : null}
        {needsNumber ? (
          <RadioGroup
            name="keep-number"
            label="Welche Nummer bleibt gültig?"
            value={keepNumber}
            onChange={setKeepNumber}
            options={choices.map((d) => ({
              value: d.documentNumber,
              label: d.documentNumber,
              hint: d.accountNumber ? `Personenkonto ${d.accountNumber}` : undefined,
            }))}
          />
        ) : null}
      </ReasonDialog>
    </>
  );
}

/**
 * @when    Handing a case between the agent and the practice.
 * @instead The kind → CaseKindEdit. The document-number mode →
 *          CaseDocumentNumberModeEdit.
 */
export function CaseDispositionEdit({
  value,
  onSave,
  pending,
  disabled,
  error,
}: Shared & {
  /** `null` means „in the pipeline or closed" — readable, not choosable. */
  value: CaseDisposition | null;
  /** Only these two: the type says so, not a comment (`CASE_DISPOSITION_WRITABLE`). */
  onSave: (next: CaseDispositionWritable) => Promise<void> | void;
}) {
  return (
    <InlineEdit
      label="Zuständigkeit"
      value={value ?? ""}
      onSave={(next) => {
        // The placeholder is not a value. With `value === null` the select
        // opens on „—", and saving from there called `onSave("")` — a string
        // the axis does not know, hidden by the assertion below. Nothing to
        // save, so nothing is saved (acceptance 0083, M4).
        if (next === "") return;
        onSave(next as CaseDispositionWritable);
      }}
      pending={pending}
      disabled={disabled}
      error={error}
      renderValue={(v) => (v ? resolveStatus("disposition", v).label : "—")}
      renderInput={({ value: v, onChange, ...rest }) => (
        <Select {...rest} value={v} onChange={(e) => onChange(e.target.value)}>
          {/* `client` is not offered: bringing the client in is an action with
              an outside effect — they get a question — not a value change. It
              belongs to the clarification. */}
          {/* The placeholder of an unset value — readable, not choosable
              (`disabled`), so the select cannot be saved back onto it. */}
          {value === null ? (
            <option value="" disabled>
              —
            </option>
          ) : null}
          {CASE_DISPOSITION_WRITABLE.map((d) => (
            <option key={d} value={d}>
              {resolveStatus("disposition", d).label}
            </option>
          ))}
        </Select>
      )}
    />
  );
}
