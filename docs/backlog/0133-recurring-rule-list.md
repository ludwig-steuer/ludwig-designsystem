# 0133 · `RecurringRuleList` — erwartete Zahlungen ohne Eingang

| | |
|---|---|
| Status | fertig — abgenommen 2026-09-08, am selben Tag nachgearbeitet; die gemessene Prüfung steht in 0119 aus |
| Stufe | `entities/recurring-rule/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Dauerzahlung, Buchungsweise, Sachverhalt |
| Quelle | Entitätsprofil `docs/entitaeten/recurring-rule.md` (Status **geprüft**, 2026-09-08), Abschnitte „Listen" (erste Zeile), „Formen" (Zeile `RecurringRuleList`), „Zuschnitt" (Marke **jetzt**) |
| Domänen-Stand | gelesen gegen **`origin/staging`** in `ludwig/app` (2026-09-08), nicht gegen den eingefrorenen Spiegel `src/ludwig/`. **Erledigt, deshalb hier nicht mehr als offen geführt:** ~~L-253~~ (`2c0c888f` — `matchTransaction()` und `hasAnyCriterion()` lesen eine gemeinsame Liste `MATCH_CRITERIA`) · ~~L-254~~ (`9a3ce2db` — `RULE_PRIORITY_DEFAULT = 100` für alle drei Schreiber) · ~~L-244~~ (`b7544542` — das Präfix heißt jetzt `datev-wk:`, die Warnung kann erscheinen) · **L-243 b** (`5e48d892` — die lokalen Maps in `wiederkehrende.ts` sind weg). **Offen und tragend für diese Spec:** L-240, L-241, L-242, **L-243 a** (`Schritt5.tsx:100` gibt den Rhythmus weiter roh aus), L-245, L-249 und die drei neuen L-255 bis L-257. **Wer baut, holt vorher den Spiegel nach** (`scripts/sync-ludwig.sh`) — die eingefrorene Fassung kennt `MATCH_CRITERIA` und `RULE_PRIORITY_DEFAULT` noch nicht |
| Ersetzt | `ErwarteteZahlungen` in `modules/stapelabnahme/ui/Schritt5.tsx` Z. 77–113 — die **einzige** heute gebaute Liste über Wiederkehr-Regeln |
| Blockiert | nichts im Set. Sie ist die einzige Form der Familie, die heute einen Screen ablöst, und steht deshalb vor den Fakten |
| Setzt voraus | **0132** (`RecurringRuleRow`) — die Liste ist der Rahmen um dieselbe Zeile |
| Spec von / am | Claude, 2026-09-08 (Skill `spec-schreiben`) |

## Ziel

> Wenn **ein Buchungszyklus zur Abnahme steht**, will **die Buchhalterin**
> **sehen, welche erwartete Dauerzahlung im Zeitraum nicht kam**, damit **sie
> nachfragt, statt den Stapel blind freizugeben.**

Das ist der Job-Satz aus dem Profil, und die Liste tut genau das und nichts
sonst: **Auskunft, keine Aufgabe.** Sie blockiert die Freigabe nicht, sie hat
keine Sammelaktion und keinen Filter.

Heute gibt es sie als Vierspalten-Tabelle in Schritt 5 der Stapelabnahme. Zwei
Dinge sind daran falsch:

1. **Bei null Treffern verschwindet die ganze Liste.** Damit verschweigt sie
   ihren wichtigsten Fall: *alle erwarteten Zahlungen sind eingegangen.* Wer
   nichts sieht, weiß nicht, ob geprüft wurde oder ob nichts zu prüfen war.
2. **Man sieht nicht, ob die ausbleibende Zahlung überhaupt hätte gebucht
   werden sollen** — Buchungsweise (Rang 2) fehlt in der Spaltenliste, und der
   Rhythmus steht roh englisch da (`monthly`, Befund **L-243 a** — am
   2026-09-08 gegen `origin/staging` nachgesehen: `Schritt5.tsx:100` gibt ihn
   unverändert roh aus; nur die Schwester **b** ist behoben, `5e48d892`).

## Einordnung

- **Wiederverwenden:** `DataTable` (0057) deckt den Fall **nicht** — sie ist
  für Listen mit Sortierung, Auswahl und Seiten über die URL. Hier gilt:
  keine Sortierung (die Query-Reihenfolge), kein Filter, keine Auswahl,
  Obergrenze **29 Zeilen** (mehr aktive Regeln gibt es im Bestand nicht).
  `Table` + `Card` + `EmptyState` reichen — dieselbe Entscheidung wie bei
  `InvoiceLineList` (0115), und aus demselben Grund: gemessener Umfang statt
  Vorsorge.
- **Neu, weil:** §3 **Nr. 5** — die Liste ist eine Entitäts-Form mit eigenem
  Job und eigenem Screen; keine vorhandene Form deckt sie ab.
- **Zuschnitt:** eine Datei `RecurringRuleList.tsx`, **getrennt** von der Zeile
  (0132) nach §4: die Zeile wird woanders allein gebraucht (Regelwerk-Reiter
  des Falls, 0131), sie hat ihr eigenes `@when`, und die Liste bringt eigene
  Teile mit, die die Zeile nichts angehen (Kopf, Zähler, Leerfall).
- **Setzt auf:** `Card`, `CardHead`, `Table`, `HeadRow`, `EmptyState`,
  `RecurringRuleRow` (0132), `formatCount`.

**Eine Abweichung vom Profil, mit Begründung:** die Formen-Tabelle nennt unter
„setzt auf" auch `Disclosure`. Diese Liste bekommt **keine** Klappe. Sie ist
kurz (p90 deutlich unter 29 Zeilen), und eine Liste, die sich selbst
wegklappt, ist genau der Fehler, den diese Aufgabe behebt — heute verschwindet
sie schon von allein.

## Was die Liste zeigt

| Teil | Inhalt |
|---|---|
| Kopf | Titel „Erwartete Zahlungen ohne Eingang", daneben der Zeitraum des Stapels und der Zähler („3 von 27 Regeln") |
| Zeilen | `RecurringRuleRow` mit dem Spaltensatz **`case`, `counterparty`, `bookingMode`, `amount`, `interval`, `direction`, `lastPayment`** |
| Leerfall | `EmptyState` mit dem **Erfolgssatz**: „Alle erwarteten Dauerzahlungen sind im Zeitraum eingegangen." |
| Fuß | keiner — es gibt nichts zu summieren; der Betrag jeder Zeile ist eine Erwartung, keine Buchung |

**Der Sachverhalt steht vorn.** Die Liste verlässt ihren Fall — sie zählt über
alle Sachverhalte eines Mandanten —, und das Profil entscheidet für diesen
Fall: „in einer Liste, die ihren Sachverhalt verlässt, steht der `CaseCell`
vorn." So benennt Schritt 5 heute schon jede Zeile.

**Rang 3 (Gültigkeit) steht hier nicht**, obwohl die Listen-Tabelle des
Profils ihn nennt. Grund: die Grundgesamtheit ist `listOverdueRecurringCharges`
— **aktive** Regeln mit Rhythmus. In jeder Zeile stünde dasselbe Wort
(„aktiv"), und eine Spalte, die in jeder Zeile denselben Wert trägt, ist der
Fall „Rabatt" aus 0114 (L-201). **Rang 2 (Buchungsweise) steht sehr wohl
hier** — er streut (`accrue_then_settle` 29 · `book_on_payment` 1 ·
`match_only` 0) und beantwortet die Frage, ob die fehlende Zahlung überhaupt
etwas gebucht hätte. Die Spalte bleibt an der Zeile verfügbar, 0131 benutzt
sie.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `rules` | `readonly RecurringRuleListRow[]` | ja | die überfälligen Regeln in der Reihenfolge der Query. Der Typ ist `RecurringRuleRowData & { id: string }` aus dem Katalog (0131) — **ohne** `labels` und `caseHref`, die Props der Liste sind. `id` ist der Schlüssel der Zeile, nicht ihr Inhalt | `Filled` |
| `caseHref` | `(caseId: string) => string` | ja | Weg zum Sachverhalt. Ohne Weg ist die Liste eine Sackgasse: die Nachfrage passiert **am Fall** | `Filled` |
| `period` | `string` | nein | der Zeitraum des Stapels im Kopf („August 2026") | `Filled` |
| `total` | `number` | nein | wie viele Regeln geprüft wurden — der Nenner des Zählers („3 von 27 Regeln"). Ohne ihn steht nur die Trefferzahl | `Filled` |
| `title` | `string` | nein | Überschrift der Karte; Default „Erwartete Zahlungen ohne Eingang" | `InUse` |

Typen: `RecurringRuleRowProps` ist der **Prop-Typ der Zeile** aus 0132, nicht
ein Zeilenmodell — das Set definiert weiterhin keines (**L-240**). Sobald
`OverdueRecurringItem` in `recurring-rules/domain/` liegt, nehmen Liste und
Zeile ihn direkt; bis dahin ist die Prop-Signatur der Zeile die einzige
Struktur, die nicht driften kann, weil sie aus derselben Datei stammt.

**Was die Liste bewusst nicht kann:**

- **Keine Sammelaktion.** „Auskunft, keine Aufgabe" (`Schritt5.tsx`,
  `sachverhalt.md` S18) — sie blockiert die Freigabe des Stapels nicht.
- **Kein Filter, keine Sortierung, keine Seiten.** Obergrenze sind die 29
  aktiven Regeln des größten Mandanten; im Regelfall stehen dort ein bis fünf
  Zeilen. Mit Filter gäbe es „leer nach Filter" — den Zustand gibt es hier
  nicht, und deshalb hat die Liste ihn auch nicht als Story.
- **Nichts nachladen.** Der Schritt lädt, die Liste rendert.
- **Nicht selbst rechnen**, welche Regel überfällig ist: `isRuleDueInPeriod()`
  und `listOverdueRecurringCharges` gehören der App.

## Verhalten

**Server-Component.** Kein Zustand, kein Client-JS, kein Tastaturweg — die
Liste ist ein Abschnitt in einem Schritt, der seinen eigenen Weg hat.

Zustände:

| Zustand | Was steht da |
|---|---|
| gefüllt | die Zeilen, Zähler im Kopf |
| **leer** | `EmptyState` mit dem **Erfolgssatz** — die Karte bleibt stehen. Das ist der Kern dieser Aufgabe: heute verschwindet die Liste bei 0 Treffern und verschweigt damit den Erfolg |
| leer nach Filter | gibt es nicht — kein Filter |
| lädt | trägt der Schritt (Wizard), nicht die Liste |
| Fehler | trägt der Schritt: schlägt die Abfrage fehl, steht dort kein leeres Erfolgs-Wort, sondern ein Fehler. Eine Liste, die „alles eingegangen" sagt, weil die Abfrage kaputt ist, wäre gefährlicher als gar keine |

## Stories

Abgeleitet nach §6: 2 anwendbare Zustände (gefüllt, leer) + 0 Enum-Props +
0 Layout-Booleans + 0 Callbacks (`caseHref` baut eine URL, kein Rundlauf) +
1 „im Einsatz" + 1 Rand (Umfang und Sonderwerte) = **4**.
Titel `v3/Entitäten/Wiederkehr-Regel/RecurringRuleList`.

| Story | Beweist |
|---|---|
| `Filled` | drei ausbleibende Zahlungen, Kopf mit Zeitraum und Zähler „3 von 27 Regeln"; Sachverhalt vorn, letzte Zahlung hinten |
| `Empty` | der Erfolgssatz: „Alle erwarteten Dauerzahlungen sind im Zeitraum eingegangen." — die Karte steht, sie verschwindet nicht |
| `InUse` | im Schritt der Stapelabnahme, unter einer zweiten Karte: die Liste sitzt in der Seite, ohne die Freigabe zu blockieren |
| `Edges` | der obere Rand: **29** Zeilen (alle aktiven Regeln des größten Mandanten), darin eine Gegenpartei mit 46 Zeichen, ein Betrag `null`, eine Regel **ohne** Rhythmus, eine mit `lastPayment: null` („noch keine") und ein Sachverhalt ohne Titel |

Nicht anwendbar und warum: `LeerNachFilter` — es gibt keinen Filter.
`Laedt` und `Fehler` — beides trägt der Schritt, der die Daten holt; die Liste
lädt nichts (dieselbe Begründung wie bei `InvoiceLineList`, 0115).
`Interaktiv` — kein Callback.

Daten der Stories: Sachverhaltsnummern der Form `2026-0413`, Beträge wie
1.800,00 € und 89,90 €, Zahltage 1./28., Zeitraum „August 2026".

## Offene Fragen

1. **Trägt der Kopf einen Nenner?** *Ohne Antwort: ja, wenn `total` gesetzt
   ist („3 von 27 Regeln"), sonst nur die Trefferzahl.* Ohne Nenner sagt „3"
   nichts darüber, wie gründlich geprüft wurde.
2. **Wie heißt der Erfolgssatz genau?** *Ohne Antwort: „Alle erwarteten
   Dauerzahlungen sind im Zeitraum eingegangen."* Er ist ein Erfolg, kein
   Mangel — kein „Keine Einträge", kein Ausweg-Knopf.
3. **Bleibt die Spalte Gültigkeit draußen?** *Ohne Antwort: ja* (siehe oben:
   konstante Spalte). Ändert sich die Grundgesamtheit auf „alle Regeln mit
   Rhythmus", kommt sie über `columns` zurück, ohne dass die Zeile sich ändert.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Das gespiegelte Zeilenmodell | `rules: readonly OverdueRecurringItem[]` | **L-240** ist gelöst |
| Der Weg von der Zeile in den Regelwerk-Reiter | `onOpenRule?: (ruleId: string) => void` an der Zeile (0132) | ein Screen verlangt, aus der Auskunft heraus zu handeln — heute ist der Weg der Sachverhalt |
| Sortierung, Filter, Seiten | nicht diese Komponente, sondern `DataTable` in **0131** | ein Mandant hat mehr als ~30 Regeln, oder die Verwaltungssicht kommt |
| Die Gültigkeits-Spalte | `columns` um `validity` erweitern | die Grundgesamtheit umfasst auch inaktive Regeln |

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

- [ ] Bei null Zeilen steht die **Karte mit dem Erfolgssatz** — die Liste verschwindet nicht (Story `Empty`, am gerenderten Baum gemessen)
- [ ] Der Sachverhalt ist die **erste** Zelle jeder Zeile und führt über `caseHref` zum Fall (Story `Filled`)
- [ ] Die Buchungsweise steht in jeder Zeile als `StatusBadge axis="regel_modus"` (Story `Filled`) — sie fehlt heute in der App
- [ ] Auf dem Bildschirm steht nie `monthly` (Story `Filled` und `Edges`) — Ablösung von **L-243 a**, dem noch offenen Teil des Befunds
- [ ] Keine Gültigkeits-Spalte, kein Filter, keine Sammelaktion, keine Auswahl-Kästchen (Story `Filled`, Baum geprüft)
- [ ] Der Kopf zeigt Zeitraum und Zähler; ohne `total` nur die Trefferzahl (Story `Filled` gegen `InUse`)
- [ ] `lastPayment: null` zeigt „noch keine" (Story `Edges`)
- [ ] 29 Zeilen rendern ohne Seitenumbruch und ohne horizontales Quetschen bei 1280 px (Story `Edges`, gemessen)
- [ ] Ersetzt `ErwarteteZahlungen` in `Schritt5.tsx` ohne Funktionsverlust und zeigt zusätzlich Buchungsweise und den Leerfall — **offen (App)**

## Gebaut 2026-09-08

Gebaut von Claude (Skill `v3-komponente`), **nicht abgenommen**.

**Dateien:** `src/ui/v3/entities/recurring-rule/RecurringRuleList.tsx` ·
`RecurringRuleList.stories.tsx` (4 Stories) · Export über `src/ui/v3/index.ts`.

**Grün:** `pnpm typecheck` und die fünf Wächter auf Exit 0.

**Gemessen** mit `scripts/cdp.mjs` auf 6107, alle 4 Stories angesehen — keine
Konsolen-Ausgabe, keine Ausnahme:

| Was | Messung |
|---|---|
| Leerfall: Karte bleibt, Erfolgssatz | `Empty`: `.v2card` vorhanden, Spaltenkopf steht, `.v2empty__title` = „Alle erwarteten Dauerzahlungen sind im Zeitraum eingegangen.", `.v2empty__actions` = 0 (kein Ausweg-Knopf) |
| Sachverhalt ist die erste Zelle | `Filled`: Kopf = Sachverhalt · Gegenpartei · Buchungsweise · Erwartet · Rhythmus · Richtung · Letzte Zahlung; Zelle 1 je Zeile = `2026-0413 …`, Weg über `caseHref` |
| Buchungsweise in jeder Zeile | `Filled`: drei `.bdg` — Sollstellung, Bei Zahlung, Sollstellung |
| Nie `monthly` auf dem Bildschirm | `Filled` und `Edges`: Volltext-Suche nach `monthly\|quarterly\|yearly\|payment_*` = 0 Treffer |
| Kein Filter, keine Auswahl, keine Sortierung | `Filled`: `input[type=checkbox]` = 0, `.v2fbar/.v2chips/.v2selbar` = 0, `.v2sortlink` = 0 |
| Kopf mit Zeitraum und Zähler | `Filled`: `sub` = „August 2026", `meta` = „3 von 27 Regeln"; `InUse` ohne `total` = „3 Regeln" |
| `lastPayment: null` | `Filled` Zeile 3 und `Edges` Zeile 1: „noch keine" |
| 29 Zeilen ohne Quetschen bei 1280 px | `Edges`: 29 Zeilen; bei 1280 px kein Seiten- und kein innerer Scroll (Tabelle 1246 px), Zeilenhöhe 47 px in allen 29 Zeilen. Bei 700 und 1100 px scrollt der innere Rahmen (`.v2tbl__scroll`), statt zu quetschen — Kopf- und Zeilenkanten decken sich bei allen fünf Breiten (700/1100/1280/1400/1920) |

**Entscheidung, die die Spec offen ließ:** `rules` ist getippt als
`readonly RecurringRuleListRow[]`, nicht als
`readonly (RecurringRuleRowProps & { id: string })[]`. Grund: die Spec führt
`labels` und `caseHref` als **Props der Liste**, „an jede Zeile
durchgereicht". Verlangte der Zeilentyp sie zusätzlich je Zeile, wären die
beiden Listen-Props unerreichbar und jede der 29 Zeilen trüge dasselbe Objekt
noch einmal.

Die Fassung dieses Absatzes vom Bautag nannte einen `Omit<…>`-Ausdruck und
einen eigenen Export `RecurringRuleListItem`. Beides ist mit der Nacharbeit
weg: `RecurringRuleListRow` aus dem Katalog sagt dasselbe, `RecurringRuleListItem`
war ein reiner Alias darauf — zwei exportierte Namen für einen Typ, beide im
Barrel. Der Rest der Schnittstelle steht wie in der Spec.

## Abnahme

Schlanke Abnahme nach Owner-Entscheid 2026-09-08: geprüft ist die
**Schnittstelle**, nicht die Darstellung. Pixel, Abstände und Farbwirkung
stehen bei **0119**.

| Kriterium | Nachweis (Datei:Zeile · Story · Befehl) | Ergebnis |
|---|---|---|
| **Schnittstellen-Tabelle Zeichen für Zeichen** | Fünf von sechs Zeilen stimmen (`labels`, `caseHref`, `period`, `total`, `title` — `RecurringRuleList.tsx:69–91`). Die erste nicht: die Tabelle sagt `readonly (RecurringRuleRowProps & { id: string })[]`, der Code nimmt `readonly RecurringRuleListItem[]` (`:78`), und `RecurringRuleListItem` ist heute `RecurringRuleListRow` = `RecurringRuleRowData & { id: string }` (`:44`, `recurring-rule-columns.tsx:117`) — **ohne** `labels`, `caseHref`, `columns` **und ohne** `accountHref`. Auch der Abweichungssatz im Bauabschnitt stimmt nicht mehr: das dort genannte `Omit<RecurringRuleRowProps, "labels" \| "caseHref" \| "columns">` trüge seit 0131 noch `accountHref` | ✗ |
| **Export in der Tabelle** | `RecurringRuleListItem` ist exportiert (`RecurringRuleList.tsx:44`, `src/ui/v3/index.ts:454`) und steht in keiner Zeile der Schnittstelle | ✗ |
| `pnpm typecheck` grün | Exit 0 (ein Lauf für 0131–0135, 2026-09-08). `pnpm build` nach Owner-Entscheid 2026-09-07 nicht gelaufen | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `RecurringRuleList.tsx` · `.stories.tsx` · Titel `v3/Entitäten/Wiederkehr-Regel/RecurringRuleList` (`stories:8`) | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `RecurringRuleList.tsx:63–68`; `pnpm check:when` und `check:language` Exit 0 | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Keine Inline-Styles, kein Hex; die Buchungsweise kommt aus der Zelle des Katalogs (`StatusBadge axis="regel_modus"`), die Wörter als `labels`-Prop | ✓ |
| Alle Stories vorhanden; ausgeschlossene begründet | 4 Exporte (`Filled`, `Empty`, `InUse`, `Edges`) = §6-Rechnung 2+0+0+0+1+1; `LeerNachFilter`, `Laedt`, `Fehler`, `Interaktiv` begründet ausgelassen | ✓ |
| **Story je Prop wie zugewiesen** | Fünf Props haben ihre Story. `title` hat keine: die Tabelle nennt `InUse` als Nachweis, aber `InUse` (`stories:90–101`) übergibt die Prop nicht — in **keiner** Story steht ein anderer Titel als der Default | ✗ |
| Prüfliste §9, soweit ohne Browser prüfbar | Zahlen rechts nur bei „Erwartet" (`RecurringRuleList.tsx:102` im Kopf, `RecurringRuleRow.tsx:64` in der Zeile); kein Icon ohne Wort; Sie-Form und GLOSSARY-Begriffe in den Strings. Zeilenhöhe, Kontrast, Trefferfläche | vertagt auf 0119 |
| Im Browser angesehen | Messprotokoll im Abschnitt „Gemessen" | vertagt auf 0119 |
| Bei null Zeilen steht die **Karte mit dem Erfolgssatz** | `RecurringRuleList.tsx:107–120`: `Card` und `HeadRow` stehen vor der Fallunterscheidung, im `EmptyRow` ein `EmptyState` mit „Alle erwarteten Dauerzahlungen sind im Zeitraum eingegangen." und **ohne** `action`; Story `Empty` | ✓ |
| Der Sachverhalt ist die **erste** Zelle und führt über `caseHref` zum Fall | `RECURRING_RULE_OVERDUE_COLUMNS` beginnt mit `case` (`recurring-rule-columns.tsx:154–162`), `ORDER` stellt ihn vorn (`:120`); `caseHref` geht an jede Zeile (`RecurringRuleList.tsx:123`); Story `Filled` | ✓ |
| Buchungsweise in jeder Zeile als `StatusBadge axis="regel_modus"` | `recurring-rule-columns.tsx:325`; Story `Filled` mit zwei Modi im Bestand | ✓ |
| Auf dem Bildschirm steht nie `monthly` | `:335–340` über `RULE_INTERVAL_LABEL`; Stories `Filled` und `Edges` (dort eine Zeile ohne Rhythmus → „ohne Rhythmus") | ✓ |
| Keine Gültigkeits-Spalte, kein Filter, keine Sammelaktion, keine Kästchen | Der Satz enthält `validity` nicht (`:154–162`); in `RecurringRuleList.tsx` kein `input`, kein `Checkbox`, kein `FilterBar`, kein Sortier-Link | ✓ |
| Kopf zeigt Zeitraum und Zähler; ohne `total` nur die Trefferzahl | `counter()` (`:137–141`), `CardHead sub={period}` (`:96`); Story `Filled` („3 von 27 Regeln") gegen `InUse` (ohne `total`) | ✓ |
| `lastPayment: null` zeigt „noch keine" | `recurring-rule-columns.tsx:461`; Story `Filled` (dritte Zeile) und `Edges` | ✓ |
| 29 Zeilen ohne Umbruch und ohne Quetschen bei 1280 px | `minWidth={1180}` (`RecurringRuleList.tsx:60`), 29 Zeilen in `Edges`. Die Messung selbst | vertagt auf 0119 |
| Ersetzt `ErwarteteZahlungen` in `Schritt5.tsx` | Die Ablösung ist ein eigener Schritt in `ludwig/app` | offen (App) |

Abgenommen von / am: Claude (zweiter Agent), 2026-09-08 ·
**Offene Punkte:** (1) die erste Zeile der Schnittstelle beschreibt einen
anderen Typ als der Code — und der Abweichungssatz im Bauabschnitt ist
inzwischen selbst überholt; (2) `RecurringRuleListItem` fehlt in der Tabelle;
(3) `title` hat keine Story, die die Prop setzt.

## Nacharbeit zur Abnahme, 2026-09-08

Drei Mängel, alle in der Spec — und einer davon hat beim Nachsehen einen
vierten im Code freigelegt.

**M1 — der Typ von `rules`.** Die Tabelle nannte
`readonly (RecurringRuleRowProps & { id: string })[]`, gebaut war etwas
anderes, und der Abweichungssatz im Bauabschnitt, der das erklärte, war
seinerseits überholt: das dort genannte `Omit<…>` trüge seit 0131 noch
`accountHref` mit. Ein Erklärsatz, der einmal richtig war, altert schneller
als die Tabelle, weil ihn niemand mitzieht.

**M2 — `RecurringRuleListItem` stand in keiner Zeile der Schnittstelle.** Beim
Nachtragen fiel auf, warum das schwerfiel: der Typ war ein reiner Alias
(`= RecurringRuleListRow`), und **beide** Namen standen im Barrel. Zwei Namen
für eine Sache sind keine Schnittstellenzeile wert, sie sind ein Mangel. Der
Alias ist weg, sein erklärendes JSDoc sitzt jetzt an der Prop `rules`, wo es
gelesen wird. Damit erledigt sich die Zeile, statt geschrieben zu werden — der
kürzere Weg von beiden.

**M3 — `title` hatte `InUse` als Nachweis, aber keine Story setzte die Prop.**
Jetzt setzt `InUse` sie („Offene Dauerbuchungen dieses Stapels"), und das ist
auch die ehrlichere Story: der Rahmen dort ist die Stapelabnahme, nicht das
Regelwerk, und eine Liste in fremdem Rahmen heißt anders. Die Alternative wäre
gewesen, die Nachweisspalte zu leeren — dann stünde eine Prop ohne Beleg da,
und §5 sagt, die ist entweder überflüssig oder ihre Story fehlt.

## Nachtrag zum Spiegellauf vom 2026-09-09 — eine Prop weniger

Der Spiegel führt seit dem Lauf auf `ab7863d8` die vier Wortlisten der
Wiederkehr-Regel selbst (`RULE_DIRECTION_LABEL`,
`RULE_DOCUMENT_NUMBER_STRATEGY_LABEL`, `RULE_PROFILE_SOURCE_LABEL`, dazu das
schon vorhandene `RULE_INTERVAL_LABEL`) — die Behebung von **L-242** und
**L-256**. Damit fällt `labels` als Prop der Liste.

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
