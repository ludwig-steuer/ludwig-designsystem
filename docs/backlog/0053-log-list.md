# 0053 · LogList — das Protokoll als Tabelle: eine Zeile für jede Quelle

| | |
|---|---|
| Status | Abnahme |
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

- [ ] `entries` wird nach `at` sortiert, gleiche Zeit behält die Reihenfolge; `order` dreht die Richtung, Default `newest` (`Filled`, `Order`)
- [ ] Spalten Schwere · Akteur · Quelle · Code · Bezug · Zusatz entfallen, wenn keine Zeile das Feld trägt; Zeit und Meldung stehen immer (`Edge`)
- [ ] Schwere über `StatusBadge axis="log_level"`, ohne Info-Knopf je Zeile; alle fünf Werte sichtbar (`Levels`)
- [ ] Akteur zeigt `label`, sonst das Registry-Label der Achse `actor_kind`, sonst den Rohwert (`Levels`)
- [ ] Zeit über `Time`, Europe/Berlin, `dateTime`-Attribut gesetzt (`Filled`)
- [ ] `payload` liegt eingeklappt unter der Meldung, klappt per `Enter`/`Leertaste` auf; leeres Objekt zeigt nichts (`Edge`)
- [ ] `detail` steht in `.v2sub` unter der Meldung (`InUse`)
- [ ] `refs` mit `href` sind `Link`, ohne `href` Text (`Filled`)
- [ ] `right` steht rechtsbündig mit `tnum` (`InUse`)
- [ ] `depth` verändert die Darstellung nicht (`InUse` — Zeilen aller drei Tiefen sehen gleich aus)
- [ ] `emptyText` erscheint als `EmptyRow`; Default „Noch nichts protokolliert." (`Empty`)
- [ ] `loading` zeigt `Skeleton` (`Loading`)
- [ ] Keine Kürzung der Meldung; 300 Zeichen brechen um (`Edge`)
- [ ] Kein `"use client"` in `Log.tsx`
- [ ] `.v2log*` steht in `v3.css` ohne Hex und px
- [ ] `Timeline` verliert „an audit trail" in `@when` und verweist in `@instead` auf `LogList` („many rows, severity, payload, filtering → LogList"); `LogList` verweist zurück („the story of one object with gaps → Timeline")
- [ ] Tut bewusst nicht: filtern, laden, Spalten frei definieren, Zeilen öffnen — Aufrufer löst es mit 0054, Props, `Table`, `MasterDetail`
- [ ] Ersetzt `LogView`/`LogTable`/`LogEntry`/`LogBadges`/`LogPayloadCell`, `AuditLogTable`, `InvoiceTracesTable`, `ExtractionLogsTable` und `STEP_LOG_COLUMNS` ohne Funktionsverlust — **offen (App)**, siehe `docs/backlog/README.md`

## Befunde für `ludwig/app`

1. **`ops_extraction_logs.level`** schreibt `INFO`/`WARN`/`ERROR` — ein
   fremder Wertebereich zur Achse `log_level` (`LogBadges.levelKind`
   normalisiert lokal). Der Mapper normalisiert weiter; sauber wäre der
   Schreibpfad im Workflows-Service.
2. **`outcome` ist keine Schwere.** `platform_audit_events.outcome`
   (success · partial · failure) und `level` sind zwei Achsen. Mapping
   success → info · partial → warning · failure → error am Aufrufer; keine
   neue Spalte, kein Registry-Umbau.
3. **`LogLevel` fehlt als neutraler Typ.** Die einzige Union der Achse heißt
   `InvoiceTraceLevel`. Vorschlag: `LogLevel` unter
   `src/ludwig/modules/audit-log/domain/`, `InvoiceTraceLevel` darauf ziehen.
4. **Registry-Achse `actor_kind` fehlt.** DB-CHECK kennt
   `user · system · api · cli · agent`, `ActorKind` in
   `audit-log/domain/types.ts` ebenso — aber keine State-Tabelle im Topic
   und keine Registry-Map. Reihenfolge nach `ludwig-UX-guidelines-v2.md`
   §„Neue Achse": State-Tabelle → Registry → `entity-icons.ts`. Bis dahin
   siehe offene Frage 1.
5. **`AgentRunStep` und `Job` sind nicht in `src/ludwig/` gespiegelt.** Die
   Mapper der Lauf- und Jobs-Seiten entstehen mit dem Umzug dieser Seiten
   (Welle 3/4), nicht hier.
6. **Tiefe ist an den Stapel gebunden.** `batchLogDepth` (`datev-export/
   domain/batch-log.ts`) ist die einzige Ableitung, Z6 gilt allgemein. Eine
   Ableitung je Quelle (`auditEventDepth`, `traceDepth`), nie gespeichert.
7. **App-`LogEntry`** fehlen `id`, `actor`, `code`, `depth`, `detail`; beim
   Umzug übernehmen, `correlationId` bleibt Seitenwissen (`refs`-Link).
8. **`SourceDocVerlaufTab` und `VerlaufTab`** sind Timeline-Fälle. Beim Umzug
   der Beleg-Seiten `Timeline`, nicht `LogList`.

## Offene Fragen

1. **Achse `actor_kind` im Set vorziehen?** Die Registry im Set ist die
   Kopie der App; eine Achse nur hier lässt beide auseinanderlaufen.
   *Ohne Antwort: ja, vorziehen* — fünf Werte (Nutzer · System · API · CLI ·
   Agent), Befund 4 meldet es der App zum Nachziehen. Alternative wäre der
   Rohwert „system" im UI, und das verstößt gegen „Deutsch, was Nutzer sehen".
2. **Einzelheiten unter der Meldung oder eigene Spalte?** Die Vorlage
   (`LogPayloadCell`) hat eine Spalte „Details" mit „5 Felder".
   *Ohne Antwort: unter der Meldung* — die Tabelle bleibt schmal, die
   Zeile wächst nur, wo etwas drin ist; `Timeline` löst `detail` genauso.
3. **Sortiert die Komponente oder die Query?** App-`LogView` sortiert
   bewusst nicht („die Query weiß die Richtung"). *Ohne Antwort: die
   Komponente* — wie `Timeline` 0023; eine Keyset-Seite ist in sich
   sortiert und bleibt es, und zwei Quellen mischen geht nur so.

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Codestelle) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit` ohne Ausgabe; `pnpm build` → „Storybook build completed successfully", Exit 0 | ✓ |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/Log.tsx` (Familie `LogEntry` + `LogList`, wie im Zuschnitt), `Log.stories.tsx` daneben, `Log.stories.tsx:11` `title: "v3/Patterns/Prozess/LogList"` — dieselbe Gruppe wie `Timeline.stories.tsx:8` und der Kommentar `/* Prozess */` in `index.ts:210`; Barrel-Export `index.ts:211` | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | `Log.tsx:117–124` trägt `@when`/`@instead` an `LogList`; `LogEntry`/`LogLevel` sind Typen und folgen darin `Time.tsx` (`TimeSize` ohne `@when`). Kommentare und JSDoc englisch. **Aber** `Log.stories.tsx:79` `function Konfidenz` — der einzige deutsche Bezeichner unter allen lokalen Story-Funktionen des Sets (`grep -rhoE "^function [A-Za-zÄÖÜäöü_]+" src/ui/v3/**/*.stories.tsx`: 19 Namen, 18 englisch). README „Sprache" und `CLAUDE.md` verlangen englische Bezeichner auch in Stories | ✗ |
| **Fest** — Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}' src/ui/v3/patterns/Log*.tsx`: nichts. px im TSX nur als `grid-template-columns`-Werte (`Log.tsx:59–68`) und `minWidth` (`:73–82`) — dieselbe Konvention wie `ComparisonTable.tsx:78` (`cols="20px minmax(0,1.4fr) 96px …"`); Story-Gerüst (`gap: 24`, `maxHeight: 420`) ist Hausbrauch (vgl. Abnahme 0030). Keine Label-Map: Schwere über `StatusBadge axis="log_level"` (`Log.tsx:190`), Akteur über `resolveStatus("actor_kind", …)` (`:114`), Legende über `axisLegend("log_level")` (`:174`) | ✓ |
| **Fest** — Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Sieben Exporte, genau die sieben der Spec: `Filled` (`:211`), `Empty` (`:216`), `Loading` (`:223`), `Order` (`:228`), `Levels` (`:254`), `Edge` (`:304`), `InUse` (`:527`). Je Prop der Schnittstelle eine Story: `entries` → `Filled`, `order` → `Order`, `emptyText` → `Empty`, `loading` → `Loading`. Ausgeschlossen mit Grund in der Spec: `EmptyAfterFilter` (die Liste filtert nicht → 0054), `Error` (die Liste lädt nicht → `ErrorRow` beim Aufrufer) | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 durchgegangen | Vierzehn Punkte geprüft, zwei App-Punkte übersprungen (`docs/backlog/README.md`). Bestanden: Stufe/Importe (nur `primitives/` und Nachbar-Patterns, kein Fachmodul in `Log.tsx`) · keine zweite Quelle (V13) · Zeilenhöhe = `.v2tbl__row`, `.v2log__row` setzt nur `align-items: start` (V1) · Farbe nur Kritikalität, Rot nur `error`, `actor_kind` durchweg `neutral` (V6) · jeder farbige Zustand mit Wort (V7) · drei Zustände gebaut, zwei begründet ausgelassen (V9) · Kontrast `--color-text-muted` #5C5C5C ≈ 7:1 auf Weiß (V10) · Aufklappen per Tastatur, Chevron nie ohne Wort (V11/T8) · Zeile ohne Ziel bleibt stumm, kein Hover (I11) · Lucide-Icons, keine Unicode-Zeichen als Bedeutungsträger (T9) · Texte Sie/GLOSSARY (T1–T5) · Story mit allen anwendbaren Zuständen. **Ein Verstoß: V3** („Zahlen rechts") — siehe Zeile `right` unten. Anmerkungen ohne ✗: `Filled` und `Levels` zeigen die Tabelle ohne `Card` (V5), fünf von sieben Stories tun es richtig, und die Karte ist laut Spec Sache des Aufrufers; der Ladezustand ersetzt die ganze Tabelle samt Spaltenkopf (I7 „Spaltenkopf bleibt"), aber die Spec schreibt ausdrücklich `Skeleton` (0016) statt `TableLoading` vor; der Spaltenkopf „Schwere" trägt die Achse als `title` statt als (i) — `StatusHeader` gibt es im Set noch nicht (`index.ts:34`) | ✓ |
| **Fest** — Im Browser angesehen (Storybook), nicht nur gebaut | Alle sieben Stories unter `http://localhost:6107/iframe.html?id=…` geöffnet und im DOM vermessen (Spalten, `datetime`-Attribute, Sortierreihenfolge, Fokus und Aufklappen der `<summary>`, Geometrie der Zusatz-Spalte) | ✓ |
| `entries` nach `at` sortiert, gleiche Zeit behält die Reihenfolge; `order` dreht, Default `newest` | `Log.tsx:145–147` — `[...entries].sort(…)`, `Array.prototype.sort` ist stabil (ES2019). `Filled` übergibt zwölf Zeilen unsortiert (`Log.stories.tsx:86–208`, IDs a5, a1, a3, a2, …) und zeigt sie ohne `order`-Prop absteigend: 03.09. 10:44 → 10:10 → 09:05 …; `Order` zeigt dieselben fünf Zeilen in beide Richtungen (gemessen: `2026-09-02T14:21Z … 2026-09-01T08:02Z` gegen `08:02 … 14:21`) | ✓ |
| Spalten Schwere · Akteur · Quelle · Code · Bezug · Zusatz entfallen ohne Träger; Zeit und Meldung stehen immer | `Log.tsx:92–109` (`carries`) und `:140` (`always`). `Edge`, Karte „Quelle ohne Schwere": Kopf misst `["Zeit","Meldung","Code"]` — vier Spalten weg. `Edge`, Karte „Ränder": eine Zeile ohne Schwere und Akteur neben zweien mit beidem, die Spalten bleiben. `Empty`: Kopf `["Zeit","Meldung"]`. `InUse`: Pipeline-Karte endet auf „Zusatz" (kein `refs`), Audit-Karte auf „Bezug" (kein `right`) | ✓ |
| Schwere über `StatusBadge axis="log_level"`, ohne Info-Knopf je Zeile; alle fünf Werte sichtbar | `Log.tsx:190` `<StatusBadge axis="log_level" status={entry.level} info={false} />`; im DOM von `Filled` `rows.reduce(… querySelectorAll('button').length)` = **0**. `Levels` zeigt Debug · Ausführlich · Info · Warnung · Fehler untereinander. Die Achsen-Erklärung sitzt am Spaltenkopf (`Log.tsx:157`, `levelLegend()` aus `axisLegend`) — im DOM als `title` mit allen fünf Bedeutungen | ✓ |
| Akteur zeigt `label`, sonst das Registry-Label von `actor_kind`, sonst den Rohwert | `Log.tsx:111–115`; Registry-Achse neu in `status-registry.ts:1413–1419` (fünf Werte, alle `neutral`), `AXIS_LABEL`/`AXIS_SOURCE` nachgezogen (`entity-icons.ts:80,151`), Fallback auf den Rohwert in `resolveStatus` (`status-registry.ts:1749`). `Levels` zeigt „s.fakir@kanzlei.de" (Label) · „System"/„API"/„Agent" (Registry) · „nightly-sync" (Label vor Registry) · „roboter" (Rohwert, unbekannter Wert) | ✓ |
| Zeit über `Time`, Europe/Berlin, `dateTime`-Attribut gesetzt | `Log.tsx:185` `<Time value={entry.at} format="dateTime" size="sm" />`; `Time.tsx:39` setzt `dateTime`, `format.ts:16` `const TZ = "Europe/Berlin"`, `:82` DT_MEDIUM mit `timeZone: TZ`. Im DOM von `Filled`: `08:44Z` → Text „03.09.2026, 10:44", `datetime="2026-09-03T08:44:00.000Z"`, `title="Donnerstag, 3. September 2026 um 10:44"` | ✓ |
| `payload` eingeklappt unter der Meldung, klappt per `Enter`/`Leertaste` auf; leeres Objekt zeigt nichts | `Log.tsx:198–204` mit `Disclosure summary="Einzelheiten" tone="quiet"`, nativ `<details>/<summary>` (`Disclosure.tsx:43–48`) — die Tastatur kommt vom Element. Im DOM von `Edge` gemessen: `summary` nimmt Fokus (`document.activeElement === summary`), `open` false → true, `<pre class="v2log__json">` mit `overflow-x: auto`, `max-height: 260px`. `hasPayload` (`Log.tsx:85–90`) filtert `{}` und `null`; die `Edge`-Zeile „Leeres Payload zeigt keine Einzelheiten." hat keine Aufklappzeile | ✓ |
| `detail` steht in `.v2sub` unter der Meldung | `Log.tsx:197`; `InUse`, Pipeline-Karte: „Zwei Steuerblöcke — der Beleg wird gesplittet gebucht." und „Bewirtung statt Bürobedarf." stehen klein unter der Meldung (`.v2sub`, `v3.css:133`) | ✓ |
| `refs` mit `href` sind `Link`, ohne `href` Text | `Log.tsx:208–219`. `Filled`, Zeile a3: `refs` = `[{RE-4471, href}, {Sachverhalt 118}]` — im DOM ein `<a href="#beleg">RE-4471</a>` und daneben „ · Sachverhalt 118" als reiner Text | ✓ |
| `right` steht rechtsbündig mit `tnum` | `Log.tsx:220` setzt `.v2num` auf ein **inline** `<span>` **innerhalb** von `<div class="v2log__cell">` (`:226`). `.v2num` ist `text-align: right` (`v3.css:131`); auf einem Inline-Element bewegt das nichts. Im DOM von `InUse` gemessen: die Zelle liegt bei x = 1064–1184, der Konfidenz-Wert bei x = 1064–1111 (**linksbündig**), während der Kopf „Zusatz" bei 1184 rechts endet — Kopf rechts, Werte links, im Screenshot sichtbar. `tnum` vererbt sich, die Ausrichtung nicht. Verstoß gegen V3. Behebbar mit der Klasse am Zellen-`div` (`v2log__cell v2num`); der Kopf macht es `Log.tsx:155` schon richtig, weil dort der `<span>` selbst Grid-Kind ist | ✗ |
| `depth` verändert die Darstellung nicht | `grep -n "depth" src/ui/v3/patterns/Log.tsx` → nur `:20` (Kommentar) und `:43` (Typ); kein Lesen im Rendering. `InUse`, Pipeline-Karte: `finding.vat` (Tiefe 1), `review.corrected` (2), `classify`/`propose`/`ocr.*` (3) stehen mit identischer Zeilenform nebeneinander | ✓ |
| `emptyText` erscheint als `EmptyRow`; Default „Noch nichts protokolliert." | `Log.tsx:128` (Default) und `:164` (`<EmptyRow>`). `Empty` misst im DOM `.v2tbl__empty` = „Für diesen Beleg ist noch nichts protokolliert.", der Spaltenkopf bleibt stehen (`["Zeit","Meldung"]`, V5) | ✓ |
| `loading` zeigt `Skeleton` | `Log.tsx:138`. `Loading` misst fünf `.v2skel` und die Vorlesezeile „Protokoll wird geladen …" | ✓ |
| Keine Kürzung der Meldung; 300 Zeichen brechen um | `v3.css:2119` `.v2log__msg { overflow-wrap: anywhere; line-height: 1.45; }` — kein `line-clamp`, kein `text-overflow`. `Edge`, erste Zeile: die 300-Zeichen-Meldung läuft über sechs Zeilen, vollständig lesbar | ✓ |
| Kein `"use client"` in `Log.tsx` | `grep -n '"use client"' src/ui/v3/patterns/Log.tsx` → nichts. Kein `useState`/`useEffect`; das Aufklappen ist natives `<details>` | ✓ |
| `.v2log*` steht in `v3.css` ohne Hex und px | Hex: keins (`v3.css:2107–2133`, Farben über `var(--color-*)`, Abstände über `var(--space-*)`). **px: zwei** — `v3.css:2125` `font-size: 11.5px` und `:2130` `max-height: 260px`. Für die Schriftgröße gibt es den Token `--fs-ui-xs: 11.5px` (`tokens.css:114`), sie ist also ohne Rest ersetzbar; für die Höhe gibt es keinen Token, und rohe px sind dort Hausbrauch (`v3.css:1102`, `:1977`). Die Spec sagt „nur Tokens", das Kriterium „ohne px" — am Wortlaut gemessen nicht erfüllt | ✗ |
| `Timeline` verliert „an audit trail" in `@when` und verweist in `@instead` auf `LogList`; `LogList` verweist zurück | `Timeline.tsx:86–91` — `@when` endet jetzt auf „a document, a run.", `@instead` beginnt mit „Many rows, severity, payload, filtering → LogList; the Timeline tells the story, the Log proves it." Rückverweis in `Log.tsx:121–123`: „The story of one object, where a gap is a statement → Timeline" | ✓ |
| Tut bewusst nicht: filtern, laden, Spalten frei definieren, Zeilen öffnen | Die Schnittstelle (`Log.tsx:130–137`) kennt nur `entries`, `order`, `emptyText`, `loading` — keinen Filter, keine Spaltenliste, kein `href`/`onSelect`. `Row` wird ohne `href` gerendert (`:224`), bleibt also stumm (I11). Verweise: `Log.tsx:19–20` auf `LogBrowser` (0054) für die Tiefe, `:123` auf `Table` (eigene Spalten) und `MasterDetail` (Arbeiten an einer Zeile) | ✓ |
| Ersetzt `LogView`/`LogTable`/`LogEntry`/`LogBadges`/`LogPayloadCell`, `AuditLogTable`, `InvoiceTracesTable`, `ExtractionLogsTable` und `STEP_LOG_COLUMNS` ohne Funktionsverlust | Zielt auf `ludwig/app`, nicht auf dieses Repo (`docs/backlog/README.md`). Hier belegt `InUse`, dass die Zeile die echten Typen trägt: `InvoiceTraceEntry` und Extraktions-Log in **einer** Liste (`Log.stories.tsx:536–539`), `AuditEvent` mit `batchLogDepth` (`:18–36`, `:543`) — inklusive der Normalisierung `WARN` → `warning` (`:70`, im DOM als „Warnung" sichtbar) | offen (App) |

**Offene Punkte, nachbesserbar:**

1. **Zusatz-Spalte ist linksbündig** (`Log.tsx:220`/`:226`): `.v2num` sitzt auf dem inneren `<span>`, ausrichten kann nur das Zellen-`div`. Klasse ans `div` hängen (`v2log__cell v2num`), dann stehen Kopf und Wert übereinander. Sichtbar in `InUse` (Konfidenz 97 % · 62 % · 88 %).
2. **`function Konfidenz`** (`Log.stories.tsx:79`, verwendet `:52`) → `Confidence`. Einziger deutscher Bezeichner im Set.
3. **`font-size: 11.5px`** in `.v2log__json` (`v3.css:2125`) → `var(--fs-ui-xs)`. Für `max-height: 260px` (`:2130`) gibt es keinen Token — entweder einen setzen oder das Kriterium auf „ohne Hex, Maße als Token, wo es einen gibt" nachziehen.

**Nachbesserung 2026-09-03** (alle drei Punkte, erneute Abnahme steht aus):

1. `.v2num` sitzt jetzt am Grid-Kind: `Log.tsx` gibt der Zusatz-Zelle
   `v2log__cell v2num`, der innere `<span>` ist weg. Kopf und Wert stehen
   übereinander rechts.
2. `Konfidenz` → `Confidence` in `Log.stories.tsx`.
3. `.v2log__json` nimmt `var(--fs-ui-xs)` und `var(--lh-ui-xs)`; die Höhe
   steht als `15lh` — fünfzehn Zeilen der eigenen Schrift statt einer
   px-Zahl. `.v2log__msg` bekommt `var(--lh-ui-md)` statt `1.45`. Im Block
   steht kein roher Wert mehr.

Erste Abnahme von / am: Claude (Abnahme-Agent), 2026-09-03 · Offene Punkte: drei — Zusatz-Spalte nicht rechtsbündig (V3-Verstoß, `Log.tsx:220`), deutscher Bezeichner `Konfidenz` (`Log.stories.tsx:79`), zwei rohe px im `.v2log*`-Block (`v3.css:2125`, `:2130`). Ein Kriterium **offen (App)**: die Ablösung von `LogView`/`AuditLogTable`/`InvoiceTracesTable`/`ExtractionLogsTable`/`STEP_LOG_COLUMNS` in `ludwig/app`. Bilanz: 21 ✓ · 3 ✗ · 1 offen (App).
