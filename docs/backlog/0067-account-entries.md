# 0067 · `AccountEntries` — die Bewegungen eines Kontos, DATEV führend

| | |
|---|---|
| Status | fertig |
| Stufe | `entities/account/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein**: Soll/Haben, Gegenkonto, Belegfeld 1, DATEV-Spiegel |
| Quelle | Entitätsprofil `docs/entitaeten/account.md` (Status `geprüft`), Abschnitte „Datenpunkte einer Bewegung", „Die Herkunft in Zahlen", „Listen" · Owner-Entscheide 2026-09-04 (eine Liste statt zwei Tabs · Symbol bei Ludwig-Bezug · kein laufender Saldo je Zeile) · `design-guidelines.md` A11/A11a |
| Ersetzt | die **drei** von Hand gesetzten Bewegungstabellen in `ludwig/app`: `AccountLedgerDrawer.tsx` (DATEV-`<tbody>` Z. 152–212 und Ludwig-`<tbody>` Z. 243–310) und die zwei Auszüge im Tab „Buchungen" der Kontoseite |
| Blockiert | 0068 (`AccountDrawer`, Zone 3b) · 0063 (`AccountView`, Tab „Buchungen") |
| Setzt voraus | 0066 (`AccountCell` für das Gegenkonto) · 0057 `DataTable` (nur für die **Seite**, nicht für den Drawer — A11a) |
| Spec von / am | Claude, 2026-09-04 |
| Freigegeben | Owner, 2026-09-04 |
| Gebaut von / am | Claude, 2026-09-04 — `AccountEntries.tsx`, acht Stories, CSS-Block `.v2ae*` |

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
| `empty` | `{ title: string; description?: ReactNode }` | nein | Leertext; Default **„Keine Bewegungen."** — jahresfrei, weil die Liste das Jahr nicht kennt. Wer es kennt, nennt es (der Drawer tut das) | `Leer` |

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
- [ ] Der **Aufrufer** nennt das Jahr im Leertext (Story `Leer`), der eingebaute Default bleibt jahresfrei (Schnittstellen-Zeile `empty`); der Leerzustand trägt **keinen** Knopf
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

## Abweichungen von der Spec

| Punkt | Spec | Gebaut | Grund |
|---|---|---|---|
| `onShowMore: () => void` | die Liste rendert den „Mehr laden"-Knopf selbst | **`more?: ReactNode`** — der Aufrufer gibt seinen Knopf hinein, den Vorratszähler daneben schreibt die Liste | Ein `onClick` macht die Komponente zur Client-Component. Die Spec verlangt eine Server-Component *und* einen Callback — das schließt sich aus. So bleibt die Liste server-tauglich, der Drawer (ohnehin `"use client"`) baut den Knopf, und die Formulierung des Zählers bleibt an einer Stelle. |
| Leere Betragsseite | `AmountCell` je Spalte | **leer**, kein Geviertstrich | `AmountCell` liest `null` als „unbekannt" und zeigt „—". Auf welcher Seite eine Bewegung steht, sagt aber *welche* Spalte die Zahl trägt — sechs Geviertstriche in sechs Zeilen behaupten sechsmal Unwissen, das es nicht gibt. Dieselbe Regel wie im Journalblock (0044). |
| Spaltenbreiten | Text `1fr`, Gegenkonto `1.2fr`; Herkunft 20 px, Buchungszustand 110 px, DATEV 56 px | Text `1.6fr`, Gegenkonto `1.1fr`, Herkunft 24 px, Buchungszustand 132 px, DATEV 64 px | Browser-Befund: mit dem `exported`-Chip in der Textzelle blieb vom Buchungstext nur ein Buchstabe übrig. Die drei Pixelspuren wuchsen beim Bauen um 4–22 px, damit Zeichen, Chip und Kennzeichen nicht an ihrer Spurgrenze kleben — beim Schreiben der Spec geschätzt, beim Bauen gemessen. Nachgetragen in Runde 2 der Abnahme. |
| Default-Leertext | „Auf diesem Konto ist in diesem Jahr nichts gebucht." | **„Keine Bewegungen."** | Nachbesserung aus der ersten Abnahme: die Liste bekommt das Jahr nicht, und „in diesem Jahr" ohne Jahresangabe liest sich wie „nie". Der Satz sagt jetzt nur, was die Liste weiß; der Drawer setzt den vollen Satz mit Jahr. |

**Drei Befunde aus dem ersten Browser-Durchgang, behoben:** der Kontoname im
Gegenkonto brach um und machte die Zeilenhöhen ungleich (`overflow` greift an
einem reinen Inline-`span` nicht → Flex); der `exported`-Chip ragte über die
Nachbarspalte (Textzelle jetzt Flex, Chip mit `flex-shrink: 0`); die leeren
Betragsseiten zeigten Geviertstriche.

## Abnahme

Zwei Runden. Runde 1 (2026-09-04) schickte die Aufgabe mit einem ✗ zurück,
Runde 2 prüfte die Nachbesserung aus Commit `0ae2dad` nach — Storybook auf
Port 6122, DOM-Messungen im Preview-Frame, `pnpm typecheck` und `pnpm build`
je Exit 0 (in beiden Runden).

| Kriterium | Nachweis (Story-ID · Befehl · Messung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | beide Läufe Exit 0, in Runde 2 wiederholt | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel `v3/Entitäten/Konto/AccountEntries` | `AccountEntries.tsx` + `.stories.tsx`; `index.json`: `v3-entitäten-konto-accountentries--*` | ✓ |
| Code englisch; `@when`/`@instead` an **beiden** Exporten | `AccountEntries.tsx` an `accountEntryColumns` und `AccountEntryList` | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | kein Hex; px nur als Grid-Spurbreiten (`width: "84px"` …) wie in `Log.tsx`/`ComparisonTable.tsx`; Chips über `StatusBadge axis="buchung"`/`"buchung_datev"` | ✓ (Anmerkung 3) |
| Alle acht Stories vorhanden; ausgeschlossene Zustände begründet | `Filled`, `Varianten`, `Nachladen`, `Leer`, `Laedt`, `Fehler`, `InUse`, `Edges` — 8/8; „leer nach Filter" begründet ausgeschlossen (die Liste filtert nicht) | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | durchgegangen; ein Fund zur Zeilenhöhe → Anmerkung 1 | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | alle acht Stories gerendert, gemessen, „Mehr laden" zweimal geklickt | ✓ |
| `accountEntryColumns()` ist eine **Funktion**, kein Wrapper um `DataTable` | `grep -n "DataTable" AccountEntries.tsx` → nur `import type { ColumnDef }` und JSDoc-Prosa | ✓ |
| `variant: "compact"` liefert 7 Spalten, `"full"` 10 | `Varianten`, Kopfzellen im DOM gezählt: 7 (Datum · — · Beleg · Buchungstext · Gegenkonto · Soll · Haben) und 10 (+ Stapel · Buchungszustand · DATEV) | ✓ |
| `origin: "datev"` zeigt **kein** Zeichen in Spalte 2 | `Filled`, Zeilen 1/5/6: Zelle 2 enthält `<span></span>`, Textinhalt leer | ✓ |
| `origin: "ludwig"` dämpft die Zeile über die Textfarbe, keine Kritikalitätsfarbe | `Filled`, `getComputedStyle`: gedämpfte Zeile `rgb(92,92,92)` = `--color-text-muted`, alle anderen `rgb(45,45,45)` = `--color-text`; keine Danger-/Warning-Fläche | ✓ |
| `origin: "exported"` zeigt zusätzlich den `StatusBadge` der Achse `buchung_datev` | `Filled` (compact): Chip „Exportiert" hinter dem Buchungstext; `Varianten` (full): derselbe Chip in der Spalte „Buchungszustand" | ✓ |
| Jedes Herkunfts-Zeichen trägt `title` **und** `aria-label` | `Filled`: alle drei Marken mit identischem `title`/`aria-label` und `role="img"`, das SVG `aria-hidden` | ✓ |
| Keine Zeile trägt eine Saldospalte | `Varianten`: Kopfzeilen beider Varianten enthalten kein „Saldo" | ✓ |
| Mehrere Gegenkonten: das erste steht, der Rest als „+n" | `Edges`: „0420 Betriebs- und … +3", `title` des „+3" nennt die drei übrigen; `Filled`: „4400 Erlöse 19 % USt +2" | ✓ |
| „Mehr laden" erscheint nur, solange `entries.length < total`, und nennt den Vorrat | `Nachladen`: „Mehr laden · 3 von 2.937 Bewegungen", nach zwei Klicks „6 von 2.937"; `Filled` (ohne `total`) hat keinen Bereich `.v2ae__more` | ✓ |
| Leertext nennt das Jahr und trägt **keinen** Knopf | `Leer` (Runde 2 nachgemessen): „Auf diesem Konto ist im Wirtschaftsjahr 2026 nichts gebucht.", 0 `button`/`a` im Story-Root, Kopfzeile steht. Das Jahr nennt planmäßig der **Aufrufer** — die Liste kennt es nicht (siehe die nächste Zeile und Anmerkung 5) | ✓ |
| Der **Default**-Leertext behauptet nichts, was die Liste nicht weiß | Runde 1 ✗ („Auf diesem Konto ist nichts gebucht." — las sich wie „nie"). Runde 2: `AccountEntries.tsx:322` sagt „Keine Bewegungen."; Schnittstellen-Zeile `empty` und die Abweichungs-Tabelle sind nachgezogen, der Drawer setzt weiter den vollen Satz mit Jahr (`AccountDrawer.tsx:167`) | ✓ |
| Ladefläche hat die Form des Inhalts, Kopfzeile bleibt stehen | `Laedt`: `.v2tbl__head` mit sieben Zellen steht, darunter sechs Skelett-Zeilen zu je sieben Zellen | ✓ |
| Dieselben Spalten laufen in `DataTable` **und** in der nackten `Table` | `InUse`: zwei `.v2tbl` im DOM mit 10 (in `DataTable`, mit Pager) und 7 Kopfzellen (im `Drawer`), eine Spaltenquelle | ✓ |
| Die Familie vereinigt nichts und sortiert nichts | `grep -nE "\.filter\(|\.sort\(|\.reduce\("` findet nichts; „disappeared" steht nur im JSDoc, das den Ausschluss beim Aufrufer erklärt | ✓ |
| Abweichungen von der Spec stichhaltig begründet | `more?: ReactNode`, leere Betragsseite, die zwei `fr`-Breiten und (seit Runde 2) der Default-Leertext stehen mit Grund in der Tabelle; offen bleibt allein Anmerkung 2 | ✓ |
| Ersetzt die drei Handtabellen in `ludwig/app` | Ablösung in der App ist ein eigener Schritt (`docs/backlog/README.md`) | **offen (App)** |

**Befund der ersten Runde — behoben.**

| # | Befund (Runde 1) | Behebung, in Runde 2 nachgemessen |
|---|---|---|
| 1 | Der Default-Leertext lautete „Auf diesem Konto ist nichts gebucht." und behauptete damit mehr, als die Liste weiß — nur das gezeigte Jahr ist leer. Die Abweichung stand in keiner Tabelle. | `AccountEntries.tsx:322` sagt „Keine Bewegungen." — jahresfrei, weil die Liste das Jahr nicht bekommt; das ist die saubere Auflösung und besser als der ursprüngliche Spec-Satz. Schnittstelle und Abweichungs-Tabelle sind nachgezogen; `Leer` und der Drawer nennen das Jahr weiterhin. |

| # | Anmerkung (kein ✗) | Beleg |
|---|---|---|
| 1 | `Edges`, Zeile 1 ist 71 px hoch statt 35 px: der 28-stellige Beleg bricht in der 96-px-Spalte dreizeilig um (`MonoCell` kürzt nicht). Text- und Gegenkonto-Zelle kürzen sauber, die Ungleichheit kommt allein vom Beleg. V1 („Zeilenhöhe ≤ `.v2tbl__row`") reißt damit an einem Rand, den die Story selbst gewählt hat. | Story `Edges`, `getBoundingClientRect` |
| 2 | **Noch offen.** Drei Spaltenbreiten weichen ab, ohne in der Abweichungs-Tabelle zu stehen: Herkunft 20→24 px, Buchungszustand 110→132 px, DATEV-Kennzeichen 56→64 px. Die Zeile „Spaltenbreiten" nennt weiterhin nur Text und Gegenkonto. Unkritisch, aber die Tabelle soll vollständig sein. | `AccountEntries.tsx:169`, `:241`, `:254` gegen die Spalten-Tabelle unter „Verhalten" |
| 3 | `ORIGIN_TITLE` ist keine Status-Map (die Herkunft ist keine Achse), aber der Titel für `exported` formuliert die Registry-Beschreibung nach, statt sie zu nehmen — die Spec sagt „`title` wie Registry". Der Chip daneben trägt den Registry-Text bereits. | `AccountEntries.tsx:83` vs. `status-registry.ts:813` |
| 4 | Das variable Kriterium „Leertext nennt das Jahr" steht nach der Nachbesserung neben einer Schnittstelle, deren Default das Jahr bewusst **nicht** nennt. Gemeint ist „der Aufrufer nennt das Jahr"; der Wortlaut sollte dem folgen, sonst widerspricht die Prüfliste ihrer eigenen Schnittstelle. | Kriterienliste gegen Schnittstellen-Zeile `empty` |

Abgenommen von / am: Claude (Abnahme), 2026-09-04 (Runde 1) · 2026-09-04
(Runde 2, nach Commit `0ae2dad`) · Ergebnis: **fertig** · Offene Punkte:
keine blockierenden; Anmerkungen 2 und 4 sind Textpflege in dieser Spec, das
App-Kriterium bleibt planmäßig **offen (App)**.
