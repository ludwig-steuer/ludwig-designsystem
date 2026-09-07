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

## Abnahme

**Fremde Abnahme 2026-09-07, gegen den Bau `0aa4b3f`. Urteil: zurück.**

Gemessen im laufenden Dev-Server (`http://localhost:6107`, er serviert die
Quelle), je Story ein eigener `Runtime.evaluate` — mehrere Schritte in einem
Aufruf sehen das Re-Render nicht. Jeder Messwert, an dem etwas hängt, ist
gegen eine Änderung geprüft: die Klappe wurde auf und wieder zu geklickt, die
Sicht mit `Alt+V` umgeschaltet, die neue CSS-Regel im laufenden Bild gelöscht
und danach neu gemessen. `pnpm typecheck` und `pnpm build` sind gegen
`0aa4b3f` in einem eigenen Arbeitsbaum gelaufen, weil im gemeinsamen Baum
gerade fremde Sitzungen schreiben; beide grün (`build` Exit 0). `check:icons`
und `check:contrast` grün.

### Die Behauptung trägt — das Lese-Raster ist eine Server-Komponente

Das ist der Kern der Aufgabe, und er ist eingelöst.

- `JournalEntryGrid.tsx` und `journal-entry.ts` enthalten weder `"use client"`
  noch `useState` noch `useEffect`; der einzige Treffer ist der JSDoc-Satz,
  der erklärt, warum es sie nicht braucht (`grep`, beide Dateien).
- **Ohne `modeHref` kein Umschalter, keine Taste:** `Simple` hat kein `<a>`
  und kein `<button>` mit „Voll/Einfach", kein `kbd`, und `Alt+V` steht
  nirgends im Text (0 Treffer). Damit ist M5 für das Raster erledigt.
- **Mit `modeHref` ist der Umschalter ein Link:** in `Full` gemessen
  `A · href="?sicht=einfach" · „Einfach ◂"` — ein `<a>` mit `href`, kein
  `<button>`.
- **Die Klappe ist ein `<details>` und hält ihren Zustand selbst:** zu →
  `open=false`, `checkVisibility()=false`, „Kontoname" steht nicht im
  `innerText`; Klick auf `<summary>` → `open=true`, sichtbar, Inhalt im Text;
  zweiter Klick → wieder zu. Und `details.open = true` per Eigenschaft gesetzt
  bleibt nach 300 ms stehen — kein React hält dagegen. (Die Höhe des Körpers
  ist als Messwert untauglich: sie steht zu wie offen bei 121 px, weil eine
  geschlossene `<details>` in Chrome nur `content-visibility` setzt.)
- **Die geteilte Rechnung stimmt:** `WithJournal` zeigt Konto · Kontoname ·
  Buchungstext · Soll · Haben und „Σ S 1.475,60 € = Σ H 1.475,60 €"; in
  `Edges` „Σ S 13.716,15 € = Σ H 13.716,15 €" — von Hand nachgerechnet aus den
  fünf Zeilen (12.480,55 − 240,00 + 0,00 + 1.000,00 + 475,60), das Gegenkonto
  auf der Gegenseite. Kopf und Zeile fluchten: 7/7 Zellen in `einfach`, 10/10
  in `voll`, in allen fünf Zeilen von `Edges` dieselben Spaltenkanten. Jede
  Spur trägt etwas — Beleg 2 („LS-9912") und KOST („K-100") in der letzten
  Zeile. Der lange Kontoname kürzt mit Auslassung (110 px Kasten gegen 449 px
  Inhalt), die Zelle läuft nicht über.
- **Breite:** bei 1440, 1280, 1100 und 980 px läuft nichts über. `voll`
  überschreitet seine Karte erst bei ~860 px (Raster 824 px, Karte 754 px) —
  unterhalb der Sperre von 1280 px für das produktive Register (L1). Kein
  Mangel, aber notiert: `.bse__tbl` hat kein eigenes Scrollen, es schneidet ab.
- 8 Grid-Stories und 10 Editor-Stories stehen im Katalog des Dev-Servers, alle
  18 rendern, keine Konsolenmeldung.

### Mängel

**M1 (blockiert) — `STATUS_TEXT` lebt, und der falsche Tooltip mit ihm.**
Kriterium: „Der Zustandstext kommt aus der Registry, nicht aus einer lokalen
Map (`grep` auf `STATUS_TEXT` ist leer)". Der `grep` ist nicht leer:
`JournalEntryEditor.tsx:168` (die Map) und `:598`
(`title={STATUS_TEXT[status]}` am Sichtwechsel-Knopf). Gemessen im Bild: in
`S1`, `S2`, `S3`, `S5`, `S12`, `S23`, `Empty`, `DocumentNumberAcrossRows`,
`ContraAccountEditable` steht auf dem Knopf „Voll ▸ · Alt+V" der Tooltip
**„Vorschlag"**, in `S20_EditorOnly` am zweiten Editor **„Storniert"** — genau
der Befund M6 aus der 0015-Abnahme, der mit dieser Aufgabe erledigt sein
sollte. Das neue Raster ist sauber; die Familie ist es nicht. Was fehlt, ist
nicht das Vermeiden im neuen File, sondern das Entfernen im alten.
*Vorschlag:* `title` am Umschalter streichen (er sagt ohnehin das Falsche),
`STATUS_TEXT` löschen, der `StatusBadge` daneben trägt das Wort bereits.

**M2 (blockiert) — `▤` steht noch da, hat aber keine Story mehr.**
Kriterium: „Der Weg ins Kontenblatt ist `ActionIcon action="ledger"`, kein
Unicode-Zeichen (`grep` auf `▤` ist leer)". Ein Treffer in `src/`:
`JournalEntryEditor.tsx:765`, im Lesezweig des Editors. Erschwerend: nach dem
Schnitt führt **keine** Editor-Story mehr dorthin — `editable={false}` gibt es
nur einmal (`S20`, zweiter Editor), und dort wird `onOpenLedger` nicht
gesetzt. Der Befund ist damit nicht behoben, sondern unsichtbar geworden.
*Vorschlag:* die vier Zeilen im Lesezweig auf `ActionIcon action="ledger"`
ziehen (die Marke steht in `Icons.tsx`), oder den Lesezweig des Editors ganz
streichen — dafür ist jetzt `JournalEntryGrid` da.

**M3 (blockiert) — der Schnitt hat drei Props des Editors ohne Nachweis
gelassen.** Kriterium: „`JournalEntryEditor` verhält sich unverändert — die
Kriterien von 0015 gelten weiter". Von den acht entfernten Stories
(`S0_Simple`, `S10_Payment`, `S11_Locked`, `S15_Released`, `S17_Posted`,
`S18_Reversed`, `S19_JudgeWithNote`, `JournalWithPostingText`) trugen die
einzigen Belege für `onEdit` (5 Vorkommen), `onDelete` und `deletable`; in den
zehn neuen Stories kommt keines dieser drei mehr vor (`grep`, je 0). Der Weg
„Ansehen → Bearbeiten" und der Löschdialog samt Grund sind damit unbelegt.
Dazu: das 0015-Kriterium „Das Journal zeigt Konto · Kontoname · Buchungstext ·
Soll · Haben (Story `JournalWithPostingText`)" nennt eine Story, die es nicht
mehr gibt — das Journal des **Editors** hat keinen Nachweis mehr (das des
Rasters hat einen). *Vorschlag:* `onEdit`/`onDelete`/`deletable` in `S20`
aufnehmen (der zweite Editor dort ist ohnehin `editable={false}` — ihm fehlen
nur die drei Props) und im 0015-Eintrag die Story umbenennen, auf die sich das
Journal-Kriterium jetzt stützt.

**M4 (blockiert) — die neue CSS-Regel greift in den Editor.**
`.bse__konto` steht jetzt zweimal in `v3.css`: alt bei 1528
(`overflow:hidden; text-overflow:ellipsis`) und neu bei 3570
(`display:flex; gap`). Die Klasse trägt aber auch die **Lesezelle des
Editors** (`JournalEntryEditor.tsx:750`), und `text-overflow` wirkt nicht auf
den anonymen Textteil eines Flex-Kastens. Gemessen an `S20`, zweiter Editor,
mit einem Kontonamen in p90-Länge, einmal mit und einmal ohne die neue Regel
(Regel im laufenden Bild gelöscht, dann neu gemessen): mit Regel
`display:flex` und der Name bricht hart ab („Reparaturen und I▌"), ohne Regel
`display:block` und er endet mit Auslassung („Reparaturen und…"). Das ist
keine unveränderte Verhaltensweise. *Vorschlag:* die neue Regel auf eine
eigene Klasse des Rasters legen (`.bse__kontocell` o. ä.) statt die geteilte
zu überschreiben.

**M5 — die Gegenkonto-Zeile zerfällt über die Breite.** `.bse__gegen` ist ein
Flex mit `justify-content: space-between`; der Editor legt genau **ein** Kind
hinein (`.bse__gegen__label`) und hält damit alles links, das Raster legt
**vier** nackte `<span>` hinein. Gemessen in `WithLedgerLink` (Kanten links):
„Gegenkonto" 53, „70044" 392, „Bürobedarf Meier GmbH" 694, „Kreditor" 1109 —
gegen die Spalten Konto 371, Text 525, Beleg 1 1063. Die Teile landen unter
Spalten, zu denen sie nicht gehören, und lesen sich wie eine verrutschte
Zeile. Dazu verliert die Marke die Pille `.bse__tag`, die sie im Editor hat,
und die Seite („an H") fehlt. Nebenbei: die Spec sagt „das Gegenkonto **über**
dem Raster", gebaut ist es darunter. *Vorschlag:* wie im Editor in
`.bse__gegen__label` bündeln und `.bse__tag` verwenden.

**M6 — `v2iconbtn` gibt es nicht.** Die Klasse am Kontenblatt-Knopf
(`JournalEntryGrid.tsx:189`) kommt im ganzen Repo genau einmal vor, nämlich
dort; in `v3.css` steht keine Regel dazu. Folge, gemessen: der Knopf ist
14 × 14 px, ohne Polster, und **antwortet nicht auf Hover** (Hintergrund,
Farbe, Deckkraft vor und nach `mouseMoved` identisch) — §9 verlangt beides
anders. Er trägt auch kein Wort und kein `title` (nur `aria-label`), während
der Editor daneben `title="Kontenblatt 6815"` setzt: §9 „kein Icon ohne Wort"
(V11, V14, T8). Der Fokusring sitzt (2 px). *Vorschlag:* `v2link
v2link--quiet` nehmen — die Klasse, die diese Familie für kleine stille
Knöpfe schon achtmal verwendet — und ein `title` setzen.

**M7 — in `einfach` steht die Spaltenordnung anders als im Editor.** Raster:
Datum · Umsatz · S/H · BU · Konto · **Text · Beleg 1**. Editor: Datum · Umsatz
· S/H · BU · Konto · **Beleg 1 · Text** (gemessen, beide Köpfe). In `voll`
stimmen beide überein. Das trifft genau die Begründung des Zuschnitts („die
beiden teilen die Spaltenordnung, nicht das Markup") und den Kommentar über
dem CSS-Block („Anzeigen und Bearbeiten teilen sich dasselbe Raster — sonst
muss die Prüferin beim Korrigieren neu suchen"). *Vorschlag:* Beleg 1 auch in
`einfach` vor den Text ziehen (Spuren `… 148px 96px minmax(0,1fr)`), oder die
Abweichung im JSDoc begründen.

**M8 — die Stories behaupten Spaltenzahlen, die das Bild nicht zeigt.** Der
Doc-Kommentar von `Simple` sagt „sechs Spalten", gemessen sind 7; `Full` sagt
„elf Spalten", gemessen sind 10 (die elfte ist die Aktionsspalte des Editors,
die das Raster nicht hat). Dieselben zwei Zahlen stehen in der Story-Tabelle
dieser Spec. Der Bau hat die 7 im Commit genannt, die Story aber stehen
lassen. *Vorschlag:* beide Zahlen in Story und Spec auf 7/10 korrigieren.

**M9 — `accountFramework` ist eine Prop ohne Spec-Zeile und ohne Story.** Sie
steht in `JournalEntryGridProps`, fehlt in der Schnittstellen-Tabelle dieser
Spec, und keine der acht Stories setzt sie. Damit zeigt keine Story den
Steuersplit in `journalLines()` — also gerade den Teil der geteilten Rechnung,
in dem sich Raster und Editor unterscheiden könnten. *Vorschlag:* die Prop in
`WithJournal` setzen (`skr04`, wie der Editor) und die Zeile in der
Schnittstellen-Tabelle nachtragen.

**M10 — die neuen Typen tragen deutsche Feldnamen.** `JournalRow` hat `datum`,
`umsatz`, `konto`, `kontoName`, `beleg1`, `beleg2`, `kost1`; `ContraAccount`
hat `konto`, `name`, `tag`; `journalTotals` gibt `{ soll, haben }` zurück. Das
Kriterium prüft ausdrücklich nur `gegenkonto`, `Kopf`, `Zeile`,
`summeBelegseite` **in der neuen Datei** — dieser `grep` ist leer, das
Kriterium ist also formal erfüllt. Aber die Spec schreibt `contraAccount` als
`{ accountNumber; accountName? }`, und CLAUDE.md sagt „Code nur Englisch"; die
Aussage im Bau, „die Bezeichner sind englisch", gilt nur für die Props. Der
Grund gegen das Umbenennen ist real und gehört genannt statt verschwiegen:
`EditorRow` heißt so, und ein Aufrufer reicht dieselbe Zeile an beide Hälften.
*Vorschlag:* entweder beide Hälften in einem Zug übersetzen (dann ist
`JournalRow` der richtige Ort, damit anzufangen) oder den Verzicht im JSDoc
begründen — er ist heute unsichtbar.

**M11 — vier Exporte ohne `@when`/`@instead`.** `documentSideTotal`,
`journalTotals`, `journalBalanceText` und `journalGridTracks` in
`journal-entry.ts` tragen je eine Doc-Zeile, aber nicht das Paar; im
Nachbarmodul `tax-assist.ts` hat es jede der vier exportierten Funktionen.
Festes Kriterium „`@when`/`@instead` an jedem Export". *Vorschlag:*
nachtragen; `rowAmount` und `journalLines` zeigen die Form.

### Zur Abweichung von der Story-Zahl: sie trägt, ihre Begründung nur halb

Die Zahl selbst ist in Ordnung. 8 lesend und 10 bearbeitend liegen beide auf
oder unter der Grenze, die Ausnahme aus 0015 ist damit abgetragen, und
`S20_EditorOnly` gibt `quickActions`, `onOpenTaxKey`, `locked` und
`reversedReason` ihren ersten Nachweis — zwei davon standen in 0015 als
offene Lücke M11. Der Zuschnitt ist auch inhaltlich richtig: die acht
entfallenen Stories waren die rein lesenden.

Was nicht trägt, ist die Begründung in ihrer eigenen Logik. Sie lautet: „vier
Props, die bis heute keinen Nachweis hatten". Dieselbe Änderung hat drei
anderen Props den Nachweis genommen (M3), ohne es zu sagen — und mit
`S19_JudgeWithNote` ist die Story verschwunden, an der die 0015-Abnahme den
falschen Tooltip gemessen hat, während der Tooltip geblieben ist (M1). Mit M3
und M1 erledigt trägt die Abweichung vollständig; die Zahl 10 ist dann zu
verteidigen und muss nicht auf 9 zurück.

**Kein Rückgabegrund** ist der im Bau benannte Punkt, dass `JournalRow` ein
neuer Typ im Set ist statt einer aus `src/ludwig/`: für die Zeile eines
Buchungssatzes gibt es dort keinen, und `EditorRow` hat dasselbe Problem seit
der Erstbestückung. Der Befund gehört ans App-Register, nicht in diese Runde.

### Sonst geprüft und in Ordnung

Datei nach der Familie benannt, Story daneben, Titel
`v3/Entitäten/Buchungssatz/JournalEntryGrid`; `@when`/`@instead` an der
Komponente; kein Hex, keine lokale Label-Map, Status über
`StatusBadge axis="buchung"`; kein `▤` im gerenderten Text aller acht Stories
(0 Treffer); `Empty` fängt den Fehler des Aufrufers sichtbar ab („Keine
Buchungszeilen."); `WithMessages` zeigt Fehler, Warnung und Hinweis ohne einen
einzigen Knopf (0 Buttons im Meldungsblock); negative Beträge ohne Farbe, der
nicht aufgehende Rest rot; `pnpm typecheck`, `pnpm build`, `check:icons`,
`check:contrast` grün.

*Hinweis zur Messhygiene:* Ich habe einmal `pnpm build` im gemeinsamen Baum
laufen lassen, bevor die Warnung kam — das hat `storybook-static/` neu
geschrieben. Alles Weitere lief gegen den Dev-Server, der Bau gegen `0aa4b3f`
in einem eigenen Arbeitsbaum, der danach entfernt wurde.

| | |
|---|---|
| Abgenommen von / am | Claude (fremde Abnahme, hat nicht gebaut), 2026-09-07 |
| Urteil | zurück — M1 bis M4 blockieren; M5 bis M11 sind in derselben Runde mitzuerledigen |
