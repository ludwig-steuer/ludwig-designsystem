# 0045 · Progress — ein Anteil als Balken, ohne Tabelle drumherum

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` — Gruppe Daten (neben `BarChart`, 0041) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, ein Anteil ist fachfrei |
| Quelle | Sitzung 2026-09-03: „ein Progress kann auch außerhalb einer Zelle sichtbar sein" |
| Ersetzt | `ProgressCell` (`primitives/Cells.tsx`) und zwei Handnachbauten von `v2bar` in `patterns/Review.tsx` und `patterns/StepRail.tsx` |
| Blockiert | Fortschritt im Gruppenkopf von `TodoList`; jede Fläche, die einen Stand zeigt, ohne eine Tabelle zu sein |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Der Balken existierte viermal: einmal als Komponente (`ProgressCell`), einmal
in `FileDrop` (Upload-Zeile, keine Tabelle), und zweimal als Hand-Markup aus
`v2bar`/`v2bar__fill` in `Review` und `StepRail`. Der Name behauptete eine
Zelle, drei von vier Stellen waren keine. Ein Fortschritt ist kein
Tabellen-Ding — er steht in einer Zeile, in einem Schrittkopf, in einem
Gruppenkopf, auf einer Fläche.

## Einordnung

- **Wiederverwenden:** nichts deckt es ab. `BarChart` (0041) zeigt eine
  **Reihe** über die Zeit, `KpiTile` eine Zahl ohne Ganzes,
  `StatusBadge`/`DotStatus` einen Zustand ohne Menge.
- **Umzug statt Neubau:** `ProgressCell` wandert unverändert in
  `primitives/Progress.tsx` und heißt `Progress`. Genau ein fremder Aufrufer
  (`FileDrop`), deshalb **kein Alias** — der alte Name verschwindet.
- **Zuschnitt:** eine Datei, ein Export. Kein `inline`-Prop für „Label neben
  dem Balken": das ist das Layout von `StepRail`, nicht das des Balkens. Der
  Aufrufer setzt `label={null}` und schreibt seine Zahl selbst daneben.
- **Setzt auf:** nichts. Server-Component, zwei `<span>`, CSS aus `v3.css`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `share` | `number` | nein | Anteil 0…1; über 1 wird geklemmt | `Labels`, `Edge` |
| `done` / `total` | `number` | nein | Alternative zu `share`: rechnet den Anteil und schreibt „41 von 118" | `Labels` |
| `size` | `"sm" \| "md" \| "lg"` | nein | Balkenhöhe 4 / 6 / 10 px, Standard `md` | `Sizes` |
| `tone` | `"accent" \| "warning" \| "danger" \| "success"` | nein | Füllfarbe, Standard `accent` | `Labels` |
| `label` | `string \| null` | nein | Eigener Text; `null` blendet die Zeile aus | `Labels`, `WithoutLabel` |

**Kann bewusst nicht:** unbestimmter Fortschritt (Endlos-Animation),
mehrere Segmente in einem Balken, Kreisform. Für „es läuft, Dauer unbekannt"
steht `Skeleton` (0016); für mehrere Anteile nebeneinander `BarChart`.

## Verhalten

- **Label-Vorrang:** `label` schlägt alles; sonst „x von y", wenn `total`
  gesetzt ist; sonst der gerundete Prozentsatz.
- **Klemmen:** `share` außerhalb 0…1 wird geklemmt, `total = 0` ergibt 0 %
  statt `NaN` — ein verrechneter Aufrufer bricht die Zeile nicht auf.
- **Der Balken steht nie allein:** `label={null}` ist nur dort erlaubt, wo
  die Zahl schon danebensteht (`Review`: Zähler links; `StepRail`: Text vor
  dem Balken). Das steht als Regel im Dateikopf, weil es der einzige Weg ist,
  die Komponente unlesbar zu benutzen.

## Stories

Titel `v3/Primitives/Daten/Fortschritt`. Abgeleitet nach §6: 1 Zustand +
1 Enum (`size`) + 1 Layout (ohne Label) + 0 Callback + 1 Rand = 4.

| Story | Beweist |
|---|---|
| `Labels` | Prozent, „x von y", eigenes Label, Ton |
| `Sizes` | sm/md/lg nebeneinander, Label bleibt gleich groß |
| `WithoutLabel` | `label={null}` neben der Zahl, wie in Review und StepRail |
| `Edge` | 0, fertig, über 100 % geklemmt, `total = 0` |

Nicht anwendbar: `Empty`, `Loading`, `Error` — der Anteil kommt fertig vom
Aufrufer; für die Ladezeit steht `Skeleton` an der Aufrufstelle.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px im TSX; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `ProgressCell` existiert nicht mehr: `grep -rn "ProgressCell" src` ist
      bis auf historische Backlog-Dateien leer
- [ ] `Review.tsx` und `StepRail.tsx` enthalten kein `v2bar`-Markup mehr,
      sondern `<Progress label={null} />`
- [ ] `done`/`total` rechnet den Anteil selbst; kein Aufrufer dividiert
      (Story `Labels`)
- [ ] `total = 0` und `share = 1.4` zeichnen einen gültigen Balken
      (Story `Edge`)
- [ ] `size` ändert nur die Balkenhöhe, nicht die Labelgröße (Story `Sizes`)
- [ ] Server-Component: die Datei trägt kein `"use client"`

## Befund beim Bauen (2026-09-03)

- Der Umzug **löscht** mehr als er hinzufügt: `Review.tsx` und `StepRail.tsx`
  verlieren ihr Hand-Markup, `StepRail` zusätzlich die eigene
  `Math.max/min`-Klemmung. `Progress.tsx` ist die einzige Stelle, die noch
  weiß, wie ein Anteil in eine Breite umgerechnet wird.
- `FileDrop` bleibt bei `size` unverändert (Standard `md`), damit der Umzug
  keine Optik ändert, die niemand bestellt hat. Die schmale Fortschritts-
  spalte dort ist ein Layout-Thema von 0021, nicht von dieser Aufgabe.
- Kein `role="progressbar"`/`aria-valuenow`: solange das Label steht, liest
  ein Screenreader den Stand als Text. Nachrüsten, sobald `label={null}`
  produktiv in einer Zeile steht, deren Zahl nicht im selben Row liegt.
- Im Browser gesehen (Storybook 6107): `Labels`, `Sizes`, `WithoutLabel`,
  `Edge` sowie die beiden umgestellten Aufrufer
  `v3-patterns-frame-steprail--screen-header` und
  `v3-patterns-prüfen-checklist--filled` — unverändert zum Stand davor.
