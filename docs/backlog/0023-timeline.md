# 0023 · Timeline — was wann mit diesem Vorgang geschah

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` |
| Klassen-Test | ja, sobald es dort Vorgänge mit Historie gibt — „Ereignisse in der Zeit" kennt kein Fachwort |
| Quelle | `docs/v3-backlog.md` „Später": `Verlauf` (Zeitstrahl — **heute siebenmal verschieden**), 7 Stellen · Showcase `src/showcase/CaseCrud.stories.tsx` |
| Ersetzt | sieben Eigenbauten, darunter `CycleTimeline` (`modules/cycles/ui`), die Log-Ansichten und die Ereignisliste am Sachverhalt |
| Blockiert | das Sachverhalts-Detail (Welle 1), den Lauf-Detail (Step-Log), jede Audit-Ansicht |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

„Warum steht der Sachverhalt so da?" beantwortet keine Kennzahl, sondern die
Reihenfolge: Beleg kam am 26.08., Zahlung am 29.08., der Agent hat am 30.08.
gebucht, die Kanzlei am 31.08. eine Rückfrage gestellt. Heute baut jede der
sieben Stellen ihren eigenen Strang — mit eigener Datumsformatierung, eigenem
Punkt, eigener Gruppierung.

Ein Verlauf ist außerdem die einzige Stelle, an der **Lücken** sichtbar werden:
zwei Wochen ohne Ereignis sind eine Aussage.

## Einordnung

- **Wiederverwenden:** `Process`/`ProcessStepper` zeigt **Phasen eines
  Ablaufs** — bekannte Schritte, feste Reihenfolge, Fortschritt. Ein Verlauf
  ist das Gegenteil: unbekannt viele Ereignisse, entstanden statt geplant.
  `TodoList` trägt Zustand und Arbeit, kein Datum. `Table` verliert die
  Reihenfolge als Aussage — eine Tabelle liest man spaltenweise.
- **Neu, weil:** §3.4 — Komposition mit eigenem Zustand (Gruppierung,
  Aufklappen, Filter je Art) auf mindestens zwei Screens. Prozessbegriffe ja
  (Ereignis, Verlauf), Entität nein — deshalb `patterns/`, nicht
  `entities/accounting-case/`.
- **Zuschnitt:** eine Familie in einer Datei: `Timeline` (der Strang) und
  `TimelineEntry` (ein Ereignis). Sie ergeben nur miteinander Sinn (§4).
- **Setzt auf:** `Badge` (Art), `Timestamp` (Zeit), `StateIcon` (Zustand),
  `Markdown` (0022, für Ereignistexte des Agenten).

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `entries` | `TimelineItem[]` | ja | **Ungesortiert übergeben** — die Komponente sortiert nach `at` | `Filled` |
| `order` | `"newest" \| "oldest"` | nein | Default `newest`. Am Sachverhalt zählt das Letzte, im Audit der Anfang | `Order` |
| `groupBy` | `"day" \| "month" \| "none"` | nein | Default `day`. Gruppenkopf trägt das Datum, die Einträge nur die Uhrzeit | `Grouping` |
| `emptyText` | `string` | nein | Default „Noch nichts geschehen." | `Empty` |
| `loading` | `boolean` | nein | — | `Loading` |
| `onOpen` | `(id: string) => void` | nein | Sprung zum Ereignis; ohne den Callback ist der Eintrag nicht klickbar | `Interactive` |

```ts
interface TimelineItem {
  id: string;
  /** ISO-Zeitpunkt. Ereignisse ohne Zeit gehören nicht in einen Verlauf. */
  at: string;
  /** Was geschah — ein Satz, kein Absatz. */
  title: string;
  /** Art des Ereignisses; färbt den Punkt und trägt das Label. */
  kind: string;
  /** Wer es ausgelöst hat: „Agent", „Kanzlei", „System". */
  actor?: string;
  /** Längerer Text, eingeklappt. Markdown, wenn er vom Agenten kommt. */
  detail?: string;
  /** Betrag, Nummer, Konto — was an diesem Ereignis hängt. */
  right?: ReactNode;
  state?: StateKind;
}
```

**Befund für `ludwig/app`:** `src/ludwig/` führt **keinen** Ereignistyp.
`CaseListItem` zählt sie nur (`documentEventsCount`, `bankEventsCount`) und
nennt die Arten im Kommentar (`document_received`, `payment_in`, `payment_out`,
`internal_transfer`), aber `client_accounting_case_event` ist nicht gespiegelt.
Nach `spec-schreiben` §5 wird hier **nichts erfunden**: `kind` bleibt `string`
mit einer Label-Registry als Prop, bis die App den Typ liefert. Das ist die
ehrliche Fassung, nicht die bequeme.

**Was die Komponente nicht kann (bewusst):**

- **Laden oder nachladen.** Auch nicht „ältere zeigen" — der Aufrufer gibt
  mehr `entries`.
- **Ereignisse erzeugen.** Ein Kommentarfeld unter dem Verlauf ist die Sache
  der Seite.
- **Zwei Stränge nebeneinander.** Wer Soll und Ist vergleichen will, nimmt
  `ComparisonTable`.

## Verhalten

- Absteigend nach `at`, gruppiert je Tag; der Gruppenkopf trägt das Datum
  ausgeschrieben, die Einträge nur `HH:MM`.
- **Lücken sind sichtbar:** liegen zwischen zwei Gruppen mehr als sieben Tage,
  steht dazwischen eine Zeile „14 Tage ohne Ereignis". Das ist der Grund für
  den Strang statt einer Liste.
- `detail` ist eingeklappt; Aufklappen lässt den Eintrag selbst und alles
  **über** ihm stehen — die Einträge darunter rücken um die Höhe des Textes
  nach. Ein Strang, dessen Einträge über der Klappe wegspringen, verliert die
  Stelle, auf die jemand gerade zeigt; was darunter nachrückt, ist die normale
  Bewegung eines Textflusses (geschärft in der Abnahme vom 2026-09-05).
- Zustände: gefüllt · leer · lädt. Kein „leer nach Filter" — die Komponente
  filtert nicht.
- Tastatur: die Einträge sind nur mit `onOpen` fokussierbar; sonst ist der
  Verlauf Text, kein Bedienelement.
- Client-Component (Aufklappen).

## Stories

Nach §6: 3 Zustände + 2 Enums + 1 Callback + 1 „im Einsatz" + 1 Rand = 8.

| Story | Beweist |
|---|---|
| `Filled` | ein Sachverhalt über drei Wochen, alle Ereignisarten, unsortiert übergeben |
| `Empty` | „Noch nichts geschehen." |
| `Loading` | `loading` |
| `Order` | `newest` und `oldest` nebeneinander |
| `Grouping` | `day`, `month`, `none` |
| `Interactive` | `onOpen`, Rundlauf mit `useState`; ohne den Callback nicht klickbar |
| `WithGap` | 14 Tage ohne Ereignis, die Lückenzeile |
| `InUse` | im Sachverhalts-Detail unter der `FieldList` |

## Erweiterung 2026-09-03 · für den Verlauf des Sachverhalts (0040)

Fünf kleine Zusätze, keiner ändert bestehendes Verhalten:

| Prop | Warum |
|---|---|
| `selectedId?: string \| null` | der Eintrag, der rechts im Detail offen steht: Fläche **und** `aria-current` (Farbe steht nie allein, V7) |
| `at` als Kalendertag `YYYY-MM-DD` | `event_date` und `due_date` sind `date`-Spalten — „26.08.2026 00:00" wäre eine Lüge; dann steht keine Uhrzeit, `dateTime` trägt den Tag |
| `kind?` optional | ohne `kind` und ohne `actor` entfällt die zweite Zeile; sie würde sonst das Icon in Worten wiederholen |
| `icon?: ReactNode` | ein Icon der Art vor dem Titel; `state`/`StateIcon` trägt Prüfzustände, keine Arten |
| `dim?: boolean` | ersetzte, zurückgezogene, historische Einträge treten zurück (`v2muted`), bleiben aber lesbar und wählbar |

Dazu eine Korrektur am Bestand: `right` (Betrag, Badge) stand **im**
`TextButton` — ohne Abstand zum Titel und als Teil des Klickziels. Es steht
jetzt daneben; der Knopf trägt nur den Titel.

Neue Stories: `Selected`, `DayOnly`, `WithoutKind`.

## Abnahmekriterien

> **Wiederhergestellt am 2026-09-05 aus `2b89c3f`.** Commit `64fbe27` hatte
> die Abschnitte „Abnahmekriterien" und „Offene Fragen" dieser Spec (und
> elf weiterer) beim Eintragen der Abnahme überschrieben — danach war gegen
> nichts mehr abnehmbar. Eine Abnahme trägt nur in die Tabelle „Abnahme" ein.

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Unsortierte `entries` erscheinen sortiert (`Filled`)
- [ ] Kein Ereignistyp lokal definiert; `kind` ist `string` mit Registry-Prop (`grep`)
- [ ] Zeiten über `Timestamp`, nicht über eigenes `Intl` (`grep`)
- [ ] Lückenzeile ab sieben Tagen, mit der Zahl der Tage (`WithGap`)
- [ ] Ohne `onOpen` sind Einträge nicht fokussierbar (`Filled`, Tab-Weg)
- [ ] Aufklappen verschiebt die Einträge **darüber** nicht und lässt den aufgeklappten an seiner Stelle; die darunter rücken nach (`Filled`, gemessen)
- [ ] Ersetzt `CycleTimeline` ohne Funktionsverlust

## Offene Fragen

1. **Wie viele Ereignisse auf einmal?** *Ohne Antwort: alle übergebenen. Wer
   kürzen will, kürzt vor der Übergabe — eine Komponente, die still weglässt,
   ist gefährlicher als eine lange Seite.*
2. **Sieben Tage als Lückenschwelle?** *Ohne Antwort: ja, mit `gapDays` als
   Prop überschreibbar. Im Monatsprozess ist eine Woche Stille auffällig, im
   Audit-Log nicht.*
3. **`kind` färbt den Punkt — woher die Farbe?** *Ohne Antwort: über die
   mitgegebene Registry, wie `StatusBadge` es tut. Keine Farbe ohne Wort (V6).*

## Abnahme

### Erste Abnahme, 2026-09-03 (unverändert stehen gelassen)

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Unsortierte `entries` erscheinen sortiert | `v3-patterns-prozess-timeline--gefuellt` (Daten in der Reihenfolge e3, e1, e4, e2 übergeben): Gruppenköpfe „Montag, 31. August 2026", „Sonntag, 30.", „Samstag, 29.", „Mittwoch, 26.", Zeiten 16:02 / 11:12 / 13:05 / 09:40 | ✓ |
| Kein Ereignistyp lokal definiert; `kind` ist `string` mit Registry-Prop | `kind: string` ✓ und kein lokaler Ereignistyp ✓ — aber es gibt **keine** Registry-Prop. `kind` wird als roher Text ausgegeben (`.v2tl__who`), und der Punkt wird nicht nach `kind` eingefärbt; die Farbe kommt allein aus dem optionalen `state` über `StateIcon`. Damit ist die Antwort auf Offene Frage 3 nicht umgesetzt | ✗ |
| Zeiten über `Timestamp`, nicht über eigenes `Intl` | `Timeline.tsx:37–53` legt drei eigene `Intl.DateTimeFormat` an (`DAY`, `MONTH`, `TIME`) und benutzt zusätzlich `toLocaleDateString("de-DE")`; `Timestamp` (`primitives/Cells.tsx:128`) wird nicht importiert. Im DOM steht folgerichtig **kein** `<time>`-Element (`document.querySelectorAll('time').length === 0`) | ✗ |
| Lückenzeile ab sieben Tagen, mit der Zahl der Tage | `--mit-luecke`: zwischen dem 26.08. und dem 05.08. steht `.v2tl__gap` „20 Tage ohne Ereignis"; `GAP_DAYS = 7` | ✓ |
| Ohne `onOpen` sind Einträge nicht fokussierbar | `--gefuellt`: kein `button`, `a` oder `[tabindex]` innerhalb `.v2tl` — nur das `summary` der eingeklappten `detail`-`Disclosure` ist ein Bedienelement. Gegenprobe `--interaktiv`: mit `onOpen` sind alle vier Einträge `TextButton`, Klick → „Geöffnet: e4" | ✓ |
| Aufklappen verschiebt keinen anderen Eintrag | `--gefuellt`, gemessen vor/nach Klick auf „Einzelheiten": die beiden Einträge **darunter** rücken von `top` 265 → 319 und 352 → 406 px, also 54 px nach unten. Die Einträge darüber bleiben stehen. Wörtlich genommen ist das Kriterium verletzt | ✗ |
| Ersetzt `CycleTimeline` ohne Funktionsverlust | Vergleich mit `app/apps/web/src/modules/cycles/ui/CycleTimeline.tsx`: Das ist keine Zeitleiste im Sinn dieser Spec, sondern eine **waagerechte Kartenreihe der Buchungsjahre** (`role="list"`, feste Kartenbreite, `overflow-x`, ganze Karte als `next/link`, `aria-current="page"` auf dem aktiven Jahr, drei Zählwerte je Karte, und bei leerer Liste rendert sie `null` statt eines Leertexts). `Timeline` kennt weder `href` noch Karten und rendert `emptyText` — ein Ersatz ist es nicht | ✗ |
| `pnpm typecheck` / `pnpm build` | beide grün | ✓ |

**Nachprüfung der Behebung** (fremder Prüfer, 2026-09-03): Vier `<time dateTime=…>`-Elemente statt eigener Formatierung (`span.v2tl__when` 0×), `kindLabels` übersetzt `clarification` zu „Rückfrage" usw.

Abgenommen von / am: Claude (Abnahme), 2026-09-03 · Offene Punkte:
(1) Zeiten auf `Timestamp` umstellen oder — falls die langen Gruppenköpfe das
verhindern — `Timestamp` um die nötigen Formate erweitern; heute steht im DOM
kein maschinenlesbares Datum. (2) Die Label-/Farb-Registry für `kind` fehlt
ganz; bis sie da ist, ist „Keine Farbe ohne Wort" nur deshalb erfüllt, weil gar
nicht gefärbt wird. (3) `gapDays` als Prop (Offene Frage 2) ist nicht gebaut,
die Schwelle ist die Konstante `GAP_DAYS`. (4) Beim Aufklappen rücken die
Einträge darunter nach — entweder das Kriterium auf „die Einträge **darüber**
bleiben stehen" schärfen oder das Aufklappen anders lösen. (5) Die Spec nennt
`Markdown` (0022) unter „Setzt auf"; `detail` ist stattdessen `ReactNode`, der
Aufrufer bringt das Rendern mit. (6) Der Kommentar an der Story `WithGap`
spricht von 21 Tagen, gerendert werden 20.

### Zweite Abnahme, 2026-09-05

Abnahme am 2026-09-05 (zweiter Agent, gegen Spec und Code; gebaut hat jemand
anders). Alle zwölf Stories auf `localhost:6107` geöffnet und bedient.

**Vorbemerkung: die Kriterien waren weg.** Commit `64fbe27` („Abnahme B und C")
hat beim Eintragen der Abnahme die Abschnitte „Abnahmekriterien" und „Offene
Fragen" dieser Spec gelöscht — deshalb standen im Text noch Verweise auf
„Offene Frage 2/3", die es nicht mehr gab. Beide Abschnitte sind aus
`2b89c3f` wiederhergestellt (siehe Kasten dort); derselbe Commit hat dasselbe
in elf weiteren Specs getan (0003, 0005, 0009, 0012, 0016, 0017, 0019, 0021,
0022, 0024, 0028 — die Liste ist vollständig) — das ist ein Befund für das Set, nicht für diese Aufgabe.

**Story-Deckung.** Die Spec nennt acht Stories plus die drei der Erweiterung
(`Selected`, `DayOnly`, `WithoutKind`) = elf; `index.json` führt zwölf — die
zwölfte ist `WithLabels` und deckt die beim Bauen dazugekommene Prop
`kindLabels`. Jede Prop der Schnittstelle hat ihre Story: `entries`
(`Filled`) · `order` (`Order`) · `groupBy` (`Grouping`) ·
`emptyText` (`Empty`, Default) · `loading` (`Loading`) · `onOpen` (`Interactive`) ·
`selectedId` (`Selected`) · `kindLabels` (`WithLabels`) · tagesgenaues `at`
(`DayOnly`) · `kind` optional (`WithoutKind`). **Lücke:** die beiden übrigen
Erweiterungs-Props `icon` und `dim` haben in `Timeline.stories.tsx` keine
Story (`grep -n "icon\|dim" src/ui/v3/patterns/Timeline.stories.tsx` leer);
gezeigt werden sie nur in einer fremden Story-Datei
(`CaseTimeline.stories.tsx --entry-kinds`). „leer nach Filter" und „Fehler"
sind in der Spec begründet ausgeschlossen (die Komponente filtert nicht und
lädt nicht).

**Fest**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `tsc --noEmit` ohne Ausgabe, Exit 0 (am Anfang und am Ende der Abnahme). `pnpm build` **nicht** neu gelaufen — parallele Abnahmen schreiben nach `storybook-static`; der Lauf für diesen Stand war grün: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/Timeline.tsx` mit `Timeline.stories.tsx` daneben ✓. **Die Gruppe stimmt nicht:** der Barrel führt `Timeline` unter `/* Prüfen */` (`src/ui/v3/index.ts:242` `/* Prüfen */` … Export `:254`, zwischen `ComparisonTable` und `ChoicePrompt`), der Story-Titel lautet `v3/Patterns/Prozess/Timeline`. Die Nachbarn halten sich beide Male aneinander (`ComparisonTable` und `ChoicePrompt` stehen im Baum unter „Prüfen", `LogList`/`LogBrowser`/`Process` aus `/* Prozess */` unter „Prozess") — `Timeline` ist der einzige Ausreißer. Entweder der Export wandert unter `/* Prozess */` oder der Titel heißt `v3/Patterns/Prüfen/Timeline` | ✗ |
| Code englisch; `@when`/`@instead` an jedem Export | `Timeline.tsx`: ein Export, `@when`/`@instead` bei `:86–91`, Bezeichner, Kommentare und JSDoc englisch ✓. Anmerkung ohne eigenes Kriterium: die Story-Exportnamen sind deutsch (`Filled`, `Loading`, `WithGap` …) — so schreibt es die Spec vor, `CLAUDE.md` verlangt englische Story-Exportnamen. Befund für das Set, nicht für diese Aufgabe | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -cE '#[0-9a-fA-F]{3,8}' Timeline.tsx` = 0, `grep -cE '[0-9]+px'` = 0. Keine Label-Map: `kindLabels` ist eine Prop (`:112`), kein Objekt in der Datei. Status läuft über `StateIcon` aus `patterns/Review` (`:204`), nicht über eigene Wörter. Optik in `v3.css:1915–1954`, alles über Tokens | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | elf genannte IDs vorhanden, dazu `--mit-labels`; Ausschlüsse begründet — siehe Story-Deckung oben | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Text links, Zeit in `.v2tl__when` mit `tabular-nums` (`v3.css:1927`), nichts zentriert (`textAlign: center` = 0 im Strang) · Farbe nur über `StateIcon`/`StatusBadge`, kein farbiger Zustand ohne Wort · `.v2tl__item.is-current` hat Fläche **und** `aria-current="true"` (V7) · Icons Lucide 1,5 px (in 0040 gemessen: `stroke-width=1.5`, `width=14`) · die zwei App-Punkte nach `backlog/README.md` übersprungen. **Offen bleibt der Punkt „ein Aufklappen darf nichts verschieben"** — siehe die variable Tabelle | ✓ |
| Im Browser angesehen, nicht nur gebaut | Alle zwölf IDs am 2026-09-05 geöffnet; `--interaktiv` mit Tab und Enter bedient (Fokus auf „Ist das Bewirtung oder Bürobedarf?", Enter → „Geöffnet: e4", zweiter Tab + Enter → „Geöffnet: e3"), `--gefuellt` aufgeklappt und die Kanten vor/nach gemessen. Keine Konsolenfehler in einer der Stories | ✓ |

**Variabel (aus dieser Spec)**

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| Unsortierte `entries` erscheinen sortiert (`Filled`) | `--gefuellt`: übergeben in der Reihenfolge e3, e1, e4, e2 (`Timeline.stories.tsx:13–50`), im DOM stehen die Gruppen „Montag, 31. August 2026" → „Sonntag, 30." → „Samstag, 29." → „Mittwoch, 26." mit den Zeiten 16:02 / 11:12 / 13:05 / 09:40. Gegenprobe `--reihenfolge`: `order="oldest"` dreht die vier Gruppen exakt um | ✓ |
| Kein Ereignistyp lokal definiert; `kind` ist `string` mit Registry-Prop | `kind?: string` (`Timeline.tsx:34`), kein `EventKind` und keine Arten-Liste in der Datei. Die Registry-Prop ist da: `kindLabels?: Record<string, string>` (`:112`), benutzt in `:188`. `--mit-labels` übergibt Schlüssel (`document_received`, `payment_in`, `clarification`, `booking_proposed`) und zeigt „Beleg", „Zahlung", „Rückfrage", „Buchungsvorschlag" — **damit ist der ✗ der Abnahme vom 2026-09-03 behoben** | ✓ |
| Zeiten über `Timestamp`, nicht über eigenes `Intl` | Nicht behoben, nur halb: im DOM stehen jetzt vier `<time dateTime="2026-08-31T14:02:00.000Z" title="Montag, 31. August 2026">16:02</time>` (`--gefuellt`) — aber `Timestamp` (`primitives/Cells.tsx:83`) wird nicht importiert, und `Timeline.tsx:48–70` legt **vier eigene** `Intl.DateTimeFormat` an (`DAY`, `MONTH`, `DATE`, `TIME`). Zwei davon sind wörtliche Dubletten des Hausformatierers: `MONTH` (`:55–59`) = `format.ts:73`, `DATE` (`:60–65`) = `format.ts:68–72`. `src/ui/v3/format.ts:3–13` nennt sich selbst „the one formatter (P24, Aufgaben 0032 und 0033)" und begründet ihn mit „83 `toLocale*`-Aufrufe in 64 Dateien" — genau diese zweite Wahrheit steht hier wieder | ✗ |
| Lückenzeile ab sieben Tagen, mit der Zahl der Tage (`WithGap`) | `--mit-luecke`: zwischen dem 26.08. und dem 05.08. steht `div.v2tl__gap` „20 Tage ohne Ereignis"; Schwelle `GAP_DAYS = 7` (`Timeline.tsx:77`). In `CaseTimeline --edge` greift dieselbe Zeile viermal (21 / 121 / 9 / 12 Tage). Anmerkung: der Kommentar über der Story (`Timeline.stories.tsx:151`) verspricht „21 Tage", gerendert werden 20 — das war schon Offener Punkt (6) der Abnahme vom 2026-09-03 und steht weiter da | ✓ |
| Ohne `onOpen` sind Einträge nicht fokussierbar (`Filled`, Tab-Weg) | `--gefuellt`: `document.querySelectorAll('.v2tl button, .v2tl a, .v2tl [tabindex]').length` = 0; einziges Bedienelement im Strang ist das `summary` der eingeklappten `Disclosure`. Gegenprobe `--interaktiv`: vier `button.v2link`, Tab landet auf dem ersten, Enter meldet „Geöffnet: e4" | ✓ |
| Aufklappen verschiebt keinen anderen Eintrag (`Filled`) | `--gefuellt`, `getBoundingClientRect().top` der vier `.v2tl__item` vor dem Klick auf „Einzelheiten": 51 / 138 / 265 / 352 px, danach 51 / 138 / **319** / **406** px. Die beiden Einträge **unter** dem aufgeklappten rücken 54 px nach unten; die darüber stehen still. Unverändert gegenüber der Abnahme vom 2026-09-03 (Offener Punkt 4) — entweder das Kriterium auf „die Einträge darüber bleiben stehen" schärfen oder die Klappe über den Strang legen | ✗ |
| Ersetzt `CycleTimeline` ohne Funktionsverlust | Betrifft `ludwig/app` (`modules/cycles/ui/CycleTimeline.tsx`); in diesem Repo nicht erfüllbar. Zur Vormerkung steht der Vergleich der Abnahme vom 2026-09-03: `CycleTimeline` ist eine waagerechte Kartenreihe der Buchungsjahre mit `href` je Karte, `Timeline` kennt weder Karten noch `href` — der Umzug ist eine eigene Aufgabe, kein Nachziehen | offen (App) |

**Zusätzlich gesehen, ohne eigenes Kriterium**

- **`WithoutKind` rendert ein leeres `<time>`.** Bei `groupBy="day"` und einem
  Kalendertag als `at` bleibt der Textinhalt der Zeitspalte leer
  (`Timeline.tsx:199`), das Datum steht nur im Gruppenkopf. Das ist richtig so
  (die Uhrzeit wäre erfunden), das leere Element bleibt aber im Baum stehen.
- **Der Strang trägt seinen Ladezustand selbst.** `--laedt` zeigt
  `Skeleton lines={4}` mit `sr-only`-Text „Verlauf wird geladen …" — kein
  Springen, und die Ansage ist da.
- **`InUse` hält L2–L4 ein:** die `Card` hat Rand (`1px rgb(221,226,232)`)
  und **keinen** Schatten (`box-shadow: none`).
- **Offene Punkte (2), (3) und (5) der Abnahme vom 2026-09-03 stehen weiter
  offen:** `gapDays` als Prop gibt es nicht (Offene Frage 2 sagt „ja, mit
  `gapDays` überschreibbar"), und `detail` ist `ReactNode` statt `Markdown`
  (0022) wie unter „Setzt auf" versprochen — Letzteres ist vertretbar (der
  Aufrufer bringt das Rendern mit), gehört aber in die Spec statt in die
  Abnahme.

Abgenommen von / am: **nicht abgenommen**, Claude (Abnahme-Agent), 2026-09-05
· Status zurück auf `in Arbeit`.

**Offene Punkte**

1. **Eigene `Intl`-Formatierer statt des Hausformatierers.** `Timeline.tsx:48–70`
   durch `formatTime`/`Timestamp` aus `src/ui/v3/format.ts` ersetzen; fehlt
   dort ein Format (der lange Gruppenkopf „Montag, 31. August 2026"), gehört
   es dorthin ergänzt, nicht hierher kopiert. `MONTH` und `DATE` sind bereits
   wörtliche Dubletten.
2. **Aufklappen verschiebt die Einträge darunter** (54 px gemessen). Entweder
   lösen oder das Kriterium in der Spec schärfen — so wie es dasteht, ist es
   verletzt.
3. **Story-Gruppe und Barrel-Gruppe widersprechen sich** (`Prozess` im Titel,
   `/* Prüfen */` im Barrel). Eine der beiden Seiten nachziehen.
4. **`icon` und `dim` haben keine eigene Story** in `Timeline.stories.tsx`,
   obwohl beide Props der Erweiterung sind.
5. **Der Kommentar an `WithGap` sagt 21 Tage, gerendert werden 20**
   (`Timeline.stories.tsx:151`) — offen seit dem 2026-09-03.
6. **`gapDays` als Prop fehlt** (Offene Frage 2 hat sie als Default zugesagt).

## Die sechs offenen Punkte — behoben

**1 — eigene `Intl`-Formatierer.** Die vier Formatierer im Kopf der Datei sind
weg; `MONTH` und `DATE` waren wörtliche Dubletten aus `format.ts`. Was dort
fehlte, ist dort ergänzt worden statt hier kopiert:

- `formatTime(x, "date", "long")` schreibt den Tag aus — „Montag, 31. August
  2026", der lange Gruppenkopf.
- `formatTime(x, "time")` gibt die Uhr allein, für die Zeitspalte unter einem
  Gruppenkopf, der den Tag schon nennt.

Der `title` der Zeitspalte kommt jetzt aus `formatTimeFull` — dieselbe
vollständige Form, die jedes `Time` im Set trägt. Nebenbei erbt der Strang
damit die Kalendertag-Regel aus 0040: `toDate` verankert einen Tag auf
12:00 UTC, statt ihn über `new Date(iso)` durch die Zeitzone zu schicken.

Nachgemessen (Story `Filled`): Gruppenköpfe „Montag, 31. August 2026 …",
Zeitspalte „16:02", `title` „Montag, 31. August 2026 um 16:02".

**2 — das Kriterium war so nicht zu halten und ist geschärft.** Ein Text, der
aufklappt, schiebt, was unter ihm steht; alles andere hieße, die Klappe über
den Strang zu legen und den Rest zu verdecken. Gemessen (`Filled`): der
aufgeklappte Eintrag bleibt bei `top` 138 px, die beiden darüber bei 50,5 und
138, die beiden darunter rücken 53,8 px nach. Das Kriterium sagt jetzt genau
das — und bleibt prüfbar.

**3 — Story-Gruppe und Barrel-Gruppe.** Der Barrel führt `Timeline` unter
`/* Prüfen */`, der Story-Titel sagte `Prozess`. Nachgezogen hat die Story:
der Skill nennt den Barrel-Kommentar als Quelle der Gruppe. Neuer Titel
`v3/Patterns/Prüfen/Timeline`.

**4 — `icon` und `dim` haben eine Story.** Eine, nicht zwei: beides sind
Felder des **Eintrags**, nicht Props des Strangs, und der Fall, den man sehen
will, ist der zurückgezogene Eintrag neben dem gültigen — jeder mit dem
Zeichen seiner Art aus der Icon-Registry (0087). `IconsAndDimmed`.

**5 — der Kommentar an `WithGap`** sagte 21 Tage, gezählt werden 20. Gezählt
werden **volle** Tage zwischen zwei Zeitpunkten, nicht Kalendertage; zwischen
dem 5. August 08:00 und dem 26. August 07:40 sind das 20. Der Kommentar sagt
das jetzt und nennt den Unterschied.

**6 — `gapDays` ist eine Prop.** Vorgabe bleibt sieben, wie in der offenen
Frage 2 zugesagt: die Arbeitswoche. Was darunter liegt, ist normaler Betrieb;
was darüber steht, ist eine Aussage. Ein Strang über Jahre setzt sie höher,
einer über einen Tag tiefer.

**Dazu, weil die Datei ohnehin offen war:** die Story-Exportnamen sind
englisch (`Gefuellt` → `Filled`, `Laedt` → `Loading`, `MitLuecke` → `WithGap`
…), wie es `CLAUDE.md` verlangt; die Nachweise in dieser Spec zeigen auf die
neuen Namen.

**Nicht behoben, weil es hier nicht hingehört:** einige Pattern-Stories
tragen `v3/Patterns/Frame/…` statt `Rahmen` (`CommandPalette`,
`HotkeyLegend`, `StepRail`), während `EntityHeader` und `Wizard` `Rahmen`
sagen. Das ist derselbe Widerspruch wie Punkt 3, aber in drei fremden
Aufgaben — Befund, kein Mangel dieser Spec.

## Abnahmekriterien (Nachtrag)

- [ ] Kein `Intl.DateTimeFormat` mehr in `Timeline.tsx` (`grep`)
- [ ] Gruppenkopf, Zeitspalte und `title` kommen aus `format.ts` (Story `Filled`, gemessen)
- [ ] `gapDays` verschiebt die Schwelle, Vorgabe sieben (Story `WithGap`)
- [ ] Story-Titel und Barrel-Kommentar nennen dieselbe Gruppe
- [ ] `icon` und `dim` haben ihre Story (`IconsAndDimmed`)
- [ ] Alle Story-Exportnamen sind englisch (`grep -n "^export const"`)
