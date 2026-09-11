import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KpiGrid, KpiTile } from "../primitives/KpiTile";
import { StatusBadge } from "./StatusBadge";
import { ReconciliationTable, type ReconciliationPair } from "./ReconciliationTable";

const meta: Meta<typeof ReconciliationTable> = {
  title: "v3/Patterns/Prüfen/ReconciliationTable",
  component: ReconciliationTable,
};
export default meta;
type Story = StoryObj<typeof ReconciliationTable>;

/** One side of a pair: document number and date, then the booking and the amount. */
function Side({ doc, date, booking, amount }: { doc: string; date: string; booking: string; amount: string }) {
  return (
    <span style={{ display: "flex", flexDirection: "column" }}>
      <span className="v2main">
        {doc} · {date}
      </span>
      <span className="v2sub">
        {booking} · {amount}
      </span>
    </span>
  );
}

const match = (status: string) => <StatusBadge axis="mirror_match" status={status} info={false} />;

const same = (n: number): ReconciliationPair[] =>
  Array.from({ length: n }, (_, i) => {
    const doc = `RE-${4400 + i}`;
    const side = <Side doc={doc} date="14.08.2026" booking="4930 an 70101" amount={`${(120 + i * 7).toFixed(2).replace(".", ",")} €`} />;
    return { key: `s-${i}`, kind: "same", left: side, right: side, state: match("matched_ludwig") };
  });

/** A batch review, Ludwig's export against DATEV today — the case `StapelVergleich` builds by hand. */
const REVIEW: ReconciliationPair[] = [
  {
    key: "c-1",
    kind: "changed",
    left: <Side doc="RE-4471" date="26.08.2026" booking="6815 an 70101" amount="1.249,90 €" />,
    right: <Side doc="RE-4471" date="26.08.2026" booking="6830 an 70101" amount="1.249,90 €" />,
    state: match("matched_corrected"),
    difference: "Konto 6815 → 6830",
  },
  {
    key: "sp-1",
    kind: "split",
    left: <Side doc="RE-4480" date="27.08.2026" booking="4930 an 70204" amount="908,70 €" />,
    right: (
      <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <Side doc="RE-4480" date="27.08.2026" booking="4930 an 70204" amount="812,50 €" />
        <Side doc="RE-4480" date="27.08.2026" booking="6640 an 70204" amount="96,20 €" />
      </span>
    ),
    state: match("matched_split"),
    difference: "2 Teile, Summe gleich",
  },
  {
    key: "l-1",
    kind: "left_only",
    left: <Side doc="RE-4492" date="29.08.2026" booking="4210 an 70311" amount="1.800,00 €" />,
    right: null,
    state: match("disappeared"),
    difference: "exportiert, im Stapel nicht mehr enthalten",
  },
  {
    key: "r-1",
    kind: "right_only",
    left: null,
    right: <Side doc="KB-0831" date="31.08.2026" booking="6855 an 1200" amount="4,90 €" />,
    state: match("new_unprocessed"),
    difference: "von der Kanzlei gebucht",
  },
  {
    key: "r-2",
    kind: "right_only",
    left: null,
    right: <Side doc="KB-0832" date="31.08.2026" booking="4970 an 1200" amount="12,00 €" />,
    state: match("new_unprocessed"),
    difference: "von der Kanzlei gebucht",
  },
  {
    key: "u-1",
    kind: "unclear",
    left: <Side doc="RE-4495" date="30.08.2026" booking="4240 an 70102" amount="142,00 €" />,
    right: <Side doc="RE-4495" date="02.09.2026" booking="4240 an 70102" amount="142,00 €" />,
    state: match("unclear"),
    difference: "Datum 30.08. → 02.09., zwei Kandidaten",
  },
];

/**
 * Die Stapel-Nachlese: was hat DATEV aus Ludwigs Export gemacht? Die sechs
 * Abweichungen stehen oben, nach Kritikalität — was fehlt, vor dem, was sich
 * unterscheidet. Die 40 übereinstimmenden Paare sind **eine** Zeile mit Zahl,
 * bis jemand sie sehen will.
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <ReconciliationTable
        title="Stapel 08-2026 · Nachlese"
        sub="Ludwig exportiert am 31.08. · DATEV-Stand vom 04.09."
        leftLabel="Ludwig exportiert"
        rightLabel="DATEV heute"
        pairs={[...same(40), ...REVIEW]}
      />
    </div>
  ),
};

/**
 * Alle sechs Arten, aufgeklappt. Die Reihenfolge ist fest: nur links · nur
 * rechts · geändert · aufgeteilt · unklar · übereinstimmend. Fehlt eine
 * Seite, sagt der Satz, in welcher Quelle — kein Strich.
 */
export const Kinds: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <ReconciliationTable
        title="Alle Arten eines Paars"
        leftLabel="Ludwig exportiert"
        rightLabel="DATEV heute"
        pairs={[same(1)[0]!, ...[...REVIEW].reverse().filter((p, i, a) => a.findIndex((q) => q.kind === p.kind) === i)]}
        showSame
      />
    </div>
  ),
};

/** Alles stimmt: der Erfolg mit seiner Zahl, kein leerer Abschnitt. Die Paare bleiben einen Klick entfernt. */
export const AllSame: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <ReconciliationTable
        title="Stapel 07-2026 · Nachlese"
        leftLabel="Ludwig exportiert"
        rightLabel="DATEV heute"
        pairs={same(318)}
      />
    </div>
  ),
};

/**
 * Nur eine Seite: die Bank-Deckung. DATEV-Buchungen auf dem Bankkonto, zu
 * denen keine Kontoauszugszeile gefunden wurde — heute das `DatevCoveragePanel`
 * mit Inline-Stilen. Für die Deckung gibt es keine Achse; der Zustand ist ein
 * Wort des Aufrufers.
 */
export const OneSided: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <ReconciliationTable
        title="DATEV-Deckung · Konto 1200"
        sub="Juli 2026 · 47 von 50 Buchungen mit Kontoauszugszeile"
        leftLabel="DATEV"
        rightLabel="Kontoauszug"
        pairs={[
          ...same(47),
          ...["03.07.", "18.07.", "29.07."].map(
            (d, i): ReconciliationPair => ({
              key: `o-${i}`,
              kind: "left_only",
              left: <Side doc={`KB-07${10 + i}`} date={`${d}2026`} booking="1200 an 8400" amount={`${(240 + i * 55).toFixed(2).replace(".", ",")} €`} />,
              right: null,
              state: <span>ohne Bankbewegung</span>,
            }),
          ),
        ]}
      />
    </div>
  ),
};

/** Auf- und zuklappen, und jede Zeile ist ein Weg ins Detail (`pairHref`). */
export const Interactive: Story = {
  render: () => (
    <div style={{ maxWidth: 1180 }}>
      <ReconciliationTable
        title="Stapel 08-2026 · Nachlese"
        leftLabel="Ludwig exportiert"
        rightLabel="DATEV heute"
        pairs={[...same(12), ...REVIEW.slice(0, 3)]}
        pairHref={(p) => `#paar=${p.key}`}
      />
    </div>
  ),
};

/** Zwei der fünf Zustände: der Kopf steht, der Rumpf lädt — oder er sagt, was schiefging, und bietet den nächsten Versuch. */
export const LoadingAndError: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 24, maxWidth: 1180 }}>
      <ReconciliationTable title="Stapel 08-2026 · Nachlese" leftLabel="Ludwig exportiert" rightLabel="DATEV heute" pairs={[]} loading />
      <ReconciliationTable
        title="Stapel 08-2026 · Nachlese"
        leftLabel="Ludwig exportiert"
        rightLabel="DATEV heute"
        pairs={[]}
        error={{ message: "Der DATEV-Stand konnte nicht geladen werden. Der letzte Abgleich lief vor 2 Stunden." }}
      />
    </div>
  ),
};

/**
 * Der Rand: eine Aufteilung in fünf Teile, ein langer Unterschied und 500
 * übereinstimmende Paare — bei 1024 px scrollt die Tabelle in ihrer Karte,
 * nicht die Seite.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ maxWidth: 1024 }}>
      <ReconciliationTable
        title="Stapel 12-2026 · Nachlese"
        leftLabel="Ludwig exportiert"
        rightLabel="DATEV heute"
        pairs={[
          ...same(500),
          {
            key: "sp-5",
            kind: "split",
            left: <Side doc="SA-2026-12" date="31.12.2026" booking="1360 an 10999" amount="4.812,40 €" />,
            right: (
              <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {["1.200,00", "1.200,00", "1.200,00", "1.200,00", "12,40"].map((a, i) => (
                  <Side key={i} doc="SA-2026-12" date="31.12.2026" booking={`1360 an 1099${i}`} amount={`${a} €`} />
                ))}
              </span>
            ),
            state: match("matched_split"),
            difference:
              "5 Teile, Summe gleich; die Kanzlei hat die Sammelabrechnung des Zahlungsdienstleisters auf fünf Debitoren verteilt",
          },
        ]}
      />
    </div>
  ),
};

/**
 * Im Einsatz: die Nachlese eines Stapels, wie `StapelVergleich` sie heute baut —
 * die Zahlen oben, darunter die Paare. Die Kacheln zählen dieselben Paare, die
 * die Tabelle zeigt.
 */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 1180 }}>
      <KpiGrid columns={5}>
        <KpiTile label="Unverändert übernommen" value="40" sub="von 44 exportierten Buchungen" />
        <KpiTile label="Geändert" value="1" sub="Kanzlei-Korrekturen" />
        <KpiTile label="Aufgeteilt" value="1" sub="1 Ludwig-Buchung → 2 in DATEV" />
        <KpiTile label="Nicht in DATEV" value="1" sub="exportiert, nicht mehr im Stapel" />
        <KpiTile label="Ergänzt / unklar" value="3" sub="Kanzlei-Sätze und Klärungsfälle" />
      </KpiGrid>
      <ReconciliationTable
        title="Stapel 08-2026 · Nachlese"
        sub="Ludwig exportiert am 31.08. · DATEV-Stand vom 04.09."
        leftLabel="Ludwig exportiert"
        rightLabel="DATEV heute"
        pairs={[...same(40), ...REVIEW]}
        pairHref={(p) => `#paar=${p.key}`}
      />
    </div>
  ),
};
