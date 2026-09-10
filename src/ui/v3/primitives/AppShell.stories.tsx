import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  BookOpen,
  FileQuestion,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  PackageCheck,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { AppShell, TopBar } from "./AppShell";
import { Button } from "./Button";
import { AmountCell } from "./Cells";
import { IconButton } from "./IconButton";
import { Input } from "./Form";
import { NavList, type NavSection } from "./NavList";
import { PageHeader } from "./PageHeader";
import { Card, CardHead, HeadRow, Row, Table } from "./Table";

const meta: Meta<typeof AppShell> = { title: "v3/Primitives/Rahmen/AppShell", component: AppShell };
export default meta;
type Story = StoryObj<typeof AppShell>;

const ico = (I: typeof Inbox) => <I size={18} strokeWidth={1.5} />;

const SECTIONS: NavSection[] = [
  { label: "Übersicht", items: [{ href: "/c/2026", label: "Übersicht", icon: ico(LayoutDashboard) }] },
  {
    label: "Buchung",
    items: [
      { href: "/c/2026/inbox", label: "Posteingang", icon: ico(Inbox), count: 12 },
      { href: "/c/2026/documents", label: "Belege", icon: ico(BookOpen) },
      { href: "/c/2026/cases", label: "Sachverhalte", icon: ico(FileQuestion), count: 3, alarm: true },
      { href: "/c/2026/datev", label: "DATEV-Export", icon: ico(PackageCheck) },
    ],
  },
];

/** The sidebar is a slot: head, navigation and foot come from the caller. */
const Sidebar = ({ collapsed }: { collapsed?: boolean }) => (
  <>
    <div className="sb__logo">{collapsed ? "L" : "Ludwig"}</div>
    <NavList sections={SECTIONS} activePath="/c/2026/cases" collapsed={collapsed} />
  </>
);

const Chrome = () => (
  <TopBar
    crumb="Musterbau GmbH · 2026 · Sachverhalte"
    search={<Input type="search" placeholder="Belege, Mandanten, Konten suchen …" />}
    actions={
      <>
        <IconButton label="Einstellungen" href="#" icon={<Settings size={18} strokeWidth={1.5} />} />
        <IconButton label="Hilfe" href="#" icon={<HelpCircle size={18} strokeWidth={1.5} />} />
      </>
    }
  />
);

/** Das Raster: 240 px Leiste, 56 px Kopf, dazwischen die Arbeitsfläche. */
export const Filled: Story = {
  render: () => (
    <AppShell sidebar={<Sidebar />} topbar={<Chrome />}>
      <PageHeader title="Sachverhalte" description="3 offen, davon einer überfällig." />
    </AppShell>
  ),
};

/** Eingeklappt auf 64 px — der Inhalt wächst, nichts springt. */
export const Collapsed: Story = {
  render: () => (
    <AppShell sidebar={<Sidebar collapsed />} topbar={<Chrome />} collapsed>
      <PageHeader title="Sachverhalte" description="3 offen, davon einer überfällig." />
    </AppShell>
  ),
};

/**
 * Rundlauf: der Aufrufer hält den Zustand — das Merken gehört ihm, nicht dem
 * Set (kein `localStorage` in der Komponente).
 */
export const Interactive: Story = {
  render: function Render() {
    const [collapsed, setCollapsed] = useState(false);
    return (
      <AppShell
        collapsed={collapsed}
        sidebar={
          <>
            <div className="sb__logo">
              {collapsed ? "L" : "Ludwig"}
              <button
                type="button"
                className="sb__toggle"
                aria-label={collapsed ? "Seitenleiste ausklappen" : "Seitenleiste einklappen"}
                onClick={() => setCollapsed((v) => !v)}
              >
                {collapsed ? "›" : "‹"}
              </button>
            </div>
            <NavList sections={SECTIONS} activePath="/c/2026/cases" collapsed={collapsed} />
          </>
        }
        topbar={<Chrome />}
      >
        <PageHeader title="Sachverhalte" description="Klappen Sie die Leiste über das Zeichen ein." />
      </AppShell>
    );
  },
};

/**
 * Die Sperre unter 1280 px (L1). Die Media Query fragt das Fenster, nicht den
 * Container — deshalb lädt diese Story die Shell in einem 900 px breiten
 * Rahmen. Genau das sieht die Sachbearbeiterin auf einem zu schmalen Schirm:
 * keine halbe Arbeitsfläche, sondern ein Satz, der den Grund nennt.
 */
export const Narrow: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <span style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
        900 px breit — darunter liegen Rail, Liste und Detail übereinander.
      </span>
      <iframe
        title="AppShell bei 900 px"
        src="/iframe.html?id=v3-primitives-rahmen-appshell--in-use&viewMode=story"
        style={{ width: 900, height: 420, border: "1px solid var(--color-border)" }}
      />
    </div>
  ),
};

/**
 * Vollständig, wie in der App: Kopf, Karte, Aktionen.
 */
export const InUse: Story = {
  render: () => (
    <AppShell sidebar={<Sidebar />} topbar={<Chrome />}>
      <PageHeader
        overline="Musterbau GmbH · Wirtschaftsjahr 2026"
        title="Sachverhalte"
        description="3 offen, davon einer überfällig."
        actions={
          <Button size="sm" variant="primary">
            Sachverhalt anlegen
          </Button>
        }
      />
      <Card>
        <CardHead title="Offen" sub="3 von 148" />
        <Table cols="140px 1fr 140px">
          <HeadRow>
            <span>Sachverhalt</span>
            <span>Gegenpartei</span>
            <span className="v2num">Betrag</span>
          </HeadRow>
          <Row>
            <span>2026-0142</span>
            <span>Bürobedarf Meier GmbH</span>
            <AmountCell value={1249.9} />
          </Row>
          <Row>
            <span>2026-0148</span>
            <span>Restaurant Adler</span>
            <AmountCell value={128.4} />
          </Row>
        </Table>
      </Card>
    </AppShell>
  ),
};
