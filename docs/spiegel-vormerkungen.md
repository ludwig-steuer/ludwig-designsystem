# Spiegel-Vormerkungen — was beim nächsten Lauf fällig ist

Der Spiegel (`src/ludwig/`, `docs/ludwig/`) ist **eingefroren**; die Marke
steht in `src/ludwig/GESPIEGELT_AUS.json`. Was drüben entsteht und hier
gebraucht wird, kommt bis zum nächsten Lauf hierher.

> **Warum diese Datei und nicht `docs/ludwig/README.md`:** `sync-ludwig.sh`
> macht `rm -rf docs/ludwig` und schreibt die README danach neu. Die Liste
> stand dort und war beim Lauf vom 2026-09-08 weg — sie war die ganze Zeit
> flüchtig, was nur niemandem auffiel, weil der Spiegel eingefroren war. Eine
> Notiz gehört nicht in eine generierte Datei.

## Offen

**F251 (App `9048bce1`, gemeldet von `ludwig-worker3` am 2026-09-21).**
Voraussetzungen für den Lauf: der Commit liegt auf origin/staging (beim
Eintrag noch nicht) **und** eine Owner-Ausnahme vom Freeze. Bringt:

- `TimelineEventVM.passThroughBankTransaction` / `CaseEvent.passThroughBankTransaction`
  — `{ postingDate, amount, currency, counterpartyName, purpose } | null`, die
  Bankzeile am Verrechnungs-Zwilling (B-04), Form = `BankTransactionCellData`.
- `TimelineEventVM.recurringRuleLabel` / `CaseEvent.recurringRuleLabel` —
  `string | null`, Vorlagentext, sonst Gegenpartei der Regel.
- Erwartung: `resolvedByEvent` — `{ kind, date, title } | null` (B-06).
- `accounting-cases/domain/expectation-labels.ts`:
  `EXPECTATION_RESOLUTION_LABEL` + `expectationResolutionLabel()` — matched
  „Eingegangen", manual „Von Hand erledigt", obsolete „Hinfällig" (L-332).
- `datev-truth/domain/mirror-entry-vm.ts`: `CaseMirrorEntry`, `CaseMirrorLine`,
  `toMirrorEntryVM` — vorher Infrastruktur (L-339, Teil von L-302).

**Im Set danach:** `CaseTimelineEvent` um Zwilling und Regelwort erweitern
(0040), `ExpectationRow` zeigt „Eingegangen · durch <Ereignis>" (0025),
`MirrorEntryVM` gegen `CaseMirrorEntry` prüfen und die lokale Sicht ablösen,
wo sie deckungsgleich ist (0191, L-302/L-339). Stories 15, 17, 27 in 0190
nachziehen. `JournalEntryFacts.entryHref` verdrahtet die App erst mit der
Ablösung von `EventDetail` — dort ist nichts zu tun.

## Erledigt mit dem Lauf vom 2026-09-21 (App `c478af21`)

Owner-Ausnahme (Simon, 2026-09-21, überbracht von `ludwig-worker3`),
gelaufen, sobald `c478af21` auf origin/staging lag; danach wieder
eingefroren. Angekommen sind die sieben Felder, die der Katalog 0190 als
Lücken B-01 … B-07 gemeldet hatte: an `TimelineEventVM`/`CaseEvent`
`allocatedAmount`, `note`, `accrualPeriod`, `passThroughOfBankTransactionId` ·
an der Erwartung `resolution` und `resolvedByEventId` · an `JournalEntryVM`
und `CaseEventBooking` `reversesEntryId` · an `CaseHeaderVM` `openAmount`.
Nebenbei `readiness.ts` `hasCase` (F248). Typcheck und `check:mirror` grün,
nichts weggefallen, was das Set benutzt.

Im Set nachgezogen: B-01 (der offene Rest unter dem Betrag im Kopf) und B-07
(der Storno-Satz nennt den aufgehobenen, als Weg). B-02/B-03/B-05 waren schon
mit `0f6fe58` gezogen. **Bewusst nicht gezogen**, bis F251 Etiketten liefert:
`passThroughOfBankTransactionId` (B-04), `recurringRuleId`, `resolution` und
`resolvedByEventId` (B-06) — rohe Ids und ein Wert ohne Wortliste.

## Erledigt mit dem zweiten Lauf vom 2026-09-18 (App `1276540f`)

Owner-Ausnahme (Simon, 2026-09-18, auf den Auftrag von `a1`), gelaufen,
sobald F235 auf origin/staging lag; danach wieder eingefroren. Angekommen:
**F235** — die Achse `statement_expectation` mit `required` / `expected` /
`none` und `core/accounting/statement-expectation.ts`
(`STATEMENT_EXPECTATION_LEVELS`, `StatementExpectationLevel`,
`isStatementExpectationLevel`), neu in der Pfadliste · F246 (Schritt 8):
`batch-review/domain/checkpoint-texts.ts`.

`batch-review/domain/statement-coverage.ts` ist wieder draußen, diesmal zu
Recht: seit F235 holt sie `accounting-cases/server`. Das Set benutzt sie
nicht. Im Set nachgezogen nach dem Nachtrag zu 0180 und 0183:
`statementExpectationOf` gibt die Stufe zurück, `PaymentAccountRowData` trägt
`statementExpectation` und `statementExpectationManual`, die Zelle zeigt „von
Hand“ als Zusatz, der Editor hat Automatisch und die drei Stufen. Typcheck
und Wächter grün.

## Erledigt mit dem Lauf vom 2026-09-18 (App `08f56032`)

Owner-Ausnahme (Simon, 2026-09-18, auf den Nachzug von `a2`), danach wieder
eingefroren. Angekommen sind: die beiden Fragetypen in
`CLARIFICATION_QUESTION_TYPE_LABEL` — `vat_without_document_precedent` (F222)
und `payment_without_document` (F237) · die Registry mit der neuen Achse
`document_filing` (F216, ohne Icon wie jede Nebenachse), `REVIEW_TAB` und
`STAFF_ROLE`; `TRIAGE` ist weg (heute `needs_review`/`likely_correct`/
`client_batch`), `platform_admin` heißt `platform_staff` · 14 neue
Domänen-Dateien, darunter `payment-without-document.ts`, `review-score.ts`,
`auth/domain/permissions.ts` und sieben aus `batch-review/domain` ·
`acceptance-triage.ts` ist drüben gelöscht.

Der Filter hat vier Dateien ausgesondert, alle holen Server- oder
Application-Code: `batch-review/domain/bank-reconciliation.ts`,
`collection-family.ts`, `document-request-row.ts` und
`datev-truth/domain/sync-history.ts`. Typcheck, die sieben Wächter und der
Storybook-Build unmittelbar nach dem Lauf grün; im Set hing kein alter
Registry-Wert.

## Erledigt mit dem Lauf vom 2026-09-11 (App `c48d8042`)

Owner-Ausnahme für das F210-Fenster (Simon, über `ludwig-manager`,
2026-09-11), danach wieder eingefroren; der Spiegel steht auf `c48d8042`.
DS-Commit `6e92c0d`. Angekommen sind: die **englischen Achsen-Schlüssel** der
Registry (T210.1) · `CASE_LIST_TABS` englisch (`active`, `payments`,
`waiting_for_documents`, `needs_clarification`, `to_close`, `all`) · englische
Reiter- und Filter-Schlüssel (`CASE_TABS`, die Beleg-Reiter, `BatchListFilter`,
`LogView`, `CaseExportStatus`) · `batch-review/domain` statt `stapelabnahme` ·
`RULE_SETTING_HELP` (L-293) · `recurringRuleId` an `CaseEvent` und
`TimelineEventVM` · `core/accounting/payment-account-kind.ts`, **neu in der
Pfadliste** von `sync-ludwig.sh` (L-312).

**Ein Behelf ist dabei gefallen:** die festen Erklärsätze in
`RecurringRuleFacts` — die Sätze kommen jetzt aus `RULE_SETTING_HELP`.

## Erledigt mit dem Lauf vom 2026-09-10 (App `d76b7030`)

Owner-Freigabe (Simon, 2026-09-10), danach wieder eingefroren. **Der erste
Lauf aus einem Commit statt aus dem Arbeitsbaum** — `sync-ludwig.sh` nimmt
jetzt `git archive` und kennt `LUDWIG_REF`; der Befund von `ludwig-manager`
ist damit erledigt, und die Stand-Notiz gehoert dem Inhalt, nicht dem Stand,
auf dem die App gerade steht. Der Arbeitsbaum drueben war beim Lauf dirty, der
Spiegel ist es nicht.

Angekommen sind:

| Datei | Was sie bringt |
|---|---|
| `source-docs/domain/doc-defects.ts` | `docDefects()` — die Maengel eines Belegs aus fuenf Quellen als **eine** Zone (L-269) |
| `source-docs/domain/doc-signal.ts` | `docSignal()` — welches Banner gewinnt (L-267) |
| `source-docs/domain/doc-processing.ts` | Fortschritt am **Beleg**, nicht an der Rechnungszeile (L-82) |
| `source-document-vm.ts` | `paymentAccount` am VM (L-266, halb) |
| `datev-export/domain/document-group.ts` | F184: die Belegruppen heissen englisch |
| `datev-export/domain/booking-cycle.ts` | `BookingCycleKind` zurueck in `domain/` — sechs Dateien der Stapelabnahme kommen mit (L-274) |
| `source-docs/domain/tabs.ts` | `pipeline` bildet auf `verlauf` ab (L-270) |
| `payment-account-options.ts` | ohne den Mandantennamen (L-275) |

Typcheck unmittelbar nach dem Lauf gruen. Zwei Dateien hat der Filter
ausgesondert, beide zu Recht: `datev-truth/domain/sync-history.ts` und
`stapelabnahme/domain/document-request-row.ts` holen Server-Code.

## Erledigt mit dem zweiten Lauf vom 2026-09-09 (App `9bbe16c4`)

Owner-Freigabe (Simon), danach wieder eingefroren. Angekommen ist **F177**: die
Achse `zyklus_stapel` trennt jetzt „eröffnet" von „freigegeben" — `prepared`
heißt nicht mehr zugleich „die Belege trudeln noch ein" und „der Agent darf
ran", und die Kante `prepared → agent` trägt `trigger: "released_to_agent"`
mit `by: "user"` statt `agent_run_started`/`agent`.

**Der Lauf hat aber auch etwas gekostet, und das ist der Bericht wert.** Er
brach zuerst den Typcheck des ganzen Spiegels: `BookingCycleKind` ist drüben
von `domain/` in eine `server-only`-Datei mit DB-Zugriff gewandert, und drei
`stapelabnahme`-Dateien holen ihn von dort. Der Filter hat die Server-Datei
richtig aussortiert — und die drei Abhängigen stehen lassen, weil er nur die
Datei selbst prüfte, nicht ihre Nachbarn.

`scripts/mirror-filter.mjs` hat deshalb eine **zweite Runde** bekommen: wer
einen Namen holt, den der Spiegel nach der ersten Runde nicht mehr führt, kann
selbst nicht bleiben — und wer *ihn* dann holt, auch nicht. Damit fallen sechs
Dateien (`checklist`, `gating`, `steps`, `deckungsluecke`, `rail`,
`bereitschaft`), von denen das Set heute keine benutzt. Befund **L-274**.

## Erledigt mit dem Lauf vom 2026-09-09 (App `ab7863d8`)

Owner-Freigabe (Simon), einmalig, danach wieder eingefroren. **Anlass war
L-222:** in der App am 2026-09-08 behoben (`a38169f4`), im Spiegel nicht — und
`service` ist unter den gefüllten Werten von `typicalNature` der häufigste. Die
Partner-Welle hätte den behobenen Fehler nachgebaut, und `"service"` wäre nicht
einmal durch den Typcheck gekommen.

Angekommen sind alle neun Vormerkungen:

| Was | Wer wartete |
|---|---|
| `TYPICAL_NATURE` mit allen sechs Werten (L-222) | die Partner-Welle |
| `rule-draft.ts` — `RuleDraft`, `RuleSaveFields`, `toDraft()`, `toSaveFields()` | 0135, das seinen Entwurfstyp bis dahin selbst führte |
| Die vier Wortlisten der Wiederkehr-Regel (L-242, L-256) | 0132–0135, die sie als `RecurringRuleLabels` von außen bekamen |
| Achse `regel_modus` (L-243) | 0132 und 0134 |
| `PreviewPosting.accounts` getrennt (L-255) | 0134 |
| `matchesDocuments()` (L-249) | 0134 |
| `MATCH_CRITERIA` einmal statt zweimal (L-253), Prioritäts-Konstante (L-254) | die Wiederkehr-Familie |
| `CaseFilter.withoutRecurringRule` | die Zahl „75 ohne Regel", die auf eine Liste mit 75 führen soll |
| `CaseHeaderVM.disposition` (L-220), `overview-vm.ts` | der Sachverhalts-Kopf |
| `flow_error` in der Achse `bridge_datev` (L-221) | die DATEV-Seite |

Der Typcheck war unmittelbar nach dem Lauf grün: der Spiegel hat nichts
weggenommen, was das Set benutzt. Was er **überflüssig** macht, fällt in einem
eigenen Zug — siehe unten.

## Was der Lauf vom 2026-09-09 überflüssig macht

Ein Spiegellauf bringt nicht nur Fehlendes, er entwertet auch Behelfe. Diese
hier sind seit dem Lauf doppelt und gehören abgeräumt:

| Behelf | Wo | Ersatz aus dem Spiegel |
|---|---|---|
| `RecurringRuleLabels` + `ruleLabel()` | `entities/recurring-rule/recurring-rule.ts`, Prop an fünf Formen | `RULE_DIRECTION_LABEL`, `RULE_INTERVAL_LABEL`, `RULE_DOCUMENT_NUMBER_STRATEGY_LABEL`, `RULE_PROFILE_SOURCE_LABEL` |
| `RecurringRuleDraft` | ebenda, Entwurfstyp von 0135 | `RuleDraft` aus `rule-draft.ts` |

Beides ist eine **Prop weniger an fünf Formen**, nicht nur eine Datei weniger.

## Erledigt mit dem Lauf vom 2026-09-08 (App `6ba47fb2`)

Owner-Freigabe (Simon), einmalig, danach wieder eingefroren. Angekommen sind:
`SourceDocumentDetail` als Vereinigung über `kind` · `completedVia` als Achse ·
`splitPageRange`, `parentSourceDocId`, `classOverriddenAt` und die drei
`datevRef*` · `CaseFilter.disposition` · `collective-accounts.ts` ·
`account-entry.ts` (`AccountEntryOrigin`, `accountEntryOrigin`, `markOfOrigin`) ·
`bank-transaction-vm.ts` samt `bankMatchStage` · der Achsenwert `not_run`.

**Vier Handkopien sind dabei gefallen:** die lokale `SourceDocumentDetail`-Union
(276 Zeilen, jetzt ein Re-Export), `detail` und `completedVia` in
`SourceDocumentVM`, die vier Provenance-Felder ebenda, und die zwei
handgeschriebenen „Kaskade nicht gelaufen"-Texte, die jetzt `bankMatchStage()`
und die Achse tragen.
