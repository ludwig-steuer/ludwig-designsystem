import type { ReactNode } from "react";

/**
 * A gap marker for the showcase pages — **not** a design-system component.
 *
 * The showcase exists to find out whether the set can carry a whole page.
 * Filling a gap with local markup would defeat that: the page would look
 * finished and the set would stay incomplete. So where a component is
 * missing, its place is held by this marker, naming the backlog entry that
 * will fill it.
 *
 * Nothing here is exported from `@/ui/v3`. When the last marker is gone, the
 * page is proof; until then it is a list of what is left.
 */
export function Todo({
  spec,
  name,
  children,
}: {
  /** Backlog file that fills this gap, e.g. `0003` — or `—` if none exists yet. */
  spec: string;
  /** The component that belongs here. */
  name: string;
  /** What it would do at this spot. */
  children: ReactNode;
}) {
  return (
    <div
      style={{
        border: "1px dashed var(--color-border-strong)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3)",
        background: "var(--color-bg-soft)",
        color: "var(--color-text-muted)",
        fontSize: "var(--fs-caption)",
      }}
    >
      <strong style={{ color: "var(--color-text)" }}>
        TODO {spec} · {name}
      </strong>
      <div style={{ marginTop: 2 }}>{children}</div>
    </div>
  );
}

/** Inline variant, for a gap inside a row or a toolbar. */
export function TodoInline({ spec, name }: { spec: string; name: string }) {
  return (
    <span
      style={{
        border: "1px dashed var(--color-border-strong)",
        borderRadius: "var(--radius-sm)",
        padding: "2px 6px",
        color: "var(--color-text-muted)",
        fontSize: "var(--fs-overline)",
        whiteSpace: "nowrap",
      }}
    >
      TODO {spec} · {name}
    </span>
  );
}
