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
`LudwigEntryDrawer` (was Ludwig gebucht hat); Konto-Detailseite:
`?entry=` DATEV, `?buchung=` Ludwig. *Warum:* Mischen würde verwischen,
welche Seite die Wahrheit trägt.

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

Die Abnahme **baut keinen zweiten Kern nach**. Sie ruft die Kerne, die Agent
und Stammdatenpflege ohnehin rufen (Abnahme, Klärung, Konvention, Freigabe);
die Freigabe-Checkliste in Schritt 8 rechnet **dieselben Gates**, die der Agent
passieren muss (`computeBatchGates`) — der Gate-Text ist der Zeilen-Text.
Eine **Deckungslücke aus Gate 1a** (ein Datei-Import endet vor dem
Periodenende) macht die Zeile „Kontoauszüge lückenlos" **gelb und
quittierpflichtig**: Auszug nachliefern oder begründet quittieren, und die
Quittung verfällt, sobald sich die Deckungsgrenze bewegt. Der Wortlaut wird aus
den Gate-Feldern in Menschen-Sprache gebaut (`domain/deckungsluecke.ts`), für
Schritt 1 und 8 derselbe Satz; **gerechnet wird nur im Gate**. *Warum:* der
Agent läuft autonom und kann die Lücke nicht zurückspielen — entscheiden muss
der Mensch (Owner 03.09.2026).
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

**Diff-Modus:** ab der zweiten Runde steht auf Schritt 0, was der Agent seit
der Rückgabe geändert hat (neu · ersetzt · beantwortet → gebucht · neue Fragen
· neue Konventionen). Warum ein Punkt *unverändert* offen blieb, sagt das
Playbook nicht — diese Zeile bleibt leer und sagt das auch.

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

### R20 — Schritt 3 der Abnahme hat drei Reiter, weil er zwei Prüffragen hat
Das Grundmuster aus R16 (Todo-Liste links, Detail rechts) trägt Schritt 3
nicht: „Stimmen die Vorschläge?" zerfällt in **zwei verschiedene Fragen**, und
jede verlangt eine andere Oberfläche. Der Schritt hat deshalb drei Reiter
(`?tab=wk|einzel|liste`, Design `Buchungsreview.dc.html` → Screen 3):

- **Wiederkehrende** (`wk`) — Dauersachverhalte aus Regeln. Die Frage ist „ist
  die Zeile wie im Vormonat?", also steht der Vormonatsvergleich als **Spalte**
  in einer Tabelle mit Haken, aufklappbarer Zeile und **Sammelfreigabe** in der
  Fußleiste. Wer 30 Mieten prüft, klickt nicht 30 Fälle durch.
- **Einzelfälle** (`einzel`) — ein Fall füllt den Bildschirm: links der
  `BuchungssatzEditor` mit seinen Prüfpunkten, rechts die Kontext-Zonen
  (Gegenpartei · Beleg & USt · Zahlung · Regel & Periode · Notizen), unten die
  Entscheidungsleiste. Die Frage ist „ist dieser Satz richtig?", und die
  Antwort braucht den Kontext neben der Zahl, nicht hinter einem Drawer.
  Umschaltbar auf eine flache Sicht (`?sicht=liste`) für den gezielten Sprung.
- **Liste** (`liste`) — beide Arten am Stück. Überblick und Ausdruck;
  entschieden wird in den anderen beiden.

Geladen wird **je Reiter nur, was er zeigt**, und im Einzel-Reiter tief nur der
eine sichtbare Fall (`?fall=`, `application/review-case.ts`). Die
Wiederkehrenden kommen aus **vier** Abfragen für die ganze Tabelle
(`application/wiederkehrende.ts`), nicht aus acht je Zeile.

Der Vormonatsvergleich ist **nicht** die Drei-Monats-Engine aus Schritt 6
(`domain/vergleich.ts`), sondern `domain/vormonat.ts`: ein Dauersachverhalt hat
genau einen Bezugswert, und eine Engine, die unter zwei Vormonaten schweigt,
beantwortet hier die falsche Frage.

Was das Design zeigt und der Bestand nicht hergibt, fehlt **sichtbar** statt
geraten: einen zweiten Buchungssatz je Ereignis legt der Editor nicht an
(der Editor-Kern konsolidiert auf einen Satz), Notizen sind Audit-Einträge und
deshalb ohne „Bearbeiten"/„Löschen", und „Zurückstellen" blendet für diesen
Besuch aus — eine Wiedervorlage am Vorschlag gibt es im Schema nicht.
*Warum:* Eine Oberfläche für zwei Prüffragen bedient beide schlecht. Die
Sammelfreigabe im Fall-Vollbild wäre 30 Klicks, der Kontext neben einer
Tabellenzeile passt nicht hin — und die Prüferin merkt an beidem, dass die
Anwendung ihren Arbeitsschritt nicht kennt.

