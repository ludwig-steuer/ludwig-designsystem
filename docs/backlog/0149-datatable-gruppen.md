# 0149 · `DataTable` mit Abschnitten

| | |
|---|---|
| Status | gebaut 2026-09-09 — Abnahme offen (nicht durch den Bauenden) |
| Stufe | `patterns/` (`DataTable`), dazu eine Prop an `primitives/Table` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja: benannte Abschnitte in einer Tabelle kennen keine Entität |
| Quelle | Auftrag `app-ee` im Namen des Owners, 2026-09-09 — `ludwig/app`, `docs/backlog/F186-buchungsreview-uebersicht.md` Teil A (`a3032a79`) |
| Ersetzt | den Ausweg, bei Abschnitten `DataTable` zu verlassen und `Card`/`Table`/`GroupRow` von Hand zu stellen — samt eigener Auswahl und eigenem Leerzustand |
| Blockiert | T186.2, die Buchungsübersicht in Schritt 3 der Stapelabnahme |
| Spec von / am | Claude, 2026-09-09 |

## Ziel

Eine Tabelle zeigt ihre Zeilen in benannten Abschnitten: Kopf mit Wort,
Anzahl und einer Kennzahl, darunter die Zeilen. Die Sachbearbeiterin sieht
„Aufwand 42 · 8.412,55 €" und weiß, worauf sie schaut, bevor sie eine einzelne
Zeile liest — und kann den ganzen Abschnitt in einem Griff auswählen.

`GroupRow` zeichnet die Kopfzeile seit dem Umzug nach `primitives/Table.tsx`
und **hat keinen einzigen Aufrufer**. Der Baustein ist da, es fehlt der Weg zu
ihm.

## Zuschnitt: erweitern, nicht danebenstellen

Eine `GroupedDataTable` hätte dieselbe Auswahl, dasselbe Paging und dieselben
fünf Zustände ein zweites Mal. Der Unterschied ist **eine Zeile mehr zwischen
den Zeilen**. Nach §4 ist das keine zweite Komponente.

**Harte Grenze:** ohne `groups` verhält sich `DataTable` **zeichengleich** wie
heute. Dreizehn Listenseiten hängen daran, und keine davon darf sich ändern,
weil eine vierzehnte Abschnitte bekommt.

## Entscheidung 1 — die Semantik des Gruppenkopfs

Der Auftrag lässt offen, ob `role="rowgroup"` mit `aria-label` oder die
`GroupRow` als `<th scope="rowgroup">`. **Es wird das zweite, und die Gruppe
bekommt dafür ein eigenes `<tbody>`.**

Der Grund ist, dass die erste Fassung *falsch* wäre, nicht nur schwächer.
`Table` legt heute **ein** `<tbody>` um alle Zeilen. `scope="rowgroup"` heißt
laut HTML „dieser Kopf gilt für alle **übrigen** Zellen dieser Zeilengruppe" —
mit einem einzigen `<tbody>` würde der Kopf des ersten Abschnitts also auch
die Zeilen des zweiten, dritten und vierten beanspruchen. Fünf Abschnitte in
einer Zeilengruppe sind keine fünf Gruppen.

Und `role="rowgroup"` mit `aria-label` wäre das Nachbauen dessen, was
`<tbody>` von sich aus ist — dieselbe Sorte Umweg wie ein
JavaScript-Aufklapper neben `<details>`. Ein `aria-label` an einer
Zeilengruppe wird von Vorlesern zudem uneinheitlich angesagt; ein `<th>` ist
eine Kopfzelle und wird als solche gelesen.

**Also: je Abschnitt ein `<tbody>`, dessen erste Zeile ein
`<th scope="rowgroup" colSpan>` trägt.** Kein ARIA, weil die Elemente es
schon können.

`Table` bekommt dafür eine Prop `sections` — ohne sie das heutige eine
`<tbody>` um `children`, mit ihr je Abschnitt eines. Keiner der **52**
heutigen `Table`-Aufrufer übergibt sie, also ändert sich für sie nichts.

## Entscheidung 2 — `satzart` kommt **nicht** in die Registry

Der Vorschlag des Auftrags ist richtig, und es gibt einen Grund dafür, der
über „ist kein Zustand" hinausgeht.

Die Registry gibt jedem Wert ein `kind`, und `kind` ist in diesem Set die
**Kritikalitätsstufe** — Farbe bedeutet hier nichts anderes (V6). Eine
Klassifikation hat keine Kritikalität: Aufwand ist nicht dringender als Erlös.
Fünf Werte mit `kind: "neutral"` wären fünf farblose Marken, also ein
`StatusBadge`, der nie etwas sagt — und der Vorleser bekäme mit „Status:
Aufwand" eine Aussage, die es nicht gibt.

**Also `Badge tone="neutral"`, wie `Schritt3Einzel.tsx` es heute macht.** Die
Beschreibungen aus `core/accounting/entry-kind.ts` gehören trotzdem gezeigt —
über `labelAside` an den Gruppenkopf, wo sie **einmal je Abschnitt** stehen
und nicht einmal je Zeile.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `groups` | `readonly TableGroup<T>[]` | statt `rows` | Ohne sie ist die Tabelle flach wie heute. Mit ihr je Gruppe ein Abschnitt | `WithGroups` |
| `rows` | `T[]` | statt `groups` | Unverändert — nur nicht mehr in der Basis, sondern im flachen Zweig | `Filled` |

```ts
export interface TableGroup<T> {
  /** Stabiler Schlüssel — auch der `key` des Abschnitts. */
  key: string;
  /** Das Wort im Kopf. Normalschreibung wie Spaltenköpfe (A2). */
  label: string;
  /** Neben dem Wort: die Erklärung der Klassifikation (Z4). */
  labelAside?: ReactNode;
  /** Die Zeilen, **schon sortiert** — die Tabelle sortiert nicht (E2). */
  rows: readonly T[];
  /** Rechts im Kopf: Anzahl, Summe. Vom Aufrufer gerechnet. */
  aside?: ReactNode;
  /** Was steht, wenn `rows` leer ist. Ohne sie fällt die Gruppe **weg**. */
  emptyHint?: string;
}
```

**`groups` und `pager` schließen sich im Typ aus.** Eine Gruppe, die über zwei
Seiten geht, ist keine Gruppe mehr — und ein Ausschluss, der nur im Kommentar
steht, wird vom ersten Aufrufer verletzt, der ihn nicht liest (die Lehre aus
0121/0122 und 0136).

### Wie der Ausschluss steht — gemessen, nicht geraten

Der naheliegende Weg, eine **zweite** Union neben die vorhandene
(`rowHref | expand`) zu stellen, funktioniert nicht: das Kreuzprodukt hat vier
Zweige, und `groups?: never` im flachen Zweig macht `groups` zur
Diskriminante, die kein heutiger Aufrufer setzt. TypeScript wählt dann
immer den falschen Zweig, und der Ausdruck `{...(expand ? { expand } : {})}` —
auf dem dreizehn Listenseiten stehen — bricht:

```
BankTransactionList.tsx(116,6): TS2322 … Property 'groups' is missing in type
```

Nachgemessen an einem Minimalbeispiel: zwei Zweige gehen, drei gehen, das
Kreuzprodukt aus zwei Unions geht nicht.

**Also trägt der Ausschluss ein Pflichtfeld:** `rows` und `groups` sind die
Diskriminante, und `pager` steht im flachen Zweig.

```ts
type DataTableShape<T> =
  | { rows: T[]; pager?: TablePager; groups?: never }
  | { groups: readonly TableGroup<T>[]; rows?: never; pager?: never };
```

Jeder heutige Aufrufer übergibt `rows`, also wählt TypeScript für ihn sofort
den ersten Zweig. `groups` **und** `pager` ist ein Typfehler, `groups` **und**
`rows` ebenso — und die Meldung nennt beim Namen, was nicht zusammengeht.

**Kann bewusst nicht:**

- **Sortieren oder rechnen.** Die Zeilen kommen sortiert, Anzahl und Summe
  kommen fertig. Ein Sortier-Link im Spaltenkopf sortiert **innerhalb** der
  Gruppen; die Reihenfolge der Gruppen kommt aus `groups`, nie aus `sort`.
- **Gruppen auf- und zuklappen.** Nicht bestellt, und ein Abschnitt, den man
  zuklappen muss, war zu lang (A12).
- **`"use client"` werden.** Die Auswahl läuft über die vorhandene
  `SelectionScope`-Insel, wie heute (E3).

## Verhalten

| Fall | Was passiert |
|---|---|
| Gruppe leer, **mit** `emptyHint` | Kopf steht, darunter der Satz. Die Leere ist die Auskunft |
| Gruppe leer, **ohne** `emptyHint` | Die Gruppe fällt ganz weg. Eine Überschrift über nichts ist Rauschen |
| **Alle** Gruppen leer | `empty` bzw. `filtered` greift wie heute — nicht fünf leere Köpfe |
| `selection` gesetzt | Jeder Gruppenkopf trägt ein Kästchen für **genau** seine Zeilen; Teilauswahl ist `indeterminate`. Das Kästchen im Spaltenkopf meint weiter **alle** |

## Stories

| Story | Beweist |
|---|---|
| `WithGroups` | Drei Abschnitte mit Wort, Anzahl und Summe — der Normalfall |
| `GroupEmpty` | `emptyHint` greift; daneben eine leere Gruppe **ohne** ihn, die wegfällt; rechts alle Gruppen leer |
| `GroupSelection` | Kopf-Kästchen, Teilauswahl als `indeterminate`, Sammelaktion in der Leiste |
| `GroupsInUse` | Die Buchungsübersicht aus T186.2: fünf Satzarten mit Beschreibung am Kopf |

Zwei Namen aus dem Entwurf sind beim Bauen gefallen, weil sie doppelt gewesen
wären: `WithoutGroups` ist die vorhandene Story **`Filled`** — sie steht
unverändert da und ist genau deshalb der Nachweis, dass die flache Tabelle
sich nicht geändert hat. `InUse` gibt es in dieser Datei schon, die neue heißt
darum `GroupsInUse`.

## Fremdmessung aus `ludwig/app` (nicht die Abnahme)

`app-ee` hat am 2026-09-10 gegen den Submodul-Stand `d74dc47` gemessen — also
gegen den neuen Vertrag, `groups?: never` und `rows?: never` im Checkout
nachgesehen:

| Lauf | Ergebnis |
|---|---|
| `pnpm --filter @ludwig/web typecheck` | grün, keine Ausgabe — deckt jeden `DataTable`-Aufrufer in `apps/web` ab, die dreizehn Listenseiten eingeschlossen |
| `pnpm --filter @ludwig/web test` | 405 Dateien, 3225 Tests, 1 übersprungen, grün |
| `lint` | 0 Fehler, 46 Warnungen, alle aus dem Alt-Bestand (`@/ui/components`-Importe), keine aus `DataTable` |

**Was das trägt:** die harte Grenze der Spec auf **Typ- und Testebene** — kein
Aufrufer der App muss angefasst werden, obwohl `rows` aus der Basis in den
flachen Zweig gewandert ist.

**Was es nicht trägt:** kein Blick im Browser (dort läuft kein Dev-Server) und
nichts außerhalb von `apps/web`. „Zeichengleiches DOM" bleibt damit offen und
gehört in die Abnahme unten; die Story `Filled` ist dafür der Ort.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px in der Komponente; Status nur über Registry
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen

Variabel (aus dieser Spec):

- [ ] **Ohne `groups` ist das DOM zeichengleich mit vorher** — ein `<tbody>`,
      dieselben Zeilen (`WithoutGroups`, gegen den Stand vor 0149 verglichen)
- [ ] Je Gruppe **ein** `<tbody>`, dessen erste Zeile ein
      `<th scope="rowgroup">` ist (`WithGroups`, im DOM)
- [ ] Kein `role="rowgroup"` und kein `aria-label` an einer Zeilengruppe
      (`grep` — die Elemente können es selbst)
- [ ] `groups` **und** `pager` ist ein **Typfehler**, kein dokumentierter
      Vorrang
- [ ] Leere Gruppe ohne `emptyHint` erscheint **nicht** im DOM (`GroupEmpty`)
- [ ] Alle Gruppen leer → **ein** Leerzustand, keine Köpfe (`GroupEmpty`)
- [ ] Das Kopf-Kästchen wählt genau seine Gruppe; Teilauswahl ist
      `indeterminate` (`GroupSelection`, `input.indeterminate` gemessen)
- [ ] `DataTable.tsx` trägt **kein** `"use client"` (`head -1`)

## Abnahme

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| | | |
