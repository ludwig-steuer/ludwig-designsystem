import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/**
 * v2-Formularbausteine (F123 T123.1). Ersetzen die rohen
 * `<input className="v2in">` und die lokalen `Feld()`-Helfer.
 *
 * `Field` trägt Label, Hinweis und Fehler; die Eingabe selbst bleibt ein
 * gewöhnliches Element, damit `name`/`defaultValue` in Server-Action-Formularen
 * unverändert funktionieren.
 *
 * @when    Every input with label, hint and error text.
 * @instead Account selection → AccountField. Read-only → FieldList.
 */

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: ReactNode;
  error?: ReactNode;
  /**
   * The `id` of the control the word belongs to — **required**. Without it
   * `htmlFor` pointed nowhere: `input.labels` was empty, the field had no name
   * for a reading aid, and a click on the word did not move the focus (0104).
   *
   * It is required rather than derived because `Field` does not know its
   * child: at `AccountField`, `FileDrop` and `DateRangeField` the outer
   * element is a `div`, and an id put there would label a box. A brick that
   * brings its own `Field` (`AmountInput`, `Combobox`) binds itself instead.
   */
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="v2field">
      <label className="v2field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error ? <div className="v2field__hint">{hint}</div> : null}
      {error ? <div className="v2field__err">{error}</div> : null}
    </div>
  );
}

type WithInvalid = { invalid?: boolean; className?: string };

function inputClass({ invalid, className }: WithInvalid) {
  return `v2in${invalid ? " v2in--invalid" : ""}${className ? ` ${className}` : ""}`;
}

export function Input({ invalid, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & WithInvalid) {
  return <input {...rest} aria-invalid={invalid || undefined} className={inputClass({ invalid, className })} />;
}

export function Textarea({
  invalid,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & WithInvalid) {
  return <textarea {...rest} aria-invalid={invalid || undefined} className={inputClass({ invalid, className })} />;
}

/**
 * @when    Choice from a few fixed values.
 * @instead Account → AccountField. Switching views → Segmented.
 */
export function Select({
  invalid,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & WithInvalid) {
  return (
    <select {...rest} aria-invalid={invalid || undefined} className={inputClass({ invalid, className })}>
      {children}
    </select>
  );
}

/**
 * A field with something attached (0036): a magnifier in front, a unit, a key
 * or a copy button behind it.
 *
 * The group is a `<label>`, so a click on a decorative addition puts the
 * cursor into the field without a line of JavaScript — and the focus ring
 * belongs to the whole group (`:focus-within`), not to the input alone. A
 * purely decorative addition gets `aria-hidden` from the caller, otherwise it
 * ends up in the accessible name of the field.
 *
 * @when    A unit, an icon or a key that belongs to the field itself — „%",
 *          „Tage", the magnifier of a search, „⌘K".
 * @instead Label, hint and error text around the field → Field. An amount that
 *          formats itself → AmountInput. A period with two dates →
 *          DateRangeField.
 */
export function InputGroup({
  prefix,
  suffix,
  children,
}: {
  /** In front of the field: icon or text. */
  prefix?: ReactNode;
  /** Behind the field: unit, `Kbd`, an `IconButton`. */
  suffix?: ReactNode;
  /** Exactly one `Input`, `SearchInput` or `AmountInput`. */
  children: ReactNode;
}) {
  return (
    <label className="v2ing">
      {prefix ? <span className="v2ing__pre">{prefix}</span> : null}
      {children}
      {suffix ? <span className="v2ing__suf">{suffix}</span> : null}
    </label>
  );
}

/** Kontrollkästchen mit Beschriftung — das Kästchen allein ist kein Ziel. */
export function Checkbox({
  label,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className="v2checkline">
      <input type="checkbox" {...rest} className="v2check" />
      <span>{label}</span>
    </label>
  );
}
