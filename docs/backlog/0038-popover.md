# 0038 · Popover-Familie — Popover, Tooltip, HoverCard

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` — Gruppe Dialog, Familie `Popover.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, ein Zusatzfeld über der Fläche ist fachfrei |
| Quelle | `docs/backlog/0034-shadcn-abgleich.md` §B1 (shadcn-Abgleich, Registry-Einträge `tooltip`, `hover-card`, `popover` — dort alle drei auf Radix) |
| Ersetzt | in der App: v1-`Tooltip` und **11 Eigenbauten** (`design-guidelines.md` §11.7 „Optik"); hier: nichts, die Formen fehlen |
| Blockiert | die Form „Vorschau" der Entitäten (HoverCard), erklärte Icon-Knöpfe in Kopfzeilen, „Spalten wählen" im `CardHead` |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Drei Fälle, die heute jede Seite selbst löst: ein Wort, das eine Plakette
erklärt (Tooltip), eine Vorschau, die zeigt, was hinter einem Link steckt,
ohne ihn zu öffnen (HoverCard), und ein kleines Feld mit Einstellungen, das
über der Arbeit aufgeht und sie nicht blockiert (Popover). Die App hat dafür
einen v1-`Tooltip` und elf Eigenbauten mit elf Verzögerungen, elf Optiken und
elf Tastaturwegen — die meisten ohne Fokus-Weg.

## Einordnung

- **Wiederverwenden:** `Dialog` („Confirmation with consequences") blockiert
  und ist für Entscheidungen; `OverflowMenu` („Three or more actions on one
  object") ist der Menü-Fall mit eigener Tastaturführung; `Callout` steht
  **in** der Fläche, nicht darüber. Keiner deckt „ein Feld über der Arbeit,
  das nichts blockiert".
- **Neu, weil:** §3 Regel 3 — kein `@when` passt, kein Fachwort, 11 belegte
  Eigenbauten in der App, und nicht in ~15 Zeilen an der Aufrufstelle zu
  bauen: das Messen der Fensterkante und die Hover-Absicht sind der Teil,
  der Arbeit macht.
- **Zuschnitt:** eine Datei, drei Exporte (§4 Familie): gemeinsames
  Markup-Vokabular (`.v2pop*`), gemeinsamer Platzierungs-Hook, gemeinsame
  Basis. Getrennt wären es drei Kopien desselben Hooks.
- **Setzt auf:** die native **Popover-API** (`popover`-Attribut, Baseline
  2024). Top Layer, Klick außerhalb, Escape und Fokusrückgabe kommen vom
  Browser — kein `z-index`, kein eigener Klick-Listener, kein Radix.
  `"use client"`, weil Hover-Absicht und Messung Zustand tragen.

## Schnittstelle

### `Popover` — auf Klick

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `trigger` | `ReactElement` | ja | Ein Knopf **mit Wort** (T8); bekommt `aria-expanded` und `aria-controls` | `Filled` |
| `children` | `ReactNode` | ja | Der Inhalt des Feldes | `Filled` |
| `align` | `"start" \| "end"` | nein | Kante, an der das Feld hängt (Default `start`) | `Variants` |
| `open` | `boolean` | nein | Gesteuert, wenn eine Handlung im Feld es schließen soll | `Interactive` |
| `onOpenChange` | `(open: boolean) => void` | nein | Gegenstück zu `open`; ohne beides hält die Familie den Zustand selbst | `Interactive` |

### `Tooltip` — auf Hover und Fokus, nur Text

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | Nur Text — erklärt, ersetzt kein Label (T8) | `TooltipFilled` |
| `children` | `ReactElement` | ja | Das erklärte Element; bekommt `aria-describedby` | `TooltipFilled` |

### `HoverCard` — auf Hover und Fokus, mit Inhalt

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `children` | `ReactElement` | ja | Der Anker: ein Link oder Text mit Ziel | `HoverCardFilled` |
| `content` | `ReactNode` | ja | Die Karte — die Form „Vorschau" der Entität, vom Aufrufer komponiert | `HoverCardFilled` |

Keine Typen aus `src/ludwig/`: die Familie trägt Darstellung, der Inhalt kommt
vom Aufrufer.

**Kann bewusst nicht:**

- **Auf Touch** (HoverCard, Tooltip) — der Anker führt deshalb immer selbst
  ans Ziel (I11), die Karte ist Zusatzweg.
- **Ein Menü sein** — dafür `OverflowMenu` mit seiner Tastaturführung.
- **Eine Entscheidung erzwingen** — dafür `Dialog`, der blockiert.
- **Compound-API** (`<PopoverTrigger/>` wie shadcn) — ein Stil je Set
  (0034, Offene Frage 3): Props-API wie `Dialog` und der Rest.

## Verhalten

`"use client"`. Das Feld ist ein `<div popover>`; der Browser hält es im Top
Layer, deshalb steht in `v3.css` **kein `z-index`** für die Familie.

- **Popover:** `popover="auto"` — Klick außerhalb und Escape schließen ohne
  eigenen Listener, der Fokus kehrt zum Trigger zurück. Klick auf den Trigger
  schaltet um.
- **Tooltip:** erscheint nach ~300 ms Hover und **sofort bei Tastaturfokus**
  (V11); verschwindet beim Verlassen und bei Escape; `role="tooltip"`,
  `aria-describedby` am erklärten Element. `popover="manual"`, weil ein
  Tooltip nicht das gerade offene Feld schließen darf.
- **HoverCard:** öffnet nach ~500 ms Hover oder bei Fokus, schließt ~200 ms
  nach Verlassen; Hover auf der Karte hält sie offen; Escape schließt.
- **Platzierung:** einmal messen beim Öffnen, wie in `OverflowMenu` —
  `position: fixed`, an der Fensterkante nach oben umgeklappt und seitlich
  eingerückt, nie über den Rand hinaus. Kein Scroll-Listener (dieselbe
  bewusste Grenze wie 0008).
- **Zustände:** kein Lade- und kein Fehlerzustand; der Inhalt bringt seinen
  eigenen mit. Leer wird nicht gerendert.

## Stories

Titel `v3/Primitives/Dialog/Popover`. Abgeleitet nach §6 je Export: Popover
1 Zustand + 1 Enum (`align`) + 1 Callback + 1 „im Einsatz" · Tooltip 1 + 1 Rand
· HoverCard 1 + 1 „im Einsatz" + 1 Rand = **9**, unter der Obergrenze von 10.

| Story | Beweist |
|---|---|
| `Filled` | Feld auf Klick, Trigger mit Wort |
| `Variants` | `align` `start` und `end`; unten am Fenster klappt es nach oben |
| `Interactive` | gesteuert: „Übernehmen" schließt das Feld, das Ergebnis steht darunter |
| `InUse` | „Spalten wählen" im `CardHead` einer Tabelle |
| `TooltipFilled` | an einem `IconButton`; erscheint bei Tab-Fokus |
| `TooltipEdge` | langer Text bricht in maximaler Breite, an der Kante geklappt |
| `HoverCardFilled` | Kontonummer → Kontokarte mit Daten aus `src/ludwig/` |
| `HoverCardInUse` | in einer `Row` der Buchungstabelle |
| `HoverCardEdge` | unterste Zeile — die Karte klappt nach oben |

Nicht anwendbar: `Empty`, `EmptyAfterFilter`, `Loading`, `Error` — die Familie
zeigt keinen eigenen Datenbestand; ein ladender Inhalt bringt seinen Zustand
selbst mit.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Escape schließt, der Fokus kehrt zum Trigger zurück (Story `Interactive`)
- [ ] Klick außerhalb schließt, ohne eigenen Listener (`popover="auto"`,
      Story `Filled`)
- [ ] Tooltip erscheint bei Tab-Fokus; der `IconButton` behält sein
      `aria-label` (Story `TooltipFilled`)
- [ ] Kein Feld verlässt das Fenster (Stories `Variants`, `TooltipEdge`,
      `HoverCardEdge`, gemessen an `getBoundingClientRect`)
- [ ] `package.json` unverändert (`git diff --stat package.json` leer)
- [ ] Kein `z-index` in `v3.css` für die Familie
      (`grep -A20 "v2pop" src/styles/v3.css | grep z-index` leer)
- [ ] Der Trigger trägt `aria-expanded` und `aria-controls`, der erklärte
      Anker `aria-describedby` (DOM-Probe)

## Befund beim Bauen (2026-09-03)

**Der erste Klick nach einem Seitenwechsel öffnet nichts** — das ist die
Automatisierung, nicht die Komponente: im ferngesteuerten Fenster fokussiert
der erste Klick nach `navigate` nur das Fenster. Jeder weitere Klick schaltet
korrekt um; im Ereignis-Log stehen `pointerdown → click → beforetoggle
closed→open` in derselben Millisekunde.

## Offene Fragen

1. Trägt das Feld ein Zeiger-Dreieck zum Anker? *Ohne Antwort: nein — ein
   Dreieck über zwei Kanten mit Rand und Schatten ist Aufwand ohne Nutzen;
   Nähe und Kante zeigen den Bezug (§2, L2).*
2. Bekommt der Tooltip eine maximale Breite? *Ohne Antwort: ja, ~32 ch — was
   länger ist, ist kein Tooltip, sondern ein `HoverCard`.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
