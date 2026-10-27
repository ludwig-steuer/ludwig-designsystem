# 0233 · Markdown: Tabellen mit Pipe im Code, volle Breite, Stil wie DataTable

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` (`Markdown.tsx`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, Text mit Tabellen ist fachfrei |
| Quelle | llcto 2026-10-27, Befund: Specs liegen seit F567 als Dokument am Produktbefund und werden im Admin-Drawer per `Markdown` gezeigt; jede Spec hat eine Abnahme-Tabelle (`\| Kriterium \| Kommando \| Erwartung \|`) |
| Ersetzt | nichts; `FeedbackDocuments.tsx` der App nutzt `Markdown` aus dem Set |
| Blockiert | nichts, kein Eilauftrag |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Wer im Drawer eine Spec liest, sieht die Abnahme-Tabelle heute so: Sie wird als
Tabelle erkannt, hat aber zwei Fehler.

- Ein maskiertes Pipe im Inline-Code (`grep -rnE "a\|b"`) teilt die Zelle. Der
  Rest der Zeile landet in der falschen Spalte.
- Die Tabelle kann breiter werden als ihr Drawer. Im schmalen Drawer (`sm`,
  395–450 px Inhalt) und im Story-Rahmen von 480 px liegt die dritte Spalte
  hinter einem Querscroll, gemessen 873 gegen 480 px. Am Ort der App
  (`FeedbackDocuments`, `size="lg"`, 1060 px) passte F294 schon vorher; der
  Gewinn dort sind die Pipes und der Stil.

Probe: die Abnahme-Tabelle von F294 aus der App, 3 Spalten, 20 Zeilen.

## Einordnung

- **Erweitern statt neu:** `Markdown` (0022) hat einen Tabellen-Block. Er wird
  korrigiert, eine neue Komponente gibt es nicht.
- **GFM-Regel:** Eine Zeile wird nur am **unmaskierten** `|` geteilt. `\|` in einer
  Zelle ist ein Pipe und wird als `|` gezeigt, auch innerhalb von Inline-Code.
  Die anderen Escapes (`\*`, `\_`) bleiben unverändert, wie bisher.
- **Stil wie `DataTable`:** Kopf in der Rolle „Tabellenkopf“ (12,5/600, subtle),
  eine Trennlinie `--color-border-subtle` je Zeile, keine Zebra und keine Gitter.
- **Breite:** Die Tabelle nimmt die Breite ihres Behälters (100 %). Zellen brechen
  um, langer Inline-Code bricht innerhalb (`overflow-wrap: anywhere`). Den Querscroll
  gibt es nur noch, wenn eine Zelle nicht umbrechen kann.

## Schnittstelle

Keine neue Prop. Geändert sind der Parser (`splitRow`) und der Stil
(`.v2mk__tbl`).

Was die Komponente **nicht** kann (bewusst): eine Ausrichtung je Spalte aus der
Trennzeile (`:--:`), eine Zelle über mehrere Zeilen, eine Tabelle ohne Trennzeile.
Ohne `|---|` ist es keine GFM-Tabelle und bleibt ein Absatz. Ebenso, wie vor 0233:
Eine Tabelle ohne führendes `|` wird ein Absatz; eine Trennzeile mit weniger
Zellen als der Kopf ergibt trotzdem eine Tabelle; eine Zeile mit mehr oder
weniger Zellen als der Kopf wird nicht aufgefüllt oder gekürzt (GFM tut das).

## Verhalten

- Server-tauglich wie bisher, nur React-Elemente.
- Eine Zelle mit `\|` innerhalb von Backticks zeigt Code mit `|`.
- Text links, auch im Kopf; Zahlen in Specs sind Text, keine Wertzellen.

## Stories

Eine Story `TableInDrawer` mit der Abnahme-Tabelle einer Spec im echten `Drawer`
in der schmalsten Größe (`sm`). Darin stehen Zellen mit `\|` im Code, lange
Kommandos und eine Zeile mit fettem Text. `Filled`, `Long`, `InUse` und `Reader`
zeigen die bisherigen Tabellen.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ausrichtung aus der Trennzeile | — (Parser) | eine Spec setzt Zahlen in eine Spalte und will sie rechts |

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der TSX
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] `\|` teilt keine Zelle: In `TableInDrawer` hat jede Zeile 3 Zellen, und die Zellen mit `\|` zeigen ein `|` im Code. `parseMarkdown` liefert für die Probe-Tabelle 3 Spalten in allen Zeilen
- [ ] Im echten `Drawer` `sm` (bei 1280 und 1440 px) ist die Tabelle so breit wie ihr Behälter, ohne Querscroll; lange Kommandos brechen um, Wörter außerhalb von Code nicht mitten durch (`TableInDrawer`, `getBoundingClientRect`)
- [ ] Kopf 12,5/600 in `--color-text-subtle`, eine Linie `--color-border-subtle` je Zeile, keine Zebra (`TableInDrawer`)
- [ ] Die bisherigen Markdown-Stories sind bis auf Breite und Kopfstil unverändert; ein Text ohne Trennzeile bleibt Absatz

### Messung des Bauenden (keine Abnahme)

`scripts/cdp.mjs`, Storybook :6107, Rahmen 520 px:
- `TableInDrawer`: Tabelle 480 px im 480-px-Behälter, kein Querscroll; jede der 6 Zeilen (Kopf plus 5) hat 3 Zellen. Die Zellen mit `\|` zeigen `grep -rnE "status = '(accepted|reversed)'" …` und `grep -n "^### Transition|Zustandswechsel" …` als Code, jeweils in einer Zelle. Kopf 12,5/600 `--color-text-subtle`.
- `Filled`: Tabelle 560 = Behälter, 3 × 3 Zellen, Kopf wie oben.
- Wörter brechen nicht mitten durch („Zustandsmaschine“ ganz), nur Code bricht (`overflow-wrap: anywhere` nur an `code`). Eine erste Fassung mit `anywhere` an jeder Zelle brach „Typecheck“ in „Typechec k“; das ist verworfen.
- Vorher (HEAD, dieselbe Tabelle aus F294 der App): 873 px Tabelle in 480 px Behälter, Querscroll; vier Zeilen mit `\|` mit verschobenen Zellen.

## Abnahme

Gemessen am Arbeitsbaum, also am uncommitteten Diff an `Markdown.tsx`,
`Markdown.stories.tsx` und `v3.css` gegen HEAD `80aef74`. Gemessen wurde auf dem
Dev-Server 6107 mit einem Messbrowser über `scripts/cdp.mjs`. Für das Vorher ist
die HEAD-Fassung von `Markdown.tsx` per esbuild als CJS gebaut. Die alten
Tabellenregeln sind mit gleicher Spezifität über den Arbeitsbaum gelegt: Breite
`auto`, der Kopf erbt die Größe und trägt `--color-text-muted`, kein
`overflow-wrap`. Den Parser prüft eine Sonde mit 20 Fällen gegen drei
GFM-Renderer: GitHub (`gh api /markdown`, cmark-gfm), pandoc 3.9 `-f gfm` und
markdown-it. Story-Deckung: Es gibt keine neue Prop. Die verlangte Story
`TableInDrawer` ist da und trägt `\|` im Code, lange Kommandos und eine Zeile mit
fettem Text. Skripte und Rohdaten liegen als `abn0233-*` im Scratchpad der
Sitzung.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` endet mit Exit 0. `pnpm build` ist `storybook build`. Gebaut wurde mit `storybook build -o …/sb-check-0233`: „Storybook build completed successfully“, Exit 0, keine Fehlerzeile im Log | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Die Exporte `parseInline`, `parseMarkdown` und `Markdown` tragen beide Tags, `splitRow` ist intern. Der neue Kommentar sowie `SPEC_ACCEPTANCE` und `TableInDrawer` sind englisch. Deutsch steht nur im Story-Text und in der Story-Beschreibung (0098 M10). `check:when` und `check:language` enden mit Exit 0, ebenso beide `--test` | ✓ |
| Kein Hex, kein px in der TSX | `Markdown.tsx` hat kein Hex. Das einzige `px` ist das alte `${maxHeight}px` der Prop, es gehört nicht zum Diff. Der Story-Rahmen setzt `width: 520` als Zahl, eine Fixture (M1) | ✓ |
| Im Browser angesehen | Screenshots `abn0233-table-in-drawer-1280.png` und `-1440.png` sowie `abn0233-real-drawer-{1280,1440}-{sm,md,lg}.png`. Aufgerufen wurden 55 Stories bei 1280 und 1440 px, dazu `TableInDrawer`, `Drawer/Open` und `DataTable/Filled`. In allen 115 Aufrufen zeigt jede Story Text, und die Konsole meldet nichts (kein error, keine warning, keine exception). Die Wächter `check:type`, `check:contrast` und deren `--test` enden mit Exit 0. `check:classes` endet mit Exit 1, nur wegen der vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot` und `cy-page`, die nicht aus diesem Diff kommen; sein `--test` endet mit Exit 0 | ✓ |
| Ein maskiertes Pipe teilt keine Zelle (`TableInDrawer`, `parseMarkdown`) | `TableInDrawer` bei 1280 und 1440 px: 6 Zeilen (Kopf plus 5) mit je 3 Zellen. Die beiden Zellen mit maskiertem Pipe zeigen in Spalte 2 als Code `grep -rnE "status = '(accepted\|reversed)'" apps/web/src` und `grep -n "^### Transition\|Zustandswechsel" docs/GLOSSARY.md`. `parseMarkdown` auf F294 der App: Die Abnahme-Tabelle hat 20 Zeilen mit je 3 Zellen, auch die vier mit maskiertem Pipe im Code (Python-Grep, Doku-Sweep, Glossar, P-Eintrag Log). Unter HEAD hatten diese vier 6, 5, 4 und 4 Zellen. Die Sonde deckt das maskierte Pipe in Code, Text, Fett und Kopf ab, am Zellanfang, am Zeilenende ohne schließendes Pipe und vor dem schließenden Pipe. Dazu kommen ein maskierter Backslash vor dem Pipe im Code (zeigt Backslash und Pipe), ein unmaskiertes Pipe im Code (teilt), leere Zellen und Zeilen ohne schließendes Pipe. In allen Fällen gleich wie die drei Renderer; Abweichungen stehen in H1–H3 | ✓ |
| In Drawer-Breite so breit wie der Behälter, ohne Querscroll; lange Kommandos brechen um | `TableInDrawer` bei 1280 und 1440 px: Die Tabelle ist 480 px breit, ihr Behälter auch, `scrollWidth` 480 = `clientWidth`. Keine Zelle läuft über, die Seite scrollt nicht quer. Sechs Code-Spannen brechen auf 2 bis 6 Zeilen um. Gemessen wurde auch im echten `Drawer` (`v3-primitives-dialog-drawer--open`), dessen Körper durch das statische Markup der F294-Abnahme-Tabelle ersetzt wurde. Bei 1280 / 1440 px ist der Körper in `sm` 395 / 450 px breit, in `md` 600 / 680 px, in `lg` 1060 / 1060 px. In jeder Stufe ist die Tabelle so breit wie der Körper, ohne Querscroll, mit 21 Zeilen zu je 3 Zellen. Kein Wort außerhalb von Code bricht mitten im Wort, nur nach dem Bindestrich (`Disposition-` / `Backfill`, `Dev-` / `Datensatz`, `Beleg-` / `Parity`). Code bricht auch im Wort, etwa `Zustandswech` / `sel"` in der 184-px-Spalte | ✓ in der Wirkung; das Kriterium selbst misst eine Fixture (M1) |
| Kopf 12,5/600 in `--color-text-subtle`, eine Linie `--color-border-subtle` je Zeile, keine Zebra | `TableInDrawer` und alle drei Drawer-Stufen: `th` hat 12.5px, 600 und `rgb(113, 113, 113)` = `--color-text-subtle`, Kontrast 4,88:1 auf Weiß. Jede Zelle hat `1px solid rgb(236, 239, 243)` = `--color-border-subtle`. Alle `tr`, `th` und `td` sind transparent. Zum Vergleich `.v2tbl__head` in `v3-patterns-arbeitsfläche-datatable--filled`: 12.5px, 600, `rgb(113, 113, 113)`, Linie `1px solid` subtle, Zeilenhöhe 19,375 px. Das ist dasselbe wie hier | ✓ (H6) |
| Die bisherigen Markdown-Stories sind bis auf Breite und Kopfstil unverändert; ein Text ohne Trennzeile bleibt Absatz | A/B im selben Browser: erst gemessen, dann die drei HEAD-Regeln darübergelegt und erneut gemessen. Verglichen wurden Lage, Größe, Schrift und Farbe jedes Elements in `#storybook-root`, in 55 Stories bei 1280 und 1440 px: Markdown 8, RawRecord 7, ClarificationCard 23, Typografie 6, Stapelabnahme Schritt 0 10, Sachverhalt-CRUD 1. `Filled`, `Long`, `InUse` und `Reader` ändern sich nur in der Tabelle. Außerhalb rutschen nur die Elemente unter der Tabelle senkrecht; Lage links, Breite, Schrift und Farbe bleiben gleich. Alle anderen Stories zeigen keine Änderung. Sachverhalt-CRUD bewegt 5 Elemente auch ohne CSS-Wechsel, das ist eigene Dynamik der Story. `parseMarkdown` liefert für `REPORT`, dreimal `REPORT` und `OCR` unter HEAD dasselbe wie im Arbeitsbaum. Die Sonde zeigt: `\| A \| B \|` über `\| a \| b \|` ohne Trennzeile bleibt Absatz, ebenso `Status \| offen`, wie in GFM | ✓ |
| Mangel der Spec: Kriterium 2 nennt eine Breite, die kein Drawer hat | siehe M1 | ✗ |

Abgenommen von / am: fremde Abnahme (schlanke Abnahme plus Messung der Kriterien), 2026-10-27 · Offene Punkte: M1; H1–H7

## Mängel

- **M1 · Kriterium 2 misst eine Fixture, nicht den Drawer.** „Drawer-Breite
  (520 px)“ ist keine Stufe des `Drawer`. Bei 1280 und 1440 px ist `--drawer-sm`
  435 und 490 px breit, `--drawer-md` 640 und 720 px, `--drawer-lg` 1100 px.
  `TableInDrawer` ist ein `div` mit `width: 520`. Darum misst die Story bei 1280
  und 1440 px dasselbe und sagt über den Einsatzort nichts (`v3-komponente`,
  „Abnahme“, 0071). Die Stelle aus der Quelle, `FeedbackDocuments.tsx` der App,
  öffnet den Drawer mit `size="lg"`, sein Körper ist 1060 px breit. Dort zeigte
  schon HEAD die F294-Tabelle ohne Querscroll (gemessen: 1060 px Tabelle in
  1060 px). Die „873 gegen 480 px“ im Ziel gelten für die Fixture und für `sm`, wo
  HEAD 873 px in 395 und 450 px zeigt. Die Wirkung ist in allen drei Stufen
  erfüllt (Zeile 6). Zu ändern sind Story und Spec. Die Story rendert in `Drawer`,
  mit `sm` als schmalster Stufe und `lg` wie in der App, oder sie nimmt die
  Breite aus `var(--drawer-sm)`. Kriterium und Ziel nennen die Stufe und den Ort
  der Messung.

**Hinweise**

- **H1 · Zeilen mit mehr oder weniger Zellen als der Kopf.** GFM füllt eine kurze
  Zeile mit leeren Zellen auf und lässt überzählige weg. `Markdown` rendert die
  Zeile, wie sie kommt, wie schon vor 0233. Unter einer kurzen Zeile endet die
  Linie bei ihrer letzten Zelle. Eine lange Zeile bekommt Spalten ohne Kopf. In
  den 88 Specs unter `docs/backlog/` der App stehen 261 Tabellen. HEAD rendert
  davon 113 Zeilen in 56 Tabellen schief, der Arbeitsbaum noch 6 Zeilen in 5
  Tabellen. 5 davon sind zu lang, weil die Quelle ein unmaskiertes `|` trägt
  (F149, F294 A9, A12 und E5, F516), das ist ein Befund an die App. Eine ist zu
  kurz (F170). Auffüllen und Kürzen auf `header.length` wären zwei Zeilen in
  `parseMarkdown`. Sonst gehört der Fall unter „Was die Komponente nicht kann“.
- **H2 · Zwei weitere Abweichungen von GFM, ebenfalls nicht unter „nicht
  kann“.** Eine Tabelle ohne führendes `|` (`A | B` über `---|---`) ist in GFM
  eine Tabelle, hier ein Absatz. Hat die Trennzeile weniger Zellen als der Kopf,
  ist das in GFM ein Absatz, hier eine Tabelle. Beides ist alt. In den Dokumenten
  der App steht heute keine Tabelle ohne führendes `|`.
- **H3 · `\\|` im Text.** Außerhalb von Code zeigt `Markdown` `\|`, GFM zeigt `|`.
  Das folgt aus der Regel, dass die übrigen Escapes unverändert bleiben. Im Code
  ist das Ergebnis gleich wie in GFM (`x\|y`).
- **H4 · BRE-Kommandos verlieren ihren Sinn, und zwar GFM-korrekt.** `grep` ohne
  `-E` liest `\|` als Alternative. Nach GFM zeigt der Drawer daraus `|`, und das
  ist in BRE ein wörtliches Zeichen. Das Kommando im Drawer meint also etwas
  anderes als das in der Datei. Betroffen sind in F294 die Zeilen Doku-Sweep,
  Glossar und P-Eintrag Log, in der Story die Zeile Glossar. GitHub zeigt
  dasselbe. Das ist ein Befund an die App, kein Mangel der Komponente: In einer
  Zelle `\\|` schreiben (zeigt `\|`, gemessen) oder `grep -E` nehmen.
- **H5 · „Filled und Variants zeigen die bisherigen Tabellen“ stimmt nur halb.**
  `Variants` hat keine Tabelle. Die bisherigen Tabellen stehen in `Filled`,
  `Long`, `InUse` und `Reader`. Außerhalb der Markdown-Stories rendert keine
  Story eine Markdown-Tabelle. Das OCR in `RawRecord` läuft über `LongText`, und
  die Fixtures von ClarificationCard, Stapelabnahme und Sachverhalt-CRUD haben
  keine.
- **H6 · Die letzte Zeile behält ihre Linie.** `DataTable` nimmt sie ihr
  (`.v2tbl__body > .v2tbl__row:last-child`). „Wie `DataTable`“ gilt für den Kopf
  und die Linie, nicht für das Ende der Tabelle. Zu entscheiden in 0119 oder in
  einer Folge-Spec.
- **H7 · `overflow-wrap: break-word` an den Zellen wirkt nicht.** Im
  automatischen Tabellen-Layout bleibt das längste Wort die Mindestbreite der
  Spalte, und die Spalte wird nie schmaler. Die Regel schadet nicht und kann
  wegfallen. Die Wirkung kommt allein von `anywhere` an `code`.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | `TableInDrawer` zeigt die Tabelle im echten `Drawer` `sm`. Ziel und Kriterium 2 sagen jetzt, wo der Querscroll war: im schmalen Drawer und im Story-Rahmen. Am Ort der App (`lg`) passte F294 schon vorher. Das Kriterium hat der Spec-Autor so gefasst, weil es eine Fixture maß; gemessen wird jetzt der Drawer. Messung des Bauenden: Tabelle 395 = Behälter (1280 px), 450 = Behälter (1440 px), kein Querscroll, 6 × 3 Zellen |
| H2 | Die drei alten GFM-Abweichungen stehen unter „nicht kann“ |
| H5 | Die Stories mit den bisherigen Tabellen heißen richtig: `Filled`, `Long`, `InUse`, `Reader` |
| H6 | Die letzte Zeile hat keine Linie mehr, wie bei `DataTable` |
| H7 | `overflow-wrap: break-word` an den Zellen ist gestrichen; es wirkt in der automatischen Tabellenbreite nicht |
| H1, H3 | bleiben als Hinweise: Zeilen mit anderer Zellenzahl und `\\|` in reinem Text verhalten sich wie vor 0233 |
| H4 | geht an llcto: In BRE-`grep` wird aus `\|` in GFM ein `\|` ohne Backslash, der Befehl im Drawer meint dann etwas anderes; Specs schreiben `\\|` oder nutzen `grep -E` (Nachtrag: die Zelle maskiert ihr Pipe jetzt selbst, H9) |


## Nachprüfung 1 (2026-10-27)

Gemessen am Arbeitsbaum nach Nachbesserung 1, Dev-Server 6107, ein Messbrowser
über `scripts/cdp.mjs`. Für das A/B ist die Linie der letzten Zeile mit gleicher
Spezifität wieder darübergelegt. Skript und Rohdaten: `abn0233-n1.mjs` und
`abn0233-n1.json` im Scratchpad der Sitzung. Es gab keine Aufrufe an externe
Dienste.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 · `TableInDrawer` im echten `Drawer` `sm`, bei 1280 und 1440 px | `v3-primitives-fläche-markdown--table-in-drawer` rendert `.v2drawer.v2drawer--sm.is-open`. Bei 1280 px ist der Drawer 435 px breit, Körper und Tabelle 395 px, `scrollWidth` 395 = `clientWidth`, der Körper scrollt nicht quer. Bei 1440 px: Drawer 490 px, Tabelle 450 px im 450-px-Körper, ohne Querscroll. 6 Zeilen mit je 3 Zellen; die beiden Zellen mit maskiertem Pipe zeigen das Pipe im Code, in Spalte 2. Keine Zelle läuft über. Kein Wort außerhalb von Code bricht, nur Code bricht, auch im Wort (`Zusta` / `ndswechsel"` bei 1280 px). Kopf 12,5/600 `rgb(113, 113, 113)`, 4,88:1. Die Konsole meldet nichts. Screenshots `abn0233-n1-table-in-drawer-1280.png` und `-1440.png` | ✓ |
| M1 · Ziel und Kriterium 2 gegen die Messung am Ort der App | Das Ziel nennt den Querscroll im `sm` (395–450 px) und im 480-px-Rahmen mit 873 px Tabelle und sagt, dass F294 am Ort der App (`lg`, 1060 px) schon vorher passte. Die erste Abnahme hat unter HEAD gemessen: 873 px Tabelle in 395 und 450 px (`sm`), 1060 px in 1060 px (`lg`, bei 1280 und 1440 px). Das stimmt überein. Kriterium 2 misst jetzt die schmalste echte Stufe; `md` und `lg` belegt die erste Abnahme | ✓ |
| H6 · letzte Zeile ohne Linie | In `TableInDrawer`, `Filled`, `Long`, `InUse` und `Reader` haben die Zellen der letzten Zeile `border-bottom: 0`. Der Kopf und alle anderen Zeilen haben `1px` `rgb(236, 239, 243)` = `--color-border-subtle` | ✓ |
| H7 · `break-word` gestrichen | Im Diff tragen die Zellen kein `overflow-wrap` mehr, nur `code` trägt `anywhere`. Wörter bleiben ganz (Zeile 1) | ✓ |
| Folgen für `Filled`, `Long`, `InUse` und `Reader` | A/B bei 1280 und 1440 px, Arbeitsbaum gegen den Arbeitsbaum mit zurückgelegter Linie: Jede Tabelle wird 1 px niedriger (94,2 → 93,2 px). Die Elemente unter ihr rutschen um 1 px je Tabelle nach oben, in `Reader` mit drei Tabellen um bis zu 3 px. Lage links, Breite, Schrift und Farbe ändern sich nirgends. Gegen HEAD unterscheiden sich die Stories nur in Breite, Kopfstil und dieser Linie. Die Kriterien 3 und 4 gelten damit im Sinn der Einordnung („Trennlinie“, „Stil wie `DataTable`“) und von Nachbesserung 1, H6 (H8) | ✓ |
| H2 und H5 · Angaben der Spec | „Was die Komponente nicht kann“ nennt alle drei alten GFM-Abweichungen: Tabelle ohne führendes Pipe, Trennzeile mit weniger Zellen als der Kopf, Zeilen mit anderer Zellenzahl. Das deckt sich mit der Sonde. „Stories“ nennt `Filled`, `Long`, `InUse` und `Reader`, die vier Stories mit Tabelle | ✓ |
| `pnpm typecheck`, `check:classes` | `pnpm typecheck` endet mit Exit 0. `check:classes` endet mit Exit 1, nur wegen der vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot` und `cy-page`, keine davon aus diesem Diff. Dazu sind `check:language` und `check:when` in Ordnung, und `storybook build -o …/sb-check-0233` endet mit Exit 0 | ✓ |

Abgenommen von / am: fremde Abnahme (schlanke Abnahme plus Messung der Kriterien), Nachprüfung 1, 2026-10-27 · Offene Punkte: keine; H1, H3 und H4 bleiben Hinweise, H8 und H9 kommen dazu

**Hinweise aus der Nachprüfung**

- **H8 · Wortlaut von Kriterium 3 und 4.** „Eine Linie je Zeile“ und „bis auf
  Breite und Kopfstil unverändert“ nennen die letzte Zeile nicht, die seit H6
  keine Linie mehr hat. Die Einordnung („Trennlinie“, „wie `DataTable`“) trägt
  das. Für die nächste Spec der Familie: das Tabellenende ausdrücklich nennen.
- **H9 · Ein Pipe in der Tabelle „Nachbesserung 1“.** Die Zeile H4 schreibt `|`
  unmaskiert in den Code. Unter GFM und unter `Markdown` teilt das die Zelle, die
  Zeile bekommt drei Zellen statt zwei. Das ist dieselbe Falle wie in F294.
