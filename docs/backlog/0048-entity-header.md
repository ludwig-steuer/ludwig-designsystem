# 0048 · EntityHeader

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` |
| Klassen-Test | ja — Kopf einer Akte mit Symbol, Titel, Merkmalen und einer Kennzahl gibt es in jeder Sachbearbeitungs-App |
| Quelle | Screenshot der Sachverhaltsansicht vom 2026-09-03 · `docs/seiten/sachverhalt-detail.md` Rang 1–2 |
| Ersetzt | `Hero` in `modules/accounting-cases/ui/sachverhalt/parts.tsx` (Z. 152–307) |
| Blockiert | 0050 `CaseDetailView` |
| Voraussetzung | **entfallen, mit Begründung:** das Entitätsprofil (`docs/entitaeten/` enthält nur `TEMPLATE.md`) entscheidet, welche **Datenpunkte** einer Entität in welche Form gehören — es bindet `entities/`. `EntityHeader` ist ein `patterns/`-Baustein mit Slots und kennt keinen Datenpunkt; die Rangfolge der **Fragen** liefert das Seitenprofil `docs/seiten/sachverhalt-detail.md` (Rang 1–2). Für 0050 (`entities/accounting-case/`) bleibt das Profil Voraussetzung. |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Die erste halbe Sekunde auf der Detailseite: worum geht es, in welchem
Zustand ist es, wie viel Geld hängt dran. Heute ist das eine 155 Zeilen lange
`Hero` im Sachverhalts-Modul, die dieselbe Aufgabe für Beleg, Konto und
Geschäftspartner nicht erledigen kann.

## Einordnung

- **Wiederverwenden:** `PageHeader` (0002) hat `overline`/`title`/`meta`/
  `actions`/`back`, aber keine Symbol-Kachel, keine Kennzahl rechts — und ist
  die Kopf**zeile** der Seite, keine Karte. `CardHead` ist zu klein (title/sub/
  actions). `KpiTile` deckt die Kennzahl, wenn sie ohne Kachel auskommt.
- **Entschieden: (b), eigener Baustein.** Gegen (a) sprechen drei Dinge, die
  `PageHeader` nie tragen soll: eine Faktenzeile, eine Meta-Zeile mit
  editierbaren Chips und eine Kennzahl. Erweitert man `PageHeader` darum,
  hat die Kopf**zeile** jeder Liste plötzlich vier Slots, die 90 % der
  Aufrufer nie brauchen — und ein `PageHeader`, der eine Karte sein kann,
  ist zwei Bausteine in einem. `PageHeader` bleibt die Zeile über der Seite,
  `EntityHeader` ist die Karte über einer Akte. Beide stehen nebeneinander:
  der Seitenkopf trägt Bereich und Aktionen, die Karte trägt den Gegenstand.
- **Zuschnitt:** eine Familie (`EntityHeader` + Meta-Zeile), eine Datei.
- **Setzt auf:** `Badge`, `StatusBadge`, `InlineEdit`, `FieldList`, `Amount`, `Link`.

## Bestandteile aus dem Screenshot

| Teil | heute | Frage an die Spec |
|---|---|---|
| Symbol-Kachel | `entity-icons.ts` (legacy, zieht mit 0043 nach `patterns/`) | Prop `icon` oder aus der Achse? |
| Titel | „Eingangsrechnung: DomainFactory GmbH" | Gegenpart steht 4× auf der Seite — was trägt der Titel? (Seitenprofil, Zweifel 4) |
| Meta-Zeile | Nummer · Status · Partner-Link · Art (Bleistift) · Belegnummer (Bleistift) | editierbare Chips: eigenes Muster oder `InlineEdit` in `Badge`? |
| Kennzahl rechts | „GESAMTBETRAG —" | leerer Wert an der stärksten Stelle (Zweifel 1): was steht da, wenn nichts da ist? |
| Zusammenfassung | eine Zeile, auch wenn leer | erst zeigen, wenn Text da ist (Zweifel 5) |
| Faktenzeile | 4 Spalten Label/Wert | `FieldList layout="row"` aus 0049 |
| Status-Auswahl | Badge mit Chevron | `StatusBadge` als Menü-Trigger, 0049 |

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `icon` | `ReactNode` | nein | Symbol-Kachel links. Kommt vom Aufrufer, **nicht** aus der Achse — der Kopf soll auch für Konto und Partner taugen, die keine Status-Achse mit Icon haben | `Filled` |
| `overline` | `ReactNode` | nein | Wo das steht: Entität und Nummer („Sachverhalt · 2026-0815") | `Filled` |
| `title` | `ReactNode` | ja | Der Gegenstand, einmal. Kein Punkt (T3) | `Filled` |
| `status` | `ReactNode` | nein | **Ein** Zustand — die führende Achse | `Filled` |
| `meta` | `ReactNode` | nein | Die Zeile unter dem Titel: Links, Chips, `InlineEdit`. Der Aufrufer setzt sie zusammen, die Karte trennt sie nur | `Filled` |
| `metric` | `{ label: string; value: ReactNode }` | nein | Kennzahl rechts. **Fehlt sie, steht dort nichts** — kein leerer Block an der stärksten Stelle | `Filled`, `WithoutMetric` |
| `summary` | `ReactNode` | nein | Eine Zeile Zusammenfassung, **nur wenn es Text gibt** | `Filled`, `Minimal` |
| `facts` | `[ReactNode, ReactNode][]` | nein | Die Faktenzeile — geht als `FieldList layout="row" tone="bare"` durch | `Filled` |
| `actions` | `ReactNode` | nein | Aktionen am Gegenstand, oben rechts unter der Kennzahl | `Filled` |

**Ein Export, keine zweite Komponente für die Meta-Zeile.** Sie ist Layout —
umbrechende Reihe mit Trennern — und hat keinen eigenen Zustand; als
Komponente wäre sie ein Wrapper um `flex-wrap` (`spec-schreiben` §4). Die
Story zeigt, wie sie aus `Badge`, `Link` und `InlineEdit` entsteht.

**Kann bewusst nicht:** Daten holen, Status auflösen (das tut `StatusBadge`),
mehrere Kennzahlen (dafür `KpiGrid`), Reiter tragen (das ist 0050), mehr als
einen Zustand zeigen.

## Entscheidungen aus dem Seitenprofil

Die Zweifel 1, 2, 4 und 5 aus `docs/seiten/sachverhalt-detail.md` sind hier
beantwortet, nicht offen gelassen:

1. **Kein leerer Kennzahlblock** (Zweifel 1). `metric` ist optional und
   rendert nichts, wenn es fehlt. „GESAMTBETRAG —" an der stärksten Stelle
   der Seite kostet die beste Position für eine Auskunft, die es nicht gibt.
   Wer eine Ersatzzahl hat (Betrag des Belegs), übergibt sie mit ihrem
   eigenen Label.
2. **Ein Zustand, nicht vier** (Zweifel 2). `status` nimmt **einen** Knoten.
   Die anderen Achsen erscheinen dort, wo sie hingehören — am Ereignis, in
   der Faktenzeile, in der Timeline. Der Kopf beantwortet „bin ich dran?"
   einmal.
3. **Der Gegenpart steht im Titel** (Zweifel 4), und die Faktenzeile trägt,
   was der Titel nicht sagt. Das erzwingt die Karte nicht — sie kann es nur
   nicht verhindern; die Story zeigt es richtig.
4. **Die Zusammenfassung erscheint mit Text** (Zweifel 5). Kein Platzhalter,
   keine leere Zeile; im Ruhezustand trägt sie der Aufrufer als `InlineEdit`
   in der Meta-Zeile.

## Verhalten

- **Reihenfolge im Markup:** Symbol · (Überzeile, Titel, Status) · Kennzahl ·
  Aktionen, darunter Meta-Zeile, darunter Zusammenfassung, darunter
  Faktenzeile. Jede Zeile entfällt vollständig, wenn ihr Slot leer ist —
  inklusive ihres Abstands.
- **Karte:** Rand **oder** Schatten, nicht beides (§9) — hier Rand, wie
  `FieldList` und `Card`.
- **Kennzahl:** Label in Versalien, Wert groß. Der Wert kommt fertig
  formatiert (`Amount`), die Karte rechnet und formatiert nicht.
- Server-Component: keine Interaktion, kein Zustand. `InlineEdit` und
  `Popover` in den Slots sind Client-Inseln des Aufrufers.

## Stories

Titel `v3/Patterns/Rahmen/EntityHeader`. Abgeleitet nach §6: 2 Zustände
(vollständig, minimal) + 0 Enum + 2 Layout (ohne Kennzahl, ohne Faktenzeile)
+ 0 Callback + 1 „im Einsatz" + 1 Rand = 6.

| Story | Beweist |
|---|---|
| `Filled` | Alle Slots: Symbol, Überzeile, Titel, Status, Meta mit Link und `InlineEdit`, Kennzahl, Zusammenfassung, vier Fakten, Aktionen |
| `Minimal` | Nur Titel — jede leere Zeile verschwindet samt Abstand |
| `WithoutMetric` | Zweifel 1: kein Betrag → kein Block, statt „—" an der besten Stelle |
| `OtherEntity` | Derselbe Kopf für ein Konto (Klassen-Test: kein Sachverhalts-Wissen drin) |
| `Editable` | Meta-Zeile mit `InlineEdit` und Status-Menü (0049) — der Kopf als Arbeitsfläche |
| `InUse` | Unter einem `PageHeader` mit `RecordPager`: Seitenkopf und Akte nebeneinander, wie in 0050 |

Nicht anwendbar: `Loading`, `Error` (der Kopf bekommt fertige Werte; für die
Ladezeit steht `Skeleton` an der Aufrufstelle), `LeerNachFilter` (kein Filter).

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` am Export
- [ ] Kein Hex, kein px im TSX; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Ohne `metric` steht an der Kennzahl-Stelle **nichts** — kein „—", kein
      leerer Kasten (Story `WithoutMetric`, DOM-Probe)
- [ ] Jeder leere Slot entfernt seine Zeile **samt Abstand**: `Minimal` ist
      nicht höher als Überzeile + Titel (Story `Minimal`, Höhe gemessen)
- [ ] `status` nimmt genau einen Knoten; die Karte zeigt keinen zweiten
      Zustand aus eigenem Antrieb (Code-Probe)
- [ ] Die Faktenzeile läuft über `FieldList layout="row"` aus 0049, nicht
      über eigenes Markup (`grep`)
- [ ] Der Kopf trägt kein Sachverhalts-Wissen: keine Achse, kein Fachwort in
      Props oder Defaults (Story `OtherEntity`)
- [ ] Karte mit Rand, ohne Schatten (§9)
- [ ] Server-Component: keine `"use client"`-Direktive in der Datei (`grep`)

## Befund beim Bauen (2026-09-03)

- **`InlineEdit` gehört nicht in die Meta-Zeile.** Erst stand die
  Zusammenfassung dort — `InlineEdit` bringt aber sein eigenes Label mit und
  ist zweizeilig, während die Meta-Zeile ihre Teile mit einem Punkt trennt.
  Ergebnis: ein Trennpunkt, der neben einem Block in der Luft hing. Der
  richtige Ort ist der `summary`-Slot; die Prop-Doku sagt das jetzt.
- **Die Meta-Zeile braucht Inline-Kinder**, weil der Trenner ein `::before`
  am Folgeelement ist. Das steht in der Prop-Doku und in der Story.
- **Kein zweiter Export.** Die Meta-Zeile ist `flex-wrap` mit Trennern und
  hat keinen eigenen Zustand — als Komponente wäre sie ein Wrapper um eine
  CSS-Regel (`spec-schreiben` §4).
- **Entitätsprofil:** die Voraussetzung ist begründet entfallen (siehe
  Kopftabelle). Für 0050 gilt sie weiter — dort geht es um `entities/`, und
  welche Datenpunkte eines Sachverhalts in welche Form gehören, entscheidet
  kein Screenshot.

## Neue Story-IDs

`v3-patterns-rahmen-entityheader--filled` · `--minimal` · `--without-metric` ·
`--other-entity` · `--editable` · `--in-use`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
