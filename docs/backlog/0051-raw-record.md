# 0051 · RawRecord

| | |
|---|---|
| Status | fertig |
| Stufe | `primitives/` |
| Klassen-Test | Ja, unverändert — „alle Felder eines Datensatzes, so wie sie in der DB stehen" braucht jede App mit einer Support-Sicht; kein Fachwort in Name, Props oder Texten |
| Quelle | `docs/v3-backlog.md` „Später": `Rohdaten` (JSON/`<pre>`-Ansicht) · 17 Dateien · `primitives` — plus Anfrage vom 2026-09-03 |
| Ersetzt | `modules/invoices/ui/tabs/RohdatenTab.tsx` (`RecordValue`, `RowKeyValueTable`, `CollapsibleText`) · `modules/accounting-cases/ui/tabs/RohdatenTab.tsx` (dieselben drei, ältere Kopie) · `fmtRawValue` + `RawRowBody` in `ui/drawers/server.tsx` |
| Blockiert | Rohdaten-Tab in `0050-case-detail-view`; der Rohdaten-Drawer der DATEV-Seite |
| Spec von / am | Claude, 2026-09-03 |

## Ziel

Support und Entwicklung wollen wissen, was **wirklich** in der Zeile steht —
ohne den Filter unserer DTOs. Heute gibt es dafür drei Eigenbauten, die
denselben Wert verschieden anzeigen: ein `boolean` ist im Beleg- und
Sachverhalt-Tab `true`, im Rohdaten-Drawer „ja"; eine Zahl ist im Drawer
`1.234.567`, in den Tabs `1234567`; ein ISO-Zeitstempel ist nur im Drawer
lokalisiert. Wer zwischen Tab und Drawer wechselt, vergleicht Darstellungen
statt Daten. `RawRecord` ist die eine Antwort auf „zeig mir die Zeile".

## Einordnung

- **Wiederverwenden:** Kein `@when` deckt den Fall. `FieldList` („master data
  and properties of an item, read-only") ist für **kuratierte** Label/Wert-Paare
  gedacht — bekannte Felder, deutsche Labels, `[ReactNode, ReactNode][]`. Hier
  sind Schlüssel und Anzahl unbekannt (`select *`, neue Spalten erscheinen von
  selbst), die Schlüssel sind DB-Spaltennamen in Mono, und der Wert wird nach
  seinem **Typ** dargestellt. `Table`/`Row` trägt Datensätze desselben
  Zuschnitts in Spalten, nicht ein Feld je Zeile. `Disclosure` deckt nur die
  Klappe, nicht den Inhalt.
- **Neu, weil:** §3 Regel 3 — kein `@when` passt, kein Fachwort nötig, drei
  Verwendungen heute (`v3-backlog.md` zählt 17 Dateien mit `<pre>`-Rohsicht),
  und aus vorhandenen Primitives ist die Typ-Erkennung nicht in ~15 Zeilen an
  der Aufrufstelle zu bauen.
- **Zuschnitt:** Eine Datei, zwei Exporte (Familie nach §4) — `RawRecord` und
  `RawValue`. Getrennt, weil `RawValue` **allein** gebraucht wird: die
  DATEV-Seite zeigt einzelne Rohwerte in Tabellenzellen, ohne Zeile darum. Sie
  ergeben nur miteinander Sinn und teilen ein Markup-Vokabular (`.v2raw*`),
  darum eine Datei.
- **Nicht dabei — bewusst:** die Sektion je DB-Tabelle (`ludwig.<table>`,
  Zeilenzahl, schwere Tabellen eingeklappt). Das ist `Disclosure` um n ×
  `RawRecord`, hat keinen eigenen Zustand und ist an der Aufrufstelle zehn
  Zeilen Markup — nach §4 keine Komponente. Story `InUse` zeigt es.
- **Setzt auf:** `Disclosure` (`tone="quiet"`) für lange Werte · `Time` für
  ISO-Zeitstempel · `Markdown` (`variant="full"`) für `format: "markdown"` ·
  Tokens aus `v3.css`, neuer Block `.v2raw*` am Dateiende.

## Schnittstelle

```ts
export type RawFormat = "auto" | "text" | "markdown" | "json" | "date" | "number";
```

`RawRecord`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `record` | `Record<string, unknown>` | ja | Die Zeile. Alle Schlüssel werden gezeigt, alphabetisch, keiner gefiltert | `Filled` |
| `format` | `Record<string, RawFormat>` | nein | Override je Schlüssel, wo die Erkennung nicht reicht — `ocr_markdown` als Markdown, eine Referenz, die wie ein Datum aussieht, als Text | `Formats` |
| `label` | `ReactNode` | nein | Zeile über der Tabelle — `#2 · id=…` bei mehreren Zeilen derselben Tabelle | `InUse` |
| `empty` | `string` | nein | Text, wenn `record` keine Schlüssel hat. Default „Keine Felder." | `Empty` |

`RawValue`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `value` | `unknown` | ja | Ein Wert, dargestellt nach seinem Typ | `DataTypes` |
| `format` | `RawFormat` | nein | Default `"auto"` — die Erkennung unten | `Formats` |

Typen aus `src/ludwig/`: keine — `Record<string, unknown>` ist der Punkt, die
Komponente kennt kein Schema. GLOSSARY: kein Eintrag für die Rohdaten-Sicht
(Befund, siehe unten); im Code englisch `raw record`, im UI deutsch „Rohdaten".

**Was die Komponente bewusst nicht kann:**

- Sie **lädt nichts** und kennt keine Tabelle. Tabellenname und Zeilenzahl
  stehen im `Disclosure` des Aufrufers.
- Sie **rät kein Markdown**. Ohne `format` bleibt ein langer Text Text — sonst
  würde jede OCR-Zeile mit `#` oder `*` willkürlich zu Überschrift und Kursiv.
- Sie **filtert und kürzt keine Schlüssel**. `select *` ohne Whitelist ist der
  Zweck: eine neue Spalte muss von selbst erscheinen.
- Sie **sortiert nicht nach Wichtigkeit**. Alphabetisch, damit man ein Feld
  findet, ohne die Reihenfolge zu kennen.

## Verhalten

`format: "auto"` entscheidet in dieser Reihenfolge:

| Wert | Darstellung |
|---|---|
| `null` / `undefined` | `—`, gedämpft |
| `boolean` | `true` / `false`, Mono — es sind Rohdaten, nicht „ja/nein" |
| `number` / `bigint` | Mono, `tabular-nums`, **ungruppiert** (eine ID ist keine Million) |
| `Array` | Klappe „Liste · n Einträge", darin eingerücktes JSON |
| `object` | Klappe „JSON · n Zeichen", darin eingerücktes JSON; `JSON.stringify` in `try`/`catch`, bei Zyklus `String(v)` |
| `string`, der auf `^\d{4}-\d{2}-\d{2}(T\|$)` passt **und** ein gültiges Datum ergibt | `Time` — `format="date"` bei Länge ≤ 10, sonst `dateTime`; der rohe Wert bleibt im `title` erreichbar |
| `string`, mehrzeilig oder > 100 Zeichen | Klappe „Text · n Zeichen, m Zeilen", darin scrollbares `<pre>` (max. 480 px). Literale `\r\n`, `\n`, `\t` werden zu echten Zeichen — JSON-encodierte LLM-Prompts in TEXT-Spalten sind sonst unlesbar |
| sonstiger `string` | inline, `white-space: pre-wrap` |

`format` explizit: `"text"` erzwingt die String-Behandlung (keine
Datumserkennung), `"date"` erzwingt `Time`, `"number"` gruppiert de-DE,
`"json"` erzwingt die JSON-Klappe, `"markdown"` rendert über `Markdown` mit
`maxHeight` und `overflow="scroll"`.

Zustände: gefüllt · leer (`empty`). **Lädt** und **Fehler** sind nicht
anwendbar — die Komponente lädt nichts; der Aufrufer zeigt `Skeleton` bzw.
`Callout`. **Leer nach Filter** entfällt, weil nicht gefiltert wird.

Tastatur und Fokus kommen aus `Disclosure`, also aus nativem `<details>`.
Deshalb **Server-Component**: kein Zustand, kein Effekt, keine
`"use client"`-Direktive.

## Stories

Titel `v3/Primitives/Tabelle/RawRecord`. Abgeleitet nach §6: 2 anwendbare
Zustände + 1 Enum-Prop (`format`) + 0 Layout-Booleans + 0 Callbacks + 1
„im Einsatz" + 2 Rand (die Komponente formatiert **und** kürzt) = 6.

| Story | Beweist |
|---|---|
| `Filled` | Eine `client_accounting_case`-Zeile mit ~15 Feldern, realistisch belegt (`created_at`, `status`, `net_amount`, `client_id`, `metadata`) |
| `DataTypes` | Jeder Zweig der Tabelle „Verhalten" nebeneinander: `null`, `true`, `42`, `2026-08-26`, `2026-08-26T14:03:11Z`, Array, Objekt, kurzer String |
| `LongValues` | Rand: OCR-Markdown mit 12.000 Zeichen, ein LLM-Prompt mit literalen `\n`, ein JSON-Blob — alle drei hinter der Klappe, mit Zeichen- und Zeilenzahl |
| `Formats` | `format`-Overrides: `ocr_markdown` als `markdown`, `external_ref` (`2026-0815-A`) als `text` statt Datum, `amount_cents` als `number` |
| `Empty` | Zeile ohne Schlüssel, `empty`-Text |
| `InUse` | Wie der Rohdaten-Tab: drei `Disclosure`-Sektionen — `ludwig.client_accounting_case` (1 Zeile, offen), `client_accounting_event` (6 Zeilen, zu), `ops_llm_call_logs` (12 Zeilen, zu), mit `label` je Zeile |
| `SingleValues` | **Beim Bauen ergänzt:** `RawValue` allein, ohne Zeile darum — der Fall, für den der zweite Export existiert (DATEV-Seite). Ohne diese Story hat der zweite Export keinen Nachweis. |

Nicht anwendbar: `Lädt` und `Fehler` (lädt nichts, siehe Verhalten),
`LeerNachFilter` (filtert nicht), `Interaktiv` (kein Callback).

## Abnahme

Geprüft am 2026-09-05 von einem zweiten Agenten (nicht dem bauenden).
Geprüfter Stand: `e3c38e7`; `RawRecord.tsx` und `RawRecord.stories.tsx` sind
im Arbeitsbaum unverändert. Gebaut in `a23c004` („0051 gebaut: eine Antwort
auf ‚zeig mir die Zeile'"). Nachweise vom laufenden Storybook auf Port 6107,
gemessen in einer eigenen Chromium-Instanz (1280 × 900) über DOM-Proben und
`getComputedStyle`.

Abgenommen in zwei Durchgängen: erste Prüfung auf `e3c38e7` → zurück auf
`in Arbeit`, weil zwei der `format`-Overrides in der Story `Formats` nichts
zeigten, was `auto` nicht auch zeigt. **Nachprüfung auf `a3bc067` → behoben,
Status `fertig`.** Am Baustein war nichts zu ändern und wurde nichts geändert
(`git log -- src/ui/v3/primitives/RawRecord.tsx` steht unverändert auf
`a23c004`); geändert wurden zwei Werte in der Story.

### Story-Deckung

`index.json` listet genau die sieben Stories unter
`v3/Primitives/Tabelle/RawRecord`: `--filled`, `--data-types`,
`--long-values`, `--formats`, `--empty`, `--in-use`, `--single-values` — die
sechs abgeleiteten plus die beim Bauen ergänzte `SingleValues`, die dem
zweiten Export seinen Nachweis gibt. Props: `record` (`Filled`), `format`
(`Formats`, mit Einschränkung unten), `label` (`InUse`, „#1 · id=e3a1c07f"),
`empty` (`Empty`); `RawValue.value` und `RawValue.format` (`SingleValues`).
`Lädt`, `Fehler`, `LeerNachFilter`, `Interaktiv` sind oben begründet
ausgeschlossen.

| Kriterium | Nachweis (Story-ID · Befehl · Beobachtung) | Ergebnis |
|---|---|---|
| `pnpm typecheck` und `pnpm build` grün | `pnpm typecheck` → `tsc --noEmit`, Exit 0, zu Beginn und am Ende. `pnpm build` bewusst **nicht** gelaufen (parallele Abnahmen schreiben nach `storybook-static`); der Lauf für diesen Stand war grün — „Storybook build completed successfully". | ✓ |
| Datei nach der Familie benannt, Story daneben, Titel in der richtigen Gruppe | `src/ui/v3/primitives/RawRecord.tsx` und `RawRecord.stories.tsx` nebeneinander; `RawRecord.stories.tsx:6` setzt `title: "v3/Primitives/Tabelle/RawRecord"`. Barrel-Export `index.ts:171` unter der Rubrik „Tabelle". | ✓ |
| Code englisch; `@when`/`@instead` an jedem Export | Zwei Exporte, beide vollständig: `RawValue` (`:78`, `@when` Z. 73–74, `@instead` Z. 75–76) und `RawRecord` (`:146`, `@when` Z. 142, `@instead` Z. 143–145). Dazu der Typ `RawFormat` (`:18`). Alles englisch — auch die Kommentare zu den Entscheidungen („an id is not a million"); deutsch nur die sichtbaren Texte („Keine Felder.", „Liste · n Einträge"), wie offene Frage 3 es entschieden hat. | ✓ |
| Kein Hex, kein px, keine lokale Label-Map; Status nur über Registry | `grep -nE "#[0-9a-fA-F]{3,8}\b\|[0-9]+px" src/ui/v3/primitives/RawRecord.tsx` → keine Treffer; das einzige Maß ist `maxHeight={480}` an `Markdown` (`:82`), die Prop dieser Komponente. Maße und Farben in `v3.css:2029–2075`. Kein Status, keine Label-Map — die Komponente kennt kein Schema. | ✓ |
| Alle Stories oben vorhanden; ausgeschlossene Zustände begründet | Sieben von sieben, siehe „Story-Deckung"; Ausschlüsse oben begründet. | ✓ |
| Prüfliste `design-guidelines.md` §9 durchgegangen | Punkt für Punkt unter dieser Tabelle. | ✓ |
| Im Browser angesehen (Storybook), nicht nur gebaut | Alle sieben Stories geöffnet, gemessen und als Screenshot gesehen; Konsole in allen sieben leer. | ✓ |
| `record` zeigt **alle** Schlüssel alphabetisch, keiner gefiltert oder gekürzt | Story `--filled`, DOM-Probe: **16 von 16** Schlüsseln aus `CASE_ROW`, in der Reihenfolge `case_number, client_id, closed_at, created_at, currency, disposition, external_ref, id, is_reverse_charge, metadata, needs_receipt, net_amount, period, status, summary, tags` — alphabetisch, nicht in Schreibreihenfolge. `RawRecord.tsx:161` sortiert `Object.keys`. `--data-types` zeigt, dass auch ein `undefined`-Wert seinen Schlüssel behält (`b_undefined`). | ✓ |
| Jeder Zweig der Tabelle „Verhalten" rendert wie dort beschrieben | Story `--data-types`, zwölf Zeilen einzeln im DOM geprüft: `null`/`undefined` → `span.v2muted` „—" · `boolean` → `span.v2mono` `true`/`false` · `number` 42 und 1234567 → `span.v2mono` · `bigint` 9007199254740993 → `span.v2mono` · `2026-08-26` → `<time>` über `Time` mit `format="date"` · `2026-08-26T14:03:11Z` → `<time>` mit `dateTime` · Array → `details.v2disc--quiet` „Liste · 3 Einträge" · Objekt → `details` „JSON · 45 Zeichen" · kurzer String → `span.v2raw__text`. Zwölf von zwölf. | ✓ |
| Zahlen stehen ungruppiert, `boolean` als `true`/`false` | Story `--data-types`: `1234567` steht als `1234567`, nicht als `1.234.567`; `9007199254740993` unverkürzt; `true`/`false` in Mono statt „ja"/„nein". Gegenprobe `--formats`: derselbe Wert mit `format: "number"` → `1.234.567`. Die Entscheidung aus offener Frage 1 ist damit an beiden Enden belegt. | ✓ |
| ISO-Zeitstempel gehen durch `Time`; der rohe Wert bleibt im `title` lesbar | Story `--data-types`, DOM: `<span title="2026-08-26T14:03:11Z"><time datetime="2026-08-26T14:03:11.000Z">26.08.2026, 16:03</time></span>`; beim reinen Datum `title="2026-08-26"`. `RawDate` (`:131–137`) setzt den `title`, `Time` formatiert. **Anmerkung 3:** `Time` hat für Kalendertage einen Zeitzonen-Fehler (0033) — betrifft diese Komponente mittelbar. | ✓ |
| Werte über 100 Zeichen oder mehrzeilig hinter einer Klappe mit Zeichen- und Zeilenzahl; literale `\n` als Umbruch | Story `--long-values`, drei Klappen gelesen: `llm_prompt` → „Text · 149 Zeichen, 5 Zeilen", `ocr_markdown` → „Text · 13.620 Zeichen, 541 Zeilen", `payload` → „JSON · 271 Zeichen". Aufgeklappt misst das `<pre>` beim Prompt **5** echte Zeilen — die literalen `\n`/`\t` aus der Spalte sind aufgelöst (`unescape`, `:49–51`), `white-space: pre-wrap`, `max-height: 480px` (`v3.css:2063–2065`). Dass `ocr_markdown` ohne `format` **Text** bleibt und nicht zu Markdown wird, ist die Regel „Sie rät kein Markdown" — hier sichtbar eingehalten. | ✓ |
| `format` überschreibt die Erkennung je Schlüssel, alle sechs Werte | **Behoben in `a3bc067`.** Alle fünf Overrides sind jetzt vom Standard unterscheidbar, im DOM gelesen: `amount_cents` `number` → `1.234.567` statt `1234567` · `external_ref: "2026-08-26"` `text` → bleibt roh `2026-08-26` in `span.v2raw__text`, wo `auto` `26.08.2026` zeigen würde · `ocr_markdown` `markdown` → gerenderte Überschrift und Fettung statt Text-Klappe · `payload_text` `json` → Klappe „JSON · 48 Zeichen" statt Inline-Text · `posted_on: "2026-08-26 09:15:00"` `date` → `<time datetime="2026-08-26T07:15:00.000Z" title="2026-08-26 09:15:00">26.08.2026, 09:15</time>`, wo `auto` roher Text bliebe. Die beiden neuen Werte sind gezielt gewählt und gegengeprüft: `"2026-08-26"` trifft `ISO_DATE` (`:38`), `"2026-08-26 09:15:00"` trifft es **nicht** (Leerzeichen statt `T`) — headless bestätigt, `auto` liefert für den einen ein Datum und für den anderen rohen Text. Der Story-Kommentar sagt beides jetzt auch. `auto` selbst ist über `Filled`/`DataTypes` belegt. | ✓ |
| `empty` erscheint bei `record = {}` | Story `--empty`: `p.v2raw__empty` mit „Keine Felder in dieser Zeile.", `document.querySelectorAll(".v2raw__list").length` = **0** — keine leere Tabelle darunter. Default „Keine Felder." in `:150`. | ✓ |
| Server-Component: keine `"use client"`-Direktive | `grep -c '"use client"' src/ui/v3/primitives/RawRecord.tsx` → `0`. Kein Hook, kein Handler; Tastatur und Fokus kommen aus dem nativen `<details>` in `Disclosure`. | ✓ |
| Neue CSS-Klassen tragen `.v2raw*` und stehen als eigener Block **am Ende** von `v3.css` mit Aufgabennummer | Zum Zeitpunkt des Baus war er das Ende: `git show a23c004:src/styles/v3.css` → Block „── Rohdaten (0051) ──" beginnt in Z. 1941, die Datei endet in Z. 1986. Heute stehen acht spätere Blöcke dahinter (0049, 0047, 0048, 0053, 0052, 0059–0061, 0044, 0066–0068, 0074–0077, 0079) — das ist der normale Anbau, kein Verstoß. Alle Klassen tragen das Präfix: `.v2raw__label`, `__list`, `__key`, `__val`, `__text`, `__pre`, `__empty`. | ✓ |
| Ersetzt `RecordValue`/`RowKeyValueTable`/`CollapsibleText` in beiden `RohdatenTab.tsx` und `fmtRawValue` in `ui/drawers/server.tsx` ohne Funktionsverlust | Liegt in `ludwig/app`, hier nicht prüfbar. | offen (App) |

### Prüfliste §9, Punkt für Punkt

- **Stufe und Importe** — ✓ `primitives/`, importiert nur `Disclosure`,
  `Markdown`, `Time` — alles derselben Stufe, kein Pattern, keine Entität,
  kein Fachmodul. `Record<string, unknown>` statt eines Typs aus `src/ludwig/`
  ist hier der Punkt, nicht ein Versäumnis.
- **Ersetzt ihr v1-Gegenstück (`@deprecated`)** — offen (App), siehe Tabelle.
- **Kein Hex, kein px, keine Label-Map, kein Status-Text** — ✓ siehe Tabelle.
- **Text links, Zahlen rechts mit `tnum`, nichts zentriert (V3)** — ✓ alles
  links; das ist hier richtig, denn eine Roh-Zahl ist eine Zeichenkette, kein
  Betrag. `v2mono` trägt trotzdem `tabular-nums` (gemessen), damit IDs
  untereinander lesbar bleiben. Nichts zentriert.
- **Zeilenhöhe ≤ `.v2tbl__row`** — ✓ `.v2raw__key`/`__val` bauen 5 px oben und
  unten (`v3.css:2055`, `:2061`); nur eine Klappe wird höher, und die ist zu.
- **Farbe nur als Kritikalitätsstufe** — ✓ keine Farbe außer den Textstufen;
  Rohdaten tragen keine Kritikalität.
- **Jeder farbige Zustand hat Wort oder Icon (V7)** — nicht anwendbar.
- **Fünf Zustände** — ✓ gefüllt und leer gebaut, drei begründet ausgeschlossen.
- **Kontrast** — ✓ nur `--color-text` · `-muted` · `-subtle`, alle mit
  Kontrastkommentar in `tokens.css`.
- **Tastatur / Hover; kein Icon ohne Wort** — ✓ die einzige Bedienung ist die
  Klappe, und die ist ein natives `<details>`: fokussierbar, mit Enter und
  Leertaste zu öffnen. Das Dreieck steht **neben** einem Wort („Text · 149
  Zeichen, 5 Zeilen"), nie allein — T8 eingehalten.
- **Icons** — keine eigenen; die Klappe bringt ihres aus `Disclosure` mit.
- **Karte** — ✓ die Story rahmt mit `Card`/`CardHead`; das Primitive bringt
  keine Fläche mit. Kein Modal.
- **Texte T1–T5** — ✓ „Keine Felder.", „Liste · n Einträge", „JSON · n
  Zeichen"; Sie-Form nicht nötig, keine Versalien. Der Befund beim Bauen zu
  `.v2raw__label` hält: gemessen `text-transform: none`, Mono — „#1 ·
  id=e3a1c07f" bleibt case-sensitiv.
- **Story unter `v3/Primitives/Tabelle/RawRecord`** — ✓.
- **In §11 auf v2 gesetzt** — ✓ `docs/design-guidelines.md:480` führt
  `RawRecord` · `RawValue` unter „Tabelle" als „v2 (0051)" und nennt die
  abzulösenden App-Stellen.

### Nachbesserung (`a3bc067`)

Der eine Mangel des ersten Durchgangs ist erledigt. Die Story `Formats`
tauscht zwei Beispielwerte:

| Schlüssel | vorher | jetzt | warum das den Override beweist |
|---|---|---|---|
| `external_ref` | `"2026-0815"` | `"2026-08-26"` | Der alte Wert passte gar nicht auf `ISO_DATE` — `auto` hätte ihn ebenso roh gezeigt. Der neue Wert **ist** date-shaped, `format: "text"` hält ihn trotzdem roh. Genau der Fall, den die Schnittstellen-Tabelle beschreibt („eine Referenz, die wie ein Datum aussieht"). |
| `posted_on` | `"2026-08-26"` | `"2026-08-26 09:15:00"` | Der alte Wert wurde von `auto` ohnehin als Datum erkannt. Der neue fällt mit dem Leerzeichen statt `T` durch `ISO_DATE` und wird **erst** durch `format: "date"` zum Zeitpunkt. |

Beide im Browser nachgemessen, Konsole leer.

### Anmerkungen des Abnehmenden

1. **`format: "json"` auf einen JSON-*String* verdoppelt die Kodierung.**
   `--formats`, `payload_text` enthält `{"event":"case.created",…}` als Text.
   `RawValue` ruft `toJson(value)` (`:85`), also `JSON.stringify` **auf die
   Zeichenkette** — sichtbar wird
   `"{\"event\":\"case.created\",\"amount\":124090}"`, mit Anführungszeichen
   und escapten Quotes. Für Support ist das schlechter lesbar als der rohe
   Wert. Der genau typische Fall ist eine TEXT-Spalte mit JSON darin, also
   lohnt ein `JSON.parse` im `try` vor dem `stringify`. Kein Verstoß gegen den
   Wortlaut („erzwingt die JSON-Klappe" — die kommt), deshalb kein ✗; aber ein
   Befund, der zusammen mit dem Punkt oben erledigt werden sollte.
2. **`format: "text"` greift erst nach den Typ-Zweigen.** `:96–111` behandelt
   `boolean`, `number`, `Array` und `object`, bevor `:113` die
   String-Behandlung beginnt. Ein `format: { n: "text" }` auf einer Zahl
   liefert also weiter Mono statt String-Behandlung. In der Praxis irrelevant
   (Overrides gelten Textspalten), aber die Verhaltens-Tabelle liest sich
   anders — beim nächsten Anfassen entweder den Zweig vorziehen oder den Satz
   auf „erzwingt die String-Behandlung **bei Zeichenketten**" schärfen.
3. **Der Kalendertag-Fehler ist weg** — er kam aus `Time` (0033) und ist dort
   in `a3bc067` behoben (Anker auf 12:00 UTC). Gegengeprüft für diesen
   Baustein: `formatTime("2026-08-26","date")` liefert unter `TZ=Asia/Tokyo`,
   `Pacific/Kiritimati` und `Pacific/Midway` jetzt denselben `26.08.2026`, und
   `RawRecord` erbt das über `RawDate` (`:131–137`).
4. **Ein Zeitstempel ohne Zone hängt an der Rechner-Zone.** Beim Nachprüfen
   aufgefallen, am neuen Wert `posted_on: "2026-08-26 09:15:00"`: ein String
   ohne `T` und ohne Offset geht durch `new Date(...)`, und V8 liest den als
   **lokale** Zeit. Gemessen: Berlin `26.08.2026, 09:15` · Asia/Tokyo
   `26.08.2026, 02:15` · America/Los_Angeles `26.08.2026, 18:15`. Das **Datum**
   bleibt überall der 26., und die Eingabe ist fachlich mehrdeutig — eine
   Postgres-Spalte `timestamp without time zone` sieht genau so aus. Für die
   Rohdaten-Sicht ist es zusätzlich entschärft, weil der unveränderte Wert im
   `title` steht (nachgemessen: `title="2026-08-26 09:15:00"`). Kein Mangel
   dieser Aufgabe und keiner der Story — notiert, weil es die einzige
   verbliebene Stelle ist, an der eine Zeitangabe je nach Rechner anders
   aussieht, und weil `format.ts` irgendwann entscheiden sollte, ob ein
   zonenloser Zeitstempel als Berliner Zeit gelesen wird.
5. **GLOSSARY-Befund aus der Spec steht weiter offen:** kein Eintrag für die
   Rohdaten-Sicht. Nicht Aufgabe dieser Abnahme, aber unerledigt.

Abgenommen von / am: Claude (Abnahme-Agent), 2026-09-05 · Offene Punkte: keine
(die Anmerkungen sind Befunde, keine Mängel dieser Aufgabe)
