# 0075 · Beleg-Vorschau — `SourceDocumentPreview`

| | |
|---|---|
| Status | Abnahme (Änderung der Vorschauhöhe, 2026-09-07) |
| Stufe | `entities/source-document/` — `SourceDocumentPreview.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **fast**: ein PDF in einem Rahmen ist kein Fachwort. Sie bleibt trotzdem Entität, weil sie zwei fachliche Regeln trägt — der Grund für eine fehlende Vorschau wird ausgesprochen statt bebildert, und ein Teilbeleg sagt, aus welchen Seiten welches Originals er stammt (`splitPageRange`, `parentSourceDocId`). Ohne die zwei wäre sie ein `<iframe>` an der Aufrufstelle. |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Formen-Tabelle Zeile `SourceDocumentPreview`; Datenpunkte Rang 10 und 12 |
| Ersetzt | `BelegPreview` (`ui/beleg/`, drei Aufrufstellen: Rechnung, Nicht-Rechnung, Vertrag) und das inline-`<iframe>` in `SourceDocumentDrawer` (0052) |
| Blockiert | 0076 (der Drawer-Nachzug braucht sie), 0071 (View und Karte) |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Ein Beleg *hat* ein Original — das ist der Unterschied zwischen ihm und
jeder anderen Entität, und deshalb steht es in Drawer, Karte und Detail an
zweiter Stelle, gleich nach dem Kopf (0052, Zone 2). Heute gibt es dafür
zwei Implementierungen: `BelegPreview` in der App (die selbst schon drei
identische Einzelfassungen ersetzt hat) und ein zweites `<iframe>` im
v3-Drawer.

Beide können dasselbe nicht: sagen, **welchen Ausschnitt** man sieht. Jeder
fünfte Beleg im Bestand ist ein Teilbeleg, aus einem Sammel-PDF
herausgeschnitten (`splitPageRange`, 20 %). Wer die Vorschau ansieht, sieht
drei Seiten und weiß nicht, dass sie Seiten 5–7 eines 24-Seiten-Originals
sind.

## Einordnung

- **Wiederverwenden:** kein `@when` in `src/ui/v3` deckt „das Original einer
  Entität, groß". `SourceDocumentDrawer` (0052) *enthält* die Vorschau, ist aber
  der Rahmen um sie, nicht sie selbst.
- **Neu, weil:** `spec-schreiben` §3 Regel 5 — `ui-repraesentationen.md`
  führt die Form „Vorschau" für den Beleg (`BelegPreview`), und keine
  vorhandene Form deckt sie ab. Regel 3 (neue Primitive) greift **nicht**:
  ohne die zwei fachlichen Regeln bliebe zu wenig übrig, und der zweite
  Aufrufer außerhalb der Beleg-Familie fehlt.
- **Zuschnitt:** eine Datei, ein Export. Kein Familienmitglied von
  `SourceDocument.tsx` — sie hat eine andere Datenquelle (die signierte URL aus
  `ops_stored_files`, nicht die Beleg-Zeile) und ändert sich aus einem
  anderen Grund (§4 „Trennen", zweiter Punkt).
- **Setzt auf:** `Card`/`CardHead`, `EmptyState`. **Nicht** `Section` — die
  gibt es in v3 nicht (Prüfung des Profils, 2026-09-04).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `url` | `string \| null` | ja | Signierte URL des Originals. `null` heißt **es gibt keine**, nicht „lädt noch". | `Gefuellt`, `OhneVorschau` |
| `unavailableReason` | `string \| null` | nein | Warum es keine gibt, in einem Satz. Ohne ihn steht der Standardsatz. Nie ein Platzhalterbild. | `OhneVorschau` |
| `title` | `string` | nein | Überschrift des Rahmens, Vorgabe „Beleg". Beim Vertrag „Vertrag" — die **Belegart**, aus `sourceDocTypeLabel()` des Aufrufers, nicht hier abgeleitet. | `Ausprägungen` |
| `pageCount` | `number \| null` | nein | Seitenzahl des Dokuments (100 % gefüllt, p90 3, max 27). Steht als Meta neben dem Titel. | `Gefuellt` |
| `excerpt` | `{ pages: string; parentTitle?: string; parentHref?: string } \| null` | nein | Der Ausschnitt: `splitPageRange` („5-7") plus, wenn bekannt, der Weg zum Sammel-Original. `null` = ein ganzes Dokument. | `Teilbeleg` |
| `fileName` | `string \| null` | nein | Der Dateiname des Originals — er steht **nicht** im Bild, sondern im `title` des `<iframe>`: „Vorschau von RE-4471-ACME.pdf". Ohne ihn fällt der Rahmen auf „Vorschau: `<Titel>`" zurück, und für eine Vorlesehilfe ist ein Rahmen ohne Namen ein Kasten ohne Inhalt. Nachgetragen 2026-09-05, die Prop war seit dem Bauen da. | `Gefuellt` |
| ~~`height`~~ | `"md" \| "lg"` | — | **Gestrichen** mit dem Owner-Entscheid vom 2026-09-07: eine Höhe für jede Stelle. Die Prop bleibt eine Version lang als `@deprecated` stehen und wird **ignoriert**. | — |

Typen: keiner aus `src/ludwig/` nötig — die Vorschau kennt den Beleg nicht,
nur seine Datei. `splitPageRange` kommt als fertiger String („5-7"), die
Komponente parst nichts.

**Was sie bewusst nicht kann:**

- **Nicht laden.** Keine signierte URL holen, kein Ablaufdatum prüfen, kein
  Neuversuch. Der Aufrufer gibt `url` oder `null` (0042).
- **Kein PDF rendern.** Das `<iframe>` überlässt es dem Browser — kein
  `pdf.js`, keine eigene Seitennavigation. Wer blättern will, öffnet das
  Original.
- **Keinen Platzhalter zeigen.** Fehlt die Vorschau, steht dort ein Satz.
  Ein grauer Kasten in Dokumentform wäre eine Behauptung über etwas, das
  nicht da ist.
- **Nicht auf den Ausschnitt zoomen.** `excerpt` **beschreibt** ihn, es
  schneidet nichts: der Teilbeleg ist bereits eine eigene Datei (F71
  schneidet serverseitig).

## Verhalten

**Server-Component.** Ein `<iframe>` braucht kein `"use client"`.

Zustände:

| Zustand | Was passiert |
|---|---|
| gefüllt | Titel, Seitenzahl, ggf. Ausschnitt-Zeile; darunter das `<iframe>` in der Höhe aus `height` |
| leer (`url = null`) | `EmptyState` **inline** mit `unavailableReason` oder dem Standardsatz „Für diesen Beleg gibt es keine Vorschau." |
| lädt | **nicht anwendbar** — der Aufrufer zeigt `Skeleton` in der Form der Vorschau, wie `SourceDocumentDrawer` es heute tut |
| Fehler | **nicht anwendbar** — die Komponente ruft nichts; eine abgelaufene URL zeigt der Browser im `<iframe>` |
| leer nach Filter | **nicht anwendbar** — es wird nichts gefiltert |

Das `<iframe>` bekommt ein sprechendes `title` („Vorschau von
`<Dateiname>`") — ohne das ist es für einen Screenreader ein namenloser
Rahmen.

## Stories

Titel `v3/Entitäten/Beleg/SourceDocumentPreview`.

| Story | Beweist |
|---|---|
| `Gefuellt` | Ein dreiseitiges PDF mit Titel und Seitenzahl |
| `OhneVorschau` | Beide Leerfälle nebeneinander: mit Begründung und ohne (Standardsatz) — kein Platzhalterbild in beiden |
| `Teilbeleg` | „Seiten 5–7 aus Sammel-PDF vom 12.08.2026" mit Weg zum Original; daneben dasselbe Dokument ohne `excerpt` |
| `Ausprägungen` | Titel „Beleg", „Rechnung", „Vertrag", „Kontoauszug" — die Aufschrift kommt vom Aufrufer, die Vorschau bleibt dieselbe |
| `Grenzen` | Die **eine** Höhe an ihren `clamp`-Grenzen. *(Hieß bis 2026-09-07 `Groessen` und stellte `md` neben `lg` — den Unterschied gibt es nicht mehr, und eine Story, die einen nicht existierenden Unterschied vorführt, lehrt das Gegenteil des Entscheids.)* |
| `ImEinsatz` | In einem `Drawer` neben einer Liste — so, wie 0076 sie einsetzt |

Sechs Stories: 2 anwendbare Zustände + 1 je Enum-Prop (`height`, plus
`title` als Ausprägungs-Achse) + 1 Layout-Fall (`excerpt`) + 1 „im Einsatz".
Kein Callback, keine Rand-Story — die Komponente formatiert nichts und kürzt
nichts.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Zur Seite springen (Sammel-PDF, 27 Seiten im Maximum) | `initialPage?: number`, angehängt als `#page=n` | wenn ein Screen ein Sammel-PDF mit Split-Plan zeigt und auf ein Segment zeigen will |
| Herunterladen | `downloadHref?: string` neben dem Titel | wenn eine Seite es anbietet — der Drawer tut es heute bewusst nicht (0052: genau ein Ausgang) |
| Vorschau eines Bildes statt PDF | Fallunterscheidung an `contentType` | wenn Belege als JPG/PNG hochgeladen werden; heute ist alles PDF |

## Für den Bau

| | |
|---|---|
| Dateien | `src/ui/v3/entities/source-document/SourceDocumentPreview.tsx` plus Story |
| Barrel | Abschnitt `/* Beleg — … */`, Export `SourceDocumentPreview` |
| CSS | Präfix **`v2doc`**. `.v2doc__orig` gibt es bereits (0052) und trägt die Höhe `clamp(320px, 62vh, 900px)`. *(Bis 2026-09-07 kam `.v2doc__orig--lg` als zweite Stufe dazu; sie ist gestrichen und trägt jetzt dieselbe Höhe.)* |
| Reihenfolge | unabhängig von 0074. 0076 braucht sie |
| Nicht anfassen | `SourceDocumentDrawer.tsx` — dass er sein `<iframe>` gegen diese Komponente tauscht, ist Teil von 0076, nicht von 0075. Bis dahin stehen beide nebeneinander; das ist für die Dauer eines Arbeitspakets in Ordnung und wird dort aufgelöst |

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

- [ ] `url = null` zeigt einen **Satz**, keinen grauen Kasten in Dokumentform (Story `OhneVorschau`)
- [ ] Ohne `unavailableReason` steht der Standardsatz, nicht nichts (Story `OhneVorschau`)
- [ ] `excerpt` nennt Seitenbereich **und** Weg zum Original; ohne `excerpt` steht keine Zeile, kein „ganzes Dokument" (Story `Teilbeleg`)
- [x] ~~`height` verhält sich wie Zeile 6 der Schnittstelle~~ — die Prop ist gestrichen (Owner 2026-09-07); an ihre Stelle tritt das Kriterium unten
- [ ] Das `<iframe>` trägt ein sprechendes `title` mit dem Dateinamen (Story `Gefuellt`, im Browser geprüft)
- [ ] Ersetzt `BelegPreview` in allen drei App-Aufrufstellen ohne Funktionsverlust
- [ ] Tut bewusst nicht: laden, rendern, zoomen, blättern

## Abnahme

Geprüft gegen Spec und Code, ohne Chatverlauf. Stand `000f2ad` (seither
unverändert). Browser: Storybook auf `:6107`, alle sechs Stories aufgerufen
und im DOM gemessen.

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` (`tsc --noEmit`) ohne Ausgabe, 2026-09-05. `pnpm build` **nicht ausgeführt** — der Abnahme-Auftrag verbietet ihn (parallele Sitzungen); ersatzweise laden alle sechs Stories, `console-check.mjs` auf `--sizes` meldet 0 Konsolenmeldungen | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/source-document/SourceDocumentPreview.tsx` + `.stories.tsx`; Titel `v3/Entitäten/Beleg/SourceDocumentPreview` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | ein Export, `SourceDocumentPreview.tsx:24–29` mit `@when` und `@instead` (Drawer, Facts, Cell). `ExcerptLine` ist nicht exportiert. Kommentare durchgehend englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | in der Komponente kein Hex, kein px — die Höhe kommt über `.v2doc__orig` bzw. `.v2doc__orig--lg` aus `v3.css`; die Hex-Treffer der Story liegen im Data-URI, der das PDF ersetzt. Kein Zustand, also keine Achse nötig | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | sechs Stories, Namen wie in der Spec (`Gefuellt`, `OhneVorschau`, `Teilbeleg`, `Ausprägungen`, `Groessen`, `ImEinsatz`); lädt, Fehler und leer nach Filter sind in der Zustands-Tabelle der Spec begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Karte trägt **Rand ohne Schatten** (`1px solid`, `box-shadow: none`, Radius 6 px) — L2; der Leerfall ist ein Satz in `.v2empty--inline`, keine Fläche über 120 px mit eigenem Hintergrund (gemessen: null solche Kästen); Seitenzahl als Meta rechts im Kartenkopf, Text links; keine Versalien in der Komponente, keine Emoji; das `<iframe>` ist benannt (siehe unten) | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | sechs Story-IDs geöffnet, Höhen, Titel und Leertexte gemessen | ✓ |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `url = null` zeigt einen Satz, keinen grauen Kasten in Dokumentform | `--without-preview`: beide Karten ohne `iframe`, ohne `img`, ohne `svg`; der Körper ist `.v2empty .v2empty--inline` mit „Keine Vorschau" plus Satz. Suche nach Flächen > 120 px mit eigenem Hintergrund: keine | ✓ |
| Ohne `unavailableReason` steht der Standardsatz | zweite Karte derselben Story: „Für diesen Beleg gibt es keine Vorschau." — die erste trägt den mitgegebenen Grund („Das Format TIFF lässt sich nicht im Browser anzeigen. …") | ✓ |
| `excerpt` nennt Seitenbereich und Weg zum Original; ohne `excerpt` keine Zeile | `--excerpt`: obere Karte „Rechnung ǀ Seiten 5–7 aus Sammel-PDF vom 12.08.2026 ǀ 3 Seiten", der Weg als `<a href="#sammel-original">`; untere Karte „Rechnung ǀ 3 Seiten" — keine Ausschnitt-Zeile, kein „ganzes Dokument" | ✓ |
| `height` verhält sich wie Zeile 6 der Schnittstelle, beide Werte aus Tokens | `--sizes` bei 1440 × 900: `md` = `.v2doc__orig` 558 px (`clamp(320px, 62vh, 900px)`), `lg` = zusätzliche Klasse `.v2doc__orig--lg` 702 px (`clamp(420px, 78vh, 1100px)`). In der Komponente steht kein px, nur die Klassenwahl. **Notiz:** die beiden Werte sind `clamp()`-Literale in `v3.css`, keine benannten Tokens — dieselbe Form wie `.v2doc__orig` aus dem abgenommenen 0052 | ✓ |
| Das `<iframe>` trägt ein sprechendes `title` mit dem Dateinamen | `--filled`: `title="Vorschau von RE-4471-ACME.pdf"`; ohne `fileName` fällt es auf „Vorschau: `<Titel>`" zurück (`SourceDocumentPreview.tsx:74`). Auch im Drawer gemessen (`SourceDocumentFacts --in-use`): „Vorschau von RE-4471-ACME.pdf" | ✓ |
| Ersetzt `BelegPreview` in allen drei App-Aufrufstellen | dieses Repo ist das ausgelagerte Set; die Ablösung ist ein eigener Schritt (`docs/backlog/README.md`) | offen (App) |
| Tut bewusst nicht: laden, rendern, zoomen, blättern | die Komponente hat keinen Zustand, keinen Effekt und keinen Aufruf; kein `pdf.js`, keine Seitensteuerung, kein Zoom. `excerpt` beschreibt den Ausschnitt und schneidet nichts — die untere Karte in `--excerpt` zeigt dieselbe Datei ohne die Zeile | ✓ |

**Story-Deckung** (`spec-schreiben` §6)

| Frage | Nachweis | Ergebnis |
|---|---|---|
| Hat jede Prop ihre Story? | `url` (`Gefuellt`, `OhneVorschau`), `unavailableReason` (`OhneVorschau`), `title` (`Ausprägungen`), `pageCount` (`Gefuellt`), `excerpt` (`Teilbeleg`), `height` (`Groessen`) — dazu die **siebte** Prop `fileName`, die in allen sechs Stories gesetzt ist, aber in der Schnittstellen-Tabelle der Spec fehlt (siehe offene Punkte) | ✓ |
| Stimmt die Zahl mit der Ableitung? | 6 = 2 anwendbare Zustände + 2 Enum-Achsen (`height`, `title`) + 1 Layout-Fall (`excerpt`) + 1 im Einsatz; kein Callback, keine Rand-Story — die Komponente formatiert und kürzt nichts | ✓ |
| Ist jeder ausgeschlossene Zustand begründet? | lädt (Aufrufer zeigt `Skeleton`), Fehler (die Komponente ruft nichts), leer nach Filter (es wird nichts gefiltert) — alle drei in der Zustands-Tabelle der Spec | ✓ |

**Offene Punkte ohne Mangel-Status**

- Die Schnittstellen-Tabelle der Spec führt sechs Props, gebaut sind sieben:
  `fileName?: string | null` fehlt dort. Sie ist nicht erfunden, sondern von
  einem Abnahmekriterium verlangt („sprechendes `title` mit dem Dateinamen") —
  ohne sie wäre das Kriterium nicht erfüllbar. Nachzutragen ist die Zeile in
  der Spec, nicht die Prop im Code.
- `ImEinsatz` stellt die Vorschau in einen nackten `Drawer` statt in
  `SourceDocumentDrawer`. Das ist richtig so: 0075 darf den Drawer nicht
  anfassen (Zeile „Nicht anfassen"), und den echten Einsatz zeigt
  `SourceDocumentFacts --in-use` aus 0076.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: die
fehlende `fileName`-Zeile in der Schnittstellen-Tabelle; alle Kriterien
erfüllt, das App-Kriterium bleibt offen (App).

**Status-Nachtrag 2026-09-05.** Gebaut ist die Aufgabe seit `000f2ad`
(„pnpm typecheck und pnpm build grün, alle 21 Stories im Browser
angesehen. Abnahme steht aus und gehört einem anderen Agenten.") — der
Status stand seither fälschlich auf `in Arbeit`. Er sagt jetzt, was der
Fall ist: `Abnahme`.

## Owner-Entscheid 2026-09-07 — eine Höhe statt zweier

`height="md" | "lg"` ist **gestrichen**. Die Vorschau steht überall auf
`clamp(320px, 62vh, 900px)`.

**Warum.** `lg` war `clamp(420px, 78vh, 1100px)` — bei 1440 × 900 also
**702 px**. Wirksam wurde die Höhe dort, wo die Karte **einspaltig** steht,
also unterhalb der Container-Schwelle von 1180 px: im **Drawer** und in der
schmalen Karte. Dort begann „Belegdaten" unter der Falz. In der zweispaltigen
Karte und im View stand es schon vorher neben dem Original.

*(Die erste Fassung dieses Absatzes schrieb „795 px in der Karte, Belegdaten
bei y = 831" und nannte Karte und View als Tatort. Beides hat die Abnahme
widerlegt: 795 px sind 78 vh eines **1019 px** hohen Fensters — die Zahl aus
einer älteren 0071-Notiz, nicht aus 1440 × 900 —, und bewegt hat sich der
Drawer, nicht der View. Die Entscheidung bleibt richtig, die Begründung stand
am falschen Ort.)*

Gemessen, bei **1440 × 900**:

| Stelle | Vorschau vorher → nachher | „Belegdaten" vorher → nachher |
|---|---|---|
| `SourceDocumentCard`, zweispaltig | 702 → **558** | y = 20 → 20 (unverändert) |
| `SourceDocumentCard`, einspaltig | 702 → **558** | y = 831 → **687** |
| `SourceDocumentView` | 702 → **558** (y 338–896) | y = 267 → 267 (unverändert) |
| `SourceDocumentDrawer` | 702 → **558** (y 172–730) | y = **911** → **767** |

Und an den Rändern greift `clamp`: bei 400 px Fensterhöhe 320 px, bei 1600 und
2000 px je 900 px, bei 1013 px genau 628 px — an allen vier Stellen gleich.

Die Prop bleibt eine Version lang als `@deprecated` stehen und wird
**ignoriert**, damit kein Aufrufer bricht; die Klasse `.v2doc__orig--lg`
bleibt als leere Regel, damit ein alter Aufruf nichts Falsches bekommt.

**Neues Abnahmekriterium:**

- [ ] Die Vorschau ist an **jeder** Stelle gleich hoch, und „Belegdaten"
      beginnt bei 1440 × 900 im Bild (gemessen: 558 px; y = 267 im View,
      y = 767 im Drawer, y = 20 in der zweispaltigen Karte)
- [ ] `clamp` greift an beiden Rändern (gemessen: 320 px bei 400 px
      Fensterhöhe, 900 px bei 1600 und 2000)
- [ ] Die gestrichene Prop ist wirkungslos, und keine Story führt einen
      Unterschied vor, den es nicht gibt (Story `Grenzen`)

### Nach der Abnahme vom 2026-09-07

Die Abnahme hat den **Kern bestätigt** — eine Höhe überall, `clamp` an beiden
Rändern, die Prop wirklich wirkungslos, das Skelett so hoch wie das Original
(0,3 px Versatz), nichts nach unten geschoben — und die **Ränder der Änderung**
zurückgewiesen. Zu Recht:

- **Meine „Vorher"-Zahlen stimmten nicht.** 795 px sind 78 vh eines 1019 px
  hohen Fensters, nicht 1440 × 900; dort waren es **702**. Und bewegt hat sich
  nicht die zweispaltige Karte, sondern der **Drawer** (911 → 767) und die
  einspaltige Karte (831 → 687) — die Begründung stand am falschen Ort. Die
  Messtabelle oben trägt jetzt beide Spalten, vorher und nachher.
- **Die Story `Groessen` führte einen Unterschied vor, den es nicht mehr
  gibt** — zwei Vorschauen nebeneinander, beide 558 px, beschriftet „md" und
  „lg". Wer sie ansah, lernte das Gegenteil des Entscheids. Sie heißt jetzt
  `Grenzen` und zeigt, was tatsächlich variiert: die `clamp`-Ränder und der
  Fall ohne Original in derselben Höhe.
- **Die Spec beschrieb den gestrichenen Zustand an vier Stellen als geltend.**
  Schnittstelle, CSS-Abschnitt, Story-Tabelle und das alte Kriterium sind
  durchgestrichen bzw. ersetzt.
- **Die leere CSS-Regel hielt nicht, was ihr Kommentar versprach:** ein
  Element mit **nur** `.v2doc__orig--lg` bekam 24,8 px. Sie trägt jetzt
  dieselbe Höhe.
- `height="lg"` stand noch an der eigenen Aufrufstelle (`SourceDocumentCard`)
  und in einer Story — die Schonfrist gilt Aufrufern in der App, nicht uns.
  Die tote Destrukturierung in der Komponente ist weg.
- Der Status steht wieder auf **Abnahme**: eine Änderung nach der Abnahme
  macht die Aufgabe nicht fertig, sie macht sie prüfbar.

**Offen und benannt (H1 der Abnahme):** „Ränge 1–4 ohne Scrollen" gilt erst ab
**≈ 890 px Fensterhöhe** — bei 1440 × 900 bleiben 4 px Luft, bei 768 px sind
46 px des Originals und 22 px der Faktenspalte unter der Falz. Das gehört in
0071 als Bedingung des Kriteriums, nicht hierher als weitere Höhenregel; und
die zweite Hälfte davon (**M5**: im Drawer stehen die Werte nie neben dem
Original, weil die Karte dort 1060 px breit ist und die Zwei-Spalten-Schwelle
bei 1180 liegt) ist eine Frage an den Drawer, nicht an die Vorschau.

**M5 erledigt (2026-09-07, aus der 0071-Nacharbeit).** Die Zwei-Spalten-Schwelle
der Karte lag bei 1.180 px und war gegen die Fixture der Story gerechnet; sie
steht jetzt bei **960 px** — der Summe der Minima (560 Original, 384 Fakten,
16 Rinne). Gemessen in `SourceDocumentDrawer` → `Geoeffnet`: die Karte ist
1.060 px breit und zeigt `560 / 484`, kein Überlauf. Die Werte stehen im
Drawer also neben dem Original. Der Grund für die Regel bleibt derselbe wie
im View — sie zählt die Minima, nicht die Breite einer Story.

## Nach der Abnahme — die senkrechte Schwelle berichtigt (2026-09-07)

**Geändert im Auftrag des Owners, designsystem-f0.**

Die Schwelle „Ränge 1–4 ohne Scrollen gilt ab ≈ 890 px Fensterhöhe" (Nachtrag
H1 dieser Datei, Kriterium 9 in 0071) war im **Story-Rahmen** gerechnet. Auf
der Seite gilt:

> Die ganze Karte steht ab ≈ 1.210 px Fensterhöhe ohne Scrollen; bei
> 1440 × 900 stehen Rang 1, 3 und 4 über der Falz, die unteren 64 px der
> Vorschau darunter.

Gemessen in der `AppShell` (Story `SourceDocumentView` → `InUse`):
`.app__main` scrollt 117 px, der Vorschaurahmen läuft von y = 406 bis 964.

Die Zahl steht hier, weil hier die Höhe gesetzt wird
(`clamp(320px, 62vh, 900px)`). Sie ändert an der Höhe nichts — sie sagt nur,
was sie auf der Seite bedeutet. Dieselbe Berichtigung steht in 0071 beim
Kriterium selbst.
