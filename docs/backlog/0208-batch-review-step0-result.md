# 0208 · Stapelabnahme Schritt 0 „Ergebnis des Stapels" — und `TaskList`

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-27; Owner-Blick und fremde Abnahme stehen aus |
| Stufe | neu `patterns/TaskList.tsx` (Baustein) · Seite im Showcase `src/showcase/batch-review/` |
| Klassen-Test | `TaskList`: ja — eine gruppierte Liste „was ist zu tun" mit Weg je Zeile, ohne Fachwort. Die Seite: entfällt |
| Quelle | Design-Brief **F314** (`app/docs/backlog/F314-batch-review-step0-result-design-brief.md`, Owner 2026-09-27 über ll-cto); Owner-Entscheide §8 (über ll-cto): ein Urteil · „Was jetzt zu tun ist" fällt aus dem Bericht · Auffälligkeiten ohne Sprung (P52 später) · Moment B nur als Satz · Schritt 0 ist Weiche |
| Ersetzt | Vorbild für `batch-review/ui/Step0.tsx`; `TaskList` ersetzt die Komposition „Zu tun" aus 0207 |
| Spec von / am | Claude, 2026-09-27 |

## Ziel

Die Kanzlei öffnet Schritt 0 und weiß in fünf Sekunden: **kann ich
anfangen, wo muss ich zuerst hin, was will Ludwig mir sagen**. Drei Flächen,
je eine Aufgabe, nichts doppelt.

## Aufbau (eine Spalte)

| Rang | Frage | Fläche |
|---|---|---|
| 1 | Kann ich anfangen, ist Ludwig fertig? | **ein** `StatusCallout` „Ergebnis": läuft noch (neutral) · fertig (Erfolg) · fertig, aber als unvollständig gemeldet (Hinweis, Zeichen i) · an n Stellen nicht fertig (Warnung) · übergeben (neutral, Präteritum, ohne Knopf). Ludwigs Begründung als Zitat im Urteil, Knopf „Zurück an Ludwig" daran. Darunter die Durchgangszeile „Durchgang 2 · 25.09., 14:02 – 14:20 · nach Ihrer Rückgabe am 24.09." (Rang 5) |
| 2 (+4, 6) | Wo muss ich zuerst hin? | Karte „Aufgaben" mit `TaskList`: „Offen" mit Stufe, Zahl („228 von 231"), erstem Beispiel und Sprung; Erledigtes gefaltet in **einer** Zeile („6 von 8 erledigt", bei nichts Offenem „Alle 8 Aufgaben erledigt"). Die Vollständigkeit ist eine Zeile „Zeitraum" (Mandantenstapel: „Personenkonten") mit Satz und Sprung; die alten drei Fakten sind Zähler ihrer Zeile |
| 3 | Was will Ludwig mir sagen? | Karte „Was Ludwig meldet": **Auffälligkeiten zuerst** als Aufzählung (reiner Text, Owner §8.3), „Was Ludwig gemacht hat" gefaltet; ohne Auffälligkeiten „Keine Auffälligkeiten."; ohne Bericht „Ludwig hat keinen Bericht hinterlassen." Kein Fenster mit eigenem Scrollbalken |

**Idee 5 — eine Spalte, nicht `main-aside`:** Links steht schon die
Schrittleiste; zwei weitere Spalten machten bei 1280 px drei, und der Bericht
(Rang 3) stünde neben dem Urteil (Rang 1) und konkurrierte um den ersten
Blick. Untereinander ist die Lesereihenfolge der Rang. Rang-Überschriften
braucht es nicht: jede Fläche hat ihren Kopf („Ergebnis", „Aufgaben", „Was
Ludwig meldet").

„Vorläufig" (Ludwig arbeitet noch) steht als Wort im Kartenkopf, nicht als
gedimmte Schrift — die fiele unter 4,5:1.

## `TaskList` (Baustein)

| Prop | Typ | Bedeutung |
|---|---|---|
| `groups` | `TaskGroup[]` | je Gruppe `key`, `label`, `count?`, `rows`, `folded?: { summary }`, `empty?` |
| `TaskRow` | `{ key; state?; title; sub?; right? }` | Zeichen (optional), Titel `--fs-ui`, Unterzeile `--fs-ui-sm`, rechts Knopf/Zahl/Link |

Gruppe mit `rows` → Leiste mit Zahl + Zeilen; `folded` → **nur** eine
Aufklapp-Zeile (keine Leiste, sonst stünde die Zahl doppelt); leer mit `empty`
→ Leiste + Satz; leer ohne `empty` → entfällt. Nachweis: Showcase
`Seiten/Mandantenjahr` (0207) und `Seiten/Stapelabnahme/Schritt 0`.

## Stories (F314 §4)

`Seiten/Stapelabnahme/Schritt 0`: `Running` (1) · `Done` (2) ·
`DoneReportedIncomplete` (3) · `OpenPlaces` (4) · `OpenPlacesReportedIncomplete`
(5) · `SecondRunAfterReturn` (6) · `NoReport` (7) · `ClientBatch` (8) ·
`HandedOver` (9).

## Datenmodell

Braucht nichts, was die App nicht liefert (F314 §5): kein Sprung je
Auffälligkeit (P52 später), keine „seit Rückgabe erledigt"-Markierung.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |
