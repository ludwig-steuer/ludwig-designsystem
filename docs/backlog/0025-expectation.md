# 0025 · Expectation — die Erwartung als Chip und Zeile

| | |
|---|---|
| Status | Abnahme |
| Freigabe | 2026-09-06, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/expectation/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein, „was noch fehlt" hängt am Sachverhalt |
| Quelle | Soll-Katalog §11.7 Stufe 3 „Erwartung — fehlt (§3.1)"; `ui-repraesentationen.md` §3.2 Nr. 2 |
| Ersetzt | `FehltPanel.tsx` (Sachverhalt-Detail) samt seiner lokalen `KIND_LABEL`/`MATURITY_LABEL` und die Erwartungs-Zeilen in `Schritt5Liste.tsx` (Abnahme-Schritt 5). Portal, `document-requests` und die Schritte 1/2 sind mit dem Seiten-Rückbau entfallen |
| Blockiert | Sachverhalt-Detail (`FehltPanel`) und Abnahme-Schritt 5 |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

„Es fehlt noch etwas" ist in Ludwig ein Datensatz mit Frist, Reife und
Eskalationsstufe — sichtbar ist davon fast nichts. Die Sachbearbeiterin liest
heute abgeleitete Sätze („3 Nachforderungen"), sieht aber nicht, welche
Erwartung seit wann überfällig ist. Die Statusachse gibt es, die Darstellung
nicht.

## Einordnung

- **Wiederverwenden:** `StatusBadge` zeigt die Reife, sobald jemand sie
  hineinreicht — aber nicht, worauf gewartet wird, seit wann und bei wem.
  `Badge` allein wäre ein Ton ohne Aussage.
- **Neue Entitäts-Form, weil:** Regel 5 — `ui-repraesentationen.md` §3.1
  führt „Erwartung" ohne jede Darstellung, §3.2 stellt sie an Platz 2.
- **Zuschnitt:** Familie in einer Datei: `ExpectationChip` (XS, inline neben
  einem Sachverhalt) und `ExpectationRow` (S, in der Liste der offenen
  Punkte). Beide zeigen dieselben Felder in zwei Dichten.
- **Setzt auf:** `StatusBadge` (Achsen `erwartung` und `erwartung_art` — beide
  im Spiegel vorhanden), `Time`, `AmountCell`, `TextButton` (0011).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `expectation` | `Expectation` | ja | Der Datensatz (Felder unten) | `Row` |
| `today` | `string` | nein | Bezugstag für die Reife; Default heute | `Maturities` |
| `onResolve` | `(id: string) => void` | nein | „Erledigt" — ohne die Prop nur Anzeige | `Interactive` |
| `onOpen` | `(id: string) => void` | nein | Sprung in den Sachverhalt | `Interactive` |

Felder aus `ludwig.client_accounting_case_expectation`: `kind`
(`"document" \| "payment"`, im Spiegel als `ExpectationKind`), `dueDate`,
`escalationLevel`, `resolvedAt`, `expectedAmount`, `expectedCounterpartyName`,
`expectedDocumentKind`, `audience`, `note`.

**Die Reife wird nicht gerechnet, sondern geholt:**
`expectationMaturity({ dueDate, escalationLevel, resolvedAt, today })` steht
bereits in `src/ludwig/modules/accounting-cases/domain/case.ts`. Eine zweite
Ableitung in der Komponente wäre genau die zweite Wahrheit, die der Kommentar
dort verbietet.

Label deutsch, Code englisch: `expectation` im Code, „Erwartung" im UI, in der
mandantengerichteten Ansicht „Nachforderung" (GLOSSARY: `document request`).

Was die Familie **nicht** kann: einen offenen Saldo zeigen (den rechnet
`loadCaseOpenPayments`, nicht die Erwartung), mahnen, und `escalationLevel`
niemals als DATEV-Mahnstufe ausgeben.

## Verhalten

Server-Component ohne Callbacks. Die Reife trägt Farbe **und** Wort (V7):
`pending` neutral, `due` Warnung, `escalated` stark, `resolved` erledigt. Die
Frist steht absolut („fällig 12.07.2026"), nicht relativ (T7). `audience`
entscheidet nur das Wort — „Nachforderung" beim Mandanten, „Erwartung" in der
Kanzlei —, nicht die Farbe. Der Chip ist nicht klickbar, solange kein
Callback kommt, und bekommt dann auch keinen Hover (§2).


## Vor dem Bau eingearbeitet (2026-09-06)

**(b) `currency` ist eine Prop.** Wie bei `CaseTimeline` (L-23): der Betrag
weiß nicht, in welcher Währung er steht, und die Komponente rät nicht.

**(c) `ExpectationVM` liegt lokal**, strukturell gleich dem `ExpectationRow`
der App (`application/expectation-core.ts`). Nicht erfunden, sondern
abgeschrieben — und der Grund steht als **L-70** im Register: der Typ liegt
drüben in `application/`, nicht in `domain/`, und wird deshalb nicht
gespiegelt. Sobald er umzieht, fällt die lokale Definition weg. `CaseTimeline`
(0040) bekommt denselben Typ, wenn es so weit ist.

**(d) `Time` statt `Timestamp`** — das ist der Baustein, der seit 0033 „wann"
sagt.

**(e) „leer" ist beim Chip nicht anwendbar** und deshalb keine Story: der Chip
**ist** eine Erwartung. Keine Erwartung heißt kein Chip, nicht ein leerer —
ein Platzhalter für etwas, das es nicht gibt, wäre eine Behauptung. Die
Leerheit gehört der Liste darüber, und die zeigt sie in `Empty`.

**Zu den Wörtern:** `FehltPanel` trägt heute zwei lokale Maps —
`MATURITY_LABEL` („Frist läuft", „überfällig", …) und `KIND_LABEL`
(„Rechnung", „Beleg / Quittung", …). Die erste ersetzt die Registry-Achse
`erwartung` wortwörtlich („Läuft", „Fällig", „Eskaliert", „Erledigt"); die
zweite hat **keine** Achse — `expectedDocumentKind` ist ein freier String der
DB. Die Komponente zeigt ihn deshalb, wie er kommt, und der Aufrufer reicht
seine Wörter über `documentKindLabel` herein: eine Map in der Komponente wäre
die dritte Wahrheit.
## Stories

Titel `v3/Entitäten/Erwartung/Expectation`. Abgeleitet nach §6: 3 Zustände
(gefüllt, leer, Fehler) + 1 Enum (`kind`) + 1 Callback + 1 „im Einsatz"
+ 1 Rand (Reifen nebeneinander) = 7.

| Story | Beweist |
|---|---|
| `Chip` | vier Chips: Beleg und Zahlung, offen und überfällig |
| `Row` | Zeile mit Art, Gegenpartei, Betrag, Frist, Reife |
| `Maturities` | alle vier Reifen nebeneinander — Wort trägt, nicht Farbe |
| `Empty` | „Nichts offen." in der Liste |
| `Error` | Laden fehlgeschlagen |
| `Interactive` | „Erledigt" nimmt die Zeile aus der Liste |
| `InCase` | drei Erwartungen in der Sachverhalt-Karte, wie im Detail |

Nicht anwendbar: `LeerNachFilter` — filtern tut die Liste darüber. **`Lädt`** —
die Erwartung bekommt ihre Daten als Prop; wer sie lädt, zeigt das an seiner
Stelle (die Liste, die Karte, der Sachverhalt). Eine Skeleton-Story hier hieße,
die Zeile könne warten — sie kann nur zeigen.

## Abnahme

Gemessen am laufenden Storybook (`http://localhost:6107`) über CDP, nicht aus
der Quelle zurückgelesen. Story-IDs unter `v3-entitäten-erwartung-expectation--…`.

**Fest**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` Exit 0 · `Storybook build completed successfully`, Exit 0 · zusätzlich `pnpm check:icons` „in Ordnung, 53 Zeichen" | erfüllt |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `entities/expectation/Expectation.tsx` mit `Expectation.stories.tsx` daneben · Titel `v3/Entitäten/Erwartung/Expectation` · Barrel `index.ts:466` unter dem Kommentar „Erwartung — was noch fehlt, als Chip und als Zeile (0025)" | erfüllt |
| Code englisch; `@when`/`@instead` an jedem Export | Beide Funktions-Exporte tragen beide Zeilen; der Typ-Export `ExpectationVM` trägt nur den Doku-Block — wie `CaseTimelineExpectation` und `CaseTimelineEntry`, also Hauspraxis. Zwei **deutsche** Kommentare im Code (Z. 100/101 und 162/163) → **M3** | mit Mangel |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Grep über die Komponente: kein Hex, kein `px`, kein `fontSize`; alle Maße stehen in `v3.css`. Die Wörter der Belegarten kommen über `documentKindLabel` vom Aufrufer, keine Map im Modul. Reife und Art ausschließlich über `StatusBadge`; gemessener Tooltip aus der Registry: „Reife: Fällig · Die Frist ist verstrichen. Der Sachverhalt zählt wieder als offene Arbeit." Zu `audienceWord()` siehe **M5** | erfüllt |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Genau die sieben Stories der Spec stehen in `storybook-static/index.json` (`chip`, `row`, `maturities`, `empty`, `error`, `interactive`, `in-case`). Ableitung nach §6 geht auf: 3 Zustände + 1 Enum + 1 Callback-Story + 1 im Einsatz + 1 Rand = 7. `LeerNachFilter` ist begründet, „leer" beim Chip auch (e); **„lädt" ist ohne Begründung ausgelassen** → **M4** | mit Mangel |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Farbe nur als Kritikalität, Vorzeichen ohne Farbe, Zahlen rechts mit `tnum` (`.v2num`), nichts zentriert, kein Icon ohne Wort, Fokusring gemessen (`2px solid rgb(59,143,196)`), Hauptweg per Tastatur (vier Knöpfe, `tabIndex 0`), Hover nur am Klickbaren (Chip: `cursor: auto`, kein Knopf). **Zeilenhöhe ≤ `.v2tbl__row`** reißt: `.v2tbl__row` liegt bei ~42 px, die Erwartungszeile misst in der echten Spaltenbreite 88 px, mit langem Firmennamen 151 px, bei 1280 px Fenster 109–130 px → **M1** | nicht erfüllt |
| Im Browser angesehen, nicht nur gebaut | Alle Zahlen dieser Abnahme stammen aus CDP-Läufen gegen `localhost:6107` (Story-Iframe, echte Klicks im `Interactive`) | erfüllt |

**Variabel**

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Reife kommt aus `expectationMaturity`, nicht aus der Komponente | `Expectation.tsx:1-4` importiert aus `@/ludwig/modules/accounting-cases/domain/case`; beide Exporte rufen `expectationMaturity({ ...expectation, today })`, im Modul steht keine zweite Ableitung (kein Datumsvergleich, kein Schwellwert) | erfüllt |
| Reife steht als Wort, nicht nur als Farbe (V7) | `--maturities`, vier Zeilen gemessen: „Läuft" (`bdg-neutral`), „Fällig" (`bdg-warning`), „Eskaliert" (`bdg-danger`), „Erledigt" (`bdg-success`) — jede trägt ihr Wort, dazu den Erklärsatz der Achse im `title` | erfüllt |
| Status ausschließlich über die Registry-Achse `erwartung` (R1) | `StatusBadge axis="erwartung"` in Chip und Zeile; die Art zusätzlich über `erwartung_art`, so in der Einordnung vorgesehen. Kein eigener Statustext, keine eigene Farbwahl | erfüllt |
| Frist absolut, nicht „in 3 Tagen" (T7) | `--row` und `--in-case` gemessen: „fällig 20.09.2026", „fällig 11.08.2026", „fällig 31.08.2026" — `Time format="date"`, nie relativ | erfüllt |
| `escalationLevel` erscheint nirgends als Mahnstufe | Grep über die Datei: der Wert kommt nur im Typ (Z. 41) vor und fließt in `expectationMaturity`; kein Render, keine Zahl im Markup | erfüllt |
| Ersetzt `FehltPanel` und die Zeilen in `Schritt5Liste` | offen (App) — laut Spec nicht Gegenstand dieser Abnahme | offen |

**Zwei Entscheide aus „Gebaut" nachgemessen**

| Aussage | Nachmessung | Ergebnis |
|---|---|---|
| „Der Betrag steht nur bei `payment`" | `--chip`: zwei Beleg-Chips ohne Zahl („Rechnung"), zwei Zahlungs-Chips mit `<span class="v2num">412,00 €</span>` | bestätigt |
| „Spaltenkanten bei 37 · 153 · 478 · 593, in jeder Zeile dieselben" | `--in-case` bei 1440: Kanten 37 · 153 · 356 · 478 · 593 · 715, in allen drei Zeilen gleich — **im Story-Rahmen von 720 px**. Auf der Seite gilt das nicht mehr, siehe **M1** | im Rahmen bestätigt, auf der Seite nicht |

**Maße gegen den Wertebereich, nicht gegen die Fixtures** — hier stimmt es:

| Feste Spur | Breite | Größter Wert des Bereichs | Ergebnis |
|---|---|---|---|
| Art (`erwartung_art`) | 104 px | „Zahlung offen" 94 px, „Beleg fehlt" 77 px; die Achse hat genau zwei Werte | passt |
| Reife (`erwartung`) | 110 px | „Eskaliert" 65 px, der breiteste von vieren | passt |
| Betrag | 110 px | `1.234.567,89 €` misst 102 px und bricht nicht (geschütztes Leerzeichen) | passt |

**Rundlauf `Interactive`** (echte Klicks, je Schritt ein eigener Aufruf): Start
`3 offen · Geöffnet: nichts` → Klick auf den Titel → `Geöffnet: e1`, Zeilenzahl
unverändert 3 → Klick „Erledigt" → `2 offen`, die Zeile verschwindet, die
übrigen zwei stimmen. Beide Callbacks der Schnittstelle sind damit bewiesen.

### Mängel

**M1 · blockiert · Die Zeile passt nicht in die Spalte, in der sie steht.**
Kriterium: Prüfliste §9 (Zeilenhöhe ≤ `.v2tbl__row`) und der Nachtrag „Die
erste Spalte hat eine feste Breite" aus „Gebaut".
Messung: Die festen Spuren summieren sich auf **537 px** (104 + 110 + 103 + 110
+ 50 + fünf Zwischenräume à 12) — so breit ist die Zeile mindestens, **bevor**
der Titel ein Pixel bekommt. Im Sachverhalt-Detail hat die Detailspalte
gemessen 644 px bei 1440 und **484 px bei 1280** (`.v2md--detail-breit` =
`minmax(0,440px) minmax(0,1fr)`, gemessen an `casedetailview--in-use` im echten
App-Rahmen); in der Karte bleiben davon 604 bzw. 444 px.
- bei 644 px Karte: Titelspur nur 106 px, Zeilenhöhe **88 px** — drei Zeilen für
  „Rechnung · Bürobedarf Meier GmbH"; mit einem echten Firmennamen
  („Elektro-Großhandel Nordwest Verwaltungs GmbH & Co. KG") 151 px.
- bei 484 px Karte, also an der L1-Untergrenze 1280: Titelspur **0 px**, der
  Titel läuft mit 74–80 px aus seiner Spur in die Betragsspalte (Titel bei
  x = 132, Betrag bei x = 144), die Zeile ist 538 px breit in einem 484 px
  breiten Behälter, die Karte scrollt waagerecht (495 gegen 482) und die Zeilen
  sind 109–130 px hoch.
Das ist genau der Fall, den der Kommentar an `.v2case` (0095) schon einmal
beschreibt. Die Nachmessung in „Gebaut" reproduziert exakt — aber nur im
Story-Rahmen von 720 px, den es auf der Seite nirgends gibt.
Vorschlag: Der Titel bekommt den Vorrang —
`grid-template-columns: 104px minmax(0, 1fr) max-content max-content max-content max-content`,
Betrag, Reife und Handlung nach Inhalt statt fest; die Titelzeile selbst
(Knopf bzw. Text, nicht die Spalte mit der Notiz darunter) bekommt
`white-space: nowrap; overflow: hidden; text-overflow: ellipsis` wie `.v2case`,
damit ein langer Firmenname kürzt statt umzubrechen. Dazu eine Story, die die
Zeile in 484 px zeigt, damit die nächste Messung nicht wieder gegen den Rahmen
läuft.

**M2 · blockiert · `currency` rät.**
Kriterium: Spec, „Vor dem Bau eingearbeitet (b)": „`currency` ist eine Prop.
Wie bei `CaseTimeline` (L-23): der Betrag weiß nicht, in welcher Währung er
steht, und die Komponente rät nicht."
Messung: `Expectation.tsx:83` und `:122` setzen `currency = "EUR"` als Vorgabe,
die Prop ist als `currency?: Currency` optional. `CaseTimeline.tsx:103` führt
sie dagegen als `currency: Currency` ohne Vorgabe. Keine der sieben Stories
reicht die Prop herein — es gibt für sie also auch keinen Nachweis.
Vorschlag: `currency: Currency` in beiden Exporten verpflichtend, ohne Default;
die Stories geben `currency="EUR"` ausdrücklich an.

**M3 · blockiert nicht · Zwei deutsche Kommentare im Code.**
Kriterium: fester Block „Code englisch" (`CLAUDE.md`: Kommentare englisch,
Deutsch nur in Nutzertexten; Story-JSDocs bleiben deutsch).
Messung: `Expectation.tsx` Z. 100/101 („Der Betrag steht nur bei einer
Zahlung …") und Z. 162/163 („Absolut, nicht „in drei Tagen" …"). Die Stories
sind in Ordnung, deren JSDocs dürfen deutsch bleiben.
Vorschlag: beide Kommentare übersetzen; die deutsche Begründung steht ohnehin
in Spec und `v3.css`.

**M4 · blockiert nicht · Der ausgelassene Zustand „lädt" ist nicht begründet.**
Kriterium: fester Block „ausgeschlossene Zustände begründet" (§6: jeder
ausgeschlossene Zustand steht in der Spec mit Grund).
Messung: Die Spec begründet `LeerNachFilter` („filtern tut die Liste darüber")
und „leer" beim Chip (e). Zu „lädt" steht nichts, und eine Skeleton-Story gibt
es nicht.
Vorschlag: ein Satz im Abschnitt „Stories" — die Zeile bekommt ihre Daten
fertig gereicht, das Laden gehört der Liste darüber. Kein Code.

**M5 · kein Mangel, nur vermerkt** — `audienceWord()` bildet zwei DB-Werte auf
zwei deutsche Wörter ab, ohne Achse dahinter. Das ist dieselbe Form, die die
Komponente für `expectedDocumentKind` ausdrücklich ablehnt; sie ist hier
gedeckt, weil die Freigabe (Entscheid 1) genau diese zwei Wörter benennt.
Wenn `audience` je eine Registry-Achse bekommt, gehört die Zuordnung dorthin.

Abgenommen von / am: fremde Abnahme (Claude, ohne Bau und ohne Chatverlauf) ·
2026-09-07 · Ergebnis: **zurück**. Offene Punkte: **M1** und **M2** blockieren,
**M3** und **M4** laufen mit; **M5** ist nur vermerkt.

## Freigabe (2026-09-06, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Grundlagen im Spiegel vollständig (`ExpectationKind`, `ExpectationMaturity`, `expectationMaturity()`, Achsen `erwartung` und `erwartung_art`). Bildschirme nach dem Seiten-Rückbau: Sachverhalt-Detail (`FehltPanel`, 0040 `InUse`) und **Abnahme-Schritt 5** (`Schritt5Liste.tsx`, baut seit F123 aus Ludwigs Erwartungen). Portal, `document-requests` und Schritt 1/2 fallen weg.

Entscheide: 1 Wort hängt an `audience`, aber mit der richtigen Bedeutung — `audience` sagt, **wer die Unterlage besorgt** (`client` → „Nachforderung", `accounting` → „Erwartung"), nicht wer sie ansieht · 2 Betrag nur bei `payment` · 3 keine Frist-Handlung, das Quittieren in Schritt 5 ist ein Check.

Vor dem Bau in die Spec: (a) `Ersetzt`/`Blockiert`/Kriterien auf `Schritt5Liste.tsx`, `FehltPanel.tsx`, 0040 `InUse` umschreiben; (b) Prop `currency: Currency` (L-23, wie `CaseTimeline`); (c) Typ: `ExpectationVM` in dieser Datei, strukturell gleich `ExpectationRow` der App; 0040 importiert ihn künftig (kleiner Nachtrag dort); (d) `Timestamp` → `Time`; (e) für den Chip „leer" als nicht anwendbar begründen.

Befunde ins Register: **L-70** — `ExpectationRow` samt `ExpectationAudience`, `DueSource`, `ExpectationDirection` von `application/expectation-core.ts` nach `modules/accounting-cases/domain/` heben (Muster L-09).

## Gebaut (2026-09-06)

`entities/expectation/Expectation.tsx` mit zwei Exporten
(`ExpectationChip`, `ExpectationRow`) und dem Typ `ExpectationVM`, Klassen
`.v2exp*` in `v3.css`, sieben Stories, Server-Component.

### Zwei Dinge, die beim Bauen zu entscheiden waren

**Die Wörter der Belegarten kommen vom Aufrufer.** `FehltPanel` hat dafür
heute eine lokale Map (`invoice` → „Rechnung", `receipt` → „Beleg /
Quittung", …). Für die Reife gibt es eine Achse — die Registry sagt „Läuft",
„Fällig", „Eskaliert", „Erledigt" —, für `expectedDocumentKind` **nicht**: das
ist ein freier String der Datenbank. Eine Map in der Komponente wäre die
dritte Wahrheit neben `FehltPanel` und der DB. Also nimmt sie
`documentKindLabel` als Prop entgegen und zeigt sonst den rohen Wert; die
Stories reichen die vier Wörter herein.

**Die erste Spalte hat eine feste Breite.** Zuerst stand dort `max-content` —
und die Spalte war keine: jede Zeile ist ihr eigenes Raster, `max-content`
misst also nur sich selbst. Gemessen schob die Marke „Zahlung offen" (94 px)
den Titel ihrer Zeile 17 px weiter nach rechts als „Beleg fehlt" (77 px).
Jetzt 104 px fest — die Achse `erwartung_art` hat genau zwei Wörter, beide
passen. Nachgemessen (`InCase`, drei Zeilen mit beiden Arten): alle vier
Spaltenkanten bei 37 · 153 · 478 · 593, in jeder Zeile dieselben.

### Gemessen

| Story | Was |
|---|---|
| `Maturities` | vier Reifen, jede mit ihrem Wort: „Läuft", „Fällig", „Eskaliert", „Erledigt" — keine lebt von der Farbe (V7) |
| `Row`, `InCase` | Frist **absolut** („fällig 20.09.2026"), nie relativ (T7); die Spaltenkanten stehen über alle Zeilen |
| `Chip` | der Betrag steht nur bei `payment`; beim fehlenden Beleg trägt die Belegart die Aussage |
| `Interactive` | „Erledigt" nimmt die Zeile (3 → 2), `onOpen` meldet die Kennung („Geöffnet: e1") |

### Zur Reife

`expectationMaturity()` aus `@/ludwig/modules/accounting-cases/domain/case`
— eine Regel, alle Leser. Die Komponente rechnet nichts; `today` reicht sie
nur durch, damit die Stories nicht mit dem Kalender wandern.

`escalationLevel` erscheint **nirgends** als Zahl: er geht in die Reife ein
und sonst nirgendwohin. Er ist keine DATEV-Mahnstufe, und wer ihn als solche
liest, liest falsch.

## Nach der Abnahme (2026-09-07): die Zeile passte nicht in ihre Spalte

**M1 erledigt — und es war derselbe Fehler wie in 0071, nur eine Ebene
tiefer.** Die festen Spuren summieren sich mit den Rinnen auf **537 px**,
bevor der Titel ein Pixel bekommt. Nachgemessen wurde das im Story-Rahmen von
720 px, den es auf der Seite nirgends gibt: in der Detailspalte der
Sachverhaltsseite bleiben bei 1280 px Fenster **484 px**. Dort war die
Titelspur **0 px**, der Titel lief 74 px in die Betragsspalte, die Zeile stand
538 px breit in einem 484-px-Behälter, und die Karte bekam eine
Bildlaufleiste.

Die Zeile misst jetzt **sich selbst** (Container-Query, wie die Belegkarte in
0071): ab 560 px Zeilenbreite die sechs Spuren, darunter der Titel über die
volle Breite und alles Übrige in einer Reihe darunter. Gemessen:

| Zeilenbreite | Spuren | Zeilenhöhe | Überlauf |
|---|---|---|---|
| 484 px (Detailspalte bei 1280) | eine | 75 px | 0 |
| 644 px (Detailspalte bei 1440) | sechs | 66 px | 0 |
| 900 px (eigene Seite) | sechs | **46 px** | 0 |

Ein erster Versuch stapelte im schmalen Fall alles untereinander — gemessen
148 px je Zeile, eine Liste aus fünf Erwartungen hätte den halben Bildschirm
gefüllt. Deshalb steht dort jetzt `flex-wrap` statt einer einspaltigen
Rasterreihe.

**M2 erledigt** — `currency` hatte einen Default (`"EUR"`), obwohl der
Nachtrag „die Komponente rät nicht" sagt und `CaseTimeline` sie verpflichtend
führt. Sie ist jetzt Pflicht, alle Stories reichen sie herein, und eine gibt
`"CHF"` — damit hat die Prop einen Nachweis statt eines Defaults.

**M3 erledigt** — der deutsche Kommentar im Code ist übersetzt. Die
Story-JSDocs bleiben deutsch (Nutzertext).

**M4 erledigt** — „lädt" ist begründet: die Zeile bekommt ihre Daten als Prop;
wer sie lädt, zeigt das an seiner Stelle.

**M5 bleibt als Vermerk:** `audienceWord()` bildet zwei DB-Werte auf zwei
deutsche Wörter ab, ohne Achse — dieselbe Form, die die Komponente für
`expectedDocumentKind` ablehnt. Gedeckt durch Freigabe-Entscheid 1; sobald
`audience` eine Achse bekommt, fällt die Funktion weg.

## Wiederabnahme (2026-09-07, fremd, ohne Bau und ohne Chatverlauf)

Gemessen am laufenden Storybook (`http://localhost:6107`) über CDP, gegen
Stand `01ebb7c`. Die Zeile wurde **nicht** im Story-Rahmen beurteilt, sondern
in den Breiten, die sie auf der Seite bekommt; dazu wurde zuerst die
Detailspalte selbst gemessen. (`MasterDetail` hat während dieser Abnahme seine
Untergrenze gewechselt — `01ebb7c`, `minDetail`; alle Zahlen unten sind
danach neu erhoben.)

**Die Werkzeuge sind grün.** `pnpm typecheck` Exit 0 · `pnpm build`
„Storybook build completed successfully", Exit 0 · `pnpm check:icons`
„in Ordnung. 53 Zeichen in der Registry", Exit 0.

### Zuerst: wie breit ist die Spalte, in der die Zeile steht?

`casedetailview--in-use`, je Fensterbreite eine frische Seite, gemessen an
`.v2md--detail-breit > .v2md__detail` (`CaseDetailView` reicht `minDetail={484}`
herein). Die Zeile in der Karte ist 42 px schmaler — die Karte trägt
`padding: 0 var(--space-5)` wie in `InCase`:

| Fenster | Detailspalte | Zeile in der Karte | Modus | Titelspur | Zeilenhöhe |
|---|---|---|---|---|---|
| 1280 | **484 px** | 442 px | flex | volle Breite | **75 px** |
| 1360 | 564 px | 522 px | flex | volle Breite | **75 px** |
| 1400 | 604 px | 562 px | grid | **74,7 px** | **86,8–128,6 px** |
| 1440 | **644 px** | 602 px | grid | **114,7 px** | **86,8 px** |
| 1600 | 804 px | 762 px | grid | 274,7 px | 46,1 px |

Referenz `.v2tbl__row`: gemessen **48,0 px**
(`v3-patterns-arbeitsfläche-datatable--filled`, `padding: 12px 18px`).

### M1 — der Überlauf ist weg, das Loch sitzt jetzt eine Stufe höher

Was die Nacharbeit **erledigt** hat, ist nachgemessen und stimmt:

| Nachweis | Messung |
|---|---|
| kein waagerechter Überlauf mehr | `scrollWidth − clientWidth = 0` an `.v2exp`, an `.v2card` und am Dokument, bei Zeilenbreiten 356 · 398 · 442 · 484 · 498 · 516 · 518 · 520 · 522 · 560 · 562 · 602 · 636 · 644 · 678 · 762 · 902 · 1158 |
| Titel läuft nicht mehr in die Betragsspalte | Abstand Titelkante → Betragskante konstant **−12 px** (die Rinne) bei jeder Breite, auch mit „Elektro-Großhandel Nordwest Verwaltungs GmbH & Co. KG" |
| schmal wird nicht gestapelt | unter 560 px Zeilenbreite `display: flex`: Titel über die volle Breite, alles Übrige in **einer** Reihe darunter, **75 px** je Zeile bei 442 und 522 px — genau die zwei Breiten, die die Detailspalte bei 1280 und 1360 hergibt. Lesbar (Bild), und der Fall, der die Nacharbeit ausgelöst hat, ist damit sauber |

Was **nicht** erledigt ist: das Tor liegt bei 560 px Zeilenbreite, also genau
bei der Summe der festen Anteile — 104 + 110 + 103,3 + 110 + 50,4 („Erledigt")
+ fünf Rinnen à 12 = **537,7 px**. Ab dem Tor gibt es sechs Spuren, aber dem
Titel bleibt nichts:

Beide Listen-Stories bei **derselben** Zeilenbreite gemessen (`InCase` in einer
Karte, deshalb Rahmen = Zeile + 42; `Interactive` trägt zusätzlich die
Handlungsspalte „Erledigt", so wie eine echte Liste):

| Zeilenbreite | Modus | `InCase`: Titelspur → Höhen | `Interactive`: Titelspur → Höhen | langer Firmenname |
|---|---|---|---|---|
| 522 | flex | volle Breite → 75 px | volle Breite → 75 px | 95,9 px |
| **560 (Tor)** | grid | **72,7 px** → 107,7–128,6 px | **22,3 px** → 107,7–128,6 px | **170,5 px** |
| **602** | grid | 114,7 px → **86,8 px** | **64,3 px** → 107,7–128,6 px | **149,5 px** |
| 644 | grid | 156,7 px → 65,8 px | 106,3 px → 86,8 px | 149,5 px |
| 700 | grid | 212,7 px → 65,8 px | 162,3 px → 65,8 px | — |
| 780 | grid | 292,7 px → **46,1 px** | 242,3 px → **46,1 px** | 86,8 px |
| 902 | grid | 414,7 px → 46,1 px | 364,3 px → 46,1 px | 65,8 px |

Einzeilig — also unter der Referenz von 48,0 px — wird die Zeile erst ab einer
Titelspur von rund **240 px**, das heißt ab rund **780 px Zeilenbreite**.
Zwischen 560 und 780 px steht die Zeile in sechs Spuren, ohne dass eine davon
den Titel trägt: der bricht dort über drei bis fünf Zeilen; im `Interactive`
bei 602 px steht das trennende „·" allein auf einer Zeile.

**Das Band ist schlechter als der Notfall darunter** — 75 px bei 522 px
Zeilenbreite gegen 128,6 px bei 562 px — und es ist nicht theoretisch: die
Detailspalte trifft es bei 1400 px Fenster (604 → Zeile 562) und bei 1440
(644 → Zeile 602), also in der Mitte des Registers L1, das bei 1280 anfängt.
Bei 1440 sind es gemessen **86,8 px** je Zeile mit den kurzen Namen der
Fixtures und **149,5 px** mit einem echten Firmennamen.

Zur Tabelle „Nach der Abnahme": die Zeile „484 px → eine Spur, 75 px, 0" ist
reproduziert, „900 px → 46 px" auch (46,1 px). **„644 px → 66 px" nicht** —
bei 644 px Zeilenbreite messe ich 86,8 px (`Interactive`, alle drei Zeilen)
bzw. 65,8–86,8 px (`InCase`); die 66 px erscheinen nur bei einer Zeile ohne
Handlungsspalte und ohne Notiz. In der Karte der 644-px-Spalte ist die Zeile
zudem nicht 644, sondern **602 px** breit.

### Die Punkte, die vorher hielten — noch einmal nachgemessen

| Punkt | Messung | Ergebnis |
|---|---|---|
| Datei, Story, Titel, Barrel | `entities/expectation/Expectation.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Erwartung/Expectation`, Barrel `index.ts:466–471` | hält |
| kein Hex, kein px, keine Label-Map, kein Inline-Stil | Grep über die Komponente: keine Treffer | hält |
| genau sieben Stories | `index.json` des Dev-Servers: `chip`, `row`, `maturities`, `empty`, `error`, `interactive`, `in-case` | hält |
| Reife aus `expectationMaturity` | Import aus `domain/case`, keine zweite Ableitung im Modul | hält |
| Reife als Wort (V7) | „Läuft", „Fällig", „Eskaliert", „Erledigt", je mit dem Erklärsatz der Achse im `title` | hält |
| Status nur über die Registry | Chip und Zeile über `erwartung` bzw. `erwartung_art`; Tooltip gemessen: „Reife: Fällig · Die Frist ist verstrichen. …" | hält |
| Frist absolut (T7) | „fällig 20.09.2026", „fällig 11.08.2026", „fällig 31.08.2026" | hält |
| `escalationLevel` nie sichtbar | nur im Typ und als Argument der Reife | hält |
| Betrag nur bei `payment` (Chip) | zwei Beleg-Chips ohne Zahl, zwei Zahlungs-Chips mit „412,00 €"; Chip `cursor: auto`, kein Knopf | hält |
| Zahlen rechts mit `tnum` | `.v2num`: `font-variant-numeric: lining-nums tabular-nums`, `text-align: right` | hält |
| Fokusring, Tastatur, Hover | Ring `2px solid rgb(59,143,196)`, Offset 2 px; sechs Stopps (je Zeile Titel + „Erledigt"); Titelknopf `none → underline`, `cursor: pointer` | hält |
| Rundlauf `Interactive` | „3 offen · Geöffnet: nichts" → Klick Titel → „Geöffnet: e1" → Klick „Erledigt" → „2 offen", zwei Zeilen übrig | hält |
| feste Spuren gegen den Wertebereich | Art 104 px gegen „Zahlung offen" 94,3 px · Reife 110 px gegen „Eskaliert" 65,2 px · Betrag 110 px gegen „1.234.567,89 €" 102,3 px, Zelle ohne Überlauf | hält |

### Mängel

**M1 · bleibt offen · blockiert · Das Tor steht bei der Summe der festen
Spuren, nicht bei der Breite, ab der der Titel trägt.**
Kriterium: Prüfliste `design-guidelines.md` §9, „Zeilenhöhe ≤ `.v2tbl__row`"
(V1), Referenz gemessen 48,0 px.
Messung: siehe die zwei Tabellen oben. Ab dem Tor (560 px) bekommt der Titel
in der Liste mit Handlung 22,3 px, bei 602 px 64,3 px, bei 644 px
106,3 px; die Zeilen sind dort 86,8 bis 128,6 px hoch, mit einem echten Firmennamen 149,5 px. Einzeilig
wird die Zeile erst ab rund 780 px Zeilenbreite. Die Detailspalte der
Sachverhaltsseite liegt bei 1400 und 1440 px Fenster mitten in diesem Band
(Zeile 562 bzw. 602 px). Der Überlauf und der Einbruch in die Betragsspalte
sind behoben — die Zeile bricht jetzt, statt überzulaufen.
Vorschlag: Das Tor an die Breite hängen, ab der die Titelspur trägt, nicht an
die Summe der festen Anteile. Zwei kleine Wege, die sich ergänzen:
(1) im Raster `minmax(16rem, 1fr)` für den Titel und `max-content` statt der
festen 110 px für Betrag und Reife — dann fällt das Tor mit der Breite
zusammen, ab der das Raster wirklich passt (gemessen rund 780 px);
(2) dem Titel selbst — dem Knopf bzw. Text, nicht der Spalte mit der Notiz —
`white-space: nowrap; overflow: hidden; text-overflow: ellipsis` geben, wie
`.v2case` es hat (gemessen steht dort heute `white-space: normal`,
`text-overflow: clip`), damit ein langer Firmenname kürzt statt über fünf
Zeilen zu brechen.
Dazu die Tabelle „Nach der Abnahme" auf die gemessenen Werte bringen: bei 644
ist die Zeile in der Karte 602 px breit und 86,8 px hoch, nicht 66.

**M6 · neu · blockiert · Die Trennlinie zwischen den Zeilen ist verschwunden.**
Kriterium: die Nacharbeit darf nichts beschädigen, das vorher hielt.
`.v2exp__row` trägt `border-bottom: 1px solid var(--color-border-subtle)`
(`v3.css:3112`), und `.v2exp__row:last-child { border-bottom: none }`
(`v3.css:3130`) soll nur die letzte Zeile davon befreien.
Messung: Der neue Behälter `<div className="v2exp">` macht **jede** Zeile zum
`:last-child`. Gemessen in `in-case`, `maturities` und `interactive`, an jeder
einzelnen Zeile: `borderBottomWidth: "0px"`, `borderBottomStyle: "none"`,
`matches(":last-child") === true`, `parentElement.children.length === 1`. Im
Bild bei 900 px stehen drei Zeilen ohne eine einzige Linie. Vor der Nacharbeit
war `.v2exp__row` die Wurzel der Komponente und hatte Geschwister — da traf
die Regel nur die letzte.
Vorschlag: die Ausnahme auf den Behälter heben, etwa
`.v2exp:last-child .v2exp__row { border-bottom: none; }`.

**M3 · nur zur Hälfte erledigt · blockiert nicht · Ein deutscher Kommentar
steht noch im Code.**
Kriterium: fester Block „Code englisch" (`CLAUDE.md`).
Messung: Der Kommentar am Betrag ist übersetzt („The amount only shows on a
payment …"). Der zweite steht unverändert deutsch in `Expectation.tsx:189–190`
(„Absolut, nicht „in drei Tagen": wer eine Frist prüft, will das Datum (T7).
Die Reife daneben sagt, was es bedeutet."). Der Nachtrag sagt „der deutsche
Kommentar im Code ist übersetzt" — es waren zwei.
Vorschlag: den zweiten ebenfalls übersetzen.

**M7 · neu · blockiert nicht · Im schmalen Modus stehen die Kanten nicht
mehr.**
Kriterium: der Kommentar über `.v2exp__row` begründet das Raster damit, dass
„Frist und Reife in jeder Zeile an derselben Stelle" stehen; die erste Abnahme
hat die stehenden Spaltenkanten als bestätigten Entscheid protokolliert.
Messung: bei 442 px Zeilenbreite (`InCase` in der 484-px-Spalte) beginnt die
Frist in den Zeilen ohne Betrag bei x = 137,9 und in der Zeile mit Betrag bei
x = 234,2; die Reife bei x = 253,1 gegen x = 349,5. Im `flex-wrap`-Notfall
gibt es keine Spalten mehr.
Das ist bewusst gewählt — die Alternative, das Stapeln, war mit 148 px je
Zeile schlechter — und bleibt lesbar; hier nur vermerkt, damit die Aussage
„Spaltenkanten in jeder Zeile dieselben" nicht unbesehen weitergetragen wird.

**M2 · erledigt.** `currency: Currency` ist in beiden Exporten Pflicht, ohne
Vorgabe (`Expectation.tsx:90` und `:135`); vierzehn Story-Stellen reichen sie
herein, `InCase` gibt `"CHF"`, und im DOM steht gemessen „412,00 CHF". Die
Prop hat damit einen Nachweis statt eines Defaults.

**M4 · erledigt.** Der Abschnitt „Stories" begründet „Lädt" jetzt: die
Erwartung bekommt ihre Daten als Prop, wer sie lädt, zeigt das an seiner
Stelle.

**M5 · bleibt Vermerk.** `audienceWord()` unverändert; gedeckt durch
Freigabe-Entscheid 1.

Abgenommen von / am: fremde Wiederabnahme (Claude, ohne Bau und ohne
Chatverlauf) · 2026-09-07 · Ergebnis: **zurück**. **M1** (bleibt offen) und
**M6** (neu) blockieren, **M3** und **M7** laufen mit; **M2** und **M4** sind
erledigt, **M5** bleibt Vermerk.

**Befunde am Set** (nicht Gegenstand dieser Aufgabe): (1) Die Untergrenze von
`.v2md--detail-breit` ist heute zweimal gewandert (`ed6e79a` feste Schwelle
1080 px, `01ebb7c` `minDetail` beim Aufrufer) — dazwischen war die
Detailspalte bei 1280 px Fenster nicht 484, sondern 944 px breit. Wer eine
Zeile gegen „die Breite der Detailspalte" baut, baut gegen einen Wert, der
sich unter ihm bewegt; ein Satz mit den gemessenen Spaltenbreiten am Kommentar
von `.v2md--detail-breit` (484 bei 1280, 604 bei 1400, 644 bei 1440, 804 bei
1600) würde das festhalten. (2) Die Referenzhöhe hinter „Zeilenhöhe ≤
`.v2tbl__row`" steht nirgends als Zahl — gemessen sind es heute 48,0 px,
während frühere Abnahmen 42, 46,25 und 47,3 px zitieren.

## Nach der Wiederabnahme (2026-09-07): das Tor stand an der falschen Stelle, und mein Behälter fraß die Linien

**M1 wirklich erledigt.** Das Tor lag bei 560 px — der Summe der festen Spuren
(537,7). Dort *passen* sechs Spuren, aber der Titel bekommt 22 px, und die
Zeile misst gemessen **128,6 px**: schlechter als der einspaltige Notfall
darunter mit 75. Das Band 560–780 traf ausgerechnet die Detailspalte bei 1400
und 1440. **Das Tor gehört an die Breite, ab der der Titel trägt, nicht an
die, ab der er hineinpasst.** Es steht jetzt bei **780 px**, und der Titel
kürzt wie `.v2case` seit 0095, statt die Zeile zu dehnen. Gemessen:

| Zeilenbreite | Spuren | Zeilenhöhe |
|---|---|---|
| 484 · 602 · 644 | eine | 75–76 px |
| **780** | sechs | **47 px** |
| 900 | sechs | 47 px |

Kein Überlauf bei keiner Breite.

**M6 erledigt — und er war meiner.** Der Behälter, den die letzte Nacharbeit
für die Container-Abfrage eingezogen hat, macht **jede** Zeile zum
`:last-child`; damit traf `.v2exp__row:last-child { border-bottom: none }`
alle, und die Trennlinien waren komplett weg. Die Regel hängt jetzt am
Behälter (`.v2exp:last-child .v2exp__row`). Gemessen: `1px · 1px · 1px · 0px`
bei vier Zeilen.

**M3 erledigt** — der zweite deutsche Kommentar ist übersetzt.

**M7 bleibt als Vermerk:** im einspaltigen Notfall stehen die Spaltenkanten
nicht mehr untereinander (Frist bei x = 137,9 gegen x = 234,2). Das ist der
Preis des Umbruchs und bewusst so: unter 780 px gibt es keine Spalten mehr,
sondern eine Zeile mit Nachsatz.

**Zwei Befunde am Set, die die Abnahme mitgibt:**

- **Die Untergrenze von `.v2md--detail-breit` ist an einem Tag zweimal
  gewandert.** Wer gegen „die Breite der Detailspalte" baut, baut gegen einen
  wandernden Wert — die gemessenen Breiten gehören an den CSS-Kommentar, und
  seit `01ebb7c` gehört die Schwelle dem Aufrufer.
- **Die Referenzhöhe hinter „Zeilenhöhe ≤ `.v2tbl__row`" steht nirgends als
  Zahl.** Frühere Abnahmen zitieren 42, 46,25 und 47,3 px, heute misst sie
  48,0. Ein Kriterium, dessen Maßstab jeder neu misst, ist ein halbes
  Kriterium — gehört in `design-guidelines.md` §9.

## Dritte Abnahme (2026-09-07, fremd, ohne Bau und ohne Chatverlauf)

Gemessen am laufenden Storybook (`http://localhost:6107`) über CDP, gegen den
Stand nach `9c3fe37` (Arbeitsbaum auf `be96a56`). Kein Wert ist aus der Quelle
zurückgelesen; jede Zahl unten stammt aus einem Rahmen, dessen Breite im
selben Lauf gesetzt und dessen Antwort darauf mitgemessen wurde.

**Die Werkzeuge sind grün.** `pnpm typecheck` Exit 0 · `pnpm build`
„Storybook build completed successfully", Exit 0 · `pnpm check:icons`
„in Ordnung. 53 Zeichen in der Registry", Exit 0 · `pnpm check:contrast`
„in Ordnung. 11 Angaben nachgerechnet", Exit 0. (Der erste Build-Lauf brach
mit Exit 1 ab — `ENOENT … copyfile ./reference/design-system-v2/ui_kits/
marketing/index.html`, obwohl die Datei da ist und im Index steht. Der zweite
Lauf war grün; das ist ein fremder, vermutlich paralleler Lauf am selben
`storybook-static`, kein Befund an 0025. **Der Fehler stand nicht in der
letzten Zeile** — nur der Exit-Code zeigte ihn.)

### Zuerst: die Spalte, in der die Zeile steht

`casedetailview--in-use`, je Fensterbreite eine frische Seite, gemessen an
`.v2md--detail-breit > .v2md__detail`. `CaseDetailView` reicht seit `131412e`
`minDetail={460}` herein; `--v2md-min` steht gemessen auf `460px`. Die Spalte
ist trotzdem breiter als 460, weil `minDetail` der **Flex-Sockel** ist und der
Rest an die wachsende Hälfte geht. Die Zeile in der Karte ist 42 px schmaler
(Rand + `padding: 0 var(--space-5)`):

| Fenster | Detailspalte | Zeile in der Karte | Modus | Zeilenhöhe |
|---|---|---|---|---|
| 1280 | **484 px** | 442 px | flex | 76 · 76 · 75 px |
| 1360 | 564 px | 522 px | flex | 76 · 76 · 75 px |
| 1400 | 604 px | 562 px | flex | 76 · 76 · 75 px |
| 1440 | **644 px** | 602 px | flex | 76 · 76 · 75 px |
| 1500 | 704 px | 662 px | flex | 76 · 76 · 75 px |
| 1600 | 804 px | 762 px | flex | 76 · 76 · 75 px |

Referenz `.v2tbl__row`: **48,0 px** (`datatable--filled`, 50 Zeilen, alle 48,0;
`padding: 12px 18px`) — dieselbe Zahl wie in der Wiederabnahme.

Nebenbefund: Die Detailspalte ist bei 1280 px Fenster **484 px** breit, nicht
464. Der Sockel 460 plus die 24 px, die nach `440 + 20 + 460` von 944 übrig
bleiben.

### M1 — das Tor steht jetzt bei 780 px, und das Band dazwischen ist geräumt

Gemessen an `interactive` (drei Zeilen **mit** Handlungsspalte) und `in-case`
(drei Zeilen in der Karte); je Breite ein Setzen des Rahmens und ein neues
Auslesen. Dass die Messung auf die Änderung reagiert, zeigt das Tor selbst:

| Zeilenbreite | Modus | Spuren | Zeilenhöhen | Titelspur | Überlauf | Dok.-Scroll |
|---|---|---|---|---|---|---|
| 442 | flex | `minmax(0px, 1fr)` | 76 · 76 · 75 | volle Breite | 0 | 0 |
| 522 · 562 · 602 · 644 · 662 · 700 · 762 | flex | eine | 76 · 76 · 75 | volle Breite | 0 | 0 |
| **779** | flex | eine | 76 · 76 · 75 | volle Breite | 0 | 0 |
| **780** | grid | `104px 242,3px 110px 103,3px 110px 50,4px` | **47,1 · 47,1 · 46,1** | 242,3 px | 0 | 0 |
| 800 · 900 · 1158 | grid | sechs | 47,1 · 47,1 · 46,1 | 262 · 362 · 620 px | 0 | 0 |

779 → flex, 780 → grid: das Tor sitzt genau dort, wo der Nachtrag es angibt.

**Das Band 560–780 ist damit weg.** Wo die Wiederabnahme 107,7–128,6 px
gemessen hat (560) und 149,5 px mit einem echten Firmennamen, stehen jetzt
75–76 px. Der Nachtrag „Nach der Wiederabnahme" ist nachgerechnet und stimmt:
484 · 602 · 644 → eine Spur, 75–76 px · 780 → sechs Spuren, 47 px · 900 → 47 px
· **kein Überlauf bei keiner Breite** (`scrollWidth − clientWidth = 0` an
`.v2exp`, kein Kind ragt über sein Elternteil, Dokument-Scroll 0 — geprüft bei
442, 484, 522, 562, 602, 644, 662, 700, 762, 779, 780, 800, 804, 822, 824, 900,
942, 1158, 1200).

Was dabei auffällt, ohne Mangel zu sein: Bei `minDetail={460}` liefert die
Detailspalte bis 1600 px Fenster **nie** mehr als 762 px Zeilenbreite. Auf der
Sachverhaltsseite ist die Zeile also durchweg im einspaltigen Notfall; die
sechs Spuren erscheinen dort erst ab rund 1620 px Fenster. Das ist die
Konsequenz des höheren Tores und in der Sache richtig — bei 602 px bekäme der
Titel 64,3 px, und das trägt kein Firmenname. Dasselbe gilt für die Story:
`in-case` steht bei ihrer eigenen Vorgabebreite (Rahmen 720, Zeile 678) jetzt
im Notfall, `row`, `maturities` und `interactive` (Rahmen 860, Zeile 818 bzw.
860) im Raster.

### M6 — die Trennlinien sind zurück

`.v2exp:last-child .v2exp__row { border-bottom: none }` hängt jetzt am
Behälter. Gemessen `borderBottomWidth` je Zeile:

| Story | Zeilen | gemessen | `:last-child` je Behälter |
|---|---|---|---|
| `maturities` | 4 | **1px · 1px · 1px · 0px** | false · false · false · true |
| `in-case` | 3 | 1px · 1px · 0px | false · false · true |
| `interactive` | 3 | 1px · 1px · 0px | false · false · true |
| `row` | 2 | 1px · 0px | false · true |

Und die Regel folgt dem Baum: nach einem echten Klick auf „Erledigt" in
`interactive` bleiben zwei Zeilen mit **1px · 0px** — der Messwert wandert mit,
er wird nicht zurückgelesen. Im Bild bei 484 und bei 942 px stehen die Linien
sichtbar zwischen den Zeilen.

### Die Punkte, die vorher hielten — noch einmal nachgemessen

| Punkt | Messung | Ergebnis |
|---|---|---|
| Datei, Story, Titel, Barrel | `entities/expectation/Expectation.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Erwartung/Expectation`, Barrel `index.ts:465–470` | hält |
| kein Hex, kein px, keine Label-Map, kein Inline-Stil | Grep über die Komponente: keine Treffer | hält |
| genau sieben Stories | `index.json` des Dev-Servers: `chip`, `row`, `maturities`, `empty`, `error`, `interactive`, `in-case` | hält |
| Reife aus `expectationMaturity` | Import aus `domain/case`, keine zweite Ableitung, kein Datumsvergleich im Modul | hält |
| Reife als Wort (V7) | „Läuft", „Fällig", „Eskaliert", „Erledigt", jede mit dem Erklärsatz der Achse im `title` | hält |
| Status nur über die Registry | `erwartung` und `erwartung_art`; Tooltip gemessen: „Erwartet: Beleg fehlt · Zu diesem Sachverhalt fehlt noch ein Beleg." | hält |
| Frist absolut (T7) | „fällig 20.09.2026", „fällig 11.08.2026", „fällig 31.08.2026", „fällig 20.07.2026" | hält |
| `escalationLevel` nie sichtbar | keine Stufe im Text der Seite, kein Render im Modul | hält |
| Betrag nur bei `payment` (Chip) | zwei Beleg-Chips ohne Zahl, zwei Zahlungs-Chips mit „412,00 €"; Chip `cursor: auto`, kein Knopf | hält |
| `currency` ist Pflicht und hat einen Nachweis | 14 Story-Stellen, `InCase` gibt `"CHF"`; im DOM gemessen „412,00 CHF" | hält |
| Zahlen rechts mit `tnum` | `.v2num`: `lining-nums tabular-nums`, `text-align: right` | hält |
| Fokusring, Tastatur, Hover | Ring `2px solid rgb(59, 143, 196)`, Offset 2 px; sechs Stopps (je Zeile Titel + „Erledigt"); `.v2link:hover:not(:disabled) { text-decoration: underline }`, `cursor: pointer` | hält |
| Rundlauf `Interactive` | „3 offen · Geöffnet: nichts" → echter Klick auf den Titel → „Geöffnet: e1", drei Zeilen → echter Klick „Erledigt" → „2 offen", zwei Zeilen, die richtigen | hält |
| feste Spuren gegen den Wertebereich | Art 104 px gegen „Zahlung offen" 94,3 px und „Beleg fehlt" 76,9 px · Reife 110 px gegen „Eskaliert" 65,2 px · Betrag 110 px gegen „1.234.567,89 €" 102,3 px. Zur dritten Spur siehe **M9** | hält (mit Vermerk) |
| M3 (deutsche Kommentare) | Grep über die Komponente: keine deutsche Kommentarzeile mehr; die Story-JSDocs bleiben deutsch | erledigt |

### Mängel

**M8 · neu · blockiert · Die Kürzung erreicht den Titel nur, wenn `onOpen`
gesetzt ist — sonst kürzt sie die Notiz.**
Kriterium: Prüfliste `design-guidelines.md` §9, „Zeilenhöhe ≤ `.v2tbl__row`"
(Referenz gemessen 48,0 px), und die zweite Hälfte der M1-Nacharbeit: „der
Titel kürzt wie `.v2case` seit 0095, statt die Zeile zu dehnen".
Messung: Die Regel heißt `.v2exp__title > :first-child` (`v3.css:3145`) und
trifft ein **Element**. Die Komponente rendert den Titel aber nur dann als
Element, wenn `onOpen` da ist (`Expectation.tsx:166–176`: Knopf oder **nackter
Textknoten**). Gemessen an `.v2exp__title` je Zeile:

| Story | erstes Kind | erstes **Element** | worauf die Regel wirkt |
|---|---|---|---|
| `interactive` (mit `onOpen`) | `BUTTON.v2link` | `BUTTON.v2link` | auf den Titel — richtig |
| `in-case`, `maturities`, `row` Z. 1 | `TEXT:Rechnung · Bürobed…` | **kein Element** | auf nichts |
| `row` Z. 2 (mit Notiz) | `TEXT:Erwartung · Stadtw…` | `SPAN.v2exp__note` | auf die **Notiz** |

Zwei gemessene Folgen, beide mit dem echten Firmennamen
„Elektro-Großhandel Nordwest Verwaltungs GmbH & Co. KG":

| Zeilenbreite | `interactive` (Knopf) | `in-case` (Text) |
|---|---|---|
| 442 (flex) | gekürzt, **75–76 px** | nicht gekürzt, **95,9–96,9 px** |
| 780 (grid) | gekürzt, **46,1–47,1 px** | nicht gekürzt, **65,8–66,8 px** |
| 900 (grid) | gekürzt, 46,1–47,1 px | nicht gekürzt, 65,8–66,8 px |
| 1158 (grid) | gekürzt bzw. passend, 46,1–47,1 px | 46,1–47,1 px (erst hier passt der Name in die Spur) |

Also genau das, was die Nacharbeit ausschließen wollte: die Zeile **dehnt
sich** auf 66,8 px gegen eine Referenz von 48,0 px, sobald kein `onOpen`
gereicht wird — und `InCase` ist die Story, die die Karte im Sachverhalt
nachstellt, also der Hauptfall.
Zweitens **verschwindet Text**: in `row` (Vorgabebreite, Zeile 818 px, grid)
steht im Bild „Teilzahlung vom 12.08. ist eingegangen, der Re…", während der
Titel daneben ungekürzt umbricht. Dass es die Regel ist, ist gegengemessen:
mit der Regel 66,3 px und `scrollWidth > clientWidth`, mit einem
Gegen-Stylesheet (`overflow: visible; white-space: normal`) 85,7 px und nicht
gekürzt, nach dem Entfernen des Gegen-Stylesheets wieder 66,3 px. Vor `9c3fe37`
gab es die Regel nicht — die Notiz brach um, sie wurde nicht abgeschnitten.
Vorschlag: den Titel **immer** als Element rendern — im `else`-Zweig ein
`<span className="v2exp__label">{title}</span>` statt des nackten Textes — und
die Regel an diese Klasse und an den Knopf hängen
(`.v2exp__label, .v2exp__title > button { … ellipsis }`) statt an
`:first-child`. Dann kürzt der Titel in beiden Ausprägungen, und die Notiz
bricht wieder um, wie sie es vorher tat.

**M9 · neu · blockiert nicht · Die Betragsspur hält gegen den Wertebereich in
Euro, nicht in Franken.**
Kriterium: „Maße gegen den Wertebereich, nicht gegen die Fixtures" (Abnahme 1).
Messung: Die Spur ist 110 px. `1.234.567,89 €` misst 102,3 px und passt.
`1.234.567,89 CHF` — dieselbe Zahl in der Währung, die `InCase` selbst reicht —
misst **121,2 px** und ragt 11,2 px über die Spur. Es kollidiert nichts: die
Rinne daneben ist 12 px breit, die Frist beginnt genau dort. Und der Fall
tritt nur im Rasterbetrieb (ab 780 px Zeilenbreite) auf. Die Spur stammt aus
dem Bau, nicht aus der Nacharbeit.
Vorschlag: die Spur auf `max-content` stellen (die Rinne trägt den Abstand,
und ein Betrag bricht wegen des geschützten Leerzeichens ohnehin nicht) oder
sie auf rund 125 px setzen und den Wert im Kommentar mit der Währung nennen.

**M7 · bleibt Vermerk.** Im einspaltigen Notfall stehen die Spaltenkanten
nicht untereinander — nachgemessen bei 442 px Zeilenbreite: Frist bei
x = 137,9 in den Zeilen ohne Betrag, bei x = 234,2 in der Zeile mit Betrag.
Bewusst so; unter 780 px gibt es keine Spalten, sondern eine Zeile mit
Nachsatz. Kein Rückgabegrund.

**M5 · bleibt Vermerk.** `audienceWord()` unverändert; gedeckt durch
Freigabe-Entscheid 1.

**M1 · Tor erledigt, Kürzung offen.** Der erste Teil der Nacharbeit — das Tor
bei 780 px statt bei der Summe der festen Spuren — ist nachgemessen und
stimmt; der zweite Teil, „der Titel kürzt", trägt nur die Hälfte der Fälle und
steht als **M8**. **M6 · erledigt.** **M3 · erledigt.** **M2, M4 · erledigt
(Wiederabnahme).**

Abgenommen von / am: fremde dritte Abnahme (Claude, ohne Bau und ohne
Chatverlauf) · 2026-09-07 · Ergebnis: **zurück**. **M8** blockiert; **M9**
läuft mit; **M5** und **M7** bleiben Vermerke.

**Befund am Set** (nicht Gegenstand dieser Aufgabe): Die Referenzhöhe hinter
„Zeilenhöhe ≤ `.v2tbl__row`" steht weiterhin nirgends als Zahl; gemessen sind
es 48,0 px, frühere Abnahmen zitieren 42, 46,25 und 47,3. Der Satz gehört nach
`design-guidelines.md` §9 — zum zweiten Mal notiert.

## Nach der dritten Abnahme (2026-09-07): die Kürzung traf die falsche Zeile

**M8 erledigt.** Die Regel hing an `.v2exp__title > :first-child` — und ein
`:first-child` ist ein **Element**. Ohne `onOpen` rendert die Komponente den
Titel als nackten Textknoten; die Kürzung traf dann die **Notiz** darunter. Im
Bild stand „Teilzahlung vom 12.08. ist eingegangen, der Re…" abgeschnitten,
während der Titel daneben umbrach, und die Zeile maß 65,8 statt 46,1 px.

Der Titel ist jetzt **immer** ein Element (`.v2exp__label`), und die Regel
hängt an der Klasse. Gemessen in `InCase` bei 900 px Rahmen: 47 · 47 · 46 px,
kein Überlauf; im schmalen Band unverändert 75–76.

**M9 erledigt** — die Betragsspur war mit 110 px gegen den **Euro**-Betrag
bemessen; `1.234.567,89 CHF` misst 121,2 px und ragte in die Rinne. Jetzt
126 px. Der Wertebereich hört nicht bei Euro auf — dieselbe Lehre wie bei den
Spurbreiten, eine Währung weiter.

**M5 und M7 bleiben Vermerk**, wie vereinbart.
