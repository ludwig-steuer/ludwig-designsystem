# 0213 · Trefferfläche der Text-Links — 24 px ohne Zeilen, die wachsen

| | |
|---|---|
| Status | **Backlog** — angelegt 2026-09-29 (Owner: „bitte auf Backlog") |
| Stufe | `primitives/Link`, `primitives/TextButton`, die Link-Klassen der Zellen (`v2acc--link`, `v3docref--link`, `v3cell-link`, Buchungs-Link `v3docrow__entry`, BU-Link in `TaxKeyCell`) |
| Klassen-Test | ja — jede Oberfläche mit Links in Zeilen |
| Quelle | Fremde Abnahmen 0210/0211/0212/0164 vom 2026-09-29 (M2/M3, jeweils „betrifft das ganze Set"); offener Punkt „TextButton/Link 21/19/14 px" aus der Todo-Liste |
| Regel | WCAG 2.2 AA 2.5.8 (Target Size Minimum), CLAUDE.md §2 Bedienung: „Trefferfläche ≥ 24 × 24 px, gemessen" |

## Befund (gemessen 2026-09-29, 1280 px)

| Ziel | Höhe |
|---|---|
| Beleg-Link (`SourceDocumentRefCell`) | 19,4 px |
| Konto-Link (`AccountCell`) | 14–20,9 px |
| BU-Link (`TaxKeyCell`) | 16,5 px (22,5 breit) |
| „4930 an 70010", „2 Buchungen" (Belegzeile V3) | 16,5 px |
| „n weitere Buchungen" (`SourceDocumentMilestones`) | 15 px |
| Konto-Links in T3 | 17 px |
| `TextButton` / `Link` allgemein | 14–21 px |

Die Ausnahme „inline in Text" von 2.5.8 greift nicht: Diese Links stehen allein
in Tabellenzellen, nicht im Fließtext.

## Ziel

Jedes eigenständige Link-Ziel hat eine Trefferfläche von mindestens 24 × 24
px — **ohne** dass Zeilen höher werden oder die Schrift wächst (V11: nichts
wächst, nichts springt).

## Richtung (zu entscheiden in der Spec)

1. **Unsichtbare Vergrößerung:** `::after` mit `inset: -Npx` bzw. `padding` +
   negativem `margin` an den Link-Klassen; prüfen, dass benachbarte Ziele
   (Konto neben Konto, Beleg neben Zeilenlink) sich nicht überlappen — sonst
   gilt die Abstands-Ausnahme von 2.5.8 (24-px-Kreis ohne Überschneidung).
2. **Zeilenlink bleibt unten:** die vergrößerten Ziele liegen über dem Overlay
   des Zeilenlinks (`z-index: 2`), dürfen es aber nicht so weit verdecken, dass
   die Zeile nicht mehr klickbar ist.
3. **Messen statt schätzen:** Story je Zelltyp mit Messskript (Trefferfläche,
   Überschneidung, Zeilenhöhe vorher/nachher).

## Abnahme (Entwurf)

| Kriterium | Nachweis |
|---|---|
| Jedes Ziel der Tabelle „Befund" ≥ 24 × 24 px | Messung je Story |
| Keine Zeilenhöhe ändert sich | Messung vorher/nachher |
| Keine Überschneidung zweier Ziele | Messung |
| Zeilenlink bleibt auf ≥ 50 % der Zeilenfläche erreichbar | Messung |
