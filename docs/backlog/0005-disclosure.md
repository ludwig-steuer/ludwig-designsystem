# 0005 · Disclosure

| | |
|---|---|
| Status | spec |
| Stufe | `primitives/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, Details ausklappen ist fachfrei |
| Quelle | `docs/v3-backlog.md` — „Danach" (34 Stellen in 20 Dateien) |
| Ersetzt | natives `<details>/<summary>` in `RohdatenTab`, `StapelVergleich`, `PurposeDisplay`, `RegelwerkTab` u. a. |
| Blockiert | die Detail- und Drawer-Umzüge der Welle 1 |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Vieles in Ludwig ist nur manchmal interessant: die Rohdaten hinter einer
Rechnung, das Regelwerk hinter einem Vorschlag, der technische Verlauf. Heute
klappt das 34-mal ein natives `<details>` auf — jedes mit eigenem Dreieck,
eigener Beschriftung, eigenem Abstand. Mal steht die Zahl der Einträge in der
Zusammenfassung, mal nicht.

## Einordnung

- **Wiederverwenden:** `ExpandableRow` („A small extra detail for a row that
  is read and collapsed again") deckt genau die Tabellenzeile ab — das
  Ausklappen bleibt im Zeilenraster. Freistehend, in einer Karte oder einem
  Drawer, passt es nicht: dort gibt es keine Zeile, in die eingerückt wird.
- **Neu, weil:** Regel 3 — kein `@when` passt, kein Fachwort, 34 belegte
  Stellen. In ~15 Zeilen an der Aufrufstelle wäre es zwar baubar, aber genau
  das ist 34-mal passiert und auseinandergelaufen.
- **Zuschnitt:** eine Datei, ein Export.
- **Setzt auf:** natives `<details>/<summary>` — das trägt Tastatur,
  Screenreader und den Aufklapp-Zustand ohne eine Zeile JavaScript.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `summary` | `ReactNode` | ja | Was drinsteht, in einem Halbsatz — nie „Details" | `Filled` |
| `count` | `number` | nein | Wie viele Einträge drin sind; steht neben der Zusammenfassung | `WithCount` |
| `children` | `ReactNode` | ja | Der Inhalt | `Filled` |
| `defaultOpen` | `boolean` | nein | Offen beim ersten Rendern | `DefaultOpen` |
| `tone` | `"default" \| "quiet"` | nein | `quiet` für technische Beigaben (Rohdaten, Verlauf) | `Variants` |

**Kann bewusst nicht:** von außen gesteuert werden (kein `open`/`onToggle`) —
wer den Zustand braucht, hat einen anderen Fall und nimmt `MasterDetail` oder
`Dialog`. Ebenfalls nicht: mehrere Abschnitte koordinieren („nur einer offen").

## Verhalten

Server-Component — `<details>` braucht kein JavaScript.

- **Tastatur:** Enter und Leertaste klappen auf und zu; das kann das native
  Element und wird nicht nachgebaut.
- **Hover:** die Zusammenfassungszeile bekommt eine Tonstufe Hintergrund (§2).
- **Marker:** ein Lucide-Chevron, der sich beim Öffnen dreht; der native
  Dreiecks-Marker wird abgeschaltet. Kein Unicode-Pfeil (T9).
- **Zustände:** kein Lade- oder Fehlerzustand. Ist der Inhalt leer, gehört
  der Aufklapper gar nicht erst hin — das entscheidet der Aufrufer.

## Stories

Titel `v3/Primitives/Fläche/Disclosure`. Abgeleitet nach §6: 1 Zustand
+ 1 Enum (`tone`) + 1 Layout-Boolean (`defaultOpen`) + 0 Callbacks
+ 1 „im Einsatz" + 1 Rand (langer Inhalt) = 5.

| Story | Beweist |
|---|---|
| `Filled` | zu, mit sprechender Zusammenfassung |
| `WithCount` | Zahl der Einträge neben der Zusammenfassung |
| `DefaultOpen` | offen beim ersten Rendern |
| `Variants` | `default` und `quiet` nebeneinander |
| `InUse` | zwei Aufklapper in einer `Card`, darunter Rohdaten in `<pre>` |

Nicht anwendbar: `Leer` (ohne Inhalt wird der Aufklapper nicht gerendert),
`Laedt`, `Fehler` (der Inhalt bringt seinen eigenen Zustand mit).

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

- [ ] Enter und Leertaste klappen auf und zu, ohne eigenen Tastatur-Code (Story `Filled`)
- [ ] Der Marker ist ein Lucide-Chevron, kein Unicode-Zeichen (Regel T9)
- [ ] Die Datei trägt kein `"use client"`
- [ ] `count` erscheint nur, wenn gesetzt (Story `Filled` vs. `WithCount`)
- [ ] Ersetzt das `<details>` in `RohdatenTab` ohne Funktionsverlust

## Offene Fragen

1. Soll `summary` bei `quiet` kleiner gesetzt sein? *Ohne Antwort: ja, eine
   Stufe kleiner und in `--color-text-muted` — technische Beigaben sollen
   nicht mit dem Inhalt konkurrieren.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| | | |

Abgenommen von / am: — · Offene Punkte: —
