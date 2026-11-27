# 0270 · Prüfpunkt-Zeile: „wird geprüft“ und eine Handlung je Punkt (`CheckItem.state: "running"`, `CheckItem.action`, `CheckItems live`)

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-27 (M1/M2 behoben, Nachprüfung ✓; H7 vom Auftraggeber behoben; App-Verträglichkeit offen → L-389) |
| Stufe | `patterns/` (`Review.tsx`, Familie Prüfen), Erweiterung von `CheckItem`, `CheckItems`, `CheckResult` und `checkSummary`; keine neue Komponente |
| Klassen-Test | ja: Jede Checkliste, deren Punkte nacheinander geprüft werden und die je Punkt einen Weg zur Lösung anbietet, etwa ein Systemcheck oder eine Antragsprüfung |
| Quelle | Anfrage plugin-mananger 2026-11-27 (Auftrag Simon): `ludwig-plugin/docs/spec-bausteine.md` (Branch `umbau`), Zeile „Prüfpunkt-Zeile“; Anforderungen aus `ludwig-plugin/docs/spec-oberflaeche-und-fehler.md`, C6 (Bereitschaftsprüfung, zehn Punkte) und C1 (Einrichtung) |
| Ersetzt | nichts; das Plugin hat heute keine Checkliste |
| Blockiert | Plugin C6 (Bereitschaftsprüfung in der Einrichtung C1 und in den Einstellungen C5) |
| Setzt voraus | 0268 (`Spinner`, Größe sm) für das Zeichen von `running` |
| Spec von / am | designsystem, 2026-11-27 |

## Ziel

Die Mitarbeiterin richtet die Erweiterung ein oder fragt in den Einstellungen
„Alles bereit?“. Zehn Punkte werden nacheinander geprüft: Erweiterung aktuell,
Ludwig erreichbar, verbunden, Mandant vollständig, DATEV erreichbar und so
weiter. Sie sieht jeden Punkt mit dem Zeichen „wird geprüft“, bis sein
Ergebnis da ist. Die Liste springt nicht, während die Ergebnisse eintreffen.
Am Ende steht, was hakt, einzeln oben, je mit dem einen Knopf, der es löst
(„Neu verbinden“, „DATEV öffnen“, „Erledigt“). Was in Ordnung ist, steht in
einer Zeile. Heute kennt `CheckItems` nur fertige Ergebnisse. Einen Weg zur
Lösung trägt es nur als Sprung (`jump`), und ein „nicht prüfbar“ mit Knopf
verschwindet im zugeklappten Aufklapper.

## Einordnung

- **Wiederverwenden:** `CheckItems` (`@when` „Individual checks with
  reasons“) trägt den Fall zu vier Fünfteln.
  - **„Nicht prüfbar“ gibt es schon:** `state: "open"` heißt bei `kind="rule"` genau das (`SUMMARY_WORD.rule.open = "nicht prüfbar"`, eigene Gruppe seit 0148: „eine Aussage über die Daten, kein Befund“). Der C6-Zustand „nicht prüfbar, kein Fehler“ ist damit `open`. Ein eigener Zustand wäre ein zweites Wort für dieselbe Sache.
  - Fehlen tun drei Dinge: der laufende Punkt, ein Knopf je Punkt, der nicht faltet, und die Ansage, wenn sich die Liste vor den Augen der Nutzerin füllt.
- **Erweitert, weil:** §3 Regel 2. Eine Designentscheidung, die wiederkommt: dieselbe Checkliste steht im Plugin dreimal (Einrichtung, still vor dem Abgleich, „Alles bereit?“), und jede Prüfung, die Zeit kostet, braucht „wird geprüft“. Es ist ein Wert mehr in einer Union und ein Feld mehr am Punkt. In der `@when`-Zeile reicht ein Halbsatz: „… auch während der Prüfung, mit einem Knopf je Punkt“.
- **`action` neben `jump`, nicht `jump` umgedeutet:** `jump` ist der Sprung an die Stelle, wo der Punkt anderswo gelöst wird. `action` ist der Knopf, der ihn hier löst oder neu prüft. Der Edge-Punkt 8 braucht beide: „Anleitung“ (Sprung) und „Erledigt“ (Knopf).
- **Zuschnitt:** eine Datei (`Review.tsx`), dazu `Review.stories.tsx` und `v3.css`. `CheckRow` und `CheckGroup` bleiben intern.
- **Setzt auf:** `Spinner` (0268) für das Zeichen. Trägt 0268 das Zeichen als `StateKind` `"running"` in die eine Zeichentabelle (`STATE_SIGNS`, Owner 2026-09-27), nimmt `PP_ICON` diesen Eintrag. Sonst rendert `CheckRow` den `Spinner` direkt mit dem Wort aus Regel 1.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `CheckItem.state` | `"green" \| "yellow" \| "red" \| "open" \| "running"` | ja | neu ist nur `"running"`: Der Punkt wird gerade geprüft (Regel 1) | `CheckItemsRunning` |
| `CheckItem.action` | `ReactNode` | nein | neu: genau ein Knopf, der den Punkt hier löst oder neu prüft (`Button`, `ActionButton`); steht nach `jump`; ein Punkt mit `action` faltet nie (Regel 3) | `CheckItemsWithAction` |
| `CheckItems` `live` | `boolean` | nein, `false` | neu: Die Liste ändert sich, während die Nutzerin hinsieht. Eine Live-Region sagt Beginn und Ende an, nicht jeden Punkt (Regel 5) | `ReadinessCheckInUse` |
| `checkSummary(items, kind)` | unverändert | | zählt `running` mit dem Wort „in Prüfung“ (Regel 4) | `CheckSummaryLine` |
| `CheckResult` | unverändert | | Läuft ein Punkt, zeigt die Zeile den `Spinner` und „x von y geprüft“ (Regel 4) | `CheckResultTones` |

Die Regeln:

1. **Der laufende Punkt.** Zeichen: `Spinner` sm (0268) mit dem Wort „wird
   geprüft“ als zugänglichem Namen (`title`/`aria-label`, wie `StateIcon`).
   `reason` bleibt Pflicht und sagt, was gerade geschieht („Ludwig wird
   angefragt.“). Er steht leise in `--color-text-muted` wie bei `green`, weil
   noch nichts zu lesen ist. `result` und `gate` zeigt der Aufrufer bei einem
   laufenden Punkt nicht.
2. **Nichts springt, solange geprüft wird.** Ist mindestens ein Punkt
   `running`, faltet `CheckItems` nichts. Alle Punkte stehen einzeln in der
   Reihenfolge von `items`, und jeder wechselt sein Zeichen an seinem Platz.
   Erst wenn keiner mehr läuft, gilt einmal die Ordnung aus Regel 3.
3. **Ordnung nach der Prüfung.** Zuerst die Befunde (`red`, `yellow`) in
   Eingabereihenfolge. Dann **jeder Punkt mit `action`**, auch `open` und
   `green`, in Eingabereihenfolge: Ein Knopf im zugeklappten Aufklapper ist
   keiner. Dann wie heute die Gruppe der bestandenen und die der nicht
   prüfbaren, jeweils ohne die Punkte mit `action`. Die Zählung „x von y
   bestanden“ bleibt: `y` zählt alle Punkte außer `open`, also auch die
   herausgehobenen.
4. **Zählen.** `checkSummary` ordnet `red`, `yellow`, `running`, `open`,
   `green` und zählt `running` mit „in Prüfung“, bei beiden Arten:
   „1 verletzt · 3 in Prüfung · 6 bestanden“. `CheckResult` zeigt mit
   mindestens einem laufenden Punkt den `Spinner` und „x von y geprüft“
   (x = Punkte, die nicht laufen; y = alle). Ohne laufenden Punkt bleibt alles
   wie in 0217. `title` bleibt `checkSummary`.
5. **Ansage mit `live`.** Eine unsichtbare Region (`.v2vh`, `role="status"`)
   steht von Anfang an im DOM. Solange ein Punkt läuft, sagt sie „Prüfung
   läuft.“, danach `checkSummary(items, kind)`. Damit kommen genau zwei
   Ansagen: Beginn und Ende, nicht zehn. Ohne `live` gibt es keine Region, und
   das DOM der heutigen Aufrufer bleibt gleich.

Abbildung der Zustände der Bereitschaftsprüfung (C6) auf `state`:

| C6 | `state` |
|---|---|
| in Ordnung | `green` |
| Hinweis mit Handlung (Aktualisierung empfohlen) | `yellow` mit `action` |
| Hinweis ohne Handlung (Einstellungen aus gespeichertem Stand) | `green`, `reason` sagt es (Offene Frage 2) |
| Fehler | `red` |
| nicht prüfbar | `open` |
| wird geprüft | `running` |

Typen aus `src/ludwig/`: keine. Die Prüfpunkte kommen aus dem Kern des Plugins
als Daten, die Oberfläche bildet sie auf `CheckItem` ab. GLOSSARY: kein neuer
Begriff. Neue Wörter im Set: „wird geprüft“, „in Prüfung“, „x von y geprüft“,
„Prüfung läuft.“ (Offene Frage 1).

Verträglichkeit:
- Die Aufrufer in der App (`VorsteuerTab.tsx`, `PlausibilityTab.tsx`, `Step3Single.tsx`) und im Showcase (`InputTaxTab.tsx`) bilden nur **auf** `CheckItem["state"]` ab (`Record<…, CheckItem["state"]>`). Ein Wert mehr in der Union bricht sie nicht.
- Intern bekommen `SUMMARY_WORD` und `PP_ICON` den Schlüssel `running`.
- Ohne `running`, ohne `action` und ohne `live` ist die Ausgabe Zeichen für Zeichen die heutige.

Was die Erweiterung **nicht** kann (bewusst):
- Sie startet keine Prüfung und kennt kein Zeitlimit. Ein hängender Punkt endet beim Aufrufer als `open` (C6: „endet nach einem Timeout als nicht prüfbar“).
- „Erneut prüfen“ für die ganze Liste und „Bericht kopieren“ (C6) stehen im `CardHead` des Aufrufers, nicht in `CheckItems`.
- Sie versteckt den Code nicht. Bei `kind="rule"` steht er klein hinter der Frage, wie heute (Offene Frage 3).
- Sie zeigt keine Dauer je Punkt. Wer sie braucht, schreibt sie in `reason`.

## Verhalten

- **Tastatur:** Tab erreicht je Zeile in DOM-Reihenfolge `gate`, `jump` und `action`. Die Aufklapper der Gruppen bleiben native `<details>`. Ein laufender Punkt hat nichts Fokussierbares. Wechselt ein Punkt vom Laufen zum Ergebnis, bleibt der Fokus dort, wo er war: Es entsteht kein Knopf vor dem fokussierten Element, weil nach Regel 2 nichts umsortiert wird, solange geprüft wird.
- **Hover:** unverändert. Die Zeile ist nicht klickbar, nur ihre Knöpfe sind es.
- **Bewegung:** Der `Spinner` folgt `prefers-reduced-motion` nach 0268.
- **Zustände:** gefüllt (`CheckItemsMixed`), leer (`CheckItemsEmpty`, „Keine Prüfungen für diesen Fall.“) und Fehler je Punkt (`red`) gibt es schon. „Lädt“ ist neu, und zwar je Punkt (`running`). „Leer nach Filter“ gilt nicht, weil `CheckItems` nicht filtert.
- **Server-Component** wie die ganze Familie: Die Live-Region ist Markup, kein Hook.

## Stories

In `Review.stories.tsx` (`v3/Patterns/Prüfen/Checklist`). Die Daten sind die
zehn Punkte aus C6, in Klartext. Codes `BP-01` bis `BP-10` (Offene Frage 3).

| Story | Beweist |
|---|---|
| `CheckItemsRunning` (neu) | Prüfung mitten im Lauf: Die zehn Punkte stehen in Eingabereihenfolge, nichts ist gefaltet. Vier laufen (Spinner, „wird geprüft“, `reason` „DATEV wird angefragt.“). `BP-03` „Ist die Erweiterung mit Ludwig verbunden?“ ist `red`: „Die Verbindung ist am 26.11.2026 abgelaufen.“ mit `action` „Neu verbinden“ |
| `CheckItemsWithAction` (neu) | nach der Prüfung. Einzeln oben: `BP-03` red mit „Neu verbinden“. Dann `BP-05` und `BP-06` open mit „DATEV öffnen“ und `BP-08` „Ist das Pop-up für DATEV erlaubt?“ open mit `jump` „Anleitung“ und `action` „Erledigt“. Darunter „5 von 6 Prüfungen bestanden“ (gefaltet) und „1 Prüfung nicht prüfbar“ (`BP-07` ohne `action`) |
| `ReadinessCheckInUse` (neu) | in einer `Card` mit `CardHead` „Alles bereit?“ und den Aktionen „Erneut prüfen“ und „Bericht kopieren“ (`CopyTextButton`), mit `live`. Rundlauf mit `useState`: Ein Klick auf „Erneut prüfen“ setzt alle auf `running`, die Ergebnisse kommen nacheinander, am Ende wird einmal gefaltet. Unter der Story steht der aktuelle Text der Live-Region sichtbar zur Prüfung |
| `CheckSummaryLine` (erweitert) | eine Zeile mehr: „1 verletzt · 3 in Prüfung · 6 bestanden“ |
| `CheckResultTones` (erweitert) | eine Zeile mehr: Spinner und „7 von 10 geprüft“; `title` „1 verletzt · 3 in Prüfung · 6 bestanden“ |

Unverändert und als Vergleich: `CheckItemsMixed`, `CheckItemsAllOpen`,
`CheckItemsAllGreen`, `CheckItemsEmpty`, `CheckItemsFacts`.

Nicht anwendbare Zustände: siehe Verhalten. Eine Liste, die als Ganzes lädt,
gibt es nicht, weil die Punkte der Bereitschaftsprüfung vorher feststehen.
Sie erscheinen gleich als `running`.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| ein Hinweis ohne Handlung als eigener Zustand („zur Kenntnis“, blau) | `state: "info"` | Offene Frage 2 wird anders entschieden, oder ein zweiter Aufrufer braucht einen Punkt, der weder bestanden noch offen ist |
| den Code bei `kind="rule"` verbergen | `showCode?: boolean` an `CheckItems` | Offene Frage 3 wird anders entschieden: Codes, die niemand zitiert, stören |
| Fortschritt der ganzen Prüfung als Balken | nichts an `CheckItems`; `Progress` im `CardHead` des Aufrufers | eine Prüfung mit deutlich mehr als zehn Punkten |

## Offene Fragen

1. **Neue Wörter:** „wird geprüft“ (Name des Zeichens), „in Prüfung“
   (Zählwort in `checkSummary`, für `rule` und `fact`), „x von y geprüft“
   (`CheckResult`) und „Prüfung läuft.“ (Ansage). **Ohne Antwort:** diese.
   „Wird geprüft“ verlangt die Anfrage wörtlich. „In Prüfung“ ist nötig, weil
   das Zählwort hinter der Zahl stehen muss („3 in Prüfung“, nicht „3 wird
   geprüft“).
2. **„Hinweis“ ohne Handlung** (C6 Punkt 9: Einstellungen aus gespeichertem
   Stand). Gibt es einen eigenen Zustand `info`? **Ohne Antwort:** nein. Ein
   Hinweis mit Handlung wird `yellow` mit `action`, einer ohne Handlung wird
   `green`, und `reason` sagt es. Vorbild ist die App: `PlausibilityTab` bildet
   `info` auf `green` ab („nicht anwendbar ist kein Befund“). Eine neue
   Stufe in der Checkliste entscheidet der Owner.
3. **Der Code hinter der Frage.** Er steht bei `kind="rule"` klein in
   `--font-mono` da, weil ihn jemand zitiert (VST-03). Die internen Codes des
   Plugins (`ludwig_nicht_verbunden`) sind Technik und gehören nicht dorthin
   (T4). **Ohne Antwort:** Das Plugin gibt zitierbare Kurzcodes `BP-01` bis
   `BP-10`, die auch im Bericht für den Support stehen. Der interne Code
   gehört in `origin.fields` oder bleibt weg.

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

- [ ] `CheckItem.state` und `CheckItem.action` stehen Zeichen für Zeichen wie in der Tabelle, `live?: boolean` an `CheckItems`. Die JSDoc nennt die Regeln 1 bis 5, die `@when`-Zeile von `CheckItems` trägt den Halbsatz (Code)
- [ ] Regel 1: Ein laufender Punkt zeigt den `Spinner` sm mit dem zugänglichen Namen „wird geprüft“, `reason` in `--color-text-muted` (`CheckItemsRunning`)
- [ ] Regel 2: Mit laufenden Punkten stehen alle Punkte einzeln in Eingabereihenfolge, keine Gruppe ist im DOM (`CheckItemsRunning`, Reihenfolge der Zeilen gegen `items` geprüft)
- [ ] Regel 2: Im Rundlauf bleibt jede Zeile an ihrem Platz, bis der letzte Punkt fertig ist; dann wird einmal gefaltet (`ReadinessCheckInUse`)
- [ ] Regel 3: Punkte mit `action` falten nie, auch `open`; Ordnung Befunde → Punkte mit `action` → Gruppen; „5 von 6 Prüfungen bestanden“ und „1 Prüfung nicht prüfbar“ (`CheckItemsWithAction`)
- [ ] Regel 4: `checkSummary` liefert „1 verletzt · 3 in Prüfung · 6 bestanden“ (`CheckSummaryLine`); `CheckResult` zeigt Spinner und „7 von 10 geprüft“ mit diesem `title` (`CheckResultTones`)
- [ ] Regel 5: Mit `live` ändert sich der Text der Region im Rundlauf genau zweimal: „Prüfung läuft.“ und am Ende die Zählung (`ReadinessCheckInUse`, Text unter der Story und `role="status"` im DOM). Ohne `live` gibt es keine Region (`CheckItemsMixed`, DOM)
- [ ] Tastatur: In einer Zeile mit `jump` und `action` erreicht Tab erst „Anleitung“, dann „Erledigt“; Trefferfläche ≥ 24 × 24 px gemessen; der Fokus bleibt beim Wechsel vom Laufen zum Ergebnis erhalten (`CheckItemsWithAction`, `ReadinessCheckInUse`)
- [ ] `prefers-reduced-motion: reduce`: Der Spinner verhält sich nach 0268 (`CheckItemsRunning` mit emulierter Einstellung)
- [ ] Verträglichkeit im Set: `CheckItemsMixed`, `CheckItemsAllOpen`, `CheckItemsAllGreen`, `CheckItemsEmpty`, `CheckItemsFacts`, `CheckSummaryLine` (alte Zeilen) und `CheckResultTones` (alte Zeilen) sind im Bildvergleich vorher/nachher gleich (`scripts/png-diff.mjs`, ≤ 0,5 %); `src/showcase/document/InputTaxTab.tsx` typecheckt
- [ ] Verträglichkeit in der App: `VorsteuerTab.tsx`, `PlausibilityTab.tsx` und `Step3Single.tsx` typechecken mit dem neuen Stand und zeigen unverändert an. Das ist **offen (App)**, wenn der Zeiger gehoben wird
- [ ] Die C6-Abbildung steht in der JSDoc von `CheckItem.state`: „nicht prüfbar“ = `open`, kein eigener Zustand


## Nachtrag 2026-11-27 — aus der Abnahme (M1, M2, H4)

- **Zeichen „wird geprüft“ (M1):** der Kreis von `Spinner` sm, gefärbt von
  derselben Regel wie `.v3spinner > .v2spin` (Akzent 700, volle Stärke;
  `v3.css`: `.v3spinner > .v2spin, .v2pp__running > .v2spin`), mit dem Wort
  als Namen am umgebenden `role="img"`. Kein `Spinner label={null}` außerhalb
  des Knopfs. Kontrast 5,45:1 auf der Karte, 5,03:1 in `CheckResult`.
- **Fokus beim Falten (M2):** Befunde und Punkte mit `action` stehen nach der
  Prüfung in **einem** Array an derselben Stelle wie die Einzelzeilen
  während der Prüfung (Schlüssel `code`). Eine Zeile, die einzeln bleibt,
  behält ihren DOM-Knoten und damit den Fokus.
- **Fokus auf einem Punkt, der gefaltet wird (H4):** Mit `live` rendert
  `CheckItems` eine kleine Client-Insel (`patterns/CheckFoldFocus.tsx`, nicht
  im Barrel). Sie merkt sich die Zeile (`data-code` an jeder Zeile) und setzt
  den Fokus nach dem Falten auf den Kopf der Gruppe, die die Zeile jetzt
  hält — nie auf `body`. Ohne `live` bleibt `CheckItems` eine
  Server-Component ohne Client-Code; das Verhalten „Server-Component wie die
  ganze Familie“ gilt damit für Listen ohne `live`.

## Abnahme

Gemessene Abnahme 2026-11-27, fremder Prüfer (hat nicht gebaut). Grundlage:
Spec, Code im Arbeitsbaum (`Review.tsx`, `Review.stories.tsx`, `v3.css`,
`JournalEntryReviewList.stories.tsx`), Seitenprofil `docs/seiten/duo-connect.md`
(A1c, C4: Bereitschaftsprüfung C6). Browser: Playwright gegen Storybook 6107,
eigene Seite je Durchlauf; Bildvergleich: Scratch-Klon `git clone --shared`
auf HEAD `1b9a847` gegen einen Klon mit dem Arbeitsbaum ohne die fremde
Baustelle `src/showcase/duo-connect/fixtures.ts`/`support.tsx`, beide mit
`storybook build -o` in den Scratchpad, `scripts/png-diff.mjs`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | Snapshot-Klon: `tsc --noEmit` Exit 0 (darin `src/showcase/document/InputTaxTab.tsx`, `Settings.stories.tsx`, `JournalEntryReviewList.stories.tsx`); `storybook build -o` Exit 0. Im Arbeitsbaum ist `typecheck` rot nur durch die fremde, laufende Änderung an `src/showcase/duo-connect/fixtures.ts` — nicht Gegenstand | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | Erweiterung in `patterns/Review.tsx`, Stories in `Review.stories.tsx` (`v3/Patterns/Prüfen/Checklist`), keine neue Datei | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm check:language` und `check:when` Exit 0, je `--test` Exit 0; `RunningSign` ist intern | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status über Registry | keine Hex/px in den geänderten TSX-Zeilen; neue Wörter nur in `SUMMARY_WORD` (der bestehenden Zähltabelle) und in `CheckItems`/`CheckResult` („wird geprüft“, „in Prüfung“, „x von y geprüft“, „Prüfung läuft.“, Offene Frage 1); `pnpm check:type` Exit 0; `check:classes`: die neuen Klassen `v2pp__running`, `v2pp__result-line--running` haben Regeln (die 4 gemeldeten Klassen sind dieselben wie auf HEAD) | ✓ |
| Alle Stories vorhanden; ausgeschlossene Zustände begründet | neu `check-items-running`, `check-items-with-action`, `readiness-check-in-use`; erweitert `check-summary-line`, `check-result-tones`; „Liste lädt als Ganzes“ und „leer nach Filter“ begründet | ✓ |
| Prüfliste §9 | Trefferflächen, Fokusring, Kontrast, Bewegung siehe unten; Hover der Zeile unverändert (keine Regel geändert); Text links; Zeichen mit Name; Schrift aus der Skala. Abweichung beim Zeichen siehe Regel 1 | ✓ |
| Im Browser angesehen | 6 Stories geladen (3 neu, 2 erweitert, `check-items-mixed`), Inhalt sichtbar, 0 Konsolenfehler/-warnungen; Screenshot `check-items-running` angesehen | ✓ |
| Typen und JSDoc | `state: "green" \| "yellow" \| "red" \| "open" \| "running"` und `action?: ReactNode` Zeichen für Zeichen; `CheckItems({ items, kind = "rule", live = false })` mit `live?: boolean`; JSDoc von `CheckItems` nennt Regeln 1–5, `@when` trägt „also while the checks run, with one button per item“ | ✓ |
| Regel 1: `Spinner` sm, Name „wird geprüft“, `reason` gedämpft (`CheckItemsRunning`) | Name: `span.v2pp__running` `role="img"` `aria-label="wird geprüft"`, Kreis `aria-hidden`, Kasten 15 × 15 px wie `StateIcon` (Zeichenspalte springt nicht); `reason` `rgb(92, 92, 92)` = `--color-text-muted` wie bei `green`. **Aber** gezeichnet wird nicht der `Spinner` sm aus 0268 (`.v3spinner > .v2spin`: `--color-accent-700`, volle Stärke, 5,45:1), sondern der nackte Knopf-Kreis (`Spinner label={null}`): Zeilenfarbe `#2D2D2D` bei `opacity: 0.7` (wirksam `#6C6C6C`, 5,25:1), in `CheckResult` `#5C5C5C` bei 0,7 (wirksam `#8D8D8D`, 3,32:1). Ein Zeichen, zwei Bilder (M1) | ✗ |
| Regel 2: einzeln in Eingabereihenfolge, keine Gruppe (`CheckItemsRunning`) | Zeilen BP-01 … BP-10 in der Reihenfolge von `items`; 0 `details` im DOM; 4 laufende Zeilen ohne fokussierbares Element; BP-03 `red` mit „Neu verbinden“ | ✓ |
| Regel 2: Rundlauf, einmal falten (`ReadinessCheckInUse`) | nach „Erneut prüfen“ alle 10 `running` in Eingabereihenfolge; 10 Ergebnisse im Abstand von ~600 ms, jede Zeile wechselt ihr Zeichen am Platz (Reihenfolge in allen 10 Momentaufnahmen während der Prüfung gleich, ein fokussierter Knopf verschiebt sich dabei 0 px); nach dem letzten genau ein Wechsel auf BP-03 · BP-05 · BP-06 · BP-08 · 2 Gruppen (zu) | ✓ |
| Regel 3 (`CheckItemsWithAction`) | Reihenfolge BP-03 (red) → BP-05, BP-06, BP-08 (open mit `action`) → „5 von 6 Prüfungen bestanden“ (zu) → „1 Prüfung nicht prüfbar“ (zu, nur BP-07) | ✓ |
| Regel 4 | `CheckSummaryLine` letzte Zeile „1 verletzt · 3 in Prüfung · 6 bestanden“; `CheckResultTones` letzte Zeile: Kreis mit Name „wird geprüft“, „7 von 10 geprüft“, `title` „1 verletzt · 3 in Prüfung · 6 bestanden“ | ✓ |
| Regel 5 | `ReadinessCheckInUse`: Region (`.v2vh`, `role="status"`) von Anfang an im DOM, beim Laden „1 verletzt · 4 nicht prüfbar · 5 bestanden“; im Rundlauf genau 2 Mutationen: „Prüfung läuft.“ → „1 verletzt · 4 nicht prüfbar · 5 bestanden“; über den ganzen Rundlauf und das Falten derselbe Knoten. `CheckItemsMixed`: 0 `role="status"` | ✓ |
| Tastatur, Trefferfläche, Fokus erhalten | Tab in BP-08: „Anleitung“ → „Erledigt“; Fokusring 2 px `solid` `#3B8FC4`, Abstand 2 px; Trefferflächen „Neu verbinden“ 107,9 × 25, „DATEV öffnen“ 103,2 × 25, „Anleitung“ 77,1 × 25, „Erledigt“ 65,9 × 25 px. Fokus auf „Neu verbinden“ (BP-03) bleibt über 7 Ergebnisse und das Falten erhalten. **Aber** Fokus auf „DATEV öffnen“ (BP-05) bzw. „Erledigt“ (BP-08) geht beim Falten verloren (`document.activeElement` = `BODY`, Knopf `isConnected` = false): die Zeilen mit `action` werden neu montiert (BP-05/06/08 andere DOM-Knoten, BP-03 derselbe) (M2) | ✗ |
| `prefers-reduced-motion` (`CheckItemsRunning`) | `reducedMotion: 'reduce'`: `.v2spin` `animation-name: none`, 0 Animationen, Bogen bleibt sichtbar (rechter Rand transparent) — wie 0268 | ✓ |
| Verträglichkeit im Set | `png-diff.mjs` HEAD gegen neu, ≤ 0,5 %: `check-items-mixed`, `-all-open`, `-all-green`, `-empty`, `-facts` und alle übrigen Checklist-Stories 0,000 %; `check-summary-line` 0,125 % und `check-result-tones` 0,061 % — Abweichung nur im Rechteck der neuen letzten Zeile (y 87–103 bzw. 389–405), alte Zeilen gleich. Zusätzlich 0,000 %: `JournalEntryReviewList` (4), `BookingReview` (7), Seite Vorsteuer (6), DUO-Connect Einstellungen (9). `InputTaxTab.tsx` typecheckt | ✓ |
| Verträglichkeit in der App | offen (App), erst beim Zeigerhub prüfbar. Gelesen in `ludwig/app` staging `a9af6e631`: `VorsteuerTab.tsx` und `PlausibilityTab.tsx` bilden nur **auf** `CheckItem["state"]` ab; `Step3Single.tsx` reicht `Pruefpunkt` (`"green" \| "yellow" \| "red" \| "open"`) **in** `CheckItems`/`checks` — Verbreiterung, kein Bruch. Brechen kann nur ein Fluss `CheckItem` → Vier-Zustands-Typ (im Set: `reviewScore()` in `JournalEntryReviewList.stories.tsx`, gefiltert ohne Cast); in der App ruft `reviewScore(` nur Tests mit Domänendaten (H1) | offen (App) |
| C6-Abbildung in der JSDoc von `CheckItem.state` | JSDoc nennt „in order → green, a hint with something to do → yellow with action, a hint without → green, an error → red, not checkable → open, being checked → running“ und „„Not checkable“ is `open`, not a state of its own (0148)“ | ✓ |

Mängel:

- **M1 (Regel 1)** `Review.tsx` `RunningSign`: das Zeichen „wird geprüft“
  ist der Knopf-Kreis in Zeilenfarbe bei 70 %, nicht der `Spinner` sm aus
  0268 (Akzent 700, volle Stärke). Dasselbe Zeichen sieht damit in der
  Prüfzeile anders aus als neben „Verbindung wird geprüft …“ auf derselben
  Einstellungsseite, und `Spinner`s eigene JSDoc lässt `label={null}` nur im
  Knopf zu. Beheben: in `v3.css` `.v2pp__running .v2spin` wie
  `.v3spinner > .v2spin` färben (Akzent 700, `opacity: 1`) oder `Spinner`
  einen zugänglichen Namen ohne sichtbares Wort geben — und die Ausnahme in
  der JSDoc von `Spinner` nennen.
- **M2 (Tastatur, Fokus)** `Review.tsx` `CheckItems`: im gefalteten Zweig
  stehen Befunde und Punkte mit `action` in zwei getrennten Arrays
  (`{findings.map(…)}{withAction.map(…)}`); React gleicht nur das erste mit
  der laufenden Liste (`{items.map(…)}`) ab. Die Zeilen mit `action` werden
  beim Falten neu montiert, ein Fokus auf ihrem Knopf fällt auf `body`
  (gemessen BP-05 „DATEV öffnen“, BP-08 „Erledigt“). Beheben: beide in
  **einem** Array im selben Kind-Platz rendern
  (`[...findings, ...withAction].map(…)`), dann bleiben die Knoten; danach
  `ReadinessCheckInUse` mit Fokus auf BP-05 erneut messen.

Hinweise:

- **H1** L-389 (`docs/befunde-app.md`) lässt sich schärfen: die drei
  genannten App-Dateien brechen nach Lesung nicht; betroffen wäre nur, wer
  `CheckItem[]` in einen Typ mit vier Zuständen weiterreicht.
- **H2** `src/showcase/duo-connect/drafts.tsx` baut noch eine eigene
  „running“-Prüfzeile mit dem Kommentar „`CheckItems` … knows no rows still
  being checked“ — überholt; auf `CheckItems` mit `running` umstellen
  (Showcase, nicht Gegenstand).
- **H3** Story `ReadinessCheckInUse`: „Bericht kopieren“ kopiert die
  Rohwerte `green`/`red` (T4, auch in einer Fixture besser die Wörter); die
  Zeile „Live-Region jetzt“ rechnet den Text nach, statt ihn aus der Region
  zu lesen (der Zähler liest das DOM).
- **H4** Ein `jump` an einem grünen Punkt ohne `action` verschwindet beim
  Falten in die geschlossene Gruppe; wer dort den Fokus hat, verliert ihn.
  Nach Regel 3 so gewollt, aber bei M2 mitbedenken.
- **H5** `CheckItemsRunning`: BP-08 läuft mit „Die Freigabe des Browsers wird
  gelesen.“ statt „DATEV wird angefragt.“ wie in der Story-Tabelle —
  inhaltlich besser, Tabelle nachziehen.

Abgenommen von / am: fremder Prüfer (Agent), 2026-11-27 — **nicht
abgenommen** · Offene Punkte: M1, M2; App-Verträglichkeit offen (App).

### Nachprüfung 2026-11-27

Derselbe fremde Prüfer, nach der Meldung des Bauers (M1, M2, H4 behoben;
Nachtrag „aus der Abnahme“). Gemessen im Storybook 6107 und an frischen
Builds: Scratch-Klon auf HEAD `1b9a847` und Klon mit dem **ganzen** jetzigen
Arbeitsbaum (auch fremde Änderungen, `drafts.tsx` gelöscht), beide neu mit
`storybook build -o` in den Scratchpad. Die Bilder wurden im selben
Browser-Kontext abwechselnd je Story aufgenommen (1400 px,
`reducedMotion: 'reduce'`, `deviceScaleFactor` 1, `animations: 'disabled'`).

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1 Zeichen „wird geprüft“ = `Spinner` sm | `check-items-running`: `span.v2pp__running` `role="img"` `aria-label="wird geprüft"`, darin nur `span.v2spin` `aria-hidden` (kein `Spinner label={null}` mehr); Kreis `rgb(43, 111, 156)` = `--color-accent-700`, `opacity: 1`, 14 px — identisch mit `.v3spinner--sm > .v2spin` in `v3-primitives-fläche-spinner--sizes`. Kontrast 5,45:1 auf der weißen Karte, 5,07:1 auf dem Grund von `CheckResult` (`#F5F7F9`; der Bauer nennt 5,03:1). `reducedMotion`: `animation-name: none`, 0 Animationen. Gemeinsame Regel `.v3spinner > .v2spin, .v2pp__running > .v2spin` in `v3.css` | ✓ |
| M2 Fokus beim Falten | `readiness-check-in-use`: Fokus auf „DATEV öffnen“ (BP-05), „Erledigt“ (BP-08) und „Neu verbinden“ (BP-03) bleibt über das Falten auf demselben Knopf, Zeile = derselbe DOM-Knoten, Seite scrollt 0 px. Zusätzlich eine Probe-Story **nur im Scratch-Klon** (nicht im Repo): Punkt mit `action` steht in der Eingabe **vor** einem Befund → beim Falten wird seine Zeile hinter den Befund verschoben, der Fokus bleibt trotzdem auf dem Knopf (React setzt das fokussierte Element nach dem Commit wieder) | ✓ |
| H4 Fokus auf einem Punkt, der gefaltet wird | BP-09 trägt jetzt den Sprung „Einstellungen ansehen“ (grün, ohne `action`). Fokus darauf → nach dem Falten auf `summary` „5 von 6 Prüfungen bestanden“, der Gruppe, die BP-09 jetzt hält; per Tastatur erreicht: `:focus-visible`, Ring 2 px `solid` `#3B8FC4`; nächstes Tab → „1 Prüfung nicht prüfbar“. Liegt der Fokus anderswo auf der Seite (Knopf außerhalb der Liste), bleibt er dort | ✓ |
| Regel 2 und 5 unverändert | Rundlauf: während der Prüfung genau eine Reihenfolge (BP-01 … BP-10), danach einmal gefaltet `R · Insel · BP-03 · BP-05 · BP-06 · BP-08 · 2 Gruppen`; Region: genau 2 Mutationen („Prüfung läuft.“ → „1 verletzt · 4 nicht prüfbar · 5 bestanden“), derselbe Knoten. `check-items-with-action`: BP-03, BP-05, BP-06, BP-08, „5 von 6 Prüfungen bestanden“, „1 Prüfung nicht prüfbar“ | ✓ |
| Ohne `live` kein Client-Code | `check-items-mixed`: 0 `span[hidden]` (keine Insel), 0 `role="status"`; `CheckFoldFocus` nicht in `index.ts` | ✓ |
| Bildvergleich gegen frische HEAD-Bilder | `png-diff.mjs`, 59 Stories: 47 × 0,000 % (alle `Process`, `ProcessPicture`, Checklist-Altstories, `JournalEntryReviewList`, Seite Vorsteuer und die übrigen `BookingReview`); `bookingreview--case-editable` 0,005 % (ein Glyph in einem `select`, 7 × 12 px, sichtbar gleich); `check-summary-line` 0,125 % und `check-result-tones` 0,061 % (nur die neue letzte Zeile). Die 9 Stories `seiten-duo-connect-einstellungen--*` ändern die Größe, weil `Settings.stories.tsx` im Arbeitsbaum bewusst umgebaut ist (`Switch` 0266, `CheckItems` mit `action` und `live`) — nicht vergleichbar; der alte Aufrufer lag im ersten Durchgang bei 0,000 %. Kein vergleichbares Bild ≥ 0,5 %; die 0,03–7,1 % des Bauers lassen sich gegen frische HEAD-Bilder nicht nachstellen | ✓ |
| `typecheck`, `build`, Wächter | ganzer Arbeitsbaum im Snapshot: `tsc --noEmit` Exit 0; `storybook build -o` Exit 0 (HEAD und neu); `check:type`, `check:language`, `check:when`, `check:icons` Exit 0, je `--test` Exit 0; `check:classes` Exit 1 mit denselben 4 Klassen wie auf HEAD | ✓ |
| Verträglichkeit in der App | unverändert offen (App), Lesung wie oben | offen (App) |

**Zuschnitt `CheckFoldFocus`:** tragbar. `"use client"` gilt je Datei; nur
eine eigene Datei hält `Review.tsx` serverfähig. Dafür gibt es Vorbilder im
Set (66 Client-Module, darunter kleine Helfer wie `FilterAutoSubmit`). Die
Insel wird nur mit `live` gerendert. Eine Liste mit `live` lebt ohnehin im
Client, weil sie neu rendert, sobald Ergebnisse eintreffen. Die Insel steht
nicht im Barrel und trägt `@when`/`@instead`. Mit React 19 gibt
`useLayoutEffect` beim Server-Rendern keine Warnung. Der Satz „Server-Component
wie die ganze Familie“ ist per Nachtrag auf Listen ohne `live` eingeschränkt.

Neue Hinweise:

- **H6** `data-code` steht jetzt an **jeder** Prüfzeile, auch ohne `live`.
  Gebraucht wird es nur von der Insel. Das DOM der heutigen Aufrufer ist
  damit nicht mehr Zeichen für Zeichen das alte (pixelgleich, 0,000 %).
  Entweder nur mit `live` setzen oder den Satz unter „Verträglichkeit“
  anpassen.
- **H7** Die Insel holt den Fokus auch dann auf den Gruppenkopf, wenn die
  Nutzerin die Liste nach `body` verlassen hat (gemessen: Fokus auf
  „Einstellungen ansehen“, dann `blur()`, nach dem Falten steht der Fokus auf
  „5 von 6 Prüfungen bestanden“). In der Story scrollt dabei nichts. Steht
  der Kopf außerhalb des Bildes, zieht `focus()` die Seite dorthin. Die
  Erinnerung sollte auch beim Verlassen der Liste nach `body` verfallen.

Abgenommen von / am: fremder Prüfer (Agent), 2026-11-27 (Nachprüfung) —
**abgenommen**; M1 und M2 behoben, H4 umgesetzt · Offene Punkte:
App-Verträglichkeit offen (App), Hinweise H1–H3, H5–H7.

### Behebung H7 der Nachprüfung (Auftraggeber, 2026-11-27)

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Die Insel holt den Fokus nur zurück, wenn er beim Falten aus der Liste verschwand — nicht, wenn die Nutzerin die Liste verlassen hat | `CheckFoldFocus`: `focusout` ohne `relatedTarget` löscht die gemerkte Zeile, sofern das Element danach noch im Dokument steht. Gemessen in `v3-patterns-prüfen-checklist--readiness-check-in-use`: Fokus auf „Einstellungen ansehen“ während der Prüfung → nach dem Falten `SUMMARY` „5 von 6 Prüfungen bestanden“; Fokus auf „Einstellungen ansehen“, dann Klick auf leeren Grund → nach dem Falten `BODY`, `scrollY` 0 | ✓ |
