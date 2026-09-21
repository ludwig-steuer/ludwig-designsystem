# 0193 · Kontoauszug in zwei Modi — Ausschnitt und Vollansicht, mit „vollständig gebucht"

| | |
|---|---|
| Status | Abnahme — freigegeben und gebaut 2026-09-21, fremde Abnahme steht aus |
| Stufe | `entities/bank-transaction/` (Familie der Auszugszeile) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Sachverhalt, Buchungszustand am Ereignis, DATEV-Historie und die Zuordnungsstufen Z0–Z3 sind Ludwig |
| Quelle | Owner-Auftrag vom 2026-09-21, überbracht von `acto` (Rangfolge je Zeile, sieben Beispielzeilen aus Auszug 004 der Commerzbank) · Entitätsprofil `docs/entitaeten/bank-transaction.md` · Seitenprofil `docs/seiten/kontoauszug.md` |
| Ersetzt | in der App vier Handbauten des kompakten Falls: Karte „Zahlung" in `batch-review/ui/Step3Single.tsx`, „Umsätze ohne freigegebene Buchung" in Schritt 4, die `FieldList` im `EventPane` von `CaseOverview`, `BookingCoveragePanel`/`DatevCoveragePanel` auf der Bankkonto-Seite |
| Setzt voraus | `bankTransactionColumns()` (0101) ✓ · `BankTransactionRow` (0102) ✓ · `BankTransactionList` (0101) ✓ · `DataTable` mit `sections` (0149) ✓ · `deriveZ`/`restOf` im Spiegel ✓ · **neu in der App:** eine Ableitung „erledigt" in `statement-line.ts` (Befund L-340) |
| Spec von / am | Claude, 2026-09-21 |

## Entscheide des Owners (2026-09-21, über `acto`)

1. **Das Wort am Haken ist „gebucht"**, nicht „erledigt". Der Fall
   `no_booking_required` (Beispielzeile 6) trägt trotzdem den Haken; der
   Tooltip „keine Buchung nötig" trägt die Ausnahme. Filter und Zähler heißen
   entsprechend „nicht gebucht" und „212 von 251 gebucht".
2. **`accepted` zählt als fertig.**
3. **Keine Gruppierung je Auszug.** Abschnittsköpfe mit Anfangs- und
   Endsaldo sind aus dieser Spec gestrichen; die flache Liste ist der
   Standard. Salden gehören nicht zu diesem Pattern — L-58 bleibt eigen, und
   der Saldo steht, wenn überhaupt, unter der Liste, wie im Seitenprofil.

Alles andere wie vorgeschlagen. Wo die folgenden Abschnitte etwas anderes
sagen, gilt dieser.

## Ziel

Die Auszugszeile steht an vielen Stellen — im Schritt der Abnahme, am
Sachverhalt, auf der Kontoseite — und jede baut sie anders. Dazu die volle
Liste eines Kontos. Beides soll **eine** Zeile sein, in zwei Größen, und beide
sollen eine Frage beantworten, die heute keine beantwortet: **Ist diese Zahlung
fertig?**

## Was die Zeile sagen muss (Owner, Rangfolge)

1. Buchungstag, Betrag (Vorzeichen = Richtung), Gegenpartei
2. Betreff = Verwendungszweck, SEPA-zerlegt (`BankTransactionPurpose`)
3. Sachverhalt(e) — 0 bis n, beim Split mit Teilbeträgen; immer Nummer und
   Bezeichnung, nie eine Id
4. Zustand der Buchungen — **am Ereignis** (Achse `event_booking`), nie am Fall
5. **neu:** „vollständig gebucht" als eindeutige Ja/Nein-Marke je Zeile

## Die Kernentscheidung: Rang 4 und Rang 5 sind **eine** Spalte

Nebeneinander sagen beide bei fast jeder Zeile dasselbe: eine Zeile mit einem
gebuchten Ereignis stünde als „Gebucht" in der Spalte „Buchung" **und** als
Haken in der Spalte „vollständig gebucht". Das ist genau die Doppelung, die der
Owner heute am Strang abgestellt hat („bei Buchungsvorschlägen reicht ein
Status-Badge, nicht 2", 0040). Deshalb:

**Eine Spalte „Buchung".** Ist die Zeile fertig, steht dort **ein Haken mit
Wort** — sonst steht dort, **was sie aufhält**: die Zustände genau der
Ereignisse, die noch nicht fertig sind. Der Haken ist die Ja-Antwort, die
Badges sind das Warum der Nein-Antwort. Eine Spalte, ein Blick, und die Frage
„welches Ereignis hält es auf?" ist mit beantwortet.

### Wann ist eine Zeile fertig?

Wie `acto` vorschlägt, und ohne neu zu rechnen:

> **fertig** ⇔ `deriveZ(row) ∈ {Z1, Z2}` **und** jedes Ereignis der Zeile steht
> auf `accepted`, `posted` oder `no_booking_required` (ersetzte Ereignisse
> zählen nicht — es zählt das, das sie ersetzt).

Diese Ableitung gehört **in die Domäne** der App, neben `deriveZ` in
`statement-line.ts` — nicht ins Set (Befund **L-340**). Das Set zeigt sie; wer
filtert oder zählt („212 von 251 erledigt"), braucht dieselbe Regel, und die
darf es nur einmal geben.

### Eigene Achse oder reiner Haken? — **Haken, keine neue Achse**

| | eigene Achse (4 Werte) | reiner Haken **(Empfehlung)** |
|---|---|---|
| Ja | „Vollständig gebucht" | ✓ mit Wort |
| Nein, weil nichts zugeordnet (Z0) | eigener Wert | steht schon in der Spalte **Sachverhalt** („offen", mit Weg zum Zuordnen) |
| Nein, weil Rest offen (Z3) | eigener Wert | steht schon in der Spalte **Sachverhalt** („Rest 480,55 € offen") |
| Nein, weil ein Ereignis nicht fertig ist | eigener Wert | steht als Badge der Achse `event_booking` in der Spalte **Buchung** |

Eine vierwertige Achse wäre ein **dritter** Weg, dieselben Sachverhalte zu
sagen, die Zuordnung (Z) und Ereigniszustand schon sagen. Der Haken ist die
Konjunktion der beiden; er braucht keine eigene Wortliste, nur eine
Domänenfunktion für Filter und Zählung.

**Das Wort am Haken:** „erledigt", nicht „gebucht" — die Zeile 6 der Beispiele
(interner Übertrag, `no_booking_required`) ist fertig, aber nicht gebucht, und
ein Haken mit „gebucht" daran wäre dort falsch. Der Tooltip nennt je Ereignis,
wie es erledigt ist („Gebucht", „Freigegeben", „Keine Buchung nötig"). Siehe
offene Frage 1.

**Farbe (A7):** der Haken im Erfolgston, die Badges im Ton ihrer Achse. Nichts
färbt sich nach Betrag oder Richtung.

### Die Beispielzeilen in dieser Form

| # | Zeile | Sachverhalt | Buchung |
|---|---|---|---|
| 1 | GRENKE, −129,51 | 2026-0112 Leasing Kopierer | ✓ erledigt |
| 2 | Musterbau, +1.800,00 | 2026-0338 Ausgangsrechnung | „Vorschlag" |
| 3 | Handwerk Schulz, −2.480,55 | 2026-0451 · **Rest 480,55 € offen** | „Buchung fehlt" · Klärung 1 |
| 4 | Kontoführungsentgelt, −89,90 | **offen** (Weg zum Zuordnen) | — |
| 5 | Finanzamt, −3.570,00 (Split) | 2026-0290 · 2026-0291 (aufklappbar mit Teilbeträgen) | ✓ erledigt |
| 6 | Interner Übertrag, +24.989,27 | 2026-0277 Umbuchung Qonto → Commerzbank | ✓ erledigt (Tooltip: keine Buchung nötig) |
| 7 | Miete Arbeitszimmer, −800,00 | 2026-0301 Miete Arbeitszimmer | „Geplant" |

Beim Split mit einem fertigen und einem offenen Ereignis steht nur das offene
als Badge, mit der Sachverhaltsnummer davor — das fertige muss man nicht
wiederholen, um zu verstehen, warum die Zeile nicht fertig ist.

## Modus 1 — Ausschnitt (kompakt)

**Wofür:** eine Handvoll Zeilen an fremder Stelle — die Zahlung in Schritt 3,
die Umsätze ohne Buchung in Schritt 4, das Ereignis am Sachverhalt, die
Abdeckung auf der Kontoseite. Keine Sortierung, kein Pager, kein Filter.

**Fester Spaltensatz** (nicht zuschaltbar — ein Ausschnitt, der an jeder Stelle
anders aussieht, ist genau das Problem, das er lösen soll):

| Spalte | zeigt | Breite |
|---|---|---|
| Datum | Buchungstag mit Jahr | 100 px |
| Zahlung | Gegenpartei (fett) über dem Zweck (eine Zeile, gekürzt, voll im Tooltip); ohne Gegenpartei steht der Zweck oben | flexibel |
| Sachverhalt | Nummer + Bezeichnung, beim Split „2 Sachverhalte" mit Aufklapper; „offen" bzw. „Rest … offen" | 200 px |
| Buchung | Haken oder die aufhaltenden Badges (siehe oben) | 160 px |
| Betrag | mit Vorzeichen, rechtsbündig | 130 px |

Das ist `acto`s Vorschlag, mit einem Unterschied: **Buchungsstatus und Haken
sind eine Spalte**, nicht zwei (siehe Kernentscheidung). Klärung und
DATEV-Historie fehlen im Ausschnitt; offene Klärungen stehen als Zähler am
Sachverhalt, wo sie hingehören.

**Form:** `BankTransactionExcerpt` — eine Karte mit Kopf und den Zeilen von
`BankTransactionRow` im Spaltensatz `compact`. Regel 5 aus `spec-schreiben` §3:
eine neue Entitäts-Form, weil vier Stellen dieselbe Komposition brauchen und
keine vorhandene Form sie trägt (`BankTransactionRow` ist die Zeile, nicht der
Rahmen; `BankTransactionList` ist die Listenseite mit Pager). Das Wort
„Ausschnitt" ist im GLOSSARY für Schritt 5 schon in diesem Sinn belegt.

## Modus 2 — Vollansicht (Konto-Detail)

**Wofür:** der Auszug eines Kontos, sortiert, gefiltert, geblättert —
`BankTransactionList` auf `DataTable`, wie gebaut. Drei Ergänzungen:

1. **Die Spalte „Buchung" wird die zusammengeführte** (Haken oder Badges), wie
   im Ausschnitt. Dazu ein Filter „nicht erledigt" in der `FilterBar` — das ist
   die eigentliche Arbeitsfrage der Seite (Seitenprofil Rang 3).
2. **Gruppiert je Auszug** (`DataTable sections`): je Kontoauszug ein
   Abschnittskopf „Auszug 004 · 01.04.–30.04.2026 · Anfangssaldo 89.400,55 €
   · Endsaldo 77.754,68 €". Der Saldo steht damit **am Auszug, nicht an der
   Zeile** — die Entscheidung des Seitenprofils bleibt gewahrt (ein laufender
   Saldo je Zeile stimmt nur bei einer Sortierung und keinem Filter). Die
   Gruppierung gilt nur in der Standardsortierung (Buchungstag); sortiert oder
   filtert jemand anders, ist die Liste flach, und der Saldo steht nicht da,
   weil er dann nichts mehr bedeutet. Zahlen dafür: `client_bank_import_batches`
   (Zeitraum, Anfangs-/Endsaldo, Auszugsnummer) — Befund **L-58** besteht,
   bis die App sie liefert.
3. **Kartenkopf:** Kontoname · Sachkonto · IBAN · Bank, darunter der gezeigte
   Zeitraum und die Zählung „212 von 251 erledigt" (aus der Domänenfunktion,
   L-340).

**Spalten — Standard und zuschaltbar:**

| Standard | Zuschaltbar | Grund |
|---|---|---|
| Datum · Gegenpartei · Verwendungszweck · Sachverhalt · Buchung · Klärung · Betrag | Valuta · IBAN der Gegenpartei · Quelle (CSV/Qonto/manuell) · Import · DATEV-Historie · Konto (nur kontoübergreifend) | Standard sind die fünf Ränge des Owners plus die Klärung (sie hält eine Zeile am häufigsten auf). DATEV-Historie wird **zuschaltbar**: sie beantwortet eine Prüffrage vor dem Lauf, nicht die Tagesfrage „ist das fertig?" |

„Zuschaltbar" heißt in dieser Welle: der Aufrufer wählt den Spaltensatz über
`columns` — das kann `bankTransactionColumns()` schon. Ein Menü „Spalten
wählen" für die Nutzerin wäre eine eigene Aufgabe (`DataTable` hat keines).

## Schnittstelle (Entwurf)

- `CaseAssignment` bekommt **nichts** Neues; der Haken liest `eventBookingState`
  und `noBookingRequiredReason`, die schon da sind, über die Domänenfunktion.
- `BankTransactionRowData.settled?: boolean` — das Ergebnis der
  Domänenfunktion, vom Aufrufer gesetzt (L-340). Bis die App sie liefert,
  **zeigt das Set keinen Haken** statt ihn selbst zu rechnen.
- `bankTransactionColumns({ columns })` kennt den Satz `COMPACT_COLUMNS`
  (`postingDate` · `payment` · `cases` · `eventState` · `amount`); die Spalte
  `payment` (Gegenpartei über Zweck) ist neu, `eventState` wird die
  zusammengeführte.
- `BankTransactionExcerpt({ title, sub, rows, caseHref, openHref?, empty })` —
  keine Sortierung, kein Pager.
- `BankTransactionList`: `statements?: { id; label; periodFrom; periodTo;
  openingBalance; closingBalance }[]` für die Abschnitte; ohne sie bleibt die
  Liste flach.

## Stories (beim Bau)

Mit den sieben Beispielzeilen aus Auszug 004:

- `BankTransactionExcerpt`: `Filled` (alle sieben) · `Settled` (nur fertige) ·
  `Split` (Zeile 5 aufgeklappt) · `Empty` · `InStep` (in der Karte eines
  Abnahmeschritts)
- `BankTransactionList`: `ByStatement` (zwei Auszüge als Abschnitte mit Saldo) ·
  `NotSettledFilter` · `OptionalColumns`

## Abnahmekriterien (beim Bau)

1. Keine Zeile trägt zwei Aussagen über ihren Buchungszustand: entweder den
   Haken oder die aufhaltenden Badges, nie beides.
2. Zeile 6 (`no_booking_required`) trägt den Haken, mit „keine Buchung nötig"
   im Tooltip.
3. Zeile 3 (Z3) zeigt den Rest in der Spalte Sachverhalt und „Buchung fehlt" in
   der Spalte Buchung, keinen Haken.
4. Ohne `settled` zeigt das Set keinen Haken und rechnet ihn nicht selbst.
5. Die Vollansicht zeigt den Saldo nur in Abschnittsköpfen der
   Standardsortierung; gefiltert oder anders sortiert steht keiner da.
6. Status nur über die Registry; der Kopf der Spalte heißt „Buchung", nie
   „Status".

## Befunde für `ludwig/app`

- **L-340** `isSettled(row)` (oder gleichwertig) in
  `bank-transactions/domain/statement-line.ts`: Z1/Z2 **und** jedes nicht
  ersetzte Ereignis auf `accepted`/`posted`/`no_booking_required`. Eine Regel
  für Anzeige, Filter „nicht erledigt" und Zählung; das Set rechnet sie nicht.
- **L-58** (besteht): Zeitraum, Anfangs-/Endsaldo und Auszugsnummer des
  Import-Batches an die Liste — für die Abschnittsköpfe.

## Offene Fragen

1. **Das Wort am Haken: „erledigt" oder „gebucht"?** Ohne Antwort: „erledigt"
   — es trägt auch den internen Übertrag, der nie gebucht wird.
2. **Zählt `accepted` (freigegeben, noch nicht nach DATEV) als fertig?** Ohne
   Antwort: ja, wie `acto` vorschlägt — die Arbeit der Kanzlei ist getan; ob
   DATEV es schon hat, sagt die DATEV-Historie.
3. **Gruppierung je Auszug als Standard der Vollansicht?** Ohne Antwort: ja, in
   der Standardsortierung; sonst flach.

## Ausbau

- Ein Menü „Spalten wählen" in `DataTable` (eigene Aufgabe), das die
  zuschaltbaren Spalten der Nutzerin gibt statt nur dem Aufrufer.
- Summen je Abschnitt (Eingänge, Ausgänge) im Abschnittskopf, sobald L-58 die
  Salden liefert und jemand danach fragt.

## Stand des Baus (2026-09-21)

Gebaut nach den Entscheiden des Owners:

- `BankTransactionRowData.settled?: boolean` — gesetzt vom Aufrufer aus der
  Domäne (L-340). Ohne es kein Haken.
- Spalte **Buchung** (`eventState`) zusammengeführt: `settled` → Haken mit
  „gebucht" und Tooltip je Ereignis („2026-0290: Gebucht · 2026-0291:
  Freigegeben", „Keine Buchung nötig"); sonst die Badges der Ereignisse.
- Neue Spalte `payment` („Zahlung": Gegenpartei über Zweck), Satz
  `COMPACT_COLUMNS` exportiert.
- `BankTransactionExcerpt` (neue Form, Server-Komponente) mit dem festen Satz.
- `BankTransactionList`: `booked={{ booked, total }}` → „x von y gebucht" im
  Kopf; **Standardspalten ohne DATEV-Historie** (zuschaltbar über `columns`).
- Stile `.v3btxpay`, `.v3btxbooked`; Fixture `STATEMENT_004` mit den sieben
  Zeilen.

**Zwei Bau-Entscheidungen, die vom Konzepttext abweichen:**

1. **Nicht fertige Zeilen zeigen die Badges aller Ereignisse**, nicht nur der
   aufhaltenden. Welches Ereignis „fertig" ist, ist schon ein Teil der Regel
   aus L-340; filterte das Set selbst, hätte es die Regel ein zweites Mal. Das
   Wort des Badges sagt ohnehin, welches aufhält.
2. **Der Ausschnitt zeigt den Split gleich aufgeklappt** (Teilbeträge unter der
   Zeile), ohne Aufklapper: bei einer Handvoll Zeilen ist das Auskunft, und
   die Karte bleibt eine Server-Komponente.

**Folge für die App:** die Kontoauszug-Seite zeigt die DATEV-Historie nur
noch, wenn sie die Spalte über `columns` zuschaltet.

Im Browser nachgesehen: `banktransactionexcerpt--filled` (sieben Zeilen: drei
Haken, „Vorschlag", „Buchung fehlt" mit „Rest 480,55 €", „offen", „Geplant";
Split aufgeklappt) · `banktransactionlist--booked` („April 2026 · 3 von 7
gebucht", Spalten Datum · Gegenpartei · Verwendungszweck · Sachverhalt ·
Buchung · Klärung · Betrag). Typecheck und Wächter grün.

## Nachtrag 2026-09-21 — Weg zum ganzen Auszug, Split in beide Richtungen, Zahlungskonto-Drawer (Owner über `acto`)

**1. „Gesamten Kontoauszug öffnen" im Ausschnitt.** `BankTransactionExcerpt`
bekommt `statementHref?: string` mit **festem Platz** (Kartenkopf, rechts)
und **festen Worten** („Gesamten Kontoauszug öffnen") — nicht jedem Aufrufer
über `actions` überlassen. Ziel in der App: `/clients/[slug]/[year]/banks/
[accountId]`, gegebenenfalls mit `?tx=` auf die Zeile. **Über mehrere Konten:**
ein Ausschnitt deckt **ein** Konto; Zeilen mehrerer Konten sind mehrere
Ausschnitte, jeder mit seinem Weg. Ein Link je Zeile wäre eine sechste Spalte
im festen Satz und eine zweite Art, dasselbe zu sagen.

**2. Split in beide Richtungen.**
- **Mehrere Zahlungen → ein Sachverhalt** (Story `ManyPaymentsOneCase`):
  2.000,00 € gebucht und 480,55 € als Vorschlag, beide zu 2026-0451. Erkennbar
  ist der gemeinsame Sachverhalt an **derselben Nummer und demselben Namen**
  in beiden Zeilen; jede trägt ihr eigenes Ereignis und ihren eigenen Stand.
- **Sammelzahlung über sechs Sachverhalte** (Story `SixCases`): gestapelt
  wurde die Zeile sechsfach hoch, und die Aufteilung darunter wiederholte
  alles. **Ab drei Sachverhalten verdichtet die Zeile** (`STACK_MAX = 2`, der
  Bestand hatte nie mehr als zwei): Sachverhalt „6 Sachverhalte", Buchung
  jeder Stand einmal mit Anzahl („Gebucht ×3 · Freigegeben · Vorschlag ×2").
  Die **Aufteilung trägt jetzt den Stand je Sachverhalt** (eine Spalte mehr in
  `.v2btxrow__splitrow`) — so bleibt „welcher hält auf?" je Fall lesbar, auch
  in der Liste mit Aufklapper.

**3. `PaymentAccountDrawer`** (Owner-Entscheid: immer die **letzten** Zeilen,
nach Buchungstag absteigend, eine feste Zahl, gebucht oder nicht). Kopf aus
dem Zahlungskonto (Name, Art im Kopf, IBAN bzw. Kartenkennung, Sachkonto),
darunter `BankTransactionExcerpt` mit `PAYMENT_ACCOUNT_DRAWER_LINES = 10` —
etwa zwei Wochen eines viel bewegten Kontos. Der **eine** Ausweg ist der Fuß
des Drawers, „Gesamten Kontoauszug öffnen" (`DrawerFullView`); der Ausschnitt
darin trägt keinen zweiten Link auf dasselbe Ziel. Der Aufrufer lädt die
Zeilen schon so; der Drawer kürzt, was länger ist, sortiert aber nicht.
Stories `Filled` · `Empty` · `Loading`.

**Stand.** Gebaut 2026-09-21, im Browser nachgesehen (`--many-payments-one-case`,
`--six-cases`, `paymentaccountdrawer--filled`). Typecheck und Wächter grün.
Fremde Abnahme steht aus.
