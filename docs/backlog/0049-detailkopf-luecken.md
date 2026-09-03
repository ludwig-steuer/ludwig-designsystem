# 0049 · Fünf Lücken am Detailkopf

| | |
|---|---|
| Status | Abnahme |
| Stufe | `primitives/` (4) · `patterns/` (1) — bestehende Bausteine, keine neuen |
| Klassen-Test | entfällt: alle fünf sind Erweiterungen bestehender Komponenten |
| Quelle | Screenshot der Sachverhaltsansicht vom 2026-09-03 · Abgleich Bestand ↔ Screen |
| Ersetzt | handgebaute Stellen in `modules/accounting-cases/ui/sachverhalt/parts.tsx` |
| Blockiert | 0048 `EntityHeader`, 0050 `CaseDetailView` |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Fünf kleine Fehlstellen, die einzeln keine Aufgabe wert sind und zusammen
verhindern, dass die Sachverhaltsansicht aus v3-Bausteinen gebaut werden kann.
Eine Aufgabe, ein Commit, fünf Stories.

## Die fünf

| # | Baustein | Fehlt | Beleg im Screen |
|---|---|---|---|
| 1 | `FieldList` (`primitives`) | `layout="row"` — Label/Wert nebeneinander in Spalten statt untereinander | Faktenzeile ERÖFFNET · STATUS · PERSONENKONTO · GESCHÄFTSPARTNER |
| 2 | `StatusBadge` (`patterns`) | Auslöser eines Menüs sein: Chevron, `aria-haspopup`, Auswahl der erlaubten Folgezustände | „Noch nicht ausgeglichen ⌄" |
| 3 | `StatusCallout` (`primitives`) | `icon` links vom Kicker | Leiste „NÄCHSTE AKTION" |
| 4 | `Tabs` (`primitives`) | `dot` — Marke ohne Zahl, wenn es etwas gibt, das sich nicht zählen lässt | Reiter „Saldo & Konten ●" |
| 5 | `CardHead` (in `primitives/Table.tsx`) | `icon` links, `meta` rechts neben den Aktionen | Karten „TIMELINE · 1 Ereignis" und „DETAIL" |

## Einordnung

- **Erweitern statt neu, weil:** jede der fünf ist ein Prop an einem Baustein,
  der die Aufgabe schon zu 90 % erfüllt. Keiner rechtfertigt eine eigene
  Komponente (`spec-schreiben` §3: neue Primitives brauchen zwei Verwendungen
  *und* keinen passenden Träger).
- **Geprüft bei #2 — kein `StatusPicker`.** Die Registry kennt **keine**
  Übergänge: `STATUS_REGISTRY` beschreibt Ausprägungen (Label, Ton,
  Bedeutung), nicht, welcher Zustand auf welchen folgen darf. Die Liste der
  erlaubten Folgezustände kommt also vom Aufrufer, und `axisLegend(axis,
  only)` (`status-registry.ts:1734`) nimmt sie bereits als Teilmenge
  entgegen. Damit bleibt es bei `Popover` + `StatusBadge` in einer Story;
  `StatusBadge` bekommt nur den Chevron.
- **Geprüft bei #5:** `CardHead` sitzt weiter in `Table.tsx` — 0043 ist
  gelaufen und hat `Card`/`CardHead`/`CardFoot` bewusst nicht umgezogen.
  Diese Aufgabe fasst den Ort nicht an.

## Schnittstelle — die fünf Erweiterungen

| # | Datei | Neu | Typ | Default | Nachweis (Story) |
|---|---|---|---|---|---|
| 1 | `primitives/FieldList.tsx` | `layout` | `"stack" \| "row"` | `"stack"` (heutiges Verhalten) | `FactsRow` |
| 2 | `patterns/StatusBadge.tsx` | `chevron` | `boolean` | `false` | `StatusMenu` |
| 3 | `primitives/StatusCallout.tsx` | `icon` | `ReactNode` | — | `NextAction` |
| 4 | `primitives/Nav.tsx` (`TabItem`) | `dot` | `boolean` | — | `TabsWithDot` |
| 5 | `primitives/Table.tsx` (`CardHead`) | `icon`, `meta` | `ReactNode` | — | `CardHeadIconMeta` |

**Bewusst nicht:**

- Kein `StatusPicker`-Export (siehe oben) und **kein `aria-haspopup` an
  `StatusBadge`**: der Chevron ist Optik, die ARIA-Beziehung gehört an den
  Auslöser, und `Popover` setzt sie dort bereits (`Popover.tsx:139`). Ein
  zweites `aria-expanded` am Chip wäre eine falsche Behauptung.
- Kein `dot` **mit** `count` an einem Reiter: entweder es ist zählbar, dann
  steht die Zahl da, oder es ist nur „da", dann der Punkt. Beides zusammen
  sagt zweimal dasselbe. Der Punkt weicht der Zahl, wenn beides gesetzt ist.
- `layout="row"` bekommt **keine** Spaltenzahl als Prop: die Spalten ergeben
  sich aus der Zahl der Paare, der Umbruch aus der Breite.

## Verhalten

- **#1 `layout="row"`:** die Paare stehen **nebeneinander** statt
  untereinander, je Paar Label über Wert. Das Label bleibt die
  Versalienzeile, der Wert steht darunter in Lesegröße. Bei zu wenig Platz
  bricht die Reihe um — sie scrollt nicht.
- **#2 `chevron`:** ein `ChevronDown` (Lucide, 1.5 px) hinter dem Label,
  gedämpft. Ohne `chevron` ist der Chip unverändert; der Chip bleibt
  server-tauglich (der Chevron ist Markup, kein Zustand).
- **#3 `icon`:** links vom Kicker, in der Farbe des Tons — also Teil der
  Tonleiter, nicht des Textes. Das Wort im Kicker bleibt (V7).
- **#4 `dot`:** ein Punkt an der Stelle, an der sonst der Zähler steht.
  `alarm` färbt ihn wie die Zahl. Steht auch `count`, gewinnt die Zahl.
- **#5 `icon`/`meta`:** Symbol links vor Titel und Nebenzeile, `meta`
  rechts **vor** den Aktionen — die Aktion bleibt außen, wo die Hand sie
  sucht.

## Stories

Eine Story je Lücke, in der Story-Datei des jeweiligen Bausteins.

| Story | Datei | Beweist |
|---|---|---|
| `FactsRow` | `FieldList.stories.tsx` | vier Paare nebeneinander, Umbruch bei Enge |
| `StatusMenu` | `StatusBadge.stories.tsx` | Chip mit Chevron als `Popover`-Auslöser, Folgezustände aus `axisLegend(axis, only)` |
| `NextAction` | `StatusCallout.stories.tsx` | Leiste „NÄCHSTE AKTION" mit Symbol, drei Töne |
| `TabsWithDot` | `Nav.stories.tsx` | Reiter mit Punkt neben Reitern mit Zähler; Punkt weicht der Zahl |
| `CardHeadIconMeta` | `Table.stories.tsx` | Karte mit Symbol, `meta` und Aktionen nebeneinander |

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; JSDoc der geänderten Props englisch
- [ ] Kein Hex, kein px im TSX; neue Maße als Tokens/Klassen in `v3.css`
- [ ] Alle fünf Stories vorhanden
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] Jede der fünf Props hat ihren Default so, dass **kein** bestehender
      Aufrufer sich ändert (Story-Vergleich der Bestands-Stories)
- [ ] `layout="row"` stellt die Paare nebeneinander und bricht um, statt zu
      scrollen (Story `FactsRow`, schmales Fenster)
- [ ] `StatusBadge` trägt kein `aria-haspopup`/`aria-expanded`; die ARIA-
      Beziehung steht am `Popover`-Auslöser (Story `StatusMenu`, DOM-Probe)
- [ ] Ein Reiter mit `dot` **und** `count` zeigt die Zahl, nicht den Punkt
      (Story `TabsWithDot`)
- [ ] `CardHead` ohne `icon`/`meta` rendert dasselbe Markup wie vorher
      (Story-Vergleich)
- [ ] Kein neuer Export in `src/ui/v3/index.ts` — fünf Props, keine
      Komponente

## Befund beim Bauen (2026-09-03)

- **`axisLegend` schluckt falsche Keys lautlos.** Die Story `StatusMenu`
  hatte erst `["…", "booked", "rejected"]` — beides keine DB-Werte der Achse
  (die heißen `closed_accepted` und `closed_rejected`). Ergebnis: ein Menü mit
  zwei statt vier Einträgen, ohne Fehler, ohne Warnung. Der Kommentar an
  `axisLegend` (`status-registry.ts:1731`) sagt das zwar („unbekannte Keys
  werden still ignoriert"), aber wer eine Teilmenge nennt, hat sich verschrieben
  und merkt es nicht. **Befund für die Registry:** eine Variante, die auf
  unbekannte Keys hinweist, statt sie zu verschweigen, wäre eine eigene kleine
  Aufgabe wert — für die Aufrufstelle, nicht für die Anzeige.
- **Zwei Layouts brauchten `margin-right: auto`.** `StatusCallout` und
  `CardHead` stehen beide auf `justify-content: space-between` mit zwei
  Kindern. Ein drittes Kind (Symbol bzw. `meta`) landet damit in der Mitte;
  der Textblock schiebt jetzt die rechte Gruppe nach außen. Ohne `icon`/`meta`
  ist das Ergebnis unverändert — das war das Kriterium.
- **Kein Prop für die Spaltenzahl** bei `layout="row"`: die Reihe bricht bei
  Enge um (im engen Kasten der Story sichtbar: drei Paare oben, eines
  darunter). Eine Spaltenzahl wäre eine Behauptung über den Platz, den der
  Aufrufer hat.
- `dot` **und** `count` am selben Reiter zeigt die Zahl — die Story belegt es
  am Reiter „Historie".

## Neue Story-IDs

`v3-primitives-fläche-fieldlist--facts-row` ·
`v3-patterns-prüfen-statusbadge--status-menu` ·
`v3-primitives-fläche-statuscallout--next-action` ·
`v3-primitives-navigation-tabs--tabs-with-dot` ·
`v3-primitives-tabelle-table--card-head-icon-meta`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
