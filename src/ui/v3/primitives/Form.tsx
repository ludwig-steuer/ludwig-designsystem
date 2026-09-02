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
  htmlFor?: string;
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
