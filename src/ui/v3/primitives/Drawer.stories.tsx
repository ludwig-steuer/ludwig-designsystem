import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { Amount } from "./Amount";
import { Button } from "./Button";
import { AmountCell } from "./Cells";
import { Drawer, DrawerFooter, type DrawerSize } from "./Drawer";
import { Field, Textarea } from "./Form";
import { FieldList } from "./FieldList";
import { HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof Drawer> = { title: "v3/Primitives/Dialog/Drawer", component: Drawer };
export default meta;
type Story = StoryObj<typeof Drawer>;

/**
 * Der Rundlauf: der Knopf öffnet, Kreuz, `Escape` und ein Klick aufs Scrim
 * melden alle dasselbe `onClose`. Beim Schließen gleitet der Drawer hinaus —
 * der Knoten bleibt dafür 300 ms stehen. Der Fokus steht danach wieder auf
 * dem Knopf, der ihn geöffnet hat.
 */
export const Open: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Kontenblatt ansehen
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="6815 Bürobedarf"
          meta="Saldo 4.208,55 € · 01/2026 bis 09/2026"
        >
          <p>
            Drei Wege hinaus: das Kreuz oben rechts, die Taste Escape, ein Klick auf die
            abgedunkelte Fläche links. Alle drei melden dasselbe.
          </p>
          <FieldList
            tone="bare"
            rows={[
              ["Kontenrahmen", "SKR04"],
              ["Art", "Aufwandskonto"],
              ["Buchungen im Zeitraum", "31"],
            ]}
          />
        </Drawer>
      </>
    );
  },
};

/**
 * Drei Stufen, keine vierte: `sm` für eine Fakten-Liste, `md` für ein Detail,
 * `lg` für eine breite Tabelle. Wer eine weitere Breite braucht, meldet einen
 * Befund und bekommt eine Stufe.
 */
export const Sizes: Story = {
  render: function Render() {
    const [size, setSize] = useState<DrawerSize | null>(null);
    const text: Record<DrawerSize, string> = {
      sm: "Fakten-Liste: Label und Wert, mehr steht hier nie.",
      md: "Detail: Text, Felder, eine kurze Tabelle — der Normalfall.",
      lg: "Breite Inhalte: Kontenblatt, Belegvorschau, viele Spalten.",
    };
    return (
      <>
        <div style={{ display: "flex", gap: 8 }}>
          {(["sm", "md", "lg"] as DrawerSize[]).map((s) => (
            <Button key={s} variant="secondary" size="sm" onClick={() => setSize(s)}>
              {s}
            </Button>
          ))}
        </div>
        <Drawer
          open={size !== null}
          onClose={() => setSize(null)}
          title={`Breite ${size ?? "md"}`}
          size={size ?? "md"}
        >
          {text[size ?? "md"]}
        </Drawer>
      </>
    );
  },
};

/**
 * Mit `footer` steht die Aktionsleiste unten und scrollt nicht mit. Daneben
 * derselbe Drawer ohne sie: keine leere Leiste, kein Streifen.
 */
export const WithFooter: Story = {
  render: function Render() {
    const [open, setOpen] = useState<"mit" | "ohne" | null>(null);
    return (
      <>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" onClick={() => setOpen("mit")}>
            Mit Leiste
          </Button>
          <Button variant="secondary" onClick={() => setOpen("ohne")}>
            Ohne Leiste
          </Button>
        </div>
        <Drawer
          open={open !== null}
          onClose={() => setOpen(null)}
          title={open === "ohne" ? "Nur Ansehen" : "Beleg zuordnen"}
          meta={open === "ohne" ? "Kein Weg heraus außer Schließen" : "Zwei Wege heraus"}
          footer={
            open === "mit" ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setOpen(null)}>
                  Abbrechen
                </Button>
                <Button variant="primary" size="sm" onClick={() => setOpen(null)}>
                  Zuordnen
                </Button>
              </>
            ) : undefined
          }
        >
          {open === "ohne"
            ? "Ohne Aktionen bleibt die Fußzone weg — sie klappt bei leerem Inhalt zusammen."
            : "Die Aktionen stehen unten und bleiben stehen, während der Inhalt scrollt."}
        </Drawer>
      </>
    );
  },
};

/**
 * Der Editor-Fall: Die Aktionsleiste braucht denselben Formularzustand wie
 * der Inhalt. Statt ihn nach oben zu reichen, wirft der Body seinen Knopf
 * über `DrawerFooter` in dieselbe Leiste.
 */
export const FooterFromBody: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Notiz erfassen
        </Button>
        <Drawer open={open} onClose={() => setOpen(false)} title="Notiz zum Beleg">
          <NoteForm onDone={() => setOpen(false)} />
        </Drawer>
      </>
    );
  },
};

function NoteForm({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  return (
    <>
      <Field label="Notiz" hint="Steht später im Protokoll des Belegs." htmlFor="note">
        <Textarea
          id="note"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Was ist an diesem Beleg zu beachten?"
        />
      </Field>
      <DrawerFooter>
        <Button variant="secondary" size="sm" onClick={onDone}>
          Abbrechen
        </Button>
        <Button variant="primary" size="sm" disabled={text.trim().length === 0} onClick={onDone}>
          Speichern
        </Button>
      </DrawerFooter>
    </>
  );
}

/** Vierzig Zeilen: der Inhalt scrollt, Kopf und Fuß stehen. */
export const LongContent: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Langen Inhalt öffnen
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Protokoll des Durchgangs"
          meta="40 Einträge"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Schließen
            </Button>
          }
        >
          {Array.from({ length: 40 }, (_, i) => (
            <div key={i}>
              Eintrag {i + 1} — der Agent hat eine Zeile geprüft und das Ergebnis vermerkt.
            </div>
          ))}
        </Drawer>
      </>
    );
  },
};

const LEDGER = [
  { date: "03.02.2026", doc: "ER-2026-0142", partner: "Bürobedarf GmbH", amount: 148.75 },
  { date: "17.03.2026", doc: "ER-2026-0311", partner: "Papier Nord KG", amount: 92.4 },
  { date: "02.05.2026", doc: "ER-2026-0587", partner: "Bürobedarf GmbH", amount: 233.1 },
  { date: "28.06.2026", doc: "ER-2026-0774", partner: "Toner Direkt", amount: 61.9 },
  { date: "14.08.2026", doc: "ER-2026-0902", partner: "Bürobedarf GmbH", amount: 187.55 },
];

/**
 * Im Einsatz: das Kontenblatt hinter dem Icon von `AccountField` (0013).
 * Breite `lg`, weil eine Tabelle mit vier Spalten in `md` zusammenläuft; der
 * Saldo steht als `meta` im Kopf, nicht als erste Zeile im Inhalt. Der Titel
 * setzt die Nummer in die Ziffernschrift — damit ist er kein String mehr und
 * `ariaLabel` trägt die Ansage.
 */
export const InUse: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button variant="secondary" onClick={() => setOpen(true)}>
          Kontenblatt 6815
        </Button>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          size="lg"
          // Not a string, so `ariaLabel` carries the name for screen readers.
          title={
            <>
              <span className="lw-numeric">6815</span> Bürobedarf
            </>
          }
          ariaLabel="Kontenblatt 6815 Bürobedarf"
          meta={
            <>
              Saldo <Amount value={723.7} currency="EUR" size="sm" /> · 5 Buchungen · 01/2026 bis 09/2026
            </>
          }
          footer={
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
              Schließen
            </Button>
          }
        >
          <Table cols="110px 150px 1fr 120px">
            <HeadRow>
              <div>Datum</div>
              <div>Beleg</div>
              <div>Gegenpartei</div>
              <div className="v2num">Betrag</div>
            </HeadRow>
            {LEDGER.map((b) => (
              <Row key={b.doc}>
                <div>{b.date}</div>
                <div>{b.doc}</div>
                <div>{b.partner}</div>
                <AmountCell value={b.amount} />
              </Row>
            ))}
          </Table>
        </Drawer>
      </>
    );
  },
};
