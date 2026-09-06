# Beleg — Detailseite · Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/documents/[sourceDocId]/page.tsx` (550 Z.) — **jahres-los**, Identifikation nur über die Basis-Id |
| Heute gebaut in | `modules/source-docs/ui/` — `SourceDocFamily.tsx`, `DocTabsBar.tsx`, `SourceDocBelegTab.tsx`, `SourceDocPipelineTab.tsx`, `SourceDocVerlaufTab.tsx`, `DocCompletionControl.tsx`, `DocActionsMenu.tsx`, `SourceDocDateEditor.tsx`; dazu `modules/invoices/ui/InvoiceSidebar.tsx`, `ProcessingProgress`, `InvoiceListNav`, `InvoiceShortcuts` und `modules/contracts/ui/ContractDetail.tsx` |
| Entitäten | Beleg (`docs/entitaeten/source-document.md`) · Rechnung und Vertrag als Ausprägungen · Sachverhalt (Verweis) · Datei |
| Baustein in v3 | noch keiner — Aufgabe **0071** `SourceDocumentView` |
| Fachliche Quelle | `ludwig/app`: `modules/source-docs/domain/tabs.ts` (Tab-Katalog, decision-log 2026-07-20 „eine Shell für jede Belegart") |
| Profil von / am | Claude, 2026-09-07 · gelesen: Route, Tab-Katalog, die neun UI-Dateien oben |

## Job

> Wenn **ein Beleg auffällt — in einer Liste, an einem Sachverhalt oder weil
> die Pipeline ihn liegen ließ**, will **die Sachbearbeiterin der Kanzlei**
> **sehen, was auf dem Papier steht und was Ludwig daraus gemacht hat**, damit
> **sie den einen Wert richtigstellt, der falsch ist — oder den Beleg
> abhaken kann**.

- **Fertig ist sie, wenn** der Beleg entweder erledigt ist (mit Grund, wenn er
  nicht gebucht wird) oder sie den Weg zum Sachverhalt genommen hat, wo die
  Arbeit weitergeht.
- **Misslungen ist die Seite, wenn** sie das Original nicht sieht und deshalb
  der Extraktion glaubt — oder wenn sie nicht erkennt, dass ein Wert **fehlt**,
  weil ein leeres Feld wie ein leeres Feld aussieht und nicht wie ein Mangel.

Diese Seite wird selten hundertmal hintereinander bedient, sondern **einmal
pro Zweifel**. Das kehrt die Rangfolge um: nicht Tempo, sondern Nachweis —
jeder Wert braucht sichtbar seine Quelle, denn wer hier ist, hat einen
Verdacht mitgebracht.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Welcher Beleg ist das — wer, welche Art, welche Nummer?" | Kopf: Gegenpart als Titel (sonst die Belegart), Belegart als Chip, Kennung | `EntityHeader`, `SourceDocumentCell` |
| 2 | „Stimmt, was ich sehe, mit dem Papier überein?" | Das Original, groß, links — **nicht** hinter einem Klick | `SourceDocumentPreview` (0075) |
| 3 | „Was hat Ludwig daraus gelesen?" | Fakten der Ausprägung rechts: Rechnungsdaten, Vertragsfelder, sonst die generischen Punkte | `SourceDocumentFacts` (0076) |
| 4 | „Wie weit ist er — und wartet er auf mich?" | Einordnung (4 Achsen), Verarbeitung (`beleg`), Erledigung (`beleg_erledigung`) | `SourceDocumentClass`, `StatusBadge` |
| 5 | „Kann ich den einen falschen Wert hier korrigieren?" | Belegdatum, Einordnung, Erledigung, DATEV-Ablage — je Wert an seinem Platz | `InlineEdit` je Punkt (0071 Ausbau) |
| 6 | „Wo gehört er hin?" | „Zum Sachverhalt →", bei einem Sammel-PDF die Kinder, beim Teilbeleg das Original | `Link`, `SourceDocumentList` |
| 7 | „Warum hat es nicht funktioniert?" | Verlauf & Befunde: Extraktions-Logs, LLM-Aufrufe, Jobs | Reiter `verlauf`, `LogList` |
| 8 | „Was genau ist gelaufen?" | Pipeline-Schritte mit Zeiten | Reiter `pipeline` |
| 9 | „Was steht wirklich in der Zeile?" | Rohdaten, Tabelle für Tabelle | Reiter `rohdaten`, `RawDataView` |

Rang 1–4 stehen **ohne Scrollen und ohne Klick**. Rang 5 kostet einen Klick am
Wert selbst, nie einen Wechsel der Ansicht. Rang 6 ist ein Knopf. Rang 7–9
sind Reiter und dürfen es sein: sie beantworten Fragen, die nur bei einem
Fehler gestellt werden.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Zum nächsten Beleg derselben Liste (`InvoiceListNav`, `1/117`) | bei Reihenarbeit ständig, sonst nie — geschätzt | eine **Taste** (`J`/`K`), kein Klick |
| Zurück zur Liste, aus der sie kam | jedes Mal | ein Knopf, der die Liste **nennt** (heute: „← Belege" bzw. „← Problematische Belege", je nach Belegdatum) |
| Positionen einer Rechnung prüfen | nur bei Rechnungen, geschätzt jede fünfte | einen Reiter (`positionen`) |
| Vorsteuer prüfen | nur bei Rechnungen mit VSt-Fakten | einen Reiter (`vorsteuer`) |
| Neu verarbeiten, zurücksetzen, DATEV-Meta importieren | selten, im Fehlerfall | ein Menü (`DocActionsMenu`) — nie ein Knopf in der ersten Reihe |

## Was hier nicht hingehört

- **Die Liste selbst.** Vor und Zurück ja, aber keine eingebettete Tabelle:
  wer hier ist, hat einen Beleg gewählt.
- **Der Sachverhalt.** Ein Verweis, keine zweite Ansicht — die
  Sachverhaltsseite hat ihr eigenes Profil und beantwortet andere Fragen.
- **Der Buchungssatz.** Er gehört dem Ereignis am Sachverhalt. Was hier
  stehen darf, ist der Hinweis, **dass** er existiert.
- **Hochladen.** Ein Beleg entsteht in der Inbox oder am Sachverhalt, nicht
  auf der Detailseite eines anderen Belegs.

## Zweifel am heutigen Format

1. **Zwei Kopfzeilen für dieselbe Sache.** Der Titel zeigt die Gegenpartei,
   daneben stehen Belegart-Chip, Kategorie-Badge und bis zu zwei
   Status-Knöpfe — und rechts noch einmal Erledigt-Steuerung und Menü. Das ist
   eine Zeile mit sieben Aufgaben. Folgerung: `EntityHeader` mit **einem**
   Zustandsblock, die Aktionen dahinter.
2. **Der erste Reiter heißt dreierlei** („Buchung", „Vertrag", „Beleg") und
   zeigt in allen drei Fällen dasselbe: das Original. Was sich unterscheidet,
   ist die **Box daneben**. Folgerung: der Reiter heißt für jede Belegart
   gleich; die Ausprägung steckt in den Fakten, nicht in der Aufschrift.
3. **Drei Reiter für einen Fehlerfall.** Verlauf & Befunde, Pipeline und
   Rohdaten beantworten dieselbe Frage in drei Tiefen. Folgerung: **ein**
   Reiter „Verlauf", der von Zusammenfassung zu Rohdaten aufklappt — oder,
   wenn das zu weit geht, die beiden Debug-Reiter hinter einen Schalter, der
   sagt, dass er für die Entwicklung da ist.
4. **`ProcessingProgress` läuft nur bei Rechnungen.** Ein Vertrag, der in der
   Extraktion hängt, zeigt keinen Fortschritt — nur einen leeren Fakten-Block.
   Folgerung: der Fortschritt hängt am Beleg, nicht an der Rechnungszeile.
5. **Das fehlende Belegdatum sieht aus wie ein leeres Feld.** Es ist der
   häufigste Mangel („Datum fehlt", Achse `beleg_haenger`) und die
   Hauptaufgabe dieser Seite — Rang 5. Folgerung: fehlende Pflichtwerte
   stehen als **Mangel** da, mit dem Weg, ihn zu beheben, nicht als Leerzeile.
6. **Die Seite aktualisiert sich selbst** (`SourceDocAutoRefresh`), solange
   der Beleg unklassifiziert ist. Das ist richtig — aber sie sagt es nur im
   Banner-Text. Folgerung: bleibt, und der Satz wandert in den Banner-Titel
   („wird eingeordnet — die Seite aktualisiert sich selbst").

## Offene Fragen

Höchstens drei, jede mit Vorgabewert:

1. **Bleiben es sechs Reiter oder vier?** *Ohne Antwort: vier* — Beleg,
   Positionen, Vorsteuer, Verlauf; Pipeline und Rohdaten wandern in den
   Verlauf als aufklappbare Tiefe (Zweifel 3).
2. **Trägt der View die `InlineEdit`-Werte oder ein eigener Editor?** *Ohne
   Antwort: der View*, je Wert ein optionaler Callback — so steht es im
   Zuschnitt des Entitätsprofils („kein Formular, sondern `InlineEdit` je
   Wert im View").
3. **Gehört die Vor/Zurück-Navigation der Seite oder dem Baustein?** *Ohne
   Antwort: der Seite.* Sie kennt die Liste, aus der die Rolle kam; der
   Baustein bekommt nur `prevHref`/`nextHref` und die Position.
