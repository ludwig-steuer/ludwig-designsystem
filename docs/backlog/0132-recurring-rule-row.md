# 0132 · `RecurringRuleRow`

| | |
|---|---|
| Status | **Abnahme** |
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
  - `RecurringRuleRow.tsx` — die Zeile, dazu `recurringRuleTracks()` und die
    Union `RecurringRuleColumn`, damit Kopfzeile und Zeilen dieselbe Spur
    lesen (Muster `bankTransactionTracks`).
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
| `columns` | `readonly RecurringRuleColumn[]` | nein | welche Zellen die Zeile rendert, in der Reihenfolge der Liste. Default: `counterparty`, `bookingMode`, `validity`, `amount`, `interval`, `direction` (Ränge 1–5, 7) | `InUse` |
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

**Dreizehn Props — und §4 sagt: trotzdem eine Komponente.** Der Grund ist
benannt und hat ein Ablaufdatum: elf davon sind Spalten **einer** Zeile, die
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
- [ ] `columns` bestimmt Zellenzahl **und** Reihenfolge; `recurringRuleTracks(columns)` und die Kopfzeile decken sich (Story `InUse`, Spurenzahl gegen Zellenzahl gezählt)
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
