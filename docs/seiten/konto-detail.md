# Konto — Detailseite · Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/accounts/[accountNumber]/page.tsx` (846 Z.) — Identifikator ist die **Kontonummer**, nicht die Id |
| Heute gebaut in | dieselbe Datei (vier Tabs inline) plus `modules/accounts/` (`accountFacts`, `accountSourceLabel`), `MonthlyBarChart`, `DatevEntryDrawer`, `LudwigEntryDrawer` |
| Entitäten | Konto (`docs/entitaeten/account.md`) · Buchung (beide Quellen) · Geschäftspartner |
| Baustein in v3 | noch keiner — Aufgabe **0063** `AccountView` |
| Fachliche Quelle | GLOSSARY F64 (Kontenplan je Wirtschaftsjahr), `konten.md` R18 |
| Profil von / am | Claude, 2026-09-07 · gelesen: Route, Tab-Struktur, Kennzahlen, Entitätsprofil |

## Job

> Wenn **eine Buchung auf einem Konto zweifelhaft ist**, will **die
> Sachbearbeiterin** **sehen, was sonst auf diesem Konto liegt und ob Ludwig
> und DATEV dasselbe sagen**, damit **sie das Konto bestätigen oder verwerfen
> kann**.

- **Fertig ist sie, wenn** sie weiß, ob die fragliche Buchung zu dem passt,
  was auf diesem Konto üblich ist — und ob die beiden Quellen übereinstimmen.
- **Misslungen ist die Seite, wenn** sie die zwei Quellen für eine hält. Die
  Kontoseite ist der Ort, an dem **DATEV-Wahrheit und Ludwig-Vorschlag
  nebeneinander** stehen; wer sie verwechselt, bucht gegen den Spiegel.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Welches Konto ist das?" | Kopf: Nummer, Name, Rolle, Jahr | `EntityHeader`, `AccountCell` |
| 2 | „Wie viel liegt drauf?" | Saldo, Soll, Haben — **je Quelle**, nie vermischt | `KpiRow`, `Amount` |
| 3 | „Ist das viel oder wenig für dieses Konto?" | Verlauf über die letzten Monate | `BarChart` (0110) |
| 4 | „Was liegt konkret drauf?" | Die Bewegungen, beide Quellen **in einer Liste**, Herkunft als Spalte | `AccountEntryList` |
| 5 | „Sagen Ludwig und DATEV dasselbe?" | Der Abgleich je Zeile (Achse `mirror_match`) | `StatusBadge` in der Zeile |
| 6 | „Wofür ist dieses Konto gedacht?" | Stammdaten: SKR-Klasse, Kontenfunktion, Automatik-Steuersatz | `AccountFacts` |
| 7 | „Was weiß Ludwig sonst über das Konto?" | Beschreibung, Belegbegriffe (LLM-Profil) | `LongText`, `Chip` |

Rang 1–3 stehen ohne Klick. Rang 4 ist die Hauptfläche. Rang 5 steht **in**
der Zeile, nicht in einem eigenen Reiter. Rang 6 und 7 dürfen je einen Klick
kosten.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Eine einzelne Buchung aufschlagen | oft — der Grund, warum jemand hier ist | einen Klick (Drawer, `?entry=` / `?buchung=`) |
| Monat für Monat vergleichen | zur Abschlussprüfung, geschätzt einmal je Jahr | einen Reiter |
| Das LLM-Profil prüfen | selten, bei Zweifeln an der Einordnung | einen Reiter |

## Was hier nicht hingehört

- **Der Kontenplan.** Vor und Zurück ja, keine eingebettete Liste.
- **Buchen.** Die Kontoseite ist lesend; gebucht wird am Sachverhalt.
- **Der Kontenrahmen-Vergleich** („was sagt der SKR dazu"): das ist die
  Katalog-Ansicht der Liste, nicht die Detailseite eines Kontos.

## Zweifel am heutigen Format

1. **Zwei Auszüge nebeneinander, zwei Suchfelder, zwei Pager.** Der Reiter
   „Buchungen" zeigt „Buchungen in DATEV" und „Buchungen in Ludwig" als
   getrennte Tabellen. Das Entitätsprofil hat diese Trennung 2026-09-04
   ausdrücklich verworfen: **die Frage ist eine** („was liegt auf dem Konto"),
   die Quelle ist eine Eigenschaft der Zeile. Folgerung: eine Liste, Herkunft
   als Spalte — und der Reiter kann verschwinden, weil die Übersicht ihn
   ohnehin zur Hälfte zeigt.
2. **Sechs Kennzahlen, zwei davon dieselbe Zahl in zwei Quellen.**
   „Buchungen in Ludwig" und „Buchungen in DATEV" stehen als zwei Kacheln;
   interessant ist die **Differenz**, nicht die zwei Zahlen. Folgerung: eine
   Kachel „Buchungen", die die Differenz nennt, wenn es eine gibt.
3. **Der Verlauf zeigt sechs Monate, das Jahr hat zwölf.** Der Reiter
   „Monate" zeigt dieselben Daten noch einmal, vollständig. Folgerung: ein
   Verlauf über das ganze Jahr auf der Übersicht, kein zweiter Reiter.
4. **Die Stammdaten stehen unter den Buchungen.** Rang 6 unter Rang 4 ist
   richtig — aber sie stehen im selben Reiter wie die Kennzahlen und damit
   über der eigentlichen Arbeitsfläche. Folgerung: Fakten in die Randspalte.
5. **Vier Reiter, von denen zwei Daten wiederholen.** Nach den Zweifeln 1 und
   3 bleiben zwei: die Seite selbst und das LLM-Profil.

## Offene Fragen

1. **Bleiben vier Reiter oder zwei?** *Ohne Antwort: zwei* — „Konto" (alles
   ab Rang 1 bis 6) und „LLM-Profil". Buchungen und Monate gehen in den
   ersten auf.
2. **Wird der Saldo je Quelle gezeigt oder vereinigt?** *Ohne Antwort: je
   Quelle*, nebeneinander — das ist die offene Frage 1 des Entitätsprofils,
   und die Seite ist genau der Ort, an dem der Unterschied zählt.
3. **Führt eine Bewegungszeile in den Drawer oder auf den Sachverhalt?**
   *Ohne Antwort: in den Drawer* — der Sachverhalt ist der Fuß-Ausgang des
   Drawers, wie bei 0052.
