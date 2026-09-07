import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Button } from "../primitives/Button";
import { DetailPane, ListPane, MasterDetail, type ListGroup } from "./MasterDetail";

const meta: Meta<typeof MasterDetail> = { title: "v3/Patterns/Arbeitsfläche/MasterDetail", component: MasterDetail };
export default meta;
type Story = StoryObj<typeof MasterDetail>;

const GROUPS: ListGroup[] = [
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

const TEXTS: Record<string, { title: string; sub: string; body: string }> = {
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
export const Filled: Story = {
  render: function Render() {
    const [sel, setSel] = useState<string | undefined>("a");
    const d = sel ? TEXTS[sel] : undefined;
    return (
      <MasterDetail
        list={<ListPane groups={GROUPS} activeKey={sel} onPick={setSel} />}
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
export const NothingSelected: Story = {
  render: () => (
    <MasterDetail list={<ListPane groups={GROUPS} />} detail={<DetailPane />} />
  ),
};

/** Leer: der Text sagt, was geprüft wurde — nicht bloß „keine Einträge". */
export const Empty: Story = {
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
export const EmptyAfterFilter: Story = {
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

/**
 * `detailBreit`: schmale Randspalte links, breite Arbeitsfläche rechts — und
 * die **Untergrenze, ab der die beiden umbrechen**, gehört dem Aufrufer
 * (`minDetail`, Vorgabe 620). Links im Bild die Vorgabe, rechts eine Ansicht,
 * deren Inhalt schon bei 484 px trägt.
 *
 * Zum Prüfen den Rahmen schmaler ziehen: **im Umbruch steht die
 * Arbeitsfläche oben**, die Randspalte darunter. Vorher stand die Randspalte
 * oben, und wer die Bewegungen suchte, scrollte erst an den Fakten vorbei
 * (Abnahme 0063).
 */
export const DetailBreit: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <div style={{ maxWidth: 1100 }}>
        <div className="v2fields__h">Vorgabe (620) — bei 1.100 px nebeneinander</div>
        <MasterDetail
          detailBreit
          list={<DetailPane title="Randspalte">Fakten, Zähler, Zustände.</DetailPane>}
          detail={<DetailPane title="Arbeitsfläche">Die Tabelle, die 620 px braucht.</DetailPane>}
        />
      </div>
      <div style={{ maxWidth: 1000 }}>
        <div className="v2fields__h">Vorgabe (620) — bei 1.000 px umgebrochen</div>
        <MasterDetail
          detailBreit
          list={<DetailPane title="Randspalte">Steht jetzt unten.</DetailPane>}
          detail={<DetailPane title="Arbeitsfläche">Steht oben, wo sie hingehört.</DetailPane>}
        />
      </div>
      <div style={{ maxWidth: 1000 }}>
        <div className="v2fields__h">minDetail 484 — bei 1.000 px nebeneinander</div>
        <MasterDetail
          detailBreit
          minDetail={484}
          list={<DetailPane title="Randspalte">Fakten.</DetailPane>}
          detail={<DetailPane title="Arbeitsfläche">Inhalt, der bei 484 px trägt.</DetailPane>}
        />
      </div>
    </div>
  ),
};
