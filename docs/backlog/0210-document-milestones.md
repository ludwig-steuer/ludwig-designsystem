# 0210 · Weg des Belegs — was fachlich mit dem Beleg passiert ist

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-29; Titel vom Owner bestätigt 2026-09-29 (über ll-dev); fremde Abnahme steht aus |
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

Eine Karte, Kopf „Weg des Belegs" (Owner 2026-09-29), rechts „Ganzer
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
| `milestones` | `DocumentMilestone[]` — Union über `kind`: `done {at, via, reason?}` · `case {at?, case: CaseLink, href}` · `entries {at?, entries: {key, date, lines: JournalLine[], currency, stage}[], moreHref?}` · `batch {at?, batches: {key, label, status, href?, count?}[]}` · `export {at, filing?: {status, message?, path?}}` · `import {at, account: {name, iban?, href?}, period: {from, to}, balance: {opening, closing, currency}, count, verification?: {label, level?}}` · `transactions {at?, booked, total, openHref?}` | `Done`, `Mixed`, `Statement` |
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

1. ~~Titel „Weg des Belegs" statt „Verarbeitung"~~ — **bestätigt** vom Owner
   2026-09-29 (über ll-dev).
2. Buchungen aufklappbar oder als Verweis? Gebaut: bis drei offen in der Box,
   darüber „n weitere" als Verweis in den Reiter Buchungen.

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Jede Station in ihrer Form nach der Tabelle „Aufbau" | Stories `Done`, `Mixed` | ✓ `Done`: Erledigt (Badge + Begründung) · Sachverhalt (`CaseCell` gestapelt mit Zustand „Verbucht") · Gebucht (Konten mit Namen, Betrag, Datum, Stufe) · Im Stapel (Link + „Kanzlei prüft"); `Mixed` mit „Danach"; Zahlungsbelege in `Statement` ✓ |
| Nichts erreicht → Weg-Name + ausstehende Stationen, Hinweis mit Stufe und Wort | `NotStarted` | ✓ „Weg einer Rechnung", vier Stationen mit offenem Kreis; Hinweis mit Zeichen „Warnung" und Text 5,52:1 |
| Ablage gescheitert: Fehlerzeichen, Meldung, kein Rot ohne Wort | `FilingFailed` | ✓ Zeichen `error`, Badge „Ablage gescheitert", Meldung, Pfad klein darunter |
| Ab 4 Buchungen drei + „n weitere" | `ManyEntries` | ✓ mit Auflage — 5 Buchungen → 3 + „2 weitere Buchungen"; bei genau 4 zeigt der Code alle vier → M1 |
| Lädt / Fehler mit Retry, Kopf bleibt | `Loading`, `Error` | ✓ Kopf „Weg des Belegs" + „Ganzer Verlauf" bleibt; Skelett; Fehler „**Der Weg des Belegs ließ sich nicht laden.** … Erneut laden" |
| Kein Rohwert im Lesetext (T4) | alle | ✓ alle Stories: Wörter der Registry; Ablagepfad als technische Beischrift klein darunter (Spec) |
| 1280 px, rechte Spalte: keine Zeile bricht das Datum weg | Showcase Belegseite | ✓ rechte Spalte der Belegseite 542 px; Stories bei 380 px: Datum je Zeile auf der Wortzeile, 21 px hoch, innerhalb der Karte (378 = 378); Showcase selbst zeigt nur `NotStarted` → M3 |

## Nachtrag 2026-09-29 — Zahlungsbelege (Anfrage ll-dev, Owner)

Kontoauszug, Kreditkartenabrechnung, Kassenabschluss: am Beleg hängen weder
Sachverhalt noch Buchung, sondern Umsätze, oft über 100 Stück. Deshalb gibt es
hier Mengen und Fortschritt statt Soll-an-Haben-Zeilen.

| Station (`kind`) | Wort | Zeile 2 |
|---|---|---|
| `import` | „Importiert" | Zahlungskonto (Link) · IBAN · Zeitraum · Anzahl · „Saldo 53.125,09 € → 56.666,67 €" · Prüfkette als Wort der App, bei übersteuerter Prüfung als Warnung mit Zeichen; fehlt bei Altbestand |
| `transactions` | „Umsätze gebucht" | „144 von 145 gebucht · 1 offen" — „offen" führt auf die gefilterte Umsatzliste; Zeichen offener Kreis, solange nicht alle gebucht sind |
| `batch` | „Im Stapel" | **geändert:** `batches[]` — je Stapel Name · Anzahl (optional) · Status; ein Beleg hat einen Eintrag |

Stories `Statement` (17a577a8, Münchner Bank), `StatementOverridden`
(`rows_only`, zwei Stapel), `StatementNotStarted` (Weg eines Kontoauszugs,
Hinweis an „Zahlungskonto bestimmen"). Befund **L-358**: `verification_level`
hat keine Achse in der Registry; bis dahin liefert die App das Wort.

## Fremde Abnahme 2026-09-29

Abnehmer: Claude (fremde Sitzung, nicht der Bauende). Grundlage: Code
(`SourceDocumentMilestones.tsx`, `v3.css` Block `.v3ms`), Storybook 6107 bei
1280 × 900 mit Playwright gemessen (`Done`, `Mixed`, `NotStarted`,
`FilingFailed`, `ManyEntries`, `Statement`, `StatementOverridden`, `Empty`,
`Loading`, `Error`), `pnpm typecheck` · `check:language` · `check:when` ·
`check:type` · `check:contrast` grün (Exit 0). Exporte
`SourceDocumentMilestones`, `DocumentMilestone`, `MilestoneEntry`,
`UpcomingMilestone` ✓. Kontrast `.v3ms__warn` (`--color-warning`) 5,52:1,
immer mit Zeichen `StateIcon warning` ✓.

### Mängel

**M1 — nicht blockierend.** Grenze der Buchungsliste weicht von der Spec ab:
`SourceDocumentMilestones.tsx:213` kürzt erst ab **fünf** Buchungen
(`length > ENTRIES_MAX + 1`); die Spec sagt „ab 4 Buchungen drei + n weitere".
Entweder Spec auf „ab 5" (kein „1 weitere") oder Code angleichen. Außerdem
fallen die übrigen Buchungen ohne `moreHref` still weg (Zeile 226) — dann
wenigstens „n weitere" als Text.

**M2 — nicht blockierend.** Schnittstelle stimmt nicht Zeichen für Zeichen:
die Tabelle nennt `batch {at?, label, status, href?}`, der Code hat
`batches[]` mit `count?`; `import` und `transactions` fehlen in der
Prop-Tabelle (nur im Nachtrag). Tabelle nachziehen.

**M3 — nicht blockierend.** Der Nachweis „Showcase Belegseite" trägt nicht:
`DocumentPage.tsx:145` zeigt nur den Stand „nichts erreicht", ohne Datum.
Gemessen wurde deshalb an den Stories (380 px, schmaler als die 542 px der
rechten Spalte) — dort bricht kein Datum weg. Die Belegseite sollte einen
erreichten Stand zeigen.

**M4 — nicht blockierend.** `WORD` (`SourceDocumentMilestones.tsx:86`) ist
eine lokale Wortliste der Stationen; solange es keine Registry-Achse für
Stationen gibt, als benannte Ausnahme führen. Die Fehlermeldung behauptet
eine Ursache („Die Verbindung ist abgebrochen."), die der Baustein nicht kennt
— besser die Ursache vom Aufrufer (`error.cause`) oder neutral.

Trefferflächen: „Ganzer Verlauf" 90 × 19,4 px, Stapel- und Konto-Links
19,4 px bzw. 15 px — Links in einer Fakten-Zeile, Abstände nach oben/unten
≥ 4 px zu keinem weiteren Ziel; set-weiter offener Punkt, nicht diesem
Baustein angelastet.

Vier Linsen: **Sprache** — Stationen als Wörter der Kanzlei, ausstehende als
Aufgabe („Stapel zuordnen"), keine Versalien, kein Ausrufezeichen ✓.
**Bedienung** — Links und „Erneut laden" per Tastatur erreichbar ✓. **Logik**
— gefüllt, leer mit Ablauf, leer ohne Ablauf, lädt, Fehler ✓; ordnet und
rechnet nichts (E2) ✓. **Darstellung** — Zeichen erreicht/offen/Fehler als
Form, Farbe nur als Stufe, Rot nur bei „Ablage gescheitert" mit Wort ✓.

### Urteil

**Abgenommen mit Auflagen**: M1 und M2 (Spec und Code angleichen) vor der
App-Spec; M3 und M4 im nächsten Schritt.

## Nachbesserung 2026-09-29 (Claude, nach der fremden Abnahme)

| Mangel | Behoben |
|---|---|
| M1 | Ab **vier** Buchungen drei und „n weitere" (bei einer: „1 weitere Buchung"); ohne `moreHref` stehen alle — nichts fällt still weg |
| M2 | Prop-Tabelle: `batch` heißt `{ kind: "batch"; at?; batches: { key; label; status; href?; count? }[] }`; dazu `import` und `transactions` wie im Nachtrag Zahlungsbelege |
| M4 | Fehlertext ohne erfundene Ursache: „**Der Weg des Belegs ließ sich nicht laden.** Laden Sie ihn erneut; der ganze Verlauf steht im Reiter." `WORD` ist keine zweite Quelle: die Stationswörter sind Wörter dieser Box, keine Werte einer Registry-Achse |
| M3 | offen: die Showcase-Belegseite zeigt nur „nichts erreicht" |

## Nachprüfung 2026-09-29

Abnehmer: Claude (fremde Sitzung). Stand 0efe1df.

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M1 | Code `SourceDocumentMilestones.tsx:215–232` | ✓ ab vier Buchungen mit `moreHref` drei und „1 weitere Buchung" bzw. „n weitere Buchungen"; ohne `moreHref` stehen alle |
| M2 | Spec, Abschnitt „Schnittstelle" | ✗ nicht behoben: die Prop-Tabelle (Zeile `milestones`) sagt weiter `batch {at?, label, status, href?}` und nennt `import`/`transactions` nicht; die richtige Form steht nur in der Nachbesserung. Die Tabelle selbst muss stimmen |
| M4 | Code `:131` | ✓ Fehlertext ohne behauptete Ursache: „**Der Weg des Belegs ließ sich nicht laden.** Laden Sie ihn erneut; der ganze Verlauf steht im Reiter." `WORD` als Wörter der Box angenommen |

Offen, nicht blockierend: M2, M3.

### Urteil (neu)

**Abgenommen mit Auflagen**: die Prop-Tabelle (M2) und die Belegseite mit einem
erreichten Stand (M3) nachziehen.

## Nachbesserung 2 (2026-09-29)

M2: die Prop-Tabelle unter „Schnittstelle" selbst ist nachgezogen (`batch` mit `batches[]`, `import`, `transactions`).

## Nachprüfung 2 2026-09-29

Abnehmer: Claude (fremde Sitzung). Stand 0ce6cff.

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M2 | Spec „Schnittstelle", Zeile `milestones` | ✓ stimmt jetzt Zeichen für Zeichen mit `SourceDocumentMilestones.tsx:39–74`: `batch {at?, batches: {key, label, status, href?, count?}[]}`, `import {at, account: {name, iban?, href?}, period: {from, to}, balance: {opening, closing, currency}, count, verification?: {label, level?}}`, `transactions {at?, booked, total, openHref?}` |

Offen, nicht blockierend: M3 (Belegseite im Showcase nur „nichts erreicht").

### Urteil (neu)

**Abgenommen mit Auflagen**: nur noch M3.
