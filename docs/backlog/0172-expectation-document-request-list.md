# 0172 · Was fehlt noch — die Nachforderung in Schritt 1 der Stapelabnahme

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/expectation/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Beleg-Nachforderung beim Mandanten, Buchungsstapel |
| Quelle | Entitätsprofil `docs/entitaeten/expectation.md`, Abschnitte „Listen" (erste Zeile), „Zuschnitt" |
| Auftrag | Die offenen Beleg-Erwartungen der Sachverhalte im Stapelzeitraum, älteste Frist zuerst, mit „wer besorgt" als Filter und der Nachforderung als Mail als Massenaktion (`DocumentRequestMailPanel`, T185.2). Ersetzt die fünfte Zeile von `Step1.tsx` |
| Warum nicht so lassen | Schritt 1 baut die Liste selbst; `ExpectationRow` (0025) steht daneben ungenutzt |
| Vertagt, weil | nach §8 eine eigene Ausprägung (Grundgesamtheit Belege im Stapelzeitraum, Massenaktion Mail, Filter „wer besorgt"); die Stapelabnahme hat kein Seitenprofil — sie gehört in `docs/seiten/stapel-detail.md` (0167) |
| Setzt voraus | `ExpectationRow` ✓ (0025) samt Nachtrag 2026-09-11 · `CaseCell` ✓ · Seitenprofil der Stapelabnahme (0167) |
| Blockiert | nichts im Set |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |
