# 0211 · Buchungstabellen — T1 Sätze, T2 Kontobewegungen, eine Beleg-Zelle

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-29 (T1, T2, Zelle, `totals`); T3 folgt als 0164; fremde Abnahme steht aus |
| Stufe | erweitert `journal-entry/journal-entry-columns.tsx` + `JournalEntryList` + `JournalEntryRow` (T1) · erweitert `account/AccountEntries.tsx` (T2) · neu `source-document/SourceDocumentRefCell` · erweitert `DataTable` um `totals` |
| Klassen-Test | T1/T2/Zelle: nein — Buchungssatz, Konto, Beleg. `DataTable.totals`: ja (Summenzeile gibt es in jeder Tabelle mit Beträgen) |
| Quelle | Design-Brief **F334** (`app/docs/backlog/F334-journal-entry-tables-design-brief.md`, Owner 2026-09-29 über ll-dev): „zig Anzeigen für die gleiche Entität … 2–3 Tabellen, kompakt und breit" |
| Regel (spec-schreiben §3) | 2 — erweitern: `JournalEntryList`/`journalEntryColumns` (0178/0175) und `accountEntryColumns`/`AccountEntryList` (0067) tragen den Fall zu vier Fünfteln; die Beleg-Zelle ist neu (5), weil keine Form „Belegfeld 1 + ob ein Beleg dahinter hängt" trägt |
| Ersetzt (App, per App-Spec danach) | A1, A2, A5 durch T1 (App-Spec F336); A3/A4 (Kontenblatt-Karten) und B1–B7 durch T2 kompakt (F337) — Nachtrag 2026-09-29 auf Hinweis ll-dev: auf dem Kontenblatt sind es Bewegungen eines Kontos, und der Betrag gehört dem Konto, nicht dem ganzen Satz; A6/A7, C3/C4 übernehmen Beleg-Zelle und Klickziele |
| Spec von / am | Claude, 2026-09-29 |

## Entscheide zu F334 §7

1. **Spiegelsätze in T1: dieselbe Tabelle.** Die Frage ist dieselbe („was
   steht in diesem Bestand"), die Spalten auch. Ein Bestand hat genau eine
   Herkunft — ein Stapel ist Ludwig, der Spiegel ist DATEV —, deshalb sagt die
   Tabelle das einmal mit `source: "ludwig" | "datev"`: Die Zustandsspalte heißt
   dann „Weg nach DATEV" (Achse `journal_entry_datev_stage`) bzw.
   „DATEV-Abgleich" (Achse `mirror_match`), die Spalte Herkunft entfällt bei
   DATEV. Dafür nimmt T1 eine neutrale Zeile `EntryRow`; zwei Umformer
   (`entryRowFromJournalEntry`, `entryRowFromMirror`) bringen die beiden
   App-Typen hinein — Formwechsel, keine Ableitung.
2. **Konten in T1: breit zwei Spalten Soll · Haben**, je Konto mit Namen, bei
   mehreren Konten einer Seite das erste und „+n". Die Sachbearbeiterin
   scannt die Soll-Spalte eines Stapels von oben nach unten („alles auf 6805?")
   — in einer „A an B"-Spalte steht das Soll-Konto mal hier, mal dort.
   **Kompakt eine Spalte „Konten"** „6805 an 1800" ohne Namen (`JournalEntryCell`),
   bei mehr als zwei Zeilen „n Zeilen".
3. **Feste Ausprägungen, kein Container-Query, keine Nutzerwahl.**
   `variant: "compact" | "full"` (das Wort aus `accountEntryColumns`, 0067).
   Der Aufrufer kennt den Rahmen (Drawer, Aufklapper, Seite); eine Tabelle, die
   beim Ziehen des Fensters Spalten verliert, springt (V11) und sieht nach vier
   Wochen anders aus als gestern. `without` nimmt Spalten weg, die im Rahmen
   leer wären (Sachverhalt im Sachverhalt, Stapel im Stapel). Was kompakt
   fehlt, steht im Satz-Drawer — die ganze Zeile führt hinein; ein eigener
   Hinweis „Spalten ausgeblendet" ist nicht nötig.
4. **T2 kompakt: zwei Spalten Soll · Haben.** Das Konto wird in Soll und Haben
   gelesen (DATEV-Kontoblatt); ein Betrag mit Vorzeichen hieße bei einem
   Aufwandskonto etwas anderes als bei einem Erlöskonto. Zwei Spalten à 104 px
   passen in 560 px.
5. **T3 jetzt, als zweiter Schritt.** 0164 wird aus dem Backlog geholt: der
   Owner-Auftrag ersetzt den Default „bis `export-batch` steht". Gebaut wird
   T3 nach Abnahme von T1/T2, ohne Sortierung nach Aufmerksamkeit (L-295) und
   ohne `DiffView` — beides bleibt Ausbau.

## Beleg-Zelle `SourceDocumentRefCell`

| Zustand | kompakt | breit |
|---|---|---|
| Beleg zugeordnet (Satz-Kante `source_doc_id`) | Beleg-Zeichen + Belegfeld 1 als Link (`?document=`); ohne Nummer Zeichen + „Beleg" | gleich |
| kein Beleg, Belegfeld 1 gesetzt | Nummer gedämpft, Titel „Kein Beleg zugeordnet" | Nummer gedämpft, darunter „ohne Beleg" |
| nichts | „ohne Beleg" gedämpft | „ohne Beleg" gedämpft |

Spaltenkopf **„Beleg"**; die Nummer ist ihr Text. Zeichen und Link sind die
Form, die „zugeordnet" von „nicht zugeordnet" unterscheidet — nicht die Farbe.

## T1 · Sätze — `journalEntryColumns` / `JournalEntryList` / `JournalEntryRow`

| Ausprägung | Spalten in Lesereihenfolge |
|---|---|
| `compact` | Datum · Beleg · **Buchung** (Buchungstext, darunter „6815 an 1800") · Betrag · Zustand (ohne Zeichen) — gemessen 2026-09-29: sechs einzeilige Spalten ließen dem Text bei 600 px 25 px |
| `full`, `ludwig` | Datum · Beleg · Buchungstext · Soll · Haben · USt · Betrag · Weg nach DATEV · Herkunft · Sachverhalt · Stapel |
| `full`, `datev` | Datum · Beleg · Buchungstext · Soll · Haben · USt · Betrag · DATEV-Abgleich · Sachverhalt · Stapel |

Klickziele: ganze Zeile `entryHref` · Konto `accountHref` · Beleg
`documentHref` · BU `taxKeyHref` · Sachverhalt `caseHref` · Stapel
`batchHref`. `totals` optional (Σ Betrag). **Gestrichen:** Durchgang und
DATEV-ID als Spalte — Technik, gehört in den Satz-Drawer (T4).

## T2 · Kontobewegungen — `accountEntryColumns` / `AccountEntryList`

| Ausprägung | Spalten |
|---|---|
| `compact` | Datum · Zeichen · Beleg · Buchungstext · Gegenkonto (nur Nummer, Name im Titel) · Soll · Haben (· Saldo) — bei 640 px Buchungstext 100 px |
| `full` | Datum · Zeichen · Buchungszustand · Beleg · Buchungstext · Gegenkonto · Soll · Haben (· Saldo) · BU · Sachverhalt · Stapel |

Neu: Beleg-Zelle statt `MonoCell`, `documentHref`, `caseHref`, `taxKeyHref`,
`AccountEntryList` mit `entryHref` (ganze Zeile) und **Summenzeile**
`totals: { debit; credit; balance? }` — die App liefert die Summen über den
ganzen Bestand, nicht über die geladene Seite (E2).

## `DataTable.totals`

`totals?: { label: string; cells: Record<columnKey, ReactNode> }` — eine
Zeile unter den Daten, im selben Raster, Wort in der ersten Spalte, Werte unter
ihren Spalten, fett, Trennlinie darüber. Nicht bei Laden, Fehler, leer.

## Stories

T1 `JournalEntryList`: `InBatch` (breit, gruppiert, mit Filter „ohne Beleg") ·
`Compact` (Kontenblatt-Karte, 5 Zeilen) · `Mirror` (breit, DATEV) · `AtCase`
(ohne Sachverhalt) · `Empty` · `Filtered` · `LoadingAndError`. T2
`AccountEntries`: bestehende plus `InExpander` (kompakt, Konto 1800, 12 Sätze,
3 ohne Beleg, Summenzeile). Zelle: `SourceDocumentRefCell` drei Zustände ×
zwei Breiten.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Beleg-Zelle: drei Zustände, kompakt und breit, Link führt `?document=` | Story Zelle | |
| T1 kompakt bei 600 px ohne horizontalen Scroll | `Compact` gemessen | |
| T1 breit: Soll/Haben mit Namen, „+n" bei mehreren Konten | `InBatch` | |
| T1 DATEV: Kopf „DATEV-Abgleich", keine Herkunft | `Mirror` | |
| T2 kompakt im Aufklapper mit Summenzeile, Summe fett unter Soll/Haben | `InExpander` | |
| Zustände nur über `StatusBadge` + Registry | alle | |

## Gemessen 2026-09-29

| Wo | Ergebnis |
|---|---|
| T1 kompakt, 600 px | kein Querscroll; Buchung 122 px, Zeilenhöhe 54 px (zwei Zeilen) |
| T1 breit, 1280 px (Karte 1246) | kein Querscroll; Buchungstext 170, Soll/Haben je 85 px; unter 1180 px scrollt die Karte |
| T2 kompakt, 640 px | kein Querscroll; Buchungstext 100, Gegenkonto 56 px; Summenzeile unter Soll/Haben |
| Beleg-Link | 48 × 19 px — unter 24 px Höhe wie alle Text-Links des Sets (offener Punkt TextButton/Link) |
