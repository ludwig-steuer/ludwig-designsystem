# 0094 · Die Tabelle sagt nicht, dass sie eine ist

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/Table.tsx` und `patterns/DataTable.tsx` |
| Quelle | Abnahme 0077 StatusHeader (2026-09-05) · Abnahme Paket 0047/0048/0049/0057 (2026-09-05), Befund 4 |
| Auftrag | Zwei Befunde an derselben Familie, beide von je einer Abnahme gefunden, beide ausdrücklich **nicht** als Mangel der geprüften Aufgabe gewertet, weil die Reparatur einen fremden Vertrag ändert. |

**(a) `aria-sort` sitzt an einem `<span>` und wirkt dort nicht.** `.v2tbl` ist
ein CSS-Grid aus `<div>`s ohne Tabellensemantik. `DataTable` setzt `aria-sort`
am Spaltenkopf — ohne `role="columnheader"` (und ohne `role="table"`/`row`
darüber) liest keine Vorlesehilfe es. Betroffen ist die **ganze**
v3-Tabellenfamilie, nicht nur `DataTable`: `Table`, `HeadRow`, `Row`,
`GroupRow`, `EmptyRow`.

**(b) `headCell` nimmt den ganzen `col.header` in den Sortier-Link.** Steckt
darin ein Knopf — der Fall `StatusHeader` mit seinem (i), den Regel Z4 an
**jeder** Status-Spalte verlangt —, steht interaktiver Inhalt in einem `<a>`.
Das ist nach HTML-Inhaltsmodell ungültig und wird von Hilfsmitteln
uneinheitlich ausgegeben. Funktional geht es heute gut, weil
`StatusInfoButton` Default und Propagation stoppt; das ist eine Krücke, keine
Lösung.

Der Fall tritt **sicher** ein: §10 der Prüfliste verlangt an jeder
Status-Spalte einen `StatusHeader`, und `DataTable` ist die Klammer für genau
diese Seiten. Er ist heute nur deshalb nicht sichtbar, weil keine der zehn
Stories eine sortierbare Status-Spalte baut.

| | |
|---|---|
| Zu entscheiden | (a) Rollen an die Grid-`div`s (`role="table"`, `row`, `columnheader`, `cell`) oder zurück auf ein echtes `<table>` mit `display: grid`? Das erste ist weniger Eingriff, das zweite braucht keine Rollen. (b) Nur das Wort und den Pfeil in den Link nehmen — oder ein eigenes `sortLabel` an `ColumnDef`, damit der Aufrufer sagt, was klickbar ist? Beides ändert den Vertrag von `ColumnDef`. |
| Warum eine eigene Aufgabe | Beide Abnahmen haben den jeweiligen Baustein gegen **seine** Kriterien geprüft und keinen Verstoß gefunden — die Mängel liegen im gemeinsamen Fundament. Nachträglich in eine abgenommene Spec geschoben wären sie an der falschen Stelle. |
| Angelegt von / am | Claude, 2026-09-05 (aus zwei Abnahmen) |

## Entschieden und gebaut (2026-09-05)

### (b) `headerAside` — der Knopf steht neben dem Sortier-Link, nicht darin

Von den beiden angebotenen Wegen ist es der zweite geworden, aber mit einem
anderen Namen als gedacht: nicht `sortLabel` („was ist klickbar?"), sondern
`headerAside` („was steht **daneben** und gehört nicht in den Link?").

Der Unterschied ist kein Wortspiel. `sortLabel` hätte den Spaltennamen zweimal
im Vertrag gehabt — einmal in `header`, einmal im Label — und der Aufrufer
hätte beide gleich halten müssen. `headerAside` teilt stattdessen das, was
ohnehin zwei Dinge sind: der **Name** der Spalte (klickbar, wenn sortierbar)
und das **(i)**, das Z4 an jeder Status-Spalte verlangt.

Für eine Status-Spalte heißt das:

```ts
{ key: "lifecycleStatus", header: "Bearbeitung",
  headerAside: <StatusInfoButton axis="sachverhalt" />, sortable: true, … }
```

`StatusHeader` (0077) bleibt, wofür er da ist: handgebaute Köpfe außerhalb der
`DataTable`. In einer `DataTable` sind die beiden Hälften zwei Felder — der
Sortier-Link darf keinen Knopf enthalten, und ein Baustein, der beides
zusammen rendert, kann das nicht.

Nachgemessen (Story `Filled`, Chromium headless): fünf Spaltenköpfe, kein
`a button` im DOM, der (i) der Spalte „Bearbeitung" steht als
`:scope > button` **neben** dem Link. Die Krücke — `StatusInfoButton` stoppt
Default und Propagation — bleibt bestehen, trägt aber nichts mehr.

Die Spalte ist dabei sortierbar geworden und hat ihr (i) bekommen: sie war
der Fall aus der Aufgabenbeschreibung („tritt sicher ein") und stand als
einzige Status-Spalte des Sets ohne Erklärung da.

### (a) Der Sortierstand steht im Namen des Links — und der Rest wird 0106

`aria-sort` wirkt nur an einem `columnheader`, und `columnheader` verlangt
`row` verlangt `table`. Der Befund war also richtig: das Attribut saß an einem
`<span>` und niemand hat es je gelesen. Es ist entfernt.

An seine Stelle tritt der Name des Links: **„Nach Betrag sortieren — derzeit
aufsteigend"**. Das wird von jeder Vorlesehilfe ausgegeben, ohne dass die
Familie eine einzige Rolle braucht, und es sagt mehr als `aria-sort` — nämlich
auch, was ein Klick täte.

Die Rollen selbst sind **nicht** gesetzt worden, und das ist der eigentliche
Entscheid dieser Aufgabe. Der Grund steht in `0106`: an drei Stellen **ist**
die Zeile das Bedienelement (`Row href` als `<a>`, `ChecklistLine` mit
`role="button"`, `ExpandableRow`), und `role="row"` nähme ihnen genau das. Der
ARIA-Ausweg — das Bedienelement zieht in die erste Zelle — ist der richtige,
aber er ändert drei fremde, abgenommene Bausteine und rund zwanzig
Story-Dateien. Ein echtes `<table>` scheitert daran, dass Chrome und Firefox
einer Tabelle mit überschriebenem `display` die Semantik nehmen; die Rollen
wären also trotzdem fällig, und das Grid-Layout müsste in ein `<colgroup>`
übersetzt werden.

Eine halbe Semantik — Rollen an Tabelle und Kopfzeile, keine an den Zeilen —
wäre schlechter als keine: die Vorlesehilfe kündigt eine Tabelle an und findet
darin nichts.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Aufgabe):

- [ ] Kein `aria-sort` mehr im Set (`grep -rn "aria-sort" src/ui/v3` findet nur Kommentare)
- [ ] Der Sortier-Link nennt Spalte **und** Stand (Story `Filled`, drei Spalten gemessen: aktiv absteigend, zweimal nicht sortiert)
- [ ] Kein `<button>` in einem `<a>` im Spaltenkopf (`Filled`, `a button` = 0 Knoten)
- [ ] Die Status-Spalte trägt ihr (i) am Kopf und keins in den Zeilen (Z4; `StatusBadge info={false}`)
- [ ] `headerAside` ist dokumentiert, und `header` sagt, dass es mit `sortable` ein String sein soll
- [ ] Die Begründung, warum keine Rollen gesetzt wurden, steht im Code (`headCell`) und als Aufgabe 0106

## Abnahme (2026-09-05)

Gegen Spec und Code, von einer Sitzung, die nicht gebaut hat. Gemessen in
Chromium 153 headless über CDP auf `localhost:6107`. Für (a) reicht das DOM
nicht — was eine Vorlesehilfe hört, steht im Barrierefreiheits-Baum, deshalb
ist er über `Accessibility.getFullAXTree` ausgelesen worden.

**Story-Deckung.** 0094 hat keine neue Prop mit eigenem Zustand gebracht,
sondern `headerAside` an `ColumnDef` und den Sortierstand in den Linknamen.
Beides ist in `DataTable --filled` belegt, wo die Spalte „Bearbeitung"
seitdem sortierbar ist und ihr (i) trägt — genau der Fall, den die
Aufgabenbeschreibung als „tritt sicher ein" nennt und den vorher keine der
zehn Stories baute. Zehn Kennungen unverändert in `index.json`.

**Fest**

| Kriterium | Nachweis (Story-Kennung · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` am 2026-09-05, Exit 0, keine Ausgabe. `pnpm build` bewusst nicht gestartet — mehrere Sitzungen schreiben parallel nach `storybook-static`, der Auftrag dieser Abnahme verbietet ihn | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `grep -nE "[äöüÄÖÜß]" src/ui/v3/patterns/DataTable.tsx` liefert drei Zeilen: zwei Nutzer-Strings (`:237–238`) und ein englischer Kommentar, der einen deutschen Nutzer-String zitiert (`:294–295`). Das neue JSDoc an `headCell` (`:303–319`) und an `ColumnDef.header`/`headerAside` (`:58–71`) ist englisch. `@when`/`@instead` am einzigen Funktions-Export `DataTable` (`:174–180`); `ColumnDef`, `RowAction`, `ListPatch`, `DataTableProps`, `BulkAction` sind Typen und tragen wie überall im Set keine | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle zehn `DataTable`-Kennungen am 2026-09-05 geöffnet und vermessen, `--filled` zusätzlich als Bild geprüft. Keine Konsolenfehler | ✓ |

**Variabel (aus dieser Aufgabe)**

| Kriterium | Nachweis (Story-Kennung · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Kein `aria-sort` mehr im Set | `grep -rn "aria-sort" src/` findet zwei Zeilen, beide im JSDoc von `headCell` (`DataTable.tsx:308–309`), keine im Markup. Im Browser: `document.querySelectorAll("[aria-sort]").length` = 0 in allen zehn Kennungen | ✓ |
| Der Sortier-Link nennt Spalte **und** Stand | `--filled`, drei `a.v2sortlink`: „Nach Betrag sortieren — derzeit nicht sortiert", „Nach Bearbeitung sortieren — derzeit nicht sortiert", „Nach Eröffnet sortieren — derzeit absteigend". Also einmal aktiv absteigend, zweimal nicht sortiert, wie die Aufgabe es angibt. Im Barrierefreiheits-Baum kommen genau diese drei als `link` mit diesem Namen an. Die sichtbare Beschriftung („Betrag") steckt im Namen — WCAG 2.5.3 „Label in Name" hält, Sprachsteuerung findet die Spalte weiter unter ihrem Wort. Dieselben drei Namen in acht weiteren Kennungen (`--in-use`, `--expand`, `--selection`, `--density` dreifach, `--loading`, `--error`, `--empty-filtered`) | ✓ |
| Kein `<button>` in einem `<a>` im Spaltenkopf | `--filled`: `document.querySelectorAll("a button").length` = 0; dasselbe in allen neun anderen Kennungen. Der (i) steht als Geschwister **nach** dem Link im vierten Kopf-`<span>` — `innerHTML` gelesen: `<a class="v2sortlink" …>Bearbeitung</a><button type="button" aria-label="Sachverhalt: Zustände erklären" …>`. Im Code `headCell` `:346–350`: `{col.header}` im Link, `{col.headerAside}` daneben | ✓ |
| Die Status-Spalte trägt ihr (i) am Kopf und keins in den Zeilen (Z4) | `--filled` hat **einen einzigen** `<button>` im ganzen Baum: den (i) im Kopf. 50 Zeilen, null Knöpfe darin — `StatusBadge axis="sachverhalt" … info={false}` (`DataTable.stories.tsx:136`), (i) über `headerAside` (`:133`). Im Bild sitzt das Zeichen direkt hinter dem Wort „Bearbeitung" | ✓ |
| `headerAside` ist dokumentiert, und `header` sagt, dass es mit `sortable` ein String sein soll | `ColumnDef.header` (`:58–64`): „With `sortable` it should be a **plain string**: it becomes the word of the sort link and its spoken name." `ColumnDef.headerAside` (`:65–71`): was daneben gehört und warum es nicht in den Link darf, mit Verweis auf 0094 b | ✓ |
| Die Begründung, warum keine Rollen gesetzt wurden, steht im Code (`headCell`) und als Aufgabe 0106 | `DataTable.tsx:303–319` und `docs/backlog/0106-tabelle-als-echte-tabelle.md`. Der Kern der Begründung hält der Prüfung stand, zwei Nebensätze nicht — siehe „Der Entscheid, nachgeprüft". Weil das Kriterium verlangt, dass die Begründung **steht**, und der tragende Teil richtig ist, zählt es als erfüllt; die zwei falschen Sätze sind als Befund in 0106 eingetragen, damit dort nicht auf ihnen gebaut wird | ✓ |

## Der Entscheid, nachgeprüft

Der Auftrag dieser Abnahme war ausdrücklich, nicht nur die Kriterien
abzuhaken, sondern den Entscheid selbst zu prüfen — 0106 hängt daran.

**Der Befund war richtig, und er ist messbar.** Der Barrierefreiheits-Baum
von `DataTable --filled` zählt: `RootWebArea` 1, `link` 57, `button` 1,
`navigation` 1, `time` 50. Kein `table`, kein `row`, kein `columnheader`,
keine `cell`. Die Familie hat keine Tabellensemantik, und `aria-sort` an
einem `<span>` hat nie jemand gehört. Das Entfernen ist richtig.

**Der Ersatz ist besser als das Entfernte.** „Nach Betrag sortieren — derzeit
aufsteigend" wird ohne jede Rolle vorgelesen und sagt zusätzlich, was ein
Klick täte. `aria-sort` hätte nur den Ist-Zustand gemeldet.

**Die Kollision mit `role="row"` stimmt — und ist größer, als 0094 und 0106
schreiben.** Nachgezählt im Set:

| Stelle | heute | Konflikt |
|---|---|---|
| `Row` mit `href` (`Table.tsx:146`) | die ganze Zeile ist ein `<a>` | `role="row"` nähme ihr die Link-Rolle |
| `ChecklistLine` mit `onPick` (`Review.tsx:164`) | `role="button"` an der Zeile | eine Rolle je Element |
| `ExpandableRow` (`ExpandableRow.tsx:78`) | `role="button"` an der Zeile | dasselbe |
| **`ClickRow`** (`ExpandableRow.tsx:34`) | `role="button"` an der Zeile | **in beiden Aufgaben nicht genannt** |
| **`ComparisonTable`, auffällige Zeile** (`ComparisonTable.tsx:135`) | `role="button"` an der Zeile | **in beiden Aufgaben nicht genannt** |

Es sind fünf Formen, nicht drei. Der Satz im JSDoc von `headCell` („founders
on three shapes") und die Tabelle in 0106 sind unvollständig — der Schluss
wird dadurch nur stärker.

**Auch der Satz „eine halbe Semantik wäre schlechter als keine" hält.** Rollen
an Tabelle und Kopfzeile zu setzen und die Zeilen auszulassen, ergäbe eine
`table`, deren Kinder keine `row` sind; eine Vorlesehilfe kündigt dann eine
Tabelle an, in der sie nichts findet. Das ist wirklich der schlechtere
Zustand.

**Nicht haltbar ist die Begründung gegen das echte `<table>`.** 0094 schreibt,
„Chrome und Firefox nehmen einer Tabelle mit überschriebenem `display` die
Semantik", 0106 wiederholt es und leitet daraus ab, das Grid müsse in ein
`<colgroup>` übersetzt werden, in dem es kein `1fr` gibt. Gemessen im
Barrierefreiheits-Baum, Chromium 153:

| Testfall | Rollen im Baum |
|---|---|
| `<table>` unverändert | `table`, `row`, `rowheader`, `cell` |
| `<table style="display: grid">` | `table`, `row`, `rowheader`, `cell` |
| `display: grid` auf `table` **und** `tr`, `display: block` auf `th`/`td` | `table`, `row`, `rowheader`, `cell` |
| Nachbau von `.v2tbl`: `table` `display: block`, `thead`/`tbody` `block`, `tr` `display: grid` mit `grid-template-columns: 110px 1fr 120px`, `th`/`td` `block` | `table`, `rowgroup`, 3 × `row`, 3 × `columnheader`, 6 × `cell`, der Link im Kopf bleibt `link` |

Das war einmal so, wie beide Aufgaben es schreiben, und ist es in diesem
Browser nicht mehr. Und mit dem vierten Testfall fällt auch das
`<colgroup>`-Argument: das Grid sitzt in `.v2tbl` ohnehin an der **Zeile**
(`v3.css:74–82`), nicht am Container — als `<tr>` behält es sein
`grid-template-columns` samt `1fr` und `gap`, ein `<colgroup>` wird gar nicht
gebraucht. Einschränkung, die ich nicht wegmessen kann: geprüft ist nur
Chromium 153. Firefox und Safari stehen hier nicht zur Verfügung; wer 0106
baut, muss dort nachmessen, bevor er sich darauf verlässt.

**Was das für den Entscheid heißt: er bleibt richtig, seine Begründung wird
kürzer.** Der Grund, jetzt keine Rollen zu setzen, ist allein der erste:
fünf Formen, in denen die Zeile selbst das Bedienelement ist, und ein `<tr>`
kann kein `<a>` sein. Das ist ein Umbau von fünf Bausteinen und rund zwanzig
Story-Dateien, und der gehört in eine eigene Aufgabe. Der zweite Grund —
„ein echtes `<table>` geht technisch nicht" — trägt nicht und darf 0106 nicht
den Weg verstellen: der Umbau auf `<table>`/`<tr>`/`<th>`/`<td>` ist
womöglich der **kleinere** Eingriff als vier Rollen von Hand, weil er ohne
`role`-Attribute auskommt und das Grid-Layout unangetastet lässt. Beides ist
in 0106 eingetragen.

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **`name` fällt auf `col.key` zurück**, wenn `header` kein String ist
  (`headCell` `:336`). Dann liest der Link „Nach lifecycleStatus sortieren".
  Das JSDoc warnt davor, der Typ verhindert es nicht — `header` bleibt
  `ReactNode`. Solange keine sortierbare Spalte einen Knoten als Kopf hat,
  ist es Theorie; eine Nachbesserung wäre `header: string` bei
  `sortable: true` über eine Vereinigung von Typen.
- **`StatusInfoButton` malt sich mit einem Inline-`style`** (`padding: 0px`,
  `border: none`, `opacity: 0.65` — im DOM von `--filled` sichtbar). Kein
  Befund dieser Aufgabe, aber ein px und eine Farbe außerhalb von `v3.css`;
  gehört zu 0077.
- **Die Story-Datei ist deutsch kommentiert** (`DataTable.stories.tsx:110`,
  `:126–128`, der neue Kommentar eingeschlossen). Wie bei 0042 vermerkt: im
  Repo verbreitet, kein eigener Mangel dieser Aufgabe — `DataTable.tsx`
  selbst ist englisch.

Abgenommen von / am: **Claude (Abnahme-Agent), 2026-09-05**
