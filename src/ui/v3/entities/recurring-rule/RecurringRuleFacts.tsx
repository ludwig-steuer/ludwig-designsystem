import type { ReactNode } from "react";

import {
  accrualAmount,
  effectiveAmountTolerance,
  RULE_INTERVAL_LABEL,
  type RecurringRule,
  RULE_DIRECTION_LABEL,
  RULE_DOCUMENT_NUMBER_STRATEGY_LABEL,
  RULE_PROFILE_SOURCE_LABEL,
  RULE_SETTING_HELP,
} from "@/ludwig/modules/recurring-rules/domain/rule";
import type { Currency } from "@/ludwig/shared/money";
import { resolveStatus } from "@/ludwig/ui/status/status-registry";

import { formatAmount } from "../../format";
import { StatusBadge } from "../../patterns/StatusBadge";
import { AmountCell, MonoCell } from "../../primitives/Cells";
import { Callout } from "../../primitives/Callout";
import { FieldList } from "../../primitives/FieldList";
import { LongText } from "../../primitives/LongText";
import { Time } from "../../primitives/Time";
import { AccountCell } from "../account/Account";
import { JournalEntryCard, type JournalLine } from "../journal-entry/JournalEntryCompact";
import type { PaymentAccountOption } from "@/ludwig/modules/bank-transactions/domain/payment-account-options";
import { PaymentAccountCell } from "../payment-account/PaymentAccount";

/**
 * Everything one recurring rule is (0134) — trigger, effect, expectation.
 *
 * The clerk stands in the rule set tab of a recurring case and asks: **what
 * sets this rule off, what does it book then, and when does it expect that?**
 * Today she is given that answer three times over, in three places that have
 * drifted apart — the rule set tab knows the effect but neither the document
 * number nor the document side, the assignment tab knows the criteria but not
 * the effect, and the batch review shows the same rule a third time as generic
 * label/value pairs. This form is the one.
 *
 * **A field without a value is not there** — no dash, no empty line; a group
 * without a field does not appear at all. „Offen" is a statement and gets a
 * word; „not filled in" is not a statement and gets nothing.
 */

/** Label and value of one line — the shape `FieldList` takes. */
type Pair = [ReactNode, ReactNode];

/**
 * The booking preview, translated by the caller.
 *
 * `buildRulePreview()` returns finished **labels** („4200 Miete", or the
 * fallback „Bank (aus Zahlung)" with no number at all), while a journal line
 * needs number and name apart. Cutting a display string at its first space and
 * hoping a number stood in front of it is the local invention the house rules
 * forbid — and at the fallback it is impossible (L-255). So the caller
 * translates, and `automatic` and `note` travel unchanged.
 */
export interface RecurringRulePreview {
  lines: readonly JournalLine[];
  /** `false` at `match_only`: no proposal comes into being at all. */
  automatic: boolean;
  /** The settle line at `accrue_then_settle`, the explanation at `match_only`. */
  note: string | null;
}

/**
 * @when    One recurring rule is read — the tab „Wiederkehrende Buchung" of a
 *          case, the preview inside RecurringRuleEditor, a support view with
 *          `all`.
 * @instead One rule as a row in a list → RecurringRuleRow. Changing it →
 *          RecurringRuleEditor. What it has already booked → the journal
 *          entries at the case.
 */
export function RecurringRuleFacts({
  rule,
  summary,
  schedule,
  preview,
  all = false,
  explain = false,
  accountHref,
  paymentAccounts,
  hints,
  currency = "EUR",
}: {
  /** The rule, unchanged from the mirror. */
  rule: RecurringRule;
  /**
   * The plain-language sentence about this rule, built **by the caller** from
   * the domain's summary function. The form shows it and does not derive it:
   * a form that rebuilds a derivation of the domain is the second truth, and
   * that is exactly what the app got stuck on — two enumerations of the same
   * criteria, one of which did not know the purpose pattern, so a rule matched
   * while the sentence beside it claimed the opposite.
   */
  summary: string;
  /**
   * The rhythm sentence. `null` means nothing is on file — then the group
   * „Erwartung" is **absent**, the same rule that applies to every field.
   */
  schedule: string | null;
  preview: RecurringRulePreview;
  /** Also the group „Herkunft" — the server stamps and the rarely-filled columns. */
  all?: boolean;
  /**
   * Every setting gets its sentence — what it does in the match or in the
   * proposal — and what only the import sets says so (0160). For the tab where
   * the rule is **read**, not just recognised; `all` decides which settings
   * stand, `explain` how they are described.
   */
  explain?: boolean;
  /** The way to the account sheet. Without it both accounts are plain text. */
  accountHref?: (accountNumber: string) => string;
  /**
   * The client's payment accounts — the same list `RecurringRuleEditor` gets
   * (0174). The rule carries only `paymentAccountId`, so the account is looked
   * up here; without the list the row says one is on file, never the id.
   */
  paymentAccounts?: readonly PaymentAccountOption[];
  /** Sentences of the caller above the first group — today „Modus prüfen?". */
  hints?: readonly string[];
  /** The rule has no currency column; every amount on it is euro. */
  currency?: Currency;
}) {
  const tolerance = effectiveAmountTolerance(rule);
  const t = rule.template;

  // The sentences are the domain's (`RULE_SETTING_HELP`, L-293): what a setting
  // does in the match or the proposal, and whether only the import sets it.
  const say = (value: ReactNode, field: keyof RecurringRule): ReactNode => {
    if (!explain) return value;
    const setting = RULE_SETTING_HELP[field];
    const line = [setting?.help, setting?.imported ? "setzt der Import" : null].filter(Boolean).join(" · ");
    return (
      <span className="v2rrfacts__cell">
        {value}
        {line ? <span className="v2rrfacts__help">{line}</span> : null}
      </span>
    );
  };

  const trigger: Pair[] = [];
  // Rank 1 is derived: name **or** IBAN, in the same place — a rule learned
  // from a payment carries no name at all. Where the IBAN already stands as
  // the counterparty, the row below would print it a second time and claim two
  // criteria where there is one.
  const counterparty = rule.matchCounterpartyName ?? rule.matchCounterpartyIban;
  if (counterparty) {
    trigger.push([
      "Gegenpartei",
      rule.matchCounterpartyName
        ? say(counterparty, "matchCounterpartyName")
        : say(<MonoCell value={counterparty} />, "matchCounterpartyIban"),
    ]);
  }
  if (rule.expectedDirection) {
    trigger.push([
      "Richtung",
      say(RULE_DIRECTION_LABEL[rule.expectedDirection], "expectedDirection"),
    ]);
  }
  if (rule.matchAmount !== null) {
    trigger.push([
      "Betrag",
      say(
      <span key="amount" className="v2rrfacts__amount">
        <AmountCell value={accrualAmount(rule)} currency={currency} />
        {/* One number, not two columns side by side: of the absolute and the
            percentage tolerance the **more generous one wins**, and that is
            what applies. The derivation says which. */}
        <span className="v2muted">
          {" ± "}
          {formatAmount(tolerance, currency)}
        </span>
      </span>,
      "matchAmount",
      ),
    ]);
  }
  if (rule.matchCounterpartyName && rule.matchCounterpartyIban) {
    trigger.push(["IBAN", say(<MonoCell key="iban" value={rule.matchCounterpartyIban} />, "matchCounterpartyIban")]);
  }
  if (rule.matchPurposeRegex) {
    trigger.push([
      "Muster im Verwendungszweck",
      say(
        <MonoCell key="pr" value={rule.matchPurposeRegex} />,
        "matchPurposeRegex",
      ),
    ]);
  }
  // The document side of the same rule (F94). That it stands in no surface at
  // all today is the second half of L-249 — and 29 of 30 rules carry
  // `matches_documents` without a single document criterion to show for it.
  if (rule.matchContractNumber) {
    trigger.push(["Vertragsnummer", say(<MonoCell key="cn" value={rule.matchContractNumber} />, "matchContractNumber")]);
  }
  if (rule.matchDocumentTextRegex) {
    trigger.push(["Muster im Belegtext", say(<MonoCell key="dr" value={rule.matchDocumentTextRegex} />, "matchDocumentTextRegex")]);
  }
  if (rule.matchesDocuments) {
    trigger.push(["Belegseite", "Die Regel bindet auch den Beleg an den Sachverhalt."]);
  }
  if (rule.matchingNote) {
    trigger.push([
      "Zuordnungs-Notiz",
      say(<LongText key="note">{rule.matchingNote}</LongText>, "matchingNote"),
    ]);
  }

  const effect: Pair[] = [];
  // Document field 1 of every accrual and settle proposal — the number that
  // carries the OPOS clearing. It stands in no component of the app today.
  if (rule.datevDocumentNumber) {
    effect.push([
      "Belegnummer der Dauerbuchung",
      say(
        <MonoCell key="dn" value={rule.datevDocumentNumber} />,
        "datevDocumentNumber",
      ),
    ]);
  }
  if (t.counterAccountNumber) {
    effect.push(["Gegenkonto", <Account key="ca" number={t.counterAccountNumber} href={accountHref} />]);
  }
  if (rule.personalAccountNumber) {
    effect.push([
      "Personenkonto",
      <Account key="pa" number={rule.personalAccountNumber} href={accountHref} />,
    ]);
  }
  if (t.description) {
    effect.push(["Buchungstext", t.description]);
  }
  // `booking_mode` is not binary: at `match_only` **no** proposal comes into
  // being, and then a sentence stands here instead of an empty preview card.
  if (!preview.automatic) {
    effect.push(["Buchungsvorschlag", preview.note ?? "Es entsteht kein Buchungsvorschlag."]);
  }

  const expectation: Pair[] = [];
  if (schedule) {
    if (rule.expectedInterval) {
      // One sentence for rhythm and pay day: neither is a criterion of the match.
      expectation.push([
        "Rhythmus",
        say(RULE_INTERVAL_LABEL[rule.expectedInterval], "expectedInterval"),
      ]);
    }
    if (rule.expectedDayOfMonth !== null) {
      expectation.push(["Erwarteter Zahltag", `${rule.expectedDayOfMonth}. des Monats`]);
    }
    if (rule.validFrom || rule.validUntil) {
      expectation.push([
        "Laufzeit",
        say(
          <Validity key="v" from={rule.validFrom} until={rule.validUntil} />,
          "validFrom",
        ),
      ]);
    }
  }

  const origin: Pair[] = [];
  if (all) {
    if (rule.profileSource) {
      origin.push(["Herkunft des Profils", say(RULE_PROFILE_SOURCE_LABEL[rule.profileSource], "profileSource")]);
    }
    origin.push(["Zahlungskonto", paymentAccountOf(rule.paymentAccountId, paymentAccounts)]);
    if (t.lines?.length) {
      origin.push(["Split-Vorlage", say(`${t.lines.length} Gegenkonto-Zeilen`, "template")]);
    }
    if (t.taxKey) origin.push(["Steuerschlüssel", <MonoCell key="tk" value={t.taxKey} />]);
    if (t.taxRatePercent !== null) {
      origin.push([
        "USt-Satz",
        <span key="tr" className="v2num">{`${t.taxRatePercent} %`}</span>,
      ]);
    }
    origin.push([
      "Belegnummern-Strategie",
      say(RULE_DOCUMENT_NUMBER_STRATEGY_LABEL[rule.documentNumberStrategy], "documentNumberStrategy"),
    ]);
    if (rule.importReference) {
      origin.push([
        "Idempotenz-Anker",
        say(<MonoCell key="ir" value={rule.importReference} />, "importReference"),
      ]);
    }
    // Ranks 27 and 28 of the profile — the agent run, the export batch and the
    // DMS document link — are missing here because the **mirrored type does
    // not carry them**: `RecurringRule` has no `agentRunId`, no
    // `exportBatchId` and no `datevDocumentLink*`. Inventing three fields to
    // fill a group would be the local redefinition the house rules forbid; the
    // gap is a finding against the mirror, not something to paper over.
  }

  return (
    <div className="v2rrfacts">
      <div className="v2rrfacts__head">
        <p className="v2rrfacts__summary">{summary}</p>
        {explain ? (
          // The booking mode explains itself with the words of its axis — no
          // sentence of our own beside the registry's (0160).
          <p className="v2rrfacts__aside">
            {`${resolveStatus("rule_mode", rule.bookingMode).label}: ${resolveStatus("rule_mode", rule.bookingMode).description ?? ""}`}
          </p>
        ) : null}
        <div className="v2rrfacts__state">
          <StatusBadge axis="rule_mode" status={rule.bookingMode} />
          {/* A word, no `tone` and no dot: R1 allows colour only through an
              axis, and `is_active` has none (L-241). */}
          <span className="v2rrfacts__validity">{rule.isActive ? "aktiv" : "inaktiv"}</span>
        </div>
      </div>

      {hints?.map((hint) => (
        <Callout key={hint} tone="warning">
          {hint}
        </Callout>
      ))}

      <Group title="Auslöser" rows={trigger} />
      <Group
        title="Wirkung"
        rows={effect}
        lead={explain && effect.length > 0 ? "Gegenkonto, Personenkonto und Buchungstext stehen so in jedem Vorschlag dieser Regel." : null}
      >
        {preview.automatic ? (
          <>
            <JournalEntryCard lines={preview.lines} currency={currency} caption="Buchungsvorschlag" />
            {preview.note ? <p className="v2rrfacts__aside">{preview.note}</p> : null}
          </>
        ) : null}
      </Group>
      <Group title="Erwartung" rows={expectation} lead={schedule} />
      <Group title="Herkunft" rows={origin} />
    </div>
  );
}

/**
 * One group of the facts — heading, an optional sentence, the pairs, and what
 * does not fit into a pair.
 *
 * It renders **nothing** when it has nothing: an empty group would be a
 * heading over a void, and „Erwartung" without a rhythm sentence is exactly
 * that case (the rule set tab in the app already hides it today).
 */
function Group({
  title,
  rows,
  lead,
  children,
}: {
  title: string;
  rows: Pair[];
  /** A whole sentence over the pairs — the rhythm sentence of the domain. */
  lead?: string | null;
  children?: ReactNode;
}) {
  if (rows.length === 0 && !lead && !children) return null;
  return (
    <section className="v2fields v2fields--bare v2rrfacts__group">
      <div className="v2fields__h">{title}</div>
      {lead ? <p className="v2rrfacts__sentence">{lead}</p> : null}
      {rows.length > 0 ? <FieldList tone="bare" rows={rows} /> : null}
      {children}
    </section>
  );
}

/**
 * An account of the rule — always a **number**, never an id.
 *
 * The rule is free of fiscal years, the ledger row is not; resolving the
 * number into the year of the booking is the caller's job. The name is
 * therefore missing here on purpose: the form does not look one up.
 */
function Account({ number, href }: { number: string; href?: (n: string) => string }) {
  return <AccountCell number={number} {...(href ? { href: href(number) } : {})} />;
}

/** The term of the standing order — one date, two dates, or an open end. */
function Validity({ from, until }: { from: string | null; until: string | null }) {
  return (
    <span className="v2rrfacts__term">
      {from ? <Time value={from} format="date" /> : "offen"}
      {" – "}
      {until ? <Time value={until} format="date" /> : "unbefristet"}
    </span>
  );
}

/**
 * The rule's payment account: the cell when the list knows the id, a word when
 * it does not — never the id itself, which belongs to the raw data (0174).
 */
function paymentAccountOf(
  id: string | null,
  accounts: readonly PaymentAccountOption[] | undefined,
): ReactNode {
  if (id === null) return "Konto der jeweiligen Zahlung";
  const account = accounts?.find((a) => a.id === id);
  return account ? <PaymentAccountCell key="pa" account={account} /> : "hinterlegt";
}
