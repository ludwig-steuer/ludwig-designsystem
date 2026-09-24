# 0197 · Wertzellen — Zahl, Datum, Spanne, Hinweis in der Zelle

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-24, fremde Abnahme steht aus |
| Stufe | `primitives/` — Familie `Cells.tsx`, Formatierer in `format.ts`; `hint` auch an `Amount` und `Time` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: Beiträge, Stückzahlen, Stichtage, Warnungen an Werten gibt es überall |
| Quelle | Owner 2026-09-24 über app-b9: „standardisierte Tabellen-Zellen für Zahlen, Beträge, Daten und Warnungen"; Anlass `BankAccountReportView` (Reiter „Reporting" am Bankkonto) und 12 weitere App-Dateien mit lokalen `fmt*`-Helfern |
| Ersetzt | `fmtEUR`, `fmtDay`, `fmtStamp`, `fmtMonth`, `Num`-Wrapper in `apps/web/src/app/(app)/clients/[clientSlug]/[year]/banks/[accountId]/page.tsx`; lokale Formatierer in accounts/page, accounts/[accountNumber], banks/page, BankTransactionDrawer, OpenExportOverview, DatevExportWizard, ContractDetail, kontoauszug-presentation u. a. |
| Blockiert | 0198 (Spaltenfabriken), 0199 (weitere Wertzellen); Umbau der Reporting-Seite (app-b9) |
| Spec von / am | Claude, 2026-09-24 |

## Ziel

Wer die Monatsübersicht eines Bankkontos prüft, liest Zahlen untereinander:
Anzahl, Zufluss, Abfluss, Saldo. Sie sollen überall gleich aussehen, rechts
stehen, und wo etwas nicht stimmt („Saldensprung") steht ein Zeichen neben
dem Wert, das auf Zeigen oder Fokus sagt, was los ist. Heute baut jede Seite
ihre Formatierer selbst, und eine Anzahl erscheint als „3.400,00".

## Einordnung

- **Wiederverwenden:** `AmountCell`, `Timestamp`, `MonoCell`, `DeviationCell`
  (`Cells.tsx`), `formatAmount`/`formatCount`/`formatTime`/`formatTimeRange`
  (`format.ts`), `Amount`, `Time`, `DateRange`, `Tooltip`.
- **Erweitert (Regel 2), nicht neu:**
  - `Timestamp` um `format` und `length`. Eine Datumszelle neben `Timestamp`
    wäre dieselbe Zelle zweimal.
  - `AmountCell` um `signed` und eine enge `currency`.
  - `formatCount` und die neue Zählzelle um `unit`.
- **Neu (Regel 3):**
  - `CountCell`: `AmountCell` mit `currency: null` zeigt zwei Nachkommastellen,
    für eine Anzahl ist das falsch. Zwei Verwendungen gibt es heute schon
    (Reporting, Pager).
  - `DateRangeCell`: `DateRange` ist die Form außerhalb von Tabellen, ohne die
    Geometrie einer Zelle.
- **`hint`:** Eine gemeinsame Prop an allen Wertzellen und an `Amount`/`Time`,
  gezeichnet von **einem** internen Baustein (`ValueHint`). Die Stufen-Icons
  wandern nach `Icons.tsx` (`LEVEL_ICON`), weil Primitives `StateIcon` aus
  `patterns/Review.tsx` nicht importieren dürfen. `StateIcon` liest danach
  dieselbe Tabelle.
- **A7/A9:** `CellTone "warning-strong"` wird zu einem `@deprecated`-Alias,
  der wie `warning` aussieht. Der Token `--color-warning-strong` entfällt. Die
  Quelle des Werts liegt in der App: `deviationTone()` in
  `batch-review/domain/comparison.ts`. Das ist ein Befund.
- **Zuschnitt:** alles in der Familie `Cells.tsx`, die Formatierer in
  `format.ts`. Die Zellen teilen sich Geometrie (`v2num`, Strich für `null`)
  und `hint` (§4 Familie).

## Schnittstelle

`CellHint = { level: "error" | "warning" | "info" | "debug"; text: string }`
— exportiert aus `Cells.tsx`.

| Export / Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `CountCell.value` | `number \| null` | ja | ganze Zahl über `formatCount`, rechts, `tnum`; `null` → „—" | `Counts` |
| `CountCell.unit` | `readonly [one, other]` | nein | „1 Seite" / „3 Seiten"; `0` ist Plural | `Counts` |
| `formatCount(value, unit?)` | — | — | dieselbe Form als Text | `Counts` |
| `Timestamp.format` | `"date" \| "dateTime" \| "month"` | nein | Vorgabe `dateTime`, bestehende Aufrufer bleiben unverändert | `Dates` |
| `Timestamp.length` | `TimeLength` | nein | Vorgabe `short` | `Dates` |
| `DateRangeCell.from` / `to` | `string \| Date \| null` | ja | `formatTimeRange`; `title` = die volle Form beider Enden; beide `null` → „—" | `Dates` |
| `DateRangeCell.format` | `TimeRangeFormat` | nein | Vorgabe `date` | `Dates` |
| `AmountCell.currency` | `Currency \| null` | nein | **eng**, bisher `string \| null`; Vorgabe `EUR`; `null` = Dezimalzahl ohne Währung | `Currencies` |
| `AmountCell.signed` | `boolean` | nein | `+` vor positiven Werten, ohne Farbe | `Currencies` |
| `…Cell.hint`, `Amount.hint`, `Time.hint` | `CellHint` | nein | Icon neben dem Wert, Text im `Tooltip` | `Hints`, `OutsideCells` |
| `CellTone "warning-strong"` | — | — | `@deprecated`, sieht aus wie `warning` | `Hints` |

**Kann nicht (bewusst):**
- Den Wert nach `hint` einfärben. Die Farbe trägt nur das Icon, der Wert
  bekommt Farbe nur über `tone`, und das Vorzeichen bleibt ohne Farbe
  (F123 §4/4).
- Mehrere Hinweise an einem Wert zeigen. Einer mit der höchsten Stufe
  genügt, den Rest sagt der Text.
- Relative Zeit in der Zelle (T7).

## Verhalten

- **Server-Components**, bis auf den Tooltip. `Tooltip` ist Client und wird
  wie gewohnt als Insel eingebettet.
- **Hinweis:**
  - Das Icon steht auf der Seite **gegenüber** der Ausrichtungskante: bei
    Zahlen links, bei Daten rechts. So bleibt die Einer-Kante einer
    Zahlenspalte und die linke Kante einer Datumsspalte gleich.
  - Das Icon ist 14 px groß, in der Farbe der Stufe, und ist ein `<button
    type="button">` ohne Rahmen. Sein Name ist das Wort der Stufe
    („Warnung"), der Text hängt per `aria-describedby` daran (Tooltip auf
    Hover und Fokus, V11).
  - Warum kein `title`: Es ist weder über die Tastatur noch per Touch
    erreichbar.
- **Icons je Stufe** (mit `StateIcon` geteilt):

  | Stufe | Icon | Farbe |
  |---|---|---|
  | error | `XCircle` | `--color-danger` |
  | warning | `AlertTriangle` | `--color-warning` |
  | info | `Info` | `--color-accent-700` |
  | debug | `Info` | `--color-text-subtle` |

- `title` bleibt der vollen Form eines Werts vorbehalten (ein Datum,
  ungekürzt).
- **Zustände:**
  - gefüllt · leer (`null` → „—", in der Geometrie der Spalte) · Rand (0,
    negativ, 1.234.567, lange Einheit).
  - **Lädt** fällt weg, das trägt `TableLoading`.
  - **Fehler** fällt weg, das trägt `ErrorRow`.
  - **Leer nach Filter** gibt es bei einer Zelle nicht.

## Stories

Titel `v3/Primitives/Tabelle/Zellen` (bestehend). Die Ableitung ergibt sechs
neue Stories. Die Zahl steigt damit auf über zehn Stories. Die Datei führt
aber schon heute jede Zelle als eigene Achse, und keine neue Story mischt
zwei Zellen.

| Story | Beweist |
|---|---|
| `Counts` | 0, 1, 3.400, 1.234.567, `null`; mit `unit` „1 Seite", „3 Seiten", „0 Seiten" |
| `Dates` | `Timestamp` mit `date`, `dateTime`, `month`; `DateRangeCell` innerhalb eines Monats, über den Jahreswechsel, ein Ende `null`, beide `null` |
| `Currencies` | EUR, USD, CHF, GBP untereinander in einer Spalte, `signed`, `null` |
| `Hints` | alle vier Stufen an Betrag, Zahl, Datum und Spanne; der Alias `warning-strong` neben `warning` |
| `OutsideCells` | `Amount` und `Time` mit `hint` in einer Kopfzeile („Anfangssaldo 1.249,90 €" mit Warnung) |
| `InUse` | Monatsübersicht klein (Monat · Anzahl · Zufluss · Abfluss · Saldo) mit `null`-Endsaldo und „Saldensprung" |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Hinweis mit Weg („Zur Klärung →") | `hint.href?` | eine Seite will vom Zeichen direkt in die Klärung |
| mehrere Hinweise je Wert | `hint: CellHint[]` | ein Wert trägt zwei Befunde verschiedener Stufe |

## Befunde an die App (`docs/befunde-app.md`)

- `deviationTone()` (`batch-review/domain/comparison.ts:142`) liefert
  `warning-strong`. Gemäß A7/A9 soll sie auf die vier Stufen gehen. Das DS
  hält einen Alias, bis die App umgestellt hat.
- `AmountCell.currency` ist jetzt `Currency | null`. App-Aufrufer, die einen
  `string` übergeben, verengen ihn mit `asCurrency` (Owner-Entscheid über
  app-b9: bewusst ohne Übergangs-Alias). Die Liste führt der Bau-Nachtrag.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel:

- [ ] `CountCell` ohne Nachkommastellen, rechtsbündig, `null` → „—" (Story `Counts`)
- [ ] `unit` wählt Singular nur bei 1 (Story `Counts`)
- [ ] `Timestamp` ohne `format` rendert wie vorher (bestehende Stories unverändert)
- [ ] `DateRangeCell` faltet den gemeinsamen Teil, `title` trägt beide vollen Enden (Story `Dates`)
- [ ] `AmountCell.currency` nimmt nur `Currency | null`; vier Währungen stehen auf einer Einer-Kante (Story `Currencies`)
- [ ] `hint`: Icon je Stufe mit der Farbe der Tabelle oben, Wert ungefärbt, Tooltip auf Hover **und** Fokus, Name = Stufenwort (Story `Hints`)
- [ ] Zahl mit und ohne `hint` steht in derselben Spalte auf derselben rechten Kante (Story `InUse`)
- [ ] `warning-strong` sieht aus wie `warning`, der Token ist weg (Story `Hints`)
- [ ] `Amount.hint` und `Time.hint` zeigen dasselbe Zeichen (Story `OutsideCells`)
- [ ] `StateIcon` liest seine Icons für warning/error/info aus derselben Tabelle

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Bau (2026-09-24)

- **Exporte neu:** `CountCell`, `DateRangeCell`, `ValueHint` (mit eigenem
  `@when`: das Zeichen, das `hint` zeichnet), `CellHint`; `LEVEL_ICON` und
  `HintLevel` in `Icons.tsx`; `formatCount(value, unit?)`.
- **Erweitert:** `Timestamp.format/length/hint`, `AmountCell.currency`
  (`Currency | null`), `signed`, `hint`; `Amount.hint`, `Time.hint`.
- **Seite des Zeichens** statt „immer links": gegenüber der Ausrichtungskante
  (Zahlen links, Daten rechts), siehe Verhalten.
- **Debug-Zeichen** heißt „Debug" (Name für Vorleser), Icon `Info` gedämpft.
- `StateIcon` liest warning/error/info aus `LEVEL_ICON`; die Icons sind
  dieselben Lucide-Formen wie vorher (`TriangleAlert` = `AlertTriangle`,
  `CircleX` = `XCircle`).
- `--color-warning-strong` aus `tokens.css` entfernt; `.v2num--warning-strong`
  zeigt `--color-warning`.
- Im DS brach nur ein Aufrufer an der engen Währung (`DataTable.stories.tsx`,
  jetzt `asCurrency`). App-Aufrufer: Befund **L-342**; `deviationTone()`:
  Befund **L-341**.

Selbst angesehen (nicht die Abnahme): alle 14 Zell-Stories bei 1100 px, keine
Konsolenfehler; in `InUse` steht der Endsaldo mit und ohne Zeichen auf
derselben rechten Kante (817 / 817 / 817 px); Tab auf das Zeichen → Name
„Warnung", Tooltip offen.
