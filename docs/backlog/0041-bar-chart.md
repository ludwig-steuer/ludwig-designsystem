# 0041 · BarChart — Balken je Zeitabschnitt, eine Reihe

| | |
|---|---|
| Status | Abnahme |
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

- [ ] Balken ≥ 3:1 gegen `--color-bg` (Story `Filled`, gemessen)
- [ ] Jeder Wert ist als Text erreichbar: `title` am Balken **und** Zeile in
      der versteckten Tabelle (Story `Filled`, DOM-Probe)
- [ ] Negative Werte hängen unter der Grundlinie und tragen dieselbe Farbe
      wie positive (Story `Edge`)
- [ ] `max` deckelt die Skala; ein Wert darüber wird nicht abgeschnitten
      gezeichnet (Story `Edge`)
- [ ] Leer zeigt einen Satz mit Grund, kein leeres Raster (Story `Empty`)
- [ ] Server-Component: die Datei trägt kein `"use client"`
- [ ] `package.json` unverändert — kein `recharts`
- [ ] Der hervorgehobene Balken ist auch ohne Farbe erkennbar (Story
      `Highlight`, V7)

## Befund beim Bauen (2026-09-03)

Die versteckte Tabelle steht in einem `div.v2vh`, nicht in einer
`table.v2vh`: eine Tabelle ignoriert `width: 1px` und wuchs auf 138 px
Boxbreite an (sichtbar war sie durch `clip-path` trotzdem nicht). Im `div`
misst die Box 1 × 1 px, wie es die Klasse verspricht.

## Offene Fragen

1. Zeigt das Diagramm die Werte als Zahlen über den Balken? *Ohne Antwort:
   nein — 12 Zahlen über 12 Balken sind eine Tabelle, keine Form; der Wert
   steht im `title` und in der versteckten Tabelle (`dataviz`: „never a number
   on every point").*
2. Wie viele Labels stehen unter der Achse, wenn es eng wird? *Ohne Antwort:
   alle — bei 24 Balken schrumpft die Schrift nicht, die Labels stehen jedes
   zweite; der Rest bleibt im `title`.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
