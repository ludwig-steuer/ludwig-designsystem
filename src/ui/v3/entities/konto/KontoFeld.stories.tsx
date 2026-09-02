import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Field } from "../../primitives/Form";
import { KontoFeld, type KontoKandidat } from "./KontoFeld";

const meta: Meta<typeof KontoFeld> = { title: "v3/Entitäten/Konto/KontoFeld", component: KontoFeld };
export default meta;
type Story = StoryObj<typeof KontoFeld>;

const KANDIDATEN = {
  agent: [{ number: "6815", name: "Bürobedarf", reason: "aus der Position „Druckerpatronen“" }],
  partner: [{ number: "6820", name: "Porto", reason: "zuletzt 12× bei Bürobedarf GmbH" }],
  aehnlich: [{ number: "6800", name: "Sonstige Betriebsausgaben", reason: "9 vergleichbare Belege" }],
  belegposition: [{ number: "6845", name: "EDV-Zubehör", reason: "Positionstext „Toner“" }],
};

const ALLE: KontoKandidat[] = [
  { number: "6600", name: "Werbekosten" },
  { number: "6805", name: "Telefon" },
  { number: "6810", name: "Internet" },
  { number: "6815", name: "Bürobedarf" },
  { number: "6820", name: "Porto" },
];

/**
 * Die Gruppen sind die Antwort auf „warum steht dieses Konto oben?". Ohne sie
 * wäre die Reihenfolge eine Behauptung.
 */
export const MitKandidaten: Story = {
  render: function Render() {
    const [v, setV] = useState("6815");
    return (
      <div style={{ maxWidth: 380, minHeight: 420 }}>
        <Field label="Konto" htmlFor="k">
          <KontoFeld
            value={v}
            onChange={setV}
            candidates={KANDIDATEN}
            onSearch={async (q) =>
              ALLE.filter((k) => k.number.includes(q) || k.name.toLowerCase().includes(q.toLowerCase()))
            }
          />
        </Field>
      </div>
    );
  },
};

/** Ohne Vorschläge: nur der Kontenrahmen, über Nummer **und** Name suchbar. */
export const NurVolltext: Story = {
  render: function Render() {
    const [v, setV] = useState("");
    return (
      <div style={{ maxWidth: 380, minHeight: 420 }}>
        <Field label="Konto" hint="Nummer oder Name — beides führt zum Ziel." htmlFor="k2">
          <KontoFeld
            value={v}
            onChange={setV}
            candidates={{}}
            onSearch={async (q) =>
              ALLE.filter((k) => k.number.includes(q) || k.name.toLowerCase().includes(q.toLowerCase()))
            }
          />
        </Field>
      </div>
    );
  },
};

/** Kein Treffer: der Text sagt, wo gesucht wurde — nicht bloß „nichts". */
export const OhneTreffer: Story = {
  render: function Render() {
    const [v, setV] = useState("9999");
    return (
      <div style={{ maxWidth: 380, minHeight: 300 }}>
        <Field label="Konto" htmlFor="k3">
          <KontoFeld value={v} onChange={setV} candidates={{}} onSearch={async () => []} />
        </Field>
      </div>
    );
  },
};

/** Ungültig: der Fehler benennt die Bedingung, das Feld bleibt bedienbar. */
export const Ungueltig: Story = {
  render: function Render() {
    const [v, setV] = useState("4980");
    return (
      <div style={{ maxWidth: 380, minHeight: 200 }}>
        <Field label="Konto" error="4980 gibt es im SKR04 dieses Mandanten nicht." htmlFor="k4">
          <KontoFeld value={v} onChange={setV} candidates={{}} invalid />
        </Field>
      </div>
    );
  },
};
