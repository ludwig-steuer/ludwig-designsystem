import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ChevronLeft, ChevronRight, PanelLeftClose, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

const meta: Meta<typeof IconButton> = {
  title: "v3/Primitives/Aktion/IconButton",
  component: IconButton,
};
export default meta;
type Story = StoryObj<typeof IconButton>;

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>{children}</div>
);

/** `label` ist Pflicht — es steht als `aria-label` und `title` im DOM, nur
 *  nicht auf dem Schirm. Zeigen Sie mit der Maus darauf. */
export const Filled: Story = {
  render: () => (
    <Row>
      <IconButton label="Dialog schließen" icon={<X size={16} strokeWidth={1.5} />} />
      <IconButton label="Neu laden" icon={<RefreshCw size={16} strokeWidth={1.5} />} />
      <IconButton
        label="Seitenleiste einklappen"
        icon={<PanelLeftClose size={16} strokeWidth={1.5} />}
      />
    </Row>
  ),
};

/** 24 · 28 · 32 px — quadratisch, damit sie in Kopfleisten fluchten. */
export const Sizes: Story = {
  render: () => (
    <Row>
      <IconButton label="Schließen, klein" size="sm" icon={<X size={14} strokeWidth={1.5} />} />
      <IconButton label="Schließen, mittel" size="md" icon={<X size={16} strokeWidth={1.5} />} />
      <IconButton label="Schließen, groß" size="lg" icon={<X size={18} strokeWidth={1.5} />} />
      <IconButton label="Gesperrt, solange der Stapel läuft" disabled icon={<X size={16} strokeWidth={1.5} />} />
    </Row>
  ),
};

/** `ghost` liegt auf der Karte, `surface` braucht einen eigenen Grund. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      <Row>
        <IconButton label="Zurückblättern" icon={<ChevronLeft size={16} strokeWidth={1.5} />} />
        <IconButton label="Weiterblättern" icon={<ChevronRight size={16} strokeWidth={1.5} />} />
      </Row>
      <div style={{ background: "var(--color-bg-sunken)", padding: 12, borderRadius: 6 }}>
        <Row>
          <IconButton
            label="Zurückblättern"
            tone="surface"
            icon={<ChevronLeft size={16} strokeWidth={1.5} />}
          />
          <IconButton
            label="Weiterblättern"
            tone="surface"
            icon={<ChevronRight size={16} strokeWidth={1.5} />}
          />
        </Row>
      </div>
    </div>
  ),
};

/** Der Pager-Pfeil springt, er handelt nicht — mit `href` wird er ein `<a>`. */
export const AsLink: Story = {
  render: () => (
    <Row>
      <IconButton label="Vorherige Seite" href="#" icon={<ChevronLeft size={16} strokeWidth={1.5} />} />
      <span style={{ fontSize: 13 }}>Seite 3 von 12</span>
      <IconButton label="Nächste Seite" href="#" icon={<ChevronRight size={16} strokeWidth={1.5} />} />
    </Row>
  ),
};

/** Rundlauf über `onClick`. */
export const Interactive: Story = {
  render: function Render() {
    const [n, setN] = useState(1);
    return (
      <Row>
        <IconButton
          label="Vorherige Seite"
          icon={<ChevronLeft size={16} strokeWidth={1.5} />}
          disabled={n === 1}
          onClick={() => setN((v) => Math.max(1, v - 1))}
        />
        <span style={{ fontSize: 13 }}>Seite {n} von 12</span>
        <IconButton
          label="Nächste Seite"
          icon={<ChevronRight size={16} strokeWidth={1.5} />}
          disabled={n === 12}
          onClick={() => setN((v) => Math.min(12, v + 1))}
        />
      </Row>
    );
  },
};

/**
 * Bedingung 3 der Spec, sichtbar: das Schließen-Kreuz oben **und** der
 * beschriftete Weg unten. Das Kreuz spart Weg, es ist nicht der einzige.
 */
export const InUse: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        border: "1px solid var(--color-border)",
        borderRadius: 8,
        background: "var(--color-surface)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "12px 14px",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-head)",
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600 }}>Buchung stornieren</span>
        <IconButton label="Dialog schließen" icon={<X size={16} strokeWidth={1.5} />} />
      </div>
      <div style={{ padding: 14, fontSize: 13.5 }}>
        Die Buchung wird mit einem Storno-Satz aufgehoben. Der ursprüngliche Satz bleibt sichtbar.
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          padding: "12px 14px",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <Button size="sm">Abbrechen</Button>
        <Button size="sm" variant="danger">
          Stornieren
        </Button>
      </div>
    </div>
  ),
};
