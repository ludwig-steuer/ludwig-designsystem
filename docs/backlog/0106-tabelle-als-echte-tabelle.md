# 0106 · Die v3-Tabelle als echte Tabelle

| | |
|---|---|
| Status | offen |
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
