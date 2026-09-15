# 0179 · DiffView — zwei Stände eines Datensatzes, feldweise

| | |
|---|---|
| Status | spec |
| Stufe | `patterns/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: zwei Stände eines Datensatzes nebeneinander, geändert hervorgehoben — kein Fachwort im Namen, in den Props oder in den Texten |
| Quelle | App-Roadmap `uikit-entity-roadmap-2026-09.md` Abschnitt B, **B3**; `docs/detailseiten-pattern.md` Spec **S2** |
| Ersetzt | in `ludwig/app` den Vergleich in Schritt 10 der Abnahme und in `ReplayVergleich`, beide von Hand gebaut |
| Blockiert | 0164 (`ai_edited`: was hat der Mensch am Vorschlag geändert), 0165 (Nachlese `matched_corrected`: was hat die Kanzlei in DATEV geändert) |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Fünf Stellen stellen dieselbe Frage: **was ist anders?** Der Mensch am
Vorschlag des Agenten, die Kanzlei am exportierten Satz, der Agent an der
Extraktion des Belegs, die Kondensierung an der Konvention, der Verlauf an
irgendeinem Feld. Heute beantwortet das jede Stelle selbst — mit zwei Listen
nebeneinander, in denen der Leser die Unterschiede sucht.

## Einordnung

- **Wiederverwenden:** `ReconciliationTable` (0161) stellt **zwei Mengen**
  gegenüber, Zeile für Zeile — hier geht es um **einen** Datensatz, Feld für
  Feld. `FieldList` zeigt einen Stand. `ProvenanceNote` (0163) sagt, dass von
  Hand korrigiert wurde, und wer — aber nicht was.
- **Neu, weil:** Regel 4 aus `spec-schreiben` §3 — eine Komposition mit
  eigenem Zustand (der Aufklapper der unveränderten Felder) auf mindestens
  zwei Screens; Prozessbegriffe (Stand, Änderung), keine Entität.
- **Zuschnitt:** eine Datei `DiffView.tsx`.
- **Setzt auf:** `Disclosure`, `Card`-freie Fläche wie `FieldList`, Tokens aus
  `v3.css`.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `rows` | `readonly DiffRow[]` | ja | je Feld: Label, Vorher, Nachher, und **ob** es sich geändert hat | `Changed` |
| `before` | `{ label: string; sub?: ReactNode }` | ja | das Wort über der linken Spalte — „Vorschlag", „Ludwig", „Vorher" | `Sides` |
| `after` | `{ label: string; sub?: ReactNode }` | ja | das Wort über der rechten Spalte — „Freigegeben", „DATEV" | `Sides` |
| `unchanged` | `"fold" \| "show" \| "hide"` | nein | Vorgabe `fold`: die unveränderten Felder liegen eingeklappt darunter (Owner-Default aus S2) | `ManyFields` |
| `allEqual` | `string` | nein | der Satz, wenn nichts anders ist; Vorgabe „Unverändert übernommen." | `AllUnchanged` |
| `tone` | `"surface" \| "bare"` | nein | `bare` für Drawer und Karten, die schon einen Rahmen haben | `InUse` |

```ts
export interface DiffRow {
  key: string;
  label: ReactNode;
  before: ReactNode;
  after: ReactNode;
  /** Der Aufrufer sagt es — das Pattern vergleicht nichts (E2). */
  changed: boolean;
}
```

**Kann bewusst nicht:** vergleichen (`changed` kommt vom Aufrufer: zwei
`ReactNode` lassen sich nicht vergleichen, und wer die Werte hat, hat auch die
Regel, wann sie gleich sind); mehr als zwei Stände; bearbeiten; zusammenführen
(„übernehmen" ist eine Aktion des Aufrufers, kein Knopf des Patterns).

## Verhalten

Client-Component, weil der Aufklapper Zustand trägt — sonst nichts. Geänderte
Felder stehen **oben**, in der Reihenfolge, in der sie hereingereicht werden;
die unveränderten darunter in einem `Disclosure` mit ihrer Zahl. Ist nichts
geändert, steht der Satz aus `allEqual` und darunter derselbe Aufklapper: die
Aussage „nichts anders" ist das Ergebnis, nicht eine leere Tabelle (L6).

Kein Farbcode allein (V6/V7): dass ein Feld anders ist, sagt seine **Stellung**
im oberen Block und das Wort der Spaltenköpfe. Der alte Wert steht gedämpft,
der neue in normaler Schrift — kein Durchstreichen, denn geändert ist nicht
gelöscht.

Schmal: ab wenig Platz stehen die beiden Stände **untereinander**, jeder mit
seinem Wort davor — die Spaltenköpfe allein tragen die Zuordnung dann nicht
mehr.

## Stories

Titel `v3/Patterns/Prüfen/DiffView`.

| Story | Beweist |
|---|---|
| `Changed` | drei geänderte Felder von acht; die fünf anderen liegen eingeklappt darunter |
| `AllUnchanged` | nichts anders: der Satz, und die Felder im Aufklapper |
| `ManyFields` | `unchanged="show"` und `"hide"` neben `"fold"` |
| `Sides` | „Ludwig" gegen „DATEV" statt „Vorher" gegen „Nachher", mit Unterzeilen |
| `Edges` | ein fehlender Wert auf einer Seite, ein sehr langer Text, ein Betrag; dazu 360 px — die Stände stehen dann untereinander |
| `InUse` | `tone="bare"` in einer Karte: die Nachlese eines exportierten Satzes |

Nicht anwendbar: leer (ohne Zeilen gibt es nichts zu vergleichen — der
Aufrufer zeigt die Form dann nicht), lädt und Fehler (gehören dem Rahmen).

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

- [ ] Geänderte Felder stehen oben, unveränderte im Aufklapper mit ihrer Zahl (Story `Changed`, DOM)
- [ ] `unchanged="show"` zeigt alle ohne Aufklapper, `"hide"` lässt die unveränderten ganz weg (Story `ManyFields`)
- [ ] Nichts geändert: der Satz steht, die Tabelle nicht leer (Story `AllUnchanged`)
- [ ] Kein Wert wird durchgestrichen; der alte Stand ist gedämpft, nicht rot (Story `Changed`, gemessen)
- [ ] Bei 360 px stehen die beiden Stände untereinander, jeder mit seinem Wort (Story `Edges`, gemessen)
- [ ] Das Pattern kennt keine Entität: `grep` findet kein Fachwort in Namen, Props und Texten

## Offene Fragen

1. Trägt die Zeile den Grund der Änderung? — ohne Antwort: **nein**; der Grund
   gehört zur Herleitung (`ProvenanceNote`, 0163), und der Aufrufer stellt sie
   daneben.
2. Braucht das Pattern eine Zusammenfassung („3 von 8 Feldern geändert")? —
   ohne Antwort: **ja**, als Unterzeile des Aufklappers; eine eigene Prop
   bekommt sie nicht.
