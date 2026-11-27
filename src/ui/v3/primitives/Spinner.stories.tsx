import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Spinner } from "./Spinner";
import { Button } from "./Button";
import { Card, CardHead, CardSection } from "./Table";
import { StateIcon } from "../patterns/Review";

const meta: Meta<typeof Spinner> = { title: "v3/Primitives/Fläche/Spinner", component: Spinner };
export default meta;
type Story = StoryObj<typeof Spinner>;

const caption: CSSProperties = {
  fontSize: "var(--fs-ui-xs)",
  color: "var(--color-text-subtle)",
  marginBottom: "var(--space-2)",
};

function Ground({ token, children }: { token: string; children: ReactNode }) {
  return (
    <div>
      <div style={caption}>
        <code className="lw-mono">{token}</code>
      </div>
      <div
        data-ground={token}
        style={{
          background: `var(${token})`,
          border: "var(--border-1)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-4)",
          display: "grid",
          gap: "var(--space-4)",
          justifyItems: "start",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** `sm` and `lg` side by side, each with its word, on the three grounds it meets. */
export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: "var(--space-5)",
        maxWidth: "var(--container-base)",
      }}
    >
      {["--color-surface", "--color-bg-soft", "--color-accent-50"].map((token) => (
        <Ground key={token} token={token}>
          <Spinner label="wird geprüft …" />
          <Spinner size="lg" label="Verbindung wird geprüft …" />
        </Ground>
      ))}
    </div>
  ),
};

const row: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "start",
  gap: "var(--space-3)",
  padding: "var(--space-2) var(--space-4)",
  borderBottom: "var(--border-1-subtle)",
  fontSize: "var(--fs-ui)",
  lineHeight: "var(--lh-ui)",
};
const state: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--space-2)",
  color: "var(--color-text-muted)",
};

/** `sm` in a list of check rows, between two neighbours with a state sign and word — all rows equally high. */
export const InRow: Story = {
  render: () => (
    <Card>
      <CardHead title="Alles bereit?" sub="3 Prüfpunkte" />
      <div data-rows>
        <div style={row}>
          <span>Verbindung zu Ludwig</span>
          <span style={state}>
            <StateIcon state="done" />
            in Ordnung
          </span>
        </div>
        <div style={row}>
          <span>Anmeldung in DATEV</span>
          <Spinner label="wird geprüft …" />
        </div>
        <div style={row}>
          <span>Browser-Freigabe</span>
          <span style={state}>
            <StateIcon state="open" />
            offen
          </span>
        </div>
      </div>
    </Card>
  ),
};

function AreaDemo() {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: "var(--container-narrow)" }}>
      <Card>
        <CardHead title="Einrichtung" sub="Schritt 2 von 3 · Prüfen" />
        <CardSection>
          {done ? (
            <p className="lw-ui-text" style={{ margin: 0 }}>
              Alles bereit. Sie können den ersten Abgleich starten.
            </p>
          ) : (
            <Spinner size="lg" label="Verbindung wird geprüft …" />
          )}
        </CardSection>
      </Card>
      <div>
        <Button size="sm" onClick={() => setDone((d) => !d)}>
          {done ? "Prüfung erneut zeigen" : "Ergebnis zeigen"}
        </Button>
      </div>
    </div>
  );
}

/** `lg` in the body of a card, flush left with the card text; the switch shows the result in its place. */
export const InArea: Story = { render: () => <AreaDemo /> };

/** The button with `loading` in all sizes, primary and secondary, with and without `loadingLabel` — the circle is `Spinner label={null}`. */
export const InButton: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)", justifyItems: "start" }}>
      {(["xs", "sm", "md"] as const).map((size) => (
        <div key={size} style={{ display: "flex", gap: "var(--space-3)", alignItems: "center" }}>
          <Button size={size} variant="primary" loading loadingLabel="Speichere …">
            Speichern
          </Button>
          <Button size={size} loading>
            Stapel prüfen
          </Button>
        </div>
      ))}
    </div>
  ),
};

/** Edge: a long word in the width of the popup minus its margin — the word wraps, the circle stays 14 px on the first line. */
export const LongLabel: Story = {
  render: () => (
    <div
      data-frame
      style={{
        width: "calc(var(--space-20) * 3 + var(--space-10))",
        border: "var(--border-1)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-3)",
      }}
    >
      <Spinner label="Verbindung zu Ludwig wird geprüft, das dauert einige Sekunden …" />
    </div>
  ),
};
