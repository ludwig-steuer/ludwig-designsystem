# 0201 · Schnellfilter — benannte Filterstände statt Reiter, die sich überschneiden

| | |
|---|---|
| Status | Abnahme — gebaut 2026-09-24, fremde Abnahme steht aus |
| Stufe | `primitives/` — `FilterBar.tsx` (Prop `presets`, Funktion `matchPreset`); Regeln I3 und I4/F8 in `design-guidelines.md` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: „Offen · Meine · Überfällig" über jeder Vorgangsliste |
| Quelle | ll-dev4, 2026-09-24: Frage „Tabs oder Filter?" und die Liste der Belege-Reiter mit ihren Mengen (App `invoices/domain/invoice.ts:67-89`, `page.tsx:112-178`, `source-doc-queries.ts:551-564`); Owner „durchführen" 2026-09-24 |
| Ersetzt | `invoices/ui/InvoiceListTabsBar.tsx` (Reiter mit Inline-Styles, P8) |
| Blockiert | Umstellung der Belegliste auf `FilteredListTemplate` (ll-dev4) |
| Spec von / am | Claude, 2026-09-24 |

## Ziel

Die Sachbearbeiterin springt mit einem Klick in eine gängige Sicht, etwa „Offen" oder „Buchbar". Danach kann sie weiter eingrenzen, ohne die Sicht zu verlassen. Heute sind diese Sichten Reiter. Weil sich die Reiter überschneiden, lassen sie sich nicht mit den anderen Filtern kombinieren. Außerdem sieht das Wechseln wie ein Ortswechsel aus, obwohl sie nur eine Auswahl trifft.

## Einordnung

- **Die Menge der Belegliste heute** (ll-dev4). Die Achse ist `client_source_docs.status`:

  | Reiter | Menge |
  |---|---|
  | Alle | `≠ deleted`, Jahr bzw. from/to, Formularfilter |
  | Offen | `∉ {deleted, done}`, ohne Zeitraum, älteste zuerst |
  | In Verarbeitung | `∈ {pending, extracting}`, nicht ersetzt, ohne Rechnungszeile/-datum |
  | Problematisch | `∈ {agent_review, human_review, bookable}`, nicht ersetzt, ohne Rechnungszeile/-datum |

  Offen ⊇ In Verarbeitung ∪ Problematisch, und Alle ⊇ alles. Die Reiter sind also nicht MECE. Nach I3 sind das Schnellfilter.
- **„Offen" ist keine eigene Sicht.** Die Sortierung „älteste zuerst" und der weggelassene Zeitraum sind Filterstand, und dieser Stand steht in der URL. Die Spalten „Stapel" und „liegt seit" darf die Liste immer führen. Damit bleibt keine eigene Form, die einen Reiter rechtfertigen würde (I3, geschärft).
- **Wiederverwenden:** `FilterChips` trägt die Schnellfilter unverändert (Label, Zahl je Option, `active`, `onPick` oder `href`). `FilterBar` trägt die Felder, „x von y" und das Zurücksetzen (0200).
- **Erweitert (§3 Regel 2)**, `FilterBar` um eine Prop: `presets`. Das ist eine eigene Zeile über den Feldern. Ohne sie bricht die Chip-Reihe irgendwo zwischen die Felder um.
- **Neu:** `matchPreset(presets, state)` als reine Funktion. Die Frage „welcher Schnellfilter ist gerade an?" hat eine Falle: Listen müssen als Mengen verglichen werden, und leer ist gleich weggelassen. Jede Seite würde sie anders beantworten. Die Funktion läuft auf dem Server und im Client.
- **Kein neuer Baustein `FilterPresets`.** Er wäre ein `FilterChips` mit festem Label gewesen.

## Schnittstelle

| Export | Typ | Bedeutung | Nachweis (Story) |
|---|---|---|---|
| `FilterBar.presets` | `ReactNode` | eigene Zeile über den Feldern, in der Regel `FilterChips label="Schnellfilter"` | `Presets` |
| `FilterPreset<S>` | `{ key; label; filters: Partial<S> }` | ein benannter Filterstand. Was `filters` weglässt, muss leer sein | `Presets` |
| `matchPreset(presets, state)` | `string \| null` | der Schlüssel des Schnellfilters, dessen Stand die Felder **exakt** tragen, sonst `null`. Listen gelten als Mengen, `null`/`""`/`false`/`[]` als leer. Der erste Treffer gilt | `Presets` |
| `FilterValue` | `string \| boolean \| readonly string[] \| null \| undefined` | was ein Filterfeld tragen kann | — |

**Kann nicht (bewusst):**
- Zählen. Den Zähler je Schnellfilter rechnet der Aufrufer mit dem Prädikat der Liste (I12). Die Story zeigt es mit `passes({ ...NO_FILTER, ...preset.filters }, row)`.
- Die URL lesen. Server-Seiten geben den Chips `href` statt `onPick`.
- Spalten oder Sortierung je Schnellfilter umschalten. Die Sortierung ist Filterstand und darf in `filters` stehen. Andere Spalten wären eine Sicht und damit ein Reiter (I3).

## Verhalten

- Ein Klick auf einen Schnellfilter setzt **alle** Felder: die aus `filters` auf ihren Wert, die übrigen auf leer.
- Wer ein Feld von Hand ändert, verlässt den Schnellfilter, und keiner ist mehr markiert. Wer von Hand auf den Stand eines Schnellfilters kommt, sieht ihn wieder markiert.
- „Zurücksetzen" leert alle Felder. Damit ist „Alle" markiert, wenn es einen solchen Schnellfilter mit leerem `filters` gibt.
- **Zustände:** Die Leiste kennt nur „ein Schnellfilter markiert" und „keiner markiert". Leer nach Filter, Laden und Fehler trägt die Liste (0200).

## Stories

`v3/Primitives/Navigation/FilterBar`:

| Story | Beweist |
|---|---|
| `Presets` | die sechs Schnellfilter der Belegliste (Alle · Offen · In Verarbeitung · Problematisch · Offene Klärung · Buchbar) über `MultiSelectFilter` Status + Häkchen „Offene Klärung". Jeder Zähler ist die Liste mit genau diesem Stand. Von Hand „Wird ausgelesen" wegnehmen → kein Schnellfilter markiert; wieder dazunehmen → „In Verarbeitung" markiert |

Eine Story reicht: Die Prop ist ein Slot, und die Funktion hat einen Weg. Die `href`-Form der Chips zeigt `ChipsOrDropdown` schon (0200).

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| eigene Schnellfilter speichern („Meine Ansichten") | eigene Aufgabe, `FilterPreset` bleibt die Form | ein Nutzer setzt täglich denselben Stand von Hand |
| Signal `duplicate_suspected` in „Problematisch" | Feld am Filterstand der App | L-343 umgesetzt |

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

- [ ] Die Schnellfilter stehen auf einer eigenen Zeile über den Feldern (Story `Presets`)
- [ ] Ein Klick setzt die Felder, die Zähler stimmen mit „x von y" überein (Story `Presets`)
- [ ] Nach einer Änderung von Hand ist kein Schnellfilter markiert; mit dem Stand eines Schnellfilters ist er wieder markiert (Story `Presets`)
- [ ] I3 trennt Reiter (MECE oder eigene Form) von Schnellfiltern (Überschneidung); I4 trägt F8
- [ ] L-343 steht im Register `befunde-app.md`

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| … | … | |

Abgenommen von / am: … · Offene Punkte: …

## Bau (2026-09-24)

- `FilterBar.presets` rendert `.v2fbar__presets` (volle Breite, erste Zeile).
- `matchPreset`, `FilterPreset` und `FilterValue` liegen in `FilterBar.tsx` und im Barrel. Selbstprüfung mit fünf Fällen per tsx aus dem Scratchpad; ein Test-Setup gibt es im Repo nicht.
- Nebenbei: `FilterAutoSubmit` (0200) hat `@when`/`@instead` nachbekommen.
