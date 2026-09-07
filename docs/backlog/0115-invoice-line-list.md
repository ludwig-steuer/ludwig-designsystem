# 0115 · `InvoiceLineList`

| | |
|---|---|
| Status | fertig |
| Freigabe | 2026-09-07, designsystem-f0 im Auftrag des Owners — Entscheide und Pflichtänderungen vor dem Bau im Abschnitt „Freigabe" |
| Stufe | `entities/invoice-line/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → nein: sie zeigt Rechnungspositionen mit ihrer Ludwig-Einordnung |
| Quelle | Entitätsprofil `docs/entitaeten/invoice-line.md` (Status `geprüft`), Abschnitt **Listen** — Job-Satz, Grundgesamtheit und Mechanik stammen von dort |
| Ersetzt | den Listenrahmen, die Spalten-Kopfzeile und den Umschalter **Kompakt \| Erweitert** von `PositionenTab` |
| Blockiert | den Reiter „Positionen" in 0071 (`SourceDocumentView`) |
| Setzt voraus | 0072 (`InvoiceLineRow`) und 0114 (`InvoiceLineFacts`) |
| Spec von / am | Claude, 2026-09-07 (Skill `spec-schreiben`) |

## Ziel

> Wenn **die Sachbearbeiterin einen Kontovorschlag prüft**, will sie **sehen,
> welche Positionen der Beleg hat und wie Ludwig jede eingeordnet hat**, damit
> **sie die eine Zeile findet, die falsch liegt**.

Der Job-Satz aus dem Profil, wörtlich. Die Liste ist der Reiter „Positionen"
einer Rechnung — keine Seite, keine eigene Route.

## Einordnung

- **Wiederverwenden:** `Card`, `Table`, `HeadRow`, `EmptyRow`, `CardFoot` aus
  `primitives/Table.tsx`; `InvoiceLineRow` (0072) je Zeile, `EmptyState` für
  den Leerfall.
- **Nicht** `DataTable`: das Pattern bringt Sortierung, Auswahl, Spaltensatz
  und Pager mit — die Liste sortiert **nie** anders als nach `position`,
  filtert nicht, hat keine Massenaktion und braucht keinen Pager. Was bliebe,
  wären ausgeschaltete Fähigkeiten.
- **Neu, weil:** `spec-schreiben` §3 Nr. 5 und Profil §8 — ein Listen-Job, von
  einem Screen belegt, mit eigener Grundgesamtheit und eigener Mechanik.
- **Zuschnitt:** eine Datei `InvoiceLineList.tsx`.
- **Setzt auf:** `Card`, `Table`, `HeadRow`, `EmptyRow`, `CardFoot`,
  `InvoiceLineRow`, `Amount`, `formatCount`.

## Mechanik — was die Zahlen entscheiden

Gemessen an 726 Positionen auf 314 Rechnungen (Staging, 2026-09-07):
p50 **1** · p90 **5** · p99 17 · max **22**, 1 % der Rechnungen ohne Position.

Nach `entitaet-analysieren` §8 heißt das: **keine Pagination, kein
Serverfilter, kein Ladefall**. Der Reiter wird ohnehin erst geladen, wenn man
ihn öffnet. Und: **die Hälfte aller Rechnungen hat genau eine Position** — der
einzeilige Fall und der Leerfall verdienen mehr Sorgfalt als der lange.

## Was um die Zeile herum steht

| Teil | Inhalt |
|---|---|
| Kopf | die Zahl der Positionen (`formatCount`) und der Umschalter **Kompakt \| Erweitert** |
| Spalten-Kopfzeile | Pos. · Bezeichnung · Menge · Einzelpreis · USt-Satz · Netto-Summe — **ohne** Rabatt (0 % gefüllt, L-201) |
| Zeilen | `InvoiceLineRow` je Position, nach `position` aufsteigend, `disabled` eingeschlossen und gedämpft |
| Fuß | die **Summe der Nettobeträge über die nicht deaktivierten Zeilen**, und wenn `invoiceNetTotal` gesetzt ist, die Probe dagegen |
| Leerfall | „Für diesen Beleg wurden keine Positionen erkannt." |

**Der Leerfall ist kein Erfolg.** Eine Rechnung ohne Positionen ist 1 % der
Fälle (4 von 318) und fast immer ein Extraktionsproblem — der Text sagt das,
statt „Alles erledigt" zu suggerieren (T6, und §8: „nichts offen" und „keine
Treffer" sind zwei verschiedene Leerfälle).

**Die Summe ist neu.** Sie fehlt heute: `PositionenTab` zeigt jede Zeile, aber
nie die Probe gegen den Rechnungsbetrag. Genau die braucht, wer prüft.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `lines` | `readonly InvoiceLineItem[]` | ja | die Positionen **einer** Rechnung; die Liste sortiert selbst nach `position` und nimmt sie auch als React-Key — `InvoiceLineItem` hat keine `id`, `position` ist je Rechnung eindeutig (UNIQUE) | `Standard` |
| `labels` | `InvoiceLineLabels` | ja | die Wörter der vier Wertebereiche, durchgereicht an jede Zeile (L-99) | `Standard` |
| `renderFacts` | `(line: InvoiceLineItem) => ReactNode` | nein | füllt den Aufklapper je Zeile — hier steckt der Aufrufer `InvoiceLineFacts` (0114) hinein. **Fehlt er, klappt keine Zeile auf**, der Umschalter erscheint nicht, und die Chevron-Spur `var(--v2-tbl-pick)` samt leerer Kopfzelle entfällt | `AllExpanded` |
| `invoiceNetTotal` | `number` | nein | der **Netto**betrag der Rechnung (Quelle `InvoiceDetail.subtotalValue`; `totalValue` ist brutto). Gesetzt, macht der Fuß die Probe | `TotalMismatch` |
| `defaultExpanded` | `boolean` | nein | der gemerkte Stand des Umschalters — die App liest ihn aus `localStorage`, die Liste kennt keinen Speicher | `AllExpanded` |
| `onExpandedChange` | `(expanded: boolean) => void` | nein | meldet den Umschalter nach außen, damit die App ihn merken kann | `AllExpanded` |

Typen aus `src/ludwig/`: `InvoiceLineItem`. `InvoiceLineLabels` kommt aus 0072.

**Was die Liste bewusst nicht kann:** sortieren (die Reihenfolge des Belegs ist
die einzige richtige), filtern, auswählen, blättern, nachladen — und nichts
ändern. Wer eine Einordnung korrigieren will, tut das am Buchungssatz
(`JournalEntryEditor`, 0015).

## Verhalten

Client-Component wegen des Umschalters; die Zeilen darunter bleiben, was sie
sind. Der Umschalter ist ein `Segmented` mit zwei Werten und erscheint **nur,
wenn `renderFacts` gesetzt ist und mindestens eine Zeile da ist** — sonst gäbe
es einen Schalter ohne Wirkung (V14).

**Die Taste ist `Alt+E`**, gebunden mit einem eigenen `keydown`-Listener wie im
`JournalEntryEditor`: `useHotkeys` verwirft Kombinationen mit Alt, und
`Segmented` hat keinen `Kbd`-Slot. Sie steht deshalb als Text im Label des
Segments („Erweitert · Alt+E"). `E`, weil `J`/`K` dem Pager gehören.

Der Umschalter setzt alle Zeilen zugleich; eine einzelne Zeile darf danach
wieder abweichen, ohne dass der Umschalter zurückspringt — er sagt, was zuletzt
für alle galt, nicht, was gerade für jede gilt.

**Die Summe im Fuß läuft über die nicht deaktivierten Zeilen.** Eine
`disabled`-Zeile ist vom Beleg-Kollaps ersetzt worden, und die
`virtual_aggregate`-Zeile ist ihr Sammel-Item — zählte man beide, käme jede
kollabierte Rechnung doppelt heraus. `summary_total`-Zeilen (40 im Bestand)
werden **mitsummiert**: weicht die Summe dadurch vom Rechnungsbetrag ab, ist
genau das die Information, die die Probe geben soll.

Zustände: **gefüllt**, **einzeilig**, **leer**. Nicht anwendbar sind **lädt**
und **Fehler**: der Reiter wird als Ganzes geladen, und die Liste bekommt ihre
Zeilen als Prop. `leer nach Filter` gibt es nicht, weil nicht gefiltert wird.

## Stories

Abgeleitet nach `spec-schreiben` §6: 3 Zustände (gefüllt, einzeilig, leer) +
1 je Callback (`onExpandedChange`) + 1 „im Einsatz" + 1 Rand (die Liste
formatiert und summiert) = **6**. Titel
`v3/Entitäten/Rechnungsposition/InvoiceLineList`.

| Story | Beweist |
|---|---|
| `Standard` | fünf Positionen (p90), Kopfzeile, Summe im Fuß |
| `Single` | **eine** Position — der häufigste Fall im Bestand |
| `Empty` | der Satz, der den Leerfall als Befund benennt, nicht als Erfolg |
| `AllExpanded` | Rundlauf über `defaultExpanded`/`onExpandedChange` mit `useState`; alle Zeilen zugleich auf, eine einzeln wieder zu |
| `TotalMismatch` | die Probe gegen `invoiceNetTotal` schlägt an — Abweichung mit Wort, nicht nur mit Farbe (V7) |
| `Edges` | 22 Positionen (max), darunter zwei deaktivierte und die `virtual_aggregate`-Zeile |

## Offene Fragen

Keine mehr offen — entschieden mit der Freigabe vom 2026-09-07:

1. **Worüber läuft die Summe?** Über die nicht deaktivierten Zeilen;
   `summary_total` zählt mit. Eine deaktivierte Zeile ist vom Kollaps ersetzt,
   die Aggregat-Zeile ist ihr Sammel-Item — sonst zählt jede kollabierte
   Rechnung doppelt.
2. **Welche Zahl ist `invoiceNetTotal`?** `InvoiceDetail.subtotalValue`, also
   netto. `totalValue` ist brutto und wäre die falsche Probe.
3. **Wie wird `Alt+E` gebunden?** Mit einem eigenen `keydown`-Listener; die
   Taste steht als Text im Segment-Label. `useHotkeys` verwirft Alt, und
   `Segmented` hat keinen `Kbd`-Slot.

## Ausbau

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Der Sprung von einer Position zum Buchungsvorschlag | `onOpenProposal?` an der Zeile (0072) | ein Screen verlangt den Weg |
| Eine echte Fußzeile in der Tabelle statt der Karten-Fußzeile | `FootRow` in `primitives/Table.tsx` | eine zweite Liste braucht eine Summe unter ihrer Spalte |
| Positionen mehrerer Belege nebeneinander | eine andere Grundgesamtheit — also eine andere Liste, nicht diese | ein Screen fragt danach |

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

- [ ] Die Zeilen stehen nach `position` aufsteigend, auch wenn `lines` anders sortiert hereinkommt (Story `Edges`, gemessen)
- [ ] Kein Pager, keine Sortier-Knöpfe, keine Auswahlspalte — auch bei 22 Zeilen (Story `Edges`, gemessen)
- [ ] Die Summe im Fuß ist die Summe der `lineTotalNetValue` **über die nicht deaktivierten Zeilen**; `summary_total` zählt mit (Story `Edges` mit zwei deaktivierten und der Aggregat-Zeile, nachgerechnet)
- [ ] Weicht die Summe von `invoiceNetTotal` ab, steht die Abweichung mit einem Wort da (Story `TotalMismatch`, gemessen)
- [ ] Ohne `invoiceNetTotal` steht keine Probe, aber die Summe (Story `Standard`)
- [ ] Ohne `renderFacts` gibt es weder Umschalter noch Aufklapp-Knopf noch Chevron-Spur, und `Alt+E` wird nicht gedruckt (Story `Standard`, gemessen: Spaltenzahl der Kopfzeile)
- [ ] `Alt+E` klappt alle Zeilen auf und wieder zu; die Taste steht als Text im Segment-Label (Story `AllExpanded`, gemessen — mit einem echten Tastendruck über CDP, nicht am State abgelesen)
- [ ] Eine einzeln zugeklappte Zeile lässt den Umschalter stehen (Story `AllExpanded`, gemessen)
- [ ] Der Leerfall nennt das Extraktionsproblem und feiert nichts (Story `Empty`)
- [ ] Deaktivierte Zeilen bleiben sichtbar und sind gedämpft (Story `Edges`, gemessen)
- [ ] ~~Die Spaltenbreiten halten bei 1280 px und 1600 px; die Bezeichnungs-Zelle bleibt bei 93 Zeichen (p90) **dreizeilig** — Name, Beschreibung, Streifen — und bricht nicht in eine vierte um~~ — **abgelöst am 2026-09-07**, siehe „Nach der Abnahme" am Ende dieser Datei
- [ ] Ersetzt Rahmen, Kopfzeile und Umschalter von `PositionenTab` ohne Funktionsverlust — außer der Rabatt-Spalte, die dort in jeder Zeile leer ist (B4)

## Abnahme

Gemessen am laufenden Storybook (6107). Die Tasten sind über
`Input.dispatchKeyEvent` gedrückt, nicht als synthetisches Event; zwischen den
Schritten wurde neu gelesen. Layout-Zahlen zusätzlich bei 1104 px — der Breite,
die der Reiter in der Belegkarte von 0071 bei 1440 × 900 hat.

**Story-Deckung: vollständig gegenüber der Story-Tabelle** — sechs Stories,
`lines`/`labels` → `Standard`, `renderFacts` → `AllExpanded` (und `Single`,
`Empty`, `TotalMismatch`, `Edges`), `invoiceNetTotal` → `TotalMismatch`,
`defaultExpanded`/`onExpandedChange` → `AllExpanded`. Ausschlüsse (`lädt`,
`Fehler`, `leer nach Filter`) sind begründet. **Befund an der Spec:** die
Ableitung zählt „1 im Einsatz", die Story-Tabelle führt keine solche Story —
gemessen wurde deshalb in `Standard`/`Edges` bei der Reiterbreite.

| Kriterium | Nachweis (Story-ID · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck`, `pnpm build` grün | beide Exit 0 | ✓ |
| Datei nach der Familie, Story daneben, Titel in der Gruppe | `entities/invoice-line/InvoiceLineList.tsx` + `.stories.tsx`, Titel `v3/Entitäten/Rechnungsposition/InvoiceLineList` | ✓ |
| Code englisch; `@when`/`@instead` am Export | vorhanden | ✓ |
| Kein Hex, kein px, keine lokale Label-Map | Maße über `invoiceLineTracks`/`invoiceLineMinWidth` aus 0072, Farben aus `v3.css` | ✓ |
| Alle Stories vorhanden, Ausschlüsse begründet | 6/6 | ✓ |
| Prüfliste §9 durchgegangen | V3 gerissen (geerbt, M2), Karte fehlt (M4); sonst gehalten: Taste sichtbar im Segment (V14), Abweichung mit Wort (V7), Leertext benennt den Befund (T6), Kontrast Warnfarbe 5,5:1, keine Konsolenmeldung | teilweise |
| Im Browser angesehen | alle sechs Stories, 0 Fehler/Warnungen | ✓ |
| Zeilen nach `position` aufsteigend, auch bei anderer Eingabereihenfolge | `Edges` bekommt `[...ALL].reverse()` · gerendert #1 … #22 in Folge | ✓ |
| Kein Pager, keine Sortier-Knöpfe, keine Auswahlspalte — auch bei 22 Zeilen | `Edges` · 0 Pager-Knoten, 0 `<button>` in `<th>`, 0 `input[type=checkbox]`, 22 Datenzeilen | ✓ |
| Summe über die **nicht deaktivierten** Zeilen; `summary_total` zählt mit | `Edges` · Fuß „4.406,30 €". Selbst nachgerechnet aus `fixtures.ts`: 83,80 + 359,60 + 70,50 + 1.117,50 + 9,90 + 30,00 + 44,75 + 87,00 + 480,00 + 76,80 + 371,25 + 429,80 + 90,00 + 68,00 + 39,00 − 120,00 + 12,00 + 760,00 + 156,40 + 240,00 = **4.406,30**; ausgelassen #7 (612,40, `disabled`) und #20 (0,00, `disabled`). Die erste Hälfte stimmt. **Die zweite ist unbewiesen: die einzige `summary_total`-Zeile im Bestand der Fixtures (#7) ist selbst `disabled`** und zählt daher nicht mit | **✗ M1** |
| Weicht die Summe von `invoiceNetTotal` ab, steht die Abweichung mit einem Wort da | `TotalMismatch` · Fuß „Summe der Positionen · 4.406,30 € · weicht vom Rechnungsbetrag ab: +612,40 €", Farbe `rgb(140,96,30)` (Kontrast 5,5:1), Wort steht vor der Zahl | ✓ (Ursache siehe M1) |
| Ohne `invoiceNetTotal` keine Probe, aber die Summe | `Standard` · Fuß „Summe der Positionen · 1.641,30 €", kein Probesatz. Nachgerechnet: 83,80 + 359,60 + 70,50 + 1.117,50 + 9,90 = 1.641,30 | ✓ |
| Ohne `renderFacts` weder Umschalter noch Aufklapp-Knopf noch Chevron-Spur, `Alt+E` nicht gedruckt | `Standard` · Kopfzeile 6 Zellen, Spuren `56px 472px 110px 120px 84px 132px`, 0 `.v2tbl__chev`, 0 `<button>`, kein `Segmented`, „Alt+E" kommt im Text nicht vor. Gegenprobe `Single`: 7 Zellen, erste 32 px | ✓ |
| `Alt+E` klappt alle Zeilen auf und zu; die Taste steht im Segment-Label | `AllExpanded` · echter Tastendruck (`Input.dispatchKeyEvent`, `modifiers:1`, `KeyE`), je Schritt neu gelesen: offen 5 → **Alt+E** → 0, Segment „Kompakt", Rückmeldung „Zuletzt für alle gesetzt: Kompakt" → **Alt+E** → 5, Segment „Erweitert · Alt+E" | ✓ |
| Eine einzeln zugeklappte Zeile lässt den Umschalter stehen | `AllExpanded` · nach dem Klick auf ein Chevron: offen 4, Segment bleibt „Erweitert · Alt+E", Rückmeldung bleibt „Erweitert" | ✓ |
| Der Leerfall nennt das Extraktionsproblem und feiert nichts | `Empty` · „Für diesen Beleg wurden keine Positionen erkannt." plus „Das ist kein Erfolg, sondern selten und meist ein Problem der Extraktion: 4 von 318 Rechnungen im Bestand. Der Beleg lässt sich erneut lesen."; kein Fuß, kein Umschalter | ✓ |
| Deaktivierte Zeilen bleiben sichtbar und sind gedämpft | `Edges` · #7 und #20 stehen in der Liste, Zellfarbe `rgb(113,113,113)` gegen `rgb(45,45,45)`, beide mit der Plakette „deaktiviert" | ✓ |
| Spaltenbreiten halten bei 1280/1600; Bezeichnungs-Zelle bleibt bei 93 Zeichen dreizeilig | Spuren identisch bei 1104, 1280 und 1600 (`32px 56px 430px 110px 120px 84px 132px` mit Aufklapper, `56px 472px …` ohne) und bei 700 px scrollt die Tabelle ab 760 px statt zu quetschen. **Namensspur 402 px bei 1104, 430 px bei 1280/1600; 92 wie 95 Zeichen brechen auf zwei Zeilen → Zelle vierzeilig, Zeile 124 px statt 103 px.** Gemessen mit dem p90-Namen in der echten Spur, nicht an der Fixture | **✗ M3 — entschieden, siehe unten** |
| Ersetzt Rahmen, Kopfzeile und Umschalter von `PositionenTab` ohne Funktionsverlust | Kopfzeile ✓ (ohne Rabatt-Spalte), Umschalter ✓ (Persistenz liegt jetzt beim Aufrufer, `defaultExpanded`/`onExpandedChange`), Zählung ✓, dazu neu die Probe im Fuß. **Rahmen: nicht ersetzt** — die App fasst den Kopf in eine `<Section>`, hier steht die Tabelle frei (M4) | **✗ M4** |

### Mängel

1. **„`summary_total` zählt mit" ist von keiner Fixture bewiesen (blockiert).**
   In `ALL` gibt es genau eine `summary_total`-Zeile (#7) — und die ist
   `disabled`, fällt also aus der Summe heraus. Die zweite Hälfte des Kriteriums
   hat damit in keiner Story einen Beleg. Dasselbe trifft `TotalMismatch`: die
   Abweichung entsteht dort nicht aus der Regel, sondern aus
   `invoiceNetTotal={linesNetTotal(ALL) - 612.4}`, einer gesetzten Zahl; der
   deutsche Story-Text behauptet trotzdem „40 Zeilen im Bestand sind
   Summenzeilen und zählen mit". Die Freigabe hatte genau diesen Fall als
   Fixture für `TotalMismatch` bestellt. Vorschlag: eine **nicht** deaktivierte
   `summary_total`-Zeile in `ALL` aufnehmen und `invoiceNetTotal` auf die Summe
   ohne sie setzen — dann ist die Abweichung genau dieser Betrag, und die Regel
   ist an ihrer eigenen Wirkung gemessen.
2. **Die Netto-Summe steht links (blockiert, geerbt aus 0072 M1).** In der
   Liste fällt es am stärksten auf: die Beträge der Spalte beginnen alle an der
   linken Kante und enden ausgefranst, während Kopfzelle und Fuß-Summe
   rechtsbündig stehen — die Probe im Fuß fluchtet mit nichts. Behebung gehört
   nach 0072; hier nur festgehalten, weil das Kriterium „Zahlen rechts" auch für
   diese Liste gilt.
3. **Die Bezeichnungs-Zelle ist bei p90 vierzeilig, nicht dreizeilig.**
   Gemessen bei 1104 / 1280 / 1600 px, mit dem p90-Namen in der echten
   Namensspur (402 bzw. 430 px): 92 Zeichen brechen auf zwei Zeilen, die Zelle
   wird vierzeilig, die Zeile 124 px statt 103 px. Bei 95 Zeichen dasselbe. Das
   ist der Widerspruch, den der „Befund beim Bauen" benennt — **entschieden
   unten; kein Grund, den Code zurückzugeben.**
4. **Die Liste hat keine Karte (blockiert).** Die Spec führt `Card` und
   `CardFoot` unter „Wiederverwenden" und „Setzt auf"; gebaut ist ein nacktes
   `<div class="v2illist">` mit eigenem Kopf und Fuß. Gemessen `Standard`:
   `border 0`, Hintergrund transparent, kein Schatten, kein `.v2card` innen oder
   außen. `Table.tsx` schreibt als Kernregel des Baukastens „**jede Tabelle
   lebt in einer Karte** … keine frei schwebenden Zeilen", und der Reiter, in
   dem die Liste landen soll, bringt keinen Rahmen mit: `.v2docview__body`
   (0071) ist `min-width: 0`, sonst nichts — die erste Registerkarte setzt ihren
   Rahmen selbst (`.v2doccard`). Auf der Seite schwebt die Tabelle also. Das
   ist zugleich die Hälfte des Kriteriums „Ersetzt **Rahmen**, Kopfzeile und
   Umschalter von `PositionenTab`", die die App über `<Section>` löst.
   Vorschlag: `Card` + `CardHead` (Zählung und Umschalter als `actions`) +
   `CardFoot` (Summe und Probe) nehmen — dann fällt auch das eigene
   Kopf-/Fuß-CSS weg. Wenn der Rahmen stattdessen nach 0071 gehört, ist das eine
   Änderung an dieser Spec, keine an dieser Abnahme.
5. **`onExpandedChange` wird in einem State-Updater gerufen.** Im
   `Alt+E`-Zweig steht `setExpanded((v) => { onExpandedChange?.(!v); return !v; })`.
   Ein Updater muss frei von Wirkungen sein; unter StrictMode läuft er zweimal
   und meldet zweimal nach außen. Die Wirkung war im Test nicht sichtbar (die
   Rückmeldung der Story stimmte), der Fehler ist latent. `switchTo` macht es
   drei Zeilen weiter oben richtig — dieselbe Form auch hier. Nicht blockierend.
6. **Der Leerfall trägt eine Chevron-Spur ohne Chevron.** `Empty` · Kopfzeile
   7 Zellen, erste 32 px, obwohl keine Zeile aufklappen kann. Der Umschalter
   wird über `canExpand` (`renderFacts` **und** ≥ 1 Zeile) richtig
   unterdrückt, die Spur nur über `renderFacts`. Kosmetik, nicht blockierend.

### Entscheidung zum Widerspruch (Befund beim Bauen)

**0072 bleibt, wie es ist: die Bezeichnung wird nicht gekürzt. Das Kriterium
dieser Spec ist das falsche und lautet künftig: die Bezeichnungs-Zelle darf bei
p90 vierzeilig sein (124 px), bei max sechszeilig; die Bezeichnung bricht um,
sie wird nicht gekürzt. Die sechs festen Spuren bleiben unverändert.** Vier
Gründe, alle gemessen:

1. **Für den Namen gibt es keine Grenze aus den Daten.** Das Profil setzt
   Kürzungsgrenzen dort, wo es sie messen konnte — Beschreibung 81,
   Buchungsgegenstand 161, Begründung 169. Für die Bezeichnung nennt es p50 34,
   p90 93, max 251 und **keine** Grenze. Eine Grenze käme also aus dem Layout,
   und genau das verbietet der Befund selbst („dann aber mit einer Grenze aus
   den Daten, nicht aus dem Layout").
2. **Die Spur, die „dreizeilig" bräuchte, gibt es auf der Seite nicht.**
   Gemessen: 402 px im Reiter bei 1104 px Karte, 430 px bei 1280 und 1600.
   Dreizeilig bliebe die Zelle erst ab rund 650 px Namensspur — dafür müsste die
   Tabelle breiter sein als die Belegkarte, in der sie steht.
3. **Der Preis ist klein und gedeckelt.** p50 1 Position, p90 5, max 22, kein
   Pager, keine Virtualisierung, keine feste Zeilenhöhe, von der etwas abhängt.
   Eine p90-Zeile wächst um 21 px; bei fünf Positionen sind das im schlimmsten
   Fall gut 100 px auf einer Seite, die ohnehin scrollt. V1 meint die **Dichte**
   der Zeile, und `density="wide"` ist genau die Stufe, die es für „Titel plus
   Unterzeile" gibt — nicht ein Verbot, dass ein Name zwei Zeilen braucht.
4. **Kürzen kostet genau das, wofür die Spalte da ist.** Die Sachbearbeiterin
   sucht die eine Zeile, die falsch liegt. Zwei Wartungsverträge derselben
   Anlage unterscheiden sich erst hinter Zeichen 60 („… Grundleistung je
   Quartal" gegen „… Filterwechsel"); ein Schnitt bei 60 oder 80 machte sie
   ununterscheidbar, und der Aufklapper trägt den Namen nicht noch einmal.

Die Umformulierung des Kriteriums gehört in diese Spec und ist Sache dessen,
der sie führt — eine Abnahme ändert keine Kriterien. Bis dahin steht das
Kriterium hier als **nicht erfüllt** in der Tabelle, und der Bau wird deswegen
**nicht** zurückgegeben.

Nachtrag: Während dieser Abnahme ist unten der Abschnitt „Nach der Abnahme — der
Kriterien-Widerspruch ist entschieden" dazugekommen (designsystem-f0 im Auftrag
des Owners, gleiches Datum). Er entscheidet dasselbe — nicht kürzen, die Zelle
wächst — und formuliert das Kriterium bereits um. Die Messungen hier sind
unabhängig davon entstanden und stützen ihn: 402 px Namensspur bei der Breite,
die der Reiter auf der Seite wirklich hat, nicht nur die 472 px des
Story-Rahmens.

**Urteil: zurück.** Blockierend sind die Mängel 1, 2 (geerbt) und 4. Mangel 3
ist gemessen und entschieden, Mängel 5 und 6 sind klein.

Abgenommen von / am: Claude (Abnahme, nicht Bau), 2026-09-07 · Offene Punkte:
M1, M2, M4 (blockierend), M3 (Kriterium umformulieren), M5, M6.

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Job-Satz, Mechanik (p50 1, p90 5, max 22 — kein Pager, kein Filter, kein Ladefall), Leerfall und „ersetzt" aus dem Profil; kein `DataTable`, die Begründung hält; passt in den `children`-Slot von `SourceDocumentView`. Entscheide: die Summe läuft über die **nicht deaktivierten** Zeilen — `disabled` sind vom Beleg-Kollaps ersetzt, `virtual_aggregate` ist ihr Sammel-Item, sonst zählt jede kollabierte Rechnung doppelt · `summary_total`-Zeilen (40 im Bestand) werden mitsummiert, die Abweichung ist genau die Information der Probe; `TotalMismatch` nimmt diesen Fall als Fixture · Taste: eigener `keydown`-Listener für Alt+E wie im `JournalEntryEditor`, Taste als Text im Segment-Label („Erweitert · Alt+E") — `useHotkeys` verwirft Alt, `Segmented` hat keinen `Kbd`-Slot; `E`, weil J/K dem Pager gehören.

Vor dem Bau in die Spec: (a) Summen-Kriterium: „Summe der `lineTotalNetValue` über die nicht deaktivierten Zeilen", `Edges` (zwei deaktivierte plus Aggregat) beweist es nachgerechnet; (b) `invoiceNetTotal` mit Quelle `InvoiceDetail.subtotalValue` (netto; `totalValue` ist brutto); (c) Tastenmechanik und Ort der Taste wie entschieden; (d) Chevron-Spur `var(--v2-tbl-pick)` und leere Kopfzelle bei `renderFacts`; Umschalter nur bei ≥ 1 Zeile (V14); (e) Kriterium „einzeilig" → „drei Zeilen, die Bezeichnung bricht bei 93 Zeichen nicht um" (0072); (f) React-Key ist `position` (UNIQUE je Rechnung), `InvoiceLineItem` hat keine `id`; (g) Abschnitt „Offene Fragen" nachtragen.

Register-Kosmetik: Abschnitt E nennt noch „Positionen und Vorsteuer (0072)" — die Vorsteuer gehört der Rechnung, 0072 hat `VorsteuerTab` gestrichen; und 0078 sagt „0072 (Kontenkandidaten mit Konfidenz)" — die Zeile trägt `fundUsageConfidence`, keine Kontokandidaten.

## Nach der Abnahme — der Kriterien-Widerspruch ist entschieden (2026-09-07)

**Entscheid (designsystem-f0 im Auftrag des Owners): nicht kürzen, die Zelle
wächst.** Damit gilt statt des Kriteriums zur Zeilenhöhe:

- [ ] Die Bezeichnung **bricht um und wird nicht gekürzt**; die Zeilenhöhe
      folgt dem Inhalt. Gemessen in der 472-px-Spur: 19 Zeichen → 3 Zeilen
      (102 px), **p90 (92 Zeichen) → 4 Zeilen (124 px)**, max (254 Zeichen) →
      6 Zeilen (184 px). Die Spaltenbreiten halten dabei bei 1280 px und
      1600 px.

Das Kriterium darüber („die Bezeichnungs-Zelle bleibt bei 93 Zeichen
dreizeilig") ist damit **abgelöst** — es widersprach dem Kriterium von 0072,
die Bezeichnung nicht zu kürzen.

Der Grund gehört dazu, sonst kippt die Entscheidung beim nächsten Mal zurück:
**ein Positionsname ist Inhalt, keine Kennung.** Ihn zu kürzen versteckt genau
das Wort, nach dem die Sachbearbeiterin sucht — und die Liste hat p90 fünf
Zeilen, Höhe ist hier billig. Anders läge es in einer langen Liste, in der
jede Zeile gleich hoch sein muss, um überflogen zu werden.

Der Abschnitt „Befund beim Bauen" darunter bleibt stehen: er trägt die
Messung, aus der die Entscheidung entstanden ist.

## Befund beim Bauen (2026-09-07): zwei Kriterien widersprechen sich

Gemessen in `InvoiceLineRow` → `Edges`, Namensspur 472 px (Rahmen 1.100 px,
502 px gehen an die fünf festen Spuren):

| Bezeichnung | Zeilen in der Zelle | Zeilenhöhe |
|---|---|---|
| 19 Zeichen | 3 (Name · Beschreibung · Streifen) | 102 px |
| **92 Zeichen (p90)** | **4** — der Name bricht um | 124 px |
| 254 Zeichen (max) | 6 | 184 px |

Das Kriterium dieser Spec verlangt, dass die Zelle bei p90 **dreizeilig**
bleibt; das Kriterium von 0072 verlangt, dass die Bezeichnung **nicht**
gekürzt wird. Beides zugleich geht nur mit einer Namensspur von rund 650 px,
also einer Tabelle ab etwa 1.150 px — auf der Seite hat der Reiter aber die
Breite der Belegkarte (1.104 px bei 1440 × 900, gemessen in 0071).

**Gebaut ist die Auslegung, die die Spec sonst trägt:** die Bezeichnung wird
nicht gekürzt, die Zelle wächst. Eine p90-Zeile ist damit 124 statt 102 px
hoch — 22 px, nicht die 20 px, die V1 als Zeilenhöhe meint, sondern der
Umbruch eines Namens, den zu kürzen den Zweck der Spalte verfehlte.

Der Abnahme gehört die Entscheidung: entweder das Kriterium hier lautet
künftig „vier Zeilen bei p90 sind in Ordnung, sechs bei max auch", oder 0072
bekommt eine Kürzung der Bezeichnung — dann aber mit einer Grenze aus den
Daten, nicht aus dem Layout.

## Nach der Abnahme (2026-09-07): sechs Mängel, drei blockierend

**M1 erledigt — „`summary_total` zählt mit" war von keiner Fixture bewiesen.**
Die einzige Summenzeile im Bestand der Stories war selbst `disabled` und fiel
damit aus der Summe; die Abweichung in `TotalMismatch` entstand aus einer
gesetzten Zahl, nicht aus der Regel. Neu ist `SUMMARY_TOTAL` — eine **aktive**
`summary_total`-Zeile über 1.475,60 €. Gemessen: 23 Zeilen, Summe **5.881,90 €**,
Abweichung **+1.475,60 €** — genau der Betrag der Summenzeile. Die Regel steht
jetzt hinter der Story, nicht neben ihr.

**M2 erledigt** — mit M1 aus 0072: die Fuß-Summe fluchtet wieder mit der
Netto-Spalte.

**M4 erledigt — die Liste hatte keine Karte.** Gebaut war ein nacktes `div`;
auf der Seite hätte die Tabelle geschwebt, gegen die Regel aus `Table.tsx`
(„jede Tabelle lebt in einer Karte"). Jetzt `Card` mit `CardHead` (Titel,
Vorratszähler, Umschalter) und `CardFoot` (die Probe). Gemessen: `.v2card` mit
1 px Rahmen, Kopf „Positionen · 23 Positionen · Kompakt · Erweitert · Alt+E".
Das eigene Kopf- und Fuß-CSS ist damit entfallen.

**M5 erledigt** — `onExpandedChange` wurde im State-Updater gerufen und liefe
unter StrictMode zweimal. Der Tastenweg geht jetzt über dieselbe Funktion wie
der Klick; den aktuellen Stand liest er aus einer Ref, statt ihn einzufangen.

**M6 erledigt** — der Leerfall trug eine Chevron-Spur ohne Chevron. Gemessen:
`Empty` hat jetzt **6** Kopfzellen, `TotalMismatch` 7.

**M3 bleibt** — die Bezeichnungs-Zelle ist bei p90 vierzeilig. Das ist der
Widerspruch, den der Abschnitt „Nach der Abnahme — der Kriterien-Widerspruch
ist entschieden" darüber auflöst; die Abnahme kommt unabhängig zum selben
Ergebnis und liefert die Zahl aus der **echten Reiterbreite** nach (Namensspur
402 px, nicht die 472 des Story-Rahmens).

**Aus den Befunden am Set mitgenommen:**

- `AmountCell` gab bei `value === null` ein `<span class="v2muted">—</span>`
  **ohne** `v2num` zurück — der Strich stand links in einer rechtsbündigen
  Spalte, in **jeder** v3-Tabelle mit unbekannten Beträgen. Behoben in
  `primitives/Cells.tsx`; gemessen in `Minimal`: Strich 829–842, Zelle endet
  842.
- Der `Alt+E`-Listener prüft jetzt `isTyping` aus `primitives/hotkey.ts` — in
  einem Textfeld ist der Druck Tippen, kein Befehl (V14). `matchesKey` selbst
  ist hier nicht brauchbar: es verwirft jede Kombination mit Alt.
- **Offen und benannt:** zwei Listen auf einer Seite schalten weiterhin
  gemeinsam, weil der Listener am `window` hängt. Das trifft auch den
  `JournalEntryEditor` und ist eine Frage an die Hausregel, nicht an diese
  Liste. Ebenso offen: `.v2tbl :is(th,td) > .v2num` greift nur beim direkten
  Kind — jede Hülle um eine `AmountCell` hebt die Ausrichtung still auf, und
  der Fehler sieht im Code richtig aus (genau M1 aus 0072). Ein
  `:is(th,td) .v2num` wäre die robustere Regel; das ist eine Änderung an jeder
  Tabelle des Sets und gehört in eine eigene Aufgabe.

## Zweite Abnahme (2026-09-07): freigegeben

Gemessen am laufenden Storybook (6107) auf Commit `829d477`. Die Summen sind
aus `fixtures.ts` **selbst nachgerechnet** und gegen den gerenderten Fuß
gehalten; die Taste ist über `Input.dispatchKeyEvent` gedrückt, je Schritt ein
eigener `Runtime.evaluate`. Layout zusätzlich in der Breite, die der Reiter auf
der Seite hat.

### Die sechs Mängel der ersten Runde

| Mangel | Messung | Ergebnis |
|---|---|---|
| M1 „`summary_total` zählt mit" war von keiner Fixture bewiesen (blockierte) | `TotalMismatch` · 23 Zeilen, Fuß „Summe der Positionen · **5.881,90 €** · weicht vom Rechnungsbetrag ab: **+1.475,60 €**". Selbst nachgerechnet: die nicht deaktivierten Zeilen von `ALL` ergeben 4.406,30 € (ausgelassen #7 mit 612,40 € und #20 mit 0,00 €, beide `disabled`), dazu die **aktive** Summenzeile `SUMMARY_TOTAL` mit 1.475,60 € → 5.881,90 €; `invoiceNetTotal` ist 4.406,30 € → die Abweichung ist genau der Betrag der Summenzeile. Die Regel steht jetzt hinter der Story | ✓ behoben |
| M2 Netto-Summe stand links (geerbt aus 0072) | `Edges` @1280/1440/1600 · Text der Netto-Summe endet bei **1077**, die Kopfzelle „Netto-Summe" ebenfalls bei 1077; die Fuß-Summe fluchtet mit der Spalte | ✓ behoben |
| M3 Bezeichnungs-Zelle vierzeilig bei p90 | entschieden (nicht kürzen, die Zelle wächst) — gemessen in der 472-px-Spur: 19 Z. → 101,6 px, p90 92 Z. → 123,5 px, max 254 Z. → 184 px; in der echten Karten-Spur (428 px) wächst die Maximal-Zeile auf 204,9 px | kein Mangel |
| M4 die Liste hatte keine Karte (blockierte) | `Standard`/`Edges` · `.v2card` mit **1 px solid rgb(221,226,232)**, Radius 6 px, Fläche `rgb(255,255,255)`; `.v2card__h` trägt „Positionen · 23 Positionen · Kompakt · Erweitert · Alt+E"; `.v2card__f` mit 1 px Oberkante auf `rgb(250,251,252)`. Karte 1.060 px breit bei 1280, 1440 und 1600, `scrollWidth − clientWidth = 0` — kein Überlauf. Eigenes Kopf-/Fuß-CSS entfallen (`.v2illist__head`/`__foot` sind nirgends mehr im Baum) | ✓ behoben |
| M5 `onExpandedChange` im State-Updater | Der Tastenweg ruft dieselbe Funktion wie der Klick; je Druck genau **eine** Rückmeldung (Story-Zeile wechselt einmal je Druck) | ✓ behoben, siehe Mangel 2 |
| M6 Chevron-Spur im Leerfall | `Empty` **6** Kopfzellen, 0 `.v2tbl__chev`; `Single`, `AllExpanded`, `TotalMismatch`, `Edges` je 7 | ✓ behoben |

### Alt+E, mit echtem Tastendruck

`AllExpanded` · `Input.dispatchKeyEvent` mit `modifiers:1`, `code:"KeyE"`, je
Schritt neu gelesen:

| Schritt | offene Aufklapper | Segment | Rückmeldung der Story |
|---|---|---|---|
| Start | 5 | Erweitert · Alt+E | Erweitert |
| **Alt+E** | **0** | Kompakt | Kompakt |
| **Alt+E** | **5** | Erweitert · Alt+E | Erweitert |
| Klick auf ein einzelnes Chevron | 4 | **Erweitert · Alt+E** | Erweitert |

**Die Probe im Textfeld:** in ein echtes `<input type="text">` fokussiert
bleibt derselbe Druck **wirkungslos** (5 offen, Segment unverändert, das Feld
bleibt leer); in einem `<textarea>` ebenso. Nach dem Verlassen des Feldes
schaltet derselbe Druck wieder auf 0 / „Kompakt". `isTyping` greift also.

### Was in Runde 1 hielt und weiter hält (nachgemessen)

| Kriterium | Messung |
|---|---|
| Zeilen nach `position` aufsteigend | `Edges` bekommt `[...ALL].reverse()` · gerendert #1 … #22 in Folge |
| Kein Pager, keine Sortier-Knöpfe, keine Auswahlspalte | `Edges` · 22 Zeilen, 0 Pager-Knoten, 0 `<button>` in einer Kopfzelle, 0 `input[type=checkbox]` |
| Ohne `invoiceNetTotal` keine Probe, aber die Summe | `Standard` · Fuß „Summe der Positionen · 1.641,30 €", kein Probesatz. Nachgerechnet: 83,80 + 359,60 + 70,50 + 1.117,50 + 9,90 = 1.641,30 |
| Abweichung mit einem Wort | `TotalMismatch` · „weicht vom Rechnungsbetrag ab: +1.475,60 €", Farbe `rgb(140,96,30)` auf `rgb(250,251,252)`, das Wort steht **vor** der Zahl |
| Übereinstimmung, wenn sie stimmt | `Edges` mit `invoiceNetTotal = linesNetTotal(ALL)` · Fuß „4.406,30 € · stimmt mit dem Rechnungsbetrag überein" |
| Ohne `renderFacts` nichts davon | `Standard` · 6 Kopfzellen, Spuren `56 · 472 · 110 · 120 · 84 · 132`, 0 `.v2tbl__chev`, 0 `<button>`, kein `Segmented`, „Alt+E" kommt im Text nicht vor |
| Der Leerfall benennt den Befund | `Empty` · „Für diesen Beleg wurden keine Positionen erkannt." plus „Das ist kein Erfolg, sondern selten und meist ein Problem der Extraktion: 4 von 318 Rechnungen im Bestand. Der Beleg lässt sich erneut lesen."; kein Fuß, kein Umschalter |
| Deaktivierte Zeilen sichtbar und gedämpft | `Edges` und `TotalMismatch` · je 2 Zeilen mit `rgb(113,113,113)` gegen `rgb(45,45,45)`, beide mit der Plakette „deaktiviert" |
| Spaltenbreiten halten | Spuren `32 · 56 · 428 · 110 · 120 · 84 · 132` px, identisch bei 1280, 1440 und 1600; die Karte bleibt 1.060 px |
| `pnpm typecheck`, `pnpm build`, `pnpm check:icons` | Exit 0, 0, 0 |
| Im Browser angesehen | alle sechs Stories, 0 Fehler/Warnungen |

**Story-Deckung:** 6/6 wie abgeleitet, Ausschlüsse begründet. Der Befund an der
Spec aus Runde 1 bleibt: die Ableitung zählt „1 im Einsatz", die Story-Tabelle
führt keine solche Story.

### Mängel (beide nicht blockierend)

1. **Das Summen-Kriterium nennt die falsche Story.** Es lautet „…;
   `summary_total` zählt mit (Story `Edges` mit zwei deaktivierten und der
   Aggregat-Zeile, nachgerechnet)". `ALL` enthält weiterhin **keine aktive**
   Summenzeile — die einzige (`DEVIATIONS` #7) ist `disabled`. Bewiesen wird
   die Regel jetzt in `TotalMismatch`, mit `SUMMARY_TOTAL`. Die Sache ist
   gemessen und stimmt; nur die Klammer zeigt auf die falsche Story. Eine
   Abnahme ändert keine Kriterien — Vorschlag an den, der die Spec führt:
   Klammer auf „Story `TotalMismatch` (aktive Summenzeile) und `Edges` (zwei
   deaktivierte plus Aggregat), beide nachgerechnet".
2. **`expandedRef.current = expanded` wird während des Renderns geschrieben.**
   `InvoiceLineList.tsx:60`. Das ist die Stelle, an der M5 gelandet ist: der
   Wirkungsaufruf ist aus dem State-Updater heraus, der Ref-Schreibzugriff aber
   in den Render-Lauf hinein. React verlangt, dass während des Renderns weder
   in eine Ref geschrieben noch aus ihr gelesen wird; ein abgebrochener Lauf
   kann die Ref auf einen Wert setzen, der nie festgeschrieben wurde, und
   `Alt+E` schaltete dann vom falschen Stand aus. Im Test nicht sichtbar
   (Doppel-Render unter StrictMode ist hier idempotent), der Fehler ist latent
   — dieselbe Art wie M5. Vorschlag: `useEffect(() => { expandedRef.current =
   expanded; }, [expanded])`.

**Urteil: freigegeben.** Die drei blockierenden Mängel M1, M2 und M4 sind
behoben und nachgemessen, M3 ist entschieden, M5 und M6 sind erledigt; nichts
aus Runde 1 ist dabei zerbrochen.

Abgenommen von / am: Claude (zweite Abnahme, nicht Bau), 2026-09-07 · Offene
Punkte: die Klammer des Summen-Kriteriums, der Ref-Schreibzugriff im Render
(beide nicht blockierend).

## Freigegeben (2026-09-07, zweite Runde)

Alle Kriterien auf ✓. Die Summe ist von der Abnahme selbst nachgerechnet
worden: nicht deaktivierte Zeilen aus `ALL` = 4.406,30 € (ohne #7 mit 612,40
und #20 mit 0,00), plus die aktive Summenzeile 1.475,60 = **5.881,90 €**, und
die Abweichung im Fuß ist genau der Betrag der Summenzeile. `Alt+E` mit echtem
Tastendruck: 5 → 0 → 5; in einem `input` und in einem `textarea` bleibt
derselbe Druck wirkungslos, danach schaltet er wieder — `isTyping` greift.

**Zwei Nachträge, nicht blockierend:**

- **Erledigt:** `expandedRef.current = expanded` stand **während des Renderns**
  — genau die Stelle, an der M5 gelandet war: die Wirkung raus aus dem
  State-Updater, dafür ein Ref-Schreibzugriff in den Render hinein. Ein
  abgebrochener Lauf hätte den Tastenweg von einem Stand schalten lassen, den
  React nie festgeschrieben hat. Der Schreibzugriff steht jetzt in einem
  `useEffect`.
- **Offen, gehört dem Auftraggeber:** das Summen-Kriterium nennt als Nachweis
  die Story `Edges`; bewiesen wird die Regel aber in `TotalMismatch`, weil
  `ALL` keine **aktive** Summenzeile enthält. Die Sache stimmt, die Klammer
  zeigt auf die falsche Story — **ein Kriterium ändert weder der Bauende noch
  der Abnehmende.**
