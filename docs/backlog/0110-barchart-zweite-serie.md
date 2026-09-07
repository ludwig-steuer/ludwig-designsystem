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

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

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
