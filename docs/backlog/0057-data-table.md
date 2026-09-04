# 0057 · DataTable — die Listenseite als eine Klammer

| | |
|---|---|
| Status | Abnahme |
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

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | … |

Abgenommen von / am: … · Offene Punkte: …
