# 0184 · Die dritte Stufe: die Randspalte als benannter Wert, und `DetailView` ohne sie

| | |
|---|---|
| Status | Abnahme |
| Stufe | `patterns/` — Erweiterung von `Columns` (0154), Kürzung von `DetailView` (0138) |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: zwei benannte Spaltenbreiten, kein Fachwort |
| Quelle | `docs/backlog/0154-vier-spaltenmuster.md`, Abschnitt „Was 0152 noch braucht" (Punkte 1 und 2); `docs/detailseiten-pattern.md` Spec **S3** |
| Ersetzt | die festen `flex-basis`-Werte der Randspalte in `v3.css` und die Props `aside`/`minDetail` an `DetailView` |
| Blockiert | den zweiten Rahmen mit Randspalte (S4 und die Umzüge von `CaseDetailView`/`LedgerAccountView`) |
| Spec von / am | Claude, 2026-09-15 |

## Ziel

Die Breite der Arbeitsfläche ist seit 0154 ein **benannter Schritt**
(`facts` 460, `table` 960) — die Breite der Randspalte nicht: sie steht als
`flex-basis` dreimal in `v3.css`, einmal je Muster. Damit ist die eine Hälfte
der Entscheidung dokumentiert und die andere versteckt.

## Gemessen (2026-09-15, CDP, Story `Seiten/Sachverhalt/Einzelfall`)

Die Übersicht des Sachverhalts, Muster `list-detail-aside`, Fenster von 1600
bis 1024 px:

| Fenster | Strang | Arbeitsfläche | Notizspalte | steht nebeneinander |
|---|---|---|---|---|
| 1600 | 510 | 640 | 410 | ja |
| 1440 | 470 | 560 | 370 | ja |
| 1280 | 430 | 480 | **330** | ja |
| 1180 | 513 | 647 | — (volle Breite darunter) | nein |

Die Notizspalte fällt also zwischen 1280 und 1180 nach unten und steht bis
dahin bei **330 px**. Der heutige Boden von 320 px ist damit belegt: er ist
der Wert, der die drei Spalten bis 1280 zusammenhält und darunter zuerst
nachgibt — genau die Reihenfolge, die 0154 verlangt („was zuerst fällt, ist
nicht die letzte Spalte, sondern die Randspalte").

## Einordnung

- **Erweitert, weil:** Regel 2 aus `spec-schreiben` §3 — `Columns` deckt den
  Fall zu vier Fünfteln; es fehlt der benannte Wert für die zweite Breite, und
  die Entscheidung kommt bei jedem neuen Reiter wieder.
- **Gekürzt, weil:** `DetailView` trägt `aside` und `minDetail`, benutzt sie
  aber **niemand** (drei Aufrufer im Showcase, keiner mit Randspalte): die
  Randspalte gehört seit 0154 ins Muster. Eine Prop, die nichts trägt, ist ein
  Angebot, das den nächsten Aufrufer in den alten Weg schickt.
- **Zuschnitt:** zwei Dateien, keine neue.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `Columns.asideWidth` | `"notes" \| "facts"` | nein | der Boden der Randspalte als benannter Schritt: `notes` 320 (Notizen, Rückfragen, Erwartungen — gemessen oben), `facts` 360 (Stammdaten neben einer Tabelle, gemessen in 0157). Ohne ihn gilt die Vorgabe des Musters: `main-aside` steht auf `facts`, die übrigen auf `notes` | `AsideSteps` |
| ~~`DetailView.aside`~~ | — | — | **entfällt**; der Körper eines Reiters bekommt seine Spalten von `Columns` | — |
| ~~`DetailView.minDetail`~~ | — | — | **entfällt** mit `aside` | — |

**Kann bewusst nicht:** eine dritte Randspalten-Stufe erfinden — zwei sind
gemessen, eine dritte wäre ein Wunsch; eine freie Pixelzahl annehmen (das ist
der Punkt der Schritte).

## Verhalten

`Columns` setzt `--v3cols-aside` und die CSS-Regel liest es
(`flex: 1 1 var(--v3cols-aside, 320px)`); die musterspezifischen Werte bleiben
als Vorgabe stehen, damit kein Aufrufer sich ändert. Die Umbruch-Reihenfolge
bleibt: die Randspalte fällt zuerst, in `main-aside` nach **oben** (0157).

`DetailView` rendert den Körper wieder in genau einem Slot.

## Stories

| Story | Beweist |
|---|---|
| `AsideSteps` (in `Columns.stories`) | dieselbe Seite mit `notes` und mit `facts` nebeneinander, dazu die gemessenen Breiten im Text |
| bestehende Stories | unverändert — die Vorgaben je Muster ändern nichts |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente; Maße als Tokens oder benannte Schritte
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `asideWidth="notes"` ergibt 320 px Boden, `"facts"` 360 px (Story `AsideSteps`, gemessen)
- [ ] Ohne die Prop ändert sich keine bestehende Story: `main-aside` bleibt bei 360, `list-detail-aside` und `split` bei 320 bzw. 380 (Messung vorher/nachher)
- [ ] `DetailView` hat weder `aside` noch `minDetail`, und `grep` findet keinen Aufrufer, der sie übergab
- [ ] Der Umbruch bleibt: die Randspalte fällt zuerst, in `main-aside` nach oben
- [ ] Standard §1.2 nennt die vier Muster und die beiden Randspalten-Stufen statt `MasterDetail`

## Offene Fragen

1. Ziehen `CaseDetailView` (0050) und `LedgerAccountView` (0063) auf `Columns`
   um? Sie bauen ihre Randspalte heute selbst mit `MasterDetail`. — ohne
   Antwort: **nicht in dieser Aufgabe**; beide haben eigene Specs und
   gemessene Abnahmen, und der Umzug ist ein eigener Schritt mit eigener
   Messung (Vormerkung in 0154).

## Gebaut (2026-09-15)

`Columns` trägt `asideWidth` mit den Stufen `notes` 320 und `facts` 360; die
Regel liest `--v3cols-aside`, die musterspezifischen Vorgaben bleiben stehen.
`DetailView` hat weder `aside` noch `minDetail` mehr und rendert den Körper in
genau einem Slot.

Gemessen (CDP, 1440 px, vorher und nachher):

| Story | vorher | nachher |
|---|---|---|
| `Columns · MainAside` | 1005 · 383 | unverändert |
| `Columns · ListDetailAside` | 462 · 544 · 362 | unverändert |
| `Seiten/Sachverhalt/Einzelfall` | 470 · 560 · 370 | unverändert |
| `Columns · AsideSteps` (neu) | — | `notes` 462 · 544 · 362 · `facts` 452 · 524 · 392 |

`pnpm typecheck`, `check:classes`, `check:language`, `check:when` und
`pnpm build` grün. Abnahme durch einen anderen Agenten steht aus.
