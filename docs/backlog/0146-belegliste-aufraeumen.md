# 0146 · Die Jahres-Belegliste aufräumen — und der Container wird breiter

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-09, am selben Tag nachgearbeitet |
| Stufe | `entities/source-document/` (Spaltensatz) · `entities/accounting-case/` (`CaseCell`) · `styles/tokens.css` |
| Klassen-Test | entfällt — Änderungen an gebauten Bausteinen, keine neue Komponente |
| Quelle | Owner-Wünsche über `app-7b`, 2026-09-09, gesehen an `/clients/willems-sabine-2/2026/documents` (165 Belege) |
| Ersetzt | nichts — vier Änderungen an vorhandenen Bausteinen |
| Spec von / am | Claude, 2026-09-09 |

## Vier Punkte, ein Anlass

Der Owner hat sich die Jahres-Belegliste angesehen. Drei der vier Punkte
machen die Liste schmaler und einen Weg schärfer, der vierte gibt allen Seiten
mehr Platz.

## 1 — Die Spalte „Kennung" fällt aus dem Listensatz

In der Wirklichkeit steht dort bei der Mehrheit der Zeilen ein
GUID-Dateiname („40B503E7-AFD0-64… .pdf") — nichts, was jemand liest. Wo eine
echte Rechnungsnummer steht, ist sie in **dieser** Liste nicht die Frage: die
Liste beantwortet „ist mit dem Beleg noch etwas zu tun", nicht „wie heißt er".

**Sie fällt aus `DOCUMENT_LIST_COLUMNS`, nicht aus dem Katalog.** Ein Satz ist
kein Katalog; `identifier` bleibt für den Satz, der die Nummer einmal brauchen
wird.

*Berichtigt bei der Abnahme:* die erste Fassung dieses Absatzes sagte, die
Hänger-Liste zeige `identifier`. Sie zeigt **`fileName`** — was für einen
hängenden Beleg auch das Richtige ist, denn er hat oft nichts anderes. Die
falsche Aussage stand an drei Stellen, im Kriterium, im Kommentar am Code und
in der Commit-Botschaft; die ersten beiden sind berichtigt, die dritte bleibt
als Beleg dafür stehen, dass sie dort stand.

Macht 170 px frei.

## 2 — Der Sachverhalt: nur die Nummer, und sie öffnet den Drawer

Heute steht dort „2026-0494 Sachverhalt: …". Der Titel ist bei diesen Zeilen
generisch (`caseTitle` fällt auf die Art zurück, wenn `title` fehlt — und der
Beleg-Katalog kennt die Art nicht, er setzt `kind: null`) und wird ohnehin
abgeschnitten. Was bleibt, ist die Nummer.

**`CaseCell` bekommt `layout="number"`** — eine dritte Ausprägung neben
`inline` und `stacked`: die Kennung **statt des Titels**, und sie ist der Link. Heute ist
die Kennung ein `<code>` ohne Weg und der Titel trägt ihn; ohne Titel wäre
sonst kein Weg mehr da.

**Kein Auslöser-Prop.** Ein Drawer ist nach L3 eine URL, also reicht `href` —
der Aufrufer gibt einen Suchparameter statt einer Route, und mittlere
Maustaste, „in neuem Tab" und Neuladen funktionieren weiter. Ein `onOpen`
daneben wäre ein zweiter Weg für dieselbe Sache.

Track kann von 170 px auf 110 px.

## 3 — Der Gegenpart öffnet den Partner-Drawer, aber nicht als Wort

Owner-Entscheid 2026-09-09: **die Zeile führt weiter auf die Belegseite, ein
`peek` am rechten Rand öffnet den Partner-Drawer.** Nicht der Name selbst —
ein Bedienelement im Zeilen-Link wäre ein Knopf in einem Anker, und die
Tastatur bekäme zwei Stopps, die verschieden reagieren, ohne dass man ihnen
das ansieht (I11).

**Im Set ist dafür nichts zu bauen.** Der `peek` ist eine `RowAction` mit
`href`, die die Seite setzt; `BusinessPartnerDrawer` (0143) steht seit heute.
Was diese Aufgabe beiträgt, ist eine **Entscheidung** und ihre Begründung an
der Stelle, an der jemand sie sucht:

**In der Jahres-Belegliste trägt nur der Partner das Zeichen.** Die
Belegvorschau verliert es dort. Formal sind beide „zwei Ziele" — die Zeile
führt auf die Seite, das Zeichen in einen Drawer. Inhaltlich ist die Vorschau
aber **derselbe Gegenstand**: die Zeile führt auf die Belegseite, und dort ist
das Original Rang 2 und steht groß. Ein Drawer, der eine kleinere Fassung des
Zeilenziels zeigt, ist das, was I11 „ein Zeichen neben einem Klick, der
dasselbe tut" nennt — nur eine Handbreit davon entfernt.

Der Partner-Drawer beantwortet dagegen etwas, das die Belegseite **nicht**
beantwortet: dort steht der Name des Gegenparts, nicht seine Konten, nicht ob
dort überhaupt gebucht wird.

**Wo die Belegvorschau ihren Platz behält:** in jeder Liste, deren Zeile nicht
auf die Belegseite führt — die Belege am Sachverhalt etwa, wo die Zeile im
Sachverhalt bleibt. Die Story `RowAndPeek` bleibt dafür stehen und sagt den
Unterschied künftig selbst.

## 4 — `--container-app` von 1440 px auf 1760 px

Owner-Entscheid: **Deckel höher, nicht weg.** Der Grund für den Deckel bleibt
gültig — auf 27" reißen Spalten auseinander und das Auge verliert die Zeile —,
aber 1440 px ist zu eng für eine Liste mit zehn Spalten. 1760 px ist die
Breite, bei der die Belegliste vollständig steht, ohne dass Fließtext auf
Doppelmonitoren zerläuft.

## Der Zusatzbefund: ein Netz, das nur greift, wenn man es spannt

`app-7b` hat gesehen, dass die Tabelle bei 1456 px rechts **abgeschnitten**
wird und der Rahmen nicht horizontal scrollt. Die Ursache liegt in der App —
sie übergibt kein `minWidth` an `DataTable` —, aber die Frage gehört hierher:
`sourceDocumentMinWidth(cols)` existiert, ist exportiert, und die Seite fährt
trotzdem ohne. Ein Netz, das nur greift, wenn der Aufrufer es ausdrücklich
spannt, fängt genau die nicht auf, die es vergessen.

**Zu entscheiden ist, ob `DataTable` sich die Mindestbreite selbst holt**, wenn
alle Spalten eine feste oder eine `minmax()`-Breite haben — dann wäre die Prop
eine Übersteuerung statt einer Pflicht. Das ist eine eigene Aufgabe an 0057;
hier steht es als Befund, weil es hier aufgefallen ist.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `CaseCell.layout` | `"inline" \| "stacked" \| "number"` | nein | **Neuer Wert `number`**: die Kennung **statt des Titels**, und sie trägt den Weg. Für Listen, in denen der Sachverhalt eine Nebenspalte ist und sein Titel nichts sagt. Sie ersetzt den Titel, **nicht mehr** — Zustand und Betrag hängen weiter an ihren eigenen Props | `NumberOnly` |

Sonst nichts: Punkt 1 ändert einen Satz, Punkt 3 ändert nur Text, Punkt 4 ein
Token.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente; Status nur über Registry
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen

Variabel (aus dieser Spec):

- [ ] `identifier` steht **nicht** mehr in `DOCUMENT_LIST_COLUMNS`, aber weiter
      im **Katalog** (`grep`). **Nicht** in `STUCK_COLUMNS` — die hat ihn nie
      geführt, sie zeigt `fileName`
- [ ] `layout="number"` zeigt die Kennung **statt** des Titels, und sie ist der
      Link (`NumberOnly`, DOM: `<a><code>`, kein Titel-Text)
- [ ] `showState` wirkt weiter: `number` **plus** `showState` zeigt den Chip,
      `number` plus `showState={false}` nicht (`NumberOnly`, beide Zeilen)
- [ ] `layout="inline"` und `"stacked"` sind zeichengleich mit vorher
- [ ] Die `case`-Spalte des Beleg-Katalogs nutzt `number` und ist 110 px breit;
      die Zeilenhöhe bleibt bei 48 px (gemessen — der 71,7-px-Ausreißer aus der
      Abnahme von 0070 war genau diese Zelle)
- [ ] `--container-app` ist 1760 px, und der Kommentar darüber sagt, warum es
      einen Deckel gibt **und** warum er dort liegt
- [ ] Der Befund zu `minWidth` steht in `docs/befunde-app.md`

## Abnahme

Fremde Abnahme am 2026-09-09 (zweiter Agent, hat nicht gebaut). Schlanke
Abnahme nach dem Owner-Entscheid vom 2026-09-08; die Zeilenhöhe ist trotzdem
gemessen, weil sie das Kriterium selbst ist.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| **Fest** | | |
| `pnpm typecheck` und `pnpm build` grün | beide am 2026-09-09 gelaufen, `exit 0` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `CaseCell` trägt beide (`CaseCell.tsx:22–26`); die neuen Kommentare an `:51–63`, `:86–88` und in `source-document-columns.tsx:86–92`, `:375–380`, `:405–410` sind englisch. Die zwei deutschen Kommentare in `CaseCell.tsx` (`:104`, `:110`) sind Bestand, nicht aus dieser Aufgabe | ✓ |
| Kein Hex, kein px in der Komponente; Status nur über Registry | `CaseCell` bringt kein px und kein Hex mit; die 110 px sind eine **Spurbreite** im Katalog (`source-document-columns.tsx:380`), wie bei jeder Nachbarspalte. `1760px` in `tokens.css:226` ist die Token-Definition selbst. Der Chip kommt aus `StatusBadge axis="sachverhalt"` (`CaseCell.tsx:114`) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen; die zwei App-Punkte übersprungen (backlog/README). Kontrast und Trefferfläche gehen an 0119 | ✓ |
| Im Browser angesehen | eigener Lauf des Abnehmenden mit `scripts/cdp.mjs` gegen 6107: `DocumentList` bei 1500 px, `NumberOnly` bei 900 px | ✓ |
| **Schnittstelle Zeichen für Zeichen** | | |
| `CaseCell.layout`: `"inline" \| "stacked" \| "number"`, optional, Vorgabe `inline` | `CaseCell.tsx:65` (Union) und `:32` (Vorgabe). Genau ein neuer Wert, keine zweite Prop dazu — die Spec-Tabelle und der Code sagen dasselbe, samt dem Satz „sie ersetzt den Titel, **nicht mehr**" (`:59–63`) | ✓ |
| Sonst nichts | `git show a5e28af` ändert an Props nichts weiter; Punkt 1 ist ein Satz, Punkt 3 nur Text in `RowAndPeek`, Punkt 4 ein Token | ✓ |
| **Variabel** | | |
| `identifier` **nicht** mehr in `DOCUMENT_LIST_COLUMNS`, aber weiter im Katalog **und in `STUCK_COLUMNS`** | Aus dem Listensatz raus ✓ (`:81–100`, mit Begründung an der Stelle). Im Katalog geblieben ✓ (Union `:46`, `ORDER` `:65`, Spaltendefinition `:332–357`). **In `STUCK_COLUMNS` steht sie nicht** (`:137–144`: `fileName`, `classification`, `counterparty`, `receivedDate`, `case`, `stuckState`) — und stand nie darin: der Commit fasst `STUCK_COLUMNS` nicht an. Was dort die Identität trägt, ist die Spalte **`fileName`**, nicht `identifier` | ✗ |
| `layout="number"` zeigt die Kennung **statt** des Titels, und sie ist der Link | `NumberOnly` im DOM gemessen: `<a class="v2case__link"><code class="v2case__no">2026-0412</code></a>` — kein Titel-Text, obwohl die Story ausdrücklich den langen Titel `LANG` (58 Zeichen) mitgibt. Code `:89–94` | ✓ |
| `showState` wirkt weiter: `number` **plus** `showState` zeigt den Chip, ohne ihn nicht | `NumberOnly`, **beide** Zeilen gemessen: Zeile 1 `„2026-0412 Zur Prüfung"`, Zeile 2 (`showState={false}`) `„2026-0412"`. Das ist der Beweis für die orthogonale Lesart, und er steht in **einer** Story nebeneinander | ✓ |
| `layout="inline"` und `"stacked"` zeichengleich mit vorher | der Diff verschiebt die zwei alten Zeilen (`<code>` + `<Link title>`) unverändert in den `else`-Zweig; keine andere Änderung am Rumpf | ✓ |
| Die `case`-Spalte nutzt `number`, ist 110 px breit, Zeilenhöhe bleibt 48 px | `:380` `width: "110px"`, `:410` `layout="number"`, `:404` `showState={false}`. `DocumentList` bei 1500 px gemessen: Zeilenhöhen **47–48 px** über alle Zeilen, Spaltenköpfe ohne „Kennung" (Gegenpart · Belegart · Betrag · Belegdatum · Sachverhalt · Eingang · Einordnung · Verarbeitung · Erledigt). Der 71,7-px-Ausreißer aus 0070 M2 ist weg | ✓ |
| `--container-app` ist 1760 px, mit Kommentar, warum es einen Deckel gibt und warum er dort liegt | `src/styles/tokens.css:219–226` — beide Sätze stehen da, der alte Grund und der neue Wert mit Datum | ✓ |
| Der Befund zu `minWidth` steht in `docs/befunde-app.md` | `:49` als **L-273**, mit der Frage an 0057 dahinter | ✓ |
| **Ränder** (Nachtrag 2026-09-08) | | |
| „die Kennung **statt des Titels**, und sie ist der Link" (Abschnitt 2) | Die Schnittstellen-Tabelle ist nachgezogen („ersetzt den Titel, nicht mehr"), der Absatz darüber **nicht** — er behauptet weiter die Lesart, die „Gebaut" ausdrücklich verworfen hat („die Spec sagt es jetzt auch"). Sie sagt es an einer von zwei Stellen | ✗ |
| Kommentar an `DOCUMENT_LIST_COLUMNS` | `source-document-columns.tsx:91` sagt „`STUCK_COLUMNS` keeps showing it" über `identifier` — tut es nicht (siehe oben). Derselbe Satz steht in der Commit-Botschaft und im Kriterium; gemeint ist `fileName` | ✗ |

Abgenommen von / am: zweiter Agent (nicht der Bauende), 2026-09-09 · Offene
Punkte: **zwei**, beide sprachlich, keiner im Verhalten —

1. `identifier` steht nicht in `STUCK_COLUMNS`. Entweder nimmt der Satz nach
   (Kriterium, Kommentar `:91`, Commit-Botschaft: es ist `fileName`, das dort
   die Identität trägt), oder die Spalte kommt wirklich dazu. Der Code ist
   heute in sich schlüssig — nur der Satz daneben nicht.
2. Abschnitt 2 der Spec sagt weiter „nur die Kennung"; die Tabelle sagt
   „ersetzt den Titel, nicht mehr". Eine der beiden Fassungen gewinnt.

## Gebaut 2026-09-09

Vier Änderungen, eine neue Story, ein Befund — und eine Formulierung dieser
Spec, die beim Messen nicht hielt.

**Gemessen** (`scripts/cdp.mjs`, 1500 px, Story `RowAndPeek`):

| Was | Vorher | Jetzt |
|---|---|---|
| Spalten | mit „Kennung" | **ohne** — Gegenpart · Belegart · Betrag · Belegdatum · Sachverhalt · Eingang · Einordnung · Verarbeitung · Erledigt · Aktionen |
| Sachverhalts-Zelle | „2026-0412 Sachverhalt: …" | **„2026-0412"**, und die Kennung trägt den Anker (`<a><code>`) |
| Zeilenhöhe | 71,7 px in der Zeile mit Sachverhalt, sonst 48 | **47–48 px durchgehend** |

Der letzte Punkt ist der, den die Abnahme von 0070 als Mangel M2 gemeldet und
als „Befund für `CaseCell`, nicht als Spurbreite" vertagt hatte. Er ist jetzt
**weg, nicht verwaltet**: ohne Titel gibt es nichts, was umbrechen könnte. Die
alte Notiz an der Spalte („Stays 170. Widening does not help…") stand
anderthalb Tage und beschrieb eine Zwangslage, aus der eine Zeile weniger
Inhalt herausführte.

**Was diese Spec zu stark gesagt hat.** Sie schrieb, `layout="number"` zeige
„nur die Kennung". Die Messung zeigte den Zustands-Chip daneben — `showState`
ist eine eigene Prop und wirkt weiter. Zwei Lesarten waren möglich: `number`
unterdrückt alles andere, oder es ersetzt den **Titel**. Gebaut ist das zweite,
und die Spec sagt es jetzt auch: zwei Props, die sich heimlich überstimmen,
sind schlimmer als eine, die weniger tut, als ihr Name verspricht. Der
Beleg-Katalog setzt `showState={false}` selbst dazu.

**Punkt 3 hat keinen Code gekostet**, wie erwartet — der `peek` ist eine
`RowAction` der Seite. Was er gekostet hat, ist ein Absatz in `RowAndPeek`:
die Story sagt jetzt selbst, warum das Zeichen in der Jahres-Belegliste dem
Partner gehört und nicht der Belegvorschau, und für welchen Fall sie selbst
stehen bleibt.

**Der Zusatzbefund ist eingetragen** als **L-273**, mit der Frage an 0057
dahinter: kann `DataTable` sich die Mindestbreite selbst holen, wenn alle
Spalten eine feste oder eine `minmax()`-Breite tragen? Dann wäre die Prop eine
Übersteuerung statt einer Pflicht — und fängt die auf, die sie vergessen.

## Nacharbeit zur Abnahme, 2026-09-09

Drei Mängel, zwei davon dieselbe falsche Aussage.

**`STUCK_COLUMNS` hat `identifier` nie geführt.** Ich hatte geschrieben, die
Spalte bleibe „im Katalog und in `STUCK_COLUMNS`" — der zweite Teil war
erfunden. Die Hänger-Liste zeigt `fileName`, was für einen hängenden Beleg
auch das Richtige ist: er hat oft nichts anderes. Die falsche Aussage stand an
**drei** Stellen — im Kriterium, im Kommentar am Code und in der
Commit-Botschaft. Die ersten beiden sind berichtigt; die dritte bleibt stehen,
weil eine Commit-Botschaft dokumentiert, was gedacht wurde, nicht was gilt.

Bemerkenswert daran: ich habe eine Konstante beschrieben, ohne sie
aufzuschlagen. Sie steht sieben Zeilen unter der, die ich geändert habe.

**Der Absatz über der Schnittstellen-Tabelle** sagte weiter „nur die Kennung",
während die Tabelle schon „ersetzt den Titel, nicht mehr" sagte — ich hatte
die Tabelle nachgezogen und den Fließtext daneben nicht. Genau der Fund vom
2026-09-08, in derselben Spec, in der ich ihn zitiere.
