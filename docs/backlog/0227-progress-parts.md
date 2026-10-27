# 0227 · Progress `parts` — die Teile eines Ganzen in einem Balken

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` — Gruppe Daten, Familie `Progress.tsx` (Erweiterung von 0045/0046); dazu `CardSection` in der Familie `Table.tsx` (Gruppe Tabelle) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: „bearbeitet · wartet · offen" über einen Stapel Schadensmeldungen ist fachfrei |
| Quelle | ll-abnahme 2026-10-27, Owner-Punkt 4 der Demo-Runde (llcto in Kopie): Belege-Übersicht der Abnahme, …/close/documents |
| Ersetzt | in der App: die `FieldList`-Zählung über den eingegangenen Belegen auf …/close/documents |
| Blockiert | Owner-Punkt 4 der Demo-Runde (ll-abnahme baut ein, sobald der Hash da ist) |
| Spec von / am | Claude (designsystem), 2026-10-27 |

## Ziel

Auf der Belege-Übersicht der Abnahme soll die Sachbearbeiterin mit einem Blick
sehen, wie viel vom Stapel durch ist und ob noch etwas offen ist. Heute stehen
dort drei Zahlen in einer `FieldList` untereinander. Gewünscht: ein Balken
über alle eingegangenen Belege, gestapelt in drei Teile. Daneben steht ein
Satz mit zwei Zahlen („28 Belege, 1 noch zu klären"). Keine Kacheln. Die Farbe
kodiert die Kritikalität: gebucht neutral, wartend Hinweis, zu entscheiden
Warnung.

## Einordnung

- **Wiederverwenden:** `Progress` (0045) zeigt **einen** Anteil, und zwar mit
  Spur, drei Höhen, Label und `inline` (0046). Das ist der Balken, den diese
  Seite braucht, nur ungeteilt. `BarChart` (0041/0110) zeigt **Reihen über
  die Zeit** (höchstens zwei Serien) und kein Ganzes. `KpiTile` ist eine
  Zahl ohne Ganzes und außerdem eine Kachel, die der Owner hier nicht will.
- **Erweitert, weil** §3 Regel 2 greift: Das `@when` von `Progress` („a share
  of a whole") deckt den Fall zu vier Fünfteln. Was fehlt, sind mehrere
  Anteile desselben Ganzen. Das ist eine Designentscheidung, die wiederkommt:
  Jede Kette mit Zuständen über einen Stapel fragt das, also Belege,
  Bankumsätze und Sachverhalte. Sie lässt sich in einem Halbsatz sagen: „or
  the parts of one whole, stacked (`parts`)". Ein eigenes `StackedBar` hätte
  die Spur, die Höhen, das Label und `inline` ein zweites Mal gebaut.
- **Hebt einen Ausschluss von 0045 auf:** Dort stand „Kann bewusst nicht:
  mehrere Segmente in einem Balken". Mit dem Nachtrag in 0045 gilt das nicht
  mehr. Kreisform und unbestimmter Fortschritt bleiben ausgeschlossen.
- **Zuschnitt:** dieselbe Datei, derselbe Export. Die Props werden eine Union:
  entweder ein Anteil (`share` bzw. `done`/`total`, `tone`) oder `parts`.
  Beides zugleich lässt der Typ nicht zu. Damit kann keine Prop still
  übergangen werden.
- **Dazu ein neuer Export der Card-Familie (Nachbesserung 2):** `CardSection`,
  eine Zeile auf dem Einzug der Karte. Den Baustein trägt der Entscheid von
  llcto für den Owner (Weg B, 2026-10-27). §3 Regel 2 passt nur sinngemäß:
  Sie erweitert um eine Prop, hier kommt ein Export dazu (Nachprüfung 3, S1).
  An der Aufrufstelle ginge die Zeile nur mit px, denn der Einzug ist ein Wert
  der Familie und kein Token.
- **Setzt auf:** `BadgeTone` aus `primitives/Badge.tsx` als Tonwort
  („neutral" · „info" · „success" · „warning" · „danger"). Es ist dasselbe
  Wort wie am `StatusBadge` derselben Seite, also derselbe Ton für dieselbe
  Stufe. Dazu `formatCount` aus `format.ts` für die Zahlen im Satz.
  Server-Component, kein Client-JS.

## Schnittstelle

Neu sind `parts`, `legend` und der Typ dazu, dazu `CardSection` in der
Card-Familie (Nachbesserung 2). Die übrigen Props von 0045/0046 bleiben
unverändert.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `parts` | `ProgressPart[]` | nein | Die Teile eines Ganzen, in der gegebenen Reihenfolge von links. Das Ganze ist ihre Summe. Schließt `share`, `done`, `total` und `tone` aus (Typ `never`). | `Parts`, `PartsEdge`, `PartsInUse` |
| `ProgressPart.label` | `string` | ja | Name des Teils, vom Aufrufer, z. B. „gebucht oder zugeordnet". Steht im Satz als „label: Zahl". | `Parts` |
| `ProgressPart.value` | `number` | ja | Anzahl. Ein Wert ≤ 0 oder keine Zahl zählt als 0. | `PartsEdge` |
| `ProgressPart.tone` | `BadgeTone` | ja | Kritikalität des Teils. Gleiches Wort und gleicher Ton wie am `StatusBadge`. | `Parts` |
| `label` | `string \| null` | nein | Wie bisher. Bei `parts` ist der Standard der Satz aus allen Teilen („gebucht oder zugeordnet: 25, wartet auf eine Rückfrage: 2, ohne Buchung, zu entscheiden: 1"). Ein eigener Satz ersetzt ihn, `null` blendet ihn aus. | `Parts` |
| `legend` | `boolean` | nein, Standard aus | Nur mit `parts`, sonst Typ `never`. Eine Zeile unter dem Balken: je gezeichnetem Teil eine Marke im Ton des Teils und sein Name. Die Anzahl steht im `title`, nicht sichtbar. Ein Teil mit 0 fehlt auch hier. | `PartsLegend`, `PartsInUse` |
| `size`, `inline` | wie 0045/0046 | nein | gelten unverändert auch für `parts` | `Parts`, `PartsLegend` |

**`CardSection`** (`primitives/Table.tsx`, Export über den Barrel):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `children` | `ReactNode` | ja | Eine Zeile auf dem Einzug der Karte (seitlich 18 px wie Kopf und Fuß, oben und unten 12 px wie der Fuß), in der Schrift der Zeile (`--fs-ui`), zwischen Kopf und Zeilen oder ganz ohne Kopf. Darunter die Trennlinie der Zeilen; ohne Linie als letztes Kind der Karte und direkt vor dem `CardFoot`, der seine eigene mitbringt. | `v3-primitives-tabelle-table--section`, `PartsInUse` |

```ts
export type ProgressPart = { label: string; value: number; tone: BadgeTone };
```

Typen aus `src/ludwig/`: keine. Die Teile und ihre Namen bestimmt die App. Das
Primitive kennt weder „Beleg" noch einen Zustand.

**Kann bewusst nicht:**
- **Eigenes Ganzes neben den Teilen** (`total` > Summe, Rest als leere Spur):
  Die Anfrage sagt „Summe = total". Siehe Ausbau.
- **Klick auf einen Teil oder auf die Legende:** Ein Teil ist nicht
  bedienbar. Wer filtern will, nimmt die `FilterBar` der Liste. Die Legende
  zeigt keine Zahlen, die stehen im `title` und in der Vorlesehilfe
  (llcto für den Owner: „nur zwei Zahlen").
- **Mehr als etwa 6 Teile:** Die Mindestbreite je Teil (6 px) plus Fuge
  (2 px) frisst bei 48 px (`inline`-Minimum) ab dem siebten Teil die Spur.

## Verhalten

- **Breite:** Jeder Teil wächst im Verhältnis seines Werts (`flex-grow` =
  Wert, Basis 0). Jeder gezeichnete Teil ist **mindestens 6 px** breit, damit
  1 von 28 auch bei 48 px Spur sichtbar bleibt. Diese Mindestbreite nehmen
  die übrigen Teile anteilig ab. Das Verhältnis verzerrt nur dort, wo der
  Teil sonst verschwände.
- **Null fällt weg:** Ein Teil mit 0 wird nicht gezeichnet und bekommt keine
  Fuge. Im Satz bleibt er stehen („wartet auf eine Rückfrage: 0"), denn die
  Vorlesehilfe soll alle drei Zahlen nennen.
- **Fuge statt Farbgrenze:** Zwischen zwei Teilen liegen 2 px Fläche. Damit
  muss kein Teil gegen seinen Nachbarn kontrastieren, nur gegen die Fläche.
  Die Spur bleibt außen rund und ist innen gerade geschnitten.
- **Leer** (Summe 0 oder keine Teile): die leere Spur (`--color-bg-sunken`)
  wie `Progress` bei 0 %. Den Satz „Noch keine Belege eingegangen" schreibt
  der Aufrufer als `label`.
- **Farben** (Füllung gegen Fläche, WCAG 1.4.11 ≥ 3:1). Gemessen gegen Weiß
  · `surface-head` · `bg-soft`:

  | Ton | Token | Weiß | surface-head | bg-soft |
  |---|---|---|---|---|
  | `neutral` | `--color-border-control` | 3,45:1 | 3,33:1 | 3,19:1 |
  | `info` | `--color-info` | 3,55:1 | 3,43:1 | 3,28:1 |
  | `warning` | `--color-warning` | 5,52:1 | 5,32:1 | 5,09:1 |
  | `danger` | `--color-danger` | 6,06:1 | 5,85:1 | 5,60:1 |
  | `success` | `--color-success` | 5,07:1 | 4,89:1 | 4,68:1 |

  `neutral` nimmt das Grau, das das Set für Grafik mit Mindestkontrast führt
  (`--color-border-control`, 1.4.11). Es ist heller und damit ruhiger als die
  Textgraus. Kein neuer Token.
- **Farbe nie allein (V7):** Die Zahlen und Namen stehen im Satz. Die Teile
  stehen immer in der Reihenfolge, die der Aufrufer gibt, auf dieser Seite
  „erledigt → wartet → zu entscheiden". Jeder Teil trägt `title` „label:
  Zahl". Sein Ton ist der des `StatusBadge` derselben Stufe in der Liste
  darunter (bei `neutral` füllt der Balken das Grafik-Grau, das Badge ist
  grau auf grau). Wer nur eine Summe in den Satz schreibt („3 noch zu klären"),
  entscheidet das an der Aufrufstelle. Der Standard nennt jeden Teil.
- **Vorlesehilfe:**
  - Mit eigenem `label` oder `label={null}` ist der Balken `role="img"`, sein
    `aria-label` ist der Satz aus allen Teilen.
  - Mit dem Standard-Label steht derselbe Satz schon als Text da. Der Balken
    ist dann `aria-hidden`, damit nichts doppelt vorgelesen wird.
- **Zahlen** über `formatCount` (de-DE, „1.234").
- **Server-Component:** Die Datei bleibt ohne `"use client"`. Die Breiten sind
  `flex-grow` aus dem Wert, eine Zahl ohne Einheit im `style`, also kein px
  im TSX.
- **Keine Zustände lädt/Fehler:** Wie bei 0045 kommen die Teile fertig vom
  Aufrufer. Für die Ladezeit steht `Skeleton` an der Aufrufstelle.

## Stories

Abgeleitet nach §6, nur für die neue Prop. Die fünf Stories von 0045/0046
bleiben:
- 1 Zustand gefüllt;
- 1 Rand (Null, Eins von 28, Leer, große Zahlen, schmale Spur);
- 1 im Einsatz.

Leer liegt im Rand. Ein Enum oder Callback kommt nicht hinzu (`tone` je Teil
zeigt `Parts`). Dazu kommt 1 für den Layout-Boolean `legend`
(Nachbesserung 2). Das macht 4, zusammen 9. `CardSection` bekommt seine Story
bei der Karte (`Table`, `Section`).

| Story | Beweist |
|---|---|
| `Parts` | drei Teile neutral · info · warning. Standard-Satz, eigener Satz, `label={null}` neben einer Zahl, `inline`, alle drei `size` |
| `PartsEdge` | 1 von 28 bleibt sichtbar bei 48, 120 und 320 px. Ein Teil 0 fällt weg, im Satz steht er. Alle Teile 0 und `parts=[]` ergeben die leere Spur. 12.480 von 12.481, alle fünf Töne |
| `PartsLegend` | Legende bei `lg` mit eigenem Satz, ohne Label, `inline` (Legende unter der Zeile), ein Teil 0 fehlt in Balken und Legende, alle Teile 0 ergeben keine Legende |
| `PartsInUse` | der Schritt „Belege" auf …/close/documents, wie llcto ihn entschieden hat (Weg B): Karte ohne eigenen Kopf, `CardSection`, Balken `lg` über die volle Breite, Legende und Satz „28 Belege, 3 noch zu klären" darunter; die offenen Belege in einer eigenen Karte |

Nicht anwendbar: lädt, Fehler, leer nach Filter. Der Balken filtert nicht, die
Liste darunter filtert.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ganzes größer als die Teile (Rest als leere Spur, z. B. „28 eingegangen, 20 erfasst") | `total` auch bei `parts` | eine Seite zeigt einen Stapel, dessen Teile das Ganze noch nicht abdecken |
| Klick auf einen Teil filtert die Liste | `href` je `ProgressPart` | der Owner will vom Balken in die Liste springen; dann Trefferfläche ≥ 24 px, also eine andere Höhe |

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

- [ ] `parts` und `share`/`done`/`total`/`tone` schließen sich im Typ aus (ein Aufruf mit beiden ist ein Typfehler)
- [ ] Breiten verhalten sich wie die Werte. Ein Teil mit 1 von 28 ist bei 48 px Spur ≥ 6 px breit, gemessen per `getBoundingClientRect` (Story `PartsEdge`)
- [ ] Ein Teil mit 0 wird nicht gezeichnet, steht aber im Satz (Story `PartsEdge`)
- [ ] Zwischen zwei Teilen 2 px Fuge, außen rund (Story `Parts`, Screenshot)
- [ ] Füllungen ≥ 3:1 gegen Weiß, `surface-head` und `bg-soft`, Werte als Kommentar in `v3.css`, `pnpm check:contrast` grün
- [ ] Vorlesehilfe: mit eigenem Satz `role="img"` und `aria-label` mit allen Teilen; mit Standard-Satz `aria-hidden` (Story `Parts`, DOM)
- [ ] Zahlen im Satz über `formatCount` („12.480") (Story `PartsEdge`)
- [ ] Bisherige Stories `Labels`, `Sizes`, `WithoutLabel`, `Edge`, `Inline` unverändert (Breite der Füllung, Label)
- [ ] Im Einsatz (Story `PartsInUse`, 1280 px): Balken in der Unterzeile des `CardHead`, Satz und Balken auf einer Zeile, Spur 120 px, jeder Teil ≥ 6 px, kein px im Story-Markup (ergänzt 2026-10-27 nach M4 der Abnahme; **ersetzt** durch die nächste Zeile, Nachbesserung 2)
- [ ] Im Einsatz nach Weg B (Story `PartsInUse`, 700 · 1100 · 1280 · 1440 · 1920 px): Balken in einer `CardSection`, links und rechts auf dem Einzug des Kartenkopfs, über die volle Breite, `lg`; Legende und Satz darunter; kein px im Story-Markup außer `Table cols` (ergänzt 2026-10-27, Nachbesserung 2)
- [ ] `legend`: nur mit `parts` (sonst Typfehler); je gezeichnetem Teil eine Marke in genau der Füllfarbe des Teils und sein Name; keine Zahl sichtbar, `title` „label: Zahl"; Teil 0 fehlt; alle Teile 0 ergeben keine Legende; für die Vorlesehilfe stumm (`aria-hidden`), der Balken bzw. der Standard-Satz nennt alle Teile mit Zahl (Story `PartsLegend`) (ergänzt 2026-10-27)
- [ ] `CardSection`: Einzug gleich dem Kartenkopf (Inhalt beginnt auf der x-Position des Titels), Trennlinie darunter, als letztes Kind ohne Linie; `@when`/`@instead`, Barrel-Export (Story `Section`) (ergänzt 2026-10-27)
- [ ] Datei weiter ohne `"use client"`
- [ ] 0045 trägt den Nachtrag, der den Ausschluss „mehrere Segmente" aufhebt; `design-guidelines.md` §11 nennt `parts`

## Befund beim Bauen (2026-10-27)

- **Gebaut wie spezifiziert:**
  - `Progress.tsx` nimmt `ShareProps | PartsProps`;
  - `ProgressPart` wird mit exportiert;
  - `BadgeTone` kommt aus `Badge.tsx`;
  - die Zahlen laufen über `formatCount`;
  - CSS unter `.v2bar--parts`/`.v2bar__part--<ton>`.
- **Leere Teile-Liste:** Bei `parts=[]` ist der Satz leer. Ein `role="img"`
  ohne Namen wäre ein leeres Bild, deshalb ist der Balken dann
  `aria-hidden`, und den Satz („Noch keine Belege eingegangen") trägt das
  `label`.
- **Im Einsatz:** In der Unterzeile des Kartenkopfs hat der `inline`-Balken
  seine 120 px, 2 von 28 sind dort 8 px breit. Eine erste Fassung der Story
  legte ihn deshalb in eine eigene Zeile über die volle Breite. Das ist
  zurückgenommen, siehe Nachbesserung M2.
- **Gemessen** (Storybook 6107, 1280 px, `getBoundingClientRect`):
  - 1 von 28 bei 48 px = 6 px und bei 120 px = 6 px (Mindestbreite greift);
    bei 320 px = 11,4 px (Verhältnis);
  - Fugen überall 2 px;
  - Höhen 4/6/10 px;
  - ein Teil 0 fehlt im Balken und steht im Satz;
  - 12.480 von 12.481 ergibt einen 6-px-Teil;
  - Konsole leer;
  - die fünf alten Stories mit unveränderten Füllbreiten (72 %, 34,7458 %, 77,7778 %, 89,8305 %, 0/100 %) und Labels.
- **Typtest:** `parts` zusammen mit `share` bzw. `tone` und ein Teil-Ton
  „accent" sind Typfehler, geprüft per `@ts-expect-error` gegen die
  `tsconfig` des Repos.
- `pnpm typecheck`, `storybook build`, `check:type`, `check:language`,
  `check:when`, `check:icons` und `check:contrast` (76 Angaben) sind grün.
  `check:classes` meldet nur die vier vorbestehenden Klassen.

## Abnahme

Gemessene Abnahme gegen Stand `b4ce3cb`. Gemessen wurde mit CDP (`scripts/cdp.mjs`, ein Messbrowser) gegen Storybook 6107, alle acht Stories bei 700, 1100, 1280, 1400 und 1920 px, per `getBoundingClientRect`. Story-IDs mit dem Präfix `v3-primitives-daten-fortschritt--`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` ist `storybook build`, deshalb in den Scratchpad gebaut (`node_modules/.bin/storybook build -o …`): „build completed successfully", Exit 0 | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `primitives/Progress.tsx` und `Progress.stories.tsx`, Titel `v3/Primitives/Daten/Fortschritt` (stories:6) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` und `pnpm check:when` Exit 0, beide `--test` Exit 0. `Progress` trägt `@when`/`@instead` (Progress.tsx:52–59). `ProgressPart` ist ein Typ, den der Wächter ausnimmt wie `BarLayout`. Die Story-Beschreibungen sind deutsch nach Hausentscheid 0098 M10 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | In Progress.tsx kein Hex und kein px. Die Breite kommt als `flexGrow` (eine Zahl, Progress.tsx:80), die Töne als `BadgeTone` (Progress.tsx:2, 20), eine Label-Map gibt es nicht. Die Story schreibt `18px` als Inline-Stil (stories:270), siehe M2 | ✓ (Komponente) |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `index.json` führt 8 Stories: 5 alte plus `parts`, `parts-edge`, `parts-in-use`, das ist die Ableitung (3 neu, zusammen 8). „lädt", „Fehler" und „leer nach Filter" sind begründet (Z. 126–127, 146–147). Deckung je Prop: `parts` in allen drei; `label` in `parts` (Standard, eigener Satz, `null`); `value` = 0 in `parts-edge`, ≤ 0 und NaN nur per SSR (H2); `tone` mit allen fünf Werten in `parts-edge`; `size` und `inline` in `parts`. `PartsInUse` zeigt aber nicht, was Z. 144 verlangt → M2, M3 | ✗ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | **Stufe und Importe** ✓: `../format`, `import type` aus `./Badge`. **Export über das Barrel** ✗: `ProgressPart` fehlt (M1). **Farbe** ✓: nur Kritikalität, Rot nur „fehlgeschlagen". **Wort zur Farbe** ✓: Satz und `title`, aber H4. **Zustände** ✓: begründet. **Kontrast** ✓: siehe unten. **Tastatur, Hover, Trefferfläche** n/a: 0 fokussierbare Elemente in allen drei neuen Stories, `cursor: auto` an den Teilen. **Schrift** ✓: `pnpm check:type` Exit 0, aber H3. **Karte** ✓. **min-width** ✓: kein Querlauf bei 700–1920 (`scrollWidth` = `innerWidth`). **Texte T1–T5** ✓, bis auf M3 b | ✗ (M1) |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 8 Stories bei fünf Breiten: Konsole leer (kein `error`, keine `warning`, keine Ausnahme), kein Querlauf. Screenshots von `parts`, `parts-edge` (1400) und `parts-in-use` (700, 1280) | ✓ |
| `parts` und `share`/`done`/`total`/`tone` schließen sich im Typ aus | `tsc` mit der `tsconfig` des Repos über eine Testdatei im Scratchpad. Je ein `@ts-expect-error` für `parts` mit `share`, mit `done`, mit `total` und mit `tone`, für einen Teil-Ton `"accent"` und für einen Teil ohne `label` → Exit 0. Gegenprobe (`@ts-expect-error` über einem gültigen Aufruf) → TS2578, Exit 2 | ✓ |
| Breiten wie die Werte; 1 von 28 bei 48 px Spur ≥ 6 px (`getBoundingClientRect`, `PartsEdge`) | `parts-edge`, bei allen fünf Breiten gleich: 48 px → 40 + 2 + **6**; 120 px → 112 + 2 + 6; 320 px → 306,64 + 2 + 11,36 (= 318/28). 12.480 von 12.481 → 6 px. Fünf Töne 9 : 6 : 4 : 3 : 2 auf 400 px → 147 / 98 / 65,33 / 49 / 32,67 (= 392 × Anteil). `parts` 25 : 2 : 1 auf 400 px → 353,58 / 28,28 / 14,14 | ✓ |
| Teil mit 0 nicht gezeichnet, steht im Satz (`PartsEdge`) | `parts-edge`, Zeile „ein Teil 0": 2 Teile (neutral, warning), 1 Fuge. Der Satz lautet „…, wartet auf eine Rückfrage: 0, …" | ✓ |
| 2 px Fuge, außen rund (`Parts`, Screenshot) | `parts` und `parts-edge`: alle Fugen 2,00 px, erster und letzter Teil bündig mit der Spur (Abstand 0/0). Die Spur hat `border-radius: 999px` und `overflow: hidden`. Screenshot 6-fach (48-px-Spur und `lg`): außen rund, an der Fuge gerade Kanten | ✓ |
| Füllungen ≥ 3:1 gegen Weiß, `surface-head`, `bg-soft`; Werte in `v3.css`; `pnpm check:contrast` grün | Nachgerechnet nach WCAG mit den Hex-Werten aus `tokens.css`: neutral 3,45 / 3,33 / 3,19; info 3,55 / 3,43 / 3,28; warning 5,52 / 5,32 / 5,09; danger 6,06 / 5,85 / 5,60; success 5,07 / 4,89 / 4,68. Das deckt sich mit Spec und v3.css:1345–1349. `claimsFrom` liest alle 15 neuen Angaben (v3.css von 23 auf 38). `pnpm check:contrast` Exit 0 mit 76 Angaben. Gemessene Füllungen: rgb(138,138,138) · rgb(59,143,196) · rgb(140,96,30) | ✓ |
| Vorlesehilfe: eigener Satz → `role="img"` + `aria-label` mit allen Teilen; Standard-Satz → `aria-hidden` (`Parts`, DOM) | `parts`, AX-Baum per `Accessibility.getFullAXTree`: 6 Bilder (eigener Satz, `label={null}`, `inline`, drei Größen), jedes mit dem Namen „gebucht oder zugeordnet: 25, wartet auf eine Rückfrage: 2, ohne Buchung / zu entscheiden: 1". In der Zeile mit dem Standard-Satz ist der Balken `aria-hidden="true"`, der Satz steht einmal als Text. `parts-edge`: `parts=[]` → `aria-hidden`, wie im Befund | ✓ |
| Zahlen im Satz über `formatCount` („12.480") (`PartsEdge`) | `parts-edge`, Zeile „große Zahlen": „gebucht oder zugeordnet: 12.480, …", der `title` ebenso (Progress.tsx:67, 81) | ✓ |
| Bisherige Stories `Labels`, `Sizes`, `WithoutLabel`, `Edge`, `Inline` unverändert | Im Story-Quelltext ist nur die Importzeile geändert (`git show --numstat`: 145/1). SSR-Vergleich alt (`b4ce3cb^`) gegen neu über die 17 Aufrufe dieser Stories: 0 Unterschiede im Markup. Im Browser: Labels 72 % · 34,74 % · 0 % · 50 %; Sizes 77,78 % bei 4 / 6 / 10 px; WithoutLabel 89,83 % · 0 %; Edge 0 · 100 · 100 · 0 %; Inline 34,74 % (dreimal) · 33,32 %. Die Labels sind unverändert | ✓ |
| Datei weiter ohne `"use client"` | `grep`: Progress.tsx, format.ts und Badge.tsx ohne Direktive; Badge kommt nur per `import type` | ✓ |
| 0045 trägt den Nachtrag; §11 nennt `parts` | `0045-progress.md:196–205`, `design-guidelines.md:554` | ✓ |
| *(Abgabeliste §4.5)* Spec stimmt mit dem Code (Prop-Tabelle, Sätze daneben) | Tabelle Z. 55–62 gegen Progress.tsx:14–50: Typen, Pflicht und `never` stimmen, der Code-Block Z. 65 auch. `value` hat kein JSDoc (H2). Abweichungen: Satz „1 noch zu klären" (Z. 19, 144) ≠ Story; Beispiel „zu entscheiden: 1" (Z. 61) ≠ Teilname der Story; Ort „Kopf einer Card" (Z. 144) ≠ Story → M2, M3 | ✗ |
| *(Skill „Abnahme")* Im Einsatz gemessen, bei der Breite auf der Seite | `parts-in-use` bei fünf Breiten: der Satz beginnt bei x = 35, wie Titel und erste Zelle. Der Balken endet 18 px vor dem Kartenrand, Satz und Balken stehen auf einer Mitte (88,21 / 88,20). Bei 1280 px: Spur 1.054,81 px, 1 von 28 = 37,53 px (der Befund nennt 1.059 und 38). Probe am Ort der Spec, im `sub` des `CardHead`: Spur 120 px, 2 von 28 = 8,14 px, das bestätigt den Befund | ✓ gemessen, Ort → M2 |
| *(Spec-Mangel)* Kriterium für den Einsatz fehlt | Die variablen Kriterien messen nur im Story-Rahmen (`PartsEdge`, `Parts`). Für Ort und Breite im Kartenkopf (Z. 144) fehlt ein Kriterium, obwohl der Skill genau dort misst → M4 | ✗ |

Abgenommen von / am: Claude (designsystem, fremde Abnahme) / 2026-10-27 · Offene Punkte: M1–M4, H1–H5

**Mängel**

- **M1 · `ProgressPart` fehlt im Barrel.** `src/ui/v3/index.ts:145` exportiert nur `Progress`. Das Paket gibt aber nur `.` frei (`package.json`, `exports`), also kommt die App nicht an den Typ, den die Spec in Z. 65 vorsieht. Zu tun: `export { Progress, type ProgressPart } from "./primitives/Progress";`, so wie `BarChart` seine Typen mitgibt (index.ts:144).
- **M2 · `PartsInUse` steht nicht dort, wo die Spec den Balken hinstellt.** Die Spec sagt „Kopf einer Card" (Z. 144). Die Story setzt den Balken in eine selbstgebaute Zeile unter dem Kopf, mit dem Inline-Stil `padding: "var(--space-3) 18px"` und einem eigenen `borderBottom` (`Progress.stories.tsx:269–271`). Die Aufrufstelle müsste `18px` als zweite Quelle für den Einzug des Kopfes (`.v2card__h`, v3.css:21) nachschreiben. Das verstößt gegen „kein px in TSX, keine zweite Quelle". Der Grund für den Umzug ist gemessen und stimmt: im `sub` bleiben 120 px, 2 von 28 sind dort 8,14 px breit. Zu tun: Den Ort im Set benennen, als Klasse oder als `CardHead`-Platz für eine Zeile über die volle Breite. Das ist ein neuer Baustein, also den Owner fragen. Danach die Story-Tabelle der Spec nachziehen.
- **M3 · Die Texte der Stories weichen von der Spec ab.**
  - (a) Der Satz lautet „28 Belege, 3 noch zu klären" (stories:184, 197, 271), die Spec verlangt „28 Belege, 1 noch zu klären" (Z. 19, 115, 144). Der Befund erwähnt die Abweichung nicht.
  - (b) Der dritte Teil heißt „ohne Buchung / zu entscheiden" (stories:166). Das Badge derselben Stufe in `PartsInUse` sagt „zu entscheiden" (stories:297), das Spec-Beispiel ebenfalls („zu entscheiden: 1", Z. 61). Damit stehen zwei Wörter für eine Sache auf einer Fläche (CLAUDE.md §3). `title` und Vorlesehilfe nennen ein anderes Wort als die Liste.
  - Zu tun: Die Stories auf die Wörter der Spec bringen. Sind „3" und „ohne Buchung / zu entscheiden" die Wörter der App, dann die Spec mit Begründung ändern und das Badge angleichen.
- **M4 · Spec-Mangel: kein Kriterium für den Einsatz.** Kein variables Kriterium prüft Ort, Spurbreite und 1 von 28 im Kartenkopf bei 1280 px. Der Skill misst aber genau dort (`v3-komponente`, „Abnahme": im Einsatz, nicht im Story-Rahmen). Zu tun: Der Spec-Autor ergänzt das Kriterium, nicht die Abnahme.

**Hinweise**

- **H1 · Zwei Zahlformate in einer Komponente.** `parts` zählt über `formatCount` („12.480"). Der Anteil schreibt dagegen `${done ?? 0} von ${total}` roh (Progress.tsx:93), daraus wird „12480 von 12481". Das stammt aus 0045. Beim nächsten Griff an `Progress` auch dort `formatCount` nehmen. Keine der fünf alten Stories ändert sich dadurch, alle Werte liegen unter 1.000.
- **H2 · `ProgressPart.value` hat kein JSDoc** (Progress.tsx:18). Der Satz der Spec „Anzahl. Ein Wert ≤ 0 oder keine Zahl zählt als 0." fehlt im Code. Keine Story zeigt ≤ 0 oder NaN, nachgewiesen ist es nur per SSR (−3 und NaN → „0", kein Teil). Zu tun: Den Satz als JSDoc übernehmen.
- **H3 · Der Standard-Satz steht in der kleinsten Schrift.** `.v2bar__label` setzt `--fs-ui-2xs` (11 px) in `--color-text-subtle` (v3.css:1334–1336). Die Skala reserviert 2xs für „axis tick, step number" (tokens.css:117), die Beischrift ist `ui-xs` (§2a). Mit `parts` steht dort ein Satz von rund 90 Zeichen, der V7 trägt. Das stammt aus 0045. Für 0119 oder den Owner vormerken.
- **H4 · Im Einsatz trägt die Farbe die Zuordnung allein.** In `PartsInUse` nennt der Satz nur die Summe. Welcher Teil welcher ist, erkennt eine sehende Nutzerin nur daran, dass die Farben zu den Badges passen; der `title` erscheint nur mit der Maus. Die Spec legt das bewusst an die Aufrufstelle (Z. 115–116). Dem Owner zeigen und fragen, ob „1 noch zu klären" mit Wort reicht.
- **H5 · Der Satz „Gleiches Wort und gleiche Farbe wie am `StatusBadge`" stimmt nur teilweise** (Z. 60, 113–114). Für info, warning, danger und success gilt er, dort ist der Punkt des Badges die Füllung. `neutral` füllt dagegen `--color-border-control` (#8A8A8A), das neutrale Badge zeigt `--color-text-subtle` bzw. `--color-text` auf `bg-sunken`. Die Wahl ist in Z. 108–110 begründet. Zu tun: den Satz in der Prop-Tabelle auf „gleicher Ton" präzisieren.

## Nachbesserung 2026-10-27 (Bauender, nach der Abnahme)

| Punkt | Behebung |
|---|---|
| M1 | `src/ui/v3/index.ts` exportiert `Progress, type ProgressPart` |
| M2 | **Kein neuer Platz im Set.** `PartsInUse` setzt den Balken wieder in die Unterzeile des `CardHead`, ohne px und ohne eigene Zeile. Die Unterzeile eines Kopfes ist der Ort, für den `inline` gebaut ist (0046), und die StepRail zeigt ihren Schritt-Fortschritt in derselben 120-px-Form. Gleiches sieht gleich aus. Die Mindestbreite von 6 px gibt es genau dafür, dass 1 und 2 von 28 auf dieser Spur sichtbar bleiben. Der Balken ist ein Signal zum Hinsehen, die Zahlen trägt der Satz. Ein Balken über die volle Breite wäre ein neuer Baustein (Platz in `CardHead` oder Klasse), und für ihn gibt es heute eine Verwendung. Nach §3 bleibt er Ausbau, Auslöser siehe unten. |
| M3 | (a) Die Spec folgt der Story: Teile 25 · 2 · 1 ergeben „3 noch zu klären" (Z. 115, 144). In Z. 19 steht weiter das Beispiel der Anfrage. (b) Der dritte Teil heißt in den Stories „zu entscheiden", wie das Badge daneben und das Beispiel in Z. 61. Wie die App ihn nennt, entscheidet die App, und dann an beiden Stellen gleich. |
| M4 | Kriterium „Im Einsatz" ergänzt (Spec-Autor) |
| H1 | `done`/`total` schreibt die Zahlen jetzt über `formatCount` („12.480 von 12.481"). Die alten Stories liegen unter 1.000, ihr Text bleibt gleich |
| H2 | JSDoc an `ProgressPart.value`: „≤ 0 or not a number counts as 0" |
| H3 | Offen für 0119 bzw. den Owner: `.v2bar__label` steht in `--fs-ui-2xs`, das ist das ganze Set seit 0045. Mit `parts` kann dort ein langer Satz stehen. Die Größe ändere ich hier nicht still |
| H4 | Offen für den Owner (über llcto): Reicht im Einsatz „3 noch zu klären" mit den Badge-Tönen als Zuordnung, oder soll der Satz die Teile nennen? Der Standard-Satz nennt sie |
| H5 | Satz in Prop-Tabelle, Einordnung und Verhalten: „gleicher Ton", und für `neutral` benannt |

Ausbau ergänzt: Ein Balken über die volle Breite einer Karte bekommt seinen
Platz in `CardHead` (etwa `band`), sobald eine zweite Seite ihn so braucht
oder der Owner ihn für …/close/documents so will.

## Nachprüfung 2026-10-27

Fremde Nachprüfung der Nachbesserung. Sie liegt im Arbeitsbaum und ist nicht
committet (`git diff` über `index.ts`, `Progress.tsx`, `Progress.stories.tsx`
und diese Spec). HEAD steht inzwischen auf `a23398d`, das `Progress` nicht
berührt.

- **Browser:** gemessen mit `scripts/cdp.mjs` (ein Messbrowser,
  `chrome-headless-shell` 1247) gegen Storybook 6107. Alle acht Stories bei
  700, 1100, 1280, 1400 und 1920 px, per `getBoundingClientRect`. Danach
  `pnpm cdp:clean`.
- **SSR-Vergleich:** alt (`b4ce3cb`) gegen neu mit `renderToStaticMarkup`,
  über eine Kopie im Scratchpad.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 · `ProgressPart` im Barrel | `index.ts:145` exportiert `Progress, type ProgressPart`. Eine Testdatei im Scratchpad importiert beides aus `src/ui/v3/index` (Ziel von `exports["."]`) und baut ein `ProgressPart[]`. `tsc` mit der `tsconfig` des Repos: Exit 0. Je ein `@ts-expect-error` für den Teil-Ton `"accent"` und für `parts` mit `share` greift. Gegenprobe (`@ts-expect-error` über dem gültigen Aufruf): TS2578, Exit 2 | ✓ |
| M2 · Ort von `PartsInUse` | Der Balken steht im `sub` des `CardHead` (stories:269–272), ohne Inline-Stil und ohne eigene Zeile. Gemessen: siehe Zeile „Im Einsatz". Die Begründung ist geprüft, siehe „Zu M2" unter der Tabelle | ✓ (Begründung trägt), aber N1 |
| M3 · Wörter der Stories | (a) „28 Belege, 3 noch zu klären" in stories:184, 197, 271 und in Spec Z. 116, 145. Z. 19 behält das Beispiel der Anfrage, das sagt die Nachbesserung. „3" ist auch die Zählung der App (wartet + zu entscheiden). (b) Der dritte Teil heißt „zu entscheiden" (stories:166), ebenso das Badge derselben Stufe (stories:297) und Spec Z. 61. Im Browser: `title` „zu entscheiden: 1", AX-Name „…, zu entscheiden: 1". Auf der Fläche steht ein Wort | ✓ |
| M4 · Kriterium „Im Einsatz" | Steht in Spec Z. 180, mit Datum und Herkunft (M4). Sonst ist der Kriterienblock unverändert: `git diff` zeigt dort nur diese eine Zeile | ✓ |
| H1 · `formatCount` auch für `done`/`total` | Progress.tsx:94. SSR: `done=12480, total=12481` → „12.480 von 12.481" (vorher „12480 von 12481"), `999/1000` → „999 von 1.000". In den alten Stories und bei den Aufrufern im Repo ändert sich kein Text (siehe unten) | ✓ |
| H2 · JSDoc an `value` | Progress.tsx:18 „The count; ≤ 0 or not a number counts as 0." deckt Spec Z. 59. SSR mit den Teilen 5 · −3 · NaN: ein gezeichneter Teil, Satz „a: 5, b: 0, c: 0" | ✓ |
| H3 · Satz in `--fs-ui-2xs` | Als Frage an 0119 bzw. den Owner benannt. Die Größe ist nicht still geändert. Nachtrag: Im `sub` des `CardHead` steht der Satz in 11 px `text-subtle`, die anderen Unterzeilen des Sets in 12,5 px `text-muted` (gemessen in `parts-in-use`). Der Kontrast hält (`#717171` auf `surface-head` 4,71:1). Damit hat die Frage einen zweiten Ort | offen (Owner), sauber benannt |
| H4 · Zuordnung im Einsatz nur über die Farbe | Als Frage über llcto an den Owner benannt, die Frage ist ausformuliert. Nachtrag zu N1: Auf der eingebauten Seite fehlen die Badges der Liste, auf die sich die Story stützt. Dort nennt ein Hinweissatz die Teile in Worten | offen (Owner), sauber benannt |
| H5 · „gleicher Ton" statt „gleiche Farbe" | Spec Z. 46, 60, 114–116 und Progress.tsx:20. Gemessen in `parts-in-use`: warning-Teil und Text des warning-Badge sind beide rgb(140, 96, 30). Der info-Teil ist rgb(59, 143, 196), der Text des info-Badge rgb(43, 111, 156): gleicher Ton, andere Stufe. Der neutral-Teil ist rgb(138, 138, 138), das Badge rgb(45, 45, 45) auf rgb(236, 239, 243), so wie Z. 115–116 es sagen. „gleiche Farbe" steht in der Spec nur noch im Zitat der Abnahme | ✓ |
| **Im Einsatz** (Story `PartsInUse`, 1280 px): Balken im `sub` des `CardHead`, Satz und Balken auf einer Zeile, Spur 120 px, jeder Teil ≥ 6 px, kein px im Story-Markup | `parts-in-use` misst bei allen fünf Breiten gleich. Der Balken liegt laut DOM in `.v2card__h .sub`. Der Satz beginnt bei x = 35, wie Titel und erste Zelle. Satz (145,19 × 17,05 px, `nowrap`) und Spur haben eine Mitte (y 62,21 / 62,20). Spur **120,00** px; Teile 101,86 · 8,14 · **6,00** px; Fugen 2,00 · 2,00. Der Balken ist `role="img"` mit dem Namen „gebucht oder zugeordnet: 25, wartet auf eine Rückfrage: 2, zu entscheiden: 1". Der Satz steht einmal als Text. Kein Querlauf (`scrollWidth` = `innerWidth`). px in Inline-Stilen unter `#storybook-root`: nur `--v2-cols: 1fr 120px 220px`. Das ist das Grid-Template der `Table`, Hauskonvention aller v3-Stories (0045 Abnahme, 0053). Screenshot 1280 px, dreifach: erst der Satz, dann die Spur grau · blau · braun, außen rund | ✓ |
| Alte Stories `Labels`, `Sizes`, `WithoutLabel`, `Edge`, `Inline` | Quelltext Z. 1–160 per `diff` gegen `b4ce3cb`: unverändert. SSR alt gegen neu über die 17 Aufrufe: 0 Unterschiede im Markup. Füllbreiten im Browser, gleich bei allen fünf Breiten: Labels 72 · 34,74 · 0 · 50 %; Sizes 77,78 % bei 4 / 6 / 10 px; WithoutLabel 89,83 · 0 %; Edge 0 · 100 · 100 · 0 %; Inline dreimal 34,74 %, dann 33,32 %. Labels: „72 %", „41 von 118", „0 von 3", „2 Belege fehlen", dreimal „7 von 9", „0 %", „9 von 9", „100 %", „0 von 0", dreimal „41 von 118 Punkte", „1 von 3". Alles wie in der Abnahme | ✓ |
| Konsole der drei neuen Stories | In `parts`, `parts-edge` und `parts-in-use` (`Runtime`, `Log`) kein `error`, keine `warning`, keine Ausnahme. Es stehen nur `[vite] connecting…/connected.` (debug) und der Hinweis auf die React-DevTools (info) da. Die fünf alten Stories sind ebenso fehlerfrei | ✓ |
| Wächter | Exit 0: `pnpm typecheck`, `check:type`, `check:language`, `check:when`, `check:icons`, dazu `check:language --test` und `check:when --test`. `check:contrast` Exit 0 mit 76 Angaben. `check:classes` Exit 1, nur mit den vier vorbestehenden Klassen (v3clt, v3clt__step, v2tbl__foot, cy-page) | ✓ |
| Übrige Aufrufer von `Progress` (H1) | `grep '<Progress'` in `src`. `StepRail.tsx:305` gibt ein eigenes `label` mit, `Review.tsx:187` `label={null}`. `FileDrop.tsx:158` und `Cells.stories.tsx` geben nur `share` ohne `total` (Prozent oder eigenes Label). Den Standardtext „x von y" nutzt nur `Progress.stories.tsx`. SSR alt gegen neu mit den Props dieser Aufrufer, `StepRail` auch mit 1234/5678: 0 Unterschiede | ✓, kein Text ändert sich |

**Zu M2: Hält die Begründung?** Ja, gegen die Hausregeln und gegen das
Kriterium.

- **spec-schreiben §3, Regel 1 greift vor Regel 2.** `CardHead` `sub` („one
  line under the title") und `Progress inline` („for a header",
  Progress.tsx:29–30) tragen den Ort schon. Ein Platz `band` wäre eine neue
  Prop an `CardHead`. Regel 2 verlangt dafür zwei Verwendungen oder eine
  Design-Vorlage, und es gibt eine Verwendung. Dann gehört er in den Ausbau,
  mit Auslöser (Z. 156, spec-schreiben §8.5). So steht es da.
- **CLAUDE.md §2, Darstellung:** kein px im TSX, keine zweite Quelle. Der
  Einzug kommt aus `.v2card__h`, die Regel ist erfüllt.
- **CLAUDE.md §3, „Gleiches sieht gleich aus":** `inline` mit 120 px ist die
  Form des Schritt-Fortschritts (`StepRail.tsx:305`).
- **CLAUDE.md §7:** kein neues Wort, kein neuer Platz, also auch keine
  Owner-Frage.
- **Kriterium Z. 180:** gemessen erfüllt, siehe Zeile „Im Einsatz".
- **Zwei Sätze gehen weiter, als die Quelle trägt.** Am Ergebnis ändern sie
  nichts:
  - 0046 hat `inline` für den Schrittkopf der StepRail und den Gruppenkopf
    der TodoList gebaut, nicht ausdrücklich für die Unterzeile eines
    Kartenkopfs. Der Schritt-Fortschritt der StepRail steht im `actions` des
    `StepHeader` (StepRail.stories:76), nicht in einer Unterzeile. Gleich
    ist die Form (120 px, Satz vorn), nicht der Platz.
  - „Für ihn gibt es heute eine Verwendung": Diese eine Verwendung ist genau
    die Seite, um die es geht. Dort steht der Balken heute über die volle
    Breite, siehe N1.

**Mängel**

- **N1 · „Im Einsatz" zeigt nicht die Seite, die es nennt, und die
  Abweichung zur App ist nicht benannt.**
  - **Was die Spec sagt:** Z. 145 und stories:259–264 nennen die Story „wie
    auf …/close/documents" und „die Belege-Übersicht der Abnahme".
  - **Was die App zeigt:** Sie hat die Seite gegen `b4ce3cb` schon gebaut
    (`ludwig/app`, `staging`, zuletzt `1c0075e49`,
    `apps/web/src/modules/batch-review/ui/close/CloseStep.tsx:265–292`).
    - Der Balken steht in `size="lg"` über die volle Kartenbreite, der Satz
      darunter (Z. 271–279).
    - Einen `CardHead` gibt es mit Absicht nicht (Z. 269: „Kein zweiter Kopf
      „Belege" — der Schrittkopf darüber trägt ihn schon").
    - Den Abstand setzt `padding: 16` in px (Z. 270).
    - Darunter steht eine eigene, zugeklappte `DataTable` nur mit den
      offenen Belegen (Z. 287–291). Die Badges, über die Story und H4 die
      Farben zuordnen, gibt es dort nicht.
    - Der dritte Teil heißt „ohne Buchung, zu entscheiden" (Z. 248, 275),
      obwohl stories:162 „as the app names them" sagt.
  - **Was die Nachbesserung auslässt:** Sie dreht die Empfehlung für diese
    Seite auf Unterzeile und 120 px. Sie sagt nicht, dass die Seite schon
    anders steht, und nicht, in welchen Kopf der Balken dort gehört.
  - **Welche Regel bricht:**
    - `v3-komponente`, „Abnahme": Gemessen wird im Einsatz bei der Breite,
      die der Baustein auf der Seite hat.
    - `spec-schreiben` §5: Weicht die Vorlage ab, nennt die Spec beides.
    - `spec-schreiben`, „Was dieser Skill nicht tut": Befunde an die App
      gehören nach `docs/befunde-app.md`.
    - Der eigene Ausbau-Auslöser (Z. 156): „der Owner will ihn auf
      …/close/documents breiter als 120 px". Die Seite zeigt ihn heute
      breiter, die Frage ist also jetzt fällig.
  - **Zu tun:**
    1. In der Spec benennen, wie die App die Seite heute zeigt und welche
       Form gilt. Den Namen des dritten Teils in Story-Kommentar, Teil und
       Badge angleichen oder den Unterschied begründen.
    2. Eine Zeile in `docs/befunde-app.md`: Balken `inline` in die
       Unterzeile eines Kopfes, ohne `padding: 16`. Dabei klären, welcher
       Kopf das ist, denn die Seite hat bewusst keinen Kartenkopf.
    3. Die Breitenfrage zusammen mit H4 über llcto an den Owner geben. Ohne
       Antwort: Unterzeile, 120 px.

**Hinweise**

- **H6 · Rohe Zahlen gleich daneben.** `StepRail.tsx:304, 305` schreibt
  `title` und `label` des `ProgressBar` roh als `${done} von ${total}`. Daraus
  wird „1234 von 5678 Punkte", während `Progress` selbst jetzt „1.234 von
  5.678" schreibt. Das gehört nicht zu 0227: beim nächsten Griff an
  `StepRail` auch dort `formatCount` nehmen.
- **H7 · `formatCount` rundet.** `done=2.5, total=4` ergibt jetzt „3 von 4"
  statt „2.5 von 4". `done`/`total` sind Anzahlen, und kein Aufrufer im Repo
  gibt einen Bruch. Ein Halbsatz im JSDoc von `done` reicht.

Nachgeprüft von / am: Claude (designsystem, fremde Nachprüfung) / 2026-10-27 · Offene Punkte: N1; H3 und H4 als Owner-Fragen; H6, H7

## Nachbesserung 2 · 2026-10-27 (Bauender, nach der Nachprüfung und den Entscheiden von llcto)

**Entscheide von llcto für den Owner:**
- **H3:** Das Label bleibt bei `--fs-ui-2xs`. Es gibt keine set-weite Änderung
  für diesen Fall.
- **H4:** „Ein Balken, dessen Teile man nicht benennen kann, hilft nicht."
  Deshalb `legend` an `Progress parts`, Standard aus. Die Legende ist eine
  Zeile unter dem Balken, mit einer Marke im Ton des Teils und seinem Label.
  Die Anzahl steht nur im `title` und in der Vorlesehilfe. Ein Teil mit 0
  fehlt auch in der Legende. Der Satz der App bleibt bei der Summe.
- **N1, Ort auf …/close/documents: Weg B.** Der Balken bleibt über die volle
  Kartenbreite (`lg`), Satz und Legende darunter. Die Card-Familie bekommt
  den Platz für eine Zeile auf dem Einzug der Karte, ohne px, damit die App
  ihr `padding: 16` ersetzen kann. Der Balken ist auf dieser Seite die
  Antwort des Schritts, im Schrittkopf wäre er zu klein. Weg A (Schrittkopf,
  120 px) ist verworfen.

| Punkt | Behebung |
|---|---|
| N1 | **Die App heute:** `CloseStep.tsx` (`ludwig/app` staging) zeigt den Balken `lg` über die volle Kartenbreite, in einer Karte ohne Kopf, mit `padding: 16` in px; darunter eine eigene, zugeklappte Liste der offenen Belege. **Was gilt:** genau diese Form, mit `CardSection` statt des px-Abstands und mit `legend`. `PartsInUse` zeigt sie jetzt so. Der dritte Teil heißt in Fixture, Badge und Legende wie in der App: „ohne Buchung, zu entscheiden". Befund für die App: `docs/befunde-app.md` L-371 |
| Ort | `CardSection` (`Table.tsx`) mit `@when`/`@instead`, über den Barrel exportiert, CSS `.v2card__section` (12 / 18 px wie Kopf und Fuß, Trennlinie `border-subtle`, als letztes Kind ohne Linie). Den Platz in `CardHead` (`band`) aus dem Ausbau braucht es nicht: Die Zeile steht auch in einer Karte ohne Kopf, und genau so ist die Seite gebaut. |
| `legend` | `PartsProps.legend?: boolean`, `ShareProps.legend?: never`. Die Marke trägt die Klasse des Teils (`v2bar__part--<ton>`), Balken und Legende können also nicht auseinanderlaufen. Die Form kommt von der Staffel-Legende (`.pz-staffel-legend`): 8 px, Ecken 2 px, ein Stück Balken, kein Punkt. Die Schrift ist die des Labels. Im Block steht die Legende zwischen Balken und Satz, bei `inline` unter der Zeile. Für die Vorlesehilfe ist sie stumm, weil Balken bzw. Standard-Satz alle Teile mit Zahl nennen. |
| H6 | `ProgressBar` in `StepRail.tsx` schreibt `title` und Label über `formatCount` („1.234 von 5.678 Punkte") |
| H7 | JSDoc an `done`: „a count, a fraction is rounded" |

**Gemessen** (Storybook 6107, `getBoundingClientRect`, Konsole leer):
- **`PartsInUse`** bei 700, 1100, 1280, 1440 und 1920 px:
  - Die `CardSection` hat das Padding `12px 18px`. Der Balken beginnt bei
    x = 35, auf der x-Position des Kartentitels (0227 `Section`: Titel 35,
    Inhalt 35). Er endet 19 px vor dem Kartenrand und ist 630, 1.030, 1.210,
    1.370 bzw. 1.850 px breit.
  - Die Teile 25 · 2 · 1 bei 1280 px: 1.076,78 · 86,14 · 43,08 px.
  - Die Legende steht 4 px unter dem Balken in einer Zeile (17 px). Der Satz
    folgt 3 px darunter.
- **`PartsLegend`:**
  - Die Marken sind 8 px groß und haben die Füllfarbe des Teils:
    rgb(138, 138, 138) · rgb(59, 143, 196) · rgb(140, 96, 30), gleich den
    Teilen.
  - `title` z. B. „wartet auf eine Rückfrage: 2", `aria-hidden="true"`.
  - Ist ein Teil 0, hat die Legende zwei Einträge. Sind alle Teile 0, gibt es
    keine Legende.
  - Bei `inline` steht die Legende unter der Zeile.
- **`Section`:** Die erste Karte hat eine Trennlinie von 1 px, die zweite
  (ohne Kopf, nur `CardSection`) keine.
- **Wächter:** `typecheck`, `check:type`, `check:language`, `check:when` und
  `check:contrast` sind grün. `check:classes` meldet nur die vier
  vorbestehenden Klassen.

## Nachprüfung 2 · 2026-10-27

Fremde Nachprüfung der Nachbesserung 2. Sie liegt uncommittet im Arbeitsbaum
(`git diff` gegen `a23398d` über die zehn Dateien, die die Nachbesserung
berührt).

- **Browser:** gemessen mit `scripts/cdp.mjs` (ein Messbrowser,
  `chrome-headless-shell` 1247) gegen Storybook 6107. 26 Stories (Progress 9,
  Table 7, StepRail 10) bei 700, 1100, 1280, 1440 und 1920 px, per
  `getBoundingClientRect`, dazu der AX-Baum per
  `Accessibility.getFullAXTree`. Danach `pnpm cdp:clean`.
- **SSR-Vergleich:** alt (`HEAD`) gegen neu mit `renderToStaticMarkup` über
  alle Stories von `Progress`, `Table` und `StepRail`, Kopien im Scratchpad.
- **Typtest:** eine Testdatei im Scratchpad importiert aus `src/ui/v3/index`,
  `tsc` mit der `tsconfig` des Repos.

| Kriterium/Punkt | Nachweis | Ergebnis |
|---|---|---|
| Im Einsatz nach Weg B (`PartsInUse`, 700 · 1100 · 1280 · 1440 · 1920 px) | `parts-in-use`, bei allen fünf Breiten gleich gebaut. Die erste Karte hat keinen Kopf, nur `.v2card__section` (Padding `12px 18px`, als letztes Kind ohne Linie). Der Balken ist `lg` (10 px). Er beginnt bei x = 35, auf der x-Position von Titel und erster Zelle der zweiten Karte (35), und endet 19 px vor dem Kartenrand (18 + 1 px Rand), links ebenso. Breiten 630 · 1.030 · 1.210 · 1.370 · 1.850 px. Teile bei 1280 px 1.076,78 · 86,14 · 43,08 px (= 1.206 × 25/28 · 2/28 · 1/28). Die Legende steht 4 px unter dem Balken in einer Zeile (17,05 px), der Satz „28 Belege, 3 noch zu klären" 3 px darunter. Kein Querlauf. px in Inline-Stilen unter `#storybook-root`: nur `--v2-cols: 1fr 120px 240px` | ✓ |
| `legend` (Story `PartsLegend`) | **Typ:** `legend` an `share`, an `done`/`total` (auch `legend={false}`) und `legend="yes"` sind Typfehler (`@ts-expect-error` greift, Exit 0; Gegenprobe TS2578). **Browser,** fünf Breiten: je gezeichnetem Teil ein `.v2bar__key`. Die Marke ist 8 × 8 px mit Radius 2 px und hat die Farbe des Teils: rgb(138, 138, 138) · rgb(59, 143, 196) · rgb(140, 96, 30). Im Text der Legende steht keine Ziffer, der `title` lautet z. B. „wartet auf eine Rückfrage: 2". „ein Teil 0": 2 Teile, 2 Einträge. „alle Teile 0": kein `.v2bar__legend`. `inline`: Zeile 17,05 px, Legende 4 px darunter. Bei 700 px bricht die Legende im Story-Rahmen auf zwei Zeilen um (`flex-wrap`), ohne Querlauf. **Vorlesehilfe:** Legende `aria-hidden="true"`. Im AX-Baum fünf Bilder mit dem vollen Satz, die Namen der Legende fehlen, jeder eigene Satz steht einmal da. Den Standard-Satz mit Legende zeigt keine Story. Per SSR: Balken und Legende sind `aria-hidden`, der Satz nennt „a: 5, b: 0, c: 0" | ✓ |
| `CardSection` (Story `Section`) | `section`, fünf Breiten: Karte 1 hat Titel, Inhalt der Section und erste Zelle bei x = 35. Linie darunter `1px solid rgb(236, 239, 243)` (`--color-border-subtle`, wie unter dem Spaltenkopf). Keine doppelte Linie, Tabelle und `th` ohne `border-top`. Karte 2 (nur `CardSection`): letztes Kind, Linie 0. `@when`/`@instead` an Table.tsx:101–104, Export im Block Tabelle von `index.ts`. Import über den Barrel im Typtest grün, `<CardSection />` ohne Kind ist ein Typfehler | ✓ (Kriterium), aber P1, P3 |
| N1 · App-Stand, Form, Name des dritten Teils | Nachbesserung 2, Zeile N1: Sie nennt den App-Stand (`lg`, Karte ohne Kopf, `padding: 16`, eigene Liste) und was gilt (dieselbe Form mit `CardSection` und `legend`). „ohne Buchung, zu entscheiden" steht in Fixture (stories:166), Badge (stories:332) und Legende. Damit stimmt auch der Kommentar „as the app names them" (stories:162). `befunde-app.md` L-371 nennt Ersatz, Übergang und Quelle. Die Breitenfrage hat llcto für den Owner entschieden (Weg B) | ✓ |
| H6 · `formatCount` in `ProgressBar` | StepRail.tsx:304. SSR `done=1234, total=5678`: `title` „1.234 von 5.678 Punkte erledigt", Label „1.234 von 5.678 Punkte" (alt „1234 von 5678 …"). Bei `41/118` ist das Markup alt = neu | ✓ |
| H7 · JSDoc an `done` | Progress.tsx:37 „a count, a fraction is rounded". SSR `done=2.5, total=4` → „3 von 4" | ✓ |
| *(Abgabeliste)* Spec = Code: Prop-Tabelle, Sätze daneben, Story-Tabelle, Story-Zahl | Typ, Pflicht, `never` und Standard von `legend` stimmen (Progress.tsx:42, 48–52). Die Story-Tabelle stimmt für `PartsLegend` und `PartsInUse` Zeile für Zeile. Zahl nach §6: 5 alt + `Parts`, `PartsEdge`, `PartsLegend` (Layout-Boolean), `PartsInUse` = 9, `index.json` führt 9 (≤ 10). `Section` steht bei der Karte, Table hat jetzt 7. Zwei Sätze der Schnittstelle stimmen nicht → P2 | ✗ (P2) |
| *(Abgabeliste)* `@when`/`@instead`, Barrel | `CardSection` trägt beides, `check:when` Exit 0. `ProgressPart` und `CardSection` kommen über den Barrel. Die Nachbarn verweisen nicht auf den neuen Export → P3 | ✗ (P3) |
| *(Abgabeliste)* kein Hex, kein px, keine Label-Map, Code englisch | In den hinzugefügten TSX-Zeilen kein Hex. px nur in `Table cols` und im Story-Rahmen `gap: 12, maxWidth: 620` (Table.stories:160, Q2). Keine Label-Map, die Namen kommen vom Aufrufer. `check:language` Exit 0 | ✓ |
| V7 · Farbe nie allein | `parts-in-use`: Jede Farbe hat ihr Wort in der Legende. Es sind dieselben Wörter wie an den Badges der zweiten Karte („wartet auf eine Rückfrage", „ohne Buchung, zu entscheiden"). Damit ist H4 gelöst | ✓ |
| Kontrast der Marken ≥ 3:1 | Gerechnet aus den berechneten Farben gegen Weiß: 3,45 · 3,55 · 5,52. Gegen `surface-head`/`bg-soft` laut Tabelle unter „Verhalten" ≥ 3,19. Text der Legende rgb(113, 113, 113) auf Weiß 4,88:1. Keine neue Farbe, `check:contrast` Exit 0 mit 76 Angaben | ✓ |
| Vorlesehilfe: nichts doppelt, nichts fehlt | `parts-in-use`: ein Bild „gebucht oder zugeordnet: 25, wartet auf eine Rückfrage: 2, ohne Buchung, zu entscheiden: 1", der Satz einmal als Text, die Legende nicht im Baum. `section`: Bild „ausgeglichen: 41, überfällig: 6", der Satz einmal | ✓ |
| Gleiches sieht gleich aus (Legenden im Set) | Die Marke gleicht `.pz-staffel-legend` (8 px, Radius 2 px). Die Schrift weicht ab, siehe Q1 | ✓, Q1 |
| *(§9)* Schrift aus der Skala, gleiche Rolle gleiche Stufe | `section`, Karte 2: Der Satz in `CardSection` steht in 16 px / 24,8 px, das ist die Schrift von `body`. Der Kartentitel darüber hat 14 px, die Zeilen haben 13,5 px → P1 | ✗ (P1) |
| Alte Stories unverändert | **SSR alt gegen neu:** `Labels`, `Sizes`, `WithoutLabel`, `Edge`, `Inline` gleich. `Parts` und `PartsEdge` unterscheiden sich nur im Namen des dritten Teils („/" → „,", N1). Table: `Filled`, `Empty`, `Loading`, `Error`, `CardHeadIconMeta`, `Density` gleich. **Browser** 1280 px: Labels 72 · 34,74 · 0 · 50 %; Sizes 77,78 % bei 4 / 6 / 10 px; WithoutLabel 89,83 · 0 %; Edge 0 · 100 · 100 · 0 %; Inline dreimal 34,74 %, dann 33,32 %. Die Labels sind dieselben wie in der Abnahme | ✓ |
| StepRail mit `ProgressBar` | SSR: alle 10 StepRail-Stories alt = neu. Browser 1280 und 1920 px, `screen-header` und `screen-header-without-nav`: „41 von 118 Punkte", `title` „41 von 118 Punkte erledigt", Spur 120 px, Füllung 34,74 % | ✓ |
| Konsole, Querlauf, Tastatur | 26 Stories ohne `error`, `warning` und Ausnahme. Es stehen nur `[vite]` (debug) und der Hinweis auf die React-DevTools (info) da. Bei keiner Breite ist `scrollWidth` > `innerWidth`. 0 fokussierbare Elemente in `parts-legend`, `parts-in-use` und `section` | ✓ |
| Wächter, Build | Exit 0: `pnpm typecheck`, `check:type`, `check:language`, `check:when`, `check:icons`, `check:contrast` (76 Angaben), dazu `check:language --test` und `check:when --test`. `check:classes` Exit 1, nur mit v3clt, v3clt__step, v2tbl__foot, cy-page. `storybook build -o <Scratchpad>`: „Storybook build completed successfully" | ✓ |

Nachgeprüft von / am: Claude (designsystem, fremde Nachprüfung) / 2026-10-27 · Offene Punkte: P1–P3; Q1–Q5

**Mängel**

- **P1 · Ein Satz in `CardSection` erbt die Schrift der Seite.**
  `.v2card__section` (v3.css:57) setzt keine Größe, obwohl das `@when` „one
  sentence about the whole list" anbietet. In `Table.stories.tsx:185` steht
  der Satz deshalb in 16 px unter einem 14-px-Kartentitel. Zu tun:
  `.v2card__section` die Rolle Fließtext geben (`font-size: var(--fs-ui)`),
  so wie `.v2card__f` seine Größe selbst setzt, und `section` neu messen.
- **P2 · Zwei Sätze der Schnittstelle stimmen nicht mit dem Code.**
  - (a) Z. 62: Der Beispielsatz endet auf „zu entscheiden: 1". Der Teil heißt
    seit Nachbesserung 2 „ohne Buchung, zu entscheiden" (stories:166), der
    Standard-Satz in `Parts` endet also auf „ohne Buchung, zu entscheiden: 1".
  - (b) Z. 70: „der des Kopfes, 12 / 18 px". Der Kopf hat `14px 18px`
    (v3.css:21), die Section `12px 18px` wie der Fuß. Gleich ist nur der
    seitliche Einzug.
  - Zu tun: Der Spec-Autor bringt beide Sätze auf den Code.
- **P3 · Die Nachbarn kennen `CardSection` nicht.** Das `@instead` von
  `CardHead` (Table.tsx:42–43) und von `CardFoot` (Table.tsx:114–115) nennt den
  neuen Export nicht. `Card` sagt „with a header" (Table.tsx:17), dabei zeigen
  `PartsInUse` und `Section` eine Karte ohne Kopf. CLAUDE.md §3: „der
  Nachbarfall bekommt seinen `@instead`-Verweis". Zu tun: an `CardHead` und
  `CardFoot` je einen Verweis „… → CardSection" ergänzen und im `@when` von
  `Card` die Karte ohne Kopf nennen.

**Hinweise**

- **Q1 · Drei Legenden, drei Schriften.** `.v2bar__legend` (v3.css:1367)
  steht in `--fs-ui-2xs` und `text-subtle`, mit 12 / 4 px Abstand. Das
  genannte Vorbild `.pz-staffel-legend` (v3.css:684), ebenfalls die Legende
  eines gestapelten Balkens, steht in `--fs-ui-xs` und `text-muted`, mit
  14 / 5 px. `.v3period__legend` steht in `--fs-ui-sm`. Die Wahl folgt dem
  Label (Entscheid zu H3). 2xs ist aber laut `tokens.css:117` für „axis tick,
  step number" vorgesehen. Für 0119 bzw. den Owner: eine Legenden-Schrift im
  Set festlegen oder die Ausnahme in der Guideline benennen.
- **Q2 · px im Story-Rahmen.** `Table.stories.tsx:160` schreibt `gap: 12,
  maxWidth: 620`, wie die Nachbar-Stories Z. 115 und 198. `PartsInUse` zeigt
  mit `var(--space-4)`, dass es ohne px geht.
- **Q3 · CSS-Reihenfolge.** `.v2card__section` (v3.css:54–58) steht zwischen
  dem Kommentar „Card foot — pagination …" (Z. 53) und `.v2card__f` (Z. 60).
  Der Kommentar steht damit über der falschen Regel.
- **Q4 · `CardSection` direkt vor `CardFoot` ergibt zwei Linien.** Die
  Section zieht unten 1 px `border-subtle`, der Fuß oben 1 px `border`. Keine
  Story zeigt den Fall. Kommt er, dann die Linie dort wie beim letzten Kind
  weglassen.
- **Q5 · Herleitung und Inventar.** Die Einordnung nennt für `CardSection`
  keine Regel aus `spec-schreiben` §3. Die Herleitung (Entscheid von llcto für
  den Owner, eine Verwendung) steht nur in Nachbesserung 2.
  `design-guidelines.md:554` nennt `parts`, aber nicht `legend`. Beim nächsten
  Griff je einen Halbsatz ergänzen.

## Nachbesserung 3 · 2026-10-27 (Bauender, nach Nachprüfung 2)

| Punkt | Behebung |
|---|---|
| P1 | `.v2card__section` setzt die Schrift der Zeile, `font-size: var(--fs-ui)` und `color: var(--color-text)`. Ein Satz darin erbt nicht mehr die 16 px der Seite. |
| P2 | Prop-Tabelle: Der Beispielsatz endet auf „ohne Buchung, zu entscheiden: 1". Für `CardSection` steht jetzt „seitlich 18 px wie Kopf und Fuß, oben und unten 12 px wie der Fuß". Der Kopf hat oben und unten 14 px, das gilt nicht als gleich. |
| P3 | Verweise am Nachbarn: Das `@instead` von `CardHead` nennt „a summary across the card's width under the head → CardSection", das von `CardFoot` nennt „a line before the rows → CardSection". Das `@when` von `Card` nennt die Karte ohne Kopf, „where the head above the card already names it". |
| Q3 | Der Kommentar zum Kartenfuß steht wieder über `.v2card__f`. |
| Q4 | `.v2card__section:has(+ .v2card__f)` hat keine Linie, der Fuß bringt seine eigene mit. |
| Q5 | **Einordnung von `CardSection`:** `spec-schreiben` §3, Regel 2. `Card` deckt den Fall zu vier Fünfteln, es fehlt die Zeile auf dem Einzug. Die Designentscheidung kommt wieder: Die Seite …/close/documents braucht sie heute, und der Entscheid von llcto für den Owner (Weg B) steht für die Vorlage. Einen Platz `band` in `CardHead` gibt es nicht, denn die Seite hat keinen Kartenkopf. `design-guidelines.md` §11 nennt `legend` jetzt in der Zeile „Daten". |
| Q1 | Offen für 0119 bzw. den Owner. Die Legende steht in der Schrift des Labels (`--fs-ui-2xs`, `text-subtle`). Das Label bleibt nach dem Entscheid von llcto bei 2xs, und Legende und Satz unter einem Balken sollen gleich stehen. Damit hat das Set drei Legenden mit drei Schriftgrößen (Staffel 11,5 px `text-muted`, Perioden 12,5 px, Balken 11 px). Ich ändere das hier nicht still. |
| Q2 | Kein Mangel: Die Rahmen-px (`gap`, `maxWidth`) in `Section` folgen den Nachbar-Stories. |

Stand nach Nachbesserung 3: P1–P3 behoben und gemessen (`.v2card__section` 13,5 px wie die Zeilen, `color` `--color-text`, vor `CardFoot` ohne Linie, Konsole leer). Der Status bleibt `Abnahme`, bis eine fremde Nachprüfung 3 sie bestätigt hat.

## Nachprüfung 3 · 2026-10-27

Kurze fremde Nachprüfung der Nachbesserung 3 gegen `09e887f`. Geprüft sind nur
P1–P3, Q1, Q3–Q5 und die Reichweite. Danach kam nur `664887d` dazu (0119,
0220), der keinen Code von 0227 berührt.

- **Browser:** gemessen mit `scripts/cdp.mjs` (ein Messbrowser,
  `chrome-headless-shell` 1247) gegen Storybook 6107. Gemessen bei 1280 px,
  zur Probe auch bei 700 und 1920 px, per `getBoundingClientRect` und
  `getComputedStyle`. Danach `pnpm cdp:clean`.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| P1 · Schrift in `.v2card__section` | v3.css:59 setzt `font-size: var(--fs-ui)` und `color: var(--color-text)`. **`section`:** Der Satz in Karte 2 steht in 13,5 px / 20,925 px, rgb(45, 45, 45). Das gleicht genau der Tabellenzeile (`td` 13,5 px / 20,925 px, rgb(45, 45, 45)). Der Kartentitel hat 14 px / 600, die Unterzeile 12,5 px. Vorher waren es 16 px / 24,8 px. Der Satz beginnt bei x = 35, wie Titel und erste Zelle. Label und Legende des Balkens in Karte 1 bleiben bei 11 px, denn sie setzen ihre Größe selbst. **`parts-in-use`:** Die Section hat 13,5 px. Satz und Legende stehen wie zuvor in 11 px, rgb(113, 113, 113). Der Titel der zweiten Karte hat 14 px, die Zeilen haben 13,5 px. Bei 700 und 1920 px ist alles gleich, ohne Querlauf, die Konsole ist leer | ✓ |
| P2 (a) · Beispielsatz Z. 62 | `parts`, Zeile „Satz aus allen Teilen": Das Label lautet Zeichen für Zeichen „gebucht oder zugeordnet: 25, wartet auf eine Rückfrage: 2, ohne Buchung, zu entscheiden: 1" (Progress.tsx:76). In den vier übrigen Zeilen steht derselbe Satz als `aria-label` des Balkens | ✓ |
| P2 (b) · `CardSection` Z. 70 | Der Kopf hat `14px 18px` (v3.css:21), der Fuß `12px 18px` (v3.css:66). Die Section hat `12px 18px` (v3.css:58, so gemessen). Die Schrift ist `--fs-ui` wie bei `.v2tbl__row` (v3.css:154). Die Linie darunter ist 1px solid rgb(236, 239, 243), dieselbe wie die Trennlinie der Zeilen (v3.css:153, gemessen in `parts-in-use`). Als letztes Kind und vor `CardFoot` ist sie 0, siehe Q4. Table.tsx:108–110 rendert nur das `div` mit der Klasse. Jeder Satz der Zeile stimmt | ✓ |
| P3 · `@when`/`@instead` der Nachbarn | Das `@when` von `Card` nennt die Karte ohne Kopf (Table.tsx:17–18). Das `@instead` von `CardHead` nennt „A summary across the card's width under the head → CardSection" (Table.tsx:44–45). Das `@instead` von `CardFoot` nennt „A line before the rows → CardSection" (Table.tsx:117). `pnpm check:when` Exit 0 | ✓ |
| Q3 · Lage des Kommentars | Der Kommentar in v3.css:53–56 gehört zu `.v2card__section`. „Card foot — …" (v3.css:64) steht direkt über `.v2card__f` (Z. 65) | ✓ |
| Q4 · keine doppelte Linie vor `CardFoot` | In `section` bei 1280 px per JS vier Karten aufgebaut, aus `.v2card`, `.v2card__h`, `.v2card__section`, `.v2card__f` und `.v2tbl`. `CSS.supports('selector(:has(+ a))')` ergibt `true`. **Kopf · Section · Fuß und Section · Fuß:** Die Section hat unten 0, der Fuß oben 1px solid rgb(221, 226, 232) (`--color-border`), Abstand 0. Es bleibt also eine Linie. **Section · Tabelle · Fuß:** Die Section behält ihre Linie (1px, rgb(236, 239, 243)). **Section als letztes Kind:** 0. Die Konsole ist leer | ✓ |
| Q5 · Einordnung und §11 | Nachbesserung 3 nennt `spec-schreiben` §3, Regel 2, mit Grund: vier Fünftel, eine Verwendung heute, Weg B als Vorlage. Das trägt mit einer Einschränkung, siehe S1. `design-guidelines.md:554`, Zeile „Daten": „`parts`, mit `legend`". Die Zeile „Fläche" (Z. 529) nennt `CardSection` | ✓, S1 |
| Q1 · Legenden-Schrift | Offen als Frage an 0119 bzw. den Owner. Die Nachbesserung nennt die drei Größen und sagt „nicht still geändert". Seit `664887d` steht die Frage auch in 0119:56 und im Ausbau von 0220 (Z. 217), mit Auslöser und dem Entscheid von llcto für den Owner: „einmal festlegen, nicht jetzt umbauen" | offen (Owner), sauber benannt |
| Reichweite | `grep -rn "v2card__section\|CardSection" src` trifft nur `index.ts:152`, `Table.tsx:45, 108–109, 117`, `Table.stories.tsx` (Import, `Section`), `Progress.stories.tsx` (Import, `PartsInUse`) und `v3.css:57–62`. Keine andere Karte im Set trägt die Klasse | ✓ |
| Wächter | Exit 0: `pnpm typecheck`, `check:type`, `check:when`. `check:classes` Exit 1, nur mit v3clt, v3clt__step, v2tbl__foot, cy-page. Kein `pnpm build` im Arbeitsbaum | ✓ |

**Hinweis**

- **S1 · Regel 2 passt nur sinngemäß.**
  - Regel 2 erweitert um **eine Prop**. `CardSection` ist dagegen ein neuer
    Export der Familie `Table.tsx`.
  - Die Vorbedingung „zwei geplante Verwendungen oder eine Design-Vorlage"
    gilt nur, wenn man den Entscheid von llcto für den Owner (Weg B) als
    Vorlage liest. Heute gibt es eine Verwendung.
  - Den Baustein trägt dieser Entscheid (CLAUDE.md §7: Ein neuer Baustein
    geht an den Owner), und die Nachbesserung nennt ihn. Am Ergebnis ändert
    das nichts.
  - Die Einordnung oben (Z. 23–48) nennt `CardSection` noch nicht. Beim
    nächsten Griff dort einen Halbsatz ergänzen: Die Familie wird um einen
    Export erweitert, nach Entscheid von llcto für den Owner.

Nachgeprüft von / am: Claude (designsystem, fremde Nachprüfung) / 2026-10-27 · Offene Punkte: Q1 als Owner-Frage (0119, 0220); S1

S1 nachgetragen (Bauender, 2026-10-27): Die Einordnung nennt `CardSection` jetzt mit dem Entscheid, der ihn trägt.
