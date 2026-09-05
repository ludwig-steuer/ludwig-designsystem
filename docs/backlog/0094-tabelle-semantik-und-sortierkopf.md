# 0094 · Die Tabelle sagt nicht, dass sie eine ist

| | |
|---|---|
| Status | offen |
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
