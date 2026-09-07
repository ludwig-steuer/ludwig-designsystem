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

## Nachtrag 2026-09-07 — `colSpan` war die ganze Zeit wirkungslos

**Der Umbau hat eine Regression hinterlassen, die keine der zehn Messungen
gesehen hat**, weil sie eine Breite betrifft und alle Messungen Kanten,
Zeilenhöhen und Verschachtelung geprüft haben: die spannenden Zeilen —
Leerfall, Fehlerfall, Gruppenüberschrift, Lade-Zeile — sind seit 0106 nicht
mehr so breit wie ihre Tabelle.

**Warum.** Vor 0106 war die Sonderzeile ein `<div class="v2tbl__empty">`, also
ein Block im Container: volle Breite, ohne dass jemand etwas dafür tun musste.
Mit 0106 wurde daraus `<tr><td colSpan={999}>`. Und `colSpan` ist ein
**Tabellen-Attribut**: es wirkt nur, solange die Zellen `display: table-cell`
sind. Genau das hat 0106 abgeschafft — `.v2tbl th, .v2tbl td { display: block }`
ist die Regel, die Kopf und Zeile zu Grids macht. Damit liest niemand mehr das
Attribut: die Datenzeile ist ein Grid, die Sonderzeile eine anonyme
Tabellenzelle, die sich auf ihren Inhalt zusammenzieht.

**Gemessen** (Storybook, 1440 px, `BankTransactionList --loading-and-error`):
das Fehler-Feld war **707 px** breit in einer **1400-px**-Tabelle, die
Lade-Zeile **0 px**. Ein rot hinterlegter Fehlerkasten, der auf halber Strecke
aufhört — sichtbar für jeden, der hinsieht, und für keine Messung, die Kanten
vergleicht.

**Behoben** in `v3.css`, zwei Zeilen: eine Zeile, die eine spannende Zelle
trägt, wird selbst ein Block, und die Zelle nimmt die volle Breite.

```css
.v2tbl tr:has(> td[colspan]) { display: block; }
.v2tbl td[colspan] { width: 100%; }
```

Das `colSpan`-Attribut bleibt im Markup: für die Vorlesereihenfolge ist es
richtig, und es ist der Selektor.

**Gegenprobe** (alle bei 1440 px, Zelle gegen Tabellenbreite):

| Story | Tabelle | spannende Zelle | Ergebnis |
|---|---|---|---|
| `DataTable --error` | 1406 px | 1406 px | ✓ |
| `DataTable --empty` (zwei Tabellen) | 694 px | 694 px | ✓ |
| `CaseList --empty` | 1630 px | 1630 px | ✓ |
| `OpenItemRow --grouped` (vier Gruppenzeilen) | 1398 px | 4 × 1398 px | ✓ |
| `BankTransactionList --loading-and-error` | 1406 px | 1406 px (vorher 707 / 0) | ✓ |
| `SourceDocumentColumns --stuck` | 1398 px | keine (nur Datenzeilen) | ✓ |

Dazu 20 Tabellen-Stories im Konsolen-Sweep: keine Meldung.

**Die Lehre, in einem Satz:** wer Markup von Grid auf Tabelle umstellt, erbt
die Attribute der Tabelle **nicht** — sie wirken nur, solange auch die
Darstellung eine Tabelle ist. Und: eine Messung, die Spurkanten vergleicht,
sieht keine Zelle, die zu schmal ist, wenn sie allein in ihrer Zeile steht.
Dieselbe Klasse Fehler wie der Befund aus 0106 selbst — „ein Raster kann
stimmen, während jeder Inhalt darin verrutscht ist".

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**Regression, gefunden von der Abnahme 0089 am 2026-09-07: die Zwischenzeile
verlor ihr Gewicht.** `.v2tbl th, .v2tbl td { font-weight: inherit }` (Z. 52)
schlägt `.v2tbl__group` mit 0-1-1 gegen 0-1-0 — dieselbe Falle, die dieser
Umbau fürs **Polster** schon entschärft hat (Z. 108), nur eben nicht fürs
Gewicht. Die Zwischenüberschrift stand seither auf 400 und sah aus wie eine
Datenzeile.

Gemessen vor der Reparatur an `AccountColumns/Grouped`: `font-weight: 400`;
danach 700, ebenso in `OpenItemRow/Grouped` und `OpenItemRow/InUse` — eine
einzige Ausprägung (700 / 12,5 px / 7px 18px) über alle Zwischenzeilen des
Bestands.

Die Reparatur steht in derselben Zeile wie das Polster, auf der Spezifität des
Resets: `.v2tbl td.v2tbl__group { padding: 7px 18px; font-weight: 700; }`.

## Abnahme (2026-09-07)

Fremde Abnahme, hat nicht gebaut; erste Abnahme dieser Aufgabe. Gemessen im
laufenden Storybook (Dev-Server 6107, also die **Quelle**, nicht der Bau),
Chromium headless über CDP, `deviceScaleFactor` 1, Fenster 1440 × 900, wo
nicht anders genannt; der Barrierefreiheits-Baum über
`Accessibility.getFullAXTree`. Jede Zahl steht am gerenderten Element
(`getComputedStyle`, `getBoundingClientRect`, `Range`), keine aus der
CSS-Datei gelesen; jede Aussage hat eine **Gegenprobe** — die geprüfte Regel
wird zur Laufzeit entfernt oder überschrieben und neu gemessen.

`pnpm build` ist **nicht** gelaufen: mehrere Prüfer arbeiten parallel im
selben Baum, und ein Bau leert `storybook-static/` (0117).

### Fester Block

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` / `pnpm build` grün | `pnpm typecheck` Exit 0; dazu `pnpm check:icons` Exit 0 und `pnpm check:contrast` Exit 0. `pnpm build` nicht geprüft (0117) | erfüllt, mit Einschränkung |
| Datei nach der Familie, Story daneben, Titel in der richtigen Gruppe | `primitives/{Table,ExpandableRow,Cells}.tsx`, `patterns/{DataTable,Review,ComparisonTable}.tsx`, Stories daneben; Titel `v3/Primitives/Tabelle/…`, `v3/Patterns/Arbeitsfläche/DataTable`, `v3/Patterns/Prüfen/…` | erfüllt |
| Code englisch; `@when`/`@instead` an jedem Export | `@when`/`@instead` vollständig — Table 9/9, ExpandableRow 2/2, Cells 7/7, DataTable 1/1, Review 4/4, ComparisonTable 1/1. **Aber** 0106 hat neue **deutsche** JSDoc-Prosa geschrieben | ✗ **M3** |
| Kein Hex, kein px, keine lokale Label-Map | kein Hex in den sechs Dateien; px nur in `cols`-Werten (`Review.tsx:122`, `ComparisonTable.tsx:78`) — das ist der `grid-template-columns`-Wert und das Muster des Sets, unverändert seit vor 0106 | erfüllt |
| Alle Stories vorhanden | die Spec listet keine neuen Stories (Umbau des Bestands); `git log --diff-filter=D` seit `0bd5d80~1`: keine Story-Datei entfernt | erfüllt |
| Prüfliste `design-guidelines.md` §9 | s. u. | erfüllt bis auf V3 im Spaltenkopf (**M1**) |
| Im Browser angesehen, nicht nur gebaut | 322 Tabellen-Stories über `iframe.html` geladen und bei vier Breiten vermessen; Bildbelege im Scratchpad (`m1-actions.png`, `m2-split.png`) | erfüllt |

### Variabler Block (die acht Kriterien der Spec)

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| typecheck / build grün | s. o. | erfüllt, mit Einschränkung |
| Baum trägt `table`, `row`, `columnheader`, `cell` | `datatable--filled` 1 · 51 · 5 · 250; `table--filled` 1 · 7 · 4 · 18; `caserow--in-use` 1 · 6 · 10 · 50; `checklist--filled` 1 · 7 · 5 · 30 — dieselben Zahlen wie in „Gemessen". **Gegenprobe:** `role="presentation"` an `.v2tbl` → 0 · 0 · 0 · 0, Attribut wieder weg → 1 · 7 · 4 · 18. Die Messung reagiert | erfüllt |
| `aria-sort` am `th` | `datatable--filled`: „Eröffnet" `descending`, „Betrag" `none`, „Bearbeitungsstand" `none`, „Nummer"/„Sachverhalt" (nicht sortierbar) ohne Attribut — alle fünf am `<th>` | erfüllt |
| Keine Zeile mit `role="button"`; fünf Formen mit Bedienelement in der ersten Zelle | `grep 'role="button"'` in `src/ui/v3`: 0 Treffer (nur ein Kommentar). Hittest mit `elementFromPoint` bei 15 / 50 / 85 % der Zeilenbreite: `expandablerow--expandable`, `--clickable`, `comparisontable--filled`, `checklist--filled` treffen an allen drei Punkten `button.v2rowbtn`, `caselist--filled` `a.v2rowlink`. Fokusring `2px solid rgb(59,143,196)`, ein Fokus-Halt je Zeile bei `ClickRow` | erfüllt |
| Kein Aufrufer musste seine Zellen ändern | trägt in der wörtlichen Fassung nicht — die Spec räumt es unter **M8** selbst ein; `6ecae07` und `b08bfc4` haben `AccountEntries`, `case-columns`, `BankTransactionRow`, `OpenItemRow`, `DocumentNumberRegister` und zwei Story-Hilfen nachgezogen. Kein neuer Mangel, aber die Kriterienzeile oben ist nicht nachgeführt | gerissen, bereits dokumentiert |
| Alle Tabellen-Stories unverändert im Bild, vier Breiten (1440 · 1100 · 900 · 700) | **Das Raster ist tadellos:** 322 Stories, 169 Tabellen bei 1440, je vier Breiten — **0** Abweichungen zwischen `grid-template-columns` von Kopf und Zeile, **0** Abweichungen der rechten Kante der letzten Zelle, **0** Verschachtelungsverstöße (`tbody > *:not(tr)`, `tr > *:not(td):not(th)`). **Aber der Inhalt darin nicht:** der Kopf der Aktionsspalte steht 125,8 px neben seiner Spalte | ✗ **M1** (dazu Befund **B1**) |
| Konsole ohne Meldung | 40 Tabellen-Stories (alle fünf Zustände von `Table`, `Zellen`, `DataTable`, `Checklist`, `ComparisonTable`, `ExpandableRow`, `Selection` und die Entitätenlisten aus M2–M7): **0** Warnungen, Fehler oder Ausnahmen. **Gegenprobe:** `console.warn`/`console.error` in derselben Story werden vom Leser erfasst. Dazu die Verschachtelung selbst über alle 322 Stories gemessen (s. o.), also nicht nur die Meldung darüber | erfüllt |
| 0091 erledigt | `<th>`/`<td>` in Stories laufen durch `cells()` unverändert durch; über 322 Stories kein `th`/`td` außerhalb einer `<tr>`. Anmerkung: vier Stories (`button--sizes-in-row`, `datefield--in-use`, `filterbar--in-use`, `overflowmenu--in-row`) schreiben `<th>` **ohne** `scope="col"` — gemessen bleibt die Rolle trotzdem `columnheader` (`overflowmenu--in-row`: 1 · 3 · 4 · 8) | erfüllt |

### Der Nachtrag zum Gewicht — greift, und die Falle schnappt zweimal weiter

**Die Reparatur greift, über den ganzen Bestand.** Vierzehn Zwischenzeilen in
vier Stories (`table--filled` 2, `openitemrow--grouped` 4,
`openitemrow--in-use` 3, `accountcolumns--grouped` 5) — **eine einzige
Ausprägung**: `font-weight: 700`, `font-size: 12.5px`,
`padding: 7px 18px`, Breite gleich der Tabellenbreite (1406 / 1398 / 1298 px),
`x = 17` wie jede andere Zeile. `accountcolumns--in-use` hat keine
Zwischenzeile. **Gegenprobe:** Regel `.v2tbl td.v2tbl__group` zur Laufzeit
gelöscht → `font-weight: 400`, `padding: 0` an allen vierzehn. Die Messung
reagiert, und sie misst genau die Reparatur.

**Die Falle ist damit aber nicht geschlossen.** Wer an einem `td`/`th` hängt,
wurde vollständig aufgezählt — ein mehrzeiliger Regex über **alle** `.tsx` des
Repos ergibt genau dreizehn Ausdrücke:

| Klasse am `td`/`th` | Lage | Ergebnis |
|---|---|---|
| `v2tbl__empty`, `v2tbl__group`, `v2tbl__detail`, `v2tbl__error`, `v2num` | Zwilling auf Reset-Spezifität vorhanden | gemessen in Ordnung |
| `v2tbl__lead`, `v2tbl__chev` | gar keine CSS-Regel | unkritisch |
| `lw-mono`, `lw-numeric` | rühren keine der fünf Reset-Eigenschaften an | unkritisch |
| `cellClass` (`Table.tsx:177`) | wird nie gesetzt | unkritisch |
| `cls` (`DataTable.tsx:355`) | ist `v2num` oder nichts | s. o. |
| **`v2actions`** | kein Zwilling | ✗ **M1** |
| **`v2btxrow__split`** | kein Zwilling | ✗ **M2** |

Zusätzlich über alle 322 Tabellen-Stories laufend gemessen: für jede gerenderte
Zelle jede passende Regel gegen den berechneten Wert gehalten — dieselben zwei
Treffer, keine weiteren.

### Mängel

**M1 — der Kopf der Aktionsspalte steht 125,8 px neben seiner Spalte.**
Ort: `src/ui/v3/patterns/DataTable.tsx:245`
(`<th scope="col" className="v2actions">Aktionen</th>`) gegen
`src/styles/v3.css:52` (Reset, 0-1-1) und `src/styles/v3.css:254`
(`.v2actions { display: flex; … justify-content: flex-end }`, 0-1-0).
Gemessen in `datatable--row-actions` bei 1440 px: die Aktionsspur ist
1225 → 1405 px breit (180 px, Kopf und Zeile identisch). Das `th` steht auf
`display: block` statt `flex`; das Wort „Aktionen" läuft von **1225 bis
1279,2**, die Knöpfe der Zeile von 1228,6 bis **1405** — **125,8 px**
auseinander (Bild: `m1-actions.png`, „Aktionen" links, „Zurückstellen" rechts).
Gegenprobe: `.v2tbl th.v2actions { display: flex; justify-content: flex-end }`
zur Laufzeit → das Wort springt auf 1350,8 → 1405, bündig mit der Zeile.
**Regression aus 0106:** vorher war es ein `<span class="v2actions">` als
Rasterkind (`0bd5d80^:DataTable.tsx:229`) und stand rechts.
Kleinster Weg: die Regel ein zweites Mal auf der Spezifität des Resets, wie
Polster und Gewicht — `.v2tbl th.v2actions { display: flex; gap: 14px;
justify-content: flex-end; align-items: center; }`.

**M2 — die Unterzeilen der Mehrfachzuordnung haben kein Polster.**
Ort: `src/ui/v3/entities/bank-transaction/BankTransactionRow.tsx:79`
(`<td className="v2btxrow__split" colSpan={999}>`) gegen
`src/styles/v3.css:52` und `src/styles/v3.css:3338`
(`padding: var(--space-2) var(--space-4) var(--space-3)`, 0-1-0).
Gemessen in `banktransactionrow--expanded` bei 1440 px: `padding`
**0 0 0 0** statt 8 / 16 / 12 / 16; der erste Inhalt beginnt bei **x = 17**,
während die erste Zelle der Datenzeile darüber bei **x = 35** anfängt; der
Block ist **77,4 px** hoch statt 97,4 (Bild: `m2-split.png` — die drei
Unterzeilen kleben an der Kartenkante).
Gegenprobe: dieselbe Regel als `.v2tbl td.v2btxrow__split` → 8 / 16 / 12 / 16,
Inhalt bei x = 33, Höhe 97,4.
**Entstanden in `6ecae07`**, beim Beheben von M3–M7 der Abnahme vom
2026-09-06: dort wurde aus dem `<div class="v2btxrow__split">` ein `<td>`, und
damit fiel die Regel unter den Reset.
Kleinster Weg: derselbe wie bei M1 — die Regel auf Reset-Spezifität.

**M3 — 0106 hat neue deutsche JSDoc-Prosa geschrieben.**
Die Hausregel verlangt englische Kommentare und JSDoc, und eine Datei, die
ohnehin angefasst wird, wird nachgezogen. `Table.tsx` (153 geänderte Zeilen)
und `ExpandableRow.tsx` (83) sind angefasst worden und tragen weiter Deutsch —
und zwar **neu geschriebenes**: `git show 0bd5d80` fügt unter anderem
„`+ * Der Knopf sitzt in der **ersten Zelle** und deckt die Zeile über
.v2rowbtn::after ab`" (`ExpandableRow.tsx:19–23`) und „`+ * Datenzeile. Mit
href wird die erste Zelle der Link`" (`Table.tsx:229–236`) hinzu. Betroffen:
`Table.tsx` Z. 5–13, 19, 48, 93, 98, 120, 136, 143, 198, 229–236;
`ExpandableRow.tsx` Z. 11–13, 17, 19–23, 56–57, 60, 76, 82.
Kleinster Weg: die Blöcke übersetzen; die Fachwörter stehen in
`docs/ludwig/GLOSSARY.md`.

### Befund (kein Mangel dieser Aufgabe)

**B1 — bei 700 px läuft ein Teil des Bestands über, und die Karte schneidet
ab.** Aus dem Breiten-Sweep: 27 Überläufe in 9 Stories, alle bei 900 oder
700 px, dazu `overflowmenu--in-row` mit 9 px bei jeder Breite. Größte:
`sourcedocument--filled/--kinds/--states/--edges/--in-use` 200 px bei 900 und
400 px bei 700; `checklist--filled` 178 px bei 700;
`datatable--row-actions` 162 px bei 700; `banktransactionrow--columns`
142 px. `.v2card` steht auf `overflow: hidden`, es wird also abgeschnitten,
nicht gescrollt — betroffen sind genau die Aufrufer **ohne** `minWidth`; wo
`minWidth` gesetzt ist, trägt `.v2tbl__scroll` (`comparisontable--filled`
bei 700: scrollWidth 860, clientWidth 666, `overflow-x: auto`).
**Das ist keine Frage der Tabellensemantik:** Kopf und Zeile laufen *gleich*
über (`gridTemplateColumns` identisch, gemessen `gleich: true`), die Summe der
festen Spuren ist schlicht größer als die Karte. Gehört zu 0057 (Spaltenmaße)
bzw. an die Aufrufer, die kein `minWidth` setzen.

Nebenher bestätigt: die Aktionsspur mit dem festen Maß aus `b8accdc` hat den
0057-Befund erledigt — bei 700 px stehen Kopf und Zeile jetzt beide auf
180 px; mit der Gegenprobe `--v2-tbl-actions: max-content` driften sie wieder
auf 719,2 gegen 841,4 auseinander, also die 122 px von damals.

### Prüfliste §9 (ohne die zwei Punkte, die der App gelten)

Übersprungen: „Liegt unter `apps/web/src/ui/v2/…`" und „In §11 auf v2 gesetzt"
— beides zeigt auf die App, nicht auf dieses Repo.

| Punkt | Gemessen | Ergebnis |
|---|---|---|
| Ersetzt das v1-Gegenstück | betrifft die App; hier ist v3 die einzige Fassung | n. z. |
| Kein Hex, kein px außerhalb der CSS, keine lokale Label-Map | s. Fester Block | erfüllt |
| Text links, Zahlen rechts mit `tnum`, nichts zentriert (V3) | über 322 Stories **kein** `th`/`td` mit `text-align: center`; jede `.v2num` mit Inhalt steht rechts — in `datatable--filled` (101), `accountentries--filled` (20), `caserow--in-use` (6), `comparisontable--filled` (36) endet jede höchstens 1,5 px vor ihrer Spurkante. **Aber** der Kopf „Aktionen" ist die Ausnahme | ✗ **M1** |
| Zeilenhöhe ≤ `.v2tbl__row` (V1) | Zwischenzeile 35,4 px gegen Datenzeile derselben Tabelle; die ±1–2 px des Umbaus stehen als M9 in der Spec und sind nicht gegen den alten Bau nachmessbar (Bauverbot) | erfüllt, mit M9 |
| Farbe nur als Kritikalitätsstufe, Vorzeichen ohne Farbe | 0106 hat keine Farbe angefasst; `pnpm check:contrast` Exit 0 | erfüllt |
| Jeder farbige Zustand hat Wort oder Icon; Status über Registry | 0106 hat keine Zustände angefasst; `pnpm check:icons` Exit 0 | erfüllt |
| Fünf Zustände | `Table`: gefüllt · leer · lädt · Fehler; „leer nach Filter" trägt die Ebene darüber (`DataTable --empty-filtered`, `Zellen --empty-after-filter`) — Stand vor 0106 | erfüllt |
| Kontrast, Fokusring, `prefers-reduced-motion` | Fokusring an `.v2rowbtn` und `.v2rowlink` gemessen: `2px solid rgb(59,143,196)`, Versatz −2 px bzw. 2 px | erfüllt |
| Hauptweg per Tastatur; kein Icon ohne Wort | `ClickRow`-Zeilen haben genau **einen** Fokus-Halt; der Chevron von `ExpandableRow` ist icon-only, trägt aber `aria-label` und fällt unter die benannte Ausnahme zu T8 (auf-/zuklappen, umkehrbar, die ganze Zeile ist der zweite Weg) | erfüllt |
| Jedes klickbare Element antwortet auf Hover; Listenzeile ist ganz klickbar (I11) | Hittest an drei Punkten je Zeile trifft überall das Bedienelement (s. o.); `:hover` an `.v2tbl__row:has(.v2rowlink)` und `:has(.v2rowbtn)` | erfüllt |
| Karte: Rand **oder** Schatten, linksbündig | `.v2card` hat Rand, keinen Schatten; `.v2tbl__empty`/`__error` linksbündig | erfüllt |
| `minWidth`/inneres Scrollen nur mit `min-width: 0` | der Reset setzt `min-width: 0` an jeder Zelle; `.v2tbl__scroll`/`.v2tbl__inner` gemessen (860/666, 1630/866, 1748/666 — `overflow-x: auto`, kein Nullwert) | erfüllt |
| Texte nach T1–T5 | 0106 hat einen Nutzertext hinzugefügt: „Zeile aufklappen"/„Zeile zuklappen" (`ExpandableRow.tsx:105`) — Imperativ mit Objekt, Sie-Form, kein Ausrufezeichen | erfüllt |
| Story mit allen Zuständen | s. Fester Block | erfüllt |

### Urteil

**Zurück.** Der Nachtrag hat die Zwischenzeile richtig repariert und die
Reparatur hält über den ganzen Bestand — aber die Frage, ob dieselbe Falle
noch woanders zuschnappt, ist mit **ja** zu beantworten: **M1** (der Kopf der
Aktionsspalte, 125,8 px daneben, seit 0106) und **M2** (die Unterzeilen der
Mehrfachzuordnung ohne Polster, seit `6ecae07`). Beide sind sichtbar, beide
brauchen dieselbe eine Zeile wie Polster und Gewicht. **M1 blockiert**, weil
es zusätzlich das Kriterium „Alle Tabellen-Stories stehen unverändert im Bild"
und V3 reißt; **M2** blockiert als zweiter Fall derselben Ursache. **M3** ist
klein und kann mit den beiden zusammen fallen.

Was trägt: die Semantik selbst ist gemessen und in Ordnung — `table`, `row`,
`columnheader`, `cell` im Baum, `aria-sort` am `th`, keine Zeile mehr eine
Schaltfläche, 169 Tabellen bei vier Breiten ohne eine einzige Abweichung
zwischen Kopf- und Zeilenraster, keine Verschachtelungsmeldung, 0091 erledigt.

| | |
|---|---|
| Abgenommen von / am | Claude (fremde Abnahme, hat nicht gebaut), 2026-09-07 — **zurück** |
| Offene Punkte | M1, M2 (blockierend), M3 (klein); Befund B1 gehört zu 0057 bzw. an die Aufrufer ohne `minWidth` |

## Nach der Abnahme (2026-09-07)

Die Abnahme hat **alle dreizehn** Ausdrücke aufgezählt, die je an einem
`td`/`th` landen können, und einzeln gemessen. Zwei sind der Falle noch zum
Opfer gefallen, beide sind behoben — mit derselben einen Zeile auf der
Spezifität des Resets, die schon Polster und Gewicht gerettet hat:

**M1 — der Kopf der Aktionsspalte stand 125,8 px neben seiner Spalte.**
`.v2actions` setzt `display: flex; justify-content: flex-end`, der Reset
`display: block` — und 0-1-1 schlägt 0-1-0. „Aktionen" endete bei 1279,2, die
Knöpfe der Zeile bei 1405. Jetzt `.v2tbl th.v2actions`; gemessen `display:
flex`, Spur 1225–1405, Kopf und Zeile auf derselben Kante.

**M2 — die Aufteilungszeile hatte gar kein Polster.** `.v2btxrow__split` gegen
`padding: 0` des Resets: Inhalt bei x=17 statt 35, Block 77,4 statt 97,4 px.
Jetzt `.v2tbl td.v2btxrow__split`; gemessen `padding: 8px 16px 12px`, Höhe
97,4, erster Inhalt x=33.

**M3 — die JSDoc, die dieser Umbau neu geschrieben hat, sind Englisch.**
`ExpandableRow.tsx` ganz, in `Table.tsx` der Block, den 0106 verfasst hat. Der
Rest der Datei bleibt: CLAUDE.md verbietet die Masse-Umbenennung, und der
Wächter `pnpm check:language` prüft seit heute genau die Zeilen, die eine
Änderung anfasst — nicht jeden Altbestand, den sie mitträgt.

**B1 gehört zu 0057** und ist dort zu entscheiden: neun Stories laufen bei
900/700 px über, weil ihre festen Spuren breiter sind als die Karte und der
Aufrufer kein `minWidth` setzt. Kopf und Zeile laufen dabei **gleich** über —
die Tabellensemantik ist daran unschuldig.

## Der Reset steht in `:where()` (2026-09-07, Owner-Entscheid)

Die Abnahme hatte zwei weitere Stellen gefunden, an denen der Reset eine
Klassenregel schlug — und den richtigen Schluss gezogen: **nicht die
vierzehnte Gegen-Regel schreiben, sondern den Reset entwaffnen.**

`:where(.v2tbl th, .v2tbl td)` hat Spezifität **0-0-0**. Jede Regel, die an
einer Klasse hängt, gewinnt wieder gegen ihn; der Reset gilt nur noch dort, wo
nichts anderes steht. Damit fallen **sieben** Gegen-Regeln weg, die nur gegen
ihn anschrieben:

| Gegen-Regel | ersetzt durch |
|---|---|
| `.v2tbl th.v2num, .v2tbl td.v2num` | `.v2num` |
| `.v2tbl td.v2tbl__empty` | `.v2tbl__empty` |
| `.v2tbl td.v2tbl__group` | `.v2tbl__group` |
| `.v2tbl th.v2actions` | `.v2actions` |
| `.v2tbl td.v2btxrow__split` | `.v2btxrow__split` |
| `.v2tbl td.v2tbl__detail` | `.v2tbl__detail` |
| `.v2tbl td.v2tbl__error` | `.v2tbl__error` |

**Gemessen vorher und nachher, alle sieben identisch:** Zwischenzeile 700 /
7px 18px · Aktionskopf `flex` / `flex-end` · Aufteilungszeile 8px 18px 12px ·
Leerzelle 30px 18px · Fehlerzelle `flex` / `column` / 8px / 24px 18px ·
Zahlenspalte rechts.

**Eine zweite Zeile musste mit:** `.v2tbl th { text-align: left }` stand
ebenfalls auf 0-1-1 und schlug `.v2num` — die Zahlenspalten fielen nach links,
sobald die Gegen-Regel weg war. Gemessen beim Umbau, nicht vermutet; sie steht
jetzt ebenfalls in `:where()`.

**Ein Wert hat sich geändert, und zwar absichtlich:** die Fehlerzelle hatte in
der Gegen-Regel `var(--space-2)` (8 px), in ihrer Klassenregel `gap: 10px`.
Der Owner hat entschieden: das Pixel-Literal steht gegen die Hausregel, der
Token gewinnt. Die Klassenregel trägt ihn jetzt — 8 px, wie vorher im Bild.

**Gegenprobe:** eine gewöhnliche Zelle zeigt weiter `display: block`,
`padding: 0`, `font-weight: 400`; schaltet man `.v2tbl__group` zur Laufzeit ab,
übernimmt der Reset (0 / 400) und gibt danach wieder ab (7px 18px / 700). Der
Reset wirkt also, und er verliert.

### Abnahmekriterium (Nachtrag)

- [ ] Der Reset auf `th`/`td` steht in `:where()`; eine Klassenregel an einer
      Zelle greift ohne Gegen-Regel — geprüft, indem eine beliebige Klasse an
      einer Zelle ihre Wirkung zeigt **und** der Reset sie übernimmt, sobald
      man die Klassenregel abschaltet

## Abnahme des `:where()`-Umbaus (2026-09-07)

Fremde Abnahme, nichts gebaut, nichts vom Bauenden übernommen. Alle Zahlen aus
dem gerenderten Baum (CDP, Dev-Server 6107), jede Messung mit Gegenprobe: Regel
zur Laufzeit abschalten, neu messen, zurückschalten.

**Der breite Lauf, den der Umbau schuldig geblieben ist.** Alle **717 Stories**
des Katalogs, zwei Fensterbreiten (1280 und 720 px), je Tabelle die rechte
Kante jeder Kopfzelle gegen die derselben Spalte in jeder Datenzeile, dazu die
Zellenzahl jeder Zeile gegen die des Kopfs.

| | 1280 px | 720 px |
|---|---|---|
| Stories geladen (0 Fehler) | 717 | 717 |
| Stories mit `.v2tbl` | 180 | 180 |
| Tabellen | 209 | 209 |
| verglichene Zellen | 8 758 | 8 758 |
| **Kantenabweichungen > 0,5 px** | **0** | **0** |
| **Zeilen mit falscher Zellenzahl** | **0** | **0** |
| Tabellen mit `clientWidth`/`scrollWidth` 0 | 0 | 0 |
| Tabellen, die waagerecht scrollen | 6 | 43 |

Die 13 Tabellen ohne Kopfzeile (Beleg-Familie, `table--card-head-icon-meta`)
tragen nichts zum Kopf-gegen-Zeile-Vergleich bei und wurden getrennt Zeile
gegen Zeile gemessen: 336 Zellen, **0 Abweichungen**, beide Breiten.

*Gegenprobe des Detektors:* mit `td:nth-child(2) { margin-right: 13px }` zur
Laufzeit meldet derselbe Lauf sofort 50 Abweichungen (13,0 px), ohne die Regel
wieder 0. Der Nullwert ist gemessen, nicht bloß ausgeblieben.

**Die sieben Klassen tragen ihre Werte** — nicht an einem Beispiel, sondern an
**allen 128 Zellen**, die im Katalog eine der sieben Klassen tragen
(`getComputedStyle`, 188 Stories):

| Klasse | Zellen | gemessen |
|---|---|---|
| `v2tbl__group` | 14 | `block` · 7px 18px · **700** |
| `v2actions` (th) | 2 | `flex` · `flex-end` · `center` · gap 14px |
| `v2btxrow__split` | 1 | `block` · 8px 18px 12px 18px |
| `v2tbl__empty` | 23 | `block` · 30px 18px |
| `v2tbl__detail` | 8 | `block` · 14px 18px 16px 46px (7× 18/20 bei `--v2-detail-y: 18px`) |
| `v2tbl__error` | 7 | `flex` · `column` · `flex-start` · gap **8px** · 24px 18px |
| `v2num` (th) | 73 | `text-align: right` |

Kein abweichender Wert. Der Vorher-Zustand wurde am lebenden Baum nachgestellt
(alter 0-1-1-Reset plus die sieben Gegen-Regeln als `<style>` injiziert) —
alle sieben Werte identisch zu heute.

**Der Reset wirkt noch.** Über alle 188 Tabellen-Stories haben die **8 478
klassenlosen Zellen** genau drei Rechenwert-Profile: 7 364 `td` mit
`block` / 0 0 0 0 / **400** / `left`, 1 110 `th` ebenso, aber Gewicht **600**
(kommt per `font-weight: inherit` aus `tr.v2tbl__head`, gemessen: Zeile 600),
und 4 `th` mit `text-align: right` — die tragen ein Inline-`style` aus ihrer
Story und gewannen auch vor dem Umbau.

*Gegenprobe je Klasse:* Regel abschalten → der Reset übernimmt
(`.v2tbl__group` 700 / 7px 18px → 400 / 0, Zellhöhe 35,38 → 24,80 px;
`.v2tbl__error` `flex`/`column`/8px → `block`/`row`/`normal`;
`.v2num` am `th` rechts → links) → zurückschalten → alter Wert wieder da.
Und die alte Falle nachgestellt: injiziert man `.v2tbl th, .v2tbl td` mit
0-1-1 **ohne** Gegen-Regel, fällt die Zwischenzeile wieder auf 400 / 0
(35,38 → 21,38 px). Der Reset ist also da, und er verliert nur, weil er in
`:where()` steht.

**Die 8 px der Fehlerzelle sind die Zahl von vorher.** Nicht nur `gap: 8px` in
der Rechnung, sondern **8,00 px Lücke** zwischen Meldung und „Erneut laden" im
gemessenen Kasten. Mit den alten Regeln injiziert: ebenfalls 8,00 px. Mit
`gap: 10px` allein (was die alte Klassenregel ohne Gegen-Regel ergeben hätte):
10,00 px. `--space-2` misst 8px, `--space-3` 12px.

### Was noch offen ist

**Die Falle ist nicht ganz zu.** Ein Durchgang über alle Regeln aller
Stylesheets im laufenden Blatt (Spezifität berechnet, `:where()` als 0), die
eine echte Zelle treffen, lässt im `.v2tbl`-System genau **eine** Regel über
0-1-0 übrig:

    .v2tbl td[colspan] { width: 100%; }   /* 0-2-1 */

Sie trifft genau die Sonderzellen, um die es hier geht — `v2tbl__group`,
`__empty`, `__detail`, `__error` und `v2btxrow__split` stehen alle auf
`colSpan={999}`. Gemessen: `.v2tbl__group { width: 120px }` zur Laufzeit
dazugelegt bleibt wirkungslos (1246 px); schaltet man die Attributregel ab,
greift dieselbe Klassenregel sofort (120 px). Die Regel selbst ändert heute
nichts: in 7 Stories × 2 Breiten sind die Breiten mit und ohne sie identisch
(1246 / 686 / 1400 / 860 px). Kleinster Weg: `:where(.v2tbl td[colspan])` —
dieselbe Wirkung, keine Falle.

Die Zeilenregel `.v2tbl tr:has(> td[colspan])` (0-2-2) trifft heute nur Zeilen
**ohne** Klasse (gemessen in fünf Stories) und schlägt deshalb nichts.

Außerhalb dieser Aufgabe steht dieselbe Falle noch in der Markdown-Tabelle:
`.v2mk__tbl th, .v2mk__tbl td` (0-1-1). Gemessen: eine Klassenregel
`padding: 40px` an einer solchen Zelle bleibt wirkungslos (5px 10px 5px 0px)
und greift erst, wenn man die Zellregel abschaltet. Heute harmlos — alle 27
Zellen dort tragen keine Klasse.

**Drei Kommentarblöcke stehen verwaist im Blatt.** In `src/styles/v3.css`
folgen auf `.v2tbl td[colspan]` drei Blöcke, die die gestrichenen Gegen-Regeln
erklären („Die vier Klassen stehen deshalb hier noch einmal, auf der
Spezifität des Resets") und den Reset weiter auf **0-1-1** verorten. Beides
stimmt nicht mehr; sie hängen jetzt über `.v2tbl__scroll`. Wer sie liest,
schreibt die vierzehnte Gegen-Regel.

`pnpm typecheck`, `check:icons`, `check:contrast`, `check:language`,
`check:mirror`, `check:when`: alle Exit-Code 0.

- [x] Der Reset auf `th`/`td` steht in `:where()`; eine Klassenregel an einer
      Zelle greift ohne Gegen-Regel — an allen sieben Klassen gemessen, mit
      Abschalten und Zurückschalten

## Nach der Abnahme des `:where()`-Umbaus (2026-09-07)

Die Abnahme hat den breiten Lauf geliefert, den der Umbau schuldig geblieben
war: **717 Stories, zwei Breiten, 209 Tabellen, 8 758 verglichene Zellen je
Breite — 0 Kantenabweichungen, 0 falsche Zellenzahlen.** Dazu alle 128 Zellen
mit einer der sieben Klassen einzeln gemessen und der Vorher-Zustand am
lebenden Baum nachgestellt. Beides steht jetzt in der Datei; ich hatte darauf
verzichtet, eine Zahl zu behaupten, die mein hängengebliebener Lauf nicht
hergab.

Zwei Mängel, beide behoben:

**M1 — eine Regel stand noch, und zwar auf genau den befreiten Zellen.**
`.v2tbl td[colspan] { width: 100% }` hat Spezifität 0-2-1 und trifft
`__group`, `__empty`, `__detail`, `__error` und `__btxrow__split` — sie alle
stehen auf `colSpan`. Der Umbau tritt mit dem Anspruch an, die Falle zu
schließen, und ließ sie dort offen. Gemessen: eine Klassenregel
`width: 120px` blieb wirkungslos (1246 px) und greift jetzt (**120 px** in
allen drei geprüften Stories). Die Regel bewirkt dabei nichts — die Breiten
sind mit und ohne sie identisch —, aber sie stand im Weg.

**M2 — drei Kommentarblöcke behaupteten das Gegenteil des Codes.** Sie
erklärten die gestrichenen Gegen-Regeln („die vier Klassen stehen deshalb hier
noch einmal, auf der Spezifität des Resets") und verorteten den Reset weiter
auf 0-1-1. Sie hingen nach dem Umbau über `.v2tbl__scroll`. Wer sie liest,
schreibt die vierzehnte Gegen-Regel — sie sind gestrichen; was noch gilt,
steht im `:where()`-Kommentar.

**M3 gehört einer anderen Familie und ist als Befund vermerkt:**
`.v2mk__tbl th, .v2mk__tbl td` (Markdown-Tabelle, `v3.css:2151`) trägt
dieselbe Falle mit 0-1-1. Heute harmlos — alle 27 Zellen dort tragen keine
Klasse —, aber es ist dieselbe Bauform. Das gehört in eine eigene Aufgabe,
nicht hierher.
