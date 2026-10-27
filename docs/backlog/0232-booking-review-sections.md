# 0232 · BookingReview: Abschnitte mit Gruppenkopf, Kästen im Aufklapper, „Prüfungen“

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/journal-entry/` (`BookingReview`), `patterns/` (`Review.tsx`: `CheckItems`, `CheckResult`, `checkSummary`) |
| Klassen-Test | `BookingReview` nein, nur mit dem Buchungssatz; die Wörter in `CheckItems` ja |
| Quelle | Owner 2026-10-27 über llcto: „Diese Seite gefällt mir optisch noch nicht … mir fehlt klare visuelle Trennung, kleine Überschriften und farbliche Trennungen … Die Badges z. B. sind gerade nicht zuordenbar … dann können wir sie auch weglassen.“ Entscheid llcto für den Owner, 2026-10-27: Variante A im Aufklapper, dieselben Abschnitte ohne Kästen in der Fallansicht; „Prüfungen“ im ganzen Set statt „Prüfpunkte“ |
| Ersetzt | in der App nichts neu; `ProposalFoldout.tsx` hängt `BookingReview` ein und bekommt das neue Bild ohne neue Prop |
| Blockiert | den Zeigerhub der App (ll-abnahme) |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Klappt die Sachbearbeiterin eine Buchungszeile auf, sieht sie heute einen grauen
Block. Oben stehen drei Badges ohne Bezeichnung („Aufwand“, „Ludwig“, „Sicher“)
und rechts „Vorschlag“, darunter die Konten auf weißem Grund, die Begründung
nach einem Satz abgeschnitten, und Prüfpunkte mit rohen Codes in der Zeile. Es
fehlen Trennung und kleine Überschriften. Künftig stehen drei Abschnitte da, jeder mit
Gruppenkopf und als weißer Kasten im grauen Aufklapper: **Buchung**,
**Begründung** (mit Quellen), **Prüfungen**. Die Begründung steht voll da, die
Prüfungen in einer Zeile ohne Codes. Was von den Badges bleibt, steht mit
Bezeichnung in einer ruhigen Zeile.

Entscheidungsbilder: `scratchpad/bkr/today.png`, `variant-a.png`,
`variant-b.png` der Designer-Sitzung vom 2026-10-27; vorgelegt über llcto.

## Einordnung

- **Umbau statt neu:** `BookingReview` (0219) trägt den Fall. Geändert wird die
  Darstellung, die Schnittstelle bleibt.
- **Gruppenkopf statt Overline:** Die Köpfe der Abschnitte haben die Rolle
  „Gruppenkopf“ (`.lw-ui-group`, `h3`/`h4`, ≥ 2 Gruppen in einer Fläche). Die
  Overline steht nach 0220 nur über einem Titel.
- **Variante A:** Der Aufklapper einer Tabellenzeile ist im Set grau
  (`ExpandableRow`). Die Abschnitte sind weiße Kästen darin, wie die weiße Karte
  der Rückfrage auf grauer Seite. In der Fallansicht (`lines="full"`) steht
  `BookingReview` in einer Karte. Dort trennen Gruppenköpfe und Abstand, ohne
  eigene Kästen.
- **Badges:** Neben dem Kopf „Buchung“ steht jedes Wort mit seinem Namen.
  - **Satzart:** „Satzart: Aufwand“, das GLOSSARY-Wort für `kindLabel`.
  - **Sicherheit:** „Sicherheit:“ mit `Confidence`. Das sind Punkt in der Stufe
    und Wort aus der Registry, der Hover nennt die Bedeutung der Stufe. Den Namen
    der Achse liefert `AXIS_LABEL.confidence` („Sicherheit“). Im Auftrag stand
    „Konfidenz“; das ist nicht das Wort der Registry.
  - **Stand:** Er ist ein Zustand und bleibt deshalb ein `StatusBadge` mit
    Registry-Wort (Z2). Er erscheint nur, wenn er nicht „Vorschlag“ ist: Im
    Schritt „Buchungen“ ist jede Zeile ein Vorschlag, eine Abweichung
    (übernommen, abgelehnt) sagt etwas.
  - **Sachverhalt:** `caseKind` wird eine Zeile über den Sätzen, „Satzarten:
    Aufwand mit Zahlung“. Die Satzart gilt je Satz, deshalb steht für die Sätze
    eines Sachverhalts der Plural.
  - **Mehrere Sätze:** Der Kopf zählt, „Buchung 1 von 2“, ohne Overline
    darüber.
- **Codes:** `CheckItems` zeigt in der Zeile einer Gruppe nur noch den Satz
  („13 von 13 Prüfungen bestanden“). Der Code bleibt klein an der einzelnen
  Prüfung, wenn sie aufgeklappt ist. Das ist ein Systementscheid für jede
  `CheckItems`-Liste, nicht nur hier, und kehrt den Kommentar „The codes stay in
  the summary“ um.
- **„Prüfungen“:** In `CheckItems`, `CheckResult` und `checkSummary` heißt es
  „Prüfungen“ bzw. „Prüfung“ statt „Prüfpunkte“ bzw. „Prüfpunkt“; ebenso der Kopf
  in `BookingReview`. Story-Texte ziehen nach. Kommentare in `src/ludwig/`
  gehören der App und bleiben.

## Schnittstelle

Keine neue Prop an `BookingReview`. Geändert ist die Darstellung, und zwar:

| Teil | heute | neu |
|---|---|---|
| Kopf eines Satzes | Badges Art und Konfidenz, Stand rechts | Gruppenkopf „Buchung“ (bei mehreren „Buchung 1 von 2“), daneben „Satzart: …“ und „Sicherheit:“ mit `Confidence` (Hover: Bedeutung der Stufe); der Stand rechts als `StatusBadge`, nur wenn nicht `proposed` |
| Satz | weißer Kasten `.v3bkr__entry` | im Kasten „Buchung“ (`compact`) bzw. unter dem Kopf (`full`) |
| Begründung | `ProvenanceRows`, Text nach 180 Zeichen gekürzt | Abschnitt „Begründung“, Text voll; erst ab etwa fünf Zeilen gekürzt (`LongText max`); „Quellen“ als zweiter Gruppenkopf im selben Kasten |
| Prüfungen | Kopf „Prüfpunkte“, Codes in der Zeile | Abschnitt „Prüfungen“, Zeilen ohne Codes |
| Judge | Block ohne Kasten | eigener Kasten mit Gruppenkopf (Registry-Wort der Achse, heute „Judge“), daneben das Urteil als `StatusBadge`; Einschätzung unverändert |
| Belege & USt (`evidence`), Aktionen | daneben bzw. zuletzt | unverändert |

Was die Komponente **nicht** kann (bewusst): eine andere Reihenfolge der
Abschnitte; einen Kasten in der Fallansicht.

## Verhalten

- Server-tauglich wie bisher; die Aufklapper der Prüfungen bleiben natives
  `<details>` (`Disclosure`).
- Leer bleibt leer: Ein Abschnitt ohne Inhalt steht nicht da, auch nicht sein Kopf
  (0219).
- Ebene der Köpfe: `h3`. Im Aufklapper unter einem Kartenkopf (`h2`) und in der
  Fallansicht in einer Karte mit Kopf ist das die Ebene ohne Sprung. Die Abnahme
  hat den Sprung von `h4` gemeldet (H1); einen eigenen `headingLevel` braucht es
  erst, wenn ein Ort `h4` verlangt.

## Stories

Keine neue Story; die vorhandenen zeigen das neue Bild: `ListCompact` (Kästen,
alle Abschnitte), `ListFull` und `CaseEditable` (ohne Kästen), `RoutineCase`
(ohne Begründung: kein Abschnitt), `ExpenseWithPayment` (zwei Sätze, „Satzarten“,
„Buchung 1 von 2“, die Zahlung „Freigegeben“), `InUse`. Dazu kommt die Story `InFoldout` mit den Werten der Demo
(Rechnung LB-361353, erfundener Kreditor) in einer Tabellenzeile mit offenem
Aufklapper, wie im Schritt „Buchungen“.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| die Ebene der Köpfe nach Lage | `headingLevel?: 3 \\| 4` | ein Ort verlangt `h4` (unter einem Abschnittstitel `h2` und einem Kartenkopf `h3`) |
| „Judge“ als Wort der Kanzlei | Registry-Wort für den Abschnitt | der Owner entscheidet das Wort (heute „Judge“, in der Liste „Prüfung durch Ludwig“) |

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der TSX, keine lokale Label-Map; Wörter für Konfidenz und Stand aus der Registry
- [ ] Alle Stories oben vorhanden
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] `lines="compact"`: drei Abschnitte Buchung · Begründung · Prüfungen (dazu Judge, wenn relevant) als weiße Kästen mit Rand `--color-border-subtle` auf dem grauen Aufklapper; Kopf je Kasten ein Gruppenkopf (12,5/700) (`ListCompact`, `InFoldout`)
- [ ] `lines="full"`: dieselben Abschnitte und Köpfe ohne Kästen (`ListFull`, `CaseEditable`)
- [ ] Kein Badge ohne Bezeichnung mehr: neben dem Kopf „Buchung“ steht „Satzart: …“ (GLOSSARY) und „Sicherheit:“ (Registry-Name der Achse) mit `Confidence` (Punkt in der Stufe und Wort, Hover); der Stand nur als `StatusBadge` und nur, wenn er nicht `proposed` ist (`ListCompact`, `InFoldout`, `ExpenseWithPayment` mit „Freigegeben“)
- [ ] Die Begründung steht in `InFoldout` voll (drei Sätze, kein „mehr“)
- [ ] `CheckItems`: Die Zeile einer Gruppe nennt keinen Code mehr, „13 von 13 Prüfungen bestanden“, „11 Prüfungen nicht prüfbar“; aufgeklappt stehen die Prüfungen mit ihrem Satz (`Review`-Stories, `InFoldout`)
- [ ] „Prüfpunkt“ kommt in `src/ui/v3` und `src/showcase` nicht mehr vor (außer in historischen Kommentaren mit Datum); `checkSummary` und `CheckResult` sagen „keine Prüfungen“
- [ ] Ein leerer Abschnitt steht nicht da, auch nicht sein Kopf (`RoutineCase`)
- [ ] Farbe nur nach Stufe: Rahmen und Grund der Kästen neutral, Zustandssymbole aus `StateIcon`

### Messung des Bauenden (keine Abnahme)

*Stand vor der Abnahme; die Wörter „Art:“ und „Art des Falls:“ heißen seit
Nachbesserung 1 und 2 „Satzart:“ und „Satzarten:“, die Sicherheit ist
`Confidence`.*

`scripts/cdp.mjs`, Storybook :6107, 1280 px:

| Story | Köpfe (12,5/700) | Kästen | Codes in der Gruppenzeile | Zeile neben „Buchung“ |
|---|---|---|---|---|
| `InFoldout` | Buchung · Begründung · Quellen · Prüfungen | weiß (`rgb(255,255,255)`) | 0 („13 von 13 Prüfungen bestanden“, „11 Prüfungen nicht prüfbar“) | „Art: Aufwand · Sicherheit: Sicher“ |
| `ListCompact` | Buchung · Begründung · Prüfungen | weiß | 0 | „Art: Aufwand · Sicherheit: Plausibel“ |
| `ListFull` | dieselben | keine (transparent) | 0 | „Art: Aufwand“ |
| `CaseEditable` | Buchung · Begründung · Quellen · Prüfungen | keine | 0 | „Art: Aufwand · Sicherheit: Plausibel“ |
| `RoutineCase` | Buchung · Prüfungen (keine Begründung: kein Abschnitt) | weiß | 0 | „Art: Aufwand · Sicherheit: Sicher“ |
| `ExpenseWithPayment` | je Satz | weiß | 0 | „Art: Aufwand“, „Art: Zahlung“; darüber „Art des Falls: …“ |

In `InFoldout` steht die Begründung ganz, ohne „mehr“. Übrig sind nur noch
Badges mit einem Zustand aus der Registry: das Urteil des Judge und der Stand,
wenn er nicht „Vorschlag“ ist.

## Abnahme

Gemessen wurde mit `scripts/cdp.mjs` in einem Messbrowser, Storybook :6107, bei 1280
und 1440 px. Geprüft sind die sieben Stories von `BookingReview` und 24 Stories
der Aufrufer. Für den Vergleich mit HEAD wurden `ProvenanceRows` und
`ProvenanceNote` aus HEAD und aus dem Arbeitsbaum mit `renderToStaticMarkup`
gerendert (esbuild-Bündel außerhalb des Repos). Auf demselben Weg lief
`BookingReview` mit den Ständen `accepted` und `reversed`, die keine Story zeigt.
Skripte und Screenshots liegen im Scratchpad der Abnahme (`measure-0232.mjs`,
`measure-0232b.mjs`, `0232-*.png`).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. Statt `pnpm build` lief derselbe Befehl `storybook build -o …` mit eigenem Ausgabeordner außerhalb des Repos: Exit 0 | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 (0 Zeilen), `pnpm check:when` Exit 0. `ProvenanceSources` trägt beides. Story-Export `InFoldout` und Konstanten sind englisch. Der Nachbar `ProvenanceRows` verweist nicht zurück (H3) | ✓ |
| Kein Hex, kein px in der TSX, keine lokale Label-Map; Wörter für Konfidenz und Stand aus der Registry | Diff gelesen: kein Hex und kein px in `BookingReview.tsx`, `Review.tsx`, `Provenance.tsx`. px steht nur in den `cols` der Story `InFoldout`, wie in den Nachbar-Stories. Keine Label-Map. „Sicherheit“ kommt aus `AXIS_LABEL.confidence`, der Wert über `resolveStatus`, der Stand über `StatusBadge axis="journal_entry"`. `check:type` Exit 0, `check:contrast` Exit 0. `check:classes` Exit 1 mit den vier bekannten Altklassen (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`), keine aus diesem Diff. `--test` der fünf Skripte Exit 0. Die Wörter „Art“ und „Art des Falls“ haben keine Quelle (M5) | ✓ |
| Alle Stories oben vorhanden | Sieben Stories im Index: `v3-entitäten-buchungssatz-bookingreview--list-compact`, `--list-full`, `--case-editable`, `--routine-case`, `--expense-with-payment`, `--in-use`, `--in-foldout`. Story-Deckung: Keine Story zeigt einen anderen Stand als `proposed`, der neue Zweig ist nur per SSR prüfbar (M3) | ✓ (Deckung M3) |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Erfüllt: Stufe und Importe, Hex/px, Text links und Zahlen rechts, Kontrast (Hinweis-Zeile `rgb(113,113,113)` = text-subtle, 4,51:1 auf bg-soft, 4,88:1 auf Weiß), Fokusring der Aufklapper (2 px solid, sichtbar), Trefferfläche (Aufklapper 41 px hoch, Knöpfe 30 px), Rand ohne Schatten, `min-width: 0` an `.v3bkr__sec`. Nicht erfüllt: „Schrift aus der Skala“, denn die Quellen stehen in `full` bei 16 px (M4). „Farbe nur als Kritikalitätsstufe … Status nur über Registry“: Die Sicherheit verliert ihre Stufe (M1). Überschriften: `h4` springt unter einem Kartenkopf `h2` (H1) | ✗ M1, M4 |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sieben Stories bei 1280 und 1440 px angesehen, Screenshots `0232-*.png`. Kein Querlauf (`scrollWidth` = Breite). Die Konsole aller 14 Aufrufe ist leer; der Fang ist mit einem Probe-`console.error` geprüft | ✓ |
| `lines="compact"`: Kästen und Gruppenköpfe (`ListCompact`, `InFoldout`) | `InFoldout`: Köpfe Buchung · Begründung · Quellen · Prüfungen, je `h4.lw-ui-group` 12,5/700 `rgb(92,92,92)`. Kästen `rgb(255,255,255)`, Rand 1 px `rgb(236,239,243)` = `--color-border-subtle`, Radius 4 px, auf `td.v2tbl__detail` `rgb(244,246,248)`. `ListCompact`: Buchung · Begründung · Prüfungen ebenso. Der vierte Kasten (Judge) hat keinen Gruppenkopf, sondern `.v3bkr__who` „Judge“ mit 12,5/400 (M2) | ✗ M2 |
| `lines="full"`: dieselben Abschnitte und Köpfe ohne Kästen (`ListFull`, `CaseEditable`) | `ListFull` und `CaseEditable` (ebenso `InUse`): dieselben Köpfe, `.v3bkr__sec` transparent, Rand 0. Der Satz behält wie bisher seinen eigenen Rahmen `.v3bkr__entry` (weiß, Rand subtle) (H4) | ✓ |
| Keine Badges für Art und Sicherheit; „Art: … · Sicherheit: …“; Stand nur als `StatusBadge`, nicht bei `proposed` (`ListCompact`, `InFoldout`) | `ListCompact`: „Art: Aufwand · Sicherheit: Plausibel“, `InFoldout`: „Art: Aufwand · Sicherheit: Sicher“, je `span.lw-ui-hint` 12,5/400. Kein `.bdg` im Kopf, das einzige Badge eines Satzes ist das Judge-Urteil. Beim Stand `proposed` steht kein Badge (beide Stories). SSR: `accepted` ergibt `StatusBadge` „Freigegeben“ (`bdg-success`), `reversed` ergibt „Zurückgezogen“ (`bdg-neutral`), auch in `full` ohne `entry.full`. Der Code erfüllt das Kriterium, aber das Kriterium selbst ist falsch: „Unsicher“ und „Geraten“ werden grauer Text (M1) | ✗ M1 (Spec) |
| Die Begründung steht in `InFoldout` voll | `InFoldout`: 305 Zeichen, drei Sätze, vier Zeilen bei 579 px Breite (68ch). Kein `details`, kein „mehr“, bei 1440 px ebenso | ✓ |
| `CheckItems`: Gruppenzeile ohne Code; aufgeklappt die Prüfungen mit Satz (`Review`-Stories, `InFoldout`) | `InFoldout`: Gruppenzeilen „13 von 13 Prüfungen bestanden“ und „11 Prüfungen nicht prüfbar“, 0 `.v2pp__code` in `.v2pp__sum`. Aufgeklappt stehen 13 bzw. 11 Zeilen mit Frage, Satz („Erfüllt.“, „Am Beleg nicht vermerkt.“) und Code. In `v3-patterns-prüfen-checklist--check-items-mixed` („3 von 5 Prüfungen bestanden“, „2 Prüfungen nicht prüfbar“), `--check-items-all-open` („12 Prüfungen nicht prüfbar“) und `--check-items-all-green` („12 von 12 Prüfungen bestanden“) steht kein Code in der Gruppenzeile. Befunde behalten ihren Code in der Zeile | ✓ |
| „Prüfpunkt“ nicht mehr in `src/ui/v3`, `src/showcase`; „keine Prüfungen“ | `grep -rni "prüfpunkt" src/ui/v3 src/showcase` liefert einen Treffer, den datierten Kommentar `Review.tsx:528` (2026-10-27, 0232). Im sichtbaren Text der 31 gemessenen Stories steht kein „Prüfpunkt“. `--check-items-empty`: „Keine Prüfungen für diesen Fall.“, `--check-result-tones`: „Keine Prüfungen“ mit Titel „keine Prüfungen“. In `src/ludwig/` stehen noch zwei sichtbare Texte mit „Prüfpunkt“ (M6) | ✓ |
| Ein leerer Abschnitt steht nicht da (`RoutineCase`) | `RoutineCase`: nur die Köpfe Buchung · Prüfungen, kein `.v3bkr__text`. Kein Judge-Kasten (Urteil `confirm` ohne Satz) | ✓ |
| Farbe nur nach Stufe: Kästen neutral, Zustandssymbole aus `StateIcon` | Kästen `rgb(255,255,255)` mit Rand `--color-border-subtle`, ohne Schatten. Zustandszeichen aus `StateIcon` (Kreuz, Haken, offener Kreis). Das Judge-Urteil ist `bdg-info` aus der Registry. Zur Sicherheit siehe M1 | ✓ |

**Zusätzlich geprüft (Auftrag der Abnahme):**

- `ProvenanceSources` lässt `ProvenanceRows` unverändert. Der SSR-Vergleich von HEAD
  gegen den Arbeitsbaum lief für `ProvenanceRows` und `ProvenanceNote` mit drei
  Eingaben: nur Quellen, alle Zeilen, nur Begründung. Die Quellen deckten `href`,
  `onOpen`, nur `label`, `href` ohne `label` und nur `quote` ab. Ergebnis:
  byte-gleich, und die Liste von `ProvenanceSources` steht wörtlich in der
  HEAD-Ausgabe. Im Browser hat jedes `li` dieselbe Form (Art, Link oder Knopf oder
  Text, Zitat) in `Provenance/Rows`, `Note`, `InUse`, `WithVerdict`, `Edges`,
  `AiBookingNotes/Box` und `JournalEntryFacts/Filled`.
- Aufrufer von `CheckItems`: Die Gruppenzeilen stehen ohne Code in den
  `Review`-Stories, in `seiten-sachverhalt-reiter--plausibility` (Kopf
  „Prüfungen“, „3 von 4 Prüfungen bestanden“) und in
  `seiten-beleg-reiter-vorsteuer--needs-facts`, `--allowed`, `--forbidden`.
  Die Fakten sind unverändert, denn `kind="fact"` hatte nie Codes in der Zeile.
  Befunde (rot, gelb) behalten ihren Code. `CheckResult` und `checkSummary` ändern
  laut Diff nur das Leerwort. `seiten-deck--protocol` sagt „Alle 9 Prüfungen sind
  erfüllt“. In allen 24 Aufrufer-Stories ist die Konsole leer, und bei 1280 px
  läuft nichts quer.

Abgenommen von / am: fremde Abnahme (schlanke Abnahme plus Messung der Kriterien), 2026-10-27 · Offene Punkte: M1–M6; H1–H7 nicht blockierend

### Mängel

- **M1 · Als grauer Text verliert die Sicherheit ihre Stufe.** Die Achse
  `confidence` hat vier Stufen: „Sicher“ success, „Plausibel“ info, „Unsicher“
  warning, „Geraten“ danger („Nicht ungeprüft freigeben.“). Gerendert (SSR) steht
  „Sicherheit: Geraten“ in derselben grauen `lw-ui-hint`-Zeile wie „Sicherheit:
  Sicher“. Auch der Hover mit der Bedeutung fällt weg, denn der `title` der Zeile
  trägt nur die Beschreibung der Satzart (Z3). Für genau diesen Fall hat das Set
  `Confidence` („How confident a machine-made proposal is“: ein Punkt in der Farbe
  der Stufe und das Wort). `ProvenanceRows` und `AiBookingNotes` zeigen denselben
  Wert so. Die Einordnung begründet den `StatusBadge` für den Stand mit Z2. Für die
  Sicherheit gilt dasselbe, denn auch sie ist eine Achse der Registry. Das Kriterium
  „Keine Badges mehr für Art und Sicherheit“ erzwingt den Verlust. Es widerspricht
  §3 und der Owner-Regel vom 2026-09-29, beim Vereinheitlichen nichts zu verlieren,
  was die Daten hergeben. Nächster Schritt: Die Spec entscheidet neu, etwa
  „Sicherheit:“ mit `Confidence`. So bleibt die Angabe bezeichnet und ohne Badge,
  und die Stufe bleibt erhalten. Das Kriterium ändert der Spec-Autor, nicht die
  Abnahme.
- **M2 · Der Judge-Kasten hat keinen Gruppenkopf.** In `ListCompact` (ebenso
  `CaseEditable` und `InUse`) steht „Judge“ als `div.v3bkr__who` mit 12,5/400,
  nicht als `h4.lw-ui-group` mit 12,5/700. Damit verfehlt `ListCompact` das
  Kriterium „Kopf je Kasten ein Gruppenkopf“. Von vier Kästen untereinander sieht
  einer anders aus, und die Gliederung der Überschriften kennt den Abschnitt nicht.
  Die Spec widerspricht sich hier selbst: Die Schnittstelle sagt „eigener Kasten,
  Inhalt unverändert“, das Kriterium verlangt den Gruppenkopf, und die Messtabelle
  des Bauenden lässt den Kasten aus. Nächster Schritt: den Kopf als
  `h4.lw-ui-group` mit dem heutigen Wort setzen und das Urteil daneben (das Wort
  selbst bleibt Ausbau). Sonst nimmt die Spec den Judge ausdrücklich aus.
- **M3 · Der neue Zweig des Stands hat keine Story.** Neu ist, dass ein anderer
  Stand als `proposed` als `StatusBadge` erscheint. Alle sieben Stories setzen aber
  `status: "proposed"`. Das Kriterium nennt `ListCompact` und `InFoldout`, und beide
  zeigen nur, dass das Badge wegfällt. Hier ist der Zweig nur per SSR geprüft
  (`accepted` → „Freigegeben“, `reversed` → „Zurückgezogen“). Die App übergibt
  jeden Stand (`proposal-row.ts`: `status: p.status`). Nächster Schritt: eine
  Story, oder ein zweiter Satz in einer vorhandenen Story, mit `accepted` bzw.
  `reversed`. Die Spec nennt sie im Kriterium.
- **M4 · Die Quellen haben keine eigene Schriftgröße.** `ProvenanceSources` setzt
  keine Größe; früher gab sie die `FieldList` von `ProvenanceRows`. In der
  Fallansicht erbt die Liste deshalb die Größe der Umgebung. Gemessen sind 16 px
  in `CaseEditable` und `InUse` für Art, Name und Zitat, neben 13,5 px für
  Begründung und Prüfungen (`0232-case-editable.png`). Im Aufklapper sind es
  13,5 px, weil `.v2tbl__detail` die Größe setzt. Das verstößt gegen §9 „Schrift
  aus der Skala“. 0231 würde den Fehler in der App verdecken, im Set bleibt er.
  Nächster Schritt: die Größe an `.v3prov__sources` setzen (`--fs-ui`) oder die
  Liste einer Rolle zuordnen, dann in `CaseEditable` nachmessen.
- **M5 · „Art“ und „Art des Falls“ sind neue Bezeichnungen ohne Quelle.** Im
  GLOSSARY heißt der Wert des Satzes **Satzart** (`entry kind`: Aufwand,
  Zahlung …). „Art des Sachverhalts“ ist dort eine andere Achse (Einzelsachverhalt,
  laufender Sachverhalt …). Das Set nutzt „Art“ auch als Spaltenkopf genau dieser
  Achse (`case-columns.tsx`). „Art des Falls: Aufwand mit Zahlung“ benennt also
  eine Mischung von Satzarten mit dem Namen der Fallart. Zudem ist „Fall“ nicht das
  Wort der Kanzlei (Sachverhalt). In `ExpenseWithPayment` steht derselbe Wert
  „Aufwand mit Zahlung“ einmal als „Art des Falls“ und einmal als „Art“. Nach
  CLAUDE.md §7 ist ein neues Label eine Frage an den Owner. Nächster Schritt:
  Wörter aus dem GLOSSARY nehmen („Satzart: Aufwand“, für den Fall etwa
  „Satzarten: Aufwand mit Zahlung“), oder die Frage geht an den Owner.
- **M6 · Wortwechsel und Code-Entscheid fehlen in der Doku.** Die Spec nennt beides
  einen Systementscheid. Nach CLAUDE.md §3 gehört er mit Datum in Guideline und
  Doku. Der Kommentar in `Review.tsx` allein reicht nicht. Offen ist:
  (a) Im GLOSSARY steht beim „Review item“ als deutsches Wort `Prüfpunkt`. Das
  GLOSSARY spiegelt die App, also braucht die Änderung einen Befund in
  `docs/befunde-app.md`.
  (b) Zwei Texte der App sagen weiter „Prüfpunkt“: `batch-review/domain/steps.ts:31`
  („Alle Prüfpunkte auf einen Blick …“, Schritt 8) und
  `accounting-cases/domain/review-score.ts:136–137` („Prüfpunkt P-… rot“, der
  Prüfgrund im (i) der Liste).
  (c) In `design-guidelines.md` L7 steht „Prüfpunkte im Akkordeon“ und „Bestandene
  Prüfpunkte“.
  (d) `ton-und-sprache.md:119` sagt ebenfalls „Prüfpunkt“.
  Nächster Schritt: L7 und `ton-und-sprache.md` mit Datum nachziehen und einen
  Befund für das GLOSSARY und die zwei Texte der App anlegen.

### Hinweise

- **H1 · Ebene der Köpfe.** Im Hauptfall, dem Aufklapper im Schritt „Buchungen“
  unter einem Kartenkopf `h2`, folgt `h4` direkt auf `h2`. Das verstößt gegen §2a
  Regel 3. Die Spec vertagt das bewusst (Ausbau `headingLevel`) und nennt den
  Auslöser selbst: „eine Abnahme … meldet den Sprung“. Er ist hiermit gemeldet.
- **H2 · „Prüfung“ in zwei Bedeutungen.** In derselben Liste heißt die Spalte des
  Judge „Prüfung durch Ludwig“ (`JournalEntryReviewList`), im Aufklapper heißen die
  Regeln „Prüfungen“. Wird „Prüfung durch Ludwig“ das Wort für den Abschnitt des
  Judge (Ausbau), stehen im Aufklapper zwei ähnliche Wörter für zwei Dinge
  untereinander.
- **H3 · Nachbarverweise.** Das `@instead` von `ProvenanceRows` nennt
  `ProvenanceSources` nicht (CLAUDE.md §3: „der Nachbarfall bekommt seinen
  `@instead`-Verweis“). Das `@when` von `aiSourcesToProvenance` nennt nur `Note` und
  `Rows`. Der JSDoc von `AiBookingNotesBody` sagt weiter, der Aufklapper einer Zeile
  nutze ihn. `BookingReview` tut das seit 0232 nicht mehr.
- **H4 · Kontext der Stories in `full`.** `ListFull`, `CaseEditable` und `InUse`
  stehen auf grauem Grund. Laut Einordnung steht `full` in einer Karte, so wie in
  der App in `Step3Single`. Deshalb schweben die Abschnitte auf Grau, und nur der
  Satz hat seinen weißen Rahmen. Eine Karte um `CaseEditable` würde das Bild der
  Fallansicht zeigen.
- **H5 · `InFoldout`:** Der Knopf „Ablehnen“ hat kein Objekt (T3). Die
  Nachbar-Stories schreiben „Diesen Satz ablehnen“.
- **H6 · Ein einzelner Kopf.** Ein Satz ohne Begründung, Prüfungen und Judge behält
  nur den Kopf „Buchung“. Das ist ein Gruppenkopf für eine einzige Gruppe (§2a:
  „nie für eine einzige“). Keine Story zeigt den Fall, die Schnittstelle erlaubt ihn.
- **H7 · Zwei Wörter für eine Achse.** `ProvenanceRows` (Zeile „Konfidenz“) und die
  Stories von `Confidence` (`StatusHeader label="Konfidenz"`) sagen „Konfidenz“,
  `BookingReview` sagt nach der Registry „Sicherheit“. Seit 0232 stehen beide
  Wörter für dieselbe Achse im Set.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | Die Sicherheit behält Stufe und Hover: neben „Sicherheit:“ (Registry-Name der Achse) steht `Confidence`, Punkt und Wort aus der Registry. Mit dem Namen davor ist sie zuzuordnen, und das war der Wunsch des Owners. Das Kriterium hat der Spec-Autor entsprechend gefasst; es misst weiter, dass kein Badge ohne Bezeichnung steht |
| M2 | Der Judge-Kasten hat einen Gruppenkopf wie die anderen (`h3.lw-ui-group`, Wort `AXIS_LABEL.judge`), daneben das Urteil als `StatusBadge` |
| M3 | `ExpenseWithPayment`: Die Zahlung steht auf `accepted` und zeigt „Freigegeben“ als `StatusBadge` rechts am Kopf; das ist der Nachweis für den Zweig „Stand ≠ Vorschlag“ |
| M4 | `.v3prov__sources` setzt `--fs-ui` selbst; die Quellen stehen überall bei 13,5 px. In `ProvenanceRows` sind sie unverändert (die Zeilen der Feldliste setzen ebenfalls `--fs-ui`); gemessen in `Provenance/Note` und den BookingReview-Stories |
| M5 | Statt „Art:“ das GLOSSARY-Wort „Satzart:“, auch für den Sachverhalt („Satzart: Aufwand mit Zahlung“). Ein neues Label gibt es damit nicht |
| M6 | Dokumentiert: Guideline L7 (mit Datum und Entscheider), `ton-und-sprache.md`, Befund **L-373** an die App (GLOSSARY `Review item` → „Prüfung“, löst die Doppelbelegung P45; App-Texte `steps.ts:31`, `review-score.ts:136–137`) |
| H1 | Die Köpfe sind `h3` (siehe „Verhalten“) |
| H3 | `ProvenanceRows` verweist im `@instead` auf `ProvenanceSources` |
| H5 | bleibt: Die `full`-Stories stehen auf dem Grund der Story, nicht in einer Karte; die Abschnitte ohne Kästen sind darin dieselben |
| H6 | „Buchung ablehnen“ statt „Ablehnen“ in `InFoldout` |
| H2, H4, H7 | bleiben als Hinweise: „Prüfungen“ neben „Prüfung durch Ludwig“ (Liste) und „Konfidenz“ neben „Sicherheit“ (`ProvenanceRows`) sind Wortfragen für eine eigene Runde; ein einzelner Kopf „Buchung“ ist der Routinefall ohne Begründung und Prüfungen |

## Nachprüfung 1 (2026-10-27)

Gemessen mit `scripts/cdp.mjs` in einem Messbrowser gegen Storybook :6107 bei 1280
und 1440 px: die sieben Stories von `BookingReview`, 25 Stories mit Quellen
(Provenance, AiBookingNotes, JournalEntryFacts, DiffView, Vorsteuer-Reiter,
SourceDocument) und die Stufen von `Confidence`. Für `ProvenanceRows` und
`ProvenanceNote` lief ein SSR-Vergleich: HEAD aus `git archive HEAD src` außerhalb
des Repos gegen den Arbeitsbaum, beide mit esbuild als CommonJS gebündelt. Die App
(`ccd46f0ac`) ist nur gelesen. Skripte, Messdaten und Screenshots liegen im
Scratchpad der Prüfung (`np0232/measure-np0232.mjs`, `fs-scan.mjs`, `ssr-*.tsx`,
`np0232-*.png`).

| Punkt | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| M1 · Stufe und Hover der Sicherheit | `v3-entitäten-buchungssatz-bookingreview--list-compact`, `--case-editable`, `--in-use` („Plausibel“), `--routine-case`, `--in-foldout` („Sicher“), je 1280 und 1440: „Sicherheit:“ (`AXIS_LABEL.confidence`) mit `span.v2dot.v2dot--info` bzw. `--success`. Der Punkt ist `rgb(43,111,156)` bzw. `rgb(63,122,90)`, das Wort steht in der Farbe der Stufe (12,5/600). `v3-patterns-prüfen-confidence--levels` zeigt die vier Stufen getrennt (success, info, warning, danger). Das Wort hat 5,07–6,06:1 auf Weiß und 4,68–5,60:1 auf bg-soft. **Hover:** Punkt, Wort und Zeile tragen keinen `title` (`closest('[title]')` = null). `Confidence` ohne `compact` rendert `DotStatus` ohne `title`. Die Bedeutung der Stufe („Nicht ungeprüft freigeben.“) ist nirgends zu erreichen. HEAD hatte sie im `title` des `StatusBadge` | ✗ Die Stufe ist sichtbar, der Hover fehlt. Die Nachbesserung sagt „behält Stufe und Hover“ |
| M2 · Judge-Kasten mit Gruppenkopf | `--list-compact`, `--case-editable`, `--in-use`: Der vierte Abschnitt hat `h3.lw-ui-group` „Judge“ 12,5/700 `rgb(92,92,92)` (`AXIS_LABEL.judge`), daneben `bdg-info` „Angepasst“. Kein `.v3bkr__who` mehr im DOM | ✓ |
| M3 · Stand ≠ Vorschlag in einer Story | `--expense-with-payment`, 1280 und 1440: Satz 2 (`accepted`) zeigt `.v3bkr__status` „Freigegeben“ als `bdg-success` rechts am Kopf, mit dem `title` „Buchung: Freigegeben · …“. Satz 1 (`proposed`) hat kein Badge | ✓ |
| M4 · Quellen bei 13,5 px, `ProvenanceRows` unverändert | Fallansicht `--case-editable`, `--in-use`: `ul.v3prov__sources` 13,5 px, Art, Name und Zitat je 13,5 px, das Elternteil `section.v3bkr__sec` 16 px. Ein Scan aller Texte in `.v3bkr` (ohne `aside`) in den sieben Stories findet kein 16 px mehr. `ProvenanceRows`/`ProvenanceNote`: Der SSR-Vergleich HEAD gegen Arbeitsbaum lief mit drei Eingaben: nur Quellen (`href`, `onOpen`, nur `label`, `href` ohne `label`, nur `quote`), alle Zeilen, nur Begründung. Ergebnis: byte-gleich. Im Browser steht die Liste in allen zehn Stories mit Quellen außerhalb von `BookingReview` (Provenance `note`, `rows`, `in-use`, `edges`, `with-verdict`; AiBookingNotes `box`; JournalEntryFacts `filled`, `edges`, `in-use`, `repaired`) bei 13,5 px. Ihr Elternteil (Wertzelle, `.v2fields__row` setzt `--fs-ui`) hat ebenfalls 13,5 px, die neue Größe ändert dort also nichts | ✓ |
| M5 · „Satzart“ nach GLOSSARY | Am Satz „Satzart: Aufwand“ und „Satzart: Zahlung“ (`span.lw-ui-hint` 12,5/400). Das stimmt mit GLOSSARY `entry kind` = Satzart überein. Am Fall steht „Satzart: Aufwand mit Zahlung“ über den Sätzen. Das GLOSSARY definiert die Satzart als das, was **ein einzelner** Satz tut, mit fünf Werten (Aufwand, Erlös, Zahlung, Geldtransit, Umbuchung; App `ENTRY_KIND_LABEL`). „Aufwand mit Zahlung“ ist keiner davon, sondern die Mischung des Falls (`mixedCaseKind`, P58). Dazu zeigt `--expense-with-payment` im dritten Block einen **einzelnen** Satz mit „Satzart: Aufwand mit Zahlung“ (Fixture `kindLabel`). Für genau diesen Fall sagt das GLOSSARY „„Bürobedarf an Bank“ ist ein Aufwand“, und die App liefert den Wert nie | ✗ teilweise: am Satz erfüllt, am Fall und in der Fixture nicht |
| M6 · Doku und L-373 | (c) L7 ist nachgezogen, mit Datum und Entscheider, und nennt den Entscheid zu den Codes. (d) `ton-und-sprache.md:119` ist nachgezogen. `grep -i prüfpunkt docs` außerhalb `backlog/` und `ludwig/` findet nur datierte oder alte Befundzeilen. (a)/(b) L-373 ist nicht vollständig und nicht genau. In der App enthält `review-score.ts` „Prüfpunkt … rot/gelb“ nicht mehr. Der Text steht heute als Registry-Label `REVIEW_REASON.check_red` „Prüfpunkt rot“ und `check_yellow` „Prüfpunkt gelb“ sowie in der Beschreibung von `tax_sensitive` (`ui/status/status-registry.ts:1097, 1104, 1106`). Die Zeilennummern in L-373 sind die des Spiegels, in der App steht der Text von `steps.ts` in Zeile 60. Es fehlen sichtbare Texte am Review item: `PlausibilityTab.tsx:108, 124, 128` (Kartenkopf „Prüfpunkte“, „Keine Prüfpunkte.“, „Die Prüfpunkte laufen …“, also dieselben Texte, die dieser Diff in `CaseTabs.stories.tsx` umstellt), dazu `CloseCasesPanel.tsx:748`, `case-queries.ts:1270–1271` und `ReturnToAgentPage.tsx:77`. Beim Check point widerspricht sich L-373. Er soll „Prüfpunkt“ behalten dürfen („falls der dort bleibt“), aber `steps.ts` steht auf der Änderungsliste, und das ist der Text des Prüfprotokolls, also ein Check point. Außerdem stellt dieser Diff in `DeckScreens.stories.tsx` das Prüfprotokoll selbst auf „Alle 9 Prüfungen“ um. Check points der App: `Step1.tsx:304`, `Step8.tsx:72, 89`, `ChecklistAction.tsx:28` | ✗ teilweise |
| H1 · Ebene der Köpfe | Alle sieben Stories, 1280 und 1440: nur `h3.lw-ui-group`, kein `h4`. In der App steht der Aufklapper unter dem Kartenkopf der Liste (`JournalEntryReviewList head` → `CardHead`, Vorgabe `h2`). Die Fallansicht steht unter `h2.lw-ui-section` (`Step3Single.tsx:842`), neben den `h3` „Beleg & USt“ und „Zahlung“. Es gibt keinen Sprung. `InFoldout` selbst hat keinen Kartenkopf (N2) | ✓ |
| H2 | bleibt Hinweis; die Angabe stimmt | — |
| H3 · Nachbarverweise | `ProvenanceRows` `@instead` nennt `ProvenanceSources`. Offen und in der Nachbesserung nicht erwähnt: Das `@when` von `aiSourcesToProvenance` nennt nur Note und Rows (`AiBookingNotes.tsx:203`). Der JSDoc von `AiBookingNotesBody` sagt weiter, der Aufklapper der Zeile nutze ihn (`AiBookingNotes.tsx:232`) | teilweise, nicht blockierend |
| H4 · `full` auf grauem Grund | steht in der Nachbesserung als „H5“; die Angabe (bleibt) stimmt inhaltlich | — |
| H5 · „Ablehnen“ ohne Objekt | steht in der Nachbesserung als „H6“. `--in-foldout`: „Buchung übernehmen“ 169×30, „Buchung ablehnen“ 147×30. Die Nachbar-Stories sagen „Diesen Satz ablehnen“. Damit hat eine Komponente zwei Wörter für dieselbe Handlung | ✓ (Wortwahl als Hinweis) |
| H6 · einzelner Kopf | in der Nachbesserung unter „H2, H4, H7“ geführt; bleibt mit Begründung | — |
| H7 | bleibt; die Angabe stimmt (`ProvenanceRows`, Zeile „Konfidenz“) | — |
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` lief nach Auftrag nicht. Der Dev-Server übersetzt alle gemessenen Stories. Die Konsole aller Aufrufe ist leer, der Fang ist mit einem Probe-`console.error` geprüft | ✓ typecheck, Build nicht gelaufen |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` Exit 0 (0 Zeilen), `pnpm check:when` Exit 0, beide `--test` Exit 0. Die neuen Kommentare sind englisch | ✓ |
| Kein Hex, kein px in der TSX, keine lokale Label-Map; Wörter aus der Registry | Diff gelesen: kein Hex und kein px in den drei TSX-Dateien, px nur in den `cols` von `InFoldout`. „Sicherheit“ und „Judge“ kommen aus `AXIS_LABEL`, die Stufe über `Confidence` → `resolveStatus`, der Stand über `StatusBadge`. „Satzart“ ist ein Literal aus dem GLOSSARY, die Registry hat keine Achse dafür. `check:type` Exit 0. `check:classes` Exit 1, nur mit den vier bekannten Altklassen. `--test` von `check-type` und `check-classes` Exit 0 | ✓ |
| Alle Stories oben vorhanden | sieben Stories im Index. Die Story-Deckung des Stands ist jetzt da (M3) | ✓ |
| Prüfliste `design-guidelines.md` §9 | Schrift aus der Skala (M4), Überschriften mit Rolle und Klasse (H1), Farbe nach Stufe, Kontrast (M1) und `min-width: 0` sind erfüllt. Offen: „Texte nach T1–T5 (GLOSSARY-Begriffe)“ (M5) und die Tabelle ohne Kartenkopf in `InFoldout` (N2) | ✗ M5, N2 |
| Im Browser angesehen | sieben Stories bei 1280 und 1440, Screenshots `np0232-*.png`. Kein Querlauf (`scrollWidth` = Breite), die Konsole ist leer | ✓ |
| `lines="compact"`: Kästen und Gruppenköpfe | `--list-compact`: Buchung · Begründung · Prüfungen · Judge. `--in-foldout`: Buchung · Begründung (mit Quellen) · Prüfungen. Je `h3.lw-ui-group` 12,5/700. Die Kästen sind `rgb(255,255,255)`, mit 1 px Rand `rgb(236,239,243)` = `--color-border-subtle` und Radius 4 px auf `td.v2tbl__detail` `rgb(244,246,248)` | ✓ |
| `lines="full"`: ohne Kästen | `--list-full`, `--case-editable` (ebenso `--in-use`): dieselben Köpfe, `.v3bkr__sec` transparent, Rand 0 | ✓ |
| Kein Badge ohne Bezeichnung; „Satzart: …“, „Sicherheit:“ mit `Confidence` (Punkt, Wort, Hover); Stand nur, wenn nicht `proposed` | Bezeichnung und Stand sind erfüllt (M3). Punkt und Wort sind erfüllt, der Hover fehlt (M1). „Satzart“ ist am Fall und in der Fixture nicht GLOSSARY-gerecht (M5) | ✗ M1, M5 |
| Begründung in `InFoldout` voll | 305 Zeichen, drei Sätze, kein `details`, kein „mehr“, bei 1280 und 1440 | ✓ |
| `CheckItems`: Gruppenzeile ohne Code | `--in-foldout`: „13 von 13 Prüfungen bestanden“, „11 Prüfungen nicht prüfbar“, 0 `.v2pp__code` in `.v2pp__sum`. Aufgeklappt stehen 13 bzw. 11 Zeilen mit je einem Code (`--fs-ui-2xs`). In allen sieben Stories hat keine Gruppenzeile einen Code | ✓ |
| „Prüfpunkt“ nicht mehr in `src/ui/v3`, `src/showcase`; „keine Prüfungen“ | `grep -rni prüfpunkt src/ui/v3 src/showcase` findet nur den datierten Kommentar `Review.tsx:528`. Im sichtbaren Text der sieben Stories steht es nicht. `checkSummary` und `CheckResult` sagen laut Code „keine Prüfungen“ | ✓ |
| Leerer Abschnitt steht nicht da | `--routine-case`: nur Buchung · Prüfungen | ✓ |
| Farbe nur nach Stufe | Kästen neutral und ohne Schatten. Farbe tragen nur der Punkt der Sicherheit, „Freigegeben“ (success) und das Urteil (info), alles aus der Registry | ✓ |

**Neu gefunden:**

- **N1 · Der Spec-Text widerspricht dem Code.** Die Einordnung („Art: Aufwand ·
  Sicherheit: Sicher“, „Art des Falls: Aufwand mit Zahlung“), die
  Schnittstelle („„Art: … · Sicherheit: …“ als Hinweis-Zeile“), die Stories
  („Art des Falls“) und die Messung des Bauenden sagen weiter „Art“ und eine
  Sicherheit als bloßes Wort. Der Code sagt „Satzart:“ und `Confidence`
  (CLAUDE.md §4.5).
- **N2 · `InFoldout` zeigt die Tabelle ohne Kartenkopf.** Die `Card` hat kein
  `CardHead` (`.v2card__h` 0). Das widerspricht der Regel „Jede Tabelle in einer
  Karte mit Kopf“. Die Gliederung beginnt dort bei `h3`, und den Fall aus
  „Verhalten“ (Kartenkopf `h2` → `h3`) zeigt keine Story.
- **N3 · Hinweis:** Die Regel `.v3bkr__who` (`v3.css:5035`) hat nach dem Diff keinen
  Nutzer mehr. `check:classes` prüft nur die Gegenrichtung.
- **N4 · Hinweis:** In der Gliederung mehrerer Sätze steht „Buchung, Prüfungen,
  Buchung, Prüfungen“ (`--expense-with-payment`). „Satz 1 von 2“ ist ein `span`
  außerhalb des Kopfs, deshalb lassen sich die Sätze beim Springen über die Köpfe
  nicht unterscheiden.
- **N5 · Hinweis an die App:** Die Fallansicht hat im einfachen Modus schon ein
  `h3` „Buchung“ (`Step3Single.tsx:870`). Darunter setzt `BookingReview` ein
  zweites `h3` „Buchung“.

Abgenommen von / am: fremde Nachprüfung (Messung der Kriterien und der Nachbesserung), 2026-10-27 · Offen: M1, M5, M6, N1, N2; H3 teilweise, N3–N5 nicht blockierend

## Nachbesserung 2 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | Die Sicherheit hat einen Hover: `title` an „Sicherheit: …“ mit der Bedeutung der Stufe aus der Registry (`resolveStatus("confidence", …).description`, z. B. „Belastbare Grundlage fehlt. Nicht ungeprüft freigeben.“) |
| M5 | Über den Sätzen eines Sachverhalts steht „Satzarten: Aufwand mit Zahlung“, der Plural des GLOSSARY-Worts, weil die Satzart je Satz gilt. Die Fixture in `ExpenseWithPayment` mit Sachkonto und Geldkonto in einem Satz heißt „Aufwand“, wie im GLOSSARY |
| M6 | L-373 ist neu gefasst, mit den Stellen am App-HEAD: `REVIEW_REASON` „Prüfpunkt rot/gelb“ und `tax_sensitive` in der Registry, `steps.ts:60`, `PlausibilityTab.tsx`, `CloseCasesPanel.tsx`, `case-queries.ts`, `ReturnToAgentPage.tsx`. `review-score.ts` ist gestrichen. Der Check point heißt ebenfalls „Prüfung“, weil die Owner-Vorgabe für das ganze Set gilt; die Doppelbelegung P45 bleibt offen |
| N1 | Einordnung, Schnittstelle und Stories sagen „Satzart“, „Satzarten“ und `Confidence`. Die Messung des Bauenden ist als Stand vor der Abnahme gekennzeichnet |
| N2 | `InFoldout` hat einen Kartenkopf „Buchungsvorschläge“ (`h2`), darunter die Köpfe der Abschnitte als `h3` |
| N3 | Die Regel `.v3bkr__who` ist gestrichen |
| N4 | Bei mehreren Sätzen steht die Zählung im Kopf: „Buchung 1 von 2“; die Overline „Satz 1 von 2“ ist weg |
| N5 | geht als Hinweis an ll-abnahme: In `Step3Single.tsx:870` steht schon ein `h3` „Buchung“ über `BookingReview`, das zweite kommt jetzt aus dem Set |
| H3 | Das `@when` von `aiSourcesToProvenance` nennt `ProvenanceSources`; der JSDoc von `AiBookingNotesBody` sagt, dass `BookingReview` es seit 0232 nicht mehr nutzt |

## Nachprüfung 2 (2026-10-27)

Gemessen mit `scripts/cdp.mjs` in einem Messbrowser gegen Storybook :6107 bei 1280
und 1440 px: die sieben Stories von `BookingReview` und neun Aufrufer. Die Stufen
„Unsicher“ und „Geraten“ zeigt keine Story. Für sie wurde `BookingReview` mit
`renderToStaticMarkup` gerendert (esbuild-Bündel außerhalb des Repos), in
`compact` und `full` je Stufe. Die App (`ccd46f0ac`, Arbeitsbaum sauber) ist nur
gelesen. Skripte, Messdaten und Screenshots liegen im Scratchpad der Prüfung
(`np0232/np2/measure.mjs`, `ssr-levels.tsx`, `np2-*.png`).

| Punkt | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| M1 · Hover der Sicherheit | `v3-entitäten-buchungssatz-bookingreview--list-compact`, `--case-editable`, `--in-use` („Plausibel“), `--routine-case`, `--in-foldout` („Sicher“), je 1280 und 1440: `span.v3bkr__meta` „Sicherheit: …“ trägt einen `title` mit der Beschreibung der Stufe aus der Registry. Von Punkt und Wort aus trifft `closest('[title]')` diesen `title`: „Eindeutig belegt (Historie oder Vertrag).“ bzw. „Gut gestützt, aber nicht durch Historie oder Vertrag bestätigt.“. SSR für die beiden anderen Stufen: `v2dot--warning` „Unsicher“ mit „Bitte Konto und Steuerschlüssel prüfen.“, `v2dot--danger` „Geraten“ mit „Belastbare Grundlage fehlt. Nicht ungeprüft freigeben.“, in `compact` wie in `full`. Punkt und Wort behalten die Farbe der Stufe | ✓ |
| M5 · „Satzart“ und „Satzarten“ nach GLOSSARY | GLOSSARY „Satzart (was ein Buchungssatz tut)“: `entry kind`, gilt je Satz, fünf Werte. Am Satz steht „Satzart: Aufwand“ bzw. „Satzart: Zahlung“ (alle sieben Stories). Über den Sätzen steht `p.lw-ui-hint.v3bkr__case` „Satzarten: Aufwand mit Zahlung“ (`--expense-with-payment`). Der Plural nennt die Satzarten der Sätze, und „Aufwand mit Zahlung“ setzt sich aus zwei der fünf Werte zusammen (App `mixedCaseKind`). Fixture: Der Einzelsatz Aufwand gegen Bank heißt „Satzart: Aufwand“, wie im GLOSSARY-Beispiel („Bürobedarf an Bank“ ist ein Aufwand). „Art:“ und „Art des Falls“ kommen im Text der Stories nicht mehr vor | ✓ (Hinweise N6, N7) |
| M6 · L-373 gegen den App-Stand | Alle genannten Stellen stimmen mit App-HEAD überein: `ui/status/status-registry.ts:1097` „Prüfpunkt rot“, `:1104` `tax_sensitive`, `:1106` „Prüfpunkt gelb“; `modules/batch-review/domain/steps.ts:60`; `PlausibilityTab.tsx:108/124/128`; `CloseCasesPanel.tsx:748`; `case-queries.ts:1270–1271`; `ReturnToAgentPage.tsx:77`. `review-score.ts` ist gestrichen. Der Widerspruch beim Check point ist aufgelöst, denn auch er heißt jetzt „Prüfung“. **Damit fehlen aber die Texte des Check point, die Nachprüfung 1 genannt hat:** `modules/batch-review/ui/Step8.tsx:72` (Kartenkopf „Prüfpunkte“ des Prüfprotokolls), `:89` (Spaltenkopf „Prüfpunkt“), `Step1.tsx:304` (Kartenkopf „Prüfpunkte“) und `ChecklistAction.tsx:28` (Vorgabe `label = "Prüfpunkt"`, der Titel des Quittier-Dialogs, denn Schritt 8 übergibt kein `label`). Wer L-373 so umsetzt, stellt `steps.ts:60` auf „Alle Prüfungen auf einen Blick“ um, und darunter bleibt die Karte „Prüfpunkte“ stehen. Ebenfalls sichtbar, aber Randfälle: der Demo-Text `demo-clients/application/seed-ludwig-months.ts:496` („der rote Prüfpunkt P-UST“) und die Audit-Meldung `batch-review/application/review-checks.ts:121` | ✗ teilweise: Die vier Stellen des Check point fehlen in L-373 |
| N1 · Spec-Text stimmt mit dem Code | Gegen `BookingReview.tsx` gelesen. Einordnung: „Satzart: Aufwand“, „Sicherheit:“ mit `Confidence` und Hover, „Satzarten: Aufwand mit Zahlung“, „Buchung 1 von 2“ ohne Overline. Schnittstelle: Kopf, Satz, Begründung mit `LongText max`, Judge mit Gruppenkopf und Urteil. Dazu Verhalten (`h3`), Stories und Kriterien. Alles stimmt mit dem Code überein. Die Messung des Bauenden ist als Stand vor der Abnahme gekennzeichnet | ✓ |
| N2 · `InFoldout`: `h2` → `h3` | `--in-foldout`, 1280 und 1440: Kartenkopf „Buchungsvorschläge“ (`.v2card__h`, `h2` 14/600), darunter `h3.lw-ui-group` Buchung · Begründung · Quellen · Prüfungen (12,5/700). Kein `h4`, kein Sprung (`np2-in-foldout.png`) | ✓ |
| N3 · `.v3bkr__who` | Die Regel ist aus `v3.css` gestrichen, ebenso `.v3bkr__block`. `grep` findet in `src` und in der App keinen Nutzer, im DOM der sieben Stories steht keiner | ✓ |
| N4 · Köpfe bei mehreren Sätzen | `--expense-with-payment`, 1280 und 1440: Die Gliederung lautet „Buchung 1 von 2 · Prüfungen · Buchung 2 von 2 · Prüfungen“, im zweiten Block „Buchung · Begründung · Prüfungen“. Es gibt kein `.lw-ui-overline`. „Freigegeben“ (`bdg-success`) steht rechts am Kopf von Satz 2 (`np2-expense-with-payment.png`) | ✓ |
| H3 · Nachbarverweise | Das `@when` von `aiSourcesToProvenance` nennt `ProvenanceSources` (`AiBookingNotes.tsx:203`). Der JSDoc von `AiBookingNotesBody` sagt, dass `BookingReview` ihn seit 0232 nicht mehr nutzt (`:233`); der verbleibende Nutzer ist `JournalEntryFacts.tsx:248`. Das `@instead` von `ProvenanceRows` nennt `ProvenanceSources` | ✓ |
| Wächter | `pnpm typecheck` Exit 0, `check:when` Exit 0, `check:language` Exit 0 (0 Zeilen). `check:classes` Exit 1, nur mit den vier bekannten Altklassen (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`). Zusätzlich `check:type` Exit 0. `pnpm build` lief nach Auftrag nicht | ✓ |
| Im Browser angesehen | Die sieben BookingReview-Stories und neun Aufrufer, bei 1280 und 1440: die `CheckItems`-Stories `mixed`, `all-open`, `all-green`, `empty`, dazu `Provenance` `rows` und `note`, `AiBookingNotes` `box`, `seiten-sachverhalt-reiter--plausibility` und `seiten-deck--protocol`. Nichts läuft quer, die Konsole ist leer (der Fang ist mit einem Probe-`console.error` geprüft). Im sichtbaren Text steht kein „Prüfpunkt“, keine Gruppenzeile trägt einen Code | ✓ |

**Neu gefunden:**

- **N6 · Hinweis:** Die Hover-Texte der Fixtures sind nicht die der App.
  `caseKind.description` lautet „Rechnung und Zahlung in einem Fall.“, mit „Fall“
  statt „Sachverhalt“. Die App (`mixedCaseKind`) sagt „Rechnung und Zahlung in
  einem Sachverhalt — „Übernehmen“ übernimmt beide Sätze.“. Die `kindDescription`
  am Satz beschreibt den einzelnen Satz statt der Satzart: „Sachkonto und
  Geldkonto im selben Satz.“ und, neu in `InFoldout`, „Ein Sachkonto für Aufwand,
  ein Personenkonto — eine Eingangsrechnung.“. Die App
  (`ENTRY_KIND_DESCRIPTION.expense`) sagt „Bucht Aufwand — der Geschäftsvorfall
  selbst.“. Bis auf `InFoldout` ist das der Stand von HEAD. Nicht blockierend.
- **N7 · Hinweis:** Die Story-Beschreibung von `ExpenseWithPayment`, die
  Storybook zeigt, sagt weiter „die Satzart des Falls einmal darüber“. Die
  Oberfläche sagt seit Nachbesserung 2 „Satzarten“.

Abgenommen von / am: fremde Nachprüfung 2 (Messung der Punkte aus Nachbesserung 2), 2026-10-27 · Offen: M6 (die Stellen des Check point in L-373); N5–N7 und die übrigen Hinweise nicht blockierend

## Nachbesserung 3 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M6 | L-373 nennt jetzt auch die Texte des Check point im Prüfprotokoll: `Step8.tsx:72` (Kartenkopf „Prüfpunkte“), `Step8.tsx:89` (Spaltenkopf „Prüfpunkt“), `Step1.tsx:304`, `ChecklistAction.tsx:28` (Titel des Quittier-Dialogs), am Rand `seed-ludwig-months.ts:496` und `review-checks.ts:121` |
| N6 | Der Hover über den Sätzen sagt „in einem Sachverhalt“ statt „in einem Fall“. Die `kindDescription` der anderen Fixtures bleibt, wie sie in HEAD war |
| N7 | Die Beschreibung von `ExpenseWithPayment` sagt „die Satzarten des Sachverhalts“ |


## Nachprüfung 3 (2026-10-27)

Geprüft sind nur die Punkte aus Nachbesserung 3. Die App (`ccd46f0ac`, Arbeitsbaum
sauber) ist nur gelesen. Gesucht wurde mit `grep -rn Prüfpunkt` über
`apps/web/src` ohne Tests und ohne Kommentarzeilen. Gemessen wurde mit
`scripts/cdp.mjs` gegen Storybook :6107 bei 1280 px (`np0232/np2/np3.mjs`).

| Punkt | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| M6 · L-373 vollständig gegen App-HEAD | Jede Fundstelle eines sichtbaren Textes steht in L-373, mit stimmender Zeile. Das sind `status-registry.ts:1097/1104/1106`, `steps.ts:60`, `PlausibilityTab.tsx:108/124/128`, `CloseCasesPanel.tsx:748`, `case-queries.ts:1270–1271` und `ReturnToAgentPage.tsx:77`. Neu stehen dort der Check point mit `Step8.tsx:72` und `:89`, `Step1.tsx:304` und `ChecklistAction.tsx:28`, am Rand `seed-ludwig-months.ts:496` und `review-checks.ts:121`. Drei Fundstellen fehlen, sind aber kein Oberflächentext. `status-registry.ts:3253` ist `AXIS_SOURCE.review_tab`, eine technische Quellangabe, die außer einem Test niemand liest. `seed-ludwig-months.ts:482` und `review-checks.ts:75` sind `domainError`s für Fehler im Demo-Seed bzw. im Katalog | ✓ |
| N6 · Hover über den Sätzen | `v3-entitäten-buchungssatz-bookingreview--expense-with-payment`: `p.v3bkr__case` „Satzarten: Aufwand mit Zahlung“ trägt den `title` „Rechnung und Zahlung in einem Sachverhalt.“. Die `kindDescription` der übrigen Fixtures (`BookingReview.stories.tsx:93`, `:268`, `:410`) bleibt nach Nachbesserung 3 bewusst, wie sie in HEAD war. Konsole leer, kein Querlauf | ✓ (die `kindDescription` bleibt Hinweis) |
| N7 · Beschreibung von `ExpenseWithPayment` | `BookingReview.stories.tsx:237`: „die Satzarten des Sachverhalts einmal darüber (`caseKind`)“. Derselbe Satz sagt in Zeile 236 weiter „oben ein Fall mit zwei Sätzen“. Das ist eine Story-Beschreibung, kein Oberflächentext | ✓ (Hinweis: „Fall“ in Zeile 236) |
| `pnpm typecheck` | Exit 0 | ✓ |

Abgenommen von / am: fremde Nachprüfung 3 (Punkte aus Nachbesserung 3), 2026-10-27 · Alle Mängel M1–M6 und N1–N2 erfüllt; H2, H4–H7, N5 sowie die Reste von N6 und N7 sind Hinweise und blockieren nicht

## Nachtrag 2026-10-27 — Begründung erst ab etwa zehn Zeilen gefaltet

llcto für den Owner, nach dem Zeigerhub: Im Aufklapper faltete die Begründung
schon nach etwa sechs Zeilen; bei vier Sätzen fehlten genau die letzten Worte.
`LongText max` steigt von 420 auf 700 Zeichen, bei 68ch Satzbreite etwa zehn
Zeilen. Die Satzbreite bleibt, sie ist die Rolle „Fließtext“ (0220); eine
breitere Zeile nur in diesem Kasten wäre eine zweite Regel.


## Prüfung des Nachtrags (2026-10-27)

Fremde Prüfung des uncommitteten Diffs an `BookingReview.tsx` (`LongText max` 420 →
700). Gemessen auf dem Dev-Server 6107 mit einem Messbrowser über
`scripts/cdp.mjs`, in `v3-entitäten-buchungssatz-bookingreview--in-foldout` bei
1280 und 1440 px. Für die Probe ist `LongText` per esbuild gebaut und mit
`max={700}` zu statischem Markup gerendert. Dieses Markup ersetzt zur Laufzeit
den Inhalt des Kastens „Begründung“ (`.v3bkr__text`); im Repo liegt dafür keine
Datei. Geprüft sind vier Proben: vier Sätze mit 547 Zeichen, sechs Sätze mit 853
Zeichen und die Grenze mit 700 und 701 Zeichen. Skripte und Rohdaten liegen als
`abn0232n-*` im Scratchpad der Sitzung.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| Vier Sätze um die 560 Zeichen stehen ganz da, ohne „mehr“ | Vier Sätze mit 547 Zeichen: kein `details`, kein „mehr“, 7 Zeilen. Der Text endet mit dem letzten Wort („… des Kreditors 70412 aus.“). Bei 1280 und 1440 px ist das gleich, weil der Kasten an 68ch anliegt. Mit dem alten `max` 420 wäre derselbe Text gefaltet gewesen (547 > 420). Die Story-Begründung selbst hat 305 Zeichen und 4 Zeilen | ✓ |
| Eine deutlich längere Begründung wird gefaltet | 853 Zeichen: `details.more` ist zu, der Anriss hat 9 Zeilen und dann „ mehr ▾“. Aufgeklappt stehen alle 12 Zeilen, der Anriss ist verborgen, am Ende steht „weniger ▴“. An der Grenze steht ein Text mit 700 Zeichen ganz da (9 Zeilen); ab 701 Zeichen wird er gefaltet. 9 Zeilen bei 700 Zeichen decken sich mit „etwa zehn Zeilen“ im Nachtrag | ✓ |
| Die Satzbreite bleibt bei 68ch | `.v3bkr__text` ist bei 1280 und 1440 px 579,1 px breit. `max-width` beträgt 579,129 px = `68ch` in der Schrift des Kastens (13,5 px, Zeilenhöhe 20,925 px); der Abschnitt daneben ist 1114 px breit. Das gilt für die Story-Begründung und für alle vier Proben | ✓ |
| `pnpm typecheck` | Exit 0 | ✓ |
| Konsole und Bild | Die Konsole meldet nichts. Screenshots `abn0232n-1280.png` und `abn0232n-1440.png` | ✓ |

Ergebnis: Der Nachtrag ist erfüllt.

Hinweis: Die Grenze bleibt eine Zeichengrenze. Ein Text knapp über 700 Zeichen
zeigt 9 Zeilen Anriss und versteckt hinter „mehr“ nur die letzten Worte. Das ist
dieselbe Lage wie vorher bei 421 Zeichen, nur später. Wenn das stört, wäre in
`LongText` ein Mindestrest zu prüfen, zum Beispiel erst falten, wenn mehr als
etwa eine Zeile verborgen bliebe. Das ist nicht Gegenstand dieses Nachtrags.
