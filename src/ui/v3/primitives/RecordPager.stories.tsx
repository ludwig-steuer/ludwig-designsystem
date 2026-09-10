import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { PageHeader } from "./PageHeader";
import { RecordPager } from "./RecordPager";

const meta: Meta<typeof RecordPager> = {
  title: "v3/Primitives/Navigation/RecordPager",
  component: RecordPager,
};
export default meta;
type Story = StoryObj<typeof RecordPager>;

const BACK = { href: "/cases", label: "Sachverhalte" };

/**
 * Mitten im Vorrat: der Rückweg ist benannt, die Zählung sagt, wie oft diese
 * Seite noch kommt. `1/117` im Kopf heißt: jeder Klick zählt mal 117.
 */
export const Filled: Story = {
  render: () => (
    <RecordPager
      position={3}
      total={117}
      label="Sachverhalt"
      back={BACK}
      prevHref="/cases/2"
      nextHref="/cases/4"
    />
  ),
};

/** Rand: erster Datensatz. „Zurück" bleibt stehen und ist inaktiv. */
export const FirstRecord: Story = {
  render: () => (
    <RecordPager position={1} total={117} label="Sachverhalt" back={BACK} prevHref={null} nextHref="/cases/2" />
  ),
};

/** Rand: letzter Datensatz — dieselbe Regel für „weiter". */
export const LastRecord: Story = {
  render: () => (
    <RecordPager
      position={6212}
      total={6212}
      label="Sachverhalt"
      back={BACK}
      prevHref="/cases/6211"
      nextHref={null}
    />
  ),
};

/** Ohne Rückweg — im Drawer trägt der Rahmen ihn, nicht der Pager. */
export const WithoutBack: Story = {
  render: () => <RecordPager position={12} total={40} prevHref="/cases/11" nextHref="/cases/13" />,
};

/**
 * Die Client-Variante mit Tasten: `J` zurück, `K` weiter — probieren Sie es
 * aus. Beide Tasten stehen sichtbar neben den Pfeilen (V14); ohne `hotkeys`
 * steht dort nichts, weil eine angezeigte Taste, die nichts tut, eine Lüge
 * wäre. Die Zählung bleibt beim Blättern an derselben Stelle stehen.
 */
export const Interactive: Story = {
  render: function Render() {
    const total = 117;
    const [pos, setPos] = useState(3);
    return (
      <div style={{ display: "grid", gap: 16, justifyItems: "start" }}>
        <RecordPager
          position={pos}
          total={total}
          label="Sachverhalt"
          back={BACK}
          hotkeys
          onPrev={pos > 1 ? () => setPos((p) => p - 1) : null}
          onNext={pos < total ? () => setPos((p) => p + 1) : null}
        />
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: 0 }}>
          Am Anfang und am Ende tut die Taste nichts — wie der Pfeil.
        </p>
      </div>
    );
  },
};

/** Im Einsatz: im `PageHeader` als `actions`. Kein eigener Slot nötig. */
export const InUse: Story = {
  render: () => (
    <PageHeader
      overline="Sachverhalt · 2026-0815"
      title="Eingangsrechnung: DomainFactory GmbH"
      description="Klärung offen, seit 6 Tagen"
      actions={
        <RecordPager
          position={3}
          total={117}
          label="Sachverhalt"
          back={BACK}
          prevHref="/cases/2"
          nextHref="/cases/4"
        />
      }
    />
  ),
};
