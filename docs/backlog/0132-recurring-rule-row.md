# 0132 · `RecurringRuleRow`

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-08, am selben Tag nachgearbeitet; die gemessene Prüfung steht in 0119 aus |
| Stufe | `entities/recurring-rule/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Buchungsweise (Sollstellung ⇄ Bei Zahlung), Personenkonto und Dauersachverhalt sind Ludwig-Fachbegriffe |
| Quelle | Entitätsprofil `docs/entitaeten/recurring-rule.md` (Status **geprüft**, 2026-09-08), Abschnitte „Datenpunkte" (Ränge 1–7), „Relationen", „Formen" (Zeile `RecurringRuleRow`), „Zuschnitt" (Marke **jetzt**) |
| Domänen-Stand | gelesen gegen **`origin/staging`** in `ludwig/app` (2026-09-08), nicht gegen den eingefrorenen Spiegel `src/ludwig/`. **Erledigt, deshalb hier nicht mehr als offen geführt:** ~~L-253~~ (`2c0c888f` — `matchTransaction()` und `hasAnyCriterion()` lesen eine gemeinsame Liste `MATCH_CRITERIA`) · ~~L-254~~ (`9a3ce2db` — `RULE_PRIORITY_DEFAULT = 100` für alle drei Schreiber) · ~~L-244~~ (`b7544542` — das Präfix heißt jetzt `datev-wk:`, die Warnung kann erscheinen) · **L-243 b** (`5e48d892` — die lokalen Maps in `wiederkehrende.ts` sind weg). **Offen und tragend für diese Spec:** L-240, L-241, L-242, **L-243 a** (`Schritt5.tsx:100` gibt den Rhythmus weiter roh aus), L-245, L-249 und die drei neuen L-255 bis L-257. **Wer baut, holt vorher den Spiegel nach** (`scripts/sync-ludwig.sh`) — die eingefrorene Fassung kennt `MATCH_CRITERIA` und `RULE_PRIORITY_DEFAULT` noch nicht |
| Ersetzt | die handgeschriebene Zeile in `ErwarteteZahlungen` (`modules/stapelabnahme/ui/Schritt5.tsx` Z. 77–113; die rohe Rhythmus-Ausgabe steht in Z. 100 — Fundstellen nach Prüfpunkt **P9** berichtigt) |
| Blockiert | 0133 (`RecurringRuleList`), die sie in ihren Rahmen steckt · 0131 (Regelwerk des Mandanten, Backlog) · den Regelwerk-Reiter des `CaseDetailView`, sobald er mehr als eine Regel zeigen darf (L-245) |
| Spec von / am | Claude, 2026-09-08 (Skill `spec-schreiben`) |

## Ziel

Die Buchhalterin sieht eine Wiederkehr-Regel in einer Liste und will drei
Dinge wissen, bevor sie weiterliest: **wen betrifft sie, was tut sie bei einem
Treffer, greift sie überhaupt noch?** Heute steht dafür in Schritt 5 der
Stapelabnahme eine von Hand gebaute Vierspalten-Zeile, die genau die zwei
Angaben weglässt, die diese Fragen beantworten — Buchungsweise und Gültigkeit
—, und den Rhythmus roh englisch ausgibt (`monthly` statt „monatlich",
Befund **L-243 a**, weiterhin offen — die Schwester **b**, die falsche
Modus-Map in `wiederkehrende.ts`, ist drüben mit `5e48d892` behoben).

Diese Zeile ist die erste Form der Familie: sie hat heute keinen einzigen
Baustein im Set, und zwei Listen (0133 jetzt, 0131 später) setzen auf ihr auf.

## Einordnung

- **Wiederverwenden:** kein `@when` in `src/ui/v3` nennt die Wiederkehr-Regel.
  Der einzige Treffer, der sie überhaupt erwähnt, ist `JournalEntryCard`
  („recurring rule preview") — und der zeigt die *Wirkung* der Regel, nicht die
  Regel. `CaseRow` ist die Zeile des **Sachverhalts**, nicht die seiner
  Konfiguration.
- **Neu, weil:** `spec-schreiben` §3 **Nr. 5** — `ui-repraesentationen.md` §1
  führt die Wiederkehr-Regel als eigene Entität, und keine vorhandene Form
  (Zeile, Karte, Detail) deckt sie ab. Nr. 1–4 greifen nicht: kein `@when`
  passt (Nr. 1, 2), die Zeile trägt Fachwörter (Nr. 3), und sie hat weder
  eigenen Zustand noch eigenen Tastaturweg (Nr. 4).
- **Zuschnitt:** **zwei Dateien**, eine Familie im Sinne von §4:
  - `RecurringRuleRow.tsx` — die Zeile. `recurringRuleTracks()` und die Union
    `RecurringRuleColumn` standen hier, solange es nur die Zeile gab; seit
    0131 liegen sie in `recurring-rule-columns.tsx`, wo auch die
    `ColumnDef`-Fassung derselben Zellen entsteht. Kopfzeile und Zeilen lesen
    dieselbe Spur (Muster `bankTransactionTracks`) — jetzt aus dem Katalog.
  - `recurring-rule.ts` — das **Wörterbuch der Familie**
    (`RecurringRuleLabels`, `ruleLabel()`), das Zeile, Fakten und Editor
    gemeinsam brauchen. Zweimal dieselbe Wortliste wäre eine zweite Wahrheit
    (Muster `invoice-line.ts` aus 0072).
  
  **Nicht getrennt** wird die Zeile von ihren Zellen: eine
  `recurring-rule-columns.tsx` mit `ColumnDef`-Objekten braucht erst, wer
  `DataTable` rahmt — das ist 0131. Der Auslöser steht im Ausbau; eine
  Spaltendefinition auf Vorrat wäre A12.
- **Setzt auf:** `Row` und `Table` (0106), `CaseCell` (0095), `StatusBadge`
  (`axis="regel_modus"`), `AmountCell`, `MonoCell`, `Time`, `Badge`. Aus dem
  Spiegel: `RULE_INTERVAL_LABEL`, `RuleBookingMode`, `RuleDirection`,
  `RuleExpectedInterval` (`src/ludwig/modules/recurring-rules/domain/rule.ts`).

## Was die Zeile zeigt

Die Ränge 1–7 des Profils, in der Reihenfolge des Profils. Kumulativ: was XS
zeigt, zeigt S auch.

| Rang | Zelle | Woraus | Darstellung |
|---|---|---|---|
| 1 | Gegenpartei-Kriterium | **abgeleitet** `matchCounterpartyName ?? matchCounterpartyIban` | Text; IBAN in `MonoCell`. Ist **beides** leer, steht dort das Wort **„ohne Kriterium"** — nicht „—" |
| 2 | Buchungsweise | `bookingMode` | `StatusBadge axis="regel_modus"` — drei Werte, `match_only` eingeschlossen |
| 3 | Gültigkeit | `isActive` | **Wort ohne Farbe**: „aktiv" / „inaktiv" (bis L-241 entschieden ist) |
| 4 | Erwarteter Betrag | `accrualAmount(rule)` **beim Aufrufer** | `AmountCell` (Default-Währung EUR — die Regel hat keine Währungsspalte) |
| 5 | Rhythmus | `expectedInterval` über `RULE_INTERVAL_LABEL` | Wort; ohne Rhythmus „ohne Rhythmus" (das heißt: kein Überfälligkeits-Check) |
| 6 | Sachverhalt | `caseId` + Nummer/Titel | `CaseCell` — **nur außerhalb seines Falls**, dann als **erste** Zelle |
| 7 | Richtung | `expectedDirection` über `labels.direction` | Wort; fehlt das Wort, steht der Rohwert da (L-256) |

Dazu zwei Zellen, die nicht aus der Spaltenliste der Regel stammen und
deshalb nur erscheinen, wenn der Aufrufer sie bestellt:

| Zelle | Woraus | Warum |
|---|---|---|
| Perioden | Relation Ereignisse, als **Zähler** | Das Profil sieht die Ereignisse in S als Zähler vor („n Perioden"); die Liste in L zeigt sie über `CaseTimeline` |
| Letzte Zahlung | Datum + Betrag der letzten zugeordneten Zahlung | Die Spalte der Fälligkeitsliste (0133). `null` heißt **„noch keine"**, nicht „unbekannt" |

**Rang 1 ist abgeleitet, nicht die Namensspalte.** Das ist der eine
blockierende Punkt der Profilprüfung (**P1**): die 100 % Füllgrad von
`match_counterparty_name` sind eine Eigenschaft des F91-Imports.
`prefillFromTransaction()` (`rule.ts:708–724`) setzt bei vorhandener IBAN
ausdrücklich `matchCounterpartyName: null` — eine aus einer Zahlung gelernte
Regel trägt **strukturell** keinen Namen. Eine Zeile, die nur den Namen
zeigte, wäre für jede Agenten-Regel leer. `describeRecurringRule()` entscheidet
genauso: Name **oder** IBAN an derselben Satzstelle.

**Was die Zeile bewusst nicht zeigt:**

- **`priority` (Rang 26)** — Owner-Entscheid vom 2026-09-08, und er hält
  gerade **weil** ~~L-254~~ drüben behoben ist (App-Commit `9a3ce2db`:
  `RULE_PRIORITY_DEFAULT = 100` steht einmal in der Domäne, alle drei
  Schreiber lesen sie — vorher schrieb das Formular still `0`). Seither trägt
  jede Regel denselben Wert, und eine Spalte, in der 30 von 30 Zeilen `100`
  steht, ist eine tote Spalte (derselbe Fall wie „Rabatt", L-201). Etwas zu
  sehen gibt es erst, wenn ein Fall zwei Regeln zeigt (**L-245**, offen).
- **den Klartext-Satz (Rang 12)** — er gehört ab M zu `RecurringRuleFacts`.
  Die Zeile rechnet ihn **nicht** nach: eine Form, die eine Ableitung der
  Domäne nachbaut, ist die zweite Wahrheit. Genau daran ist die App gerade
  hängengeblieben (~~L-253~~, behoben mit `2c0c888f`: `matchTransaction()`
  und `hasAnyCriterion()` zählten über **zwei** Aufzählungen, von denen eine
  den Zweck-Regex nicht kannte; heute lesen beide dieselbe Liste
  `MATCH_CRITERIA`). Das Set macht daraus keine dritte.
- **die geltende Toleranz (Rang 17)** — sie steht ab M, und im Bestand ist sie
  in allen 30 Zeilen `0,00`.

## Schnittstelle

Die Zeile nimmt ihre Felder **einzeln** entgegen und definiert **kein
Zeilenmodell**: `OverdueRecurringItem` und `RuleOverviewItem` liegen in
`application/` bzw. `infrastructure/` und sind nicht gespiegelt (**L-240**);
ein eigener Typ wäre die lokale Erfindung, die §5 verbietet.

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `counterpartyName` | `string \| null` | ja | Rang 1a — `match_counterparty_name` | `Filled` |
| `counterpartyIban` | `string \| null` | ja | Rang 1b — `match_counterparty_iban`; Name **oder** IBAN stehen an derselben Stelle (P1) | `LearnedFromPayment` |
| `bookingMode` | `RuleBookingMode` | ja | Rang 2, als `StatusBadge axis="regel_modus"` | `Modes` |
| `isActive` | `boolean` | ja | Rang 3, Wort ohne Farbe (L-241) | `Modes` |
| `amount` | `number \| null` | ja | Rang 4 — **das Ergebnis von `accrualAmount(rule)`**, das der Aufrufer bildet. Die Zeile rechnet nicht: die Ableitung ist dreistufig (`template.amount` → Summe der Split-Zeilen → `matchAmount`, P12) und gehört in die Domäne | `Filled` |
| `interval` | `RuleExpectedInterval \| null` | ja | Rang 5, Wort aus `RULE_INTERVAL_LABEL` | `Words` |
| `direction` | `RuleDirection \| null` | ja | Rang 7, Wort aus `labels.direction` | `Words` |
| `labels` | `RecurringRuleLabels` | ja | die deutschen Wörter, die der Spiegel nicht führt (L-242, L-256). Ein Wert ohne Wort erscheint **roh** | `Words` |
| `case` | `CaseLink` | nein | Rang 6 — nur setzen, wo die Liste ihren Sachverhalt verlässt | `InUse` |
| `caseHref` | `(caseId: string) => string` | nein | Weg zum Sachverhalt. Ohne ihn steht der Name ohne Weg — die Zeile baut keine URL, sie kennt weder Mandant noch Jahr | `InUse` |
| `periodCount` | `number` | nein | Zähler der Ereignisse („3 Perioden") | `InUse` |
| `lastPayment` | `{ date: string; amount: number } \| null` | nein | letzte zugeordnete Zahlung. **Prop fehlt** = die Spalte gibt es nicht; **`null`** = es gab noch keine Zahlung | `InUse` |
| `columns` | `readonly RecurringRuleColumn[]` | nein | **welche** Zellen die Zeile rendert — nicht in welcher Ordnung: die Rangordnung des Profils gilt in jeder Form, `recurringRuleColumnOrder()` wendet sie an. Default: `counterparty`, `bookingMode`, `validity`, `amount`, `interval`, `direction` (Ränge 1–5, 7) | `InUse` |
| `counterAccount` | `PreviewAccount \| null` | nein | Rang 10 — Gegenkonto der Vorlage, **Nummer und Name**; ohne Konto das Wort „ohne Gegenkonto" | 0131 `Filled` |
| `personalAccount` | `PreviewAccount \| null` | nein | Rang 11 — Personenkonto; ohne Konto das Wort **„ohne Personenkonto"**, eine der drei Auffälligkeiten von J-54 | 0131 `Filled` |
| `documentNumberStrategy` | `RuleDocumentNumberStrategy \| null` | nein | Rang 22 — Wort aus `labels.documentNumberStrategy`, ohne Wort roh (L-242) | 0131 `Filled`, `Edges` |
| `caseRuleCount` | `number` | nein | wie viele Regeln **derselbe Fall** trägt. Ab 2 setzt die Sachverhalts-Zelle die Marke „2 Regeln" — der Doppelgriff aus L-245. Aus den sichtbaren Zeilen ist er nicht zählbar, sobald ein Filter greift (Befund **L-263**) | 0131 `Filled` |
| `accountHref` | `(accountNumber: string) => string` | nein | Weg ins Kontenblatt für die beiden Konten. Ohne ihn stehen sie als Text — nie ein Knopf, der nichts tut | 0131 `Filled` |

**Nachgetragen am 2026-09-08 beim Bau von 0131.** Die fünf Zeilen darüber sind
die Erweiterung, die das Regelwerk des Mandanten gebraucht hat: sein
Spaltensatz ist der des Profils (Ränge 1–7, **10, 11, 22**), und der
Doppelgriff ist die dritte der drei Auffälligkeiten, wegen derer es die Seite
gibt. Alle fünf sind **optional** — ohne sie rendert die Zeile wie zuvor, und
die Stories von 0132 und 0133 sind unverändert. Kein Nachbau: R17 lässt für
eine Entität genau eine Zeile zu, und deshalb kamen die Felder hierher statt
in eine zweite Zeilen-Komponente.

**Und die Zellen wohnen seither in `recurring-rule-columns.tsx`** — genau der
Zug, den der Ausbau unten vorgesehen hat, mit 0131 als Auslöser. Die
Schnittstelle der Zeile ändert das nicht: `RecurringRuleRow` rendert dieselben
Zellen, nur liest sie sie jetzt aus dem Katalog, den `DataTable` ebenfalls
liest (Muster `BankTransactionRow` ↔ `bankTransactionColumns`).

Typen aus `src/ludwig/modules/recurring-rules/domain/rule.ts`
(`RuleBookingMode`, `RuleDirection`, `RuleExpectedInterval`,
`RULE_INTERVAL_LABEL`) · `CaseLink` aus
`entities/accounting-case/case-title.ts` · GLOSSARY: `recurring rule` im Code,
„Wiederkehr-Regel" im Label.

**Achtzehn Props — und §4 sagt: trotzdem eine Komponente.** (Dreizehn waren
es beim Schreiben der Spec; die fünf dazu kamen mit dem Katalog aus 0131 und
stehen seither in der Tabelle darüber.) Der Grund ist
benannt und hat ein Ablaufdatum: sechzehn davon sind Spalten **einer** Zeile, die
nur deshalb einzeln kommen, weil ihr Modell nicht gespiegelt ist (L-240).
Trennen würde nichts entkoppeln, sondern nur Durchreich-Props erzeugen — genau
den Fall, für den §4 „zusammenlassen" sagt. Ist L-240 erledigt, schrumpfen
zwölf Props auf eine (siehe Ausbau).

**Was die Zeile bewusst nicht kann:**

- **Kein `href` auf der Zeile.** `Row href` macht die ganze Zeile zum `<a>`;
  ihre Zellen tragen ihre eigenen Wege (`CaseCell`). Ein Anker im Anker ist
  ungültiges Markup — gemessen in 0101 als Hydration-Warnung.
- **Nichts rechnen:** weder Betrag (`accrualAmount`) noch Toleranz
  (`effectiveAmountTolerance`) noch „greift sie?" (`matchTransaction`). Alles
  drei kommt fertig herein.
- **Keine Farbe für die Gültigkeit**, solange `is_active` keine Registry-Achse
  hat (L-241). R1 lässt Farbe nur über eine Achse zu.

## Verhalten

**Server-Component.** Die Zeile hat keinen Zustand, keinen Tastaturweg und
kein Client-JS; das Auswählen, Aufklappen und Paginieren gehört dem Rahmen
(0133, 0131).

Zustände: **gefüllt** ist der Normalfall. Zwei Sonderfälle, die keine Fehler
sind und deshalb ein Wort bekommen statt eines Gedankenstrichs:

- **ohne Kriterium** (weder Name noch IBAN) — die Regel ist nicht leer,
  sondern **wirkungslos**. Das Wort steht in der führenden Zelle; den ganzen
  Satz („greift daher bei keiner Zahlung") schreibt die Ableitung und zeigt
  `RecurringRuleFacts`.
- **noch keine Zahlung** (`lastPayment: null`) — in der Fälligkeitsliste ist
  genau das die Auskunft.

Beides folgt der Hausregel von `CaseCell`: **„offen" ist eine Aussage, kein
fehlender Wert** — ein Gedankenstrich hieße „unbekannt".

Leer · leer nach Filter · lädt · Fehler sind Zustände der **Liste**, nicht der
Zeile.

## Stories

Abgeleitet nach `spec-schreiben` §6: 2 anwendbare Zustände (gefüllt, ohne
Kriterium) + 2 Enum-Achsen (`bookingMode`; Rhythmus und Richtung zusammen als
Wörter) + 1 Ableitung, die das Profil berichtigt hat (P1) + 1 „im Einsatz" +
1 Rand (die Zeile kürzt Namen und formatiert Beträge) = **7**.
Titel `v3/Entitäten/Wiederkehr-Regel/RecurringRuleRow`.

| Story | Beweist |
|---|---|
| `Filled` | Normalfall: „Musterfirma Immobilien GmbH", Sollstellung, aktiv, 1.800,00 €, monatlich, Zahlungsausgang |
| `LearnedFromPayment` | die aus einer Zahlung gelernte Regel: **kein Name**, dafür die IBAN — Rang 1 ist abgeleitet (P1), die führende Zelle bleibt gefüllt |
| `WithoutCriterion` | weder Name noch IBAN: **„ohne Kriterium"** statt „—" |
| `Modes` | die drei Werte von `booking_mode` nebeneinander, `match_only` eingeschlossen (im Bestand 0 von 30), dazu eine inaktive Regel — Wort ohne Farbe |
| `Words` | Rhythmus und Richtung als Wörter: `monthly`/`quarterly`/`yearly`, `payment_in`/`payment_out`/`null` — und **eine** Zeile mit einem Wert, für den `labels` kein Wort hat: er steht roh da (L-256) |
| `InUse` | vier Zeilen in einer `Table` mit Kopfzeile, Spaltensatz der Fälligkeitsliste (`case` vorn, `lastPayment` hinten, dazu `periodCount`) — so, wie 0133 sie stellt |
| `Edges` | Gegenpartei mit **46** Zeichen (Maximum im Bestand), Betrag `null`, Rhythmus `null`, `lastPayment: null`, und zwei Regeln desselben Sachverhalts untereinander (L-245) |

Nicht anwendbar und warum: `Leer`, `LeerNachFilter`, `Laedt`, `Fehler` — eine
Zeile ohne Daten wird nicht gerendert; alle vier Zustände trägt der Rahmen
(0133). `Interaktiv` — die Zeile hat keinen Callback; `caseHref` baut eine
URL, es ist kein Rundlauf.

Daten der Stories: realistische Werte im Zuschnitt des Bestands
(Musterfirma GmbH, 1.800,00 €, `monthly`, Zahltag 1., 8-stellige
DATEV-Belegnummer), Typen aus `src/ludwig/`.

## Offene Fragen

Höchstens drei, jede mit Default — der Bau wartet nicht.

1. **Wie heißt das Wort in der führenden Zelle, wenn Name und IBAN fehlen?**
   *Ohne Antwort: „ohne Kriterium".* Es ist eine Aussage über die Regel, kein
   fehlender Wert — dieselbe Bauform wie „offen" in `CaseCell`.
2. **Trägt die Zeile den Perioden-Zähler?** *Ohne Antwort: ja, als optionale
   Spalte `periods` („3 Perioden"), gedämpft.* Das Profil sieht die Ereignisse
   in S als Zähler vor; ohne die Prop entsteht keine Spalte.
3. **Gehört „Letzte Zahlung" an die Zeile oder in den Rahmen?** *Ohne Antwort:
   an die Zeile, als optionale Spalte.* Der Rahmen kann keine Zelle
   nachschieben, ohne die Spur (`grid-template-columns`) zu zerreißen — und
   die Fälligkeitsliste ist ohne diese Spalte nicht zu beantworten.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Ein Zeilenmodell statt zwölf Einzelfeldern | `rule: OverdueRecurringItem \| RuleOverviewItem` statt der Feld-Props | **L-240** ist gelöst — die zwei Anzeige-Typen liegen in `recurring-rules/domain/` |
| Farbe für die Gültigkeit | `StatusBadge axis="regel_gueltigkeit"` statt des Wortes | **L-241** ist entschieden (Achse oder Farbe weg) |
| ~~Spaltendefinitionen für `DataTable`~~ | ~~`recurringRuleColumns()` in `recurring-rule-columns.tsx`~~ | **Erledigt 2026-09-08 mit 0131.** Der Katalog steht, die Zeile rendert dieselben Zellen aus ihm |
| `priority` als Spalte | `priority: number` | **L-245** zeigt zwei Regeln eines Falls nebeneinander — erst dann entscheidet die Rangfolge etwas Sichtbares. (~~L-254~~ ist seit `9a3ce2db` behoben: alle Schreiber setzen `RULE_PRIORITY_DEFAULT`, der Bestand streut **nicht**) |
| Der Weg in den Editor aus der Zeile | `onEdit?: (ruleId: string) => void` | ein Screen verlangt ihn — die Fälligkeitsliste ist „Auskunft, keine Aufgabe" und braucht ihn nicht |

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

- [ ] Rang 1 ist **abgeleitet**: bei fehlendem Namen steht die IBAN in derselben Zelle (Story `LearnedFromPayment`, gegen `Filled` gemessen)
- [ ] Fehlen Name **und** IBAN, steht „ohne Kriterium" — kein „—" (Story `WithoutCriterion`, am gerenderten Text gemessen)
- [ ] Die Buchungsweise kommt aus `StatusBadge axis="regel_modus"`; alle drei Werte erscheinen, `match_only` eingeschlossen (Story `Modes`)
- [ ] Die Gültigkeit ist ein **Wort ohne Farbe** — kein `tone`, kein `dot` (Story `Modes`, am Knoten gemessen: keine Ton-Klasse)
- [ ] Der Rhythmus steht **deutsch** aus `RULE_INTERVAL_LABEL`; auf dem Bildschirm steht nie `monthly` (Story `Words`) — das ist die Ablösung von **L-243 a**, dem noch offenen Teil des Befunds
- [ ] Ein Wert, für den `labels` kein Wort hat, erscheint **roh** statt zu verschwinden (Story `Words`, eine Zeile ohne Eintrag)
- [ ] Die Zeile enthält **keine** Betrags- oder Toleranz-Ableitung: `grep -n "template\.\|matchAmount\|Tolerance" RecurringRuleRow.tsx` findet nichts
- [ ] Die Zeile rendert **kein** `href` auf `Row`; die Wege stehen in den Zellen (Story `InUse`, Baum geprüft)
- [ ] `columns` bestimmt die Zellen**zahl**; die Ordnung ist fest. `recurringRuleTracks(columns)`, `recurringRuleColumnOrder(columns)` und die Kopfzeile decken sich (Story `InUse`, Spurenzahl gegen Zellenzahl gezählt)
- [ ] `lastPayment: null` zeigt „noch keine", die fehlende Prop zeigt gar keine Spalte (Story `Edges` gegen `InUse`)
- [ ] Die Zeile kennt kein `priority` (grep) — Owner-Entscheid; sichtbar wird die Rangfolge erst mit L-245
- [ ] Ersetzt die Zeile in `ErwarteteZahlungen` (`Schritt5.tsx`) ohne Funktionsverlust und zeigt zusätzlich Buchungsweise und Gültigkeit — **offen (App)**, die Ablösung ist ein eigener Schritt

## Gebaut 2026-09-08

Gebaut von Claude (Skill `v3-komponente`), **nicht abgenommen** — die Abnahme
gehört einem anderen Agenten.

**Dateien:** `src/ui/v3/entities/recurring-rule/RecurringRuleRow.tsx`
(Zeile, `recurringRuleTracks()`, `RecurringRuleColumn`,
`RECURRING_RULE_COLUMN_LABEL`) · `recurring-rule.ts` (Wörterbuch der Familie:
`RecurringRuleLabels`, `ruleLabel()`, `RecurringRuleDraft`) ·
`RecurringRuleRow.stories.tsx` (7 Stories) · `fixtures.ts` ·
CSS als eigener Abschnitt am Ende von `src/styles/v3.css`, Präfix `v2rr`
(vorher gegriffen: `v2r*` war mit `v2radio`, `v2raw`, `v2rowlink` belegt,
`v2rr` frei) · Export über `src/ui/v3/index.ts`.

**Grün:** `pnpm typecheck` und die fünf Wächter (`check:language`,
`check:icons`, `check:contrast`, `check:mirror`, `check:when`) auf Exit 0.

**Gemessen** mit `scripts/cdp.mjs` gegen den Dev-Server auf 6107, ein Browser
für alle Messungen, alle 7 Stories angesehen — keine Konsolen-Ausgabe, keine
Ausnahme in keiner Story:

| Was | Messung |
|---|---|
| Rang 1 ist abgeleitet | `Filled` führende Zelle „Musterfirma Immobilien GmbH", `LearnedFromPayment` Zeile 2 „DE02 1203 0000 0000 2020 51" — dieselbe Zelle |
| „ohne Kriterium" statt „—" | `WithoutCriterion` führende Zelle = `ohne Kriterium` (Text am Knoten gelesen) |
| Buchungsweise aus der Registry | `Modes` Zellentext + Klasse: `Sollstellung`/`bdg bdg-info` · `Bei Zahlung`/`bdg bdg-success` · `Nur zuordnen`/`bdg bdg-neutral` — alle drei Werte |
| Gültigkeit ohne Farbe | `Modes` Zelle 3: `aktiv`/`inaktiv`, `.bdg` = null, `.dot` = false |
| Rhythmus deutsch | `Words`: `monatlich`, `vierteljährlich`, `jährlich`, `ohne Rhythmus` — `monthly` steht in keiner Story |
| Wert ohne Wort steht roh | `Words` Zeile 5, Richtung = `payment_out` (labels ohne diesen Eintrag) |
| Keine Ableitung in der Zeile | `grep -n "template\.\|matchAmount\|Tolerance" RecurringRuleRow.tsx` → 0 Treffer |
| Kein `href` auf `Row` | `InUse`: `tr > td > a.v2rowlink` = 0, `a.v2case__link` = 4 |
| `columns` bestimmt Zahl und Reihenfolge | `InUse`: Kopf 8 Zellen, jede Zeile 8 Zellen, `recurringRuleTracks` liefert 8 Spuren; Kopf- und Zeilenkanten decken sich bei 700/1100/1280/1400/1920 px (identische x-Werte) |
| „noch keine" gegen fehlende Spalte | `InUse` Zeile 3 = `noch keine`, `Filled` hat die Spalte gar nicht |
| Kein `priority` | `grep -n "priority" RecurringRuleRow.tsx` → 0 Treffer |
| Eine Zeilenhöhe (V1) | 46–47 px in jeder Story, auch bei 46 Zeichen Gegenpartei (`Edges`: `scrollWidth` 323 gegen `clientWidth` 250, gekürzt mit `title`) |

**Entscheidungen, die die Spec offen ließ:**

1. **Richtung `null`** heißt „ohne Richtung", nicht „—". Die Spec regelt nur
   den Fall „`labels` hat kein Wort" (dann roh); `expectedDirection = null`
   ist aber eine Aussage — die Regel nimmt beide Richtungen (`matchTransaction`
   prüft die Richtung dann nicht). Gleiche Bauform wie „ohne Rhythmus".
2. **Ohne `caseHref`** rendert die Zelle Nummer und Titel als **Text** statt
   `CaseCell` mit einer leeren URL: die Spec sagt „ohne ihn steht der Name ohne
   Weg", und `CaseCell` verlangt ein `href`. Ein Link auf `""` wäre ein Knopf,
   der nichts tut (I11).
3. **Spaltenüberschriften** stehen als `RECURRING_RULE_COLUMN_LABEL` neben der
   Zeile, damit Kopf und Zelle aus einer Quelle kommen. Das ist keine
   Label-Map im Sinne von R1 (kein Status, keine Achse), sondern die
   Beschriftung der Spur — dieselbe Bauform wie `header` in
   `bankTransactionColumns`.

**Befund am Rande:** `matchTransaction()` behandelt eine Regel ohne
`expectedDirection` als „beide Richtungen"; ein Wort dafür gibt es im
Domänen-Code nicht (`describeRecurringRule()` schreibt „passenden Umsatz").
Die Zeile setzt „ohne Richtung" — gehört zu **L-256**, wenn der dort fällige
Wortsatz entsteht.

## Abnahme

Schlanke Abnahme nach Owner-Entscheid 2026-09-08: geprüft ist die
**Schnittstelle**, nicht die Darstellung. Pixel, Abstände und Farbwirkung
stehen bei **0119**.

| Kriterium | Nachweis (Datei:Zeile · Story · Befehl) | Ergebnis |
|---|---|---|
| **Schnittstellen-Tabelle Zeichen für Zeichen** | Alle **18** Zeilen decken sich mit dem Code: `RecurringRuleRowProps = RecurringRuleRowData & RecurringRuleColumnOptions` (`RecurringRuleRow.tsx:30`), Felder in `recurring-rule-columns.tsx:65–114`, Optionen in `:249–265`. Namen, Typen und Pflicht stimmen bei jeder Prop; keine Prop im Code, die in der Tabelle fehlt | ✓ |
| **Der Prosa-Satz „Dreizehn Props"** | Die Tabelle führt seit dem Nachtrag 18 Props; der Satz darunter sagt weiter „Dreizehn", und dieselbe Zahl steht im Code (`RecurringRuleRow.tsx:25` „Thirteen props"). Die Rechnung „elf davon sind Spalten einer Zeile" stimmt damit auch nicht mehr | ✗ |
| **Zuschnitt-Absatz** | Er legt `recurringRuleTracks()` und die Union `RecurringRuleColumn` weiter nach `RecurringRuleRow.tsx`; beide liegen seit 0131 in `recurring-rule-columns.tsx:44`, `:278`. Der Nachtrag nennt nur den Umzug der **Zellen** | ✗ |
| `pnpm typecheck` grün | Exit 0 (ein Lauf für 0131–0135, 2026-09-08). `pnpm build` nach Owner-Entscheid 2026-09-07 nicht gelaufen | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `RecurringRuleRow.tsx` · `.stories.tsx` · Titel `v3/Entitäten/Wiederkehr-Regel/RecurringRuleRow` (`stories:14`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `RecurringRuleRow.tsx:33–40`; `pnpm check:when` und `check:language` Exit 0 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Keine Inline-Styles und kein Hex in der Datei; Buchungsweise über `StatusBadge axis="regel_modus"` (`recurring-rule-columns.tsx:325`); `RECURRING_RULE_COLUMN_LABEL` ist die Spaltenbeschriftung, keine Statusliste | ✓ |
| Alle Stories vorhanden; ausgeschlossene begründet | 7 Exporte (`Filled`, `LearnedFromPayment`, `WithoutCriterion`, `Modes`, `Words`, `InUse`, `Edges`) = §6-Rechnung 2+2+1+1+1; `Leer`/`LeerNachFilter`/`Laedt`/`Fehler`/`Interaktiv` begründet ausgelassen. Die fünf nachgetragenen Props haben ihren Nachweis wie geschrieben in 0131 `Filled`/`Edges` | ✓ |
| Prüfliste §9, soweit ohne Browser prüfbar | Zahlen rechts nur bei „Erwartet" (`RecurringRuleRow.tsx:64` setzt `v2num` aus `align === "end"`); kein Icon ohne Wort; Sie-Form und GLOSSARY-Begriffe in den Strings. Zeilenhöhe, Kontrast, Trefferfläche | vertagt auf 0119 |
| Im Browser angesehen | Messprotokoll im Abschnitt „Gemessen" | vertagt auf 0119 |
| Rang 1 ist **abgeleitet** | `Counterparty` (`recurring-rule-columns.tsx:418–430`): Name, sonst IBAN in `MonoCell`, in **derselben** Zelle; Story `LearnedFromPayment` gegen `Filled` | ✓ |
| Fehlen Name **und** IBAN, steht „ohne Kriterium" | `recurring-rule-columns.tsx:429`; Story `WithoutCriterion` | ✓ |
| Buchungsweise aus `StatusBadge axis="regel_modus"`, alle drei Werte | `:325`; Story `Modes` mit `accrue_then_settle`, `book_on_payment`, `match_only` | ✓ |
| Gültigkeit ist ein **Wort ohne Farbe** | `:329–330` gibt einen nackten String zurück, kein `tone`, kein `dot`; Story `Modes` (vierte Zeile) | ✓ |
| Rhythmus **deutsch** aus `RULE_INTERVAL_LABEL` | `:335–340`; Story `Words`. `monthly` steht in keiner Zelle | ✓ |
| Ein Wert ohne Wort erscheint **roh** | `ruleLabel()` (`recurring-rule.ts:51`); Story `Words`, letzte Zeile mit `LABELS_WITH_GAPS` | ✓ |
| Keine Betrags- oder Toleranz-Ableitung | `grep -n "template\.\|matchAmount\|Tolerance" RecurringRuleRow.tsx` → 0 Treffer; dieselbe Suche im Katalog `recurring-rule-columns.tsx` → 0 Treffer | ✓ |
| Kein `href` auf `Row` | `RecurringRuleRow.tsx:62` rendert `<Row>` ohne `href`; die Wege stehen in den Zellen (`CaseCell`, `AccountCell`). Story `InUse` | ✓ |
| `columns` bestimmt Zellenzahl **und Reihenfolge** | Nur die **Zahl** stimmt. `pick()` (`recurring-rule-columns.tsx:244–247`) filtert die feste `ORDER` (`:120–135`) — die Reihenfolge des Aufrufers wird verworfen, und der Code sagt das auch so („`columns` selects, it never reorders", `:41`), ebenso die Katalog-Tabelle in 0131. Praktisch: wer eine andere Reihenfolge übergibt, baut seinen Kopf aus seinem Array (so machen es `RecurringRuleRow.stories.tsx:73` und `RecurringRuleList.tsx:101`) und bekommt Kopf und Zellen auseinander. Heute unauffällig, weil alle drei benannten Sätze schon in `ORDER`-Reihenfolge stehen | ✗ |
| `lastPayment: null` zeigt „noch keine", die fehlende Prop keine Spalte | `LastPayment` (`:460–461`) gegen `pick()`: ohne `lastPayment` in `columns` entsteht die Zelle gar nicht. Story `InUse` (Zeile 3) gegen `Filled` | ✓ |
| Die Zeile kennt kein `priority` | `grep -n "priority" RecurringRuleRow.tsx` und `recurring-rule-columns.tsx` → 0 Treffer | ✓ |
| Ersetzt die Zeile in `ErwarteteZahlungen` (`Schritt5.tsx`) | Die Ablösung ist ein eigener Schritt in `ludwig/app` | offen (App) |

Abgenommen von / am: Claude (zweiter Agent), 2026-09-08 ·
**Offene Punkte:** (1) `columns` ordnet nicht um, die Spec und ihr Kriterium
behaupten das Gegenteil — hier muss eines von beiden nachgeben; (2) „Dreizehn
Props" in Spec und Code-Kommentar gegen 18 in der Tabelle; (3) der
Zuschnitt-Absatz nennt noch die alte Datei für `recurringRuleTracks()` und
`RecurringRuleColumn`.

## Nacharbeit zur Abnahme, 2026-09-08

Drei Mängel. Zwei gab die Spec, beim dritten gab **beides** nach.

**M1 — `columns` ordnet nicht um, und das ist richtig so.** Die Spec
behauptete an zwei Stellen, die Prop bestimme „Zellenzahl **und**
Reihenfolge"; `pick()` filtert seit jeher die feste `ORDER`. Naheliegend wäre,
den Code der Spec anzupassen — aber die feste Ordnung ist kein Versehen,
sondern eine Regel: die Rangordnung der Datenpunkte ist in **jeder** Form der
Entität dieselbe, sonst steht der Betrag in der Liste vorn und in den Fakten
hinten. Also gab die Spec nach.

Nur war die Gefahr, die die Abnahme benannt hat, damit nicht weg: Kopfzeile
und Zellen kamen aus **zwei** Quellen. Die Zellen liefen durch `pick()`, die
Kopfzeile baute der Aufrufer aus seinem eigenen Array (`RecurringRuleList`,
und die Story dieser Spec). Solange jeder Satz zufällig schon in
`ORDER`-Reihenfolge steht, fällt das nicht auf — beim ersten, der es nicht
tut, stehen Kopf und Zellen versetzt. Deshalb ist `pick()` jetzt als
`recurringRuleColumnOrder()` exportiert, und beide Kopfzeilen bauen daraus.
Eine Regel, die man befolgen **muss**, ist besser als eine, die man befolgen
soll.

**M2 — „Dreizehn Props".** Es sind achtzehn, seit der Katalog aus 0131 fünf
dazugab. Die Tabelle war mitgezogen worden, der Satz darunter nicht.

**M3 — der Zuschnitt-Absatz nannte die Datei von vorgestern.** Er legte
`recurringRuleTracks()` und `RecurringRuleColumn` nach `RecurringRuleRow.tsx`;
beide liegen seit 0131 im Katalog. Jetzt steht dort, wo sie waren und warum
sie umgezogen sind — das ist die Auskunft, die jemand braucht, der dem alten
Satz gefolgt ist.
