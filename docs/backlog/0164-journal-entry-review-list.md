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
