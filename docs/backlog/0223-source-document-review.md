# 0223 · SourceDocumentReview — ein Beleg prüfen: Original links, Entscheidung rechts

| | |
|---|---|
| Status | Abnahme (Nachprüfung) · vorher: in Arbeit — nicht abgenommen 2026-10-24 (fremde Abnahme, Stand `51db640`; Mängel 1–2) · Hashes: `51db640` (Bau) und `b2b84e5` (Nachbesserung) waren lokal und sind vor dem Push in `c848b6d` zusammengefasst (Stories mit fiktiven Daten); `51db640^` = `d3e91ff` |
| Stufe | neu `entities/source-document/SourceDocumentReview.tsx` · erweitert `patterns/ChoicePrompt` (Notizfeld je Option) · erweitert `entities/source-document/source-document-columns.tsx` (drei Spalten, ein Satz) |
| Klassen-Test | Ansicht: nein (Beleg, Prüfgrund). Notizfeld je Option: ja (jede Auswahl, deren eine Antwort einen Satz braucht) |
| Quelle | Auftrag llcto 2026-10-24 (Owner), Paket 3 · Wireframe `ludwig/app/reports/2026-10-24_abnahme-wizard-wireframe.html` (Schritt Belege: Übersicht und „Beleg 1 von 5") · Konzept `simple-batch-review.md` §12 „Belege", Owner-Entscheide 1 und 2 der zweiten Runde |
| Regel (spec-schreiben §3) | Ansicht: 5 — neue Entitäts-Form (die Prüfung **eines** Belegs mit Entscheidung; Drawer, Karte und Detail tragen keine Entscheidung). Notizfeld: 2 — `ChoicePrompt` deckt die Frage zu vier Fünfteln. Tabelle: 1/2 — `sourceDocumentColumns` deckt sie, drei Spalten fehlen |
| Ersetzt | `batch-review/ui/DocumentReviewSingle.tsx` (Original, Karte mit Badges, `DocumentReviewProposalBody` mit Wahl-Knöpfen) und die Tabelle in `StepDocumentReview.tsx` (handgebaute `Table` mit fünf Spalten) |
| Spec von / am | designsystem (Claude), 2026-10-24 |

## Ziel

Ludwig hat ein paar Belege eines Stapels nicht gebucht oder für nicht
buchungsrelevant gehalten. Die Buchhalterin sieht jeden davon einzeln: links
das Original, rechts warum Ludwig ihn nicht gebucht hat und die Frage
„Wohin gehört dieser Beleg?" mit den Entscheidungen samt Unterzeile — eine
davon „empfohlen" und vorgewählt, mit „Warum empfohlen" darunter. Sie
übernimmt die Empfehlung mit einem Klick oder überstimmt sie; wo die
Entscheidung einen Satz braucht (mit Kommentar verarbeiten, beim Mandanten
klären), öffnet sich ein Feld. Davor steht eine Tabelle aller zu prüfenden
Belege mit Grund, Empfehlung und Entscheidung. Heute: Wahl-Knöpfe ohne
Unterzeile in einer Karte mit Badges, die Empfehlung als erste Wahl ohne
Wort, die Tabelle von Hand gebaut.

## Einordnung

- **Wiederverwenden:** `SourceDocumentPreview` (Original, links, unverändert),
  `RecordPager` („Beleg 1 von 5", Zurück/Weiter mit J/K, „‹ Übersicht" —
  über der Ansicht, vom Aufrufer gesetzt wie heute), `ChoicePrompt` mit
  Zeilen-Optionen, `hint` als Unterzeile und `recommended` (Nachtrag 0214,
  2026-10-24) für die Entscheidung, `StatusBadge` mit der Achse
  `document_review_reason` für den Grund, `sourceDocumentColumns` +
  `SourceDocumentList`/`DataTable` für die Übersicht.
- **Neu, weil:** keine vorhandene Form des Belegs trägt eine Entscheidung
  (Regel 5). Die Ansicht hat einen eigenen Job und eine feste Ordnung
  (Original links, Grund → Frage → Entscheidung rechts), die auf jedem
  Prüfschirm gleich sein soll — als Markup an der Aufrufstelle würde sie
  beim zweiten Schirm auseinanderlaufen. Zweite Verwendung absehbar: der
  Beleg-Schritt der Expertensicht (`DocumentReviewSingle`).
- **Erweitert:** `ChoiceOption.note` — eine Option, deren Wahl einen Satz
  braucht. Dieselbe Entscheidung hat in der App schon heute die Regel
  `choiceNeedsNote` (zurück an Ludwig, neue Datei anfordern). Drei Spalten
  in `sourceDocumentColumns` statt einer eigenen Tabelle.
- **Zuschnitt:** eine Datei für die Ansicht, keine Familie. Der Kopf mit dem
  Pager bleibt draußen (der Aufrufer hält Position und Weg, wie in der
  Einzelsicht von Schritt 3). Die Entscheidung ist an `document.id`
  geschlüsselt: blättert der Pager unter derselben Ansicht weiter, beginnt
  der nächste Beleg mit seiner Empfehlung, nicht mit der Wahl des vorigen.
- **Setzt auf:** `ChoicePrompt`, `Callout`, `StatusBadge`, `Amount`, `Time`,
  `SourceDocumentPreview` (über den Slot).

## Schnittstelle

### `SourceDocumentReview`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `document` | `SourceDocumentVM` | ja | Gegenpart, Belegdatum, Betrag für die Themenzeile; `reviewReason` für den Grund | `Filled` |
| `preview` | `ReactNode` | ja | die linke Spalte — in der Regel `SourceDocumentPreview`; Laden und Fehler des Originals hält der Aufrufer | `Filled`, `PreviewLoading` |
| `reasonNote` | `string \| null` | nein | Ludwigs Notiz zum Grund (`review_note`), ein bis drei Sätze | `Filled` |
| `options` | `ChoiceOption[]` | ja | die Entscheidungen mit `hint` (Unterzeile), höchstens eine `recommended`, `note` wo ein Satz nötig ist | `Filled` |
| `recommendation` | `string \| null` | nein | das Warum der empfohlenen Entscheidung, ein Satz — „Warum empfohlen: …" unter den Optionen | `Filled` |
| `onDecide` | `(answer: ChoiceAnswer) => Promise<void>` | ja | die gewählte Entscheidung, `text` = die Notiz der Option | `Interactive` |
| `submitLabel` | `string` | nein, Standard „Entscheiden und weiter" | Wort des Hauptknopfs; am letzten Beleg „Entscheiden und zur Übersicht" | `Interactive` |
| `pending` | `boolean` | nein | Knopf zeigt „Sende …" | `States` |
| `error` | `string` | nein | Fehler am Knopf, Wahl und Notiz bleiben | `States` |

Rechts, von oben: Themenzeile klein in Grau („Serverhaus Nord GmbH ·
12.01.2026 · −4,76 €" — Gegenpart, `Time`, `Amount`; fehlende Teile fallen
weg) · Überschrift **„Wohin gehört dieser Beleg?"** · Callout (weich)
„**Warum Ludwig nicht gebucht hat:** [Grund aus der Registry]" und darunter
`reasonNote` · die Optionen (Zeilen, Unterzeile, „empfohlen") · „Warum
empfohlen: …" · Notizfeld der gewählten Option · Hauptknopf, links unten
wie in jedem `ChoicePrompt` (eine Stelle für den Knopf im ganzen Set).

Ohne `reviewReason` und ohne `reasonNote` entfällt der Callout. Ohne
Empfehlung kein „Warum empfohlen" und keine Vorauswahl.

### `ChoicePrompt` — neu

| Feld | Typ | Bedeutung | Nachweis |
|---|---|---|---|
| `ChoiceOption.note` | `{ label: string; placeholder?: string; required?: boolean }` (optional) | ist diese Option gewählt, steht unter den Optionen ein Feld mit diesem Wort; `required` sperrt den Knopf ohne Text („Bitte ergänzen Sie den Text.") | `ChoicePrompt/OptionNote`, `SourceDocumentReview/Interactive` |

Das Feld teilt sich den Text mit dem Freitext: wer die Option wechselt,
verliert die Notiz nicht. Steht neben einer Option mit `note` auch
`freeText`, gewinnt beim Wählen dieser Option die Notiz (ein Feld, nicht
zwei).

### `sourceDocumentColumns` — drei Spalten, ein Satz

| Spalte | Kopf | Zelle | Quelle |
|---|---|---|---|
| `reviewReason` | „Prüfgrund" mit (i) der Achse | `StatusBadge` `document_review_reason`, leer ohne Grund; Spur `minmax(196px, 1fr)` — das längste Wort der Achse steht 150 px breit im Badge und lief bei 150 über (beim Bau gemessen) | `document.reviewReason` |
| `recommendation` | „Empfehlung" | Wort der empfohlenen Entscheidung | Option `review` |
| `decision` | „Entscheidung" | Wort der getroffenen Entscheidung, sonst „offen" in Grau | Option `review` |

Neue Option `review?: (document) => { recommended: string | null; decided: string | null } | null`
— die Wörter kommen aus dem Wahl-Modell der App (`choiceLabel`), das Set
erfindet keine. Neuer Satz `DOCUMENT_REVIEW_VIEW = ["document",
"documentDate", "amount", "reviewReason", "recommendation", "decision"]`.
„Prüfgrund" ist das Wort der Satz-Spalte aus 0218 (`ReviewReasonCell`) —
dieselbe Frage, dasselbe Wort; der Wireframe sagt „Warum Ludwig nicht
gebucht hat", die Ansicht rechts sagt es so im Callout.

Die Zählung darüber (eingegangen · gebucht · wartet auf Rückfrage · zu
prüfen) ist **keine Komponente**: `FieldList` mit rechtsbündigen Zahlen in
einer `Card` — Owner-Regel „Liste oder Tabelle, nie Kacheln".

Was die Ansicht **nicht** kann (bewusst): sie lädt das Original nicht und
blättert nicht (Pager außen); sie kennt das Wahl-Modell der App nicht
(Optionen kommen fertig mit Wort, Unterzeile und Empfehlung); sie
entscheidet nicht, welche Option eine Notiz braucht (`note` setzt der
Aufrufer); sie zeigt keine extrahierten Belegdaten (das ist der Drawer, ein
Klick auf das Original oder „Vollständige Belegansicht" außen).

## Verhalten

- **Client-Component** (Zustand liegt in `ChoicePrompt`).
- **Layout:** zwei Spalten gleicher Breite, oben bündig; die rechte ist eine
  Karte. Bei 1280 px Innenbreite mit Seitenleiste ohne Querlauf; das Original
  behält seine Höhe aus `SourceDocumentPreview`.
- **Tastatur:** Pfeiltasten in den Optionen, Tab ins Notizfeld, `Strg+Enter`
  entscheidet (wie `ChoicePrompt`), J/K blättert (Pager außen).
- **Zustände:** gefüllt; lädt (`pending`); Fehler (`error`). Das Original
  lädt getrennt (Slot). Leer gibt es nicht — ohne Beleg zeigt der Aufrufer
  den Pager mit „Dieser Beleg ist nicht mehr offen" (heute schon so).
  Übersicht: leer = `EmptyState` „Jeder Beleg ist verarbeitet, zugeordnet
  oder gesichtet." mit Zahl (Leertext „erledigt").

## Stories

`v3/Entitäten/Beleg/SourceDocumentReview`, `v3/Patterns/Prüfen/ChoicePrompt`.

| Story | Beweist |
|---|---|
| `Filled` | Serverhaus-Gutschrift −4,76 €: Grund „Werte fehlen" mit Notiz, sieben Entscheidungen mit Unterzeile (Konzept, Owner-Entscheid 2), „Mit Kommentar noch verarbeiten" empfohlen und vorgewählt, Warum darunter, Notizfeld offen; mit `RecordPager` „Beleg 1 von 5" darüber |
| `Interactive` | Rundlauf: andere Entscheidung → Feld wechselt; „Beim Mandanten klären" ohne Text gesperrt mit Satz; entscheiden → nächster Beleg |
| `WithoutRecommendation` | Beleg ohne Empfehlung und ohne Notiz von Ludwig: keine Vorauswahl, Knopf gesperrt mit Satz |
| `States` | `pending` und `error` nebeneinander |
| `PreviewLoading` | Original lädt bzw. ist nicht verfügbar (Satz statt grauer Fläche) |
| `ChoicePrompt/OptionNote` | Option mit Pflicht-Notiz, Wechsel behält den Text |
| `Overview` | `DataTable` mit `DOCUMENT_REVIEW_VIEW`, fünf Belege, zwei entschieden, drei „offen"; Zählung als `FieldList` in einer `Card` darüber (`SourceDocumentList` hat feste Spaltensätze und trägt diesen nicht) |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Extrahierte Belegdaten unter der Entscheidung | `facts?: ReactNode` | die Buchhalterin öffnet für jede Entscheidung den Drawer |
| Entscheidung zurücknehmen | `onUndo?: () => Promise<void>` | die App kann eine Belegentscheidung aufheben |

## Befunde an die App

- **L-365** `SourceDocumentVM` trägt `review_note` nicht — Ludwigs Notiz zum
  Prüfgrund muss als `reasonNote` daneben gereicht werden.
- **L-366** Der Prüfgrund `not_bookkeeping` („Kein Buchhaltungsbeleg") steht
  in der App-Registry (`ui/status/status-registry.ts`), im Spiegel fehlt er
  noch — kommt mit dem nächsten `sync:ludwig`. Bis dahin zeigt die Story
  einen gespiegelten Grund.

## Abnahmekriterien

Fest (gilt immer):

- [x] `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün
- [x] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [x] Code englisch; `@when`/`@instead` an jedem Export
- [x] Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry
- [x] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [x] Prüfliste `design-guidelines.md` §9 durchgegangen
- [x] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [x] Original links, Entscheidung rechts, oben bündig, bei 1280 px Innenbreite mit Seitenleiste ohne Querlauf (Story `Filled`, gemessen)
- [x] Rechts in der Reihenfolge Themenzeile · „Wohin gehört dieser Beleg?" · Grund mit Wort aus der Registry und Notiz · Optionen mit Unterzeile · „Warum empfohlen" · Notizfeld · Knopf (Story `Filled`)
- [x] Die empfohlene Option ist vorgewählt und trägt „empfohlen"; ohne Empfehlung keine Vorauswahl (Stories `Filled`, `WithoutRecommendation`)
- [x] `ChoiceOption.note`: Feld erscheint nur bei gewählter Option mit `note`, mit deren Wort; `required` sperrt mit Satz; Optionswechsel behält den Text (Stories `ChoicePrompt/OptionNote`, `Interactive`)
- [ ] `onDecide` bekommt `{ optionId, text }` (Story `Interactive`)
- [x] `DOCUMENT_REVIEW_VIEW`: Spalten Beleg · Betrag · Belegdatum · Prüfgrund · Empfehlung · Entscheidung (Katalogordnung, owner E2: ein Satz wählt aus, ordnet nicht um); „offen" grau ohne Entscheidung; kein Badge ragt über seine Spur (Story `Overview`, gemessen)
- [x] Trefferfläche der Optionen ≥ 40 px hoch, Kontrast der Unterzeile ≥ 4,5:1 auf Weiß und auf gewählter Zeile (gemessen)
- [ ] offen (App): ersetzt `DocumentReviewSingle` und die Tabelle in `StepDocumentReview` ohne Funktionsverlust

## Gebaut 2026-10-24

`SourceDocumentReview.tsx` + Stories (`Filled`, `Interactive`,
`WithoutRecommendation`, `States`, `PreviewLoading`, `Overview`);
`ChoiceOption.note` in `ChoicePrompt.tsx` + Story `OptionNote`; Spalten
`reviewReason`, `recommendation`, `decision`, Option `review`, Satz
`DOCUMENT_REVIEW_VIEW` in `source-document-columns.tsx`; Barrel. Gemessen
(statischer Build, 1042 px): zwei Spalten à 495 px, oben bündig, kein
Querlauf; Optionszeilen ≥ 61 px; Unterzeile Gewicht 400 auch in der
gewählten Zeile (vorher fett mitgezogen — beim Messen gefunden), Kontrast
4,88:1 auf Weiß, 4,52:1 auf der gewählten Zeile; Übersicht ohne
überlaufendes Badge.

## Abnahme

### Fremde Abnahme 2026-10-24

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung, nicht der Bauende). Stand
`51db640`, Arbeitsbaum sauber. Gelesen: `CLAUDE.md`, Skill `v3-komponente`
(Abnahme), diese Spec, der Bau in `git show 51db640` —
`SourceDocumentReview.tsx` und seine Stories, `ChoicePrompt.tsx` und
`ChoicePrompt.stories.tsx`, `source-document-columns.tsx`, die neuen Regeln
in `v3.css`, `index.ts` —, dazu die Achse `document_review_reason` im
gespiegelten `status-registry.ts`, `befunde-app.md` (L-365, L-366,
Abschnitt E). Gemessen mit Playwright am statischen Build auf 6199, Fenster
1042 px (Inhalt 1010 px, wie 1280 px mit Seitenleiste), Gegenprobe 1480 px;
Maße mit `getBoundingClientRect`, Farben aus `getComputedStyle`, Kontrast
nach WCAG gerechnet; Rundläufe mit echten Klicks und Tastendrücken. Befehle
selbst gelaufen. Bildschirmfotos: `.playwright-mcp/0223-abnahme-filled-1042.png`,
`0223-abnahme-states.png`, `0223-abnahme-preview-loading.png`,
`0223-abnahme-overview-1042.png`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `typecheck` Exit 0; `check:type` Exit 0, `--test` Exit 0; `pnpm build -o` ins Scratchpad Exit 0, Index führt die sechs `sourcedocumentreview--*` und `choiceprompt--option-note`. `check:language`, `check:when`, `check:icons`, `check:contrast` Exit 0 samt `--test`; `check:classes` dieselben vier Altfälle wie auf `51db640^` | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/source-document/SourceDocumentReview.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Beleg/SourceDocumentReview`; Export im Barrel neben `SourceDocumentPreview`; `DOCUMENT_REVIEW_VIEW` im Barrel | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `SourceDocumentReview` mit `@when` „Deciding what happens to one document Ludwig did not book …" und `@instead` (Drawer, Liste mit `DOCUMENT_REVIEW_VIEW`, `ClarificationCard`); `DOCUMENT_REVIEW_VIEW` mit JSDoc wie die übrigen Sätze; Klassen `v3docreview*`; `check:when` grün | ✓ |
| Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry | Komponente ohne Hex und px; Spurbreiten der drei Spalten als `minmax(…px, …fr)` wie jede Spalte des Katalogs; Grund über `StatusBadge axis="document_review_reason"` (Wörter „Werte fehlen", „Keine automatische Auslese", „Belegart unbekannt" aus der Registry). Die Story-Fixtur des Originals trägt Hex in einem `data:`-Dokument, wie `SourceDocumentPreview.stories.tsx` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `--filled`, `--interactive`, `--without-recommendation`, `--states`, `--preview-loading`, `--overview`, `choiceprompt--option-note` im Index und im Browser ohne Konsolenmeldung; leer der Ansicht begründet (Aufrufer). `Filled` zeigt aber nicht den Beleg, den die Tabelle nennt (Mangel 2); der Leerzustand der Übersicht hat keine Story (Hinweis 3) | ✓ (mit Mangel 2) |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, Beträge rechts mit `tnum` in der Übersicht; Grund-Badge im Ton der Registry (Warnung) mit Wort; rechte Spalte eine Karte mit Rand (1 px, keine Schatten); `h2` „Wohin gehört dieser Beleg?" mit `aria-labelledby` an der `section`; Zeilen-Optionen ganz klickbar mit Hover (`--color-bg-soft`); Texte in Sie-Form, Knopf im Imperativ mit Folge („Entscheiden und weiter") | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle sieben Stories bei 1042 px, `Filled` und `Overview` auch bei 1480 px | ✓ |
| Original links, Entscheidung rechts, oben bündig, bei 1280 px Innenbreite mit Seitenleiste ohne Querlauf (Story `Filled`, gemessen) | 1042er Fenster: Raster 1010 px, Original 495 px (x 16), Entscheidung 495 px (x 531), beide `top` 56; Seite `scrollWidth` 1042. Original behält seine Höhe (712,7 px), die rechte Karte wächst (1041 px). 1480: 580 + 580 px bei `maxWidth` 1180 | ✓ |
| Rechts in der Reihenfolge Themenzeile · „Wohin gehört dieser Beleg?" · Grund mit Wort aus der Registry und Notiz · Optionen mit Unterzeile · „Warum empfohlen" · Notizfeld · Knopf (Story `Filled`) | Kinder der Karte: `p.v3docreview__topic` „Datenbrise Inc. · 31.12.2025 · 25,00 $" → `h2` → Callout „Warum Ludwig nicht gebucht hat: [Werte fehlen]" + Notiz → Antwortfläche: Optionen „Entscheidung" (sieben Zeilen mit Unterzeile) → „Warum empfohlen: …" → Feld „Kommentar an Ludwig *" → Knopf links unten. `--without-recommendation` ohne Grund und Notiz: kein Callout | ✓ |
| Die empfohlene Option ist vorgewählt und trägt „empfohlen"; ohne Empfehlung keine Vorauswahl (Stories `Filled`, `WithoutRecommendation`) | `--filled`: „Mit Kommentar noch verarbeiten empfohlen" `checked`; `--without-recommendation`: keine Zeile gewählt, „empfohlen" kommt nicht vor, kein „Warum empfohlen", Knopf gesperrt mit „Wählen Sie eine Antwort oder schreiben Sie eine." | ✓ |
| `ChoiceOption.note`: Feld erscheint nur bei gewählter Option mit `note`, mit deren Wort; `required` sperrt mit Satz; Optionswechsel behält den Text (Stories `ChoicePrompt/OptionNote`, `Interactive`) | `--option-note`: ohne Wahl kein Feld; „Mit Kommentar …" → „Kommentar an Ludwig *", Knopf gesperrt, „Bitte ergänzen Sie den Text."; Text getippt → frei; „Beim Mandanten klären" → „Notiz für den Mandanten *" mit demselben Text; „Archivieren" → kein Feld. Der Fokus bleibt beim Wählen am Radio (kein Sprung ins Feld). `--interactive` ebenso | ✓ |
| `onDecide` bekommt `{ optionId, text }` (Story `Interactive`) | Form stimmt: „Beim Mandanten klären" mit Notiz, `Strg+Enter` am Radio → „Datenbrise Inc.: Beim Mandanten klären · „Bitte die Rechnung …"", danach der nächste Beleg mit **seiner** Vorauswahl („Archivieren") und leerem Feld (`key={d.id}`). Aber: Kommentar zu „Mit Kommentar noch verarbeiten" getippt, dann „In den nächsten Zeitraum" gewählt (kein Feld sichtbar) und entschieden → „Datenbrise Inc.: In den nächsten Zeitraum · „Leistungszeitraum Dezember 2025"" — der unsichtbare Text geht mit (Mangel 1) | ✗ |
| `DOCUMENT_REVIEW_VIEW`: Spalten Beleg · Betrag · Belegdatum · Prüfgrund · Empfehlung · Entscheidung (Katalogordnung); „offen" grau ohne Entscheidung; kein Badge ragt über seine Spur (Story `Overview`, gemessen) | Satz `source-document-columns.tsx:125` Zeichen für Zeichen wie die Spec; Köpfe in Katalogordnung „Beleg · Betrag · Belegdatum · Prüfgrund (i) · Empfehlung · Entscheidung"; „offen" `#5C5C5C` (6,69:1) in drei Zeilen; Spur Prüfgrund bei 1010 und 1448 px je 196 px, längstes Badge „Keine automatische Auslese" endet 23 px vor der Zellkante. Dabei gesehen: der Belegname wird hart abgeschnitten (Hinweis 2) | ✓ |
| Trefferfläche der Optionen ≥ 40 px hoch, Kontrast der Unterzeile ≥ 4,5:1 auf Weiß und auf gewählter Zeile (gemessen) | Zeilen 61,3 px (zweizeilige 80,7 px), ganze Zeile Ziel; Unterzeile 12,5 px, Gewicht 400 auch in der gewählten Zeile, `#717171`: 4,88:1 auf Weiß, 4,52:1 auf `accent-50` (gewählt), 4,51:1 im Hover (`bg-soft`) | ✓ |
| offen (App): ersetzt `DocumentReviewSingle` und die Tabelle in `StepDocumentReview` ohne Funktionsverlust | in `befunde-app.md` E eingetragen, L-365 und L-366 im Register | offen (App) |
| Zusatz: Schnittstelle Zeichen für Zeichen | neun Props wie die Tabelle (`document: SourceDocumentVM`, `preview: ReactNode`, `reasonNote?: string \| null`, `options: ChoiceOption[]`, `recommendation?: string \| null`, `onDecide: (answer: ChoiceAnswer) => Promise<void>`, `submitLabel` Vorgabe „Entscheiden und weiter", `pending?`, `error?`); `ChoiceOption.note?: { label: string; placeholder?: string; required?: boolean }`; Spalten `reviewReason` („Prüfgrund", (i) der Achse, `minmax(196px, 1fr)`), `recommendation` („Empfehlung"), `decision` („Entscheidung", sonst „offen"), Option `review?: (document) => { recommended, decided } \| null` — alle wie die Tabellen | ✓ |
| Zusatz: Zustände | `--states`: `pending` → „Sende …", Optionen und Feld gesperrt; `error` → roter Callout „Die Entscheidung wurde nicht gespeichert. …", Wahl bleibt. `--preview-loading`: „Lade Beleg …" bzw. „Keine Vorschau · Die Datei liegt nur als Zweitschrift …" statt grauer Fläche. Tastatur `--filled`: Pager → Original → Optionen (eine Gruppe, Pfeiltasten) → Feld; J/K blättert im `--interactive` | ✓ |
| Zusatz: Story `Filled` zeigt, was die Tabelle sagt | s. Mangel 2 | ✗ |

### Mängel

1. **Unsichtbare Notiz geht mit einer Option ohne Notiz mit.**
   `ChoicePrompt.tsx:127` (`send`) und `:201` (Knopf) schicken
   `text.trim() || undefined` immer — auch wenn die gewählte Option kein
   `note` hat und kein Feld zu sehen ist. Gemessen in `--interactive` (s.
   Tabelle) und in `choiceprompt--option-note` („Entschieden: archive ·
   Bitte mit Leistungszeitraum Dezember buchen."). Die Spec sagt
   „`text` = die Notiz der Option", die JSDoc von `onDecide` ebenso; in der
   App käme ein Kommentar an eine Entscheidung, die keinen trägt und den die
   Buchhalterin nicht sieht. Vorschlag: nur senden, was sichtbar ist —
   `text: field ? text.trim() || undefined : undefined` an beiden Stellen; den
   Text im Zustand behalten, damit der Rückweg zur Option ihn wiederfindet.
   Betrifft dieselbe Stelle für `freeText.toggle` (0222): ein vorbelegter,
   aber zugeklappter Freitext ginge sonst ebenso unsichtbar mit.
2. **Story `Filled` zeigt einen anderen Beleg als die Spec.** Die Tabelle
   „Stories" sagt „Serverhaus-Gutschrift −4,76 €: Grund „Werte fehlen" mit
   Notiz …"; `Filled` nimmt `ITEMS[0]` (Datenbrise, 25,00 $, Stories `:175`),
   die Serverhaus-Gutschrift steht nur in `States` (`:261`). Vorschlag:
   `Filled` auf `ITEMS[4]` stellen (zeigt dann auch die negative Zahl in der
   Themenzeile) oder die Zeile der Spec an die Story angleichen.

### Hinweise (nicht blockierend)

1. **Systemweite Änderung an `RadioGroup` ohne Nachtrag.** `v3.css:2258`
   setzt `.v2radioline__hint` auf Gewicht 400 — das gilt für jede
   `RadioGroup` mit Unterzeile in einer gewählten Zeile, nicht nur hier
   (vorher erbte die Unterzeile die 600 der gewählten Zeile). Richtig nach
   „empfohlen" (0214), aber eine Änderung am Primitive: in 0017 als Nachtrag
   mit Datum festhalten.
2. **Belegname in der Übersicht hart abgeschnitten.** In `--overview` bei
   1010 px bekommt die Spalte `document` 192 px; „Lindner Elektro
   Distribution International GmbH" endet sichtbar mitten im Wort ohne Auslassungszeichen
   (`.v2doc__keyname` ist `inline`, `text-overflow` greift nicht; der volle
   Name steht im `title`). Vermutlich vorbestehend in der Zelle, sichtbar
   gemacht durch die drei neuen Spalten. Vorschlag: den Namen als Block mit
   Ellipse setzen oder `recommendation`/`decision` schmaler beginnen lassen.
3. **Leerzustand der Übersicht ohne Story.** „Verhalten" nennt
   `EmptyState` „Jeder Beleg ist verarbeitet, zugeordnet oder gesichtet." mit
   Zahl (Leertext „erledigt"); `Overview` übergibt nur den Titel, keine Story
   zeigt ihn, die Zahl fehlt.
4. **Unterzeile im Hover knapp.** 4,51:1 auf `bg-soft` — besteht, aber ohne
   Luft; wer die Farbe von `--color-text-subtle` anfasst, fällt hier zuerst
   durch.
5. **Vorbestehend, nicht aus diesem Bau:** die Themenzeile schreibt
   „-4,76 €" mit U+002D, die Spec „−4,76 €" — `Amount`/`AmountCell`
   formatieren im ganzen Set so.
6. **Querverweis:** die geänderte Satzwahl in `ChoicePrompt` bei Pflichtfeld
   ohne Optionen steht als Mangel 2 in 0222.

Vier Linsen: **Sprache** — „Wohin gehört dieser Beleg?", „Warum Ludwig nicht
gebucht hat:", „Warum empfohlen:", „Entscheiden und weiter", „Prüfgrund" wie
in 0218, „offen" als Wort statt leerer Zelle ✓. **Bedienung** — Optionen
61 px hoch und ganz klickbar, Pfeiltasten, `Strg+Enter` vom Radio aus,
Pflichtnotiz mit Satz neben dem Knopf, J/K über den Pager, Fokus bleibt beim
Wählen am Radio ✓. **Logik** — Entscheidung je Beleg geschlüsselt, Optionen
und Empfehlung kommen fertig vom Aufrufer, das Original als Slot; aber die
Antwort enthält Text, den niemand sieht (M1) ✗. **Darstellung** — zwei gleich
breite Spalten oben bündig, die rechte eine Karte mit Rand, Grund als Badge
mit Wort im Warnton, Unterzeile leise (400) auch in der gewählten Zeile ✓.
Vier-Wochen-Test: die vorgewählte Zeile mit „empfohlen" und das Warum direkt
darunter tragen die erste richtige Handlung ohne Farbe und ohne Taste.

Abgenommen von / am: Claude (fremde Abnahme, nicht der Bauende), 2026-10-24,
Stand `51db640` · **Nicht abgenommen.** Offene Punkte: Mängel 1–2,
Hinweise 1–4; die Ablösung von `DocumentReviewSingle` und der Tabelle in
`StepDocumentReview` ist offen (App).

## Nachbesserung 2026-10-24 (nach der fremden Abnahme)

| Mangel | Behoben |
|---|---|
| M1 Ein Notiztext wurde mitgesendet, obwohl die gewählte Option kein Feld zeigt | `ChoicePrompt` sendet nur, was in einem **sichtbaren** Feld steht (`typed = field ? text.trim() : ""`), in `send()` und am Knopf; auch die Sperrlogik liest `typed`. Der Text bleibt im Zustand — wer zurück zur Option mit Feld wechselt, findet ihn wieder |
| M2 Story `Filled` zeigte Datenbrise statt der Serverhaus-Gutschrift der Spec | Reihenfolge der Belege wie im Wireframe, Serverhaus zuerst; `Filled` zeigt „Serverhaus Nord GmbH · 12.01.2026 · −4,76 €" |

Hinweis „Belegname in der Übersicht hart abgeschnitten (,Internation')":
liegt in der vorhandenen Spalte `document` (`v3docrow__name`, vor diesem
Commit, alle Belegtabellen) — eigene Aufgabe auf der Todo-Liste, nicht hier.
Hinweis zur Unterzeile: Nachtrag in 0017 geschrieben. Status zurück auf
Abnahme, Nachprüfung durch den Abnehmenden.
