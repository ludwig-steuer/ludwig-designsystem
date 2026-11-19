# 0250 · Buchungssatz: die Kopfzeile in einer Zeile (`.bse__head` doppelt belegt)

| | |
|---|---|
| Status | fertig — fremd abgenommen 2026-11-20 (gemessen) |
| Stufe | `entities/journal-entry/` (`JournalEntryEditor`, `JournalEntryGrid`) und `src/styles/v3.css` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?“ → nein: Buchungssatz, Belegfeld, Rest |
| Quelle | Befund aus 0249 (Verhalten, „Bestand“; Abnahme H2), Auftrag ll-ceo 2026-11-20 |
| Ersetzt | nichts; behebt einen Darstellungsfehler seit der Erstbestückung (`5ec5da6`) |
| Blockiert | nichts |
| Spec von / am | Designer-Sitzung, 2026-11-20 |

## Ziel

Über jedem Buchungssatz steht eine Kopfzeile: Beleg und Betrag links, der
Status, rechts der Rest und der Wechsel „Einfach/Voll“. Entworfen ist sie als
**eine** Zeile. Gezeigt wird sie heute in drei Zeilen untereinander, im
Editor wie im Lesegitter. Das kostet zwei Zeilen Höhe in jedem Drawer und
trennt den Rest, die wichtigste Zahl des Editors, vom Beleg, zu dem er gehört.

## Einordnung

- **Ursache:** Die Klasse `.bse__head` trägt zwei Bedeutungen. Sie ist die
  Kopfzeile des Satzes (`v3.css` Z. 1941: Flex-Zeile, Abstand, Linie unten)
  und der Spaltenkopf der Tabelle (Z. 1974: `.bse__head, .bse__cells` als
  Grid mit `--bse-cols`; Z. 1981: Schrift `--fs-ui-sm`, 600, gedämpft). Die
  späteren Regeln gewinnen. Außerhalb von `.bse__tbl` gibt es kein
  `--bse-cols`, das Grid wird einspaltig, und jedes Kind der Kopfzeile
  bekommt eine eigene Zeile.
- **Regel:** Ein Name, eine Bedeutung (CLAUDE.md §3). Die Kopfzeile bekommt
  einen eigenen Namen, `.bse__head` bleibt der Spaltenkopf (wie
  `.v2tbl__head`).
- **Zuschnitt:** Keine Prop, kein neues Verhalten.
  - `.bse__head` (Z. 1941) wird `.bse__top`.
  - `.bse__head-end` wird `.bse__top-end`.
  - Editor (`Head`) und Lesegitter (`JournalEntryGrid`) nutzen beide
    `.bse__top` und `.bse__top-end`.
  - Der Editor verliert dabei seinen Inline-Stil für das rechte Ende
    (`marginLeft`, `gap: 12` in px). Die Klasse leistet dasselbe:
    `--space-3` = 12 px.
- **Name geprüft:** `bse__top` und `bse__top-end` kommen in `src/` und in
  der App (`apps/web/src`) nicht vor. Die App nutzt keine `bse__`-Klasse
  direkt.

## Schnittstelle

Keine Änderung. Was sich ändert, ist die Darstellung:

| Was | vorher | nachher |
|---|---|---|
| Kopfzeile Editor und Lesegitter | einspaltiges Grid, 3 Zeilen (2 ohne Abzeichen) | eine Flex-Zeile: Beleg · Status · rechts Rest und „Einfach/Voll“ |
| Schrift der Kopfzeile | `--fs-ui-sm`, 600, gedämpft (aus der Spaltenkopf-Regel geerbt) | `--fs-ui` aus `.bse`; Beleg 600 in Textfarbe (`.bse__doc`), Rest wie bisher (`.bse__rest`) |
| Spaltenkopf der Tabelle | unverändert | unverändert |

## Verhalten

Keine neue Interaktion. Die Kopfzeile bricht bei Platzmangel nicht um,
sondern das rechte Ende bleibt rechts (`margin-left: auto`). Bei 700 px im
Drawer muss sie trotzdem passen, ohne Querscroll.

## Stories

Keine neue Story; die vorhandenen beweisen es:

| Story | Beweist |
|---|---|
| `JournalEntryEditor` · `S1_EditWithWarning` | Kopfzeile mit Abzeichen in einer Zeile, rechts „Voll ▸ · Alt+V“ |
| `JournalEntryEditor` · `S5_RemainderDoesNotBalance` | Rest rechts in derselben Zeile |
| `JournalEntryEditor` · `DraftByHand` | ohne Abzeichen: Beleg links, rechts das Ende |
| `JournalEntryGrid` (alle) | dieselbe Kopfzeile im Lesegitter, Spaltenkopf unverändert |
| `JournalEntryDrawer` (eine) | im Einsatz, Breite des Drawers |

## Ausbau

Keiner. Die Maße der Kopfzeile in px (`gap: 10px`, `padding-bottom: 10px`)
bleiben, wie sie sind. Sie auf Tokens zu ziehen ist eine eigene Frage für
das ganze `bse`-Kapitel.

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

- [ ] `.bse__head` kommt nur noch als Spaltenkopf vor (in `.bse__tbl`); die Kopfzeile heißt `.bse__top`, ihr rechtes Ende `.bse__top-end`, in Editor und Lesegitter (`grep`)
- [ ] Kopfzeile in **einer** Zeile: alle Kinder mit derselben senkrechten Mitte (±2 px), das rechte Ende bündig am rechten Rand der Kopfzeile, gemessen bei 700, 1100, 1400 und 1920 px (`S1_EditWithWarning`, `DraftByHand`, eine `JournalEntryGrid`-Story)
- [ ] Spaltenkopf unverändert: Grid mit `--bse-cols`, Kopfzellen fluchten mit den Zellen der ersten Zeile (linke Kante ±1 px), Schrift `--fs-ui-sm` 600 (eine Editor- und eine Grid-Story)
- [ ] Kein Inline-Stil mehr am rechten Ende des Editor-Kopfs; Abstand rechts gemessen gleich (12 px)
- [ ] Kein Querscroll in `JournalEntryDrawer` bei 1280 px
- [ ] `check:classes` meldet keinen neuen Fund (kein Name ohne Regel, keine Regel ohne Namen)

## Abnahme

Gemessen im laufenden Storybook (Port 6118), Playwright, je Story ein per JS
erzeugtes iframe in Messbreite, `getBoundingClientRect` auf die Kinder von
`.bse__top`. Stories kurz: `ed--s1` = `v3-entitäten-buchungssatz-journalentryeditor--s-1-edit-with-warning`,
`ed--s5` = `…journalentryeditor--s-5-remainder-does-not-balance`,
`ed--draft` = `…journalentryeditor--draft-by-hand`, `gr--*` =
`…journalentrygrid--*`, `dr--*` = `…journalentrydrawer--*`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `pnpm typecheck` Exit 0 · `pnpm build --output-dir <Scratchpad>` Exit 0 („Storybook build completed successfully“, danach gelöscht) · `pnpm check:type` Exit 0 („0 older findings“) | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | keine neue Datei; Änderung in `JournalEntryEditor.tsx`, `JournalEntryGrid.tsx` unter `entities/journal-entry/`, Stories daneben, Titel `v3/Entitäten/Buchungssatz/…` (IDs aus `index.json`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Diff: nur `className` und zwei englische CSS-Kommentare; `pnpm check:language` Exit 0 („0 German comment lines“) · `pnpm check:when` Exit 0 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Diff entfernt den Inline-Stil `gap: 12` (px in TSX); kein Hex, keine Map neu; Abzeichen weiter `StatusBadge axis="journal_entry"` · `pnpm check:icons` Exit 0 · `pnpm check:contrast` Exit 0 · `pnpm check:domain-paths` Exit 0 | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `ed--s1`, `ed--s5`, `ed--draft`, `gr--*` (10), `dr--*` (6) in `index.json`; „keine neue Story“ in der Spec begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Schrift aus der Skala gemessen: Kopfzeile 13,5 px = `--fs-ui`, `.bse__doc` 600 in Textfarbe, Spaltenkopf 12,5 px = `--fs-ui-sm` 600; kein px in TSX neu; Fokusring am Schalter 2 px solid sichtbar; Text links, Rest rechts; Befunde außerhalb des Diffs → H3 | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Screenshot `ed--s1` und `gr--edges` bei 700 px: Kopfzeile eine Zeile; Konsole über alle gemessenen Stories 0 Fehler, 0 Warnungen (Fang der iframe-Konsole mit Probe geprüft) | ✓ |
| `.bse__head` nur noch Spaltenkopf (in `.bse__tbl`); Kopfzeile `.bse__top`, rechtes Ende `.bse__top-end`, in Editor und Lesegitter (`grep`) | `grep -rn "bse__head\|bse__top" src/`: `.bse__head` nur `JournalEntryEditor.tsx:329` und `JournalEntryGrid.tsx:160`, beide im `.bse__tbl`; `.bse__top`/`.bse__top-end` in `JournalEntryEditor.tsx:583/589` und `JournalEntryGrid.tsx:116/122`; `bse__head-end` kommt nicht mehr vor · App `apps/web/src`: kein `bse__`-Treffer | ✓ |
| Kopfzeile in **einer** Zeile: senkrechte Mitten ±2 px, rechtes Ende bündig, bei 700/1100/1400/1920 (`S1_EditWithWarning`, `DraftByHand`, eine Grid-Story) | `ed--s1`, `ed--s5`, `ed--draft`, `gr--simple`, `gr--full`, `gr--in-use` je bei 700/1100/1400/1920: Streuung der Mitten 0 px, `display: flex`, `nowrap`, Höhe 33,1 px (31,9 ohne Abzeichen); rechte Kante `.bse__top-end` − Innenkante `.bse__top` = 0 px; dazu 14 weitere Editor-/Grid-Stories bei 700: Streuung 0, bündig 0 | ✓ |
| Spaltenkopf unverändert: Grid mit `--bse-cols`, Kopfzellen fluchten mit der ersten Zeile (±1 px), Schrift `--fs-ui-sm` 600 | Editor (`ed--s1`, `ed--s5`, `ed--draft`) und Grid (`gr--simple`, `gr--full`, `gr--in-use`) bei vier Breiten: `display: grid`, Spurenzahl = `--bse-cols` (8 / 7 / 10), größte Abweichung linke Kante Kopfzelle zu Zelle Zeile 1 = 0 px (rechte Kante ebenfalls 0), 12,5 px 600; Regeln Z. 1977–1990 im Diff unberührt | ✓ |
| Kein Inline-Stil mehr am rechten Ende des Editor-Kopfs; Abstand rechts gemessen 12 px | `.bse__top-end` ohne `style`-Attribut (gemessen `null`); `column-gap` 12 px = `--space-3`; Abstand Rest → „Voll ▸ · Alt+V“ in `ed--s5` 12 px bei allen vier Breiten | ✓ |
| Kein Querscroll in `JournalEntryDrawer` bei 1280 px | `dr--open`, `dr--without-case`, `dr--in-use` (Drawer per Klick geöffnet) bei 1280: Drawer 1100 px, `.v2drawer__b` scrollWidth − clientWidth = 0, Dokument 0, kein überlaufender Scroll-Container; ebenso bei 1100/1400/1920. Bei 700 (Drawer 658 px): Kopfzeile ohne Überlauf (0 px), nur `.bse__tbl` scrollt 116 px wie seit 0044 gewollt | ✓ |
| `check:classes` meldet keinen neuen Fund | `pnpm check:classes` Exit 1 mit genau den vier Altfunden `v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`, kein `bse`; `--test` Exit 0; Gegenrichtung von Hand: `.bse__top`, `.bse__top-end` haben je Regel und Nutzer, `bse__head-end` ist aus CSS und TSX verschwunden | ✓ |

Vier Linsen: **Sprache** — kein sichtbarer Text geändert, Kommentare
englisch. **Bedienung** — keine neue Interaktion, Schalter behält Fokusring
und Alt+V. **Logik** — ein Name, eine Bedeutung: `.bse__head` ist wieder nur
der Spaltenkopf. **Darstellung** — Kopfzeile eine Zeile statt drei, Beleg in
`--fs-ui` 600 statt geerbter gedämpfter Spaltenkopf-Schrift, Spaltenkopf
unverändert.

Abgenommen von / am: fremder Agent, 2026-11-20 · Offene Punkte: keine.

- **H1** `.bse__top-end` steht in `v3.css` Z. 4350 im Kapitel „Reading grid (0113)“, 2400 Zeilen von `.bse__top` (Z. 1944); beim nächsten Griff ins `bse`-Kapitel neben `.bse__top` ziehen, der Kommentar sagt schon, dass sie beiden dient.
- **H2** Mit Story-Daten bleiben bei 700 px 106–149 px frei; ein langer Beleg (Probe „RE-2026-11-000471-NACHTRAG · 1.234.567,89 €“) bricht `.bse__doc` auf zwei Zeilen um (Kopfzeile 52,8 px), ohne Überlauf und mit dem Ende rechts — ob dort gekürzt statt umbrochen wird, ist eine Frage für das `bse`-Kapitel.
- **H3** Bestand außerhalb des Diffs, §9: der Schalter „Voll ▸ · Alt+V“ misst 81,6 × 20,9 px (unter 24 px hoch, ohne Nachbarziel in Reichweite); ✓ ◂ ▸ tragen in der Kopfzeile Bedeutung als Unicode-Zeichen; der negative Rest zeigt U+002D aus `formatAmount`, kein echtes Minus; Inline-px im Editor Z. 315 (`8`) — alles für die Aufgabe, die das `bse`-Kapitel auf Tokens zieht („Ausbau“).
