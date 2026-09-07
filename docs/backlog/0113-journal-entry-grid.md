# 0113 · `JournalEntryGrid` — das Lese-Raster aus dem Editor lösen

| | |
|---|---|
| Status | Abnahme |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | nein — Buchungssatz, BU, Belegfeld sind Fachbegriffe |
| Quelle | `docs/backlog/0015-journal-entry-editor-f109.md`, Abschnitt „Stories — 17, mit begründeter Ausnahme"; Abnahme 0015 vom 2026-09-07, Mangel M10 |
| Auftrag | `JournalEntryEditor` in zwei Bausteine schneiden: **`JournalEntryGrid`** (lesend) und `JournalEntryEditor` (bearbeitend). Damit endet die Story-Ausnahme von 0015 — heute 17 Stories, nach dem Schnitt 8 lesend und 9 bearbeitend, beide unter der Grenze von 10. |
| Vertagt, weil | 0015 hatte drei benannte Nachträge; ein Schnitt derselben Datei in derselben Runde hätte beides unprüfbar gemacht. |
| Angelegt von / am | Claude, 2026-09-07 (aus der Abnahme von 0015) |

## Warum

`spec-schreiben` §4 nennt den Grund wörtlich: **„ein Teil braucht `"use
client"`, der Rest nicht"**. Sieben der 14 alten Stories laufen mit
`editable={false}`; sie zeigen ein Raster, das nichts entgegennimmt. Der
Editor daneben ist eine Client-Insel mit Zustand für Zeilen, Modus, Journal,
Storno und Grund.

## Was der Schnitt lösen muss

Die Abnahme hat einen Einwand mitgegeben, der hier steht, damit ihn niemand
übersieht: **die Lese-Ansicht verliert ihren Client-Anteil nicht von selbst.**
Zwei Zustände leben auch dort:

- der **Modus-Umschalter** (`mode`, „Einfach ◂ / Voll ▸") — auflösbar als
  zwei Server-Varianten über die URL, oder als eigene kleine Client-Insel;
- die **Journal-Klappe** (`journalOffen`) — auflösbar als `<details>`, das
  keinen React-Zustand braucht.

Solange beides nicht entschieden ist, ist `JournalEntryGrid` keine
Server-Komponente, sondern nur eine kleinere Client-Komponente — und dann
trägt die Begründung des Schnitts nur zur Hälfte.

## Was aus der 0015-Abnahme mitkommt

Vier Punkte, die dort gemessen und bewusst hierher verwiesen wurden:

| Punkt | Was zu tun ist |
|---|---|
| M5 | `Alt+V` steht im Lese-Raster am Knopf und wirkt dort nicht (`if (!editable) return;`) — Taste binden oder nicht drucken (V14) |
| M6 | `STATUS_TEXT` ist eine lokale Label-Map (R1) und liefert in `S19` den **falschen** Tooltip: auf dem Sichtwechsel-Knopf steht „Vorschlag" |
| M12 | `▤` als Unicode-Icon im Lese-Raster, während das Bearbeiten-Raster `ActionIcon action="ledger"` nutzt (§9/A8) |
| M16 | die deutschen Bezeichner der Altteile (`gegenkonto`, `Kopf`, `Zeile`, `summeBelegseite`) — die Datei wird ohnehin angefasst, also nach CLAUDE.md fällig |

Dazu die Story-Deckung, die 0015 offenlässt: `onOpenTaxKey` und
`quickActions` haben heute keine Story, weil die Datei mit 17 Stories schon
über der Grenze liegt. Nach dem Schnitt passen beide ins Bearbeiten-Raster.

## Ausbau

| Was fehlt | Woran man merkt, dass es Zeit ist |
|---|---|
| Der Schnitt selbst | sobald 0015 abgenommen ist und die App das Lese-Raster an einer Stelle ohne Editor braucht (Sachverhaltsseite, Stapel-Prüfung) |

## Spec 2026-09-07 (Skill `spec-schreiben`)

Status: `spec`. Die Wartebedingung ist weg — 0015 ist am 2026-09-07 in der
dritten Runde freigegeben.

### Einordnung

- **Wiederverwenden:** `Table`/`Row`/`HeadRow` (`primitives/Table.tsx`),
  `Disclosure` (0005) für das Journal, `StatusBadge` mit der Achse `buchung`,
  `ActionIcon action="ledger"`, `Amount`/`AmountCell`, `Kbd`. Keine dieser
  Komponenten deckt das Raster allein.
- **Neu, weil:** `spec-schreiben` §4, wörtlich — **„ein Teil braucht
  `"use client"`, der Rest nicht"**. Sieben der 17 Stories laufen mit
  `editable={false}`; sie zeigen ein Raster, das nichts entgegennimmt.
- **Zuschnitt:** zwei Dateien. `JournalEntryGrid.tsx` (lesend, **Server**) und
  `JournalEntryEditor.tsx` (bearbeitend, Client). Der Editor **komponiert das
  Grid nicht** — die beiden teilen die Spaltenordnung, nicht das Markup: ein
  Feld unterscheidet sich in jeder Zelle von einem Wert. Geteilt wird, was
  Daten sind: `journalLines()` (die DATEV-Stapelordnung aus den Zeilen) und
  die Spurenliste, beide in `journal-entry.ts`.
- **Setzt auf:** siehe oben; dazu `formatAmount` aus `format.ts`.

### Die zwei Zustände, die das Grid nicht behalten darf

Das ist der Kern dieser Aufgabe — ohne sie bliebe es eine kleinere
Client-Komponente, und die Begründung des Schnitts trüge nur zur Hälfte.

1. **Der Modus-Umschalter** wird ein **Link**, kein Zustand: `mode` kommt als
   Prop, und `modeHref` trägt die zwei Adressen (`{ einfach, voll }`). Ohne
   `modeHref` gibt es keinen Umschalter — und damit auch **keine gedruckte
   Taste**, was M5 aus der 0015-Abnahme erledigt: `Alt+V` stand dort am Knopf
   und wirkte nicht (V14).
2. **Die Journal-Klappe** wird `Disclosure` (0005), also ein `<details>`. Kein
   React-Zustand, kein Effekt, und die Klappe funktioniert ohne JavaScript.

Damit trägt `JournalEntryGrid` **kein** `"use client"`. Das ist prüfbar: die
Datei enthält weder `useState` noch `useEffect` noch die Direktive.

### Schnittstelle — `JournalEntryGrid`

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `rows` | `readonly JournalEntryRow[]` | ja | die Zeilen des Satzes, in ihrer Reihenfolge | `Simple` |
| `status` | `BuchungStatus` | ja | der Zustand des Satzes, als `StatusBadge` über die Achse `buchung` — **keine lokale Map** (erledigt M6, dort stand auf dem Umschalter der falsche Tooltip) | `Simple` |
| `mode` | `"einfach" \| "voll"` | nein | wie viele Spalten; Vorgabe `einfach` | `Full` |
| `modeHref` | `{ einfach: string; voll: string }` | nein | die zwei Adressen des Umschalters. Fehlt sie, gibt es keinen Umschalter | `Full` |
| `contraAccount` | `{ accountNumber: string; accountName?: string }` | nein | das Gegenkonto über dem Raster | `Simple` |
| `documentNumber` · `documentAmount` · `documentSide` | `string` · `number` · `Side` | nein | der Kopf: Beleg, Betrag, Sollseite | `Simple` |
| `journal` | `boolean` | nein | zeigt die Klappe „Journal (wird gespeichert)" mit den Stapelzeilen | `WithJournal` |
| `onOpenLedger` | `(accountNumber: string) => void` | nein | der Weg ins Kontenblatt, als `ActionIcon action="ledger"` je Zeile — **kein Unicode-Zeichen** (erledigt M12) | `WithLedgerLink` |
| `messages` | `{ errors, warnings, hints }` | nein | dieselben Meldungen wie im Editor, nur ohne Beheben-Knopf | `WithMessages` |

Typen aus `src/ludwig/`: `JournalEntryRow` und `Side` (`modules/entries/domain/`),
die Achse `buchung` aus `patterns/status-registry.ts`.

**Was das Grid bewusst nicht kann:** nichts entgegennehmen. Kein Feld, kein
Speichern, kein Storno, keine Schnellaktion — dafür ist der Editor da. Und es
rechnet nichts nach: die Summenzeile des Journals kommt aus `journalLines()`,
derselben Funktion, die der Editor beim Speichern benutzt.

### Verhalten

**Server-Component.** Keine Taste: das Kürzel `Alt+V` gehört dem Editor, wo es
wirkt. Der Umschalter ist ein Link und trägt kein `Kbd` — eine gedruckte Taste
ohne Wirkung ist genau der Fall, den V14 verbietet (M5).

Zustände: **gefüllt** und **ohne Zeilen**. Ein Satz ohne Zeile ist ein Fehler
des Aufrufers, kein Zustand des Rasters; das Grid fängt ihn sichtbar ab
(„Keine Buchungszeilen."), so wie der Editor es tut. `lädt` und `Fehler`
gehören dem Aufrufer — das Grid bekommt seine Zeilen als Prop.

### Stories

Abgeleitet nach §6: 2 Zustände (gefüllt, ohne Zeilen) + 1 je Enum-Prop
(`mode`) + 1 je Layout-Prop (`journal`) + 1 je Callback (`onOpenLedger`) +
1 „im Einsatz" + 1 Rand (lange Kontonamen, viele Zeilen) + 1 für die
Meldungen = **8**. Titel `v3/Entitäten/Buchungssatz/JournalEntryGrid`.

| Story | Beweist |
|---|---|
| `Simple` | der Normalfall: Kopf, sechs Spalten, Gegenkonto |
| `Full` | `mode="voll"` mit elf Spalten, Umschalter als Link |
| `WithJournal` | die Klappe mit der DATEV-Stapelordnung und der Summenzeile |
| `WithLedgerLink` | `onOpenLedger` je Zeile, als `ActionIcon` |
| `WithMessages` | Fehler, Warnung und Hinweis nebeneinander — ohne Beheben-Knopf |
| `Empty` | ohne Zeilen: der Fehler des Aufrufers wird sichtbar abgefangen |
| `Edges` | lange Kontonamen (p90), sechs Zeilen, ein negativer Betrag |
| `InUse` | im `CaseDetailView`, wie auf der Sachverhaltsseite |

Der Editor behält danach **9** Stories und bekommt die zwei, die 0015 offen
lassen musste (`onOpenTaxKey`, `quickActions`) — beide Dateien liegen damit
unter der Grenze von 10, und die begründete Ausnahme aus 0015 ist abgetragen.

### Abnahmekriterien

Fest (gilt immer):

- [ ] `pnpm typecheck` und `pnpm build` grün
- [ ] Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe
- [ ] Code englisch; `@when`/`@instead` an jedem Export
- [ ] Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry
- [ ] Alle Stories oben vorhanden; ausgeschlossene Zustände begründet
- [ ] Prüfliste `design-guidelines.md` §9 durchgegangen
- [ ] Im Browser angesehen (Storybook), nicht nur gebaut

Variabel (aus dieser Spec):

- [ ] `JournalEntryGrid.tsx` enthält **kein** `"use client"`, kein `useState`, kein `useEffect` (`grep`)
- [ ] Ohne `modeHref` gibt es keinen Umschalter und keine gedruckte Taste (Story `Simple`, gemessen)
- [ ] Mit `modeHref` ist der Umschalter ein `<a>` mit `href`, kein `<button>` (Story `Full`, gemessen)
- [ ] Die Journal-Klappe ist ein `<details>` und öffnet ohne JavaScript (Story `WithJournal`, gemessen: `open`-Attribut nach einem Klick auf `<summary>`)
- [ ] Das Journal zeigt Konto · Kontoname · Buchungstext · Soll · Haben, und die Summenzeile stimmt mit `journalLines()` überein (Story `WithJournal`, nachgerechnet)
- [ ] Der Weg ins Kontenblatt ist `ActionIcon action="ledger"`, kein Unicode-Zeichen (Story `WithLedgerLink`, `grep` auf `▤` ist leer)
- [ ] Der Zustandstext kommt aus der Registry, nicht aus einer lokalen Map (`grep` auf `STATUS_TEXT` ist leer)
- [ ] Die Bezeichner der herausgelösten Teile sind englisch (`grep` auf `gegenkonto`, `Kopf`, `Zeile`, `summeBelegseite` in der neuen Datei ist leer)
- [ ] Der Editor hat nach dem Schnitt 9 Stories, das Grid 8; beide unter 10 (`grep`)
- [ ] `JournalEntryEditor` verhält sich unverändert — die Kriterien von 0015 gelten weiter und werden in derselben Runde gegengeprüft

## Gebaut (2026-09-07)

`JournalEntryGrid` steht, und die zwei Entscheidungen der Spec sind gemessen
eingelöst.

**Kein Zustand, keine Direktive.** Die Datei enthält weder `"use client"` noch
`useState` noch `useEffect` — der einzige Treffer auf diese Wörter ist der
Satz im JSDoc, der erklärt, warum es sie nicht braucht. Der Umschalter ist ein
`<a href>` (gemessen in `Full`: `A href=?sicht=einfach`), die Journal-Klappe
ein `<details>`, das sich per Klick auf die Zusammenfassung öffnet (gemessen).
Ohne `modeHref` gibt es keinen Umschalter — und damit auch keine gedruckte
Taste ohne Wirkung.

**Was aus der 0015-Abnahme mitkam, ist erledigt:** der Zustandstext kommt aus
der Registry (kein `STATUS_TEXT`), der Weg ins Kontenblatt ist
`ActionIcon action="ledger"` (kein `▤`, gemessen null Treffer im Text), und
die Bezeichner sind englisch.

**Geteilt wird die Rechnung, nicht das Markup.** `journal-entry.ts` trägt
`journalLines()`, die Summen, den Bilanzsatz und die Spurenliste; beide Hälften
lesen daraus. Gemessen in `Simple`: sieben Kopfzellen, sieben Zellen je Zeile,
sieben gerenderte Spuren — Kopf und Zeile fluchten. In `WithJournal` steht die
DATEV-Stapelordnung mit „Σ S 1.475,60 € = Σ H 1.475,60 €" in der Kopfzeile der
Klappe, damit die Summe auch zugeklappt sichtbar ist.

**Zur Story-Zahl, und hier weiche ich von der Spec ab:** sie sagt 8 lesend und
**9** bearbeitend. Es sind 8 und **10**. Die acht rein lesenden Stories des
Editors sind entfallen — das Lesen zeigt jetzt das Grid —, und die zehnte ist
`S20_EditorOnly`: sie hält die vier Props zusammen, die **nur** der Editor hat
und die bis heute keinen Nachweis hatten (`quickActions`, `onOpenTaxKey`,
`locked`, `reversedReason`). Zwei davon standen in 0015 ausdrücklich als
offene Lücke (M11). Beide Dateien liegen damit **auf oder unter** der Grenze
von zehn, und die begründete Ausnahme aus 0015 ist abgetragen — das war der
Zweck dieser Aufgabe.

**Was der Schnitt nicht gelöst hat, und das gehört gesagt:** `JournalRow` ist
ein neuer Typ in `journal-entry.ts`, kein Typ aus `src/ludwig/`. Die Spec
verlangt Typen aus dem Spiegel; dort gibt es für die Zeile eines
Buchungssatzes keinen. `EditorRow` hatte dasselbe Problem und hat es seit der
Erstbestückung. Der Befund gehört ans App-Register, sobald jemand die
Buchungssatz-Familie dorthin meldet — hier stünde er zum dritten Mal.
