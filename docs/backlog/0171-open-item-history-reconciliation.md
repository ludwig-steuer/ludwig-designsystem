# 0171 · Offene Posten gegen die Buchungshistorie — der Abgleich der OPOS-Seite

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/open-item/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: DATEV-OPOS-Liste, Personenkonto, Belegfeld 1 |
| Quelle | Entitätsprofil `docs/entitaeten/open-item.md`, Abschnitte „Listen" (dritte Zeile), „Zuschnitt"; Seitenprofil `docs/seiten/opos.md`, Rang 6 |
| Auftrag | Die zweite Tabelle der Seite `open-items`: Posten nur in der OPOS-Liste, nur in der Historie oder mit abweichendem Rest (`compareOposWithHistory()` → `OposAbgleichReport`), als Paare auf `ReconciliationTable` (B1) |
| Warum nicht so lassen | Die Seite baut den Abgleich selbst unter die Liste, im selben Rahmen (`opos.md` Zweifel 2: „Zwei Themen, ein Kasten") |
| Vertagt, weil | eine Liste aus Paaren, keine Liste von Posten — sie gehört mit der Ausgleichs-Zuordnung (Roadmap #11, `OpenItemLinkRow` 0026) in einen Zug, wie die App-Roadmap es vorsieht; `OposAbgleichReport` liegt in `application/` (L-325) |
| Setzt voraus | `ReconciliationTable` ✓ (0161) · `OpenItemRow` ✓ (0029) · Profil `open-item-link` (#11) · L-325 |
| Blockiert | nichts im Set |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |
