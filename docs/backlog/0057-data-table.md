# 0057 · DataTable — die Listenseite als eine Klammer

| | |
|---|---|
| Status | fertig |
| Stufe | `patterns/` — Gruppe Arbeitsfläche, neben `MasterDetail` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → ja, jede Anwendung mit Listenseiten: Spalten, Seite, Sortierung, Auswahl |
| Quelle | Anfrage Owner 2026-09-04 („Datatable mit Sortierung, Filter, Pagination, Checkliste, Bulk-Aktionen, Seitengröße, drei Dichten") · `design-guidelines.md` V1 V5 V9 V11 · I4 I5 I7 I10 I11 · §11 Tabelle (`SelectionBar`/`SelectCell`, `ClickRow`, `TableLoading`/`ErrorRow`) · Zählung `ludwig/app` 2026-09-04: **13** Listenseiten mit `Pagination` (`cases`, `entries`, `accounts`, `accounts/[n]`, `partners`, `documents`, `opos`, `datev`, `datev/stapel`, `cycles`, `reporting`, `configuration/logs`, `settings/components`), **0** Seiten mit Spaltensortierung, **2** Stellen mit `SelectionBar` (v2), **8** Module mit lokalem Auf-/Zuklappen (`AuditLogTable`, `KontoauszugView`, `FindingsList`, `Schritt6Liste`, `PositionenTab`, `GlanceCard`, `ClarificationsBanner`, `OpenExportOverview`) |
| Ersetzt | den von Hand gesetzten Tabellenteil der 13 Listenseiten (`Card` + `Table` + `Pagination` je Seite) · das lokale Auf-/Zuklappen in 8 Modulen · die zwei v2-`SelectionBar`-Stellen |
| Blockiert | die Listenseiten der Wellen 1–3 (§11.4) · jede Entitätsliste (`CaseList`, `JournalEntryList`, `AccountList` …): sie wird eine Spaltendefinition auf `DataTable`, keine eigene Tabelle |
| Setzt voraus | nichts Offenes. Erweitert `Table` (eine Prop), `Pagination` (Seitengröße), `Selection.tsx` (Client-Insel) |
| Spec von / am | Claude, 2026-09-04 |
| Gebaut von / am | Claude, 2026-09-04 |

## Ziel

Die Sachbearbeiterin öffnet die Sachverhalte des Jahres: 583 Zeilen, 50 je
Seite. Sie sortiert nach Betrag, sieht am Kopf, wonach sortiert ist, blättert,
stellt auf 100 je Seite, markiert zwölf Zeilen und gibt sie mit einem Knopf
frei. Jede Zeile führt in den Sachverhalt, jede Zeile hat ihre zwei
Handlungen rechts, eine Zeile klappt auf, wenn sie kurz mehr wissen will.
Heute setzt jede der 13 Listenseiten diese Karte selbst zusammen: keine
sortiert, keine wählt aus, keine wechselt die Seitengröße, acht Module bauen
das Aufklappen lokal nach, und die fünf Zustände (V9) hat jede Seite anders.

Neu: **eine** Klammer über den Tabellen-Primitives, so wie `LogBrowser` die
Klammer über `LogList` ist. Die Seite liefert Zeilen, Spalten und den Stand
aus der URL; die Klammer rendert Karte, Kopf, Spaltenkopf, Zeilen, Zustände,
Auswahl, Zeilenaktionen, Seitenwechsel. Sie lädt nichts, sortiert nichts
selbst und kennt keine Entität.

## Entscheidungen des Owners (2026-09-04)

| | |
|---|---|
| **E1** | Seite, Seitengröße, Sortierung und Filter stehen in der **URL**. Die Auswahl bleibt lokal. |
| **E2** | Sortiert wird **serverseitig**: der Spaltenkopf ist ein Link, kein Zustand. Eine Seite von 583 lokal zu sortieren zeigt die 50 falsch geordnet. |
| **E3** | Kein `"use client"` am `DataTable`: Spaltenfunktionen passieren die Server-Grenze nicht. Auswahl, Aufklappen und Menü sind Client-Inseln, die Zellen kommen als ReactNode. |
| **E4** | Name `DataTable`, nicht `ListView`: „View" ist bei uns eine Entitätsform. |
| **E5** | Die Auswahlleiste **ersetzt die Aktionen im Kartenkopf**, solange etwas gewählt ist. Das Layout springt nicht. |
| **E6** | Tastatur jetzt: Shift-Klick als Bereich, Taste sichtbar an jeder Sammelaktion. Pfeiltasten durch die Zeilen: Backlog. |
| **E7** | Aufklappen mit eigenem Renderer je Zeile: ja. |
| **E8** | Zeilenaktionen nach **Zahl**, nicht nach gemessenem Platz: bis zwei inline, ab drei bleiben die häufigen sichtbar, der Rest wandert ins Menü (L1: Desktop ab 1280 px, kein ResizeObserver). |
| **E9** | Dichte ist eine Entscheidung der Seite (V1), kein Schalter für die Nutzerin. |

## Einordnung

- **Wiederverwenden:** alle Teile stehen, die Klammer fehlt.
  - `Card`/`CardHead`/`CardFoot` (`@when Every table and every bounded surface with a header`) — Zone 1 und 6.
  - `Table`/`HeadRow`/`Row`/`EmptyRow` (`@when Records of the same kind in columns, even with three rows`) — das Raster. `Row href` wickelt die Zeile in ein `<a>`; sobald die Zeile eigene Knöpfe trägt, ist das `<a>` in `<a>` — dafür gibt es im CSS den Overlay-Weg `.v2rowlink`, den `Row` als Prop nicht kennt (§Verhalten).
  - `SelectionBar` + `SelectCell` (`@when Actions on several selected rows at once`) — halten keine Auswahl: `count`, `checked`, `onChange` kommen von außen. Wer sie hält, fehlt.
  - `Pagination` (`@when A list longer than one page, paged over the URL`) — kennt keine Seitengröße.
  - `TableLoading`/`ErrorRow` (`@when Loading state inside the card, header rows stay in place`), `EmptyState inline` — die Zustände, einzeln.
  - `ExpandableRow` (`@when A small extra detail for a row that is read and collapsed again`) — passt, kommt als Zeilenform hinein.
  - `RowActions` (`@when One to three actions at the right of a table row`) und `OverflowMenu`/`MenuItem` (`@when Three or more actions on one object, of which one or two are frequent`) — genau E8, schon als Regel in den beiden `@when`.
  - `ActionButton` (`hotkey`, `confirm`, Pending) — jede Sammel- und Zeilenaktion, die läuft und scheitern kann.
  - `MasterDetail`/`ListPane` — der Nachbar: Auswahl zum Bearbeiten rechts. Nicht dieser Fall.
- **Neu, weil:** `spec-schreiben` §3.4 — die Komposition trägt **eigenen Zustand** (Auswahl je Seite, Aufklappen je Zeile) und einen **Tastaturweg** (Bereich, Tasten an Sammelaktionen) auf 13 Screens.
- **Erweitert (§3.2, je eine Designentscheidung, die wiederkommt):**
  - `Table` um `density` — Attribut `data-density` am `.v2tbl`, damit auch handgesetzte Tabellen die drei Maße bekommen.
  - `Pagination` um `pageSizeOptions` + `buildSizeHref` — die Seitengröße als `Select` „je Seite" rechts der Seitenzahlen.
  - `Selection.tsx` um die Client-Insel, die die Auswahl hält (§Verhalten). `SelectionBar` und `SelectCell` bleiben; die neuen Exporte lesen den Kontext.
- **Zuschnitt:** `patterns/DataTable.tsx` ohne `"use client"` (E3), eine Datei mit den Typen `ColumnDef`, `RowAction`, `BulkAction`. Die Teile, die Zustand brauchen, liegen in den Primitives, in denen sie schon leben (`Selection.tsx`, `ExpandableRow.tsx`, `OverflowMenu.tsx`) — §4 „ein Teil braucht `use client`, der Rest nicht". 16 Props, über der ~10-Marke: geprüft nach §4. Die Zonen teilen `rows`, `rowKey` und `href`; ein Schnitt in Kopf/Fuß ergäbe nur Durchreich-Props. Die Props sind je Zone gebündelt (`pager`, `selection`, `empty`, `error`).
- **Setzt auf:** `Card` · `CardHead` · `CardFoot` · `Table` · `HeadRow` · `Row` · `EmptyRow` · `TableLoading` · `ErrorRow` · `EmptyState` · `ExpandableRow` · `SelectionBar` · `SelectCell` · `Pagination` · `Select` · `RowActions` · `OverflowMenu` · `MenuItem` · `Button` · `ActionButton` · `TextButton` · Lucide `ArrowUp`/`ArrowDown` 12 px (A8, produktives Register).

## Zonen-Schema

Eine Zone wird weggelassen, nicht umsortiert. Zone 1, 3 und 4 sind Pflicht.

| # | Zone | Was hineingehört | Baustein | Kommt aus |
|---|---|---|---|---|
| 1 | Kartenkopf | Titel · Zähler (`sub`) · Aktionen der Liste. Solange etwas gewählt ist: „12 ausgewählt · Freigeben `F` · Auswahl aufheben" an der Stelle der Aktionen (E5) | `CardHead`, `SelectionBar` | `head`, `selection` |
| 2 | Filter | **über** der Karte, nicht darin (Baukasten §6, wie `LogBrowser`): `FilterBar` mit „n Filter gesetzt · Zurücksetzen". **Nicht Teil des DataTable** — die Seite stellt sie davor (0003) | — | Seite |
| 3 | Spaltenkopf | `[☐]` `[›]` Spalten mit Sortierpfeil an der aktiven · `Aktionen` | `HeadRow` | `columns`, `sort`, `selection`, `expand`, `rowActions` |
| 4 | Zeilen | Datenzeilen · oder genau einer der Zustände lädt · Fehler · leer · leer nach Filter | `Row`, `ExpandableRow`, `TableLoading`, `ErrorRow`, `EmptyRow` | `rows`, `loading`, `error`, `empty`, `filtered` |
| 5 | Seitenwechsel | „1–50 von 583 · ‹ 1 2 3 … 12 › · 50 je Seite" | `Pagination` | `pager` |
| 6 | Nächster Schritt | „Weiter zu Bank · 3 offen" (I10) | `CardFoot` | `next` |

## Schnittstelle

```ts
interface ColumnDef<T> {
  key: string;                       // also the sort name that goes into the URL
  header: ReactNode;                 // normal case, no capitals (A2)
  cell: (row: T) => ReactNode;       // a component or a pure function, rendered on the server
  width?: string;                    // one grid track: "1fr" (default), "120px", "max-content"
  align?: "start" | "end";           // "end" for amounts and counts (v2num on head and cell)
  sortable?: boolean;                // opt-in; without it no arrow, no link
}

interface RowAction {
  label: string;
  icon?: ReactNode;
  href?: string;                     // a jump (drawer via search param, L3 · or a page)
  action?: () => Promise<ActionResult>; // a Server Action, bound to the row by the caller
  confirm?: ConfirmSpec;             // from ActionButton
  tone?: "danger";
  primary?: boolean;                 // stays visible when the rest moves into the menu (E8)
}

interface BulkAction {
  label: string;
  hotkey?: string;                   // shown on the button (V14); active while count > 0
  action: (keys: string[]) => Promise<ActionResult>; // a Server Action
  confirm?: ConfirmSpec;
  tone?: "danger";
}

type ListPatch = { page?: number; pageSize?: number; sort?: string; dir?: "asc" | "desc" };
```

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `rows` | `T[]` | ja | die Zeilen **dieser Seite**, schon sortiert und gefiltert | `Filled` |
| `columns` | `ColumnDef<T>[]` | ja | der Spaltenvertrag; `cols` der `Table` entsteht aus `width`, davor `32px` je Auswahl/Chevron, dahinter `max-content` für Aktionen | `Filled` |
| `rowKey` | `(row: T) => string` | ja | Schlüssel für React, Auswahl und Aufklappen | `Filled` |
| `head` | `CardHead`-Props (`title`, `sub?`, `icon?`, `meta?`, `actions?`) | ja | Zone 1 — jede Tabelle in einer Karte, mit Kopf, auch leer (V5) | `Filled` |
| `density` | `"compact" \| "default" \| "wide"` | nein, Default `default` | Zeilenmaß (E9): `compact` einzeilig und eng (Kontenblatt, Protokoll), `default` die heutige `.v2tbl__row`, `wide` Raum für Titel + Untertitel in einer Zelle. Werte im CSS | `Density` |
| `minWidth` | `number` | nein | ab wann horizontal gescrollt statt gequetscht wird; durchgereicht an `Table` | `InUse` |
| `rowHref` | `(row: T) => string` | nein | die **ganze** Zeile ist das Ziel (I11): Overlay-Link in der ersten Textspalte, Hover und Cursor kommen aus dem CSS. Ohne `rowHref` bleibt die Zeile stumm | `Filled` |
| `expand` | `(row: T) => ReactNode` | nein | Zeile klappt unter sich über die volle Breite auf (E7); Chevron als erste Zelle nach der Auswahl. **Schließt `rowHref` aus** | `Expand` |
| `rowActions` | `(row: T) => RowAction[]` | nein | letzte Spalte, immer sichtbar (V14): ≤ 2 → `RowActions`; ≥ 3 → `primary` inline + `OverflowMenu` (E8). Liegt über dem Zeilen-Link | `RowActions` |
| `sort` | `{ key: string; dir: "asc" \| "desc" }` | nein | der Stand aus der URL; die aktive Spalte trägt Pfeil und `aria-sort` | `Filled` |
| `href` | `(patch: ListPatch) => string` | wenn `sort` oder `pager` | die Seite baut die URL (`withSearchParams`); der DataTable setzt bei Sortier- oder Größenwechsel `page: 1` mit | `Filled`, `InUse` |
| `pager` | `{ page; pageSize; totalItems; totalPages; pageSizeOptions?: number[] }` | nein | Zone 5; die vier Zahlen sind `PageResult` der App ohne `items` | `Filled`, `InUse` |
| `selection` | `{ actions: BulkAction[]; label?: (row: T) => string }` | nein | Auswahlspalte, Kopf-Checkbox, Leiste in Zone 1 (I5). `label` ist der Text der Checkbox („Sachverhalt 2026-0417 auswählen"), Default `rowKey(row)` | `Selection` |
| `filtered` | `{ summary: string; resetHref: string }` | nein | ein Filter ist aktiv: liefert den Leertext **nach Filter** („Keine Sachverhalte für ‚Status offen'." + „Filter zurücksetzen", T6) | `EmptyFiltered` |
| `empty` | `{ title: string; description?: ReactNode; action?: ReactNode; done?: boolean }` | nein | Leertext **nie befüllt** mit Handlung; `done` = erledigt: Haken `--color-success` + Satz mit Zahl (L6) | `Empty` |
| `loading` | `boolean` | nein | `TableLoading` in Zone 4, Kopf und Spaltenkopf bleiben (I7) | `Loading` |
| `error` | `{ message: string; retry?: ReactNode }` | nein | `ErrorRow` mit Text nach T5 und einer Retry-Handlung (I7) | `Error` |
| `next` | `ReactNode` | nein | Zone 6, der nächste Schritt mit Zahl (I10) | `InUse` |

Typen aus `src/ludwig/`: keine im Pattern — `T` ist generisch. Stories nutzen
`CaseListItem` (`modules/accounting-cases/domain/case.ts`). `ActionResult`,
`ConfirmSpec` aus `ActionButton`. GLOSSARY: Sachverhalt = accounting case,
Beleg = document, im Code nur in den Stories.

Was der DataTable **nicht** kann (bewusst):

- **Lädt und sortiert nichts.** `rows` sind fertig; `sort`, `pager`, `filtered` sind Abbild der URL. Client-Sortierung ohne Pager: Backlog.
- **Hält keinen Filterzustand, rendert keine `FilterBar`.** Die Seite stellt sie darüber (0003, I4); `filtered` ist nur der Text für „leer nach Filter".
- **Kein `onRowPick`.** Klick ohne URL zum Bearbeiten rechts → `MasterDetail`; Klick auf eine Zeile, die ein Detail hat → `rowHref` (Drawer per Search-Param, L3).
- **Keine Auswahl über Seitengrenzen.** Die Auswahl gilt je Seite und leert sich beim Seitenwechsel.
- **Keine Spalten ziehen, ausblenden, umsortieren; keine Virtualisierung, kein Inline-Edit, keine Baumzeilen, kein Export.** Nichts davon hat heute eine Verwendung.

## Verhalten

- **Spaltenkopf und Sortierung.** Eine Spalte mit `sortable` rendert ihren Kopf als `Link` auf `href({ sort: key, dir, page: 1 })`. Erster Klick `asc`; Klick auf die aktive Spalte dreht auf `desc` und zurück. Nur die aktive Spalte zeigt den Pfeil (`ArrowUp`/`ArrowDown`, 12 px, Stroke 1.5) rechts vom Wort und trägt `aria-sort="ascending" | "descending"`. Inaktive sortierbare Köpfe sind Links ohne Pfeil, Hover unterstreicht. `align: "end"` setzt `v2num` auf Kopf **und** Zelle.
- **Die Zeile ist das Ziel (I11).** Mit `rowHref` rendert der DataTable `Row` als `div` und setzt in die erste Spalte ohne Auswahl/Chevron einen `<Link className="v2rowlink">` um deren Zellinhalt — der Link hat eigenen Text, kein `aria-label`. `.v2tbl__row:has(.v2rowlink)` liefert Cursor und Hover; Knöpfe und weitere Links in Zellen liegen darüber (CSS-Regel vorhanden; sie wird um `input` erweitert, damit die Checkbox darüberliegt). Genau **ein** Fokus-Stopp je Zeile für das Ziel. Nie `Row href` — das wäre `<a>` in `<a>`, sobald `rowActions` oder `selection` dazukommen.
- **Auswahl (I5, V11).** `selection` fügt vorn eine `32px`-Spalte ein: `SelectCell` je Zeile, im Kopf eine Checkbox „Alle auf dieser Seite" mit `indeterminate`, wenn ein Teil gewählt ist. Den Zustand hält eine Client-Insel in `Selection.tsx` (`SelectionScope`, Context: `keys: Set<string>`, `toggle`, `range`, `setAll`, `clear`; die Zellen und die Leiste lesen ihn über `useSelection`). Die Insel bekommt `key={page}`, damit ein Seitenwechsel sie leert. **Shift-Klick** wählt den Bereich vom zuletzt umgeschalteten Schlüssel bis hierher (Anker in der Insel, Reihenfolge = `rows`). `Space` auf der fokussierten Checkbox schaltet (nativ). Die Checkbox stoppt die Propagation, damit weder Zeilen-Link noch Aufklappen feuern.
- **Auswahlleiste (E5).** Solange `count > 0`, rendert Zone 1 an der Stelle von `head.actions` die `SelectionBar`: „12 ausgewählt · [Freigeben `F`] [Löschen] · Auswahl aufheben". Jede `BulkAction` ist ein `ActionButton` mit `hotkey`, `confirm` und `tone`; sie ruft `action([...keys])`, danach `clear()`. Die Tasten gelten nur, solange etwas gewählt ist (`useHotkeys(bindings, count > 0)`). `head.actions` kommt zurück, sobald die Auswahl leer ist. Kein eigener Balken über dem Spaltenkopf: das CSS `.v2selbar` bekommt eine Inline-Variante für den Kartenkopf.
- **Zeilenaktionen (E8).** `rowActions(row)` wird auf dem Server ausgewertet; die letzte Spalte `max-content`, Kopf „Aktionen". Bis zwei Einträge → `RowActions` mit `Button size="xs" variant="tertiary"` (`href`) oder `ActionButton size="xs"` (`action`). Ab drei → die `primary`-Einträge inline, der Rest in `OverflowMenu size="xs" label="Mehr"` als `MenuItem` (`href`) oder `MenuItem` um einen `ActionButton` (`action`, `confirm`), `tone="danger"` durchgereicht. Immer sichtbar, nie nur bei Hover (V14, Tastatur). `compact` ändert die Regel nicht, nur die Größe.
- **Aufklappen (E7).** Mit `expand` wird jede Zeile eine `ExpandableRow`: `summary` = die Zellen, `children` = `expand(row)` in `.v2tbl__detail` über die volle Breite. Der Chevron der `ExpandableRow` bekommt seine eigene `32px`-Spalte nach der Auswahl, damit das Raster stimmt. `Enter`/`Space` auf der Zeile klappt (vorhanden). `expand` und `rowHref` zusammen sind ein Typ-Fehler (Union) — braucht eine Seite beides, kommt der Chevron als eigene Zelle mit eigenem Knopf: Backlog.
- **Dichte (E9).** `Table density` setzt `data-density` am `.v2tbl`; drei CSS-Blöcke auf `.v2tbl__head`, `.v2tbl__row`, `.v2tbl__detail`. `default` ist die heutige Zeile, unverändert. `compact`: kleinere Schrift und weniger vertikaler Raum, einzeilig. `wide`: Raum für `v2main` + Untertitel in einer Zelle. Knöpfe und Plaketten passen sich der Zeile an, nie umgekehrt (V1): in `compact` `size="xs"`.
- **Zustände (V9, T6), Vorrang von oben:** `loading` → `TableLoading rows=5 cols=columns.length` · `error` → `ErrorRow` mit `message` und `retry` · `rows.length > 0` → Zeilen · `filtered` → `EmptyRow` mit „Keine Treffer für ‚{summary}'." und `TextButton href={resetHref}` „Filter zurücksetzen" · sonst `EmptyRow` mit `EmptyState inline` aus `empty` (`done`: Haken in `--color-success`, `title` ist der Satz mit Zahl). Kopf und Spaltenkopf stehen in allen fünf Fällen (I7). Zone 5 fehlt bei leer, lädt und Fehler.
- **Seitenwechsel.** `pager` → `Pagination` mit `buildHref = (page) => href({ page })`; mit `pageSizeOptions` rechts ein `Select` „je Seite", `buildSizeHref = (pageSize) => href({ pageSize, page: 1 })`. `totalItems === 0` → keine Zone 5 (wie heute).
- **Tastatur, Hauptweg:** `Tab` → Aktionen im Kopf → sortierbare Köpfe → je Zeile: Checkbox, Zeilen-Link, Zeilenaktionen → Seitenwechsel. Jede Handlung ist ein Knopf oder Link mit Wort; Icons nur mit Wort (V14). Sammelaktionen tragen ihre Taste sichtbar (E6).
- **Server-Component (E3).** `DataTable.tsx` ohne `"use client"`: `cell`, `rowHref`, `expand`, `rowActions`, `selection.label` laufen auf dem Server, ihre Ergebnisse gehen als ReactNode oder String in die Inseln. Server Actions (`BulkAction.action`, `RowAction.action`) sind serialisierbar und dürfen die Grenze passieren. Eine Client-Seite darf den DataTable genauso benutzen.
- **CSS** in `v3.css`: `.v2tbl[data-density]` (drei Blöcke) · `.v2tbl__head a` (Sortier-Link, Pfeil) · `.v2selbar--inline` · `input` in der `z-index`-Regel von `.v2rowlink`. Präfix vor dem Benennen greppen (`v2*` ist eng).

## Stories

Abgeleitet nach §6. Titel `v3/Patterns/Arbeitsfläche/DataTable`. Daten:
`CaseListItem`, 583 Sachverhalte gedacht, 50 auf der Seite; Musterfirma GmbH,
1.800,00 €, 26.08.2026.

| Story | Beweist |
|---|---|
| `Filled` | 50 Sachverhalte: Nummer (`MonoCell`) · Titel mit Gegenpartei · Betrag (`AmountCell`, `align: "end"`, `sortable`) · Status (`StatusBadge`) · Eröffnet (`Timestamp`, `sortable`, aktiv `desc` mit Pfeil und `aria-sort`) · `rowHref` auf jede Zeile · `pager` 1–50 von 583 |
| `Empty` | zwei Karten nebeneinander: nie befüllt („Noch keine Sachverhalte für 2026." + „Belege hochladen") und erledigt (`done`: „Alle 47 Sachverhalte sind gebucht."); Spaltenkopf steht |
| `EmptyFiltered` | `filtered` mit `summary: "Status offen · Betrag > 1.000 €"`: der Leertext nennt den Filter, „Filter zurücksetzen" führt auf `resetHref` |
| `Loading` | `loading`: Kopf, Spaltenkopf, fünf Ladezeilen in Spaltenzahl; keine Zone 5 |
| `Error` | `error` mit Text nach T5 und `retry` als `Button href` „Erneut laden" |
| `Density` | dieselben acht Zeilen dreimal untereinander: `compact`, `default`, `wide` (mit Untertitel in der Titelzelle) |
| `Selection` | Rundlauf mit `useState`-Mock der Server Action: drei Zeilen wählen, Kopf-Checkbox `indeterminate`, Shift-Klick wählt den Bereich, Leiste zeigt „3 ausgewählt · Freigeben `F` · Auswahl aufheben" an der Stelle der Kopf-Aktionen; `F` und Klick rufen `action(keys)`, danach ist die Auswahl leer |
| `RowActions` | zwei Karten: zwei Aktionen (Öffnen `href`, Zurückstellen `action`) inline · vier Aktionen, eine `primary`, der Rest im `OverflowMenu`, „Löschen" mit `tone: "danger"` und `confirm` |
| `Expand` | `expand(row)` rendert `FieldList` mit Zusammenfassung und offenen Klärungen; zusammen mit `selection`: Checkbox schaltet, ohne zu klappen |
| `InUse` | die Sachverhaltsliste wie auf `[year]/cases`: `FilterBar` (0003) darüber, sieben Spalten mit `minWidth`, `pageSizeOptions` 25/50/100 mit „je Seite", `sort` aus der URL, `next` „Weiter zu Bank · 3 offen", `head.actions` „Sachverhalt anlegen" |

Zehn Stories, die Obergrenze: fünf Zustände, eine Enum-Prop (`density`),
ein Callback-Rundlauf (`Selection`), ein Einsatz, zwei Verhalten
(`RowActions`, `Expand`), die je eine Prop mit eigener Regel beweisen.
Sortierung und Seitenwechsel sind Links: `Filled` zeigt sie statisch, in
Storybook navigiert kein Link. Kein Rand: der DataTable formatiert nichts,
das tun die Zellen (`AmountCell`, `Timestamp`); viele Spalten beweist `InUse`.

## Ausbau

Nachgetragen nach A12 (die Spec entstand davor). Quelle sind die eigenen
offenen Fragen und die Abnahmezeile „tut bewusst nicht … Backlog".

| Was fehlt | Welche Prop es trägt | Woran man merkt, dass es Zeit ist |
|---|---|---|
| Spalten konfigurieren (Spaltenwähler) | `columns` bleibt die Wahrheit; dazu ein `Popover` an der Aufrufstelle, der die Auswahl in die URL schreibt — keine Prop an `DataTable` | zwei Seiten wollen von derselben Liste verschiedene Spaltensätze; heute entscheidet die Spaltenfunktion (A11) |
| Auswahl über Seitengrenzen | `selection` müsste IDs statt Zeilen führen | eine Massenaktion trifft mehr als eine Seite |
| Seitengröße 200 | Wert in der Liste der Seitengrößen | eine Liste braucht mehr als 100 je Seite (`MAX_PAGE_SIZE` der App, offene Frage 1) |
| Sortierung über mehrere Spalten | `sort` als Array statt einem Paar | eine Liste hat zwei gleichrangige Ordnungen; heute reicht eine |

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

- [ ] `columns` erzeugt `cols` aus `width` (Default `1fr`), davor `32px` je Auswahl und Chevron, dahinter `max-content` für Aktionen; `align: "end"` setzt `v2num` auf Kopf und Zelle (`Filled`)
- [ ] Sortierbare Köpfe sind Links auf `href({ sort, dir, page: 1 })`; erster Klick `asc`, aktive Spalte dreht; nur die aktive trägt Pfeil und `aria-sort`; ohne `sortable` kein Link (`Filled`)
- [ ] `rowHref`: Overlay-Link mit eigenem Text in der ersten Textspalte, ganze Zeile hovert und klickt, genau ein Fokus-Stopp für das Ziel; Zellknöpfe und Checkbox liegen darüber; ohne `rowHref` kein Hover, kein Cursor (`Filled`, `Selection`)
- [ ] Nie `Row href` mit Knöpfen darin: kein `<a>` in `<a>` im DOM (`RowActions`)
- [ ] `selection`: Kopf-Checkbox wählt alle der Seite, `indeterminate` bei Teilauswahl; Shift-Klick wählt den Bereich; `Space` schaltet; Seitenwechsel leert (`Selection`)
- [ ] Auswahlleiste ersetzt `head.actions`, solange `count > 0`, und gibt sie zurück; jede `BulkAction` zeigt ihre Taste, Taste nur aktiv bei Auswahl; `action` erhält alle Schlüssel, danach leer (`Selection`)
- [ ] `rowActions`: ≤ 2 inline als `RowActions`; ≥ 3 → `primary` inline, Rest im `OverflowMenu` „Mehr"; `action`-Einträge laufen über `ActionButton` mit `confirm`; immer sichtbar (`RowActions`)
- [ ] `expand`: Zeile klappt per Klick, `Enter`, `Space` über die volle Breite; Checkbox klappt nicht; `expand` + `rowHref` ist ein Typ-Fehler (`Expand`)
- [ ] `density`: drei Werte über `Table density` und `data-density`; `default` pixelgleich zur heutigen Zeile; `compact` einzeilig mit `xs`-Knöpfen; `wide` trägt zwei Zeilen in einer Zelle (`Density`)
- [ ] Fünf Zustände mit Vorrang lädt → Fehler → Zeilen → leer nach Filter → leer; Kopf und Spaltenkopf stehen immer; Zone 5 nur mit Zeilen (`Empty`, `EmptyFiltered`, `Loading`, `Error`)
- [ ] `filtered` nennt den Filter im Leertext und setzt über `resetHref` zurück; `empty.done` zeigt Haken in `--color-success` und den Satz mit Zahl (`EmptyFiltered`, `Empty`)
- [ ] `pager` rendert `Pagination`; `pageSizeOptions` zeigt „je Seite" als `Select`, Wechsel führt auf `href({ pageSize, page: 1 })` (`InUse`)
- [ ] `Table.density`, `Pagination.pageSizeOptions`/`buildSizeHref` und die Auswahl-Insel in `Selection.tsx` existieren mit `@when`-Halbsatz; die bestehenden Stories der drei Primitives um je eine Variante ergänzt
- [ ] `DataTable.tsx` ohne `"use client"`; `"use client"` nur in `Selection.tsx`, `ExpandableRow.tsx`, `OverflowMenu.tsx`, `ActionButton.tsx` (Befehl: `grep -l "use client" src/ui/v3/patterns/DataTable.tsx` leer)
- [ ] Tastatur: `Tab`-Reihenfolge Kopf-Aktionen → Köpfe → je Zeile Checkbox, Link, Aktionen → Seitenwechsel; jedes Icon mit Wort (`InUse`)
- [ ] Tut bewusst nicht: laden, sortieren, filtern, `onRowPick`, Auswahl über Seiten, Spalten konfigurieren — Aufrufer löst es mit der URL, `FilterBar`, `MasterDetail`, Backlog
- [ ] Ersetzt den Tabellenteil von `[year]/cases/page.tsx` ohne Funktionsverlust — **offen (App)**, siehe `docs/backlog/README.md`

## Befunde für `ludwig/app`

1. **Keine Seite sortiert.** `parsePageRequest` (`shared/pagination.ts`) kennt `page` und `size`, nicht `sort`/`dir`. Für E2 braucht `PageRequest` die zwei Felder, und jede `list*ForClient` eine Whitelist erlaubter Sortierschlüssel je Spalte. Die Seite bildet `href({ pageSize })` auf den URL-Namen `size` ab.
2. **Wiederhol-Listen ohne Auswahl (V11).** Freigabe in `cases` und der Stapelabnahme läuft heute je Zeile. Die Seiten brauchen Server Actions, die `ids: string[]` nehmen.
3. **Acht Module klappen lokal** (Quelle oben). Beim Umzug auf `expand` fällt der jeweilige `useState` weg.
4. **`v2/Interactive.tsx`** hält die einzige v2-`SelectionBar`-Verwendung; sie geht in der Insel auf.

## Backlog (nicht in dieser Aufgabe)

- Pfeiltasten und `j`/`k` durch die Zeilen, `x` schaltet die Auswahl (E6).
- Chevron als eigene Zelle, damit `expand` und `rowHref` zusammengehen.
- Client-Sortierung, wenn kein `pager` da ist (alle Zeilen geladen).
- Auswahl über Seitengrenzen („alle 583 auswählen").
- Spalten ein-/ausblenden je Nutzerin.

## Offene Fragen

1. **Seitengrößen:** 25 · 50 · 100, oder auch 200 (`MAX_PAGE_SIZE` der App)? *Ohne Antwort: 25 · 50 · 100, Default 50 (`DEFAULT_PAGE_SIZE`).*
2. **Kopf-Checkbox bei nur einer Zeile?** *Ohne Antwort: ja, immer — eine Regel, kein Sonderfall.*
3. **Aktionen-Spalte ohne Kopftext?** Viele Tabellen lassen die Zelle im Kopf leer. *Ohne Antwort: Kopf „Aktionen", gedämpft wie die anderen — A2, kein leerer Kopf.*
## Abnahme

Abgenommen gegen die Kriterien oben, von einem zweiten Agenten (nicht dem
Erbauer). Grundlage: Spec, Code, DOM-Proben, Typ-Proben und alle zehn Stories
im Browser (Chromium, Storybook auf Port 6107), Sortierung, Auswahl,
Aufklappen und Seitenwechsel durchgespielt.

**Story-Deckung** — zehn abgeleitet, zehn vorhanden. Jede Prop hat ihre
Story: `rows`/`columns`/`rowKey`/`head`/`sort`/`href`/`pager`/`rowHref` in
`--filled` · `density` in `--density` · `minWidth`, `pageSizeOptions`, `next`
in `--in-use` · `rowActions` in `--row-actions` (zwei Karten, ≤ 2 und ≥ 3) ·
`expand` und `selection` zusammen in `--expand` · `selection` mit Rundlauf in
`--selection` · `empty` (beide Fassungen) in `--empty` · `filtered` in
`--empty-filtered` · `loading` in `--loading` · `error` in `--error`. Kein
ausgeschlossener Zustand: die fünf sind alle da. Die Spec begründet, warum es
keine Rand-Story gibt (der DataTable formatiert nichts) und warum Sortierung
und Seitenwechsel statisch gezeigt werden (Storybook folgt keinem Link) —
beides trägt; die Sortier-Links sind unten am `href` überprüft.

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| `pnpm typecheck` grün | `pnpm typecheck` (= `tsc --noEmit`), Exit-Code 0, 2026-09-05 vor und nach der Abnahme | ✓ |
| `pnpm build` grün | Nicht erneut gelaufen (parallele Abnahmen auf demselben Stand). Zitiert wird der Lauf für diesen Stand: „Storybook build completed successfully" | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/patterns/DataTable.tsx` + `DataTable.stories.tsx`; Titel `v3/Patterns/Arbeitsfläche/DataTable` — dieselbe Gruppe wie `MasterDetail` | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | `DataTable.tsx:161–168` am Export `DataTable`; die übrigen Exporte der Datei sind Typen (`ColumnDef`, `RowAction`, `ListPatch`, `DataTableProps`) und tragen wie im ganzen Set JSDoc ohne `@when`. `SelectionScope`, `SelectAllCell`, `SelectRowCell`, `SelectionScopeBar`, `useSelection` (`Selection.tsx`), `Table` und `Pagination` tragen alle `@when` | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE '#[0-9a-fA-F]{3,8}\|[0-9]+px' src/ui/v3/patterns/DataTable.tsx` → ein Treffer, und der ist Fließtext im JSDoc (Z. 62, Beispiel „120px"). Die Griff-Spalte ist `var(--v2-tbl-pick)` (Z. 87). Keine Label-Map; die Status-Zelle der Stories ist `StatusBadge` (Registry), der Spaltenkopf heißt „Bearbeitung", nicht „Status" (Z4) | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | siehe Story-Deckung | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Stufe `patterns/`, Importe nur abwärts, kein Fachmodul (die Story importiert `CaseListItem`, die Komponente nicht) · kein Hex/px/Label-Map · Text links, Beträge rechts mit `v2num` auf Kopf und Zelle, nichts zentriert · Zeilenhöhe `default` unverändert · Farbe nur über `StatusBadge`, Rot nur an `tone: "danger"` · jeder farbige Zustand mit Wort · fünf Zustände, drei Leertexte · Fokusring an `.v2sortlink:focus-visible` (2 px `--color-focus`), Zeilen-Transition nur `background` · Tastaturweg belegt (unten), kein Icon ohne Wort (`iconOnly: 0` im DOM von `--in-use`) · Hover an Zeile, Kopf-Link und Knöpfen · Icons Lucide 1.5 px, keine Emoji · Karte Rand ohne Schatten (`.v2card`), linksbündig, kein Modal · Texte Sie/Imperativ, GLOSSARY-Begriffe · Story unter `v3/Patterns/Arbeitsfläche/`. Die zwei App-Punkte (v1-`@deprecated`, §11) laut Skill übersprungen | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle zehn Stories in Chromium gerendert, Screenshots von `--filled`, `--empty`, `--loading`, `--density`, `--row-actions`, `--expand`, `--in-use`; `--selection`, `--expand` und das Zeilenmenü zusätzlich bedient | ✓ |
| `columns` erzeugt `cols` aus `width`, davor `32px` je Auswahl und Chevron, dahinter `max-content`; `align: "end"` setzt `v2num` auf Kopf und Zelle | Computed `--v2-cols`: `--filled` `110px 1fr 130px 190px 150px` (Default `1fr` an der Titelspalte) · `--selection` `32px 110px …` · `--expand` (mit `selection`) `32px 32px 110px …`, Kopfzeile `INPUT, SPAN(leer), Nummer, …` · `--row-actions` `… 150px max-content` mit Kopf „Aktionen". `--filled`: Kopfzelle „Betrag" und ihre Datenzelle tragen beide `class="v2num"` | ✓ |
| Sortierbare Köpfe sind Links auf `href({ sort, dir, page: 1 })`; erster Klick `asc`, aktive Spalte dreht; nur die aktive trägt Pfeil und `aria-sort`; ohne `sortable` kein Link | DOM-Probe `--filled` (`sort = openedAt/desc`): „Betrag" → `<a href="?sort=totalAmount&dir=asc&page=1">` ohne Pfeil, ohne `aria-sort` · „Eröffnet" → `aria-sort="descending"`, `svg.lucide-arrow-down`, Link auf `?sort=openedAt&dir=asc&page=1` (dreht) · „Nummer", „Sachverhalt", „Bearbeitung" ohne `sortable` → reine `<span>`, kein Link. `page: 1` steckt in jedem Sortier-Link | ✓ |
| `rowHref`: Overlay-Link mit eigenem Text in der ersten Textspalte, ganze Zeile hovert und klickt, genau ein Fokus-Stopp; Zellknöpfe und Checkbox liegen darüber; ohne `rowHref` kein Hover, kein Cursor | `--filled`, Zeile 1: genau ein `<a class="v2rowlink">` mit dem Text „2026-0417" (kein `aria-label`), `position: relative` an der Zeile, `cursor: pointer`, ein einziger Fokus-Stopp (`a[href],button,input` = 1). `--row-actions`: die Zeile trägt zusätzlich `<a class="v2btn…">Öffnen</a>` und Knöpfe, die über die z-index-Regel `v3.css:120–124` (inklusive `input`) obenauf liegen. `--density` ohne `rowHref`: `cursor: auto`, kein `.v2rowlink`, keine Hover-Regel | ✓ |
| Nie `Row href` mit Knöpfen darin: kein `<a>` in `<a>` im DOM | `DataTable.tsx:376` rendert `<Row key={key}>` ohne `href`; DOM-Probe `--row-actions` beider Karten: Zeilen-Tag `DIV`, `row.querySelector("a a")` → `null`, Anker der Zeile: `["v2rowlink", "v2btn …"]` bzw. `["v2rowlink", "v2menu__item"]` — Geschwister, keine Verschachtelung | ✓ |
| `selection`: Kopf-Checkbox wählt alle der Seite, `indeterminate` bei Teilauswahl; Shift-Klick wählt den Bereich; `Space` schaltet; Seitenwechsel leert | Rundlauf `--selection`: Klick auf Zeile 2 → `indeterminate = true`, 1 gewählt · Shift-Klick auf Zeile 5 → 4 gewählt (Zeilen 2–5) · `Space` auf der fokussierten Checkbox von Zeile 8 → 5 gewählt · Kopf-Checkbox → alle 8, `checked = true`, `indeterminate = false`. Die Kästchen tragen `aria-label` aus `selection.label` („Sachverhalt 2026-0417 auswählen"), der Kopf „Alle auf dieser Seite auswählen". Seitenwechsel: `DataTable.tsx:285` hängt `key={pager?.page ?? 0}` an den `SelectionScope`, die Insel wird also neu montiert — die Story hat keinen Pager, der Nachweis ist die Code-Zeile | ✓ |
| Auswahlleiste ersetzt `head.actions`, solange `count > 0`, und gibt sie zurück; jede `BulkAction` zeigt ihre Taste, Taste nur aktiv bei Auswahl; `action` erhält alle Schlüssel, danach leer | `--selection`: ohne Auswahl steht „Sachverhalt anlegen" im Kartenkopf, kein `.v2selbar`. Ab einer Wahl steht dort `.v2selbar.v2selbar--inline` mit „5 ausgewählt · Freigeben F · Auswahl aufheben" — an derselben Stelle, das Layout springt nicht. `F` → die Unterzeile meldet „5 freigegeben: 2026-0418, 2026-0419, 2026-0420, 2026-0421, 2026-0424", danach 0 gewählt und „Sachverhalt anlegen" wieder da. Ohne Auswahl bleibt `F` folgenlos (Unterzeile unverändert) | ✓ |
| `rowActions`: ≤ 2 inline als `RowActions`; ≥ 3 → `primary` inline, Rest im `OverflowMenu` „Mehr"; `action`-Einträge über `ActionButton` mit `confirm`; immer sichtbar | `--row-actions`, Karte 1: „Öffnen" als `a.v2btn--xs`, „Zurückstellen" als `button.v2btn--xs`, beide in der Zeile. Karte 2: „Freigeben" (`primary`) inline, dahinter `<details class="v2menu">` mit `summary` „Mehr"; im Panel „Öffnen" (`MenuItem`), „Zurückstellen" und „Löschen" als `ActionButton`, letzterer in `.v2menu__act--danger` mit `color: rgb(168, 64, 60)` = `--color-danger`. Klick auf „Löschen" öffnet die Rückfrage „Sachverhalt 2026-0417 löschen? … Abbrechen / Sachverhalt löschen". Nichts hängt an `:hover` — alle Knöpfe stehen im Ruhezustand im DOM und im Bild | ✓ |
| `expand`: Zeile klappt per Klick, `Enter`, `Space` über die volle Breite; Checkbox klappt nicht; `expand` + `rowHref` ist ein Typ-Fehler | `--expand`: ein Klick in die Zeile → `aria-expanded="true"`, ein `.v2tbl__detail` mit 1366 px = volle Tabellenbreite; `Enter` auf Zeile 4 und `Space` auf Zeile 5 klappen ebenso. Klick auf die Checkbox von Zeile 3 → gewählt, alle `aria-expanded` bleiben `false`. Typ-Probe: `<DataTable rowHref={…} expand={…} />` → `tsc`: `TS2322 … Type '(r: R) => Element' is not assignable to type 'undefined'.` | ✓ |
| `density`: drei Werte über `Table density` und `data-density`; `default` pixelgleich zur heutigen Zeile; `compact` einzeilig mit `xs`-Knöpfen; `wide` trägt zwei Zeilen in einer Zelle | `--density`: `data-density` = `compact` / `default` / `wide`; gemessen `padding-y` 7 / 12 / 18 px, `font-size` 12.5 / 13.5 / 13.5 px, Kopf 6 / 9 / 11 px, Zeilenhöhe 38 / 47 / 75 px. `default` ist pixelgleich zum Stand vor der Aufgabe (`git show 8a2096c^:src/styles/v3.css`: `padding: 12px 18px`, `font-size: 13.5px`, Kopf `9px`). `wide`: die Titelzelle trägt `v2main` + `v2sub` in zwei Zeilen. Zeilenaktionen sind unabhängig von der Dichte immer `size="xs"` (`DataTable.tsx:406, 413`) — die `--density`-Story führt keine Knöpfe, den Beleg liefert `--row-actions` | ✓ |
| Fünf Zustände mit Vorrang lädt → Fehler → Zeilen → leer nach Filter → leer; Kopf und Spaltenkopf stehen immer; Zone 5 nur mit Zeilen | Vorrang als Kette in `DataTable.tsx:215–239`, in genau dieser Reihenfolge. DOM-Proben: `--loading` fünf Ladezeilen à fünf Skelett-Zellen, kein `.pag` · `--error` `.v2tbl__error` mit Retry, kein `.pag` · `--empty` und `--empty-filtered` je ein `.v2tbl__empty`, kein `.pag` · `--filled` 50 Zeilen mit `.pag`. Kartenkopf und Spaltenkopf stehen in allen fünf Fällen (in `--empty` sogar mit den drei Spaltennamen) | ✓ |
| `filtered` nennt den Filter im Leertext und setzt über `resetHref` zurück; `empty.done` zeigt Haken in `--color-success` und den Satz mit Zahl | `--empty-filtered`: „Keine Treffer für „Status offen · Betrag > 1.000 €"." plus `<a href="?page=1">Filter zurücksetzen</a>`. `--empty` Karte 2: `svg.lucide-circle-check` mit `stroke="var(--color-success)"`, computed `rgb(63, 122, 90)` = `#3F7A5A`, `aria-label="erledigt"`, daneben „Alle 47 Sachverhalte sind gebucht." Karte 1 trägt den dritten Leertext („Noch keine Sachverhalte für 2026." + „Belege hochladen") | ✓ |
| `pager` rendert `Pagination`; `pageSizeOptions` zeigt „je Seite" als `Select`, Wechsel führt auf `href({ pageSize, page: 1 })` | `--in-use`: „1–50 von 583", Seitenliste `‹ 1 2 … 12 ›`, dahinter `<select>` mit 25/50/100 auf 50 und dem Label „je Seite". Auswahl von 100 navigiert nach `?size=100&page=1` — die Story bildet `pageSize` auf den URL-Namen `size` ab, `page: 1` fährt mit. `--filled` ohne `pageSizeOptions`: kein `select` | ✓ |
| `Table.density`, `Pagination.pageSizeOptions`/`buildSizeHref` und die Auswahl-Insel existieren mit `@when`-Halbsatz; die Stories der drei Primitives um je eine Variante ergänzt | `Table.tsx:87` („`density` when a page needs the tighter or the roomier row"), `Pagination.tsx:25–26` („with `pageSizeOptions` also „50 je Seite" behind the numbers"), `Selection.tsx` `@when` an `SelectionScope`, `useSelection`, `SelectAllCell`, `SelectRowCell`, `SelectionScopeBar`. Neue Varianten gerendert: `v3-primitives-tabelle-table--density` (drei `data-density`), `v3-primitives-navigation-pagination--with-page-size` (`.pag__size` „25 50 100 je Seite"), `v3-primitives-tabelle-selection--island` (fünf Kästchen) | ✓ |
| `DataTable.tsx` ohne `"use client"`; `"use client"` nur in `Selection.tsx`, `ExpandableRow.tsx`, `OverflowMenu.tsx`, `ActionButton.tsx` | `grep -l "use client" src/ui/v3/patterns/DataTable.tsx` → keine Ausgabe, Exit-Code 1. Die vier Inseln tragen die Direktive in Zeile 1 (je `head -1` geprüft) | ✓ |
| Tastatur: `Tab`-Reihenfolge Kopf-Aktionen → Köpfe → je Zeile Checkbox, Link, Aktionen → Seitenwechsel; jedes Icon mit Wort | DOM-Reihenfolge der fokussierbaren Elemente in `--in-use` (nach der `FilterBar`, die über der Karte steht): „Sachverhalt anlegen" → „Betrag" → „Eröffnet" → „2026-0417" → … → Seitenzahlen → Größenwahl. In `--selection` steht die Checkbox vor dem Rest ihrer Zeile. Kein Knopf und kein Link mit Icon ohne Wort oder `aria-label` (DOM-Zählung `iconOnly: 0`); die Pfeile der `Pagination` tragen „Vorherige Seite"/„Nächste Seite" | ✓ |
| Tut bewusst nicht: laden, sortieren, filtern, `onRowPick`, Auswahl über Seiten, Spalten konfigurieren | `grep -nE "useState\|useEffect\|fetch\|\.sort\(\|onRowPick" src/ui/v3/patterns/DataTable.tsx` → keine Treffer (die drei `filter(`-Stellen sind der `cols`-Bau und die Trennung `primary`/`rest`). Die Auswahl ist an die Seite gebunden (`key={pager?.page}`); ein Spaltenwähler existiert nicht und steht im Abschnitt „Ausbau" | ✓ |
| Ersetzt den Tabellenteil von `[year]/cases/page.tsx` ohne Funktionsverlust | Betrifft `ludwig/app`, in diesem Repo nicht prüfbar — siehe `docs/backlog/README.md` | offen (App) |
| **Bekannter Punkt aus der Abnahme von 0077, bewertet:** `headCell` legt den **ganzen** `col.header` in den Sortier-Link (`DataTable.tsx:317–320`) — steckt darin ein Knopf (`StatusHeader` mit seinem (i)), entstünde interaktiver Inhalt in einem `<a>`, nach HTML-Inhaltsmodell ungültig | **Kein Mangel von 0057, aber eine eigene Aufgabe wert.** Kein Kriterium dieser Spec verlangt `StatusHeader` im Kopf, keine der zehn Stories setzt einen (die Status-Spalte heißt „Bearbeitung" und ist bewusst nicht `sortable`), und in keinem der zehn DOMs steht ein Knopf in einem Anker — der Fall tritt heute nicht ein. Er tritt aber sicher ein: §10 verlangt an jeder Status-Spalte einen `StatusHeader`, und `DataTable` ist die Klammer für genau die dreizehn Listenseiten. Die Reparatur ist keine Zeile in dieser Aufgabe, sondern ein Schnitt an `ColumnDef` — nur das sortierbare Wort in den Link, der Rest daneben (oder ein eigenes `sortLabel`) — und das ändert eine öffentliche Schnittstelle. Deshalb: eigene Aufgabe, bevor die erste Seite eine sortierbare Status-Spalte baut | eigene Aufgabe |

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte:
(1) die App-Zeile bleibt offen, bis `[year]/cases` auf den DataTable zieht;
(2) `headCell` und interaktiver Inhalt im Spaltenkopf — eigene Aufgabe, siehe
letzte Zeile.

## Nachtrag 2026-09-06 — die Aktionsspalte ist fest, nicht inhaltsbemessen

Beim Umbau auf ein echtes `<table>` (0106) gemessen: die Spur der
Aktionsspalte stand auf `max-content`, und weil Kopf und Zeile **eigene
Grids** sind, rechnete jede Seite sie für sich. Bei 700 px löste der Kopf sie
auf **54,2 px** auf („Aktionen"), die Zeile auf **176,4 px** (zwei Knöpfe) —
Kopf und Zeilen endeten 122 px auseinander. Derselbe Fehler wie
`width: "1fr"` statt `minmax(0, 1fr)`, nur eine Spalte weiter.

Jetzt steht die Spur auf `var(--v2-tbl-actions)`, Vorgabe **180 px** — das
Maß, das die gemessene Zeile braucht. Wer breitere Aktionen hat, setzt das
Token an seiner Tabelle hoch; wer schmalere hat, setzt es herunter.

**Kriterium (neu):** Kopf und Zeilen enden bei **vier** Breiten
(1440 · 1100 · 900 · 700) an derselben Kante. Gemessen nach dem Fix:
1405 · 1065 · 865 · 845, Kopf und Zeilen jeweils gleich.

## Nachtrag 2026-09-07 — die Zahlen des Pagers

Derselbe Befund wie in 0047 (**L-97**): `Pagination` schrieb „1–50 von 3400".
Die drei Zahlen laufen jetzt über `formatCount()` aus `format.ts` — dieselbe
Stelle, an der `formatAmount` und `formatBytes` stehen.

- [x] Von-bis und Vorrat stehen mit Tausendertrennung — Story `LastPage`, gemessen „6.201–6.212 von 6.212“

**Nachabnahme 2026-09-07 (fremd).** Sie kam zurück, und beide Punkte waren
berechtigt: der JSDoc der neuen Funktion war **deutsch** — ein festes
Kriterium beider Specs —, und das Kriterium stand in einer Story, in der es
sich gar nicht messen ließ: die größte Zahl war dreistellig, und „von 583“
sieht formatiert aus wie roh. Der Vorrat der Story ist deshalb angehoben; die
Regel beweist sich jetzt am eigenen Baustein statt an einer fremden Liste.

Dazu: fünf Zähler im Set formatierten weiter selbst (`toLocaleString` in
`AccountEntries`, `account-columns`, `Account`, `BankTransactionWorklist`) —
genau das, wovor der neue JSDoc warnt. Sie lesen jetzt `formatCount`.
**Befund beim Bauen (2026-09-07):** unterhalb von 1280 px bricht die
Mengenangabe der `Pagination` auf zwei Zeilen um — gemessen bei 420 px, sauber
ohne Überlauf und ohne Dokument-Scroll. **Das ist unter L1 kein Fall:** die
Guidelines setzen „Desktop ab 1280 px Innenbreite. Kein Mobile-, kein
Tablet-Ziel. Darunter Sperre mit einem Satz" fest, und `AppShell` (0030) setzt
sie um. Der Satz steht hier, damit niemand die Messung später als offene
Aufgabe missversteht: an der Grenze selbst (1280 px) ist die Leiste einzeilig,
in jeder gemessenen Liste.

## Nach der Abnahme (2026-09-07, im Auftrag des Owners, designsystem-f0)

**Der Ladefall zählte die Griff-Spuren nicht mit.** `TableLoading` bekam
`cols={columns.length}` — die Spuren für Auswahl, Aufklapp-Griff und Aktionen
fehlten. Die Folge war keine Kleinigkeit: die ganze Ladezeile rutschte um eine
Spur nach links, der erste Balken lag im 32-px-Auswahlkästchen, und die letzte
Spur blieb leer. Gemessen an `BankTransactionWorklist/LoadingAndError`: Kopf
sechs Zellen und Kante 1247, Ladezeile fünf Zellen und Kante 1107 — 140 px
Unterschied. Gefunden hat es die Abnahme von 0086; die Ursache liegt hier, und
es trifft **jede** Liste mit `selection`, `expand` oder `rowActions`.

`TableLoading` nimmt jetzt `leadingCols` und `trailingCols`: Spuren ohne
eigenen Inhalt bekommen ihre Zelle, aber **keinen Balken** — ein Balken im
Auswahlkästchen sähe aus wie eine ladende Checkbox, und die Aktionsspalte hat
keine Daten. `DataTable` rechnet die Zahlen aus denselben drei Props, aus
denen es auch seine Spuren baut.

Nachgemessen nach der Reparatur, je Kopfzelle gegen Ladezelle:

| Story | Kopf | Ladezeilen | Kanten |
|---|---|---|---|
| `BankTransactionWorklist/LoadingAndError` | 6 | 6 | 67 · 177 · 367 · 897 · 1107 · 1247, deckungsgleich |
| `DataTable/Loading` | 5 | 5 | 145 · 905 · 1045 · 1245 · 1405, deckungsgleich |
| `AccountEntries/Lädt` | 7 | 7 | 118 · 152 · 258 · 393,6 · 490 · 604 · 718, deckungsgleich |
| `Table/Loading` | 4 | 4 | 975 · 1105 · 1265 · 1405, deckungsgleich |
| `Zellen/Loading` | 5 | 5 | 225 · 345 · 505 · 625 · 1405, deckungsgleich |

Der erste Balken liegt jetzt bei x = 77 statt 22,4 — hinter dem Kästchen, das
bei 67 endet.

### Abnahmekriterium (Nachtrag)

- [ ] Im Ladezustand hat jede Zeile so viele Zellen wie die Kopfzeile, und die
      rechten Kanten sind deckungsgleich — gemessen, mit `selection`,
      `expand` und `rowActions` je einzeln und zusammen
