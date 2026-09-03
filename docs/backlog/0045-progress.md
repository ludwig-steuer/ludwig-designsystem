# 0045 · Progress — ein Anteil als Balken, ohne Tabelle drumherum

| | |
|---|---|
| Status | fertig |
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

## Abnahme

Abgenommen am 2026-09-03 von einem zweiten Agenten (nicht dem bauenden).
Geprüfter Stand: `2272fe4` („0045 gebaut") plus `3dce35f` (Label-Fix, siehe
Anmerkung 2). Storybook-Nachweise aus dem laufenden Dev-Server auf Port 6107.

| Kriterium | Ergebnis | Nachweis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | ✓ | `pnpm typecheck` → `tsc --noEmit`, Exit 0. `pnpm build` → „Storybook build completed successfully", Exit 0. Zweimal gelaufen: auf `2272fe4` und nach `3dce35f`, beide Male grün. |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | ✓ | `src/ui/v3/primitives/Progress.tsx` und `src/ui/v3/primitives/Progress.stories.tsx` liegen nebeneinander; `Progress.stories.tsx:5` setzt `title: "v3/Primitives/Daten/Fortschritt"`. Export in `src/ui/v3/index.ts:136` unter der Rubrik „Daten" (`index.ts:134`). |
| Code englisch; `@when`/`@instead` an jedem Export | ✓ | Genau ein Export: `Progress` (`Progress.tsx:18`), `@when` in Z. 14, `@instead` in Z. 15–16. Props, Typen und alle Kommentare englisch. Deutsch nur in den ausgegebenen Strings (`"… von …"`, `Progress.tsx:42`) und in den Story-Doks — beides Nutzertext. |
| Kein Hex, kein px im TSX; Status nur über Registry | ✓ | `Progress.tsx:49` setzt als einziges Inline-Maß `width: <pct>%`. Höhen 4/6/10 px stehen in `src/styles/v3.css:875` (md), `:886` (sm), `:887` (lg); Farben über `--color-accent` / `-warning` / `-danger` / `-success` (`v3.css:876–879`). Kein Status und keine Label-Map — `tone` ist eine Kritikalitätsstufe. px in der Story nur als Grid-Vorlage `Table cols="220px 1fr"` (`Progress.stories.tsx:12`), die Konvention aller v3-Stories (vgl. `Amount.stories.tsx:124`). |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | ✓ | `curl localhost:6107/index.json` listet genau vier Einträge unter `v3/Primitives/Daten/Fortschritt`: `v3-primitives-daten-fortschritt--labels`, `--sizes`, `--without-label`, `--edge`. Ausschluss von `Empty`/`Loading`/`Error` mit Grund in dieser Spec, Z. 72–73. |
| Prüfliste `design-guidelines.md` §9 durchgegangen | ✓ | Punkt für Punkt unter dieser Tabelle. Vier Punkte sind für ein nicht bedienbares Primitive nicht anwendbar, einer ist „offen (App)". |
| Im Browser angesehen (Storybook), nicht nur gebaut | ✓ | Alle vier Stories per Iframe (`http://localhost:6107/iframe.html?id=…&viewMode=story`) geöffnet, gemessen und als Screenshot gesehen; dazu die beiden umgestellten Aufrufer `v3-patterns-frame-steprail--screen-header` (Balken 120 px breit, Füllung 34,7 %) und `v3-patterns-prüfen-checklist--filled` (Zähler links, Balken labelfrei). Konsole in allen sechs Stories ohne Fehler und ohne Warnung. |
| `ProgressCell` existiert nicht mehr | ✓ | `git grep -n "ProgressCell" HEAD -- src` → keine Treffer. Entfernt in `2272fe4` (`src/ui/v3/primitives/Cells.tsx`, −25 Zeilen); `Cells.stories.tsx:11` importiert stattdessen `Progress`. Treffer bleiben nur in Backlog-Dateien. |
| `Review.tsx` und `StepRail.tsx` ohne `v2bar`-Markup, dafür `<Progress label={null} />` | ✓ | `grep -rn "v2bar" src` trifft im TSX nur noch `Progress.tsx:46,48,52`, sonst allein `src/styles/v3.css`. `Review.tsx:151` ruft `<Progress share={row.progress} tone={…} label={null} />`, `StepRail.tsx:231` ruft `<Progress done={done} total={total} label={null} />`. `StepRail` hat zusätzlich seine eigene `Math.max/min`-Klemmung verloren (Diff `2272fe4`, −1 Zeile). |
| `done`/`total` rechnet den Anteil selbst; kein Aufrufer dividiert | ✓ | Rechnung an einer Stelle: `Progress.tsx:37`. Im Browser ergibt `done={41} total={118}` (Story `--labels`) `style="width: 34.7458%"` und das Label „41 von 118" — der Aufrufer übergibt nur die beiden Zahlen. `grep -rn "/ *total" src/ui/v3` findet außer `Progress.tsx` keinen Divisor. |
| `total = 0` und `share = 1.4` zeichnen einen gültigen Balken | ✓ | Story `--edge`, im Browser gemessen: `share={1.4}` → `width: 100%`, Füllkante genau auf der Spurkante (Überstand 0 px), Label „100 %". `total={0}` → `width: 0%`, Label „0 von 0"; Prüfung des Zeilentexts und der Breite auf `NaN`/`Infinity`/`undefined` in allen vier Zeilen: `false`. |
| `size` ändert nur die Balkenhöhe, nicht die Labelgröße | ✓ | Story `--sizes`, `getComputedStyle` je Zeile: `v2bar v2bar--sm` = 4 px, `v2bar` = 6 px, `v2bar v2bar--lg` = 10 px; `.v2bar__label` in allen drei Zeilen 11 px. Unterschied auch im Screenshot deutlich. |
| Server-Component: die Datei trägt kein `"use client"` | ✓ | `git show 2272fe4:src/ui/v3/primitives/Progress.tsx \| grep -c "use client"` → `0`. Die Datei beginnt in Z. 1 mit dem Dateikopf-Kommentar; kein Hook, kein Handler. |

### Prüfliste §9, Punkt für Punkt

- **Stufe und Importe** — ✓ `primitives/`, importiert nichts aus `patterns/`
  oder `entities/`, kennt kein Fachmodul; Export über `src/ui/v3/index.ts:136`.
- **Ersetzt ihr v1-Gegenstück** — offen (App): die Ablösung in `ludwig/app`
  ist laut `docs/backlog/README.md` ein eigener Schritt. Innerhalb dieses
  Repos ist die Ablösung vollzogen (`ProgressCell` gelöscht, kein Alias).
- **Kein Hex, kein px außerhalb der CSS, keine Label-Map, kein Status-Text**
  — ✓ siehe Tabelle.
- **Text links, Zahlen rechts mit `tnum`** — ✓ mit Anmerkung: `.v2bar__label`
  ist eine Bildunterschrift unter dem Balken, links, ohne `tnum`
  (`v3.css:882`). Wo der Stand eine Zahlenspalte ist, steht er in `v2num`
  (Story `--without-label`, `Progress.stories.tsx:89,94`).
- **Zeilenhöhe ≤ `.v2tbl__row`** — ✓ in `v3-patterns-prüfen-checklist--filled`
  sind Zeilen mit und ohne Balken gleich hoch; der Balken baut 6 px + 3 px
  Abstand + 11 px Label.
- **Farbe nur als Kritikalitätsstufe, Rot nur Fehler** — ✓ `tone` kennt vier
  Stufen und keine freie Farbe; `danger` steht in der Story auf „2 Belege
  fehlen".
- **Jeder farbige Zustand hat Wort oder Icon** — ✓ das Label trägt den Wert;
  bei `label={null}` trägt ihn die Zahl daneben. Genau das ist die Regel im
  Dateikopf (`Progress.tsx:6–8`).
- **Fünf Zustände** — ✓ gefüllt, leer (`share={0}`), Rand (`--edge`);
  `Loading`/`Error`/leer-nach-Filter begründet ausgeschlossen (Z. 72–73).
- **Kontrast** — ✓ Füllung `#3B8FC4` gegen Spur `#ECEFF3` = 3,08:1, über der
  3:1-Grenze für Grafikobjekte, aber knapp; Label `--color-text-subtle`
  `#717171` = 4,88:1 auf Weiß. Kein Fokusring nötig.
- **Tastatur / Hover** — nicht anwendbar: nichts ist bedienbar.
- **Icons** — nicht anwendbar: keine.
- **Karte** — nicht anwendbar: Primitive ohne eigene Fläche.
- **Texte T1–T5** — ✓ „41 von 118", „72 %"; keine Anrede, keine Versalien.
- **Story im richtigen Pfad** — ✓ `v3/Primitives/Daten/Fortschritt`.
- **In der Registry auf v2 gesetzt** — ✓ `docs/design-guidelines.md:449`
  führt `Progress` unter „Daten"; die Zeile „Tabelle" verlor `ProgressCell`
  (`:279`, `:448`).

### Anmerkungen des Abnehmenden

1. **Kein `role="progressbar"`.** Der Befund beim Bauen (Z. 109–111) hält
   stand: solange das Label steht, liest ein Screenreader den Stand als Text.
   Bei `label={null}` in `StepRail` liegt die Zahl im selben `.abn__progress`,
   bei `Review` in derselben Zeile. Nachzurüsten, sobald das nicht mehr gilt —
   kein Mangel dieser Aufgabe.
2. **`3dce35f` gehört hierher.** Beim Prüfen fiel auf, dass `.v2bar__label` in
   einem Versalienkopf (`v2lp__grp`, `TodoList`) die Kopfschrift erbte: aus
   „1 von 3" wurde „1 VON 3". `v3.css:882–885` setzt jetzt `font-weight: 400`,
   `text-transform: none`, `letter-spacing: normal` — ein Stand ist ein Wert,
   keine Überschrift. Die Größen-Modifier sind unverändert.
3. **0046 hebt eine Zuschnitt-Entscheidung von hier wieder auf.** Noch
   während dieser Abnahme entstand `docs/backlog/0046-progress-inline.md` und
   ergänzte in `bd1eb6a` genau das `inline`-Prop, das die Einordnung oben
   (Z. 30–32) ausgeschlossen hatte. Das ist eine Entscheidung von 0046 und
   wird dort abgenommen; jede Zeile der Tabelle oben bezieht sich auf den
   Stand `2272fe4` + `3dce35f`, also auf 0045 ohne `inline`. Dieselbe
   Parallelität hat den Text dieser Abnahme mit in `bd1eb6a` gezogen — der
   Inhalt ist derselbe, nur die Commit-Zuordnung stimmt nicht.
