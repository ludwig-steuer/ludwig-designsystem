# 0054 · LogBrowser — Sicht, Schwere und Suche über dem Protokoll

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` — Gruppe Prozess, neben `LogList` (0053) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, sobald sie ein Protokoll hat, in dem jemand „nur die Fehler" oder „nur was Menschen taten" sehen will |
| Quelle | Anfrage Owner 2026-09-03 („eingebettet im Logbrowser, der suchen, sortieren, filtern kann") · **Z6** in `ludwig-UX-guidelines-v2.md` („ein Strom, drei Sichten: Verlauf · Protokoll · Technik, plus Fehlerfilter") · Vorlagen: `InvoiceLogsPanel` (`modules/invoices/ui/logs`, Toggle Fachlich/Technisch/Beide + verbose), Stapel-Log (`datev-export/domain/batch-log.ts`: `BATCH_LOG_VIEWS`, `visibleInBatchLog`), Filterformular in `app/(app)/admin/audit-log/page.tsx` |
| Ersetzt | `InvoiceLogsPanel` (222 Z.) · die Sicht-Umschaltung des Stapel-Logs auf `[year]/stapel/[batchId]` · den **lokalen** Teil des Admin-Filters (`q`, `outcome`, `actorKind`) — Zeitraum, Mandant, Ressource, Vorgang bleiben Server-Filter der Seite |
| Blockiert | von 0053 · blockiert Welle 3 (`admin/audit-log`, `configuration/logs`), den Pipeline-Tab des Belegs, den Stapel-Log |
| Spec von / am | Claude, 2026-09-03 |
| Gebaut von / am | Claude, 2026-09-04 |

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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
