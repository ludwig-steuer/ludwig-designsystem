# 0221 · StepRail `layout="bar"` — die Kopfleiste über die ganze Abnahme

| | |
|---|---|
| Status | fertig — abgenommen 2026-10-24 (fremde Abnahme, mit Hinweis), Stand `51db640` · Hashes: `51db640` (Bau) und `b2b84e5` (Nachbesserung) waren lokal und sind vor dem Push in `c848b6d` zusammengefasst (Stories mit fiktiven Daten); `51db640^` = `d3e91ff` |
| Stufe | `patterns/` (erweitert `patterns/StepRail.tsx`) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald es dort eine Prüfung in Schritten gibt (Schadenprüfung: Start · Unterlagen · Gutachten · Freigabe) |
| Quelle | Auftrag llcto 2026-10-24 (Owner), Paket 1 · Wireframe `ludwig/app/reports/2026-10-24_abnahme-wizard-wireframe.html` (Kopf `#stepper`) · Konzept `ludwig/app docs/concepts/simple-batch-review.md` §12 „Header bar", Stand e02bfcae2 |
| Ersetzt | `apps/web/src/modules/batch-review/ui/close/CloseStepBar.tsx` (F554, `Wizard` mit nicht klickbaren Köpfen, Stand in Klammern im Label) |
| Blockiert | zweite Runde der Buchhalter-Abnahme `…/batches/[id]/close` |
| Spec von / am | designsystem (Claude), 2026-10-24 |

## Ziel

Die Buchhalterin nimmt einen Stapel in Schritten ab und kommt alle zwei bis
vier Wochen wieder. Eine Leiste über der ganzen Breite sagt ihr, welchen
Stapel sie abnimmt und für welchen Zeitraum, wo sie steht und wie viel in
jedem Schritt noch wartet — und jeder Schritt ist ein Klick. Heute steht dort
der `Wizard` (F554): seine Köpfe sind keine Links, der Stand steht in Klammern
hinter dem Wort („Belege (5 prüfen)"), gewechselt wird nur über die Fußzeile.

## Einordnung

- **Wiederverwenden:** `StepRail` (`@when` „Multi-step review with a traffic
  light and counter per step, on the left") trägt das **Datenmodell** schon
  ganz: `RailItem` hat Nummer, Wort, Ton, Zähler, Ziel, Sperrgrund, `current`;
  „every reachable step is clickable at any time" ist genau die Regel der
  Leiste. Es fehlt nur die **Lage**: oben statt links. `Wizard` ist es nicht:
  sein `@instead` sagt selbst „Every step reachable at any time → StepRail",
  er kennt keine Links und keinen Zähler.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2 — ein `@when` deckt den
  Fall zu vier Fünfteln, das Fehlende ist eine Designentscheidung, die
  wiederkommt (die Abnahme heute, jede spätere Prüfung in Schritten mit
  eigener Seite je Schritt), und lässt sich in der `@when`-Zeile in einem
  Halbsatz sagen: „links (`rail`) oder quer über der Seite (`bar`)".
- **Zuschnitt:** eine Prop an `StepRail`, kein neuer Export. Dieselben
  Zeilen, dieselben Links, derselbe `head`-Slot; nur Markup-Klassen und
  Zeichen am Anfang der Zeile unterscheiden sich.
- **Setzt auf:** `Link`, `ActionIcon` (`confirm`, `alert` — dieselben
  Zeichen wie `Wizard`, 0087).

## Schnittstelle

Neu an `StepRail`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `layout` | `"rail" \| "bar"` | nein, Standard `"rail"` | `bar`: die Schritte waagrecht über der ganzen Breite, `head` links davor | `Bar` |

Unverändert und in der Leiste so gelesen:

| `RailItem`-Feld | In der Leiste |
|---|---|
| `index` | Ziffer im Kreis; bei `tone: "done"` ein Haken statt der Ziffer, bei `"blocked"` ein Warnzeichen — je mit Wort als `aria-label` („erledigt", „gesperrt") |
| `label` | Wort des Schritts; ein langes Wort bricht um statt in der Ellipse zu enden, `title` trägt es zusätzlich |
| `counterText` | Zeile darunter, klein: „11 offen", „1 Warnung", „an DATEV" |
| `href` | der ganze Schritt ist der Link; `null` → nicht klickbar, `disabledReason` als `title` |
| `current` | Kreis gefüllt, Wort fett, `aria-current="step"`, Fläche hinterlegt |
| `tone` | `done` Haken · `blocked` Warnzeichen auf Fehlerfarbe · `open`/`neutral` Ziffer · `dimmed` blass, nicht klickbar |

`head` (vorhanden): links in der Leiste, vom Aufrufer gefüllt — „Stapel
2026-0001 abnehmen" fett, darunter der Zeitraum als `DateRange`. Die Leiste
formatiert nichts selbst.

**Bedingte Schritte** („Vorsteuer-Aufteilung" nur bei gemischter Nutzung)
gibt der Aufrufer als gewöhnliches `RailItem` mit oder lässt ihn weg; die
Leiste weiß nichts von Bedingungen und zeichnet einen bedingten Schritt nicht
anders. Nummern vergibt der Aufrufer (`index`), sie rücken mit.

Was die Leiste **nicht** kann (bewusst): sie hält keinen Zustand und
entscheidet nicht, welcher Schritt erreichbar ist (der Aufrufer setzt `href`
oder `null` mit Grund); sie hat keine Tastenkürzel (der Weg ist der Tab-Weg
durch die Links — Ziffern als Sprungtasten sind Ausbau); sie zeigt keinen
Fortschrittsbalken (der Zähler je Schritt ersetzt ihn).

## Verhalten

- **Server-Component** wie heute (keine Hooks).
- **Breite:** die Leiste füllt ihren Container. `head` nimmt, was er braucht
  (höchstens ein Viertel), die Schritte teilen den Rest **nach Inhalt**
  (`flex: 1 1 auto`), ein langes Wort bricht um. Ist die Leiste schmaler als
  1100 px (1280 px Fenster mit offener Seitenleiste: rund 1010 px), rückt
  `head` als eigene Zeile über die Schritte (Container-Query) — sonst würden
  „Rückfragen", „Buchungen", „Übergeben" bei sieben Schritten abgeschnitten
  (beim Bau gemessen, 2026-10-24). Ohne Querlauf bei 1010 und 1448 px.
- **Hover:** jeder klickbare Schritt hinterlegt sich (`--color-bg-sunken`),
  der aktuelle bleibt auf seiner Fläche. Ein nicht klickbarer Schritt
  antwortet nicht auf Hover.
- **Fokus:** sichtbarer Ring um den ganzen Schritt (`--color-focus`, 2 px),
  nicht abgeschnitten. Reihenfolge: `head` (nicht fokussierbar), dann die
  Schritte von links nach rechts.
- **Trefferfläche:** der ganze Schritt, mindestens 40 px hoch.
- **Farbe nie allein:** Haken und Warnzeichen tragen ein Wort im
  `aria-label`, der Zähler sagt den Stand in Worten.
- **Zustände:** gefüllt ist der einzige — die Leiste hat immer Schritte. Leer
  (keine Schritte) rendert sie nichts als `head`; lädt und Fehler trägt die
  Seite, nicht die Leiste (die Zähler kommen mit den Seitendaten).

## Stories

`v3/Patterns/Frame/StepRail` (vorhandene Datei).

| Story | Beweist |
|---|---|
| `Bar` | Abnahme eines Stapels: Kopf „Stapel 2026-0001 abnehmen" mit Zeitraum, Start (erledigt) · Rückfragen (aktuell, „11 offen") · Belege („5 prüfen") · Konten („1 Warnung") · Buchungen („109 offen") · Übergeben („an DATEV") |
| `BarConditional` | derselbe Stapel mit „Vorsteuer-Aufteilung" vor Übergeben — die Nummern rücken, nichts läuft über (1280 px) |
| `BarStates` | alle Töne nebeneinander: erledigt, aktuell, offen, blass (nicht klickbar, `disabledReason` als `title`), gesperrt (klickbar — die Seite sagt, warum) |

Die vorhandenen Stories der Leiste links bleiben. Nicht anwendbar: leer nach
Filter (keine Filter), lädt und Fehler (gehören der Seite, s. o.).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ziffern 1–9 springen zum Schritt | `hotkeys?: boolean` (über `useHotkeys`) | die Abnahme wird im Alltag per Tastatur durchlaufen (Messung Aufgaben/Stunde) |
| Schritt in Client-Zustand statt URL | `RailItem.onSelect` | eine Prüfung in Schritten ohne eigene Route |

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

- [x] `layout="bar"` legt die Schritte waagrecht über die volle Breite, `head` links (Story `Bar`)
- [x] Jeder Schritt mit `href` ist ein Link über die ganze Fläche, mit Hover und sichtbarem Fokusring; ohne `href` kein Hover, `title` = `disabledReason` (Story `BarStates`, gemessen)
- [x] `done` zeigt einen Haken, `blocked` ein Warnzeichen, beide mit Wort im `aria-label`; der aktuelle Schritt trägt `aria-current="step"` (Story `BarStates`)
- [x] Bei 1010 px Leistenbreite (1280 px mit Seitenleiste) steht der Kopf über sieben Schritten, kein Schrittwort ist abgeschnitten, kein Querlauf; bei 1448 px eine Zeile (Story `BarConditional`, gemessen)
- [x] Trefferfläche je Schritt ≥ 40 px hoch, Kontrast Zähler ≥ 4,5:1 (gemessen)
- [x] `layout="rail"` (Standard) unverändert — die vorhandenen Stories sehen aus wie vorher
- [ ] offen (App): ersetzt `CloseStepBar` in `batch-review/ui/close/` ohne Funktionsverlust (Stand je Schritt im Zähler statt in Klammern)

## Gebaut 2026-10-24

`StepRail.tsx`: Prop `layout`, `BarStep` mit Haken/Warnzeichen aus der
Registry (`confirm`, `alert`) und Wort als `aria-label`; `v3.css` Block
„StepRail `bar`" mit Container-Query. Stories `Bar`, `BarConditional`,
`BarStates`. Gemessen (statischer Build, Playwright): 1010 px Leiste mit
sieben Schritten — Kopf oben, Schritte 111–199 px breit, 54 px hoch, kein Wort
abgeschnitten, kein Querlauf; 1448 px — eine Zeile; Zähler 6,69:1 auf Weiß,
6,19:1 auf dem aktuellen Schritt; `aria-current="step"` am aktuellen,
„erledigt"/„gesperrt" an den Zeichen, `title` am blassen Schritt.

## Abnahme

### Fremde Abnahme 2026-10-24

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung, nicht der Bauende). Stand
`51db640`, Arbeitsbaum sauber. Gelesen: `CLAUDE.md`, Skill `v3-komponente`
(Abnahme), diese Spec, `git show 51db640` für `StepRail.tsx`,
`StepRail.stories.tsx` und den Block „StepRail `bar`" in `v3.css`, dazu
`Wizard.tsx` (Zeichen und Wörter, 0087) und `index.ts` (Gruppe). Gemessen mit
Playwright am statischen Build auf 6199: Fenster 1042 px (Leiste 1010 px, wie
1280 px mit offener Seitenleiste) und 1480 px (Leiste 1448 px); Maße mit
`getBoundingClientRect`, Farben aus `getComputedStyle`, Kontrast nach WCAG
gerechnet. Gegenprobe „Leiste links unverändert": die Stories aus `51db640^`
einmal gegen den Code aus `51db640^` und einmal gegen den Code aus `51db640`
serverseitig gerendert (`renderToStaticMarkup`, esbuild-Bündel außerhalb des
Repos) und das HTML verglichen. Befehle selbst gelaufen. Bildschirmfotos:
`.playwright-mcp/0221-abnahme-bar-conditional-1042.png`,
`0221-abnahme-bar-conditional-1480.png`, `0221-abnahme-bar-states-1042.png`
(Fokus auf „Rückfragen").

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `typecheck` Exit 0; `check:type` Exit 0 („0 older findings left"), `--test` Exit 0; `pnpm build -o` in ein Verzeichnis im Scratchpad Exit 0 („Storybook build completed successfully", nur die bekannte Chunk-Warnung), der Index führt `--bar`, `--bar-conditional`, `--bar-states`. Dazu `check:language`, `check:when`, `check:icons`, `check:contrast` Exit 0 samt `--test`; `check:classes` Exit 1 mit denselben vier Altfällen wie auf `51db640^` (gegen den Elternstand gerechnet), keine neue Klasse ohne Regel | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Prop an `StepRail` in `patterns/StepRail.tsx`, Stories in `StepRail.stories.tsx`; Titel `v3/Patterns/Frame/StepRail` wie in der Spec — die Gruppe heißt im Barrel „Rahmen" (`index.ts:231`), „Frame" steht seit `34f0333` (Hinweis 5) | ✓ (mit Hinweis) |
| Code englisch; `@when`/`@instead` an jedem Export | `@when` „… on the left (`rail`) or across the top of the page (`bar`)", `@instead` um „A linear run whose steps cannot be jumped to → Wizard" ergänzt; Kommentare, Bezeichner (`BarStep`, `BAR_SIGN`, `BAR_WORD`), Story-Namen und Klassen (`v3stepbar*`) englisch | ✓ |
| Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry | kein Hex, kein px im TSX (nur `size={14}` am `ActionIcon` wie in den Nachbarn); Zeichen aus der Registry (`confirm`, `alert`). `BAR_WORD` („erledigt", „gesperrt") ist eine kleine Wortliste wie `STATE_WORD` im `Wizard` — dasselbe Wort an zwei Stellen (Hinweis 4) | ✓ (mit Hinweis) |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `--bar`, `--bar-conditional`, `--bar-states` im Index und im Browser; leer nach Filter, lädt, Fehler in der Spec begründet (gehören der Seite), leer (`items=[]`) rendert nur `head` (Code) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, Zähler mit `tnum`; Farbe nur Signal (Grün = erledigt mit Haken, Rot = gesperrt mit Warnzeichen, je mit Wort); Karte nur Rand (1 px `--color-border`, `radius-lg`); Schrift aus der Skala (Name 13,5 px/500, aktuell 600; Zähler 11,5 px; Kopf erbt, Hinweis 6); Hover und Fokus s. u.; Icon 14 px, Strich 1,5 | ✓ (mit Hinweis) |
| Im Browser angesehen (Storybook), nicht nur gebaut | drei Stories bei 1042 und 1480 px, keine Meldung in der Konsole | ✓ |
| `layout="bar"` legt die Schritte waagrecht über die volle Breite, `head` links (Story `Bar`) | `--bar` bei 1480: Leiste 1448 px, Kopf 253 px links (≤ ¼), sechs Schritte in einer Zeile oben bündig (alle `top` 25), letzter endet in der Leiste | ✓ |
| Jeder Schritt mit `href` ist ein Link über die ganze Fläche, mit Hover und sichtbarem Fokusring; ohne `href` kein Hover, `title` = `disabledReason` (Story `BarStates`, gemessen) | `--bar-states`: fünf `A` über die ganze Fläche, Hover `rgb(236, 239, 243)` (`--color-bg-sunken`), der aktuelle bleibt auf `--color-accent-50`; „Buchungen" (`dimmed`) ist ein `SPAN` ohne Hover-Fläche, Cursor `auto`, `title` = „Ludwig bucht gerade nach. …". Tab-Weg: Start → Rückfragen → Belege → Konten → Übergeben (der blasse übersprungen), jeder Fokus `2px solid rgb(59, 143, 196)` mit `outline-offset: -2px` innen, nicht abgeschnitten | ✓ |
| `done` zeigt einen Haken, `blocked` ein Warnzeichen, beide mit Wort im `aria-label`; der aktuelle Schritt trägt `aria-current="step"` (Story `BarStates`) | Start, Rückfragen: SVG im Kreis, `role="img"`, `aria-label="erledigt"`; Übergeben: `aria-label="gesperrt"`; Belege (aktuell): Ziffer 3, `aria-current="step"`, Name 600. Weiß auf Grün 5,07:1, Weiß auf Rot 6,06:1 | ✓ |
| Bei 1010 px Leistenbreite steht der Kopf über sieben Schritten, kein Schrittwort ist abgeschnitten, kein Querlauf; bei 1448 px eine Zeile (Story `BarConditional`, gemessen) | 1042er Fenster: Leiste 1010 px, Kopf 992 × 58 px oben (25–83), sieben Schritte in einer Zeile darunter (`top` 87), 111–199 px breit, jeder Name einzeilig ohne Überlauf (`scrollWidth` = `clientWidth`), auch „Vorsteuer-Aufteilung" und „Quote bestätigen"; Seite und Leiste ohne Querlauf (`scrollWidth` 1042 bzw. 1008). 1480: Kopf und sieben Schritte in einer Zeile | ✓ |
| Trefferfläche je Schritt ≥ 40 px hoch, Kontrast Zähler ≥ 4,5:1 (gemessen) | jeder Schritt 53,6 px hoch, ≥ 111 px breit. Zähler `#5C5C5C`: 6,69:1 auf Weiß, 6,19:1 auf dem aktuellen Schritt, 5,80:1 im Hover (`bg-sunken`) — der CSS-Kommentar sagt dort „≥ 6:1" (Hinweis 1) | ✓ |
| `layout="rail"` (Standard) unverändert — die vorhandenen Stories sehen aus wie vorher | alle sieben Stories aus `51db640^` (`WithTonesAndCounters` … `ScreenHeaderWithoutNav`) mit altem und neuem Code: HTML Zeichen für Zeichen gleich; `v3.css` ändert keine `.review__*`-Regel | ✓ |
| offen (App): ersetzt `CloseStepBar` in `batch-review/ui/close/` ohne Funktionsverlust | in `docs/befunde-app.md` Abschnitt E eingetragen | offen (App) |
| Zusatz: Schnittstelle Zeichen für Zeichen | `layout?: "rail" \| "bar"`, Vorgabe `"rail"` = Tabelle. Die Lesart der `RailItem`-Felder stimmt bis auf eine Stelle: am aktuellen Schritt steht die Ziffer auch bei `done`/`blocked` (Code-Kommentar „where am I beats is it done"), die Tabelle sagt für `index` nur „bei `done` ein Haken" (Hinweis 3) | ✓ (mit Hinweis) |

### Hinweise (nicht blockierend)

1. **Kontrastkommentar zu hoch.** `v3.css`, Kommentar über `.v3stepbar__count`:
   „≥ 6:1 on `accent-50` and `bg-sunken`" — gemessen 6,19:1 auf `accent-50`,
   aber 5,80:1 auf `bg-sunken` (Hover). Der Wert besteht, die Angabe nicht;
   `check:contrast` prüft nur das erste Paar. Vorschlag: „6.69:1 on white,
   6.19:1 on `accent-50`, 5.8:1 on `bg-sunken` (hover)".
2. **Story-Kopf ohne `DateRange`.** Die Spec (und `befunde-app.md` E) sagen
   „darunter der Zeitraum als `DateRange`"; `BarHead` schreibt
   „01.01.2026 – 31.01.2026" von Hand in ein `span.v2sub`. Vorschlag:
   `<DateRange from="2026-01-01" to="2026-01-31" size="sm" />` — dann zeigt
   die Story, was die App übergeben soll.
3. **Ausnahme am aktuellen Schritt nicht in der Spec.** Tabelle, Zeile
   `index`: ergänzen „— außer am aktuellen Schritt: dort die Ziffer".
4. **Zwei Wortlisten für dieselben Zeichen.** `BAR_WORD` in `StepRail.tsx` und
   `STATE_WORD` in `Wizard.tsx` sagen beide „erledigt". Vorschlag: eine
   gemeinsame Liste neben den Zeichen (z. B. in `Icons.tsx` zu `confirm`/
   `alert`), damit das Wort nicht auseinanderläuft.
5. **Vorbestehend:** Story-Titel `v3/Patterns/Frame/…` statt der
   Barrel-Gruppe „Rahmen" (seit `34f0333`; `Wizard` steht unter
   `v3/Patterns/Rahmen/`). Beim nächsten Anfassen umziehen — die Story-IDs
   ändern sich dann.
6. **Die Leiste erklärt ihr Register nicht.** `.v3stepbar` setzt keine
   Schriftgröße; der Titel im `head` erbt sie vom Umfeld — in der Story
   16 px/700 aus dem Seiten-`body` (gemessen), Name 13,5 px und Zähler
   11,5 px kommen aus eigenen Regeln. Vorschlag wie bei `.v2clc` (0152):
   `.v3stepbar { font-size: var(--fs-ui); line-height: var(--lh-ui); }` und
   in der Story für den Titel eine Rollenklasse aus §2a statt eines nackten
   `strong`.

Vier Linsen: **Sprache** — „Stapel … abnehmen", Wörter der Schritte und
Zähler in Kanzleisprache, „erledigt"/„gesperrt" als Name der Zeichen, kein
Versal, keine Klammer mehr hinter dem Wort ✓. **Bedienung** — jeder Schritt
ein Link über 53,6 px Höhe, Tab-Weg von links nach rechts ohne den blassen,
Fokusring 2 px innen und vollständig sichtbar, Hover nur an klickbaren
Schritten ✓. **Logik** — die Leiste hält keinen Zustand, Erreichbarkeit und
Sperrgrund setzt der Aufrufer, bedingte Schritte sind gewöhnliche Items, die
Nummern kommen von außen ✓. **Darstellung** — Farbe nur als Signal und nie
allein (Haken/Warnzeichen mit Wort, Zähler in Worten), Kopf links und unter
1100 px darüber statt Wörter zu kürzen, eine Karte mit Rand, keine Linie
zwischen den Schritten ✓. Vier-Wochen-Test: wer Ludwig vergessen hat, liest
„Rückfragen · 11 offen" und klickt — ohne Farbe, ohne Taste.

Abgenommen von / am: Claude (fremde Abnahme, nicht der Bauende), 2026-10-24,
Stand `51db640` · **Abgenommen mit Hinweis.** Offene Punkte: Hinweise 1–6
(nicht blockierend); die Ablösung von `CloseStepBar` ist offen (App).

## Nach der Abnahme (2026-10-24, Bauender)

Hinweise erledigt: Kontrastkommentar in `v3.css` nennt die gemessenen Werte
(6,69 · 6,19 · 5,80:1); der Kopf der Stories nutzt `DateRange`; `.v3stepbar`
setzt `--fs-ui`/`--lh-ui`, der Kopf erbt nicht mehr 16 px der Seite.
„Frame" statt „Rahmen" im Story-Titel ist vorbestehend und bleibt.
