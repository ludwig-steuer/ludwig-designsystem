# 0054 · LogBrowser — Sicht, Schwere und Suche über dem Protokoll

| | |
|---|---|
| Status | fertig |
| Nachgebessert (2026-09-04) | **1.** ✓ erledigt — der einzige deutsche Kommentar (`LogBrowser.tsx:194–195`) ist englisch (Commit `74ee4e2`), von der zweiten Abnahme belegt |
| Stufe | `patterns/` — Gruppe Prozess, neben `LogList` (0053) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald sie ein Protokoll hat, in dem jemand „nur die Fehler" oder „nur was Menschen taten" sehen will |
| Quelle | Anfrage Owner 2026-09-03 („eingebettet im Logbrowser, der suchen, sortieren, filtern kann") · **Z6** in `ludwig-UX-guidelines-v2.md` („ein Strom, drei Sichten: Verlauf · Protokoll · Technik, plus Fehlerfilter") · Vorlagen: `InvoiceLogsPanel` (`modules/invoices/ui/logs`, Toggle Fachlich/Technisch/Beide + verbose), Stapel-Log (`datev-export/domain/batch-log.ts`: `BATCH_LOG_VIEWS`, `visibleInBatchLog`), Filterformular in `app/(app)/admin/audit-log/page.tsx` |
| Ersetzt | `InvoiceLogsPanel` (222 Z.) · die Sicht-Umschaltung des Stapel-Logs auf `[year]/stapel/[batchId]` · den **lokalen** Teil des Admin-Filters (`q`, `outcome`, `actorKind`) — Zeitraum, Mandant, Ressource, Vorgang bleiben Server-Filter der Seite |
| Blockiert | von 0053 · blockiert Welle 3 (`admin/audit-log`, `configuration/logs`), den Pipeline-Tab des Belegs, den Stapel-Log |
| Spec von / am | Claude, 2026-09-03 |
| Gebaut von / am | Claude, 2026-09-04 · nachgebessert 2026-09-04 (deutscher Kommentar) |

## Ziel

Die Prüferin hat das Protokoll vor sich — dreihundert Zeilen am Stapel,
neunzig am Beleg — und stellt drei Fragen, immer dieselben: „Was ist die
Geschichte, ohne die Innereien?", „Was ging schief?", „Wo kommt ‚RE-4471'
vor?". Heute bekommt sie an jedem Ort ein anderes Werkzeug: am Beleg einen
Schalter Fachlich/Technisch/Beide mit einer verbose-Checkbox, am Stapel drei
Sichten in der URL, im Admin ein Formular mit elf Feldern, das die Seite neu
lädt. Keines hat Zähler; keines sagt, was der Filter gerade ausblendet.

Neu: **ein** Kopf über der `LogList` — Sicht mit Zählern, Schwere, Suche —
der lokal filtert, was die Seite geladen hat, und „Ältere laden" anbietet,
wenn es mehr gibt. Der Scope (welcher Mandant, welcher Beleg, welcher
Zeitraum) bleibt Sache der Seite in der URL (I4, R7): der Browser weiß nicht,
woher die Zeilen kommen, und fragt keinen Server.

## Einordnung

- **Wiederverwenden:** die Teile stehen, die Klammer fehlt.
  - `FilterBar` (`@when Above a list that can be narrowed`) — „bewusst nur
    die Hülle: hält keinen Filterzustand" — genau deshalb braucht es das
    Pattern darüber.
  - `Segmented` (`@when Equal views of the same data (log: by time, by
    owner)`) — nennt das Log selbst; trägt die Sicht. Ihm fehlt der Zähler
    (§3.2, eine Prop, unten).
  - `FilterChips` (`@when Narrowing down by dimension`) — die Schwere, mit
    `count`.
  - `SearchInput` (`@instead Full text alone → SearchInput`) — die Suche.
  - `Pagination` (`@when paged over the URL`) — nicht der Fall: „Ältere
    laden" hängt ans Ende, die Seite bleibt.
  - `EmptyState inline` — leer nach Filter, mit Ausweg.
  - `LogList` (0053) — die Tabelle.
- **Neu, weil:** `spec-schreiben` §3.4 — eigener Zustand (Sicht, Schwere,
  Suche) und Tastaturweg auf **sechs** Screens.
- **Zuschnitt:** eigene Datei `patterns/LogBrowser.tsx`, `"use client"`.
  Getrennt von 0053, weil die Liste Server bleibt und allein vorkommt (§4).
  Kein Durchreichen außer `order`, `loading`, `emptyText`.
- **Setzt auf:** `LogList` · `FilterBar` · `Segmented` (+ `count`) ·
  `FilterChips` · `SearchInput` · `Button` · `EmptyState`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `entries` | `LogEntry[]` | ja | Alles, was die Seite geladen hat; der Browser filtert davon lokal | `Filled` |
| `initialView` | `1 \| 2 \| 3` | nein | Sicht beim Öffnen. Default `2` (Protokoll): sichtbar, aber ohne Innereien — der Stapel gibt `1`, der Admin `3` | `Views` |
| `viewLabels` | `[string, string, string]` | nein | Default `["Verlauf", "Protokoll", "Technik"]` — UI-Text, keine Status-Map | `Views` |
| `more` | `{ hasMore: boolean; loading?: boolean; onLoad: () => void }` | nein | „Ältere laden" am Fuß. Ohne Prop kein Knopf; `hasMore: false` ebenso | `LoadMore` |
| `onChange` | `(state: LogFilterState) => void` | nein | Jede Änderung von Sicht, Schwere, Suche — damit die Seite den Stand in die URL spiegeln kann, wenn sie will | `Mirror` |
| `order` | `"newest" \| "oldest"` | nein | durchgereicht an `LogList` | `Filled` |
| `loading` | `boolean` | nein | durchgereicht an `LogList`; Kopf bleibt bedienbar | `Filled` |
| `emptyText` | `string` | nein | durchgereicht — der Leertext **ohne** Filter | `Filled` |

```ts
export interface LogFilterState {
  view: 1 | 2 | 3;
  severity: "all" | "warning" | "error";
  search: string;
}
```

**Erweiterung an `Segmented` (§3.2):** `SegmentOption.count?: number`,
gedämpft rechts am Label — spiegelt `TabItem.count`. Ein Halbsatz in der
`@when`-Zeile: „… with a count per view". Zwei Verwendungen: hier und die
Stapel-Sichten.

Typen aus `src/ludwig/`: keine — der Browser kennt nur `LogEntry`. GLOSSARY:
kein neuer Begriff; „Verlauf · Protokoll · Technik" sind die Wörter aus Z6
und `BATCH_LOG_VIEWS`.

**Was die Komponente nicht kann (bewusst):**

- **Server fragen.** Kein Fetch, keine URL, kein Router. Zeitraum, Mandant,
  Ressource, Vorgang sind Server-Filter — die Seite hält sie in der URL
  (`FilterBar` mit `submitLabel`, wie heute im Admin) und gibt das Ergebnis
  als `entries`.
- **Suchen, was nicht geladen ist.** Die Suche läuft über die geladenen
  Zeilen; der Leertext sagt das (unten) und bietet „Ältere laden" an.
- **Sortieren nach Spalten.** Ein Protokoll ist chronologisch; `order`
  reicht.
- **Nach Akteur filtern.** Die Sicht „Verlauf" ist „was Menschen
  entschieden haben"; der Admin filtert Akteur-Art serverseitig. Offene
  Frage 2.
- **Zeilen auswählen.** Wie 0053.

## Verhalten

- **Sicht** (`Segmented`, `role="group"`, `ariaLabel="Sicht"`): drei Knöpfe
  mit Zähler. Sicht *n* zeigt Zeilen mit `depth ≤ n`; fehlendes `depth` liest
  als 2 (0053). Der Zähler je Sicht ist die Zahl der Zeilen, die **mit den
  anderen aktiven Filtern** in dieser Sicht sichtbar wären — so sieht man
  vor dem Klick, was man bekommt.
- **Schwere** (`FilterChips`, Label „Schwere"): `Alle` · `ab Warnung` ·
  `nur Fehler`, mit Zählern nach derselben Regel. Die Gruppe erscheint nur,
  wenn mindestens eine Zeile `level` trägt. `debug`/`verbose` bekommen keinen
  eigenen Chip — sie sind Tiefe 3, nicht Schwere.
- **Suche** (`SearchInput`, Platzhalter „Im Protokoll suchen"): sofort,
  ohne Knopf; Groß/Klein egal; Treffer in `message`, `detail`, `code`,
  `source`, `actor.label`, `refs[].label`. `Escape` im Feld leert es.
- **Reihenfolge der Filter:** Sicht → Schwere → Suche; Zähler rechnen
  jeweils mit den beiden anderen.
- **`FilterBar`:** `activeCount` = Schwere ≠ alle (1) + Suche ≠ leer (1);
  die Sicht zählt nicht als Filter — sie ist immer eine. `onReset` setzt
  Schwere und Suche zurück, die Sicht bleibt.
- **Leer nach Filter:** `EmptyState inline` — „Nichts in ‚Technik' ab
  Warnung zu ‚RE-4471' — in den 300 geladenen Einträgen." Aktion:
  „Filter zurücksetzen"; dazu „Ältere laden", wenn `more.hasMore`. Ohne
  Filter und ohne Zeilen zeigt die `LogList` ihren `emptyText`.
- **Ältere laden** (`Button variant="secondary"` am Fuß der Karte): Text
  „Ältere laden", während `more.loading` „Lädt …" und `disabled`. Neue
  Zeilen laufen durch dieselben Filter; die Zähler wachsen.
- **`onChange`** feuert nach jeder Änderung mit dem vollen `LogFilterState`,
  nicht beim Mount.
- **Tastatur:** Hauptweg `Tab` → Sicht-Knöpfe → Schwere-Chips → Suchfeld →
  Liste; alles Knöpfe oder Eingaben, kein Icon ohne Wort (V11, V14). Kein
  Hotkey — die Suche ist ein Feld, kein Befehl.
- **Zustände:** gefüllt · leer nach Filter · lädt (durchgereicht). *Nicht:*
  leer ohne Filter (`LogList`) · Fehler (Seite).
- **Client-Component:** `useState` für `LogFilterState`; sonst nichts.
- **CSS:** `.v2log__head`, `.v2log__foot` in `v3.css`; Kopf über der Karte,
  nie im Kartenkopf (Baukasten §6).

## Stories

Abgeleitet nach §6. Titel `v3/Patterns/Prozess/LogBrowser`.

| Story | Beweist |
|---|---|
| `Filled` | Stapel-Log mit 120 Zeilen aller drei Tiefen und aller Schweren; Sicht „Protokoll", Zähler sichtbar |
| `Views` | dieselben Zeilen dreimal nebeneinander mit `initialView` 1, 2, 3 — und einmal mit eigenen `viewLabels` |
| `Filters` | Rundlauf: Schwere „nur Fehler" und Suche „RE-4471" setzen, Zähler ändern sich, `Zurücksetzen` erscheint mit „2 Filter gesetzt" |
| `EmptyAfterFilter` | Suche ohne Treffer: der Leertext nennt Sicht, Schwere, Suchwort und die Zahl der geladenen Zeilen; Aktion setzt zurück |
| `LoadMore` | `more` mit `useState`: Klick hängt 50 ältere Zeilen an, Zähler wachsen, `loading` sperrt den Knopf; danach `hasMore: false`, kein Knopf |
| `Mirror` | `onChange` schreibt den `LogFilterState` daneben als Text — der Fall, in dem die Seite in die URL spiegelt |
| `InUse` | in `Card` auf dem Pipeline-Tab des Belegs: Spur + Extraktions-Log gemischt (Mapper aus 0053), Sicht „Protokoll" zeigt die Begründungen, „Technik" dazu die Step-Grenzen — ersetzt `InvoiceLogsPanel` samt verbose-Schalter |

Sieben Stories: zwei Zustände, eine Enum-Prop, zwei Callbacks, ein Einsatz,
ein Verhalten (`Filters`) — die Suche ist Logik ohne Prop und braucht
trotzdem ihren Beweis.

**Nicht anwendbar:** `Empty` und `Loading` — durchgereicht, beweist 0053.
`Error` — die Seite. Kein Rand: der Browser formatiert nichts; viele Zeilen
beweist `Filled`.

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

- [ ] Sicht *n* zeigt genau die Zeilen mit `depth ≤ n`, fehlendes `depth` gilt als 2; `initialView` Default 2 (`Views`)
- [ ] Zähler je Sicht und je Schwere rechnen mit den jeweils anderen aktiven Filtern (`Filters`)
- [ ] `viewLabels` ersetzt die drei Wörter; Default Verlauf · Protokoll · Technik (`Views`)
- [ ] Schwere-Chips erscheinen nur, wenn eine Zeile `level` trägt; „ab Warnung" = warning + error, „nur Fehler" = error (`Filters`)
- [ ] Suche trifft `message`, `detail`, `code`, `source`, `actor.label`, `refs[].label`, ohne Groß/Klein; `Escape` leert (`Filters`)
- [ ] `activeCount` zählt Schwere und Suche, nicht die Sicht; `Zurücksetzen` lässt die Sicht stehen (`Filters`)
- [ ] Leer nach Filter nennt Sicht, Schwere, Suchwort und Zahl der geladenen Zeilen; Aktion setzt zurück; „Ältere laden" nur bei `more.hasMore` (`EmptyAfterFilter`)
- [ ] `more.onLoad` hängt Zeilen an, `more.loading` sperrt den Knopf mit „Lädt …", `hasMore: false` entfernt ihn (`LoadMore`)
- [ ] `onChange` liefert nach jeder Änderung den vollen `LogFilterState`, nicht beim Mount (`Mirror`)
- [ ] `SegmentOption.count` existiert, gedämpft rechts am Label; `Segmented`-`@when` erweitert um einen Halbsatz; bestehende `Segmented`-Story um eine Variante mit Zählern ergänzt
- [ ] Tastatur: `Tab` durch Sicht, Schwere, Suche, Liste; jeder Knopf mit Wort (`Filled`)
- [ ] `"use client"` nur in `LogBrowser.tsx`; `Log.tsx` bleibt Server
- [ ] Tut bewusst nicht: Server fragen, Spalten sortieren, nach Akteur filtern, Zeilen auswählen — Aufrufer löst es mit URL-Filtern der Seite, `order`, Server-Filter, `MasterDetail`
- [ ] Ersetzt `InvoiceLogsPanel` samt verbose-Schalter und die Stapel-Sichten ohne Funktionsverlust — **offen (App)**, siehe `docs/backlog/README.md`

## Befunde für `ludwig/app`

1. **Zwei Sicht-Mechaniken, eine Bedeutung.** `InvoiceLogsPanel`
   (Fachlich/Technisch/Beide + verbose, Client-State) und das Stapel-Log
   (Verlauf/Protokoll/Technik, URL) meinen dasselbe. Mit 0053/0054 wird
   „Fachlich" = Tiefe ≤ 2, „Technisch" = Tiefe 3, „verbose" = Schwere-
   freie Tiefe-3-Zeilen; der Schalter fällt weg.
2. **`BATCH_LOG_VIEWS` ist an den Stapel gebunden**, trägt aber die
   allgemeinen Wörter und Hinweise aus Z6. Vorschlag: nach
   `audit-log/domain/` als `LOG_VIEWS`, der Stapel importiert.
3. **Admin-Filter teilt sich**: `q`, `outcome`, `actorKind` können lokal
   laufen (Seite lädt bis 200 Zeilen), `from`/`to`/`clientId`/
   `resourceKind`/`resourceId`/`correlationId` bleiben Server. Die Seite
   behält dafür ihre `FilterBar` mit `submitLabel`.

## Offene Fragen

1. **Sicht in die URL?** Der Stapel spiegelt sie heute (`parseBatchLogView`),
   der Beleg-Tab nicht. *Ohne Antwort: nicht im Set* — `onChange` genügt,
   die Seite spiegelt, wenn ihr Deep-Link etwas wert ist.
2. **Akteur-Filter (Nutzer · Agent · System)?** *Ohne Antwort: nein* — die
   Sicht „Verlauf" deckt „was Menschen taten", und wer im Mandanten-Audit
   nur den Agenten sehen will, bekommt das als Server-Filter. Kommt, wenn
   eine Seite es lokal braucht — dann als vierter Chip-Block, derived aus
   den Daten.
3. **`Segmented` erweitern oder Zähler ins Label („Verlauf · 12")?**
   *Ohne Antwort: erweitern* — `TabItem` hat `count` schon; ein Zähler im
   Label wäre eine Zahl im Text ohne `tnum` und ohne Dämpfung.

## Abweichung beim Bauen

**Der Leerzustand hat einen zweiten Ausweg bekommen.** Die Spec nennt als
Aktion „Filter zurücksetzen"; sie setzt Schwere und Suche zurück und lässt
die Sicht stehen. Blendet aber die **Sicht allein** aus — alle Zeilen sind
Technik, die Sicht steht auf Verlauf —, dann ist dieser Knopf ohne Wirkung:
er räumt weg, was gar nicht gesetzt ist. Der Browser zeigt deshalb, wenn eine
tiefere Sicht Zeilen hätte, zusätzlich „Zu „Technik" wechseln" (primär, wenn
kein Filter gesetzt ist, sonst sekundär neben dem Zurücksetzen). Ohne das
stünde dort ein toter Knopf, und I10 verlangt den nächsten Schritt.
Nachzusehen in `EmptyAfterFilter`.

## Abnahme

Geprüft am Stand `55286d7` von einem Agenten, der nicht gebaut hat, gegen
Spec und Code — ohne Chatverlauf. Gemessen im DOM unter
`http://localhost:6107`, die Zähler zusätzlich außerhalb des Browsers aus den
Story-Daten nachgerechnet (dieselbe Regel, unabhängig implementiert), damit
nicht die Komponente sich selbst bestätigt.

| Kriterium | Nachweis (Story-ID · Befehl · Codestelle) | Ergebnis |
|---|---|---|
| **Fest** — `pnpm typecheck` und `pnpm build` grün | Selbst gelaufen: `pnpm typecheck` → `tsc --noEmit`, keine Ausgabe, Exit 0; `pnpm build` → „Storybook build completed successfully", Exit 0 (nur die bekannte Rolldown-Timing-Notiz) | ✓ |
| **Fest** — Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/LogBrowser.tsx`, `LogBrowser.stories.tsx` daneben, `:12` `title: "v3/Patterns/Prozess/LogBrowser"` — dieselbe Gruppe wie `LogList` und `Timeline`; Barrel `index.ts:212` `export { LogBrowser, type LogFilterState }` unter „Prozess" | ✓ |
| **Fest** — Code englisch; `@when`/`@instead` an jedem Export | **Zweite Runde, selbst geprüft am Stand `74ee4e2`.** `git show 74ee4e2` ändert genau zwei Zeilen Code: der Kommentar über dem Sichtwechsel heißt jetzt „When the view alone is what hides the rows, resetting helps nothing — then the way out is the view that holds them." (`LogBrowser.tsx:194–195`). Alle Kommentare beider Dateien durchgesehen (`LogBrowser.tsx` 21 Blöcke, `LogBrowser.stories.tsx` 13): durchweg englisch. Deutsch steht nur noch **in Anführungszeichen als zitierter UI-Text** — „Verlauf · Protokoll · Technik" (`:24`), „Ältere laden" (`:86`), „nur Fehler"/„RE-4471"/„2 Filter gesetzt" in den Story-Doks —, nach `CLAUDE.md` kein Verstoß. Bezeichner-Scan über alle Deklarationen und Props beider Dateien: kein deutscher Treffer; `wider` (`:117`) ist das englische Wort, kein Artikel. `@when`/`@instead` an `LogBrowser` (`:64–70`) unverändert. Nichts gebrochen: `pnpm typecheck` selbst gelaufen → `tsc --noEmit`, keine Ausgabe, Exit 0; `v3-patterns-prozess-logbrowser--empty-after-filter` unter `http://localhost:6107` geöffnet — „Nichts in „Verlauf" — in den 45 geladenen Einträgen." mit „Zu „Technik" wechseln" (primär) und „Ältere laden", kein totes „Zurücksetzen"; Klick auf den Sichtwechsel → Sicht „Technik", 45 Zeilen, Zähler 0/0/45 | ✓ |
| **Fest** — Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\|[0-9]+px'` über `LogBrowser.tsx`, `LogBrowser.stories.tsx`, `Segmented.stories.tsx` → kein Treffer. Neues CSS nur mit Token: `.v2seg__btn .n` (`v3.css:560–564`, `var(--space-1)`), `.v2log__head`/`.v2log__foot` (`:2143–2149`, `var(--space-3)`, `var(--space-5)`, `var(--border-1-subtle)`, `var(--color-surface-head)`). Story-Gerüst `gap: 24`/`gap: 16` ist Hausbrauch (wie 0053). Keine Status-Map: die Schwere-Badges kommen aus `LogList`/`StatusBadge axis="log_level"`; `SEVERITIES` und `DEFAULT_VIEW_LABELS` sind Filter- bzw. Sicht-Wörter aus Z6, die die Spec wörtlich vorschreibt | ✓ |
| **Fest** — Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Genau die sieben der Spec: `Filled` (`:93`), `Views` (`:107`), `Filters` (`:135`), `EmptyAfterFilter` (`:149`), `LoadMore` (`:163`), `Mirror` (`:192`), `InUse` (`:355`) — alle sieben im Browser geöffnet, alle rendern. Ausgeschlossen mit Grund im Abschnitt „Stories": `Empty`/`Loading` (durchgereicht, 0053), `Error` (Seite), kein Rand. Anmerkung ohne ✗: die Schnittstelle nennt `Filled` als Nachweis für `order`, `loading` und `emptyText`, gesetzt werden sie dort nicht — `order="oldest"` beweist `InUse` (`:363`, aufsteigend 01.09. → 03.09. gemessen), `loading` und `emptyText` bleiben unbelegt, was der Spec-Satz „durchgereicht, beweist 0053" deckt | ✓ |
| **Fest** — Prüfliste `design-guidelines.md` §9 durchgegangen | Durchgegangen, die zwei App-Punkte übersprungen (`docs/backlog/README.md`). Stufe/Importe: `patterns/`, importiert `primitives/*` abwärts und `./Log` seitlich — dieselbe Konvention wie `Timeline`, `TodoList`, `StatusBadge`. V3: Zähler `font-variant-numeric: tabular-nums`, nichts zentriert. V6/V7: der Browser färbt nichts, jeder Knopf trägt ein Wort. V9/T6: gefüllt · leer nach Filter · lädt vorhanden, die anderen zwei begründet abgetreten. V10: Fokusring gemessen `2px solid rgb(59,143,196)`, `:focus-visible` greift. V11/V14/T8: kein Icon, kein Hotkey. L2–L4: kein Modal, Karte beim Aufrufer. T3/T5: „Ältere laden", „Filter zurücksetzen", „Zu „Technik" wechseln", „Lädt …" — Imperativ mit Objekt. T7: Zahl gedämpft neben dem Wort, `tnum`. **Zwei Befunde ohne ✗, beide keine Erfindung dieser Aufgabe:** (a) der Zähler misst 2,6:1 (inaktiv) bzw. 3,6:1 (aktiv) gegen V10 — Ursache ist `opacity: 0.6`, exakt der Wert des bestehenden `.v2tab .n` (`v3.css:543`), den die Spec zu spiegeln verlangt; das gehört systemweit entschieden (ein gedämpftes Token statt Opazität), nicht in 0054. (b) `.v2seg__btn` hat keine `:hover`-Regel — Lücke des bestehenden `Segmented`, `.v2chip:hover` (`:584`) hat sie | ✓ |
| **Fest** — Im Browser angesehen (Storybook), nicht nur gebaut | Alle sieben Story-IDs plus `v3-primitives-navigation-segmented--with-counts` unter `http://localhost:6107/iframe.html?id=…` geöffnet; DOM je Zustand ausgelesen (Zähler, `aria-pressed`, `aria-busy`, `disabled`, Klassen), echte Klicks und echte Tastendrücke (`Escape`, `shift+Tab`), `getComputedStyle` für Fokusring und Kontrast, Screenshots von `Filters`, `EmptyAfterFilter`, `InUse` und dem Segment-Zähler angesehen | ✓ |
| Sicht *n* zeigt genau die Zeilen mit `depth ≤ n`, fehlendes `depth` gilt als 2; `initialView` Default 2 | `LogBrowser.tsx:39–41` (`(entry.depth ?? 2) <= view`), `:73` Default `initialView = 2`. `Views` misst über dieselben 40 Zeilen: Karte 1 → 2 Zeilen, Karte 2 → 15, Karte 3 → 40, und die Karte ohne `initialView` steht auf der mittleren Sicht. Unabhängig nachgerechnet: Tiefe 1 = 2, Tiefe ≤ 2 = 15, alle = 40 — gleiche Zahlen. `Filled` (120 Zeilen) startet auf „Protokoll" mit 44 sichtbaren Zeilen. Das fehlende `depth` belegt keine Story (alle Story-Zeilen tragen es), sondern der Ausdruck in `:40` | ✓ |
| Zähler je Sicht und je Schwere rechnen mit den jeweils anderen aktiven Filtern | `LogBrowser.tsx:106–112` — beide Zählschleifen legen die jeweils anderen zwei Prädikate an. In `Filters` (120 Zeilen, Sicht „Technik") gemessen: ohne Filter Sichten 6/44/120, Chips 120/39/17. Nach Klick „nur Fehler": Sichten fallen auf **1/1/17**, die Chips bleiben 120/39/17 (sie rechnen mit Sicht + Suche, nicht mit sich selbst). Zusätzlich „re-4471" getippt: Sichten 0/0/0, Chips **2/0/0** — die zwei Treffer sind `info`, also null ab Warnung. Alle sechs Zahlen stimmen mit der außerhalb nachgerechneten Tabelle überein (Sicht × Schwere: 6/1/1 · 44/23/1 · 120/39/17) | ✓ |
| `viewLabels` ersetzt die drei Wörter; Default Verlauf · Protokoll · Technik | `:75` Default `DEFAULT_VIEW_LABELS`, `:31`. `Views`, vierte Karte: die Knöpfe heißen „Kurz 2 · Fachlich 15 · Roh 40", die Zähler unverändert; die anderen drei Karten und `Filled` zeigen Verlauf · Protokoll · Technik. Der Leertext nimmt dasselbe Wort (`:190`, `viewLabels[view - 1]`) | ✓ |
| Schwere-Chips erscheinen nur, wenn eine Zeile `level` trägt; „ab Warnung" = warning + error, „nur Fehler" = error | `:44–48` (`inSeverity`) und `:115` (`hasLevels`). Gemessen in `Filled`: „Alle 44 · ab Warnung 23 · nur Fehler 1" — 23 = 22 Warnungen + 1 Fehler, 1 = nur der Fehler; in „Technik" 120/39/17, ebenfalls deckungsgleich mit der Nachrechnung. `debug`/`verbose` haben keinen Chip. Das Ausblenden der Gruppe belegt keine Story (jede Story-Zeile trägt `level`), sondern die Bedingung in `:154` | ✓ |
| Suche trifft `message`, `detail`, `code`, `source`, `actor.label`, `refs[].label`, ohne Groß/Klein; `Escape` leert | `:50–62` (`matches`, `toLowerCase` auf beiden Seiten, `:98` `search.trim().toLowerCase()`). Im Browser einzeln getroffen: `message` „Kreditor-Suche" → 16, `source` „workflows" → 76, `actor.label` „buero@mandant.de" → 38, `code` „bridge.timeout" → 16 und „layout.model" → 1 (`InUse`), `detail` „bürobedarf" → 1 und „steuerblöcke" → 1 (`InUse`, Text steht nur im `.v2sub`). Groß/Klein: „WORKFLOWS" → 76 wie „workflows", „re-4471" → 2 wie „RE-4471". `refs[].label` steht in `:59` in derselben Liste, ist aber von keiner Story isolierbar — die beiden Zeilen mit `refs` tragen „RE-4471" auch in der `message`. `Escape`: echter Tastendruck im Feld → Wert leer, 17 Zeilen bleiben, „1 Filter gesetzt" (die Schwere bleibt), Fokus bleibt im Feld; Handler `:172` | ✓ |
| `activeCount` zählt Schwere und Suche, nicht die Sicht; `Zurücksetzen` lässt die Sicht stehen | `:114`. Gemessen: nur Sicht gewechselt → kein Zählwort; „nur Fehler" → „1 Filter gesetzt"; dazu ein Suchwort → „2 Filter gesetzt"; Klick auf `Zurücksetzen` → Chips auf „Alle", Feld leer, Zählwort weg, **Sicht bleibt „Technik"** (120 Zeilen). `Mirror` bestätigt es im Callback: nach dem Zurücksetzen `view=3 · severity=all · search=""` | ✓ |
| Leer nach Filter nennt Sicht, Schwere, Suchwort und Zahl der geladenen Zeilen; Aktion setzt zurück; „Ältere laden" nur bei `more.hasMore` | `:184–212`, Text aus `:218–229`. Gemessen in `Filters`: „Nichts in „Technik" ab Warnung zu „schritt" — in den 120 geladenen Einträgen." mit dem Knopf „Filter zurücksetzen", der Sicht, Schwere und Suche wieder auf 120 Zeilen bringt; ohne `more`-Prop steht dort kein zweiter Knopf. In `EmptyAfterFilter` (mit `more.hasMore`) steht „Ältere laden" daneben, nach dem Sichtwechsel wandert es in den Fuß `.v2log__foot` — nie doppelt (`:213` verlangt `shown.length > 0`). Nicht gesetzte Filter werden nicht genannt („Nichts in „Verlauf" zu „workflows" …"), was dem Muster der Spec entspricht | ✓ |
| `more.onLoad` hängt Zeilen an, `more.loading` sperrt den Knopf mit „Lädt …", `hasMore: false` entfernt ihn | `:127–137`, `:213`. `LoadMore` gemessen: Start 20 Zeilen, Sichten 1/7/20, Fuß „Ältere laden". Nach dem Klick 200 ms: Text „Lädt …", `disabled=true`, `aria-busy="true"`. Nach dem Nachladen 70 Zeilen, Sichten **4/26/70** (nachgerechnet identisch — die neuen Zeilen laufen durch dieselben Filter), `hasMore` false, Fuß weg | ✓ |
| `onChange` liefert nach jeder Änderung den vollen `LogFilterState`, nicht beim Mount | `:118–124` — der Callback läuft im Ereignis, nicht in einem Effekt. `Mirror` gemessen: beim Öffnen steht „onChange feuert nicht beim Mount", danach Klick Sicht → `view=3 · severity=all · search=""`, Klick Chip → `severity=error`, Tippen → `search="bridge"`, `Zurücksetzen` → `view=3 · severity=all · search=""`. Jedes Mal alle drei Felder | ✓ |
| `SegmentOption.count` existiert, gedämpft rechts am Label; `Segmented`-`@when` erweitert; bestehende `Segmented`-Story um eine Variante mit Zählern ergänzt | `Nav.tsx:87` (`count?: number`), `:114–119` (`<span className="n">`, auch im `href`-Zweig), `@when` in `:92–93` um „, with a count per view where the views differ in size" erweitert. `v3.css:560–564`: `margin-left: var(--space-1)`, `tabular-nums`, `opacity: 0.6` — dasselbe Rezept wie `.v2tab .n` (`:543`). Story `WithCounts` (`Segmented.stories.tsx:50–65`) im Browser: „Verlauf 12 · Protokoll 48 · Technik 300", Zahl gedämpft rechts | ✓ |
| Tastatur: `Tab` durch Sicht, Schwere, Suche, Liste; jeder Knopf mit Wort | Fokusfolge in `.v2logb` ausgelesen: `Verlauf` → `Protokoll` → `Technik` → `Alle` → `ab Warnung` → `nur Fehler` → Suchfeld → dann die Liste (Bezug-Links, `<summary>`); kein `tabindex`, keine Falle. Echter `shift+Tab` aus dem Suchfeld landet auf „nur Fehler". Alles `<button>` bzw. `<input>`, kein Icon ohne Wort; Fokusring sichtbar (`2px solid rgb(59,143,196)`, im Screenshot am Chip „Alle 44"). `role="group" aria-label="Sicht"` und die Gruppenüberschrift „Schwere" stehen im DOM | ✓ |
| `"use client"` nur in `LogBrowser.tsx`; `Log.tsx` bleibt Server | `grep -n 'use client'` → nur `LogBrowser.tsx:1`; `Log.tsx` hat es nicht und bekam nur die geänderte `@instead`-Zeile. Zustand ausschließlich `useState` (`:95–97`), kein Effekt, kein Fetch, kein Router | ✓ |
| Tut bewusst nicht: Server fragen, Spalten sortieren, nach Akteur filtern, Zeilen auswählen | Die Schnittstelle (`:71–93`) kennt `entries`, `initialView`, `viewLabels`, `more`, `onChange`, `order`, `loading`, `emptyText` — kein `href`, kein `onSelect`, keine Spaltenliste, kein Akteur-Filter; `more.onLoad` lädt nicht selbst, sondern ruft den Aufrufer. Kein Import aus `next/navigation`, kein `fetch`. `@instead` (`:67–69`) schickt Zeitraum/Mandant/Ressource an die `FilterBar` der Seite und die Geschichte eines Objekts an `Timeline` | ✓ |
| **Abweichung beim Bauen** — der zweite Ausweg im Leerzustand („Zu „X" wechseln") | **Gerechtfertigt, nicht bloß hingenommen.** Die Spec selbst erzeugt den Fall: die Sicht ist kein Filter (`activeCount` zählt sie nicht) und `Zurücksetzen` lässt sie ausdrücklich stehen — blendet also die Sicht allein aus, wäre der vorgeschriebene Knopf wirkungslos. Der Bau zeigt „Filter zurücksetzen" deshalb nur bei `activeCount > 0` (`:188`) und stellt den Sichtwechsel nur dann daneben, wenn eine tiefere Sicht **unter den übrigen Filtern** wirklich Zeilen hätte (`:116`, `wider`); der Knopf nennt sein Ziel im Wort. Er fügt keine Prop, keinen Zustand und keine Fähigkeit hinzu, ist umkehrbar und erfüllt I10 und den eigenen Einordnungssatz „`EmptyState inline` — leer nach Filter, mit **Ausweg**". Gemessen: `EmptyAfterFilter` (45 reine Technik-Zeilen, Sicht „Verlauf", kein Filter) zeigt „Zu „Technik" wechseln" primär plus „Ältere laden" und **kein** totes „Zurücksetzen"; Klick → Sicht „Technik", 45 Zeilen. Mit gesetztem Filter (Sicht „Verlauf" + Suche „workflows") stehen beide Knöpfe, der Sichtwechsel behält die Suche. Einzige Ungenauigkeit gegenüber dem Wortlaut der Abweichung: dort heißt es „sonst sekundär **neben dem Zurücksetzen**", aber `Button` ist ohne `variant` bereits sekundär (`Button.tsx:96`) — in diesem Fall stehen zwei sekundäre Knöpfe, kein primärer. Optisch stimmig, nur nicht das, was der Satz nahelegt; kein ✗ | ✓ |
| Ersetzt `InvoiceLogsPanel` samt verbose-Schalter und die Stapel-Sichten ohne Funktionsverlust | Zielt auf `ludwig/app`, nicht auf dieses Repo (`docs/backlog/README.md`). Hier belegt `InUse`, dass die Form trägt: `InvoiceTraceEntry` und Extraktions-Log in **einem** Strom (`LogBrowser.stories.tsx:355–369`), „Protokoll" zeigt Begründung und Korrektur, „Technik" die Step-Grenzen dazu — ein Schalter statt Fachlich/Technisch/Beide + verbose | offen (App) |

**Was noch auffiel, ohne Kriterium zu verletzen:** steht `loading` auf `true`,
während ein Filter alle geladenen Zeilen ausblendet, gewinnt der Leerzustand
gegen den `Skeleton` (`:184`) — konstruiert, aber ungeklärt; die Spec sagt zur
Reihenfolge nichts. Und der Leertext mischt in `emptyAfterFilter` die
Anführungszeichen (`„…"` bei Sicht und Suchwort, `„…"` im Knopf `:202`) — im
Set ist beides üblich, die englische Form überwiegt sogar.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-04 · Offene Punkte: **ein
Mangel**, eine Zeile groß — der deutsche Kommentar in `LogBrowser.tsx:194–195`
muss englisch werden (`CLAUDE.md`); danach ist die Aufgabe `fertig`, eine
erneute Prüfung der übrigen Kriterien braucht es dafür nicht. **Offen (App)**
bleibt die Ablösung von `InvoiceLogsPanel` und der Stapel-Sichten in
`ludwig/app`. Zwei Befunde ohne ✗ gehören ins Set, nicht in diese Aufgabe: der
Zählerkontrast von 2,6:1 (systemweit `opacity: 0.6` an `.v2tab .n` und jetzt
`.v2seg__btn .n`) und das fehlende `:hover` an `.v2seg__btn`. Bilanz:
**20 ✓ · 1 ✗ · 1 offen (App)**.

Zweite Abnahme von / am: Claude (zweite Abnahme), 2026-09-04 · Geprüft am Stand
`74ee4e2`, ohne Chatverlauf — bewusst kein Neudurchlauf: nachgesehen wurde
allein der eine Mangel und dass die Nachbesserung nichts gebrochen hat. Der
deutsche Kommentar ist englisch, und sonst steht in beiden Dateien kein
deutscher Bezeichner und kein deutscher Kommentar mehr — Deutsch nur noch als
zitierter oder ausgegebener UI-Text. `pnpm typecheck` grün, `EmptyAfterFilter`
im Browser unverändert richtig, der Sichtwechsel klickt sauber auf „Technik"
(45 Zeilen). Sonst nichts Neues gefunden. **Offen (App)** bleibt wie gehabt die
Ablösung von `InvoiceLogsPanel` und der Stapel-Sichten in `ludwig/app` — sie
zielt nicht auf dieses Repo; die zwei Befunde ohne ✗ (Zählerkontrast, fehlendes
`:hover` an `.v2seg__btn`) bleiben Sache des Sets. Neue Bilanz:
**21 ✓ · 1 offen (App)** — Status `fertig`.
