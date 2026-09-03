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
