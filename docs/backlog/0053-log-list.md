# 0053 · LogList — das Protokoll als Tabelle: eine Zeile für jede Quelle

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` — Gruppe Prozess, neben `Timeline` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald sie ein Protokoll führt — Zeit, Schwere, Akteur, Meldung, Details sind fachfrei |
| Quelle | Anfrage Owner 2026-09-03 („Logbrowser, aber auch Log Rows … fachlich und technisch … prinzipiell immer ein filterbarer zeitlicher Verlauf … eher Tabellenformat") · App-Inventar `ludwig-UX-guidelines-v2.md` §11.2 („Log-Ansicht, Sichten Verlauf/Protokoll/Technik → Optik") und **Z6** („Log = ein Strom, drei Sichten") · `web-ui.md` **R7** („Log-Ansichten teilen die Darstellung, nicht die Herkunft") · Befund **B5** in `ui-repraesentationen.md` · Vorlage `app/apps/web/src/ui/components/log/` (5 Dateien) · Design `design/Ludwig Design System v2/preview/audit-trail.html` (Akteur-Arten Nutzer · Ludwig · System) |
| Ersetzt | `LogEntry`, `LogTable`, `LogView`, `LogBadges`, `LogPayloadCell` (`ui/components/log/`) · `AuditLogTable` (`modules/audit-log/ui`, 122 Z., eigener Expand-State) · `InvoiceTracesTable`, `ExtractionLogsTable` (`modules/invoices/ui/logs`) · `STEP_LOG_COLUMNS` in `app/(app)/clients/[clientSlug]/[year]/agent-runs/[runId]/page.tsx` |
| Blockiert | 0054 `LogBrowser` · Welle 3: `admin/audit-log`, `admin/jobs`, `configuration/logs`, `admin/tenants/[tenantId]/clients/[clientId]` · Pipeline-Tab des Belegs · Stapel-Log `[year]/stapel/[batchId]` · Welle 4: `agent-runs/[runId]` |
| Spec von / am | Claude, 2026-09-03 |
| Gebaut von / am | Claude, 2026-09-03 |

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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
