import type { ReactNode } from "react";
import { Disclosure } from "./Disclosure";

/**
 * Raw values behind „Technisch" (T4): the field as the database names it, its
 * value, and in a third column what the field means in plain words — so the
 * table can be read by someone who does not know the schema (owner 2026-09-29).
 * Field and value stay monospaced; the meaning is ordinary text.
 */

export interface TechnicalField {
  /** The field as the system names it (`processing_stage`). */
  label: string;
  value: string;
  /** What the field means, in the office's words. Without it the cell stays empty. */
  meaning?: string;
}

/**
 * @when    Raw values of a record in a dialog or detail — closed by default
 *          under „Technisch".
 * @instead Values a user reads → FieldList. Where a state value comes from →
 *          StatusInfoDialog.
 */
export function TechnicalFields({
  fields,
  defaultOpen = false,
  children,
}: {
  fields: readonly TechnicalField[];
  defaultOpen?: boolean;
  /** Below the table, e.g. the way to the explanation of the axis. */
  children?: ReactNode;
}) {
  return (
    <Disclosure summary="Technisch" defaultOpen={defaultOpen}>
      <table className="v3tech">
        <thead>
          <tr>
            <th scope="col">Feld</th>
            <th scope="col">Wert</th>
            <th scope="col">Bedeutung</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.label}>
              <td className="v3tech__code">{f.label}</td>
              <td className="v3tech__code">{f.value}</td>
              <td>{f.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </Disclosure>
  );
}
