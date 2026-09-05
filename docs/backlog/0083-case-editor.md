# 0083 · CaseEditor — die vier Werte, die ein Mensch am Sachverhalt ändert

| | |
|---|---|
| Status | offen |
| Stufe | `entities/accounting-case/` |
| Quelle | Entitätsprofil `docs/entitaeten/accounting-case.md`, Abschnitt „Formen" (Zeile `CaseEditor`) |
| Auftrag | Kein Formular, sondern `InlineEdit` je Wert im `CaseDetailView`: Anzeigename (`title`), Zusammenfassung (`summary`), Art (`kind`) und Belegnummern-Modus (`document_number_mode`); dazu die Zuständigkeit (`disposition`, schreibbar nur `agent` und `accounting`). Ersetzt `CaseSummaryEditor`, `CaseKindEditor`, `CaseDocumentNumberModeEditor` und `CaseCommentForm`. |
| Besonderheit | Die Umstufung des Belegnummern-Modus ist **begründungspflichtig** (Regel S3, `isDocumentNumberModeDowngrade()`) — dafür `ReasonDialog`, nicht ein stiller Wechsel. |
| Vertagt, weil | der Editor im View lebt und 0050 `CaseDetailView` voraussetzt. Er ist ein Auftrag, keine Ablehnung: §7 Nr. 4 trifft zu (vier Punkte mit änderbar = Nutzer) und Nr. 1 ebenfalls (vier Editoren in der App). |
| Setzt voraus | `CaseDetailView` (0050) · `InlineEdit` · `ReasonDialog` |
| Angelegt von / am | Claude, 2026-09-05 (Skill `entitaet-analysieren` §9) |
