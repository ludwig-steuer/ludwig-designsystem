# 0034 · shadcn-Abgleich — was wir übernehmen, was wir schon haben

| | |
|---|---|
| Status | fertig |
| Stufe | Sammelaufgabe: vier Primitives (`Kbd`, `InputGroup`, Popover-Familie, `BarChart`), ein Pattern (`CommandPalette`), drei Erweiterungen (`Disclosure`, `Markdown`, `StepHeader` auf `PageHeader`), eine Story (Typografie) — jedes Paket bekommt beim Bauen seine eigene Nummer |
| Klassen-Test | je Paket unten; alle fachfrei, „Versicherungs-App" → ja |
| Quelle | Anfrage vom 2026-09-03 („sollten wir was von shadcn übernehmen?") mit zwei Nachschüben (Markdown-Reader, PageHeader) · shadcn-Registry `@shadcn`, 61 `ui`-Einträge, Stand 2026-09-03 · `docs/v3-backlog.md` · Soll-Katalog `design-guidelines.md` §11.7 |
| Ersetzt | in der App: v1-`Tooltip` samt **11 Eigenbauten**, `MonthlyBarChart`; hier: der Tastentext `.v2btn__key`, die Taste in `HotkeyLegend` als nackter `<span>`, das eigene Markup von `StepHeader` (`abn__screenhead*`) |
| Blockiert | Top-Bar-Füllung (Suche mit ⌘K), die Form „Vorschau" der Entitäten (HoverCard), Dashboard (Balken), einheitliche Seitenköpfe in Welle 1 |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Owner fragt, ob wir Bausteine von shadcn/ui übernehmen sollten — Kbd,
HoverCard, Tooltip, Popover, Command, Combobox, Collapsible, Accordion,
Alert Dialog, Input Group, Typography, Menubar, Charts, Marker, weitere
Formular-Elemente — und ob die Primitives gleich im shadcn-Format
(interface-kompatibel, auf derselben Basis) entstehen könnten. Zwei
Nachschübe im selben Gespräch: ein **scrollbarer Markdown-Reader** ist im
Storybook nicht zu finden, und ein **Seitenkopf** mit drei optionalen
Blöcken um die Überschrift (Einordnung, Weg vor und zurück, Leitsatz) soll
alle Seiten gleich aussehen lassen — samt einer Stelle, an der die Knöpfe
rechtsbündig und in fester Ordnung stehen. Diese Datei beantwortet die
Grundfrage, ordnet jedes genannte Element gegen den Bestand ein und
schneidet aus dem, was fehlt, Arbeitspakete mit Schnittstelle, Stories und
Kriterien — so, dass daraus je Paket eine Komponenten-Spec in einem
Durchgang entsteht.

## Die Grundfrage: shadcn als Basis?

**Was shadcn ist.** Kein Paket, sondern kopierter Code: Tailwind-Utilities +
`cva` für die Optik, darunter Radix (bei `combobox` inzwischen Base UI) für das
Verhalten. Die Schnittstelle ist die Compound-API von Radix:
`<Popover><PopoverTrigger/><PopoverContent/></Popover>`. Abhängigkeiten der
angefragten Einträge (Registry, 2026-09-03): `radix-ui` für Tooltip,
HoverCard, Popover, Menubar, Alert Dialog, Marker · `cmdk` für Command ·
`recharts@3.8.0` für Chart · `@base-ui/react` für Combobox · **keine** für
Kbd und Input Group.

**Was wir sind.** `package.json`: clsx, date-fns, decimal.js, lucide-react,
tailwind-merge, zod — keine Headless-Bibliothek. Die Komponenten tragen
`v2*`-Klassen aus `v3.css`; in `src/ui/v3` steht **keine einzige**
Tailwind-Utility (gezählt 2026-09-03), obwohl `index.css` die Direktiven lädt.
Die Schnittstelle ist eine Props-API mit einem Export je Fall (`Dialog open
onClose title`), keine Compound-API. Verhalten holt sich das Set vom Browser,
wo er es hat: `<details>` (Disclosure, OverflowMenu), `<input type="date">`
(DateField), `<input type="search">` (SearchInput). Eine
Positionierungs-Bibliothek wurde in 0008 ausdrücklich abgelehnt
(`OverflowMenu.tsx`: „the fix is a scroll listener, not a positioning
library").

**Antwort: Nein, so haben wir es nicht — und so sollten wir es nicht bauen.**

1. **shadcn als Katalog, nicht als Code.** Seine Liste ist die Prüfliste,
   was ein Set braucht; seine Demos sind die Referenz für Verhalten
   (Tastaturweg, Fokusrückgabe, Hover-Verzögerung). Kopiert wird nichts:
   Tailwind-Utilities und `cva` wären ein zweites Optik-System neben `v3.css`,
   und A5 (kein px, kein Hex) ist in Utility-Klassen nicht prüfbar.
2. **Kein Radix.** Was Radix trägt, hat der Browser inzwischen: die
   Popover-API (Top Layer, Klick-außerhalb, Escape — Baseline 2024) und
   `<details name>` (exklusives Akkordeon — Baseline 2024). Was bleibt —
   Kante erkennen und umklappen, Hover-Absicht — ist ein Hook von ~40 Zeilen,
   den die Popover-Familie einmal bekommt.
3. **Eine neue Abhängigkeit, mit Grund: `cmdk`** für die Befehlspalette.
   shadcns Command *ist* cmdk mit Klassen; Treffer-Sortierung, ARIA und
   Tastaturweg sind ~300 Zeilen, die niemand ein zweites Mal schreiben
   sollte. Sein transitives `@radix-ui/react-dialog` bleibt ungenutzt — die
   Hülle ist unser `Dialog`.
4. **Kein `recharts`.** Belegt sind 4 Dateien / 5 Stellen Balken je Monat;
   das sind 60 Zeilen SVG. Nachrüsten, sobald ein Diagramm Achsen, Legende
   und Tooltip über mehrere Reihen braucht.
5. **Props-API bleibt.** Eine Compound-API nur für die Overlays wäre ein
   zweiter Stil im selben Set (Offene Frage 3).

## Abgleich je Element

| shadcn | Bei uns (Stand 2026-09-03) | Entscheidung | Paket |
|---|---|---|---|
| Kbd | kein `<kbd>`: `Button hotkey` schreibt „· A" (`.v2btn__key`), `HotkeyLegend` einen `<span>` | **neu** — §3 Regel 3: zwei Verwendungen heute, die Optik muss an einer Stelle stehen | A1 |
| Input Group | `SearchInput` ist ein nacktes `<input type="search">`; Einheiten (%, Tage) werden an der Aufrufstelle gebaut; `AmountInput` formatiert „1.800,00 €" in den Text, braucht keinen Zusatz | **neu**, in der Familie `Form.tsx` — Regel 3: Top-Bar-Suche mit ⌘K und Einheitenfelder | A2 |
| Accordion | `Disclosure` (0005) kann bewusst nicht „nur einer offen" | **erweitern** um eine Prop `group` → natives `<details name>` — Regel 2 | A3 |
| Collapsible | `Disclosure` (0005) | vorhanden | — |
| Typography | `tokens.css`: `h1`–`h4`/`.lw-h1`–`.lw-h4`, `.lw-body`, `.lw-body-sm`, `.lw-caption`, `.lw-overline`, `.lw-mono`; dazu `ProseCard`, `Markdown` | vorhanden, aber **ohne Story** — und was keine Story hat, gilt nicht als vorhanden | A4 |
| Scroll Area · „scrollbarer Markdown-Reader" (Nachschub) | `Markdown maxHeight` blendet aus und bietet „Ganz lesen" (0022); scrollen tut nichts; keine Story mit fester Höhe | **erweitern**: `Markdown overflow="scroll"` + Story `Reader` — Regel 2 | A5 |
| — · Seitenkopf mit drei Blöcken (Nachschub) | `PageHeader` (0002) hat genau das: `overline`, `title`, `description`, `meta`, `actions` rechts, `back`. Der Fall aus der Anfrage („Schritt 2 · Rückfragen", Zurück/Weiter, Leitsatz) ist `StepHeader` — der aber **eigenes Markup** rendert (`abn__screenhead*`, anderes `h1`) statt `PageHeader` zu komponieren. Für die feste Knopf-Ordnung gibt es `ActionBar` („exactly one primary path"), das die `PageHeader`-Story nicht benutzt | **erweitern**: `StepHeader` setzt auf `PageHeader`; `actions` ist ein `ActionBar` — Regel 1 (vorhanden) plus §4 (Durchreich-Markup löschen) | A6 |
| Tooltip | fehlt (App: v1 `Tooltip` + 11 Eigenbauten, §11.7 „Optik"); Z3 nutzt `title` ohne JS | **neu**, Familie `Popover.tsx` — Regel 3, 11 Belege | B1 |
| Hover Card | fehlt; `ui-repraesentationen.md` führt die Form „Vorschau" (M) | **neu**, Familie `Popover.tsx` | B1 |
| Popover | fehlt (`OverflowMenu` ist der Menü-Fall, `Dialog` der blockierende) | **neu**, Familie `Popover.tsx` | B1 |
| Command | fehlt; Bausteine da: `useHotkeys`, `HotkeyLegend`, `Dialog`, `TopBar search`-Slot | **neu**, Pattern „Rahmen", mit `cmdk` — §3 Regel 4: eigener Zustand und Tastaturweg, jeder Screen | C1 |
| Chart | fehlt; `MonthlyBarChart` in der App („heben"), Sparkline „prüfen" | **neu** `BarChart`, Inline-SVG, ohne recharts — Regel 3, 4 Dateien | C2 |
| Combobox | `Combobox` (0009, Status Abnahme, fünf offene Punkte: Entprellung, `aria-activedescendant`, Kappung bei 50) | vorhanden; shadcn ist auf Base UI gewechselt — nichts zu übernehmen. Die offenen Punkte aus 0009 sind die Arbeit | 0009 |
| Alert Dialog | `Dialog` + `ActionButton confirm` (`ConfirmSpec`, 0004) — deckt die 28× `window.confirm` (I2) | vorhanden. **Befund:** `Dialog` hat keine Fokusfalle, Tab läuft hinter den Scrim (nur der Erstfokus wird gesetzt) → eigene Aufgabe „Dialog auf natives `<dialog>`", siehe Befunde | — |
| Menubar | fehlt; **0 Belege**; Menüs → `OverflowMenu`, Navigation → `NavList` | **nicht bauen**; bleibt im Soll-Katalog als „prüfen" | — |
| Marker | Registry-Eintrag ohne Beschreibung, ohne Demo, mit Radix-Abhängigkeit — unklar, was es ist | **klären** (Offene Frage 2) | — |
| „Questionaire" | kein shadcn-Element dieses Namens | **klären** (Offene Frage 2); Default: der Wizard (`Assistent`, §11.7 Stufe 2 „heben", 6 Dateien / 11 Stellen) als eigene Spec | — |

**Weitere Formular- und Kleinelemente**, alle geprüft: Field, Label, Input,
Textarea, Select, Native Select, Checkbox, Radio Group → `Form.tsx`, 0017 ·
Switch → 0018 (Bedarf 0, „erst entscheiden") · Calendar → 0024 hat sich für
den nativen Kalender entschieden · Spinner → 0010 `loading` · Progress →
`ProgressBar`/`ProgressCell` · Empty → `EmptyState` · Sonner → `Toast` 0007 ·
Skeleton → 0016 · Button Group → `ActionBar`/`RowActions`/`Segmented` · Toggle
Group → `Segmented`/`FilterChips` · Item → `ListPane`/`Row` · Sidebar →
`AppShell`/`NavList` (0030/0031) · Sheet/Drawer → bleibt Alt-Mechanik (§11.2) ·
Pagination → legacy · Separator, Avatar, Breadcrumb → `v3-backlog.md` „Später"
(6/3/2 Belege), unverändert · Slider, Input OTP, Resizable, Carousel, Aspect
Ratio, Direction, Attachment/Bubble/Message/Message-Scroller (Chat) → kein
Bedarf; der Notizstrang steht in §11.7 als „prüfen".

## Arbeitspakete

Reihenfolge nach Abhängigkeit, gebündelt in drei Wellen mit je einem Commit:
**A** kleine Primitives und Erweiterungen · **B** Popover-Familie · **C**
Befehlspalette und Balken (C1 braucht A1, A2 und die Entscheidung zu `cmdk`).
Jedes Paket bekommt beim „durchführen" seine eigene Spec-Datei (Nummer erst
dann ziehen; heute sind 0032 und 0033 bereits von anderen Sitzungen
vergeben); der Abschnitt hier ist deren Vorgabe. Klassennamen vor dem
Benennen greppen — die kurzen `v2*`-Präfixe sind weitgehend vergeben
(`.v2bar` ist es schon).

### A1 `Kbd` — `primitives/Kbd.tsx`, Gruppe Aktion

Die Taste, wie sie auf dem Knopf steht (V14). Server-Component, ein `<kbd>`
mit Klasse; die Mono-Schrift kommt schon aus `tokens.css` (`kbd` steht in der
`.lw-mono`-Regel).

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `children` | `string` | ja | Die Taste, wie gedruckt: „A", „⌘K", „Esc" | `Filled` |

Kann bewusst nicht: Plattform erkennen (⌘ gegen Strg) — der Aufrufer
entscheidet, was er hinschreibt; kein `size`, kein `tone`.

Verwendung im Set (Teil des Pakets): `Button hotkey` rendert `<Kbd>` statt
„· A"; `HotkeyLegend` rendert `<Kbd>`; A2 setzt `<Kbd>⌘K</Kbd>` als Suffix der
Suche.

Stories (§6: 1 Zustand + 1 im Einsatz + 1 Rand = 3): `Filled` (einzelne
Tasten) · `InUse` (auf `Button`, in `HotkeyLegend`) · `Edge` (Kombinationen
„Ctrl K", „Shift ↵", langer Text „Leertaste").

Kriterien: rendert ein `<kbd>`-Element · `Button`-Props unverändert, die
Story `v3/Primitives/Aktion/Button` zeigt die Taste als `Kbd` · Rahmen der
Taste ≥ 3:1 gegen den Hintergrund (V10).

### A2 `InputGroup` — in `Form.tsx`, Gruppe Formular

Ein Feld mit Beigabe davor oder dahinter: Lupe, Einheit, Taste, Kopieren.
Server-Component, Flex-Zeile; das Feld selbst bleibt `Input`/`SearchInput`.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `prefix` | `ReactNode` | nein | Vor dem Feld: Icon oder Text, `aria-hidden`, wenn rein dekorativ | `Filled` |
| `suffix` | `ReactNode` | nein | Hinter dem Feld: Einheit, `Kbd`, ein `IconButton` | `Filled` |
| `children` | `ReactNode` | ja | Genau ein `Input`, `SearchInput` oder `AmountInput` | `Filled` |

Kann bewusst nicht: Label, Hinweis, Fehler — das trägt `Field` außen herum;
kein schwebendes Label.

Verhalten: Klick auf eine dekorative Beigabe fokussiert das Feld; der
Fokusring umschließt die ganze Gruppe (`:focus-within`); `invalid` am inneren
Feld färbt die Gruppe; `disabled` graut Beigaben mit.

Stories (§6: 1 + 1 im Einsatz + 1 Rand = 3): `Filled` (Lupe davor,
„%" dahinter) · `InUse` (Top-Bar-Suche mit `<Kbd>⌘K</Kbd>`; Steuersatz-Feld
in einem `Field` mit Fehler) · `Edge` (langer Suffix „Tage nach Fälligkeit",
`disabled`).

Kriterien: Klick auf die Beigabe setzt den Fokus ins Feld · Fokusring an der
Gruppe, nicht nur am Feld · `v2in--invalid` innen färbt die Gruppe (Story
`InUse`).

### A3 `Disclosure group` — Erweiterung 0005

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `group` | `string` | nein | Aufklapper mit demselben `group` schließen einander: natives `name` auf `<details>` | `Accordion` |

Keine Zeile JavaScript, kein Zustand — die Komponente bleibt
Server-Component. Die Zeile „Kann bewusst nicht: mehrere Abschnitte
koordinieren" in 0005 und das `@when` werden angepasst. Eine Story
`Accordion`: drei Aufklapper, eine Gruppe, der zweite `defaultOpen`.

Kriterium: Öffnen des dritten schließt den zweiten, ohne Klick auf ihn.

### A4 Typografie-Story — keine Komponente

`src/ui/v3/Typography.stories.tsx`, Titel `v3/Grundlagen/Typografie` — der
Ordner „Grundlagen" ist neu und nimmt später Farbe und Raum auf (§11.7
Stufe 0). Die Story zeigt jede Klasse aus `tokens.css` einmal mit echtem Text
(Überschrift eines Sachverhalts, Absatz eines Berichts, Kontonummer in Mono,
Overline „Zusatzweg") und die zwei Register — produktiv 13,5–14 px, lesend
16 px (A1). Kein neues CSS.

Kriterium: `h1`–`h4`, `.lw-body`, `.lw-body-sm`, `.lw-caption`, `.lw-overline`,
`.lw-mono` je einmal sichtbar; `grep -c "lw-" Typography.stories.tsx` ≥ 8.

### A5 `Markdown overflow` — Erweiterung 0022, der Reader

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `overflow` | `"clamp" \| "scroll"` | nein | Nur mit `maxHeight`. `clamp` (Default) blendet aus und bietet „Ganz lesen" wie heute; `scroll` hält die Höhe und scrollt innen — der Reader in Drawer und Detail | `Reader` |

Enum statt zweitem Boolean (§5). Story `Reader`: ein langer Agententext in
einem `DetailPane` mit fester Höhe, scrollt innen, Kopf bleibt stehen. Im
selben Zug bekommen die Story-Exporte in `Markdown.stories.tsx` englische
Namen (`Gefuellt` → `Filled` …) — die Datei wird ohnehin angefasst.

Kriterien: `overflow="scroll"` erzeugt `overflow-y: auto` und keine Maske,
kein `summary` · `clamp`-Verhalten aus 0022 unverändert (Story `Long`) ·
Tastatur: der Scrollbereich ist fokussierbar (`tabindex=0`), Pfeiltasten
scrollen.

### A6 `StepHeader` auf `PageHeader` — Erweiterung 0002, ein Seitenkopf

Der Wunsch aus dem Nachschub ist gebaut: `PageHeader` trägt Einordnung
(`overline`), Titel, Leitsatz (`description`), Zustand (`meta`), Handlungen
rechts (`actions`) und den Weg zurück (`back`); alles außer dem Titel ist
optional. Was fehlt, ist die **Konsequenz**: `StepHeader` (Stufe Pattern,
`StepRail.tsx`) rendert denselben Kopf mit eigenem Markup — `abn__screenhead`
aus dem Abnahme-Rahmen, ein anderes `h1`, eine eigene Knopfzeile. Zwei Köpfe,
zwei Optiken. Und die Knopf-Ordnung, die der Nachschub sich wünscht („Button
Array oder durchreichende Komponente"), existiert als `ActionBar` — „the
actions of a screen or dialog footer, exactly one primary path" — wird aber
weder von der `PageHeader`-Story noch von `StepHeader` benutzt (in der App
0×, `v3-backlog.md`).

Keine neue Prop, keine neue Komponente:

- `StepHeader` komponiert `PageHeader`: `overline` → `overline`, `title` →
  `title`, `lead` → `description`, `actions` → `actions`, wobei die
  Schritt-Navigation (← Zurück · Weiter zu Schritt 3 →) als `ActionBar`
  hinter den übergebenen `actions` steht — die Reihenfolge primär →
  sekundär → tertiär kommt aus `ActionBar`, nicht aus jeder Seite neu. Die
  Klassen `abn__screenhead*` in `v3.css` werden gelöscht.
- `PageHeader`: JSDoc und Story `WithActions` zeigen `actions` als
  `<ActionBar>` mit genau einem `variant="primary"`. Die Prop bleibt
  `ReactNode` — ein Typ, der nur `ActionBar` zulässt, wäre in TypeScript
  Schein; die Story ist die Regel.

Stories: `StepRail.stories` behält seine; `PageHeader.stories` bekommt keine
neue, `WithActions` wird auf `ActionBar` umgestellt.

Kriterien: `grep -c "abn__screenhead" src/styles/v3.css src/ui/v3 -r` = 0 ·
`StepHeader` und `PageHeader` rendern dasselbe `h1` (`.v2phead__title`) —
Screenshot beider Stories nebeneinander · `ActionBar` in `PageHeader`-Story
`WithActions`, genau ein primärer Knopf · `useHotkeys`-Tasten der
Abnahme-Schritte unverändert (Story `v3/Patterns/Rahmen/StepRail`).

### B1 Popover-Familie — `primitives/Popover.tsx`, Gruppe Dialog

Drei Exporte, ein Markup-Vokabular, ein Positionierungs-Hook (§4 Familie):
`Popover` (Klick), `Tooltip` (Hover/Fokus, nur Text), `HoverCard`
(Hover/Fokus, Inhalt). Basis: natives `popover="auto"` — Top Layer, Klick
außerhalb, Escape und Fokusrückgabe kommen vom Browser; kein `z-index`.
Platzierung wie in `OverflowMenu`: einmal messen beim Öffnen, dazu das eine,
was Radix noch brächte — an der Fensterkante nach oben umklappen und
seitlich einrücken. `"use client"`.

**`Popover`**

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `trigger` | `ReactNode` | ja | Ein Knopf **mit Wort** (T8); bekommt `aria-expanded` und `aria-controls` | `Filled` |
| `children` | `ReactNode` | ja | Der Inhalt | `Filled` |
| `align` | `"start" \| "end"` | nein | Kante, an der das Feld hängt | `Variants` |
| `open` / `onOpenChange` | `boolean` / `(open: boolean) => void` | nein | Gesteuert, wenn eine Handlung im Feld es schließen soll; sonst hält die Familie den Zustand selbst | `Interactive` |

**`Tooltip`**

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `label` | `string` | ja | Nur Text — erklärt, ersetzt kein Label (T8) | `TooltipFilled` |
| `children` | `ReactNode` | ja | Das erklärte Element; bekommt `aria-describedby` | `TooltipFilled` |

Erscheint nach ~300 ms Hover, **sofort bei Tastaturfokus** (V11);
`role="tooltip"`. `@instead`: ein Wort an einer Plakette → `title` (Z3, ohne
JS); Inhalt mit Link oder Handlung → `HoverCard`/`Popover`.

**`HoverCard`**

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `children` | `ReactNode` | ja | Der Anker: ein Link oder Text mit Ziel | `HoverCardFilled` |
| `content` | `ReactNode` | ja | Die Karte — die Form „Vorschau" der Entität, vom Aufrufer komponiert | `HoverCardFilled` |

Öffnet nach ~500 ms Hover oder bei Fokus, schließt ~200 ms nach Verlassen;
Hover auf der Karte hält sie offen. Kann bewusst nicht: auf Touch — der
Anker führt deshalb immer selbst ans Ziel (I11), die Karte ist Zusatzweg.

Stories (§6, je Export: Popover 1 + 1 Enum + 1 Callback + 1 im Einsatz;
Tooltip 1 + 1 Rand; HoverCard 1 + 1 im Einsatz + 1 Rand = 9, unter der
Obergrenze): `Filled` · `Variants` (`align` beide, unten am Fenster geklappt)
· `Interactive` (gesteuert, „Übernehmen" schließt) · `InUse` („Spalten
wählen" im `CardHead`) · `TooltipFilled` (an `IconButton`) · `TooltipEdge`
(langer Text bricht in maximaler Breite, an der Kante geklappt) ·
`HoverCardFilled` (Kontonummer → Kontokarte mit Daten aus `src/ludwig/`) ·
`HoverCardInUse` (in einer `Row` der Buchungstabelle) · `HoverCardEdge`
(unterste Zeile, klappt nach oben).

Kriterien: Escape schließt, Fokus kehrt zum Trigger zurück (`Interactive`) ·
Klick außerhalb schließt ohne eigenen Listener (`popover="auto"`) · Tooltip
erscheint bei Tab-Fokus, `IconButton` behält `aria-label` (`TooltipFilled`) ·
kein Feld verlässt das Fenster (`Variants`, `TooltipEdge`, `HoverCardEdge`) ·
`package.json` unverändert · kein `z-index` in `v3.css` für die Familie.

### C1 `CommandPalette` — `patterns/CommandPalette.tsx`, Gruppe Rahmen

Klassen-Test: ja — jede Anwendung hat Seiten und Handlungen. Pattern, weil
sie `HotkeyBinding`-artige Einträge und `NavSection` zusammenführt und
eigenen Zustand trägt (§3 Regel 4); als Primitive dürfte sie `Hotkeys` nicht
kennen. Setzt auf `Dialog`, `Kbd`, `InputGroup`, `useHotkeys` und `cmdk`
(Offene Frage 1).

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `open` / `onOpenChange` | `boolean` / `(open: boolean) => void` | ja | Der Aufrufer hält den Zustand | `Interactive` |
| `groups` | `CommandGroup[]` | ja | `{ title, items: CommandItem[] }` | `Filled` |
| `placeholder` | `string` | nein | Standard „Befehl oder Seite …" | `Filled` |
| `emptyText` | `string` | nein | Standard „Kein Treffer — kürzer suchen." | `NoMatch` |

`CommandItem = { id, label, hint?, icon?, key?, href?, onSelect?, keywords? }`
— `key` ist die Taste, wie sie auf dem Knopf steht (als `Kbd` rechts), `href`
ein Sprung (rendert `Link`), `onSelect` eine Handlung; `keywords` sind
Suchwörter, die nicht sichtbar sind („Kreditor" für „Geschäftspartner"). Der
Aufrufer bildet `NavSection[]` aus `NavList` auf Gruppen ab — das Pattern
kennt keine Route.

Kann bewusst nicht: serverseitig suchen (Liste kommt vollständig), sich
zuletzt Gewähltes merken, verschachtelte Seiten.

Verhalten: `Ctrl+K`/`⌘K` öffnet von überall — **auch aus einem Feld**, weil
Meta-Kombinationen kein Tippen sind (das ist eine Änderung an `useHotkeys`:
`meta`-Bindungen feuern trotz `isTyping`, siehe Befunde). Sichtbarer Weg
(V14): die Top-Bar-Suche als `InputGroup` mit `<Kbd>⌘K</Kbd>`, die beim Fokus
öffnet — Markup an der Aufrufstelle, Story `InUse` zeigt es. Tippen filtert
(cmdk-Sortierung), ↑↓ wandern, Enter springt oder führt aus und schließt,
Escape schließt und gibt den Fokus zurück. Zustände: gefüllt · kein Treffer;
leer, lädt, Fehler entfallen (die Liste kommt fertig vom Aufrufer).

Stories (§6: 2 Zustände + 1 Callback + 1 im Einsatz + 1 Rand = 5): `Filled` ·
`NoMatch` · `Interactive` (⌘K öffnet, Enter wählt, Ergebnis steht darunter)
· `InUse` (in `AppShell` mit `TopBar`-Trigger, Gruppen aus `NavList`) ·
`Edge` (60 Einträge, lange Labels, Einträge mit und ohne `key`).

Kriterien: `⌘K` öffnet, auch mit Fokus in einem `Input` (`InUse`) · Enter auf
einem `href`-Eintrag ist eine echte Navigation (`<a>`), nicht `onClick` ·
Escape gibt den Fokus an den Trigger zurück · kein Fachwort im Pattern
(`grep -i "konto\|mandant\|beleg" CommandPalette.tsx` leer) · `package.json`
wächst um genau `cmdk`.

### C2 `BarChart` — `primitives/BarChart.tsx`, neue Gruppe Daten

Balken je Zeitabschnitt, eine Reihe. Inline-SVG, Server-Component; Farben und
Kontrast nach dem Skill `dataviz` (V10: ≥ 3:1). Die neue Barrel-Gruppe
„Daten" (`index.ts`-Kommentar, damit auch Storybook-Ordner) nimmt später
`Sparkline` auf, falls das Dashboard sie braucht.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `bars` | `{ label: string; value: number }[]` | ja | Ein Balken je Eintrag, Reihenfolge wie gegeben | `Filled` |
| `format` | `(value: number) => string` | ja | Beträge kommen formatiert vom Formatter (T7), nie lokal | `Filled` |
| `highlight` | `string` | nein | Label des hervorgehobenen Balkens (laufender Monat) | `Highlight` |
| `max` | `number` | nein | Feste Obergrenze, sonst aus den Werten | `Edge` |

Kann bewusst nicht: mehrere Reihen, Achsen mit Ticks, Linien, Interaktion —
kommt eine dieser Anforderungen, ist das die Grenze, an der `recharts`
hereinkommt.

Verhalten: negative Werte hängen unter der Grundlinie; jeder Balken trägt
`title` mit Label und Wert (Z3, ohne JS); die Werte stehen zusätzlich in
einer visuell versteckten Tabelle für Screenreader. Leer (alle 0 oder keine
Einträge) → eine Zeile „Keine Werte im Zeitraum." linksbündig (L6).

Stories (§6: 2 Zustände + 0 Enum + 1 Layout (`highlight`) + 1 im Einsatz
+ 1 Rand = 5): `Filled` (12 Monate Aufwand, „1.800,00 €") · `Empty` ·
`Highlight` · `InUse` (in einer `Card` neben `KpiTile`) · `Edge` (negativ,
ein Ausreißer, 24 Balken).

Kriterien: Balken ≥ 3:1 gegen `--color-bg` (`Filled`, gemessen) · Werte als
Text erreichbar (`title` und sr-Tabelle) · `package.json` unverändert ·
ersetzt `MonthlyBarChart` — offen (App).

## Befunde (nicht Teil dieser Aufgabe)

- **`Dialog` ohne Fokusfalle.** `Dialog.tsx` setzt den Erstfokus, hält ihn
  aber nicht; Tab läuft hinter den Scrim (V10/V11). Natives `<dialog>` mit
  `showModal()` bringt Falle, Top Layer und Escape ohne eigenen Listener —
  eigene Aufgabe „Dialog auf `<dialog>`", davon profitieren `ReasonDialog`,
  `HotkeyLegend` und der Bestätigungsfall (Alert Dialog).
- **`useHotkeys` und Meta-Kombinationen.** Heute schweigt der Hook, sobald
  der Fokus in einem Feld liegt — richtig für „A", falsch für `⌘K`. C1
  braucht: `meta`-Bindungen feuern trotz `isTyping`.
- **`Markdown.stories.tsx`** hat deutsche Exportnamen (`Gefuellt`, `Leer`,
  `Lang`, `Unsicher`, `InUse`) — A5 zieht sie nach.
- **`ActionBar` wird nicht benutzt** — 0× in der App, 0× in den
  `PageHeader`-Stories. A6 macht es zur sichtbaren Regel; die Adoption in
  der App bleibt ein Schritt der Migration.
- **0009 Combobox** trägt fünf offene Punkte aus der Abnahme; die
  Befehlspalette (C1) löst dieselben Fragen über `cmdk`. Sollte 0009 später
  ebenfalls auf `cmdk` wechseln, ist das eine eigene Entscheidung, nicht
  diese.

## Offene Fragen

1. **`cmdk` als Abhängigkeit für die Befehlspalette?** Ohne Antwort: ja —
   die einzige neue Abhängigkeit dieser Aufgabe; Radix und recharts bleiben
   draußen.
2. **Was sind „Marker" und „Questionaire"?** Die Registry beschreibt
   `marker` nicht, ein Fragebogen-Element gibt es dort nicht. Ohne Antwort:
   beide fallen aus dieser Aufgabe; der Fragebogen wird als Wizard
   (`Assistent`) eine eigene Spec, sobald eine Seite ihn braucht.
3. **Popover-Familie mit Props-API oder Compound-API wie shadcn?** Ohne
   Antwort: Props-API (`trigger`, `children`), wie `Dialog` und der Rest des
   Sets — ein Stil je Set.

## Abnahmekriterien

Fest (für diese Sammelaufgabe):

- [ ] Jedes in der Anfrage genannte Element hat eine Zeile im Abgleich
- [ ] Je Arbeitspaket eine eigene Spec-Datei nach `TEMPLATE.md`, bevor gebaut wird
- [ ] `package.json` wächst um höchstens `cmdk`; `grep -c "radix\|recharts" package.json` = 0
- [ ] `src/ui/v3` bleibt ohne Tailwind-Utility (`grep -rE 'className="(flex|grid|p-|text-)' src/ui/v3` leer)

Variabel (aus dieser Spec, je Welle beim Bauen nachgewiesen):

- [ ] Welle A: `Kbd`, `InputGroup`, `Disclosure group`, Typografie-Story, `Markdown overflow="scroll"` mit Story `Reader`, `StepHeader` auf `PageHeader` — im Storybook angesehen
- [ ] Welle B: Popover-Familie, neun Stories, kein Feld verlässt das Fenster
- [ ] Welle C: `CommandPalette` öffnet mit ⌘K aus einem Feld; `BarChart` ohne recharts

## Abnahme

### Welle A — Commit `f760c12` (2026-09-03)

| Paket | Spec | Nachweis (Story-IDs · Befund) |
|---|---|---|
| A1 `Kbd` | 0035 (Status Abnahme) | `v3-primitives-aktion-kbd--filled` · `--in-use` · `--edge`; `Button` und `HotkeyLegend` ziehen mit: `v3-primitives-aktion-button--with-key`, `v3-patterns-frame-hotkeylegend--open`. DOM: `KBD.v2kbd`, `.v2btn__key` 0×. Rand 3.45:1 gegen Weiß / 3.19:1 gegen `bg-soft`; im Knopf 8.87 / 8.45 / 3.43:1 (V10 erfüllt — dafür Deckkraft 0.85 statt der alten 0.7) |
| A2 `InputGroup` | 0036 (Status Abnahme) | `v3-primitives-formular-inputgroup--filled` · `--in-use` · `--edge`. Klick auf „%" fokussiert das Feld (`activeElement` = `INPUT#Steuersatz`); Ring liegt an `.v2ing`, das innere Feld hat `border-width: 0` und keinen eigenen Schatten; `invalid` färbt die Gruppe `rgb(168,64,60)`; `disabled` → Deckkraft 0.6 auf `bg-soft` |
| A3 `Disclosure group` | 0005 (Status Abnahme) | `v3-primitives-fläche-disclosure--accordion`: Klick auf den dritten Aufklapper schloss den zweiten (`open` 2→3), ohne Klick auf ihn. Kein `"use client"`, natives `<details name>` |
| A4 Typografie-Story | 0037 (Status Abnahme) | `v3-grundlagen-typografie--scale` · `--registers` · `--in-use`; `grep -c "lw-"` = 40. **Befund:** `h1`–`h4` als Element-Selektor sind wirkungslos — Tailwinds Preflight lädt in `index.css` nach `tokens.css` und setzt `font-size: inherit` (h1 rendert 14 px statt 40 px). Die Story trägt deshalb `.lw-h1`–`.lw-h4` am Element; die Ursache ist eine eigene Aufgabe (Reihenfolge der Style-Kette, betrifft auch `ludwig/app`) |
| A5 `Markdown overflow="scroll"` | 0022 (Status Abnahme) | `v3-primitives-fläche-markdown--reader`: `div.v2mk--scroll`, `overflow-y: auto`, `max-height: 260px`, `tabindex="0"`, keine Maske, 0 `summary`; Kopf des `DetailPane` steht, Inhalt scrollt (scrollTop 0 → 300). `--long` (clamp) unverändert. **Befund und Behebung:** der clamp-Anriss war in Chrome ≥ 131 unsichtbar (`::details-content { content-visibility: hidden }`) — eine Zeile in `v3.css` stellt ihn wieder her. Story-Exporte jetzt englisch (`Filled`, `Empty`, `Variants`, `Long`, `Unsafe`, `InUse`, `Reader`) |
| A6 `StepHeader` auf `PageHeader` | 0002 (Status Abnahme) | `v3-patterns-frame-steprail--screen-header` · `--screen-header-edge` · `--screen-header-callbacks` · `--screen-header-without-nav`; `grep -rn "abn__screenhead" src/` = 0; beide Köpfe rendern `h1.v2phead__title` (20 px). `v3-primitives-fläche-pageheader--with-actions` und `--in-use` benutzen `ActionBar` mit genau einem `v2btn--primary`. **Folge, sichtbar:** die Knopf-Ordnung kommt jetzt aus `ActionBar` — „Weiter" (primär) steht links von „← Zurück", vorher umgekehrt |

### Welle B — Commit `c04e9eb` (2026-09-03)

| Paket | Spec | Nachweis (Story-IDs · Befund) |
|---|---|---|
| B1 Popover-Familie | 0038 (Status Abnahme) | Neun Stories, alle angesehen: `v3-primitives-dialog-popover--filled` · `--variants` · `--interactive` · `--in-use` · `--tooltip-filled` · `--tooltip-edge` · `--hover-card-filled` · `--hover-card-in-use` · `--hover-card-edge`. Escape schließt und gibt den Fokus an den Trigger (`focusOnTrigger: true`, `aria-expanded` zurück auf `false`); Klick außerhalb schließt ohne eigenen Listener; Tooltip erscheint beim Tab-Fokus (`role="tooltip"`, `IconButton` behält `aria-label="Herkunft"`, dazu `aria-describedby`); kein Feld verlässt das Fenster — `align="end"` bleibt bei 2848 von 2880 px, unten klappen Popover, Tooltip und HoverCard über den Anker (`flippedAbove: true`); `Interactive` schließt beim Übernehmen und schreibt 2.500,00 € darunter; im `CardHead` ragt das Feld über die Kartenkante, ohne beschnitten zu werden. `package.json` unverändert, `computed z-index: auto` (Top Layer), keine `z-index`-Zeile in der Familie |

Offen aus Welle B: keins. **Beobachtung zur Automatisierung**, nicht zur
Komponente: der erste Klick nach einem Seitenwechsel fokussiert im
ferngesteuerten Fenster nur das Fenster; jeder weitere schaltet korrekt um
(Ereignis-Log `pointerdown → click → beforetoggle closed→open`).

### Welle C — Commit `ade8573` (2026-09-03)

| Paket | Spec | Nachweis (Story-IDs · Befund) |
|---|---|---|
| C1 `CommandPalette` | 0039 (Status Abnahme) | `v3-patterns-frame-commandpalette--filled` · `--no-match` · `--interactive` · `--in-use` · `--edge`. `⌘K` öffnet mit dem Fokus **im Suchfeld** (`openAfterMetaK: true`), ein „k" ohne Meta im selben Feld tut nichts (`openAfterPlainK: false`) — `useHotkeys` lässt `meta`-Bindungen jetzt trotz `isTyping` durch. Enter auf einem `href`-Eintrag ist eine echte Navigation: das Item enthält ein `A`, `location.hash` wechselt auf `#partners`, die Palette schließt. Escape schließt und gibt den Fokus an den Trigger (`focusBackOnSearch: true`). `keywords`: „kreditor" findet „Geschäftspartner". `grep -i "konto\|mandant\|beleg"` in der Datei = 0; `git diff package.json` = genau eine Zeile (`cmdk`), kein `radix`, kein `recharts`. **Abweichung:** die Top-Bar-Suche öffnet beim **Klick** statt beim Fokus — mit Fokusrückgabe würde Öffnen-beim-Fokus die Palette sofort wieder aufziehen (Begründung in 0039) |
| C2 `BarChart` | 0041 (Status Abnahme) | `v3-primitives-daten-barchart--filled` · `--empty` · `--highlight` · `--in-use` · `--edge`; neue Barrel- und Storybook-Gruppe „Daten". Balken `--color-text-subtle` 4.88:1 gegen Weiß / 4.51:1 gegen `bg-soft`, der hervorgehobene `--color-primary` 11.64:1 — beide über den 3:1 aus V10; Farben nach Skill `dataviz` gewählt und mit `validate_palette.js` geprüft (ΔE 21.8 normal / 20.1 CVD), Hervorhebung zusätzlich am Label (600er Schnitt, `--color-text`). Jeder Balken trägt `title` („Sep: 12.840,50 €"), dieselben Werte stehen in einer 1 × 1 px versteckten Tabelle. Negative Werte hängen unter der Grundlinie in derselben Farbe; 24 Balken zeigen 12 Labels; leer rendert „Keine Werte im Zeitraum." statt eines Rasters. Kein `"use client"`, `package.json` ohne `recharts` |

Offen aus Welle C: keins. **Grenze der Automatisierung:** Tastendrücke mit
Modifier erreichen das ferngesteuerte Fenster nicht; `⌘K` wurde deshalb mit
einem echten `KeyboardEvent` aus der Seite heraus geprüft, mit dem Fokus im
Feld.

Offen aus Welle A (nicht Teil der Pakete): Tastatur-Nachweis für den Reader
blieb halb — der Bereich nimmt den Fokus und scrollt am Rad, die
Pfeiltasten-Prüfung scheiterte an der Automatisierung (synthetische
`keydown` lösen in Chrome kein natives Scrollen aus), nicht erkennbar an der
Komponente.

### Abnahme der Sammelaufgabe (2026-09-05, fremder Agent)

Die Tabellen darüber sind der Bericht des Bauens. Hier steht, was die
Abnahme gegen die **Abnahmekriterien** dieser Datei geprüft hat — und, weil
0034 kein Baustein ist, sondern ein Abgleich: ob ihr Ergebnis heute noch
stimmt.

**Fest**

| Kriterium | Nachweis (Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Jedes in der Anfrage genannte Element hat eine Zeile im Abgleich | Abgefragt gegen die Aufzählung im Abschnitt „Ziel": Kbd · HoverCard · Tooltip · Popover · Command · Combobox · Collapsible · Accordion · Alert Dialog · Input Group · Typography · Menubar · Charts · Marker — je eine Zeile; dazu „Questionaire" und die beiden Nachschübe (Scroll Area/Markdown-Reader, Seitenkopf). Die „weiteren Formular-Elemente" sind im Absatz darunter einzeln abgehakt (Field, Label, Input, Textarea, Select, Native Select, Checkbox, Radio Group, Switch, Calendar, Spinner, Progress, Empty, Sonner, Skeleton, Button Group, Toggle Group, Item, Sidebar, Sheet/Drawer, Pagination, Separator, Avatar, Breadcrumb, Slider, Input OTP, Resizable, Carousel, Aspect Ratio, Direction, Attachment/Bubble/Message/Message-Scroller). Kein genanntes Element ohne Einordnung | ✓ |
| Je Arbeitspaket eine eigene Spec-Datei nach `TEMPLATE.md`, bevor gebaut wird | A1 → `0035-kbd.md` · A2 → `0036-input-group.md` · A3 → `0005-disclosure.md` (Erweiterung) · A4 → `0037-typography-story.md` · A5 → `0022-markdown.md` (Erweiterung) · A6 → `0002-pageheader.md` (Erweiterung) · B1 → `0038-popover.md` · C1 → `0039-command-palette.md` · C2 → `0041-bar-chart.md`. Alle neun Dateien liegen in `docs/backlog/` | ✓ |
| `package.json` wächst um höchstens `cmdk`; `grep -c "radix\|recharts" package.json` = 0 | Befehlsausgabe **0**. `dependencies` heute: clsx, **cmdk**, date-fns, decimal.js, lucide-react, tailwind-merge, zod — gegenüber dem Stand der Spec (clsx, date-fns, decimal.js, lucide-react, tailwind-merge, zod) genau ein Zuwachs, und zwar der eine erlaubte | ✓ |
| `src/ui/v3` bleibt ohne Tailwind-Utility | `grep -rE 'className="(flex\|grid\|p-\|text-)' src/ui/v3` ohne Treffer | ✓ |

**Variabel**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Welle A gebaut und im Storybook angesehen | Alle sechs Pakete haben ihre Story-IDs in `index.json`: `v3-primitives-aktion-kbd--filled/--in-use/--edge` · `v3-primitives-formular-inputgroup--filled/--in-use/--edge` · `v3-primitives-fläche-disclosure--accordion` · `v3-grundlagen-typografie--scale/--interface/--registers/--in-use` (`grep -c "lw-" Typography.stories.tsx` = 39, verlangt ≥ 8) · `v3-primitives-fläche-markdown--reader` · `v3-patterns-frame-steprail--screen-header` (+ `--screen-header-edge`, `--screen-header-callbacks`, `--screen-header-without-nav`) und `v3-primitives-fläche-pageheader--with-actions`. A6 zusätzlich prüfbar: `grep -rn "abn__screenhead" src/` = **0**, und `StepRail.tsx` importiert `ActionBar`. Angesehen hat sie die Sitzung, die Welle A gebaut hat; diese Abnahme hat die IDs und die Greps nachgezogen, nicht jede Story erneut geöffnet | ✓ |
| Welle B: Popover-Familie, neun Stories, kein Feld verlässt das Fenster | Vollständig nachgeprüft — die Einzelnachweise stehen in `0038-popover.md`, Abschnitt „Abnahme" (2026-09-05). Neun Story-IDs vorhanden und einzeln im Browser bedient; an drei Rändern gemessen: `align="end"` legt die rechte Kante des Feldes auf die des Knopfes (1308 px bei 1340 px Fensterbreite), unten klappen Popover (Feldunterkante 690 ≤ Knopfoberkante 697), Tooltip (706 ≤ 712) und HoverCard (703 ≤ 708) über den Anker; in allen Fällen `inWindow: true` | ✓ |
| Welle C: `CommandPalette` öffnet mit ⌘K aus einem Feld; `BarChart` ohne recharts | `useHotkeys` lässt Meta-Bindungen jetzt trotz `isTyping` durch — `Hotkeys.tsx:56–57`: `const meta = e.ctrlKey \|\| e.metaKey; if (!meta && isTyping(e.target)) return;`. Fünf `commandpalette`- und fünf `barchart`-IDs in `index.json`; `grep -c "recharts" package.json` = 0. Bedient hat sie die bauende Sitzung (0039, 0041); diese Abnahme hat den Hook-Code und die Abhängigkeiten geprüft | ✓ |

**Stimmt der Abgleich heute noch? Ja — am 2026-09-05 gegen die Registry
nachgezählt.**

| Aussage der Spec (Stand 2026-09-03) | Prüfung 2026-09-05 (shadcn-Registry `@shadcn`) |
|---|---|
| „61 `ui`-Einträge" | **61** — unverändert, dieselbe Liste inklusive `kbd`, `marker`, `attachment`/`bubble`/`message`/`message-scroller`, `direction`, `native-select` |
| Tooltip/HoverCard/Popover/Menubar/Alert Dialog/Marker auf Radix | `popover` → `cn, radix-ui`; `marker` → `cn, radix-ui` — bestätigt |
| Command = `cmdk` | `command` → `cn, cmdk` — bestätigt |
| Chart = `recharts@3.8.0` | `chart` → `cn, recharts@3.8.0, lucide-react` — bestätigt, bis auf die Version genau |
| Combobox auf Base UI | `combobox` → `cn, @base-ui/react` — bestätigt; „nichts zu übernehmen" gilt weiter |
| Kbd und Input Group ohne Abhängigkeit | `kbd` → nur `cn` — bestätigt |
| „Marker" ohne Beschreibung, unklar was es ist | Der Registry-Eintrag trägt weiterhin keine Beschreibung; Offene Frage 2 bleibt offen |

Damit tragen alle fünf Entscheidungen der Grundfrage unverändert: shadcn als
Katalog statt als Code · kein Radix · `cmdk` als einzige neue Abhängigkeit ·
kein `recharts` · Props-API. Nichts an der Registry hat sich seit dem
2026-09-03 so verändert, dass eine davon neu zu treffen wäre.

**Zu den Befunden dieser Datei** (nicht Teil der Abnahmekriterien, hier nur
mit ihrem heutigen Stand):

- **`useHotkeys` und Meta-Kombinationen** — erledigt in Welle C, siehe oben.
- **`Markdown.stories.tsx` deutsche Exportnamen** — erledigt: die Datei
  führt `--filled`, `--empty`, `--variants`, `--long`, `--unsafe`,
  `--in-use`, `--reader`.
- **`ActionBar` wird nicht benutzt** — im Set erledigt: `StepRail.tsx`,
  `PageHeader.stories.tsx`, `DataTable.tsx` und weitere ziehen sie. Die
  Adoption in `ludwig/app` bleibt ein Schritt der Migration.
- **`Dialog` ohne Fokusfalle** — **noch ohne Nummer.** Die Datei nennt sie
  als „eigene Aufgabe ‚Dialog auf `<dialog>`'", eine Spec dafür gibt es in
  `docs/backlog/` bis heute nicht (`ls | grep -i dialog` ohne Treffer). Kein
  Mangel dieser Aufgabe — Befunde sind ausdrücklich nicht Teil davon —,
  aber der offene Faden, den 0034 hinterlässt.
- **0009 Combobox** — Status weiterhin `Abnahme`; ihre fünf offenen Punkte
  sind unverändert ihre eigene Arbeit.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: keine gegen die Kriterien dieser Aufgabe. Weiterzugeben: der Befund „Dialog auf natives `<dialog>`" hat noch keine Backlog-Nummer.
