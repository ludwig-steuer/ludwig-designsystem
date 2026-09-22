# 0125 · TaxKeyField — der Steuerschlüssel als Feld

| | |
|---|---|
| Status | **fertig** — fremd abgenommen 2026-09-11 (Prüfer-Session, Endstand c2a2761) |
| Stufe | `entities/journal-entry/` |
| Klassen-Test | „Ergäbe das auch in einer Versicherungs-App Sinn?" → **nein.** Der DATEV-Steuerschlüssel (BU) ist ein Fachbegriff mit eigenem Vokabular; ein Primitive darf ihn nicht kennen |
| Quelle | `docs/v3-backlog.md` Z. 62 (`TaxKeySelect`, Teil des `Auswahlfeld`-Bedarfs); Vorlage `apps/web/src/ui/booking/TaxKeySelect.tsx` |
| Ersetzt | `TaxKeySelect` in `ManualBookingDrawer` und `BookingProposalCompact` |
| Setzt voraus | `DATEV_TAX_KEYS` und `TaxKeyEntry` aus `src/ludwig/core/datev/tax-keys.ts` (gespiegelt) · `Field`/`Select` (0104) |
| Spec von / am | Claude, 2026-09-08 |

## Warum eine eigene Komponente

`Select` (Primitive) trägt die Mechanik, aber **nicht** die Liste: die kommt
aus `DATEV_TAX_KEYS`, und ein Primitive kennt keine Fachdaten
(`spec-schreiben` §2). Ein Aufrufer, der die Optionen selbst baut, baut
zugleich das Format „51 · Vorsteuer 19 %" nach — heute an zwei Stellen, und
zwei Formate für einen Schlüssel sind zwei Wahrheiten.

Nach §3 Regel 5: eine Form dieser Familie, die es noch nicht gibt. Sie heißt
**Field** und nicht **Select**, weil sie mehr trägt als eine Liste — den
Erklärtext des gewählten Schlüssels.

## Was die Vorlage nicht kann

`TaxKeyEntry` führt fünf Felder, die App-Fassung liest zwei (`key`, `label`):

- **`description`** — „Ein Satz Klartext für die Anzeige (Tooltip am
  Buchungssatz)", laut Kommentar genau dafür gedacht, und nirgends gezeigt.
  Wer „51" wählt, sieht nicht, was er gewählt hat.
- **`vatRate` und `direction`** — Vorsteuer oder Umsatzsteuer, und mit welchem
  Satz. Das ist die Frage, die jemand beim Wählen wirklich hat.
- **`passThrough`** — ein Schlüssel, den Ludwig **nur durchreicht**: keine
  Satz-Expansion, keine Assistenz, und nur setzbar, wenn die Historie desselben
  Kontos ihn trägt. Die Vorlage bietet ihn wie jeden anderen an.

## Schnittstelle

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `value` | `string \| null` | ja | Der gewählte Schlüssel. `null` heißt „keiner" und ist ein gültiger Wert — nicht jede Zeile hat einen | `Filled`, `Empty` |
| `onChange` | `(key: string \| null) => void` | ja | Der Aufrufer schreibt, das Feld hält nichts | `Roundtrip` |
| `label` | `string` | nein, Vorgabe „Steuerschlüssel (BU)" | Die Beschriftung | `Filled` |
| `allowPassThrough` | `boolean` | nein, Vorgabe `false` | Ob die Durchreich-Schlüssel in der Liste stehen. Nur der Aufrufer weiß, ob die Historie des Kontos sie trägt — das Feld darf es nicht raten | `PassThrough` |
| `disabled` | `boolean` | nein | Gesperrt, etwa in einer festgeschriebenen Zeile | `Filled` |
| `error` | `string` | nein | Der Satz am Feld | `Invalid` |

**Kann bewusst nicht:**

- **Prüfen, ob der Schlüssel zum Konto passt.** Das ist Fachlogik der App
  (`modules/accounting-cases/domain/tax-keys`), und sie braucht die
  Kontohistorie, die dieses Feld nicht hat.
- **Die Steuerzeile ausrechnen.** Das ist die Buchungsassistenz.
- **`passThrough` selbst entscheiden.** Ohne die Historie wäre jede Antwort
  geraten — deshalb eine Prop und keine Ableitung.

## Verhalten

- Der Schlüssel steht `mono` (er wird Zeichen für Zeichen gelesen), das Label
  daneben in der Textschrift: „**51** · Vorsteuer 19 %".
- Unter der Liste steht die **`description`** des gewählten Schlüssels — ein
  Satz, kein Tooltip. Ohne Auswahl steht dort nichts.
- `vatRate` und `direction` stehen in der Option, nicht in einer zweiten Zeile:
  „51 · Vorsteuer 19 %" ist bereits beides.

## Stories

Abgeleitet nach §6: 3 anwendbare Zustände (gefüllt · leer · ungültig — „lädt"
gibt es nicht, die Liste ist eine Konstante) + 1 Layout-Boolean
(`allowPassThrough`) + 1 Callback + 1 „im Einsatz" = **6**.

| Story | Beweist |
|---|---|
| `Filled` | Ein gewählter Schlüssel mit `description` darunter; daneben ein gesperrtes Feld |
| `Empty` | `null`: kein Schlüssel, kein Erklärtext, kein Gedankenstrich |
| `Invalid` | Der Satz am Feld |
| `PassThrough` | Mit und ohne `allowPassThrough` nebeneinander — die Liste ist länger, der Rest gleich |
| `Roundtrip` | Wählen und abwählen, der Wert geht an den Aufrufer und kommt zurück |
| `InUse` | In der Buchungszeile neben Konto und Betrag — der Fall aus `ManualBookingDrawer` |

## Abnahmekriterien (variabler Block)

- Die Optionen kommen aus `DATEV_TAX_KEYS`, nicht aus einer lokalen Liste
  (`grep`: kein Schlüssel-Literal in der Datei)
- Der Schlüssel steht `mono`, das Label daneben nicht (`Filled`)
- Die `description` des gewählten Schlüssels steht unter dem Feld, und nur dann
  (`Filled` gegen `Empty`)
- Ohne `allowPassThrough` fehlt jeder Schlüssel mit `passThrough` in der Liste
  (`PassThrough`, gezählt)
- `null` ist wählbar und kommt als `null` zurück, nicht als leerer String
  (`Roundtrip`)
- Ersetzt `TaxKeySelect` an beiden Stellen ohne Funktionsverlust

## Gebaut 2026-09-08

Gemessen (`scripts/cdp.mjs`, vier Stories):

| Story | Gemessen |
|---|---|
| `Filled` | Zwölf Optionen, `v2mono` am Feld, erste Option „1 · Umsatzsteuerfrei (mit Vorsteuerabzug)", und darunter der Satz des gewählten Schlüssels |
| `Empty` | Kein Erklärtext — es gibt nichts zu erklären |
| `PassThrough` | 12 gegen **15** Optionen. Die Spec-Story sprach von „fünf Einträgen mehr"; es sind drei, und die Story sagt jetzt die gemessene Zahl |
| `Roundtrip` | Abwählen liefert `null`, nicht `""` — die Achse kennt keinen leeren String, und ein Aufrufer, der ihn schriebe, würde ihn speichern |

`pnpm typecheck` und die fünf Wächter auf Exit 0.

## Abnahme

Fremde Abnahme am 2026-09-11 durch eine Prüfer-Session, die nichts gebaut hat (Auftrag `ludwig-manager`). Prüfstand c2a2761; statische Checks (typecheck, check:language, check:when, check:contrast, check:icons, check:jobs, check:mirror, build) auf 6d58b58 und bca4b7d alle grün. Messungen per `scripts/cdp.mjs` auf einem eigenen Storybook der Prüfer-Session.

| Kriterium | Nachweis | Ergebnis |
|---|---|---|
| Optionen aus `DATEV_TAX_KEYS`, kein Literal | `TaxKeyField.tsx:4` Import, `:58` Liste; `grep '"[0-9]{1,2}"'` leer | ok |
| Schlüssel `mono`, Label daneben nicht | Option „**9** · Vorsteuer 19 %"; `.v2mono` am Feld | ok |
| `description` nur bei Auswahl | `--filled`: „Eingangsseite: aus dem Bruttobetrag werden 19 % Vorsteuer …"; `--empty`: nur „Steuerschlüssel (BU)" | ok |
| Ohne `allowPassThrough` fehlen Durchreich-Schlüssel | `--pass-through`: 12 gegen 15 Optionen (inkl. „Kein Steuerschlüssel") | ok |
| `null` wählbar, kommt als `null` zurück | `--roundtrip`: „3" → „Gewählt: 3"; „" → „Gewählt: null (kein Schlüssel)" | ok |
| `disabled`, `error` | `--filled` zweites Feld `disabled`; `--invalid` rendert | ok |
| Ersetzt `TaxKeySelect` | — | offen (App) |
| Spec beschreibt das Gebaute | „fünf Einträge mehr" → drei, im Gebaut-Absatz berichtigt | ok |

**Urteil: fertig.**

## Nachtrag 2026-09-22 — `TaxKeyCell`: gelesen wird die aktuelle Form (F271)

**Der Befund des Owners auf Staging:** in der Stapelabnahme, Schritt 3, steht
im Aufklapper eine tote „9", und in der Tabelle darüber dieselbe Zeile als
verlinkte „401". Zwei Bilder eines Schlüssels in einer Ansicht.

Der Hintergrund liegt in der App: seit F271 zeigt sie jeden Steuerschlüssel in
der aktuellen DATEV-Form (`toCurrentTaxKey`, Owner-Entscheid 1) und klickbar
(`?taxKey=401` schlägt das Nachschlagewerk auf). **Gespeichert bleibt die
bisherige Form** (Regel R10) — es geht um Anzeige, nicht um Daten. Die Stellen
im Set waren in F271 ausdrücklich Nicht-Scope; das ist dieser Nachtrag
(Zuruf `ludwig-cto`, 2026-09-22).

**Eine Zelle für alle Lesestellen**, `TaxKeyCell` in
`entities/journal-entry/TaxKey.tsx`:

| Prop | Typ | Pflicht | Bedeutung | Nachweis (Story) |
|---|---|---|---|---|
| `taxKey` | `string \| null \| undefined` | ja | Der Schlüssel **wie gespeichert** („9") | `Filled`, `Empty` |
| `reverseChargeCase` | `number \| null` | nein | DATEV „Sachverhalt L+L"; ohne ihn bleibt § 13b stehen | `ReverseCharge` |
| `taxKeyHref` | `(taxKey: string) => string` | nein | Weg ins Nachschlagewerk, mit dem **gespeicherten** Wert; ohne Prop reiner Text (V14) | `Linked` |

Gezeigt wird `toCurrentTaxKey(taxKey, reverseChargeCase)`, der Tooltip trägt
das Wort des Katalogs und, wo beide auseinandergehen, „gespeichert als 9".
Die Adresse baut die App (`useTaxKeyHref`) — dasselbe Muster wie
`accountHref`, und derselbe Grund: das Set kennt keine Route.

**Verdrahtet** (alle mit `taxKeyHref`, Vorgabe „ohne Prop reiner Text"):

| Ort | Was |
|---|---|
| `JournalEntryCompact.tsx` | `TaxCell` in `JournalEntryCard`; `JournalLine.reverseChargeCase` neu |
| `journal-entry-columns.tsx` | Spalte `taxKey` (vorher `MonoCell` roh, `tone="muted"`) |
| `JournalEntryList.tsx` | reicht `taxKeyHref` an den Spaltensatz durch |
| `JournalEntryGrid.tsx` | BU-Spalte der Lesezeile |
| `RecurringRuleFacts.tsx` | Zeile „Steuerschlüssel" |
| `JournalEntryEditor.tsx` | Lesezeile **und** Notizzeile, beide über das schon vorhandene `onOpenTaxKey` |

Nicht angefasst: Eingabefelder (`TaxKeyField`, das `<select>` im Editor) —
sie führen die gespeicherte Form. `MirrorEntry.tsx` trägt `taxKey` nur im
Typ und zeigt ihn nirgends; dort war nichts zu tun.

**Zwei bekannte Grenzen**, beide keine Fehler: ohne Sachverhalt L+L bleibt
§ 13b bei „94" (vier aktuelle Formen, nur der Sachverhalt trennt sie), und
`JournalEntryListItem`, `JournalRow` sowie die Regel-Vorlage führen den
Sachverhalt gar nicht — Spaltensatz, Raster, Editor und Regel-Fakten zeigen
§ 13b deshalb in der gespeicherten Form.

**Ein Fund beim Bauen:** der Schlüssel im Link sah aus wie fetter Text. `.v2mono`
setzt `--color-text` und überschreibt die Linkfarbe — genau die Falle, die
`.v2acc--link .v2mono` bei den Kontonummern schon einmal gelöst hat (0066).
Neue Klasse `.v2taxkey` (Farbe, Unterstreichung, Fokusring), am Link und an
den beiden Knöpfen des Editors.

### Abnahmekriterien

| Kriterium | Nachweis (Story) |
|---|---|
| Anzeige ist die aktuelle Form | `Filled`: 9 → 401, 3 → 101, 1 → 171 |
| Tooltip nennt Wort und gespeicherte Form | `Filled`: „Vorsteuer 19 % · gespeichert als 9" |
| Kein „gespeichert als", wo nichts abweicht | `Unchanged`: 490 ohne Zusatz, unbekannte 77 ohne Tooltip |
| § 13b nur mit Sachverhalt umgeschrieben | `ReverseCharge`: 94 bleibt 94; mit 7 → 506, mit 1 → 511; 95 mit 4 → 6526 |
| Link nur mit `taxKeyHref`, mit dem gespeicherten Wert | `Linked`: `?taxKey=9` am Text „401" |
| Leer ist der Gedankenstrich, nie ein Link | `Empty` |
| Karte, Liste, Raster, Regel, Editor zeigen dasselbe | `JournalEntryCompact/WithTaxKeyLink`, `JournalEntryList/InBucket`, `JournalEntryGrid/InAForm`, `RecurringRuleFacts/Edges`, `JournalEntryEditor/S20EditorOnly` |
| Eingabefelder unverändert | `JournalEntryEditor/S20EditorOnly`: das `<select>` steht auf „9" |

**Gemessen 2026-09-22** im laufenden Storybook (Port 6107, Playwright statt
`scripts/cdp.mjs` — dessen fest verdrahteter Chrome-Pfad zeigt auf
`chromium-1243`, hier liegt `chromium-1217`; eigener Befund, siehe unten):
zehn Stories geladen, jede mit Inhalt, **keine** Konsolenmeldung. Alle Zeilen
der Kriterientabelle mit `textContent`, `title` und `href` belegt.

Offen: **fremde Abnahme** (nicht von der bauenden Sitzung).

**Befund nebenbei:** `scripts/cdp.mjs` verdrahtet die Chrome-Version im Pfad
(`chromium-1243`); auf dieser Maschine liegt `chromium-1217`, und ohne
`CHROME_BIN` bricht jede Messung mit `ENOENT` ab. Dazu öffnete Chrome 147 hier
keinen Debug-Port. Eigene Aufgabe, nicht Teil dieses Nachtrags.
