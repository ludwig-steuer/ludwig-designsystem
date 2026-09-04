# 0065 · Wiedervorlage — „nicht jetzt" sichtbar machen

| | |
|---|---|
| Status | offen |
| Stufe | `entities/clarification/` — Erweiterung von `ClarificationCard` (0060) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: die Regeln (30 Tage, ab der dritten nur ein Mensch) sind Ludwig-Fachlogik |
| Quelle | Entitätsprofil `docs/entitaeten/clarification.md` offene Frage 1 · Owner-Entscheid 2026-09-04 („ok, gute Idee") · `docs/topics/sachverhalt.md` S10–S12, F105 |
| Ersetzt | nichts — es gibt heute keinen Weg, eine Frage zurückzustellen |
| Blockiert | nichts |
| Setzt voraus | 0060 `ClarificationCard` (Abnahme), `ReasonDialog`, `DateField` |
| Spec von / am | — (Auftrag, noch keine Spec) |

## Ziel

Die Wiedervorlage ist vollständig gebaut — Spalten, Regeln, Registry-Zustand,
die Zeile zeigt sie an — und in **0 von 166** Zeilen benutzt, 0 Audit-
Ereignisse. Sie ist trotzdem nicht tot, sondern unerreichbar: das „nicht
jetzt" passiert, es wird nur nicht aufgeschrieben.

Der Beleg dafür sind die offenen Fragen selbst: **60 Stück, im Median 13 Tage
alt, p90 31 Tage.** Genau dagegen wurde F105 gebaut („ein Gate, das man nicht
schaffen kann, wird umgangen" — Gate und Wiedervorlage sind zusammen
ausgeliefert worden). Was fehlt, ist der Knopf.

Die 57 Auflösungen sind **kein** Ersatz dafür: 35 tragen `resolution =
'answered'` (der Agent hat die Antwort selbst gefunden), 22 `'obsolete'` (die
Frage ist gegenstandslos). Keine davon heißt „später".

## Zuschnitt

Keine neue Komponente. `ClarificationCard` bekommt **eine** Prop:

| Prop | Typ | Bedeutung |
|---|---|---|
| `onDefer` | `(until: string, reason: string) => Promise<void>` | Ohne die Prop kein Knopf — dieselbe Regel wie bei `onResolve`. |

Dazu die Anzeige des Regelwerks, das es schon gibt:

- höchstens **30 Tage** voraus (ein Monatslauf) — das Datumsfeld begrenzt,
  nicht erst der Server
- **Grund ist Pflicht**, mindestens 10 Zeichen (DB-CHECK)
- ab der **dritten** Verschiebung darf nur noch ein Mensch verschieben
  (`deferred_count`) — die Karte zeigt den Zähler und sperrt den Knopf mit
  Grund, statt ihn zu verstecken
- hängt die Wiedervorlage an einer Gegenfrage
  (`deferred_by_clarification_id`), endet sie mit deren Antwort — das steht
  als Satz an der Zeile, nicht nur im Datum

## Warum nicht in 0060

0060 ist gebaut und in der Abnahme. Die Wiedervorlage ist eine eigene
Entscheidung mit eigenem Regelwerk und eigenem Nachweis — sie gehört in eine
Aufgabe, die man einzeln abnehmen kann. Die Karte hat den Platz dafür bereits
(zweiter Ausgang neben „ohne Antwort auflösen").

## Offene Frage

1. Darf der Mandant zurückstellen, oder nur Kanzlei und Agent? — ohne
   Antwort: nur wer die Frage bearbeitet, also nicht das Portal; der
   Aufrufer entscheidet, indem er `onDefer` dort nicht setzt.
