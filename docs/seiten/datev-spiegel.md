# DATEV-Spiegel — Seitenprofil

| | |
|---|---|
| Status | Entwurf |
| Route | `ludwig/app`: `app/(app)/clients/[clientSlug]/[year]/datev/page.tsx` (135 Z.) |
| Heute gebaut in | acht Nachbardateien, `e60c168d` aus einer 1208-Zeilen-Datei geschnitten: `AbgleichTab` 388 · `BuchungenTab` 163 · `UebersichtTab` 137 · `KontenTab` 116 · `shared` 86 · `StapelTab` 78 · `PartnerTab` 76 · `WirtschaftsjahreTab` 53 |
| Entitäten | DATEV-Spiegelbuchung, Buchungsstapel, Abgleich-Lauf; nachgeschlagen: Konto, Geschäftspartner, Wirtschaftsjahr |
| Baustein in v3 | noch keiner — die drei Befunde vom 2026-09-08 sagen, was fehlt: `KpiTile` ohne `href` (0126), kein Server-Formular für die `GET`-Filterzeile, und die Achse `abgleich_lauf` ohne Wort für die Bridge-Störung (L-221) |
| Fachliche Quelle | `docs/topics/datev.md`, `docs/reference/datev-api/api-verhalten.md` („Push-204 ≠ angekommen") |
| Profil von / am | Claude, 2026-09-08 · gelesen: alle acht Dateien, `truth-queries.ts`, `sync-history.ts`; gemessen: Staging, 6 Mandanten |

## Der Bestand, bevor es losgeht

Alles gezählt auf Staging am 2026-09-08, über alle sechs Mandanten.

| | |
|---|---|
| Spiegelbuchungen | 41.826 (2025: 25.594 · 2026: 16.232) |
| davon `new_unprocessed` — **nur in DATEV** | **40.745 = 97,4 %** |
| davon `matched_ludwig` / `matched_split` | 297 = 0,7 % |
| davon `unclear` | 752 = 1,8 % |
| davon `disappeared_committed` — **festgeschrieben und weg** | 29 |
| davon `match_state IS NULL` | **0** |
| Buchungsstapel | 563, davon 480 festgeschrieben (85 %) · p50 146 Sätze, max 1.165 |
| Offene Posten | 53.975 |
| Abgleich-Läufe insgesamt | 23 — **7 gescheitert (30 %)** |
| Alter des jüngsten Spiegel-Stands je Mandant | **7 · 9 · 18 · 27 Tage** — kein einziger ist aktuell |
| Geschäftspartner mit Personenkonto | 12.920 Debitoren · 1.983 Kreditoren · **größter Mandant allein 6.228 Debitoren** |
| Feldfüllung Spiegelbuchung | Belegnummer 100 % · Buchungstext 99,2 % · Herkunftskennzeichen 47 % · Sachverhalts-Nummer **2,4 %** |
| `inspection_status` am Stapel | **563 von 563 = `not_specified`** |

Zwei Zahlen tragen die ganze Seite. **97,4 % der Spiegelbuchungen kennt
Ludwig nicht** — der Spiegel ist überwiegend fremdes Gebiet, nicht eine
Bestätigung des eigenen. Und **kein Mandant hat einen aktuellen Stand**: der
frischeste ist eine Woche alt, der älteste vier.

## Job

> Wenn **gegen DATEV gebucht werden soll und der Spiegel Tage alt ist**, will
> **die Kanzlei** **wissen, wie alt der Stand ist, ihn neu holen und sehen,
> was DATEV enthält, das Ludwig nicht kennt**, damit **sie auf einem Stand
> arbeitet, der wirklich gilt**.

- **Fertig ist die Rolle, wenn** sie einen frischen Spiegel geholt hat, weiß,
  dass der Lauf durchlief, und die Zahl der DATEV-Fremdbuchungen kennt.
- **Misslungen ist die Seite, wenn** sie einen 27 Tage alten Stand wie einen
  aktuellen aussehen lässt. Sie zeigt heute acht Kennzahlen, aber keine
  beantwortet zuerst „darfst du dem hier trauen".

Der Rest der Seite — Konten, Kreditoren, Debitoren, Wirtschaftsjahre — ist
**kein Job, sondern ein Nachschlagewerk**. Es beantwortet keine Frage, die
jemand mitbringt; es beantwortet Fragen, die beim Prüfen entstehen.

## Fragen, in dieser Reihenfolge

| Rang | Frage der Rolle | Antwort steht in | Baustein |
|---|---|---|---|
| 1 | „Wie alt ist der Stand — darf ich damit arbeiten?" | **Eine** Zeile über allem: Spiegel-Stand + Alter, farbig ab einer Woche | `EntityHeader` mit `status`, `AgeDelta` als Wert |
| 2 | „Ist der letzte Abgleich durchgelaufen?" | Ausgang des jüngsten Laufs — bei 30 % Fehlerquote keine Nebensache | `StatusBadge` neben Rang 1, Detail in der Historie |
| 3 | „Dann hol ihn neu." | Der Anfordern-Knopf, in Sichtweite von Rang 1 und 2 | `bulkAction`/Formular, heute `requestDatevResyncAction` |
| 4 | „Was steht in DATEV, das Ludwig nicht kennt?" | Die 40.745 — als **Zahl mit Weg**, nicht als Kachel ohne Ausgang | `KpiTile` mit `href` auf die gefilterte Liste |
| 5 | „Ist eine festgeschriebene Buchung verschwunden?" | Die Anomalie — **29 auf dem Bestand, sie ist nicht hypothetisch**. Steht da, wenn es sie gibt, sonst gar nicht | `Banner tone="danger"` mit Weg in die gefilterte Liste |
| 6 | „Was ist zuletzt passiert?" | Läufe, Snapshots und Bridge-Störungen in **einer** Historie (`sync-history.ts`) | `DataTable` über `HistoryRow` |
| 7 | „Was steht in dieser Buchung / diesem Stapel?" | Nachschlagen: Liste → Drawer, Rohdaten daneben | `DataTable` + Drawer, `RawRowDrawer` bleibt |
| 8 | „Was fehlt, damit die Buchhaltung starten kann?" | Datenlücken mit Folge und Herkunft | `DataGapList` → `Banner` + Liste |

Rang 1–3 sind **eine** Zeile und ein Knopf und stehen ohne Scrollen. Rang 4–5
sind Zahlen, die einen Weg haben. Rang 6–7 sind die Listen. Rang 8 steht nur
da, wenn es etwas zu sagen gibt.

## Nebenjobs

| Nebenjob | Wie oft | Darf kosten |
|---|---|---|
| J-20 · In einem Stapel nachsehen, was drin ist | beim Prüfen einer Festschreibung | einen Reiter, einen Drawer |
| Ein Personenkonto nachschlagen (Kreditor/Debitor) | selten, und die Stammdaten stehen woanders vollständig | einen Reiter — **oder gar keinen**, siehe Zweifel 3 |
| J-22 · Die Wirtschaftsjahre sehen, die DATEV führt | bei der Einrichtung, danach nie | einen Reiter |
| J-23 · Die Rohdaten einer Zeile lesen | beim Debuggen, nicht im Alltag | ein Icon in der Zeile |

## Was hier nicht hingehört

- **Der Kontenplan und das Kontoblatt.** Es gibt sie als eigene Seiten, und
  seit `6ba47fb2` beantworten sie die Frage besser: eine Liste über beide
  Quellen mit der Herkunft als Spalte. Der Reiter „Konten in DATEV" zeigt
  dieselben Konten aus dem Spiegel **allein** — die halbe Antwort, die auf
  der Kontoseite gerade durch die ganze ersetzt wurde.
- **Buchen.** Die Seite ist read-only bis auf den Abgleich-Trigger. Was aus
  den 40.745 Fremdbuchungen wird, entscheidet der Sachverhalt.
- **Der Export nach DATEV.** Die Gegenrichtung, eigene Seite (`stapel`) —
  der Redirect steht schon in `resolveDatevTab`.

## Zweifel am heutigen Format

1. **Drei Kacheln für eine Frage.** „Neueste Buchung", „Letzter Stapel-Sync"
   und „Spiegel-Stand (DATEV)" tragen alle ein Datum plus Alters-Delta und
   beantworten dieselbe Frage: wie aktuell bin ich. Folgerung: **eine**
   Aussage über der Seite, die anderen beiden als ihr Kleingedrucktes.
2. **Eine Kachel steht dauerhaft auf null.** „Noch nicht abgeglichen"
   zählt `match_state IS NULL` — auf dem gesamten Staging-Bestand gibt es
   davon **keine einzige**; jeder der 41.826 Sätze trägt einen Zustand. Ihr
   Untertitel („ohne Ludwig-Zuordnung") beschreibt außerdem genau das, was
   die Nachbarkachel „DATEV-Fremdbuchungen" zeigt. Zwei Beschriftungen für
   eine Sache, und die Zahl darunter gehört zur anderen. Folgerung: streichen.
3. **Der Konten-Reiter ist eine zweite Kontoseite.** `listTruthAccounts`
   aggregiert die Spiegel-`lines`, und der Klick zeigt `EntryList` — die
   Spiegelbuchungen des Kontos, ohne die Ludwig-Seite. Folgerung: streichen
   und auf `[year]/accounts` verweisen. Dasselbe gilt für Kreditoren und
   Debitoren, die als Personenkonten im Kontenplan stehen.
4. **`EntryList` wird von zwei Reitern gerendert** (Buchungen und Konten) —
   die Kopplung war in der 1208-Zeilen-Datei unsichtbar und fiel erst beim
   Schnitt auf. Folgerung: beim Umbau **eine** `DataTable`-Spaltendefinition,
   nicht zwei.
5. **Die Prüfungs-Spalte trägt nichts.** `inspection_status` ist auf allen
   563 Stapeln `not_specified`. Folgerung: raus, bis sie etwas unterscheidet
   — wie „Quelle" im Kontenplan.
6. **Die Partner-Listen schneiden still ab.** `PARTNER_LIMIT = 1000`, und der
   Kopf zeigt `rows.length`. Der größte Mandant hat 6.228 Debitoren — dort
   steht dann „1000", ohne ein Wort darüber, dass 5.228 fehlen. Eine Liste,
   die kürzer ist, als sie behauptet, ist schlimmer als eine lange.
   Folgerung: Pager, oder der Reiter fällt mit Zweifel 3 ohnehin weg.
7. **Stapel und Partner haben keinen Pager**, Buchungen und Konten haben
   einen. Dieselbe Art Liste, zwei Bauweisen.
8. **Die Sachverhalts-Nummer ist auf 2,4 % gefüllt.** Eine Spalte, die in 97
   von 100 Zeilen leer ist, ist keine Spalte. Folgerung: in den Titel der
   Belegnummer, wie es der v3-Spaltensatz `accountEntryColumns` schon tut.
9. **Sieben Reiter für einen Job.** Rang 1–3 des Gesprächs verteilen sich auf
   zwei davon („Übersicht" trägt die Zahlen, „Abgleich" den Knopf) — die
   Frage „wie alt ist der Stand" und die Handlung „hol ihn neu" stehen an
   verschiedenen Orten.

## Offene Fragen

1. **Bleiben Konten, Kreditoren, Debitoren und Wirtschaftsjahre hier?**
   *Ohne Antwort: nein* — Zweifel 3. Sie stehen vollständiger auf den eigenen
   Seiten; hier sind sie die Spiegel-Hälfte davon. Das ist der Owner-Entscheid
   mit dem größten Ausschlag: er halbiert die Seite von sieben Reitern auf
   drei (Übersicht, Abgleich, Buchungen) plus Stapel.
2. **Wird aus „Übersicht" und „Abgleich" ein Reiter?** *Ohne Antwort: ja* —
   die Zahlen sagen, wie es steht, der Knopf ändert es, die Historie erklärt
   es. Das ist ein Gespräch, kein zwei.
3. **Führt die Buchungszeile in den Drawer oder auf den Sachverhalt?**
   *Ohne Antwort: in den Drawer* — bei 2,4 % gefüllter Sachverhalts-Nummer
   gibt es für 97 von 100 Zeilen gar kein Ziel.
4. **Bleibt der Rohdaten-Drawer?** *Ohne Antwort: ja*, aber als Icon in der
   Zeile, nicht als eigene Spalte in jeder Liste. Er ist Debug-Werkzeug und
   soll aussehen wie eines.
