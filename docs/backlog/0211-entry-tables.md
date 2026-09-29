# 0211 · Buchungstabellen — T1 Sätze, T2 Kontobewegungen, eine Beleg-Zelle

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-29 (T1, T2, Zelle, `totals`); T3 folgt als 0164; fremde Abnahme steht aus |
| Stufe | erweitert `journal-entry/journal-entry-columns.tsx` + `JournalEntryList` + `JournalEntryRow` (T1) · erweitert `account/AccountEntries.tsx` (T2) · neu `source-document/SourceDocumentRefCell` · erweitert `DataTable` um `totals` |
| Klassen-Test | T1/T2/Zelle: nein — Buchungssatz, Konto, Beleg. `DataTable.totals`: ja (Summenzeile gibt es in jeder Tabelle mit Beträgen) |
| Quelle | Design-Brief **F334** (`app/docs/backlog/F334-journal-entry-tables-design-brief.md`, Owner 2026-09-29 über ll-dev): „zig Anzeigen für die gleiche Entität … 2–3 Tabellen, kompakt und breit" |
| Regel (spec-schreiben §3) | 2 — erweitern: `JournalEntryList`/`journalEntryColumns` (0178/0175) und `accountEntryColumns`/`AccountEntryList` (0067) tragen den Fall zu vier Fünfteln; die Beleg-Zelle ist neu (5), weil keine Form „Belegfeld 1 + ob ein Beleg dahinter hängt" trägt |
| Ersetzt (App, per App-Spec danach) | A1, A2, A5 durch T1 (App-Spec F336); A3/A4 (Kontenblatt-Karten) und B1–B6 durch T2 kompakt (F337 Abnahme B4–B6, F338 Kontenblatt, Karten, Konto-Drawer B1–B3) — Nachtrag 2026-09-29 auf Hinweis ll-dev: auf dem Kontenblatt sind es Bewegungen eines Kontos, der Betrag gehört dem Konto. **B7 bleibt** (Sachverhalt, Reiter Plausibilität): offene Posten der Klammer mit Zeilenart, keine Kontobewegung. A6/A7, C3/C4 übernehmen Beleg-Zelle und Klickziele |
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
| `full` | Datum · Zeichen · Buchungszustand · Beleg · Buchungstext · Gegenkonto · Soll · Haben (· Saldo) · BU · Sachverhalt · Stapel · DATEV (Herkunftskennzeichen) |

Neu: Beleg-Zelle statt `MonoCell`, `documentHref`, `caseHref`, `taxKeyHref`,
`AccountEntryList` mit `entryHref` (ganze Zeile) und **Summenzeile**
`totals: { debit; credit; balance? }` — die App liefert die Summen über den
ganzen Bestand, nicht über die geladene Seite (E2).

## `DataTable.totals`

`totals?: { label: string; cells: Partial<Record<string, ReactNode>> }` (Schlüssel = Spaltenschlüssel des Aufrufers) — eine
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
| Beleg-Zelle: drei Zustände, kompakt und breit, Link führt `?document=` | Story Zelle | ✓ `SourceDocumentRefCell/States`: drei Zustände × zwei Breiten; Link `#document=doc-4471`, Titel „Beleg RE-4471 ansehen"; ohne Beleg `<span>` mit Titel „Kein Beleg zugeordnet", breit „ohne Beleg" darunter |
| T1 kompakt bei 600 px ohne horizontalen Scroll | `Compact` gemessen | ✓ scrollWidth 598 = clientWidth 598; Zeilen 52–54 px |
| T1 breit: Soll/Haben mit Namen, „+n" bei mehreren Konten | `InBatch` | ✓ mit Auflage — Namen ✓ (`InBatch` 1246 = 1246, „6815 Bürobedarf" 85 px); „+n" in `InBatch` nicht nachweisbar (kein Satz mit mehreren Konten einer Seite), nachgewiesen in `Mirror` („6020 Gehälter +1") → M5 |
| T1 DATEV: Kopf „DATEV-Abgleich", keine Herkunft | `Mirror` | ✓ Köpfe Datum · Beleg · Buchungstext · Soll · Haben · USt · Betrag · DATEV-Abgleich · Sachverhalt · Stapel; keine Herkunft |
| T2 kompakt im Aufklapper mit Summenzeile, Summe fett unter Soll/Haben | `InExpander` | ✓ 640 = 640, 12 Zeilen, 3 ohne Beleg; „Summe" 600, Soll-Summe x 436 = Kopf „Soll" x 436, Haben x 542 = 542 |
| Zustände nur über `StatusBadge` + Registry | alle | ✓ Code: `state`, `origin`, `status`, `mirrorMatch` nur `StatusBadge` + `StatusInfoButton` im Kopf; keine eigene Label-Map für Zustände |

## Gemessen 2026-09-29

| Wo | Ergebnis |
|---|---|
| T1 kompakt, 600 px | kein Querscroll; Buchung 122 px, Zeilenhöhe 54 px (zwei Zeilen) |
| T1 breit, 1280 px (Karte 1246) | kein Querscroll; Buchungstext 170, Soll/Haben je 85 px; unter 1180 px scrollt die Karte |
| T2 kompakt, 640 px | kein Querscroll; Buchungstext 100, Gegenkonto 56 px; Summenzeile unter Soll/Haben |
| Beleg-Link | 48 × 19 px — unter 24 px Höhe wie alle Text-Links des Sets (offener Punkt TextButton/Link) |

## Nachtrag 2026-09-29 — nichts verlieren, was die Daten hergeben

Owner-Regel über ll-cto (2026-09-29): „Kein Feature weglassen, das die Daten
hergeben. Ein DS-Entscheid ist kein Nachweis." ll-dev hat F336–F338 gegen die
heutigen Tabellen abgeglichen; was dabei wegfiel, ist jetzt **zuschaltbar** —
die Standardformen bleiben schlank.

| Tabelle | Zuschalten | Heute gezeigt in |
|---|---|---|
| T1 | `include: ["run"]` Durchgang („D2") · `include: ["exportRef"]` DATEV-ID | Stapel-Seite, Schritt 9, Schritt 11 „Sätze" |
| T2 | `balance` Saldo + `totals.balance` Endsaldo | Konto-Drawer „Nur in Ludwig" |
| T2 | `include: ["case"]` Sachverhalt als Link (`caseHref`) | Schritt 4 (zwei Stellen), Schritt 11, Konto-Drawer „DATEV" |
| T2 | `include: ["status"]` Buchungszustand — trennt Vorschlag, freigegeben, Mandantenstapel (`entryOrigin`) | Konto-Drawer, Schritt 4 |
| T2 | `include: ["batchId"]` Stapel | Konto-Drawer „DATEV" |
| T2 | `include: ["mirrorMatch"]` DATEV-Abgleich (Achse `mirror_match`) | Kontenblatt-Karte „Neueste Buchungen in DATEV" |
| T2 | `contraNames` Name des Gegenkontos sichtbar (F255) | Verrechnungskonten Schritt 4 |

Stories: `JournalEntryList/WithRunAndDatevId`, `AccountEntries/InDrawerWithAll`.
| T1 | `EntryRow.documentName` — Dateiname bzw. Belegform im Titel der Beleg-Zelle (Hinweis ll-dev 10) | Stapel-Liste, Spalte „Beleg" |
| T2 | `AccountEntry.counterparty` — Gegenpartei als zweite Zeile unter dem Buchungstext (Hinweis ll-dev 11) | Konto-Drawer „Nur in Ludwig", Karte „Neueste Vorschläge" |

## Fremde Abnahme 2026-09-29

Abnehmer: Claude (fremde Sitzung, nicht der Bauende). Grundlage: Code
(`journal-entry-columns.tsx`, `JournalEntryList.tsx`, `AccountEntries.tsx`,
`SourceDocumentRefCell.tsx`, `DataTable.tsx`), Storybook 6107 bei 1280 × 900
mit Playwright gemessen, `pnpm typecheck` · `check:language` · `check:when` ·
`check:type` · `check:contrast` grün (Exit 0).

Nachträglich geprüft (Abnehmer ergänzt, Nachtrag „nichts verlieren"):

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| T1 mit `include: ["run", "exportRef"]` bei 1280 px lesbar | `WithRunAndDatevId` | ✗ kein Querscroll (1246 = 1246), aber Buchungstext 52 px, Soll 26 px, Haben 26 px; Köpfe „Buchungstext"/„Soll" überlagern sich → M1 |
| T2 mit allem Zuschaltbaren lesbar | `InDrawerWithAll` (960 px) | ✗ Buchungstext **0 px**, Gegenkonto **0 px**, Querscroll 966 > 960 → M2 |
| Gegenpartei unter dem Buchungstext, `documentName` im Titel | `InDrawerWithAll`, `InBatch` | Titel ✓ („Beleg AR-2026-118 ansehen⏎Rechnung-RE-4471-Meier.pdf" — Daten s. M6); Gegenpartei in `InDrawerWithAll` wegen M2 unsichtbar |

### Mängel

**M1 — blockierend.** T1 mit zugeschalteten Spalten bricht bei 1280 px.
`JournalEntryList.tsx:184`: `minWidth` bleibt 1180, auch wenn `include` 216 px
(Durchgang 88 + DATEV-ID 128) hinzufügt. Gemessen in `WithRunAndDatevId`:
Buchungstext 52 px, Soll/Haben je 26 px (Konten nur „…"), Kopf „Buchungstext"
und „Soll" überlagert. Die Mindestbreite muss den zugeschalteten Spalten folgen
(dann scrollt die Karte, wie bei 0212 zugelassen) — sonst ist die Spalte
„zuschaltbar", aber die Buchung nicht mehr lesbar.

**M2 — blockierend.** T2 mit allem Zuschaltbaren verliert zwei Spalten.
`AccountEntries.tsx:488`: `minWidth={620}` fest. In `InDrawerWithAll` (960 px,
elf Spalten, feste Spuren 848 px) messen Buchungstext und Gegenkonto **0 px**,
dazu 6 px Querscroll (966 > 960). Genau die Spalten, deretwegen der Nachtrag
geschrieben wurde (Gegenpartei, Gegenkonto-Name), sind unsichtbar. Mindestbreite
aus den Spuren berechnen oder Buchungstext/Gegenkonto mit Boden
(`minmax(120px, …)`).

**M3 — nicht blockierend.** Trefferflächen unter 24 px Höhe an eigenständigen
Zielen in der Zeile: Beleg-Link 19,4 px, Konto-Link 20,9 px (breit) / 14 px
(kompakt), BU 22,5 × 16,5 px, Sachverhalt 20,9 px. Keine Inline-Links im Satz,
die Ausnahme „inline" aus WCAG 2.5.8 greift nicht; die Abstands-Ausnahme hält
gegen Nachbarzellen (Zeilenabstand ≥ 35 px), nicht aber gegen das Overlay des
Zeilenlinks darunter. Set-weiter offener Punkt (TextButton/Link), hier schon
benannt — bleibt offen, kein neuer Mangel dieses Bausteins.

**M4 — nicht blockierend.** Spec und Code weichen ab: (a) `DataTable.totals`
ist `Partial<Record<string, ReactNode>>` (`DataTable.tsx:432`), die Spec sagt
`Record<columnKey, ReactNode>`; (b) T2 `full` hat im Code zusätzlich die Spalte
„DATEV" (`markOfOrigin`, `AccountEntries.tsx:201`), die Tabelle T2 `full` nennt
sie nicht; (c) die Summenzeile steht auch über „leer", wenn der Aufrufer weder
`empty` noch `filtered` gibt (`DataTable.tsx:601/638`: `state` ist dann `null`)
— die Spec sagt „nicht bei leer".

**M5 — nicht blockierend.** Story `InBatch` erfüllt die eigene Beschreibung
nicht: kein Filter „ohne Beleg" und kein Satz mit mehreren Konten einer Seite
(„+n" nur in `Mirror` sichtbar).

**M6 — nicht blockierend.** Beispieldaten: Satz b4 „AR-2026-118" hängt an
`doc-4471` mit Titel „Rechnung-RE-4471-Meier.pdf"
(`JournalEntryList.stories.tsx:50–75`); jede Zeile trägt denselben Dateinamen.
Realistisch wäre je Beleg sein Name.

Tastatur (gemessen, `InBatch`): je Zeile sechs Fokus-Halte (Zeilenlink auf dem
Datum · Beleg · Soll · Haben · BU · Sachverhalt), Fokusring 2 px
`--color-focus` mit 2 px Abstand, `:focus-visible` ✓. Kontrast Beleg-Link
`--color-accent-700` 5,45:1 ✓.

Vier Linsen: **Sprache** — Köpfe und Leertexte in Kanzleiwörtern, „ohne Beleg"
statt Leerstelle, keine Versalien, kein Ausrufezeichen ✓. **Bedienung** — ganze
Zeile führt in den Satz, Fokus sichtbar; M3 offen. **Logik** — fünf Zustände in
`Empty`/`Filtered`/`LoadingAndError`, Summenzeile nicht bei Laden/Fehler ✓
(Randfall M4c). **Darstellung** — Zustände nur als `StatusBadge`, Vorzeichen
und Beträge grau, Beleg-Link durch Zeichen **und** Farbe ✓; Breiten als
px-Spuren in `ColumnDef` sind die Konvention aller Kataloge, kein neuer Verstoß.

### Urteil

**Nicht abgenommen.** Die sechs Kriterien der ursprünglichen Abnahme sind
erfüllt (eines mit Auflage M5); der Nachtrag „nichts verlieren" ist es nicht:
M1 und M2 machen die zugeschalteten Spalten bei der Zielbreite unlesbar.
Nach Behebung von M1/M2 genügt eine Nachmessung von `WithRunAndDatevId` und
`InDrawerWithAll`.

## Nachbesserung 2026-09-29 (Claude, nach der fremden Abnahme)

| Mangel | Behoben |
|---|---|
| M1 (blockierend) | T1 `full` rechnet die Mindestbreite aus den Spuren (Buchungstext `minmax(160px, 2fr)`, Soll/Haben `minmax(96px, 1fr)`) statt fest 1180. Gemessen `WithRunAndDatevId` bei 1280: Buchungstext 160, Soll/Haben je 96 px, die Karte scrollt (1494 in 1246) statt zu quetschen |
| M2 (blockierend) | T2 `AccountEntryList` nimmt `columnsMinWidth(columns)`; Buchungstext `minmax(100px, …)`, Gegenkonto mit Namen `minmax(120px, …)`. Gemessen `InDrawerWithAll` bei 960: Buchungstext 100, Gegenkonto 120 px, Scroll in der Karte (1204) |
| M4 | Summenzeile nur unter Zeilen (`all.length > 0`), nie über einem Leerfall. Spec-Tabelle T2 `full`: die Spalte „DATEV" (Herkunftskennzeichen) gehört dazu. `totals.cells` bleibt `Partial<Record<string, …>>`: Schlüssel sind die Spaltenschlüssel des Aufrufers |
| M3 | offen, setweiter Punkt (Text-Links unter 24 px) — eigener Auftrag |
| M5, M6 | Story- und Beispieldaten, nicht nachgezogen |

## Nachprüfung 2026-09-29

Abnehmer: Claude (fremde Sitzung). Stand 0efe1df, Storybook 6107, 1280 × 900,
Playwright. Maßstab: Mit zugeschalteten Spalten darf die Karte quer scrollen,
solange keine Spalte unter ihren Mindestwert fällt.

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M1 | `WithRunAndDatevId` | ✓ `.v2tbl__scroll` 1494 in 1246, scrollt in der Karte, Seite 1280 = 1280; jede Spalte auf ihrem Boden: Buchungstext 160, Soll 96, Haben 96 px, keine unter dem Mindestwert |
| M2 | `InDrawerWithAll` | ✓ 1204 in 960, scrollt in der Karte; Buchungstext 100, Gegenkonto 120 px, keine Spalte unter dem Mindestwert; Gegenpartei „Hartje KG" sichtbar |
| M4 (c) Summenzeile über leer | Code `DataTable.tsx:640` | ✓ `totals && !state && all.length > 0` |
| M4 (a, b) | Spec | ✗ nicht nachgezogen: Z. 76 (T2 `full`) nennt „DATEV" weiter nicht, Z. 85 sagt weiter `Record<columnKey, …>` — die Nachbesserung erklärt es nur |

**M7 — blockierend, neu.** Die Standardform T1 `full` (Ludwig) passt bei 1280 px
nicht mehr in die Karte. Mit den neuen Böden (Buchungstext 160, Soll/Haben je
96 px) ist die aus den Spuren gerechnete Mindestbreite größer als 1246 px.
Gemessen ohne jede Zusatzspalte: `InBatch` (ohne Stapel) 1258 in 1246,
`AtCase` (ohne Sachverhalt) 1274 in 1246 — die letzte Spalte liegt 12 bzw.
28 px hinter dem Querscroll. Mit allen elf Standardspalten wäre es noch mehr.
Das widerspricht der eigenen Messung oben („T1 breit, 1280 px: kein
Querscroll") und dem Maßstab, der Querscroll nur für zugeschaltete Spalten
erlaubt. `Mirror` (DATEV, ohne Herkunft) 1246 = 1246 ✓. Abhilfe z. B.
Buchungstext-Boden 160 → 120 px oder Herkunft 168 → 152 px; danach `InBatch`,
`AtCase` und einen Stapel mit allen elf Standardspalten bei 1280 messen.

Offen, nicht blockierend: M3 (setweit), M4 (a, b) in der Spec, M5, M6.

### Urteil (neu)

**Nicht abgenommen.** M1 und M2 sind behoben, aber die Nachbesserung hat M7
erzeugt: Die Standardform scrollt bei der Zielbreite.

## Nachbesserung 2 (2026-09-29, nach der Nachprüfung)

| Mangel | Behoben |
|---|---|
| M7 (blockierend) | Mindestwert des Buchungstexts in T1 `full` von 160 auf 120 px — die Standardform passt wieder in 1246 px, mit Zusatzspalten scrollt die Karte weiter statt zu quetschen |
| M4a, M4b | Spec-Tabellen nachgezogen: T2 `full` mit „DATEV", `totals.cells` als `Partial<Record<string, …>>` |

Gemessen nach Nachbesserung 2, 1280 px: `InBatch` 1246 = 1246 (Buchungstext 148 px), `AtCase` 1246 = 1246 (132 px), `Mirror` 1246 = 1246 (194 px). `InBucket` scrollt (1408 in 1246): die Zeilenaktion „Stornieren" ist eine Zusatzspalte (Aktionsspur ~190 px) und zählt wie `include` — der Aufrufer kann dort `without: ["origin"]` setzen, wenn der Export-Bucket ohne Querscroll stehen soll.

## Nachprüfung 2 2026-09-29

Abnehmer: Claude (fremde Sitzung). Stand 0ce6cff, Storybook 6107, 1280 × 900,
Playwright.

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M7 | `InBatch` | ✓ 1246 = 1246, Buchungstext 148 px, Soll/Haben 96 px |
| M7 | `AtCase` | ✓ 1246 = 1246, Buchungstext 132 px |
| M7 | `Mirror` | ✓ 1246 = 1246, Buchungstext 194 px |
| Gegenprobe | `WithRunAndDatevId` | ✓ scrollt in der Karte (1454 in 1246), keine Spalte unter ihrem Mindestwert (Buchungstext 120 = Boden, Soll/Haben 96) |
| M4a, M4b | Spec Z. 76, Z. 85 | ✓ T2 `full` mit „DATEV (Herkunftskennzeichen)"; `totals.cells` als `Partial<Record<string, ReactNode>>` |

**M8 — nicht blockierend (Begründung zu `InBucket`).** Die Begründung „die
Zeilenaktion zählt wie `include`" trägt nicht. `rowActions` ist keine
zuschaltbare Spalte, sondern die Handlung des Jobs 3 (Export-Bucket). Gemessen
scrollt `InBucket` 1408 in 1246, und die Aktionsspalte mit dem unumkehrbaren
„Stornieren" endet bei 1407 px, 143 px hinter dem Kartenrand (1264). Dieselbe
Lage (Aktion hinter dem Querscroll) war in 0164 M1 blockierend. Hier ist es
nicht blockierend, weil Stornieren selten ist und kein Hauptweg; Tastatur und
Scroll erreichen es. Auflage: Die Story zeigt den Bucket so, wie die Spec es
empfiehlt (`without: ["origin"]` oder eine schmalere Aktionsspur), und bei
1280 px steht die Aktion ohne Querscroll.

**M9 — nicht blockierend (berechnet, nicht gemessen).** Keine Story zeigt T1
`full` (Ludwig) mit **allen** elf Standardspalten, also mit Sachverhalt **und**
Stapel. Aus den Spuren gerechnet (feste Spuren 900 px, Böden 120 + 96 + 96,
zehn Abstände à 10 px) braucht diese Form rund 1312 px bei 1210 px Platz in
der Karte: Sie scrollt bei 1280 px um etwa 100 px. Alle drei genannten Rahmen
(Stapel, Sachverhalt, Bucket) nehmen eine der beiden Spalten heraus. Auflage:
Die Spec sagt, dass die volle Ludwig-Form nur mit `without` in 1280 px passt,
oder eine Story misst sie.

Offen, nicht blockierend: M3 (setweit), M5, M6, M8, M9.

### Urteil (neu)

**Abgenommen mit Auflagen**: M8 (Story `InBucket` ohne Querscroll der Aktion)
und M9 (volle Standardform benennen oder messen); M5/M6 bei Gelegenheit.

## Nachbesserung 3 (2026-09-29, Auflagen M8/M9)

- **M8:** Die Begründung zu `InBucket` war falsch — die Zeilenaktion ist die Handlung des Buckets, keine Zusatzspalte. Die Story nimmt jetzt `without: ["batch", "origin"]`; das unumkehrbare „Stornieren" steht in der Karte. Regel für Aufrufer: **eine Zeilenaktion muss bei 1280 px in der Karte stehen** — dafür weicht eine Spalte (`without`).
- **M9:** T1 `full` für Ludwig mit allen elf Standardspalten (Sachverhalt **und** Stapel) braucht ~1312 px und scrollt bei 1280 px in der Karte. Jeder heutige Rahmen hat eine der beiden leer und nimmt sie mit `without` heraus (Stapel-Seite: `batch`, Sachverhalt: `case`); wo beide nötig sind (Spiegel über mehrere Stapel), ist der Querscroll in der Karte die Regel des Sets.

## Nachtrag 2026-09-29 — Review F338 (ll-dev)

- **Mehrere Gegenkonten:** jede Nummer ist ein eigener Link ins Konto (erste mit Namen, weitere als Nummer, durch Komma); die Zelle bricht um statt „+n" im Titel zu verstecken. Gemessen: Spiegelsatz „6300, 1800" → zwei Links `#account=6300`, `#account=1800`.
- **Herkunft einer Ludwig-Zeile:** neue zuschaltbare Spalte `include: ["entryOrigin"]` „Herkunft" (Achse `journal_entry_origin`, (i) am Kopf): Vorschlag von Ludwig · Manuell · Regelwerk · Storno · Mandantenstapel. „Dauersachverhalt" hat kein Registry-Wort → Befund **L-360**.
- Gemessen `InDrawerWithAll` (960 px, mit Herkunft): scrollt in der Karte (1364), keine Spalte unter ihrem Mindestwert.

## Nachprüfung 2026-09-29 (Stand e0a0016/2188c44)

Abnehmer: Claude (fremde Sitzung). Geprüft wurden der Nachtrag Review F338
(Stand e0a0016) und M10 (Stand 2188c44), Storybook 6107 bei 1280 × 900 mit
Playwright.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Jedes Gegenkonto ein eigener Link | `InDrawerWithAll`, Zeile mit 6300/1800 | ✓ zwei Links `#account=6300` („6300 Sonstige Aufwendungen") und `#account=1800`, durch Komma getrennt; der Titel trägt die ganze Liste |
| Spalte „Herkunft" (`entryOrigin`) | `InDrawerWithAll` | ✓ nach „Buchungszustand", 150 px; Wörter der Registry: Vorschlag von Ludwig · Mandantenstapel · Manuell · Storno |
| 960 px mit allem: scrollt in der Karte, keine Spalte unter dem Mindestwert | `InDrawerWithAll` | ✓ 1364 in 960, keine Spalte gequetscht, Zeilen 52 px |
| Kompakte Form unverändert | `InExpander` | ✓ 640 = 640, Köpfe wie zuvor, Zeilen 34–37 px |
| ErrorRow: Was-Satz fett | `JournalEntryList/LoadingAndError`, `SourceDocumentList/LoadingAndError` | ✓ Gewicht 600, `role="alert"` |
| M10: (i) im Kopf von `AccountEntryList` | Stand e0a0016 | ✗ 0 Knöpfe im Tabellenkopf; `headerAside` wurde verworfen |
| M10 nachgeprüft | Stand 2188c44, `InDrawerWithAll`; Code `AccountEntries.tsx:501` | ✓ „Herkunft" trägt das (i) („Herkunft: Zustände erklären", 24 × 24 px), Kopfzeile 32 px. Im Code rendert der Kopf `c.headerAside` für **jede** Spalte; `mirrorMatch` hat es (`:298`, `StatusInfoButton axis="mirror_match"`) und bekäme es zugeschaltet genauso |

**Hinweis, nicht blockierend.** Die Spalte „Buchungszustand" (`status`) hat kein
(i). Sie mischt drei Achsen (`journal_entry`, `journal_entry_datev_stage`,
`journal_entry_origin`), deshalb gibt es keine eine Legende. Z4 verlangt das (i)
an jeder Status-Spalte. Dafür braucht es eine eigene Legende oder eine benannte
Ausnahme; ein neuer Mangel aus 2188c44 ist das nicht.

Der zweite Konto-Link („1800") misst 45 × 15 px; das gehört zu M3 (setweit).

### Urteil

**Abgenommen mit Auflagen**: M10 erledigt; offen bleiben M3 (setweit), M5, M6
und der Hinweis zu „Buchungszustand".
