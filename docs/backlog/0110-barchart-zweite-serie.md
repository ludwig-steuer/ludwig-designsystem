# 0110 · `BarChart` kann nur eine Serie — die App zeigt zwei und eine Linie

| | |
|---|---|
| Status | in Arbeit |
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
- **Die Tabelle unter dem Bild** bekommt je Größe eine Spalte, mit den
  Wörtern als Kopf. Sie ist der Ort, an dem die Zahlen ohne Maus stehen.
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
