# 0023 · Timeline — was wann mit diesem Vorgang geschah

| | |
|---|---|
| Status | spec |
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

- [ ] Unsortierte `entries` erscheinen sortiert (`Gefuellt`)
- [ ] Kein Ereignistyp lokal definiert; `kind` ist `string` mit Registry-Prop (`grep`)
- [ ] Zeiten über `Timestamp`, nicht über eigenes `Intl` (`grep`)
- [ ] Lückenzeile ab sieben Tagen, mit der Zahl der Tage (`MitLuecke`)
- [ ] Ohne `onOpen` sind Einträge nicht fokussierbar (`Gefuellt`, Tab-Weg)
- [ ] Aufklappen verschiebt keinen anderen Eintrag (`Gefuellt`)
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

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
