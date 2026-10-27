# 0227 · Progress `parts` — die Teile eines Ganzen in einem Balken

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` — Gruppe Daten, Familie `Progress.tsx` (Erweiterung von 0045/0046) |
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
- **Setzt auf:** `BadgeTone` aus `primitives/Badge.tsx` als Tonwort
  („neutral" · „info" · „success" · „warning" · „danger"). Es ist dasselbe
  Wort wie am `StatusBadge` derselben Seite, also gleiche Farbe für dieselbe
  Stufe. Dazu `formatCount` aus `format.ts` für die Zahlen im Satz.
  Server-Component, kein Client-JS.

## Schnittstelle

Neu ist nur `parts` und der Typ dazu. Die übrigen Props von 0045/0046 bleiben
unverändert.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `parts` | `ProgressPart[]` | nein | Die Teile eines Ganzen, in der gegebenen Reihenfolge von links. Das Ganze ist ihre Summe. Schließt `share`, `done`, `total` und `tone` aus (Typ `never`). | `Parts`, `PartsEdge`, `PartsInUse` |
| `ProgressPart.label` | `string` | ja | Name des Teils, vom Aufrufer, z. B. „gebucht oder zugeordnet". Steht im Satz als „label: Zahl". | `Parts` |
| `ProgressPart.value` | `number` | ja | Anzahl. Ein Wert ≤ 0 oder keine Zahl zählt als 0. | `PartsEdge` |
| `ProgressPart.tone` | `BadgeTone` | ja | Kritikalität des Teils. Gleiches Wort und gleiche Farbe wie am `StatusBadge`. | `Parts` |
| `label` | `string \| null` | nein | Wie bisher. Bei `parts` ist der Standard der Satz aus allen Teilen („gebucht oder zugeordnet: 25, wartet auf eine Rückfrage: 2, zu entscheiden: 1"). Ein eigener Satz ersetzt ihn, `null` blendet ihn aus. | `Parts` |
| `size`, `inline` | wie 0045/0046 | nein | gelten unverändert auch für `parts` | `Parts` |

```ts
export type ProgressPart = { label: string; value: number; tone: BadgeTone };
```

Typen aus `src/ludwig/`: keine. Die Teile und ihre Namen bestimmt die App. Das
Primitive kennt weder „Beleg" noch einen Zustand.

**Kann bewusst nicht:**
- **Eigenes Ganzes neben den Teilen** (`total` > Summe, Rest als leere Spur):
  Die Anfrage sagt „Summe = total". Siehe Ausbau.
- **Legende als eigener Block, Klick auf einen Teil:** Die Zuordnung der
  Farben tragen der Satz und die `StatusBadge`s der Liste darunter, siehe
  Verhalten. Ein Teil ist nicht bedienbar. Wer filtern will, nimmt die
  `FilterBar` der Liste.
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
  Zahl". Seine Farbe ist die des `StatusBadge` derselben Stufe in der Liste
  darunter. Wer nur eine Summe in den Satz schreibt („1 noch zu klären"),
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
zeigt `Parts`). Das macht 3, zusammen 8.

| Story | Beweist |
|---|---|
| `Parts` | drei Teile neutral · info · warning. Standard-Satz, eigener Satz, `label={null}` neben einer Zahl, `inline`, alle drei `size` |
| `PartsEdge` | 1 von 28 bleibt sichtbar bei 48, 120 und 320 px. Ein Teil 0 fällt weg, im Satz steht er. Alle Teile 0 und `parts=[]` ergeben die leere Spur. 12.480 von 12.481, alle fünf Töne |
| `PartsInUse` | Kopf einer `Card` „Eingegangene Belege" wie auf …/close/documents, Satz „28 Belege, 1 noch zu klären", Balken `inline` bei 1280 px Innenbreite |

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
- **Im Einsatz:**
  - In der Unterzeile des Kartenkopfs schrumpft der `inline`-Balken auf
    seine 120 px, dort sind 2 von 28 nur 8 px breit.
  - Die Story `PartsInUse` legt ihn deshalb in eine eigene Zeile unter dem
    Kopf, auf dessen Einzug, über die volle Breite (bei 1280 px: 1.059 px
    Spur, 1 von 28 = 38 px).
  - Das ist eine Empfehlung an die Aufrufstelle, keine Prop.
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
