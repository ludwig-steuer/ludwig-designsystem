# Konto — Detailseite · Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/accounts/[accountNumber]/page.tsx` (846 Z.) — Identifikator ist die **Kontonummer**, nicht die Id |
| Heute gebaut in | dieselbe Datei (vier Tabs inline) plus `modules/accounts/` (`accountFacts`, `accountSourceLabel`), `MonthlyBarChart`, `DatevEntryDrawer`, `LudwigEntryDrawer` |
| Entitäten | Konto (`docs/entitaeten/account.md`) · Buchung (beide Quellen) · Geschäftspartner |
| Baustein in v3 | **`LedgerAccountView`** (0063, gebaut 2026-09-07) — nicht `AccountView`: der Name ist im Spiegel bereits ein Typ (`"flat" | "grouped"`) |
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
| 2 | „Wie viel liegt drauf?" | **DATEV führt, Ludwig ist das Delta** (Owner 2026-09-04): der Saldo des Spiegels, daneben „nur in Ludwig" als Abweichung — kein zweiter, gleichrangiger Saldo | `KpiGrid` + `KpiTile`, `Amount` |
| 3 | „Ist das viel oder wenig für dieses Konto?" | Verlauf über die letzten Monate | `BarChart` (0110) |
| 4 | „Was liegt konkret drauf?" | Die Bewegungen, beide Quellen **in einer Liste**, Herkunft als Spalte | `AccountEntryList` |
| 5 | „Sagen Ludwig und DATEV dasselbe?" | Die **Herkunft-Spalte** der Bewegungszeile (0067, vier Klassen): nur in DATEV · von Ludwig gebucht und bestätigt · exportiert und noch nicht wiedergefunden · nur in Ludwig | `accountEntryColumns` (Herkunft-Zeichen) |
| 6 | „Wofür ist dieses Konto gedacht?" | Stammdaten: SKR-Klasse, Kontenfunktion, Automatik-Steuersatz. **Kontenfunktion und Steuersatz haben in keinem Typ ein Feld** — Befund L-95; bis dahin zeigt die Randspalte, was `AccountFactsVM` trägt | `AccountFacts` in der Randspalte |
| 7 | „Was weiß Ludwig sonst über das Konto?" | Beschreibung, Belegbegriffe (LLM-Profil) | `LongText`, `Badge` |

Rang 1–3 stehen ohne Klick. Rang 4 ist die Hauptfläche. Rang 5 steht **in**
der Zeile, nicht in einem eigenen Reiter. Rang 6 und 7 dürfen je einen Klick
kosten.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| Eine einzelne Buchung aufschlagen | oft — der Grund, warum jemand hier ist | einen Klick und **einen** URL-Parameter: zwei Quellen sind eine Eigenschaft der Zeile, nicht zwei Drawer (`?buchung=<id>`) |
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


## Eine bewusste Abweichung vom Entitätsprofil

Das Profil empfiehlt, die **Saldospalte** kehre im View wieder, „wo eine
Quelle allein gezeigt wird". Der View zeigt die Quellen aber nicht allein,
sondern in **einer** Liste mit der Herkunft als Spalte (Owner-Entscheid
2026-09-04) — und ein laufender Saldo stimmt nur bei genau einer Sortierung
und einer Quelle. Solange es keinen Quellfilter gibt, bleibt die Spalte
deshalb weg; mit ihm ist sie Ausbau. Dieselbe Begründung wie beim Kontoauszug
(0085), nur eine Entität weiter.

## Offene Fragen

1. **Bleiben vier Reiter oder zwei?** *Ohne Antwort: zwei* — „Konto" (alles
   ab Rang 1 bis 6) und „LLM-Profil". Buchungen und Monate gehen in den
   ersten auf.
2. **Wird der Saldo je Quelle gezeigt oder vereinigt?** **Beantwortet vom
   Owner am 2026-09-04:** DATEV führt, Ludwig ist das Delta. Nicht zwei
   gleichrangige Salden — zwei gleich große Zahlen nebeneinander laden dazu
   ein, sie zu addieren; und nicht vereinigt, weil das die Abweichung
   verbirgt, wegen der jemand hier ist. So ist `AccountFacts` (0066) gebaut.
3. **Führt eine Bewegungszeile in den Drawer oder auf den Sachverhalt?**
   *Ohne Antwort: in den Drawer* — der Sachverhalt ist der Fuß-Ausgang des
   Drawers, wie bei 0052.

## Detailseiten-Standard (Nachtrag 2026-09-08)

Geprüft gegen `docs/detailseiten-standard.md` (D1–D16).

| | |
|---|---|
| Layout | **D-L3 Randspalte** mit den **Fakten** darin — so gebaut (`LedgerAccountView`, 0063, `minDetail={960}`). Frage 2 aus §1.2 greift: die Bewegungen sind die Arbeitsfläche (Rang 4), die Stammdaten werden daneben mitgelesen (Rang 6). Ein Faktenblock über der Liste drückt die Hauptantwort unter die Falz — das ist Zweifel 4 dieses Profils. |
| Reiter | **Übersicht** (Rang 1–5, mit den Bewegungen in voller Länge) · **Details** (Rang 6–7, Stammdaten und LLM-Profil mit `InlineEdit`) · **Rohdaten**. Die Reiter „Buchungen" und „Monatsübersicht" entfallen wie in Zweifel 1 und 3 entschieden. |
| Zone 4 (Abrisse) | Bewegungen **p50 4 · p90 20 · p99 250 · max 3.400** je Konto und Jahr — die Deckung trüge eine Abriss-Karte mühelos, aber die Liste ist die Arbeitsfläche und steht deshalb vollständig (s. Abweichung) · Monatsverlauf als `BarChart` über zwölf Monate (D16: ab vier Werten, hier zwölf) |
| Zone 5 (Verlauf) | **entfällt**: die Historie des Kontos ist im Entitätsprofil als „viele" geführt, aber nicht erhoben, und es gibt keinen `resource_kind` für das Konto. Bis dahin keine Zone und kein Reiter „Verlauf" (D11). |

## Abweichung vom Detailseiten-Standard

- **D11/D15 (Abriss in Zone 4):** Die Bewegungen stehen **vollständig** in der
  Übersicht statt als Abriss von fünf Zeilen mit eigenem Reiter — weil das
  Profil sie bei Rang 4 als Hauptfläche führt und ein Abriss aus der
  Hauptaufgabe einen Klick machen würde (benannte Ausnahme in §5.2 des
  Standards). Sie hat deshalb **keinen** eigenen Reiter (MECE).
- **D12 (Rohdaten zuletzt):** Heute hat die Seite keinen Rohdaten-Reiter (vier
  Reiter: Übersicht, Buchungen, Monatsübersicht, LLM-Profil). Das ist keine
  Ausnahme, sondern ein Befund für die App (**L-258**).
