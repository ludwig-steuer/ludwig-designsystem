# Erhebung: Reiter „Wiederkehr" am Dauersachverhalt — Delta zum DS-Profil `recurring-rule.md`

| | |
|---|---|
| Datum | 2026-09-11 |
| Staging-Stand | Pooler 6543, Abfrage 2026-09-11 07:53 UTC, `ludwig.client_accounting_case_rule` **30 Zeilen** (29 Sachverhalte, 3 Mandanten, angelegt 2026-08-21 … 2026-09-07) |
| Code-Stand | `staging` @ `46d976cb` (2026-09-11); Spiegel im DS `src/ludwig/` steht hinter `9c694f1`/`5cc7503` |
| Bezug | `packages/designsystem/docs/entitaeten/recurring-rule.md` (2026-09-08). Nur Delta und Bestätigung, keine Wiederholung |
| Art | nur `SELECT`, nur Aggregate, keine Kundendaten; Beispielwerte aus Tests |

## Kurzfassung

**Daten: unverändert.** Seit dem 2026-09-08 ist keine Regel dazugekommen oder geändert worden (max `created_at` 2026-09-07); alle Füllgrade des Profils gelten weiter. Einzige Bewegung drumherum: **114** statt 104 Dauersachverhalte (`kind='recurring_charge'`), 85 davon ohne Regel (75 %).

**Code: stark verändert.** In den drei Tagen seit dem Profil sind die vier „jetzt"-Formen des DS gebaut und in der App angeschlossen: `RuleEditorForm` ist von 464 auf 229 Zeilen geschrumpft und rendert `RecurringRuleEditor` (0135); `RegelwerkTab` rendert `RecurringRuleFacts` (0133/0134); die tote Query `listRulesOverviewForClient` hat eine Seite (`/clients/<slug>/configuration/recurring-rules`, J-54, Backlog 0131 damit erledigt). Von den 13 im Profil als „nicht editierbar" gelisteten Spalten sind **vier** editierbar geworden (`matchAmountTolerancePercent`, `matchContractNumber`, `matchDocumentTextRegex`, `matchingNote`). Die Wortlisten `RULE_DIRECTION_LABEL`, `RULE_DOCUMENT_NUMBER_STRATEGY_LABEL`, `RULE_PROFILE_SOURCE_LABEL` existieren jetzt (L-242, L-256 erledigt).

---

## (a) Füllgrad und Werteverteilung je Einstellung (Staging, 30 Regeln)

Alles deckungsgleich mit dem Profil vom 2026-09-08 — hier bestätigt, damit die Zahl nachprüfbar am Datum hängt. Eine Zeile = 3,3 %.

| Einstellung (Spalte) | gesetzt / 30 | Verteilung | Bemerkung |
|---|---|---|---|
| `booking_mode` | 30 (NOT NULL) | `accrue_then_settle` 29 · `book_on_payment` 1 · `match_only` **0** | Default der Spalte ist `book_on_payment`; der Import setzt fest `accrue_then_settle` |
| `document_number_strategy` | 30 (NOT NULL) | `period_key` 26 · `from_document` 3 · `fixed` 1 | Spalten-Default `fixed`; 26 × `period_key` stammen aus dem Backfill 2026-08-27 |
| `expected_interval` | 30 | `monthly` 30 | `quarterly`/`yearly` kommen nicht vor |
| `expected_day_of_month` | 29 | `1` 22 · `2` 3 · `28` 3 · `10` 1 · NULL 1 | |
| `expected_direction` | 28 | `payment_in` 26 · `payment_out` 2 · NULL 2 | Bestand ist zu 87 % debitorisch (eigene Dauerrechnungen) |
| `template_lines` (jsonb) | **0** | NULL 30 | keine Split-Vorlage, keine Prozent-Zeile (`percent`-Schlüssel 0) — der Bestand kennt nur die Ein-Konto-Vorlage |
| `template_counter_account_number` | 29 | — | 4–5 Zeichen |
| `personal_account_number` | 29 | — | 5 Zeichen |
| `template_amount` | 29 | — | in allen 29 Fällen `= match_amount` |
| `template_description` | 30 | — (Freitext) | Länge p50 37,5 · max 60 |
| `template_tax_key` | 3 | `9` 3 · NULL 27 | |
| `template_tax_rate_percent` | 0 | — | |
| `match_amount_tolerance` | 30 (NOT NULL) | `0.00` 30 | absolut, Default 0 |
| `match_amount_tolerance_percent` | 0 | NULL 30 | prozentual, Check 0 < x ≤ 100 |
| `match_counterparty_name` | 30 | — (Freitext) | Länge p50 23 · max 46 |
| `match_counterparty_iban` | 0 | — | |
| `match_amount` | 29 | — | |
| `match_purpose_regex` | 0 | — | |
| `match_contract_number` | 0 | — | Belegseite (F94) |
| `match_document_text_regex` | 0 | — | Belegseite (F94) |
| `matches_documents` | 30 (NOT NULL) | `true` 29 · `false` 1 | abgeleitet: Personenkonto genügt |
| Kriterien je Regel (Name/IBAN/Betrag/Regex) | — | **2 Kriterien: 29** · 1 Kriterium: 1 · 0: 0 · ≥3: 0 | Name + Betrag ist das einzige Muster im Bestand |
| `payment_account_id` | 0 | NULL 30 | „Konto der jeweiligen Zahlung" |
| `valid_from` | 29 | 2026-01-01 18 · 2026-02-01 5 · 2026-01-02 3 · 2026-01-28 2 · 2026-09-01 1 · NULL 1 | |
| `valid_until` | 0 | — | Beendigung läuft über `is_active` |
| `is_active` | 30 (NOT NULL) | `true` 29 · `false` 1 | |
| `priority` | 30 (NOT NULL) | `100` 30 | Spalten-Default ist `0`, Code-Default `RULE_PRIORITY_DEFAULT = 100`; im Bestand wirkungslos |
| `profile_source` | 29 | `onboarding` 24 · `derived` 5 · NULL 1 | **`onboarding` schreibt kein lebender Codepfad mehr** — die 24 stammen aus der Backfill-Migration `20260827170000_recurring_rules_period_key_backfill.sql`. Seither erzeugen die Schreiber nur `derived` (kein explizites `documentNumberStrategy`) oder `agent` (explizit gesetzt); `human` wird nie geschrieben, auch nicht von `saveRule` (s. b) |
| `matching_note` | **0** | — | Freitext, max 4000 laut Schema-Validierung; nie befüllt |
| `datev_document_number` | 29 | — | immer 8 Zeichen |
| `datev_document_link_system` / `_guid` | 27 / 27 | `ddms` 26 · `bedi` 1 · NULL 3 | |
| `import_reference` | 29 | alle `datev-wk:` | |
| `agent_run_id` | 0 | — | |
| `export_batch_id` | 2 | — | |

**Beziehungen:** 29 von 30 Regeln haben genau einen Sachverhalt, **ein** Sachverhalt trägt zwei Regeln (`case_id` doppelt). 114 Dauersachverhalte, 29 mit Regel.

**Delta zum 2026-09-08:** keins in der Tabelle selbst. Bestandswarnung des Profils (alles aus dem F91-Import, keine Hand-/Agent-Regel aus einer Zahlung) gilt unverändert.

---

## (b) Was die Sachbearbeiterin heute ändern kann — und wer sonst setzt

Quellen: `apps/web/src/modules/recurring-rules/application/rule-actions.ts` (`saveRule`, `saveRuleMatchingNote`, `removeRule`, `previewRuleMatches`), `domain/rule-draft.ts` (`RuleDraft`, `toSaveFields`), `ui/RuleEditorForm.tsx` (rendert `RecurringRuleEditor` aus `@ludwig/designsystem`), `ui/MatchingNoteForm.tsx`, `infrastructure/rule-writes.ts` (`insertRule`/`updateRule`/`resolveProfile`), Onboarding `modules/onboarding/application/recurring-candidates-core.ts` (→ `createRecurringCase(…, { origin: "onboarding" })`), Agent `accounting-cases/application/agent-tool-registry.ts` (`create_recurring_case`, `update_recurring_rule`).

Einstieg in den Editor heute: Reiter „Wiederkehrende Buchung" (`?tab=regelwerk`) → Karte „Regel anlegen" (ohne Regel) bzw. eingeklapptes `<details>` „Regel bearbeiten" (mit Regel). Dazu `prefill` aus einer zugeordneten Bankzeile (`prefillFromTransaction`, Seite `cases/[caseId]/page.tsx:415`).

| Einstellung | UI editierbar | Aktion / Feld | Setzer außerhalb der UI |
|---|---|---|---|
| `match_counterparty_name` | ja | `saveRule` · Editor „Gegenpartei" (Auslöser) | Onboarding (Personenkonto-Name), Agent `create_recurring_case`, `prefillFromTransaction` (nur ohne IBAN) |
| `match_counterparty_iban` | ja | `saveRule` · „IBAN" | Agent, `prefillFromTransaction` (bevorzugt) |
| `expected_direction` | ja | `saveRule` · „Richtung" | Onboarding (aus Personenkonto), Agent |
| `match_amount` | ja | `saveRule` · „Betrag" | Onboarding (`grossTotal`), Agent `update_recurring_rule` |
| `match_amount_tolerance` | ja | `saveRule` · „Toleranz" | Onboarding fest 0, Agent |
| `match_amount_tolerance_percent` | **ja — neu seit 2026-09-08** (L-261) | `saveRule` · „Toleranz in Prozent" | Agent (`create`/`update`) |
| `match_purpose_regex` | ja | `saveRule` · „Muster im Verwendungszweck"; Regex-Validierung serverseitig | Agent |
| `match_contract_number` | **ja — neu** | `saveRule` · „Vertragsnummer" | Agent nicht (nicht im Tool-Schema) |
| `match_document_text_regex` | **ja — neu** | `saveRule` · „Muster im Belegtext" | Agent nicht |
| `matches_documents` | nein (abgeleitet) | — ; seit `ba13b719` auch beim Update neu berechnet (L-249) | Server: `matchesDocuments()` aus Vertragsnr./Belegtext-Regex/Personenkonto |
| `booking_mode` | ja | `saveRule` · „Buchungsweise" (Select mit 3 Werten) | Onboarding fest `accrue_then_settle`; Agent; Server-Ableitung `deriveRuleProfile` nur wenn Aufrufer nichts sendet (die UI sendet immer) |
| `personal_account_number` | ja | `saveRule` · „Personenkonto" (Pflicht bei `accrue_then_settle`, Zod-Refine) | Onboarding, Agent |
| `template_counter_account_number` | ja | `saveRule` · „Gegenkonto" | Onboarding (Ein-Zeilen-Vorlage), Agent |
| `template_amount` | ja | `saveRule` · „Vorlagenbetrag" (Pflicht bei Sollstellung mit Ein-Konto-Vorlage) | Onboarding, Agent |
| `template_description` | ja | `saveRule` · „Buchungstext" | Onboarding, Agent |
| `template_tax_key` / `template_tax_rate_percent` | ja | `saveRule` · „BU-Schlüssel" / „USt-Satz"; Guard `assertNoTaxKeyOnAutomaticAccount` | Onboarding (Tax-Key), Agent |
| `template_lines` (Split-Vorlage) | **nein** — Editor zeigt nur lesend; `toSaveFields` lässt `lines` bewusst unangetastet („wäre Datenverlust") | — | Onboarding (Mehr-Zeilen-Kandidat), Agent `update_recurring_rule.templateLines` (ersetzt komplett, 2–20 Zeilen) |
| `expected_interval` | ja | `saveRule` · „Rhythmus" | Onboarding, Agent |
| `expected_day_of_month` | ja | `saveRule` · „Erwarteter Zahltag" | Onboarding, Agent |
| `valid_from` / `valid_until` | **nein** — nicht im `RuleDraft`, nicht im Editor | — | Onboarding (`valid_from`), Agent (`create` + `update`, „nachtragbar") |
| `payment_account_id` | ja | `saveRule` · „Zahlungskonto" (Optionen mit „geführt", seit `c6c37e65`) | niemand sonst (Onboarding/Agent-Schema kennen es nicht) |
| `matching_note` | ja, **zweifach** | (1) `saveRule` · Editor „Zuordnungs-Notiz" (neu); (2) `saveRuleMatchingNote` · `MatchingNoteForm` im Reiter „Zuordnung" — beide rufen `updateRuleMatchingNote` | Agent (eigener Pfad, dieselbe Kernfunktion) |
| `is_active` | ja | `saveRule` · Kästchen „Regel aktiv" | Onboarding (implizit true), Agent `isActive` |
| `priority` | **nein** — nicht im Editor; `RuleEditorForm` reicht `existingRule.priority ?? 100` durch | — | Agent `create_recurring_case.priority`; Default `RULE_PRIORITY_DEFAULT = 100` |
| `document_number_strategy` | **nein** | — ; `saveRule` sendet nichts → Insert: `deriveRuleProfile`, Update: bleibt | Agent (`create`/`update`, „Widerspruch nur mit Begründung"), sonst Server-Ableitung aus Vertragstyp + Richtung + Belegseite |
| `profile_source` | **nein** (nie sichtbar in der App — `RegelwerkTab` ruft `RecurringRuleFacts` ohne `all`) | — | Server: `agent` wenn Strategie explizit, sonst `derived`. **Auch eine Hand-Regel wird `derived`, nie `human`.** `onboarding` nur per Backfill-Migration |
| `datev_document_number`, `datev_document_link_*` | nein | — | Onboarding (Belegnummer + DMS-Link des Kandidaten), Agent |
| `import_reference` | nein | — | Onboarding (`datev-wk:<Belegnummer>`), Agent optional |
| `agent_run_id` | nein | — | nur Agent-Pfad |
| `export_batch_id` | nein | — | `saveRule` stempelt den offenen Zyklus (`resolveOpenBatchId`, F114); Agent stempelt Agent-Batch; Onboarding `null` |
| Regel löschen | ja | `removeRule` — im Editor als „Abbrechen"-Slot (`onCancel`) mit `window.confirm`; Vorschläge bleiben | Agent nicht (kein Delete-Tool) |
| Live-Trefferzahl | Anzeige | `previewRuleMatches` (entprellt 400 ms) → `countMatchesForCriteria`: „offen" vs. „schon an diesem Fall" | — |

**Neben­wirkung jedes `saveRule`:** anschließend `rescanForCase` → tatsächlich `rescanForClient` (alle aktiven Regeln gegen alle Bankzeilen des Mandanten), Ergebnis als `RescanSummary` (matched/eventsCreated/proposalsCreated/proposalsSkipped/notes) zurück an den Editor.

**Was gegenüber dem Profil steht:** Profil-Zeile „13 Spalten nicht editierbar" ist auf **9** geschrumpft: `priority`, `validFrom`/`validUntil`, `datevDocumentNumber`, `documentNumberStrategy`, `profileSource`, `template.lines`, `importReference` (+ Server-Stempel). `MatchingNoteForm` existiert noch und ist weiterhin im `ZuordnungTab` eingebettet — die Notiz hat damit zwei Editoren.

---

## (c) Wie die App eine Regel heute erklärt

### Ableitungs-/Beschreibungsfunktionen (`modules/recurring-rules/domain/`)

| Funktion | Datei | Eingaben | Ausgabe / Beispiel (aus Tests) |
|---|---|---|---|
| `describeRecurringRule(input)` | `rule-summary.ts` | `bookingMode`, `direction`, `matchCounterpartyName`, `matchCounterpartyIban`, `matchAmount`, `matchAmountTolerance`, `matchPurposeRegex?` | Satz „Greift bei jedem *Zahlungsausgang mit Gegenpartei „Musterfirma" über 60,00 €* und *erzeugt automatisch einen Buchungsvorschlag nach der Vorlage*." Varianten: Richtung `payment_in` → „Zahlungseingang", NULL → „passenden Umsatz"; Name **oder** IBAN („mit IBAN DE86 7019"); Toleranz nur bei > 0 als „(±5,00 €)" — **nur die absolute**, die Prozent-Toleranz kommt im Satz nicht vor; `accrue_then_settle` → „gleicht ihn gegen das Personenkonto aus (der Aufwand/Ertrag wird separat zur Fälligkeit sollgestellt)"; `match_only` → „ordnet ihn diesem Sachverhalt zu — ohne automatische Buchung"; ohne Kriterium → „Diese Regel hat noch keine Match-Kriterien und greift daher bei keiner Zahlung." |
| `hasAnyCriterion(input)` | `rule-summary.ts` | wie oben | `boolean`; liest seit `2c0c888f` dieselbe Liste `MATCH_CRITERIA` wie der Matcher (L-253); Richtung allein zählt nicht |
| `describeRuleSchedule(input)` | `rule-summary.ts` | `expectedInterval`, `expectedDayOfMonth`, `validFrom`, `validUntil` | „Wiederholt sich monatlich, erwartet zum 15. des Monats, vom 01.01.2026 bis 31.12.2026." · „Wiederholt sich vierteljährlich (Februar, Mai, August, November), unbefristet ab 01.02.2026." · ohne `validFrom` bei quarterly/yearly: „… jährlich — ohne Startdatum nicht verankerbar (welche Monate ist offen), unbefristet." · ohne Rhythmus: „Ohne festen Rhythmus (kein Überfälligkeits-Check), Laufzeit unbefristet ab 01.01.2026." · alles leer → `null` |
| `buildRulePreview(input)` | `booking-preview.ts` | `bookingMode`, `direction`, `counterAccount`, `personalAccount`, `bankAccount`, `lines`, `taxKey`, `amount` | `{ postings: PreviewPosting[], automatic, note }`; Posting = `{ debit: "4200 Miete", credit: "1800 Bank", amount: 6570.35, taxKey, accounts: {debit, credit} }`; ohne Zahlungskonto „Bank (aus Zahlung)"; Split → ein Satz je Zeile; `match_only` → `automatic=false` + Erklärung; `accrue_then_settle` → Settle-Zeile als `note` |
| `needsModeReview(rule)` | `booking-preview.ts` | `bookingMode`, `importReference`, `personalAccountNumber` | Hinweis „Aus dem DATEV-Import als „bei Zahlung" angelegt, trägt aber ein Personenkonto — vermutlich war eine Sollstellung gemeint." — seit `b7544542` erreichbar (L-244) |
| `effectiveAmountTolerance(rule)` · `amountDeviation()` · `accrualAmount(rule)` | `rule.ts` | Toleranzen / `template.amount` ?? Summe `lines` ?? `matchAmount` | eine Zahl; „die großzügigere gewinnt" |
| `RULE_DIRECTION_LABEL` · `RULE_INTERVAL_LABEL` · `RULE_DOCUMENT_NUMBER_STRATEGY_LABEL` · `RULE_PROFILE_SOURCE_LABEL` | `rule.ts` | Enum | „Zahlungsausgang/Zahlungseingang" · „monatlich/vierteljährlich/jährlich" · „aus dem Zeitraum (z. B. 2026-03) / aus dem Beleg / fest vergeben" · „aus vorhandenen Buchungen abgeleitet / vom Agenten angelegt / von Hand angelegt / beim Onboarding übernommen" — **neu seit 2026-09-08** |
| `prefillFromTransaction(txn)` | `rule.ts` | Betrag, Zweck, Gegenpartei-Name, IBAN | `RulePrefill`: IBAN vorhanden → IBAN + Richtung, **kein** Name, **kein** Betrag; sonst Name + Betrag + Richtung, Toleranz 0; Zweck nie als Regex |
| `deriveRuleProfile(input)` | `rule.ts` | `contractType`, `expectedDirection`, `matchesDocuments`, `personalAccountNumber` | `{ bookingMode, documentNumberStrategy }`; Modus nur `accrue_then_settle`, wenn Personenkonto da; `payment_in` → `period_key`; Belegseite + lease/recurring_invoice/service/other → `from_document`; sonst `period_key`; `fixed` nie |
| `matchTransaction` / `matchSourceDoc` | `rule.ts` | s. (d) | bewusst kein Datenpunkt der Regel |

`ruleSummary` als Name existiert nicht; gemeint ist `rule-summary.ts`.

### Reiter „Wiederkehrende Buchung" (`?tab=regelwerk`, Label in `parts.tsx:398`; `CASE_TAB_LABEL.regelwerk` heißt dagegen „Regelwerk" — zwei Wörter für einen Reiter)

`modules/accounting-cases/ui/tabs/RegelwerkTab.tsx` (≈320 Z.), nur bei `kind='recurring_charge'` verlinkt.

| Element | Komponente | Datenquelle |
|---|---|---|
| Leerfall (keine Regel) | erklärender Absatz + `Card` „Regel anlegen" mit Editor | `existingRule === null`; Editor-Startwert aus `prefill` (letzte zugeordnete Bankzeile) |
| Kopf: Klartext-Satz | `RecurringRuleFacts.summary` | `describeRecurringRule(rule)` |
| Kopf: Buchungsweise-Chip + „aktiv/inaktiv" (Wort, ohne Farbe) | `StatusBadge axis="regel_modus"` + Text | `rule.bookingMode`, `rule.isActive` (L-241: keine Achse, deshalb keine Farbe mehr) |
| Hinweis „Modus prüfen?" | `Callout tone="warning"` | `needsModeReview(rule)` |
| Gruppe **Auslöser** | `FieldList` | Gegenpartei (Name ?? IBAN, IBAN als Mono), Richtung (`RULE_DIRECTION_LABEL`), Betrag (`accrualAmount` ± `effectiveAmountTolerance`), IBAN (nur wenn zusätzlich Name), Muster im Verwendungszweck, Vertragsnummer, Muster im Belegtext, „Belegseite: Die Regel bindet auch den Beleg an den Sachverhalt." (bei `matchesDocuments`), Zuordnungs-Notiz (`LongText`). **Felder ohne Wert werden weggelassen** |
| Gruppe **Wirkung** | `FieldList` + `JournalEntryCard` | Belegnummer der Dauerbuchung (`datevDocumentNumber`), Gegenkonto und Personenkonto als `AccountCell` mit Link `/accounts/<nr>`, Buchungstext, bei `match_only` Satz statt Vorschau; Vorschau aus `buildRulePreview` → von `alsVorschau()` in `JournalLine`s übersetzt; Prozent-Zeilen via `resolvePercentLines` auf den erwarteten Betrag gerechnet |
| Gruppe **Erwartung** | `FieldList` mit Leitsatz | `describeRuleSchedule` als Satz; darunter Rhythmus (`RULE_INTERVAL_LABEL`), Erwarteter Zahltag, Laufzeit (`Validity`); ganze Gruppe fehlt bei `schedule === null` |
| Gruppe **Herkunft** | — | nur mit `all=true` (Profil-Herkunft, Zahlungskonto, Split-Vorlage, Steuer, Belegnummern-Strategie, Idempotenz-Anker). **`RegelwerkTab` setzt `all` nicht** → im Reiter unsichtbar. Im Spiegeltyp fehlen `agentRunId`, `exportBatchId`, `datevDocumentLink*` |
| Tabelle „Automatisierte Buchungen" | `DataTable` | `vm.events.filter(e => e.booking != null)` — **alle** Ereignisse des Sachverhalts mit Buchung, nicht nur die mit `recurring_rule_id`; Spalten Datum · Vorgang · Betrag · „4200 an 1800" · `StatusBadge axis="buchung"`; Leerfall-Text vorhanden |
| „Regel bearbeiten" | `Card > details > summary` (eingeklappt) | `RuleEditorForm` → `RecurringRuleEditor` (Abschnitte Auslöser · Wirkung · Erwartung · Weitere Kriterien · Steuer/Zahlungskonto/Notiz · „Regel aktiv"), Live-Trefferzahl „n von m", Löschen im `onCancel`-Slot |

**Zeigt heute nicht:** `priority`, `profileSource`, `documentNumberStrategy`, `paymentAccountId`, `importReference`, `validFrom` ohne Rhythmus-Satz (kommt nur innerhalb „Erwartung"), zweite Regel eines Falls (`existingRule: RecurringRule | null`, L-245 offen).

### Reiter „Zuordnung" (`?tab=zuordnung`, Label „Zuordnung", Kommentar in `tabs.ts`: „DATEV-Analogon: Lerndatei. Nur Dauersachverhalt")

`modules/accounting-cases/ui/tabs/ZuordnungTab.tsx` (194 Z., **unverändert seit dem Profil**, handgeschriebene `table.tbl`).

| Element | Datenquelle |
|---|---|
| Leerfall | `EmptyState` „Noch keine Zuordnungs-Regel" → verweist auf Reiter „Wiederkehrende Buchung" |
| Einleitung | statischer Text („Hier steht, woran Ludwig erkennt …") |
| Karte „Matching-Notiz" | `MatchingNoteForm(initialNote = rule.matchingNote)` → `saveRuleMatchingNote`; Hinweistext „Kein Match-Kriterium" |
| Karte „Automatisches Matching — wann greift die Zuordnung?" — Tabelle Kriterium / Bedingung | Richtung („Nur Zahlungsausgang (Geld raus)" / „… (Geld rein)" / „egal" — **lokale Wörter, nicht `RULE_DIRECTION_LABEL`**), Gegenpartei-Name („enthält „…" (Groß/Klein egal)"), IBAN („= …"), Betrag („= 1.800,00 € (exakt)" bzw. „(± x)" — **nur absolute Toleranz**, Prozent fehlt; ohne Betrag: „egal — Match läuft über die Gegenpartei"), Verwendungszweck („passt auf /…/i"); Fußnote „Alle gesetzten Bedingungen müssen zutreffen (UND-Verknüpfung)" + Verweis zum Bearbeiten in den anderen Reiter |
| Karte „Zugeordnete Zahlungen" | `vm.events.filter(e => e.source === "bank")` — alle Bank-Ereignisse des Falls, **unabhängig davon, ob die Regel sie zugeordnet hat** (kein Filter auf `recurring_rule_id`); Spalten Datum · Vorgang · Betrag |

**Nicht gezeigt:** Belegseite (Vertragsnummer, Belegtext-Regex, `matchesDocuments`), Prozent-Toleranz, Priorität, welche Zeile per Regel und welche per Hand/Agent zugeordnet wurde. Die Kriterien stehen damit dreifach: `ZuordnungTab` (Tabelle), `RecurringRuleFacts` (Auslöser-Gruppe), `RecurringRuleEditor` (Felder).

### Weitere Stellen (Delta)

- **Neu:** Seite `/clients/<slug>/configuration/recurring-rules` (`4828f6c0`, J-54): `RecurringRuleOverview` über `listRulesOverviewForClient` — Gegenpartei, Modus, aktiv, Betrag (`previewAmount`), Rhythmus, Richtung, Sachverhalt (`CaseCell`), `caseRuleCount`, Gegen-/Personenkonto, Belegnummern-Strategie; plus Zähler „Dauersachverhalte ohne Regel" mit Link `cases?recurring=dauer&regel=ohne`. Kein Link aus der Navigation gefunden (`grep configuration/recurring-rules` außerhalb der Route: 0 Treffer) — die Seite ist nur per URL erreichbar.
- `Schritt5.tsx` (Erwartete Zahlungen) und `Schritt3Wiederkehrend` (Stapelabnahme) nicht neu geprüft; Profil-Befund L-243a (roher Rhythmus in Schritt 5) nicht nachgesehen.

---

## (d) Zuordnung Zahlung → Fall

### Matcher (`modules/recurring-rules/domain/rule.ts` · `application/rescan-service.ts`)

**Kriterien und Reihenfolge in `matchTransaction(txn, rule)`:**

1. **Richtung** — Vorfilter, kein Kriterium: `expectedDirection` gesetzt und `directionOf(txn.amount)` weicht ab → kein Treffer.
2. **Mindestens ein Kriterium** (`hasMatchCriterion`) — sonst trifft die Regel nichts (kein Catch-all).
3. Alle **gesetzten** Kriterien aus `MATCH_CRITERIA` müssen zutreffen (UND), in dieser Listenreihenfolge:
   - `iban` — `normalizeIban(txn) === normalizeIban(rule)`
   - `name` — `txn.counterpartyName` **enthält** `rule.matchCounterpartyName` (case-insensitive, getrimmt)
   - `amount` — `| |txn| − |rule| | ≤ effectiveAmountTolerance(rule) + 1e-9` (max aus absolut und Prozent-vom-Betrag)
   - `purpose` — `new RegExp(regex, "i").test(txn.purpose)`; ungültiger Regex trifft nicht

Kein Scoring, keine Gewichtung, kein Datumsfenster (Rhythmus/Zahltag/Laufzeit sind ausdrücklich **kein** Kriterium; `is_active=false` fällt schon in der Query raus).

**Ablauf `rescanForClient(clientId)`:**
- Regeln: `listActiveRulesForClient` → `where is_active = true order by priority asc, created_at asc`. **Erste passende Regel gewinnt** je Transaktion (`rules.find`).
- Kandidaten: `loadMatchCandidates` → alle Bankzeilen des Mandanten (`order by posting_date asc`) mit ihrem ältesten Ereignis (`currentCaseId`, `currentEventId`) und `hasProposal`.
- Schutz: Zeile hängt an einem **anderen** Fall → nicht anfassen („kein Klau").
- Ohne Fall → `createEventForTransaction` mit `recurring_rule_id`; bei `book_on_payment` zusätzlich `accrual_period` (Unique `(rule, period)` — zweite Zahlung derselben Periode wird nicht gebucht, sondern als Notiz gemeldet). Bei `accrue_then_settle` bleibt `accrual_period` an der Sollstellung.
- Wirkung nach `rescanActionFor(mode)`: `template` (Vorschlag aus Vorlage) · `settle` (Personenkonto ⇄ Bank, Belegfeld 1 aus `resolvePeriodDocumentNumber`) · `none` (`match_only`). Vorschlag nur, wenn noch keiner existiert und eine Vorlage/ein Personenkonto da ist. `proposal_rationale = { source: "recurring_rule", rule_id, period, judge, needs_review }`.
- **Auslöser des Rescans:** Bank-Import (`import-pipeline.ts:219`, mit einem Retry), `saveRule` (UI), manuelle Zuordnung einer Bankzeile (`assignment-actions.ts:246`), Agent-Tools `create_recurring_case`/`update_recurring_rule`/… (`agent-booking-core.ts`). Kein Cron.
- Belegseite analog: `matchSourceDoc` (Voraussetzung `matchesDocuments`; Richtung aus `doc_direction`, Vertragsnummer exakt, Personenkonto exakt wenn beide vorhanden, Name enthält, Betrag ± Toleranz, Belegtext-Regex) via `rescanDocumentsForClient`, aufgerufen beim Agent-Run-Übergang (`agent-run-transition-core.ts:134`).
- Der Bank-Match-Modul (`modules/bank-match`) kennt die Regeln nicht — die Regel-Zuordnung läuft ausschließlich über `recurring-rules`.

### Wie oft das im Bestand passiert (Staging)

| Kennzahl | Wert |
|---|---|
| Ereignisse gesamt / mit `recurring_rule_id` | 2 552 / **27** (1,1 %) |
| Arten der Regel-Ereignisse | `accrual` 26 · `payment_in` **1** |
| Regeln mit Ereignis / ohne | 26 / 4 |
| Ereignisse je Regel | p50 **1** · p90 1 · max 2 |
| Regel-Ereignisse mit Bankzeile / Beleg / Periode / Agent-Run | 1 / 0 / 26 / 26 |
| Bankzeilen gesamt / mit Ereignis / **per Regel zugeordnet** | 1 426 / 592 / **1** (0,07 % aller, 0,17 % der zugeordneten) |
| Buchungen `origin='recurring_rule'` | **29** von 1 720 (`ai_proposed` 840 · `client_import` 833 · `manual` 18); Status `accepted` 27 · `proposed` 2 |
| davon `proposal_rationale->>'source'` | `recurring_accrual` 26 (Sollstellungen) · `recurring_rule` 3 (Zahlungs-Treffer, an `payment_in`-Ereignissen) |
| Rationale-Schlüssel | `source`, `rule_id`, `period`, `judge`, `needs_review` |

Lesart: Die Regeln arbeiten im Bestand fast nur als **Sollstellungs-Automat** (26 Accruals aus dem Monats-Vorbereitungslauf). Die **Zahlungszuordnung** ist mit 3 Vorschlägen an 1 Regel-Ereignis (plus 2 Vorschlägen an Ereignissen, die vorher schon per Hand/Agent am Fall hingen) praktisch unbelegt — die 29 Import-Regeln matchen auf Name + exakten Betrag, und die Bankzeilen der drei Mandanten scheinen das nicht herzugeben. Eine Aussage über die Treffgüte des Matchers ist am Bestand nicht möglich.

### Lernnotiz

- `matching_note`: Spalte vorhanden, Zweck „Freitext für Kolleg:innen und den Agenten … kein Match-Kriterium"; **0 von 30 befüllt**. Zwei Editoren (Editor-Feld „Zuordnungs-Notiz" + `MatchingNoteForm` im Reiter Zuordnung), eine Kernfunktion `updateRuleMatchingNote`. Kein Leser außer der Anzeige (Facts, ZuordnungTab) und dem Agenten (`list_recurring_rules`).
- Kein weiterer Lernspeicher: keine Treffer-Historie an der Regel, keine Ablehnungsliste, keine Zählung „n-mal gegriffen". Die einzige Spur eines aufgehobenen Regel-Treffers ist eine Klärung/Audit-Meldung „Agent hat eine deterministische Regel-Zuordnung (Regel …) aufgehoben" (`agent-ingest-core.ts:691`). Audit an der Regel: `case.rule_created_by_agent` 6 · `case.rule_updated_by_agent` 3, beide am Fall (`resource_kind='accounting_case'`); kein Audit für UI-Speichern.

---

## Befunde, die das Profil noch nicht kennt (Vorschlag für das Register)

1. `profile_source='human'` wird von keinem Schreiber gesetzt — eine von Hand angelegte Regel bekommt `derived` (`resolveProfile`: `input.profileSource ?? "derived"`); `onboarding` stammt nur aus dem Backfill. Die Wortliste „von Hand angelegt" hat damit heute keinen Wert, der sie erreicht.
2. `RegelwerkTab` ruft `RecurringRuleFacts` ohne `all` — Herkunft, Zahlungskonto, Belegnummern-Strategie bleiben im Reiter unsichtbar, obwohl die Form sie kann.
3. Reiter-Label doppelt: `CASE_TAB_LABEL.regelwerk = "Regelwerk"`, `parts.tsx` verlinkt ihn als „Wiederkehrende Buchung", `ZuordnungTab` verweist auf „Wiederkehrende Buchung", die neue Konfigurationsseite heißt „Regelwerk des Mandanten".
4. „Zugeordnete Zahlungen" im `ZuordnungTab` und „Automatisierte Buchungen" im `RegelwerkTab` filtern **nicht** auf `recurring_rule_id` — beide zeigen alle Bank-Ereignisse bzw. alle Buchungen des Falls, nicht die Wirkung der Regel.
5. `ZuordnungTab` zeigt Richtung mit lokalen Wörtern statt `RULE_DIRECTION_LABEL` und nur die absolute Toleranz; der Klartext-Satz (`describeRecurringRule`) ebenso — die Prozent-Toleranz fehlt beiden.
6. `matching_note` hat zwei Editoren (Editor-Feld + `MatchingNoteForm`).
7. Konfigurationsseite `configuration/recurring-rules` ohne Navigationseintrag.
8. `priority`: Spalten-Default `0`, Code-Default `100` — bei einem Insert an der App vorbei entstünde eine Regel, die still vor allen anderen greift.

---

## Anhang: benutzte Queries (alle `SELECT`, Schema `ludwig`, Pooler 6543)

```sql
set search_path = ludwig;

-- Bestand
select now(), count(*), count(distinct case_id), count(distinct client_id),
       min(created_at)::date, max(created_at)::date
from client_accounting_case_rule;

-- Verteilungen (je Spalte analog)
select booking_mode, count(*) from client_accounting_case_rule group by 1;
select document_number_strategy, count(*) from client_accounting_case_rule group by 1;
select coalesce(expected_interval,'NULL'), count(*) from client_accounting_case_rule group by 1;
select coalesce(expected_day_of_month::text,'NULL'), count(*) from client_accounting_case_rule group by 1;
select coalesce(expected_direction,'NULL'), count(*) from client_accounting_case_rule group by 1;
select is_active, count(*) from client_accounting_case_rule group by 1;
select priority, count(*) from client_accounting_case_rule group by 1;
select coalesce(profile_source,'NULL'), count(*) from client_accounting_case_rule group by 1;
select matches_documents, count(*) from client_accounting_case_rule group by 1;
select coalesce(datev_document_link_system,'NULL'), count(*) from client_accounting_case_rule group by 1;
select coalesce(template_tax_key,'NULL'), count(*) from client_accounting_case_rule group by 1;
select match_amount_tolerance, count(*) from client_accounting_case_rule group by 1;
select coalesce(match_amount_tolerance_percent::text,'NULL'), count(*) from client_accounting_case_rule group by 1;

-- Split-/Prozent-Vorlagen
select case when template_lines is null then 'NULL'
            when jsonb_typeof(template_lines)='array' then 'array:'||jsonb_array_length(template_lines)
            else jsonb_typeof(template_lines) end, count(*)
from client_accounting_case_rule group by 1;
select count(*) from client_accounting_case_rule
where template_lines is not null
  and exists (select 1 from jsonb_array_elements(template_lines) e where e ? 'percent');

-- Füllgrade + Freitext-Längen
select count(*) total,
  count(match_counterparty_name), percentile_cont(0.5) within group (order by length(match_counterparty_name)), max(length(match_counterparty_name)),
  count(match_counterparty_iban), count(match_purpose_regex), count(match_amount),
  count(match_contract_number), count(match_document_text_regex),
  count(matching_note), percentile_cont(0.5) within group (order by length(matching_note)), max(length(matching_note)),
  count(payment_account_id), count(valid_from), count(valid_until),
  count(template_amount), count(template_description),
  percentile_cont(0.5) within group (order by length(template_description)), max(length(template_description)),
  count(template_counter_account_number), count(personal_account_number), count(template_tax_rate_percent),
  count(datev_document_number), count(datev_document_link_guid),
  count(import_reference), count(*) filter (where import_reference like 'datev-wk:%'),
  count(agent_run_id), count(export_batch_id),
  count(*) filter (where match_amount = template_amount)
from client_accounting_case_rule;

-- Kriterien je Regel
select
  count(*) filter (where (match_counterparty_name is not null)::int + (match_counterparty_iban is not null)::int
                       + (match_amount is not null)::int + (match_purpose_regex is not null)::int = 0) crit0,
  count(*) filter (where ... = 1) crit1, count(*) filter (where ... = 2) crit2, count(*) filter (where ... >= 3) crit3plus
from client_accounting_case_rule;

select valid_from, count(*) from client_accounting_case_rule group by 1 order by 1;
select count(*) from (select case_id from client_accounting_case_rule group by case_id having count(*) > 1) t;

-- Dauersachverhalte
select count(*), count(*) filter (where exists (select 1 from client_accounting_case_rule r where r.case_id = c.id))
from client_accounting_case c where kind = 'recurring_charge';

-- Ereignisse
select count(*), count(recurring_rule_id), count(distinct recurring_rule_id) from client_accounting_event;
select kind, count(*) from client_accounting_event where recurring_rule_id is not null group by 1;
select percentile_cont(0.5) within group (order by n), percentile_cont(0.9) within group (order by n), max(n), count(*)
from (select recurring_rule_id, count(*) n from client_accounting_event where recurring_rule_id is not null group by 1) t;
select count(*) from client_accounting_case_rule r
where not exists (select 1 from client_accounting_event e where e.recurring_rule_id = r.id);
select count(*) filter (where bank_transaction_id is not null), count(*) filter (where source_doc_id is not null),
       count(*) filter (where accrual_period is not null), count(*) filter (where agent_run_id is not null)
from client_accounting_event where recurring_rule_id is not null;

-- Bankzeilen
select count(*),
  count(*) filter (where exists (select 1 from client_accounting_event e
                                 where e.bank_transaction_id = t.id and e.recurring_rule_id is not null))
from client_bank_transactions t;
select count(*) from client_bank_transactions t
where exists (select 1 from client_accounting_event e where e.bank_transaction_id = t.id);

-- Buchungen
select origin, proposal_rationale->>'source', count(*) from client_journal_entry group by 1,2 order by 3 desc;
select string_agg(distinct k, ',') from client_journal_entry j, jsonb_object_keys(j.proposal_rationale) k
where j.origin = 'recurring_rule';
select status, count(*) from client_journal_entry where origin = 'recurring_rule' group by 1;
select e.kind, count(*) from client_journal_entry je
join client_accounting_event e on e.id = je.accounting_event_id
where je.origin = 'recurring_rule' group by 1;

-- Audit
select count(*), resource_kind, action from platform_audit_events
where action ilike '%rule%' group by 2,3 order by 1 desc;
```

Schema-Einsicht: `\d ludwig.client_accounting_case_rule`, `\d ludwig.client_accounting_event`, `information_schema.columns` für `client_journal_entry`.
