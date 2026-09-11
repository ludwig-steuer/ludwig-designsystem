# 0162 · Zeiträume mit Lücken (`PeriodGrid`)

| | |
|---|---|
| Status | spec |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: welcher Monat ist abgedeckt, welcher offen, wo klafft eine Lücke — das fragt jede Anwendung mit Perioden (Beitragsmonate, Meldezeiträume) |
| Quelle | UI-Kit-Roadmap `docs/backlog/uikit-entity-roadmap-2026-09.md` (ludwig/app 9be34746), Abschnitt B, **B2** „PeriodGrid / SpanTimeline"; Reihenfolge laut Übergabe: B2 vor Entität #3 (Stapel). Auftrag über `ludwig-manager`, 2026-09-11 |
| Ersetzt | `modules/cycles/ui/CycleTimeline.tsx` (137 Z., Kartenleiste der Buchungsjahre mit Inline-Stilen und Hex-Fallback), die Zeitraum-Zeile `statement_activity_from – to` in `configuration/bankkonten/page.tsx` |
| Blockiert | Entität #3 `export-batch` („welcher Zeitraum hat einen Stapel, wo ist die Lücke, wo der Nachtrag"), #5 `payment-account` (Auszugsdeckung je Monat), das Wirtschaftsjahr (#15), #10 `expectation` (Fälligkeiten im Zeitraum) |
| Spec von / am | Claude, 2026-09-11 |

## Ziel

Die Sachbearbeiterin fragt in Schritt 1 der Abnahme „Ist alles da?": liegen
für jedes Zahlungskonto die Auszüge jedes Monats vor? Auf der Jahresseite
fragt sie, welche Jahre offen sind; am Stapel, welcher Zeitraum einen hat und
wo ein Nachtrag hängt. Heute beantwortet die App das mit einer Kartenleiste
(Jahre), einer Textzeile „von – bis" (Auszüge) und gar nicht (Stapel) — eine
**Lücke** sieht niemand, weil jede Darstellung nur zeigt, was da ist.

## Einordnung

- **Wiederverwenden:** `Timeline`/`CaseTimeline` sind ereignisbasiert (ein
  Datum je Zeile), `BarChart`/`Sparkline` zeigen Werte über Zeit,
  `ComparisonTable` Monate gegen Vormonate — keiner zeigt, **ob** ein Zeitraum
  abgedeckt ist. `StateKind`/`StateIcon` (`Review.tsx`) tragen das Vokabular
  „erledigt · offen · Warnung · Fehler · übersprungen …" mit Zeichen und Wort.
- **Neu, weil:** `spec-schreiben` §3 Regel 4 — eine Komposition, die auf vier
  Screens vorkommt (Auszugsdeckung, Jahre, Stapelzeiträume, Fälligkeiten) und
  sich aus Primitives nicht in ~15 Zeilen bauen lässt (Raster, laufender
  Zeitraum, Legende, Querlauf in der Karte).
- **Zuschnitt:** eine Datei `patterns/PeriodGrid.tsx`, ein Export plus Typen.
  Kein eigener Zustand — Server-Komponente.
- **Setzt auf:** `Card`/`CardHead`, `StateIcon`, `Link`.

## Aufbau

- **Spalten sind Zeiträume** (Monate, Jahre, Stapelzeiträume), links nach
  rechts; der **laufende** ist markiert.
- **Zeilen sind die Gegenstände**, deren Abdeckung gefragt ist (Zahlungskonten)
  — oder genau eine Zeile (die Jahre eines Mandanten, die Stapel eines Jahres).
- **Je Zelle ein Zustand** aus `StateKind`: Zeichen, dazu optional ein kurzer
  Wert (Stapelnummer, Anzahl), und **immer** ein Satz im Hover und für die
  Vorlesehilfe („Auszug Mai fehlt — erwartet bis 05.06."). Farbe allein sagt
  nichts (V7).
- **Eine Lücke ist eine Zelle mit Aussage**, keine leere: „fehlt" steht als
  Fehler-Zeichen mit Satz. Eine Zelle, die für diesen Gegenstand **nicht
  vorgesehen** ist (Konto ohne Auszugserwartung), bleibt leer und sagt das der
  Vorlesehilfe.
- **Je Zeile rechts eine Zusammenfassung** in Worten des Aufrufers („11 von 12",
  „1 Lücke").
- **Legende** unter dem Raster, aus den Zuständen, die vorkommen — nicht aus
  allen neun.
- Viele Spalten (18 Jahre, 24 Monate) scrollen **in der Karte**, nicht die Seite.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `title` · `sub` | `string` | ja · nein | Kopf der Karte | `StatementCoverage` |
| `periods` | `PeriodColumn[]` | ja | die Spalten, in Reihenfolge; `current` markiert den laufenden | `FiscalYears` |
| `rows` | `PeriodRow[]` | ja | je Gegenstand eine Zeile | `StatementCoverage` |
| `empty` | `string` | nein | der Satz ohne Zeilen, mit Grund | `Empty` |

```ts
interface PeriodColumn { key: string; label: string; current?: boolean }

interface PeriodCell {
  state: StateKind;        // Zeichen und Wort aus Review.tsx
  title: string;           // der Satz — Hover und Vorlesehilfe, Pflicht
  label?: ReactNode;       // kurzer Wert in der Zelle: Stapelnummer, Anzahl
  href?: string;           // Weg in den Zeitraum
}

interface PeriodRow {
  key: string;
  label: ReactNode;                               // der Gegenstand
  cells: Partial<Record<string, PeriodCell>>;     // fehlt der Schlüssel: nicht vorgesehen
  summary?: ReactNode;                            // rechts, in Worten des Aufrufers
}
```

Das Wort einer Achse (`kontoauszug_erwartung`, `zyklus`, `zyklus_stapel`)
übersetzt der Aufrufer in `state` und `title`; das Pattern kennt keine Achse.

Bewusst **nicht**: Balken über mehrere Zellen mit Tagesgenauigkeit (Ausbau),
Werte je Zeitraum (`BarChart`, `ComparisonTable`), Bearbeiten, Filtern.

## Verhalten

Server-Komponente, kein Zustand. Zellen mit `href` sind Links (Fokus sichtbar,
Tastatur wie jeder Link); ohne `href` sind sie Text. Zustände: gefüllt · leer
mit Grund; „lädt" und „Fehler" gehören der Seite (die Karte hat keinen
Datenabruf) — begründet ausgeschlossen, wie bei `ComparisonTable`.

## Stories

Titel `v3/Patterns/Prüfen/PeriodGrid`.

| Story | Beweist |
|---|---|
| `StatementCoverage` | Schritt 1 „Ist alles da?": fünf Zahlungskonten × 12 Monate — da, fehlt, kommt noch, nicht vorgesehen; Zusammenfassung je Konto |
| `Batches` | eine Zeile × 12 Monate mit Stapelnummern als Wert, eine Lücke im Mai, ein Nachtrag im Juli |
| `FiscalYears` | eine Zeile × 18 Jahre, laufendes Jahr markiert, jedes Jahr ein Weg |
| `Empty` | keine Zeilen: der Satz mit Grund |
| `Narrow` | 24 Monate bei 1024 px: das Raster scrollt in der Karte |
| `InUse` | Schritt 1 in einer Seite mit Kopfzahl — wie die Abnahme es zeigt |

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Spannen tagesgenau als Balken (Stapel 03.–28.08.) | `spans?: { from, to, state, label }[]` je Zeile | ein Screen muss Überlappung oder Teilmonate zeigen — die Stapel des Bestands decken ganze Monate |
| Zellen auswählen | `onSelect` | eine Seite öffnet den Zeitraum neben dem Raster statt über einen Link |

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

- [ ] Jede Zelle hat Zeichen **und** Satz (Hover, `aria-label`); keine Zelle sagt es nur mit Farbe (`StatementCoverage`)
- [ ] Eine Lücke ist eine Zelle mit Fehler-Zeichen und Satz, nicht leer; „nicht vorgesehen" ist leer und sagt es der Vorlesehilfe
- [ ] Der laufende Zeitraum ist markiert (`FiscalYears`)
- [ ] Die Legende zeigt nur die vorkommenden Zustände
- [ ] Zellen mit `href` sind Links, ohne sind sie Text
- [ ] 24 Spalten bei 1024 px: kein Querlauf der Seite, das Raster scrollt in der Karte (`Narrow`)
- [ ] Kein Text in 16 px
- [ ] Ersetzt `CycleTimeline` ohne Funktionsverlust (Jahr, Zustand, Weg) — belegt an `FiscalYears`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |
