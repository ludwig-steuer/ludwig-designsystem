# Code-Regeln der Web-Oberfläche — die Design-Anteile

> **Dieses Repo führt diese Regeln.** Sie standen bis 2026-09-03 als R2, R3,
> R4, R7, R9, R15, R18 und R21 in `ludwig/app/docs/topics/web-ui.md` und sind
> dort entfallen; die Nummern sind drüben jetzt Lücken. Was in `web-ui.md`
> blieb, ist fachlich (Beleg-Shell, Stapelabnahme, Admin-Log …) und wird
> weiter dort gepflegt — als Spiegel unter `docs/ludwig/web-ui.md`.
>
> **Die Nummern bleiben**, damit Querverweise aus App-Code und Backlog weiter
> treffen. **Pfade im Text zeigen auf die App**; Übersetzung hierher:
> `apps/web/src/ui/v2` → `src/ui/v3`, `src/styles/v2.css` → `src/styles/v3.css`.
>
> Wo eine Regel hier eine Entsprechung in der Designsprache hat, steht sie
> dort kürzer und grundsätzlicher — bei Widerspruch gilt
> `docs/design-guidelines.md`:

| Regel | Entsprechung |
|---|---|
| R2 Status-Spaltenkopf | Z4 · gebaut in `StatusHeader` |
| R3 Zeit in Europe/Berlin | Aufgabe 0033 `Time`, Formatter `src/ui/v3/format.ts` |
| R4 Abstände über geteilte Klassen | A5 (Tokens), Ausnahme `app-chrome.css` |
| R7 Log-Darstellung | Z6 · Aufgaben 0053 `LogList`, 0054 `LogBrowser` |
| R9 Tab-Leisten | `Tabs` in `src/ui/v3/primitives/Nav.tsx` |
| R15 Slide-over | Aufgabe 0042 `Drawer` (Rahmen, gebaut), 0052 `EntityDrawer` (Inhalt) |
| R18 Buchungssatz-Editor | Aufgaben 0015 `JournalEntryEditor`, 0044 `JournalEntryCompact` |
| R21 Stufen | README „Ordnung im Set" · Wächter-Test `stufen.test.ts` |

Dazu ein eigener Block am Ende dieser Datei: **D1–D26 — Detailseiten**
(seit 2026-09-08). Er regelt den Aufbau jeder Entitäts-Detailseite; die
Langform mit Herleitung und Zahlen steht in `docs/detailseiten-standard.md`.

### R2 — Status-Spalten heißen nie bloß „Status"
Jede Status-Spalte bekommt ein spezifisches Label („Abgleich",
„Verarbeitung", …) plus Info-Icon mit Zustands-Legende — app-weit über
`StatusHeader` (`ui/components/primitives`), Legende aus `axisLegend()` der
Registry. *Warum:* „Status" ist mehrdeutig, sobald eine Tabelle mehr als
eine Achse zeigt.

### R3 — UI-Zeiten in Europe/Berlin
`timestamptz::text` aus Postgres ist UTC. Zeit-Darstellung läuft über
`Intl`/`toLocaleString` mit **festem** `timeZone: "Europe/Berlin"` — nie
über Regex/String-Slicing auf dem ISO-String und nie abhängig von der
Server-Zeitzone (Muster: `agent-runs`-Seiten, `CaseDatevTruthTab`).
*Warum:* ohne festes timeZone rendert der Server UTC und die Anzeige liegt
2 h daneben. (Lücke in den geteilten Formattern: `web-ui-offen.md` P3.)

### R4 — Abstände zentral über die geteilten CSS-Klassen
Text-Boxen werden großzügig gepaddet, und das Padding wohnt in den
geteilten Klassen (`.section`/`.section__body` in `app-chrome.css`,
Spacing-Tokens in `tokens.css`) — nicht als Inline-Style pro
Feature-Komponente. Karten bauen auf der `Section`-Primitive auf.
*Warum:* ein moderater Standard an einer Stelle statt Drift in jeder Box.

### R7 — Log-Ansichten teilen die Darstellung, nicht die Herkunft
`@/ui/components/log` hält `LogTable` (deklarative Spalten), `LogView`
(fertige Tabelle für Zeilen im `LogEntry`-Shape: `at, level?, source?,
message, refs?, payload?`) und die Zell-Bausteine. Ansichten mit eigenen
Feldern nutzen `LogTable` mit eigenen Spalten, statt alles in `message` zu
pressen. Bewusst **kein** gemeinsamer `/api/logs`-Endpoint: die Seiten
sind Server Components und lesen direkt via Drizzle; Nachladen als
Server-Action `loadMore(cursor)`, nicht als REST-Fläche. *Warum:* ein
Sammel-Endpoint wäre ein Switch über alle Log-Queries samt ihrer je
eigenen Scoping-Regeln — mehr Code, schwächeres Berechtigungsmodell.

### R9 — Tab-Leisten über die `TabBar`-Primitive
Seiten-Tabs nutzen `ui/components/primitives/TabBar.tsx` (Styling aus
`.md-tabs`/`.md-tab` in `app-chrome.css`, `.count`-Pills inklusive) statt
Inline-`borderBottom`-Kopien. Die Primitive ist bewusst keine
Client-Component — wer Listen-Kontext aus der Query braucht, berechnet die
`href`s in einem dünnen Client-Wrapper und reicht sie durch. Restliche
Inline-Kopien beim nächsten Anfassen umstellen (`web-ui-offen.md` P8).

**Ein Reiter ist eine eigene Ansicht, kein Filter** (Owner-Entscheid
2026-09-08). Zeigen zwei Reiter dieselbe Tabelle mit derselben Sortierung,
denselben Spalten und denselben Aktionen und unterscheiden sich nur in der
Grundgesamtheit, dann sind sie ein **Filter**, der als Reiter verkleidet ist:
er kostet eine Leiste, ist nicht kombinierbar, steht nicht in der URL neben
den anderen Filtern und behauptet einen Wechsel des Ortes, wo nur eine
Auswahl stattfindet. Ein Reiter ist gerechtfertigt, wenn hinter ihm eine
**andere Ansicht** steht — andere Spalten, eine andere Form, eine andere
Handlung, eine andere Entität. Zielbild jeder Liste ist deshalb **eine
Ansicht plus n Sonderansichten**, nicht n Grundgesamtheiten.

*Warum:* die Sachverhaltsliste hatte sechs Reiter, von denen vier dieselbe
Tabelle zeigten (nachgemessen im Entitätsprofil: gleiche Sortierung, gleicher
Spaltensatz, gleiche Filter, keine Massenaktion) — die Leiste versprach sechs
Orte und hatte zwei. Betroffen: `docs/seiten/sachverhalte.md`,
`CASE_LIST_TABS` und `CaseList` (0082).

### R15 — Slide-over: einbindbar oder screen-lokal, nichts dazwischen
Ein Drawer ist **Klasse A**, wenn er eine Entität zeigt, die es überall geben
kann (Beleg, Buchung, Konto, Zahlung): er lebt in `@/ui/drawers`
(Server-Component-Varianten in `@/ui/drawers/server`), nimmt **nur Kennung +
Öffnungsart** und trägt Laden, Fehler, Leerfall und Rahmen selbst. Er ist die
Hülle; die Darstellung darin ist die pure View. Ein Drawer ist **Klasse B**,
wenn sein Inhalt am Screen hängt (Editor, der per `onSave` zurückschreibt) —
er bleibt in seinem Modul, benutzt aber den Rahmen aus `@/ui/components`
(`Drawer`/`UrlDrawer`/`DrawerFooter`) und Breiten als Stufen (`sm`/`md`/`lg`).
`.lwdrawer`-Markup gibt es nur in der Primitive. Der Katalog, aus dem man
wählt, steht in `apps/web/AGENTS.md` §7 und wird gegen das Barrel getestet
(`ui/drawers/__tests__/drawer-catalog.test.ts`) — kein neuer Slide-over, ohne
dass er gelesen wurde. Mandanten-Scope kommt aus dem `ClientScopeProvider`
des Jahres-Layouts (`useClientScope()`), nicht als Prop; Server-Components
können keinen Context lesen und nehmen ihn als `scope`-Prop.
**Name.** Ein Klasse-A-Drawer heißt `<Entität>Drawer` — die Entität ist der
deutsche Entitätsname der Familie (derselbe wie der Ordner
`ui/v2/entities/<entität>/`, R21), die Datei heißt wie die Komponente, die
Kennung ist die eine Identität dieser Entität (`sourceDocId`, `caseId`,
Kontonummer). Zwei benannte Ausnahmen: zeigt ein Drawer eine **zweite
Wahrheit** derselben Entität, steht die Herkunft vorn (`DatevBuchungssatzDrawer`
neben `BuchungssatzDrawer`, R8); eine reine **Technik-Sicht** ohne Fachentität
trägt die Sicht statt der Entität (`RawRowDrawer`). Der Drawer ist damit eine
Darstellungsform der Entitäts-Familie neben Cell · Row · Card · View, keine
Größe (Inventar §4.4). Bestandsnamen, die noch abweichen: `web-ui-offen.md` P26.

**Aufbau — Muster `BelegDrawer`** (die Referenz; wer einen neuen Entitäts-Drawer
baut, kopiert diesen Aufbau, nicht das Markup):

1. **Kopf:** `title` = wie die Entität im Gespräch heißt (beim Beleg der
   Lieferant), `meta` = die Kennung darunter (Rechnungsnummer, Dateiname).
2. **Körper, in dieser Reihenfolge:** das Original zuerst und groß (die
   PDF-Vorschau, Höhe `clamp(…, 72vh, …)` — auf großen Schirmen mehr Beleg);
   darunter die Kern-Fakten aus **derselben** Komponente, die die Vollansicht
   benutzt (`BelegSummary`), nie eine zweite Feldliste; zuletzt eine Zeile,
   **was der Schnellblick nicht beantwortet** („Positionen, USt-Sätze und
   Konto-Splitting werden in der vollständigen Belegansicht geprüft").
3. **Fuß:** genau eine Aktion — der Weg in die Vollansicht. Ein Klasse-A-Drawer
   schreibt nicht; wer ändern will, geht dorthin (Schreiben ist Klasse B).
4. **Vier Zustände, alle im Drawer:** lädt · Fehler (mit der Kennung im Text) ·
   nicht gefunden (Leerfall mit Mandantenbezug) · Inhalt. Der Wächter-Test
   prüft Fehler- und Leerfall-Zweig strukturell.
5. **Breite als Stufe:** `sm`, wenn eine Zeile oder eine Zahl die Antwort ist
   (Auszugsposition), `lg`, sobald ein Dokument gezeigt wird.

*Warum:* Ohne Katalog baut jeder Screen den zehnten Rahmen; ohne die harte
Grenze wandert Screen-Logik in geteilte Hüllen.

### R18 — Ein Buchungssatz-Editor, zwei Modi
Buchungssätze werden überall mit **derselben** Komponente angezeigt und
bearbeitet: `@/ui/v2` `BuchungssatzEditor`, `editable` schaltet um. Die
Spaltenordnung ist **DATEV** — Datum · [Whg.] · Umsatz · S/H · BU · Konto ·
Beleg 1 · [Beleg 2] · Text · [KOST] —, Beträge stehen brutto wie auf dem Beleg,
die Steuerzeile leitet der Editor ab (`ui/booking/tax-assist.ts`) und zeigt sie
unter der Zeile. Der **Rest** gegen den Belegbetrag steht im Kopf: geht er
nicht auf null, ist der Satz nicht fertig.

Fehler blockieren das Speichern, Warnungen brauchen eine **Quittung**, Hinweise
stehen nur da. Der Grund einer Änderung wird in einem Dialog erfragt, nie per
`window.prompt` — ein Browser-Prompt trägt keinen Kontext und steht auf keinem
Screenshot.
*Warum:* Wer eine Buchung gelesen hat, findet beim Korrigieren dieselben
Spalten an derselben Stelle. Zwei Oberflächen für denselben Satz heißen zwei
Vorstellungen davon, was ein Buchungssatz ist — und die alte gewinnt, weil sie
schon verdrahtet ist.

### R21 — Jede geteilte Komponente hat genau eine Stufe
`apps/web/src/ui/v2/` ist in drei Ordner geschnitten, und der Ordner **ist** die
Stufe. Einstufungsfrage, in dieser Reihenfolge: *Kennt sie ein Fachwort? → Genau
eine Entität? → Eine Domäne? → Einen Screen?*

| Stufe | Was | Ort | Story-Titel |
|---|---|---|---|
| **1 Primitive** | kein Fachwort, keine Entität; rendert aus Props | `ui/v2/primitives/` | `v2/Primitives/<Name>` |
| **2 Pattern** | Arbeitsflächen-Muster aus Primitives; kennt Prozessbegriffe (Schritt, Auswahl, Phase), keine Entität | `ui/v2/patterns/` | `v2/Patterns/<Name>` |
| **3 Entität** | Darstellungsfamilie **genau einer** Entität, Namen `<Entity>Cell/Row/Card/View/Editor/Picker` | `ui/v2/entities/<entität>/` | `v2/Entitäten/<Entität>/<Name>` |
| **4 Domäne** | fachliche Komposition, von mehreren Screens **einer** Domäne gebraucht | `modules/<modul>/ui` | `v2/Domänen/<Domäne>/<Name>` |
| **5 Single-Use** | ganze Seiten und screen-lokale Teile | bei der Route bzw. im Modul | — |

Die **Domäne** (Stufe 4) ist eine Einstufung, kein Ort: die Komponente wohnt im
Modul ihrer Domäne — es gibt keinen parallelen `ui/domains/`-Baum. Bank und
DATEV sind **keine** UI-Domänen: Bankkonten sind Stammdaten, der Kontoauszug
ist ein Quelldokument (R5a), die Zuordnung ein Sachverhalts-Thema (R12);
DATEV-Technik (Bridge, Verbindung, Sync) ist eine Integration, die fachlichen
DATEV-Sichten (Spiegel, Abgleich, Export-Stapel) wohnen in den Fachdomänen.
Die Zuordnung Modul → Domäne, vollständig:

| Domäne | Topics | Module (`apps/web/src/modules/`) |
|---|---|---|
| **Belege** | belege, bank | source-docs · invoices · document-inbox · contracts · files · bank-transactions — **alle** Quelldokumente und Dateien inkl. Kontoauszug und Vertrag |
| **Sachverhalt** | sachverhalt | accounting-cases · recurring-rules · notifications · bank-match (Zuordnung) |
| **Buchung** | buchung, datev | entries · datev-truth · datev-mirror (die DATEV-Seite der Buchungswahrheit, R8) |
| **Konten** | konten | accounts · business-partners |
| **Stapel & Abnahme** | datev + buchung | stapelabnahme · client-batches · cycles · datev-export (der Stapel Richtung DATEV) |
| **Stammdaten** | onboarding | clients · onboarding — Mandanten-Infos, Bankkonten, Konfiguration, Mandantenliste |
| **Integrationen** | datev, bank | bridge · external-integrations — Verbindungs-/Sync-Status; fachliche Sichten bleiben in den Fachdomänen |
| **Kanzlei & Betrieb** | web-ui | admin · tenants · auth · audit-log · health · workflows-api · glossary · pricing · product-feedback |
| **Portal** | — (eigene Zielgruppe, Register prüfen, F111 B6) | client-portal |

**Importiert wird nur abwärts** (5 → 4 → 3 → 2 → 1 → Tokens/`v2.css`):
Primitives kennen keine Patterns oder Entitäten, Patterns keine Entitäten, und
`@/ui/v2/**` importiert **kein** `@/modules/**`, keine Server Action, kein
Drizzle. Drei Wächter-Tests halten das (`ui/v2/__tests__/stufen.test.ts`).

**Gehoben wird beim zweiten Konsumenten, nicht vorher.** Eine Komponente
entsteht single-use beim Screen; erst der zweite echte Konsument macht sie zur
Stufe 1–4 (Umzug + Story, kein Re-Export-Shim). Vor jeder neuen Komponente gilt
der Regelweg, erster Treffer gewinnt: **suchen** (Storybook nach Entität ×
Darstellungsform, `v2/…` vor `v1/…`) → **verwenden** · v2-Treffer ohne die
gebrauchte Variante → **erweitern** (Prop an der bestehenden Komponente) · nur
v1-Treffer → **heben** (Prüfliste, Story `v2/…`, v1 `@deprecated`, R-A6) ·
kein Treffer → **neu bauen** auf der Stufe aus der Tabelle. Eine zweite
Komponente derselben Entität × Form braucht einen im Review benannten
fachlichen Grund.

*Warum:* Ein flacher Ordner beantwortet die einzige Frage nicht, die vor jeder
neuen Komponente steht — „gibt es das schon, und wo gehört meine hin?". Ohne
Stufe wandert Fachwissen in Primitives und Layout in Entitäts-Komponenten;
danach ist jede Wiederverwendung ein Copy-Paste, weil das Original zu viel weiß.

## D1–D26 — Detailseiten

> **Kurzfassung.** Die Langform mit Herleitung, den drei Layouts, den fünf
> Zonen und den gemessenen Zahlen steht in `docs/detailseiten-standard.md` —
> bei Widerspruch gilt sie. Hier steht, was ein Agent beim Bauen und beim
> Abnehmen nachschlägt. Die Regeln gelten für jede Detailseite **einer**
> Entität (Sachverhalt, Beleg, Konto, Partner, Bankkonto, Mandant …), nicht
> für Listen und nicht für Arbeitsflächen mit Schritt-Rail.
>
> **Abweichung nur mit einem Satz Begründung im Seitenprofil**
> (`docs/seiten/<slug>.md`, Abschnitt „Abweichung vom Detailseiten-Standard").
> Was dort nicht steht, gilt wie hier.

**Der Rahmen:** Pager · Kopf · Signal · Reiter · Körper.
**Die fünf Zonen des ersten Reiters:** Kopf · Mängel · Fakten · Abrisse · Verlauf.
**Der Reiter-Satz:** Übersicht · Details · [entitätsspezifisch] · Verlauf · Rohdaten.
**Die drei Layouts:** D-L1 Zonen untereinander (Vorgabe) · D-L2 Gegenüberstellung · D-L3 Randspalte (Zone 3 **oder** 5 neben der Arbeitsfläche) — seit 0154 Muster des Reiterinhalts: Fläche ohne Spalten · `split` · `main-aside`/`list-detail`, dazu `list-detail-aside` (D17).

| | Regel | Woran man den Verstoß erkennt | Baustein |
|---|---|---|---|
| **D1 Überblick, nicht Bearbeitung** | Rang 1–4 des Seitenprofils stehen ohne Scrollen und ohne Klick. Die Übersicht **schreibt nicht**: Schreibwege sind die Aktionen oben rechts und der Weg hinaus aus einer Mängelzeile. | Ein Eingabefeld auf dem ersten Bildschirm, das niemand angefordert hat; eine Antwort von Rang ≤ 4, für die man einen Reiter öffnen muss. | Rahmen ohne eigene Höhe/Scroll um Slot 1–4 (0050, 0071, 0063) |
| **D2 Mängel zuerst, mit Weg hinaus** | Zone 2 zeigt jedes Problem, Kritikalität absteigend (A7), jede Zeile mit einem Weg hinaus. Ganzer Datensatz → Zone 2; ein Wert → an seinem Wert als Mangel statt Leerzeile; im Reiter → Zähler mit `alarm`. Leer = Haken + Satz mit Zahl (L6). Dieselbe Sache nur an einem Ort. | Ein leeres Feld, wo ein Pflichtwert fehlt; ein Mangel, der erst im richtigen Reiter sichtbar wird; eine Mängelzeile ohne Ausweg; Rot ohne Stufe „Fehler". | `StatusCallout` (0049) · `Banner` · `Tabs count/alarm` · `SourceDocumentFacts missing` |
| **D3 Ein Rahmen, fünf Slots** | Pager · Kopf · Signal · Reiter · Körper, immer in dieser Reihenfolge. Leerer Slot fällt mit seinem Abstand weg; gefüllter Slot bleibt auch mit einem Eintrag. | Eine Detailseite mit eigener Slot-Reihenfolge; eine leere Zeile, wo ein Slot nichts trägt; ein Layout, das je nach Datenmenge die Spaltenzahl wechselt. | `RecordPager` (0047), `EntityHeader` (0048), `StatusCallout` (0049), `Tabs` |
| **D4 Fünf Zonen in fester Reihenfolge** | Der erste Reiter besteht aus Kopf · Mängel · Fakten · Abrisse · Verlauf. Fakten = Rang 1–6 des Entitätsprofils; Herkunft und Konfidenz nur bei einem Wert (0120). Abrisse in Reiterreihenfolge. | Eine Übersicht mit eigener Gliederung; Fakten unter den Abrissen; eine Herkunftszeile ohne Wert. | `EntityHeader`, `StatusCallout`, `FieldList`, `Card`+`DataTable`, `LogList` |
| **D5 Drei Layouts, kein viertes** | D-L1 Zonen untereinander (Vorgabe) · D-L2 Gegenüberstellung, wenn gegen eine Quelle abgeglichen wird · D-L3 Randspalte, wenn es eine Arbeitsfläche (Liste mit Rang ≤ 4) gibt und Zone 3 **oder** 5 daneben mitgelesen wird — der Strang nur bei `p90 ≥ 5` (Zahl aus dem Entitätsprofil). Seit 0154 sind die drei Layouts Muster von `Columns` (D17); `list-detail-aside` ist D-L3 mit dem Strang links, kein viertes. | Ein Körper, der keinem der drei entspricht und keinen Satz im Seitenprofil hat; zwei Zonen zugleich in der Randspalte; ein Strang daneben ohne Zahl. | `MasterDetail`; 0071 / 0050 / 0063 |
| **D6 Der Kopf trägt Kennung, Name, einen Zustand** | Pflicht: `overline`, `title`, `status` (**eine** Achse als `StatusBadge` mit (i) → `StatusInfoDialog`). Dazu, wo vorhanden: Prozessbild (Z7), Meta-Zeile, Kennzahl, Faktenzeile, Aktionen. | Kein Weg von der Marke zur Erklärung der Achse; eine Kennung nur in der URL; ein Symbol aus einer Statusachse; eine Kette ohne Prozessbild. | `EntityHeader` (0048), `StatusBadge`, `StatusInfoButton`, `ProcessStepper` (Platz fehlt: 0137) |
| **D7 Was nie in den Kopf gehört** | Kein zweiter Zustand derselben Frage · keine leere Kennzahl · nichts zweimal · kein Formular · keine Zustandslogik als Fließtext · nicht die Liste, aus der die Leserin kam · keine zweite Entität mit eigenem Kopf. | „GESAMTBETRAG —" an der stärksten Stelle; derselbe Name in Titel, Meta und Fakten; vier Anzeigen für „wer ist am Zug"; „Zurück" ohne Ziel. | `EntityHeader` (leere Slots fallen weg), `RecordPager back` |
| **D8 Aktionen oben rechts, ab drei ins Menü** | Alles Machbare in `EntityHeader actions`; höchstens zwei sichtbar, ab der dritten Handlung Menü mit sichtbarem Wort; bei genau einer Aktion **kein** Menü; Zerstörendes immer im Menü mit `tone="danger"`. Ausnahme: der nächste Schritt aus dem Zustand steht als **ein** Knopf im Signal-Slot und dann nicht zusätzlich im Kopf. | Drei und mehr Knöpfe im Kopf; ein Menü mit einem Eintrag; ein Kebab ohne Wort; dieselbe Handlung im Kopf und im Callout; „Löschen" als sichtbarer Knopf. | `EntityHeader actions`, `OverflowMenu` (0008), `ActionButton`, `StatusCallout actions` |
| **D9 Wert, Aktion oder Formular** | Ein Wert auf der Seite → `InlineEdit` an seinem Platz, im Reiter „Details" (auch Zustände, auch mit Grund über `ReasonDialog`). Mehrere Werte zugleich, etwas Neues, etwas Laufendes → Aktion oben rechts. Werte, die nur zusammen Sinn ergeben → Formular im Detail/Reiter/Drawer, nie im Kopf, nie im Dialog. Ausnahme: Korrektur mit Rang ≤ 5 steht in Zone 3, mit einem Satz im Profil. | Ein „Bearbeiten"-Knopf, der die Seite in einen Formularmodus schaltet; ein Zustandswechsel, der den Wert nicht dort ändert, wo er steht; ein mehrfeldriges Formular im Dialog. | `InlineEdit` (0020), `CaseEditor` (0083), `ReasonDialog`, `JournalEntryEditor` (R18) |
| **D10 Reiter sind Sichten, MECE, eine Leiste** | Ein Reiter ist eine andere Ansicht, nie ein Filter (R9). Jeder Inhalt in genau einem Reiter; zwei Tiefen derselben Frage sind eine Klappe. Keine Unterreiter, ein URL-Mechanismus. Reihenfolge nach Fragerang. Der Satz gehört der Entität (höchstens der Ausprägung), nicht dem Datensatz. | Zwei Reiter, gleiche Spalten, andere Grundgesamtheit; eine zweite Reiterebene; `?tab=` neben `?tab=x&view=y` in einer Leiste; ein Reiter, der bei manchen Datensätzen verschwindet. | `Tabs` (R9), `?tab=` (I1) |
| **D11 Der Standard-Satz** | **Übersicht · Details · [entitätsspezifisch] · Verlauf · Rohdaten.** „Übersicht" heißt überall gleich; „Details" trägt die Felder samt `InlineEdit`; „Verlauf" steht, wo es einen Strang gibt; eine Liste mit Rang ≤ 4 steht vollständig in der Übersicht und hat dann keinen eigenen Reiter. Die Reiter dazwischen folgen der Art (D18); bündelt der letzte Reiter Technik, heißt er „Technik" (D19). | Ein erster Reiter, der nach der Entität oder der Ausprägung heißt; ein „Verlauf" ohne Strang dahinter; dieselbe Liste als Abriss **und** in voller Länge. | `Tabs`, `FieldList`, `LogBrowser`, `RawRecord` |
| **D12 „Rohdaten" ist immer der letzte Reiter** | Jede Detailseite hat ihn, immer zuletzt, überall gleich benannt, für alle sichtbar, ohne Zähler und ohne Alarm, optisch auf der Debug-Stufe (A7). Er ist die einzige Technik-Sicht der Seite (T4). Bündelt der letzte Reiter Technik (D19), steht „Rohdaten" darin als letzter, eingeklappter Abschnitt, und „Technik" ist die Technik-Sicht. | Eine Detailseite ohne Rohdaten-Reiter; Rohdaten in der Mitte der Leiste; ein interner Name außerhalb dieses Reiters; ein Zähler daran. | `RawRecord` (0051), `Tabs` (leiser Reiter, 0136) |
| **D13 Verknüpftes öffnet als Drawer, sonst Link** | Nachsehen → Drawer aus dem Katalog über eigenen Such-Parameter (`Esc`, Position bleibt). Kein Drawer, oder die Arbeit geht dort weiter → benannter Link. Nie eine eingebettete zweite Detailansicht. In Listen: `peek` nur, wenn die Zeile ein **zweites** Ziel hat. | Ein zweiter `EntityHeader`; ein Reiter, der Rang 1–4 einer anderen Entität beantwortet; zwei Drawer für zwei Quellen derselben Zeile; ein `peek` neben einer Zeile, die schon in den Drawer führt. | `*Drawer` (R15, I2), `Link`, `RowAction action="peek"` (I11) |
| **D14 Karte, Feldliste, Tabelle — jede an ihrem Platz** | Tabelle immer in einer Karte mit Kopf und Spaltenkopf, auch leer. Feldliste für Label/Wert (`bare` in der Karte, `row` in der Faktenzeile, `soft` für die zweite Wahrheit). Karte mit Kopf für alles mit eigenem Namen oder eigenen Aktionen. Keine Karte in der Karte. | Frei schwebende Zeilen; eine zweite Feldliste für Werte, die eine andere Ansicht schon zeigt; verschachtelte Karten; ein Leerfall ohne Spaltenkopf. | `Card`/`CardHead`, `FieldList` (0006), `DataTable` (0057) |
| **D15 Abriss nur mit Deckung, im Spaltensatz des Reiters** | Abriss-Karte nur bei `p50 ≥ 2` der Relation (Entitätsprofil); `p50 ≤ 1` → Zahl mit Weg in Zone 3; in der Mehrzahl leer → gar nichts. Der Abriss nimmt einen benannten Satz aus dem Spaltenkatalog der Entität. Zähler und Kacheln zählen nach **I12**. | Eine Karte, die bei den meisten Datensätzen leer ist; eigene Spalten im Abriss; Kachel 225, Liste 180; „—" in der Kennzahl; zwei gleich große Salden nebeneinander. | `sourceDocumentColumns()` (0070), `caseColumns()` (0096), `bankTransactionColumns()` (0101), `KpiTile href` (0126) |
| **D16 Diagramm nur in Zone 4, erst ab vier Werten** | Nur Verlauf oder Vergleich. ≤ 3 Werte → Zahl plus Veränderung als Wort. 4–12 → Zahl plus `Sparkline`. Ablesbare Werte → `BarChart` in einer Karte. Höchstens zwei Reihen, Textalternative aus denselben Daten. | Ein Diagramm mit drei Balken; ein Diagramm im Kopf; eine dritte Diagrammfarbe; eine Reihe, die nur als Bild existiert. | `Sparkline` (0124), `BarChart` (0041, 0110), `KpiTile` |
| **D17 Jeder Reiter hat ein Spaltenmuster** | Der Inhalt eines Reiters ist eine Fläche ohne Spalten oder eines der vier Muster von `Columns`: `list-detail-aside`, `list-detail`, `split`, `main-aside` (Stufen `facts` 460 px, `table` 960 px). Breiten folgen dem Gewicht, das Muster nicht. Beim Umbruch fällt die dritte Spalte nach unten; `main-aside` bricht die Randspalte nach oben. D-L1 ist die Fläche ohne Spalten, D-L2 `split`, D-L3 `main-aside` oder `list-detail`. | Ein Reiter mit eigenem Raster; ein Muster, das je Datensatz wechselt; eine Randspalte, die beim Umbruch unter die Liste rutscht. | `Columns` (0154), `DetailView` (0138) |
| **D18 Reiter nehmen das Muster ihrer Art** | Wie die Hauptseiten: eine Liste sieht aus wie ihre Liste im Hauptmenü (benannter Spaltensatz aus dem Katalog der Entität), eine Liste zum Abarbeiten ist `list-detail`, ein Vergleich `split`, eine Fläche mit Begleiter `main-aside`, die Übersicht mit Strang `list-detail-aside`. | Eine Belegliste im Reiter mit eigenen Spalten; ein Abarbeiten ohne Detail daneben; ein Vergleich untereinander. | Spaltenkataloge (0070, 0096, 0101), `TodoList`, `Columns` |
| **D19 Reiter nach Zielgruppe; der letzte heißt `raw` oder `technical`** | Die Reiter der Sachbearbeitung zuerst; was nur Prüfung und Support lesen, steht in **einem** letzten Reiter. Zeigt er nur Rohdaten, heißt er „Rohdaten" mit Schlüssel `raw` (Beleg, Konto, Partner); bündelt er DATEV-Wahrheit, Protokoll, Herkunft und Rohdaten, heißt er „Technik" mit Schlüssel `technical` (Sachverhalt) — D12 gilt dann für den letzten, eingeklappten Abschnitt darin. Reiter-Schlüssel sind englisch (F210), der erste trägt keinen Parameter (I1); eine Liste kommt über ihre eigenen Filterparameter zurück, nie über ein gebündeltes `?list=`. | „Technik" mit nur Rohdaten darin; DATEV-Wahrheit als Reiter mitten in der Sachbearbeitung; ein deutscher Reiter-Schlüssel; `?list=`. | `Tabs` (leiser Reiter, 0136), `Disclosure`, `RawRecord` (0051) |
| **D20 Die Randspalte ist kompakt** | Oben stehen nur Zeilen, die der Kopf nicht trägt, höchstens drei; der Rest liegt hinter „Alle …" (`Disclosure`). Offene Erwartungen stehen in der Randspalte der Übersicht; unter „Zu tun" nur, wenn sie fällig sind (Reife `due` oder `escalated`). | Die Kontoart in Kopf und Randspalte; eine Erwartung in Strang, „Zu tun" und Randspalte zugleich; zehn Stammdatenzeilen über der Liste. | `Columns main-aside`, `FieldList`, `Disclosure`, `ExpectationRow` (0025) |
| **D21 Die Mängel-Zone zeichnet ein Pattern** | Zone 2 ist `OpenPoints`; die Entität liefert fertige Punkte (Titel, Satz, Weg, Zustand) und die Wörter. `OpenPoints` zeigt nur, was an **diesem** Datensatz offen ist — jede Prüfung mit Urteil ist `Checklist`, ein Vorrat über viele Datensätze `TodoList`. | Eine Entität, die ihre Mängelzone selbst zeichnet; grüne Prüfungen in der Mängelzone; ein „nichts offen", das verschwindet. | `OpenPoints` (0153), `SourceDocumentDefects`, `defectPoints()` |
| **D22 Ein Signal oder keins** | Der Signal-Slot trägt höchstens eine Meldung. Wartet der Datensatz auf jemand anderen — den Mandanten, DATEV, den Agenten —, steht dort nichts: die Wartezeit ist eine Erwartung oder ein Zustand im Kopf, keine Aufforderung an die Leserin. | Zwei Banner übereinander; „Warten auf Unterlagen" als Signal mit Knopf, obwohl im Haus niemand etwas tun kann. | `StatusCallout` (0049), `Banner` |
| **D23 Jeder Leerfall ist ein Satz mit Grund** | Leer ist nie ein Strich und nie ein Verschwinden: eine Zone, eine Liste, ein Reiter ohne Inhalt sagt, warum. Ein Erfolg (Haken, Satz mit Zahl) und eine Lücke (fehlt, weil …) sind zwei verschiedene Sätze. | „—" als Inhalt einer Zone; ein Reiter, der weiß bleibt; „Keine Treffer" für einen Erfolg. | `EmptyState`, `DataTable empty`, `OpenPoints` |
| **D24 Nichts zweimal auf dem ersten Bildschirm** | Eine Zahl oder ein Name steht auf dem ersten Bildschirm einmal — zwischen Kopf, Kacheln, Randspalte und Mängelzeilen. Steht der Saldo im Kopf, fällt die Kachel; steht der Betrag im Kopf, wiederholt ihn der Satz darunter nicht. | Derselbe Saldo in Kopf und Kachel; derselbe Betrag im Kopf und in der „Zu tun"-Zeile. | `EntityHeader metric`, `KpiTile` |
| **D25 Die Herkunft steht neben dem Wert** | Woher ein Wert kommt (KI-Vorschlag, Regel, Mensch, Import), steht als Marke neben ihm; die Herleitung — Regel, Konfidenz, Begründung, Quellen — eingeklappt eine Stufe tiefer. Nie als eigene Zone, nie als leere Zeile. | Eine Spalte „Herkunft" mit rohem Code; eine Begründung, die nirgends lesbar ist; „Begründung: —". | `ProvenanceMark`, `ProvenanceNote` (0163) |
| **D26 Ein Verlauf, drei Tiefen** | Die Geschichte eines Datensatzes ist **eine** Liste mit den Sichten Verlauf · Protokoll · Technik, nie drei Reiter; Fehlschläge stehen immer im Verlauf. Welche Aktion in welche Tiefe gehört, entscheidet die Domäne je Modul, nicht der Aufrufer. | „Protokoll" und „Technik" als eigene Reiter; ein gescheiterter Export nur in der Technik-Sicht; eine Tiefe, die jede Seite selbst rechnet. | `LogList` / `LogBrowser` (`LogEntry.depth`, 0053/0054), `BatonBar` |

*Warum ein eigener Block:* Die Designsprache regelt Bausteine und Muster, R2–R21
den Code der Oberfläche — aber **welche Seite wie aufgebaut ist**, stand
nirgends, und deshalb hat jede Detailseite ihre eigene Antwort gefunden: drei
Rahmen mit denselben Slots unter drei Namen, ein erster Reiter mit drei
Aufschriften, vier Anzeigen für dieselbe Zustandsfrage. Der D-Block ist die
Stelle, an der eine Detailseite künftig **nichts mehr entscheidet**, was schon
entschieden ist.
