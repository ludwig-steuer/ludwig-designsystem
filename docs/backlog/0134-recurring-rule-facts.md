# 0134 · `RecurringRuleFacts`

| | |
|---|---|
| Status | **Abnahme** |
| Stufe | `entities/recurring-rule/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Sollstellung, Personenkonto, Belegfeld 1, DATEV-Steuerschlüssel |
| Quelle | Entitätsprofil `docs/entitaeten/recurring-rule.md` (Status **geprüft**, 2026-09-08), Abschnitte „Datenpunkte" (Ränge 1–28), „Relationen", „Formen" (Zeile `RecurringRuleFacts`), „Zuschnitt" (Marke **jetzt**) |
| Domänen-Stand | gelesen gegen **`origin/staging`** in `ludwig/app` (2026-09-08), nicht gegen den eingefrorenen Spiegel `src/ludwig/`. **Erledigt, deshalb hier nicht mehr als offen geführt:** ~~L-253~~ (`2c0c888f` — `matchTransaction()` und `hasAnyCriterion()` lesen eine gemeinsame Liste `MATCH_CRITERIA`) · ~~L-254~~ (`9a3ce2db` — `RULE_PRIORITY_DEFAULT = 100` für alle drei Schreiber) · ~~L-244~~ (`b7544542` — das Präfix heißt jetzt `datev-wk:`, die Warnung kann erscheinen) · **L-243 b** (`5e48d892` — die lokalen Maps in `wiederkehrende.ts` sind weg). **Offen und tragend für diese Spec:** L-240, L-241, L-242, **L-243 a** (`Schritt5.tsx:100` gibt den Rhythmus weiter roh aus), L-245, L-249 und die drei neuen L-255 bis L-257. **Wer baut, holt vorher den Spiegel nach** (`scripts/sync-ludwig.sh`) — die eingefrorene Fassung kennt `MATCH_CRITERIA` und `RULE_PRIORITY_DEFAULT` noch nicht |
| Ersetzt | die vier Abschnitte des `RegelwerkTab` (`modules/accounting-cases/ui/tabs/RegelwerkTab.tsx`, 361 Z.) · die Kriterien-Tabelle des `ZuordnungTab` (`…/tabs/ZuordnungTab.tsx`, 194 Z.) · die generische Feldliste `regelZeilen()` aus `modules/stapelabnahme/application/wiederkehrende.ts` (Z. 202–221) |
| Blockiert | 0135 (`RecurringRuleEditor`), der die Fakten als Vorschau zeigt („passt die Regel so?") |
| Setzt voraus | nichts im Set — sie steht neben 0132, nicht auf ihr |
| Spec von / am | Claude, 2026-09-08 (Skill `spec-schreiben`) |

## Ziel

Die Sachbearbeiterin steht im Regelwerk-Reiter eines Dauersachverhalts und
fragt: **was löst diese Regel aus, was bucht sie dann, und wann erwartet sie
das?** Heute wird ihr diese Antwort **dreimal verschieden** gegeben:

- der `RegelwerkTab` kennt die **Wirkung** (Klartext-Satz, Buchungssatz-Vorschau,
  Erwartung, automatisierte Buchungen), aber nicht die Belegnummer der
  Dauerbuchung und nicht die Belegseite,
- der `ZuordnungTab` kennt die **Kriterien** als zweispaltige Tabelle, aber
  nicht die Wirkung — und auch dort fehlt die ganze Belegseite (F94), obwohl
  dieselbe Regel gegen Belege rechnet,
- `Schritt3Wiederkehrend` zeigt dieselbe Regel ein drittes Mal als generische
  `{label, value}`-Paare, mit zwei lokalen Wortlisten, von denen eine
  **keinen** der drei echten `booking_mode`-Werte traf (L-243 b, drüben
  behoben mit `5e48d892` — die dritte Fassung der Anzeige bleibt trotzdem eine
  dritte).

Drei Fassungen, die auseinandergehen. Diese Form ist die eine.

## Einordnung

- **Wiederverwenden:** `FieldList` (`@when Master data and properties of an
  item, read-only`) trägt jede Gruppe; `JournalEntryCard`
  (`@when … recurring rule preview`) trägt die Buchungssatz-Vorschau —
  ihr `@when` nennt diesen Fall bereits **namentlich**. `AccountCell` nennt
  Gegen- und Personenkonto, `StatusBadge axis="regel_modus"` die
  Buchungsweise, `LongText` die Zuordnungs-Notiz.
- **Neu, weil:** §3 **Nr. 5** — keine vorhandene Form weiß, welche Felder einer
  Wiederkehr-Regel wann erscheinen und in welcher Gruppe. `FieldList` allein
  wüsste es nicht.
- **Zuschnitt:** eine Datei `RecurringRuleFacts.tsx`. **Nicht** getrennt in
  „Kriterien" und „Wirkung": beide lesen dieselbe Regel, ändern sich aus
  demselben Grund und treten nie allein auf — genau der Fall, für den §4
  „zusammenlassen" sagt. Dass die App sie heute auf zwei Reiter verteilt, ist
  der Mangel, nicht die Vorlage.
- **Setzt auf:** `FieldList` (`tone="bare"`), `JournalEntryCard`, `AccountCell`,
  `AmountCell`, `MonoCell`, `Time`, `StatusBadge`, `LongText`, `Callout`,
  `Badge`. Aus dem Spiegel: `RecurringRule`, `RULE_INTERVAL_LABEL`.

**Zur Form selbst:** `<Entity>Facts` steht nicht im Formen-Vokabular von
`ui-repraesentationen.md` §4.4 — im Haus ist sie trotzdem etabliert
(`CaseFacts`, `BankTransactionFacts`, `InvoiceLineFacts`,
`SourceDocumentFacts`). Diese Form folgt dem Bestand; die Lücke liegt in §4.4.

## Was die Fakten zeigen

Die Ränge des Profils, gruppiert wie heute: **Auslöser · Wirkung ·
Erwartung**, dazu **Herkunft** nur mit `all`. **Ein Feld ohne Wert steht nicht
da** — kein „—", keine leere Zeile; eine Gruppe ohne Feld erscheint gar nicht.

| Gruppe | Felder (Rang) | Wann sichtbar |
|---|---|---|
| Kopf | Klartext-Satz (12) · Buchungsweise als `StatusBadge` (2) · Gültigkeit als **Wort ohne Farbe** (3) | immer |
| **Auslöser** | Gegenpartei-Kriterium (1, abgeleitet `name ?? iban`) · Richtung (7) · Betrag ± geltende Toleranz (4, 17) · IBAN und Zweck-Regex (19) · Belegseite: Vertragsnummer, Belegtext-Regex, `matchesDocuments` (18) · Zuordnungs-Notiz (20) | je Feld einzeln. Ohne **jedes** Kriterium steht hier der Satz aus dem Kopf und sonst nichts |
| **Wirkung** | Belegnummer der Dauerbuchung (8) · Buchungssatz-Vorschau (9) als `JournalEntryCard` · Gegenkonto (10) · Personenkonto (11) · Buchungstext der Vorlage (16) | je Feld einzeln; die Vorschau immer, außer sie ist leer (siehe unten) |
| **Erwartung** | Rhythmus-Satz (13) · Rhythmus (5) · Zahltag (14) · Laufzeit (15) | nur, wenn der Rhythmus-Satz nicht `null` ist — sonst **entfällt die Gruppe** |
| **Herkunft** (nur `all`) | Herkunft des Profils (23) · Zahlungskonto (24) · Split-Vorlage (21) · Steuerschlüssel und USt-Satz der Vorlage (25) · Belegnummern-Strategie (22) · Idempotenz-Anker, Buchungslauf, Buchungszyklus (27) · DMS-Beleglink (28) | nur mit `all` und nur je gesetztem Feld |

**Vier Festlegungen, die keine Spec neu verhandelt:**

1. **Konten sind Nummern, keine Ids.** `template.counterAccountNumber` und
   `personalAccountNumber` kommen als Nummer; die Auflösung ins
   Wirtschaftsjahr macht der Aufrufer. Die Form zeigt sie mit `AccountCell`
   (Nummer, Name daneben) und baut keine Kontozeile.
2. **Betrag und Toleranz kommen aus der Ableitung.** Der Betrag ist
   `accrualAmount(rule)` — dreistufig (`template.amount` → Summe der
   Split-Zeilen → `matchAmount`, P12) —, die Toleranz
   `effectiveAmountTolerance(rule)`; von zwei Toleranz-Spalten gewinnt die
   großzügigere. Die Form zeigt **eine** Zahl und ruft die zwei gespiegelten
   Funktionen; sie rechnet nichts nach.
3. **`booking_mode` ist nicht binär.** Bei `match_only` entsteht **gar kein**
   Vorschlag: dann steht in der Gruppe „Wirkung" der Satz „Nur Zuordnung —
   kein automatischer Buchungsvorschlag." und **keine** leere Vorschau-Karte.
   Der Wert kommt im Bestand nicht vor (0 von 30) und wird trotzdem gebaut —
   Code, der ihn übergeht, ist der stille Bug, vor dem der Registry-Kommentar
   warnt.
4. **Eine Regel ohne Kriterium ist wirkungslos, nicht leer.** Den Satz
   („Diese Regel hat noch keine Match-Kriterien und greift daher bei keiner
   Zahlung.") schreibt `describeRecurringRule()`; die Form **zeigt** ihn und
   **rechnet ihn nicht nach**. Der Grund ist die Regel selbst, nicht ein
   einzelner Fehler: **eine Form, die eine Ableitung der Domäne nachbaut, ist
   die zweite Wahrheit** — und genau daran ist die App gerade hängengeblieben.
   ~~L-253~~ (behoben am 2026-09-08, App-Commit `2c0c888f`) war derselbe Fall
   eine Ebene tiefer: `matchTransaction()` und `hasAnyCriterion()` führten
   **zwei** Aufzählungen derselben Kriterien, und eine kannte den Zweck-Regex
   nicht — eine Regel griff, während der Satz daneben das Gegenteil behauptete.
   Der Fix war nicht das fehlende Feld, sondern das Zusammenlegen zu **einer**
   Liste `MATCH_CRITERIA`, die beide lesen. Ein Set, das den Satz selbst
   herleitete, wäre die nächste Aufzählung; deshalb kommt er als **Prop**.

**Eine begründete Abweichung vom Profil.** Die Formen-Tabelle schneidet M bei
Rang 18 und schiebt 19–28 hinter `all`. Diese Spec zieht **19 (IBAN,
Zweck-Regex) und 20 (Zuordnungs-Notiz) in die Standardansicht**, allerdings
nur, wenn sie gesetzt sind. Grund: beides sind **Kriterien**. Ein gesetztes
Kriterium, das die Kriterien-Anzeige nicht zeigt, ist genau der Mangel, den
L-249 für die Belegseite benennt — und bei einer aus einer Zahlung gelernten
Regel ist die IBAN das **stärkste** Kriterium (`prefillFromTransaction()`).
Im Bestand ändert das nichts: beide Spalten sind zu 0 % gefüllt, die Zeilen
erscheinen also heute nicht.

**Was die Fakten nicht zeigen:**

- **`priority` (Rang 26)** — Owner-Entscheid. ~~L-254~~ ist drüben behoben
  (`9a3ce2db`: `RULE_PRIORITY_DEFAULT = 100` für alle drei Schreiber), und
  seither trägt jede Regel denselben Wert: eine Zahl, die überall gleich ist,
  erklärt nichts. Sie wird interessant, sobald ein Fall zwei Regeln zeigt
  (**L-245**, offen).
- **Die Historie** — die Regel hat keinen eigenen `resource_kind`
  (**L-250**); ihre Ereignisse hängen am Fall und stehen in `CaseTimeline`.
- **Die automatisierten Buchungen** (Relation Buchungen, 29 Sätze im Bestand)
  — sie gehören dem Sachverhalt und stehen dort als `JournalEntryCell`-Liste.
  Die Fakten zeigen, was die Regel **ist**, nicht was sie schon getan hat.
- **Ob eine bestimmte Zahlung trifft** — `matchTransaction()` beantwortet eine
  Frage der Bankzeile, nicht der Regel.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `rule` | `RecurringRule` | ja | die Regel, unverändert aus `src/ludwig/modules/recurring-rules/domain/rule.ts` | `Filled` |
| `summary` | `string` | ja | der Klartext-Satz aus `describeRecurringRule(rule)`, **vom Aufrufer** gebildet. Er gibt dabei `matchPurposeRegex` mit: das Feld ist in `RuleSummaryInput` seit `2c0c888f` **optional**, und wer es weglässt, bekommt für eine Regel mit nur einem Zweck-Regex wieder den falschen Satz | `WithoutCriterion` |
| `schedule` | `string \| null` | ja | der Rhythmus-Satz aus `describeRuleSchedule(rule)`. `null` heißt: nichts hinterlegt → die Gruppe „Erwartung" **entfällt** | `Edges` |
| `preview` | `{ lines: readonly JournalLine[]; automatic: boolean; note: string \| null }` | ja | die Buchungssatz-Vorschau aus `buildRulePreview()`, vom Aufrufer in Buchungszeilen übersetzt (**L-255**, siehe unten) | `Modes` |
| `labels` | `RecurringRuleLabels` | ja | die deutschen Wörter, die der Spiegel nicht führt: Richtung (L-256), Belegnummern-Strategie und Herkunft des Profils (L-242). Ein Wert ohne Wort erscheint **roh** | `All` |
| `all` | `boolean` | nein | zusätzlich die Gruppe „Herkunft" (Ränge 21–28). Default `false` — der Reiter des Falls zeigt die kurze Form, die Verwaltungssicht (0131) und der Support die lange | `All` |
| `accountHref` | `(accountNumber: string) => string` | nein | Weg zum Kontoblatt hinter Gegen- und Personenkonto. Ohne ihn stehen beide als Text — nie als Knopf, der nichts tut | `InUse` |
| `hints` | `readonly string[]` | nein | Hinweise des Aufrufers über der ersten Gruppe, als `Callout`. Heute gibt es genau einen: „Modus prüfen?" aus `needsModeReview()`. Er **kann** seit `b7544542` erscheinen (~~L-244~~: das Präfix heißt jetzt `datev-wk:`), trifft im Bestand aber auf keine Regel — keine trägt zugleich `book_on_payment` und ein Personenkonto. Das Set baut die Heuristik **nicht** nach | `Modes` |
| `currency` | `Currency` | nein | Default `EUR`. Existiert, weil `JournalEntryCard` eine Währung verlangt; die Regel hat keine Währungsspalte | `Filled` |

Typen aus `src/ludwig/`: `RecurringRule`, `RuleBookingMode`,
`RULE_INTERVAL_LABEL` · `JournalLine` aus
`entities/journal-entry/JournalEntryCompact.tsx` · `Currency` aus
`shared/money.ts`.

**Warum `preview` nicht `RuleBookingPreview` ist — Befund L-255.**
`buildRulePreview()` liefert `PreviewPosting { debit, credit, amount, taxKey }`,
und `debit`/`credit` sind **fertig formatierte Beschriftungen** aus
`formatAccountLabel()` — „4200 Miete", oder der Rückfall „Bank (aus Zahlung)"
ganz ohne Nummer. `JournalEntryCard` braucht `JournalLine { side,
accountNumber, accountName?, amount }`. Aus dem einen das andere zu machen
hieße, einen Anzeigetext an seinem ersten Leerzeichen zu zerschneiden und zu
hoffen, dass davor eine Kontonummer stand — genau die lokale Erfindung, die §5
verbietet, und beim Rückfall unmöglich. Dazu ist `PreviewPosting.amount`
nullable, `JournalLine.amount` nicht. Deshalb: **der Aufrufer übersetzt**, und
die Prop trägt daneben `automatic` und `note` unverändert. Ist L-255 erledigt
— die Ableitung gibt die Konten strukturiert zurück —, nimmt die Form
`RuleBookingPreview` direkt.

**Was die Fakten bewusst nicht können:** nichts ändern (dafür ist 0135 da),
nichts nachladen, keine zweite Regel desselben Falls nebeneinander stellen
(das ist die Zeile 0132 im Rahmen des Reiters), und keinen Satz selbst
formulieren, den die Domäne schon schreibt.

## Verhalten

**Server-Component.** Kein Zustand, kein Client-JS. Die Form steht **immer
frei** (`FieldList tone="bare"`): Karte und Reiter setzt, wer sie einsetzt;
die Stories rahmen mit `Card`, wo sie einen Rahmen brauchen (dieselbe
Entscheidung wie 0114).

Zustände:

| Zustand | Was steht da |
|---|---|
| gefüllt | Kopf, drei Gruppen |
| **wirkungslos** | Kopfsatz „…greift daher bei keiner Zahlung.", Gruppe „Auslöser" leer und deshalb **abwesend**; „Wirkung" und „Erwartung" stehen weiter — die Regel würde etwas tun, sie kommt nur nie dazu |
| **nur zuordnen** (`match_only`) | in „Wirkung" der Satz statt der Vorschau |
| leer (gar keine Regel) | gibt es hier nicht: der Reiter zeigt dann seinen eigenen `EmptyState` — 75 von 104 Dauersachverhalten haben keine Regel (72 %), und was dort steht, entscheidet 0135 |
| lädt · Fehler | trägt die Seite; die Fakten rendern nur |

Datum über `Time` (`formatTime(value, "date")`), Beträge über `AmountCell`,
Prozentwerte als `${wert} %` in `v2num`. Die Gültigkeit ist ein **Wort ohne
Farbe**, bis `is_active` eine Achse hat (**L-241**).

## Stories

Abgeleitet nach §6: 2 anwendbare Zustände (gefüllt, wirkungslos) + 1 Enum-Achse
(`bookingMode`, alle drei Werte) + 1 Layout-Boolean (`all`) + 1 „im Einsatz" +
1 Rand (die Form kürzt Texte und fasst Gruppen zusammen) = **6**.
Titel `v3/Entitäten/Wiederkehr-Regel/RecurringRuleFacts`.

| Story | Beweist |
|---|---|
| `Filled` | die importierte Regel des Bestands: Gegenpartei, Sollstellung, aktiv, 1.800,00 € ± 0,00, monatlich zum 1., Personenkonto 10001, Gegenkonto 4210, Belegnummer 20260016, Vorschau als `JournalEntryCard` |
| `WithoutCriterion` | die Regel ohne jedes Kriterium: der Satz aus der Ableitung, Gruppe „Auslöser" **abwesend** statt leer |
| `Modes` | die drei `booking_mode`-Werte nebeneinander: `accrue_then_settle` (Vorschau + Hinweiszeile „Zahlung später: …"), `book_on_payment` (ein Satz), **`match_only`** (kein Satz, keine leere Karte). Dazu einmal `hints` mit „Modus prüfen?" |
| `All` | dieselbe Regel mit `all`: Herkunft des Profils, Zahlungskonto, Belegnummern-Strategie, Idempotenz-Anker, DMS-Link — darunter **ein** Wert, für den `labels` kein Wort hat: er steht roh da (L-242) |
| `InUse` | im Reiter „Wiederkehrende Buchung" einer `Card`, mit `accountHref` — so, wie der `CaseDetailView` sie stellt |
| `Edges` | der Rand: Split-Vorlage mit drei Zeilen (Vorschau mit drei Sätzen), Buchungstext mit **60** Zeichen (Maximum), Zuordnungs-Notiz über 400 Zeichen, `schedule: null` (Gruppe „Erwartung" entfällt), gesetzte Belegseite (Vertragsnummer + Belegtext-Regex, im Bestand 0 %) |

Nicht anwendbar und warum: `Leer` — ohne Regel rendert der Aufrufer die Form
gar nicht. `LeerNachFilter` — es wird nicht gefiltert. `Laedt`, `Fehler` — die
Form lädt nichts.

## Offene Fragen

1. **Verschwindet die Gruppe „Erwartung" oder steht sie leer?** *Ohne Antwort:
   sie verschwindet* — dieselbe Regel wie für jedes einzelne Feld. Der
   `RegelwerkTab` macht es heute schon so (`hasExpectation`).
2. **Zeigt die Standardansicht die Belegseite (Rang 18), obwohl sie im Bestand
   0 % gefüllt ist?** *Ohne Antwort: ja, aber nur, wenn ein Feld gesetzt ist.*
   F94 rechnet dieselbe Regel gegen Belege; dass die Belegseite in **keiner**
   Oberfläche steht, ist die zweite Hälfte von L-249.
3. **Kommt die Vorschau als `JournalEntryCard` oder `JournalEntryCell`?**
   *Ohne Antwort: `Card`* — sie hat 1–n Sätze (Split-Vorlage), und deren
   `@when` nennt die Regel-Vorschau namentlich (Prüfpunkt **P11**; das Profil
   nennt an zwei Stellen die `Cell`, das ist die kleinere von beiden).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Die Vorschau ohne Übersetzung durch den Aufrufer | `preview: RuleBookingPreview` | **L-255** ist gelöst — `buildRulePreview()` gibt die Konten strukturiert zurück |
| Farbe für die Gültigkeit | `StatusBadge axis="regel_gueltigkeit"` | **L-241** ist entschieden |
| Deutsche Wörter aus der Domäne statt aus `labels` | `labels` fällt weg | **L-242** und **L-256** sind gelöst |
| Die Historie der Regel | `renderHistory?: () => ReactNode` oder eine eigene Gruppe | **L-250** ist entschieden (eigener `resource_kind` oder der Entscheid „bleibt am Fall") |
| Ein zweiter Hinweis neben „Modus prüfen?" | `hints` bleibt, der Aufrufer füllt sie | eine zweite Ableitung liefert einen Satz, den die Sachbearbeiterin sehen muss (~~L-244~~ ist seit `b7544542` behoben; der erste Hinweis steht bereits) |
| `priority`, wenn mehrere Regeln greifen | ein Feld in „Herkunft" | **L-245** zeigt zwei Regeln eines Falls nebeneinander (~~L-254~~ ist seit `9a3ce2db` behoben; der Bestand streut nicht) |

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

- [ ] Ein Feld ohne Wert erscheint **nicht**; eine Gruppe ohne Feld erscheint nicht (Story `WithoutCriterion` und `Edges`, Zahl der gerenderten Zeilen gemessen)
- [ ] Der Klartext-Satz kommt aus `summary` — die Form leitet ihn **nicht** ab: `grep -n "hasAnyCriterion\|describeRecurringRule\|MATCH_CRITERIA" RecurringRuleFacts.tsx` findet nichts
- [ ] Bei `preview.automatic === false` steht der Satz aus `preview.note`, und `JournalEntryCard` wird **nicht** mit null Zeilen gerendert (Story `Modes`, Baum gemessen)
- [ ] Die Vorschau ist ein `JournalEntryCard`, keine eigene Tabelle (Story `Filled`, Klassenname am Knoten)
- [ ] Die Form zerlegt keinen Beschriftungs-String: `grep -n "\.split(" RecurringRuleFacts.tsx` findet nichts (L-255)
- [ ] Betrag und Toleranz kommen aus `accrualAmount()` und `effectiveAmountTolerance()`; die Form addiert und vergleicht nichts selbst (Story `Filled`, dazu grep auf `template.amount`)
- [ ] Konten stehen als **Nummer** in `AccountCell`; die Form löst keine Kontozeile auf (Story `Filled`)
- [ ] Die Gültigkeit ist ein Wort **ohne** Farbe (Story `Filled`, keine Ton-Klasse am Knoten)
- [ ] Ein Wert, für den `labels` kein Wort hat, erscheint roh (Story `All`)
- [ ] Die Form hat keinen eigenen Rahmen und keinen eigenen Innenabstand (Story `InUse`, bei 1280 px und 1600 px gemessen)
- [ ] Ersetzt die vier Abschnitte des `RegelwerkTab` **und** die Kriterien-Tabelle des `ZuordnungTab` ohne Funktionsverlust — und zeigt zusätzlich Belegnummer (Rang 8), Buchungstext (16) und die Belegseite (18) — **offen (App)**

## Gebaut 2026-09-08

Gebaut von Claude (Skill `v3-komponente`), **nicht abgenommen**.

**Dateien:** `src/ui/v3/entities/recurring-rule/RecurringRuleFacts.tsx`
(dazu `RecurringRulePreview` als Prop-Typ) · `RecurringRuleFacts.stories.tsx`
(6 Stories) · Export über `src/ui/v3/index.ts`.

**Grün:** `pnpm typecheck` und die fünf Wächter auf Exit 0.

**Gemessen** mit `scripts/cdp.mjs` auf 6107, alle 6 Stories angesehen — keine
Konsolen-Ausgabe, keine Ausnahme:

| Was | Messung |
|---|---|
| Feld ohne Wert fehlt, Gruppe ohne Feld fehlt | `WithoutCriterion`: Gruppen = Wirkung · Erwartung (**„Auslöser" abwesend**), 7 Zeilen. `Edges`: Gruppen = Auslöser · Wirkung · Herkunft (**„Erwartung" abwesend**, `schedule: null`). `Filled`: 3 Gruppen, 11 Zeilen |
| Satz kommt aus `summary` | `WithoutCriterion` Kopf = „Diese Regel hat noch keine Match-Kriterien und greift daher bei keiner Zahlung."; `grep -n "hasAnyCriterion\|describeRecurringRule\|MATCH_CRITERIA" RecurringRuleFacts.tsx` → 0 Treffer |
| `automatic === false` | `Modes` Spalte 3 (`match_only`): `.v2je` = 0, `.v2je__empty` = 0, stattdessen die Zeile „Buchungsvorschlag § Nur Zuordnung — kein automatischer Buchungsvorschlag." |
| Vorschau ist `JournalEntryCard` | `Filled`: genau eine `.v2je`, dazu die Nebenzeile „Zahlung später: 10001 Musterfirma Immobilien GmbH ⇄ Bank (aus Zahlung)" |
| Kein Zerlegen von Beschriftungen | `grep -n "\.split(" RecurringRuleFacts.tsx` → 0 Treffer |
| Betrag und Toleranz aus der Ableitung | `Filled`: „Betrag § 1.800,00 € § ± 0,00 €"; `Edges` mit 5 % Prozent-Toleranz auf 1.800 → „± 90,00 €" (die großzügigere gewinnt, gerechnet von `effectiveAmountTolerance`). `grep -n "template\.amount" RecurringRuleFacts.tsx` → 0 Treffer |
| Konten als Nummer | `Filled`: „Gegenkonto § 4210", „Personenkonto § 10001" — `AccountCell`, keine Kontozeile, keine Id |
| Gültigkeit ohne Farbe | `Filled`: `<span class="v2rrfacts__validity">aktiv</span>` — keine `.bdg`, kein `tone`, kein Punkt |
| Wert ohne Wort steht roh | `All`: „Belegnummern-Strategie § fixed" (labels ohne diesen Eintrag) |
| Kein eigener Rahmen, kein Innenabstand | `InUse` bei 1400 px: `padding` = 0px, Rahmenbreite 0, Hintergrund transparent; die Form füllt 858 von 898 px, die 20 px links kommen aus der Karte der Story. Bei 1280 px und 1600 px gleich |
| Belegnummer der Dauerbuchung (Rang 8) | `Filled`: „Belegnummer der Dauerbuchung § 20260016" — sie steht in keiner Komponente der App |
| Belegseite (Rang 18) | `Edges`: „Vertragsnummer § V-2019-4471", „Muster im Belegtext § Musterfirma.*Miete", „Belegseite § Die Regel bindet auch den Beleg an den Sachverhalt." |
| Split-Vorlage | `Edges`: `.v2je__row` = 6 (Kopf + 4 Buchungszeilen + Summe), also drei Gegenkonto-Zeilen plus Bank |

**Entscheidungen, die die Spec offen ließ:**

1. **Die IBAN-Zeile (Rang 19) erscheint nur, wenn auch ein Name da ist.**
   Fehlt der Name, **ist** die IBAN schon die Zeile „Gegenpartei" (Rang 1 ist
   abgeleitet, P1) — sie ein zweites Mal zu zeigen behauptete zwei Kriterien,
   wo eines steht.
2. **`matchesDocuments` bekommt nur bei `true` eine Zeile** („Die Regel bindet
   auch den Beleg an den Sachverhalt."). Ein `false` ist kein Wert, sondern
   sein Fehlen — dieselbe Regel wie für jedes andere Feld. So bleibt der Fall
   von **L-249** sichtbar: 29 von 30 Regeln tragen die Zeile, ohne ein
   einziges Beleg-Kriterium darunter.
3. **Die Gruppe „Herkunft" zeigt Rang 27 und 28 nicht.** Nicht aus
   Zurückhaltung: der **gespiegelte Typ trägt sie nicht**. `RecurringRule` in
   `src/ludwig/modules/recurring-rules/domain/rule.ts` hat weder `agentRunId`
   noch `exportBatchId` noch `datevDocumentLinkSystem`/`…Guid`. Drei Felder zu
   erfinden, um eine Gruppe zu füllen, wäre die lokale Neudefinition, die §5
   verbietet — **neuer Befund**, siehe unten.
4. **Der Klartext-Satz steht im Kopf, nicht in einer Gruppe**, weil er die
   Ränge 1, 2, 4, 7, 17 und 19 zusammenfasst und damit über allen Gruppen
   steht, nicht in einer.

**Neuer Befund für `ludwig/app` (Kandidat):** der gespiegelte `RecurringRule`
kennt **`agentRunId`, `exportBatchId` und die beiden `datevDocumentLink*`
nicht**, obwohl das Profil sie als Ränge 27 und 28 führt und die Spec sie in
„Herkunft" vorsieht. Entweder gehören sie in den Domänen-Typ, oder Rang 27/28
gehören aus dem Profil — heute kann keine Form sie zeigen, ohne einen Typ zu
erfinden.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
