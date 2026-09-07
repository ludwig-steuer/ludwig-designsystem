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
