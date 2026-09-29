# 0210 · Weg des Belegs — was fachlich mit dem Beleg passiert ist

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-29; Owner-Blick (Titel) und fremde Abnahme stehen aus |
| Stufe | neu `entities/source-document/SourceDocumentMilestones.tsx` · Seite im Showcase `src/showcase/document/` |
| Klassen-Test | nein — kennt Sachverhalt, Buchung, Stapel, DUO: Entität Beleg, Form M (Karte) |
| Quelle | Anfrage ll-dev 2026-09-29 (Owner-Wunsch): Box „Verarbeitung" zeigt Traces statt Meilensteine; Beispiel `f5d0155c` (MAGURA) erledigt, gebucht, im Stapel — die Box sagt nichts davon |
| Ersetzt | `SourceDocumentHistory` (0150) in der rechten Spalte · die App-Box „Stapel und DUO-Ablage" (im `vat`-Slot von `SourceDocumentCard`) |
| Regel (spec-schreiben §3) | 5 — neue Entitäts-Form: keine vorhandene Form trägt „welche fachlichen Stationen hat dieser Beleg erreicht" |
| Spec von / am | Claude, 2026-09-29 |

## Ziel

Wer die Belegseite öffnet, sieht rechts in fünf Sekunden, **was mit dem Beleg
geschehen ist und was noch kommt** — in Wörtern der Kanzlei, ohne Protokoll.

## Aufbau

Eine Karte, Kopf „Weg des Belegs" (Annahme, s. Fragen), rechts „Ganzer
Verlauf" (Reiter mit den Traces). Darunter eine Liste von Stationen, je Zeile:

| Spalte | Inhalt |
|---|---|
| Zeichen | erreicht = Haken (`StateIcon done`) · steht aus = leerer Kreis (`open`) · Ablage gescheitert = `error` |
| Zeile 1 | Wort der Station · rechts Datum `TT.MM.JJJJ` |
| Zeile 2 | die Fakten der Station (s. u.), oder bei ausstehenden der Hinweis |

| Station (`kind`) | Wort | Zeile 2 |
|---|---|---|
| `done` | „Erledigt" | `StatusBadge document_done_via` · Begründung (`done_reason`) |
| `case` | „Sachverhalt zugeordnet" | `CaseCell layout="stacked"` mit Zustand |
| `entries` | „Gebucht" · „2 Buchungen" | je Buchung: Datum · `JournalEntryCell` (Soll an Haben mit Namen, Betrag) · `StatusBadge journal_entry_datev_stage`; ab 4 Buchungen drei und „n weitere" zum Reiter |
| `batch` | „Im Stapel" | Stapelname als Link · `StatusBadge export_batch` |
| `export` | „An DATEV übergeben" | `StatusBadge document_filing` · Meldung bei Fehler · Ablagepfad klein darunter |
| ausstehend | Wort der kommenden Station („Stapel zuordnen") | optional Hinweis mit Stufe (`info`/`warning`), z. B. „Wartet auf den September-Stapel." |

**Reihenfolge:** wie geliefert — die App ordnet (E2). Erreichte Stationen
oben, ausstehende darunter, abgesetzt durch die Zwischenzeile „Danach".
Ist nichts erreicht, steht nur der typische Ablauf der Belegart da, eingeleitet
mit dem Weg-Namen der App („Weg einer Rechnung").

**Begriffe** wie im Kopf-Prozessbild (0204): „Ludwig" ist die KI, „Verarbeitung"
das Automatische (T1); der Titel heißt deshalb nicht mehr „Verarbeitung".

## Schnittstelle

| Prop | Typ | Story |
|---|---|---|
| `milestones` | `DocumentMilestone[]` — Union über `kind`: `done {at, via, reason?}` · `case {at?, case: CaseLink, href}` · `entries {at?, entries: {key, date, lines: JournalLine[], currency, stage}[], moreHref?}` · `batch {at?, label, status, href?}` · `export {at, filing?: {status, message?, path?}}` | `Done`, `Mixed` |
| `upcoming` | `{ key; label; note?: { level: "info" \| "warning"; text } }[]` | `NotStarted`, `Mixed` |
| `pathLabel` | `string?` — „Weg einer Rechnung" | `NotStarted` |
| `href` | `string?` — Reiter „Verlauf" | alle |
| `accountHref` | `(n) => string` — an `JournalEntryCell` | `Done` |
| `loading` | `boolean?` | `Loading` |
| `error` | `{ onRetry? }?` | `Error` |

**Kann nicht:** rechnet keine Station ab und ordnet nicht (E2); zeigt keine
Traces (die bleiben im Reiter).

## Zustände

gefüllt (`Done`, `Mixed`) · leer = nichts erreicht → typischer Ablauf
(`NotStarted`) · leer ohne Ablauf: „Zu diesem Beleg ist noch nichts
geschehen." · lädt (`Loading`, drei Zeilen Skelett) · Fehler (`Error`, mit
„Erneut laden"). Leer nach Filter: entfällt, die Box filtert nicht.

## Stories

`v3/Entitäten/Beleg/SourceDocumentMilestones`: `Done` (A, MAGURA) ·
`NotStarted` (B, BICO, mit Hinweis) · `Mixed` · `ManyEntries` · `FilingFailed`
· `Loading` · `Error`. Im Einsatz: Showcase Belegseite.

## Offene Fragen

1. Titel „Weg des Belegs" statt „Verarbeitung" — neues Label. Ohne Antwort:
   „Weg des Belegs" (passt zu „Weg einer Rechnung" im Prozessbild-Dialog).
2. Buchungen aufklappbar oder als Verweis? Gebaut: bis drei offen in der Box,
   darüber „n weitere" als Verweis in den Reiter Buchungen.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Jede Station in ihrer Form nach der Tabelle „Aufbau" | Stories `Done`, `Mixed` | |
| Nichts erreicht → Weg-Name + ausstehende Stationen, Hinweis mit Stufe und Wort | `NotStarted` | |
| Ablage gescheitert: Fehlerzeichen, Meldung, kein Rot ohne Wort | `FilingFailed` | |
| Ab 4 Buchungen drei + „n weitere" | `ManyEntries` | |
| Lädt / Fehler mit Retry, Kopf bleibt | `Loading`, `Error` | |
| Kein Rohwert im Lesetext (T4) | alle | |
| 1280 px, rechte Spalte: keine Zeile bricht das Datum weg | Showcase Belegseite | |
