# 0258 · Eingang auf dem Handy, Auswahlleiste, Tastenzeichen bei Touch (F783 M3)

| | |
|---|---|
| Status | fertig (Schlussprüfung 2026-11-22, siehe „Abnahme“) |
| Stufe | `entities/source-document/` (`sourceDocumentColumns`), `v3.css` (Auswahlleiste, Tastenzeichen) |
| Klassen-Test | Spalten: nein (Beleg). Auswahlleiste und Tastenzeichen: ja |
| Quelle | ll-dev96 2026-11-22 (F783 M3 Eingang: Zeilenkarten, Auswahlleiste unten fest) und ll-ceo über ll-dev96 2026-11-22 (Tastenzeichen bei Touch), Bilder `app-f783/apps/web/test-results/mobile/m2/06-close-questions-phone.png`, `…/21-close-booking-single-phone.png` |
| Ersetzt | – (Ergänzung zu 0253/0255) |
| Blockiert | F783 M3 |
| Spec von / am | designsystem, 2026-11-22 |

## Ziel

Drei kleine Lücken der Handy-Form schließen, die alle im Set liegen:

1. **Belegspalten:** Die Belegliste baut das Set (`sourceDocumentColumns`). Also setzt das Set auch die Prioritäten, wie bei der Buchungsliste (0253). F783 Eingang: Zeile 1 Beleg · Betrag, Zeile 2 Korb (Einordnung) · Stand (Fortschritt) · Datum, der Rest nur am Desktop.
2. **Auswahlleiste:** Unter 640 px sitzt jede `.v2selbar` unten fest, nicht nur mit `selection.sticky`. Am Desktop bleibt `sticky`, wie es ist.
3. **Tastenzeichen bei Touch:** Auf einem Gerät ohne Hover mit grobem Zeiger („Strg+Enter“, A, R, J, K …) sind die Tastenzeichen an Schaltflächen nur Lärm, weil es dort keine Tastatur gibt. Die Schaltfläche bleibt, nur das Zeichen weicht.

## Einordnung

- **1 erweitert** `sourceDocumentColumns` wie `proposalReviewColumns` in 0253 (`PHONE_PRIORITY`), mit `cardLabel` aus 0255.
- **2 ändert** nur die Regel aus 0253 (`.v2selbar--sticky` → `.v2selbar`, nicht `--inline`, siehe unten).
- **3 ist neu**, aber nur CSS. Medienabfrage `(hover: none) and (pointer: coarse)`: Ein Tablet mit Tastatur oder Maus meldet meist `pointer: fine` und behält die Zeichen. Ein Desktop ändert sich nicht.

## Schnittstelle

### 1 · Prioritäten aller Sichten von `sourceDocumentColumns`

| Priorität | Spalten |
|---|---|
| `primary` | `document` (Beleg, trägt den Zeilenlink), `amount` |
| `meta` | `classification` (Einordnung = Korb), `progress` (Fortschritt = Stand), `documentDate`, `status`, `stuckState`, `reason`, `reviewReason`, `recommendation`, `decision` |
| `hidden` | `pages`, `confidence`, `case`, `batch`, `booking`, `counterparty`, `fileName`, `kind`, `form`, `identifier`, `uploadedAt`, `receivedDate`, `size` |

- `hidden` heißt nur am Desktop. Der Inhalt bleibt über den Beleg erreichbar (Drawer, Seite).
- Eine Spalte, die eine Handlung trägt, ist nie `hidden`. In den heutigen Sichten ist keine solche dabei; `decision` ist Text.
- Wörter (`cardLabel`): `documentDate` „Datum“, weil der Kopf je nach Sortierung kein String ist. Die übrigen `meta` nehmen ihren Kopf. Ausnahme ist `false` dort, wo ein Abzeichen spricht (`progress`, `status`, `stuckState`). Wird der Aufbau dabei klarer, legt der Bau das je Spalte fest und nennt es im Nachtrag.

### 2 · Auswahlleiste

Unter 640 px sitzt jede `.v2selbar` unten fest, mit Safe-Area. Die Auswahlleiste der DataTable steht als `v2selbar--inline` im Kartenkopf, `sticky` oder nicht. Der Platz unten (`.app__main`, 120 px) gilt für jede.

### 3 · Tastenzeichen

Unter `(hover: none) and (pointer: coarse)` ist `.v2kbd` **in Schaltflächen und Verweisen** (`.v2btn`, `button`, `a`, `.v2pager`) `display: none`. Ein `.v2kbd` im Fließtext („mit J weiter“) bleibt, sonst entstünde eine Lücke im Satz.

## Stories

- Keine neue Story.
- 1: `SourceDocumentColumns` `Inbox` und `DocumentList` bei 390.
- 2: `DataTable/Selection` (ohne `sticky`) bei 390 mit gewählter Zeile.
- 3: Playwright mit `hasTouch` bzw. emuliertem `(pointer: coarse)` an `Button`-Stories mit `hotkey`, `RecordPager`, `ClarificationCard/Step`.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build`, Wächter grün (`check:classes` ohne neue Befunde)
- [ ] Im Browser angesehen

Variabel:

1. **Desktop unverändert:** `png-diff` über die 37 von 0253 und über Vergleichsbilder von `SourceDocumentColumns` `Inbox`/`DocumentList` und `DataTable/Selection` bei 1440 vor dem Bau (`.playwright-mcp/f783-0258-base/`), Exit 0.
2. **Eingang bei 390:**
   - Zeile 1 Beleg (· Betrag, wo die Sicht ihn hat).
   - Zeile 2 Einordnung · Fortschritt · Datum.
   - Seiten und Sicherheit unsichtbar.
   - Kein seitlicher Scroll.
3. **Belegliste bei 390:** dieselbe Ordnung; Sachverhalt und Stapel unsichtbar; der Zeilenlink bleibt.
4. **Auswahlleiste bei 390:** In `DataTable/Selection` (ohne `sticky`) sitzt die Leiste nach Wahl einer Zeile am unteren Rand (`bottom` = `innerHeight` ± 1). Bei 1440 steht sie wie zuvor im Kartenkopf.
5. **Tastenzeichen:**
   - Mit `(pointer: coarse)` und `(hover: none)` haben `.v2kbd` in Schaltflächen und Pager `display: none`.
   - Die Schaltflächen sind sichtbar und benannt.
   - Mit `(pointer: fine)` bleiben die Zeichen.
   - Ein `.v2kbd` im Fließtext bleibt in beiden Fällen.

## Nachtrag 2026-11-22 (nach der ersten Abnahme, vom Spec-Autor)

- **Zu 2 und 3, Reihenfolge in Zeile 2 (H1):** Die Karte folgt der Spaltenfolge der Tabelle (Katalogordnung), auch in Zeile 2: Einordnung · Datum · Fortschritt. Sie ordnet nicht um. Gründe:
  - Es gäbe sonst eine zweite Ordnung nur für die Karte, eine zweite Quelle. Wer zwischen Breiten wechselt, fände die Werte an anderer Stelle.
  - In eine Zeile passen die drei bei 390 px ohnehin nicht (Einordnung 126 px + Fortschritt 209 px > 322 px). Zeile 2 bricht in jeder Ordnung um.
  - Das weicht vom Wortlaut „Korb · Stand · Datum“ in F783 ab und wird ll-dev96 gemeldet. Besteht die App darauf, wird es ein eigener Auftrag (Kartenordnung je Spalte).
  - **Kriterien 2 und 3 gelten in dieser Fassung:** In Zeile 2 stehen Einordnung, Datum und Fortschritt in Katalogordnung.
- **H2:** `classification: false` gehört zu den Ausnahmen ohne Wort, weil das Abzeichen die Belegart nennt („Eingangsrechnung“).
- **H4:** Die Spalte der aktiven Sortierung fällt in der Karte nie weg, DataTable macht aus `hidden` dann `meta`. Ihr Kopf ist der einzige Ort, der sagt, wonach sortiert ist, und der Weg zurück. Gemessen in `DocumentList` (Sortierung „Ludwig-Eingang“).
  - Nach der Nachprüfung (N1): Die wirksame Priorität wird einmal berechnet und an Kopf und Zeilen weitergegeben. Der hochgestufte Wert trägt damit sein Wort („Ludwig-Eingang 30.08.2026“).
  - `DataTable/PhoneCards` sortiert jetzt nach Betrag, damit „Eröffnet“ dort weiter nur am Desktop steht, wie ihr Text sagt.
- **H5:** In „Stories“ ist nachgetragen, dass die F783-Sichten (`INBOX_VIEW`, `DOCUMENT_LIST_VIEW`) in `Seiten/Belegzeile` stehen. Die `SourceDocumentColumns`-Stories zeigen die Altsätze und gelten ebenfalls.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: `typecheck`, `build`, Wächter | Exit-Codes: `typecheck` 0, `check:type` 0, `check:icons` 0, `check:when` 0, `check:language` 0 („0 German comment lines“), `build` 0. `check:classes` 1 mit genau den vier bekannten Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein neuer | ✓ |
| Fest: im Browser angesehen | Storybook 6118, Playwright-MCP, 390 × 844, 820 × 1180, 1440 × 900, dazu ein Touch-Kontext (`isMobile`, `hasTouch`, 390 × 844). Bilder in `.playwright-mcp/f783-0258-review/` | ✓ |
| 1 Desktop unverändert | Aufnahme 1440 × 900, `fullPage`, `animations: "disabled"`, Maus (0,0), 600 ms nach `networkidle`, Aufwärm-Story vorher. `png-diff` gegen `f783-0258-base/`: 5 × 0,000 %, Exit 0. Gegen `f783-base/`: 35 × ≤ 0,009 %, zwei Ausreißer im Sammellauf, `navlist--in-shell` 3,772 % und `appshell--collapsed` 1,026 %. Beide liegen nur in der Seitenleiste (x 16–255, y 255–913) und weichen um eine Farbstufe ab, wie der Verlauf der Seitenleiste. Dreimalige Einzelaufnahme: `appshell--collapsed` 3 × 0,000 %, `navlist--in-shell` 0,000 · 0,000 · 3,772 %. Das Rauschen bleibt also nicht. Dazu ist jede neue Regel in `max-width: 639.98px` oder `(hover: none) and (pointer: coarse)`; bei 1440 gemessen `matchMedia` falsch | ✓ |
| 2 Eingang bei 390 | Gemessen an `Seiten/Belegzeile` `Inbox` (`INBOX_VIEW`, 6 Zeilen). Zeile 1: Beleg mit Zeilenlink, in der Sicht gibt es keinen Betrag. Seiten und Sicherheit sind `display: none` (`data-hide="3 4"`). Kein seitlicher Scroll (`scrollWidth` 390). **Zeile 2 weicht ab:** In allen 6 Karten steht Einordnung (top +53, left 35) · Datum (top +57, left 169) in Zeile 2. Der Fortschritt steht darunter in einer eigenen Zeile (top +92, left 35). Gemessen ist also Einordnung · Datum / Fortschritt, verlangt ist Einordnung · Fortschritt · Datum. Grund ist die Katalogordnung (`documentDate` vor `progress`, Owner E2). Einen Nachtrag dazu gibt es nicht | ✗ |
| 3 Belegliste bei 390 | Gemessen an `Seiten/Belegzeile` `DocumentList` (`DOCUMENT_LIST_VIEW`). Zeile 1 Beleg · Betrag (beide top +12, Betrag rechts 288–355). Sachverhalt und Stapel sind `display: none` (`data-hide="6 7"`). Zeilenlink in 6 von 6 Zeilen sichtbar. Kein seitlicher Scroll. **„Dieselbe Ordnung“ weicht wie in 2 ab:** Einordnung · Datum, dann Fortschritt in eigener Zeile | ✗ |
| 4 Auswahlleiste bei 390 | `DataTable/Selection` (`v2selbar v2selbar--inline`, ohne `sticky`), eine Zeile gewählt („1 ausgewählt“): `position: fixed`, `bottom` 844 = `innerHeight`, Breite 390. Schaltflächen 44 px hoch. Bei 820 und 1440 `position: static` im Kartenkopf (Eltern `.actions`, top 35), Schaltflächen 34 bzw. 19 px wie zuvor | ✓ |
| 5 Tastenzeichen | Touch-Kontext (`matchMedia` wahr): `.v2kbd` in `.v2btn` und `.v2pager` alle `display: none`, geprüft an `Button/WithKey` (A, R, F), `ClarificationCard/Step` und `StepPaging` (Strg+Enter), `Wizard/WithFooter` (⏎), `HotkeyLegend/OnButton` (A), `RecordPager/Interactive` (J, K). Die Schaltflächen sind sichtbar und benannt: „Freigeben“, „Speichern und weiter“, „Weiter“, „Bestätigen“, Pager „Vorheriger/Nächster Datensatz“ 28 × 28. Mit feinem Zeiger, bei 390 und 1440, sind alle Zeichen `display: flex`. Fließtext-`.v2kbd` (`Kbd/InUse` J, K, Enter, A, R; `Kbd/Filled`) bleibt in beiden Fällen `flex` | ✓ |

- **H1 (zu 2/3, Ausweg):** Es gibt zwei Wege, die Ordnung zu klären. Entweder ordnet die Karte selbst um (`order`, nur in der Zeilenkarte). Oder ein datierter Nachtrag vor „## Abnahme“ hält fest, dass die Katalogordnung (E2) auch in Zeile 2 gilt, mit Zustimmung von ll-dev96, weil F783 „Korb · Stand · Datum“ verlangt. In einer Zeile passen alle drei bei 390 ohnehin nicht: Einordnung 126 px und Fortschritt 209 px brauchen zusammen mehr als 322 px.
- **H2 (Schnittstelle, ohne Nachtrag):** `CARD_LABEL` setzt auch `classification: false`. Die Spec nennt `false` nur für `progress`, `status` und `stuckState` und verlangt für jede weitere Festlegung einen Nachtrag. Die Wirkung ist richtig, denn das Abzeichen nennt die Belegart. Es fehlt nur der Satz im Nachtrag.
- **H3 (Handlungen):** Keine versteckte Zelle trägt eine Schaltfläche, ein `summary` oder ein Eingabefeld. Geprüft: 15 Tabellen in `SourceDocumentColumns` (alle acht Stories), `Seiten/Belegzeile` und `SourceDocumentReview/Overview`. Prozessbild-(i) und Menüs stehen an `meta`-Spalten. Der Zeilenlink ist in jeder Sicht und jeder Zeile sichtbar, auch wenn der Gegenpart führt (`DocumentList`, `RowAndPeek`) und wenn die Datei führt (`Inbox`, `Submit`, `Stuck`).
- **H4 (Sortierung, außerhalb der Kriterien):** In den Altsätzen (`DOCUMENT_LIST_COLUMNS`: Stories `DocumentList`, `RowAndPeek`) ist „Ludwig-Eingang“ `hidden` und damit auch sein Sortierlink im Kopf. In `DocumentList` ist das die aktive Sortierung (`aria-sort` am versteckten `th`). Auf dem Handy sieht man nicht, wonach sortiert ist, und kommt nicht zu dieser Sortierung zurück. Das widerspricht dem Grund aus 0255 („Sortierung hängt an der Kopfzeile“). Die neuen Sichten haben das Problem nicht: `DOCUMENT_LIST_VIEW` führt die Achse im Datumsmenü, und das bleibt sichtbar.
- **H5 (Stories):** Die in „Stories“ genannten `SourceDocumentColumns` `Inbox` und `DocumentList` zeigen die Altsätze, nicht `INBOX_VIEW` und `DOCUMENT_LIST_VIEW`. Die F783-Sichten stehen in `Seiten/Belegzeile`, dort ist gemessen. Bei 390 haben beide Altsätze keinen seitlichen Scroll, und der Zeilenlink bleibt. `Seiten/Belegzeile` `Compact` (720 px) und `Narrow` (600 px) scrollen bei 390 seitlich, weil ihre Hülle eine feste Breite hat. Das ist ein Fixture-Fall und keine Folge von 0258.

Abgenommen von / am: fremder Abnehmer (designsystem), 2026-11-22 · Offene Punkte: 2 und 3 (Ordnung in Zeile 2, H1), Nachtrag zu H2

### Nachprüfung 2026-11-22

Geprüft gegen den Nachtrag vom 2026-11-22 und den neuen Stand von `DataTable.tsx` (Zeile 611–613: die Spalte der aktiven Sortierung wird aus `hidden` zu `meta`).

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: `typecheck`, `build`, Wächter | Neu gelaufen. `typecheck`, `check:type`, `check:icons`, `check:when`, `check:language` und `build` enden mit 0. `check:classes` endet mit 1, nur mit den vier bekannten Altfunden | ✓ |
| 1 Desktop unverändert | Neue Aufnahme nach derselben Vorschrift (`.playwright-mcp/f783-0258-recheck/`). `png-diff` gegen `f783-base/`: 36 × 0,000 %, `clarificationcard--step` 0,001 %, Exit 0. Gegen `f783-0258-base/`: 5 × 0,000 %, Exit 0 | ✓ |
| 2 Eingang bei 390 (Fassung des Nachtrags) | `Seiten/Belegzeile` `Inbox`: Zeile 2 in allen 6 Karten in Katalogordnung: Einordnung (top +53) · Datum (+57, links 169), dann Fortschritt (+92). Seiten und Sicherheit sind `display: none`. Zeilenlink 6 von 6. Kein seitlicher Scroll. Altsatz `SourceDocumentColumns/Inbox`: Datei in Zeile 1, Einordnung · Status in Katalogordnung, Sicherheit weg, Zeilenlink 4 von 4, kein Scroll | ✓ |
| 3 Belegliste bei 390 (Fassung des Nachtrags) | `Seiten/Belegzeile` `DocumentList`: Beleg · Betrag in Zeile 1 (beide +12). Einordnung · Datum · Fortschritt in Katalogordnung. Sachverhalt und Stapel sind `display: none`. Zeilenlink 6 von 6, kein Scroll. Altsätze `DocumentList` und `RowAndPeek`: Gegenpart · Betrag oben, Rest in Katalogordnung, Sachverhalt weg, Zeilenlink 4 von 4, kein Scroll | ✓ |
| Nachtrag H4 (Sortierkopf) | `SourceDocumentColumns/DocumentList` bei 390: Der Kopf „Ludwig-Eingang ↓“ ist sichtbar, `data-hide` ist nur noch „7“. Aber **der Wert steht ohne Wort.** Die Karte zeigt „Datum 26.08.2026 30.08.2026“, und welches Datum welches ist, bleibt offen (0255: „ein Wert ohne sein Wort ist auf der Karte nicht lesbar“). Ursache: `DataTable.tsx` Zeile 937 fragt `col.priority === "meta"`, also die Priorität der Spalte und nicht die hochgestufte. **Folge im Set:** `DataTable/PhoneCards` (0253/0255) sortiert nach `openedAt`, dort ist „Eröffnet“ `hidden`. Die Spalte steht jetzt in Zeile 2 als nackte Zeit „26.08., 09:40“, ebenfalls ohne Wort. Die Story zeigt kein `hidden` mehr (`data-hide` fehlt), und ihr Text sagt noch „‚Eröffnet‘ nur am Desktop“ | ✗ |

- **N1 (zu H4, Ausweg):** Das Wort an der hochgestuften Spalte hängt an der wirksamen Priorität, nicht an `col.priority`. Dann steht „Ludwig-Eingang 30.08.2026“ bzw. „Eröffnet 26.08., 09:40“ da. Für `DataTable/PhoneCards` sortiert die Story entweder nach einer sichtbaren Spalte, damit `hidden` wieder vorkommt, oder ihr Text nennt die neue Regel. Die Regel selbst gehört in die JSDoc von `ColumnDef.priority` (Zeile 158–162). Dort steht heute nur „`hidden` desktop only“. Sie ist ein Systementscheid über 0258 hinaus.
- **N2 (H5):** Der Nachtrag sagt „In ‚Stories‘ ist nachgetragen“. Der Abschnitt „Stories“ ist aber unverändert, der Hinweis steht nur im Nachtrag selbst. Inhaltlich genügt das.
- **N3:** Kriterien 4 und 5 sind von der Änderung nicht berührt (`DataTable/Selection` hat keine `hidden`-Spalte, das Tastenzeichen ist reines CSS). Das Ergebnis der ersten Abnahme bleibt.

Nachgeprüft von / am: fremder Abnehmer (designsystem), 2026-11-22 · Offen: H4, das Wort an der hochgestuften Spalte und die Story `DataTable/PhoneCards` (N1)

### Schlussprüfung 2026-11-22

Geprüft gegen den Nachtrag (H4 mit N1) und den Stand von `DataTable.tsx`: `columns` kommt aus `declared` und trägt die wirksame Priorität, `rowProps` geht an `bodyRow` und `section`. Dazu `DataTable.stories.tsx`: `PhoneCards` sortiert nach `totalAmount`.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: `typecheck`, `build`, Wächter | Neu gelaufen. `typecheck`, `check:type`, `check:icons`, `check:when`, `check:language` und `build` enden mit 0. `check:classes` endet mit 1, nur mit den vier bekannten Altfunden | ✓ |
| 1 Desktop unverändert | Neue Aufnahme nach derselben Vorschrift (`.playwright-mcp/f783-0258-final/`). `png-diff` gegen `f783-base/`: 37 von 37 ✓, 35 × 0,000 %, `clarificationcard--step` und `datatable--filled` je 0,001 %, Exit 0. Gegen `f783-0258-base/`: 5 × 0,000 %, Exit 0 | ✓ |
| Nachtrag H4/N1 | `SourceDocumentColumns/DocumentList` bei 390: Der Kopf „Ludwig-Eingang ↓“ ist sichtbar, `data-hide` ist nur noch „7“ (Sachverhalt). In allen 4 Karten trägt der Wert sein Wort: „Datum 26.08.2026 · Ludwig-Eingang 30.08.2026“. Ohne Wort bleiben nur Einordnung und Status (`cardLabel: false`, Abzeichen). Zeilenlink 4 von 4, kein seitlicher Scroll. `RowAndPeek` ist ohne Sortierung, dort bleibt „Ludwig-Eingang“ `hidden` | ✓ |
| `DataTable/PhoneCards` (0253/0255) | Bei 390: „Eröffnet“ ist `display: none` (`data-hide="7"`). Die Wörter stehen wie in 0255: „Nummer 2026-0417“, „Klärungen 0“. Kein Wort an „Bearbeitung“ (`cardLabel: false`) und an den Aktionen. Zeilenlink 12 von 12, kein Scroll. Der Story-Text „‚Eröffnet‘ nur am Desktop“ stimmt wieder | ✓ |

Kriterien 2 bis 5 sind vom Schritt N1 nicht berührt, es gilt der Nachweis der Nachprüfung (2, 3) und der ersten Abnahme (4, 5). Alle Kriterien sind erfüllt.

Schlussgeprüft von / am: fremder Abnehmer (designsystem), 2026-11-22 · Offene Punkte: keine
