# Befunde für `ludwig/app` — was drüben gebaut werden muss

Diese Datei ist die **Übergabe an den Entwicklungsagenten der App**. Sie
sammelt, was beim Bauen des Design-Systems an `ludwig/app` aufgefallen ist und
dort erledigt werden muss — an einem Ort, statt verstreut über 20
Backlog-Dateien und zwei Entitätsprofile.

**Wie sie entsteht:** Jede Spec und jedes Entitätsprofil hält seine Befunde
weiter bei sich — dort stehen sie im Zusammenhang, und dort findet sie der
Abnehmende. Hier stehen sie **zusätzlich**, in der Form, in der ein fremder
Agent sie abarbeiten kann: was fehlt, wo, was zu tun ist, und was hier darauf
wartet. Steht ein Befund hier, ist er noch nicht erledigt.

**Wie sie gepflegt wird:** Wer eine Spec schreibt oder eine Entität
analysiert, trägt seine App-Befunde am Ende **auch hier** ein — eine Zeile je
Befund, mit Quelle. Wer einen Befund in der App erledigt, streicht ihn hier
und nennt den Commit. Die Regel steht in `docs/backlog/README.md`.

**Was hier nicht hingehört:** Befunde über das Design-System selbst („Befund
beim Bauen" in den Specs) — die bleiben in ihrer Aufgabe. Und die
Ablösung einer App-Komponente durch einen v3-Baustein ist kein Befund,
sondern der Migrationsschritt; er steht in Abschnitt E.

| | |
|---|---|
| Stand | 2026-09-04 |
| Quellen | `docs/backlog/*.md` (Abschnitte „Befunde für `ludwig/app`", Kriterien „offen (App)") · `docs/entitaeten/*.md` |
| Erhoben von / am | Claude, 2026-09-04 — maschinell aus allen Aufgaben und Profilen extrahiert, nicht aus dem Gedächtnis |

---

## A · Fehlende Typen und Ableitungen in `src/ludwig/`

Der Spiegel (`scripts/sync-ludwig.sh`) ist die Vorgabe für jede
Komponenten-Schnittstelle: **eine Komponente, deren Props sich dort nicht
bedienen lassen, ist falsch geschnitten** (`spec-schreiben` §5). Fehlt ein
Typ, definiert das Design-System ihn strukturell deckungsgleich selbst und
meldet ihn hier — es erfindet keine Begriffe.

| # | Was fehlt | Wo es hingehört | Heute stattdessen | Quelle |
|---|---|---|---|---|
| **L-01** | Parser für deutsche Geldeingaben („1.234,56", „1234.56", „1 234,56") | neben `formatMoney` in `shared/money.ts` | `AmountInput` trägt ihn mit `ponytail:`-Kommentar | 0019 |
| **L-02** | `EVENT_KINDS` + `EVENT_KIND_LABEL`, dazu die Registry-Achse `ereignis_art` | `modules/accounting-cases/domain/case.ts` | Arten nur im DB-CHECK und im `switch` von `EventIcon` — der kennt `contract_received`/`recurring`, die der CHECK nicht hat, und `open_item_carryover` nicht | 0023, 0040 |
| **L-03** | `OpenItemLink`-Interface | `src/ludwig/` | in der Komponente | 0026 |
| **L-04** | `DatevSnapshot` + `BaselineLevel`-Union | `src/ludwig/` (Wortwahl der drei Stufen steht im GLOSSARY) | in der Komponente | 0027 |
| **L-05** | `OpenItem`-Interface **und** `openItemAgeBucket({ dueDate, asOf })`, analog `expectationMaturity` | `modules/accounting-cases/domain/` | die Komponente nimmt den Bucket als Prop, rechnet ihn nicht | 0029 |
| **L-06** | Kanonisches Zeilenmodell des Buchungssatzes | Domäne statt `ui/booking/types.ts` (`BookingLineVM`) | `JournalLine` im Design-System, strukturell deckungsgleich | 0044 |
| **L-07** | `JournalEntryVM.currency` als `Currency` statt `string` | `modules/entries/domain/` | die Aufrufstelle braucht einen Cast | 0044 |
| **L-08** | `TimelineEventVM` / `CaseEvent` spiegeln | heute `domain/overview-vm.ts` bzw. `infrastructure/` | nicht gespiegelt; die drei Sichten aus 0040 sind der Vorschlag | 0040 |
| **L-09** | `ClarificationVM` spiegelbar machen — die Datei importiert `@/ui/booking`, deshalb überspringt sie `sync-ludwig.sh`. **Ein reines Domänen-VM hat keine UI-Abhängigkeit** | `modules/accounting-cases/domain/overview-vm.ts` | nicht gespiegelt | 0059 |
| **L-10** | `CLARIFICATION_QUESTION_TYPE_LABEL` (9 Werte im Bestand) | neben `CLARIFICATION_TYPES` in `domain/case.ts` | `humanizeType()` in `ClarificationsBanner` — Unterstriche zu Leerzeichen | clarification B1 |
| **L-11** | `MODULE_LABEL` in die Domäne heben; es kennt `agent`, `web` und `datev-mirror` nicht — **78 % des Bestands** | `domain/` | lebt in `ClarificationsBanner.tsx` | clarification B2 |
| **L-12** | `ClarificationAnswerKind` um `document_upload` erweitern — TS kennt vier Werte, der DB-CHECK fünf, acht Zeilen tragen den fünften | `modules/invoices/domain/invoice.ts` | `ClarificationEditor` weitet die Union lokal und begründet es | clarification B9 |
| **L-13** | `AccountFactsVM` — die Fakten eines Kontos in einem Wirtschaftsjahr | `modules/accounts/domain/` | die App setzt sie zweimal zusammen: `AccountLedgerDrawer.tsx:88–97` und `accounts/[accountNumber]/page.tsx:302–318` | 0066 |
| **L-14** | `AccountEntry` — **eine** Bewegung auf einem Konto, mit der Herkunft als Wert | `modules/accounts/domain/` | zwei getrennte Typen: `AccountLedgerRow` (snake_case, Beträge `string`) und `TruthAccountEntryRow` (camelCase, `number`); keiner trägt die Herkunft, die Vereinigung ist heute die Tab-Umschaltung | 0067 |
| **L-15** | `PageRequest` um `sort`/`dir`, plus Whitelist erlaubter Sortierschlüssel je Spalte in jeder `list*ForClient` | `shared/pagination.ts` | `parsePageRequest` kennt nur `page` und `size` — **keine der 13 Listenseiten sortiert** | 0057 |
| **L-16** | Server Actions, die `ids: string[]` nehmen (Freigabe in `cases` und Stapelabnahme) | die betroffenen Module | Freigabe läuft je Zeile; `DataTable` bringt die Auswahl mit, die Aktion fehlt (V11) | 0057 |
| **L-36** | `documentCounterparty({ docDirection, vendorName, customerName, classCounterpartyName })` — **ein** Weg zum Namen des Gegenparts | `modules/source-docs/domain/` | drei Wege: `PartnerCell` rechnet aus Richtung + vendor/customer, `BelegeTab` nimmt `class_counterparty_name`, der v3-Drawer beschriftet ihn „Lieferant" | `entitaeten/source-document.md` B6 |
| **L-37** | Registry-Achse `beleg_charakter` für `document_kind` (`original` · `credit_note` · `self_billing` · `refund` · `unknown`) | `status-registry.ts` bzw. die Achsen-Quelle der App | `DOCUMENT_KIND_LABEL` als Label-Map; die Belegliste zeigt den Wert als Badge ohne Achse. Vier Einordnungs-Achsen, drei in der Registry | `entitaeten/source-document.md` B5 |
| **L-47** | `SourceDocCompletionVia` — die sechs Werte von `client_source_docs.completed_via` (`booking`, `case_closed`, `import`, `superseded`, `manual`, `no_booking_required`) haben keinen TS-Typ | `modules/source-docs/domain/` | 0074 definiert die Union lokal, strukturell deckungsgleich mit dem DB-CHECK | 0074 |
| ~~**L-48**~~ | **Die Status-Registry spiegelbar machen.** `status-registry.ts` importiert `BadgeKind` aus `@/ui/components`; stattdessen ein eigener `export type StatusKind = "info" \| "success" \| "warning" \| "danger" \| "neutral"`, den `Badge` der App aliast. Danach hat die Datei keinen Import mehr und `sync-ludwig.sh` kann sie spiegeln. **Owner-Entscheid 2026-09-04: die Registry bleibt in der App, das Set löscht seine Kopie** | `ui/status/status-registry.ts` (Pfad bleibt) oder `core/status/` — die App entscheidet | zwei Registries, bereits gegabelt (42 Diff-Zeilen). — **erledigt 2026-09-05 (App-Seite): Commit `cf681257`.** **Der Pfad bleibt** `apps/web/src/ui/status/status-registry.ts` — Entscheid der App: 81 Konsumenten liegen im selben Ordner, und spiegelbar macht die Import-Freiheit, nicht der Ordner | 0080 |
| ~~**L-49**~~ | Achse `actor_kind` (`platform_audit_events.actor_kind`: `user` · `system` · `api` · `cli` · `agent`, alle `neutral`) übernehmen — Block `ACTOR_KIND` aus `packages/designsystem/src/ui/v3/patterns/status-registry.ts`, samt Deckungsgleichheits-Test, `AXIS_LABEL`, `AXIS_SOURCE`, `ENTITY_ICON` | `status-registry.ts`, `entity-icons.ts`, `__tests__/status-registry.test.ts` | nur im Set. — **erledigt 2026-09-05 (App-Seite): Commit `cf681257`.** Achse samt Deckungsgleichheits-Test und Icons übernommen | 0053, 0080 |
| ~~**L-50**~~ | **Eine** Ableitung `confidenceLevel(value)` Rohwert → Stufe, spiegelbar, mit den Schwellen des Python-SSOT `confidence_to_band` (GLOSSARY „Confidence band"). Dazu der Entscheid, ob die Achse `konfidenz` (vier Farben) auf die fünf Band-Wörter geht | `shared/` | es waren **vier** Schwellensätze, nicht drei — `ConfidenceBand` 85/70/55/40 war der vierte. — **erledigt 2026-09-05 (App-Seite): Commit `cf681257`.** Jetzt **eine** Datei `shared/confidence.ts` mit `confidenceBand` (fünf Wörter), `confidenceLevel` (vier Stufen) und `confidencePercent`. **Offen bleibt die Owner-Frage**, ob die Achse `konfidenz` bei vier Stufen bleibt oder auf die fünf Band-Wörter geht — Stand: vier, und der v3-`Confidence` folgt der Achse | 0078 |
| ~~**L-51**~~ | Sieben handgeschriebene Status-Legenden sind sieben fehlende Achsen (Z2) — die achte, `configuration/integrationen/page`, ist mit dem Seiten-Rückbau vom 2026-09-05 weg: `admin/tenants/[tenantId]/page`, `admin/tenants/[tenantId]/clients/[clientId]/page`, `PaymentChannelActivitySection`, `VorsteuerTab`, `BridgeHealthStatus`, `AgentTokenManager`, `DatevExportSection`. Dazu 20 `hint`-Texte an `StatusHeader`-Aufrufen gegen `AXIS_LABEL`/`AXIS_SOURCE` prüfen — der v3-`StatusHeader` hat kein `hint` | `status-registry.ts` | `legend={[…]}` von Hand  — **erledigt 2026-09-05 (App-Seite): Commit `cf681257`.** Es wurden **sieben** neue Achsen (`VorsteuerTab` trug zwei), und `DatevExportSection` war gar keine neue Achse, sondern eine veraltete Handkopie von `zyklus_stapel` | 0077 |
| ~~**L-44**~~ | ~~`SourceDocType` fehlt der Wert `declaration`~~ — **erledigt 2026-09-04 (App-Seite): Absicht.** Die Union ist der Typ des Mapping-**Ergebnisses**, und `declaration` hat keinen Schreiber; lesend sind sieben Werte richtig, `SOURCE_DOC_TYPE_LABELS` führt alle | nichts zu tun. 0074 weitet die Union lokal — bestätigt | 0074 |
| **L-17** | `BATCH_LOG_VIEWS` als allgemeines `LOG_VIEWS` — es trägt die Wörter aus Z6, hängt aber am Stapel | `audit-log/domain/`, der Stapel importiert | stapelgebunden | 0054 |
| **L-52** | `caseDisplayTitle({ title, kind, counterpartyName })` — **ein** Weg zum Anzeigenamen des Sachverhalts: `title`, sonst `<Art>: <Gegenpart>`, sonst `<Art>` | `modules/accounting-cases/domain/case.ts` | **Korrigiert im Prüflauf 2026-09-05: es sind vier verschiedene Regeln, nicht dreimal dieselbe** — `PortalCaseList.tsx` Z. 254–256, der Kopf, der Partner-Reiter (`title ?? summary ?? „—"`) und der Tooltip der Liste. Und eine davon **verliert Nutzerdaten**: `buildCaseOverview()` (`overview-vm.ts` Z. 708–710) liest `detail.title` nie, ein vom Nutzer gesetzter Titel ist auf der Detailseite unsichtbar. Es ist Rang 1 aller fünf Sachverhalts-Formen | `entitaeten/accounting-case.md` B1 |
| **L-53** | Entweder Registry-Achse für `client_accounting_case.kind` oder die Farbe weg | `status-registry.ts` bzw. `CaseKindCell` | `CaseKindCell` färbt `recurring_charge` als `warning` und alles andere als `info`; `CASE_KIND_LABEL` ist laut eigenem Kommentar bewusst kein Status („keine Farbe, keine Übergänge"). Beides zusammen geht nicht — der v3-`CaseRow` zeigt die Art bis dahin ohne Farbe. **Prüflauf 2026-09-05: es trifft ein zweites Mal zu** — `CloseCasesPanel` färbt `recurring_charge` mit fest verdrahteten Hex-Werten, ganz ohne `Badge` | `entitaeten/accounting-case.md` B2 |
| **L-54** | `lifecycleStatus` in die Queries der drei Listen aufnehmen, die `CaseCell` zeigen | `documents/page.tsx`, `KontoauszugView.tsx`, `StuckDocumentsTable.tsx` | `ui/case/CaseCell.tsx` trägt nur die Nummer. **Korrigiert im Prüflauf 2026-09-05: nur zwei der drei Listen rufen die geteilte Zelle** — `KontoauszugView.tsx` Z. 134 hat eine eigene (0/1/n Fälle, „offen"-Pille, Betrag je Fall) und gehört mit abgelöst. Wer im Kontoauszug sieht, dass eine Zahlung an Sachverhalt 2026-0412 hängt, weiß nicht, ob der noch offen ist — Rang 2 fehlt an der kleinsten Form. Der v3-`CaseCell` nimmt ihn mit | `entitaeten/accounting-case.md` B3 |
| **L-56** | Die **Anzeige**-Seite der Kontoauszugsposition spiegeln: der Zeilen-Typ und fünf reine Ableitungen — `extractSepaTags()` und `derivePurposeParts()` (SVWZ statt Rohblock; ohne die erste läuft die zweite nicht), `deriveZ()`/`restOf()` (Zuordnungs-Zustand Z0–Z3), `datevMatchTitle()` (Match-Stufe → Haken), `deriveCaseIndicators()` — dazu `PURP_LABELS` | `modules/bank-transactions/domain/` | **Korrigiert im Prüflauf 2026-09-05:** der Ordner existiert, gespiegelt ist aber nur die **Import**-Seite (`BankTransactionRow` als Parser-Ausgabe, `raw-sheet`). Alle fünf Ableitungen liegen in `ui/` bzw. `infrastructure/` der App; eine v3-Komponente kann sich dort nicht bedienen und definiert sie strukturell deckungsgleich lokal. `resolveEventBookingState` ist **kein** Befund — das gibt es in v3 schon | `entitaeten/bank-transaction.md` B2 |
| **L-57** | Registry-Achse für `client_bank_transactions.match_stage` — zwölf Werte, acht „gematcht", vier „offen" | `status-registry.ts` | ein grüner Haken plus handgeschriebener Titel (`datevMatchTitle`, `DATEV_MATCHED_STAGES` als Set von Hand). Die vier offenen Klassen sind unsichtbar, `beyond_bookings` allein 328 von 1281. Nicht zu verwechseln mit `mirror_match` — das ist `client_datev_mirror_entries.match_state` | `entitaeten/bank-transaction.md` B3 |
| **L-66** | Je eine **Registry-Achse für die 17 `StatusHeader` mit `hint`**, hinter denen heute keine Achse steht | `status-registry.ts` | `AccountLedgerDrawer` (Buchungszustand), `bankkonten/page` (Kontoauszug, Gate 1a), `datev/page` (fünf: Lauf, Festschreibung, Prüfung, Abgleich, WJ-Status), `accounts/[accountNumber]` (drei), `documents/page` (Erledigt), `opos` (Ausgleich), `CaseDatevTruthTab` (drei), `StuckDocumentsTable`, `CasePlausibilityTab` (zwei). Der v3-`StatusHeader` hat **kein** `hint` (0077) — ohne Achse löscht der Import-Tausch ihren einzigen Erklärtext. **Vorbedingung für A5 der App** | 0077 · `ludwig-worker` 2026-09-05 |

## B · GLOSSARY

| # | Befund | Zu tun | Quelle |
|---|---|---|---|
| **L-18** | Kein Eintrag für das **Ereignis** (`client_accounting_event`) — es kommt nur in der Schichten-Tabelle und im Sachverhalts-Eintrag vor | Eintrag anlegen | 0040 |
| **L-19** | Kein Eintrag für die **Rohdaten-Sicht**; „raw" ist bisher nur als Gegenstück zu Stammdaten belegt (`vendor` vs. `creditor`) | Eintrag anlegen | 0051 |
| **L-20** | Kein Eintrag für den **Kontoauszug**, und drei Wörter im Umlauf: „Kontenblatt", „Konto-Auszug", „Konto-Historie" (`AccountLedgerDrawer`, `getAccountLedger`, `listAccountMirrorEntries`, Fuß-Text „Volles Konto öffnen") | **ein** Wort wählen, dann Eintrag | `entitaeten/account.md` |
| **L-55** | **Zwei deutsche Namen für `client_bank_transactions`, beide im GLOSSARY:** der Eintrag `### Bank transaction` sagt „Banktransaktion", die Schichten-Tabelle desselben Dokuments sagt „Kontoauszugsposition". Die App sagt im UI durchgehend „Kontoauszug" (`KontoauszugView`, `kontoauszug-presentation`, Route `banks`). Zweite Ausprägung von L-20 | **ein** Wort wählen, dann den Eintrag nachziehen. Das Profil folgt bis dahin der Schichten-Tabelle und dem UI: **Kontoauszugsposition**; der englische Name `bank transaction` ist unstrittig | `entitaeten/bank-transaction.md` B1 |
| **L-65** | Der Eintrag **Accounting case** lässt in seiner `lifecycle_status`-Aufzählung `waiting_for_documents` aus, obwohl der DB-CHECK ihn führt und die Liste einen eigenen Reiter „Wartet auf Unterlagen" dafür hat | Aufzählung ergänzen | `entitaeten/accounting-case.md`, Prüflauf 2026-09-05 |
| **L-21** | „Ledger account status" nennt `'active' \| 'archived'`, der DB-CHECK erlaubt `'active' \| 'inactive'`. Die Registry folgt der DB — der GLOSSARY-Satz („`archived` blendet Konten in der Buchungsmaske aus") hat **keinen Wert hinter sich** | GLOSSARY korrigieren oder die Spalte erweitern | `entitaeten/account.md` |

## C · Schema und Datenbestand

| # | Befund | Zu tun | Quelle |
|---|---|---|---|
| **L-22** | `client_ledger_accounts.is_default` ist **tot**: 41.570 von 41.570 Zeilen `false` | befüllen oder droppen; die Anzeige lässt sie aus | `entitaeten/account.md` |
| **L-23** | `client_accounting_case_expectation` hat `expected_amount`, aber **keine `currency`** | Spalte ergänzen; bis dahin nimmt der Aufrufer die des Sachverhalts | 0040 |
| **L-24** | `client_accounting_case_expectation.clarification_id` ist **tot**: 0 von 45 Zeilen belegt, seit F125 auch fachlich abgelöst | Kandidat zum Entfernen | clarification B4 |
| **L-25** | **Kein `created_by` an der Klärung.** Wer gefragt hat, steht nur im Audit (`case.clarification_raised`, 403 Ereignisse, 3 mit User-Actor); die Tabelle kennt `answered_by`, aber keinen Fragesteller. **Der Owner will Erstellung und Beantwortung mit Person und Datum sehen** | Spalte ergänzen **oder** den Audit-Verlauf in `ClarificationVM` laden | clarification B7 |
| **L-26** | `professional_text` und `client_text` sind in **79 %** identisch — die Zwei-Text-Regel wird faktisch nicht gelebt | entweder erzeugen die Module wirklich zwei Fassungen, oder die Regel wird auf eine reduziert. Die UI kann beides tragen, aber nicht beides gleichzeitig behaupten | clarification B3 |
| **L-27** | **Eine Antwort je Frage, kein Faden.** `answerClarification` lehnt die zweite ab; ein zweiter Anlauf ist eine neue Zeile ohne Kante zur ersten | Datenmodell-Entscheidung (Owner-Frage 2026-09-04): n Antworten je Frage, oder ein Faden über `parent_clarification_id`. Die Karte trägt schon 0…n Einträge | clarification B8 |
| **L-28** | Altlast `document_missing` / `document_upload` — je 8 Zeilen, seit F125 fachlich abgeschafft | Migration oder bewusste Duldung; die neue Karte bietet `document_upload` nicht mehr als Antwortform an | clarification B6 |
| **L-29** | **Tag gegen Zeitstempel**: `event_date` und `due_date` sind `date`, `created_at` der Klärung ist `timestamptz` — der Verlauf ist tagesgenau, `Timeline` zeigt Uhrzeiten | entscheiden, welche Auflösung der Verlauf hat | 0040 |
| **L-30** | **Der DATEV-Auszug kennt keinen Saldo.** `listAccountMirrorEntries` summiert Soll und Haben je Satz, den laufenden Saldo rechnet die Kontoseite nur über die Ludwig-Sätze — führt der Spiegel die Liste an, führt er auch den Saldo | Saldo über die Spiegelsätze rechnen. **Vorsicht:** der Spiegel ist die Nebenbuch-Sicht mit gedroppten Sammelkonto-Legs; für ein Sammelkonto stimmt er nicht | `entitaeten/account.md` |
| **L-35** | **Diskriminator und Subtyp-Zeile laufen auseinander** — 10 von 384, und zwar in **zwei** Richtungen: 7 × `invoice` ohne `…_invoices`-Zeile (alle 2026-07-31, vor dem F87-Kern, alle erledigt — Altbestand) und 3 × `other` **mit** Zeile, alle drei mit gesetztem `class_overridden_at` | Die drei sind App-seitig `P26` („Belegform-Override räumt die Rechnungs-Pipeline nicht auf"), Owner-Entscheid offen. Für uns nichts zu tun: die Familie zeigt den Ausprägungs-Block nur, wenn beide Quellen übereinstimmen, und deckt damit beide Richtungen ab (0074). Die Regel fällt weg, sobald P26 entschieden ist | `entitaeten/source-document.md` B9 |
| ~~**L-38**~~ | ~~Vier Belegarten ohne Subtyp-Tabelle~~ — **erledigt 2026-09-04 (App-Seite): Absicht, kein Befund.** Die drei sind Container bzw. Deckblätter; ihre Struktur liegt an `client_bank_import_batches` / `client_bank_transactions` bzw. an den Kind-Belegen. Der fehlende Satz steht seit 2026-09-04 als Punkt 4 im GLOSSARY-Eintrag „Source document supertype & specializations" | nichts zu tun. Für uns: der Deckblatt-Block hängt an der Gruppen-Relation, nicht an der Belegart (0076) | `entitaeten/source-document.md` B2, B12 |
| ~~**L-39**~~ | ~~`client_source_docs_contracts` ist leer~~ — **erledigt 2026-09-04 (App-Seite): kein Befund.** Alle sieben Audit-Ereignisse hängen an einem Beleg, den es nach einem Mandanten-Wipe (nach 2026-07-20) nicht mehr gibt; das Audit-Log ist Seitenkanal und überlebt das per Design. Kein Schreibpfad-Fehler | nichts zu tun. Für das Design-System heißt es: den Vertragsrenderer gegen das **Schema** bauen, nicht gegen Staging — die Tabelle war dort nie produktiv befüllt (0076) | `entitaeten/source-document.md` B1 |
| **L-40** | `doc_category` zu 46 % gefüllt — **beantwortet 2026-09-04 (App-Seite):** die F87-Migration ist bewusst backfill-frei. Seit 2026-08-20 fehlt die Kategorie nur noch bei `other`-Belegen (23 Stück), und das ist Absicht: **ein Container hat keine Kategorie, sie entsteht je Teilbeleg.** Die restlichen ~170 sind Staging-Altbestand Juli/August | Der Backfill ist App-seitig `P20` (Big-Bang-Reset, wartet auf Owner-Go), keine neue Migration. **Regel fürs Design-System, unabhängig davon:** ein Filter oder Badge über die Kategorie führt NULL als „unklassifiziert / Container", nie als Fehler oder Lücke | `entitaeten/source-document.md` B3 |
| **L-41** | Die Erledigung wird in **drei** Formen gezeigt — Häkchen in der Belegliste, Häkchen in `SourceDocFamily`, Badge mit Wort nur in `DocCompletionControl`. Begründet mit „binär, kein eigener Werteraum" (`COMPLETED_LEGEND`, von Hand). **Das stimmt nicht:** `completed_via` ist CHECK-beschränkt auf sechs Werte und zu 73 % gefüllt (`booking` 171 · `manual` 77 · `no_booking_required` 26 · `superseded` 7 · `case_closed` 1 · 61 erledigt ohne `via` · 41 offen) | Achse aufnehmen; v3 führt sie als `beleg_erledigung` (die sechs Werte plus „Offen"), `completed_reason` bleibt der Tooltip | `entitaeten/source-document.md` B8 |
| **L-42** | Die Achse `beleg` (Pipeline) lebt am **Rechnungs**-Subtyp; für 16 % der Belege gibt es dort nie einen Wert. Die Supertyp-Achse `beleg_inbox` ist nur die halbe Antwort — 383 von 384 tragen denselben Wert (`classified`) | entscheiden, welcher Zustand einen Nicht-Rechnungs-Beleg unterscheidet. v3 stellt bis dahin die **Erledigung** nach vorn und `beleg_inbox` erst ab M | `entitaeten/source-document.md` B4 |
| **L-43** | `listInvoicesForClient` liest vom Supertyp und liefert alle Belegarten — der Name behauptet das Gegenteil und ist die häufigste Quelle des Missverständnisses „Beleg = Rechnung" | umbenennen (`listSourceDocsForClient`) | `entitaeten/source-document.md` B7 |
| **L-45** | **Die Kante Beleg → Bank-Umsätze ist weich** (von der App-Seite 2026-09-04 bestätigt und übernommen). Zwei Wege, kein FK: `client_bank_transactions.raw_payload->>'source_doc_id'` samt `external_transaction_id = '<source_doc_id>#<n>'` (Abtipp-Weg; im Bestand 79 Umsätze an 6 Belegen) und `client_bank_import_batches.stored_file_id = client_source_docs.stored_file_id` (Intake F133, 0 Zeilen). Der Batch trägt die Kopfdaten des Kontoauszugs, kennt den Beleg aber nicht | Vorschlag der App-Seite: `client_bank_import_batches.source_doc_id` als nullable FK, vom Abtipp- und Intake-Weg gesetzt — eine Spalte, kein Subtyp. **Owner-Entscheid steht aus.** Solange offen, zeigt keine Beleg-Form Zeitraum, Salden oder Zeilenzahl eines Kontoauszugs (0076 Ausbau) | `entitaeten/source-document.md` B11 |
| **L-46** | **Der Klammer-Typ wird nie vergeben** (App-Seite `P28`, 2026-09-04). 12 Sammel-Originale: 8 × `not_connected`, 4 × NULL, keine der vier Klammer-Familien aus belege.md R25–R27. Ursache im Klassifikator (die LLM-Antworten liefern `other`/`null`/`not_connected`, nie `credit_card_statement` oder `expense_report`), nicht in der Persistenz — der Verprobungspfad läuft leer | App-seitig erfasst als P28. **Für uns:** der Deckblatt-Block muss ohne Klammer-Typ vollständig aussehen — im Bestand ist das der Normalfall, nicht die Ausnahme (0076) | `entitaeten/source-document.md` B13 |
| **L-58** | **Der Kontoauszug zeigt keinen Saldo.** Die Kontoübersicht (`[year]/banks`) führt je Konto eine Saldo-Spalte, der Auszug selbst (`KontoauszugView`) keinen laufenden Saldo — wer gegen den Bankauszug abgleicht, hat keine Anschlusszahl | Anfangs- und Endsaldo des gefilterten Zeitraums unter der Liste (nicht je Zeile: eine Saldo-Spalte stimmt nur bei genau einer Sortierung). Schwesterbefund zu L-30 | `entitaeten/bank-transaction.md` B4 |

## D · Doppelte Implementierungen in der App

Nicht dringend, aber jede Dopplung ist eine zweite Wahrheit, die bei der
Ablösung doppelt Arbeit macht.

| # | Befund | Quelle |
|---|---|---|
| **L-31** | Die beiden `RohdatenTab.tsx` sind Kopien voneinander; die Sachverhalt-Fassung ist die ältere (keine Klappe, keine `HEAVY_TABLES`, `<pre>` fest bei 360 px). **Wer sie ablöst, löst zwei Dateien ab.** Dazu drei Wahrheiten für denselben Wert: `true` vs. „ja", Zahl gruppiert vs. ungruppiert, Zeitstempel lokalisiert vs. roh | 0051 |
| **L-32** | Zwei Antwort-Eingaben für dieselbe Frage: `AnswerInput` (Kanzlei) und die Kopie in `PortalCaseList.tsx`. `RueckfragenListe` nutzt bewusst dieselbe Eingabe wie der Sachverhalt — das Portal ist ausgeschert | clarification B5 |
| **L-33** | Zwei Sicht-Mechaniken, eine Bedeutung: `InvoiceLogsPanel` (Fachlich/Technisch/Beide + verbose, Client-State) und das Stapel-Log (Verlauf/Protokoll/Technik, URL). Mit 0053/0054 wird „Fachlich" = Tiefe ≤ 2, „Technisch" = Tiefe 3, „verbose" = schwerefreie Tiefe-3-Zeilen — **der Schalter fällt weg** | 0054 |
| **L-34** | Acht Module bauen das Auf- und Zuklappen lokal nach: `AuditLogTable`, `KontoauszugView`, `FindingsList`, `Schritt6Liste`, `PositionenTab`, `GlanceCard`, `ClarificationsBanner`, `OpenExportOverview`. Beim Umzug auf `DataTable`s `expand` fällt der jeweilige `useState` weg | 0057 |
| **L-59** | Der **Kontoauszug verschluckt die SEPA-Referenzen**: 90 % der Zeilen tragen mindestens eine, `KontoauszugView` zeigt aber nur den Freitext — es benutzt `PurposeDisplay` gar nicht (der String `purpose` kommt in der Datei kein einziges Mal vor) und rendert `deriveSepa(row).text` als nacktes `<span>`. Das (i) der Zeile öffnet den Drawer, nicht den Zweck. Damit ist der Originalblock aus der Hauptliste nicht erreichbar | `entitaeten/bank-transaction.md`, Prüflauf 2026-09-05 |
| **L-60** | `reassignImportBatch` ist **toter Code**: in `konten.md` R21–R22 und `bank.md` als Korrekturweg dokumentiert, im ganzen Repo aber ohne Aufrufer — kein UI, keine Server Action, kein Agenten-Werkzeug, kein Skript. Entweder anschließen oder Dokumentation und Funktion streichen | `entitaeten/bank-transaction.md`, Prüflauf 2026-09-05 |
| **L-61** | `SachverhaltScreen.BankPane` beschriftet ein Feld „Wertstellung", füllt es aber aus `postingDate` (`overview-vm.bankFacts`). Valuta und Buchungsdatum sind zwei Spalten und weichen regelmäßig ab | `entitaeten/bank-transaction.md`, Prüflauf 2026-09-05 |
| **L-62** | Eine **dritte Route zeigt Kontoauszugspositionen**, die in keinem Profil stand: `configuration/bankkonten/[accountId]/transactions` rendert dieselbe Zuordnungstabelle über alle Zeilen eines Kontos und schneidet **stumm bei `limit 500`** ab — ohne Pager und ohne Hinweis, dass etwas fehlt | `entitaeten/bank-transaction.md`, Prüflauf 2026-09-05 |
| **L-63** | Der **Zuständigkeits-Filter der Sachverhaltsliste ist tot**: `CaseListFilters` schreibt `?dispo=` in die URL, `caseFilterForListTab()` liest ihn nicht, und `CaseFilter` hat kein Feld dafür. Ein sichtbarer Filter, der nichts filtert — der v3-Spaltensatz übernimmt ihn erst, wenn er wirkt | `entitaeten/accounting-case.md`, Prüflauf 2026-09-05 |
| **L-64** | `CaseOverviewBox` und `EventStack` sind exportiert, werden aber **nirgends gerendert**; `docs/ui-repraesentationen.md` §1 führt beide weiter als aktive Komponenten. Vor der Ablösung klären, ob sie tot sind — sonst zählt die Migration Arbeit, die es nicht gibt | `entitaeten/accounting-case.md`, Prüflauf 2026-09-05 |

## E · Ablösungen — welcher v3-Baustein ersetzt was

Das sind **keine Befunde**, sondern die Migrationsschritte. Sie stehen in den
Specs als Kriterien „offen (App)": hier nicht erfüllbar, weil dieses Repo das
ausgelagerte Design-System ist (`docs/backlog/README.md`).

| v3-Baustein | Ersetzt in der App | Bewusst nicht mitgenommen |
|---|---|---|
| `Drawer` / `DrawerFooter` (0042) | `ui/components/primitives/Drawer.tsx` | — · `UrlDrawer` baut weiter darauf auf, Schnittstelle unverändert |
| `SourceDocumentDrawer` (0052) | `BelegDrawer` und das Sachverhalts-Gegenstück in `ui/drawers/` | — |
| `AccountDrawer` (0068) | `AccountLedgerDrawerProvider` (`ui/drawers/AccountLedgerDrawer.tsx`, 365 Z.) | Spalte „Sachverhalt" (2 % gefüllt) und die Tab-Umschaltung — beides absichtlich |
| `AccountCell` (0066) | `AccountRef` (`ui/booking/`, 5 Aufrufstellen, 13 Context-Dateien) | der Context-Weg wird ein `href` über den Search-Param (L3) |
| `accountEntryColumns` / `AccountEntryList` (0067) | drei Handtabellen: die zwei `<tbody>` in `AccountLedgerDrawer.tsx` und die zwei Auszüge im Tab „Buchungen" der Kontoseite | Spalte „Sachverhalt" wandert in den `title` |
| `AccountField` (0013) | `onOpenLedger` am `JournalEntryEditor` — der reicht es künftig an die Felder durch, statt es selbst zu zeichnen | — |
| `JournalEntryCard` (0044) | `BookingProposalCompact` (`EventStack.tsx:127`) | Status, Herkunft, Konfidenz, Belegfeld 1 — stehen künftig **neben** der Karte (`StatusBadge`, `FieldList`) |
| `CaseTimeline` (0040) | `Timeline`/`TimelineItem`/`EventIcon` in `SachverhaltScreen.tsx`/`parts.tsx` | die bewusst ins Detail verschobenen Punkte |
| `RawRecord` (0051) | `RecordValue`/`RowKeyValueTable`/`CollapsibleText` in **beiden** `RohdatenTab.tsx`, `fmtRawValue` in `ui/drawers/server.tsx` | — |
| `LogBrowser` (0054) | `InvoiceLogsPanel` samt verbose-Schalter, die Stapel-Sichten | — |
| `DataTable` (0057) | den Tabellenteil der 13 Listenseiten, zuerst `[year]/cases/page.tsx`; die zwei v2-`SelectionBar`-Stellen | — |
| `ClarificationCard` (0060) | `AnswerInput` und die Portal-Kopie | — |
| Beleg-Familie (`SourceDocumentCell`/`Row`/`Preview`/`Facts`) | `BelegSummary`, `BelegPreview`, `SourceDocFactsCard`, den Fakten-Teil von `GlanceCard` und `ContractDetail`, `ClassificationStack`, `InvoiceNumberCell`, die Zeilen von sechs Listen | Positionen und Vorsteuer (0072), der Vertrags-Editor (0073), der View mit seinen sechs Tabs (0071) |
| `StatusHeader` (0077) | `ui/components/primitives/StatusHeader.tsx` in 36 Dateien — `legend={axisLegend("x")}` wird `axis="x"` | `hint` (20 Stellen) und `legend` von Hand (8 Stellen → L-51); die Hover-Legende — das Set erklärt per Klick im `StatusInfoDialog` |
| `Confidence` (0078) | `ConfidenceDot`, `ConfidenceMeter`/`ConfidenceBand`, `Confidence` (invoices) in zwölf Dateien; danach `.confdot`/`.conf`/`.confband` aus `app-chrome.css`/`booking.css` | Meter (drei Balken) und Band — ein Anteil als Balken ist `Progress` |
| `Wizard` (0079) | `ui/components/wizard/Wizard.tsx` in fünf Dateien, formgleich (Import-Tausch); `settings/components` ist vorher Rückbau (F111 B2) | die `h2`/`.sub`-Typografie im Body |

## F · Bleibt in der App — benannte Kompositionen (Owner 2026-09-04)

Kein v3-Baustein, sondern Markup aus vorhandenen Primitives an der
Aufrufstelle. Die Liste ist das Ziel des Grep-Zählers der App: was hier steht,
wird nicht mehr ans Set gemeldet. Antwort auf `ludwig/app`
`docs/backlog/F147-luecken-fuer-design-agent.md` §2 und §5.

| Heute in der App | Wird in der App zu |
|---|---|
| Top-Bar-Füllung (`TopBar.tsx`) | `TopBar` (0030) mit `crumb` · `search` (`SearchInput`) · `actions` |
| `MandantBand`, `MandantSwitcher` | `Popover` + `NavList`, der Link ein `TextButton` |
| `YearSwitcher`, `RememberClientYear` | `Popover` + `NavList`; der Jahreszustand ein `StatusBadge` |
| `UserMenu` | `OverflowMenu` |
| `RoleBadge` | `StatusBadge axis="rolle"` — die Achse existiert |
| `ExperimentBadge`, `ExperimentMandantBanner` | `Badge`, `Banner` |
| `ReadinessBanner`, `EmbeddingCoverageBanner` | `StatusCallout` / `Banner` |
| `EntityStatusBadgeButton` + `FlowModal` | `StatusBadge chevron` (0049) als Auslöser, `Dialog` mit drei `StatusBadge` und Entitäts-Icons; die Server Action `fetchFlowSnapshot` bleibt drüben |
| `KIND_DOT_COLOR`, `BadgeKind` | `BadgeTone`, `DotStatus`, `Badge dot` — Farbe aus Tokens, keine Hex-Tabelle (V13) |
| `TaxKeySelect` | `Select` über `TAX_KEYS` (gespiegelt in `core/datev/tax-keys.ts`) im `JournalEntryEditor` (0015) |
| `CopyTextButton` | `ActionButton` mit Clipboard-Aktion + `useToast` |
| `ManualBookingDrawer` | `Drawer` + `JournalEntryEditor`; die Datenbeschaffung bleibt im Modul |
| Schalter (Toggle) | entfällt — 0018 verworfen |
| Kommentar-/Notizstrang (`CaseCommentForm`, `ClientAgentNotesPanel`) | wartet auf L-27 |
| Sparkline in der KPI-Kachel | wartet auf das Seitenprofil des Dashboards (Welle 2) |

## Was zuerst

Wer die App anfasst, kommt am schnellsten voran, wenn er in dieser Reihenfolge
geht — sie folgt daraus, wie viele v3-Bausteine an einem Befund hängen:

0. **L-48/L-49** (Registry) — eine Typdefinition und ein kopierter Block;
   blockiert E1.4 der App-Migration und 0080 hier.
1. **L-15** (`sort`/`dir` in `PageRequest`) — hängt an allen 13 Listenseiten und
   damit an `DataTable`; ohne das sortiert weiterhin keine Seite.
2. **L-09** (`ClarificationVM` ohne UI-Import) — solange die Datei
   `@/ui/booking` importiert, spiegelt `sync-ludwig.sh` sie nicht, und die
   Klärungs-Familie arbeitet gegen eine lokale Kopie.
3. **L-13/L-14** (`AccountFactsVM`, `AccountEntry`) — die Konto-Familie ist
   gebaut und wartet nur auf die Typen.
4. **L-06/L-07** (Zeilenmodell des Buchungssatzes, `Currency`) — betrifft
   Editor und Karte.
5. **L-02** (Ereignistypen) — betrifft `Timeline` und `CaseTimeline`.
6. Der Rest nach Aufwand; die Schema-Punkte in C brauchen je eine
   Owner-Entscheidung, keine Implementierung.
