# 0147 · `DataTable` rechnet seine Mindestbreite selbst

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-09, am selben Tag nachgearbeitet |
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
Entität nachsieht.** **Vier** `DataTable`-Aufrufer im Set setzen `minWidth`
selbst; alle übrigen Treffer eines `grep` reichen es nur an das Primitive
`Table` durch, das diese Aufgabe nicht anfasst.

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
| `AutoMinWidth` | Dieselbe Tabelle bei **460 px**, einmal ohne `minWidth` (rechnet 656 px, scrollt) und einmal mit `minWidth={0}` (quetscht auf 458) — der Unterschied, um den es geht. **Nicht 700 px:** dort passt die Rechnung hinein, und beide Hälften sähen gleich aus |
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
- [ ] Die **vier** `DataTable`-Aufrufer, die `minWidth` selbst setzen, sind
      unverändert: dieselbe Zahl, dasselbe Verhalten
- [ ] `columnsMinWidth` liefert für `DOCUMENT_LIST_COLUMNS` dieselbe Zahl wie
      `sourceDocumentMinWidth` — die alte Rechnung ist nicht neu erfunden,
      sondern umgezogen

## Abnahme

Fremde Abnahme am 2026-09-09 (zweiter Agent, hat nicht gebaut). Weil diese
Aufgabe das Verhalten **jeder** Tabelle ohne `minWidth` ändert, ist breiter
gemessen worden als die Kriterien verlangen: neun Stories in vier Breiten
(1400 · 760 · 700 · 500 px) mit `scripts/cdp.mjs` gegen den Dev-Server auf
6107, dazu beide Rechnungen über alle vier Beleg-Spaltensätze im Browser
gegeneinander. **Kein Mangel im Verhalten**; die drei ✗ stehen im Text.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| **Fest** | | |
| `pnpm typecheck` und `pnpm build` grün | beide am 2026-09-09 gelaufen, `exit 0` (`tsc --noEmit`; Storybook-Build nach `storybook-static`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `columnsMinWidth` trägt beide (`DataTable.tsx:73–74`), Rumpf und JSDoc englisch; `pnpm check:when` grün. Barrel führt den Export (`index.ts:197`) | ✓ |
| Kein Hex, kein px in der Komponente | kein Hex, kein `px`-Literal. **Vorbehalt:** `GUTTER = 10` und `PADDING = 36` (`:77–80`) sind zwei Maße aus `v3.css` (`gap: 10px`, `padding: … 18px`) als Zahl im TSX. Wörtlich aus `sourceDocumentMinWidth` übernommen, mit Herkunftskommentar — aber sie gelten jetzt für **jede** Tabelle des Sets: wer `.v2tbl__row { gap }` oder das Kartenpolster ändert, verrechnet ab dann still das ganze Set. Kein Verstoß gegen den Buchstaben, aber die Stelle, die als nächste altert | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen. Der Punkt, der hier zählt — „ein Baustein mit `minWidth` oder innerem Scrollen steht in einem Raster-/Flex-Kind nur mit `min-width: 0`" — **greift nicht**, und das ist gemessen: `.v2tbl__scroll` ist ein Scrollrahmen, und dessen automatische Mindestgröße ist 0. Story `Empty` (zwei Karten in `1fr 1fr`) bei 1200/700/500 px: Karten 576/326/**226** px bei `min-width: 296px` am Inneren, `document.scrollWidth === window.innerWidth` in allen drei Breiten. Die Seite läuft **nicht** über; das Raster bläht nicht auf | ✓ |
| Im Browser angesehen | eigener `cdp.mjs`-Lauf des Abnehmenden; alle Zahlen unten stammen daraus | ✓ |
| **Schnittstelle Zeichen für Zeichen** | | |
| `minWidth`, `number`, nicht Pflicht, „Übersteuerung statt Pflicht" | `DataTable.tsx:225` `minWidth?: number;` mit neuer JSDoc (`:216–224`), die genau das sagt und L-273 nennt | ✓ |
| **Im Code:** die alte JSDoc der Prop ist stehen geblieben | `DataTable.tsx:215` `/** From where it scrolls horizontally instead of squeezing. */` steht unmittelbar **über** dem neuen Block (`:216–224`) — zwei JSDoc an einer Prop, und der erste ist tot: Editor und `tsdoc` lesen den letzten. Der Satz trägt dazu noch die alte Lesart („von wo an sie scrollt"), die diese Aufgabe gerade abgelöst hat. Im Diff sichtbar: der Block wurde eingefügt, die Zeile nicht entfernt. Eine Zeile Nacharbeit, ohne Wirkung auf das Verhalten | ✗ |
| Der Export `columnsMinWidth(columns)` in `patterns/DataTable.tsx` | `:76` `export function columnsMinWidth<T>(columns: readonly ColumnDef<T>[]): number` — Ort, Name und Aufrufform wie die Spec; `readonly` ist weiter als der Text verspricht, nicht enger | ✓ |
| Die drei Fälle der Verhaltenstabelle | `:397` `minWidth={minWidth ?? columnsMinWidth(columns)}` — **`??` frisst die Null nicht**: `0` ist nicht nullish, geht durch, und `Table.tsx:125` `if (!minWidth) return body;` lässt den Scrollrahmen dann weg. Alle drei Zeilen der Tabelle sind eine Zeile Code | ✓ |
| „`1fr` ohne `minmax()` zählt als 0" | `:81–87`: `floor()` liest `minmax(<n>px` oder `^<n>px$`, sonst 0. Gemessen an der Story `Squeeze`: eine einzelne `1fr`-Spalte ergibt **36** — nur das Kartenpolster, genau die „Behauptung", die die Spec beschreibt | ✓ |
| **Variabel** | | |
| Ohne `minWidth` gerechnete Mindestbreite; bei enger Breite scrollt der innere Rahmen | Story `AutoMinWidth`, zwei Tabellen in je **460 px**: ohne `minWidth` `min-width: 656px`, Tabelle 656 px, `scrollWidth 656 > clientWidth 458` → **scrollt**; mit `minWidth={0}` kein Scrollrahmen, Tabelle **458 px** → quetscht. Die Zahlen des Bauberichts sind nachgerechnet und stimmen auf das Pixel | ✓ |
| `minWidth={0}` schaltet sie ab | Story `Squeeze`: **kein** `.v2tbl__scroll`, **kein** `.v2tbl__inner`, Tabelle 518 px in einer 520-px-Karte | ✓ |
| `minWidth={n}` gewinnt | Story `Override`: `min-width: 1600px`, Inneres 1600 px, scrollt in der 700-px-Karte — die gerechneten 656 sind überstimmt | ✓ |
| Die Listen im Set, die `minWidth` setzen, sind unverändert (gemessen an zwei davon) | gemessen an **fünf**, nicht zwei. Die vier `DataTable`-Aufrufer des Sets behalten ihre eigene Zahl: `CaseList` **1630**, `RecurringRuleOverview` **1620**, `BankTransactionList` **1400**, `BankTransactionWorklist` **1100**; dazu die Beleg-Story `RowAndPeek` unverändert **1508**. Sache erfüllt — zum Zahlwort siehe unten | ✓ |
| `columnsMinWidth` liefert für `DOCUMENT_LIST_COLUMNS` dieselbe Zahl wie `sourceDocumentMinWidth` | im Browser gegeneinander gerechnet, beide Funktionen über `sourceDocumentColumns()`: `DOCUMENT_LIST_COLUMNS` **1508 = 1508**, und zur Sicherheit die drei anderen Sätze: `INBOX` 828 = 828, `SUBMIT` 736 = 736, `STUCK` 1098 = 1098. Textlich sind die beiden Rümpfe identisch (`diff` über `DataTable.tsx:76–90` gegen `source-document-columns.tsx:551–568`: einzige Abweichung eine Leerzeile). Der Umzug war wörtlich einer | ✓ |
| **Ränder der Tabelle** (Nachtrag 2026-09-08) | | |
| „Zwölf andere Listen im Set setzen `minWidth`" / „Die **zwölf** Listen im Set, die `minWidth` setzen, sind unverändert" | `grep -rl 'minWidth=' src/ui/v3 \| grep -v stories` liefert **zwölf Dateien** — aber eine davon ist `DataTable.tsx` selbst (die Komponente, keine Liste), zwei sind Patterns (`ComparisonTable`, `Log`), und von den übrigen reichen sieben ihr `minWidth` an das Primitive `Table` weiter, das diese Aufgabe **gar nicht anfasst**. Betroffen sind **vier** `DataTable`-Aufrufer. Dazu widersprechen sich die beiden Sätze: einmal setzen die zwölf es „von Hand oder gar nicht", einmal setzen sie es. Das Zahlwort ist die Kopie eines `grep`, und sie zählt Dateien, nicht Listen | ✗ |
| Story-Tabelle: „`AutoMinWidth` · Dieselbe Tabelle bei **700 px**" | gebaut ist sie bei **460 px**, und der Abschnitt „Gebaut" erklärt zwei Absätze weiter selbst, warum 700 px nichts bewiesen: die gerechneten 656 passen da hinein. Der Bau hat die Story korrigiert und die Story-Tabelle darüber stehen lassen | ✗ |
| „`sourceDocumentMinWidth` bleibt … sie ist nach dieser Änderung redundant" — die einzige? | nein: **`accountMinWidth`** (`account-columns.tsx:298–310`) ist eine **dritte** zeichengleiche Kopie derselben fünfzehn Zeilen, ebenfalls aus dem Barrel exportiert (`index.ts:501`) und im Set nur noch von Stories benutzt. Gegengerechnet: `accountMinWidth(accountColumns()) === columnsMinWidth(accountColumns()) === 966`. Die Aufgabe tritt gegen die zweite Wahrheit an und lässt die dritte unerwähnt stehen; sie gehört in denselben Satz und in Abschnitt E | ✗ |
| Beobachtung: die Rechnung kennt die Spuren nicht, die `DataTable` selbst dazustellt | `columnsMinWidth` liest nur `columns`; das Raster trägt aber bis zu drei Spuren mehr — Auswahl und Chevron je 32 px (`--v2-tbl-pick`), die Aktionsspalte 180 px (`--v2-tbl-actions`), plus deren Zwischenräume, zusammen bis **274 px**. Gemessen an `RowActions` bei 760 px: `min-width: 656px`, tatsächliche Spurensumme **846 px**. **Es geht nichts verloren** — die feste Aktionsspur erzwingt den Überlauf, und der Scrollrahmen fängt ihn (`scrollWidth 828 > clientWidth 726`), die letzte Spalte ist erreichbar. Aber der Boden ist für jede Tabelle mit Griff- oder Aktionsspalte zu niedrig; er wirkt dort nicht, er wird nur nicht gebraucht | ✓ |
| Beobachtung: der Boden gilt auch für die Zustände ohne Zeilen | bei 500 px scrollen `Empty` (296 gegen 224 px), `Loading` und `Error` (656 gegen 466 px) — eine leere Tabelle bekommt jetzt einen Scrollbalken, wo sie vorher umbrach. Kein Text geht verloren: `.v2empty` steht auf `align-items: flex-start`, der Leertext beginnt links und bleibt sichtbar. Für Tabellen **mit** eigenem `minWidth` war das schon immer so; neu ist nur, wie viele es sind | ✓ |

Abgenommen von / am: zweiter Agent (nicht der Bauende), 2026-09-09 · Offene
Punkte: **vier** — drei im Text (ein Zahlwort, eine Story-Zeile, die der Bau
überholt hat, und eine dritte Kopie der Rechnung, die niemand nennt) und eine
tote JSDoc-Zeile im Code (`:215`). **Kein Punkt im Verhalten:** die
Verhaltensänderung ist an neun Stories in vier Breiten nachgemessen, die vier
Listen mit eigener Zahl bleiben auf ihrer Zahl, `minWidth={0}` schaltet ab,
und `??` frisst die Null nicht.

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

## Nacharbeit zur Abnahme, 2026-09-09

Vier Mängel, und einer davon trifft den Kern dieser Aufgabe.

**Es gab eine dritte Kopie.** `accountMinWidth` in `account-columns.tsx` war
zeichengleich mit `sourceDocumentMinWidth` und mit der neuen
`columnsMinWidth` — aus dem Barrel exportiert, im Set nur noch von Stories
benutzt. Die Abnahme hat sie gegengerechnet: 966 = 966.

Das ist bitter, weil diese Aufgabe **gegen** die zweite Wahrheit antritt und
die dritte nicht bemerkt hat. Ich habe nach der einen gesucht, die der Befund
nannte, statt zu fragen, wie viele es gibt. Sie ist jetzt weg, die
Kontenplan-Stories nehmen `columnsMinWidth`.

**Die tote JSDoc an der Prop.** Über dem neuen Block stand der alte Einzeiler
weiter — zwei JSDoc an einer Prop, der erste mit der abgelösten Lesart.
Gelöscht.

**„Zwölf Listen im Set".** Das Zahlwort zählte `grep`-Treffer über **Dateien**,
darunter `DataTable.tsx` selbst. Betroffen sind **vier** `DataTable`-Aufrufer;
die übrigen reichen `minWidth` nur an `Table` durch. Und die beiden Sätze
widersprachen sich obendrein („setzen von Hand oder gar nicht" gegen „setzen").

**Die Story-Tabelle sagte 700 px**, gebaut ist sie bei 460 — und zwei Absätze
weiter erklärt der Baubericht selbst, warum 700 nichts bewies. Die Story wurde
korrigiert, die Zeile darüber nicht.

### Zwei Beobachtungen der Abnahme ohne Mangelcharakter

**Die Rechnung kennt die Spuren nicht, die `DataTable` selbst dazustellt** —
Auswahlgriff (2 × 32 px) und Aktionsspalte (180 px). Gemessen: Boden 656,
tatsächlich 846. Es geht nichts verloren, weil die feste Aktionsspur den
Überlauf erzwingt und der Rahmen ihn fängt — aber der Wert ist eine
**Untergrenze**, keine exakte Angabe. Wer sich auf ihn verlässt, verlässt sich
auf „mindestens".

**`GUTTER = 10` und `PADDING = 36` sind CSS-Maße als Zahl im TSX.** Bisher
opt-in in einer Entitätsdatei, jetzt gültig für jede Tabelle des Sets: wer
`.v2tbl__row { gap }` oder das Kartenpolster ändert, verrechnet ab dann still
alles. Als **L-276** eingetragen.
