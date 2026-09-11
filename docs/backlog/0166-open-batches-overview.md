# 0166 · Offene Stapel aller Mandanten — `BatchCard` und die Übersicht

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/export-batch/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Buchungszyklus, Mandant, DATEV |
| Quelle | Entitätsprofil `docs/entitaeten/export-batch.md`, Abschnitte „Listen" (zweite Zeile), „Formen" (`BatchCard`), „Zuschnitt" |
| Auftrag | Die Karte „der offene Stapel" mit nächstem Schritt (Roadmap, I10 „Nächster Schritt mit Zahl") und die Übersicht der offenen Stapel über alle Mandanten, sortiert nach dem, der dran ist — damit die Kanzlei morgens sieht, wo sie gebraucht wird |
| Warum nicht so lassen | Heute gibt es dafür keinen gemounteten Screen; `OpenExportOverview.tsx` liegt tot (Roadmap: löschen oder heben) |
| Vertagt, weil | der Job nur genannt ist, von keinem Screen belegt (§9); die Übersicht über Mandanten gehört an das Profil `client` (Roadmap #6) und an ein Seitenprofil des Dashboards |
| Setzt voraus | `BatchRow` (Profil, Marke „jetzt") · `ProcessStepper` ✓ · `Baton` ✓ · Profil `client` |
| Blockiert | nichts |
| Angelegt von / am | Claude, 2026-09-11 (Skill `entitaet-analysieren` §9) |

## Was schon feststeht

- **Grundgesamtheit:** Stapel, deren Zustand nicht `confirmed`, `mirrored`,
  `closed` oder `cancelled` ist; je Mandant höchstens ein offener regulärer,
  dazu Nachtrag und Mandantenstapel (GLOSSARY).
- **Sortierung:** wer dran ist (`batchOwner()` — Kanzlei zuerst), dann Alter.
- **Leerfall ist ein Erfolg:** „Nichts offen."
