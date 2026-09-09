import { Select } from "../../primitives/Form";

/**
 * Choosing a payment account (0145) — the ones actually in use apart from the
 * dead wood of the chart of accounts.
 *
 * A client has **25–43 payment accounts** in Ludwig because onboarding takes
 * over the whole SKR bank block: DATEV account function 10 throws bank, cash,
 * PSP and clearing accounts into one pot. **Hardly ever more than one of them
 * is actually in use.** Today they stand flat in one list, so the accountant
 * looks for her „Münchner Bank 107555539" between „Geldtransit", „Nebenkasse 2"
 * and „Schecks" — 24 accounts without a single booking.
 *
 * **Why an entity and not a primitive:** the mechanics would make sense
 * anywhere („a choice in which only a fraction of the entries is live"), but a
 * primitive would take both headings as props, and then a `<select>` with
 * `<optgroup>` is all that is left — markup at the call site (§4). The
 * headings *are* the component.
 *
 * **Why a `<select>` and not the combobox line:** `AccountField` (0013)
 * answers „which of 41,570", this one answers „the one, or after all one of
 * the others". Whoever has to type with three visible entries has lost the
 * benefit of the grouping again.
 */

export interface PaymentAccountOption {
  id: string;
  /** Name, with IBAN where there is a bank connection — formatted by the caller. */
  label: string;
  /**
   * `true` = an account actually in use.
   *
   * **This component does not decide what that means.** It is a domain
   * derivation (statement expectation `expects_statements` per `bank.md` R15a,
   * booked lines, auto-assignment) and stays in the app; the flag arrives
   * ready-made.
   */
  inUse: boolean;
}

const IN_USE = "Geführte Konten";
const REST = "Weitere Konten aus dem Kontenrahmen";

/**
 * @when    Picking the payment account of a bank statement, a recurring rule or an import — where the client's chart carries many accounts and few are live.
 * @instead One account out of the whole chart → AccountField. A short fixed list without that split → Select.
 */
export function PaymentAccountField({
  id,
  value,
  onChange,
  accounts,
  placeholder = "Bankkonto wählen…",
  unknownLabel = "(nicht in der Liste)",
  invalid,
  disabled,
}: {
  /** Binds the word to the field (`Field htmlFor`) — required, as there (0104). */
  id: string;
  value: string | null;
  onChange: (accountId: string | null) => void;
  accounts: readonly PaymentAccountOption[];
  placeholder?: string;
  /** The addition on a value the list does not carry. */
  unknownLabel?: string;
  invalid?: boolean;
  disabled?: boolean;
}) {
  const gefuehrt = accounts.filter((a) => a.inUse);
  const weitere = accounts.filter((a) => !a.inUse);
  // Headings only where they separate something. All in use or none in use and
  // a heading would claim a distinction that does not exist — which is not an
  // edge case: a fresh client has none, a small one exactly one of one.
  const gruppieren = gefuehrt.length > 0 && weitere.length > 0;

  // A value the list does not carry stays **visible**. The concrete case is a
  // recurring rule pointing at a retired account (`valid_until` set): today the
  // page loads every account of the client and nobody notices, but the moment
  // somebody narrows the list to the live ones on the server, that assignment
  // would vanish without a sound. A field that silently forgets a valid
  // assignment is worse than one unusual row.
  const unbekannt = value !== null && !accounts.some((a) => a.id === value);

  const option = (a: PaymentAccountOption) => (
    <option key={a.id} value={a.id}>
      {a.label}
    </option>
  );

  return (
    <Select
      id={id}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      {...(invalid ? { invalid } : {})}
      // An empty list disables itself: leaving that to the caller means every
      // caller has to remember it, and one of them will not.
      disabled={disabled || accounts.length === 0}
    >
      <option value="">{placeholder}</option>
      {unbekannt ? (
        <option value={value}>
          {value} {unknownLabel}
        </option>
      ) : null}
      {gruppieren ? (
        <>
          <optgroup label={IN_USE}>{gefuehrt.map(option)}</optgroup>
          <optgroup label={REST}>{weitere.map(option)}</optgroup>
        </>
      ) : (
        accounts.map(option)
      )}
    </Select>
  );
}
