"use client";

import { useState, type ComponentProps } from "react";

import {
  PAYMENT_ACCOUNT_KINDS,
  PAYMENT_ACCOUNT_KIND_LABEL,
  type PaymentAccountKind,
} from "@/ludwig/core/accounting/payment-account-kind";

import { Banner } from "../../primitives/Banner";
import { Button } from "../../primitives/Button";
import { DateField } from "../../primitives/DateField";
import { Field, Input, Select } from "../../primitives/Form";
import { AccountField } from "../account/AccountField";
import { emptyPaymentAccountDraft, type PaymentAccountDraft } from "./payment-account";

/**
 * Setting up a payment account (0183).
 *
 * Seven things per account, and two of them decide what the booking run asks
 * for later: whether statements are expected, and which payment method lands
 * here automatically.
 *
 * **The statement expectation has three values, not a checkbox**: derived and
 * decided by hand are two different statements, and the registry has a word
 * for each (`statement_expectation`). Whoever takes the checkbox loses the
 * derivation for good.
 */

/** Which identifier fields the kind brings with it. */
function identifierOf(kind: PaymentAccountKind): "iban" | "card" | "none" {
  if (kind === "bank") return "iban";
  if (kind === "credit_card" || kind === "paypal") return "card";
  return "none";
}

const EXPECTATION_OPTIONS = [
  { value: "auto", label: "Automatisch entscheiden" },
  { value: "yes", label: "Auszug erwartet" },
  { value: "no", label: "Kein Auszug" },
];

/**
 * @when    Creating or changing a payment account — the configuration page.
 * @instead Picking one → PaymentAccountField. Reading many → the two lists
 *          (0181, 0182). Naming one → PaymentAccountCell.
 */
export function PaymentAccountEditor({
  defaultValue,
  onSubmit,
  onCancel,
  paymentMethods = [],
  accounts,
  pending = false,
  error,
  idPrefix = "pa",
}: {
  /** **Missing = a new account** — the normal case in onboarding. */
  defaultValue?: PaymentAccountDraft;
  onSubmit: (draft: PaymentAccountDraft) => Promise<void>;
  /** Without it there is no cancel button. */
  onCancel?: () => void;
  /** The words of the payment methods — the domain keeps no list (L-313). */
  paymentMethods?: readonly { value: string; label: string }[];
  /** The ledger account search; without it the number stays a plain input. */
  accounts?: {
    candidates: ComponentProps<typeof AccountField>["candidates"];
    onSearch: ComponentProps<typeof AccountField>["onSearch"];
    valueName?: string;
  };
  pending?: boolean;
  /** The caller's message above the form. */
  error?: string;
  /** Prefix for the field ids — two editors on one page need two (0104). */
  idPrefix?: string;
}) {
  const [draft, setDraft] = useState<PaymentAccountDraft>(defaultValue ?? emptyPaymentAccountDraft());
  const set = <K extends keyof PaymentAccountDraft>(key: K, value: PaymentAccountDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const ids = {
    name: `${idPrefix}-name`,
    kind: `${idPrefix}-kind`,
    ledger: `${idPrefix}-ledger`,
    iban: `${idPrefix}-iban`,
    bic: `${idPrefix}-bic`,
    bank: `${idPrefix}-bank`,
    card: `${idPrefix}-card`,
    expectation: `${idPrefix}-expectation`,
    auto: `${idPrefix}-auto`,
    until: `${idPrefix}-until`,
  };

  const identifier = identifierOf(draft.kind);
  const expectation = draft.expectsStatements === null ? "auto" : draft.expectsStatements ? "yes" : "no";
  const canSave = draft.displayName.trim() !== "" && !pending;

  return (
    <form
      className="v2stack"
      onSubmit={(e) => {
        e.preventDefault();
        if (canSave) void onSubmit({ ...draft, displayName: draft.displayName.trim() });
      }}
    >
      {error ? (
        <Banner tone="danger" title="Speichern fehlgeschlagen.">
          {error}
        </Banner>
      ) : null}

      <Field label="Bezeichnung" htmlFor={ids.name} hint="So steht das Konto in jeder Liste.">
        <Input
          id={ids.name}
          value={draft.displayName}
          onChange={(e) => set("displayName", e.target.value)}
          placeholder="z. B. Stadtbank · Geschäftskonto"
          disabled={pending}
        />
      </Field>

      <Field label="Art" htmlFor={ids.kind}>
        <Select
          id={ids.kind}
          value={draft.kind}
          onChange={(e) => set("kind", e.target.value as PaymentAccountKind)}
          disabled={pending}
        >
          {PAYMENT_ACCOUNT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {PAYMENT_ACCOUNT_KIND_LABEL[kind]}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Sachkonto" htmlFor={ids.ledger} hint="Das Konto im Kontenrahmen, auf das die Zahlungen buchen.">
        {accounts ? (
          <AccountField
            id={ids.ledger}
            value={draft.ledgerAccountNumber ?? ""}
            {...(accounts.valueName ? { valueName: accounts.valueName } : {})}
            candidates={accounts.candidates}
            onSearch={accounts.onSearch}
            onChange={(number) => set("ledgerAccountNumber", number === "" ? null : number)}
          />
        ) : (
          <Input
            id={ids.ledger}
            value={draft.ledgerAccountNumber ?? ""}
            onChange={(e) => set("ledgerAccountNumber", e.target.value === "" ? null : e.target.value)}
            disabled={pending}
          />
        )}
      </Field>

      {identifier === "iban" ? (
        <>
          <Field label="IBAN" htmlFor={ids.iban} hint="Ohne sie erkennt der DATEV-Abgleich das Konto nicht wieder.">
            <Input
              id={ids.iban}
              value={draft.iban ?? ""}
              onChange={(e) => set("iban", e.target.value === "" ? null : e.target.value)}
              placeholder="DE…"
              disabled={pending}
            />
          </Field>
          <Field label="BIC" htmlFor={ids.bic}>
            <Input
              id={ids.bic}
              value={draft.bic ?? ""}
              onChange={(e) => set("bic", e.target.value === "" ? null : e.target.value)}
              disabled={pending}
            />
          </Field>
          <Field label="Bank" htmlFor={ids.bank}>
            <Input
              id={ids.bank}
              value={draft.bankName ?? ""}
              onChange={(e) => set("bankName", e.target.value === "" ? null : e.target.value)}
              disabled={pending}
            />
          </Field>
        </>
      ) : identifier === "card" ? (
        <Field
          label="Kartenkennung"
          htmlFor={ids.card}
          hint="Die letzten Stellen, mit denen der Auszug das Konto nennt."
        >
          <Input
            id={ids.card}
            value={draft.externalAccountId ?? ""}
            onChange={(e) => set("externalAccountId", e.target.value === "" ? null : e.target.value)}
            placeholder="•••• 4711"
            disabled={pending}
          />
        </Field>
      ) : (
        <p className="v2sub">
          Für diese Art gibt es keine Kennung — eine Kasse und ein Auslagenkonto haben weder IBAN noch
          Kartennummer.
        </p>
      )}

      <Field
        label="Kontoauszug"
        htmlFor={ids.expectation}
        hint={'„Automatisch entscheiden" hält die Ableitung aus IBAN und Buchungen offen.'}
      >
        <Select
          id={ids.expectation}
          value={expectation}
          onChange={(e) =>
            set("expectsStatements", e.target.value === "auto" ? null : e.target.value === "yes")
          }
          disabled={pending}
        >
          {EXPECTATION_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Auto-Zuordnung"
        htmlFor={ids.auto}
        hint="Zahlungen dieser Art landen ohne Rückfrage auf diesem Konto."
      >
        <Select
          id={ids.auto}
          value={draft.autoAssignPaymentMethod ?? ""}
          onChange={(e) => set("autoAssignPaymentMethod", e.target.value === "" ? null : e.target.value)}
          disabled={pending || paymentMethods.length === 0}
        >
          <option value="">Keine</option>
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Abgeschaltet ab"
        htmlFor={ids.until}
        hint="Gesetzt heißt: ab diesem Tag fordert der Buchungslauf keinen Auszug mehr."
      >
        <DateField
          id={ids.until}
          value={draft.validUntil}
          onChange={(value) => set("validUntil", value)}
          disabled={pending}
        />
      </Field>

      <div className="v2actions">
        <Button type="submit" disabled={!canSave}>
          {defaultValue ? "Speichern" : "Konto anlegen"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
            Abbrechen
          </Button>
        ) : null}
      </div>
    </form>
  );
}
