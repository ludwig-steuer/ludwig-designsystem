# 0146 · Die Jahres-Belegliste aufräumen — und der Container wird breiter

| | |
|---|---|
| Status | **Abnahme** — gebaut 2026-09-09, fremde Abnahme steht aus |
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
kein Katalog; `identifier` bleibt für Sätze, die die Nummer brauchen — die
Hänger-Liste zeigt sie, weil dort der Dateiname die einzige Kennung ist.

Macht 170 px frei.

## 2 — Der Sachverhalt: nur die Nummer, und sie öffnet den Drawer

Heute steht dort „2026-0494 Sachverhalt: …". Der Titel ist bei diesen Zeilen
generisch (`caseTitle` fällt auf die Art zurück, wenn `title` fehlt — und der
Beleg-Katalog kennt die Art nicht, er setzt `kind: null`) und wird ohnehin
abgeschnitten. Was bleibt, ist die Nummer.

**`CaseCell` bekommt `layout="number"`** — eine dritte Ausprägung neben
`inline` und `stacked`: nur die Kennung, und **sie** ist der Link. Heute ist
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
      im Katalog und in `STUCK_COLUMNS` (`grep`)
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

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |

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
