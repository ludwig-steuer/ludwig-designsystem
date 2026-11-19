# 0248 · FactRecordView: woraus Steuerschlüssel, Belegfeld 1 und Buchungstext entstanden sind

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-19 |
| Stufe | `entities/fact-record/` (Erweiterung von `FactRecordView`, 0247 Teil A) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein: Belegfeld 1, Steuerschlüssel, Buchungssatz |
| Quelle | ll-ceo 2026-11-19 (Koordination Booking v3); App-Spec F694 (`docs/backlog/F694-fact-view-entry-value-origin.md`), umgesetzt in App `72a468be2` auf dem App-Branch `booking-v3` |
| Ersetzt | nichts; die App zeigt die beiden Felder bis dahin nicht (F694 T694.4) |
| Blockiert | den Zeiger der App auf `booking-v3` mit F694 |
| Spec von / am | Designer-Sitzung, 2026-11-19 |

Arbeitsort: DS-Branch `booking-v3` (Worktree `../designsystem-bv3`), nicht
`main` — der Typ mit den neuen Feldern liegt nur dort.

## Ziel

In der Leiste „Worauf die Buchung beruht“ sieht die Sachbearbeiterin heute
den Wert jeder Ergebniszeile, aber nicht, woraus er entstanden ist. Bei
Steuerschlüssel, Belegfeld 1 und Buchungstext kommt die Antwort nicht aus
Fakten, sondern aus der Begründung des Buchungskerns. Sie soll unter dem Wert
stehen, damit sie den Wert prüfen kann, ohne die Buchung zu öffnen. Die
Zeilen des Satzes zeigen zusätzlich ihr Belegfeld 1, wie DATEV es führt.

## Einordnung

- **Wiederverwenden:** `FactRecordView` (0247) trägt den Fall zu vier
  Fünfteln. Es kommen nur zwei Datenfelder des `FactView` hinzu, keine Prop.
- **Erweitert, weil:** `spec-schreiben` §3 Regel 2 — zwei Felder des
  App-Modells, die das Set zeigen soll. Die Schnittstelle der Komponente
  bleibt gleich.
- **Zuschnitt:** dieselbe Datei. Keine neue Klasse; der Sekundärtext nutzt
  `v2sub` und die Blockklasse der Ansicht (`v3frv__text`).
- **Setzt auf:** `FieldList` (Ergebnis), die Tabelle des Satzes in
  `FactRecordView.tsx` (`EntryLines`).

## Schnittstelle

Keine neue Prop. Neu sind zwei Felder im Typ `FactView` (Spiegel aus App
`72a468be2`, `src/ludwig/modules/fact-records/domain/fact-view.ts`):

| Feld | Typ | Bedeutung | Nachweis (Story) |
|---|---|---|---|
| `result[].explanation` | `string`, optional | woraus der Wert entstanden ist, ein deutscher Satz oder Halbsatz der App | `WithAssumptions`; ohne Feld `ByHand` |
| `entry.lines[].documentNumber` | `string \| null` | Belegfeld 1 der Zeile | `WithAssumptions`; `null` in `OpenPoint` (Zeile ohne Nummer) |

Die neuen Ergebnis-Schlüssel `tax_key`, `document_number`, `posting_text`
braucht das Set nicht zu kennen: Die Bezeichnung kommt in `label`, das Set
hat keine eigene Wortliste. Die Wörter der Herkunft schreibt die App
(`fact-labels.ts`, F694 T694.2).

Was die Ansicht **nicht** tut (bewusst): Sie kürzt die Herkunft nicht, setzt
keine Überschrift davor und zeigt den Rohwert einer unbekannten Stufe so, wie
die App ihn liefert (in Klammern).

## Verhalten

1. **Herkunft an der Ergebniszeile.** Steht `explanation` an der Zeile, folgt
   sie dem Wert als eigene Zeile im Sekundärtext (`v2sub`), ohne Überschrift
   und ohne Doppelpunkt-Wort. Danach folgt, wie bisher, „aus: …“. Reihenfolge
   also: Wert · Herkunft · „aus: …“. Der Wert sagt, was gilt, die Herkunft
   sagt, wie er zustande kam, „aus:“ führt zu den Fakten. Fehlt `explanation`,
   sieht die Zeile aus wie heute.
2. **Belegfeld 1 an der Buchungszeile.** Keine eigene Spalte: In der Leiste
   `md` bei 1280 px bleiben der Spalte „Konto“ heute etwa 250 px, eine fünfte
   Spalte ließe ihr unter 120 px. Und Belegfeld 1 ist in einem Satz fast
   immer auf allen Zeilen gleich (CLAUDE.md, Logik: was die Spalte nicht
   unterscheidet, gehört in die Unterzeile). Die Nummer steht deshalb in der
   Unterzeile unter dem Konto, in DATEV-Ordnung vor dem Buchungstext
   (Belegfeld 1 · Buchungstext), in `--font-mono` wie jede Belegnummer im Set
   (`SourceDocumentRefCell`, Owner E4: die Nummer als kleine zweite Zeile).
   Für Screenreader trägt sie das Wort „Belegfeld 1“ unsichtbar davor. Ist
   `documentNumber` `null`, steht nur der Text da; fehlen beide, gibt es
   keine Unterzeile.
3. Keine neue Interaktion, kein neuer Zustand. Lädt und Fehler bleiben, wie
   0247 sie zeigt.

## Stories

Keine neue Story: `FactRecordView` hat zehn, die Obergrenze. Die Fixtures
der bestehenden Stories tragen die neuen Felder.

| Story | Beweist zusätzlich |
|---|---|
| `WithAssumptions` | Ergebnis in der Ordnung der App (Steuerbehandlung, Konto, Steuerschlüssel, Belegfeld 1, Buchungstext); die drei neuen Zeilen mit Herkunft, Steuerschlüssel mit Herkunft **und** „aus:“, Buchungstext mit Vergleichstext in Anführungszeichen; Zeilen des Satzes mit Belegfeld 1 vor dem Text |
| `ByHand` | Von Hand gebucht, keine Begründung am Satz: dieselben Zeilen ohne Herkunft, so wie heute |
| `OpenPoint` | eine Zeile des Satzes ohne Belegfeld 1 (`null`): nur der Text |
| `InUse` | alles im Drawer `md`, kein Querscroll bei 1280 px |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Belegfeld 1 und Buchungstext als eigene Spalten, wie in `JournalEntryCompact` | gleiche Zeilenform für alle Sätze (L-383) | L-383 liefert die Zeilen als Zahl und Konto getrennt |
| Die Herkunft auch in der Klappzeile der Abnahme | `FactResult` (Ausbau 0247) | App-Spec der Faktenansicht in der Klappzeile |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] Spiegel `fact-view.ts` byte-gleich mit App `72a468be2` (`git show 72a468be2:apps/web/src/modules/fact-records/domain/fact-view.ts | diff - src/ludwig/modules/fact-records/domain/fact-view.ts` leer)
- [ ] `explanation` steht unter dem Wert, vor „aus:“, im Sekundärtext, ohne Überschrift (`WithAssumptions`)
- [ ] Ohne `explanation` sieht die Zeile aus wie vor 0248 (`ByHand`)
- [ ] `documentNumber` steht in der Unterzeile vor dem Text, in Mono, mit unsichtbarem „Belegfeld 1“ davor; bei `null` nur der Text (`WithAssumptions`, `OpenPoint`)
- [ ] Kein Querscroll im Drawer `md` bei 1280 px, gemessen (`InUse`)
- [ ] Keine lokale Wortliste für Ergebnis-Schlüssel oder Herkunft
- [ ] Die übrigen Stories rendern unverändert, ohne Konsolenfehler

## Nachtrag nach der Abnahme (Spec-Autor, 2026-11-19)

- Zu H4: Gemessen bliebe „Konto“ mit einer fünften Spalte etwa 150 px, nicht
  unter 120 px. Die Regel aus CLAUDE.md (Logik) spricht von einer Spalte, die
  auf 90 % der Zeilen leer ist; hier ist die Spalte voll, aber auf allen
  Zeilen gleich. Die Entscheidung „Unterzeile statt Spalte“ bleibt.
- H2 und H7 betreffen die Wörter und `basedOn` der App; sie gehen mit der
  Rückmeldung an ll-ceo, nicht in das Set.

## Nachtrag: Beispieldaten an F699, F721, F726 (Spec-Autor, 2026-11-19)

Nur Beispieldaten, kein Typwechsel, keine Änderung an der Komponente
(ll-ceo nach dem Merge auf main):

- Herkünfte in der Form der App (F699): Nennform mit großem Anfang, ohne
  einleitendes „aus“, ohne Punkt. Der Grund des Steuerschlüssels bleibt ein
  Satz aus dem Buchungskern.
- „Konto“ ruht auf keinem Fakt mehr und trägt einen Erklärsatz (F721).
  Neue Ergebniszeile „Gegenkonto“ mit ihrer Herkunft (F726).
  „Steuerschlüssel“ ruht auf den gelesenen Fakten der Bewertung.
  „Was wurde gekauft“ und „Verwendung“ liest die Bewertung nicht. Beide
  stehen deshalb unter „Weitere Angaben“.
- `ByHand`: keine Herkunft und kein „aus:“ an Konto und Steuerschlüssel
  (F699).
- `BackReference` zeigt den Rundlauf jetzt an „Art der Leistung“ unter
  „Steuerschlüssel“ (drei Fakten). Unter „Konto“ steht kein „aus:“ mehr.
  `Provisional` hängt am offenen Punkt „Art der Leistung“, einem Fakt, auf
  dem das Ergebnis ruht.
- Im Browser angesehen (Storybook, 1280 px): Rundlauf markiert drei Fakten,
  Fokus auf dem ersten, Live-Region und Esc wie bisher; kein Querscroll,
  keine Fehleranzeige.

## Abnahme

Fremde Abnahme (Agent), 2026-11-19, gemessen. Geprüft im Arbeitsbaum
`designsystem-bv3` (Branch `booking-v3`, `e6efba1` plus die uncommitteten
Dateien des Baus), Storybook auf Port 6118 (liefert diesen Arbeitsbaum:
`importPath` `./src/ui/v3/entities/fact-record/FactRecordView.stories.tsx`,
die neuen Texte stehen im DOM), Playwright bei 1280 × 900, jede Story in
einem eigenen iframe. Story-IDs ohne Präfix
`v3-entitäten-faktensatz-factrecordview--`. Screenshots unter
`.playwright-mcp/abn0248-*.png` im Hauptrepo (nicht eingecheckt).

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` und `pnpm check:type` grün | `pnpm -s typecheck` exit 0 · `pnpm -s build` exit 0 („Storybook build completed successfully“, Ausgabe `storybook-static/`, ignoriert) · `pnpm -s check:type` exit 0 („0 older findings left“) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Geändert nur `src/ui/v3/entities/fact-record/FactRecordView.tsx` und `FactRecordView.stories.tsx` daneben, Titel `v3/Entitäten/Faktensatz/FactRecordView` unverändert; dazu eine Regel in `src/styles/v3.css` und der Spiegel | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `pnpm -s check:language` exit 0 („0 German comment lines“), `pnpm -s check:when` exit 0, beide `--test` exit 0. Neue Kommentare englisch; „Belegfeld 1“ darin ist laut `GLOSSARY.md` (Z. 33) bewusste DATEV-Ausnahme. Einziger Export `FactRecordView`, `@when`/`@instead` unverändert | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Diff gelesen: kein Hex, kein px. Neue CSS-Regel `.v3frv__text .v2mono { font-size: inherit; color: inherit; }` (`v3.css:4588`), keine neue Klasse. Der Vorlesetext „Belegfeld 1 “ ist ein Literal wie die Spaltenköpfe, keine Map. Status weiter nur über `StatusBadge`/`resolveStatus` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Index: 10 Stories (`with-assumptions`, `all-certain`, `open-point`, `provisional`, `by-hand`, `no-fact-record`, `loading`, `load-error`, `back-reference`, `in-use`), keine neue (Obergrenze, Spec „Stories“). Schnittstelle gedeckt: `explanation` in `with-assumptions`, ohne in `by-hand`; `documentNumber` in `with-assumptions`, `null` in `open-point`. Lädt, Fehler, kein Faktensatz wie 0247. Hinweis H5 | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe `entities/`, `check:domain-paths` exit 0 · Text links, Beträge unverändert rechts · keine neue Farbe · Kontrast gemessen: Herkunft und Nummer rgb(113,113,113) auf Weiß 4,88:1, `check:contrast` exit 0 · keine neue Interaktion, kein neues Ziel · Schrift gemessen: Herkunft 11,5 px wie die „aus:“-Zeile daneben, Nummer 11,5 px wie ihre Unterzeile, Wert 13,5 px; `check:type` exit 0 · `check:icons` exit 0, kein Icon · kein Querlauf (s. u.) · `.v2vh` im Scroll-Container → H6 · Wörter aus der App. Hinweise H1–H3 | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle 10 Stories bei 1280 × 900 geladen: keine Fehleranzeige (`sb-show-errordisplay`), Konsole je Story nur der bekannte 404 `vite-inject-mocker-entry.js`. Screenshots `abn0248-in-use-1280.png`, `abn0248-by-hand.png` | ✓ |
| Spiegel `fact-view.ts` byte-gleich mit App `72a468be2` | `git -C ../app-booking-v3 show 72a468be2:apps/web/src/modules/fact-records/domain/fact-view.ts \| diff - src/ludwig/modules/fact-records/domain/fact-view.ts` leer, exit 0; SHA-1 beider `66316108f1d4…`. `pnpm -s check:mirror` exit 0 | ✓ |
| `explanation` steht unter dem Wert, vor „aus:“, im Sekundärtext, ohne Überschrift (`WithAssumptions`) | `with-assumptions`, Karte „Ergebnis“, Zeile Steuerschlüssel: Kinder in der Folge Text „506“ · `span.v2sub.v3frv__text` (Herkunft) · `span.v2sub.v3frv__from` („aus: Land des Lieferanten, Art der Leistung“), Oberkante Herkunft 445 < „aus:“ 481 px. Herkunft `display: block`, 11,5 px, rgb(113,113,113); Wert 13,5 px, rgb(45,45,45); kein Wort mit Doppelpunkt davor. Belegfeld 1 und Buchungstext: Wert · Herkunft (kein „aus:“, `basedOn` leer), Vergleichstext in „…“. Folge Steuerbehandlung · Konto · Steuerschlüssel · Belegfeld 1 · Buchungstext wie `RESULT_KEYS` der App | ✓ |
| Ohne `explanation` sieht die Zeile aus wie vor 0248 (`ByHand`) | `by-hand`: kein `.v3frv__text` in „Ergebnis“. Steuerschlüssel = Wert · „aus:“, 48,7 px hoch wie Steuerbehandlung und Konto (die auch in `with-assumptions` 48,7 px messen); Belegfeld 1 und Buchungstext nur der Wert, 30,9 px. Code: Herkunft nur bei `r.explanation` (`FactRecordView.tsx:331–333`) | ✓ |
| `documentNumber` steht in der Unterzeile vor dem Text, in Mono, mit unsichtbarem „Belegfeld 1“ davor; bei `null` nur der Text (`WithAssumptions`, `OpenPoint`) | `with-assumptions`, Buchungssatz, Soll-Zeile: Unterzeile = `v2vh` „Belegfeld 1 “ · `v2mono` „INV-2026-0412“ · „ · “ · „Cloud Workspace 11/2026–10/2027“; Haben-Zeile (Text `null`) nur Vorlesetext und Nummer, ohne Trenner. Nummer JetBrains Mono, 11,5 px, rgb(113,113,113), `tabular-nums`; Unterzeile Inter, 11,5 px, rgb(113,113,113) — nur die Familie wechselt. „Belegfeld 1“: 1 × 1 px, `position: absolute`, `clip-path: inset(50%)`; im `textContent` vor der Nummer, im sichtbaren Text nicht. `open-point`, Soll-Zeile (`null`): nur der Text, kein `v2vh`, kein Trenner; Unterzeile 17,8 px hoch wie die mit Nummer allein (kein Sprung durch die Mono-Schrift) | ✓ |
| Kein Querscroll im Drawer `md` bei 1280 px, gemessen (`InUse`) | `in-use` bei 1280 × 900: Drawer 640 px (x 640–1280), `.v2drawer__b` scrollWidth 640 = clientWidth 640, Dokument 1280 = 1280; kein Element mit abgeschnittenem Überlauf, keins ragt rechts hinaus. Spalte Konto 260 px, die Nummer bleibt ganz (ein Zeilenstück). Gegenprobe 1920: Drawer 880, scrollWidth = clientWidth 880. Hinweis H3 | ✓ |
| Keine lokale Wortliste für Ergebnis-Schlüssel oder Herkunft | `grep -rn "tax_key\|document_number\|posting_text" src/ui/v3/entities/fact-record/` trifft nur die Fixture (`FactRecordView.stories.tsx:38–40`); die Komponente zeigt `label` und `explanation` so, wie sie kommen | ✓ |
| Die übrigen Stories rendern unverändert, ohne Konsolenfehler | Alle 10 geladen (s. o.). `back-reference`: Klick „Verwendung“ → `aria-pressed=true`, 2 Zeilen `is-active`, Fokus auf `supply_type`, Live-Region „2 Fakten markiert“; Esc → 0 Zeilen, „Markierung aufgehoben“. `loading`, `load-error`, `no-fact-record` rendern; `no-fact-record` zeigt die Satzzeilen mit Nummer | ✓ |
| Entscheidung „keine Spalte, Unterzeile“ (Verhalten 2) begründet und so gebaut | Begründet mit Breite und DATEV-Ordnung. Code: Spalten unverändert `minmax(0, 1fr) 7rem 7rem 3rem`, Nummer führt die Unterzeile, der Kommentar nennt den Grund (`FactRecordView.tsx:97–111`). Gemessen Konto 260 px (Spec: etwa 250). Zahl und Zitat der Begründung ungenau → H4 | ✓ |
| Wächter | `check:icons`, `check:contrast` (4 ungeprüfte Altangaben, keine aus dem Diff), `check:domain-paths` exit 0. `check:classes` exit 1 mit vier Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein `v3frv`; ohne die Änderung derselbe Befund: `git stash` → exit 1, dieselben vier → `git stash pop`; `git status --porcelain` vorher = nachher, `git diff \| shasum` vorher = nachher (`0e991bd3…`). `--test` aller sieben Wächter exit 0 | ✓ |

Abgenommen von / am: fremder Agent, 2026-11-19 · Offene Punkte: keine
Mängel; sieben Hinweise (kein Mangel), H1, H2 und H7 sind Fragen an die App
bzw. den Owner.

**Mängel**

- keine

**Hinweise** (kein Mangel)

- **H1** Dieselbe Nummer steht in einem Feld in zwei Schriften: Belegfeld 1
  „INV-2026-0412“ in der Satzzeile in Mono, in „Ergebnis“ proportional;
  ebenso BU „506“ (Spalte Mono, Ergebnis proportional). Das folgt aus der
  Spec (das Set kennt die Ergebnis-Schlüssel nicht). Abhilfe bräuchte ein
  Feld der App, das die Art des Werts trägt — Systementscheid, Owner.
- **H2** „aus der Rechnungsnummer des Belegs“ (Wort der App zu
  `invoice_number`) steht in derselben Stufe und Farbe wie die Zeile
  „aus: …“ der Nachbarzeilen; „aus“ hat damit in einer Karte zwei
  Bedeutungen (Herkunft gegenüber Fakten). Dazu wechseln die Herkünfte
  zwischen ganzem Satz (Steuerschlüssel, groß und mit Punkt) und Halbsatz
  (klein, ohne Punkt). Wörter aus `fact-labels.ts` → Befund für die App.
- **H3** Im Drawer `md` bei 1280 px bricht die Unterzeile der Soll-Zeile
  um und trennt den Zeitraum am Halbgeviertstrich („11/2026–“ | „10/2027“);
  die Zeile wächst von 56,6 auf 74,4 px, die Haben-Zeile trägt jetzt eine
  Unterzeile (37,2 px). Eine lange Nummer (DATEV bis 36 Zeichen) könnte an
  ihren Bindestrichen brechen; keine Story zeigt das.
- **H4** Begründung in Verhalten 2: Eine fünfte Spalte für „INV-2026-0412“
  brauchte gemessen 98 px (Mono, `--fs-ui-sm`) plus Abstand, ließe Konto
  also rund 150 px, nicht „unter 120 px“; bei 36 Zeichen (270 px) passt
  keine Spalte — die Entscheidung trägt, die Zahl nicht. Das Zitat „was die
  Spalte nicht unterscheidet“ steht so nicht in `CLAUDE.md`/V8 (dort: „auf
  90 % der Zeilen leer“). Nachzuziehen per datiertem Nachtrag.
- **H5** Der Zweig „weder Nummer noch Text → keine Unterzeile“
  (`FactRecordView.tsx:100`) zeigt keine Story mehr; vor 0248 zeigte ihn die
  Haben-Zeile. Nur im Code geprüft. Ohne neue Story machbar, z. B. die
  Haben-Zeile in `Provisional` ohne Nummer.
- **H6** §9 „Scroll-Container ist Bezugsrahmen“: Die neuen `.v2vh` (wie
  schon die Live-Region aus 0247) haben `.v2drawer` (fixed) als Bezug,
  nicht `.v2drawer__b` (kein `position: relative`). Gemessen in `in-use`:
  Körper ans Ende gescrollt, die Vorlesetexte bleiben bei 227/297 px, ihre
  Zeilen stehen bei −398/−328 px; die Seite wächst nicht (1280 × 900),
  weil der Drawer fixed ist. Altbestand des Primitivs; eine Zeile
  `.v2drawer__b { position: relative; }` als eigener Auftrag.
- **H7** `by-hand`: „Steuerschlüssel 506 · aus: Land des Lieferanten, Art
  der Leistung“ an einem von Hand gebuchten Satz liest sich, als käme der
  Schlüssel aus den Fakten. Die App setzt `basedOn` immer auf die gelesenen
  Fakten (F694 T694.3), wie schon bei „Konto“ (0247) → Frage an die App.
