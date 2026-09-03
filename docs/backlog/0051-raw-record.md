# 0051 · RawRecord

| | |
|---|---|
| Status | Abnahme |
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

- [ ] `record` zeigt **alle** Schlüssel alphabetisch, keiner gefiltert oder gekürzt (Story `Filled`)
- [ ] Jeder Zweig der Tabelle „Verhalten" rendert wie dort beschrieben (Story `DataTypes`)
- [ ] Zahlen stehen ungruppiert, `boolean` als `true`/`false` (Story `DataTypes`)
- [ ] ISO-Zeitstempel gehen durch `Time`; der rohe Wert bleibt im `title` lesbar (Story `DataTypes`)
- [ ] Werte über 100 Zeichen oder mehrzeilig stehen hinter einer Klappe mit Zeichen- und Zeilenzahl; literale `\n` erscheinen als Umbruch (Story `LongValues`)
- [ ] `format` überschreibt die Erkennung je Schlüssel, alle sechs Werte (Story `Formats`)
- [ ] `empty` erscheint bei `record = {}` (Story `Empty`)
- [ ] Server-Component: keine `"use client"`-Direktive in der Datei (`grep`)
- [ ] Neue CSS-Klassen tragen `.v2raw*` und stehen als eigener Block **am Ende** von `src/styles/v3.css` mit Aufgabennummer
- [ ] Ersetzt `RecordValue`/`RowKeyValueTable`/`CollapsibleText` in beiden `RohdatenTab.tsx` und `fmtRawValue` in `ui/drawers/server.tsx` ohne Funktionsverlust — **offen (App)**

## Offene Fragen

1. **Zahlen gruppieren?** Ohne Antwort: **nein** — Rohdaten stehen roh, eine
   `1234567` als „1.234.567" wäre eine Behauptung über den Typ. Wer gruppieren
   will, sagt `format: { amount_cents: "number" }`.
2. **Schwelle für die Klappe bei 100 Zeichen?** Ohne Antwort: **100**, wie im
   heutigen Beleg-Tab, als Modul-Konstante — keine Prop, bis eine zweite
   Schwelle belegt ist.
3. **Deutsche Klappen-Texte** („Text anzeigen · 12.480 Zeichen")? Ohne
   Antwort: **ja** — sichtbarer Text ist deutsch (Hausregel), nur der Code ist
   englisch.

## Befunde für `ludwig/app`

- Die beiden `RohdatenTab.tsx` sind Kopien voneinander; die Sachverhalt-Fassung
  ist die ältere (keine Klappe für lange Werte, keine `HEAVY_TABLES`, `<pre>`
  fest bei 360 px). Wer sie ablöst, löst zwei Dateien ab.
- Drei Wahrheiten für denselben Wert: `boolean` `true` vs. „ja", Zahl
  gruppiert vs. ungruppiert, Zeitstempel lokalisiert vs. roh — je nachdem, ob
  man im Tab oder im Drawer schaut.
- `GLOSSARY.md` hat keinen Eintrag für die Rohdaten-Sicht. „raw" ist dort
  bisher nur als Gegenstück zu Stammdaten belegt (`vendor` vs. `creditor`).

## Befund beim Bauen (2026-09-03)

- **Versalien im `label` waren falsch.** `.v2raw__label` trug zuerst
  `text-transform: uppercase` wie jede Überschrift im Set — aus „#1 ·
  id=e3a1c07f" wurde „#1 · ID=E3A1C07F". Eine ID ist case-sensitive; das
  Label steht jetzt in Mono ohne Versalien. Dieselbe Falle wie bei
  `.v2bar__label` (0045, Commit `3dce35f`): **Versalien nur für
  Überschriften, nie für eine Zeile, die einen Wert trägt.**
- **`formatAmount(n, null)` taugt nicht für Zählungen.** Der Hausformatierer
  schreibt immer zwei Nachkommastellen („12.480,00 Zeichen"). Die Datei hält
  deshalb **einen** eigenen `Intl.NumberFormat("de-DE")` für ganze Zahlen —
  für die Klappen-Beschriftung und für `format: "number"`. Befund für
  `src/ui/v3/format.ts`: ein `formatCount` fehlt im Haus; kommt er, ersetzt
  er diese Konstante.
- **`align-items: start`, nicht `baseline`:** neben einer Klappe rutschte der
  Schlüssel sonst auf die Höhe der Zusammenfassung statt oben zu stehen.
- Die offenen Fragen sind wie in der Spec vorgezeichnet entschieden: Zahlen
  ungruppiert (1), Klappe ab 100 Zeichen als Modul-Konstante (2), deutsche
  Klappen-Texte (3).

## Neue Story-IDs

`v3-primitives-tabelle-rawrecord--filled` · `--data-types` · `--long-values` ·
`--formats` · `--empty` · `--in-use` · `--single-values`

## Abnahme

| Kriterium | Nachweis (Story-ID · Befehl · Screenshot) | Ergebnis |
|---|---|---|
| … | … | ✓ / ✗ |

Abgenommen von / am: … · Offene Punkte: …
