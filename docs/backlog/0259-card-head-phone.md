# 0259 · Kartenkopf auf dem Handy: Aktionen brechen um (F783 M3)

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` (`CardHead`, nur CSS) |
| Klassen-Test | ja: Kopf einer Karte mit Aktionen gibt es in jeder App |
| Quelle | ll-dev96 2026-11-22, Eingang „Dateikorb: K-2026-0001“ (`CardHead` mit Titel, Unterzeile, Abzeichen und `Select` + Schaltfläche): bei 390 `.v2card__h` 534 px Inhalt auf 356 px. Der Titel bricht zeichenweise, das Abzeichen liegt über ihm, die Auswahl ragt aus der Karte. Bild `app-f783/apps/web/test-results/mobile/m3/03-inbox-phone.png` |
| Ersetzt | – (Ergänzung zu 0253) |
| Blockiert | F783 M3 Eingang |
| Spec von / am | designsystem, 2026-11-22 |

## Ziel

Unter 640 px bekommt der Titel einer Karte den Platz neben Symbol und Zusatz (`meta`). Die Aktionen brechen in eine eigene Zeile darunter, über die volle Breite. Eine Auswahl oder ein Feld darin schrumpft auf die Kartenbreite. Die App setzt dafür nichts. Am Desktop ändert sich kein Pixel.

## Einordnung

Erweitern (§3 Regel 2): Dieselbe Klasse `.v2card__h` bekommt eine Regel in der Handy-Abfrage aus 0253. Keine neue Prop.

## Schnittstelle

Nur CSS unter 640 px:

| Selektor | Wirkung |
|---|---|
| `.v2card__h` | `flex-wrap: wrap` |
| Titelblock | wächst und schrumpft (`flex: 1 1 0`), bricht wortweise um |
| `.v2card__h .actions` | volle Breite (`flex: 1 1 100%`), bricht selbst um, schrumpft (`flex-shrink` statt 0) |
| `.v2card__h .actions > *` | höchstens volle Breite; `select`/`.v2in` schrumpfen (`min-width: 0`) |

## Stories

Neu: `v3/Primitives/Tabelle/Table` · `HeadPhone`. Ein Kartenkopf wie im Eingang: Titel „Dateikorb: K-2026-0001“, Unterzeile, Abzeichen, `Select` mit langer Option und Schaltfläche „Korb verarbeiten“. Ansehen bei 390.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build`, Wächter grün (`check:classes` ohne neue Befunde)
- [ ] Im Browser angesehen

Variabel:

1. **Desktop unverändert:** `png-diff` über die 37 von 0253 (`.playwright-mcp/f783-base/`) Exit 0.
2. **`HeadPhone` bei 390:**
   - `.v2card__h` ist `scrollWidth <= clientWidth`.
   - Der Titel steht in höchstens zwei Zeilen und bricht nicht mitten im Wort um. Gemessen wird die Breite des Titelblocks ≥ 120 px.
   - Abzeichen und Titel überlappen nicht.
   - Die Aktionen beginnen unter dem Titelblock (`top` größer als dessen `bottom`) und liegen ganz in der Karte.
3. **Bestehende Köpfe bei 390** (`Table/CardHeadIconMeta`, `DataTable/Filled`, `JournalEntryReviewList/Grouped`): kein Überstand, Titel nicht zeichenweise umbrochen.
4. **Bei 820 und 1440** stehen Titelblock, Abzeichen und Aktionen von `HeadPhone` nebeneinander wie bei jedem Kopf heute (die Aktionen beginnen nicht unter dem Titelblock).

## Nachtrag 2026-11-22 (nach der Abnahme, vom Spec-Autor)

- **H1 umgesetzt:** Eine leere `.actions` ist unter 640 px weg. Abstand über den Aktionen (`--space-2` als `margin-top` statt `row-gap`) gibt es nur, wenn sie etwas anderes als die feste Auswahlleiste zeigen. Der Kopf wird dadurch nicht 8 px höher.
- **H3 umgesetzt:** Das Abzeichen der Story heißt „Offen“, passend zur Unterzeile.
- H2 (Bindestrich-Umbruch bei 820) liegt außerhalb der Spec. H4 (Überstand in `CaseCard/InUse` mitbehoben) wird vermerkt.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: `typecheck`, `build`, Wächter | Exit-Codes: `typecheck` 0, `check:type` 0, `check:language` 0 („0 German comment lines“), `build` 0. `check:classes` 1 mit genau den vier bekannten Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein neuer | ✓ |
| Fest: im Browser angesehen | Storybook 6118, Playwright-MCP, 390 × 844, 820 × 1180, 1440 × 900. Bilder in `.playwright-mcp/f783-0259-review/` (37 Desktop) und `.playwright-mcp/f783-0259-review-390/` (`HeadPhone` je Breite, `Grouped`, `CaseCard/InUse`) | ✓ |
| 1 Desktop unverändert | Aufnahme 1440 × 900, `fullPage`, `animations: "disabled"`, Maus (0,0) nach jedem Laden, 600 ms nach `networkidle`, Aufwärm-Story vorher. `png-diff` gegen `f783-base/`: 35 × 0,000 %, `clarificationcard--step` 0,001 %, `wizard--with-footer` 0,002 %, Exit 0 im ersten Lauf. Alle fünf Regeln liegen in `max-width: 639.98px` (im CSSOM als Regeln dieser Abfrage gefunden) | ✓ |
| 2 `HeadPhone` bei 390 | `.v2card__h` `scrollWidth` 356 = `clientWidth` 356, Dokument 390 = 390. Titel „Dateikorb: K-2026-0001“ in einer Zeile (Höhe 21,7 = Zeilenhöhe), kein Wort über zwei Zeilen (Range je Wort). Titelblock 247,7 px breit (≥ 120). Abzeichen x 294,7–355, Titelblock x 35–282,7: keine Überlappung. Aktionen top 81,1 > Titelblock bottom 73,1. Aktionen x 35–355, Auswahl 35–355 (320 px, geschrumpft), „Korb verarbeiten“ 35–169, alles in der Karte (16–374) | ✓ |
| 3 Bestehende Köpfe bei 390 | `Table/CardHeadIconMeta` (3 Köpfe), `DataTable/Filled`, `JournalEntryReviewList/Grouped`: je `scrollWidth` 356 = `clientWidth`, kein Element des Kopfes außerhalb der Karte, Dokument 390. Titel je eine Zeile, kein Wort über zwei Zeilen. Zusätzlich 91 Stories mit Kartenkopf (Table, DataTable, Karten, Prüftabellen, Phone) bei 390 durchlaufen: kein Überstand, kein umbrochenes Wort | ✓ |
| 4 `HeadPhone` bei 820 und 1440 | Titelblock, Abzeichen, Aktionen in einer Reihe. 820: Titelblock top 31–94,8, Abzeichen x 199–259, Aktionen x 271–785, top 46,6 (nicht unter dem Titelblock). 1440: Titelblock x 35–199, Abzeichen x 819–879, Aktionen x 891–1405, top 35,8. `scrollWidth` = `clientWidth` in beiden | ✓ |

- **H1 (leere Aktionszeile):** Ist `.actions` leer, steht sie bei 390 trotzdem in einer eigenen Zeile, und `row-gap` gibt dem Kopf 8 px mehr Höhe unter der Unterzeile. Gemessen (Kopfhöhe mit Regel gegenüber Regel im CSSOM entfernt): `JournalEntryReviewList` `Grouped` und `Flat` 71 → 79 px, `Compact` 51 → 59 px. `DataTable` `StickySelection`, `Expand`, `HandlesInFloor`, `GroupSelection` und `PhoneCards` 71 → 79 px. Dort rendert `CardHead` ein leeres `<div class="actions"></div>`. Derselbe Fall entsteht in `DataTable/Selection` nach Wahl einer Zeile: Die Auswahlleiste ist ab 0258 `position: fixed`, `.actions` ist dann 0 px hoch, aber nicht `:empty` (Kopf 79 px wie oben). Ausweg: Eine `.actions` ohne Inhalt im Fluss bildet keine eigene Zeile, in der Handy-Abfrage etwa über `:empty` und `:has()` für die feste Auswahlleiste. Oder `CardHead` und `DataTable` lassen `.actions` weg, wenn nichts darin steht. Kein Kriterium verlangt das.
- **H2 (820, außerhalb der Spec):** Bei 820 gilt die Handy-Regel nicht. Der Titelblock von `HeadPhone` ist dort auf 152 px gedrückt (Auswahl 369 px + Schaltfläche 134 px, `flex-shrink: 0`). Der Titel bricht am Bindestrich im Zeichen um: „Dateikorb: K-2026-“ / „0001“. Das ist derselbe Druck wie in F783, nur milder. Er fällt unter „Am Desktop ändert sich kein Pixel“, ist also kein Mangel dieser Spec. Für Tablets wäre er ein eigener Auftrag.
- **H3 (Story-Daten):** In `HeadPhone` sagt das Abzeichen „Erledigt“ (`Badge tone="success"`), Unterzeile und Option sagen „offen“. Ein Abzeichen, das dem Text widerspricht, ist ein schlechtes Vorbild. Ein neutrales Abzeichen (etwa die Zahl der Belege) oder ein passender Status über `StatusBadge` wäre besser.
- **H4 (Nebenwirkung, positiv):** `CaseCard/InUse` bei 390: Ohne die neuen Regeln (im CSSOM entfernt) ragt die Aktion des Kopfes bis x 416,8 über die Karte (rechts 374). Mit 0259 steht sie in der Karte (x 59–331).

Abgenommen von / am: fremder Abnehmer (designsystem), 2026-11-22 · Offene Punkte: keine in den Kriterien; H1 (leere Aktionszeile) als Folgeauftrag empfohlen
