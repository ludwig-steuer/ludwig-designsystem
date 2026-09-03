import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Drawer } from "../../primitives/Drawer";
import { FieldList } from "../../primitives/FieldList";
import { Field } from "../../primitives/Form";
import { AccountField, type AccountCandidate } from "./AccountField";

const meta: Meta<typeof AccountField> = { title: "v3/Entitäten/Konto/AccountField", component: AccountField };
export default meta;
type Story = StoryObj<typeof AccountField>;

const CANDIDATES = {
  agent: [{ number: "6815", name: "Bürobedarf", reason: "aus der Position „Druckerpatronen“" }],
  partner: [{ number: "6820", name: "Porto", reason: "zuletzt 12× bei Bürobedarf GmbH" }],
  aehnlich: [{ number: "6800", name: "Sonstige Betriebsausgaben", reason: "9 vergleichbare Belege" }],
  belegposition: [{ number: "6845", name: "EDV-Zubehör", reason: "Positionstext „Toner“" }],
};

const ALL: AccountCandidate[] = [
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
export const WithCandidates: Story = {
  render: function Render() {
    const [v, setV] = useState("6815");
    return (
      <div style={{ maxWidth: 380, minHeight: 420 }}>
        <Field label="Konto" htmlFor="k">
          <AccountField
            value={v}
            onChange={setV}
            candidates={CANDIDATES}
            onSearch={async (q) =>
              ALL.filter((k) => k.number.includes(q) || k.name.toLowerCase().includes(q.toLowerCase()))
            }
          />
        </Field>
      </div>
    );
  },
};

/** Ohne Vorschläge: nur der Kontenrahmen, über Nummer **und** Name suchbar. */
export const FullTextOnly: Story = {
  render: function Render() {
    const [v, setV] = useState("");
    return (
      <div style={{ maxWidth: 380, minHeight: 420 }}>
        <Field label="Konto" hint="Nummer oder Name — beides führt zum Ziel." htmlFor="k2">
          <AccountField
            value={v}
            onChange={setV}
            candidates={{}}
            onSearch={async (q) =>
              ALL.filter((k) => k.number.includes(q) || k.name.toLowerCase().includes(q.toLowerCase()))
            }
          />
        </Field>
      </div>
    );
  },
};

/** Kein Treffer: der Text sagt, wo gesucht wurde — nicht bloß „nichts". */
export const NoMatch: Story = {
  render: function Render() {
    const [v, setV] = useState("9999");
    return (
      <div style={{ maxWidth: 380, minHeight: 300 }}>
        <Field label="Konto" htmlFor="k3">
          <AccountField value={v} onChange={setV} candidates={{}} onSearch={async () => []} />
        </Field>
      </div>
    );
  },
};

/** Ungültig: der Fehler benennt die Bedingung, das Feld bleibt bedienbar. */
export const Invalid: Story = {
  render: function Render() {
    const [v, setV] = useState("4980");
    return (
      <div style={{ maxWidth: 380, minHeight: 200 }}>
        <Field label="Konto" error="4980 gibt es im SKR04 dieses Mandanten nicht." htmlFor="k4">
          <AccountField value={v} onChange={setV} candidates={{}} invalid />
        </Field>
      </div>
    );
  },
};

/**
 * Mit `onOpenLedger` sitzt das Kontenblatt am Feld, nicht am Editor: die
 * Buchhalterin sieht nach, was sonst auf dem Konto liegt, **bevor** sie es
 * übernimmt. Das Feld meldet nur den Wunsch — den Drawer öffnet der Aufrufer.
 * Ohne Wert ist das Icon deaktiviert, nicht versteckt: sonst springt das
 * Layout beim ersten Zeichen.
 */
export const WithLedger: Story = {
  render: function Render() {
    const [v, setV] = useState("6815");
    const [leer, setLeer] = useState("");
    const [blatt, setBlatt] = useState<string | null>(null);
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 380, minHeight: 420 }}>
        <Field label="Konto" hint="Das Icon führt zum Kontenblatt." htmlFor="k5">
          <AccountField
            value={v}
            valueName="Bürobedarf"
            onChange={setV}
            candidates={CANDIDATES}
            onOpenLedger={setBlatt}
          />
        </Field>
        <Field label="Gegenkonto" hint="Ohne Wert bleibt das Icon stehen, deaktiviert." htmlFor="k6">
          <AccountField
            value={leer}
            onChange={setLeer}
            candidates={{}}
            onOpenLedger={setBlatt}
            ariaLabel="Gegenkonto"
          />
        </Field>
        <Drawer
          open={blatt !== null}
          onClose={() => setBlatt(null)}
          size="lg"
          title={`Kontenblatt ${blatt ?? ""}`}
          meta="Saldo 4.208,55 € · 31 Buchungen im Zeitraum"
        >
          <FieldList
            tone="bare"
            rows={[
              ["Kontenrahmen", "SKR04"],
              ["Art", "Aufwandskonto"],
              ["Letzte Buchung", "14.08.2026"],
            ]}
          />
        </Drawer>
      </div>
    );
  },
};

/**
 * Ruhend steht beides da — die Nummer ist der Wert, geprüft wird am Namen.
 * Beim Fokussieren bleibt der reine Suchtext, markiert: Tippen ersetzt ihn,
 * statt gegen einen zusammengesetzten String zu laufen. Kennt niemand den
 * Namen, steht die Nummer allein; ein stiller Lookup wäre eine Ladung.
 */
export const NumberAndName: Story = {
  render: function Render() {
    const [bekannt, setBekannt] = useState("6815");
    const [fremd, setFremd] = useState("4980");
    const [lang, setLang] = useState("6825");
    return (
      <div style={{ display: "grid", gap: 16, maxWidth: 300, minHeight: 420 }}>
        <Field label="Name bekannt" htmlFor="k7">
          <AccountField value={bekannt} onChange={setBekannt} candidates={CANDIDATES} />
        </Field>
        <Field label="Name unbekannt" hint={'Nur die Nummer — kein Platzhalter, kein „—".'} htmlFor="k8">
          <AccountField value={fremd} onChange={setFremd} candidates={{}} />
        </Field>
        <Field label="Langer Name im schmalen Feld" htmlFor="k9">
          <AccountField
            value={lang}
            valueName="Reinigung und Pflege der Geschäftsräume"
            onChange={setLang}
            candidates={{}}
            onOpenLedger={() => {}}
          />
        </Field>
      </div>
    );
  },
};
