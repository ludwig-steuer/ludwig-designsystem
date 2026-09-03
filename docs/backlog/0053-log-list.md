# 0053 · LogList — das Protokoll als Tabelle: eine Zeile für jede Quelle

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` — Gruppe Prozess, neben `Timeline` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald sie ein Protokoll führt — Zeit, Schwere, Akteur, Meldung, Details sind fachfrei |
| Quelle | Anfrage Owner 2026-09-03 („Logbrowser, aber auch Log Rows … fachlich und technisch … prinzipiell immer ein filterbarer zeitlicher Verlauf … eher Tabellenformat") · App-Inventar `ludwig-UX-guidelines-v2.md` §11.2 („Log-Ansicht, Sichten Verlauf/Protokoll/Technik → Optik") und **Z6** („Log = ein Strom, drei Sichten") · `web-ui-regeln.md` **R7** („Log-Ansichten teilen die Darstellung, nicht die Herkunft") · Befund **B5** in `ui-repraesentationen.md` · Vorlage `app/apps/web/src/ui/components/log/` (5 Dateien) · Design `design/Ludwig Design System v2/preview/audit-trail.html` (Akteur-Arten Nutzer · Ludwig · System) |
| Ersetzt | `LogEntry`, `LogTable`, `LogView`, `LogBadges`, `LogPayloadCell` (`ui/components/log/`) · `AuditLogTable` (`modules/audit-log/ui`, 122 Z., eigener Expand-State) · `InvoiceTracesTable`, `ExtractionLogsTable` (`modules/invoices/ui/logs`) · `STEP_LOG_COLUMNS` in `app/(app)/clients/[clientSlug]/[year]/agent-runs/[runId]/page.tsx` |
| Blockiert | 0054 `LogBrowser` · Welle 3: `admin/audit-log`, `admin/jobs`, `configuration/logs`, `admin/tenants/[tenantId]/clients/[clientId]` · Pipeline-Tab des Belegs · Stapel-Log `[year]/stapel/[batchId]` · Welle 4: `agent-runs/[runId]` |
| Spec von / am | Claude, 2026-09-03 |
| Gebaut von / am | Claude, 2026-09-03 · nachgebessert 2026-09-03 (drei Punkte der ersten Abnahme) |

## Ziel

Die Prüferin fragt „wer hat wann was getan — und was hat die Maschine
dazwischen gemacht?": am Mandanten (Audit), am Beleg (Pipeline-Spur), am Lauf
(Teilschritte), am Stapel (Ereignisstrom), systemweit (Admin). Die Antwort ist
immer dieselbe Form: eine chronologische Tabelle mit Zeit, Schwere, Akteur,
Meldung und aufklappbaren Einzelheiten.

Heute baut die App diese Tabelle fünfmal: `LogView` für Zeilen im
`LogEntry`-Shape, `AuditLogTable` mit eigenen acht Spalten und eigenem
Expand-State, `InvoiceTracesTable` und `ExtractionLogsTable` mit je eigener
Spaltenliste, die Teilschritt-Tabelle des Laufs mit einer dritten. Vier
Zeitformate, drei Level-Badges (eine mit `WARN`), zwei Payload-Darstellungen.
R7 verlangt eine geteilte Darstellung; B5 hält fest, dass die Regel zur Hälfte
greift.

Neu: **eine Zeile** (`LogEntry`), auf die jede Quelle mappt, und **eine
Liste** (`LogList`), die daraus die Tabelle baut — Spalten, für die keine
Zeile Daten hat, entfallen; eine Zeile mit Einzelheiten klappt auf. Fachlich
und technisch sind nicht zwei Komponenten und nicht zwei Zeilen, sondern eine
**Tiefe** an der Zeile (Z6), die 0054 zum Umschalten nutzt.

## Abgrenzung zu `Timeline` (0023)

Beide zeigen, was wann geschah. Sie trennen sich an Menge und Leserin:

| | `Timeline` | `LogList` |
|---|---|---|
| Frage | „Warum steht es so, wie es steht?" | „Wer hat wann was getan, mit welchem Ergebnis — und was lief dazwischen?" |
| Menge | Dutzende; eine Lücke ist eine Aussage (`GAP_DAYS`) | Hunderte bis Tausende; Lücken sagen nichts |
| Form | Strang, Tagesgruppen, zweite Zeile Art · Akteur | Tabelle, Schwere aus der Registry, Akteur, Code, Bezug, Payload |
| Leserin | Sachbearbeiterin am Objekt | Prüferin, Support, Entwicklerin |
| Filter | keiner | Sicht, Schwere, Suche (0054) |

Faustregel: **Timeline erzählt, Log belegt.** Dieselben Zeilen passen in
beide (`LogEntry → TimelineItem` ist `at, title: message, kind: code, actor`),
gekoppelt wird nichts. Konsequenz für die App: `SourceDocVerlaufTab` und
`VerlaufTab` (Beleg) sind Timeline-Fälle — sie ziehen nicht hierher.

## Einordnung

- **Wiederverwenden:** kein Treffer, der die Zeile trägt.
  - `Timeline` (`@when „Why does this stand the way it stands?" — the history
    of a case, a document, a run, an audit trail`) — nennt den Audit-Trail,
    kann ihn aber nicht: keine Schwere, kein Code, kein Bezug, kein Payload,
    und ab hundert Zeilen ist ein Strang mit Tagesüberschriften keine
    Prüfungsgrundlage mehr. Die `@when`-Zeile wird korrigiert (Kriterium
    unten).
  - `Table`/`Row`/`GroupRow` (`@when Records of the same kind in columns`) —
    tragen die **Optik**, nicht die Logik: welche Spalten aus den Daten
    fallen, Schwere über die Registry, Sortierung, Aufklappen. Das ist das
    Markup, das die App heute fünfmal schreibt.
  - `ExpandableRow` (`@when A small extra detail for a row that is read and
    collapsed again`) — Client-Komponente. Die Liste soll Server bleiben;
    die Einzelheiten stehen als `Disclosure` (nativ `<details>`) in der Zelle.
  - `ComparisonTable`, `TodoList`, `StepRail` — andere Fragen.
- **Neu, weil:** `spec-schreiben` §3.4 — die Komposition trägt eigene Logik
  und einen Tastaturweg (Aufklappen) und kommt auf **sechs** Screens vor
  (Audit systemweit und je Mandant, Beleg-Pipeline, Lauf, Stapel, Jobs).
  Wie bei `Timeline`: ohne die Komponente schreibt jede Seite die
  Spaltenableitung selbst — genau der Zustand, den B5 beschreibt.
- **Zuschnitt:** eine Datei `patterns/Log.tsx` mit dem Typ `LogEntry` und
  dem Export `LogList`. Die Zeile bleibt **intern** — eine Log-Zeile ohne
  Tabelle hat kein eigenes `@when` (allein stehend ist sie ein
  `TimelineItem`). `LogBrowser` (0054) ist eine **eigene Datei**: er braucht
  `"use client"`, die Liste nicht, und die Liste wird allein gebraucht
  (Teilschritte am Lauf, Verlauf-Karte am Stapel) — §4.
- **Setzt auf:** `Card`/`Table`/`HeadRow`/`Row`/`EmptyRow` (Markup) ·
  `Time` (0033) · `StatusBadge` mit Achse `log_level` · `MonoCell` ·
  `Disclosure` · `Link` · `Skeleton` (0016).

## Schnittstelle

### Die Zeile: `LogEntry`

Der Keim ist das App-`LogEntry` (`at · level? · source? · message · refs? ·
payload?`). Sechs Felder fehlen ihm, die die echten Quellen alle haben:

```ts
export interface LogEntry {
  id: string;
  /** ISO timestamp. */
  at: string;
  /** One sentence, German — what a person reads. */
  message: string;
  /** Registry axis `log_level`. Missing → the column disappears. */
  level?: LogLevel;
  /** Who caused it. `kind` is a value of the axis `actor_kind`; `label` the person or job name. */
  actor?: { kind: string; label?: string };
  /** Writing process or module: „Classifier", „web", „bridge". */
  source?: string;
  /** Stable key: action · step_kind · step_code. The technical column, and the filter key. */
  code?: string;
  /** 1 Verlauf · 2 Protokoll · 3 Technik (Z6). Missing → 2. Read by 0054, ignored here. */
  depth?: 1 | 2 | 3;
  /** What it concerns: document, case, entry. Without `href` plain text. */
  refs?: { label: string; href?: string }[];
  /** One line under the message: gate reason, reviewer comment. */
  detail?: string;
  /** Structured details, folded away as JSON. */
  payload?: unknown;
  /** One extra cell: confidence, amount, gate result. */
  right?: ReactNode;
}

export type LogLevel = "debug" | "verbose" | "info" | "warning" | "error";
```

`LogLevel` ist die Achse `log_level` als Union — identisch mit
`InvoiceTraceLevel` (`src/ludwig/modules/invoices/domain/invoice.ts`), aber
das Pattern kennt keinen Beleg (Befund 3). `actor.kind` bleibt `string` wie
`status` am `StatusBadge`: die Werte gehören der Registry-Achse, nicht dem
Typ (Befund 4).

**Mapping je Quelle** — mechanisch, gehört an die Seite, nicht ins Set:

| Quelle (Typ aus `src/ludwig/`) | `message` | `level` | `actor` | `source` | `code` | `depth` | `detail` / `right` |
|---|---|---|---|---|---|---|---|
| `platform_audit_events` (`AuditEvent`, `audit-log/domain/types.ts`) | `message` | `outcome`: success → info · partial → warning · failure → error | `{ actorKind, actorLabel }` | `source` | `action` | `batchLogDepth(action, outcome)` (`datev-export/domain/batch-log.ts`) | Bezug: `resourceKind:resourceId` als `refs`; Vorgang als `refs`-Link `?correlationId=` |
| `client_invoice_traces` (`InvoiceTraceEntry`, `invoices/domain/invoice.ts`) | `summary` | `level` | `actor` → `{ kind: "user", label: actor }` bei Review, sonst `{ kind: "agent" }` | `module` | `stepKind` | `finding` → 1 · `review` → 2 · sonst 3 | `detail: comment` · `right: <Konfidenz>` |
| `ops_extraction_logs` (Workflows-`/debug`, kein Typ im Spiegel) | `message` | `level` normalisiert: `WARN` → warning, klein | `{ kind: "system" }` | `module` | `step` | 3 | — |
| `client_agent_run_steps` (kein Typ im Spiegel, Befund 5) | Schritt-Titel aus `AGENT_RUN_STEP_META` | `gate_result`: blocked → warning · passed → info | `{ kind: "agent" }` | — | `step_code` | 3 | `detail: blocked_reason` · `right: Gate-Ergebnis` |
| `ops_jobs` (kein Typ im Spiegel) | `job_type`-Label + Status | `status`: failed → error | `{ kind: "system" }` | „Job" | `job_type` | 2 | `detail: error` |

### Die Liste: `LogList`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `entries` | `LogEntry[]` | ja | Unsortiert erlaubt — die Komponente sortiert nach `at`, gleiche Zeit behält die Eingabereihenfolge. Zwei Quellen mischen (Spur + Extraktions-Log) geht nur so | `Filled` |
| `order` | `"newest" \| "oldest"` | nein | Default `newest`. Einen Lauf liest man von vorn, ein Audit vom Ende | `Order` |
| `emptyText` | `string` | nein | Default „Noch nichts protokolliert." — mit Grund, wenn die Seite einen kennt | `Empty` |
| `loading` | `boolean` | nein | `Skeleton`, der Platz bleibt | `Loading` |

Typen aus `src/ludwig/`: keine im Pattern selbst — die Mapper (oben) nutzen
`AuditEvent`, `InvoiceTraceEntry`, `batchLogDepth`. GLOSSARY: *Audit event*
(Audit-Ereignis), *Invoice trace* (Beleg-Spur), *Invoice log entry* (Befund),
*Agent run* (Durchgang) — englisch im Code der Mapper, deutsch in `message`.

**Was die Komponente nicht kann (bewusst):**

- **Filtern, suchen, Sicht umschalten.** Das ist 0054. Die Liste zeigt, was
  sie bekommt, und ignoriert `depth`.
- **Freie Spalten.** `right` ist der eine Slot. Wer drei Zusatzspalten
  braucht (Gate, offene Posten, Dauer), hat keine Log-Zeile, sondern eine
  Tabelle — `Table` mit eigenen Zellen, `Duration` aus 0033.
- **Laden, nachladen, paginieren.** Daten kommen als Props; „Ältere laden"
  gehört zu 0054, Seiten in der URL zu `Pagination`.
- **Zeilen auswählen oder öffnen.** Das Detail steht in der Zeile. Ein Objekt
  neben der Liste bearbeiten → `MasterDetail`, dessen Verlauf → `Timeline`.
- **Lücken, Tagesgruppen.** Das ist die Aussage der `Timeline`; im Protokoll
  steht das Datum an jeder Zeile.
- **Kürzen.** Eine Meldung bricht um, sie wird nicht abgeschnitten — ein
  Protokoll, das man nicht lesen kann, ist keins.

## Verhalten

- **Spalten aus den Daten**, in dieser Reihenfolge: Zeit · Schwere · Akteur ·
  Quelle · Meldung · Code · Bezug · Zusatz. Jede Spalte außer Zeit und
  Meldung entfällt, wenn **keine** Zeile das Feld trägt (Regel aus
  `logEntryColumns`; Test `log-entry-columns.test.ts` zieht mit). Eine
  Quelle ohne Schwere zeigt keine leere Schwere-Spalte.
- **Zeit:** `Time` mit `format="dateTime"`, Europe/Berlin (T7), `dateTime`-
  Attribut gesetzt, volle Form im `title`. Kein `toLocaleString` ohne
  Zeitzone (P3 in `web-ui-offen.md` erledigt sich damit).
- **Schwere:** `StatusBadge axis="log_level"` ohne Info-Knopf je Zeile
  (`info={false}`) — bei zweihundert Zeilen wäre das Rauschen; die
  Spaltenüberschrift trägt die Achsen-Erklärung als `title`. Farbe nur als
  Kritikalität (V6), immer mit Wort (V7).
- **Akteur:** Wort, nie nur Farbe: `label`, sonst das Achsen-Label von
  `actor_kind` über `resolveStatus`; unbekannter Wert → Rohwert (Registry-
  Konvention). Die Design-Vorlage `audit-trail.html` färbt drei Akteur-Arten
  über Punkte — hier steht das Wort, der Punkt ist Zugabe des Badges.
- **Quelle** und **Code** in `MonoCell` — Codes sind Schlüssel, keine Sätze.
- **Meldung:** Fließtext, bricht um. Darunter `detail` in `.v2sub`. Darunter,
  nur wenn `payload` gesetzt: `Disclosure summary="Einzelheiten" tone="quiet"`
  mit `<pre>` JSON (`JSON.stringify(payload, null, 2)`, `overflow-x: auto`,
  Höhe begrenzt). Leeres Objekt zählt als kein Payload. So bleibt die Tabelle
  schmal — dieselbe Lösung wie `Timeline.detail`.
- **Bezug:** `refs` als `Link`, wenn `href`, sonst Text; getrennt mit „ · ".
- **Zusatz:** `right` rechtsbündig, `tnum` (V3).
- **Tastatur:** `Disclosure`-Summary ist ein Fokus-Stopp, `Enter`/`Leertaste`
  klappt; Links tabbar. Die Zeile selbst ist stumm — sie hat kein Ziel (I11).
  Kein Hover auf der Zeile.
- **Zustände:** gefüllt · leer (`EmptyRow` mit `emptyText`) · lädt
  (`Skeleton`). *Nicht:* leer nach Filter (0054) · Fehler (`ErrorRow` an der
  Aufrufstelle — die Liste lädt nicht).
- **Server-Component:** kein State, kein Effekt; Aufklappen ist nativ.
- **CSS:** `.v2log*` in `v3.css` (Präfix geprüft: frei), nur Tokens; Zeilen
  ≤ `.v2tbl__row` (V1) — `detail` und Einzelheiten sind Zugaben, die die
  Zeile nur dann höher machen, wenn sie da sind.

## Stories

Abgeleitet nach §6. Titel `v3/Patterns/Prozess/LogList`.

| Story | Beweist |
|---|---|
| `Filled` | Audit eines Mandanten, zwölf Zeilen, bewusst unsortiert übergeben; alle Spalten besetzt |
| `Empty` | `emptyText` mit Grund („Für diesen Beleg ist noch nichts protokolliert.") |
| `Loading` | Skeleton, der Platz bleibt |
| `Order` | `newest` und `oldest` nebeneinander mit denselben Zeilen |
| `Levels` | alle fünf Werte von `log_level` und alle Akteur-Arten untereinander — die Varianten-Story der Zeile |
| `Edge` | 200 Zeilen · Meldung mit 300 Zeichen · Payload mit 40 Schlüsseln · Zeile ohne Schwere und ohne Akteur neben Zeilen mit beidem (Spalten bleiben, weil andere sie tragen) · Quelle ganz ohne Schwere (Spalte fehlt) |
| `InUse` | in `Card` mit `CardHead`: die Beleg-Pipeline — `InvoiceTraceEntry[]` und Extraktions-Logs über die Mapper aus der Tabelle oben in **eine** Liste gemischt, Konfidenz in `right`; daneben zwölf `AuditEvent` mit `batchLogDepth`. Der Beweis, dass die Zeile alle Quellen trägt |

Sieben Stories (Pattern-Untergrenze 4, Obergrenze 10): drei Zustände, eine
Enum-Prop, eine Varianten-Story der Zeile, ein Rand, ein Einsatz; kein
Callback, kein Layout-Boolean.

**Nicht anwendbar:** `EmptyAfterFilter` — die Liste filtert nicht (0054).
`Error` — die Liste lädt nicht; `ErrorRow` gehört der Seite.

## Abnahme

Zweite Runde, nach der Nachbesserung `d1a1984`. Jedes Kriterium neu geprüft —
auch die einundzwanzig, die schon standen: die erste Runde kann sich geirrt
haben. Gemessen im DOM unter `http://localhost:6107`, Befehle im Stand
`d1a1984`.

| Kriterium | Nachweis (Story-ID · Befehl · Codestelle) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | Nach der Nachbesserung erneut gelaufen: `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; `pnpm build` → „Storybook build completed successfully", Exit 0 (nur die bekannte Chunk-Size-Warnung von Vite) | ✓ |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/Log.tsx` (Familie `LogEntry` + `LogList`), `Log.stories.tsx` daneben, `Log.stories.tsx:11` `title: "v3/Patterns/Prozess/LogList"` — dieselbe Gruppe wie `Timeline`; Barrel `index.ts:211` `export { LogList, type LogEntry, type LogLevel }` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | **Nachgebessert.** `Konfidenz` → `Confidence` (`Log.stories.tsx:79`, Aufruf `:52`). Alle Bezeichner beider Dateien durchgezählt (`grep -nE "^(export )?(function\|const\|type\|interface) …"`): `hasPayload`, `carries`, `actorText`, `levelLegend`, `LogRow`, `COLUMNS`, `MIN_WIDTH` / `fromAuditEvent`, `fromInvoiceTrace`, `fromExtractionLog`, `Confidence`, `AUDIT`, `LEVELS`, `ACTORS`, `LONG`, `WIDE_PAYLOAD`, `MANY`, `TRACES`, `EXTRACTION`, `AUDIT_EVENTS` — kein deutsches Wort mehr; Deutsch nur noch in Strings, die Nutzer sehen. `@when`/`@instead` an `LogList` (`Log.tsx:117–124`); `LogEntry`/`LogLevel` sind Typen und folgen darin `Time.tsx` (`TimeSize` ohne `@when`) | ✓ |
| **Fest** — Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | Kein Hex in `Log.tsx`/`Log.stories.tsx`. px im TSX nur im `cols`-Grid-Template (`Log.tsx:59–68`) und in `MIN_WIDTH` (`:73–82`) — die `Table`-Schnittstelle nimmt ein Grid-Template entgegen, ein Token kann dort nicht stehen; dieselbe Konvention wie `ComparisonTable.tsx:78`. Story-Gerüst (`gap: 24`, `maxHeight: 420`) ist Hausbrauch. Keine Label-Map: `StatusBadge axis="log_level"` (`:190`), `resolveStatus("actor_kind", …)` (`:114`), `axisLegend("log_level")` (`:174`) | ✓ |
| **Fest** — Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Sieben Exporte, genau die sieben der Spec: `Filled` (`:211`), `Empty` (`:216`), `Loading` (`:223`), `Order` (`:228`), `Levels` (`:254`), `Edge` (`:304`), `InUse` (`:527`); alle sieben im Browser geöffnet, alle rendern. Je Prop eine Story (`entries`, `order`, `emptyText`, `loading`). Ausgeschlossen mit Grund: `EmptyAfterFilter` (filtert nicht → 0054), `Error` (lädt nicht → `ErrorRow` beim Aufrufer) | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 durchgegangen | Neu durchgegangen, zwei App-Punkte übersprungen (`docs/backlog/README.md`). **V3 ist jetzt erfüllt** — der einzige Verstoß der ersten Runde ist behoben (Zeile `right` unten). V1: `.v2log__row` setzt nur `align-items: start`, das Padding kommt von `.v2tbl__row` (`Table.tsx:130`); in `InUse` gemessen 47 px für die schlichte Zeile, höher nur wo `detail` oder Payload steht. V6/V7: `Levels` misst `bdg-neutral` für Debug und Ausführlich, Farbe erst ab `info` (`bdg-info`/`bdg-warning`/`bdg-danger`), jeder Badge mit Wort. V11/T8: Aufklappen per Tastatur, Chevron nie ohne Wort. I11: Zeile ohne Ziel, kein Hover. Kein `text-align: center` im `.v2log*`-Block. Anmerkungen ohne ✗: vier der sieben Stories (`Filled`, `Empty`, `Loading`, `Levels`) zeigen die Tabelle ohne `Card` — die erste Runde zählte hier falsch („fünf von sieben tun es richtig"; es sind drei: `Order`, `Edge`, `InUse`). Kein ✗, weil V5 eine Seitenregel ist und die Spec die Karte ausdrücklich dem Aufrufer überlässt. Der Ladezustand ersetzt Tabelle samt Spaltenkopf (I7), die Spec schreibt aber `Skeleton` (0016) vor; der Kopf „Schwere" trägt die Achse als `title` statt als (i), weil es `StatusHeader` im Set noch nicht gibt | ✓ |
| **Fest** — Im Browser angesehen (Storybook), nicht nur gebaut | Alle sieben Story-IDs unter `http://localhost:6107/iframe.html?id=…` geöffnet und vermessen: Spaltenköpfe, `datetime`-Attribute, Sortierfolge, `getBoundingClientRect` der Zusatz-Spalte, `getComputedStyle` von `.v2log__json`, echte Tastendrücke auf dem `<summary>`; Screenshot von `InUse` | ✓ |
| `entries` nach `at` sortiert, gleiche Zeit behält die Reihenfolge; `order` dreht, Default `newest` | `Log.tsx:145–147`. `Filled` übergibt zwölf Zeilen unsortiert (`Log.stories.tsx:86–208`) und zeigt sie ohne `order`-Prop absteigend: `2026-09-03T08:44Z → 08:10 → 07:05 → … → 2026-09-01T08:02Z`. `Order`: dieselben fünf Zeilen, Karte 1 (Default) `14:21Z … 08:02Z`, Karte 2 (`oldest`) `08:02Z … 14:21Z`. Gleiche Zeit: keine Story hat zwei identische `at`, deshalb den Sortierausdruck der Komponente im Browser mit vier Zeilen (drei davon zeitgleich) nachgestellt — Ergebnis `abdc` (newest) und `cabd` (oldest): die Gleichzeitigen behalten in beide Richtungen ihre Eingabefolge (`Array.prototype.sort` ist stabil, ES2019) | ✓ |
| Spalten Schwere · Akteur · Quelle · Code · Bezug · Zusatz entfallen ohne Träger; Zeit und Meldung stehen immer | `Log.tsx:92–109` (`carries`) und `:140` (`always`). Köpfe gemessen — `Edge`/„Ränder": `[Zeit, Schwere, Akteur, Quelle, Meldung, Code]`, Schwere und Akteur bleiben, obwohl Zeile `e2` beide nicht trägt; `Edge`/„Quelle ohne Schwere": `[Zeit, Meldung, Code]`, fünf Spalten weg; `Edge`/„200 Zeilen": `[Zeit, Schwere, Akteur, Meldung, Code]`; `Empty`: `[Zeit, Meldung]`; `InUse`: Pipeline endet auf „Zusatz" (kein `refs`), Audit auf „Bezug" (kein `right`). Anmerkung: „Verhalten" nennt einen Test `log-entry-columns.test.ts` — den gibt es nicht, das Repo hat überhaupt keinen Test-Runner (kein `test`-Skript, keine `*.test.ts`); die Regel steht als `carries()` in der Komponente, und kein Abnahmekriterium fordert den Test | ✓ |
| Schwere über `StatusBadge axis="log_level"`, ohne Info-Knopf je Zeile; alle fünf Werte sichtbar | `Log.tsx:190` mit `info={false}`; in `Filled` und `Levels` je **0** `<button>` in allen Zeilen. `Levels` zeigt Debug · Ausführlich · Info · Warnung · Fehler untereinander. Die Achsen-Erklärung sitzt am Spaltenkopf (`Log.tsx:157`, `levelLegend()`) — im DOM ein `title` mit allen fünf Bedeutungen | ✓ |
| Akteur zeigt `label`, sonst das Registry-Label von `actor_kind`, sonst den Rohwert | `Log.tsx:111–115`. `Levels` misst: „s.fakir@kanzlei.de" (Label) · „System" / „API" / „Agent" (Registry) · „nightly-sync" (Label schlägt das Registry-Wort „CLI") · „roboter" (Rohwert, den die Achse nicht kennt) | ✓ |
| Zeit über `Time`, Europe/Berlin, `dateTime`-Attribut gesetzt | `Log.tsx:185`. In `Filled` gemessen: `datetime="2026-09-03T08:44:00.000Z"`, Text „03.09.2026, 10:44", `title="Donnerstag, 3. September 2026 um 10:44"` — 08:44Z → 10:44 ist Europe/Berlin (T7), alle zwölf Zeilen tragen das Attribut | ✓ |
| `payload` eingeklappt unter der Meldung, klappt per `Enter`/`Leertaste` auf; leeres Objekt zeigt nichts | `Log.tsx:198–204`, `Disclosure` als natives `<details>/<summary>`. In `Edge` steht **genau ein** `<details>` auf der ganzen Seite: die Zeile mit `payload: {}` (`e3`) bekommt keins, `hasPayload` (`:85–90`) greift. Echte Tastendrücke am fokussierten `summary`: `Enter` → `open` true, `Leertaste` → false. Das `<pre class="v2log__json">` trägt die 40 Schlüssel, `overflow-x` und `-y: auto` | ✓ |
| `detail` steht in `.v2sub` unter der Meldung | `Log.tsx:197`. `InUse`, Pipeline-Karte: „Zwei Steuerblöcke — der Beleg wird gesplittet gebucht." und „Bewirtung statt Bürobedarf." stehen als `.v2sub` klein unter der Meldung | ✓ |
| `refs` mit `href` sind `Link`, ohne `href` Text | `Log.tsx:208–219`. `Filled` hat sieben Zeilen mit Bezug; die gemischte misst als `<span><a href="#beleg">RE-4471</a></span><span> · Sachverhalt 118</span>` — Link und reiner Text nebeneinander, Trenner „ · " | ✓ |
| `right` steht rechtsbündig mit `tnum` | **Nachgebessert und nachgemessen.** `Log.tsx:220` gibt `entry.right` roh in die Zelle, `:228` hängt `v2num` ans Grid-Kind (`v2log__cell v2num`), der Inline-`<span>` ist weg. In `InUse` gemessen: Kopf „Zusatz" x = 1059–1179, alle sechs Zusatz-Zellen x = 1059–1179, die Konfidenz-Badges 97 % · 62 % · 88 % enden bei x = 1179 — Kopf und Wert stehen bündig übereinander rechts (in der ersten Runde endeten die Werte bei 1111). `getComputedStyle` der Zelle: `text-align: right`, `font-variant-numeric: lining-nums tabular-nums`. Im Screenshot sichtbar. V3 erfüllt | ✓ |
| `depth` verändert die Darstellung nicht | `grep -n "depth" src/ui/v3/patterns/Log.tsx` → nur `:42` (Kommentar) und `:43` (Typ); im Rendering wird es nicht gelesen. `InUse`, Pipeline-Karte: `finding.vat` (Tiefe 1), `review.corrected` (2), `classify`/`propose`/`ocr.*` (3) mit identischer Zeilenform nebeneinander | ✓ |
| `emptyText` erscheint als `EmptyRow`; Default „Noch nichts protokolliert." | `Log.tsx:128` (Default) und `:164`. `Empty` misst `.v2tbl__empty` = „Für diesen Beleg ist noch nichts protokolliert.", der Spaltenkopf bleibt stehen (`[Zeit, Meldung]`) | ✓ |
| `loading` zeigt `Skeleton` | `Log.tsx:138`. `Loading` misst fünf `.v2skel` in einer `.v2skelgroup` und die Vorlesezeile „Protokoll wird geladen …" in einem `aria-live`-Bereich | ✓ |
| Keine Kürzung der Meldung; 300 Zeichen brechen um | `v3.css:2119` `.v2log__msg { overflow-wrap: anywhere; line-height: var(--lh-ui-md); }` — kein `line-clamp`, `text-overflow: clip`. `Edge`, erste Zeile: 299 Zeichen, 117 px hoch = sechs Zeilen, `scrollHeight == clientHeight`, also nichts abgeschnitten | ✓ |
| Kein `"use client"` in `Log.tsx` | `grep -n 'use client' src/ui/v3/patterns/Log.tsx` → nichts; kein `useState`/`useEffect`, das Aufklappen ist natives `<details>` | ✓ |
| `.v2log*` steht in `v3.css` ohne Hex und px | **Nachgebessert und nachgeprüft.** `sed -n '2107,2136p' src/styles/v3.css \| grep -E '[0-9]px\|#[0-9a-fA-F]{3,8}'` → kein Treffer. `font-size: var(--fs-ui-xs)`, `line-height: var(--lh-ui-xs)`, `.v2log__msg` `var(--lh-ui-md)` (= 1.45, derselbe Wert wie vorher). Die Höhe steht als `max-height: 15lh` — geprüft, ob das trägt und nicht bloß das Kriterium umgeht: `CSS.supports("max-height","15lh")` → true; berechnet **250.078 px** (15 × 16.675 px, das ist 11.5 px × 1.45), also praktisch die alten 260 px, nur an der eigenen Schrift gemessen statt geraten; im aufgeklappten 40-Schlüssel-Payload `scrollHeight` 700 gegen `clientHeight` 250 — der Block deckelt und scrollt wie zuvor. `lh` ist seit Chrome 109 / Safari 16.4 / Firefox 120 (2023) überall verfügbar, und wo es fehlt, entfällt nur die Deckelung: der Block wird lang, nichts bricht. Das ist eine tragfähige Lösung, keine Umgehung | ✓ |
| `Timeline` verliert „an audit trail" in `@when` und verweist in `@instead` auf `LogList`; `LogList` verweist zurück | `Timeline.tsx:85–91` — `@when` endet auf „the history of a case, a document, a run.", „an audit trail" ist raus; `@instead` beginnt mit „Many rows, severity, payload, filtering → LogList; the Timeline tells the story, the Log proves it." Rückverweis in `Log.tsx:121–123`: „The story of one object, where a gap is a statement → Timeline" | ✓ |
| Tut bewusst nicht: filtern, laden, Spalten frei definieren, Zeilen öffnen | Die Schnittstelle (`Log.tsx:125–137`) kennt nur `entries`, `order`, `emptyText`, `loading` — kein Filter, keine Spaltenliste, kein `href`/`onSelect`. `Row` ohne `href` (`:224`), also stumm und ohne Hover (I11). Verweise auf `LogBrowser` (0054), `Table` und `MasterDetail` in `@instead` | ✓ |
| Ersetzt `LogView`/`LogTable`/`LogEntry`/`LogBadges`/`LogPayloadCell`, `AuditLogTable`, `InvoiceTracesTable`, `ExtractionLogsTable` und `STEP_LOG_COLUMNS` ohne Funktionsverlust | Zielt auf `ludwig/app`, nicht auf dieses Repo (`docs/backlog/README.md`). Hier belegt `InUse`, dass die Zeile die echten Typen trägt: `InvoiceTraceEntry` und Extraktions-Log in **einer** Liste, nach Sekunden ineinander sortiert (`Log.stories.tsx:536–539`), und zwölf `AuditEvent` mit `batchLogDepth` (`:18–36`, `:543`) — samt der Normalisierung `WARN` → „Warnung" (`:70`) | offen (App) |

**Was die Nachbesserung `d1a1984` angerichtet hat:** nichts. `pnpm typecheck`
und `pnpm build` sind grün, alle sieben Stories rendern, die Zeilenform ist
unverändert — `.v2num` wanderte vom Inline-`<span>` ans Grid-Kind (Zusatz jetzt
rechts), `Konfidenz` heißt `Confidence`, und `.v2log__json` nimmt statt zweier
roher px die Token `--fs-ui-xs`/`--lh-ui-xs` und eine Höhe in `lh`. Der
`line-height`-Wechsel von `1.45` auf `var(--lh-ui-md)` ist derselbe Wert; die
Deckelung des JSON-Blocks fällt von 260 px auf 250 px.

Abgenommen von / am: Claude (zweite Abnahme), 2026-09-03 · Offene Punkte:
keine im Set. Ein Kriterium bleibt **offen (App)** — die Ablösung von
`LogView`/`LogTable`/`LogEntry`/`LogBadges`/`LogPayloadCell`, `AuditLogTable`,
`InvoiceTracesTable`, `ExtractionLogsTable` und `STEP_LOG_COLUMNS` in
`ludwig/app`; sie gehört in den Migrationsschritt, nicht hierher
(`docs/backlog/README.md`). Bilanz: **24 ✓ · 0 ✗ · 1 offen (App)**
(erste Abnahme 2026-09-03: 21 ✓ · 3 ✗ · 1 offen (App)).
