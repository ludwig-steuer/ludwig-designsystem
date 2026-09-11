import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KpiGrid, KpiTile } from "../primitives/KpiTile";
import { PeriodGrid, type PeriodCell, type PeriodColumn, type PeriodRow } from "./PeriodGrid";

const meta: Meta<typeof PeriodGrid> = {
  title: "v3/Patterns/Prüfen/PeriodGrid",
  component: PeriodGrid,
};
export default meta;
type Story = StoryObj<typeof PeriodGrid>;

const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const MONTH_LONG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

/** January to August 2026, August running — step 1 asks up to today. */
const TO_AUGUST: PeriodColumn[] = MONTHS.slice(0, 8).map((m, i) => ({ key: `2026-${i + 1}`, label: m, current: i === 7 }));

const here = (i: number): PeriodCell => ({ state: "done", title: `Auszug ${MONTH_LONG[i]} liegt vor.` });
const coming = (i: number): PeriodCell => ({ state: "open", title: `Auszug ${MONTH_LONG[i]} kommt nach Monatsende.` });

function statementRow(key: string, label: string, override: Partial<Record<number, PeriodCell | null>>, summary: string): PeriodRow {
  const cells: Partial<Record<string, PeriodCell>> = {};
  for (let i = 0; i < 8; i += 1) {
    const cell = i in override ? override[i] : i === 7 ? coming(i) : here(i);
    if (cell) cells[`2026-${i + 1}`] = cell;
  }
  return { key, label, cells, summary };
}

const STATEMENTS: PeriodRow[] = [
  statementRow("pa-1", "Commerzbank · 1200", {}, "7 von 7"),
  statementRow(
    "pa-2",
    "Qonto · 1210",
    { 4: { state: "error", title: "Auszug Mai fehlt — erwartet bis 05.06.2026." } },
    "6 von 7 · 1 Lücke",
  ),
  statementRow("pa-3", "Kreditkarte …4711 · 1360", {}, "7 von 7"),
  statementRow(
    "pa-4",
    "PayPal · 1220",
    {
      0: null,
      1: null,
      2: null,
      5: { state: "warning", title: "Auszug Juni unvollständig — 28.06. bis 30.06. fehlen." },
    },
    "seit April · 1 unvollständig",
  ),
  // Cash keeps no statements: every month is „not intended", not „missing".
  { key: "pa-5", label: "Kasse · 1000", cells: {}, summary: "keine Auszüge erwartet" },
];

/**
 * Schritt 1 der Abnahme, „Ist alles da?": fünf Zahlungskonten, Januar bis
 * zum laufenden August. Die **Lücke** im Mai ist eine Zelle mit Aussage, nicht
 * eine leere; die Kasse erwartet keine Auszüge — ihre Zeile ist leer und sagt
 * das der Vorlesehilfe.
 */
export const StatementCoverage: Story = {
  render: () => (
    <div style={{ maxWidth: 980 }}>
      <PeriodGrid title="Kontoauszüge 2026" sub="je Zahlungskonto, bis zum laufenden Monat" periods={TO_AUGUST} rows={STATEMENTS} />
    </div>
  ),
};

/**
 * Die Stapel eines Jahres: eine Zeile, je Monat der Stapel mit seiner Nummer.
 * Im Mai fehlt einer — ein Zeitraum ohne Stapel ist eine Lücke. Im Juli hängt
 * ein Nachtrag am Stapel (F200).
 */
export const Batches: Story = {
  render: () => {
    const cells: Partial<Record<string, PeriodCell>> = {};
    TO_AUGUST.forEach((p, i) => {
      const n = String(i + 1).padStart(4, "0");
      cells[p.key] =
        i === 4
          ? { state: "error", title: "Für Mai gibt es keinen Stapel." }
          : i === 6
            ? { state: "done", label: `2026-${n} + Nachtrag`, title: `Stapel 2026-${n} ist in DATEV, dazu ein Nachtrag.`, href: `#stapel=2026-${n}` }
            : i === 7
              ? { state: "open", label: `2026-${n}`, title: `Stapel 2026-${n} — die Kanzlei prüft.`, href: `#stapel=2026-${n}` }
              : { state: "done", label: `2026-${n}`, title: `Stapel 2026-${n} ist in DATEV.`, href: `#stapel=2026-${n}` };
    });
    return (
      <div style={{ maxWidth: 1180 }}>
        <PeriodGrid
          title="Stapel 2026"
          sub="ein Zeitraum, ein Stapel"
          periods={TO_AUGUST}
          rows={[{ key: "b", label: "Musterbau GmbH", cells, summary: "1 Lücke · 1 Nachtrag" }]}
        />
      </div>
    );
  },
};

/**
 * Die Buchungsjahre eines Mandanten — heute die Kartenleiste `CycleTimeline`.
 * 18 Jahre, das laufende markiert, jedes ein Weg auf seine Jahresseite.
 */
export const FiscalYears: Story = {
  render: () => {
    const years = Array.from({ length: 18 }, (_, i) => 2009 + i);
    const periods: PeriodColumn[] = years.map((y) => ({ key: String(y), label: String(y), current: y === 2026 }));
    const cells: Partial<Record<string, PeriodCell>> = {};
    for (const y of years) {
      cells[String(y)] =
        y === 2026
          ? { state: "open", title: "2026 ist offen — es kann gebucht werden.", href: `#jahr=${y}` }
          : { state: "done", title: `${y} ist geschlossen — importierter Bestand.`, href: `#jahr=${y}` };
    }
    return (
      <div style={{ maxWidth: 1180 }}>
        <PeriodGrid title="Buchungsjahre" sub="Musterbau GmbH" periods={periods} rows={[{ key: "c", label: "Musterbau GmbH", cells }]} />
      </div>
    );
  },
};

/** Ohne Zeilen: ein Satz mit Grund. */
export const Empty: Story = {
  render: () => (
    <div style={{ maxWidth: 980 }}>
      <PeriodGrid
        title="Kontoauszüge 2026"
        periods={TO_AUGUST}
        rows={[]}
        empty="Für diesen Mandanten erwartet kein Zahlungskonto Auszüge — Kasse und Verrechnungskonten liefern keine."
      />
    </div>
  ),
};

/** 24 Monate bei 1024 px: das Raster scrollt in seiner Karte, die Gegenstandsspalte bleibt stehen. */
export const Narrow: Story = {
  render: () => {
    const periods: PeriodColumn[] = Array.from({ length: 24 }, (_, i) => {
      const month = (i + 8) % 12;
      const year = 2024 + Math.floor((i + 8) / 12);
      return { key: `${year}-${month + 1}`, label: `${MONTHS[month]} ${String(year).slice(2)}`, current: i === 23 };
    });
    const row = (key: string, label: string, gap?: number): PeriodRow => ({
      key,
      label,
      cells: Object.fromEntries(
        periods.map((p, i) => [
          p.key,
          i === gap
            ? { state: "error", title: `Auszug ${p.label} fehlt.` }
            : i === 23
              ? { state: "open", title: `Auszug ${p.label} kommt nach Monatsende.` }
              : { state: "done", title: `Auszug ${p.label} liegt vor.` },
        ]),
      ) as Partial<Record<string, PeriodCell>>,
      summary: gap === undefined ? "23 von 23" : "22 von 23 · 1 Lücke",
    });
    return (
      <div style={{ maxWidth: 1024 }}>
        <PeriodGrid
          title="Kontoauszüge September 2024 bis August 2026"
          periods={periods}
          rows={[row("n-1", "Commerzbank · 1200"), row("n-2", "Qonto · 1210", 13)]}
        />
      </div>
    );
  },
};

/** Im Einsatz: Schritt 1 der Abnahme — die Zahlen oben, darunter das Raster, das sie belegt. */
export const InUse: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 16, maxWidth: 980 }}>
      <KpiGrid columns={3}>
        <KpiTile label="Auszüge vorhanden" value="27" sub="von 29 bis Juli" />
        <KpiTile label="Fehlen" value="1" sub="Qonto · Mai" />
        <KpiTile label="Unvollständig" value="1" sub="PayPal · Juni" />
      </KpiGrid>
      <PeriodGrid title="Kontoauszüge 2026" sub="je Zahlungskonto, bis zum laufenden Monat" periods={TO_AUGUST} rows={STATEMENTS} />
    </div>
  ),
};
