# 0131 · RecurringRuleList „Regelwerk des Mandanten" — alle Dauerbuchungs-Regeln nebeneinander

| | |
|---|---|
| Status | **offen** |
| Stufe | `entities/recurring-rule/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: Buchungsweise, Personenkonto, Belegnummern-Strategie |
| Quelle | Entitätsprofil `docs/entitaeten/recurring-rule.md`, Abschnitte „Listen" (zweite Zeile) und „Formen" (Zeile `RecurringRuleList` „Regelwerk des Mandanten") |
| Auftrag | Die Liste **aller** Wiederkehr-Regeln eines Mandanten, sachverhaltsübergreifend. Job-Satz: *Wenn ein Mandant übernommen ist, will die Sachbearbeiterin alle Dauerbuchungs-Regeln nebeneinander sehen, damit sie erkennt, welche stillsteht, welche kein Personenkonto hat und welche doppelt greift.* |
| Ersetzt | nichts — und genau das ist der Punkt: `modules/recurring-rules/infrastructure/rule-overview-queries.ts` (205 Z., `listRulesOverviewForClient` → `RuleOverviewItem` mit 22 Feldern, sortiert `is_active desc, case_number asc, priority asc`) ist **gebaut und hat keinen Aufrufer**. Der einzige Verweis außerhalb der Datei ist der Barrel-Export in `modules/recurring-rules/server.ts` Z. 19–20 (Befund **L-252**). Die Verwaltungssicht aus F40 Teil B existiert als Query und ist nie angeschlossen worden. |
| Warum nicht so lassen | Ohne diese Sicht gibt es **keinen Ort**, an dem zwei Regeln desselben Sachverhalts sichtbar werden — der `RegelwerkTab` nimmt nur eine (`existingRule: RecurringRule \| null`), obwohl der Tabellenkommentar mehrere erlaubt und im Bestand ein Sachverhalt zwei trägt (Befund **L-245**). Ebenso unsichtbar bleiben die 29 Regeln mit `profile_source='onboarding'`, deren Profil nie ein Mensch geprüft hat. |
| Vertagt, weil | **kein Screen sie zeigt** (§7: „Eine Form ohne Screen wird nicht empfohlen") und ihr **Ort offen** ist: es gibt weder eine Route noch ein Seitenprofil unter `docs/seiten/`. Naheliegend wäre `clients/[clientSlug]/configuration/*` oder ein Reiter der Mandantenseite — das entscheidet die Spec, nicht das Profil. Dazu: die vier Formen der Familie (`RecurringRuleRow`, `RecurringRuleList` „Erwartete Zahlungen", `RecurringRuleFacts`, `RecurringRuleEditor`) gehen zuerst, und diese Liste setzt auf der Zeile auf. |
| Setzt voraus | `RecurringRuleRow` (erste Welle, dieselbe Zeile — **keine zweite**, R17) · `DataTable` (0057) · `FilterBar` · `EmptyState` · ein Seitenprofil für den Ort |
| Blockiert | nichts im Set |
| Angelegt von / am | Claude, 2026-09-08 (Skill `entitaet-analysieren` §9) |

## Warum das eine eigene Komponente wird und kein `columns`-Prop

Nach §8 wird eine Ausprägung eine eigene Komponente, wenn sie einen eigenen
Job-Satz hat **und** sich in mindestens zwei von {Grundgesamtheit, Sortierung,
Filter, Massenaktion, Spaltensatz} unterscheidet. Gegen die einzige heute
gebaute Liste („Erwartete Zahlungen ohne Eingang", `Schritt5.tsx`) sind es
**drei**:

| Merkmal | „Erwartete Zahlungen" | „Regelwerk des Mandanten" |
|---|---|---|
| Grundgesamtheit | aktive Regeln mit Rhythmus, deren Zahlung im Stapelzeitraum fehlt | **alle** Regeln eines Mandanten |
| Sortierung | keine (Query-Reihenfolge) | `is_active desc, case_number asc, priority asc` |
| Spaltensatz | 4 | 10 (Ränge 1–7, 10, 11, 22) |
| Filter | keiner | Gültigkeit, Buchungsweise |
| Massenaktion | keine (bewusst: „Auskunft, keine Aufgabe") | keine |

Die **Zeile** bleibt in beiden Fällen dieselbe `RecurringRuleRow` — zwei
Zeilen-Komponenten für eine Entität wären falsch (R17). Nur der Rahmen um sie
wird ein zweiter.

## Was schon feststeht

- **Spalten** (Ränge aus dem Profil): 1 Gegenpartei-Kriterium · 2 Buchungsweise
  (`StatusBadge axis="regel_modus"`) · 3 Gültigkeit · 4 erwarteter Betrag ·
  5 Rhythmus · 6 Sachverhalt (`CaseCell`, weil die Liste ihren Fall verlässt) ·
  7 Richtung · 10 Gegenkonto · 11 Personenkonto · 22 Belegnummern-Strategie.
- **Umfang:** 1 · 3 · 26 Regeln je Mandant (drei Mandanten in Staging,
  2026-09-08). Unter 20 Zeilen im Regelfall → **keine `Pagination`, kein
  virtuelles Scrollen, Filter im Client**.
- **Leerfall, zwei verschiedene:** „noch keine Regel angelegt" ist ein
  Vorratszustand und häufig — 75 von 105 Dauersachverhalten tragen keine Regel
  (71 %). „Keine Treffer" ist ein Filterproblem und braucht den Weg zurück.
- **Zwei Spalten haben noch keine deutschen Wörter**
  (`document_number_strategy`, `profile_source` — Befund **L-242**). Bis dahin
  nimmt die Liste die Wörter als Prop und zeigt einen Wert ohne Wort roh an,
  damit die Lücke sichtbar bleibt.
- **Der Zeilen-Typ fehlt im Spiegel:** `RuleOverviewItem` liegt in
  `infrastructure/`, nicht in `domain/` (Befund **L-240**). Bis dahin nimmt die
  Zeile ihre Felder einzeln als Props.

## Was diese Datei nicht ist

Keine Spec. Auftrag, Quelle und Grund der Vertagung — die Spec schreibt später
`spec-schreiben`, sobald `RecurringRuleRow` steht und der Ort der Liste
entschieden ist.
