# 0059 · Clarification — Vorschau, Zeile, Liste

| | |
|---|---|
| Status | Abnahme |
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
| `ImStapel` | `groupBy="audience"` mit `showCase` — die Abnahme-Ansicht, 12 Zeilen |
| `MitKarte` | `renderDetail` + `defaultOpen` — das Aufklappen |
| `Vorschau` | `ClarificationCell` in einer fremden Zeile (Buchungs-Begründung) |
| `ImRahmen` | dieselben Daten durch `toTodoItem` in `TodoList` und dieselbe Klärung in `CaseTimeline`; der Kommentar fehlt im Strang und steht in der Liste |
| `LangeFrage` | Titel über die Spaltenbreite: eine Zeile, Rest im Hover |
| `Leer` | „Keine Rückfragen." mit Zusatz |

Neun Stories, unter der Obergrenze. Nicht anwendbar: `Laedt`, `Fehler`
(oben begründet), `Interaktiv` (keine Callbacks in dieser Datei).

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
| | | |

Abgenommen von / am: … · Offene Punkte: …
