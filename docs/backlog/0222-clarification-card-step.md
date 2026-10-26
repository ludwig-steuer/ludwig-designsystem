# 0222 · ClarificationCard `variant="step"` — die schlanke Rückfrage mit Kontext

| | |
|---|---|
| Status | Abnahme (Nachprüfung) · vorher: in Arbeit — nicht abgenommen 2026-10-24 (fremde Abnahme, Stand `51db640`; Mängel 1–5) · Hashes: `51db640` (Bau) und `b2b84e5` (Nachbesserung) waren lokal und sind vor dem Push in `c848b6d` zusammengefasst (Stories mit fiktiven Daten); `51db640^` = `d3e91ff` |
| Stufe | erweitert `entities/clarification/ClarificationCard.tsx` · `patterns/ChoicePrompt` (Freitext hinter einem Textknopf, Zeile weiterer Wege) |
| Klassen-Test | Karte: nein (Klärung). ChoicePrompt-Zeile: ja (jede Frage mit Antwortvorschlägen kennt „selbst schreiben" und Auswege) |
| Quelle | Auftrag llcto 2026-10-24 (Owner), Paket 2 · Wireframe `ludwig/app/reports/2026-10-24_abnahme-wizard-wireframe.html` (Schritt Rückfragen, echte Fragen eines Stapels; in Stories fiktiv) · Konzept `simple-batch-review.md` §12 „Question screen", Jobs „Rückfragen" |
| Regel (spec-schreiben §3) | 2 — erweitern: die Karte trägt den Fall zu vier Fünfteln (Frage, Kontext, Fakten, Antwort mit Empfehlung, Auswege, Quellen nach Art) |
| Ersetzt | `batch-review/ui/close/CloseQuestions.tsx` zeigt heute `ClarificationDetail` (Expertensicht, volle Karte mit Badges, Meta-Zeile, Verlauf, Quellen unter dem Text) |
| Spec von / am | designsystem (Claude), 2026-10-24 |

## Ziel

In der Abnahme beantwortet die Buchhalterin Ludwigs Fragen **eine nach der
anderen**. Sie soll ohne Suchen sehen, worum es geht, und meist mit einem
Klick antworten. Die volle Karte trägt dafür zu viel, was in diesem Ablauf
nichts sagt: Stand und Pflicht (alle Fragen hier sind offen und gefragt),
„Gefragt ist: Kanzlei · Rückfrage von Ludwig" (immer gleich), „Gefragt von
Ludwig" im Verlauf (steht in jeder Frage). Und die Quellen stehen unter dem
Text, wo sie Frage und Antwort auseinanderschieben. Die schlanke Form: Thema
klein, Frage als Überschrift, Kontext, Fakten, Antworten — und rechts daneben
ein Kasten „Kontext", aus dem jeder Eintrag seinen Drawer öffnet.

## Einordnung

- **Wiederverwenden:** `ClarificationCard` (`@when` „One clarification with
  everything it carries — read it, or answer it"). Die Antwortfläche
  (`ChoicePrompt`, Zeilen-Optionen, Vorauswahl der Empfehlung, Nachtrag
  0214 vom 2026-10-24), die Auswege (`onResolve`, `onDefer`, `onUndefer` mit
  ihren `ReasonDialog`s), `onSelect` für die Quellen und das Datenmodell
  `ClarificationEvidence` bleiben **ein** Baustein — eine zweite Fragekarte
  wäre die Verdopplung, die der Owner ausschließt.
- **Erweitert, weil:** dieselbe Frage hat zwei Formen nach Ort: auf der
  Sachverhaltsseite und in der Expertensicht die volle Karte, im Ablauf der
  Abnahme die schlanke. Eine Enum-Prop, kein Boolean-Bündel
  (`hideBadges`, `hideMeta`, `hideHistory`, `sideEvidence` wären vier, die
  nie getrennt vorkommen).
- **Zuschnitt:** eine Datei bleibt. Der Kasten „Kontext" ist eine zweite
  Darstellung desselben `ClarificationEvidence` (Liste statt Tabellen) und
  lebt als interne Funktion neben `Evidence` — er hat keinen eigenen Fall
  außerhalb der Karte und bekommt deshalb keinen Export.
- **Setzt auf:** `ChoicePrompt`, `Disclosure`, `TextButton`, `Callout`,
  `FieldList`, `Markdown`, `AmountCell`, `Time`, `DateRange`.

## Schnittstelle

### `ClarificationCard` — neu

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `variant` | `"card" \| "step"` | nein, Standard `"card"` | `step`: die schlanke Form im Ablauf (s. Aufbau) | `Step` |
| `onAskClient` | `(note: string) => Promise<void>` | nein | Weg „Beim Mandanten klären": öffnet statt der Antwort ein Notizfeld; ohne den Callback kein Weg (wie `onResolve`) | `StepAskClient` |

### `ClarificationDetailVM` — neu

| Feld | Typ | Bedeutung | Nachweis |
|---|---|---|---|
| `clientNote` | `string \| null` (optional) | die Frage ist schon für den Mandanten markiert, mit dieser Notiz — die Karte sagt es über der Antwort und füllt das Notizfeld damit vor | `StepAskClient` |

### `ClarificationEvidence` — zwei Gruppen dazu

| Feld | Typ | Wort | Nachweis |
|---|---|---|---|
| `cases` | `readonly EvidenceCase[]` — `EvidenceRow & { number: string; title: string \| null }` | „Sachverhalt" | `Step` |
| `statements` | `readonly EvidenceStatement[]` — `EvidenceRow & { paymentAccount: string; periodFrom: string \| null; periodTo: string \| null }` | „Kontoauszug" | `Step` |

`EvidenceKind` um `"case"` und `"statement"` erweitert — `onSelect` meldet
sie wie die übrigen, der Aufrufer öffnet Sachverhalts- bzw.
Zahlungskonto-Drawer. Beide Gruppen stehen auch im Block „Quellen und
Kontext" der vollen Karte (eine Tabelle je Gruppe: Nummer · Titel bzw.
Zahlungskonto · Zeitraum) — dieselben Daten sehen in derselben Karte nicht
in einer Form anders aus als in der anderen.

### `ChoicePrompt` — neu

| Prop | Typ | Bedeutung | Nachweis |
|---|---|---|---|
| `freeText.toggle` | `string` (optional) | das Freitextfeld steht hinter einem Textknopf mit diesem Wort („Eigene Antwort schreiben"); ein Klick zeigt es und setzt den Fokus hinein | `ChoicePrompt/OptionRowsWithLinks` |
| `freeText.defaultValue` | `string` (optional) | füllt das Feld vor — die schon hinterlegte Mandanten-Notiz | `StepAskClient` |
| `freeText.emptyHint` | `string` (optional) | der Satz neben dem gesperrten Knopf, solange das Feld leer ist — für ein Feld, das keine Antwort ist („Schreiben Sie eine Notiz für den Mandanten."); ohne ihn bleibt „Schreiben Sie eine Antwort." (0028) | `StepAskClient` |
| `links` | `ReactNode` (optional) | weitere Textknöpfe in derselben Zeile wie der Freitext-Knopf, unter den Optionen; Trennstrich aus CSS, jeder Knopf ≥ 24 px hoch | `ChoicePrompt/OptionRowsWithLinks` |
| `optionsNote` | `ReactNode` (optional) | eine Zeile direkt unter den Optionen — das Warum der empfohlenen (auch 0223) | `ChoicePrompt/OptionRowsWithLinks` |

Wörter: „Sachverhalt", „Belege", „Zahlungen", „Kontoauszug", „Konten",
„Buchungen", „Weitere Quellen" — dieselben wie im Block der vollen Karte.
Der Wireframe sagt „Umsätze auf dem Konto"; die Karte sagt seit 0214
(Owner-Abnahme 2026-09-29) „Zahlungen" für dieselben Bankumsätze, und ein
Kasten neben derselben Frage darf kein zweites Wort dafür haben.
**Annahme, an llcto gemeldet.**

Was die Karte **nicht** kann (bewusst): sie lädt keine Quellen, sie blättert
nicht zwischen Fragen (das ist `RecordPager` über der Karte, „Frage 1 von
12", wie in der Belegprüfung), sie speichert den Mandanten-Hinweis nicht
selbst (der Aufrufer bekommt die Notiz und entscheidet, was „markiert"
fachlich heißt), sie zeigt in `step` keinen Stand und keine Pflicht (wer
eine Frage hier sieht, weiß beides).

## Aufbau `variant="step"`

Zwei Karten nebeneinander (Nachtrag 2026-10-26): links die Frage, rechts
die Karte „Kontext" (feste Breite, oben bündig). Ohne Einträge im Kasten
eine Karte über die ganze Breite. Die Frage-Karte hat zwei Zonen: oben, was
die Frage ist (1–6 und 11), unten als Fußzone **„Ihre Antwort"** (7–10).

**Links, von oben nach unten**

1. **Thema** klein in Grau: `title` — nur wenn `question` gesetzt ist und
   anders lautet; sonst wird `title` die Überschrift.
2. **Frage** als Überschrift: `question ?? title`. Kein Badge, keine
   Meta-Zeile (Owner 2026-10-26 bestätigt). Eine optionale Frage
   (`severity: "optional"`) trägt darunter den Hinweis aus der Registry
   („Hilfreich, aber die Buchung kann auch ohne Antwort erfolgen.").
3. `caseLink`, falls übergeben (sonst steht der Sachverhalt im Kasten).
4. „Zurückgestellt bis …" wie in der Karte, falls zurückgestellt.
5. **Beim Mandanten zu klären** (Callout, weich), falls `clientNote`
   gesetzt: „**Beim Mandanten zu klären:** {Notiz}".
6. Kontext, Text (`Markdown`), **Grundlage** (Fakten) wie in der Karte.
7. **Antworten:** `ChoicePrompt` wie heute (Zeilen, Empfehlung vorgewählt
   und markiert), mit `freeText.toggle = "Eigene Antwort schreiben"`, wenn es
   Optionen gibt; ohne Optionen steht das Feld „Antwort" offen da.
8. **Empfehlung direkt unter den Optionen** (`optionsNote`) — „Warum
   empfohlen: …" bzw. „Empfehlung: …" nach den Regeln des Nachtrags 0214 vom
   2026-10-24. In der vollen Karte bleibt sie, wo sie ist; in `step` steht
   nichts zwischen der markierten Zeile und ihrem Warum (Beobachtung der
   Abnahme 0214, Hinweis 4; der Wireframe zeigt es ebenso, und die
   Belegprüfung 0223 hat dieselbe Stelle).
9. **Eine Zeile Wege** unter dem Warum (`links`):
   „Eigene Antwort schreiben" · „Beim Mandanten klären" (`onAskClient`) ·
   „Anderweitig geklärt" (`onResolve`) · „Zurückstellen" (`onDefer`; gesperrt
   mit `deferLockedReason` daneben) bzw. „Zurückstellung aufheben"
   (`onUndefer`). Jeder Weg erscheint nur mit seinem Callback. Getrennt durch
   einen senkrechten Strich aus CSS, kein Zeichen im Text.
10. Der Hauptknopf (`submitLabel`, z. B. „Speichern und weiter") unter dem
    Freitext, wie heute.
11. **Verlauf dieser Frage** nur mit Einträgen, die mehr sagen als „gefragt":
    Einträge der Art `raised` fallen in `step` weg; bleibt keiner, kein Block.
    Er steht in der oberen Zone nach der Grundlage — der bisherige Gang gehört
    zu dem, worum es geht (Nachtrag 2026-10-26).

**Rechts: „Kontext"**

Überschrift „Kontext", darunter je Gruppe ein `Disclosure` mit Anzahl, in
der Reihenfolge Sachverhalt · Belege · Zahlungen · Kontoauszug · Konten ·
Buchungen · Weitere Quellen. **Dieselbe Reihenfolge gilt seit diesem
Nachtrag auch im Block der vollen Karte** (vorher Belege · Konten ·
Zahlungen · Buchungen · Weitere, 0214): eine Ordnung für dieselben Gruppen. Nur Gruppen mit Einträgen; die ersten zwei
offen, die übrigen zu (Wireframe). Linksbündig, eine Liste, keine Tabelle:

| Gruppe | Zeile (Haupttext) | Unterzeile |
|---|---|---|
| Sachverhalt | `number` · `title` | — |
| Belege | `issuer` | Datum · Beleg-Nr. · Betrag |
| Zahlungen | `counterparty` | Datum · Betrag · Zahlungskonto |
| Kontoauszug | `paymentAccount` | Zeitraum (`DateRange`) |
| Konten | `number` (mono) `name` | — |
| Buchungen | Soll an Haben (mono) | Datum · Betrag · BU |
| Weitere Quellen | `label` | — |

„genannt" wie im Block, genannte Einträge zuerst. Jeder Eintrag ist ein
Knopf (`onSelect`) oder ein Link (`href`); ein Klick öffnet den Drawer, die
halb getippte Antwort bleibt.

**Beim Mandanten klären** (beide Varianten): Der Weg ersetzt die
Antwortfläche durch ein Notizfeld — `ChoicePrompt` ohne Optionen,
Pflichtfeld „Notiz für den Mandanten" (vorgefüllt mit `clientNote`), darüber
der Satz „Die Frage geht mit dieser Notiz an den Mandanten." und der
Textknopf „Doch selbst beantworten" (zurück zur Antwort), Hauptknopf „Beim
Mandanten klären"; ohne Text gesperrt mit „Schreiben Sie eine Notiz für den
Mandanten." (`freeText.emptyHint`). Der Fokus folgt dem Wechsel: in das
Notizfeld, wenn es aufgeht; zurück auf „Beim Mandanten klären", wenn es
zugeht oder gespeichert ist.
Beide Flächen bleiben gemountet, die andere ist `hidden`: wer hin- und
zurückgeht, findet seine Eingabe wieder.

**Zustand je Frage.** Der Antwortbereich ist an `clarification.id`
geschlüsselt, der Notizmodus an die Id gebunden: blättert die Seite unter
derselben Karte zur nächsten Frage, beginnt sie mit deren Vorauswahl, nicht
mit der Wahl der vorigen (beim Bau gefunden). In der vollen Karte steht der Weg als eigene kleine Zeile wie die
übrigen Auswege: „Nur der Mandant weiß es? **Beim Mandanten klären**".

## Verhalten

- **Client-Component** wie heute (Zustand: Freitext offen, Notizmodus,
  Dialoge).
- **Tastatur:** Tab-Weg Thema/Frage (nicht fokussierbar) → Optionen
  (Pfeiltasten in der Gruppe) → Zeile der Wege → Feld (wenn offen) →
  Hauptknopf (`Strg+Enter` im ganzen Block wie heute) → Kasten „Kontext"
  (je Gruppe der Aufklapper, dann die Einträge). „Eigene Antwort schreiben"
  setzt den Fokus ins Feld.
- **Hover:** Textknöpfe und Einträge im Kasten wie Links; Optionen wie
  heute.
- **Zustände:** gefüllt; lädt (`pending` am Knopf); Fehler (`error` am
  Knopf, Eingabe bleibt). Leer gibt es nicht — eine Karte ohne Frage wird
  nicht gezeigt; der Kasten ohne Einträge fehlt ganz (eine Spalte). Leer
  nach Filter: die Karte filtert nicht.
- **Breite:** die Karte füllt den Container (Konzept: volle Breite bis
  ≈ 1480 px). Der Kasten hat eine feste Breite, die Frage den Rest; bei
  1280 px Innenbreite mit Seitenleiste ohne Querlauf.

## Stories

`v3/Entitäten/Klärung/ClarificationCard` (vorhandene Datei) und
`v3/Patterns/Prüfen/ChoicePrompt`.

| Story | Beweist |
|---|---|
| `Step` | fiktive Frage „Wie soll die Wolkenhaus-Rechnung WH-26-00871 über 42,84 € gebucht werden?" (nach dem Muster einer echten §13b-Frage) mit Kontext, Fakten, drei Optionen, Empfehlung mit Warum; Kasten mit Sachverhalt, Belege, Zahlungen, Kontoauszug, Konten, Buchungen; `onSelect`-Rundlauf („Drawer öffnet: payment:…") |
| `StepFreeText` | Frage ohne Optionen: Feld „Antwort oder Anweisung für die Buchung" offen, Zeile ohne „Eigene Antwort schreiben"; Kasten mit nur einer Gruppe; optional, also Hinweis statt Badge |
| `StepAskClient` | Rundlauf „Beim Mandanten klären" → Notiz → gespeichert; danach `clientNote` gesetzt, Callout über der Antwort |
| `StepDeferredWithHistory` | zurückgestellte Frage mit Verlauf (zurückgestellt, nicht „gefragt"), „Zurückstellung aufheben" in der Zeile |
| `StepLoadingAndError` | `pending` und `error` nebeneinander |
| `StepPaging` | zwei Fragen unter derselben Karte mit `RecordPager`: jede beginnt mit ihrer eigenen Vorauswahl, der Notizmodus wandert nicht mit (Nachbesserung 2026-10-24) |
| `ChoicePrompt/OptionRowsWithLinks` | Freitext hinter dem Textknopf, zwei weitere Textknöpfe in der Zeile |

Fünf Story-Gründe aus §6 (Enum `variant` → `Step`; Callback `onAskClient` →
`StepAskClient`; Zustände lädt/Fehler → eine; Rand: ohne Optionen, mit
Verlauf). Die vorhandenen Stories der vollen Karte bleiben; `InBatchReview`
bekommt die Gruppen `cases` und `statements` dazu.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Mandanten-Hinweis wieder aufheben | `onUnaskClient?: () => Promise<void>` | die App kann eine Markierung zurücknehmen |
| Kontoauszug mit Salden | `EvidenceStatement.openingBalance` / `closingBalance` | die Frage betrifft eine Saldendifferenz |

## Befunde an die App

- **L-363** `ClarificationEvidence.cases` und `.statements` füllt die App
  nicht (`toClarificationEvidence` kennt nur Belege, Konten, Zahlungen,
  Buchungen, Weitere). Der Kontoauszug liegt fachlich am Import-Batch
  (GLOSSARY, Belegarten Punkt 4: Zeitraum, Salden, Auszugsnummer).
- **L-364** `clientNote`: ob und wo „Beim Mandanten klären" gespeichert wird,
  entscheidet die App (Konzept §12, „Beim Mandanten klären"); die Karte
  braucht nur die Notiz zurück.

## Abnahmekriterien

Fest (gilt immer):

- [x] `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün
- [x] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [x] Code englisch; `@when`/`@instead` an jedem Export
- [x] Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry
- [x] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [x] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [x] `variant="step"` zeigt keine Badges, keine Meta-Zeile „Gefragt ist …", keinen Verlaufseintrag „Gefragt"; Thema klein über der Frage als Überschrift (Story `Step`)
- [x] Die Empfehlung steht in `step` direkt unter den Optionen (Story `Step`, gemessen: kein Block dazwischen)
- [x] Die Zeile der Wege steht unter den Optionen, jeder Weg nur mit seinem Callback; „Eigene Antwort schreiben" öffnet das Feld und setzt den Fokus hinein (Story `Step`, `StepFreeText`)
- [x] „Beim Mandanten klären" ersetzt die Antwort durch das Pflichtfeld; ohne Text gesperrt mit Satz; „Doch selbst beantworten" kehrt zurück, Eingaben bleiben; `clientNote` zeigt den Callout und füllt das Feld vor (Story `StepAskClient`)
- [x] Kasten „Kontext": nur Gruppen mit Einträgen, Anzahl im Kopf, die ersten zwei offen, genannte zuerst, jeder Eintrag ruft `onSelect` mit seiner Art (Story `Step`)
- [x] `cases` und `statements` erscheinen auch im Block der vollen Karte, die Gruppen dort in derselben Reihenfolge wie im Kasten (Story `InBatchReview`)
- [x] Zustand je Frage: zwei Fragen nacheinander unter derselben Karte beginnen je mit ihrer eigenen Vorauswahl, der Notizmodus wandert nicht mit (Code: `key={c.id}`, `askingFor`)
- [ ] `variant="card"` ohne `onAskClient` unverändert (vorhandene Stories)
- [x] Bei 1280 px Innenbreite mit Seitenleiste kein Querlauf; Kasten und Frage oben bündig (gemessen)
- [x] Trefferfläche der Textknöpfe und Kasten-Einträge ≥ 24 × 24 px; Kontrast ≥ 4,5:1 (gemessen)
- [ ] offen (App): ersetzt `ClarificationDetail` in `close/CloseQuestions.tsx` ohne Funktionsverlust

## Gebaut 2026-10-24

`ClarificationCard.tsx`: `variant`, `onAskClient`, `clientNote`,
`EvidenceCase`/`EvidenceStatement`, `EvidencePanel` (intern), `HistoryBlock`
(intern, beide Formen), Reihenfolge der Gruppen in `evidenceGroups`;
`ChoicePrompt.tsx`: `freeText.toggle`, `freeText.defaultValue`, `links`,
`optionsNote` (und `ChoiceOption.note` aus 0223); `v3.css`: `.v2clc--step`,
`.v2clc--side` (Kasten 340 px), `.v2clc__ctx*`, `.v2ask__links`,
`.v2clc__answer[hidden]`. Gemessen (statischer Build, 1042 × 1000, Karte
1010 px): Kasten rechts oben bündig, kein Querlauf; „Eigene Antwort
schreiben" setzt den Fokus ins Feld; „Beim Mandanten klären" → Pflichtfeld,
gesperrt mit Satz, `Strg+Enter` speichert, danach Callout „Beim Mandanten zu
klären: …". Beim Messen gefunden und behoben: die Textknöpfe der Zeile waren
19 px hoch, jetzt ≥ 24 px.

## Abnahme

### Fremde Abnahme 2026-10-24

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung, nicht der Bauende). Stand
`51db640`, Arbeitsbaum sauber. Gelesen: `CLAUDE.md`, Skill `v3-komponente`
(Abnahme), diese Spec, der Bau in `git show 51db640` —
`ClarificationCard.tsx` ganz (neu und `51db640^`), `ChoicePrompt.tsx`, die
Story-Dateien beider, die neuen Regeln in `v3.css` —, dazu 0028 (Kriterien
von `FreeTextOnly`), §9 und §2a/A14 der Guideline, `befunde-app.md` (L-363,
L-364, Abschnitt E). Gemessen mit Playwright am statischen Build auf 6199,
Fenster 1042 px (Karte 1010 px, wie 1280 px mit Seitenleiste), Gegenprobe
1480 und 640 px; Maße mit `getBoundingClientRect`, Farben aus
`getComputedStyle`, Kontrast nach WCAG gerechnet; Tastatur mit echten
Tastendrücken. Gegenprobe „volle Karte und `ChoicePrompt` unverändert": die
Stories aus `51db640^` einmal gegen den alten, einmal gegen den neuen Code
serverseitig gerendert (`renderToStaticMarkup`, esbuild-Bündel außerhalb des
Repos), HTML nach Angleichung der `useId`-Kennungen verglichen und beide
Fassungen mit dem CSS des Builds in derselben Seite vermessen. Randfälle
(`clientNote` vorbelegt, leere Evidenz, Lesemodus, Altfall
`document_upload`) ebenso serverseitig. Befehle selbst gelaufen.
Bildschirmfotos: `.playwright-mcp/0222-abnahme-step-1042.png`,
`0222-abnahme-step-freetext-open.png`, `0222-abnahme-ask-client-empty.png`,
`0222-abnahme-ask-client-saved.png`, `0222-abnahme-step-free-text.png`,
`0222-abnahme-step-deferred-with-history.png`,
`0222-abnahme-step-loading-and-error.png`, `0222-abnahme-in-batch-review.png`,
`0222-abnahme-panel-hover.png`, `0222-abnahme-choiceprompt-links.png`.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `typecheck` Exit 0; `check:type` Exit 0, `--test` Exit 0; `pnpm build -o` ins Scratchpad Exit 0, Index führt die fünf `--step*`-Stories und `choiceprompt--option-rows-with-links`. `check:language`, `check:when`, `check:icons`, `check:contrast` Exit 0 samt `--test`; `check:classes` dieselben vier Altfälle wie auf `51db640^` | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | Erweiterung in `ClarificationCard.tsx` und `ChoicePrompt.tsx`, `EvidencePanel` intern ohne Export (wie die Spec sagt); Stories `v3/Entitäten/Klärung/ClarificationCard`, `v3/Patterns/Prüfen/ChoicePrompt` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `@when` der Karte um „`step` when it is one of several answered in a row" ergänzt; `EvidenceCase`/`EvidenceStatement` mit englischem JSDoc; Klassen `v2clc--step`, `v2clc__ctx*`, `v2ask__links`; Deutsch nur in Nutzer-Strings | ✓ |
| Kein Hex, kein px in TSX, keine lokale Label-Map; Status nur über Registry | kein Hex; px nur als Spurbreite der neuen Tabellen (`cols="96px minmax(0, 1fr)"`) wie bei den Nachbartabellen derselben Datei; Wörter der Gruppen sind dieselben wie im Block; `StatusBadge` unverändert | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | `--step`, `--step-free-text`, `--step-ask-client`, `--step-deferred-with-history`, `--step-loading-and-error`, `choiceprompt--option-rows-with-links` im Index, im Browser ohne Konsolenmeldung; `--in-batch-review` hat `cases` und `statements`; leer und leer nach Filter begründet. `freeText.defaultValue` zeigt keine Story wirklich (Hinweis 1) | ✓ (mit Hinweis) |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Kontrast, Trefferflächen, Hover, Fokusring, Schrift und Rand bestehen (s. u.). Offen: Überschriften springen in `step` von `h2` auf `h4` (§9 „Überschriften nach §2a", A14 „keine Sprünge" — Mangel 5); der Fokus fällt nach dem Wechsel in den Notizmodus auf `body` (Mangel 3) | ✗ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle neuen Stories und `--in-batch-review`, `--answering`, `--with-recommended-option`, `--deferred-with-undo` bei 1042 px; keine Konsolenmeldung | ✓ |
| `variant="step"` zeigt keine Badges, keine Meta-Zeile „Gefragt ist …", keinen Verlaufseintrag „Gefragt"; Thema klein über der Frage als Überschrift (Story `Step`) | `--step`: 0 × `.v2clc__badges`, 0 × `.v2clc__meta`, „Gefragt ist" kommt nicht vor, kein Verlaufsblock (nur ein `raised`-Eintrag, gefiltert); Thema `p.v2clc__topic` 12,5 px, `#5C5C5C` (6,69:1), darunter `h2.lw-ui-section` 16 px/600 mit der Frage. `--step-deferred-with-history`: Verlauf nur „Zurückgestellt von S. Vogt · 12.10.2026 …". Serverseitig: `question` = `title` → nur die Überschrift, kein Thema | ✓ |
| Die Empfehlung steht in `step` direkt unter den Optionen (Story `Step`, gemessen: kein Block dazwischen) | Kinder der Antwortfläche: Optionen (Unterkante 605,5) → Callout „Warum empfohlen: …" (Oberkante 621,5, Abstand = `gap` der Fläche) → Zeile der Wege → Knopf; nichts dazwischen. Die vorgewählte Zeile trägt „empfohlen" | ✓ |
| Die Zeile der Wege steht unter den Optionen, jeder Weg nur mit seinem Callback; „Eigene Antwort schreiben" öffnet das Feld und setzt den Fokus hinein (Story `Step`, `StepFreeText`) | `--step`: „Eigene Antwort schreiben · Beim Mandanten klären · Anderweitig geklärt · Zurückstellen", Trennstrich als `border-left` (kein Zeichen im Text). `--step-loading-and-error` (nur `onResolve`): nur „Eigene Antwort schreiben · Anderweitig geklärt"; `--step-deferred-with-history`: „Zurückstellung aufheben" statt „Zurückstellen". Klick (`--step`) bzw. Enter (`choiceprompt--option-rows-with-links`) auf „Eigene Antwort schreiben": Knopf verschwindet, Feld „Eigene Antwort" erscheint unter der Zeile, `activeElement` = `TEXTAREA`. `--step-free-text`: Feld „Antwort" offen, Zeile ohne „Eigene Antwort schreiben" | ✓ |
| „Beim Mandanten klären" ersetzt die Antwort durch das Pflichtfeld; ohne Text gesperrt mit Satz; „Doch selbst beantworten" kehrt zurück, Eingaben bleiben; `clientNote` zeigt den Callout und füllt das Feld vor (Story `StepAskClient`) | `--step-ask-client`: erste Option gewählt und eigene Antwort getippt → „Beim Mandanten klären": Antwortfläche `hidden` (`display: none`), Notizfläche mit „Die Frage geht mit dieser Notiz an den Mandanten.", „Doch selbst beantworten", Feld „Notiz für den Mandanten *", Knopf „Beim Mandanten klären" gesperrt, daneben „Bitte ergänzen Sie den Text.". Notiz getippt → zurück → Option und eigener Text unverändert → wieder hin → Notiz unverändert. `Strg+Enter` im Feld speichert, danach Callout „Beim Mandanten zu klären: Bitte den Kassenbeleg …" über der Antwort, Antwortfläche wieder sichtbar. Vorbelegung: serverseitig mit `clientNote` steht die Notiz im Feld (`defaultValue`). Fokus nach jedem Wechsel auf `BODY` (Mangel 3) | ✓ |
| Kasten „Kontext": nur Gruppen mit Einträgen, Anzahl im Kopf, die ersten zwei offen, genannte zuerst, jeder Eintrag ruft `onSelect` mit seiner Art (Story `Step`) | `--step`: `aside` „Kontext" mit Sachverhalt 1 (offen), Zahlungen 1 (offen), Kontoauszug 1, Konten 1 — Reihenfolge wie die Spec, keine leere Gruppe; „genannt" als zweite Zeile, Ordnung über dasselbe `citedFirst`. Klicks: „Drawer öffnet: case:case-0176", „payment:bt-0606", „statement:imp-1801-2026-01", „account:1801". Zeilen nach der Tabelle der Spec (Zahlung: Gegenpartei, darunter Datum · Betrag · Zahlungskonto; Kontoauszug: `01.–31.01.2026`). Ohne jeden Eintrag bleibt aber eine leere Spalte (Mangel 4) | ✓ |
| `cases` und `statements` erscheinen auch im Block der vollen Karte, die Gruppen dort in derselben Reihenfolge wie im Kasten (Story `InBatchReview`) | `--in-batch-review`: Sachverhalt · Belege · Zahlungen · Kontoauszug · Konten · Buchungen · Weitere Quellen; Sachverhalt mit Kopf „Nummer · Titel", Kontoauszug „Zahlungskonto · Zeitraum"; Klick meldet `case:case-0042` bzw. `statement:imp-2026-08` | ✓ |
| Zustand je Frage: zwei Fragen nacheinander unter derselben Karte beginnen je mit ihrer eigenen Vorauswahl, der Notizmodus wandert nicht mit (Code: `key={c.id}`, `askingFor`) | `key={c.id}` an beiden `ChoicePrompt` (`ClarificationCard.tsx:1025`, `:1058`), `asking = askingFor === c.id` (`:757–759`) | ✓ |
| `variant="card"` ohne `onAskClient` unverändert (vorhandene Stories) | 16 Stories aus `51db640^` alt gegen neu: gleich bis auf die gewollte Gruppenreihenfolge (`InBatchReview`) und **eine** ungewollte Änderung — die Zeile „Jetzt nicht zu klären? Zurückstellen" hat einen zusätzlichen `<span>` um Knopf und Grund, der Grund ein führendes Leerzeichen. In derselben Seite vermessen (`--answering`, `deferLockedReason`): Abstand Knopf → Grund 8 px vorher, 3,5 px jetzt (Mangel 1). Höhen aller 16 Stories gleich | ✗ |
| Bei 1280 px Innenbreite mit Seitenleiste kein Querlauf; Kasten und Frage oben bündig (gemessen) | 1042er Fenster: Karte 1010 px, Frage 596 px, Kasten 340 px, beide `top` 37; `scrollWidth` 1042. 1480: Frage 766 px, Kasten 340 px. 640 px (≈ 200 % Zoom): kein Querlauf, Frage noch 194 px | ✓ |
| Trefferfläche der Textknöpfe und Kasten-Einträge ≥ 24 × 24 px; Kontrast ≥ 4,5:1 (gemessen) | Wege 24 px hoch, 83–156 px breit; Kasten-Einträge 290 × 42,7–80,2 px, Aufklapper 306 × 36,9 px. Linkfarbe `rgb(43, 111, 156)` 5,45:1, Unterzeile und „genannt" 6,69:1. Hover: Wege und Einträge unterstrichen | ✓ |
| offen (App): ersetzt `ClarificationDetail` in `close/CloseQuestions.tsx` ohne Funktionsverlust | in `befunde-app.md` E eingetragen, L-363 und L-364 im Register | offen (App) |
| Zusatz: `ChoicePrompt` ohne neue Props unverändert | 8 Stories aus `51db640^` alt gegen neu: 7 gleich, `FreeTextOnly` nicht — der Grund neben dem Knopf lautet jetzt „Bitte ergänzen Sie den Text." statt „Schreiben Sie eine Antwort." (Mangel 2) | ✗ |
| Zusatz: Schnittstelle Zeichen für Zeichen | `variant?: "card" \| "step"` Vorgabe `"card"`, `onAskClient?: (note: string) => Promise<void>`, `clientNote?: string \| null`, `cases?`/`statements?` als `readonly …[]`, `EvidenceCase`/`EvidenceStatement` mit den Feldern der Tabelle (als `interface … extends EvidenceRow`), `EvidenceKind` um `"case"`, `"statement"`; `freeText.toggle?`, `freeText.defaultValue?`, `links?: ReactNode`, `optionsNote?: ReactNode` — alle wie die Tabellen. Nicht in der Tabelle: die geänderte Satzwahl in `ChoicePrompt.tsx:116–119` (Mangel 2) | ✗ |
| Zusatz: Fokus beim Wechsel der Flächen | s. Mangel 3 | ✗ |
| Zusatz: „Ohne Einträge im Kasten eine Spalte über die ganze Breite" (Aufbau) | s. Mangel 4 | ✗ |

### Mängel

1. **Volle Karte verändert: Grund neben „Zurückstellen" rückt an den Knopf.**
   `ClarificationCard.tsx:857–873` legt Knopf und `.v2clc__exitwhy` in einen
   `<span>` und setzt `{" "}` in den Grund; in der Karte (`:1098–1103`) steht
   dieser `span` in `p.v2clc__exit` (Flex, `gap: var(--space-2)`). Vorher waren
   Knopf und Grund zwei Flex-Kinder mit 8 px Abstand, jetzt trennt sie ein
   Leerzeichen (3,5 px, gemessen in `--answering`). Jede Karte mit `onDefer`
   trägt dazu einen zusätzlichen `span`. Vorschlag: in der Karte wie vorher
   Knopf und Grund als Geschwister rendern — `deferButton` als Fragment, und
   für die Zeile der Wege den Abstand über CSS geben
   (`.v2ask__links .v2clc__exitwhy { margin-left: var(--space-1) }`) statt
   über ein Leerzeichen im Text.
2. **`ChoicePrompt` ohne neue Props verändert.** `ChoicePrompt.tsx:116–119`:
   ohne Optionen und mit `freeText.required` heißt der Grund jetzt „Bitte
   ergänzen Sie den Text."; `--free-text-only` zeigt ihn. Das widerspricht
   dem abgenommenen Kriterium in 0028 („Ohne Optionen sagt der Grund
   „Schreiben Sie eine Antwort." (Story `FreeTextOnly`)"), und die
   Schnittstellentabelle oben nennt die Änderung nicht. Der Satz ist für die
   Notiz an den Mandanten richtig — die Frage ist, ob er überall gelten
   soll. Vorschlag: als Systementscheid festhalten (ein Pflichtfeld ohne
   Optionen sagt überall „Bitte ergänzen Sie den Text.", wie schon der Zweig
   `missingText`) und 0028 mit Datum nachtragen — oder die alte Wahl
   wiederherstellen und den Satz nur für die Notiz wählen. Welches nachgibt,
   entscheidet die Nacharbeit; still bleiben darf es nicht.
3. **Fokus fällt auf `body`.** Nach „Beim Mandanten klären" (Zeile der Wege
   und Zeile der Karte), nach „Doch selbst beantworten" und nach dem
   Speichern der Notiz steht `document.activeElement` auf `BODY` (gemessen in
   `--step-ask-client`): der geklickte Knopf wird `hidden`, die andere Fläche
   war schon gemountet, `autoFocus` greift nicht. Wer mit der Tastatur
   arbeitet, beginnt oben neu (WCAG 2.4.3; Linse Bedienung). Vorschlag: beim
   Wechsel in den Notizmodus den Fokus ins Notizfeld setzen (Ref + Effekt auf
   `asking`), beim Zurück auf die gewählte Option bzw. „Eigene Antwort
   schreiben", nach dem Speichern auf „Beim Mandanten klären" in der Zeile.
4. **Leere Evidenz lässt eine leere Spalte stehen.** `ClarificationCard.tsx:948`
   setzt `side` auf das Element `<EvidencePanel>`, sobald `evidence` gesetzt
   ist — auch wenn jede Gruppe leer ist; `:1118` gibt dann `v2clc--side`
   (Raster `minmax(0, 1fr) 340px`), `EvidencePanel` rendert aber nichts.
   Serverseitig mit `evidence: { documents: [], payments: [] }`: Klasse
   `v2clc v2clc--step v2clc--side`, kein `<aside>` — rechts bleiben 340 px
   plus Spalt leer. Die App liefert genau solche leeren Listen
   (`toClarificationEvidence`). Vorschlag: vor dem Rendern zählen
   (`hasEvidence(e)` über `evidenceGroups`) und `side` nur dann setzen.
5. **Überschriften springen.** In `step` ist die Frage `h2`, die Blöcke
   „Grundlage" und „Verlauf dieser Frage" bleiben `h4` (`Block`, `:648–655`):
   Sprung `h2` → `h4` gegen §9/A14. Vorschlag: `Block` bekommt die Ebene nach
   Lage (`step` → `h3`), wie `FieldList` mit `headingLevel`.

### Hinweise (nicht blockierend)

1. **Vorbelegung ohne Story.** `freeText.defaultValue` (Nachweis laut Tabelle
   `StepAskClient`) zeigt sich dort nicht: die Story beginnt ohne Notiz, und
   nach dem Speichern steht im Feld der getippte Text aus dem Zustand.
   Vorschlag: `StepAskClient` mit gesetzter `clientNote` beginnen oder eine
   zweite Karte daneben.
2. **`as`-Zusicherung.** `EvidencePanel` (`:620`) schließt mit
   `as { kind: EvidenceKind; … }[]`; ein vor dem `filter` typisiertes Array
   braucht sie nicht.
3. **Wege während `pending` bedienbar.** In `--step-loading-and-error` (oben)
   sind die Optionen gesperrt, „Eigene Antwort schreiben" und „Anderweitig
   geklärt" nicht. Ansehen, ob ein Ausweg während des Speicherns offen sein
   soll.
4. **Vorbestehend, nicht aus diesem Bau:** Beträge mit `-` (U+002D) statt
   echtem Minus, z. B. „15.01.2026 · -58,00 € · …" im Kasten — `AmountCell`
   formatiert so im ganzen Set.

Vier Linsen: **Sprache** — Frage als Überschrift, Thema klein, Wege im
Imperativ mit Objekt („Eigene Antwort schreiben", „Beim Mandanten klären"),
der Hauptknopf der Notiz nennt die Folge, „Kontoauszug"/„Zahlungen" wie im
Block; aber der Satz neben dem Knopf ist für bestehende Freitextfragen still
umgestellt (M2) ✗. **Bedienung** — Trefferflächen ≥ 24 px, Kontrast ≥ 5,45:1,
Tab-Weg Optionen → Wege → Knopf → Kasten, Pfeiltasten in den Optionen,
`Strg+Enter` im Block, „Eigene Antwort schreiben" fokussiert das Feld; der
Wechsel in den Notizmodus und zurück verliert den Fokus (M3) ✗. **Logik** —
ein Baustein, eine Enum-Prop, Antwortzustand je Frage geschlüsselt, beide
Flächen bleiben gemountet; leere Evidenz erzeugt eine leere Spalte (M4) ✗.
**Darstellung** — eine Karte mit Rand, Kasten oben bündig, Empfehlung direkt
unter der markierten Zeile, Farbe nur für Links; in der vollen Karte rückt
der Sperrgrund an den Knopf (M1), die Überschriftenebenen springen (M5) ✗.
Vier-Wochen-Test: die schlanke Frage besteht ihn — Frage oben, Antwort
vorgewählt mit Wort „empfohlen", der Weg darunter in Worten.

Abgenommen von / am: Claude (fremde Abnahme, nicht der Bauende), 2026-10-24,
Stand `51db640` · **Nicht abgenommen.** Offene Punkte: Mängel 1–5, Hinweise
1–3; die Ablösung von `ClarificationDetail` ist offen (App).

## Nachbesserung 2026-10-24 (nach der fremden Abnahme)

| Mangel | Behoben |
|---|---|
| M1 „Zurückstellen" und sein Sperrgrund 3,5 statt 8 px auseinander (Regression der vollen Karte) | `deferButton` wieder ein Fragment, ohne führendes Leerzeichen — in der Zeile der Karte setzt der `gap` der Zeile den Abstand wie vorher; in der Wege-Zeile von `step` hält ein `.v2clc__linkitem` (inline-flex, `gap: --space-2`) Knopf und Grund als ein Eintrag zusammen |
| M2 `ChoicePrompt` änderte ohne neue Prop den Satz eines Pflicht-Freitexts ohne Optionen | zurückgenommen: ohne Prop bleibt „Schreiben Sie eine Antwort." (0028, `FreeTextOnly`); neu `freeText.emptyHint`, die Notiz setzt „Schreiben Sie eine Notiz für den Mandanten." (Schnittstelle oben) |
| M3 Fokus fällt nach „Beim Mandanten klären", „Doch selbst beantworten" und nach dem Speichern auf `BODY` | `useEffect` auf den Notizmodus: auf → Fokus ins Notizfeld (`[data-client-note] textarea`), zu → zurück auf den Knopf „Beim Mandanten klären" (`id` über `useId`) |
| M4 `evidence` mit lauter leeren Gruppen ließ eine leere Spalte von 340 px | gezählt wird über alle Gruppen; ohne Eintrag kein Kasten und kein `v2clc--side` |
| M5 Überschriften springen von `h2` auf `h4` | `Block` und `HistoryBlock` bekommen `level`; in `step` sind „Grundlage" und „Verlauf dieser Frage" `h3`, in der Karte bleiben sie `h4` |

Dazu Story `StepPaging` (der Abnehmende konnte „Zustand je Frage" nur im
Code prüfen). Status zurück auf Abnahme, Nachprüfung durch den Abnehmenden.

## Nachtrag 2026-10-26 — Zonen (Owner über llcto)

Befund des Owners am Wireframe: Thema, Frage, Kontext, Fakten, Antworten und
Wege verschwimmen zu einem Block; der Kasten „Kontext" wirkt wie eine flache
Liste, Gruppenkopf und Eintrag sehen gleich aus, und er setzt sich kaum von
der Karte ab. Ziel: auf einen Blick drei Zonen — worum es geht · die Antwort ·
Quellen zum Nachschlagen —, Gruppe und Eintrag unterscheidbar. Trennung über
Fläche, Linie, Abstand und Schrift, nie über Farbe.

| Was | Entscheid |
|---|---|
| Rahmen | Zwei Karten (`.v2card`) im Raster statt einer Karte mit innerem Kasten; Abstand `--space-4` wie zwischen Karten einer Seite |
| Obere Zone `.v2clc__about` | Thema, Frage (`h2`), Hinweis bei `optional`, Zurückstellung, Mandanten-Notiz, Kontext, Grundlage (`h3`), Verlauf (`h3`). Kein eigener Kopf: die Frage als Überschrift ist ihr Kopf |
| Untere Zone `.v2clc__reply` | Fußzone der Karte: Linie `--color-border` über die ganze Breite, Tönung `--color-surface-head` (wie Kartenkopf und -fuß), Kopf **„Ihre Antwort"** (`h3.lw-ui-group`, 0220 Rolle 5; `--color-text-muted` 6,45:1 auf `surface-head`). Darin Optionen, „Warum empfohlen", Zeile der Wege, Hauptknopf — bzw. das Notizfeld des Mandanten-Wegs |
| Legende „Antwortoptionen" | in `step` nur für Screenreader (der Zonenkopf benennt die Optionen) |
| Freitext ohne Optionen | in `step` heißt das Feld „Antwort oder Anweisung für die Buchung" (bisher Platzhalter) — „Antwort" unter „Ihre Antwort" wäre dasselbe Wort zweimal; in der vollen Karte unverändert |
| Karte „Kontext" | `CardHead` „Kontext" (`h3`); jede Gruppe ein `Disclosure`, dessen Kopf die Gruppen-Rolle trägt (12,5 px, 700, `muted` 6,69:1), Zähler rechts, volle Linie zwischen den Gruppen. Einträge als Zeilen mit dem Zeichen ihrer Art aus `ENTITY_ICON` (Sachverhalt `accounting-case`, Belege `source-document`, Zahlungen `bank-transaction`, Kontoauszug `bank-account` — der Eintrag öffnet das Zahlungskonto —, Konten `ledger-account`, Buchungen `journal-entry`; „Weitere Quellen" mischen Arten und tragen keins). Zeichen in der Spalte des Chevrons, Wort in der Flucht des Gruppenworts |
| Optional | kein Badge; Satz aus `clarification_severity.optional.description` als `lw-ui-hint` unter der Frage. „kann warten" (Owner-Vorschlag) wäre ein zweites Wort neben der Registry — an llcto gemeldet |

Beim Bau gefunden und behoben:

- **Hängender Trennstrich.** Bricht die Zeile der Wege um (zurückgestellte
  Frage, vier Wege bei 1280 px), begann die zweite Zeile mit einem Strich
  („| Zurückstellung aufheben"). Jetzt trägt jeder Eintrag seinen Strich als
  `::before` im linken Außenabstand; die Zeile ist um einen Vorlauf nach links
  gezogen und links knapp hinter dem Strich beschnitten (`clip-path`), so
  fällt der Strich vor dem ersten Eintrag **jeder** Zeile weg. Der Fokusring
  sitzt eng am Wort und liegt rechts der Schnittkante (gemessen: Ring 37 px,
  Kante 29 px, Text bündig mit der Zone bei 41 px).
- **Eintrag ohne Klickziel.** Ohne `onSelect` und `href` ist ein Eintrag
  reiner Text; das Raster hing an `.v2clc__pick` und griff dort nicht
  (Zeichen allein in einer Zeile). Jetzt hängt es am Eintrag selbst.
- Hinweis 2 der Abnahme erledigt: `EvidencePanel` typisiert das Feld vor dem
  `filter`, ohne `as`.

Beispieldaten: Die Stories von 0222 und 0223 trugen Daten eines echten
Mandantenstapels, eine Privatperson darunter. Seit diesem Nachtrag sind sie
fiktiv (Owner über llcto: echte Daten nur in Bildschirmfotos, nie im
öffentlichen Repo). Die Abnahmetexte oben nennen die alten Namen nicht mehr.

Gemessen (Storybook, Fenster 1042 × 1000 = 1280 px mit Seitenleiste):
`scrollWidth` 1042, beide Karten `top` 16, Kontext 340 px; Gruppenkopf
34,8 px hoch, Einträge ≥ 42 px, Wege 24 px; Überschriften `h2` → `h3`
(Grundlage, Ihre Antwort, Kontext); „Beim Mandanten klären" → Fokus im
Notizfeld, „Doch selbst beantworten" → Fokus zurück auf den Weg.

Abnahmekriterien dazu (offen, fremde Abnahme):

- [ ] Drei Zonen ohne Farbe unterscheidbar: Frage-Karte mit Fußzone „Ihre Antwort" (Linie, Tönung, Kopf), Karte „Kontext" daneben (Stories `Step`, `StepFreeText`, `StepDeferredWithHistory`)
- [ ] Im Kasten Gruppenkopf (Gruppen-Rolle, Zähler) und Eintrag (Zeichen der Art, Linkfarbe) verschieden; Linie zwischen den Gruppen (Story `Step`)
- [ ] Optionale Frage: kein Badge, Hinweis aus der Registry (Story `StepFreeText`)
- [ ] Wege-Zeile umbrechend ohne Strich am Zeilenanfang, Fokusring ganz (Story `StepDeferredWithHistory`, gemessen)
- [ ] Stories und Specs ohne echte Mandantendaten

Status: zurück auf Abnahme, Stand `c848b6d`; die Nachprüfung der Mängel 1–5
und dieser Nachtrag gehen zusammen an den Abnehmenden.

