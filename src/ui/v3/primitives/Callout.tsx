import type { ReactNode } from "react";

/**
 * Small note box in the flow — no banner, no dialog.
 *
 * @when    One sentence of context right where it is needed.
 * @instead State of an item → StatusCallout. Error about a booking entry → Messages.
 */
export function Callout({
  tone = "accent",
  children,
}: {
  tone?: "accent" | "soft" | "warning" | "danger";
  children: ReactNode;
}) {
  return <div className={`v2note${tone === "accent" ? "" : ` v2note--${tone}`}`}>{children}</div>;
}
