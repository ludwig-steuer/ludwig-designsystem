# 0131 · `RecurringRuleOverview` — das Regelwerk eines Mandanten

| | |
|---|---|
| Status | **Abnahme** |
| Stufe | `entities/recurring-rule/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Buchungsweise, Personenkonto, Gegenkonto und Belegnummern-Strategie sind Ludwig-Fachbegriffe |
| Quelle | Seitenprofil `docs/seiten/regelwerk-mandant.md` (Job **J-54**) · Entitätsprofil `docs/entitaeten/recurring-rule.md`, Abschnitte „Listen" (zweite Zeile) und „Formen" (`RecurringRuleList` „Regelwerk des Mandanten") · der Auftrag, der bis zum 2026-09-08 in dieser Datei stand |
| Ort | `clients/[clientSlug]/configuration/recurring-rules` — Reiter der Konfigurations-Leiste (Owner 2026-09-08). **Listenseite, keine Detailseite:** `docs/detailseiten-standard.md` gilt für sie ausdrücklich nicht |
| Ersetzt | in der App **nichts** — und genau das ist der Punkt: `modules/recurring-rules/infrastructure/rule-overview-queries.ts` (205 Z.) ist gebaut und hat keinen Aufrufer (**L-252**). Diese Liste ist der erste |
| Blockiert | nichts im Set. Drüben wartet die neue Route auf sie |
| Domänen-Stand | Zeilen-Typ gelesen gegen `origin/staging` (`rule-overview-queries.ts`, 2026-09-08), Typen importiert aus dem eingefrorenen Spiegel `src/ludwig/`. **L-240** ist weiter offen: `RuleOverviewItem` (23 Felder) liegt in `infrastructure/` und ist nicht gespiegelt — die Liste nimmt ihre Zeilen deshalb als Felder entgegen und definiert **kein** Zeilenmodell, wie 0132 es vormacht. Neu aus dieser Spec: **L-264**, **L-262**, **L-263** |
| Spec von / am | Claude, 2026-09-08 (Skill `spec-schreiben`) |

## Ziel

Ein Mandant ist übernommen, und die Sachbearbeiterin will wissen, ob das
Regelwerk trägt, das der DATEV-Import angelegt hat. Heute gibt es dafür
**keinen Ort**: der `RegelwerkTab` zeigt genau eine Regel eines Sachverhalts,
und die mandantenweite Query, die alle zeigen würde, hat seit ihrer Entstehung
keinen Aufrufer.

Drei Zahlen sind der ganze Job (Seitenprofil, gemessen 2026-09-08 über alle
sechs Mandanten): **eine** von 30 Regeln steht still, **eine** hat kein
Personenkonto, **ein** Sachverhalt trägt zwei Regeln. Misslungen ist die
Seite, wenn diese drei Zeilen aussehen wie die 27 gesunden.

Die vierte Zahl ist die größere: **75 von 104 Dauersachverhalten tragen gar
keine Regel** (72 %). Wer die 30 gebauten nebeneinander sieht, sieht ein
knappes Drittel dessen, was laufen sollte. Deshalb trägt die Liste diese Zahl
mit — als Zahl mit Weg, nicht als zweite Liste.

## Einordnung

- **Wiederverwenden:** `RecurringRuleList` (0133) deckt den Fall **nicht**.
  Ihr `@when` sagt „the expected recurring payments that did not arrive in a
  period", ihr `@instead` schickt für „every rule of a client, sortable and
  filterable" ausdrücklich hierher.
- **Eigene Komponente, kein `columns`-Prop an 0133** — `spec-schreiben` §8
  verlangt einen eigenen Job **und** Unterschiede in ≥ 2 von {Grundgesamtheit,
  Sortierung, Filter, Massenaktion, Spaltensatz}. Es sind **drei**:

  | Merkmal | 0133 „Erwartete Zahlungen" | 0131 „Regelwerk des Mandanten" |
  |---|---|---|
  | Grundgesamtheit | aktive Regeln mit Rhythmus, deren Zahlung im Stapelzeitraum fehlt | **alle** Regeln eines Mandanten, aktiv und inaktiv |
  | Sortierung | keine (Query-Reihenfolge) | `is_active desc, case_number asc, priority asc`, dazu Spaltenköpfe über die URL |
  | Spaltensatz | 7 | **10** (Ränge 1–7, 10, 11, 22) |
  | Filter | keiner | Gültigkeit, Buchungsweise (die Seite baut sie, `FilterBar`) |
  | Massenaktion | keine | keine |

  Dazu der Rahmen: 0133 ist eine schlichte `Card` mit `Table` — sie sortiert
  nicht, filtert nicht, paginiert nicht. Diese hier ist **`DataTable`** (0057).
- **Neu, weil:** `spec-schreiben` §3 **Nr. 5** — das Entitätsprofil führt die
  Liste in „Formen" und „Zuschnitt" mit Marke Backlog, und keine vorhandene
  Form deckt sie ab. Die Vertagung („kein Screen, Ort offen") ist mit dem
  Seitenprofil und dem Owner-Entscheid vom 2026-09-08 aufgehoben.
- **Die Zeile bleibt dieselbe** (R17): `RecurringRuleRow` aus 0132, keine
  zweite. `DataTable` rahmt aber keine Zeilen-Komponente, sondern
  `ColumnDef`-Objekte — deshalb wandern die **Zellen** in einen Katalog, den
  Zeile und Tabelle gemeinsam lesen. Zwei Zell-Definitionen wären derselbe
  Fehler eine Ebene tiefer (Wortlaut aus `bank-transaction-columns.tsx`).
  Der Zug steht so im **Ausbau von 0132**, mit dieser Aufgabe als Auslöser.
- **Zuschnitt: zwei neue Dateien, zwei berührte.**
  - `recurring-rule-columns.tsx` (**neu**) — der Katalog: `RecurringRuleColumn`,
    `RecurringRuleRowData`, die Spurbreiten, die Spaltenwörter, die Zellen und
    **drei benannte Sätze**. Muster: `sourceDocumentColumns()` (0070),
    `caseColumns()` (0096), `bankTransactionColumns()` (0101).
  - `RecurringRuleOverview.tsx` + `.stories.tsx` (**neu**) — der Rahmen.
  - `RecurringRuleRow.tsx` (berührt) — rendert dieselben Zellen, jetzt aus dem
    Katalog; die vorhandene Schnittstelle bleibt unverändert, **fünf optionale
    Props** kommen dazu (`counterAccount`, `personalAccount`,
    `documentNumberStrategy`, `caseRuleCount`, `accountHref`). Ein Satz dazu
    steht in der Spec 0132.
  - `RecurringRuleList.tsx` (berührt) — nur Import-Pfade und der benannte Satz
    `RECURRING_RULE_OVERDUE_COLUMNS` statt der lokalen Liste. Kein
    Verhaltensunterschied.
- **Setzt auf:** `DataTable` (0057), `RecurringRuleRow`/den Katalog (0132),
  `CaseCell` (0095), `AccountCell` (0113), `StatusBadge` (`axis="regel_modus"`),
  `AmountCell`, `MonoCell`, `TextButton`, `EmptyState` (über `DataTable`).
  Aus dem Spiegel: `RuleBookingMode`, `RuleDirection`, `RuleExpectedInterval`,
  `RuleDocumentNumberStrategy`, `RULE_INTERVAL_LABEL`, `PreviewAccount`.

## Der Name

`RecurringRuleList` ist von 0133 belegt. Die Schwester-Familie hat denselben
Fall schon entschieden: die zweite Liste der Bank-Zeile heißt
`BankTransactionWorklist` — nach ihrem Job, nicht nach einer Größe.
**`RecurringRuleOverview`** folgt dem und nimmt das Wort, das die App für diese
Grundgesamtheit selbst benutzt (`listRulesOverviewForClient`,
`RuleOverviewItem`). Nicht `RecurringRuleBook`: „Book" liest sich in einer
Buchhaltung als Buchung, nicht als Regelwerk. Im UI heißt die Karte deutsch
**„Regelwerk des Mandanten"**.

## Der Spaltensatz

Ränge 1–7, 10, 11 und 22 des Entitätsprofils, in der Rangordnung. `case`
führt, weil die Liste ihren Fall verlässt.

| # | Rang | Zelle | Woraus | Darstellung |
|---|---|---|---|---|
| 1 | 6 | Sachverhalt | `caseId` + Nummer/Titel | Nummer + Titel; **trägt den Zeilen-Link** (I11). Bei mehr als einer Regel am Fall die Marke „2 Regeln" |
| 2 | 1 | Gegenpartei | abgeleitet `matchCounterpartyName ?? matchCounterpartyIban` | Text, IBAN in `MonoCell`, sonst „ohne Kriterium" |
| 3 | 2 | Buchungsweise | `bookingMode` | `StatusBadge axis="regel_modus"` |
| 4 | 3 | Gültigkeit | `isActive` | Wort ohne Farbe: „aktiv" / „inaktiv" (L-241) — **sortierbar**, das ist der erste Schlüssel der Query |
| 5 | 4 | Erwartet | `accrualAmount(rule)` **beim Aufrufer** | `AmountCell`, rechtsbündig |
| 6 | 5 | Rhythmus | `expectedInterval` über `RULE_INTERVAL_LABEL` | Wort; ohne Rhythmus „ohne Rhythmus" |
| 7 | 7 | Richtung | `expectedDirection` über `labels.direction` | Wort; ohne Wort roh (L-256) |
| 8 | 10 | Gegenkonto | `template.counterAccountNumber` + Name | `AccountCell`; ohne Konto das Wort „ohne Gegenkonto" |
| 9 | 11 | Personenkonto | `personalAccountNumber` + Name | `AccountCell`; ohne Konto das Wort **„ohne Personenkonto"** — die zweite der drei Auffälligkeiten |
| 10 | 22 | Belegnummern-Strategie | `documentNumberStrategy` über `labels.documentNumberStrategy` | Wort; ohne Wort roh (L-242). `fixed` ist die eine Zeile im Bestand, die den OPOS-Ausgleich ab der zweiten Periode bricht |

**Die drei Auffälligkeiten stehen als Wort in ihrer Zeile, nicht als
Nebensatz** — so verlangt es das Seitenprofil, Frage 1:

| Auffälligkeit | Wo sie steht | Bestand |
|---|---|---|
| steht still | Spalte „Gültigkeit": **„inaktiv"** | 1 von 30 |
| kein Personenkonto | Spalte „Personenkonto": **„ohne Personenkonto"** | 1 von 30 |
| greift doppelt | Marke **„2 Regeln"** am Sachverhalt | 1 Fall |

**Keine Farbe für die drei.** R1 lässt Farbe nur über eine Registry-Achse zu,
und weder `is_active` (L-241) noch „zwei Regeln an einem Fall" hat eine. Rot
wäre ohnehin falsch: eine abgeschaltete Regel ist kein Fehler, und der
Tabellenkommentar lässt zwei Regeln je Fall ausdrücklich zu. Sichtbar werden
sie durch das **Wort**, nicht durch den Ton (V7).

**Der Doppelgriff braucht eine Zahl, die die Zeile heute nicht hat.** Er lässt
sich nicht aus den sichtbaren Zeilen ableiten: sobald ein Filter greift, kann
die zweite Regel eines Falls ausgeblendet sein, und die Marke wäre eine Lüge.
Er kommt deshalb als Feld `caseRuleCount` je Zeile — **eine Prop an 0132**,
kein Nachbau, und ein Satz in dessen Spec. Die Query liefert sie heute nicht
(**L-263**).

**Was der Satz bewusst nicht enthält:** `priority` (Rang 26 — alle 30 Zeilen
tragen `100`, eine tote Spalte, siehe 0132), die Perioden und die letzte
Zahlung (Spalten der Fälligkeitsliste, hier ohne Frage dahinter), den
Klartext-Satz und die Toleranz (ab M, `RecurringRuleFacts`).

## Schnittstelle

Die Liste definiert **kein Zeilenmodell**: `RuleOverviewItem` liegt in
`infrastructure/` und ist nicht gespiegelt (**L-240**). Sie nimmt die Zeilen
als `RecurringRuleRowData & { id }` — dieselben Felder, die 0132 einzeln
entgegennimmt.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `rules` | `readonly RecurringRuleListRow[]` | ja | die Zeilen **dieser Seite**, vom Aufrufer bereits sortiert und gefiltert (E1/E2 von `DataTable`) | `Filled` |
| `labels` | `RecurringRuleLabels` | ja | die deutschen Wörter, die der Spiegel nicht führt (L-242, L-256); ein Wert ohne Wort steht **roh** da | `Filled` · `Edges` |
| `ruleHref` | `(rule: RecurringRuleListRow) => string` | ja | Frage 4 des Profils: der Weg in den Regelwerk-Reiter des Sachverhalts. Er liegt auf der **ganzen Zeile** (I11) | `Filled` |
| `accountHref` | `(accountNumber: string) => string` | nein | Weg ins Kontenblatt für Gegen- und Personenkonto. Ohne ihn stehen die Konten als Text — nie ein Knopf, der nichts tut | `Filled` |
| `casesWithoutRule` | `{ count: number; href: string }` | nein | Frage 3 des Profils: die Dauersachverhalte **ohne** Regel, mit ihrem Weg. Trägt Zone 6 der Karte **und** den Leerfall. `count` zählt mit dem Filter, den `href` anwendet (**I12**) | `Empty` · `InUse` |
| `total` | `number` | nein | wie viele Regeln der Mandant hat — der Nenner des Zählers im Kopf („12 von 30 Regeln") | `Filled` · `EmptyAfterFilter` |
| `sort` | `{ key: string; dir: "asc" \| "desc" }` | nein | der Zustand aus der URL; der aktive Kopf trägt den Pfeil | `Filled` |
| `href` | `(patch: ListPatch) => string` | nein | die Seite baut die URL. **Pflicht, sobald `sort` gesetzt ist** — ohne ihn bleibt ein sortierbarer Kopf ein Wort | `Filled` |
| `filtered` | `{ summary: string; resetHref: string }` | nein | ein Filter ist an: gibt den Leertext **nach** dem Filter und den Weg zurück (T6) | `EmptyAfterFilter` |
| `loading` | `boolean` | nein | Kopf und Spaltenköpfe bleiben stehen (I7) | `Loading` |
| `error` | `{ message: string; retry?: ReactNode }` | nein | Text nach T5 plus **ein** Weg, es noch einmal zu versuchen | `Error` |

**Elf Props, und §4 sagt: trotzdem eine Komponente.** Fünf davon (`sort`,
`href`, `filtered`, `loading`, `error`) sind der Rahmen-Zustand von
`DataTable`, unverändert durchgereicht — dieselbe Begründung wie bei
`BankTransactionWorklist`. Trennen erzeugte nur Durchreich-Props.

Typen: `RecurringRuleLabels` aus `entities/recurring-rule/recurring-rule.ts` ·
`RecurringRuleRowData`, `RecurringRuleListRow`, `RecurringRuleColumn` aus dem
Katalog · `ListPatch` aus `patterns/DataTable` · aus `src/ludwig/`:
`RuleBookingMode`, `RuleDirection`, `RuleExpectedInterval`,
`RuleDocumentNumberStrategy`, `PreviewAccount`, `RULE_INTERVAL_LABEL`.
GLOSSARY: `recurring rule` im Code, „Wiederkehr-Regel" im Label;
`Belegnummern-Strategie`, „Personenkonto", „Gegenkonto" deutsch im Kopf.

### Der Katalog

| Export | Was es ist |
|---|---|
| `RecurringRuleColumn` | die zwölf Zellen der Familie; `columns` **wählt aus**, es ordnet nie um — die Reihenfolge ist die Rangordnung des Profils und in jeder Form dieselbe |
| `RecurringRuleRowData` | die Felder einer Zeile — kein Modell, sondern der Schnitt, den 0132 heute einzeln entgegennimmt |
| `RecurringRuleListRow` | dasselbe mit `id`, was jede Liste ihrem Rahmen reicht |
| `RECURRING_RULE_COLUMN_LABEL` | das Wort über jeder Zelle |
| `RECURRING_RULE_ROW_COLUMNS` | Satz 1 — die Vorgabe der Zeile: Ränge 1–5 und 7 |
| `RECURRING_RULE_OVERDUE_COLUMNS` | Satz 2 — die Fälligkeitsliste (0133) |
| `RECURRING_RULE_BOOK_COLUMNS` | Satz 3 — das Regelwerk des Mandanten (0131) |
| `recurringRuleTracks()` | die Spur für einen Satz, damit Kopf und Zeilen dieselbe lesen |
| `recurringRuleColumns()` | die `ColumnDef`-Objekte für `DataTable` |

**Was die Liste bewusst nicht kann:**

- **Keine Filterzeile.** `FilterBar` bleibt bei der Seite — sie hält den
  Zustand, liest die URL und kennt die Werte; das ist Domänenwissen des
  Aufrufers (`DataTable @instead`, dieselbe Aufteilung wie bei `CaseList` und
  `BankTransactionList`). Die Liste nimmt nur das Ergebnis (`filtered`).
- **Kein Sortieren und kein Laden.** Beides tut die Seite über die URL; die
  Liste spiegelt den Zustand (E1, E2).
- **Keine Massenaktion und keine Zeilenaktion.** „Auskunft, keine Aufgabe":
  geändert wird eine Regel am Sachverhalt (`RecurringRuleEditor`, 0135),
  angelegt wird sie dort auch. Eine Liste, aus der heraus man 30 Regeln
  einzeln aufklappt, ist ein Editor mit Umweg (Seitenprofil, „Was hier nicht
  hingehört").
- **Kein Pager.** Der größte Mandant hat 30 Regeln, fünf von sechs haben
  keine. Ein Pager unter 30 Zeilen ist Zubehör.
- **Kein `columns`-Prop.** Der Satz **ist** der Job. Wer einen anderen
  braucht, nimmt `recurringRuleColumns()` — dafür ist der Katalog da; eine
  Prop auf Vorrat wäre A12.

## Verhalten

**Server-Component.** Kein Zustand, kein Client-JS: Sortieren und Filtern sind
Links, Auswahl und Aufklappen gibt es nicht. Die Tastatur läuft über die
Links — Zeile, Spaltenkopf, Konto, Zone 6 —, jeder mit eigenem Text statt
`aria-label` (I11).

**Der Zeilen-Link liegt auf der ersten Zelle**, also auf dem Sachverhalt, und
deshalb bekommt der Katalog für diese Liste **kein** `caseHref`: `CaseCell`
brächte einen eigenen Anker mit, und ein Anker im Anker ist ungültiges Markup
(gemessen in 0101 als Hydration-Warnung). Der Text der Zeile — „2026-0413
Miete Musterstraße 12" — sagt selbst, wohin er führt.

Die fünf Zustände:

| Zustand | Was steht da |
|---|---|
| gefüllt | die Zeilen, Zähler im Kopf, Zone 6 mit der Zahl der Sachverhalte ohne Regel |
| **leer (Vorrat)** | siehe unten — der Normalfall, nicht der Rand |
| leer nach Filter | `DataTable` schreibt „Keine Treffer für „…"" und den Weg zurück |
| lädt | Kopf und Spaltenköpfe bleiben, fünf Skelettzeilen |
| Fehler | Text plus `retry` |

**Der Leerfall ist der Normalfall: fünf von sechs Mandanten haben keine
einzige Regel.** „Keine Einträge" wäre dort keine Aussage. Er hat deshalb zwei
Formen, und welche gilt, entscheidet die Zahl:

- **`casesWithoutRule.count > 0`** → „**15 Dauersachverhalte, keiner mit
  Regel.**" Dazu der Satz, wo eine Regel entsteht, und der Weg in die
  gefilterte Sachverhaltsliste. Das ist die Aussage, die das Seitenprofil in
  seiner dritten offenen Frage als Default setzt — und die Zahlen tragen sie:
  von 104 Dauersachverhalten liegen 75 bei genau diesen fünf Mandanten.
- **`count === 0` oder Prop fehlt** → „Für diesen Mandanten ist noch keine
  Wiederkehr-Regel angelegt." **Das ist die Ergänzung, die der Default
  braucht:** „0 Dauersachverhalte, keiner mit Regel" ist genauso wenig eine
  Aussage wie „Keine Einträge". Ein Mandant ohne Dauersachverhalt bekommt
  deshalb den zweiten Satz und keinen Weg — es gibt nichts, wohin er führte.

**Kein Haken am Leerfall.** `DataTable empty.done` setzt das Erledigt-Zeichen;
hier ist leer kein Erfolg, sondern ein Vorrat.

## Stories

Abgeleitet nach `spec-schreiben` §6: **5** anwendbare Zustände (gefüllt · leer
· leer nach Filter · lädt · Fehler) + **0** Enum-Props + **0** Layout-Booleans
+ **0** Callbacks (`ruleHref`, `accountHref` und `href` bauen URLs, sie sind
kein Rundlauf — derselbe Grund wie bei `caseHref` in 0132) + **1** „im
Einsatz" + **1** Rand (die Liste kürzt Namen und formatiert Beträge) = **7**.
Titel `v3/Entitäten/Wiederkehr-Regel/RecurringRuleOverview`.

| Story | Beweist |
|---|---|
| `Filled` | acht Zeilen des Bestands: sortiert nach Gültigkeit (Pfeil am Kopf), darin **die drei Auffälligkeiten** — eine inaktive, eine ohne Personenkonto, zwei am selben Sachverhalt mit der Marke „2 Regeln". Konten mit Weg, Zähler „8 von 30 Regeln", Zone 6 mit „15 Dauersachverhalte ohne Regel" |
| `Empty` | der **Normalfall** — zwei Karten nebeneinander: ein Mandant mit 15 Dauersachverhalten ohne Regel (Zahl + Weg) und einer ohne jeden Dauersachverhalt (Satz ohne Weg) |
| `EmptyAfterFilter` | derselbe Bestand, Filter „inaktiv" ohne Treffer: „Keine Treffer für …" und „Filter zurücksetzen"; im Kopf „0 von 30 Regeln" |
| `Loading` | Kopf und zehn Spaltenköpfe stehen, fünf Skelettzeilen darunter (I7) |
| `Error` | Fehlertext nach T5 mit **einem** Weg zurück |
| `InUse` | wie auf der Seite: `PageHeader`, `FilterBar` mit zwei Feldern darüber, die Karte darunter — bei der Breite, die der Baustein auf der Konfigurationsseite hat |
| `Edges` | 30 Zeilen (der größte Mandant im Bestand), darin eine Gegenpartei mit 46 Zeichen, eine Regel ohne Kriterium, eine ohne Rhythmus, ein Betrag `null`, ein Sachverhalt ohne Titel, `fixed` als Belegnummern-Strategie und ein Richtungswert, für den `labels` **kein** Wort hat (steht roh da) |

Nicht anwendbar und warum: `Varianten` — die Liste hat keine Enum-Prop, der
Spaltensatz ist fest. `Interaktiv` — kein Callback; die vier Wege sind Links,
kein Rundlauf.

Daten: der Zuschnitt des Bestands (30 Regeln, monatlich, Zahltag 1.,
`accrue_then_settle`, Toleranz 0,00, achtstellige DATEV-Belegnummer), Werte
erfunden (Musterfirma GmbH, 1.800,00 €), Fixtures aus `fixtures.ts`.

## Befunde für `ludwig/app`

Alle drei zusätzlich als Zeile in `docs/befunde-app.md`.

| Nr. | Was | Was hier darauf wartet |
|---|---|---|
| **L-262** | **Zwei Ableitungen für denselben Betrag.** `RuleOverviewItem.previewAmount` ist `matchAmount ?? Summe(template_lines)`; die Domäne rechnet `accrualAmount()` als `template.amount → Summe(lines) → matchAmount`. Die Query wählt `template_amount` **gar nicht** aus. Im Bestand unsichtbar (alle 30 gleich), strukturell eine zweite Wahrheit | die Liste rechnet nicht: `amount` kommt fertig herein und **muss** `accrualAmount()` sein |
| **L-263** | **„Welche greift doppelt?" ist aus einer Zeile nicht beantwortbar.** Die Query sortiert die zwei Regeln eines Falls nur nebeneinander (`order by … case_number asc, priority asc`); eine Zahl „wie viele Regeln hängen an diesem Fall" gibt es nicht. Aus den sichtbaren Zeilen zu zählen ist falsch, sobald ein Filter greift | `caseRuleCount` je Zeile — ohne sie bleibt die Marke „2 Regeln" aus, und die dritte der drei Auffälligkeiten ist unsichtbar |
| **L-264** | `listRulesOverviewForClient` wählt **`document_number_strategy` nicht aus** — Rang 22, im Bestand 100 % gefüllt (`period_key` 26 · `from_document` 3 · `fixed` 1). Auch `profile_source` (Rang 23) und `matches_documents` fehlen | die Spalte „Belegnummern-Strategie" steht im Satz und bleibt leer, bis die Query eine Zeile mehr `select`t |

## Offene Fragen

Höchstens drei, jede mit Default — der Bau wartet nicht. Alle drei sind die
des Seitenprofils, hier gegen die Zahlen geprüft.

1. **Zeigt die Seite auch, was fehlt?** *Default des Profils: als Zahl, ja.*
   **Hält** — 75 von 104 ist die größere Aussage als die 30 gebauten. **Aber
   nicht als Kachel über der Karte:** die Zahl trägt hier Zone 6 **und** den
   Leerfall, und dieselbe Zahl zweimal auf einer Seite ist genau das Driften,
   vor dem I12 warnt. Eine Kachel bliebe der Seite unbenommen; die Liste
   verlangt sie nicht.
2. **Gehört sie in die Konfiguration?** *Beantwortet, Owner 2026-09-08:* ja,
   Route `clients/[clientSlug]/configuration/recurring-rules`, englisch. Für
   das Set folgenlos — die Liste kennt keine Route.
3. **Was macht die Seite bei einem Mandanten ohne Regeln?** *Default des
   Profils: die Zahl der Dauersachverhalte nennen und dorthin führen.*
   **Hält, mit einer Ergänzung:** bei `count === 0` ist auch die Zahl keine
   Aussage. Dann steht der Satz ohne Zahl und ohne Weg. Siehe „Verhalten".

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ein Zeilenmodell statt der Feldliste | `rules: RuleOverviewItem[]` | **L-240** ist gelöst — der Anzeige-Typ liegt in `recurring-rules/domain/` |
| Farbe für die Gültigkeit | `StatusBadge axis="regel_gueltigkeit"` im Katalog | **L-241** ist entschieden |
| Die Herkunft des Profils als Spalte (Rang 23) | `profileSource` an `RecurringRuleRowData` | **L-264** ist gelöst — heute wählt die Query sie nicht aus, und 24 von 30 Regeln tragen ein nie geprüftes `onboarding`-Profil |
| `priority` als Spalte | `priority: number` | **L-245** — erst wenn die Rangfolge etwas entscheidet, das man sieht; heute tragen alle 30 die `100` |
| Ein Pager | `pager` an `DataTable` durchreichen | ein Mandant überschreitet ~100 Regeln |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Zehn Spalten in der Rangordnung 6, 1, 2, 3, 4, 5, 7, 10, 11, 22; Kopf und Zeilen stehen auf derselben Spur (`recurringRuleTracks`)
- [ ] Die **drei Auffälligkeiten** tragen je ein Wort: „inaktiv", „ohne Personenkonto", „2 Regeln" — und **keine Farbe** (Story `Filled`)
- [ ] `rules` verhält sich wie Zeile 1 der Schnittstelle: die Liste sortiert und filtert nicht (Story `Filled`)
- [ ] `ruleHref` legt den Weg auf die **ganze** Zeile, `.v2rowlink`, genau ein Fokus-Stopp, kein `<a>` in `<a>` (Story `Filled`)
- [ ] `accountHref` macht Gegen- und Personenkonto zu Wegen; ohne die Prop bleiben sie Text (Story `Filled`)
- [ ] `casesWithoutRule` trägt Zone 6 **und** den Leerfall; `count === 0` bekommt den Satz ohne Zahl und ohne Weg (Story `Empty`, `InUse`)
- [ ] `total` bildet den Nenner im Kopf; ohne die Prop steht dort nur die Trefferzahl (Story `Filled`, `EmptyAfterFilter`)
- [ ] `sort` + `href` machen vier Köpfe zu Sortier-Links, nur der aktive trägt den Pfeil, `aria-sort` steht am `th` (Story `Filled`)
- [ ] `filtered` ersetzt den Leertext durch „Keine Treffer für …" mit Weg zurück (Story `EmptyAfterFilter`)
- [ ] `loading` lässt Kopf und Spaltenköpfe stehen (Story `Loading`); `error` zeigt einen Weg zurück (Story `Error`)
- [ ] Ein Wert ohne deutsches Wort steht **roh** da, er verschwindet nicht (Story `Edges`)
- [ ] `RecurringRuleRow` (0132) rendert **dieselben** Zellen aus dem Katalog — keine zweite Zell-Definition (R17), Stories von 0132 und 0133 unverändert grün
- [ ] Die drei Befunde stehen in `docs/befunde-app.md`

## Gebaut 2026-09-08

| | |
|---|---|
| Gebaut von / am | Claude, 2026-09-08 (Skill `v3-komponente`) |
| Neu | `src/ui/v3/entities/recurring-rule/recurring-rule-columns.tsx` · `RecurringRuleOverview.tsx` · `RecurringRuleOverview.stories.tsx` |
| Berührt | `RecurringRuleRow.tsx` (rendert dieselben Zellen aus dem Katalog, fünf optionale Props dazu — Satz in 0132) · `RecurringRuleRow.stories.tsx` (nur Import-Pfad) · `RecurringRuleList.tsx` (nur Import-Pfad und der benannte Satz) · `src/ui/v3/index.ts` · `src/styles/v3.css` (ein Abschnitt am Ende, eine Klasse `.v2rrov__dup`) |
| Nicht angefasst | die App. Die drei Befunde stehen in `docs/befunde-app.md` |

### Grün

`pnpm typecheck` · `check:language` · `check:icons` · `check:contrast` ·
`check:mirror` · `check:when` · `check:jobs` — alle **Exit 0**.
`pnpm build` **nicht** gelaufen: wer im Arbeitsbaum misst, baut nicht
(Owner-Entscheid 2026-09-07, Befund 0117); gemessen wurde gegen den
Dev-Server auf 6107.

### Gemessen

Ein Messbrowser für alle Durchgänge (`scripts/cdp.mjs`), Aktion und Messung
in getrennten `Runtime.evaluate`-Aufrufen.

**Alle 18 Stories der Familie** (die sieben neuen, dazu die sieben von 0132
und die vier von 0133 als Rückfall-Prüfung) rendern sichtbar und schreiben
**nichts** in die Konsole. Der einzige 404 des Laufs ist
`http://localhost:6107/favicon.ico` — Storybooks eigener, einmal je frischem
Browser, mit `Network.enable` nachgewiesen.

| Was | Gemessen |
|---|---|
| Spaltensatz | **10** Köpfe in der Rangordnung: Sachverhalt · Gegenpartei · Buchungsweise · Gültigkeit · Erwartet · Rhythmus · Richtung · Gegenkonto · Personenkonto · Belegnummern-Strategie |
| Spurentreue | Kopf und **jede** Zeile stehen auf derselben x-Kante: `driftMax` **0 px** bei 700 · 1100 · 1400 · 1920 px, in `Filled` (8 Zeilen), `InUse` (8) und `Edges` (**30**) |
| Zeilenhöhe | eine Höhe, 46/47 px, in allen drei Stories bei allen vier Breiten (V1) |
| Zahlen rechts | genau **eine** Spalte trägt `v2num` — „Erwartet" (V3); alles andere links |
| Zeilen-Link | 8 bzw. 30 × `a.v2rowlink`, **0** verschachtelte Anker; Text des ersten: „2026-0413 Miete Musterstraße 12" → `#fall-c-4413-regelwerk` (I11, kein `aria-label` nötig) |
| Kontowege | 14 `a.v2acc--link` in `Filled` (7 Zeilen × 2 Konten), 58 in `Edges` |
| Sortierung | `aria-sort="descending"` am `th` „Gültigkeit"; die vier Sortier-Links sagen den Zustand in Worten („Nach Gültigkeit sortieren — derzeit absteigend") |
| Die drei Auffälligkeiten | in `Filled` je genau einmal: „inaktiv" · „ohne Personenkonto" · „2 Regeln" (zweimal, an beiden Zeilen desselben Falls). Dazu „ohne Gegenkonto" |
| Farbe | **0** Zellen mit rotem Text im Körper — die Auffälligkeiten tragen Wörter, keinen Ton (V7, R1) |
| Leerfall | zwei Karten: „15 Dauersachverhalte, keiner mit Regel." mit „Dauersachverhalte ansehen" — und daneben „Für diesen Mandanten ist noch keine Wiederkehr-Regel angelegt." **ohne** Zahl und **ohne** Weg |
| Leer nach Filter | „Keine Treffer für „Gültigkeit: inaktiv · Buchungsweise: nur zuordnen"." mit „Filter zurücksetzen"; Kopf „0 von 30 Regeln" |
| Lädt · Fehler | Kopf und alle zehn Spaltenköpfe bleiben stehen; 5 Skelettzeilen bzw. „Das Regelwerk konnte nicht geladen werden." + „Erneut laden" |
| Rohe Werte | `Edges` mit `LABELS_WITH_GAPS`: **29 ×** `payment_out` und `fixed` stehen roh da, sie verschwinden nicht (L-242, L-256) |
| Seitenüberlauf | **0 px** bei allen vier Breiten; unter 1620 px scrollt `.v2tbl__scroll` in der Karte, ab 1920 px nicht mehr |

### Zwei Funde beim Bauen

1. **Die Gegenpartei-Spur ist auf 180 px angehoben, MIN_WIDTH auf 1620.** Mit
   `minmax(0, 1fr)` und `minWidth: 1480` blieben der Gegenpartei — Rang 1, die
   Identität der Zeile — **54 px**, und die Pille „ohne Kriterium" brach in
   eine zweite Zeile: die Zeile wuchs von 47 auf **63 px**, gegen V1.
   Nachgerechnet: neun feste Spuren 1300 px + neun Lücken 126 px + 180 px
   Boden = 1606. Ein **fester** Boden kann die Drift nicht zurückbringen — er
   ist in Kopf und Zeilen dieselbe Zahl, anders als `auto`; die Messung bei
   vier Breiten bestätigt 0 px. Die Änderung sitzt im Katalog und gilt damit
   auch für 0132 und 0133; dort ändert sie nichts (0133 rechnet mit 1180 px
   Mindestbreite und lässt der Spalte ohnehin 196 px).
2. **Die drei App-Befunde L-262 bis L-264** (siehe oben) sind beim Lesen von
   `rule-overview-queries.ts` entstanden — die Query liefert drei Felder des
   Spaltensatzes nicht und rechnet den erwarteten Betrag ein zweites Mal.

### Was hier entschieden wurde, weil das Seitenprofil es offen ließ

**Die Zahl der Sachverhalte ohne Regel steht in Zone 6 der Karte, nicht als
`KpiTile` darüber.** Das Profil nennt in Frage 3 die Kachel als Baustein. Sie
steht hier nicht, aus zwei Gründen: dieselbe Zahl trägt auch den Leerfall, und
zweimal dieselbe Zahl auf einer Seite ist das Driften, vor dem **I12** warnt;
und eine Kachel über der Karte ist Möblierung der Seite — wie die
`FilterBar`, die aus demselben Grund draußen bleibt. Zone 6 ist „der nächste
Schritt mit seiner Zahl" (I10), und genau das ist Rang 3 der Fragenliste: er
kommt **nach** der Liste. Wer auf der Seite zusätzlich eine Kachel will, baut
sie dort; die Liste verlangt sie nicht und die Prop dafür gibt es nicht.

### Die drei Fragen des Profils, gegen die Zahlen

| Frage | Default | Hält? |
|---|---|---|
| 1 — zeigt die Seite auch, was fehlt? | als Zahl, ja | **ja**, 75 von 104 ist die größere Aussage. Nur der Ort ist ein anderer (oben) |
| 2 — gehört sie in die Konfiguration? | beantwortet (Owner) | für das Set folgenlos — die Liste kennt keine Route |
| 3 — was bei einem Mandanten ohne Regeln? | Zahl der Dauersachverhalte nennen und dorthin führen | **ja, mit einer Ergänzung.** 75 Dauersachverhalte liegen bei den fünf regellosen Mandanten, die Zahl ist also je Mandant zweistellig und trägt. Bei `count === 0` trägt sie nicht: „0 Dauersachverhalte, keiner mit Regel" ist so leer wie „Keine Einträge", und ein Weg in eine leere Liste führt nirgendwohin. Dafür gibt es den zweiten Satz |

### Offen für die Abnahme

- **Belegnummern-Strategie bleibt leer, bis L-264 erledigt ist.** Die Spalte
  steht im benannten Satz, weil das Profil sie führt; die Query liefert sie
  nicht. Sichtbar ist sie in den Stories, weil die Fixtures sie setzen.
- **Die Marke „2 Regeln" braucht L-263.** Ohne `caseRuleCount` bleibt die
  dritte Auffälligkeit unsichtbar — das ist der ehrliche Zustand, kein
  stiller Rückfall.
- **`docs/jobs.md` J-54 steht weiter auf `unbedient`** („Bedient von" beginnt
  mit Gedankenstrich). Das ist richtig, solange die Route drüben fehlt — der
  Zustand gehört dem Owner, nicht dieser Aufgabe. `pnpm check:jobs` ist grün.
- Die gemessene Prüfung ist **keine schlanke Abnahme**: Maße, Spurentreue und
  Zeilenhöhen sind bei vier Breiten gemessen. Kontraste, Trefferflächen,
  Hover und Tastaturwege bleiben bei **0119**.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …

## Entscheid 2026-09-08 — `matchesDocuments` bekommt keine Spalte

Die App liefert das Feld seit `4828f6c0`. Es bleibt trotzdem aus dem
Spaltensatz, aus zwei Gründen, und der zweite wiegt schwerer:

**Es unterscheidet nichts.** 29 von 30 Regeln tragen `true` (Profil, Rang 21).
Eine Spalte, die in 97 % der Zeilen dasselbe sagt, kostet Breite und hilft bei
keiner der Fragen, die diese Liste beantwortet — dieselbe Begründung, aus der
0133 die Gültigkeits-Spalte weglässt, wenn die Grundgesamtheit schon „aktiv"
heißt.

**Und es sagt vermutlich nicht, was es behauptet.** `matches_documents` steht
auf `true`, obwohl **keine** Regel ein Beleg-Kriterium trägt:
`match_contract_number` und `match_document_text_regex` sind zu 0 % gefüllt
(Befund **L-249**, offen). Solange das so ist, wäre die Spalte nicht bloß
nutzlos, sondern eine Behauptung über einen Treffer, den die Daten nicht
decken. Eine Spalte, die 29-mal dasselbe Falsche sagt, ist schlimmer als
keine.

**Wo das Feld hingehört, hat es schon einen Platz:** `RecurringRuleFacts`
(0134) zeigt es — und zwar **nur bei `true`**, als Zeile im Auslöser-Block.
Dort steht es neben den Kriterien, aus denen es folgen soll, und dort fällt
auch auf, wenn beide fehlen.

**Was den Entscheid umdreht:** wenn L-249 erledigt ist und Regeln mit echtem
Beleg-Kriterium im Bestand stehen, unterscheidet das Feld wieder — dann ist es
eine Spalte, und der Katalog trägt sie ohne Umbau (ein Katalog, drei Sätze).
