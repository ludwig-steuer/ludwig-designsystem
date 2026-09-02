import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { FilterChips, SearchInput } from "./Nav";

const meta: Meta<typeof FilterChips> = { title: "v3/Primitives/Navigation/FilterChips", component: FilterChips };
export default meta;
type Story = StoryObj<typeof FilterChips>;

const OPTIONEN = [
  { key: "alle", label: "Alle" },
  { key: "offen", label: "Offen" },
  { key: "faellig", label: "Fällig" },
  { key: "erledigt", label: "Erledigt" },
];

/** Chips stehen über der Karte, nie im Kartenkopf (Baukasten §6). */
export const NachDimension: Story = {
  render: function Render() {
    const [active, setActive] = useState("offen");
    return <FilterChips label="Stand" options={OPTIONEN} active={active} onPick={setActive} />;
  },
};

/** Mit Zählern: die Nutzerin sieht vor dem Klick, ob sich der Filter lohnt. */
export const MitZaehlern: Story = {
  render: function Render() {
    const [active, setActive] = useState("alle");
    return (
      <FilterChips
        label="Stand"
        options={[
          { key: "alle", label: "Alle", count: 118 },
          { key: "offen", label: "Offen", count: 12 },
          { key: "faellig", label: "Fällig", count: 4 },
          { key: "erledigt", label: "Erledigt", count: 102 },
        ]}
        active={active}
        onPick={setActive}
      />
    );
  },
};

/** Chips und Suche in einer Zeile — die übliche Toolbar über der Tabelle. */
export const MitSuche: Story = {
  render: function Render() {
    const [active, setActive] = useState("offen");
    const [q, setQ] = useState("");
    return (
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <FilterChips label="Stand" options={OPTIONEN} active={active} onPick={setActive} />
        <SearchInput placeholder="Suche nach Gegenpartei, Betrag …" value={q} onChange={setQ} />
      </div>
    );
  },
};
