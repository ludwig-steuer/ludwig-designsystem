import type { ReactNode } from "react";

/**
 * Kleine Hinweisbox im Fluss — kein Banner, kein Dialog.
 *
 * @when    Ein Satz Kontext an der Stelle, an der er gebraucht wird.
 * @instead Zustand einer Sache → StatusCallout. Fehler zu einem Satz → Meldungen.
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
