import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PeriodJump, periodPage, type PeriodCount } from "./PeriodJump";

const meta: Meta<typeof PeriodJump> = {
  title: "v3/Primitives/Navigation/PeriodJump",
  component: PeriodJump,
};
export default meta;
type Story = StoryObj<typeof PeriodJump>;

// One account over a year, 238 lines — near the p90 of 251 (0085).
const YEAR: PeriodCount[] = [
  { date: "2025-05", count: 21 },
  { date: "2025-06", count: 19 },
  { date: "2025-07", count: 24 },
  { date: "2025-08", count: 16 },
  { date: "2025-09", count: 22 },
  { date: "2025-10", count: 18 },
  { date: "2025-11", count: 23 },
  { date: "2025-12", count: 31 },
  { date: "2026-01", count: 12 },
  { date: "2026-02", count: 19 },
  { date: "2026-03", count: 26 },
  { date: "2026-04", count: 7 },
];

const pageHref = (periods: readonly PeriodCount[]) => (month: string) =>
  `#seite-${periodPage(periods, month, { pageSize: 25, dir: "desc" })}`;

/**
 * Zwölf Monate, neueste zuerst sortiert, 25 Zeilen je Seite. Seite 3 zeigt
 * die Zeilen 51–75: Ende Februar, den Januar und den Anfang Dezember — diese
 * drei Monate sind hervorgehoben. Jede Säule führt auf die Seite, auf der ihr
 * Monat beginnt (`#seite-n` im Link).
 */
export const Filled: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <PeriodJump
        periods={YEAR}
        href={pageHref(YEAR)}
        current={{ from: "2026-02-03", to: "2025-12-19" }}
        unit={["Zahlung", "Zahlungen"]}
        ariaLabel="Kontoauszug: zu einem Monat springen"
      />
    </div>
  ),
};

/**
 * Mit „Springe zu": ein GET-Formular. Die versteckten Felder tragen Filter
 * und Sortierung weiter — hier die Story selbst, damit man nach dem Absenden
 * `ab=<Datum>` in der Adresse sieht. Welche Seite der Tag hat, rechnet die App.
 */
export const WithDateForm: Story = {
  render: () => (
    <div style={{ maxWidth: 1100 }}>
      <PeriodJump
        periods={YEAR}
        href={pageHref(YEAR)}
        current={{ from: "2026-04-30", to: "2026-03-12" }}
        unit={["Zahlung", "Zahlungen"]}
        dateForm={{
          action: "iframe.html",
          name: "ab",
          hidden: { id: "v3-primitives-navigation-periodjump--with-date-form", viewMode: "story" },
        }}
      />
    </div>
  ),
};

const GAPS: PeriodCount[] = [
  { date: "2026-01-01", count: 4 },
  { date: "2026-02-01", count: 1 },
  // March missing: the GROUP BY left it out.
  { date: "2026-04-01", count: 140 },
  { date: "2026-05-01", count: 0 },
  { date: "2026-06-01", count: 9 },
];

const TWO_YEARS: PeriodCount[] = Array.from({ length: 24 }, (_, i) => ({
  date: `${2024 + Math.floor((i + 9) / 12)}-${String(((i + 9) % 12) + 1).padStart(2, "0")}`,
  count: [14, 22, 9, 31, 18, 25, 11, 27, 16, 20, 8, 24][i % 12]!,
}));

/**
 * Ränder: der März fehlt in den Daten und steht trotzdem mit 0 auf der Achse ·
 * der Mai hat 0 Zeilen und ist kein Link · der Februar hat eine Zeile und
 * bleibt sichtbar neben 140 im April. Darunter 24 Monate: jede zweite
 * Beschriftung entfällt, das Jahr bleibt. Ohne Monate rendert die Komponente
 * nichts — die Liste darunter zeigt ihr eigenes Leer.
 */
export const Edge: Story = {
  render: () => (
    <div style={{ maxWidth: 900, display: "grid", gap: "var(--space-6)" }}>
      <PeriodJump periods={GAPS} href={pageHref(GAPS)} unit={["Zahlung", "Zahlungen"]} />
      <PeriodJump periods={TWO_YEARS} href={pageHref(TWO_YEARS)} current={{ from: "2025-03-02", to: "2025-02-11" }} />
      <PeriodJump periods={[]} href={pageHref([])} />
    </div>
  ),
};
