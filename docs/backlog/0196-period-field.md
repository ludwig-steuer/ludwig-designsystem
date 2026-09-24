# 0196 · PeriodField — Monat, Monatszeitraum, Quartal, Wirtschaftsjahr als Filter

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-24, fremde Abnahme steht aus |
| Stufe | `primitives/` (Gruppe Formular) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Beitragsmonat, Schadenquartal, Geschäftsjahr als Filter über einer Liste. „Wirtschaftsjahr" ist das Label, der Code sagt `fiscalYear` (GLOSSARY „Fiscal year") und bekommt die Jahre vom Aufrufer |
| Quelle | Owner 2026-09-24: „Datum/Uhrzeit, aber auch Zeitraum (von–bis), jeweils auch nur Monatsperioden oder Monate einzeln" · Nachsatz: „hauptsächlich Filter; Uhrzeit brauchen wir eigentlich nie zum Eintragen, wenn dann zum Lesen" · „Quartal und WJ brauchen wir sicher später, gerne schon mitdesignen" |
| Ersetzt | nichts Bestimmtes — heute filtert man Monate über `DateRangeField` mit Tagen und tippt den 01. und den 31. von Hand |
| Blockiert | nichts |
| Spec von / am | Claude, 2026-09-24 |

## Ziel

Wer die Belege vom März sehen will, klickt über der Liste auf „Zeitraum",
sieht das Jahr mit zwölf Monaten und klickt „Mär". Wer das erste Halbjahr
will, klickt „Jan" und dann „Jun". Wer Q3 oder das Wirtschaftsjahr 2025/26
will, wählt oben die Einheit und klickt einmal. Heute tippt man zwei
Tagesdaten in `DateRangeField`, und ob der 30. oder der 31. das Monatsende
ist, bleibt der Hand überlassen.

## Einordnung

- **Wiederverwenden:**
  - `DateRangeField` (`@when` ein Zeitraum im Filter) arbeitet mit Tagen und
    dem nativen Kalender. Monate kennt es nicht, und
    `<input type="month">` zeigt in Firefox und in Safari auf dem Desktop
    nur ein Textfeld. Es bleibt das Feld für Zeiträume auf den Tag genau.
  - `PeriodJump` springt zu einem Monat und ist Navigation, keine Eingabe.
  - `PeriodGrid` zeigt, welche Monate abgedeckt sind. Seine Optik (Monate
    in Spalten, 64 px) ist die Vorlage für das Raster.
  - `Segmented` wechselt die Einheit.
- **Uhrzeit:** Nichts zu bauen. Lesen decken schon ab:
  - `Time` mit `format="dateTime"`/`"time"`
  - `DateRange` mit `format="dateTime"` (`26.08.2026, 09:12–17:30`)
  - `formatTime`/`formatTimeRange`

  Eine Uhrzeit **eingeben** gibt es laut Owner nicht, `DateField` bleibt
  ohne Uhrzeit.
- **Neu, weil:** Regel 3 (neue Primitive). Kein `@when` passt, kein
  Fachwort (das Label kommt vom Aufrufer, der Code sagt `fiscalYear`), eine
  Vorlage (Owner-Anfrage), und ein Raster mit Bereichsauswahl über
  Jahresgrenzen und Tastaturweg passt nicht in 15 Zeilen.
- **Zuschnitt:** Familie in `PeriodField.tsx` mit zwei Exporten:
  - `PeriodField` ist Auslöser plus Popover für die FilterBar.
  - `PeriodPanel` ist die Einheit samt Raster, ohne Hülle. Es wird
    allein gebraucht, inline in einem Bericht oder in den Stories, um alle
    Einheiten offen nebeneinander zu zeigen (§4 trennen: ein Teil wird
    allein gebraucht).

  Beide teilen den Werttyp und die Rechnung (`periodOf`, siehe unten).
- **Setzt auf:** `Popover`, `Segmented`, `TextButton`, `formatTimeRange`
  (`"month"`), `DatePreset` aus `DateField.tsx`.

## Wert

Eine Periode ist ein **Zeitraum auf den Tag**: `from` und `to` als ISO-Datum,
genau wie bei `DateRangeField`. Die Liste dahinter filtert ohnehin nach
Datum, und so kann die Seite von einem Feld zum anderen wechseln, ohne ihre
Abfrage zu ändern. Die Einheit wird nicht gespeichert, sondern aus dem
Zeitraum gelesen (`periodOf(from, to, fiscalYears)`):

| Zeitraum | Einheit | Auslöser zeigt |
|---|---|---|
| 01.–31.03.2026 | Monat | „März 2026" |
| 01.11.2025–28.02.2026 | Monate | „Nov. 2025 – Feb. 2026" |
| 01.07.–30.09.2026 | Quartal | „Q3 2026" |
| gleich einem Eintrag aus `fiscalYears` | Wirtschaftsjahr | „WJ 2025/26" (abweichend) · „WJ 2026" (kalendergleich) |
| nicht auf Monatsgrenzen (aus der URL) | — | `formatTimeRange` in Tagen; im Raster ist nichts markiert |
| leer | — | „Alle Zeiträume" |

Vorrang bei Mehrdeutigkeit: WJ vor Quartal vor Monate. Ein kalendergleiches WJ
2026 ist auch Jan.–Dez. 2026 und heißt dann „WJ 2026".

## Schnittstelle

`PeriodField`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `from` | `string \| null` | ja | erster Tag, ISO | `Filled`, `Empty` |
| `to` | `string \| null` | ja | letzter Tag, ISO | `Filled` |
| `onChange` | `(from: string \| null, to: string \| null) => void` | nein | immer beide, wie `DateRangeField`; Monatsende rechnet der Baustein | `Interactive` |
| `units` | `readonly PeriodUnit[]` | nein | welche Einheiten oben stehen; `PeriodUnit = "month" \| "months" \| "quarter" \| "fiscalYear"`; Vorgabe `["month", "months"]`; nur eine → kein `Segmented` | `Units` |
| `fiscalYears` | `readonly { year: number; startDate: string; endDate: string }[]` | nein | die Wirtschaftsjahre des Mandanten, `Pick<FiscalYearListItem, …>` aus `src/ludwig/modules/cycles/domain/cycle.ts`; nötig für `"fiscalYear"`, sonst fällt die Einheit weg | `FiscalYears` |
| `min` / `max` | `string` (`YYYY-MM`) | nein | Monate außerhalb sind gesperrt, das Jahr blättert nicht darüber hinaus | `Bounds` |
| `presets` | `DatePreset[]` | nein | Schnellwahl unter dem Raster („Vormonat", „Laufendes WJ"), derselbe Typ wie bei `DateRangeField` | `Presets` |
| `name` | `string` | nein | Server-Formular: zwei versteckte Felder `${name}From` und `${name}To` | `InUse` |
| `label` | `string` | nein | Wort auf dem Auslöser, Vorgabe „Zeitraum" | `Filled` |
| `disabled` | `boolean` | nein | gesperrt | `Empty` |

`PeriodPanel` nimmt dieselben Props außer `label`, `name`, `disabled` und
hat keinen Auslöser.

**Kann nicht (bewusst):**

- Tage wählen. Dafür gibt es `DateRangeField`, und das `@instead` nennt es.
- Wochen oder Halbjahre wählen (siehe Ausbau).
- Eine Uhrzeit eingeben.
- Quartale im Wirtschaftsjahr. Quartale sind Kalenderquartale, so wie in
  der Umsatzsteuer-Voranmeldung.
- Selbst zählen, wie viele Einträge ein Monat hat (siehe Ausbau).

## Verhalten

- **Client-Component** (Popover, Anker der Bereichsauswahl).
- **Auslöser:** Knopf im Aussehen eines Feldes mit „Zeitraum: März 2026" und
  einem Chevron. Ist etwas gewählt, bekommt er den `primary`-Rand wie
  `MultiSelectFilter`.
- **Kopf des Panels:**
  - `Segmented` mit den Einheiten „Monat · Zeitraum · Quartal ·
    Wirtschaftsjahr"
  - darunter die Jahreszeile „‹ 2026 ›"
- **Monat:**
  - Raster 4 × 3 mit den Kürzeln „Jan … Dez".
  - Ein Klick wählt den Monat und schließt die Liste.
  - Der aktuelle Monat hat einen feinen Rahmen, der gewählte `primary`.
- **Zeitraum (Monate):**
  - Der erste Klick setzt den Anker, der zweite das Ende. Rückwärts
    geklickt wird getauscht.
  - Zwischen den beiden Klicks zeigt Hover die Spanne als Vorschau.
  - Der Anker bleibt beim Blättern ins nächste Jahr erhalten, damit
    Nov.–Feb. geht.
  - Nach dem zweiten Klick schließt die Liste.
  - Esc nach dem ersten Klick verwirft den Anker.
- **Quartal:** 4 Kacheln „Q1 Jan–Mär" … im gewählten Jahr. Ein Klick wählt
  das Quartal und schließt die Liste.
- **Wirtschaftsjahr:**
  - Die Liste aus `fiscalYears` steht mit dem neuesten Jahr oben.
  - Jede Zeile zeigt „WJ 2025/26" und darunter `DateRange` („01.07.2025 –
    30.06.2026").
  - Die Jahreszeile entfällt.
- **Fuß:** Unter dem Raster stehen die Schnellwahlen (`presets`) und
  „Alle Zeiträume", das den Wert leert.
- **Tastatur:**
  - Das Raster ist ein `role="grid"` mit Roving Tabindex.
  - Die Pfeiltasten gehen zwischen den Monaten, Bild↑/Bild↓ blättern das
    Jahr, Enter wählt.
  - Esc schließt die Liste und gibt den Fokus an den Auslöser zurück.
  - Monatszellen haben den vollen Namen als `aria-label` („März 2026") und
    `aria-selected`.
- **Zustände:** gefüllt · leer („Alle Zeiträume") · Wert nicht auf
  Monatsgrenzen (Rand) · gesperrte Monate (`min`/`max`).
  - **Leer nach Filter** fällt weg, weil es keine Suche gibt.
  - **Lädt** fällt weg, weil `fiscalYears` mit der Seite kommt.
  - **Fehler** fällt weg, weil ein ungültiger Zeitraum nicht entstehen
    kann. Rückwärts wird getauscht, außerhalb von `min`/`max` ist gesperrt.

## Stories

Titel `v3/Primitives/Formular/PeriodField`.

| Story | Beweist |
|---|---|
| `Filled` | März 2026 gewählt, Liste offen, Einheit Monat |
| `Empty` | „Alle Zeiträume"; daneben `disabled` |
| `Units` | vier `PeriodPanel` nebeneinander, je eine Einheit mit Wert |
| `MonthRange` | Nov. 2025 – Feb. 2026 über die Jahresgrenze, Hover-Vorschau |
| `FiscalYears` | abweichendes WJ (Jul–Jun) und kalendergleiches WJ, Anzeige „WJ 2025/26" vs. „WJ 2026"; Vorrang WJ vor Monate |
| `Bounds` | `min` 2024-07, `max` 2026-09: gesperrte Monate, Jahr blättert nicht weiter |
| `Presets` | Schnellwahl „Vormonat", „Laufendes Quartal", „Laufendes WJ" |
| `Interactive` | Rundlauf mit `useState`, `from`/`to` darunter; Monatsende 28./29./30./31. stimmt (Feb. 2028) |
| `InUse` | FilterBar mit `PeriodField` und `MultiSelectFilter` über einer `DataTable`, als Server-Formular (`name`) |
| `Edge` | Wert 03.03.–17.04.2026 aus der URL → Tagesanzeige, Raster ohne Markierung |

Das sind zehn Stories, genau die Obergrenze. Die Enum-Prop `units` ist mit
`Units` abgedeckt, und zwar in einer Story mit allen Werten nebeneinander.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Anzahl je Monat im Raster (wie in `PeriodJump`) | `counts?: readonly PeriodCount[]` | ein Filter soll zeigen, wo überhaupt Einträge sind |
| Status je WJ (offen/geschlossen) in der WJ-Liste | `fiscalYears[].status` über die Registry | ein Screen filtert gezielt offene Jahre |
| Halbjahr, Woche | `PeriodUnit` erweitern | eine Auswertung fragt danach |
| Quartale im Wirtschaftsjahr | `quarterBasis?: "calendar" \| "fiscalYear"` | ein Mandant mit abweichendem WJ will sein Q1 = Jul–Sep |

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

- [ ] `onChange` liefert immer erster Tag / letzter Tag des Monats, auch Februar im Schaltjahr (Story `Interactive`)
- [ ] Auslöser-Text je Einheit wie in der Tabelle „Wert" (Stories `Units`, `FiscalYears`, `Edge`)
- [ ] Bereichsauswahl über die Jahresgrenze; rückwärts geklickt wird getauscht; Esc verwirft den Anker (Story `MonthRange`)
- [ ] `units` mit nur einem Wert zeigt kein `Segmented` (Story `Filled` mit `units={["month"]}` oder `Units`)
- [ ] `"fiscalYear"` ohne `fiscalYears` fällt weg, kein leerer Reiter (Story `Units`)
- [ ] `min`/`max` sperren Monate und das Blättern (Story `Bounds`)
- [ ] Tastatur: Pfeile im Raster, Bild↑/↓ blättert das Jahr, Enter wählt, Esc zurück zum Auslöser (Story `Filled`)
- [ ] `name` erzeugt `?periodFrom=…&periodTo=…` beim Absenden (Story `InUse`)
- [ ] Tut bewusst nicht: Tage, Uhrzeit, WJ-Quartale — `@instead` nennt `DateRangeField`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Offene Fragen

1. **Alle vier Einheiten gleich bauen oder Quartal und WJ später?** Ohne
   Antwort: alle vier gleich. Quartal sind vier Kacheln, WJ ist eine Liste,
   und das Design steht ohnehin. Die Vorgabe `units` bleibt trotzdem
   `["month", "months"]`, bis ein Screen mehr verlangt.
2. **Wie heißt die Einheit „Zeitraum"?** Ohne Antwort: „Zeitraum" im
   `Segmented`, weil „Monate" neben „Monat" zu leicht zu verwechseln ist.

## Bau (2026-09-24) — Abweichungen von der Spec

- **Umschalter sagt „WJ", nicht „Wirtschaftsjahr".** Mit vier Einheiten passt
  das ganze Wort nicht in das Panel (gemessen: der Reiter lief aus dem Rand);
  „WJ" steht ohnehin auf dem Auslöser („WJ 2025/26"). Offene Frage 2 blieb beim
  Default: „Zeitraum".
- **Monatsnamen auf dem Auslöser lang:** „November 2025 – Februar 2026",
  „Januar–Juni 2026" — so, wie `formatTimeRange(…, "month")` für `DateRange`
  schon spricht; die Tabelle „Wert" oben nannte Kurzformen.
- **Exporte:** `PeriodField`, `PeriodPanel`, `periodOf` (mit eigenem
  `@when`: den gefilterten Zeitraum außerhalb des Feldes nennen),
  `PeriodUnit`, `FiscalYearSpan` (= `Pick<FiscalYearListItem, "year" |
  "startDate" | "endDate">`).
- **Auslöser** ist derselbe wie bei `MultiSelectFilter` (`.v3msel__trigger`) —
  eine Optik für jeden Filter, der in einen Knopf gefaltet ist.
- Esc wirkt in zwei Stufen: mit gesetztem Anker verwirft es den Anker, sonst
  schließt es und gibt den Fokus an den Auslöser.
- `InUse` mit `Card`/`Table` statt `DataTable` (Primitive-Story importiert kein
  Pattern).

Selbst angesehen (nicht die Abnahme): alle zehn Stories bei 1400 px, keine
Konsolenfehler; Öffnen fokussiert den gewählten Monat, → ↓ gehen um 1 / 4,
Bild↓ blättert das Jahr bei gehaltener Spalte, Enter wählt und schließt;
Februar 2028 endet am 29.
