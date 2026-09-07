/// <reference types="vite/client" />
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties, ReactNode } from "react";

import tokensCss from "../../styles/tokens.css?raw";
import { StatusBadge } from "./patterns/StatusBadge";

/**
 * Colour (0055) — no component, no new CSS. Every `--color-*` lives in
 * `tokens.css`; this story is its proof, because „welchen Ton nehme ich?"
 * has had no answer one could look at.
 *
 * Nothing here is transcribed: the token list is parsed out of `tokens.css`,
 * the values are read from `:root` at runtime and the contrast is computed,
 * so a changed token changes this page (V13 — no second source).
 */
const meta: Meta = { title: "v3/Grundlagen/Farbe" };
export default meta;
type Story = StoryObj;

/* ── Measurement ──────────────────────────────────────────────────────── */

/** Every `--color-*` declared in `tokens.css`, in file order. */
const COLOR_TOKENS: string[] = [...tokensCss.matchAll(/^ {2}(--color-[a-z0-9-]+):/gm)].flatMap((m) =>
  // `flatMap` over `map`: a group that did not match is not a token, and under
  // `noUncheckedIndexedAccess` saying so is cheaper than asserting it away.
  m[1] ? [m[1]] : [],
);

/**
 * Everything that could read a token — the stylesheets and v3 itself.
 * Stories are excluded on purpose: a page that shows every token would
 * otherwise report every token as used.
 */
const READERS = Object.values(
  import.meta.glob<string>(["../../styles/*.css", "./**/*.ts", "./**/*.tsx", "!./**/*.stories.tsx"], {
    query: "?raw",
    import: "default",
    eager: true,
  }),
).join("\n");

/** No stylesheet and no component reads this token. */
const isUnread = (token: string) => !READERS.includes(`var(${token})`);

/**
 * The declared value **as the browser hands it back** — not verbatim: a token
 * whose declaration is itself a `var()` comes back substituted
 * (`--color-info` comes back as the accent's own value, not as
 * `var(--color-accent)`). The old
 * comment claimed the opposite (acceptance of 0055).
 */
const readToken = (token: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(token).trim();

/** Resolved colour of a token as [r, g, b, alpha] — the browser parses it. */
/** A colour is four numbers, not „an array of numbers" — the tuple says so. */
type Rgba = [number, number, number, number];

function tokenRgba(token: string): Rgba {
  const probe = document.createElement("span");
  probe.style.color = `var(${token})`;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const parts = (computed.match(/[\d.]+/g) ?? []).map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0, parts[3] ?? 1];
}

const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const luminance = ([r, g, b]: Rgba) =>
  0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
/** Composite the foreground over the background; the alpha rides on the front. */
const over = (fg: Rgba, bg: Rgba): Rgba => [
  fg[0] * fg[3] + bg[0] * (1 - fg[3]),
  fg[1] * fg[3] + bg[1] * (1 - fg[3]),
  fg[2] * fg[3] + bg[2] * (1 - fg[3]),
  1,
];

/** WCAG 2.x contrast of one token against another, alpha composited. */
function contrast(token: string, backgroundToken: string): number {
  const bg = tokenRgba(backgroundToken);
  const fg = over(tokenRgba(token), bg);
  const a = luminance(fg);
  const b = luminance(bg);
  const light = Math.max(a, b);
  const dark = Math.min(a, b);
  return (light + 0.05) / (dark + 0.05);
}

const ratio = (n: number) => `${n.toFixed(2).replace(".", ",")}:1`;

/* ── Shared bits ──────────────────────────────────────────────────────── */

const RETIRED = "--color-warning-strong";

function Section({ title, lead, children }: { title: string; lead: string; children: ReactNode }) {
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

function Mark({ tone, children }: { tone: "danger" | "warning" | "neutral"; children: ReactNode }) {
  const color = tone === "neutral" ? "var(--color-text-subtle)" : `var(--color-${tone})`;
  return (
    <span
      style={{
        fontSize: "var(--fs-ui-xs)",
        lineHeight: "var(--lh-ui-xs)",
        color,
        border: `1px solid ${color}`,
        borderRadius: "var(--radius-sm)",
        padding: "0 var(--space-1)",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

const cell: CSSProperties = {
  padding: "var(--space-2) var(--space-3)",
  borderBottom: "var(--border-1-subtle)",
  fontSize: "var(--fs-ui)",
  lineHeight: "var(--lh-ui)",
  verticalAlign: "top",
  textAlign: "left",
};
const headCell: CSSProperties = {
  ...cell,
  borderBottom: "var(--border-1-strong)",
  fontSize: "var(--fs-ui-sm)",
  color: "var(--color-text-muted)",
  fontWeight: 600,
};
const numCell: CSSProperties = { ...cell, textAlign: "right", fontVariantNumeric: "tabular-nums lining-nums" };

/* ── Ramps ────────────────────────────────────────────────────────────── */

/** The families, in the order `tokens.css` declares them. First match wins. */
const FAMILIES: { title: string; lead: string; holds: (token: string) => boolean }[] = [
  { title: "Primär", lead: "Die Stimme der Marke: App-Chrome, Überschrift 1–2, Primär-Knopf. -600 ist Hover, -800 gedrückt.", holds: (t) => t.startsWith("--color-primary") },
  { title: "Akzent", lead: "Wo klicke ich? Link, aktive Zeile, Fokus. Nur -700 trägt Text — die übrigen sind Fläche und Rand.", holds: (t) => t.startsWith("--color-accent") },
  { title: "Text", lead: "Vier Stufen auf hellem Grund, zwei auf dunklem. Nie reines Schwarz.", holds: (t) => t.startsWith("--color-text") },
  { title: "Grund", lead: "Seite · Arbeitsfläche · eingelassen. Hover hebt den Grund genau eine Stufe.", holds: (t) => t.startsWith("--color-bg") },
  { title: "Fläche", lead: "Die Karte: Körper und Kopf-/Fußzone (A3).", holds: (t) => t.startsWith("--color-surface") },
  { title: "Rand", lead: "Drei Trennlinien ohne Kontrastanspruch, dazu der Kontroll-Rand mit 3:1 (WCAG 1.4.11).", holds: (t) => t.startsWith("--color-border") },
  { title: "Semantik", lead: "Die Kritikalitätsskala, je Ton und Fläche. Farbe kodiert Kritikalität, nie einen Wert (A7).", holds: (t) => /success|warning|danger|info/.test(t) },
  { title: "Scrim und Fokus", lead: "Über der Arbeit, und dort, wo der Fokus steht.", holds: (t) => /scrim|focus/.test(t) },
];

function Swatch({ token }: { token: string }) {
  const name = token.replace("--color-", "");
  return (
    <div style={{ minWidth: 0 }}>
      <div
        style={{
          height: "var(--space-12)",
          borderRadius: "var(--radius-md)",
          background: `var(${token})`,
          border: "var(--border-1)",
        }}
      />
      <div className="lw-mono" style={{ fontSize: "var(--fs-ui-sm)", marginTop: "var(--space-2)" }}>{name}</div>
      <div className="lw-mono" style={{ fontSize: "var(--fs-ui-xs)", color: "var(--color-text-subtle)" }}>
        {readToken(token)}
      </div>
      <div
        className="lw-numeric"
        style={{ fontSize: "var(--fs-ui-xs)", color: "var(--color-text-subtle)", marginTop: "var(--space-1)" }}
      >
        {ratio(contrast(token, "--color-bg"))} · {ratio(contrast(token, "--color-bg-soft"))}
      </div>
      {token === RETIRED ? (
        <div style={{ marginTop: "var(--space-1)" }}>
          <Mark tone="danger">entfällt (A7, A9) — Rückbau offen</Mark>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Jede Familie einmal, jede Kachel mit Token-Name, gelesenem Wert und
 * Kontrast gegen Weiß und `bg-soft`. Kein Wert ist abgeschrieben.
 */
export const Ramps: Story = {
  render: () => {
    const taken = new Set<string>();
    const rows = FAMILIES.map((family) => {
      const tokens = COLOR_TOKENS.filter((t) => !taken.has(t) && family.holds(t));
      tokens.forEach((t) => taken.add(t));
      return { ...family, tokens };
    });
    const rest = COLOR_TOKENS.filter((t) => !taken.has(t));

    return (
      <div style={{ maxWidth: "var(--container-base)" }}>
        <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
          Es gibt <strong>keinen Dark Mode</strong> (Hard Rule 8 in <code className="lw-mono">ton-und-sprache.md</code>).
          Die Palette ist eine — was hier steht, gilt überall. Die beiden Zahlen unter jeder Kachel sind der
          gemessene Kontrast gegen <code className="lw-mono">bg</code> und <code className="lw-mono">bg-soft</code>.
        </p>
        {[...rows, { title: "Ohne Familie", lead: "Von keiner Reihe oben aufgenommen — hier fällt auf, was neu dazukam.", tokens: rest }]
          .filter((row) => row.tokens.length > 0)
          .map((row) => (
            <Section key={row.title} title={row.title} lead={row.lead}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(var(--space-24), 1fr))",
                  gap: "var(--space-5)",
                }}
              >
                {row.tokens.map((t) => (
                  <Swatch key={t} token={t} />
                ))}
              </div>
            </Section>
          ))}
        <p className="lw-caption" style={{ borderTop: "var(--border-1)", paddingTop: "var(--space-3)" }}>
          Gegenprobe: <span className="lw-numeric">{COLOR_TOKENS.length}</span> Kacheln gegen{" "}
          <span className="lw-numeric">{COLOR_TOKENS.length}</span> Deklarationen{" "}
          <code className="lw-mono">--color-*</code> in <code className="lw-mono">tokens.css</code>. Beide Zahlen
          stammen aus derselben Quelle, deshalb kann keine Kachel fehlen.
        </p>
      </div>
    );
  },
};

/* ── Roles ────────────────────────────────────────────────────────────── */

type Allow = "ja" | "nein" | "—";
type Role = { role: string | null; text: Allow; fill: Allow; edge: Allow; note?: string };

/**
 * §3 „Farbrollen", token by token. `role: null` means §3 gives this token no
 * role — that is a finding, not an omission, so it is shown as such.
 */
const ROLES: Record<string, Role> = {
  "--color-primary": { role: "Marke, Titel, Primär-Knopf", text: "ja", fill: "ja", edge: "ja", note: "App-Chrome, Überschrift 1–2" },
  "--color-primary-700": { role: "Marke, Titel, Primär-Knopf", text: "ja", fill: "ja", edge: "ja", note: "Grundwert von --color-primary" },
  "--color-primary-600": { role: "Primär-Knopf, Hover", text: "ja", fill: "ja", edge: "ja" },
  "--color-primary-800": { role: "Primär-Knopf, gedrückt", text: "ja", fill: "ja", edge: "ja" },
  "--color-accent-700": { role: "Aktion, Link, aktiv", text: "ja", fill: "—", edge: "ja", note: "die einzige Akzentstufe für Text" },
  "--color-accent": { role: "Fläche, Fokusring, aktive Zeile", text: "nein", fill: "ja", edge: "ja", note: "trägt keinen Text — unter 4,5:1" },
  "--color-accent-600": { role: "Fläche, Fokusring, aktive Zeile", text: "nein", fill: "ja", edge: "ja", note: "Grundwert von --color-accent" },
  "--color-accent-500": { role: "Fläche, Fokusring, aktive Zeile", text: "nein", fill: "ja", edge: "ja" },
  "--color-accent-100": { role: "Fläche, Fokusring, aktive Zeile", text: "nein", fill: "ja", edge: "ja", note: "Textmarkierung" },
  "--color-accent-50": { role: "Fläche, Fokusring, aktive Zeile", text: "nein", fill: "ja", edge: "ja", note: "ausgewählte Zeile" },
  "--color-text": { role: "Text", text: "ja", fill: "—", edge: "—" },
  "--color-text-muted": { role: "Text", text: "ja", fill: "—", edge: "—" },
  // Fläche „ja": 0110 hat den beiden zusätzlich die Rolle **Diagrammreihe**
  // gegeben, und §3 führt sie seither so. Zwei Graustufen, die beide ≥ 3:1
  // gegen Weiß stehen, liegen zwangsläufig eng — getrennt werden sie mit einer
  // Haarlinie, nicht mit Farbe.
  "--color-text-subtle": { role: "Text · Diagrammreihe (1.)", text: "ja", fill: "ja", edge: "—", note: "kleinste Textstufe: Unterzeile, Spaltenkopf; erste Reihe im Balkenbild" },
  "--color-text-on-dark": { role: "Text auf Dunkel", text: "ja", fill: "—", edge: "—", note: "Sidebar, Hero" },
  "--color-text-on-dark-muted": { role: "Text auf Dunkel", text: "ja", fill: "—", edge: "—" },
  "--color-bg": { role: "Grund", text: "—", fill: "ja", edge: "—", note: "Seite" },
  "--color-bg-soft": { role: "Grund", text: "—", fill: "ja", edge: "—", note: "Arbeitsfläche, Hover" },
  "--color-bg-sunken": { role: "Grund", text: "—", fill: "ja", edge: "—", note: "eingelassen" },
  "--color-surface": { role: "Karte", text: "—", fill: "ja", edge: "—", note: "Körper" },
  "--color-surface-head": { role: "Karte", text: "—", fill: "ja", edge: "—", note: "Kopf- und Fußzone (A3)" },
  "--color-border-subtle": { role: "Trennlinie", text: "—", fill: "—", edge: "ja", note: "Zeile" },
  "--color-border": { role: "Trennlinie", text: "—", fill: "—", edge: "ja", note: "Standard" },
  "--color-border-strong": { role: "Trennlinie", text: "—", fill: "—", edge: "ja", note: "Tabellenblock" },
  "--color-border-control": { role: "Kontroll-Rand · Diagrammreihe (2.)", text: "—", fill: "ja", edge: "ja", note: "identifizierend, 3:1 (WCAG 1.4.11); zweite Reihe im Balkenbild (0110)" },
  "--color-success": { role: "Erledigt (Ausgang)", text: "ja", fill: "ja", edge: "ja", note: "Haken, bestanden, freigegeben" },
  "--color-success-bg": { role: "Erledigt (Ausgang)", text: "—", fill: "ja", edge: "—" },
  "--color-warning": { role: "Warnung", text: "ja", fill: "ja", edge: "ja", note: "Stufe 2 der Skala" },
  "--color-warning-bg": { role: "Warnung", text: "—", fill: "ja", edge: "—" },
  "--color-danger": { role: "Fehler", text: "ja", fill: "ja", edge: "ja", note: "Stufe 1 der Skala" },
  "--color-danger-bg": { role: "Fehler", text: "—", fill: "ja", edge: "—" },
  "--color-info": { role: "Hinweis", text: "ja", fill: "ja", edge: "ja", note: "Stufe 3; Alias auf Akzent" },
  "--color-info-bg": { role: "Hinweis", text: "—", fill: "ja", edge: "—" },
  "--color-focus": { role: "Fokus", text: "—", fill: "—", edge: "ja", note: "2 px Ring mit Offset, nie abgeschaltet" },
  "--color-focus-ring": { role: "Fokus", text: "—", fill: "—", edge: "ja" },
  "--color-scrim": { role: null, text: "—", fill: "ja", edge: "—", note: "§2 Ebenen nennt ihn, §3 nicht" },
  "--color-focus-ring-soft": { role: null, text: "—", fill: "—", edge: "ja", note: "weicher Ring innen am Feld, dekorativ — §3 nennt ihn nicht" },
  [RETIRED]: { role: null, text: "—", fill: "—", edge: "—", note: "entfällt (A7, A9) — eine zweite Farbe für dieselbe Stufe ist ein Verstoß" },
};

const NO_ROLE: Role = { role: null, text: "—", fill: "—", edge: "—" };

/**
 * Wer darf was? Die Spalten Text / Fläche / Rand sind der eigentliche Inhalt:
 * `--color-accent` trägt keinen Text, `--color-accent-700` schon. Dazu die
 * beiden gerechneten Spalten „ohne Rolle" und „unbenutzt".
 */
export const Roles: Story = {
  render: () => {
    const rows = COLOR_TOKENS.map((token) => ({ token, ...(ROLES[token] ?? NO_ROLE), unread: isUnread(token) }));
    const withoutRole = rows.filter((r) => r.role === null);
    const unread = rows.filter((r) => r.unread);

    return (
      <div style={{ maxWidth: "var(--container-base)" }}>
        <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
          Die Rollen stammen aus <code className="lw-mono">design-guidelines.md</code> §3. „Ohne Rolle" heißt: §3
          nennt den Token nicht. „Unbenutzt" heißt: kein Stylesheet und keine Komponente liest ihn per{" "}
          <code className="lw-mono">var()</code> — gemessen über <code className="lw-mono">src/styles/*.css</code> und{" "}
          <code className="lw-mono">src/ui/v3</code> ohne Stories. Beide Spalten werden bei jedem Aufruf gerechnet.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headCell}>Token</th>
              <th style={headCell}>Rolle</th>
              <th style={headCell}>Text</th>
              <th style={headCell}>Fläche</th>
              <th style={headCell}>Rand/Icon</th>
              <th style={headCell}>Anmerkung</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.token}>
                <td style={cell}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "var(--space-3)",
                      height: "var(--space-3)",
                      background: `var(${r.token})`,
                      border: "var(--border-1)",
                      borderRadius: "var(--radius-sm)",
                      verticalAlign: "sub",
                      marginRight: "var(--space-2)",
                    }}
                  />
                  <code className="lw-mono">{r.token.replace("--color-", "")}</code>
                </td>
                <td style={cell}>
                  {r.role ?? <Mark tone="warning">ohne Rolle</Mark>}
                  {r.unread ? (
                    <>
                      {" "}
                      <Mark tone="neutral">unbenutzt</Mark>
                    </>
                  ) : null}
                </td>
                <td style={{ ...cell, color: r.text === "nein" ? "var(--color-danger)" : undefined }}>{r.text}</td>
                <td style={cell}>{r.fill}</td>
                <td style={cell}>{r.edge}</td>
                <td style={{ ...cell, color: "var(--color-text-muted)" }}>{r.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="lw-caption" style={{ marginTop: "var(--space-4)" }}>
          Ohne Rolle: <span className="lw-numeric">{withoutRole.length}</span> —{" "}
          {withoutRole.map((r) => r.token.replace("--color-", "")).join(", ")}. Unbenutzt:{" "}
          <span className="lw-numeric">{unread.length}</span> —{" "}
          {unread.map((r) => r.token.replace("--color-", "")).join(", ")}.{" "}
          {/* **Abgeleitet, nicht behauptet.** Die erste Fassung schrieb hier
              „dass `success-bg` und `info-bg` niemand liest" — beide **werden**
              gelesen (`v3.css`, die Zustands-Kacheln der `StateMachine`), und
              genau diesen Fehler prangert die Seite an. Also nur noch das, was
              die gerechnete Menge hergibt. */}
          {unread.some((r) => r.token.endsWith("-bg"))
            ? "Eine ungelesene Fläche heißt: wer sie zu brauchen scheint, holt sie woanders her."
            : "Jede Fläche des Satzes wird gelesen."}{" "}
          Die Plaketten sind der Fall, an dem das zu prüfen war — und das
          Ergebnis ist kleiner, als der Satz hier lange behauptet hat:{" "}
          <strong>den Text holen alle fünf aus Token</strong> (0112). Als
          Hex-Literale stehen nur noch <strong>drei Flächen</strong> (
          <code className="lw-mono">.bdg-info</code>,{" "}
          <code className="lw-mono">.bdg-success</code>,{" "}
          <code className="lw-mono">.bdg-warning</code>) und{" "}
          <strong>vier Ränder</strong> (dieselben drei plus{" "}
          <code className="lw-mono">.bdg-danger</code>). Der V13-Fall ist damit
          kleiner geworden, aber nicht weg (Befund 8).
        </p>
      </div>
    );
  },
};

/* ── Criticality ──────────────────────────────────────────────────────── */

const SCALE: { level: string; kind: string; token: string; meaning: string; example: string; axis: "job" | "klaerung_status"; status: string }[] = [
  { level: "Fehler", kind: "danger", token: "--color-danger", meaning: "Jemand muss handeln, bevor es weitergeht.", example: "gescheitert, überfällig, Abweichung über ±100 %", axis: "job", status: "failed" },
  { level: "Warnung", kind: "warning", token: "--color-warning", meaning: "Quittierbar, weiter ist möglich.", example: "Klärung offen, Prüfung nötig, Abweichung ±50–100 %", axis: "klaerung_status", status: "open" },
  { level: "Hinweis", kind: "info", token: "--color-info", meaning: "Neutral informierend, keine Handlung.", example: "läuft, zur Prüfung, Abweichung ±15–50 %", axis: "job", status: "running" },
  // Die Plakette daneben nimmt `--color-text` (gemessen `rgb(45,45,45)`), nicht
  // `--color-text-subtle`: `.bdg-neutral` schreibt es so. Die Spalte nennt das
  // Token der **Stufe**, die Plakette zeigt, was `app-chrome.css` daraus macht
  // — ein Auseinandergehen, das hier stehen bleibt, bis eines von beiden zieht.
  { level: "Debug", kind: "neutral", token: "--color-text-subtle (Plakette: --color-text)", meaning: "Ohne Kritikalität — Technik-Sicht und Ruhezustände.", example: "eingereiht, zurückgestellt, Abweichung bis ±15 %", axis: "job", status: "queued" },
];

/**
 * Eine Skala, vier Stufen, je genau eine Farbkategorie — technisch und
 * fachlich dieselbe (A7). `success` steht daneben, nicht darin.
 */
export const Criticality: Story = {
  render: () => (
    <div style={{ maxWidth: "var(--container-base)" }}>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
        Farbe kodiert <strong>Kritikalität, nie einen Wert</strong>. Rot ist ausschließlich die Stufe Fehler. Der{" "}
        <code className="lw-mono">kind</code> ist der Wert, den die Registry führt — eine Komponente wählt keine
        Farbe, sie nennt eine Stufe.
      </p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={headCell}>Stufe</th>
            <th style={headCell}>Registry-kind</th>
            <th style={headCell}>Token</th>
            <th style={headCell}>Bedeutung</th>
            <th style={headCell}>Beispiel</th>
            <th style={headCell}>So sieht sie aus</th>
          </tr>
        </thead>
        <tbody>
          {SCALE.map((s) => (
            <tr key={s.level}>
              <td style={{ ...cell, fontWeight: 600 }}>{s.level}</td>
              <td style={cell}><code className="lw-mono">{s.kind}</code></td>
              <td style={cell}><code className="lw-mono">{s.token.replace("--color-", "")}</code></td>
              <td style={cell}>{s.meaning}</td>
              <td style={{ ...cell, color: "var(--color-text-muted)" }}>{s.example}</td>
              <td style={cell}><StatusBadge axis={s.axis} status={s.status} info={false} /></td>
            </tr>
          ))}
          <tr>
            <td style={{ ...cell, fontWeight: 600 }}>Ausgang „erledigt"</td>
            <td style={cell}><code className="lw-mono">success</code></td>
            <td style={cell}><code className="lw-mono">success</code></td>
            <td style={cell}>Kein Skalenwert. Das Ergebnis, nicht die Dringlichkeit.</td>
            <td style={{ ...cell, color: "var(--color-text-muted)" }}>fertig, bestanden, freigegeben</td>
            <td style={cell}><StatusBadge axis="job" status="succeeded" info={false} /></td>
          </tr>
        </tbody>
      </table>
      <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: "var(--space-6)" }}>
        Die häufigste Verwechslung: <strong>Vorzeichen, Kategorie, Belegart und Mandant tragen keine Farbe.</strong>{" "}
        Ein Haben-Betrag ist nicht grün, ein negativer nicht rot, eine Belegart kein bunter Chip — sie sind keine
        Stufe. Wer für dieselbe Stufe eine zweite Farbe einführt, verletzt die Skala; genau deshalb entfällt{" "}
        <code className="lw-mono">--color-warning-strong</code> (A9).
      </p>
    </div>
  ),
};

/* ── Contrast ─────────────────────────────────────────────────────────── */

const OWN_BACKGROUND: Record<string, string> = {
  "--color-success": "--color-success-bg",
  "--color-warning": "--color-warning-bg",
  "--color-danger": "--color-danger-bg",
  "--color-info": "--color-info-bg",
};

/** Text on dark is measured against dark — everything else against the page. */
/** The two grounds a token is measured against — a pair, not „some strings". */
const GROUNDS = (token: string): [string, string] =>
  token.startsWith("--color-text-on-dark")
    ? ["--color-primary", "--color-primary-900"]
    : ["--color-bg", "--color-bg-soft"];

/**
 * Edges that identify a control and therefore owe 3:1 (WCAG 1.4.11). The
 * light accent surfaces carry no edge duty — they are fills.
 */
const IDENTIFYING_EDGE = ["--color-accent", "--color-accent-600", "--color-border-control", "--color-focus"];

/**
 * Alle textfähigen Token gegen ihre Schwelle, gerechnet statt zitiert. Wer
 * darunter liegt, steht markiert da.
 */
export const Contrast: Story = {
  render: () => {
    const pairs: { token: string; background: string; threshold: number | null; why: string }[] = [];
    for (const token of COLOR_TOKENS) {
      const role = ROLES[token] ?? NO_ROLE;
      if (role.text === "ja") {
        const [ground, second] = GROUNDS(token);
        pairs.push({ token, background: ground, threshold: 4.5, why: "Text" });
        pairs.push({ token, background: second, threshold: 4.5, why: "Text auf der zweiten Fläche" });
        const own = OWN_BACKGROUND[token];
        if (own) {
          pairs.push({ token, background: own, threshold: 4.5, why: "Text auf der eigenen Fläche" });
        }
      } else if (IDENTIFYING_EDGE.includes(token)) {
        pairs.push({ token, background: "--color-bg", threshold: 3, why: "Rand, Icon, Fokus" });
      } else if (role.role === "Trennlinie") {
        pairs.push({ token, background: "--color-bg", threshold: null, why: "dekorativ — kein Anspruch" });
      }
    }

    return (
      <div style={{ maxWidth: "var(--container-base)" }}>
        <p className="lw-body-sm" style={{ maxWidth: "var(--content-measure)", marginTop: 0 }}>
          Schwellen nach WCAG 2.2 AA (V10): Text <span className="lw-numeric">4,5:1</span>, Rand · Häkchen ·
          Fokus · Icon <span className="lw-numeric">3:1</span>. Jede Zahl hier wird beim Aufruf gerechnet — ändert
          jemand einen Token, ändert sich die Zahl. Deshalb kann diese Tabelle nicht veralten, während die Notizen
          in <code className="lw-mono">tokens.css</code> und §12 es könnten.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headCell}>Token</th>
              <th style={headCell}>auf</th>
              <th style={headCell}>wofür</th>
              <th style={{ ...headCell, textAlign: "right" }}>gemessen</th>
              <th style={{ ...headCell, textAlign: "right" }}>Schwelle</th>
              <th style={headCell}>Probe</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p) => {
              const value = contrast(p.token, p.background);
              const short = p.threshold !== null && value < p.threshold;
              return (
                <tr key={`${p.token}-${p.background}`}>
                  <td style={cell}><code className="lw-mono">{p.token.replace("--color-", "")}</code></td>
                  <td style={cell}><code className="lw-mono">{p.background.replace("--color-", "")}</code></td>
                  <td style={{ ...cell, color: "var(--color-text-muted)" }}>{p.why}</td>
                  <td style={numCell}>
                    {ratio(value)} {short ? <Mark tone="danger">unter der Schwelle</Mark> : null}
                  </td>
                  <td style={numCell}>{p.threshold === null ? "—" : ratio(p.threshold)}</td>
                  <td style={{ ...cell, background: `var(${p.background})` }}>
                    <span style={{ color: `var(${p.token})` }}>1.249,90 € · Beleg RE-4471</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="lw-caption" style={{ marginTop: "var(--space-4)", maxWidth: "var(--content-measure)" }}>
          Befund 9: <code className="lw-mono">.v2in</code> nimmt für den Eingaberand{" "}
          <code className="lw-mono">border-strong</code> statt <code className="lw-mono">border-control</code> — die
          Zeilen oben zeigen den Unterschied. Der Rand eines Bedienelements ist identifizierend und braucht 3:1
          (WCAG 1.4.11); eine Trennlinie braucht nichts. Und <code className="lw-mono">--color-info</code> steht
          hier unter der Schwelle, weil §3 ihm eine Textrolle gibt, er aber ein Alias auf{" "}
          <code className="lw-mono">--color-accent</code> ist — den dieselbe Tabelle für Text sperrt. Als Text
          gerendert wird er heute nirgends; die Plaketten nehmen <code className="lw-mono">accent-700</code>.
        </p>
      </div>
    );
  },
};
