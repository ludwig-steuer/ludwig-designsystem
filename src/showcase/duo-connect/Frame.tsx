"use client";

/**
 * The frame of the drafts: the real 0263 `ExtensionShell`/`ExtensionPopup`
 * with the plugin's mark, name, tabs and footer filled in, plus the board that
 * lays the states side by side for review.
 */
import type { ReactNode } from "react";
import { ExtensionPopup as Popup, ExtensionShell as Shell, Tabs } from "@/ui/v3";
import logoAsset from "./duo-connect-logo.svg?url";
import { VERSION } from "./fixtures";

export type Area = "sync" | "history" | "settings";

const logoUrl = typeof logoAsset === "string" ? logoAsset : logoAsset.src;
const PRODUCT = "Ludwig DUO-Connect";
const LINKS = [{ label: "Datenschutz", href: "https://www.fakir.tech/de/datenschutz/duo-connect" }];

/** A tile has the window of the page: the 720 px column plus the frame's side padding. */
const PAGE_WIDTH = "calc(var(--container-narrow) + 2 * var(--space-8))";

/** In a tile the frame stands in for a browser window: one line around it. */
const windowLine = { border: "var(--border-1)", borderRadius: "var(--radius-lg)", overflow: "hidden" } as const;

/**
 * Main page: head with the mark, the product name and — outside production —
 * the environment; three tabs; content in the narrow column; footer.
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
  return (
    <div style={windowLine}>
      <Shell
        markSrc={logoUrl}
        productName={PRODUCT}
        environment={staging ? "Staging" : undefined}
        nav={
          <Tabs
            ariaLabel="Bereiche"
            active={area}
            items={[
              { key: "sync", label: "Abgleich", href: "#abgleich", dot: mark !== undefined, alarm: mark === "alarm" },
              { key: "history", label: "Verlauf", href: "#verlauf" },
              { key: "settings", label: "Einstellungen", href: "#einstellungen" },
            ]}
          />
        }
        version={VERSION}
        links={LINKS}
      >
        {children}
      </Shell>
    </div>
  );
}

/** The popup: 320 px, the state in its live region, the detail outside it, one button at full width. */
export function ExtensionPopup({ status, detail, action }: { status: ReactNode; detail?: ReactNode; action: string }) {
  return (
    <div style={{ ...windowLine, width: "fit-content", boxShadow: "var(--shadow-md)" }}>
      <Popup
        markSrc={logoUrl}
        productName={PRODUCT}
        status={status}
        detail={detail}
        action={{ label: action, onClick: () => {} }}
      />
    </div>
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
        // The popup brings its own 320 px (`ExtensionPopup`).
        width: spec.surface === "popup" ? undefined : PAGE_WIDTH,
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
