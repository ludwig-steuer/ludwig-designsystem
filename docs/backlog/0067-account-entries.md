# 0067 · `AccountEntries` — die Bewegungen eines Kontos, DATEV führend

| | |
|---|---|
| Status | spec |
| Stufe | `entities/account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Soll/Haben, Gegenkonto, Belegfeld 1, DATEV-Spiegel |
| Quelle | Entitätsprofil `docs/entitaeten/account.md` (Status `geprüft`), Abschnitte „Datenpunkte einer Bewegung", „Die Herkunft in Zahlen", „Listen" · Owner-Entscheide 2026-09-04 (eine Liste statt zwei Tabs · Symbol bei Ludwig-Bezug · kein laufender Saldo je Zeile) · `design-guidelines.md` A11/A11a |
| Ersetzt | die **drei** von Hand gesetzten Bewegungstabellen in `ludwig/app`: `AccountLedgerDrawer.tsx` (DATEV-`<tbody>` Z. 152–212 und Ludwig-`<tbody>` Z. 243–310) und die zwei Auszüge im Tab „Buchungen" der Kontoseite |
| Blockiert | 0068 (`AccountDrawer`, Zone 3b) · 0063 (`AccountView`, Tab „Buchungen") |
| Setzt voraus | 0066 (`AccountCell` für das Gegenkonto) · 0057 `DataTable` (nur für die **Seite**, nicht für den Drawer — A11a) |
| Spec von / am | Claude, 2026-09-04 |

## Ziel

Die Sachbearbeiterin öffnet das Konto `1210` und will sehen, **was darauf
liegt** — und zwar das, was DATEV kennt, denn das ist die Wahrheit. Was
Ludwig zusätzlich gebucht hat, will sie auch sehen, aber nachrangig.

Heute sind das zwei Tabs mit zwei verschiedenen Tabellen: der DATEV-Tab kennt
Stapel und Sachverhalt, der Ludwig-Tab Saldo und Buchungszustand, die
Spaltensätze überschneiden sich zur Hälfte, und um beide Seiten zu
vergleichen, muss sie hin- und herschalten. Die Frage ist aber **eine**.

Neu: **eine Liste, die Herkunft in der Zeile.** Alle Spiegelsätze plus die
Ludwig-Sätze, die DATEV noch nicht kennt. Der Normalfall — 98 % der Sätze —
trägt kein Zeichen und bleibt ruhig; die Zeilen mit Ludwig-Bezug tragen eins.

## Einordnung

**Wiederverwenden — geprüft, reicht nicht:**

| `@when`-Treffer | warum er nicht reicht |
|---|---|
| `DataTable` — „A list page: columns, page, sorting over the URL, selection with bulk actions …" (0057) | Deckt die **Seite** vollständig ab — dort wird nichts Neues gebaut, die Spalten dieser Aufgabe gehen hinein. Deckt den **Drawer** nicht: `DataTable` führt Seite, Größe und Sortierung über die URL (0057 E1/E2 — ohne `href` kein Pager und kein sortierbarer Kopf), und ein Drawer kennt das Routing nicht (0052). Dazu ist „Mehr laden" Client-State, den `DataTable` nicht kennt, und eine `Card` im Drawer doppelt dessen Kopf. Genau die Grenze, die A11a zieht. |
| `Table`/`HeadRow`/`Row` — „Records of the same kind in columns" | Das Raster, ja — es weiß aber nicht, welche Spalten eine Bewegung hat und was ihre Herkunft bedeutet. Die Liste **setzt darauf auf**. |
| `ClarificationList` — „The clarifications of a case … few rows" | Der Nachbarfall und die Gegenprobe: dort **keine** `DataTable`, weil eine Klärung Titel, Zustand und Meta-Zeile hat, keine Spalten. Eine Bewegung hat Spalten. |
| `LogList`/`LogBrowser` | Zeilen mit Zeit und Stufe, aber ohne Soll/Haben-Ordnung und ohne zweite Quelle. |
| `JournalEntryCard` (0044) | Die Zeilen **eines Satzes** (Konto · Kontoname · Buchungstext · Soll · Haben). Hier: Zeilen **vieler Sätze auf einem Konto** (Datum · Beleg · Text · Gegenkonto · Soll · Haben). Zwei Fragen, zwei Tabellen, dieselben Zellen-Primitives — ausdrücklich **keine** gemeinsame Komponente mit Spaltenkonfiguration. |
| `Pagination` — „A list longer than one page, paged over the URL" | Der Weg der Seite. Der Drawer braucht „Mehr laden" ohne URL. |

**Neu, weil:** §3.5 — das Profil führt die Liste als eigenen Job („was liegt
sonst auf dem Konto") mit zwei belegten Screens. Die **Spaltenfunktion** statt
eines Tabellen-Wrappers folgt A11 (Owner 2026-09-04).

**Zuschnitt: Familie, eine Datei** `AccountEntries.tsx`, zwei Exporte —
`accountEntryColumns()` (eine Funktion) und `AccountEntryList` (die Klammer
für den Drawer). Grund nach §4: gemeinsames Vokabular (dieselbe `AccountEntry`,
dieselbe Herkunfts-Ableitung, dieselben Zellen), und die beiden treten nie
getrennt auf — die Liste rendert die Spalten, die Seite reicht sie an
`DataTable`. Zusammen 8 Stories, ~230 Zeilen.

**Setzt auf:** `ColumnDef` aus `patterns/DataTable`, `Table`/`HeadRow`/`Row`,
`AmountCell`, `MonoCell`, `Time`, `StatusBadge` (Achse `buchung_datev`),
`AccountCell` (0066), `EmptyState inline`, `TableLoading`, `ErrorRow`,
`TextButton`, `ENTITY_ICON.buchung` aus `patterns/entity-icons`.

## Schnittstelle

```ts
/** Eine Bewegung auf einem Konto — die Vereinigung beider Quellen.
 *  Strukturell aus `TruthAccountEntryRow` (DATEV) und `AccountLedgerRow`
 *  (Ludwig) der App; beide passen ohne Umbau herein. */
export interface AccountEntry {
  id: string;
  /** `posting_date` bzw. `booking_date` — 100 % gefüllt in beiden Quellen. */
  postingDate: string;
  /** Belegfeld 1 (100 % im Spiegel gefüllt). */
  documentNumber: string | null;
  /** Buchungstext, p90 31 Zeichen, EXTF-Grenze 60. */
  text: string | null;
  /** Die übrigen Konten des Satzes. p50 1, p90 2, max 4. */
  contraAccounts: readonly { number: string; name?: string | null }[];
  /** Betrag auf **diesem** Konto. Genau eines der beiden ist gesetzt. */
  debit: number | null;
  credit: number | null;
  origin: AccountEntryOrigin;
  /* — nur `full` (die Seite); im Drawer ungenutzt — */
  batchId?: string | null;        // accounting_sequence_id
  /** Achse `buchung`, nur bei Ludwig-Herkunft. */
  status?: string | null;
  /** DATEV-Herkunftskennzeichen RE/WK/SV/JA/AN/KS (47 % gefüllt). */
  markOfOrigin?: string | null;
  caseNumber?: string | null;
}

/** Die vier Klassen aus dem Profil. Der Aufrufer leitet sie ab, die Zeile
 *  zeigt sie — sie rechnet nicht selbst. */
export type AccountEntryOrigin =
  /** Spiegelsatz, `match_state ∈ {new_unprocessed, unclear, NULL}` — 98 %. */
  | "datev"
  /** Spiegelsatz, `match_state LIKE 'matched_%'`. */
  | "mirrored"
  /** Ludwig-Satz, exportiert, in DATEV nicht wiedergefunden — 111 Sätze. */
  | "exported"
  /** Ludwig-Satz, weder exportiert noch gespiegelt. */
  | "ludwig";
```

`accountEntryColumns(opts)` → `ColumnDef<AccountEntry>[]`:

| Option | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `currency` | `Currency` | ja | Währung aller Beträge der Liste | `Filled` |
| `variant` | `"compact" \| "full"` (Default `"compact"`) | nein | `compact` = Ränge 1–6 (Datum, Herkunft, Beleg, Text, Gegenkonto, Soll, Haben) für den Drawer; `full` = zusätzlich Stapel, Buchungszustand, DATEV-Kennzeichen für die Seite | `Varianten` |
| `accountHref` | `(number: string) => string` | nein | Macht die Gegenkonten klickbar (Kontowechsel im Drawer, Sprung auf der Seite) | `InUse` |

`AccountEntryList` — die Klammer für den Drawer:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `entries` | `readonly AccountEntry[]` | ja | Die Bewegungen **eines Jahres**, neueste zuerst — die Liste sortiert nicht | `Filled` |
| `currency` | `Currency` | ja | an die Spalten durchgereicht | `Filled` |
| `total` | `number` | nein | Vorratszähler: „25 von 2.937". Ohne ihn gilt `entries.length` | `Nachladen` |
| `onShowMore` | `() => void` | nein | „Mehr laden". Gesetzt → der Knopf steht unter der Tabelle, solange `entries.length < total` | `Nachladen` |
| `accountHref` | `(number: string) => string` | nein | wie oben | `InUse` |
| `loading` | `boolean` | nein | Ladefläche **in der Form des Inhalts** — Kopfzeile bleibt stehen | `Laedt` |
| `error` | `{ message: string; retry?: ReactNode }` | nein | Fehler beim Laden | `Fehler` |
| `empty` | `{ title: string; description?: ReactNode }` | nein | Leertext; Default „Auf diesem Konto ist in diesem Jahr nichts gebucht." | `Leer` |

**Typen:** `Currency` aus `@/ludwig/shared/money`, `ColumnDef` aus
`patterns/DataTable`. **GLOSSARY:** englisch im Code (`postingDate`,
`contraAccounts`, `documentNumber`), deutsch im Label („Datum", „Beleg",
„Gegenkonto", „Soll", „Haben").

**Befund an `ludwig/app`:** `AccountEntry` hat kein Gegenstück in
`src/ludwig/`. Es existiert zweimal getrennt — `AccountLedgerRow`
(snake_case, Beträge als `string`) und `TruthAccountEntryRow` (camelCase,
Beträge als `number`) — und keiner der beiden trägt die Herkunft als Wert.
Die Vereinigung ist heute die Tab-Umschaltung im Drawer. Ein kanonisches
`AccountEntry` in der App wäre die saubere Ablösung; hier ist es definiert,
strukturell deckungsgleich zu beiden.

**Was die Familie bewusst nicht kann:**

- **nicht vereinigen** — der Aufrufer liefert die fertige, sortierte Menge
  und hat die Tombstones (`match_state LIKE 'disappeared%'`, 32 Sätze)
  ausgeschlossen. Täte die Liste es selbst, bräuchte sie beide Rohquellen und
  wüsste vom `content_hash`. (`@instead`: die Server-Action der Seite.)
- **nicht sortieren** — „neueste zuerst" ist die Ordnung der Grundgesamtheit;
  auf der Seite sortiert `DataTable` über die URL. (`@instead`: 0057.)
- **keinen laufenden Saldo** — Owner-Entscheid 2026-09-04: über zwei Quellen
  wäre er eine Mischung. (`@instead`: `AccountFacts` trägt beide Salden.)
- **nicht filtern** — kein Herkunfts-Filter, keine Suche. Die Suche der Seite
  ist ein Prop der Seite. (`@instead`: `FilterBar`, `SearchInput`.)
- **das Jahr nicht kennen** — sie bekommt die Zeilen eines Jahres, nicht das
  Jahr. (`@instead`: `AccountDrawer`, 0068.)
- **nichts laden und nichts schreiben.**

## Verhalten

**Server-Components**, beide. `onShowMore` ist ein Callback, den eine
Client-Insel des Aufrufers hält — der Drawer ist ohnehin `"use client"`.

**Die Spalten** (`compact`), in Leserichtung:

| # | Spalte | Zelle | Breite | Ausrichtung |
|---|---|---|---|---|
| 1 | Datum | `Time` (Datum, ohne Uhrzeit) | 84px | start |
| 2 | — | **Herkunfts-Zeichen** (siehe unten) | 20px | start |
| 3 | Beleg | `MonoCell` | 96px | start |
| 4 | Buchungstext | Text, Ellipse ab p90 (31 Zeichen) | 1fr | start |
| 5 | Gegenkonto | `AccountCell` (0066), bei mehreren die erste plus „+n" | 1.2fr | start |
| 6 | Soll | `AmountCell` | 104px | end |
| 7 | Haben | `AmountCell` | 104px | end |

`full` hängt an: Stapel (`MonoCell`, 88px), Buchungszustand
(`StatusBadge axis="buchung"`, 110px), DATEV-Kennzeichen (`MonoCell`, 56px).
Der Sachverhalt (`caseNumber`, 2 % gefüllt) bekommt **keine** eigene Spalte —
Befund 3 des Profils; er steht im `title` des Belegs.

**Die Herkunft — und warum sie kein Status ist.** R1 sagt: `StatusBadge` ist
die einzige erlaubte Status-Darstellung. Das Zeichen in Spalte 2 zeigt
deshalb **keinen Status**, sondern eine **Herkunft**: hinter dieser Bewegung
steht eine Ludwig-Buchung, ja oder nein. Dafür gibt es im Set bereits ein
Zeichen — `ENTITY_ICON.buchung` (`BookOpen`) aus `patterns/entity-icons.ts`;
kein neues Vokabular:

| `origin` | Spalte 2 | Zeile | zusätzlich |
|---|---|---|---|
| `datev` (98 %) | **leer** | normal | — |
| `mirrored` | `BookOpen`, `title` „Von Ludwig gebucht, in DATEV bestätigt" | normal | — |
| `exported` | `BookOpen`, `title` wie Registry | normal | `StatusBadge axis="buchung_datev" status="exported"` in Spalte „Buchungszustand" (`full`) bzw. hinter dem Text (`compact`) |
| `ludwig` | `BookOpen` | **gedämpft** (`.v2ae__row--draft`) | — |

Die Dämpfung ist Hierarchie über Textfarbe, **keine** Kritikalitätsfarbe —
A7 bleibt unberührt. Der eine echte Chip steht dort, wo wirklich etwas
schiefgegangen ist: 111 Sätze, die exportiert wurden und in DATEV nicht
ankamen. Jedes Zeichen trägt `title` und `aria-label`; ein Symbol ohne Wort
wäre für Screenreader stumm.

**Mechanik nach dem Profil:** p50 4 Bewegungen je Konto und Jahr, p90 20,
p99 250, max 3.400 (Bankkonto 1211). Also kein virtuelles Scrollen, kein
Serverfilter — aber **Nachladen in Seiten** mit Vorratszähler. Der Knopf
verschwindet, wenn `entries.length >= total`.

**Zustände** (V9): gefüllt · leer · lädt · Fehler. „Leer nach Filter" gibt es
nicht — die Liste filtert nicht; die Grundgesamtheit ist Konto + Jahr, und
„nichts gebucht" ist ein Befund, kein Filterproblem (T6). Der Leertext nennt
deshalb das Jahr und bietet **keinen** Knopf: der Drawer ist lesend.

**Ladefläche in der Form des Inhalts** (Nachbesserung M2 aus 0052): `Skeleton`
in Zeilenform, Kopfzeile bleibt stehen — nicht ein Kasten über der ganzen
Fläche.

**Tastatur:** die Gegenkonten sind Links (aus `AccountCell`), „Mehr laden"
ist ein Knopf. Sonst nichts fokussierbar — die Zeile selbst ist kein Link:
eine Bewegung hat im Drawer kein Ziel, das nicht schon in der Zeile steht.

**CSS:** neue Wurzel `.v2ae` in `src/styles/v3.css`, neuer Abschnitt am Ende
mit Aufgabennummer (`grep -n "\.v2ae" src/styles/v3.css` zeigt heute nichts).

## Stories

Titel `v3/Entitäten/Konto/AccountEntries`.

| Story | Beweist |
|---|---|
| `Filled` | Sechs Bewegungen des Kontos 1210, alle vier `origin`-Werte vertreten — `entries`, `currency`, die Zeichen-Regel |
| `Varianten` | `compact` und `full` untereinander mit denselben Zeilen — die drei zusätzlichen Spalten |
| `Nachladen` | `total: 2937`, 25 Zeilen, Knopf „Mehr laden" mit Vorratszähler; Rundlauf über `onShowMore` mit `useState` |
| `Leer` | `entries: []` — „Auf diesem Konto ist in diesem Jahr nichts gebucht.", kein Knopf |
| `Laedt` | `loading` — Zeilen-Skelett, Kopfzeile steht |
| `Fehler` | `error` mit `retry` |
| `InUse` | `compact` in einem `Drawer` (wie 0068 sie einsetzt) **und** `full` als Spalten in `DataTable` mit Pager — der Beweis für A11: eine Spaltenquelle, zwei Klammern |
| `Edges` | Buchungstext 60 Zeichen (Ellipse), vier Gegenkonten („+3"), Betrag `0,00 €` und negativ, Kontonummer `0420`, ein Satz ohne Beleg und ohne Text |

Acht Stories: 4 Zustände (gefüllt, leer, lädt, Fehler) + 1 Enum-Prop
(`variant`, beide Werte in einer Story) + 1 Callback (`onShowMore`) + 1 „im
Einsatz" + 1 Rand. Genau die Formel aus §6.

## Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt (`AccountEntries.tsx`), Story daneben, Titel `v3/Entitäten/Konto/AccountEntries`
- [ ] Code englisch; `@when`/`@instead` an **beiden** Exporten
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle acht Stories vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `accountEntryColumns()` ist eine **Funktion**, die `ColumnDef<AccountEntry>[]` liefert — keine Komponente, kein Wrapper um `DataTable` (A11; `grep -n "DataTable" AccountEntries.tsx` findet nur den Typ-Import)
- [ ] `variant: "compact"` liefert 7 Spalten, `"full"` 10 (Story `Varianten`, Spalten im DOM gezählt)
- [ ] `origin: "datev"` zeigt **kein** Zeichen in Spalte 2 (Story `Filled`, DOM: Zelle leer)
- [ ] `origin: "ludwig"` dämpft die Zeile; die Dämpfung ist Textfarbe, **keine** Kritikalitätsfarbe aus §3 (Story `Filled`, `getComputedStyle`)
- [ ] `origin: "exported"` zeigt zusätzlich den `StatusBadge` der Achse `buchung_datev` (Story `Filled`)
- [ ] Jedes Herkunfts-Zeichen trägt `title` **und** `aria-label` (Story `Filled`, DOM)
- [ ] Keine Zeile trägt eine Saldospalte (Story `Varianten` — auch `full` hat keine)
- [ ] Mehrere Gegenkonten: das erste steht, der Rest als „+n" (Story `Edges`)
- [ ] „Mehr laden" erscheint nur, solange `entries.length < total`, und nennt den Vorrat (Story `Nachladen`)
- [ ] Leertext nennt das Jahr und trägt **keinen** Knopf (Story `Leer`)
- [ ] Ladefläche hat die Form des Inhalts, Kopfzeile bleibt stehen (Story `Laedt`)
- [ ] Dieselben Spalten laufen in `DataTable` **und** in der nackten `Table` (Story `InUse`)
- [ ] Die Familie vereinigt nichts und sortiert nichts: kein `filter`, kein `sort`, kein `disappeared` in der Datei
- [ ] Ersetzt die drei Handtabellen in `ludwig/app` ohne Funktionsverlust — bis auf die Spalte „Sachverhalt", die in den `title` wandert → **offen (App)**

## Offene Fragen

1. **Ellipse oder Umbruch beim Buchungstext?** p90 ist 31 Zeichen, max 60. —
   *Ohne Antwort: Ellipse mit `title`, wie überall im Set. Eine zweizeilige
   Zeile bräche das Raster für 10 % der Zeilen.*
2. **Der Chip bei `exported` im `compact`-Modus.** Dort gibt es keine
   Spalte „Buchungszustand". — *Ohne Antwort: hinter dem Buchungstext, in
   derselben Zelle. Er betrifft 111 von 42.153 Sätzen; eine eigene Spalte für
   0,3 % der Zeilen kostet Breite in allen.*
3. **Zeile klickbar?** Auf der Seite könnte die Zeile in den Buchungssatz
   führen (`?entry=<id>`). — *Ohne Antwort: nein, keine `rowHref` in dieser
   Spec. Die Seite kann sie über `DataTable`s `rowHref` selbst setzen, ohne
   dass die Spaltenfunktion davon weiß.*

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
