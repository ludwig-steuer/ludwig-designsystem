# 0091 · `<th>`/`<td>` in den Grid-Tabellen der Stories

| | |
|---|---|
| Status | offen |
| Stufe | Stories unter `src/ui/v3/**` |
| Quelle | Abnahme Paket 0032/0033/0037/0041/0051, 2026-09-05 |
| Auftrag | `Table`, `HeadRow` und `Row` sind CSS-Grid-`<div>`s (`Table.tsx:102`, `:118`). **Fünfzehn Story-Dateien** füllen sie trotzdem mit `<th>`/`<td>` — darunter `Amount`, `Time` und bereits abgenommene wie `AppShell`, `Toast`, `FilterBar`. Fünfzehn weitere machen es richtig mit `<div>`, ebenso `DataTable`, `Log` und `ComparisonTable` im Produktivcode. |
| Warum das zählt | Zwei Folgen, beide sichtbar: React meldet Hydrationsfehler in der Konsole, und der Spaltenkopf erbt `text-align: center` aus dem UA-Stylesheet — ein Verstoß gegen V3, mitten in den Stories, die das Set vorführen. Wer eine Story als Vorlage nimmt, kopiert den Fehler weiter. |
| Zu tun | Die fünfzehn Dateien finden (`grep -rln "<th\|<td" src/ui/v3 --include=*.stories.tsx`), `<th>` → `<span>` (mit `className="v2num"`, wo die Spalte Zahlen trägt) und `<td>` → `<span>`. Danach die Konsole im Storybook auf Hydrationsfehler prüfen und je Datei eine Story ansehen. |
| Warum eine eigene Aufgabe | Es betrifft fünfzehn bereits abgenommene Aufgaben quer durch das Set. Als Mangel in einer einzelnen Abnahme wäre es an der falschen Stelle aufgehängt. |
| Angelegt von / am | Claude, 2026-09-05 (aus der Abnahme von Paket C) |
