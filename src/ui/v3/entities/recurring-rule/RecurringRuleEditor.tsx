"use client";

import { useId, useState, type ReactNode } from "react";

import {
  isValidRegex,
  RULE_INTERVAL_LABEL,
  type RuleBookingMode,
  type RuleCriteria,
  type RuleDirection,
  type RuleExpectedInterval,
  RULE_DIRECTION_LABEL,
} from "@/ludwig/modules/recurring-rules/domain/rule";
import type { RuleDraft } from "@/ludwig/modules/recurring-rules/domain/rule-draft";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { formatAmount, formatCount } from "../../format";
import { ActionBar } from "../../primitives/ActionBar";
import { ActionButton } from "../../primitives/ActionButton";
import { AmountInput } from "../../primitives/AmountInput";
import { Button } from "../../primitives/Button";
import { Callout } from "../../primitives/Callout";
import { Disclosure } from "../../primitives/Disclosure";
import { Checkbox, Field, Input, InputGroup, Select, Textarea } from "../../primitives/Form";
import { RadioGroup } from "../../primitives/RadioGroup";
import {
  AccountField,
  type AccountCandidate,
  type AccountGroup,
} from "../account/AccountField";
import {
  PaymentAccountField,
  type PaymentAccountOption,
} from "../account/PaymentAccountField";
import { TaxKeyField } from "../journal-entry/TaxKeyField";

/**
 * Building and changing a recurring rule (0135).
 *
 * **The empty case is the normal case.** 75 of 104 recurring cases — 72 % —
 * carry no rule at all today, so „no rule yet" is not the edge somebody
 * dismisses but the most frequent state of the entity. This editor is first
 * the tool that turns **nothing** into a rule, and only second the one that
 * changes an existing one.
 *
 * Whoever writes a rule asks two things, and nothing on screen answers both
 * together today: **what does Ludwig recognise the payment by**, and **what
 * happens then?** Plus the check that both are right — the live match count,
 * „does the rule fit like this?". The app has that spread over a form of
 * sixteen labelled fields and a **second** form on a **different** tab, which
 * holds one field with no context and no reference to the rule it belongs to.
 *
 * The editor knows no module: candidates, match count, payment accounts and
 * the preview all come in as props.
 */

/** The mode a new rule starts in — what the domain derives without a personal account. */
const NEW_BOOKING_MODE: RuleBookingMode = "book_on_payment";

/**
 * An empty draft. Not `{}`: every column of the cut has a defined starting
 * value, and „not decided" is `null`, never `undefined` — the caller writes
 * this object into a row.
 */
const EMPTY: RuleDraft = {
  expectedDirection: null,
  matchCounterpartyName: null,
  matchCounterpartyIban: null,
  matchAmount: null,
  matchAmountTolerance: 0,
  matchAmountTolerancePercent: null,
  matchPurposeRegex: null,
  matchContractNumber: null,
  matchDocumentTextRegex: null,
  expectedInterval: null,
  expectedDayOfMonth: null,
  bookingMode: NEW_BOOKING_MODE,
  personalAccountNumber: null,
  paymentAccountId: null,
  matchingNote: null,
  isActive: true,
  template: {
    counterAccountNumber: null,
    taxKey: null,
    taxRatePercent: null,
    description: null,
    lines: null,
    amount: null,
  },
};

/** The three rhythms, plus „no rhythm" — which means no overdue check at all. */
const INTERVALS: RuleExpectedInterval[] = ["monthly", "quarterly", "yearly"];

/** The two directions of the mirror; without one the rule accepts both. */
const DIRECTIONS: RuleDirection[] = ["payment_in", "payment_out"];

/** Which fields the caller has to recompute the match count for. */
const CRITERIA_FIELDS = [
  "expectedDirection",
  "matchCounterpartyName",
  "matchCounterpartyIban",
  "matchAmount",
  "matchAmountTolerance",
  "matchAmountTolerancePercent",
  "matchPurposeRegex",
] as const;

/** Where the accounts of both fields come from — one chart for both. */
export interface RecurringRuleAccounts {
  candidates: Partial<Record<AccountGroup, AccountCandidate[]>>;
  onSearch?: (query: string) => Promise<AccountCandidate[]>;
  onOpenLedger?: (accountNumber: string) => void;
}

/**
 * @when    A recurring rule is written — created from nothing at a recurring
 *          case, learned from a payment, or changed.
 * @instead Reading one → RecurringRuleFacts. One rule in a list →
 *          RecurringRuleRow. A single value that is read far more often than
 *          it is changed → InlineEdit.
 */
export function RecurringRuleEditor({
  defaultValue,
  onSubmit,
  onCancel,
  onCriteriaChange,
  matchCount,
  accounts,
  paymentAccounts,
  summary,
  renderPreview,
  pending,
  error,
}: {
  /** **Missing = a new rule** — the normal case. Set = changing one. */
  defaultValue?: RuleDraft;
  onSubmit: (draft: RuleDraft) => Promise<void>;
  /** Without it there is no cancel button and `Esc` does nothing. */
  onCancel?: () => void;
  /**
   * Reports every change to the criteria so the caller can recompute the match
   * count. **The editor does not compute it**: whether a payment is a hit is a
   * question to the bank lines, not to the form.
   */
  onCriteriaChange?: (criteria: RuleCriteria) => void;
  /** `null` = not computed yet; without the prop nothing stands there, not a zero. */
  matchCount?: { matched: number; scanned: number } | null;
  accounts: RecurringRuleAccounts;
  /**
   * The choice „Zahlungskonto". **No value means „the account of the payment
   * itself"**, not „unknown" — the sentence stands at the field.
   *
   * `PaymentAccountOption` since 0145 was finished: a client carries 25–43
   * payment accounts because onboarding takes over the whole SKR bank block,
   * and hardly ever more than one of them is in use. `inUse` is what splits
   * the two groups — the caller derives it (`isPaymentAccountInUse()`), the
   * field only shows the split.
   */
  paymentAccounts?: readonly PaymentAccountOption[];
  /**
   * The domain's sentence about the current draft; without a criterion it is
   * the warning. The editor does not phrase it — a form that rebuilds a
   * derivation of the domain is the second truth.
   */
  summary?: string;
  /** The preview beside the form — this is where `RecurringRuleFacts` goes. */
  renderPreview?: (draft: RuleDraft) => ReactNode;
  pending?: boolean;
  error?: string;
}) {
  const [draft, setDraft] = useState<RuleDraft>(defaultValue ?? EMPTY);
  // A draft that came from outside is not untouched input: its faults are
  // facts, and marking them only after the first attempt to save would hide
  // what is already wrong. An empty form stays quiet until somebody saves.
  const [touched, setTouched] = useState(defaultValue !== undefined);
  const ids = useIds();

  function update(patch: Partial<RuleDraft>) {
    const next = { ...draft, ...patch };
    setDraft(next);
    // Outside the state updater on purpose: under StrictMode React runs the
    // updater twice, and the caller would hear every change twice (the same
    // defect the acceptance of 0115 found).
    if (onCriteriaChange && CRITERIA_FIELDS.some((k) => k in patch)) {
      onCriteriaChange(criteriaOf(next));
    }
  }

  function updateTemplate(patch: Partial<RuleDraft["template"]>) {
    setDraft({ ...draft, template: { ...draft.template, ...patch } });
  }

  const accrues = draft.bookingMode === "accrue_then_settle";
  const bookless = draft.bookingMode === "match_only";

  // What blocks, in the order in which somebody meets it. Every one of them is
  // a rule that would otherwise produce a rule which cannot work — not a taste.
  const missingPersonal = accrues && !draft.personalAccountNumber;
  const badPurpose = Boolean(draft.matchPurposeRegex && !isValidRegex(draft.matchPurposeRegex));
  const badDocumentText = Boolean(
    draft.matchDocumentTextRegex && !isValidRegex(draft.matchDocumentTextRegex),
  );
  const badDay =
    draft.expectedDayOfMonth !== null &&
    (draft.expectedDayOfMonth < 1 || draft.expectedDayOfMonth > 31);
  const badTolerance =
    draft.matchAmountTolerance < 0 ||
    (draft.matchAmountTolerancePercent !== null &&
      (draft.matchAmountTolerancePercent < 0 || draft.matchAmountTolerancePercent > 100));

  const NEEDS_PERSONAL = "Für die Sollstellung braucht die Regel ein Personenkonto.";
  const BAD_REGEX = "Das Muster ist kein gültiger regulärer Ausdruck.";
  const BAD_DAY = "Der Zahltag liegt zwischen 1 und 31.";
  const BAD_TOLERANCE = "Eine Toleranz ist nie negativ.";
  // Every reason, not only the first: two things can block at once, and a bar
  // that named one of them would send somebody back a second time.
  const reasons = [
    missingPersonal ? NEEDS_PERSONAL : null,
    badPurpose || badDocumentText ? BAD_REGEX : null,
    badDay ? BAD_DAY : null,
    badTolerance ? BAD_TOLERANCE : null,
  ].filter((r): r is string => r !== null);
  const why = reasons.length > 0 ? reasons.join(" · ") : null;
  const blocked = reasons.length > 0;

  async function send() {
    setTouched(true);
    if (blocked || pending) return;
    await onSubmit(draft);
  }

  const modes: RuleBookingMode[] = ["book_on_payment", "accrue_then_settle", "match_only"];

  return (
    <form
      className="v2rredit"
      onSubmit={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          void send();
        }
        if (e.key === "Escape" && onCancel) onCancel();
      }}
    >
      <div className="v2rredit__cols">
        <div className="v2rredit__form">
          <Section title="Auslöser" hint="Woran Ludwig die Zahlung erkennt.">
            <Field label="Gegenpartei" htmlFor={ids.name}>
              <Input
                id={ids.name}
                value={draft.matchCounterpartyName ?? ""}
                disabled={pending}
                placeholder="Musterfirma Immobilien GmbH"
                onChange={(e) => update({ matchCounterpartyName: e.target.value || null })}
              />
            </Field>
            <Field
              label="IBAN"
              hint="Das stärkste Kriterium: sie bleibt, auch wenn der Name schwankt."
              htmlFor={ids.iban}
            >
              <Input
                id={ids.iban}
                className="v2mono"
                value={draft.matchCounterpartyIban ?? ""}
                disabled={pending}
                placeholder="DE02 1203 0000 0000 2020 51"
                onChange={(e) => update({ matchCounterpartyIban: e.target.value || null })}
              />
            </Field>
            <Field label="Richtung" htmlFor={ids.direction}>
              <Select
                id={ids.direction}
                value={draft.expectedDirection ?? ""}
                disabled={pending}
                onChange={(e) =>
                  update({ expectedDirection: (e.target.value || null) as RuleDirection | null })
                }
              >
                {/* Not „—": without a direction the rule takes both, and that
                    is a decision somebody can make on purpose. */}
                <option value="">beide Richtungen</option>
                {DIRECTIONS.map((d) => (
                  <option key={d} value={d}>
                    {RULE_DIRECTION_LABEL[d]}
                  </option>
                ))}
              </Select>
            </Field>
            <AmountInput
              label="Betrag"
              value={draft.matchAmount}
              disabled={pending}
              onChange={(v) => update({ matchAmount: v })}
            />
            {/*
              Two tolerance fields, not one. They are two things in the data
              model, and of the two the **more generous one wins** — building
              one field would quietly retire a column, and the percentage one
              exists for the series that fluctuate (electricity, telephone).
            */}
            <AmountInput
              label="Toleranz"
              value={draft.matchAmountTolerance}
              disabled={pending}
              onChange={(v) => update({ matchAmountTolerance: v ?? 0 })}
            />
            <Field
              label="Toleranz in Prozent"
              hint="Beide gesetzt: die großzügigere gilt."
              error={touched && badTolerance ? BAD_TOLERANCE : undefined}
              htmlFor={ids.tolerancePercent}
            >
              <InputGroup suffix="%">
                <Input
                  id={ids.tolerancePercent}
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={draft.matchAmountTolerancePercent ?? ""}
                  invalid={touched && badTolerance}
                  disabled={pending}
                  onChange={(e) =>
                    update({
                      matchAmountTolerancePercent:
                        e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </InputGroup>
            </Field>
          </Section>

          <Section title="Wirkung" hint="Was bei einem Treffer entsteht.">
            {/* Three choices, and the sentences come from the registry axis —
                `booking_mode` is **not** binary: at `match_only` no proposal
                comes into being at all, and code that treats it as two values
                is the silent bug the registry comment warns about. */}
            <RadioGroup
              name={ids.mode}
              label="Buchungsweise"
              value={draft.bookingMode}
              disabled={pending}
              onChange={(v) => update({ bookingMode: v as RuleBookingMode })}
              options={modes.map((m) => {
                const desc = resolveStatus("regel_modus", m);
                return {
                  value: m,
                  label: desc.label,
                  ...(desc.description ? { hint: desc.description } : {}),
                };
              })}
            />
            {bookless ? (
              <Callout tone="soft">
                Nur Zuordnung — es entsteht kein Buchungsvorschlag.
              </Callout>
            ) : (
              <>
                {/* Only with the accrual: `deriveRuleProfile()` raises the mode
                    only where a personal account stands there, and without one
                    the accrual could not book at all. */}
                {accrues ? (
                  <Field
                    label="Personenkonto"
                    error={touched && missingPersonal ? NEEDS_PERSONAL : undefined}
                    hint="Debitor oder Kreditor, als Nummer — die Regel ist jahresfrei."
                    htmlFor={ids.personal}
                  >
                    <Lock pending={pending}>
                      <AccountField
                        id={ids.personal}
                        ariaLabel="Personenkonto"
                        value={draft.personalAccountNumber ?? ""}
                        candidates={accounts.candidates}
                        invalid={touched && missingPersonal}
                        {...(accounts.onSearch ? { onSearch: accounts.onSearch } : {})}
                        {...(accounts.onOpenLedger ? { onOpenLedger: accounts.onOpenLedger } : {})}
                        onChange={(n) => setDraft({ ...draft, personalAccountNumber: n || null })}
                      />
                    </Lock>
                  </Field>
                ) : null}
                <Field label="Gegenkonto" htmlFor={ids.counter}>
                  <Lock pending={pending}>
                    <AccountField
                      id={ids.counter}
                      ariaLabel="Gegenkonto"
                      value={draft.template.counterAccountNumber ?? ""}
                      candidates={accounts.candidates}
                      {...(accounts.onSearch ? { onSearch: accounts.onSearch } : {})}
                      {...(accounts.onOpenLedger ? { onOpenLedger: accounts.onOpenLedger } : {})}
                      onChange={(n) => updateTemplate({ counterAccountNumber: n || null })}
                    />
                  </Lock>
                </Field>
                {/* The template amount is **not** the match amount: the one
                    books, the other hits. A rule that matches on the
                    counterparty alone carries no match amount, and if the
                    amount lived there it could never accrue (F40 part C). */}
                <AmountInput
                  label="Vorlagenbetrag"
                  value={draft.template.amount}
                  disabled={pending}
                  onChange={(v) => updateTemplate({ amount: v })}
                />
                <Field
                  label="Buchungstext"
                  hint="Steht später auf jeder erzeugten Buchungszeile."
                  htmlFor={ids.description}
                >
                  <Input
                    id={ids.description}
                    value={draft.template.description ?? ""}
                    disabled={pending}
                    placeholder="Miete Musterstraße 12, laufender Monat"
                    onChange={(e) => updateTemplate({ description: e.target.value || null })}
                  />
                </Field>
              </>
            )}
          </Section>

          <Section title="Erwartung" hint="Wann die Zahlung fällig wäre.">
            <Field
              label="Rhythmus"
              hint="Steuert nur den Überfälligkeits-Check — kein Match-Kriterium."
              htmlFor={ids.interval}
            >
              <Select
                id={ids.interval}
                value={draft.expectedInterval ?? ""}
                disabled={pending}
                onChange={(e) =>
                  update({
                    expectedInterval: (e.target.value || null) as RuleExpectedInterval | null,
                  })
                }
              >
                <option value="">ohne Rhythmus</option>
                {INTERVALS.map((i) => (
                  <option key={i} value={i}>
                    {RULE_INTERVAL_LABEL[i]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Erwarteter Zahltag"
              error={touched && badDay ? BAD_DAY : undefined}
              htmlFor={ids.day}
            >
              <Input
                id={ids.day}
                type="number"
                min={1}
                max={31}
                value={draft.expectedDayOfMonth ?? ""}
                invalid={touched && badDay}
                disabled={pending}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    expectedDayOfMonth: e.target.value === "" ? null : Number(e.target.value),
                  })
                }
              />
            </Field>
          </Section>

          {/*
            Folded, and open where something stands in it. Whoever starts from
            nothing sees twelve fields instead of twenty-two; a fold-out must
            never hide what somebody has entered.
          */}
          <Disclosure
            summary="Weitere Kriterien"
            defaultOpen={Boolean(
              draft.matchPurposeRegex ?? draft.matchContractNumber ?? draft.matchDocumentTextRegex,
            )}
          >
            <Field
              label="Muster im Verwendungszweck"
              error={touched && badPurpose ? BAD_REGEX : undefined}
              hint="Regulärer Ausdruck, ohne Groß-/Kleinschreibung."
              htmlFor={ids.purpose}
            >
              <Input
                id={ids.purpose}
                className="v2mono"
                value={draft.matchPurposeRegex ?? ""}
                invalid={touched && badPurpose}
                disabled={pending}
                onChange={(e) => update({ matchPurposeRegex: e.target.value || null })}
              />
            </Field>
            <Field
              label="Vertragsnummer"
              hint="Das tragende Beleg-Kriterium: über die Perioden konstant."
              htmlFor={ids.contract}
            >
              <Input
                id={ids.contract}
                value={draft.matchContractNumber ?? ""}
                disabled={pending}
                onChange={(e) => setDraft({ ...draft, matchContractNumber: e.target.value || null })}
              />
            </Field>
            <Field
              label="Muster im Belegtext"
              error={touched && badDocumentText ? BAD_REGEX : undefined}
              htmlFor={ids.documentText}
            >
              <Input
                id={ids.documentText}
                className="v2mono"
                value={draft.matchDocumentTextRegex ?? ""}
                invalid={touched && badDocumentText}
                disabled={pending}
                onChange={(e) =>
                  setDraft({ ...draft, matchDocumentTextRegex: e.target.value || null })
                }
              />
            </Field>
          </Disclosure>

          <Disclosure
            summary="Buchung im Detail"
            // Not a `??` chain: it stops at the first value that is merely
            // *set*, and `taxRatePercent: 0` — a lawful rate, tax-free — is
            // set and falsy. The fold would hide an entry someone made.
            defaultOpen={
              draft.template.taxKey != null ||
              draft.template.taxRatePercent != null ||
              draft.paymentAccountId != null ||
              draft.template.lines != null
            }
          >
            <TaxKeyField
              value={draft.template.taxKey}
              disabled={pending}
              onChange={(key) => updateTemplate({ taxKey: key })}
            />
            <Field label="USt-Satz" htmlFor={ids.taxRate}>
              <InputGroup suffix="%">
                <Input
                  id={ids.taxRate}
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={draft.template.taxRatePercent ?? ""}
                  disabled={pending}
                  onChange={(e) =>
                    updateTemplate({
                      taxRatePercent: e.target.value === "" ? null : Number(e.target.value),
                    })
                  }
                />
              </InputGroup>
            </Field>
            <Field
              label="Zahlungskonto"
              hint="Ohne Auswahl gilt das Konto der jeweiligen Zahlung."
              htmlFor={ids.paymentAccount}
            >
              {/* `PaymentAccountField` (0145) instead of a bare `Select`: it
                  puts the accounts in use above the dead wood of the chart.
                  The placeholder keeps its sentence — here the empty choice is
                  a **value** („the account of the payment itself"), not an
                  unset field, and that is what the reader has to see. */}
              <PaymentAccountField
                id={ids.paymentAccount}
                value={draft.paymentAccountId}
                accounts={paymentAccounts ?? []}
                placeholder="Konto der jeweiligen Zahlung"
                disabled={pending}
                onChange={(paymentAccountId) => setDraft({ ...draft, paymentAccountId })}
              />
            </Field>
            <SplitTemplate lines={draft.template.lines} />
          </Disclosure>

          <Disclosure summary="Notiz" defaultOpen={Boolean(draft.matchingNote)}>
            <Field
              label="Zuordnungs-Notiz"
              hint="Kein Match-Kriterium — sie erklärt, warum die Zuordnung so aussieht."
              htmlFor={ids.note}
            >
              <Textarea
                id={ids.note}
                rows={4}
                value={draft.matchingNote ?? ""}
                disabled={pending}
                onChange={(e) => setDraft({ ...draft, matchingNote: e.target.value || null })}
              />
            </Field>
          </Disclosure>
        </div>

        {renderPreview ? (
          <aside className="v2rredit__preview">{renderPreview(draft)}</aside>
        ) : null}
      </div>

      {/*
        A rule without a criterion may be saved: the database allows it, and a
        half-finished draft is a legitimate intermediate state. It is a warning,
        not a barrier — and the sentence comes from the caller.
      */}
      {summary ? <Callout tone="soft">{summary}</Callout> : null}
      {error ? <Callout tone="danger">{error}</Callout> : null}

      <div className="v2rredit__foot">
        <Checkbox
          label="Regel aktiv"
          checked={draft.isActive}
          disabled={pending}
          onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
        />
        <MatchCount count={matchCount} />
      </div>

      <ActionBar
        primary={
          <ActionButton
            variant="primary"
            size="sm"
            hotkey="Strg+Enter"
            pendingLabel="Speichere …"
            disabled={pending}
            action={send}
          >
            Regel speichern
          </ActionButton>
        }
        tertiary={
          onCancel ? (
            <Button
              variant="tertiary"
              size="sm"
              hotkey="Esc"
              onClick={onCancel}
              disabled={pending}
            >
              Abbrechen
            </Button>
          ) : undefined
        }
        info={why}
      />
    </form>
  );
}

/**
 * Locks what has no `disabled` of its own.
 *
 * `AccountField` takes none, and while saving two of twenty-three controls
 * stayed live — measured. A native `fieldset[disabled]` switches off every
 * control inside it, which is exactly the one thing needed here; the class
 * takes back the frame and the padding the element brings along.
 */
function Lock({ pending, children }: { pending?: boolean; children: ReactNode }) {
  return (
    <fieldset className="v2rredit__lock" disabled={pending}>
      {children}
    </fieldset>
  );
}

/** One block of the form — heading, one sentence, the fields. */
function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="v2rredit__sec">
      <h3 className="v2rredit__sech">{title}</h3>
      <p className="v2rredit__hint">{hint}</p>
      {children}
    </section>
  );
}

/**
 * The split template, read only — and passed on unchanged.
 *
 * It cannot be changed through any surface, and an editor that lost it while
 * saving would be data loss. So it stands here, visible, and travels through
 * `onSubmit` as it came.
 */
function SplitTemplate({ lines }: { lines: RuleDraft["template"]["lines"] }) {
  if (!lines?.length) return null;
  return (
    <div className="v2rredit__split">
      <div className="v2rredit__splith">
        Split-Vorlage · {formatCount(lines.length)} Zeilen — hier nicht änderbar
      </div>
      {lines.map((line, i) => (
        <div className="v2rredit__splitrow" key={`${line.accountNumber}-${i}`}>
          <span className="v2mono">{line.accountNumber}</span>
          <span>{line.description ?? ""}</span>
          <span className="v2num">
            {/* A percentage line carries no amount of its own — the booking
                supplies it (F94-T94.7). */}
            {line.percent !== null ? `${line.percent} %` : formatAmount(line.amount, "EUR")}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The live control „does the rule fit like this?".
 *
 * Without the prop nothing stands here — not a zero: a zero would say „no
 * payment matches", and „nobody has counted yet" is a different statement.
 */
function MatchCount({ count }: { count?: { matched: number; scanned: number } | null }) {
  if (count === undefined) return null;
  if (count === null) return <span className="v2muted">Treffer noch nicht gezählt.</span>;
  return (
    <span className="v2rredit__hits">
      {formatCount(count.matched)} von {formatCount(count.scanned)} geprüften Zahlungen treffen.
    </span>
  );
}

/** Only the match criteria — what the caller needs to count hits. */
function criteriaOf(draft: RuleDraft): RuleCriteria {
  return {
    expectedDirection: draft.expectedDirection,
    matchCounterpartyName: draft.matchCounterpartyName,
    matchCounterpartyIban: draft.matchCounterpartyIban,
    matchAmount: draft.matchAmount,
    matchAmountTolerance: draft.matchAmountTolerance,
    matchAmountTolerancePercent: draft.matchAmountTolerancePercent,
    matchPurposeRegex: draft.matchPurposeRegex,
  };
}


/** One id per field — two editors on one page must not label each other. */
function useIds() {
  const prefix = useId();
  return {
    name: `${prefix}-name`,
    iban: `${prefix}-iban`,
    direction: `${prefix}-direction`,
    tolerancePercent: `${prefix}-tolerance-percent`,
    mode: `${prefix}-mode`,
    personal: `${prefix}-personal`,
    counter: `${prefix}-counter`,
    description: `${prefix}-description`,
    interval: `${prefix}-interval`,
    day: `${prefix}-day`,
    purpose: `${prefix}-purpose`,
    contract: `${prefix}-contract`,
    documentText: `${prefix}-document-text`,
    taxRate: `${prefix}-tax-rate`,
    paymentAccount: `${prefix}-payment-account`,
    note: `${prefix}-note`,
  };
}
