# 0270 · Prüfpunkt-Zeile: „wird geprüft“ und eine Handlung je Punkt (`CheckItem.state: "running"`, `CheckItem.action`, `CheckItems live`)

| | |
|---|---|
| Status | spec |
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

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
