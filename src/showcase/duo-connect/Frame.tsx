"use client";

/**
 * Draft of 0263: the frame of the extension's main page (a browser tab) and of
 * its popup, plus the board that lays the states side by side for review.
 */
import type { CSSProperties, ReactNode } from "react";
import { Badge, Tabs, TextButton } from "@/ui/v3";
import logoAsset from "./duo-connect-logo.svg?url";
import { Draft } from "./drafts";
import { VERSION } from "./fixtures";

export type Area = "sync" | "history" | "settings";

const logoUrl = typeof logoAsset === "string" ? logoAsset : logoAsset.src;

/** Chrome popups: 320 px. */
export const POPUP_WIDTH = "calc(var(--space-20) * 4)";

const productName: CSSProperties = {
  fontSize: "var(--fs-ui-lg)",
  lineHeight: "var(--lh-ui-lg)",
  fontWeight: 600,
  color: "var(--color-text)",
};

/**
 * Main page: head with the mark, the product name and — outside production —
 * the environment; three tabs; content in the narrow container; footer.
 */
export function ExtensionShell({
  area,
  mark,
  staging,
  children,
}: {
  area: Area;
  /** On the tab „Abgleich": `dot` while running or after a warning, `alarm` (red) only for an error. */
  mark?: "dot" | "alarm";
  staging?: boolean;
  children: ReactNode;
}) {
  const column: CSSProperties = {
    width: "100%",
    maxWidth: "var(--container-narrow)",
    margin: "0 auto",
    boxSizing: "border-box",
    paddingInline: "var(--space-4)",
  };
  return (
    <Draft spec="0263" name="ExtensionShell">
      <div
        style={{
          background: "var(--color-bg-soft)",
          border: "var(--border-1)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <header style={{ background: "var(--color-surface)", borderBottom: "var(--border-1-subtle)" }}>
          <div style={{ ...column, paddingTop: "var(--space-3)", display: "grid", gap: "var(--space-2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
              <img src={logoUrl} alt="" style={{ width: "var(--space-8)", height: "var(--space-8)" }} />
              <span style={productName}>Ludwig DUO-Connect</span>
              {staging ? <Badge tone="neutral">Staging</Badge> : null}
            </div>
            <Tabs
              ariaLabel="Bereiche"
              active={area}
              items={[
                { key: "sync", label: "Abgleich", dot: mark !== undefined, alarm: mark === "alarm" },
                { key: "history", label: "Verlauf" },
                { key: "settings", label: "Einstellungen" },
              ]}
            />
          </div>
        </header>
        {/* `minmax(0, 1fr)`: a wide table scrolls inside its card instead of pushing the column open. */}
        <div
          style={{
            ...column,
            paddingBlock: "var(--space-6)",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: "var(--space-5)",
          }}
        >
          {children}
        </div>
        <footer
          className="lw-ui-hint"
          style={{ ...column, paddingBlock: "var(--space-4)", borderTop: "var(--border-1-subtle)" }}
        >
          Ludwig DUO-Connect {VERSION} ·{" "}
          <TextButton href="#datenschutz" tone="quiet">
            Datenschutz
          </TextButton>
        </footer>
      </div>
    </Draft>
  );
}

/** The popup: 320 px, one column, one button at full width. */
export function ExtensionPopup({ children }: { children: ReactNode }) {
  return (
    <Draft spec="0263" name="ExtensionPopup">
      <div
        style={{
          width: POPUP_WIDTH,
          boxSizing: "border-box",
          background: "var(--color-surface)",
          border: "var(--border-1)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-md)",
          padding: "var(--space-4)",
          display: "grid",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <img src={logoUrl} alt="" style={{ width: "var(--space-6)", height: "var(--space-6)" }} />
          <span style={{ ...productName, fontSize: "var(--fs-ui-md)", lineHeight: "var(--lh-ui-md)" }}>
            Ludwig DUO-Connect
          </span>
        </div>
        {children}
      </div>
    </Draft>
  );
}

/* ── Review board ───────────────────────────────────────────────────── */

export interface StateSpec {
  /** „A4" */
  id: string;
  /** „Bereit · ein Mandant" */
  title: string;
  /** Building blocks of the set it uses. */
  uses: string;
  /** Specs it still waits for; empty → nothing missing. */
  missing: string;
  /** Width of the tile: the main page or the popup. */
  surface: "page" | "popup";
  render: () => ReactNode;
}

/** One state with its number, name and building-block line above it. */
export function StateTile({ spec }: { spec: StateSpec }) {
  return (
    <section
      data-state={spec.id}
      style={{
        width: spec.surface === "popup" ? POPUP_WIDTH : "var(--container-narrow)",
        maxWidth: "100%",
        display: "grid",
        gap: "var(--space-2)",
        alignContent: "start",
      }}
    >
      <h3 className="lw-ui-section">
        {spec.id} · {spec.title}
      </h3>
      <p className="lw-ui-hint">
        Bausteine: {spec.uses}
        {spec.missing ? ` · fehlt: ${spec.missing}` : " · nichts fehlt"}
      </p>
      <div style={{ marginTop: "var(--space-2)" }}>{spec.render()}</div>
    </section>
  );
}

/** All states of one area, side by side, wrapping. */
export function Board({ title, lead, states }: { title: string; lead: ReactNode; states: StateSpec[] }) {
  return (
    <div style={{ display: "grid", gap: "var(--space-6)", padding: "var(--space-6)" }}>
      <div style={{ display: "grid", gap: "var(--space-1)" }}>
        <h2 className="lw-ui-section">{title}</h2>
        <p className="lw-ui-lead">{lead}</p>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-12) var(--space-10)", alignItems: "flex-start" }}>
        {states.map((s) => (
          <StateTile key={s.id} spec={s} />
        ))}
      </div>
    </div>
  );
}

/** A single state for the screenshot: the tile alone, with room around it. */
export function Single({ spec }: { spec: StateSpec }) {
  return (
    <div style={{ padding: "var(--space-6)" }}>
      <StateTile spec={spec} />
    </div>
  );
}
