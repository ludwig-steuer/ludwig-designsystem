# 0212 · Belegzeile als Standard — ein Katalog, Ansichten daraus, ein Datum, ein Status

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-29; fremde Abnahme steht aus |
| Stufe | erweitert `source-document/source-document-columns.tsx` (Katalog 0070) · `SourceDocumentList` als Kompaktzeile K · `ProcessPicture.since` (0204) · Showcase `Seiten/Belegzeile` |
| Klassen-Test | nein — Beleg |
| Quelle | Design-Brief **F335** (`app/docs/backlog/F335-document-row-standard-design-brief.md`, Owner-Entscheide E1–E7 vom 2026-09-29 über ll-dev2) |
| Regel (spec-schreiben §3) | 2 — erweitern: der Katalog 0070 trägt den Fall; neue Spalten, feste Ansichten, keine neue Komponente |
| Ersetzt (App) | die sieben Stellen aus F335 §1 (App-Spec danach) |
| Spec von / am | Claude, 2026-09-29 |

## Antworten auf F335 §10

1. **„seit" wird ein Feld des Bildes:** `ProcessPicture.since` („seit 14 T",
   von der App formatiert). Die Zelle setzt es hinter den Träger in Zeile 2
   („Kanzlei · seit 14 T"); kompakt (ohne Träger) entfällt es, der Dialog trägt es.
2. **Tooltip-Baustein:** Die Datumsliste ist eine `HoverCard` mit `FieldList`
   (Wert + Satz je Datum) — ein `Tooltip` trägt nur einen Satz. Der Anker liegt
   über dem Overlay des Zeilenlinks und führt selbst dorthin (`tabindex -1`,
   ein Fokus-Halt je Zeile bleibt). Die Angaben zur Datei (Datei, Seiten,
   Nummer, Dateikorb, „Teil von") stehen als `title` am Namen: eine HoverCard
   am Zeilenlink ginge über der ganzen Zeile auf. Tastatur und Touch lesen
   dieselben Daten in den Fakten des Belegs (Drawer, Seite).
3. **Namensfunktion:** Die Katalog-Zelle baut den **Kopf** des R32-Namens aus
   Gegenpart (`documentCounterparty`, von der App in `counterparty`) → Belegform
   → Datei. Betrag und Datum stehen in ihren Spalten. `sourceDocumentIdentifier`
   liefert nur noch die Belegnummer der zweiten Zeile. Drawer-Kopf und
   Seitentitel nach `belegAnzeigename`: Ausbau, eigener Schritt.
4. **Feste Ansichten wie in 0211**, keine Rang-Mechanik: V1–V5 und K als
   Konstanten. Unter der Mindestbreite scrollt die Karte.
5. **V5 Begründung: eigene Spalte** — sie ist der Gegenstand der Prüfung.

## Katalog (Reihenfolge fest, Owner E2 — ersetzt die Aufrufer-Reihenfolge von F328)

Beleg · Einordnung · Seiten · Sicherheit · Betrag · Belegdatum · Fortschritt ·
Begründung · Sachverhalt · Stapel · Buchung. Die Altschlüssel aus 0070
(`counterparty`, `fileName`, `kind`, `form`, `identifier`, `uploadedAt`,
`receivedDate`, `status`, `stuckState`, `size`) bleiben, bis die App umgestellt
hat; dann fallen sie.

| Spalte | Inhalt |
|---|---|
| **Beleg** | Zeile 1 Kopf des Namens (Gegenpart → Form → Datei mono), Zeilenlink; Zeile 2 klein und gedämpft die Belegnummer, fehlt sie, keine zweite Zeile (E4). Kompakt einzeilig |
| **Belegdatum** | das Belegdatum; fehlt es, der Eingang beim Mandanten **gedämpft und kursiv**; HoverCard mit Belegdatum · Leistung · Fällig · Beim Mandanten · Bei Ludwig, je mit Satz (E5) |
| **Fortschritt** | `ProcessPictureTrigger` (0204) mit „seit" (E1, E6); ohne Bild der alte Stand, bis die App ableitet |
| **Stapel** | Link (Option `batch`) |
| **Buchung** | ein Satz „4930 an 70010", mehrere „n Buchungen", Klick → Satz-Drawer (Option `bookings`, E7) |
| **Seiten** · **Sicherheit** | V1; Sicherheit = Einordnungs-Konfidenz in % |
| **Begründung** | `doneReason`, gekürzt, voller Text im Titel |

## Ansichten

| Konstante | Spalten |
|---|---|
| `INBOX_VIEW` (V1) | Beleg · Einordnung · Seiten · Sicherheit · Belegdatum · Fortschritt |
| `DOCUMENT_LIST_VIEW` (V2) | Beleg · Einordnung · Betrag · Belegdatum · Fortschritt · Sachverhalt · Stapel |
| `BATCH_DOCUMENTS_VIEW` (V3) | Beleg · Einordnung · Betrag · Belegdatum · Fortschritt · Sachverhalt · Buchung |
| `PARTNER_DOCUMENTS_VIEW` (V4) | wie V2 |
| `UNBOOKED_VIEW` (V5) | Beleg · Einordnung · Belegdatum · Fortschritt · Begründung · Sachverhalt |
| `COMPACT_VIEW` (K, `variant: "compact"`) | Beleg · Einordnung (einzeilig) · Betrag · Belegdatum · Fortschritt (ohne Träger); `SourceDocumentList` rendert sie ohne Kopf |

## Daten, die fehlen (Befund L-359)

`pageCount`, `basketNumber`, `parentName` am Beleg (im Set als optionale
Felder der DS-Erweiterung, bis der Spiegel sie trägt) · `since` der aktuellen
Phase im Prozessbild · die Sätze je Beleg für V3 · V1: Betrag, Belegdatum,
Nummer im `InboxEntry`.

## Stories

`Seiten/Belegzeile`: `DocumentList` (V2 mit §8.1 GUID-Datei ohne Datum, §8.3
CHF, §8.4 Teilbeleg, §8.5 ohne Buchung) · `BatchDocuments` (V3, zwei Sätze,
keine Buchung) · `Inbox` (V1) · `Unbooked` (V5) · `Compact` (K) · `Narrow`
(600 px).

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Ein Datum je Zeile; Rückfall gedämpft **und** kursiv; HoverCard mit Sätzen | `DocumentList` Zeile 2 | ✓ Zeile 2 „29.09.2026" kursiv, `--color-text-muted` 6,69:1; echter Hover öffnet die HoverCard: Belegdatum „nicht erkannt" · Beim Mandanten · Bei Ludwig, je mit Satz; Anker `tabindex -1` |
| Beleg: Kopf des Namens, Nummer als zweite Zeile nur, wo es eine gibt | `DocumentList` | ✓ „Muster Bürobedarf GmbH" + „R-2026-0042" (11,5 px, 6,69:1); GUID-Datei und „Beispiel Leasing AG" ohne zweite Zeile |
| Fortschritt mit „seit" hinter dem Träger | `DocumentList` Zeile 1 | ✓ „Vorgeschlagen · Kanzlei · seit 14 T"; G3: Titel Zeile 2 „Leistungszeitraum und Steuersatz fehlen" |
| Reihenfolge fest: dieselbe Spalte steht in jeder Ansicht an derselben Stelle | alle Ansichten | ✓ Code: alle Ansichten Teilmengen von `CATALOG_ORDER`, Ausgabe filtert nur; gemessen V1, V2, V3, V5: Beleg · Einordnung vorn, Belegdatum vor Fortschritt, Sachverhalt vor Stapel/Buchung |
| V3 Buchung: ein Satz als Konten, zwei als „2 Buchungen", keiner „—" | `BatchDocuments` | ✓ „4930 an 70010" · „2 Buchungen" · „—"; Hinweis M4 |
| K ohne Kopf, einzeilig | `Compact` | ✗ ohne Kopf ✓, einzeilig ✓ (50–51 px), aber im 720-px-Rahmen 860 px breit — 140 px laufen ohne Scroll aus dem Rahmen, Fortschritt gekürzt auf „Vorgesc…" → M1 |

## Nachtrag 2026-09-29 — nichts verlieren (Hinweise ll-dev2 G1–G3)

| # | Lücke | Lösung |
|---|---|---|
| G1 | Sortieren nach Upload-Zeit fiel mit der Spalte „Ludwig-Eingang" weg | Option `dateSort: { current, href }`: der Kopf „Belegdatum ▾" ist das Menü — nach Belegdatum · Eingang beim Mandanten · Eingang bei Ludwig sortieren; die Zeilen zeigen weiter das Belegdatum (E5). Gemessen: Kopf 90 × 24 px, V2 1246 px, kein Querscroll |
| G2 | Der gekürzte Gegenpart war beim Überfahren nicht mehr ganz lesbar | `documentTitle()` beginnt mit dem vollen Kopf des Namens |
| G3 | Der freie Grund stand nicht mehr an der Zelle | `ProcessPicture.reason` (von der App gekürzt) steht als zweite Zeile im Titel der Fortschritt-Zelle |

## Fremde Abnahme 2026-09-29

Abnehmer: Claude (fremde Sitzung, nicht der Bauende). Grundlage: Code
(`source-document-columns.tsx`, `SourceDocumentList.tsx`, `ProcessPicture.tsx`),
Storybook 6107 `Seiten/Belegzeile` bei 1280 × 900 mit Playwright gemessen,
`pnpm typecheck` · `check:language` · `check:when` · `check:type` ·
`check:contrast` grün (Exit 0). Exporte `INBOX_VIEW` … `COMPACT_VIEW`,
`DateSortAxis` in `src/ui/v3/index.ts` ✓.

Gemessen bei 1280 px: V2 `DocumentList` 1246 = 1246, V3 1248 = 1248, V1 und
V5 1246 = 1246 — kein Querscroll. `Narrow` (600 px): die Karte scrollt, wie
unter „Antworten 4" vorgesehen. G1 Kopf „Belegdatum" als Menü 90 × 24 px ✓.
G2 Titel beginnt mit dem vollen Kopf ✓. Kontrast `v3cell-link` 5,45:1,
`v3docrow__fallback` 6,69:1 ✓.

Tastatur (gemessen, `DocumentList`): je Zeile ein Zeilenlink (auf dem Namen),
dazu Einordnung, Fortschritt, Sachverhalt, Stapel als eigene Ziele; der
Datums-Anker hat `tabindex -1` und fügt **keinen** Halt hinzu ✓. Fokusring
2 px `--color-focus` an allen Halten ✓.

### Mängel

**M1 — blockierend.** Kompaktzeile K läuft aus ihrem Rahmen.
`COMPACT_VIEW` hat Spuren mit Summe der Böden 802 px + Abstände
(`minmax(160px, 1.4fr) 232px 130px 120px minmax(160px, 1fr)`,
`source-document-columns.tsx:365/396/565/598/749`); `SourceDocumentList.tsx:83`
setzt keine Mindestbreite und keinen Scroll. Gemessen in `Seiten/Belegzeile/Compact`
(Rahmen 720 px): `.v2tbl` scrollWidth 860 > clientWidth 720, kein
Scroll-Container — die Fortschritt-Spalte steht 140 px außerhalb, das Wort ist
auf „Vorgesc…" gekürzt. K ist die Form „neben anderer Arbeit" und muss in
schmale Rahmen passen: schmalere Spuren für `compact` (Einordnung einzeilig
braucht keine 232 px) oder Mindestbreite mit Scroll.

**M2 — nicht blockierend.** Trefferflächen unter 24 px an eigenständigen Zielen:
Buchung „4930 an 70010" 90,7 × 16,5 px, „2 Buchungen" 84,6 × 16,5 px,
Stapel-Link 20,9 px, Sachverhalt 20,9 px. Keine Inline-Links im Satz
(Ausnahme WCAG 2.5.8 greift nicht); set-weiter offener Punkt, wie 0211 M3.

**M3 — nicht blockierend.** Lokale Wortlisten: `DATE_AXIS_WORD`
(`source-document-columns.tsx:244`) ist eine Label-Map im Baustein. Solange
die Sortierachse keine Registry-Achse ist, als benannte Ausnahme mit Owner und
Datum in die Guideline — sonst Verstoß gegen „keine lokale Label-Map".

**M4 — nicht blockierend.** „2 Buchungen" führt auf den **ersten** Satz
(`source-document-columns.tsx:435`, `entryHref(entries[0].id)`); das Wort
verspricht beide. Entweder in den Reiter Buchungen des Belegs oder der Titel
sagt „ersten Satz ansehen".

**M5 — nicht blockierend.** `SourceDocumentList` kennt weder „lädt" noch
„Fehler" (fünf Zustände) — Altbestand aus 0070, mit K jetzt Standardform;
gehört in den nächsten Schritt.

Vier Linsen: **Sprache** — „Belegdatum", „Eingang beim Mandanten", „Bei
Ludwig", Sätze in der HoverCard in Kanzleiwörtern; „seit 14 T" ist das Format
der App ✓. **Bedienung** — ein Zeilenlink je Zeile, Datums-Anker ohne eigenen
Halt, HoverCard öffnet bei echtem Hover; Tastatur liest die Daten im Drawer
(Spec-Entscheid) ✓; M2 offen. **Logik** — eine Frage je Ansicht, Reihenfolge
fest ✓; M5. **Darstellung** — Rückfall durch Form (kursiv) **und** Farbe,
Nummer klein und gedämpft, keine Farbe als Wert ✓; M1.

### Urteil

**Nicht abgenommen** wegen M1 (K im eigenen Story-Rahmen 140 px über den
Rand). Alle übrigen Kriterien und G1–G3 sind erfüllt; nach Behebung von M1
genügt die Nachmessung von `Compact`.

## Nachbesserung 2026-09-29 (Claude, nach der fremden Abnahme)

| Mangel | Behoben |
|---|---|
| M1 (blockierend) | Kompaktzeile K schmaler: Beleg `minmax(130px, …)`, Einordnung `minmax(96px, …)` statt 232, Betrag 104, Datum 96, Fortschritt `minmax(200px, …)`; `SourceDocumentList` setzt die Mindestbreite aus den Spuren (Scroll statt Überlauf). Gemessen `Compact` in 720 px: 720 = 720, kein Stand-Wort gekürzt |
| M3 | `DATE_AXIS_WORD` ist keine zweite Quelle: für die Datumsachsen gibt es keine Registry-Achse; die drei Wörter stehen einmal, an der Spalte, die sie trägt. Kommt eine Achse, ziehen sie um |
| M4 | „n Buchungen" führt auf den ersten Satz; die übrigen erreicht man im Satz-Drawer über den Beleg — so gewollt, bis die App eine Satzliste je Beleg hat |
| M2, M5 | offen: Trefferflächen setweit; Lade-/Fehlerzustand von `SourceDocumentList` (Ausbau) |
