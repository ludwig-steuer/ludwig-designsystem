import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  BarChart3,
  BookOpen,
  FileQuestion,
  Inbox,
  Landmark,
  LayoutDashboard,
  ListTree,
  PackageCheck,
  Receipt,
  Repeat,
} from "lucide-react";
import { AppShell, TopBar } from "./AppShell";
import { NavList, type NavSection } from "./NavList";
import { PageHeader } from "./PageHeader";

const meta: Meta<typeof NavList> = { title: "v3/Primitives/Navigation/NavList", component: NavList };
export default meta;
type Story = StoryObj<typeof NavList>;

const ico = (I: typeof Inbox) => <I size={18} strokeWidth={1.5} />;

const SECTIONS: NavSection[] = [
  {
    label: "Übersicht",
    items: [{ href: "/clients/musterbau/2026", label: "Übersicht", icon: ico(LayoutDashboard) }],
  },
  {
    label: "Buchung",
    items: [
      { href: "/clients/musterbau/2026/inbox", label: "Posteingang", icon: ico(Inbox), count: 12 },
      { href: "/clients/musterbau/2026/documents", label: "Belege", icon: ico(Receipt) },
      { href: "/clients/musterbau/2026/cases", label: "Sachverhalte", icon: ico(FileQuestion), count: 3, alarm: true },
      { href: "/clients/musterbau/2026/entries", label: "Buchungen", icon: ico(BookOpen) },
      { href: "/clients/musterbau/2026/datev", label: "DATEV-Export", icon: ico(PackageCheck) },
    ],
  },
  {
    label: "Stammdaten",
    items: [
      { href: "/clients/musterbau/2026/accounts", label: "Konten", icon: ico(ListTree) },
      { href: "/clients/musterbau/2026/partners", label: "Geschäftspartner", icon: ico(Landmark) },
      { href: "/clients/musterbau/2026/rules", label: "Wiederkehr-Regeln", icon: ico(Repeat) },
    ],
  },
  {
    label: "Reporting",
    items: [
      { href: "/clients/musterbau/2026/opos", label: "Offene Posten", icon: ico(BarChart3) },
      { href: "/clients/musterbau/2026/statistics", label: "Finanz-Statistik", icon: ico(BarChart3), future: true },
    ],
  },
  {
    label: "Kommunikation",
    items: [
      { href: "/clients/musterbau/2026/clarifications", label: "Klärfälle", icon: ico(FileQuestion), count: 2 },
    ],
  },
];

/**
 * Die Leiste bringt ihre Farbe aus `app-chrome.css` mit — `.app__sidebar` ist
 * dieselbe Fläche wie in der Shell. Ein Hex-Wert in der Story wäre ein zweiter
 * Ton neben dem einen, den es schon gibt.
 */
const Rail = ({ collapsed, children }: { collapsed?: boolean; children: React.ReactNode }) => (
  <div
    className={`app__sidebar${collapsed ? " is-collapsed" : ""}`}
    style={{ width: collapsed ? 64 : 240, minHeight: 520 }}
  >
    {children}
  </div>
);

/** Der aktive Eintrag steht auf einer **Unterseite** — er leuchtet trotzdem,
 *  weil der längste passende Präfix gewinnt. Ein Zähler ruft, einer nicht. */
export const Filled: Story = {
  render: () => (
    <Rail>
      <NavList sections={SECTIONS} activePath="/clients/musterbau/2026/cases/2026-0142" />
    </Rail>
  ),
};

/** Eingeklappt bleibt das Icon; die Beschriftung wandert in den `title`. */
export const Collapsed: Story = {
  render: () => (
    <Rail collapsed>
      <NavList sections={SECTIONS} activePath="/clients/musterbau/2026/inbox" collapsed />
    </Rail>
  ),
};

/** Rand: lange Beschriftung, dreistelliger Zähler, ein Eintrag ohne Icon. */
export const Edges: Story = {
  render: () => (
    <Rail>
      <NavList
        activePath="/x"
        sections={[
          {
            label: "Rand",
            items: [
              { href: "/a", label: "Wiederkehrende Buchungen und Regelwerk", icon: ico(Repeat), count: 128 },
              { href: "/b", label: "Ohne Icon" },
              { href: "/c", label: "Bald verfügbar", icon: ico(BarChart3), future: true },
            ],
          },
        ]}
      />
    </Rail>
  ),
};

/**
 * Im Rahmen — dort gehört sie hin: `AppShell` (0030) gibt die Spalte, die
 * Navigation füllt sie.
 */
export const InShell: Story = {
  render: () => (
    <AppShell
      sidebar={
        <>
          <div className="sb__logo">Ludwig</div>
          <NavList sections={SECTIONS} activePath="/clients/musterbau/2026/cases" />
        </>
      }
      topbar={<TopBar crumb="Musterbau GmbH · 2026 · Sachverhalte" />}
    >
      <PageHeader title="Sachverhalte" description="3 offen, davon einer überfällig." />
    </AppShell>
  ),
};
