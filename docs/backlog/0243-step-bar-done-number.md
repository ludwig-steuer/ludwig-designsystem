# 0243 · StepRail `bar`: Nummer bleibt bei „erledigt“

| | |
|---|---|
| Status | fertig — abgenommen 2026-11-03 (fremde Abnahme, keine Mängel, H1–H5) |
| Stufe | `patterns/` (Änderung an `patterns/StepRail.tsx`, `layout="bar"`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → ja, jede Prüfung in Schritten mit eigener Seite je Schritt (0221) |
| Quelle | ll-abnahme 2026-11-03, DS-Wunsch (Owner 2026-11-02): „gefällt mir nicht, dass die Zahlen sich in ein Check-Symbol verwandeln können — grün markiert ja, aber die Zahl soll bleiben.“ |
| Ersetzt | den Haken statt der Ziffer bei `tone: "done"` aus 0221 (`BAR_SIGN.done = "confirm"`) |
| Blockiert | nichts. Genutzt in der Kopfleiste der Abnahme (`…/close`, App `CloseFrame.tsx`). Den Zeiger setzt llcto |
| Spec von / am | Designer-Sitzung, 2026-11-03 |

## Ziel

Die Kopfleiste der Abnahme zeigt jeden Schritt mit seiner Nummer im Kreis.
Heute wird die Nummer eines erledigten Schritts zum Haken. Wer nach vier Wochen
zurückkommt und „Schritt 4“ sucht, muss dann zählen. Künftig bleibt die Nummer,
und der Kreis wird grün. „Erledigt“ hört der Screenreader weiterhin.

## Einordnung

- **Wiederverwenden:** `StepRail` mit `layout="bar"` (0221). Die Regel
  `.v3stepbar__step--done .v3stepbar__num` färbt den Kreis schon grün mit
  weißer Schrift.
- **Erweitert:** nichts. Kein Prop, kein Export, kein Token, kein neues Wort
  („erledigt“ steht schon in `BAR_WORD`).
- **Zuschnitt:** `BarStep` in `StepRail.tsx`.
- **Setzt auf:** `.v2vh` (nur für Screenreader) für das Wort.

## Schnittstelle

Unverändert. Die Lesart von `index` und `tone` in der Leiste ändert sich:

| `RailItem`-Feld | Bisher (0221) | Neu | Nachweis (Story) |
|---|---|---|---|
| `index` bei `tone: "done"` | Haken statt Ziffer, `role="img"`, `aria-label="erledigt"` | Ziffer im grünen Kreis. Das Wort „erledigt“ steht als `.v2vh` hinter dem Namen und ist Teil des Linknamens („1 Start erledigt Überblick“) | `BarStates`, `Bar` |
| `index` bei `tone: "blocked"` | Warnzeichen statt Ziffer, `aria-label="gesperrt"` | unverändert (siehe Verhalten) | `BarStates` |
| `current` | Ziffer auf Primärfarbe, auch bei `done` | unverändert | `BarStates` |

**Kann bewusst nicht:** Sie ändert `layout="rail"` nicht (Punkt statt Kreis)
und auch nicht den `Wizard` (siehe Offene Frage 1).

## Verhalten

- **`done`:** Die Ziffer bleibt, 12,5/600 `tabular-nums`, weiß auf
  `--color-success`. Kontrast 5,07:1 laut 0221, für Text dieser Größe
  ≥ 4,5:1 nötig, wird nachgemessen.
- **Farbe nicht allein (V7):** Der erledigte Kreis ist gefüllt, der offene nur
  umrandet. Das ist eine Form und nicht nur ein Farbton. Das Wort „erledigt“
  wird vorgelesen. Der Zähler darunter („alle beantwortet“) kommt wie bisher von
  der App.
- **`blocked` behält das Warnzeichen.** Mit Ziffer stünden ein grüner und ein
  roter gefüllter Kreis nebeneinander, die sich nur in der Farbe unterscheiden.
  Rot ist Kritikalität (Stufe Fehler). Sie braucht ein Zeichen und kein reines
  Farbsignal (V7, §2). Die Abnahme nutzt `blocked` heute nicht. Die Regel
  „Zeichen nur für Kritikalität“ gilt im ganzen Set.
- **Aktueller Schritt:** wie bisher Ziffer auf Primärfarbe. Ist er zugleich
  `done`, wird „erledigt“ nicht vorgelesen. `aria-current="step"` sagt „hier“,
  wie bisher das fehlende Zeichen.
- **Tastatur, Hover, Fokus:** unverändert (0221).
- **Server/Client:** unverändert, Server-tauglich.

## Stories

Titel `v3/Patterns/Frame/StepRail`. Keine neue Story:

| Story | Beweist |
|---|---|
| `BarStates` | „Start“ und „Rückfragen“ erledigt: Ziffer 1 und 2 im grünen Kreis. „Belege“ aktuell, „Übergeben“ gesperrt mit Warnzeichen |
| `Bar` | im Einsatz: „Start“ erledigt mit Ziffer 1 |
| `WithTonesAndCounters` | `layout="rail"` unverändert |

## Ausbau

Kein Ausbau.

## Offene Fragen

1. **`Wizard` mitziehen?** Dort wird die Ziffer eines erledigten Schritts auch
   zum Haken (0087). Default: Der Wizard bleibt, bis der Owner es auch dort
   will. Er ist ein linearer Lauf (Import, Anlage), keine Kopfleiste, und der
   Wunsch galt der Abnahme. Wird es gewünscht, trägt dieselbe Änderung
   (`STATE_ICON.done` weg, `.v2vh`) ihn auch.

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

- [ ] `done`: Ziffer im Kreis, kein SVG, Kreis `--color-success` mit weißer Ziffer, Kontrast ≥ 4,5:1 gemessen (`BarStates`, `Bar`)
- [ ] Linkname eines erledigten Schritts enthält „erledigt“ (Accessibility-Baum oder `textContent` des Links), sichtbar steht es nicht (`BarStates`)
- [ ] `blocked`: Warnzeichen mit `aria-label="gesperrt"` wie bisher (`BarStates`)
- [ ] Aktueller Schritt unverändert: Ziffer auf Primärfarbe, `aria-current="step"`, kein „erledigt“ (`BarStates`)
- [ ] Kreisgröße 24 × 24 px, Zeilenhöhe und Breiten der Schritte gleich wie vorher, nichts springt (`BarStates`, vorher/nachher gemessen)
- [ ] `layout="rail"` und `Wizard` unverändert (`WithTonesAndCounters`, Wizard-Stories)

## Abnahme

Gemessen auf dem laufenden Dev-Server (Port 6107), der weder neu gestartet noch
neu gebaut wurde. Messbrowser war die Headless Shell 1247 über `CHROME_BIN` und
`scripts/cdp.mjs`, ein Browser je Skript, bei 1280 und 1920 px. Die Proben
liegen im Scratchpad der Sitzung unter `abn0243/` (`m1.mjs` bis `m4.mjs`, dazu
Server-Render in `abn0243/ssr/`) und ändern keine Datei im Repo. Vorher-Stand:
`0243-before.json` aus dem Bau und `git show HEAD:src/ui/v3/patterns/StepRail.tsx`.
Story-IDs unten ohne das Präfix `v3-patterns-frame-steprail`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` Exit 0. `pnpm build` (= `storybook build`) lief nicht im Repo, sondern als `pnpm exec storybook build -o` in den Scratchpad: Exit 0, „Storybook build completed successfully“. `check:when`, `check:language`, `check:type`, `check:contrast` und `check:icons` Exit 0, alle Selbsttests (`--test`) grün. `check:classes` endet mit Exit 1 und genau den vier Altklassen `v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page` | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Die Änderung steht nur in `patterns/StepRail.tsx` (`BarStep`, `BAR_SIGN`), die Stories bleiben unverändert in `StepRail.stories.tsx` daneben. Titel `v3/Patterns/Frame/StepRail`. „Frame“ statt „Rahmen“ ist vorbestehend (0221, Hinweis 5) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Das JSDoc von `StepRail` und `BAR_SIGN` und die neue Variable `doneWord` sind englisch. Deutsch steht nur als zitierter UI-String „erledigt“, wie in den Nachbarkommentaren („3 von 18 offen“). `@when`/`@instead` an `StepRail` sind unverändert. `check:when` meldet „in Ordnung“, `check:language` „0 German comment lines“ | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Im Diff steht kein Hex und kein px. Es gibt kein neues Wort: „erledigt“ kommt aus dem vorhandenen `BAR_WORD` (0221, Hinweis 4: Wortliste wie `STATE_WORD` im Wizard). Das Zeichen `alert` kommt weiter aus der Registry, `confirm` fällt in der Leiste weg. Kein Status ist berührt. `git diff HEAD -- src/styles/v3.css` berührt keine Regel der Leiste, nur `.v2clc` (0242) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `--bar-states`, `--bar` und `--with-tones-and-counters` stehen im Index und rendern. Eine neue Story gibt es nicht, wie in der Spec. Die Leiste hat nur den Zustand „gefüllt“ (0221). Die Regel „aktuell und zugleich `done` → kein ‚erledigt‘“ zeigt keine Story. Sie ist per Server-Render nachgewiesen (`ssr/entry.tsx`, H2) | ✓, H2 |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe `patterns/`, die Importe sind unverändert. Text links, Ziffer mit `tabular-nums`. Farbe nur als Signal: Grün heißt erledigt, mit gefülltem Kreis und vorgelesenem Wort. Rot heißt gesperrt, mit Zeichen und Wort. Die Schrift kommt aus der Skala: Ziffer 12,5 px/600, Name 13,5 px/500, am aktuellen Schritt 600. Zur `.v2vh`-Regel in §9: `.v3stepbar` ist kein Scroll-Container (kein `overflow`). Das `.v2vh` steht 1 × 1 px an seiner statischen Stelle im Schritt, bei „Start“ x 289,6 / y 32 im Kasten 250,6–401,8 / 25–78,6. Die Seite hat `scrollWidth` = `clientWidth` (1280 = 1280, 1920 = 1920), die Leiste ebenso (1246, 1886). Die Leiste ist 71,6 px hoch, die Schritte stehen wie vorher (Zeile „nichts springt“). Fokus: Tab auf „Start“ ergibt `:focus-visible`, `2px solid rgb(59, 143, 196)`, Versatz −2 px, ganz im Schritt (`bar-states-1280-focus-done.png`). Hover über „Start“: Fläche `rgb(236, 239, 243)`, Cursor `pointer`, der Kreis bleibt grün, 4,39:1 gegen die Hover-Fläche | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Geladen bei 1280 und 1920 px: `--bar-states`, `--bar`, `--bar-conditional`, `--with-tones-and-counters`, `--all-done`, `--nothing-computed-yet` und die fünf Wizard-Stories. Keine Seite läuft quer. Die Konsole meldet 0 Fehler, 0 Warnungen und 0 Ausnahmen; die Erfassung wurde mit einem `console.error` geprüft. Screenshots `bar-states-1280.png`, `bar-states-1920.png`, `bar-1280.png`, `bar-states-1280-x2.png`, `bar-states-1280-grayscale.png` | ✓ |
| `done`: Ziffer im Kreis, kein SVG, Kreis `--color-success` mit weißer Ziffer, Kontrast ≥ 4,5:1 gemessen | In `--bar-states` (1280 und 1920) zeigt „Start“ die Ziffer `1` und „Rückfragen“ die `2`, je ohne `svg`, `role` und `aria-label`. In `--bar` und `--bar-conditional` zeigt „Start“ die `1`. Der Kreis ist `rgb(63, 122, 90)` (`--color-success`), die Ziffer `rgb(255, 255, 255)` in 12,5 px/600 mit `tabular-nums`. Weiß auf Grün misst 5,07:1 (≥ 4,5:1 für Text dieser Größe), der Kreis gegen die Leiste ebenfalls 5,07:1 | ✓ |
| Linkname eines erledigten Schritts enthält „erledigt“, sichtbar steht es nicht | `Accessibility.getFullAXTree` in `--bar-states`: Link „1 Start erledigt Überblick“ und „2 Rückfragen erledigt alle beantwortet“. In `--bar` und `--bar-conditional`: „1 Start erledigt Überblick“, genau wie in der Spec. Das `.v2vh` trägt „ erledigt“ mit `clip-path: inset(50%)` auf 1 × 1 px. Im Screenshot ist kein Wort zu sehen | ✓ |
| `blocked`: Warnzeichen mit `aria-label="gesperrt"` wie bisher | „Übergeben“ in `--bar-states`: `svg` im Kreis, `role="img"`, `aria-label="gesperrt"`, Kreis `rgb(168, 64, 60)`, 6,06:1 gegen die Leiste. Der Linkname bleibt „gesperrt Übergeben 2 Sperren“ wie vorher. Der Server-Render zeigt `blocked` in allen vier Lagen gleich wie `HEAD` | ✓, H5 |
| Aktueller Schritt unverändert: Ziffer auf Primärfarbe, `aria-current="step"`, kein „erledigt“ | „Belege“ in `--bar-states`: Ziffer `3` auf `rgb(26, 58, 92)` (11,64:1), `aria-current="step"`, Name 600 in Primärfarbe, kein `.v2vh`, Linkname „3 Belege 2 prüfen“. Aktuell und zugleich `done` per Server-Render: Ziffer, `aria-current="step"`, kein „erledigt“. Dieser Fall ist im Vergleich mit `HEAD` Zeichen für Zeichen gleich | ✓ |
| Kreisgröße 24 × 24 px, Zeilenhöhe und Breiten der Schritte gleich wie vorher, nichts springt | Vorher `0243-before.json`, nachher `abn0243/m1.json`: 38 Schritte in `--bar-states`, `--bar` und `--bar-conditional` bei 1280 und 1920 px. Kasten (x, y, Breite, Höhe), Kreis 24 × 24, Kreisfarbe, Ziffernfarbe und Schrift sind bis auf die Zehntelstelle gleich, 38 von 38. Jeder Schritt ist 53,6 px hoch | ✓ |
| `layout="rail"` und `Wizard` unverändert | Server-Render von `StepRail` aus `HEAD` gegen den Arbeitsbaum (`ssr/cmp.tsx`) mit 20 Schritten über alle Töne × aktuell × mit/ohne Link. `rail` ist Zeichen für Zeichen gleich. In `bar` unterscheiden sich nur die zwei nicht aktuellen `done`-Schritte. Im Browser zeigen `--with-tones-and-counters`, `--all-done` und `--nothing-computed-yet` Punkt und „n · Name“, ohne `svg` und ohne `.v2vh` (`rail-with-tones-1280.png`). `Wizard.tsx` hat keinen Diff. `v3-patterns-rahmen-wizard--filled`, `--states`, `--with-footer` und `--many-steps` zeigen erledigt weiter als Haken (`svg`, `role="img"`, `aria-label="erledigt"`). `--in-use` hat keinen erledigten Schritt (`wizard-states-1280.png`) | ✓, H4 |
| Zusatz: ohne Farbe unterscheidbar (V7, Vier-Wochen-Test) | Graustufen-Screenshot `bar-states-1280-grayscale.png`. Erledigt ist ein gefüllter Kreis mit Ziffer, offen eine Ziffer ohne Fläche, blass ist halbtransparent. Aktuell ist ein dunklerer gefüllter Kreis, dazu Fläche und Name in 600. Gesperrt ist ein gefüllter Kreis mit Zeichen. Alle fünf sind ohne Farbe auseinanderzuhalten. Erledigt und aktuell unterscheiden sich aber nur noch schwach (H3) | ✓, H3 |
| Zusatz: Spec und Doku stimmen mit dem Code | Die Schnittstellen-Tabelle der Spec stimmt mit dem Code überein, auch der Linkname. Das JSDoc von `StepRail` und `BAR_SIGN` beschreibt die neue Lesart. Der Nachtrag in 0221 steht. Zwei Stellen in `docs/` beschreiben noch den Haken (H1) | ✓, H1 |

Abgenommen von / am: fremde Abnahme, 2026-11-03 · Offene Punkte: keine Mängel; H1–H5 nicht blockierend

### Hinweise

- **H1 · Zwei Stellen nennen noch den Haken.** `docs/befunde-app.md:396`
  (Abschnitt E, Übergabe an die App) sagt bei `StepRail layout="bar"` noch
  „`tone` (`done` → Haken)“. In 0221 steht unter Verhalten noch „Farbe nie
  allein: Haken und Warnzeichen tragen ein Wort im `aria-label`“. Der Nachtrag
  dort nennt nur „die Zeilen `index` und `tone` der Tabelle“. Vorschlag: In
  `befunde-app.md` „(`done` → Ziffer auf Grün, 0243)“ schreiben, und der
  Nachtrag in 0221 nennt auch den Punkt „Farbe nie allein“. Andere Stellen in
  `docs/` (ohne `docs/ludwig/` und `reference/`) und im JSDoc beschreiben keinen
  Haken für die Leiste. Die Abnahme-Zeilen von 0221 sind Befunde ihrer Zeit und
  bleiben.
- **H2 · Keine Story zeigt „aktuell und erledigt“.** Die Spec sagt, an diesem
  Schritt wird „erledigt“ nicht vorgelesen. Nachweisen lässt sich das nur per
  Server-Render, weil `BarStates` den aktuellen Schritt als `open` führt. Für
  `rail` zeigt `AllDone` den Fall. Ein Schritt in `BarStates` mit `tone: "done"`
  und `current` würde die Regel sichtbar machen.
- **H3 · Erledigt und aktuell haben jetzt dieselbe Form.** Vorher war erledigt
  ein Haken und aktuell eine Ziffer auf Fläche. Jetzt sind beide ein gefüllter
  Kreis mit weißer Ziffer. Ohne Farbe trennen sie drei Dinge: Der Kreis ist
  dunkler (Grün gegen Primär 2,3:1), es gibt die Fläche `accent-50` (1,08:1 gegen
  Weiß, kaum zu sehen), und der Name steht in 600 statt 500. Im
  Graustufenbild reicht das, vor allem über den fetten Namen. Offen ist nur
  „Ziffer ohne Fläche“: Der Ring `--color-border-strong` misst 1,62:1 auf Weiß,
  der Unterschied zu erledigt hängt also an der Füllung (5,07:1), nicht am Ring.
  Das ist vorbestehend und so vom Owner gewollt („grün markiert ja“). Wird es
  in der App eng, braucht der aktuelle Schritt ein stärkeres eigenes Zeichen.
  Das gehört nicht zu 0243.
- **H4 · Wizard und Leiste zeigen „erledigt“ jetzt verschieden.** Im Wizard
  steht ein Haken, in der Leiste eine Ziffer auf Grün. Das ist Offene Frage 1
  mit ihrem Default und bleibt offen, bis der Owner entscheidet. Bis dahin
  bekommt dieselbe Frage („ist der Schritt erledigt?“) in zwei Bausteinen zwei
  Bilder.
- **H5 · Ein gesperrter Schritt hat weiter keine Nummer.** Sichtbar steht dort
  das Warnzeichen. Vorgelesen wird „gesperrt Übergeben 2 Sperren“, ohne „6“.
  Das Argument des Owners, dass die Nummer nach vier Wochen den Schritt findet,
  gilt dort also nicht. Die Spec begründet das mit V7 und §2: Rot braucht ein
  Zeichen. Will der Owner auch dort die Nummer, stünde das Zeichen neben der
  Ziffer statt an ihrer Stelle.

### Nach der Abnahme (2026-11-03)

- H1: `docs/befunde-app.md` (Zeile 0221) und der Nachtrag in 0221 nennen den Haken nicht mehr für `done`.
- H2, H3, H5 bleiben so, wie die Spec sie begründet. H4 (Wizard) ist Offene Frage 1 und geht an llcto.
