# 0198 · Wertspalten — Spaltenfabriken für `DataTable`

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-24, fremde Abnahme steht aus |
| Stufe | `patterns/` — Familie `DataTable.tsx` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: jede Liste mit Beträgen, Zahlen und Daten |
| Quelle | Owner 2026-09-24 über app-b9, Punkt 5: „Ausrichtung durch die Zelle, nicht durch den Aufrufer"; app-b9 stimmt Fabriken statt `ColumnDef.kind` zu |
| Ersetzt | `align: "end"` plus Zelle von Hand an jeder Zahlenspalte; Reiter „Reporting" am Bankkonto (`BankAccountReportView`, zwei `DataTable`s) |
| Blockiert | Umbau der Reporting-Seite (app-b9) |
| Spec von / am | Claude, 2026-09-24 |

## Ziel

Eine Betragsspalte wird mit einer Zeile beschrieben, und Kopf und Zelle
stehen danach von selbst rechts, in der Zelle der Familie aus 0197/0199.
Heute muss jede Spalte `align: "end"` setzen. Fehlt es, stehen Kopf und
Wert auseinander, und das passiert.

## Einordnung

- **Wiederverwenden:** `ColumnDef` (`align`, `width`, `sortable`,
  `headerAside`); die Zellen `AmountCell`, `CountCell`, `PercentCell`,
  `Timestamp`, `DateRangeCell` (0197, 0199).
- **Erweitert (Regel 2)** um reine Funktionen, die ein `ColumnDef` bauen:
  `amountColumn`, `countColumn`, `percentColumn`, `dateColumn`,
  `dateRangeColumn`. Kein neues Feld `kind`: Mit einem `kind: "amount"`
  könnte in `cell` trotzdem ein Datum stehen. Bei einer Fabrik können
  Zelltyp und Ausrichtung nicht auseinanderlaufen. `align` und die freie
  `cell` bleiben für eigene Spalten.
- **Zuschnitt:** in der Familie `DataTable.tsx`, weil sie `ColumnDef` bauen.
- **Regel:** `design-guidelines.md` T7 bekommt den Satz „Zahl, Betrag,
  Datum in einer Tabellenzelle: nur über die Wertzellen (0197/0199) bzw.
  ihre Spaltenfabriken, nie `toLocale*` oder lokale Helfer".

## Schnittstelle

Gemeinsam: `{ key; header; headerAside?; width?; sortable? }` wie `ColumnDef`,
dazu je Fabrik:

| Fabrik | eigene Felder | Ausrichtung · Zelle | Nachweis |
|---|---|---|---|
| `amountColumn<T>` | `value: (r) => number \| null`, `currency?: Currency \| null \| ((r) => Currency \| null)` (Vorgabe EUR), `signed?`, `tone?: (r) => CellTone`, `hint?: (r) => CellHint \| undefined` | end · `AmountCell` | `ReportMonths` |
| `countColumn<T>` | `value`, `unit?`, `hint?` | end · `CountCell` | `ReportMonths` |
| `percentColumn<T>` | `value`, `digits?`, `hint?` | end · `PercentCell` | `ReportImports` |
| `dateColumn<T>` | `value: (r) => string \| Date \| null`, `format?`, `length?`, `hint?` | start · `Timestamp` | beide |
| `dateRangeColumn<T>` | `from`, `to`, `format?`, `hint?` | start · `DateRangeCell` | `ReportImports` |

Vorgabe-Breiten: Betrag `140px`, Anzahl und Prozent `100px`, Datum `120px`
(`dateTime` `140px`, `month` `130px`), Spanne `minmax(160px, 1fr)`. Jede lässt
sich über `width` übersteuern.

**Kann nicht (bewusst):** sortieren (die Seite sortiert, `sortable` gibt nur
den Kopf-Link) · Summen-Fußzeile (Ausbau) · Spalten für Ja/Nein und IBAN —
die sind linksbündig mit einer Zelle ohne Parameter; `cell: (r) =>
<BooleanCell value={…} />` ist dort eine Zeile und kann nicht falsch
ausgerichtet sein.

## Verhalten

Reine Funktionen, Server-tauglich. Die Zelle wird aus der Fabrik gerendert,
`align` gesetzt. Zustände trägt `DataTable` (leer, leer nach Filter, lädt,
Fehler); die Fabriken fügen keinen hinzu.

## Stories

Titel `v3/Patterns/Arbeitsfläche/DataTable` (bestehend), zwei neue:

| Story | Beweist |
|---|---|
| `ReportMonths` | Monatsübersicht: Monat · Umsätze · Zufluss · Abfluss · Saldo · Endsaldo; Juni ohne Anfangssaldo → Endsaldo „—" mit Debug-Hinweis; August mit Warnung „Saldensprung" |
| `ReportImports` | Importliste: Zeitstempel · Zeitspanne · Umsätze · Anteil zugeordnet (%) · Anfangssaldo · Endsaldo · Link auf den Auszug |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Summenzeile unter Betragsspalten | `DataTable.footer?` mit `amountColumn(...).total` | eine Liste will „Summe" unten |

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

- [ ] Kopf und Werte jeder Fabrik-Spalte stehen auf derselben rechten (bzw. linken) Kante, ohne dass der Aufrufer `align` setzt (Stories `ReportMonths`, `ReportImports`)
- [ ] `hint` je Zeile erscheint nur in der Zeile, die ihn trägt (Story `ReportMonths`)
- [ ] `currency` als Wert und als Funktion (Story `ReportImports`: USD-Konto)
- [ ] `design-guidelines.md` T7 nennt die Familie als einzigen Weg

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Bau (2026-09-24)

Fünf Fabriken in `DataTable.tsx`, exportiert über den Barrel; T7 in
`design-guidelines.md` nachgezogen. Die Stories `ReportMonths` (erste Spalte
mit `width: "1fr"`, sonst die Vorgabe-Breiten) und `ReportImports` (eine
USD-Zeile über `currency: (r) => r.currency`, `rowHref`).

Selbst angesehen (nicht die Abnahme): bei 1300 px je Spalte Kopf und alle
Werte auf derselben Kante — Monate: Zahlen rechts 275/425/575/725/875 px für
Kopf und vier Zeilen; Importe: 855/965/1115/1265 px; Datumsspalten links.
Keine Konsolenfehler.
