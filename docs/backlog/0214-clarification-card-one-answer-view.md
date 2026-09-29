# 0214 · ClarificationCard — die eine Antwort-Ansicht für Klärungsfragen

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-29; fremde Abnahme steht aus |
| Stufe | erweitert `entities/clarification/ClarificationCard.tsx` · `patterns/ChoicePrompt` (Überschrift der Optionen, Zeilen-Optionen, Frage ausblendbar) · `primitives/RadioGroup` (`variant: "rows"`) |
| Klassen-Test | Karte: nein (Klärung). RadioGroup-Zeilen, ChoicePrompt-Fußzeile: ja |
| Quelle | Owner-Feedback 2026-09-29 über ll-dev4: Stapelabnahme Schritt 2 (`KlaerungDetail`) und Sachverhalt (`ClarificationCard`) sehen verschieden aus; die Struktur der Abnahme ist die Basis, die Teile der Karte kommen dazu |
| Regel (spec-schreiben §3) | 2 — erweitern: die Karte trägt den Fall zu vier Fünfteln |
| Ersetzt (App, danach) | `KlaerungDetail` + `CaseContextBlock` in `batch-review/ui/Step2List.tsx`; der lose TextButton „Zurückstellung aufheben" unter der Karte auf der Sachverhaltsseite |

## Aufbau (von oben nach unten)

1. **Kopf** wie bisher (Titel, Stand, Pflicht, Meta-Zeile), dazu optional
   `caseLink` „Sachverhalt 2026-0042 · Titel" als Link — in der Abnahme nötig,
   auf der Sachverhaltsseite weggelassen.
2. „Zurückgestellt" wie bisher, dann Frage und Text.
3. **Empfehlung** (Box), 4. **Grundlage** (Fakten).
5. **Quellen und Kontext — ein Block.** Je Art ein Aufklapper mit Anzahl:
   Belege · Konten · Zahlungen · Buchungen · Weitere Quellen. Die App ordnet die
   zitierten Quellen in ihre Gruppe ein (E2); ein Eintrag, den Ludwig genannt
   hat (`cited`), steht **oben** und trägt das Wort „genannt".
6. Inhalt **tabellarisch**, Beträge rechts mit `tnum`:
   Belege: Datum · Aussteller · Beleg-Nr. · Betrag — Konten: Nummer · Name
   (numerisch sortiert, von der App) — Zahlungen: Datum · Betrag ·
   Gegenpartei/Zweck · Zahlungskonto — Buchungen: Datum · Soll · Haben · Betrag
   · BU · Stand. Ein Klick auf eine Zeile ruft **`onSelect`** und navigiert
   nicht (die Antwort bleibt halb getippt, der Aufrufer öffnet einen Drawer);
   ohne `onSelect` bleibt `href`.
7. Verlauf wie bisher.
8. **Antwort:** mit Optionen die Überschrift **„Antwortoptionen"** und die
   Optionen als ganze Zeilen zum Anklicken (die Liste der Abnahme); die
   Empfehlung ist vorausgewählt. Das Freitextfeld steht **immer** da
   („Oder selbst formulieren" neben Optionen, sonst „Antwort" ohne Überschrift).
9. **Ein Hauptknopf** [Antwort speichern] (Beschriftung `submitLabel` vom
   Aufrufer). Die Auswege bleiben **klein**, als Textzeilen darunter (Owner,
   Korrektur 2026-09-29: „Zurückstellen und anderweitig geklärt eher kleiner"):
   „Woanders geklärt? **Anderweitig geklärt**" · „Jetzt nicht zu klären?
   **Zurückstellen**" · bei zurückgestellter Frage „**Zurückstellung
   aufheben**" (`onUndefer`) in derselben Form statt unter der Karte. Die
   ReasonDialogs bleiben. „Antwort speichern und selbst korrigieren" entfällt.
   Nachtrag Verlauf (Rückfrage-Faden): **nicht bauen**, Owner denkt nach.

## Schnittstelle (neu)

| Prop / Feld | Typ |
|---|---|
| `caseLink` | `{ label: string; href: string }` |
| `evidence` | `{ documents?, accounts?, payments?, entries?, other? }` — Zeilen mit `id`, `cited?`, und je Art: Beleg `{ date, issuer, number, amount, currency }`, Konto `{ number, name }`, Zahlung `{ date, amount, currency, text, paymentAccount }`, Buchung `{ date, debit, credit, amount, currency, taxKey?, state? }`, weitere `ClarificationSource` |
| `onSelect` | `(item: { kind: "document" \| "account" \| "payment" \| "entry" \| "other"; id: string }) => void` |
| `submitLabel` | `string` — Standard „Antwort speichern" |
| `onUndefer` | `() => Promise<void>` |

## Stories

`ClarificationCard`: `InBatchReview` (Sachverhalt-Link, Empfehlung, Grundlage,
vier Gruppen mit genannten Einträgen, Antwortoptionen, Knopfzeile) ·
`AtCase` (ohne Link) · `Deferred` (Aufheben in der Knopfzeile) · `FreeTextOnly`
· bestehende Stories bleiben.

## Gebaut 2026-09-29

- Zählung: der Aufklapper trägt die Anzahl rechts im Kopf (`Disclosure count`, Regel des Sets V3) statt „Belege (5)" im Wort.
- „genannt" steht als leise zweite Zeile am Schlüssel der Zeile; genannte Einträge stehen oben.
- Ohne `evidence` fällt die Karte auf die flache `sources`-Liste zurück — sie erscheint dann als „Weitere Quellen" im selben Block.
- Gemessen (Story `InBatchReview`, 760 px): keine Evidenz-Tabelle scrollt quer; Antwortoptionen je 41 px hoch, gewählte fett mit Akzentrand; Freitext „Oder selbst formulieren" neben den Optionen; Hauptknopf mit `submitLabel`; Auswege als kleine Zeilen „Anderweitig geklärt", „Zurückstellen".

## Nachtrag 2026-09-29 — Verlauf und Akteure (Owner-Freigabe über ll-dev4)

**A · `ClarificationThread`** (neu, `entities/clarification/`): alle Fragen und Notizen eines Sachverhalts, älteste oben (die App ordnet), als eigener Block unter der Karte — Aufklapper „Verlauf" mit Anzahl, standardmäßig zu (`defaultOpen`). Je Eintrag eine Zeile: Art (Frage/Notiz) · wer fragt → wer gefragt ist · Datum · Stand · Titel. Aufgeklappt: die Frage, dann jeder Schritt mit Wort, Person, Datum + Uhrzeit und Text — „Antwort", „Anderweitig geklärt" (mit Grund), „Zurückgestellt bis …" (mit Grund). Die Frage auf dem Schirm (`currentId`) steht zuletzt, markiert „aktuell", ohne Aufklapper; Notizen klappen nicht auf (ihr Titel ist ihr Inhalt). Entscheid: eigener Baustein statt `ClarificationList` im Lesemodus — der Faden ist chronologisch und die Zeile trägt „wer → wen", beides hat die Liste nicht.

**B · Akteure:** die Meta-Zeile der Karte sagt jetzt auch „gefragt von …" (`raisedBy`, sonst „Ludwig"). Der Block der Karte heißt „**Verlauf dieser Frage**" — der Verlauf des Sachverhalts ist der Faden darunter; zwei Blöcke tragen nicht denselben Namen. `actorName` ist exportiert.

Gemessen: alle Zeilen des Fadens bündig (54 px), keine Zeile bricht.
