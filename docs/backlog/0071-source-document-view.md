# 0071 · Beleg-Detailansicht — `SourceDocumentView`

| | |
|---|---|
| Status | offen |
| Stufe | `entities/source-document/` — `SourceDocumentView` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Pipeline, Vorsteuer und Belegart sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Formen-Tabelle |
| Ersetzt | `SourceDocFamily`, `InvoiceSidebar`, `DocTabsBar`, `SourceDocBelegTab`, `SourceDocPipelineTab`, `SourceDocVerlaufTab`, den Anzeige-Teil von `ContractDetail` |
| Blockiert | nichts |
| Setzt voraus | `SourceDocumentCard`, `SourceDocumentFacts` mit Ausprägungs-Registry, `SourceDocumentPreview` (alle aus dieser Familie), `EntityHeader`, `Tabs`, `LogList` |
| Spec von / am | — (Auftrag, noch keine Spec) |

## Ziel

Die volle Ansicht eines Belegs: Kopf, Original, Fakten der Ausprägung,
Historie — und die sechs Tabs, die `tabs.ts` schon führt (Beleg,
Positionen, Vorsteuer, Verlauf & Befunde, Pipeline, Rohdaten). Zwei davon
setzen eine Rechnungs-Zeile voraus; die Belegart entscheidet nur, **welche**
Tabs sichtbar sind und wie der erste heißt — nicht, welche Ansicht gemountet
wird (decision-log 2026-07-20).

Warum vertagt: der View setzt die Karte voraus (er zeigt dieselben Fakten
aus derselben Komponente, 0052 Zone 3), und er hat eine eigene Route — also
braucht er zuerst ein Seitenprofil `docs/seiten/beleg-detail.md`. Ohne das
würde er Kopfzeile, Aktionsmenü und Vor/Zurück-Navigation der Liste
mitentscheiden, die der Seite gehören.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Einzelwerte ändern (Belegdatum, Einordnung, Erledigung, DATEV-Ablage) | je ein optionaler Callback (`onSetDocumentDate`, `onOverrideClassification`, …) über `InlineEdit` | sobald der View steht — ohne Callback bleibt der Wert lesend |
| Positionen und Vorsteuer | eigener Auftrag 0072 | wenn die Rechnungsposition ihr eigenes Profil hat |
