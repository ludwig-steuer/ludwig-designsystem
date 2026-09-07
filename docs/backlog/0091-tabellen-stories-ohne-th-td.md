# 0091 · `<th>`/`<td>` in den Grid-Tabellen der Stories

| | |
|---|---|
| Status | Abnahme |
| Stufe | Stories unter `src/ui/v3/**` |
| Quelle | Abnahme Paket 0032/0033/0037/0041/0051, 2026-09-05 |
| Auftrag | `Table`, `HeadRow` und `Row` sind CSS-Grid-`<div>`s (`Table.tsx:102`, `:118`). **Fünfzehn Story-Dateien** füllen sie trotzdem mit `<th>`/`<td>` — darunter `Amount`, `Time` und bereits abgenommene wie `AppShell`, `Toast`, `FilterBar`. Fünfzehn weitere machen es richtig mit `<div>`, ebenso `DataTable`, `Log` und `ComparisonTable` im Produktivcode. |
| Warum das zählt | Zwei Folgen, beide sichtbar: React meldet Hydrationsfehler in der Konsole, und der Spaltenkopf erbt `text-align: center` aus dem UA-Stylesheet — ein Verstoß gegen V3, mitten in den Stories, die das Set vorführen. Wer eine Story als Vorlage nimmt, kopiert den Fehler weiter. |
| Zu tun | Die fünfzehn Dateien finden (`grep -rln "<th\|<td" src/ui/v3 --include=*.stories.tsx`), `<th>` → `<span>` (mit `className="v2num"`, wo die Spalte Zahlen trägt) und `<td>` → `<span>`. Danach die Konsole im Storybook auf Hydrationsfehler prüfen und je Datei eine Story ansehen. |
| Warum eine eigene Aufgabe | Es betrifft fünfzehn bereits abgenommene Aufgaben quer durch das Set. Als Mangel in einer einzelnen Abnahme wäre es an der falschen Stelle aufgehängt. |
| Angelegt von / am | Claude, 2026-09-05 (aus der Abnahme von Paket C) |

## Stand 2026-09-05 — acht von zwölf Dateien umgestellt

Umgestellt: `Toast`, `Amount`, `Cells`, `Popover`, `PageHeader`, `AppShell`,
`ActionButton`, `TextButton`. `<th>` und `<td>` **innerhalb** von `HeadRow`
und `Row` sind `<span>`; ein `<th style={{ textAlign: "right" }}>` wird zu
`<span className="v2num">` — die Ausrichtung kommt damit aus dem Set und nicht
aus einem Inline-Stil, der das UA-Stylesheet korrigiert.

Nachgemessen (Chromium headless, Konsole mitgelesen): `Cells --mono` und
`TextButton --in-row` melden **keine** Verschachtelungs-Warnung mehr; die noch
nicht umgestellte `Button --sizes-in-row` meldet weiter „div `<td>`" — die
Gegenprobe, dass die Prüfung greift. Der rechtsbündige Kopf „Betrag" steht
gemessen weiter auf `text-align: right`.

**Nicht angefasst, mit Grund:**

| Datei | Grund |
|---|---|
| `AmountInput.stories.tsx` | ihre `<td>` stehen in einer **echten** `<table>` (Vergleich zweier Parser-Ergebnisse), nicht in einer Grid-Zeile |
| `SourceDocumentFacts/-Preview/-Drawer.stories.tsx` | ihre `<th>`/`<td>` stehen in einem HTML-**String**, der als Vorschau in ein `<iframe>` geht |
| `DateField`, `Button`, `FilterBar`, `OverflowMenu` | stehen gerade in einer fremden Abnahme, deren Messungen an den Zeilenhöhen hängen — die `<td>` tragen 1 px Innenabstand aus dem UA-Stylesheet, und ein Umbau mitten in der Messung wäre unfair |
| `Icons`, `Color`, `Brand`, `Surface` | gehören einer parallelen Sitzung (0055/0056), noch nicht eingecheckt |

Damit bleibt die Aufgabe **offen**: vier Dateien nach der laufenden Abnahme,
vier, sobald die Nachbarsitzung eingecheckt hat.
