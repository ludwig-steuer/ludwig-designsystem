# 0168 · Konten des Stapels — Deckung und Gate je Zahlungskonto

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/payment-account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Buchungsstapel, Kontoauszugs-Deckung, Gate des Buchungslaufs |
| Quelle | Entitätsprofil `docs/entitaeten/payment-account.md`, Abschnitte „Listen" (dritte Zeile), „Zuschnitt"; Rückfrage an `ludwig-manager` 2026-09-11, Anwendungsfall (f) |
| Auftrag | Die Liste der Zahlungskonten eines Stapels in der Stapelabnahme: in Schritt 4 (Bankabgleich) je Konto die Gates mit `forRelease` als aufklappbare Zeilen (F204, `Schritt4.tsx:228`). Schritt 1 (Mengengerüst) listet heute nicht je Konto — ob er es soll, entscheidet das Seitenprofil |
| Warum nicht so lassen | Die Stapelabnahme baut diese Zeilen heute selbst; die Konten-Zeile des Sets (`PaymentAccountRow`) kennt weder Deckung noch Gate |
| Vertagt, weil | nach §8 eine eigene Ausprägung (Grundgesamtheit „Konten des Stapelzeitraums", Spaltensatz Gate je Konto, aufklappbare Zeilen) — und die Stapelabnahme hat kein Seitenprofil: sie gehört in `docs/seiten/stapel-detail.md` (0167); ohne es sind Reihenfolge und Wortlaut der Gates geraten |
| Setzt voraus | `PaymentAccountRow` (Profil, Marke „jetzt") · `PeriodGrid` ✓ (0162, Story `StatementCoverage`) · `ExpandableRow` ✓ · Seitenprofil der Stapelabnahme (0167) |
| Blockiert | nichts im Set |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |
