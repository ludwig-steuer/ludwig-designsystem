# 0236 · Tabellen in Tabellen: eigene Zellregeln nur für eigene Zellen, Drawer per Portal

| | |
|---|---|
| Status | fertig |
| Stufe | Stil (`src/styles/v3.css`, `.v2tbl` und `.v2drawer`), `primitives/` (`Drawer.tsx`) |
| Klassen-Test | entfällt (Stil und Hülle) |
| Quelle | Befund ll-abnahme 2026-10-27, gemessen in der App auf demo13 (Zeiger 2a5c741): Im Admin-Drawer eines Produktbefunds zerfällt die Spec-Tabelle in Blockzellen. llcto: „Bitte als Nächstes vor dem Laufzeit-Wächter beheben … Drawer per Portal … ergänzend Kind-Selektoren. Dein Entscheid.“ |
| Ersetzt | in `v3.css` die Gegenregel `.v3rrc__parts th, td { display: table-cell }` (wird überflüssig) |
| Blockiert | den Zeigerhub der App |
| Spec von / am | Designer-Sitzung, 2026-10-27 |

## Ziel

Eine Markdown-Tabelle im Drawer eines Befunds zerfällt. Jede Zelle steht als
eigene Zeile untereinander. Die Ursache hat ll-abnahme gefunden:

- Der Drawer wird im DOM **innerhalb** der aufgeklappten Tabellenzeile gerendert:
  `td.v2tbl__detail` → … → `aside.v2drawer` → `.v2mk__tbl`.
- `:where(.v2tbl th, .v2tbl td) { display: block }` trifft als
  Nachfahren-Selektor jede Tabelle darin.

Dasselbe geschieht ohne Drawer mit jeder Tabelle in einem Aufklapper, etwa einem
Agentenbericht mit Tabelle. Der Drawer erbt außerdem Farbe und Zeilenhöhe der
Zelle, aus der er geöffnet wurde.

## Einordnung

Beides wird behoben, weil beides eigene Fehler sind:

- **Kind-Selektoren für `.v2tbl`:** Die Zellregeln der Set-Tabelle gelten nur
  für ihre eigenen Zellen, also
  `.v2tbl > :is(tbody, tfoot) > tr > :is(th, td)`. Die Spezifität bleibt gleich.
  Wo die Regel in `:where()` stand, bleibt sie 0-0-0. Die übrigen Regeln
  bekommen ihre Zwischenstufen in `:where()`, damit sie keine Spezifität
  gewinnen. Damit ist jede Tabelle in einem Aufklapper sicher, ob mit Drawer oder
  ohne. Die Gegenregel `.v3rrc__parts` (Popover in der Prüfgrund-Spalte) wird
  überflüssig und fällt weg.
- **Drawer per Portal nach `body`:** Ein Overlay gehört nicht in den Fluss einer
  Tabellenzeile. Auf dem Server und während der Hydration rendert der Drawer an
  Ort und Stelle (kein `document`), danach im Portal. So gibt es keinen
  Hydrationsfehler; das Muster ist dasselbe wie bei `Popover` (771d2e1).
- **Eigene Schrift für den Drawer:** `.v2drawer` setzt `--fs-ui`, `--lh-ui`,
  `--color-text` und `text-align: left`. Im Portal steht er außerhalb von
  `.app__main` und erbte sonst 16 px vom `body`.

## Schnittstelle

Keine neue Prop. Geändert ist, wo der Drawer im DOM steht (am Ende von `body`),
und welche Zellen die Regeln von `.v2tbl` treffen.

Was die Lösung **nicht** tut: Sie ändert nicht, wie die App den Drawer aufruft.
Ein Drawer, der im Aufklapper deklariert ist, bleibt dort im React-Baum: Events,
Context und Fokusrückgabe laufen wie bisher.

## Verhalten

- Tastatur: `Esc` schließt, Tab bleibt im Drawer, der Fokus geht beim Schließen
  zurück an den Auslöser. Alles wie bisher, auch aus dem Portal.
- Server-Render und Hydration: kein Fehler in der Konsole.

## Stories

Keine neue Story. Nachweis über die vorhandenen Stories von `Drawer`, `Table`,
`DataTable`, `Markdown` und `JournalEntryReviewList` (dort steht `ReviewReasonCell`, eine eigene Story hat die Zelle nicht), dazu eine Laufzeit-Probe mit
einer Markdown-Tabelle im Aufklapper und in einem Drawer, der aus einer Zeile
geöffnet wird.

## Abnahmekriterien

- [ ] Eine Markdown-Tabelle in einem Aufklapper und in einem aus einer Zeile geöffneten Drawer hat `display: table-cell` an ihren Zellen; die Set-Tabelle selbst behält `block` an ihren Zellen (Laufzeit-Probe)
- [ ] Vorher-nachher über alle Stories mit `.v2tbl` bei 1280 und 1440 px: keine Änderung an Lage, Breite, Schrift und `display` der eigenen Zellen und Zeilen (HEAD gegen Arbeitsbaum)
- [ ] `ReviewReasonCell`: Die Tabelle im Popover bleibt eine Tabelle, ohne die gestrichene Gegenregel
- [ ] Der Drawer hängt am Ende von `body`, nicht in der Zeile; `Esc`, Tab-Falle und Fokusrückgabe wie bisher; keine Hydrationsmeldung (Drawer-Stories, dazu eine Server-Render-Probe mit `open`)
- [ ] Der Drawer-Inhalt erbt 13,5 px und `--color-text`, auch im Portal (Drawer-Stories)
- [ ] `pnpm typecheck` grün; `check:type`, `check:classes` (vier bekannte Altklassen), `check:when`, `check:language` grün

## Abnahme

Gemessen gegen HEAD `2a5c741` als statisches Storybook im Scratchpad (Port 6236).
Die zehn Stories `seiten-geschäftspartner-liste--*` wurden zusätzlich gegen
`7cdcc7b` gemessen (Port 6238), weil 0235 dort während der Abnahme einen
Seitenkopf eingefügt hat. Der Arbeitsbaum lief auf dem Dev-Server 6107, der weder
gestoppt noch neu gebaut wurde. Messbrowser war der Headless Shell 1247 über
`CHROME_BIN` und `scripts/cdp.mjs`, mit `prefers-reduced-motion: reduce`. Die
Proben liegen im Scratchpad der Sitzung und ändern keine Datei im Repo:

- `measure-tables.mjs` und `compare-tables.mjs` gehen alle 1379 Stories aus
  `index.json` durch, beide Stände nebeneinander in einem Browser. Gemessen wird
  jede Story, die `table.v2tbl` rendert.
- `probe-nested.mjs` lädt `Table`, `ExpandableRow`, `Markdown`, `Drawer` und
  `Button` per Vite-Import in das iframe von
  `v3-primitives-tabelle-expandablerow--expandable`. Daraus baut es eine Tabelle
  mit zwei offenen Aufklappern. Im ersten steht eine Markdown-Tabelle, im zweiten
  ein Knopf, der einen Drawer mit derselben Tabelle öffnet.
- `probe-drawers.mjs` und `compare-drawers.mjs` prüfen 188 Stories aus 21 Dateien
  mit Drawer, dazu den Popover von `ReviewReasonCell` und eine DOM-Injektion einer
  Markdown-Tabelle in einen Aufklapper auf beiden Ständen.
- `ssr/` rendert per esbuild als CommonJS auf dem Server (`--alias:@=./src
  --external:react --external:react-dom --external:next`), danach folgt
  `hydrateRoot` im Browser (`probe-ssr.mjs`, `probe-ssr2.mjs`).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| Markdown-Tabelle im Aufklapper und im aus einer Zeile geöffneten Drawer `table-cell`, Set-Tabelle `block` | `probe-nested.mjs` bei 1280 und 1440 px. Im Aufklapper sind die Zellen der Markdown-Tabelle `table-cell` und die Zeilen `table-row`, drei Zellen je Zeile auf einer Linie (1280: 387 · 588 · 143 px). Im Drawer, der per Klick aus dem Aufklapper geöffnet wird, gilt dasselbe (208 · 316 · 77 px). Die eigenen Zellen der Set-Tabelle sind `block` (`th`, `__chev`, `td`, `__detail`). Gegenprobe per DOM-Injektion in `v3-primitives-tabelle-expandablerow--expandable`: auf HEAD `block` mit drei Zellen untereinander, im Arbeitsbaum `table-cell` auf einer Linie | ✓ |
| Vorher-nachher über alle `.v2tbl`-Stories bei 1280 und 1440 px | 401 von 1379 Stories rendern `.v2tbl`, mit 496 Tabellen, 3.983 eigenen Zeilen und 22.856 eigenen Zellen. Verglichen wurden Lage und Breite (`getBoundingClientRect`) von Tabelle, Zeile, Zelle und Text in der Zelle (Range), außerdem `display`, Schriftgröße, -gewicht, -familie, Zeilenhöhe, `text-align`, Farbe, Innenabstand und `white-space`. Dazu kommt je Zelle eine Prüfsumme über Lage, `display` und Schrift aller Nachfahren. Gegen `2a5c741` gibt es Unterschiede nur in den zehn Stories `seiten-geschäftspartner-liste--*` (861 je Breite), alle durch den neuen Seitenkopf aus 0235 nach unten versetzt. Dieselben zehn gegen `7cdcc7b`: 0 Unterschiede in 105 Zeilen und 745 Zellen, bei beiden Breiten. In den übrigen 391 Stories gibt es 0 Unterschiede, auch in den Nachfahren, darunter die `.v3bbr`-Tabelle im Saldenabgleich und 13 Tabellen in Drawern. `display` der eigenen Zellen: 22.778 `block` und 78 `flex` (`__group` 52, `__error` 15, `v2actions` 10, ein Spaltenkopf mit (i)). Zeilen: 3.818 `grid`, 165 `block` | ✓ |
| `ReviewReasonCell`: Die Tabelle im Popover bleibt eine Tabelle, ohne die Gegenregel | `v3-entitäten-buchungssatz-journalentryreviewlist--grouped`, `--flat` und `--compact`, die Zelle hat keine eigene Story (H3). Nach dem Klick auf (i) ist der Popover offen, und `.v3rrc__parts` steht im DOM innerhalb der `.v2tbl`. Zellen `table-cell`, Zeilen `table-row`, Caption `table-caption`, die Tabelle misst 292 × 192 px. Alle Zellen sind in Lage, Breite, Ausrichtung, Gewicht, Größe und Innenabstand pixelgleich mit HEAD, wo die Gegenregel noch stand | ✓ |
| Drawer am Ende von `body`, `Esc`, Tab-Falle und Fokusrückgabe wie bisher, keine Hydrationsmeldung | In den Stories: 57 Stories mit 65 Drawern, 40 davon beim Mount offen, 25 über den Knopf der Story geöffnet. Im Arbeitsbaum hängt jeder Drawer an `BODY` und nie in einer Tabelle (auf HEAD in `#storybook-root`). In der Probe sind Scrim und Panel die letzten beiden Kinder von `body`. 12 × Tab und 6 × Umschalt+Tab bleiben in allen 25 geöffneten Drawern im Panel, `Esc` schließt. In 24 von 25 kehrt der Fokus an den Auslöser zurück, die Ausnahme verhält sich auf HEAD genauso (H5). In den 188 Stories gibt es auf beiden Ständen keine Konsolenmeldung. Server-Render mit `open` im Aufklapper: Der Drawer steht an Ort und Stelle, ohne Fehler. Nach `hydrateRoot` gibt es keine Hydrationsmeldung und kein `onRecoverableError`, der Drawer hängt an `BODY`. **Aber:** Nach der Hydration steht der Fokus auf `body` statt im Panel wie auf HEAD, und der erste Tab springt auf einen Knopf hinter dem Scrim (M1) | ✗ M1 |
| Der Drawer-Inhalt erbt 13,5 px und `--color-text`, auch im Portal | Alle 65 Drawer haben `font-size` 13,5 px, `line-height` 20,925 px, die Farbe `rgb(45, 45, 45)` = `--color-text` und `text-align: left`. In der Probe gilt das auch für den Inhalt (`p`, `.v2mk`). Vorher erbten die Drawer der Stories 16/24,8 px vom `body`. Der Stilvergleich über 4.404 Elemente in den Drawern und 19 Eigenschaften zeigt Unterschiede nur in `font-size` und `line-height` (520 Elemente, 16 → 13,5 px) sowie in `text-align` (`start` → `left`, im LTR gleich). Farbe, Familie, Gewicht, Hintergrund und Rahmen gehen nicht verloren. Die Stories haben kein eigenes Theme, die Tokens stehen nur auf `:root`, die Drawer standen vorher in `#storybook-root` oder in einem Wrapper mit Inline-Stil | ✓ |
| `pnpm typecheck`, `check:type`, `check:classes`, `check:when`, `check:language` | `pnpm typecheck` endet mit Exit 0. `check:type` meldet „ok“. `check:classes` endet mit Exit 1 und den vier bekannten Altklassen (`v3clt`, `v3clt__step`, `v2tbl__foot`, `cy-page`), denselben wie auf HEAD. `check:when` meldet „in Ordnung“, `check:language` „ok“. Im ersten Lauf war `check:language` rot, aber nur wegen der damals uncommitteten Datei aus 0235; HEAD mit nur den zwei Dateien aus 0236 war grün. Die Selbstprüfungen (`--test`) aller vier sind grün | ✓ |
| Dazu: Spezifität der umgeschriebenen Regeln | Alt und neu gerechnet: Zellreset, `th`-Ausrichtung und `colspan`-Breite bleiben 0-0-0. `> .v2num` bleibt 0-2-1, `tr:has(> td[colspan])` und `tr:has(> th[colspan])` bleiben 0-2-2, die beiden `.v2sinfo`-Regeln bleiben 0-2-1. Die Reihenfolge ist unverändert. `Table` ist die einzige Quelle von `.v2tbl` und rendert nur `tbody`/`tfoot`, nie `thead`; auch `apps/web/src` baut keine eigene `.v2tbl`. Die Regeln treffen also dieselben eigenen Zellen wie vorher, und keine Klassenregel kann dort anders gewinnen oder verlieren. Kriterium 2 bestätigt das | ✓, H6 |
| Dazu: Gegenregeln | `.v3rrc__parts` fällt weg (Kriterium 3). `.v3bbr > * > tr > th, td { display: table-cell }` bleibt mit der alten Begründung stehen und ist jetzt ebenso überflüssig (H2) | ✓, H2 |
| Dazu: Story-Deckung | Keine neue Prop und keine neue Story. Der Nachweis läuft über die vorhandenen Stories und die Laufzeit-Probe, wie die Spec es vorsieht | ✓ |

Abgenommen von / am: fremde Abnahme, 2026-10-27 · Offene Punkte: M1; H1–H6 nicht blockierend

### Mängel

- **M1 · Ein Drawer, der schon im Server-Render offen ist, verliert nach der
  Hydration den Fokus.** Probe `ssr/page2-*.html`: Der Drawer ist im Aufklapper
  offen, darunter steht eine Zeile mit Knopf. Auf HEAD steht der Fokus nach der
  Hydration im Panel, und Tab bleibt drin. Im Arbeitsbaum steht er auf `body`.
  Der erste Tab landet auf „Nächster Befund“ hinter dem Scrim, erst der zweite im
  Drawer. Ursache: Nach der Hydration schaltet `browser` auf `true`, und das Panel
  wird im Portal neu eingehängt. Der Effekt, der den Fokus hineinsetzt, hängt aber
  nur an `[render, open]` und läuft kein zweites Mal. Das trifft jeden Drawer, den
  die App aus der URL offen rendert (Auswahl in der URL). `Esc` und die
  Fokusrückgabe sind nicht betroffen. Nächster Schritt: `browser` in die
  Abhängigkeiten des Fokus-Effekts aufnehmen, dann die SSR-Probe wiederholen.

### Hinweise

- **H1 · Veralteter Kommentar.** `v3.css` Zeile 4301 zitiert noch
  `.v2tbl :is(th,td) > .v2num`. In der Sache stimmt der Satz (nur direkte Kinder),
  der Selektor lautet aber jetzt
  `.v2tbl > :where(tbody, tfoot) > :where(tr) > :is(th, td) > .v2num`.
- **H2 · Eine zweite Gegenregel bleibt stehen.** `.v3bbr > * > tr > th, td`
  setzt `display: table-cell` und begründet das damit, dass der Reset der `.v2tbl`
  Zellen zu Blöcken mache (Zeilen 4712–4716). Das stimmt seit 0236 nicht mehr.
  `display` und der Kommentar können gehen, die übrigen Werte bleiben. Sichtbar
  ändert sich dadurch nichts, der Saldenabgleich ist in Kriterium 2 unverändert.
- **H3 · `ReviewReasonCell` hat keine eigene Story.** Die Spec nennt „Stories von
  `ReviewReasonCell`“. Die Zelle steht nur in `JournalEntryReviewList` (`--grouped`,
  `--flat`, `--compact`), dort wurde gemessen.
- **H4 · Das Bild jeder Drawer-Story ändert sich.** Alle 57 Stories mit Drawer
  zeigen den Inhalt jetzt in 13,5 statt 16 px. Das ist das Ziel von Kriterium 5
  und entspricht der App (`.app__main`). Ein Vergleich gegen ältere Screenshots
  zeigt es als Änderung, nicht als Fehler.
- **H5 · Nicht aus 0236:** In `v3-entitäten-konto-accountfield--with-ledger` geht
  der Fokus nach `Esc` auf `body` statt an den Auslöser, auf HEAD genauso. Das ist
  ein Fall für eine eigene Prüfung.
- **H6 · Die Kind-Selektoren haben eine Grenze.** Eine `.v2tbl` mit `<thead>`
  bekäme den Reset nicht mehr. Heute rendert `Table` keinen `thead`, und die App
  baut keine eigene `.v2tbl`. Wer später einen `thead` einführt, muss die
  Selektoren erweitern.

### Messung des Bauenden (keine Abnahme)

Probe (Storybook, 1280 px), eine `Table` mit `ExpandableRow` offen, darin eine
Markdown-Tabelle und ein `Drawer`:
- Zellen der inneren Tabelle `table-cell`, im Aufklapper wie im Drawer.
- Der Drawer hängt an `BODY` und nicht mehr in der Tabelle, Schrift 13,5 px,
  Farbe `--color-text`.
- Die Zellen der Set-Tabelle bleiben `block`.

In 40 Stories von `DataTable`, `Checklist`, `JournalEntryReviewList` und
`ReviewReasonCell` sind alle eigenen Zellen `block`. Ausnahme sind die
Gruppenköpfe mit ihrer Klasse (`flex`), wie vorher.

## Nachbesserung 1 (2026-10-27)

| Punkt | Was geändert ist |
|---|---|
| M1 | Der Fokus-Effekt des Drawers hängt jetzt auch an `browser`. Nach der Hydration wird das Panel im Portal neu eingehängt, und der Effekt setzt den Fokus dann erneut ins Panel. Vorher blieb er bei einem Drawer, der schon im Server-Render offen war, auf `body` |
| H1 | Der Kommentar bei `.v2ilrow__total` zitiert den alten Selektor nicht mehr |
| H2 | `.v3bbr`: `display: table-cell` ist gestrichen, der Kommentar sagt, dass `.v2tbl` diese Zellen seit 0236 nicht mehr erreicht. Polster und Linien bleiben |
| H3 | Die Spec nennt `JournalEntryReviewList` als Ort von `ReviewReasonCell` |
| H6 | Die Kind-Selektoren nehmen auch `thead` auf: Eine künftige `.v2tbl` mit Kopfgruppe bekommt dieselben Regeln. Spezifität unverändert (`thead` steht in `:is()`/`:where()`) |
| H4, H5 | bleiben: 13,5 statt 16 px im Drawer ist gewollt; die fehlende Fokusrückgabe in `AccountField/WithLedger` ist so schon in HEAD |

## Nachprüfung 1 (2026-10-27)

Gemessen wurde gegen HEAD `7cdcc7b` als statisches Storybook im Scratchpad (Port
6238). Zwischen diesem Stand und dem Arbeitsbaum liegen nur `v3.css` und
`Drawer.tsx`. Der Arbeitsbaum lief auf dem Dev-Server 6107, gemessen mit dem
Headless Shell 1247 über `scripts/cdp.mjs`. Es liefen dieselben Skripte wie bei
der Abnahme, dazu `probe-bbr.mjs` für `.v3bbr`.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M1: Fokus nach der Hydration im Panel, keine Hydrationsmeldung | `ssr/` neu gebaut mit dem jetzigen `Drawer.tsx`, `probe-ssr2.mjs` und `probe-ssr.mjs`. Nach `hydrateRoot` hängt der Drawer an `BODY`, und `document.activeElement` ist das Panel. Vier Tabs gehen „Schließen“ → „Vollansicht öffnen“ → „Schließen“ → „Vollansicht öffnen“, alle im Panel. Auch mit dem Knopf „Nächster Befund“ hinter dem Scrim springt der Fokus nicht mehr hinaus. Es gibt kein `onRecoverableError` und keine Fehler- oder Warnmeldung in der Konsole. `Esc` schließt | ✓ |
| M1: Drawer-Stories wie in der Abnahme | `probe-drawers.mjs` über dieselben 188 Stories: 57 Stories mit 65 Drawern, alle an `BODY` in 13,5/20,925 px und `--color-text`. 12 × Tab und 6 × Umschalt+Tab bleiben in allen 25 geöffneten Drawern im Panel. Die Fokusrückgabe gelingt in 24 von 25, wie in der Abnahme. Die Ausnahme ist wieder `v3-entitäten-konto-accountfield--with-ledger`, auf HEAD genauso (H5). Keine Konsolenmeldung. Der Stilvergleich zeigt wie zuvor nur `font-size`, `line-height` und `text-align` | ✓ |
| H6: `thead` in den Selektoren | `measure-tables.mjs` und `compare-tables.mjs` über alle 401 Stories mit `.v2tbl` (496 Tabellen, 3.983 eigene Zeilen, 22.856 eigene Zellen) bei 1280 und 1440 px: 0 Unterschiede in Lage, Breite, Text in der Zelle, `display`, Schrift, Ausrichtung, Farbe und Innenabstand, auch keine in den Prüfsummen der Nachfahren. Die Spezifität ist nachgerechnet: `thead` steht nur in `:is()` innerhalb von `:where()` oder in `:where()`, die Werte 0-0-0, 0-2-1 und 0-2-2 bleiben | ✓ |
| H2: `.v3bbr` ohne `display: table-cell` | `probe-bbr.mjs` über die Stories `seiten-saldenabgleich--*` bei 1280 und 1440 px: 13 Tabellen `.v3bbr` mit 55 Zeilen und 228 Zellen, dazu fünf geöffnete Erklärungs-Popover mit ihren Tabellen. Alle Zellen sind `table-cell`. Lage, Breite, Text, Schrift, Ausrichtung, Polster, Linien und Hintergrund sind gleich wie auf HEAD, 0 Unterschiede. Der Kommentar nennt den neuen Grund | ✓ |
| H1: Kommentar bei `.v2ilrow__total` | `v3.css` Zeile 4301: „the `.v2num` rule of `.v2tbl` only reaches a direct child of a cell“. Der alte Selektor ist nicht mehr zitiert | ✓ |
| H3: Ort von `ReviewReasonCell` | Abschnitt „Stories“ nennt `JournalEntryReviewList` und sagt, dass die Zelle keine eigene Story hat. Der Popover in `--grouped`, `--flat` und `--compact` ist pixelgleich mit HEAD | ✓ |
| `pnpm typecheck`, `check:type` | `pnpm typecheck` endet mit Exit 0, `pnpm check:type` mit „ok“ und Exit 0 | ✓ |

Abgenommen von / am: fremde Abnahme, 2026-10-27 (Nachprüfung 1) · Offene Punkte: keine. M1 ist behoben; H1, H2, H3 und H6 sind umgesetzt; H4 und H5 bleiben als Hinweise (H4 ist gewollt, H5 stammt nicht aus 0236)

