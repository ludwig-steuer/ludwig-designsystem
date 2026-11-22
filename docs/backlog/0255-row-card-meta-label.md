# 0255 · Zeilenkarte: Spaltenwort an den `meta`-Zellen (F783 M1)

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` (Table, Klasse), `patterns/` (DataTable, `ColumnDef.cardLabel`) |
| Klassen-Test | ja: „ein Wert ohne sein Wort ist auf der Karte nicht lesbar“ gilt in jeder App |
| Quelle | ll-dev96 2026-11-22 (F783 M1, Dashboard). Zeile 2 der Mandantenkarte zeigt „— 2026-0003 1“. Die Wörter „Belege im Eingang · Stapel in der Abnahme · Rückfragen“ stehen nur einmal oben in der Legende, und drei Zahlen nebeneinander ordnet niemand zu |
| Ersetzt | – (Ergänzung zu 0253) |
| Blockiert | F783 M1 Dashboard (Zeile 2 lesbar) |
| Spec von / am | designsystem, 2026-11-22 |

## Ziel

In der Zeilenkarte (0253, unter 640 px Tabellenbreite) trägt jede `meta`-Zelle ihr Spaltenwort vor dem Wert: „Belege 3 · Stapel — · Rückfragen 1“. In der Tabelle steht das Wort weiterhin einmal im Spaltenkopf, in der Karte einmal je Wert. Die Legende im Kopf lässt die `meta`-Wörter dann weg, damit nichts doppelt steht.

## Einordnung

- **Erweitern** (§3 Regel 2): Die Zeilenkarte gibt es seit 0253. Es fehlt nur das Wort an Zeile 2.
- **Woher das Wort kommt:**
  - `DataTable` kennt `ColumnDef.header` und setzt das Wort selbst, nur an `meta`-Spalten.
  - `Table` kennt keine Spalten. Dort schreibt der Aufrufer das Wort in die Zelle, mit der Klasse `v2tbl__cardlabel`, die nur in der Karte sichtbar ist.
  - Die Klasse ist dieselbe wie bei DataTable. So hat „nur in der Zeilenkarte da“ ein Wort.
- **Kurzwort statt Spaltenkopf** (`ColumnDef.cardLabel`):
  - Der Spaltenkopf ist für eine Spalte mit viel Platz geschrieben („Belege im Eingang“). Auf der Karte reicht „Belege“.
  - `false` heißt kein Wort, wenn der Wert es schon sagt (ein Status-Abzeichen, „12 Tage überfällig“).
  - Zwei Verwendungen heute: Dashboard (Kurzwort) und Buchungsliste (`Prüfung durch Ludwig` ist ein Abzeichen, kein Wort nötig).

## Schnittstelle

| Prop / Klasse | Typ | Pflicht | Bedeutung | Nachweis |
|---|---|---|---|---|
| `ColumnDef.cardLabel` | `string \| false` | nein | Wort vor dem Wert in der Zeilenkarte, nur bei `priority: "meta"`. Fehlt es, gilt `header`, wenn der ein String ist; sonst kein Wort. `false` heißt kein Wort | `DataTable/PhoneCards` |
| `.v2tbl__cardlabel` | Klasse | – | Text, der nur in der Zeilenkarte erscheint. In der Tabelle ist er `display: none` und damit auch für Vorlesehilfen weg, dort trägt der Spaltenkopf das Wort | `Table/PhoneCards` |
| `is-phone-only` | Klasse | – | Gegenstück zu `is-secondary` (ll-dev96 für F783 M2): Das Element ist nur unter 640 px da, mit seiner eigenen Darstellung. Ab 640 px ist es `display: none !important`. Es trägt den Ersatz für etwas, das auf dem Handy `is-secondary` ist: ⋯ mit „Details“ und „Technik“ im Stapelkopf, „Beleg öffnen“ statt des PDF-Rahmens, „Beleg ansehen“ über der Entscheidung. `.v2bar__more` bleibt die Hülle des ⋯ einer Leiste | `AppShell/Phone` (Seitenaktionen) |

Weitere Regeln:

- **Kopfzeile in der Karte** (ll-ceo 2026-11-22: über den Karten des Dashboards keine Kopfzeile): Sobald die Tabelle mindestens ein `.v2tbl__cardlabel` hat, ist die Kopfzeile keine Legende mehr.
  - Sie zeigt nur noch Zellen mit etwas Bedienbarem: Sortierlink, „alle auswählen“, (i).
  - Bleibt nichts Bedienbares, entfällt sie ganz.
  - Grund für die Grenze: Sortierung und Gesamtauswahl hängen an der Kopfzeile. Fiele sie ganz weg, gingen beide auf dem Handy verloren („Nichts fällt weg“).
  - Ohne Kartenwörter, zum Beispiel bei einer alten `Table`, bleibt die Kopfzeile die Legende wie in 0253.
- `JournalEntryReviewList` setzt `cardLabel` selbst:
  - „Soll“, „Haben“, „BU“ und „Prüfgrund“ aus dem Kopf. Das Abzeichen „Steuerschlüssel“ allein sagt nicht, dass es ein Prüfgrund ist.
  - Kein Wort an den Kontonamen: Ihr Kopf ist kein String, er ist unsichtbar, und der Name folgt der Nummer.
  - `false` an „Prüfung durch Ludwig“, weil Punkt und Wort sprechen.
  - `false` an „Konten“, weil das Satzbild S/H selbst trägt.
  - Die Aktionen der DataTable sind keine `ColumnDef` und bekommen kein Wort.


Kann bewusst nicht: Ein Wort für `primary`-Zellen gibt es nicht. Zeile 1 ist die Hauptsache und braucht keins (Name, Datum, Betrag).

## Verhalten

- **Leere Hülle (Hinweis H2 aus 0254):** Hat die Zusammenfassung des EntityHeader (`.v2ehead__summary`) als einziges Kind ein `is-secondary`, verschwindet sie unter 640 px mit, damit ihr Abstand nicht stehen bleibt. Das gilt nur für diesen Slot, nicht allgemein für jede Hülle.
- **Grenze:** Ist die einzige Zahl einer Zeile eine `meta`-Zelle (Dashboard: Zähler), hält die erste Textzelle trotzdem 8em für einen Betrag frei. Das CSS kann die Priorität der Zahlzelle nicht sehen. Zeile 1 wird dadurch früher umgebrochen, aber nichts überlappt.

- Am Desktop ändert sich kein Pixel: `.v2tbl__cardlabel` ist außerhalb der Karte `display: none`. Das ist die einzige neue Regel außerhalb der Medienabfrage, `display: none` eines neuen Elements wie in 0253.
- In der Karte steht das Wort in `--color-text-subtle` vor dem Wert, mit `--space-1` Abstand.
- Ein `.v2num` in einer `meta`-Zelle läuft in der Karte inline mit dem Wort, kein eigener Block.

## Stories

Keine neue Story. `DataTable/PhoneCards` und `Table/PhoneCards` (0253) zeigen Wörter vor den Werten in Zeile 2. `PhoneCards` bekommt dafür eine Zählerspalte mit `cardLabel` als Kurzwort. `JournalEntryReviewList` `Grouped` zeigt die Wörter der Buchungsliste.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build`, Wächter grün (`check:classes` ohne neue Befunde)
- [ ] `@when`/`@instead` unverändert gültig; Code englisch; kein Hex, kein px in TSX
- [ ] Im Browser angesehen

Variabel (390 × 844, 820 × 1180, 1440 × 900):

1. **Desktop unverändert:** `png-diff` über die 37 Stories von 0253 (`.playwright-mcp/f783-base/`) endet mit Exit 0.
2. **DataTable/PhoneCards bei 390:**
   - Jede `meta`-Zelle mit Wort zeigt es vor dem Wert, mit dem Kurzwort aus `cardLabel`.
   - Eine Spalte mit `cardLabel: false` zeigt keins.
   - Die Kopfzeile zeigt nur „alle auswählen“ und die Sortierlinks; Zellen ohne Bedienbares sind `display: none`.
3. **Table/PhoneCards bei 390:**
   - Die `.v2tbl__cardlabel` des Aufrufers sind sichtbar.
   - Die Kopfzeile ist ganz weg, weil sie nichts Bedienbares hat.
   - Bei 820 in der Tabelle sind die Wörter `display: none`, und die Kopfzeile steht wie zuvor.
4. **Buchungsliste (`Grouped`, 390):** Zeile 2 liest sich „Soll 3100 … Haben 1800 … BU 401 … Prüfgrund ‹Abzeichen›“. Vor Kontonamen und vor „Prüfung durch Ludwig“ steht kein Wort.
5. **Kein seitlicher Scroll** bei 390 in den drei Stories.
7. **`is-phone-only` (`AppShell/Phone`):** Bei 390 ist „Exportieren“ (`is-secondary`) weg und das ⋯ (`is-phone-only`) sichtbar. Bei 820 und 1440 ist es umgekehrt. Am Desktop ist das ⋯ `display: none`.
6. **Leere Hülle:** `seiten-mandantenjahr--normal` bei 390: `.v2ehead__summary` ist `display: none`; bei 820 sichtbar.

## Nachtrag 2026-11-22 (nach der ersten Abnahme, vom Spec-Autor)

Die erste Abnahme fand Mangel 4 (M1, M2). Behoben ist:

- **M1:** Steht der Wert als Stapel (Kontonummer über „+2 weitere“), lag das Wort darüber. Die Hülle der Zelle mit Wort ist in der Karte jetzt `inline-flex` (Grundlinie), dadurch steht das Wort davor.
- **M2:** Gibt `cell()` nichts zurück (`null`, `undefined`, `false`, `""`), setzt DataTable kein Wort. Rendert der Wert selbst nichts, blendet `.v2tbl__cardlabel:only-child` das Wort aus. Damit das bei reinem Text nicht greift, bekommt Text als Wert ein eigenes Element.
- **M3 (Nachprüfung):** `:only-child` traf auch die Wörter, die ein Aufrufer von `Table` selbst schreibt, wenn danach bloßer Text folgt. Die Regel gilt jetzt nur für die Wörter, die DataTable selbst setzt (`v2tbl__cardlabel--col`).
- **H2:** Das Wort endet mit einem Leerzeichen. Vorlesehilfen lesen dann „Nummer 2026-0417“.
- **H4:** Die Zeile `is-phone-only` steht jetzt in der Schnittstellentabelle.
- **H1** (Sortieren und „Alle auswählen“ als Kartenkopf statt der Restkopfzeile) bleibt ein Vorschlag für eine Folge-Spec. **H3** (`false` an „Prüfung durch Ludwig“ ohne eigene Story) bleibt ein Hinweis, `false` beweist `DataTable/PhoneCards` an „Bearbeitung“.
- **Zu Kriterium 1:** Der Verlauf der dunklen Seitenleiste flackert in der Aufnahme gelegentlich, höchstens 6 Farbstufen im Bereich der Leiste. Gesehen bei `navlist--in-shell` (0254) und `appshell--in-use` (3,8 %). Drei neue Aufnahmen ergaben je 0,000 %. Eine solche Abweichung zählt erst als Befund, wenn sie in einer neuen Aufnahme bleibt.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: Wächter und Build | `pnpm typecheck` Exit 0 · `check:type` Exit 0 („ok“) · `check:icons` Exit 0 · `check:when` Exit 0 · `check:language` Exit 0 · `check:classes` Exit 1 mit genau den vier Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein neuer; `v2tbl__cardlabel` und `is-phone-only` haben ihre Regel · `pnpm build` Exit 0 („Storybook build completed successfully“), nach allen Messungen | ✓ |
| Fest: `@when`/`@instead`, Code englisch, kein Hex, kein px in TSX | `check:when` grün; Diff in `DataTable.tsx`, `JournalEntryReviewList.tsx` und den drei Stories: Bezeichner und Kommentare englisch, Deutsch nur in sichtbaren Strings und Story-Texten; kein Hex, kein px. Keine neue Story (wie gefordert) | ✓ |
| Fest: im Browser angesehen | Playwright-MCP gegen Storybook 6118 bei 390×844, 820×1180, 1440×900; Bilder in `.playwright-mcp/f783-0255-review/` (Desktop), `-review-cy/`, `-review-narrow/`. Konsole ohne Fehler und Warnungen | ✓ |
| Schnittstelle `ColumnDef.cardLabel` | Typ `string \| false`, optional (`DataTable.tsx` Z. 171). `cardLabelOf`: `false` → kein Wort, sonst `cardLabel ?? header` nur bei String-Kopf. `bodyRow` setzt es nur bei `col.priority === "meta"`. Aktionen sind keine `ColumnDef` und bekommen keins (gemessen: „Zurückstellen“, „Öffnen“ ohne Wort) | ✓ |
| Story-Deckung | `cardLabel` als Kurzwort („Klärungen“), als `false` (Bearbeitung) und als Vorgabe aus `header` („Nummer“) in `DataTable/PhoneCards`; Nicht-String-Kopf in `Grouped` (Kontonamen); `.v2tbl__cardlabel` des Aufrufers in `Table/PhoneCards`; `is-phone-only` in `AppShell/Phone`; leere Hülle in `seiten-mandantenjahr--normal`. Lücke: `false` an „Prüfung durch Ludwig“ steht in keiner Story (H3) | ✓ |
| 1 Desktop unverändert | 37 Stories neu nach Vorschrift (1440×900, `fullPage`, `animations: "disabled"`, Maus 0,0, 600 ms nach `networkidle`, Aufwärm-Story vorab) in `.playwright-mcp/f783-0255-review/`: `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-0255-review 0.5` → Exit 0, 37 × ✓, höchstens 0,006 % (`steprail--with-tones-and-counters`). Mandantenjahr in `f783-0255-review-cy/`: `png-diff.mjs .playwright-mcp/f783-0254-base .playwright-mcp/f783-0255-review-cy 0.5` → Exit 0, `normal` und `dense` je 0,000 %. Bei 1440 in den drei Karten-Stories: alle `.v2tbl__cardlabel` `display: none`, Breite 0, nicht im Barrierefreiheitsbaum (Zeilenname „… 1.800,00 € 2026-0417 Zur Prüfung 0 …“); Kopfzeile `grid` mit allen Zellen | ✓ |
| 2 `DataTable/PhoneCards` bei 390 | `v3-patterns-arbeitsfläche-datatable--phone-cards`: In allen 12 Karten „Nummer 2026-04xx“ (aus `header`) und „Klärungen 0/1“ (Kurzwort aus `cardLabel`, Kopf heißt „Offene Klärungen“); Wort `inline`, `rgb(113, 113, 113)` = `--color-text-subtle`, `margin-right` 4 px = `--space-1`, Kontrast 4,51:1 auf `rgb(244, 246, 248)` gemessen. Die Zählerzelle (`.v2num`) läuft in einer Zeile mit dem Wort (Höhe 19 px). „Zur Prüfung“ (`cardLabel: false`) ohne Wort. Kopfzeile `flex`, sichtbar nur: Kästchen „Alle auf dieser Seite auswählen“ (`input`), „Betrag“ (`a`), „Bearbeitung“ (`a` + (i) `button` 24×24). „Sachverhalt“, „Nummer“, „Offene Klärungen“, „Aktionen“ ohne Bedienbares: `display: none`. Bild `datatable--phone-cards-390.png` | ✓ |
| 3 `Table/PhoneCards` | `v3-primitives-tabelle-table--phone-cards` bei 390: drei „Fällig“ `inline` vor dem Datum; `tr.v2tbl__head` `display: none`, Höhe 0. Bei 820: Wörter `display: none`, Kopfzeile `grid`, 38 px, fünf Zellen; Bild pixelgleich mit dem Abnahmebild von 0253 (`f783-review/table-phone-cards-820.png` gegen `f783-0255-review-narrow/…-820.png`: 0,000 %) | ✓ |
| 4 Buchungsliste (`Grouped`, 390) | `v3-entitäten-buchungssatz-journalentryreviewlist--grouped`: Wörter „Soll“, „Haben“, „BU“, „Prüfgrund“ sind da, keins vor den Kontonamen (Kopf kein String); „Prüfung durch Ludwig“ ist in `Grouped` keine Spalte (H3). Aber Zeile 2 liest sich nicht „Soll 3100 … Haben 1800 …“. **M1:** Das Wort steht **über** dem Wert, nicht davor. `.v3prop__stack` ist `display: grid`, das Wort „Soll“ liegt bei y 240, „3100“ bei y 257 (Karte 1, ebenso „Haben“/„1800“). Die Wortzeile liest sich „Soll Fremdleistungen Haben Bank BU 401“, die Nummern stehen darunter. **M2:** Wort ohne Wert. In 21 der 40 Karten steht ein Wort vor nichts, weil die Zelle `null` liefert: 13 × „BU“ (z. B. 02.09. Stadtwerke: „… Haben Bank BU“), 9 × „Prüfgrund“, 1 × „Haben“ (12.09. Leasing, „kein Satz“). Steht „Prüfgrund“ leer vor „Freigeben“, liest es sich wie „Prüfgrund: Freigeben“. Dieselben Fälle gibt es in `Flat` („Soll Haben BU Prüfgrund entschieden“, Nummern darunter) und in `Compact` (2 von 4 Karten „Prüfgrund“ leer). Bilder `grouped-390-top.png`, `grouped-390-empty-bu.png`, `grouped-390-kein-satz.png`, `flat-390-empty-bu.png` | ✗ |
| 5 Kein seitlicher Scroll bei 390 | `scrollWidth` = `clientWidth` = 390 in `Table/PhoneCards`, `DataTable/PhoneCards`, `Grouped` (auch `Flat`, `Compact`); Scrollbox der Tabelle 356 = 356 | ✓ |
| 7 `is-phone-only` (`AppShell/Phone`) | `v3-primitives-rahmen-appshell--phone` 390: „Exportieren“ `display: none`, 0 × 0; `.is-phone-only` sichtbar, 82 × 30 („Mehr“). Geöffnet liegt das Menü bei x 8 im Fenster, „Exportieren“ 198 × 33 ist treffbar. 820 und 1440: „Exportieren“ `flex`, 101 × 30; `.is-phone-only` `display: none`, 0 × 0. `scrollWidth` jeweils gleich der Fensterbreite. Bilder `appshell--phone-390.png`, `-820.png`, `-1440.png`, `appshell-phone-390-menu-open.png` | ✓ |
| 6 Leere Hülle | `seiten-mandantenjahr--normal` 390: `.v2ehead__summary` (einziges Kind `cy-counts is-secondary`) `display: none`, 0 × 0. Unter `.v2ehead__top` (Ende y 207) bis zum Kopfende (y 228) liegen 21 px, das ist die Polsterung von 20 px; vorher waren es 37 px (0254 H2). 820: `block`, 746 × 19. 1440: `block`, 1366 × 19 | ✓ |

**H1 Kopfzeile behalten: im Kern stichhaltig, als Endzustand schwach.** Stichhaltig ist die Begründung, weil „Nichts fällt weg“ (L1, Owner) über einem Wunsch steht. Sortierung und Gesamtauswahl haben auf dem Handy heute keinen anderen Ort. Dazu bekommt ll-ceo genau dort, wo er gefragt hat, was er wollte: Ein Dashboard ohne Sortierung und Auswahl hat keine Kopfzeile mehr (gemessen an `Table/PhoneCards`). Als Bedienfläche ist der Rest aber dünn. Das Kästchen steht ohne sichtbares Wort, der Name „Alle auf dieser Seite auswählen“ ist nur für Vorlesehilfen da. „Betrag“ und „Bearbeitung“ sehen ohne Sortierzeichen aus wie Beschriftungen, nicht wie Schalter. In `DataTable/PhoneCards` ist zudem nach „Eröffnet“ absteigend sortiert, und diese Spalte ist `hidden`. Auf dem Handy sieht man also die geltende Ordnung nicht und kann sie nicht umkehren. Beim Vier-Wochen-Test fällt die Sortierung damit durch. Die Trefferflächen (Kästchen 14 × 14, Links 40 × 19 und 74 × 19) halten 24 px nur über den Abstand. Vorschlag für eine Folge-Spec, nicht für diese: auf dem Handy im Kartenkopf ein „Sortieren nach …“ mit Richtung und „Alle auswählen“ mit Wort. Dann kann die Kopfzeile ganz weg, wie ll-ceo es wollte, ohne dass etwas wegfällt.

**H2 Kein Leerzeichen zwischen Wort und Wert.** Der Abstand ist nur `margin-right`. Im Barrierefreiheitsbaum heißen die Zellen deshalb „Nummer2026-0417“, „Klärungen0“, „Fällig21.08.2026“, „BU401“ und „Prüfgrundentschieden“. So lesen es Vorlesehilfen, und so landet es beim Kopieren. Abhilfe: Das Wort trägt ein echtes Leerzeichen in seinem eigenen Span, das in der Tabelle mit ihm verschwindet. In `Table` gilt das auch für den Aufrufer, die Story sollte es vormachen.

**H3 `false` an „Prüfung durch Ludwig“ ohne Story.** `verdict` ist optional (`include`), und keine Story der Buchungsliste schaltet die Spalte ein. Der zweite Satz von Kriterium 4 („vor ‚Prüfung durch Ludwig‘ kein Wort“) ist in `Grouped` deshalb leer erfüllt. Belegt ist er nur im Code (`SPEAKS_FOR_ITSELF`). `false` an „Konten“ zeigt `Compact` (ohne Wort, gemessen).

**H4 Form der Spec (an den Autor).** Die Zeile `| is-phone-only | …` steht hinter der Liste „Weitere Regeln“ und damit außerhalb der Schnittstellentabelle. Markdown zeigt sie als lose Zeile. Die Kriterien stehen in der Folge 1–5, 7, 6. Inhaltlich ändert beides nichts.

**Zu M1 und M2, als Richtung, nicht als Vorgabe:** M2 lässt sich in `bodyRow` lösen: kein Wort, wenn `cell()` `null`, `false` oder `""` liefert. Oder ein „—“ als Wert, wie im eigenen Beispiel der Spec („Stapel —“). M1 braucht für eine Zelle mit Wort in der Karte eine Zeile mit Grundlinie (Wort, dann Wert), so wie die Regel für `.v2num`. Danach `Grouped`, `Flat` und `Compact` bei 390 erneut ansehen.

Abgenommen von / am: fremder Abnehmer (Agent), 2026-11-22 · Offene Punkte: Kriterium 4 (M1 Wort über statt vor dem Wert bei Soll/Haben; M2 Wort ohne Wert in 21 von 40 Karten). H1–H4 sind Hinweise.

### Nachprüfung 2026-11-22

Geprüft gegen den Nachtrag vom 2026-11-22: `DataTable.tsx` (kein Wort bei leerem `cell()`, Text als Element, Leerzeichen nach dem Wort) und `v3.css` (`inline-flex` an der Hülle mit Wort, `.v2tbl__cardlabel:only-child { display: none }`). Bilder in `.playwright-mcp/f783-0255-recheck/`, `-recheck-cy/`, `-recheck-narrow/`.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: Wächter und Build | `pnpm typecheck`, `check:type`, `check:icons`, `check:when`, `check:language` je Exit 0 · `check:classes` Exit 1 mit genau den vier Altfunden, kein neuer · `pnpm build` Exit 0 („Storybook build completed successfully“) · Konsole ohne Fehler und Warnungen | ✓ |
| 1 Desktop unverändert | 37 neu aufgenommen, nach Vorschrift mit Aufwärmen und Maus auf 0,0: `png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-0255-recheck 0.5` → Exit 0, 34 × 0,000 %, höchstens 0,005 % (`clarificationcard--with-recommended-option`). Diesmal kein Flackern der Seitenleiste, keine Wiederholung nötig. Mandantenjahr: `png-diff.mjs .playwright-mcp/f783-0254-base .playwright-mcp/f783-0255-recheck-cy 0.5` → Exit 0, je 0,000 % | ✓ |
| 2 `DataTable/PhoneCards` bei 390 | 24 von 24 Wörtern sichtbar: „Nummer 2026-0417“ und „Klärungen 0“ in einer Zeile mit dem Wert. „Zur Prüfung“ ohne Wort. Kopfzeile `flex`, sichtbar nur Kästchen, „Betrag“ und „Bearbeitung“ (mit (i)). Bei 820 alle 24 `display: none`, Kopfzeile `grid` mit acht Zellen | ✓ |
| 3 `Table/PhoneCards` | **M3, neu durch den Nachtrag:** Bei 390 sind 0 von 3 „Fällig“ sichtbar. Der Aufrufer schreibt den Wert als bloßen Text (`<span><span class="v2tbl__cardlabel">Fällig</span>21.08.2026</span>`), so wie es die Story der Spec vormacht. `:only-child` zählt nur Elemente, also gilt das Wort als einziges Kind und fällt weg. Die Kopfzeile bleibt trotzdem `display: none`, weil `.v2tbl:has(.v2tbl__cardlabel)` auch das unsichtbare Wort findet. Die Karte zeigt „12 Tage überfällig 21.08.2026“ ohne Wort und ohne Kopf, schlechter als in 0253. Der Name im Barrierefreiheitsbaum endet auf „… 12 Tage überfällig 21.08.2026“. Bei 820: Wörter `display: none`, Kopfzeile `grid`, fünf Zellen, Bild pixelgleich mit `f783-review/table-phone-cards-820.png` (0,000 %). Bild `v3-primitives-tabelle-table--phone-cards-390.png` | ✗ |
| 4 Buchungsliste (`Grouped`, 390) | 137 Wörter, alle sichtbar; die 23 Wörter ohne Wert werden nicht mehr gesetzt. Kein Wort steht vor nichts: 0 Fälle in `Grouped`, `Flat` und `Compact`. Wort vor dem Wert auch beim Stapel: Die Hülle ist `inline-flex`, „Soll“ y 239 / „3100“ y 239, „Haben“ y 239 / „1800“ y 239. In allen 137 (`Grouped`) und 40 (`Flat`) Paaren liegt die erste Zeile des Werts auf der Höhe des Worts, und keine Hülle ragt aus der Karte. Karte 1 liest sich „Soll 3100 Fremdleistungen +2 weitere · Haben 1800 Bank +1 weitere · BU 401 · Prüfgrund entschieden“, Karte 2 „… Prüfgrund ‹Steuerschlüssel› +2 (i)“. Vor den Kontonamen steht kein Wort. „kein Satz“ (12.09.) zeigt kein loses „Soll“, „Haben“ oder „Prüfgrund“ mehr. Bilder `grouped-390-top.png`, `flat-390-top.png`, `grouped-390-kein-satz.png` | ✓ |
| 5 Kein seitlicher Scroll bei 390 | `scrollWidth` 390 in `Table/PhoneCards`, `DataTable/PhoneCards`, `Grouped`, `Flat`, `Compact`; Scrollbox der Tabelle 356 = 356 | ✓ |
| 7 `is-phone-only` | 390: „Exportieren“ `none` 0 × 0, `.is-phone-only` `block` 82 × 30. 820 und 1440: „Exportieren“ `flex` 101 × 30, `.is-phone-only` `none` 0 × 0 | ✓ |
| 6 Leere Hülle | `seiten-mandantenjahr--normal` 390: `.v2ehead__summary` `none` 0 × 0; 820: `block` 746 × 19 | ✓ |
| H2 Leerzeichen | Barrierefreiheitsbaum bei 390: „Nummer 2026-0417“, „Klärungen 0“, „Soll 3100“, „BU 401“, „Prüfgrund entschieden“. Erledigt für DataTable. In `Table` gilt es nur, wenn der Aufrufer das Leerzeichen selbst schreibt; die Story tut es nicht, ist aber zurzeit wegen M3 ohnehin ohne Wort | ✓ |
| H4 Form | Die Zeile `is-phone-only` steht jetzt in der Schnittstellentabelle | ✓ |

**Zu M3, als Richtung:** Entweder bekommt der Text im Aufruf ein eigenes Element. Dann gehören die Story `Table/PhoneCards` und der Satz zur Klasse in der Schnittstelle dazu („der Wert steht als Element hinter dem Wort“, mit Leerzeichen im Wort wie bei DataTable). Oder die Regel `:only-child` gilt nur für die Hülle, die DataTable selbst setzt, und lässt den Aufrufer von `Table` unberührt. Danach `Table/PhoneCards` bei 390 und 820 erneut ansehen.

H1 und H3 bleiben Hinweise wie oben.

Abgenommen von / am: fremder Abnehmer (Agent), Nachprüfung 2026-11-22 · Offene Punkte: Kriterium 3 (M3: `:only-child` blendet die Wörter des `Table`-Aufrufers aus, die Kopfzeile fehlt trotzdem). M1, M2, H2 und H4 sind behoben.

### Schlussprüfung 2026-11-22

Geprüft gegen den Nachtrag zu M3: Die Regel heißt jetzt `.v2tbl__cardlabel--col:only-child { display: none }` (`v3.css` Z. 5449). Sie trifft nur das Wort, das DataTable setzt (`DataTable.tsx` Z. 941: `v2tbl__cardlabel v2tbl__cardlabel--col`). Bilder in `.playwright-mcp/f783-0255-final/` und `-final-narrow/`.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: Wächter und Build | `pnpm typecheck`, `check:type`, `check:icons`, `check:when`, `check:language` je Exit 0 · `check:classes` Exit 1 mit genau den vier Altfunden, kein neuer (`v2tbl__cardlabel--col` hat seine Regel) · `pnpm build` Exit 0 · Konsole ohne Fehler und Warnungen | ✓ |
| 1 Desktop unverändert | 37 neu aufgenommen, nach Vorschrift mit Aufwärmen und Maus auf 0,0: `png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-0255-final 0.5` → Exit 0, 34 × 0,000 %, höchstens 0,009 % (`journalentryreviewlist--flat`). Kein Flackern der Seitenleiste | ✓ |
| 3 `Table/PhoneCards` | 390: Alle drei „Fällig“ sind sichtbar und stehen vor dem Datum, in einer Zeile mit ihm (Hülle 101 × 19, „Fällig 21.08.2026“, „Fällig 30.08.2026“, „Fällig 14.09.2026“). `tr.v2tbl__head` `display: none`, Höhe 0. Der Barrierefreiheitsbaum liest „… 12 Tage überfällig Fällig 21.08.2026“, mit Leerzeichen. 820: Wörter `display: none`, Kopfzeile `grid`, 38 px, fünf Zellen; Bild pixelgleich mit `f783-review/table-phone-cards-820.png` (0,000 %). `scrollWidth` 390 bzw. 820 | ✓ |
| 4 Buchungsliste (M2 bleibt behoben) | 390, Wörter sichtbar / ohne Wert / über dem Wert: `Grouped` 137 / 0 / 0, `Flat` 40 / 0 / 0, `Compact` 4 / 0 / 0. Karte 1 in `Grouped`: „Soll 3100 · Fremdleistungen +2 weitere · Haben 1800 · Bank +1 weitere · BU 401 · Prüfgrund entschieden“ | ✓ |
| 2 Gegenprobe `DataTable/PhoneCards` | 390: 24 von 24 Wörtern sichtbar, keins ohne Wert, Kopfzeile mit drei bedienbaren Zellen. 820: alle Wörter `none`, Kopfzeile `grid` mit acht Zellen | ✓ |

Alle Kriterien sind ✓: 1, 2, 5, 6 und 7 aus der Nachprüfung, 3 und 4 hier. H1 (Kartenkopf mit „Sortieren nach“ und „Alle auswählen“ statt der Restkopfzeile) und H3 (`false` an „Prüfung durch Ludwig“ ohne Story) bleiben Hinweise für eine Folge-Spec.

Abgenommen von / am: fremder Abnehmer (Agent), Schlussprüfung 2026-11-22 · Offene Punkte: keine; H1 und H3 sind Hinweise.
