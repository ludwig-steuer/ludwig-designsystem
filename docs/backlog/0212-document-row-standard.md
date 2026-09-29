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
| Ein Datum je Zeile; Rückfall gedämpft **und** kursiv; HoverCard mit Sätzen | `DocumentList` Zeile 2 | |
| Beleg: Kopf des Namens, Nummer als zweite Zeile nur, wo es eine gibt | `DocumentList` | |
| Fortschritt mit „seit" hinter dem Träger | `DocumentList` Zeile 1 | |
| Reihenfolge fest: dieselbe Spalte steht in jeder Ansicht an derselben Stelle | alle Ansichten | |
| V3 Buchung: ein Satz als Konten, zwei als „2 Buchungen", keiner „—" | `BatchDocuments` | |
| K ohne Kopf, einzeilig | `Compact` | |
