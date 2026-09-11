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
  Reiter: **Übersicht · Details · Positionen · Vorsteuer · Verlauf &
  Befunde · Rohdaten** — sechs bei der Rechnung, vier beim Vertrag, drei beim
  Kontoauszug; jeder Reiter nur, wo er etwas zeigt. „Details" trägt, was mehr
  als einen Wert betrifft, Einzelwerte bleiben in der Übersicht an ihrem Wert.
  Die **Pipeline** ist seit 2026-09-09 kein Reiter mehr, sondern aufklappbare
  Tiefe im Verlauf; `?tab=pipeline` leitet dorthin (wie `?tab=buchung` und
  `?tab=beleg` auf die Übersicht). Was über dem Inhalt steht, regelt
  `belege.md` R33.
- Geschäftspartner `clients/[clientSlug]/[year]/partners` (+ Detail
  `/partners/[partnerId]`) — die Liste ALLER Partner, nicht nur der
  Kreditoren (R14).
- Konfiguration `clients/[clientSlug]/configuration/…` (Stammdaten,
  Kontenplan, Bankkonten, Onboarding, Logs, …).
- Admin `admin/…` — Übersicht, Kanzleien (mit Technikansicht je Mandant),
  User, Abnahme-Qualität, Jobs, Audit-Log, MCP-Tokens, Agent-Anleitung
  (`AdminNav.tsx`).

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
Badge-Farbe (`kind`) und Erklärtext pro Achse (`beleg`, `sachverhalt`,
`buchung`, `job`, …). Keine lokalen `STATUS_LABEL`-Maps, keine Hex-Farben
in Feature-Komponenten. Die Registry ist NICHT die Wertebereich-Quelle —
der lebt im DB-CHECK bzw. Domain-Enum; `__tests__/status-registry.test.ts`
hält beide Seiten deckungsgleich (neuer Enum-Wert ohne Eintrag = roter
Test). Achsen-Keys sind deutsch (GLOSSARY-Begriffe), Status-Werte englisch
(1:1 DB-Werte). *Warum:* derselbe Zustand muss überall gleich heißen und
gleich aussehen, und `failed`/`proposed`/`queued` bedeuten je Achse etwas
anderes.

### R5 — Eine Beleg-Shell für alle Belegarten, `source_doc_id` als Identität
Die Beleg-Detailansicht ist EINE Shell mit einem Tab-Katalog (`DOC_TABS`
in `modules/source-docs/domain/tabs.ts`: beleg · positionen · vorsteuer ·
verlauf · pipeline · rohdaten). Die Belegart bestimmt nur, welche Tabs
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
PDF, Kontoauszüge (CSV/XLSX/CAMT-XML) und DATEV-Stapel (EXTF) — was die Datei
ist, entscheidet der Server an den Bytes (`routeUploadedBytes`, belege.md R1),
nicht der MIME-Typ des Browsers. Drei Ausgänge stehen in der Liste:

- **Beleg** → Eingangszeile wie bisher (`pending_classification`).
- **Kontoauszug** → Eingangszeile mit „Angabe nötig" (`awaiting_input`) und
  einer Kontoauswahl in der Spalte „Einordnung"; ein Klick importiert und
  erledigt die Zeile. CAMT trägt die eigene IBAN und importiert sofort.
- **DATEV-Stapel** → keine Eingangszeile (der Stapel hat seine eigene Seite),
  sondern eine Meldung unter der Ablagefläche, was importiert wurde.

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
der Inhalt lädt serverseitig, Schließen navigiert auf `closeHref` zurück.
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

### R11 — Admin sieht Technik, der Arbeitsbereich sieht Fachlichkeit
Die Mandanten-Technikansicht `/admin/tenants/[tenantId]/clients/[clientId]`
beantwortet „ist der Mandant technisch gesund, was ist zuletzt passiert,
was kann ich tun": Identität, Onboarding-Zustand + Readiness,
Datenbestand-Zählwerk (`getClientTechnicalOverview`, EIN Kern-Aufruf),
Audit-Log-Ausschnitt **eingebettet** über `listAuditEvents({clientId})` +
Deep-Link — kein zweites Log-Modell. Fachliche Daten (Belege, Buchungen)
gehören in den Mandanten-Arbeitsbereich `/clients/[slug]/…`; der Link
dorthin ist der Sprung, nicht die Vermischung.

### R12 — Dauersachverhalt-UI: Zuordnung getrennt vom Regelwerk
Am Sachverhalt ist die Zuordnung (Match-Kriterien, zugeordnete Zahlungen,
`matching_note` — DATEV-Analogon: Lerndatei) ein eigener Tab, getrennt vom
Regelwerk-Tab („was wird wie oft gebucht?"). *Warum:* Lernstand und
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
Der Prüfprozess der Kanzlei (`stapel/[batchId]/abnahme/[schritt]`, Schritte
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
passieren muss (`computeBatchGates`) — der Gate-Text ist der Zeilen-Text.
Schritt 1 und 8 stellen je Umsatz zwei Fragen: Sachverhalt, Buchungsvorschlag
(F187) — in Schritt 1 ist eine offene Klärung ein zulässiger Zwischenstand
(gelb), in Schritt 8 nicht (rot), denn freigegeben wird nur ein voll gebuchtes
Bankkonto. Schritt 8 stellt eine dritte Frage: freigegeben? Eine Auszugszeile,
die nur einen Vorschlag trägt, ist dort ein Mangel (F201).
Eine **Deckungslücke aus Gate 1a** (ein Datei-Import endet vor dem
Periodenende) macht die Zeile „Kontoauszüge lückenlos" **gelb und
quittierpflichtig**: Auszug nachliefern oder begründet quittieren, und die
Quittung verfällt, sobald sich die Deckungsgrenze bewegt. Der Wortlaut wird aus
den Gate-Feldern in Menschen-Sprache gebaut (`domain/deckungsluecke.ts`), für
Schritt 1 und 8 derselbe Satz; **gerechnet wird nur im Gate**. *Warum:* der
Agent läuft autonom und kann die Lücke nicht zurückspielen — entscheiden muss
der Mensch (Owner 03.09.2026).
**Schritt 4** („Geht die Bank auf?") zeigt die Gates 2a und 4d als
aufklappbare Zeilen wie Schritt 1 und rechnet sie mit `forRelease` wie
Schritt 8 — ein Vorschlag ohne Freigabe ist kein Gebucht (F201). Darunter der
**Bankabgleich** je Zahlungskonto (`stapelabnahme/domain/bank-reconciliation.ts`):
Saldo nach Übertragung gegen den Endsaldo des jüngsten Import-Batch, der im
Zeitraum endet. Der Saldo nach Übertragung ist eine Brücke: DATEV laut Spiegel
ab Wirtschaftsjahresbeginn, dazu die freigegebenen Zeilen jedes Ludwig-Stapels,
den DATEV noch nicht hat (der aktuelle gesondert), und freigegebene Sätze ohne
Stapel, die einzeln nicht im Spiegel stehen — Vorschläge zählen nie. Ein Stapel
hat DATEV, sobald ein lebender Spiegel-Satz zu ihm gehört (ID-Kante oder
`export_ref`); dann zählt der ganze Stapel nur über DATEV, nie nach Datum, weil
DATEV und Ludwig denselben Monat parallel buchen. Die offenen Umsätze mit Grund erklären
die Differenz, ein Rest heißt: Buchung ohne Auszugszeile, falscher Monat oder
Auszug unvollständig. Der EB-Wert aus dem DATEV-Spiegel ist der Anker — ohne
ihn ist ein stimmender Saldo gelb. *Warum:* Top Fahrrad 07-2026, 50,03 € Esso
als Vorschlag ohne Freigabe, Schritt 4 meldete „sauber".

| Bedingung (Vorrang von oben) | Stand | Text |
|---|---|---|
| keine Umsätze und keine Buchungen im Zeitraum | grau | in diesem Zeitraum nicht bebucht |
| Bankkonto ohne Auszugssaldo | gelb | kein Auszugssaldo hinterlegt |
| Kasse/PayPal ohne Auszug | grün | Saldo Buchhaltung, kein Auszug |
| Differenz ≥ 0,005 € | rot | Differenz … € |
| Differenz 0, kein EB-Wert im Spiegel | gelb | stimmt — ohne EB-Wert im Spiegel |
| sonst | grün | stimmt mit dem Auszug überein |

Was dem Mandanten **fehlt**, steht in Schritt 1 als fünfte Zeile „Fehlende
Belege beim Mandanten": aufgeklappt die wartenden Sachverhalte, darunter der
Knopf, der den Mail-Entwurf zur Nachforderung als Modal öffnet (F185). Sie ist
Auskunft und Werkzeug, **kein Gate** — die Belegzeilen darüber listen
vorhandene, unerledigte Belege, diese die fehlenden.
Die Zeile „Belege ohne Buchung" zeigt zehn und führt in eine **Detailansicht**
desselben Schritts (`?sicht=ohne-buchung`, die Seitenleiste bleibt): alle
Belege als aufklappbare Tabelle, je Zeile „Zurück in die Bearbeitung" mit
Einwand an den Agenten (belege.md R14d).
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
Rail und in Schritt 8 dasselbe.

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

**Diff-Modus:** ab der zweiten Runde steht auf Schritt 0, was der Agent seit
der Rückgabe geändert hat (neu · ersetzt · beantwortet → gebucht · neue Fragen
· neue Konventionen). Warum ein Punkt *unverändert* offen blieb, sagt das
Playbook nicht — diese Zeile bleibt leer und sagt das auch.

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
`clients/[slug]/[year]/stapel` ist **eine Zeile je Zyklus, Ludwig und DATEV
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
oben zwei Reiter **Wiederkehrende | Einzelfälle** (`?tab=wk|einzel`) — *welche
Fälle?*; innen drei Sichten **Übersicht | Liste | Sachverhalt**
(`?sicht=uebersicht|liste|fall`, Vorgabe `fall` ohne Parameter) — *wie sehe ich
sie an?*. Bis F186 stand „Liste" auf **beiden** Ebenen und meinte zweierlei:
ein Reiter neben den Arten und eine Sicht neben „Sachverhalt", mit zwei
Tabellen über zwei verschiedene Vorräte. Ein `?tab=liste` aus einem Lesezeichen
landet heute auf `?tab=einzel&sicht=liste` statt im Leeren.

Die Reiter (Design `Buchungsreview.dc.html` → Screen 3) trennen nach der
**Herkunft der Sätze**, nicht nach der Sachverhaltsart (F202,
`domain/rule-booked.ts`): unter **Wiederkehrende** (`wk`) steht ein Fall nur,
wenn **alle** seine Sätze im Stapel aus der Regel kommen (`origin =
'recurring_rule'`); gemischt, von Hand korrigiert oder vom Agenten individuell
gebucht heißt **Einzelfälle** (`einzel`) — auch für einen Dauersachverhalt. Ein
Fall steht nie in beiden Reitern. *Warum:* bei 61015 standen 21 von 23
„Wiederkehrenden" mit Agent-Sätzen in einer Tabelle, die für Regel-Haken gebaut
war — ohne KI-Begründung und ohne die drei Sichten.

Beide Reiter sind **eine** Komponente (`Schritt3Einzel` mit `variant`), die
Wörter unterscheiden sich, Sichten, Filter, Hotkeys und Aktionen nicht:

- **Wiederkehrende** (`wk`) — die Frage ist „ist die Zeile wie im Vormonat?";
  die Antwort steht im Aufklapper **rechts** in der Kontext-Zone „Regel &
  Periode" (Modus, Vorlage-Betrag, Intervall, Periode, Vormonatsvergleich,
  offene Klärung). Wer 30 Mieten prüft, hakt sie in der Übersicht gesammelt ab.
- **Einzelfälle** (`einzel`) — ein Fall füllt den Bildschirm, aufgebaut in
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

Die drei Sichten der Einzelfälle teilen sich **eine** Tabelle und dieselben
Worte je Zeile — Nr. · Datum · Gegenpartei · Buchung · KI-Prüfung · Beleg ·
Betrag · Stand. Das Datum steht ohne Uhrzeit, die Buchung mit Kontonamen („4930
Bürobedarf an 1200 Bank"). „KI-Prüfung" (`AiBookingNotesCell`) zeigt Urteil des
Judge und Konfidenz mit Wort; ohne Urteil und Konfidenz bleibt sie leer. Jede
Zeile klappt auf (`ui/ProposalFoldout.tsx`, für beide Reiter): links der Satz
als kompakter Journal-Viewer (`JournalEntryCard`), darunter Begründung und
Judge-Satz (`AiBookingNotesBody`, ohne zweiten Kopf) — oder ein Satz, **warum**
es keine KI-Prüfung gibt (von Hand, Regel, Import, Storno, noch nicht geprüft);
rechts, nur bei regelgebuchten Fällen, die Kontext-Zone „Regel & Periode":

- **Übersicht** (`uebersicht`) — gruppiert nach **Satzart**, je Gruppe Kopf mit
  Anzahl und Summe, Auswahl und Sammelfreigabe. Wer 118 Sätze abnimmt, sieht
  zuerst, *worauf er schaut*: 42 Aufwendungen, 31 Zahlungen, 12 Geldtransite.
  Leere Arten fallen weg. Sortiert wird **nach der Nummer**, nicht nach Ampel —
  sonst springt die Gruppe nach jeder Freigabe um.
- **Liste** (`liste`) — derselbe Vorrat flach, mit Satzart als Spalte und den
  entschiedenen Fällen. Überblick und gezielter Sprung.
- **Sachverhalt** (`fall`) — der Einzelfall wie oben beschrieben.

**Die Nummer ist stabil und filterfest.** Sie kommt aus der
**Vergabereihenfolge** (`case_number` aufsteigend, `nulls last`, Rückfall
`created_at`, dann `caseId`) und wird **vor** jedem Filter über den ganzen
Reiter-Vorrat vergeben. Der Pager zeigt „Sachverhalt 47 von 118" und bei
aktivem Filter „· 12 im Filter"; vor/zurück springt durch die gefilterten, die
Nummer bleibt die aus der Gesamtliste. Nach **Belegdatum** sortiert würde ein
nachgereichter Januar-Beleg sich vorn einschieben und alle Nummern dahinter
verschieben — eine Nummer, die man notieren oder am Telefon nennen kann, wäre
das nicht.

Geladen wird **je Reiter nur, was er zeigt**, und tief nur der eine sichtbare
Fall (`?fall=`, `application/review-case.ts`). Die Kontext-Zone der
Wiederkehrenden kommt aus **vier** Abfragen für den ganzen Reiter
(`application/rule-context.ts`), nicht aus acht je Zeile.

Der Vormonatsvergleich ist **nicht** die Drei-Monats-Engine aus Schritt 6
(`domain/vergleich.ts`), sondern `domain/vormonat.ts`: ein Dauersachverhalt hat
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

