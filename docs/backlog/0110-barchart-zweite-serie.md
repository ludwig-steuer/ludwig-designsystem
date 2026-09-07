# 0110 · `BarChart` kann nur eine Serie — die App zeigt zwei und eine Linie

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/BarChart.tsx` |
| Quelle | App-Migration E1.2 (2026-09-06, `designsystem-f0`): `BarChart` (0041) ist nicht formgleich zu `MonthlyBarChart` der App |
| Ersetzt | `ui/components/primitives/MonthlyBarChart.tsx` — **beide** Aufrufer: das Dashboard und `accounts/[accountNumber]` (Kontoblatt) |
| Auftrag | `BarChart` nimmt `bars` mit **einem** `value`. Beide App-Aufrufer zeigen zwei Serien (`secondary`), das Kontoblatt zusätzlich eine Saldo-Linie (`line`) und `layout="grouped"`. Ohne diese drei Dinge kann die Migrationsgruppe den Baustein nicht übernehmen. |
| Spec von / am | Claude, 2026-09-06 |

## Ziel

Formgleichheit, nicht mehr. Der Baustein bleibt, was 0041 aus ihm gemacht hat
— Inline-SVG, Server-Component, keine Bibliothek —, und bekommt genau das,
was die zwei Aufrufstellen brauchen: eine zweite Serie, ein Layout dafür und
eine Referenzlinie auf **derselben** Achse.

Was er **nicht** bekommt, obwohl die App es hat: den Kopf mit `unitLabel` und
den Hover-Readout im Kartenkopf. Der Kopf gehört der Karte (0041,
„Einordnung"), und der Hover-Wert steht schon im `<title>` jedes Balkens und
in der Tabelle darunter — zweimal dieselbe Information an zwei Orten wäre
die Dopplung, die 0041 vermeiden wollte.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `bars[].secondary` | `number` | nein | Der zweite Wert desselben Abschnitts | `TwoSeries` |
| `layout` | `"stacked" \| "grouped"` | nein, Default `stacked` | `stacked`: der zweite Wert sitzt **auf** dem ersten — Anteile einer Summe. `grouped`: zwei Balken nebeneinander — zwei eigenständige Größen. Soll und Haben sind keine Anteile voneinander | `Grouped` |
| `line` | `readonly number[]` | nein | Eine Referenzlinie auf **derselben** Achse, ein Wert je Balken (laufender Saldo). Bewusst **keine zweite Y-Achse**: zwei Skalen in einem Bild lassen sich nicht ehrlich vergleichen | `WithLine` |
| `primaryLabel` · `secondaryLabel` · `lineLabel` | `string` | nein | Die Wörter der drei Größen — sie stehen im `<title>` und in der Tabelle. Ohne sie steht dort nur der Wert | `TwoSeries`, `WithLine` |

**Kann bewusst nicht:**

- **Zwei Y-Achsen.** Der Satz stammt aus der App und bleibt: zwei Skalen in
  einem Bild vergleichen sich nicht ehrlich.
- **Eine dritte Serie.** Zwei sind die Grenze, ab der eine Legende nötig wird
  — und eine Legende ist die Grenze zur Bibliothek (0041).
- **Einen Kopf tragen.** `unitLabel` bleibt draußen; der Kopf ist die Karte.
- **Hovern statt lesen.** Der Wert steht im `<title>` und in der Tabelle.

## Verhalten

- **Die Skala teilen sich alle drei.** Das Maximum ist bei `stacked` die
  Summe je Abschnitt, bei `grouped` der größere der beiden Werte — und in
  beiden Fällen zusätzlich das Maximum der Linie. Die Null bleibt, wo sie ist.
- **Farbe:** die erste Serie behält ihr Grau (V6 — ein Wert trägt keine
  Kritikalität), die zweite ein helleres Grau derselben Familie. Die Linie
  trägt `--color-accent`: sie ist keine Serie, sondern ein Bezug, und darf
  sich unterscheiden. Der hervorgehobene Balken bleibt `--color-primary`.
- **Die versteckte Tabelle** (`.v2vh`, aus 0041) bekommt je Größe eine
  Spalte, mit den Wörtern als Kopf. Sie ist der Ort, an dem ein Screenreader
  die Reihen liest; sichtbar ist sie nicht, und eine Legende bleibt
  ausgeschlossen (0041).
- **Gemischte Vorzeichen im Stapel:** ist `secondary` negativ und `value`
  positiv, wächst jeder Teil von der Null auf **seine** Seite, statt sich
  gegenseitig aufzuheben. Die Skala nimmt beide Seiten getrennt auf.
- Zustände: gefüllt · leer (der Satz aus 0041). Lädt und Fehler gehören dem
  Aufrufer.

## Stories

Drei kommen dazu, die vorhandenen bleiben.

| Story | Beweist |
|---|---|
| `TwoSeries` | `secondary` gestapelt, beide Wörter im `title` und in der Tabelle |
| `Grouped` | `layout="grouped"` — zwei Balken je Abschnitt, nebeneinander |
| `WithLine` | `line` mit `lineLabel`, eine Skala für Balken und Linie |

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` am Export
- [ ] Kein Hex, kein px in der Komponente
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] `secondary` sitzt bei `stacked` **auf** dem ersten Wert, bei `grouped` daneben (beide Stories, im DOM gemessen)
- [ ] Balken und Linie teilen **eine** Skala — die Linie verlässt das Bild nicht (Story `WithLine`, gemessen)
- [ ] Die Tabelle unter dem Bild führt jede Größe mit ihrem Wort
- [ ] Ohne die neuen Props zeichnet der Baustein wie zuvor (die vorhandenen Stories unverändert)
- [ ] Der hervorgehobene Balken bleibt erkennbar, auch mit zweiter Serie
- [ ] offen (App): ersetzt `MonthlyBarChart` in Dashboard und Kontoblatt

## Abnahme (2026-09-07)

Gemessen im Storybook-Dev (Port 6107) über CDP, Fenster 1366 px. Alle Höhen gegen
die Breite **auf der Seite**: das SVG misst in den drei neuen Stories 678 px
(Karte `maxWidth: 720`), bei 620 px Fenster 546 px, bei 375 px Fenster 301 px —
kein Überlauf (`scrollWidth` = `innerWidth`). Der Maßstab ist unabhängig
gegengeprobt: `height="10"` zur Laufzeit gesetzt misst 20,87 px, `height="23"`
misst 48,00 px — 96 px je 46 viewBox-Einheiten, die Messung reagiert also.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | Exit 0. `check:when`, `check:language`, `check:icons`, `check:contrast`, `check:mirror` ebenfalls Exit 0 | ja |
| `pnpm build` grün | nicht gelaufen — parallele Prüfer, `storybook-static/` (0117) | offen |
| Code englisch; `@when`/`@instead` | `BarChart.tsx:41–49`; `check:when` und `check:language` Exit 0 | ja |
| Kein Hex, kein px in der Komponente | `BarChart.tsx` führt nur viewBox-Einheiten (`W 100`, `H 46`, `GAP 0,22`, `INNER 0,08`); Farben und Pixel stehen in `v3.css:1288–1311` | ja |
| Im Browser angesehen | acht Stories im Katalog, alle gemessen, drei fotografiert | ja |
| `secondary` bei `stacked` **auf** dem ersten Wert | `--two-series`, SVG 678 px: Mär 1. Reihe y 155,51 h 47,77 → Unterkante 203,28 = Nulllinie; 2. Reihe y 120,44 h 35,06 → Unterkante 155,50, also genau auf der Oberkante der ersten. Rechnung: Skala = Summenmaximum Aug 16.920,55 €; 8.420,50/16.920,55·96 = 47,77 ✓, 6.180,00 → 35,06 ✓; alle zwölf Rechtecke stimmen auf ±0,01 px | ja |
| `grouped` daneben | `--grouped`: Skala = größter Einzelwert 10.260,30 €. Mär Soll 8.420,50 → 78,79 px ✓, Haben 6.180,00 → 57,82 px ✓; Mai Soll = 96,00 px (Vollausschlag) ✓. Nebeneinander: Balken 43,80 px, Rasterlücke 0,54 px, sichtbar getrennt gemessen im Bild (dsf 3): Füllung endet bei x 93,33, beginnt bei 94,33 — **1,0 px weiß**. Bei 620 px Fenster 0,44 px Raster + 0,5 px Strich | ja |
| Balken und Linie teilen **eine** Skala, die Linie verlässt das Bild nicht | `--with-line`: y = 203,28 − Wert/10.260,30·96 für alle sechs Punkte — Mär 2.240,50 → 182,32 ✓, Apr 20,25 → 203,09 ✓, Jul 4.650,30 → 159,77 ✓. Höchster Punkt y 159,77, tiefster 203,09, SVG 107,28–203,28: innerhalb. **Aber** die Story prüft den Fall nie, in dem die Linie das Balkenmaximum überschreitet (M4b) | ja, aber nicht ausgereizt |
| Die Tabelle führt jede Größe mit ihrem Wort | Zugänglichkeitsbaum `--with-line`: `columnheader` Zeitabschnitt · Soll · Haben · Saldo, sechs Zeilen mit `rowheader` und drei Zellen; dazu `graphics-symbol` je Abschnitt („Mär: Soll 8.420,50 € · Haben 6.180,00 €") und die Linie („Saldo: Mär 2.240,50 € · Apr 20,25 € · …"). Ein Screenreader unterscheidet die Reihen am Wort, nicht an der Farbe (V7) | ja |
| Ohne die neuen Props wie zuvor | `--filled`, `--highlight`, `--in-use`, `--edge` gemessen: Titel weiter „Sep: 12.840,50 €" ohne Wort, Tabelle ohne `thead`. `--edge`: Nulllinie bei 102,11 px = 28.400/31.660,75·96 unter der Oberkante, negative Balken hängen darunter (Okt −1.840,50 → 5,58 px ab Nulllinie ✓), Vorzeichen färbt nicht | ja |
| Hervorgehobener Balken bleibt erkennbar | `--two-series` Aug: `#1A3A5C` (11,64:1 gegen Weiß) und `#2B5C8E` (6,94:1); gegen die Nachbarn ΔE 21,8 bzw. 19,4. Dazu das Label: `#2D2D2D`/600 statt `#717171`/400 — Farbe steht nicht allein (V7) | ja |
| Serienfarben gegen den Grund | aus den gerenderten Füllungen nachgerechnet: `#717171` 4,88:1, `#8A8A8A` 3,45:1 gegen `#FFFFFF` — beide ≥ 3:1. Gegeneinander 1,41:1 / ΔE 8,48; getrennt durch die Haarlinie, im Bild gemessen 1,0 px Weiß zwischen den Flächen. Die Zahlen in `v3.css:1285–1289` und `design-guidelines.md:110` stimmen (ΔE 8,48 → „8,5"; `#1A3A5C`/`#2D2D2D` ΔE 8,41 → „8,4") | ja |
| ersetzt `MonthlyBarChart` (App) | Auftrag der Migrationsgruppe | offen |

Prüfliste §9 im Übrigen ohne Befund: eine Stufe (`primitives/`), Export über das
Barrel (`index.ts:150`), keine lokale Label-Map, kein eigener Status-Text, kein
Icon, nichts Klickbares, keine Bewegung, Leertext „Keine Werte im Zeitraum." (T1–T5),
Story unter `v3/Primitives/Daten/BarChart`, §11 auf 0110 gesetzt
(`design-guidelines.md:481`). Übersprungen sind die zwei App-Punkte
(v1-Gegenstück ersetzen, Aufrufer umstellen).

**Story-Deckung.** Acht Stories, genau die Ableitung aus `spec-schreiben` §6:
zwei Zustände (gefüllt, leer — lädt und Fehler mit Grund ausgeschlossen, sie
„gehören dem Aufrufer") + 1 je Enum-Prop (`layout` → `Grouped`) + 1 im Einsatz +
1 Rand + je eine für `highlight`, `secondary` samt Wörtern und `line` samt
`lineLabel` = 8, unter der Obergrenze 10. Jede Prop hat ihre Story, `max` in
`Edge` (20.000). Lücke: der Rand deckt nur die alte Achse ab (siehe M4).

### Mängel

**M1 — die Bezugslinie hat über den Balken keinen Kontrast.**
`src/ui/v3/primitives/BarChart.tsx:168–188` (die `polyline` wird **nach** den
Balken gezeichnet), Farbe `src/styles/v3.css:1303`. Story
`v3-primitives-daten-barchart--with-line`, SVG 678 px, Screenshot dsf 3:
**74 % der Linie (419 von 565 abgetasteten Spalten) liegen auf einer
Balkenfläche** — 202 Spalten über `#8A8A8A` (**1,03:1**, ΔE 11,4), 155 über
`#717171` (**1,37:1**, ΔE 13,5), 43 über `#1A3A5C` (3,28:1). Pixel bei x 110:
(138,138,138) → (59,143,196) → (138,138,138). Soll ≥ 3:1 (§9 „Rahmen/Icons ≥ 3:1",
WCAG 1.4.11) bzw. ΔE ≥ 15 nach dem `dataviz`-Maß, das die Vorabnahme an M1
angelegt hat. Gegen Weiß misst die Linie 3,55:1 — nur ist der Grund zu drei
Vierteln kein Weiß, und eine sichtbare Legende ist ausgeschlossen, also gibt es
keinen Ersatzkanal. Das ist strukturell, nicht datenabhängig: ein laufender Saldo
auf derselben Achse liegt immer dann in den Balken, wenn er unter ihren Spitzen
steht. Kleinster Weg: dieselbe Lösung wie bei der zweiten Reihe — eine zweite
`polyline` mit denselben Punkten in `--color-surface`, `stroke-width` etwa 3,5,
`non-scaling-stroke`, **vor** der Akzentlinie gezeichnet; dann liegt die Linie
nirgends an einer Balkenfläche an.

**M2 — die Haarlinie verschluckt den Mindestbalken der zweiten Reihe.**
`BarChart.tsx:114` (`Math.max(…, 0.4)`) gegen `v3.css:1294` (`stroke-width: 1`).
Gemessen in `--grouped` bei dsf 4, beide Rechtecke zur Laufzeit auf die
0,4-Mindesthöhe gesetzt (0,83 px): die **erste** Reihe zeigt noch Füllung —
(113,113,113) bei y 202,25 —, die **zweite** kein einziges Füllpixel, nur Weiß
und die Nulllinie (196,204,213). Der 1-px-Strich frisst 0,5 px je Kante, also
alles unter 1 px Höhe. Konkret: bei der Skala der Story (10.260,30 € auf 96 px)
verschwindet jeder zweite Wert unter rund 107 €, während derselbe Wert in der
ersten Reihe einen Strich zeigt. Der Kommentar in `v3.css:1283–1285` beansprucht
genau diesen Schutz, gibt ihn aber nur der ersten Reihe. Kleinster Weg: den
Strich weglassen, wo die gezeichnete Höhe auf dem 0,4-Boden sitzt — eine
Bedingung an der Klasse des zweiten `rect`.

**M3 — der zweite Balken trägt keinen Tooltip, und die Gruppe trägt ihn nicht
stattdessen.** `BarChart.tsx:141–164`: der `<title>` hängt am ersten `<rect>`,
das umschließende `<g>` hat keinen. Gemessen mit `elementFromPoint` in der Mitte
des zweiten Balkens (beide Stories): getroffen wird
`rect.v2chart__bar--second`, und die Kette bis zum `svg` führt kein `<title>` —
mit der Maus ist die rechte Hälfte jeder Gruppe stumm. Die Notiz zu M4 der
Vorabnahme sagt „die Gruppe trägt den ganzen Abschnitt"; im DOM tut sie es
nicht. Kleinster Weg: den `<title>` vom ersten `<rect>` an das `<g>` hängen —
eine Zeile, der Zugänglichkeitsbaum bleibt gleichwertig.

**M4 — zwei Sätze im Verhalten der Spec haben keine Story.**
(a) Gemischte Vorzeichen im Stapel (positiver `value`, negatives `secondary`):
im Code richtig gerechnet (`BarChart.tsx:92–95` und `:139`), aber in keiner
Story — also nicht messbar, obwohl die Spec den Fall seit der Vorabnahme führt.
(b) „in beiden Fällen zusätzlich das Maximum der Linie": in `WithLine` liegt das
Linienmaximum (4.650,30 €) bei 45 % des Balkenmaximums (10.260,30 €), die Skala
wird von der Linie also nie gefordert; das Kriterium „die Linie verlässt das
Bild nicht" besteht dort trivial. Kleinster Weg: ein Balkenpaar mit negativem
`secondary` in `Edge` und ein Linienwert über dem Balkenmaximum in `WithLine`.

**Urteil: zurück.** M1 ist ein gemessener Kontrastmangel derselben Klasse, die
die Vorabnahme für die Balken behoben hat, und trifft die neue Bezugslinie über
drei Viertel ihrer Länge; M2 und M3 sind kleine Zeichenfehler an der neuen
zweiten Reihe, M4 schließt die Beweislücke. Alles andere — Geometrie, Skala,
Tabelle, Wörter, Hervorhebung, unverändertes Verhalten ohne die neuen Props —
ist nachgerechnet und stimmt.

Abgenommen von / am: — (zurück am 2026-09-07, Claude, fremde Abnahme) ·
Offene Punkte: M1–M4, dazu `pnpm build` (nicht gelaufen) und das App-Kriterium.

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — die zwei Reihen waren an ihrer Kante nicht zu unterscheiden.** Gemessen
ΔE 8,5 und 1,41:1 zwischen `--color-text-subtle` und `--color-border-control`,
unter der Grenze des `dataviz`-Skills. Die Farben zu spreizen geht **nicht**:
jede hellere Graustufe fällt unter 3:1 gegen Weiß, jede dunklere kommt der
Marke zu nah (`--color-text` gegen `--color-primary` misst ΔE 8,4 — dann
verschwände die Hervorhebung). Das Band ist zu schmal für zwei Reihen.

Deshalb trennt eine **Haarlinie in der Flächenfarbe** die beiden statt der
Farbe: berühren sie sich nicht, sind sie im Sinne von 1.4.11 keine
benachbarten Flächen mehr, und jede für sich hält ihre 3:1. Sie liegt nur an
der zweiten Reihe, damit ein Balken nahe null (die 0,4-Mindesthöhe aus 0041)
nicht zu weißem Strich wird — die erste Reihe behält ihre Kante.

**M2 — der Zwischenraum bei `grouped` war subpixelig.** `INNER` liegt im
viewBox-Raster und schrumpft mit der Breite. Dieselbe Haarlinie erledigt es:
sie ist `non-scaling-stroke` und bleibt in Pixeln konstant. Gemessen bei
678 px SVG-Breite: 0,54 px Raster-Lücke plus 0,5 px Strich je Seite.

**M3 — die drei neuen Stories rendern über die volle Breite.** Sie hatten
keine Klammer und liefen auf 1366 px; jetzt `maxWidth: 720` wie `InUse`
(gemessen 678 px SVG).

**M4 — der zweite `title` wiederholte den ersten, die Linie trug keinen
Wert.** Der zweite Balken hat jetzt gar keinen `title` — die Gruppe trägt den
ganzen Abschnitt —, und die Linie nennt Wort **und** alle Werte: „Saldo: Mär
2.240,50 € · Apr 20,25 € · …".

**M5 — die Rollentabelle kannte die Diagrammreihe nicht.** §3 hat jetzt eine
Zeile „Diagrammreihe" mit dem gemessenen Grund, warum die beiden eng liegen
und wie sie getrennt werden; die Blocküberschrift in `v3.css` und §11 nennen
0110.

**M6** (die Tabelle liegt in `.v2vh`, ist also nur für Screenreader da) ist
keine Änderung dieser Aufgabe: der Satz der Spec ist ungenau, die Sache
stammt aus 0041, und eine sichtbare Legende hat 0041 ausdrücklich
ausgeschlossen. Die Spec sagt jetzt „versteckte Tabelle".

**Beobachtung des Abnehmenden übernommen:** der gemischte Stapelfall
(positiver `value`, negatives `secondary`) rechnet richtig, stand aber weder
in der Spec noch in einer Story — er ist jetzt im Verhalten benannt.

## Nach der Abnahme (2026-09-07)

Die Abnahme hat jede Balkenhöhe gegen ihre Zahl nachgerechnet — alle stimmen
auf ±0,01 px. Zurück kam sie an drei Stellen, alle behoben.

**M1 — die Bezugslinie war über den Balken praktisch unsichtbar.** Gegen Weiß
misst die Akzentfarbe 3,55:1; **74 % der Linie** liegen aber auf einer
Balkenfläche, und dort waren es **1,03:1** über `border-control` und **1,37:1**
über `text-subtle`. Sie bekommt jetzt einen Saum: eine zweite Polyline in der
Flächenfarbe (3,5 px) unter der Akzentlinie — dieselbe Haarlinien-Lösung, die
schon die zwei Reihen trennt. Gemessen: `rgb(255,255,255)` bei 3,5 px unter
`rgb(59,143,196)` bei 1,5 px, beide auf denselben Punkten. Der Saum trägt keine
Bedeutung und ist `aria-hidden`.

**M2 — die Haarlinie verschluckte den Mindestbalken der zweiten Reihe.** Bei
0,4 px Mindesthöhe deckt die 1-px-Linie an jeder Kante den Balken vollständig
ab: in der Story verschwand damit jeder zweite Wert unter rund 107 €. Die
zweite Reihe hat jetzt 2,4 px Mindesthöhe — so viel, wie die Linie oben und
unten wegnimmt.

**M3 — der zweite Balken trägt seinen Tooltip.** Das `<title>` hing am ersten
`<rect>`; die Maus über dem zweiten Balken fand auf dem ganzen Weg bis zum
`svg` keinen. Gemessen: **6 von 6** zweiten Balken haben jetzt einen.

**M4 bleibt offen:** zwei Verhaltenssätze der Spec haben keinen Nachweis —
gemischte Vorzeichen im Stapel, und „zusätzlich das Maximum der Linie" besteht
trivial, weil das Linienmaximum bei 45 % des Balkenmaximums liegt. Beides sind
Story-Ergänzungen, keine Reparaturen.
