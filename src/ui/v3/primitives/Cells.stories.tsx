import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  DeviationCell,
  AmountCell,
  CountCell,
  DateRangeCell,
  BooleanCell,
  PercentCell,
  IbanCell,
  type CellHint,
  DotStatus,
  ErrorRow,
  MonoCell,
  TableLoading,
  Timestamp,
} from "./Cells";
import { Amount } from "./Amount";
import { Progress } from "./Progress";
import { Time } from "./Time";
import { Card, CardHead, EmptyRow, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof AmountCell> = { title: "v3/Primitives/Tabelle/Zellen", component: AmountCell };
export default meta;
type Story = StoryObj<typeof AmountCell>;

const COLS = "190px 110px 150px 110px 1fr";

function Frame({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <CardHead title="Fehlende Belege" sub={sub} />
      <Table cols={COLS}>
        <HeadRow>
          <span>Gegenpartei</span>
          <span className="v2num">Betrag</span>
          <span>Fortschritt</span>
          <span>Stand</span>
          <span>Zuletzt</span>
        </HeadRow>
        {children}
      </Table>
    </Card>
  );
}

/**
 * Owner-Entscheid F123 §4/4: negative Beträge sind **nicht** automatisch rot.
 * Jede Gutschrift wäre sonst ein Alarm. Der Ton kommt vom Aufrufer, wo die
 * Zahl wirklich etwas meint.
 */
export const Filled: Story = {
  render: () => (
    <Frame sub="3 Zeilen">
      <Row>
        <span className="v2main">Bürobedarf GmbH</span>
        <AmountCell value={64.9} />
        <Progress share={0.72} />
        <DotStatus tone="success" label="Geprüft" />
        <Timestamp iso="2026-08-26T09:40:00Z" prefix="seit" />
      </Row>
      <Row>
        <span className="v2main">Vermieter Musterstraße</span>
        <AmountCell value={-1800} />
        <Progress share={0.2} tone="warning" />
        <DotStatus tone="warning" label="Offen" />
        <Timestamp iso="2026-08-21T14:05:00Z" prefix="seit" />
      </Row>
      <Row>
        <span className="v2main">Saldendifferenz Bank</span>
        <AmountCell value={-12.4} tone="danger" title="Auszug 8 gegen gebuchten Saldo" />
        <Progress share={1} tone="danger" />
        <DotStatus tone="danger" label="Blockiert" />
        <Timestamp iso={null} />
      </Row>
    </Frame>
  ),
};

/** Leer: die Kopfzeilen bleiben stehen, der Text sagt, was geprüft wurde. */
export const Empty: Story = {
  render: () => (
    <Frame>
      <EmptyRow>Keine fehlenden Belege — alle 94 Belege des Zeitraums sind zugeordnet.</EmptyRow>
    </Frame>
  ),
};

/** Leer nach Filter: der Unterschied zu „nichts da" muss lesbar sein. */
export const EmptyAfterFilter: Story = {
  render: () => (
    <Frame sub="gefiltert nach „überfällig“">
      <EmptyRow>
        Kein überfälliger Beleg. Ohne Filter stehen hier 3 Zeilen.
      </EmptyRow>
    </Frame>
  ),
};

/** Lädt: Zeilen in Zeilenhöhe, damit die Tabelle beim Eintreffen nicht springt. */
export const Loading: Story = {
  render: () => (
    <Frame>
      <TableLoading rows={3} cols={5} />
    </Frame>
  ),
};

/** Fehler: das Laden ist gescheitert — das ist etwas anderes als leer. */
export const Error: Story = {
  render: () => (
    <Frame>
      <ErrorRow
        message="Die Belegliste konnte nicht geladen werden."
        action={
          <button type="button" className="v2link">
            Erneut versuchen
          </button>
        }
      />
    </Frame>
  ),
};

/** Die vier Stufen der Abweichungsskala (L7) — Schwellen aus der Domain. */
export const DeviationScale: Story = {
  render: () => (
    <Card>
      <CardHead title="Abweichung gegen den Vormonatsschnitt" />
      <Table cols="1fr 110px">
        <HeadRow>
          <span>Konto</span>
          <span className="v2num">Abweichung</span>
        </HeadRow>
        <Row>
          <span>6815 · Bürobedarf</span>
          <DeviationCell pct={8} tone="neutral" explanation="64,90 gegen Ø 60,00 = +8 % — im Frame." />
        </Row>
        <Row>
          <span>6310 · Miete</span>
          <DeviationCell pct={-31} tone="warning" explanation="1.180 gegen Ø 1.700 = −31 %." />
        </Row>
        <Row>
          <span>6805 · Telefon</span>
          <DeviationCell pct={74} tone="warning-strong" explanation="348 gegen Ø 200 = +74 %." />
        </Row>
        <Row>
          <span>6600 · Werbung</span>
          <DeviationCell pct={420} tone="danger" explanation="2.100 gegen Ø 404 = +420 %." />
        </Row>
        <Row>
          <span>6820 · Porto</span>
          <DeviationCell pct={null} tone="neutral" explanation="Nur ein Vormonat — keine Bewertung." />
        </Row>
      </Table>
    </Card>
  ),
};

/**
 * `null` ist ein Wert, kein Fehler: ein offener Sachverhalt hat noch keine
 * Summe. `AmountCell` und `Timestamp` zeigen dafür denselben Gedankenstrich —
 * sonst schreibt jeder Aufrufer dieselbe Fallunterscheidung, und `0,00 €`
 * fängt an, „noch nicht bekannt" zu bedeuten.
 *
 * Die Null daneben beweist die Abgrenzung: sie ist ein Betrag und wird als
 * einer gezeigt.
 */
export const UnknownValues: Story = {
  render: () => (
    <Frame sub="unbekannt gegen null">
      <Row>
        <span>Musterfirma GmbH</span>
        <AmountCell value={1475.6} />
        <Progress share={1} label="1 / 1" />
        <DotStatus tone="success" label="gebucht" />
        <Timestamp iso="2026-08-26T09:12:00Z" />
      </Row>
      <Row>
        <span>Sachverhalt ohne Summe</span>
        <AmountCell value={null} />
        <Progress share={0} label="0 / 3" />
        <DotStatus tone="warning" label="offen" />
        <Timestamp iso={null} />
      </Row>
      <Row>
        <span>Umbuchung, saldenneutral</span>
        <AmountCell value={0} />
        <Progress share={1} label="1 / 1" />
        <DotStatus tone="success" label="gebucht" />
        <Timestamp iso="2026-08-30T11:00:00Z" />
      </Row>
    </Frame>
  ),
};

/**
 * Schlüssel statt Beträge: Kontonummer, BU-Schlüssel, DATEV-Code. Mono und
 * links — der Unterschied zu `AmountCell`, die rechts steht und proportional
 * setzt. Bisher gab es dafür nur eine CSS-Klasse.
 */
export const Mono: Story = {
  render: () => (
    <Card>
      <Table cols="120px 120px 100px 1fr">
        <HeadRow>
          <span>Sollkonto</span>
          <span>Habenkonto</span>
          <span>BU</span>
          <span>Belegfeld 1</span>
        </HeadRow>
        <Row>
          <span>
            <MonoCell value="6815" />
          </span>
          <span>
            <MonoCell value="70021" />
          </span>
          <span>
            <MonoCell value={9} title="19 % Vorsteuer" />
          </span>
          <span>
            <MonoCell value="RE-4471" />
          </span>
        </Row>
        <Row>
          <span>
            <MonoCell value="1200" />
          </span>
          <span>
            <MonoCell value="70044" />
          </span>
          <span>
            <MonoCell value={null} />
          </span>
          <span>
            <MonoCell value="AZ-2026-08-14" tone="muted" />
          </span>
        </Row>
      </Table>
    </Card>
  ),
};


/* ── 0197: value cells ──────────────────────────────────────────────────── */

const Grid = ({ cols, head, children }: { cols: string; head: React.ReactNode; children: React.ReactNode }) => (
  <div style={{ maxWidth: 820 }}>
    <Card>
      <Table cols={cols}>
        <HeadRow>{head}</HeadRow>
        {children}
      </Table>
    </Card>
  </div>
);

/** Whole numbers: no decimals, right, `null` as a dash; with `unit` the word follows. */
export const Counts: Story = {
  render: () => (
    <Grid
      cols="1fr 140px 160px"
      head={
        <>
          <span>Fall</span>
          <span className="v2num">Anzahl</span>
          <span className="v2num">Mit Einheit</span>
        </>
      }
    >
      {([0, 1, 3400, 1_234_567, null] as const).map((n) => (
        <Row key={String(n)}>
          <span>{n === null ? "unbekannt" : String(n)}</span>
          <CountCell value={n} />
          <CountCell value={n} unit={["Seite", "Seiten"]} />
        </Row>
      ))}
    </Grid>
  ),
};

/** `Timestamp` as day, day and time, month; `DateRangeCell` folded, across the year, open ends. */
export const Dates: Story = {
  render: () => (
    <Grid
      cols="1fr 1fr 1fr 1.4fr"
      head={
        <>
          <span>Tag</span>
          <span>Tag und Uhrzeit</span>
          <span>Monat</span>
          <span>Spanne</span>
        </>
      }
    >
      <Row>
        <Timestamp iso="2026-03-31T09:12:00Z" format="date" />
        <Timestamp iso="2026-03-31T09:12:00Z" />
        <Timestamp iso="2026-03-31T09:12:00Z" format="month" />
        <DateRangeCell from="2026-03-01" to="2026-03-31" />
      </Row>
      <Row>
        <Timestamp iso="2025-12-28T16:40:00Z" format="date" />
        <Timestamp iso="2025-12-28T16:40:00Z" />
        <Timestamp iso="2025-12-28T16:40:00Z" format="month" length="long" />
        <DateRangeCell from="2025-12-28" to="2026-01-04" />
      </Row>
      <Row>
        <Timestamp iso={null} format="date" />
        <Timestamp iso={null} />
        <Timestamp iso={null} format="month" />
        <DateRangeCell from="2026-08-01" to={null} />
      </Row>
      <Row>
        <span />
        <span />
        <span />
        <DateRangeCell from={null} to={null} />
      </Row>
    </Grid>
  ),
};

/** Four currencies on one units edge; `signed`; unknown. */
export const Currencies: Story = {
  render: () => (
    <Grid
      cols="1fr 160px 160px"
      head={
        <>
          <span>Konto</span>
          <span className="v2num">Saldo</span>
          <span className="v2num">Veränderung</span>
        </>
      }
    >
      <Row>
        <span>Geschäftskonto Sparkasse</span>
        <AmountCell value={12480.17} currency="EUR" />
        <AmountCell value={-2609.15} currency="EUR" signed />
      </Row>
      <Row>
        <span>USD-Konto Commerzbank</span>
        <AmountCell value={3250} currency="USD" />
        <AmountCell value={420.5} currency="USD" signed />
      </Row>
      <Row>
        <span>Postfinance CHF</span>
        <AmountCell value={918.4} currency="CHF" />
        <AmountCell value={0} currency="CHF" signed />
      </Row>
      <Row>
        <span>Barclays GBP</span>
        <AmountCell value={1_204_880.02} currency="GBP" />
        <AmountCell value={null} currency="GBP" signed />
      </Row>
    </Grid>
  ),
};

const HINTS: CellHint[] = [
  { level: "error", text: "Endsaldo weicht um 54,00 € vom Anfangssaldo des Folgemonats ab." },
  { level: "warning", text: "Saldensprung: Anfangssaldo passt nicht zum Endsaldo des Vormonats." },
  { level: "info", text: "Kurs vom Vortag, der Tageskurs lag noch nicht vor." },
  { level: "debug", text: "Aus dem MT940-Feld :62F: gelesen." },
];

/**
 * Every step on every value type — the sign carries the colour, the value
 * stays as it is. Last row: the retired `warning-strong` looks like `warning`.
 */
export const Hints: Story = {
  render: () => (
    <Grid
      cols="200px 160px 110px 130px 1fr"
      head={
        <>
          <span>Stufe</span>
          <span className="v2num">Betrag</span>
          <span className="v2num">Anzahl</span>
          <span>Datum</span>
          <span>Spanne</span>
        </>
      }
    >
      {HINTS.map((h) => (
        <Row key={h.level}>
          <span>{h.level}</span>
          <AmountCell value={-1249.9} hint={h} />
          <CountCell value={214} hint={h} />
          <Timestamp iso="2026-08-31" format="date" hint={h} />
          <DateRangeCell from="2026-08-01" to="2026-08-31" hint={h} />
        </Row>
      ))}
      <Row>
        <span>ohne</span>
        <AmountCell value={-1249.9} />
        <CountCell value={214} />
        <Timestamp iso="2026-08-31" format="date" />
        <DateRangeCell from="2026-08-01" to="2026-08-31" />
      </Row>
      <Row>
        <span>tone warning</span>
        <AmountCell value={348} tone="warning" />
        <span />
        <span />
        <span />
      </Row>
      <Row>
        <span>tone warning-strong (Alias)</span>
        <AmountCell value={348} tone="warning-strong" />
        <span />
        <span />
        <span />
      </Row>
    </Grid>
  ),
};

/** The same sign outside a table: a header line with `Amount` and `Time`. */
export const OutsideCells: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--space-6)", alignItems: "baseline", fontSize: 13.5 }}>
      <span>
        Anfangssaldo{" "}
        <Amount
          value={1249.9}
          currency="EUR"
          hint={{ level: "warning", text: "Passt nicht zum Endsaldo des Vorauszugs (1.195,90 €)." }}
        />
      </span>
      <span>
        Letzter Import{" "}
        <Time value="2026-09-02T07:40:00Z" hint={{ level: "info", text: "Der nächste Abruf läuft heute um 18:00." }} />
      </span>
      <span>
        Endsaldo <Amount value={null} currency="EUR" hint={{ level: "debug", text: "Ohne Anfangssaldo nicht berechenbar." }} />
      </span>
    </div>
  ),
};

/**
 * A small month overview as on the account's reporting tab: the sign of
 * „Saldensprung" does not move the units edge of its column; an end balance
 * without an opening balance is a dash.
 */
export const InUse: Story = {
  render: () => {
    const rows = [
      { m: "2026-06-01", n: 38, in_: 14250, out: -12880.4, end: null as number | null },
      { m: "2026-07-01", n: 41, in_: 15010.5, out: -16020.3, end: 8370.1 },
      { m: "2026-08-01", n: 36, in_: 12990, out: -11489.08, end: 9871.02 },
    ];
    return (
      <div style={{ maxWidth: 820 }}>
        <Card>
          <CardHead title="Saldo je Monat" sub="Geschäftskonto Sparkasse · 2026" />
          <Table cols="120px 90px 1fr 1fr 1fr">
            <HeadRow>
              <span>Monat</span>
              <span className="v2num">Umsätze</span>
              <span className="v2num">Zufluss</span>
              <span className="v2num">Abfluss</span>
              <span className="v2num">Endsaldo</span>
            </HeadRow>
            {rows.map((r, i) => (
              <Row key={r.m}>
                <Timestamp iso={r.m} format="month" />
                <CountCell value={r.n} />
                <AmountCell value={r.in_} />
                <AmountCell value={r.out} />
                <AmountCell
                  value={r.end}
                  hint={
                    i === 0
                      ? { level: "debug", text: "Kein Anfangssaldo — der Endsaldo lässt sich nicht rechnen." }
                      : i === 2
                        ? { level: "warning", text: "Saldensprung: Anfangssaldo August 8.316,10 € statt 8.370,10 €." }
                        : undefined
                  }
                />
              </Row>
            ))}
          </Table>
        </Card>
      </div>
    );
  },
};

/* ── 0199: yes/no, percent, IBAN ────────────────────────────────────────── */

/** One column per type: filled, edge case, unknown. */
export const MoreValues: Story = {
  render: () => (
    <Grid
      cols="160px 110px 110px 1fr"
      head={
        <>
          <span>Fall</span>
          <span>Vorsteuerabzug</span>
          <span className="v2num">Steuersatz</span>
          <span>IBAN</span>
        </>
      }
    >
      <Row>
        <span>gefüllt</span>
        <BooleanCell value />
        <PercentCell value={19} />
        <IbanCell value="DE12250500000123456789" />
      </Row>
      <Row>
        <span>Grenzfall</span>
        <BooleanCell value={false} />
        <PercentCell value={7.5} digits={1} hint={{ level: "info", text: "Ermäßigter Satz aus der Belegzeile." }} />
        <IbanCell value="ch93 0076 2011 6238 5295 7" />
      </Row>
      <Row>
        <span>unbekannt</span>
        <BooleanCell value={null} />
        <PercentCell value={null} />
        <IbanCell value={null} />
      </Row>
    </Grid>
  ),
};
