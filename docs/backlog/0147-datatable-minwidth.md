# 0147 · `DataTable` rechnet seine Mindestbreite selbst

| | |
|---|---|
| Status | **Abnahme** — gebaut 2026-09-09, fremde Abnahme steht aus |
| Stufe | `patterns/` (`DataTable`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jede Tabelle mit festen Spuren hat eine Mindestbreite, und keine will sie von Hand ausrechnen |
| Quelle | Befund **L-273**, gesehen von `app-7b` an `/clients/willems-sabine-2/2026/documents`; Owner-Entscheid 2026-09-09 („ja bitte") |
| Ersetzt | `sourceDocumentMinWidth()` als Pflichtaufruf — die Funktion bleibt als Übersteuerung nutzbar |
| Spec von / am | Claude, 2026-09-09 |

## Der Befund

Auf Staging wird die Jahres-Belegliste bei 1456 px Fensterbreite rechts
**abgeschnitten** — „Verarbeitung" und „Erledigt" sind nicht sichtbar, und der
Rahmen scrollt nicht horizontal. Die Ursache ist nicht die Tabelle, sondern
eine vergessene Prop: die Seite übergibt kein `minWidth`.

`sourceDocumentMinWidth(cols)` ist gebaut, exportiert und dokumentiert. Sie
sagt sogar selbst, warum es sie gibt: *„Eine Zahl, die jemand von Hand
ausrechnen muss, ist eine Zahl, die falsch sein wird."* Genau das ist passiert
— nur nicht durch eine falsche Zahl, sondern durch gar keine.

**Ein Netz, das nur greift, wenn der Aufrufer es spannt, fängt die nicht auf,
die es vergessen.** Und der Aufrufer, der es vergisst, ist derselbe, der auch
sonst gerade an etwas anderes denkt.

## Die Ableitung gehört gar nicht zum Beleg

`sourceDocumentMinWidth` liest **nur** `ColumnDef.width` — jede feste Spur, den
Boden jeder flexiblen, die Zwischenräume und das Kartenpolster. Nichts daran
ist belegspezifisch; sie könnte über jede Spaltenliste laufen.

Dass sie im Beleg-Katalog wohnt, ist der eigentliche Fund hinter dem Befund:
**eine allgemeine Rechnung in einer Entitätsdatei findet nur, wer bei dieser
Entität nachsieht.** Zwölf andere Listen im Set setzen `minWidth` von Hand
oder gar nicht.

## Was gebaut wird

`DataTable` rechnet die Mindestbreite **selbst**, aus den Spalten, die es
ohnehin hat. `minWidth` bleibt — als **Übersteuerung**, nicht als Pflicht:

| Fall | Verhalten |
|---|---|
| `minWidth` nicht gesetzt | gerechnet aus den Spurbreiten (bisher: **keine** Mindestbreite) |
| `minWidth={n}` | `n` gilt — der Aufrufer weiß es besser |
| `minWidth={0}` | ausdrücklich **keine**: die Tabelle darf quetschen |

Der dritte Fall ist wichtig, weil es ihn gibt: eine Tabelle mit einer einzigen
flexiblen Spalte hat keinen sinnvollen Boden, und ein gerechneter von 36 px
wäre eine Behauptung. Wer quetschen will, sagt es.

## Was das für die Aufrufer heißt

Für die zwölf Listen im Set, die heute `minWidth` setzen: **nichts**, ihre Zahl
gewinnt weiter. Für alle anderen: sie bekommen eine Mindestbreite, wo sie
vorher keine hatten — und genau das ist der Zweck. Das ist eine
Verhaltensänderung, und sie muss gemessen werden: eine Tabelle, die vorher
quetschte, scrollt danach.

`sourceDocumentMinWidth` bleibt exportiert. Sie ist nach dieser Änderung
redundant, aber sie steht in der App im Einsatz — sie zu streichen wäre eine
Ablösung, kein Aufräumen, und die gehört in Abschnitt E.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `minWidth` | `number` | nein | **Neu: Übersteuerung statt Pflicht.** Ohne sie rechnet die Tabelle aus den Spurbreiten; `0` schaltet die Mindestbreite ab | `Squeeze` |

Dazu ein Export: **`columnsMinWidth(columns)`** in `patterns/DataTable.tsx` —
dieselbe Rechnung, für jeden, der eine Tabelle von Hand baut (`Table` statt
`DataTable`).

**Kann bewusst nicht:**

- **Die Breite des Fensters kennen.** Sie rechnet aus den Spalten, nicht aus
  dem Platz. Was zu breit ist, scrollt — das ist die Antwort, nicht das
  Problem.
- **Eine flexible Spur ohne Boden raten.** `1fr` ohne `minmax()` zählt als 0.
  Wer einen Boden will, schreibt ihn in die Spurbreite, wo er hingehört.

## Stories

| Story | Beweist |
|---|---|
| `AutoMinWidth` | Dieselbe Tabelle bei 700 px, einmal ohne `minWidth` (rechnet, scrollt) und einmal mit `minWidth={0}` (quetscht) — der Unterschied, um den es geht |
| `Squeeze` | `minWidth={0}` ausdrücklich: eine Tabelle mit einer flexiblen Spalte, die quetschen **soll** |
| `Override` | `minWidth={1600}` gewinnt über die gerechneten Werte |

Die bestehenden `DataTable`-Stories decken den Rest; sie sind zugleich die
Probe darauf, dass die Änderung nichts kaputt macht.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen

Variabel (aus dieser Spec):

- [ ] Ohne `minWidth` hat die Tabelle eine gerechnete Mindestbreite; bei 700 px
      scrollt der innere Rahmen, statt Spalten zu verlieren (`AutoMinWidth`,
      gemessen)
- [ ] `minWidth={0}` schaltet sie ab (`Squeeze`)
- [ ] `minWidth={n}` gewinnt (`Override`)
- [ ] Die zwölf Listen im Set, die `minWidth` setzen, sind **unverändert**:
      dieselbe Zahl, dasselbe Verhalten (gemessen an zwei davon)
- [ ] `columnsMinWidth` liefert für `DOCUMENT_LIST_COLUMNS` dieselbe Zahl wie
      `sourceDocumentMinWidth` — die alte Rechnung ist nicht neu erfunden,
      sondern umgezogen

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |

## Gebaut 2026-09-09

`columnsMinWidth()` in `patterns/DataTable.tsx`, exportiert; `DataTable` ruft
sie, wenn `minWidth` fehlt. Drei Stories.

**Der Umzug war wörtlich einer.** Die Rechnung ist dieselbe wie in
`sourceDocumentMinWidth` — Spurböden, Zwischenräume, Kartenpolster —, nur
generisch getippt. Nichts neu erfunden: eine zweite Rechnung für dieselbe Zahl
wäre genau die zweite Wahrheit, gegen die diese Aufgabe antritt.

**Gemessen** (`scripts/cdp.mjs`, Story `AutoMinWidth`, zwei Tabellen in je
**460 px** — enger als die gerechneten 656 px):

| Fassung | Tabellenbreite | Scrollrahmen |
|---|---|---|
| ohne `minWidth` | **656 px** — die Spalten behalten ihre Breite, der Rahmen scrollt | ja |
| `minWidth={0}` | **458 px** — gequetscht in den Rahmen | nein |

Und die Gegenprobe an einer bestehenden Liste: `RowAndPeek` steht unverändert
auf **1508 px**, ihr eigenes `minWidth` gewinnt weiter. Die zwölf Listen im
Set, die es setzen, merken von dieser Änderung nichts.

**Die erste Fassung der Story bewies nichts.** Sie stellte beide Tabellen in
700 px — und die gerechneten 656 px passen da hinein, also scrollte nichts und
beide sahen gleich aus. Ein Vergleich, dessen beide Hälften dasselbe zeigen,
ist keiner; erst bei 460 px trennt er sich. Gefunden hat das die Messung, nicht
das Ansehen.

**`sourceDocumentMinWidth` bleibt.** Sie ist jetzt redundant, aber die App
benutzt sie — sie zu streichen wäre eine Ablösung, keine Aufräumarbeit, und
die gehört in Abschnitt E des Registers.
