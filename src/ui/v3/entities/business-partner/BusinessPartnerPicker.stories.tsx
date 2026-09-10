import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { ActionButton } from "../../primitives/ActionButton";
import { Card, CardHead } from "../../primitives/Table";
import {
  BusinessPartnerPicker,
  DIVERSE,
  type BusinessPartnerPickerItem,
} from "./BusinessPartnerPicker";

const meta: Meta<typeof BusinessPartnerPicker> = {
  title: "v3/Entitäten/Geschäftspartner/BusinessPartnerPicker",
  component: BusinessPartnerPicker,
};
export default meta;
type Story = StoryObj<typeof BusinessPartnerPicker>;

function partner(
  over: Partial<BusinessPartnerPickerItem> & { businessPartnerId: string },
): BusinessPartnerPickerItem {
  return {
    legalName: "Musterfirma Immobilien GmbH",
    shortName: null,
    city: "Musterstadt",
    creditorAccount: { accountNumber: "70001", isInternal: false },
    debtorAccount: null,
    ustIds: [],
    ...over,
  };
}

/**
 * Sechs Kandidaten, wie der Bestand sie stellt — darunter **zwei mit gleichem
 * Namen und verschiedenem Ort**. Genau dafür steht der Ort in der Zeile: bei
 * 149 Namensdubletten beim größten Mandanten ist er der Unterschied zwischen
 * einer Auswahl und einem Ratespiel.
 */
const SECHS: BusinessPartnerPickerItem[] = [
  partner({ businessPartnerId: "p-1", shortName: "MUSTERIMMO" }),
  partner({
    businessPartnerId: "p-2",
    legalName: "Musterbau Handels GmbH",
    creditorAccount: null,
    debtorAccount: { accountNumber: "10042", isInternal: false },
    city: "Beispielhausen",
  }),
  partner({
    businessPartnerId: "p-3",
    legalName: "Beispiel-Energie AG",
    creditorAccount: { accountNumber: "70123", isInternal: false },
    ustIds: ["DE000000000"],
  }),
  partner({
    businessPartnerId: "p-4",
    legalName: "Musterhandwerk Schmidt e. K.",
    city: "Musterstadt",
    creditorAccount: { accountNumber: "70044", isInternal: false },
  }),
  partner({
    businessPartnerId: "p-5",
    legalName: "Musterhandwerk Schmidt e. K.",
    city: "Beispielhausen",
    creditorAccount: { accountNumber: "70045", isInternal: false },
  }),
  partner({
    businessPartnerId: "p-6",
    legalName: "Testbank eG",
    creditorAccount: null,
    city: null,
  }),
];

function Frame({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ maxWidth: 520 }}>
      <Card>
        <CardHead title="Lieferant des Einzelsachverhalts" {...(sub ? { sub } : {})} />
        <div style={{ padding: 16 }}>{children}</div>
      </Card>
    </div>
  );
}

/**
 * Der Regelfall. Jede Trefferzeile trägt Kontonummer, Kurzname und Ort als
 * Beischrift — und **keinen Weg**: hier wird gewählt, nicht navigiert.
 */
export const Filled: Story = {
  render: () => (
    <Frame sub="6 Kandidaten">
      <BusinessPartnerPicker
        label="Lieferant"
        value={null}
        onChange={() => {}}
        partners={SECHS}
      />
    </Frame>
  ),
};

/**
 * Der Rundlauf, und der eigentliche Nachweis dieser Aufgabe: gesucht wird über
 * **vier** Felder. Probieren Sie „Muster" (Name), „MUSTERIMMO" (Kurzname),
 * „70123" (Kontonummer) und „DE0000" (USt-IdNr.) — alle vier finden.
 *
 * „Musterstadt" findet **nichts**: der Ort steht in der Zeile und wird nicht
 * gematcht. Er unterscheidet zwei Treffer, aber niemand tippt einen Ort, um
 * einen Lieferanten zu finden.
 *
 * Das Feld unten zeigt, was `onSearch` meldet — auch beim **Leeren**. Das war
 * das Loch in 0084: der Rückruf blieb beim Leeren stumm, und es entstand ein
 * Zustand, in dem `value` gesetzt und das Feld leer war.
 */
export const Roundtrip: Story = {
  render: function Rundlauf() {
    const [value, setValue] = useState<string | null>(null);
    const [query, setQuery] = useState<string[]>([]);
    return (
      <Frame sub="Name · Kurzname · Kontonummer · USt-IdNr.">
        <BusinessPartnerPicker
          label="Lieferant"
          value={value}
          onChange={setValue}
          partners={SECHS}
          onSearch={(q) => setQuery((alt) => [...alt.slice(-4), q === "" ? "(leer)" : q])}
        />
        <div style={{ marginTop: 16, display: "grid", gap: 4 }}>
          <div className="v2muted">
            Gewählt: <code>{value ?? "null"}</code>
          </div>
          <div className="v2muted">
            onSearch: <code>{query.join(" › ") || "—"}</code>
          </div>
        </div>
      </Frame>
    );
  },
};

/**
 * Mit `allowDiverse` steht „Ohne konkreten Lieferanten" als **erste** Option.
 * Sie ist kein leerer Wert und kein Abbruch, sondern eine Wahl mit einem Wort:
 * es gibt Belege, die keinem Stammsatz zugeordnet werden **sollen**.
 *
 * Der Zähler unten hält die beiden auseinander — `null` heißt „noch nichts
 * gewählt", `__diverse` heißt „bewusst keiner".
 */
export const Diverse: Story = {
  render: function Pool() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Frame sub="der Diverse-Pool als gültige Wahl">
        <BusinessPartnerPicker
          label="Lieferant"
          value={value}
          onChange={setValue}
          partners={SECHS}
          allowDiverse
        />
        <div className="v2muted" style={{ marginTop: 16 }}>
          {value === null
            ? "noch nichts gewählt (null)"
            : value === DIVERSE
              ? "bewusst kein konkreter Lieferant (__diverse)"
              : `gewählt: ${value}`}
        </div>
      </Frame>
    );
  },
};

/**
 * Die vier Zustände. Der wichtigste ist der Unterschied zwischen den beiden
 * Leerfällen: „kein Treffer" ist ein Problem mit der Suche, „gar keine
 * Partner" ein Befund über den Bestand — und die Rolle muss beides
 * auseinanderhalten können.
 */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 20, maxWidth: 520 }}>
      <Frame sub="lädt">
        <BusinessPartnerPicker label="Lieferant" value={null} onChange={() => {}} partners={SECHS} loading />
      </Frame>
      <Frame sub="Fehler — der Satz steht am Feld">
        <BusinessPartnerPicker
          label="Lieferant"
          value={null}
          onChange={() => {}}
          partners={[]}
          error="Die Suche ist fehlgeschlagen. Bitte noch einmal versuchen."
        />
      </Frame>
      <Frame sub="gar keine Partner — ein Befund über den Bestand">
        <BusinessPartnerPicker label="Lieferant" value={null} onChange={() => {}} partners={[]} />
      </Frame>
      <Frame sub="gesperrt">
        <BusinessPartnerPicker label="Lieferant" value="p-1" onChange={() => {}} partners={SECHS} disabled />
      </Frame>
    </div>
  ),
};

/**
 * Im Einsatz an dem Ort, an dem `CreditorCombobox` heute steht: im Ask-Dialog
 * eines `ActionButton` (0121). Der Knopf bleibt gesperrt, solange nichts
 * gewählt ist — `valid` entscheidet das, nicht der Dialog.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ maxWidth: 520 }}>
      <ActionButton<string | null>
        variant="primary"
        ask={{
          title: "Lieferant des Einzelsachverhalts",
          confirmLabel: "Lieferant setzen",
          initial: null,
          valid: (v) => v !== null,
          render: ({ value, set }) => (
            <BusinessPartnerPicker
              label="Lieferant"
              value={value}
              onChange={set}
              partners={SECHS}
              allowDiverse
            />
          ),
        }}
        action={async () => {}}
      >
        Lieferant zuordnen
      </ActionButton>
    </div>
  ),
};
