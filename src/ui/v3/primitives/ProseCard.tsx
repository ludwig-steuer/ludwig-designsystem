import type { ReactNode } from "react";

/**
 * Running text in a card: section head, 13.5 px text.
 *
 * @when    Longer explanation or report meant to be read.
 * @instead Short note in the flow → Callout. Label/value pairs → FieldList.
 */
export function ProseCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="v2prose">
      <div className="v2prose__h">{title}</div>
      <div className="v2prose__body">{children}</div>
    </div>
  );
}
