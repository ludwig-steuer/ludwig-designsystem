# 0207 · Startseite des Mandantenjahres — Ordnung statt Fläche

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-27; Owner-Blick und fremde Abnahme stehen aus |
| Stufe | Seite im Showcase (`src/showcase/client-year/`), keine neue Komponente |
| Klassen-Test | entfällt — Seiten-Komposition |
| Quelle | Design-Brief **F312** (`app/docs/backlog/F312-client-year-dashboard-design-brief.md`, Owner 2026-09-27 über ll-senior: „voll und überfordernd, Kerninfos fehlen, keine Ordnung") |
| Ersetzt | Vorbild für `app/(app)/clients/[clientSlug]/[year]/page.tsx` (App-Spec folgt nach Muster F306) |
| Spec von / am | Claude, 2026-09-27 |

## Ziel

Die Sachbearbeiterin öffnet einen Mandanten und weiß in fünf Sekunden: **wer
ist das, was muss ich tun, wo steht der Stapel, wie weit ist das Jahr** —
und springt ab. Die Seite ist eine Weiche.

## Aufbau (Lesereihenfolge = Rang)

| Rang | Frage | Antwort | Baustein |
|---|---|---|---|
| 0 | Wer ist das? | Kopf: Name, „Mandant · DATEV 10234 · Jahr 2026", Meta „DATEV-Spiegel Stand … · vor n Tagen" + „Alle Stammdaten", Faktenzeile Kontenrahmen · Versteuerung · Buchungsrhythmus · Zuständig | `EntityHeader` (`overline`, `meta`, `facts`) |
| 5 | Wie viel ist da? | eine Zeile kleiner Zahlen mit Weg: Belege · Sachverhalte offen · in DATEV gebucht bis … | `EntityHeader summary` |
| 1 + 2 | Was muss ich tun, klemmt etwas? | **eine** Liste „Zu tun", Abschnitt „Sie sind dran": Stufe (Fehler/Warnung/Hinweis) + Satz + Knopf, der erste primär; höchstens fünf, Rest hinter „Alle n Aufgaben anzeigen"; leer = „Nichts zu tun — ‹was als Nächstes kommt›" | `Card` + `StateIcon` + `Button` (Komposition) |
| 3 | Wo liegt es gerade? | Abschnitt „Liegt bei anderen": Staffelstab (Ludwig · Mandant · DATEV) + Satz + „anzeigen", leiser, ohne Knopf | `Baton` |
| 4a | Wo steht der aktuelle Stapel? | Karte rechts mit der Prozess-Box des Stapels (0204), Klick erklärt | `ProcessPictureTrigger size="box"` |
| 4b | Wie weit ist das Jahr? | Monatsraster „Das Jahr 2026", ein Monat ein Stapel, ohne eigene Warnfarbe — eine Lücke ist eine Aufgabe oben | `PeriodGrid` |

Spalten: `Columns pattern="split"` — Aufgaben links, Stapel rechts; schmal
bricht es in der Reihenfolge Aufgaben → Stapel um (`main-aside` hätte die
Randspalte nach oben geholt). Das Monatsraster (12 × 64 px) passt in keine
Randspalte und steht darunter über die volle Breite.

**Entfallen** (F312 Idee 6): „Aktivität pro Monat" (Statistik ohne Frage),
„Letzte Stapel" als Tabelle (im Raster), Belegsumme in Euro, „Arbeitsvorrat"
als eigene Box (in „Zu tun" aufgegangen).

## Stories (F312 §6)

`Seiten/Mandantenjahr`: `Normal` · `NothingToDo` · `Stuck` (Übertragung
gescheitert, Frist als Aufgabe) · `NewClient` (Einrichtung, kein Stapel,
Raster leer mit Grund) · `Dense` (9 Aufgaben, Deckel 5) · `Narrow` (48rem).

Zustände: gefüllt (alle), leer (`NothingToDo`, `NewClient`); „lädt" und
„Fehler" gehören der App-Seite (Server-Seite, Suspense) — die Bausteine darin
haben ihre eigenen.

## Offene Owner-Fragen (F312 §7), gebaut mit Vorschlag

1. Steckbrief als Zeile im Kopf (gebaut) oder eigene Box rechts?
2. Zahlenzeile „Belege · Sachverhalte · Buchungen" bleiben (gebaut, unter dem Namen)?
3. UStVA-Frist als Aufgabe jetzt (Story `Stuck` zeigt die Form) oder erst mit dem Server-Signal? Die Form ist dieselbe; wann, entscheidet die App.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |
