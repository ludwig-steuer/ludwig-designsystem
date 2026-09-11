# 0173 · Wer schuldet wem? — die Zahlungserwartungen in Schritt 5 der Stapelabnahme

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/expectation/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Zahlungserwartung aus einer Buchung, Personenkonto, Buchungsstapel |
| Quelle | Entitätsprofil `docs/entitaeten/expectation.md`, Abschnitte „Listen" (zweite Zeile), „Zuschnitt" |
| Auftrag | Die offenen Zahlungserwartungen, gruppiert nach überfällig · in Frist · zurückgestellt und darin je Gegenpartei mit Summe; je Posten das Detail als `ExpectationFacts`, dazu Rückfrage und Wiedervorlage. Ersetzt `Step5List.tsx` samt `FRIST_QUELLE` und der Zeile „Mahnstufe" |
| Warum nicht so lassen | Schritt 5 baut Zeile und Detail selbst, nennt die Eskalation „Mahnstufe" und zeigt einen DATEV-Stand, der nie gefüllt ist (L-328, L-332) |
| Vertagt, weil | nach §8 eine eigene Ausprägung (Grundgesamtheit Zahlungen, zweistufige Gruppierung mit Summen, eigener Spaltensatz); die Stapelabnahme hat kein Seitenprofil (0167); die Wörter für Fristquelle und Richtung fehlen in der Domäne (L-332) |
| Setzt voraus | `ExpectationRow` ✓ (0025) · `ExpectationFacts` (Profil, Marke „jetzt") · `OpenItemCard` für den DATEV-Stand (Profil `open-item`) · Seitenprofil der Stapelabnahme (0167) · L-332 |
| Blockiert | nichts im Set |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |
