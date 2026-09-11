# 0169 · Mandanten der Kanzlei — `ClientAdminList`

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/client/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: DATEV-Anbindung, Onboarding aus DATEV, Replay-Mandant |
| Quelle | Entitätsprofil `docs/entitaeten/client.md`, Abschnitte „Listen" (zweite Zeile), „Formen" (`ClientAdminList`), „Zuschnitt" |
| Auftrag | Die Admin-Liste aller Mandanten einer Kanzlei, auch der stillgelegten: Betriebszustand, Onboarding-Zustand, DATEV-Anbindung; Aktionen aktivieren, stilllegen, löschen, neu onboarden |
| Warum nicht so lassen | Die Admin-Mandantenseite hat 969 Zeilen und baut Tabellen, Aktionen und Kandidaten-Listen inline (vgl. 0130) |
| Vertagt, weil | die Admin-Sicht (R11) ein eigenes Seitenprofil braucht — Job, Fragen in Reihenfolge, was hier nicht hingehört —, und die Aktionen (löschen, neu onboarden) Unumkehrbares tragen, dessen Bestätigung die Seite festlegt, nicht die Liste |
| Setzt voraus | `ClientRow` (Profil, Marke „jetzt") · `ActionButton confirm` · `ReasonDialog` · Seitenprofil der Admin-Mandantenseite |
| Blockiert | nichts |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |
