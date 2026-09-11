# 0170 · Konventionen des Stapels — Schritt 7 der Stapelabnahme

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/convention/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Konventionen des Buchungsagenten, Stapel, Freigabe einer Kanzleiregel |
| Quelle | Entitätsprofil `docs/entitaeten/convention.md`, Abschnitte „Listen" (dritte Zeile), „Zuschnitt" |
| Auftrag | Die Liste der Konventionen, die der Agent in einem Stapel abgeleitet hat, gruppiert nach zu entscheiden · bestätigt · verworfen; je Zeile Bestätigen (Mandantenregel), Freigeben (Kanzleiregel) oder Verwerfen, dazu der Hinweis „zum selben Thema schon verworfen" (`previouslyDiscarded`). Ersetzt `Step7` · `KonventionZeile` und `ConventionActions` (`batch-review/ui`) |
| Warum nicht so lassen | Schritt 7 baut die Zeile selbst und sagt den Stand in eigenen Wörtern („beobachtet", „verworfen") statt über die Registry; dieselbe Zeile steht noch zweimal (Panel, Kanzlei-Tabelle) |
| Vertagt, weil | nach §8 eine eigene Ausprägung (Grundgesamtheit „Konventionen des Stapels", Gruppierung nach Entscheidung, Spalte Entscheidung) — und die Stapelabnahme hat kein Seitenprofil: sie gehört in `docs/seiten/stapel-detail.md` (0167). Der Typ `BatchConvention` liegt in `application/`, nicht im Spiegel (L-322) |
| Setzt voraus | `ConventionRow` (Profil, Marke „jetzt") · Seitenprofil der Stapelabnahme (0167) · L-322 |
| Blockiert | nichts im Set |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |
