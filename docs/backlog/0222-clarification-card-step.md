# 0222 · ClarificationCard `variant="step"` — die schlanke Rückfrage mit Kontext

| | |
|---|---|
| Status | Abnahme (Nachprüfung M6 + Nachtrag yes_no) · vorher: in Arbeit — nicht abgenommen 2026-10-26 (fremde Nachprüfung, Stand `c848b6d`: Mängel 1–5 behoben, Nachtrag Zonen erfüllt, volle Karte unverändert; offen: neuer Mangel 6) · davor: nicht abgenommen 2026-10-24 (fremde Abnahme, Stand `51db640`; Mängel 1–5) · Hashes: `51db640` (Bau) und `b2b84e5` (Nachbesserung) waren lokal und sind vor dem Push in `c848b6d` zusammengefasst (Stories mit fiktiven Daten); `51db640^` = `d3e91ff` |
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
- [x] Prüfliste `design-guidelines.md` §9 durchgegangen
- [x] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [x] `variant="step"` zeigt keine Badges, keine Meta-Zeile „Gefragt ist …", keinen Verlaufseintrag „Gefragt"; Thema klein über der Frage als Überschrift (Story `Step`)
- [x] Die Empfehlung steht in `step` direkt unter den Optionen (Story `Step`, gemessen: kein Block dazwischen)
- [x] Die Zeile der Wege steht unter den Optionen, jeder Weg nur mit seinem Callback; „Eigene Antwort schreiben" öffnet das Feld und setzt den Fokus hinein (Story `Step`, `StepFreeText`)
- [x] „Beim Mandanten klären" ersetzt die Antwort durch das Pflichtfeld; ohne Text gesperrt mit Satz; „Doch selbst beantworten" kehrt zurück, Eingaben bleiben; `clientNote` zeigt den Callout und füllt das Feld vor (Story `StepAskClient`)
- [x] Kasten „Kontext": nur Gruppen mit Einträgen, Anzahl im Kopf, die ersten zwei offen, genannte zuerst, jeder Eintrag ruft `onSelect` mit seiner Art (Story `Step`)
- [x] `cases` und `statements` erscheinen auch im Block der vollen Karte, die Gruppen dort in derselben Reihenfolge wie im Kasten (Story `InBatchReview`)
- [x] Zustand je Frage: zwei Fragen nacheinander unter derselben Karte beginnen je mit ihrer eigenen Vorauswahl, der Notizmodus wandert nicht mit (Code: `key={c.id}`, `askingFor`)
- [x] `variant="card"` ohne `onAskClient` unverändert (vorhandene Stories)
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

- [x] Drei Zonen ohne Farbe unterscheidbar: Frage-Karte mit Fußzone „Ihre Antwort" (Linie, Tönung, Kopf), Karte „Kontext" daneben (Stories `Step`, `StepFreeText`, `StepDeferredWithHistory`)
- [x] Im Kasten Gruppenkopf (Gruppen-Rolle, Zähler) und Eintrag (Zeichen der Art, Linkfarbe) verschieden; Linie zwischen den Gruppen (Story `Step`)
- [x] Optionale Frage: kein Badge, Hinweis aus der Registry (Story `StepFreeText`)
- [x] Wege-Zeile umbrechend ohne Strich am Zeilenanfang, Fokusring ganz (Story `StepDeferredWithHistory`, gemessen)
- [x] Stories und Specs ohne echte Mandantendaten

Status: zurück auf Abnahme, Stand `c848b6d`; die Nachprüfung der Mängel 1–5
und dieser Nachtrag gehen zusammen an den Abnehmenden.

### Nachprüfung 2026-10-26

Abnehmer: Claude (Abnahme-Agent, fremde Sitzung, weder Bauender noch
Abnehmer vom 2026-10-24). Stand `c848b6d` (+ `33e4858`, nur Status-Zeilen),
Basis `d3e91ff`; Arbeitsbaum zu Beginn sauber. Gelesen: `CLAUDE.md`, Skill
`v3-komponente` (Abnahme), §9 der Guideline, diese Spec ganz (Abnahme,
Mängel, Nachbesserung, Nachtrag Zonen), `git diff d3e91ff c848b6d` für
`ClarificationCard.tsx`, `ChoicePrompt.tsx`, beide Story-Dateien, `v3.css`
(Blöcke „0222 · the step form", `.v2ask__links`), `tokens.css` (Rollen 0220),
die Achse `clarification_severity` im Spiegel. Gemessen mit `scripts/cdp.mjs`
am Dev-Server 6107 (Fenster 1042 × 1000 = 1280 px mit Seitenleiste,
Gegenprobe 1480, 900, 760, 700 und 640 px): Maße mit `getBoundingClientRect`,
Farben aus `getComputedStyle` (Pseudo-Element `::before` eingeschlossen),
Kontrast nach WCAG gerechnet, Tastatur mit echten Tastendrücken (Tab, Pfeil,
Enter, `Strg+Enter`, Esc) und echten Klicks. Gegenprobe „volle Karte
unverändert": `d3e91ff` in einem Worktree außerhalb des Repos und `c848b6d`
je statisch ins Scratchpad gebaut, alle 16 Card- und 8 ChoicePrompt-Stories
beider Stände in derselben Messung geladen, `innerHTML` (nach Angleichung der
`useId`-Kennungen) und die Geometrie jedes Elements verglichen. Randfälle
ohne Story (leere Evidenz, `clientNote` vorbelegt, Lesemodus, Altfall
`document_upload`, `question` = `title`, `deferLockedReason` in `step`, volle
Karte mit `clientNote`) serverseitig gerendert (`renderToStaticMarkup`,
esbuild-Bündel im Scratchpad). Befehle selbst gelaufen. Während der Messung
haben andere Sitzungen `Clarification.tsx` (0224, `2b54bb6`, `3fdf788`) und
`DataTable.tsx` geändert; beides berührt `variant="step"` nicht (die Karte
nimmt aus `Clarification.tsx` nur `AUDIENCE_LABEL` für die Meta-Zeile der
vollen Karte), und die Gegenprobe alt/neu lief an den statischen Builds aus
dem sauberen Stand. Bildschirmfotos
`.playwright-mcp/0222-nachpruefung-1026-step-1042.png`,
`…-step-focus-first-way.png`, `…-step-640.png`, `…-step-free-text.png`,
`…-ask-client-empty.png`, `…-ask-client-saved.png`,
`…-deferred-with-history-1042.png`, `…-deferred-640-wrap-focus.png`,
`…-step-loading-and-error.png`, `…-step-paging.png`,
`…-in-batch-review.png`, `…-choiceprompt-links.png`.

| Mangel · Kriterium | Nachweis (Story-ID · Befehl · Messwert · Datei:Zeile) | Ergebnis |
|---|---|---|
| M1 Sperrgrund neben „Zurückstellen" rückte in der vollen Karte an den Knopf | `--answering` (`deferLockedReason`): Kinder von `p.v2clc__exit` = Zeichen · Text · `button` · `span.v2clc__exitwhy`, kein Zusatz-`span`, kein führendes Leerzeichen; Abstand Knopf → Grund **8 px** (vorher 3,5). Alt gegen neu: `--answering` HTML und Geometrie gleich. In `step` (serverseitig mit `deferLockedReason`): `span.v2clc__linkitem` mit `button[disabled][aria-describedby]` und dem Grund als **ein** Eintrag der Zeile | ✓ behoben |
| M2 `ChoicePrompt` ohne neue Props verändert | `choiceprompt--free-text-only`: „Schreiben Sie eine Antwort." wie 0028; `ChoicePrompt.tsx:128` `freeText?.emptyHint ?? …`; die Notiz sagt „Schreiben Sie eine Notiz für den Mandanten." (`--step-ask-client`); `freeText.emptyHint` steht in der Schnittstelle. Alt gegen neu: alle 8 ChoicePrompt-Stories HTML und Geometrie gleich | ✓ behoben |
| M3 Fokus fiel beim Wechsel der Flächen auf `BODY` | `--step-ask-client`, echte Klicks und Tasten: „Beim Mandanten klären" → `activeElement` = `TEXTAREA` in `[data-client-note]`, Antwortfläche `hidden` (`display: none`); „Doch selbst beantworten" → `BUTTON` „Beim Mandanten klären"; Enter darauf → wieder im Notizfeld, Notiz unverändert; `Strg+Enter` speichert → Fokus auf „Beim Mandanten klären", Callout „Beim Mandanten zu klären: Bitte den Kassenbeleg nachreichen" in der oberen Zone. Gewählte Option (die zweite) und eigener Text bleiben über beide Wechsel | ✓ behoben (beim Blättern s. M6) |
| M4 leere Evidenz ließ eine leere Spalte | serverseitig mit `evidence: { documents: [], payments: [] }`: Klasse `v2clc v2clc--step`, kein `<aside>`; Zählung `ClarificationCard.tsx:985–988` | ✓ behoben (Hinweis 5) |
| M5 Überschriften sprangen von `h2` auf `h4` | `--step`: `h2` Frage → `h3` Grundlage · `h3` Ihre Antwort · `h3` Kontext; `--step-deferred-with-history` dazu `h3` Verlauf dieser Frage; volle Karte `--in-batch-review`: `h3` Titel → `h4` Grundlage · `h4` Quellen und Kontext (wie vorher) | ✓ behoben |
| Hinweis 1 (2026-10-24) Vorbelegung ohne Story | `StepAskClient` beginnt weiter mit `clientNote: null`; die Vorbelegung ist nur serverseitig nachgewiesen (Notiz im `textarea` des Notizfelds, Callout darüber) | offen (Hinweis 1) |
| Hinweis 2 (2026-10-24) `as` in `EvidencePanel` | `EvidencePanel` typisiert das Feld vor dem `filter`, kein `as`; neu steht eines in der M4-Zählung (Hinweis 5) | erledigt |
| Hinweis 3 (2026-10-24) Wege während `pending` | `--step-loading-and-error` oben: Optionen und Hauptknopf gesperrt, „Eigene Antwort schreiben" und „Anderweitig geklärt" nicht; ein Klick auf „Eigene Antwort schreiben" öffnet ein gesperrtes Feld, der Knopf verschwindet, der Fokus fällt auf `BODY` | offen (Hinweis 3) |
| Hinweis 4 (2026-10-24) Minus | Kasten in `--step`: „02.01.2026 · -42,91 € · 1802 Geschäftskonto" mit U+002D | vorbestehend |
| `pnpm typecheck`, `pnpm build`, `pnpm check:type` grün | `typecheck` Exit 0; `check:type` Exit 0, `--test` Exit 0; `pnpm build -o` ins Scratchpad Exit 0 (nur die bekannte Chunk-Warnung), Index führt die sechs `--step*`-Stories und `choiceprompt--option-rows-with-links`. `check:language`, `check:when`, `check:icons`, `check:contrast` Exit 0, je `--test` Exit 0; `check:classes` Exit 1 mit denselben vier Altfällen wie auf `d3e91ff` (`v3clt__step`, `v3clt`, `v2tbl__foot`, `cy-page`), `--test` Exit 0 | ✓ |
| Prüfliste `design-guidelines.md` §9 | Stufe und Importe abwärts; kein Hex, px nur als Spurbreite der Evidenztabellen wie bisher; Text links, Zahlen rechts (Grundlage); Farbe nur Link und Fehler; fünf Zustände (leer und leer nach Filter begründet); Kontrast und Fokus s. u., Fokusring `#3B8FC4` 3,55:1 auf Weiß, 3,43:1 auf `surface-head`; Hauptweg mit sichtbarer Taste (`Strg+Enter`); Hover an Wegen, Einträgen und Gruppenköpfen; Trefferflächen ≥ 24 px; Zeichen Lucide 1,5 aus `ENTITY_ICON`, nie ohne Wort; Schrift aus der Skala (12,5/16 px, 400/600/700); Überschriften nach §2a (M5); zwei Karten mit Rand ohne Schatten; Raster `minmax(0, 1fr)` und `.v2clc__main { min-width: 0 }` — unter ≈ 700 px schneidet die Karte die Antwortzone ab (Hinweis 6) | ✓ (mit Hinweisen) |
| Im Browser angesehen | alle sechs `--step*`-Stories, `--in-batch-review`, `--answering`, `choiceprompt--option-rows-with-links`, `--free-text-only`; Konsole ohne Meldung (nur das `favicon.ico` von Storybook) | ✓ |
| `variant="card"` ohne `onAskClient` unverändert (vorhandene Stories) | 16 Card-Stories `d3e91ff` gegen `c848b6d` (statische Builds, 1042 px): **15 gleich** in HTML und Geometrie jedes Elements; `--in-batch-review` anders nur im Block „Quellen und Kontext" (gewollt: Sachverhalt · Belege · Zahlungen · Kontoauszug · Konten · Buchungen · Weitere Quellen statt Belege · Konten · Zahlungen · Buchungen · Weitere Quellen, dazu die Fixtur-Gruppen `cases`/`statements`), die Karte ohne diesen Block Zeichen für Zeichen gleich. Serverseitig: volle Karte mit `clientNote` zeigt den Callout und die Zeile „Nur der Mandant weiß es? Beim Mandanten klären" | ✓ |
| Bei 1280 px Innenbreite kein Querlauf; Kasten und Frage oben bündig | 1042: `scrollWidth` 1042, Raster `654px 340px`, beide Karten `top` 16, Spalt 16 px; 1480: 824 + 340 px; 640: `scrollWidth` 640, Frage 252 px (Hinweis 6) | ✓ |
| Trefferfläche ≥ 24 × 24, Kontrast ≥ 4,5:1 | Wege 24 px hoch, 83–156 px breit; Kasten-Einträge (alle Gruppen offen) 302 × 42,7–84,6 px; Gruppenköpfe 338 × 34,8 px. Linkfarbe `#2B6F9C` 5,45:1 auf Weiß, 5,26:1 auf `surface-head`; Thema 6,69:1; optionaler Hinweis 4,88:1; „Ihre Antwort" 6,45:1; Gruppenkopf, Unterzeile, „genannt", Zeichen je 6,69:1; Fehler-Callout `#A8403C` 4,99:1 | ✓ |
| Nachtrag: drei Zonen ohne Farbe | `--step`: Frage-Karte `.v2card` (1 px `#DDE2E8`, kein Schatten) mit `.v2clc__about` (weiß) und `.v2clc__reply`: Linie 1 px `#DDE2E8` über die volle Innenbreite (652 px), Fläche `#FAFBFC`, Kopf `h3.lw-ui-group` „Ihre Antwort" (12,5 px, 700, `#5C5C5C`, 6,45:1, `aria-labelledby` der `section`); Karte „Kontext" daneben. Kein Farbton — die Tönung ist 1,04:1 zu Weiß, die Trennung tragen Linie, Kopf und Abstand. Legende „Antwortoptionen" 1 × 1 px, `clip-path: inset(50%)`. `--step-free-text` und `--step-deferred-with-history`: dieselben Zonen und Köpfe | ✓ |
| Nachtrag: Gruppenkopf und Eintrag verschieden, Linie zwischen den Gruppen | Gruppenkopf (`summary`) 12,5 px, 700, `#5C5C5C`, Zähler an der rechten Kante, Hover `bg-soft`. Eintrag: Zeichen aus `ENTITY_ICON` (svg, `stroke-width` 1,5, `#5C5C5C`) **in der Spalte des Chevrons** (x 705 = 705), Haupttext **in der Flucht des Gruppenworts** (x 727 = 727) in `#2B6F9C`, Gewicht 400, Unterzeile in Textgrau; Hover unterstrichen. Linie 1 px `#ECEFF3` über die volle Kartenbreite zwischen den Gruppen, über der ersten keine. Reihenfolge Sachverhalt · Belege · Zahlungen · Kontoauszug · Konten · Buchungen, die ersten zwei offen. Sieben Klicks: `case:case-0412`, `document:doc-0871`, `payment:bt-0207`, `statement:imp-1802-2026-01`, `account:6837`, `account:70412`, `entry:je-2025-1187`. Ohne `onSelect` (`--step-ask-client`) Einträge als Text in Textfarbe, ohne Hover | ✓ |
| Nachtrag: optionale Frage | `--step-free-text`: kein Badge; `p.lw-ui-hint` „Hilfreich, aber die Buchung kann auch ohne Antwort erfolgen." = `clarification_severity.optional.description` (Spiegel `status-registry.ts:968`), 4,88:1; Feld heißt „Antwort oder Anweisung für die Buchung", kein Platzhalter; Zeile ohne „Eigene Antwort schreiben" | ✓ |
| Nachtrag: Wege-Zeile umbrechend, kein Strich am Zeilenanfang, Fokusring ganz | `--step-deferred-with-history`, `clip-path: inset(-6px -6px -6px 13px)`, Schnittkante x 29: bei 1042 zwei Zeilen, „Zurückstellung aufheben" beginnt die zweite (x 41), sein Strich bei x 28 → weggeschnitten; bei 900, 760 und 640 (vier Zeilen) ebenso — jeder Zeilenanfang ohne Strich, jeder Folgeeintrag mit Strich. Fokusring (Tab, `:focus-visible`, 2 px, Versatz 2 px) bei 640 an allen vier Wegen ganz innerhalb der Schnittfläche (links 37 ≥ 29, oben/unten innerhalb ± 6 px), bei 1042 am ersten Weg links 37, Text bündig mit der Zone bei 41 — wie der Nachtrag sagt. 1480: eine Zeile | ✓ |
| Nachtrag: keine echten Mandantendaten | Datenprobe über `git log -p --format= d3e91ff..HEAD` mit dem Suchmuster des Owners (bei llcto, steht bewusst nicht im Repo) leer; Namen der Stories (Wolkenhaus S.à r.l., Tabula Cloud Inc., Brightline Technology GmbH, Serverhaus Nord GmbH, Musterfirma, team@musterfirma.de) fiktiv, „S. Vogt" aus dem Bestand vor `d3e91ff`; die Abnahmetexte nennen den echten Stapel nicht | ✓ |
| Zusatz: Tab-Weg und Tasten | vom Seitenanfang: gewählte Option → Eigene Antwort schreiben → Beim Mandanten klären → Anderweitig geklärt → Zurückstellen → Speichern und weiter → Sachverhalt (Aufklapper) → Eintrag → Belege → Eintrag → Zahlungen …; Pfeil ↓ wählt die nächste Option; „Eigene Antwort schreiben" (Klick in `--step`, Enter in `choiceprompt--option-rows-with-links`) → Fokus im Feld „Eigene Antwort"; „Zurückstellen" → Dialog, Esc schließt, Fokus zurück auf „Zurückstellen" | ✓ |
| Zusatz: Zustände | `--step-loading-and-error`: oben „Sende …", Optionen gesperrt; unten Fehler-Callout in der Zone „Ihre Antwort", Wahl bleibt | ✓ |
| Zusatz: Zustand je Frage im Browser (`StepPaging`) | vorwärts: Wahl der dritten Option auf Frage 1 → Weiter → Frage 2 mit **ihrer** Vorauswahl; zurück → Frage 1 wieder mit ihrer Empfehlung. Notizmodus auf Frage 1, „Notiz zu Frage 1" getippt → Weiter → Frage 2 ohne Notizmodus ✓, aber Fokus auf „Beim Mandanten klären" von Frage 2; → Zurück → Frage 1 **wieder im Notizmodus, Feld leer**, Fokus im Feld (M6) | ✗ |
| Zusatz: Schnittstelle Zeichen für Zeichen | Props und Felder wie die Tabellen oben, `freeText.emptyHint` nachgetragen; Zeilen 0222 „Aufbau" (Zonen, Reihenfolge 1–11, Notizfläche) wie gerendert | ✓ |

#### Neue Mängel

6. **Notizmodus beim Blättern halb an die Frage gebunden, der Fokus springt.**
   `ClarificationCard.tsx:773–786`: `askingFor` hält die Id der Frage im
   Notizmodus über das Blättern hinweg, das Notizfeld selbst ist an
   `key={c.id}` gebunden (`:1110`) und wird beim Wechsel neu gemountet; der
   Fokus-Effekt kennt nur „war offen" (`wasAsking` als Boolean) und
   unterscheidet „Notiz geschlossen" nicht von „Frage gewechselt". Gemessen
   in `--step-paging` (s. Tabelle): vom Notizmodus aus weitergeblättert,
   landet der Fokus auf „Beim Mandanten klären" der neuen Frage statt dort,
   wo die Buchhalterin geblättert hat (bei zwölf Fragen am Pager-Knopf, bei
   J/K irgendwo); zurückgeblättert, steht die alte Frage wieder im
   Notizmodus, aber mit leerem Feld, und der Fokus wird hineingezogen.
   Zustand an zwei Orten mit zwei Lebensdauern (Linse Logik), Fokus ohne
   Zutun versetzt (Linse Bedienung). Vorschlag: den Notizmodus wie die
   Antwort an die Frage binden — beim Wechsel von `c.id` auf „zu" setzen —
   und den Fokus nur zurückgeben, wenn **dieselbe** Frage ihren Notizmodus
   schließt (`wasAsking` als Id: zurück auf den Weg nur bei
   `wasAskingId === c.id`). `StepPaging` um diesen Rundlauf ergänzen.

#### Hinweise (nicht blockierend)

Nummern fortlaufend zu denen vom 2026-10-24 (2 ist erledigt, 4 bleibt
vorbestehend):

- **Hinweis 1** (offen seit 2026-10-24): `StepAskClient` mit gesetzter
  `clientNote` beginnen (oder eine zweite Karte daneben), damit die
  Vorbelegung eine Story hat.
- **Hinweis 3** (offen seit 2026-10-24, jetzt gemessen): während `pending`
  sind „Eigene Antwort schreiben" (`ChoicePrompt.tsx:176`) und „Anderweitig
  geklärt" (`ClarificationCard.tsx:884`) bedienbar; der erste öffnet ein
  gesperrtes Feld und lässt den Fokus auf `BODY` fallen. „Zurückstellung
  aufheben" sperrt schon mit `pending` (`:905`) — dieselbe Regel für alle
  Wege.
- **Hinweis 5 · `as` in der M4-Zählung.** `ClarificationCard.tsx:986`
  `(rows as readonly unknown[] | undefined)`. Zählen über
  `evidenceGroups(evidence)` (wie M4 vorschlug) braucht keine Zusicherung,
  und dieselbe Funktion, die die Gruppen ordnet, sagt dann, ob es welche
  gibt.
- **Hinweis 6 · 640 px: die Antwortzone wird abgeschnitten.** Frage-Karte
  252 px, Zone innen 202 px; der Hauptknopf „Speichern und weiter
  Strg+Enter" ist 250 px breit und bricht nicht um, also stehen Optionen,
  „Warum empfohlen", Wege-Zeile und Fuß 48 px über die Zone, und
  `.v2card { overflow: clip }` schneidet 24 px ab („Strg+Ente", „Kredito");
  kein Querlauf der Seite. Ab 700 px kein Überstand. In der App greift unter
  1280 px L1 (Sperre); steht die Karte je schmaler, „Kontext" unter die
  Frage stellen (Container-Query an `.v2clc--step`, `v3.css:5002`).
- **Hinweis 7 · Fokus nach „Speichern und weiter".** `StepPaging`,
  `Strg+Enter` am Radio → nächste Frage, `activeElement` = `BODY` (der
  `ChoicePrompt` wird über `key` neu gemountet). Chrome hält den Startpunkt
  der Tab-Folge — ein Tab führt auf die erste Option der neuen Frage —, aber
  `Strg+Enter` auf `BODY` tut nichts, und eine Vorlesehilfe verliert den Ort.
  Wohin der Fokus beim Wechsel des Datensatzes unter einem `RecordPager`
  geht (etwa auf die Frage als `h2` mit `tabIndex={-1}`), ist ein
  Systementscheid für alle Pager-Abläufe (0223 ebenso) — an Owner/llcto.
- **Hinweis 8 · Esc im Notizmodus** tut nichts. Kein Dialog, also keine
  Pflicht; Esc wie „Doch selbst beantworten" läge nahe an der Hausregel
  „Esc schließt ohne zu speichern".

Vier Linsen: **Sprache** — Frage als Überschrift, Thema klein, „Ihre Antwort"
als Zonenkopf, das Feld ohne Optionen sagt „Antwort oder Anweisung für die
Buchung" statt „Antwort" zum zweiten Mal, Wege im Imperativ mit Objekt,
„optional" als Satz aus der Registry statt Badge, Sperrsatz der
Freitextfrage wieder wie 0028 ✓. **Bedienung** — Trefferflächen ≥ 24 px,
Kontrast Text ≥ 4,88:1, Zeichen 6,69:1, Fokusring ≥ 3,43:1 und an jedem
Zeilenanfang ganz, Tab-Weg Optionen → Wege → Knopf → Kontext, der Fokus folgt
dem Wechsel in die Notiz und zurück; beim Blättern aus dem Notizmodus springt
er (M6) ✗. **Logik** — ein Baustein, eine Enum-Prop, eine Gruppenordnung für
Kasten und Block, leere Evidenz ohne Spalte, die volle Karte bleibt Zeichen
für Zeichen; Notizmodus und Notiztext leben verschieden lange (M6) ✗.
**Darstellung** — drei Zonen über Linie, Fläche, Kopf und Abstand ohne
Farbton, zwei Karten mit Rand ohne Schatten oben bündig, Gruppenkopf und
Eintrag klar verschieden, Zeichen in der Spalte des Chevrons, kein hängender
Strich ✓. Vier-Wochen-Test: bestanden — wer Ludwig vergessen hat, liest
oben die Frage, unter „Ihre Antwort" die vorgewählte Zeile mit dem Wort
„empfohlen" und gleich darunter das Warum; der Hauptknopf nennt die Folge,
die Auswege stehen in Worten, nichts davon braucht Taste, Farbe oder Zeichen.

Abgenommen von / am: Claude (fremde Nachprüfung), 2026-10-26, Stand
`c848b6d` · **Nicht abgenommen.** Mängel 1–5 behoben, die fünf Kriterien des
Nachtrags Zonen erfüllt, die volle Karte unverändert. Offen: Mangel 6 (klein:
Notizmodus beim Id-Wechsel zurücksetzen, Fokus nur bei derselben Frage
zurückgeben, Rundlauf in `StepPaging`); Hinweise 1, 3, 5–8 (4 vorbestehend);
die Ablösung von `ClarificationDetail` ist offen (App).

## Nachbesserung 2026-10-26 (nach der Nachprüfung)

| Punkt | Behoben |
|---|---|
| M6 Notizmodus beim Blättern halb an die Frage gebunden, Fokus springt | `wasAskingFor` hält die **Kennung** der Frage, deren Notiz offen war, nicht ein Flag: der Fokus kehrt nur auf „Beim Mandanten klären" zurück, wenn dieselbe Frage ihre Notiz schließt. Kommt eine neue Frage unter die Karte, endet der Notizmodus (`useFocusOnNewRecord(…, onNew)`). Gemessen in `--step-paging`: Notiz auf Frage 1 → weiter → Frage 2 ohne Notiz → zurück → Frage 1 **ohne** Notizmodus |
| H7 Fokus auf `BODY` nach „Speichern und weiter" | Regel **I13** (Guideline, llcto 2026-10-26): lag der Fokus in der Karte oder ist er verloren, geht er auf die Überschrift der neuen Frage (`h2.v2clc__q`, `tabIndex={-1}`, ohne Ring); der Pager sagt „Frage 2 von 2" (Live-Region). Gemessen: `Strg+Enter` auf einer Option → Fokus `H2` der nächsten Frage, `Tab` → erste Option. Ein Fokus auf dem Pager-Pfeil bleibt dort; wird der Pfeil am Ende der Reihe zum gesperrten Platz, ist der Fokus verloren und geht auf die Überschrift |
| H8 Esc im Notizmodus tat nichts | Esc schließt die Notiz ohne zu speichern, wie „Doch selbst beantworten"; das Getippte bleibt; das Ereignis endet an der Notiz, ein Drawer um die Karte schließt nicht mit. Gemessen: Fokus zurück auf „Beim Mandanten klären", Text beim Wiederöffnen da |
| H3 Wege während des Speicherns bedienbar | „Eigene Antwort schreiben", „Beim Mandanten klären", „Anderweitig geklärt", „Zurückstellen" gesperrt, solange `pending` (gemessen in `--step-loading-and-error`: oben gesperrt, unten mit Fehler offen) — auch in der vollen Karte |
| H1 Vorbelegung ohne Story | `StepAskClient` zeigt darunter eine schon markierte Frage: Callout von Anfang an, Notizfeld mit der Notiz gefüllt |
| H5 `as` in der Zählung | gezählt über `evidenceGroups()`, ohne Zusicherung |
| H6 640 px schneidet die Antwortzone | nicht behoben, mit Grund: unter 1280 px Innenbreite greift die Sperre (L1); bei 700 px nicht mehr. Ausbau, falls ein schmaler Ort kommt: Container-Query an `.v2clc--step`, „Kontext" unter die Frage |
| H4 Minus als U+002D | vorbestehend im ganzen Set (`AmountCell`), eigene Aufgabe auf der Liste |

## Nachtrag 2026-10-26 — `yes_no` (Befund am Einbau, llcto)

Befund in der App (Demo-Mandant): eine Frage mit `answerKind: "yes_no"`
(„Im Rechnungsmonat buchen?") zeigte nur das Freitextfeld. Die Karte baute
ihre Optionen allein aus `answerOptions`, und die App füllt
`answer_options_json` nur bei Auswahlfragen; die Story „Ja/Nein" gab
`["Ja", "Nein"]` von Hand mit.

| Was | Entscheid |
|---|---|
| Optionen | bei `yes_no` immer zwei: Kennung `"yes"` / `"no"`, Wort „Ja" / „Nein" — Maschinenwerte englisch (CLAUDE.md). `answerOptions` gilt bei `yes_no` nicht: eine Frage, ein Satz Kennungen |
| Antwort | `onAnswer({ optionId: "yes" \| "no", text? })`; die App setzt auf ihr `answerPayload: { value: boolean }` um |
| Empfehlung | `recommendedOption` `"yes"`/`"no"` markiert und wählt vor; im Lesemodus heißt es „Empfehlung: Ja" (das Wort, nicht die Kennung) |
| Wege, Freitext | wie bei `single_choice`: „Eigene Antwort schreiben" hinter dem Textknopf, die Zeile der Wege |
| Wörter | keine Registry-Achse trägt sie (`input_tax_fact` hat Ja/Nein für einen Vorsteuer-Fakt, mit Grün/Rot — ein fremdes Wort mit fremder Farbe). „Ja"/„Nein" stehen einmal in der Karte (`YES_NO`); Befund L-368 an die App |
| Beide Varianten | auch die volle Karte zeigte bei `yes_no` ohne Optionen nur Freitext; sie bekommt dieselben zwei |

Story `StepYesNo` (fiktiv: „Soll die Rechnung im Rechnungsmonat Januar
gebucht werden?", empfohlen „Ja"); in `Answering` gibt die Ja/Nein-Karte keine
`answerOptions` mehr mit und meldet `optionId: yes`. Gemessen: Zeilen
„Ja empfohlen" · „Nein", vorgewählt `yes`, gesendet `optionId: yes`; volle
Karte `Ja=yes`, `Nein=no`.

Abnahmekriterien dazu (offen, fremde Abnahme):

- [ ] `yes_no` ohne `answerOptions`: zwei Optionen „Ja"/„Nein", `optionId` `"yes"`/`"no"`, „empfohlen" und Vorauswahl bei `recommendedOption` `"yes"`/`"no"`, Wege und „Eigene Antwort schreiben" wie bei single_choice (Story `StepYesNo`)
- [ ] M6: Notizmodus wandert beim Blättern weder vor noch zurück; Fokus springt nicht auf den Weg einer anderen Frage (Story `StepPaging`)
- [ ] I13: nach „Speichern und weiter" Fokus auf der Überschrift der neuen Frage, Pager-Zählung als Live-Region (Story `StepPaging`)
- [ ] Esc im Notizmodus schließt ohne zu speichern, Text bleibt (Story `StepAskClient`)
- [ ] Wege während `pending` gesperrt (Story `StepLoadingAndError`)

Status: zurück auf Abnahme (Nachprüfung von M6 und den zwei Nachträgen).

