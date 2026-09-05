# 0059 · Clarification — Vorschau, Zeile, Liste

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/clarification/` — Gruppe Klärung |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: `audience`, `severity` und der Zustand „zurückgestellt" sind Ludwig-Fachbegriffe aus `STATUS_REGISTRY` |
| Quelle | Entitätsprofil `docs/entitaeten/clarification.md` (2026-09-04) §Datenpunkte Rang 1–7, §Listen, §Formen · Owner-Rückfrage 2026-09-04 („read only, Vorschau, in verschiedenen Listviews — Timeline, Karte als Art To-do-Liste"; „Kommentare in der Klärungsfrage, nicht in der Timeline") |
| Ersetzt | die Zeilen in `ClarificationsBanner` (`modules/accounting-cases/ui`, 249 Z.), `RueckfragenListe` + `Schritt2Liste` (`modules/stapelabnahme/ui`), die Fragenliste in `PortalCaseList` (`modules/client-portal/ui`) · den Klärungs-Verweis in `RationaleSources` (`ui/booking`) |
| Blockiert | 0060 `ClarificationCard` (die Liste zeigt sie als Detail) · 0058 `ClarificationDrawer` |
| Spec von / am | Claude, 2026-09-04 |
| Gebaut von / am | Claude, 2026-09-04 · `pnpm typecheck` und `pnpm build` grün, Stories im Browser angesehen |

## Ziel

Eine Klärung steht auf vier Flächen: am Sachverhalt („was hält den Fall
auf?"), in der Stapelabnahme („alle Rückfragen des Stapels am Stück"), im
Portal („was braucht meine Kanzlei von mir?") und am Buchungslauf („was hat
der Lauf gefragt?"). Vier Flächen, dieselbe Frage — heute vier
Zeilen-Umsetzungen mit vier Feldauswahlen.

Neu: **eine Zeile** für alle vier, eine **Vorschau** für den Verweis aus
fremdem Kontext, und eine **Liste**, die die Zeilen gruppiert und den
Leerfall trägt. Die Liste ist klein: 0 bis 33 Zeilen im Bestand
(p90 = 1 am Fall, 28 im Stapel) — keine Pagination, keine Sortierung, kein
virtuelles Scrollen.

## Abgrenzung zu `DataTable` (0057)

0057 klammert die Listen**seiten**: Pagination, Spaltensortierung, Auswahl,
Massenaktionen — und nennt `ClarificationsBanner` unter den acht Modulen,
deren lokales Auf-/Zuklappen sie ablöst. Keine der vier Klärungslisten ist
eine Listenseite: keine Route, keine Pagination, keine Sortierung, gruppiert
statt spaltenweise. `ClarificationList` reiht deshalb Zeilen und baut keine
Tabelle. Bekommt die Stapel-Liste später Massenaktionen („alle drei an den
Mandanten"), ist das der Punkt, an dem sie auf `DataTable` wechselt.

## Einordnung

- **Wiederverwenden:** kein Treffer, der die Zeile trägt.
  - `Row` (`@when Data row; with href the whole row is a link`) und
    `Disclosure` (`@when Secondary content that has a place but not the first
    look`) tragen die **Optik** und das Auf-/Zuklappen ohne Client-Insel —
    beide werden komponiert, nicht ersetzt.
  - `StatusBadge` (`@when Ein Zustand aus einer Status-Achse … die einzige
    erlaubte Status-Darstellung (R1)`) trägt Zustand und Schwere über die
    Achsen `klaerung_status`, `klaerung`, `klaerung_typ`. Keine lokale
    Farb- oder Label-Map.
  - `CaseTimeline` (0040, fertig) **ist** der Timeline-Rahmen aus der
    Owner-Antwort: sie nimmt Klärungen bereits als eigenen Eintragstyp
    (`CaseTimelineClarification`) auf. Es entsteht hier kein zweiter Weg in
    die Timeline — aber eine Korrektur, siehe „Mitbringsel" unten.
  - `TodoList` (`@when Review step with items to work through`) nimmt ihren
    eigenen Item-Typ (`TodoItem`). Deshalb liefert diese Spec **einen**
    reinen Mapper statt einer Zeile, die sich verwandelt; das Muster bleibt
    unangetastet.
  - `LogList` (0053) — andere Frage: Hunderte Zeilen mit Schwere, Code und
    Payload. Eine Klärung ist keine Log-Zeile.
- **Neu, weil:** `spec-schreiben` §3.5 — `ui-repraesentationen.md` führt die
  Form „Liste" für die Klärung, und keine vorhandene Form deckt sie ab.
- **Zuschnitt:** eine Datei `entities/clarification/Clarification.tsx` mit
  drei Exporten und dem geteilten Typ — §4 „Familie": die drei ergeben nur
  miteinander Sinn und bilden ein Markup-Vokabular. Die Karte (0060) ist
  eine **eigene Datei**: sie braucht `"use client"` für die Antwort, diese
  nicht, und die Zeile wird ohne Karte gebraucht (Timeline, To-do, Portal).
  Die Liste importiert die Karte **nicht** — sie bekommt sie über
  `renderDetail` als Prop, damit die Datei Server-Komponente bleiben kann.
- **Setzt auf:** `Row`, `GroupRow`, `Disclosure`, `EmptyState`, `Badge`,
  `StatusBadge`, `Time`, `LongText`.

## Schnittstelle

### `ClarificationVM` — die Zeile als Datum

| Feld | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `id` | `string` | ja | `client_accounting_case_clarification.id` | alle |
| `title` | `string` | ja | Überschrift (Rang 1). Fehlt sie in den Daten (1 %), setzt der Aufrufer den ersten Satz ein — die Zeile kürzt nicht nach Sätzen | `Gefuellt` |
| `state` | `ClarificationState` | ja | `open` · `deferred` · `answered`, aus `clarificationState()` in `@/ludwig/modules/accounting-cases/domain/case` — **abgeleitet, nie gespeichert** | `Zustaende` |
| `severity` | `ClarificationSeverity` | ja | `required` · `optional` aus `@/ludwig/modules/invoices/domain/invoice`; Achse `klaerung` | `Zustaende` |
| `type` | `ClarificationType` | ja | `question` · `comment`; ein Kommentar bekommt keine Antwortfläche und keinen Zähler | `Kommentar` |
| `audience` | `"accounting" \| "client" \| "agent"` | ja | wer gefragt ist (Rang 4); trägt die Gruppierung der Liste | `ImStapel` |
| `raisedAt` | `string` | ja | ISO-Zeitpunkt, `Time` mit `format="dateTime"` | `Gefuellt` |
| `answeredAt` | `string \| null` | nein | Antwortzeitpunkt; steht in der Zeile als Datum, der Text erst in der Karte | `Zustaende` |
| `deferredUntil` | `string \| null` | nein | Wiedervorlage-Tag; setzt `state` auf `deferred` und erscheint als Wort in der Zeile | `Zustaende` |
| `caseNumber` | `string \| null` | nein | Sachverhaltsnummer — nur mit `showCase` | `ImStapel` |
| `caseTitle` | `string \| null` | nein | Titel des Sachverhalts, zweizeilig neben der Nummer | `ImStapel` |
| `href` | `string \| null` | nein | Ziel der Zeile. Ohne `href` ist die Zeile kein Link (Portal, Nur-Lesen) | `ImStapel` |

Typen aus `src/ludwig/`: `ClarificationState`, `CLARIFICATION_STATES`,
`ClarificationType` (`modules/accounting-cases/domain/case`),
`ClarificationSeverity` (`modules/invoices/domain/invoice`).
`ClarificationVM` selbst wird hier definiert — der gleichnamige Typ der App
(`modules/accounting-cases/domain/overview-vm.ts`) wird **nicht gespiegelt**,
weil er `@/ui/booking` importiert (Befund 1).

### `ClarificationCell` — die Vorschau

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `clarification` | `ClarificationVM` | ja | zeigt Rang 1–3: Titel, Zustand, Schwere | `Vorschau` |
| `href` | `string` | nein | macht die Vorschau zum Link | `Vorschau` |

### `ClarificationRow` — die Zeile

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `clarification` | `ClarificationVM` | ja | Rang 1–7 | `Gefuellt` |
| `showCase` | `boolean` | nein | stellt Sachverhaltsnummer und -titel voran — für Listen außerhalb des Falls (Rolle Kontext, §5 des Profils) | `ImStapel` |
| `detail` | `ReactNode` | nein | was beim Aufklappen erscheint; ohne `detail` klappt die Zeile nicht auf | `MitKarte` |
| `defaultOpen` | `boolean` | nein | aufgeklappt starten — blockierende offene Fragen tun das heute | `MitKarte` |

### `ClarificationList` — die Liste

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `clarifications` | `readonly ClarificationVM[]` | ja | die Zeilen; die Liste sortiert **nicht** um, der Aufrufer liefert die Reihenfolge | `Gefuellt` |
| `groupBy` | `"audience" \| "none"` | nein | Voreinstellung `"none"`; `"audience"` erzeugt drei Gruppen (Kanzlei · Mandant · Agent) wie die Abnahme heute | `ImStapel` |
| `showCase` | `boolean` | nein | wird an jede Zeile durchgereicht | `ImStapel` |
| `renderDetail` | `(c: ClarificationVM) => ReactNode` | nein | liefert das Aufgeklappte — in der App die `ClarificationCard` (0060). Ohne die Prop bleibt die Liste flach und Server-Komponente | `MitKarte` |
| `empty` | `{ title: string; hint?: string }` | nein | Leerfall. Voreinstellung „Keine Rückfragen." — der Erfolgsfall, nicht ein Fehler | `Leer` |

**Was die Familie bewusst nicht kann:** nicht laden, nicht sortieren, nicht
filtern, nicht blättern (0057 `DataTable`), keine Massenaktion, keine
Antwort entgegennehmen (0060), keine eigene Frage stellen (0061).

### Mapper in dieselbe Datei

| Export | Signatur | Zweck | Nachweis |
|---|---|---|---|
| `toTodoItem` | `(c: ClarificationVM) => TodoItem \| null` | die offene Frage als Posten in `TodoList`; `state` → `StateKind` (`deferred` → `skipped`, damit der Sprung zur nächsten offenen sie überspringt), `blocking = severity === "required"`, `sub` trägt die Zielgruppe. **`null` für einen Kommentar** — dieselbe Regel wie im Strang, und sie wohnt im Mapper, nicht beim Aufrufer | `ImRahmen` |

Für den Timeline-Rahmen gibt es keinen Mapper — `CaseTimeline` (0040) nimmt
Klärungen schon selbst auf.

## Mitbringsel: `CaseTimeline` zeigt keine Kommentare mehr

`CaseTimeline` reiht heute **beide** Sorten in den Strang: `type="question"`
bekommt Zustands- und Schwere-Badge, `type="comment"` eine eigene Zeile mit
Sprechblase. Genau das hat der Owner am 2026-09-04 ausgeschlossen — 13 von
166 Zeilen im Bestand sind Kommentare, und sie sind Kontext, kein Ereignis.

Änderung an `entities/accounting-case/CaseTimeline.tsx` (0040, Status
`fertig`): Klärungen mit `type === "comment"` werden **übersprungen**. Das ist
eine Regel des Strangs, kein Prop des Aufrufers — sonst landet sie beim
dritten Aufrufer wieder falsch (dieselbe Begründung wie für die Liste). Der
Kommentar bleibt sichtbar, wo er hingehört: in `ClarificationList` am Fall.
`MessageSquare` als Import entfällt damit; die JSDoc der Datei sagt, warum.
0040 bekommt eine Zeile im Abschnitt „Abnahme" mit dem Verweis hierher.

## Verhalten

- **Server-Komponente.** Kein `useState`: das Aufklappen trägt `Disclosure`
  (natives `<details>`), die Gruppierung ist reines Markup. Nur wenn der
  Aufrufer über `renderDetail` eine Client-Komponente einsetzt, wird der
  Teilbaum client-seitig — das ist seine Entscheidung, nicht die der Liste.
- **Tastatur:** die des `<details>`-Elements (Fokus auf der Zusammenfassung,
  `Enter`/`Space` klappt auf) und die des Links, wenn `href` gesetzt ist.
  Kein eigener Tastaturweg — die Liste hat keinen eigenen Zustand.
- **Zustände:** gefüllt · leer (Erfolg, eigener Text) · Kommentar ·
  zurückgestellt · beantwortet. **Nicht anwendbar:** „lädt" und „Fehler" —
  die Liste lädt nichts; der Aufrufer zeigt `TableLoading`/`ErrorRow`
  (V9 gilt der ladenden Hülle). „Leer nach Filter" entfällt: die Liste
  filtert nicht.
- **Zurückgestellt** steht als Wort mit Datum in der Zeile („zurückgestellt
  bis 12.09.2026"), nie nur als Farbe (V7).
- Ein **Kommentar** trägt die Achse `klaerung_typ` als Badge, keine Schwere
  und keinen Antwort-Hinweis.

## Stories

Titel `v3/Entitäten/Klärung/ClarificationRow` — die Familien-Datei trägt den
Namen ihres Haupt-Exports, wie `Table` und `LogList`. Einen Export namens
`Clarification` gibt es nicht.

| Story | Beweist |
|---|---|
| `Gefuellt` | Zeile und Liste mit realistischen Daten (Musterfirma GmbH, 1.800,00 €, 26.08.2026) |
| `Zustaende` | offen · zurückgestellt · beantwortet · blockierend vs. optional nebeneinander |
| `Kommentar` | `type="comment"` — keine Schwere, keine Antwortfläche |
| `ImStapel` | `groupBy="audience"` mit `showCase` — die Abnahme-Ansicht, vier Zeilen in drei Gruppen |
| `MitKarte` | `renderDetail` + `defaultOpen` — das Aufklappen |
| `Vorschau` | `ClarificationCell` in einer fremden Zeile (Buchungs-Begründung) |
| `ImRahmen` | dieselben Daten durch `toTodoItem` in `TodoList` und dieselbe Klärung in `CaseTimeline`; der Kommentar fehlt im Strang und steht in der Liste |
| `LangeFrage` | Titel über die Spaltenbreite: eine Zeile, Rest im Hover |
| `Leer` | „Keine Rückfragen." mit Zusatz |

Neun Stories, unter der Obergrenze. Nicht anwendbar: `Laedt`, `Fehler`
(oben begründet), `Interaktiv` (keine Callbacks in dieser Datei).

## Ausbau

Nach A12: keine Prop auf Vorrat, hier steht der Plan.

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Massenaktion über mehrere Fragen („alle drei an den Mandanten") | keine — die Liste wechselt dann auf `DataTable` (A11a), die Zeile bleibt | die Stapel-Abnahme bekommt eine Sammel-Handlung; heute hat keine der vier Listen eine |
| Sortierung und Filter | keine — beides gehört der Query bzw. `DataTable` | eine der Listen bekommt eine eigene Route; dann entsteht auch ein Seitenprofil |
| Portal als eigene Ausprägung statt `text="client"` | eine zweite Komponente, nicht eine Prop mehr | der Ton im Portal weicht nachweislich ab (offene Frage 2 des Profils) |
| Vorschau, die die ganze Frage zeigt, ohne zu springen | `ClarificationCell` in `HoverCard` an der Aufrufstelle — keine neue Prop | die Buchungs-Begründung soll die Frage lesbar machen; heute führt sie auf die Seite |
| Zähler „3 offen · 1 zurückgestellt" über der Liste | Markup an der Aufrufstelle, aus denselben Zeilen gerechnet | zwei Aufrufer rechnen ihn selbst |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Zustand, Schwere und Art kommen ausschließlich aus `STATUS_REGISTRY`
      (`klaerung_status`, `klaerung`, `klaerung_typ`) — kein Literal im Code (Story `Zustaende`)
- [ ] `state` wird **nicht** in der Komponente gerechnet: das VM trägt ihn,
      der Aufrufer nimmt `clarificationState()` aus `src/ludwig` (Story `Zustaende`)
- [ ] `showCase` stellt Nummer und Titel des Sachverhalts voran (Story `ImStapel`)
- [ ] `groupBy="audience"` erzeugt genau drei Gruppen in der Reihenfolge
      Kanzlei · Mandant · Agent, leere Gruppen entfallen (Story `ImStapel`)
- [ ] Ohne `renderDetail` bleibt die Datei frei von `"use client"` (Blick in die Datei)
- [ ] `CaseTimeline` überspringt Klärungen mit `type="comment"` und `toTodoItem`
      gibt für sie `null` zurück — der Kommentar steht nur in der Liste (Story `ImRahmen`)
- [ ] Zurückgestellt erscheint als Wort mit Datum, nicht nur farblich (Story `Zustaende`)
- [ ] Der Zustand steht **rechtsbündig** und wandert nicht mit der Titellänge (Story `LangeFrage`)
- [ ] Jedes Datum trägt sein Wort: offen „Gefragt vor …" (relativ, genaue Zeit
      im Hover), beantwortet „Beantwortet am …" (Story `Zustaende`)
- [ ] Der Titel wird auf eine Zeile gekürzt und steht vollständig im
      `title`-Hover (Story `LangeFrage`)
- [ ] Ersetzt die Zeilen aus `ClarificationsBanner`, `Schritt2Liste` und
      `PortalCaseList` ohne Funktionsverlust — offen (App)

## Befunde für `ludwig/app`

1. `ClarificationVM` (`modules/accounting-cases/domain/overview-vm.ts`) wird
   von `scripts/sync-ludwig.sh` **nicht** gespiegelt, weil die Datei
   `@/ui/booking` importiert. Ein reines Domänen-VM sollte keine
   UI-Abhängigkeit haben.
2. Es gibt keinen Label-Katalog für `question_type` (9 Werte im Bestand) und
   `MODULE_LABEL` lebt in `ClarificationsBanner.tsx` — Profil-Befunde B1/B2.
   Diese Spec zeigt beides nicht in der Zeile; die Karte (0060) braucht sie.

## Offene Fragen

1. Reihenfolge innerhalb einer Gruppe — offen zuerst oder streng
   chronologisch? — ohne Antwort: die Liste sortiert gar nicht, der Aufrufer
   liefert die Reihenfolge (so steht es in der Schnittstelle).
2. Wiedervorlage: eigener Knopf in der Zeile? — ohne Antwort: nein, die
   Zeile zeigt den Zustand nur an (offene Frage 1 des Profils).

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` am 2026-09-05, Exit 0. `pnpm build` bewusst nicht erneut gestartet (parallele Abnahmen im selben Repo); der Lauf für diesen Stand meldete „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/clarification/Clarification.tsx` und `Clarification.stories.tsx`; `localhost:6107/index.json` führt alle neun unter `v3/Entitäten/Klärung/ClarificationRow` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | vier Exporte, vier Paare: `Clarification.tsx:88` (`ClarificationCell`), `:121` (`ClarificationRow`), `:222` (`ClarificationList`), `:305` (`toTodoItem`); Props, Typen und Kommentare englisch | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\|[0-9]+px'` über die drei Klärungs-Dateien: kein Treffer. Zustände nur über `StatusBadge` (`Clarification.tsx:74–82`). Einzige Map ist `AUDIENCE_LABEL` (`:34`) — `audience` ist keine Status-Achse (`status-registry.ts:71–73` kennt nur `klaerung`, `klaerung_status`, `klaerung_typ`), die Datei begründet das in einer Zeile | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | 9 von 9 in `index.json`: `…--gefuellt`, `--zustaende`, `--kommentar`, `--im-stapel`, `--mit-karte`, `--vorschau`, `--im-rahmen`, `--lange-frage`, `--leer`. `Laedt`, `Fehler`, `Interaktiv` im Abschnitt „Zustände" begründet | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen; ein Punkt reißt — V3 „Text links, Zahlen rechts" im aufklappbaren Rahmen, siehe die Zeile „Zustand rechtsbündig" | ✗ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle neun Stories unter `http://localhost:6107` in Chrome geöffnet und angesehen; keine Konsolenfehler | ✓ |
| **Variabel** — Zustand, Schwere und Art nur aus `STATUS_REGISTRY` | Story `…--zustaende`: die Wörter „Offen · Zurückgestellt · Beantwortet · Blockierend · Kommentar" stimmen mit `status-registry.ts:673–698` überein; im Code steht kein Status-Text, nur `StatusBadge` mit Achse (`Clarification.tsx:74–82`) | ✓ |
| `state` wird nicht in der Komponente gerechnet | `grep -n "clarificationState" Clarification.tsx` trifft nur den JSDoc-Satz (`:47`), keinen Aufruf; das VM trägt `state` (`:55`) | ✓ |
| `showCase` stellt Nummer und Titel des Sachverhalts voran | Story `…--im-stapel`: „SV-2026-0184  Musterfirma GmbH · 1.800,00 €" steht über der Frage (`Clarification.tsx:142–155`) | ✓ |
| `groupBy="audience"` erzeugt genau drei Gruppen Kanzlei · Mandant · Agent, leere Gruppen entfallen | Story `…--im-stapel`: Gruppenköpfe „Kanzlei 2 · Mandant 1 · Agent 1" in dieser Reihenfolge (`AUDIENCE_ORDER` `:41`); leere Gruppe wird zu `null` (`:271`) | ✓ |
| Ohne `renderDetail` bleibt die Datei frei von `"use client"` | `head -1 Clarification.tsx` = `import type { ReactNode } from "react";`; die Direktive kommt in der Datei nicht vor (im Gegensatz zu `ClarificationCard.tsx:1` und `ClarificationEditor.tsx:1`) | ✓ |
| `CaseTimeline` überspringt `type="comment"`, `toTodoItem` gibt `null` | Story `…--im-rahmen`: fünf Klärungen, davon eine Notiz — die `TodoList` zeigt „RÜCKFRAGEN 4", der Strang vier Einträge, die Liste darunter alle fünf inklusive Kommentar. Code: `CaseTimeline.tsx:203`, `Clarification.tsx:311` | ✓ |
| Zurückgestellt erscheint als Wort mit Datum, nicht nur farblich | Story `…--zustaende`: „zurückgestellt bis 12.09.2026" in der Meta-Zeile, zusätzlich zum Badge „Zurückgestellt" (`Clarification.tsx:196–203`) | ✓ |
| Der Zustand steht **rechtsbündig** und wandert nicht mit der Titellänge | **Ohne `detail` erfüllt:** Story `…--lange-frage`, beide `.v2cl__state` enden bei x = 1307, obwohl der eine Titel 216 Zeichen trägt und der andere 33 (im Browser gemessen). **Mit `detail` verletzt:** Story `…--mit-karte`, `.v2cl__state` endet bei 517 bzw. 466 bei einem `<summary>`, das bis 1323 reicht — der Chip klebt am Titel und wandert mit ihm. Ursache: `.v2disc__sum` ist Flex und legt die Zusammenfassung in ein nicht wachsendes `<span>` (`Disclosure.tsx:50`); `v3.css:2305` setzt für den Fall nur `padding-left`, nicht `flex: 1` auf `.v2cl__row`. Betroffen ist genau die Bauform, für die die Liste gedacht ist (`renderDetail` = die Karte aus 0060) | ✗ |
| Jedes Datum trägt sein Wort | Story `…--zustaende`: offen „Gefragt vor 10 Tagen" (`format="age"`, genaue Zeit im Hover), beantwortet „Beantwortet 21.08.2026", Kommentar „Notiert vor 9 Tagen". Anmerkung: die Spec schreibt „Beantwortet **am** …", die Zeile lässt das „am" weg | ✓ |
| Der Titel wird auf eine Zeile gekürzt und steht vollständig im `title`-Hover | Story `…--lange-frage`: `.v2cl__clamp` hat `scrollWidth > clientWidth` und ein `title`-Attribut mit 216 Zeichen (im Browser ausgelesen) | ✓ |
| Ersetzt die Zeilen aus `ClarificationsBanner`, `Schritt2Liste` und `PortalCaseList` | in `ludwig/app` nicht angefasst; `grep -rl "@/ui/v2" apps/web/src` = 39 Dateien, unverändert | offen (App) |

Abgenommen von / am: — (zurück in Arbeit) · Abnahme durch Claude (Abnahme-Agent), 2026-09-05

Offene Punkte:

1. **Der Zustand ist im aufgeklappten Rahmen nicht mehr rechtsbündig.** In
   `ClarificationRow` mit `detail` (und damit in jeder `ClarificationList` mit
   `renderDetail`) verliert `.v2cl__row` seine Breite, weil `.v2disc__sum` die
   Zusammenfassung in ein nicht wachsendes `<span>` legt. Damit fällt die
   Zustands-Spalte weg, die die Zeile ausdrücklich herstellen soll — nachweisbar
   in Story `…--mit-karte`. Eine Regel im 0059-Block von `v3.css` (etwa
   `flex: 1` auf `.v2cl__item > .v2disc .v2cl__row`) genügt; die Prüfung, ob sie
   besser in `Disclosure` gehört, gehört zum Fix.
2. Kleinigkeit ohne eigenen Mangel: die Meta-Zeile schreibt „Beantwortet
   21.08.2026", die Spec „Beantwortet **am** …".

Befund für 0040 (nicht hier geändert): die Mitbringsel-Zusage „0040 bekommt eine
Zeile im Abschnitt ‚Abnahme' mit dem Verweis hierher" ist nicht eingelöst — die
Abnahme-Tabelle von `0040-case-timeline.md` ist leer, der Status steht auf
„Abnahme". Außerdem ist der JSDoc-Kopf von `CaseTimeline.tsx` beim Einfügen der
Kommentar-Regel mitten in einen bestehenden Satz gelaufen (Zeile 38: „… in
`ClarificationList` (0059). Today they stand in three places and every card
carries five lines;").

## Die zwei offenen Punkte — behoben

**1 — der Zustand steht wieder rechtsbündig, und der Fix sitzt in
`Disclosure`.** Die Abnahme hatte beides angeboten: eine Regel im 0059-Block
oder eine in `Disclosure`. Es ist die zweite geworden, und zwar aus dem Grund,
den 0093 (e) nennt: `.v2disc__sum` legte die Zusammenfassung in ein `<span>`
ohne eigene Breite, und das trifft **jede** Zeile mit rechter Spalte in einem
`<details>` — nicht nur die Klärung. Eine Regel in der Klärung hätte den
nächsten Fall wieder überrascht.

Das `<span>` heißt jetzt `.v2disc__label` und wächst (`flex: 1 1 auto`).
Nachgemessen (Chromium headless, Story `MitKarte`): die aufklappbare Zeile
läuft von x = 47 bis 1415, der Zustands-Chip endet bei 1399 — am Zeilenrand,
wie in der nicht aufklappbaren Zeile. Vorher endete er bei 517.

Nebenwirkung, bewusst: `count` rückt damit an den rechten Rand der
Zusammenfassung. Aufrufer gibt es dafür heute nur in Stories, und eine Zahl
gehört rechts (V3).

**2 — „Beantwortet am".** Die Meta-Zeile schrieb „Beantwortet 21.08.2026", die
Spec verlangt das „am". Steht.

Damit ist Punkt **(e)** von 0093 erledigt; die übrigen vier Punkte dort
bleiben offen.

## Abnahmekriterien (Nachtrag)

- [ ] Der Zustand steht auch in der aufklappbaren Zeile am rechten Rand (Story `MitKarte`, gemessen)
- [ ] Die Regel steht in `Disclosure`, nicht im 0059-Block (`grep .v2disc__label`)
- [ ] Die Meta-Zeile sagt „Beantwortet am …" (Story `Zustaende`)

## Abnahme des Nachtrags (2026-09-05)

Zweite Abnahme, gegen Spec und Code, von einer Sitzung, die nicht gebaut hat.
Gemessen in Chromium 153 headless über CDP auf `localhost:6107`; die Kästen
sind `getBoundingClientRect()` bei 1440 px Fensterbreite.

**Story-Deckung.** Unverändert neun Stories, neun Kennungen in `index.json`
unter `v3/Entitäten/Klärung/ClarificationRow` (`--gefuellt`, `--zustaende`,
`--kommentar`, `--im-stapel`, `--mit-karte`, `--vorschau`, `--im-rahmen`,
`--lange-frage`, `--leer`). Der Nachtrag hat keine Prop hinzugefügt — die
Reparatur sitzt in `Disclosure` und im Text der Meta-Zeile —, also ist keine
neue Story fällig. `Laedt`, `Fehler` und `Interaktiv` bleiben begründet
ausgeschlossen.

**Fest**

| Kriterium | Nachweis (Story-Kennung · Befehl · Messwert) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` am 2026-09-05, Exit 0, keine Ausgabe. `pnpm build` bewusst nicht gestartet — mehrere Sitzungen schreiben parallel nach `storybook-static`, der Auftrag dieser Abnahme verbietet ihn | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/entities/clarification/Clarification.tsx` und `Clarification.stories.tsx`; alle neun Kennungen unter `v3/Entitäten/Klärung/ClarificationRow` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | vier Exporte, vier Paare: `ClarificationCell` (`:87–92`), `ClarificationRow` (`:120–126`), `ClarificationList` (`:221–227`), `toTodoItem` (`:299–309`). Kommentare, Props und Typen englisch; deutsch stehen nur Nutzer-Strings („Keine Rückfragen.", „Kanzlei", „zurückgestellt bis"). Die Typ-Exporte `ClarificationAudience` und `ClarificationVM` tragen keine `@when`/`@instead` — wie überall im Set bei reinen Typen | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\|[0-9]+px'` über die Klärungs-Dateien: kein Treffer. Zustände ausschließlich über `StatusBadge` mit Achse (`:72–85`). Einzige Map ist `AUDIENCE_LABEL` (`:34`); `audience` ist keine Status-Achse, und die Datei begründet das in `:33` | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Der Punkt, der beim ersten Mal riss — V3 „Text links, Zahlen rechts, nichts zentriert" im aufklappbaren Rahmen — hält jetzt; gemessen in der Nachtrags-Tabelle. Die übrigen Punkte unverändert: Zeilenhöhe über `.v2cl__row` aus Tokens, jeder farbige Zustand mit Wort (`StatusBadge`), Fokusring am `<summary>` (`v3.css:1692`), Karte mit Rand statt Schatten, Texte nach T1–T5. Die zwei App-Punkte übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle neun Kennungen am 2026-09-05 geöffnet und vermessen; zusätzlich `Disclosure --*` und `RawRecord --*` als fremde Aufrufer der geänderten Regel. Keine Konsolenfehler | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-Kennung · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Zustand, Schwere und Art nur aus `STATUS_REGISTRY` | `--zustaende`: die Chips lesen „Offen", „Offen", „Zurückgestellt Blockierend", „Beantwortet"; `--kommentar` „Kommentar". Im Code steht kein Status-Text, nur `StatusBadge` mit `axis` (`:74`, `:78`, `:81`) | ✓ |
| `state` wird nicht in der Komponente gerechnet | `grep -n "clarificationState" Clarification.tsx` trifft nur den JSDoc-Satz (`:47`), keinen Aufruf; das VM trägt `state` (`:55`) | ✓ |
| `showCase` stellt Nummer und Titel des Sachverhalts voran | `--im-stapel`: vier `.v2cl__case`, alle in der Form „SV-2026-0184 Musterfirma GmbH · 1.800,00 €" über der Frage (`:142–155`) | ✓ |
| `groupBy="audience"` erzeugt genau drei Gruppen Kanzlei · Mandant · Agent, leere entfallen | `--im-stapel`: `.v2cl__group` liefert „Kanzlei 2", „Mandant 1", „Agent 1" in dieser Reihenfolge (`AUDIENCE_ORDER` `:41`); eine leere Gruppe wird zu `null` (`:271`) | ✓ |
| Ohne `renderDetail` bleibt die Datei frei von `"use client"` | `head -1 Clarification.tsx` = `import type { ReactNode } from "react";`; die Direktive kommt in der Datei nicht vor | ✓ |
| `CaseTimeline` überspringt `type="comment"`, `toTodoItem` gibt `null` | `--im-rahmen`: fünf Klärungen, davon eine Notiz; die `TodoList` beginnt mit der ersten Frage, der Strang zeigt vier Einträge, die Liste darunter alle fünf. Code: `CaseTimeline.tsx:204–205` (`if (c.type === "comment") continue;`), `Clarification.tsx:311` | ✓ |
| Zurückgestellt erscheint als Wort mit Datum, nicht nur farblich | `--zustaende`, dritte Zeile: Meta liest „Agent · Gefragt vor 16 Tagen · zurückgestellt bis 12.09.2026", zusätzlich zum Chip „Zurückgestellt" (`:196–203`) | ✓ |
| Der Zustand steht **rechtsbündig** und wandert nicht mit der Titellänge | `--lange-frage`: beide `.v2cl__state` enden bei x = 1407, obwohl der eine Titel überläuft und der andere nicht. `--gefuellt`: alle fünf enden bei 1407. `--mit-karte` (aufklappbar): beide enden bei 1399 — siehe Nachtrags-Tabelle | ✓ |
| Jedes Datum trägt sein Wort | `--zustaende`: „Gefragt vor 10 Tagen", „Gefragt vor 8 Tagen", „Gefragt vor 16 Tagen", „Beantwortet am 21.08.2026"; `--im-rahmen` zusätzlich „Notiert vor …" für die Notiz (`:185–194`) | ✓ |
| Der Titel wird auf eine Zeile gekürzt und steht vollständig im `title`-Hover | `--lange-frage`, erste Zeile: `.v2cl__clamp` hat `scrollWidth > clientWidth` und ein `title` mit dem ganzen Satz; die zweite Zeile läuft nicht über und beweist die Gegenprobe | ✓ |
| Ersetzt die Zeilen aus `ClarificationsBanner`, `Schritt2Liste` und `PortalCaseList` | betrifft `ludwig/app` | offen (App) |

**Nachtrag**

| Kriterium | Nachweis (Story-Kennung · Befehl · Messwert) | Ergebnis |
|---|---|---|
| Der Zustand steht auch in der aufklappbaren Zeile am rechten Rand (Story `MitKarte`, gemessen) | `--mit-karte`, beide Zeilen: `summary.v2disc__sum` läuft von 17 bis 1423, `.v2disc__label` und die darin liegende `.v2cl__row` von 47 bis 1415, der Chip endet bei **1399** — bei beiden gleich, obwohl der eine Titel 45 und der andere 52 Zeichen trägt und der eine zwei Chips hat, der andere einen. Vorher endete er bei 517. Vergleich mit der nicht aufklappbaren Zeile (`--gefuellt`): Zeile 17 bis 1423, Chip endet bei 1407. Die 8 px Unterschied sind das eigene `padding: var(--space-2)` des `<summary>`, das links dieselben 8 px (plus Chevron) kostet — die Spalte steht, sie sitzt nur um die Einrückung des Aufklappers weiter innen | ✓ |
| Die Regel steht in `Disclosure`, nicht im 0059-Block (`grep .v2disc__label`) | `.v2disc__label { flex: 1 1 auto; min-width: 0; }` steht in `v3.css:1705`, im Disclosure-Block (1682–1708), mit sieben Zeilen Begründung darüber. Im Klärungs-Block (2295–2320) steht keine Regel dazu; `.v2cl__item > .v2disc .v2cl__row` (`:2308`) setzt weiterhin nur `padding-left: 0`. Im Markup heißt das `<span className="v2disc__label">` (`Disclosure.tsx:50`) | ✓ |
| Die Meta-Zeile sagt „Beantwortet am …" (Story `Zustaende`) | `--zustaende`, vierte Zeile: Meta liest „Kanzlei · Beantwortet am 21.08.2026". Im Code `Clarification.tsx:186–188` | ✓ |

**Die Nebenwirkung: `count` an einer `Disclosure` rückt nach rechts**

Der Fix macht `.v2disc__label` wachsend, und damit steht ein `count` nicht
mehr neben dem Wort, sondern am rechten Rand der Zusammenfassung. Gemessen:

| Story | Text endet bei | `count` steht bei | Lücke |
|---|---|---|---|
| `Disclosure --with-count` | x = 281 | 514–528 | 233 px |
| `Disclosure --default-open` | — | 520–528 | am Rand |
| `Disclosure --in-use` (erste) | — | 539–547 | am Rand |
| `RawRecord --in-use`, drei Aufklapper | 244 · 249 · 205 | 723–728 · 720–728 · 714–728 | 479 · 471 · 509 px |

**Urteil: es trägt, mit einer Einschränkung.** Im Stapel — und das ist der
Regelfall, `RawRecord --in-use` mit drei Aufklappern untereinander — bilden
die Zahlen 1, 6 und 12 eine saubere rechte Spalte, die man von oben nach
unten lesen kann. Genau das will V3 („Zahlen rechts"), und vorher klebte
jede Zahl an ihrem verschieden langen Tabellennamen und stand deshalb an
drei verschiedenen Stellen. Ein Vergleich war unmöglich, jetzt ist er
kostenlos. Auch am Einzelfall (`Disclosure --with-count`, Bild geprüft)
liest sich die „14" am rechten Rand wie die Zahl einer Zeile, nicht wie ein
verlorener Rest.

Die Einschränkung ist keine der Optik, sondern der Dokumentation: das JSDoc
der Prop sagt weiter „stands next to the summary" (`Disclosure.tsx:31`), und
das stimmt nicht mehr. Kein Mangel dieser Aufgabe — 0059 ändert `Disclosure`
nur an einer Stelle und schuldet dessen Spec nichts —, aber wer 0005 das
nächste Mal anfasst, sollte den Satz auf „am rechten Rand der
Zusammenfassung" ziehen. Als Befund unten notiert.

Ein zweiter Blick galt der Frage, ob die Regel etwas anderes verschiebt:
`Disclosure --filled`, `--variants` und `--accordion` haben keinen `count`;
dort endet das Label jetzt bei 528 statt bei seiner Textbreite, was nichts
bewegt, weil nichts dahinter steht. `Timeline.tsx:198` und `Log.tsx:201`
benutzen `Disclosure` ebenfalls ohne `count`.

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **Der Chevron sitzt in der aufklappbaren Zeile auf halber Höhe.** Weil
  `.v2disc__sum` `align-items: center` hat und die Klärungszeile zwei Bänder
  trägt, steht das Dreieck zwischen Titel- und Meta-Zeile statt neben dem
  Titel (`--mit-karte`, Bild). Fällt unter kein Kriterium und ist Geschmack,
  aber es ist die einzige Stelle, an der die aufklappbare Zeile anders wirkt
  als die flache.
- **Die Story-Tabelle sagt „`ImStapel` … 12 Zeilen", die Story hat vier.**
  Die Gruppen stimmen (Kanzlei 2 · Mandant 1 · Agent 1), die Zahl im
  Spec-Text nicht. Betrifft kein Kriterium; entweder die Zahl korrigieren
  oder die Story auf die zwölf Zeilen bringen, die die Stapel-Abnahme
  wirklich zeigt.
- **Der Befund für 0040 aus der ersten Abnahme steht noch.** `0040-case-timeline.md`
  hat weiter eine leere Abnahme-Tabelle und Status „Abnahme"; die zugesagte
  Zeile mit dem Verweis auf 0059 fehlt. Der JSDoc-Kopf von `CaseTimeline.tsx`
  ist inzwischen sauber — die Kommentar-Regel steht in `:35–37` und wird in
  `:204–205` ausgeführt —, der Verweis in 0040 aber nicht.
- **Befund für 0005 (`Disclosure`):** das JSDoc von `count` (`Disclosure.tsx:31`)
  beschreibt die alte Lage.

Abgenommen von / am: **Claude (Abnahme-Agent), 2026-09-05**
