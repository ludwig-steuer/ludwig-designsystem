# 0106 · Die v3-Tabelle als echte Tabelle

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/Table.tsx`, `Cells.tsx`, `ExpandableRow.tsx` · `patterns/DataTable.tsx`, `Review.tsx`, `ComparisonTable.tsx` · rund 20 Story-Dateien |
| Quelle | 0094 (a), beim Beheben aufgeteilt — die Reparatur ist größer als der Befund |
| Auftrag | Der v3-Tabellenfamilie fehlt jede Tabellensemantik. `.v2tbl` ist ein CSS-Grid aus `<div>`s: keine Zeilen, keine Spaltenköpfe, keine Zellen. Eine Vorlesehilfe kann darin nicht spaltenweise lesen — sie hört eine Folge von Texten. |

## Warum das nicht in 0094 passte

0094 (a) hat den sichtbaren Teil beschrieben: `aria-sort` saß an einem
`<span>` und wirkte dort nicht. Behoben ist er, indem der Sortier-Link den
Stand in Worten sagt (`aria-label`); das wird überall vorgelesen und braucht
keine Rolle. Was **nicht** behoben ist: die Spaltenzuordnung beim Lesen einer
Zeile.

Der Weg dahin ist keine Reparatur, sondern ein Umbau, und zwar aus zwei
Gründen:

**(1) Rollen an die Grid-`div`s scheitern an den klickbaren Zeilen.** Eine
Zeile darf `role="row"` tragen — dann ist sie keine Schaltfläche mehr. Drei
Formen im Set sind aber genau das:

| Stelle | heute | Konflikt |
|---|---|---|
| `Row href` (`Table.tsx`) | die ganze Zeile ist ein `<a>` | `role="row"` nähme ihr die Link-Rolle |
| `ChecklistLine` mit `onPick` (`Review.tsx`) | `role="button"` an der Zeile | eine Rolle je Element |
| `ExpandableRow` | die Zeile ist der Auslöser der Klappe | dasselbe |

Der ARIA-konforme Ausweg ist überall derselbe: das Bedienelement zieht **in
die erste Zelle**, die Zeile wird zum Rahmen. Für Links gibt es das im Set
bereits — `.v2rowlink` legt sich über die Zeile, behält seinen Text und bleibt
der eine Fokus-Halt; `DataTable` und `SourceDocument` machen es so. `Row href`
hat nur noch **eine** Aufrufstelle (`AccountEntries.tsx:325`) und vier in
Stories; für Knöpfe fehlt das Gegenstück.

**(2) Ein echtes `<table>` verträgt sich nicht mit `display: grid`.** Chrome
und Firefox nehmen einer Tabelle ihre Semantik, sobald `display` überschrieben
wird — man müsste die Rollen also trotzdem setzen. Ohne Grid müssten die
`cols`-Angaben (`"120px 1fr 220px"`, ein `grid-template-columns`-Wert) in ein
`<colgroup>` übersetzt werden; `1fr` gibt es dort nicht, und die Abstände
(`gap: 10px`) sind in Tabellen etwas anderes als in einem Grid. Das ist ein
neues Layout für rund vierzig Aufrufstellen.

## Zuschnitt, wenn es gebaut wird

1. `Table` bekommt `role="table"`, `HeadRow`/`Row`/`GroupRow`/`EmptyRow`
   `role="row"`, dazu zwei neue Exporte `HeadCell` und `Cell`
   (`role="columnheader"` / `role="cell"`) — die Zellen sind heute die Knoten
   des Aufrufers und tragen keine Rolle.
2. Die drei klickbaren Formen ziehen ihr Bedienelement in die erste Zelle.
   `Row href` wird dabei zugunsten von `.v2rowlink` aufgegeben; für den
   Knopf-Fall braucht es ein `.v2rowbtn` mit derselben Overlay-Regel.
3. `aria-sort` kehrt an den `columnheader` zurück; das `aria-label` aus 0094
   bleibt als zweite Ansage oder fällt weg — zu entscheiden beim Bauen.
4. Rund 20 Story-Dateien schreiben `<th>`/`<td>` in Bausteine, die `div`s
   rendern. Das ist heute schon ungültig und liegt als **0091** vor; mit
   `HeadCell`/`Cell` fällt es im selben Zug weg.

## Was zuerst zu klären ist

- Ist `Checklist` (Review) überhaupt eine Tabelle oder eine Liste? Wenn Liste,
  fällt der schwerste der drei Konflikte weg.
- Bleibt `Row href` als Schnittstelle bestehen, oder wird sie mit einer
  Migration von `AccountEntries` gestrichen?

| | |
|---|---|
| Angelegt von / am | Claude, 2026-09-05 (beim Beheben von 0094) |

## Befunde aus der Abnahme von 0094 (2026-09-05)

Diese Aufgabe erbt ihre Begründung aus 0094. Die Abnahme von 0094 hat sie
nachgeprüft; drei Angaben stimmen nicht und stehen hier, damit der Umbau
nicht auf ihnen aufsetzt. Gemessen in Chromium 153 headless über CDP, der
Barrierefreiheits-Baum über `Accessibility.getFullAXTree`.

**B1 — es sind fünf klickbare Formen, nicht drei.** Zur Tabelle unter „(1)"
gehören zwei weitere Stellen, an denen die Zeile selbst das Bedienelement
ist:

| Stelle | heute | Konflikt |
|---|---|---|
| `ClickRow` (`primitives/ExpandableRow.tsx:34`) | `role="button"` + `tabIndex={0}` an `.v2tbl__row` | dasselbe wie bei `ExpandableRow` |
| `ComparisonTable`, auffällige Zeile (`patterns/ComparisonTable.tsx:135`) | `role="button"` + `tabIndex={0}` an `.v2tbl__row` | dasselbe |

`ClickRow` ist die Master-Detail-Auswahl und hat Aufrufer in
`Selection.stories.tsx` und `ExpandableRow.stories.tsx`; `ComparisonTable`
gibt es nur mit `onSelect` auf den auffälligen Zeilen. Schritt 2 des
Zuschnitts betrifft also fünf Bausteine. Für den Knopf-Fall wird ein
`.v2rowbtn` gebraucht, das drei von ihnen teilen.

**B2 — ein echtes `<table>` verträgt sich sehr wohl mit `display: grid`.**
Der Satz unter „(2)" beschreibt einen Browserstand, den es hier nicht mehr
gibt. Vier Testfälle, jeweils der ausgelesene Barrierefreiheits-Baum:

| Testfall | Rollen im Baum |
|---|---|
| `<table>` unverändert | `table`, `row`, `rowheader`, `cell` |
| `<table style="display: grid">` | `table`, `row`, `rowheader`, `cell` |
| `display: grid` auf `table` und `tr`, `display: block` auf `th`/`td` | `table`, `row`, `rowheader`, `cell` |
| Nachbau von `.v2tbl`: `table` `display: block`, `thead`/`tbody` `block`, `tr` `display: grid` mit `grid-template-columns: 110px 1fr 120px` und `gap: 10px`, `th`/`td` `block` | `table`, `rowgroup`, 3 × `row`, 3 × `columnheader`, 6 × `cell`; der Sortier-Link im Kopf bleibt `link` |

**B3 — und damit fällt auch das `<colgroup>`-Argument.** Es beruht auf der
Annahme, das Grid säße am Container. Das tut es nicht: `v3.css:74–82` setzt
`display: grid` und `grid-template-columns: var(--v2-cols)` an
`.v2tbl__head` und `.v2tbl__row`, also an der **Zeile**. Als `<tr>` behält
sie ihr `grid-template-columns` samt `1fr` und ihr `gap`; ein `<colgroup>`
wird nicht gebraucht, und die `cols`-Angaben der rund vierzig Aufrufstellen
müssen nicht übersetzt werden.

Damit steht der Weg über ein echtes `<table>` womöglich **besser** da als der
über Rollen: er braucht kein einziges `role`-Attribut, keine zwei neuen
Exporte `HeadCell`/`Cell`, und er erledigt 0091 mit — die rund zwanzig
Story-Dateien, die heute `<th>`/`<td>` in `div`-Bausteine schreiben, wären
dann richtig statt falsch. Beide Wege sind beim Bauen gegeneinander zu
stellen; der Zuschnitt oben nimmt den Rollen-Weg heute vorweg, ohne dass die
Vorentscheidung noch trägt.

*Einschränkung:* geprüft ist ausschließlich Chromium 153. Firefox und Safari
standen der Abnahme nicht zur Verfügung. Vor dem Umbau ist dort nachzumessen
— historisch war das Verhalten in allen drei Motoren so, wie 0094 es
beschreibt, und die Reparatur kam in verschiedenen Jahren.

**B4 — `Row href` hat in diesem Repo gar keinen Aufrufer.** Die Angabe „nur
noch **eine** Aufrufstelle (`AccountEntries.tsx:325`) und vier in Stories"
stimmt nicht. `AccountEntries.tsx:325` rendert `<Row>` **ohne** `href` (die
Zeile setzt nur `key` und `className`). Gesucht über alle Dateien, die `Row`
importieren, auch mehrzeilig geschriebene Elemente: `Row` mit `href` steht an
fünf Stellen, alle in Stories — `Table.stories.tsx:34`, `:40`, `:47`, `:53`
und `StatusHeader.stories.tsx:136`.

Das macht die offene Frage „Bleibt `Row href` bestehen, oder wird sie mit
einer Migration von `AccountEntries` gestrichen?" gegenstandslos, wie sie
dasteht: es gibt nichts zu migrieren. Zu entscheiden bleibt nur, ob die
Schnittstelle für die App aufgehoben wird — dort hängen die Aufrufer, nicht
hier. Wird sie gestrichen, fällt der erste und schwerste der fünf Konflikte
aus B1 ersatzlos weg.

**Was trotzdem hält.** Der Entscheid von 0094, jetzt keine Rollen zu setzen,
bleibt richtig — aber allein wegen (1): die Zeile ist an fünf Stellen selbst
das Bedienelement, und ein `<tr>` kann kein `<a>` sein. Auch der Satz „eine
halbe Semantik wäre schlechter als keine" hält: eine `table`, deren Kinder
keine `row` sind, kündigt eine Tabelle an, in der die Vorlesehilfe nichts
findet. Und der Befund selbst ist gemessen: der Baum von
`DataTable --filled` zählt `link` 57, `button` 1, `navigation` 1, `time` 50
— kein `table`, kein `row`, kein `columnheader`, keine `cell`.

## Spec 2026-09-06 — der Weg, und warum er billiger ist als gedacht

Freigegeben vom Owner über `designsystem-f0` am 2026-09-06, **vor** Welle 2
der App: dort wandern dreizehn Listenseiten auf `DataTable`. Der Umbau muss
vorher passieren, sonst migriert die App auf eine Semantik, die gleich wieder
geändert wird.

### Entscheid: echtes `<table>`, keine Rollen

Der Rollen-Weg des ersten Zuschnitts ist verworfen. Befund B2 der 0094-Abnahme
hat gemessen, dass ein `<table>` seine Semantik behält, wenn `display`
überschrieben wird — und Befund B3, dass das Grid an der **Zeile** sitzt, nicht
am Container. Damit behält jedes `<tr>` sein `grid-template-columns` samt `1fr`
und sein `gap`; kein `<colgroup>`, keine Übersetzung der `cols`-Angaben, kein
einziges `role`-Attribut. Und 0091 erledigt sich mit: die Story-Dateien, die
heute `<th>`/`<td>` in `div`-Bausteine schreiben, sind danach richtig.

### Zuschnitt

1. `Table` → `<table>` mit `<tbody>`; `HeadRow` → `<tr>` mit `<th scope="col">`;
   `Row`/`GroupRow`/`EmptyRow` → `<tr>`; Gruppen-, Leer- und Detailzeile mit
   `colSpan`.
2. **Die Zellen wrappt der Baustein**, nicht der Aufrufer: `cells()` in
   `Table.tsx` flacht Fragmente ab, überspringt `null` (wie das Grid es tat)
   und lässt bereits geschriebene `td`/`th` durch. So bleiben rund vierzig
   Aufrufstellen unverändert.
3. **Fünf klickbare Formen** ziehen ihr Bedienelement in die erste Zelle
   (Befund B1): `Row href`, `ClickRow`, `ExpandableRow`, `ComparisonTable`,
   `Checklist`. Für Links gab es `.v2rowlink` schon; für Knöpfe kommt
   `.v2rowbtn` mit derselben Overlay-Regel dazu. Ein `<tr>` kann weder Link
   noch Schaltfläche sein — und eine Zeile, die eine Schaltfläche ist, ist für
   eine Vorlesehilfe keine Zeile mehr.
4. `aria-sort` kehrt an den `columnheader` zurück. Das `aria-label` des
   Sortier-Links aus 0094 **bleibt**: es sagt den Stand in Worten und wird
   überall vorgelesen, während `aria-sort` je nach Vorlesehilfe angesagt wird
   oder nicht.
5. `rowCells()` wird exportiert — die Client-Zwillinge bauen ihr `<tr>` selbst
   und brauchen dieselbe Zellenteilung.

### Abnahmekriterien

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Der Baum einer Tabellen-Story trägt `table`, `row`, `columnheader`, `cell` (gemessen über `Accessibility.getFullAXTree`)
- [ ] `aria-sort` steht am `th` der sortierten Spalte, `none` an den anderen sortierbaren
- [ ] Keine Zeile trägt mehr `role="button"`; die fünf klickbaren Formen haben ihr Bedienelement in der ersten Zelle
- [ ] Kein Aufrufer musste seine Zellen ändern (`git diff --stat`: nur Bausteine und CSS)
- [ ] **Alle Tabellen-Stories stehen unverändert im Bild** — Kopf und Zeilen enden an derselben Kante, kein Überlauf, Zeilenhöhe wie zuvor; gemessen bei **vier** Breiten (1440 · 1100 · 900 · 700)
- [ ] Konsole ohne Meldung in allen Tabellen-Stories (kein `<div>` in `<tr>`, kein `<span>` als Zelle)
- [ ] 0091 ist damit erledigt: `<th>`/`<td>` in Story-Dateien sind gültig

### Gemessen (2026-09-06, Chromium headless)

**Der Baum trägt die Tabelle.** Vorher zählte `DataTable --filled` `link` 57,
`button` 1 — und **kein** `table`, `row`, `columnheader`, `cell`. Danach:
`table` 1 · `row` 51 · `columnheader` 5 · `cell` 250. `Table --filled`:
`table` 1 · `row` 7 · `columnheader` 4 · `cell` 18. `CaseRow --in-use`:
`table` 1 · `row` 6 · `columnheader` 10 · `cell` 50.

**`aria-sort` steht am `th`:** in `DataTable --filled` trägt „Eröffnet"
`descending`, „Betrag" und „Bearbeitungsstand" `none`, die zwei nicht
sortierbaren Spalten gar keins.

**Kein Aufrufer musste sich ändern.** `git diff --stat` des Umbaus: acht
Dateien, alle Bausteine oder CSS — keine Story, keine Entität, keine Seite.

**Vier Breiten, 132 Tabellen-Stories** (1440 · 1100 · 900 · 700): Kopf und
Zeilen enden an derselben Kante, Zeilenhöhen unverändert. Zwei Ausnahmen, beide
**nicht** durch diesen Umbau entstanden:

## Befund für 0057 — die Aktionsspalte ist `max-content` und driftet

Gemessen an `datatable--row-actions` bei 700 px: der Spaltenkopf löst die Spur
auf **54,2 px** auf („Aktionen"), die Zeile auf **176,4 px** (zwei Knöpfe) —
Kopf und Zeilen enden 122 px auseinander. Das ist derselbe Fehler wie
`width: "1fr"` (behoben in `399b38a`): eine inhaltsbemessene Spur wird von
Kopf und Zeile **getrennt** gerechnet, weil beide eigene Grids sind.

`max-content` steht in `DataTable` fest (`rowActions ? "max-content" : null`)
und ist keine Frage der Tabellensemantik, sondern der Spaltenmaße — deshalb
hier als Befund und nicht als Teil dieses Umbaus. Der Weg ist ein festes Maß
mit einem Token, das ein Aufrufer mit breiten Aktionen hochsetzen kann.

*Die übrigen 66 Auffälligkeiten des Durchlaufs waren Messfehler meines
Sweeps:* er las `scrollWidth` an `.v2tbl` auch dort, wo `.v2tbl__scroll` und
`.v2tbl__inner` das horizontale Scrollen absichtlich tragen (`minWidth`).

## Die Mängel der Abnahme vom 2026-09-06 — behoben

**M1 — jede Zahl im Set stand links.** Der schwerste Fund, und er war meiner:
`.v2num` war entweder ein **Inline**-Span in der Zelle — dort tut `text-align`
nichts — oder es verlor gegen `text-align: inherit`, das ich der `th/td`-Regel
mitgegeben hatte, um `th`s Vorgabe „zentriert" abzuräumen. Gemessen standen
die Beträge bis zu **90 px** vor ihrer Spurkante, quer durch das Set.

Jetzt drei Regeln statt einer: `th` links (V3 zentriert nichts),
`th.v2num`/`td.v2num` rechts, und ein `.v2num` **in** der Zelle wird zur
Blockbox. Gemessen danach in `table--filled`, `datatable--filled`,
`caserow--in-use`, `accountentries--filled`, `comparisontable--filled`: jede
Zahl `text-align: right`, rechte Kante wieder auf der Spurkante (1105 statt
985).

**Die Lehre steht in der Spec, nicht nur im Commit:** die 132-Stories-Messung
hat Spurkanten und Zeilenhöhen verglichen — nicht die **Lage des Textes
darin**. Ein Raster kann stimmen, während jeder Inhalt darin verrutscht ist.

**M2 — `Checklist` hatte den Umbau nicht mitgemacht.** Sie rendert jetzt
`Table`/`HeadRow`, ihre Zeilen waren schon `<tr>` — der Zwischenstand war
weder Liste noch Tabelle.

**M3–M7 — fünf Bausteine legten `<div>` neben `<tr>`:** `ErrorRow`,
`ComparisonTable` (Leerzustand), `AccountEntries` (Leerzustand),
`BankTransactionRow` (`SplitRows`) und die Story-Hilfen von `SourceDocument`
und `SourceDocumentFacts`. Alle fünf sind jetzt Zeilen mit einer Zelle über
alle Spalten bzw. stehen in einer `Table`.

**M8 — „Kein Aufrufer musste sich ändern" trägt nicht.** Der Satz war schon im
Umbau-Commit falsch (`DocumentNumberRegister` ist eine Entität), und danach
mussten `OpenItemRow` und sechs weitere nachgezogen werden. Was stimmt: **kein
Aufrufer musste seine Zellen umschreiben** — was nachgezogen wurde, waren
Stellen, die ein `<div>` in eine Tabelle legten, und das war schon vorher
falsch, nur unsichtbar.

**M9 — Zeilenhöhen ±1–2 px.** Bleibt und ist der Preis: eine Zelle ist eine
Zellbox, kein Grid-Element. Der Satz „Zeilenhöhe wie zuvor" in „Gemessen" ist
damit zu „±1 px" zu lesen.

**M10 — zwei tote CSS-Regeln** (`a.v2tbl__row`, der Wrapper-Selektor der alten
`ExpandableRow`) sind gestrichen.
