import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../primitives/Button";
import { DetailPane, MasterDetail } from "./MasterDetail";
import { TodoListe, naechsterOffener, type TodoGroup } from "./TodoListe";

const meta: Meta<typeof TodoListe> = { title: "v3/Patterns/TodoListe", component: TodoListe };
export default meta;
type Story = StoryObj<typeof TodoListe>;

const GRUPPEN: TodoGroup[] = [
  {
    label: "Fragen an die Kanzlei",
    items: [
      { id: "a", state: "open", title: "2026-0008 · Miete Musterstraße weicht ab", sub: "1.800,00 € statt üblich 1.700,00 €" },
      { id: "b", state: "question", title: "2026-0014 · Beleg zur Kreditkarte fehlt", sub: "64,90 € · seit 6 Tagen offen" },
      { id: "c", state: "done", title: "2026-0011 · Skonto-Abzug bestätigt", sub: "am 27.08. beantwortet" },
    ],
  },
  {
    label: "Overrides des Agenten",
    items: [
      { id: "d", state: "warning", title: "S07 · Kontenzuordnung überschrieben", sub: "6815 statt 6820" },
      { id: "e", state: "edited", title: "S12 · Steuerschlüssel korrigiert", sub: "BU 9 statt BU 8" },
      { id: "f", state: "returned", title: "S03 · Beleg an den Agenten zurück", sub: "am 28.08. zurückgegeben" },
    ],
  },
];

/**
 * Das Grundmuster jedes Prüfschritts: Zustands-Icon, Titel, Nebenzeile.
 * `J`/`K` gehen durch die Liste, `Enter` öffnet — probieren Sie es aus.
 */
export const Gefuellt: Story = {
  render: function Render() {
    const [sel, setSel] = useState<string | null>("a");
    const alle = GRUPPEN.flatMap((g) => g.items);
    const aktiv = alle.find((i) => i.id === sel);
    return (
      <MasterDetail
        list={<TodoListe groups={GRUPPEN} selectedId={sel} onSelect={setSel} />}
        detail={
          <DetailPane title={aktiv?.title} sub={aktiv?.sub}>
            <Button
              variant="primary"
              size="sm"
              hotkey="A"
              onClick={() => setSel(naechsterOffener(alle, sel))}
            >
              Erledigt
            </Button>
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 0 }}>
              Nach der Aktion springt die Auswahl auf den nächsten offenen Punkt.
            </p>
          </DetailPane>
        }
      />
    );
  },
};

/** Nichts mehr offen — der Leerzustand sagt, was geprüft wurde. */
export const AllesErledigt: Story = {
  render: () => (
    <TodoListe
      groups={GRUPPEN.map((g) => ({ ...g, items: g.items.map((i) => ({ ...i, state: "done" as const })) }))}
      selectedId={null}
      onSelect={() => {}}
    />
  ),
};

/** Leer: keine Punkte, und der Text nennt den Grund. */
export const Leer: Story = {
  render: () => (
    <TodoListe
      groups={[]}
      selectedId={null}
      onSelect={() => {}}
      emptyText="Keine offenen Fragen — der Agent ist ohne Rückfrage durchgekommen."
    />
  ),
};

/** Leer nach Filter: die ungefilterte Menge steht dabei. */
export const LeerNachFilter: Story = {
  render: () => (
    <TodoListe
      groups={[]}
      selectedId={null}
      onSelect={() => {}}
      emptyText="Kein offener Punkt in dieser Auswahl. Ohne Filter stehen hier 6 Punkte."
    />
  ),
};
