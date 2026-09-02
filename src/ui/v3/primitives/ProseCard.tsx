import type { ReactNode } from "react";

/**
 * Fließtext in einer Karte: Versalien-Kopf, 13,5 px Text.
 *
 * @when    Längere Erklärung oder Bericht, der gelesen wird.
 * @instead Kurzer Hinweis im Fluss → Callout. Label/Wert-Paare → FieldList.
 */
export function ProseCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="v2prose">
      <div className="v2prose__h">{title}</div>
      <div className="v2prose__body">{children}</div>
    </div>
  );
}
