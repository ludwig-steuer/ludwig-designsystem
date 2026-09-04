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
| **L-36** | `documentCounterparty({ docDirection, vendorName, customerName, classCounterpartyName })` — **ein** Weg zum Namen des Gegenparts | `modules/source-docs/domain/` | drei Wege: `PartnerCell` rechnet aus Richtung + vendor/customer, `BelegeTab` nimmt `class_counterparty_name`, der v3-Drawer beschriftet ihn „Lieferant" | `entitaeten/document.md` B6 |
| **L-37** | Registry-Achse `beleg_charakter` für `document_kind` (`original` · `credit_note` · `self_billing` · `refund` · `unknown`) | `status-registry.ts` bzw. die Achsen-Quelle der App | `DOCUMENT_KIND_LABEL` als Label-Map; die Belegliste zeigt den Wert als Badge ohne Achse. Vier Einordnungs-Achsen, drei in der Registry | `entitaeten/document.md` B5 |
| **L-17** | `BATCH_LOG_VIEWS` als allgemeines `LOG_VIEWS` — es trägt die Wörter aus Z6, hängt aber am Stapel | `audit-log/domain/`, der Stapel importiert | stapelgebunden | 0054 |

## B · GLOSSARY

| # | Befund | Zu tun | Quelle |
|---|---|---|---|
| **L-18** | Kein Eintrag für das **Ereignis** (`client_accounting_event`) — es kommt nur in der Schichten-Tabelle und im Sachverhalts-Eintrag vor | Eintrag anlegen | 0040 |
| **L-19** | Kein Eintrag für die **Rohdaten-Sicht**; „raw" ist bisher nur als Gegenstück zu Stammdaten belegt (`vendor` vs. `creditor`) | Eintrag anlegen | 0051 |
| **L-20** | Kein Eintrag für den **Kontoauszug**, und drei Wörter im Umlauf: „Kontenblatt", „Konto-Auszug", „Konto-Historie" (`AccountLedgerDrawer`, `getAccountLedger`, `listAccountMirrorEntries`, Fuß-Text „Volles Konto öffnen") | **ein** Wort wählen, dann Eintrag | `entitaeten/account.md` |
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
| **L-35** | **Diskriminator und Subtyp-Zeile laufen auseinander.** 7 Belege tragen `source_doc_type='invoice'` ohne Zeile in `client_source_docs_invoices`, 3 tragen `other` **mit** einer — 10 von 384 | Trigger oder Constraint, der beides koppelt. Bis dahin kann keine Renderer-Registry auf dem Diskriminator allein stehen; das Design-System rendert, was die Subtyp-Zeile hergibt | `entitaeten/document.md` B9 |
| **L-38** | **Vier Belegarten ohne Subtyp-Tabelle:** Kontoauszug (10), Kreditkartenabrechnung (8), Reisekostenabrechnung (4), Erklärung (0). Jede hat einen Diskriminator-Wert und einen Folgeprozess, aber keinen Ort für ihre Felder (Zeitraum, Konto, Saldo; Karte; Abrechner, Erstattungssumme). Widerspricht der eigenen GLOSSARY-Regel „neue Belegart = neuer Subtyp + neuer Diskriminator-Wert + neuer Renderer-Registry-Eintrag" | Owner-Entscheidung: Tabellen anlegen oder den Verzicht begründen. Solange offen, zeigen diese vier nur Supertyp-Punkte. **Anschlussfrage:** `document.statement_lines_recorded` steht 6-mal im Audit, aber es gibt keinen FK vom Beleg zu den Bank-Umsätzen — wo lebt diese Kante? | `entitaeten/document.md` B2 |
| **L-39** | `client_source_docs_contracts` ist **leer** (0 Zeilen), bei 7 Audit-Ereignissen (`contract.fields_updated`/`_confirmed`) und einer 647-Zeilen-UI (`ContractDetail`) | klären, ob die Vertrags-Extraktion läuft. Die lesende Vertrags-Ausprägung entsteht gegen das Schema (Owner-Entscheid 2026-09-04), der Editor wartet auf Daten (0073) | `entitaeten/document.md` B1 |
| **L-40** | `doc_category` nur zu **46 %** gefüllt — die Achse kam mit F87 ohne Backfill. Die Belegliste bietet den Kategoriefilter an und zeigte damit die Hälfte nicht | Backfill-Skript, kein Klassifizierungslauf: von 207 Belegen ohne Kategorie tragen 153 die Form `commercial_invoice`, weitere 25 eine eindeutig mappende — 178 von 207 (86 %) sind aus `document_form` mechanisch nachrechenbar. Legitim NULL bleiben nur `document_collection` (16), `other` (6), `unknown` (6) | `entitaeten/document.md` B3 |
| **L-41** | Die Erledigung wird in **drei** Formen gezeigt — Häkchen in der Belegliste, Häkchen in `SourceDocFamily`, Badge mit Wort nur in `DocCompletionControl`. Begründet mit „binär, kein eigener Werteraum" (`COMPLETED_LEGEND`, von Hand). **Das stimmt nicht:** `completed_via` ist CHECK-beschränkt auf sechs Werte und zu 73 % gefüllt (`booking` 171 · `manual` 77 · `no_booking_required` 26 · `superseded` 7 · `case_closed` 1 · 61 erledigt ohne `via` · 41 offen) | Achse aufnehmen; v3 führt sie als `beleg_erledigung` (die sechs Werte plus „Offen"), `completed_reason` bleibt der Tooltip | `entitaeten/document.md` B8 |
| **L-42** | Die Achse `beleg` (Pipeline) lebt am **Rechnungs**-Subtyp; für 16 % der Belege gibt es dort nie einen Wert. Die Supertyp-Achse `beleg_inbox` ist nur die halbe Antwort — 383 von 384 tragen denselben Wert (`classified`) | entscheiden, welcher Zustand einen Nicht-Rechnungs-Beleg unterscheidet. v3 stellt bis dahin die **Erledigung** nach vorn und `beleg_inbox` erst ab M | `entitaeten/document.md` B4 |
| **L-43** | `listInvoicesForClient` liest vom Supertyp und liefert alle Belegarten — der Name behauptet das Gegenteil und ist die häufigste Quelle des Missverständnisses „Beleg = Rechnung" | umbenennen (`listSourceDocsForClient`) | `entitaeten/document.md` B7 |

## D · Doppelte Implementierungen in der App

Nicht dringend, aber jede Dopplung ist eine zweite Wahrheit, die bei der
Ablösung doppelt Arbeit macht.

| # | Befund | Quelle |
|---|---|---|
| **L-31** | Die beiden `RohdatenTab.tsx` sind Kopien voneinander; die Sachverhalt-Fassung ist die ältere (keine Klappe, keine `HEAVY_TABLES`, `<pre>` fest bei 360 px). **Wer sie ablöst, löst zwei Dateien ab.** Dazu drei Wahrheiten für denselben Wert: `true` vs. „ja", Zahl gruppiert vs. ungruppiert, Zeitstempel lokalisiert vs. roh | 0051 |
| **L-32** | Zwei Antwort-Eingaben für dieselbe Frage: `AnswerInput` (Kanzlei) und die Kopie in `PortalCaseList.tsx`. `RueckfragenListe` nutzt bewusst dieselbe Eingabe wie der Sachverhalt — das Portal ist ausgeschert | clarification B5 |
| **L-33** | Zwei Sicht-Mechaniken, eine Bedeutung: `InvoiceLogsPanel` (Fachlich/Technisch/Beide + verbose, Client-State) und das Stapel-Log (Verlauf/Protokoll/Technik, URL). Mit 0053/0054 wird „Fachlich" = Tiefe ≤ 2, „Technisch" = Tiefe 3, „verbose" = schwerefreie Tiefe-3-Zeilen — **der Schalter fällt weg** | 0054 |
| **L-34** | Acht Module bauen das Auf- und Zuklappen lokal nach: `AuditLogTable`, `KontoauszugView`, `FindingsList`, `Schritt6Liste`, `PositionenTab`, `GlanceCard`, `ClarificationsBanner`, `OpenExportOverview`. Beim Umzug auf `DataTable`s `expand` fällt der jeweilige `useState` weg | 0057 |

## E · Ablösungen — welcher v3-Baustein ersetzt was

Das sind **keine Befunde**, sondern die Migrationsschritte. Sie stehen in den
Specs als Kriterien „offen (App)": hier nicht erfüllbar, weil dieses Repo das
ausgelagerte Design-System ist (`docs/backlog/README.md`).

| v3-Baustein | Ersetzt in der App | Bewusst nicht mitgenommen |
|---|---|---|
| `Drawer` / `DrawerFooter` (0042) | `ui/components/primitives/Drawer.tsx` | — · `UrlDrawer` baut weiter darauf auf, Schnittstelle unverändert |
| `DocumentDrawer` (0052) | `BelegDrawer` und das Sachverhalts-Gegenstück in `ui/drawers/` | — |
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
| Beleg-Familie (`DocumentCell`/`Row`/`Preview`/`Facts`) | `BelegSummary`, `BelegPreview`, `SourceDocFactsCard`, den Fakten-Teil von `GlanceCard` und `ContractDetail`, `ClassificationStack`, `InvoiceNumberCell`, die Zeilen von sechs Listen | Positionen und Vorsteuer (0072), der Vertrags-Editor (0073), der View mit seinen sechs Tabs (0071) |

## Was zuerst

Wer die App anfasst, kommt am schnellsten voran, wenn er in dieser Reihenfolge
geht — sie folgt daraus, wie viele v3-Bausteine an einem Befund hängen:

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
