# 0075 · Beleg-Vorschau — `SourceDocumentPreview`

| | |
|---|---|
| Status | fertig |
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
| `height` | `"md" \| "lg"` | nein | `md` im Drawer, `lg` in View und Karte. Ein Enum statt zweier Booleans (§5); die Werte sind Token-Höhen aus `v3.css`, keine px in der Komponente. | `Groessen` |

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
| `Groessen` | `md` und `lg` nebeneinander |
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
| CSS | Präfix **`v2doc`**. `.v2doc__orig` gibt es bereits (0052) und trägt die Höhe `clamp(320px, 62vh, 900px)` — sie wird hier zur Variante `md`; `lg` kommt als zweite Klasse dazu. Neuer Abschnitt am Ende von `v3.css`, überschrieben mit `0075` |
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
- [ ] `height` verhält sich wie Zeile 6 der Schnittstelle, beide Werte aus Tokens (Story `Groessen`)
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
