import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../primitives/Button";
import { DetailPane, ListPane, MasterDetail, type ListGroup } from "./MasterDetail";

const meta: Meta<typeof MasterDetail> = { title: "v3/Patterns/MasterDetail", component: MasterDetail };
export default meta;
type Story = StoryObj<typeof MasterDetail>;

const GRUPPEN: ListGroup[] = [
  {
    title: "Fragen an die Kanzlei",
    count: 2,
    items: [
      {
        key: "a",
        title: "2026-0008 · Miete Musterstraße weicht ab",
        sub: "1.800,00 € statt üblich 1.700,00 € · wartet auf Antwort",
      },
      { key: "b", title: "2026-0014 · Beleg zur Kreditkarte fehlt", sub: "64,90 € · seit 6 Tagen offen" },
    ],
  },
  {
    title: "Overrides des Agenten",
    count: 1,
    items: [{ key: "c", title: "S07 · Kontenzuordnung überschrieben", sub: "6815 statt 6820" }],
  },
];

const TEXTE: Record<string, { title: string; sub: string; body: string }> = {
  a: {
    title: "2026-0008 · Miete Musterstraße weicht ab",
    sub: "1.800,00 € statt üblich 1.700,00 € · wartet auf Antwort",
    body: "Für August 2026 wurden 1.800,00 € Miete überwiesen, die bisherige Regel geht von 1.700,00 € aus. Bitte bestätigen Sie die neue Miethöhe oder weisen Sie auf einen Fehler hin.",
  },
  b: {
    title: "2026-0014 · Beleg zur Kreditkarte fehlt",
    sub: "64,90 € · seit 6 Tagen offen",
    body: "Zur Kreditkartenbuchung vom 21.08.2026 über 64,90 € liegt noch kein Beleg vor. Bürobedarf GmbH ist als Gegenpartei erkannt.",
  },
  c: {
    title: "S07 · Kontenzuordnung überschrieben",
    sub: "6815 statt 6820 · vom Agenten gesetzt",
    body: "Der Agent hat die Konvention „Porto auf 6820“ für diesen Beleg übergangen, weil die Position „Druckerpatronen“ lautet.",
  },
};

/**
 * Der kanonische Ersatz für das Modal (L2): eine Karte für die Liste,
 * Kopfzeile je Gruppe, aktive Zeile mit Akzentleiste. Detail rechts bleibt
 * beim Scrollen stehen.
 */
export const Gefuellt: Story = {
  render: function Render() {
    const [sel, setSel] = useState<string | undefined>("a");
    const d = sel ? TEXTE[sel] : undefined;
    return (
      <MasterDetail
        list={<ListPane groups={GRUPPEN} activeKey={sel} onPick={setSel} />}
        detail={
          <DetailPane title={d?.title} sub={d?.sub}>
            {d ? (
              <>
                <p style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 16px" }}>{d.body}</p>
                <Button variant="primary" size="sm" hotkey="A">
                  Erledigt
                </Button>
              </>
            ) : null}
          </DetailPane>
        }
      />
    );
  },
};

/** Nichts gewählt — das Detail sagt, was zu tun ist. */
export const NichtsGewaehlt: Story = {
  render: () => (
    <MasterDetail list={<ListPane groups={GRUPPEN} />} detail={<DetailPane />} />
  ),
};

/** Leer: der Text sagt, was geprüft wurde — nicht bloß „keine Einträge". */
export const Leer: Story = {
  render: () => (
    <MasterDetail
      list={
        <ListPane
          groups={[{ title: "Fragen an die Kanzlei", items: [] }]}
          empty="Keine offenen Fragen — alle 118 Sätze sind ohne Rückfrage vorbereitet."
        />
      }
      detail={<DetailPane empty="Nichts zu prüfen." />}
    />
  ),
};

/** Leer nach Filter: die ungefilterte Menge steht dabei. */
export const LeerNachFilter: Story = {
  render: () => (
    <MasterDetail
      list={
        <ListPane
          groups={[{ title: "Fragen an die Kanzlei", items: [] }]}
          empty="Keine überfällige Frage. Ohne Filter stehen hier 3 Einträge."
        />
      }
      detail={<DetailPane empty="Nichts zu prüfen." />}
    />
  ),
};
