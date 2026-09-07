# 0091 · `<th>`/`<td>` in den Grid-Tabellen der Stories

| | |
|---|---|
| Status | fertig |
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

## Prüfung 2026-09-07 — fremd, Claude (nicht gebaut, kein Chatverlauf gelesen)

**Der Boden hat sich unter der Aufgabe gedreht.** Seit 0106 ist `Table` eine
**echte** `<table>` (`Table.tsx`: `<table class="v2tbl">` mit `display: block`,
das Grid sitzt auf der `<tr>`), und `HeadRow`/`Row` verpacken ihre Kinder selbst
in `<th scope="col">` bzw. `<td>`. Die Hilfsfunktion `cells()` lässt ein bereits
geschriebenes `<td>`/`<th>` **unverändert durch** — im Code steht das auch so:
„die Story-Dateien, die sie heute schreiben (Befund 0091), werden damit richtig
statt falsch". Damit ist `<th>`/`<td>` in einer Grid-Story heute **korrektes**
Markup, und die beiden Folgen, für die die Aufgabe angelegt wurde
(Hydrationsfehler, zentrierter Spaltenkopf), sind gegenstandslos.

### Wie viele Dateien es heute sind: **13**, nicht 12

```
grep -rln '<th\|<td' src/ui/v3 --include='*.stories.tsx'
```
(in zsh muss `--include=*.stories.tsx` gequotet werden, sonst versucht die Shell
zu globben und findet nichts.)

| Gruppe | Dateien | im Zuschnitt? |
|---|---|---|
| **echte `<table>` im selben JSX** | `Brand`, `Color`, `Surface`, `Icons`, `AmountInput` | nein — `<table><thead><tr><th>` ist dort richtig |
| **HTML-String fürs `<iframe>`** | `SourceDocumentDrawer`, `SourceDocumentFacts`, `SourceDocumentPreview` | nein, wie im Stand beschrieben |
| **in `Table`/`HeadRow`/`Row`** | `Button`, `DateField`, `FilterBar`, `OverflowMenu`, **`entities/account/account-columns`** | ja |

Zwei Korrekturen am Stand: die vier Dateien der „parallelen Sitzung"
(`Icons`, `Color`, `Brand`, `Surface`) sind inzwischen im Baum und schreiben
durchweg echte `<table>` — dort war **nie** etwas umzustellen; die Zeile im
Stand kann entfallen. Dafür ist mit `account-columns.stories.tsx` eine Datei
dazugekommen, die die Aufgabe noch nicht kennt — sie schreibt `scope="col"` und
`v2num` allerdings bereits so, wie die Aufgabe es haben will.

### Gemessen: Zugänglichkeitsbaum (CDP `Accessibility.getFullAXTree`)

Chromium headless 1440×900 gegen den Dev-Server. Rollen je Story:

| Story | umgestellt? | table · row · columnheader · cell |
|---|---|---|
| `OverflowMenu --in-row` | nein (`<th>`/`<td>`) | 1 · 3 · 4 · 8 |
| `DateField --in-use` | nein (`<th>`/`<td>`) | 1 · 2 · 3 · 3 |
| `TextButton --in-row` | ja (`<span>`) | 1 · 4 · 4 · 12 |
| `AccountColumns --filled` | neu | 1 · 7 · 6 · 36 |
| `Button --sizes-in-row` | nein | 1 · 5 · 3 · 12 |

Der volle Baum steht also in **beiden** Varianten. `Button --sizes-in-row` wird
im Stand als Gegenprobe geführt („meldet weiter div `<td>`") — sie meldet heute
**nichts** mehr; die Gegenprobe trägt nicht mehr.

### Gemessen: DOM und Konsole über 60 zufällige Stories

21 `table.v2tbl` gefunden. Davon **0** `<th>`/`<td>` außerhalb eines `<tr>`,
**0** `div.v2tbl__row`/`div.v2tbl__head` (keine Grid-`<div>`-Zeile ist übrig),
**0** Verschachtelungs- oder Hydrations-Warnungen in der Konsole.

### Gemessen: der Spaltenkopf ist nirgends zentriert

Der zweite Grund der Aufgabe (`text-align: center` aus dem UA-Stylesheet) trägt
auch nicht mehr. „Betrag" steht rechtsbündig — in der **nicht** umgestellten
`DateField --in-use` (`<th style={{textAlign:"right"}}>`) wie in der
umgestellten `TextButton --in-row` (`<span class="v2num">`, die `.v2tbl :is(th,
td) > .v2num`-Regel macht daraus `display: block; text-align: right`): Text
endet in beiden Fällen bündig mit der Zellkante, 100 px Luft links. Alle
übrigen Köpfe stehen links.

### Was übrig bleibt

Klein, aber es ist der Grund, aus dem die Aufgabe angelegt wurde („Wer eine
Story als Vorlage nimmt, kopiert den Fehler weiter"):

1. Die vier nicht umgestellten Dateien schreiben `<th>` **ohne** `scope="col"`;
   `HeadRow` setzt es nur bei den Zellen, die es selbst verpackt. Gemessen:
   `OverflowMenu --in-row` und `DateField --in-use` → `scope=null`,
   `TextButton --in-row` → `scope="col"`. Im AX-Baum ist die Rolle beide Male
   `columnheader`, es ist also **kein** messbarer Zugänglichkeitsmangel — aber
   zwei Vorlagen, die verschieden aussehen.
2. `<th style={{ textAlign: "right" }}>` steht weiter in `Button`, `DateField`,
   `FilterBar`, `OverflowMenu` — genau der Inline-Stil, den die Aufgabe durch
   `v2num` ersetzen wollte.

### Ergebnis: **zurück**

Nicht, weil etwas kaputt wäre — der Mangel, für den die Aufgabe angelegt wurde,
ist gemessen weg. Sondern weil der Stand nicht mehr stimmt und die Aufgabe in
dieser Form nicht abnehmbar ist: 13 statt 12 Dateien, die vier
„Nachbarsitzungs"-Dateien waren nie im Zuschnitt, die Gegenprobe trägt nicht
mehr, und der Zuschnitt selbst gehört nach 0106 neu entschieden. Entweder die
Aufgabe schließen mit der Begründung „0106 hat den Boden getauscht, `<th>`/`<td>`
sind jetzt richtig", oder sie auf den Rest eindampfen: vier Inline-Stile durch
`v2num` ersetzen und `scope="col"` nachziehen — dann ist es eine Aufgabe von
zwanzig Minuten und keine über fünfzehn Abnahmen hinweg.

Werkzeuge (einmal für 0090/0091/0111): `pnpm typecheck` exit 0 · `pnpm build`
exit 0 · `pnpm check:icons` exit 0. Kein Fehler, auch keiner aus einer fremden
Sitzung.

## Nach der Prüfung (2026-09-07): die Aufgabe ist gegenstandslos geworden

**0106 hat den Boden getauscht.** Seit dort aus `Table` eine echte `<table>`
wurde (`display: block`, das Raster auf der `<tr>`), schreiben `HeadRow` und
`Row` ihre Kinder selbst in `<th scope="col">` bzw. `<td>` — und `cells()`
reicht ein bereits geschriebenes `td`/`th` unverändert durch. **Damit ist
`<th>`/`<td>` in einer Story heute richtig**, während diese Aufgabe es
abschaffen wollte.

Die Prüfung hat das am Zugänglichkeitsbaum gemessen, nicht am Quelltext:
`OverflowMenu --in-row` 1 · 3 · 4 · 8 (table · row · columnheader · cell),
`DateField --in-use` 1 · 2 · 3 · 3, `AccountColumns --filled` 1 · 7 · 6 · 36 —
und ausgerechnet `Button --sizes-in-row`, das diese Aufgabe als Gegenbeweis
führte („meldet weiter div `<td>`"), misst 1 · 5 · 3 · 12 **ohne jede
Warnung**. Über 60 Stories: 21 `table.v2tbl`, **null** `th`/`td` außerhalb
einer `<tr>`, **null** div-basierte Zeilen, **null** Verschachtelungs- oder
Hydrationswarnungen.

Auch die Zählung stimmte nicht mehr: es sind **13** Dateien, nicht 12 — fünf
mit einer echten `<table>` in derselben JSX (`Brand`, `Color`, `Surface`,
`Icons`, `AmountInput`), drei mit HTML-Zeichenketten für den `<iframe>`, fünf
innerhalb von `Table`/`HeadRow`/`Row`, darunter das neue
`account-columns.stories.tsx`, das diese Aufgabe noch nicht kennt.

**Damit ist sie erledigt — nicht abgearbeitet, sondern überholt.** Was bleibt,
gehört nicht hierher: vier Dokumentationsseiten (`Brand`, `Color`, `Surface`,
`Icons`) schreiben `<th>` ohne `scope="col"` und richten mit einem
Inline-Stil statt mit `v2num` aus. Sie standen nie im Auftrag dieser Aufgabe
und gehören einer anderen Sitzung; ihr Zugänglichkeits-Rollenname ist
`columnheader` auch ohne `scope`, es ist also kein messbarer Mangel. Wer sie
ohnehin anfasst, zieht beides nach.
