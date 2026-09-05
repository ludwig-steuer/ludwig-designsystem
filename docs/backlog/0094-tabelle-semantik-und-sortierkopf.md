# 0094 · Die Tabelle sagt nicht, dass sie eine ist

| | |
|---|---|
| Status | Abnahme |
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
