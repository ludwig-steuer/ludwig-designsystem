# 0167 · Stapel-Detailseite — `BatchView`

| | |
|---|---|
| Status | **offen** |
| Stufe | Seite im Showcase (`src/showcase/`), komponiert aus `entities/export-batch/` und den Listen der Kinder |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Buchungszyklus, DATEV-Quittung, Stapelabnahme |
| Quelle | Entitätsprofil `docs/entitaeten/export-batch.md`, Abschnitte „Formen" (`BatchView`), „Zuschnitt"; `docs/detailseiten-standard.md` (Reiter nach Zielgruppe) |
| Auftrag | Die Detailseite eines Stapels (Route `stapel/[batchId]`): Kopf mit Zustand, wer dran ist und `ProcessStepper`; Reiter für die Buchungssätze, die Durchgänge, die DATEV-Quittung und den Verlauf. Ersetzt `StapelDetailScreen.tsx` (1.090 Z.) |
| Warum nicht so lassen | eine Datei mit 1.090 Zeilen und acht Reitern (Übersicht · Durchgänge · Belege · Buchungen · Artefakte · DATEV · Log · Experiment — der letzte nur bei Experiment-Mandanten) — die Reiter sind nach Datenquelle geschnitten, nicht nach Zielgruppe |
| Vertagt, weil | eine eigene Route zuerst ein Seitenprofil braucht (`docs/seiten/stapel-detail.md`: Job, Fragen in Reihenfolge, was hier nicht hingehört); ohne es sind die Reiter geraten. Das Seitenprofil schließt **die Stapelabnahme** ein (Route `stapel/[id]/abnahme/[schritt]`, Modul `stapelabnahme` → `batch-review` mit F210) — die größte Ansicht auf einen Stapel, heute ohne Seitenprofil (Rückfrage, Manager 2026-09-11) |
| Setzt voraus | `BatchFacts`, `BatchCell` (Profil, Marke „jetzt") · `JournalEntryList` (Profil `journal-entry`) · `LogBrowser` ✓ · `BatonBar` ✓ · Seitenprofil |
| Blockiert | nichts im Set. In der App die Ablösung von `StapelDetailScreen` |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |
