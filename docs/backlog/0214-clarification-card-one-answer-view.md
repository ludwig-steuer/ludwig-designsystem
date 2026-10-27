# 0214 · ClarificationCard — die eine Antwort-Ansicht für Klärungsfragen

| | |
|---|---|
| Status | fertig (abgenommen 2026-09-29, Nachprüfung 3) · Nachtrag 2026-10-01 (Zahlungen: Verwendungszweck) abgenommen 2026-10-01 (fremde Abnahme, ohne Mangel) · Nachtrag 2026-10-24 (empfohlene Antwortoption) abgenommen 2026-10-24 (fremde Abnahme, mit Hinweis; Hinweise 1–3 erledigt) |
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
   Gegenpartei · Verwendungszweck · Zahlungskonto (Nachtrag 2026-10-01) —
   Buchungen: Datum · Soll · Haben · Betrag
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
| `evidence` | `{ documents?, accounts?, payments?, entries?, other? }` — Zeilen mit `id`, `cited?`, und je Art: Beleg `{ date, issuer, number, amount, currency }`, Konto `{ number, name }`, Zahlung `{ date, amount, currency, counterparty, purpose, paymentAccount }` (Nachtrag 2026-10-01), Buchung `{ date, debit, credit, amount, currency, taxKey?, state? }`, weitere `ClarificationSource` |
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

## Nachprüfung 3 2026-09-29

Abnehmer: Claude (fremde Sitzung). Stand 72a10d3. Storybook 6107 bei
1280 × 900 mit Playwright, neu gemessen. Geprüft: „Nachbesserung 2 (M5, M6)".

| Punkt | Nachweis | Ergebnis |
|---|---|---|
| Story `ChoicePrompt/OptionRows` | Storybook-Index | ✓ `v3-patterns-prüfen-choiceprompt--option-rows` vorhanden |
| Story-Liste der Spec = gebaute Stories | Abschnitt „Stories"; Storybook-Index | `ClarificationCard`: `InBatchReview`, `AtCaseFreeText`, `DeferredWithUndo` + bestehende ✓. `RadioGroup/Rows` ✓. `ChoicePrompt/OptionRows` ✓. `ClarificationThread`: Spec nennt `Thread` · `Single` — der Index zeigt zusätzlich eine dritte Story „ITEMS" (`v3-entitäten-klärung-clarificationthread--items`). Das ist kein echter Zustand, sondern der modulweite Export `export const ITEMS: ThreadItem[]` in `ClarificationThread.stories.tsx:17`, den CSF als Story einliest, weil er groß geschrieben ist. Vorbestehend, nicht Teil von M5/M6, nicht blockierend — aber die Story-Liste der Spec und der tatsächliche Index stimmen an dieser Stelle nicht überein |
| M6: kein doppeltes „Ludwig" bei `raisedBy.kind === "agent"` | `ClarificationCard/People` (`raisedBy: { kind: "agent", id: null, label: null }`) | ✓ Meta-Zeile: „Gefragt ist: Kanzlei · Rückfrage von Ludwig · Buchungsvorschlag · 26.08.2026, 09:12" — genau ein „Ludwig" in der Meta-Zeile; die zwei weiteren Erwähnungen im Seitentext stammen aus dem Antwortverlauf, nicht aus der Meta-Zeile |
| `pnpm typecheck` · `check:language` · `check:when` · `check:type` | CLI | ✓ alle vier Exit 0 |

**Hinweis (neu, nicht blockierend).** Die „ITEMS"-Story von
`ClarificationThread` ist ein Werkzeug-Artefakt (CSF liest jeden groß
geschriebenen Export als Story), keine echte Zustandsstory. Auflage bei
Gelegenheit: `ITEMS` klein schreiben oder aus der gemeinsamen Fixture-Datei
auslagern, damit der Storybook-Index der Spec-Story-Liste wieder entspricht.

### Urteil

**Abgenommen.** M5 und M6 sind, wie in der „Nachbesserung 2" behauptet,
gebaut und wirksam. M4 bleibt offen (setweit, Backlog 0213, unverändert aus
der vorigen Nachprüfung).

**Nachtrag 2026-09-29 (Stand a3c41bc):** Der Hinweis oben ist erledigt — die
Fixture `ITEMS` liegt jetzt in `clarification/thread-fixtures.ts`, die
Story-„ITEMS" ist aus dem Storybook-Index verschwunden, und
`ClarificationCard/InBatchReview` zeigt den Verlauf weiter unverändert
(„Verlauf" mit Anzahl 5, aus derselben Fixture importiert).

## Nachtrag 2026-10-01 — Zahlungen: Verwendungszweck als eigene Spalte

Auftrag llcto 2026-10-01 (Owner-Wunsch: der Überweisungsbetreff als eigene
Spalte — FTC, Gehaltszahlungen mit „Lohn – Aktueller Monat …"). Die App füllte
`text` bisher mit „Gegenpartei · Zweck" in einem String
(`case-detail-ds-mapping.ts`, mit `ponytail:` markiert).

- **`EvidencePayment.text` → `counterparty`**, neu **`purpose: string | null`**.
  Umbenannt statt weitergeführt: ein Feld namens `text`, das nur noch die
  Gegenpartei trägt, wäre ein zweites Wort für dieselbe Sache. Die App stellt
  die eine Zeile im Mapping ohnehin um (`counterparty: p.counterpartyName`,
  `purpose: p.purpose`).
- **Spalten:** Datum 88 · Betrag 112 · Gegenpartei `minmax(0, 1fr)` ·
  Verwendungszweck `minmax(0, 1.4fr)` · Zahlungskonto `minmax(0, 0.8fr)` —
  der Zweck ist der längste Text und bekommt den meisten Platz.
- **Zelle Verwendungszweck = `BankTransactionPurpose` (inline)**, wie in der
  Bankliste (`bank-transaction-columns.tsx`): SEPA-Kürzel (`EREF+`, `SVWZ+` …)
  werden lesbar, die Referenzen stehen hinter dem (i), `null` wird „—".
  Gleiches sieht gleich aus. Ohne `sepaTags` zerlegt die Zelle den Rohwert
  selbst (der Weg für Altzeilen) — ein Feld für die Tags kommt, wenn die App
  sie im Kontext hat.
- **Zahlungskonto** trägt jetzt `title` wie die übrigen gekürzten Zellen.
- Story `InBatchReview`: zwei Zahlungen — eine mit SEPA-Kürzeln, eine
  Gehaltszahlung mit langem Namen und dem Betreff „Lohn – Aktueller Monat …".

Gemessen (Storybook `--in-batch-review`, Karte 744 px, Playwright): Kopf und
Zeilen stehen auf denselben x-Positionen (42 · 140 · 262 · 418 · 633), keine
Zelle ragt über ihre Spur, lange Werte enden in der Ellipse, das (i) steht in
der Zeile, beide Zeilen gleich hoch (Zelle 24 px, Unterschied 1 px ist die
Trennlinie).

Status: **Abnahme** (Nachtrag). Kriterien für die fremde Abnahme:

- [x] Kopf „Gegenpartei" und „Verwendungszweck" als zwei Spalten, „Gegenpartei / Zweck" kommt nicht mehr vor (`grep`)
- [x] `EvidencePayment` führt `counterparty` und `purpose`, kein `text` (Code, Spec-Zeile Schnittstelle)
- [x] Zweck-Zelle ist `BankTransactionPurpose`: „SVWZ+…" erscheint als Freitext, EREF hinter dem (i) (`--in-batch-review`)
- [x] Spalten fluchten bei 1280 px Innenbreite, keine Zelle überläuft (`--in-batch-review`, gemessen)
- [x] `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün

### Fremde Abnahme Nachtrag 2026-10-01

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung, nicht der Bauende). Stand
9c1adbb. Gelesen: dieser Nachtrag, `ClarificationCard.tsx` (Typ
`EvidencePayment`, Tabelle „Zahlungen"), `ClarificationCard.stories.tsx`
(`EVIDENCE.payments`), `BankTransactionPurpose.tsx`. Gemessen mit Playwright
an Storybook 6107 in einem eigenen Browser-Kontext (die gemeinsame Seite
bekam fremde Eingaben, siehe 0216 „Abnahme"), Story
`v3-entitäten-klärung-clarificationcard--in-batch-review`, Aufklapper
„Zahlungen" (Anzahl 2) geöffnet, 1280 × 900; Gegenprobe bei 700, 1100, 1400
und 1920 px. Bildschirmfotos: `.playwright-mcp/0214-payments-1280.png`,
`.playwright-mcp/0214-payments-popover.png`.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Kopf „Gegenpartei" und „Verwendungszweck" als zwei Spalten, „Gegenpartei / Zweck" kommt nicht mehr vor (`grep`) | Kopf: Datum · Betrag · Gegenpartei · Verwendungszweck · Zahlungskonto (fünf `th`). `grep -rn "Gegenpartei / Zweck" src docs` → nur das Kriterium selbst (Zeile 276) | ✓ |
| `EvidencePayment` führt `counterparty` und `purpose`, kein `text` (Code, Spec-Zeile Schnittstelle) | `ClarificationCard.tsx:135–144`: `counterparty: string \| null`, `purpose: string \| null`, `paymentAccount: string \| null`, kein `text`. Schnittstelle (Zeile 50): `{ date, amount, currency, counterparty, purpose, paymentAccount }`; Aufbau Punkt 6 (Zeilen 26–27) nennt die fünf Spalten. `pnpm typecheck` Exit 0 — keine andere Stelle baut `EvidencePayment` | ✓ |
| Zweck-Zelle ist `BankTransactionPurpose`: „SVWZ+…" erscheint als Freitext, EREF hinter dem (i) (`--in-batch-review`) | Code `ClarificationCard.tsx:407` `<BankTransactionPurpose purpose={p.purpose} />` (inline, wie `bank-transaction-columns.tsx:244`). Zeile 1 zeigt „RE-2026-4471 Bewirtung 21.08.2026" (Ellipse, `title` mit dem vollen Text), kein „EREF+"/„SVWZ+" im Blick. Das (i) misst 24 × 24 px, `elementFromPoint` in seiner Mitte trifft das (i) selbst, nicht das Zeilen-Overlay; Klick öffnet „EREF RE-2026-4471 · Originalwert", und `onSelect` löst dabei **nicht** aus („Klick auf eine Zeile öffnet einen Drawer." bleibt stehen). Zeile 2 (ohne Kürzel) hat kein (i) | ✓ |
| Spalten fluchten bei 1280 px Innenbreite, keine Zelle überläuft (`--in-batch-review`, gemessen) | Kopf und beide Zeilen beginnen bei 42 · 140 · 262 · 418,3 · 633 px; jede Zelle endet 10 px vor der nächsten, die letzte bei 750. Tabelle 744 px ohne Querlauf, Seite ohne Querlauf. Ellipse bei „Katharina Oberländer-…", bei beiden Zwecken und bei „Sparkasse Muste…", je mit `title`. Alle Zellen 12,5 px. Zeilen 39 und 38 px: der eine Pixel ist die Trennlinie der ersten Zeile (`border-bottom` 1 px, letzte Zeile 0). Gegenprobe: 700 px → 42 · 140 · 262 · 389,5 · 564, Tabelle 652 px, kein Überlauf; 1100, 1400, 1920 px wie 1280 | ✓ |
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `pnpm typecheck` Exit 0; `pnpm check:type` Exit 0 („0 older hand-written values"). `pnpm build` **nicht neu gelaufen** (Weisung: parallele Sitzungen schreiben nach `storybook-static`) — vom Erbauer für 9c1adbb grün gemeldet | ✓ (build laut Erbauer) |
| Zusatz: die ganze Zeile ruft weiter `onSelect` (M1 der Abnahme vom 2026-09-29) | Klick in die Zweck-Zelle der zweiten Zeile → „Drawer öffnet: payment:bt-2" | ✓ |
| Zusatz: Konsole | keine Fehler und Warnungen | ✓ |

**Hinweis (vorbestehend, nicht blockierend).** Die Spurbreiten aller vier
Evidenz-Tabellen stehen als px im TSX (`ClarificationCard.tsx:367`, `:383`,
`:397`, `:416`, etwa `"88px 112px …"`), gegen „kein px in TSX" (`CLAUDE.md`
§2 Darstellung). Das war vor dem Nachtrag schon so (`9c1adbb^`: Zeilen 364,
394, 412) und gehört zu einem setweiten Entscheid über Spurbreiten, nicht zu
diesem Nachtrag.

Vier Linsen: **Sprache** — Kopf „Gegenpartei", „Verwendungszweck",
„Zahlungskonto"; „—" für leer; SEPA-Kürzel nicht im Blick ✓.
**Bedienung** — ganze Zeile klickbar, das (i) mit 24 × 24 px über dem
Overlay und mit eigenem Weg, kein versehentliches `onSelect` ✓. **Logik** —
ein Feld je Sache (`counterparty` statt eines `text` mit zwei Inhalten), die
Zelle aus der Bankliste wiederverwendet (Gleiches sieht gleich aus), das Feld
für die Tags vertagt und benannt ✓. **Darstellung** — der Kopf fluchtet mit
den Zeilen, Betrag rechts, der Zweck hat den meisten Platz (`1.4fr`),
Ellipse statt Umbruch, beide Zeilen gleich hoch ✓.

### Urteil

**Abgenommen.** Alle fünf Kriterien des Nachtrags sind erfüllt; kein Mangel
am Nachtrag.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-10-01.

## Nachtrag 2026-10-24 — die empfohlene Antwortoption

Auftrag llcto 2026-10-24 (Owner-Entscheid vom selben Tag): Bei
Antwortvorschlägen ist **genau eine** Option als empfohlen markierbar. Die
Karte hebt sie leicht hervor und wählt sie vor; „empfohlen" steht nicht mehr
im Optionstext. Die Form der Hervorhebung entscheidet das Design-System.

Daten der App (staging 769c43e6b, `CaseClarificationEntry`):
`recommendedOption: string | null` ist wörtlich eine der `answerOptions`,
höchstens eine (der Server lehnt alles andere ab). `recommendation` trägt bei
gesetzter Option nur noch das Warum, einen Satz; bei Freitextfragen bleibt sie
die ganze Empfehlung.

**Schnittstelle**

| Feld / Prop | Typ | Bedeutung |
|---|---|---|
| `ClarificationDetailVM.recommendedOption` | `string \| null` (optional) | die empfohlene Option, wörtlich eine der `answerOptions` |
| `ClarificationDetailVM.recommendation` | `string \| null` (optional, wie bisher) | mit `recommendedOption`: nur das Warum; ohne: die ganze Empfehlung, benennt sie eine Option wörtlich, wird sie zur Vorauswahl (Altbestand und Übergang) |
| `ChoiceOption.recommended` | `boolean` (optional) | die Option trägt das Wort „empfohlen" und ist vorgewählt, wenn `defaultOptionId` fehlt |
| `RadioOption.recommended` | `boolean` (optional) | das Wort „empfohlen" hinter der Beschriftung |

**Form der Hervorhebung.** Das Wort **„empfohlen"** in der Zeile der Option,
hinter ihrer Beschriftung, klein und grau (`--color-text-muted`, Gewicht 400,
auch wenn die Zeile gewählt und fett ist). Kein eigener Rahmen, keine eigene
Farbe: Farbe kodiert Kritikalität, und eine Empfehlung ist keine. Die
Vorauswahl gibt der Zeile beim Öffnen ohnehin den Gewählt-Zustand (Rahmen
Akzent, Grund `accent-50`) — das ist die Hervorhebung auf den ersten Blick;
das Wort hält sie, wenn jemand eine andere Option wählt. Es steht im `<label>`
und wird mit vorgelesen („Reisekosten (4670) empfohlen").

**Callout.**

- Mit `recommendedOption`, die Option steht als Zeile da (Antwortmodus):
  „**Warum empfohlen:** {recommendation}" — dasselbe Wort wie in der Zeile,
  die Option wird nicht wiederholt. Ohne `recommendation` kein Callout; das
  Wort in der Zeile genügt.
- Mit `recommendedOption`, aber keine Zeile sichtbar (Lesemodus, beantwortet,
  Notiz): „**Empfehlung: {recommendedOption}** · {recommendation}" — sonst
  stünde ein Warum ohne Was da.
- Ohne `recommendedOption`: wie bisher „**Empfehlung:** {recommendation}",
  Vorauswahl über den wörtlichen Treffer. Kein Wort „empfohlen" in der Zeile
  — der Übergang und der Altbestand sehen aus wie heute.

**Stories.** `WithRecommendedOption` (Antwortmodus: Option vorgewählt mit
„empfohlen", Callout nur das Warum) · `RecommendedOptionRead` (Lesemodus:
Callout nennt die Option) · `WithRecommendation` bleibt als Altbestand.
`RadioGroup/Rows` und `ChoicePrompt/OptionRows` zeigen eine empfohlene
Option.

**Gebaut 2026-10-24.** `ClarificationCard.tsx` (Feld, Vorauswahl,
Callout in drei Fällen), `ChoicePrompt.tsx` (`recommended` durchgereicht,
Vorauswahl ohne `defaultOptionId`), `RadioGroup.tsx` (Wort im `<label>`, mit
Leerzeichen davor — ohne war der zugängliche Name „…(4670)empfohlen", im
Browser gefunden), `.v2radioline__rec` in `v3.css`. Spec-Zeilen nachgezogen
in 0017, 0028, 0060. Gemessen (statischer Build, Playwright, 1280 × 900):
`--with-recommended-option` — „Reisekosten (4670) empfohlen" gewählt, Callout
„Warum empfohlen: Die Übernachtung …", kein „Empfehlung:" in der Karte; nach
Klick auf „Bewirtung (4650)" trägt die empfohlene Zeile das Wort weiter, Gewicht
400 in gewählter wie ungewählter Zeile, Kontrast 6,19:1 auf `accent-50` und
6,69:1 auf Weiß, beide Zeilen 41 px wie vorher, kein Querlauf.
`--recommended-option-read` — Callout „Empfehlung: Reisekosten (4670) · Die
Übernachtung …", keine Zeile. `--with-recommendation` — unverändert
„Empfehlung: Reisekosten (4670)", vorgewählt, kein Wort. `ChoicePrompt
--option-rows` vorgewählt ohne `defaultOptionId`. Bild:
`.playwright-mcp/0214-recommended-other-picked.png`.

Status: **fertig** (abgenommen 2026-10-24). Kriterien für die fremde Abnahme:

- [x] `recommendedOption` gesetzt, Antwortmodus: die Option ist gewählt, ihre Zeile trägt „empfohlen", der Callout lautet „Warum empfohlen: …" und nennt die Option nicht (`--with-recommended-option`)
- [x] Nach Wahl einer anderen Option bleibt „empfohlen" an der empfohlenen Zeile; das Wort bleibt Gewicht 400 auch in der gewählten Zeile (gemessen)
- [x] Lesemodus mit `recommendedOption`: Callout „Empfehlung: {Option} · {Warum}" (`--recommended-option-read`)
- [x] Ohne `recommendedOption` unverändert: Vorauswahl über wörtlichen Treffer, Callout „Empfehlung: …", kein „empfohlen" in der Zeile (`--with-recommendation`)
- [x] Kontrast des Worts ≥ 4,5:1 auf weißer und auf gewählter Zeile (gemessen); der zugängliche Name der Option enthält „empfohlen"
- [x] `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün

### Fremde Abnahme Nachtrag 2026-10-24

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung, nicht der Bauende). Stand
da52e52, Arbeitsbaum sauber. Gelesen: `CLAUDE.md`, dieser Nachtrag, der ganze
Bau (`git show da52e52`) — `ClarificationCard.tsx` (Feld `recommendedOption`,
`recommendedId` · `preselected` · `markedInRow`, Callout in drei Zweigen),
`ChoicePrompt.tsx`, `RadioGroup.tsx`, `.v2radioline__rec` in `v3.css`, die drei
Story-Dateien und die nachgezogenen Zeilen in 0017, 0028, 0060. Gemessen mit
Playwright am statischen Build auf 6199 in einem eigenen Browser-Kontext,
1280 × 900, Farben aus `getComputedStyle`, Kontrast nach WCAG gerechnet.
Gegenprobe „unverändert ohne Option": `ClarificationCard`, `ChoicePrompt` und
`RadioGroup` aus `da52e52^` und aus `da52e52` mit denselben Daten serverseitig
gerendert (`renderToStaticMarkup`, esbuild-Bündel außerhalb des Repos) und das
HTML verglichen. Bildschirmfotos: `.playwright-mcp/0214-abnahme-initial.png`,
`0214-abnahme-other-picked.png`, `0214-abnahme-keyboard.png`,
`0214-abnahme-read.png`.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `recommendedOption` gesetzt, Antwortmodus: die Option ist gewählt, ihre Zeile trägt „empfohlen", der Callout lautet „Warum empfohlen: …" und nennt die Option nicht (`--with-recommended-option`) | Radio „Reisekosten (4670)" `checked`, Zeilentext „Reisekosten (4670) empfohlen", Rahmen `rgb(59, 143, 196)` (Akzent), Grund `rgb(241, 247, 251)` (`accent-50`). Einziger Callout (`v2note--soft`): „Warum empfohlen: Die Übernachtung macht 172,00 € der 240,40 € aus, und bei gemischten Belegen zählt der überwiegende Anteil." — `strong` nur „Warum empfohlen:", „Empfehlung:" kommt in der Karte nicht vor, die Option steht nicht im Callout. Code `ClarificationCard.tsx:593` (`markedInRow = canAnswer && recommendedId !== null`), `:675–680`; Vorauswahl `:579–580` → `defaultOptionId={preselected}` `:738` | ✓ |
| Nach Wahl einer anderen Option bleibt „empfohlen" an der empfohlenen Zeile; das Wort bleibt Gewicht 400 auch in der gewählten Zeile (gemessen) | Vorher: Zeile „Reisekosten" gewählt, Zeilengewicht 600, Wort 400. Klick auf „Bewirtung (4650)": diese Zeile `checked`, 600, `accent-50`; „empfohlen" bleibt an „Reisekosten (4670)" (jetzt ungewählt, Grund Weiß), Wort 400. Wort 12,5 px (`--fs-ui-sm`), Abstand 4 px (`--space-1`). Gegenprobe Tastatur: Pfeil hoch auf dem gewählten Radio wählt „Bewirtung", Fokusring 2 px `--color-focus` an der Zeile; Klick auf das Wort selbst wählt die empfohlene Zeile wieder (es liegt im `<label>`). Beide Zeilen 40,92 px vorher und nachher | ✓ |
| Lesemodus mit `recommendedOption`: Callout „Empfehlung: {Option} · {Warum}" (`--recommended-option-read`) | Callout „Empfehlung: Reisekosten (4670) · Die Übernachtung macht …", `strong` „Empfehlung: Reisekosten (4670)", keine Antwortzeile, kein „empfohlen" in der Karte. Code `:681–686`. Serverseitig zusätzlich: beantwortet (`state: "answered"`), Altfall `document_upload` und `mode="answer"` ohne `onAnswer` nennen die Option ebenso; ohne `recommendation` steht „Empfehlung: Reisekosten (4670)" allein | ✓ |
| Ohne `recommendedOption` unverändert: Vorauswahl über wörtlichen Treffer, Callout „Empfehlung: …", kein „empfohlen" in der Zeile (`--with-recommendation`) | Story: „Reisekosten (4670)" `checked` über den wörtlichen Treffer, Callout „Empfehlung: Reisekosten (4670)" (`strong` nur „Empfehlung:"), kein `.v2radioline__rec`, das Wort kommt in der Story nicht vor; Zeilen 40,92 px. `--in-batch-review` und `--filled` ebenso ohne das Wort. Gegenprobe gegen `da52e52^`: acht Kartenfälle (Antwort mit wörtlichem Treffer, ohne Treffer, ohne Empfehlung, `recommendedOption: null`, Lesen, Freitext, `document_upload`, Kommentar), `ChoicePrompt` mit und ohne `defaultOptionId`, `RadioGroup` `rows` — HTML Zeichen für Zeichen gleich. CSS: nur eine neue Klasse | ✓ |
| Kontrast des Worts ≥ 4,5:1 auf weißer und auf gewählter Zeile (gemessen); der zugängliche Name der Option enthält „empfohlen" | Wort `rgb(92, 92, 92)` = `#5C5C5C` (`--color-text-muted`): 6,69:1 auf Weiß (ungewählt), 6,19:1 auf `#F1F7FB` (gewählt), 6,17:1 auf `#F4F6F8` (Hover der ungewählten Zeile). ARIA-Snapshot: `radio "Reisekosten (4670) empfohlen" [checked]`, `radio "Bewirtung (4650)"`; derselbe Name in `RadioGroup--rows` und `ChoicePrompt--option-rows` | ✓ |
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `pnpm typecheck` Exit 0; `pnpm check:type` Exit 0 („ok. 0 older findings left"); `pnpm build -o` in ein Verzeichnis außerhalb des Repos Exit 0 („Storybook build completed successfully", nur die bekannte Chunk-Größen-Warnung), der Index führt `--with-recommended-option` und `--recommended-option-read` | ✓ |
| Zusatz: `ChoicePrompt` wählt ohne `defaultOptionId` vor (`ChoicePrompt--option-rows`) | „Reisekosten (4670) empfohlen" `checked`, der Satz „Wählen Sie eine Antwort …" fehlt; die Story setzt kein `defaultOptionId` mehr (`ChoicePrompt.tsx:71–73`) | ✓ |
| Zusatz: Spec-Zeilen 0017, 0028, 0060, 0214 gegen Code | Typen Zeichen für Zeichen: 0017 `{ value, label, hint?, disabled?, recommended? }` = `RadioOption` (`RadioGroup.tsx:15–27`); 0028 `{ id, label, hint?, recommended? }` = `ChoiceOption` (`ChoicePrompt.tsx:18–25`); 0060 `recommendedOption` · `string \| null` · nein = `recommendedOption?: string \| null` (`ClarificationCard.tsx:188`); die vier Zeilen der Schnittstelle oben stimmen. Story-Spalten und ein Satz in 0060 unvollständig → Hinweise 2 und 3 | ✓ (mit Hinweis) |
| Zusatz: kein Deutsch in Bezeichnern und Kommentaren | Bezeichner `recommendedOption`, `recommended`, `recommendedId`, `preselected`, `markedInRow`, `RECOMMENDED`, `WithRecommendedOption`, `RecommendedOptionRead`, Klasse `v2radioline__rec` (einmal im Repo); Kommentare englisch, Deutsch nur als zitiertes UI-Wort („empfohlen") und in Nutzer-Strings (`CardHead`-Titel, Fixture-Texte) | ✓ |
| Zusatz: Konsole, Querlauf, Trefferfläche | keine Fehler und Warnungen in den gemessenen Stories; Seite bei 1280 px ohne Querlauf, bei 640 px (≈ 200 % Zoom) ebenso, Zeilen weiter 41 px; Zeile 1214 × 40,9 px, ganze Zeile Ziel, Hover `--color-bg-soft` | ✓ |

### Hinweise (nicht blockierend)

1. **Teilfall ohne Story.** `recommendedOption` ohne `recommendation` — im
   Antwortmodus kein Callout, nur das Wort (Nachtrag, Abschnitt „Callout",
   erster Punkt); im Lesemodus „Empfehlung: Reisekosten (4670)" allein. Der
   Code tut beides richtig (serverseitig geprüft), keine Story zeigt es.
   Vorschlag: in `ClarificationCard.stories.tsx` eine Story
   `RecommendedOptionWithoutReason` (oder eine zweite Karte in
   `WithRecommendedOption`) mit `recommendation: null`.
2. **Story-Spalten der Spec.** 0017 Zeile `options` nennt nur `Filled`, das
   Wort zeigt aber allein `Rows`; 0028 Zeile `options` nennt nur `Filled`,
   das Wort zeigt allein `OptionRows`. Vorschlag: „`Filled`, `Rows`" bzw.
   „`Filled`, `OptionRows`". In 0060 verweist die neue Zeile auf
   `WithRecommendedOption`, die Stories-Tabelle (§ Stories, „Neun Stories")
   führt sie nicht — die Tabelle steht ohnehin noch auf den deutschen
   Altnamen (`MitEmpfehlung` ist heute `WithRecommendation`, vorbestehend).
   Vorschlag: beim nächsten Anfassen die Tabelle auf die heutigen
   Exportnamen ziehen und `WithRecommendedOption`, `RecommendedOptionRead`
   aufnehmen.
3. **Ein Satz in 0060 zu knapp.** Abschnitt Verhalten, „Empfehlung →
   Vorauswahl": „(Markierung in der Zeile, Callout nur das Warum)" gilt nur
   beim Antworten; im Lesen nennt der Callout die Option. Vorschlag:
   „(beim Antworten Markierung in der Zeile und Callout nur das Warum; im
   Lesen nennt der Callout die Option vor dem Warum)".
4. **Zur Beobachtung, kein Mangel.** Der Callout „Warum empfohlen: …" steht
   vor Grundlage und Quellen, die markierte Zeile darunter — in
   `--with-recommended-option` 454 px auseinander (Callout-Oberkante 273,
   Zeile 727), bei 900 px Höhe beide im ersten Bild. In der Stapelprüfung mit
   vier Evidenz-Gruppen wächst der Abstand, und das Warum steht eine Weile
   ohne sein Was. Das ist so entschieden (Reihenfolge Owner 2026-09-29, „die
   Option wird nicht wiederholt"); ansehen, sobald die App die Karte mit
   echter Evidenz zeigt.

Vorbestehend, nicht aus diesem Nachtrag: `ChoicePrompt.stories.tsx:23–26`
trägt einen deutschen JSDoc-Kommentar zur Story `Filled` (seit 64fbe27),
gegen „Nie Deutsch im Quellcode" (Owner 2026-09-10).

Vier Linsen: **Sprache** — ein Wort für die Sache, „empfohlen" in der Zeile
und „Warum empfohlen:" im Callout, im Lesen „Empfehlung: {Option}"; klein
geschrieben, kein Ausrufezeichen, keine interne Benennung ✓. **Bedienung** —
das Wort liegt im `<label>` und wird mit vorgelesen, Klick darauf wählt die
Zeile, Pfeiltasten und Fokusring wie vorher, Kontrast ≥ 6,17:1 in allen drei
Zeilenzuständen ✓. **Logik** — die Empfehlung kommt aus einem Feld, die
Vorauswahl wird abgeleitet; eine Option, die nicht unter den
`answerOptions` steht, wird nicht markiert, der Callout nennt sie dann wie
im Lesen; ohne das Feld ist das HTML gegenüber `da52e52^` gleich ✓.
**Darstellung** — „leicht" gehalten: grau, 12,5 px, Gewicht 400, kein Rahmen,
keine Farbe, kein Icon; die Hervorhebung auf den ersten Blick leistet die
Vorauswahl, das Wort hält sie, und der Vier-Wochen-Test besteht ohne Farbe —
„empfohlen" ist lesbar, wo die Zeile steht ✓.

### Urteil

**Abgenommen mit Hinweis.** Alle sechs Kriterien des Nachtrags sind erfüllt,
gemessen und im Code nachgelesen; der Fall ohne `recommendedOption` rendert
Zeichen für Zeichen wie vorher. Hinweise 1–3 betreffen Story-Deckung und
Spec-Text, Hinweis 4 ist eine Beobachtung — keiner blockiert.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-10-24.

**Nach der Abnahme (2026-10-24, Bauender).** Hinweis 1: Story
`RecommendedOptionWithoutReason` (Antworten und Lesen untereinander). Hinweis
2: Story-Spalten in 0017 (`Filled`, `Rows`) und 0028 (`Filled`,
`OptionRows`); die Stories-Tabelle in 0060 auf die heutigen Exportnamen und um
die drei neuen Stories ergänzt. Hinweis 3: Satz in 0060 wie vorgeschlagen.
Hinweis 4 bleibt Beobachtung für die App mit echter Evidenz. Der deutsche
JSDoc in `ChoicePrompt.stories.tsx` (Story `Filled`) ist übersetzt.

## Nachtrag 2026-10-27 — Form der Empfehlung geändert

Owner 2026-10-27 über ll-abnahme: „Für die Empfehlung in der Auswahl brauchen
wir eine neue farbliche Markierung.“ Die Form aus dem Nachtrag vom 2026-10-24
(„klein und grau … keine eigene Farbe“) gilt nicht mehr. „empfohlen“ steht jetzt
als `info`-Badge an der Option. Die Einordnung als Hinweis (Stufe 3) ist ein
Entscheid des Design-Systems, von llcto für den Owner angenommen. Ein neues Token
gibt es dafür nicht. Callout, Vorauswahl und
Lesemodus bleiben, wie sie sind. Spec 0229, vermerkt in
`design-guidelines.md` §3.
