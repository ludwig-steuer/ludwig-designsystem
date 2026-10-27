# 0234 · LongText: nur falten, wenn mindestens zwei Zeilen verdeckt würden

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` (`LongText.tsx`) |
| Klassen-Test | ja, das Falten von langem Text ist fachfrei |
| Quelle | llcto für den Owner, 2026-10-27: „Gefaltet wird nur, wenn mindestens zwei Zeilen verdeckt würden, sonst steht der Text ganz da. Das gilt für jedes `LongText` im Set.“ Anlass ist die Prüfung des 0232-Nachtrags: Ein Text knapp über `max` versteckte hinter „mehr“ nur seine letzten Worte |
| Ersetzt | nichts |
| Blockiert | den Zeigerhub der App auf den Endstand (ll-abnahme) |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

„mehr ▾“ kostet einen Klick. Wenn dahinter nur drei Wörter stehen, lohnt sich
das nicht. Künftig faltet `LongText` nur, wenn mindestens zwei Zeilen verdeckt
würden. Sonst steht der Text ganz da.

## Einordnung

- **Erweitern:** `LongText` (`@when` Plain long text … clamped by character
  count) bekommt eine Prop `lineChars` (Vorgabe 80: Die 68ch von `lw-ui-text`
  fassen gemessen etwa 83 Zeichen deutscher Prosa). Gefaltet wird nur, wenn der
  verdeckte Rest mindestens `2 × lineChars` Zeichen hat.
- **Zeichen statt gemessener Zeilen:** `LongText` ist server-tauglich (natives
  `<details>`). Ohne Layout gibt es keine Zeilen zu messen, deshalb schätzt der
  Aufrufer seine Zeile, gemessen, nicht geraten. `InvoiceLineRow` setzt
  `lineChars={70}`: Die Zelle der Beschreibung fasst in `InvoiceLineList` 68 bis
  70 Zeichen je Zeile (Abnahme, M1).
- **Für jedes `LongText`:** Die Vorgabe gilt ohne Änderung an den Aufrufern
  (Provenance, BookingReview, Facts). `RawRecord` hat ein eigenes, anderes
  `LongText` (Zusammenfassung plus Text) und ist nicht betroffen.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `lineChars` | `number` | nein, Vorgabe 80 | ungefähre Zeichen je Zeile am Ort; zwei solche Zeilen muss die Faltung mindestens verdecken | `JustOverLimit` (Vorgabe, ganz), `NarrowLine` (30, gefaltet) |

## Stories

Neu sind `JustOverLimit` (ein Text knapp über `max`, der ganz dasteht) und
`NarrowLine` (derselbe Text mit `lineChars` 30 in einem schmalen Rahmen, der dort
faltet). `Short`, `Clamped` und `CustomLimit` bleiben unverändert und falten bzw.
falten nicht wie bisher.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| gemessene statt geschätzte Zeilen | eine Client-Variante mit `line-clamp` und Messung | eine Stelle zeigt, dass die Schätzung oft daneben liegt |

## Abnahmekriterien

- [ ] `pnpm typecheck` grün; Code englisch, `@when`/`@instead` stehen; kein px in der TSX
- [ ] `JustOverLimit` zeigt den ganzen Text ohne „mehr“; `Clamped` und `CustomLimit` falten wie vorher (Teaser gleich)
- [ ] Rand: Verdeckter Rest genau `2 × lineChars - 1` Zeichen → ganz; `2 × lineChars` → gefaltet (Server-Render-Probe)
- [ ] BookingReview: Eine Begründung knapp über 700 Zeichen steht ganz da, eine mit mehr als zwei Zeilen Rest ist gefaltet (Laufzeit-Probe in `InFoldout`)
- [ ] `InvoiceLineRow` setzt `lineChars` gemessen (70); in der Zelle von `InvoiceLineList` spart jede Faltung mindestens zwei Zeilen (Laufzeit-Probe mit Beschreibungen verschiedener Länge in der Zelle); `NarrowLine` zeigt die Prop

## Abnahme

Gemessen am Arbeitsbaum, also am uncommitteten Diff an `LongText.tsx`,
`LongText.stories.tsx` und `InvoiceLineRow.tsx` gegen HEAD `4c332e7`. Gemessen
wurde auf dem Dev-Server 6107 mit einem Messbrowser über `scripts/cdp.mjs`, bei
1280 und 1440 px. Für den Server-Render sind Arbeitsbaum und HEAD-Fassung von
`LongText.tsx` per esbuild als CJS gebaut. Für die Aufrufer ist `LongText` in
einem Bündel aller Story-Dateien unter `src/ui/v3` und `src/showcase` durch eine
Sonde ersetzt, die für jeden Aufruf den Entscheid von HEAD und Arbeitsbaum
festhält. Ausgelassen sind die drei Stories mit `import.meta.glob` (Icons, Color,
Brand). Die Längen in Zellen und Abschnitten sind gemessen, indem das
Server-Markup in den echten Behälter der Story gesetzt wurde. Story-Deckung: Die
neue Story `JustOverLimit` ist da, `Short`, `Clamped` und `CustomLimit` sind
unverändert. Die neue Prop `lineChars` setzt keine Story (M2). Skripte und
Rohdaten liegen im Scratchpad der Sitzung (`ssr-entry`, `build-callers`,
`snippets*`, `measure*`).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün; Code englisch, `@when`/`@instead` stehen; kein px in der TSX | `pnpm typecheck` endet mit Exit 0, ebenso `check:when`, `check:language` und `check:type` samt ihrem `--test`. `LongText` trägt `@when`/`@instead` unverändert. Der neue JSDoc an `lineChars` und der `ponytail`-Kommentar sind englisch. Deutsch steht nur in der Story-Beschreibung von `JustOverLimit` (0098 M10). `LongText.tsx` hat kein px und kein Hex. Die px in `invoiceLineTracks` von `InvoiceLineRow.tsx` sind alt und kommen nicht aus dem Diff | ✓ |
| `JustOverLimit` ganz ohne „mehr“; `Clamped` und `CustomLimit` falten wie vorher (Teaser gleich) | Server-Render der Story-Args gegen HEAD: `Short`, `Clamped` und `CustomLimit` liefern dasselbe Markup wie HEAD, Zeichen für Zeichen. `JustOverLimit` (355 Zeichen, `max` 295) war unter HEAD gefaltet und steht jetzt ganz. Im Browser bei 1280 und 1440 px (`v3-primitives-werte-longtext--short`, `--clamped`, `--custom-limit`, `--just-over-limit`): `JustOverLimit` hat kein `details`, alle 355 Zeichen sind sichtbar, 74 px hoch (3 Zeilen). `Clamped` zeigt 177 Zeichen Teaser und „ mehr ▾“, `CustomLimit` 53 Zeichen und „ mehr ▾“. Die Konsole meldet in keinem der 22 Aufrufe dieser Abnahme etwas | ✓ |
| Rand: Rest `2 × lineChars - 1` ganz, `2 × lineChars` gefaltet (Server-Render-Probe) | Text ohne Leerzeichen, der Teaser ist dann 60 % von `max`. Mit `max` 100 und 180 und der Vorgabe 68 steht ein Rest von 135 Zeichen ganz da, ein Rest von 136 ist gefaltet. Mit `max` 81 und 100 und `lineChars` 40 steht ein Rest von 79 ganz da, ein Rest von 80 ist gefaltet. Mit Prosa (Schnitt an der Wortgrenze) kippt der Entscheid bei `max` 180 / 68 bei 310 Zeichen (Rest 136), bei 81 / 40 bei 160 Zeichen (Rest 80) und bei 700 / 68 bei 832 Zeichen (Rest 136). Über alle Längen weicht der Entscheid nie von der Regel ab | ✓ |
| BookingReview: knapp über 700 ganz, mehr als zwei Zeilen Rest gefaltet (Laufzeit-Probe in `InFoldout`) | Server-Render von `BookingReview` mit Begründungen von 705, 760, 835, 836, 850 und 1000 Zeichen: 705 und 760 stehen ganz da, ab 835 (Rest 139) ist gefaltet. `InFoldout` selbst trägt nur 305 Zeichen. Deshalb wurde das Markup bei 1280 und 1440 px in ihr `.v3bkr__text` gesetzt, das 579 px breit ist. 705 Zeichen: 9 Zeilen, ganz, kein „mehr“. 850 Zeichen: zu 9 Zeilen, der Rest von 154 Zeichen braucht 2 Zeilen, offen sind es 12 Zeilen samt „weniger ▴“ | ✓ (H1) |
| `InvoiceLineRow` faltet in der Zelle mit `lineChars={40}` wie vorgesehen (Stories der Rechnungszeile) | `InvoiceLineRow.tsx` setzt `lineChars={40}`. In `v3-entitäten-rechnungsposition-invoicelinerow--edges`, `invoicelinelist--edges` und `--total-mismatch` ist die Beschreibung 106 Zeichen lang, der Rest rund 31 Zeichen. Sie war gefaltet und steht jetzt ganz. Damit zeigt keine Story der Rechnungszeile mehr eine Faltung in der Zelle. Gemessen wurde mit Markup für 134 Längen von 82 bis 240 Zeichen, in die Zelle gesetzt. Die Zelle ist bei beiden Breiten 428 px breit (Liste) und 472 px (Zeilen-Story). In der Liste fasst eine Zeile rund 68 bis 70 Zeichen, in der Zeilen-Story mehr als 75, nicht 40. Mit 40 werden Beschreibungen von 156 bis 206 Zeichen gefaltet, obwohl die Faltung nur eine Zeile spart | ✗ M1, M2 |
| Zusatz der Abnahme: Klappt bei einem Aufrufer ein Text auf und sprengt eine Tabellenzeile? | Die Sonde über 192 Story-Dateien zählt 103 Aufrufe von `LongText`. 10 davon sind länger als `max`, 6 standen bisher gefaltet und stehen jetzt ganz: die Beschreibung der Rechnungszeile mit 106 Zeichen (`InvoiceLineRow` `Edges`, `InvoiceLineList` `Edges` und `TotalMismatch`), `Provenance` `WithVerdict` mit 254, `JournalEntryFacts` `Edges` mit 300 und `InvoiceLineFacts` `Edges` (Begründung) mit 297 Zeichen. Gefaltet bleiben `CaseFacts` `LongSummary` (721), `InvoiceLineFacts` `Edges` (Buchungsgegenstand, 400), `RecurringRuleFacts` `Edges` (391) und `Provenance` `Edges` (768). Nur die Rechnungszeile steht in einer Tabellenzelle. Dort braucht die Beschreibung mit 106 Zeichen vorher und nachher 2 Zeilen, und die Zeile bleibt gleich hoch: 186 px in der Zeilen-Story, 207 → 206 px in der Liste. Im schlimmsten Fall steht ein Text von bis zu 155 Zeichen ganz da, mit 3 Zeilen statt 2. Die Zeile ist dann 226 statt 207 px hoch, eine Zeile mehr, sie sprengt aber nicht. `ProvenanceRows`, `JournalEntryFacts` und `InvoiceLineFacts` stehen nicht in einer `td`. Sie zeigen 4 Zeilen auf 451, 667 und 591 px. `CaseFacts` faltet in keiner Story anders als vorher und steht nur im `FieldList` von `CaseDrawer` | ✓ (H2) |
| Story-Deckung: jede Prop ihre Story | `lineChars` ist in keiner Story gesetzt. Die Spalte „Nachweis“ nennt `JustOverLimit` und `Clamped`, beide laufen mit der Vorgabe 68 | ✗ M2 |

Abgenommen von / am: fremde Abnahme, 2026-10-27 · Offene Punkte: M1, M2; H1–H3
Nachprüfung 1: fremde Abnahme, 2026-10-27 · M1, M2 behoben, H1 und H3 erledigt · Offene Punkte: N1 (Hinweis)

## Mängel

- **M1 · `lineChars={40}` in der Rechnungszeile ist geschätzt, nicht gemessen,
  und bricht dort die Regel aus 0234.** Die Zelle ist bei 1280 und 1440 px 428 px
  breit (`InvoiceLineList`) und 472 px (`InvoiceLineRow`). Bei `--fs-ui-sm` fasst
  eine Zeile in der Liste rund 68 bis 70 Zeichen, in der Zeilen-Story mehr. Die Zelle ist also nicht schmal, und die Annahme
  in „Einordnung“ stimmt nicht. Der Teaser von bis zu 81 Zeichen samt „mehr ▾“
  braucht schon 2 Zeilen. Mit 40 falten deshalb Texte von 156 bis 206 Zeichen,
  ganz stünden sie auf 3 Zeilen: Die Faltung spart 1 Zeile. In der Liste ist das
  bei 43 von 72 Faltungen so, in der Zeilen-Story bei 67 von 72 (eine spart gar
  keine Zeile). Mit 65 sparen in der Liste 29 von 30 Faltungen 2 Zeilen. Die
  Zeile wächst dabei nicht mehr als mit 40, höchstens auf 3 Zeilen (226 statt
  207 px). Zu ändern: `lineChars` aus der Messung am Einsatzort setzen, rund 65
  bei 428 px. Soll die Zeile schon ab einer verdeckten Zeile falten, ist das
  eine Ausnahme von der Regel des Owners. Dann gehört sie mit Owner und Datum in
  die Spec, und „schmale Zelle“ ist als Begründung zu streichen.
- **M2 · Die Faltung mit eigenem `lineChars` ist in keiner Story zu sehen.**
  Keine Story von `LongText` setzt `lineChars`. Seit die 106 Zeichen der
  Fixture `LONG` ganz dastehen, zeigt auch keine Story der Rechnungszeile mehr
  eine Faltung in der Zelle. Damit hat Kriterium 5 in den genannten Stories
  keinen Nachweis. Zu ändern: eine Story an `LongText`, die mit kleinem
  `lineChars` faltet, wo die Vorgabe den Text ganz zeigt, und in
  `invoice-line/fixtures.ts` eine Beschreibung, die nach M1 noch faltet (mit 65
  ab rund 210 Zeichen). Die Spalte „Nachweis“ der Schnittstelle nennt dann
  diese Story.

**Hinweise**

- **H1 · 68 Zeichen sind nicht 68ch.** `lw-ui-text` ist `max-width: 68ch`. In
  `.v3bkr__text` (579 px) fasst eine Zeile Prosa rund 83 Zeichen, weil `ch` die
  Breite der Ziffer 0 ist. JSDoc („68 for running text (`lw-ui-text`)“) und
  Spec („die Satzbreite von `lw-ui-text`“) setzen beides gleich. Für die
  Begründung heißt das: Von 1016 Faltungen zwischen 800 und 900 Zeichen sparen
  944 zwei Zeilen, 72 nur eine. Kriterium 4 ist trotzdem erfüllt. Abhilfe wäre
  `lineChars={80}` in `BookingReview` oder ein Satz in JSDoc und Spec, der 68
  nicht als Satzbreite ausgibt. Der Ausbau „gemessene Zeilen“ ist damit noch
  nicht fällig.
- **H2 · Wie weit ein Text jetzt ganz dasteht.** Der Teaser endet vor `max`,
  deshalb steht künftig ein Text bis höchstens `max + 2 × lineChars - 2` Zeichen
  ganz da. Mit den Vorgaben sind das 314 Zeichen (Provenance, Zuordnungs-Notiz),
  294 in `CaseFacts` (160), 303 und 295 in `InvoiceLineFacts` (169 und 161) und
  834 in `BookingReview` (700). Das
  geschieht überall in `FieldList`, Drawer oder Aufklapper, nicht in einer
  Zelle. In der Zelle der Rechnungszeile sind es nach M1 bis rund 210 Zeichen.
- **H3 · Zwei Stellen beschreiben noch den alten Schnitt.**
  `docs/entitaeten/invoice-line.md` Zeile 63 sagt „gekürzt ab 81 Zeichen (p90)“.
  Der Kommentar in `BookingReview.tsx` über `LongText max={700}` sagt „Cut only
  past about ten lines“. Gefaltet wird jetzt erst, wenn zusätzlich zwei Zeilen
  verdeckt würden. In der Begründung sind das rund 11 Zeilen. Beide Stellen
  sollten den neuen Schnitt nennen, mit Datum.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | `InvoiceLineRow` setzt `lineChars={70}`, gemessen statt geschätzt (68–70 Zeichen je Zeile in der Zelle von `InvoiceLineList`, Abnahme). Das Kriterium hat der Spec-Autor so gefasst, dass es die Wirkung misst: Jede Faltung spart mindestens zwei Zeilen |
| M2 | Neue Story `NarrowLine`: `lineChars` 30 in einem Rahmen von 240 px, derselbe Text, der mit der Vorgabe ganz dasteht, faltet dort |
| H1 | Die Vorgabe ist 80 statt 68: Die 68ch von `lw-ui-text` fassen etwa 83 Zeichen. JSDoc und Einordnung sagen das |
| H2 | bleibt als Folge der Regel: Ein Text steht bis etwa `max + 2 × lineChars` ganz da |
| H3 | `docs/entitaeten/invoice-line.md` und der Kommentar in `BookingReview.tsx` beschreiben den neuen Schnitt |

Probe des Autors (Server-Render): `Clamped` (180) und `CustomLimit` (60) falten weiter,
`JustOverLimit` steht ganz, `NarrowLine` faltet.

## Nachprüfung 1 (2026-10-27)

Gemessen am Arbeitsbaum, im selben Verfahren wie oben: Dev-Server 6107,
`scripts/cdp.mjs`, 1280 und 1440 px, Server-Markup per esbuild CJS, HEAD
`4c332e7` als Vorher. Für die Zelle wurden 1685 Beschreibungen von 82 bis 330
Zeichen in die Zelle von `invoicelinelist--edges` gesetzt, je in zehn Lagen der
Wortgrenze. Gemessen wurde zu und ganz. Die Skripte liegen im Scratchpad als
`n1-*`.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 · jede Faltung in der Zelle von `InvoiceLineList` spart mindestens zwei Zeilen | `InvoiceLineRow.tsx` setzt `lineChars={70}`, mit Kommentar zur Messung. Die Zelle ist bei 1280 und 1440 px 428 px breit. 775 der 1685 Längen falten, das erste Mal bei 140 Zeichen Rest. Davon sparen 397 zwei Zeilen und 378 drei, keine Faltung spart weniger. Zum Vergleich in derselben Probe: Mit 68 sparen 5 Faltungen nur eine Zeile, mit 65 sind es 18. 70 ist also der kleinste Wert, der die Regel hält. In der Zeilen-Story (`invoicelinerow--edges`, 472 px) sparen 83 von 775 Faltungen nur eine Zeile. Der Rahmen dort ist eine Fixture, der Einsatzort ist die Liste | ✓ |
| M1 · wird eine Zeile höher als vor 0234? | Ja. Vor 0234 faltete jede Beschreibung über 81 Zeichen, zu stand sie auf 2 Zeilen, die Zeile war höchstens 207 px hoch. Jetzt sind 521 der 1685 Längen höher als unter HEAD, die Längen von 135 bis 219 Zeichen. Ganz stehen 389 Texte auf 2 Zeilen, 468 auf 3 und 53 auf 4. Die Zeile ist dann höchstens 245 px hoch, 38 px oder zwei Zeilen mehr. Die Beschreibung der Fixture mit 106 Zeichen steht auf 2 Zeilen, die Zeile bleibt 206 px hoch. Das folgt aus der Regel des Owners und sprengt die Zeile nicht | ✓ (N1) |
| M2 · `NarrowLine` faltet, `JustOverLimit` steht mit der Vorgabe ganz | `v3-primitives-werte-longtext--narrow-line` bei 1280 und 1440 px: gefaltet mit „ mehr ▾“, Rahmen 240 px, zu 12 Zeilen und ganz 14. Die Faltung spart also 2 Zeilen. `--just-over-limit`: kein `details`, alle 355 Zeichen sichtbar, 74 px hoch. Server-Render: `Short`, `Clamped`, `CustomLimit` und `NarrowLine` liefern dasselbe Markup wie HEAD, `JustOverLimit` steht ganz. Die Spalte „Nachweis“ der Schnittstelle nennt beide Stories. Die Konsole meldet in keinem Aufruf etwas | ✓ |
| H1 · Vorgabe 80: ändert sich etwas bei den Aufrufern? Spart die Faltung in BookingReview zwei Zeilen? | Die Sonde über 192 Story-Dateien zählt dasselbe wie mit 68: 103 Aufrufe, 10 über `max`. Dieselben 6 stehen jetzt ganz, dieselben 4 bleiben gefaltet (Zeile 6 der Abnahme). In `InFoldout` (`.v3bkr__text` 579 px) fallen 2140 Faltungen unter 4367 Begründungen von 701 bis 1000 Zeichen, die erste bei 849 Zeichen. 965 davon sparen zwei Zeilen, 1157 drei und 18 vier, keine spart weniger als zwei. 705 und 760 Zeichen stehen ganz. Die Randprobe hält mit der neuen Vorgabe: Mit 80 steht ein Rest von 159 ganz, 160 faltet. Mit 70 ist es 139 / 140, mit 30 ist es 59 / 60. JSDoc und „Einordnung“ nennen 80 und die 83 Zeichen von 68ch | ✓ |
| H3 · die beiden Textstellen | `docs/entitaeten/invoice-line.md` Zeile 63 sagt „gekürzt ab 81 Zeichen (p90), aber nur, wenn dahinter mindestens zwei Zeilen der Zelle stünden (`LongText lineChars={70}`, 0234)“. Der Kommentar in `BookingReview.tsx` sagt: ab 700 Zeichen, „about nine lines“, nur wenn mindestens zwei Zeilen verdeckt würden. Beides stimmt mit der Messung: 705 Zeichen sind 9 Zeilen. Datiert sind beide über 0234 | ✓ |
| `pnpm typecheck` | Exit 0. `check:when`, `check:language` und `check:type` enden mit Exit 0, ebenso ihr `--test`. `px` steht in `LongText.tsx` nicht und im Diff nur im Kommentar „at 1280 and 1440 px“ | ✓ |

**Hinweis**

- **N1 · Die Zeile der Rechnungsposition wird bis zu zwei Zeilen höher als vor
  0234.** Das ist die Folge der Regel. Mit 70 stehen 53 von 1685 Probetexten
  ganz auf 4 Zeilen (245 statt 207 px), obwohl eine Faltung dort zwei Zeilen
  sparen würde. 70 liegt am oberen Rand der Messung und ist der kleinste Wert,
  bei dem keine Faltung nur eine Zeile spart. Ein kleinerer Wert tauscht die
  4-Zeilen-Fälle gegen Faltungen mit einer Zeile, bei 65 sind es 3 gegen 18.
  Kein Handlungsbedarf, solange der Owner die höhere Zeile für die Regel in
  Kauf nimmt.
