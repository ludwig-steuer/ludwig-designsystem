# 0164 · JournalEntryReviewList — die Vorschläge eines Stapels prüfen

| | |
|---|---|
| Status | **fertig — Nachtrag 2026-10-01 abgenommen** (Nachprüfung 2026-10-01, Stand `2db675c`; abgenommen 2026-09-29 mit Auflagen M2 setweit, M5; offen (App): Hauptkonto zuerst und `accountNames={false}` in der flachen Ansicht, `docs/befunde-app.md` §E); gebaut 2026-09-29; aus dem Backlog geholt 2026-09-29 (F334 T3, Owner-Auftrag über ll-dev; ersetzt den Default „bis `export-batch` steht"). Gebaut nach Abnahme von 0211, ohne Sortierung nach Aufmerksamkeit (L-295) und ohne `DiffView` |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Buchungsvorschlag, Judge-Verdikt, Stapel, Herkunft Mandantenstapel |
| Quelle | Entitätsprofil `docs/entitaeten/journal-entry.md`, Abschnitte „Listen" (dritte Zeile), „Formen" (Zeile `JournalEntryReviewList`) und „Zuschnitt" |
| Auftrag | Die Liste, mit der die Buchhalterin nach einem Buchungslauf die Vorschläge eines Stapels abnimmt: Grundgesamtheit `status ∈ {proposed, accepted}` im Stapel, Reiter nach Herkunft (F202), sortiert nach Aufmerksamkeit, Massenaktion annehmen / zurückgeben. Ersetzt die Liste in `modules/stapelabnahme/ui/Schritt3.tsx` (469 Z.) neben `Schritt3Einzel.tsx` (1.589 Z.) |
| Warum nicht so lassen | Job J-41 steht auf „halb": die Vorschläge kommen gleichrangig, nicht in der Reihenfolge, in der sie Aufmerksamkeit brauchen. Die Zeile zeigt `status`, nicht den Weg nach DATEV |
| Vertagt, weil | vier Voraussetzungen fehlen: das Profil `export-batch` (Roadmap #3 — der Stapel ist die Grundgesamtheit), ein Seitenprofil der Stapelabnahme unter `docs/seiten/` (Kopfzeile, Vorratszähler, was nach „annehmen" passiert), B3 `DiffView` für bearbeitete Vorschläge (`ai_edited`, 15 im Bestand) und ein Typ für das Judge-Verdikt, nach dem sortiert wird (Befund L-295) |
| Offene Frage aus dem Profil | Frage 3 — *ohne Antwort gilt der Default:* Backlog, bis #3 steht; die Stapelabnahme behält ihre Liste |
| Setzt voraus | `JournalEntryRow` (Profil, Marke „jetzt") · `AiBookingNotesCell` ✓ · `ProvenanceMark` ✓ (0163) · `SelectionScope`/`SelectionBar` (0057) · `EmptyState` · B3 `DiffView` |
| Blockiert | nichts im Set. In der App die Ablösung von `Schritt3.tsx` |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |

## Was schon feststeht

Aus dem Entitätsprofil, damit die Spec es nicht neu erheben muss:

- **Umfang:** offene Vorschläge (ohne Mandantenstapel) je Stapel p50 23 ·
  p90 41 · max 45; `ai_proposed` je Stapel p50 44 · p90 219 · max 260
  (Staging, 2026-09-11, 11 Stapel). Unter 200 Zeilen offen → Filter im
  Client; die ganze Grundgesamtheit kann darüber liegen.
- **Leerfall ist ein Erfolg:** „Alles abgenommen." — und nicht dasselbe wie
  „Keine Treffer" nach Filter.
- **Mandantenstapel** (`client_import`, 833 Sätze) trägt keine Konfidenz und
  kein Judge-Verdikt; sein Reiter sortiert nach Buchungsdatum, nicht nach
  Aufmerksamkeit.
- **Die Spalten** sind die der `JournalEntryRow` (Ränge 1–7) plus die
  KI-Prüfung (`AiBookingNotesCell`).


## Gebaut 2026-09-29 (T3 aus Brief F334)

`JournalEntryReviewList` + `proposalReviewColumns` in
`entities/journal-entry/JournalEntryReviewList.tsx`, Zeile `ProposalRow`.

| Ausprägung | Spalten |
|---|---|
| `full` | Datum · Gegenpartei (+ „erstmals") · Soll · (Name des Soll-Kontos, Kopf nur für den Screenreader: „Kontoname Soll") · Haben · (Name des Haben-Kontos, „Kontoname Haben") (Nachtrag 2026-10-01: Hauptkonto, „+n weitere"; ohne Namen mit `accountNames: false`) · Betrag · BU · Prüfung durch Ludwig · Satzart (nicht in Gruppen nach Satzart) · Prüfbedarf („x von y bestanden" über den Gründen, 0217; „entschieden"). „Nr." und „Beleg" nur über `include` |
| `compact` | Datum · Gegenpartei · Konten („4930 an 70021") · Betrag · Prüfung durch Ludwig |

Rahmen: `expand` (Aufklapper der App: Satz, Begründung, Aktionen) · `rowActions`
· `bulkActions` → Auswahl mit stehender Leiste · Gruppen oder flach · Leerfall
als Erfolg (`done`) ≠ leer nach Filter · lädt · Fehler.

**Abweichung vom Brief F334:** keine Beleg-Spalte im Standard — der Owner hat
sie am 2026-09-21 aus Schritt 3 genommen (Laptop mit Seitenleiste, der Beleg
steht im Aufklapper). Sie ist über `include: ["document"]` zu haben.
Gemessen bei 1280 px: `full` gruppiert mit Auswahl, Aufklapper und Aktionen
1246 px in der Karte, kein Querscroll.

**Ausbau:** Sortierung nach Aufmerksamkeit (L-295), `DiffView` für bearbeitete
Vorschläge, Reiter nach Herkunft.

Stories `v3/Entitäten/Buchungssatz/JournalEntryReviewList`: `Grouped` · `Flat` ·
`Compact` · `States`.

**Nachtrag 2026-09-29 (Hinweis ll-dev, Owner-Regel „nichts verlieren"):** Soll
und Haben zeigen in `full` wieder Nummer **und Name** („6805 Telefon / 1576
Vorsteuer 19 %"), die Zelle bricht um statt zu kürzen — wie Schritt 3 heute.
`accountNames: false` für einen schmalen Rahmen. Gemessen bei 1280 px: 1246 px,
kein Querscroll; Zeilen mit langen Namen 88 px hoch.

## Abnahme

Die Spec hatte keine Abnahmetabelle; der Abnehmer leitet sie aus „Gebaut
2026-09-29" und dem Nachtrag ab.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `full`: Nr. · Datum · Gegenpartei (+ „erstmals") · Soll · Haben · Betrag · BU · Prüfung durch Ludwig · Satzart · Prüfbedarf („entschieden") | `Flat` | ✓ Köpfe in dieser Reihenfolge; „erstmals" (Hartje KG), „3 Zeilen", „entschieden" sichtbar |
| Satzart nicht in Gruppen nach Satzart | `Grouped` | ✓ keine Spalte Satzart; Hinweis M3 |
| `compact`: Datum · Gegenpartei · Konten · Betrag · Prüfung durch Ludwig | `Compact` | ✓ „4930 an 70021", 678 = 678, Zeilen 35–36 px |
| Keine Beleg-Spalte im Standard, über `include: ["document"]` | Code | ✓ `OPTIONAL` filtert `document` ohne `include` |
| Auswahl mit stehender Leiste, Aufklapper, Aktionen | `Grouped` | ✓ Auswahl-, Aufklapp- und Aktionsspalte; Aktionen rechts bei 1245 px |
| Leerfall als Erfolg ≠ leer nach Filter · lädt · Fehler | `States` | ✓ „Alles abgenommen." mit Zahl 40 und Haken · „Keine Treffer für „Satzart: Zahlung"." + „Filter zurücksetzen" · Skelett · Fehlerzeile; Spaltenkopf bleibt |
| 1280 px, `full` gruppiert, kein Querscroll | `Grouped` | ✓ 1246 = 1246 |
| 1280 px, `full` flach (Reiter „Bitte anschauen") | `Flat` | ✗ 1348 > 1246 — 102 px Querscroll, Aktionen rechts außerhalb → M1 |
| Nachtrag: Soll/Haben mit Nummer und Name, Zelle bricht um | `Grouped`, `Flat` | ✓ „1800 Bank / 1360 Geldtransit", Zeilen 88 px |

## Fremde Abnahme 2026-09-29

Abnehmer: Claude (fremde Sitzung, nicht der Bauende). Grundlage: Code
(`JournalEntryReviewList.tsx`), Storybook 6107 bei 1280 × 900 mit Playwright
gemessen, `pnpm typecheck` · `check:language` · `check:when` · `check:type` ·
`check:contrast` grün (Exit 0). Exporte `JournalEntryReviewList`,
`proposalReviewColumns`, `ProposalRow`, `ProposalColumn`,
`ProposalColumnOptions` ✓.

### Mängel

**M1 — blockierend.** Die flache Ansicht scrollt bei 1280 px quer.
In `Flat` misst `.v2tbl__scroll` 1348 > 1246 px: die Spalte Satzart (96 px)
kommt zur gruppierten Breite hinzu, die Aktionsspalte mit „Freigeben" liegt
102 px rechts außerhalb. Die flache Liste ist der Reiter „Bitte anschauen",
also der Hauptweg der Prüfung — die Handlung darf nicht hinter dem Querscroll
stehen. Gemessen wurde laut Spec nur die gruppierte Form. Abhilfe z. B.
Prüfbedarf 160 → 128 px und Gegenpartei-Boden 120 → 104 px, oder Satzart als
Unterzeile der Gegenpartei; danach `Flat` bei 1280 nachmessen.

**M2 — nicht blockierend.** Trefferflächen: Kontonummern als Links 30 × 17 px,
BU 22,5 × 16,5 px, (i) der Prüfung durch Ludwig 15 × 15 px je Zeile,
Aufklappknopf 32 × 20,9 px, „Öffnen" 60,9 × 20,3 px. Die Kontonummern stehen
in einer Liste mit „ / " — kein Satz, Ausnahme „inline" greift nicht. Das
(i) mit 15 × 15 px ist das Muster aus §9 („ein Knopf, dessen Fläche seine
Glyphe ist") — gehört an `AiBookingNotesCell`, nicht an diese Liste, bleibt
aber offen.

**M3 — nicht blockierend.** `without: ["kind"]` greift bei **jeder**
Gruppierung (`JournalEntryReviewList.tsx:295`), die Spec sagt „nicht in
Gruppen nach Satzart". Eine Gruppierung nach etwas anderem verlöre die Satzart.

**M4 — nicht blockierend.** `Side` baut Konto-Links als rohes `<a>`
(`JournalEntryReviewList.tsx:123`) statt über `Link` wie alle Nachbarzellen —
zweite Quelle für das Verhalten eines Links.

**M5 — nicht blockierend.** Beispieldaten: Kontonamen passen nicht zu den
Nummern („70021 Bürobedarf", „1800 Muster Bürobedarf GmbH",
`JournalEntryReviewList.stories.tsx`) — der Nachtrag „Nummer und Name" ist so
nicht glaubhaft zu prüfen.

Vier Linsen: **Sprache** — „Prüfung durch Ludwig", „Prüfbedarf",
„entschieden", „erstmals", „Alles abgenommen." — Kanzleiwörter, ohne Versalien und
Ausrufezeichen ✓; der Kopf „Prüfung durch Ludwig" bricht in 112 px zweizeilig
(Kopf 58 px). **Bedienung** — Auswahl + Sammelaktion, Aufklapper; M1, M2.
**Logik** — fünf Zustände, Erfolg ≠ Filter-leer ✓; rechnet nichts (E2) ✓.
**Darstellung** — Satzart als graues Badge, Farbe nur in der Prüfung durch
Ludwig mit Wort ✓.

### Urteil

**Nicht abgenommen** wegen M1. Alles Übrige ist erfüllt; nach Behebung genügt
die Nachmessung von `Flat` bei 1280 px.


## Nachbesserung 2026-09-29 (Claude, nach der fremden Abnahme)

| Mangel | Behoben |
|---|---|
| M1 (blockierend) | Spuren enger (Datum 84, Gegenpartei `minmax(104px)`, Soll/Haben `minmax(72px)`, Betrag 100, BU 40, Satzart 84, Prüfbedarf 132). Gemessen `Flat` bei 1280: 1246 = 1246, kein Querscroll; `Grouped` 1246 |
| M3 | Die Satzart fällt nicht mehr bei jeder Gruppierung weg; der Aufrufer nimmt sie mit `without: ["kind"]` heraus, wenn seine Gruppen nach Satzart sind |
| M4 | Konto-Links über `Link` |
| M2, M5 | offen: Trefferflächen setweit; Beispieldaten |

## Nachprüfung 2026-09-29

Abnehmer: Claude (fremde Sitzung). Stand 0efe1df, Storybook 6107, 1280 × 900,
Playwright.

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M1 | `Flat` | ✓ `.v2tbl__scroll` 1246 = 1246, kein Querscroll; Aktionen innerhalb der Karte; Spalten auf oder über dem Boden (Gegenpartei 104, Soll/Haben je 73 bei Boden 72, Prüfbedarf 132 px) |
| Gegenprobe | `Grouped` | ✓ 1246 = 1246; keine Spalte Satzart; Gegenpartei 129, Soll/Haben je 107,5 px |
| M3 | Code `JournalEntryReviewList.tsx:297`, Story `Grouped` | ✓ `kind` fällt nur über `without` des Aufrufers; `Grouped` gibt `without={["kind"]}` |
| M4 | Code `JournalEntryReviewList.tsx:124` | ✓ Konto-Links über `Link` |

Hinweis: Soll/Haben mit 73 px tragen „Nummer und Name" nur noch umgebrochen
(Zeilen 88 px wie vorher) — innerhalb des Nachtrags, kein Mangel.

Offen, nicht blockierend: M2 (setweit), M5.

### Urteil (neu)

**Abgenommen mit Auflagen**: M5 (Beispieldaten) nachziehen; M2 bleibt beim
setweiten Auftrag.

**Nachtrag 2026-09-29 (Review F340, Owner-Regel „nichts verlieren"):** Die Gegenpartei bricht auf bis zu **drei Zeilen** um statt einzeilig zu kürzen — Schritt 3 zeigte bisher bis 40 Zeichen („Deutsche Telekom Geschäftskunden GmbH"). Spuren: Gegenpartei `minmax(120px, 1.4fr)`, Soll/Haben `minmax(68px, …)`, Prüfbedarf 124. Gemessen bei 1280: `Grouped` und `Flat` je 1246 = 1246, kein Name gekürzt (Telekom 63 px, drei Zeilen); Zeilen mit langen Kontonamen in `Flat` bis 109 px.

## Nachprüfung 2026-09-29 (Stand e0a0016/2188c44)

Abnehmer: Claude (fremde Sitzung). Geprüft wurde der Nachtrag Review F340,
Storybook 6107 bei 1280 × 900 mit Playwright.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Kein Querscroll | `Grouped`, `Flat` | ✓ je 1246 = 1246 |
| „Deutsche Telekom Geschäftskunden GmbH" ungekürzt | `Grouped`, `Flat` | ✓ drei Zeilen, 63 px, scrollHeight = clientHeight; Spalte 145 px (`Grouped`) bzw. 120 px (`Flat`); in beiden Stories kein Name gekürzt |
| Spuren | Kopf `Flat` | ✓ Gegenpartei 120, Soll/Haben je 69 (Boden 68), Prüfbedarf 124 |
| Zeilenhöhen | beide | `Grouped` 67–88 px, wie zuvor höchstens 88; `Flat` 66 und **109 px**, vorher höchstens 88 |
| ErrorRow: Was-Satz fett | setweit (`.v2tbl__error > span:first-child`) | ✓ Gewicht 600, `role="alert"` |

**Hinweis, nicht blockierend.** In `Flat` stehen die Zeilen mit Kontonamen jetzt
109 px hoch statt 88, weil Soll und Haben in 69 px auf vier bis fünf Zeilen
umbrechen. Die Spec nennt das. Bei 40 Vorschlägen passen damit etwa sechs statt
acht Zeilen auf den Schirm. Wo die Kontonamen nicht gebraucht werden, hilft
`accountNames: false`.

### Urteil

**Abgenommen mit Auflagen**: unverändert M2 (setweit) und M5.

## Nachtrag 2026-10-01 — Soll/Haben ruhiger, Zeilen oben (Owner über lldev1)

Anlass: Schritt Buchungsvorschläge, „Buchungsvorschläge nach Satzart" (App
`Step3Single`, `variant="full"`, gruppiert). Die Soll/Haben-Zellen listeten
alle Konten mit „ / " und Namen und brachen samt Nummer um — dem Owner zu
unruhig.

1. **Je Seite nur das Hauptkonto.** `accounts.debit[0]` bzw. `credit[0]` ist
   das Hauptkonto (höchste Summe der Seite); die **App ordnet**, die Liste
   rechnet nichts (JSDoc an `ProposalRow.accounts`). Dahinter „+n weitere"
   (`v2sub`), wo es mehr als eins gibt. Die volle Liste steht im `title` der
   Nummer und des Namens, der Aufklapper zeigt den Satz ganz.
2. **Nummer und Name in eigenen Spalten.** Neue Spaltenschlüssel `debitName`
   und `creditName` (in `ProposalColumn`, hinter `debit` bzw. `credit`). Die
   Nummer mono, fest **44 px** (fünf Ziffern messen 37,5 px), mit Link über
   `accountHref`; der Name `minmax(72px, 1fr)`, bricht um — Silbentrennung nur
   in Wörtern ab zwölf Zeichen (`hyphenate-limit-chars: 12 5 5`, sonst stand
   „Bü-robedarf" da), höchstens drei Zeilen wie die Gegenpartei, der Rest im
   `title`. Köpfe: sichtbar „Soll" / „Haben" über der Nummer, über dem Namen
   nichts fürs Auge und „Kontoname Soll" / „Kontoname Haben" für den
   Screenreader (`v2vh`) — zweimal „Kontoname" im Kopf hätte die Seiten nicht
   mehr getrennt.
3. **„n Zeilen" nur noch, wo die Konten es nicht sagen:** wenn `lineCount`
   größer ist als die Zahl der Konten beider Seiten (ein Konto auf mehreren
   Zeilen). Sonst sagt „+n weitere" dasselbe.
4. **`accountNames: false`**: keine Namensspalten; Soll/Haben wieder
   `minmax(68px, 1fr)` mit Nummer und „+n weitere" darunter.
5. **Platz dafür** (gemessener Inhalt in Klammern): Datum 84 → 76 (72),
   BU 40 → 32 (23), Prüfung durch Ludwig 112 → 96 (90). Gegenpartei bleibt
   `minmax(120px, 1.4fr)` (F340: „Deutsche Telekom Geschäftskunden GmbH" ganz).
   **„Nr." ist kein Standard mehr (Owner 2026-10-01: „bringt nichts, braucht
   Platz, Datum reicht")** — `number` steht in `OPTIONAL` neben `document` und
   kommt über `include: ["number"]` zurück. Das Feld `ProposalRow.number`
   bleibt. Das `aria-label` der Auswahl nennt jetzt Datum · Gegenpartei statt
   der Nummer, die niemand mehr sieht.
6. **Setweit:** Tabellenzeilen oben ausgerichtet (`.v2tbl__row { align-items:
   start }`, Kopf bleibt mittig) — Owner-Standard, in
   `design-guidelines.md` §Tabelle mit Datum.
7. Storybook setzt `lang="de"` wie die App (`.storybook/preview-head.html`),
   sonst trennt `hyphens: auto` dort nicht.

**Gemessen** (Playwright, 1280 × 900, Storybook :6107):

| Story | Messung |
|---|---|
| `Grouped` | 1246 = 1246, kein Querscroll. Spuren ohne „Nr.": Datum 76, Gegenpartei 136, Soll 44, Name 97, Haben 44, Name 97. Kein Gegenparteiname gekürzt, keine Nummer über ihre Spur. Zeilen 64–106 px (vorher 67–88 laut Nachprüfung 2026-09-29; die höchste, 105,6 px, ist Fall 11 — dreizeiliger Kontoname plus „3 Zeilen"). `aria-label` der Auswahl „16.09.2026 · Allianz Versicherungs-AG" |
| `Flat` (`accountNames={false}`) | 1246 = 1246. Gegenpartei 135, Soll/Haben je 96,5 px (nach M6, Satzart 100 px): „3100 +2 weitere", „70021 3 Zeilen" (11. Zeile). Zeilen 47–88 px (vorher bis 109) |
| Zeilen oben | Erste Zeile jeder Zelle 12–14 px unter der Zeilenoberkante; Grundlinien einer einzeiligen Zeile in `CaseList --filled` innerhalb 1 px (Text 13,5 · Badge 11,5 · Mono 12,5 px). `BankTransactionList --filled`: die zweizeilige Sachverhaltszelle zieht die anderen nicht mehr in die Mitte |

**Owner-Entscheid 2026-10-01 (flache Ansicht):** Mit der Satzart-Spalte
passten die Namensspalten flach bei 1280 px nicht (gemessen 1328 zu 1246 px,
noch mit „Nr."; die Aktionen rutschten aus dem Bild). Entschieden: **flach ohne
Namensspalten** — die App übergibt dort `accountNames={false}`, die Namen
stehen im `title` und im Aufklapper; gruppiert mit Namensspalten. Verworfen:
flach ohne Satzart, flach mit Querscroll.

**Ausbau:** T1 (`journalEntryColumns`, `SideAccounts`) zeigt Soll/Haben noch als
Liste mit „ / " — gebuchte Sätze haben fast immer ein Konto je Seite; zieht
nach, wenn ein Screen es verlangt.

Status: **fertig — Nachtrag 2026-10-01 abgenommen** (fremde Abnahme und Nachprüfung 2026-10-01 unten). Kriterien für die fremde Abnahme:

- [x] `full` mit Namen: Köpfe „Soll" · (leer, sr „Kontoname Soll") · „Haben" · (leer, sr „Kontoname Haben"); je Seite genau eine Nummer und ein Name (`Grouped`)
- [x] „+n weitere" = Zahl der Konten der Seite minus eins, nur bei mehr als einem; `title` nennt alle Konten mit Nummer und Name (`Grouped`, `Flat`)
- [x] „n Zeilen" nur, wo `lineCount` > Konten beider Seiten (`Flat` Zeile 11), sonst nicht (`Grouped`)
- [x] Nummernspalte 44 px, mono, kein Überlauf; Name bricht um, höchstens drei Zeilen, keine Trennung in Wörtern unter zwölf Zeichen (`Grouped`, gemessen)
- [x] `accountNames={false}`: keine Namensspalten, Nummer + „+n weitere" in einer Spalte (`Flat`)
- [x] `Grouped` und `Flat` bei 1280 px ohne Querscroll; kein Gegenparteiname gekürzt (gemessen)
- [x] Keine Spalte „Nr." im Standard; `include: ["number"]` bringt sie zurück (Code, `OPTIONAL`); `aria-label` der Auswahl = Datum · Gegenpartei (DOM-Probe `Grouped`)
- [x] Setweit: `.v2tbl__row` oben ausgerichtet, Kopf mittig; einzeilige Zeilen weiter auf einer Grundlinie (zwei fremde Tabellen-Stories gemessen); Regel in `design-guidelines.md` mit Datum
- [x] (App erledigt: `8f78cd12` Sortierung mit Test, `f42549a4` `accountNames={false}` flach) die App ordnet `accounts.debit`/`credit` nach Summe absteigend (Hauptkonto zuerst) und übergibt in der flachen Ansicht `accountNames={false}` — `docs/befunde-app.md` §E
- [x] Spec-Tabelle „Ausprägung" oben und Code stimmen überein; `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün — M8 behoben, Nachprüfung 2026-10-01 (`2db675c`)

### Fremde Abnahme Nachtrag 2026-10-01

Abnehmer: Claude (fremde Sitzung, nicht der Bauende). Stand `24cbfef` (Bau
`8f029d0` + `24cbfef`). Grundlage: Spec und Code; Storybook 6107 bei
1280 × 900 in einem eigenen Playwright-Kontext gemessen. `pnpm typecheck` ·
`check:type` · `check:when` · `check:language` Exit 0. `pnpm build` nicht
nachgelaufen (parallele Sitzungen); der Erbauer meldet ihn für `24cbfef` grün.
`Grouped`, `Flat`, `Compact`, `States` ohne Konsolenmeldung. Story-IDs mit dem
Präfix `v3-entitäten-buchungssatz-journalentryreviewlist--`.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| 1 Köpfe; je Seite eine Nummer und ein Name | `--grouped`: Köpfe Datum · Gegenpartei · Soll · (leer) · Haben · (leer) · Betrag · BU · Prüfung durch Ludwig · Prüfbedarf · Aktionen; Namensköpfe `v2vh` 1 × 1 px (`clip-path: inset(50%)`), Text „Kontoname Soll" / „Kontoname Haben". In 39 Zeilen je Seite genau ein `.v2mono` und ein `.v3prop__acc`; Fall 12 („kein Satz") keins | ✓ |
| 2 „+n weitere"; `title` | `--grouped`: 3100 mit drei Konten „+2 weitere", 4930 mit 1576 „+1 weitere", 1800 mit 1360 „+1 weitere" (Fälle 1, 14, 27, 40), ein Konto ohne Zusatz — stimmt mit den Story-Daten. `--flat`: „3100 +2 weitere" (Zeilen 1, 7), „4930 +1 weitere" (4, 10), „1800 +1 weitere" (1). `title` an Nummer und Name, z. B. „3100 Fremdleistungen, 1576 Abziehbare Vorsteuer 19 %, 1571 Abziehbare Vorsteuer 7 %" | ✓ |
| 3 „n Zeilen" | `--flat`: nur Zeile 11, „70021 · 3 Zeilen" (`lineCount` 3 > 1 + 1). `--grouped`: genau einmal, derselbe Fall 11 in der Gruppe Zahlung — regelgerecht; die Klammer „sonst nicht (`Grouped`)" liest sich, als zeige `Grouped` keins. In den übrigen 39 Zeilen ist `lineCount` ≤ Zahl der Konten, kein Zusatz | ✓ |
| 4 Nummer 44 px mono; Name ≤ drei Zeilen; Trennung erst ab zwölf Zeichen | `--grouped`: Spur 44 px, JetBrains Mono, breiteste Nummer „70021" 37,5 px, in 78 Nummernzellen kein Überlauf. Namen höchstens drei Zeilen; gekappt nur „Verbindlichkeiten aus Lieferungen und Leistungen" (5 Zeilen, ganz im `title`). Getrennt nur „Fremdleis-tungen" (15 Zeichen) und „Verbindlich-keiten" (17), „Bürobedarf" (10) nie. `hyphens: auto`, `hyphenate-limit-chars: 12 5 5`, `lang="de"` am Dokument | ✓ |
| 5 `accountNames={false}` | `--flat`: Köpfe Datum · Gegenpartei · Soll · Haben · Betrag · BU · Prüfung durch Ludwig · Satzart · Prüfbedarf · Aktionen; kein `.v3prop__acc`; Soll/Haben je 101,2 px (`minmax(68px, 1fr)`), Nummer und „+n weitere" darunter | ✓ |
| 6 1280 px ohne Querscroll; kein Name gekürzt | `.v2tbl__scroll`: `--grouped` 1246 = 1246, `--flat` 1246 = 1246, `--states` viermal 1246 = 1246. `.v3prop__name` in allen 52 Zeilen scrollHeight = clientHeight. Spuren `--grouped`: Datum 76, Gegenpartei 135,9, Soll 44, Name 97,1, Haben 44, Name 97,1; `--flat`: Gegenpartei 141,6, Soll/Haben 101,2. In `Flat` ragt aber die Satzart aus ihrer Spur → M6 | ✓ |
| 7 „Nr." nur über `include`; `aria-label` | Code: `OPTIONAL = ["number", "document"]` (`JournalEntryReviewList.tsx:97`), Filter `:324`. `--grouped`: `aria-label` „16.09.2026 · Allianz Versicherungs-AG"; ohne Gegenpartei „08.09.2026 · Eingangsrechnung ohne erkannten Gegenpart"; ohne Datum steht „—" (`format.ts:280`) | ✓ |
| 8 Setweit oben, Kopf mittig, eine Grundlinie, Regel mit Datum | Tabelle „Setweite Gegenprobe" unten: sechs fremde Stories, keine Zeile höher, einzeilige Zeilen höchstens 1,2 px auseinander; Köpfe `align-items: center`. `design-guidelines.md`, Zeile „Tabelle": „Zeilen oben ausgerichtet (Owner 2026-10-01)" | ✓ |
| 9 Ausprägung = Code; typecheck, build, check:type | typecheck und check:type Exit 0, build laut Erbauer grün. Die Tabelle „Ausprägung" nennt „Kontoname" zweimal → M8 | ✗ |

**Setweite Gegenprobe.** Die Grundlinie ist aus dem Glyphenkasten des ersten
Zeichens jeder Zelle und der Fontmetrik gerechnet (Inter 0,969/0,242 em,
JetBrains Mono 1,02/0,30 em). Ein Null-Marker taugt dafür nicht: in einem
`inline-flex`-Badge landet er in dessen Mitte und täuscht 4 px Versatz vor. Die
Klammerwerte stammen aus demselben Kontext mit übersteuertem
`.v2tbl__row { align-items: center }`, also dem Stand vor dem Nachtrag.

| Story | Zeilen | höher geworden | einzeilig: Spreizung der Grundlinien, jetzt (vorher) | mehrzeilig: erste Zeilen, jetzt (vorher) | Bedienelemente, Mitte unter Zeilenoberkante |
|---|---|---|---|---|---|
| `v3-entitäten-sachverhalt-caselist--filled` | 5 | 0 | 0,2 px (1,0) | — | Icon im Badge 23 px |
| `v3-entitäten-kontoauszugsposition-banktransactionlist--filled` | 5 | 0 | 1,2 px (0,6) | 1,2 px (10,8) | Knopf (24 px hoch) 21,7 px |
| `v3-entitäten-buchungssatz-journalentrylist--in-batch` | 6 | 0 | 1,1 px (1,9) | 0,2 px (8,7) | Icons 21,7–22 px |
| `v3-patterns-arbeitsfläche-datatable--row-actions` | 8 | 0 | 0,8 px (1,0) | — | „Zurückstellen" 22,1 px |
| `v3-patterns-arbeitsfläche-datatable--expand` | 6 | 0 | 0,1 px (1,0) | — | Checkbox 13–27 px, Aufklapper 22,5 px |
| `v3-primitives-tabelle-table--filled` | 4 | 0 | 1,1 px (0,7) | — | — |
| `--grouped` / `--flat` (T3 selbst) | 40 / 12 | 0 | — / 2,2 px (1,3) | 2,2 px (30,6) / 2,2 px (21,7) | Checkbox 13–27, Aufklapper 22,5, (i) 22,8, „Öffnen" 22,1 px |

Die erste Textzeile beginnt überall 12 px unter der Zeilenoberkante (Polster),
Glyphen bei 14–16 px, Grundlinie bei 26–28 px; alle Bedienelemente liegen in
diesem Band. In T3 kommen die 2,2 px aus Nummer (mono, 26,1) gegen Prüfung
durch Ludwig (28,3) — kein Mangel.

#### Mängel

**M6 — nicht blockierend, vorbestehend (seit `0efe1df`).** In `Flat` hat die
Satzart eine 84-px-Spur (`JournalEntryReviewList.tsx:299`), das Badge
„Dauerbuchung" misst 99,7 px: es ragt 15,7 px aus der Spur und liegt 5,7 px
über dem Text der Nachbarspalte („entschieden", „erstmals gebucht", „Ludwig ist
unsicher"; Zeilen 3, 6, 9, 12; Screenshot `.playwright-mcp/abn164-flat-dauerbuchung.png`). Das „ohne
Querscroll" von `Flat` steht damit auf einer Spur, die ihren Inhalt nicht
trägt. Abhilfe: Satzart 100 px — die `fr`-Spuren geben 16 px ab (Gegenpartei
141,6 → 135,1, Soll/Haben 101,2 → 96,5 px, beide über ihrem Boden 120/68),
gerechnet weiter 1246 = 1246; danach `Flat` bei 1280 px nachmessen. Die
beiden Nachprüfungen vom 2026-09-29 haben den Überlauf nicht gemessen.

**M7 — Spec, nicht blockierend.** Messwert-Tabelle des Nachtrags, Zeile
`Grouped` (oben in diesem Abschnitt): „die höchste trägt zwei
Prüfbedarf-Gründe" stimmt nicht. Die höchste Zeile (105,6 px) ist Fall 11
(Aral Tankstelle, 11.09.2026) mit **einem** Grund („Konto weicht vom Vorjahr
ab", Zelle 20,9 px). Ihre Höhe kommt vom Kontonamen Soll: „Muster / Bürobedarf /
GmbH" in drei Zeilen plus „3 Zeilen", Zelle 80,6 px. Zeilen mit zwei Gründen
stehen bei höchstens 87,8 px. Dazu widerspricht „vorher 84–88" der
Nachprüfung vom 2026-09-29 in derselben Spec (`Grouped` 67–88 px).

**M8 — Spec, macht Kriterium 9 rot.** Die Tabelle „Ausprägung" (Abschnitt
„Gebaut 2026-09-29", Zeile `full`) nennt „Soll · Kontoname · Haben ·
Kontoname". Der Code heißt die Namensköpfe „Kontoname Soll" / „Kontoname
Haben", sichtbar leer (`JournalEntryReviewList.tsx:245`, `:258`). Punkt 2 des
Nachtrags begründet genau das: „zweimal „Kontoname" im Kopf hätte die Seiten
nicht mehr getrennt". Die Tabelle schreibt also, was der Code vermeidet.
Abhilfe z. B. „Soll · Kontoname Soll · Haben · Kontoname Haben (Namensköpfe nur
für den Screenreader)".

**M9 — nicht blockierend.** Der Nachtrag legt der App zwei Pflichten auf:
`accounts.debit[0]` / `credit[0]` ist das Hauptkonto, weil „die App ordnet"
(Punkt 1, JSDoc `JournalEntryReviewList.tsx:49–53`), und die flache Ansicht
übergibt `accountNames={false}` (Owner-Entscheid oben). Beides ist nirgends
übergeben — weder als Kriterium „offen (App)" noch in `docs/befunde-app.md`;
0164 hat dort auch in §E („Ablösungen", `Schritt3.tsx`) keine Zeile. Ordnet
die App nicht, steht als Hauptkonto etwa 1576 Vorsteuer statt 3100. Die Liste
kann das nicht bemerken, weil sie nichts rechnet.

#### Hinweise (keine Mängel)

- `Grouped`: 36 von 40 Zeilen stehen bei 86,8–87,8 px, weil der Kreditorname
  „Muster Bürobedarf GmbH" in der 97-px-Namensspur dreizeilig bricht (vorher
  laut Nachprüfung 2026-09-29: 67–88 px). Ruhiger ja, dichter nein: bei 900 px
  Höhe passen rund acht Zeilen. Entscheid des Owners, hier nur gemessen.
- M5 ist durch `8f029d0` bis auf einen Rest erledigt: Nummern und Namen
  passen, außer 70021 „Verbindlichkeiten aus Lieferungen und Leistungen" in
  jeder fünften Zeile (`JournalEntryReviewList.stories.tsx:48`) — ein
  Sammelkontoname auf einer Kreditorennummer, als Langnamen-Probe gewollt,
  fachlich schief.
- Der Nummern-Link spannt in `Flat` die ganze Spur (101,2 × 19,4 px, weil
  `.v3prop__who` ein Grid ist), in `Grouped` 44 × 19,4 px. Die Höhe liegt unter
  24 px; das bleibt bei M2 (setweit).
- „+1 weitere" ist elliptisch — Wortlaut des Owners („+n weitere").
- `include: ["number"]` hat keine Story; Nachweis wie im Kriterium über den
  Code.

**Vier Linsen.** **Sprache** — „+n weitere", „n Zeilen", „kein Satz",
Screenreader-Köpfe „Kontoname Soll/Haben"; das `aria-label` „Datum ·
Gegenpartei" sagt, was die Zeile zeigt; keine Versalien, kein Systemwort ✓.
**Bedienung** — Soll und Haben bleiben auch für den Screenreader getrennt; die
volle Kontoliste steht im `title` und per Tastatur im Aufklapper; Checkbox,
Aufklapper und Aktionen sitzen auf der ersten Zeile, keine Zeile wurde höher
✓; Trefferfläche des Nummern-Links → M2. **Logik** — die Liste rechnet nichts:
Hauptkonto = erstes Element, „+n" = Länge − 1, „n Zeilen" nur bei `lineCount` >
Konten ✓; fünf Zustände unverändert, der Kopf mit Namensspalten steht auch
leer, beim Laden und im Fehler (`States` 1246 = 1246) ✓; App-Vertrag nicht
übergeben → M9. **Darstellung** — Nummern mono untereinander in fester Spur,
Namen links, keine neue Farbe; „+n weitere" #717171 auf Weiß = 4,88:1 bei
11,5 px ✓; setweit oben ausgerichtet ohne Höhenänderung ✓; Satzart-Badge
überdeckt die Nachbarspalte → M6.

#### Urteil

**Nicht abgenommen (Nachtrag)** — allein wegen Kriterium 9 (M8, Spec-Text).
Code und Verhalten erfüllen die Kriterien 1–8; bis zur Nacharbeit gilt der
Code (`docs/backlog/README.md`, „Wer nachzieht"). Nacharbeit: M8 und M7 in der
Spec (zur Nachprüfung genügt Lesen); M6 mit einer Spurbreite, danach `Flat`
bei 1280 px nachmessen; M9 als Übergabe an die App. Daneben bleiben M2
(setweit) und der Rest von M5 offen.

## Nacharbeit 2026-10-01 (nach der fremden Abnahme)

| Punkt | Änderung | Stand |
|---|---|---|
| M8 Ausprägung vs. Code | Tabelle „Ausprägung" nennt die Namensspalten jetzt wie gebaut: sichtbar ohne Kopf, für den Screenreader „Kontoname Soll" / „Kontoname Haben" | behoben |
| M7 Messwerte | höchste Zeile richtig benannt (Fall 11, 105,6 px, Kontoname plus „3 Zeilen"); „vorher" nach der Nachprüfung vom 2026-09-29 (67–88 px) | behoben |
| M6 Badge „Dauerbuchung" ragt aus der Satzart-Spur | Spur 84 → 100 px (Badge 99,7 px); die flexiblen Spalten geben die 16 px ab, `Flat` bleibt 1246 = 1246 | behoben |
| M9 App-Pflichten nicht übergeben | Kriterium „offen (App)" oben; Zeile in `docs/befunde-app.md` §E | behoben |
| Hinweis M5-Rest | Story: der Sammelkontoname „Verbindlichkeiten aus Lieferungen und Leistungen" steht auf **1600** statt auf der Kreditorennummer 70021 | behoben |
| M2 Trefferfläche Nummern-Link 19,4 px | setweit, Backlog 0213 (Owner 2026-09-29: nicht jetzt) | offen |

## Nachprüfung 2026-10-01 (Stand 2db675c)

Nachprüfer: Claude (fremde Sitzung, weder Bau noch erste Abnahme). Geprüft
nur, ob die Nacharbeit hält, was sie behauptet. `pnpm typecheck` und
`pnpm check:type` an `2db675c` Exit 0; `pnpm build` nicht nachgelaufen, der
Erbauer meldet ihn grün. Storybook 6107 bei 1280 × 900 in einem eigenen
Playwright-Kontext (danach geschlossen); `--grouped`, `--flat`, `--compact` ohne
Warnung oder Fehler in der Konsole. Story-IDs mit dem Präfix
`v3-entitäten-buchungssatz-journalentryreviewlist--`.

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| M8 Ausprägung = Code (Kriterium 9) | Zeile `full`: Datum · Gegenpartei (+ „erstmals") · Soll · (Kopf nur Screenreader „Kontoname Soll") · Haben · („Kontoname Haben") · Betrag · BU · Prüfung durch Ludwig · Satzart (nicht in Gruppen nach Satzart) · Prüfbedarf („entschieden"); „Nr." und „Beleg" nur über `include`. Code: `FULL` und `OPTIONAL = ["number", "document"]` (`JournalEntryReviewList.tsx:94`, `:97`), Köpfe „Soll" `:231`, `<span className="v2vh">Kontoname Soll</span>` `:245`, „Haben" `:252`, „Kontoname Haben" `:258`. DOM `--grouped`: Datum · Gegenpartei · Soll · „Kontoname Soll" (`v2vh`, 1 × 1 px, `clip-path: inset(50%)`) · Haben · „Kontoname Haben" (ebenso) · Betrag · BU · Prüfung durch Ludwig · Prüfbedarf · Aktionen (Satzart über `without`); `--flat` mit Satzart, ohne Namensspalten. Zeile `compact`: `--compact` Datum · Gegenpartei · Konten („4930 an 1600") · Betrag · Prüfung durch Ludwig | ✓ |
| M7 Messwerte | Text jetzt „Zeilen 64–106 px (vorher 67–88 laut Nachprüfung 2026-09-29; die höchste, 105,6 px, ist Fall 11 — dreizeiliger Kontoname plus „3 Zeilen")"; die Nachprüfung 2026-09-29 nennt `Grouped` 67–88 px. Gemessen `--grouped`: 63,7–105,6 px; die höchste ist 11.09.2026 Aral Tankstelle (Fall 11) mit einem Prüfbedarf-Grund, Kontoname Soll „Muster Bürobedarf GmbH" plus „3 Zeilen"; die nächsten 87,8 px | ✓ |
| M6 Satzart-Spur | Code `width: "100px"` (`:300`). `--flat`: Spur 100 px; „Dauerbuchung" in allen vier Zeilen (3, 6, 9, 12) 99,7 px, rechter Rand 0,3 px innerhalb der Zelle, 10,3 px Luft zum Text der Nachbarspalte, kein innerer Überlauf; „Rechnung" 73,5, „Zahlung" 62,7 px. `.v2tbl__scroll` 1246 = 1246. Spuren Gegenpartei 135,1, Soll/Haben je 96,5 px (Böden 120/68), wie in M6 vorausgerechnet. Screenshot `.playwright-mcp/np164-flat.png` | ✓ |
| M9 App-Pflichten | Kriterium „offen (App)" in der Liste des Nachtrags. `docs/befunde-app.md:375`, in §E (ab `:316`): Zeile `JournalEntryReviewList` (0164, Nachtrag 2026-10-01) mit (a) `accounts.debit`/`credit` nach Summe absteigend, Hauptkonto zuerst, und (b) `accountNames={false}` in der flachen Ansicht | ✓ |
| Story-Daten 1600 | `JournalEntryReviewList.stories.tsx:48–50`. `--grouped`: 1600 in fünf Zeilen (Fälle 6, 16, 21, 31, 36), `title` „1600 Verbindlichkeiten aus Lieferungen und Leistungen"; kein `title` „70021 Verbindlichkeiten …", 70021 nur noch mit „Muster Bürobedarf GmbH"; `--flat` Zeile 6 ebenso. `--grouped` 1246 = 1246, Spuren wie im Nachtrag (Gegenpartei 135,9, Soll 44, Name 97,1, Haben 44, Name 97,1), kein Gegenparteiname gekürzt, keine Nummer über ihre Spur | ✓ |

**Hinweise (keine Mängel).**

- Die Messwert-Tabelle des Nachtrags, Zeile `Flat`, nennt noch die Spuren vor
  M6 („Gegenpartei 142, Soll/Haben je 101 px"); seit `2db675c` sind es 135,1
  und 96,5 px (Zeile M6 oben). Kriterium 9 betrifft die Tabelle „Ausprägung",
  nicht diese.
- Die Satzart-Spur hat 0,3 px Reserve. Rendert die App „Dauerbuchung" breiter
  (andere Schriftglättung), liegt der Rest im Polster der Nachbarspalte, nicht
  auf ihrem Text (10,3 px Luft).

### Urteil

**Nachtrag 2026-10-01 abgenommen.** Die Nacharbeit hält, was sie behauptet:
M8 und M7 sind im Spec-Text behoben, M6 ist gemessen behoben, M9 ist an die
App übergeben, die Story-Daten stimmen. Kriterium 9 ist grün. Offen bleiben,
wie vorgesehen und nicht blockierend, das Kriterium „offen (App)" sowie M2
(setweit, Backlog 0213).
