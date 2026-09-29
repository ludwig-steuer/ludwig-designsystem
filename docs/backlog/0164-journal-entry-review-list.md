# 0164 · JournalEntryReviewList — die Vorschläge eines Stapels prüfen

| | |
|---|---|
| Status | **Abnahme — gebaut 2026-09-29**; aus dem Backlog geholt 2026-09-29 (F334 T3, Owner-Auftrag über ll-dev; ersetzt den Default „bis `export-batch` steht"). Gebaut nach Abnahme von 0211, ohne Sortierung nach Aufmerksamkeit (L-295) und ohne `DiffView` |
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
| `full` | Nr. · Datum · Gegenpartei (+ „erstmals") · Soll · Haben (nur Nummern, „n Zeilen") · Betrag · BU · Prüfung durch Ludwig · Satzart (nicht in Gruppen nach Satzart) · Prüfbedarf („entschieden") |
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
