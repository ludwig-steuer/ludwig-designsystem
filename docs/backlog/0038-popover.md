# 0038 · Popover-Familie — Popover, Tooltip, HoverCard

| | |
|---|---|
| Status | fertig |
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

Abnahme am 2026-09-05 (fremder Agent, gegen Spec und Code). Alle neun Stories
im Browser auf `localhost:6107` geöffnet und bedient.

**Story-Deckung.** Neun Stories in der Spec, neun Exporte in
`Popover.stories.tsx`, neun IDs in `index.json` — die Ableitung je Export
(Popover 1 Zustand + 1 Enum + 1 Callback + 1 im Einsatz · Tooltip 1 + 1 Rand ·
HoverCard 1 + 1 im Einsatz + 1 Rand = 9) geht auf und bleibt unter der
Obergrenze von 10. Jede Prop der drei Schnittstellen hat ihre Story:
`Popover.trigger`/`children` in `Filled`, `align` in `Variants` (beide
Ausprägungen), `open`/`onOpenChange` in `Interactive` · `Tooltip.label`/
`children` in `TooltipFilled` · `HoverCard.children`/`content` in
`HoverCardFilled`. `Empty`, `EmptyAfterFilter`, `Loading`, `Error` sind
begründet ausgeschlossen — die Familie zeigt keinen eigenen Datenbestand.

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (Anfang und Ende der Abnahme). `pnpm build` nicht neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`; der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/Popover.tsx` mit drei Exporten einer Familie, `Popover.stories.tsx` daneben; Titel `v3/Primitives/Dialog/Popover`, deckt sich mit der Barrel-Gruppe „Dialog" (`src/ui/v3/index.ts:111` … `:114`: `export { Popover, Tooltip, HoverCard }`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Drei Exporte, dreimal beides: `Popover` `:125–131`, `Tooltip` `:187–193`, `HoverCard` `:221–227`. Bezeichner, Kommentare und JSDoc englisch; die Abgrenzungen benennen `Dialog`, `OverflowMenu`, `title` (Z3) und einander | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}' Popover.tsx` = 0; kein Maß im `style`-Objekt. `EDGE = 8` / `GAP = 6` sind Rechengrößen der Platzierung, kein Gestaltungsmaß — dieselbe Bauart wie `OverflowMenu.tsx:30` (0008, abgenommen). Optik in `v3.css:1198–1225`, alles über Tokens. Keine Map, kein Status | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Neun IDs: `--filled` · `--variants` · `--interactive` · `--in-use` · `--tooltip-filled` · `--tooltip-edge` · `--hover-card-filled` · `--hover-card-in-use` · `--hover-card-edge`. Die vier ausgeschlossenen Zustände sind in der Spec begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | siehe die Zeilen dieser Tabelle; die zwei App-Punkte nach `backlog/README.md` übersprungen. Zusätzlich geprüft: kein `text-align: center`, Unicode-Pfeile nur in den `@instead`-Kommentaren (nicht im Markup, T9), Schatten `--shadow-md` — Rand **und** Schatten sind hier zulässig, `.v2pop` ist ein schwebendes Feld, keine Karte (§2 „Schatten: sparsam: Menü, Popover, Dialog") | ✓ |
| Im Browser angesehen, nicht nur gebaut | Alle neun IDs am 2026-09-05 geöffnet; Popover geklickt, Tooltip und HoverCard mit echtem Mauszeiger und mit Tastaturfokus geöffnet, Rechtecke mit `getBoundingClientRect` gemessen | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Escape schließt, der Fokus kehrt zum Trigger zurück | `--interactive`: Feld offen, echte Escape-Taste → `:popover-open` false, `aria-expanded` „false", `document.activeElement` **ist** der Trigger (`BUTTON` „Prüfgrenze ändern"). Bei `Tooltip`/`HoverCard` (`popover="manual"`) besorgt das der eigene `keydown`-Listener (`Popover.tsx:67–77`): in `--hover-card-edge` schließt ein `keydown` mit `key: "Escape"` die offene Karte (`true → false`) | ✓ |
| Klick außerhalb schließt, ohne eigenen Listener (`popover="auto"`) | `--filled`: Trigger geklickt → Feld offen; Klick auf leere Fläche (800/500) → `:popover-open` false, `aria-expanded` zurück auf „false". In `Popover.tsx` steht kein `document.addEventListener('click')`; der Zustand hört über `onToggle` zu, was der Browser entscheidet (`:169–179`) | ✓ |
| Tooltip erscheint bei Tab-Fokus; der `IconButton` behält sein `aria-label` | `--tooltip-filled`: vor dem Fokus 0 offene Tooltips, nach `focus()` auf den `IconButton` **sofort** 1 („Erklärt, wie Ludwig auf dieses Konto gekommen ist") — ohne die 300 ms des Hovers (V11). Der Knopf behält `aria-label="Herkunft"` **und** `title="Herkunft"` und bekommt `aria-describedby` dazu; das Feld trägt `role="tooltip"` und `popover="manual"` | ✓ |
| Kein Feld verlässt das Fenster (gemessen an `getBoundingClientRect`) | Fenster 1340 × 757. `--variants`: `align="start"` legt die linke Kante auf die des Knopfes (32 = 32), `align="end"` die rechte (1308 = 1308), unten klappt das Feld über den Knopf (Unterkante 690 ≤ Oberkante 697) · `--tooltip-edge`: langer Text bricht in 252 px (= 32 ch, `max-width` aus `v3.css:1219`) auf vier Zeilen, unten geklappt (706 ≤ 712) · `--hover-card-edge`: Karte geklappt (703 ≤ 708). In allen sechs Messungen `left ≥ 0`, `top ≥ 0`, `right ≤ 1340`, `bottom ≤ 757` · `--in-use`: das Feld ragt über die Kartenunterkante (254 > 243) und wird **nicht** beschnitten — Top Layer | ✓ |
| `package.json` unverändert | `git diff --stat package.json` leer, `git status --short package.json` leer. Die Familie kommt ohne Radix und ohne Positionierungs-Bibliothek aus | ✓ |
| Kein `z-index` in `v3.css` für die Familie | Der Familienblock `v3.css:1198–1225` enthält **0** `z-index`-Zeilen; im Browser `getComputedStyle(.v2pop).zIndex` = `auto` bei `position: fixed` — der Browser hält das Feld im Top Layer. **Zum Befehl in der Spec:** `grep -A20 "v2pop" … \| grep z-index` ist nicht trennscharf — er greift 30 Zeilen weiter `.v2kf__pop { … z-index: 20 … }` der Kontenauswahl mit, eine andere Familie. Geprüft wurde deshalb am Block, nicht am Befehl | ✓ |
| Der Trigger trägt `aria-expanded` und `aria-controls`, der erklärte Anker `aria-describedby` | `--filled`, DOM-Probe: `button[aria-expanded="false"][aria-controls="_r_0_"]`, das Feld hat `id="_r_0_"` und `popover="auto"` — die Kennungen decken sich · `--tooltip-filled`: beide Anker tragen `aria-describedby` auf die id ihres `role="tooltip"`-Feldes (`_r_0_`, `_r_1_`) · `--hover-card-*`: derselbe Weg am Link | ✓ |

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Gesteuert schließt sauber.** `--interactive`: „2.500,00 € übernehmen"
  schließt das Feld und schreibt darunter „Aktuelle Prüfgrenze: 2.500,00 €".
- **HoverCard mit echten Daten.** `--hover-card-filled` und
  `--hover-card-in-use` ziehen `accountSourceLabel("reference")` aus
  `src/ludwig/` — angezeigt wird „SKR-Katalog", nicht ein im Story-File
  erfundenes Wort. Der Anker ist ein `Link` mit eigenem Ziel; die Karte ist
  Zusatzweg (I11).
- **Der Befund beim Bauen bestätigt sich, und er ist die Automatisierung.**
  Nach einem Seitenwechsel öffnete der erste Klick in `--interactive` nichts,
  jeder weitere schaltete korrekt um; in `--filled` griff schon der erste.
  Dasselbe bei der Escape-Taste an einem `manual`-Feld: die physische Taste
  erreichte das ferngesteuerte Fenster nicht, ein `keydown` aus der Seite
  schloss die Karte sofort. Beides liegt am Fernsteuern, nicht an der
  Komponente.
- **Kleine Abweichung ohne Folge:** die Spec typisiert `trigger` und
  `children` als `ReactElement`, der Code als `ReactNode` (wie das
  Vorbild-Paket B1 in 0034 es schreibt). `withProps` (`:120–123`) prüft mit
  `isValidElement` und reicht sonst unverändert durch — kein Fehlverhalten,
  nur die weichere Signatur.
- **Für die Tastatur erreichbar ist nur, was fokussierbar ist.** In
  `--tooltip-filled` hängt der zweite Tooltip an einem `<span class="v2mono">BU
  9</span>`; ein `span` nimmt keinen Fokus, der Tooltip ist dort also nur mit
  der Maus zu bekommen. Sache der Aufrufstelle, nicht der Komponente — die
  Story zeigt aber ein Muster, das eine Seite so nicht übernehmen sollte.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: keine. Kein Kriterium dieser Spec zielt auf `ludwig/app`; die Ablösung des v1-`Tooltip` und der elf Eigenbauten steht in der Kopfzeile „Ersetzt" und ist ein Schritt der Migration, kein Kriterium.
