# 0230 · Checklist: Zeilen klappen ihren Inhalt unter sich auf

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` (`Review.tsx`, Familie Prüfen) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, eine Prüfliste, deren Zeilen ihre offenen Posten zeigen, ist fachfrei |
| Quelle | Auftrag llcto 2026-10-27, Owner-Wunsch zum Schritt „Übergeben“: „hier bitte collapsable list und nicht unten anzeigen … damit man jede Zeile aufklappen kann“ |
| Ersetzt | in der App `CloseHandover.tsx`: die Karte mit den Posten der gewählten Zeile **unter** der ganzen Liste, gebaut mit `style={{ … fontSize: 13.5 }}` und `fontSize: 13` |
| Blockiert | den nächsten Zeigerhub der App (ll-abnahme verdrahtet) |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Auf der Übergeben-Seite sieht die Sachbearbeiterin, was vor der Übergabe noch
offen ist: ein Fehler, zwei Warnungen, ein Hinweis, „7 von 12 Prüfungen in
Ordnung“. Heute klickt sie eine Zeile an, und deren Posten erscheinen als eigene
Karte unter der ganzen Liste. Das Auge muss vom Klick weg nach unten, und es
ist immer nur eine Zeile offen. Künftig klappt jede Zeile ihre Posten direkt
unter sich auf. Mehrere Zeilen können gleichzeitig offen sein.

## Einordnung

- **Wiederverwenden:** `Checklist` (`@when` Checklist of a gate) trägt den Fall.
  Für die aufklappbare Zeile gibt es `ExpandableRow` (`@when` A small extra
  detail for a row that is read and collapsed again). Das ist dieselbe Form wie
  jede andere aufklappbare Tabellenzeile im Set: Chevron vorn, die Zeile ist der
  Schalter, `aria-expanded`, Inhalt in einer Zelle über alle Spalten.
- **Kein natives `<details>`:** `Checklist` ist eine echte `<table>` (0106), und
  ein `<details>` kann keine Tabellenzeile überspannen. `ExpandableRow` ist eine
  Client-Insel. `Review.tsx` bleibt ohne `"use client"` und `Checklist` damit
  server-tauglich.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2. Eine Prop am Zeilentyp
  (`ChecklistRow.detail`), dazu ein Inhaltsbaustein `ChecklistItems` in derselben
  Familie. Ohne ihn baut jeder Aufrufer die Postenliste selbst, die App heute mit
  Inline-Pixeln (`fontSize: 13.5`, `13`). Mit ihm sieht der Inhalt überall gleich
  aus. Der Slot bleibt `ReactNode`, damit ein anderer Inhalt möglich ist.
- **Zweite Verwendung von `ChecklistItems`:** `Step8.tsx` (Befunde) baut in der
  App dieselbe Postenliste ein zweites Mal. Das ist der zweite Aufrufer nach §3.
- **Zuschnitt:** Familie in `Review.tsx`. `ChecklistItems` ergibt nur in einer
  aufgeklappten Zeile Sinn.

## Schnittstelle

Neu an `ChecklistRow`:

| Feld | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `detail` | `ReactNode` | nein | was die Zeile aufgeklappt unter sich zeigt; mit Inhalt trägt die Zeile einen Chevron und ist der Schalter (`ExpandableRow`), ohne Inhalt klappt sie nicht | `Expandable` |

Neu, `ChecklistItems`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `items` | `readonly ChecklistItem[]` | ja | die Posten: `text`, optional `href` (dann ein Link) und `note` (eine graue Zeile darunter) | `Expandable` |
| `more` | `number` | nein | wie viele Posten nicht gezeigt sind: „… und n weitere im Schritt“ | `Expandable` |
| `actions` | `ReactNode` | nein | Knöpfe unter den Posten („Zurück an Ludwig“, „Zu Belege“) | `Expandable` |

Ohne Posten sagt `ChecklistItems`: „Die Einzelheiten stehen im Schritt.“ Der Satz
nennt den Ort statt „keine Einträge“. Die App sagte „Die Posten …“, aber
„Posten“ bleibt dem offenen Posten vorbehalten (GLOSSARY, llcto für den Owner,
2026-10-27).

Spaltenordnung mit aufklappbaren Zeilen: Chevron · Icon · Prüfung · Stand ·
(Fortschritt) · letzte Spalte. Die Chevron-Spalte (`var(--v2-tbl-pick)`, wie bei
`DataTable`) steht nur da, wenn mindestens eine Zeile `detail` trägt. Eine Zeile
ohne `detail` hat dort eine leere Zelle, damit die Spalten fluchten.

Was die Komponente **nicht** kann (bewusst):
- `onPick` und `activeKey` für eine Zeile mit `detail`. Ihr Klick klappt auf,
  er wählt nicht aus. Der Aufrufer nutzt entweder Aufklappen oder
  Master-Detail, nicht beides in einer Zeile. In einer gemischten Tabelle
  wählen die Zeilen ohne `detail` weiter aus: Ihr Knopf liegt in der Icon-Zelle,
  die leere Chevron-Zelle steht davor und außerhalb.
- Die Chevron-Spur, solange noch keine Zeile da ist: Sie hängt an den Zeilen.
  Wer mit `rows=[]` lädt und danach Zeilen mit `detail` bekommt, sieht
  „Prüfung“ um die Spur (32 px) und eine Fuge (10 px) wandern. Wer das vermeiden
  will, gibt die Zeilen schon beim Laden mit (`ExpandableLoading`).
- Eine von außen gesteuerte offene Zeile (`open`/`defaultOpen`). Ausbau, wenn
  eine Seite Zeilen offen starten will.

## Verhalten

- Ein Klick auf die Zeile klappt auf und zu. Tab erreicht den Schalter der
  Zeile, Enter und Leertaste schalten, `aria-expanded` sagt den Zustand. So
  verhält sich `ExpandableRow`.
- Mehrere Zeilen dürfen gleichzeitig offen sein, jede hat ihren eigenen Zustand.
- Zustandssymbol, Prüfung, Stand und „Weiter zu“ bleiben in der Zeile.
- Links und Knöpfe im aufgeklappten Inhalt sind eigene Ziele und schalten die
  Zeile nicht.
- Ladezustand: mit Chevron-Spalte genauso viele leere Vorderspalten
  (`TableLoading leadingCols`). Leer, leer nach Filter und Fehler gibt es für
  `Checklist` nicht (0228: die Liste der Prüfungen ist fest).

## Stories

Zwei neue Stories: `Expandable`, weil die Ableitung nach §6 nur ein Feld mit Inhalt ergibt, und `ExpandableLoading` für den Ladezustand mit Chevron-Spur (M3). `Expandable`
ist zugleich die Story „im Einsatz“, mit den Zeilen der Übergeben-Seite, `without`
und `jumpHeader` wie in der App.

| Story | Beweist |
|---|---|
| `ExpandableLoading` | dieselben Zeilen, während die Prüfungen laufen: Chevron-Spur in den Ladezeilen, die Spalten stehen still |
| `Expandable` | die Zeilen der Übergeben-Seite: Fehler „Nichts übernommen“ (Posten mit Link und Notiz, „… und 39 weitere im Schritt“, Knopf „Zurück an Ludwig“), Warnungen „1 Beleg ohne Entscheidung“ (Knopf „Zu Belege“) und „1 Rückfrage offen“, Hinweis „1 Buchung wartet auf eine Rückfrage oder den Mandanten“ (aufklappbar, ohne Posten: „Die Einzelheiten stehen im Schritt.“), „7 von 12 Prüfungen in Ordnung“ mit den 5 offenen. Dazu eine erledigte Zeile **ohne** `detail` („Fragen an den Mandanten verschickt“): kein Chevron, klappt nicht |

Die bisherigen Stories ohne `detail` sind unverändert: keine Chevron-Spalte.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zeilen offen starten, etwa die Fehler | `ChecklistRow.defaultOpen` | die Seite will den Fehler ohne Klick zeigen |
| der Name des Schalters nennt die Zeile („1 Beleg ohne Entscheidung aufklappen“) statt „Zeile aufklappen“ | `ExpandableRow.label` — ein Systementscheid für jede aufklappbare Zeile des Sets, nicht nur hier | eine Abnahme mit Screenreader zeigt, dass „Zeile aufklappen“ allein nicht reicht |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Eine Zeile mit `detail` hat einen Chevron, ist als ganze Zeile der Schalter, trägt `aria-expanded` und klappt ihren Inhalt **direkt unter sich** auf (`Expandable`)
- [ ] Zwei Zeilen gleichzeitig offen; zuklappen schließt nur die eigene (`Expandable`)
- [ ] Eine Zeile ohne `detail` hat keinen Chevron, klappt nicht und fluchtet mit den anderen (Spaltenkanten gleich) (`Expandable`, „Fragen an den Mandanten verschickt“)
- [ ] Ohne `detail` in allen Zeilen gibt es keine Chevron-Spalte; `Filled`, `NotCounted`, `Loading`, `WithoutProgress` sind unverändert gegenüber HEAD
- [ ] Tastatur: Tab auf den Schalter, Enter und Leertaste klappen; Fokusring sichtbar; ein Link im Inhalt öffnet sich, ohne die Zeile zu schalten (`Expandable`)
- [ ] `ChecklistItems`: Posten mit Link und mit Notiz, „… und n weitere im Schritt“, Knöpfe darunter, ohne Posten „Die Einzelheiten stehen im Schritt.“; Schrift nur aus der Skala, kein px in der TSX (`Expandable`)
- [ ] Der aufgeklappte Inhalt beginnt an der Spalte „Prüfung“ (linke Kante Inhalt = linke Kante Label, ± 1 px), bei 1280 und 1440 px (`Expandable`)
- [ ] `Review.tsx` bleibt ohne `"use client"`
- [ ] Ausschluss: Eine Zeile mit `detail` ruft `onPick` nicht auf, auch wenn der Aufrufer es setzt. In einer gemischten Tabelle mit `onPick` liegt der Knopf der Zeilen ohne `detail` in der Icon-Zelle, hat eine Fläche > 0 und einen sichtbaren Fokusring (zur Laufzeit gemessen, gemischte Zeilen mit `onPick`)
- [ ] Ladezustand mit Chevron-Spur: `ExpandableLoading` hat dieselben Spaltenkanten wie `Expandable` (Kopf und Ladezeilen)
- [ ] Ersatz: `ChecklistItems` nimmt die Posten der App unverändert (`ChecklistItem` aus `src/ludwig/modules/batch-review/domain/checklist.ts`, `href`/`note` als `string | null`), `tsc` ohne Fehler; die Karte unter der Liste in `CloseHandover.tsx` lässt sich ohne Funktionsverlust durch `detail` ersetzen (Posten, Link, Notiz, „… und n weitere“, „Zurück an Ludwig“, „Zu …“)

### Messung des Bauenden (keine Abnahme)

`scripts/cdp.mjs`, Storybook :6107, `Expandable` bei 1280 und 1440 px: Alle
sechs Zeilen haben 5 Zellen (Chevron-Spur, Icon, Prüfung, Stand, Weiter zu). Die
Beschriftung beginnt bei x = 107. Fünf Zeilen tragen `aria-expanded="false"`,
die Zeile ohne `detail` hat keinen Schalter. Nach Klick auf die Zeilen 1, 2 und
6 sind alle drei offen (`true, true, false, false, true`). Jeder Inhalt steht
ohne Lücke direkt unter seiner Zeile, und seine linke Kante liegt bei 107 = Kante
der Beschriftung. Schrift im Inhalt: 13,5/400 (Posten), 11,5/400 (Notiz, „…
weitere“), 13,5/500 (Knopf). Kein Querscroll.

## Abnahme

Schlanke Abnahme (Schnittstelle) gegen HEAD `9ce3770` plus den uncommitteten Diff an
`patterns/Review.tsx`, `patterns/Review.stories.tsx`, `index.ts` und `v3.css`, dazu die
Messung der variablen Kriterien. Gemessen mit `scripts/cdp.mjs` (ein Messbrowser, ein
Skript) gegen Storybook 6107, per `getBoundingClientRect`, bei 1280 und 1440 px.
Story-IDs mit dem Präfix `v3-patterns-prüfen-checklist--`. Für den Vergleich mit HEAD
ein HEAD-Abzug (`git archive HEAD`) außerhalb des Repos, als Storybook gebaut und statisch
ausgeliefert, daneben der Build des Arbeitsbaums.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` ist `storybook build` (`package.json`), deshalb in den Scratchpad gebaut (`node_modules/.bin/storybook build -o …/sb-check-0230`): „Storybook build completed successfully“, Exit 0. Das `index.json` des Builds führt `expandable` | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `ChecklistRow.detail` und `ChecklistItems` in `patterns/Review.tsx` (Familie Prüfen), Story `Expandable` in `Review.stories.tsx:132`, Titel `v3/Patterns/Prüfen/Checklist`, Barrel `index.ts:279, 284` in der Gruppe Prüfen | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0, `pnpm check:when` Exit 0, beide `--test` Exit 0. `ChecklistItems` trägt `@when`/`@instead` (Review.tsx:288–289), `type ChecklistItem` wie die übrigen exportierten Typen der Datei ohne. Deutsch steht nur in Strings, die Nutzer sehen. Der Nachbar, auf den `@instead` zeigt, verweist nicht zurück → M4 | ✓ (M4) |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Der Diff enthält kein Hex. In der TSX kommt kein px-Wert hinzu: `cols` bekommt nur `var(--v2-tbl-pick)` (Review.tsx:158), `20px … 150px` ist der alte Wortlaut. px steht nur in `v3.css:1608`. Es gibt keine Label-Map, der Zustand läuft über `StateIcon` | ✓ (H3) |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `expandable` läuft im Dev-Server und im Build, mit allen Zeilen der Story-Tabelle: Fehler mit Link, Notiz, „… und 39 weitere im Schritt“ und Knopf, zwei Warnungen, Hinweis ohne Posten, „7 von 12“ mit fünf offenen, „Fragen an den Mandanten verschickt“ ohne `detail`. Deckung: `detail`, `items`, `more`, `actions` und der Leersatz in `Expandable`. Leer, leer nach Filter und Fehler sind begründet ausgeschlossen (Z. 81–83, 0228). Den Ladezustand mit Chevron-Spur zeigt keine Story → M3, H2 | ✓ (M3) |
| Prüfliste `design-guidelines.md` §9 durchgegangen | **Stufe** ✓. **Hex, px** ✓, siehe oben. **Text links, Zahlen rechts** ✓, „Stand“ bleibt `v2num`. **Zeilenhöhe** ✓, 45,9 px wie jede `.v2tbl__row`. **Farbe mit Wort** ✓, `StateIcon`, Rot nur am Fehlerzähler. **Fünf Zustände** ✓, siehe oben. **Kontrast** ✓, gemessen auf `bg-soft` des Inhalts: Posten 12,71:1, Link 5,03:1, Notiz und „… weitere“ 4,51:1, Leersatz 4,51:1, Knopf 10,75:1. Fokusring 2 px mit 3,55:1 auf Weiß. **Hover** ✓: die aufklappbare Zeile wird `bg-soft` mit `cursor: pointer`, die Zeile ohne `detail` reagiert nicht. **Ganze Zeile klickbar** ✓: 7 von 7 Treffpunkten liegen auf dem Schalter. **Trefferfläche** ✓, die Zeile misst 1246 × 45,9 px über `::after`. **Schrift** ✓. **Karte** ✓, `v2card`. **Querlauf** ✓, keiner. **Texte** ✓, „Zurück an Ludwig“ steht im GLOSSARY. **Fokus und Name des Zeilenknopfs in einer gemischten Tabelle** ✗ → M1 | ✗ (M1) |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 17 Stories der Datei im Messbrowser: jede rendert Inhalt in `#storybook-root`. In der Konsole steht keine `warning`, kein `error` und keine Ausnahme. Es erscheinen nur `[vite] connecting…`/`connected.` und der React-DevTools-Hinweis des Dev-Servers, in allen Stories gleich. Die statischen Builds (HEAD und Arbeitsbaum) schreiben in den sieben Vergleichs-Stories nichts. Bildschirmfoto von `expandable` mit fünf offenen Zeilen bei 1280 und 1440 px angesehen: gestylt, der Inhalt fluchtet mit „Prüfung“ | ✓ |
| Zeile mit `detail`: Chevron, ganze Zeile ist der Schalter, `aria-expanded`, Inhalt **direkt unter sich** (`Expandable`) | `expandable` bei 1280 und 1440: Jede Zeile mit `detail` trägt `td.v2tbl__chev` mit `button[aria-expanded="false"]`. Der Treffertest an 7 Punkten der Zeile „Nichts übernommen“ (Rand links, jede Zelle, Rand rechts) trifft 7-mal den Schalter. Nach dem Klick steht `true`, die Inhaltszeile ist das nächste `tr`, `aria-controls` gleich ihrer `id`, und ihre Oberkante liegt auf der Unterkante der Zeile (101,3 = 101,3 · 346 = 346 · 642,8 = 642,8) | ✓ |
| Zwei Zeilen gleichzeitig offen; zuklappen schließt nur die eigene (`Expandable`) | Klick auf 1, 2, 6 ergibt `true, true, false, false, –, true`. Ein zweiter Klick auf 2 ergibt `true, false, false, false, –, true`: der Inhalt von 2 ist weg, 1 und 6 bleiben offen | ✓ |
| Zeile ohne `detail`: kein Chevron, klappt nicht, fluchtet (`Expandable`, „Fragen an den Mandanten verschickt“) | 5 Zellen, die erste leer. Kein Schalter, kein `aria-expanded`, kein Halt für Tab. Ein Klick ändert nichts, Zeilen und Zustände bleiben gleich. Zellkanten 35 · 77 · 107 · 989 · 1095 (1280) und 35 · 77 · 107 · 1149 · 1255 (1440), gleich mit dem Kopf und allen anderen Zeilen | ✓ |
| Ohne `detail` keine Chevron-Spalte; `Filled`, `NotCounted`, `Loading`, `WithoutProgress` unverändert gegenüber HEAD | HEAD-Build gegen Arbeitsbaum-Build und Dev-Server, mit `filled`, `all-passed`, `not-counted`, `loading`, `loading-empty`, `without-progress` und `without-progress-loading` bei 1280 und 1440 (14 Vergleiche). `innerHTML` ist gleich bis auf die Klasse `v2chk` an der Karte, `getBoundingClientRect` jedes Elements ist gleich, der Kopf hat 5 bzw. 4 Zellen wie in HEAD. In `filled` und `without-progress` ist das auch nach dem Klick auf eine Zeile (`activeKey`/`onPick`) gleich | ✓ |
| Tastatur: Tab, Enter, Leertaste, Fokusring, Link im Inhalt (`Expandable`) | Tab hält nur an den fünf Schaltern, die Zeile ohne `detail` wird übersprungen. Fokusring `2px solid` bei `:focus-visible`, 32 × 21 px um den Chevron, 3,55:1. Enter gibt `true`, Leertaste `false` (die Seite scrollt nicht), Enter wieder `true`. Danach führt Tab über die drei Links des Inhalts und „Zurück an Ludwig“ zum Schalter von Zeile 2, in der Reihenfolge der Lesung. Enter auf dem ersten Link setzt `#buchung-1`, die Zeile bleibt `true`. Mit der Maus ebenso: Ein Link setzt den Hash, „Zurück an Ludwig“ und „Zu Belege“ (→ `#belege`) schalten die Zeile nicht | ✓ |
| `ChecklistItems`: Link, Notiz, „… und n weitere“, Knöpfe, Leersatz; Schrift aus der Skala, kein px in der TSX (`Expandable`) | Posten mit Link (`a`, 13,5/400, `--fs-ui`) und mit Notiz (`.v2sub`, 11,5/400, `--fs-ui-xs`). „… und 39 weitere im Schritt“ 11,5/400, darunter der Knopf 13,5/500. Ohne Posten steht „Die Posten stehen im Schritt.“ (`.lw-ui-hint`, 12,5/400). `pnpm check:type` Exit 0, in der TSX des Diffs kein px | ✓ (H4) |
| Inhalt beginnt an der Spalte „Prüfung“, ± 1 px, bei 1280 und 1440 px (`Expandable`) | Die linke Textkante der Beschriftung liegt bei 107, die des Inhalts auch bei 107: Kasten, erster Text und jedes Kind (Posten, „… weitere“, Knopf, Leersatz), in allen fünf offenen Zeilen, bei beiden Breiten. Abweichung 0 px | ✓ (H3) |
| `Review.tsx` bleibt ohne `"use client"` | Zeile 1 ist `import {`, `grep "use client"` findet nichts. `ExpandableRow` bleibt die Client-Insel wie in `DataTable` | ✓ |
| *(Auftrag)* Einordnung gegen Code und Hausregeln | **`ExpandableRow` statt `<details>`** trägt: `Checklist` ist eine `<table>` (0106), eine Inhaltszeile braucht `td[colspan]`, und ein `<details>` kann kein `tr` sein. Dieselbe Form nutzt `DataTable`, ebenfalls ohne `"use client"`. **`ChecklistItems`** trägt: Die App baut die Postenliste heute zweimal mit Inline-Stil, in `CloseHandover.tsx` und in `Step8.tsx` (`Befunde`). Die Spec nennt die zweite nicht → H5. Zum Typ → M2, zum Rückverweis → M4. **`onPick` greift an einer Zeile mit `detail` nicht**: stimmt, `ChecklistLine` kehrt vorher mit `ExpandableRow` zurück (Review.tsx:209). Die Grenze „nicht beides in einer Zeile“ lässt aber gemischte Tabellen zu, und dort bricht der Knopf der Pick-Zeile → M1 | ✗ (M1, M2, M4) |
| *(Auftrag)* Gegencheck App: `CloseHandover.tsx` mit `activeKey`/`onPick`, ohne `detail` | Die App übergibt Zeilen ohne `detail`, dazu `activeKey`, `onPick`, `without={["progress"]}` und `jumpHeader="Weiter zu"`. Auf diesem Pfad ist `expandable` falsch und `cols` wie in HEAD. Der Knopf liegt wie in HEAD um die Icon-Zelle (SSR-Markup), und `filled` und `without-progress` sind vor und nach dem Klick gleich mit HEAD (siehe oben). Einzige Änderung ist die Klasse `v2chk` an der Karte: Ihre Regel greift nur in einer Inhaltszeile, und in der App kommt die Klasse nicht vor. Der Fall bleibt unverändert | ✓ |
| *(Skill, schlanke Abnahme)* Wächter über den Exit-Code, mit `--test` | `typecheck`, `check:when`, `check:language`, `check:type` und `check:contrast` Exit 0. `check:classes` Exit 1 mit 4 Klassen ohne Regel (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`). Alle liegen außerhalb des Diffs, und der HEAD-Abzug meldet dieselben vier. Die neuen Klassen `v2chk`, `v2chk__detail`, `v2chk__items` und `v2chk__acts` haben Regeln. Alle fünf `--test` Exit 0 | ✓ (für 0230) |
| *(Skill, schlanke Abnahme)* Schnittstelle der Spec gegen den Code | `detail?: ReactNode` (Review.tsx:117). `items: readonly ChecklistItem[]` als Pflicht, `more?: number` mit Vorgabe 0, `actions?: ReactNode` (Review.tsx:291–301). `ChecklistItem` mit `text`, `href?`, `note?` (Review.tsx:276). Spec-Tabelle und Code stimmen überein | ✓ |
| *(Skill, schlanke Abnahme)* Typen aus `src/ludwig/`, keine lokale Neudefinition | Das Modell hat `ChecklistItem` schon (`src/ludwig/modules/batch-review/domain/checklist.ts:101`), mit `note` und `href` als `string` oder `null`. Die DS-Form nimmt `null` nicht an, `tsc` meldet TS2322 → M2 | ✗ (M2) |
| *(Spec)* Kriterienliste vollständig nach `spec-schreiben` §7 | Es fehlen Kriterien zum Ausschluss `onPick`/`activeKey`, zum Ersatz in `CloseHandover.tsx` und zum Ladezustand mit Chevron-Spur → M3 | ✗ (M3) |

Abgenommen von / am: fremde Abnahme (schlanke Abnahme plus Messung der Kriterien), 2026-10-27 · Offene Punkte: M1–M4, H1–H5

### Messung der Abnahme

`expandable`, Zellkanten links in px (Kopf und jede Zeile gleich):

| Breite | Chevron · Icon · Prüfung · Stand · Weiter zu | Textkante Beschriftung / Inhalt | Querlauf |
|---|---|---|---|
| 1280 px | 35 · 77 · 107 · 989 · 1095 | 107 / 107 | keiner (Dokument 1280 = 1280, Tabelle 1246 = 1246) |
| 1440 px | 35 · 77 · 107 · 1149 · 1255 | 107 / 107 | keiner (Dokument 1440 = 1440, Tabelle 1406 = 1406) |

Gemischte Tabelle (zu M1): Das SSR-Markup des Arbeitsbaums für
`<Checklist onPick … rows={[{ …, detail }, { … ohne detail }]} />` wurde in die
Story `expandable` gesetzt, damit die echte CSS greift. Der Knopf der Pick-Zeile misst
32 × 0 px, sein Name im Accessibility-Baum ist leer, bei 1280 und 1440 px. In
`filled` heißt derselbe Knopf „erledigt“, die Schalter in `expandable` heißen
„Zeile aufklappen“.

Die Messung des Bauenden stimmt mit diesen Werten überein: 5 Zellen, Kante 107,
`true, true, false, false, true`, Schrift 13,5/400, 11,5/400 und 13,5/500.

## Mängel

- **M1 · Gemischte Tabelle: Der Knopf einer Pick-Zeile hat keinen Namen und keine
  Fläche.** Trägt mindestens eine Zeile `detail`, setzt `ChecklistLine` vor jede
  andere Zeile die leere Platzhalterzelle (Review.tsx:213). `rowCells(body, …)`
  legt den `onPick`-Knopf um die erste Zelle (Review.tsx:223), und das ist jetzt
  dieser Platzhalter. Gemessen: Der Knopf misst 32 × 0 px, sein Name ist leer. Der
  Fokusring ist damit nicht zu sehen, und die Vorlesehilfe hört einen namenlosen
  Knopf (WCAG 2.4.7, 4.1.2). Die Spec lässt den Fall zu („nicht beides in einer
  Zeile“, Z. 66–68), der JSDoc an `detail` auch. Dazu bekäme derselbe Klick in einer
  Tabelle zwei Bedeutungen, Aufklappen und Auswählen. Zu tun: entweder die
  Platzhalterzelle vor den Knopf legen (`<td />` vor
  `rowCells(checklistCells(…), lead)`), oder in einer Tabelle mit `detail`
  `onPick` und `activeKey` ganz abschalten und die Spec auf „je Tabelle“ setzen.
  Im JSDoc an `detail` gehört neben `onPick` auch `activeKey` genannt: `active`
  wird im Zweig mit `ExpandableRow` nicht gelesen.
- **M2 · `ChecklistItem` ist eine zweite Form des Modelltyps.**
  `src/ludwig/modules/batch-review/domain/checklist.ts:101` führt
  `ChecklistItem { text; note; href }`, dort sind `note` und `href` jeweils
  `string` oder `null`. Genau diesen Typ reichen beide Aufrufer der App durch:
  `HandoverLine.items` (`close-handover.ts`) und `ChecklistRow.items` in Step 8. Die
  DS-Form mit `href?: string` und `note?: string` nimmt `null` nicht an. `tsc` meldet
  für `<ChecklistItems items={modelItems} />` den Fehler TS2322 („Type 'string | null'
  is not assignable to type 'string | undefined'“). Jede Aufrufstelle müsste jeden
  Posten umsetzen, und genau das soll die schlanke Abnahme verhindern. Zu tun:
  `href` und `note` optional **und** `null` zulassen, in der Spec-Tabelle und im Code,
  oder den Modelltyp übernehmen.
- **M3 · Spec-Mangel: Kriterien fehlen nach `spec-schreiben` §7.** (a) Zum
  Ausschluss: `onPick`/`activeKey` an einer Zeile mit `detail` (Z. 66–68) hat kein
  Kriterium, und genau dort liegt M1. (b) Zum Ersatz: „ersetzt die Postenkarte in
  `CloseHandover.tsx` ohne Funktionsverlust“ fehlt. (c) Zum Verhalten: Der
  Ladezustand mit Chevron-Spur (Z. 81–82) hat weder Kriterium noch Story und ist
  nur im Code belegt (`leadingCols={1}` ergibt 6 bzw. 5 Zellen auf 6 bzw. 5 Spuren,
  Review.tsx:177). Zu tun: Der Spec-Autor ergänzt die drei Kriterien und für (c) eine
  Story. Die Abnahme ändert die Liste nicht.
- **M4 · Der Nachbarfall hat keinen `@instead`-Verweis.** `ChecklistItems` verweist
  auf `OpenPoints` (Review.tsx:289). `OpenPoints` nennt in seinem `@instead`
  `Checklist`, `TodoList` und `Messages`, aber nicht `ChecklistItems`
  (OpenPoints.tsx:53–57). CLAUDE.md §3 verlangt den Rückverweis. Zu tun: In
  `OpenPoints` eine Zeile ergänzen, etwa „The open items of one check, folded open
  in its row → ChecklistItems“. Wegen der Namensnähe hilft dieselbe Zeile auch an
  `CheckItems`.

**Hinweise**

- **H1 · Fünf Schalter mit demselben Namen.** Alle Schalter heißen „Zeile
  aufklappen“ bzw. „Zeile zuklappen“ (Accessibility-Baum). Wer mit Tab geht, hört
  fünfmal denselben Namen, und die Prüfung steht in einer anderen Zelle. Das kommt
  von `ExpandableRow` und gilt im ganzen Set. Vorschlag als Systementscheid:
  `ExpandableRow` bekommt `label` wie `ClickRow`, etwa „Nichts übernommen
  aufklappen“.
- **H2 · Die Chevron-Spur hängt an den Zeilen.** Lädt eine Liste mit `rows=[]`
  (Muster `LoadingEmpty`), fehlt die Spur im Ladezustand und erscheint erst danach.
  Dann springt die Spalte „Prüfung“ um die Spur und ihre Fuge (32 + 10 px). Für
  `progress` hat 0228 genau deshalb den Aufrufer entscheiden lassen (JSDoc an
  `without`). Heute lädt die Übergeben-Seite ohne `loading`, deshalb ist das kein
  Mangel.
- **H3 · Die Kante 107 hat zwei Quellen.** `v3.css:1608` rechnet
  `18px + var(--v2-tbl-pick) + 20px + 2 * 10px`, wiederholt also Polster und Fuge
  von `.v2tbl__row` und die Icon-Spur `20px` aus `cols` (Review.tsx:158). Ändert
  sich eines davon, verrutscht der Inhalt still. Heute misst es 0 px Abweichung.
  Vorschlag: die Icon-Spur als Custom Property, die `cols` und `calc` beide lesen.
- **H4 · Sprache.** `… und {formatCount(more)} weitere im Schritt` hat keine
  Einzahl, bei 1 steht „… und 1 weitere im Schritt“. „Posten“ meint im GLOSSARY den
  offenen Posten (OPOS). Weil das Wort hier fest in einer fachfreien Komponente
  steht, lohnt die Frage an den Owner, ob es bleibt. Beide Sätze kommen wörtlich aus
  der App.
- **H5 · Die zweite Verwendung fehlt in der Spec.** `Step8.tsx` (`Befunde`) baut
  dieselbe Postenliste in einem `ExpandableRow`, ebenfalls mit Inline-Stil
  (`gap: 6`). Das stützt den neuen Export nach §3 Regel 2 (zwei Verwendungen). Die
  Spec sollte es nennen, und der Zeigerhub kann beide Stellen umstellen.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | Die leere Chevron-Zelle steht jetzt als eigenes `<td>` **vor** den Zellen der Zeile. `rowCells` legt den `onPick`-Knopf damit in die Icon-Zelle, wie ohne Chevron-Spur. Server-Render einer gemischten Tabelle mit `onPick`: Zeile mit `detail` → Chevron-Knopf (`aria-expanded`); Zeile ohne → `<td></td>`, dann `<td class="v2tbl__lead"><button class="v2rowbtn">` um das Zustandssymbol |
| M2 | `ChecklistItem` nimmt `href` und `note` als `string \| null`. Die Posten der App (`ChecklistItem` des Moduls `batch-review`) passen unverändert. Der Typ bleibt im Muster, weil ein Muster kein Fachmodul importiert. Sein JSDoc nennt das Vorbild |
| M3 | Drei Kriterien vom Spec-Autor ergänzt: Ausschluss `onPick` mit gemischter Tabelle, Ladezustand mit Chevron-Spur, Ersatz in `CloseHandover.tsx`. Story `ExpandableLoading` dazu |
| M4 | `OpenPoints` verweist im `@instead` auf `ChecklistItems` |
| H1 | als Ausbau notiert, `ExpandableRow.label` als Systementscheid |
| H2 | als bewusste Grenze unter „nicht kann“ beschrieben, mit dem Weg über `ExpandableLoading` |
| H3 | Die Icon-Spur ist jetzt die Variable `--v2-chk-icon` an `.v2chk`. `cols` und die Einrückung des Inhalts rechnen beide damit, und in der TSX steht kein `20px` mehr |
| H4 | Einzahl: „… und 1 weiterer im Schritt“. Das Wort „Posten“ in „Die Posten stehen im Schritt.“ ist der Satz der App; ob es neben dem GLOSSARY-Wort „offener Posten“ stehen bleibt, geht als Frage an llcto (bis zur Antwort bleibt es) |
| H5 | `Step8.tsx` als zweite Verwendung in der Einordnung |


## Nachprüfung 1 (2026-10-27)

Fremde Nachprüfung von M1–M4, der Angaben zu H1–H5 und der drei neuen Kriterien
(Z. 135–137). Gegen HEAD `9ce3770` plus den uncommitteten Diff an `patterns/Review.tsx`,
`patterns/Review.stories.tsx`, `patterns/OpenPoints.tsx`, `index.ts` und `v3.css`.
Gemessen mit `scripts/cdp.mjs` (ein Messbrowser, ein Skript) gegen Storybook 6107, per
`getBoundingClientRect`, bei 1280 und 1440 px. Story-IDs mit dem Präfix
`v3-patterns-prüfen-checklist--`. Die gemischte Tabelle ist eine Laufzeitprobe ohne Datei
im Repo: In der Story `expandable` werden `Review.tsx` und React über die Vite-Adressen
des Dev-Servers importiert. Daneben wird eine `Checklist` mit `onPick`, `activeKey="b"`,
`without={["progress"]}` und `jumpHeader="Weiter zu"` gemountet, damit die echte CSS
greift. Ihre Zeilen: a ist ein Fehler mit `detail` (`ChecklistItems` mit Link, Notiz,
`more={1}` und Knopf), b eine aktive Warnung ohne `detail`, c eine erledigte Zeile ohne
`detail`.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 · Knopf der Pick-Zeile in einer gemischten Tabelle | Probe bei 1280 und 1440: Kopf und alle Zeilen haben 5 Zellen, Kanten 35 · 77 · 107 · 989 · 1095 bzw. 35 · 77 · 107 · 1149 · 1255. In b und c ist die erste Zelle ein leeres `<td>` ohne Knopf. Der Knopf `v2rowbtn` steht in der zweiten Zelle (`v2tbl__lead`, x = 77 wie die Icon-Spalte des Kopfs) um das Zustandssymbol und misst 20 × 15 px. Sein Name im Accessibility-Baum ist „Warnung“ bzw. „erledigt“, wie in `filled`. Der Treffertest an 7 Punkten je Zeile (Rand links, jede Zelle, Rand rechts) trifft 7-mal den eigenen Knopf | ✓ |
| M1 · `activeKey` im JSDoc an `detail` | Das „Zu tun“ von M1 verlangt, dass der JSDoc an `detail` neben `onPick` auch `activeKey` nennt. Review.tsx:112–116 nennt nur `onPick` („`onPick` is not called for it“). `active` wird im Zweig mit `ExpandableRow` weiter nicht gelesen (Review.tsx:210–211), und an `activeKey` steht kein JSDoc. Die Spec nennt beide (Z. 68) → R1 | ✗ (R1) |
| *(Kriterium Z. 135)* Ausschluss `onPick`, gemischte Tabelle | Maus: Klicks auf „Prüfung“ von b, „Stand“ von c und die leere Chevron-Zelle von b rufen `onPick` mit `b, c, b`. Ein Klick auf a klappt auf (`aria-expanded` `true`), `onPick` bleibt bei `b, c, b`. Ein Klick auf den Link im Inhalt setzt `#probe-link`, ein Klick auf den Knopf im Inhalt schaltet die Zeile nicht, und keiner der beiden ruft `onPick`. Tastatur: Tab geht vom Schalter a über Link und Knopf zu b und c, in der Reihenfolge der Lesung. Auf b steht der Fokusring `2px solid` `--color-focus` bei `:focus-visible`, innen um das Symbol (Bildschirmfoto bei 1280 und 1440 angesehen). Er hat 3,29:1 auf der aktiven Zeile (`--color-accent-50`) und 3,55:1 auf Weiß. Enter und Leertaste auf b rufen `onPick` je einmal, die Seite scrollt nicht. Enter auf dem Schalter von a klappt zu, ohne `onPick` | ✓ |
| M2 · `ChecklistItem` nimmt `null` | Review.tsx:290 und 292: `href?: string \| null`, `note?: string \| null`. Prüfdatei im Scratchpad (eigene `tsconfig` mit `extends` auf die des Repos). Darin: `ChecklistItem[]` aus `src/ludwig/modules/batch-review/domain/checklist.ts` als `readonly ChecklistItem[]`, `<ChecklistItems items={modelItems} />`, `items={line.items} more={line.moreCount} actions={…}` in der Form von `HandoverLine`, und dasselbe in `ChecklistRow.detail` einer `Checklist` mit `onPick`. `tsc` Exit 0. Gegenprobe mit `note: number`: TS2322, Exit 2, die Probe prüft also. `pnpm typecheck` Exit 0 | ✓ |
| *(Kriterium Z. 137)* Ersatz in `CloseHandover.tsx` | Gelesen gegen die Karte unter der Liste (`CloseHandover.tsx`, nur gelesen). Posten: `picked.items` geht unverändert in `items` (siehe M2). Link: Die Posten der Übergeben-Seite tragen Pfade mit `/` (`close-handover.test.ts`), dafür nimmt der DS-`Link` `next/link` wie heute. Notiz: `note`. „… und n weitere“: `moreCount` → `more`. „Zurück an Ludwig“ (`ReturnToLudwigButton`) und „Zu …“ (`Link` mit `v2btn`) gehen in `actions` (`ReactNode`). Der Leersatz „Die Posten stehen im Schritt.“ ist der der App. Der Kartentitel steht künftig in der Zeile selbst. Die Zeile „n von m Prüfungen in Ordnung“ bekommt `detail` nur, wenn etwas offen ist → N1 | ✓ (N1) |
| M3 · drei Kriterien und Story | Die Kriterien stehen in Z. 135–137, die übrige Liste ist unverändert. Die Story `ExpandableLoading` steht in Review.stories.tsx:216 und in der Story-Tabelle (Z. 101). Der Satz davor (Z. 95, „Eine neue Story …“) zählt noch eine Story → N2 | ✓ (N2) |
| *(Kriterium Z. 136)* Ladezustand mit Chevron-Spur | `expandable-loading` bei 1280 und 1440: Kopf und alle 6 Ladezeilen haben 5 Zellen, Kanten 35 · 77 · 107 · 989 · 1095 bzw. 35 · 77 · 107 · 1149 · 1255. Das sind dieselben Kanten wie in `expandable`, im Kopf und in jeder Zeile. 24 Skelette, kein Querlauf (Dokument 1280 = 1280, 1440 = 1440) | ✓ |
| M4 · Rückverweis an `OpenPoints` | OpenPoints.tsx:54–55: „the open items of one check, folded open in its row → ChecklistItems“. `pnpm check:when` Exit 0 | ✓ |
| H1 · Name der Schalter | Als Ausbau notiert (Z. 111), `ExpandableRow.label` als Systementscheid. Der Name ist weiter „Zeile aufklappen“ (Accessibility-Baum der Probe) | ✓ stimmt |
| H2 · Spur hängt an den Zeilen | Steht unter „nicht kann“ (Z. 73–76), mit dem Weg über `ExpandableLoading`. Die genannten 32 + 10 px passen zu den gemessenen Spuren: Chevron 35 bis 67, Fuge 10, Icon ab 77. „Prüfung“ beginnt bei 107, ohne Chevron-Spur bei 65 | ✓ stimmt |
| H3 · Kante 107 aus einer Variablen | Review.tsx:159 rechnet mit `var(--v2-chk-icon)`, in der TSX steht kein `20px` mehr. v3.css:1608 setzt `--v2-chk-icon: 20px` an `.v2chk`, v3.css:1609 rechnet die Einrückung damit. Nachgemessen in `expandable` mit fünf offenen Zeilen, bei beiden Breiten: Die Beschriftung beginnt bei 107. Kasten, erster Text und jedes Kind jedes Inhalts beginnen ebenfalls bei 107, der Knopf mit seinem Kasten (sein Text bei 120). Abweichung 0 px. Polster 18 und Fuge 10 aus `.v2tbl__row` (v3.css:134–135) stehen in der `calc` weiter als Zahl, das hatte H3 nicht verlangt | ✓ stimmt |
| H4 · Einzahl und Wort „Posten“ | Probe mit `more={1}`: „… und 1 weiterer im Schritt“. `expandable`: „… und 39 weitere im Schritt“. Die Wortfrage liegt bei llcto, die Annahme ist benannt (Z. 288) | ✓ stimmt |
| H5 · zweite Verwendung | Die Einordnung nennt `Step8.tsx` (Z. 38–39). Dort sind die `href` der Posten relativ und bekommen ihren Pfad an der Aufrufstelle (`${abnahme}/${item.href}`, Step8.tsx:195) → N3 | ✓ stimmt (N3) |
| Ohne `detail` unverändert (Gegenprobe nach H3) | `filled`, `all-passed`, `not-counted`, `loading`, `loading-empty`, `without-progress` und `without-progress-loading` bei 1280 und 1440: keine `v2tbl__chev`, Kopf und Zeilen mit 5 bzw. 4 Zellen. Die Spuren rechnen zu `20px … 96px 100px 150px` bzw. `20px … 96px 150px`, wie `20px minmax(0, 1fr) 96px … 150px` in HEAD (Review.tsx@`9ce3770`:147). Der Knopf von `filled` und `without-progress` liegt wie in HEAD in der ersten Zelle (`v2tbl__lead`) | ✓ |
| `Review.tsx` ohne `"use client"` | Zeile 1 ist `import {` | ✓ |
| Wächter über den Exit-Code, mit `--test` | `typecheck`, `check:when`, `check:language`, `check:type` und `check:contrast` Exit 0. `check:classes` Exit 1 mit den bekannten vier (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`), keine davon aus diesem Diff. Alle fünf `--test` Exit 0 | ✓ (für 0230) |
| Konsole | `expandable`, `expandable-loading`, die sieben Stories ohne `detail` und beide Proben: keine `warning`, kein `error`, keine Ausnahme | ✓ |
| Neue Mängel im Diff | Alle fünf Dateien des Diffs gelesen. Kein neuer Mangel, drei Hinweise (N1–N3) | — |

Abgenommen von / am: fremde Nachprüfung (schlanke Abnahme plus Messung der Kriterien), 2026-10-27 · Offen: R1

**Offen**

- **R1 · Rest von M1: Der JSDoc an `detail` nennt `activeKey` nicht.** Die Spec schließt
  `onPick` und `activeKey` für eine Zeile mit `detail` aus (Z. 68). Der Code tut das auch,
  denn `active` wird im Zweig mit `ExpandableRow` nicht gelesen. Der JSDoc an
  `ChecklistRow.detail` (Review.tsx:112–116) nennt aber nur `onPick`. Wer in der App
  `activeKey` auf eine aufklappbare Zeile setzt, erfährt im Code nicht, warum sie nicht
  markiert wird (CLAUDE.md §4 Punkt 5). Zu tun: den Halbsatz ergänzen, etwa „it folds, it
  does not pick: `onPick` is not called and `activeKey` does not mark it“. Danach genügt
  Lesen.

**Hinweise**

- **N1 · `detail: false` macht die Zeile aufklappbar.** `expandable` und `ChecklistLine`
  prüfen `detail != null` (Review.tsx:156, 210). In einer Probe mit `detail: false`
  bekommt die Tabelle die Chevron-Spur und die Zeile einen Schalter mit `aria-expanded`.
  Aufgeklappt steht dann eine leere Inhaltszeile von 31 px. Die Spec sagt „ohne Inhalt
  klappt sie nicht“ (Z. 49). Das Muster `bedingung && <ChecklistItems … />` liegt beim
  Ersatz nahe, denn die Zeile „n von m Prüfungen in Ordnung“ klappt nur auf, wenn etwas
  offen ist. Vorschlag: `false` wie `null` behandeln. Oder JSDoc und Spec sagen „nur
  `undefined` und `null` klappen nicht“, und der Zeigerhub nimmt den Bedingungsoperator.
- **N2 · Die Einleitung der Stories ist veraltet.** Z. 95 sagt „Eine neue Story, weil die
  Ableitung nach §6 nur ein Feld mit Inhalt ergibt“. Seit M3 sind es zwei, `Expandable`
  und `ExpandableLoading`. Das ist Sache des Spec-Autors.
- **N3 · Der zweite Aufrufer setzt die Posten nicht unverändert ein.** `Step8.tsx:195`
  setzt `${abnahme}/` vor jedes `href`. Mit `ChecklistItems` muss diese Seite die Posten
  vorher umschreiben, die Übergeben-Seite nicht. Ohne das Umschreiben gäbe der DS-`Link`
  ein relatives `href` als einfaches `<a>` aus, ohne `next/link`. Das betrifft den
  Zeigerhub, nicht 0230.

Ergebnis: M2, M3 und M4 sind behoben. M1 ist in der Sache behoben, durch die Probe
gemessen. Sein JSDoc-Teil ist offen (R1). Die Angaben zu H1–H5 stimmen. Die drei neuen
Kriterien sind erfüllt. Status `in Arbeit`, bis R1 erledigt ist.

## Nachbesserung 2 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| R1 | Der JSDoc an `ChecklistRow.detail` nennt jetzt beide Ausschlüsse: `onPick` wird nicht aufgerufen, `activeKey` markiert die Zeile nicht |
| N1 | Eine Zeile klappt nur mit Inhalt auf. `null`, `undefined`, `false` und `""` gelten als kein Inhalt (`folds()` in `Review.tsx`), sowohl für die Zeile als auch für die Chevron-Spur der Tabelle. Damit klappt `cond && <ChecklistItems … />` nur auf, wenn die Bedingung gilt |
| N2 | Die Einleitung der Stories nennt beide neuen Stories |
| N3 | geht an ll-abnahme: `Step8.tsx` setzt seinen Pfad vor jedes `href`; das schreibt die App vor der Übergabe an `ChecklistItems` um, 0230 ändert dafür nichts |
| Wort | Leersatz „Die Einzelheiten stehen im Schritt.“ statt „Die Posten …“ (llcto für den Owner, 2026-10-27: „Posten“ bleibt dem offenen Posten vorbehalten). Kriterium und Story-Zeile hat der Spec-Autor nur im Wortlaut angepasst |

## Nachprüfung 2 (2026-10-27)

Enge fremde Nachprüfung der Nachbesserung 2: R1, N1, N2 und der neue Leersatz, dazu die
Spaltenkanten von `Expandable` und `ExpandableLoading`. Gegen HEAD `9ce3770` plus den
uncommitteten Diff an `patterns/Review.tsx`. Gemessen mit `scripts/cdp.mjs` (ein
Messbrowser, ein Skript) gegen Storybook 6107, per `getBoundingClientRect`, bei 1280 und
1440 px. Story-IDs mit dem Präfix `v3-patterns-prüfen-checklist--`. Die Proben zu N1
liegen nur im Scratchpad, keine Datei im Repo: ein Server-Render (esbuild, CommonJS,
`--alias:@=./src`) und eine Laufzeitprobe in der Story `expandable`, die `Review.tsx` und
React über die Vite-Adressen des Dev-Servers importiert und zwei `Checklist` mit
`without={["progress"]}` und `jumpHeader="Weiter zu"` mountet.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| R1 · JSDoc an `ChecklistRow.detail` | Review.tsx:112–118: „it then folds, it does not pick (`onPick` is not called for it, `activeKey` does not mark it)“. Das deckt beide Ausschlüsse der Spec (Z. 70–74) und den Code: `ChecklistLine` kehrt bei `folds(row)` mit `ExpandableRow` zurück und liest `active` dort nicht (Review.tsx:217–218) | ✓ |
| N1 · leere Werte im Server-Render | `folds()` (Review.tsx:123–125) prüft `!= null`, `!== false` und `!== ""`. Die Chevron-Spur (`expandable`, Review.tsx:163) und die Zeile (Review.tsx:217) fragen beide `folds()`. Server-Render je Wert mit zwei Zeilen, `detail` gleich `false`, `null`, `undefined`, `""` und `cond && <ChecklistItems … />` mit `cond = false`, dazu alle vier in einer Tabelle: 0 × `v2tbl__chev`, 0 × `aria-expanded`, Kopf und Zeilen mit 4 Zellen, `--v2-cols: var(--v2-chk-icon) minmax(0, 1fr) 96px 150px` ohne `--v2-tbl-pick`, also wie ohne `detail`. Mit `loading` ebenso keine Vorderspalte. Gemischt (eine Zeile mit `ChecklistItems`, dann die vier leeren): Kopf mit 5 Zellen, `var(--v2-tbl-pick)` vorn, genau 1 Chevron und 1 `aria-expanded`. Die vier leeren Zeilen haben ein leeres erstes `<td>` und kein `aria-expanded` | ✓ |
| N1 · zur Laufzeit, mit Gegenprobe | Probe in `expandable` bei 1280 (Koordinaten der Probe). Nur leere Werte: Kanten 51 · 81 · 973 · 1079 in Kopf und Zeilen, kein Chevron, kein `aria-expanded`. Gemischt: 51 · 93 · 123 · 973 · 1079 in Kopf und Zeilen, „Prüfung“ rückt um 42 px (Spur 32 + Fuge 10), die leeren Zeilen mit leerer erster Zelle. Je ein Mausklick auf die vier leeren Zeilen beider Tabellen: Zeilenzahl gleich (5 bzw. 6), keine Inhaltszeile. Gegenprobe: Ein Klick auf die Zeile mit Inhalt gibt `aria-expanded="true"` und die Inhaltszeile („Echter Posten“, „Notiz“), ein zweiter `false` und keine Inhaltszeile. In der Story selbst klappen „Nichts übernommen“ (3 Links, „… und 39 weitere im Schritt“) und „1 Buchung wartet …“ weiter auf | ✓ |
| Leersatz | `expandable` bei 1280 und 1440: Ein Klick auf „1 Buchung wartet auf eine Rückfrage oder den Mandanten“ gibt `aria-expanded="true"`, `aria-controls` gleich der `id` der Inhaltszelle, die Inhaltszeile schließt ohne Lücke an (0 px). Ihr Text ist genau „Die Einzelheiten stehen im Schritt.“ (`.lw-ui-hint`, 12,5/400). „Posten stehen im Schritt“ steht nicht auf der Seite. `grep -rn "Posten stehen im Schritt"` über `src`, `scripts` und `.storybook` findet nichts. Im ganzen Repo (ohne `node_modules`, `.git`, `storybook-static`) steht der alte Satz nur noch in dieser Spec, in den Nachweisen der Abnahme und der Nachprüfung 1. Der neue Satz steht einmal im Code (Review.tsx:326) | ✓ |
| N2 · Einleitung der Stories | Z. 97: „Zwei neue Stories: `Expandable`, … und `ExpandableLoading` für den Ladezustand mit Chevron-Spur (M3).“ Beide sind genannt, passend zur Story-Tabelle (Z. 103–104) und zu Review.stories.tsx:211 und 216. Der Folgesatz steht noch in der Einzahl → N5 | ✓ (N5) |
| Spaltenkanten `Expandable` und `ExpandableLoading` | 1280: Kopf und alle 6 Zeilen von `expandable`, Kopf und alle 6 Ladezeilen von `expandable-loading` haben die Kanten 35 · 77 · 107 · 989 · 1095. 1440: 35 · 77 · 107 · 1149 · 1255 in beiden. Dazu steht in `expandable-loading` die unsichtbare Statuszeile „Wird geladen …“ (`v2vh`, Höhe 0). Kein Querlauf (Dokument 1280 = 1280, 1440 = 1440). Gleich mit den Werten der Nachprüfung 1 | ✓ |
| `pnpm typecheck`, `pnpm check:language` | beide Exit 0, „0 German comment lines left in 0 files“ | ✓ |
| Konsole | `expandable`, `expandable-loading` und die Probe: nur `[vite] connecting…`/`connected.` und der React-DevTools-Hinweis, keine `warning`, kein `error`, keine Ausnahme | ✓ |

Abgenommen von / am: fremde Nachprüfung 2 (eng: R1, N1, N2, Leersatz, Spaltenkanten; gemessen), 2026-10-27 · R1, N1, N2 und der Leersatz erfüllt · N4, N5 nicht blockierend

**Hinweise**

- **N4 · `0` und `true` klappen auf.** Im Server-Render mit `detail: 0` und mit
  `detail: true` bekommt die Tabelle die Chevron-Spur und jede Zeile einen Schalter mit
  `aria-expanded`. Die Nachbesserung verspricht nichts anderes, sie nennt `null`,
  `undefined`, `false` und `""`. Mit einer echten Bedingung stimmt der JSDoc
  („`cond && <ChecklistItems … />` folds only when there is something“), mit einer Zahl nicht:
  `items.length && <ChecklistItems … />` klappt bei 0 Posten auf und zeigt dort „0“, wie in
  React üblich. Für den Zeigerhub: die Bedingung als Vergleich schreiben (`n > 0 && …`).
- **N5 · Folgesatz der Stories in der Einzahl.** Z. 97–99: Nach „Zwei neue Stories: …“
  folgt „Das ist zugleich die Story ‚im Einsatz‘ …“. Gemeint ist `Expandable`, gelesen wird
  zuerst das zuletzt genannte `ExpandableLoading`. Vorschlag: „`Expandable` ist zugleich die
  Story ‚im Einsatz‘ …“. Das ist Sache des Spec-Autors.

Ergebnis: R1, N1, N2 und der Leersatz sind erfüllt. `Expandable` und `ExpandableLoading`
haben bei 1280 px (und 1440 px) dieselben Spaltenkanten. Kein offener Punkt, N4 und N5
sind Hinweise. Status `fertig`.

## Nachtrag des Autors nach Nachprüfung 2 (2026-10-27)

- **N4:** `folds()` zählt jetzt auch einen Boolean und `0` als „kein Inhalt“.
  Damit klappt `items.length && …` bei null Posten nicht auf und zeigt keine „0“.
  Es ist dieselbe Regel wie N1, nur enger gefasst. Server-Render-Probe: bei
  `detail: 0`, `true`, `false`, `""`, `null` kein Chevron, kein `aria-expanded`;
  eine Zeile mit `ChecklistItems` klappt weiter auf.
- **N5:** Der Satz nach der Einleitung der Stories nennt `Expandable`.

