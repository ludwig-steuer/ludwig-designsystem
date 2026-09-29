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
vier Gruppen mit genannten Einträgen, Antwortoptionen, Auswege, Verlauf
darunter) · `AtCaseFreeText` (ohne Link, nur Antwortfeld) · `DeferredWithUndo`
(Aufheben als kleine Zeile) · bestehende Stories bleiben. `ClarificationThread`:
`Thread` · `Single`. `RadioGroup/Rows` · `ChoicePrompt/OptionRows`.

## Gebaut 2026-09-29

- Zählung: der Aufklapper trägt die Anzahl rechts im Kopf (`Disclosure count`, Regel des Sets V3) statt „Belege (5)" im Wort.
- „genannt" steht als leise zweite Zeile am Schlüssel der Zeile; genannte Einträge stehen oben.
- Ohne `evidence` fällt die Karte auf die flache `sources`-Liste zurück — sie erscheint dann als „Weitere Quellen" im selben Block.
- Gemessen (Story `InBatchReview`, 760 px): keine Evidenz-Tabelle scrollt quer; Antwortoptionen je 41 px hoch, gewählte fett mit Akzentrand; Freitext „Oder selbst formulieren" neben den Optionen; Hauptknopf mit `submitLabel`; Auswege als kleine Zeilen „Anderweitig geklärt", „Zurückstellen".

## Nachtrag 2026-09-29 — Verlauf und Akteure (Owner-Freigabe über ll-dev4)

**A · `ClarificationThread`** (neu, `entities/clarification/`): alle Fragen und Notizen eines Sachverhalts, älteste oben (die App ordnet), als eigener Block unter der Karte — Aufklapper „Verlauf" mit Anzahl, standardmäßig zu (`defaultOpen`). Je Eintrag eine Zeile: Art (Frage/Notiz) · wer fragt → wer gefragt ist · Datum · Stand · Titel. Aufgeklappt: die Frage, dann jeder Schritt mit Wort, Person, Datum + Uhrzeit und Text — „Antwort", „Anderweitig geklärt" (mit Grund), „Zurückgestellt bis …" (mit Grund). Die Frage auf dem Schirm (`currentId`) steht zuletzt, markiert „aktuell", ohne Aufklapper; Notizen klappen nicht auf (ihr Titel ist ihr Inhalt). Entscheid: eigener Baustein statt `ClarificationList` im Lesemodus — der Faden ist chronologisch und die Zeile trägt „wer → wen", beides hat die Liste nicht.

**B · Akteure:** die Meta-Zeile der Karte sagt jetzt auch „gefragt von …" (`raisedBy`, sonst „Ludwig"). Der Block der Karte heißt „**Verlauf dieser Frage**" — der Verlauf des Sachverhalts ist der Faden darunter; zwei Blöcke tragen nicht denselben Namen. `actorName` ist exportiert.

Gemessen: alle Zeilen des Fadens bündig (54 px), keine Zeile bricht.

## Fremde Abnahme 2026-09-29

Abnehmer: Claude (fremde Sitzung, nicht der Bauende). Stand 8b62f80, Code
(`ClarificationCard.tsx`, `ClarificationThread.tsx`, `ChoicePrompt.tsx`,
`RadioGroup.tsx`, `v3.css`), Storybook 6107 bei 1280 × 900 mit Playwright
gemessen. `pnpm typecheck` · `check:language` · `check:when` · `check:type` ·
`check:contrast` grün (Exit 0).

| Kriterium (Aufbau) | Nachweis | Ergebnis |
|---|---|---|
| 1 `caseLink` im Kopf, auf der Sachverhaltsseite weg | `InBatchReview`, `AtCaseFreeText` | ✓ „Sachverhalt 2026-0042 · Bewirtung Musterfirma" als Link; in `AtCaseFreeText` fehlt er |
| 3/4 Empfehlung vor Grundlage | `InBatchReview`, DOM-Reihenfolge | ✓ Empfehlung · Grundlage · Quellen und Kontext · Antwortoptionen · Oder selbst formulieren |
| 5 Ein Block, je Art ein Aufklapper mit Anzahl, „genannt" oben | `InBatchReview` | ✓ Belege 2 · Konten 2 · Zahlungen 1 · Buchungen 2 · Weitere Quellen 1; genannte Einträge zuerst mit „genannt" |
| 6 tabellarisch, Beträge rechts; kein Querscroll bei 760 px | `InBatchReview`, `AtCaseFreeText` | ✓ alle vier Tabellen 744 = 744 |
| 6 Klick ruft `onSelect`, navigiert nicht | `InBatchReview` | ✓ am Schlüssel: Enter auf „21.08.2026 genannt" → „Drawer öffnet: document:doc-4471", URL unverändert; ✗ an der Zeile → M1 |
| 8 „Antwortoptionen" als ganze Zeilen, Empfehlung vorgewählt, Freitext immer | `InBatchReview`, `AtCaseFreeText`, `InPortal` | ✓ zwei Zeilen je 760 × 41 px, „Reisekosten (4670)" vorgewählt, fett; „Oder selbst formulieren" daneben; ohne Optionen nur „Antwort" |
| 9 ein Hauptknopf mit `submitLabel`, Auswege klein | `InBatchReview`, `DeferredWithUndo` | ✓ „Antwort speichern und zurück an Ludwig" (34 px, mit Taste Strg+Enter); „Woanders geklärt? Anderweitig geklärt", „Jetzt nicht zu klären? Zurückstellen", „Doch jetzt klären? Zurückstellung aufheben" als Textzeilen |
| B „gefragt von", „Verlauf dieser Frage" | `InBatchReview`, Code | ✓ „gefragt von Ludwig"; Block heißt „Verlauf dieser Frage" (Code); siehe M3 |
| A Faden: bündig, Notiz klappt nicht auf, aktuell markiert, nicht doppelt | `ClarificationThread/Thread`, `Single`, `InBatchReview` | ✓ fünf Zeilen, alle Zeilen links bei 54 px, 36–40 px hoch; Notiz ohne `details`/Knopf; aktuelle Frage zuletzt, Hintergrund `--color-accent-50`, „aktuell" 5,04:1, Titel genau einmal; `Single` „Verlauf 1"; in der Karte zu, mit Anzahl 5 |
| Tastatur Radio-Zeilen | `InBatchReview` | ✓ Pfeil hoch wählt und fokussiert die erste Zeile; Fokusring 2 px `--color-focus` an der Zeile (`:focus-visible`); Klick irgendwo in der Zeile wählt |
| Tastatur `onSelect`-Knöpfe, Aufklapper | `InBatchReview` | ✓ Tab-Reihe: Aufklapper · deren Knöpfe · nächster Aufklapper … · Radio; Enter öffnet den Aufklapper (Kopf 37 px) und löst `onSelect` aus |
| Trefferflächen | `InBatchReview` | ✓ Optionszeile 41 px, Pick-Knöpfe 24–37 px hoch („4650" 30 × 24), Aufklapper 37 px; ✗ Auswege 19 px, Sachverhalt-Link 15 px → M4 |
| Kontrast | gemessen | ✓ `.v2clc__cited` 6,17:1 (11,5 px); `.v3clt__current` 5,04:1; markierte Zeile Text 12,75:1, Rand 3,55:1; Rand der unmarkierten Zeile 1,5:1 (Radio und Wort tragen die Form, Hinweis) |
| Keine Regression | `Filled`, `Answering`, `WithRecommendation`, `People`, `History`, `ByHand`, `InPortal`, `Deferred`, `Loading`, `ErrorState`; `ChoicePrompt` (4), `RadioGroup` (3) | ✓ kein Fehler, kein Querscroll; ChoicePrompt und RadioGroup unverändert (Legende „Antwort", Frage sichtbar, keine Zeilenform) |

### Mängel

**M1 — nicht blockierend.** In den Evidenz-Tabellen ist nur die erste Zelle ein
Ziel. Die Spec sagt „Ein Klick auf eine **Zeile** ruft `onSelect`", und §9
verlangt eine ganz klickbare Listenzeile (I11). Gemessen: Ein Klick auf
„Hotel am Markt GmbH & Co. KG" (Aussteller-Zelle) löst nichts aus, der Cursor
auf der Zeile ist `auto` (`ClarificationCard.tsx`, `Pick` sitzt nur auf der
Schlüsselzelle). Auflage: Die ganze Zeile löst aus (Overlay wie
`.v2rowlink`), mit einem Fokus-Halt je Zeile.

**M2 — nicht blockierend.** Die Wortliste der Adressaten gibt es jetzt dreimal
im Set: `AUDIENCE_WORD` in `ClarificationThread.tsx:17`, dazu
`Clarification.tsx:35` und `ClarificationCard.tsx:58` (und
`src/ludwig/.../case.ts:163`). Das ist eine zweite Quelle. Auflage: eine
exportierte Liste nutzen oder als benannte Ausnahme führen.

**M3 — nicht blockierend (Sprache).** Die Meta-Zeile sagt dasselbe zweimal:
„Gefragt ist: Kanzlei · **gefragt von Ludwig** · **Rückfrage von Ludwig** ·
Buchungsvorschlag · 26.08.2026, 09:12". Eine der beiden Angaben soll
entfallen.

**M4 — nicht blockierend (setweit).** Auswege „Anderweitig geklärt" 119 × 19,
„Zurückstellen" 83 × 19, „Zurückstellung aufheben" 152 × 19 px; Sachverhalt-Link
15 px hoch. Die TextButtons stehen allein in ihrer Zeile, die Ausnahme „inline"
greift nicht. Das gehört zum offenen Punkt TextButton/Link des Sets (0211 M3).

**M5 — nicht blockierend.** `RadioGroup variant="rows"` und die neuen
`ChoicePrompt`-Props (`optionsLabel`, `optionStyle`, `hideQuestion`) haben keine
eigene Story; sie sind nur in der Karte zu sehen. Die Stories heißen außerdem
`AtCaseFreeText`/`DeferredWithUndo`, die Spec nennt `AtCase`, `Deferred`,
`FreeTextOnly`. Auflage: je eine Story an RadioGroup und ChoicePrompt; die
Story-Liste der Spec nachziehen.

**Hinweis.** Eine zurückgestellte Frage zeigt zugleich „Zurückstellen" und
„Zurückstellung aufheben" (`DeferredWithUndo`). Für die Leserin ist das
widersprüchlich; hier gehört „Neu zurückstellen" hin oder der Ausweg entfällt.

Vier Linsen: **Sprache** — Auswege als Frage und Handlung, „Antwortoptionen",
„Oder selbst formulieren", keine Versalien und kein Ausrufezeichen ✓; M3.
**Bedienung** — Radio per Pfeiltasten, Fokusring sichtbar, `onSelect` ohne
Navigation, Aufklapper per Enter ✓; M1, M4. **Logik** — Empfehlung vor
Grundlage, genannte Einträge zuerst, die App ordnet (E2); der Faden ist
chronologisch und zeigt die aktuelle Frage einmal ✓. **Darstellung** — Beträge
rechts mit `AmountCell`, Stand als `StatusBadge`, Markierung durch Rand
**und** Gewicht ✓.

### Urteil

**Abgenommen mit Auflagen**: M1, M2, M3, M5; M4 bleibt beim setweiten Auftrag.


## Nachbesserung 2026-09-29 (nach der fremden Abnahme)

| Mangel | Behoben |
|---|---|
| M1 | Die ganze Evidenz-Zeile ruft `onSelect` (bzw. folgt `href`): der Schlüssel trägt `v2rowlink`, dessen Overlay die Zeile deckt |
| M2 | Eine Wortliste der Adressaten: `AUDIENCE_LABEL` aus `Clarification.tsx`, von Karte und Faden importiert |
| M3 | „gefragt von …" nur, wenn `raisedBy` gesetzt ist — sonst sagt das Herkunftswort „von Ludwig" schon |
| M5 | Story `RadioGroup/Rows`; die gebauten Karten-Stories heißen `InBatchReview`, `AtCaseFreeText`, `DeferredWithUndo` |
| Hinweis | Eine zurückgestellte Frage mit `onUndefer` bietet nicht zugleich „Zurückstellen" an |
| M4 | offen, setweit — Backlog 0213 |

## Nachprüfung 2026-09-29 (Stand 184f2e7)

Abnehmer: Claude (fremde Sitzung). Storybook 6107 bei 1280 × 900 mit
Playwright.

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M1 ganze Zeile ruft `onSelect`, jede ihren Eintrag | `InBatchReview`, alle Aufklapper offen; Klick in die zweite und in die letzte Zelle jeder Zeile | ✓ 7 von 7 Zeilen, je beide Zellen: doc-4471, doc-4470, account 4670, account 4650, payment bt-1, entry je-1, entry je-2 — jede Zeile ihr eigener Eintrag; Hover färbt die Zeile (`--color-bg-soft`), Cursor `pointer` |
| M1 „Weitere Quellen" überdeckt die Karte nicht | `InBatchReview` | ✓ ein Klick rechts neben dem Eintrag löst nichts aus; ein Klick auf den Eintrag löst `other:cl-7` aus. Trefferprobe (`elementFromPoint`) in der Mitte von Antwortfeld, Optionszeile, Hauptknopf, Ausweg, Sachverhalt-Link und Aufklapper trifft jeweils das Element selbst |
| Tastatur und Fokus an den Pick-Knöpfen | `InBatchReview` | ✓ ein Fokus-Halt je Zeile (Tab: 21.08.2026 → 14.08.2026); `:focus-visible` mit 2 px `--color-focus` am Knopf (72 × 37 px), sichtbar über dem Overlay (Bildschirmfoto); Enter löst `document:doc-4471` aus |
| M2 eine Wortliste der Adressaten | `grep` | ✓ nur noch `AUDIENCE_LABEL` in `Clarification.tsx:37`, exportiert; Karte und Faden importieren sie |
| M3 Ludwig nicht doppelt | `InBatchReview` (`raisedBy: null`) | ✓ „Gefragt ist: Kanzlei · Rückfrage von Ludwig · Buchungsvorschlag · 26.08.2026, 09:12" |
| M3, Gegenprobe | `People` (`raisedBy: { kind: "agent" }`) | ✗ weiter „Gefragt ist: Kanzlei · **gefragt von Ludwig** · **Rückfrage von Ludwig** · …" → M6 |
| Hinweis: kein „Zurückstellen" bei zurückgestellter Frage mit `onUndefer` | `DeferredWithUndo` | ✓ Auswege nur „Anderweitig geklärt" und „Zurückstellung aufheben"; in `Deferred` ohne `onUndefer` bleibt „Zurückstellen" (so gewollt) |
| M5 Story `RadioGroup/Rows` | `v3/Primitives/Formular/RadioGroup/Rows` | ✓ drei Zeilen je 560 × 41 px, Legende „Antwortoptionen", Pfeil runter wählt die nächste, Fokusring 2 px |

**M6 — nicht blockierend (Rest von M3).** Die Bedingung in
`ClarificationCard.tsx` fragt nur `c.raisedBy ? …`. Ist `raisedBy` Ludwig selbst
(`kind: "agent"`), steht Ludwig weiter doppelt da (Story `People`). Auflage: Die
Angabe entfällt auch, wenn der Fragende der Agent ist und das Herkunftswort ihn
schon nennt.

Offen bleibt aus der Abnahme M4 (setweit, Trefferflächen der Auswege). Von M5
ist die ChoicePrompt-Story und die Story-Liste der Spec nicht Teil dieser
Nachbesserung.

### Urteil (neu)

**Abgenommen mit Auflagen**: M6 (Rest von M3); M4 setweit; M5 zur Hälfte
(ChoicePrompt-Story, Story-Namen in der Spec).


**Nachbesserung 2 (M5, M6):** Story `ChoicePrompt/OptionRows`, Story-Liste der Spec nachgezogen; „gefragt von" auch nicht, wenn `raisedBy` Ludwig selbst ist (`kind: "agent"`).

## Nachprüfung 2 2026-09-29 (Stand 004d2d3)

Abnehmer: Claude (fremde Sitzung). Storybook 6107 bei 1280 × 900.

| Mangel | Nachweis | Ergebnis |
|---|---|---|
| M5 Story `ChoicePrompt/OptionRows` | `v3/Patterns/Prüfen/ChoicePrompt/OptionRows` | ✓ Legende „Antwortoptionen", Frage ausgeblendet (`hideQuestion`), zwei Zeilen je 41 px, „Reisekosten (4670)" vorgewählt, „Oder selbst formulieren", Knopf „Antwort speichern" |
| M5 Story-Liste der Spec | Abschnitt „Stories" | ✓ nennt `InBatchReview`, `AtCaseFreeText`, `DeferredWithUndo`, `Thread`, `Single`, `RadioGroup/Rows`, `ChoicePrompt/OptionRows` — wie gebaut |
| M6 Ludwig nicht doppelt bei `raisedBy.kind: "agent"` | `People`, `InBatchReview` | ✓ je „Gefragt ist: Kanzlei · Rückfrage von Ludwig · Buchungsvorschlag · 26.08.2026, 09:12" |

### Urteil (neu)

**Abgenommen mit Auflage** M4 (Trefferflächen der Auswege, setweit).
