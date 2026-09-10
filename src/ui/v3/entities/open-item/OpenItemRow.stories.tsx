import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { OpenItemAgeGroup, OpenItemRow } from "./OpenItemRow";
import type { OpenItem } from "./open-item";
import { Callout } from "../../primitives/Callout";
import { Card, CardHead, EmptyRow, HeadRow, Table } from "../../primitives/Table";
import { TableLoading } from "../../primitives/Cells";
import { StatusInfoButton } from "../../patterns/StatusInfoButton";
import { TextButton } from "../../primitives/TextButton";

const meta: Meta<typeof OpenItemRow> = {
  title: "v3/Entitäten/Offene Posten/OpenItemRow",
  component: OpenItemRow,
};
export default meta;
type Story = StoryObj<typeof OpenItemRow>;

const AS_OF = "2026-08-31";
// `minmax(0, 1fr)`, nicht `1fr`: sonst rechnen Kopf und Zeile die Spur je für
// sich (gemessen 84 gegen 68 px). Und `minWidth` deckt die festen Spuren
// **plus** neun Lücken à 10 px und zweimal 18 px Polster: 1090 + 90 + 36.
const COLS = "90px 100px 130px 100px 100px minmax(0, 1fr) 120px 190px 130px 130px";
const MIN_WIDTH = 1300;

const ITEM = (over: Partial<OpenItem> = {}): OpenItem => ({
  kind: "creditor",
  personalAccount: "70021",
  externalDocumentNumber: "RE-4471",
  invoiceDate: "2026-07-14",
  dueDate: "2026-08-13",
  grossAmount: 1249.9,
  openAtCutoff: 1249.9,
  amountApprox: false,
  clearedAfterCutoff: false,
  description: "Wartung Klimaanlage 08/2026",
  dunningLevel: null,
  ...over,
});

const ITEMS: OpenItem[] = [
  ITEM(),
  ITEM({
    kind: "debtor",
    personalAccount: "10044",
    externalDocumentNumber: "AR-2026-0338",
    invoiceDate: "2026-06-02",
    dueDate: "2026-07-02",
    grossAmount: 1800,
    openAtCutoff: 1800,
    description: "Beratung Q2 2026",
    dunningLevel: 2,
  }),
  ITEM({
    personalAccount: "70118",
    externalDocumentNumber: "RE-8817",
    invoiceDate: "2026-08-20",
    dueDate: "2026-09-19",
    grossAmount: 2480.55,
    openAtCutoff: 2480.55,
    description: "Sanierung Serverraum, Teilrechnung 2 von 3",
  }),
  ITEM({
    kind: "debtor",
    personalAccount: "10090",
    externalDocumentNumber: "AR-2026-0301",
    invoiceDate: "2026-03-11",
    dueDate: "2026-04-10",
    grossAmount: 640,
    openAtCutoff: 640,
    clearedAfterCutoff: true,
    description: "Schulung Buchhaltung",
  }),
  ITEM({
    personalAccount: "70200",
    externalDocumentNumber: "RE-4400",
    invoiceDate: "2026-05-05",
    dueDate: "2026-06-04",
    grossAmount: 412,
    openAtCutoff: 212,
    amountApprox: true,
    description: "Abschlag Strom 05/2026",
    dunningLevel: 1,
  }),
];

function Frame({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div style={{ maxWidth: 1400 }}>
      <Card>
        <CardHead title="Offene Posten" sub={sub ?? `Stichtag 31.08.2026`} />
        <Table cols={COLS} minWidth={MIN_WIDTH}>
          <HeadRow>
            <span>Art</span>
            <span>Konto</span>
            <span>Belegnummer</span>
            <span>Datum</span>
            <span>Fällig</span>
            <span>Buchungstext</span>
            <span>Mahnstufe</span>
            <span>
              Ausgleich <StatusInfoButton axis="opos_ausgleich" />
            </span>
            <span className="v2num">Brutto</span>
            <span className="v2num">Offen</span>
          </HeadRow>
          {children}
        </Table>
      </Card>
    </div>
  );
}

/** Fünf Posten, Kreditor und Debitor gemischt. */
export const Filled: Story = {
  render: () => (
    <Frame>
      {ITEMS.map((i) => (
        <OpenItemRow key={i.externalDocumentNumber ?? i.personalAccount} item={i} asOf={AS_OF} />
      ))}
    </Frame>
  ),
};

/**
 * Vier Altersklassen mit Anzahl **und** Summe je Gruppe. Gruppiert hat der
 * Aufrufer — die Komponente rechnet die Klasse nicht (Befund L-05).
 */
export const Grouped: Story = {
  render: () => (
    <Frame sub="Stichtag 31.08.2026 · nach Alter">
      <OpenItemAgeGroup group={{ bucket: "notDue", count: 1, sum: 2480.55 }} />
      <OpenItemRow item={ITEMS[2]!} asOf={AS_OF} />
      <OpenItemAgeGroup group={{ bucket: "d1_30", count: 1, sum: 1249.9 }} />
      <OpenItemRow item={ITEMS[0]!} asOf={AS_OF} />
      <OpenItemAgeGroup group={{ bucket: "d31_60", count: 1, sum: 1800 }} />
      <OpenItemRow item={ITEMS[1]!} asOf={AS_OF} />
      <OpenItemAgeGroup group={{ bucket: "d90plus", count: 2, sum: 852 }} />
      <OpenItemRow item={ITEMS[3]!} asOf={AS_OF} />
      <OpenItemRow item={ITEMS[4]!} asOf={AS_OF} />
    </Frame>
  ),
};

/** Leer: der Satz nennt den **Stichtag** — „offen" gilt nie im Allgemeinen. */
export const Empty: Story = {
  render: () => (
    <Frame>
      <EmptyRow>Keine offenen Posten zum 31.08.2026.</EmptyRow>
    </Frame>
  ),
};

/** Lädt: fünf Zeilen in der Form der Tabelle — die Köpfe bleiben stehen. */
export const Loading: Story = {
  render: () => (
    <Frame>
      <TableLoading rows={5} cols={10} />
    </Frame>
  ),
};

/** Fehler: was schiefging, und der Weg zurück daneben. */
export const Error: Story = {
  render: () => (
    <div style={{ maxWidth: 1400 }}>
      <Card>
        <CardHead title="Offene Posten" sub="Stichtag 31.08.2026" />
        <div style={{ padding: "var(--space-5)" }}>
          <Callout tone="danger">
            <strong>Die offenen Posten konnten nicht geladen werden.</strong> Der
            DATEV-Abgleich vom 01.09.2026 ist noch nicht durchgelaufen.{" "}
            <TextButton href="#erneut">Erneut versuchen</TextButton>
          </Callout>
        </div>
      </Card>
    </div>
  ),
};

/**
 * **Der Normalfall: `href`.** Das Ziel ist das Personenkonto, und das ist eine
 * URL — die Zeile bekommt also einen Anker. Damit funktionieren mittlere
 * Maustaste, „in neuem Tab öffnen" und die Statuszeile des Browsers; mit
 * `onOpen` und `router.push` fällt das alles weg. Die Zeile bot bis zum
 * 2026-09-08 nur den Rückruf an, und die App musste sich einen Client-Wrapper
 * bauen (Befund der App-Seite `[year]/opos`).
 *
 * `href` und `onOpen` schließen einander im Typ aus.
 */
export const Linked: Story = {
  render: () => (
    <Frame sub="Stichtag 31.08.2026 · die Zeile führt aufs Personenkonto">
      {ITEMS.slice(0, 3).map((i) => (
        <OpenItemRow
          key={i.externalDocumentNumber ?? i.personalAccount}
          item={i}
          asOf={AS_OF}
          href={(acct) => `#konto-${acct}`}
        />
      ))}
    </Frame>
  ),
};

/**
 * `onOpen` bleibt für den Aufrufer, der wirklich keine URL hat — eine Auswahl
 * im Dialog, die Dublettenprüfung. Ohne beides ist die Zeile nicht klickbar.
 */
export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState<string | null>(null);
    // `minmax(0, 1fr)` statt der Vorgabe: eine Rasterspur ist `auto` und damit
    // mindestens so breit wie ihr Inhalt — die Karte wuchs mit der Tabelle und
    // schob die Seite, statt in sich zu scrollen. Gemessen bei 900 px: 418 px
    // Überlauf (Abnahme 0029, S2). Dieselbe Falle wie im Belegnummern-Register
    // (0014 M1), nur an der Spur statt am Kind.
    return (
      <div
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: "var(--space-4)" }}
      >
        <Frame sub="Stichtag 31.08.2026 · Zeile öffnet den Sachverhalt">
          {ITEMS.slice(0, 3).map((i) => (
            <OpenItemRow
              key={i.externalDocumentNumber ?? i.personalAccount}
              item={i}
              asOf={AS_OF}
              onOpen={(acct) => setOpen(acct)}
            />
          ))}
        </Frame>
        <p className="v2sub" style={{ paddingLeft: "var(--space-4)" }}>
          {open ? `Geöffnet: Personenkonto ${open}` : "Noch nichts geöffnet."}
        </p>
      </div>
    );
  },
};

/**
 * Rand: ohne Belegnummer, ohne Fälligkeit, mit Näherungsbetrag und einem
 * Buchungstext, der die Spalte sprengt. Fehlende Felder zeigen „—", nie 0,00 €.
 */
export const Edges: Story = {
  render: () => (
    <Frame sub="Stichtag 31.08.2026 · Randfälle">
      <OpenItemRow
        item={ITEM({
          externalDocumentNumber: null,
          dueDate: null,
          invoiceDate: null,
          grossAmount: null,
          openAtCutoff: null,
          description: null,
          dunningLevel: 0,
        })}
        asOf={AS_OF}
      />
      <OpenItemRow
        item={ITEM({
          personalAccount: "70311",
          // 36 Zeichen — die Grenze von Belegfeld 1. Ohne sie kürzt in keiner
    // Story eine Belegnummer, und M2 hätte keinen Nachweis (W1).
    externalDocumentNumber: "RE-9002-SAMMEL-2026-03-14-TEIL-002",
          openAtCutoff: 18.4,
          amountApprox: true,
          description:
            "Sammel-OP aus dem Alt-Snapshot vom 14.03.2026: mehrere Teilzahlungen ohne " +
            "Zeilendetail, Restbetrag aus der Klammer geschätzt, Belegfeld 1 mehrfach belegt",
        })}
        asOf={AS_OF}
      />
    </Frame>
  ),
};

/** Im Einsatz: die OPOS-Seite, gruppiert, mit Kopf und Vorratszähler. */
export const InUse: Story = {
  render: () => (
    <Frame sub="Stichtag 31.08.2026 · 5 Posten · 6.782,45 € offen">
      <OpenItemAgeGroup group={{ bucket: "d1_30", count: 1, sum: 1249.9 }} />
      <OpenItemRow item={ITEMS[0]!} asOf={AS_OF} />
      {/* Die fünfte Klasse `d61_90` stand in keiner Story — jetzt steht sie
          hier, damit alle fünf einmal gezeigt sind (Abnahme 0029, M6).

          **Jede Gruppe trägt die Zahlen ihrer Zeile**: RE-4400 ist am
          Stichtag 88 Tage überfällig (also `d61_90`) und steht in Franken,
          AR-2026-0301 mit 143 Tagen in `d90plus`. Die erste Fassung hatte
          beides vertauscht und die Summen aus der Luft gegriffen — die
          Wiederabnahme hat es gefunden (W2). */}
      <OpenItemAgeGroup group={{ bucket: "d61_90", count: 1, sum: 212 }} currency="CHF" />
      {/* Ein Posten in Franken: `currency` lief bis hierhin auf dem Default,
          hatte also keinen Nachweis (M7). */}
      <OpenItemRow item={ITEMS[4]!} asOf={AS_OF} currency="CHF" />
      <OpenItemAgeGroup group={{ bucket: "d90plus", count: 1, sum: 640 }} />
      <OpenItemRow item={ITEMS[3]!} asOf={AS_OF} />
    </Frame>
  ),
};
