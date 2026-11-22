# 0257 · Buchungssatz auf dem Handy: eine Karte je Zeile (F783 M2)

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/journal-entry/` (JournalEntryEditor, JournalEntryGrid, JournalEntryCard `.v2je`), `v3.css` |
| Klassen-Test | nein: Soll/Haben, BU, Belegfeld sind DATEV, also Entität |
| Quelle | ll-dev96 2026-11-22: In der Buchungs-Einzelansicht der Abnahme (App, 390 × 844) scrollen `div.v3bkr__entry` und `div.bse__tbl` zur Seite. Das ist der letzte seitliche Scroll der App auf dem Handy. F783: „auf dem Handy scrollt keine Tabelle seitlich“ |
| Ersetzt | – (Ergänzung zu 0253) |
| Blockiert | F783 M2 Abnahme „kein seitlicher Scroll“ |
| Spec von / am | designsystem, 2026-11-22 |

## Ziel

Den Buchungssatz liest die Sachbearbeiterin in der Abnahme auf dem Handy, bevor sie „Übernehmen“ tippt. Dafür muss sie Soll/Haben, Konto und Betrag jeder Zeile auf einen Blick sehen. Heute hat das Raster eine Mindestbreite von etwa 700 px (`journalGridTracks`) und scrollt seitlich, sodass Betrag und Konto nie zugleich zu sehen sind. Unter 640 px Fensterbreite wird jede Zeile deshalb eine Karte. Am Desktop und auf dem Tablet ändert sich nichts.

## Einordnung

- **Erweitern** (§3 Regel 2): `JournalEntryEditor` (lesen und bearbeiten) und `JournalEntryGrid` (lesen) teilen sich `.bse__tbl`/`.bse__head`/`.bse__cells`. Die Karte kommt als CSS auf demselben Markup. Dazu bekommt jede Zelle eine Rolle (`data-cell`) und ihr Wort für die Karte. Neue Props gibt es nicht.
- **Wort:** dieselbe Klasse wie in 0255, `.v2tbl__cardlabel`. Sie bedeutet „Wort, das nur in der Kartenform erscheint“ und gilt hier, gesteuert von der Medienabfrage statt vom Container.
- **Zwei Formen, weil Lesen und Bearbeiten verschiedene Aufgaben sind:**
  - **Lesen** (`JournalEntryGrid`, Editor ohne `editable`) als Karte. Zeile 1: S/H · Konto mit Name, der Rest der Zeile · Umsatz rechtsbündig. Zeile 2 klein, je mit Wort: Datum · BU · Belegfeld 1 · (Belegfeld 2) · Text · (Währung, KOST). Die Ordnung kommt aus CSS (`order`). Fokussierbar sind dort nur Verweise (Kontenblatt, BU), und eine abweichende Lesereihenfolge kostet wenig.
  - **Bearbeiten** (Editor mit `editable`) als Formular in **DATEV-Reihenfolge = DOM-Reihenfolge**: Datum · (Währung) · Umsatz · S/H · BU · Konto · Belegfeld 1 · (Belegfeld 2) · Text · (KOST) · Aktion. Die Felder brechen um, jedes mit Wort; Konto und Text nehmen eine ganze Zeile. Kein `order`, damit Tab der sichtbaren Folge entspricht (WCAG 2.4.3).
- **Label-in-Name (WCAG 2.5.3):** Das sichtbare Wort steckt im Namen des Felds.
  - „Datum“ steckt in „Buchungsdatum“, „Umsatz“, „Konto“ und „Text“ in „Buchungstext“, „KOST“ in „KOST 1“.
  - Abweichend gilt: Die Karte schreibt „Belegfeld 1/2“ statt „Beleg 1/2“ und „Währung“ statt „Whg.“.
  - Das Feld „Steuerschlüssel“ heißt künftig „BU-Schlüssel“, weil das Wort der Karte „BU“ ist. Der Name ändert sich damit auch am Desktop, die Pixel nicht.

## Schnittstelle

Keine neue Prop. Neu im Markup:

| Was | Wo | Bedeutung |
|---|---|---|
| `data-cell="date \| currency \| amount \| side \| taxKey \| account \| doc1 \| doc2 \| text \| cost \| action"` | jede Zelle von `.bse__cells` (Editor und Grid). Der Kopf braucht keine Rollen, er ist auf dem Handy ausgeblendet | Rolle der Zelle für die Ordnung der Karte; ersetzt die Position, die mit `full` wechselt |
| `.v2tbl__cardlabel` in den Zellen | Editor und Grid; Wörter aus `JOURNAL_CELL_WORD` (`journal-entry.ts`) | das Wort, nur unter 640 px sichtbar. Beim Lesen steht es nicht über einem leeren Wert (wie 0255, M2) |
| `.bse__f` | Hülle jedes Felds im Editor beim Bearbeiten | `display: contents` über 640 px (das Feld bleibt die Zelle des Rasters); darunter Feld mit Wort darüber. Die Aktionszelle bleibt ohne Hülle, weil sie die klebende letzte Zelle des Rasters ist |

Unter 640 px:

- `.bse__head` ist ausgeblendet, weil die Wörter an den Werten stehen.
- `.bse__cells` ist `flex` mit Umbruch. Beim Lesen sind die Rollen geordnet wie oben, beim Bearbeiten in DOM-Reihenfolge.
- `.bse__tbl` hat keine Mindestbreite und scrollt nicht.
- Die Felder des Editors haben eine feste Grundbreite: Datum, Umsatz, S/H und BU je etwa eine halbe Zeile, Konto und Text eine ganze. Die Aktionszelle ist nicht mehr klebend.

Dazu, beim Bau gefunden (beides lag in `.v3bkr__entry` und scrollte):

- **`.v2je` (JournalEntryCard, Journal unter dem Satz):** Die Stufe unter 640 px braucht mit BU-Spalte noch 398 px. Neu ist eine zweite Stufe unter 420 px Breite der Karte: Konto, Soll und Haben in Zeile 1, der Buchungstext in Zeile 2 über die ganze Breite. Sie greift auf die letzten drei Zellen jeder Zeile, die immer Text, Soll und Haben sind, auch im Kopf und in der Summe. Sie gilt nur unter 1280 px Fenster, damit eine schmale Karte am Desktop bleibt, wie sie ist.
- **`.bse__foot`** bricht unter 640 px um („Speichern & freigeben“ lief über den Fall hinaus).

Zugängliche Namen (2.5.3, sichtbares Wort im Namen):

- Der S/H-Schalter hieß englisch „Side: Soll“ und heißt jetzt „S/H: Soll“ bzw. „S/H: Haben“.
- Der BU-Auswahl heißt „BU-Schlüssel“ statt „Steuerschlüssel“.

Kann bewusst nicht: Die Zeilen der Gegenseite (`.bse__contra`) und die Summen bleiben, wie sie sind. Sie brechen schon heute um.

## Stories

Keine neue Story. Gemessen wird bei 390 an:

- `JournalEntryGrid` `Simple`, `Full`, `InUse`, `Edges`
- `JournalEntryEditor` `S1_EditWithWarning`, `S2_SplitFull`, `DraftByHand`, `S24_ConfirmedWithRationale`
- `BookingReview` `CaseEditable`, `RoutineCase`, `InUse`, `ExpenseWithPayment`. Sie zeigen `.v3bkr__entry` mit Buchungssatz und Journal.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build`, Wächter grün (`check:classes` ohne neue Befunde)
- [ ] Code englisch; kein Hex, kein px in TSX
- [ ] Im Browser angesehen

Variabel (390 × 844, 820 × 1180, 1440 × 900):

1. **Desktop unverändert:** `png-diff` über die 37 Stories von 0253 endet mit Exit 0. Dazu kommen die 11 Vergleichsbilder vor dem Bau in `.playwright-mcp/f783-0257-base/` (Grid, Editor, BookingReview bei 1440), ebenfalls Exit 0. Weicht nur `appshell--in-use` im Verlauf der Seitenleiste ab, dreimal neu aufnehmen (bekanntes Flackern, siehe 0255).
2. **Kein seitlicher Scroll** bei 390 in den genannten Stories: `.bse__tbl`, `.v3bkr__entry` und das Dokument je `scrollWidth <= clientWidth`.
3. **Lesen (Grid, Editor ohne `editable`):**
   - In jeder Karte liegen S/H, Konto und Umsatz auf einer Linie, der Umsatz rechts.
   - Datum, BU, Belegfeld und Text stehen darunter, je mit Wort.
   - Gleiche Lage in allen Zeilen.
4. **Bearbeiten bei 390:**
   - Jedes Feld ist bedienbar, keins schmaler als 64 px, keins abgeschnitten, jedes mit sichtbarem Wort.
   - Die Aktion der Zeile ist erreichbar.
   - Die sichtbare Folge der Felder (oben nach unten, links nach rechts) entspricht der Tab-Folge.
5. **Label-in-Name:** Das sichtbare Wort jedes Felds steckt in seinem zugänglichen Namen.
6. **Bei 820 und 1440** stehen Raster und Kopf wie zuvor, und die Wörter sind `display: none`.

## Nachtrag 2026-11-22 (nach der ersten Abnahme, vom Spec-Autor)

Behoben, gemessen bei 390:

- **M1:** Das Raster übergibt jedes optionale Feld als `?? ""`. Ein fehlendes Feld zählt dann als leer, und kein Wort steht ohne Wert (`Full`, `Edges`: 0).
- **M2:** Beim Lesen schließen Währung und KOST Zeile 2 ab (`order: 3`). Die Folge ist S/H · Konto · Umsatz | Datum · BU · Belegfeld · Text · Währung · KOST.
- **M3:** Die Hülle der Story `BookingReview/InUse` hat `maxWidth: 728` statt `width: 728`. Bei 1440 bleibt das Bild gleich, bei 390 ist das Dokument 390 px breit.

Hinweise:

- **H1:** `.bse__top` bricht unter 640 px um („Einfach“ wird nicht mehr abgeschnitten).
- **H2:** Eine leere Aktionszelle ist beim Lesen weg, der Umsatz schließt bündig ab.
- **H3:** Die Wörter stehen in `--font-sans`, auch an Mono-Werten.
- **H5:** „Zeile entfernen“ misst unter 640 px 24 × 24.
- **H6:** Die Stufe von `.v2je` unter 420 px hat 84 px statt 88 px je Betrag und braucht 256 px (InFoldout 258 px: passt).
- **H7:** `calc(var(--space-1) / 2)` statt `2px`.
- **H4** (Vorschlagsliste des Kontofelds im Tab-Weg) gehört nicht zu 0257, am Desktop ist es genauso.
- **H8 (Nachprüfung, nach ihr umgesetzt):** In der Stufe unter 420 px eröffnet BU Zeile 2 vor dem Text (Spalte 1, 64 px) und steht nicht mehr in einer 2-px-Spur neben den Beträgen. Gemessen bei 390 in `InFoldout` und `RoutineCase`: BU und Text auf einer Höhe, Soll/Haben darüber, kein Überlauf.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: Wächter und Build | `pnpm typecheck`, `check:type`, `check:icons`, `check:when`, `check:language` je Exit 0 · `check:classes` Exit 1 mit genau den vier Altfunden (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), kein neuer; `.bse__f` hat seine Regel · `pnpm build` Exit 0 („Storybook build completed successfully“) | ✓ |
| Fest: Code englisch, kein Hex, kein px in TSX | Diff in `JournalEntryEditor.tsx`, `JournalEntryGrid.tsx`, `journal-entry.ts`: Bezeichner, Typ `JournalCell`, `Word`, `Field` und Kommentare englisch; Deutsch nur in sichtbaren Strings (`JOURNAL_CELL_WORD`, `aria-label`). Kein Hex, kein neues px in TSX | ✓ |
| Fest: im Browser angesehen | Playwright-MCP gegen Storybook 6118 bei 390 × 844, 820 × 1180, 1440 × 900. Bilder in `.playwright-mcp/f783-0257-review-37/`, `-review-11/`, `-review-390/`, `-review-820-head/`, `-review-820-now/`. Konsole ohne Fehler und Warnungen (nur `favicon.ico` 404 der beiden eigenen Vergleichsserver) | ✓ |
| Schnittstelle | `data-cell` an jeder Zelle von `.bse__cells`, in Grid und Editor, lesend und bearbeitend: in allen 31 Stories von Grid, Editor und BookingReview keine Zelle ohne Rolle. `.bse__f` über 640 px `contents`. Unter 640 px: `.bse__head` `none`, `.bse__cells` `flex`, Aktionszelle `static`. `aria-label` „S/H: Soll“ und „BU-Schlüssel“. **M1 Wort über leerem Wert:** Im Grid stehen „Belegfeld 2“ und „KOST“ vor nichts: in `Full` in 1 von 2 Zeilen, in `Edges` in 4 von 5, ebenso in `BookingReview/ListFull`. Die Spec sagt: „Beim Lesen steht es nicht über einem leeren Wert“. Ursache: `of={row.externalDocumentNumber2}` und `of={row.costCenter1}` sind `undefined`, wenn das Feld fehlt, und `Word` liest `undefined` als „keine Bedingung“. **M2 Ordnung der Zeile 2:** Die Spec ordnet beim Lesen „Datum · BU · Belegfeld 1 · (Belegfeld 2) · Text · (Währung, KOST)“ und sagt dazu „Beim Lesen sind die Rollen geordnet wie oben“. Gemessen in `Full` bei 390: Datum › Währung › BU › Belegfeld 1 › Belegfeld 2 › Text › KOST. Alle Zellen der Zeile 2 haben `order: 2`, also gilt die DOM-Folge, und Währung steht an zweiter Stelle statt am Ende | ✗ |
| 1 Desktop unverändert | Neu aufgenommen nach Vorschrift (1440 × 900, `fullPage`, `animations: "disabled"`, Maus 0,0, 600 ms nach `networkidle`, Aufwärm-Story vorab). `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-0257-review-37 0.5` → Exit 0, 37 × ✓, höchstens 0,001 %. `node scripts/png-diff.mjs .playwright-mcp/f783-0257-base .playwright-mcp/f783-0257-review-11 0.5` → Exit 0, 11 × ✓, höchstens 0,004 % (`s-1-edit-with-warning`). `appshell--in-use` 0,000 %, keine Wiederholung nötig | ✓ |
| 2 Kein seitlicher Scroll bei 390 | 11 von 12 Stories: `.bse__tbl`, `.v3bkr__entry` und das Dokument je `scrollWidth = clientWidth` (Grid 284/284, Editor 320/320, `CaseEditable` Satz 324/324 und Eintrag 356/356, `RoutineCase` 284/284, `ExpenseWithPayment` 3 × 284/284, Dokument je 390/390). Im Journal (`.v2je`) greift die Stufe unter 420 px. In sechs Stories gemessen: nichts überlappt, nichts liegt außerhalb der Karte. **M3:** In `BookingReview/InUse` misst das Dokument 744/390. `.bse__tbl` (694/694) und `.v3bkr__entry` (726/726) scrollen nicht. Ursache ist die Hülle der Story, `<div style={{ width: 728 }}>`, so breit wie die App bei 1280 px. Die Handykarte steht darin 694 px breit. Vor dem Bau war das schon so, aber die Spec nennt `InUse` und das Dokument ausdrücklich | ✗ |
| 3 Lesen | Grid `Simple`, `Full`, `InUse`, `Edges` (11 Zeilen), Editor `S24` und `BookingReview/InUse`, je lesend. In jeder Karte liegen S/H, Konto und Umsatz auf einer Linie, in dieser Folge. Der Umsatz steht rechts: im Grid bündig, im Editor 8 px vor dem Rand (H2). Datum, BU, Belegfeld 1 und Text stehen darunter, je mit sichtbarem Wort in `--color-text-subtle` (rgb 113, 113, 113). S/H steht in allen Zeilen bei x 0, der Umsatz endet in allen Zeilen einer Karte am selben Rand. Ein langer Kontoname bekommt eine Ellipse („Reparaturen und In…“), der Umsatz bleibt stehen | ✓ |
| 4 Bearbeiten bei 390 | Gemessen in `S1`, `S2` (2 Zeilen), `DraftByHand` und `BookingReview/CaseEditable`. Jedes Feld hat ein sichtbares Wort darüber (`block`). Die schmalsten Felder sind 156 px breit (Datum, Umsatz, S/H, BU, Belegfeld 1/2), Konto und Text 320 px, die Höhen 27–31 px. Kein Feld ragt aus der Karte, kein Eingabefeld läuft über (`scrollWidth ≤ clientWidth`). Die Aktion „Zeile entfernen“ (`S2`) ist `position: static`, 13 × 13, liegt in der Karte und ist per Tab erreichbar. In allen fünf Zeilen entspricht die Tab-Folge der sichtbaren Folge: Datum › (Währung) › Umsatz › S/H › BU › Konto › Belegfeld 1 › (Belegfeld 2) › Text › (KOST) › Aktion. Im Konto führt Tab zuerst durch die offene Vorschlagsliste (H4) | ✓ |
| 5 Label-in-Name | Namen über CDP `Accessibility.getPartialAXTree` in denselben vier Stories: „Datum“ → „Buchungsdatum“, „Währung“ → „Währung“, „Umsatz“ → „Umsatz“, „S/H“ → „S/H: Soll“ (auch der sichtbare Wert „S“ steckt darin), „BU“ → „BU-Schlüssel“, „Konto“ → „Konto“, „Belegfeld 1“ → „Belegfeld 1“, „Belegfeld 2“ → „Belegfeld 2“, „Text“ → „Buchungstext“, „KOST“ → „KOST 1“. Bei keinem Feld fehlt das Wort | ✓ |
| 6 Bei 820 und 1440 | In sieben Stories: `.bse__head` `grid` 26 px, `.bse__cells` `grid` mit denselben Spuren wie der Kopf, `.bse__f` `contents`. Alle `.v2tbl__cardlabel` (bis 35 je Story) sind `display: none`, Breite 0. Das Dokument misst 820/820 und 1440/1440. Bei 1440 pixelgleich, siehe 1. Für 820 gab es kein Bild von vor dem Bau. Daher wurden HEAD (`git archive`) und der Arbeitsbaum je als statisches Storybook gebaut und 12 Stories bei 820 verglichen: 9 × 0,000 %, `Edges` 0,117 %, `BookingReview/InUse` 0,111 %, `ExpenseWithPayment` 0,001 %. Die größte Abweichung eines Farbkanals ist 1 von 255, also unsichtbar. Das `.v2je` ist bei 820 mindestens 698 px breit, die Stufe unter 420 px greift dort nicht | ✓ |

**H1 `Edges` bei 390, schon vor dem Bau so (an HEAD gemessen):** Im Kartenkopf `.bse__top` reicht „Einfach“ bis x 388, über den Kartenrand (x 337) hinaus, und wird abgeschnitten. Das liegt außerhalb von `.bse__tbl` und zählt nicht zu Kriterium 2. Es ist aber ein seitlicher Überlauf in einer genannten Story.

**H2 Umsatz in der Lesekarte des Editors:** Er endet 8 px vor dem Rand, im Grid dagegen bündig. Ursache: Die leere Aktionszelle (0 × 0, `order: 0`) steht nach dem Umsatz und bekommt `column-gap`. Außerdem fehlt dort das „€“, das war schon vor dem Bau so.

**H3 Schrift der Wörter:** „Belegfeld 1/2“ erbt im Grid `.v2mono` (JetBrains Mono), alle anderen Wörter stehen in Inter.

**H4 Kontofeld:** Beim Fokus öffnet sich die Vorschlagsliste, und Tab läuft durch ihre Optionen (`button role="option"`), bevor Belegfeld 1 kommt. Am Desktop ist das genauso, es gehört nicht zu 0257. Für Kriterium 4 zählen die Felder.

**H5 „Zeile entfernen“ misst 13 × 13.** Die Ausnahme über den Abstand (WCAG 2.5.8) hält: 14,5 px zum nächsten Ziel, nötig sind 12. Für den Daumen ist die Fläche klein.

**H6 Nicht genannt, aber gefunden:** `BookingReview/InFoldout` bei 390, `.v3bkr__entry` 264/258 (vor dem Bau 398/258). Die Stufe unter 420 px braucht mindestens 64 + 88 + 88 + 3 × 8 = 264 px.

**H7** In der neuen CSS stehen `row-gap: 2px` und `gap: 2px` statt eines Tokens. Das Kriterium „kein px in TSX“ betrifft das nicht.

**Zu M1–M3, als Richtung, nicht als Vorgabe:**

- **M1:** `of={row.externalDocumentNumber2 ?? ""}` und `of={row.costCenter1 ?? ""}`. Oder `Word` unterscheidet „`of` nicht übergeben“ von „`of` leer“.
- **M2:** `currency` und `cost` bekommen beim Lesen eine spätere `order` als Text. Oder ein datierter Nachtrag, der die DOM-Folge zur Regel macht.
- **M3:** In `InUse` `maxWidth: 728` statt `width: 728`. Bei 1440 bleibt das Bild gleich, weil die Fläche breiter ist. Oder ein datierter Nachtrag, der `InUse` vom Dokumentmaß ausnimmt.

Danach Kriterium 2 und die Schnittstelle bei 390 neu messen, dazu Kriterium 1 für `InUse` und Grid.

Abgenommen von / am: fremder Abnehmer (Agent), 2026-11-22 · Offene Punkte: M1 und M2 (Schnittstelle), M3 (Kriterium 2). H1–H7 sind Hinweise.

### Nachprüfung 2026-11-22

Geprüft gegen den Nachtrag vom 2026-11-22: `JournalEntryGrid.tsx` (`?? ""`), `BookingReview.stories.tsx` (`maxWidth: 728`) und `v3.css` (`order: 3`, `:empty`, `--font-sans`, 24 × 24, `.bse__top` mit Umbruch, `.v2je` mit 84 px, `calc(var(--space-1) / 2)`). Bilder in `.playwright-mcp/f783-0257-recheck-37/`, `-recheck-11/`, `-recheck-390/`, `-recheck-820/`.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: Wächter und Build | `pnpm typecheck`, `check:type`, `check:icons`, `check:when`, `check:language` je Exit 0 · `check:classes` Exit 1 mit genau den vier Altfunden, kein neuer · `pnpm build` Exit 0 („Storybook build completed successfully“) · Konsole ohne Fehler und Warnungen | ✓ |
| Fest: Code englisch, kein Hex, kein px in TSX | Neue Zeilen in `JournalEntryGrid.tsx` (`?? ""`, Kommentar englisch) und `BookingReview.stories.tsx` (`maxWidth: 728`). Kein Hex, kein px in TSX | ✓ |
| Schnittstelle M1 | Wörter über leerem Wert bei 390, gezählt in allen Lesezeilen: `Full` 0, `Edges` 0, `BookingReview/ListFull` 0. Vorher waren es 2, 8 und 2. `Full` Zeile 1 zeigt Belegfeld 1, Text und Währung, „Belegfeld 2“ und „KOST“ fehlen dort | ✓ |
| Schnittstelle M2 | Folge (oben nach unten, links nach rechts) in `Full` Zeile 2: S/H › Konto › Umsatz › Datum › BU › Belegfeld 1 › Belegfeld 2 › Text › Währung › KOST. Ebenso in `Edges`, `ListFull` und `BookingReview/InUse`. Währung und KOST schließen die Zeile ab | ✓ |
| 1 Desktop unverändert | Neu aufgenommen nach Vorschrift. `node scripts/png-diff.mjs .playwright-mcp/f783-base .playwright-mcp/f783-0257-recheck-37 0.5` → Exit 0, 37 × ✓, höchstens 0,001 % (`clarificationcard--step`). `node scripts/png-diff.mjs .playwright-mcp/f783-0257-base .playwright-mcp/f783-0257-recheck-11 0.5` → Exit 0, 11 × ✓, höchstens 0,002 % (`s-2-split-full`). `BookingReview/InUse` mit `maxWidth` 0,000 %, `appshell--in-use` 0,000 % | ✓ |
| 2 Kein seitlicher Scroll bei 390 | In allen 12 genannten Stories sind `.bse__tbl`, `.v3bkr__entry` und das Dokument je gleich breit wie ihr Inhalt. `InUse` misst jetzt: Dokument 390/390, Satz 324/324, Eintrag 356/356. Kein Element mit `overflow` `auto` oder `scroll` läuft über. Dazu `InFoldout`: Eintrag 258/258, `.v2je` 258/258 (H8) | ✓ |
| 3 Lesen | Neu gemessen: In `Edges` liegen in 5 von 5 Zeilen S/H, Konto und Umsatz auf einer Linie, in dieser Folge. Der Umsatz ist bündig (0 px) im Grid und jetzt auch im Editor (`S24`, `BookingReview/InUse`) | ✓ |
| 4 Bearbeiten bei 390 | `S2`, beide Zeilen. Tab-Folge: Datum › Währung › Umsatz › S/H › BU › Konto › Belegfeld 1 › Belegfeld 2 › Text › KOST › Aktion, gleich der sichtbaren Folge. Die Aktion misst 24 × 24 und liegt in der Karte | ✓ |
| 5 Label-in-Name | Die Namen in `JournalEntryEditor.tsx` sind seit der ersten Abnahme unverändert (Buchungsdatum, Währung, Umsatz, „S/H: …“, BU-Schlüssel, Konto, Belegfeld 1/2, Buchungstext, KOST 1). Der Nachtrag ändert keine Namen | ✓ |
| 6 Bei 820 und 1440 | 1440 siehe Kriterium 1. 820: 12 Stories gegen denselben HEAD-Build wie in der ersten Abnahme, `png-diff … 0.5` → Exit 0, dieselben Werte (höchstens 0,117 %, Farbkanal höchstens 1 von 255). Der Umbruch von `.bse__top` gilt nur unter 640 px, die Stufe von `.v2je` nur unter 420 px Kartenbreite | ✓ |

Hinweise aus der ersten Abnahme:

- **H1 ✓:** `.bse__top` bricht um, in allen Stories mit Kopf 284/284 bis 324/324. „Einfach“ endet am Kartenrand (0 px darüber), in `Edges` steht es mit „Rest“ in Zeile 2.
- **H2 ✓:** Der Umsatz ist im Editor jetzt bündig.
- **H3 ✓:** Alle sichtbaren Wörter stehen in Inter, auch „Belegfeld 1/2“.
- **H5 ✓:** „Zeile entfernen“ misst 24 × 24, das nächste Ziel ist 20 px entfernt.
- **H7 ✓:** In der CSS steht `calc(var(--space-1) / 2)`.
- **H4:** Bleibt offen und gehört nicht zu 0257.

**H8 (neu, zu H6):** `InFoldout` passt, aber nur knapp. Bei 258 px bleibt für die BU-Spur (`minmax(0, 1fr)`) 2 px Breite. „401“ ragt aus ihr heraus und steht 4–5 px vor dem Soll-Betrag statt 8 px. Nichts überlappt, weil die Beträge rechtsbündig stehen. Ein längerer BU-Inhalt („Automatik 19 %“) oder ein fünfstelliger Betrag würde in dieser Breite stoßen.

Abgenommen von / am: fremder Abnehmer (Agent), 2026-11-22 · Offene Punkte: keine. H4 und H8 sind Hinweise.
