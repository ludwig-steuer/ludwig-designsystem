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
| `entries` | `TimelineItem[]` | ja | **Ungesortiert übergeben** — die Komponente sortiert nach `at` | `Gefuellt` |
| `order` | `"newest" \| "oldest"` | nein | Default `newest`. Am Sachverhalt zählt das Letzte, im Audit der Anfang | `Reihenfolge` |
| `groupBy` | `"day" \| "month" \| "none"` | nein | Default `day`. Gruppenkopf trägt das Datum, die Einträge nur die Uhrzeit | `Gruppierung` |
| `emptyText` | `string` | nein | Default „Noch nichts geschehen." | `Leer` |
| `loading` | `boolean` | nein | — | `Laedt` |
| `onOpen` | `(id: string) => void` | nein | Sprung zum Ereignis; ohne den Callback ist der Eintrag nicht klickbar | `Interaktiv` |

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
- `detail` ist eingeklappt; Aufklappen ändert die Höhe, nicht die Position der
  übrigen Einträge.
- Zustände: gefüllt · leer · lädt. Kein „leer nach Filter" — die Komponente
  filtert nicht.
- Tastatur: die Einträge sind nur mit `onOpen` fokussierbar; sonst ist der
  Verlauf Text, kein Bedienelement.
- Client-Component (Aufklappen).

## Stories

Nach §6: 3 Zustände + 2 Enums + 1 Callback + 1 „im Einsatz" + 1 Rand = 8.

| Story | Beweist |
|---|---|
| `Gefuellt` | ein Sachverhalt über drei Wochen, alle Ereignisarten, unsortiert übergeben |
| `Leer` | „Noch nichts geschehen." |
| `Laedt` | `loading` |
| `Reihenfolge` | `newest` und `oldest` nebeneinander |
| `Gruppierung` | `day`, `month`, `none` |
| `Interaktiv` | `onOpen`, Rundlauf mit `useState`; ohne den Callback nicht klickbar |
| `MitLuecke` | 14 Tage ohne Ereignis, die Lückenzeile |
| `ImEinsatz` | im Sachverhalts-Detail unter der `FieldList` |

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

## Abnahme

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
Aufrufer bringt das Rendern mit. (6) Der Kommentar an der Story `MitLuecke`
spricht von 21 Tagen, gerendert werden 20.
