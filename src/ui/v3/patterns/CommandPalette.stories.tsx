import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BookOpen, Building2, FileText, Landmark, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { formatAmount, formatTime } from "../format";
import { AppShell, TopBar } from "../primitives/AppShell";
import { Button } from "../primitives/Button";
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

/** The app's navigation — the same source the groups come from. */
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
      { id: "return", label: "Zurück an Ludwig", hint: "mit Begründung", key: "R" },
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
                { id: "return", label: "Zurück an Ludwig", key: "R", onSelect: () => setLast("Zurück an Ludwig") },
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
                {/* Click instead of focus: the palette returns focus to this field
                    on close — opening on focus would reopen it at once. The key
                    stays visible at the field (V14). */}
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

/** What the fake server knows — two documents share a name, as in real life. */
const CLIENTS = [
  { id: "client-1", label: "Musterbau GmbH", hint: "Mandant 10042 · Wirtschaftsjahr 2026" },
  { id: "client-2", label: "Müller & Söhne Sanitär- und Heizungstechnik KG", hint: "Mandant 10077 · Wirtschaftsjahr 2025/26" },
];
const DOCUMENTS = [
  { id: "doc-4471", label: "Rechnung Musterfirma GmbH", number: "RE-2026-4471", amount: -240.4, date: "2026-08-21" },
  { id: "doc-4502", label: "Rechnung Musterfirma GmbH", number: "RE-2026-4502", amount: -1834.12, date: "2026-09-03" },
  { id: "doc-0917", label: "Kassenbeleg Tankstelle Aral", number: "0917", amount: -86.5, date: "2026-09-12" },
];

/** A stand-in for the server: the app reads the prefixes, not the palette. */
function search(query: string, onPreview: (what: string) => void): CommandGroup[] {
  const [, prefix, rest = ""] = /^(?:([mbj]):)?\s*(.*)$/.exec(query) ?? [];
  const word = rest.toLowerCase();
  const documents: CommandGroup = {
    title: "Belege",
    items: DOCUMENTS.filter((d) => `${d.label} ${d.number}`.toLowerCase().includes(word)).map((d) => ({
      id: d.id,
      label: d.label,
      hint: `${d.number} · ${formatAmount(d.amount, "EUR")} · ${formatTime(d.date, "date")}`,
      href: `#${d.id}`,
      secondary: { label: "Vorschau", onSelect: () => onPreview(`${d.label} (${d.number})`) },
    })),
  };
  const clients: CommandGroup = {
    title: "Mandanten",
    items: CLIENTS.filter((c) => c.label.toLowerCase().includes(word)).map((c) => ({ ...c, href: `#${c.id}` })),
  };
  if (prefix === "b") return [documents];
  if (prefix === "m") return [clients];
  if (prefix === "j") {
    return [
      {
        title: "Wirtschaftsjahr",
        items: ["2026", "2025"].map((y) => ({ id: `year-${y}`, label: `Wirtschaftsjahr ${y}`, href: `#year-${y}` })),
      },
    ];
  }
  return [clients, documents].filter((g) => g.items.length > 0);
}

/**
 * Treffer vom Server (0216): `filter="none"`, die Eingabe hält der Aufrufer.
 * Leer stehen die Präfixe — Enter setzt „m: " ins Feld und die Palette bleibt
 * offen (`keepOpen`). „b: 4471" findet den Beleg über seine Nummer, die nicht
 * im Label steht, und die zwei gleichnamigen Rechnungen sind zwei Einträge.
 * Enter öffnet die Seite, Shift+Enter (oder der Hinweis rechts) die Vorschau,
 * ⌘↵ einen neuen Tab. Das Ergebnis steht unter der Palette.
 */
export const ServerHits: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    const [query, setQuery] = useState("");
    const [hits, setHits] = useState<CommandGroup[]>([]);
    const [loading, setLoading] = useState(false);
    const [last, setLast] = useState<string | null>(null);

    useEffect(() => {
      const onHash = () => setLast(`Seite: ${window.location.hash}`);
      window.addEventListener("hashchange", onHash);
      return () => window.removeEventListener("hashchange", onHash);
    }, []);
    useEffect(() => {
      if (!query.trim()) return;
      setLoading(true);
      const timer = setTimeout(() => {
        setHits(search(query, (what) => setLast(`Vorschau: ${what}`)));
        setLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }, [query]);

    const prefixes: CommandGroup = {
      title: "Suchen in",
      items: [
        { id: "prefix-m", label: "Mandanten", hint: "m: vor dem Namen", key: "m:", keepOpen: true, onSelect: () => setQuery("m: ") },
        { id: "prefix-b", label: "Belegen", hint: "b: vor Nummer oder Aussteller", key: "b:", keepOpen: true, onSelect: () => setQuery("b: ") },
        { id: "prefix-j", label: "Wirtschaftsjahren", hint: "j: vor dem Jahr", key: "j:", keepOpen: true, onSelect: () => setQuery("j: ") },
      ],
    };
    const empty = !query.trim();
    return (
      <div className="v2stack" style={{ maxWidth: 520 }}>
        <Button size="sm" onClick={() => setOpen(true)}>
          Palette öffnen
        </Button>
        <div className="lw-body-sm">{last ?? "Noch nichts geöffnet."}</div>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          filter="none"
          query={query}
          onQueryChange={setQuery}
          loading={!empty && loading}
          groups={empty ? [prefixes] : hits}
          placeholder="Name, Nummer oder m: b: j:"
          emptyText={`Kein Treffer für „${query.trim()}" — kürzer suchen oder ein Präfix wählen.`}
        />
      </div>
    );
  },
};

/**
 * Lädt: die Treffer der vorigen Eingabe bleiben stehen, darunter „Suche läuft
 * …" — kein „Kein Treffer" zugleich, und nichts rückt nach unten.
 */
export const Loading: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        filter="none"
        query="b: Musterfirma"
        onQueryChange={() => {}}
        loading
        groups={search("b: Musterfirma", () => {})}
      />
    );
  },
};

/** Fehler: das Was fett, die Ursache, der nächste Schritt — und der Knopf dazu. */
export const Error: Story = {
  render: function Render() {
    const [open, setOpen] = useState(true);
    return (
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        filter="none"
        query="b: 4471"
        onQueryChange={() => {}}
        groups={[]}
        error={{
          message: "Die Suche ist fehlgeschlagen. Ludwig ist gerade nicht erreichbar. Suchen Sie erneut.",
          retry: <Button size="sm">Erneut suchen</Button>,
        }}
      />
    );
  },
};
