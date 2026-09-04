# 0073 · Vertragsfakten bearbeiten und bestätigen

| | |
|---|---|
| Status | offen |
| Stufe | `entities/source-document/` — Erweiterung der Vertrags-Ausprägung von `SourceDocumentFacts` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Vertragstyp und buchungsrelevante Fakten sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/source-document.md`, Befund B1 und offene Frage 3 |
| Ersetzt | `ContractDetail` (647 Zeilen, Anzeige und Bearbeitung in einem) |
| Blockiert | nichts |
| Setzt voraus | `SourceDocumentFacts` mit Ausprägungs-Registry (lesende Vertrags-Fakten) |
| Spec von / am | — (Auftrag, noch keine Spec) |

## Ziel

Ein Vertrag trägt LLM-extrahierte Felder (Typ, Gegenstand, Laufzeit,
Primärbetrag) und dazu freie **buchungsrelevante Fakten** als
Schlüssel/Wert mit Provenienz (`ai` / `manual` plus Konfidenz). Beides ist
korrigierbar, und am Ende steht „als geprüft bestätigen".

Warum vertagt: `client_source_docs_contracts` hat im Bestand **0 Zeilen**
(Profil-Befund B1). Die lesende Ausprägung lässt sich gegen Schema und
`ContractDetailData` bauen — ob die Bearbeitung stimmt, kann ohne einen
einzigen extrahierten Vertrag niemand prüfen. Die Abnahme hätte keinen
Nachweis.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Fakten ändern und bestätigen | `onSaveFacts` / `onConfirm` an der Vertrags-Ausprägung | sobald die Vertrags-Extraktion Zeilen schreibt (heute 0, 7 Audit-Ereignisse) |
