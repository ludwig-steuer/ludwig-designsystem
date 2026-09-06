/// <reference types="vite/client" />
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties, type ReactNode } from "react";

import tokensCss from "../../styles/tokens.css?raw";
import v3Css from "../../styles/v3.css?raw";
import { Button } from "./primitives/Button";

/**
 * Space, edge, depth, width, state and motion (0055) — no component, no new
 * CSS. Half of this is in `tokens.css`; the other half was an unwritten
 * convention in `v3.css` (which tone hover takes, which layer sits above
 * which). Both are read here, never transcribed.
 */
const meta: Meta = { title: "v3/Grundlagen/Raum und Fläche" };
export default meta;
type Story = StoryObj;

/* ── Measurement ──────────────────────────────────────────────────────── */

/** Every token of one family declared in `tokens.css`, in file order. */
const family = (prefix: string) =>
  // `flatMap`: a group that did not match is not a token, and saying so is
  // cheaper than asserting it away (strict flags).
  [...tokensCss.matchAll(new RegExp(`^ {2}(--${prefix}-[a-z0-9-]+):`, "gm"))].flatMap((m) =>
    m[1] ? [m[1]] : [],
  );

const SPACE = family("space");
const RADIUS = family("radius");
const SHADOW = family("shadow");
const GLOW = family("glow");
const GRAD = family("grad");
const DURATION = family("duration");
const EASE = family("ease");
const CONTAINER = family("container");
const DRAWER = family("drawer");

const readToken = (token: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

const count = (pattern: RegExp) => (v3Css.match(pattern) ?? []).length;

/* ── Shared bits ──────────────────────────────────────────────────────── */

function Section({ title, lead, children }: { title: string; lead: ReactNode; children: ReactNode }) {
  return (
    <section style={{ marginBottom: "var(--space-10)" }}>
      <h3 className="lw-h4" style={{ margin: 0 }}>{title}</h3>
      <p className="lw-caption" style={{ margin: "var(--space-1) 0 var(--space-5)", maxWidth: "var(--content-measure)" }}>
        {lead}
      </p>
      {children}
    </section>
  );
}

const label: CSSProperties = { fontSize: "var(--fs-ui-sm)", color: "var(--color-text-muted)" };
const page: CSSProperties = { maxWidth: "var(--container-base)" };

const card: CSSProperties = {
  background: "var(--color-surface)",
  borderRadius: "var(--radius-md)",
  padding: "var(--space-5)",
  fontSize: "var(--fs-ui)",
};

/* ── Space ────────────────────────────────────────────────────────────── */

/** Die Leiter aus `--space-*` — jeder Balken ist so breit wie sein Token. */
export const Space: Story = {
  render: () => (
    <div style={page}>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        4-px-Grundraster, 8-px-Rhythmus. Abstände kommen <strong>nur</strong> aus{" "}
        <code className="lw-mono">--space-*</code> — eine Zwischengröße wird nicht erfunden. Im produktiven
        Register gilt: knapp <em>in</em> der Zeile, großzügig <em>zwischen</em> Blöcken.
      </p>
      <div style={{ display: "grid", gap: "var(--space-2)", marginBottom: "var(--space-10)" }}>
        {SPACE.map((token) => (
          <div key={token} style={{ display: "grid", gridTemplateColumns: "var(--space-24) auto 1fr", gap: "var(--space-4)", alignItems: "center" }}>
            <code className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)" }}>{token.replace("--", "")}</code>
            <div style={{ height: "var(--space-4)", width: `var(${token})`, background: "var(--color-accent)", borderRadius: "var(--radius-sm)" }} />
            <span className="lw-numeric" style={label}>{readToken(token)}</span>
          </div>
        ))}
      </div>
      <Section
        title="Die zwei Sätze, die man wirklich braucht"
        lead="Alles andere folgt aus der Leiter; diese beiden entscheidet man sonst jedes Mal neu."
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-5)" }}>
          <div style={{ ...card, border: "var(--border-1)", padding: "var(--space-5)" }}>
            <div className="lw-overline">Karte</div>
            <div style={{ marginTop: "var(--space-2)" }}>Padding mindestens <code className="lw-mono">--space-5</code>.</div>
          </div>
          <div style={{ ...card, border: "var(--border-1)", padding: "var(--space-6)" }}>
            <div className="lw-overline">Inhaltskarte</div>
            <div style={{ marginTop: "var(--space-2)" }}>Padding <code className="lw-mono">--space-6</code> — sie trägt Text, keine Zeilen.</div>
          </div>
        </div>
      </Section>
    </div>
  ),
};

/* ── Radius ───────────────────────────────────────────────────────────── */

const RADIUS_USE: Record<string, string> = {
  "--radius-none": "Kante an Kante — Tabellenzelle, angesetzte Fläche",
  "--radius-sm": "Eingabefeld, Tag",
  "--radius-md": "Knopf, Karte",
  "--radius-lg": "große Karte, Dialog",
  "--radius-xl": "nur Hero (lesendes Register)",
  "--radius-pill": "nur Status-Plakette",
};

/** The 1-px shorthands from `tokens.css` — the tone is the whole difference. */
const BORDER_TONE: { token: string; colour: string; use: string }[] = [
  { token: "--border-1-subtle", colour: "--color-border-subtle", use: "Zeile" },
  { token: "--border-1", colour: "--color-border", use: "Standard, Karte" },
  { token: "--border-1-strong", colour: "--color-border-strong", use: "Tabellenblock, Knopfrand" },
];

/** Sechs Radien an derselben Fläche, drei Rand-Töne bei 1 px. */
export const Radius: Story = {
  render: () => (
    <div style={page}>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        Zurückhaltend — ein konservativer Beruf, bescheidene Ecken. Nichts wirkt „cuddly".
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(var(--space-24), 1fr))", gap: "var(--space-5)" }}>
        {RADIUS.map((token) => (
          <div key={token}>
            <div style={{ height: "var(--space-16)", background: "var(--color-bg-sunken)", border: "var(--border-1)", borderRadius: `var(${token})` }} />
            <div className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)", marginTop: "var(--space-2)" }}>{token.replace("--radius-", "")}</div>
            <div className="lw-numeric" style={{ fontSize: "var(--fs-ui-xs)", color: "var(--color-text-subtle)" }}>{readToken(token)}</div>
            <div style={{ fontSize: "var(--fs-ui-xs)", color: "var(--color-text-muted)" }}>{RADIUS_USE[token] ?? "kein Einsatzort in §2"}</div>
          </div>
        ))}
      </div>

      <Section
        title="Rand: 1 px, nie dicker"
        lead="Die einzige Ausnahme ist der aktive Tab mit 2 px. Die Farbe entscheidet, wie laut die Linie ist — nicht die Stärke."
      >
        <div style={{ display: "grid", gap: "var(--space-3)" }}>
          {BORDER_TONE.map((b) => (
            <div key={b.token} style={{ display: "grid", gridTemplateColumns: "var(--space-24) 1fr auto", gap: "var(--space-4)", alignItems: "center" }}>
              <code className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)" }}>{b.token.replace("--", "")}</code>
              <div style={{ borderTop: `var(${b.token})` }} />
              <span style={label}>
                {b.use} · <code className="lw-mono">{b.colour.replace("--color-", "")}</code>
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "flex-end", marginTop: "var(--space-6)" }}>
          <div>
            <div style={{ padding: "var(--space-2) var(--space-4)", borderBottom: "2px solid var(--color-primary)", color: "var(--color-primary)", fontWeight: 600, fontSize: "var(--fs-ui)" }}>
              Aktiver Tab
            </div>
            <div style={{ ...label, marginTop: "var(--space-2)" }}>2 px — die eine erlaubte Ausnahme</div>
          </div>
          <div>
            <div style={{ padding: "var(--space-2) var(--space-4)", borderLeft: "3px solid var(--color-accent)", background: "var(--color-accent-50)", fontSize: "var(--fs-ui)" }}>
              Aktive Zeile
            </div>
            <div style={{ ...label, marginTop: "var(--space-2)", color: "var(--color-warning)" }}>
              3 px in <code className="lw-mono">.v2tbl__row.is-active</code> — Abweichler (Befund 4): entweder die
              Ausnahme erweitern oder auf 2 px ziehen.
            </div>
          </div>
        </div>
      </Section>
    </div>
  ),
};

/* ── Elevation ────────────────────────────────────────────────────────── */

const SHADOW_USE: Record<string, string> = {
  "--shadow-xs": "gedrückte Segment-Taste, ganz flach angehoben",
  "--shadow-sm": "Karte, wenn sie keinen Rand trägt",
  "--shadow-md": "Menü, Popover, Knopf im Hover",
  "--shadow-lg": "Dialog",
  "--shadow-inset": "eingelassene Fläche, Fortschrittsschiene",
  "--shadow-drawer": "Slide-over — wirft nach links, nicht nach unten",
};

const LAYERS: { z: string; what: string }[] = [
  { z: "5", what: "sticky Kopf- und Fußzeile" },
  { z: "20", what: "Liste unter einem Feld (Combobox, Vorschlag)" },
  { z: "40", what: "Menü und Popover" },
  { z: "60 / 61", what: "Scrim, Dialog, Drawer, Toast" },
];

/** Schatten, Glows, Verläufe — und die z-index-Leiter, wie `v3.css` sie fährt. */
export const Elevation: Story = {
  render: () => (
    <div style={page}>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        Eine Karte trägt <strong>Rand oder Schatten, nie beides</strong> — und bevorzugt den Rand. Schatten sind
        sparsam: Menü, Popover, Dialog.
      </p>
      <div style={{ display: "flex", gap: "var(--space-6)", marginBottom: "var(--space-8)" }}>
        <div style={{ ...card, border: "var(--border-1)", flex: 1 }}>
          <div className="lw-overline">Richtig</div>
          <div style={{ marginTop: "var(--space-2)" }}>Karte mit Rand, ohne Schatten.</div>
        </div>
        <div style={{ ...card, boxShadow: "var(--shadow-sm)", flex: 1 }}>
          <div className="lw-overline">Auch richtig</div>
          <div style={{ marginTop: "var(--space-2)" }}>Karte mit Schatten, ohne Rand.</div>
        </div>
        <div style={{ ...card, border: "var(--border-1)", boxShadow: "var(--shadow-sm)", flex: 1 }}>
          <div className="lw-overline" style={{ color: "var(--color-danger)" }}>Falsch</div>
          <div style={{ marginTop: "var(--space-2)" }}>Rand <em>und</em> Schatten — die Kante wird doppelt gezeichnet.</div>
        </div>
      </div>

      <Section title="Die Leiter" lead="Jeder Schatten an derselben Karte, mit dem Ort, an dem er steht.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(var(--space-24), 1fr))", gap: "var(--space-6)" }}>
          {[...SHADOW, ...GLOW].map((token) => (
            <div key={token}>
              <div style={{ ...card, boxShadow: `var(${token})`, height: "var(--space-16)" }} />
              <div className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)", marginTop: "var(--space-3)" }}>{token.replace("--", "")}</div>
              <div style={{ fontSize: "var(--fs-ui-xs)", color: "var(--color-text-muted)" }}>
                {SHADOW_USE[token] ?? "aktiv, fokussiert, von Ludwig angefasst — sparsam"}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Verläufe"
        lead="Nur lesendes Register — Hero, Login, Hilfe. In der Arbeitsfläche steht kein Verlauf."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(var(--space-24), 1fr))", gap: "var(--space-4)" }}>
          {GRAD.map((token) => (
            <div key={token}>
              <div style={{ height: "var(--space-16)", background: `var(${token})`, borderRadius: "var(--radius-md)", border: "var(--border-1)" }} />
              <div className="lw-mono" style={{ fontSize: "var(--fs-ui-xs)", marginTop: "var(--space-2)" }}>{token.replace("--grad-", "")}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Ebenen"
        lead="Kein Token dafür — die Leiter steht in v3.css. Hier steht sie aufgeschrieben, damit die nächste Ebene sie liest, statt eine eigene Zahl zu erfinden."
      >
        <div style={{ display: "grid", gap: "var(--space-2)", maxWidth: "var(--container-narrow)" }}>
          {LAYERS.map((layer, i) => (
            <div
              key={layer.z}
              style={{
                marginLeft: `calc(var(--space-6) * ${i})`,
                background: "var(--color-surface)",
                border: "var(--border-1)",
                borderLeft: "3px solid var(--color-accent)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3) var(--space-4)",
                fontSize: "var(--fs-ui)",
                display: "flex",
                gap: "var(--space-4)",
              }}
            >
              <span className="lw-numeric" style={{ fontWeight: 600, minWidth: "var(--space-12)" }}>{layer.z}</span>
              <span>{layer.what}</span>
            </div>
          ))}
        </div>
        <p className="lw-caption" style={{ marginTop: "var(--space-4)", maxWidth: "var(--content-measure)" }}>
          Befund 6: die Alt-Stylesheets fahren eigene Leitern —{" "}
          <code className="lw-mono">components.css</code> Drawer 90/91 und Toast 100,{" "}
          <code className="lw-mono">booking.css</code> Drawer 1080/1081,{" "}
          <code className="lw-mono">app-chrome.css</code> 50 und Sperre 200. Ein Alt-Drawer liegt damit über jedem
          v3-Dialog, ein Alt-Toast über jedem v3-Drawer. Beim Ablösen der Alt-Stylesheets auf diese Leiter ziehen.
        </p>
      </Section>
    </div>
  ),
};

/* ── Widths ───────────────────────────────────────────────────────────── */

const WIDTH_USE: Record<string, string> = {
  "--container-narrow": "Login, Hilfe-Artikel",
  "--container-base": "lesende Seite mit Fließtext",
  "--container-wide": "lesendes Register, breit — zugleich die Schwelle aus L1",
  "--container-app": "Arbeitsfläche; ohne Deckel laufen Tabellen auf 27\" über 2000 px",
  "--drawer-sm": "Fakten-Liste",
  "--drawer-md": "Detail-Ansicht",
  "--drawer-lg": "PDF-Vorschau, Kontoblatt",
};

function Measure({ token }: { token: string }) {
  const threshold = token === "--container-wide";
  return (
    <div style={{ marginBottom: "var(--space-5)" }}>
      <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "baseline", marginBottom: "var(--space-1)" }}>
        <code className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)" }}>{token.replace("--", "")}</code>
        <span className="lw-numeric" style={label}>{readToken(token)}</span>
        <span style={{ ...label, color: threshold ? "var(--color-accent-700)" : undefined }}>{WIDTH_USE[token] ?? ""}</span>
      </div>
      <div
        style={{
          width: `var(${token})`,
          height: "var(--space-2)",
          background: threshold ? "var(--color-accent)" : "var(--color-border-strong)",
          borderRadius: "var(--radius-sm)",
        }}
      />
    </div>
  );
}

/** Container, Textmaß und Drawer-Breiten als echte Linien, nicht als Text. */
export const Widths: Story = {
  render: () => (
    <div>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        Die Linien sind so breit wie ihr Token — nach rechts scrollen, wo der Rahmen zu Ende ist. Blau markiert
        ist <code className="lw-mono">--container-wide</code>: dieselben 1280 px sind die{" "}
        <strong>Schwelle aus L1</strong>. Darunter zeigt die App eine Sperre mit einem Satz, keinen
        zusammengeschobenen Screen. Es gibt kein Mobil- und kein Tablet-Ziel.
      </p>
      <div style={{ overflowX: "auto", paddingBottom: "var(--space-4)" }}>
        {[...CONTAINER, ...DRAWER].map((token) => (
          <Measure key={token} token={token} />
        ))}
        <div style={{ marginBottom: "var(--space-5)" }}>
          <div style={{ display: "flex", gap: "var(--space-3)", alignItems: "baseline", marginBottom: "var(--space-1)" }}>
            <code className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)" }}>content-measure</code>
            <span className="lw-numeric" style={label}>{readToken("--content-measure")}</span>
            <span style={label}>Zeilenlänge im Fließtext — Zeichen, nicht Pixel</span>
          </div>
          <div style={{ width: "var(--content-measure)", height: "var(--space-2)", background: "var(--color-border-strong)", borderRadius: "var(--radius-sm)" }} />
        </div>
      </div>
      <p className="lw-caption" style={{ maxWidth: "var(--content-measure)", color: "var(--color-warning)" }}>
        Befund 10: <code className="lw-mono">v3.css</code> kennt neben der Schwelle noch dreimal{" "}
        <code className="lw-mono">max-width: 1160px</code> (Stapelabnahme-Raster). Entweder wird die Ausnahme
        benannt oder auf 1279 px gezogen — zwei Breakpoints sind einer zu viel.
      </p>
    </div>
  ),
};

/* ── States ───────────────────────────────────────────────────────────── */

const STATE_HEAD: { name: string; tone: string }[] = [
  { name: "Ruhe", tone: "der Grund der Fläche" },
  { name: "Hover", tone: "eine Tonstufe höher" },
  { name: "Ausgewählt · gedrückt", tone: "accent-50 mit Akzentkante · Knopf: primary-800" },
  { name: "Gesperrt", tone: "opacity .5, cursor not-allowed" },
];

const rowBase: CSSProperties = {
  borderBottom: "var(--border-1-subtle)",
  fontSize: "var(--fs-ui)",
  padding: "var(--space-3) var(--space-5)",
  cursor: "pointer",
};

const chipBase: CSSProperties = {
  border: "1px solid var(--color-border-strong)",
  background: "var(--color-surface)",
  color: "var(--color-text-muted)",
  borderRadius: "var(--radius-pill)",
  padding: "var(--space-1) var(--space-3)",
  fontSize: "var(--fs-ui-sm)",
  fontWeight: 600,
  cursor: "pointer",
};

function StateCell({ note, children }: { note: string; children: ReactNode }) {
  return (
    <td style={{ padding: "var(--space-3)", borderBottom: "var(--border-1-subtle)", verticalAlign: "top" }}>
      {children}
      <div className="lw-mono" style={{ fontSize: "var(--fs-ui-xs)", color: "var(--color-text-subtle)", marginTop: "var(--space-2)" }}>
        {note}
      </div>
    </td>
  );
}

/**
 * Dasselbe Element viermal. Die Tonstufe unter jeder Probe ist die, die
 * `v3.css` heute setzt — und damit die Regel.
 */
export const States: Story = {
  render: () => (
    <div style={page}>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        <strong>Jedes klickbare Element hat einen Hover-Zustand</strong> — Zeile, Karte, Tab, Chip, Icon-Knopf,
        Link. Ohne Hover-Antwort ist ein Element nicht klickbar; umgekehrt bekommt nichts Hover, was nicht klickt.
        Hover hebt den Grund <strong>eine</strong> Stufe; der Link bekommt eine Unterstreichung. Nichts wächst,
        nichts springt. Die Spalte „Ruhe" reagiert live — fahren Sie darüber.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ padding: "var(--space-2) var(--space-3)", borderBottom: "var(--border-1-strong)", textAlign: "left", fontSize: "var(--fs-ui-sm)", color: "var(--color-text-muted)" }} />
            {STATE_HEAD.map((h) => (
              <th key={h.name} style={{ padding: "var(--space-2) var(--space-3)", borderBottom: "var(--border-1-strong)", textAlign: "left", fontSize: "var(--fs-ui-sm)", color: "var(--color-text-muted)" }}>
                {h.name}
                <div style={{ fontWeight: 400, color: "var(--color-text-subtle)", fontSize: "var(--fs-ui-xs)" }}>{h.tone}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th style={{ ...rowBase, cursor: "default", textAlign: "left", width: "var(--space-24)" }}>Zeile</th>
            <StateCell note="bg">
              <div className="v2tbl__row is-clickable" style={rowBase}>RE-4471 · Bürobedarf Meier GmbH</div>
            </StateCell>
            <StateCell note="bg → bg-soft">
              <div style={{ ...rowBase, background: "var(--color-bg-soft)" }}>RE-4471 · Bürobedarf Meier GmbH</div>
            </StateCell>
            <StateCell note="accent-50 + 3 px accent links">
              <div style={{ ...rowBase, background: "var(--color-accent-50)", borderLeft: "3px solid var(--color-accent)" }}>
                RE-4471 · Bürobedarf Meier GmbH
              </div>
            </StateCell>
            <StateCell note="opacity .5 · not-allowed">
              <div style={{ ...rowBase, opacity: 0.5, cursor: "not-allowed" }}>RE-4471 · Bürobedarf Meier GmbH</div>
            </StateCell>
          </tr>
          <tr>
            <th style={{ ...rowBase, cursor: "default", textAlign: "left" }}>Knopf (primär)</th>
            <StateCell note="primary-700">
              <Button variant="primary">Stapel abnehmen</Button>
            </StateCell>
            <StateCell note="primary-700 → primary-600 + shadow-md">
              <Button variant="primary" style={{ background: "var(--color-primary-600)", boxShadow: "var(--shadow-md)" }}>
                Stapel abnehmen
              </Button>
            </StateCell>
            <StateCell note="gedrückt: primary-800 + shadow-sm">
              <Button variant="primary" style={{ background: "var(--color-primary-800)", boxShadow: "var(--shadow-sm)" }}>
                Stapel abnehmen
              </Button>
            </StateCell>
            <StateCell note="opacity .5 · not-allowed">
              <Button variant="primary" disabled>Stapel abnehmen</Button>
            </StateCell>
          </tr>
          <tr>
            <th style={{ ...rowBase, cursor: "default", textAlign: "left" }}>Chip</th>
            <StateCell note="surface">
              <button type="button" className="v2chip">Ungeprüft</button>
            </StateCell>
            <StateCell note="surface → bg-soft">
              <button type="button" style={{ ...chipBase, background: "var(--color-bg-soft)" }}>Ungeprüft</button>
            </StateCell>
            <StateCell note="primary-700, Text auf Dunkel">
              <button type="button" className="v2chip is-active">Ungeprüft</button>
            </StateCell>
            <StateCell note="opacity .5 · not-allowed">
              <button type="button" className="v2chip" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Ungeprüft</button>
            </StateCell>
          </tr>
        </tbody>
      </table>
      <p className="lw-caption" style={{ marginTop: "var(--space-5)", maxWidth: "var(--content-measure)" }}>
        Kein Zustand steht allein in der Farbe (V7): „ausgewählt" trägt zusätzlich die Kante beziehungsweise die
        Umkehr von Grund und Text, „gesperrt" den Mauszeiger, „gedrückt" den flacheren Schatten. Der Zeiger{" "}
        <code className="lw-mono">pointer</code> steht nur an dem, was klickt.
      </p>
    </div>
  ),
};

/* ── Motion ───────────────────────────────────────────────────────────── */

function Fade({ duration, ease }: { duration: string; ease: string }) {
  const [on, setOn] = useState(false);
  return (
    <div>
      <button
        type="button"
        className="v2btn v2btn--secondary v2btn--sm"
        onClick={() => setOn((v) => !v)}
        style={{ marginBottom: "var(--space-2)" }}
      >
        {on ? "Zurück" : "Auslösen"}
      </button>
      <div
        style={{
          height: "var(--space-12)",
          background: "var(--color-accent-100)",
          borderRadius: "var(--radius-md)",
          opacity: on ? 1 : 0,
          transform: on ? "translateY(0)" : "translateY(8px)",
          transition: `opacity var(${duration}) var(${ease}), transform var(${duration}) var(${ease})`,
        }}
      />
      <div className="lw-mono" style={{ fontSize: "var(--fs-ui-xs)", color: "var(--color-text-subtle)", marginTop: "var(--space-2)" }}>
        {duration.replace("--duration-", "")} · {ease.replace("--ease-", "")}
      </div>
    </div>
  );
}

/** Dauern × Kurven zum Auslösen, der Fokusring an drei Elementen, Reduced Motion. */
export const Motion: Story = {
  render: () => (
    <div style={page}>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        Bewegung ist funktional: Fade, Translate-Y 4–8 px, Höhe beim Ausklappen. Kein Skalieren, kein Federn, kein
        Parallax, kein Glanz.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--space-6)", marginBottom: "var(--space-10)" }}>
        {DURATION.map((duration) =>
          EASE.map((ease) => <Fade key={`${duration}-${ease}`} duration={duration} ease={ease} />),
        )}
      </div>

      <Section
        title="Fokus"
        lead={
          <>
            2 px <code className="lw-mono">--color-focus</code> mit Offset, nie abgeschaltet (V10). Mit der
            Tabulatortaste durch die drei Elemente gehen — der Fokus muss an jedem sichtbar sein.{" "}
            <strong>Das Feld ist die benannte Ausnahme:</strong> es setzt <code className="lw-mono">outline: none</code>{" "}
            und ersetzt den Ring durch einen kräftigeren Rand (
            <code className="lw-mono">--color-primary-700</code>, gemessen 11,64:1) plus einen weichen Schein. Zwei
            Fokus-Grammatiken im Set, und diese Seite ist der Ort, an dem das stehen muss.
          </>
        }
      >
        <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "center", flexWrap: "wrap" }}>
          <Button variant="secondary">Beleg prüfen</Button>
          <input className="v2in" defaultValue="6815" style={{ width: "var(--space-24)" }} aria-label="Konto" />
          <div className="v2tbl__row is-clickable" tabIndex={0} style={{ ...rowBase, border: "var(--border-1)", borderRadius: "var(--radius-md)" }}>
            RE-4471 · Bürobedarf Meier GmbH
          </div>
        </div>
      </Section>

      <Section
        title="Reduced Motion"
        lead="Jede Transition und Animation respektiert prefers-reduced-motion: reduce — aus oder auf Fade reduziert. Ein Skeleton pulsiert dann nicht, ein Toast erscheint ohne Weg."
      >
        <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
          Gemessen in <code className="lw-mono">v3.css</code>:{" "}
          <span className="lw-numeric">{count(/transition:/g)}</span> Transitions und{" "}
          <span className="lw-numeric">{count(/\banimation:/g)}</span> Animations stehen{" "}
          <span className="lw-numeric">{count(/prefers-reduced-motion/g)}</span> Blöcken gegenüber. Die Namen dazu
          stehen bewusst nicht hier: der erste Anlauf zählte vier und nannte drei, und eine Liste neben einer
          Zahl veraltet mit dem nächsten Commit.{" "}
          <strong>Seit 0093 (b) ist die Lücke zu:</strong> **Übergänge** fallen sämtlich weg — eine Regel über
          <code className="lw-mono">*</code> statt einer Selektorliste, die jede neue Transition von Hand
          nachtragen müsste. <strong>Animationen</strong> bleiben: Spinner und Skelett sagen etwas, solange sie
          laufen. Diese Seite kann die Media-Query nicht umschalten; wer abnimmt, stellt sie im Betriebssystem an
          und misst nach.
        </p>
      </Section>
    </div>
  ),
};
