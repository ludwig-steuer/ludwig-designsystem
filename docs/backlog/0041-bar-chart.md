# 0041 · BarChart — Balken je Zeitabschnitt, eine Reihe

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` — neue Gruppe Daten |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Werte je Monat sind fachfrei |
| Quelle | `docs/backlog/0034-shadcn-abgleich.md` §C2 (shadcn-Abgleich, Registry-Eintrag `chart` = `recharts@3.8.0` — hier bewusst ohne) · Skill `dataviz` (Form, Farbformel, Validator) |
| Ersetzt | `MonthlyBarChart` in `ludwig/app` (4 Dateien / 5 Stellen, §11.7 „heben") |
| Blockiert | das Dashboard (Aufwand je Monat), die Jahresübersicht |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

„Ist der August normal?" beantwortet keine Zahl allein, sondern der Vergleich
mit den elf Monaten davor. Die App zeichnet dafür an fünf Stellen eigene
Balken; das Design-System hat keinen. Was fehlt, ist genau eine Form: eine
Reihe, ein Balken je Zeitabschnitt, ein hervorgehobener Abschnitt — mehr
nicht.

## Einordnung

- **Wiederverwenden:** `ProgressCell`/`ProgressBar` zeigen **einen** Anteil,
  keine Reihe; `KpiTile` ist die Zahl ohne Verlauf; `ComparisonTable` stellt
  zwei Stände gegenüber. Kein `@when` deckt „eine Reihe über die Zeit".
- **Neu, weil:** §3 Regel 3 — kein `@when` passt, kein Fachwort, 4 belegte
  Dateien, und die Achsen-, Skalen- und Nulllinien-Arithmetik ist an der
  Aufrufstelle nicht in ~15 Zeilen richtig zu treffen (negative Werte!).
- **Zuschnitt:** eine Datei, ein Export. Die neue Barrel-Gruppe „Daten"
  (Kommentar in `index.ts`, damit auch der Storybook-Ordner) nimmt später
  `Sparkline` auf, falls das Dashboard sie braucht.
- **Setzt auf:** nichts. Inline-SVG, Server-Component. **Kein `recharts`**
  (0034 §4): belegt sind 60 Zeilen SVG; nachgerüstet wird, sobald ein
  Diagramm Achsen mit Ticks, Legende und Tooltip über mehrere Reihen braucht.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `bars` | `{ label: string; value: number }[]` | ja | Ein Balken je Eintrag, Reihenfolge wie gegeben | `Filled` |
| `format` | `(value: number) => string` | ja | Beträge kommen formatiert vom Formatter (T7), nie lokal | `Filled` |
| `highlight` | `string` | nein | Label des hervorgehobenen Balkens (laufender Monat) | `Highlight` |
| `max` | `number` | nein | Feste Obergrenze, sonst aus den Werten | `Edge` |
| `ariaLabel` | `string` | nein | Was die Reihe zeigt; Standard „Werte je Zeitabschnitt" | `Filled` |

Keine Typen aus `src/ludwig/`: der Aufrufer gibt Label und Zahl, egal aus
welcher Tabelle. `format` kommt aus `src/ui/v3/format.ts` (`formatAmount`)
oder vom Aufrufer.

**Kann bewusst nicht:** mehrere Reihen, Achsen mit Ticks, Linien, Interaktion
(Zoom, Auswahl), gestapelte Balken. Kommt eine dieser Anforderungen, ist das
die Grenze, an der `recharts` hereinkommt — nicht ein zweiter Eigenbau.

## Verhalten

Server-Component: kein Zustand, kein Ereignis, kein `"use client"`.

- **Skala:** die Obergrenze ist `max` oder der größte Betrag der Reihe;
  negative Werte hängen **unter** der Grundlinie, die Grundlinie liegt dort,
  wo die Null liegt.
- **Farbe** (Skill `dataviz`, Schritt 2–3): eine Reihe braucht keine
  kategoriale Palette. Balken `--color-text-subtle` — was keine
  Kritikalitätsstufe trägt, ist grau (V6, A7: auch das Vorzeichen färbt
  nicht). Der hervorgehobene Balken trägt `--color-primary`, und **zusätzlich
  zur Farbe** steht sein Label kräftiger (V7: Farbe nie allein).
  Validiert mit `scripts/validate_palette.js`: Kontrast beide ≥ 3:1 gegen
  `--color-bg` (V10), Unterscheidung normal ΔE 21.8 / CVD ΔE 20.1.
- **Werte als Text:** jeder Balken trägt `title` mit Label und formatiertem
  Wert (Z3, ohne JS); dieselben Werte stehen zusätzlich in einer visuell
  versteckten Tabelle, damit ein Screenreader die Reihe lesen kann.
- **Leer:** keine Einträge oder alle Werte 0 → eine Zeile „Keine Werte im
  Zeitraum." linksbündig (L6, T6), kein leerer Kasten mit Achsen.
- **Zustände:** lädt und Fehler entfallen — die Werte kommen fertig; für die
  Ladezeit steht `Skeleton` an der Aufrufstelle.

## Stories

Titel `v3/Primitives/Daten/BarChart`. Abgeleitet nach §6: 2 Zustände
(gefüllt, leer) + 0 Enum + 1 Layout (`highlight`) + 0 Callback + 1 „im
Einsatz" + 1 Rand = 5.

| Story | Beweist |
|---|---|
| `Filled` | 12 Monate Aufwand, formatiert „1.800,00 €" |
| `Empty` | keine Werte, mit Grund statt leerem Raster |
| `Highlight` | der laufende Monat hervorgehoben, Label kräftiger |
| `InUse` | in einer `Card` neben `KpiTile` |
| `Edge` | negative Werte, ein Ausreißer, 24 Balken |

Nicht anwendbar: `EmptyAfterFilter` (das Diagramm filtert nicht), `Loading`,
`Error` (die Werte kommen fertig vom Aufrufer).

## Abnahme

Abgenommen am 2026-09-05 von einem zweiten Agenten (nicht dem bauenden).
Geprüfter Stand: `e3c38e7`; `BarChart.tsx` und `BarChart.stories.tsx` sind im
Arbeitsbaum unverändert. Gebaut in `ade8573` („Welle C: … Balken je Monat als
Inline-SVG, ohne recharts"), Story nachgezogen in `2272fe4`. Nachweise vom
laufenden Storybook auf Port 6107, gemessen in einer eigenen Chromium-Instanz
(1280 × 900) über SVG-Attribute und `getComputedStyle`.

### Story-Deckung

`index.json` listet genau die fünf abgeleiteten Stories unter
`v3/Primitives/Daten/BarChart`: `--filled`, `--empty`, `--highlight`,
`--in-use`, `--edge` (2 Zustände + 1 Layout + 1 „im Einsatz" + 1 Rand = 5).
Jede Prop hat ihren Nachweis: `bars` und `format` (`Filled`, `euro` aus
`formatAmount`), `highlight` (`Highlight`, zusätzlich in `InUse` und `Edge`),
`max` (`Edge`, zweites Diagramm), `ariaLabel` (`Filled`, im DOM als
`aria-label="Aufwand je Monat"` geprüft; der Default greift in `Empty`).
`EmptyAfterFilter`, `Loading`, `Error` sind oben begründet ausgeschlossen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, Exit 0, zu Beginn und am Ende. `pnpm build` bewusst **nicht** gelaufen (parallele Abnahmen schreiben nach `storybook-static`); der Lauf für diesen Stand war grün — „Storybook build completed successfully". | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/BarChart.tsx` und `BarChart.stories.tsx` nebeneinander; `BarChart.stories.tsx:7` setzt `title: "v3/Primitives/Daten/BarChart"`. Barrel: Gruppenkommentar „Daten — Reihen und Verläufe (0041, 0045)" `index.ts:145`, Export `:146`. Die Gruppe ist neu, wie die Spec sie fordert. | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Ein Funktions-Export: `BarChart` (`BarChart.tsx:33`), `@when` Z. 26–27, `@instead` Z. 28–31 — und der `@instead` benennt ausdrücklich die Grenze zur Diagramm-Bibliothek. Dazu das Interface `Bar` (`:20`). Alles englisch; deutsch nur der Leertext und der Default `ariaLabel` (Nutzertext). | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px" src/ui/v3/primitives/BarChart.tsx` → keine Treffer. `W`/`H`/`GAP` (`:16–18`) sind das **viewBox-Raster**, keine Pixel — der Kommentar sagt es („Not pixels: the SVG scales, the CSS sets the height"), die Höhe steht in `v3.css:1138`. Farben über `--color-text-subtle`/`--color-primary`/`--color-border-strong` (`:1139–1141`). Kein Status, keine Label-Map. | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Siehe „Story-Deckung": fünf von fünf, Ausschlüsse begründet. | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Punkt für Punkt unter dieser Tabelle. | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle fünf Stories geöffnet, gemessen und als Screenshot gesehen; Konsole in allen fünf leer. | ✓ |
| Balken ≥ 3:1 gegen `--color-bg` (gemessen) | Story `--filled`, `getComputedStyle().fill` über alle zwölf Balken: einheitlich `rgb(113, 113, 113)` = `--color-text-subtle` `#717171`. Kontrast gegen `--color-bg` `#FFFFFF` gerechnet: **4,88:1**; der hervorgehobene Balken `--color-primary` `#1A3A5C`: **11,64:1**. Beide über der 3:1-Grenze für Grafikobjekte (V10). Auf dem Storybook-Grund `#F4F6F8` bleiben es 4,51:1 bzw. 10,74:1. (`scripts/validate_palette.js` aus dem `dataviz`-Skill liegt nicht in diesem Repo; direkt nachgerechnet.) | ✓ |
| Jeder Wert als Text erreichbar: `title` am Balken **und** Zeile in der versteckten Tabelle | Story `--filled`, DOM-Probe: jedes `<rect>` trägt ein `<title>` mit Label und formatiertem Wert („Sep: 12.840,50 €"); daneben `div.v2vh > table` mit `<caption>Aufwand je Monat</caption>` und **zwölf** `<tr>` (`Sep` / `12.840,50 €` …), also einer je Balken. Das `<svg>` hat `role="img"` und `aria-label`. Der Befund beim Bauen hält: die Box misst gemessen **1 × 1 px**, die `table` im `div` wächst nicht mehr auf 138 px. | ✓ |
| Negative Werte hängen unter der Grundlinie und tragen dieselbe Farbe | Story `--edge`, erstes Diagramm: Nulllinie bei `y = 41.26` (nicht am unteren Rand `H = 46`); die beiden negativen Balken beginnen genau dort (`Okt` `y=41.26 h=2.67`, `Dez` `y=41.26 h=4.74`) und wachsen nach unten, die positiven enden dort. Farbe aller nicht hervorgehobenen Balken: `rgb(113, 113, 113)` — Vorzeichen färbt nicht (A7). | ✓ |
| `max` deckelt die Skala; ein Wert darüber wird nicht abgeschnitten | Story `--edge`, zweites Diagramm mit `max={20000}`: der Balken zu 12.850,00 € misst `h = 29.55` von `H = 46`, also `12850 / 20000` — die Skala steht auf `max`, nicht auf dem größten Wert (14.810). Gegen das Abschneiden schützt `BarChart.tsx:50`: `Math.max(max ?? 0, ...values.map(Math.abs), 0)` — ein Wert über `max` hebt die Obergrenze, statt aus dem Rahmen zu laufen. | ✓ |
| Leer zeigt einen Satz mit Grund, kein leeres Raster | Story `--empty`: `document.querySelectorAll("svg.v2chart__svg").length` = **0**, sichtbar allein `<p class="v2chart__empty">Keine Werte im Zeitraum.</p>`, gemessen `text-align: start` (L4). Derselbe Zweig greift laut `:51` auch, wenn alle Werte 0 sind. | ✓ |
| Server-Component: die Datei trägt kein `"use client"` | `grep -c '"use client"' src/ui/v3/primitives/BarChart.tsx` → `0`. Kein Hook, kein Handler, kein Ereignis in der Datei. | ✓ |
| `package.json` unverändert — kein `recharts` | `grep -c recharts package.json` → `0`. `git log --oneline -3 -- package.json` zeigt seit dem Bau keinen Diagramm-Eintrag (`f58caa2`, `41a55fc`, `b9988bb` — Icons, Styles, Submodul). | ✓ |
| Der hervorgehobene Balken ist auch ohne Farbe erkennbar (V7) | Story `--highlight`, gemessen: Balken `Aug` trägt `is-now` mit `fill: rgb(26, 58, 92)`, **und** sein Achsenlabel steht auf `font-weight: 600` in `rgb(45, 45, 45)`, während die elf übrigen auf `400` in `rgb(113, 113, 113)` stehen (`v3.css:1147`). Zwei Träger, wie V7 verlangt. | ✓ |

### Prüfliste §9, Punkt für Punkt

- **Stufe und Importe** — ✓ `primitives/`, importiert **nichts** — die Datei
  hat keine `import`-Zeile. Export über `index.ts:146`.
- **Ersetzt ihr v1-Gegenstück (`MonthlyBarChart`)** — offen (App).
- **Kein Hex, kein px, keine Label-Map** — ✓ siehe Tabelle.
- **Text links, Zahlen rechts mit `tnum`, nichts zentriert (V3)** — mit
  Anmerkung: die Achsenbeschriftung steht `text-align: center` unter ihrem
  Balken (`v3.css:1146`). Das ist die eine Stelle, an der Zentrierung nicht
  Ausrichtung, sondern Zuordnung ist — das Label gehört unter die Mitte seines
  Balkens, sonst zeigt es auf den falschen Monat. Kein V3-Verstoß, aber
  bewusst notiert.
- **Zeilenhöhe** — nicht anwendbar.
- **Farbe nur als Kritikalitätsstufe, Rot nur Fehler** — ✓ zwei Farben, beide
  ohne Kritikalität: grau für „ein Wert", `--color-primary` für „dieser
  Abschnitt". Kein Rot, kein Grün, keine kategoriale Palette.
- **Jeder farbige Zustand hat Wort oder Icon (V7)** — ✓ gemessen, siehe
  Tabelle (kräftigeres Label neben der Farbe).
- **Fünf Zustände** — ✓ gefüllt und leer gebaut, drei begründet ausgeschlossen;
  für die Ladezeit verweist die Spec auf `Skeleton` an der Aufrufstelle.
- **Kontrast** — ✓ 4,88:1 und 11,64:1 gerechnet; Nulllinie
  `--color-border-strong` ist dekorativ (§3: „Trennlinie, kein
  Kontrastanspruch").
- **Tastatur / Hover** — nicht anwendbar: nichts ist klickbar, deshalb hat auch
  nichts einen Hover (§2, zweite Hälfte der Regel). Der `title` ist Zugabe,
  nicht der einzige Weg — die versteckte Tabelle trägt dieselben Werte.
- **Icons** — keine.
- **Karte** — ✓ `InUse` setzt das Diagramm in eine `Card` mit `CardHead` neben
  zwei `KpiTile`; das Primitive selbst bringt keine Fläche mit.
- **Texte T1–T5** — ✓ „Keine Werte im Zeitraum." (ein Satz mit Punkt, sagt den
  Grund), „Werte je Zeitabschnitt" als Default-`ariaLabel`; keine Anrede,
  keine Versalien, kein Ausrufezeichen.
- **Story unter `v3/Primitives/Daten/BarChart`** — ✓.
- **In §11 auf v2 gesetzt** — ✓ `docs/design-guidelines.md:479` führt
  `BarChart` unter „Daten" als „v2 (0045, 0046, 0041)"; `:497` hält
  `MonthlyBarChart` als „heben" für die App-Seite fest.

### Anmerkungen des Abnehmenden

1. **`max` ist eine Untergrenze der Obergrenze, keine Kappung.** `:50` nimmt
   `Math.max(max, …Werte)` — genau richtig gegen das Abschneiden, aber das Wort
   „deckelt" im Kriterium liest sich andersherum. Der Fall „ein Wert über
   `max`" hat in `--edge` keinen eigenen Balken (alle 24 Werte liegen unter
   20.000); belegt ist er über den Code. Wer die Story einmal anfasst, kann
   einen Ausreißer über `max` dazunehmen — dann steht auch dafür ein Bild.
2. **Die zweite offene Frage ist im Code entschieden, nicht in der Spec
   vermerkt.** `:99` zeigt ab **mehr als zwölf** Balken jedes zweite Label; die
   offene Frage 2 sagt „bei 24 Balken". Gemessen in `--edge`: bei 24 Balken
   stehen `01`, `03`, `05` … — wie gewollt. Die Schwelle (12) gehört in die
   Antwort auf Frage 2, damit sie nicht nur im Code steht.
3. **Kein `role="img"`-Ersatz nötig, aber die versteckte Tabelle ist der
   eigentliche Nachweis.** Sie trägt Caption, Zeilenkopf und Wert — damit ist
   die Reihe ohne Maus und ohne Farbe lesbar. Gut gelöst; erwähnt, damit es
   beim nächsten Diagramm kopiert und nicht neu erfunden wird.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: keine
(die drei Anmerkungen sind Befunde, keine Mängel dieser Aufgabe)
