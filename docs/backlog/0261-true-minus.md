# 0261 · Echtes Minus in allen Zahlen

| | |
|---|---|
| Status | fertig |
| Stufe | `src/ui/v3/format.ts` und die Stellen, die eine Zahl selbst formatieren; keine neue Komponente |
| Klassen-Test | ja: das Vorzeichen einer Zahl ist in jeder App dieselbe Frage |
| Quelle | Owner 2026-11-23: „echt minus zeichen bitte“ (Antwort auf die Frage, ob CLAUDE.md an 0100 angeglichen werden soll) |
| Ersetzt | die Streichung in 0100 („U+2212 wäre eine eigene Formatierung und wurde in der Freigabe gestrichen“) |
| Blockiert | nichts |
| Spec von / am | designsystem, 2026-11-23 |

## Ziel

CLAUDE.md (§2 Sprache) verlangt das „echte Minus vor der Zahl“. `formatAmount` schreibt aber den Bindestrich, den `Intl` für `de-DE` liefert (U+002D). Die Freigabe zu 0100 hatte das so belassen. Der Owner hat am 2026-11-23 entschieden: **echtes Minus (U+2212)**.

Viele Fixtures schreiben es heute schon von Hand („−4,76 €“, „−31 %“). Die Zellen daneben zeigen den Bindestrich. In derselben Tabelle sehen zwei Minus also verschieden aus.

Gründe für das echte Minus:

- Der Bindestrich ist kürzer und steht tiefer als das Plus.
- Vorlesehilfen sprechen U+2212 als „minus“. Den Bindestrich lassen sie aus oder lesen „Bindestrich“.

## Einordnung

- **Kein neuer Baustein.** Das Minus entsteht an genau einer Stelle: `format.ts`. Jede Stelle, die heute an `format.ts` vorbei selbst formatiert und dabei negative Werte sehen kann, wird auf `format.ts` umgestellt. Danach gibt es keine zweite Quelle mehr (T7).
- Kein neues Wort, kein neuer Token, keine Farbe. A7 bleibt: Das Vorzeichen trägt keine Farbe.

## Schnittstelle

Keine neue Prop, keine geänderte Signatur. Es ändert sich, was die Funktionen zurückgeben:

| Stelle | Vorher | Nachher |
|---|---|---|
| `formatAmount(-1249.9, "EUR")` | `-1.249,90 €` (U+002D) | `−1.249,90 €` (U+2212) |
| `formatAmount(-0.5, null)` | `-0,50` | `−0,50` |
| `formatAmount(-0, "EUR")` und `formatAmount(-0.001, "EUR")` | `-0,00 €` | `0,00 €` (eine Null hat kein Vorzeichen) |
| `formatAmount(5, "EUR", true)` | `+5,00 €` | unverändert |
| `formatCount(-3)` | `-3` | `−3` |
| `formatPercent(-7.5, 1)` | `-7,5 %` | `−7,5 %` |
| `parseAmount("−1.234,56")` | `"invalid"` | `-1234.56` |
| `parseAmount("−1.234,56 €")`, `parseAmount("1.234,56 €")` | `"invalid"` | `-1234.56`, `1234.56` |

`parseAmount` liest also künftig das echte Minus und ein Währungszeichen oder einen dreibuchstabigen Währungscode am Ende (`€`, `$`, `CHF`).

Grund für das Währungszeichen: Das Feld `AmountInput` zeigt nach dem Verlassen den formatierten Wert mit Währung, zum Beispiel „1.234,56 €“. Verlässt man es ein zweites Mal ohne Änderung, meldet es heute „Betrag nicht lesbar“, weil `parseAmount` das `€` nicht kennt. Mit dem echten Minus käme ein zweiter solcher Fall dazu. Beides wird in einem Zug behoben.

Umgestellt auf `format.ts`:

| Datei | Heute | Künftig |
|---|---|---|
| `primitives/AmountInput.tsx` | lokale Funktion `format` (eigenes `Intl.NumberFormat`) | `formatAmount(value, currency)` |
| `primitives/Cells.tsx`, `DeviationCell` | eigenes `Intl.NumberFormat` + `" %"` | `formatPercent(pct)` (das Vorzeichen `+` bleibt davor) |
| `patterns/ComparisonTable.tsx` | `NUM` (eigenes `Intl.NumberFormat`) | `formatCount` |
| `entities/source-document/source-document-detail.ts` | `originalGross.toLocaleString(...)` | `formatAmount(originalGross, null)` + Code |
| `entities/journal-entry/ReviewReasonCell.tsx` | schreibt `"−"` von Hand vor `formatCount(Math.abs(n))` | `formatCount(n)` |
| `showcase/document-list/DocumentListFilters.tsx`, `showcase/case/collective-scenarios.tsx` | lokales `euro()` mit `toLocaleString` | `formatAmount(n, null)` |

**Bewusst nicht:**

- `primitives/RawRecord.tsx` bleibt bei seiner Gruppierung. Das ist die Technik-Sicht auf den gespeicherten Wert, kein Betrag für Lesende.
- `src/ludwig/` bleibt eingefroren. Dass `parseGermanAmount` das echte Minus verliert und aus „−5“ die Zahl 5 macht, ist ein Befund für die App (L-384). `parseAmount` setzt das Minus deshalb selbst um, bevor es weitergibt.
- Exporte (DATEV-CSV, Dateinamen) sind Maschinenformate. Sie dürfen `formatAmount` nicht lesen, sonst liest Excel oder DATEV den Wert als Text. Das ist ein Befund für die App (L-385). Das Set hat keinen Export.

## Verhalten

- Am Bildschirm ist das Minus etwas länger als bisher und steht auf der Höhe des Plus. Beträge bleiben rechtsbündig mit `tnum`. Das Minus steht links vor der Zahl, die rechte Kante bewegt sich nicht.
- Das Feld zeigt nach dem Verlassen dasselbe Minus wie die Zelle daneben. Getippt wird weiter der Bindestrich; beide Zeichen werden gelesen.
- Keine Farbe, kein Hover, kein Fokus betroffen.

## Stories

Keine neue Story. Nachweis in den vorhandenen Stories mit negativen Werten und mit einem Prüfbefehl:

- `pnpm check:format` (neu, `scripts/check-format.mjs`): lädt `format.ts` und prüft die Tabelle oben für `formatAmount`, `formatCount` und `formatPercent`. Exit 1 bei Abweichung.

## Ausbau

Keiner. Wird das Minus in die Zwischenablage kopiert, liest Excel „−1.234,56“ als Text. Ein Kopier-Haken, der beim Kopieren auf den Bindestrich umstellt, wäre der Weg dagegen. Gebaut wird er erst, wenn sich jemand beschwert.

## Befunde für `ludwig/app`

- **L-384:** `parseGermanAmount` (`shared/money.ts`) entfernt alles außer `0-9.,-`, also auch U+2212. „−1.234,56“ wird zu +1234,56, das Vorzeichen kippt still.
- **L-385:** `formatMoney` und `fmtEuro` in `shared/money.ts` schreiben den Bindestrich. Exporte müssen beim Bindestrich bleiben.

## Abnahmekriterien

Fest:

- [ ] `pnpm typecheck`, `pnpm build`, Wächter grün (`check:classes` ohne neue Befunde, `check:language`, `check:type`)
- [ ] Im Browser angesehen

Variabel:

1. `pnpm check:format` endet mit Exit 0, und jede Zeile der Tabelle „Schnittstelle“ für `formatAmount`, `formatCount`, `formatPercent` ist darin geprüft. Gegenprobe: Wird in `format.ts` das Ersetzen auskommentiert, endet der Befehl mit Exit 1.
2. In den Stories `v3/Primitives/Tabelle/Cells` (Betrag negativ, `DeviationCell` −31 %) und mindestens einer Story einer Entität mit negativem Betrag (z. B. Bankumsatz) steht vor negativen Werten U+2212. Gemessen wird über den Code-Punkt des Textes, nicht über das Bild. Es gibt keinen U+002D vor einer Ziffer in einer Zelle mit `.v2num`.
3. Das Minus kommt aus der Seitenschrift, nicht aus einer Ersatzschrift. Die Breite von „−“ ist in `--font-sans` mit `tnum` gemessen und ≤ der Breite einer Ziffer. Die rechte Kante negativer und positiver Beträge in derselben Spalte liegt gleich (Abweichung 0 px).
4. `AmountInput`, Rundlauf in seiner Story:
   - „-1234,5“ tippen und das Feld verlassen: Es zeigt „−1.234,50 €“ (bei `allowNegative`).
   - Ein zweites Mal hinein- und hinausgehen ohne Änderung: Es erscheint kein Fehler, und `onChange` wird nicht erneut gerufen.
   - „−5“ einfügen (U+2212): Bei `allowNegative` wird der Wert −5. Ohne `allowNegative` erscheint „Negative Beträge sind hier nicht vorgesehen.“ und nicht „Betrag nicht lesbar“.
5. `parseAmount("12abc")` bleibt `"invalid"`. Kleinbuchstaben und Text nach der Zahl sind keine Währung.
6. Die sechs umgestellten Stellen aus der Tabelle „Umgestellt“ formatieren nicht mehr selbst. `grep` nach `Intl.NumberFormat` und `toLocaleString` in `src/ui` und `src/showcase` findet nur noch `format.ts`, `RawRecord.tsx`, Zähler in `ClientYearPage.tsx` (ohne Vorzeichen) und die Rohzeilen einer importierten XLSX in `SourceDocumentPreview.stories.tsx` (fremde Daten, wie die Bank sie liefert). Dazu kommen höchstens Kommentare.
7. Doku: `docs/design-guidelines.md` T7 nennt das echte Minus mit Owner und Datum. 0100 trägt einen datierten Nachtrag, dass die Streichung aufgehoben ist. `docs/befunde-app.md` führt L-384 und L-385.

## Nachtrag 2026-11-23 (nach der Abnahme, vom Spec-Autor)

Kein Kriterium ändert sich.

- H1 ist behoben: Die Fixture in `CasePicker.stories.tsx` schreibt jetzt „−1.249,90 €“.
- H2 steht in L-385: `betrag` in `beleg-name.ts` liegt im eingefrorenen Spiegel und wird in der App umgestellt.
- H4 bleibt bewusst: Drei Großbuchstaben am Ende gelten als Währungscode. Ein Tippfehler wie „12 ABC“ ergibt 12. Kleinbuchstaben und Wörter bleiben „nicht lesbar“.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Fest: `pnpm typecheck`, `pnpm build`, Wächter grün | `pnpm typecheck` Exit 0 · `pnpm build` Exit 0 („Storybook build completed successfully“) · `pnpm check:language` ok (0 deutsche Kommentarzeilen) · `pnpm check:type` ok (0 Altfunde) · `pnpm check:classes` Exit 1 nur mit den vier bekannten Altfunden `v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`, kein neuer Befund | ✓ |
| Fest: Im Browser angesehen | Storybook-Dev-Server :6118, Playwright bei 1280 × 900: `v3-primitives-tabelle-zellen--filled` per Screenshot angesehen (Minus und Plus gleich hoch, rechte Kante bündig), Messungen in den Zeilen 2–4; dazu Sammeldurchlauf über alle 1408 Stories des Index (`setCurrentStory` im iframe), 1407 gerendert, `referenz-f109-buchungsreview--review-flow` einzeln nachgeladen (ohne Text) | ✓ |
| 1 `check:format` Exit 0, jede Zeile geprüft, Gegenprobe Exit 1 | `pnpm check:format` → „check:format: 10 cases ok“, Exit 0. Im Skript stehen alle sieben Tabellenzeilen für `formatAmount`, `formatCount`, `formatPercent` (`-1249.9, "EUR"` · `-0.5, null` · `-0, "EUR"` · `-0.001, "EUR"` · `5, "EUR", true` · `formatCount(-3)` · `formatPercent(-7.5, 1)`), die Erwartungswerte per Code-Punkt gelesen: U+2212 vorn, U+00A0 vor `€` und `%`; dazu zwei positive Gegenwerte. Gegenprobe: in `format.ts` Z. 34 `const minus = (text: string) => text; // .replace(…)` → Exit 1 (`ERR_ASSERTION`, actual `-1.249,90 €`, expected `−1.249,90 €`). Danach aus Kopie zurückgestellt: SHA-256 `434cb705…` vorher = nachher, `git diff src/ui/v3/format.ts` byte-gleich (`cmp`), `check:format` wieder Exit 0 | ✓ |
| 2 U+2212 in Zellen-Story und Entitäts-Story, kein U+002D vor Ziffer in `.v2num` | `codePointAt` der gerenderten `.v2num`-Texte: `v3-primitives-tabelle-zellen--filled` `−1.800,00 €`, `−12,40 €` · `…zellen--deviation-scale` (`DeviationCell`) `−31 %` · `…zellen--currencies` `−2.609,15 €` · `…zellen--hints` und `…zellen--in-use` je U+2212. Entität: `v3-entitäten-kontoauszugsposition-banktransactionlist--filled` `−2.480,55 €`, `−89,90 €`, `−412,00 €`, `−1.249,90 €` · `…banktransactionrow--filled` `−1.249,90 €` · `…banktransactioncell--filled` `−1.249,90` — alle U+2212. U+002D vor einer Ziffer in `.v2num`: 0 in allen neun Stories. Die Story heißt heute `v3/Primitives/Tabelle/Zellen` (Datei `Cells.stories.tsx`). Sammeldurchlauf über alle Stories: U+002D vor Ziffer in `.v2num` nur in `v3-entitäten-beleg-sourcedocumentpreview--rows` (H3) | ✓ |
| 3 Minus aus der Seitenschrift, Breite ≤ Ziffer, rechte Kante 0 px | CDP `CSS.getPlatformFontsForNode` für einen Span nur mit „−“ in einer Betragszelle: `Inter-Regular`, `isCustomFont: true`, 1 Glyphe — keine Ersatzschrift; die geladene Inter-400-`FontFace` führt U+2212 in ihrer `unicode-range`. Berechnete Schrift der Zelle: `Inter, …`, 13,5 px, 400, `lining-nums tabular-nums`. Breite in der Zelle (`getBoundingClientRect`, mit tnum): „−“ 8,758 px, jede Ziffer 0–9 8,758 px → gleich. Rechte Textkante (Range über den Zelltext): `banktransactionlist--filled`, Betragsspalte, vier negative und `1.800,00 €` alle bei 1399,000 px; `zellen--filled`, Spalte Betrag, `64,90 €`, `−1.800,00 €`, `−12,40 €` alle bei 345,000 px → Abweichung 0 px | ✓ |
| 4 `AmountInput`-Rundlauf | Story `v3-primitives-formular-amountinput--signs`, Feld „Korrekturbetrag“ (`allowNegative`): „-1234,5“ getippt, Tab → `−1.234,50 €` (U+2212 … U+00A0 U+20AC), kein Fehler. Zweites Hinein und Hinaus ohne Änderung: Text gleich, kein Fehler, kein `aria-invalid`. „−5“ (U+2212) über die echte Zwischenablage eingefügt, Tab → `−5,00 €`. Feld „Nur positiv — versuchen Sie −5“ (ohne `allowNegative`): „−5“ eingefügt, Tab → „Negative Beträge sind hier nicht vorgesehen.“, `aria-invalid="true"`, nicht „Betrag nicht lesbar“. `onChange` gezählt mit demselben Modul `AmountInput.tsx` im Story-iframe, Spion als Callback: nach dem Tippen 1 Aufruf (−1234,5), nach dem zweiten Hinein und Hinaus weiter 1, nach „−5“ ein Aufruf mit −5; ohne `allowNegative` kein Aufruf | ✓ |
| 5 `parseAmount("12abc")` bleibt `"invalid"` | `parseAmount` im Browser (Modul vom Dev-Server): `"12abc"` → `"invalid"`; ebenso `"12 abc"`, `"12 Euro"`, `"12 eur"`, `"12€abc"`, `"12 EURO"` → `"invalid"`. Gegenwerte: `"−1.234,56"` → −1234,56 · `"−1.234,56 €"` → −1234,56 · `"1.234,56 €"` → 1234,56 · `"12 CHF"` → 12 | ✓ |
| 6 Die sechs Stellen formatieren nicht mehr selbst | `grep -rn` nach `Intl.NumberFormat` und `toLocaleString` in `src/ui` und `src/showcase`: nur `format.ts` (Z. 21, 22, 39, 78, 115, 130, 373; Z. 83 Kommentar), `RawRecord.tsx:35`, `Amount.tsx:8` (Kommentar), `SourceDocumentPreview.stories.tsx:251` (XLSX-Rohzeilen), `ClientYearPage.tsx:177–178` (Zähler ohne Vorzeichen). Im `git diff` rufen alle sechs Stellen der Tabelle „Umgestellt“ `formatAmount`, `formatPercent` oder `formatCount`; lokales `format`, `NUM`, `count` und `euro` mit `toLocaleString` sind weg | ✓ |
| 7 Doku: T7, Nachtrag in 0100, L-384/L-385 | `docs/design-guidelines.md` T7: „echtes Minus U+2212 vor der Zahl (`−1.234,56 €`, nie der Bindestrich; eine Null ohne Vorzeichen; Owner 2026-11-23, 0261)“. `0100-bank-transaction-cell.md`, Abschnitt „Das Vorzeichen ist die Richtung“: „seit 0261 … (Owner 2026-11-23). Die Streichung aus der Freigabe vom 2026-09-06 ist damit aufgehoben“ (Form siehe H5). `docs/befunde-app.md`: Zeilen L-384 und L-385 vorhanden. Dazu `docs/ton-und-sprache.md` Punkt 3 nachgezogen | ✓ |

Abgenommen von / am: fremder Abnehmer (Agent), 2026-11-23 · Offene Punkte: keine; die Hinweise H1–H6 reißen kein Kriterium.

- **H1** Die Fixture in `CasePicker.stories.tsx:229` schreibt „-1.249,90 €“ von Hand mit Bindestrich (`lw-numeric`, keine `.v2num`); sichtbar in `v3-entitäten-sachverhalt-casepicker--in-use`. Über `formatAmount` oder mit U+2212 schreiben.
- **H2** Die Themenzeile von `SourceDocumentReview` kommt aus `belegAnzeigename` (`src/ludwig/modules/source-docs/domain/beleg-name.ts:51–52`, eigenes `Intl.NumberFormat`) und zeigt „-4,76 €“ mit Bindestrich (`v3-entitäten-beleg-sourcedocumentreview--filled`, `--interactive`). `src/ludwig/` ist eingefroren; L-385 nennt bisher nur `formatMoney`, `fmtEuro` und `fmtMoney` — `belegAnzeigename` gehört dazu.
- **H3** `v3-entitäten-beleg-sourcedocumentpreview--rows` zeigt U+002D vor Ziffern in `.v2num`-Zellen („-1.450,00“). Das sind die XLSX-Rohzeilen, die Kriterium 6 ausdrücklich ausnimmt (fremde Daten); genannt, damit ein späterer Sammeldurchlauf es nicht als Verstoß liest.
- **H4** `parseAmount` nimmt drei beliebige Großbuchstaben am Ende als Währungscode („12 ABC“ → 12), nicht nur `CURRENCIES`. Deckt sich mit der Spec („dreibuchstabiger Währungscode“), ist harmlos.
- **H5** 0100 trägt die Aufhebung als datierte Neufassung des Absatzes in „Das Vorzeichen ist die Richtung“, nicht als eigenen Abschnitt „Nachtrag 2026-11-23“; der alte Satz steht nur noch in der Git-Geschichte und als Protokoll in „Freigabe“ (b). Datum, Owner und „aufgehoben“ stehen da — als Kriterium erfüllt.
- **H6** Ohne tnum ist das Minus breiter als eine Ziffer: Canvas `measureText` mit der berechneten Schrift (Canvas kennt kein tnum) „−“ 8,932 px gegen „0“ 8,517 px. Mit tnum, wie in jeder Betragszelle, sind beide 8,758 px. Erst relevant, wenn ein Betrag je ohne tnum steht.
