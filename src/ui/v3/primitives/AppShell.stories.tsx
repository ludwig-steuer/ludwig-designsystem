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
    <div className="sb__logo">
      <span>{collapsed ? "L" : "Ludwig"}</span>
    </div>
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
 * Schmal (0253, L1 seit 2026-11-22): links das Tablet mit 820 px, die Leiste
 * eingeklappt auf 64 px; rechts das Handy mit 390 px, die Leiste als
 * Schublade hinter „Menü". Die Media Query fragt das Fenster, nicht den
 * Container, deshalb laden beide Rahmen die Story in einem eigenen Fenster.
 */
export const Narrow: Story = {
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "start" }}>
      <iframe
        title="AppShell bei 820 px (Tablet)"
        src="/iframe.html?id=v3-primitives-rahmen-appshell--in-use&viewMode=story"
        style={{ width: 820, height: 560, border: "1px solid var(--color-border)" }}
      />
      <iframe
        title="AppShell bei 390 px (Handy)"
        src="/iframe.html?id=v3-primitives-rahmen-appshell--phone&viewMode=story"
        style={{ width: 390, height: 720, border: "1px solid var(--color-border)" }}
      />
    </div>
  ),
};

/**
 * Das Handy (0253): Die Leiste oben zeigt „Menü", den Ort und „Suchen".
 * Darunter steht das Mandantenband in einer Zeile, Name und Jahr, und es
 * scrollt mit der Seite weg. „Menü" öffnet die Seitenleiste als Schublade von
 * links. Sie ist immer ausgeklappt und trägt dazu, was oben keinen Platz hat
 * (`.sb__phone`), hier Rechtsform und DATEV-Nummer. `Esc`, der Schleier und ein
 * Eintrag schließen sie, und der Fokus kehrt auf „Menü" zurück. Ansehen bei
 * 390 px Fensterbreite; darüber ist es die Shell aus `InUse`.
 */
export const Phone: Story = {
  parameters: { layout: "fullscreen" },
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <AppShell
        navOpen={open}
        onNavOpenChange={setOpen}
        sidebar={
          <>
            <div className="sb__logo">
              <span>Ludwig</span>
            </div>
            <div onClick={(e) => (e.target as HTMLElement).closest("a") && setOpen(false)}>
              <NavList sections={SECTIONS} activePath="/c/2026/cases" />
            </div>
            <div className="sb__phone" style={{ padding: "var(--space-3) var(--space-4)" }}>
              <div className="sb__navlabel" style={{ padding: 0 }}>Mandant</div>
              <div style={{ color: "var(--color-text-on-dark)", fontSize: "var(--fs-ui-sm)" }}>
                Musterbau GmbH &amp; Co. KG · DATEV 10234
              </div>
            </div>
          </>
        }
        topbar={
          <TopBar
            crumb="Sachverhalte"
            search={<Input type="search" placeholder="Belege, Mandanten, Konten suchen …" />}
            actions={<IconButton label="Hilfe" href="#" icon={<HelpCircle size={18} strokeWidth={1.5} />} />}
            onOpenNav={() => setOpen(true)}
            navOpen={open}
            onOpenSearch={() => {}}
          />
        }
      >
        <div className="ludwig-client-band">
          <span className="ludwig-client-band__avatar" aria-hidden="true">MB</span>
          <div className="ludwig-client-band__text">
            <div className="ludwig-client-band__line">
              <span className="ludwig-client-band__name" title="Musterbau GmbH">
                Musterbau GmbH
              </span>
              <span className="ludwig-client-band__num">DATEV 10234</span>
            </div>
            <div className="ludwig-client-band__legal">Musterbau GmbH &amp; Co. KG</div>
          </div>
          <a className="ludwig-client-band__tech" href="#technik" aria-label="Technische Ansicht dieses Mandanten">
            <Settings size={15} strokeWidth={1.5} />
          </a>
          <span className="ludwig-client-band__year">
            <Button size="sm" variant="secondary">2026</Button>
          </span>
        </div>
        <PageHeader title="Sachverhalte" description="3 offen, davon einer überfällig." />
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
    );
  },
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
