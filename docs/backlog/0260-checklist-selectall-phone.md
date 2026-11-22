# 0260 · Handy: Prüfungsliste, „alle auswählen“, MasterDetail (F783 nach M3)

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` (Checklist, MasterDetail: nur CSS), `primitives/` (SelectAllCell), `v3.css` |
| Klassen-Test | ja |
| Quelle | ll-dev96 2026-11-22, von ll-ceo zum Melden freigegeben, nach dem Merge von F783 M3 (App ee07c30da). Bilder `app/apps/web/test-results/mobile/m3/12-close-handover-phone.png` und `…/10-close-bookings-phone.png` |
| Ersetzt | – (Ergänzung zu 0253/0255) |
| Blockiert | nichts |
| Spec von / am | designsystem, 2026-11-22 |

## Ziel

Zwei Befunde der App bei 390 px und einer, der bei der Untersuchung dazukam:

1. **Prüfungsliste (`Checklist`, Abnahme Schritt „Übergeben“):**
   - In der Zeilenkarte füllt das Zustandszeichen allein Zeile 1.
   - Die Prüfung steht darunter in einer Zeile mit `white-space: nowrap` und läuft über die Karte hinaus („Nichts übernommen — ohne übernommene B…“).
   - Soll: Zeichen und Prüfung stehen in Zeile 1, die Prüfung bricht dort um.
2. **„Alle auswählen“ (`SelectAllCell`, Buchungen nach Art):**
   - In der Karte ist die Kopfzeile keine Legende mehr (0255). Dort steht nur ein Kästchen ohne Wort.
   - Soll: Das Kästchen trägt in der Karte sein Wort. Es ist sein zugänglicher Name, „Alle auf dieser Seite auswählen“, also sind sichtbares Wort und Name gleich (WCAG 2.5.3).
3. **MasterDetail (`.v2md`):**
   - Die Detailspalte ist fest 420 px breit. Unter 420 px fiel die Liste auf 0 px (gefunden in `Checklist/Filled` bei 390).
   - Soll: Unter 1024 px einspaltig, Liste zuerst, das Detail darunter und nicht klebend. Das ist dieselbe Regel wie für die anderen Zwei-Spalten-Muster in 0253.

Dazu kommt eine allgemeine Regel: Abgeschnittener Text (`.v2trunc`, `.v2chk__label`) bricht in der Zeilenkarte um. Das einzeilige Abschneiden ist eine Gewohnheit der Desktop-Spalte; in der Karte hat die Zeile die Breite.

## Schnittstelle

Keine neue Prop.

- `SelectAllCell` steckt das Kästchen in `label.v2selall` und setzt dazu `span.v2tbl__cardlabel` mit dem Text von `label`. Außerhalb der Karte ist es `display: none`.
- Die Regel aus 0255, nach der die Kopfzeile in der Karte nur Bedienbares zeigt, zählt jetzt nur Wörter in **Datenzellen** (`td .v2tbl__cardlabel`). Das Wort am Kästchen schaltet die Legende einer Tabelle ohne Kartenwörter nicht ab.
- CSS in der Container-Abfrage der Karte: `.v2trunc`/`.v2chk__label` brechen um. In `.v2chk` ist die Zelle des Zeichens (`.v2tbl__lead` bzw. `:has(> .v2chk__icon)`) `flex: 0 0 auto`, die Zelle der Prüfung `flex: 1 1 0%`.
- CSS unter 1024 px: `.v2md` einspaltig, `.v2md__detail` statisch.

## Stories

Keine neue Story. Gemessen wird bei 390 an:

- `Checklist` `WithoutProgress`, `Expandable` und `Filled` (diese in MasterDetail),
- `JournalEntryReviewList` `Grouped`,
- `DataTable` `Selection`,
- `MasterDetail`-Stories.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build`, Wächter grün (`check:classes` ohne neue Befunde)
- [ ] Im Browser angesehen

Variabel:

1. **Desktop unverändert:** `png-diff` über die 37 von 0253 und über `.playwright-mcp/f783-0260-base/` (Checklist bei 1440, vor dem Bau), Exit 0. Ein `label` um das Kästchen ändert am Desktop nichts.
2. **Prüfungsliste bei 390:**
   - Zeichen und Prüfung beginnen auf derselben Höhe.
   - Der Text bricht innerhalb der Karte um (`scrollWidth <= clientWidth` je Zeile).
   - Der Stand steht rechts.
3. **„Alle auswählen“ bei 390:**
   - In `JournalEntryReviewList/Grouped` zeigt die Kopfzeile das Kästchen mit „Alle auf dieser Seite auswählen“.
   - Ein Antippen des Worts wählt alle.
   - In `DataTable/Selection` (ohne Kartenwörter) bleibt die Legende der Spalten wie in 0253.
4. **MasterDetail bei 390 und 820:** Die Liste ist so breit wie die Fläche, das Detail steht darunter, kein seitlicher Scroll. Bei 1440 wie zuvor.
5. **Bei 820 und 1440** ist das Wort am Kästchen `display: none`.

## Nachtrag 2026-11-22 (nach der ersten Abnahme, vom Spec-Autor)

- **M1/M2 behoben:** In `.v2chk` hält die Zelle der Prüfung den Platz für den Stand frei (`margin-right: 8em + --space-2`), die Zelle des Zeichens nicht mehr (`0`). Die allgemeine Regel aus 0255 gibt den Platz der ersten Textzelle, und das ist in der Prüfungsliste das Zeichen.
- **H1, benannte Ausnahme:** `.v2md--detail-wide` (0063) stellt das Detail beim Umbruch absichtlich **oben** hin, weil dort das Detail die Arbeitsfläche ist. Die Regel „Liste zuerst“ gilt nur für das einfache `.v2md`.
- **H2 (Kopf springt beim ersten Haken um 12 px, 71 → 83):** Die Ursache war `gap: 12px` des Kopfs. Beim Umbruch (0259) stand dieser Abstand auch zwischen den Zeilen, also über der Aktionszeile, die mit der ersten Wahl nur noch die unten feste Auswahlleiste trägt. Behoben nach der Nachprüfung: `row-gap: 0` am umbrechenden Kopf. Den Abstand über sichtbaren Aktionen trägt `margin-top` aus 0259. Gemessen in `DataTable/Selection` bei 390: Vor der Wahl ist der Kopf 98 px hoch (mit der Aktion), nach der Wahl 71 px. Die Aktion weicht der Auswahlleiste wie am Desktop, und die Leiste sitzt unten. Es bleibt kein leerer Abstand. `HeadPhone`: 8 px zwischen Titel und Aktionen, 356/356.
- **H3:** Das Wort am Kästchen steht in der Karte auch in der Legende von Tabellen ohne Kartenwörter. Gewollt: Auch dort sagt es, was das Kästchen tut.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: Wächter und Build | `pnpm typecheck` Exit 0 · `check:type` Exit 0 („ok“) · `check:language` Exit 0 · `check:icons` Exit 0 · `check:when` Exit 0 · `check:classes` Exit 1 mit genau den vier Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein neuer; `v2selall` hat seine Regel · `pnpm build` Exit 0 („Storybook build completed successfully“) | ✓ |
| Fest: im Browser angesehen | Playwright-MCP gegen Storybook 6118 bei 390×844, 820×1180, 1440×900. Bilder in `.playwright-mcp/f783-0260-review/` (37), `-review-chk/` (4), `-review-390/`. Konsole ohne Fehler und Warnungen | ✓ |
| 1 Desktop unverändert | Neu aufgenommen nach Vorschrift (1440×900, `fullPage`, `animations: "disabled"`, Aufwärm-Story vorab, Maus auf 0,0, 600 ms nach `networkidle`). `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-0260-review 0.5` → Exit 0, 37 × ✓, höchstens 0,001 % (`journalentryreviewlist--compact`, `--grouped`, `clarificationcard--step`). `png-diff.mjs .playwright-mcp/f783-0260-base .playwright-mcp/f783-0260-review-chk 0.5` → Exit 0, 4 × 0,000 %. Kein Flackern der Seitenleiste, keine Wiederholung nötig. Das `label` um das Kästchen: bei 1440 `display: inline`, Kästchen 14 × 14 an derselben Stelle (x 35), `datatable--selection` und `selection--with-selection` je 0,000 % | ✓ |
| 2 Prüfungsliste bei 390 | `checklist--without-progress`, `--expandable`, `--filled` (in MasterDetail), je 6 Zeilen. Erfüllt: Zeichen- und Prüfungszelle beginnen auf derselben Höhe (Zelloberkante gleich, Zeichen y 12–27, erste Textzeile y 14–31 in der Zeile). `white-space: normal`, der Text bricht um (bis 3 Zeilen). `scrollWidth` = `clientWidth` je Zeile (356/356, 353/353). Der Stand steht rechts, rechte Kante 355 = Zeile 373 − 18 in allen 18 Zeilen. Aber: **M1** Zwischen Zeichen und Prüfung liegt eine Lücke von 124 px. Die Zeichenzelle (x 35, 15 breit) trägt `margin-right: 116px`, das ist der Platz für den Betrag (`calc(8em + var(--space-2))`). Die Regel gibt ihn der ersten Textzelle, und das ist für den Selektor die Zeichenzelle: nicht `v2num`, kein Kästchen, kein Chevron, nicht leer. Die Prüfung beginnt erst bei x 174 (mit Chevron 194), in allen 18 Zeilen. **M2** Die Prüfungszelle selbst hat `margin-right: 0` und reicht bis x 347/355. Unter dem rechts absolut stehenden Stand läuft deshalb der Text durch. Erste Textzeile und Stand überdecken sich in 10 von 18 Zeilen, z. B. „Alle Belege des Zeitraums“ unter „94 von 94“ (Text bis x 340, Stand ab 289), „Buchungsvorschläge“ unter „106 von 118“, „Nichts übernommen“ unter „0 von 42“ (`--expandable`). Das ist genau der App-Fall aus dem Ziel. Bilder `f783-0260-review-390/…checklist--without-progress-390.png`, `--expandable-390.png`, `--filled-390.png` | ✗ |
| 3 „Alle auswählen“ bei 390 | `journalentryreviewlist--grouped`: Die Kopfzeile ist `flex`. Sichtbar ist nur die erste Zelle: Kästchen 14 × 14 und „Alle auf dieser Seite auswählen“ (189 × 19, `rgb(113, 113, 113)`), zusammen `label.v2selall` 211 × 19, `inline-flex`. Die übrigen 12 Zellen sind `display: none`. Name im Barrierefreiheitsbaum: checkbox „Alle auf dieser Seite auswählen“ = sichtbares Wort (2.5.3). Echter Klick auf das Wort (Treffer `elementFromPoint` = `span.v2tbl__cardlabel`): 0 → 40 von 40 Zeilen gewählt, zweiter Klick 40 → 0, dritter 0 → 40. Aus Teilauswahl (1, `indeterminate`) wählt ein Klick auf das Wort alle 40. Leertaste am fokussierten Kästchen schaltet ebenso, Fokusring 2 px `rgb(59, 143, 196)`. `datatable--selection` (kein `td .v2tbl__cardlabel`): Die Kopfzeile bleibt Legende, alle Zellen `block` („Nummer“, „Sachverhalt“, „Betrag“, „Bearbeitung“ mit (i), „Eröffnet ↓“). Bilder `…grouped-390.png`, `grouped-390-word-clicked.png`, `…datatable--selection-390.png` | ✓ |
| 4 MasterDetail bei 390 und 820 | `masterdetail--filled`, `--nothing-selected`, `--empty`, `--empty-after-filter` und `checklist--filled`: bei 390 einspaltig (`grid-template-columns: 358px`), Liste 16 + 358 = Fläche, Detail 16 + 358 darunter (z. B. Liste bis y 323, Detail ab 343), `position: static`, `overflow: visible`. Bei 820 ebenso mit 788 (Prüfungsliste dort wieder als Tabelle, Zeile `grid`). `scrollWidth` = Fensterbreite in allen. Bei 1440 wie zuvor: `968px 420px`, Detail bei x 1004, `sticky`, `max-height` 868 px; `checklist--filled` bei 1440 0,000 % zum Stand vor dem Bau. `masterdetail--detail-wide` ist ausgenommen, siehe H1 | ✓ |
| 5 Wort bei 820 und 1440 `display: none` | `journalentryreviewlist--grouped` und `datatable--selection`, je bei 820 und 1440: `.v2selall > .v2tbl__cardlabel` `display: none`, 0 × 0. `label.v2selall` `inline`, Kopfzeile `grid` mit allen Zellen | ✓ |

**H1 `detail-wide` gehorcht Kriterium 4 nicht, und die Spec sagt nicht, dass es so sein soll.** `masterdetail--detail-wide` ist eine Flexbox mit `row-reverse` und `wrap` (0063): Umgebrochen steht das Detail absichtlich **über** der Liste. Bei 390 Detail y 35–255, Liste y 275–495, beide 358 breit. Bei 820 ist die Liste nur 440 von 788 px breit, das Detail steht darüber. Kein seitlicher Scroll. Ich habe das nicht als Mangel gezählt: Die Schnittstelle der Spec nennt nur `.v2md` mit fester Detailspalte, und die Ordnung von `detail-wide` ist eine eigene, ältere Entscheidung. Das Kriterium nennt aber „MasterDetail-Stories“ ohne Ausnahme. Bitte im Nachtrag benennen, dass `detail-wide` ausgenommen bleibt, oder es angleichen.

**H2 Die Kopfzeile springt beim ersten Haken um 12 px (nicht aus 0260).** In `Grouped` bei 390 wächst der Kartenkopf (`.v2card__h--sticky`) von 71 auf 83 px, sobald etwas gewählt ist. „Alle auf dieser Seite auswählen“ rutscht von y 97 auf 109. Wer gleich noch einmal auf dieselbe Stelle tippt, trifft die Zeile statt des Worts. Gemessen: Klick mit alten Koordinaten landet auf `tr.v2tbl__head`, Auswahl bleibt. Bei 1440 springt nichts (Kopf bleibt 71). Der Diff von 0260 berührt den Kartenkopf nicht, die Ursache liegt vermutlich in 0258 (Auswahlleiste unten). Verstößt gegen „Nichts springt“, gehört in eine eigene Aufgabe.

**H3 Das Wort steht auch in einer Legende.** In `datatable--selection` bei 390 steht „Alle auf dieser Seite auswählen“ jetzt in der ersten Zeile der Legende. „Nummer“ rückt deshalb in eine eigene Zeile. Das deckt die Schnittstelle („in der Karte sichtbar“), und die Legende bleibt vollständig. Es ist nur nicht ausdrücklich so beschrieben.

**Zu M1 und M2, als Richtung:** Der Platz für den Betrag gehört in `.v2chk` an die Prüfungszelle, nicht an die Zeichenzelle. Das heißt: Die Zeichenzelle verliert `margin-right`, die Zelle mit `.v2chk__label` bekommt `calc(8em + var(--space-2))`. Das geht entweder über einen Ausschluss im Selektor der „ersten Textzelle“ oder über zwei Regeln in `.v2chk` mit genügend Gewicht. Danach die drei Stories bei 390 erneut messen: Lücke Zeichen→Prüfung ≈ `column-gap`, keine Überdeckung mit dem Stand. Zusätzlich Kriterium 1 für `f783-0260-base`.

Abgenommen von / am: fremder Abnehmer (Agent), 2026-11-22 · Offene Punkte: Kriterium 2 (M1 Lücke von 124 px zwischen Zeichen und Prüfung; M2 Prüfung läuft in 10 von 18 Zeilen unter den Stand). H1–H3 sind Hinweise.

### Nachprüfung 2026-11-22

Geprüft gegen den Nachtrag vom 2026-11-22. In `v3.css` hat die Zeichenzelle in `.v2chk` jetzt `margin-right: 0`, die Prüfungszelle `calc(8em + var(--space-2))`. Sonst ist der Diff unverändert, die Kriterien 3–5 berührt die Änderung nicht. Bilder in `.playwright-mcp/f783-0260-recheck/` (37), `-recheck-chk/` (4), `-recheck-390/`.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: Wächter und Build | `pnpm typecheck`, `check:type`, `check:language`, `check:icons`, `check:when` je Exit 0 · `check:classes` Exit 1 mit genau den vier Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein neuer · `pnpm build` Exit 0 („Storybook build completed successfully“) · Konsole ohne Fehler und Warnungen | ✓ |
| 1 Desktop unverändert | Neu aufgenommen nach Vorschrift (1440×900, `fullPage`, `animations: "disabled"`, Aufwärm-Story, Maus 0,0, 600 ms nach `networkidle`). `png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-0260-recheck 0.5` → Exit 0, 37 × ✓, 36 × 0,000 %, höchstens 0,001 % (`clarificationcard--step`). `png-diff.mjs .playwright-mcp/f783-0260-base .playwright-mcp/f783-0260-recheck-chk 0.5` → Exit 0, 4 × 0,000 %. Keine Wiederholung nötig | ✓ |
| 2 Prüfungsliste bei 390 | `--without-progress`, `--expandable`, `--filled`, je 6 Zeilen, 18 von 18 gemessen. Keine Lücke mehr: Zeichenzelle `margin-right: 0`, zwischen Zeichen und Prüfung 8 px (= `column-gap`), Prüfung ab x 58 (mit Chevron 78, vorher 174/194). Dieselbe Höhe: Zelloberkante gleich (Δ 0), Zeichen y 12, erste Textzeile y 14. Der Text bricht innerhalb der Prüfungszelle um (1–3 Zeilen), `scrollWidth` = `clientWidth` je Zeile (356/356, 353/353) und je Prüfungszelle. Kein Text unter dem Stand: 0 von 18 Überdeckungen. Die Prüfungszelle endet bei x 231/239, der Stand beginnt frühestens bei x 272 („106 von 118“). Kein Überstand: Kein Element ragt aus der Karte, `scrollWidth` der Seite 390. Der Stand steht rechts, rechte Kante 355 in allen Zeilen. Bilder `…checklist--without-progress-390.png`, `--expandable-390.png`, `--filled-390.png` | ✓ |
| H1 `detail-wide` | Im Nachtrag als Ausnahme mit Grund (0063) benannt | ✓ |

**H2 bleibt ein Hinweis, die Begründung im Nachtrag stimmt aber nicht mit der Messung überein.** Gemessen in `Grouped` bei 390: Der Kartenkopf wird mit der ersten Wahl **höher** (71 → 83 px), er verliert keine Zeile. Die Kopfzeile rutscht dadurch um 12 px nach unten. Bei der Folgeaufgabe von 0258/0259 bitte prüfen, welches Element dabei wächst.

**H4 (neu, klein):** In `--expandable` steht die Zeile ohne Ausklappen („Fragen an den Mandanten verschickt“) 12 px weiter links: Zeichen x 43 statt 55, Prüfung x 66 statt 78. Ihre leere Chevron-Zelle hat in der Karte keine Breite. Das gab es schon vor dieser Änderung (erste Abnahme: Zeichen x 43). Die Zeichen stehen dadurch nicht in einer Spalte. Kein Kriterium von 0260.

Nachgeprüft von / am: fremder Abnehmer (Agent), 2026-11-22 · Offene Punkte: keine. H2 und H4 sind Hinweise.
