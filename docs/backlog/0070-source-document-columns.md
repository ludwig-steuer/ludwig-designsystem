# 0070 · Belegliste — Spaltensätze für `DataTable`

| | |
|---|---|
| Status | offen |
| Stufe | `entities/source-document/` — `SourceDocumentColumns` + kurze `SourceDocumentList` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Belegart, Einordnung und Erledigung sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Abschnitt „Listen" (sechs Job-Sätze) |
| Ersetzt | die Zeilen von Belegliste `/[year]/documents`, `StuckDocumentsTable`, `DocumentInbox`, `InboxInvoiceSubmissionList`, `BelegeTab`, `ChildDocsCard` |
| Blockiert | die drei Beleg-Seitenprofile unter `docs/seiten/` |
| Setzt voraus | `SourceDocumentRow` (diese Familie), `DataTable` (0057) |
| Spec von / am | — (Auftrag, noch keine Spec) |

## Ziel

Sechs Listen zeigen denselben Beleg. Drei davon sind lang, gefiltert und
geblättert (Belegliste des Jahres, Upload & Inbox, Beleg einreichen) — das
ist `DataTable` mit je einem **Spaltensatz**, nicht drei Komponenten;
Vorbild `AccountEntries` (Entscheidung A11a). Drei sind kurz (Belege am
Sachverhalt p90 1, Teilbelege p90 0, stockende Belege ≤ 10) — das ist
`SourceDocumentRow` × n mit Leerfall.

Warum vertagt: die drei langen Listen haben je eine eigene Route und
brauchen nach §8 des Skills `entitaet-analysieren` **je ein Seitenprofil**
unter `docs/seiten/`. Kopfzeile, Vorratszähler, Tab-Leiste und Pager
gehören der Seite, nicht der Entität — solange die Seitenprofile fehlen,
würde die Liste Entscheidungen treffen, die ihr nicht gehören.

## Zuschnitt (Vorgriff, die Spec entscheidet)

- `SourceDocumentColumns` — der Spaltenkatalog, aus dem jede Seite ihren Satz
  wählt. Ein `variant` für die zwei Ausprägungen „stockend": in
  Verarbeitung und problematisch unterscheiden sich nur in Grundgesamtheit
  und Leerfall.
- `SourceDocumentList` — die kurze eingebettete Liste mit **zwei** Leerfällen:
  „kein Beleg zu erwarten" (mit Begründung, ein Erfolg) ist etwas anderes
  als „keine verbundenen Belege".

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Massenaktion „einreichen" | `SelectionScope` um die Tabelle, `bulk`-Slot | sobald die Zyklus-Seite gebaut wird — heute reicht der Knopf je Zeile |
| Filter über die Belegkategorie | `filter`-Prop der Seite | sobald `doc_category` über 46 % hinaus gefüllt ist (Profil-Befund B3) |
