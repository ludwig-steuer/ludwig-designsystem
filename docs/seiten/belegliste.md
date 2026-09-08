# Belegliste — Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/documents/page.tsx` (551 Z.) |
| Heute gebaut in | die Seite selbst (neun Zellen inline), `modules/invoices/ui/` — `InvoiceListTabsBar`, `InvoiceFilterForm`; `modules/source-docs/ui/StuckDocumentsTable` |
| Entitäten | Beleg (`source-document`), am Rand Sachverhalt und Geschäftspartner |
| Baustein in v3 | `entities/source-document/source-document-columns.tsx` (0070) — `DOCUMENT_LIST_COLUMNS` und `STUCK_COLUMNS` stehen bereits |
| Fachliche Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Abschnitt „Listen" (Zeilen „Belegliste des Jahres" und „Stockende Belege") |
| Profil von / am | Claude (ludwig-worker), 2026-09-08 |

## Job — J-02

> Wenn **ein Buchungsmonat abgeschlossen werden soll**, will **die Kanzlei**
> **alle Belege der Periode nach Eingangsdatum durchgehen**, damit **kein
> unerledigter Beleg im Jahr zurückbleibt**.

- **Fertig ist die Kanzlei, wenn** kein Beleg der Periode mehr unerledigt ist
  — nicht, wenn sie die Liste einmal durchgescrollt hat. „Erledigt" ist eine
  Spalte mit einem Grund, keine Erinnerung.
- **Misslungen ist die Seite, wenn** ein Beleg unsichtbar bleibt. Das ist bei
  dieser Liste die eigentliche Gefahr: sie filtert nach Jahr, und ein Beleg
  ohne Belegdatum oder ohne Extraktion fiele aus jedem Jahresfilter. Genau
  dafür gibt es die beiden Hänger-Reiter — sie sind **jahresunabhängig**, und
  das ist kein Detail, sondern ihr Existenzgrund.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Welcher Beleg ist das?" | Kennung — Rechnungsnummer, sonst Dateiname, sonst Kurz-ID | `sourceDocumentColumns()` → `identifier` |
| 2 | „Von wem?" | Gegenpart (bei Eingang der Kreditor, bei Ausgang der Debitor) | `counterparty` |
| 3 | „Was für einer?" | Einordnung: Kategorie, Richtung, Form, Charakter | `classification` |
| 4 | „In welche Periode fällt er?" | Eingangsdatum — der Sortierschlüssel; das Belegdatum steht daneben | `receivedDate`, `documentDate` |
| 5 | „Über wie viel?" | Betrag | `amount` |
| 6 | „Hängt er schon an einem Vorgang?" | Sachverhalt als Inline-Nennung | `case` |
| 7 | „Ist mit ihm noch etwas zu tun?" | Verarbeitung und Erledigt-Zeichen samt Grund | `processing`, `completed` |
| 8 | „Wie finde ich einen bestimmten?" | Suche, Zeitraum, Kategorie, Sachverhalts-Status, „nur unerledigte" | `FilterBar` |

Rang 4 und 7 sind der Kern. Die Liste ist nach dem Eingangsdatum sortiert,
weil die Periode die Frage ist, die sie beantwortet — nicht das Belegdatum,
das bei 21 % fehlt.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| J-16 · Sehen, was in der Pipeline gerade läuft | täglich, kurz | einen Reiter („In Verarbeitung") |
| J-17 · Sehen, was hängengeblieben ist | wöchentlich | einen Reiter („Problematisch"); p90 = 10 Zeilen |
| J-18 · Die Belege mit offener Rückfrage herausgreifen | im Buchungslauf | einen Reiter („Klärungsfragen") |
| J-19 · Einen hängenden Beleg neu anstoßen | selten | einen Knopf **in der Zeile**, keine Massenaktion |

## Was hier nicht hingehört

- **Hochladen.** Der Upload ist ein eigener Ort (Upload & Inbox,
  jahresunabhängig) und hat sein eigenes Profil. Wer hier hochlädt, lädt in
  ein Jahr — und genau das soll er nicht.
- **Eine Massenaktion.** Die Liste ist zum Durchgehen da, nicht zum
  Abarbeiten in Blöcken. Der Neustart eines Hängers ist eine Zeilenaktion.
- **Eine eigene Rechnungs- oder Vertragsliste.** Die Belegart ist Spalte und
  Filter, nie eine eigene Route — GLOSSARY-Regel und Entitätsprofil §Listen.
- **Der Erledigt-Haken als eigene Achse mit Farben.** Der Zustand ist binär
  (`completed_at` gesetzt oder nicht); der Grund gehört in den Tooltip.

## Zweifel am heutigen Format

1. **Vier Reiter, zwei Entitäten-Sichten, zwei Tabellen.** „Alle" und
   „Klärungsfragen" zeigen die Rechnungs-Zeile, „In Verarbeitung" und
   „Problematisch" die `StuckDocumentsTable` mit anderen Spalten. Der Wechsel
   ist ein Bruch mitten in einer Reiterleiste. **Folgerung:** ein
   Spaltenkatalog, zwei Sätze (`DOCUMENT_LIST_COLUMNS`, `STUCK_COLUMNS`) —
   genau der Schnitt, den 0070 schon gebaut hat.
2. **Sortierung gibt es in der Query, nicht in der Oberfläche.**
   `INVOICE_SORT_KEYS` kennt fünf Schlüssel (Eingang, Upload, Lieferant,
   Belegnummer, Betrag); die Tabelle hat keinen einzigen klickbaren Kopf.
   Bei p90 102 Zeilen blättert man nach dem Betrag. **Folgerung:**
   `DataTable` trägt die Sortierung über die URL — die Whitelist steht schon.
3. **Ein Leerfall für vier Reiter.** „Keine Belege im aktuellen Filter" steht
   auch dann da, wenn gar kein Filter gesetzt ist. Der Unterschied zwischen
   „in dieser Periode kam nichts" (normal) und „der Filter trifft nichts"
   (Bedienfehler) ist genau der, den das Entitätsprofil für diese Liste
   ausdrücklich verlangt. **Folgerung:** `filtered` an `DataTable`, und je
   Reiter ein eigener Erfolgs- bzw. Lückentext.
4. **Zwei der drei Hinweistexte stehen als Fließtext über der Tabelle.** Was
   ein Reiter zeigt, gehört in den Kopf der Karte (`sub`), nicht als Absatz
   davor — sonst wandert er beim nächsten Umbau weg.
5. **Das Anzeigemodell `SourceDocumentVM` existiert, aber niemand erzeugt
   es.** Es liegt seit 2026-09-07 in `modules/source-docs/domain/` und wird
   gespiegelt; die Liste baut ihre Zellen trotzdem aus Rohfeldern zusammen.
   **Folgerung:** ein Mapper an der Quelle, dann liest die Seite dasselbe
   Modell, das das Set erwartet.

## Vorbedingungen für den Bau

- `sourceDocumentColumns()` steht (0070) samt `DOCUMENT_LIST_COLUMNS` und
  `STUCK_COLUMNS` mit `stuckVariant`.
- `DataTable` (0057) trägt Sortierung, Pager und die fünf Zustände.
- **Fehlt:** ein Mapper von den Query-Zeilen (`listInvoicesForClient`,
  `listStuckDocumentsForClient`) auf `SourceDocumentVM`. Er gehört in
  `modules/source-docs/domain/` — spiegelbar, ohne DB und ohne UI.
