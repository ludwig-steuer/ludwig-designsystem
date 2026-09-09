# 0134 · `RecurringRuleFacts`

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-08, am selben Tag nachgearbeitet; die gemessene Prüfung steht in 0119 aus |
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
| **Herkunft** (nur `all`) | Herkunft des Profils (23) · Zahlungskonto (24) · Split-Vorlage (21) · Steuerschlüssel und USt-Satz der Vorlage (25) · Belegnummern-Strategie (22) · Idempotenz-Anker (27) | nur mit `all` und nur je gesetztem Feld. **Buchungslauf und Buchungszyklus (27) und der DMS-Beleglink (28) fehlen**: der gespiegelte `RecurringRule` trägt die vier Felder nicht (Befund **L-265**). Kommen sie, kommen die Zeilen — die Gruppe ist dafür gebaut |

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
erfinden. **Eingetragen als L-265** (Nacharbeit 2026-09-08); die Abnahme fand
ihn im Register nicht, weil er nur hier stand.

## Abnahme

Schlanke Abnahme nach Owner-Entscheid 2026-09-08: geprüft ist die
**Schnittstelle**, nicht die Darstellung. Pixel, Abstände und Farbwirkung
stehen bei **0119**.

| Kriterium | Nachweis (Datei:Zeile · Story · Befehl) | Ergebnis |
|---|---|---|
| **Schnittstellen-Tabelle Zeichen für Zeichen** | Alle neun Zeilen decken sich mit `RecurringRuleFacts.tsx:67–105`: `rule`, `summary`, `schedule`, `preview`, `labels` Pflicht; `all` (Default `false`), `accountHref`, `hints`, `currency` (Default `EUR`) optional. Der Inline-Typ von `preview` steht im Code als exportiertes `RecurringRulePreview` (`:51–57`) — gleiche Form, zusätzlicher Name; die Tabelle nennt ihn nicht, der Bauabschnitt schon | ✓ |
| **Gruppen-Tabelle „Herkunft"** | Sie führt „Idempotenz-Anker, **Buchungslauf, Buchungszyklus** (27) · **DMS-Beleglink** (28)". Der Code zeigt davon nur den Idempotenz-Anker (`RecurringRuleFacts.tsx:219–227`), weil der gespiegelte `RecurringRule` (`src/ludwig/…/domain/rule.ts:208–263`) weder `agentRunId` noch `exportBatchId` noch `datevDocumentLink*` trägt. Die Entscheidung steht im Bauabschnitt, die Gruppen-Tabelle wurde nicht nachgezogen — und der Befund dazu steht **nicht** in `docs/befunde-app.md`, obwohl `docs/backlog/README.md` das verlangt | ✗ |
| `pnpm typecheck` grün | Exit 0 (ein Lauf für 0131–0135, 2026-09-08). `pnpm build` nach Owner-Entscheid 2026-09-07 nicht gelaufen | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `RecurringRuleFacts.tsx` · `.stories.tsx` · Titel `v3/Entitäten/Wiederkehr-Regel/RecurringRuleFacts` (`stories:21`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `RecurringRuleFacts.tsx:60–66`; `pnpm check:when` und `check:language` Exit 0 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Keine Inline-Styles, kein Hex; Buchungsweise über `StatusBadge axis="regel_modus"` (`:235`), die drei Wortlisten kommen als `labels`-Prop, der Rhythmus aus `RULE_INTERVAL_LABEL` (`:191`) | ✓ |
| Alle Stories vorhanden; ausgeschlossene begründet | 6 Exporte (`Filled`, `WithoutCriterion`, `Modes`, `All`, `InUse`, `Edges`) = §6-Rechnung 2+1+1+1+1; `Leer`, `LeerNachFilter`, `Laedt`, `Fehler` begründet ausgelassen | ✓ |
| **Story je Prop wie zugewiesen** | Acht von neun. `currency` steht mit Nachweis `Filled` in der Tabelle, wird aber in keiner Story gesetzt — gezeigt ist nur der Default `EUR` | ✗ |
| Prüfliste §9, soweit ohne Browser prüfbar | Kein Icon ohne Wort; Sie-Form und GLOSSARY-Begriffe in den Strings; Konten über `AccountCell`, Datum über `Time`, Beträge über `AmountCell`. **Aber**: „Zahlen rechts" trifft der USt-Satz nicht — `${t.taxRatePercent} %` steht als nackter String in der Feldliste (`:214`), während „Verhalten" ausdrücklich „Prozentwerte … in `v2num`" verlangt. Kontrast und Trefferfläche | ✗ (ein Fall) |
| Im Browser angesehen | Messprotokoll im Abschnitt „Gemessen" | vertagt auf 0119 |
| Ein Feld ohne Wert erscheint nicht; eine Gruppe ohne Feld erscheint nicht | Jeder `push` ist einzeln bewacht (`:114–228`), `Group` gibt bei leer `null` zurück (`:283`); Story `WithoutCriterion` (Gruppe „Auslöser" abwesend) und `Edges` (`schedule: null` → „Erwartung" abwesend) | ✓ |
| Der Klartext-Satz kommt aus `summary` | `:233`; `grep -n "hasAnyCriterion\|describeRecurringRule\|MATCH_CRITERIA" RecurringRuleFacts.tsx` → 0 Treffer | ✓ |
| Bei `preview.automatic === false` steht `preview.note`, keine leere Karte | `:184–186` (Zeile „Buchungsvorschlag") und `:250` (die Karte nur bei `automatic`); Story `Modes`, dritte Spalte | ✓ |
| Die Vorschau ist ein `JournalEntryCard`, keine eigene Tabelle | `:252`; Story `Filled` | ✓ |
| Die Form zerlegt keinen Beschriftungs-String | `grep -n "\.split(" RecurringRuleFacts.tsx` → 0 Treffer; die Übersetzung macht der Aufrufer (`stories:45–89`) | ✓ |
| Betrag und Toleranz aus `accrualAmount()` und `effectiveAmountTolerance()` | `:106` und `:128`; `grep -n "template\.amount" RecurringRuleFacts.tsx` → 0 Treffer | ✓ |
| Konten stehen als **Nummer** in `AccountCell` | `Account` (`:301–303`) gibt nur die Nummer weiter und schlägt keinen Namen nach; Story `Filled` | ✓ |
| Die Gültigkeit ist ein Wort **ohne** Farbe | `:238` mit `.v2rrfacts__validity`, definiert als `--color-text-muted` ohne Ton und ohne Punkt (`v3.css:3805`) | ✓ |
| Ein Wert ohne Wort erscheint roh | `ruleLabel()` (`recurring-rule.ts:51`); Story `All` mit `fixed` ohne Eintrag | ✓ |
| Kein eigener Rahmen, kein eigener Innenabstand | `.v2rrfacts` trägt nur `display/flex/gap` (`v3.css:3796`), kein `border`, kein `padding`; Story `InUse` setzt den Rahmen selbst. Die Messung bei 1280/1600 px | ✓ (Maß vertagt auf 0119) |
| Ersetzt die vier Abschnitte des `RegelwerkTab` und die Kriterien-Tabelle des `ZuordnungTab` | Die Ablösung ist ein eigener Schritt in `ludwig/app` | offen (App) |

Abgenommen von / am: Claude (zweiter Agent), 2026-09-08 ·
**Offene Punkte:** (1) die Gruppe „Herkunft" verspricht vier Felder, die der
gespiegelte Typ nicht hat — Tabelle nachziehen **und** den Befund in
`docs/befunde-app.md` eintragen; (2) der USt-Satz steht ohne `v2num`,
entgegen „Verhalten"; (3) `currency` hat keine Story, die die Prop setzt.

## Nacharbeit zur Abnahme, 2026-09-08

Drei Mängel: einmal die Spec, einmal der Code, einmal eine Story.

**M1 — die Gruppen-Tabelle versprach vier Felder, die es nicht gibt.** Der
Bauabschnitt entschied richtig (Nr. 3: der Spiegel trägt sie nicht, also zeigt
die Form sie nicht), aber die Tabelle darüber blieb stehen und versprach sie
weiter. Und der Befund, den derselbe Abschnitt „neuer Befund" nennt, stand
nirgends im Register — `docs/backlog/README.md` verlangt beides, Spec **und**
Zeile in `befunde-app.md`, genau damit der Entwicklungsagent der App ihn
findet. Er ist jetzt **L-265**.

**M2 — der USt-Satz stand als nackter String.** `${wert} %` ohne `v2num`,
während jede andere Zahl der Form rechtsbündig mit Ziffernbreite steht (§9).
Eine Prozentzahl ist eine Zahl; dass sie ein Zeichen hinter sich trägt, macht
sie nicht zu Text.

**M3 — `currency` hatte `Filled` als Nachweis, aber keine Story setzte die
Prop.** Sie steht jetzt in `Edges` auf `CHF`. Der Fall ist echt genug: die
Regel führt keine Währungsspalte, jeder Betrag an ihr ist Euro — eine andere
Währung kann also **nur** vom Aufrufer kommen, und wenn die Prop das können
soll, muss eine Story zeigen, dass sie durchschlägt. Die Alternative wäre
gewesen, die Prop zu streichen und `EUR` fest zu verdrahten; das wäre weniger
Code, aber die Härte gehört nicht in eine Form, die den Betrag nur
weitergibt.

## Nachtrag zum Spiegellauf vom 2026-09-09 — eine Prop weniger

Der Spiegel führt seit dem Lauf auf `ab7863d8` die vier Wortlisten der
Wiederkehr-Regel selbst (`RULE_DIRECTION_LABEL`,
`RULE_DOCUMENT_NUMBER_STRATEGY_LABEL`, `RULE_PROFILE_SOURCE_LABEL`, dazu das
schon vorhandene `RULE_INTERVAL_LABEL`) — die Behebung von **L-242** und
**L-256**. Damit fällt `labels` als Prop der Fakten.

Was das praktisch ändert:

- **`RecurringRuleLabels`, `ruleLabel()` und `RecurringRuleDraft` sind weg**,
  und mit ihnen die Datei `entities/recurring-rule/recurring-rule.ts`. Sie war
  ein Behelf mit Ablaufdatum, und das Datum ist eingetreten.
- **Der Fall „Wert ohne Wort" gibt es nicht mehr.** `ruleLabel()` fiel auf den
  Rohwert zurück, und drei Stories zeigten das ausdrücklich. Die neuen Listen
  sind über ihren Schlüsseltyp **vollständig** (`Record<RuleDirection, string>`);
  ein Wert ohne Wort ist damit kein Fall der Darstellung mehr, sondern ein
  Typfehler. Die Nachweise dafür sind gestrichen, nicht umgeschrieben — sie
  beweisen ein Verhalten, das es nicht mehr gibt.
- **Die Story-Fixture hatte eigene Wörter erfunden.** `LABELS` schrieb für
  `period_key` „Periodenkennung", die Domäne schreibt „aus dem Zeitraum
  (z. B. 2026-03)"; für `derived` stand „abgeleitet" gegen „aus vorhandenen
  Buchungen abgeleitet". Das war eine zweite Wahrheit, die niemandem auffiel,
  weil sie plausibel klang. Jetzt gibt es nur noch eine.
