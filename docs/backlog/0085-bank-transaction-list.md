# 0085 · BankTransactionList + BankTransactionColumns — der Kontoauszug

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/bank-transaction/` |
| Quelle | Entitätsprofil `docs/entitaeten/bank-transaction.md`, Abschnitt „Listen" (Zeile `BankTransactionList`) |
| Auftrag | Der Kontoauszug eines Zahlungskontos als Liste: Zeile (`BankTransactionRow`), Zeitraum- und Zustands-Filter, Volltextsuche über Zweck, Gegenpartei, Betrag, Sachverhalt und SEPA-Referenzen, Aufklapper je Zeile für die zugeordneten Sachverhalte mit Teilbeträgen. Ersetzt `modules/bank-transactions/ui/KontoauszugView.tsx` (631 Z.). |
| Job | Wenn **ein Kontoauszug importiert ist**, will **die Sachbearbeiterin** **sehen, welche Zahlungen noch keinem Vorgang gehören**, damit **kein Geldfluss ungebucht durchrutscht**. |
| Umfang | je Konto und Jahr p50 36 · **p90 251** · max 952 (Staging 2026-09-05) → `Pagination`, Serverfilter, Lade- und Fehlerfall gehören in die Spec |
| Vertagt, weil | für die Route `[clientSlug]/[year]/banks/[accountId]` **kein Seitenprofil** unter `docs/seiten/` existiert. Ohne es sind Kopfzeile, Zeitraum, Saldo und die beiden Leerfälle geraten. |
| Zu entscheiden | Offene Frage 3 des Profils: gehört der laufende Saldo in die Zeile oder unter die Liste? *Default: unter die Liste* — eine Saldo-Spalte je Zeile stimmt nur bei genau einer Sortierung, und die Liste ist filterbar. Dass der Auszug heute gar keinen Saldo zeigt, ist Befund L-58. |
| Setzt voraus | `BankTransactionRow` (erste Welle) · `DataTable` (0057) · Seitenprofil `docs/seiten/kontoauszug.md` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |

## Spec 2026-09-07 (Skill `spec-schreiben`), gebaut in derselben Sitzung

Die Wartebedingung ist weg: das Seitenprofil steht als
`docs/seiten/kontoauszug.md`.

### Einordnung

- **Wiederverwenden:** `DataTable` (0057) trägt Karte, Sortierung, Pager,
  Aufklapper und die fünf Zustände; `bankTransactionColumns()` (0101) trägt
  die acht Punkte; `FilterBar` (0003) bleibt bei der **Seite**.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — das Profil führt die Liste,
  und was fehlt, ist nicht die Tabelle, sondern **wer den Spaltensatz, den
  Leerfall und die Breite dieses Auszugs kennt**.
- **Zuschnitt:** eine Datei, ein Export, 129 Zeilen. Die Liste wählt, übersetzt
  und reicht durch; sie rechnet nichts.
- **Setzt auf:** `DataTable`, `bankTransactionColumns`.

### Die eine Entscheidung: der Saldo steht unter der Liste

Offene Frage 3 des Profils, entschieden wie im Seitenprofil begründet: **ein
laufender Saldo je Zeile stimmt nur bei genau einer Sortierung und keinem
Filter** — und diese Liste ist beides, sortierbar und filterbar. Eine Zahl,
die nach jedem Filterklick etwas anderes bedeutet, ist schlechter als keine.
Der Saldo gehört deshalb in Zone 6, unter die Liste, und kommt als `footer`
vom Aufrufer. Solange die Zahlen fehlen (Befund L-58), steht dort eine
**benannte Lücke**, kein leerer Platz (Story `WithFooter`).

Zwei Punkte, die das Seitenprofil zusätzlich entschieden hat und die hier
eingebaut sind:

- Der **Vertagungsgrund entfällt.** Die Spec wartete auf ein Seitenprofil;
  seit `docs/seiten/kontoauszug.md` steht, sind Kopfzeile, Zeitraum, Saldo und
  die beiden Leerfälle nicht mehr geraten.
- **Leer ist hier weder Erfolg noch Lücke.** Ein Konto, auf dem im Zeitraum
  kein Geld bewegt wurde, ist nicht fertig und nicht kaputt — der Satz trägt
  deshalb **keinen Haken**. Nur „leer nach Filter" bekommt seinen eigenen Satz
  mit Weg zurück.

### Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `transactions` | `BankTransactionRowData[]` | ja | Die Zeilen **dieser Seite**, fertig sortiert und gefiltert | `Filled` |
| `caseHref` | `(caseId) => string` | ja | Wohin ein Sachverhalt führt | `Filled` |
| `openHref` | `string` | nein | Wohin „offen" führt — die Zuordnung | `Filled` |
| `expand` | `(t) => ReactNode` | nein | Was unter einer aufgeklappten Zeile steht: die Aufteilung mit Teilbeträgen | `Expanded` |
| `columns` | `BankTransactionColumn[]` | nein | Wählt aus dem Katalog; ordnet nicht um | (0086 `WithMatchStage`) |
| `listHref` | `(patch: ListPatch) => string` | nein | Sortierung und Blättern über die URL | `Filled` |
| `sort`, `pager`, `loading`, `error` | wie `DataTable` | nein | Durchgereicht | `Filled`, `LoadingAndError` |
| `filtered` | `{ summary, resetHref }` | nein | Der Leerfall nach Filter | `EmptyAfterFilter` |
| `head` | `{ title, sub?, actions? }` | ja | Kopf der Karte: Bank, Konto, Zeitraum | alle |
| `footer` | `ReactNode` | nein | Zone 6 — **der Saldo, und nur hier** | `WithFooter` |
| `rowHref` | `(t) => string` | nein | Der Weg in den Drawer einer Zahlung (0103) — das Seitenprofil nennt das Nachschlagen **oft**. Der Link sitzt auf der **Gegenpartei**, nicht auf der ersten Zelle. Schließt `expand` aus — das ist die Regel **dieser Liste**, nicht die von `DataTable` | `RowLink` |
| `density` | `TableDensity` | nein | Durchgereicht | — (Prop von `DataTable`, hier nur weitergegeben) |
| `minWidth` | `number` | nein | Voreinstellung **1400**, gemessen (siehe unten) | `Filled` bei 1280 px |

**Kann bewusst nicht:**

- **Zuordnen.** Sie zeigt, wohin „offen" führt; die Zuordnung ist die
  Arbeitsliste (0086) oder der Drawer (0103).
- **Den Saldo rechnen.** Sie stellt ihn nur dorthin, wo er stimmt.
- **Filtern oder suchen.** `FilterBar` steht über der Karte, bei der Seite.
- **Nach Konto gruppieren.** Ein Auszug ist ein Konto — das Gruppieren ist die
  Arbeitsliste.

### Stories

Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionList`. Abgeleitet nach
§6: 5 anwendbare Zustände (Laden und Fehler in **einer** Story
nebeneinander = 4 Stories) + 1 Callback (`expand`) + 1 Layout (`footer`) +
1 Weg ins Detail (`rowHref`, schließt `expand` aus und braucht deshalb eine
eigene) + 1 „im Einsatz" + 1 Rand = **9**.

| Story | Beweist |
|---|---|
| `Filled` | Acht Spalten, Sortierung am Kopf, Pager, „offen" als Wort mit Weg |
| `RowLink` | Der Weg in den Drawer — die Zeile als Link, ohne verschachtelten Anker |
| `Expanded` | Die Aufteilung unter der Zeile — der Aufrufer sagt, was drinsteht |
| `Empty` | Konto ohne Bewegung: eine **Feststellung**, kein Haken |
| `EmptyAfterFilter` | „Keine Treffer" mit Weg zurück |
| `LoadingAndError` | Kopf bleibt stehen; der Fehler nennt Ursache und nächsten Schritt |
| `WithFooter` | Der Saldo unter der Liste — heute als benannte Lücke (L-58) |
| `Extremes` | Die **breitesten** Werte jeder Spalte; daran sind die festen Spuren gemessen |
| `InUse` | `PageHeader` und `FilterBar` über der Karte — die ganze Seite |

### Abnahmekriterien

Fest: typecheck · build · Datei nach der Familie · Code englisch mit
`@when`/`@instead` · kein Hex, keine lokale Label-Map · alle Stories · §9 · im
Browser angesehen.

Variabel:

- [ ] Kopf und Zeilen enden bei 1280/1440/1680/1920 px an derselben Kante (gemessen)
- [ ] **Keine** Zelle läuft über ihre Spur — auch nicht mit dem längsten Wort jeder Achse (Story `Extremes`, gemessen)
- [ ] Unter 1400 px rollt die Tabelle waagerecht, statt eine Spalte abzuschneiden (gemessen bei 1280 px)
- [ ] Der Saldo erscheint **nur** über `footer`, nie in einer Zeile (`grep`: keine Saldo-Spalte im Katalog)
- [ ] Der Leerfall des Kontos trägt **keinen** Haken, der Filterfall einen Weg zurück (Stories `Empty`, `EmptyAfterFilter`)
- [ ] `expand` entscheidet der Aufrufer; ohne ihn hat die Zeile keinen Aufklapper (Stories `Filled` gegen `Expanded`)
- [ ] Die Zeile hat einen Weg ins Detail, er sitzt auf der Gegenpartei und erzeugt keine verschachtelten Anker (Story `RowLink`, gemessen: 5 Zeilenlinks auf Spalte 1, 0 `a a`)
- [ ] Die Fehlerzeile trägt einen Weg zurück, nicht nur einen Satz (Story `LoadingAndError`, gemessen: ein Knopf)
- [ ] Keine Konsolenmeldung in allen neun Stories (gemessen)
- [ ] offen (App): ersetzt `KontoauszugView.tsx` (631 Z.)

### Beim Bauen gemessen

**Zwei feste Spuren waren schmaler als ihr breitester Wert.** Die Achse
`bank_match_stage` trägt „außerhalb des Bestands" — 169 px in einer 160-px-Spur,
der Text lief 9 px in die Rinne. Die Achse `ereignis` trägt „Keine Buchung
nötig" — mit der vorangestellten Fallnummer 187 px in einer 140-px-Spur. Beide
Werte sind **gemessen**, nicht geschätzt; die Spuren stehen jetzt auf 180 px
und 160 px. `max-content` schied aus: Kopf und Zeile sind getrennte Raster,
und jede aus dem Inhalt gerechnete Spur löst sich dort verschieden auf (0106).

**Die Fallnummer steht jetzt über dem Badge, nicht daneben.** Nebeneinander
hätte die Spur 187 px gebraucht — und diese Breite hätte **jede** Zeile
bezahlt, obwohl die Mehrfach-Zuordnung 4 % sind. Gestapelt kostet sie nur
diese 4 % eine Zeile, und die sind ohnehin die höchsten.

**`minWidth` deckt die Rechnung:** sieben feste Spuren = 1060 px, sieben
Rinnen à 10, zweimal 18 px Kartenpolster = **1166 px**. Bei der alten
Voreinstellung (1250) blieben dem Verwendungszweck **84 px**, und der Kopf
„Verwendungszweck“ (123 px) stand **39 px** außerhalb seiner eigenen Zelle.
Jetzt 1400, damit 234 px für den Zweck; darunter rollt `DataTable` waagerecht.

*(Der erste Wortlaut rechnete mit „zweimal 35 Polster" und kam auf 50 px. Beim
Bauen nachgemessen: das Polster ist `12px 18px`. Der Schluss stimmte, die Zahl
nicht — und dieselbe falsche 70 stand in `sourceDocumentMinWidth()` aus 0070,
wo sie mitkorrigiert ist. **Berichtigt am 2026-09-07:** hier stand
„die Abnahme hat nachgemessen", 0085 hatte zu dem Zeitpunkt aber noch keine —
die Zahl ist richtig, die Herkunft war es nicht.)*

**Ein Kästchen ohne Wirkung.** Der Kopf der Auswahlspalte war im Leerfall
klickbar und wählte nichts. Behoben in `SelectAllCell` (0057) — es gilt für
jede Liste mit Auswahl, nicht nur für 0086.

## Abnahme

Gemessen am laufenden Dev-Storybook (6107), das die Quelle serviert — nicht am
gebauten Verzeichnis: hier prüfen mehrere Sitzungen parallel im selben Baum,
und ein Bau leert `storybook-static/` unter den anderen weg (0117). Die 404er,
die während der Messung in der Konsole standen, kamen von einem fremden Bau,
nicht von dieser Aufgabe.

**Jeder Messwert ist gegen eine Änderung geprüft** — ein zurückgelesener Wert
zählt hier nicht: die Spur `Buchung` wurde zur Laufzeit auf 60 px gesetzt, das
`--v2-min` der Tabelle auf 600 px, die Zeilenlinks entfernt, die Beschriftungen
der beiden Achsen einzeln in den lebenden Badge geschrieben, ein langer
Sachverhalts-Titel in die Zelle gesetzt. Jedes Mal lief die Messung mit.

**Layout zusätzlich in der Breite gemessen, die der Baustein auf der Seite
hat**, nicht nur im Story-Rahmen (1460 px): die Route liegt in `AppShell` —
240 px Schiene und zweimal 32 px Polster in `.app__main` —, die Karte hat bei
1280 px also rund 976 px. Gemessen wurde bei 868 · 968 · 1068 · 1248 px, also
bis unter diese Breite.

**Story-Deckung: vollständig gegenüber der Story-Tabelle.** Neun Stories, neun
gebaut (`Filled`, `RowLink`, `Expanded`, `Empty`, `EmptyAfterFilter`,
`LoadingAndError`, `WithFooter`, `Extremes`, `InUse`), Export-Namen englisch,
Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionList`. Die Zahl deckt
sich mit der Ableitung nach `spec-schreiben` §6 (4 Zustands-Stories + `expand`
+ `footer` + `rowHref` + im Einsatz + Rand = 9, Obergrenze 10). Jede Prop hat
ihren Nachweis: `columns` über 0086 `WithMatchStage` (nachgesehen — der
Aufrufer übergibt dort einen verwürfelten Satz, die Kopfzeile bleibt in
Katalog-Reihenfolge), `density` bewusst ohne eigene Story, weil die Spec sie
als reine Durchreichung von `DataTable` führt. Kein Zustand ausgeschlossen,
also nichts zu begründen.

| Kriterium | Nachweis (Story-ID · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` grün | beide Exit 0 (`tsc --noEmit`; `storybook build` „completed successfully"). Zusätzlich `pnpm check:icons` und `pnpm check:contrast` — beide „in Ordnung" | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `entities/bank-transaction/BankTransactionList.tsx` (129 Zeilen, **ein** Export — wie im Zuschnitt) + `.stories.tsx`; Titel `v3/Entitäten/Kontoauszugsposition/BankTransactionList`; im Barrel `src/ui/v3/index.ts:411` | ✓ |
| Code englisch; `@when`/`@instead` am Export | Prop-Namen, Typen, Kommentare und JSDoc englisch; `@when` „The statement of one payment account: sorted, filtered, paged.", `@instead` verweist auf `BankTransactionWorklist` und `BankTransactionRow`. Deutsch nur in den zwei sichtbaren Leertext-Zeilen — die Story-Beschreibungen sind deutsch wie überall im Set (`CaseList`, `SourceDocumentList`, `DataTable`) | ✓ |
| Kein Hex, kein px, keine lokale Label-Map | 0 Treffer für Hex und für `px`/`fontSize` in beiden Dateien; `minWidth` ist eine Zahl an der Prop von `Table` (0057), wie `sourceDocumentMinWidth` in 0070. Zustände ausschließlich über `StatusBadge` mit den Registry-Achsen `bank_match_stage` und `ereignis` | ✓ |
| Alle Stories vorhanden, Ausschlüsse begründet | 9/9, keine Ausschlüsse | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Kontrast zur Laufzeit nachgerechnet: Spaltenkopf 4,88 · Zeilentext 13,77 · `Rest`/`Klärung`/gedämpfte Gegenpartei 6,69 · Fallnummer über dem Badge 4,88 · „offen" 6,17 · Fuß 4,71 — alle ≥ 4,5:1. Zahlen rechts mit `v2num` (Betrag `align: "end"`), Text links, nichts zentriert. Fünf Zustände, drei Leertexte. Fokusring 2 px an jeder Station. Zeile mit Detail ganz klickbar (unten gemessen). Baustein mit innerem Scrollen als Raster-Kind geprüft (unten) | ✓ |
| Im Browser angesehen | alle neun Stories bei 1280 und 1440 px geöffnet und vermessen, `Extremes` und `InUse` zusätzlich als Bild angesehen | ✓ |
| Kopf und Zeilen enden bei 1280/1440/1680/1920 px an derselben Kante | `Filled` · rechte Kanten des Kopfes **und aller fünf Zeilen** identisch, auf 0,1 px: 1280 → 135 / 325 / 569 / 779 / 949 / 1139 / 1259 / **1399**; 1440 → … / **1405**; 1680 und 1920 → … / **1457** (der Story-Rahmen deckelt bei 1458). Spuren `100px 180px minmax(0,1fr) 200px 160px 180px 110px 130px` | ✓ |
| **Keine** Zelle läuft über ihre Spur — auch nicht mit dem längsten Wort jeder Achse | `Extremes` und die acht übrigen Stories bei 1280/1440 · clip-bewusste Messung über alle Text- und Elementkästen jeder Zelle: **0 Überläufe**. Schärfer als die Fixtures: **alle zwölf** Beschriftungen von `bank_match_stage` einzeln in den lebenden Badge geschrieben — die breiteste, „außerhalb des Bestands", 151 px Badge + 6 px Abstand + 12 px (i) = **169 px in 180 px** (11 px Luft), danach „über Namensvariante" 136,1. **Alle acht** von `ereignis` — die breiteste, „Keine Buchung nötig", **131,7 px Badge in 160 px**. `Klärung` „999 Klärungen" 87 in 110 · `Betrag` „-12.345.678,90 €" 119,8 in 130 · `Datum` 71,6 in 100. Gegenprobe: Spur `Buchung` zur Laufzeit auf 60 px → Überlauf 89,7 px erscheint | ✓ |
| Unter 1400 px rollt die Tabelle waagerecht, statt eine Spalte abzuschneiden | `Filled` bei 1280 px · `.v2tbl__scroll` `overflow-x: auto`, clientWidth **1246**, scrollWidth **1400**; alle acht Kopfzellen vorhanden, letzte rechte Kante 1399, keine Spur schmaler als bei 1440. Gegenprobe: `--v2-min: 600px` → scrollWidth fällt auf 1246, kein Rollen mehr. **Als Raster-Kind geprüft** (`InUse` setzt die Karte in ein `display: grid`): bei 900 / 1000 / 1100 / 1280 px bleibt `document.scrollWidth == clientWidth`, die Karte misst 868 / 968 / 1068 / 1248 px, die Rollfläche behält 1400 px und alle acht Spuren ihre Breite — der Baustein schützt sich hier auch ohne `min-width: 0` am Kind, weil die Rollfläche selbst keinen Mindestinhalt beiträgt | ✓ |
| Der Saldo erscheint **nur** über `footer`, nie in einer Zeile | Der Katalog `BankTransactionColumn` führt neun Werte, keiner ist ein Saldo (`grep`); in **keiner** der neun Stories enthält eine Zeile das Wort. `WithFooter` · der Satz steht in `.v2card__f` **hinter** der Tabelle (`compareDocumentPosition`), 1246 px breit, und benennt die Lücke: „Saldo zum 31.08.2026: noch nicht verfügbar — die Zahlen stehen am Import-Lauf, nicht an der Zeile (Befund L-58)." | ✓ |
| Der Leerfall des Kontos trägt **keinen** Haken, der Filterfall einen Weg zurück | `Empty` · `.v2tbl__empty` enthält **0** `svg`, Text „Auf diesem Konto ist im Zeitraum nichts gebucht worden." + „Sobald ein Auszug importiert wird, stehen die Zahlungen hier.", keine Aktion. Gegenprobe mit demselben Melder auf `v3/Patterns/Arbeitsfläche/DataTable--empty`: linke Karte 0 `svg`, rechte („Alle 47 Sachverhalte sind gebucht.") **1** — der Melder erkennt Haken, hier ist keiner. `EmptyAfterFilter` · „Keine Treffer für „Miete · nur offene"." plus `Filter zurücksetzen` → `#alle` | ✓ |
| `expand` entscheidet der Aufrufer; ohne ihn hat die Zeile keinen Aufklapper | `Filled` · **0** Chevrons, Kopfzeile 8 Zellen. `Expanded` · **5** Chevrons, Kopfzeile **9** Zellen (die Griffspur kommt dazu). Klick auf ein Chevron: 0 → **1** Detailzeile mit dem Inhalt des Aufrufers („2026-0451 · Sanierung Serverraum 2.000,00 € / zugeordnet 2.000,00 €"), zweiter Klick → 0. Geschlossen zu starten ist die Konvention des Sets (`DataTable--expand` ebenso) | ✓ |
| Der Weg ins Detail sitzt auf der Gegenpartei, ohne verschachtelte Anker | `RowLink` · **5** `.v2rowlink`, alle in Zellindex **1** (Gegenpartei), **0** `a a`. Die Linktexte sind Namen, nie das Datum; die Zeile ohne Gegenpartei trägt „Kontoführungsentgelt August 2026", keinen Strich. Ganze Zeile klickbar: echter Mausklick bei x = 1340 auf die **Betragszelle** → `location.hash` = `#zahlung-bt-5`. Gegenprobe: nach Entfernen der `.v2rowlink` bleibt derselbe Klick wirkungslos (Hash leer). Tab-Lauf: genau **eine** Station je Zeile für das Ziel, Fokusring 2 px; der `summary` im geschlossenen Zweck-Aufklapper ist **nicht** in der Reihenfolge | ✓ |
| Die Fehlerzeile trägt einen Weg zurück, nicht nur einen Satz | `LoadingAndError` · `.v2tbl__error` mit „Der Kontoauszug konnte nicht geladen werden. Der Import-Lauf vom 01.09. ist noch nicht durch." und **einem** Knopf „Erneut laden" (Was · Ursache · Schritt, T5). In beiden Hälften bleiben Kartenkopf und Spaltenkopf stehen (I7); die Lade-Hälfte zeigt 40 Skelett-Felder und „Wird geladen …" | ✓ |
| Keine Konsolenmeldung in allen neun Stories | Über CDP mitgeschnitten (`Runtime.consoleAPICalled`, `Log.entryAdded`, `Runtime.exceptionThrown`): **0** Meldungen jenseits von Vite-HMR und dem React-DevTools-Hinweis, in jeder der neun | ✓ |
| ersetzt `KontoauszugView.tsx` (631 Z.) | betrifft `ludwig/app`, nicht dieses Repo | offen (App) |

**Die Rechnung der Spec ist nachgemessen und stimmt.** Sieben feste Spuren
1060 px + sieben Rinnen à 10 + zweimal 18 px Zeilenpolster = 1166 px; bei
`minWidth` 1400 bleiben dem Zweck **234 px** — genau die 234 px, die bei
1280 px gemessen in der Spur stehen. Die berichtigte 36 (statt 70) ist damit
bestätigt, in dieser Spec wie in `sourceDocumentMinWidth()` aus 0070. Ebenso
bestätigt: die Fallnummer steht über dem Badge (`.v2btxrow__state` ist ein
Grid mit `justify-items: start`), und `SelectAllCell` ist im Leerfall
`disabled`.

### Befunde — drei, keiner blockiert

1. **`rowHref` und `expand` schließen sich nur zur Laufzeit aus, nicht im Typ.**
   `BankTransactionList.tsx:101` lässt `rowHref` still fallen, sobald `expand`
   gesetzt ist; die Schnittstelle nimmt beide Props unabhängig entgegen.
   `DataTable` verbietet dieselbe Kombination im Typ (`DataTableProps` als
   Vereinigung). Ein Aufrufer, der beides übergibt, bekommt hier eine stumme
   Zeile und keinen Hinweis. **Messung:** `Expanded` (mit `expand`) hat 0
   `.v2rowlink`, `RowLink` hat 5. Das Verhalten der Spec ist eingehalten —
   es fehlt nur die Warnung. **Vorschlag:** dieselbe Vereinigung wie in 0057,
   damit die Regel dieser Liste beim Bauen auffällt statt beim Ansehen.

2. **`Extremes` trägt für den Verwendungszweck nicht den breitesten Wert.**
   Der Story-Text nennt „ein Zweck ohne Leerzeichen" als eine der breitesten
   Achsen; gerendert steht dort aber „Leasingrate Fuhrpark" mit **125,9 px** —
   der **schmalste** Zweck aller neun Stories. Die lange Kette
   `EREF+VERTRAGSNUMMER-…` landet als Referenz im Aufklapper, nicht in der
   Zelle. Der breiteste Zweck steht in `Filled` („Sanierung Serverraum,
   Teilrechnung 2 von 3", 264 px gebraucht, 208 gezeigt = **79 %** bei
   1280 px; in `Expanded` mit der Griffspur nur noch 63 %). **Für das
   Kriterium ohne Folgen** — die Spur ist `minmax(0, 1fr)` mit Ellipse und
   kann nicht überlaufen, und die festen Spuren sind oben gegen den ganzen
   Wertebereich beider Achsen gemessen, nicht gegen die Fixtures.
   **Vorschlag:** in `Extremes` einen langen **SVWZ**-Teil setzen — das ist
   der Teil, der in der Zelle landet — oder den Story-Text auf das
   zurücknehmen, was die Zeile wirklich beweist.

3. **Eine Herkunftsangabe stimmt nicht.** „Beim Bauen gemessen" schreibt die
   Berichtigung des Polsters (70 → 36) „der Abnahme" zu, und der Kommentar in
   `src/ui/v3/entities/source-document/source-document-columns.tsx:479` sagt
   „Measured in the acceptance of 0085" — 0085 hatte vor dieser hier **keine**
   Abnahme. Die Zahl ist richtig (nachgerechnet: 1400 = 1060 + 234 + 7 × 10 +
   36), nur die Zuschreibung nicht. **Vorschlag:** „beim Bau von 0085
   nachgemessen".

### Befunde am Set (nicht an dieser Aufgabe)

- **S1 · Die Gegenpartei bricht um, statt zu kürzen** (`bank-transaction-columns.tsx`,
  0101). „Musterbau Generalunternehmung Süddeutschland GmbH & Co. KG" füllt in
  der 180-px-Spur **vier Zeilen** (Zelle 84 px hoch, Zeile 108 px); die
  Nachbarspalten Zweck und Sachverhalt kürzen dagegen mit Ellipse. In `Filled`
  wächst schon die Ersatz-Gegenpartei „Kontoführungsentgelt August 2026" auf
  zwei Zeilen — `purposeLead` schneidet bei 34 Zeichen, was breiter ist als
  die Spur. Zeilenhöhen im Auszug: 48 bis 142 px.
- **S2 · Fehlt die Gegenpartei, steht derselbe Text zweimal nebeneinander**
  (0101). Die Ersatz-Gegenpartei ist der Anfang des Zwecks — in Spalte 2 und
  Spalte 3 also dasselbe Wort. Betrifft die 3 % ohne Namen; im Bild deutlich
  sichtbar. Beabsichtigt und im Code begründet, aber einen zweiten Blick wert.
- **S3 · „offen" liest sich als leeres Eingabefeld** (`CaseCell`, 0095). Der
  Weg zur Zuordnung füllt als graue Pille die ganze 200-px-Spur und sieht
  damit aus wie ein gesperrtes Feld, nicht wie ein Link — und das ist Rang 3,
  die Kernfrage der Seite. Kontrast 6,17:1, also kein Lesbarkeitsproblem,
  sondern eines der Form.

Abgenommen von / am: Claude (fremde Abnahme, nicht der Bauende), 2026-09-07 ·
Offene Punkte: Befunde 1–3 oben, keiner blockierend; das Kriterium „ersetzt
`KontoauszugView.tsx`" bleibt **offen (App)**.
