# Web-UI — Next.js-Oberfläche, Admin, UI-Konventionen

Geltungsbereich: die Next.js-Web-Oberfläche (`apps/web/src`) —
Seitenstruktur, geteilte UI-Bausteine, Admin-Bereich, Audit-Log-UI und die
verbindlichen UI-Konventionen. Offene Probleme: `web-ui-offen.md`.

Gestaltung — Designsprache, Ton, geteilte Bausteine, Stufen und Formatter —
wird nicht mehr hier entschieden, sondern im Design-System-Repo
(`docs/design-system.md`). Die Regel-Nummern R2, R3, R4, R7, R9, R15, R18 und R21 sind
deshalb Lücken; sie werden nicht neu vergeben.

## Ist-Zustand

**Routen** (`apps/web/src/app/(app)/`):

- Mandanten-Arbeitsbereich `clients/[clientSlug]/[year]/…` — Listen und
  Arbeit im Jahres-Kontext (documents, cases, entries, banks, datev,
  export, review, opos, recurring, agent-runs, …).
- Beleg-Detail **jahres-los**: `clients/[clientSlug]/documents/[sourceDocId]`.
  Die alte `[year]`-Variante redirectet permanent — das Jahres-Segment war
  redundant und scheiterte bei Belegen ohne extrahiertes `invoice_date`.
  Reiter: **Übersicht** · **E-Rechnung** (nur wenn die Werte aus dem
  eingebetteten XML stammen, `belege.md` R37) · **Details · Positionen ·
  Vorsteuer · Verlauf & Befunde · Rohdaten** — sechs bei der Rechnung (sieben
  bei der E-Rechnung), vier beim Vertrag, drei beim Kontoauszug; jeder Reiter nur, wo er etwas zeigt. „Details" trägt, was mehr
  als einen Wert betrifft, Einzelwerte bleiben in der Übersicht an ihrem Wert.
  Die **Pipeline** ist seit 2026-09-09 kein Reiter mehr, sondern aufklappbare
  Tiefe im Verlauf; `?tab=pipeline` leitet dorthin (wie `?tab=buchung` und
  `?tab=beleg` auf die Übersicht). Was über dem Inhalt steht, regelt
  `belege.md` R33.
  Der Reiter **Vorsteuer** trennt oben nach Quelle (F264): Card
  „USt-Einschätzung — maßgeblich für die Buchung" (`client_source_docs.vat_*`:
  Behandlung, Stand, eingeschätzt von/wann, Begründung, die drei Fakten der
  Einschätzung; bei `not_assessed` nur ein Satz) und Card „Auf der Rechnung
  erkannt — Rohwerte der Extraktion" (Invoice-Subtyp: Land, USt-IdNr.,
  Steuerbetrag, § 13b-Hinweis, USt-Profil + Herkunft, Sonderfälle, Positionen
  mit Satz, Sonderfall und Schlüssel-Kandidaten des Interpreters). Darunter
  unverändert Verdikt, Einzelfakten und Regelprüfung (`buchung.md` R11).
- Geschäftspartner `clients/[clientSlug]/[year]/partners` (+ Detail
  `/partners/[partnerId]`) — die Liste ALLER Partner, nicht nur der
  Kreditoren (R14).
- Konfiguration `clients/[clientSlug]/configuration/…` (Stammdaten,
  Kontenplan, Bankkonten, Onboarding, Logs, …).
- Admin `admin/…` — Übersicht, Kanzleien (mit Technikansicht je Mandant),
  User, Abnahme-Qualität, Jobs, Audit-Log, MCP-Tokens, Agent-Anleitung
  (`AdminNav.tsx`). Die User-Seite `admin/users/[userId]` trägt Profil,
  **Account** (E-Mail ändern, sperren/entsperren, löschen — alles unter
  `user.manage`, nicht am eigenen Account; Löschen bestätigt man mit dem
  Namen, F262), Kanzlei-Zugehörigkeit, „Zuständig für" und Mandanten-Zugriff.
  Das Einladen versteht eine aus dem Mailprogramm kopierte Adresse
  „Vorname Nachname <adresse>" (`parseMailbox`).

**Module** unter `apps/web/src/modules/<feature>/` mit der üblichen
Schichtung `domain/ → application/ → infrastructure/ → ui/`. Pages bleiben
dünn, Queries leben im Modul.

**Geteilte UI** unter `apps/web/src/ui/`:

- `components/primitives` — Badge, Banner, Section (Card-Pattern), Dialog,
  EmptyState, PageHeader, StatusHeader, TabBar, Tooltip, TimeAgo, ….
- `status/` — `status-registry.ts` + `StatusBadge` (R1).
- `components/log` — `LogTable`/`LogView` + Zell-Bausteine.
- `booking/` — `KontoCombobox`, Buchungs-Ansichten, Formatter.
- `beleg/` — `BelegPreview`, der eine PDF-Viewer der Beleg-Ansichten.
- `case/` — `CaseCell`, die Sachverhalts-Zelle jeder Liste.
- `drawers/` — die einbindbaren Slide-over: Kennung rein, laden selbst
  (`BelegDrawer`, `AccountLedgerDrawer`, `BankTransactionDrawer`,
  `LudwigEntryDrawer`, `DatevEntryDrawer`, `RawRowDrawer`); Rahmen und
  `UrlDrawer` liegen in `components/primitives` (R8).

**Zum Sichten** — Storybook. Die zweite Galerie (`app/dev/gallery`) ist mit
dem Seiten-Rückbau vom 2026-09-05 entfallen, ebenso `/settings/components`:

- **Storybook** (`pnpm --filter @ludwig/web storybook`, Port 6106) für die
  _reinen_ Darstellungskomponenten: 207 Stories über 64 Dateien, Zustände aus
  `STATUS_REGISTRY` erzeugt statt von Hand gelistet. Läuft nicht im CI.
  `.storybook/server-actions-stub.ts` zieht dabei dieselbe Grenze wie Next
  (`"use server"` → Stub), sonst zöge die geteilte Schicht Drizzle in den
  Browser.

**Styles** unter `apps/web/src/styles/`: `tokens.css` (Farb-, Font- und
Spacing-Tokens `--space-1…12`), `app-chrome.css` (`.section`-Card,
`.md-tabs`/`.md-tab`), `components.css`, plus domänenspezifische Dateien
(`sachverhalt.css`, `booking.css`, `beleg-detail.css`, …).

**Sammel-PDFs**: `modules/source-docs/ui/SourceDocFamily.tsx` zeigt die
Verwandtschaft in beide Richtungen — `ParentDocNotice` am herausgetrennten
Kind („aus Sammel-PDF …, Seiten 5–7") und die Kinderliste am Eltern-Beleg.

## Regeln

### R1 — Status-Registry ist die eine Status-Darstellung
Jede Status-Achse, die in der UI als farbiger Status auftaucht, wird über
`ui/status/status-registry.ts` + `StatusBadge` dargestellt: Label,
Badge-Farbe (`kind`) und Erklärtext pro Achse (`document_processing`, `accounting_case`,
`journal_entry`, `job`, …). Keine lokalen `STATUS_LABEL`-Maps, keine Hex-Farben
in Feature-Komponenten. Die Registry ist NICHT die Wertebereich-Quelle —
der lebt im DB-CHECK bzw. Domain-Enum; `__tests__/status-registry.test.ts`
hält beide Seiten deckungsgleich (neuer Enum-Wert ohne Eintrag = roter
Test). Achsen-Keys und Status-Werte sind englisch (Werte 1:1 aus der DB;
die Achsen seit F210, der Registry-Test „Achsen-Schlüssel sind englisch“ hält es). *Warum:* derselbe Zustand muss überall gleich heißen und
gleich aussehen, und `failed`/`proposed`/`queued` bedeuten je Achse etwas
anderes.

### R5 — Eine Beleg-Shell für alle Belegarten, `source_doc_id` als Identität
Die Beleg-Detailansicht ist EINE Shell mit einem Tab-Katalog (`DOC_TABS`
in `modules/source-docs/domain/tabs.ts`: overview · e_invoice · details ·
lines · input_tax · timeline · raw). Die Belegart bestimmt nur, welche Tabs
sichtbar sind (`availableDocTabs`) und wie der erste heißt — nicht, welche
Ansicht gemountet wird. URL-Identität ist die `source_doc_id` (Supertyp);
`DocCompletionControl` (Erledigt-Steuerung) und `DocActionsMenu`
(technische Aktionen) gelten für jede Belegart, PDF-Anzeige über
`BelegPreview`. Neue Belegart = Subtyp-Dispatch andocken, keine zweite
Shell. *Warum:* zwei konkurrierende Shells sind der dokumentierte
Fehlerzustand, aus dem dieser Merge kam.

### R5a — Die Beleg-Liste liest vom Supertyp, wie die Detailansicht
„Alle Belege" (`[year]/documents`) heißt so, weil es alle Belegarten sind:
`listInvoicesForClient` liest `FROM client_source_docs` mit LEFT JOIN auf
den Rechnungs-Subtyp — Kontoauszug, Vertrag, Kreditkartenabrechnung und
Sammel-PDF stehen neben der Rechnung, rechnungsspezifische Spalten bleiben
leer. Wo die Extraktion nichts liefert, trägt die Klassifizierung den Wert
(`class_counterparty_name` als Gegenpart, `class_document_form` als
Belegform, Dateiname als Kennung ohne Belegnummer).
`listInvoiceIdsForClient` (Prev/Next) liest dieselbe Menge in derselben
Sortierung. Die verbleibenden Tabs sind Filter auf diese eine Quelle, kein
zweiter Datenpfad — eine eigene Tabelle für „die anderen" Belege kommt
nicht zurück. *Warum:* zwei Listen neben zwei ID-Räumen waren derselbe
Fehlerzustand wie zwei Detail-Shells (R5); ein Beleg, der in keiner Sicht
auftaucht, ist ein verlorener Beleg.

### R5b — Der Eingang nimmt alles, was die Kanzlei bekommt
Die Ablagefläche des Eingangs (`clients/[clientSlug]/document-inbox`) nimmt
PDF, Kontoauszüge (CSV/XLSX/CAMT-XML/MT940-STA) und DATEV-Stapel (EXTF) — was die Datei
ist, entscheidet der Server an den Bytes (`routeUploadedBytes`, belege.md R1),
nicht der MIME-Typ des Browsers. Drei Ausgänge stehen in der Liste:

- **Beleg** → Eingangszeile wie bisher (`pending`, belege.md R14).
- **Kontoauszug** → Eingangszeile „Kanzlei prüft" (`human_review/statement_account_missing`) mit
  einer Kontoauswahl in der Spalte „Einordnung"; ein Klick importiert und
  erledigt die Zeile. CAMT trägt die eigene IBAN und importiert sofort.
- **DATEV-Stapel / Debitoren-/Kreditorenliste** → eine erledigte Eingangszeile
  (`done/import`, F279) und eine Meldung unter der Ablagefläche, was
  importiert wurde; die Upload-Zeile springt zum Beleg, dessen Ansicht zeigt,
  was aus der Datei wurde.

Was keinem davon entspricht, bleibt als Upload-Zeile mit dem Grund stehen und
legt nichts an. *Warum:* der Weg, den ein Mensch benutzt, war der ärmere von
zwei Kernen für dieselbe Schreibaktion (P31, F170).

### R6 — Label-Maps haben genau eine Quelle im Domain-Modul
Fachvokabular-Labels (Belegformen, Belegrichtung, Belegart, …) wohnen
genau einmal im zuständigen Domain-Modul (z. B.
`source-docs/domain/document-form-labels.ts`, `DOC_DIRECTION_LABEL`);
Options-Listen für Editoren werden daraus **abgeleitet**
(Muster: `ClassificationEditor` über `DOCUMENT_FORM_ROUTING` +
`formatDocumentForm`). Keine lokalen Kopien. *Warum:* Kopien sind
nachweislich auseinandergelaufen („Tankquittung" vs. „Tankbeleg") und
ließen Werte im Editor fehlen, die es gab.

### R8 — Detail-Ansichten öffnen URL-getrieben; DATEV- und Ludwig-Buchung bleiben zwei Inhalte
App-weit öffnen Detail-Ansichten über einen Search-Param: er trägt die Id,
Schließen nimmt ihn wieder aus der URL. Öffnen und Schließen kosten keine
Server-Runde, wo keine nötig ist (F261): **Client-Drawer** (Inhalt lädt der
Client — `account`, `transactionId`) öffnen per `window.history.pushState`,
ohne Neu-Rendern, Scroll oder Zustandsverlust; **Server-Drawer** (Inhalt ist
eine Server-Component — `partner`, `entry`, `document`) öffnen weich mit
`scroll: false`. Durchgesetzt an **einer** Stelle, dem `DrawerLinkInterceptor`
im Jahres-Layout (`ui/drawers/shallow-url.ts`); ein neuer Drawer-Parameter
wird dort eingetragen.
Der BU-Schlüssel-Drawer (`?taxKey=`, F271) ist ein Client-Drawer mit
statischem Katalog — jeder `TaxKeyRef` schlägt ihn auf (`apps/web/AGENTS.md` §7).
Der Rahmen dafür ist `UrlDrawer` (`@/ui/components`); wo es für die Entität
schon einen einbindbaren Drawer gibt, nimmt man den statt Rahmen + Inhalt
selbst zusammenzusetzen (Drawer-Katalog: `apps/web/AGENTS.md` §7, Klassen und Aufbau im Design-System-Repo, `docs/design-system.md`). Für Buchungen gibt es bewusst zwei Inhalte
statt einer Misch-Ansicht: `DatevEntryDrawer` (was DATEV kennt) und
`LudwigEntryDrawer` (was Ludwig gebucht hat). Die Konto-Detailseite öffnet
beide über **einen** Parameter `?entry=<id>`: welche Seite die Id meint,
bestimmt der Server aus den Daten (`resolveAccountEntrySource`, F209) und
wählt danach den Inhalt — die zwei Inhalte bleiben getrennt, nur der
Parameter ist einer. *Warum:* Mischen würde verwischen, welche Seite die
Wahrheit trägt; zwei Parameter für eine Frage ließen den Aufrufer raten, was
der Server ohnehin weiß.

### R10 — `platform_audit_events` ist die eine Admin-Log
Jeder relevante Prozessschritt (Import, Export, Agent-Aktion, File-Op,
harter Fehler) schreibt genau ein Event: TS über `recordAuditEvent()`
(einziger Web-Writer, `modules/audit-log/`), Python über den Port
`AuditEventRepository`. Audit-Writes sind **best-effort** (brechen nie die
Fachoperation — Gegensatz zum fail-fast Beleg-Trace). Vokabular: `outcome
success|partial|failure`, kein Level-Spektrum; Fehler als `payload.error`
+ `payload.error_type`, kein Traceback; `source`
`web|worker|workflows|bridge|cli` (die Bridge hat keinen DB-Zugriff — der
Ludwig-Empfänger schreibt `source='bridge'`). Leseseite: `/admin/audit-log`
(Keyset-Pagination, Filterachsen, ILIKE über `message`). Detail-Logs
(`client_invoice_traces` — absorbiert die früheren Log-Entries als
`step_kind='finding'` —, `ops_llm_call_logs`, `ops_bridge_heartbeats`,
`ops_extraction_logs` als Preprocessor-Diagnostik) bleiben Drill-down via
`resource_id`/`correlation_id`. *Warum:* das Audit-Event sagt *dass* und
*mit welchem Ausgang*; das Detail-Log sagt *wie im Einzelnen*.

### R11 — Das Ludwig-Team sieht Technik, der Arbeitsbereich sieht Fachlichkeit
Die Mandanten-Technikansicht des Ludwig-Teams (`platform_staff`, Recht
`technical.area.enter`) `/admin/tenants/[tenantId]/clients/[clientId]`
beantwortet „ist der Mandant technisch gesund, was ist zuletzt passiert,
was kann ich tun": Identität, Onboarding-Zustand + Readiness,
Datenbestand-Zählwerk (`getClientTechnicalOverview`, EIN Kern-Aufruf),
Audit-Log-Ausschnitt **eingebettet** über `listAuditEvents({clientId})` +
Deep-Link — kein zweites Log-Modell. Fachliche Daten (Belege, Buchungen)
gehören in den Mandanten-Arbeitsbereich `/clients/[slug]/…`; der Link
dorthin ist der Sprung, nicht die Vermischung.

### R12 — Dauersachverhalt-UI: Zuordnung getrennt vom Regelwerk
Am Sachverhalt ist die Zuordnung (die Regel als `RecurringRuleFacts` mit
`explain` — je Einstellung der Satz aus `RULE_SETTING_HELP` —, zugeordnete
Zahlungen, `matching_note` — DATEV-Analogon: Lerndatei) ein eigener Tab,
getrennt vom Regelwerk-Tab („was wird wie oft gebucht?", dort der Editor). *Warum:* Lernstand und
Regeldefinition sind verschiedene Fragen mit verschiedenen Schreibern.

### R13 — Sidebar zeigt den aktiven Mandanten, gewechselt wird auf `/clients`
Der Mandanten-Block der Sidebar (`MandantSwitcher`) ist Anzeige + Link auf
die Mandantenliste — kein Dropdown. *Warum:* eine echte Kanzlei führt
dreistellig viele Mandanten; eine gescrollte Popup-Liste mit Mini-Suchfeld
ist dafür das schlechtere Werkzeug als `/clients`, wo Nummer, SKR,
Versteuerung, Aktiv-Status und Belegzahl in einer Tabelle stehen. Der
Aktiv-Status steht dort als Badge „stillgelegt" an der gedimmten Zeile
(Regel `onboarding.md` R19).

### R14 — Geschäftspartner-Sichten zeigen beide Personenkonto-Seiten
Die Liste unter `/[year]/partners` heißt „Geschäftspartner" und führt jeden
`client_business_partners`-Satz mit **zwei** Kontospalten (Kreditorkonto,
Debitorkonto); Detail-Header und Konten-Tab zeigen dieselben beiden Rollen,
der Konten-Tab zusätzlich alle Wirtschaftsjahre. Der Ludwig-interne
89xxxx-Platzhalter (`source='system_allocated'`) wird **gezeigt** und als
„intern" markiert, nicht ausgeblendet. *Warum:* die Liste war nie eine
Kreditoren-Liste — sie filtert nicht auf die Rolle, nur der Konto-Join tat es;
Debitoren standen dadurch mit leerer Kontospalte drin und sahen aus wie
unfertige Kreditoren. Und ein leeres Kontofeld verleitet dazu, ein zweites
Konto anzulegen, obwohl unter der internen Nummer längst gebucht wird.

### R16 — Die Stapelabnahme ist eine Subsite unter dem Stapel, kein eigener Ort
Der Prüfprozess der Kanzlei (`batches/[batchId]/review/[step]`, Schritte
0–10) läuft **innerhalb** von Ludwigs Rahmen: App-Header und Mandanten-Sidebar
bleiben, der Schritt-Rail ist eine zweite, schmalere Spalte in der
Arbeitsfläche. Ein Schritt ist ein **Pfad-Segment**, kein Search-Param — echte
URLs für Mail-Deeplinks, funktionierender Zurück-Knopf, und die Search-Params
bleiben für die Drawer frei (R8).

Der Rail ist ein Vorschlag, kein Zwang: jeder Schritt ist erreichbar, Schritt 8
sagt am Ende, was offen blieb. Was der Stapel-Zustand regelt, ist nur, ob
geschrieben werden darf — geschrieben wird ausschließlich in `review`
(`domain/gating.ts`), und **jede Server Action prüft das selbst**: ein
gedimmter Knopf ist keine Zugriffskontrolle. Der Einstieg (`…/abnahme` ohne
Schritt) landet dort, wo die Arbeit liegt: Prüfung → 0, unterwegs → 9, in
DATEV → 10.

**Übernahme vom stillen Agenten (F253):** im Zustand `agent` ist die Abnahme
nur lesbar — bis der Agent an diesem Mandanten zwei Stunden nichts geschrieben
hat (Herzschlag = letztes Audit-Event mit `actor_kind = 'agent'`, Schwelle
`AGENT_STALL_MINUTES`). Dann bietet der Banner „Prüfung übernehmen" an:
derselbe Knopf und Kern wie aus `prepared` (`takeOverBatchReview`), der den
offenen Lauf beendet und den Stapel in `review` setzt; der Server rechnet die
Stille dabei selbst nach. Einen laufenden Agenten abbrechen kann die Kanzlei
nicht.

**Notiz und Klärung kennen dieses Gate nicht.** Eine Notiz am Sachverhalt, eine
Frage an Mandant oder Agent und die Antwort auf eine offene Frage schreiben
nichts fest — sie gehen in **jedem** Stapelzustand, auch während der Agent
arbeitet (er nimmt sie im nächsten Durchgang mit) und nachdem der Stapel raus
ist. Gegated bleibt nur das Quittieren: Freigeben, Hinweis + freigeben,
Ablehnen. *Warum:* wer beim Durchsehen etwas bemerkt, soll es in dem Moment
festhalten können, in dem er es bemerkt — sonst geht es verloren oder landet in
einem zweiten Werkzeug (Owner 09.09.2026).

Die Abnahme **baut keinen zweiten Kern nach**. Sie ruft die Kerne, die Agent
und Stammdatenpflege ohnehin rufen (Abnahme, Klärung, Konvention, Freigabe);
die Freigabe-Checkliste in Schritt 8 rechnet **dieselben Gates**, die der Agent
passieren muss (`computeBatchGates`). Gelesen wird dort nie der Gate-Text des
Agenten, sondern je Zeile und Befundart ein Kanzlei-Satz
(`batch-review/domain/checkpoint-texts.ts`, F246).
Schritt 1 und 8 stellen je Umsatz zwei Fragen: Sachverhalt, Buchungsvorschlag
(F187) — in Schritt 1 ist eine offene Klärung ein zulässiger Zwischenstand
(gelb), in Schritt 8 nicht (rot), denn freigegeben wird nur ein voll gebuchtes
Bankkonto. Schritt 8 stellt eine dritte Frage: freigegeben? Eine Auszugszeile,
die nur einen Vorschlag trägt, ist dort ein Mangel (F201).
Eine **Deckungslücke aus Gate 1a** (ein Datei-Import endet vor dem
Periodenende) macht die Zeile „Kontoauszüge lückenlos" **gelb und
quittierpflichtig**: Auszug nachliefern oder begründet quittieren, und die
Quittung verfällt, sobald sich die Deckungsgrenze bewegt. Der Wortlaut wird aus
den Gate-Feldern in Menschen-Sprache gebaut (`domain/coverage-gap.ts`), für
Schritt 1 und 8 derselbe Satz; **gerechnet wird nur im Gate**. *Warum:* der
Agent läuft autonom und kann die Lücke nicht zurückspielen — entscheiden muss
der Mensch (Owner 03.09.2026). Lücken an Konten mit „Sollte kommen" sind nicht
quittierpflichtig (`bank.md` R15b).
**Schritt 4 „Kontenausgleich"** (F220, vorher „Bank"; F245) hat zwei Karten,
in dieser Reihenfolge: **Bankkonten → Verrechnungskonten** — die
Bank ist die wichtigste Aussage des Schritts. **„Bankkonten"** zeigt je
Zahlungskonto (`batch-review/domain/bank-reconciliation.ts`) fünf Zahlen ohne
Aufklappen: **DATEV-Stand** · **Dieser Stapel** (grau, wenn DATEV ihn schon
hat) · **Saldo neu** · **Saldo laut Auszug** · **Differenz**. Saldo laut
Auszug ist der Endsaldo des **jüngsten Auszugs nach Auszugsende** (nicht nach
Importzeit — ein nachgereichter älterer Auszug schlägt ihn nicht), darunter
sein Datum; ist die Auszugsdatei ein Quelldokument (gleiche `stored_file_id`),
öffnet der Betrag den Beleg-Drawer über `?document=`. Ohne Saldo steht „kein
Auszugssaldo". Saldo neu ist eine Brücke: DATEV-Stand ab
Wirtschaftsjahresbeginn, dazu die freigegebenen Zeilen jedes Ludwig-Stapels,
den DATEV noch nicht hat (der aktuelle gesondert), und freigegebene Sätze ohne
Stapel, die einzeln nicht im DATEV-Bestand stehen — Vorschläge zählen nie. Ein
Stapel hat DATEV, sobald ein lebender Spiegel-Satz zu ihm gehört (ID-Kante oder
`export_ref`); dann zählt der ganze Stapel nur über DATEV, nie nach Datum, weil
DATEV und Ludwig denselben Monat parallel buchen. **Aufgeklappt** steht nur die
Brücke in drei Zeilen — letzter Stand DATEV · ± dieser Stapel · = neuer Saldo;
„Frühere Stapel, in DATEV noch nicht angekommen" und „Freigegeben ohne Stapel"
kommen je als eine Zeile dazu, **nur wenn ≠ 0**, sonst wiche der neue Saldo
still von der Zeile ab. Darunter der Rest-Satz, wenn offene Umsätze die
Differenz nicht erklären (Buchung ohne Auszugszeile, falscher Monat, Auszug
unvollständig), und ohne Eröffnungswert aus DATEV der Hinweis, dass der Saldo
ohne Anfang läuft — ohne ihn ist ein stimmender Saldo gelb. **„Buchungen
anzeigen"** setzt `?bookings=<Konto>` und zeigt die freigegebenen Sätze dieses
Stapels auf dem Konto als Tabelle (`loadBankAccountBatchLines`, dieselbe Menge
wie „dieser Stapel"), darunter die Umsätze ohne freigegebene Buchung als
Kontoauszug-Ausschnitt (`BankTransactionExcerpt`, bank.md R19) mit der
Zusatzspalte „Grund" und dem Link „Gesamten Kontoauszug öffnen" (Vollansicht
mit Filter „nicht gebucht"); ein Wert, der zu keinem Konto passt, wird ignoriert. *Warum:* Top
Fahrrad 07-2026, 50,03 € Esso als Vorschlag ohne Freigabe, Schritt 4 meldete
„sauber". Am Ende der Karte steht als eigene Zeile **„Zahlungskonten ohne
Umsätze"**: Konten ohne Umsatz und Buchung im Zeitraum — grau, aber **gelb,
wenn der Vormonat Umsätze hatte** („Vormonat n Umsätze, jetzt keine — fehlt
ein Auszug?"; derselbe Zähler wie in Schritt 1,
`application/statement-coverage.ts`). Die Bank-Prüfpunkte der Gates 2a und 4d
(zugeordnet · gebucht · Sammelsachverhalte gehen auf · Zentralregulierung nur
mit Befund, `BANK_CHECK_LABELS`) stehen **nur im Prüfprotokoll, Schritt 8**;
Schritt 4 zeigt sie nicht noch einmal (F255). Rail-Zähler und Prüfprotokoll
rechnen sie unverändert.
**„Verrechnungskonten"** (`application/clearing-balances.ts`,
`ui/ClearingAccountsCard.tsx`, F243) teilt die bestätigten Verrechnungskonten
in drei Gruppen: mit Bewegung im Zeitraum → **„Im Stapel bebucht"**, egal
welcher Saldo, aufgeklappt immer die Zeilen mit Datum, Gegenkonto (Nummer und
Name, öffnet den Konto-Drawer, F255), Betrag und Sachverhalt als das „warum" (höchstens 200 je Konto, der Rest über das
Konto-Blatt); ohne Bewegung mit Saldo → „Saldo offen ohne Bewegung"; ohne
Bewegung und auf null → eingeklappt „Ausgeglichen (n)". Saldo (zum
Periodenende) und Bewegung rechnen **mit Vorschlägen wie Gate 4d** — anders als
der Bankabgleich, dort zählen Vorschläge nie. Offene Vorschläge (Zweig
`proposed`, im Zeitraum) stehen als Warn-Callout über der Karte mit Link auf
Schritt 3, Vorschlagszeilen tragen das Badge „Vorschlag"; `client_import`
zählt als Bestand. *Warum:* Gate 4d rechnet mit Vorschlägen; Schritt 4 zeigt
dieselbe Zahl und sagt, was davon noch nicht freigegeben ist (Owner). Null ist
grün, ein Rest gelb; Konten ohne Zielsaldo null (`shareholder`,
`payroll_liability`) tragen ihren Saldo ohne Warnung. Nie ein Blocker — Gate
4d hält den Stapel bei Zielsaldo-null-Konten ohnehin auf.

| Bedingung (Vorrang von oben) | Stand | Text |
|---|---|---|
| keine Umsätze und keine Buchungen im Zeitraum | grau | in diesem Zeitraum nicht bebucht |
| Bankkonto ohne Auszugssaldo | gelb | kein Auszugssaldo hinterlegt |
| Kasse/PayPal ohne Auszug | grün | Saldo Buchhaltung, kein Auszug |
| Differenz ≥ 0,005 € | rot | Differenz … € |
| Differenz 0, kein EB-Wert im Spiegel | gelb | stimmt — ohne EB-Wert im Spiegel |
| sonst | grün | stimmt mit dem Auszug überein |

**Schritt 1** (F220) führt die Belege in **drei disjunkten Zeilen** — in der
Periode (rot, wenn offen) · vor der Periode (Altlast, gelb, nie rot) · nach
dem Zeitraum (F203, gelb) — nichts steht doppelt; ein Beleg ohne Datum zählt
zur Periode. Zugeklappt zeigt jede Zeile nur Ampel, Prüfung und Zahl; der
Satz, was sie prüft (`ReadinessRow.hint`), steht **aufgeklappt** über den
Posten — kein Tooltip (Owner 2026-09-18, vorher sichtbar in der Zeile). Die **Kontoauszüge**
stehen als eigener Block je Zahlungskonto (`domain/statement-coverage.ts`,
`application/statement-coverage.ts`): Konto mit DATEV-Nummer, erste und
letzte Buchung im Zeitraum, Anzahl der Umsätze, daneben die **Anzahl des
Vormonats** als Plausibilität, Stand nach A7 — rot bei Gate-1a-Blocker oder
Deckungslücke (F141) oder wenn ein Konto still geworden ist (0 Umsätze,
Vormonat > 0), gelb bei mehr als fünf umsatzlosen Tagen vor Periodenende,
sonst grün. Bei der Stufe „Sollte kommen" ist rot ohne Gate-1a-Blocker gelb
(Lücke, still geworden); ein Blocker wie der Saldenanschluss bleibt rot.
Eine **Kreditkarte** folgt `bank.md` R15f: ohne Abbuchung auf der Bank grün
(„Kartenabrechnung kommt im Folgemonat"), mit Abbuchung und ungedecktem Vormonat
gelb, nachgefordert wird der Vormonat; Ruhe und Lücke gelten für sie nicht.
Oben stehen die Konten mit Auszugserwartung Pflicht oder „Sollte kommen" (`bank.md`
R15a/R15b), die übrigen gültigen Zahlungskonten eingeklappt unter
„Weitere Zahlungskonten"; ein roter Stand wird nie eingeklappt
(`isStatementCoverageActive`, `partitionStatementCoverage`). Die Kontozeile
öffnet den Konto-Drawer (`?account=`); der Saldo
wohnt **nur** in Schritt 4 (Owner). Der Rail-Zähler für Schritt 1 bleibt an
der Checklisten-Zeile `statements_complete` (Gate 1a).
Was dem Mandanten **fehlt**, steht in Schritt 1 als Zeile „Fehlende
Belege beim Mandanten": aufgeklappt die wartenden Sachverhalte — je Zeile
Nummer und Titel, dahinter Gegenpartei · Datum · Betrag · Referenz ·
Verwendungszweck (F254) —, darunter der Knopf, der den Mail-Entwurf zur
Nachforderung als Modal öffnet (F185). Verschickt wird aus dem eigenen
Postfach: „Im E-Mail-Programm öffnen" (`mailto:` mit Betreff und Text, ohne
Empfänger; über 1800 Zeichen nur ein Hinweissatz im Body) oder kopieren, als
Text oder formatiert. Der Entwurf hat die Reiter „Text" (bearbeitbar) und
„Formatiert" (Vorschau, aus demselben Text abgeleitet); einen Direktversand
aus dem Dialog gibt es nicht (Owner-Entscheid). Sie ist
Auskunft und Werkzeug, **kein Gate** — die Belegzeilen darüber listen
vorhandene, unerledigte Belege, diese die fehlenden. Die Mail nennt außerdem
die Sammeldokumente, aus denen nicht alle Seiten gebucht sind, mit
Seitenbereichen und unabhängig von der Monatsauswahl (F236, kein PDF-Anhang);
der Knopf erscheint deshalb auch ohne fehlende Position. Darunter steht der
Block **„Kontoauszüge"**: Konten mit Pflicht oder „Sollte kommen", deren
Auszug im Zeitraum fehlt (ab der Deckungsgrenze bzw. der ganze Zeitraum ohne
Auszug und Umsatz) — nicht bei einem unverarbeiteten Auszugs-Beleg, der liegt
schon vor. Sie zählen in der Ampel der Zeile mit und stehen als eigener Block
im Mail-Entwurf (`missingStatementRequests`).
Die Zeile „Belege ohne Buchung" zeigt zehn — je Beleg mit „Zurück an den
Agenten" (Einwand, R14d) — und führt in eine **Detailansicht** desselben
Schritts (`?view=unbooked`, die Seitenleiste bleibt): alle Belege als
aufklappbare Tabelle mit derselben Aktion. Belege, die Teil eines
Sammeldokuments sind, stehen in Vorschau und Detailansicht unter dem
Sammeldokument (in der Vorschau als Baum: Kopf „Geteilte Sammel-PDF · n Seiten",
darunter der Dateiname, eingerückt mit Baumlinie die ungebuchten Teile; eine
Linie trennt Beleg von Beleg): es ist die Wurzel über verschachtelte Splits, die Seiten sind
absolut, ersetzte und gelöschte Teile sowie Textdubletten zählen nicht; die
Teile tragen die Achse `document_booking` (gebucht / ohne Buchung / offen,
Prädikat wie `listUnbookedDocuments`). Gelöschte Belege und Textdubletten (R36)
stehen nicht unter „Belege ohne Buchung": sie sind verworfen, nicht bewusst
ungebucht, und gehören deshalb auch nicht in die Nachforderung. Der
Beleg-Drawer der Abnahme trägt den Knopf im Fuß, nur bei Belegen mit
Verzichtsgrund (F220).
Eigene **Oberflächen** hat sie sehr wohl: „kein zweiter Editor" heißt, dass der
v2-Editor den alten ersetzt, nicht dass die Abnahme mit dem alten auskommen
muss (F123 §0.2).

**Das Grundmuster jedes Schritts** ist Todo-Liste plus Detail: links die Punkte
mit Zustands-Icon (offen · erledigt · bearbeitet · zurückgegeben · Frage offen
· übersprungen), Titel und Nebenzeile; rechts der eine Punkt, an dem gerade
gearbeitet wird, in einer Karte, die beim Scrollen stehenbleibt. Die Auswahl
läuft über einen **eigenen Such-Parameter** (`?fall=`, `?sel=`) — nicht über
den Drawer-Param (R8). Nach jeder Entscheidung springt die Auswahl zum nächsten
**offenen** Punkt; wer nur durchsieht, schaltet das ab.

Das **Gewicht** liegt dort, wo gearbeitet wird. Wird im Detail gelesen und
geschrieben (Schritt 2: Rückfrage lesen, antworten), ist die Liste schmal und
das Detail breit und mitscrollend (`MasterDetail detailBreit`). Ist die Liste
selbst die Arbeitsfläche (Schritte 5 und 6: Zahlenspalten), bleibt sie breit
und das Detail schmal und stehend.

Schritt 2 führt fünf Gruppen: Fragen an die Kanzlei · Fragen an den Mandanten
· **Beantwortet — wartet auf den Agenten** · Erledigt · **Technische Details**
(F218, ehemals „Overrides des Agenten") — die Stellen, an denen der Agent ein
rotes Gate bewusst übergangen hat. Sie stehen **zuletzt**, bleiben aber
quittierpflichtig („n zu quittieren"; Schritt 8 zählt sie). Die letzten drei
starten zugeklappt. „Wartet auf den Agenten" = beantwortet, Sachverhalt liegt
beim Agenten (`disposition='agent'`, nicht geschlossen) und seit der Antwort hat
kein Durchgang des Stapels begonnen (`awaitingAgent` in
`application/batch-clarifications.ts`). Ist keine Frage mehr offen, zeigt das
Detail ohne Auswahl einen großen grünen Haken („Alle Klärungsfragen erledigt");
warten noch Antworten auf den Agenten, heißt er „… beantwortet" und verlinkt die
Rückgabe (`review/return`).
Im **Detail einer Rückfrage** steht oben der Link zum Sachverhalt, darunter
Frage, Status und Quellen — Konto-Quellen mit vollem Kontonamen, sie öffnen den
Konto-Drawer — und der Block **„Kontext"**: Konten · Zahlungen · Buchungen des
Sachverhalts (`application/clarification-context.ts`), je aufklappbar; jede
Zeile öffnet ihren Drawer statt einer anderen Seite, damit die halb getippte
Antwort stehen bleibt (F255). Unter dem Antwortfeld stehen nur die zwei
Antwort-Knöpfe.

**Wer antwortet, sagt auch wohin**: In Schritt 2 speichert die Kanzlei eine
Rückfrage-Antwort über einen von zwei Knöpfen — „Antwort speichern und selbst
korrigieren" (der Sachverhalt bleibt auf `disposition='accounting'`) oder
„Antwort speichern und zurück an KI" (`disposition='agent'`, er landet im
Agenten-Korb). Beide rufen denselben Klärungs-Kern und routen danach über
`routeCaseAction`; die Wahl des Menschen sticht das aus dem Fragesteller
abgeleitete Routing. Ein Fall, der mit der Antwort geschlossen wurde, bleibt
geschlossen.

**Agententext ist Markdown**: Rückfragen, Antworten und Begründungen laufen
durch `@/ui/Markdown`, nie als roher Absatz. **Quellen werden verlinkt**, wo
die Referenz auflösbar ist (`RationaleSources` mit `hrefFor`); der Rest bleibt
eine stumme Marke statt eines toten Links. Und **neben jeder vorgelegten
Handlung steht ein Freitextfeld** — vorgelegte Antworten sind ein Angebot, kein
Menü (Regel S13).

**Tastatur** ist Zusatzweg, nie einziger Weg: `0`–`8` springen auf den Schritt,
`Ctrl/⌘+9`/`+0` auf Übergabe und Nachlese, `J`/`K`/`Enter` durch die Liste,
`A`/`E`/`R`/`F` am gewählten Punkt, `?` öffnet die Legende. **Jede Taste steht
sichtbar am Knopf**, den sie auslöst — die Zielgruppe öffnet Ludwig alle zwei
bis vier Wochen und soll nichts auswendig können müssen.

**Der Rail zeigt, wo Arbeit liegt**: je Schritt ein Ampelpunkt (neutral · offen
· erledigt · blockiert) und ein Zähler in Worten („14 von 116 offen", „bereit",
„3 Blocker"). Beides zusammen, weil Farbe allein kein Signal ist. Gerechnet
wird das **einmal je Request** (`application/rail-status.ts`, `React.cache`)
aus denselben Quellen, die die Schritte selbst zeigen — „6 von 58" heißt im
Rail und in Schritt 8 dasselbe. Der Rahmen rendert Kopf, Banner und
Schritt-Inhalt, ohne auf den Rail zu warten; Rail und Fortschritt streamen nach
(`Suspense` in `ReviewFrame`), Zurück/Weiter rechnet aus `stepAccess`, nicht
aus dem Rail.

**Der Rail zählt, er prüft nicht teuer.** Der Probe-Export rechnet die
DATEV-Zerlegung *aller* noch nicht exportierten Sätze des Mandanten und kostet
Sekunden; er lief auf jedem der elf Schritte mit, nur damit der Rail einen
Zähler hat. Gerechnet wird er jetzt dort, wo er zählt: in Schritt 8 und im
Freigabe-Guard (`getReleaseChecklist(…, { probeExport: true })`) — im Rail
fehlt die Zeile, statt grün zu lügen. Dieselbe Trennung führt Gate 4d schon
für den Agenten (`expensive`). Ebenso bleibt der DATEV-Spiegel-Abgleich der
Gates 3a–3e in der Checkliste aus (`mirrorCheck: false`): er kostet Sekunden
und die Abnahme zeigt seine Warnungen gar nicht — **der Agent behält ihn
überall**, denn er soll die Doppelbuchung sehen, bevor er bucht.
*Warum:* die Abnahme lud sonst ~6 s je Schritt (Owner 09.09.2026).

**Schritt 0 trägt eine Botschaft** (F219, Owner-Durchgang 2026-09-15): „Der
Agent ist fertig" — oder „an n Stellen nicht fertig". **Fertig heißt: jeder
Posten ist gebucht oder hat eine Rückfrage** (Owner 2026-09-18). Darunter
klappt die Checkliste seiner Aufgaben auf — erledigte (✓) und offene, je mit
Sprung (`cases_proposed` springt in die Gruppe „Ohne Vorschlag" von Schritt 3).
Gelesen wird **dieselbe** Freigabe-Checkliste wie in Schritt 8
(`getRailChecklist`, einmal je Request; `domain/agent-done.ts`): Agentenarbeit
sind die Zeilen mit Sprung auf 0–7 ohne die vier Kanzlei-Zeilen (Kontoauszüge
lückenlos, Buchungen freigegeben, Rückfragen beantwortet, Konventionen
entschieden) — Übergabe und Nachlese sind es ebenfalls nicht. Einen fehlenden
Auszug kann der Agent nicht beschaffen: die Lücke ist Vollständigkeit
(Schritt 1 / Freigabe), keine Agentenarbeit (Owner 2026-09-21). Wo die Freigabe strenger rechnet, trägt die
Zeile `agentDone`: Umsätze mit offener Rückfrage statt Vorschlag zählen als
erledigt (`asked`, „davon n mit Rückfrage"), und in 4d wartet ein Umsatz, der
nur einen Vorschlag trägt (F201), auf die Kanzlei, nicht auf den Agenten.
Einen eigenen Start-Knopf gibt es nicht (Owner 2026-09-21): übernommen wird im
Banner („Prüfung übernehmen"), weiter geht es über „Weiter" im Kopf. Darunter drei
Fakten (`application/batch-facts.ts`): **Belege verarbeitet** x von y
(`docsInPeriod` minus Gate 3f), **Bank-Transaktionen zugeordnet** x von y
(`loadBankBookingCoverage`), **Bank gebucht** dd.mm. – dd.mm.yyyy (min/max
`booking_date` der Sätze des Stapels ohne Storno; „noch nichts gebucht" ohne
Satz). Beim Mandantenstapel entfallen die drei Fakten (Schritte 1/3/4 gelten
dort nicht) und es steht „Personenkonten vollständig" (F165). Die frühere
Prüfung-Tabelle (eine Zeile je Rail-Schritt) und die sechs Kennzahl-Kacheln
sind weg — sie beantworteten „wie viel", nicht „bin ich dran". Ebenso die
Tabelle „Durchgänge" und der Diff-Block „Seit Ihrer letzten Abnahme-Runde"
(Owner 2026-09-21): die Durchgänge stehen am Stapel (Tab „Durchgänge"). Es
bleibt der Übergabebericht des letzten Durchgangs. Er ist
Agent-Markdown mit fester Struktur — drei Abschnitte „Was gemacht wurde",
„Auffälligkeiten", „Was jetzt zu tun ist", ohne Schritt-Kürzel und Tool-Namen;
die Vorlage steht im Playbook (`agent-playbooks.md` „5a — Bericht").

**Schritt 5** beginnt mit der **OPOS-Gesamtübersicht** (F221, Owner
2026-09-15: Achse Kreditoren / Debitoren, beide Quellen): zwei Zeilen
**Kreditoren** (wir schulden) · **Debitoren** (uns schuldet man), je Zeile das
Wertpaar aus Schritt 6 (`ui/SourcePair.tsx`) — oben DATEV „n Posten · Summe"
aus dem OPOS-Spiegel zum Periodenende (`getOposStichtag`), unten in Blau Ludwig
„n erwartet · Summe" aus den offenen Zahlungs-Erwartungen
(`application/open-items-overview.ts`; die Abbildung Richtung → Seite steht
dort einmal: `outgoing` = Kreditor, `incoming` = Debitor, alles andere ist ein
Fehler). Der Kopf nennt den Stichtag des Spiegels und den Abruf — sonst
vergleicht man Stände; ohne Spiegel steht „kein DATEV-Stand", kein Fehler. Der
Side-Link „Alle offenen Posten" führt auf `[year]/open-items?cutoff=<periodTo>`
— die Volliste bleibt dort, die Abnahme zeigt den Ausschnitt zum Periodenende.
Schritt 5 hat **zwei Reiter** (`?tab=`, Helfer `ui/step-tabs.ts`), beide mit
demselben Segment Debitoren | Kreditoren (`?side=`, Default Debitoren) — die
Seite bleibt beim Reiterwechsel stehen.
**Offene Posten**: Auf der gewählten Seite steht je
Personenkonto ein Ausklapper, sortiert nach Kontonummer; der Kopf zeigt Konto
(Link auf den Konto-Drawer) · Posten · Summe Rest · ältesten und neuesten
Rechnungstag · höchste Mahnstufe. Darin steht eine Zeile je DATEV-Posten mit
dem **Ludwig-Sachverhalt** und seinem Beleg (`?document=`), wenn Personenkonto
+ Belegnummer genau einen Fall tragen: OPOS-Anker `mirror-opos:<opKey>` ∪
Rechnungsseiten-Zeilen der effektiven Sicht, Belegnummer nach F230
(`application/open-item-cases.ts`). Sonst bleibt die Zelle leer, geraten wird
nicht. Zahlungserwartungen ohne DATEV-Posten stehen am Konto als „nur Ludwig
erwartet"; die Spalte „Zahlungserwartung" zeigt Ludwigs Reife (Achse
`expectation_maturity`, keine Mahnstufe). **Mahnwesen**: die Erwartungsliste
(überfällig · in Frist · wartend) der gewählten Seite, mit Klärung an den Mandanten und Wiedervorlage;
im Detail der eindeutig zugeordnete DATEV-Posten. Das Mahnwesen selbst bleibt
DATEV (R4).

**Schritt 3**, Reiter „Wahrscheinlich richtig", endet mit dem zugeklappten Ausklapper
„Dauersachverhalte ohne Sollstellung in diesem Stapel" (F228,
`application/rules-without-proposal.ts`): die aktiven Regeln ohne lebenden Satz
im Stapel, ausgegraut, je Zeile Rhythmus, Betrag und „zuletzt gebucht am … ·
Stapel …" — Auskunft, keine Aufgabe, damit ein Quartals- oder Jahresfall nicht
für verschwunden gehalten wird.

**Schritt 8 „Prüfprotokoll"** (F246, `ui/Step8.tsx`) ist eine Tabelle der
Prüfpunkte in **Schritt-Reihenfolge**: Kontoauszüge lückenlos · Belege
bearbeitet (1) · Rückfragen beantwortet (2) · Sachverhalte mit
Buchungsvorschlag · Buchungen freigegeben · Probe-Export fehlerfrei (3) · die
Bank-Prüfpunkte, nur hier (zugeordnet · gebucht ·
Sammelsachverhalte gehen auf · Zentralregulierung ausgeglichen nur mit Befund)
· Neue Konventionen entschieden (7); im Mandantenstapel zuletzt
„Personenkonten vollständig". Spalten: Zeichen · Prüfpunkt · **Stand** (was
offen ist als Zahl — „3 offen", „erledigt", „quittiert"; nie „0 von 1") ·
**Was zu tun ist** (ein Kanzlei-Satz je Zeile und darunter ein Link, der die
Handlung nennt, z. B. „Belege ohne Buchung öffnen →"; hat die Zeile genau
einen Befund mit Ziel, führt er direkt dorthin) · Quittung. Eine offene Zeile
mit Befunden **klappt auf**: je Befund der Gegenstand, verlinkt auf sein
Objekt (Auszugszeile, Beleg, Sachverhalt, Konto — `findingHref`), darunter ein
Kanzlei-Satz nach Befundart; gedeckelt bei 20, dann „… und n weitere im
Schritt". Offene Posten (5), Plausibilität (6) und „bleibt bei DATEV" (AfA,
BWA, UStVA) sind **keine Zeilen**, sondern ein Satz unter der Tabelle.
*Warum:* die Tabelle ist das Protokoll der Freigabe — was sie nicht bedingt,
gehört nicht hinein, und was die Kanzlei tun soll, steht als Satz da statt als
Tooltip voller Codes (Owner-Entscheid zu F246).

**Schritt 8** hat zwei Ausgänge (`ui/ReviewExits.tsx`, Anker `#exits` — „Weiter"
springt auf dieser Seite dorthin, nicht nach Schritt 9). **Freigeben** schreibt
seit F228 hier, über denselben Kern und dieselbe Komponente wie Schritt 9
(`releaseBatchAction`, `HandoverActions mode="release"` inkl. Override-
Checkbox); ist der Stapel freigegeben, steht dort der Link zu Schritt 9 (F123
T123.7 „der Knopf navigiert nur" ist zurückgenommen). **Zurück an den Agenten**
ist ein Kasten mit dem ausklappbaren Rücklauf-Korb (eine Query,
`application/return-basket.ts`): abgelehnte Sätze · beantwortete Fragen an
Kanzlei/Mandant · offene Fragen an den Agenten · verworfene Konventionen ·
zurückgesetzte Belege · die Rückgabe-Notiz.

**Schritt 7** erklärt sich in einem Lead (Konventionen sind abgeleitete
Regeln; beobachtete gelten sofort, bestätigte widerruft der Agent nicht) und
beschriftet je Regel **Regel · Warum · Gilt für · Stand**; die Konventionen des
Mandanten insgesamt wohnen im Profil (`configuration/profile#conventions`),
Schritt 7 verlinkt sie nur (F218).

**Schritt 6** stellt neben den Ist-Saldo des laufenden Monats die Spalte
„Dieser Stapel": die Summe der **Vorschläge dieses Stapels** je Konto
(`getBatchContribution`, nur `status='proposed'`, Personenkonten wie sonst
draußen). Sie ist Auskunft und zählt **nicht** in die Abweichung — der
Vergleich misst Ist gegen Ist, sonst verglichen wir Äpfel mit Absichten. Ein
Konto, das erst dieser Stapel bebucht, steht deshalb mit leerem Vergleich in
der Liste, aber es steht da (F197).

Was der Bestand nicht hergibt, bleibt **leer statt geraten**: kein
Platzhalter-Kasten, keine erfundene Begründung, keine Kette, die es im Schema
nicht gibt. Der Leerzustand sagt, was fehlen würde und warum. „Leer statt
geraten" gilt aber erst, wenn nachgewiesen ist, welche **Spalte, Kante oder
Kern** fehlt — nicht, wenn nur ein Read fehlt.
*Warum:* Ein zweiter Kern, eine zweite Klärungs-Mechanik oder eine zweite
Gate-Definition laufen innerhalb eines Quartals auseinander — dann sagt
dieselbe Prüfung an zwei Orten etwas anderes, und niemand weiß, welche gilt.

### R17 — Die Stapel-Seite zeigt beide Seiten und leitet den Prozess ab
`clients/[slug]/[year]/batches` ist **eine Zeile je Zyklus, Ludwig und DATEV
nebeneinander**: links, was Ludwig bearbeitet hat, rechts, was DATEV daraus
gemacht hat (`datev_sequence_id`, Spiegel-Zahl, Abweichungen). Die fünf Tabs
filtern die Herkunft — `Nur DATEV` sind Stapel, die es in Ludwig nie gab —, sie
wechseln nie die Optik: dieselben Spalten in jedem Tab.

**Prozessbild und Staffelstab sind Ableitungen aus dem Zustand, kein zweites
Feld** (`domain/batch-process.ts`, Deckungstest gegen die Achse
`zyklus_stapel`). Der Strip zeigt vier Phasen (buchen · prüfen · übertragen ·
angekommen), der Staffelstab „wer ist dran" als Icon **und** Wort. Beide leben
in `@/ui/v2` und kennen kein Fachmodul — sie bekommen Phasen und Besitzer als
Props, sonst wäre das Prozessbild an den Stapel gefesselt und der nächste
Prozess bekäme ein zweites.

Das Detail hat **sechs Tabs** (Übersicht · Durchgänge · Buchungen · Artefakte ·
DATEV · Log). Das Log kennt drei Sichten mit steigender Tiefe — **Verlauf**
(was ein Mensch erzählen würde) · **Protokoll** (jeder Zustandswechsel) ·
**Technik** (auch Agent-Schritte) — plus einen Fehlerfilter und die
**Staffel-Leiste**: die Zeit zwischen den Zustandswechseln, eingefärbt nach
Besitzer. Sie beantwortet „warum hat der August drei Wochen gedauert?" in einem
Blick, ohne dass irgendwo eine Dauer gespeichert wäre.

„Stapel anlegen" ist ein **Dialog mit Server-Vorschau**: dieselbe Funktion, die
danach anlegt (`planManualBatch`), sagt vorher, was entsteht — Nachtrag,
regulär oder Konflikt mit Namen des offenen Stapels.
*Warum:* Eine nachgerechnete Vorschau ist eine zweite Wahrheit; sie stimmt so
lange, bis jemand die Anlage-Regel ändert und die Vorschau vergisst.
### R19 — Geteilte UI importiert die Datei, nicht das Barrel
`@/ui/status` und `@/ui/components` re-exportieren auch Komponenten, die ein
Fachmodul laden (`FlowModal` → `@/modules/invoices`, `AppShell`/`UserMenu` →
`@/modules/auth`). Wer aus einem dieser Barrels importiert, zieht den halben
Server-Graphen mit — inklusive `postgres`. In der App fällt das nicht auf, weil
Next die Grenze zieht; in Storybook stirbt die Story an `Buffer is not defined`.

**Innerhalb von `@/ui` gilt deshalb: die Datei importieren, nicht das Barrel** —
`@/ui/status/status-registry` statt `@/ui/status`, `@/ui/components/primitives/Badge`
statt `@/ui/components`. Zwischen `@/ui` und den Fachmodulen bleibt es beim
Barrel (`<modul>/server`, `<modul>/client`), dort zieht die Lint-Regel die
Grenze.
*Warum:* Ein Zyklus zwischen zwei Barrels (`ui/status` ⟷ `ui/components`)
verbindet alles mit allem. Der Fehler zeigt sich nicht dort, wo er entsteht,
sondern in einer beliebigen Story, die zufällig einen Badge rendert.

### R20 — Ein Reiter beantwortet *was*, eine Sicht *wie angesehen* — nie beide dieselbe Frage
Das Grundmuster aus R16 (Todo-Liste links, Detail rechts) trägt Schritt 3
nicht: „Stimmen die Vorschläge?" zerfällt in **zwei verschiedene Fragen**, und
jede verlangt eine andere Oberfläche.

Die Aufteilung steht deshalb auf **zwei Ebenen mit je einer Frage** (F186):
oben die Reiter **Bitte anschauen | Wahrscheinlich richtig | Mandantenstapel |
Freigegeben** (`?tab=needs_review|likely_correct|client_batch|released`, F232) —
*welche Fälle?*; innen das Dropdown **Darstellung** mit drei Werten (F218,
`domain/step3-view.ts`): **Buchungen gruppiert nach Satzart** (`grouped`,
Vorgabe ohne Parameter) · **Buchungen sortiert nach Datum** (`by_date`) ·
**nach Sachverhalten** (`by_case`, die frühere Liste nach Nummer — nur der
Name änderte sich, Owner 2026-09-15) — *wie sehe ich sie an?*. Das
**Fall-Vollbild** (`view=case`) steht **nicht** im Dropdown: dorthin führt der
Klick auf einen Sachverhalt oder Satz, zurück der Pfeil des Pagers in die
zuletzt gewählte Darstellung (`?back=`, sonst `grouped`). Alte Werte
(`overview`, `list`) werden beim Lesen abgebildet. Bis F186 stand „Liste" auf
**beiden** Ebenen und meinte zweierlei: ein Reiter neben den Arten und eine
Sicht neben „Sachverhalt", mit zwei Tabellen über zwei verschiedene Vorräte.
Alte Reiter-Werte aus Lesezeichen (`recurring`, `single`, `liste`) landen auf
dem Standard-Reiter; `?tab=liste` startet dort in `by_case`.

Die Reiter (Design `Buchungsreview.dc.html` → Screen 3) trennen das Offene seit
F232 nach **Prüfbedarf** (`buchung.md` R17, `scoreCasesForReview`,
`domain/review-tabs.ts`): **Bitte anschauen** (Score ab der Schwelle oder ein
harter Grund) · **Wahrscheinlich richtig** (der Rest) · **Mandantenstapel**
(`origin = 'client_import'`, nur gerendert, wenn er etwas enthält) — und
dahinter **Freigegeben** (`released`, kein Prüfbedarf, deshalb nicht in der
Achse `review_tab`): alles Entschiedene. Ein Fall **wandert** nach der
Entscheidung dorthin; die offenen Reiter sind reine Arbeitsvorräte, einen
Filter „nur offene" gibt es deshalb nicht (Owner 2026-09-21). Die Zahl am
Reiter zählt seine Fälle; ohne `?tab=` beginnt die Arbeit beim ersten Reiter
mit etwas Offenem, ist nichts mehr offen, bei „Freigegeben". Die Köpfe stehen nach Score absteigend,
dann Betrag. Die Zählzeile darüber lautet „{offen} Vorschläge offen — n bitte
anschauen, m wahrscheinlich richtig{, k Mandantenstapel}", der
„Ohne Karte"-Abgleich (F200) rechnet gegen die Summe der drei. *Warum:* bis
F232 trennten die Reiter nach Herkunft (Wiederkehrende/Einzelfälle, F202) und
zeigten sichere und unsichere Sätze gleichrangig — die Frage des Prüfenden ist
aber, wo er hinschauen muss.
**Unter den Reitern** steht die Gruppe **„Ohne Vorschlag"** (F217,
`application/cases-without-proposal.ts`): die offenen Fälle am Stapel ohne
lebenden Satz — Schritt 8 zählt sie als „ohne Buchungsvorschlag" und springt
mit `#without-proposal` genau hierher; je Zeile „In den Folgemonat"
(`deferCaseToNextCycle`, derselbe Kern wie das Agent-Tool
`defer_case_to_next_cycle`) und „Zurück an den Agenten". Leer wird sie nicht
gerendert.

Alle Reiter sind **eine** Komponente (`Step3Single` mit `tab`), die Wörter
unterscheiden sich, Sichten, Filter, Hotkeys und Aktionen nicht — bis auf
„**Alle übernehmen (n)**" im Reiter „Wahrscheinlich richtig": fragt nach
(„n Sachverhalte ohne Einzelprüfung freigeben?") und gibt dann alle offenen
Fälle des Reiters über `acceptCasesAction` frei, was der Kern an einem
roten Punkt ablehnt, benennt die Meldung (`buchung.md` R17a):

- **Regelgebuchte Fälle** (`domain/rule-booked.ts`: alle Sätze
  `origin='recurring_rule'`) — die Frage ist „ist die Zeile wie im Vormonat?";
  die Antwort steht im Aufklapper **rechts** in der Kontext-Zone „Regel &
  Periode" (Modus, Vorlage-Betrag, Intervall, Periode, Vormonatsvergleich,
  offene Klärung). Wer 30 Mieten prüft, hakt sie in der Übersicht gesammelt ab.
- **Der einzelne Fall** (`view=case`) — ein Fall füllt den Bildschirm, aufgebaut in
  Zeilen (F181): oben Sachverhalt links, Gegenpartei rechts; dann **je
  Buchungssatz eine Zeile** mit dem `BuchungssatzEditor` samt Prüfpunkten links
  und dem, was am eigenen Ereignis dieses Satzes hängt, rechts — „Beleg & USt" oder
  „Zahlung", beides zusammen, wenn beides da ist, sonst „Ohne Beleg und
  Bankzeile"; unten in voller Breite „Regel & Periode", „Notizen" und die
  Entscheidungsleiste. Die Frage ist „ist dieser Satz richtig?", und die
  Antwort braucht den Kontext neben der Zahl, nicht hinter einem Drawer — und
  zwar den eigenen: ein Sachverhalt mit zwei Belegen zeigte vorher beiden
  Sätzen denselben. Was rechts steht, entscheiden allein die Daten am Ereignis,
  nicht die Satzart; ein Aufwand mit Bankzeile statt Beleg ist kein Fehler,
  sondern die Auskunft „hier fehlt der Beleg, gebucht wurde von der
  Auszugszeile".
  Jede Satzkarte sagt in ihrem Kopf, **was für ein Satz** sie ist — Aufwand ·
  Erlös · Zahlung · Geldtransit · Umbuchung, neben „Satz n von m" als
  neutrales Badge (Satzart, GLOSSARY). Ein Fall trägt oft mehrere Karten, und
  ohne diese Auskunft muss der Prüfende jede einzeln lesen, um zu wissen,
  worauf er schaut. Die UI **liest die Spalte** `client_journal_entry.entry_kind`
  (F184) und rechnet nichts nach; gestempelt wird beim Buchen aus den **Konten**
  der Zeilen, nicht aus der Ereignisart: die sagt, woher der Vorgang kam, nicht
  was der Satz tut. Ohne Wert (Satz ohne Zeilen) zeigt die Karte **kein** Badge
  statt eines geratenen.

Die drei Sichten teilen sich **eine** Tabelle und dieselben
Worte je Zeile — Nr. · Datum · Gegenpartei · Buchung · KI-Prüfung · Beleg ·
Betrag · Prüfbedarf (die ersten zwei Gründe, **je Grund eine Zeile** ohne
Umbruch, gekürzt mit Tooltip; Kopf mit (i) der Achse `review_tab`). Das Datum steht ohne Uhrzeit, die Buchung mit Kontonamen („4930
Bürobedarf an 1200 Bank"). „KI-Prüfung" (`AiBookingNotesCell`) zeigt Urteil des
Judge und Konfidenz mit Wort; ohne Urteil und Konfidenz bleibt sie leer. Jede
Zeile klappt auf (`ui/ProposalFoldout.tsx`, für alle Reiter): links der Satz
als kompakter Journal-Viewer (`JournalEntryCard`), darunter Begründung und
Einschätzung des Judge (`AiBookingNotesBody`, ohne zweiten Kopf; beide gleich
gebaut, gekürzt mit „mehr ▾") — oder ein Satz, **warum** es keine KI-Prüfung
gibt (von Hand, Regel, Import, Storno, noch nicht geprüft); rechts, nur bei
regelgebuchten Fällen, die Kontext-Zone „Regel & Periode". Darunter zwei
Knopfzeilen (Owner 2026-09-21), entscheiden, ohne den Fall zu öffnen — erst
**Kontext**: **Beleg anzeigen** (Beleg-Drawer neben der Liste) · **Sachverhalt
anzeigen** (Fall-Vollbild) · **Gegenpartei: Name** (Partner-Drawer; ohne
Stammsatz nur Text); dann die **Antworten**: **Freigeben** · **Zurück an KI mit
Notiz** (Feld unter der Leiste, Notiz Pflicht — `returnProposalToAgentAction`,
derselbe Kern wie „Zurück an KI" im Vollbild, dort ohne Ereignis für alle
offenen Sätze des Falls; ohne offenen Satz stellt „Zurück an KI" nur die Frage)
· **Ablehnen** (Dialog, Grund Pflicht, lehnt den gezeigten Satz ab —
`rejectEntryAction`, derselbe Kern wie „Diesen Satz ablehnen" im Vollbild).
Antworten nur bei offenem Fall und schreibbarem Stapel; an einem freigegebenen
Fall steht dort **Freigabe zurückziehen** (`withdrawCaseReleaseAction` →
`withdrawCaseRelease`): Sätze zurück auf `proposed`, Fall wieder offen,
Zahlungs-Erwartungen, die erst diese Freigabe getilgt hatte, wieder offen — der
Fall steht danach wieder in seinem Reiter; abgewiesen, sobald ein Satz
übergeben ist (nur noch Storno). „Ausgewählte freigeben" fragt nicht nach —
was an einem roten Prüfpunkt hängt, benennt die Meldung danach. Ganz unten,
zugeklappt, „(?) Prüfbedarf n — Reiter": je Summand eine Zeile mit Vorzeichen,
Summe und Schwelle, bei hartem Grund die Zeile „Harter Grund — zählt
unabhängig von der Summe" (natives `<details>`, F232-T232.4b). Zurückgegebene Fälle, zu denen der Agent noch nicht
neu vorgeschlagen hat, stehen im Reiter **„Zurück an KI"** (`returned`, nur
sichtbar mit Inhalt, vor „Freigegeben", nie von selbst gewählt): aufgeklappt
Datum und Notiz über dem zurückgezogenen Satz. Die Sichten:

- **Gruppiert nach Satzart** (`grouped`) — je Gruppe Kopf mit Anzahl und
  Summe, Auswahl und Sammelfreigabe. Wer 118 Sätze abnimmt, sieht zuerst,
  *worauf er schaut*: 42 Aufwendungen, 31 Zahlungen, 12 Geldtransite. Leere
  Arten fallen weg. Sortiert wird **nach der Nummer**, nicht nach Ampel —
  sonst springt die Gruppe nach jeder Freigabe um.
- **Sortiert nach Datum** (`by_date`) — dieselben Zeilen flach, aufsteigend
  nach Buchungsdatum, Tiebreak die Nummer; ohne Datum ans Ende.
- **Nach Sachverhalten** (`by_case`) — derselbe Vorrat flach nach Nummer, mit
  Satzart als Spalte. Überblick und gezielter Sprung.
- **Fall-Vollbild** (`case`, nicht im Dropdown) — der Einzelfall wie oben
  beschrieben; die Auskunft „Danach: wird geschlossen / bleibt offen" steht
  als Nebentext in der Entscheidungsleiste, nicht als Kasten im Inhalt (F218).

**Die Nummer ist stabil und filterfest.** Sie kommt aus der
**Vergabereihenfolge** (`case_number` aufsteigend, `nulls last`, Rückfall
`created_at`, dann `caseId`) und wird **vor** jedem Filter über den ganzen
**Stapel** vergeben, nicht je Reiter — ein Fall behält sie, wenn er nach
„Freigegeben" wandert. Der Pager zeigt „Sachverhalt 47 von 118" und bei
aktivem Filter „· 12 im Filter"; vor/zurück springt durch die gefilterten, die
Nummer bleibt die aus der Gesamtliste. Nach **Belegdatum** sortiert würde ein
nachgereichter Januar-Beleg sich vorn einschieben und alle Nummern dahinter
verschieben — eine Nummer, die man notieren oder am Telefon nennen kann, wäre
das nicht.

Geladen wird **je Reiter nur, was er zeigt**, und tief nur der eine sichtbare
Fall (`?fall=`, `application/review-case.ts`). Die Kontext-Zone der
regelgebuchten Fälle kommt aus **vier** Abfragen für den ganzen Reiter
(`application/rule-context.ts`), nicht aus acht je Zeile; der Prüfbedarf aus
vier Sammelabfragen für alle offenen Karten (`scoreCasesForReview`).

Der Vormonatsvergleich ist **nicht** die Drei-Monats-Engine aus Schritt 6
(`domain/comparison.ts`), sondern `domain/previous-month.ts`: ein Dauersachverhalt hat
genau einen Bezugswert, und eine Engine, die unter zwei Vormonaten schweigt,
beantwortet hier die falsche Frage. Er steht als Zeile „Vormonat" in der
Kontext-Zone des Aufklappers.

Was das Design zeigt und der Bestand nicht hergibt, fehlt **sichtbar** statt
geraten: einen zweiten Buchungssatz je Ereignis legt der Editor nicht an
(der Editor-Kern konsolidiert auf einen Satz), Notizen sind Audit-Einträge und
deshalb ohne „Bearbeiten"/„Löschen", und „Zurückstellen" blendet für diesen
Besuch aus — eine Wiedervorlage am Vorschlag gibt es im Schema nicht.
*Warum:* Eine Oberfläche für zwei Prüffragen bedient beide schlecht. Die
Sammelfreigabe im Fall-Vollbild wäre 30 Klicks, der Kontext neben einer
Tabellenzeile passt nicht hin — und die Prüferin merkt an beidem, dass die
Anwendung ihren Arbeitsschritt nicht kennt.

### R21 — Die Übersicht trennt „Mir zugewiesen" von „Alle in der Kanzlei"
Die Übersicht (`/dashboard`) hat zwei Reiter über `?tab=`: **Mir zugewiesen**
(`assigned`, aktive Mandanten mit `responsible_user_id` = Sitzung) und **Alle
in der Kanzlei** (`all`, beim Ludwig-Team „Alle Mandanten"). Ohne Parameter
gilt `assigned`, sobald mindestens ein aktiver Mandant zugewiesen ist, sonst
`all`; ein unbekannter Wert fällt auf diese Vorgabe zurück
(`resolveDashboardTab`, `modules/clients/domain/dashboard-tabs.ts`).

Es ist **eine** Tabelle mit denselben Spalten (inklusive „Zuständig") — der
Reiter ändert nur die Zeilen (R20: der Reiter beantwortet *was*). Stillgelegte
stehen nur unter „Alle". Mandanten-User bekommen keine Reiter, ihre Liste ist
schon ihre. Die Zuständigkeit ist **keine Zugriffsgrenze**: welche Mandanten
jemand überhaupt sieht, entscheidet `listClientsForSession` (Kanzlei bzw.
eigene Mandanten), nicht die Zuweisung.
*Warum:* wer sechs Mandanten betreut, fängt bei seinen an — aber jeder in der
Kanzlei muss jeden finden können, wenn ein Kollege fehlt.

### R22 — Jede Überschriften-Ebene beantwortet eine andere Frage
Sechs Ebenen, jede mit ihrer Frage und ihrer Form:

1. **Ortszeile** — *wo bin ich?* — Pfad/Position, nur in Abläufen und tiefer
   Navigation.
2. **Seitentitel**, genau ein H1 — *was ist diese Seite?* — Substantiv,
   wortgleich mit dem Navigationseintrag.
3. **Seitenbeschreibung** — *was tue ich hier?* — ein Satz, nur wenn sie mehr
   sagt als der Titel.
4. **Box-Titel** — *welcher Teil?* — Substantiv des Inhalts, nur bei ≥ 2 Boxen.
5. **Box-Untertext** — *was zeigt der Teil, wie lese ich ihn?* — ein bis zwei
   kurze Sätze.
6. **Spalten-/Feld-/Status-Label** — spezifisch + Info-Tooltip.

Regeln:

- Keine Ebene wiederholt Wörter oder Aussage der Ebene darüber; eine Box
  allein trägt keinen Titel.
- Eine grammatische Form je Ebene: Titel = Substantiv, Beschreibung = Satz.
  Fragen sind keine Titel.
- Titel = Navigationseintrag — ein Name je Seite.
- Status, Zahlen, Daten stehen nie im Titel, sondern in Meta oder Badge.
- Anwender-Sprache: Zielgruppe sind Buchhalter und Steuerberater — keine
  internen Codes, keine Systembegriffe („Gate", „Spiegel", „Payload"), keine
  Ticketnummern.
- Handlungen stehen auf Buttons.
- Titel haben höchstens drei Wörter.
- Leerzustand: der Titel bleibt, der Untertext sagt den Zustand.
- Anrede „Sie".

Stand: angewandt in der Stapelabnahme (F244) — Schritt-Texte in
`modules/batch-review/domain/steps.ts` (`label` = Rail-Eintrag und H1,
`description` = Lead), Overline nur „Schritt n", der Stapel-Kopf nennt den
Stapel in einer Zeile. Die Rückgabe an den Agenten hat **einen** Ort: die Seite
`review/return` am Rücklauf-Korb, Overline „Rücklauf-Korb", mit „Im Korb" und
„Was dann passiert" (F253); Schritt 8 behält seine Karte und verweist dorthin.
App-weit offen → `web-ui-offen.md` P46.
*Warum:* In der Stapelabnahme sagten Overline, Seitentitel, Lead und erster
Box-Titel viermal dasselbe („Vollständigkeit" / „Ist alles da?"), keine Ebene
sagte, was zu tun ist, und der Box-Untertext erklärte Interna (Owner-Durchgang
zu F244).

### R23 — Sachverhalt-Detail: nach der DS-Vorlage, dreispaltig, lesend
Die Seite baut ausschließlich aus DS-Bausteinen nach `showcase/case/`
(F257, `modules/accounting-cases/ui/case-page/`). Jeder Reiter trägt
denselben Rahmen (`caseFrameSlots` → `CaseDetailView`): Pager, Kopf
(`EntityHeader`, ein Zustand = Lebenszyklus, Zuständigkeit als Wort in der
Meta-Zeile, Betrag nur mit Wert), nächster Schritt (`StatusCallout`, sonst
nichts), Reiter. Reiter-Satz: Übersicht · Ereignisse · Belege · Rückfragen ·
Plausibilität · Wiederkehr (nur Dauersachverhalt) · Stammdaten · Technik;
alte `?tab=`-Werte bildet die Alias-Schicht ab.
Die **Übersicht** ist dreispaltig: links der Strang (DS-`CaseTimeline`:
Ereignisse, Fragen und offene Erwartungen, die jüngsten zehn; darunter „In
DATEV gebucht" nur mit Einträgen, `MirrorEntryList`, Betrag und Konten aus
`toMirrorEntryVM`, F251), in der Mitte die Arbeitsfläche, rechts „Rückfragen
und Notizen" und „Erwartungen". Eine Auswahl im Strang ändert **nur** die
Mitte; ohne Auswahl steht dort „Zu tun" — offene Beleg-Erwartungen mit ihrem
Ausweg, die offenen Fragen an die Kanzlei zum Beantworten und die Vorschläge
als „Fehlende Freigaben". **Am Sachverhalt wird nichts freigegeben**
(Owner-Entscheid 2026-09-21): Buchungssätze stehen lesend da; Freigeben,
Ablehnen und Bearbeiten laufen über die Stapel-Abnahme.
Fragen und Notizen stehen in **einer** Karte (`ClarificationList` +
`ClarificationCard` + `ClarificationEditor`) — die Notiz ist `type =
'comment'` derselben Tabelle. Eine Antwortfläche gibt es nur bei `audience =
accounting`. Ein Schreibweg je Art: Notiz → `addCaseComment`, Frage →
`raiseCaseClarification`; Fragen an den Mandanten von Hand weist die Action
ab. Zähler und Blocker zählen nur Fragen (F249). Wer am Fall weiterarbeitet
(„zurück an Agent", „selbst buchen"), steht im Menü des Kopfs.
Saldo & Konten, Prüfpunkte, Belegnummern-Register und der offene Posten
stehen im Reiter Plausibilität; DATEV-Wahrheit, Protokoll, Herkunft und
Rohdaten im Reiter Technik.

### R24 — Kontonummern sortieren numerisch
Kontonummern liegen als `text`, sind aber Zahlen: jede Sortierung nach Konto
sortiert numerisch (1200 vor 4000 vor 10000). Im Client
`compareAccountNumbers`, in SQL `order by ${orderByAccountNumber("col")}`
(`@/shared/account-number-order`: erst Länge, dann Text — kein Cast, der an
einer Nicht-Ziffer zur Laufzeit würfe). Prüffrage bei jeder neuen Liste (F290).
*Warum:* Textsortierung stellt 10000 vor 4000 — in jeder Kontenliste sichtbar
falsch, und an 20 Stellen einzeln nachgebaut.
