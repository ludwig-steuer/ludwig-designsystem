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
