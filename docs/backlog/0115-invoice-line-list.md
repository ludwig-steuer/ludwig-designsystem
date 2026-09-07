# 0115 · `InvoiceLineList`

| | |
|---|---|
| Status | in Arbeit |
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
- [ ] Die Spaltenbreiten halten bei 1280 px und 1600 px; die Bezeichnungs-Zelle bleibt bei 93 Zeichen (p90) **dreizeilig** — Name, Beschreibung, Streifen — und bricht nicht in eine vierte um (gegen den Wertebereich gemessen, nicht gegen die Fixtures)
- [ ] Ersetzt Rahmen, Kopfzeile und Umschalter von `PositionenTab` ohne Funktionsverlust — außer der Rabatt-Spalte, die dort in jeder Zeile leer ist (B4)

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …

## Freigabe (2026-09-07, designsystem-f0 im Auftrag des Owners)

**Urteil: freigeben mit Änderung.** Job-Satz, Mechanik (p50 1, p90 5, max 22 — kein Pager, kein Filter, kein Ladefall), Leerfall und „ersetzt" aus dem Profil; kein `DataTable`, die Begründung hält; passt in den `children`-Slot von `SourceDocumentView`. Entscheide: die Summe läuft über die **nicht deaktivierten** Zeilen — `disabled` sind vom Beleg-Kollaps ersetzt, `virtual_aggregate` ist ihr Sammel-Item, sonst zählt jede kollabierte Rechnung doppelt · `summary_total`-Zeilen (40 im Bestand) werden mitsummiert, die Abweichung ist genau die Information der Probe; `TotalMismatch` nimmt diesen Fall als Fixture · Taste: eigener `keydown`-Listener für Alt+E wie im `JournalEntryEditor`, Taste als Text im Segment-Label („Erweitert · Alt+E") — `useHotkeys` verwirft Alt, `Segmented` hat keinen `Kbd`-Slot; `E`, weil J/K dem Pager gehören.

Vor dem Bau in die Spec: (a) Summen-Kriterium: „Summe der `lineTotalNetValue` über die nicht deaktivierten Zeilen", `Edges` (zwei deaktivierte plus Aggregat) beweist es nachgerechnet; (b) `invoiceNetTotal` mit Quelle `InvoiceDetail.subtotalValue` (netto; `totalValue` ist brutto); (c) Tastenmechanik und Ort der Taste wie entschieden; (d) Chevron-Spur `var(--v2-tbl-pick)` und leere Kopfzelle bei `renderFacts`; Umschalter nur bei ≥ 1 Zeile (V14); (e) Kriterium „einzeilig" → „drei Zeilen, die Bezeichnung bricht bei 93 Zeichen nicht um" (0072); (f) React-Key ist `position` (UNIQUE je Rechnung), `InvoiceLineItem` hat keine `id`; (g) Abschnitt „Offene Fragen" nachtragen.

Register-Kosmetik: Abschnitt E nennt noch „Positionen und Vorsteuer (0072)" — die Vorsteuer gehört der Rechnung, 0072 hat `VorsteuerTab` gestrichen; und 0078 sagt „0072 (Kontenkandidaten mit Konfidenz)" — die Zeile trägt `fundUsageConfidence`, keine Kontokandidaten.
