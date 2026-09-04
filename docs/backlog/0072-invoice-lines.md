# 0072 · Rechnungspositionen — `InvoiceLines`

| | |
|---|---|
| Status | offen |
| Stufe | `entities/invoice-line/` — eigene Entitäts-Familie, nicht Teil von `entities/document/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: USt-Sonderfall, Verwendungsart und Kontenkandidaten sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/document.md`, Relationen-Tabelle (Enkel über die Rechnung) |
| Ersetzt | `PositionenTab`, `VorsteuerTab` |
| Blockiert | die Tabs „Positionen" und „Vorsteuer" in 0071 |
| Setzt voraus | ein eigenes Entitätsprofil `docs/entitaeten/invoice-line.md` (Skill `entitaet-analysieren`) |
| Spec von / am | — (Auftrag, noch keine Spec) |

## Ziel

Die Positionen einer Rechnung mit ihrem USt-Sonderfall, ihrer
Verwendungsart und den Kontenkandidaten. Im Bestand: 1 % der Rechnungen
ohne Position, p50 1, p90 5, max 22 — eine kurze Liste, keine Tabelle mit
Pagination.

Warum vertagt: die Rechnungsposition ist im Datenmodell-Review §7 als
eigene Entität im zweiten Ring geführt (`client_source_docs_invoice_lines`,
41 Spalten). Sie gehört nicht in die Beleg-Familie, sondern bekommt ihr
eigenes Profil — sonst entscheidet die Beleg-Analyse über Ränge, die sie
nicht erhoben hat.
