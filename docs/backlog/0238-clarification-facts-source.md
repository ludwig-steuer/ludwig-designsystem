# 0238 · ClarificationCard: Grundlage mit Spalte „Quelle“

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/clarification/` (Erweiterung von `ClarificationCard`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein, Fakten einer Rückfrage mit Verweis auf Beleg, Konto und Buchung |
| Quelle | llcto 2026-11-02, DS-Wunsch aus App-F619 („Rückfragen in Kanzlei-Sprache“, Owner 2026-11-02), App-Behelf P73 (`docs/topics/web-ui-offen.md`) |
| Ersetzt | App-Behelf U4 aus F619: `clarificationFactsMarkdown` schreibt die Fakten als Markdown-Tabelle in `text` und gibt der Karte `facts: []` (`modules/batch-review/domain/clarification-facts-markdown.ts`, Schritt-Form `Step2List.tsx`) |
| Blockiert | F619-Folge-Spec: verlinkte Quelle am Sachverhalt, in der Expertensicht (`Step2`, `variant="card"`) und im Drawer „Fragen dieses Stapels“ |
| Spec von / am | Designer-Sitzung, 2026-11-02 |

## Ziel

Ludwig nennt in einer Rückfrage seine Fakten („Betrag 1.234,56 €“, „Rechnungsdatum
14.08.2026“). Heute steht unter „Grundlage“ nur Bezeichnung · Wert. Woher ein Wert
kommt, sieht die Steuerfachangestellte nicht und kann es nicht mit einem Klick
prüfen. Künftig steht daneben die Quelle („Beleg RE-2026-0117“, „Konto 1200“,
„Buchung 4711“). Wo die App die Quelle auflösen kann, öffnet sie per Klick denselben
Drawer wie die Belege und Konten unter „Weitere Quellen“. Die Frage wird damit
prüfbar, ohne die Karte zu verlassen.

## Einordnung

- **Wiederverwenden:**
  - `FieldList`: `@when` „Master data and properties of an item“. Trägt zwei
    Spalten, keine dritte.
  - `EvidenceTable` und `Pick` (intern in `ClarificationCard.tsx`): zeichnen die
    Quellen der Frage schon als kompakte Tabelle. `Pick` verlinkt per `onSelect`
    oder `href`. Genau dieses Verhalten ist gewünscht.
- **Erweitert, weil:** §3 Regel 2. `ClarificationCard` deckt den Fall zu vier
  Fünfteln ab. Es fehlt eine Angabe am Fakt, und die ist eine wiederkehrende
  Designentscheidung: drei geplante Verwendungen laut F619 (Sachverhalt,
  Expertensicht, Drawer) und dazu die Schritt-Form.
- **Zuschnitt:**
  - Kein neuer Export. `facts[]` bekommt das optionale Feld `source`.
  - Der Block „Grundlage“ zeichnet die Fakten als kompakte Tabelle aus
    `EvidenceTable` statt als `FieldList`, siehe Offene Frage 1.
- **Setzt auf:** `Table` (`density="compact"`, `HeadRow`, `Row`) über
  `EvidenceTable`, `Pick` für die Quelle und `Block` für den Kopf „Grundlage“.

## Schnittstelle

Änderung an `ClarificationVM` (Prop `c` von `ClarificationCard`):

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `facts[].source` | `ClarificationFactSource \| null` | nein | Woher der Wert kommt. Ohne `source` bleibt die Zelle leer. Hat **kein** Fakt eine Quelle, entfällt die Spalte | `FactsWithSources`, `FactsWithoutSources` |
| `ClarificationFactSource.label` | `string` | ja | der Text in der Zelle, im Wortlaut der App („Beleg RE-2026-0117“, „Konto 1200 · Bank“) | `FactsWithSources` |
| `ClarificationFactSource.kind` | `EvidenceKind` | nein | mit `id` wird die Quelle ein Verweis wie eine Zeile unter „Weitere Quellen“ | `FactsSourcePick` |
| `ClarificationFactSource.id` | `string` | nein | Schlüssel für `onSelect({ kind, id })`. Ohne `kind` und `id` ist die Quelle reiner Text | `FactsSourcePick` |
| `ClarificationFactSource.href` | `string` | nein | ohne `onSelect` an der Karte verlinkt die Quelle hierhin, wie `EvidenceRow.href` | `FactsWithSources` |

`onSelect` an der Karte bleibt unverändert, `(item: { kind: EvidenceKind; id: string }) => void`.
Die App öffnet damit schon heute den Drawer zu einer Quelle (F255).

**Typen aus `src/ludwig/`:**
- F619 legt `ClarificationFact = { label: string; value: string; source?: string }`
  an (`accounting-cases/domain/clarification-facts.ts`). Dort ist `source`
  **Freitext**, denn `facts_json.source` wird nicht geprüft (F619, „Nicht im
  Umfang“).
- Die App kann heute also nur `{ label: source }` übergeben: Die Spalte steht,
  aber nichts verlinkt.
- Einen Verweis gibt es erst, wenn der Fakt Art und Schlüssel seiner Quelle
  trägt → Befund **L-377**.

**Kann bewusst nicht:**
- Sie löst keinen Freitext auf. Ob „RE-2026-0117“ ein Beleg der Frage ist,
  weiß nur die App.
- Sie prüft nicht, ob die Quelle auch unter „Weitere Quellen“ steht.
- Sie gibt einem Fakt keine Farbe.

## Verhalten

- **Spalten:** Bezeichnung · Wert · Quelle.
  - Text links, auch der Wert. Er ist Freitext („1.234,56 €“,
    „14.08.2026“, „monatlich“) und hat deshalb keine Zahlenausrichtung, trägt
    aber `tnum`.
  - Die Quelle steht rechts außen und wird nicht gekürzt, sondern bricht um.
- **Verweis:** Eine Quelle mit `kind` und `id` ist ein `Pick` mit
  `inRow={false}`.
  - Nur die Zelle ist Ziel, nicht die ganze Zeile: Die Zeile ist der Fakt, die
    Quelle ist nur der Weg dorthin.
  - Hover und Fokus kommen von `Pick`.
  - Trefferfläche mindestens 24 px hoch. Gemessen wird in der Zeile `compact`.
  - Eine Quelle ohne `kind`/`id` und ohne `href` ist Text ohne Hover.
- **Tastatur:** Der Verweis ist ein gewöhnliches Fokusziel in der Lesefolge.
  `Enter` ruft `onSelect` auf, das öffnet den Drawer. `Esc` im Drawer führt
  zurück.
- **Beide Formen:**
  - Karte und Schritt-Form zeigen denselben Block; nur die Kopfebene unterscheidet
    sich wie heute (`level` 3 oder 4).
  - In der Schritt-Form öffnet `onSelect` denselben Drawer wie die Zeilen im
    Seitenpanel.
- **Zustände:** Die Karte hat ihre fünf Zustände schon (0214).
  - Für diesen Block gilt: Ohne Fakten fehlt er ganz, wie heute.
  - Laden und Fehler gibt es hier nicht, denn der Block lädt nichts.
  - Einen Filter gibt es nicht.
- **Server/Client:** unverändert. Die Karte ist Client-Komponente; `Pick` ruft
  `onSelect`.

## Stories

Titel `v3/Entitäten/Klärung/ClarificationCard`, dazu kommen vier Stories:

| Story | Beweist |
|---|---|
| `FactsWithSources` | drei Spalten, gemischt: Quelle als Verweis (`href`), als reiner Text und leer. Realistische Werte (Betrag, Datum, Kontonummer) |
| `FactsWithoutSources` | Altbestand ohne `source`: keine Spalte „Quelle“, kein leerer Platz |
| `FactsSourcePick` | Rundlauf `onSelect` mit `useState`: Ein Klick auf „Beleg RE-2026-0117“ zeigt die gewählte Quelle unter der Karte an. Dasselbe in der Schritt-Form |
| `FactsInDrawer` | im Einsatz: Drawer `sm` „Fragen dieses Stapels“. Langer Quelltext, ein Wert über zwei Zeilen, bei 1280 px |

Ausgeschlossen: lädt und Fehler, weil der Block nichts lädt. Leer nach Filter
entfällt, es gibt keinen Filter.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Quelle zugleich unter „Weitere Quellen“ markieren (gleiches Ziel, ein Zeichen) | `ClarificationFactSource.cited?` | Owner wünscht den Querverweis, oder Doppelungen fallen in der Abnahme auf |
| Wert als Betrag rechtsbündig | `facts[].amount?: number` mit `currency` | die App liefert Beträge strukturiert statt als Text (Folge von L-377) |

## Offene Fragen

1. **Eine Form für die Grundlage.** Default: immer die kompakte Tabelle, auch
   ohne Quelle (dann zwei Spalten mit Kopf „Bezeichnung · Wert“). Bisher war es
   eine `FieldList`. Grund: In der Liste „Fragen dieses Stapels“ stehen alte
   Fragen ohne und neue mit Quelle untereinander, und derselbe Block soll gleich
   aussehen.
   - Die Alternative: `FieldList` ohne Quelle, Tabelle mit Quelle.
   - Ohne Antwort gilt der Default.
   - **Entschieden (llcto für den Owner, 2026-11-02):** immer die kompakte
     Tabelle, auch ohne Quelle mit zwei Spalten. Das passt zur Owner-Regel
     „Übersicht als Tabelle“. L-377 übernimmt die App in F619 (ll-dev40):
     `facts_json[].source` wird `{ kind, id, label }`, vom Server geprüft.

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

- [ ] `facts[].source` wie in der Schnittstelle: Text, Verweis per `href`, Verweis per `onSelect`, leer (`FactsWithSources`, `FactsSourcePick`)
- [ ] Ohne jede Quelle keine dritte Spalte und keine Lücke (`FactsWithoutSources`)
- [ ] Ein Klick auf eine Quelle mit `kind`/`id` ruft `onSelect({ kind, id })` auf, auch in der Schritt-Form (`FactsSourcePick`)
- [ ] Per Tastatur: `Tab` erreicht die Quelle in der Lesefolge, `Enter` löst sie aus, der Fokusring ist sichtbar (`FactsSourcePick`)
- [ ] Nur die Quell-Zelle reagiert auf Hover, nicht die Zeile; eine Quelle als reiner Text hat keinen Hover (`FactsWithSources`)
- [ ] Trefferfläche der Quelle ≥ 24 px hoch, gemessen (`FactsInDrawer`)
- [ ] Im Drawer `sm` bei 1280 px: nichts läuft über, lange Quelle und langer Wert brechen um (`FactsInDrawer`)
- [ ] Kontrast: Text ≥ 4,5:1, Verweis ≥ 4,5:1 auf der Karte, gemessen
- [ ] Ersetzt den App-Behelf U4 (Markdown-Tabelle in `text`) ohne Funktionsverlust: Bezeichnung, Wert, Quelle, Reihenfolge der Fakten, Nachfrage-Zeile aus `followUpPresentation` als erste Zeile

## Bau (2026-11-02)

- `Facts` in `ClarificationCard.tsx` (intern) ersetzt die `FieldList` im Block
  „Grundlage“. Es nutzt `EvidenceTable` und `Pick` mit `inRow={false}`.
- Spalten `1fr · 1fr · 1.25fr` mit Quelle, `1fr · 1.4fr` ohne. Die Quelle
  bekommt etwas mehr Breite, damit Kennungen wie „RE-2026-4471“ im Drawer `sm`
  ganz bleiben.
- Wörter trennen an der Silbe wie `.v3prop__acc`: `hyphens: auto`,
  `hyphenate-limit-chars: 12 5 5`, als letzter Ausweg `overflow-wrap:
  break-word`. Gemessen „Verwendungs-zweck“.
- Ziel 24 px: Link und Knopf bekommen `padding-block` und denselben negativen
  `margin-block`.
  - Der Text bleibt auf der Linie von Bezeichnung und Wert, einzeilig wie
    dreizeilig. Gemessen: gleiche Textoberkante in allen drei Zellen.
  - Die Zeilen mit Verweis sind so hoch wie die ohne (34,4 px Abstand).
  - Verworfen: Grundlinien-Ausrichtung der Zeile. Bei umbrochenem Verweis
    richtete sie sich an seiner letzten Zeile aus.
- Export `ClarificationFactSource` über `src/ui/v3/index.ts`.
- `pnpm typecheck` und `check:when`, `check:language`, `check:type`,
  `check:contrast`, `check:icons` grün. `check:classes` meldet nur die vier
  Altklassen. `storybook build` in ein eigenes Verzeichnis: Exit 0.

## Abnahme

Gemessen auf dem laufenden Dev-Server (Port 6107), der weder neu gestartet noch
neu gebaut wurde. Messbrowser war die Headless Shell 1247 über `CHROME_BIN` und
`scripts/cdp.mjs`, ein Browser je Skript. Gemessen wurde bei 1280 und 1920 px. Die
Proben liegen im Scratchpad der Sitzung (`measure.mjs`, `measure2.mjs`,
`m3.mjs` bis `m5.mjs`) und ändern keine Datei im Repo. Story-IDs unten ohne das
Präfix `v3-entitäten-klärung-clarificationcard`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` ist nach Auftrag nicht gelaufen, weil im Arbeitsbaum gemessen wurde. Der Bau meldet `storybook build` in ein eigenes Verzeichnis mit Exit 0 | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Die Erweiterung steht in `entities/clarification/ClarificationCard.tsx`, die Stories in `ClarificationCard.stories.tsx` daneben, Titel `v3/Entitäten/Klärung/ClarificationCard`. `type ClarificationFactSource` wird in `src/ui/v3/index.ts` in der Klärungs-Gruppe neben `ClarificationSource` exportiert | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Bezeichner, Kommentare, JSDoc und Story-Exportnamen sind englisch. Deutsch steht nur in sichtbaren Strings: Spaltenköpfe „Bezeichnung“, „Wert“, „Quelle“, Story-Hinweise und Fixture-Werte. Der neue Export ist ein Typ, und Typen tragen im Set kein `@when` (so auch `ClarificationSource`, `EvidenceRow`; `check:when` prüft Funktionen und Komponenten). `ClarificationCard` behält `@when`/`@instead`. `check:when` meldet „in Ordnung“, `check:language` „0 German comment lines“, beide Selbsttests (`--test`) sind grün | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Im Diff steht kein Hex und kein px in TSX. Die Story-Rahmen `maxWidth: 760` und `1180` folgen den vorhandenen Stories. `24px` steht nur in `v3.css`, wie bei `.v2clc__pick`. Es gibt keine Label-Map, und kein Status ist berührt. `check:contrast` Exit 0, `check:icons` Exit 0, `check:type` meldet „ok“. `check:classes` endet mit Exit 1 und genau den vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`; `.v2clc__factcell` hat ihre Regel. Alle Selbsttests (`--test`) sind grün | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `--facts-with-sources`, `--facts-without-sources`, `--facts-source-pick` und `--facts-in-drawer` stehen im Index und rendern. Story-Deckung: `source` in FactsWithSources und FactsWithoutSources. `label` und `href` in FactsWithSources, wo die Karte kein `onSelect` hat, deshalb verlinkt `href`. `kind` und `id` in FactsSourcePick. Ausgeschlossen sind lädt, Fehler und leer nach Filter, jeweils mit Grund in der Spec. „Ohne Fakten fehlt der Block“: `--by-hand` und `--in-portal` haben keine Fakten und keinen Block „Grundlage“. Die Anzeige der Wahl in FactsSourcePick steht über der Karte statt darunter (H2) | ✓, H2 |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe `entities/`, Importe nur abwärts (`Table`, `Link`). Text links, auch der Wert, mit `tabular-nums lining-nums` (Spec), nichts zentriert, Spaltenkopf über der Spalte (gleiche x-Lage). Zeilenhöhe 34,38 px mit und ohne Verweis (Zeile `compact`). Farbe nur als Link-Akzent, kein Status, keine Icons. Die Schrift ist 12,5 px wie in der Tabelle „Weitere Quellen“ derselben Karte. „Grundlage“ ist `h4` in der Karte und `h3` in der Schritt-Form. Spalten `minmax(0, …)`, die Zelle hat `min-width: 0`. Kontrast, Hover, Tastatur und Trefferfläche stehen in den Zeilen darunter. Das Bild aller Stories mit Fakten ändert sich (H3) | ✓, H3 |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 27 Stories von `ClarificationCard` sowie `seiten-deck--questions` und `--question-detail` wurden bei 1280 und 1920 px geladen. Jede rendert, keine Seite läuft quer. Die Konsole meldet 0 Fehler, 0 Warnungen und 0 Ausnahmen; die Erfassung wurde vorher mit einem `console.error` geprüft. Die 26 Grundlage-Tabellen der 21 älteren Stories sind zweispaltig mit dem Kopf „Bezeichnung · Wert“. Screenshots `facts-with-sources-1280.png`, `facts-without-sources-1280.png`, `step-1280.png`, `drawer-1280-view.png`, `focus-source-1280.png`, `drawer-focus-1280.png`, `deck-questions-1280.png` | ✓, H1 |
| `facts[].source` wie in der Schnittstelle: Text, Verweis per `href`, Verweis per `onSelect`, leer | Der Typ stimmt mit der Spec überein: `source?: ClarificationFactSource \| null`, `label` Pflicht, `kind?: EvidenceKind`, `id?`, `href?`. In `--facts-with-sources` (1280) sind die Zeilen 1–3 `A.v3cell-link` mit `href` `#doc-4471`, `#doc-4471` und `#je-2`. Zeile 4 „laut Hotelrechnung im Anhang“ ist ein `SPAN` ohne Link, Zeile 5 ist leer. In `--facts-source-pick` sind dieselben Quellen mit `kind`/`id` ein `BUTTON.v3cell-link.v2clc__pick`, in beiden Formen, und keine trägt `v2rowlink` | ✓ |
| Ohne jede Quelle keine dritte Spalte und keine Lücke | `--facts-without-sources` bei 1280 und 1920: `--v2-cols` ist `minmax(0, 1fr) minmax(0, 1.4fr)`, es gibt zwei `th` („Bezeichnung“, „Wert“) und zwei `td` je Zeile. Die Tabelle ist 760 px breit, ihre rechte Kante (776) ist die rechte Kante des Blocks. Gleiches gilt für die 26 Tabellen der älteren Stories | ✓ |
| Ein Klick auf eine Quelle mit `kind`/`id` ruft `onSelect({ kind, id })` auf, auch in der Schritt-Form | `--facts-source-pick` bei 1280, Mausklick über `Input.dispatchMouseEvent`. Karte: Zeile 1 ergibt „Drawer öffnet: document:doc-4471“, Zeile 3 „entry:je-2“. Schritt-Form: Zeile 1 „document:doc-4471“, Zeile 3 „entry:je-2“. Ein Klick auf Bezeichnung, Wert oder die Text-Quelle ändert nichts. Ein Klick 1 px unter der Oberkante des 24-px-Ziels, also im Polster, ergibt „document:doc-4471“. Im Drawer (`--facts-in-drawer`) ergibt der Klick auf „Zahlung vom 23.08.2026 …“ den Wert „payment:bt-1“ | ✓ |
| Per Tastatur: `Tab` erreicht die Quelle in der Lesefolge, `Enter` löst sie aus, der Fokusring ist sichtbar | `--facts-source-pick`, Tab ab Seitenanfang. Die Stopps 1–3 sind die drei Quellen der Karte in Zeilenfolge, 4 ist „Weitere Quellen“, 5–7 sind die drei Quellen der Schritt-Form. Danach folgen Antwortoption, „Speichern und weiter“, „Anmerkung schreiben“ und der Kasten „Kontext“. Jeder Stopp ist `:focus-visible` mit `2px solid rgb(59, 143, 196)` und 2 px Abstand, der Ring ist ganz sichtbar (`focus-source-1280.png`). Enter auf der ersten Quelle der Karte ergibt „document:doc-4471“, ebenso in der Schritt-Form. Im Drawer: Schließen, vier Quellen, „Weitere Quellen“, dann wieder Schließen, die Falle hält. Enter auf der Zahlung ergibt „payment:bt-1“, `Esc` schließt den Drawer (`is-open` fällt weg) | ✓ |
| Nur die Quell-Zelle reagiert auf Hover, nicht die Zeile; eine Quelle als reiner Text hat keinen Hover | `--facts-with-sources` bei 1280, `mouseMoved`. Über Bezeichnung, Wert, Text-Quelle und leerer Quell-Zelle bleibt der Zeilenhintergrund `rgba(0, 0, 0, 0)`, der Cursor `auto`, nichts ist unterstrichen. Über dem Link: `underline` und Cursor `pointer`, die Zeile bleibt unverändert. Die Text-Quelle zeigt `text-decoration: none` und Cursor `auto`. Der Knopf in `--facts-source-pick` ist auch im Polsterstreifen unterstrichen, die Zeile bleibt unverändert | ✓ |
| Trefferfläche der Quelle ≥ 24 px hoch, gemessen | `--facts-in-drawer` bei 1280: eine einzeilige Quelle ist 24,0 × 122,8 px groß, eine zweizeilige 43,4 px hoch, die fünfzeilige 101,5 px. Auch in `--facts-with-sources` (Link) und `--facts-source-pick` (Knopf) sind es 24,0 px, bei 1280 und 1920. Die Textoberkante ist in allen drei Zellen einer Zeile gleich (z. B. 549,8 · 549,8 · 549,8). Zeilen mit Verweis sind 34,38 px hoch wie Zeilen ohne | ✓ |
| Im Drawer `sm` bei 1280 px: nichts läuft über, lange Quelle und langer Wert brechen um | `--facts-in-drawer` bei 1280: Drawer `sm` 435,2 px, Rumpf `clientWidth` 435 = `scrollWidth` 435. Kein Element ragt rechts über den Rumpf, keine Zelle hat `scrollWidth > clientWidth`. Spalten 104,4 · 104,4 · 130,5 px. Die lange Quelle „Zahlung vom 23.08.2026 · Sparkasse Musterstadt, Geschäftskonto 1800“ steht auf 5 Zeilen („Muster-/stadt“), der Wert „EREF+…“ auf 6, die Bezeichnung als „Verwendungs-/zweck der/Zahlung“ (`drawer-1280-view.png`). Bei 1920 px (Drawer 560 px) läuft ebenfalls nichts über | ✓ |
| Kontrast: Text ≥ 4,5:1, Verweis ≥ 4,5:1 auf der Karte, gemessen | Aus `getComputedStyle` gerechnet, auf Weiß (Schritt-Form, Drawer) und auf `rgb(244, 246, 248)` (Lesekarte ohne eigene Fläche im Story-Rahmen). Text `rgb(45, 45, 45)`: 13,77:1 und 12,71:1. Verweis `rgb(43, 111, 156)`: 5,45:1 und 5,03:1. Spaltenkopf `rgb(113, 113, 113)`, derselbe wie unter „Weitere Quellen“: 4,88:1 und 4,51:1. Blockkopf „Grundlage“: 6,69:1 und 6,17:1. Fokusring `rgb(59, 143, 196)`: 3,55:1 und 3,28:1 | ✓ |
| Ersetzt den App-Behelf U4 ohne Funktionsverlust: Bezeichnung, Wert, Quelle, Reihenfolge, Nachfrage-Zeile als erste Zeile | Gelesen (nur lesen): App-Spec F619 T619.3, `batch-review/domain/clarification-facts-markdown.ts`, Diff von `batch-review/ui/Step2List.tsx` und `accounting-cases/domain/case-detail-ds-mapping.ts`. Bezeichnung, Wert und Quelle sind Spalten wie in U4. Ohne Quelle gibt es zwei Spalten, mit derselben Regel `facts.some(f => f.source)`. Eine fehlende Quelle gibt eine leere Zelle (gemessen, Zeile 5). Die Reihenfolge bleibt: `facts.map` mit dem Index als Schlüssel, gemessen in `--facts-with-sources` (Betrag, Belegdatum, Gegenkonto bisher, Übernachtung, Teilnehmer laut Beleg, wie die Fixture). Die Nachfrage-Zeile stellt die App in `toClarificationEntry` als `followUpPresentation(…).fact` vor `c.facts`; die Karte ändert die Folge nicht, also steht sie als erste Zeile mit leerer Quelle. Dafür gibt es keine eigene Story, der Nachweis läuft über Code und gemessene Folge. Ein Zeilenumbruch im Wert wird bei `white-space: normal` zum Leerzeichen, wie U4 ihn ersetzt. Eine leere Liste ergibt keinen Block, wie U4 `""`. Neu dazu: Die Quelle wird Verweis, die Tabelle steht auch in der Karten-Form, und die Empfehlung steht wieder über der Grundlage (Randfall in U4). Der App-Typ weicht in `kind` ab (H4) | ✓, H4 |

Abgenommen von / am: fremde Abnahme, 2026-11-02 · Offene Punkte: keine Mängel; H1–H4 nicht blockierend

### Hinweise

- **H1 · Im Deck bei 1280 px stößt der Spaltenkopf an.** In
  `seiten-deck--questions` ist die Kartenspalte 232 px breit, die Tabelle 198 px.
  „Bezeichnung“ (79 px) steht in einer 63 px breiten Spalte und läuft 6 px in
  „Wert“ hinein (Text 1027–1106, „Wert“ beginnt bei 1100,3). „Bewirtungsbeleg“
  bricht als „Bewir-/tungsbele/g“. Das blockiert nicht, denn dieselbe Spalte läuft
  schon vor 0238 über: Die Antwortoptionen (`v2radiogrp`) ragen 66 px über die
  Karte (rechte Kante 1290 gegen 1224). Der Fehler liegt also im Seitenraster des
  Decks. Bei 1440 px (Tabelle 358 px) und 1920 px ist alles sauber. Soll die
  Grundlage auch in so schmalen Spalten halten: `th` bekommt die Umbruchregel von
  `.v2clc__factcell`, oder die Deck-Spalte bekommt eine Mindestbreite.
- **H2 · FactsSourcePick zeigt die Wahl über der Karte.** Die Spec sagt „unter
  der Karte“. Der Hinweis steht bei y = 16, die Karte beginnt bei y = 50,75. Das
  Beispiel heißt „Beleg RE-2026-4471“ statt „RE-2026-0117“. Der Rundlauf selbst
  ist derselbe.
- **H3 · Das Bild jeder Story mit Fakten ändert sich.** 26 Tabellen in 21
  Stories und die beiden Deck-Seiten zeigen die Grundlage jetzt als Tabelle mit
  Kopf: 12,5 px, Wert in 400 und linksbündig. Vorher war es die `FieldList` mit
  13,5 px, Wert in 500 und rechtsbündig. Das ist gewollt (Offene Frage 1, „Text
  links, auch der Wert“). Ein Vergleich mit älteren Screenshots zeigt es als
  Änderung, nicht als Fehler.
- **H4 · Der App-Typ trägt einen anderen `kind`.** Im Arbeitsbaum der App
  (F619, uncommittet) steht `accounting-cases/domain/clarification-facts.ts` mit
  `ClarificationFactSource { label; kind?: RationaleSourceKind; id? }`. Der Name
  ist derselbe, aber die Arten sind andere (`source_doc`, `bank_transaction`,
  `ledger_account` …), und `href` fehlt. Die Karte nimmt `EvidenceKind`,
  TypeScript lehnt die direkte Übergabe also ab. Die Folge-Spec muss abbilden:
  `source_doc → document`, `bank_transaction → payment`,
  `ledger_account → account`, der Rest `other` oder ohne `kind`.
