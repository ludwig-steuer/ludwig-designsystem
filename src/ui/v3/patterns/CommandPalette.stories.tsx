import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookOpen, Building2, FileText, Landmark, Search } from "lucide-react";
import { useState } from "react";
import { AppShell, TopBar } from "../primitives/AppShell";
import { CommandPalette, type CommandGroup } from "./CommandPalette";
import { Input, InputGroup } from "../primitives/Form";
import { Kbd } from "../primitives/Kbd";
import { NavList, type NavSection } from "../primitives/NavList";
import { PageHeader } from "../primitives/PageHeader";

const meta: Meta<typeof CommandPalette> = {
  title: "v3/Patterns/Frame/CommandPalette",
  component: CommandPalette,
};
export default meta;
type Story = StoryObj<typeof CommandPalette>;

const ICON = { size: 14, strokeWidth: 1.5, "aria-hidden": true } as const;

/** Die Navigation der App — dieselbe Quelle, aus der die Gruppen entstehen. */
const SECTIONS: NavSection[] = [
  {
    label: "Arbeit",
    items: [
      { href: "/cases", label: "Sachverhalte", count: 14 },
      { href: "/documents", label: "Belege" },
      { href: "/banks", label: "Bank", count: 2, alarm: true },
    ],
  },
  {
    label: "Stammdaten",
    items: [
      { href: "/accounts", label: "Konten" },
      { href: "/partners", label: "Geschäftspartner" },
    ],
  },
];

const GROUPS: CommandGroup[] = [
  {
    title: "Seiten",
    items: [
      {
        id: "cases",
        label: "Sachverhalte",
        hint: "14 offen · Musterbau GmbH 2026",
        icon: <FileText {...ICON} />,
        href: "#cases",
      },
      {
        id: "documents",
        label: "Belege",
        hint: "Eingang und Zuordnung",
        icon: <BookOpen {...ICON} />,
        href: "#documents",
      },
      {
        id: "accounts",
        label: "Konten",
        hint: "Kontenplan und Salden",
        icon: <Landmark {...ICON} />,
        href: "#accounts",
      },
      {
        id: "partners",
        label: "Geschäftspartner",
        hint: "Kreditoren und Debitoren",
        icon: <Building2 {...ICON} />,
        href: "#partners",
        keywords: ["Kreditor", "Debitor", "Lieferant"],
      },
    ],
  },
  {
    title: "Handlungen",
    items: [
      { id: "approve", label: "Stapel abnehmen", hint: "142 Sätze, 38 ungeprüft", key: "A" },
      { id: "return", label: "Zurück an den Agenten", hint: "mit Begründung", key: "R" },
      { id: "export", label: "Als CSV laden", hint: "der aktuelle Stapel" },
    ],
  },
];

/**
 * Offen, mit Gruppen: der Sprung trägt seinen Hinweis, die Handlung ihre
 * Taste. „Kreditor" findet „Geschäftspartner" über `keywords`.
 */
export const Filled: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return <CommandPalette open={open} onOpenChange={setOpen} groups={GROUPS} />;
  },
};

/** Kein Treffer: der Text sagt, was hilft — nicht „Nichts gefunden". */
export const NoMatch: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={[
          {
            title: "Seiten",
            items: [{ id: "cases", label: "Sachverhalte", href: "#cases" }],
          },
        ]}
        placeholder="Tippen Sie xyz — dann steht hier der Leertext"
      />
    );
  },
};

/**
 * Der Rundlauf: `⌘K` öffnet — auch aus dem Feld darunter heraus —, Enter
 * wählt, das Ergebnis steht darunter.
 */
export const Interactive: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const [last, setLast] = useState<string | null>(null);
    return (
      <div className="v2stack" style={{ maxWidth: 520 }}>
        <InputGroup
          prefix={<Search {...ICON} />}
          suffix={<Kbd>⌘K</Kbd>}
        >
          <Input placeholder="Hier tippen, dann ⌘K drücken" aria-label="Suche" />
        </InputGroup>
        <div className="lw-body-sm">
          {last === null ? "Noch nichts gewählt — ⌘K öffnet die Palette." : `Gewählt: ${last}`}
        </div>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          groups={[
            {
              title: "Handlungen",
              items: [
                { id: "approve", label: "Stapel abnehmen", key: "A", onSelect: () => setLast("Stapel abnehmen") },
                { id: "return", label: "Zurück an den Agenten", key: "R", onSelect: () => setLast("Zurück an den Agenten") },
                { id: "export", label: "Als CSV laden", onSelect: () => setLast("Als CSV laden") },
              ],
            },
          ]}
        />
      </div>
    );
  },
};

/**
 * Im Einsatz: die Suche der Top-Bar zeigt ihre Taste und öffnet **beim
 * Klick** — nicht beim Fokus, sonst käme man mit der Tastatur nicht mehr an
 * ihr vorbei (Befund beim Bauen). Die Gruppen entstehen aus denselben
 * `NavSection`, die links stehen.
 */
export const InUse: Story = {
  render: function Render() {
    const [open, setOpen] = useState(false);
    const pages: CommandGroup = {
      title: "Seiten",
      items: SECTIONS.flatMap((s) =>
        s.items.map((it) => ({
          id: it.href,
          label: it.label,
          hint: it.count ? `${it.count} offen` : s.label,
          href: it.href,
        })),
      ),
    };
    return (
      <AppShell
        sidebar={
          <>
            <div className="sb__logo">Ludwig</div>
            <NavList sections={SECTIONS} activePath="/cases" />
          </>
        }
        topbar={
          <TopBar
            crumb="Musterbau GmbH · 2026"
            search={
              <InputGroup prefix={<Search {...ICON} />} suffix={<Kbd>⌘K</Kbd>}>
                {/* Klick statt Fokus: die Palette gibt den Fokus beim
                    Schließen an dieses Feld zurück — beim Fokus zu öffnen
                    würde sie damit sofort wieder aufziehen. Sichtbar bleibt
                    der Weg trotzdem, die Taste steht am Feld (V14). */}
                <Input
                  className="v2search"
                  placeholder="Suchen oder Befehl wählen"
                  aria-label="Suche"
                  readOnly
                  onClick={() => setOpen(true)}
                />
              </InputGroup>
            }
          />
        }
      >
        <PageHeader
          overline="Musterbau GmbH · Wirtschaftsjahr 2026"
          title="Sachverhalte"
          description="14 offen. ⌘K öffnet die Palette — auch aus dem Suchfeld heraus."
        />
        <CommandPalette open={open} onOpenChange={setOpen} groups={[pages, GROUPS[1]!]} />
      </AppShell>
    );
  },
};

/** Der Rand: 60 Einträge, lange Labels, Einträge mit und ohne Taste. */
export const Edge: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    const many: CommandGroup = {
      title: "Konten",
      items: Array.from({ length: 60 }, (_, i) => ({
        id: `k${i}`,
        label:
          i === 0
            ? "Bürobedarf, Fachliteratur und sonstiger Betriebsbedarf der Musterbau GmbH"
            : `${6800 + i} · Aufwandskonto ${i + 1}`,
        hint: i % 3 === 0 ? "Sachkonto · SKR-Katalog" : undefined,
        key: i < 3 ? String(i + 1) : undefined,
        href: `#konto-${i}`,
      })),
    };
    return <CommandPalette open={open} onOpenChange={setOpen} groups={[many]} />;
  },
};
