# 0165 · Nachlese — Ludwigs Export gegen DATEV, Paar für Paar

| | |
|---|---|
| Status | **offen** |
| Stufe | keine neue Komponente — Einsatz von `ReconciliationTable` (0161) mit `JournalEntryCell` links und `MirrorEntryCell` rechts; Ort: Showcase und später die Seite der Stapelabnahme |
| Klassen-Test | entfällt — die Form ist das Pattern `ReconciliationTable` |
| Quelle | Entitätsprofil `docs/entitaeten/datev-mirror-entry.md`, Abschnitte „Listen" (Absatz unter der Tabelle), „Zuschnitt"; Roadmap der App (9be34746) #2 „Nachlese" |
| Auftrag | Die Nachlese nach einem Export: je exportiertem Buchungssatz, was DATEV daraus gemacht hat — unverändert, geändert, aufgeteilt, nicht in DATEV, unklar, von der Kanzlei ergänzt. Ersetzt `modules/datev-truth/ui/StapelVergleich.tsx` (656 Z.) und `ReplayVergleich.tsx` |
| Warum nicht so lassen | Die Paar-Arten stehen als lokale Wortliste `KIND_META` (Z. 46) mit eigenem Ton je Art und einer zweiten Variante `KIND_META_REPLAY` — genau die Wortliste, die das Set nicht kennen darf (Befund L-303). `ReconciliationTable` hat die Paar-Form seit 0161 |
| Vertagt, weil | drei Voraussetzungen fehlen: eine Registry-Achse für die Paar-Arten (L-303 — ohne sie müsste der Einsatz die Wörter lokal halten), das Profil `export-batch` (Roadmap #3 — der Export ist die Grundgesamtheit) und B3 `DiffView` für die feldweisen Abweichungen bei `matched_corrected` |
| Setzt voraus | `ReconciliationTable` ✓ (0161) · `JournalEntryCell` ✓ (0044) · `MirrorEntryCell` (Profil, Marke „jetzt") · L-303 · B3 |
| Blockiert | nichts im Set. In der App die Ablösung von `StapelVergleich`/`ReplayVergleich` |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |

## Was schon feststeht

- **Abbildung auf `PairKind` (0161):** `unveraendert` → `same` ·
  `geaendert` → `changed` · `aufgeteilt` → `split` · `fehlt` → `left_only` ·
  `fremd` → `right_only` · `unklar` → `unclear`. Die Wörter kommen aus der
  künftigen Achse, nicht aus `KIND_META`.
- **Bestand:** `matched_ludwig` 318 · `matched_split` 29 ·
  `matched_corrected` 1 · `unclear` 703 (690 davon mit Sachverhaltsnummer)
  · `disappeared_committed` 29 (Staging, 2026-09-11).
