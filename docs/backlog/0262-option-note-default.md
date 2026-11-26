# 0262 · Vorbelegte Notiz an einer Option (`ChoiceOption.note.defaultValue`)

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` (`ChoicePrompt`), Erweiterung; keine neue Komponente |
| Klassen-Test | ja: eine Antwort, die einen Satz verlangt und ihn schon mitbringt, gibt es in jedem Prüfprozess |
| Quelle | Anfrage ll-ceo 2026-11-26: „Beim Mandanten klären“ in der Belegprüfung mit vorbelegter Notiz aus einer doccore-Meldung („Es liegen 4 von 6 Seiten vor, bitte vollständig hochladen“) |
| Ersetzt | nichts; heute wirkt die Vorbelegung nur in der Aktionsbox der Belegseite (App), in der Einzelprüfung (`SourceDocumentReview`) geht sie verloren, auch die bestehende `clientNote` (`DocumentReviewDoc.clientNote`) |
| Blockiert | den Ludwig-Commit, der den DS-Zeiger hebt (ll-ceo) |
| Spec von / am | designsystem, 2026-11-26 |

## Ziel

Die Sachbearbeiterin prüft einen Beleg, dem zwei Seiten fehlen. Ludwig weiß
das schon aus der Belegprüfung und empfiehlt „Beim Mandanten klären“. Heute
steht das Feld „Notiz für den Mandanten“ leer da: Sie schreibt den Satz ab,
den Ludwig schon kennt, oder sie lässt ihn weg. Künftig steht der Satz im
Feld. Sie liest ihn, ändert ihn bei Bedarf und schickt die Antwort mit einem
Klick ab.

## Einordnung

- **Wiederverwenden:** `ChoicePrompt` (`@when` „A question with two to seven
  suggested answers“) trägt den Fall. `freeText.defaultValue` gibt es schon
  (0222, `ClarificationCard` belegt damit die Mandantennotiz vor). An der
  `note` einer Option fehlt nur das Gegenstück.
- **Erweitert, weil:** §3 Regel 2. Ein Feld am vorhandenen Optionstyp. Die
  Designentscheidung kommt wieder: heute Belegprüfung und `clientNote`,
  dieselbe Form wie `freeText.defaultValue`.
- **Zuschnitt:** eine Datei (`ChoicePrompt.tsx`). `SourceDocumentReview`
  reicht `options` unverändert durch und bleibt im Code unberührt.
- **Setzt auf:** nichts Neues.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `ChoiceOption.note` | `{ label: string; placeholder?: string; required?: boolean; defaultValue?: string }` | nein | neu ist nur `defaultValue`: Text, mit dem das Feld dieser Option erscheint, solange noch nichts getippt ist; editierbar | `ChoicePrompt/OptionNotePrefilled`, `SourceDocumentReview/Interactive` |

Die Regel, nach der das Feld seinen Text zeigt:

1. Solange niemand getippt hat, zeigt das sichtbare Feld **seine eigene**
   Vorbelegung: bei einer Option ihre `note.defaultValue`, beim Freitext
   `freeText.defaultValue`, sonst leer.
2. Sobald getippt wurde (auch Löschen), gilt der getippte Text. Er bleibt beim
   Wechsel der Option stehen, wie bisher (0223, 0229).
3. Eine Vorbelegung wandert **nicht** zu einer anderen Option. Wer von
   „Beim Mandanten klären“ auf „Mit Kommentar noch verarbeiten“ wechselt,
   ohne getippt zu haben, sieht dort ein leeres Feld. Wechselt er zurück,
   steht die Vorbelegung wieder da.
4. Gesendet wird, was im sichtbaren Feld steht, getrimmt (wie bisher). Eine
   unveränderte Vorbelegung ist ein Text und erfüllt `required`.

Typen aus `src/ludwig/`: `DocumentReviewDoc.clientNote` ist eine Quelle der
Vorbelegung. Den doccore-Satz bringt das Choice-Modell der App mit, das Set
sieht davon nur den String.

Was die Komponente **nicht** kann (bewusst):
- Sie zeigt nicht, woher die Vorbelegung kommt. Die Option kann das in ihrem
  `hint` sagen.
- Es gibt keinen Weg „zurück zur Vorbelegung“, nachdem getippt wurde. Der
  Wechsel zu einer anderen Option und zurück stellt sie ebenfalls nicht
  wieder her, denn der getippte Text gilt weiter (Regel 2).

Verhaltensänderung am Rand: Bisher stand `freeText.defaultValue` nach dem
Wechsel auf eine Option mit `note` auch in deren Feld, weil der Text geteilt
war. Jetzt zeigt das `note`-Feld seine eigene Vorbelegung oder bleibt leer
(Regel 3). Kein Aufrufer im Set kombiniert beides: `ClarificationCard` nutzt
`freeText.defaultValue` nur mit `options={[]}`.

## Verhalten

Tastatur, Fokus, Hover und `Strg+Enter` bleiben wie gehabt. Wer eine Option
wählt, behält den Fokus am Radio, auch wenn ihr Feld vorbelegt erscheint
(0229, M3). Es gibt keine eigene Animation und keine Live-Region: Das Feld
erscheint wie bisher mit der Wahl.

Zustände: gefüllt und Fehler wie bisher. Ein Senden, das scheitert, lässt den
Text stehen; der Text ist State, kein Neuaufbau. „Lädt“ (`pending`) sperrt
das Feld, die Vorbelegung bleibt sichtbar. „Leer“ und „leer nach Filter“
gibt es nicht, weil ein `ChoicePrompt` ohne Optionen und ohne Freitext nicht
entsteht.

Client-Component wie bisher.

## Stories

| Story | Beweist |
|---|---|
| `ChoicePrompt/OptionNotePrefilled` (neu) | „Beim Mandanten klären“ empfohlen, Feld mit „Es liegen 4 von 6 Seiten vor, bitte vollständig hochladen.“, Knopf frei; Wechsel ohne Tippen → leeres „Kommentar an Ludwig *“, Knopf gesperrt; zurück → Vorbelegung steht wieder da; getippt → Text bleibt über Wechsel; gesendet wird der sichtbare Text |
| `SourceDocumentReview/Interactive` (erweitert) | ein sechster Beleg (fehlende Seiten) mit Empfehlung „Beim Mandanten klären“ und vorbelegter Notiz, im Rundlauf |

Nicht anwendbare Zustände: siehe Verhalten. Lädt und Fehler belegen die
vorhandenen Stories `Pending` und `Error`. Die Vorbelegung ändert daran nichts.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Herkunft der Vorbelegung neben dem Feld („von Ludwig vorbereitet“) | ein optionaler Satz an `note` | Nutzerinnen schicken vorbelegte Sätze ungelesen ab, oder der Owner will die Herkunft sehen; das braucht ein neues Wort und damit den Owner |

## Offene Fragen

1. Soll neben einem vorbelegten Feld ein Satz stehen, der sagt, dass Ludwig den
   Text vorbereitet hat? **Ohne Antwort:** nein. Das Feld trägt sein Label, die
   Herkunft gehört in den `hint` der Option. Ein neues Wort braucht den Owner.
   **Antwort ll-ceo 2026-11-26:** Es bleibt beim Default, kein Satz.

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

- [ ] `ChoiceOption.note.defaultValue` steht im Typ wie in der Tabelle, JSDoc nennt die Regel (Story `OptionNotePrefilled`)
- [ ] Regel 1: Die empfohlene Option mit Vorbelegung erscheint mit dem Text im Feld, der Knopf ist frei, obwohl `required` gilt (`OptionNotePrefilled`, `SourceDocumentReview/Interactive` beim sechsten Beleg)
- [ ] Regel 3: Wechsel ohne Tippen auf eine Option mit `note` ohne Vorbelegung → Feld leer, Knopf gesperrt mit „Bitte ergänzen Sie den Text.“; zurück → Vorbelegung wieder da (`OptionNotePrefilled`)
- [ ] Regel 2: Nach Tippen bleibt der getippte Text beim Wechsel stehen; ein geleertes Feld bleibt leer (`OptionNotePrefilled`)
- [ ] Regel 4: Gesendet wird `{ optionId, text }` mit dem sichtbaren, getrimmten Text, auch die unveränderte Vorbelegung (`OptionNotePrefilled`, Ausgabezeile unter dem Prompt)
- [ ] Fokus bleibt beim Wählen per Pfeiltaste am Radio, auch wenn ein vorbelegtes Feld erscheint (`OptionNotePrefilled`)
- [ ] `ClarificationCard` belegt die Mandantennotiz weiter aus `freeText.defaultValue` vor (`ClarificationCard`-Story mit `clientNote`, „Beim Mandanten klären“ öffnen)
- [ ] Bestehende Stories `OptionNote`, `OptionGroup`, `OptionGroupList`, `WithFreeText`, `FreeTextOnly` verhalten sich unverändert

## Abnahme

Geprüft wurde der nicht committete Stand von `ChoicePrompt.tsx`, `ChoicePrompt.stories.tsx` und `SourceDocumentReview.stories.tsx` (`git diff`, 85 Zeilen dazu, 8 weg). Browser: Playwright gegen den laufenden Storybook (Port 6107), Fenster 1400 px. Tastatur über echte Tastendrücke (Pfeiltasten am Radio, `Strg+Enter`), Text über den nativen Setter und ein `input`-Event, jeder Schritt in einem eigenen Aufruf. Screenshots liegen unter `.playwright-mcp/0262-*.png`.

| Kriterium | Nachweis | Ergebnis (✓/✗) |
|---|---|---|
| Fest: `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. Wächter: `check:type` 0 („ok“, 0 Altfunde), `check:language` 0 („0 German comment lines“), `check:icons` 0, `check:when` 0. `check:classes` endet mit 1, und zwar genau mit den vier bekannten Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein neuer. `pnpm build` habe ich nicht gestartet (Vorgabe des Auftrags). `storybook-static/index.json` ist vom 23.11.2026 und damit älter als die Änderung. Ersatznachweis: Der Dev-Storybook übersetzt alle drei Dateien, und jede geprüfte Story rendert ohne Konsolenmeldung. Die Änderung bringt keinen Import, keine Datei und kein CSS mit | ✓ (Build offen, H1) |
| Fest: Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Keine neue Datei. `OptionNotePrefilled` steht in `ChoicePrompt.stories.tsx` unter `v3/Patterns/Prüfen/ChoicePrompt`, der sechste Beleg in `SourceDocumentReview.stories.tsx` unter `v3/Entitäten/Beleg/SourceDocumentReview`. `SourceDocumentReview.tsx` ist nicht im Diff, wie im Zuschnitt verlangt | ✓ |
| Fest: Code englisch; `@when`/`@instead` an jedem Export | Bezeichner (`typedText`, `clientNote`, `doc-pages`), Kommentare und JSDoc im Diff sind englisch. Deutsch steht nur in sichtbaren Strings und Fixture-Daten. `check:language` 0. Es gibt keinen neuen Export. `ChoicePrompt` trägt `@when`/`@instead` (`ChoicePrompt.tsx:49–54`), `check:when` 0 | ✓ |
| Fest: Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Im Diff von `ChoicePrompt.tsx` steht kein Hex und kein px. Die Story hat `maxWidth: 640` als Story-Rahmen, wie die Nachbarstory `OptionNote`. Der Prüfgrund des sechsten Belegs ist `open_findings` aus der Registry-Achse `document_review_reason` und erscheint über `StatusBadge` als „Werte fehlen“. `LABEL` in der Story wird aus `decisions()` abgeleitet und ist damit keine zweite Quelle | ✓ |
| Fest: Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `v3-patterns-prüfen-choiceprompt--option-note-prefilled` und `v3-entitäten-beleg-sourcedocumentreview--interactive` stehen im Index. Interactive hat sechs Belege („Beleg 6 von 6“). Lädt und Fehler: `--pending` zeigt gesperrte Radios und „Sende …“, `--error` zeigt den Callout und lässt das Feld stehen. „Leer“ und „leer nach Filter“ begründet die Spec. Eine Story mit Vorbelegung und `pending` gibt es nicht, laut Spec ändert die Vorbelegung daran nichts. Im Code bleibt `value={text}` stehen, während `disabled={pending}` das Feld sperrt | ✓ |
| Fest: Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe `patterns/`, kein neuer Import. Kein Hex und kein px. Farbe und Status unverändert. Texte nach T1–T5: Label „Notiz für den Mandanten *“, Satz neben dem gesperrten Knopf „Bitte ergänzen Sie den Text.“. Tastatur gemessen (Pfeiltasten, `Strg+Enter`). Zustände wie in der Zeile davor. Kontrast, Trefferfläche, Hover und Maße sind nach 0119 vertagt (schlanke Abnahme). Die Punkte zu v1 und §11 gelten der App | ✓ |
| Fest: Im Browser angesehen (Storybook), nicht nur gebaut | Angesehen: `option-note-prefilled`, `option-note`, `option-group`, `option-group-list`, `with-free-text`, `free-text-only`, `pending`, `error`, `sourcedocumentreview--interactive`, `sourcedocumentreview--overview` und `clarificationcard--step-ask-client`. Die Konsole blieb bei jeder Story ohne Fehler und Warnungen. Screenshots: `0262-prefilled-initial.png`, `0262-prefilled-switched-empty.png`, `0262-review-interactive-doc6.png`, `0262-clarification-ask-client-prefilled.png`, `0262-review-overview-counts.png` | ✓ |
| `ChoiceOption.note.defaultValue` steht im Typ wie in der Tabelle, JSDoc nennt die Regel | `ChoicePrompt.tsx:34`: `note?: { label: string; placeholder?: string; required?: boolean; defaultValue?: string };` stimmt Zeichen für Zeichen mit der Tabelle überein und ist optional („Pflicht: nein“). Das JSDoc (Z. 26–33) nennt die Regeln 1 bis 3: „fills the field while nothing is typed yet … a prefill stays with its own option and never travels to another; once typed, the typed text holds“. Regel 4 steht nur als Code-Kommentar (Z. 142–143), siehe H2 | ✓ |
| Regel 1: Die empfohlene Option mit Vorbelegung erscheint mit dem Text im Feld, der Knopf ist frei, obwohl `required` gilt | `--option-note-prefilled` nach dem Laden: „Beim Mandanten klären“ (empfohlen) ist gewählt, das Feld „Notiz für den Mandanten *“ enthält „Es liegen 4 von 6 Seiten vor, bitte vollständig hochladen.“, der Knopf ist frei und daneben steht kein Satz. `--interactive`: Nach der Entscheidung zu Beleg 5 erscheint „Beleg 6 von 6“ (Kanzleibedarf Weber KG). „Beim Mandanten klären“ ist gewählt, das Feld trägt denselben Satz, „Entscheiden und zur Übersicht“ ist frei. Gegenprobe Beleg 1 (ohne `clientNote`): Nach Wahl von „Beim Mandanten klären“ bleibt das Feld leer und der Knopf gesperrt. Code: Z. 141 `const text = typedText ?? field?.defaultValue ?? "";` | ✓ |
| Regel 3: Wechsel ohne Tippen auf eine Option mit `note` ohne Vorbelegung → Feld leer, Knopf gesperrt mit „Bitte ergänzen Sie den Text.“; zurück → Vorbelegung wieder da | Fokus am gewählten Radio, `ArrowDown` → „Mit Kommentar noch verarbeiten“: Das Feld „Kommentar an Ludwig *“ ist leer, der Knopf gesperrt, daneben „Bitte ergänzen Sie den Text.“. `ArrowUp` → die Vorbelegung steht wieder da, der Knopf ist frei. Auch der Weg über „Archivieren“ (ohne Feld, Knopf frei) und zurück zeigt die Vorbelegung | ✓ |
| Regel 2: Nach Tippen bleibt der getippte Text beim Wechsel stehen; ein geleertes Feld bleibt leer | Getippt: „  Bitte Seiten 5 und 6 nachreichen.  “. `ArrowDown` → „Mit Kommentar …“ zeigt den getippten Text, der Knopf ist frei. `ArrowUp` → wieder der getippte Text, nicht die Vorbelegung. Feld geleert → hin und zurück: Das Feld bleibt leer, der Knopf ist gesperrt mit „Bitte ergänzen Sie den Text.“, und `Strg+Enter` sendet nichts (die Ausgabezeile ändert sich nicht). Code: `""` ist nicht `null`, deshalb greift `??` nicht | ✓ |
| Regel 4: Gesendet wird `{ optionId, text }` mit dem sichtbaren, getrimmten Text, auch die unveränderte Vorbelegung | Unverändert mit `Strg+Enter` gesendet, Ausgabezeile: „Entschieden: client · Es liegen 4 von 6 Seiten vor, bitte vollständig hochladen.“. Mit Leerzeichen getippt, Ausgabe: „Entschieden: client · Bitte Seiten 5 und 6 nachreichen.“ (getrimmt). `--interactive`, Beleg 6 unverändert per Klick gesendet: „Kanzleibedarf Weber KG: Beim Mandanten klären · „Es liegen 4 von 6 Seiten vor, bitte vollständig hochladen.““ | ✓ |
| Fokus bleibt beim Wählen per Pfeiltaste am Radio, auch wenn ein vorbelegtes Feld erscheint | Nach jedem Pfeil ist `document.activeElement` das gewählte Radio (`client`, `process`, `archive`), auch beim Zurück auf die vorbelegte Option. Das Feld bekommt den Fokus nicht, in `--option-note-prefilled` ebenso wenig wie bei Beleg 1 in `--interactive` | ✓ |
| `ClarificationCard` belegt die Mandantennotiz weiter aus `freeText.defaultValue` vor | `--step-ask-client`, zweite Karte (mit `clientNote`): Klick auf „Beim Mandanten klären“ öffnet die Notizfläche. Das Feld enthält „Bitte die Rechnung von Wolkenhaus mit dem Leistungszeitraum nachreichen.“, der Fokus liegt im Feld, der Knopf ist frei. `Strg+Enter` speichert, die Notizfläche schließt, und der Callout „Beim Mandanten zu klären: …“ steht da. Code: `ClarificationCard.tsx:1215–1225` übergibt `options={[]}` mit `freeText.defaultValue`, also `field = freeText`. Der erste Aufruf (Z. 1162) setzt `freeText` ohne `defaultValue`, seine Optionen haben keine `note` (Z. 909–912). Weitere Aufrufer in `src/` hat nur noch `SourceDocumentReview`, und der übergibt kein `freeText`. Die Verhaltensänderung am Rand trifft also niemanden | ✓ |
| Bestehende Stories `OptionNote`, `OptionGroup`, `OptionGroupList`, `WithFreeText`, `FreeTextOnly` verhalten sich unverändert | Code: Ohne `defaultValue` ergibt `typedText ?? undefined ?? ""` dasselbe wie der alte Zustand `useState(freeText?.defaultValue ?? "")`, und keine der fünf Stories setzt `defaultValue` (grep). Browser: In `option-note` ist der Knopf am Anfang gesperrt („Wählen Sie eine Antwort oder schreiben Sie eine.“). Wahl von „Mit Kommentar“ zeigt ein leeres Pflichtfeld. Nach dem Tippen bleibt der Text beim Wechsel auf „Beim Mandanten klären“ stehen. Über „Archivieren“ gesendet: „archive · ohne Text“. `with-free-text`: vor der Wahl getippt, Option gewählt, gesendet „bewirtung · Geschäftsessen mit Mandant“ (getrimmt). `free-text-only`: kein `fieldset`, der Satz lautet „Schreiben Sie eine Antwort.“, getippt und getrimmt gesendet. `option-group`: Bei gewählter Gruppe ist der Knopf gesperrt mit „Wählen Sie eine Möglichkeit unter „Ablegen ohne Buchung“.“, nach dem Pfeil auf `annual` ist er frei. `option-group-list`: `annual` ist vorgewählt, „Notiz zur Ablage *“ leer und gesperrt, getippt und gesendet „annual · Für den Anlagenspiegel 2026.“ | ✓ |
| Zusatz: Regeln 1–4 und „nicht kann“ gegen den Code | Regel 1: Z. 140–141. Regel 2: Z. 116 und 191. `setTypedText` greift auch beim Löschen, der Zustand liegt auf Prompt-Ebene und überlebt den Wechsel. Regel 3: Die Vorbelegung hängt am sichtbaren `field`, nicht am Zustand. Regel 4: Z. 144–146 mit `text.trim()`, die Vorbelegung erfüllt `required`. Einen Weg zurück zur Vorbelegung gibt es im Code nicht. Verhaltensänderung am Rand: `note ??` steht vor `freeText` (Z. 140), also erscheint `freeText.defaultValue` nicht mehr im `note`-Feld | ✓ |
| Zusatz: Nebenwirkung des sechsten Belegs auf die Nachbarstory `SourceDocumentReview/Overview` | `--overview` nutzt dieselben `ITEMS`. Die oberen beiden Fassungen zeigen jetzt „Eingegangen 61 · Gebucht 53 · Warten auf eine Rückfrage 3 · Ohne Buchung oder von Ludwig als nicht buchungsrelevant eingestuft 6“. Das sind 62 statt 61; vorher war es 53 + 3 + 5. Der Hauptknopf heißt jetzt „4 Belege durchgehen“, das JSDoc der Story (Z. 360–361) nennt noch „3 Belege durchgehen“. Screenshot `0262-review-overview-counts.png` | ✗ (M1) |

Abgenommen von / am: fremder Abnehmer, 2026-11-26 · schlanke Abnahme (Schnittstelle)

Offene Punkte:

1. **M1 — Die Overview-Story rechnet nicht mehr auf.** `SourceDocumentReview.stories.tsx:402–403` hält „Eingegangen 61“ und „Gebucht 53“ fest, die Zeile „Ohne Buchung …“ zählt aber `items.length`, jetzt 6. Die Summe ergibt 62 statt 61. Das JSDoc der Story (Z. 360–361) verspricht „3 Belege durchgehen“, der Knopf sagt „4 Belege durchgehen“. Vorschlag: „Gebucht“ aus `61 - 3 - items.length` rechnen und die Zahl im JSDoc nachziehen oder aus dem Satz nehmen.
2. **H1 — Build offen.** `pnpm build` lief in dieser Abnahme nicht (Vorgabe). Vor dem Commit läuft er einmal, laut Skill in einem eigenen `git worktree`.
3. **H2 — Das JSDoc sagt Regel 4 nicht, und ein alter Satz hält nur noch halb.** Am `note` steht weiter „It shares its text with the free text, so switching options loses nothing“. Das gilt jetzt nur für getippten Text: `freeText.defaultValue` erreicht kein `note`-Feld mehr. Ein Halbsatz würde das schließen, am `note` und an `freeText.defaultValue` (Z. 80: „`defaultValue` fills it“): Die unveränderte Vorbelegung wird getrimmt gesendet und erfüllt `required`, und die Freitext-Vorbelegung gilt nur dem Freitextfeld.
4. **H3 — Der sechste Beleg widerspricht sich in der Vorschau.** Der Kopf der Vorschau sagt „1 Seite“, weil `Preview` fest `pageCount={1}` setzt (Z. 209). Der Prüfgrund daneben sagt „hochgeladen sind vier“, und das genau in der Story, die den Fall belegt. `pageCount` sollte aus dem Beleg kommen.
5. **H4 — Das JSDoc an `ITEMS` (Z. 93) sagt noch „Five documents“.** Es sind jetzt sechs.

### Nachprüfung 2026-11-26

Geprüft wurde wieder der nicht committete Stand (`git diff`). Browser wie oben: Playwright gegen Port 6107, 1400 px. Die Logik in `ChoicePrompt.tsx` ist gegenüber der ersten Prüfung unverändert, geändert hat sich dort nur das JSDoc. Die Kriterien der ersten Prüfung gelten deshalb weiter, und `--option-note-prefilled` zeigt nach dem Laden wieder die Vorbelegung bei freiem Knopf.

| Punkt | Nachweis | Ergebnis (✓/✗) |
|---|---|---|
| M1 — Overview rechnet auf | `SourceDocumentReview.stories.tsx:406`: Gebucht ist `"52"`. In `--overview` ergeben alle drei Fassungen die Summe: 61 = 52 + 3 + 6 (offen), 61 = 52 + 3 + 6 (alle entschieden), 61 = 58 + 3 + 0 (nichts zu prüfen). Gemessen über den Text der Zahlenliste. Der Hauptknopf heißt „4 Belege durchgehen“, das JSDoc (Z. 363–364) nennt „4 Belege durchgehen“. Screenshot `0262-recheck-overview-counts.png` | ✓ |
| H1 — Build | Nicht selbst gebaut. `storybook-static/index.json` stammt von 09:48:39 und der Chunk `assets/SourceDocumentReview.stories-B1j5tP70.js` von 09:48:45. Beide sind jünger als die letzte Quelländerung (09:48:25). Der Chunk enthält die Korrekturen: `` `Gebucht`,n.length===0?`58`:`52` ``, `pages:4`, `pageCount:e.pages??1` und die Notiz „Es liegen 4 von 6 Seiten vor …“. Exit 0 laut Bauer. `pnpm typecheck` Exit 0, `check:language` und `check:type` „ok“ | ✓ |
| H2 — JSDoc nennt Regel 4 | `ChoicePrompt.tsx:26–34` sagt jetzt: „Typed text is shared with the free text … `defaultValue` fills the field while nothing is typed yet (0262) — a prefill stays with its own option and never travels to another. What stands in the visible field is sent, an untouched prefill too, and it meets `required`.“ Darin stehen die Regeln 1 bis 4. Dass der Text getrimmt wird, steht nur im Code-Kommentar (Z. 143–144); das ist kein Mangel. Der Typ (Z. 35) ist unverändert und stimmt Zeichen für Zeichen mit der Tabelle überein | ✓ |
| H3 — Der sechste Beleg zeigt „4 Seiten“ | `ReviewItem.pages?: number` (Z. 92, JSDoc englisch), der sechste Beleg hat `pages: 4` (Z. 200), `Preview` gibt `pageCount={item.pages ?? 1}` weiter (Z. 212). `--interactive`: Beleg 1 zeigt im Kopf der Vorschau „1 Seite“, Beleg 6 zeigt „4 Seiten“. Daneben steht der Prüfgrund „hochgeladen sind vier“, das Feld trägt die Vorbelegung. Screenshot `0262-recheck-doc6-pages.png` | ✓ |
| H4 — JSDoc an `ITEMS` | Z. 95: „Six documents of batch 2026-0001 … the one missing pages last (0262).“ | ✓ |
| Konsole | `--overview`, `--interactive` (bis Beleg 6) und `--option-note-prefilled`: 0 Fehler, 0 Warnungen | ✓ |

Alle Punkte sind behoben, und es ist kein neuer Mangel dazugekommen. Status: `fertig`.

Nachgeprüft von / am: fremder Abnehmer, 2026-11-26 · schlanke Abnahme (Schnittstelle)
